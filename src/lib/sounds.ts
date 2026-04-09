// ─── Web Audio API sound effects — no external files needed ──────────────────

function makeCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new (window.AudioContext || (window as any).webkitAudioContext)()
  } catch { return null }
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  vol = 0.22,
  delay = 0,
) {
  const c = makeCtx()
  if (!c) return
  const osc  = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(c.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime + delay)
  gain.gain.setValueAtTime(vol, c.currentTime + delay)
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + delay + duration)
  osc.start(c.currentTime + delay)
  osc.stop(c.currentTime + delay + duration + 0.05)
}

/** Short tap sound */
export function playClick() {
  tone(700, 0.07, 'sine', 0.12)
}

/** Three ascending tones — correct answer */
export function playCorrect() {
  tone(523, 0.13, 'sine', 0.2, 0)
  tone(659, 0.13, 'sine', 0.2, 0.13)
  tone(784, 0.22, 'sine', 0.2, 0.26)
}

/** Two descending tones — wrong answer */
export function playWrong() {
  tone(300, 0.14, 'sawtooth', 0.18, 0)
  tone(220, 0.22, 'sawtooth', 0.15, 0.15)
}

/** Four-note fanfare — lesson complete */
export function playReward() {
  const freqs = [523, 659, 784, 1047]
  freqs.forEach((f, i) => tone(f, 0.22, 'sine', 0.22, i * 0.13))
}
