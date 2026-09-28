# dsh_plugin

语言 / Language: [中文](#中文) | [English](#english)

---

## 中文

DeepSeek Harness 通用插件开发仓库。

### 插件

| 插件 | 说明 | 状态 |
| --- | --- | --- |
| [dsh-yunxiao](./d_yunxiao/README.md) | 无数据库的轻量云效账号、项目、缺陷与流水线工作台 | 可用 |
| [dsh-port](./d_port/README.md) | Windows 端口管理：工作台与模型工具查询端口占用进程并可结束进程 | 可用 |

### dsh-yunxiao

`dsh-yunxiao` 自动接收云效指定负责人的缺陷通知。

- Web 工作台集成在 Harness 侧栏，提供“缺陷”“流水线”“设置”三个页签，左边缘可拖拽调整宽度；
- 设置页可为当前项目绑定一个 DSH 工作区，“待确认/再次打开”的缺陷可从列表或详情一键“草稿/处理”到绑定工作区创建新的会话（草稿只填入输入框不发送，处理直接发送）；
- 支持 Windows/macOS 原生新缺陷提醒（自动识别平台并存储）、流水线常用操作与两个只读模型工具（`yunxiao_list_defects`、`yunxiao_list_pipelines`）。

### dsh-port

`dsh-port` 是 Windows 端口管理插件，封装 `netstat -ano`、`tasklist`、`taskkill` 三个系统命令，提供 Web 工作台与两个模型工具，无数据文件：

- 工作台：侧边栏底部“端口管理”入口，右侧列展示端口占用，默认按端口聚合（一行一个端口：归属进程、监听状态、连接数），可切换连接明细；支持按端口/进程/协议/状态筛选与自动刷新，每行可一键结束进程（确认弹窗 + 结果复查）；
- `winport_list`：查询所有 TCP/UDP 端口及占用进程，支持按端口、协议、状态、PID、进程名筛选；
- `winport_kill`：结束占用指定端口的进程（`taskkill /PID <pid> /T /F`）并复查释放情况，多进程占用时要求指定 pid，系统核心进程（System/lsass 等）会被拒绝。

### 安装与验证

在仓库根目录执行（`-w` 必须保留，原因见 [d_port 安装说明](./d_port/README.md#安装与更新) 与 [d_yunxiao 安装说明](./d_yunxiao/README.md#安装与更新)）：

```powershell
dsh plugin --profile web add -w ./d_port
dsh plugin --profile web add -w ./d_yunxiao

# 校验组合配置中出现对应插件
dsh --profile web --dump-config
```

- 完整的能力清单、配置覆盖、权限与安全提示见 [d_port/README.md](./d_port/README.md)。
- 完整的功能清单、数据存储说明、配置覆盖、云效令牌权限与开发验证步骤见 [d_yunxiao/README.md](./d_yunxiao/README.md)。

---

## English

A plugin development repository for DeepSeek Harness.

### Plugins

| Plugin | Description | Status |
| --- | --- | --- |
| [dsh-yunxiao](./d_yunxiao/README.md) | Lightweight Yunxiao (Alibaba Cloud DevOps) workbench for accounts, projects, defects and pipelines — no database required | Available |
| [dsh-port](./d_port/README.md) | Windows port management: workbench and model tools to look up processes holding ports and kill them | Available |

### dsh-yunxiao

`dsh-yunxiao` automatically receives Yunxiao defect notifications for a designated assignee.

- A web workbench integrated into the Harness sidebar with three tabs — Defects, Pipelines and Settings; drag its left edge to resize;
- The Settings page can bind a DSH workspace to the current project. Defects in “Pending confirmation / Reopened” status can be handed off to the bound workspace from the list or the detail view with one click, as a “Draft” (fills the session input box without sending) or “Handle” (creates the session and sends right away);
- Native new-defect notifications on Windows/macOS (platform auto-detected and remembered), common pipeline operations, and two read-only model tools (`yunxiao_list_defects`, `yunxiao_list_pipelines`).

### dsh-port

`dsh-port` is a Windows port-management plugin. It wraps three system commands — `netstat -ano`, `tasklist` and `taskkill` — and offers a web workbench plus two model tools, with no data files:

- Workbench: a “Port Management” entry at the bottom of the sidebar; the right column shows port usage aggregated by port by default (one row per port: owning process, listening state, connection count), switchable to per-connection details; filter by port/process/protocol/state with auto refresh, and kill the process behind any row with one click (confirm dialog + post-kill recheck);
- `winport_list`: lists all TCP/UDP ports and their owning processes; filter by port, protocol, state, PID or process name;
- `winport_kill`: kills the process holding a given port (`taskkill /PID <pid> /T /F`) and rechecks the release; when several processes share the port a pid must be specified; core system processes (System, lsass, etc.) are refused.

### Installation & verification

Run from the repository root (the `-w` flag is required — see the [d_port installation notes](./d_port/README.md#安装与更新) and [d_yunxiao installation notes](./d_yunxiao/README.md#安装与更新) for why):

```powershell
dsh plugin --profile web add -w ./d_port
dsh plugin --profile web add -w ./d_yunxiao

# Verify both plugins appear in the composed config
dsh --profile web --dump-config
```

- For the full capability list, config overrides, permissions and security notes, see [d_port/README.md](./d_port/README.md).
- For the full feature list, data storage notes, config overrides, Yunxiao token permissions and development verification steps, see [d_yunxiao/README.md](./d_yunxiao/README.md).
