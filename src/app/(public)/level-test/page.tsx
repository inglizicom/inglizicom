'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Heart, CheckCircle2, XCircle, Volume2, Loader2, RotateCcw, MessageCircle,
  Trophy, Sparkles, PenLine, Headphones, BookOpen, Brain, ListChecks,
  Type, Shuffle, Award,
} from 'lucide-react'
import {
  QUESTIONS, WRITING_PROMPTS, LEVEL_ORDER, LEVEL_META, HEARTS,
  CEFR_FEEDBACK, SKILL_LABELS, TYPE_LABELS, recommendPlan,
  type CEFRLevel, type Question, type QType, type SkillKey,
} from '@/data/placement-test'
import { isCorrect, gradeWriting, finalLevel, type WritingReport } from '@/lib/placement'
import { getPlan } from '@/data/plans'
import { createSubscriptionLead, getAttribution } from '@/lib/leads-db'

/* ══════════════════════════════════════════════════════════════════════════
   PLACEMENT TEST
   ══════════════════════════════════════════════════════════════════════════

   Six levels, three hearts each. Lose all three and the test ends — you are
   placed at the last level you finished. Clear a level and the next one
   starts with a fresh three, because being stretched should not be punished
   with the debt of the level before.

   After the quiz comes one piece of writing, graded automatically. It can move
   the final placement by one level in either direction: a quiz can be guessed,
   a paragraph cannot.
   ══════════════════════════════════════════════════════════════════════════ */

const WHATSAPP = '212764189311'

type Phase = 'intro' | 'quiz' | 'levelUp' | 'writing' | 'grading' | 'result'

interface Answered { qid: number; ok: boolean; skill: SkillKey; level: CEFRLevel }

const TYPE_ICON: Record<QType, typeof Brain> = {
  mcq: Brain, multi: ListChecks, gap: Type, order: Shuffle,
  reading: BookOpen, listenMcq: Headphones, listenGap: Headphones, listenWrite: Headphones,
}

/* ── Audio ──────────────────────────────────────────────────────────────── */

/** Neural voice when the server can provide one, browser voice when it can't.
 *  Listening questions are the one place a robotic voice really hurts, so we
 *  try the good one first and degrade rather than fail. */
function useSpeech() {
  const [busy, setBusy] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const cache = useRef<Map<string, string>>(new Map())

  useEffect(() => () => {
    audioRef.current?.pause()
    cache.current.forEach(url => URL.revokeObjectURL(url))
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
  }, [])

  function browserVoice(text: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'; u.rate = 0.85
    u.onend = () => setBusy(false)
    u.onerror = () => setBusy(false)
    window.speechSynthesis.speak(u)
  }

  async function say(text: string) {
    setBusy(true)
    audioRef.current?.pause()

    const cached = cache.current.get(text)
    if (cached) {
      const a = new Audio(cached)
      audioRef.current = a
      a.onended = () => setBusy(false)
      a.play().catch(() => { setBusy(false); browserVoice(text) })
      return
    }

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, provider: 'google' }),
        signal: AbortSignal.timeout(9000),
      })
      if (!res.ok) throw new Error('tts')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      cache.current.set(text, url)
      const a = new Audio(url)
      audioRef.current = a
      a.onended = () => setBusy(false)
      a.onerror = () => { setBusy(false); browserVoice(text) }
      await a.play()
    } catch {
      browserVoice(text)
    }
  }

  return { say, busy }
}

/* ══════════════════════════════════════════════════════════════════════════ */

export default function LevelTestPage() {
  const [phase, setPhase] = useState<Phase>('intro')

  const [levelIdx, setLevelIdx] = useState(0)
  const [qIdx, setQIdx]         = useState(0)
  const [hearts, setHearts]     = useState(HEARTS)
  const [clearedIdx, setClearedIdx] = useState(-1)   // last level fully passed

  const [log, setLog] = useState<Answered[]>([])

  /* response state for the current question */
  const [option, setOption]   = useState<number | null>(null)
  const [multi, setMulti]     = useState<number[]>([])
  const [texts, setTexts]     = useState<string[]>([])
  const [order, setOrder]     = useState<number[]>([])
  const [verdict, setVerdict] = useState<'waiting' | 'correct' | 'wrong'>('waiting')
  const [heard, setHeard]     = useState(false)

  /* writing */
  const [essay, setEssay]     = useState('')
  const [report, setReport]   = useState<WritingReport | null>(null)

  const { say, busy: speaking } = useSpeech()

  const level = LEVEL_ORDER[levelIdx]
  const bank  = QUESTIONS[level] ?? []
  const q     = bank[qIdx]

  /* Reset the response slots whenever we move to a new question. */
  useEffect(() => {
    setOption(null); setMulti([]); setOrder([]); setVerdict('waiting'); setHeard(false)
    setTexts(q?.type === 'listenGap' ? Array(q.accept?.length ?? 1).fill('')
           : q?.type === 'gap'       ? Array(q.accept?.length ?? 1).fill('')
           : [''])
  }, [q?.id, q?.type, q?.accept?.length])

  /* ── Flow ─────────────────────────────────────────────────────────────── */

  function submit() {
    if (!q || verdict !== 'waiting') return
    const ok = isCorrect(q, { option, multi, text: texts, order })
    setVerdict(ok ? 'correct' : 'wrong')
    setLog(l => [...l, { qid: q.id, ok, skill: q.skill, level: q.level }])
    if (!ok) setHearts(h => h - 1)
  }

  function next() {
    if (hearts <= 0) { startWriting(); return }
    if (qIdx + 1 < bank.length) { setQIdx(i => i + 1); return }
    // level cleared
    setClearedIdx(levelIdx)
    if (levelIdx + 1 < LEVEL_ORDER.length) setPhase('levelUp')
    else startWriting()
  }

  function nextLevel() {
    setLevelIdx(i => i + 1)
    setQIdx(0)
    setHearts(HEARTS)
    setPhase('quiz')
  }

  function startWriting() {
    setPhase('writing')
  }

  async function submitWriting() {
    setPhase('grading')
    const promptLevel = LEVEL_ORDER[Math.max(0, clearedIdx)]
    const r = await gradeWriting(essay, WRITING_PROMPTS[promptLevel], promptLevel)
    setReport(r)
    setPhase('result')
  }

  function skipWriting() {
    setReport(null)
    setPhase('result')
  }

  function restart() {
    setPhase('intro'); setLevelIdx(0); setQIdx(0); setHearts(HEARTS)
    setClearedIdx(-1); setLog([]); setEssay(''); setReport(null)
  }

  /* ── Derived ──────────────────────────────────────────────────────────── */

  const quizLevel: CEFRLevel = clearedIdx >= 0 ? LEVEL_ORDER[clearedIdx] : 'A0'
  const placement = useMemo(() => finalLevel(quizLevel, report), [quizLevel, report])

  const skillStats = useMemo(() => {
    const out: Partial<Record<SkillKey, { correct: number; total: number }>> = {}
    for (const a of log) {
      const s = out[a.skill] ?? { correct: 0, total: 0 }
      s.total++; if (a.ok) s.correct++
      out[a.skill] = s
    }
    return out
  }, [log])

  /* ═══ INTRO ═══════════════════════════════════════════════════════════ */
  if (phase === 'intro') return <Intro onStart={() => setPhase('quiz')} />

  /* ═══ LEVEL UP ════════════════════════════════════════════════════════ */
  if (phase === 'levelUp') {
    const done = LEVEL_ORDER[clearedIdx]
    const nxt  = LEVEL_ORDER[clearedIdx + 1]
    return (
      <Shell>
        <div className="max-w-lg mx-auto text-center py-10 animate-fade-up">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-2xl"
               style={{ background: `linear-gradient(135deg, ${LEVEL_META[done].from}, ${LEVEL_META[done].to})` }}>
            <Trophy size={44} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">أنهيت مستوى {done} 🎉</h2>
          <p className="text-slate-400 font-semibold mb-1">{LEVEL_META[done].label} — {LEVEL_META[done].sub}</p>
          <p className="text-slate-500 text-sm mb-8">
            بقيت لك <span className="text-rose-400 font-bold">{hearts}</span> من {HEARTS} قلوب في هذا المستوى.
          </p>

          <div className="bg-white/5 ring-1 ring-white/10 rounded-2xl p-5 mb-8">
            <p className="text-slate-300 text-sm font-semibold mb-1">التالي: مستوى {nxt}</p>
            <p className="text-slate-500 text-xs">{LEVEL_META[nxt].label} — تبدأ بـ {HEARTS} قلوب جديدة.</p>
          </div>

          <div className="flex flex-col gap-2.5">
            <button onClick={nextLevel}
                    className="w-full py-4 rounded-2xl bg-gradient-to-l from-yellow-400 to-amber-500 text-black font-black text-lg hover:brightness-110 transition shadow-xl">
              أكمل إلى {nxt} ←
            </button>
            <button onClick={startWriting}
                    className="w-full py-3 rounded-2xl bg-white/5 ring-1 ring-white/10 text-slate-300 font-bold hover:bg-white/10 transition">
              أتوقف هنا وأرى نتيجتي
            </button>
          </div>
        </div>
      </Shell>
    )
  }

  /* ═══ WRITING ═════════════════════════════════════════════════════════ */
  if (phase === 'writing') {
    const wp = WRITING_PROMPTS[LEVEL_ORDER[Math.max(0, clearedIdx)]]
    const words = essay.trim() ? essay.trim().split(/\s+/).filter(Boolean).length : 0
    const enough = words >= Math.min(wp.minWords, 10)
    return (
      <Shell>
        <div className="max-w-2xl mx-auto py-6 animate-fade-up">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
              <PenLine size={20} className="text-white" />
            </span>
            <div>
              <h2 className="text-xl font-black text-white">اختبار الكتابة</h2>
              <p className="text-slate-500 text-xs font-semibold">آخر خطوة — يُصحَّح تلقائياً</p>
            </div>
          </div>

          <div className="bg-white/5 ring-1 ring-white/10 rounded-2xl p-5 mb-4">
            <p className="text-slate-400 text-[13px] font-semibold mb-2">{wp.hint}</p>
            <p className="text-white text-lg font-bold leading-relaxed mb-4" dir="ltr">{wp.prompt}</p>
            <ul className="space-y-1.5">
              {wp.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-400 text-[13px]">
                  <span className="text-yellow-400 mt-0.5">•</span> <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <textarea
            value={essay} onChange={e => setEssay(e.target.value)}
            dir="ltr" rows={9} placeholder="Write your answer here…"
            className="w-full p-4 rounded-2xl bg-white/[.04] ring-1 ring-white/10 text-white text-[15px] leading-relaxed
                       placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 transition text-left"
          />

          <div className="flex items-center justify-between mt-2 mb-6">
            <span className={`text-xs font-bold ${enough ? 'text-emerald-400' : 'text-slate-500'}`}>
              {words} كلمة {wp.minWords ? `· المطلوب ${wp.minWords}` : ''}
            </span>
            {!enough && <span className="text-slate-600 text-xs">اكتب 10 كلمات على الأقل</span>}
          </div>

          <div className="flex flex-col gap-2.5">
            <button onClick={submitWriting} disabled={!enough}
                    className="w-full py-4 rounded-2xl bg-gradient-to-l from-yellow-400 to-amber-500 text-black font-black text-lg
                               hover:brightness-110 transition shadow-xl disabled:opacity-40 disabled:cursor-not-allowed">
              صحّح كتابتي وأظهر النتيجة
            </button>
            <button onClick={skipWriting}
                    className="w-full py-3 rounded-2xl text-slate-500 font-bold hover:text-slate-300 transition text-sm">
              تخطّي الكتابة
            </button>
          </div>
        </div>
      </Shell>
    )
  }

  /* ═══ GRADING ═════════════════════════════════════════════════════════ */
  if (phase === 'grading') {
    return (
      <Shell>
        <div className="max-w-md mx-auto py-24 text-center">
          <Loader2 size={40} className="mx-auto text-yellow-400 animate-spin mb-5" />
          <h2 className="text-xl font-black text-white mb-2">جاري تصحيح كتابتك…</h2>
          <p className="text-slate-500 text-sm">نحلّل القواعد والمفردات والتراكيب.</p>
        </div>
      </Shell>
    )
  }

  /* ═══ RESULT ══════════════════════════════════════════════════════════ */
  if (phase === 'result') {
    return (
      <Result
        level={placement.level} adjusted={placement.adjusted} quizLevel={quizLevel}
        report={report} log={log} skillStats={skillStats} onRestart={restart}
      />
    )
  }

  /* ═══ QUIZ ════════════════════════════════════════════════════════════ */
  if (!q) return null
  const Icon = TYPE_ICON[q.type]
  const needsAudio = q.type.startsWith('listen')
  const answered = verdict !== 'waiting'

  const canSubmit =
    q.type === 'mcq' || q.type === 'reading' || q.type === 'listenMcq' ? option !== null
    : q.type === 'multi' ? multi.length > 0
    : q.type === 'order' ? order.length === (q.words?.length ?? 0)
    : texts.some(t => t.trim().length > 0)

  return (
    <Shell>
      {/* progress + hearts */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-black text-white shadow"
                  style={{ background: `linear-gradient(135deg, ${LEVEL_META[level].from}, ${LEVEL_META[level].to})` }}>
              {level}
            </span>
            <span className="text-slate-500 text-xs font-bold">{LEVEL_META[level].label}</span>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: HEARTS }).map((_, i) => (
              <Heart key={i} size={20}
                     className={i < hearts ? 'text-rose-500 fill-rose-500' : 'text-slate-700'} />
            ))}
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-l from-yellow-400 to-amber-500 transition-all duration-500"
               style={{ width: `${((qIdx + (answered ? 1 : 0)) / bank.length) * 100}%` }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-slate-600 text-[11px] font-bold">سؤال {qIdx + 1} من {bank.length}</span>
          <span className="text-slate-600 text-[11px] font-bold">{TYPE_LABELS[q.type]}</span>
        </div>
      </div>

      {/* the question */}
      <div className="max-w-2xl mx-auto" key={q.id}>
        <div className="animate-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-xl bg-white/[.06] ring-1 ring-white/10 flex items-center justify-center">
              <Icon size={15} className="text-yellow-400" />
            </span>
            <span className="text-slate-400 text-[13px] font-bold">{q.hint}</span>
          </div>

          {q.passage && (
            <pre className="bg-white/[.04] ring-1 ring-white/10 rounded-2xl p-4 mb-4 text-slate-200 text-[14px]
                            leading-relaxed whitespace-pre-wrap font-sans text-left" dir="ltr">{q.passage}</pre>
          )}

          {needsAudio && (
            <AudioBox text={q.audio!} onPlay={() => { say(q.audio!); setHeard(true) }}
                      speaking={speaking} heard={heard} revealed={answered} />
          )}

          {q.type !== 'listenWrite' && (
            <h2 className="text-white text-xl sm:text-2xl font-black mb-5 leading-snug"
                dir={/[؀-ۿ]/.test(q.question) ? 'rtl' : 'ltr'}>
              {q.question}
            </h2>
          )}

          <QuestionBody
            q={q} answered={answered} verdict={verdict}
            option={option} setOption={setOption}
            multi={multi} setMulti={setMulti}
            texts={texts} setTexts={setTexts}
            order={order} setOrder={setOrder}
          />

          {answered && (
            <div className={`mt-5 rounded-2xl p-4 ring-1 animate-fade-up ${
              verdict === 'correct' ? 'bg-emerald-500/10 ring-emerald-500/30' : 'bg-rose-500/10 ring-rose-500/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                {verdict === 'correct'
                  ? <><CheckCircle2 size={18} className="text-emerald-400" /><span className="font-black text-emerald-300">إجابة صحيحة</span></>
                  : <><XCircle size={18} className="text-rose-400" /><span className="font-black text-rose-300">إجابة خاطئة</span></>}
              </div>
              <p className="text-slate-300 text-[13.5px] leading-relaxed whitespace-pre-line">{q.explain}</p>
            </div>
          )}

          <div className="mt-6 pb-10">
            {!answered ? (
              <button onClick={submit} disabled={!canSubmit || (needsAudio && !heard)}
                      className="w-full py-4 rounded-2xl bg-gradient-to-l from-yellow-400 to-amber-500 text-black font-black text-lg
                                 hover:brightness-110 transition shadow-xl disabled:opacity-30 disabled:cursor-not-allowed">
                {needsAudio && !heard ? 'استمع أولاً' : 'تحقّق'}
              </button>
            ) : (
              <button onClick={next}
                      className="w-full py-4 rounded-2xl bg-white text-black font-black text-lg hover:bg-slate-100 transition shadow-xl">
                {hearts <= 0 ? 'انتهى الاختبار — أظهر النتيجة'
                  : qIdx + 1 < bank.length ? 'السؤال التالي ←'
                  : 'أنهيت المستوى ←'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Shell>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   PIECES
   ══════════════════════════════════════════════════════════════════════════ */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main dir="rtl" className="min-h-screen bg-[#0B1020] font-sans">
      <div className="pointer-events-none fixed top-0 left-0 w-screen h-screen -z-10"
           style={{ backgroundImage:
             'radial-gradient(46rem 30rem at 85% -8%, rgba(245,158,11,.14), transparent 62%),' +
             'radial-gradient(40rem 26rem at 6% 6%, rgba(59,130,246,.12), transparent 60%)' }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">{children}</div>
    </main>
  )
}

function AudioBox({
  text, onPlay, speaking, heard, revealed,
}: { text: string; onPlay: () => void; speaking: boolean; heard: boolean; revealed: boolean }) {
  return (
    <div className="mb-5 rounded-2xl bg-gradient-to-l from-blue-500/10 to-violet-500/10 ring-1 ring-blue-400/25 p-5">
      <button onClick={onPlay} disabled={speaking}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-blue-500 hover:bg-blue-400
                         transition text-white font-black text-lg shadow-lg disabled:opacity-70">
        {speaking ? <Loader2 size={22} className="animate-spin" /> : <Volume2 size={22} />}
        {speaking ? 'جاري التشغيل…' : heard ? 'استمع مرة أخرى' : 'اضغط للاستماع'}
      </button>
      <p className="text-blue-200/60 text-[11.5px] font-semibold text-center mt-2.5">
        {heard ? 'يمكنك الإعادة بقدر ما تحتاج' : 'يجب الاستماع قبل الإجابة'}
      </p>
      {/* the transcript is a teaching moment, so it appears only after answering */}
      {revealed && (
        <p className="mt-3 pt-3 border-t border-blue-400/20 text-blue-100 text-[13px] text-left leading-relaxed" dir="ltr">
          “{text}”
        </p>
      )}
    </div>
  )
}

function QuestionBody({
  q, answered, verdict, option, setOption, multi, setMulti, texts, setTexts, order, setOrder,
}: {
  q: Question; answered: boolean; verdict: 'waiting' | 'correct' | 'wrong'
  option: number | null; setOption: (n: number) => void
  multi: number[]; setMulti: React.Dispatch<React.SetStateAction<number[]>>
  texts: string[]; setTexts: React.Dispatch<React.SetStateAction<string[]>>
  order: number[]; setOrder: React.Dispatch<React.SetStateAction<number[]>>
}) {

  /* ── single choice ── */
  if (q.type === 'mcq' || q.type === 'reading' || q.type === 'listenMcq') {
    return (
      <div className="space-y-2.5">
        {(q.options ?? []).map((opt, i) => {
          const chosen = option === i
          const right  = answered && i === q.answer
          const wrong  = answered && chosen && i !== q.answer
          return (
            <button key={i} onClick={() => !answered && setOption(i)} disabled={answered}
                    dir={/[؀-ۿ]/.test(opt) ? 'rtl' : 'ltr'}
                    className={`w-full text-right p-4 rounded-2xl ring-1 font-bold text-[15px] transition-all
                      ${right ? 'bg-emerald-500/15 ring-emerald-400/50 text-emerald-200'
                        : wrong ? 'bg-rose-500/15 ring-rose-400/50 text-rose-200'
                        : chosen ? 'bg-yellow-400/15 ring-yellow-400/50 text-white'
                        : 'bg-white/[.04] ring-white/10 text-slate-200 hover:bg-white/[.08] hover:ring-white/20'}`}>
              <span className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-black
                  ${right ? 'bg-emerald-400 text-black' : wrong ? 'bg-rose-400 text-black'
                    : chosen ? 'bg-yellow-400 text-black' : 'bg-white/10 text-slate-400'}`}>
                  {right ? '✓' : wrong ? '✕' : String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1" dir="ltr">{opt}</span>
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  /* ── multiple correct ── */
  if (q.type === 'multi') {
    // functional update: two taps inside one React batch would otherwise both
    // read the same stale array and the first selection would vanish
    const toggle = (i: number) =>
      setMulti(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
    return (
      <>
        <p className="text-slate-500 text-xs font-bold mb-2.5">يمكن اختيار أكثر من إجابة</p>
        <div className="space-y-2.5">
          {(q.options ?? []).map((opt, i) => {
            const chosen = multi.includes(i)
            const should = (q.answers ?? []).includes(i)
            const right  = answered && should
            const wrong  = answered && chosen && !should
            return (
              <button key={i} onClick={() => !answered && toggle(i)} disabled={answered}
                      className={`w-full text-right p-4 rounded-2xl ring-1 font-bold text-[15px] transition-all
                        ${right ? 'bg-emerald-500/15 ring-emerald-400/50 text-emerald-200'
                          : wrong ? 'bg-rose-500/15 ring-rose-400/50 text-rose-200'
                          : chosen ? 'bg-yellow-400/15 ring-yellow-400/50 text-white'
                          : 'bg-white/[.04] ring-white/10 text-slate-200 hover:bg-white/[.08]'}`}>
                <span className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-xs font-black ring-1
                    ${right ? 'bg-emerald-400 text-black ring-emerald-400'
                      : wrong ? 'bg-rose-400 text-black ring-rose-400'
                      : chosen ? 'bg-yellow-400 text-black ring-yellow-400' : 'ring-white/25 text-transparent'}`}>
                    ✓
                  </span>
                  <span className="flex-1" dir="ltr">{opt}</span>
                </span>
              </button>
            )
          })}
        </div>
      </>
    )
  }

  /* ── typed gaps ── */
  if (q.type === 'gap' || q.type === 'listenGap') {
    const template = q.type === 'listenGap' ? (q.transcript ?? '') : q.question
    const parts = template.split('___')
    return (
      <div className="bg-white/[.04] ring-1 ring-white/10 rounded-2xl p-5">
        <p className="text-white text-[17px] leading-[2.4] text-left" dir="ltr">
          {parts.map((part, i) => (
            <span key={i}>
              {part}
              {i < parts.length - 1 && (
                <input
                  value={texts[i] ?? ''} disabled={answered}
                  onChange={e => setTexts(prev => { const t = [...prev]; t[i] = e.target.value; return t })}
                  className={`inline-block mx-1 px-3 py-1 w-32 rounded-lg text-center font-bold ring-1 transition
                    ${answered
                      ? verdict === 'correct'
                        ? 'bg-emerald-500/15 ring-emerald-400/50 text-emerald-200'
                        : 'bg-rose-500/15 ring-rose-400/50 text-rose-200'
                      : 'bg-white/10 ring-white/20 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/60'}`}
                  placeholder="…"
                />
              )}
            </span>
          ))}
        </p>
        {answered && verdict === 'wrong' && (
          <p className="mt-3 pt-3 border-t border-white/10 text-emerald-300 text-[13px] font-bold text-left" dir="ltr">
            ✓ {(q.accept ?? []).map(a => a[0]).join('  ·  ')}
          </p>
        )}
      </div>
    )
  }

  /* ── dictation ── */
  if (q.type === 'listenWrite') {
    return (
      <div>
        <textarea
          value={texts[0] ?? ''} disabled={answered}
          onChange={e => setTexts([e.target.value])}
          dir="ltr" rows={3} placeholder="Type what you hear…"
          className={`w-full p-4 rounded-2xl ring-1 text-white text-[16px] leading-relaxed text-left transition
            ${answered
              ? verdict === 'correct' ? 'bg-emerald-500/10 ring-emerald-400/40' : 'bg-rose-500/10 ring-rose-400/40'
              : 'bg-white/[.04] ring-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400/60'}`}
        />
        <p className="text-slate-600 text-[11px] font-semibold mt-2">
          لا تقلق بشأن علامات الترقيم — نحن نقيس ما سمعته.
        </p>
      </div>
    )
  }

  /* ── reorder ── */
  if (q.type === 'order') {
    const words = q.words ?? []
    const pick = (i: number) => {
      if (answered) return
      setOrder(prev => prev.includes(i) ? prev : [...prev, i])
    }
    const undo = () => { if (!answered) setOrder(prev => prev.slice(0, -1)) }
    return (
      <div>
        <div className={`min-h-[68px] rounded-2xl p-3 mb-4 ring-1 flex flex-wrap gap-2 items-center
          ${answered ? verdict === 'correct' ? 'bg-emerald-500/10 ring-emerald-400/40' : 'bg-rose-500/10 ring-rose-400/40'
            : 'bg-white/[.04] ring-white/10'}`} dir="ltr">
          {order.length === 0
            ? <span className="text-slate-600 text-sm px-2">اضغط الكلمات بالترتيب…</span>
            : order.map((wi, k) => (
                <span key={k} className="px-3 py-2 rounded-xl bg-yellow-400 text-black font-bold text-[15px]">
                  {words[wi]}
                </span>
              ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-3" dir="ltr">
          {words.map((w, i) => (
            <button key={i} onClick={() => pick(i)} disabled={answered || order.includes(i)}
                    className={`px-3 py-2 rounded-xl font-bold text-[15px] ring-1 transition
                      ${order.includes(i) ? 'opacity-25 ring-white/10 text-slate-600'
                        : 'bg-white/[.06] ring-white/15 text-white hover:bg-white/[.12]'}`}>
              {w}
            </button>
          ))}
        </div>

        {!answered && order.length > 0 && (
          <button onClick={undo} className="text-slate-500 text-xs font-bold hover:text-slate-300 transition">
            ↩ تراجع عن آخر كلمة
          </button>
        )}
        {answered && verdict === 'wrong' && (
          <p className="text-emerald-300 text-[14px] font-bold text-left mt-2" dir="ltr">
            ✓ {(q.correctOrder ?? []).map(i => words[i]).join(' ')}
          </p>
        )}
      </div>
    )
  }

  return null
}

/* ══════════════════════════════════════════════════════════════════════════
   INTRO
   ══════════════════════════════════════════════════════════════════════════ */

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <Shell>
      <div className="max-w-2xl mx-auto py-8 text-center animate-fade-up">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-2xl">
          <Brain size={38} className="text-black" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
          اختبر مستواك في الإنجليزية
        </h1>
        <p className="text-slate-400 font-semibold mb-8 leading-relaxed">
          من <span className="text-white">A0</span> إلى <span className="text-white">C1</span> — قواعد ومفردات
          واستيعاب واستماع وكتابة. النتيجة في نهاية الاختبار مع الدورة المناسبة لك.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-8 text-right">
          {[
            { icon: Heart,      t: 'ثلاثة قلوب لكل مستوى', s: 'تخسر قلباً مع كل خطأ. تنتهي القلوب → ينتهي الاختبار.' },
            { icon: Headphones, t: 'أسئلة استماع حقيقية',   s: 'تستمع وتكتب ما سمعته أو تكمل الفراغات.' },
            { icon: ListChecks, t: 'أنواع أسئلة متنوعة',    s: 'اختيار، اختيارات متعددة، فراغات، ترتيب، قراءة.' },
            { icon: PenLine,    t: 'اختبار كتابة مصحّح',    s: 'تكتب فقرة ونصحّحها لك تلقائياً في النهاية.' },
          ].map((f, i) => (
            <div key={i} className="bg-white/[.04] ring-1 ring-white/10 rounded-2xl p-4 flex items-start gap-3">
              <span className="w-9 h-9 rounded-xl bg-yellow-400/15 flex items-center justify-center shrink-0">
                <f.icon size={17} className="text-yellow-400" />
              </span>
              <div>
                <div className="text-white font-bold text-[14px]">{f.t}</div>
                <div className="text-slate-500 text-[12px] leading-relaxed mt-0.5">{f.s}</div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={onStart}
                className="w-full sm:w-auto px-12 py-4 rounded-2xl bg-gradient-to-l from-yellow-400 to-amber-500 text-black
                           font-black text-lg hover:brightness-110 transition shadow-2xl">
          ابدأ الاختبار
        </button>
        <p className="text-slate-600 text-xs font-semibold mt-4">مجاني تماماً · حوالي 10 دقائق</p>
      </div>
    </Shell>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   RESULT
   ══════════════════════════════════════════════════════════════════════════ */

function Result({
  level, adjusted, quizLevel, report, log, skillStats, onRestart,
}: {
  level: CEFRLevel
  adjusted: 'up' | 'down' | null
  quizLevel: CEFRLevel
  report: WritingReport | null
  log: Answered[]
  skillStats: Partial<Record<SkillKey, { correct: number; total: number }>>
  onRestart: () => void
}) {
  const meta = LEVEL_META[level]
  const fb   = CEFR_FEEDBACK[level]
  const planId = recommendPlan(level)
  const plan = getPlan(planId)
  const correct = log.filter(a => a.ok).length

  return (
    <Shell>
      <div className="max-w-2xl mx-auto py-6 space-y-5 animate-fade-up">

        {/* ── the verdict ── */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-5 rounded-3xl flex items-center justify-center shadow-2xl"
               style={{ background: `linear-gradient(135deg, ${meta.from}, ${meta.to})` }}>
            <Award size={44} className="text-white" />
          </div>
          <p className="text-slate-500 font-bold text-sm mb-1">مستواك في الإنجليزية</p>
          <h1 className="text-6xl font-black text-white mb-2 tracking-tight">{level}</h1>
          <p className={`text-lg font-black ${meta.text}`}>{meta.label}</p>
          <p className="text-slate-500 text-sm font-semibold">{meta.sub}</p>

          {adjusted && (
            <p className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[.06] ring-1 ring-white/10 text-[12px] font-bold text-slate-300">
              <Sparkles size={12} className="text-yellow-400" />
              {adjusted === 'down'
                ? `اجتزت أسئلة ${quizLevel}، لكن كتابتك تناسب ${level} — وضعناك حيث ستتقدم فعلاً.`
                : `كتابتك أقوى من نتيجة الأسئلة — رفعناك من ${quizLevel} إلى ${level}.`}
            </p>
          )}
        </div>

        <p className="text-slate-300 text-[15px] leading-relaxed text-center bg-white/[.04] ring-1 ring-white/10 rounded-2xl p-5">
          {fb.summary}
        </p>

        {/* ── numbers ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { v: `${correct}/${log.length}`, l: 'إجابة صحيحة' },
            { v: quizLevel, l: 'أعلى مستوى اجتزته' },
            { v: report ? `${report.score}%` : '—', l: 'درجة الكتابة' },
          ].map((s, i) => (
            <div key={i} className="bg-white/[.04] ring-1 ring-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-white tabular-nums">{s.v}</div>
              <div className="text-slate-500 text-[11px] font-bold mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        {/* ── skills ── */}
        <div className="bg-white/[.04] ring-1 ring-white/10 rounded-2xl p-5">
          <h3 className="text-white font-black mb-4">أداؤك حسب المهارة</h3>
          <div className="space-y-3">
            {(Object.keys(skillStats) as SkillKey[]).map(k => {
              const s = skillStats[k]!
              const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0
              return (
                <div key={k}>
                  <div className="flex justify-between text-[12.5px] font-bold mb-1.5">
                    <span className="text-slate-300">{SKILL_LABELS[k]}</span>
                    <span className="text-slate-500 tabular-nums">{s.correct}/{s.total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                         style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${meta.from}, ${meta.to})` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── writing feedback ── */}
        {report && <WritingFeedback report={report} />}

        {/* ── what to work on ── */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-emerald-500/[.07] ring-1 ring-emerald-500/20 rounded-2xl p-5">
            <h3 className="text-emerald-300 font-black mb-3 text-[14px]">تستطيع الآن</h3>
            <ul className="space-y-2">
              {fb.canDo.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300 text-[13px]">
                  <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" /><span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-amber-500/[.07] ring-1 ring-amber-500/20 rounded-2xl p-5">
            <h3 className="text-amber-300 font-black mb-3 text-[14px]">ركّز على</h3>
            <ul className="space-y-2">
              {fb.focus.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300 text-[13px]">
                  <span className="text-amber-400 mt-0.5 shrink-0">→</span><span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── the offer ── */}
        {plan && <SubscribeCard level={level} plan={plan} />}

        <div className="flex flex-col sm:flex-row gap-2.5 pb-12">
          <button onClick={onRestart}
                  className="flex-1 py-3.5 rounded-2xl bg-white/[.06] ring-1 ring-white/10 text-slate-300 font-bold hover:bg-white/10 transition
                             flex items-center justify-center gap-2">
            <RotateCcw size={16} /> أعد الاختبار
          </button>
          <Link href="/courses"
                className="flex-1 py-3.5 rounded-2xl bg-white/[.06] ring-1 ring-white/10 text-slate-300 font-bold hover:bg-white/10 transition
                           flex items-center justify-center gap-2">
            <BookOpen size={16} /> تصفّح كل الدورات
          </Link>
        </div>
      </div>
    </Shell>
  )
}

function WritingFeedback({ report }: { report: WritingReport }) {
  return (
    <div className="bg-violet-500/[.07] ring-1 ring-violet-500/20 rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <PenLine size={16} className="text-white" />
        </span>
        <div className="flex-1">
          <h3 className="text-white font-black text-[15px]">تصحيح كتابتك</h3>
          <p className="text-slate-500 text-[11.5px] font-semibold">
            {report.words} كلمة · {report.sentences} جملة
            {report.source === 'local' && ' · تحليل آلي مبدئي'}
          </p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-white tabular-nums">{report.score}</div>
          <div className="text-slate-500 text-[10px] font-bold">من 100</div>
        </div>
      </div>

      {report.strengths.length > 0 && (
        <div className="mb-4">
          <h4 className="text-emerald-300 font-bold text-[12.5px] mb-2">نقاط القوة</h4>
          <ul className="space-y-1.5">
            {report.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-300 text-[13px]">
                <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" /><span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.issues.length > 0 && (
        <div>
          <h4 className="text-amber-300 font-bold text-[12.5px] mb-2">ما يحتاج تصحيحاً</h4>
          <div className="space-y-2">
            {report.issues.map((iss, i) => (
              <div key={i} className="bg-black/20 rounded-xl p-3">
                <div className="flex flex-wrap items-center gap-2 mb-1" dir="ltr">
                  <code className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 text-[12px] font-mono line-through">
                    {iss.fragment}
                  </code>
                  {iss.fix && (
                    <>
                      <span className="text-slate-600">→</span>
                      <code className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 text-[12px] font-mono">
                        {iss.fix}
                      </code>
                    </>
                  )}
                </div>
                <p className="text-slate-400 text-[12.5px]">{iss.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.corrected && (
        <details className="mt-4 group">
          <summary className="cursor-pointer text-violet-300 font-bold text-[13px] hover:text-violet-200 transition">
            اعرض نصك بعد التصحيح
          </summary>
          <p className="mt-2 p-3 rounded-xl bg-black/20 text-slate-200 text-[13.5px] leading-relaxed text-left" dir="ltr">
            {report.corrected}
          </p>
        </details>
      )}
    </div>
  )
}

/* ── The conversion step ─────────────────────────────────────────────────── */

function SubscribeCard({ level, plan }: { level: CEFRLevel; plan: NonNullable<ReturnType<typeof getPlan>> }) {
  const [name, setName]   = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy]   = useState(false)
  const [sent, setSent]   = useState(false)

  const waText =
    `مرحباً أستاذ حمزة 👋\n` +
    `أنهيت اختبار المستوى ونتيجتي: ${level} (${LEVEL_META[level].label}).\n` +
    `الدورة المقترحة لي: ${plan.title_ar}.\n` +
    (name ? `اسمي: ${name}\n` : '') +
    `أريد التسجيل والبدء.`

  async function go(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    // Record the lead first so a closed WhatsApp tab never loses it, but never
    // let a failed insert stand between the learner and the conversation.
    try {
      await createSubscriptionLead({
        planId: plan.id,
        level,
        fullName: name.trim(),
        phone: phone.trim() || undefined,
        amountMad: plan.amount_mad,
        source: 'level-test',
        planInterest: plan.id,
        ...getAttribution(),
      })
    } catch { /* the conversation matters more than the record */ }
    setSent(true); setBusy(false)
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waText)}`, '_blank', 'noopener')
  }

  return (
    <div className="rounded-3xl bg-gradient-to-br from-yellow-400/[.12] to-amber-500/[.06] ring-1 ring-yellow-400/25 p-6">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-yellow-400" />
        <span className="text-yellow-400 font-black text-[12px] tracking-wide">الدورة المناسبة لمستواك</span>
      </div>
      <h3 className="text-white text-2xl font-black mb-1">{plan.title_ar}</h3>
      <p className="text-slate-400 text-[14px] font-semibold mb-4">{plan.subtitle_ar}</p>

      <div className="flex flex-wrap items-baseline gap-2 mb-5">
        <span className="text-3xl font-black text-white tabular-nums">{plan.amount_mad}</span>
        <span className="text-slate-400 font-bold">درهم</span>
        {plan.originalAmount && (
          <span className="text-slate-600 line-through text-sm tabular-nums">{plan.originalAmount}</span>
        )}
        <span className="text-slate-500 text-[12px] font-semibold mr-auto">
          {plan.levelFrom} → {plan.levelTo}
        </span>
      </div>

      {plan.idealFor_ar && (
        <p className="text-slate-300 text-[13.5px] leading-relaxed bg-black/20 rounded-xl p-3.5 mb-5">
          {plan.idealFor_ar}
        </p>
      )}

      {sent ? (
        <div className="text-center py-4">
          <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
          <p className="text-white font-black mb-1">تم إرسال طلبك</p>
          <p className="text-slate-400 text-[13px] mb-4">إن لم تُفتح المحادثة تلقائياً، اضغط الزر:</p>
          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waText)}`}
             target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 text-white font-black hover:bg-emerald-400 transition">
            <MessageCircle size={18} /> افتح واتساب
          </a>
        </div>
      ) : (
        <form onSubmit={go} className="space-y-2.5">
          <input
            value={name} onChange={e => setName(e.target.value)} required
            placeholder="اسمك الكامل"
            className="w-full px-4 py-3.5 rounded-xl bg-white/[.06] ring-1 ring-white/15 text-white font-semibold
                       placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 transition"
          />
          <input
            value={phone} onChange={e => setPhone(e.target.value)} dir="ltr"
            placeholder="رقم الهاتف (اختياري)" inputMode="tel"
            className="w-full px-4 py-3.5 rounded-xl bg-white/[.06] ring-1 ring-white/15 text-white font-semibold text-right
                       placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 transition"
          />
          <button type="submit" disabled={busy || !name.trim()}
                  className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black text-lg hover:bg-emerald-400
                             transition shadow-xl disabled:opacity-40 flex items-center justify-center gap-2">
            {busy ? <Loader2 size={20} className="animate-spin" /> : <MessageCircle size={20} />}
            سجّل الآن عبر واتساب
          </button>
          <p className="text-slate-600 text-[11px] font-semibold text-center">
            نرسل لك التفاصيل مباشرة — بلا التزام.
          </p>
        </form>
      )}
    </div>
  )
}
