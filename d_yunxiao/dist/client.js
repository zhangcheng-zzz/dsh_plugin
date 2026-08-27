// dsh-yunxiao — 无框架、无构建步骤的轻量 Web 工作台。
window.__ModuleLoader__.load({ id: "dsh-yunxiao", factory: (require) => {
var module = { exports: {} };
var exports = module.exports;
var ReactRuntime = null;
try { ReactRuntime = require("react"); } catch (error) {}

var STYLE_ID = "dsh-yunxiao-style";
var ROOT_ID = "dsh-yunxiao-root";
var PAGE_SIZE = 20;
var PANEL_WIDTH_STORAGE_KEY = "dsh-yunxiao:panel-width";
var DEFAULT_PANEL_WIDTH = 480;
var MIN_PANEL_WIDTH = 380;
var MAX_PANEL_WIDTH = 860;
var DEFAULT_NOTIFICATION_INTERVAL = 5;
var NOTIFICATION_MINUTE_MS = Math.max(100, Number(window.__DYX_NOTIFICATION_MINUTE_MS__) || 60 * 1000);

var CSS = [
  ":root{--dyx-bg:#f6f7fb;--dyx-panel:#fff;--dyx-panel2:#f8fafc;--dyx-text:#172033;--dyx-muted:#64748b;--dyx-line:#e2e8f0;--dyx-brand:#2563eb;--dyx-brand2:#0f766e;--dyx-danger:#dc2626;--dyx-status-pending:#8a5a00;--dyx-status-pending-bg:rgba(217,151,27,.09);--dyx-status-pending-line:rgba(180,120,10,.34);--dyx-status-processing:#2457a6;--dyx-status-processing-bg:rgba(37,99,235,.08);--dyx-status-processing-line:rgba(37,99,235,.3);--dyx-status-reopened:#963b63;--dyx-status-reopened-bg:rgba(190,69,118,.08);--dyx-status-reopened-line:rgba(170,55,105,.3);--dyx-shadow:0 18px 60px rgba(15,23,42,.22)}",
  "@media(prefers-color-scheme:dark){:root{--dyx-bg:#0d1117;--dyx-panel:#141b24;--dyx-panel2:#101720;--dyx-text:#e6edf3;--dyx-muted:#8b9bb0;--dyx-line:#2b3543;--dyx-brand:#65a3ff;--dyx-brand2:#39c5ad;--dyx-danger:#ff7b72;--dyx-status-pending:#e7b75d;--dyx-status-pending-bg:rgba(245,158,11,.1);--dyx-status-pending-line:rgba(245,180,65,.3);--dyx-status-processing:#8ab7ff;--dyx-status-processing-bg:rgba(96,165,250,.1);--dyx-status-processing-line:rgba(96,165,250,.3);--dyx-status-reopened:#ef9abd;--dyx-status-reopened-bg:rgba(236,72,153,.1);--dyx-status-reopened-line:rgba(244,114,182,.3);--dyx-shadow:0 22px 70px rgba(0,0,0,.5)}}",
  ".dyx-root,.dyx-root *{box-sizing:border-box}",
  ".dyx-slot-host{width:100%;height:100%;min-height:0}",
  ".dyx-right-panel{position:absolute;inset:0 0 0 auto;width:var(--dyx-workspace-width,480px);min-width:0;overflow:hidden;pointer-events:auto;background:var(--dyx-bg);box-shadow:-12px 0 32px rgba(15,23,42,.08)}",
  "[data-dyx-workspace-open='true']{grid-template-columns:var(--dyx-sidebar-track,280px) minmax(0,1fr) var(--dyx-workspace-width,480px)!important}[data-dyx-workspace-open='true'] [data-side='details']{left:calc(100% - var(--dyx-workspace-width,480px))!important}",
  ".dyx-resize-handle{position:absolute;z-index:50;inset:0 auto 0 0;width:10px;cursor:col-resize;touch-action:none;outline:0}.dyx-resize-handle::after{content:'';position:absolute;inset:0 auto 0 0;width:3px;background:transparent;transition:background .15s}.dyx-resize-handle:hover::after,.dyx-resize-handle:focus-visible::after,.dyx-resize-handle.active::after{background:var(--dyx-brand)}.dyx-resizing,.dyx-resizing *{cursor:col-resize!important;user-select:none!important}",
  ".dyx-preview-host{position:fixed;inset:12px 12px 12px auto;width:min(520px,calc(100vw - 24px));z-index:2147482500;overflow:hidden;border-radius:16px;box-shadow:var(--dyx-shadow)}",
  ".dyx-root{position:relative;width:100%;height:100%;min-height:0;container-type:inline-size;font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI','Microsoft YaHei',sans-serif;color:var(--dyx-text);pointer-events:auto}",
  ".dyx-sidebar-trigger{position:relative;width:100%;min-height:36px;padding:8px 10px;display:flex;align-items:center;justify-content:center;gap:9px;border:0;border-radius:9px;color:inherit;background:transparent;cursor:pointer;font:inherit}.dyx-sidebar-trigger:hover{color:#2563eb;background:rgba(37,99,235,.1)}.dyx-sidebar-trigger[data-wide='true']{justify-content:flex-start}.dyx-sidebar-trigger-mark{width:22px;height:22px;display:grid;place-items:center;border-radius:7px;color:#fff;background:linear-gradient(135deg,#2563eb,#0f766e);font-size:11px;font-weight:800}.dyx-sidebar-trigger-count{min-width:20px;height:20px;padding:0 6px;display:grid;place-items:center;border:2px solid var(--dyx-panel);border-radius:999px;color:#fff;background:#dc2626;font-size:10px;font-weight:800}.dyx-sidebar-trigger:not([data-wide='true']) .dyx-sidebar-trigger-count{position:absolute;right:2px;top:1px}",
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
  ".dyx-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.dyx-card-head h3{margin:0;font-size:16px}.dyx-card-head small{color:var(--dyx-muted)}.dyx-card-title{display:flex;align-items:center;gap:8px;min-width:0}",
  ".dyx-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}.dyx-account{padding:15px;border:1px solid var(--dyx-line);border-radius:12px;background:var(--dyx-panel2)}.dyx-account.active{border-color:var(--dyx-brand);box-shadow:inset 0 0 0 1px var(--dyx-brand)}",
  ".dyx-account-top{display:flex;gap:11px;align-items:center;cursor:pointer}.dyx-avatar{width:38px;height:38px;display:grid;place-items:center;flex:none;border-radius:11px;color:#fff;background:linear-gradient(135deg,#2563eb,#0f766e);font-weight:800}.dyx-grow{min-width:0;flex:1}.dyx-grow strong,.dyx-grow small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dyx-grow small{color:var(--dyx-muted)}",
  ".dyx-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.dyx-account-top .dyx-actions{flex:none}",
  ".dyx-btn{min-height:34px;padding:7px 12px;border:1px solid var(--dyx-line);border-radius:9px;color:var(--dyx-text);background:var(--dyx-panel);cursor:pointer;font:inherit}.dyx-btn:hover{border-color:var(--dyx-brand);color:var(--dyx-brand)}.dyx-btn.primary{border-color:var(--dyx-brand);color:#fff;background:#2563eb}.dyx-btn.danger{color:var(--dyx-danger)}.dyx-btn:disabled{opacity:.55;cursor:not-allowed}",
  ".dyx-icon-btn{width:30px;min-height:30px;padding:0;border:1px solid var(--dyx-line);border-radius:8px;color:var(--dyx-muted);background:var(--dyx-panel);cursor:pointer;font:inherit;font-size:15px;line-height:1}.dyx-icon-btn:hover{border-color:var(--dyx-brand);color:var(--dyx-brand)}.dyx-icon-btn:disabled{opacity:.55;cursor:not-allowed}",
  ".dyx-field{display:grid;gap:5px}.dyx-field label{color:var(--dyx-muted);font-size:12px}.dyx-input,.dyx-select,.dyx-textarea{width:100%;min-height:38px;padding:8px 10px;border:1px solid var(--dyx-line);border-radius:9px;color:var(--dyx-text);background:var(--dyx-panel);outline:0;font:inherit}.dyx-input:focus,.dyx-select:focus,.dyx-textarea:focus{border-color:var(--dyx-brand);box-shadow:0 0 0 3px color-mix(in srgb,var(--dyx-brand) 13%,transparent)}.dyx-textarea{min-height:84px;resize:vertical}.dyx-select[multiple]{min-height:112px;padding:6px}.dyx-select[multiple] option{padding:7px 8px;border-radius:6px}",
  ".dyx-project-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px;align-items:center}.dyx-current{margin-top:12px;padding:12px;border-radius:10px;color:var(--dyx-muted);background:var(--dyx-panel2)}.dyx-current strong{color:var(--dyx-text)}",
  ".dyx-notify-stats{margin:-4px 0 13px;color:var(--dyx-muted);font-size:12px}.dyx-notify-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(130px,.65fr);gap:10px}.dyx-notify-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 12px;border:1px solid var(--dyx-line);border-radius:10px;background:var(--dyx-panel2);cursor:pointer}.dyx-notify-toggle input{width:18px;height:18px;accent-color:var(--dyx-brand)}",
  ".dyx-tools{margin-bottom:13px;display:grid;grid-template-columns:1fr 1fr;gap:9px;align-items:end}",
  ".dyx-defect-filters{margin-bottom:13px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.dyx-filter-control{min-width:0;display:grid;grid-template-columns:minmax(0,1fr) 30px;gap:5px}.dyx-filter-clear{width:30px;min-height:38px;padding:0;border:1px solid var(--dyx-line);border-radius:9px;color:var(--dyx-muted);background:var(--dyx-panel);cursor:pointer;font-family:inherit;font-size:18px;line-height:1}.dyx-filter-clear:hover{border-color:var(--dyx-brand);color:var(--dyx-brand)}.dyx-filter-clear[hidden]{visibility:hidden;display:block}",
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
  ".dyx-comment-compose{margin-bottom:12px;padding:12px;border:1px solid var(--dyx-line);border-radius:11px;background:var(--dyx-panel2)}.dyx-comment-compose .dyx-textarea{min-height:92px;background:var(--dyx-panel)}.dyx-comment-compose-actions{margin-top:9px;display:flex;align-items:center;justify-content:space-between;gap:10px}.dyx-comment-compose-actions span{color:var(--dyx-muted);font-size:11px}.dyx-comments{display:grid;gap:10px}.dyx-comment{padding:12px;border:1px solid var(--dyx-line);border-radius:10px}.dyx-comment-head{display:flex;justify-content:space-between;margin-bottom:7px;color:var(--dyx-muted);font-size:12px}",
  ".dyx-status-row{display:flex;align-items:end;gap:8px}.dyx-status-row .dyx-field{min-width:180px}.dyx-note{padding:10px 12px;border-radius:9px;color:#a16207;background:rgba(245,158,11,.13)}",
  ".dyx-stage{margin:7px 0;padding:10px 12px;display:grid;grid-template-columns:10px 1fr auto;align-items:center;gap:10px;border:1px solid var(--dyx-line);border-radius:9px}.dyx-dot{width:9px;height:9px;border-radius:50%;background:#94a3b8}.dyx-dot.SUCCESS{background:#16a34a}.dyx-dot.RUNNING{background:#f59e0b}.dyx-dot.FAIL,.dyx-dot.FAILED{background:#dc2626}",
  ".dyx-record-list{display:grid;gap:9px}.dyx-record{padding:12px;border:1px solid var(--dyx-line);border-radius:11px;background:var(--dyx-panel2)}.dyx-record.dyx-record-status-pending{border-color:var(--dyx-status-pending-line);background:color-mix(in srgb,var(--dyx-status-pending) 6%,var(--dyx-panel2))}.dyx-record.dyx-record-status-processing{border-color:var(--dyx-status-processing-line);background:color-mix(in srgb,var(--dyx-status-processing) 6%,var(--dyx-panel2))}.dyx-record.dyx-record-status-reopened{border-color:var(--dyx-status-reopened-line);background:color-mix(in srgb,var(--dyx-status-reopened) 6%,var(--dyx-panel2))}.dyx-record-head,.dyx-record-foot{display:flex;align-items:center;justify-content:space-between;gap:9px}.dyx-record-title{margin:9px 0;color:var(--dyx-text);font-size:14px;font-weight:650;line-height:1.45}.dyx-record-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;color:var(--dyx-muted);font-size:12px}.dyx-record-foot{margin-top:10px;padding-top:9px;border-top:1px solid var(--dyx-line)}",
  ".dyx-inline-status{width:150px;min-height:32px;padding:5px 28px 5px 9px;font-size:12px}.dyx-status-pending{color:var(--dyx-status-pending);border-color:var(--dyx-status-pending-line);background:var(--dyx-status-pending-bg)}.dyx-status-processing{color:var(--dyx-status-processing);border-color:var(--dyx-status-processing-line);background:var(--dyx-status-processing-bg)}.dyx-status-reopened{color:var(--dyx-status-reopened);border-color:var(--dyx-status-reopened-line);background:var(--dyx-status-reopened-bg)}",
  ".dyx-toast-wrap{position:absolute;z-index:60;right:12px;top:12px;display:grid;gap:8px}.dyx-toast{max-width:340px;padding:10px 14px;border:1px solid var(--dyx-line);border-radius:10px;background:var(--dyx-panel);box-shadow:var(--dyx-shadow)}.dyx-toast.error{color:var(--dyx-danger)}",
  ".dyx-global-notice{position:fixed;z-index:2147483000;right:22px;top:22px;width:min(380px,calc(100vw - 44px));padding:14px 16px;border:1px solid var(--dyx-status-reopened-line);border-radius:12px;color:var(--dyx-text);background:color-mix(in srgb,var(--dyx-status-reopened) 7%,var(--dyx-panel));box-shadow:var(--dyx-shadow);font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI','Microsoft YaHei',sans-serif;animation:dyx-slide-in .18s ease-out}.dyx-global-notice strong{display:block;margin-bottom:2px}.dyx-global-notice span{display:block;color:var(--dyx-muted);font-size:12px}.dyx-global-notice-actions{margin-top:11px;display:flex;justify-content:flex-end;gap:8px}.dyx-global-notice-actions button{min-height:30px;padding:5px 10px;border:1px solid var(--dyx-line);border-radius:8px;color:var(--dyx-text);background:var(--dyx-panel);cursor:pointer;font:inherit}.dyx-global-notice-actions button.primary{border-color:var(--dyx-brand);color:#fff;background:#2563eb}",
  ".dyx-loading{opacity:.65;pointer-events:none}.dyx-stale{margin-bottom:10px;padding:8px 11px;border-radius:9px;color:#a16207;background:rgba(245,158,11,.12)}",
  "@container(max-width:430px){.dyx-main{padding:12px}.dyx-tools,.dyx-notify-grid,.dyx-project-row{grid-template-columns:1fr}.dyx-title{display:block}.dyx-title>.dyx-btn,.dyx-title>.dyx-actions{margin-top:9px}.dyx-modal-body{padding:14px}.dyx-head{padding:0 12px}.dyx-head-copy strong{font-size:15px}.dyx-nav button{font-size:12px}.dyx-nav button span:first-child{display:none}.dyx-status-row{align-items:stretch;flex-direction:column}.dyx-status-row .dyx-field{min-width:0}}",
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

function dateValue(value) {
  if (value === null || value === undefined || value === "") return 0;
  var date = typeof value === "number" || /^\d{13}$/.test(String(value)) ? new Date(Number(value)) : new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function applyDefectStatusTone(select, statusName) {
  select.classList.remove("dyx-status-pending", "dyx-status-processing", "dyx-status-reopened");
  var normalized = String(statusName || "").trim();
  if (["待确认", "未确认"].indexOf(normalized) >= 0) select.classList.add("dyx-status-pending");
  else if (normalized === "处理中") select.classList.add("dyx-status-processing");
  else if (["再次打开", "重新打开", "REOPEN", "REOPENED"].indexOf(normalized.toUpperCase()) >= 0) select.classList.add("dyx-status-reopened");
}

function applyDefectRecordTone(card, statusName) {
  card.classList.remove("dyx-record-status-pending", "dyx-record-status-processing", "dyx-record-status-reopened");
  var normalized = String(statusName || "").trim();
  if (["待确认", "未确认"].indexOf(normalized) >= 0) card.classList.add("dyx-record-status-pending");
  else if (normalized === "处理中") card.classList.add("dyx-record-status-processing");
  else if (["再次打开", "重新打开", "REOPEN", "REOPENED"].indexOf(normalized.toUpperCase()) >= 0) card.classList.add("dyx-record-status-reopened");
}

function selectedOptionText(select) {
  var option = select.options && select.options[select.selectedIndex];
  return option ? option.textContent : "";
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

function defaultDefectNotification() {
  return { enabled: false, assignedToId: "", assignedToName: "", intervalMinutes: DEFAULT_NOTIFICATION_INTERVAL };
}

function createDefectNotifier(options) {
  options = options || {};
  var timer = null;
  var disposed = false;
  var polling = null;
  var assigneeLoading = null;
  var seenByScope = new Map();
  var listeners = new Set();
  var snapshot = {
    accountId: "",
    projectId: "",
    projectName: "",
    settings: defaultDefectNotification(),
    assignees: [],
    unreadCount: 0,
    lastCheckedAt: "",
    lastError: "",
    lastResultCount: 0,
    lastAddedCount: 0,
    lastQueryCount: 0,
    lastWindowsStatus: "尚未触发"
  };

  function copySnapshot() {
    return Object.assign({}, snapshot, {
      settings: Object.assign({}, snapshot.settings),
      assignees: snapshot.assignees.slice()
    });
  }

  function emit() {
    var value = copySnapshot();
    listeners.forEach(function (listener) { listener(value); });
  }

  function mergeAssignees(items) {
    var values = new Map(snapshot.assignees.map(function (item) { return [item.id, item]; }));
    (items || []).forEach(function (item) { if (item && item.id && item.name) values.set(item.id, item); });
    snapshot.assignees = Array.from(values.values()).sort(function (left, right) { return left.name.localeCompare(right.name, "zh-CN"); });
  }

  function applyServerState(server) {
    var account = (server.accounts || []).find(function (item) { return item.id === server.selectedAccountId; }) || null;
    var project = account && account.selectedProject || null;
    snapshot.accountId = account && account.id || "";
    snapshot.projectId = project && project.id || "";
    snapshot.projectName = project && project.name || "";
    snapshot.settings = Object.assign(defaultDefectNotification(), account && account.defectNotification || {});
    snapshot.settings.intervalMinutes = Math.min(1440, Math.max(1, Number(snapshot.settings.intervalMinutes) || DEFAULT_NOTIFICATION_INTERVAL));
    if (!snapshot.settings.enabled && snapshot.accountId && snapshot.projectId) {
      seenByScope.delete([snapshot.accountId, snapshot.projectId, snapshot.settings.assignedToId || "*"].join(":"));
    }
    if (snapshot.settings.assignedToId && snapshot.settings.assignedToName) {
      mergeAssignees([{ id: snapshot.settings.assignedToId, name: snapshot.settings.assignedToName }]);
    }
  }

  function schedule() {
    if (timer) clearTimeout(timer);
    timer = null;
    if (disposed || !snapshot.settings.enabled || !snapshot.accountId || !snapshot.projectId) return;
    timer = setTimeout(runPoll, snapshot.settings.intervalMinutes * NOTIFICATION_MINUTE_MS);
  }

  function showWebNotification(count, items, notificationTag) {
    if (!("Notification" in window)) return "Web 通知不支持";
    if (window.Notification.permission !== "granted") return "Web 通知未授权";
    try {
      var notification = new window.Notification("云效缺陷提醒", {
        body: "新增 " + count + " 个缺陷需修复",
        tag: notificationTag || "dsh-yunxiao-defects-" + snapshot.accountId + "-" + snapshot.projectId + "-" + Date.now(),
        renotify: true,
        requireInteraction: true
      });
      notification.onclick = function () {
        try { window.focus(); } catch (error) {}
        if (typeof options.onOpen === "function") options.onOpen(items || []);
        notification.close();
      };
      return window.__dsh_native_notification_bridge__
        ? "已提交到 Harness；Windows 是否显示横幅由系统设置决定"
        : "已提交给 Web 通知";
    } catch (error) {
      return "Web 通知调用失败";
    }
  }

  function showSystemNotification(count, items) {
    snapshot.lastWindowsStatus = "正在提交";
    emit();
    var tag = "dyx-defect-" + Date.now();
    if (window.__dsh_native_notification_bridge__) {
      // 桌面端只提交一条原生 Toast；再发 Web Notification 会让 Windows 多弹一条重复横幅
      return rpc("system.notification.show", {
        title: "云效缺陷提醒",
        body: "新增 " + count + " 个缺陷需修复",
        tag: tag
      }).then(function (result) {
        snapshot.lastWindowsStatus = result && result.accepted
          ? "Harness 桌面提醒已提交"
          : "Harness 桌面提醒不可用";
      }).catch(function (error) {
        snapshot.lastWindowsStatus = "Harness 桌面提醒失败（" + (error instanceof Error ? error.message : String(error)) + "）";
      }).then(function () {
        emit();
        return copySnapshot();
      });
    }
    return rpc("system.notification.show", {
      title: "云效缺陷提醒",
      body: "新增 " + count + " 个缺陷需修复",
      tag: tag
    }).then(function (result) {
      snapshot.lastWindowsStatus = result && result.accepted
        ? "已提交给 Windows 原生通知"
        : showWebNotification(count, items);
    }).catch(function (error) {
      var fallback = showWebNotification(count, items);
      snapshot.lastWindowsStatus = "原生通知失败；" + fallback + "（" + (error instanceof Error ? error.message : String(error)) + "）";
    }).then(function () {
      emit();
      return copySnapshot();
    });
  }

  function clearInAppNotification() {
    var existing = document.querySelector(".dyx-global-notice");
    if (existing) existing.remove();
  }

  function showInAppNotification(count, items) {
    clearInAppNotification();
    var notice = node("div", "dyx-global-notice");
    notice.setAttribute("role", "alert");
    notice.append(
      node("strong", "", "新增 " + count + " 个缺陷需修复"),
      node("span", "", "状态为待确认或再次打开，请及时处理。")
    );
    var actions = node("div", "dyx-global-notice-actions");
    var close = node("button", "", "关闭");
    close.type = "button";
    close.addEventListener("click", clearInAppNotification);
    actions.append(close);
    var view = node("button", "primary", "查看缺陷");
    view.type = "button";
    view.addEventListener("click", function () {
      clearInAppNotification();
      if (typeof options.onOpen === "function") options.onOpen(items || []);
    });
    actions.append(view);
    notice.append(actions);
    document.body.append(notice);
  }

  function runPoll() {
    if (disposed) return Promise.resolve(copySnapshot());
    if (polling) return polling;
    polling = rpc("state.get").then(function (server) {
      applyServerState(server);
      if (!snapshot.settings.enabled || !snapshot.accountId || !snapshot.projectId) return null;
      var scope = [snapshot.accountId, snapshot.projectId, snapshot.settings.assignedToId || "*"].join(":");
      return rpc("defect.notification.scan", {
        accountId: snapshot.accountId,
        projectId: snapshot.projectId,
        assignedToId: snapshot.settings.assignedToId || ""
      }).then(function (result) {
        mergeAssignees(result.assignees || []);
        var ids = (result.ids || []).filter(Boolean);
        var seen = seenByScope.get(scope);
        snapshot.lastResultCount = ids.length;
        snapshot.lastQueryCount = Number(result.queryCount || 0);
        snapshot.lastAddedCount = 0;
        if (!seen) {
          seen = new Set(ids);
          seenByScope.set(scope, seen);
        } else {
          var addedIds = ids.filter(function (id) { return !seen.has(id); });
          seenByScope.set(scope, new Set(ids));
          var addedSet = new Set(addedIds);
          var addedItems = (result.items || []).filter(function (item) { return item && addedSet.has(item.id); });
          if (addedItems.length) {
            snapshot.lastAddedCount = addedItems.length;
            snapshot.unreadCount += addedItems.length;
            showInAppNotification(addedItems.length, addedItems);
            showSystemNotification(addedItems.length, addedItems);
          }
        }
        snapshot.lastCheckedAt = result.checkedAt || new Date().toISOString();
        snapshot.lastError = "";
      });
    }).catch(function (error) {
      snapshot.lastError = error instanceof Error ? error.message : String(error);
    }).then(function () {
      emit();
      return copySnapshot();
    }).finally(function () {
      polling = null;
      schedule();
    });
    return polling;
  }

  function refresh() {
    if (timer) clearTimeout(timer);
    timer = null;
    return runPoll();
  }

  function loadAssignees() {
    if (assigneeLoading) return assigneeLoading;
    var prepare = snapshot.accountId && snapshot.projectId
      ? Promise.resolve()
      : rpc("state.get").then(applyServerState);
    assigneeLoading = prepare.then(function () {
      if (!snapshot.accountId || !snapshot.projectId) return [];
      return rpc("defect.notification.assignees", {
        accountId: snapshot.accountId,
        projectId: snapshot.projectId
      });
    }).then(function (items) {
      mergeAssignees(items || []);
      emit();
      return copySnapshot();
    }).catch(function (error) {
      snapshot.lastError = error instanceof Error ? error.message : String(error);
      emit();
      return copySnapshot();
    }).finally(function () { assigneeLoading = null; });
    return assigneeLoading;
  }

  function markRead() {
    if (!snapshot.unreadCount) return;
    snapshot.unreadCount = 0;
    clearInAppNotification();
    emit();
  }

  function subscribe(listener) {
    listeners.add(listener);
    return function () { listeners.delete(listener); };
  }

  function dispose() {
    disposed = true;
    if (timer) clearTimeout(timer);
    timer = null;
    listeners.clear();
  }

  return {
    start: refresh,
    refresh: refresh,
    loadAssignees: loadAssignees,
    markRead: markRead,
    subscribe: subscribe,
    snapshot: copySnapshot,
    dispose: dispose
  };
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

function createWorkspace(onRequestClose, notifier) {
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
    defectMembers: [],
    defectMembersScope: "@:",
    defectMembersLoading: false,
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
  var defectLoadRevision = 0;
  var notificationAssigneesScope = "";
  var unsubscribeNotifier = null;

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

  function projectScope() {
    var account = selectedAccount();
    var project = selectedProject();
    return (account && account.id || "") + ":" + (project && project.id || "");
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
    if (tab === "defects" && notifier) notifier.markRead();
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
        var actions = node("div", "dyx-actions");
        actions.append(
          button("编辑", "", function () { openAccountForm(account); }),
          button("删除", "danger", function () { removeAccount(account); })
        );
        actions.addEventListener("click", function (event) { event.stopPropagation(); });
        top.append(avatar, grow, node("span", "dyx-badge " + (account.hasToken ? "ok" : "fail"), account.hasToken ? "令牌已配置" : "缺少令牌"), actions);
        top.addEventListener("click", function () { chooseAccount(account.id); });
        card.append(top);
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
          .then(function () { return notifier ? notifier.refresh() : null; })
          .then(function () { notificationAssigneesScope = ""; toast("已切换到“" + project.name + "”"); render(); })
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
    renderDefectNotification(section, account);
    main.append(section);
  }

  function renderDefectNotification(section, account) {
    var project = account && account.selectedProject || null;
    var settings = Object.assign(defaultDefectNotification(), account && account.defectNotification || {});
    var noticeState = notifier ? notifier.snapshot() : { assignees: [], unreadCount: 0, lastCheckedAt: "", lastError: "" };
    var card = node("div", "dyx-card");
    var head = node("div", "dyx-card-head");
    var headTitle = node("div", "dyx-card-title");
    var refreshCheck = node("button", "dyx-icon-btn", "↻");
    refreshCheck.type = "button";
    refreshCheck.setAttribute("aria-label", "刷新缺陷检查");
    refreshCheck.title = "立即刷新一次缺陷检查";
    headTitle.append(node("h3", "", "缺陷通知"), refreshCheck);
    head.append(headTitle, node("span", "dyx-badge " + (settings.enabled ? "ok" : ""), settings.enabled ? "已开启" : "未开启"));
    card.append(head);
    if (!account || !project) {
      card.append(empty(!account ? "请先选择账号" : "请先选择项目", "通知配置按账号和项目分别保存。"));
      section.append(card);
      return;
    }
    if (settings.enabled) {
      var scoped = notifier && noticeState.accountId === account.id && noticeState.projectId === project.id;
      var stats = [];
      if (scoped && noticeState.lastCheckedAt) {
        stats.push("当前 " + noticeState.lastResultCount + " 条未处理", "更新时间 " + formatDate(noticeState.lastCheckedAt));
        if (noticeState.lastError) stats.push("检查失败：" + noticeState.lastError);
      } else {
        stats.push(scoped && noticeState.lastError ? "检查失败：" + noticeState.lastError : "尚未检查，可点击标题旁按钮刷新");
      }
      card.append(node("div", "dyx-notify-stats", stats.join(" · ")));
    }

    var toggle = input("checkbox");
    toggle.checked = Boolean(settings.enabled);
    toggle.setAttribute("aria-label", "开启缺陷通知");
    var toggleWrap = node("label", "dyx-notify-toggle");
    var toggleCopy = node("span");
    toggleCopy.append(node("strong", "", "Windows 系统通知"), node("div", "dyx-muted", "有新增缺陷时显示系统提醒"));
    toggleWrap.append(toggleCopy, toggle);

    var assignee = node("select", "dyx-select");
    assignee.setAttribute("aria-label", "缺陷通知负责人");
    var emptyAssignee = node("option", "", "不选择负责人");
    emptyAssignee.value = "";
    assignee.append(emptyAssignee);
    var assignees = noticeState.accountId === account.id && noticeState.projectId === project.id ? noticeState.assignees : [];
    if (settings.assignedToId && !assignees.some(function (item) { return item.id === settings.assignedToId; })) {
      assignees = [{ id: settings.assignedToId, name: settings.assignedToName || settings.assignedToId }].concat(assignees);
    }
    assignees.forEach(function (item) { var option = node("option", "", item.name); option.value = item.id; assignee.append(option); });
    assignee.value = settings.assignedToId || "";

    var interval = node("select", "dyx-select");
    interval.setAttribute("aria-label", "缺陷通知查询间隔");
    [1, 5, 10, 15, 30, 60].forEach(function (minutes) {
      var option = node("option", "", minutes + " 分钟");
      option.value = String(minutes);
      interval.append(option);
    });
    if (!Array.from(interval.options).some(function (item) { return item.value === String(settings.intervalMinutes); })) {
      var custom = node("option", "", settings.intervalMinutes + " 分钟");
      custom.value = String(settings.intervalMinutes);
      interval.append(custom);
    }
    interval.value = String(settings.intervalMinutes);

    function saveNotification(next) {
      setBusy(card, true);
      rpc("defect.notification.settings.update", rpcArgs(Object.assign({}, settings, next))).then(loadState).then(function () {
        return notifier ? notifier.refresh() : null;
      }).then(function () {
        render();
        toast(next.enabled === true ? "缺陷通知已开启" : next.enabled === false ? "缺陷通知已关闭" : "缺陷通知设置已更新");
      }).catch(function (error) {
        toggle.checked = Boolean(settings.enabled);
        toast(error.message, true);
      }).finally(function () { setBusy(card, false); });
    }

    toggle.addEventListener("change", function () {
      if (!toggle.checked) { saveNotification({ enabled: false }); return; }
      saveNotification({ enabled: true });
    });
    assignee.addEventListener("change", function () {
      var option = assignee.options[assignee.selectedIndex];
      saveNotification({ assignedToId: assignee.value, assignedToName: assignee.value && option ? option.textContent : "" });
    });
    interval.addEventListener("change", function () { saveNotification({ intervalMinutes: Number(interval.value) }); });

    var grid = node("div", "dyx-notify-grid");
    grid.append(field("负责人（不选择则不限制）", assignee), field("查询间隔", interval));
    card.append(toggleWrap, grid);
    refreshCheck.disabled = !settings.enabled || !notifier;
    refreshCheck.addEventListener("click", function () {
      if (!notifier) return;
      refreshCheck.disabled = true;
      Promise.resolve(notifier.refresh()).catch(function (error) { toast(error.message, true); })
        .finally(function () { refreshCheck.disabled = false; });
    });
    section.append(card);

    var scope = account.id + ":" + project.id;
    if (notifier && notificationAssigneesScope !== scope) {
      notificationAssigneesScope = scope;
      Promise.resolve().then(function () { return notifier.loadAssignees(); });
    }
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
      }).then(function () { return notifier ? notifier.refresh() : null; })
        .then(function () { notificationAssigneesScope = ""; render(); toast("账号已保存"); })
        .catch(function (error) { toast(error.message, true); })
        .finally(function () { submit.disabled = false; });
    }));
  }

  function chooseAccount(id) {
    if (id === state.server.selectedAccountId) return;
    rpc("account.select", { accountId: id }).then(function () {
      state.projects = [];
      return loadState();
    }).then(function () { return notifier ? notifier.refresh() : null; })
      .then(function () { notificationAssigneesScope = ""; render(); }).catch(function (error) { toast(error.message, true); });
  }

  function removeAccount(account) {
    if (!window.confirm("删除账号“" + account.name + "”及其本地文本缓存？")) return;
    rpc("account.delete", { accountId: account.id }).then(function () {
      state.projects = [];
      return loadState();
    }).then(function () { return notifier ? notifier.refresh() : null; })
      .then(function () { notificationAssigneesScope = ""; render(); toast("账号已删除"); }).catch(function (error) { toast(error.message, true); });
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
    copy.append(node("h2", "", "缺陷"), node("p", "", "实时读取云效工作项，按创建时间从新到旧排列；接口不可用时才显示离线缓存。"));
    title.append(copy, button("刷新", "", loadDefects));
    section.append(title);
    if (!renderRequirement(section)) { main.append(section); return; }
    var card = node("div", "dyx-card");
    var tools = node("div", "dyx-defect-filters");
    var status = node("select", "dyx-select");
    status.setAttribute("aria-label", "按状态筛选");
    status.append(node("option", "", "请选择状态"));
    state.defectStatusOptions.forEach(function (item) { var option = node("option", "", item.name); option.value = item.id; status.append(option); });
    status.value = state.defectFilters.statusId;
    var assignee = node("select", "dyx-select");
    assignee.setAttribute("aria-label", "按负责人筛选");
    assignee.append(node("option", "", "请选择负责人"));
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
      applyDefectRecordTone(card, item.statusName);
      var head = node("div", "dyx-record-head");
      var statusSelect = node("select", "dyx-select dyx-inline-status");
      statusSelect.setAttribute("aria-label", "修改 " + (item.serialNumber || "缺陷") + " 状态");
      fillListStatusSelect(statusSelect, item);
      statusSelect.addEventListener("pointerdown", function () { loadListStatuses(item, statusSelect); });
      statusSelect.addEventListener("focus", function () { loadListStatuses(item, statusSelect); });
      statusSelect.addEventListener("change", function () {
        var statusName = selectedOptionText(statusSelect);
        applyDefectStatusTone(statusSelect, statusName);
        applyDefectRecordTone(card, statusName);
        saveListStatus(item, statusSelect, card);
      });
      head.append(node("strong", "", item.serialNumber || "缺陷"), statusSelect);
      var title = node("button", "dyx-link dyx-record-title", item.subject || "未命名缺陷");
      title.type = "button";
      title.addEventListener("click", function () { openDefect(item); });
      var meta = node("div", "dyx-record-meta");
      meta.append(node("span", "", "负责人 " + (item.assignedToName || "未分配")), node("span", "", "·"), node("span", "", item.priority || item.severity || "未定级"));
      var foot = node("div", "dyx-record-foot");
      foot.append(node("span", "dyx-muted", "创建 " + formatDate(item.gmtCreate || item.gmtModified)), button("查看详情", "", function () { openDefect(item); }));
      card.append(head, title, meta, foot);
      wrap.append(card);
    });
    return wrap;
  }

  function mergeDefectOptions(items, statuses, members) {
    var statusMap = new Map(state.defectStatusOptions.map(function (item) { return [item.id, item]; }));
    var assigneeMap = new Map(state.defectAssigneeOptions.map(function (item) { return [item.id, item]; }));
    (items || []).forEach(function (item) {
      if (item.statusId && item.statusName) statusMap.set(item.statusId, { id: item.statusId, name: item.statusName });
      if (item.assignedToId && item.assignedToName) assigneeMap.set(item.assignedToId, { id: item.assignedToId, name: item.assignedToName });
    });
    (statuses || []).forEach(function (item) { if (item.id && item.name) statusMap.set(item.id, item); });
    (members || []).forEach(function (item) { if (item.id && item.name) assigneeMap.set(item.id, item); });
    state.defectStatusOptions = Array.from(statusMap.values());
    state.defectAssigneeOptions = Array.from(assigneeMap.values());
    if (defectStatusFilterControl && defectStatusFilterControl.isConnected) {
      var selectedStatus = defectStatusFilterControl.value;
      defectStatusFilterControl.textContent = "";
      defectStatusFilterControl.append(node("option", "", "请选择状态"));
      state.defectStatusOptions.forEach(function (item) { var option = node("option", "", item.name); option.value = item.id; defectStatusFilterControl.append(option); });
      defectStatusFilterControl.value = selectedStatus;
    }
    if (defectAssigneeFilterControl && defectAssigneeFilterControl.isConnected) {
      var selectedAssignee = defectAssigneeFilterControl.value;
      defectAssigneeFilterControl.textContent = "";
      defectAssigneeFilterControl.append(node("option", "", "请选择负责人"));
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
    applyDefectStatusTone(select, item.statusName);
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

  function saveListStatus(item, select, card) {
    var statusId = select.value;
    if (!statusId || statusId === item.statusId || state.defectStatusSaving[item.id]) return;
    var previousStatusId = item.statusId;
    state.defectStatusSaving[item.id] = true;
    select.disabled = true;
    rpc("defect.status.update", rpcArgs({ defectId: item.id, statusId: statusId })).then(function (updated) {
      Object.assign(item, updated);
      applyDefectRecordTone(card, updated.statusName);
      mergeDefectOptions([updated], state.defectStatuses[item.id]);
      fillListStatusSelect(select, item);
      toast("缺陷状态已更新");
      reloadDefectsSoon();
    }).catch(function (error) {
      select.value = previousStatusId || "";
      applyDefectStatusTone(select, item.statusName);
      applyDefectRecordTone(card, item.statusName);
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

  // 云效 workitems:search 是搜索索引，修改后立即查询可能返回旧值；
  // 修改成功返回后等半秒再刷新，避开索引延迟。
  function reloadDefectsSoon() {
    setTimeout(function () {
      if (state.tab === "defects" && selectedProject()) loadDefects();
    }, 500);
  }

  function loadDefects() {
    if (!selectedProject()) return render();
    var revision = ++defectLoadRevision;
    setBusy(main, true);
    rpc("defects.list", rpcArgs({
      page: state.defects.page,
      pageSize: state.defects.pageSize,
      statusId: state.defectFilters.statusId,
      assignedToId: state.defectFilters.assignedToId
    })).then(function (result) {
      if (revision !== defectLoadRevision) return;
      result.items = (result.items || []).slice().sort(function (left, right) {
        return dateValue(right.gmtCreate || right.gmtModified) - dateValue(left.gmtCreate || left.gmtModified);
      });
      state.defects = result;
      mergeDefectOptions(result.items);
      render();
    }).catch(function (error) { if (revision === defectLoadRevision) toast(error.message, true); }).finally(function () { if (revision === defectLoadRevision) setBusy(main, false); });
  }

  function openDefect(item) {
    var dialog = modal("缺陷详情", true);
    dialog.body.append(empty("正在读取", item.serialNumber || item.id));
    rpc("defect.get", rpcArgs({ defectId: item.id })).then(function (detail) {
      renderDefectDetail(dialog, detail);
    }).catch(function (error) { dialog.body.textContent = ""; dialog.body.append(empty("读取失败", error.message)); });
  }

  function openNotifiedDefects(items) {
    var values = (items || []).filter(function (item) { return item && item.id; });
    return loadState().then(function () {
      setTab("defects");
      if (!values.length) return;
      openDefect(values[0]);
      if (values.length > 1) toast("本次新增 " + values.length + " 个缺陷，当前打开第一条");
    }).catch(function (error) {
      toast(error instanceof Error ? error.message : String(error), true);
    });
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
    applyDefectStatusTone(select, item.statusName);
    select.addEventListener("change", function () {
      var statusId = select.value;
      if (!statusId || statusId === item.statusId) return;
      var previousStatusId = item.statusId;
      applyDefectStatusTone(select, selectedOptionText(select));
      select.disabled = true;
      rpc("defect.status.update", rpcArgs({ defectId: item.id, statusId: statusId })).then(function (updated) {
        detail.defect = updated; item = updated;
        applyDefectStatusTone(select, updated.statusName);
        var listed = state.defects.items.find(function (entry) { return entry.id === updated.id; });
        if (listed) Object.assign(listed, updated);
        toast("缺陷状态已更新");
        reloadDefectsSoon();
      }).catch(function (error) {
        select.value = previousStatusId || "";
        applyDefectStatusTone(select, item.statusName);
        toast(error.message, true);
      }).finally(function () {
        select.disabled = !detail.statuses || !detail.statuses.length;
      });
    });
    function fillDetailAssignee(assigneeSelect) {
      var entries = state.defectMembers.slice();
      if (item.assignedToId && !entries.some(function (entry) { return entry.id === item.assignedToId; })) {
        entries.unshift({ id: item.assignedToId, name: item.assignedToName || item.assignedToId });
      }
      assigneeSelect.textContent = "";
      if (!entries.length) {
        var none = node("option", "", "未分配");
        none.value = "";
        assigneeSelect.append(none);
      } else {
        entries.forEach(function (entry) { var option = node("option", "", entry.name); option.value = entry.id; assigneeSelect.append(option); });
      }
      if (!item.assignedToId) {
        var unassigned = node("option", "", "未分配");
        unassigned.value = "";
        assigneeSelect.insertBefore(unassigned, assigneeSelect.firstChild);
      }
      assigneeSelect.value = item.assignedToId || "";
    }
    function loadDetailMembers(assigneeSelect) {
      if (state.defectMembersLoading) return;
      if (state.defectMembersScope === projectScope() && state.defectMembers.length) return;
      state.defectMembersLoading = true;
      rpc("defect.members", rpcArgs({})).then(function (members) {
        state.defectMembers = members || [];
        state.defectMembersScope = projectScope();
        mergeDefectOptions([], [], state.defectMembers);
        fillDetailAssignee(assigneeSelect);
      }).catch(function (error) { toast(error.message, true); }).finally(function () {
        state.defectMembersLoading = false;
      });
    }
    var assigneeSelect = node("select", "dyx-select");
    assigneeSelect.setAttribute("aria-label", "修改 " + (item.serialNumber || "缺陷") + " 负责人");
    fillDetailAssignee(assigneeSelect);
    assigneeSelect.addEventListener("pointerdown", function () { loadDetailMembers(assigneeSelect); });
    assigneeSelect.addEventListener("focus", function () { loadDetailMembers(assigneeSelect); });
    assigneeSelect.addEventListener("change", function () {
      var assignedToId = assigneeSelect.value;
      if (!assignedToId || assignedToId === item.assignedToId || state.defectMembersLoading) return;
      assigneeSelect.disabled = true;
      rpc("defect.assignee.update", rpcArgs({ defectId: item.id, assignedToId: assignedToId })).then(function (updated) {
        detail.defect = updated; item = updated;
        mergeDefectOptions([updated], []);
        fillDetailAssignee(assigneeSelect);
        syncMetaValues();
        var listed = state.defects.items.find(function (entry) { return entry.id === updated.id; });
        if (listed) Object.assign(listed, updated);
        toast("负责人已更新为" + (updated.assignedToName || updated.assignedToId));
        reloadDefectsSoon();
      }).catch(function (error) {
        fillDetailAssignee(assigneeSelect);
        toast(error.message, true);
      }).finally(function () { assigneeSelect.disabled = false; });
    });
    statusRow.append(field("状态", select), field("负责人", assigneeSelect));
    dialog.body.append(statusRow);
    var meta = node("div", "dyx-meta");
    var metaSpans = {};
    [["创建人", item.creatorName], ["最近修改人", item.modifierName], ["迭代", item.sprintName], ["优先级", item.priority || item.severity], ["更新时间", formatDate(item.gmtModified)]].forEach(function (pair) {
      var box = node("div");
      var valueSpan = node("span", "", pair[1] || "-");
      box.append(node("small", "", pair[0]), valueSpan);
      meta.append(box);
      metaSpans[pair[0]] = valueSpan;
    });
    function syncMetaValues() {
      metaSpans["创建人"].textContent = item.creatorName || "-";
      metaSpans["最近修改人"].textContent = item.modifierName || "-";
      metaSpans["迭代"].textContent = item.sprintName || "-";
      metaSpans["优先级"].textContent = item.priority || item.severity || "-";
      metaSpans["更新时间"].textContent = formatDate(item.gmtModified);
    }
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
    var commentCount = detail.comments && detail.comments.length || 0;
    dialog.body.append(node("h3", "", "评论（" + commentCount + "）"));
    var compose = node("div", "dyx-comment-compose");
    var commentInput = input("textarea", "输入评论内容，Ctrl/Command + Enter 快速提交", "");
    commentInput.maxLength = 10000;
    var publish = button("发布评论", "primary");
    function submitComment() {
      var content = commentInput.value.trim();
      if (!content) return toast("请输入评论内容", true);
      commentInput.disabled = true;
      publish.disabled = true;
      publish.textContent = "发布中…";
      rpc("defect.comment.create", rpcArgs({ defectId: item.id, content: content })).then(function () {
        commentInput.value = "";
        toast("评论已发布");
        return rpc("defect.get", rpcArgs({ defectId: item.id })).then(function (refreshed) {
          renderDefectDetail(dialog, refreshed);
        }).catch(function () {
          toast("评论已发布，但列表刷新失败，请重新打开缺陷详情", true);
        });
      }).catch(function (error) {
        toast(error.message, true);
      }).finally(function () {
        commentInput.disabled = false;
        publish.disabled = false;
        publish.textContent = "发布评论";
      });
    }
    publish.addEventListener("click", submitComment);
    commentInput.addEventListener("keydown", function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        submitComment();
      }
    });
    var composeActions = node("div", "dyx-comment-compose-actions");
    composeActions.append(node("span", "", "将以当前云效账号身份发布 · 最多 10000 字"), publish);
    compose.append(commentInput, composeActions);
    dialog.body.append(compose);
    if (commentCount) {
      var comments = node("div", "dyx-comments");
      detail.comments.forEach(function (comment) {
        var card = node("div", "dyx-comment");
        var head = node("div", "dyx-comment-head"); head.append(node("strong", "", comment.userName || "匿名"), node("span", "", formatDate(comment.gmtCreate)));
        var content = node("div", "dyx-rich"); renderRich(content, comment.content || "", comment.contentFormat || "RICHTEXT", detail.attachments || []);
        card.append(head, content); comments.append(card);
      });
      dialog.body.append(comments);
    } else dialog.body.append(empty("暂无评论", "发布第一条评论。"));
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
        var control = node("select", "dyx-select");
        var branches = Array.from(new Set([source.defaultBranch].concat(source.branches || []).filter(Boolean)));
        if (source.isBranchMode) { control.multiple = true; control.size = Math.min(5, Math.max(3, branches.length)); }
        else { var blank = node("option", "", "使用流水线默认配置"); blank.value = ""; control.append(blank); }
        if (branches.length) {
          branches.forEach(function (branch) { var option = node("option", "", branch); option.value = branch; option.selected = branch === source.defaultBranch; control.append(option); });
        } else {
          var unavailable = node("option", "", "暂无可用分支"); unavailable.value = ""; unavailable.disabled = true; unavailable.selected = true; control.append(unavailable); control.disabled = true;
        }
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
    if (notifier) unsubscribeNotifier = notifier.subscribe(function () { if (root && state.tab === "overview") render(); });
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
    if (unsubscribeNotifier) unsubscribeNotifier();
    unsubscribeNotifier = null;
    root = null;
  }

  return { mount: mount, dispose: dispose, openNotifiedDefects: openNotifiedDefects };
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
    var previewWorkspace = null;
    var previewNotifier = createDefectNotifier({
      onOpen: function (items) { if (previewWorkspace) previewWorkspace.openNotifiedDefects(items); }
    });
    var previewHost = node("div", "dyx-preview-host");
    document.body.append(previewHost);
    previewWorkspace = createWorkspace(function () { previewHost.remove(); }, previewNotifier);
    previewWorkspace.mount(previewHost);
    previewNotifier.start();
    ctx.effect(function () { return function () { previewNotifier.dispose(); previewWorkspace.dispose(); previewHost.remove(); if (!existingStyle) style.remove(); }; }, "dsh-yunxiao: standalone preview");
    return;
  }

  var panelOpen = false;
  var panelListeners = new Set();
  var workspaceFrame = null;
  var preferredPanelWidth = readPanelWidth();
  var panelWidth = clampPanelWidth(preferredPanelWidth);
  function applyPanelWidth(value, persist) {
    panelWidth = clampPanelWidth(value);
    if (workspaceFrame) workspaceFrame.style.setProperty("--dyx-workspace-width", panelWidth + "px");
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
      frame.style.setProperty("--dyx-sidebar-track", match ? match[1] : "280px");
      frame.style.setProperty("--dyx-workspace-width", panelWidth + "px");
      frame.setAttribute("data-dyx-workspace-open", "true");
      workspaceFrame = frame;
    });
  }
  function restoreWorkspaceFrame() {
    if (!workspaceFrame) return;
    workspaceFrame.removeAttribute("data-dyx-workspace-open");
    workspaceFrame.style.removeProperty("--dyx-sidebar-track");
    workspaceFrame.style.removeProperty("--dyx-workspace-width");
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
  var activeWorkspace = null;
  var pendingNoticeItems = [];
  function openNotifiedItems(items) {
    pendingNoticeItems = (items || []).slice();
    setPanelOpen(true);
    if (activeWorkspace) {
      var nextItems = pendingNoticeItems;
      pendingNoticeItems = [];
      activeWorkspace.openNotifiedDefects(nextItems);
    }
  }
  var notifier = createDefectNotifier({ onOpen: openNotifiedItems });
  notifier.start();

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
      var workspace = createWorkspace(function () { setPanelOpen(false); }, notifier);
      activeWorkspace = workspace;
      workspace.mount(hostRef.current);
      if (pendingNoticeItems.length) {
        var nextItems = pendingNoticeItems;
        pendingNoticeItems = [];
        workspace.openNotifiedDefects(nextItems);
      }
      return function () {
        if (activeWorkspace === workspace) activeWorkspace = null;
        workspace.dispose();
      };
    }, [open]);
    if (!open) return null;
    function beginResize(event) {
      if (event.button !== undefined && event.button !== 0) return;
      event.preventDefault();
      var handle = event.currentTarget;
      var startX = event.clientX;
      var startWidth = panelWidth;
      handle.classList.add("active");
      document.documentElement.classList.add("dyx-resizing");
      function move(moveEvent) {
        applyPanelWidth(startWidth + startX - moveEvent.clientX, false);
        handle.setAttribute("aria-valuenow", String(panelWidth));
      }
      function finish() {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", finish);
        window.removeEventListener("pointercancel", finish);
        handle.classList.remove("active");
        document.documentElement.classList.remove("dyx-resizing");
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
    return ReactRuntime.createElement("div", { className: "dyx-right-panel" },
      ReactRuntime.createElement("div", {
        className: "dyx-resize-handle",
        role: "separator",
        tabIndex: 0,
        "aria-label": "调整云效工作台宽度",
        "aria-orientation": "vertical",
        "aria-valuemin": MIN_PANEL_WIDTH,
        "aria-valuemax": MAX_PANEL_WIDTH,
        "aria-valuenow": panelWidth,
        onPointerDown: beginResize,
        onKeyDown: resizeByKeyboard
      }),
      ReactRuntime.createElement("div", { ref: hostRef, className: "dyx-slot-host" }));
  }

  function onWindowResize() { applyPanelWidth(preferredPanelWidth, false); }
  window.addEventListener("resize", onWindowResize);

  function SidebarTrigger(props) {
    var wide = Boolean(props && props.wide);
    var countState = ReactRuntime.useState(notifier.snapshot().lastResultCount);
    var count = countState[0];
    var setCount = countState[1];
    ReactRuntime.useEffect(function () {
      return notifier.subscribe(function (value) { setCount(value.lastResultCount); });
    }, []);
    return ReactRuntime.createElement("button", {
      type: "button",
      className: "dyx-sidebar-trigger",
      "data-wide": wide ? "true" : "false",
      "aria-label": "打开云效工作台",
      title: wide ? undefined : "云效工作台",
      onClick: function () { setPanelOpen(true); }
    },
    ReactRuntime.createElement("span", { className: "dyx-sidebar-trigger-mark", "aria-hidden": "true" }, "云"),
    wide ? ReactRuntime.createElement("span", null, "云效工作台") : null,
    count ? ReactRuntime.createElement("span", { className: "dyx-sidebar-trigger-count", "aria-label": "当前 " + count + " 条未处理缺陷" }, count > 99 ? "99+" : String(count)) : null);
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
    notifier.dispose();
    restoreWorkspaceFrame();
    window.removeEventListener("resize", onWindowResize);
    document.documentElement.classList.remove("dyx-resizing");
    ctx.layout.closeDetails();
    if (!existingStyle) style.remove();
  }; }, "dsh-yunxiao: reserved right workspace");
}

exports.apply = apply;
exports.inject = ["slots", "layout"];
return module.exports;
} });
