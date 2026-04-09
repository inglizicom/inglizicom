'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameState } from '@/lib/useGameState'
import { xpToNextLevel, LEVEL_THRESHOLDS, type CefrLevel } from '@/lib/game'

// ─── Types ────────────────────────────────────────────────────────────────────

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
  { id:'1', city:'Oued Zem',         city_ar:'واد زم',           topic:'Greetings',            topic_ar:'التحيات',           cefr:'A0', emoji:'👋', color:'#10b981', xp:50,  lessonId:'greetings', desc_ar:'ابدأ رحلتك! تعلم كيف تقول مرحباً وتقدّم نفسك بالإنجليزية' },
  { id:'2', city:'Khouribga',         city_ar:'خريبكة',            topic:'Coffee Shop',           topic_ar:'في المقهى',         cefr:'A1', emoji:'☕', color:'#f59e0b', xp:75,  lessonId:'coffee',    desc_ar:'تعلم كيف تطلب مشروبك وتتحدث بشكل طبيعي في المقهى' },
  { id:'3', city:'Beni Mellal',       city_ar:'بني ملال',          topic:'At the Store',          topic_ar:'في المتجر',         cefr:'A1', emoji:'🛍️', color:'#f43f5e', xp:100, lessonId:'shopping',  desc_ar:'اشتري وتفاوض وتحدث عن الأسعار والمقاسات بثقة' },
  { id:'4', city:'Settat',            city_ar:'سطات',              topic:'Morning Routine',       topic_ar:'الروتين الصباحي',   cefr:'A1', emoji:'🌅', color:'#f97316', xp:120, lessonId:'greetings', desc_ar:'صف يومك وتحدث عن الأنشطة اليومية والروتين الصباحي' },
  { id:'5', city:'Casablanca',        city_ar:'الدار البيضاء',     topic:'In the City',           topic_ar:'في المدينة',        cefr:'A2', emoji:'🌆', color:'#0ea5e9', xp:150, lessonId:'shopping',  desc_ar:'تنقل واسأل عن الطريق وتحدث عن الأماكن في المدينة الكبيرة' },
  { id:'6', city:'Rabat',             city_ar:'الرباط',            topic:'At Work',               topic_ar:'في العمل',          cefr:'A2', emoji:'💼', color:'#6366f1', xp:175, lessonId:'coffee',    desc_ar:'احترف التواصل في بيئة العمل وتحدث مع الزملاء باحترافية' },
  { id:'7', city:'Marrakech',         city_ar:'مراكش',             topic:'Travel',                topic_ar:'السفر والسياحة',    cefr:'B1', emoji:'✈️', color:'#14b8a6', xp:200, lessonId:'greetings', desc_ar:'سافر وتحدث في المطار والفندق واستمتع بتجربة سياحية كاملة' },
  { id:'8', city:'Agadir',            city_ar:'أكادير',            topic:'Advanced Conversations',topic_ar:'محادثات متقدمة',    cefr:'B1', emoji:'🏆', color:'#d97706', xp:250, lessonId:'shopping',  desc_ar:'تحدث بطلاقة عن مواضيع متنوعة وأصبح محترفاً حقيقياً' },
]

const ISLAND_IDS = ISLANDS.map(i => i.id)

const CEFR_ZONES = [
  { label:'A0', color:'#10b981', emoji:'🌱', desc:'مبتدئ تماماً', islandIds:['1']           },
  { label:'A1', color:'#f59e0b', emoji:'🌿', desc:'مبتدئ',        islandIds:['2','3','4']   },
  { label:'A2', color:'#0ea5e9', emoji:'⭐', desc:'أساسي',         islandIds:['5','6']       },
  { label:'B1', color:'#8b5cf6', emoji:'🚀', desc:'متوسط',         islandIds:['7','8']       },
]

// ─── Level colour map ─────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<CefrLevel, string> = {
  A0: '#10b981', A1: '#f59e0b', A2: '#0ea5e9', B1: '#8b5cf6', B2: '#ec4899', C1: '#f43f5e',
}

// ─── Island Card ──────────────────────────────────────────────────────────────

function IslandCard({
  island, status, onClick,
}: {
  island: Island
  status: 'completed' | 'current' | 'locked'
  onClick: () => void
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
        background: isLocked ? 'rgba(255,255,255,0.02)' : isCompleted ? `${island.color}10` : 'rgba(255,255,255,0.04)',
        border: `1.5px solid ${isLocked ? 'rgba(255,255,255,0.07)' : isCompleted ? `${island.color}45` : `${island.color}65`}`,
        boxShadow: isCurrent ? `0 4px 24px ${island.color}22` : 'none',
        opacity: isLocked ? 0.55 : 1,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-[52px] h-[52px] rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{
            background: isLocked ? 'rgba(255,255,255,0.04)' : `${island.color}18`,
            border: `1px solid ${isLocked ? 'rgba(255,255,255,0.07)' : island.color + '30'}`,
          }}
        >
          {isLocked ? '🔒' : island.emoji}
        </div>

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
            {isCompleted && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400 font-bold">✅ مكتمل</span>}
            {isCurrent   && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15  border border-blue-500/25  text-blue-300  font-bold">▶ جاري</span>}
          </div>
          <p className="font-black text-base leading-tight" style={{ color: isLocked ? 'rgba(255,255,255,0.25)' : '#fff' }}>
            {island.city_ar}
          </p>
          <p className="text-sm mt-0.5" style={{ color: isLocked ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.45)' }}>
            {island.topic_ar}
          </p>
          <p className="text-xs mt-1.5 font-bold" style={{ color: isLocked ? 'rgba(255,255,255,0.1)' : `${island.color}cc` }}>
            ⚡ +{island.xp} XP
          </p>
        </div>

        <div className="text-xl shrink-0" style={{ color: isLocked ? 'rgba(255,255,255,0.1)' : isCompleted ? island.color : `${island.color}80` }}>
          {isLocked ? '🔒' : isCompleted ? '🌟' : '←'}
        </div>
      </div>
    </button>
  )
}

// ─── Island Detail Modal ──────────────────────────────────────────────────────

function IslandModal({
  island, status, onClose, onStart,
}: {
  island: Island
  status: 'completed' | 'current' | 'locked'
  onClose: () => void
  onStart: () => void
}) {
  function close() { onClose() }

  const isLocked    = status === 'locked'
  const isCompleted = status === 'completed'
  const isCurrent   = status === 'current'

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)' }}
        onClick={close}
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div
          className="mx-auto max-w-lg rounded-t-3xl overflow-hidden"
          style={{ background: 'linear-gradient(160deg,#0d1829 0%,#111927 100%)', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none' }}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/15" />
          </div>

          <div className="px-6 pb-10 pt-3 flex flex-col gap-5">
            {/* Hero */}
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
                  <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ background:`${island.color}20`, color:island.color, border:`1px solid ${island.color}40` }}>
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
            <div className="p-4 rounded-2xl" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white/55 text-sm leading-relaxed" dir="rtl">
                {isLocked ? '🔒 أكمل المرحلة السابقة أولاً لتفتح هذه المرحلة!' : island.desc_ar}
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              {[
                { icon:'⚡', val:`+${island.xp}`, label:'XP' },
                { icon:'🏙️', val:island.city_ar,  label:'المدينة' },
                { icon:'📊', val:island.cefr,     label:'المستوى' },
              ].map((s, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 py-3.5 rounded-2xl" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-white font-black text-sm">{s.val}</span>
                  <span className="text-white/25 text-xs" dir="rtl">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            {isLocked ? (
              <button onClick={close} className="w-full py-4 rounded-2xl font-black text-base text-white/30" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)' }}>
                🔒 أكمل المرحلة السابقة أولاً
              </button>
            ) : isCurrent ? (
              <button onClick={onStart} className="w-full py-4 rounded-2xl font-black text-lg text-white shadow-lg transition-all active:scale-[0.98]"
                style={{ background:`linear-gradient(135deg,${island.color},${island.color}bb)`, boxShadow:`0 8px 28px ${island.color}45` }}>
                ابدأ الدرس 🚀
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={onStart} className="flex-1 py-4 rounded-2xl font-bold text-sm text-white/60 transition-all active:scale-[0.98]" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)' }}>
                  🔄 مراجعة
                </button>
                <button onClick={close} className="flex-1 py-4 rounded-2xl font-black text-base text-white shadow-lg transition-all active:scale-[0.98]"
                  style={{ background:'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow:'0 8px 28px #f59e0b40' }}>
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

// ─── XP Level Bar ─────────────────────────────────────────────────────────────

function XpLevelBar({ xp, level }: { xp: number; level: CefrLevel }) {
  const { next, needed } = xpToNextLevel(xp)
  const currentThreshold = LEVEL_THRESHOLDS[level]
  const nextThreshold    = next ? LEVEL_THRESHOLDS[next] : xp
  const range            = nextThreshold - currentThreshold
  const progress         = range > 0 ? Math.min(((xp - currentThreshold) / range) * 100, 100) : 100
  const levelColor       = LEVEL_COLORS[level]

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background:`${levelColor}20`, color:levelColor, border:`1px solid ${levelColor}35` }}>
            {level}
          </span>
          {next && <span className="text-white/20 text-xs">→ {next}</span>}
        </div>
        <span className="text-white/35 text-xs font-mono">
          {next ? `${needed} XP للمستوى التالي` : '🏆 أعلى مستوى'}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width:`${progress}%`, background:`linear-gradient(90deg,${levelColor},${levelColor}cc)`, boxShadow:`0 0 8px ${levelColor}50` }}
        />
      </div>
    </div>
  )
}

// ─── Skeleton loading ─────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="w-full rounded-2xl p-4 flex items-center gap-3 animate-pulse" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.05)' }}>
      <div className="w-[52px] h-[52px] rounded-xl shrink-0" style={{ background:'rgba(255,255,255,0.06)' }} />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3 rounded-full w-1/3" style={{ background:'rgba(255,255,255,0.06)' }} />
        <div className="h-4 rounded-full w-1/2" style={{ background:'rgba(255,255,255,0.08)' }} />
        <div className="h-3 rounded-full w-2/3" style={{ background:'rgba(255,255,255,0.05)' }} />
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MapPage() {
  const router   = useRouter()
  const game     = useGameState(ISLAND_IDS)
  const [selected, setSelected] = useState<Island | null>(null)

  const { profile, islandStatuses, loading } = game

  const completedCount = ISLANDS.filter(i => islandStatuses[i.id] === 'completed').length
  const totalIslands   = ISLANDS.length
  const overallPct     = Math.round((completedCount / totalIslands) * 100)

  function handleStart(island: Island) {
    router.push(`/learn?id=${island.lessonId}&island=${island.id}`)
  }

  const zones = CEFR_ZONES.map(z => ({
    ...z,
    islands: ISLANDS.filter(is => z.islandIds.includes(is.id)),
  }))

  return (
    <>
      <style>{`
        @keyframes islandFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes pulseRing   { 0%{transform:scale(1);opacity:.6} 70%,100%{transform:scale(1.5);opacity:0} }
        @keyframes slideUp     { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes shimmer     { 0%,100%{opacity:.7} 50%{opacity:1} }
        .island-float  { animation: islandFloat 3s ease-in-out infinite; }
        .pulse-ring    { animation: pulseRing 2.2s ease-out infinite; }
        .animate-slide-up { animation: slideUp .3s ease-out forwards; }
        .node-shimmer  { animation: shimmer 2s ease-in-out infinite; }
      `}</style>

      <div className="min-h-screen" style={{ background:'linear-gradient(160deg,#060d1a 0%,#0a1120 50%,#070e1c 100%)' }}>

        {/* ── Fixed Header ─────────────────────────────────────────────────── */}
        <div className="fixed top-0 left-0 right-0 z-40" style={{ background:'rgba(6,13,26,0.92)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-lg mx-auto px-4 pt-14 pb-4">

            {/* Row 1: back · title · stats */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white/40 text-sm font-bold hover:text-white/70 transition-all active:scale-95"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}
              >
                ← رجوع
              </button>

              <p className="text-white font-black text-base" dir="rtl">🗺️ خريطة الرحلة</p>

              <div className="flex items-center gap-2">
                {/* Streak */}
                <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
                  <span>🔥</span>
                  <span className="text-orange-400 font-black text-sm">
                    {loading ? '—' : profile?.streak ?? 0}
                  </span>
                </div>
                {/* XP */}
                <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
                  <span>⚡</span>
                  <span className="text-yellow-400 font-black text-sm">
                    {loading ? '—' : profile?.xp ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* XP Level Progress Bar */}
            {!loading && profile ? (
              <XpLevelBar xp={profile.xp} level={profile.level as CefrLevel} />
            ) : (
              <div className="h-2 rounded-full" style={{ background:'rgba(255,255,255,0.08)' }} />
            )}

            {/* Island completion bar */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width:`${overallPct}%`, background:'linear-gradient(90deg,#10b981,#f59e0b)', boxShadow:'0 0 8px rgba(245,158,11,0.35)' }}
                />
              </div>
              <span className="text-white/30 text-xs font-mono shrink-0">{completedCount}/{totalIslands} جزيرة</span>
            </div>
          </div>
        </div>

        {/* ── Scrollable Map ─────────────────────────────────────────────── */}
        <div className="max-w-lg mx-auto px-4 pb-28" style={{ paddingTop: 164 }}>

          {/* Intro */}
          <div className="mb-8 p-5 rounded-2xl text-center" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-4xl mb-2">🇲🇦</p>
            <h1 className="text-white font-black text-xl mb-1" dir="rtl">رحلة عبر المغرب</h1>
            <p className="text-white/35 text-sm" dir="rtl">من واد زم إلى أكادير — كل مدينة = مرحلة جديدة</p>
          </div>

          {zones.map(zone => (
            <div key={zone.label} className="mb-6">
              {/* Zone header */}
              <div className="flex items-center gap-3 mb-4 px-1">
                <div className="h-px flex-1 rounded-full" style={{ background:`linear-gradient(90deg,transparent,${zone.color}40)` }} />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0" style={{ background:`${zone.color}12`, border:`1px solid ${zone.color}28` }}>
                  <span className="text-sm">{zone.emoji}</span>
                  <span className="font-black text-xs" style={{ color:zone.color }}>{zone.label}</span>
                  <span className="text-xs" style={{ color:`${zone.color}80` }} dir="rtl">{zone.desc}</span>
                </div>
                <div className="h-px flex-1 rounded-full" style={{ background:`linear-gradient(90deg,${zone.color}40,transparent)` }} />
              </div>

              {/* Islands */}
              {zone.islands.map(island => {
                const globalIdx   = ISLANDS.findIndex(i => i.id === island.id)
                const isLast      = globalIdx === ISLANDS.length - 1
                const status      = loading ? 'locked' : (islandStatuses[island.id] ?? 'locked')
                const isCompleted = status === 'completed'
                const isCurrent   = status === 'current'
                const isLocked    = status === 'locked'

                return (
                  <div key={island.id} className="flex gap-4">
                    {/* Timeline */}
                    <div className="flex flex-col items-center w-14 shrink-0 pt-1">
                      <div className="relative">
                        {isCurrent && (
                          <div className="absolute rounded-full pulse-ring" style={{ border:`2px solid ${island.color}`, width:48, height:48, top:0, left:0 }} />
                        )}
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl z-10 relative transition-all ${isCurrent ? 'island-float' : ''}`}
                          style={{
                            background: isLocked ? '#1a2035' : isCompleted ? `${island.color}22` : `${island.color}20`,
                            border: `2.5px solid ${isLocked ? '#ffffff15' : island.color}`,
                            boxShadow: isCurrent ? `0 0 20px ${island.color}50` : isCompleted ? `0 0 10px ${island.color}30` : 'none',
                            opacity: isLocked ? 0.45 : 1,
                          }}
                        >
                          <span className={isCurrent ? 'node-shimmer' : ''}>
                            {loading ? '…' : isLocked ? '🔒' : isCompleted ? '⭐' : island.emoji}
                          </span>
                        </div>
                      </div>
                      {!isLast && (
                        <div className="w-0.5 flex-1 mt-2 rounded-full" style={{ minHeight:24, background: isCompleted ? `linear-gradient(180deg,${island.color},${island.color}30)` : 'rgba(255,255,255,0.07)' }} />
                      )}
                    </div>

                    {/* Card */}
                    <div className="flex-1 pb-4">
                      {loading ? (
                        <SkeletonCard />
                      ) : (
                        <IslandCard island={island} status={status} onClick={() => setSelected(island)} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}

          {/* Footer */}
          <div className="text-center py-10">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
              🌟
            </div>
            <p className="text-white/20 text-sm" dir="rtl">أكمل جميع المراحل لتصبح محترفاً حقيقياً</p>
            <p className="text-white/10 text-xs mt-1" dir="rtl">المزيد من المراحل قادمة قريباً...</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <IslandModal
          island={selected}
          status={islandStatuses[selected.id] ?? 'locked'}
          onClose={() => setSelected(null)}
          onStart={() => { handleStart(selected); setSelected(null) }}
        />
      )}
    </>
  )
}
