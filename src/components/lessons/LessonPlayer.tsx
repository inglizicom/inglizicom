'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react'
import type { Unit, Section } from '@/data/private-lessons/types'
import CoverSlide from './CoverSlide'
import VocabSection from './VocabSection'
import VocabCategoriesSection from './VocabCategoriesSection'
import StaticSentencesSection from './StaticSentencesSection'
import ConversationSection from './ConversationSection'
import QuizSection from './QuizSection'
import ReviewSection from './ReviewSection'
import Annotator from './Annotator'

export default function LessonPlayer({ unit }: { unit: Unit }) {
  const [sectionIdx, setSectionIdx] = useState(0)
  const [step, setStep] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const ZOOM_MIN = 0.5
  const ZOOM_MAX = 2.5
  const ZOOM_STEP = 0.1
  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(ZOOM_MAX, parseFloat((z + ZOOM_STEP).toFixed(2)))),
    []
  )
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(ZOOM_MIN, parseFloat((z - ZOOM_STEP).toFixed(2)))),
    []
  )
  const resetZoom = useCallback(() => setZoom(1), [])

  const toggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
  }, [])

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const section = unit.sections[sectionIdx]
  const totalSections = unit.sections.length

  const stepCount = useMemo(() => stepCountForSection(section), [section])

  // Eagerly preload every vocab/review image as soon as the page mounts so
  // they're warm in the cache by the time the user advances into vocab.
  const allImages = useMemo(() => {
    const urls = new Set<string>()
    for (const s of unit.sections) {
      if (s.kind === 'vocab' || s.kind === 'review') {
        for (const it of s.items) if (it.image) urls.add(it.image)
      }
    }
    return Array.from(urls)
  }, [unit])

  // Use the JS Image() constructor — `display:none` <img> tags don't always
  // trigger network fetches, but Image() reliably does.
  useEffect(() => {
    if (typeof window === 'undefined') return
    for (const url of allImages) {
      const img = new window.Image()
      img.src = url
    }
  }, [allImages])

  const next = useCallback(() => {
    if (step < stepCount - 1) {
      setStep(step + 1)
    } else if (sectionIdx < totalSections - 1) {
      setSectionIdx(sectionIdx + 1)
      setStep(0)
    }
  }, [step, stepCount, sectionIdx, totalSections])

  const back = useCallback(() => {
    if (step > 0) {
      setStep(step - 1)
    } else if (sectionIdx > 0) {
      const prev = unit.sections[sectionIdx - 1]
      setSectionIdx(sectionIdx - 1)
      setStep(stepCountForSection(prev) - 1)
    }
  }, [step, sectionIdx, unit.sections])

  const revealAll = useCallback(() => setStep(stepCount - 1), [stepCount])
  const reset = useCallback(() => setStep(0), [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        back()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (sectionIdx < totalSections - 1) {
          setSectionIdx(sectionIdx + 1)
          setStep(0)
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (sectionIdx > 0) {
          setSectionIdx(sectionIdx - 1)
          setStep(0)
        }
      } else if (e.key === 'a') {
        revealAll()
      } else if (e.key === 'r') {
        reset()
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        zoomIn()
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        zoomOut()
      } else if (e.key === '0') {
        resetZoom()
      } else if (e.key === '?') {
        setShowHelp((s) => !s)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, back, revealAll, reset, sectionIdx, totalSections, toggleFullscreen, zoomIn, zoomOut, resetZoom])

  return (
    <div ref={containerRef} dir="ltr" className="min-h-screen h-screen bg-[#fafaf7] text-slate-900 selection:bg-amber-200 flex flex-col overflow-hidden">

      {/* Top bar */}
      <div className="z-30 backdrop-blur-md bg-white/80 border-b border-slate-200/60 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Link
              href="/private/lessons"
              className="text-slate-500 hover:text-amber-600 transition flex-shrink-0"
            >
              ←
            </Link>
            <span className="hidden sm:inline text-slate-300">/</span>
            <span className="font-display font-bold text-slate-900 truncate">
              Unit {unit.id}
              <span className="hidden md:inline">: {unit.title.en}</span>
            </span>
            <span className="hidden lg:inline text-slate-400" dir="rtl">— {unit.title.ar}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500 flex-shrink-0">
            <span className="hidden md:inline font-mono">
              {sectionIdx + 1}/{totalSections} · {step + 1}/{stepCount}
            </span>
            {/* Zoom controls */}
            <div className="flex items-center gap-0.5 rounded border border-slate-300 bg-white">
              <button
                onClick={zoomOut}
                disabled={zoom <= ZOOM_MIN}
                className="p-1.5 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-l transition"
                title="Zoom out (−)"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={resetZoom}
                className="px-1.5 py-1 text-[11px] font-mono font-bold min-w-[3rem] hover:bg-slate-100 transition border-x border-slate-200"
                title="Reset zoom (0)"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={zoomIn}
                disabled={zoom >= ZOOM_MAX}
                className="p-1.5 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-r transition"
                title="Zoom in (+)"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded border border-slate-300 hover:bg-slate-100 transition"
              title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowHelp((s) => !s)}
              className="px-2 py-1 rounded border border-slate-300 hover:bg-slate-100"
              title="Keyboard help (?)"
            >
              ?
            </button>
          </div>
        </div>
        <div className="h-0.5 bg-slate-200">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-rose-400"
            initial={false}
            animate={{
              width: `${((sectionIdx + (step + 1) / stepCount) / totalSections) * 100}%`,
            }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Main slide area — fills remaining height */}
      <div className="flex-1 min-h-0 flex flex-col relative">
        <div className="flex-1 min-h-0 flex flex-col overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${sectionIdx}-${section.kind}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="flex-1 flex flex-col py-6 md:py-10"
            >
              <div
                className="flex-1 flex flex-col transition-transform duration-200"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center top' }}
              >
                <SectionRenderer section={section} step={step} unit={unit} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <Annotator resetKey={`${sectionIdx}-${step}`} />
      </div>

      {/* Bottom controls */}
      <div className="z-30 backdrop-blur-md bg-white/80 border-t border-slate-200/60 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
          <button
            onClick={back}
            disabled={sectionIdx === 0 && step === 0}
            className="px-3 sm:px-4 py-2 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed text-xs sm:text-sm"
          >
            ←<span className="hidden sm:inline mr-1"> السابق</span>
          </button>
          <SectionDots
            sections={unit.sections}
            currentIdx={sectionIdx}
            onJump={(i) => {
              setSectionIdx(i)
              setStep(0)
            }}
          />
          <button
            onClick={next}
            disabled={sectionIdx === totalSections - 1 && step === stepCount - 1}
            className="px-4 sm:px-5 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-xs sm:text-sm font-bold"
          >
            <span className="hidden sm:inline ml-1">التالي </span>→
          </button>
        </div>
      </div>

      {/* Help overlay */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur flex items-center justify-center p-6"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-4 text-slate-900">اختصارات لوحة المفاتيح</h3>
              <ul className="space-y-2 text-slate-700">
                <Shortcut keys="Space / →" desc="الخطوة التالية" />
                <Shortcut keys="←" desc="رجوع" />
                <Shortcut keys="↓" desc="القسم التالي" />
                <Shortcut keys="↑" desc="القسم السابق" />
                <Shortcut keys="A" desc="إظهار كل شيء في القسم" />
                <Shortcut keys="R" desc="إعادة القسم من البداية" />
                <Shortcut keys="F" desc="ملء الشاشة / خروج" />
                <Shortcut keys="+ / −" desc="تكبير / تصغير" />
                <Shortcut keys="0" desc="إعادة الحجم الأصلي" />
                <Shortcut keys="?" desc="إظهار/إخفاء هذه القائمة" />
              </ul>
              <button
                onClick={() => setShowHelp(false)}
                className="mt-6 w-full py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
              >
                إغلاق
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Shortcut({ keys, desc }: { keys: string; desc: string }) {
  return (
    <li className="flex items-center justify-between">
      <kbd className="px-2 py-1 bg-slate-100 rounded text-sm font-mono text-slate-700">{keys}</kbd>
      <span dir="rtl">{desc}</span>
    </li>
  )
}

function SectionDots({
  sections,
  currentIdx,
  onJump,
}: {
  sections: Section[]
  currentIdx: number
  onJump: (i: number) => void
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {sections.map((s, i) => (
        <button
          key={i}
          onClick={() => onJump(i)}
          title={sectionLabel(s)}
          className={`h-2 rounded-full transition-all ${
            i === currentIdx ? 'bg-amber-500 w-8' : 'bg-slate-300 hover:bg-slate-400 w-2'
          }`}
        />
      ))}
    </div>
  )
}

function sectionLabel(s: Section): string {
  switch (s.kind) {
    case 'cover':
      return 'Cover'
    case 'vocab':
      return s.title || 'Vocabulary'
    case 'vocabCategories':
      return s.title || 'Vocabulary'
    case 'staticSentences':
      return s.title || 'Sentence Patterns'
    case 'conversation':
      return s.title
    case 'quiz':
      return s.title || 'Quiz'
    case 'review':
      return s.title || 'Quick Review'
  }
}

function stepCountForSection(s: Section): number {
  switch (s.kind) {
    case 'cover':
      return 1
    case 'vocab':
      return s.items.length + 1
    case 'vocabCategories':
      return s.categories.reduce((sum, c) => sum + c.items.length, 0) + s.categories.length
    case 'staticSentences':
      return s.patterns.reduce((sum, p) => sum + 1 + p.examples.length, 0) + 1
    case 'conversation':
      return s.lines.length + 1
    case 'quiz':
      return 1
    case 'review':
      return 1 // review owns its own internal navigation
  }
}

function SectionRenderer({
  section,
  step,
  unit,
}: {
  section: Section
  step: number
  unit: Unit
}) {
  switch (section.kind) {
    case 'cover':
      return <CoverSlide unit={unit} />
    case 'vocab':
      return <VocabSection section={section} step={step} />
    case 'vocabCategories':
      return <VocabCategoriesSection section={section} step={step} />
    case 'staticSentences':
      return <StaticSentencesSection section={section} step={step} />
    case 'conversation':
      return <ConversationSection section={section} step={step} />
    case 'quiz':
      return <QuizSection section={section} step={step} />
    case 'review':
      return <ReviewSection section={section} step={step} />
  }
}
