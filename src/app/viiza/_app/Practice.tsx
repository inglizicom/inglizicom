'use client'

import { useMemo, useState } from 'react'
import { Check, Eye, Maximize2, RotateCcw, Stamp, X } from 'lucide-react'
import type { Exercise, Stop } from '@/data/viiza-book/types'
import { mixed, seedOf } from '@/data/viiza-book/shuffle'
import { Ar, Btn, Card, closeness, EN, Head, Ico, Say, same, useAudio, V } from './kit'

/**
 * The practice of a stop, to be done on screen: the printed exercises (the
 * same items, mixed the same way as the page), each with Check and Show
 * answers; the role-play cues; the survival card, which opens full screen
 * to be shown to an officer, a driver or a waiter; and the passport stamp.
 */

const L = 'abcdefghij'

type Mark = 'ok' | 'bad' | null

function Feedback({ right, total, onRetry, onShow }: { right: number; total: number; onRetry: () => void; onShow: () => void }) {
  const all = right === total
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl px-4 py-2.5" dir="ltr" style={{ background: all ? V.greenS : V.saffS }}>
      <span className="text-[15px] font-extrabold" style={{ color: all ? V.green : V.saffD }}>{all ? 'Perfect! ' : ''}{right} / {total}</span>
      <span className="ml-auto flex gap-2">
        {!all && <button onClick={onShow} className="flex items-center gap-1 text-[13px] font-bold" style={{ color: V.navy }}><Eye size={14} /> Show answers</button>}
        <button onClick={onRetry} className="flex items-center gap-1 text-[13px] font-bold" style={{ color: V.navy }}><RotateCcw size={14} /> Try again</button>
      </span>
    </div>
  )
}

function ExHead({ ex, letter }: { ex: Exercise; letter: string }) {
  return (
    <div className="mb-3 flex items-center gap-2.5" dir="ltr">
      <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-lg text-[14px] font-extrabold text-white" style={{ background: V.navy }}>{letter}</span>
      <span className="text-[15px] font-extrabold">{ex.title[0]}</span>
      <span className="h-px flex-1" style={{ background: V.line }} />
      <Ar as="span" className="text-[14px] font-bold" style={{ color: V.grey }}>{ex.title[1]}</Ar>
    </div>
  )
}

const box = (m: Mark) => (m === 'ok' ? { borderColor: V.green, background: V.greenS } : m === 'bad' ? { borderColor: V.red, background: V.redS } : { borderColor: V.line, background: '#fff' })

function MatchEx({ ex, seed, onScore }: { ex: Extract<Exercise, { t: 'match' }>; seed: number; onScore: (n: number) => void }) {
  const right = useMemo(() => mixed(ex.items.map(i => i[1]), seed), [ex, seed])
  const arRight = right.every(r => /[؀-ۿ]/.test(r))
  const [pick, setPick] = useState<number | null>(null)
  const [pairs, setPairs] = useState<Record<number, number>>({})
  const [checked, setChecked] = useState(false)
  const ok = (l: number) => right[pairs[l]] === ex.items[l][1]
  const score = ex.items.filter((_, l) => ok(l)).length
  const choose = (r: number) => {
    if (pick === null || checked) return
    setPairs(p => { const n = { ...p }; for (const k of Object.keys(n)) if (n[+k] === r) delete n[+k]; n[pick] = r; return n })
    setPick(null)
  }
  const used = new Set(Object.values(pairs))
  return (
    <div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2" dir="ltr">
        <div className="space-y-2">
          {ex.items.map(([left], l) => (
            <button key={l} onClick={() => !checked && setPick(l)} className="flex w-full items-center gap-2 rounded-xl border-2 px-3 py-2 text-left text-[14px] font-bold transition"
              style={pick === l ? { borderColor: V.navy, background: V.navyS } : box(checked ? (ok(l) ? 'ok' : 'bad') : null)}>
              <span className="w-[16px] text-[12px] font-extrabold" style={{ color: V.red }}>{l + 1}</span>
              <span className="flex-1">{left}</span>
              <span className="min-w-[22px] rounded-md px-1.5 text-center text-[12px] font-extrabold" style={{ background: pairs[l] !== undefined ? V.navy : V.line, color: pairs[l] !== undefined ? '#fff' : V.grey }}>{pairs[l] !== undefined ? L[pairs[l]] : '?'}</span>
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {right.map((r, k) => (
            <button key={k} onClick={() => choose(k)} className="flex w-full items-center gap-2 rounded-xl border-2 px-3 py-2 text-left transition"
              style={{ borderColor: pick !== null ? V.saff : V.line, background: used.has(k) ? V.cream : '#fff', opacity: used.has(k) && pick === null ? 0.65 : 1 }}>
              <span className="w-[14px] text-[12px] font-extrabold" style={{ color: V.navy }}>{L[k]}</span>
              {arRight ? <Ar className="flex-1 text-[14px] font-semibold">{r}</Ar> : <span className="flex-1 text-[14px] font-semibold">{r}</span>}
            </button>
          ))}
        </div>
      </div>
      <Ar className="mt-2 text-[12.5px] font-semibold" style={{ color: V.grey }}>اختر كلمة من اليسار، ثم معناها من اليمين.</Ar>
      {!checked
        ? <div className="mt-3" dir="ltr"><Btn onClick={() => { setChecked(true); onScore(score) }} disabled={Object.keys(pairs).length < ex.items.length}>Check</Btn></div>
        : <Feedback right={score} total={ex.items.length} onRetry={() => { setPairs({}); setChecked(false) }}
            onShow={() => setPairs(Object.fromEntries(ex.items.map(([, r], l) => [l, right.indexOf(r)])))} />}
    </div>
  )
}

function GapsEx({ ex, seed, onScore }: { ex: Extract<Exercise, { t: 'gaps' }>; seed: number; onScore: (n: number) => void }) {
  const bank = useMemo(() => mixed(ex.items.map(i => i[1]), seed), [ex, seed])
  const [vals, setVals] = useState<string[]>(ex.items.map(() => ''))
  const [checked, setChecked] = useState(false)
  const ok = (k: number) => same(vals[k], ex.items[k][1])
  const score = ex.items.filter((_, k) => ok(k)).length
  return (
    <div dir="ltr">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {bank.map(w => <span key={w} className="rounded-lg px-2.5 py-1 text-[13px] font-extrabold" style={{ background: V.saffS, border: `1px solid ${V.saff}`, opacity: vals.some(v => same(v, w)) ? 0.4 : 1 }}>{w}</span>)}
      </div>
      <div className="space-y-2.5">
        {ex.items.map(([q], k) => {
          const [a, b] = q.split('___')
          return (
            <div key={k} className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[15px] font-semibold">
              <span className="w-[18px] text-[13px] font-extrabold" style={{ color: V.red }}>{k + 1}</span>
              <span>{a}</span>
              <input value={vals[k]} onChange={e => !checked && setVals(v => v.map((x, i) => (i === k ? e.target.value : x)))} autoCapitalize="off" autoCorrect="off" spellCheck={false}
                className="w-[140px] rounded-lg border-2 px-2 py-1 text-[15px] font-bold outline-none" style={{ ...box(checked ? (ok(k) ? 'ok' : 'bad') : null), fontFamily: EN }} />
              <span>{b}</span>
            </div>
          )
        })}
      </div>
      {!checked
        ? <div className="mt-3"><Btn onClick={() => { setChecked(true); onScore(score) }} disabled={vals.every(v => !v.trim())}>Check</Btn></div>
        : <Feedback right={score} total={ex.items.length} onRetry={() => { setVals(ex.items.map(() => '')); setChecked(false) }} onShow={() => setVals(ex.items.map(i => i[1]))} />}
    </div>
  )
}

function ChooseEx({ ex, onScore }: { ex: Extract<Exercise, { t: 'choose' }>; onScore: (n: number) => void }) {
  const [sel, setSel] = useState<Record<number, number>>({})
  const [checked, setChecked] = useState(false)
  const score = ex.items.filter(([, , r], k) => sel[k] === r).length
  return (
    <div dir="ltr">
      <div className="space-y-3">
        {ex.items.map(([q, opts, r], k) => (
          <div key={k}>
            <div className="flex items-baseline gap-2 text-[15px] font-bold"><span className="w-[18px] text-[13px] font-extrabold" style={{ color: V.red }}>{k + 1}</span>{q}</div>
            <div className="ml-[26px] mt-1.5 flex flex-wrap gap-2">
              {opts.map((o, i) => {
                const mark: Mark = checked ? (i === r ? 'ok' : sel[k] === i ? 'bad' : null) : null
                return (
                  <button key={i} onClick={() => !checked && setSel(s => ({ ...s, [k]: i }))} className="rounded-xl border-2 px-3 py-1.5 text-[14px] font-semibold transition"
                    style={!checked && sel[k] === i ? { borderColor: V.navy, background: V.navy, color: '#fff' } : box(mark)}>
                    <b style={{ color: !checked && sel[k] === i ? V.saff : V.navy }}>{L[i]})</b> {o}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      {!checked
        ? <div className="mt-3"><Btn onClick={() => { setChecked(true); onScore(score) }} disabled={Object.keys(sel).length < ex.items.length}>Check</Btn></div>
        : <Feedback right={score} total={ex.items.length} onRetry={() => { setSel({}); setChecked(false) }} onShow={() => setSel(Object.fromEntries(ex.items.map(([, , r], k) => [k, r])))} />}
    </div>
  )
}

function SayEx({ ex, onScore }: { ex: Extract<Exercise, { t: 'say' }>; onScore: (n: number) => void }) {
  const [vals, setVals] = useState<string[]>(ex.items.map(() => ''))
  const [checked, setChecked] = useState(false)
  const close = (k: number) => closeness(vals[k], ex.items[k][1]) >= 0.6
  const score = ex.items.filter((_, k) => close(k)).length
  return (
    <div>
      <div className="space-y-3">
        {ex.items.map(([sit, model], k) => (
          <div key={k} className="rounded-xl p-3" style={{ background: V.cream }}>
            <div className="flex items-start gap-2">
              <span className="text-[13px] font-extrabold" style={{ color: V.red }}>{k + 1}</span>
              <Ar className="flex-1 text-[14.5px] font-semibold leading-[1.7]">{sit}</Ar>
            </div>
            <input dir="ltr" value={vals[k]} onChange={e => !checked && setVals(v => v.map((x, i) => (i === k ? e.target.value : x)))} placeholder="Write it in English…"
              className="mt-2 w-full rounded-lg border-2 px-3 py-2 text-[15px] font-semibold outline-none" style={{ ...box(checked ? (close(k) ? 'ok' : 'bad') : null), fontFamily: EN }} />
            {checked && <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[13px] font-bold" dir="ltr" style={{ color: close(k) ? V.green : V.saffD }}>{close(k) ? <Check size={15} /> : <X size={15} />} Model answer: <Say text={model} className="font-extrabold" style={{ color: V.navy }} /></div>}
          </div>
        ))}
      </div>
      <Ar className="mt-2 text-[12.5px] font-semibold" style={{ color: V.grey }}>جمل أخرى صحيحة مقبولة أيضًا: قارن جملتك بالنموذج.</Ar>
      {!checked
        ? <div className="mt-3" dir="ltr"><Btn onClick={() => { setChecked(true); onScore(score) }} disabled={vals.every(v => !v.trim())}>Check</Btn></div>
        : <Feedback right={score} total={ex.items.length} onRetry={() => { setVals(ex.items.map(() => '')); setChecked(false) }} onShow={() => setVals(ex.items.map(i => i[1]))} />}
    </div>
  )
}

function OrderEx({ ex, seed, onScore }: { ex: Extract<Exercise, { t: 'order' }>; seed: number; onScore: (n: number) => void }) {
  const shown = useMemo(() => mixed(ex.lines, seed), [ex, seed])
  const [seq, setSeq] = useState<number[]>([])
  const [checked, setChecked] = useState(false)
  const score = seq.filter((k, i) => shown[k] === ex.lines[i]).length
  return (
    <div dir="ltr">
      <div className="grid gap-2 md:grid-cols-2">
        {shown.map((l, k) => {
          const pos = seq.indexOf(k)
          return (
            <button key={k} onClick={() => !checked && setSeq(s => (pos >= 0 ? s.filter(x => x !== k) : [...s, k]))}
              className="flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-left text-[14px] font-semibold transition"
              style={pos >= 0 ? (checked ? box(shown[k] === ex.lines[pos] ? 'ok' : 'bad') : { borderColor: V.navy, background: V.navyS }) : box(null)}>
              <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-md text-[12px] font-extrabold" style={pos >= 0 ? { background: V.navy, color: '#fff' } : { background: V.line, color: V.grey }}>{pos >= 0 ? pos + 1 : L[k]}</span>
              <span className="flex-1">{l}</span>
            </button>
          )
        })}
      </div>
      <Ar className="mt-2 text-[12.5px] font-semibold" style={{ color: V.grey }}>اضغط الجمل بترتيب المحادثة: الأولى، ثم الثانية…</Ar>
      {!checked
        ? <div className="mt-3"><Btn onClick={() => { setChecked(true); onScore(score) }} disabled={seq.length < shown.length}>Check</Btn></div>
        : <Feedback right={score} total={shown.length} onRetry={() => { setSeq([]); setChecked(false) }} onShow={() => setSeq(ex.lines.map(l => shown.indexOf(l)))} />}
    </div>
  )
}

function ExerciseView({ ex, letter, seed, onScore }: { ex: Exercise; letter: string; seed: number; onScore: (n: number) => void }) {
  return (
    <Card>
      <ExHead ex={ex} letter={letter} />
      {ex.t === 'match' && <MatchEx ex={ex} seed={seed} onScore={onScore} />}
      {ex.t === 'gaps' && <GapsEx ex={ex} seed={seed} onScore={onScore} />}
      {ex.t === 'choose' && <ChooseEx ex={ex} onScore={onScore} />}
      {ex.t === 'say' && <SayEx ex={ex} onScore={onScore} />}
      {ex.t === 'order' && <OrderEx ex={ex} seed={seed} onScore={onScore} />}
    </Card>
  )
}

/** The survival card, full screen: big English to show someone, the Arabic small under it. */
function ShowCard({ s, onClose }: { s: Stop; onClose: () => void }) {
  const [i, setI] = useState(0)
  const { play } = useAudio()
  const [en, ar] = s.card[i]
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: V.cream }} dir="ltr">
      <div className="flex items-center justify-between px-4 py-3" style={{ background: V.red, color: '#fff' }}>
        <span className="text-[13px] font-extrabold tracking-[0.12em]">SURVIVAL CARD · SHOW THIS</span>
        <button onClick={onClose} className="rounded-full bg-white/15 p-2"><X size={20} /></button>
      </div>
      <button className="flex flex-1 flex-col items-center justify-center px-6 text-center" onClick={() => play(en)}>
        <div className="text-[38px] font-extrabold leading-tight sm:text-[56px]" style={{ color: V.navy }}>{en.replace(/_{3,}/g, '……')}</div>
        <Ar className="mt-5 text-[20px] font-bold" style={{ color: V.grey }}>{ar}</Ar>
        <div className="mt-6 text-[12px] font-bold" style={{ color: V.grey }}>Tap to hear it</div>
      </button>
      <div className="flex items-center justify-center gap-2 p-4">
        {s.card.map((_, k) => <button key={k} onClick={() => setI(k)} className="h-[12px] rounded-full transition-all" style={{ width: k === i ? 34 : 12, background: k === i ? V.red : V.line }} aria-label={`Line ${k + 1}`} />)}
      </div>
    </div>
  )
}

export function Practice({ s, done, onScore, onFinish }: { s: Stop; done: boolean; onScore: (key: string, v: number) => void; onFinish: () => void }) {
  const [show, setShow] = useState(false)
  const [stamped, setStamped] = useState(false)
  return (
    <div className="space-y-4">
      {s.practice.map((ex, i) => <ExerciseView key={i} ex={ex} letter={'ABC'[i]} seed={seedOf(s.n, i)} onScore={v => onScore(`ex${i}`, v)} />)}

      <Card>
        <Head icon="Users" en="Role-play in pairs" ar="مثّل الموقف مع زميلك" color={V.navy} />
        <div className="grid gap-3 md:grid-cols-2" dir="ltr">
          {[{ who: 'Student A · the traveller', ar: 'المسافر', cues: s.roleplay.a, color: V.red, tint: V.redS }, { who: `Student B · ${s.roleplay.role[0]}`, ar: s.roleplay.role[1], cues: s.roleplay.b, color: V.navy, tint: V.navyS }].map(c => (
            <div key={c.who} className="overflow-hidden rounded-xl" style={{ border: `1.5px solid ${c.color}` }}>
              <div className="flex items-center justify-between px-3 py-2" style={{ background: c.tint }}>
                <span className="text-[12px] font-extrabold uppercase tracking-[0.06em]" style={{ color: c.color }}>{c.who}</span>
                <Ar as="span" className="text-[12.5px] font-bold" style={{ color: c.color }}>{c.ar}</Ar>
              </div>
              <div className="space-y-2 p-3">
                {c.cues.map(([en, ar], k) => (
                  <div key={k} className="flex gap-2"><span className="text-[12px] font-extrabold" style={{ color: c.color }}>{k + 1}</span><div><div className="text-[14px] font-bold">{en}</div><Ar className="text-left text-[12.5px] font-semibold" style={{ color: V.grey }}>{ar}</Ar></div></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="overflow-hidden rounded-2xl border-2 border-dashed p-1.5" style={{ borderColor: V.red }}>
        <div className="overflow-hidden rounded-xl" style={{ background: V.cream }}>
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-white" style={{ background: V.red }} dir="ltr">
            <div className="leading-tight"><div className="text-[15px] font-extrabold tracking-[0.1em]">SURVIVAL CARD</div><div className="text-[11.5px] font-bold opacity-85">Show it or read it aloud</div></div>
            <button onClick={() => setShow(true)} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-extrabold" style={{ background: V.saff, color: V.navy }}><Maximize2 size={14} /> Show full screen</button>
          </div>
          <div className="divide-y px-4 py-1" style={{ borderColor: V.line }} dir="ltr">
            {s.card.map(([en, ar]) => (
              <div key={en} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-0.5 py-2.5" style={{ borderColor: V.line }}>
                <Say text={en} className="text-[16px] font-extrabold">{en.replace(/_{3,}/g, '……')}</Say>
                <Ar className="text-[13.5px] font-bold" style={{ color: V.grey }}>{ar}</Ar>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl p-5 text-center sm:p-7" style={{ background: V.navy, color: '#fff' }}>
        {done || stamped ? (
          <div className="flex flex-col items-center">
            <div className="flex h-[110px] w-[110px] -rotate-12 flex-col items-center justify-center rounded-full" style={{ border: `4px double ${V.saff}`, color: V.saff, animation: 'vz-stamp .5s ease-out' }}>
              <Ico name={s.icon} size={30} color={V.saff} />
              <span className="mt-1 text-[12px] font-extrabold tracking-[0.1em]">STOP {String(s.n).padStart(2, '0')}</span>
            </div>
            <div className="mt-3 text-[20px] font-extrabold" dir="ltr">Stamped! Stop {s.n} is in your passport.</div>
            <Ar className="mt-1 text-[14px] font-bold text-white/70">أحسنت! جرّب ألعاب المحطة، ثم انتقل إلى المحطة التالية.</Ar>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Stamp size={34} color={V.saff} />
            <div className="mt-2 text-[20px] font-extrabold" dir="ltr">Finished this stop?</div>
            <Ar className="mt-1 text-[14px] font-bold text-white/70">أنهيت التمارين؟ اختم جوازك واحصل على ختم المحطة.</Ar>
            <button dir="ltr" onClick={() => { setStamped(true); onFinish() }} className="mt-4 rounded-2xl px-6 py-3 text-[16px] font-extrabold transition active:scale-95" style={{ background: V.saff, color: V.navy }}>Stamp my passport</button>
          </div>
        )}
      </div>

      {show && <ShowCard s={s} onClose={() => setShow(false)} />}
    </div>
  )
}
