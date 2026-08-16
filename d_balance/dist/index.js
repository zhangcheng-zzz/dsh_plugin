// @oh-dsh/d-balance — Host 半（正式 Cordis 插件，非沙箱）
//
// 与动态沙箱版不同，这里是真正的 Node 插件：直接用 node 内置 fetch 请求余额，
// 无需再派生 node 子进程。凭据仍走 credentials seam（按调用即时解析）。
//
// 提供两块能力：
//   1. 模型工具 deepseek_balance —— 供 Agent 查询余额。
//   2. HTTP 路由 GET /api/d-balance/balance —— 供右下角小组件（Client 半）轮询。

import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { defineTool } from "@deepseek-ai/dsh-tools";

const name = "oh-dsh-d-balance";
const inject = ["credentials", "tools"];

const BALANCE_URL = "https://api.deepseek.com/user/balance";
const API_KEY_REF = "DEEPSEEK_API_KEY";
const TIMEOUT_MS = 30000;

async function queryBalance(credentials) {
  const resolved = await credentials.resolve(credentialRef(API_KEY_REF));
  if (resolved === undefined || typeof resolved.value !== "string" || resolved.value.length === 0) {
    throw new Error(`未配置 DeepSeek API Key（${API_KEY_REF}）。请在模型设置或 .credentials.yaml 中配置。`);
  }

  const response = await fetch(BALANCE_URL, {
    headers: { authorization: `Bearer ${resolved.value}` },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`DeepSeek 余额接口返回 HTTP ${response.status}: ${body.slice(0, 300)}`);
  }

  let data;
  try {
    data = JSON.parse(body);
  } catch {
    throw new Error(`无法解析余额接口响应: ${body.slice(0, 200)}`);
  }

  const infos = Array.isArray(data.balance_infos) ? data.balance_infos : [];
  const info = infos[0] ?? {};
  return {
    isAvailable: data.is_available === true,
    currency: typeof info.currency === "string" ? info.currency : "",
    totalBalance: info.total_balance != null ? String(info.total_balance) : "",
    grantedBalance: info.granted_balance != null ? String(info.granted_balance) : "",
    toppedUpBalance: info.topped_up_balance != null ? String(info.topped_up_balance) : ""
  };
}

function apply(ctx) {
  // 1. 模型工具（核心能力，纯 Host，任何表面可用）
  ctx.effect(() => ctx.tools.register(defineTool({
    name: "deepseek_balance",
    description: "查询当前配置的 DeepSeek API Key（DEEPSEEK_API_KEY）账户余额。返回可用状态、币种、总余额、赠送余额和充值余额。",
    parameters: {},
    timeoutMs: TIMEOUT_MS + 5000,
    isConcurrencySafe: () => true,
    output: {
      schema: {
        type: "object",
        additionalProperties: true,
        properties: {
          isAvailable: { type: "boolean", description: "账户是否有可用余额" },
          currency: { type: "string", description: "余额币种，如 CNY" },
          totalBalance: { type: "string", description: "总余额" },
          grantedBalance: { type: "string", description: "赠送余额" },
          toppedUpBalance: { type: "string", description: "充值余额" }
        }
      },
      render: (_args, value) => [{
        type: "text",
        text: `DeepSeek 余额：可用=${value.isAvailable ? "是" : "否"}，币种=${value.currency}，` +
          `总余额=${value.totalBalance}，赠送余额=${value.grantedBalance}，充值余额=${value.toppedUpBalance}`
      }]
    },
    execute: async () => await queryBalance(ctx.credentials)
  })), "oh-dsh-d-balance.tool");

  // 2. 供右下角小组件查询的 HTTP 路由（仅 Web/Desktop 表面存在 webServer 时注册）
  const webServer = ctx.get("webServer");
  if (webServer !== undefined) {
    ctx.effect(() => webServer.register({
      kind: "exact",
      path: "/api/d-balance/balance",
      handler: async (_req, res) => {
        try {
          const payload = await queryBalance(ctx.credentials);
          res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
          res.end(JSON.stringify(payload));
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ ok: false, message }));
        }
      }
    }), "oh-dsh-d-balance.web-route");
  }
}

export { apply, inject, name };
