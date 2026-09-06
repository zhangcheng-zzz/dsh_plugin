import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import test from "node:test";

import {
  DEFAULTS,
  PortError,
  apply,
  createCommandRunner,
  createPortService,
  decodeConsoleBuffer,
  parseAddress,
  parseNetstat,
  parseTasklistCsv
} from "../dist/index.js";

const NETSTAT_FIXTURE = `
活动连接

  协议  本地地址          外部地址        状态           PID

  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       1064
  TCP    0.0.0.0:3306           0.0.0.0:0              LISTENING       3308
  TCP    127.0.0.1:5040         0.0.0.0:0              LISTENING       6588
  TCP    127.0.0.1:3306         127.0.0.1:54321        ESTABLISHED     3308
  TCP    [::]:135               [::]:0                 LISTENING       1064
  TCP    [fe80::1%12]:1900      [::]:0                 LISTENING       6588
  TCP    10.0.0.2:52341         93.184.216.34:443      ESTABLISHED     9912
  TCP    10.0.0.2:52360         93.184.216.34:443      TIME_WAIT       0
  TCP    0.0.0.0:8443           0.0.0.0:0              LISTENING       9912
  TCP    0.0.0.0:8443           0.0.0.0:0              LISTENING       3308
  UDP    0.0.0.0:5353           *:*                                    5564
  UDP    [::]:500               [::]:*                                 5564
  UDP    127.0.0.1:1900         *:*                                    6588
`;

const NETSTAT_AFTER_3306 = NETSTAT_FIXTURE
  .split("\n")
  .filter((line) => !line.includes(":3306"))
  .join("\n");

const NETSTAT_AFTER_8443_9912 = NETSTAT_FIXTURE
  .split("\n")
  .filter((line) => !(line.includes(":8443") && line.trim().endsWith("9912")))
  .join("\n");

const TASKLIST_FIXTURE = `
"System Idle Process","0","N/A"
"System","4","N/A"
"svchost.exe","1064","TermService"
"svchost.exe","6588","Dhcp,Dnscache,EventLog"
"mysqld.exe","3308","N/A"
"微信.exe","9912","N/A"
"chrome.exe","5564","N/A"
"lsass.exe","999","N/A"
`;

// 按程序名组织脚本：数组按调用顺序消费，耗尽后重复最后一项，便于同一 service 多次调用。
function createFakeSpawn(scripts) {
  const calls = [];
  const cursors = new Map();
  function spawnProcess(program, args, opts) {
    calls.push({ program, args, opts });
    const scriptQueue = scripts[program];
    const child = new EventEmitter();
    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();
    child.kill = () => {};
    queueMicrotask(() => {
      if (!scriptQueue || !scriptQueue.length) {
        child.emit("error", new Error(`未预期的命令：${program} ${args.join(" ")}`));
        return;
      }
      const index = Math.min(cursors.get(program) ?? 0, scriptQueue.length - 1);
      cursors.set(program, index + 1);
      const next = scriptQueue[index];
      if (next.error) {
        child.emit("error", next.error);
        return;
      }
      if (next.stdout) child.stdout.emit("data", Buffer.from(next.stdout, "utf8"));
      if (next.stderr) child.stderr.emit("data", Buffer.from(next.stderr, "utf8"));
      child.emit("close", next.code ?? 0);
    });
    return child;
  }
  return { spawnProcess, calls };
}

function createTestService(scripts, overrides = {}) {
  const { spawnProcess, calls } = createFakeSpawn(scripts);
  const run = createCommandRunner({ spawnProcess });
  const service = createPortService({ run, delay: async () => {}, killRecheckDelayMs: 0, ...overrides });
  return { service, calls };
}

async function rejectsPortError(promise, status, messagePart) {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof PortError, `应为 PortError，收到：${error?.name}`);
    assert.equal(error.status, status);
    if (messagePart) assert.ok(error.message.includes(messagePart), `消息应包含 "${messagePart}"，实际：${error.message}`);
    return true;
  });
}

test("parseNetstat 解析 TCP/UDP/IPv6/无状态行", () => {
  const rows = parseNetstat(NETSTAT_FIXTURE);
  assert.equal(rows.length, 13);

  assert.deepEqual(rows[0], {
    protocol: "tcp",
    localAddress: "0.0.0.0",
    localPort: 135,
    remoteAddress: "0.0.0.0",
    remotePort: 0,
    state: "LISTENING",
    pid: 1064
  });

  const ipv6 = rows.find((row) => row.localAddress === "::");
  assert.equal(ipv6.localPort, 135);
  const zone = rows.find((row) => row.localAddress.startsWith("fe80::1"));
  assert.equal(zone.localAddress, "fe80::1%12");
  assert.equal(zone.localPort, 1900);

  const udp = rows.find((row) => row.protocol === "udp" && row.localPort === 5353);
  assert.equal(udp.state, "");
  assert.equal(udp.remoteAddress, "*");
  assert.equal(udp.remotePort, null);
  assert.equal(udp.pid, 5564);

  const timeWait = rows.find((row) => row.state === "TIME_WAIT");
  assert.equal(timeWait.pid, 0);

  assert.deepEqual(parseNetstat("垃圾输入\r\n\r\n"), []);
});

test("parseAddress 处理 IPv4/IPv6/通配地址", () => {
  assert.deepEqual(parseAddress("10.0.0.2:52341"), { address: "10.0.0.2", port: 52341 });
  assert.deepEqual(parseAddress("[::]:135"), { address: "::", port: 135 });
  assert.deepEqual(parseAddress("[fe80::1%12]:1900"), { address: "fe80::1%12", port: 1900 });
  assert.deepEqual(parseAddress("*:*"), { address: "*", port: null });
  assert.deepEqual(parseAddress(""), { address: "", port: null });
});

test("parseTasklistCsv 解析进程名、PID 与服务列表", () => {
  const table = parseTasklistCsv(TASKLIST_FIXTURE);
  assert.deepEqual(table.get(1064), { name: "svchost.exe", services: ["TermService"] });
  assert.deepEqual(table.get(6588), { name: "svchost.exe", services: ["Dhcp", "Dnscache", "EventLog"] });
  assert.deepEqual(table.get(3308), { name: "mysqld.exe", services: [] });
  assert.equal(table.get(9912).name, "微信.exe");

  const quoted = parseTasklistCsv('"a,b.exe","4321","N/A"\r\n');
  assert.deepEqual(quoted.get(4321), { name: "a,b.exe", services: [] });

  const localized = parseTasklistCsv('"wslrelay.exe","37564","暂缺"\r\n');
  assert.deepEqual(localized.get(37564), { name: "wslrelay.exe", services: [] });
});

test("decodeConsoleBuffer UTF-8 优先、GBK 回退", () => {
  assert.equal(decodeConsoleBuffer(Buffer.from("plain 3306", "utf8")), "plain 3306");
  assert.equal(decodeConsoleBuffer(Buffer.from([0xc4, 0xe3, 0xba, 0xc3])), "你好");
});

test("createCommandRunner 拒绝非 Windows 平台", async () => {
  const { spawnProcess } = createFakeSpawn({});
  const run = createCommandRunner({ spawnProcess, platform: "linux" });
  await rejectsPortError(run("netstat.exe", []), 501, "Windows");
});

test("createCommandRunner 处理子进程错误与超时", async () => {
  const { spawnProcess } = createFakeSpawn({ "netstat.exe": [{ error: new Error("ENOENT") }] });
  const run = createCommandRunner({ spawnProcess });
  await rejectsPortError(run("netstat.exe", []), 500, "启动失败");

  const hanging = new EventEmitter();
  hanging.stdout = new EventEmitter();
  hanging.stderr = new EventEmitter();
  hanging.kill = () => {};
  const hangingRun = createCommandRunner({
    spawnProcess: () => hanging,
    timeoutMs: 10
  });
  await rejectsPortError(hangingRun("netstat.exe", []), 504, "超时");
});

test("listPorts 支持端口/协议/状态/PID/进程名筛选与分页", async () => {
  const { service, calls } = createTestService({
    "netstat.exe": [{ stdout: NETSTAT_FIXTURE }],
    "tasklist.exe": [{ stdout: TASKLIST_FIXTURE }]
  });

  const byPort = await service.listPorts({ port: 3306 });
  assert.equal(byPort.total, 2);
  assert.ok(byPort.items.every((row) => row.localPort === 3306 && row.process === "mysqld.exe"));
  assert.ok(byPort.items.some((row) => row.state === "LISTENING"));
  assert.ok(byPort.items.some((row) => row.state === "ESTABLISHED"));

  const listening = await service.listPorts({ state: "listen" });
  assert.equal(listening.total, 7);

  const svchost = await service.listPorts({ process: "svchost" });
  assert.equal(svchost.total, 5);
  assert.deepEqual(svchost.items.find((row) => row.pid === 1064).services, ["TermService"]);

  const udp = await service.listPorts({ protocol: "udp" });
  assert.equal(udp.total, 3);

  const byPid = await service.listPorts({ pid: 5564 });
  assert.equal(byPid.total, 2);

  const byRemote = await service.listPorts({ remotePort: 443 });
  assert.equal(byRemote.total, 2);

  const paged = await service.listPorts({ port: 3306, page: 2, pageSize: 1 });
  assert.equal(paged.total, 2);
  assert.equal(paged.items.length, 1);
  assert.equal(paged.page, 2);

  const serviceFilter = await service.listPorts({ process: "termservice" });
  assert.equal(serviceFilter.total, 2);
  assert.ok(serviceFilter.items.every((row) => row.pid === 1064));

  assert.equal(calls[0].program, "netstat.exe");
  assert.deepEqual(calls[0].args, ["-ano"]);
  assert.equal(calls[1].program, "tasklist.exe");
  assert.deepEqual(calls[1].args, ["/svc", "/fo", "csv", "/nh"]);
});

test("listPorts 校验非法筛选参数", async () => {
  const { service } = createTestService({
    "netstat.exe": [{ stdout: NETSTAT_FIXTURE }],
    "tasklist.exe": [{ stdout: TASKLIST_FIXTURE }]
  });
  await rejectsPortError(service.listPorts({ protocol: "icmp" }), 422, "tcp");
  await rejectsPortError(service.listPorts({ port: 70000 }), 422, "65535");
  await rejectsPortError(service.listPorts({ pid: -1 }), 422, "PID");
});

test("killPort 结束端口占用进程并复查释放情况", async () => {
  const { service, calls } = createTestService({
    "netstat.exe": [{ stdout: NETSTAT_FIXTURE }, { stdout: NETSTAT_AFTER_3306 }],
    "tasklist.exe": [{ stdout: TASKLIST_FIXTURE }],
    "taskkill.exe": [{ stdout: "成功: 已终止 PID 为 3308 的进程。\n" }]
  });

  const result = await service.killPort({ port: 3306 });
  assert.equal(result.ok, true);
  assert.equal(result.port, 3306);
  assert.deepEqual(result.killed.map((item) => item.pid), [3308]);
  assert.equal(result.killed[0].process, "mysqld.exe");
  assert.ok(result.killed[0].message.includes("成功"));
  assert.equal(result.released, true);
  assert.deepEqual(result.remaining, []);
  assert.deepEqual(calls[2].args, ["/pid", "3308", "/t", "/f"]);
});

test("killPort 复查后仍被监听时 released 为 false", async () => {
  const { service } = createTestService({
    "netstat.exe": [{ stdout: NETSTAT_FIXTURE }, { stdout: NETSTAT_FIXTURE }],
    "tasklist.exe": [{ stdout: TASKLIST_FIXTURE }],
    "taskkill.exe": [{ stdout: "成功: 已终止 PID 为 1064 的进程。\n" }]
  });

  const result = await service.killPort({ port: 135 });
  assert.equal(result.ok, true);
  assert.equal(result.killed[0].process, "svchost.exe");
  assert.deepEqual(result.killed[0].services, ["TermService"]);
  assert.equal(result.released, false);
  assert.equal(result.remaining.length, 2);
});

test("killPort 支持同端口多进程时用 pid 指定目标", async () => {
  const { service, calls } = createTestService({
    "netstat.exe": [{ stdout: NETSTAT_FIXTURE }, { stdout: NETSTAT_AFTER_8443_9912 }],
    "tasklist.exe": [{ stdout: TASKLIST_FIXTURE }],
    "taskkill.exe": [{ stdout: "成功: 已终止 PID 为 9912 的进程。\n" }]
  });

  const result = await service.killPort({ port: 8443, pid: 9912 });
  assert.equal(result.ok, true);
  assert.equal(result.killed[0].pid, 9912);
  assert.equal(result.released, false);
  assert.equal(result.remaining.length, 1);
  assert.equal(result.remaining[0].pid, 3308);
  assert.deepEqual(calls[2].args, ["/pid", "9912", "/t", "/f"]);
});

test("killPort 端口被多个进程占用且未指定 pid 时给出候选", async () => {
  const { service } = createTestService({
    "netstat.exe": [{ stdout: NETSTAT_FIXTURE }],
    "tasklist.exe": [{ stdout: TASKLIST_FIXTURE }]
  });
  await rejectsPortError(service.killPort({ port: 8443 }), 409, "9912、3308");
});

test("killPort 指定未占用端口的 pid 时报错", async () => {
  const { service } = createTestService({
    "netstat.exe": [{ stdout: NETSTAT_FIXTURE }],
    "tasklist.exe": [{ stdout: TASKLIST_FIXTURE }]
  });
  await rejectsPortError(service.killPort({ port: 8443, pid: 5564 }), 409, "并未占用");
});

test("killPort 拒绝 PID 4/System 与核心系统进程", async () => {
  const { service, calls } = createTestService({
    "tasklist.exe": [{ stdout: TASKLIST_FIXTURE }]
  });

  const systemResult = await service.killPort({ pid: 4 });
  assert.equal(systemResult.ok, false);
  assert.equal(systemResult.failed[0].pid, 4);
  assert.ok(systemResult.failed[0].message.includes("HTTP.SYS"));

  const lsassResult = await service.killPort({ pid: 999 });
  assert.equal(lsassResult.ok, false);
  assert.ok(lsassResult.failed[0].message.includes("核心系统进程"));

  assert.equal(calls.length, 2);
  assert.ok(calls.every((call) => call.program === "tasklist.exe"));
});

test("killPort 纯 TIME_WAIT 端口提示自动释放", async () => {
  const { service } = createTestService({
    "netstat.exe": [{ stdout: NETSTAT_FIXTURE }],
    "tasklist.exe": [{ stdout: TASKLIST_FIXTURE }]
  });
  await rejectsPortError(service.killPort({ port: 52360 }), 404, "TIME_WAIT");
  await rejectsPortError(service.killPort({ port: 9999 }), 404, "9999");
});

test("killPort taskkill 失败时返回错误信息", async () => {
  const { service } = createTestService({
    "netstat.exe": [{ stdout: NETSTAT_FIXTURE }, { stdout: NETSTAT_FIXTURE }],
    "tasklist.exe": [{ stdout: TASKLIST_FIXTURE }],
    "taskkill.exe": [{ code: 1, stderr: "错误: 拒绝访问。\r\n" }]
  });

  const result = await service.killPort({ port: 3306 });
  assert.equal(result.ok, false);
  assert.equal(result.killed.length, 0);
  assert.ok(result.failed[0].message.includes("拒绝访问"));
  assert.equal(result.released, false);
  assert.equal(result.remaining.length, 2);
});

test("killPort 校验必填参数", async () => {
  const { service } = createTestService({});
  await rejectsPortError(service.killPort({}), 422, "port");
  await rejectsPortError(service.killPort({ port: 0 }), 422, "1-65535");
});

test("netstat 非零退出码抛出错误", async () => {
  const { service } = createTestService({
    "netstat.exe": [{ code: 1, stderr: "netstat 失败" }],
    "tasklist.exe": [{ stdout: TASKLIST_FIXTURE }]
  });
  await rejectsPortError(service.listPorts({}), 502, "netstat 失败");
});

test("apply 注册两个端口工具与 Web RPC 路由", async () => {
  const registered = [];
  let route;
  const ctx = {
    tools: { register: (tool) => registered.push(tool) },
    inject(_dependencies, callback) {
      callback({
        webServer: { register(value) { route = value; return () => {}; } },
        effect(effect) { return effect(); }
      });
    }
  };
  const { spawnProcess, calls } = createFakeSpawn({
    "netstat.exe": [{ stdout: NETSTAT_FIXTURE }],
    "tasklist.exe": [{ stdout: TASKLIST_FIXTURE }]
  });
  apply(ctx, { timeoutMs: 5000 }, { spawnProcess });

  assert.deepEqual(registered.map((tool) => tool.name), ["winport_list", "winport_kill"]);
  assert.ok(registered.every((tool) => tool.timeoutMs >= 5000));
  assert.ok(registered[0].parameters.properties.port);
  assert.ok(registered[1].parameters.properties.pid);
  assert.equal(registered[0].isConcurrencySafe(), true);
  assert.equal(registered[1].isConcurrencySafe(), false);
  assert.equal(route.path, "/api/d-port/rpc");

  const req = Readable.from([Buffer.from(JSON.stringify({ method: "ports.list", args: { port: 3306 } }))]);
  req.method = "POST";
  let status;
  let body;
  await route.handler(req, {
    writeHead(value) { status = value; },
    end(value) { body = value; }
  });
  assert.equal(status, 200);
  const payload = JSON.parse(body);
  assert.equal(payload.ok, true);
  assert.equal(payload.data.total, 2);
  assert.equal(payload.data.items[0].process, "mysqld.exe");
  assert.equal(calls[0].program, "netstat.exe");
  assert.deepEqual(calls[1].args, ["/svc", "/fo", "csv", "/nh"]);

  const getReq = Readable.from([]);
  getReq.method = "GET";
  await route.handler(getReq, {
    writeHead(value) { status = value; },
    end(value) { body = value; }
  });
  assert.equal(status, 405);

  const unknownReq = Readable.from([Buffer.from(JSON.stringify({ method: "ports.unknown", args: {} }))]);
  unknownReq.method = "POST";
  await route.handler(unknownReq, {
    writeHead(value) { status = value; },
    end(value) { body = value; }
  });
  assert.equal(status, 404);

  const rendered = registered[0].output.render({}, payload.data);
  assert.equal(rendered[0].type, "text");
  assert.ok(rendered[0].text.includes("mysqld.exe"));

  assert.equal(DEFAULTS.timeoutMs, 15000);
  assert.equal(DEFAULTS.killRecheckDelayMs, 300);
});

test("listPorts 支持按端口聚合视图", async () => {
  const { service } = createTestService({
    "netstat.exe": [{ stdout: NETSTAT_FIXTURE }],
    "tasklist.exe": [{ stdout: TASKLIST_FIXTURE }]
  });

  const result = await service.listPorts({ view: "ports" });
  assert.equal(result.view, "ports");
  assert.equal(result.total, 10);
  assert.equal(result.items.length, 10);

  const first = result.items[0];
  assert.equal(first.protocol, "tcp");
  assert.equal(first.localPort, 135);
  assert.equal(first.listening, true);
  assert.deepEqual(first.localAddresses, ["0.0.0.0", "::"]);
  assert.deepEqual(first.owners.map((owner) => owner.pid), [1064]);
  assert.deepEqual(first.owners.map((owner) => owner.process), ["svchost.exe"]);
  assert.equal(first.connections, 2);
  assert.deepEqual(first.stateCounts, { LISTENING: 2 });

  const established = result.items.find((group) => group.localPort === 52341);
  assert.equal(established.listening, false);
  assert.deepEqual(established.owners.map((owner) => owner.pid), [9912]);
  assert.deepEqual(established.stateCounts, { ESTABLISHED: 1 });

  const multi = result.items.find((group) => group.localPort === 8443);
  assert.deepEqual(multi.owners.map((owner) => owner.pid), [3308, 9912]);
  assert.equal(multi.connections, 2);

  const ghost = result.items.find((group) => group.localPort === 52360);
  assert.equal(ghost.listening, false);
  assert.deepEqual(ghost.owners, []);
  assert.deepEqual(ghost.stateCounts, { TIME_WAIT: 1 });

  const udp = result.items.find((group) => group.protocol === "udp" && group.localPort === 5353);
  assert.equal(udp.listening, true);
  assert.deepEqual(udp.owners.map((owner) => owner.pid), [5564]);

  const paged = await service.listPorts({ view: "ports", page: 3, pageSize: 4 });
  assert.equal(paged.total, 10);
  assert.equal(paged.items.length, 2);
  assert.equal(paged.items[0].localPort, 52341);
  assert.equal(paged.items[1].localPort, 52360);
});

test("client 注入侧边栏入口、右侧面板与结束进程流程", async () => {
  const source = await readFile(path.join(import.meta.dirname, "../dist/client.js"), "utf8");
  assert.match(source, /__ModuleLoader__\.load\(\{ id: "dsh-port"/);
  assert.match(source, /sidebar\.footer\.action/);
  assert.match(source, /shell\.overlay/);
  assert.match(source, /id: "dsh-port-workspace"/);
  assert.match(source, /ctx\.layout\.openDetails\(\)/);
  assert.match(source, /ctx\.layout\.closeDetails\(\)/);
  assert.match(source, /\.dpt-right-panel\{[^}]*width:var\(--dpt-workspace-width,520px\)/);
  assert.match(source, /data-dpt-workspace-open/);
  assert.match(source, /dsh-port:panel-width/);
  assert.match(source, /dpt-resize-handle/);
  assert.match(source, /onPointerDown: beginResize/);
  assert.match(source, /localStorage\.setItem/);
  assert.match(source, /@media\(prefers-color-scheme:dark\)/);
  assert.match(source, /\/api\/d-port\/rpc/);
  assert.match(source, /ports\.list/);
  assert.match(source, /ports\.kill/);
  assert.match(source, /view: state\.view/);
  assert.match(source, /buildPortsTable/);
  assert.match(source, /buildConnectionsTable/);
  assert.match(source, /\.dpt-view\{[^}]*background:var\(--dpt-tag\)/);
  assert.match(source, /"按端口"/);
  assert.match(source, /"连接明细"/);
  assert.match(source, /监听中/);
  assert.match(source, /flex:1 1 100%/);
  assert.match(source, /\*:has\(> \.dpt-sidebar-trigger\)\{flex:1 1 100%;flex-wrap:wrap/);
  assert.match(source, /dpt-sidebar-trigger-label/);
  assert.match(source, /@container\(max-width:150px\)\{\.dpt-sidebar-trigger \.dpt-sidebar-trigger-label\{display:none\}\}/);
  // 侧边栏堆叠：跳过 display:contents 包装层，定位真正的横向 flex 行并开启换行；
  // 另有针对宿主 .dshp-footerActions 的 CSS 兜底。
  assert.match(source, /flexDirection\.indexOf\("row"\) === 0/);
  assert.match(source, /style\.display === "contents"/);
  assert.match(source, /node\.style\.flex = "1 1 100%"/);
  assert.match(source, /flexRow\.style\.flexWrap = "wrap"/);
  assert.match(source, /\.dshp-footerActions:has\(\.dpt-sidebar-trigger\)\{flex-wrap:wrap;row-gap:2px\}/);
  assert.match(source, /每 10 秒自动刷新/);
  assert.match(source, /结束进程确认/);
  assert.match(source, /确认结束/);
  assert.match(source, /taskkill 强制结束该进程及其子进程树/);
  assert.match(source, /ports\.kill", \{ port: target\.localPort, pid: target\.pid, protocol: target\.protocol \}/);
  assert.match(source, /没有匹配的端口记录/);
  assert.match(source, /export/i);
  assert.doesNotMatch(source, /window\.confirm/);
});
