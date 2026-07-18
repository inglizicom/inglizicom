/* =====================================================================
   Sentence Builder · Inglizi.com — vanilla JS
   Features: live sentence build, speech, counter, modal, zoom, fullscreen
   ===================================================================== */

(() => {
  'use strict'

  /* ─── Config ────────────────────────────────────────────────── */
  const WHATSAPP_NUMBER = '212764189311'
  const STORAGE_KEY     = 'inglizi.sentenceCount'
  const STORAGE_DATE    = 'inglizi.sentenceCountDate'
  const STORAGE_ZOOM    = 'inglizi.zoom'

  const ZOOM_MIN  = 0.6
  const ZOOM_MAX  = 1.8
  const ZOOM_STEP = 0.1

  /* ─── DOM lookups ────────────────────────────────────────────── */
  const $sentence       = document.getElementById('sentence')
  const $speakBtn       = document.getElementById('speak-btn')
  const $resetBtn       = document.getElementById('reset-btn')
  const $speakFeedback  = document.getElementById('speak-feedback')
  const $counterText    = document.getElementById('counter-text')

  const $subjects       = document.getElementById('subjects')
  const $intentions     = document.getElementById('intentions')
  const $times          = document.getElementById('times')
  const $linkers        = document.getElementById('linkers')
  const $endings        = document.getElementById('endings')
  const $colAction      = document.querySelector('.col-action')

  /* ─── State (read default subject from DOM, not hardcoded) ────── */
  function getDefaultSubject() {
    const preSelected = $subjects?.querySelector('.chip-subject.is-selected')
    if (preSelected) return preSelected.dataset.value
    const first = $subjects?.querySelector('.chip-subject')
    return first?.dataset.value || 'I'
  }

  const state = {
    subject:   getDefaultSubject(),
    intention: null,
    action:    null,
    time:      null,
    linker:    null,
    ending:    null,
  }

  const $modal          = document.getElementById('modal')
  const $modalBackdrop  = document.getElementById('modal-backdrop')
  const $modalClose     = document.getElementById('modal-close')
  const $ctaOpen        = document.getElementById('cta-open')
  const $leadForm       = document.getElementById('lead-form')

  const $zoomIn         = document.getElementById('zoom-in')
  const $zoomOut        = document.getElementById('zoom-out')
  const $zoomReset      = document.getElementById('zoom-reset')
  const $fullscreenBtn  = document.getElementById('fullscreen-btn')

  /* ─── Speech voices (cached) ─────────────────────────────────── */
  let voices = []
  function loadVoices() {
    voices = 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : []
  }
  if ('speechSynthesis' in window) {
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }

  /* ─── Sentence builder ───────────────────────────────────────── */
  function buildSentenceText() {
    const parts = []
    if (state.subject)   parts.push(state.subject)
    if (state.intention) parts.push(state.intention)
    if (state.action)    parts.push(state.action)
    if (state.time)      parts.push(state.time)
    if (state.linker)    parts.push(state.linker)
    if (state.ending)    parts.push(state.ending)
    return parts.join(' ')
  }

  function renderSentence() {
    $sentence.innerHTML = ''
    const hasAny = state.intention || state.action || state.time || state.linker || state.ending

    if (!hasAny) {
      $sentence.classList.remove('has-content')
      const empty = document.createElement('span')
      empty.className = 'sentence-empty'
      empty.dir = 'rtl'
      empty.textContent = '👇 اضغط على الكلمات لبناء الجملة'
      $sentence.appendChild(empty)
      return
    }
    $sentence.classList.add('has-content')

    appendToken(state.subject, 'subject')
    if (state.intention) appendToken(state.intention, 'verb')
    if (state.action)    appendToken(state.action, 'action')
    if (state.time)      appendToken(state.time, 'time')
    if (state.linker)    appendToken(state.linker, 'linker')
    if (state.ending)    appendToken(state.ending, 'ending')

    const dot = document.createElement('span')
    dot.className = 'token-glue'
    dot.textContent = '.'
    $sentence.appendChild(dot)
  }
  function appendToken(text, kind) {
    if (!text) return
    const el = document.createElement('span')
    el.className = `token token-${kind}`
    el.textContent = text
    $sentence.appendChild(el)
  }

  function updateUI() {
    renderSentence()
    const ready = !!(state.intention && state.action)
    $speakBtn.disabled = !ready
    const anySelected = state.intention || state.action || state.time
    $resetBtn.disabled = !anySelected
    if (!ready && $speakFeedback) $speakFeedback.hidden = true

    // Status checkmarks per column
    setStatus('subject',   true)
    setStatus('intention', !!state.intention)
    setStatus('action',    !!state.action)
    setStatus('time',      !!state.time)
    setStatus('linker',    !!state.linker)

    // Highlight the "next" column to guide the user
    document.querySelectorAll('.col').forEach(c => c.classList.remove('is-next'))
    const nextCol =
      !state.intention ? 'verb'   :
      !state.action    ? 'action' :
      !state.time      ? 'time'   :
      null
    if (nextCol) document.querySelector(`.col-${nextCol}`)?.classList.add('is-next')
  }

  function setStatus(key, done) {
    const el = document.getElementById('status-' + key)
    if (!el) return
    if (done) {
      el.textContent = '✓'
      el.classList.add('is-done')
    } else {
      el.textContent = ''
      el.classList.remove('is-done')
    }
  }

  /* ─── Chip handlers (event delegation) ────────────────────────── */
  function selectChip(container, stateKey, value, chipEl) {
    if (state[stateKey] === value) {
      chipEl.classList.remove('is-selected')
      state[stateKey] = null
    } else {
      container.querySelectorAll('.chip.is-selected').forEach(c => c.classList.remove('is-selected'))
      chipEl.classList.add('is-selected')
      state[stateKey] = value
    }
    updateUI()
    hideFeedback()
  }

  /* Subject is required — can be changed but not unselected */
  if ($subjects) {
    $subjects.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-subject')
      if (!chip || !$subjects.contains(chip)) return
      $subjects.querySelectorAll('.chip-subject').forEach(c => c.classList.remove('is-selected'))
      chip.classList.add('is-selected')
      state.subject = chip.dataset.value
      hideFeedback()
      updateUI()
    })
  }

  if ($intentions) {
    $intentions.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-verb')
      if (!chip || !$intentions.contains(chip)) return
      selectChip($intentions, 'intention', chip.dataset.value, chip)
    })
  }

  if ($times) {
    $times.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-time')
      if (!chip || !$times.contains(chip)) return
      selectChip($times, 'time', chip.dataset.value, chip)
    })
  }

  if ($linkers) {
    $linkers.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-linker')
      if (!chip || !$linkers.contains(chip)) return
      selectChip($linkers, 'linker', chip.dataset.value, chip)
    })
  }

  if ($endings) {
    $endings.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-ending')
      if (!chip || !$endings.contains(chip)) return
      selectChip($endings, 'ending', chip.dataset.value, chip)
    })
  }

  /* Action chips are spread across multiple <article class="cat"> blocks
     inside .col-action — listen on the whole column so every chip works */
  if ($colAction) {
    $colAction.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-action')
      if (!chip || !$colAction.contains(chip)) return
      selectChip($colAction, 'action', chip.dataset.value, chip)
    })
  }

  /* ─── Reset ─────────────────────────────────────────────────── */
  $resetBtn?.addEventListener('click', () => {
    // Reset all optional state
    state.intention = null
    state.action    = null
    state.time      = null
    state.linker    = null
    state.ending    = null
    // Reset subject to default
    state.subject   = getDefaultSubject()

    // Clear ALL selections, then re-mark default subject
    document.querySelectorAll('.chip.is-selected').forEach(c => c.classList.remove('is-selected'))
    const defaultSubjectChip = $subjects?.querySelector(`.chip-subject[data-value="${state.subject}"]`)
    defaultSubjectChip?.classList.add('is-selected')

    hideFeedback()
    updateUI()
  })

  /* ─── Speak ─────────────────────────────────────────────────── */
  $speakBtn?.addEventListener('click', () => {
    const text = buildSentenceText()
    if (!text || $speakBtn.disabled) return
    speak(text)
    showFeedback(text)
    incrementCounter()
  })

  function speak(text) {
    if (!('speechSynthesis' in window)) {
      alert('عذراً، المتصفح لا يدعم النطق التلقائي. حاول استخدام Chrome أو Safari.')
      return
    }
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang  = 'en-US'
    utterance.rate  = 0.85
    utterance.pitch = 1.0

    if (!voices.length) loadVoices()
    const englishVoice =
      voices.find(v => /en[-_]US/i.test(v.lang) && /Google|Samantha|Daniel/i.test(v.name)) ||
      voices.find(v => /en[-_]US/i.test(v.lang)) ||
      voices.find(v => /^en/i.test(v.lang))
    if (englishVoice) utterance.voice = englishVoice

    $speakBtn.classList.add('is-speaking')
    utterance.onend   = () => $speakBtn.classList.remove('is-speaking')
    utterance.onerror = () => $speakBtn.classList.remove('is-speaking')

    window.speechSynthesis.speak(utterance)
  }

  function showFeedback(text) {
    if (!$speakFeedback) return
    $speakFeedback.hidden = false
    $speakFeedback.innerHTML = `
      <span><strong>✅ Great!</strong> <span dir="rtl">الآن كرر الجملة 3 مرات بصوت عالٍ.</span></span>
      <button class="feedback-replay" type="button">↻ Play again</button>
    `
    $speakFeedback.querySelector('.feedback-replay')
      ?.addEventListener('click', () => speak(text))
  }
  function hideFeedback() {
    if ($speakFeedback) {
      $speakFeedback.hidden = true
      $speakFeedback.innerHTML = ''
    }
  }

  /* ─── Counter (localStorage, daily) ──────────────────────────── */
  function todayKey() { return new Date().toISOString().slice(0, 10) }
  function getCount() {
    if (localStorage.getItem(STORAGE_DATE) !== todayKey()) {
      localStorage.setItem(STORAGE_DATE, todayKey())
      localStorage.setItem(STORAGE_KEY, '0')
      return 0
    }
    return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
  }
  function incrementCounter() {
    const next = getCount() + 1
    localStorage.setItem(STORAGE_KEY, String(next))
    localStorage.setItem(STORAGE_DATE, todayKey())
    renderCounter(next)
  }
  function renderCounter(n = getCount()) {
    if (!$counterText) return
    if (n === 0)        { $counterText.textContent = 'Start your first sentence'; return }
    if (n === 1)        { $counterText.textContent = '🎉 1 sentence today'; return }
    if (n < 5)          { $counterText.textContent = `${n} sentences today — keep going!`; return }
    if (n < 10)         { $counterText.textContent = `🔥 ${n} sentences today`; return }
    $counterText.textContent = `🚀 ${n} sentences today — amazing!`
  }

  /* ─── Modal ─────────────────────────────────────────────────── */
  function openModal() {
    $modal.hidden = false
    document.body.style.overflow = 'hidden'
    setTimeout(() => $leadForm?.querySelector('input, textarea, select')?.focus(), 60)
  }
  function closeModal() {
    $modal.hidden = true
    document.body.style.overflow = ''
  }
  $ctaOpen?.addEventListener('click', openModal)
  $modalClose?.addEventListener('click', closeModal)
  $modalBackdrop?.addEventListener('click', closeModal)

  $leadForm?.addEventListener('submit', (e) => {
    e.preventDefault()
    const fd = new FormData($leadForm)
    const name  = (fd.get('name')  || '').toString().trim()
    const level = (fd.get('level') || '').toString().trim()
    const goal  = (fd.get('goal')  || '').toString().trim()
    const sentence = buildSentenceText()

    const lines = [
      'مرحباً أستاذ حمزة 👋',
      '',
      `الاسم: ${name}`,
      `المستوى: ${level || 'غير محدد'}`,
      `الهدف: ${goal}`,
    ]
    if (sentence && state.intention && state.action) {
      lines.push('', `جملتي اليوم: "${sentence}"`)
    }
    lines.push('', 'أود البدء في برنامج 30 يوماً للتحدث بالإنجليزية بثقة.')

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`
    window.open(url, '_blank', 'noopener')
    closeModal()
    $leadForm.reset()
  })

  /* ─── Zoom (CSS zoom + body font-size fallback) ──────────────── */

  /* CSS `zoom` reflows content so the page stays responsive — no horizontal
     scroll. Firefox supports it from v126+, all others have for years. */

  let zoom = parseFloat(localStorage.getItem(STORAGE_ZOOM) || '1') || 1
  zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom))

  function applyZoom() {
    // Try `zoom` first (best — reflows content)
    document.body.style.zoom = String(zoom)
    if ($zoomReset) $zoomReset.textContent = `${Math.round(zoom * 100)}%`
    if ($zoomIn)    $zoomIn.disabled  = zoom >= ZOOM_MAX - 0.001
    if ($zoomOut)   $zoomOut.disabled = zoom <= ZOOM_MIN + 0.001
    localStorage.setItem(STORAGE_ZOOM, String(zoom))
  }
  function setZoom(z) {
    zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, parseFloat(z.toFixed(2))))
    applyZoom()
  }

  $zoomIn?.addEventListener('click',    () => setZoom(zoom + ZOOM_STEP))
  $zoomOut?.addEventListener('click',   () => setZoom(zoom - ZOOM_STEP))
  $zoomReset?.addEventListener('click', () => setZoom(1))
  applyZoom()

  /* ─── Trackpad pinch + Ctrl/Cmd + wheel ──────────────────────── */

  /* Chrome / Firefox / Edge fire `wheel` with ctrlKey:true for both
     Ctrl+wheel AND trackpad pinch — same handler covers both. */
  window.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return
    e.preventDefault()
    // Pinch deltas are tiny (~1–5), mouse-wheel deltas are large (~100).
    // Clamp per-event so a single wheel notch can't jump 50%.
    const raw   = e.deltaY * -0.012
    const delta = Math.max(-0.18, Math.min(0.18, raw))
    setZoom(zoom + delta)
  }, { passive: false })

  /* Safari uses GestureEvent for trackpad pinch (older spec, still active). */
  let gestureStartZoom = 1
  window.addEventListener('gesturestart', (e) => {
    e.preventDefault()
    gestureStartZoom = zoom
  })
  window.addEventListener('gesturechange', (e) => {
    e.preventDefault()
    setZoom(gestureStartZoom * e.scale)
  })
  window.addEventListener('gestureend', (e) => {
    e.preventDefault()
  })

  /* ─── Fullscreen ─────────────────────────────────────────────── */
  function toggleFullscreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      const el = document.documentElement
      ;(el.requestFullscreen || el.webkitRequestFullscreen)?.call(el)
    } else {
      ;(document.exitFullscreen || document.webkitExitFullscreen)?.call(document)
    }
  }
  $fullscreenBtn?.addEventListener('click', toggleFullscreen)

  /* ─── Keyboard shortcuts ─────────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    const target = e.target
    const inField =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    if (inField) return

    if (!$modal.hidden && e.key === 'Escape') { closeModal(); return }

    if (e.key === ' ' && !$speakBtn.disabled) { e.preventDefault(); $speakBtn.click(); return }
    if (e.key === 'r' || e.key === 'R')       { if (!$resetBtn.disabled) $resetBtn.click(); return }
    if (e.key === 'f' || e.key === 'F')       { e.preventDefault(); toggleFullscreen(); return }
    if (e.key === '+' || e.key === '=')       { e.preventDefault(); setZoom(zoom + ZOOM_STEP); return }
    if (e.key === '-' || e.key === '_')       { e.preventDefault(); setZoom(zoom - ZOOM_STEP); return }
    if (e.key === '0')                        { e.preventDefault(); setZoom(1); return }
  })

  /* ─── Init ──────────────────────────────────────────────────── */
  renderSentence()
  renderCounter()
  updateUI()
})()
