# dsh-port

适用于 DeepSeek Harness 的 Windows 端口管理插件：查询本机 TCP/UDP 端口占用与对应进程，并可结束占用端口的进程。本质上是 `netstat`、`tasklist`、`taskkill` 三个系统命令的封装，提供 Web 工作台与两个模型工具，无数据文件，不接收消息回调或 Webhook。

## 能力

- 入口：集成到 Harness 左侧栏底部（“端口管理”），打开后占用框架预留的右侧列；可拖拽左边缘调整宽度，浏览器记住上次宽度；提供跟随系统的浅色/深色两套配色。
- 工作台页面：
  - 视图切换：默认「按端口」聚合视图，一行一个端口，显示归属进程（PID、服务）、监听状态与连接分布（已连接/等待释放/关闭中），监听中的端口排在最前；可切换回「连接明细」查看每条连接；
  - 筛选区：按端口号、进程名/服务名、协议（TCP/UDP）、状态（LISTENING/ESTABLISHED/TIME_WAIT 等）筛选，支持回车查询、一键重置；
  - 端口列表：聚合视图（协议、端口、进程、连接概览、操作）与连接明细（协议、本地地址含远端、状态、进程、操作）两种列布局，分页展示（每页 50 条/个）；
  - 结束进程：每行「结束」按钮弹出确认窗（显示 PID、进程、端口、所属服务），确认后执行 `taskkill /PID <pid> /T /F` 并自动复查端口、刷新列表、弹出结果提示；聚合视图下多进程共用端口时按 PID 分别提供按钮；
  - 可选“每 10 秒自动刷新”；TIME_WAIT 等无属主的行结束按钮禁用并说明原因。
- `winport_list`：查询端口占用（`netstat -ano` + `tasklist /svc`），返回协议、本地/远端地址、端口、状态、PID、进程名与所属服务；支持按本地端口、远端端口、协议、状态关键词、PID、进程名/服务名筛选，分页返回（默认每页 100，最多 500）。
- `winport_kill`：结束占用端口的进程（`taskkill /PID <pid> /T /F`，结束进程树并强制），结束后自动复查端口并返回剩余占用情况；也可以只传 `pid` 直接结束进程。
- 安全防护：
  - 端口被多个进程占用且未指定 `pid` 时，返回候选列表要求指定目标，不盲杀；
  - PID 0（空闲统计）、PID 4/System（HTTP.SYS 等内核监听，提示改用 `netsh http show servicestate` 排查）与 csrss、lsass、services 等核心进程直接拒绝并说明原因；
  - 只有 TIME_WAIT 等系统级记录（属主 PID 为 0）的端口提示“自动释放”，不会执行结束命令。
- 中文兼容：命令输出先按 UTF-8 解码，失败自动回退 GBK，中文进程名不乱码；`tasklist` 服务列的本地化占位值（`N/A`/`暂缺`）会过滤为空。
- 平台限制：仅 Windows 上可用，其他平台调用返回明确错误。

## 数据存储

无。插件不写任何数据文件，全部信息实时取自系统命令。

## 安装与更新

以下命令均在插件仓库根目录（即包含 `d_port` 目录的那一层）执行，命令中只使用仓库相对路径。

首次安装或改动后重新安装：

```powershell
# 从仓库目录安装（首次安装、或换用另一份源码目录时执行）
dsh plugin --profile web add -w ./d_port

# 校验组合配置中出现 dsh-port
dsh --profile web --dump-config
```

卸载：

```powershell
dsh plugin --profile web remove -w dsh-port
```

注意事项：

- 所有 `dsh plugin --profile web add/remove` 命令都必须带 `-w` 参数，否则会报 `ERR_PNPM_ADDING_TO_ROOT` / `ERR_PNPM_REMOVING_ROOT`。
- 若报 `ERR_PNPM_UNEXPECTED_STORE`（profile 由 pnpm 11 的 store v11 建立，而 PATH 上的 pnpm 9 想用 store v3），可用 pnpm 11 执行安装：`npm install --prefix "$env:TEMP\pnpm11-tool" pnpm@11.25.0`，再把 `$env:TEMP\pnpm11-tool\node_modules\.bin` 临时加到 PATH 最前面后重跑安装命令。
- 安装是 link 形式：profile 直接引用仓库中的插件源码目录。日常只修改 `dist/index.js` 或 `dist/client.js` 后，重启 Harness 实例即可加载最新代码；仅当 `package.json` 变化时才需要重新 `add`。
- 安装或重新安装后，必须重启正在运行的 Harness Web/Desktop 实例才能生效。重启后模型会话中即可使用 `winport_list` 与 `winport_kill` 两个工具。

## 配置

可在 profile 的 `cordis.patch.yml` 中覆盖整行配置：

```yaml
- override:
    id: dsh-port
    name: dsh-port
    config:
      timeoutMs: 15000
      killRecheckDelayMs: 300
```

- `timeoutMs`：单个命令（netstat/tasklist/taskkill）的执行超时，范围 3000–120000，默认 15000。
- `killRecheckDelayMs`：结束进程后到复查端口的等待时间，范围 0–10000，默认 300。

## 权限与安全提示

- 结束进程是破坏性操作。模型应先用 `winport_list` 确认占用进程，再调用 `winport_kill`；用户也应在会话中确认目标无误。
- 非管理员权限下，结束其他用户会话或系统服务的进程会返回“拒绝访问”，需要以管理员身份运行 Harness。
- 被强制结束（`/F`）的进程不会保存数据，业务进程结束后需自行重启。
- svchost.exe 可能承载多个系统服务，结束前请查看返回结果中的 `services` 字段确认影响范围。

## 开发验证

在插件仓库根目录运行：

```powershell
node --check .\d_port\dist\index.js
node --check .\d_port\dist\client.js
npm test --prefix .\d_port
npm pack .\d_port --dry-run
```

本地浏览器预览工作台（脱离 Harness 单独打开页面，走真实 netstat/tasklist）：

```powershell
node .\d_port\scripts\preview-server.js
# 打开输出的 http://127.0.0.1:8642/
```

实现遵循 Harness 的可安装组合包结构：`dsh.bundle.patch` 挂载 Host 插件（模型工具 + RPC 路由），`dsh.client` 在 Web 表面即时加载无框架 Client（侧边栏入口 + 预留右侧列工作台）。参考：[DeepSeek Harness 插件基础](https://deepseek-harness.github.io/deepseek-harness/develop/basic/)。
