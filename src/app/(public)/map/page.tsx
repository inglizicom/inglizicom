'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameState } from '@/lib/useGameState'
import { xpToNextLevel, LEVEL_THRESHOLDS, type CefrLevel } from '@/lib/game'
import { JOURNEY_CITIES, ALL_UNIT_IDS, CEFR_META, type JourneyCity, type JourneyUnit } from '@/data/journey-data'

// ─── Types ────────────────────────────────────────────────────────────────────

type UnitStatus  = 'completed' | 'current' | 'locked'
type CityStatus  = 'completed' | 'current' | 'locked' | 'coming-soon'

// ─── Status helpers ───────────────────────────────────────────────────────────

function getUnitStatus(unitId: string, completedIds: Set<string>): UnitStatus {
  if (completedIds.has(unitId)) return 'completed'
  // first incomplete unit in the ordered list is 'current'
  const firstIncomplete = ALL_UNIT_IDS.find(id => !completedIds.has(id))
  if (unitId === firstIncomplete) return 'current'
  return 'locked'
}

function getCityStatus(city: JourneyCity, completedIds: Set<string>): CityStatus {
  if (city.units.length === 0) return 'coming-soon'
  const statuses = city.units.map(u => getUnitStatus(u.id, completedIds))
  if (statuses.every(s => s === 'completed')) return 'completed'
  if (statuses.some(s => s === 'completed' || s === 'current')) return 'current'
  return 'locked'
}

// ─── Level colours ────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<CefrLevel, string> = {
  A0: '#10b981', A1: '#3b82f6', A2: '#0ea5e9', B1: '#8b5cf6', B2: '#ec4899', C1: '#f43f5e',
}

// ─── XP Level Bar ─────────────────────────────────────────────────────────────

function XpLevelBar({ xp, level }: { xp: number; level: CefrLevel }) {
  const { next, needed }    = xpToNextLevel(xp)
  const currentThreshold    = LEVEL_THRESHOLDS[level]
  const nextThreshold       = next ? LEVEL_THRESHOLDS[next] : xp
  const range               = nextThreshold - currentThreshold
  const pct                 = range > 0 ? Math.min(((xp - currentThreshold) / range) * 100, 100) : 100
  const color               = LEVEL_COLORS[level]

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background:`${color}20`, color, border:`1px solid ${color}35` }}>
            {level}
          </span>
          {next && <span className="text-white/20 text-xs">→ {next}</span>}
        </div>
        <span className="text-white/30 text-xs font-mono">
          {next ? `${needed} XP` : '🏆 أعلى مستوى'}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width:`${pct}%`, background:`linear-gradient(90deg,${color},${color}cc)`, boxShadow:`0 0 8px ${color}50` }} />
      </div>
    </div>
  )
}

// ─── Unit Row ─────────────────────────────────────────────────────────────────

function UnitRow({
  unit, status, cityColor, onClick,
}: {
  unit: JourneyUnit
  status: UnitStatus
  cityColor: string
  onClick: () => void
}) {
  const locked    = status === 'locked'
  const completed = status === 'completed'
  const current   = status === 'current'

  return (
    <button
      onClick={onClick}
      disabled={locked}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all duration-150 active:scale-[0.97]"
      style={{
        background: locked ? 'rgba(255,255,255,0.02)' : completed ? `${cityColor}10` : `${cityColor}08`,
        border: `1.5px solid ${locked ? 'rgba(255,255,255,0.06)' : completed ? cityColor + '40' : cityColor + '30'}`,
        opacity: locked ? 0.5 : 1,
        boxShadow: current ? `0 4px 20px ${cityColor}20` : 'none',
      }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ background: locked ? 'rgba(255,255,255,0.04)' : `${cityColor}18`, border: `1px solid ${locked ? 'rgba(255,255,255,0.07)' : cityColor + '30'}` }}
      >
        {locked ? '🔒' : completed ? '✅' : unit.emoji}
      </div>

      <div className="flex-1 min-w-0" dir="rtl">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className="text-white font-black text-sm truncate">{unit.title_ar}</span>
          {completed && <span className="text-xs px-1.5 py-0.5 rounded-md font-bold" style={{ background:'rgba(16,185,129,0.15)', color:'#6ee7b7' }}>✓</span>}
          {current   && <span className="text-xs px-1.5 py-0.5 rounded-md font-bold" style={{ background:`${cityColor}20`, color:cityColor }}>▶</span>}
        </div>
        <p className="text-white/30 text-xs truncate">{unit.desc_ar}</p>
      </div>

      <div className="shrink-0 flex items-center gap-1">
        <span className="text-xs font-black" style={{ color: locked ? 'rgba(255,255,255,0.15)' : cityColor }}>+{unit.xp}</span>
        <span className="text-xs" style={{ color: locked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.25)' }}>XP</span>
      </div>
    </button>
  )
}

// ─── City Card (collapsed/expanded) ──────────────────────────────────────────

function CityCard({
  city, completedIds, isLast, onUnitStart,
}: {
  city: JourneyCity
  completedIds: Set<string>
  isLast: boolean
  onUnitStart: (unit: JourneyUnit) => void
}) {
  const status   = getCityStatus(city, completedIds)
  const locked   = status === 'locked'
  const soon     = status === 'coming-soon'
  const completed = status === 'completed'
  const current  = status === 'current'

  const [open, setOpen] = useState(current)

  const meta       = CEFR_META[city.cefr] ?? CEFR_META['A0']
  const totalUnits = city.units.length
  const doneUnits  = city.units.filter(u => completedIds.has(u.id)).length

  return (
    <div className="flex gap-4">
      {/* ── Timeline ─────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center w-14 shrink-0 pt-1">
        <div className="relative">
          {current && (
            <div
              className="absolute rounded-full pulse-ring"
              style={{ border:`2px solid ${city.color}`, width:52, height:52, top:-2, left:-2, zIndex:0 }}
            />
          )}
          <button
            onClick={() => !locked && !soon && setOpen(o => !o)}
            disabled={locked || soon}
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl z-10 relative transition-all duration-200"
            style={{
              background: locked || soon ? '#12192e' : completed ? `${city.color}28` : `${city.color}20`,
              border: `2.5px solid ${locked || soon ? '#ffffff15' : city.color}`,
              boxShadow: current ? `0 0 24px ${city.color}55` : completed ? `0 0 12px ${city.color}35` : 'none',
              opacity: locked ? 0.4 : 1,
              animation: current ? 'islandFloat 3s ease-in-out infinite' : 'none',
            }}
          >
            {locked ? '🔒' : soon ? '🔮' : completed ? '⭐' : city.emoji}
          </button>
        </div>
        {!isLast && (
          <div
            className="w-0.5 flex-1 mt-2 rounded-full"
            style={{ minHeight:24, background: completed ? `linear-gradient(180deg,${city.color},${city.color}30)` : 'rgba(255,255,255,0.07)' }}
          />
        )}
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="flex-1 pb-5">
        {/* City header */}
        <button
          onClick={() => !locked && !soon && setOpen(o => !o)}
          disabled={locked || soon}
          className="w-full text-left rounded-2xl p-4 transition-all duration-150 active:scale-[0.98]"
          style={{
            background: locked || soon ? 'rgba(255,255,255,0.02)' : open ? `${city.color}10` : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${locked || soon ? 'rgba(255,255,255,0.06)' : open ? city.color + '40' : city.color + '20'}`,
            opacity: locked ? 0.55 : 1,
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1" dir="rtl">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background:`${meta.color}18`, color:meta.color, border:`1px solid ${meta.color}30` }}>
                  {city.cefr}
                </span>
                {completed && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background:'rgba(245,158,11,0.15)', color:'#fbbf24' }}>✅ مكتمل</span>}
                {current   && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background:`${city.color}20`, color:city.color }}>▶ جاري</span>}
                {soon      && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.25)' }}>🔮 قريباً</span>}
              </div>
              <p className="text-white font-black text-base leading-tight" style={{ color: locked || soon ? 'rgba(255,255,255,0.25)' : '#fff' }}>
                {city.name_ar}
              </p>
              <p className="text-white/25 text-xs mt-0.5">{city.name}</p>
              {totalUnits > 0 && (
                <p className="text-xs mt-1.5 font-bold" style={{ color: locked ? 'rgba(255,255,255,0.12)' : `${city.color}cc` }}>
                  {doneUnits}/{totalUnits} وحدة
                </p>
              )}
            </div>

            {!locked && !soon && totalUnits > 0 && (
              <div
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs transition-transform duration-300"
                style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.35)', transform: open ? 'rotate(180deg)' : 'none' }}
              >
                ▼
              </div>
            )}
          </div>

          {/* Mini progress bar */}
          {totalUnits > 0 && !locked && (
            <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(doneUnits / totalUnits) * 100}%`, background: `linear-gradient(90deg,${city.color},${city.color}bb)` }}
              />
            </div>
          )}
        </button>

        {/* Units (expandable) */}
        {open && totalUnits > 0 && (
          <div className="mt-2 flex flex-col gap-2 overflow-hidden" style={{ animation:'fadeDown 0.25s ease-out' }}>
            {city.units.map(unit => (
              <UnitRow
                key={unit.id}
                unit={unit}
                status={getUnitStatus(unit.id, completedIds)}
                cityColor={city.color}
                onClick={() => onUnitStart(unit)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MapPage() {
  const router = useRouter()
  const game   = useGameState(ALL_UNIT_IDS)

  const { profile, progress, loading } = game

  const completedIds = new Set(
    progress.filter(p => p.completed).map(p => p.island_id)
  )

  const totalUnits    = ALL_UNIT_IDS.length
  const completedCount = ALL_UNIT_IDS.filter(id => completedIds.has(id)).length
  const overallPct    = Math.round((completedCount / totalUnits) * 100)

  // Auto-open onboarding for first-timers
  useEffect(() => {
    const seen = localStorage.getItem('inglizi_onboarded')
    if (!seen) router.replace('/onboarding')
  }, [router])

  function handleUnitStart(unit: JourneyUnit) {
    router.push(`/learn?id=${unit.id}`)
  }

  return (
    <>
      <style>{`
        @keyframes islandFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes pulseRing   { 0%{transform:scale(1);opacity:.65} 70%,100%{transform:scale(1.6);opacity:0} }
        @keyframes fadeDown    { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .pulse-ring { animation: pulseRing 2.2s ease-out infinite; }
      `}</style>

      <div className="min-h-screen" style={{ background:'linear-gradient(160deg,#060d1a 0%,#0a1120 50%,#070e1c 100%)' }}>

        {/* ── Fixed Header ─────────────────────────────────────────────── */}
        <div className="fixed top-0 left-0 right-0 z-40"
          style={{ background:'rgba(6,13,26,0.92)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-lg mx-auto px-4 pt-14 pb-4">

            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.4)' }}
              >
                ← رجوع
              </button>

              <p className="text-white font-black text-base" dir="rtl">🗺️ خريطة الرحلة</p>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
                  <span>🔥</span>
                  <span className="text-orange-400 font-black text-sm">{loading ? '—' : profile?.streak ?? 0}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
                  <span>⚡</span>
                  <span className="text-yellow-400 font-black text-sm">{loading ? '—' : profile?.xp ?? 0}</span>
                </div>
              </div>
            </div>

            {!loading && profile
              ? <XpLevelBar xp={profile.xp} level={profile.level as CefrLevel} />
              : <div className="h-2 rounded-full" style={{ background:'rgba(255,255,255,0.08)' }} />
            }

            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width:`${overallPct}%`, background:'linear-gradient(90deg,#10b981,#f59e0b)', boxShadow:'0 0 8px rgba(245,158,11,0.35)' }} />
              </div>
              <span className="text-white/30 text-xs font-mono shrink-0">{completedCount}/{totalUnits} وحدة</span>
            </div>
          </div>
        </div>

        {/* ── Scrollable Map ─────────────────────────────────────────────── */}
        <div className="max-w-lg mx-auto px-4 pb-28" style={{ paddingTop:168 }}>

          {/* Intro banner */}
          <div className="mb-6 p-5 rounded-2xl text-center" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-4xl mb-2">🇲🇦</p>
            <h1 className="text-white font-black text-xl mb-1" dir="rtl">رحلة عبر المغرب</h1>
            <p className="text-white/30 text-sm" dir="rtl">كل مدينة = مستوى جديد — من مبتدئ إلى محترف</p>
          </div>

          {/* Cities */}
          {JOURNEY_CITIES.map((city, idx) => (
            <CityCard
              key={city.id}
              city={city}
              completedIds={loading ? new Set() : completedIds}
              isLast={idx === JOURNEY_CITIES.length - 1}
              onUnitStart={handleUnitStart}
            />
          ))}

          {/* Footer */}
          <div className="text-center py-10">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
              🌟
            </div>
            <p className="text-white/20 text-sm" dir="rtl">المزيد من المدن قادمة قريباً...</p>
          </div>
        </div>
      </div>
    </>
  )
}
