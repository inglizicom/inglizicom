'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Headphones, Lightbulb, Plane, RotateCcw, Timer, Trophy } from 'lucide-react'
import type { Stop } from '@/data/viiza-book/types'
import { Ar, Btn, Card, EN, same, useAudio, V } from './kit'

/**
 * The games of a stop, made from its own pages:
 *
 * - Gate Rush: what you hear on one side, the replies on the other. Match
 *   them before boarding closes (60 seconds); a wrong match costs 5.
 * - Listen & Type: hear a key word, spell it. A hint shows the Arabic and
 *   the first letter.
 *
 * The best scores are kept in the reader's progress.
 */

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)

export function Games({ s, best, onScore }: { s: Stop; best: Record<string, number>; onScore: (key: string, v: number) => void }) {
  const [game, setGame] = useState<'gate' | 'type'>('gate')
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2" dir="ltr">
        {[
          { k: 'gate' as const, icon: <Plane size={22} />, en: 'Gate Rush', ar: 'سباق البوابة', d: 'Match each sentence to its reply before boarding closes.', b: best[`${s.n}:gate`] },
          { k: 'type' as const, icon: <Headphones size={22} />, en: 'Listen & Type', ar: 'استمع واكتب', d: 'Hear a key word. Spell it.', b: best[`${s.n}:type`] },
        ].map(g => (
          <button key={g.k} onClick={() => setGame(g.k)} className="flex items-start gap-3 rounded-2xl p-4 text-left transition"
            style={game === g.k ? { background: V.navy, color: '#fff', boxShadow: '0 8px 24px rgba(14,18,64,0.25)' } : { background: '#fff', color: V.navy, border: `1.5px solid ${V.line}` }}>
            <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl" style={{ background: V.saff, color: V.navy }}>{g.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2"><span className="text-[17px] font-extrabold">{g.en}</span><Ar as="span" className="text-[13px] font-bold" style={{ color: game === g.k ? V.saff : V.red }}>{g.ar}</Ar></span>
              <span className="mt-0.5 block text-[13px] font-semibold opacity-75">{g.d}</span>
              {g.b !== undefined && <span className="mt-1 flex items-center gap-1 text-[12px] font-extrabold" style={{ color: game === g.k ? V.saff : V.saffD }}><Trophy size={13} /> Best: {g.b}</span>}
            </span>
          </button>
        ))}
      </div>
      {game === 'gate' ? <GateRush key={`g${s.n}`} s={s} onScore={v => onScore('gate', v)} /> : <ListenType key={`t${s.n}`} s={s} onScore={v => onScore('type', v)} />}
    </div>
  )
}

/* ── Gate Rush ──────────────────────────────────────────────────────── */

function GateRush({ s, onScore }: { s: Stop; onScore: (v: number) => void }) {
  const { play } = useAudio()
  const pairs = useMemo(() => (s.more ? s.more.replies.map((r, i) => ({ id: i, cue: s.hear[i][0], reply: r[0] })) : []), [s])
  const [state, setState] = useState<'ready' | 'run' | 'end'>('ready')
  const [left, setLeft] = useState(60)
  const [cues, setCues] = useState(pairs)
  const [replies, setReplies] = useState(pairs)
  const [done, setDone] = useState<number[]>([])
  const [pick, setPick] = useState<number | null>(null)
  const [wrong, setWrong] = useState<number | null>(null)
  const [points, setPoints] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval>>()

  const start = () => {
    setCues(shuffle(pairs)); setReplies(shuffle(pairs)); setDone([]); setPick(null); setPoints(0); setLeft(60); setState('run')
  }
  useEffect(() => {
    if (state !== 'run') return
    timer.current = setInterval(() => setLeft(t => (t <= 1 ? 0 : t - 1)), 1000)
    return () => clearInterval(timer.current)
  }, [state])
  useEffect(() => {
    if (state === 'run' && (left === 0 || done.length === pairs.length)) {
      clearInterval(timer.current)
      const final = points + (done.length === pairs.length ? left : 0)
      setPoints(final); setState('end'); onScore(final)
    }
  }, [left, done, state]) // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (id: number) => {
    if (pick === null) return
    if (id === pick) { setDone(d => [...d, id]); setPoints(p => p + 10); setPick(null) }
    else { setWrong(id); setLeft(t => Math.max(0, t - 5)); setTimeout(() => setWrong(null), 450) }
  }

  if (!pairs.length) return null
  return (
    <Card>
      <div className="mb-4 flex items-center gap-3" dir="ltr">
        <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] font-extrabold" style={{ background: left <= 10 && state === 'run' ? V.red : V.navy, color: '#fff' }}><Timer size={15} /> {left}s</span>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full" style={{ background: V.line }}><div className="h-full rounded-full transition-all" style={{ width: `${(done.length / pairs.length) * 100}%`, background: V.green }} /></div>
        <span className="text-[14px] font-extrabold" style={{ color: V.saffD }}>{points} pts</span>
      </div>

      {state === 'ready' && (
        <div className="py-8 text-center" dir="ltr">
          <Plane size={44} color={V.red} className="mx-auto" />
          <div className="mt-3 text-[22px] font-extrabold">Boarding closes in 60 seconds!</div>
          <Ar className="mx-auto mt-2 max-w-md text-[14px] font-semibold" style={{ color: V.grey }}>اضغط جملة من اليسار (تسمعها)، ثم ردّها الصحيح من اليمين. كل خطأ يكلّفك 5 ثوانٍ.</Ar>
          <Btn tone="red" className="mt-5" onClick={start}>Start boarding</Btn>
        </div>
      )}

      {state === 'run' && (
        <div className="grid grid-cols-2 gap-3" dir="ltr">
          <div className="space-y-2">
            <div className="text-[11px] font-extrabold tracking-[0.14em]" style={{ color: V.navy }}>YOU HEAR</div>
            {cues.map(c => (
              <button key={c.id} disabled={done.includes(c.id)} onClick={() => { setPick(c.id); play(c.cue) }}
                className="w-full rounded-xl border-2 px-3 py-2.5 text-left text-[13.5px] font-bold transition disabled:opacity-25"
                style={pick === c.id ? { borderColor: V.navy, background: V.navy, color: '#fff' } : done.includes(c.id) ? { borderColor: V.green, background: V.greenS } : { borderColor: V.line, background: V.navyS }}>
                {c.cue}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <div className="text-[11px] font-extrabold tracking-[0.14em]" style={{ color: V.red }}>YOU REPLY</div>
            {replies.map(r => (
              <button key={r.id} disabled={done.includes(r.id)} onClick={() => choose(r.id)}
                className={`w-full rounded-xl border-2 px-3 py-2.5 text-left text-[13.5px] font-bold transition disabled:opacity-25 ${wrong === r.id ? 'vz-shake' : ''}`}
                style={wrong === r.id ? { borderColor: V.red, background: V.redS } : done.includes(r.id) ? { borderColor: V.green, background: V.greenS } : { borderColor: pick !== null ? V.saff : V.line, background: '#fff' }}>
                {r.reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {state === 'end' && (
        <div className="py-8 text-center" dir="ltr">
          <Trophy size={44} color={V.saff} className="mx-auto" />
          <div className="mt-3 text-[24px] font-extrabold">{done.length === pairs.length ? 'You made the flight!' : 'Gate closed!'}</div>
          <div className="mt-1 text-[16px] font-bold" style={{ color: V.grey }}>{done.length}/{pairs.length} matched · {points} points</div>
          <Btn className="mt-5" onClick={start}><RotateCcw size={16} /> Play again</Btn>
        </div>
      )}
    </Card>
  )
}

/* ── Listen & Type ──────────────────────────────────────────────────── */

function ListenType({ s, onScore }: { s: Stop; onScore: (v: number) => void }) {
  const { play } = useAudio()
  const words = useMemo(() => s.words.map(([en, ar]) => ({ shown: en, answer: en.split('/')[0].trim(), ar })), [s])
  const [order, setOrder] = useState(() => shuffle(words))
  const [i, setI] = useState(0)
  const [val, setVal] = useState('')
  const [hint, setHint] = useState(false)
  const [res, setRes] = useState<'ok' | 'bad' | null>(null)
  const [score, setScore] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const w = order[i]
  const end = i >= order.length

  useEffect(() => { if (w) { play(w.shown); input.current?.focus() } }, [i]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (end) onScore(score) }, [end]) // eslint-disable-line react-hooks/exhaustive-deps

  const check = () => {
    if (!w || res) return
    const ok = same(val, w.answer) || w.shown.split('/').some(f => same(val, f))
    setRes(ok ? 'ok' : 'bad')
    if (ok) setScore(x => x + (hint ? 1 : 2))
  }
  const nextWord = () => { setI(x => x + 1); setVal(''); setHint(false); setRes(null) }

  if (end) return (
    <Card>
      <div className="py-8 text-center" dir="ltr">
        <Trophy size={44} color={V.saff} className="mx-auto" />
        <div className="mt-3 text-[24px] font-extrabold">{score} / {order.length * 2} points</div>
        <Ar className="mt-1 text-[14px] font-semibold" style={{ color: V.grey }}>نقطتان لكل إجابة بلا مساعدة، ونقطة واحدة مع المساعدة.</Ar>
        <Btn className="mt-5" onClick={() => { setOrder(shuffle(words)); setI(0); setScore(0); setVal(''); setRes(null); setHint(false) }}><RotateCcw size={16} /> Play again</Btn>
      </div>
    </Card>
  )
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between text-[13px] font-bold" dir="ltr" style={{ color: V.grey }}>
        <span>Word {i + 1} / {order.length}</span><span style={{ color: V.saffD }}>{score} pts</span>
      </div>
      <div className="flex flex-col items-center py-4" dir="ltr">
        <button onClick={() => play(w.shown)} className="flex h-[88px] w-[88px] items-center justify-center rounded-full shadow-lg transition active:scale-95" style={{ background: V.navy, color: V.saff }}><Headphones size={38} /></button>
        <div className="mt-2 text-[12px] font-bold" style={{ color: V.grey }}>Tap to listen again</div>
        {hint && <div className="mt-3 flex items-center gap-2 text-[15px] font-bold"><Ar as="span" style={{ color: V.red }}>{w.ar}</Ar> · starts with <b>“{w.answer[0]}”</b></div>}
        <input ref={input} value={val} onChange={e => !res && setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && (res ? nextWord() : check())}
          autoCapitalize="off" autoCorrect="off" spellCheck={false} placeholder="Type what you hear"
          className="mt-4 w-full max-w-sm rounded-xl border-2 px-4 py-3 text-center text-[20px] font-extrabold outline-none"
          style={{ fontFamily: EN, borderColor: res === 'ok' ? V.green : res === 'bad' ? V.red : V.line, background: res === 'ok' ? V.greenS : res === 'bad' ? V.redS : '#fff' }} />
        {res && <div className="mt-2 text-[15px] font-extrabold" style={{ color: res === 'ok' ? V.green : V.red }}>{res === 'ok' ? <span className="flex items-center gap-1"><Check size={17} /> Correct!</span> : <>It's “{w.answer}”</>}</div>}
        <div className="mt-4 flex gap-2">
          {!res && <Btn tone="ghost" onClick={() => setHint(true)} disabled={hint}><Lightbulb size={16} /> Hint</Btn>}
          {!res ? <Btn onClick={check} disabled={!val.trim()}>Check</Btn> : <Btn tone="red" onClick={nextWord}>Next word</Btn>}
        </div>
      </div>
    </Card>
  )
}
