import assert from "node:assert/strict";
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
  mapDefect,
  mapPipelineRun
} from "../dist/index.js";

test("client uses the native sidebar trigger and a stable reserved right panel", async () => {
  const source = await readFile(new URL("../dist/client.js", import.meta.url), "utf8");
  assert.match(source, /sidebar\.footer\.action/);
  assert.match(source, /shell\.overlay/);
  assert.match(source, /layout\.openDetails\(\)/);
  assert.match(source, /layout\.closeDetails\(\)/);
  assert.match(source, /dyx-right-panel/);
  assert.match(source, /defect\.statuses/);
  assert.match(source, /assignedToId/);
  assert.match(source, /dyx-inline-status/);
  const runForm = source.slice(source.indexOf("function openRunPipeline"), source.indexOf("function openPipelineRun"));
  assert.match(runForm, /pipeline\.branches/);
  assert.match(runForm, /运行分支/);
  assert.doesNotMatch(runForm, /window\.confirm|环境变量|envInput|envs:/);
  assert.doesNotMatch(source, /dyx-launch/);
  assert.doesNotMatch(source, /ctx\.slots\.register\(\{ name: "details" \}/);
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

  const publicState = await store.publicState();
  assert.equal(publicState.accounts[0].hasToken, true);
  assert.equal(publicState.accounts[0].token, undefined);
  assert.deepEqual(publicState.accounts[0].selectedProject, { id: "project-1", name: "演示项目" });

  const text = await readFile(file, "utf8");
  const persisted = JSON.parse(text);
  assert.equal(persisted.accounts[0].token, "secret-token");
  assert.equal(persisted.selectedAccountId, account.id);
});

test("RPC uses current account/project and falls back to persisted list cache", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "dsh-yunxiao-rpc-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const store = createJsonStore(path.join(directory, "data.json"), 100);
  const account = await store.saveAccount({ name: "主账号", organizationId: "org", token: "token" });
  await store.selectProject(account.id, { id: "p1", name: "项目一" });

  let fail = false;
  const api = {
    listProjects: async () => [{ id: "p1", name: "项目一" }],
    listDefects: async (_account, projectId) => {
      if (fail) throw new Error("offline");
      return { items: [{ id: "bug-1", projectId }], total: 1, page: 1, pageSize: 20 };
    },
    listPipelines: async () => ({ items: [], total: 0, page: 1, pageSize: 20 }),
    getDefect: async () => ({}),
    getDefectStatuses: async () => [],
    updateDefectStatus: async () => ({}),
    getPipeline: async () => ({}),
    listPipelineBranches: async () => [],
    listPipelineRuns: async () => ({ items: [] }),
    getPipelineRun: async () => ({}),
    getPipelineJobLog: async () => ({}),
    createPipelineRun: async () => ({})
  };
  const rpc = createRpc(store, api);

  const fresh = await rpc("defects.list", {});
  assert.equal(fresh.items[0].projectId, "p1");
  assert.equal(fresh.stale, false);

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
    customFieldValues: [{ fieldName: "优先级", values: [{ displayValue: "P1" }] }]
  });
  assert.equal(defect.statusName, "处理中");
  assert.equal(defect.assignedToName, "张三");
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
  const body = JSON.parse(calls[0].options.body);
  const filters = JSON.parse(body.conditions).conditionGroups[0];
  assert.deepEqual(filters.map((item) => [item.fieldIdentifier, item.value[0]]), [
    ["serialNumber", "BUG-12"],
    ["subject", "登录"],
    ["status", "doing"],
    ["assignedTo", "u1"]
  ]);
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
