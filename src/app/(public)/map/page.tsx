'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

type StageStatus = 'locked' | 'unlocked' | 'completed'

interface Stage {
  id: string
  title: string
  title_ar: string
  emoji: string
  xp_reward: number
  level: string
  lesson_count: number
  description_ar: string
  accent: string
  link: string
}

// ─── Stage Data ───────────────────────────────────────────────────────────────

const STAGES: Stage[] = [
  {
    id: '1', title: 'Hello World', title_ar: 'مرحباً بالعالم', emoji: '👋',
    xp_reward: 100, level: 'A1', lesson_count: 3,
    description_ar: 'ابدأ رحلتك! تعلم التحيات والتعارف بالإنجليزية',
    accent: '#10b981', link: '/learn',
  },
  {
    id: '2', title: 'Coffee Shop', title_ar: 'في المقهى', emoji: '☕',
    xp_reward: 150, level: 'A1', lesson_count: 4,
    description_ar: 'اطلب قهوتك وتحدث بشكل طبيعي في المقهى',
    accent: '#f59e0b', link: '/learn',
  },
  {
    id: '3', title: 'Morning Routine', title_ar: 'الروتين الصباحي', emoji: '🌅',
    xp_reward: 200, level: 'A1', lesson_count: 5,
    description_ar: 'صف يومك وتحدث عن الروتين اليومي والأنشطة',
    accent: '#f97316', link: '/learn',
  },
  {
    id: '4', title: 'Shopping', title_ar: 'التسوق', emoji: '🛍️',
    xp_reward: 250, level: 'A2', lesson_count: 5,
    description_ar: 'اشتري وتفاوض وتحدث عن الأسعار والمنتجات',
    accent: '#f43f5e', link: '/learn',
  },
  {
    id: '5', title: 'In the City', title_ar: 'في المدينة', emoji: '🌆',
    xp_reward: 300, level: 'A2', lesson_count: 6,
    description_ar: 'اسأل عن الطريق وتنقل في المدينة بثقة تامة',
    accent: '#0ea5e9', link: '/learn',
  },
  {
    id: '6', title: 'At Work', title_ar: 'في العمل', emoji: '💼',
    xp_reward: 350, level: 'A2', lesson_count: 6,
    description_ar: 'تحدث في بيئة العمل واعقد اجتماعات باحترافية',
    accent: '#6366f1', link: '/learn',
  },
  {
    id: '7', title: 'Travel', title_ar: 'السفر', emoji: '✈️',
    xp_reward: 400, level: 'B1', lesson_count: 7,
    description_ar: 'سافر وتحدث في المطار والفندق والتأشيرة',
    accent: '#14b8a6', link: '/learn',
  },
  {
    id: '8', title: 'Master', title_ar: 'الاحتراف 👑', emoji: '🏆',
    xp_reward: 500, level: 'B1', lesson_count: 8,
    description_ar: 'أتقن الإنجليزية وتحدث مثل الناطق الأصلي تماماً',
    accent: '#f59e0b', link: '/learn',
  },
]

// ─── Map geometry ─────────────────────────────────────────────────────────────

const MAP_W     = 320   // logical SVG width
const NODE_R    = 44    // node radius px
const V_GAP     = 185   // vertical spacing between node centers
const PAD_TOP   = 110
const PAD_BOT   = 90

const NODES = STAGES.map((_, i) => ({
  x: i % 2 === 0 ? MAP_W * 0.28 : MAP_W * 0.72,
  y: PAD_TOP + i * V_GAP,
}))

const MAP_H = PAD_TOP + (STAGES.length - 1) * V_GAP + NODE_R + PAD_BOT

// Smooth cubic bezier path through all nodes
function buildPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], c = pts[i]
    const midY = (p.y + c.y) / 2
    d += ` C ${p.x} ${midY} ${c.x} ${midY} ${c.x} ${c.y}`
  }
  return d
}

const FULL_PATH = buildPath(NODES)

// Level zones (which stage indices belong to which level)
const LEVEL_ZONES = [
  { label: 'A1', emoji: '🌱', start: 0, end: 2, color: '#10b981' },
  { label: 'A2', emoji: '⭐', start: 3, end: 5, color: '#0ea5e9' },
  { label: 'B1', emoji: '🚀', start: 6, end: 7, color: '#8b5cf6' },
]

// Background decorations
const DECORATIONS = [
  { emoji: '🌴', x: 5,  y: 8  },
  { emoji: '☁️', x: 65, y: 4  },
  { emoji: '⭐', x: 80, y: 15 },
  { emoji: '🌿', x: 88, y: 28 },
  { emoji: '🏔️', x: 2,  y: 33 },
  { emoji: '☁️', x: 10, y: 48 },
  { emoji: '🌊', x: 70, y: 44 },
  { emoji: '🪨', x: 88, y: 55 },
  { emoji: '🌴', x: 4,  y: 62 },
  { emoji: '⭐', x: 78, y: 70 },
  { emoji: '☁️', x: 60, y: 78 },
  { emoji: '🌿', x: 5,  y: 82 },
  { emoji: '🏔️', x: 85, y: 88 },
  { emoji: '🌊', x: 12, y: 92 },
]

// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = 'inglizi_stage_progress'

function loadProgress(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}

function saveProgress(p: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

function computeStatuses(progress: Record<string, boolean>): Record<string, StageStatus> {
  const out: Record<string, StageStatus> = {}
  STAGES.forEach((s, i) => {
    if (progress[s.id])                                        out[s.id] = 'completed'
    else if (i === 0 || progress[STAGES[i - 1].id])           out[s.id] = 'unlocked'
    else                                                        out[s.id] = 'locked'
  })
  return out
}

// ─── XP helpers ───────────────────────────────────────────────────────────────

function loadTotalXp(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem('inglizi_total_xp') ?? '0', 10)
}
function loadStreak(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem('inglizi_streak') ?? '0', 10)
}

// ─── Progress line path (up to current progress) ──────────────────────────────

function buildCompletedPath(statuses: Record<string, StageStatus>): string {
  // Draw path through nodes that are completed or the first unlocked
  const completedIdx = STAGES.reduce((acc, s, i) => statuses[s.id] === 'completed' ? i : acc, -1)
  if (completedIdx < 0) return ''
  return buildPath(NODES.slice(0, completedIdx + 2).map((_, i) => NODES[i]))
}

// ─── Stage Node Component ─────────────────────────────────────────────────────

function StageNode({
  stage, status, index, onClick, isCurrent,
}: {
  stage: Stage; status: StageStatus; index: number; onClick: () => void; isCurrent: boolean
}) {
  const pos = NODES[index]

  // Visual config per status
  const isCompleted = status === 'completed'
  const isUnlocked  = status === 'unlocked'
  const isLocked    = status === 'locked'

  const outerSize = NODE_R * 2        // 88px
  const innerSize = NODE_R * 2 - 12  // 76px (inner circle)

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      onClick={onClick}
      style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
    >
      {/* Pulse ring for current unlocked stage */}
      {isCurrent && (
        <>
          <circle r={NODE_R + 16} fill="none" stroke={stage.accent} strokeWidth="2" opacity="0.25"
            className="map-pulse-ring-slow" />
          <circle r={NODE_R + 8}  fill="none" stroke={stage.accent} strokeWidth="2.5" opacity="0.4"
            className="map-pulse-ring" />
        </>
      )}

      {/* Completed: gold glow ring */}
      {isCompleted && (
        <circle r={NODE_R + 6} fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.5" />
      )}

      {/* Outer shadow / bg ring */}
      <circle
        r={NODE_R}
        fill={isLocked ? '#1e2535' : isCompleted ? '#0a0f1e' : '#0a0f1e'}
        stroke={isLocked ? '#ffffff15' : isCompleted ? '#f59e0b' : stage.accent}
        strokeWidth={isCompleted ? 3 : 2.5}
        opacity={isLocked ? 0.6 : 1}
      />

      {/* Inner filled circle */}
      <circle
        r={NODE_R - 8}
        fill={
          isLocked    ? '#111827' :
          isCompleted ? `${stage.accent}22` :
                        `${stage.accent}20`
        }
        opacity={isLocked ? 0.5 : 1}
        className={isUnlocked && isCurrent ? 'map-node-float' : ''}
      />

      {/* Emoji or lock icon */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={isLocked ? 22 : 28}
        opacity={isLocked ? 0.35 : 1}
      >
        {isLocked ? '🔒' : stage.emoji}
      </text>

      {/* Completed star badge */}
      {isCompleted && (
        <>
          <circle cx={NODE_R - 4} cy={-(NODE_R - 4)} r={14} fill="#f59e0b" stroke="#0a0f1e" strokeWidth={2} />
          <text x={NODE_R - 4} y={-(NODE_R - 4)} textAnchor="middle" dominantBaseline="central" fontSize={14}>⭐</text>
        </>
      )}

      {/* Level badge */}
      <rect
        x={-22} y={NODE_R + 4} width={44} height={18} rx={9}
        fill={isLocked ? '#1e2535' : `${stage.accent}30`}
        stroke={isLocked ? '#ffffff15' : `${stage.accent}60`}
        strokeWidth={1}
        opacity={isLocked ? 0.5 : 1}
      />
      <text
        x={0} y={NODE_R + 13}
        textAnchor="middle" dominantBaseline="central"
        fontSize={9}
        fill={isLocked ? '#ffffff30' : stage.accent}
        fontWeight="900"
        fontFamily="monospace"
      >
        {stage.level}
      </text>

      {/* Stage title (Arabic) - below level badge */}
      <text
        x={0} y={NODE_R + 32}
        textAnchor="middle" dominantBaseline="central"
        fontSize={8.5}
        fill={isLocked ? '#ffffff20' : '#ffffff60'}
        fontFamily="Cairo, sans-serif"
      >
        {stage.title_ar}
      </text>
    </g>
  )
}

// ─── Stage Modal (bottom sheet) ───────────────────────────────────────────────

function StageModal({
  stage,
  status,
  onClose,
  onComplete,
  onStart,
}: {
  stage: Stage
  status: StageStatus
  onClose: () => void
  onComplete: () => void
  onStart: () => void
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))) }, [])

  function close() {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  const isLocked    = status === 'locked'
  const isCompleted = status === 'completed'
  const isUnlocked  = status === 'unlocked'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 transition-opacity duration-250"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', opacity: visible ? 1 : 0 }}
        onClick={close}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out"
        style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
      >
        <div className="mx-auto max-w-sm rounded-t-3xl overflow-hidden border-t border-white/10"
          style={{ background: 'linear-gradient(160deg, #0f172a 0%, #111827 100%)' }}>

          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          <div className="px-6 pb-8 flex flex-col gap-5">
            {/* Stage hero */}
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0"
                style={{
                  background: isLocked ? '#1e2535' : `${stage.accent}18`,
                  border: `2px solid ${isLocked ? '#ffffff15' : stage.accent}60`,
                  boxShadow: isLocked ? 'none' : `0 0 24px ${stage.accent}30`,
                }}
              >
                {isLocked ? '🔒' : stage.emoji}
              </div>
              <div dir="rtl" className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded-full"
                    style={{ background: `${stage.accent}20`, color: stage.accent, border: `1px solid ${stage.accent}40` }}
                  >
                    {stage.level}
                  </span>
                  {isCompleted && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">✅ مكتمل</span>}
                  {isUnlocked  && <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold">🔓 متاح</span>}
                  {isLocked    && <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/25 font-bold">🔒 مقفل</span>}
                </div>
                <h2 className="text-white font-black text-xl leading-tight">{stage.title_ar}</h2>
                <p className="text-white/40 text-xs mt-0.5">{stage.title}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-white/50 text-sm leading-relaxed text-right" dir="rtl">
              {isLocked
                ? 'أكمل المرحلة السابقة أولاً لتفتح هذه المرحلة! 🔒'
                : stage.description_ar}
            </p>

            {/* Stats row */}
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl bg-white/4 border border-white/8">
                <span className="text-xl">⚡</span>
                <span className="text-yellow-400 font-black text-lg">+{stage.xp_reward}</span>
                <span className="text-white/25 text-xs">XP</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl bg-white/4 border border-white/8">
                <span className="text-xl">📚</span>
                <span className="text-white font-black text-lg">{stage.lesson_count}</span>
                <span className="text-white/25 text-xs" dir="rtl">درس</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl bg-white/4 border border-white/8">
                <span className="text-xl">{stage.emoji}</span>
                <span className="text-white font-black text-lg">{stage.level}</span>
                <span className="text-white/25 text-xs" dir="rtl">مستوى</span>
              </div>
            </div>

            {/* Action buttons */}
            {isLocked && (
              <button onClick={close}
                className="w-full py-4 rounded-2xl font-black text-base text-white/30 bg-white/5 border border-white/8 transition-all active:scale-[0.98]">
                🔒 أكمل المرحلة السابقة أولاً
              </button>
            )}

            {isUnlocked && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={onStart}
                  className="w-full py-4 rounded-2xl font-black text-base text-white shadow-lg transition-all active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg, ${stage.accent}, ${stage.accent}cc)`, boxShadow: `0 8px 24px ${stage.accent}40` }}
                >
                  ابدأ الدرس 🚀
                </button>
                <button
                  onClick={onComplete}
                  className="w-full py-3 rounded-2xl font-bold text-sm text-white/40 bg-white/4 border border-white/8 hover:bg-white/8 transition-all active:scale-[0.98]"
                >
                  ✅ سجّل كمكتمل (للتجربة)
                </button>
              </div>
            )}

            {isCompleted && (
              <div className="flex gap-3">
                <button
                  onClick={onStart}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm text-white/60 bg-white/6 border border-white/8 hover:bg-white/12 transition-all active:scale-[0.98]"
                >
                  🔄 مراجعة
                </button>
                <button
                  onClick={close}
                  className="flex-1 py-4 rounded-2xl font-black text-base text-white shadow-lg transition-all active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg, #f59e0b, #d97706)`, boxShadow: '0 8px 24px #f59e0b40' }}
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

  const [progress,      setProgress]      = useState<Record<string, boolean>>({})
  const [statuses,      setStatuses]      = useState<Record<string, StageStatus>>({})
  const [selected,      setSelected]      = useState<Stage | null>(null)
  const [totalXp,       setTotalXp]       = useState(0)
  const [streak,        setStreak]        = useState(0)
  const [pathLen,       setPathLen]       = useState(0)
  const pathRef = useRef<SVGPathElement>(null)
  const currentNodeRef = useRef<HTMLDivElement>(null)

  // Load data
  useEffect(() => {
    const prog = loadProgress()
    setProgress(prog)
    setStatuses(computeStatuses(prog))
    setTotalXp(loadTotalXp())
    setStreak(loadStreak())
  }, [])

  // Animate path length measurement
  useEffect(() => {
    if (pathRef.current) {
      setPathLen(pathRef.current.getTotalLength())
    }
  }, [])

  // Scroll to current unlocked stage
  useEffect(() => {
    const currentIdx = STAGES.findIndex(s => statuses[s.id] === 'unlocked')
    if (currentIdx >= 0) {
      const y = NODES[currentIdx].y
      const scrollTarget = y - 200
      setTimeout(() => window.scrollTo({ top: scrollTarget, behavior: 'smooth' }), 500)
    }
  }, [statuses])

  // Current stage = first unlocked
  const currentStageIdx = STAGES.findIndex(s => statuses[s.id] === 'unlocked')
  const currentStage    = STAGES[currentStageIdx] ?? null

  // Completed count for progress
  const completedCount  = STAGES.filter(s => statuses[s.id] === 'completed').length
  const progressPct     = Math.round((completedCount / STAGES.length) * 100)

  // Completed path portion (how far to draw the gold line)
  const completedPathEnd = completedCount > 0 ? NODES[Math.min(completedCount, NODES.length - 1)] : null

  function handleComplete(stage: Stage) {
    const newProg = { ...progress, [stage.id]: true }
    setProgress(newProg)
    setStatuses(computeStatuses(newProg))
    saveProgress(newProg)
    // Add XP
    const newXp = totalXp + stage.xp_reward
    setTotalXp(newXp)
    localStorage.setItem('inglizi_total_xp', String(newXp))
    setSelected(null)
  }

  function handleStart(stage: Stage) {
    router.push(stage.link)
  }

  function handleNodeClick(stage: Stage, status: StageStatus) {
    setSelected(stage)
  }

  // How many nodes of the path to draw in gold (completed)
  const goldNodes = NODES.slice(0, completedCount + 1)
  const goldPath  = buildPath(goldNodes)

  return (
    <>
      {/* Custom keyframe animations */}
      <style>{`
        @keyframes mapFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes mapPulseRing {
          0%   { r: ${NODE_R + 8}; opacity: 0.5; }
          100% { r: ${NODE_R + 22}; opacity: 0; }
        }
        @keyframes mapPulseRingSlow {
          0%   { r: ${NODE_R + 16}; opacity: 0.3; }
          100% { r: ${NODE_R + 32}; opacity: 0; }
        }
        @keyframes pathDraw {
          from { stroke-dashoffset: var(--path-len); }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes shimmer {
          0%   { opacity: 0.6; }
          50%  { opacity: 1; }
          100% { opacity: 0.6; }
        }
        @keyframes starSpin {
          from { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.2); }
          to   { transform: rotate(360deg) scale(1); }
        }
        @keyframes cloudDrift {
          0%, 100% { transform: translateX(0px); }
          50%       { transform: translateX(8px); }
        }
        .map-node-float     { animation: mapFloat 3s ease-in-out infinite; }
        .map-pulse-ring     { animation: mapPulseRing 1.8s ease-out infinite; }
        .map-pulse-ring-slow{ animation: mapPulseRingSlow 1.8s ease-out infinite 0.4s; }
        .map-path-draw      { animation: pathDraw 1.2s ease-out forwards; }
        .map-shimmer        { animation: shimmer 2s ease-in-out infinite; }
        .map-cloud          { animation: cloudDrift 4s ease-in-out infinite; }
        .map-star           { animation: starSpin 6s linear infinite; }
      `}</style>

      <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#060d1a 0%,#0a1120 40%,#070e1c 100%)' }}>

        {/* ── Fixed Top Bar ── */}
        <div className="fixed top-0 left-0 right-0 z-40" style={{ background: 'rgba(6,13,26,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-sm mx-auto px-4 pt-14 pb-3">
            {/* Row 1: back + title + stats */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => router.back()}
                className="px-3 py-1.5 rounded-lg text-white/40 text-xs font-bold hover:text-white/70 transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                ← رجوع
              </button>

              <div className="text-center">
                <p className="text-white font-black text-base" dir="rtl">🗺️ خريطة التعلم</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="text-sm">🔥</span>
                  <span className="text-orange-400 font-black text-sm">{streak}</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="text-sm">⚡</span>
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
                    background: 'linear-gradient(90deg, #10b981, #f59e0b)',
                    boxShadow: '0 0 8px rgba(245,158,11,0.5)',
                  }}
                />
              </div>
              <span className="text-white/40 text-xs font-mono shrink-0">{completedCount}/{STAGES.length}</span>
            </div>

            {/* Current stage label */}
            {currentStage && (
              <p className="text-xs mt-2 text-right" dir="rtl">
                <span className="text-white/25">المرحلة الحالية: </span>
                <span className="font-bold" style={{ color: currentStage.accent }}>{currentStage.title_ar} {currentStage.emoji}</span>
              </p>
            )}
          </div>
        </div>

        {/* ── Map Container ── */}
        <div className="relative mx-auto overflow-x-hidden" style={{ maxWidth: MAP_W, paddingTop: 130 }}>

          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ height: MAP_H + 130 }}>
            {DECORATIONS.map((d, i) => (
              <span
                key={i}
                className={i % 3 === 0 ? 'map-cloud' : i % 5 === 0 ? 'map-star' : ''}
                style={{
                  position: 'absolute',
                  left: `${d.x}%`,
                  top:  `${d.y}%`,
                  fontSize: 18 + (i % 3) * 4,
                  opacity: 0.12 + (i % 4) * 0.05,
                  userSelect: 'none',
                }}
              >
                {d.emoji}
              </span>
            ))}

            {/* Gradient stars */}
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={`star-${i}`}
                style={{
                  position: 'absolute',
                  left:    `${(i * 37 + 13) % 100}%`,
                  top:     `${(i * 19 + 7)  % 100}%`,
                  width:   i % 4 === 0 ? 2 : 1,
                  height:  i % 4 === 0 ? 2 : 1,
                  borderRadius: '50%',
                  background:   '#fff',
                  opacity:      0.05 + (i % 5) * 0.04,
                }}
              />
            ))}
          </div>

          {/* Level zone separators */}
          {LEVEL_ZONES.map((zone, zi) => {
            const topNode    = NODES[zone.start]
            const bottomNode = NODES[zone.end]
            const midY       = (topNode.y + bottomNode.y) / 2
            const zoneTop    = zi === 0 ? 0 : (NODES[zone.start].y + NODES[LEVEL_ZONES[zi - 1].end].y) / 2
            const zoneBot    = zi === LEVEL_ZONES.length - 1 ? MAP_H : (NODES[zone.end].y + NODES[LEVEL_ZONES[zi + 1].start].y) / 2
            return (
              <div
                key={zone.label}
                style={{
                  position: 'absolute',
                  left: 0, right: 0,
                  top: zoneTop,
                  height: zoneBot - zoneTop,
                  background: `linear-gradient(180deg, transparent, ${zone.color}06 50%, transparent)`,
                  pointerEvents: 'none',
                }}
              >
                {/* Zone label */}
                <div
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: midY - zoneTop - 12,
                  }}
                >
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{ background: `${zone.color}15`, border: `1px solid ${zone.color}30` }}>
                    <span style={{ fontSize: 10 }}>{zone.emoji}</span>
                    <span className="font-black text-xs" style={{ color: zone.color }}>{zone.label}</span>
                  </div>
                </div>
              </div>
            )
          })}

          {/* SVG Map */}
          <svg
            width={MAP_W}
            height={MAP_H}
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            style={{ display: 'block', position: 'relative', zIndex: 1 }}
          >
            <defs>
              <filter id="glow-indigo">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-gold">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* Base path (full, dim) */}
            <path
              d={FULL_PATH}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Base path dotted guide */}
            <path
              d={FULL_PATH}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={16}
              strokeLinecap="round"
              strokeDasharray="1 24"
            />

            {/* Completed path (gold glow) */}
            {goldPath && completedCount > 0 && (
              <>
                <path
                  d={goldPath}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={10}
                  strokeLinecap="round"
                  opacity={0.2}
                  filter="url(#glow-gold)"
                />
                <path
                  d={goldPath}
                  fill="none"
                  stroke="url(#goldGrad)"
                  strokeWidth={6}
                  strokeLinecap="round"
                  opacity={0.8}
                  className="map-shimmer"
                />
              </>
            )}

            {/* Current path to first unlocked (indigo) */}
            {currentStageIdx > 0 && (() => {
              const nextPath = buildPath(NODES.slice(0, currentStageIdx + 1))
              return (
                <path
                  ref={pathRef}
                  d={nextPath}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth={5}
                  strokeLinecap="round"
                  opacity={0}
                />
              )
            })()}

            {/* Stage Nodes */}
            {STAGES.map((stage, i) => (
              <StageNode
                key={stage.id}
                stage={stage}
                status={statuses[stage.id] ?? 'locked'}
                index={i}
                onClick={() => handleNodeClick(stage, statuses[stage.id] ?? 'locked')}
                isCurrent={i === currentStageIdx}
              />
            ))}
          </svg>

          {/* Bottom padding */}
          <div style={{ height: 60 }} />
        </div>

        {/* ── Stage Modal ── */}
        {selected && (
          <StageModal
            stage={selected}
            status={statuses[selected.id] ?? 'locked'}
            onClose={() => setSelected(null)}
            onComplete={() => handleComplete(selected)}
            onStart={() => handleStart(selected)}
          />
        )}

        {/* ── Completed ALL stages celebration ── */}
        {completedCount === STAGES.length && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-6 py-4 rounded-2xl border flex items-center gap-3 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid #f59e0b40', boxShadow: '0 0 40px #f59e0b30' }}>
            <span className="text-3xl">🏆</span>
            <div dir="rtl">
              <p className="text-yellow-400 font-black text-base">أنهيت كل المراحل!</p>
              <p className="text-white/40 text-xs">أنت بطل حقيقي 👑</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
