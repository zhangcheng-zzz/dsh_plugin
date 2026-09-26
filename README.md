# dsh_plugin

DeepSeek Harness 通用插件开发仓库。

## 插件

| 插件 | 说明 | 状态 |
| --- | --- | --- |
| [dsh-yunxiao](./d_yunxiao/README.md) | 无数据库的轻量云效账号、项目、缺陷与流水线工作台 | 可用 |
| [dsh-port](./d_port/README.md) | Windows 端口管理：工作台与模型工具查询端口占用进程并可结束进程 | 可用 |

## dsh-yunxiao

`dsh-yunxiao` 自动接收云校指定负责人缺陷通知

- Web 工作台集成在 Harness 侧栏，提供“缺陷”“流水线”“设置”三个页签；
- 设置页可为当前项目绑定一个 DSH 工作区，“待确认/再次打开”的缺陷可从列表或详情一键“草稿/处理”到绑定工作区创建新的的会话（草稿只填入输入框不发送，处理直接发送）；
- 支持 Windows/macOS 原生新缺陷提醒（自动识别平台并存储）、流水线常用操作与两个只读模型工具（`yunxiao_list_defects`、`yunxiao_list_pipelines`）。

## dsh-port

`dsh-port` 是 Windows 端口管理插件，封装 `netstat -ano`、`tasklist`、`taskkill` 三个系统命令，提供 Web 工作台与两个模型工具，无数据文件：

- 工作台：侧边栏底部“端口管理”入口，右侧列展示端口占用，默认按端口聚合（一行一个端口：归属进程、监听状态、连接数），可切换连接明细；支持按端口/进程/协议/状态筛选与自动刷新，每行可一键结束进程（确认弹窗 + 结果复查）；
- `winport_list`：查询所有 TCP/UDP 端口及占用进程，支持按端口、协议、状态、PID、进程名筛选；
- `winport_kill`：结束占用指定端口的进程（`taskkill /PID <pid> /T /F`）并复查释放情况，多进程占用时要求指定 pid，系统核心进程（System/lsass 等）会被拒绝。

安装与验证（`-w` 必须保留，详见[d_port 安装说明](./d_port/README.md#安装与更新)）：

```powershell
dsh plugin --profile web add -w ./d_port
dsh --profile web --dump-config
```

完整的能力清单、配置覆盖、权限与安全提示见 [d_port/README.md](./d_port/README.md)。

在仓库根目录安装（`-w` 必须保留，原因见[d_yunxiao 安装说明](./d_yunxiao/README.md#安装与更新)）：

```powershell
dsh plugin --profile web add -w ./d_yunxiao
```

验证：

```powershell
dsh --profile web --dump-config
```

完整的功能清单、数据存储说明、配置覆盖、云效令牌权限与开发验证步骤见 [d_yunxiao/README.md](./d_yunxiao/README.md)。
