'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, ChevronLeft, GraduationCap, Smartphone, Play } from 'lucide-react'
import { BAC_BODY, numberExercises, SECTION_NAMES } from '@/data/bac/bac-pack'
import type { BacSection } from '@/data/bac/bac-helpers'
import { BAC_UNITS, loadProgress, saveProgress, unitExercises, unitScore, writingPoints, type BacProgress, type UnitState } from '@/lib/bac-practice'
import { SECTION_COLOUR } from './BacBlocks'
import BacUnitView from './BacUnitView'

/**
 * The student portal's «الباك» tab: the Bac English pack, every exercise done
 * interactively (lib/bac-practice.ts). The open unit lives in the URL hash
 * (#bac/grammar-03), so a refresh keeps it and the phone's Back button returns
 * to the list. Progress is kept on this device, per student code.
 */

const SECTIONS: BacSection[] = ['start', 'reading', 'vocab', 'grammar', 'functions', 'writing', 'exam']
const unitFromHash = () => (typeof window !== 'undefined' ? decodeURIComponent(location.hash.replace(/^#bac\/?/, '').split('/')[0] || '') : '') || null

export default function BacTab({ owner }: { owner: string }) {
  const exNo = useMemo(() => numberExercises(BAC_BODY), [])
  const exercises = useMemo(() => new Map(BAC_UNITS.map(u => [u.id, unitExercises(u, exNo)])), [exNo])
  const [progress, setProgress] = useState<BacProgress>({})
  const [unitId, setUnitId] = useState<string | null>(null)
  const pushed = useRef(false)   // did we open the unit (so Back returns to the list)?

  useEffect(() => { setProgress(loadProgress(owner)) }, [owner])
  useEffect(() => {
    const sync = () => { const id = unitFromHash(); setUnitId(id); if (!id) pushed.current = false }
    sync()
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)   // a link to #bac/… typed or tapped
    return () => { window.removeEventListener('popstate', sync); window.removeEventListener('hashchange', sync) }
  }, [])

  function open(id: string | null) {
    setUnitId(id)
    try { history.pushState({ tab: 'bac' }, '', id ? `#bac/${id}` : '#bac') } catch { /* sandboxed: state only */ }
    pushed.current = !!id
    window.scrollTo({ top: 0 })
  }
  function back() {
    if (pushed.current) { pushed.current = false; history.back(); return }
    // opened straight from a link or a refresh: there is no list entry behind us
    setUnitId(null)
    try { history.replaceState({ tab: 'bac' }, '', '#bac') } catch { /* sandboxed */ }
    window.scrollTo({ top: 0 })
  }
  const update = (id: string) => (fn: (s: UnitState) => UnitState) => setProgress(p => {
    const next = { ...p, [id]: { ...fn(p[id] ?? { ex: {} }), at: new Date().toISOString() } }
    saveProgress(owner, next)
    return next
  })

  const scores = new Map(BAC_UNITS.map(u => [u.id, unitScore(exercises.get(u.id) ?? [], progress[u.id])]))
  const unit = BAC_UNITS.find(u => u.id === unitId)

  if (unit) {
    const i = BAC_UNITS.indexOf(unit)
    const next = BAC_UNITS[i + 1]
    return (
      <BacUnitView key={unit.id} unit={unit} exercises={exercises.get(unit.id) ?? []} exNo={exNo} state={progress[unit.id]}
        update={update(unit.id)} onBack={back} next={next} onNext={() => next && open(next.id)} />
    )
  }

  const doneCount = BAC_UNITS.filter(u => scores.get(u.id)?.done).length
  const graded = BAC_UNITS.map(u => scores.get(u.id)!).filter(s => s.gradable > 0 && s.checked > 0)
  const avg = graded.length ? Math.round(graded.reduce((a, s) => a + s.pct, 0) / graded.length) : null
  const resume = BAC_UNITS.find(u => !scores.get(u.id)?.done)

  return (
    <div className="max-w-3xl mx-auto pb-8">
      <div className="rounded-3xl bg-[var(--ic-dark)] text-white p-5 relative overflow-hidden">
        <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-[var(--ic-gold)] text-black flex items-center justify-center shrink-0"><GraduationCap size={26} /></span>
          <div className="min-w-0">
            {/* a <p>: the portal's global heading colour would paint an <h2> dark on this dark card */}
            <p className="text-[19px] font-black leading-tight text-white">حقيبة الباك · الإنجليزية</p>
            <p className="text-[12px] text-white/60 font-bold">كل الشعب · طبّق ما فهمته في كل درس</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat n={`${doneCount}/${BAC_UNITS.length}`} label="درس مكتمل" />
          <Stat n={avg == null ? '—' : `${avg}%`} label="معدّل أجوبتك" />
          <Stat n={String(BAC_UNITS.filter(u => u.mock && scores.get(u.id)?.done).length) + '/5'} label="امتحانات تجريبية" />
        </div>
        {resume && (
          <button type="button" onClick={() => open(resume.id)}
            className="mt-4 w-full rounded-2xl bg-[var(--ic-gold)] text-black py-3 px-4 flex items-center gap-2 font-black text-[14px] active:scale-[0.99] transition">
            <Play size={16} fill="currentColor" />
            <span className="flex-1 text-right truncate">{doneCount ? 'تابِع' : 'ابدأ'}: {resume.titleAr}</span>
            <span dir="ltr" className="text-[11.5px] opacity-60">{resume.tag}</span>
          </button>
        )}
      </div>

      {SECTIONS.map(sec => {
        const units = BAC_UNITS.filter(u => u.section === sec)
        const { c, soft } = SECTION_COLOUR[sec]
        const secDone = units.filter(u => scores.get(u.id)?.done).length
        return (
          <section key={sec} className="mt-5">
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
              <h3 className="font-black text-[15px]">{SECTION_NAMES[sec][1]}</h3>
              <span dir="ltr" className="text-[11.5px] font-bold text-zinc-400">{SECTION_NAMES[sec][0]}</span>
              <span className="mr-auto text-[11.5px] font-bold text-zinc-400">{secDone}/{units.length}</span>
            </div>
            <div className="rounded-3xl bg-white border border-zinc-100 overflow-hidden divide-y divide-zinc-100">
              {units.map(u => {
                const s = scores.get(u.id)!
                const mockMark = u.mock && s.done ? (s.points + writingPoints(progress[u.id]?.writing)) / 2 : null
                return (
                  <button key={u.id} type="button" onClick={() => open(u.id)} className="w-full flex items-center gap-3 px-3.5 py-3 text-right hover:bg-zinc-50 active:bg-zinc-100 transition">
                    <Ring pct={s.done ? 100 : s.gradable ? (s.checked / s.gradable) * 100 : 0} colour={c} soft={soft} done={s.done} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-black truncate">{u.titleAr}</div>
                      <div className="text-[11.5px] font-bold text-zinc-400 truncate" dir="ltr" style={{ textAlign: 'right' }}>{u.tag} · {u.titleEn}</div>
                    </div>
                    {mockMark != null ? <Pill text={`${Math.round(mockMark * 4) / 4}/20`} colour={c} />
                      : s.checked > 0 && s.gradable > 0 ? <Pill text={`${s.pct}%`} colour={s.pct >= 80 ? '#059669' : s.pct >= 50 ? '#D97706' : '#E11D48'} />
                      : null}
                    <ChevronLeft size={18} className="text-zinc-300 shrink-0" />
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}

      <p className="mt-5 flex items-center justify-center gap-1.5 text-[11.5px] font-bold text-zinc-400"><Smartphone size={13} /> تقدّمك محفوظ على هذا الجهاز</p>
    </div>
  )
}

const Stat = ({ n, label }: { n: string; label: string }) => (
  <div className="rounded-2xl bg-white/10 py-2">
    <div className="text-[17px] font-black" dir="ltr">{n}</div>
    <div className="text-[10.5px] font-bold text-white/60">{label}</div>
  </div>
)

const Pill = ({ text, colour }: { text: string; colour: string }) => (
  <span dir="ltr" className="shrink-0 rounded-full px-2 py-0.5 text-[11.5px] font-black text-white" style={{ background: colour }}>{text}</span>
)

function Ring({ pct, colour, soft, done }: { pct: number; colour: string; soft: string; done: boolean }) {
  if (done) return <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: soft, color: colour }}><CheckCircle2 size={22} /></span>
  const r = 15, len = 2 * Math.PI * r
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" className="shrink-0 -rotate-90">
      <circle cx="18" cy="18" r={r} fill={soft} stroke="#e4e4e7" strokeWidth="3" />
      {pct > 0 && <circle cx="18" cy="18" r={r} fill="none" stroke={colour} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(pct / 100) * len} ${len}`} />}
    </svg>
  )
}
