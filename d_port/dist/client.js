// dsh-port — 无框架、无构建步骤的 Windows 端口管理工作台。
window.__ModuleLoader__.load({ id: "dsh-port", factory: (require) => {
var module = { exports: {} };
var exports = module.exports;
var ReactRuntime = null;
try { ReactRuntime = require("react"); } catch (error) {}

var STYLE_ID = "dsh-port-style";
var ROOT_ID = "dsh-port-root";
var PAGE_SIZE = 50;
var PANEL_WIDTH_STORAGE_KEY = "dsh-port:panel-width";
var DEFAULT_PANEL_WIDTH = 520;
var MIN_PANEL_WIDTH = 400;
var MAX_PANEL_WIDTH = 900;
var AUTO_REFRESH_INTERVAL_MS = 10 * 1000;

var CSS = [
  // 设计变量：浅色为默认，深色跟随系统。视觉语言与 dsh-yunxiao 一致：
  // 柔和分层、无硬描边，层级靠底色深浅与柔影表达。
  ":root{color-scheme:light;--dpt-bg:#f2f4f8;--dpt-panel:#ffffff;--dpt-panel2:#f4f6f9;--dpt-field:#f2f4f8;--dpt-hover:#e9edf3;--dpt-tag:#eef1f6;--dpt-text:#202836;--dpt-muted:#68758c;--dpt-line:#edf0f5;--dpt-line-strong:#dde2ea;--dpt-brand:#0d9488;--dpt-brand-solid:#0f9d8c;--dpt-brand-weak:rgba(15,157,140,.1);--dpt-danger:#d6453f;--dpt-danger-solid:#c73e37;--dpt-danger-weak:rgba(217,73,63,.09);--dpt-ok:#17754c;--dpt-ok-weak:rgba(46,166,109,.12);--dpt-warn:#a56207;--dpt-warn-weak:rgba(235,164,74,.16);--dpt-shadow:0 24px 60px rgba(15,23,42,.16),0 4px 14px rgba(15,23,42,.06);--dpt-shadow-sm:0 1px 2px rgba(16,24,40,.04),0 6px 16px rgba(16,24,40,.05)}",
  "@media(prefers-color-scheme:dark){:root{color-scheme:dark;--dpt-bg:#12161d;--dpt-panel:#1a1f28;--dpt-panel2:#20262f;--dpt-field:#1d232c;--dpt-hover:#272e39;--dpt-tag:#242b35;--dpt-text:#e8ecf3;--dpt-muted:#8b98ad;--dpt-line:#262d37;--dpt-line-strong:#333c49;--dpt-brand:#5eead4;--dpt-brand-solid:#0d9488;--dpt-brand-weak:rgba(94,234,212,.13);--dpt-danger:#ef8377;--dpt-danger-solid:#d6453f;--dpt-danger-weak:rgba(242,121,107,.11);--dpt-ok:#53c896;--dpt-ok-weak:rgba(83,200,150,.13);--dpt-warn:#e5ab52;--dpt-warn-weak:rgba(232,163,61,.14);--dpt-shadow:0 24px 64px rgba(0,0,0,.5),0 4px 16px rgba(0,0,0,.3);--dpt-shadow-sm:0 1px 2px rgba(0,0,0,.2),0 6px 16px rgba(0,0,0,.2)}}",
  ".dpt-root,.dpt-root *{box-sizing:border-box}",
  ".dpt-slot-host{width:100%;height:100%;min-height:0}",
  ".dpt-right-panel{position:absolute;inset:0 0 0 auto;width:var(--dpt-workspace-width,520px);min-width:0;overflow:hidden;pointer-events:auto;background:var(--dpt-bg);box-shadow:-12px 0 32px rgba(15,23,42,.08)}",
  "[data-dpt-workspace-open='true']{grid-template-columns:var(--dpt-sidebar-track,280px) minmax(0,1fr) var(--dpt-workspace-width,520px)!important}[data-dpt-workspace-open='true'] [data-side='details']{left:calc(100% - var(--dpt-workspace-width,520px))!important}",
  ".dpt-resize-handle{position:absolute;z-index:50;inset:0 auto 0 0;width:8px;cursor:col-resize;touch-action:none;outline:0}.dpt-resize-handle::after{content:'';position:absolute;inset:0 auto 0 0;width:2px;background:transparent;transition:background .15s}.dpt-resize-handle:hover::after,.dpt-resize-handle:focus-visible::after,.dpt-resize-handle.active::after{background:var(--dpt-brand)}.dpt-resizing,.dpt-resizing *{cursor:col-resize!important;user-select:none!important}",
  ".dpt-preview-host{position:fixed;inset:12px 12px 12px auto;width:min(560px,calc(100vw - 24px));z-index:2147482500;overflow:hidden;border-radius:12px;box-shadow:var(--dpt-shadow)}",
  ".dpt-root{position:relative;width:100%;height:100%;min-height:0;container-type:inline-size;font:13.5px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;color:var(--dpt-text);pointer-events:auto}",
  ".dpt-root button:focus-visible,.dpt-root [tabindex]:focus-visible{outline:2px solid var(--dpt-brand);outline-offset:1px}",
  // 侧边栏入口：多个插件共享同一插槽时宿主默认排成一行；
  // flex:1 1 100% + 容器换行让每个入口独占一行（“云效工作台”上方、“端口管理”下方）。
  ".dpt-sidebar-trigger{position:relative;width:100%;min-height:34px;flex:1 1 100%;padding:7px 10px;display:flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:8px;color:inherit;background:transparent;cursor:pointer;font:inherit;font-size:13px;container-type:inline-size}.dpt-sidebar-trigger:hover{color:var(--dpt-brand);background:var(--dpt-brand-weak)}.dpt-sidebar-trigger[data-wide='true']{justify-content:flex-start}.dpt-sidebar-trigger-mark{width:20px;height:20px;flex:none;display:grid;place-items:center;border-radius:6px;color:#fff;background:linear-gradient(135deg,#3ecf8e,#0d9488);font-size:11px;font-weight:700}.dpt-sidebar-trigger-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}@container(max-width:150px){.dpt-sidebar-trigger .dpt-sidebar-trigger-label{display:none}}",
  "*:has(> .dpt-sidebar-trigger){flex:1 1 100%;flex-wrap:wrap;row-gap:2px}",
  // 宿主真实结构：.dshp-footerActions（横向 flex）> div[display:contents] > 两个入口按钮。
  ".dshp-footerActions:has(.dpt-sidebar-trigger){flex-wrap:wrap;row-gap:2px}",
  ".dpt-shell{position:absolute;inset:0;display:grid;grid-template-rows:auto minmax(0,1fr);overflow:hidden;background:var(--dpt-bg)}",
  ".dpt-hidden{display:none!important}",
  ".dpt-head{display:flex;align-items:center;gap:12px;min-height:56px;padding:10px 14px 10px 18px;background:transparent}",
  ".dpt-logo{width:34px;height:34px;flex:none;display:grid;place-items:center;border-radius:11px;color:#fff;background:linear-gradient(135deg,#3ecf8e,#0d9488);font-size:15px;font-weight:700;box-shadow:0 4px 12px rgba(13,148,136,.28)}",
  ".dpt-head-copy{min-width:0;flex:1}.dpt-head-copy strong{display:block;font-size:14.5px;font-weight:650;line-height:1.35}.dpt-head-copy span{display:block;color:var(--dpt-muted);font-size:12px;line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
  ".dpt-body{min-height:0;display:grid;grid-template-rows:minmax(0,1fr)}",
  ".dpt-main{min-width:0;overflow:auto;padding:14px 18px 26px;scrollbar-width:thin;scrollbar-color:var(--dpt-line-strong) transparent}",
  ".dpt-section{max-width:100%;margin:0 auto}.dpt-title{margin:2px 0 14px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.dpt-title h2{margin:0;font-size:16.5px;font-weight:650;letter-spacing:.2px}.dpt-title p{margin:4px 0 0;color:var(--dpt-muted);font-size:12px}",
  ".dpt-card{padding:16px 18px 18px;border:0;border-radius:16px;background:var(--dpt-panel);box-shadow:var(--dpt-shadow-sm)}.dpt-card+.dpt-card{margin-top:14px}",
  ".dpt-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.dpt-card-head h3{margin:0;font-size:14px;font-weight:600}.dpt-card-head small{color:var(--dpt-muted);font-size:12px}",
  // 按钮：浅底填充无边框；主按钮品牌实底；危险按钮文字色 + 弱衬底。
  ".dpt-btn{min-height:31px;padding:5px 13px;border:0;border-radius:10px;color:var(--dpt-text);background:var(--dpt-tag);cursor:pointer;font:inherit;font-size:13px;white-space:nowrap;transition:background .15s,color .15s}.dpt-btn:hover{background:var(--dpt-hover)}.dpt-btn.primary{color:#fff;background:var(--dpt-brand-solid);box-shadow:0 3px 10px color-mix(in srgb,var(--dpt-brand-solid) 30%,transparent)}.dpt-btn.primary:hover{background:color-mix(in srgb,var(--dpt-brand-solid) 88%,#000)}.dpt-btn.danger{color:var(--dpt-danger)}.dpt-btn.danger:hover{background:var(--dpt-danger-weak)}.dpt-btn.danger-solid{color:#fff;background:var(--dpt-danger-solid)}.dpt-btn.danger-solid:hover{background:color-mix(in srgb,var(--dpt-danger-solid) 88%,#000)}.dpt-btn:disabled{opacity:.5;cursor:not-allowed}",
  ".dpt-btn-sm{min-height:26px;padding:2px 9px;font-size:12px;border-radius:8px}",
  ".dpt-close{width:32px;height:32px;min-height:32px;padding:0;border:0;border-radius:10px;color:var(--dpt-muted);background:transparent;cursor:pointer;font-size:17px;line-height:1}.dpt-close:hover{color:var(--dpt-text);background:var(--dpt-hover)}",
  ".dpt-icon-btn{width:30px;min-height:30px;padding:0;border:0;border-radius:9px;color:var(--dpt-muted);background:transparent;cursor:pointer;font:inherit;font-size:14px;line-height:1}.dpt-icon-btn:hover{color:var(--dpt-brand);background:var(--dpt-brand-weak)}.dpt-icon-btn:disabled{opacity:.45;cursor:not-allowed}",
  ".dpt-field{display:grid;gap:5px}.dpt-field label{color:var(--dpt-muted);font-size:12px}.dpt-input,.dpt-select{width:100%;min-height:34px;padding:6px 11px;border:1.5px solid transparent;border-radius:10px;color:var(--dpt-text);background:var(--dpt-field);outline:0;font:inherit;font-size:13px;transition:border-color .15s,background .15s,box-shadow .15s}.dpt-input:focus,.dpt-select:focus{border-color:color-mix(in srgb,var(--dpt-brand) 45%,transparent);background:var(--dpt-panel);box-shadow:0 0 0 3px var(--dpt-brand-weak)}.dpt-input::placeholder{color:color-mix(in srgb,var(--dpt-muted) 72%,transparent)}",
  // 视图切换：按端口聚合 / 连接明细。
  ".dpt-view{display:flex;flex:none;gap:2px;padding:2px;border-radius:9px;background:var(--dpt-tag)}.dpt-view button{min-height:26px;padding:3px 10px;border:0;border-radius:7px;color:var(--dpt-muted);background:transparent;cursor:pointer;font:inherit;font-size:12px;white-space:nowrap}.dpt-view button:hover{color:var(--dpt-text)}.dpt-view button.active{color:var(--dpt-brand);background:var(--dpt-panel);font-weight:600;box-shadow:0 1px 3px rgba(15,23,42,.08)}",
  // 筛选区：两行网格，第二行放操作与自动刷新。
  ".dpt-toolbar{display:grid;gap:9px}.dpt-filter-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}.dpt-filter-row.three{grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)}.dpt-filter-actions{display:flex;align-items:end;justify-content:space-between;gap:8px}.dpt-filter-actions .dpt-actions{display:flex;gap:6px}.dpt-auto{display:flex;align-items:center;gap:6px;min-height:34px;color:var(--dpt-muted);font-size:12px;cursor:pointer;user-select:none}.dpt-auto input{width:15px;height:15px;flex:none;margin:0;accent-color:var(--dpt-brand-solid);cursor:pointer}",
  ".dpt-meta-line{margin:-2px 0 12px;color:var(--dpt-muted);font-size:12px}.dpt-meta-line strong{color:var(--dpt-text);font-weight:600}",
  // 表格：圆角裁切 + 行间发丝线；表头吸顶。
  ".dpt-table-wrap{overflow:auto;border:0;border-radius:14px;background:var(--dpt-panel);box-shadow:var(--dpt-shadow-sm);scrollbar-width:thin;scrollbar-color:var(--dpt-line-strong) transparent}.dpt-table{width:100%;border-collapse:collapse;min-width:520px}.dpt-table th,.dpt-table td{padding:9px 12px;border-bottom:1px solid var(--dpt-line);text-align:left;vertical-align:middle}.dpt-table th{position:sticky;top:0;z-index:1;color:var(--dpt-muted);background:var(--dpt-panel);font-size:12px;font-weight:600;white-space:nowrap}.dpt-table tr:last-child td{border-bottom:0}.dpt-table tbody tr:hover{background:var(--dpt-panel2)}.dpt-addr{white-space:nowrap;font-variant-numeric:tabular-nums}.dpt-port{color:var(--dpt-text);font-weight:600}.dpt-addr-remote{display:block;max-width:170px;overflow:hidden;text-overflow:ellipsis;color:var(--dpt-muted);font-size:11.5px;white-space:nowrap}.dpt-muted{color:var(--dpt-muted)}",
  ".dpt-badge{display:inline-flex;align-items:center;padding:2.5px 9px;border-radius:999px;color:var(--dpt-muted);background:var(--dpt-tag);font-size:12px;font-weight:500;line-height:1.6;white-space:nowrap}.dpt-badge.proto{color:var(--dpt-brand);background:var(--dpt-brand-weak)}.dpt-badge.listen{color:var(--dpt-ok);background:var(--dpt-ok-weak)}.dpt-badge.established{color:var(--dpt-warn);background:var(--dpt-warn-weak)}",
  ".dpt-proc{min-width:0}.dpt-proc strong{display:block;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}.dpt-proc small{display:block;color:var(--dpt-muted);font-size:11.5px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
  ".dpt-page{margin-top:12px;display:flex;justify-content:flex-end;align-items:center;gap:8px;color:var(--dpt-muted);font-size:12px}.dpt-page span{white-space:nowrap}",
  ".dpt-empty{padding:40px 16px;text-align:center;color:var(--dpt-muted);font-size:13px}.dpt-empty strong{display:block;margin-bottom:4px;color:var(--dpt-text);font-size:14px;font-weight:600}",
  // 弹窗：结束进程确认。
  ".dpt-drawer{position:absolute;inset:0;z-index:30;display:grid;place-items:center;padding:20px;background:color-mix(in srgb,var(--dpt-bg) 55%,transparent);backdrop-filter:blur(2px)}",
  ".dpt-confirm{width:min(380px,100%);padding:18px;border:0;border-radius:16px;background:var(--dpt-panel);box-shadow:var(--dpt-shadow)}.dpt-confirm h3{margin:0 0 10px;font-size:15px;font-weight:650}.dpt-confirm p{margin:0 0 8px;color:var(--dpt-text);font-size:13px;line-height:1.6}.dpt-confirm .dpt-confirm-target{margin:10px 0;padding:11px 13px;border-radius:12px;background:var(--dpt-panel2);font-size:12.5px}.dpt-confirm .dpt-confirm-target strong{display:block;font-size:13.5px}.dpt-confirm .dpt-confirm-target span{display:block;margin-top:2px;color:var(--dpt-muted)}.dpt-confirm .dpt-confirm-note{margin:10px 0 0;color:var(--dpt-warn);background:var(--dpt-warn-weak);padding:9px 12px;border-radius:11px;font-size:12.5px}.dpt-confirm-actions{margin-top:14px;display:flex;justify-content:flex-end;gap:8px}",
  // 提示条不拦截点击，放在左下角，避免盖住弹窗按钮。
  ".dpt-toast-wrap{position:absolute;z-index:60;left:14px;bottom:14px;display:grid;gap:8px;pointer-events:none}.dpt-toast{max-width:340px;padding:10px 14px;border:0;border-radius:12px;background:var(--dpt-panel);box-shadow:var(--dpt-shadow);font-size:13px}.dpt-toast.error{color:var(--dpt-danger)}",
  ".dpt-loading{opacity:.6;pointer-events:none}",
  "@container(max-width:430px){.dpt-main{padding:12px 14px 20px}.dpt-filter-row,.dpt-filter-row.three{grid-template-columns:1fr 1fr}.dpt-title{display:block}.dpt-title>.dpt-actions{margin-top:8px}}",
  "@media(max-width:760px){.dpt-preview-host{inset:0;width:100%;border-radius:0}}"
].join("");

function node(tag, className, text) {
  var element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = String(text);
  return element;
}

function button(text, className, handler) {
  var value = node("button", "dpt-btn" + (className ? " " + className : ""), text);
  value.type = "button";
  if (handler) value.addEventListener("click", handler);
  return value;
}

function field(label, control) {
  var wrap = node("div", "dpt-field");
  wrap.append(node("label", "", label), control);
  return wrap;
}

function input(type, placeholder, value) {
  var element = node("input", "dpt-input");
  element.type = type || "text";
  if (placeholder) element.placeholder = placeholder;
  if (value !== undefined && value !== null) element.value = value;
  return element;
}

function setBusy(element, busy) {
  if (!element) return;
  element.classList.toggle("dpt-loading", Boolean(busy));
}

function shortTime(value) {
  if (!value) return "-";
  var date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  var pad = function (part) { return (part < 10 ? "0" : "") + part; };
  return pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
}

function rpc(method, args) {
  return fetch("/api/d-port/rpc", {
    method: "POST",
    cache: "no-store",
    headers: { "content-type": "application/json", "cache-control": "no-cache" },
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

function formatAddress(row, local) {
  var address = local ? row.localAddress : row.remoteAddress;
  var port = local ? row.localPort : row.remotePort;
  if (address === undefined || address === null || address === "") return "-";
  if (port === null || port === undefined) return address;
  return address + ":" + port;
}

function stateBadgeClass(state) {
  var normalized = String(state || "").toUpperCase();
  if (normalized === "LISTENING") return "dpt-badge listen";
  if (normalized === "ESTABLISHED") return "dpt-badge established";
  return "dpt-badge";
}

// 行内的“结束”按钮语义：结束持有该连接的进程（taskkill /PID <pid> /T /F）。
function killable(row) {
  return Number(row.pid) > 0;
}

function createWorkspace(onRequestClose, ctx) {
  var root = null;
  var shell = null;
  var subtitle = null;
  var main = null;
  var metaLine = null;
  var tableWrap = null;
  var pager = null;
  var toastWrap = null;
  var drawer = null;
  var disposed = false;

  var state = {
    loading: false,
    view: "ports",
    filters: { port: "", process: "", protocol: "", state: "" },
    page: 1,
    data: { total: 0, items: [], scannedAt: "" },
    killTarget: null,
    autoRefresh: false,
    autoTimer: null
  };

  function toast(message, isError) {
    if (!toastWrap) return;
    var item = node("div", "dpt-toast" + (isError ? " error" : ""), message);
    toastWrap.append(item);
    setTimeout(function () { item.remove(); }, 3600);
  }

  function openDrawer(target) {
    state.killTarget = target;
    renderDrawer();
  }

  function closeDrawer() {
    state.killTarget = null;
    renderDrawer();
  }

  function renderDrawer() {
    if (!drawer) return;
    drawer.textContent = "";
    var target = state.killTarget;
    if (!target) {
      drawer.classList.add("dpt-hidden");
      return;
    }
    var confirm = node("div", "dpt-confirm");
    confirm.setAttribute("role", "alertdialog");
    confirm.setAttribute("aria-label", "结束进程确认");
    confirm.append(node("h3", "", "结束进程确认"));
    var targetBox = node("div", "dpt-confirm-target");
    targetBox.append(
      node("strong", "", "PID " + target.pid + " · " + (target.process || "(未知进程)")),
      node("span", "", (target.protocol || "").toUpperCase() + " 端口 " + target.localPort + " · " + (target.localAddress || ""))
    );
    if (target.services && target.services.length) {
      targetBox.append(node("span", "", "所属服务：" + target.services.join("、")));
    }
    confirm.append(
      node("p", "", "将通过 taskkill 强制结束该进程及其子进程树，未保存的数据会丢失。"),
      targetBox,
      node("p", "", "结束后会自动复查端口并刷新列表。")
    );
    var actions = node("div", "dpt-confirm-actions");
    var cancelButton = button("取消", "", closeDrawer);
    var confirmButton = button("确认结束", "danger-solid", function () {
      confirmButton.disabled = true;
      cancelButton.disabled = true;
      killRow(target).then(function () { closeDrawer(); });
    });
    actions.append(cancelButton, confirmButton);
    confirm.append(actions);
    drawer.append(confirm);
    drawer.classList.remove("dpt-hidden");
  }

  function killRow(target) {
    return rpc("ports.kill", { port: target.localPort, pid: target.pid, protocol: target.protocol }).then(function (result) {
      var killed = result && result.killed && result.killed[0];
      var failed = result && result.failed && result.failed[0];
      if (failed) {
        toast("结束失败：" + (failed.message || "未知错误"), true);
      } else if (killed) {
        toast("已结束 PID " + killed.pid + (killed.process ? "（" + killed.process + "）" : "") + (result.released ? "，端口已释放" : "，端口仍存在连接记录"));
      } else {
        toast("操作完成");
      }
      return loadPorts();
    }).catch(function (error) {
      toast(error instanceof Error ? error.message : String(error), true);
    });
  }

  function readFilters() {
    return {
      port: state.filters.port,
      process: state.filters.process,
      protocol: state.filters.protocol,
      state: state.filters.state
    };
  }

  function loadPorts() {
    if (disposed) return Promise.resolve();
    state.loading = true;
    setBusy(main, true);
    return rpc("ports.list", Object.assign({ view: state.view, page: state.page, pageSize: PAGE_SIZE }, readFilters())).then(function (data) {
      state.data = data;
      var maxPage = Math.max(1, Math.ceil((data.total || 0) / PAGE_SIZE));
      if (state.page > maxPage) { state.page = maxPage; }
      renderResult();
    }).catch(function (error) {
      renderResult();
      toast(error instanceof Error ? error.message : String(error), true);
    }).then(function () {
      state.loading = false;
      setBusy(main, false);
    });
  }

  function setView(view) {
    if (state.view === view) return;
    state.view = view;
    Object.keys(elements.viewButtons || {}).forEach(function (key) {
      elements.viewButtons[key].classList.toggle("active", key === view);
    });
    state.page = 1;
    loadPorts();
  }

  function applyFilters() {
    state.filters.port = elements.portInput.value.trim();
    state.filters.process = elements.processInput.value.trim();
    state.filters.protocol = elements.protocolSelect.value;
    state.filters.state = elements.stateSelect.value;
    state.page = 1;
    return loadPorts();
  }

  function resetFilters() {
    elements.portInput.value = "";
    elements.processInput.value = "";
    elements.protocolSelect.value = "";
    elements.stateSelect.value = "";
    return applyFilters();
  }

  function setAutoRefresh(enabled) {
    state.autoRefresh = Boolean(enabled);
    if (state.autoTimer) { clearInterval(state.autoTimer); state.autoTimer = null; }
    if (state.autoRefresh) {
      state.autoTimer = setInterval(function () {
        if (state.loading || state.killTarget) return;
        loadPorts();
      }, AUTO_REFRESH_INTERVAL_MS);
    }
  }

  var elements = {};

  function buildViewSwitch() {
    elements.viewButtons = {};
    var viewSwitch = node("div", "dpt-view");
    viewSwitch.setAttribute("role", "tablist");
    viewSwitch.setAttribute("aria-label", "切换视图");
    [["ports", "按端口"], ["connections", "连接明细"]].forEach(function (item) {
      var viewButton = node("button", item[0] === state.view ? "active" : "");
      viewButton.type = "button";
      viewButton.setAttribute("role", "tab");
      viewButton.setAttribute("aria-selected", item[0] === state.view ? "true" : "false");
      viewButton.append(node("span", "", item[1]));
      viewButton.addEventListener("click", function () { setView(item[0]); });
      elements.viewButtons[item[0]] = viewButton;
      viewSwitch.append(viewButton);
    });
    return viewSwitch;
  }

  function buildKillButton(title, handler, disabledTitle) {
    var killButton = button("结束", "danger dpt-btn-sm", handler);
    killButton.title = title;
    if (disabledTitle) {
      killButton.disabled = true;
      killButton.title = disabledTitle;
    }
    return killButton;
  }

  function stateSummary(group) {
    var parts = [];
    var known = ["LISTENING", "ESTABLISHED", "TIME_WAIT"];
    var other = 0;
    Object.keys(group.stateCounts).forEach(function (key) {
      if (known.indexOf(key) < 0) other += group.stateCounts[key];
    });
    if (group.stateCounts.ESTABLISHED) parts.push("已连接 " + group.stateCounts.ESTABLISHED);
    if (group.stateCounts.TIME_WAIT) parts.push("等待释放 " + group.stateCounts.TIME_WAIT);
    if (other) parts.push("关闭中 " + other);
    return parts.join(" · ");
  }

  function buildPortsTable(items) {
    var table = node("table", "dpt-table");
    var thead = node("thead");
    var headRow = node("tr");
    ["协议", "端口", "进程", "连接", "操作"].forEach(function (label) {
      headRow.append(node("th", "", label));
    });
    thead.append(headRow);
    table.append(thead);
    var tbody = node("tbody");
    items.forEach(function (group) {
      var tr = node("tr");
      var protoCell = node("td");
      protoCell.append(node("span", "dpt-badge proto", String(group.protocol || "").toUpperCase()));
      tr.append(protoCell);
      var portCell = node("td", "dpt-addr");
      portCell.append(node("span", "dpt-port", String(group.localPort)));
      if (group.localAddresses && group.localAddresses.length) {
        portCell.append(node("small", "dpt-addr-remote", group.localAddresses.join(" · ")));
      }
      tr.append(portCell);
      var procCell = node("td", "dpt-proc");
      if (group.owners.length) {
        var names = group.owners.map(function (owner) { return owner.process; });
        procCell.append(node("strong", "", names.slice(0, 2).join("、") + (names.length > 2 ? " 等 " + names.length + " 个进程" : "")));
        var serviceNames = [];
        group.owners.forEach(function (owner) {
          (owner.services || []).forEach(function (service) {
            if (serviceNames.indexOf(service) < 0 && serviceNames.length < 3) serviceNames.push(service);
          });
        });
        var procMeta = "PID " + group.owners.map(function (owner) { return owner.pid; }).join("、");
        if (serviceNames.length) procMeta += " · " + serviceNames.join("、");
        procCell.append(node("small", "", procMeta));
      } else {
        var ghost = node("strong", "dpt-muted", "(无属主进程)");
        procCell.append(ghost);
        procCell.append(node("small", "", "仅系统级连接记录"));
      }
      tr.append(procCell);
      var connCell = node("td");
      connCell.append(node("span", group.listening ? "dpt-badge listen" : "dpt-badge", group.listening ? "监听中" : "未监听"));
      var summary = stateSummary(group);
      if (summary) connCell.append(node("small", "dpt-addr-remote", summary));
      tr.append(connCell);
      var actionCell = node("td");
      if (group.owners.length) {
        group.owners.slice(0, 2).forEach(function (owner) {
          actionCell.append(buildKillButton(
            "结束 PID " + owner.pid + (owner.process ? "（" + owner.process + "）" : "") + " 并释放端口 " + group.localPort,
            function () {
              openDrawer({
                pid: owner.pid,
                process: owner.process,
                services: owner.services,
                protocol: group.protocol,
                localPort: group.localPort,
                localAddress: (group.localAddresses || []).join(" · ")
              });
            }
          ));
        });
        if (group.owners.length > 2) {
          actionCell.append(node("small", "dpt-muted", "+" + (group.owners.length - 2)));
        }
      } else {
        actionCell.append(buildKillButton("结束", null, "无属主进程（TIME_WAIT 等系统级记录），会自动释放"));
      }
      tr.append(actionCell);
      tbody.append(tr);
    });
    table.append(tbody);
    return table;
  }

  function buildConnectionsTable(items) {
    var table = node("table", "dpt-table");
    var thead = node("thead");
    var headRow = node("tr");
    ["协议", "本地地址", "状态", "进程", "操作"].forEach(function (label) {
      headRow.append(node("th", "", label));
    });
    thead.append(headRow);
    table.append(thead);
    var tbody = node("tbody");
    items.forEach(function (row) {
      var tr = node("tr");
      var protoCell = node("td");
      protoCell.append(node("span", "dpt-badge proto", String(row.protocol || "").toUpperCase()));
      tr.append(protoCell);
      var localCell = node("td", "dpt-addr");
      localCell.append(node("span", "dpt-port", formatAddress(row, true)));
      if (row.remotePort !== null && row.remotePort !== undefined && row.remotePort > 0) {
        localCell.append(node("small", "dpt-addr-remote", "→ " + formatAddress(row, false)));
      }
      tr.append(localCell);
      var stateCell = node("td");
      stateCell.append(node("span", stateBadgeClass(row.state), row.state || (row.protocol === "udp" ? "—" : "-")));
      tr.append(stateCell);
      var procCell = node("td", "dpt-proc");
      procCell.append(node("strong", "", row.process || "(未知进程)"));
      var procMeta = "PID " + (row.pid > 0 ? row.pid : "—");
      if (row.services && row.services.length) procMeta += " · " + row.services.join("、");
      procCell.append(node("small", "", procMeta));
      tr.append(procCell);
      var actionCell = node("td");
      var killButton = button("结束", "danger dpt-btn-sm", function () { openDrawer(row); });
      killButton.title = "结束 PID " + row.pid + " 并释放端口 " + row.localPort;
      if (!killable(row)) {
        killButton.disabled = true;
        killButton.title = "系统级连接记录（TIME_WAIT 等），无属主进程，会自动释放";
      }
      actionCell.append(killButton);
      tr.append(actionCell);
      tbody.append(tr);
    });
    table.append(tbody);
    return table;
  }

  function renderResult() {
    if (!tableWrap || !metaLine || !pager) return;
    var data = state.data;
    var items = data.items || [];
    var isPortsView = state.view === "ports";

    metaLine.textContent = "";
    metaLine.append(node("span", "", "本页 "));
    metaLine.append(node("strong", "", String(items.length)));
    if (isPortsView) {
      var listeningCount = items.filter(function (group) { return group.listening; }).length;
      metaLine.append(node("span", "", " 个端口 · " + listeningCount + " 个监听中 · 共 " + data.total + " 个端口 · 扫描于 " + shortTime(data.scannedAt)));
    } else {
      var pids = {};
      var processCount = 0;
      items.forEach(function (row) {
        if (row.pid > 0 && !pids[row.pid]) { pids[row.pid] = true; processCount += 1; }
      });
      metaLine.append(node("span", "", " 条连接 · " + processCount + " 个进程 · 共 " + data.total + " 条 · 扫描于 " + shortTime(data.scannedAt)));
    }

    tableWrap.textContent = "";
    pager.textContent = "";
    if (!items.length) {
      var empty = node("div", "dpt-empty");
      empty.append(node("strong", "", "没有匹配的端口记录"), node("span", "", "尝试调整筛选条件，或点击“刷新”重新扫描。"));
      tableWrap.append(empty);
      return;
    }

    tableWrap.append(isPortsView ? buildPortsTable(items) : buildConnectionsTable(items));

    var unit = isPortsView ? "个端口" : "条";
    var totalPages = Math.max(1, Math.ceil((data.total || 0) / PAGE_SIZE));
    var prevButton = button("上一页", "dpt-btn-sm", function () { state.page -= 1; loadPorts(); });
    var nextButton = button("下一页", "dpt-btn-sm", function () { state.page += 1; loadPorts(); });
    prevButton.disabled = state.page <= 1;
    nextButton.disabled = state.page >= totalPages;
    pager.append(prevButton, node("span", "", "第 " + state.page + " / " + totalPages + " 页 · 共 " + data.total + " " + unit), nextButton);
  }

  function buildToolbar() {
    elements.portInput = input("text", "例如 3306");
    elements.processInput = input("text", "例如 mysqld 或 svchost");
    elements.protocolSelect = node("select", "dpt-select");
    [["", "全部协议"], ["tcp", "TCP"], ["udp", "UDP"]].forEach(function (item) {
      var option = node("option", "", item[1]); option.value = item[0];
      elements.protocolSelect.append(option);
    });
    elements.stateSelect = node("select", "dpt-select");
    [["", "全部状态"], ["LISTENING", "LISTENING（监听）"], ["ESTABLISHED", "ESTABLISHED（已连接）"], ["TIME_WAIT", "TIME_WAIT"], ["CLOSE_WAIT", "CLOSE_WAIT"], ["SYN_SENT", "SYN_SENT"]].forEach(function (item) {
      var option = node("option", "", item[1]); option.value = item[0];
      elements.stateSelect.append(option);
    });

    elements.autoCheckbox = input("checkbox");
    elements.autoCheckbox.checked = false;
    elements.autoCheckbox.addEventListener("change", function () { setAutoRefresh(elements.autoCheckbox.checked); });

    var refreshButton = button("刷新", "primary", function () { loadPorts(); });
    var resetButton = button("重置", "", function () { resetFilters(); });

    var toolbar = node("div", "dpt-toolbar");
    var rowOne = node("div", "dpt-filter-row");
    rowOne.append(field("端口号", elements.portInput), field("进程名 / 服务名", elements.processInput));
    var rowTwo = node("div", "dpt-filter-row three");
    rowTwo.append(field("协议", elements.protocolSelect), field("状态", elements.stateSelect));
    var actionsRow = node("div", "dpt-filter-actions");
    var autoLabel = node("label", "dpt-auto");
    autoLabel.append(elements.autoCheckbox, node("span", "", "每 10 秒自动刷新"));
    var actionGroup = node("div", "dpt-actions");
    actionGroup.append(resetButton, refreshButton);
    actionsRow.append(autoLabel, actionGroup);

    toolbar.append(rowOne, rowTwo, actionsRow);
    [elements.portInput, elements.processInput].forEach(function (control) {
      control.addEventListener("keydown", function (event) { if (event.key === "Enter") applyFilters(); });
    });
    elements.protocolSelect.addEventListener("change", applyFilters);
    elements.stateSelect.addEventListener("change", applyFilters);
    return toolbar;
  }

  function mount(container) {
    root = node("div", "dpt-root"); root.id = ROOT_ID;
    shell = node("div", "dpt-shell");
    var head = node("header", "dpt-head");
    var logo = node("div", "dpt-logo", "端");
    var copy = node("div", "dpt-head-copy");
    copy.append(node("strong", "", "端口管理"));
    subtitle = node("span", "", "netstat · tasklist · taskkill");
    copy.append(subtitle);
    var closeButton = button("×", "dpt-close", close);
    closeButton.setAttribute("aria-label", "关闭端口管理");
    head.append(logo, copy, closeButton);

    main = node("main", "dpt-main");
    var section = node("div", "dpt-section");
    var toolbarCard = node("div", "dpt-card");
    toolbarCard.append(buildToolbar());
    metaLine = node("div", "dpt-meta-line");
    tableWrap = node("div", "dpt-table-wrap");
    pager = node("div", "dpt-page");
    var listCard = node("div", "dpt-card");
    var listHead = node("div", "dpt-card-head");
    var listTitle = node("div", "dpt-card-title");
    listTitle.append(node("h3", "", "端口占用"));
    listHead.append(listTitle, buildViewSwitch());
    listCard.append(listHead, metaLine, tableWrap, pager);
    section.append(toolbarCard, listCard);
    main.append(section);

    drawer = node("div", "dpt-drawer dpt-hidden");
    toastWrap = node("div", "dpt-toast-wrap");

    var body = node("div", "dpt-body");
    body.append(main);
    shell.append(head, body, drawer, toastWrap);
    root.append(shell);
    (container || document.body).append(root);
    renderResult();
    loadPorts();
  }

  function close() {
    if (typeof onRequestClose === "function") onRequestClose();
    else dispose();
  }

  function dispose() {
    disposed = true;
    setAutoRefresh(false);
    var value = document.getElementById(ROOT_ID);
    if (value) value.remove();
    root = null;
  }

  return { mount: mount, dispose: dispose };
}

function readPanelWidth() {
  try {
    var value = Number(window.localStorage.getItem(PANEL_WIDTH_STORAGE_KEY));
    return Number.isFinite(value) && value > 0 ? value : DEFAULT_PANEL_WIDTH;
  } catch (error) {
    return DEFAULT_PANEL_WIDTH;
  }
}

function savePanelWidth(value) {
  try { window.localStorage.setItem(PANEL_WIDTH_STORAGE_KEY, String(Math.round(value))); } catch (error) {}
}

function clampPanelWidth(value) {
  var viewport = document.documentElement.clientWidth || window.innerWidth || 1440;
  var responsiveMax = Math.max(MIN_PANEL_WIDTH, viewport - 640);
  return Math.round(Math.min(MAX_PANEL_WIDTH, responsiveMax, Math.max(MIN_PANEL_WIDTH, Number(value) || DEFAULT_PANEL_WIDTH)));
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
    // 宿主表面缺失时退化为独立预览：固定在窗口右侧，便于单独打开调试。
    var previewHost = node("div", "dpt-preview-host");
    document.body.append(previewHost);
    var previewWorkspace = createWorkspace(function () { previewHost.remove(); }, ctx);
    previewWorkspace.mount(previewHost);
    ctx.effect(function () { return function () { previewWorkspace.dispose(); previewHost.remove(); if (!existingStyle) style.remove(); }; }, "dsh-port: standalone preview");
    return;
  }

  var panelOpen = false;
  var panelListeners = new Set();
  var workspaceFrame = null;
  var preferredPanelWidth = readPanelWidth();
  var panelWidth = clampPanelWidth(preferredPanelWidth);
  function applyPanelWidth(value, persist) {
    panelWidth = clampPanelWidth(value);
    if (workspaceFrame) workspaceFrame.style.setProperty("--dpt-workspace-width", panelWidth + "px");
    if (persist) {
      preferredPanelWidth = panelWidth;
      savePanelWidth(panelWidth);
    }
    return panelWidth;
  }
  function widenWorkspaceFrame() {
    requestAnimationFrame(function () {
      var overlay = document.querySelector("[data-shell-overlay]");
      var frame = overlay && overlay.parentElement;
      if (!frame) return;
      var match = String(frame.style.gridTemplateColumns || "").match(/^([\d.]+px)/);
      frame.style.setProperty("--dpt-sidebar-track", match ? match[1] : "280px");
      frame.style.setProperty("--dpt-workspace-width", panelWidth + "px");
      frame.setAttribute("data-dpt-workspace-open", "true");
      workspaceFrame = frame;
    });
  }
  function restoreWorkspaceFrame() {
    if (!workspaceFrame) return;
    workspaceFrame.removeAttribute("data-dpt-workspace-open");
    workspaceFrame.style.removeProperty("--dpt-sidebar-track");
    workspaceFrame.style.removeProperty("--dpt-workspace-width");
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
      var workspace = createWorkspace(function () { setPanelOpen(false); }, ctx);
      workspace.mount(hostRef.current);
      return function () { workspace.dispose(); };
    }, [open]);
    if (!open) return null;
    function beginResize(event) {
      if (event.button !== undefined && event.button !== 0) return;
      event.preventDefault();
      var handle = event.currentTarget;
      var startX = event.clientX;
      var startWidth = panelWidth;
      handle.classList.add("active");
      document.documentElement.classList.add("dpt-resizing");
      function move(moveEvent) {
        applyPanelWidth(startWidth + startX - moveEvent.clientX, false);
        handle.setAttribute("aria-valuenow", String(panelWidth));
      }
      function finish() {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", finish);
        window.removeEventListener("pointercancel", finish);
        handle.classList.remove("active");
        document.documentElement.classList.remove("dpt-resizing");
        applyPanelWidth(panelWidth, true);
      }
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", finish);
      window.addEventListener("pointercancel", finish);
    }
    function resizeByKeyboard(event) {
      var delta = event.key === "ArrowLeft" ? 20 : event.key === "ArrowRight" ? -20 : 0;
      if (!delta && event.key !== "Home") return;
      event.preventDefault();
      var next = event.key === "Home" ? DEFAULT_PANEL_WIDTH : panelWidth + delta;
      applyPanelWidth(next, true);
      event.currentTarget.setAttribute("aria-valuenow", String(panelWidth));
    }
    return ReactRuntime.createElement("div", { className: "dpt-right-panel" },
      ReactRuntime.createElement("div", {
        className: "dpt-resize-handle",
        role: "separator",
        tabIndex: 0,
        "aria-label": "调整端口管理宽度",
        "aria-orientation": "vertical",
        "aria-valuemin": MIN_PANEL_WIDTH,
        "aria-valuemax": MAX_PANEL_WIDTH,
        "aria-valuenow": panelWidth,
        onPointerDown: beginResize,
        onKeyDown: resizeByKeyboard
      }),
      ReactRuntime.createElement("div", { ref: hostRef, className: "dpt-slot-host" }));
  }

  function onWindowResize() { applyPanelWidth(preferredPanelWidth, false); }
  window.addEventListener("resize", onWindowResize);

  function SidebarTrigger(props) {
    var wide = Boolean(props && props.wide);
    var buttonRef = ReactRuntime.useRef(null);
    // 宿主可能给每个入口再包一层容器：从按钮向上找到真正横向排列的 flex 行，
    // 对该行开启换行，并让按钮与行之间的每层包装都独占一行（卸载时还原）。
    ReactRuntime.useEffect(function () {
      var element = buttonRef.current;
      if (!element) return undefined;
      var flexRow = null;
      var cursor = element.parentElement;
      while (cursor && cursor !== document.body) {
        var style = window.getComputedStyle(cursor);
        // display:contents 的包装层不产生盒子，视为透明直接跳过；
        // 目标是最近一个真实横向 flex 行（宿主为 .dshp-footerActions）。
        if (style.display === "contents") {
          cursor = cursor.parentElement;
          continue;
        }
        if ((style.display === "flex" || style.display === "inline-flex") && style.flexDirection.indexOf("row") === 0) {
          flexRow = cursor;
          break;
        }
        cursor = cursor.parentElement;
      }
      if (!flexRow) return undefined;
      var changes = [];
      var node = element;
      while (node && node !== flexRow) {
        changes.push({ node: node, property: "flex", previous: node.style.flex });
        node.style.flex = "1 1 100%";
        node = node.parentElement;
      }
      changes.push({ node: flexRow, property: "flex-wrap", previous: flexRow.style.flexWrap });
      flexRow.style.flexWrap = "wrap";
      return function () {
        changes.forEach(function (change) {
          if (change.previous) change.node.style.setProperty(change.property, change.previous);
          else change.node.style.removeProperty(change.property);
        });
      };
    }, []);
    return ReactRuntime.createElement("button", {
      ref: buttonRef,
      type: "button",
      className: "dpt-sidebar-trigger",
      "data-wide": wide ? "true" : "false",
      "aria-label": "打开端口管理",
      title: "端口管理",
      onClick: function () { setPanelOpen(true); }
    },
    ReactRuntime.createElement("span", { className: "dpt-sidebar-trigger-mark", "aria-hidden": "true" }, "端"),
    ReactRuntime.createElement("span", { className: "dpt-sidebar-trigger-label" }, "端口管理"));
  }

  ctx.slots.inject("sidebar.footer.action", function () { return ctx.slots.register({
    name: "sidebar.footer.action",
    id: "dsh-port",
    label: "端口管理"
  }, SidebarTrigger); });

  ctx.slots.inject("shell.overlay", function () { return ctx.slots.register({
    name: "shell.overlay",
    id: "dsh-port-workspace",
    label: "端口管理"
  }, RightWorkspace); });

  ctx.effect(function () { return function () {
    panelOpen = false;
    panelListeners.clear();
    restoreWorkspaceFrame();
    window.removeEventListener("resize", onWindowResize);
    document.documentElement.classList.remove("dpt-resizing");
    ctx.layout.closeDetails();
    if (!existingStyle) style.remove();
  }; }, "dsh-port: reserved right workspace");
}

exports.apply = apply;
exports.inject = ["slots", "layout"];
return module.exports;
}});