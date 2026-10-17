/**
 * The book's deterministic shuffle, on its own so the interactive app
 * (/viiza) can mix an exercise exactly as the printed page does without
 * importing the book's index (and with it every stop) into the browser.
 */

/** A small deterministic shuffle (the same print every time), never leaving an item in its place when it can. */
export function mixed<T>(items: T[], seed: number): T[] {
  const out = items.map((v, i) => ({ v, i }))
  let s = seed * 9301 + 49297
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  for (let tries = 0; tries < 20; tries++) {
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]] }
    if (out.length < 2 || out.every((x, k) => x.i !== k)) break
  }
  return out.map(x => x.v)
}

/** The seed of an exercise's shuffle: its stop and its place in the stop. */
export const seedOf = (stop: number, ex: number) => stop * 10 + ex + 1
