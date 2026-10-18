/**
 * VIIZA interactive: two copies of a reader's progress made one, used by
 * the browser (this device and the account) and by the server route (two
 * devices saving at once). Nothing is ever lost: sections seen and stops
 * finished are united, and every score keeps the best.
 */

export interface Progress { seen: Record<string, string[]>; done: number[]; best: Record<string, number> }

export const EMPTY_PROGRESS: Progress = { seen: {}, done: [], best: {} }

const asProgress = (p: unknown): Progress => {
  const o = (p && typeof p === 'object' ? p : {}) as Partial<Progress>
  return {
    seen: o.seen && typeof o.seen === 'object' ? o.seen : {},
    done: Array.isArray(o.done) ? o.done.filter(n => typeof n === 'number') : [],
    best: o.best && typeof o.best === 'object' ? o.best : {},
  }
}

export function mergeProgress(a: unknown, b: unknown): Progress {
  const x = asProgress(a), y = asProgress(b)
  const seen: Record<string, string[]> = { ...x.seen }
  for (const [k, list] of Object.entries(y.seen)) seen[k] = [...new Set([...(seen[k] ?? []), ...(Array.isArray(list) ? list : [])])]
  const best: Record<string, number> = { ...x.best }
  for (const [k, v] of Object.entries(y.best)) if (typeof v === 'number' && v > (best[k] ?? -1)) best[k] = v
  return { seen, done: [...new Set([...x.done, ...y.done])].sort((m, n) => m - n), best }
}

export const sameProgress = (a: Progress, b: Progress) => JSON.stringify(a) === JSON.stringify(b)
