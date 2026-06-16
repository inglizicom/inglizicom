'use client'

import { useEffect, useMemo, useState } from 'react'
import { X, Loader2, CheckCircle2, XCircle, ArrowLeft, Coins, Sparkles, RotateCcw, Volume2 } from 'lucide-react'
import { fetchVocab, rewardVocab, type VocabWord } from '@/lib/gamification'

type Mode = 'listen' | 'match' | 'spell'
interface Props { token: string; courseId?: string | null; onClose: () => void; onEarned?: () => void }

function speak(text: string) {
  try { const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.85; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u) } catch {}
}
const shuffle = <T,>(a: T[]) => a.map(v => [Math.random(), v] as const).sort((x, y) => x[0] - y[0]).map(([, v]) => v)
const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '')

export default function VocabGames({ token, courseId, onClose, onEarned }: Props) {
  const [phase, setPhase] = useState<'loading' | 'run' | 'done'>('loading')
  const [words, setWords] = useState<VocabWord[]>([])
  const [seq, setSeq] = useState<{ word: VocabWord; mode: Mode }[]>([])
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [built, setBuilt] = useState<string[]>([])
  const [pool, setPool] = useState<string[]>([])
  const [checked, setChecked] = useState<{ correct: boolean } | null>(null)
  const [correctIds, setCorrectIds] = useState<Set<string>>(new Set())
  const [score, setScore] = useState(0)
  const [coins, setCoins] = useState(0)
  const [combo, setCombo] = useState(0)      // consecutive correct (streak)
  const [best, setBest] = useState(0)
  const [newBest, setNewBest] = useState(false)
  useEffect(() => { try { setBest(Number(localStorage.getItem('inglizi.vocab_best') || 0)) } catch {} }, [])

  useEffect(() => {
    let alive = true
    fetchVocab(token, 12).then(w => {
      if (!alive) return
      if (w.length < 4) { setWords(w); setPhase('run'); return }
      const modes: Mode[] = ['listen', 'match', 'spell']
      const s = shuffle(w).map((word, i) => {
        let mode = modes[i % 3]
        if (mode === 'spell' && /\s/.test(word.en)) mode = 'match'   // spelling = single words only
        return { word, mode }
      })
      setWords(w); setSeq(s); setPhase('run'); load(s[0])
    })
    return () => { alive = false }
  }, [token])

  const cur = seq[idx]
  function load(item: { word: VocabWord; mode: Mode }) {
    setChecked(null); setPicked(null)
    if (item.mode === 'spell') { setPool(shuffle([...item.word.en.replace(/\s/g, '')])); setBuilt([]) }
    if (item.mode === 'listen') setTimeout(() => speak(item.word.en), 250)
  }

  // 4 options (correct + 3 distractors) for listen (Arabic) / match (English)
  const options = useMemo(() => {
    if (!cur || cur.mode === 'spell') return []
    const others = shuffle(words.filter(w => w.id !== cur.word.id)).slice(0, 3)
    const key = cur.mode === 'listen' ? 'ar' : 'en'
    return shuffle([cur.word, ...others]).map(w => (w as any)[key] as string)
  }, [cur, words])

  function check() {
    if (!cur || checked) return
    let ok = false
    if (cur.mode === 'spell') ok = norm(built.join('')) === norm(cur.word.en)
    else ok = picked === (cur.mode === 'listen' ? cur.word.ar : cur.word.en)
    if (cur.mode !== 'spell' && !picked) return
    setChecked({ correct: ok })
    if (ok) { setScore(s => s + 1); setCorrectIds(p => new Set(p).add(cur.word.id)); setCoins(c => c + 5); setCombo(c => c + 1) }
    else setCombo(0)
  }
  async function next() {
    if (idx + 1 >= seq.length) {
      if (score > best) { setNewBest(true); try { localStorage.setItem('inglizi.vocab_best', String(score)) } catch {} ; setBest(score) }
      const got = await rewardVocab(token, [...correctIds], courseId); setCoins(got || coins); setPhase('done'); onEarned?.(); return
    }
    const ni = idx + 1; setIdx(ni); load(seq[ni])
  }

  /* ── DONE ── */
  if (phase === 'done') return (
    <Shell onClose={onClose}>
      <div className="max-w-md mx-auto px-5 py-10 text-center">
        <div className="text-5xl mb-2">{score >= seq.length * 0.6 ? '🎉' : '💪'}</div>
        <div className="text-white font-black text-[26px]">{score} / {seq.length}</div>
        <div className="inline-flex items-center gap-1.5 mt-2 bg-yellow-400/15 text-yellow-400 font-black px-3 py-1.5 rounded-full"><Coins size={16} /> +{coins} كوين</div>
        {newBest
          ? <div className="mt-3 text-[14px] font-black text-emerald-400">🏆 رقم قياسي جديد!</div>
          : <div className="mt-3 text-[12px] text-zinc-400">أفضل نتيجة لك: <b className="text-white">{best}</b></div>}
        <div className="flex gap-2 mt-6">
          <button onClick={() => { setIdx(0); setScore(0); setCoins(0); setCorrectIds(new Set()); setPhase('loading'); fetchVocab(token, 12).then(w => { const modes: Mode[] = ['listen','match','spell']; const s = shuffle(w).map((word,i)=>{ let m=modes[i%3]; if(m==='spell'&&/\s/.test(word.en)) m='match'; return {word, mode:m} }); setWords(w); setSeq(s); setPhase('run'); load(s[0]) }) }}
            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 font-bold text-[13px] flex items-center justify-center gap-1.5"><RotateCcw size={15} /> جولة أخرى</button>
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-yellow-400 text-black font-black text-[13px]">إنهاء</button>
        </div>
      </div>
    </Shell>
  )

  /* ── RUN ── */
  return (
    <Shell onClose={onClose} progress={seq.length ? idx / seq.length : 0}>
      <div className="max-w-md mx-auto px-5 py-6">
        {phase === 'loading' ? (
          <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-zinc-500" size={28} /></div>
        ) : !cur ? (
          <div className="text-center text-zinc-400 py-16 text-[14px]">لا توجد كلمات متاحة بعد.</div>
        ) : (
          <>
            <div className="flex items-center justify-between text-[12px] text-zinc-500 mb-4">
              <span>{idx + 1} / {seq.length}</span>
              {combo >= 2 && <span className="inline-flex items-center gap-1 text-orange-400 font-black animate-pulse">🔥 {combo} متتالية</span>}
              <span className="inline-flex items-center gap-1 text-yellow-400 font-bold"><Coins size={13} /> {coins}</span>
            </div>

            {/* prompt */}
            <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-5 mb-4 text-center">
              {cur.mode === 'listen' && (<>
                <div className="text-[12px] text-zinc-400 mb-3">استمع واختر المعنى الصحيح</div>
                <button onClick={() => speak(cur.word.en)} className="w-16 h-16 rounded-2xl bg-yellow-400 text-black flex items-center justify-center mx-auto active:scale-95"><Volume2 size={28} /></button>
              </>)}
              {cur.mode === 'match' && (<>
                <div className="text-[12px] text-zinc-400 mb-1">اختر الكلمة الإنجليزية الصحيحة</div>
                <div className="text-white font-black text-[24px]">{cur.word.emoji} {cur.word.ar}</div>
              </>)}
              {cur.mode === 'spell' && (<>
                <div className="text-[12px] text-zinc-400 mb-1">رتّب الحروف لتكوين الكلمة</div>
                <div className="text-white font-black text-[22px]">{cur.word.emoji} {cur.word.ar}</div>
                <button onClick={() => speak(cur.word.en)} className="mt-2 inline-flex items-center gap-1 text-yellow-400 text-[12px] font-bold"><Volume2 size={14} /> استمع</button>
              </>)}
            </div>

            {/* answer area */}
            {cur.mode === 'spell' ? (
              <>
                <div className="min-h-[52px] bg-black/30 border border-dashed border-white/15 rounded-xl p-2 flex flex-wrap gap-2 mb-3 justify-center" dir="ltr">
                  {built.length === 0 && <span className="text-zinc-600 text-[13px] self-center px-2">اضغط الحروف بالترتيب…</span>}
                  {built.map((c, i) => <button key={i} onClick={() => { if (checked) return; setBuilt(b => b.filter((_, k) => k !== i)); setPool(p => [...p, c]) }} className="w-9 h-9 rounded-lg bg-yellow-400 text-black font-black text-[16px] uppercase">{c}</button>)}
                </div>
                <div className="flex flex-wrap gap-2 mb-4 justify-center" dir="ltr">
                  {pool.map((c, i) => <button key={i} onClick={() => { if (checked) return; setPool(p => p.filter((_, k) => k !== i)); setBuilt(b => [...b, c]) }} className="w-9 h-9 rounded-lg bg-white/10 text-white font-black text-[16px] uppercase hover:bg-white/20">{c}</button>)}
                </div>
              </>
            ) : (
              <div className="space-y-2 mb-4">
                {options.map((o, i) => (
                  <button key={i} onClick={() => !checked && setPicked(o)} dir={cur.mode === 'listen' ? 'rtl' : 'ltr'}
                    className={`w-full px-3 py-3 rounded-xl border text-[15px] font-bold ${picked === o ? 'border-yellow-400 bg-yellow-400/10 text-white' : 'border-white/10 text-zinc-300 hover:bg-white/5'} ${cur.mode === 'listen' ? 'text-center' : 'text-left'}`}>{o}</button>
                ))}
              </div>
            )}

            {checked && (
              <div className={`rounded-xl p-3 mb-4 ${checked.correct ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-rose-500/10 border border-rose-500/30'}`}>
                <div className={`flex items-center gap-1.5 font-bold text-[13px] ${checked.correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {checked.correct ? <><CheckCircle2 size={15} /> أحسنت! +5 كوين</> : <><XCircle size={15} /> الإجابة: <span dir="ltr" className="font-black">{cur.word.en}</span> = {cur.word.ar}</>}
                </div>
              </div>
            )}

            {!checked
              ? <button onClick={check} className="w-full py-3.5 rounded-2xl bg-yellow-400 text-black font-black text-[15px]">تحقّق</button>
              : <button onClick={next} className="w-full py-3.5 rounded-2xl bg-white text-black font-black text-[15px] flex items-center justify-center gap-1.5">{idx + 1 >= seq.length ? 'النتيجة' : 'التالي'} <ArrowLeft size={16} /></button>}
          </>
        )}
      </div>
    </Shell>
  )
}

function Shell({ onClose, children, progress }: { onClose: () => void; children: React.ReactNode; progress?: number }) {
  return (
    <div className="fixed inset-0 z-[120] bg-[#14161c] overflow-y-auto vp-fade" dir="rtl">
      <div className="sticky top-0 z-10 bg-[#14161c] border-b border-white/5">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <span className="font-black text-[14px] text-white flex items-center gap-1.5"><Sparkles size={15} className="text-yellow-400" /> ألعاب المفردات</span>
          <div className="flex-1" />
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X size={22} /></button>
        </div>
        {progress != null && <div className="h-1 bg-white/5"><div className="h-full bg-yellow-400 transition-all" style={{ width: `${Math.round(progress * 100)}%` }} /></div>}
      </div>
      {children}
    </div>
  )
}
