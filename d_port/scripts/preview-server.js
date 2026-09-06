// 本地预览服务：用真实命令驱动 RPC，供浏览器打开 client.js 的独立预览模式做验收。
import http from "node:http";
import { readFile } from "node:fs/promises";
import { apply } from "../dist/index.js";

let route;
const ctx = {
  tools: { register() {} },
  inject(_dependencies, callback) {
    callback({
      webServer: { register(value) { route = value; return () => {}; } },
      effect(effect) { return effect(); }
    });
  }
};
apply(ctx, {});

const clientSource = await readFile(new URL("../dist/client.js", import.meta.url), "utf8");
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>dsh-port 预览</title></head>
<body style="margin:0;background:#f2f4f8">
<script>window.__ModuleLoader__ = { load(options) { const exports = options.factory(function () { return null; }); exports.apply({ effect: function (fn) { return fn(); } }); } };</script>
<script>${clientSource}</script>
</body></html>`;

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/d-port/rpc") {
    route.handler(req, res);
    return;
  }
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(html);
    return;
  }
  res.writeHead(404);
  res.end("not found");
});

const port = Number(process.env.PREVIEW_PORT || 8642);
server.listen(port, "127.0.0.1", () => {
  console.log(`PREVIEW_READY http://127.0.0.1:${port}/`);
});
