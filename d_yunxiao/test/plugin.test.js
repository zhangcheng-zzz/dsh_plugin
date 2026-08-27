import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import test from "node:test";

import {
  apply,
  createApiClient,
  createJsonStore,
  createRpc,
  extractStatuses,
  inlineFileIds,
  isNotifiableDefectStatus,
  mapDefect,
  mapPipelineRun,
  normalizeDefectNotification,
  openWindowsNotificationSettings,
  showWindowsNotification
} from "../dist/index.js";

test("client uses the native sidebar trigger and a stable reserved right panel", async () => {
  const source = await readFile(new URL("../dist/client.js", import.meta.url), "utf8");
  assert.match(source, /sidebar\.footer\.action/);
  assert.match(source, /shell\.overlay/);
  assert.match(source, /layout\.openDetails\(\)/);
  assert.match(source, /layout\.closeDetails\(\)/);
  assert.match(source, /dyx-right-panel/);
  assert.match(source, /\.dyx-right-panel\{[^}]*width:var\(--dyx-workspace-width,480px\)/);
  assert.match(source, /data-dyx-workspace-open/);
  assert.match(source, /dsh-yunxiao:panel-width/);
  assert.match(source, /dyx-resize-handle/);
  assert.match(source, /onPointerDown: beginResize/);
  assert.match(source, /localStorage\.setItem/);
  assert.match(source, /defect\.statuses/);
  assert.match(source, /defect\.comment\.create/);
  assert.match(source, /发布评论/);
  assert.match(source, /event\.ctrlKey \|\| event\.metaKey/);
  assert.match(source, /assignedToId/);
  assert.match(source, /dyx-inline-status/);
  assert.match(source, /dyx-status-pending/);
  assert.match(source, /dyx-status-processing/);
  assert.match(source, /dyx-status-reopened/);
  assert.match(source, /function applyDefectStatusTone/);
  assert.match(source, /function applyDefectRecordTone/);
  assert.match(source, /dyx-record-status-pending/);
  assert.match(source, /dyx-record-status-processing/);
  assert.match(source, /dyx-record-status-reopened/);
  assert.match(source, /function createDefectNotifier/);
  assert.match(source, /defect\.notification\.scan/);
  assert.match(source, /new window\.Notification/);
  assert.match(source, /system\.notification\.show/);
  assert.match(source, /已提交给 Windows 原生通知/);
  assert.match(source, /__dsh_native_notification_bridge__/);
  assert.match(source, /requireInteraction: true/);
  assert.match(source, /Date\.now\(\)/);
  assert.match(source, /新增 " \+ count \+ " 个缺陷需修复/);
  assert.match(source, /dyx-sidebar-trigger-count/);
  assert.match(source, /dyx-global-notice/);
  assert.match(source, /var addedIds = ids\.filter/);
  assert.match(source, /seenByScope\.set\(scope, new Set\(ids\)\)/);
  assert.match(source, /dyx-card-title/);
  assert.match(source, /刷新缺陷检查/);
  assert.match(source, /dyx-notify-stats/);
  assert.match(source, /当前 " \+ noticeState\.lastResultCount \+ " 条未处理/);
  assert.match(source, /lastWindowsStatus/);
  assert.match(source, /options\.onOpen\(items \|\| \[\]\)/);
  assert.match(source, /function openNotifiedDefects/);
  assert.match(source, /openDefect\(values\[0\]\)/);
  assert.match(source, /activeWorkspace\.openNotifiedDefects/);
  const runForm = source.slice(source.indexOf("function openRunPipeline"), source.indexOf("function openPipelineRun"));
  assert.match(runForm, /pipeline\.branches/);
  assert.match(runForm, /运行分支/);
  assert.match(runForm, /var control = node\("select", "dyx-select"\)/);
  assert.doesNotMatch(runForm, /留空使用默认配置/);
  assert.doesNotMatch(runForm, /window\.confirm|环境变量|envInput|envs:/);
  assert.doesNotMatch(source, /dyx-launch/);
  assert.doesNotMatch(source, /ctx\.slots\.register\(\{ name: "details" \}/);
  const defectFilters = source.slice(source.indexOf("function renderDefects"), source.indexOf("function defectTable"));
  assert.match(defectFilters, /dyx-defect-filters/);
  assert.match(defectFilters, /清空" \+ label/);
  assert.match(defectFilters, /请选择状态/);
  assert.match(defectFilters, /请选择负责人/);
  assert.match(defectFilters, /select\.addEventListener\("change"/);
  assert.doesNotMatch(defectFilters, /全部状态|全部负责人|缺陷编号|标题关键词|button\("查询"|button\("清空"/);
  assert.match(source, /cache: "no-store"/);
  assert.match(source, /dateValue\(right\.gmtCreate \|\| right\.gmtModified\) - dateValue\(left\.gmtCreate \|\| left\.gmtModified\)/);
  const listStatus = source.slice(source.indexOf("function saveListStatus"), source.indexOf("function pager"));
  assert.match(listStatus, /loadDefects\(\)/);
  const detailStatusStart = source.indexOf("function renderDefectDetail");
  const detailStatus = source.slice(detailStatusStart, source.indexOf("var meta = node", detailStatusStart));
  assert.match(detailStatus, /select\.addEventListener\("change"/);
  assert.match(detailStatus, /loadDefects\(\)/);
  assert.doesNotMatch(detailStatus, /保存状态/);
  assert.match(detailStatus, /defect\.members/);
  assert.match(detailStatus, /defect\.assignee\.update/);
  assert.match(detailStatus, /fillDetailAssignee\(assigneeSelect\)/);
  assert.match(source.slice(detailStatusStart, source.indexOf("function renderPipelines")), /最近修改人/);
});

test("Windows notification settings helper opens the native settings page", async () => {
  let invocation;
  let unrefCalled = false;
  const child = new EventEmitter();
  child.unref = () => { unrefCalled = true; };
  const resultPromise = openWindowsNotificationSettings({
    platform: "win32",
    spawnProcess(command, args, options) {
      invocation = { command, args, options };
      queueMicrotask(() => child.emit("spawn"));
      return child;
    }
  });
  assert.deepEqual(await resultPromise, { supported: true, accepted: true });
  assert.equal(invocation.command, "explorer.exe");
  assert.deepEqual(invocation.args, ["ms-settings:notifications"]);
  assert.equal(invocation.options.windowsHide, true);
  assert.equal(unrefCalled, true);
});

test("Windows notification helper starts a hidden native notifier with safe text transport", async () => {
  let invocation;
  let unrefCalled = false;
  const child = new EventEmitter();
  child.unref = () => { unrefCalled = true; };
  const promise = showWindowsNotification("云效缺陷提醒", "新增 1 个缺陷需修复", {
    platform: "win32",
    spawnProcess(command, args, options) {
      invocation = { command, args, options };
      queueMicrotask(() => child.emit("spawn"));
      return child;
    }
  });
  const result = await promise;
  assert.deepEqual(result, { supported: true, accepted: true, channel: "windows-toast" });
  assert.equal(invocation.command, "powershell.exe");
  assert.equal(invocation.options.windowsHide, true);
  assert.notEqual(invocation.options.detached, true);
  assert.equal(invocation.options.stdio, "ignore");
  assert.equal(invocation.options.env.DYX_NOTIFICATION_BODY, "新增 1 个缺陷需修复");
  assert.match(invocation.options.env.DYX_NOTIFICATION_TAG, /^dyx-/);
  const script = Buffer.from(invocation.args.at(-1), "base64").toString("utf16le");
  assert.match(script, /ToastNotificationManager/);
  assert.match(script, /scenario="urgent"/);
  assert.match(script, /io\.github\.hairyf\.deepseek-harness-desktop/);
  assert.match(script, /ToastNotifier\(\$appId\)\.Show\(\$toast\)/);
  assert.doesNotMatch(script, /System\.Windows\.Forms/);
  assert.equal(unrefCalled, true);
  assert.deepEqual(await showWindowsNotification("title", "body", { platform: "linux" }), {
    supported: false,
    accepted: false,
    channel: "unsupported"
  });
});

test("plugin apply registers two tools and the Web RPC route", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "dsh-yunxiao-apply-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const tools = [];
  let route;
  const ctx = {
    tools: { register(value) { tools.push(value); } },
    inject(_dependencies, callback) {
      callback({
        webServer: { register(value) { route = value; return () => {}; } },
        effect(effect) { return effect(); }
      });
    }
  };

  apply(ctx, { dataFile: path.join(directory, "data.json") });
  assert.deepEqual(tools.map((item) => item.name), ["yunxiao_list_defects", "yunxiao_list_pipelines"]);
  assert.equal(route.path, "/api/d-yunxiao/rpc");

  const req = Readable.from([Buffer.from(JSON.stringify({ method: "state.get", args: {} }))]);
  req.method = "POST";
  let status;
  let body;
  await route.handler(req, {
    writeHead(value) { status = value; },
    end(value) { body = value; }
  });
  assert.equal(status, 200);
  assert.deepEqual(JSON.parse(body).data.accounts, []);
});

test("JSON store persists accounts and project selection without exposing token", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "dsh-yunxiao-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "data.json");
  const store = createJsonStore(file, 100);

  const account = await store.saveAccount({
    name: "研发账号",
    organizationId: "org-1",
    token: "secret-token",
    remark: "测试"
  });
  await store.selectProject(account.id, { id: "project-1", name: "演示项目" });
  await store.saveDefectNotification(account.id, "project-1", {
    enabled: true,
    assignedToId: "u1",
    assignedToName: "张三",
    intervalMinutes: 10,
    targetStatuses: [{ id: "pending", name: "待确认" }, { id: "reopened", name: "再次打开" }]
  });

  const publicState = await store.publicState();
  assert.equal(publicState.accounts[0].hasToken, true);
  assert.equal(publicState.accounts[0].token, undefined);
  assert.deepEqual(publicState.accounts[0].selectedProject, { id: "project-1", name: "演示项目" });
  assert.deepEqual(publicState.accounts[0].defectNotification, {
    enabled: true,
    assignedToId: "u1",
    assignedToName: "张三",
    intervalMinutes: 10,
    targetStatuses: [{ id: "pending", name: "待确认" }, { id: "reopened", name: "再次打开" }]
  });

  const text = await readFile(file, "utf8");
  const persisted = JSON.parse(text);
  assert.equal(persisted.accounts[0].token, "secret-token");
  assert.equal(persisted.selectedAccountId, account.id);
  assert.equal(persisted.accounts[0].projectSettings["project-1"].defectNotification.intervalMinutes, 10);
});

test("RPC uses current account/project and falls back to persisted list cache", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "dsh-yunxiao-rpc-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const store = createJsonStore(path.join(directory, "data.json"), 100);
  const account = await store.saveAccount({ name: "主账号", organizationId: "org", token: "token" });
  await store.selectProject(account.id, { id: "p1", name: "项目一" });

  let fail = false;
  const createdComments = [];
  const defectQueries = [];
  const api = {
    listProjects: async () => [{ id: "p1", name: "项目一" }],
    listDefects: async (_account, projectId, query = {}) => {
      defectQueries.push(query);
      if (fail) throw new Error("offline");
      return { items: [{ id: "bug-1", projectId, statusName: "待确认", assignedToId: "u1", assignedToName: "张三" }], total: 1, page: 1, pageSize: 20 };
    },
    listPipelines: async () => ({ items: [], total: 0, page: 1, pageSize: 20 }),
    getDefect: async () => ({}),
    getDefectStatuses: async () => [],
    updateDefectStatus: async () => ({}),
    createDefectComment: async (_account, projectId, defectId, content) => {
      createdComments.push({ projectId, defectId, content });
      return { id: "comment-1", projectId, defectId };
    },
    getPipeline: async () => ({}),
    listPipelineBranches: async () => [],
    listPipelineRuns: async () => ({ items: [] }),
    getPipelineRun: async () => ({}),
    getPipelineJobLog: async () => ({}),
    createPipelineRun: async () => ({})
  };
  const nativeNotifications = [];
  const rpc = createRpc(store, api, async (title, body) => {
    nativeNotifications.push({ title, body });
    return { supported: true, accepted: true, channel: "windows-native" };
  });

  const nativeNotification = await rpc("system.notification.show", { title: "云效缺陷提醒", body: "测试通知" });
  assert.equal(nativeNotification.accepted, true);
  assert.deepEqual(nativeNotifications, [{ title: "云效缺陷提醒", body: "测试通知" }]);

  const fresh = await rpc("defects.list", {});
  assert.equal(fresh.items[0].projectId, "p1");
  assert.equal(fresh.stale, false);

  const notificationSettings = await rpc("defect.notification.settings.update", {
    enabled: true,
    assignedToId: "u1",
    assignedToName: "张三",
    intervalMinutes: 15,
    targetStatuses: [{ id: "pending", name: "待确认" }, { id: "reopened", name: "再次打开" }]
  });
  assert.equal(notificationSettings.enabled, true);
  assert.equal(notificationSettings.intervalMinutes, 15);
  const scan = await rpc("defect.notification.scan", { assignedToId: "u1" });
  assert.deepEqual(scan.ids, ["bug-1"]);
  assert.deepEqual(scan.assignees, [{ id: "u1", name: "张三" }]);
  assert.deepEqual(scan.statuses, [{ id: "pending", name: "待确认" }, { id: "reopened", name: "再次打开" }]);
  assert.equal(scan.page, 1);
  assert.equal(scan.pageSize, 100);
  assert.equal(scan.queryCount, 2);
  assert.deepEqual(defectQueries.slice(-2).map((item) => item.statusId), ["pending", "reopened"]);
  assert.ok(defectQueries.slice(-2).every((item) => item.orderBy === "gmtModified" && item.pageSize === 100 && item.assignedToId === "u1"));

  const comment = await rpc("defect.comment.create", { defectId: "bug-1", content: "  请验证修复。  " });
  assert.equal(comment.id, "comment-1");
  assert.deepEqual(createdComments, [{ projectId: "p1", defectId: "bug-1", content: "请验证修复。" }]);
  await assert.rejects(() => rpc("defect.comment.create", { defectId: "bug-1", content: "   " }), /评论内容不能为空/);

  fail = true;
  const cached = await rpc("defects.list", {});
  assert.equal(cached.items[0].id, "bug-1");
  assert.equal(cached.stale, true);
  assert.match(cached.warning, /offline/);
});

test("defect and pipeline normalizers preserve useful fields and mask secrets", () => {
  const defect = mapDefect("p1", {
    id: "bug-1",
    serialNumber: "BUG-1",
    subject: "登录失败",
    status: { id: "doing", displayName: "处理中" },
    assignedTo: { id: "u1", name: "张三" },
    modifier: { id: "u2", name: "李四" },
    customFieldValues: [{ fieldName: "优先级", values: [{ displayValue: "P1" }] }]
  });
  assert.equal(defect.statusName, "处理中");
  assert.equal(defect.assignedToName, "张三");
  assert.equal(defect.modifierName, "李四");
  assert.equal(defect.priority, "P1");

  const run = mapPipelineRun({
    pipelineId: 3,
    pipelineRunId: 9,
    status: "RUNNING",
    globalParams: [
      { key: "TOKEN", value: "plain", encrypted: true },
      { key: "MODE", value: "test", encrypted: false }
    ]
  });
  assert.equal(run.pipelineRunId, "9");
  assert.equal(run.globalParams[0].value, "******");
  assert.equal(run.globalParams[1].value, "test");
});

test("notification settings and target statuses are normalized", () => {
  assert.deepEqual(normalizeDefectNotification({ enabled: 1, intervalMinutes: 0 }), {
    enabled: true,
    assignedToId: "",
    assignedToName: "",
    intervalMinutes: 1,
    targetStatuses: []
  });
  assert.equal(isNotifiableDefectStatus("待确认"), true);
  assert.equal(isNotifiableDefectStatus("再次打开"), true);
  assert.equal(isNotifiableDefectStatus("REOPENED"), true);
  assert.equal(isNotifiableDefectStatus("处理中"), false);
});

test("status extraction accepts nested workflow response shapes", () => {
  assert.deepEqual(
    extractStatuses({ data: { workflows: [{ statuses: [{ id: "done", displayName: "已完成" }] }] } }),
    [{ id: "done", displayName: "已完成" }]
  );
});

test("inline rich-text attachment identifiers are detected without duplicates", () => {
  assert.deepEqual(inlineFileIds([
    '<img data-file-id="inline-file-123456">',
    "https://example.test/files/inline-file-123456?download=1",
    "https://example.test/image?fileIdentifier=another-file-123"
  ]), ["inline-file-123456", "another-file-123"]);
});

test("API client sends the official defect search contract", async (t) => {
  const previousFetch = globalThis.fetch;
  const calls = [];
  t.after(() => { globalThis.fetch = previousFetch; });
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "content-type": "application/json", "x-total-count": "0" }
    });
  };
  const client = createApiClient({
    apiBaseUrl: "https://openapi-rdc.aliyuncs.com",
    timeoutMs: 5000
  });
  await client.listDefects(
    { organizationId: "org-1", token: "token" },
    "project-1",
    { serialNumber: "BUG-12", subject: "登录", statusId: "doing", assignedToId: "u1" }
  );

  assert.match(calls[0].url, /workitems:search$/);
  assert.equal(calls[0].options.headers["x-yunxiao-token"], "token");
  assert.equal(calls[0].options.headers["cache-control"], "no-cache");
  assert.equal(calls[0].options.cache, "no-store");
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.orderBy, "gmtCreate");
  assert.equal(body.sort, "desc");
  const filters = JSON.parse(body.conditions).conditionGroups[0];
  assert.deepEqual(filters.map((item) => [item.fieldIdentifier, item.value[0]]), [
    ["serialNumber", "BUG-12"],
    ["subject", "登录"],
    ["status", "doing"],
    ["assignedTo", "u1"]
  ]);

  await client.listDefects(
    { organizationId: "org-1", token: "token" },
    "project-1",
    { page: 1, pageSize: 100, orderBy: "gmtModified" }
  );
  assert.equal(JSON.parse(calls[1].options.body).orderBy, "gmtModified");
  assert.equal(JSON.parse(calls[1].options.body).perPage, 100);
});

test("notification status IDs are resolved before filtered polling", async (t) => {
  const previousFetch = globalThis.fetch;
  const calls = [];
  t.after(() => { globalThis.fetch = previousFetch; });
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    return new Response(JSON.stringify([
      { id: "bug-1", status: { id: "pending-id", displayName: "待确认" } },
      { id: "bug-2", status: { id: "reopened-id", displayName: "再次打开" } }
    ]), { status: 200, headers: { "content-type": "application/json" } });
  };
  const client = createApiClient({ apiBaseUrl: "https://openapi-rdc.aliyuncs.com", timeoutMs: 5000 });
  const statuses = await client.resolveNotificationStatuses(
    { organizationId: "org-1", token: "token" },
    "project-1"
  );
  assert.deepEqual(statuses, [
    { id: "pending-id", name: "待确认" },
    { id: "reopened-id", name: "再次打开" }
  ]);
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.orderBy, "gmtModified");
  assert.equal(body.perPage, 100);
});

test("API client reads workflow statuses without loading comments and updates list status", async (t) => {
  const previousFetch = globalThis.fetch;
  const calls = [];
  t.after(() => { globalThis.fetch = previousFetch; });
  globalThis.fetch = async (url, options = {}) => {
    const value = String(url);
    const method = options.method || "GET";
    calls.push({ url: value, method, body: options.body });
    if (value.endsWith("/workflow")) {
      return new Response(JSON.stringify({ statuses: [
        { id: "doing", displayName: "处理中" },
        { id: "done", displayName: "已完成" }
      ] }), { status: 200, headers: { "content-type": "application/json" } });
    }
    if (method === "PUT") {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
    }
    const updated = calls.some((item) => item.method === "PUT");
    return new Response(JSON.stringify({
      id: "bug-1",
      serialNumber: "BUG-1",
      subject: "登录失败",
      status: { id: updated ? "done" : "doing", displayName: updated ? "已完成" : "处理中" },
      assignedTo: { id: "u1", name: "张三" },
      space: { id: "project-1" },
      workitemType: { id: "type-1" }
    }), { status: 200, headers: { "content-type": "application/json" } });
  };
  const client = createApiClient({ apiBaseUrl: "https://openapi-rdc.aliyuncs.com", timeoutMs: 5000 });
  const account = { organizationId: "org-1", token: "token" };

  const statuses = await client.getDefectStatuses(account, "project-1", "bug-1");
  assert.deepEqual(statuses, [
    { id: "doing", name: "处理中" },
    { id: "done", name: "已完成" }
  ]);
  assert.equal(calls.some((item) => /comments|attachments/.test(item.url)), false);

  const updated = await client.updateDefectStatus(account, "project-1", "bug-1", "done");
  const updateCall = calls.find((item) => item.method === "PUT");
  assert.deepEqual(JSON.parse(updateCall.body), { status: "done" });
  assert.equal(updated.statusId, "done");
});

test("API client updates defect assignee and lists project members without duplicates", async (t) => {
  const previousFetch = globalThis.fetch;
  const calls = [];
  t.after(() => { globalThis.fetch = previousFetch; });
  globalThis.fetch = async (url, options = {}) => {
    const value = String(url);
    const method = options.method || "GET";
    calls.push({ url: value, method, body: options.body });
    if (method === "PUT") {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
    }
    if (value.endsWith("/members")) {
      return new Response(JSON.stringify([
        { roleId: "project.admin", roleName: "管理员", userId: "u2", userName: "李四" },
        { roleId: "project.member", roleName: "开发", userId: "u2", userName: "李四" },
        { roleId: "project.member", roleName: "开发", userId: "u1", userName: "张三" }
      ]), { status: 200, headers: { "content-type": "application/json" } });
    }
    const updated = calls.some((item) => item.method === "PUT");
    return new Response(JSON.stringify({
      id: "bug-1",
      serialNumber: "BUG-1",
      subject: "登录失败",
      status: { id: "doing", displayName: "处理中" },
      assignedTo: { id: updated ? "u2" : "u1", name: updated ? "李四" : "张三" },
      modifier: { id: "me", name: "当前账号" }
    }), { status: 200, headers: { "content-type": "application/json" } });
  };
  const client = createApiClient({ apiBaseUrl: "https://openapi-rdc.aliyuncs.com", timeoutMs: 5000 });
  const account = { organizationId: "org-1", token: "token" };

  const updated = await client.updateDefectAssignee(account, "project-1", "bug/1", "u2");
  const putCall = calls.find((item) => item.method === "PUT");
  assert.match(putCall.url, /workitems\/bug%2F1$/);
  assert.deepEqual(JSON.parse(putCall.body), { assignedTo: "u2" });
  assert.equal(updated.assignedToId, "u2");
  assert.equal(updated.modifierName, "当前账号");

  await assert.rejects(() => client.listProjectMembers(account, ""), /请先选择项目/);
  const members = await client.listProjectMembers(account, "project-1");
  assert.match(calls.at(-1).url, /projects\/project-1\/members$/);
  assert.deepEqual(members, [
    { id: "u2", name: "李四" },
    { id: "u1", name: "张三" }
  ]);
});

test("API client creates a defect comment with the official work-item contract", async (t) => {
  const previousFetch = globalThis.fetch;
  const calls = [];
  t.after(() => { globalThis.fetch = previousFetch; });
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    return new Response(JSON.stringify({ id: "comment-1" }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  };
  const client = createApiClient({ apiBaseUrl: "https://openapi-rdc.aliyuncs.com", timeoutMs: 5000 });
  const created = await client.createDefectComment(
    { organizationId: "org-1", token: "token" },
    "project-1",
    "bug/1",
    "  已完成修复，请验证。  "
  );

  assert.match(calls[0].url, /workitems\/bug%2F1\/comments$/);
  assert.equal(calls[0].options.method, "POST");
  assert.deepEqual(JSON.parse(calls[0].options.body), { content: "已完成修复，请验证。" });
  assert.deepEqual(created, { id: "comment-1", projectId: "project-1", defectId: "bug/1" });
});

test("pipeline branches support nested pipelineConfig sources and run payload omits envs", async (t) => {
  const previousFetch = globalThis.fetch;
  const calls = [];
  t.after(() => { globalThis.fetch = previousFetch; });
  globalThis.fetch = async (url, options = {}) => {
    const value = String(url);
    calls.push({ url: value, options });
    if (value.includes("/repositories/") && value.endsWith("/branches?page=1&perPage=100&sort=updated_desc")) {
      return new Response(JSON.stringify([{ name: "master" }, { name: "release/1.0" }]), {
        status: 200,
        headers: { "content-type": "application/json", "x-total-pages": "1" }
      });
    }
    if (value.endsWith("/pipelines/5208752") && (options.method || "GET") === "GET") {
      return new Response(JSON.stringify({
        id: 5208752,
        name: "web-supply",
        pipelineConfig: {
          settings: "{}",
          sources: [{
            name: "ui-supply_internal",
            label: "学校后台前端",
            sign: "source-1",
            type: "codeup",
            data: {
              repo: "https://codeup.aliyun.com/org/school/ui-supply.git",
              branch: "master",
              isBranchMode: false
            }
          }]
        }
      }), { status: 200, headers: { "content-type": "application/json" } });
    }
    if (value.endsWith("/pipelines/5208752/runs") && options.method === "POST") {
      return new Response(JSON.stringify({ pipelineRunId: 9001 }), { status: 200, headers: { "content-type": "application/json" } });
    }
    throw new Error(`unexpected request: ${options.method || "GET"} ${value}`);
  };
  const client = createApiClient({ apiBaseUrl: "https://openapi-rdc.aliyuncs.com", timeoutMs: 5000 });
  const account = { organizationId: "org-1", token: "token" };

  const sources = await client.listPipelineBranches(account, "5208752");
  assert.deepEqual(sources[0].branches, ["master", "release/1.0"]);
  assert.equal(sources[0].defaultBranch, "master");
  assert.equal(sources[0].name, "学校后台前端");

  const run = await client.createPipelineRun(account, "5208752", {
    runningBranches: { "https://codeup.aliyun.com/org/school/ui-supply.git": "release/1.0" },
    envs: { SHOULD_NOT_BE_SENT: "1" },
    comment: "发布验证"
  });
  const post = calls.find((item) => item.options.method === "POST");
  const params = JSON.parse(JSON.parse(post.options.body).params);
  assert.deepEqual(params, {
    runningBranchs: { "https://codeup.aliyun.com/org/school/ui-supply.git": "release/1.0" },
    comment: "发布验证"
  });
  assert.equal(run.pipelineRunId, "9001");
});

test("pipeline branch errors distinguish PAT scope from repository membership", async (t) => {
  const previousFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = previousFetch; });
  globalThis.fetch = async (url) => {
    const value = String(url);
    if (value.endsWith("/pipelines/1")) {
      return new Response(JSON.stringify({
        id: 1,
        name: "构建",
        pipelineConfig: { sources: [{
          type: "codeup",
          name: "repo",
          data: { repo: "https://codeup.aliyun.com/org/group/repo.git", branch: "main" }
        }] }
      }), { status: 200, headers: { "content-type": "application/json" } });
    }
    if (value.includes("/repositories/org%2Fgroup%2Frepo/branches")) {
      return new Response(JSON.stringify({ errorMessage: "访问的资源无权限" }), {
        status: 403,
        headers: { "content-type": "application/json" }
      });
    }
    if (value.includes("/repositories?page=1&perPage=1")) {
      return new Response(JSON.stringify([]), { status: 200, headers: { "content-type": "application/json" } });
    }
    throw new Error(`unexpected request: ${value}`);
  };
  const client = createApiClient({ apiBaseUrl: "https://openapi-rdc.aliyuncs.com", timeoutMs: 5000 });
  const sources = await client.listPipelineBranches({ organizationId: "org", token: "token" }, "1");
  assert.match(sources[0].warning, /API 权限已生效/);
  assert.match(sources[0].warning, /代码库访问权限/);
  assert.deepEqual(sources[0].branches, []);
});
