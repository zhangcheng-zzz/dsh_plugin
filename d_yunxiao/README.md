# dsh-yunxiao

适用于 DeepSeek Harness 的轻量云效工作台插件。它参考了 `python-task` 的云效 OpenAPI 封装和 `card-study` 的工作台流程，但移除了 FastAPI、Vue、Element Plus、SQLAlchemy、数据库、定时采集、通知规则和 Webhook 接收。

## 能力

- 入口：集成到 Harness 左侧栏底部，打开后占用框架预留的右侧列，不以悬浮按钮或全屏遮罩展示。
- 账号：维护多个云效组织 ID 与个人访问令牌，切换当前账号。
- 项目：读取当前账号可访问的项目，并为每个账号记住当前项目。
- 缺陷：分页、按状态/负责人自动筛选，列表或详情内修改工作流状态，查看描述/评论/附件。
- 流水线：组织级列表、详情、代码源与分支、运行记录、阶段/任务、日志，以及按分支手动运行；运行表单不接收环境变量。
- 模型工具：`yunxiao_list_defects` 和 `yunxiao_list_pipelines`，默认读取工作台的当前账号与项目。
- 离线回退：项目、最近一次缺陷列表和流水线列表写入文本缓存；OpenAPI 暂时失败时展示缓存并标记时间。

插件不提供消息回调、Webhook 接收、通知规则或后台定时采集。

## 数据存储

默认数据文件为 Harness 启动工作目录下的：

```text
dsh-yunxiao.data.json
```

它是可直接查看、备份和编辑的 UTF-8 JSON 文件，不需要数据库。写入时先生成临时文件再原子替换，避免中途退出留下半个 JSON。

重要：个人访问令牌也会保存在这个文本文件中。Host 不会把令牌返回给浏览器，但文件本身不是加密保险箱。请限制文件访问权限，不要提交到 Git，也不要放入公开同步目录。如果部署环境要求加密凭据，应改用 Harness credentials 服务或操作系统密钥存储。

## 安装

在本仓库根目录运行：

```powershell
dsh plugin --profile web add ./d_yunxiao
```

验证组合：

```powershell
dsh --profile web --dump-config
```

配置中应出现：

```yaml
- id: dsh-yunxiao
  name: dsh-yunxiao
```

安装后重启正在运行的 Harness Web/Desktop 实例。左侧栏底部会出现“云效工作台”入口，侧栏折叠时显示“云”图标。工作台固定在右侧列中打开，关闭后聊天区恢复完整宽度。

## 配置

可在 profile 的 `cordis.patch.yml` 中覆盖整行配置：

```yaml
- override:
    id: dsh-yunxiao
    name: dsh-yunxiao
    config:
      dataFile: 'D:/private/dsh-yunxiao.data.json'
      apiBaseUrl: 'https://openapi-rdc.aliyuncs.com'
      timeoutMs: 45000
      cacheMaxItems: 100
```

`apiBaseUrl` 只接受 HTTPS。`cacheMaxItems` 限制列表缓存数量，范围 10–500。

## 云效令牌权限

按实际使用功能给个人访问令牌授予最小权限：

- 项目读取；
- 工作项读取；
- 修改缺陷状态时需要工作项写入；
- 流水线读取；
- 手动运行流水线时需要流水线运行权限；
- 读取 Codeup 分支时需要代码库/分支读取权限。

只使用查看功能时无需授予写权限。

## 开发验证

```powershell
node --check .\d_yunxiao\dist\index.js
node --check .\d_yunxiao\dist\client.js
npm test --prefix .\d_yunxiao
npm pack .\d_yunxiao --dry-run
```

实现遵循 Harness 的可安装组合包结构：`dsh.bundle.patch` 挂载 Host 插件，`dsh.client` 在 Web 表面即时加载无框架 Client。参考：[DeepSeek Harness 插件基础](https://deepseek-harness.github.io/deepseek-harness/develop/basic/)。
