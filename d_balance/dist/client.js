// dsh-balance — Client 半（正式浏览器模块，window.__ModuleLoader__.load 格式）
//
// 右下角悬浮胶囊：显示余额、可拖拽、点击设置刷新频率、位置与频率写入 localStorage。
// 余额数据来自 Host 注册的 HTTP 路由 GET /api/d-balance/balance（同源 fetch）。

window.__ModuleLoader__.load({ id: "dsh-balance", factory: (require) => {
var module = { exports: {} };
var exports = module.exports;

var STORE_KEY = "dsh-balance.v1";
var FREQ_OPTIONS = [
  { label: "5 秒", value: 5000 },
  { label: "10 秒", value: 10000 },
  { label: "15 秒", value: 15000 },
  { label: "30 秒", value: 30000 },
  { label: "1 分钟", value: 60000 },
  { label: "5 分钟", value: 300000 }
];

var WIDGET_CSS = [
  ".dsb-root{position:fixed;z-index:2147483000;pointer-events:auto}",
  ".dsb-backdrop{position:fixed;inset:0;z-index:2147482999}",
  ".dsb-widget{display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;",
  "background:rgba(16,18,23,0.95);border:1px solid rgba(255,255,255,0.14);",
  "box-shadow:0 6px 20px rgba(0,0,0,0.45);color:#e8eaee;",
  "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;",
  "font-size:12px;line-height:1;cursor:grab;user-select:none;transition:background .15s;touch-action:none}",
  ".dsb-widget:active{cursor:grabbing}",
  ".dsb-widget:hover{background:rgba(26,29,36,0.98)}",
  ".dsb-dot{width:8px;height:8px;border-radius:50%;background:#f0b429;flex:0 0 auto}",
  ".dsb-dot.ok{background:#2fce6f}",
  ".dsb-dot.err{background:#f15a50}",
  ".dsb-label{opacity:.72}",
  ".dsb-value{font-weight:600;font-variant-numeric:tabular-nums}",
  ".dsb-popover{position:absolute;right:0;bottom:calc(100% + 8px);min-width:150px;",
  "background:rgba(20,23,29,0.98);border:1px solid rgba(255,255,255,0.14);",
  "border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,0.5);padding:8px;color:#e8eaee;",
  "font:400 12px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}",
  ".dsb-pop-title{opacity:.65;padding:2px 6px 6px;font-size:11px}",
  ".dsb-opt{display:block;width:100%;text-align:left;background:transparent;border:0;border-radius:6px;",
  "color:#e8eaee;padding:6px 8px;cursor:pointer;font-size:12px}",
  ".dsb-opt:hover{background:rgba(255,255,255,0.08)}",
  ".dsb-opt.active{background:rgba(76,154,255,0.18);color:#9ec3ff}",
  ".dsb-sep{height:1px;background:rgba(255,255,255,0.08);margin:6px 2px}",
  ".dsb-reset{display:block;width:100%;text-align:left;background:transparent;border:0;border-radius:6px;",
  "color:#f1b6ad;padding:6px 8px;cursor:pointer;font-size:12px}",
  ".dsb-reset:hover{background:rgba(255,255,255,0.08)}"
].join("");

function readStore() {
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (!raw) return {};
    var v = JSON.parse(raw);
    return (v && typeof v === "object") ? v : {};
  } catch (e) { return {}; }
}
function writeStore(patch) {
  try {
    var next = {};
    var cur = readStore();
    var keys = Object.keys(cur);
    for (var i = 0; i < keys.length; i++) next[keys[i]] = cur[keys[i]];
    var pk = Object.keys(patch);
    for (var j = 0; j < pk.length; j++) next[pk[j]] = patch[pk[j]];
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
  } catch (e) {}
}
function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }
function currencySymbol(code) {
  if (code === "CNY") return "¥";
  if (code === "USD") return "$";
  if (code === "EUR") return "€";
  if (code === "GBP") return "£";
  if (code === "JPY") return "¥";
  return code ? code + " " : "";
}

function createBalanceWidget() {
  var styleEl = null;
  var rootEl = null;
  var pillEl = null;
  var dotEl = null;
  var valueEl = null;
  var popoverEl = null;
  var backdropEl = null;

  var initial = readStore();
  var state = { status: "loading", data: null, error: "", at: 0 };
  var intervalMs = typeof initial.intervalMs === "number" ? initial.intervalMs : 15000;
  var pos = (initial.left != null && initial.top != null)
    ? { left: clamp(initial.left, 0, Math.max(0, window.innerWidth - 60)), top: clamp(initial.top, 0, Math.max(0, window.innerHeight - 60)) }
    : null;
  var open = false;
  var timer = null;
  var drag = null;

  function applyPos() {
    if (!rootEl) return;
    if (pos) {
      rootEl.style.left = pos.left + "px";
      rootEl.style.top = pos.top + "px";
      rootEl.style.right = "";
      rootEl.style.bottom = "";
    } else {
      rootEl.style.left = "";
      rootEl.style.top = "";
      rootEl.style.right = "16px";
      rootEl.style.bottom = "16px";
    }
  }

  function render() {
    var dotClass = "dsb-dot";
    var valueText = "加载中…";
    var title = "拖动移动 · 点击设置频率";
    if (state.status === "ok" && state.data) {
      dotClass = "dsb-dot ok";
      var d = state.data;
      valueText = currencySymbol(d.currency) + d.totalBalance;
      title = "DeepSeek 余额：" + d.currency + " 总 " + d.totalBalance +
        " / 赠送 " + d.grantedBalance + " / 充值 " + d.toppedUpBalance +
        (state.at ? "；更新于 " + new Date(state.at).toLocaleTimeString() : "") +
        "；拖动移动，点击设置频率";
    } else if (state.status === "error") {
      dotClass = "dsb-dot err";
      valueText = "不可用";
      title = state.error || "查询失败";
    }
    dotEl.className = dotClass;
    valueEl.textContent = valueText;
    pillEl.title = title;
    renderFreqButtons();
  }

  function renderFreqButtons() {
    if (!popoverEl) return;
    popoverEl.textContent = "";
    var titleEl = document.createElement("div");
    titleEl.className = "dsb-pop-title";
    titleEl.textContent = "刷新频率";
    popoverEl.append(titleEl);

    for (var i = 0; i < FREQ_OPTIONS.length; i++) {
      var opt = FREQ_OPTIONS[i];
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dsb-opt" + (opt.value === intervalMs ? " active" : "");
      btn.textContent = opt.label;
      (function (ms) {
        btn.addEventListener("click", function () { chooseInterval(ms); });
      })(opt.value);
      popoverEl.append(btn);
    }

    var sep = document.createElement("div");
    sep.className = "dsb-sep";
    popoverEl.append(sep);

    var reset = document.createElement("button");
    reset.type = "button";
    reset.className = "dsb-reset";
    reset.textContent = "重置位置";
    reset.addEventListener("click", resetPos);
    popoverEl.append(reset);
  }

  function load() {
    return fetch("/api/d-balance/balance")
      .then(function (r) {
        return r.text().then(function (t) {
          var j = {};
          try { j = JSON.parse(t); } catch (e) {}
          if (!r.ok) throw new Error(j && j.message ? j.message : ("HTTP " + r.status));
          state = { status: "ok", data: j, error: "", at: Date.now() };
        });
      })
      .catch(function (e) {
        state = { status: "error", data: null, error: String(e && e.message ? e.message : e), at: Date.now() };
      })
      .then(render);
  }

  function chooseInterval(ms) {
    intervalMs = ms;
    writeStore({ intervalMs: ms });
    setOpen(false);
    if (timer !== null) { clearInterval(timer); timer = setInterval(load, intervalMs); }
    load();
  }

  function resetPos() {
    pos = null;
    writeStore({ left: null, top: null });
    applyPos();
    setOpen(false);
  }

  function setOpen(next) {
    if (open === next) return;
    open = next;
    if (backdropEl) { backdropEl.remove(); backdropEl = null; }
    if (popoverEl) { popoverEl.remove(); popoverEl = null; }
    if (open) {
      backdropEl = document.createElement("div");
      backdropEl.className = "dsb-backdrop";
      backdropEl.addEventListener("click", function () { setOpen(false); });
      document.body.append(backdropEl);

      popoverEl = document.createElement("div");
      popoverEl.className = "dsb-popover";
      renderFreqButtons();
      rootEl.append(popoverEl);
    }
  }

  function onPointerDown(e) {
    if (e.button !== 0) return;
    var rect = pillEl.getBoundingClientRect();
    drag = {
      startX: e.clientX, startY: e.clientY,
      startLeft: rect.left, startTop: rect.top,
      moved: false
    };
    try { pillEl.setPointerCapture(e.pointerId); } catch (err) {}
  }

  function onPointerMove(e) {
    if (!drag) return;
    var dx = e.clientX - drag.startX;
    var dy = e.clientY - drag.startY;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    if (drag.moved) {
      pos = {
        left: clamp(drag.startLeft + dx, 0, Math.max(0, window.innerWidth - 60)),
        top: clamp(drag.startTop + dy, 0, Math.max(0, window.innerHeight - 60))
      };
      applyPos();
    }
  }

  function onPointerUp(e) {
    if (!drag) return;
    var d = drag;
    drag = null;
    if (d.moved) {
      pos = {
        left: clamp(d.startLeft + (e.clientX - d.startX), 0, Math.max(0, window.innerWidth - 60)),
        top: clamp(d.startTop + (e.clientY - d.startY), 0, Math.max(0, window.innerHeight - 60))
      };
      applyPos();
      writeStore({ left: pos.left, top: pos.top });
    } else {
      setOpen(!open);
    }
  }

  function mount() {
    styleEl = document.createElement("style");
    styleEl.textContent = WIDGET_CSS;
    document.head.append(styleEl);

    rootEl = document.createElement("div");
    rootEl.className = "dsb-root";
    applyPos();

    pillEl = document.createElement("div");
    pillEl.className = "dsb-widget";
    dotEl = document.createElement("span");
    dotEl.className = "dsb-dot";
    var labelEl = document.createElement("span");
    labelEl.className = "dsb-label";
    labelEl.textContent = "DeepSeek";
    valueEl = document.createElement("span");
    valueEl.className = "dsb-value";
    pillEl.append(dotEl, labelEl, valueEl);
    pillEl.addEventListener("pointerdown", onPointerDown);
    pillEl.addEventListener("pointermove", onPointerMove);
    pillEl.addEventListener("pointerup", onPointerUp);

    rootEl.append(pillEl);
    document.body.append(rootEl);

    render();
    load();
    timer = setInterval(load, intervalMs);
  }

  function dispose() {
    if (timer !== null) { clearInterval(timer); timer = null; }
    if (backdropEl) { backdropEl.remove(); backdropEl = null; }
    if (popoverEl) { popoverEl.remove(); popoverEl = null; }
    if (rootEl) { rootEl.remove(); rootEl = null; }
    if (styleEl) { styleEl.remove(); styleEl = null; }
  }

  return { mount: mount, dispose: dispose };
}

function apply(ctx) {
  var widget = createBalanceWidget();
  ctx.effect(function () {
    widget.mount();
    return function () { widget.dispose(); };
  }, "dsh-balance: balance widget");
}

exports.apply = apply;
exports.inject = [];
return module.exports;
} });
