'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, ArrowLeft, Check, Timer, RotateCcw, PenLine } from 'lucide-react'
import type { Block } from '@/data/level1-book'
import {
  exercisePoints, unitScore, unitText, writingPoints, wordCount, WRITING_CHECKLIST,
  type BacUnit, type PracticeExercise, type UnitState, type WritingState,
} from '@/lib/bac-practice'
import { LessonBlocks, Line, SECTION_COLOUR } from './BacBlocks'
import BacExercise from './BacExercise'

/**
 * One unit of the Bac pack: its lesson, with every exercise done in place.
 * A mock exam adds a running clock, the writing task (an essay box with a
 * self-check worth the 10 writing points) and the mark out of 20.
 */

export default function BacUnitView({ unit, exercises, exNo, state, update, onBack, next, onNext }: {
  unit: BacUnit; exercises: PracticeExercise[]; exNo: Map<Block, number>; state?: UnitState
  update: (fn: (s: UnitState) => UnitState) => void; onBack: () => void; next?: BacUnit; onNext: () => void
}) {
  const { c, soft } = SECTION_COLOUR[unit.section]
  const text = unitText(unit)
  const score = unitScore(exercises, state)
  const byBlock = new Map<Block, PracticeExercise>(exercises.map(e => [e.block, e]))

  // A mock exam's printed writing part (topics, advice) is replaced by the essay box.
  const cut = unit.mock ? unit.blocks.findIndex(b => b.t === 'sub' && b.text.startsWith('Part III')) : -1
  const blocks = cut >= 0 ? unit.blocks.slice(0, cut) : unit.blocks
  // The list under a "Practice topics" heading (Writing 5) feeds its essay box.
  const practiceAt = unit.blocks.findIndex(b => b.t === 'bar' && b.title.startsWith('Practice topics'))
  const practice = practiceAt >= 0 ? unit.blocks[practiceAt + 1] : undefined
  const topics = unit.mock ? [...unit.mock.writing.topics]
    : practice?.t === 'bullets' ? practice.items.map(it => it.replace(/^\d+\.\s*/, ''))
    : []

  useEffect(() => {
    if (unit.mock && !state?.startedAt) update(s => ({ ...s, startedAt: Date.now() }))
  }, [unit.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="sticky top-[60px] z-10 -mx-4 px-4 py-2.5 border-b border-black/5 shadow-[0_4px_12px_-8px_rgba(0,0,0,0.25)]" style={{ background: 'var(--ic-cream)' }} dir="rtl">
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={onBack} aria-label="رجوع" className="w-9 h-9 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shrink-0"><ArrowRight size={18} /></button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="rounded-md px-1.5 py-[1px] text-[10.5px] font-black text-white" style={{ background: c }} dir="ltr">{unit.tag}</span>
              <span className="text-[13.5px] font-black truncate">{unit.titleAr}</span>
            </div>
            {score.gradable > 0 && (
              <div className="mt-1 flex items-center gap-2">
                <span className="flex-1 h-1.5 rounded-full bg-black/10 overflow-hidden"><span className="block h-full rounded-full transition-all" style={{ width: `${(score.checked / score.gradable) * 100}%`, background: c }} /></span>
                <span className="text-[11px] font-bold text-zinc-500">{score.checked}/{score.gradable} تمارين</span>
              </div>
            )}
          </div>
        </div>
        {unit.mock && <MockClock startedAt={state?.startedAt} onRestart={() => update(s => ({ ...s, startedAt: Date.now() }))} colour={c} />}
      </div>

      <div className="pt-4">
        <LessonBlocks blocks={blocks} section={unit.section} exercise={b => {
          const ex = byBlock.get(b)
          return ex ? (
            <BacExercise ex={ex} no={exNo.get(b) ?? 0} text={text} section={unit.section} state={state?.ex[ex.key]}
              onChange={s => update(st => ({ ...st, ex: { ...st.ex, [ex.key]: s } }))} />
          ) : null
        }} />
      </div>

      {topics.length > 0 && (
        <WritingBox topics={topics} scored={!!unit.mock} colour={c} soft={soft} value={state?.writing}
          onChange={w => update(s => ({ ...s, writing: w }))} />
      )}

      {unit.mock && <MockResult exercises={exercises} state={state} />}

      {score.gradable === 0 && (
        <button type="button" onClick={() => update(s => ({ ...s, read: !s.read }))} dir="rtl"
          className={`mt-5 w-full rounded-2xl py-3.5 text-[14.5px] font-black flex items-center justify-center gap-2 ${state?.read ? 'bg-emerald-600 text-white' : 'bg-white border-2'}`}
          style={state?.read ? undefined : { borderColor: c, color: c }}>
          <Check size={18} /> {state?.read ? 'أنهيت هذا الدرس' : 'قرأت هذا الدرس وفهمته'}
        </button>
      )}

      {next && (
        <button type="button" onClick={onNext} dir="rtl"
          className="mt-3 w-full rounded-2xl py-3.5 px-4 bg-[var(--ic-dark)] text-white flex items-center gap-3 active:scale-[0.99] transition">
          <span className="flex-1 text-right">
            <span className="block text-[11px] text-white/60 font-bold">الدرس التالي</span>
            <span className="block text-[14.5px] font-black">{next.titleAr} <span dir="ltr" className="text-white/60 text-[12px]">· {next.tag}</span></span>
          </span>
          <ArrowLeft size={20} className="text-[var(--ic-gold)]" />
        </button>
      )}
    </div>
  )
}

function MockClock({ startedAt, onRestart, colour }: { startedAt?: number; onRestart: () => void; colour: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  const secs = startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0
  const hh = Math.floor(secs / 3600), mm = Math.floor((secs % 3600) / 60), ss = secs % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <div className="mt-2 flex items-center gap-2 text-[12px] font-bold text-zinc-500">
      <Timer size={15} style={{ color: colour }} />
      <span>الوقت المنقضي</span>
      <span dir="ltr" className="font-black text-[13.5px] tabular-nums" style={{ color: colour }}>{pad(hh)}:{pad(mm)}:{pad(ss)}</span>
      <span className="text-zinc-400 hidden sm:inline">· تدرّب في نفس مدة امتحانك</span>
      <button type="button" onClick={onRestart} className="mr-auto inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-600"><RotateCcw size={13} /> من جديد</button>
    </div>
  )
}

function WritingBox({ topics, scored, colour, soft, value, onChange }: {
  topics: string[]; scored: boolean; colour: string; soft: string; value?: WritingState; onChange: (w: WritingState) => void
}) {
  const w: WritingState = value ?? { topic: 0, text: '', checklist: WRITING_CHECKLIST.map(() => false) }
  const words = wordCount(w.text)
  return (
    <section className="mt-4 rounded-3xl bg-white border border-zinc-100 shadow-sm overflow-hidden">
      <header className="px-4 py-3 flex items-center gap-2" style={{ background: soft }} dir="rtl">
        <PenLine size={18} style={{ color: colour }} />
        <span className="font-black text-[15px]">{scored ? 'الكتابة (10 نقاط)' : 'اكتب موضوعك'}</span>
        <span className="mr-auto text-[11.5px] font-bold text-zinc-500">يُحفظ على جهازك</span>
      </header>
      <div className="p-4 space-y-3">
        <p className="text-[12.5px] font-bold text-zinc-500" dir="rtl">اختر موضوعًا واحدًا:</p>
        <div className="grid gap-1.5 max-h-80 overflow-y-auto" dir="ltr">
          {topics.map((t, i) => (
            <button key={i} type="button" onClick={() => onChange({ ...w, topic: i })}
              className={`text-left rounded-2xl border-2 px-3 py-2 text-[13.5px] font-semibold leading-snug ${w.topic === i ? '' : 'border-zinc-100'}`}
              style={w.topic === i ? { borderColor: colour, background: soft } : undefined}>
              <b style={{ color: colour }}>{i + 1}.</b> {t}
            </button>
          ))}
        </div>
        <textarea value={w.text} onChange={e => onChange({ ...w, text: e.target.value })} rows={10} dir="ltr"
          placeholder="Write your text here: an introduction, two body paragraphs and a conclusion…"
          className="w-full rounded-2xl border-2 border-zinc-200 bg-zinc-50 px-3.5 py-3 text-[14.5px] leading-relaxed outline-none focus:bg-white" />
        <div className="flex items-center justify-between text-[12px] font-bold" dir="rtl">
          <span className={words >= 150 ? 'text-emerald-600' : 'text-zinc-400'}>{words} كلمة {words < 150 ? '· الهدف حوالي 150 إلى 200' : '✓'}</span>
        </div>
        <div className="rounded-2xl bg-zinc-50 p-3" dir="rtl">
          <p className="text-[12.5px] font-black mb-2">راجع نصّك قبل التسليم{scored ? ' (نقطتان لكل معيار)' : ''}:</p>
          <div className="space-y-1.5">
            {WRITING_CHECKLIST.map((label, i) => (
              <label key={i} className="flex items-center gap-2 text-[13px] font-semibold cursor-pointer">
                <input type="checkbox" checked={!!w.checklist[i]} onChange={e => onChange({ ...w, checklist: WRITING_CHECKLIST.map((_, k) => (k === i ? e.target.checked : !!w.checklist[k])) })}
                  className="w-4 h-4" style={{ accentColor: colour }} />
                {label}
              </label>
            ))}
          </div>
          {scored && <p className="mt-2 text-[12.5px] font-black" style={{ color: colour }}>نقطتك الذاتية في الكتابة: {writingPoints(w)}/10</p>}
        </div>
      </div>
    </section>
  )
}

function MockResult({ exercises, state }: { exercises: PracticeExercise[]; state?: UnitState }) {
  const score = unitScore(exercises, state)
  const pts = exercises.map(e => exercisePoints(e, state?.ex[e.key]))
  const reading = pts.slice(0, 5).reduce((a, b) => a + b, 0)
  const language = pts.slice(5).reduce((a, b) => a + b, 0)
  const writing = writingPoints(state?.writing)
  const total = reading + language + writing
  const fmt = (n: number) => (Math.round(n * 4) / 4).toString()
  return (
    <section className="mt-4 rounded-3xl bg-[var(--ic-dark)] text-white p-5" dir="rtl">
      <p className="text-[13px] font-bold text-white/60">نتيجة الامتحان التجريبي</p>
      {score.done ? (
        <>
          <p className="mt-1 text-[34px] font-black leading-none" style={{ color: 'var(--ic-gold)' }}><span dir="ltr">{fmt(total / 2)}/20</span></p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[['الفهم', reading, 15], ['اللغة', language, 15], ['الكتابة', writing, 10]].map(([label, v, max]) => (
              <div key={label as string} className="rounded-2xl bg-white/10 py-2">
                <div className="text-[11px] text-white/60 font-bold">{label}</div>
                <div className="text-[16px] font-black" dir="ltr">{fmt(v as number)}/{max}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] text-white/50">الفهم واللغة صُحّحا تلقائيًا (أول محاولة)؛ الكتابة تقييمك الذاتي.</p>
        </>
      ) : (
        <p className="mt-1 text-[14px] font-bold">أكمل التمارين الثمانية لتظهر نقطتك من 20 <span className="text-white/50" dir="ltr">({score.checked}/{score.gradable})</span></p>
      )}
    </section>
  )
}
