'use client'

/**
 * useGameState — shared React hook for XP · Streak · Progress · Unlock
 *
 * Drop it in any client component:
 *   const game = useGameState()
 *
 * It automatically:
 *   1. Generates/loads a persistent device_id
 *   2. Upserts a profiles row on first use
 *   3. Fetches all island progress
 *   4. Exposes helpers for recording answers and completing islands
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getDeviceId,
  getOrCreateProfile,
  fetchProgress,
  addXP,
  touchStreak,
  completeIsland,
  recordAttempt,
  computeIslandStatuses,
  XP_CORRECT_ANSWER,
  XP_LESSON_COMPLETE,
  XP_PERFECT_BONUS,
  type Profile,
  type IslandProgress,
  type IslandStatus,
} from './game'

export type { Profile, IslandProgress, IslandStatus }
export { XP_CORRECT_ANSWER, XP_LESSON_COMPLETE, XP_PERFECT_BONUS }

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGameState(orderedIslandIds: string[] = []) {
  const [userId,   setUserId]   = useState<string>('')
  const [profile,  setProfile]  = useState<Profile | null>(null)
  const [progress, setProgress] = useState<IslandProgress[]>([])
  const [loading,  setLoading]  = useState(true)

  // Derived: status map for every island
  const islandStatuses: Record<string, IslandStatus> =
    orderedIslandIds.length > 0
      ? computeIslandStatuses(orderedIslandIds, progress)
      : {}

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  const refresh = useCallback(async (uid?: string) => {
    const id = uid ?? userId
    if (!id || id === 'ssr-placeholder') return
    try {
      const [prof, prog] = await Promise.all([
        getOrCreateProfile(id),
        fetchProgress(id),
      ])
      setProfile(prof)
      setProgress(prog)
    } catch (err) {
      console.warn('[useGameState] refresh error:', err)
    }
  }, [userId])

  useEffect(() => {
    const id = getDeviceId()
    setUserId(id)
    setLoading(true)
    Promise.all([getOrCreateProfile(id), fetchProgress(id)])
      .then(([prof, prog]) => {
        setProfile(prof)
        setProgress(prog)
      })
      .catch(err => console.warn('[useGameState] init error:', err))
      .finally(() => setLoading(false))
  }, [])

  // ── On correct answer ──────────────────────────────────────────────────────
  const onCorrectAnswer = useCallback(async (
    lessonId: string,
    questionIndex: number,
  ) => {
    if (!userId) return
    try {
      const xp = await recordAttempt(userId, lessonId, questionIndex, true)
      if (xp > 0) {
        // Optimistic update — don't wait for a full refresh
        setProfile(prev => {
          if (!prev) return prev
          return { ...prev, xp: prev.xp + xp }
        })
      }
    } catch (err) {
      console.warn('[useGameState] onCorrectAnswer error:', err)
    }
  }, [userId])

  // ── On wrong answer (record only, no XP) ──────────────────────────────────
  const onWrongAnswer = useCallback(async (
    lessonId: string,
    questionIndex: number,
  ) => {
    if (!userId) return
    try {
      await recordAttempt(userId, lessonId, questionIndex, false)
    } catch { /* non-critical */ }
  }, [userId])

  // ── On island complete ─────────────────────────────────────────────────────
  const onIslandComplete = useCallback(async (
    islandId: string,
    scorePct: number,           // 0–100
  ): Promise<{ xpEarned: number; newProfile: Profile | null }> => {
    if (!userId) return { xpEarned: 0, newProfile: null }

    const base     = XP_LESSON_COMPLETE
    const bonus    = scorePct === 100 ? XP_PERFECT_BONUS : 0
    const xpEarned = base + bonus

    try {
      // Optimistic update streak + xp before async call completes
      setProfile(prev => {
        if (!prev) return prev
        return { ...prev, xp: prev.xp + xpEarned }
      })

      const { profile: updated } = await completeIsland(userId, islandId, scorePct)

      // Mark island complete in local progress state
      setProgress(prev => {
        const existing = prev.find(p => p.island_id === islandId)
        if (existing) {
          return prev.map(p =>
            p.island_id === islandId
              ? { ...p, completed: true, score: Math.max(p.score, scorePct) }
              : p
          )
        }
        return [...prev, {
          island_id: islandId,
          completed: true,
          score: scorePct,
          updated_at: new Date().toISOString(),
        }]
      })

      if (updated) {
        setProfile(updated)
        // Update streak display
        await touchStreak(userId)
        // Re-fetch final state
        await refresh(userId)
      }

      return { xpEarned, newProfile: updated }
    } catch (err) {
      console.warn('[useGameState] onIslandComplete error:', err)
      return { xpEarned, newProfile: null }
    }
  }, [userId, refresh])

  return {
    userId,
    profile,
    progress,
    islandStatuses,
    loading,
    refresh: () => refresh(),
    onCorrectAnswer,
    onWrongAnswer,
    onIslandComplete,
  }
}
