/*
 * Inglizi Play — game shell runtime
 *
 * Two jobs, both about fitting a real screen:
 *
 * 1. Toggle <body class="in-game"> so game-shell.css locks the page to
 *    one screen while playing, and lets the setup screen scroll normally.
 *    It watches the game area instead of asking every game to call it,
 *    so a game only has to use the shared markup.
 *
 * 2. Size any [data-fit="<ratio>"] element to the largest box of that
 *    aspect ratio that fits its parent. CSS alone cannot do this
 *    reliably in a flex column whose height is itself derived.
 */
;(function (window, document) {
  'use strict'

  /* ── 1 · in-game body class ───────────────────────────────────── */
  function syncBodyClass() {
    const area = document.getElementById('gameArea')
    const live = !!(area && area.classList.contains('is-shown'))
    document.body.classList.toggle('in-game', live)
    if (live) fitAll()
  }

  /* ── 2 · aspect fitting ───────────────────────────────────────── */
  function fitOne(el) {
    /* A 4:3 stage is right on a laptop and wrong on a tall phone, so a
       surface may declare a second ratio for narrow screens. */
    const narrow = window.innerWidth < 1024
    const raw = (narrow && el.dataset.fitNarrow) ? el.dataset.fitNarrow : el.dataset.fit
    const ratio = parseFloat(raw)
    if (!ratio || !isFinite(ratio)) return
    const box = el.parentElement
    if (!box) return

    /* Measure the parent WITHOUT this child's contribution, or the box
       can only ever grow: zero the child first, then read. */
    const prevW = el.style.width, prevH = el.style.height
    el.style.width = '0px'; el.style.height = '0px'
    const cs = getComputedStyle(box)
    const availW = box.clientWidth  - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
    const availH = box.clientHeight - parseFloat(cs.paddingTop)  - parseFloat(cs.paddingBottom)
    el.style.width = prevW; el.style.height = prevH

    if (availW <= 0 || availH <= 0) return
    let w = availW, h = w / ratio
    if (h > availH) { h = availH; w = h * ratio }
    el.style.width  = Math.max(0, Math.floor(w)) + 'px'
    el.style.height = Math.max(0, Math.floor(h)) + 'px'
  }

  function fitAll() {
    document.querySelectorAll('[data-fit]').forEach(fitOne)
    /* Games that draw on top of a fitted box (the car, the trail) need
       to reposition once the new size is in place. */
    if (typeof window.onShellResize === 'function') {
      try { window.onShellResize() } catch (e) {}
    }
  }

  /* ── wiring ───────────────────────────────────────────────────── */
  function boot() {
    syncBodyClass()

    const area = document.getElementById('gameArea')
    if (area && window.MutationObserver) {
      new MutationObserver(syncBodyClass)
        .observe(area, { attributes: true, attributeFilter: ['class'] })
    }

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => fitAll())
      document.querySelectorAll('[data-fit]').forEach(el => {
        if (el.parentElement) ro.observe(el.parentElement)
      })
    }

    let t = 0
    const onResize = () => { clearTimeout(t); t = setTimeout(fitAll, 60) }
    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('orientationchange', onResize, { passive: true })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
  else boot()

  window.PlayShell = { fit: fitAll }
})(window, document)
