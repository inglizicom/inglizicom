'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

type IslandStatus = 'completed' | 'current' | 'locked'

interface Island {
  id: string
  city: string
  city_ar: string
  topic: string
  topic_ar: string
  cefr: string
  emoji: string
  color: string
  xp: number
  lessonId: string
  desc_ar: string
}

// ─── Island Data — Moroccan journey A0 → B1 ───────────────────────────────────

const ISLANDS: Island[] = [
  {
    id: '1', city: 'Oued Zem', city_ar: 'واد زم',
    topic: 'Greetings', topic_ar: 'التحيات',
    cefr: 'A0', emoji: '👋', color: '#10b981', xp: 50, lessonId: 'greetings',
    desc_ar: 'ابدأ رحلتك! تعلم كيف تقول مرحباً وتقدّم نفسك بالإنجليزية',
  },
  {
    id: '2', city: 'Khouribga', city_ar: 'خريبكة',
    topic: 'Coffee Shop', topic_ar: 'في المقهى',
    cefr: 'A1', emoji: '☕', color: '#f59e0b', xp: 75, lessonId: 'coffee',
    desc_ar: 'تعلم كيف تطلب مشروبك وتتحدث بشكل طبيعي في المقهى',
  },
  {
    id: '3', city: 'Beni Mellal', city_ar: 'بني ملال',
    topic: 'At the Store', topic_ar: 'في المتجر',
    cefr: 'A1', emoji: '🛍️', color: '#f43f5e', xp: 100, lessonId: 'shopping',
    desc_ar: 'اشتري وتفاوض وتحدث عن الأسعار والمقاسات بثقة',
  },
  {
    id: '4', city: 'Settat', city_ar: 'سطات',
    topic: 'Morning Routine', topic_ar: 'الروتين الصباحي',
    cefr: 'A1', emoji: '🌅', color: '#f97316', xp: 120, lessonId: 'greetings',
    desc_ar: 'صف يومك وتحدث عن الأنشطة اليومية والروتين الصباحي',
  },
  {
    id: '5', city: 'Casablanca', city_ar: 'الدار البيضاء',
    topic: 'In the City', topic_ar: 'في المدينة',
    cefr: 'A2', emoji: '🌆', color: '#0ea5e9', xp: 150, lessonId: 'shopping',
    desc_ar: 'تنقل واسأل عن الطريق وتحدث عن الأماكن في المدينة الكبيرة',
  },
  {
    id: '6', city: 'Rabat', city_ar: 'الرباط',
    topic: 'At Work', topic_ar: 'في العمل',
    cefr: 'A2', emoji: '💼', color: '#6366f1', xp: 175, lessonId: 'coffee',
    desc_ar: 'احترف التواصل في بيئة العمل وتحدث مع الزملاء باحترافية',
  },
  {
    id: '7', city: 'Marrakech', city_ar: 'مراكش',
    topic: 'Travel', topic_ar: 'السفر والسياحة',
    cefr: 'B1', emoji: '✈️', color: '#14b8a6', xp: 200, lessonId: 'greetings',
    desc_ar: 'سافر وتحدث في المطار والفندق واستمتع بتجربة سياحية كاملة',
  },
  {
    id: '8', city: 'Agadir', city_ar: 'أكادير',
    topic: 'Advanced Conversations', topic_ar: 'محادثات متقدمة',
    cefr: 'B1', emoji: '🏆', color: '#d97706', xp: 250, lessonId: 'shopping',
    desc_ar: 'تحدث بطلاقة عن مواضيع متنوعة وأصبح محترفاً حقيقياً',
  },
]

// ─── CEFR Level Zones ─────────────────────────────────────────────────────────

const CEFR_ZONES = [
  { label: 'A0', color: '#10b981', emoji: '🌱', desc: 'مبتدئ تماماً', islandIds: ['1'] },
  { label: 'A1', color: '#f59e0b', emoji: '🌿', desc: 'مبتدئ',         islandIds: ['2', '3', '4'] },
  { label: 'A2', color: '#0ea5e9', emoji: '⭐', desc: 'أساسي',          islandIds: ['5', '6'] },
  { label: 'B1', color: '#8b5cf6', emoji: '🚀', desc: 'متوسط',          islandIds: ['7', '8'] },
]

// ─── localStorage ─────────────────────────────────────────────────────────────

function loadProgress(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem('inglizi_map_progress') ?? '{}') } catch { return {} }
}
function saveProgress(p: Record<string, boolean>) {
  localStorage.setItem('inglizi_map_progress', JSON.stringify(p))
}
function computeStatuses(progress: Record<string, boolean>): Record<string, IslandStatus> {
  const out: Record<string, IslandStatus> = {}
  ISLANDS.forEach((island, i) => {
    if (progress[island.id])                                          out[island.id] = 'completed'
    else if (i === 0 || progress[ISLANDS[i - 1].id])                  out[island.id] = 'current'
    else                                                               out[island.id] = 'locked'
  })
  return out
}
function loadXp(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem('inglizi_total_xp') ?? '0', 10)
}
function loadStreak(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem('inglizi_streak') ?? '0', 10)
}

// ─── Island Card ──────────────────────────────────────────────────────────────

function IslandCard({
  island, status, onClick,
}: {
  island: Island; status: IslandStatus; onClick: () => void
}) {
  const isCompleted = status === 'completed'
  const isCurrent   = status === 'current'
  const isLocked    = status === 'locked'

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className="w-full text-left rounded-2xl p-4 transition-all duration-200 active:scale-[0.97]"
      style={{
        background: isLocked     ? 'rgba(255,255,255,0.02)'
                  : isCompleted  ? `${island.color}10`
                  :                'rgba(255,255,255,0.04)',
        border: `1.5px solid ${
          isLocked    ? 'rgba(255,255,255,0.07)'
          : isCompleted ? `${island.color}45`
          :               `${island.color}65`
        }`,
        boxShadow: isCurrent ? `0 4px 24px ${island.color}22` : 'none',
        opacity: isLocked ? 0.55 : 1,
      }}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className="w-13 h-13 w-[52px] h-[52px] rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{
            background: isLocked ? 'rgba(255,255,255,0.04)' : `${island.color}18`,
            border: `1px solid ${isLocked ? 'rgba(255,255,255,0.07)' : island.color + '30'}`,
          }}
        >
          {isLocked ? '🔒' : island.emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0" dir="rtl">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-xs font-black px-2 py-0.5 rounded-full"
              style={{
                background: isLocked ? 'rgba(255,255,255,0.05)' : `${island.color}18`,
                color: isLocked ? 'rgba(255,255,255,0.25)' : island.color,
                border: `1px solid ${isLocked ? 'rgba(255,255,255,0.07)' : island.color + '30'}`,
              }}
            >
              {island.cefr}
            </span>
            {isCompleted && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400 font-bold">
                ✅ مكتمل
              </span>
            )}
            {isCurrent && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-300 font-bold">
                ▶ جاري
              </span>
            )}
          </div>
          <p
            className="font-black text-base leading-tight"
            style={{ color: isLocked ? 'rgba(255,255,255,0.25)' : '#fff' }}
          >
            {island.city_ar}
          </p>
          <p
            className="text-sm mt-0.5"
            style={{ color: isLocked ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.45)' }}
          >
            {island.topic_ar}
          </p>
          <p
            className="text-xs mt-1.5 font-bold"
            style={{ color: isLocked ? 'rgba(255,255,255,0.1)' : `${island.color}cc` }}
          >
            ⚡ +{island.xp} XP
          </p>
        </div>

        {/* Arrow */}
        <div
          className="text-xl shrink-0"
          style={{ color: isLocked ? 'rgba(255,255,255,0.1)' : isCompleted ? `${island.color}` : `${island.color}80` }}
        >
          {isLocked ? '🔒' : isCompleted ? '🌟' : '←'}
        </div>
      </div>
    </button>
  )
}

// ─── Island Detail Modal (bottom sheet) ───────────────────────────────────────

function IslandModal({
  island, status, onClose, onStart, onComplete,
}: {
  island: Island
  status: IslandStatus
  onClose: () => void
  onStart: () => void
  onComplete: () => void
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }, [])

  function close() {
    setVisible(false)
    setTimeout(onClose, 280)
  }

  const isLocked    = status === 'locked'
  const isCompleted = status === 'completed'
  const isCurrent   = status === 'current'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 transition-opacity duration-280"
        style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)', opacity: visible ? 1 : 0 }}
        onClick={close}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out"
        style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
      >
        <div
          className="mx-auto max-w-lg rounded-t-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg,#0d1829 0%,#111927 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderBottom: 'none',
          }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/15" />
          </div>

          <div className="px-6 pb-10 pt-3 flex flex-col gap-5">
            {/* Hero row */}
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0"
                style={{
                  background: isLocked ? '#1e2535' : `${island.color}18`,
                  border: `2px solid ${isLocked ? '#ffffff12' : island.color + '50'}`,
                  boxShadow: isLocked ? 'none' : `0 0 36px ${island.color}25`,
                }}
              >
                {isLocked ? '🔒' : island.emoji}
              </div>
              <div dir="rtl" className="flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className="text-xs font-black px-2.5 py-1 rounded-full"
                    style={{ background: `${island.color}20`, color: island.color, border: `1px solid ${island.color}40` }}
                  >
                    {island.cefr}
                  </span>
                  {isCompleted && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">✅ مكتمل</span>}
                  {isCurrent   && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15  border border-blue-500/30  text-blue-300  font-bold">🔵 متاح</span>}
                  {isLocked    && <span className="text-xs px-2 py-0.5 rounded-full bg-white/5       border border-white/10      text-white/25  font-bold">🔒 مقفل</span>}
                </div>
                <h2 className="text-white font-black text-2xl leading-tight">{island.city_ar}</h2>
                <p className="text-white/35 text-sm mt-0.5">{island.city} · {island.topic}</p>
              </div>
            </div>

            {/* Description */}
            <div
              className="p-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-white/55 text-sm leading-relaxed" dir="rtl">
                {isLocked
                  ? '🔒 أكمل المرحلة السابقة أولاً لتفتح هذه المرحلة!'
                  : island.desc_ar}
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              {[
                { icon: '⚡', val: `+${island.xp}`, label: 'XP' },
                { icon: '🏙️', val: island.city_ar,  label: 'المدينة' },
                { icon: '📊', val: island.cefr,      label: 'المستوى' },
              ].map((s, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 py-3.5 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-white font-black text-sm">{s.val}</span>
                  <span className="text-white/25 text-xs" dir="rtl">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            {isLocked ? (
              <button
                onClick={close}
                className="w-full py-4 rounded-2xl font-black text-base text-white/30 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                🔒 أكمل المرحلة السابقة أولاً
              </button>
            ) : isCurrent ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={onStart}
                  className="w-full py-4 rounded-2xl font-black text-lg text-white shadow-lg transition-all active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${island.color}, ${island.color}bb)`,
                    boxShadow: `0 8px 28px ${island.color}45`,
                  }}
                >
                  ابدأ الدرس 🚀
                </button>
                <button
                  onClick={onComplete}
                  className="w-full py-3 rounded-2xl font-bold text-sm text-white/40 transition-all active:scale-[0.98]"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  ✅ سجّل كمكتمل
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={onStart}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm text-white/60 transition-all active:scale-[0.98]"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
                >
                  🔄 مراجعة
                </button>
                <button
                  onClick={close}
                  className="flex-1 py-4 rounded-2xl font-black text-base text-white shadow-lg transition-all active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 8px 28px #f59e0b40' }}
                >
                  ⭐ مكتمل!
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MapPage() {
  const router = useRouter()

  const [progress,  setProgress]  = useState<Record<string, boolean>>({})
  const [statuses,  setStatuses]  = useState<Record<string, IslandStatus>>({})
  const [totalXp,   setTotalXp]   = useState(0)
  const [streak,    setStreak]    = useState(0)
  const [selected,  setSelected]  = useState<Island | null>(null)

  useEffect(() => {
    const prog = loadProgress()
    setProgress(prog)
    setStatuses(computeStatuses(prog))
    setTotalXp(loadXp())
    setStreak(loadStreak())
  }, [])

  const completedCount = ISLANDS.filter(s => statuses[s.id] === 'completed').length
  const progressPct    = Math.round((completedCount / ISLANDS.length) * 100)

  function handleComplete(island: Island) {
    const newProg = { ...progress, [island.id]: true }
    setProgress(newProg)
    setStatuses(computeStatuses(newProg))
    saveProgress(newProg)
    const newXp = totalXp + island.xp
    setTotalXp(newXp)
    localStorage.setItem('inglizi_total_xp', String(newXp))
    setSelected(null)
  }

  function handleStart(island: Island) {
    router.push(`/learn?id=${island.lessonId}`)
  }

  const zones = CEFR_ZONES.map(z => ({
    ...z,
    islands: ISLANDS.filter(is => z.islandIds.includes(is.id)),
  }))

  return (
    <>
      <style>{`
        @keyframes islandFloat {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-5px); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1);   opacity: 0.6; }
          70%  { transform: scale(1.5); opacity: 0;   }
          100% { transform: scale(1.5); opacity: 0;   }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1;   }
        }
        .island-float { animation: islandFloat 3s ease-in-out infinite; }
        .pulse-ring   { animation: pulseRing 2.2s ease-out infinite; }
        .node-shimmer { animation: shimmer 2s ease-in-out infinite; }
      `}</style>

      <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#060d1a 0%,#0a1120 50%,#070e1c 100%)' }}>

        {/* ── Fixed Header ──────────────────────────────────────────────── */}
        <div
          className="fixed top-0 left-0 right-0 z-40"
          style={{ background: 'rgba(6,13,26,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="max-w-lg mx-auto px-4 pt-14 pb-4">

            {/* Top row */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white/40 text-sm font-bold transition-all active:scale-95 hover:text-white/70"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                ← رجوع
              </button>

              <div className="text-center">
                <p className="text-white font-black text-base" dir="rtl">🗺️ خريطة الرحلة</p>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span>🔥</span>
                  <span className="text-orange-400 font-black text-sm">{streak}</span>
                </div>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span>⚡</span>
                  <span className="text-yellow-400 font-black text-sm">{totalXp}</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progressPct}%`,
                    background: 'linear-gradient(90deg,#10b981,#f59e0b)',
                    boxShadow: '0 0 10px rgba(245,158,11,0.45)',
                  }}
                />
              </div>
              <span className="text-white/35 text-xs font-mono shrink-0">{completedCount}/{ISLANDS.length}</span>
            </div>
          </div>
        </div>

        {/* ── Map Scroll Content ─────────────────────────────────────────── */}
        <div className="max-w-lg mx-auto px-4 pt-38 pb-28" style={{ paddingTop: 148 }}>

          {/* Intro card */}
          <div
            className="mb-8 p-5 rounded-2xl text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-4xl mb-2">🇲🇦</p>
            <h1 className="text-white font-black text-xl mb-1" dir="rtl">رحلة عبر المغرب</h1>
            <p className="text-white/35 text-sm" dir="rtl">
              من واد زم إلى أكادير — كل مدينة = مرحلة جديدة
            </p>
          </div>

          {zones.map((zone) => (
            <div key={zone.label} className="mb-6">

              {/* Zone header */}
              <div className="flex items-center gap-3 mb-4 px-1">
                <div
                  className="h-px flex-1 rounded-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${zone.color}40)` }}
                />
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0"
                  style={{ background: `${zone.color}12`, border: `1px solid ${zone.color}28` }}
                >
                  <span className="text-sm">{zone.emoji}</span>
                  <span className="font-black text-xs" style={{ color: zone.color }}>{zone.label}</span>
                  <span className="text-xs" style={{ color: `${zone.color}80` }} dir="rtl">{zone.desc}</span>
                </div>
                <div
                  className="h-px flex-1 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${zone.color}40, transparent)` }}
                />
              </div>

              {/* Island rows */}
              {zone.islands.map((island) => {
                const globalIdx = ISLANDS.findIndex(i => i.id === island.id)
                const isLast    = globalIdx === ISLANDS.length - 1
                const status    = statuses[island.id] ?? 'locked'
                const isCompleted = status === 'completed'
                const isCurrent   = status === 'current'
                const isLocked    = status === 'locked'

                return (
                  <div key={island.id} className="flex gap-4">

                    {/* ── Timeline column ── */}
                    <div className="flex flex-col items-center w-14 shrink-0 pt-1">

                      {/* Node */}
                      <div className="relative">
                        {/* Pulse ring for current */}
                        {isCurrent && (
                          <div
                            className="absolute inset-0 rounded-full pulse-ring"
                            style={{
                              border: `2px solid ${island.color}`,
                              width: 48, height: 48,
                              top: 0, left: 0,
                            }}
                          />
                        )}
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl z-10 relative transition-all ${isCurrent ? 'island-float' : ''}`}
                          style={{
                            background: isLocked
                              ? '#1a2035'
                              : isCompleted
                                ? `${island.color}22`
                                : `${island.color}20`,
                            border: `2.5px solid ${
                              isLocked ? '#ffffff15' : island.color
                            }`,
                            boxShadow: isCurrent
                              ? `0 0 20px ${island.color}50`
                              : isCompleted
                                ? `0 0 10px ${island.color}30`
                                : 'none',
                            opacity: isLocked ? 0.45 : 1,
                          }}
                        >
                          <span className={isCurrent ? 'node-shimmer' : ''}>
                            {isLocked ? '🔒' : isCompleted ? '⭐' : island.emoji}
                          </span>
                        </div>
                      </div>

                      {/* Connecting line */}
                      {!isLast && (
                        <div
                          className="w-0.5 min-h-8 flex-1 mt-2 rounded-full"
                          style={{
                            background: isCompleted
                              ? `linear-gradient(180deg, ${island.color}, ${island.color}30)`
                              : 'rgba(255,255,255,0.07)',
                            minHeight: 24,
                          }}
                        />
                      )}
                    </div>

                    {/* ── Island card ── */}
                    <div className="flex-1 pb-4">
                      <IslandCard
                        island={island}
                        status={status}
                        onClick={() => setSelected(island)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ))}

          {/* End card */}
          <div className="text-center py-10 px-4 mt-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              🌟
            </div>
            <p className="text-white/20 text-sm" dir="rtl">أكمل جميع المراحل لتصبح محترفاً حقيقياً</p>
            <p className="text-white/10 text-xs mt-1" dir="rtl">المزيد من المراحل قادمة قريباً...</p>
          </div>

        </div>
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {selected && (
        <IslandModal
          island={selected}
          status={statuses[selected.id] ?? 'locked'}
          onClose={() => setSelected(null)}
          onStart={() => { handleStart(selected); setSelected(null) }}
          onComplete={() => handleComplete(selected)}
        />
      )}
    </>
  )
}
