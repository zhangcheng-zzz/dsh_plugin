# @oh-dsh/d-balance

DeepSeek 余额查询插件（Oh-DSH 正式插件包）。为 Oh-DSH 提供两类能力：

1. **模型工具 `deepseek_balance`**：Agent 可调用，查询当前 `DEEPSEEK_API_KEY` 账户的可用状态、币种、总余额、赠送余额与充值余额。
2. **右下角悬浮小组件**：常驻显示余额，支持拖拽移动、点击设置刷新频率（5 秒～5 分钟），位置与频率写入 `localStorage` 持久化（重启后仍恢复）。

## 特性

- **凭据即时解析**：每次查询走 `ctx.credentials.resolve(credentialRef('DEEPSEEK_API_KEY'))`，改 Key 无需重启。
- **直接网络**：正式插件是真正的 Node 环境，直接用内置 `fetch` 请求余额接口（无需动态沙箱版的 node 子进程绕行）。
- **无构建依赖**：Client 半为手写 `window.__ModuleLoader__.load` 模块，Host↔Client 通过同源 HTTP 路由通信，避开 Typert 生成链。

## 目录结构

| 路径 | 说明 |
| --- | --- |
| `package.json` | 正式包元数据（`dsh.bundle.patch` + `dsh.client` 注入配置 + 宿主依赖） |
| `dist/index.js` | Host 半（ESM Cordis 插件）：注册 `deepseek_balance` 工具 + `/api/d-balance/balance` 路由 |
| `dist/client.js` | Client 半（`window.__ModuleLoader__.load` 浏览器模块）：悬浮小组件 |
| `dist/cordis.patch.yml` | 组合接入层：把本插件挂进 composition |
| `host.js` / `client.js` | 旧版动态沙箱插件源码（临时运行时版，仅供参考） |

## 工作原理

- **凭据**：`ctx.credentials.resolve(credentialRef('DEEPSEEK_API_KEY'))`，即时解析。
- **余额接口**：`GET https://api.deepseek.com/user/balance`，请求头 `Authorization: Bearer <key>`。
- **Client↔Host 通信**：Host 注册同源 HTTP 路由 `GET /api/d-balance/balance`，Client 用浏览器 `fetch` 轮询。
- **持久化**：小组件的位置与频率写入 `localStorage`（key `oh-dsh.d-balance.v1`）。

## 安装

本包遵循 `@oh-dsh/*` 插件约定，安装分三步（已在本机按此方式接入桌面端 + Web 端）。

### 1. 把包放进运行时 node_modules

`profiles\node_modules` 是对运行时 `node_modules` 的 junction 树；把包放进运行时
`node_modules` 并建立 profile junction，使 Host（`import`）与 Client（`dsh.client` 扫描）都能解析到。

```powershell
$src  = 'D:\develop\code\dsh_plugin\d_balance'
$dep  = 'D:\software\dsh\Oh-DSH Desktop\resources\dsh-runtime\node_modules\@oh-dsh'
$prof = 'C:\Users\admin\.ohdsh\profiles\node_modules\@oh-dsh'

Copy-Item $src "$dep\d-balance" -Recurse -Force
New-Item -ItemType Junction -Path "$prof\d-balance" -Target "$dep\d-balance" | Out-Null
```

### 2. 接线 composition（桌面端 + Web 端）

`cordis.yml` 是空根，实际组合由 `package.json` 的 `dsh.profile.bundles` 依次 +
`cordis.patch.yml` 组装，所以只改 `cordis.patch.yml`，不要改 `cordis.yml`。

把下面这段并入两个 profile 的 patch 层：

- `C:\Users\admin\.ohdsh\profiles\desktop\cordis.patch.yml`（桌面端）
- `C:\Users\admin\.ohdsh\profiles\web\cordis.patch.yml`（Web 端）

```yaml
- insert:
    - id: oh-d-balance
      name: '@oh-dsh/d-balance'
```

### 3. 重启应用

composition 在启动时读取，需**完全退出并重新打开** Oh-DSH Desktop。

## 卸载 / 回滚

```powershell
# 1. 把两个 cordis.patch.yml 里的 - insert: 段删掉，恢复为 []
# 2. 删除包与 junction
Remove-Item 'C:\Users\admin\.ohdsh\profiles\node_modules\@oh-dsh\d-balance' -Recurse -Force
Remove-Item 'D:\software\dsh\Oh-DSH Desktop\resources\dsh-runtime\node_modules\@oh-dsh\d-balance' -Recurse -Force
# 3. 重启应用
```

## 运行行为

- 小组件默认出现在**右下角**，绿点显示 `DeepSeek ¥<总余额>`（CNY 显示 ¥）。
- **拖动**移动位置；**单击**弹出频率面板（5 秒 / 10 秒 / 15 秒 / 30 秒 / 1 分钟 / 5 分钟 + 重置位置）。
- 按设定频率自动轮询余额；红点 = 未配置 Key 或请求失败（悬停看原因）。

## 限制与说明

- Client 半依赖 Web/桌面表面的 `webServer`（`@oh-dsh/web` / `@oh-dsh/desktop` bundle 已提供）；在纯 TUI 表面只会注册工具、无小组件。
- HTTP 路由绑定在 localhost，仅返回余额数字（不含 Key），Key 始终留在 Host 侧。
- `dist/client.js` 是按 `window.__ModuleLoader__.load` 格式手写的浏览器模块，未经过上游 esbuild/typert 生成链，需在真实安装后验证渲染与轮询。
