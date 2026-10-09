'use client'

import { Fragment, useState, type ReactNode } from 'react'
import { Check, X, RotateCcw, Eye, Sparkles, FileText } from 'lucide-react'
import {
  checkExercise, freshState, isAnswered, sentences, shownAnswer,
  type ExerciseState, type Mark, type PracticeExercise, type PracticeItem, type Response,
} from '@/lib/bac-practice'
import type { BacSection } from '@/data/bac/bac-helpers'
import { Line, SECTION_COLOUR } from './BacBlocks'

/**
 * One Bac exercise, done on the phone. Each item type has its own control
 * (lib/bac-practice.ts decides which): choices are tapped, blanks typed or
 * filled from a word bank, words and proving sentences tapped in the text,
 * sentences rewritten. The first check grades; wrong items can be fixed and
 * checked again, and the answers revealed. A typed answer the checker does
 * not recognise can be compared with the model and accepted by the student.
 */

const done = (m: Mark | null) => m === 'ok' || m === 'self' || m === 'fixed'

export default function BacExercise({ ex, no, text, state, onChange, section }: {
  ex: PracticeExercise; no: number; text: string[]; state?: ExerciseState
  onChange: (s: ExerciseState) => void; section: BacSection
}) {
  const s = state ?? freshState(ex)
  const { c, soft } = SECTION_COLOUR[section]
  const [active, setActive] = useState(0)   // word bank: the blank the next word goes to

  const frozen = (i: number) => !ex.open && (done(s.marks[i]) || s.revealed)
  const respond = (i: number, r: Response) => {
    if (frozen(i)) return
    onChange({ ...s, responses: s.responses.map((x, k) => (k === i ? r : x)) })
  }
  const accept = (i: number) => onChange({ ...s, marks: s.marks.map((m, k) => (k === i && m === 'wrong' ? 'self' : m)) })
  const right = s.marks.filter(m => m === 'ok' || m === 'self').length
  const wrong = s.marks.filter(m => m === 'wrong').length
  const answered = ex.items.filter((it, i) => isAnswered(it, s.responses[i] ?? [])).length
  const allAnswered = answered === ex.items.length
  // The printed instruction ("copy the words…") is for paper; on screen the student taps.
  const instr = ex.items.some(it => it.kind === 'tf') ? 'اختر True أو False، ثم اضغط على الجملة من النص التي تثبت جوابك.'
    : ex.items.some(it => it.kind === 'find') ? 'اضغط على الكلمة المناسبة في الفقرة المذكورة.'
    : ex.bank ? '' : ex.instr

  const pickWord = (w: string) => {
    const i = active
    if (frozen(i)) return
    respond(i, [w])
    const next = ex.items.findIndex((_, k) => k > i && !frozen(k) && !s.responses[k]?.[0])
    setActive(next >= 0 ? next : i)
  }

  return (
    <section className="rounded-3xl bg-white border border-zinc-100 shadow-sm overflow-hidden" dir="ltr">
      <header className="px-4 pt-3.5 pb-2.5 border-b border-zinc-100" style={{ background: soft }}>
        <div className="flex items-center gap-2">
          <span className="rounded-lg px-2 py-0.5 text-[11.5px] font-black text-white" style={{ background: c }}>Exercise {no}</span>
          {s.checked && !ex.open && (
            <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[12px] font-black ${right === ex.items.length ? 'bg-emerald-600 text-white' : 'bg-white text-zinc-700'}`}>{right}/{ex.items.length}</span>
          )}
        </div>
        <Line s={ex.title} className="mt-1.5 text-[15.5px] font-black leading-snug" />
        {instr && <Line s={instr} className="mt-0.5 text-[12.5px] text-zinc-500 font-semibold" />}
      </header>

      {ex.bank && (
        <div className="px-4 pt-3">
          <p className="text-[11.5px] font-bold text-zinc-400 mb-1.5 text-right" dir="rtl">اضغط على فراغ، ثم على الكلمة المناسبة</p>
          <div className="flex flex-wrap gap-1.5">
            {ex.bank.map(w => {
              const used = s.responses.some(r => r[0] === w)
              return (
                <button key={w} type="button" onClick={() => pickWord(w)}
                  className={`rounded-xl border-2 px-2.5 py-1 text-[13.5px] font-bold transition active:scale-95 ${used ? 'opacity-40' : ''}`}
                  style={{ borderColor: c, color: c }}>{w}</button>
              )
            })}
          </div>
        </div>
      )}

      <ol className="p-3 flex flex-col gap-2">
        {ex.items.map((it, i) => {
          const m = s.marks[i]
          const tone = ex.open || !m ? 'border-zinc-100' : done(m) ? 'border-emerald-300 bg-emerald-50/50' : 'border-rose-300 bg-rose-50/40'
          return (
            <li key={i} className={`rounded-2xl border px-3 py-2.5 transition-colors ${tone}`}>
              <div className="flex gap-2">
                <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11.5px] font-black ${m && !ex.open ? (done(m) ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white') : 'bg-zinc-100 text-zinc-500'}`}>
                  {m && !ex.open ? (done(m) ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />) : i + 1}
                </span>
                <div className="flex-1 min-w-0 text-[14.5px] leading-relaxed">
                  <ItemView item={it} r={s.responses[i] ?? []} set={r => respond(i, r)} frozen={frozen(i)} text={text} colour={c}
                    activeBlank={ex.bank ? active === i : false} onBlank={() => { if (!frozen(i)) setActive(i) }} mark={m} />
                  <Feedback item={it} mark={m} tries={s.tries[i] ?? 0} revealed={s.revealed} onAccept={() => accept(i)} />
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <footer className="px-4 pb-4 flex flex-wrap items-center gap-2" dir="rtl">
        {ex.open ? (
          <span className="text-[12.5px] font-bold text-zinc-400 flex items-center gap-1"><Check size={14} /> يُحفظ تلقائيًا على جهازك</span>
        ) : !s.checked ? (
          <button type="button" onClick={() => onChange(checkExercise(ex, s, text))} disabled={!allAnswered}
            className="flex-1 rounded-2xl py-3 text-[14.5px] font-black text-white disabled:opacity-40 active:scale-[0.98] transition" style={{ background: c }}>
            {allAnswered ? 'تحقّق من أجوبتي' : `أجب عن كل الأسئلة (${answered}/${ex.items.length})`}
          </button>
        ) : (
          <>
            {wrong > 0 && !s.revealed && (
              <button type="button" onClick={() => onChange(checkExercise(ex, s, text))}
                className="flex-1 rounded-2xl py-3 text-[14px] font-black text-white active:scale-[0.98] transition" style={{ background: c }}>
                صحّحت أخطائي، تحقّق مجددًا
              </button>
            )}
            {wrong > 0 && !s.revealed && (
              <button type="button" onClick={() => onChange({ ...s, revealed: true })}
                className="rounded-2xl px-3.5 py-3 text-[13px] font-bold bg-zinc-100 text-zinc-600 flex items-center gap-1.5"><Eye size={15} /> الحلول</button>
            )}
            {wrong === 0 && <span className="flex-1 text-[13.5px] font-black text-emerald-700 flex items-center gap-1.5"><Sparkles size={16} /> {right === ex.items.length ? 'ممتاز! كل الأجوبة صحيحة' : 'أحسنت، صحّحت كل أخطائك'}</span>}
            <button type="button" onClick={() => { onChange(freshState(ex)); setActive(0) }}
              className="rounded-2xl px-3.5 py-3 text-[13px] font-bold bg-zinc-100 text-zinc-600 flex items-center gap-1.5"><RotateCcw size={15} /> من جديد</button>
          </>
        )}
      </footer>
    </section>
  )
}

/** A question whose "___" become whatever `fill` draws for blank k. */
function Q({ q, fill }: { q: string; fill?: (k: number) => ReactNode }) {
  const parts = q.split('___')
  return <span>{parts.map((p, k) => <Fragment key={k}>{k > 0 && (fill ? fill(k - 1) : <span className="inline-block w-14 border-b-2 border-zinc-300 mx-1" />)}{p}</Fragment>)}</span>
}

function Slot({ value, active, colour, onClick }: { value?: string; active?: boolean; colour: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex min-w-[64px] justify-center mx-1 px-2 rounded-lg border-b-2 font-bold align-baseline ${active ? 'ring-2 ring-offset-1' : ''}`}
      style={{ borderColor: colour, color: value ? colour : '#a1a1aa', background: value ? 'transparent' : '#f4f4f5', ['--tw-ring-color' as string]: colour }}>
      {value || '…'}
    </button>
  )
}

function ItemView({ item, r, set, frozen, text, colour, activeBlank, onBlank, mark }: {
  item: PracticeItem; r: Response; set: (r: Response) => void; frozen: boolean; text: string[]; colour: string
  activeBlank: boolean; onBlank: () => void; mark: Mark | null
}) {
  switch (item.kind) {
    case 'choice': return (
      <div>
        <Q q={item.q} fill={() => <Slot value={r[0]} colour={colour} />} />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(item.options ?? []).map(o => {
            const chosen = r[0] === o
            const style = chosen && mark ? (done(mark) ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-rose-500 border-rose-500 text-white') : chosen ? 'text-white' : 'bg-white text-zinc-700 border-zinc-200'
            return (
              <button key={o} type="button" disabled={frozen} onClick={() => set([o])} dir="auto"
                className={`rounded-xl border-2 px-3 py-1.5 text-[13.5px] font-bold text-start leading-snug transition active:scale-[0.97] disabled:cursor-default ${style}`}
                style={chosen && !mark ? { background: colour, borderColor: colour } : undefined}>{o}</button>
            )
          })}
        </div>
      </div>
    )
    case 'tf': return <TrueFalse item={item} r={r} set={set} frozen={frozen} text={text} colour={colour} />
    case 'find': {
      const para = text[(item.para ?? 1) - 1] ?? ''
      return (
        <div>
          <Q q={item.q} fill={() => <Slot value={r[0]} colour={colour} />} />
          <p className="mt-2 rounded-xl bg-zinc-50 px-3 py-2 text-[13.5px] leading-[1.9]">
            <span className="text-[10.5px] font-black text-zinc-400 mr-1">§{item.para}</span>
            {para.split(/(\s+)/).map((tok, k) => {
              const w = tok.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, '')
              if (!w) return <Fragment key={k}>{tok}</Fragment>
              const on = r[0] === w
              return (
                <button key={k} type="button" disabled={frozen} onClick={() => set([w])}
                  className={`rounded px-[1px] transition ${on ? 'text-white' : 'hover:bg-zinc-200'}`} style={on ? { background: colour } : undefined}>{tok}</button>
              )
            })}
          </p>
          {!r[0] && !frozen && <p className="mt-1 text-[11.5px] font-bold text-zinc-400 text-right" dir="rtl">اضغط على الكلمة في الفقرة</p>}
        </div>
      )
    }
    case 'bank': return <Q q={item.q} fill={() => <Slot value={r[0]} colour={colour} active={activeBlank && !frozen} onClick={onBlank} />} />
    case 'gap': return (
      <Q q={item.q} fill={k => (
        <input value={r[k] ?? ''} disabled={frozen} autoCapitalize="off" autoCorrect="off" spellCheck={false}
          onChange={e => { const next = [...r]; next[k] = e.target.value; set(next) }}
          size={Math.max(7, (r[k] ?? '').length + 1)}
          className="mx-1 px-1.5 py-0.5 rounded-lg border-b-2 bg-zinc-50 font-bold text-[14px] outline-none focus:bg-white disabled:bg-transparent align-baseline max-w-full"
          style={{ borderColor: colour, color: colour }} />
      )} />
    )
    case 'rewrite':
    case 'free':
    case 'open': return (
      <div>
        <Q q={item.q} />
        <textarea value={r[0] ?? ''} disabled={frozen} onChange={e => set([e.target.value])} rows={item.kind === 'rewrite' ? 2 : 3}
          autoCapitalize="sentences" spellCheck={false} placeholder={item.kind === 'open' ? 'Write your notes…' : 'Write your answer…'}
          className="mt-2 w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 px-3 py-2 text-[14px] font-semibold outline-none focus:bg-white disabled:bg-white resize-y"
          style={{ ['--tw-border-opacity' as string]: 1 }} onFocus={e => { e.currentTarget.style.borderColor = colour }} onBlur={e => { e.currentTarget.style.borderColor = '' }} />
      </div>
    )
  }
}

function TrueFalse({ item, r, set, frozen, text, colour }: {
  item: PracticeItem; r: Response; set: (r: Response) => void; frozen: boolean; text: string[]; colour: string
}) {
  const [open, setOpen] = useState(false)
  const list = sentences(text)
  const chosen = r[1] != null && r[1] !== '' ? list[Number(r[1])] : null
  return (
    <div>
      <Q q={item.q} />
      <div className="mt-2 flex gap-1.5">
        {(['T', 'F'] as const).map(v => (
          <button key={v} type="button" disabled={frozen} onClick={() => set([v, r[1] ?? ''])}
            className={`rounded-xl border-2 px-4 py-1.5 text-[13.5px] font-black transition active:scale-95 ${r[0] === v ? 'text-white' : 'bg-white text-zinc-600 border-zinc-200'}`}
            style={r[0] === v ? { background: colour, borderColor: colour } : undefined}>{v === 'T' ? 'True' : 'False'}</button>
        ))}
      </div>
      <div className="mt-2">
        {chosen && <p className="rounded-xl bg-zinc-50 border-l-4 px-3 py-1.5 text-[13px] italic leading-snug" style={{ borderColor: colour }}>“{chosen.text}”</p>}
        {!frozen && (
          <button type="button" onClick={() => setOpen(o => !o)} dir="rtl"
            className="mt-1.5 inline-flex items-center gap-1.5 text-[12.5px] font-bold" style={{ color: colour }}>
            <FileText size={14} /> {chosen ? 'غيّر الجملة' : 'برّر: اختر الجملة التي تثبت جوابك'}
          </button>
        )}
        {open && !frozen && (
          <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-zinc-200 divide-y divide-zinc-100">
            {list.map((sn, k) => (
              <button key={k} type="button" onClick={() => { set([r[0] ?? '', String(k)]); setOpen(false) }}
                className={`w-full text-left px-3 py-2 text-[13px] leading-snug hover:bg-zinc-50 ${String(k) === r[1] ? 'font-bold' : ''}`}>
                <span className="text-[10.5px] font-black text-zinc-400 mr-1.5">§{sn.para}</span>{sn.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/** After a check: what the right answer was, and (typed answers) a way to accept an equivalent one. */
function Feedback({ item, mark, tries, revealed, onAccept }: {
  item: PracticeItem; mark: Mark | null; tries: number; revealed: boolean; onAccept: () => void
}) {
  if (mark !== 'wrong') return mark === 'self' ? <p className="mt-1.5 text-[11.5px] font-bold text-emerald-700 text-right" dir="rtl">قبلتَ جوابك كجواب صحيح</p> : null
  const typed = item.kind === 'rewrite' || item.kind === 'free'
  const show = revealed || (typed && (item.kind === 'free' || tries >= 2))
  if (!show) return <p className="mt-1.5 text-[12px] font-bold text-rose-600 text-right" dir="rtl">ليس بعد. راجع القاعدة وحاول مرة أخرى.</p>
  const answer = item.kind === 'tf' ? `${item.tf === 'T' ? 'True' : 'False'} — “${item.quote}”` : item.kind === 'choice' ? item.correct ?? '' : shownAnswer(item.a)
  return (
    <div className="mt-2 rounded-xl bg-white border border-zinc-200 px-3 py-2">
      <p className="text-[11px] font-black text-zinc-400 text-right" dir="rtl">{typed ? 'نموذج الجواب' : 'الجواب الصحيح'}</p>
      <p className="text-[13.5px] font-bold text-emerald-700">{answer}</p>
      {typed && (
        <button type="button" onClick={onAccept} dir="rtl" className="mt-1.5 text-[12px] font-bold text-zinc-500 underline underline-offset-2">
          جوابي يعني نفس الشيء، اعتبره صحيحًا
        </button>
      )}
    </div>
  )
}
