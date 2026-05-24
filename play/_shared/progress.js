/*
 * Play · Inglizi.com — shared progress tracking
 * localStorage key: play:v1
 * Shape: { [gameId]: { [level]: { best:Number, plays:Number, lastScore:Number, lastAcc:Number, lastTotal:Number, lastAt:Number } } }
 */
;(function (window) {
  const KEY = 'play:v1'

  function read() {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? JSON.parse(raw) : {}
    } catch (e) { return {} }
  }
  function write(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)) } catch (e) {}
  }

  function record(gameId, level, score, total) {
    const data = read()
    const g = data[gameId] = data[gameId] || {}
    const lvl = g[level] = g[level] || { best: 0, plays: 0, lastScore: 0, lastAcc: 0, lastTotal: 0, lastAt: 0 }
    const acc = total > 0 ? Math.round((score / total) * 100) : 0
    lvl.plays = (lvl.plays || 0) + 1
    lvl.lastScore = score
    lvl.lastAcc = acc
    lvl.lastTotal = total
    lvl.lastAt = Date.now()
    if (score > (lvl.best || 0)) lvl.best = score
    write(data)
    return lvl
  }

  function getLevel(gameId, level) {
    const data = read()
    return (data[gameId] && data[gameId][level]) || { best: 0, plays: 0, lastScore: 0, lastAcc: 0, lastTotal: 0, lastAt: 0 }
  }

  function getGame(gameId) {
    const data = read()
    return data[gameId] || {}
  }

  function getSummary(gameId) {
    const g = getGame(gameId)
    let plays = 0, best = 0, lastAt = 0
    Object.keys(g).forEach(lv => {
      plays += g[lv].plays || 0
      if ((g[lv].best || 0) > best) best = g[lv].best
      if ((g[lv].lastAt || 0) > lastAt) lastAt = g[lv].lastAt
    })
    return { plays, best, lastAt, levels: g }
  }

  function reset(gameId) {
    const data = read()
    if (gameId) delete data[gameId]
    else { Object.keys(data).forEach(k => delete data[k]) }
    write(data)
  }

  // Inject a "Best · X" pill into a game's level bar
  function injectBestPill(targetEl, gameId, level) {
    const lv = getLevel(gameId, level)
    if (!targetEl) return
    let pill = targetEl.querySelector('[data-best-pill]')
    if (!pill) {
      pill = document.createElement('span')
      pill.setAttribute('data-best-pill', '')
      pill.style.cssText = 'margin-left:auto;display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;background:rgba(180,83,9,0.10);color:#b45309;font-family:Outfit,sans-serif;font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;border:1px solid rgba(180,83,9,0.22);'
      targetEl.appendChild(pill)
    }
    pill.innerHTML = `<span style="font-size:12px;">🏆</span> Best ${lv.best || 0} · ${lv.plays || 0} plays`
  }

  window.PlayProgress = { record, getLevel, getGame, getSummary, reset, injectBestPill }
})(window)
