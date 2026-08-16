// DeepSeek 余额查询插件 —— Client 半（动态 Cordis Plugin 的 `code.client` 函数体）
//
// 职责：
//   1. 注册 shell.overlay 槽位，在右下角渲染一个常驻余额胶囊。
//   2. 通过 host.call('get-balance') 拉取余额，按设定频率（timer.interval）轮询。
//   3. 支持拖拽移动（指针事件 + setPointerCapture，4px 阈值区分点击/拖动）。
//   4. 单击弹出频率设置面板（5s/10s/15s/30s/1min/5min + 重置位置）。
//   5. 位置（left/top）与频率（intervalMs）持久化到 localStorage（key: dsbal-widget-v1）。

return {
  name: 'deepseek-balance-widget',
  apply(ctx) {
    const slots = ctx.get('slots')
    if (!slots) return

    styles.insert(
      '.dsb-root{position:fixed;z-index:2147483000;pointer-events:auto}' +
      '.dsb-backdrop{position:fixed;inset:0;z-index:2147482999}' +
      '.dsb-widget{display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;' +
      'background:rgba(16,18,23,0.95);border:1px solid rgba(255,255,255,0.14);' +
      'box-shadow:0 6px 20px rgba(0,0,0,0.45);color:#e8eaee;' +
      "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;" +
      'font-size:12px;line-height:1;cursor:grab;user-select:none;transition:background .15s;touch-action:none}' +
      '.dsb-widget:active{cursor:grabbing}' +
      '.dsb-widget:hover{background:rgba(26,29,36,0.98)}' +
      '.dsb-dot{width:8px;height:8px;border-radius:50%;background:#f0b429;flex:0 0 auto}' +
      '.dsb-dot.ok{background:#2fce6f}' +
      '.dsb-dot.err{background:#f15a50}' +
      '.dsb-label{opacity:.72}' +
      '.dsb-value{font-weight:600;font-variant-numeric:tabular-nums}' +
      '.dsb-popover{position:absolute;right:0;bottom:calc(100% + 8px);min-width:150px;' +
      'background:rgba(20,23,29,0.98);border:1px solid rgba(255,255,255,0.14);' +
      'border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,0.5);padding:8px;color:#e8eaee;' +
      "font:400 12px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}" +
      '.dsb-pop-title{opacity:.65;padding:2px 6px 6px;font-size:11px}' +
      '.dsb-opt{display:block;width:100%;text-align:left;background:transparent;border:0;border-radius:6px;' +
      'color:#e8eaee;padding:6px 8px;cursor:pointer;font-size:12px}' +
      '.dsb-opt:hover{background:rgba(255,255,255,0.08)}' +
      '.dsb-opt.active{background:rgba(76,154,255,0.18);color:#9ec3ff}' +
      '.dsb-sep{height:1px;background:rgba(255,255,255,0.08);margin:6px 2px}' +
      '.dsb-reset{display:block;width:100%;text-align:left;background:transparent;border:0;border-radius:6px;' +
      'color:#f1b6ad;padding:6px 8px;cursor:pointer;font-size:12px}' +
      '.dsb-reset:hover{background:rgba(255,255,255,0.08)}'
    )

    const STORE_KEY = 'dsbal-widget-v1'
    const FREQ_OPTIONS = [
      { label: '5 秒', value: 5000 },
      { label: '10 秒', value: 10000 },
      { label: '15 秒', value: 15000 },
      { label: '30 秒', value: 30000 },
      { label: '1 分钟', value: 60000 },
      { label: '5 分钟', value: 300000 }
    ]

    function clamp(v, min, max) { return Math.min(Math.max(v, min), max) }

    function readStore() {
      try {
        const raw = localStorage.getItem(STORE_KEY)
        if (!raw) return {}
        const v = JSON.parse(raw)
        return (v && typeof v === 'object') ? v : {}
      } catch (e) { return {} }
    }
    function writeStore(patch) {
      try {
        const next = Object.assign({}, readStore(), patch)
        localStorage.setItem(STORE_KEY, JSON.stringify(next))
      } catch (e) {}
    }

    function currencySymbol(code) {
      if (code === 'CNY') return '¥'
      if (code === 'USD') return '$'
      if (code === 'EUR') return '€'
      if (code === 'GBP') return '£'
      if (code === 'JPY') return '¥'
      return code ? code + ' ' : ''
    }

    function BalanceWidget() {
      const initial = readStore()
      const [state, setState] = React.useState({ status: 'loading', data: null, error: '', at: 0 })
      const [intervalMs, setIntervalMs] = React.useState(typeof initial.intervalMs === 'number' ? initial.intervalMs : 15000)
      const [pos, setPos] = React.useState(initial.left != null && initial.top != null
        ? { left: clamp(initial.left, 0, Math.max(0, window.innerWidth - 60)), top: clamp(initial.top, 0, Math.max(0, window.innerHeight - 60)) }
        : null)
      const [open, setOpen] = React.useState(false)
      const dragRef = React.useRef(null)

      const load = async () => {
        try {
          const res = await host.call('get-balance', {})
          setState({ status: 'ok', data: res, error: '', at: Date.now() })
        } catch (e) {
          setState({ status: 'error', data: null, error: String(e && e.message ? e.message : e), at: Date.now() })
        }
      }

      React.useEffect(() => {
        load()
        const timer = ctx.get('timer')
        const stop = timer ? timer.interval(load, intervalMs) : null
        return () => { if (stop) stop() }
      }, [intervalMs])

      const onPointerDown = (e) => {
        if (e.button !== 0) return
        const rect = e.currentTarget.getBoundingClientRect()
        dragRef.current = {
          startX: e.clientX, startY: e.clientY,
          startLeft: rect.left, startTop: rect.top,
          moved: false
        }
        try { e.currentTarget.setPointerCapture(e.pointerId) } catch (err) {}
      }
      const onPointerMove = (e) => {
        const d = dragRef.current
        if (!d) return
        const dx = e.clientX - d.startX
        const dy = e.clientY - d.startY
        if (!d.moved && Math.abs(dx) + Math.abs(dy) > 4) d.moved = true
        if (d.moved) {
          setPos({ left: clamp(d.startLeft + dx, 0, Math.max(0, window.innerWidth - 60)), top: clamp(d.startTop + dy, 0, Math.max(0, window.innerHeight - 60)) })
        }
      }
      const onPointerUp = (e) => {
        const d = dragRef.current
        dragRef.current = null
        if (!d) return
        if (d.moved) {
          const left = clamp(d.startLeft + (e.clientX - d.startX), 0, Math.max(0, window.innerWidth - 60))
          const top = clamp(d.startTop + (e.clientY - d.startY), 0, Math.max(0, window.innerHeight - 60))
          setPos({ left: left, top: top })
          writeStore({ left: left, top: top })
        } else {
          setOpen(o => !o)
        }
      }

      const chooseInterval = (ms) => {
        setIntervalMs(ms)
        writeStore({ intervalMs: ms })
        setOpen(false)
        load()
      }
      const resetPos = () => {
        setPos(null)
        writeStore({ left: null, top: null })
        setOpen(false)
      }

      let dotClass = 'dsb-dot'
      let valueText = '加载中…'
      let title = '拖动移动 · 点击设置频率'
      if (state.status === 'ok' && state.data) {
        dotClass = 'dsb-dot ok'
        const d = state.data
        valueText = currencySymbol(d.currency) + d.totalBalance
        title = 'DeepSeek 余额：' + d.currency + ' 总 ' + d.totalBalance +
          ' / 赠送 ' + d.grantedBalance + ' / 充值 ' + d.toppedUpBalance +
          (state.at ? '；更新于 ' + new Date(state.at).toLocaleTimeString() : '') +
          '；拖动移动，点击设置频率'
      } else if (state.status === 'error') {
        dotClass = 'dsb-dot err'
        valueText = '不可用'
        title = state.error || '查询失败'
      }

      const posStyle = pos ? { left: pos.left + 'px', top: pos.top + 'px' } : { right: '16px', bottom: '16px' }

      const freqButtons = FREQ_OPTIONS.map((o) =>
        React.createElement('button', {
          key: o.value,
          className: 'dsb-opt' + (o.value === intervalMs ? ' active' : ''),
          onClick: () => chooseInterval(o.value)
        }, o.label)
      )

      return React.createElement(React.Fragment, null,
        open ? React.createElement('div', { className: 'dsb-backdrop', onClick: () => setOpen(false) }) : null,
        React.createElement('div', { className: 'dsb-root', style: posStyle },
          React.createElement('div', {
            className: 'dsb-widget',
            title: title,
            onPointerDown: onPointerDown,
            onPointerMove: onPointerMove,
            onPointerUp: onPointerUp
          },
            React.createElement('span', { className: dotClass }),
            React.createElement('span', { className: 'dsb-label' }, 'DeepSeek'),
            React.createElement('span', { className: 'dsb-value' }, valueText)
          ),
          open ? React.createElement('div', { className: 'dsb-popover' },
            React.createElement('div', { className: 'dsb-pop-title' }, '刷新频率'),
            freqButtons,
            React.createElement('div', { className: 'dsb-sep' }),
            React.createElement('button', { className: 'dsb-reset', onClick: resetPos }, '重置位置')
          ) : null
        )
      )
    }

    slots.inject('shell.overlay', () => slots.register(
      { name: 'shell.overlay', id: 'deepseek-balance-widget', label: 'DeepSeek 余额' },
      () => React.createElement(BalanceWidget)
    ))
  }
}
