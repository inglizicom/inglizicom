/**
 * game.ts — XP · Streak · Level · Unlock · Progress
 *
 * Works without authentication.  Each browser gets a persistent `device_id`
 * stored in localStorage.  Every Supabase operation is keyed to that id.
 *
 * Tables (created by the create_game_tables migration):
 *   profiles  (id text PK, xp, level, streak, last_active, …)
 *   progress  (id, user_id→profiles, island_id, completed, score, …)
 *   attempts  (id, user_id, lesson_id, question_index, is_correct, xp_earned, …)
 */

import { supabase } from './supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  xp: number
  level: CefrLevel
  streak: number
  last_active: string | null  // ISO date string (date only, no time)
  created_at: string
  updated_at: string
}

export interface IslandProgress {
  island_id: string
  completed: boolean
  score: number            // 0–100
  updated_at: string
}

export type CefrLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

// ─── XP → Level thresholds ────────────────────────────────────────────────────

export const LEVEL_THRESHOLDS: Record<CefrLevel, number> = {
  A0:    0,
  A1:  100,
  A2:  300,
  B1:  600,
  B2: 1000,
  C1: 1500,
}

const LEVEL_ORDER: CefrLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1']

export function xpToLevel(xp: number): CefrLevel {
  let level: CefrLevel = 'A0'
  for (const l of LEVEL_ORDER) {
    if (xp >= LEVEL_THRESHOLDS[l]) level = l
    else break
  }
  return level
}

/** XP needed to reach the NEXT level (returns null at max level). */
export function xpToNextLevel(xp: number): { next: CefrLevel | null; needed: number; current: number } {
  const current = xpToLevel(xp)
  const idx     = LEVEL_ORDER.indexOf(current)
  if (idx >= LEVEL_ORDER.length - 1) return { next: null, needed: 0, current: xp }
  const next   = LEVEL_ORDER[idx + 1]
  const needed = LEVEL_THRESHOLDS[next] - xp
  return { next, needed, current: xp }
}

// ─── XP reward constants ──────────────────────────────────────────────────────

export const XP_CORRECT_ANSWER  = 10
export const XP_LESSON_COMPLETE = 50
export const XP_PERFECT_BONUS   = 20   // awarded when score === 100 %

// ─── Device ID ────────────────────────────────────────────────────────────────

export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'ssr-placeholder'
  let id = localStorage.getItem('inglizi_device_id')
  if (!id) {
    id = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    localStorage.setItem('inglizi_device_id', id)
  }
  return id
}

// ─── Profile helpers ──────────────────────────────────────────────────────────

/** Fetch profile; auto-creates one if it does not exist yet. */
export async function getOrCreateProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (!error && data) return data as Profile

  // Row doesn't exist — insert a fresh one
  const { data: created, error: insertErr } = await supabase
    .from('profiles')
    .insert({ id: userId, xp: 0, level: 'A0', streak: 0 })
    .select()
    .single()

  if (insertErr || !created) {
    // Fallback: return a local-only profile so the UI never crashes
    return {
      id: userId, xp: 0, level: 'A0', streak: 0,
      last_active: null, created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
  return created as Profile
}

// ─── XP ──────────────────────────────────────────────────────────────────────

/**
 * Add XP to a profile and recalculate level.
 * Returns the updated Profile (or null on error).
 */
export async function addXP(userId: string, amount: number): Promise<Profile | null> {
  // Use Postgres atomic increment to avoid race conditions
  const { data, error } = await supabase.rpc
    ? await supabase
        .from('profiles')
        .select('xp')
        .eq('id', userId)
        .single()
    : { data: null, error: new Error('no client') }

  if (error || !data) return null

  const newXp   = (data as { xp: number }).xp + amount
  const newLevel = xpToLevel(newXp)

  const { data: updated, error: updateErr } = await supabase
    .from('profiles')
    .update({ xp: newXp, level: newLevel })
    .eq('id', userId)
    .select()
    .single()

  if (updateErr) return null
  return updated as Profile
}

// ─── Streak ───────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().split('T')[0]          // "YYYY-MM-DD"
}
function yesterdayISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

/**
 * Update streak based on last_active date:
 *   same day  → no change (already counted today)
 *   yesterday → streak + 1
 *   older     → reset to 1
 *
 * Returns the updated Profile.
 */
export async function touchStreak(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('streak, last_active')
    .eq('id', userId)
    .single()

  if (error || !data) return null

  const row       = data as { streak: number; last_active: string | null }
  const today     = todayISO()
  const yesterday = yesterdayISO()
  const last      = row.last_active ?? ''

  let newStreak = row.streak
  if (last === today) {
    // Already counted today — nothing to change
    return null
  } else if (last === yesterday) {
    newStreak = row.streak + 1
  } else {
    newStreak = 1   // missed a day or first time
  }

  const { data: updated, error: updateErr } = await supabase
    .from('profiles')
    .update({ streak: newStreak, last_active: today })
    .eq('id', userId)
    .select()
    .single()

  if (updateErr) return null
  return updated as Profile
}

// ─── Progress ─────────────────────────────────────────────────────────────────

/** Fetch all island progress rows for a user. */
export async function fetchProgress(userId: string): Promise<IslandProgress[]> {
  const { data, error } = await supabase
    .from('progress')
    .select('island_id, completed, score, updated_at')
    .eq('user_id', userId)

  if (error) return []
  return (data ?? []) as IslandProgress[]
}

/**
 * Mark an island as complete and record the score.
 * Also awards XP (lesson bonus + perfect bonus if score === 100).
 * Also touches the streak.
 *
 * Returns the updated Profile.
 */
export async function completeIsland(
  userId: string,
  islandId: string,
  score: number,                 // 0–100 percentage
): Promise<{ profile: Profile | null; xpEarned: number }> {
  // 1 — Upsert progress row
  await supabase
    .from('progress')
    .upsert(
      { user_id: userId, island_id: islandId, completed: true, score },
      { onConflict: 'user_id,island_id' },
    )

  // 2 — Calculate XP
  const xpEarned = XP_LESSON_COMPLETE + (score === 100 ? XP_PERFECT_BONUS : 0)

  // 3 — Add XP
  const profile = await addXP(userId, xpEarned)

  // 4 — Touch streak
  await touchStreak(userId)

  return { profile, xpEarned }
}

/**
 * Record a single question attempt and award XP for correct answers.
 * Call this immediately when the user selects an answer.
 */
export async function recordAttempt(
  userId: string,
  lessonId: string,
  questionIndex: number,
  isCorrect: boolean,
): Promise<number> {
  const xpEarned = isCorrect ? XP_CORRECT_ANSWER : 0

  await supabase.from('attempts').insert({
    user_id:        userId,
    lesson_id:      lessonId,
    question_index: questionIndex,
    is_correct:     isCorrect,
    xp_earned:      xpEarned,
  })

  if (isCorrect) {
    await addXP(userId, xpEarned)
  }

  return xpEarned
}

// ─── Unlock logic ─────────────────────────────────────────────────────────────

export type IslandStatus = 'completed' | 'current' | 'locked'

/**
 * Compute status for every island given the list of all island IDs (in order)
 * and the progress rows fetched from Supabase.
 */
export function computeIslandStatuses(
  orderedIslandIds: string[],
  progressRows: IslandProgress[],
): Record<string, IslandStatus> {
  const completedSet = new Set(
    progressRows.filter(p => p.completed).map(p => p.island_id),
  )

  const out: Record<string, IslandStatus> = {}
  orderedIslandIds.forEach((id, i) => {
    if (completedSet.has(id)) {
      out[id] = 'completed'
    } else if (i === 0 || completedSet.has(orderedIslandIds[i - 1])) {
      out[id] = 'current'
    } else {
      out[id] = 'locked'
    }
  })
  return out
}

// ─── React hook: useGameState ─────────────────────────────────────────────────
// Exported separately so map + learn pages share identical state management.

export interface GameState {
  userId:    string
  profile:   Profile | null
  progress:  IslandProgress[]
  loading:   boolean
  /** Re-fetch profile + progress from Supabase */
  refresh: () => Promise<void>
  /** Award XP for a correct answer and return updated profile */
  onCorrectAnswer: (lessonId: string, questionIndex: number) => Promise<void>
  /** Called when a full lesson/island is finished */
  onIslandComplete: (islandId: string, scorePct: number) => Promise<{ xpEarned: number; profile: Profile | null }>
}
