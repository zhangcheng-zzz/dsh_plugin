# dsh_plugin — DSH 插件开发项目

面向 **Oh-DSH Desktop（DeepSeek Harness）** 的插件开发项目，集中存放、维护为 DSH 运行时扩展能力而开发的动态插件。

## 项目结构

```
dsh_plugin/
├── README.md            # 项目总览（本文件）
└── d_balance/           # DeepSeek 余额查询插件
    ├── host.js          # Host 半（对应 cordis 插件的 code.host）
    ├── client.js        # Client 半（对应 cordis 插件的 code.client）
    └── README.md        # 插件详细说明
```

## 插件列表

| 插件 | 说明 | 状态 |
| --- | --- | --- |
| [d_balance](./d_balance/README.md) | 右下角常驻 DeepSeek API 余额小组件，可拖拽、可调刷新频率，并注册 `deepseek_balance` 模型工具 | 可用 |

---

## d_balance — DeepSeek 余额查询插件

一个动态 Cordis 插件：在 DSH 界面右下角常驻显示当前 DeepSeek API Key 的账户余额。

- **实时余额**：显示 `可用状态 / 币种 / 总余额 / 赠送余额 / 充值余额`（CNY 显示为 ¥）。
- **拖拽移动**：按住胶囊任意拖动，位置限制在可视区内，并写入 `localStorage` 持久化。
- **点击设频率**：单击弹出面板，可选 5 秒 ~ 5 分钟刷新频率，选中立即生效。
- **模型工具**：同时注册 `deepseek_balance` 工具，Agent 可随时按需查询余额。

### 架构（Host / Client 双半）

DSH 动态插件由 `code.host` 与 `code.client` 两段函数体组成，分别运行在 Host 与 Client 沙箱中：

| 半 | 文件 | 职责 |
| --- | --- | --- |
| Host | `host.js` | 解析凭据、请求余额接口、注册 `get-balance` RPC 与 `deepseek_balance` 工具 |
| Client | `client.js` | 渲染悬浮胶囊 UI、拖拽、频率设置、`localStorage` 持久化 |

### 关键实现点

- **API Key 来源**：`ctx.credentials.resolve('DEEPSEEK_API_KEY')` 即时解析，凭据变更无需重启。
- **余额接口**：`GET https://api.deepseek.com/user/balance`，`Authorization: Bearer <key>`。
- **网络请求**：动态 Host 沙箱会拦截 `fetch` / `require` / `process`，因此通过 `ctx.subprocess` 派生运行时自带的 `node.exe` 完成请求（Node 内置 `fetch` 兼容性最稳）。
- **UI 挂载**：`slots.inject('shell.overlay')` 框架级浮动层，不替换任何现有 UI。
- **Host / Client 通信**：`harness.handle('get-balance')` + `host.call('get-balance')`。

### 运行方式

```text
cordis_define  →  code.host = host.js 内容，code.client = client.js 内容
cordis_run     →  激活插件（Client 半需界面批准一次）
cordis_stop    →  停用
cordis_undefine→  彻底删除
```

> 注意：这是临时运行时插件，进程重启后不会自动加载。若需开机自启，需落成正式插件（写入 agent preset / 桌面插件配置）。

详见 [`d_balance/README.md`](./d_balance/README.md)。

---

## 开发指南

### 什么是 DSH 动态插件

动态插件（Dynamic Cordis Plugin）通过两段函数体注入 DSH 运行时：

- **`code.host`**：运行在 Host 沙箱，可访问凭据、子进程、文件等能力，负责逻辑与外部资源交互，并通过 `harness` 暴露 RPC 与模型工具。
- **`code.client`**：运行在 Client 沙箱，负责界面渲染（React / 样式 / 槽位注入），通过 `host.call` 调用 Host 侧能力。

### 常用接口速查

| 接口 | 位置 | 用途 |
| --- | --- | --- |
| `ctx.credentials.resolve(name)` | Host | 解析凭据（如 `DEEPSEEK_API_KEY`） |
| `ctx.subprocess.spawn(...)` | Host | 派生子进程执行命令 |
| `ctx.get('sandboxPolicy')` | Host | 读取沙箱策略（如工作区根目录） |
| `harness.handle(name, fn)` | Host | 注册 RPC，供 Client 端 `host.call` 调用 |
| `harness.defineTool(...)` + `harness.registerTool(ctx, tool)` | Host | 注册模型工具 |
| `slots.inject('shell.overlay', ...)` | Client | 注入框架级浮动层 UI |
| `host.call(name, args)` | Client | 调用 Host 侧 RPC |
| `styles.insert(css)` | Client | 注入样式 |
| `ctx.get('timer').interval(fn, ms)` | Client | 定时轮询 |

### 开发流程

1. 在 `dsh_plugin/` 下新建插件目录（如 `my_plugin/`），编写 `host.js` 与 `client.js`。
2. 用 `cordis_define` 注入两段代码，`cordis_run` 激活调试。
3. 调试通过后补充插件 `README.md`，并登记到本项目根 `README.md` 的插件列表。

## 环境要求

- Oh-DSH Desktop（DeepSeek Harness）运行时
- 插件所需凭据已配置（如 `DEEPSEEK_API_KEY`，位于 `$DSH_HOME/.credentials.yaml` 或启动环境）
