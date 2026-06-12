/* Local DEMO mode — preview the portal (incl. rewards & practice) WITHOUT a
   token and WITHOUT any backend. Activated by `?demo=1` (persisted in session).
   All data below is in-memory mock; nothing touches Supabase. */

import type { StudentSpace } from './student-portal'
import type { CoinSummary, RewardStatus, ChallengeItem, SubmitResult, LeaderboardData } from './gamification'

export function isDemo(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if (new URLSearchParams(window.location.search).get('demo') === '1') { sessionStorage.setItem('inglizi.demo', '1'); return true }
    return sessionStorage.getItem('inglizi.demo') === '1'
  } catch { return false }
}

/* mutable balance so the demo feels alive */
let balance = 1240

const norm = (t: string) => t.trim().toLowerCase().replace(/[.!?,;:]+$/, '').replace(/\s+/g, ' ')

const SENTENCES: { id: string; arabic: string; english: string }[] = [
  { id: 'd1', arabic: 'أنا من المغرب.', english: 'I am from Morocco' },
  { id: 'd2', arabic: 'ما اسمك؟', english: 'What is your name' },
  { id: 'd3', arabic: 'هي معلمة.', english: 'She is a teacher' },
  { id: 'd4', arabic: 'الكتاب فوق الطاولة.', english: 'The book is on the table' },
  { id: 'd5', arabic: 'أحب القهوة.', english: 'I like coffee' },
  { id: 'd6', arabic: 'أين تسكن؟', english: 'Where do you live' },
  { id: 'd7', arabic: 'أخي طبيب.', english: 'My brother is a doctor' },
  { id: 'd8', arabic: 'أستيقظ في السابعة.', english: 'I wake up at seven' },
]
const shuffle = <T,>(a: T[]) => a.map(v => [Math.random(), v] as const).sort((x, y) => x[0] - y[0]).map(p => p[1])

export function demoChallenges(mode: 'arrange' | 'translate', limit = 8): ChallengeItem[] {
  return shuffle(SENTENCES).slice(0, limit).map(s => ({
    id: s.id, mode, arabic: s.arabic,
    words: mode === 'arrange' ? shuffle(s.english.split(' ')) : null, choices: null,
  }))
}
export function demoSubmit(id: string, answer: string): SubmitResult {
  const s = SENTENCES.find(x => x.id === id)
  const correct = !!s && norm(answer) === norm(s.english)
  if (correct) balance += 30
  return { ok: true, correct, answer: s?.english ?? '', coins: correct ? 30 : 0 }
}
export function demoEarn(amount = 25): number { balance += amount; return amount }

export function demoCoins(): CoinSummary {
  const lvl = balance >= 15000 ? ['Master', 15000, null, null] : balance >= 7000 ? ['Platinum', 7000, 'Master', 15000]
    : balance >= 3000 ? ['Gold', 3000, 'Platinum', 7000] : balance >= 1000 ? ['Silver', 1000, 'Gold', 3000] : ['Bronze', 0, 'Silver', 1000]
  const min = lvl[1] as number, nextMin = lvl[3] as number | null
  return {
    balance, level: lvl[0] as string, level_min: min,
    next_level: lvl[2] as string | null, next_min: nextMin,
    to_next: nextMin ? nextMin - balance : 0,
    progress: nextMin ? Math.round((balance - min) / (nextMin - min) * 100) : 100,
    recent: [
      { action: 'challenge_sentence', amount: 30, source: 'challenge', notes: null, at: new Date().toISOString() },
      { action: 'complete_quiz', amount: 50, source: 'system', notes: null, at: new Date(Date.now() - 3600e3).toISOString() },
      { action: 'complete_lesson', amount: 25, source: 'system', notes: null, at: new Date(Date.now() - 7200e3).toISOString() },
      { action: 'streak_7', amount: 150, source: 'streak', notes: null, at: new Date(Date.now() - 86400e3).toISOString() },
    ],
  }
}
export function demoRewards(): RewardStatus[] {
  const levels: [string, number, string, string][] = [
    ['Silver', 1000, 'PDF مجاني', 'كتاب أو ملف PDF تعليمي مجاني'],
    ['Gold', 3000, 'خصم 10%', 'خصم 10% على الدورة القادمة'],
    ['Platinum', 7000, 'حصة Communication', 'حصة محادثة مجانية'],
    ['Master', 15000, 'خصم 20% + شهادة Premium', 'خصم 20% وشهادة Premium'],
  ]
  return levels.map(([level, min, title, desc], i) => ({
    id: 'r' + i, level, min_coins: min, title, desc,
    unlocked: balance >= min, progress: Math.min(100, Math.round(balance / min * 100)),
    claim_status: i === 0 ? null : null,
  }))
}
export function demoLeaderboard(): LeaderboardData {
  return {
    top: [
      { rank: 1, name: 'سارة', points: 980, challenges: 12, streak: 9, me: false },
      { rank: 2, name: 'أنت (تجريبي)', points: 760, challenges: 8, streak: 3, me: true },
      { rank: 3, name: 'يوسف', points: 540, challenges: 6, streak: 4, me: false },
      { rank: 4, name: 'لينا', points: 320, challenges: 3, streak: 2, me: false },
    ],
    me: { rank: 2, points: 760 },
  }
}

export const DEMO_SPACE: StudentSpace = {
  found: true,
  student: {
    id: 'demo', full_name: 'طالب تجريبي', course: 'الدورة التأسيسية', student_type: 'student',
    teacher_name: 'حمزة القصراوي', is_active: true, verification_token: 'DEMO',
    current_level: 'A1', next_level: 'A2', learning_stage: null,
    admin_message: 'هذا عرض تجريبي محلي للوحة الطالب.', next_task: null, today_lesson_url: null, today_lesson_title: null,
  },
  courses: [{
    id: 'c1', title: 'الدورة التأسيسية A0 - A1', level: 'A0', description: 'عرض تجريبي', modules: [
      { id: 'm1', title: 'الوحدة 1 — التحيات', order: 1, lessons: [
        { id: 'l1', title: 'التحيات', type: 'video', order: 1, video_url: 'https://youtu.be/dQw4w9WgXcQ', file_url: null, exercise_url: null, has_quiz: true, is_locked: false, content: null, status: 'completed' },
        { id: 'l2', title: 'الأرقام والعمر', type: 'video', order: 2, video_url: 'https://youtu.be/dQw4w9WgXcQ', file_url: null, exercise_url: null, has_quiz: true, is_locked: false, content: null, status: 'opened' },
      ] },
      { id: 'm2', title: 'الوحدة 2 — العائلة', order: 2, lessons: [
        { id: 'l3', title: 'مفردات العائلة', type: 'video', order: 1, video_url: null, file_url: null, exercise_url: null, has_quiz: false, is_locked: false, content: null, status: 'not_started' },
      ] },
    ],
  }],
  exercises: [], files: [], exams: [], recent_activity: [],
  stats: { lessons_total: 3, lessons_done: 1, ex_total: 0, ex_done: 0, exam_total: 0, exam_done: 0, files_total: 0, files_opened: 0, overall: 33, streak: 3, last_activity: new Date().toISOString() },
}
