'use client'

import { useEffect, useState } from 'react'
import { X, Loader2, CheckCircle2, XCircle, ArrowLeft, Coins, Sparkles, RotateCcw, Shuffle, Languages } from 'lucide-react'
import { fetchChallenges, submitChallenge, type ChallengeItem } from '@/lib/gamification'

type Kind = 'sentence' | 'translation'
interface Props { token: string; courseId?: string | null; kind: Kind; currentModuleId?: string | null; onClose: () => void; onEarned?: () => void }

export default function PracticeHub({ token, courseId, kind, currentModuleId, onClose, onEarned }: Props) {
  const [phase, setPhase] = useState<'setup' | 'run' | 'done'>('setup')
  const [mode, setMode] = useState<'arrange' | 'translate'>(kind === 'translation' ? 'translate' : 'arrange')
  const [scope, setScope] = useState<'lesson' | 'random'>(currentModuleId ? 'lesson' : 'random')
  const [items, setItems] = useState<ChallengeItem[]>([])
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(false)

  // per-item working state
  const [built, setBuilt] = useState<string[]>([])
  const [pool, setPool] = useState<string[]>([])
  const [typed, setTyped] = useState('')
  const [picked, setPicked] = useState<string | null>(null)
  const [checked, setChecked] = useState<{ correct: boolean; answer: string; coins: number } | null>(null)

  const [score, setScore] = useState(0)
  const [coins, setCoins] = useState(0)

  const type: Kind = kind
  const cur = items[idx]

  async function start() {
    setLoading(true)
    const batch = await fetchChallenges(token, type, mode, scope, scope === 'lesson' ? currentModuleId : null, 8)
    setLoading(false)
    if (batch.length === 0) { setItems([]); setPhase('run'); return }
    setItems(batch); setIdx(0); setScore(0); setCoins(0); loadItem(batch[0]); setPhase('run')
  }
  function loadItem(it: ChallengeItem) {
    setChecked(null); setTyped(''); setPicked(null)
    if (it.mode === 'arrange') { setPool(it.words ?? []); setBuilt([]) } else { setPool([]); setBuilt([]) }
  }
  function next() {
    if (idx + 1 >= items.length) { setPhase('done'); onEarned?.(); return }
    const ni = idx + 1; setIdx(ni); loadItem(items[ni])
  }

  async function check() {
    if (!cur || checked) return
    const answer = cur.mode === 'arrange' ? built.join(' ') : (cur.choices ? (picked ?? '') : typed)
    if (!answer.trim()) return
    const res = await submitChallenge(token, type, cur.id, cur.mode, answer, courseId)
    if (!res) return
    setChecked({ correct: res.correct, answer: res.answer, coins: res.coins })
    if (res.correct) { setScore(s => s + 1); setCoins(c => c + res.coins) }
  }

  useEffect(() => { /* reset when kind changes */ setPhase('setup') }, [kind])

  const title = kind === 'translation' ? 'ترجم الجمل' : 'بناء الجمل'

  /* ═══ SETUP ═══ */
  if (phase === 'setup') return (
    <Shell title={title} onClose={onClose}>
      <div className="max-w-md mx-auto px-5 py-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-black flex items-center justify-center mx-auto mb-3">{kind === 'translation' ? <Languages size={30} /> : <Shuffle size={30} />}</div>
          <h1 className="text-white font-black text-[20px]">{title}</h1>
          <p className="text-zinc-400 text-[13px] mt-1.5">تدرّب واكسب <b className="text-yellow-400">+30 كوين</b> لكل جملة صحيحة.</p>
        </div>

        {kind === 'sentence' && (
          <div className="mb-4">
            <div className="text-[12px] font-bold text-zinc-400 mb-1.5">نوع التمرين</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setMode('arrange')} className={`py-3 rounded-xl text-[13px] font-bold ${mode === 'arrange' ? 'bg-yellow-400 text-black' : 'bg-white/5 text-zinc-300 border border-white/10'}`}>ترتيب الجملة</button>
              <button onClick={() => setMode('translate')} className={`py-3 rounded-xl text-[13px] font-bold ${mode === 'translate' ? 'bg-yellow-400 text-black' : 'bg-white/5 text-zinc-300 border border-white/10'}`}>ترجم الجملة</button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="text-[12px] font-bold text-zinc-400 mb-1.5">المصدر</div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setScope('lesson')} disabled={!currentModuleId} className={`py-3 rounded-xl text-[13px] font-bold disabled:opacity-40 ${scope === 'lesson' ? 'bg-yellow-400 text-black' : 'bg-white/5 text-zinc-300 border border-white/10'}`}>درس الوحدة الحالية</button>
            <button onClick={() => setScope('random')} className={`py-3 rounded-xl text-[13px] font-bold ${scope === 'random' ? 'bg-yellow-400 text-black' : 'bg-white/5 text-zinc-300 border border-white/10'}`}>مراجعة عامة</button>
          </div>
        </div>

        <button onClick={start} disabled={loading} className="w-full py-4 rounded-2xl bg-yellow-400 text-black font-black text-[15px] flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />} ابدأ التدريب
        </button>
      </div>
    </Shell>
  )

  /* ═══ DONE ═══ */
  if (phase === 'done') return (
    <Shell title={title} onClose={onClose}>
      <div className="max-w-md mx-auto px-5 py-10 text-center">
        <div className="text-5xl mb-2">{score >= items.length * 0.6 ? '🎉' : '💪'}</div>
        <div className="text-white font-black text-[26px]">{score} / {items.length}</div>
        <div className="inline-flex items-center gap-1.5 mt-2 bg-yellow-400/15 text-yellow-400 font-black px-3 py-1.5 rounded-full"><Coins size={16} /> +{coins} كوين</div>
        <div className="flex gap-2 mt-6">
          <button onClick={() => setPhase('setup')} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 font-bold text-[13px] flex items-center justify-center gap-1.5"><RotateCcw size={15} /> تدريب آخر</button>
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-yellow-400 text-black font-black text-[13px]">إنهاء</button>
        </div>
      </div>
    </Shell>
  )

  /* ═══ RUN ═══ */
  return (
    <Shell title={title} onClose={onClose} progress={items.length ? (idx) / items.length : 0}>
      <div className="max-w-md mx-auto px-5 py-6">
        {items.length === 0 ? (
          <div className="text-center text-zinc-400 py-16 text-[14px]">لا توجد جمل متاحة لهذا الاختيار بعد. جرّب «مراجعة عامة».</div>
        ) : !cur ? null : (
          <>
            <div className="flex items-center justify-between text-[12px] text-zinc-500 mb-4"><span>السؤال {idx + 1} من {items.length}</span><span className="inline-flex items-center gap-1 text-yellow-400 font-bold"><Coins size={13} /> {coins}</span></div>

            {/* prompt */}
            <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 mb-4 text-center">
              {cur.mode === 'arrange'
                ? <div className="text-[12px] text-zinc-400">رتّب الكلمات لتكوين الجملة الصحيحة</div>
                : <><div className="text-[12px] text-zinc-400 mb-1">ترجم إلى الإنجليزية</div><div className="text-white font-black text-[18px]">{cur.arabic}</div></>}
            </div>

            {/* answer area */}
            {cur.mode === 'arrange' ? (
              <>
                <div className="min-h-[52px] bg-black/30 border border-dashed border-white/15 rounded-xl p-2 flex flex-wrap gap-2 mb-3" dir="ltr">
                  {built.length === 0 && <span className="text-zinc-600 text-[13px] self-center px-2">اضغط الكلمات بالترتيب…</span>}
                  {built.map((w, i) => <button key={i} onClick={() => { if (checked) return; setBuilt(b => b.filter((_, k) => k !== i)); setPool(p => [...p, w]) }} className="px-3 py-1.5 rounded-lg bg-yellow-400 text-black font-bold text-[13px]">{w}</button>)}
                </div>
                <div className="flex flex-wrap gap-2 mb-4" dir="ltr">
                  {pool.map((w, i) => <button key={i} onClick={() => { if (checked) return; setPool(p => p.filter((_, k) => k !== i)); setBuilt(b => [...b, w]) }} className="px-3 py-1.5 rounded-lg bg-white/10 text-white font-bold text-[13px] hover:bg-white/20">{w}</button>)}
                </div>
              </>
            ) : cur.choices && cur.choices.length ? (
              <div className="space-y-2 mb-4">
                {cur.choices.map((c, i) => (
                  <button key={i} onClick={() => !checked && setPicked(c)} dir="ltr" className={`w-full text-left px-3 py-2.5 rounded-xl border text-[14px] ${picked === c ? 'border-yellow-400 bg-yellow-400/10 text-white font-bold' : 'border-white/10 text-zinc-300 hover:bg-white/5'}`}>{c}</button>
                ))}
              </div>
            ) : (
              <input value={typed} onChange={e => setTyped(e.target.value)} disabled={!!checked} dir="ltr" placeholder="Type the English sentence..."
                className="w-full mb-4 px-4 py-3 rounded-xl bg-black/30 border border-white/15 text-white text-[15px] focus:outline-none focus:border-yellow-400" style={{ textAlign: 'left' }} />
            )}

            {/* feedback */}
            {checked && (
              <div className={`rounded-xl p-3 mb-4 ${checked.correct ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-rose-500/10 border border-rose-500/30'}`}>
                <div className={`flex items-center gap-1.5 font-bold text-[13px] ${checked.correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {checked.correct ? <><CheckCircle2 size={15} /> إجابة صحيحة! +{checked.coins} كوين</> : <><XCircle size={15} /> ليست صحيحة</>}
                </div>
                {!checked.correct && <div className="text-[13px] text-zinc-200 mt-1" dir="ltr" style={{ textAlign: 'left' }}>✔ {checked.answer}</div>}
              </div>
            )}

            {!checked
              ? <button onClick={check} className="w-full py-3.5 rounded-2xl bg-yellow-400 text-black font-black text-[15px]">تحقّق</button>
              : <button onClick={next} className="w-full py-3.5 rounded-2xl bg-white text-black font-black text-[15px] flex items-center justify-center gap-1.5">{idx + 1 >= items.length ? 'النتيجة' : 'التالي'} <ArrowLeft size={16} /></button>}
          </>
        )}
      </div>
    </Shell>
  )
}

function Shell({ title, onClose, children, progress }: { title: string; onClose: () => void; children: React.ReactNode; progress?: number }) {
  return (
    <div className="fixed inset-0 z-[120] bg-[#14161c] overflow-y-auto vp-fade" dir="rtl">
      <div className="sticky top-0 z-10 bg-[#14161c] border-b border-white/5">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <span className="font-black text-[14px] text-white flex items-center gap-1.5"><Sparkles size={15} className="text-yellow-400" /> {title}</span>
          <div className="flex-1" />
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X size={22} /></button>
        </div>
        {progress != null && <div className="h-1 bg-white/5"><div className="h-full bg-yellow-400 transition-all" style={{ width: `${Math.round(progress * 100)}%` }} /></div>}
      </div>
      {children}
    </div>
  )
}
