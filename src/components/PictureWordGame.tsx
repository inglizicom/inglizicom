'use client'

/**
 * PictureWordGame — a structured "learn English by English" flashcard game (A0/A1).
 * Ordered card GROUPS that build on each other:
 *   Things (nouns) → Opposites (adjectives) → Colors → Put-it-together (phrases).
 * Each group runs 3 stages: LOOK (picture + name) → FIND (word → pick card) →
 * READ (simple sentence → pick card). English-only content.
 *
 * Pictures: REAL photos via Unsplash (`/api/img`, cached + CDN-fast). Colors render
 * as exact CSS swatches. Everything has an emoji fallback and an 8s timeout so a
 * card never hangs on "loading".
 */

import { useEffect, useState } from 'react'
import { X, Loader2, Volume2, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react'

interface Props { token?: string; courseId?: string | null; onClose: () => void; onEarned?: () => void }
type Card = { id: string; en: string; emoji: string; query?: string; color?: string }
const photo = (en: string, query: string, emoji: string): Card => ({ id: en.toLowerCase(), en, query, emoji })
const color = (en: string, hex: string, emoji: string): Card => ({ id: en.toLowerCase(), en, color: hex, emoji })

/* Ordered curriculum — extend freely. `query` = Unsplash search; `color` = swatch. */
const CURRICULUM: { title: string; ar: string; cards: Card[] }[] = [
  { title: 'Things', ar: 'أشياء', cards: [
    photo('House', 'house home exterior', '🏠'),
    photo('Banana', 'banana fruit', '🍌'),
    photo('Car', 'car automobile', '🚗'),
    photo('Bike', 'bicycle', '🚲'),
  ] },
  { title: 'Opposites', ar: 'أضداد', cards: [
    photo('Big', 'big elephant', '🐘'),
    photo('Small', 'small cute mouse', '🐭'),
    photo('Expensive', 'luxury diamond jewelry', '💎'),
    photo('Cheap', 'sale discount price tag', '🏷️'),
  ] },
  { title: 'Colors', ar: 'ألوان', cards: [
    color('Red', '#ef4444', '🟥'),
    color('Green', '#22c55e', '🟩'),
    color('White', '#ffffff', '⬜'),
    color('Yellow', '#facc15', '🟨'),
  ] },
  { title: 'Put it together', ar: 'كوّن العبارة', cards: [
    photo('Green car', 'green car', '🚗'),
    photo('White house', 'white house', '🏠'),
    photo('Red bike', 'red bicycle', '🚲'),
    photo('Yellow banana', 'yellow banana', '🍌'),
  ] },
]

const shuffle = <T,>(a: T[]) => a.map(v => [Math.random(), v] as const).sort((x, y) => x[0] - y[0]).map(([, v]) => v)
function speak(text: string) {
  try { const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.8; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u) } catch {}
}
const SENTENCES = ['Where is the {w}?', 'Look at the {w}!', 'I can see the {w}.', 'Point to the {w}.', 'This is the {w}.']
const sentenceFor = (en: string, i: number) => SENTENCES[i % SENTENCES.length].replace('{w}', en.toLowerCase())

function CardImg({ card }: { card: Card }) {
  const [url, setUrl] = useState<string | null | undefined>(undefined)
  const [loaded, setLoaded] = useState(false)
  const [fail, setFail] = useState(false)
  useEffect(() => {
    if (card.color) return
    let alive = true; setUrl(undefined); setLoaded(false); setFail(false)
    const to = setTimeout(() => { if (alive) setFail(true) }, 8000)     // never hang on a slow lookup
    fetch(`/api/img?en=${encodeURIComponent(card.en)}&q=${encodeURIComponent(card.query || card.en)}`)
      .then(r => r.json()).then(d => { if (!alive) return; clearTimeout(to); if (d?.url) setUrl(d.url); else setFail(true) })
      .catch(() => { if (!alive) return; clearTimeout(to); setFail(true) })
    return () => { alive = false; clearTimeout(to) }
  }, [card.id])   // eslint-disable-line react-hooks/exhaustive-deps

  if (card.color) return (
    <div className="w-full aspect-square rounded-2xl ring-1 ring-stone-300 shadow-inner" style={{ background: card.color }} />
  )
  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white ring-1 ring-stone-200 flex items-center justify-center">
      {fail
        ? <span className="text-[46px]">{card.emoji}</span>
        : <>
            {(url === undefined || !loaded) && <Loader2 className="animate-spin text-stone-300" size={26} />}
            {typeof url === 'string' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={card.en} onLoad={() => setLoaded(true)} onError={() => setFail(true)}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`} />
            )}
          </>}
    </div>
  )
}

type Phase = 'learn' | 'recognize' | 'sentence' | 'groupdone' | 'alldone'

export default function PictureWordGame({ onClose, onEarned }: Props) {
  const [gi, setGi] = useState(0)
  const [phase, setPhase] = useState<Phase>('learn')
  const [queue, setQueue] = useState<Card[]>([])
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [result, setResult] = useState<'right' | 'wrong' | null>(null)
  const [learned, setLearned] = useState<Set<string>>(new Set())

  const group = CURRICULUM[gi]
  const cards = group.cards
  const target = queue[qi]
  const lastGroup = gi >= CURRICULUM.length - 1

  useEffect(() => {
    if (!target) return
    if (phase === 'recognize') speak(target.en)
    if (phase === 'sentence') speak(sentenceFor(target.en, qi))
  }, [phase, qi, target])   // eslint-disable-line react-hooks/exhaustive-deps

  function startStage(p: 'recognize' | 'sentence') { setQueue(shuffle(cards)); setQi(0); setPicked(null); setResult(null); setPhase(p) }
  function startGroup(index: number) { setGi(index); setPhase('learn'); setQueue([]); setQi(0); setPicked(null); setResult(null) }

  function choose(id: string) {
    if (result || !target) return
    const ok = id === target.id
    setPicked(id); setResult(ok ? 'right' : 'wrong')
    if (ok) setLearned(prev => new Set(prev).add(`${gi}:${target.id}`))
    setTimeout(() => {
      setPicked(null); setResult(null)
      if (qi + 1 < queue.length) { setQi(qi + 1); return }
      if (phase === 'recognize') startStage('sentence')
      else { onEarned?.(); setPhase(lastGroup ? 'alldone' : 'groupdone') }
    }, ok ? 850 : 1500)
  }

  const progress = phase === 'recognize' || phase === 'sentence' ? `${qi + 1}/${queue.length}` : ''
  const stageNo = phase === 'learn' ? 1 : phase === 'recognize' ? 2 : phase === 'sentence' ? 3 : 0

  return (
    <div className="fixed inset-0 z-[200] bg-[var(--ic-dark,#2a1d12)]/95 backdrop-blur-sm flex items-center justify-center p-3" dir="rtl">
      <div className="w-full max-w-lg bg-[#faf6ef] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-l from-sky-500 to-cyan-500 text-white">
          <div className="flex items-center gap-2">
            <span className="text-[22px]">🖼️</span>
            <div>
              <div className="font-black text-[15px] leading-tight">تعلّم بالصور</div>
              <div className="text-[11px] text-white/85">{group.title} · {group.ar}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black bg-white/20 px-2.5 py-1 rounded-full">مجموعة {gi + 1}/{CURRICULUM.length}</span>
            {stageNo > 0 && <span className="text-[11px] font-black bg-white/20 px-2.5 py-1 rounded-full">{stageNo}/3{progress && ` · ${progress}`}</span>}
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20"><X size={18} /></button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto">
          {phase === 'learn' && (
            <div className="space-y-4">
              <div className="text-center font-bold text-[13px] text-stone-500">👀 انظر واستمع — اضغط على البطاقة لسماع الكلمة</div>
              <div className="grid grid-cols-2 gap-3" dir="ltr">
                {cards.map(w => (
                  <button key={w.id} onClick={() => speak(w.en)} className="flex flex-col items-center gap-2 rounded-2xl bg-white p-2.5 ring-1 ring-stone-200 shadow-sm active:scale-95 transition-transform">
                    <CardImg card={w} />
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-[16px] text-[#2a1d12]">{w.en}</span>
                      <Volume2 size={15} className="text-sky-500" />
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => startStage('recognize')} className="w-full py-3 rounded-2xl bg-[#2a1d12] text-[var(--ic-gold,#facc15)] font-black text-[15px] flex items-center justify-center gap-2">
                أنا جاهز <ArrowRight size={18} />
              </button>
            </div>
          )}

          {(phase === 'recognize' || phase === 'sentence') && target && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white ring-1 ring-stone-200 px-4 py-4 text-center shadow-sm">
                <div className="text-[12px] font-bold text-stone-400 mb-1">{phase === 'recognize' ? '🔎 اختر البطاقة الصحيحة' : '📖 اقرأ الجملة واختر البطاقة'}</div>
                <div dir="ltr" className="flex items-center justify-center gap-2">
                  <span className="font-black text-[#2a1d12]" style={{ fontSize: phase === 'sentence' ? '22px' : '30px' }}>
                    {phase === 'recognize' ? target.en : sentenceFor(target.en, qi)}
                  </span>
                  <button onClick={() => speak(phase === 'recognize' ? target.en : sentenceFor(target.en, qi))} className="p-2 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100"><Volume2 size={18} /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3" dir="ltr">
                {cards.map(w => {
                  const isTarget = w.id === target.id
                  const ring = result && isTarget ? 'ring-4 ring-emerald-400'
                    : result === 'wrong' && picked === w.id ? 'ring-4 ring-rose-400' : 'ring-1 ring-stone-200'
                  return (
                    <button key={w.id} onClick={() => choose(w.id)} disabled={!!result}
                      className={`relative rounded-2xl bg-white p-2.5 shadow-sm transition-transform active:scale-95 ${ring}`}>
                      <CardImg card={w} />
                      {result && isTarget && <span className="absolute top-3 right-3 bg-emerald-500 text-white rounded-full p-1"><CheckCircle2 size={18} /></span>}
                    </button>
                  )
                })}
              </div>
              <div className="h-5 text-center font-black text-[14px]" dir="ltr">
                {result === 'right' && <span className="text-emerald-600">✓ {target.en}</span>}
                {result === 'wrong' && <span className="text-rose-600">{target.en}</span>}
              </div>
            </div>
          )}

          {phase === 'groupdone' && (
            <div className="py-8 text-center space-y-4">
              <div className="text-[50px]">🎉</div>
              <div className="font-black text-[19px] text-[#2a1d12]">أحسنت! أنهيت «{group.title}»</div>
              <div className="text-[13px] text-stone-500">التالي: {CURRICULUM[gi + 1].title} · {CURRICULUM[gi + 1].ar}</div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button onClick={() => startGroup(gi + 1)} className="px-5 py-2.5 rounded-xl bg-sky-500 text-white font-black text-[14px] flex items-center gap-2">البطاقات التالية <ArrowRight size={16} /></button>
                <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-stone-100 text-stone-600 font-black text-[14px]">إغلاق</button>
              </div>
            </div>
          )}

          {phase === 'alldone' && (
            <div className="py-8 text-center space-y-4">
              <div className="text-[54px]">🏆</div>
              <div className="font-black text-[20px] text-[#2a1d12]">أحسنت! أنهيت كل البطاقات</div>
              <div className="text-[13px] text-stone-500">تعلّمت {learned.size} بطاقة عبر {CURRICULUM.length} مجموعات</div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button onClick={() => { setLearned(new Set()); startGroup(0) }} className="px-5 py-2.5 rounded-xl bg-[#2a1d12] text-[var(--ic-gold,#facc15)] font-black text-[14px] flex items-center gap-2"><RotateCcw size={16} /> من البداية</button>
                <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-stone-100 text-stone-600 font-black text-[14px]">إغلاق</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
