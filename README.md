# dsh_plugin

DeepSeek Harness 通用插件开发仓库。

## 插件

| 插件 | 说明 | 状态 |
| --- | --- | --- |
| [dsh-yunxiao](./d_yunxiao/README.md) | 无数据库的轻量云效账号、项目、缺陷与流水线工作台 | 可用 |

## dsh-yunxiao

`dsh-yunxiao` 是标准 Harness 组合包，使用单个 JSON 文本文件保存账号、当前项目、DSH 工作区绑定、缺陷通知设置与有限缓存，不依赖数据库，也不接收 Webhook 或消息回调。

- Web 工作台集成在 Harness 侧栏，提供“缺陷”“流水线”“设置”三个页签；
- 设置页可为当前项目绑定一个 DSH 工作区，“待确认/再次打开”的缺陷可从列表或详情一键“草稿/处理”到绑定工作区的会话（草稿只填入输入框不发送，处理直接发送）；
- 支持 Windows 新缺陷提醒、流水线常用操作与两个只读模型工具（`yunxiao_list_defects`、`yunxiao_list_pipelines`）。

在仓库根目录安装（`-w` 必须保留，原因见[d_yunxiao 安装说明](./d_yunxiao/README.md#安装与更新)）：

```powershell
dsh plugin --profile web add -w ./d_yunxiao
```

验证：

```powershell
dsh --profile web --dump-config
```

完整的功能清单、数据存储说明、配置覆盖、云效令牌权限与开发验证步骤见 [d_yunxiao/README.md](./d_yunxiao/README.md)。
