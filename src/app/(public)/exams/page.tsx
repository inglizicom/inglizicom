'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GraduationCap, Trophy, Star, Lock, ChevronLeft, Sparkles, Crown, Flame, BookOpen, Target } from 'lucide-react'

// ─── Types & Storage ────────────────────────────────────────────────────────

interface ExamResult {
  unitId: string
  score: number
  total: number
  date: number
}

const A0_KEY = 'inglizi-a0-exams'
const A1_KEY = 'inglizi-a1-exams'

function loadResults(key: string): Record<string, ExamResult> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return {} }
}

// ─── Exam Level Config ──────────────────────────────────────────────────────

interface ExamLevel {
  id: string
  href: string
  title: string
  titleEn: string
  description: string
  icon: string
  unitCount: number
  totalQuestions: number
  storageKey: string
  gradient: string
  gradientBg: string
  border: string
  textColor: string
  accentColor: string
  badgeBg: string
  badgeText: string
  shadow: string
}

const LEVELS: ExamLevel[] = [
  {
    id: 'a0',
    href: '/a0',
    title: 'امتحان المستوى A0',
    titleEn: 'A0 Level Exam',
    description: 'التحيات، الحروف، الأرقام، الدول، المهن، العائلة، القراءة، الأفعال، المنزل، الأنشطة اليومية، الطعام، النقل والأماكن',
    icon: '🌱',
    unitCount: 8,
    totalQuestions: 120,
    storageKey: A0_KEY,
    gradient: 'from-amber-500/20 via-orange-500/15 to-red-500/10',
    gradientBg: 'from-amber-900/30 to-orange-900/20',
    border: 'border-amber-500/20',
    textColor: 'text-amber-300',
    accentColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-300',
    shadow: 'shadow-amber-500/5',
  },
  {
    id: 'a1',
    href: '/a1',
    title: 'امتحان المستوى A1',
    titleEn: 'A1 Level Exam',
    description: 'الروتين اليومي، المطبخ، المطعم، السوبرماركت، الصيدلية، المخبزة، الملابس، المغسلة، العيادة، المدرسة، السوق، السفر، الفندق، البنك',
    icon: '🚀',
    unitCount: 8,
    totalQuestions: 120,
    storageKey: A1_KEY,
    gradient: 'from-emerald-500/20 via-teal-500/15 to-cyan-500/10',
    gradientBg: 'from-emerald-900/30 to-teal-900/20',
    border: 'border-emerald-500/20',
    textColor: 'text-emerald-300',
    accentColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-300',
    shadow: 'shadow-emerald-500/5',
  },
]

// ─── Components ─────────────────────────────────────────────────────────────

function LevelCard({ level, results }: { level: ExamLevel; results: Record<string, ExamResult> }) {
  const unitsPassed = Object.values(results).filter(r => r.unitId !== 'final' && r.score / r.total >= 0.6).length
  const finalResult = results['final']
  const finalPassed = finalResult && finalResult.score / finalResult.total >= 0.6
  const bestScore = finalResult ? Math.round((finalResult.score / finalResult.total) * 100) : null
  const progress = Math.round((unitsPassed / level.unitCount) * 100)

  return (
    <Link
      href={level.href}
      className={`group block rounded-2xl border ${level.border} bg-gradient-to-br ${level.gradientBg} p-5 sm:p-6 no-underline transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${level.shadow} active:scale-[0.98]`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4" dir="rtl">
        <div className="flex items-center gap-3">
          <div className="text-4xl sm:text-5xl">{level.icon}</div>
          <div>
            <h2 className={`font-black text-lg sm:text-xl ${level.textColor}`}>{level.title}</h2>
            <p className="text-white/30 text-xs font-bold tracking-wider uppercase">{level.titleEn}</p>
          </div>
        </div>
        <ChevronLeft className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-colors mt-2" />
      </div>

      {/* Description */}
      <p className="text-white/50 text-sm leading-relaxed mb-4" dir="rtl">{level.description}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4" dir="rtl">
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-2.5 text-center">
          <BookOpen className="w-4 h-4 text-white/30 mx-auto mb-1" />
          <span className="text-white font-black text-sm block">{level.unitCount}</span>
          <span className="text-white/30 text-[10px] font-bold">وحدات</span>
        </div>
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-2.5 text-center">
          <Target className="w-4 h-4 text-white/30 mx-auto mb-1" />
          <span className="text-white font-black text-sm block">{level.totalQuestions}+</span>
          <span className="text-white/30 text-[10px] font-bold">سؤال</span>
        </div>
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-2.5 text-center">
          <Trophy className="w-4 h-4 text-white/30 mx-auto mb-1" />
          <span className="text-white font-black text-sm block">{bestScore !== null ? `${bestScore}%` : '—'}</span>
          <span className="text-white/30 text-[10px] font-bold">النهائي</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5" dir="rtl">
          <span className="text-white/40 text-xs font-bold">التقدم</span>
          <span className={`text-xs font-black ${level.textColor}`}>{unitsPassed}/{level.unitCount} وحدات</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${level.gradient} transition-all duration-700`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between" dir="rtl">
        {finalPassed ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/15 border border-green-500/25">
            <Star className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-300 text-xs font-bold">مكتمل</span>
          </div>
        ) : unitsPassed > 0 ? (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${level.badgeBg} border ${level.border}`}>
            <Flame className="w-3.5 h-3.5" />
            <span className={`${level.badgeText} text-xs font-bold`}>جاري التقدم</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
            <GraduationCap className="w-3.5 h-3.5 text-white/30" />
            <span className="text-white/40 text-xs font-bold">ابدأ الآن</span>
          </div>
        )}
        <span className={`text-xs font-bold ${level.textColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
          ادخل ←
        </span>
      </div>
    </Link>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ExamsPage() {
  const [a0Results, setA0Results] = useState<Record<string, ExamResult>>({})
  const [a1Results, setA1Results] = useState<Record<string, ExamResult>>({})

  useEffect(() => {
    setA0Results(loadResults(A0_KEY))
    setA1Results(loadResults(A1_KEY))
  }, [])

  const resultsMap: Record<string, Record<string, ExamResult>> = {
    a0: a0Results,
    a1: a1Results,
  }

  // Overall stats
  const totalUnitsPassed = [a0Results, a1Results].reduce((sum, r) =>
    sum + Object.values(r).filter(x => x.unitId !== 'final' && x.score / x.total >= 0.6).length, 0)
  const totalFinalsPassed = [a0Results, a1Results].reduce((sum, r) => {
    const f = r['final']
    return sum + (f && f.score / f.total >= 0.6 ? 1 : 0)
  }, 0)

  return (
    <div className="min-h-[100dvh] relative" style={{ background: 'linear-gradient(160deg,#0a0e1a 0%,#111827 40%,#0d1117 100%)' }}>
      <div className="h-[70px]" />

      {/* Background pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.015]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <style jsx global>{`
        @keyframes fadeInUp { 0%{transform:translateY(12px);opacity:0} 100%{transform:translateY(0);opacity:1} }
      `}</style>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-12 pt-6">
        {/* Header */}
        <div className="text-center mb-8" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 mb-4">
            <GraduationCap className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-white font-black text-2xl sm:text-3xl mb-2" dir="rtl">
            الامتحانات
          </h1>
          <p className="text-white/40 text-sm" dir="rtl">
            اختبر مستواك في كل مرحلة مع تيتشر حمزة
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8" dir="rtl" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
            <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <span className="text-white font-black text-xl block">{totalUnitsPassed}</span>
            <span className="text-white/30 text-[11px] font-bold">وحدات ناجحة</span>
          </div>
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
            <Crown className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <span className="text-white font-black text-xl block">{totalFinalsPassed}/2</span>
            <span className="text-white/30 text-[11px] font-bold">امتحان نهائي</span>
          </div>
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
            <Sparkles className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <span className="text-white font-black text-xl block">2</span>
            <span className="text-white/30 text-[11px] font-bold">مستويات</span>
          </div>
        </div>

        {/* Level Cards */}
        <div className="flex flex-col gap-4" style={{ animation: 'fadeInUp 0.7s ease-out' }}>
          {LEVELS.map(level => (
            <LevelCard key={level.id} level={level} results={resultsMap[level.id]} />
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
          <Lock className="w-6 h-6 text-white/15 mx-auto mb-2" />
          <h3 className="text-white/30 font-black text-sm mb-1" dir="rtl">المستوى A2 — قريباً</h3>
          <p className="text-white/15 text-xs" dir="rtl">أكمل المستوى A1 أولاً لفتح المستوى التالي</p>
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-2xl bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/15 p-5 text-center" style={{ animation: 'fadeInUp 0.9s ease-out' }}>
          <Sparkles className="w-5 h-5 text-blue-400 mx-auto mb-2" />
          <h3 className="text-white font-black text-sm mb-1" dir="rtl">تعلّم المزيد مع تيتشر حمزة</h3>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Link href="/courses" className="inline-flex items-center gap-1.5 bg-white text-blue-900 font-extrabold px-4 py-2 rounded-xl text-xs transition-all hover:-translate-y-0.5 active:scale-95 no-underline">
              <Crown className="w-3.5 h-3.5" /> الدورات
            </Link>
            <Link href="/play" className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all active:scale-95 no-underline">
              <Flame className="w-3.5 h-3.5" /> العب وتعلم
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
