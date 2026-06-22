'use client'

/**
 * PictureWordGame — a structured "learn English by English" flashcard game (A0/A1).
 * It walks through ordered card GROUPS that build on each other:
 *   Things (nouns) → Opposites (adjectives) → Colors → Put-it-together (phrases).
 * Each group runs 3 stages:
 *   1) LOOK — 4 cards: an AI 3D illustration + the English name (tap to hear).
 *   2) FIND — names hidden; a word is shown/heard → tap the right card.
 *   3) READ — a simple English sentence with the word → tap the matching card.
 * Every card carries its OWN image prompt so the 3D picture matches the word
 * (e.g. "expensive" → a diamond with a price tag, "green car" → a green car).
 * English-only content; light Arabic guidance only.
 */

import { useEffect, useMemo, useState } from 'react'
import { X, Loader2, Volume2, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react'

interface Props { token?: string; courseId?: string | null; onClose: () => void; onEarned?: () => void }
type Card = { id: string; en: string; prompt: string; emoji: string }
const c = (en: string, prompt: string, emoji: string): Card => ({ id: en.toLowerCase(), en, prompt, emoji })

/* Ordered curriculum — extend freely; each card's `prompt` drives its picture. */
const CURRICULUM: { title: string; ar: string; cards: Card[] }[] = [
  { title: 'Things', ar: 'أشياء', cards: [
    c('House', 'a cute cartoon house', '🏠'),
    c('Banana', 'a single ripe banana', '🍌'),
    c('Car', 'a cute cartoon car', '🚗'),
    c('Bike', 'a bicycle', '🚲'),
  ] },
  { title: 'Opposites', ar: 'أضداد', cards: [
    c('Big', 'a giant huge elephant towering, emphasizing very big size', '🐘'),
    c('Small', 'a tiny little mouse, emphasizing very small size', '🐭'),
    c('Expensive', 'a luxury diamond ring on a high price tag with gold coins, expensive', '💎'),
    c('Cheap', 'a small paper price tag showing a very low cheap price with a few coins', '🏷️'),
  ] },
  { title: 'Colors', ar: 'ألوان', cards: [
    c('Red', 'a glossy 3D blob of solid bright red paint, the color red dominant', '🟥'),
    c('Green', 'a glossy 3D blob of solid bright green paint, the color green dominant', '🟩'),
    c('White', 'a glossy 3D blob of solid pure white paint on a light gray background', '⬜'),
    c('Yellow', 'a glossy 3D blob of solid bright yellow paint, the color yellow dominant', '🟨'),
  ] },
  { title: 'Put it together', ar: 'كوّن العبارة', cards: [
    c('Green car', 'a shiny bright green car', '🚗'),
    c('White house', 'a white house', '🏠'),
    c('Red bike', 'a bright red bicycle', '🚲'),
    c('Yellow banana', 'a single bright yellow banana', '🍌'),
  ] },
]

const shuffle = <T,>(a: T[]) => a.map(v => [Math.random(), v] as const).sort((x, y) => x[0] - y[0]).map(([, v]) => v)
function speak(text: string) {
  try { const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.8; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u) } catch {}
}
const aiUrl = (card: Card) => {
  const prompt = `cute 3D pixar-style cartoon illustration of ${card.prompt}, one single subject filling the frame, plain solid white background, soft studio lighting, friendly, highly detailed, no text, no letters, no words`
  const seed = card.id.replace(/[^a-z0-9]/g, '').slice(0, 24) || 'word'
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=420&height=420&nologo=true&model=flux&seed=${seed}`
}
const SENTENCES = ['Where is the {w}?', 'Look at the {w}!', 'I can see the {w}.', 'Point to the {w}.', 'This is the {w}.']
const sentenceFor = (en: string, i: number) => SENTENCES[i % SENTENCES.length].replace('{w}', en.toLowerCase())

function CardImg({ card }: { card: Card }) {
  const url = useMemo(() => aiUrl(card), [card.id])   // eslint-disable-line react-hooks/exhaustive-deps
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => { setLoaded(false); setFailed(false) }, [card.id])
  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white ring-1 ring-stone-200 flex items-center justify-center">
      {!loaded && !failed && <Loader2 className="animate-spin text-stone-300" size={26} />}
      {failed
        ? <span className="text-[44px]">{card.emoji}</span>
        // eslint-disable-next-line @next/next/no-img-element
        : <img src={url} alt={card.en} onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`} />}
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

  useEffect(() => {   // speak the prompt when a new target appears
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
        {/* header */}
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
