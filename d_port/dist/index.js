import { spawn } from "node:child_process";

const name = "dsh-port";
const inject = ["tools"];

const DEFAULTS = Object.freeze({
  timeoutMs: 15_000,
  killRecheckDelayMs: 300
});

class PortError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = "PortError";
    this.status = status;
  }
}

function cleanText(value, max = 4000) {
  return String(value ?? "").trim().slice(0, max);
}

function clampInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

function optionalPort(value, requirePositive = false) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) throw new PortError("端口号必须是整数", 422);
  const min = requirePositive ? 1 : 0;
  if (parsed < min || parsed > 65535) {
    throw new PortError(`端口号 ${parsed} 超出有效范围（${min}-65535）`, 422);
  }
  return parsed;
}

function optionalPid(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed < 1) throw new PortError("PID 必须是正整数", 422);
  return parsed;
}

function normalizeProtocol(value) {
  const text = cleanText(value, 10).toLowerCase();
  if (!text) return "";
  if (text === "tcp" || text === "udp") return text;
  throw new PortError(`协议只支持 tcp 或 udp，收到：${text}`, 422);
}

// Windows 控制台命令（netstat/tasklist）在中文系统上默认输出 GBK 编码。
// 先按 UTF-8 解码，出现替换字符时回退 GBK，保证中文进程名不乱码。
function decodeConsoleBuffer(buffer) {
  const utf8 = buffer.toString("utf8");
  if (!utf8.includes("\uFFFD")) return utf8;
  try {
    return new TextDecoder("gbk").decode(buffer);
  } catch {
    return utf8;
  }
}

function parseAddress(value) {
  const text = cleanText(value, 100);
  if (!text) return { address: "", port: null };
  const bracket = text.match(/^\[(.+)\]:(.*)$/);
  if (bracket) {
    const port = Number.parseInt(bracket[2], 10);
    return { address: bracket[1], port: Number.isFinite(port) ? port : null };
  }
  const index = text.lastIndexOf(":");
  if (index < 0) return { address: text, port: null };
  const port = Number.parseInt(text.slice(index + 1), 10);
  return { address: text.slice(0, index), port: Number.isFinite(port) ? port : null };
}

const NETSTAT_PROTOCOLS = new Set(["tcp", "udp"]);

function parseNetstatLine(line) {
  const tokens = line.trim().split(/\s+/);
  if (tokens.length < 4) return null;
  const protocol = tokens[0].toLowerCase();
  if (!NETSTAT_PROTOCOLS.has(protocol)) return null;
  const local = parseAddress(tokens[1]);
  const remote = parseAddress(tokens[2]);
  let state = "";
  let pid = Number.NaN;
  if (tokens.length >= 5) {
    state = tokens[3].toUpperCase();
    pid = Number.parseInt(tokens[4], 10);
  } else {
    pid = Number.parseInt(tokens[3], 10);
  }
  if (!Number.isFinite(pid)) return null;
  return {
    protocol,
    localAddress: local.address,
    localPort: local.port,
    remoteAddress: remote.address,
    remotePort: remote.port,
    state,
    pid
  };
}

function parseNetstat(text) {
  return cleanText(text, 4_000_000)
    .split(/\r?\n/)
    .map(parseNetstatLine)
    .filter(Boolean);
}

function splitCsvLine(line) {
  const fields = [];
  const pattern = /"((?:[^"]|"")*)"/g;
  let match;
  while ((match = pattern.exec(line))) fields.push(match[1].replace(/""/g, '"'));
  if (!fields.length) return line.split(",").map((item) => item.trim());
  return fields;
}

function parseTasklistCsv(text) {
  const table = new Map();
  for (const line of cleanText(text, 4_000_000).split(/\r?\n/)) {
    if (!line) continue;
    const fields = splitCsvLine(line);
    if (fields.length < 2) continue;
    const pid = Number.parseInt(fields[1], 10);
    if (!Number.isFinite(pid)) continue;
    const servicesRaw = cleanText(fields[2], 2000);
    const services = servicesRaw && !/^(n\/?a|暂缺)$/i.test(servicesRaw)
      ? servicesRaw.split(",").map((item) => item.trim()).filter(Boolean)
      : [];
    table.set(pid, { name: cleanText(fields[0], 260), services });
  }
  return table;
}

function createCommandRunner(options = {}) {
  const spawnProcess = options.spawnProcess || spawn;
  const defaultTimeoutMs = clampInteger(options.timeoutMs, DEFAULTS.timeoutMs, 10, 600_000);
  const platform = options.platform || process.platform;

  return function run(program, args) {
    return new Promise((resolve, reject) => {
      if (platform !== "win32") {
        reject(new PortError(`端口管理命令仅支持在 Windows 上执行，当前平台：${platform}`, 501));
        return;
      }
      let settled = false;
      const stdoutChunks = [];
      const stderrChunks = [];
      function settle(fn, value) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        fn(value);
      }
      const child = spawnProcess(program, args, { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
      const timer = setTimeout(() => {
        child.kill();
        settle(reject, new PortError(`${program} 执行超时（${defaultTimeoutMs}ms）`, 504));
      }, defaultTimeoutMs);
      child.stdout?.on?.("data", (chunk) => stdoutChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))));
      child.stderr?.on?.("data", (chunk) => stderrChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))));
      child.once("error", (error) => settle(reject, new PortError(`${program} 启动失败：${error.message}`, 500)));
      child.once("close", (code) => {
        settle(resolve, {
          code: Number(code ?? -1),
          stdout: decodeConsoleBuffer(Buffer.concat(stdoutChunks)),
          stderr: decodeConsoleBuffer(Buffer.concat(stderrChunks))
        });
      });
    });
  };
}

const PROTECTED_NAMES = new Set([
  "smss.exe",
  "csrss.exe",
  "wininit.exe",
  "winlogon.exe",
  "services.exe",
  "lsass.exe"
]);

function protectedReason(pid, processName) {
  const lowered = String(processName || "").toLowerCase();
  if (pid === 4 || lowered === "system") {
    return "PID 4（System）属于 Windows 内核，该端口通常由 HTTP.SYS 等内核组件监听，无法也不应结束；可执行 netsh http show servicestate 查看占用来源，或让应用改用其他端口。";
  }
  if (lowered === "system idle process") {
    return "System Idle Process 是统计空闲率的占位进程，不需要也无法结束。";
  }
  if (PROTECTED_NAMES.has(lowered)) {
    return `${processName} 是 Windows 核心系统进程，强制结束会导致系统崩溃（蓝屏），已拒绝执行。`;
  }
  return "";
}

function enrichRow(row, procs) {
  const proc = procs.get(row.pid);
  return {
    ...row,
    process: proc?.name || (row.pid === 4 ? "System" : ""),
    services: proc?.services || []
  };
}

function normalizeListFilter(input = {}) {
  return {
    view: input.view === "ports" ? "ports" : "",
    port: optionalPort(input.port),
    remotePort: optionalPort(input.remotePort),
    pid: optionalPid(input.pid),
    protocol: normalizeProtocol(input.protocol),
    state: cleanText(input.state, 40).toUpperCase(),
    process: cleanText(input.process, 260).toLowerCase(),
    page: clampInteger(input.page, 1, 1, 10_000),
    pageSize: clampInteger(input.pageSize, 100, 1, 500)
  };
}

function matchesFilter(row, query) {
  if (query.protocol && row.protocol !== query.protocol) return false;
  if (query.port !== null && row.localPort !== query.port) return false;
  if (query.remotePort !== null && row.remotePort !== query.remotePort) return false;
  if (query.pid !== null && row.pid !== query.pid) return false;
  if (query.state && !row.state.includes(query.state)) return false;
  if (query.process) {
    const haystack = `${row.process} ${row.services.join(" ")}`.toLowerCase();
    if (!haystack.includes(query.process)) return false;
  }
  return true;
}

function compareRows(a, b) {
  if (a.protocol !== b.protocol) return a.protocol < b.protocol ? -1 : 1;
  const ap = a.localPort ?? 65536;
  const bp = b.localPort ?? 65536;
  if (ap !== bp) return ap - bp;
  if (a.state !== b.state) return a.state < b.state ? -1 : 1;
  return a.pid - b.pid;
}

function isListeningRow(row) {
  return row.protocol === "udp" || row.state === "LISTENING";
}

function normalizeKillInput(input = {}) {
  const port = optionalPort(input.port, true);
  const pid = optionalPid(input.pid);
  const protocol = normalizeProtocol(input.protocol);
  if (port === null && pid === null) {
    throw new PortError("请提供要释放的端口号（port）或进程 PID（pid），至少一个", 422);
  }
  return { port, pid, protocol };
}

function createPortService({ run, delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)), killRecheckDelayMs = DEFAULTS.killRecheckDelayMs } = {}) {
  async function netstatRows() {
    const result = await run("netstat.exe", ["-ano"]);
    if (result.code !== 0) {
      const detail = result.stderr.trim() || result.stdout.trim().slice(0, 200);
      throw new PortError(`netstat -ano 执行失败（退出码 ${result.code}）：${detail}`);
    }
    return parseNetstat(result.stdout);
  }

  async function processTable() {
    const result = await run("tasklist.exe", ["/svc", "/fo", "csv", "/nh"]);
    if (result.code !== 0) return new Map();
    return parseTasklistCsv(result.stdout);
  }

  async function listPorts(input = {}) {
    const query = normalizeListFilter(input);
    const [rows, procs] = await Promise.all([netstatRows(), processTable()]);
    const enriched = rows.map((row) => enrichRow(row, procs)).filter((row) => matchesFilter(row, query));
    if (query.view === "ports") return portGroups(enriched, query);
    const matched = enriched.sort(compareRows);
    const start = (query.page - 1) * query.pageSize;
    return {
      scannedAt: new Date().toISOString(),
      total: matched.length,
      page: query.page,
      pageSize: query.pageSize,
      view: "connections",
      items: matched.slice(start, start + query.pageSize)
    };
  }

  // 聚合视图：把同一“协议 + 本地端口”的连接折叠为一行，展示归属进程与状态分布。
  // 监听中的端口排在前面；属主进程优先展示监听行的属主，按 PID 去重。
  function portGroups(enriched, query) {
    const groups = new Map();
    for (const row of enriched) {
      const key = `${row.protocol}/${row.localPort}`;
      let group = groups.get(key);
      if (!group) {
        group = { protocol: row.protocol, localPort: row.localPort, localAddresses: [], listening: false, owners: [], ownerPids: new Set(), stateCounts: {}, connections: 0 };
        groups.set(key, group);
      }
      group.connections += 1;
      if (row.localAddress && !group.localAddresses.includes(row.localAddress) && group.localAddresses.length < 6) {
        group.localAddresses.push(row.localAddress);
      }
      if (isListeningRow(row)) group.listening = true;
      const stateKey = row.state || "—";
      group.stateCounts[stateKey] = (group.stateCounts[stateKey] || 0) + 1;
      if (row.pid > 0 && !group.ownerPids.has(row.pid)) {
        group.ownerPids.add(row.pid);
        group.owners.push({ pid: row.pid, process: row.process || "(未知进程)", services: row.services || [], listening: isListeningRow(row) });
      }
    }
    const items = Array.from(groups.values());
    for (const group of items) {
      delete group.ownerPids;
      group.owners.sort((a, b) => (b.listening ? 1 : 0) - (a.listening ? 1 : 0) || a.pid - b.pid);
    }
    items.sort((a, b) => (b.listening ? 1 : 0) - (a.listening ? 1 : 0) || a.localPort - b.localPort || (a.protocol < b.protocol ? -1 : 1));
    const start = (query.page - 1) * query.pageSize;
    return {
      scannedAt: new Date().toISOString(),
      total: items.length,
      page: query.page,
      pageSize: query.pageSize,
      view: "ports",
      items: items.slice(start, start + query.pageSize)
    };
  }

  async function killPort(input = {}) {
    const query = normalizeKillInput(input);
    const rows = query.port !== null ? await netstatRows() : [];
    const procs = await processTable();

    let targets;
    if (query.port !== null) {
      const matchedRows = rows.filter((row) => row.localPort === query.port && (!query.protocol || row.protocol === query.protocol));
      const listeners = matchedRows.filter((row) => row.pid > 0 && isListeningRow(row));
      const owners = [...new Set((listeners.length ? listeners : matchedRows.filter((row) => row.pid > 0)).map((row) => row.pid))];
      if (!owners.length) {
        throw new PortError(matchedRows.length
          ? `端口 ${query.port} 只有系统级连接记录（TIME_WAIT 等，属主 PID 为 0），不会响应结束进程，通常会在几十秒内自动释放`
          : `没有找到本地端口为 ${query.port} 的连接记录`, 404);
      }
      if (query.pid !== null) {
        if (!matchedRows.some((row) => row.pid === query.pid)) {
          throw new PortError(`PID ${query.pid} 并未占用端口 ${query.port}，占用该端口的进程：${owners.join("、")}`, 409);
        }
        targets = [query.pid];
      } else if (owners.length > 1) {
        throw new PortError(`端口 ${query.port} 由多个进程占用（${owners.join("、")}），请用 pid 参数指定要结束的进程`, 409);
      } else {
        targets = owners;
      }
    } else {
      targets = [query.pid];
    }

    const killed = [];
    const failed = [];
    for (const pid of targets) {
      const proc = procs.get(pid);
      const processName = proc?.name || "";
      const protection = protectedReason(pid, processName);
      if (protection) {
        failed.push({ pid, process: processName || "(未知)", message: protection });
        continue;
      }
      const result = await run("taskkill.exe", ["/pid", String(pid), "/t", "/f"]);
      const message = `${result.stdout}\n${result.stderr}`.trim().replace(/\s+/g, " ").slice(0, 300);
      if (result.code === 0) {
        killed.push({ pid, process: processName || "(未知)", services: proc?.services || [], message });
      } else {
        failed.push({ pid, process: processName || "(未知)", message: message || `taskkill 退出码 ${result.code}` });
      }
    }

    let released = false;
    let remaining = [];
    if (query.port !== null) {
      if (killed.length) await delay(killRecheckDelayMs);
      const afterRows = (await netstatRows())
        .filter((row) => row.localPort === query.port && (!query.protocol || row.protocol === query.protocol))
        .map((row) => enrichRow(row, procs));
      remaining = afterRows;
      released = !afterRows.some((row) => targets.includes(row.pid) || isListeningRow(row));
    }

    return {
      ok: failed.length === 0,
      port: query.port,
      killed,
      failed,
      released,
      remaining
    };
  }

  return { listPorts, killPort };
}

function registerTools(ctx, service, timeoutMs) {
  ctx.tools.register({
    name: "winport_list",
    description: "查询 Windows 本机 TCP/UDP 端口占用情况，返回每个端口对应的进程名称、PID 与服务（封装 netstat -ano 与 tasklist）。可按本地端口、远端端口、协议、状态、PID 或进程名筛选，用于定位端口被哪个程序占用。",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        port: { type: "number", description: "本地端口号，例如 3306" },
        remotePort: { type: "number", description: "远端端口号，用于查谁连接到了某个端口" },
        protocol: { type: "string", enum: ["tcp", "udp"], description: "协议，留空查询全部" },
        state: { type: "string", description: "连接状态关键词，如 LISTENING、ESTABLISHED" },
        pid: { type: "number", description: "进程 PID" },
        process: { type: "string", description: "进程名或服务名关键词" },
        page: { type: "number", description: "页码，默认 1" },
        pageSize: { type: "number", description: "每页数量，默认 100，最多 500" }
      }
    },
    timeoutMs: timeoutMs + 5000,
    isConcurrencySafe: () => true,
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_args, value) => [{ type: "text", text: JSON.stringify(value, null, 2) }]
    },
    execute: async (args) => service.listPorts(args || {})
  });

  ctx.tools.register({
    name: "winport_kill",
    description: "结束占用 Windows 端口的进程（封装 taskkill /PID <pid> /T /F）。破坏性操作：应先用 winport_list 确认占用进程后再调用；同一端口有多个进程占用时必须用 pid 参数指定目标；系统核心进程会被拒绝。返回结束结果与端口的剩余占用情况。",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        port: { type: "number", description: "要释放的本地端口号（与 pid 至少提供一个）" },
        pid: { type: "number", description: "要结束的进程 PID（与 port 至少提供一个；端口被多个进程占用时必填）" },
        protocol: { type: "string", enum: ["tcp", "udp"], description: "仅匹配该协议，留空匹配全部" }
      }
    },
    timeoutMs: timeoutMs + 5000,
    isConcurrencySafe: () => false,
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_args, value) => [{ type: "text", text: JSON.stringify(value, null, 2) }]
    },
    execute: async (args) => service.killPort(args || {})
  });
}

function createRpc(service) {
  return async function rpc(method, args = {}) {
    const normalized = cleanText(method, 100);
    switch (normalized) {
      case "ports.list":
        return service.listPorts(args);
      case "ports.kill":
        return service.killPort(args);
      default:
        throw new PortError(`未知操作：${normalized}`, 404);
    }
  };
}

async function readJsonBody(req, maxBytes = 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new PortError("请求内容过大", 413);
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    return value && typeof value === "object" ? value : {};
  } catch {
    throw new PortError("请求 JSON 格式错误", 400);
  }
}

function writeJson(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  res.end(JSON.stringify(payload));
}

function apply(ctx, suppliedConfig = {}, options = {}) {
  const config = {
    timeoutMs: clampInteger(suppliedConfig.timeoutMs, DEFAULTS.timeoutMs, 3000, 120_000),
    killRecheckDelayMs: clampInteger(suppliedConfig.killRecheckDelayMs, DEFAULTS.killRecheckDelayMs, 0, 10_000)
  };
  const run = createCommandRunner({ spawnProcess: options.spawnProcess, timeoutMs: config.timeoutMs, platform: options.platform });
  const service = createPortService({ run, killRecheckDelayMs: config.killRecheckDelayMs });
  registerTools(ctx, service, config.timeoutMs);

  const rpc = createRpc(service);
  ctx.inject(["webServer"], (httpCtx) => {
    httpCtx.effect(() => httpCtx.webServer.register({
      kind: "exact",
      path: "/api/d-port/rpc",
      handler: async (req, res) => {
        if (req.method !== "POST") {
          writeJson(res, 405, { ok: false, message: "仅支持 POST" });
          return;
        }
        try {
          const body = await readJsonBody(req);
          const data = await rpc(cleanText(body.method, 100), body.args || {});
          writeJson(res, 200, { ok: true, data });
        } catch (error) {
          const status = error instanceof PortError ? error.status : 500;
          const message = error instanceof Error ? error.message : String(error);
          writeJson(res, status >= 400 && status < 600 ? status : 500, { ok: false, message });
        }
      }
    }), "dsh-port: rpc route");
  });
}

export {
  DEFAULTS,
  PortError,
  apply,
  createCommandRunner,
  createPortService,
  createRpc,
  decodeConsoleBuffer,
  inject,
  name,
  parseAddress,
  parseNetstat,
  parseNetstatLine,
  parseTasklistCsv
};
