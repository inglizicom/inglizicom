'use client'

/**
 * PictureWordGame — a 3-stage "learn English by English" flashcard game for A0/A1.
 *   1) LOOK   — 4 cards, each an AI 3D illustration + its English name (tap to hear).
 *   2) FIND   — same cards, names hidden; a word is shown/heard → tap the right card.
 *   3) READ   — a simple English sentence with the word → tap the matching card.
 * No Arabic translation in the content — only English, with light Arabic guidance.
 * Coins are awarded (server-authoritative) for the words answered correctly.
 */

import { useEffect, useMemo, useState } from 'react'
import { X, Loader2, Volume2, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react'
import { fetchVocab, rewardVocab, type VocabWord } from '@/lib/gamification'
import CoinIcon from '@/components/CoinIcon'

interface Props { token: string; courseId?: string | null; onClose: () => void; onEarned?: () => void }

const shuffle = <T,>(a: T[]) => a.map(v => [Math.random(), v] as const).sort((x, y) => x[0] - y[0]).map(([, v]) => v)
function speak(text: string) {
  try { const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.8; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u) } catch {}
}
/* AI cartoon-3D illustration (keyless, stable seed per word). */
const aiUrl = (en: string) => {
  const prompt = `cute 3D pixar-style cartoon illustration of ${en}, one single subject filling the frame, plain solid white background, soft studio lighting, friendly, highly detailed, no text, no letters, no words`
  const seed = en.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24) || 'word'
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=420&height=420&nologo=true&model=flux&seed=${seed}`
}
/* the-based carrier sentences (work for any noun, no a/an pitfalls) */
const SENTENCES = ['Where is the {w}?', 'Look at the {w}!', 'I can see the {w}.', 'Point to the {w}.', 'This is the {w}.']
const sentenceFor = (en: string, i: number) => SENTENCES[i % SENTENCES.length].replace('{w}', en)

function CardImg({ word }: { word: VocabWord }) {
  const url = useMemo(() => aiUrl(word.en), [word.en])
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => { setLoaded(false); setFailed(false) }, [word.en])
  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white ring-1 ring-stone-200 flex items-center justify-center">
      {!loaded && !failed && <Loader2 className="animate-spin text-stone-300" size={26} />}
      {failed
        ? <span className="text-[44px]">{word.emoji ?? '🃏'}</span>
        // eslint-disable-next-line @next/next/no-img-element
        : <img src={url} alt={word.en} onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`} />}
    </div>
  )
}

type Phase = 'loading' | 'learn' | 'recognize' | 'sentence' | 'done'

export default function PictureWordGame({ token, courseId, onClose, onEarned }: Props) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [cards, setCards] = useState<VocabWord[]>([])
  const [queue, setQueue] = useState<VocabWord[]>([])
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [result, setResult] = useState<'right' | 'wrong' | null>(null)
  const [mastered, setMastered] = useState<Set<string>>(new Set())
  const [coins, setCoins] = useState(0)

  function deal() {
    setPhase('loading'); setMastered(new Set()); setCoins(0); setQi(0); setPicked(null); setResult(null)
    fetchVocab(token, 8).then(w => {
      const four = shuffle(w).filter(x => x.en && /[a-z]/i.test(x.en)).slice(0, 4)
      setCards(four)
      setPhase(four.length >= 3 ? 'learn' : 'done')
    }).catch(() => setPhase('done'))
  }
  useEffect(deal, [token])   // eslint-disable-line react-hooks/exhaustive-deps

  const target = queue[qi]
  // speak the prompt when a new target appears
  useEffect(() => {
    if (!target) return
    if (phase === 'recognize') speak(target.en)
    if (phase === 'sentence') speak(sentenceFor(target.en, qi))
  }, [phase, qi, target])   // eslint-disable-line react-hooks/exhaustive-deps

  function startStage(p: 'recognize' | 'sentence') { setQueue(shuffle(cards)); setQi(0); setPicked(null); setResult(null); setPhase(p) }

  function choose(id: string) {
    if (result) return
    const ok = id === target.id
    setPicked(id); setResult(ok ? 'right' : 'wrong')
    if (ok) setMastered(prev => new Set(prev).add(target.id))
    setTimeout(() => {
      setPicked(null); setResult(null)
      if (qi + 1 < queue.length) { setQi(qi + 1); return }
      if (phase === 'recognize') startStage('sentence')
      else finish()
    }, ok ? 900 : 1600)
  }

  function finish() {
    setPhase('done')
    const ids = [...mastered]
    if (ids.length) rewardVocab(token, ids, courseId).then(c => { setCoins(c); onEarned?.() })
  }

  const progress = phase === 'recognize' || phase === 'sentence' ? `${qi + 1}/${queue.length}` : ''
  const stageNo = phase === 'learn' ? 1 : phase === 'recognize' ? 2 : phase === 'sentence' ? 3 : 0

  return (
    <div className="fixed inset-0 z-[200] bg-[var(--ic-dark)]/95 backdrop-blur-sm flex items-center justify-center p-3" dir="rtl">
      <div className="w-full max-w-lg bg-[var(--ic-cream,#faf6ef)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-l from-violet-500 to-fuchsia-500 text-white">
          <div className="flex items-center gap-2">
            <span className="text-[22px]">🖼️</span>
            <div>
              <div className="font-black text-[15px] leading-tight">تعلّم بالصور</div>
              <div className="text-[11px] text-white/80">صورة ← كلمة ← جملة</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {stageNo > 0 && <span className="text-[11px] font-black bg-white/20 px-2.5 py-1 rounded-full">المرحلة {stageNo}/3{progress && ` · ${progress}`}</span>}
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20"><X size={18} /></button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto">
          {phase === 'loading' && <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-stone-300" size={28} /></div>}

          {phase === 'learn' && (
            <div className="space-y-4">
              <div className="text-center font-bold text-[13px] text-stone-500" dir="rtl">👀 انظر واستمع — اضغط على البطاقة لسماع الكلمة</div>
              <div className="grid grid-cols-2 gap-3" dir="ltr">
                {cards.map(w => (
                  <button key={w.id} onClick={() => speak(w.en)} className="flex flex-col items-center gap-2 rounded-2xl bg-white p-2.5 ring-1 ring-stone-200 shadow-sm active:scale-95 transition-transform">
                    <CardImg word={w} />
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-[16px] text-[var(--ic-dark,#2a1d12)]">{w.en}</span>
                      <Volume2 size={15} className="text-violet-500" />
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => startStage('recognize')} className="w-full py-3 rounded-2xl bg-[var(--ic-dark,#2a1d12)] text-[var(--ic-gold,#facc15)] font-black text-[15px] flex items-center justify-center gap-2">
                أنا جاهز <ArrowRight size={18} />
              </button>
            </div>
          )}

          {(phase === 'recognize' || phase === 'sentence') && target && (
            <div className="space-y-4">
              {/* prompt */}
              <div className="rounded-2xl bg-white ring-1 ring-stone-200 px-4 py-4 text-center shadow-sm">
                <div className="text-[12px] font-bold text-stone-400 mb-1" dir="rtl">{phase === 'recognize' ? '🔎 اختر البطاقة الصحيحة' : '📖 اقرأ الجملة واختر البطاقة'}</div>
                <div dir="ltr" className="flex items-center justify-center gap-2">
                  <span className="font-black text-[var(--ic-dark,#2a1d12)]" style={{ fontSize: phase === 'sentence' ? '22px' : '30px' }}>
                    {phase === 'recognize' ? target.en : sentenceFor(target.en, qi)}
                  </span>
                  <button onClick={() => speak(phase === 'recognize' ? target.en : sentenceFor(target.en, qi))} className="p-2 rounded-full bg-violet-50 text-violet-600 hover:bg-violet-100"><Volume2 size={18} /></button>
                </div>
              </div>
              {/* cards (no names) */}
              <div className="grid grid-cols-2 gap-3" dir="ltr">
                {cards.map(w => {
                  const isTarget = w.id === target.id
                  const ring = result && isTarget ? 'ring-4 ring-emerald-400'
                    : result === 'wrong' && picked === w.id ? 'ring-4 ring-rose-400' : 'ring-1 ring-stone-200'
                  return (
                    <button key={w.id} onClick={() => choose(w.id)} disabled={!!result}
                      className={`relative rounded-2xl bg-white p-2.5 shadow-sm transition-transform active:scale-95 ${ring}`}>
                      <CardImg word={w} />
                      {result && isTarget && <span className="absolute top-3 right-3 bg-emerald-500 text-white rounded-full p-1"><CheckCircle2 size={18} /></span>}
                    </button>
                  )
                })}
              </div>
              <div className="h-5 text-center font-black text-[14px]">
                {result === 'right' && <span className="text-emerald-600">✓ {target.en} — أحسنت!</span>}
                {result === 'wrong' && <span className="text-rose-600" dir="ltr">{target.en}</span>}
              </div>
            </div>
          )}

          {phase === 'done' && (
            <div className="py-8 text-center space-y-4">
              {cards.length < 3 ? (
                <>
                  <div className="text-[48px]">📭</div>
                  <div className="font-black text-[17px] text-[var(--ic-dark,#2a1d12)]">لا توجد مفردات كافية بعد</div>
                  <div className="text-[13px] text-stone-500">أكمل بعض الدروس أولاً لتفتح هذه اللعبة.</div>
                </>
              ) : (
                <>
                  <div className="text-[54px]">🎉</div>
                  <div className="font-black text-[20px] text-[var(--ic-dark,#2a1d12)]">أحسنت!</div>
                  <div className="text-[13px] text-stone-500">حفظت {mastered.size} من {cards.length} كلمات</div>
                  {coins > 0 && <div className="inline-flex items-center gap-1.5 bg-[var(--ic-gold,#facc15)] text-black font-black px-4 py-2 rounded-full text-[15px]">+{coins} <CoinIcon size={16} /></div>}
                </>
              )}
              <div className="flex items-center justify-center gap-2 pt-2">
                {cards.length >= 3 && <button onClick={deal} className="px-5 py-2.5 rounded-xl bg-[var(--ic-dark,#2a1d12)] text-[var(--ic-gold,#facc15)] font-black text-[14px] flex items-center gap-2"><RotateCcw size={16} /> العب مجددًا</button>}
                <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-stone-100 text-stone-600 font-black text-[14px]">إغلاق</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
