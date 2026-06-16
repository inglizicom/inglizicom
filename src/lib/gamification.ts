import { supabase } from './supabase'
import { isDemo, demoCoins, demoRewards, demoChallenges, demoSubmit, demoLeaderboard, demoEarn } from './demo'

/* ── Types ─────────────────────────────────────────────── */
export interface CoinTx { action: string; amount: number; source: string; notes: string | null; at: string }
export interface CoinSummary {
  balance: number; level: string; level_min: number
  next_level: string | null; next_min: number | null; to_next: number; progress: number
  recent: CoinTx[]
}
export interface RewardStatus { id: string; level: string; min_coins: number; title: string | null; desc: string | null; unlocked: boolean; progress: number; claim_status: string | null }
export interface ChallengeItem { id: string; mode: 'arrange' | 'translate'; arabic: string; words?: string[] | null; choices?: string[] | null }
export interface SubmitResult { ok: boolean; correct: boolean; answer: string; coins: number }
export interface LeaderRow { rank: number; name: string; points: number; challenges: number; streak: number; me: boolean }
export interface LeaderboardData { top: LeaderRow[]; me: { rank: number; points: number } | null }

export type EarnAction = 'open_lesson' | 'complete_lesson' | 'complete_quiz' | 'complete_reading'

/* ── Student (token-gated) ─────────────────────────────── */
export async function earnCoins(token: string, action: EarnAction, lessonId?: string | null, moduleId?: string | null, courseId?: string | null): Promise<number> {
  if (isDemo()) return demoEarn(action === 'complete_quiz' ? 50 : action === 'complete_lesson' ? 25 : action === 'complete_reading' ? 15 : 10)
  const { data } = await supabase.rpc('student_earn', { p_token: token.trim().toUpperCase(), p_action: action, p_lesson: lessonId ?? null, p_module: moduleId ?? null, p_course: courseId ?? null })
  return Number(data ?? 0)
}
export async function fetchCoins(token: string, courseId?: string | null): Promise<CoinSummary | null> {
  if (isDemo()) return demoCoins()
  const { data } = await supabase.rpc('student_coins', { p_token: token.trim().toUpperCase(), p_course: courseId ?? null })
  return (data ?? null) as CoinSummary | null
}
export async function fetchRewardsStatus(token: string, courseId?: string | null): Promise<RewardStatus[]> {
  if (isDemo()) return demoRewards()
  const { data } = await supabase.rpc('student_rewards_status', { p_token: token.trim().toUpperCase(), p_course: courseId ?? null })
  return (data ?? []) as RewardStatus[]
}
export async function claimReward(token: string, rewardId: string, courseId?: string | null): Promise<{ ok: boolean; reason?: string }> {
  if (isDemo()) return { ok: true }
  const { data } = await supabase.rpc('student_claim_reward', { p_token: token.trim().toUpperCase(), p_reward_id: rewardId, p_course: courseId ?? null })
  return (data ?? { ok: false }) as { ok: boolean; reason?: string }
}
export async function fetchChallenges(token: string, type: 'sentence' | 'translation', mode: 'arrange' | 'translate', scope: 'lesson' | 'random', moduleId?: string | null, limit = 8): Promise<ChallengeItem[]> {
  if (isDemo()) return demoChallenges(mode, limit)
  const { data } = await supabase.rpc('student_challenges', { p_token: token.trim().toUpperCase(), p_type: type, p_mode: mode, p_scope: scope, p_module: moduleId ?? null, p_limit: limit })
  return (data ?? []) as ChallengeItem[]
}
export async function submitChallenge(token: string, type: 'sentence' | 'translation', id: string, mode: string, answer: string, courseId?: string | null): Promise<SubmitResult | null> {
  if (isDemo()) return demoSubmit(id, answer)
  const { data } = await supabase.rpc('student_submit_challenge', { p_token: token.trim().toUpperCase(), p_type: type, p_id: id, p_mode: mode, p_answer: answer, p_course: courseId ?? null })
  return (data ?? null) as SubmitResult | null
}
export async function streakBonus(token: string, courseId?: string | null): Promise<{ streak: number; awarded: number } | null> {
  if (isDemo()) return { streak: 3, awarded: 0 }
  const { data } = await supabase.rpc('student_streak_bonus', { p_token: token.trim().toUpperCase(), p_course: courseId ?? null })
  return (data ?? null) as { streak: number; awarded: number } | null
}
export interface VocabWord { id: string; en: string; ar: string; emoji: string | null }
export async function fetchVocab(token: string, limit = 12): Promise<VocabWord[]> {
  if (isDemo()) return [
    { id: 'd1', en: 'book', ar: 'كتاب', emoji: '📘' }, { id: 'd2', en: 'water', ar: 'ماء', emoji: '💧' },
    { id: 'd3', en: 'house', ar: 'منزل', emoji: '🏠' }, { id: 'd4', en: 'teacher', ar: 'معلم', emoji: '👩‍🏫' },
    { id: 'd5', en: 'apple', ar: 'تفاحة', emoji: '🍎' }, { id: 'd6', en: 'friend', ar: 'صديق', emoji: '🧑‍🤝‍🧑' },
  ]
  const { data } = await supabase.rpc('student_vocab', { p_token: token.trim().toUpperCase(), p_limit: limit })
  return (data ?? []) as VocabWord[]
}
export async function rewardVocab(token: string, wordIds: string[], courseId?: string | null): Promise<number> {
  if (isDemo()) return 0
  const { data } = await supabase.rpc('student_vocab_reward', { p_token: token.trim().toUpperCase(), p_word_ids: wordIds, p_course: courseId ?? null })
  return Number(data ?? 0)
}

export async function fetchLeaderboard(token: string, courseId?: string | null): Promise<LeaderboardData> {
  if (isDemo()) return demoLeaderboard()
  const { data } = await supabase.rpc('student_leaderboard_weekly', { p_token: token.trim().toUpperCase(), p_course: courseId ?? null })
  return (data ?? { top: [], me: null }) as LeaderboardData
}

/* ── CRM (staff, direct table access via RLS) ──────────── */
export interface Reward { id: string; level_name: string; min_coins: number; reward_title: string | null; reward_desc: string | null; sort_order: number; is_active: boolean }
export interface RewardClaimRow { id: string; student_id: string; reward_id: string; status: string; coins_at_claim: number; created_at: string; reviewed_at: string | null; student_name?: string; student_token?: string; level_name?: string; reward_title?: string }
export interface Challenge { id: string; level: string; module_id: string | null; arabic: string; english: string; choices?: any; is_active: boolean }

export async function fetchStudentCoinsCRM(studentId: string): Promise<{ balance: number; recent: CoinTx[]; challenges: number }> {
  const [{ data: txs }, { count }] = await Promise.all([
    supabase.from('coin_transactions').select('action_type, coins_amount, source, notes, created_at').eq('student_id', studentId).order('created_at', { ascending: false }).limit(50),
    supabase.from('student_challenge_attempts').select('id', { count: 'exact', head: true }).eq('student_id', studentId).eq('is_correct', true),
  ])
  const list = (txs ?? []) as any[]
  const balance = list.reduce((s, t) => s + (t.coins_amount || 0), 0)   // note: only last 50 for display; balance below is full
  const { data: sumRow } = await supabase.from('coin_transactions').select('coins_amount').eq('student_id', studentId)
  const total = ((sumRow ?? []) as any[]).reduce((s, t) => s + (t.coins_amount || 0), 0)
  void balance
  return { balance: total, challenges: count ?? 0, recent: list.map(t => ({ action: t.action_type, amount: t.coins_amount, source: t.source, notes: t.notes, at: t.created_at })) }
}
export async function adjustCoins(studentId: string, amount: number, reason: string, by?: string): Promise<void> {
  await supabase.from('coin_transactions').insert({ student_id: studentId, action_type: amount >= 0 ? 'admin_add' : 'admin_remove', coins_amount: amount, source: 'admin', notes: `${reason || ''}${by ? ` — ${by}` : ''}`.trim() || null })
}
export async function fetchClaims(status?: string): Promise<RewardClaimRow[]> {
  let q = supabase.from('reward_claims').select('*, crm_students(full_name, verification_token), rewards(level_name, reward_title)').order('created_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const { data } = await q
  return ((data ?? []) as any[]).map(r => ({
    id: r.id, student_id: r.student_id, reward_id: r.reward_id, status: r.status, coins_at_claim: r.coins_at_claim,
    created_at: r.created_at, reviewed_at: r.reviewed_at,
    student_name: r.crm_students?.full_name, student_token: r.crm_students?.verification_token,
    level_name: r.rewards?.level_name, reward_title: r.rewards?.reward_title,
  }))
}
export async function fetchStudentClaims(studentId: string): Promise<RewardClaimRow[]> {
  const { data } = await supabase.from('reward_claims').select('*, rewards(level_name, reward_title)').eq('student_id', studentId).order('created_at', { ascending: false })
  return ((data ?? []) as any[]).map(r => ({ id: r.id, student_id: r.student_id, reward_id: r.reward_id, status: r.status, coins_at_claim: r.coins_at_claim, created_at: r.created_at, reviewed_at: r.reviewed_at, level_name: r.rewards?.level_name, reward_title: r.rewards?.reward_title }))
}
export async function reviewClaim(id: string, status: 'approved' | 'rejected' | 'used', by?: string): Promise<void> {
  await supabase.from('reward_claims').update({ status, reviewed_by: by || null, reviewed_at: new Date().toISOString() }).eq('id', id)
}
export async function fetchRewardsCRM(): Promise<Reward[]> {
  const { data } = await supabase.from('rewards').select('*').order('sort_order')
  return (data ?? []) as Reward[]
}
export async function saveReward(r: Partial<Reward> & { id?: string }): Promise<void> {
  if (r.id) await supabase.from('rewards').update({ level_name: r.level_name, min_coins: r.min_coins, reward_title: r.reward_title, reward_desc: r.reward_desc, is_active: r.is_active }).eq('id', r.id)
  else await supabase.from('rewards').insert({ level_name: r.level_name, min_coins: r.min_coins ?? 0, reward_title: r.reward_title || null, reward_desc: r.reward_desc || null, sort_order: r.sort_order ?? 99 })
}
export async function fetchChallengesCRM(type: 'sentence' | 'translation'): Promise<Challenge[]> {
  const { data } = await supabase.from(type === 'sentence' ? 'sentence_challenges' : 'translation_challenges').select('*').order('created_at', { ascending: false })
  return (data ?? []) as Challenge[]
}
export async function createChallenge(type: 'sentence' | 'translation', input: { level: string; arabic: string; english: string }): Promise<void> {
  await supabase.from(type === 'sentence' ? 'sentence_challenges' : 'translation_challenges').insert({ level: input.level, arabic: input.arabic, english: input.english })
}
export async function deleteChallenge(type: 'sentence' | 'translation', id: string): Promise<void> {
  await supabase.from(type === 'sentence' ? 'sentence_challenges' : 'translation_challenges').delete().eq('id', id)
}
export async function fetchLeaderboardCRM(): Promise<{ student_id: string; week_points: number; challenges: number; name?: string }[]> {
  const { data } = await supabase.from('leaderboard_weekly').select('student_id, week_points, challenges').order('week_points', { ascending: false }).limit(50)
  const rows = (data ?? []) as any[]
  if (rows.length === 0) return []
  const { data: names } = await supabase.from('crm_students').select('id, full_name').in('id', rows.map(r => r.student_id))
  const nameMap = new Map((names ?? []).map((n: any) => [n.id, n.full_name]))
  return rows.map(r => ({ student_id: r.student_id, week_points: r.week_points, challenges: r.challenges, name: nameMap.get(r.student_id) }))
}
