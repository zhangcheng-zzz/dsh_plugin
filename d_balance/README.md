# dsh-balance

适用于 DeepSeek Harness 的通用余额查询插件，提供两类能力：

1. 模型工具 `deepseek_balance`：查询当前 `DEEPSEEK_API_KEY` 账户的可用状态、币种、总余额、赠送余额与充值余额。
2. Web 悬浮小组件：显示余额，支持拖拽、刷新频率设置和位置持久化。

## 特性

- 每次查询通过 `ctx.credentials.resolve('DEEPSEEK_API_KEY')` 读取最新凭据，无需重启插件。
- Host 直接使用 Node 内置 `fetch` 请求 DeepSeek 余额接口。
- Host 入口不导入 Harness 核心包，避免树外插件复制核心运行时。
- 通过注入的 `tools` 服务注册模型工具。
- 可选注入 `webServer`；Web 表面提供小组件，纯终端表面仍可使用模型工具。
- 无构建步骤，发布内容已位于 `dist/`。

## 目录结构

| 路径 | 说明 |
| --- | --- |
| `package.json` | npm 包及 `dsh.bundle`、`dsh.client` 清单 |
| `dist/index.js` | Host Cordis 插件 |
| `dist/client.js` | 浏览器端小组件 |
| `dist/cordis.patch.yml` | 插入 `dsh-balance` 插件行的组合层 |
| `host.js` / `client.js` | 早期动态插件实现，仅供参考 |

## 工作原理

- 凭据：`ctx.credentials.resolve('DEEPSEEK_API_KEY')`
- 余额接口：`GET https://api.deepseek.com/user/balance`
- 请求头：`Authorization: Bearer <key>`
- Client 与 Host 通信：`GET /api/d-balance/balance`
- 浏览器持久化键：`dsh-balance.v1`

## 安装

在本仓库根目录运行：

```powershell
dsh plugin --profile web add ./d_balance
```

CLI 会将 `dsh-balance` 写入 profile 依赖，并把它追加到 `dsh.profile.bundles`。

验证组合：

```powershell
dsh --profile web --dump-config
```

输出中应包含：

```yaml
# == dsh-balance
- id: dsh-balance
  name: dsh-balance
```

配置层在启动时读取，安装后需要停止并重新启动正在运行的 Harness 实例。

## 卸载

```powershell
dsh plugin --profile web remove dsh-balance
```

## 运行行为

- 小组件默认位于右下角，显示 `DeepSeek <币种符号><总余额>`。
- 拖动可改变位置；单击可选择 5 秒到 5 分钟的刷新频率。
- 红点表示凭据缺失或余额请求失败，悬停可查看原因。
- HTTP 路由仅返回余额信息，不返回 API Key。

## 环境要求

- DeepSeek Harness `0.1.1-rc.2` 或兼容版本
- Node.js `22.19.0` 或更高兼容版本
- 已配置 `DEEPSEEK_API_KEY`
