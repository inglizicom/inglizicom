/*
 * Play · Inglizi.com — shared sound effects
 * Web Audio API — no external files. Lazy-initialized on first use
 * (browsers require a user interaction before audio can start).
 *
 * Usage:
 *   PlaySounds.correct()  // chord up
 *   PlaySounds.wrong()    // buzz down
 *   PlaySounds.tick()     // timer blip
 *   PlaySounds.win()      // fanfare
 *   PlaySounds.lose()     // descending notes
 *   PlaySounds.click()    // UI click
 *   PlaySounds.setMuted(true)  // global mute toggle
 *
 * Mute state is persisted to localStorage (key: play:muted).
 */
;(function (window) {
  let ctx = null
  let muted = false
  try { muted = localStorage.getItem('play:muted') === '1' } catch (e) {}

  function ensure() {
    if (muted) return null
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return null
      try { ctx = new AC() } catch (e) { return null }
    }
    // Resume if suspended (common after page focus loss)
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    return ctx
  }

  function tone(freq, duration, type, vol, delay) {
    type = type || 'sine'
    vol = vol == null ? 0.10 : vol
    delay = delay || 0
    const c = ensure()
    if (!c) return
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, c.currentTime + delay)
    g.gain.setValueAtTime(0, c.currentTime + delay)
    g.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + delay + duration)
    osc.connect(g).connect(c.destination)
    osc.start(c.currentTime + delay)
    osc.stop(c.currentTime + delay + duration + 0.02)
  }

  // Noise burst — used for "wrong" buzz
  function noise(duration, vol, delay) {
    vol = vol == null ? 0.06 : vol
    delay = delay || 0
    const c = ensure()
    if (!c) return
    const buf = c.createBuffer(1, c.sampleRate * duration, c.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.4
    const src = c.createBufferSource()
    src.buffer = buf
    const filter = c.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 400
    const g = c.createGain()
    g.gain.setValueAtTime(0, c.currentTime + delay)
    g.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + delay + duration)
    src.connect(filter).connect(g).connect(c.destination)
    src.start(c.currentTime + delay)
    src.stop(c.currentTime + delay + duration + 0.02)
  }

  const Sounds = {
    correct() {
      // bright two-tone chord up
      tone(523.25, 0.10, 'sine', 0.12)         // C5
      tone(659.25, 0.16, 'sine', 0.10, 0.08)   // E5
      tone(783.99, 0.22, 'triangle', 0.09, 0.16) // G5
    },
    wrong() {
      // descending buzz + sub-bass thud
      tone(220, 0.18, 'sawtooth', 0.08)
      tone(165, 0.28, 'sawtooth', 0.08, 0.10)
      noise(0.22, 0.05, 0.05)
    },
    tick() {
      tone(880, 0.04, 'square', 0.05)
    },
    tickLow() {
      tone(440, 0.06, 'square', 0.07)
    },
    win() {
      // 4-note ascending fanfare
      tone(523.25, 0.12, 'sine', 0.12)         // C
      tone(659.25, 0.12, 'sine', 0.12, 0.13)   // E
      tone(783.99, 0.12, 'sine', 0.13, 0.26)   // G
      tone(1046.50, 0.36, 'sine', 0.16, 0.39)  // C high
      tone(1318.51, 0.36, 'triangle', 0.10, 0.39) // E high (harmony)
    },
    lose() {
      // slow descending
      tone(440, 0.18, 'triangle', 0.10)
      tone(370, 0.18, 'triangle', 0.10, 0.18)
      tone(294, 0.42, 'triangle', 0.10, 0.36)
    },
    click() {
      tone(1200, 0.03, 'square', 0.04)
    },
    type() {
      tone(1500 + Math.random() * 300, 0.02, 'square', 0.03)
    },
    place() {
      // tile placed — short ping
      tone(660, 0.05, 'sine', 0.08)
      tone(990, 0.08, 'sine', 0.06, 0.04)
    },
    turn() {
      // turn-change notice
      tone(440, 0.06, 'triangle', 0.08)
      tone(587.33, 0.10, 'triangle', 0.08, 0.06)
    },

    isMuted() { return muted },
    setMuted(m) {
      muted = !!m
      try { localStorage.setItem('play:muted', muted ? '1' : '0') } catch (e) {}
      if (muted && ctx) { try { ctx.suspend() } catch (e) {} }
      if (!muted && ctx) { try { ctx.resume() } catch (e) {} }
    },
    toggleMute() { this.setMuted(!muted); return muted },
  }

  // Inject a mute toggle button into the page topbar (top-right area)
  // Call PlaySounds.injectMuteButton(targetElement) from a game page.
  Sounds.injectMuteButton = function (target) {
    if (!target) return
    const b = document.createElement('button')
    b.type = 'button'
    b.setAttribute('aria-label', 'Toggle sound')
    b.title = 'Toggle sound (M)'
    b.style.cssText = 'background:transparent;border:1px solid #44403c;color:#a8a29e;width:38px;height:38px;border-radius:8px;cursor:pointer;font-size:18px;display:inline-flex;align-items:center;justify-content:center;transition:all .18s ease;margin-left:6px;'
    function paint() { b.textContent = muted ? '🔇' : '🔊'; b.style.color = muted ? '#78716c' : '#fbbf24'; b.style.borderColor = muted ? '#44403c' : 'rgba(251,191,36,.4)' }
    paint()
    b.addEventListener('click', () => { Sounds.toggleMute(); paint() })
    document.addEventListener('keydown', e => { if (e.key === 'm' || e.key === 'M') { if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return; Sounds.toggleMute(); paint() } })
    target.appendChild(b)
  }

  window.PlaySounds = Sounds
})(window)
