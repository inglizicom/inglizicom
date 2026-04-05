import type { Level } from './sentences'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProgress {
  xp: number
  unlockedLevel: Level          // highest level unlocked
  streak: number
  lastSessionDate: string | null // ISO date 'YYYY-MM-DD'
  usedSentenceIds: Record<Level, string[]>
  totalSessions: number
  totalCorrect: number
}

// ─── XP Thresholds ───────────────────────────────────────────────────────────

export const XP_THRESHOLDS: Record<string, number> = {
  A1: 0,
  A2: 250,
  B1: 600,
}

export const LEVEL_ORDER: Level[] = ['A1', 'A2', 'B1']

// ─── Defaults ────────────────────────────────────────────────────────────────

function defaultProgress(): UserProgress {
  return {
    xp: 0,
    unlockedLevel: 'A1',
    streak: 0,
    lastSessionDate: null,
    usedSentenceIds: { A1: [], A2: [], B1: [] },
    totalSessions: 0,
    totalCorrect: 0,
  }
}

const STORAGE_KEY = 'inglizi_v2_progress'

// ─── Read / Write ─────────────────────────────────────────────────────────────

export function getProgress(): UserProgress {
  if (typeof window === 'undefined') return defaultProgress()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()
    const parsed = JSON.parse(raw) as Partial<UserProgress>
    // Merge with defaults to handle schema evolution
    return { ...defaultProgress(), ...parsed }
  } catch {
    return defaultProgress()
  }
}

export function saveProgress(p: UserProgress): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    // Ignore storage errors (private mode, quota exceeded)
  }
}

// ─── Streak ──────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Returns updated progress with streak correctly incremented.
 * - Same day as last session → no change
 * - Consecutive day → streak + 1
 * - Gap of 2+ days → reset to 1
 */
export function updateStreak(p: UserProgress): UserProgress {
  const today = todayISO()
  const last = p.lastSessionDate

  if (last === today) return p                    // already played today

  if (!last) {
    return { ...p, streak: 1, lastSessionDate: today }
  }

  const lastDate  = new Date(last)
  const todayDate = new Date(today)
  const diffDays  = Math.round(
    (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (diffDays === 1) return { ...p, streak: p.streak + 1, lastSessionDate: today }
  return { ...p, streak: 1, lastSessionDate: today }  // streak broken
}

// ─── Level unlock ─────────────────────────────────────────────────────────────

/** Returns the highest level the user should have unlocked based on XP */
export function getLevelForXP(xp: number): Level {
  if (xp >= XP_THRESHOLDS['B1']) return 'B1'
  if (xp >= XP_THRESHOLDS['A2']) return 'A2'
  return 'A1'
}

/** XP needed to unlock the next level, or null if already at max */
export function nextLevelInfo(xp: number): { label: Level; xpNeeded: number; xpRequired: number } | null {
  if (xp < XP_THRESHOLDS['A2']) {
    return { label: 'A2', xpNeeded: XP_THRESHOLDS['A2'] - xp, xpRequired: XP_THRESHOLDS['A2'] }
  }
  if (xp < XP_THRESHOLDS['B1']) {
    return { label: 'B1', xpNeeded: XP_THRESHOLDS['B1'] - xp, xpRequired: XP_THRESHOLDS['B1'] }
  }
  return null // Max level
}

/** Progress percentage toward the next level (0–100) */
export function levelProgress(xp: number): number {
  if (xp >= XP_THRESHOLDS['B1']) return 100

  const from = xp >= XP_THRESHOLDS['A2'] ? XP_THRESHOLDS['A2'] : 0
  const to   = xp >= XP_THRESHOLDS['A2'] ? XP_THRESHOLDS['B1'] : XP_THRESHOLDS['A2']

  return Math.min(100, Math.round(((xp - from) / (to - from)) * 100))
}

// ─── Session helpers ──────────────────────────────────────────────────────────

/** Mark a set of sentence IDs as used for a level (keeps the list bounded) */
export function markSentencesUsed(
  p: UserProgress,
  level: Level,
  ids: string[],
): UserProgress {
  const existing = p.usedSentenceIds[level] ?? []
  const combined = Array.from(new Set(existing.concat(ids)))
  // Keep only the last 60 used IDs to prevent unbounded growth
  const trimmed = combined.slice(-60)
  return {
    ...p,
    usedSentenceIds: { ...p.usedSentenceIds, [level]: trimmed },
  }
}

/** Apply XP gain and unlock levels automatically */
export function applyXP(p: UserProgress, xpToAdd: number): UserProgress {
  const newXP = p.xp + xpToAdd
  const newLevel = getLevelForXP(newXP)
  return {
    ...p,
    xp: newXP,
    unlockedLevel: newLevel,
  }
}
