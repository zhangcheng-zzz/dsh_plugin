import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const name = "dsh-yunxiao";
const inject = ["tools"];

const DEFAULTS = Object.freeze({
  dataFile: "./dsh-yunxiao.data.json",
  apiBaseUrl: "https://openapi-rdc.aliyuncs.com",
  timeoutMs: 45_000,
  cacheMaxItems: 100
});

class YunxiaoError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = "YunxiaoError";
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

function normalizeDefectNotification(value) {
  const source = value && typeof value === "object" ? value : {};
  const targetMap = new Map();
  for (const item of Array.isArray(source.targetStatuses) ? source.targetStatuses : []) {
    const status = { id: cleanText(item?.id, 128), name: cleanText(item?.name, 100) };
    const kind = notificationStatusKind(status.name);
    if (status.id && kind && !targetMap.has(kind)) targetMap.set(kind, status);
  }
  const targetStatuses = [targetMap.get("pending"), targetMap.get("reopened")].filter(Boolean);
  return {
    enabled: Boolean(source.enabled),
    assignedToId: cleanText(source.assignedToId, 128),
    assignedToName: cleanText(source.assignedToName, 255),
    intervalMinutes: clampInteger(source.intervalMinutes, 5, 1, 1440),
    targetStatuses
  };
}

function isNotifiableDefectStatus(value) {
  const normalized = cleanText(value, 100).replace(/\s+/g, "").toUpperCase();
  return ["待确认", "未确认", "再次打开", "重新打开", "REOPEN", "REOPENED"].includes(normalized);
}

function notificationStatusKind(value) {
  const normalized = cleanText(value, 100).replace(/\s+/g, "").toUpperCase();
  if (["待确认", "未确认"].includes(normalized)) return "pending";
  if (["再次打开", "重新打开", "REOPEN", "REOPENED"].includes(normalized)) return "reopened";
  return "";
}

function emptyState() {
  return { version: 1, selectedAccountId: "", accounts: [], cache: {} };
}

function normalizeState(value) {
  if (!value || typeof value !== "object") return emptyState();
  return {
    version: 1,
    selectedAccountId: cleanText(value.selectedAccountId, 100),
    accounts: Array.isArray(value.accounts) ? value.accounts.filter((item) => item && typeof item === "object") : [],
    cache: value.cache && typeof value.cache === "object" ? value.cache : {}
  };
}

function createJsonStore(fileName, cacheMaxItems) {
  const absolutePath = path.resolve(process.cwd(), fileName);
  let statePromise;
  let mutationQueue = Promise.resolve();

  async function load() {
    if (!statePromise) {
      statePromise = readFile(absolutePath, "utf8")
        .then((text) => normalizeState(JSON.parse(text)))
        .catch((error) => {
          if (error && error.code === "ENOENT") return emptyState();
          throw new Error(`读取云效数据文件失败：${error instanceof Error ? error.message : String(error)}`);
        });
    }
    return statePromise;
  }

  async function persist(state) {
    await mkdir(path.dirname(absolutePath), { recursive: true });
    const tempPath = `${absolutePath}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tempPath, `${JSON.stringify(state, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    await rename(tempPath, absolutePath);
  }

  async function update(mutator) {
    const operation = mutationQueue.then(async () => {
      const state = await load();
      const result = await mutator(state);
      await persist(state);
      return result;
    });
    mutationQueue = operation.catch(() => undefined);
    return operation;
  }

  async function getAccount(accountId) {
    const state = await load();
    const wanted = cleanText(accountId, 100) || state.selectedAccountId;
    const account = state.accounts.find((item) => item.id === wanted);
    if (!account) throw new YunxiaoError("请先配置并选择云效账号", 422);
    if (!cleanText(account.organizationId, 128) || !cleanText(account.token)) {
      throw new YunxiaoError("当前账号缺少组织 ID 或个人访问令牌", 422);
    }
    return account;
  }

  function publicAccount(account) {
    const projectId = cleanText(account.selectedProject?.id, 128);
    const projectSettings = account.projectSettings && typeof account.projectSettings === "object"
      ? account.projectSettings[projectId]
      : null;
    return {
      id: account.id,
      name: account.name,
      organizationId: account.organizationId,
      remark: account.remark || "",
      hasToken: Boolean(account.token),
      selectedProject: account.selectedProject || null,
      defectNotification: normalizeDefectNotification(projectSettings?.defectNotification),
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };
  }

  async function publicState() {
    const state = await load();
    return {
      selectedAccountId: state.selectedAccountId,
      accounts: state.accounts.map(publicAccount),
      dataFile: absolutePath
    };
  }

  async function saveAccount(input) {
    return update((state) => {
      const id = cleanText(input.id, 100);
      const now = new Date().toISOString();
      let account = id ? state.accounts.find((item) => item.id === id) : null;
      const nameValue = cleanText(input.name, 255);
      const organizationId = cleanText(input.organizationId, 128);
      const token = cleanText(input.token);
      if (!nameValue || !organizationId) throw new YunxiaoError("账号名称和组织 ID 不能为空", 422);
      if (!account && !token) throw new YunxiaoError("新增账号时必须填写个人访问令牌", 422);
      if (state.accounts.some((item) => item.id !== id && item.name === nameValue)) {
        throw new YunxiaoError("已存在同名账号", 409);
      }
      if (account) {
        const organizationChanged = account.organizationId !== organizationId;
        account.name = nameValue;
        account.organizationId = organizationId;
        account.remark = cleanText(input.remark, 2000);
        if (token) account.token = token;
        if (organizationChanged) account.selectedProject = null;
        account.updatedAt = now;
      } else {
        account = {
          id: randomUUID(),
          name: nameValue,
          organizationId,
          token,
          remark: cleanText(input.remark, 2000),
          selectedProject: null,
          createdAt: now,
          updatedAt: now
        };
        state.accounts.unshift(account);
      }
      state.selectedAccountId = account.id;
      return publicAccount(account);
    });
  }

  async function selectAccount(accountId) {
    return update((state) => {
      const account = state.accounts.find((item) => item.id === cleanText(accountId, 100));
      if (!account) throw new YunxiaoError("账号不存在", 404);
      state.selectedAccountId = account.id;
      return publicAccount(account);
    });
  }

  async function deleteAccount(accountId) {
    return update((state) => {
      const id = cleanText(accountId, 100);
      const index = state.accounts.findIndex((item) => item.id === id);
      if (index < 0) throw new YunxiaoError("账号不存在", 404);
      state.accounts.splice(index, 1);
      delete state.cache[id];
      if (state.selectedAccountId === id) state.selectedAccountId = state.accounts[0]?.id || "";
      return { ok: true };
    });
  }

  async function selectProject(accountId, project) {
    return update((state) => {
      const account = state.accounts.find((item) => item.id === cleanText(accountId, 100));
      if (!account) throw new YunxiaoError("账号不存在", 404);
      const selected = { id: cleanText(project.id, 128), name: cleanText(project.name, 255) };
      if (!selected.id || !selected.name) throw new YunxiaoError("项目 ID 和名称不能为空", 422);
      account.selectedProject = selected;
      account.updatedAt = new Date().toISOString();
      state.selectedAccountId = account.id;
      return selected;
    });
  }

  async function saveDefectNotification(accountId, projectId, input) {
    return update((state) => {
      const account = state.accounts.find((item) => item.id === cleanText(accountId, 100));
      if (!account) throw new YunxiaoError("账号不存在", 404);
      const targetProjectId = cleanText(projectId || account.selectedProject?.id, 128);
      if (!targetProjectId) throw new YunxiaoError("请先选择项目", 422);
      const settings = normalizeDefectNotification(input);
      if (!account.projectSettings || typeof account.projectSettings !== "object") account.projectSettings = {};
      const projectSettings = account.projectSettings[targetProjectId] && typeof account.projectSettings[targetProjectId] === "object"
        ? account.projectSettings[targetProjectId]
        : {};
      projectSettings.defectNotification = settings;
      account.projectSettings[targetProjectId] = projectSettings;
      account.updatedAt = new Date().toISOString();
      state.selectedAccountId = account.id;
      return settings;
    });
  }

  async function putCache(accountId, key, value) {
    return update((state) => {
      const accountCache = state.cache[accountId] || {};
      const nextValue = value && typeof value === "object" ? structuredClone(value) : value;
      if (nextValue && Array.isArray(nextValue.items)) nextValue.items = nextValue.items.slice(0, cacheMaxItems);
      accountCache[key] = { savedAt: new Date().toISOString(), value: nextValue };
      state.cache[accountId] = accountCache;
      return accountCache[key];
    });
  }

  async function getCache(accountId, key) {
    const state = await load();
    return state.cache[accountId]?.[key] || null;
  }

  return {
    absolutePath,
    load,
    update,
    getAccount,
    publicState,
    saveAccount,
    selectAccount,
    deleteAccount,
    selectProject,
    saveDefectNotification,
    putCache,
    getCache
  };
}

function createApiClient(config) {
  const baseUrl = config.apiBaseUrl.replace(/\/+$/, "");

  async function request(account, pathname, options = {}) {
    const url = new URL(`${baseUrl}${pathname}`);
    for (const [key, value] of Object.entries(options.query || {})) {
      if (value !== "" && value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
    const headers = {
      "content-type": "application/json",
      "cache-control": "no-cache",
      "x-yunxiao-token": account.token
    };
    let response;
    try {
      response = await fetch(url, {
        method: options.method || "GET",
        cache: "no-store",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: options.signal || AbortSignal.timeout(config.timeoutMs)
      });
    } catch (error) {
      throw new YunxiaoError(`连接云效 OpenAPI 失败：${error instanceof Error ? error.message : String(error)}`);
    }
    const text = await response.text();
    let payload = null;
    if (text) {
      try { payload = JSON.parse(text); } catch { payload = text; }
    }
    if (!response.ok) {
      const detail = typeof payload === "string"
        ? payload.slice(0, 500)
        : cleanText(payload?.message || payload?.errorMessage || payload?.code || JSON.stringify(payload), 500);
      throw new YunxiaoError(`云效 OpenAPI 返回 HTTP ${response.status}${detail ? `：${detail}` : ""}`, response.status);
    }
    return { payload, headers: response.headers };
  }

  function paths(account) {
    const org = encodeURIComponent(account.organizationId);
    const root = `/oapi/v1/projex/organizations/${org}`;
    return {
      projex: root,
      projects: `${root}/projects:search`,
      workitems: `${root}/workitems`,
      workitemSearch: `${root}/workitems:search`,
      pipelines: `/oapi/v1/flow/organizations/${org}/pipelines`,
      codeup: `/oapi/v1/codeup/organizations/${org}`
    };
  }

  function totalFrom(headers, page, pageSize, count) {
    const exact = headers.get("x-total") || headers.get("x-total-count") || headers.get("x-content-total");
    if (exact && Number.isFinite(Number(exact))) return Number(exact);
    const pages = Number(headers.get("x-total-pages") || 0);
    return pages ? (pages - 1) * pageSize + count : (page - 1) * pageSize + count;
  }

  async function listProjects(account) {
    const api = paths(account);
    const items = [];
    for (let page = 1; page <= 1000; page += 1) {
      const response = await request(account, api.projects, {
        method: "POST",
        body: {
          conditions: JSON.stringify({ conditionGroups: [[]] }),
          extraConditions: "",
          orderBy: "name",
          page,
          perPage: 200,
          sort: "asc"
        }
      });
      if (!Array.isArray(response.payload)) throw new YunxiaoError("云效项目接口返回格式异常");
      const pageItems = response.payload.filter((item) => item && typeof item === "object");
      items.push(...pageItems);
      const pages = Number(response.headers.get("x-total-pages") || 0);
      if ((pages && page >= pages) || (!pages && pageItems.length < 200)) break;
      if (page === 1000) throw new YunxiaoError("云效项目分页超过安全上限");
    }
    return items
      .map((item) => ({ id: cleanText(item.id || item.identifier, 128), name: cleanText(item.name, 255) }))
      .filter((item) => item.id && item.name);
  }

  async function listDefects(account, projectId, query = {}) {
    const api = paths(account);
    const page = clampInteger(query.page, 1, 1, 10_000);
    const pageSize = clampInteger(query.pageSize, 20, 1, 100);
    const orderBy = cleanText(query.orderBy, 30) === "gmtModified" ? "gmtModified" : "gmtCreate";
    const filters = [];
    for (const [fieldIdentifier, key, className, format] of [
      ["serialNumber", "serialNumber", "string", "input"],
      ["subject", "subject", "string", "input"],
      ["status", "statusId", "status", "list"],
      ["assignedTo", "assignedToId", "user", "list"]
    ]) {
      const value = cleanText(query[key], 255);
      if (value) filters.push({ fieldIdentifier, operator: "CONTAINS", value: [value], toValue: null, className, format });
    }
    const response = await request(account, api.workitemSearch, {
      method: "POST",
      body: {
        category: "Bug",
        conditions: JSON.stringify({ conditionGroups: filters.length ? [filters] : [] }),
        orderBy,
        page,
        perPage: pageSize,
        sort: "desc",
        spaceId: projectId,
        spaceType: "Project"
      }
    });
    if (!Array.isArray(response.payload)) throw new YunxiaoError("云效缺陷接口返回格式异常");
    const items = response.payload.filter((item) => item && typeof item === "object").map((item) => mapDefect(projectId, item));
    return { items, total: totalFrom(response.headers, page, pageSize, items.length), page, pageSize };
  }

  async function getDefect(account, projectId, defectId) {
    const api = paths(account);
    const encoded = encodeURIComponent(defectId);
    const itemPath = `${api.workitems}/${encoded}`;
    const [itemResponse, workflowResponse, commentsResponse, attachmentsResponse] = await Promise.all([
      request(account, itemPath),
      requestOptional(account, `${itemPath}/workflow`),
      requestOptional(account, `${itemPath}/comments`),
      requestOptional(account, `${itemPath}/attachments`)
    ]);
    if (!itemResponse.payload || typeof itemResponse.payload !== "object" || Array.isArray(itemResponse.payload)) {
      throw new YunxiaoError("云效缺陷详情接口返回格式异常");
    }
    const warnings = [];
    const statuses = await resolveDefectStatuses(account, api, itemPath, itemResponse.payload, workflowResponse);
    if (!statuses.length) warnings.push("未能读取可选状态");
    if (!commentsResponse.ok) warnings.push("评论读取失败");
    if (!attachmentsResponse.ok) warnings.push("附件读取失败");
    const rawComments = Array.isArray(commentsResponse.payload) ? commentsResponse.payload : [];
    const rawAttachments = Array.isArray(attachmentsResponse.payload) ? attachmentsResponse.payload.slice() : [];
    const knownFileIds = new Set(rawAttachments.map((item) => cleanText(item?.fileId || item?.id, 128)).filter(Boolean));
    const missingFileIds = inlineFileIds([
      cleanTextPreserve(itemResponse.payload.description, 500_000),
      ...rawComments.map((item) => cleanTextPreserve(item?.content, 300_000))
    ]).filter((fileId) => !knownFileIds.has(fileId)).slice(0, 30);
    const inlineFiles = await mapLimit(missingFileIds, 6, async (fileId) => {
      const result = await requestOptional(account, `${itemPath}/files/${encodeURIComponent(fileId)}`);
      if (!result.ok || !result.payload || typeof result.payload !== "object") return null;
      return { fileId, ...result.payload };
    });
    rawAttachments.push(...inlineFiles.filter(Boolean));
    return {
      defect: mapDefect(projectId, itemResponse.payload),
      description: cleanTextPreserve(itemResponse.payload.description, 500_000),
      descriptionFormat: cleanText(itemResponse.payload.formatType || "RICHTEXT", 30),
      statuses,
      comments: rawComments.map(mapComment),
      attachments: rawAttachments.map(mapAttachment).filter((item) => item.url),
      warning: warnings.join("；")
    };
  }

  async function resolveDefectStatuses(account, api, itemPath, item, workflowResponse) {
    let statuses = extractStatuses(workflowResponse.payload);
    if (!statuses.length) {
      const remoteProjectId = cleanText(item.space?.id || item.spaceId || item.projectId, 128);
      const workitemTypeId = cleanText(item.workitemType?.id || item.workitemTypeId, 128);
      if (remoteProjectId && workitemTypeId) {
        const fallback = await requestOptional(
          account,
          `${api.projex}/projects/${encodeURIComponent(remoteProjectId)}/workitemTypes/${encodeURIComponent(workitemTypeId)}/workflows`
        );
        statuses = extractStatuses(fallback.payload);
      }
    }
    return statuses.map((status) => ({ id: cleanText(status.id, 128), name: displayName(status) })).filter((status) => status.id && status.name);
  }

  async function getDefectStatuses(account, projectId, defectId) {
    const api = paths(account);
    const itemPath = `${api.workitems}/${encodeURIComponent(defectId)}`;
    const [itemResponse, workflowResponse] = await Promise.all([
      request(account, itemPath),
      requestOptional(account, `${itemPath}/workflow`)
    ]);
    if (!itemResponse.payload || typeof itemResponse.payload !== "object" || Array.isArray(itemResponse.payload)) {
      throw new YunxiaoError("云效缺陷详情接口返回格式异常");
    }
    const statuses = await resolveDefectStatuses(account, api, itemPath, itemResponse.payload, workflowResponse);
    if (!statuses.length) throw new YunxiaoError("当前缺陷没有可用的工作流状态");
    return statuses;
  }

  async function resolveNotificationStatuses(account, projectId) {
    const recent = await listDefects(account, projectId, { page: 1, pageSize: 100, orderBy: "gmtModified" });
    const candidates = (recent.items || [])
      .filter((item) => item.statusId && notificationStatusKind(item.statusName))
      .map((item) => ({ id: item.statusId, name: item.statusName }));
    if (recent.items?.[0]?.id && new Set(candidates.map((item) => notificationStatusKind(item.name))).size < 2) {
      try {
        candidates.push(...await getDefectStatuses(account, projectId, recent.items[0].id));
      } catch (error) {}
    }
    const byKind = new Map();
    for (const status of candidates) {
      const kind = notificationStatusKind(status.name);
      if (kind && !byKind.has(kind)) byKind.set(kind, { id: cleanText(status.id, 128), name: cleanText(status.name, 100) });
    }
    const statuses = [byKind.get("pending"), byKind.get("reopened")].filter(Boolean);
    if (statuses.length < 2) throw new YunxiaoError("未能识别“待确认”和“再次打开”的状态 ID，请先在缺陷列表中确认这两个状态可用", 422);
    return statuses;
  }

  async function requestOptional(account, pathname, options) {
    try {
      const result = await request(account, pathname, options);
      return { ...result, ok: true };
    } catch (error) {
      return { payload: null, headers: new Headers(), ok: false, error };
    }
  }

  async function updateDefectStatus(account, projectId, defectId, statusId) {
    const api = paths(account);
    const itemPath = `${api.workitems}/${encodeURIComponent(defectId)}`;
    await request(account, itemPath, { method: "PUT", body: { status: statusId } });
    const latest = await request(account, itemPath);
    if (!latest.payload || typeof latest.payload !== "object") throw new YunxiaoError("状态已提交，但读取最新缺陷失败");
    return mapDefect(projectId, latest.payload);
  }

  async function createDefectComment(account, projectId, defectId, content) {
    const api = paths(account);
    const value = cleanTextPreserve(content, 10_000).trim();
    if (!value) throw new YunxiaoError("评论内容不能为空", 422);
    const response = await request(account, `${api.workitems}/${encodeURIComponent(defectId)}/comments`, {
      method: "POST",
      body: { content: value }
    });
    const id = cleanText(response.payload?.id, 128);
    if (!id) throw new YunxiaoError("评论已提交，但云效接口未返回评论 ID");
    return { id, projectId, defectId };
  }

  async function listPipelines(account, query = {}) {
    const api = paths(account);
    const page = clampInteger(query.page, 1, 1, 10_000);
    const pageSize = clampInteger(query.pageSize, 20, 1, 30);
    const response = await request(account, api.pipelines, {
      query: { page, perPage: pageSize, pipelineName: cleanText(query.keyword, 255), statusList: cleanText(query.statuses, 200) }
    });
    if (!Array.isArray(response.payload)) throw new YunxiaoError("云效流水线列表接口返回格式异常");
    const rawItems = response.payload.filter((item) => item && typeof item === "object");
    const latest = await mapLimit(rawItems, 6, async (item) => {
      const id = cleanText(item.pipelineId || item.id, 128);
      if (!id) return null;
      const result = await requestOptional(account, `${api.pipelines}/${encodeURIComponent(id)}/runs/latestPipelineRun`);
      return result.payload && typeof result.payload === "object" ? result.payload : null;
    });
    const items = rawItems.map((item, index) => mapPipeline({ ...item, latestRun: latest[index] || item.latestRun }));
    return { items, total: totalFrom(response.headers, page, pageSize, items.length), page, pageSize, scope: "organization" };
  }

  async function getPipeline(account, pipelineId) {
    const api = paths(account);
    const response = await request(account, `${api.pipelines}/${encodeURIComponent(pipelineId)}`);
    const item = response.payload;
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new YunxiaoError("云效流水线详情接口返回格式异常");
    let pipelineConfig = item.pipelineConfig;
    if (typeof pipelineConfig === "string") {
      try { pipelineConfig = JSON.parse(pipelineConfig); } catch { pipelineConfig = {}; }
    }
    if (!pipelineConfig || typeof pipelineConfig !== "object" || Array.isArray(pipelineConfig)) pipelineConfig = {};
    let sourceValue = Array.isArray(item.sources) ? item.sources : pipelineConfig.sources;
    if (typeof sourceValue === "string") {
      try { sourceValue = JSON.parse(sourceValue); } catch { sourceValue = []; }
    }
    const sources = Array.isArray(sourceValue) ? sourceValue.filter((source) => source && typeof source === "object") : [];
    return {
      pipeline: mapPipeline(item),
      envId: Number.isInteger(item.envId) ? item.envId : null,
      envName: cleanText(item.envName, 255),
      groupId: cleanText(item.groupId, 128),
      pipelineType: cleanText(item.type || item.pipelineType, 100),
      sources: sources.map(mapPipelineSource),
      settings: cleanTextPreserve(pipelineConfig.settings, 200_000)
    };
  }

  async function listPipelineBranches(account, pipelineId) {
    const api = paths(account);
    const detail = await getPipeline(account, pipelineId);
    const results = [];
    let codeupApiAuthorized;
    for (const source of detail.sources) {
      const result = { ...source, branches: [], warning: "" };
      const repositoryPath = codeupRepositoryPath(source.repo);
      if (!["codeup", "aliyungit"].includes(source.type.toLowerCase()) || !repositoryPath) {
        result.warning = "非 Codeup 代码源，可手动填写分支";
        results.push(result);
        continue;
      }
      for (let page = 1; page <= 100; page += 1) {
        const response = await requestOptional(
          account,
          `${api.codeup}/repositories/${encodeURIComponent(repositoryPath)}/branches`,
          { query: { page, perPage: 100, sort: "updated_desc" } }
        );
        if (!response.ok || !Array.isArray(response.payload)) {
          if (response.error?.status === 403) {
            if (codeupApiAuthorized === undefined) {
              const probe = await requestOptional(account, `${api.codeup}/repositories`, { query: { page: 1, perPage: 1 } });
              codeupApiAuthorized = probe.ok && Array.isArray(probe.payload);
            }
            result.warning = codeupApiAuthorized
              ? "令牌的代码管理 API 权限已生效，但令牌所属用户无此代码库访问权限；请将该用户加入代码库成员"
              : "当前令牌没有 Codeup 分支读取权限；请检查“代码管理 → 分支 → 只读”权限";
          } else result.warning = "分支读取失败，可稍后重试";
          break;
        }
        const pageBranches = response.payload.map((item) => cleanText(item?.name, 500)).filter(Boolean);
        result.branches.push(...pageBranches);
        const pages = Number(response.headers.get("x-total-pages") || 0);
        if ((pages && page >= pages) || (!pages && pageBranches.length < 100)) break;
        if (page === 100) result.warning = "分支超过读取上限，仅展示前 10000 条";
      }
      result.branches = [...new Set(result.branches)];
      results.push(result);
    }
    return results;
  }

  async function listPipelineRuns(account, pipelineId, query = {}) {
    const api = paths(account);
    const page = clampInteger(query.page, 1, 1, 10_000);
    const pageSize = clampInteger(query.pageSize, 10, 1, 30);
    const base = `${api.pipelines}/${encodeURIComponent(pipelineId)}/runs`;
    const response = await request(account, base, { query: { page, perPage: pageSize, status: cleanText(query.status, 30) } });
    if (!Array.isArray(response.payload)) throw new YunxiaoError("流水线运行记录接口返回格式异常");
    const rawItems = response.payload.filter((item) => item && typeof item === "object");
    const details = await mapLimit(rawItems, 6, async (item) => {
      const id = cleanText(item.pipelineRunId || item.id, 128);
      if (!id) return null;
      const result = await requestOptional(account, `${base}/${encodeURIComponent(id)}`);
      return result.payload && typeof result.payload === "object" ? result.payload : null;
    });
    const items = rawItems.map((item, index) => mapPipelineRun({ ...item, ...(details[index] || {}) }));
    return { items, total: totalFrom(response.headers, page, pageSize, items.length), page, pageSize };
  }

  async function getPipelineRun(account, pipelineId, pipelineRunId) {
    const api = paths(account);
    const response = await request(account, `${api.pipelines}/${encodeURIComponent(pipelineId)}/runs/${encodeURIComponent(pipelineRunId)}`);
    if (!response.payload || typeof response.payload !== "object") throw new YunxiaoError("流水线运行详情接口返回格式异常");
    return mapPipelineRun(response.payload);
  }

  async function getPipelineJobLog(account, pipelineId, pipelineRunId, jobId) {
    const api = paths(account);
    const response = await request(
      account,
      `${api.pipelines}/${encodeURIComponent(pipelineId)}/runs/${encodeURIComponent(pipelineRunId)}/job/${encodeURIComponent(jobId)}/log`
    );
    const payload = response.payload && typeof response.payload === "object" ? response.payload : {};
    return { content: cleanTextPreserve(payload.content, 1_000_000), last: Number(payload.last || 0), more: Boolean(payload.more) };
  }

  async function createPipelineRun(account, pipelineId, input = {}) {
    const api = paths(account);
    const params = {};
    const branchMode = Array.isArray(input.branchModeBranches) ? input.branchModeBranches.map((item) => cleanText(item, 500)).filter(Boolean) : [];
    const running = cleanMapping(input.runningBranches, 20, 500);
    const comment = cleanText(input.comment, 1000);
    if (branchMode.length) params.branchModeBranchs = [...new Set(branchMode)].slice(0, 100);
    if (Object.keys(running).length) params.runningBranchs = running;
    if (comment) params.comment = comment;
    const response = await request(account, `${api.pipelines}/${encodeURIComponent(pipelineId)}/runs`, {
      method: "POST",
      body: { params: JSON.stringify(params) }
    });
    const id = typeof response.payload === "string" || typeof response.payload === "number"
      ? String(response.payload)
      : cleanText(response.payload?.pipelineRunId || response.payload?.id, 128);
    if (!id) throw new YunxiaoError("云效运行流水线接口未返回运行实例 ID");
    return { pipelineId, pipelineRunId: id };
  }

  return {
    listProjects,
    listDefects,
    getDefect,
    getDefectStatuses,
    resolveNotificationStatuses,
    updateDefectStatus,
    createDefectComment,
    listPipelines,
    getPipeline,
    listPipelineBranches,
    listPipelineRuns,
    getPipelineRun,
    getPipelineJobLog,
    createPipelineRun
  };
}

function cleanTextPreserve(value, max) {
  return String(value ?? "").slice(0, max);
}

function inlineFileIds(contents) {
  const result = new Set();
  const patterns = [
    /\/files\/([A-Za-z0-9_-]{8,128})(?:[/?#]|$)/gi,
    /(?:fileIdentifier|fileId|file_id)=([A-Za-z0-9_-]{8,128})(?:[&#"']|$)/gi,
    /(?:data-file-id|data-fileid|file-id|fileid)=["']([A-Za-z0-9_-]{8,128})["']/gi
  ];
  for (const content of contents) {
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(content)) !== null) result.add(match[1]);
    }
  }
  return [...result];
}

function displayName(value) {
  return value && typeof value === "object" ? cleanText(value.displayName || value.name, 255) : "";
}

function customDisplay(item, keywords) {
  for (const field of Array.isArray(item.customFieldValues) ? item.customFieldValues : []) {
    const nameValue = cleanText(field?.fieldName || field?.fieldId, 255).toLowerCase();
    if (!keywords.some((keyword) => nameValue.includes(keyword.toLowerCase()))) continue;
    if (Array.isArray(field.values)) {
      return field.values.map((value) => cleanText(value?.displayValue || value?.name, 255)).filter(Boolean).join("、");
    }
    return cleanText(field.values, 255);
  }
  return "";
}

function mapDefect(projectId, item) {
  return {
    projectId,
    id: cleanText(item.id || item.identifier, 128),
    serialNumber: cleanText(item.serialNumber || item.serialNo, 128),
    subject: cleanText(item.subject || item.title, 1000),
    statusId: cleanText(item.status?.id, 128),
    statusName: displayName(item.status),
    workitemType: displayName(item.workitemType) || "缺陷",
    assignedToId: cleanText(item.assignedTo?.id, 128),
    assignedToName: displayName(item.assignedTo),
    creatorName: displayName(item.creator),
    sprintName: displayName(item.sprint),
    priority: customDisplay(item, ["priority", "优先级"]),
    severity: customDisplay(item, ["severity", "严重程度", "严重级别"]),
    gmtCreate: item.gmtCreate || null,
    gmtModified: item.gmtModified || null
  };
}

function extractStatuses(value) {
  if (Array.isArray(value)) {
    const direct = value.filter((item) => item && typeof item === "object" && item.id && (item.displayName || item.name));
    if (direct.length) return direct;
    for (const item of value) {
      const found = extractStatuses(item);
      if (found.length) return found;
    }
  } else if (value && typeof value === "object") {
    if (Array.isArray(value.statuses)) return value.statuses.filter((item) => item && typeof item === "object");
    for (const key of ["workflows", "data", "result"]) {
      const found = extractStatuses(value[key]);
      if (found.length) return found;
    }
  }
  return [];
}

function mapComment(item) {
  return {
    id: cleanText(item?.id, 128),
    parentId: cleanText(item?.parentId, 128),
    userName: displayName(item?.user),
    content: cleanTextPreserve(item?.content, 300_000),
    contentFormat: cleanText(item?.contentFormat || "RICHTEXT", 30),
    gmtCreate: item?.gmtCreate || null,
    gmtModified: item?.gmtModified || null,
    top: Boolean(item?.top)
  };
}

function mapAttachment(item) {
  return {
    fileId: cleanText(item?.fileId || item?.id, 128),
    fileName: cleanText(item?.fileName || item?.name || "附件", 500),
    suffix: cleanText(item?.suffix, 30),
    size: Number(item?.size || 0),
    url: cleanTextPreserve(item?.url, 4000),
    creatorName: displayName(item?.creator),
    gmtCreate: item?.gmtCreate || null
  };
}

function mapPipeline(item) {
  const latest = item.latestRun && typeof item.latestRun === "object" ? item.latestRun : {};
  return {
    id: cleanText(item.pipelineId || item.id, 128),
    name: cleanText(item.pipelineName || item.name || "未命名流水线", 500),
    status: cleanText(item.status || latest.status, 50),
    createAccountId: cleanText(item.createAccountId || item.creatorAccountId, 128),
    createTime: item.createTime || null,
    updateTime: item.updateTime || latest.updateTime || null,
    latestRunId: cleanText(item.pipelineRunId || latest.pipelineRunId, 128)
  };
}

function mapPipelineSource(item) {
  const data = item.data && typeof item.data === "object" ? item.data : {};
  const repo = cleanText(data.repo, 2000);
  return {
    sourceId: cleanText(item.sign || item.name || repo, 500),
    name: cleanText(item.label || data.label || item.name || repo || "代码源", 500),
    type: cleanText(item.type, 100),
    repo,
    defaultBranch: cleanText(data.branch, 500),
    isBranchMode: Boolean(data.isBranchMode)
  };
}

function mapPipelineRun(item) {
  let stages = Array.isArray(item.stages) ? item.stages : item.stageGroup;
  if (!Array.isArray(stages)) stages = [];
  const globalParams = (Array.isArray(item.globalParams) ? item.globalParams : []).filter((entry) => entry && typeof entry === "object").map((entry) => ({
    ...entry,
    value: entry.encrypted ? "******" : entry.value
  }));
  return {
    pipelineId: cleanText(item.pipelineId, 128),
    pipelineRunId: cleanText(item.pipelineRunId || item.id, 128),
    status: cleanText(item.status, 50),
    creatorAccountId: cleanText(item.creatorAccountId, 128),
    triggerMode: Number.isInteger(item.triggerMode) ? item.triggerMode : null,
    startTime: item.startTime || item.createTime || null,
    endTime: item.endTime || null,
    stages,
    sources: Array.isArray(item.sources) ? item.sources : [],
    globalParams
  };
}

function cleanMapping(value, maxItems, maxLength) {
  const result = {};
  if (!value || typeof value !== "object" || Array.isArray(value)) return result;
  for (const [key, item] of Object.entries(value).slice(0, maxItems)) {
    const cleanKey = cleanText(key, 500);
    const cleanValue = cleanText(item, maxLength);
    if (cleanKey && cleanValue) result[cleanKey] = cleanValue;
  }
  return result;
}

function codeupRepositoryPath(repo) {
  try {
    const url = new URL(repo);
    if (!url.hostname.toLowerCase().includes("codeup")) return "";
    return url.pathname.replace(/^\/+|\/+$/g, "").replace(/\.git$/i, "");
  } catch {
    return "";
  }
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function readJsonBody(req, maxBytes = 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new YunxiaoError("请求内容过大", 413);
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    return value && typeof value === "object" ? value : {};
  } catch {
    throw new YunxiaoError("请求 JSON 格式错误", 400);
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

async function showWindowsNotification(title, body, options = {}) {
  const platform = options.platform || process.platform;
  if (platform !== "win32") return { supported: false, accepted: false, channel: "unsupported" };
  const spawnProcess = options.spawnProcess || spawn;
  const safeTitle = cleanText(title, 100) || "云效缺陷提醒";
  const safeBody = cleanText(body, 500) || "有新的缺陷需要处理";
  const script = String.raw`
$ErrorActionPreference = 'Stop'
$title = [Environment]::GetEnvironmentVariable('DYX_NOTIFICATION_TITLE')
$body = [Environment]::GetEnvironmentVariable('DYX_NOTIFICATION_BODY')
$shown = $false
try {
  $app = Get-StartApps | Where-Object { $_.Name -match 'DeepSeek|Harness' } | Select-Object -First 1
  if ($app -and $app.AppID) {
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] > $null
    $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
    $xml.LoadXml('<toast><visual><binding template="ToastGeneric"><text></text><text></text></binding></visual></toast>')
    $texts = $xml.GetElementsByTagName('text')
    $null = $texts.Item(0).AppendChild($xml.CreateTextNode($title))
    $null = $texts.Item(1).AppendChild($xml.CreateTextNode($body))
    $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier([string]$app.AppID).Show($toast)
    $shown = $true
  }
} catch {}
if (-not $shown) {
  Add-Type -AssemblyName System.Windows.Forms
  Add-Type -AssemblyName System.Drawing
  $notify = New-Object System.Windows.Forms.NotifyIcon
  try {
    $notify.Icon = [System.Drawing.SystemIcons]::Information
    $notify.Text = '云效缺陷提醒'
    $notify.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
    $notify.BalloonTipTitle = $title
    $notify.BalloonTipText = $body
    $notify.Visible = $true
    $notify.ShowBalloonTip(10000)
    Start-Sleep -Seconds 10
  } finally {
    $notify.Dispose()
  }
}`;
  const encoded = Buffer.from(script, "utf16le").toString("base64");
  const child = spawnProcess("powershell.exe", [
    "-NoLogo",
    "-NoProfile",
    "-NonInteractive",
    "-Sta",
    "-WindowStyle",
    "Hidden",
    "-ExecutionPolicy",
    "Bypass",
    "-EncodedCommand",
    encoded
  ], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
    env: {
      ...process.env,
      DYX_NOTIFICATION_TITLE: safeTitle,
      DYX_NOTIFICATION_BODY: safeBody
    }
  });
  return new Promise((resolve, reject) => {
    child.once("error", (error) => reject(new YunxiaoError(`Windows 原生通知启动失败：${error.message}`, 500)));
    child.once("spawn", () => {
      if (typeof child.unref === "function") child.unref();
      resolve({ supported: true, accepted: true, channel: "windows-native" });
    });
  });
}

function createRpc(store, api, systemNotifier = showWindowsNotification) {
  async function accountAndProject(args) {
    const account = await store.getAccount(args.accountId);
    const projectId = cleanText(args.projectId || account.selectedProject?.id, 128);
    if (!projectId) throw new YunxiaoError("请先选择项目", 422);
    return { account, projectId };
  }

  async function cached(accountId, key, loader) {
    try {
      const value = await loader();
      await store.putCache(accountId, key, value);
      return { ...value, stale: false, cachedAt: new Date().toISOString() };
    } catch (error) {
      const cachedValue = await store.getCache(accountId, key);
      if (!cachedValue) throw error;
      const value = cachedValue.value;
      return value && typeof value === "object"
        ? { ...value, stale: true, cachedAt: cachedValue.savedAt, warning: error instanceof Error ? error.message : String(error) }
        : value;
    }
  }

  return async function rpc(method, args = {}) {
    switch (method) {
      case "state.get":
        return store.publicState();
      case "system.notification.show":
        return systemNotifier(args.title, args.body);
      case "account.save":
        return store.saveAccount(args);
      case "account.select":
        return store.selectAccount(args.accountId);
      case "account.delete":
        return store.deleteAccount(args.accountId);
      case "projects.list": {
        const account = await store.getAccount(args.accountId);
        const result = await cached(account.id, "projects", async () => ({ items: await api.listProjects(account) }));
        const selectedId = account.selectedProject?.id || "";
        return { ...result, items: (result.items || []).map((item) => ({ ...item, selected: item.id === selectedId })) };
      }
      case "project.select":
        return store.selectProject(args.accountId, args.project || {});
      case "defect.notification.settings.update": {
        const { account, projectId } = await accountAndProject(args);
        const settings = normalizeDefectNotification(args);
        if (settings.enabled && settings.targetStatuses.length < 2) {
          settings.targetStatuses = await api.resolveNotificationStatuses(account, projectId);
        }
        return store.saveDefectNotification(account.id, projectId, settings);
      }
      case "defect.notification.scan": {
        const { account, projectId } = await accountAndProject(args);
        const stored = normalizeDefectNotification(account.projectSettings?.[projectId]?.defectNotification);
        if (stored.targetStatuses.length < 2) {
          stored.targetStatuses = await api.resolveNotificationStatuses(account, projectId);
          await store.saveDefectNotification(account.id, projectId, stored);
        }
        const assignedToId = cleanText(args.assignedToId, 128);
        const results = await Promise.all(stored.targetStatuses.map((status) => api.listDefects(account, projectId, {
          page: 1,
          pageSize: 100,
          assignedToId,
          statusId: status.id,
          orderBy: "gmtModified"
        })));
        const items = Array.from(new Map(results.flatMap((result) => result.items || [])
          .filter((item) => item.id)
          .map((item) => [item.id, item])).values());
        const assignees = Array.from(new Map(items
          .filter((item) => item.assignedToId && item.assignedToName)
          .map((item) => [item.assignedToId, { id: item.assignedToId, name: item.assignedToName }])).values());
        return {
          items,
          ids: items.map((item) => item.id).filter(Boolean),
          assignees,
          statuses: stored.targetStatuses,
          checkedAt: new Date().toISOString(),
          page: 1,
          pageSize: 100,
          queryCount: stored.targetStatuses.length
        };
      }
      case "defect.notification.assignees": {
        const { account, projectId } = await accountAndProject(args);
        const result = await api.listDefects(account, projectId, { page: 1, pageSize: 100 });
        return Array.from(new Map((result.items || [])
          .filter((item) => item.assignedToId && item.assignedToName)
          .map((item) => [item.assignedToId, { id: item.assignedToId, name: item.assignedToName }])).values());
      }
      case "defects.list": {
        const { account, projectId } = await accountAndProject(args);
        const cacheQuery = {
          page: clampInteger(args.page, 1, 1, 10_000),
          pageSize: clampInteger(args.pageSize, 20, 1, 100),
          serialNumber: cleanText(args.serialNumber, 255),
          subject: cleanText(args.subject, 255),
          statusId: cleanText(args.statusId, 128),
          assignedToId: cleanText(args.assignedToId, 128)
        };
        const key = `defects:${projectId}:${JSON.stringify(cacheQuery)}`;
        return cached(account.id, key, () => api.listDefects(account, projectId, args));
      }
      case "defect.get": {
        const { account, projectId } = await accountAndProject(args);
        const defectId = cleanText(args.defectId, 128);
        if (!defectId) throw new YunxiaoError("缺陷 ID 不能为空", 422);
        return api.getDefect(account, projectId, defectId);
      }
      case "defect.statuses": {
        const { account, projectId } = await accountAndProject(args);
        const defectId = cleanText(args.defectId, 128);
        if (!defectId) throw new YunxiaoError("缺陷 ID 不能为空", 422);
        return api.getDefectStatuses(account, projectId, defectId);
      }
      case "defect.status.update": {
        const { account, projectId } = await accountAndProject(args);
        const defectId = cleanText(args.defectId, 128);
        const statusId = cleanText(args.statusId, 128);
        if (!defectId || !statusId) throw new YunxiaoError("缺陷 ID 和状态 ID 不能为空", 422);
        return api.updateDefectStatus(account, projectId, defectId, statusId);
      }
      case "defect.comment.create": {
        const { account, projectId } = await accountAndProject(args);
        const defectId = cleanText(args.defectId, 128);
        const content = cleanTextPreserve(args.content, 10_000).trim();
        if (!defectId) throw new YunxiaoError("缺陷 ID 不能为空", 422);
        if (!content) throw new YunxiaoError("评论内容不能为空", 422);
        return api.createDefectComment(account, projectId, defectId, content);
      }
      case "pipelines.list": {
        const { account } = await accountAndProject(args);
        return cached(account.id, "pipelines", () => api.listPipelines(account, args));
      }
      case "pipeline.get": {
        const { account } = await accountAndProject(args);
        return api.getPipeline(account, cleanText(args.pipelineId, 128));
      }
      case "pipeline.branches": {
        const { account } = await accountAndProject(args);
        return api.listPipelineBranches(account, cleanText(args.pipelineId, 128));
      }
      case "pipeline.runs": {
        const { account } = await accountAndProject(args);
        return api.listPipelineRuns(account, cleanText(args.pipelineId, 128), args);
      }
      case "pipeline.run.get": {
        const { account } = await accountAndProject(args);
        return api.getPipelineRun(account, cleanText(args.pipelineId, 128), cleanText(args.pipelineRunId, 128));
      }
      case "pipeline.log": {
        const { account } = await accountAndProject(args);
        return api.getPipelineJobLog(
          account,
          cleanText(args.pipelineId, 128),
          cleanText(args.pipelineRunId, 128),
          cleanText(args.jobId, 128)
        );
      }
      case "pipeline.run.create": {
        const { account } = await accountAndProject(args);
        return api.createPipelineRun(account, cleanText(args.pipelineId, 128), args);
      }
      default:
        throw new YunxiaoError(`未知操作：${cleanText(method, 100)}`, 404);
    }
  };
}

function registerTools(ctx, rpc, timeoutMs) {
  ctx.tools.register({
    name: "yunxiao_list_defects",
    description: "读取当前已配置云效账号和项目的缺陷列表，可按编号或标题筛选。账号和项目默认使用插件工作台中的当前选择。",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        serialNumber: { type: "string", description: "缺陷编号关键词" },
        subject: { type: "string", description: "缺陷标题关键词" },
        page: { type: "number", description: "页码，默认 1" },
        pageSize: { type: "number", description: "每页数量，默认 20，最多 100" }
      }
    },
    timeoutMs: timeoutMs + 5000,
    isConcurrencySafe: () => true,
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_args, value) => [{ type: "text", text: JSON.stringify(value, null, 2) }]
    },
    execute: async (args) => rpc("defects.list", args)
  });

  ctx.tools.register({
    name: "yunxiao_list_pipelines",
    description: "读取当前云效组织中可访问的流水线列表。",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        keyword: { type: "string", description: "流水线名称关键词" },
        page: { type: "number", description: "页码，默认 1" },
        pageSize: { type: "number", description: "每页数量，默认 20，最多 30" }
      }
    },
    timeoutMs: timeoutMs + 5000,
    isConcurrencySafe: () => true,
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_args, value) => [{ type: "text", text: JSON.stringify(value, null, 2) }]
    },
    execute: async (args) => rpc("pipelines.list", args)
  });
}

function apply(ctx, suppliedConfig = {}) {
  const config = {
    dataFile: cleanText(suppliedConfig.dataFile || DEFAULTS.dataFile, 2000),
    apiBaseUrl: cleanText(suppliedConfig.apiBaseUrl || DEFAULTS.apiBaseUrl, 2000),
    timeoutMs: clampInteger(suppliedConfig.timeoutMs, DEFAULTS.timeoutMs, 5000, 120_000),
    cacheMaxItems: clampInteger(suppliedConfig.cacheMaxItems, DEFAULTS.cacheMaxItems, 10, 500)
  };
  if (!config.dataFile) throw new Error("dsh-yunxiao dataFile 不能为空");
  if (!/^https:\/\//i.test(config.apiBaseUrl)) throw new Error("dsh-yunxiao apiBaseUrl 必须使用 https://");

  const store = createJsonStore(config.dataFile, config.cacheMaxItems);
  const api = createApiClient(config);
  const rpc = createRpc(store, api);
  registerTools(ctx, rpc, config.timeoutMs);

  ctx.inject(["webServer"], (httpCtx) => {
    httpCtx.effect(() => httpCtx.webServer.register({
      kind: "exact",
      path: "/api/d-yunxiao/rpc",
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
          const status = error instanceof YunxiaoError ? error.status : 500;
          const message = error instanceof Error ? error.message : String(error);
          writeJson(res, status >= 400 && status < 600 ? status : 500, { ok: false, message });
        }
      }
    }), "dsh-yunxiao: rpc route");
  });
}

export {
  DEFAULTS,
  YunxiaoError,
  apply,
  cleanMapping,
  createApiClient,
  createJsonStore,
  createRpc,
  extractStatuses,
  inlineFileIds,
  inject,
  mapDefect,
  mapPipeline,
  mapPipelineRun,
  isNotifiableDefectStatus,
  normalizeDefectNotification,
  showWindowsNotification,
  name
};
