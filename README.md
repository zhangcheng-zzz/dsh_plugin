# dsh_plugin

DeepSeek Harness 通用插件开发仓库。

## 插件

| 插件 | 说明 | 状态 |
| --- | --- | --- |
| [dsh-balance](./d_balance/README.md) | DeepSeek API 余额工具与 Web 悬浮小组件 | 可用 |
| [dsh-yunxiao](./d_yunxiao/README.md) | 无数据库的轻量云效账号、项目、缺陷与流水线工作台 | 可用 |

## dsh-balance

`dsh-balance` 是标准 Harness 组合包：

- Host 侧注册 `deepseek_balance` 模型工具。
- Web 表面注册余额查询路由并加载悬浮小组件。
- 通过 `dsh.bundle.patch` 接入 profile 组合。
- 使用 Cordis `inject` 声明必需服务，并通过 `ctx.inject()` 处理可选 Web 服务。
- 不携带或安装 Harness 核心包副本。

安装：

```powershell
dsh plugin --profile web add ./d_balance
```

验证：

```powershell
dsh --profile web --dump-config
```

详细说明见 [d_balance/README.md](./d_balance/README.md)。

## dsh-yunxiao

`dsh-yunxiao` 使用单个 JSON 文本文件保存账号、当前项目、缺陷通知设置与有限缓存，不依赖数据库，也不接收 Webhook 或消息回调。Web 工作台提供缺陷、Windows 新缺陷提醒和流水线常用操作，Host 同时注册两个只读模型工具。

安装：

```powershell
dsh plugin --profile web add ./d_yunxiao
```

详细说明见 [d_yunxiao/README.md](./d_yunxiao/README.md)。
