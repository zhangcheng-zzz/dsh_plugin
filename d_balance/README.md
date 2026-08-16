# DeepSeek 余额查询插件

一个动态 Cordis 插件：在右下角常驻显示当前 DeepSeek API Key 的账户余额，可拖拽、可设置刷新频率、位置与频率本地持久化。

## 文件

| 文件 | 说明 |
| --- | --- |
| `host.js` | Host 半（对应 `code.host`）：解析 API Key、请求余额接口，注册 `get-balance` RPC 与 `deepseek_balance` 工具 |
| `client.js` | Client 半（对应 `code.client`）：右下角悬浮胶囊 UI、拖拽、频率设置、localStorage 持久化 |

## 功能

- **实时余额**：显示 `可用状态 / 币种 / 总余额 / 赠送余额 / 充值余额`（CNY 显示为 ¥）。
- **拖拽移动**：按住胶囊拖动到任意位置（4px 阈值区分点击与拖动，限制在可视区）。
- **点击设频率**：单击弹出面板，可选 5 秒 / 10 秒 / 15 秒 / 30 秒 / 1 分钟 / 5 分钟，选中立即生效并刷新。
- **记忆位置与频率**：写入浏览器 `localStorage`（key `dsbal-widget-v1`），跨重启保留。
- **重置位置**：面板内一键回到右下角。
- **模型工具**：注册 `deepseek_balance` 工具，让 Agent 也能按需查询余额。

## 关键实现点

- **API Key 来源**：`ctx.credentials.resolve('DEEPSEEK_API_KEY')`（即时解析，凭据变更无需重启）。凭据来自 `$DSH_HOME/.credentials.yaml` 或启动环境。
- **余额接口**：`GET https://api.deepseek.com/user/balance`，请求头 `Authorization: Bearer <key>`。
- **网络请求方式**：动态 Host 沙箱会拦截 `fetch`/`require`/`process`，因此通过 `ctx.subprocess` 派生运行时自带的 `node.exe`，用 Node 内置 `fetch` 完成请求（curl/PowerShell 在本机存在 Schannel/TLS 兼容问题，Node 方案最稳）。
- **UI 挂载点**：`shell.overlay`（框架级浮动层，`replaceRisk: none`，不替换任何现有 UI）。
- **Host/Client 通信**：`harness.handle('get-balance')` + `host.call('get-balance')`（仅传递无损 JSON）。

## 运行方式（动态插件）

1. 用 `cordis_define` 分别传入 `code.host` = `host.js` 内容、`code.client` = `client.js` 内容。
2. 用 `cordis_run` 激活（Client 半需要界面批准一次）。
3. 停用 `cordis_stop`；彻底删除 `cordis_undefine`。

## 注意事项

- 这是**临时运行时插件**：进程重启后不会自动加载。若需「开机自启」，需把它落成正式插件（写入 agent preset / 桌面插件配置）。
- 位置/频率持久化依赖浏览器 `localStorage`；清理站点数据会丢失。
