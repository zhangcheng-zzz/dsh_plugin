// dsh-yunxiao — 无框架、无构建步骤的轻量 Web 工作台。
window.__ModuleLoader__.load({ id: "dsh-yunxiao", factory: (require) => {
var module = { exports: {} };
var exports = module.exports;
var ReactRuntime = null;
try { ReactRuntime = require("react"); } catch (error) {}

var STYLE_ID = "dsh-yunxiao-style";
var ROOT_ID = "dsh-yunxiao-root";
var PAGE_SIZE = 20;

var CSS = [
  ":root{--dyx-bg:#f6f7fb;--dyx-panel:#fff;--dyx-panel2:#f8fafc;--dyx-text:#172033;--dyx-muted:#64748b;--dyx-line:#e2e8f0;--dyx-brand:#2563eb;--dyx-brand2:#0f766e;--dyx-danger:#dc2626;--dyx-shadow:0 18px 60px rgba(15,23,42,.22)}",
  "@media(prefers-color-scheme:dark){:root{--dyx-bg:#0d1117;--dyx-panel:#141b24;--dyx-panel2:#101720;--dyx-text:#e6edf3;--dyx-muted:#8b9bb0;--dyx-line:#2b3543;--dyx-brand:#65a3ff;--dyx-brand2:#39c5ad;--dyx-danger:#ff7b72;--dyx-shadow:0 22px 70px rgba(0,0,0,.5)}}",
  ".dyx-root,.dyx-root *{box-sizing:border-box}",
  ".dyx-slot-host{width:100%;height:100%;min-height:0}",
  ".dyx-right-panel{position:absolute;inset:0 0 0 auto;width:480px;min-width:0;overflow:hidden;pointer-events:auto;background:var(--dyx-bg);box-shadow:-12px 0 32px rgba(15,23,42,.08)}",
  "[data-dyx-workspace-open='true']{grid-template-columns:var(--dyx-sidebar-track,280px) minmax(0,1fr) 480px!important}[data-dyx-workspace-open='true'] [data-side='details']{left:calc(100% - 480px)!important}",
  ".dyx-preview-host{position:fixed;inset:12px 12px 12px auto;width:min(520px,calc(100vw - 24px));z-index:2147482500;overflow:hidden;border-radius:16px;box-shadow:var(--dyx-shadow)}",
  ".dyx-root{position:relative;width:100%;height:100%;min-height:0;container-type:inline-size;font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI','Microsoft YaHei',sans-serif;color:var(--dyx-text);pointer-events:auto}",
  ".dyx-sidebar-trigger{width:100%;min-height:36px;padding:8px 10px;display:flex;align-items:center;justify-content:center;gap:9px;border:0;border-radius:9px;color:inherit;background:transparent;cursor:pointer;font:inherit}.dyx-sidebar-trigger:hover{color:#2563eb;background:rgba(37,99,235,.1)}.dyx-sidebar-trigger[data-wide='true']{justify-content:flex-start}.dyx-sidebar-trigger-mark{width:22px;height:22px;display:grid;place-items:center;border-radius:7px;color:#fff;background:linear-gradient(135deg,#2563eb,#0f766e);font-size:11px;font-weight:800}",
  ".dyx-shell{position:absolute;inset:0;display:grid;grid-template-rows:62px minmax(0,1fr);overflow:hidden;border-left:1px solid var(--dyx-line);background:var(--dyx-bg)}",
  ".dyx-hidden{display:none!important}",
  ".dyx-head{display:flex;align-items:center;gap:14px;padding:0 20px;border-bottom:1px solid var(--dyx-line);background:color-mix(in srgb,var(--dyx-panel) 92%,transparent)}",
  ".dyx-logo{width:38px;height:38px;display:grid;place-items:center;border-radius:12px;color:#fff;background:linear-gradient(135deg,#2563eb,#0f766e);font-weight:800}",
  ".dyx-head-copy{min-width:0;flex:1}.dyx-head-copy strong{display:block;font-size:17px}.dyx-head-copy span{display:block;color:var(--dyx-muted);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
  ".dyx-close{width:36px;height:36px;border:1px solid var(--dyx-line);border-radius:10px;color:var(--dyx-text);background:var(--dyx-panel);cursor:pointer;font-size:20px}",
  ".dyx-body{min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr)}",
  ".dyx-nav{padding:8px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;border-bottom:1px solid var(--dyx-line);background:var(--dyx-panel)}",
  ".dyx-nav button{width:100%;padding:9px 6px;display:flex;align-items:center;justify-content:center;gap:6px;border:0;border-radius:9px;color:var(--dyx-muted);background:transparent;cursor:pointer;text-align:center;font:inherit;font-size:13px}",
  ".dyx-nav button:hover{color:var(--dyx-text);background:var(--dyx-panel2)}.dyx-nav button.active{color:var(--dyx-brand);background:color-mix(in srgb,var(--dyx-brand) 12%,transparent);font-weight:700}",
  ".dyx-main{min-width:0;overflow:auto;padding:16px}",
  ".dyx-section{max-width:100%;margin:0 auto}.dyx-title{margin:0 0 14px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.dyx-title h2{margin:0;font-size:19px}.dyx-title p{margin:3px 0 0;color:var(--dyx-muted);font-size:12px}",
  ".dyx-card{padding:14px;border:1px solid var(--dyx-line);border-radius:13px;background:var(--dyx-panel);box-shadow:0 2px 8px rgba(15,23,42,.04)}.dyx-card+.dyx-card{margin-top:12px}",
  ".dyx-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.dyx-card-head h3{margin:0;font-size:16px}.dyx-card-head small{color:var(--dyx-muted)}",
  ".dyx-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}.dyx-account{padding:15px;border:1px solid var(--dyx-line);border-radius:12px;background:var(--dyx-panel2)}.dyx-account.active{border-color:var(--dyx-brand);box-shadow:inset 0 0 0 1px var(--dyx-brand)}",
  ".dyx-account-top{display:flex;gap:11px;align-items:center;cursor:pointer}.dyx-avatar{width:38px;height:38px;display:grid;place-items:center;flex:none;border-radius:11px;color:#fff;background:linear-gradient(135deg,#2563eb,#0f766e);font-weight:800}.dyx-grow{min-width:0;flex:1}.dyx-grow strong,.dyx-grow small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dyx-grow small{color:var(--dyx-muted)}",
  ".dyx-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.dyx-account .dyx-actions{margin-top:12px;justify-content:flex-end}",
  ".dyx-btn{min-height:34px;padding:7px 12px;border:1px solid var(--dyx-line);border-radius:9px;color:var(--dyx-text);background:var(--dyx-panel);cursor:pointer;font:inherit}.dyx-btn:hover{border-color:var(--dyx-brand);color:var(--dyx-brand)}.dyx-btn.primary{border-color:var(--dyx-brand);color:#fff;background:#2563eb}.dyx-btn.danger{color:var(--dyx-danger)}.dyx-btn:disabled{opacity:.55;cursor:not-allowed}",
  ".dyx-field{display:grid;gap:5px}.dyx-field label{color:var(--dyx-muted);font-size:12px}.dyx-input,.dyx-select,.dyx-textarea{width:100%;min-height:38px;padding:8px 10px;border:1px solid var(--dyx-line);border-radius:9px;color:var(--dyx-text);background:var(--dyx-panel);outline:0;font:inherit}.dyx-input:focus,.dyx-select:focus,.dyx-textarea:focus{border-color:var(--dyx-brand);box-shadow:0 0 0 3px color-mix(in srgb,var(--dyx-brand) 13%,transparent)}.dyx-textarea{min-height:84px;resize:vertical}.dyx-select[multiple]{min-height:112px;padding:6px}.dyx-select[multiple] option{padding:7px 8px;border-radius:6px}",
  ".dyx-project-row{display:grid;grid-template-columns:1fr;gap:9px}.dyx-current{margin-top:12px;padding:12px;border-radius:10px;color:var(--dyx-muted);background:var(--dyx-panel2)}.dyx-current strong{color:var(--dyx-text)}",
  ".dyx-tools{margin-bottom:13px;display:grid;grid-template-columns:1fr 1fr;gap:9px;align-items:end}",
  ".dyx-defect-filters{margin-bottom:13px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.dyx-filter-control{min-width:0;display:grid;grid-template-columns:minmax(0,1fr) 30px;gap:5px}.dyx-filter-clear{width:30px;min-height:38px;padding:0;border:1px solid var(--dyx-line);border-radius:9px;color:var(--dyx-muted);background:var(--dyx-panel);cursor:pointer;font:18px/1 inherit}.dyx-filter-clear:hover{border-color:var(--dyx-brand);color:var(--dyx-brand)}.dyx-filter-clear[hidden]{visibility:hidden;display:block}",
  ".dyx-table-wrap{overflow:auto;border:1px solid var(--dyx-line);border-radius:11px}.dyx-table{width:100%;border-collapse:collapse;min-width:760px}.dyx-table th,.dyx-table td{padding:11px 12px;border-bottom:1px solid var(--dyx-line);text-align:left;vertical-align:middle}.dyx-table th{position:sticky;top:0;z-index:1;color:var(--dyx-muted);background:var(--dyx-panel2);font-size:12px;white-space:nowrap}.dyx-table tr:last-child td{border-bottom:0}.dyx-table tbody tr:hover{background:color-mix(in srgb,var(--dyx-brand) 5%,transparent)}",
  ".dyx-link{padding:0;border:0;color:var(--dyx-brand);background:transparent;cursor:pointer;font:inherit;text-align:left}.dyx-subject{max-width:480px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dyx-muted{color:var(--dyx-muted)}",
  ".dyx-badge{display:inline-flex;align-items:center;padding:3px 8px;border-radius:999px;color:var(--dyx-muted);background:var(--dyx-panel2);font-size:12px;white-space:nowrap}.dyx-badge.ok{color:#138a4b;background:rgba(34,197,94,.12)}.dyx-badge.run{color:#b77900;background:rgba(245,158,11,.14)}.dyx-badge.fail{color:var(--dyx-danger);background:rgba(239,68,68,.12)}",
  ".dyx-page{margin-top:13px;display:flex;justify-content:flex-end;align-items:center;gap:9px;color:var(--dyx-muted)}",
  ".dyx-empty{padding:48px 20px;text-align:center;color:var(--dyx-muted)}.dyx-empty strong{display:block;margin-bottom:5px;color:var(--dyx-text);font-size:16px}",
  ".dyx-drawer{position:absolute;inset:0;z-index:30;overflow:hidden;background:var(--dyx-bg);animation:dyx-slide-in .18s ease-out}@keyframes dyx-slide-in{from{transform:translateX(24px);opacity:.75}to{transform:none;opacity:1}}",
  ".dyx-modal{width:100%;height:100%;display:grid;grid-template-rows:auto minmax(0,1fr) auto;overflow:hidden;background:var(--dyx-panel)}",
  ".dyx-modal-head,.dyx-modal-foot{padding:15px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px}.dyx-modal-head{border-bottom:1px solid var(--dyx-line)}.dyx-modal-head h3{margin:0}.dyx-modal-foot{border-top:1px solid var(--dyx-line);justify-content:flex-end}.dyx-modal-body{padding:18px;overflow:auto}.dyx-form{display:grid;gap:12px}.dyx-two{display:grid;grid-template-columns:1fr 1fr;gap:11px}",
  ".dyx-detail-title{display:flex;align-items:flex-start;gap:10px;margin-bottom:14px}.dyx-detail-title h2{margin:0;font-size:20px}.dyx-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:12px 0}.dyx-meta div{padding:9px 11px;border-radius:9px;background:var(--dyx-panel2)}.dyx-meta small{display:block;color:var(--dyx-muted)}",
  ".dyx-rich{line-height:1.75;overflow-wrap:anywhere}.dyx-rich img{max-width:100%;height:auto}.dyx-rich pre,.dyx-log{overflow:auto;padding:13px;border-radius:10px;color:#d1fae5;background:#0f172a;font:12px/1.65 Consolas,Monaco,monospace;white-space:pre-wrap}.dyx-rich table{border-collapse:collapse}.dyx-rich td,.dyx-rich th{border:1px solid var(--dyx-line);padding:6px}",
  ".dyx-comments{display:grid;gap:10px}.dyx-comment{padding:12px;border:1px solid var(--dyx-line);border-radius:10px}.dyx-comment-head{display:flex;justify-content:space-between;margin-bottom:7px;color:var(--dyx-muted);font-size:12px}",
  ".dyx-status-row{display:flex;align-items:end;gap:8px}.dyx-status-row .dyx-field{min-width:180px}.dyx-note{padding:10px 12px;border-radius:9px;color:#a16207;background:rgba(245,158,11,.13)}",
  ".dyx-stage{margin:7px 0;padding:10px 12px;display:grid;grid-template-columns:10px 1fr auto;align-items:center;gap:10px;border:1px solid var(--dyx-line);border-radius:9px}.dyx-dot{width:9px;height:9px;border-radius:50%;background:#94a3b8}.dyx-dot.SUCCESS{background:#16a34a}.dyx-dot.RUNNING{background:#f59e0b}.dyx-dot.FAIL,.dyx-dot.FAILED{background:#dc2626}",
  ".dyx-record-list{display:grid;gap:9px}.dyx-record{padding:12px;border:1px solid var(--dyx-line);border-radius:11px;background:var(--dyx-panel2)}.dyx-record-head,.dyx-record-foot{display:flex;align-items:center;justify-content:space-between;gap:9px}.dyx-record-title{margin:9px 0;color:var(--dyx-text);font-size:14px;font-weight:650;line-height:1.45}.dyx-record-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;color:var(--dyx-muted);font-size:12px}.dyx-record-foot{margin-top:10px;padding-top:9px;border-top:1px solid var(--dyx-line)}",
  ".dyx-inline-status{width:150px;min-height:32px;padding:5px 28px 5px 9px;font-size:12px}",
  ".dyx-toast-wrap{position:absolute;z-index:60;right:12px;top:12px;display:grid;gap:8px}.dyx-toast{max-width:340px;padding:10px 14px;border:1px solid var(--dyx-line);border-radius:10px;background:var(--dyx-panel);box-shadow:var(--dyx-shadow)}.dyx-toast.error{color:var(--dyx-danger)}",
  ".dyx-loading{opacity:.65;pointer-events:none}.dyx-stale{margin-bottom:10px;padding:8px 11px;border-radius:9px;color:#a16207;background:rgba(245,158,11,.12)}",
  "@container(max-width:430px){.dyx-main{padding:12px}.dyx-tools{grid-template-columns:1fr}.dyx-title{display:block}.dyx-title>.dyx-btn,.dyx-title>.dyx-actions{margin-top:9px}.dyx-modal-body{padding:14px}.dyx-head{padding:0 12px}.dyx-head-copy strong{font-size:15px}.dyx-nav button{font-size:12px}.dyx-nav button span:first-child{display:none}.dyx-status-row{align-items:stretch;flex-direction:column}.dyx-status-row .dyx-field{min-width:0}}",
  "@media(max-width:760px){.dyx-preview-host{inset:0;width:100%;border-radius:0}}"
].join("");

function node(tag, className, text) {
  var element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = String(text);
  return element;
}

function button(text, className, handler) {
  var value = node("button", "dyx-btn" + (className ? " " + className : ""), text);
  value.type = "button";
  if (handler) value.addEventListener("click", handler);
  return value;
}

function field(label, control) {
  var wrap = node("div", "dyx-field");
  wrap.append(node("label", "", label), control);
  return wrap;
}

function input(type, placeholder, value) {
  var element = node(type === "textarea" ? "textarea" : "input", type === "textarea" ? "dyx-textarea" : "dyx-input");
  if (type !== "textarea") element.type = type || "text";
  if (placeholder) element.placeholder = placeholder;
  if (value !== undefined && value !== null) element.value = value;
  return element;
}

function setBusy(element, busy) {
  if (!element) return;
  element.classList.toggle("dyx-loading", Boolean(busy));
}

function formatDate(value) {
  if (value === null || value === undefined || value === "") return "-";
  var date = typeof value === "number" || /^\d{13}$/.test(String(value)) ? new Date(Number(value)) : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function statusClass(status) {
  var normalized = String(status || "").toUpperCase();
  if (["SUCCESS", "DONE", "FINISHED", "已完成"].indexOf(normalized) >= 0) return "ok";
  if (["RUNNING", "QUEUED", "WAITING", "处理中"].indexOf(normalized) >= 0) return "run";
  if (["FAIL", "FAILED", "ERROR", "CANCELLED"].indexOf(normalized) >= 0) return "fail";
  return "";
}

function rpc(method, args) {
  return fetch("/api/d-yunxiao/rpc", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ method: method, args: args || {} })
  }).then(function (response) {
    return response.text().then(function (text) {
      var payload = {};
      try { payload = JSON.parse(text); } catch (error) {}
      if (!response.ok || !payload.ok) throw new Error(payload.message || ("请求失败（HTTP " + response.status + "）"));
      return payload.data;
    });
  });
}

function toast(message, error) {
  var workspaceRoot = document.getElementById(ROOT_ID);
  var wrap = workspaceRoot && workspaceRoot.querySelector(".dyx-toast-wrap");
  if (!wrap) {
    wrap = node("div", "dyx-toast-wrap");
    (workspaceRoot || document.body).append(wrap);
  }
  var item = node("div", "dyx-toast" + (error ? " error" : ""), message);
  wrap.append(item);
  setTimeout(function () { item.remove(); if (!wrap.childNodes.length) wrap.remove(); }, error ? 5000 : 2600);
}

function empty(title, detail) {
  var wrap = node("div", "dyx-empty");
  wrap.append(node("strong", "", title), node("div", "", detail || ""));
  return wrap;
}

function modal(title, wide) {
  var workspaceRoot = document.getElementById(ROOT_ID);
  if (!workspaceRoot) throw new Error("云效工作台尚未挂载");
  var drawer = node("div", "dyx-drawer");
  var box = node("div", "dyx-modal");
  var head = node("div", "dyx-modal-head");
  var body = node("div", "dyx-modal-body");
  var foot = node("div", "dyx-modal-foot");
  var closed = false;
  function closeDrawer() {
    if (closed) return;
    closed = true;
    document.removeEventListener("keydown", onKeyDown);
    drawer.remove();
  }
  function onKeyDown(event) { if (event.key === "Escape") closeDrawer(); }
  var close = button("×", "dyx-close", closeDrawer);
  close.setAttribute("aria-label", "关闭" + title);
  head.append(node("h3", "", title), close);
  box.append(head, body, foot);
  drawer.append(box);
  workspaceRoot.append(drawer);
  document.addEventListener("keydown", onKeyDown);
  return { overlay: drawer, box: box, body: body, foot: foot, close: closeDrawer };
}

function createWorkspace(onRequestClose) {
  var state = {
    server: { accounts: [], selectedAccountId: "" },
    tab: "overview",
    projects: [],
    defects: { items: [], total: 0, page: 1, pageSize: PAGE_SIZE },
    defectFilters: { statusId: "", assignedToId: "" },
    defectStatusOptions: [],
    defectAssigneeOptions: [],
    defectStatuses: {},
    defectStatusLoading: {},
    defectStatusSaving: {},
    pipelines: { items: [], total: 0, page: 1, pageSize: PAGE_SIZE },
    pipelineKeyword: "",
    open: false
  };
  var root;
  var shell;
  var main;
  var subtitle;
  var navButtons = {};
  var defectStatusFilterControl;
  var defectAssigneeFilterControl;

  function selectedAccount() {
    return state.server.accounts.find(function (item) { return item.id === state.server.selectedAccountId; }) || null;
  }

  function selectedProject() {
    return selectedAccount() && selectedAccount().selectedProject || null;
  }

  function rpcArgs(extra) {
    var account = selectedAccount();
    var project = selectedProject();
    return Object.assign({
      accountId: account && account.id || "",
      projectId: project && project.id || ""
    }, extra || {});
  }

  function updateSubtitle() {
    var account = selectedAccount();
    var project = selectedProject();
    subtitle.textContent = account ? account.name + (project ? " · " + project.name : " · 未选择项目") : "尚未配置账号";
  }

  function loadState() {
    return rpc("state.get").then(function (value) {
      state.server = value;
      updateSubtitle();
      return value;
    });
  }

  function setTab(tab) {
    state.tab = tab;
    Object.keys(navButtons).forEach(function (key) { navButtons[key].classList.toggle("active", key === tab); });
    render();
    if (tab === "defects" && selectedProject()) loadDefects();
    if (tab === "pipelines" && selectedProject()) loadPipelines();
  }

  function render() {
    main.textContent = "";
    if (state.tab === "overview") renderOverview();
    if (state.tab === "defects") renderDefects();
    if (state.tab === "pipelines") renderPipelines();
  }

  function renderOverview() {
    var section = node("section", "dyx-section");
    var title = node("div", "dyx-title");
    var copy = node("div");
    copy.append(node("h2", "", "账号与项目"), node("p", "", "令牌、当前项目和轻量缓存保存在一个 JSON 文本文件中。"));
    title.append(copy, button("新增账号", "primary", function () { openAccountForm(null); }));
    section.append(title);

    var accountsCard = node("div", "dyx-card");
    var accountsHead = node("div", "dyx-card-head");
    accountsHead.append(node("h3", "", "云效账号"), node("small", "", state.server.accounts.length + " 个"));
    accountsCard.append(accountsHead);
    if (!state.server.accounts.length) {
      accountsCard.append(empty("还没有云效账号", "新增账号后即可读取项目、缺陷和流水线。"));
    } else {
      var grid = node("div", "dyx-grid");
      state.server.accounts.forEach(function (account) {
        var card = node("div", "dyx-account" + (account.id === state.server.selectedAccountId ? " active" : ""));
        var top = node("div", "dyx-account-top");
        var avatar = node("div", "dyx-avatar", (account.name || "云").slice(0, 1));
        var grow = node("div", "dyx-grow");
        grow.append(node("strong", "", account.name), node("small", "", account.organizationId));
        top.append(avatar, grow, node("span", "dyx-badge " + (account.hasToken ? "ok" : "fail"), account.hasToken ? "令牌已配置" : "缺少令牌"));
        top.addEventListener("click", function () { chooseAccount(account.id); });
        var actions = node("div", "dyx-actions");
        actions.append(
          button("编辑", "", function () { openAccountForm(account); }),
          button("删除", "danger", function () { removeAccount(account); })
        );
        card.append(top, actions);
        grid.append(card);
      });
      accountsCard.append(grid);
    }
    section.append(accountsCard);

    var projectCard = node("div", "dyx-card");
    var projectHead = node("div", "dyx-card-head");
    projectHead.append(node("h3", "", "当前项目"), button("从云效刷新", "", loadProjects));
    projectCard.append(projectHead);
    var account = selectedAccount();
    if (!account) {
      projectCard.append(empty("请先选择账号", "项目按账号和组织分别读取。"));
    } else {
      var row = node("div", "dyx-project-row");
      var select = node("select", "dyx-select");
      var placeholder = node("option", "", state.projects.length ? "选择一个项目" : "点击右侧按钮读取项目");
      placeholder.value = "";
      select.append(placeholder);
      state.projects.forEach(function (project) {
        var option = node("option", "", project.name);
        option.value = project.id;
        if (account.selectedProject && account.selectedProject.id === project.id) option.selected = true;
        select.append(option);
      });
      row.append(select, button("设为当前项目", "primary", function () {
        var project = state.projects.find(function (item) { return item.id === select.value; });
        if (!project) return toast("请选择项目", true);
        setBusy(projectCard, true);
        rpc("project.select", { accountId: account.id, project: project })
          .then(loadState)
          .then(function () { toast("已切换到“" + project.name + "”"); render(); })
          .catch(function (error) { toast(error.message, true); })
          .finally(function () { setBusy(projectCard, false); });
      }));
      projectCard.append(row);
      var current = node("div", "dyx-current");
      if (account.selectedProject) current.append(node("span", "", "当前："), node("strong", "", account.selectedProject.name), node("span", "", "  ·  " + account.selectedProject.id));
      else current.textContent = "尚未选择项目。选择后，缺陷与流水线页面会自动使用该项目上下文。";
      projectCard.append(current);
    }
    section.append(projectCard);
    main.append(section);
  }

  function openAccountForm(account) {
    var dialog = modal(account ? "编辑云效账号" : "新增云效账号");
    var form = node("div", "dyx-form");
    var nameInput = input("text", "例如：研发账号", account && account.name || "");
    var orgInput = input("text", "云效组织 ID", account && account.organizationId || "");
    var tokenInput = input("password", account ? "留空表示不修改" : "个人访问令牌");
    var remarkInput = input("textarea", "用途或备注", account && account.remark || "");
    form.append(field("账号名称 *", nameInput), field("组织 ID *", orgInput), field(account ? "个人访问令牌（留空不修改）" : "个人访问令牌 *", tokenInput), field("备注", remarkInput));
    dialog.body.append(form);
    dialog.foot.append(button("取消", "", dialog.close), button("保存", "primary", function (event) {
      var submit = event.currentTarget;
      submit.disabled = true;
      rpc("account.save", {
        id: account && account.id || "",
        name: nameInput.value,
        organizationId: orgInput.value,
        token: tokenInput.value,
        remark: remarkInput.value
      }).then(function () {
        dialog.close();
        state.projects = [];
        return loadState();
      }).then(function () { render(); toast("账号已保存"); })
        .catch(function (error) { toast(error.message, true); })
        .finally(function () { submit.disabled = false; });
    }));
  }

  function chooseAccount(id) {
    if (id === state.server.selectedAccountId) return;
    rpc("account.select", { accountId: id }).then(function () {
      state.projects = [];
      return loadState();
    }).then(function () { render(); }).catch(function (error) { toast(error.message, true); });
  }

  function removeAccount(account) {
    if (!window.confirm("删除账号“" + account.name + "”及其本地文本缓存？")) return;
    rpc("account.delete", { accountId: account.id }).then(function () {
      state.projects = [];
      return loadState();
    }).then(function () { render(); toast("账号已删除"); }).catch(function (error) { toast(error.message, true); });
  }

  function loadProjects() {
    var account = selectedAccount();
    if (!account) return toast("请先配置账号", true);
    setBusy(main, true);
    rpc("projects.list", { accountId: account.id }).then(function (result) {
      state.projects = result.items || [];
      render();
      if (result.stale) toast("云效连接失败，正在展示 " + formatDate(result.cachedAt) + " 的缓存", true);
      else toast("已读取 " + state.projects.length + " 个项目");
    }).catch(function (error) { toast(error.message, true); }).finally(function () { setBusy(main, false); });
  }

  function renderRequirement(section, kind) {
    var account = selectedAccount();
    var project = selectedProject();
    if (!account || !project) {
      var card = node("div", "dyx-card");
      card.append(empty(!account ? "请先配置云效账号" : "请先选择项目", "请到“账号与项目”完成设置。"));
      card.append(button("前往设置", "primary", function () { setTab("overview"); }));
      section.append(card);
      return false;
    }
    return true;
  }

  function renderDefects() {
    var section = node("section", "dyx-section");
    var title = node("div", "dyx-title");
    var copy = node("div");
    copy.append(node("h2", "", "缺陷"), node("p", "", "实时读取云效工作项，列表会保留最后一次成功结果作为离线缓存。"));
    title.append(copy, button("刷新", "", loadDefects));
    section.append(title);
    if (!renderRequirement(section)) { main.append(section); return; }
    var card = node("div", "dyx-card");
    var tools = node("div", "dyx-defect-filters");
    var status = node("select", "dyx-select");
    status.setAttribute("aria-label", "按状态筛选");
    status.append(node("option", "", "全部状态"));
    state.defectStatusOptions.forEach(function (item) { var option = node("option", "", item.name); option.value = item.id; status.append(option); });
    status.value = state.defectFilters.statusId;
    var assignee = node("select", "dyx-select");
    assignee.setAttribute("aria-label", "按负责人筛选");
    assignee.append(node("option", "", "全部负责人"));
    state.defectAssigneeOptions.forEach(function (item) { var option = node("option", "", item.name); option.value = item.id; assignee.append(option); });
    assignee.value = state.defectFilters.assignedToId;
    defectStatusFilterControl = status;
    defectAssigneeFilterControl = assignee;
    function autoQuery() {
      state.defects.page = 1;
      loadDefects();
    }
    function filterWithClear(select, key, label) {
      var wrap = node("div", "dyx-filter-control");
      var clear = node("button", "dyx-filter-clear", "×");
      clear.type = "button";
      clear.setAttribute("aria-label", "清空" + label);
      clear.hidden = !select.value;
      select.addEventListener("change", function () {
        state.defectFilters[key] = select.value;
        clear.hidden = !select.value;
        autoQuery();
      });
      clear.addEventListener("click", function () {
        if (!select.value) return;
        select.value = "";
        state.defectFilters[key] = "";
        clear.hidden = true;
        autoQuery();
      });
      wrap.append(select, clear);
      return wrap;
    }
    tools.append(field("状态", filterWithClear(status, "statusId", "状态")), field("负责人", filterWithClear(assignee, "assignedToId", "负责人")));
    card.append(tools);
    if (state.defects.stale) card.append(node("div", "dyx-stale", "云效暂时不可用，当前为 " + formatDate(state.defects.cachedAt) + " 的缓存。"));
    if (!state.defects.items.length) card.append(empty("暂无缺陷", "可调整关键词后重新查询。"));
    else card.append(defectTable(state.defects.items));
    card.append(pager(state.defects, function (next) { state.defects.page = next; loadDefects(); }));
    section.append(card);
    main.append(section);
  }

  function defectTable(items) {
    var wrap = node("div", "dyx-record-list");
    items.forEach(function (item) {
      var card = node("article", "dyx-record");
      var head = node("div", "dyx-record-head");
      var statusSelect = node("select", "dyx-select dyx-inline-status");
      statusSelect.setAttribute("aria-label", "修改 " + (item.serialNumber || "缺陷") + " 状态");
      fillListStatusSelect(statusSelect, item);
      statusSelect.addEventListener("pointerdown", function () { loadListStatuses(item, statusSelect); });
      statusSelect.addEventListener("focus", function () { loadListStatuses(item, statusSelect); });
      statusSelect.addEventListener("change", function () { saveListStatus(item, statusSelect); });
      head.append(node("strong", "", item.serialNumber || "缺陷"), statusSelect);
      var title = node("button", "dyx-link dyx-record-title", item.subject || "未命名缺陷");
      title.type = "button";
      title.addEventListener("click", function () { openDefect(item); });
      var meta = node("div", "dyx-record-meta");
      meta.append(node("span", "", "负责人 " + (item.assignedToName || "未分配")), node("span", "", "·"), node("span", "", item.priority || item.severity || "未定级"));
      var foot = node("div", "dyx-record-foot");
      foot.append(node("span", "dyx-muted", formatDate(item.gmtModified)), button("查看详情", "", function () { openDefect(item); }));
      card.append(head, title, meta, foot);
      wrap.append(card);
    });
    return wrap;
  }

  function mergeDefectOptions(items, statuses) {
    var statusMap = new Map(state.defectStatusOptions.map(function (item) { return [item.id, item]; }));
    var assigneeMap = new Map(state.defectAssigneeOptions.map(function (item) { return [item.id, item]; }));
    (items || []).forEach(function (item) {
      if (item.statusId && item.statusName) statusMap.set(item.statusId, { id: item.statusId, name: item.statusName });
      if (item.assignedToId && item.assignedToName) assigneeMap.set(item.assignedToId, { id: item.assignedToId, name: item.assignedToName });
    });
    (statuses || []).forEach(function (item) { if (item.id && item.name) statusMap.set(item.id, item); });
    state.defectStatusOptions = Array.from(statusMap.values());
    state.defectAssigneeOptions = Array.from(assigneeMap.values());
    if (defectStatusFilterControl && defectStatusFilterControl.isConnected) {
      var selectedStatus = defectStatusFilterControl.value;
      defectStatusFilterControl.textContent = "";
      defectStatusFilterControl.append(node("option", "", "全部状态"));
      state.defectStatusOptions.forEach(function (item) { var option = node("option", "", item.name); option.value = item.id; defectStatusFilterControl.append(option); });
      defectStatusFilterControl.value = selectedStatus;
    }
    if (defectAssigneeFilterControl && defectAssigneeFilterControl.isConnected) {
      var selectedAssignee = defectAssigneeFilterControl.value;
      defectAssigneeFilterControl.textContent = "";
      defectAssigneeFilterControl.append(node("option", "", "全部负责人"));
      state.defectAssigneeOptions.forEach(function (item) { var option = node("option", "", item.name); option.value = item.id; defectAssigneeFilterControl.append(option); });
      defectAssigneeFilterControl.value = selectedAssignee;
    }
  }

  function fillListStatusSelect(select, item) {
    var statuses = state.defectStatuses[item.id] || [];
    if (!statuses.length && item.statusId) statuses = [{ id: item.statusId, name: item.statusName || "当前状态" }];
    select.textContent = "";
    statuses.forEach(function (status) { var option = node("option", "", status.name); option.value = status.id; select.append(option); });
    if (!statuses.length) { var emptyOption = node("option", "", item.statusName || "未知状态"); emptyOption.value = item.statusId || ""; select.append(emptyOption); }
    select.value = item.statusId || "";
    select.disabled = Boolean(state.defectStatusSaving[item.id]);
  }

  function loadListStatuses(item, select) {
    if (state.defectStatuses[item.id] || state.defectStatusLoading[item.id]) return;
    state.defectStatusLoading[item.id] = true;
    rpc("defect.statuses", rpcArgs({ defectId: item.id })).then(function (statuses) {
      state.defectStatuses[item.id] = statuses || [];
      mergeDefectOptions([], statuses);
      fillListStatusSelect(select, item);
    }).catch(function (error) { toast(error.message, true); }).finally(function () {
      delete state.defectStatusLoading[item.id];
      select.disabled = Boolean(state.defectStatusSaving[item.id]);
    });
  }

  function saveListStatus(item, select) {
    var statusId = select.value;
    if (!statusId || statusId === item.statusId || state.defectStatusSaving[item.id]) return;
    var previousStatusId = item.statusId;
    state.defectStatusSaving[item.id] = true;
    select.disabled = true;
    rpc("defect.status.update", rpcArgs({ defectId: item.id, statusId: statusId })).then(function (updated) {
      Object.assign(item, updated);
      mergeDefectOptions([updated], state.defectStatuses[item.id]);
      fillListStatusSelect(select, item);
      toast("缺陷状态已更新");
    }).catch(function (error) {
      select.value = previousStatusId || "";
      toast(error.message, true);
    }).finally(function () {
      delete state.defectStatusSaving[item.id];
      select.disabled = false;
    });
  }

  function pager(pageData, onPage) {
    var wrap = node("div", "dyx-page");
    var pages = Math.max(1, Math.ceil((pageData.total || 0) / (pageData.pageSize || PAGE_SIZE)));
    var prev = button("上一页", "", function () { onPage(Math.max(1, pageData.page - 1)); });
    var next = button("下一页", "", function () { onPage(Math.min(pages, pageData.page + 1)); });
    prev.disabled = pageData.page <= 1; next.disabled = pageData.page >= pages;
    wrap.append(prev, node("span", "", "第 " + pageData.page + " / " + pages + " 页 · 共 " + (pageData.total || 0) + " 条"), next);
    return wrap;
  }

  function loadDefects() {
    if (!selectedProject()) return render();
    setBusy(main, true);
    rpc("defects.list", rpcArgs({
      page: state.defects.page,
      pageSize: state.defects.pageSize,
      statusId: state.defectFilters.statusId,
      assignedToId: state.defectFilters.assignedToId
    })).then(function (result) {
      state.defects = result;
      mergeDefectOptions(result.items);
      render();
    }).catch(function (error) { toast(error.message, true); }).finally(function () { setBusy(main, false); });
  }

  function openDefect(item) {
    var dialog = modal("缺陷详情", true);
    dialog.body.append(empty("正在读取", item.serialNumber || item.id));
    rpc("defect.get", rpcArgs({ defectId: item.id })).then(function (detail) {
      renderDefectDetail(dialog, detail);
    }).catch(function (error) { dialog.body.textContent = ""; dialog.body.append(empty("读取失败", error.message)); });
  }

  function renderDefectDetail(dialog, detail) {
    dialog.body.textContent = "";
    var item = detail.defect;
    var title = node("div", "dyx-detail-title");
    title.append(node("span", "dyx-badge", item.serialNumber || "缺陷"), node("h2", "", item.subject || "未命名缺陷"));
    dialog.body.append(title);
    var statusRow = node("div", "dyx-status-row");
    var select = node("select", "dyx-select");
    (detail.statuses || []).forEach(function (status) {
      var option = node("option", "", status.name); option.value = status.id; option.selected = status.id === item.statusId; select.append(option);
    });
    if (!detail.statuses || !detail.statuses.length) { var current = node("option", "", item.statusName || "未知状态"); current.value = item.statusId || ""; select.append(current); select.disabled = true; }
    statusRow.append(field("状态", select), button("保存状态", "primary", function (event) {
      if (!select.value || select.value === item.statusId) return;
      var submit = event.currentTarget; submit.disabled = true;
      rpc("defect.status.update", rpcArgs({ defectId: item.id, statusId: select.value })).then(function (updated) {
        detail.defect = updated; item = updated;
        var listed = state.defects.items.find(function (entry) { return entry.id === updated.id; });
        if (listed) Object.assign(listed, updated);
        toast("缺陷状态已更新");
      }).catch(function (error) { toast(error.message, true); }).finally(function () { submit.disabled = false; });
    }));
    dialog.body.append(statusRow);
    var meta = node("div", "dyx-meta");
    [["负责人", item.assignedToName], ["创建人", item.creatorName], ["迭代", item.sprintName], ["优先级", item.priority || item.severity], ["更新时间", formatDate(item.gmtModified)]].forEach(function (pair) {
      var box = node("div"); box.append(node("small", "", pair[0]), node("span", "", pair[1] || "-")); meta.append(box);
    });
    dialog.body.append(meta);
    if (detail.warning) dialog.body.append(node("div", "dyx-note", detail.warning));
    dialog.body.append(node("h3", "", "描述"));
    var rich = node("div", "dyx-rich"); renderRich(rich, detail.description || "", detail.descriptionFormat || "RICHTEXT", detail.attachments || []); dialog.body.append(rich);
    if (detail.attachments && detail.attachments.length) {
      dialog.body.append(node("h3", "", "附件"));
      var files = node("div", "dyx-actions");
      detail.attachments.forEach(function (file) { var link = node("a", "dyx-btn", file.fileName); link.href = safeUrl(file.url); link.target = "_blank"; link.rel = "noopener noreferrer"; files.append(link); });
      dialog.body.append(files);
    }
    if (detail.comments && detail.comments.length) {
      dialog.body.append(node("h3", "", "评论（" + detail.comments.length + "）"));
      var comments = node("div", "dyx-comments");
      detail.comments.forEach(function (comment) {
        var card = node("div", "dyx-comment");
        var head = node("div", "dyx-comment-head"); head.append(node("strong", "", comment.userName || "匿名"), node("span", "", formatDate(comment.gmtCreate)));
        var content = node("div", "dyx-rich"); renderRich(content, comment.content || "", comment.contentFormat || "RICHTEXT", detail.attachments || []);
        card.append(head, content); comments.append(card);
      });
      dialog.body.append(comments);
    }
    dialog.foot.textContent = ""; dialog.foot.append(button("关闭", "", dialog.close));
  }

  function renderPipelines() {
    var section = node("section", "dyx-section");
    var title = node("div", "dyx-title");
    var copy = node("div"); copy.append(node("h2", "", "流水线"), node("p", "", "组织级列表，可查看代码源、运行记录和任务日志，并手动触发运行。"));
    title.append(copy, button("刷新", "", loadPipelines)); section.append(title);
    if (!renderRequirement(section)) { main.append(section); return; }
    var card = node("div", "dyx-card");
    var tools = node("div", "dyx-tools");
    var keyword = input("text", "流水线名称", state.pipelineKeyword);
    tools.append(field("关键词", keyword), node("div"), button("查询", "primary", function () { state.pipelineKeyword = keyword.value.trim(); state.pipelines.page = 1; loadPipelines(); }), button("清空", "", function () { state.pipelineKeyword = ""; state.pipelines.page = 1; loadPipelines(); }));
    card.append(tools);
    if (state.pipelines.stale) card.append(node("div", "dyx-stale", "云效暂时不可用，当前为 " + formatDate(state.pipelines.cachedAt) + " 的缓存。"));
    if (!state.pipelines.items.length) card.append(empty("暂无流水线", "当前账号在该组织中可能没有流水线权限。"));
    else card.append(pipelineTable(state.pipelines.items));
    card.append(pager(state.pipelines, function (next) { state.pipelines.page = next; loadPipelines(); }));
    section.append(card); main.append(section);
  }

  function pipelineTable(items) {
    var wrap = node("div", "dyx-record-list");
    items.forEach(function (item) {
      var card = node("article", "dyx-record");
      var head = node("div", "dyx-record-head");
      head.append(node("span", "dyx-badge", "#" + item.id), node("span", "dyx-badge " + statusClass(item.status), item.status || "暂无运行"));
      var title = node("button", "dyx-link dyx-record-title", item.name || "未命名流水线");
      title.type = "button";
      title.addEventListener("click", function () { openPipeline(item); });
      var foot = node("div", "dyx-record-foot");
      var actions = node("div", "dyx-actions");
      actions.append(button("详情", "", function () { openPipeline(item); }), button("运行", "primary", function () { openRunPipeline(item); }));
      foot.append(node("span", "dyx-muted", formatDate(item.updateTime)), actions);
      card.append(head, title, foot);
      wrap.append(card);
    });
    return wrap;
  }

  function loadPipelines() {
    if (!selectedProject()) return render();
    setBusy(main, true);
    rpc("pipelines.list", rpcArgs({ page: state.pipelines.page, pageSize: state.pipelines.pageSize, keyword: state.pipelineKeyword })).then(function (result) {
      state.pipelines = result; render();
    }).catch(function (error) { toast(error.message, true); }).finally(function () { setBusy(main, false); });
  }

  function openPipeline(item) {
    var dialog = modal("流水线详情", true); dialog.body.append(empty("正在读取", item.name));
    Promise.all([
      rpc("pipeline.get", rpcArgs({ pipelineId: item.id })),
      rpc("pipeline.runs", rpcArgs({ pipelineId: item.id, page: 1, pageSize: 10 }))
    ]).then(function (values) { renderPipelineDetail(dialog, values[0], values[1]); })
      .catch(function (error) { dialog.body.textContent = ""; dialog.body.append(empty("读取失败", error.message)); });
  }

  function renderPipelineDetail(dialog, detail, runs) {
    dialog.body.textContent = "";
    var p = detail.pipeline;
    var heading = node("div", "dyx-title"); var copy = node("div"); copy.append(node("h2", "", p.name), node("p", "", "ID " + p.id + (detail.envName ? " · " + detail.envName : "")));
    heading.append(copy, button("运行流水线", "primary", function () { openRunPipeline(p); })); dialog.body.append(heading);
    if (detail.sources && detail.sources.length) {
      dialog.body.append(node("h3", "", "代码源"));
      var sources = node("div", "dyx-meta"); detail.sources.forEach(function (source) { var box = node("div"); box.append(node("small", "", source.type || "代码源"), node("strong", "", source.name), node("div", "dyx-muted", source.defaultBranch || source.repo || "-")); sources.append(box); }); dialog.body.append(sources);
    }
    dialog.body.append(node("h3", "", "最近运行"));
    if (!runs.items || !runs.items.length) dialog.body.append(empty("暂无运行记录", ""));
    else {
      var runList = node("div", "dyx-record-list");
      runs.items.forEach(function (run) {
        var card = node("article", "dyx-record");
        var head = node("div", "dyx-record-head");
        head.append(node("strong", "", "运行 #" + run.pipelineRunId), node("span", "dyx-badge " + statusClass(run.status), run.status || "-"));
        var meta = node("div", "dyx-record-meta");
        meta.append(node("span", "", "开始 " + formatDate(run.startTime)), node("span", "", "结束 " + formatDate(run.endTime)));
        var foot = node("div", "dyx-record-foot");
        foot.append(node("span", "dyx-muted", triggerLabel(run.triggerMode)), button("查看运行", "", function () { openPipelineRun(p, run); }));
        card.append(head, meta, foot); runList.append(card);
      });
      dialog.body.append(runList);
    }
    dialog.foot.textContent = ""; dialog.foot.append(button("关闭", "", dialog.close));
  }

  function openRunPipeline(pipeline) {
    var dialog = modal("运行流水线：" + pipeline.name, true);
    dialog.body.append(empty("正在读取代码源与分支", "Codeup 分支会自动加载，其他代码源仍可手动填写。"));
    rpc("pipeline.branches", rpcArgs({ pipelineId: pipeline.id })).then(function (sources) {
      dialog.body.textContent = "";
      var form = node("div", "dyx-form");
      var sourceFields = [];
      (sources || []).forEach(function (source) {
        var control;
        if (source.branches && source.branches.length) {
          control = node("select", "dyx-select");
          if (source.isBranchMode) { control.multiple = true; control.size = Math.min(5, Math.max(3, source.branches.length)); }
          else { var blank = node("option", "", "使用默认配置"); blank.value = ""; control.append(blank); }
          source.branches.forEach(function (branch) { var option = node("option", "", branch); option.value = branch; option.selected = branch === source.defaultBranch; control.append(option); });
        } else control = input("text", "留空使用默认配置", source.defaultBranch || "");
        control.setAttribute("aria-label", source.name + "运行分支");
        form.append(field(source.name + (source.isBranchMode ? " · 运行分支（可多选）" : " · 运行分支"), control));
        if (source.warning) form.append(node("div", "dyx-note", source.warning));
        sourceFields.push({ source: source, control: control });
      });
      if (!sourceFields.length) form.append(empty("没有可配置的代码源", "将使用流水线默认配置运行。"));
      var commentInput = input("textarea", "可选，填写本次运行备注");
      form.append(field("运行备注", commentInput)); dialog.body.append(form);
      dialog.foot.textContent = ""; dialog.foot.append(button("取消", "", dialog.close), button("确认运行", "primary", function (event) {
        var runningBranches = {}; var branchModeBranches = [];
        sourceFields.forEach(function (entry) {
          if (entry.source.isBranchMode && entry.control.multiple) {
            Array.from(entry.control.selectedOptions).forEach(function (option) { if (option.value.trim()) branchModeBranches.push(option.value.trim()); });
            return;
          }
          var value = entry.control.value.trim(); if (!value) return;
          if (entry.source.isBranchMode) branchModeBranches.push(value); else if (entry.source.repo) runningBranches[entry.source.repo] = value;
        });
        var submit = event.currentTarget; submit.disabled = true;
        rpc("pipeline.run.create", rpcArgs({ pipelineId: pipeline.id, branchModeBranches: branchModeBranches, runningBranches: runningBranches, comment: commentInput.value })).then(function (result) {
          dialog.close(); toast("流水线已开始运行，实例 #" + result.pipelineRunId); loadPipelines();
        }).catch(function (error) { toast(error.message, true); }).finally(function () { submit.disabled = false; });
      }));
    }).catch(function (error) { dialog.body.textContent = ""; dialog.body.append(empty("代码源读取失败", error.message)); });
  }

  function openPipelineRun(pipeline, run) {
    var dialog = modal("运行 #" + run.pipelineRunId, true); dialog.body.append(empty("正在读取运行详情", pipeline.name));
    rpc("pipeline.run.get", rpcArgs({ pipelineId: pipeline.id, pipelineRunId: run.pipelineRunId })).then(function (detail) {
      dialog.body.textContent = "";
      var title = node("div", "dyx-detail-title"); title.append(node("span", "dyx-badge " + statusClass(detail.status), detail.status || "未知"), node("h2", "", pipeline.name + " · #" + detail.pipelineRunId)); dialog.body.append(title);
      var meta = node("div", "dyx-meta"); [["开始", formatDate(detail.startTime)], ["结束", formatDate(detail.endTime)], ["触发方式", triggerLabel(detail.triggerMode)]].forEach(function (pair) { var box = node("div"); box.append(node("small", "", pair[0]), node("span", "", pair[1])); meta.append(box); }); dialog.body.append(meta);
      dialog.body.append(node("h3", "", "阶段与任务"));
      var stages = flattenStages(detail.stages || []);
      if (!stages.length) dialog.body.append(empty("未返回阶段信息", ""));
      stages.forEach(function (stage) {
        var row = node("div", "dyx-stage"); row.append(node("span", "dyx-dot " + String(stage.status || "").toUpperCase()), node("span", "", (stage.level ? "  ".repeat(stage.level) : "") + (stage.name || "未命名任务")));
        var action = node("div", "dyx-actions"); action.append(node("span", "dyx-badge " + statusClass(stage.status), stage.status || "-"));
        if (stage.jobId) action.append(button("日志", "", function () { openJobLog(pipeline.id, detail.pipelineRunId, stage.jobId, stage.name); })); row.append(action); dialog.body.append(row);
      });
      if (detail.globalParams && detail.globalParams.length) {
        dialog.body.append(node("h3", "", "运行参数")); var pre = node("pre", "dyx-log", JSON.stringify(detail.globalParams, null, 2)); dialog.body.append(pre);
      }
      dialog.foot.textContent = ""; dialog.foot.append(button("关闭", "", dialog.close));
    }).catch(function (error) { dialog.body.textContent = ""; dialog.body.append(empty("读取失败", error.message)); });
  }

  function openJobLog(pipelineId, runId, jobId, title) {
    var dialog = modal((title || "任务") + " · 日志", true); var pre = node("pre", "dyx-log", "正在读取…"); dialog.body.append(pre);
    rpc("pipeline.log", rpcArgs({ pipelineId: pipelineId, pipelineRunId: runId, jobId: jobId })).then(function (value) { pre.textContent = value.content || "日志为空"; }).catch(function (error) { pre.textContent = error.message; });
    dialog.foot.append(button("关闭", "", dialog.close));
  }

  function triggerLabel(mode) {
    return ({ 1: "手动", 2: "定时", 3: "代码提交", 5: "流水线", 6: "Webhook" })[mode] || "-";
  }

  function flattenStages(stages) {
    var result = [];
    function visit(item, level) {
      if (!item || typeof item !== "object") return;
      var isJob = Boolean(item.jobId) || String(item.type || item.nodeType || "").toUpperCase() === "JOB";
      var jobId = item.jobId || (isJob ? item.id : "");
      result.push({ name: item.name || item.stageName || item.jobName || item.displayName, status: item.status, jobId: jobId, level: level });
      ["jobs", "children", "stages", "stageGroup"].forEach(function (key) { if (Array.isArray(item[key])) item[key].forEach(function (child) { visit(child, level + 1); }); });
    }
    stages.forEach(function (item) { visit(item, 0); }); return result;
  }

  function mount(container) {
    root = node("div", "dyx-root"); root.id = ROOT_ID;
    shell = node("div", "dyx-shell");
    var head = node("header", "dyx-head"); var logo = node("div", "dyx-logo", "云"); var copy = node("div", "dyx-head-copy"); copy.append(node("strong", "", "云效工作台")); subtitle = node("span", "", "正在读取配置…"); copy.append(subtitle);
    var closeButton = button("×", "dyx-close", close); closeButton.setAttribute("aria-label", "关闭云效工作台");
    head.append(logo, copy, closeButton);
    var body = node("div", "dyx-body"); var nav = node("nav", "dyx-nav");
    [["overview", "◎", "账号与项目"], ["defects", "◇", "缺陷"], ["pipelines", "⌁", "流水线"]].forEach(function (item) {
      var tab = node("button", item[0] === state.tab ? "active" : ""); tab.type = "button"; tab.append(node("span", "", item[1]), node("span", "", item[2])); tab.addEventListener("click", function () { setTab(item[0]); }); navButtons[item[0]] = tab; nav.append(tab);
    });
    main = node("main", "dyx-main"); body.append(nav, main); shell.append(head, body); root.append(shell); (container || document.body).append(root);
    render();
    loadState().then(function () { render(); }).catch(function (error) { toast(error.message, true); });
  }

  function close() {
    if (typeof onRequestClose === "function") onRequestClose();
    else dispose();
  }

  function dispose() {
    if (root) root.querySelectorAll(".dyx-drawer .dyx-close").forEach(function (item) { item.click(); });
    var value = document.getElementById(ROOT_ID); if (value) value.remove();
    root = null;
  }

  return { mount: mount, dispose: dispose };
}

var ALLOWED_TAGS = new Set(["A", "BLOCKQUOTE", "BR", "CODE", "DEL", "DIV", "EM", "FIGCAPTION", "FIGURE", "H1", "H2", "H3", "H4", "H5", "H6", "HR", "IMG", "LI", "OL", "P", "PRE", "S", "SPAN", "STRONG", "TABLE", "TBODY", "TD", "TH", "THEAD", "TR", "U", "UL"]);
var SHARED_ATTRS = new Set(["title"]);
var TAG_ATTRS = { A: new Set(["href"]), IMG: new Set(["src", "alt", "width", "height"]), TD: new Set(["colspan", "rowspan"]), TH: new Set(["colspan", "rowspan"]) };

function safeUrl(value, image) {
  var text = String(value || "").trim();
  if (!text) return "";
  if (image && /^data:image\/(?:png|jpe?g|gif|webp);base64,/i.test(text)) return text;
  try { var parsed = new URL(text, window.location.origin); return ["http:", "https:"].indexOf(parsed.protocol) >= 0 ? parsed.href : ""; } catch (error) { return ""; }
}

function appendJsonMl(parent, value) {
  if (value === null || value === undefined || value === false) return;
  if (typeof value === "string" || typeof value === "number") { parent.append(document.createTextNode(String(value))); return; }
  if (!Array.isArray(value) || !value.length || typeof value[0] !== "string") return;
  var tag = value[0].toLowerCase(); var hasAttrs = value[1] && typeof value[1] === "object" && !Array.isArray(value[1]); var offset = hasAttrs ? 2 : 1;
  if (tag === "root" || !ALLOWED_TAGS.has(tag.toUpperCase())) { value.slice(offset).forEach(function (child) { appendJsonMl(parent, child); }); return; }
  var element = document.createElement(tag); var attrs = hasAttrs ? value[1] : {};
  Object.keys(attrs).forEach(function (key) { var item = attrs[key]; if (typeof item === "string" || typeof item === "number") element.setAttribute(key, String(item)); });
  value.slice(offset).forEach(function (child) { appendJsonMl(element, child); }); parent.append(element);
}

function richSource(content, format) {
  var text = String(content || "");
  if (String(format || "").toUpperCase() === "MARKDOWN") { var pre = node("pre", "", text); return pre.outerHTML; }
  var trimmed = text.trim();
  if (trimmed.charAt(0) !== "{" && trimmed.charAt(0) !== "[") return text;
  try {
    var parsed = JSON.parse(trimmed); var template = document.createElement("template");
    if (Array.isArray(parsed)) appendJsonMl(template.content, parsed);
    else if (parsed && typeof parsed === "object") { if (typeof parsed.htmlValue === "string" && parsed.htmlValue.trim()) return parsed.htmlValue; if (parsed.jsonMLValue) appendJsonMl(template.content, parsed.jsonMLValue); }
    return template.innerHTML || text;
  } catch (error) { return text; }
}

function renderRich(container, content, format, attachments) {
  if (!String(content || "").trim()) { container.append(node("div", "dyx-muted", "暂无内容")); return; }
  var template = document.createElement("template"); template.innerHTML = richSource(content, format);
  Array.from(template.content.querySelectorAll("*")).forEach(function (element) {
    if (!ALLOWED_TAGS.has(element.tagName)) { element.replaceWith.apply(element, Array.from(element.childNodes)); return; }
    if (element.tagName === "IMG") {
      var allValues = Array.from(element.attributes).map(function (attr) { return attr.value; }).join(" ");
      var attachment = (attachments || []).find(function (item) { return item.fileId && allValues.indexOf(item.fileId) >= 0; });
      if (attachment) element.setAttribute("src", attachment.url);
    }
    var allowed = TAG_ATTRS[element.tagName] || new Set();
    Array.from(element.attributes).forEach(function (attr) { if (!SHARED_ATTRS.has(attr.name) && !allowed.has(attr.name)) element.removeAttribute(attr.name); });
    if (element.tagName === "IMG") { var src = safeUrl(element.getAttribute("src"), true); if (!src) { element.remove(); return; } element.src = src; element.loading = "lazy"; }
    if (element.tagName === "A") { var href = safeUrl(element.getAttribute("href")); if (!href) element.removeAttribute("href"); else { element.href = href; element.target = "_blank"; element.rel = "noopener noreferrer"; } }
  });
  container.append(template.content);
}

function apply(ctx) {
  var existingStyle = document.getElementById(STYLE_ID);
  var style = existingStyle || node("style");
  if (!existingStyle) { style.id = STYLE_ID; style.textContent = CSS; document.head.append(style); }

  var hasNativeSurface = Boolean(
    ReactRuntime && typeof ReactRuntime.createElement === "function" &&
    ctx.slots && ctx.layout
  );
  if (!hasNativeSurface) {
    var previewHost = node("div", "dyx-preview-host");
    document.body.append(previewHost);
    var previewWorkspace = createWorkspace(function () { previewHost.remove(); });
    previewWorkspace.mount(previewHost);
    ctx.effect(function () { return function () { previewWorkspace.dispose(); previewHost.remove(); if (!existingStyle) style.remove(); }; }, "dsh-yunxiao: standalone preview");
    return;
  }

  var panelOpen = false;
  var panelListeners = new Set();
  var workspaceFrame = null;
  function widenWorkspaceFrame() {
    requestAnimationFrame(function () {
      var overlay = document.querySelector("[data-shell-overlay]");
      var frame = overlay && overlay.parentElement;
      if (!frame) return;
      var match = String(frame.style.gridTemplateColumns || "").match(/^([\d.]+px)/);
      frame.style.setProperty("--dyx-sidebar-track", match ? match[1] : "280px");
      frame.setAttribute("data-dyx-workspace-open", "true");
      workspaceFrame = frame;
    });
  }
  function restoreWorkspaceFrame() {
    if (!workspaceFrame) return;
    workspaceFrame.removeAttribute("data-dyx-workspace-open");
    workspaceFrame.style.removeProperty("--dyx-sidebar-track");
    workspaceFrame = null;
  }
  function setPanelOpen(open) {
    var next = Boolean(open);
    if (panelOpen !== next) {
      panelOpen = next;
      panelListeners.forEach(function (listener) { listener(panelOpen); });
    }
    if (panelOpen) { ctx.layout.openDetails(); widenWorkspaceFrame(); }
    else { restoreWorkspaceFrame(); ctx.layout.closeDetails(); }
  }

  function RightWorkspace() {
    var openState = ReactRuntime.useState(panelOpen);
    var open = openState[0];
    var setOpen = openState[1];
    var hostRef = ReactRuntime.useRef(null);
    ReactRuntime.useEffect(function () {
      panelListeners.add(setOpen);
      return function () { panelListeners.delete(setOpen); };
    }, []);
    ReactRuntime.useEffect(function () {
      if (!open || !hostRef.current) return;
      var workspace = createWorkspace(function () { setPanelOpen(false); });
      workspace.mount(hostRef.current);
      return function () { workspace.dispose(); };
    }, [open]);
    if (!open) return null;
    return ReactRuntime.createElement("div", { className: "dyx-right-panel" },
      ReactRuntime.createElement("div", { ref: hostRef, className: "dyx-slot-host" }));
  }

  function SidebarTrigger(props) {
    var wide = Boolean(props && props.wide);
    return ReactRuntime.createElement("button", {
      type: "button",
      className: "dyx-sidebar-trigger",
      "data-wide": wide ? "true" : "false",
      "aria-label": "打开云效工作台",
      title: wide ? undefined : "云效工作台",
      onClick: function () { setPanelOpen(true); }
    },
    ReactRuntime.createElement("span", { className: "dyx-sidebar-trigger-mark", "aria-hidden": "true" }, "云"),
    wide ? ReactRuntime.createElement("span", null, "云效工作台") : null);
  }

  ctx.slots.inject("sidebar.footer.action", function () { return ctx.slots.register({
    name: "sidebar.footer.action",
    id: "dsh-yunxiao",
    label: "云效工作台"
  }, SidebarTrigger); });

  ctx.slots.inject("shell.overlay", function () { return ctx.slots.register({
    name: "shell.overlay",
    id: "dsh-yunxiao-workspace",
    label: "云效工作台"
  }, RightWorkspace); });

  ctx.effect(function () { return function () {
    panelOpen = false;
    panelListeners.clear();
    restoreWorkspaceFrame();
    ctx.layout.closeDetails();
    if (!existingStyle) style.remove();
  }; }, "dsh-yunxiao: reserved right workspace");
}

exports.apply = apply;
exports.inject = ["slots", "layout"];
return module.exports;
} });
