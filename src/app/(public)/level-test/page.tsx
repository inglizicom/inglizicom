'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Heart, CheckCircle2, XCircle, Volume2, VolumeX, Loader2, RotateCcw,
  MessageCircle, Trophy, Sparkles, PenLine, Headphones, BookOpen, Brain,
  ListChecks, Type, Shuffle, Award, Music, Music2, X, Plus,
} from 'lucide-react'
import {
  QUESTIONS, WRITING_PROMPTS, LEVEL_ORDER, LEVEL_META, HEARTS_BY_LEVEL,
  CEFR_FEEDBACK, SKILL_LABELS, TYPE_LABELS, recommendPlan,
  type CEFRLevel, type Question, type QType, type SkillKey,
} from '@/data/placement-test'
import {
  isCorrect, gradeWriting, finalLevel,
  type WritingReport, type HeartRecord,
} from '@/lib/placement'
import { savePlacement } from '@/lib/placement-handoff'
import {
  unlockAudio, sfxCorrect, sfxWrong, sfxHeartLost, sfxLevelUp, sfxHeartGained,
  sfxFinish, startMusic, stopMusic, duckMusic,
} from '@/lib/test-audio'
import { getPlan } from '@/data/plans'
import { createSubscriptionLead, getAttribution } from '@/lib/leads-db'

/* ══════════════════════════════════════════════════════════════════════════
   PLACEMENT TEST
   ══════════════════════════════════════════════════════════════════════════

   Sixteen questions a level, six levels. Hearts grow with difficulty (3 at A0
   up to 5 at C1) because a slip at C1 costs a twenty-minute test, and unspent
   hearts are banked — the total says how comfortably a level was held, not
   merely whether it was.

   Once the test starts it takes the whole screen. A placement test competing
   with a site header and a footer is one people abandon halfway.
   ══════════════════════════════════════════════════════════════════════════ */

const WHATSAPP = '212764189311'

type Phase = 'intro' | 'quiz' | 'levelUp' | 'writing' | 'grading' | 'result'

interface Answered { qid: number; ok: boolean; skill: SkillKey; level: CEFRLevel }

const TYPE_ICON: Record<QType, typeof Brain> = {
  mcq: Brain, multi: ListChecks, gap: Type, order: Shuffle,
  reading: BookOpen, listenMcq: Headphones, listenGap: Headphones, listenWrite: Headphones,
}

/* ── Speech ─────────────────────────────────────────────────────────────── */

function useSpeech(soundOn: boolean) {
  const [busy, setBusy] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const cache = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    const store = cache.current
    return () => {
      audioRef.current?.pause()
      store.forEach(url => URL.revokeObjectURL(url))
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    }
  }, [])

  const browserVoice = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) { setBusy(false); return }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'; u.rate = 0.85
    u.onend = () => setBusy(false)
    u.onerror = () => setBusy(false)
    window.speechSynthesis.speak(u)
  }, [])

  const say = useCallback(async (text: string) => {
    setBusy(true)
    audioRef.current?.pause()
    // pull the pad down so the clip is the only thing in the room
    if (soundOn) duckMusic(Math.max(3, text.split(' ').length * 0.45))

    const cached = cache.current.get(text)
    if (cached) {
      const a = new Audio(cached)
      audioRef.current = a
      a.onended = () => setBusy(false)
      a.play().catch(() => browserVoice(text))
      return
    }
    try {
      const res = await fetch('/api/tts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, provider: 'google' }),
        signal: AbortSignal.timeout(9000),
      })
      if (!res.ok) throw new Error('tts')
      const url = URL.createObjectURL(await res.blob())
      cache.current.set(text, url)
      const a = new Audio(url)
      audioRef.current = a
      a.onended = () => setBusy(false)
      a.onerror = () => browserVoice(text)
      await a.play()
    } catch {
      browserVoice(text)
    }
  }, [browserVoice, soundOn])

  return { say, busy }
}

/* ══════════════════════════════════════════════════════════════════════════ */

export default function LevelTestPage() {
  const [phase, setPhase] = useState<Phase>('intro')

  const [levelIdx, setLevelIdx] = useState(0)
  const [qIdx, setQIdx]         = useState(0)
  const [hearts, setHearts]     = useState(HEARTS_BY_LEVEL.A0)
  const [clearedIdx, setClearedIdx] = useState(-1)
  const [heartLog, setHeartLog] = useState<HeartRecord[]>([])

  const [log, setLog] = useState<Answered[]>([])

  const [option, setOption]   = useState<number | null>(null)
  const [multi, setMulti]     = useState<number[]>([])
  const [texts, setTexts]     = useState<string[]>([])
  const [order, setOrder]     = useState<number[]>([])
  const [verdict, setVerdict] = useState<'waiting' | 'correct' | 'wrong'>('waiting')
  const [heard, setHeard]     = useState(false)

  const [essay, setEssay]   = useState('')
  const [report, setReport] = useState<WritingReport | null>(null)

  const [soundOn, setSoundOn] = useState(true)
  const [musicOn, setMusicOn] = useState(false)

  const { say, busy: speaking } = useSpeech(soundOn)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const level = LEVEL_ORDER[levelIdx]
  const bank  = QUESTIONS[level] ?? []
  const q     = bank[qIdx]

  /* fresh response slots per question, and back to the top of the scroller */
  useEffect(() => {
    setOption(null); setMulti([]); setOrder([]); setVerdict('waiting'); setHeard(false)
    setTexts(Array(q?.accept?.length ?? 1).fill(''))
    scrollRef.current?.scrollTo({ top: 0 })
  }, [q?.id, q?.accept?.length])

  useEffect(() => () => { stopMusic() }, [])

  const beep = useCallback((fn: () => void) => { if (soundOn) fn() }, [soundOn])

  function toggleMusic() {
    unlockAudio()
    if (musicOn) { stopMusic(); setMusicOn(false) }
    else { startMusic(); setMusicOn(true) }
  }

  function toggleSound() {
    if (soundOn) { stopMusic(); setMusicOn(false) }
    setSoundOn(s => !s)
  }

  /* ── Flow ─────────────────────────────────────────────────────────────── */

  function begin() {
    unlockAudio()
    // Best effort. iOS Safari refuses fullscreen on anything but <video>, so
    // the overlay below has to stand on its own regardless — and it does.
    const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }
    const req = el.requestFullscreen?.bind(el) ?? el.webkitRequestFullscreen?.bind(el)
    try { req?.()?.catch(() => {}) } catch { /* denied — overlay still applies */ }
    setPhase('quiz')
  }

  function leaveFullscreen() {
    if (typeof document === 'undefined' || !document.fullscreenElement) return
    const d = document as Document & { webkitExitFullscreen?: () => Promise<void> }
    const exit = d.exitFullscreen?.bind(d) ?? d.webkitExitFullscreen?.bind(d)
    try { exit?.()?.catch(() => {}) } catch { /* ignore */ }
  }

  function submit() {
    if (!q || verdict !== 'waiting') return
    const ok = isCorrect(q, { option, multi, text: texts, order })
    setVerdict(ok ? 'correct' : 'wrong')
    setLog(l => [...l, { qid: q.id, ok, skill: q.skill, level: q.level }])
    if (ok) beep(sfxCorrect)
    else { setHearts(h => h - 1); beep(sfxWrong); setTimeout(() => beep(sfxHeartLost), 220) }
  }

  function bankHearts(cleared: boolean) {
    setHeartLog(l => [...l, {
      level, left: Math.max(0, hearts), available: HEARTS_BY_LEVEL[level], cleared,
    }])
  }

  function next() {
    if (hearts <= 0) { bankHearts(false); beep(sfxFinish); setPhase('writing'); return }
    if (qIdx + 1 < bank.length) { setQIdx(i => i + 1); return }
    bankHearts(true)
    setClearedIdx(levelIdx)
    beep(sfxLevelUp)
    if (levelIdx + 1 < LEVEL_ORDER.length) setPhase('levelUp')
    else { beep(sfxFinish); setPhase('writing') }
  }

  function nextLevel() {
    const nextIdx = levelIdx + 1
    const gained = HEARTS_BY_LEVEL[LEVEL_ORDER[nextIdx]] > HEARTS_BY_LEVEL[level]
    setLevelIdx(nextIdx)
    setQIdx(0)
    setHearts(HEARTS_BY_LEVEL[LEVEL_ORDER[nextIdx]])
    if (gained) beep(sfxHeartGained)
    setPhase('quiz')
  }

  function stopHere() { bankHearts(false); beep(sfxFinish); setPhase('writing') }

  async function submitWriting() {
    setPhase('grading')
    const pl = LEVEL_ORDER[Math.max(0, clearedIdx)]
    setReport(await gradeWriting(essay, WRITING_PROMPTS[pl], pl))
    setPhase('result')
  }

  function skipWriting() { setPhase('result') }

  function restart() {
    setPhase('intro'); setLevelIdx(0); setQIdx(0); setHearts(HEARTS_BY_LEVEL.A0)
    setClearedIdx(-1); setLog([]); setEssay(''); setReport(null); setHeartLog([])
  }

  function quit() {
    leaveFullscreen()
    stopMusic(); setMusicOn(false)
    restart()
  }

  /* ── Derived ──────────────────────────────────────────────────────────── */

  const quizLevel: CEFRLevel = clearedIdx >= 0 ? LEVEL_ORDER[clearedIdx] : 'A0'
  const placement = useMemo(
    () => finalLevel(quizLevel, report, heartLog), [quizLevel, report, heartLog])

  const skillStats = useMemo(() => {
    const out: Partial<Record<SkillKey, { correct: number; total: number }>> = {}
    for (const a of log) {
      const s = out[a.skill] ?? { correct: 0, total: 0 }
      s.total++; if (a.ok) s.correct++
      out[a.skill] = s
    }
    return out
  }, [log])

  const soundCtl = { soundOn, musicOn, toggleSound, toggleMusic }

  /* ═══ INTRO — the only phase that keeps the site chrome ═══════════════ */
  if (phase === 'intro') return <Intro onStart={begin} />

  /* ═══ RESULT ═════════════════════════════════════════════════════════ */
  if (phase === 'result') {
    return (
      <Overlay showQuit={false}>
        <Result
          placement={placement} quizLevel={quizLevel} report={report}
          log={log} skillStats={skillStats} heartLog={heartLog}
          onRestart={restart} onExit={leaveFullscreen}
        />
      </Overlay>
    )
  }

  /* ═══ GRADING ════════════════════════════════════════════════════════ */
  if (phase === 'grading') {
    return (
      <Overlay showQuit={false}>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <Loader2 size={40} className="text-yellow-400 animate-spin mb-5" />
          <h2 className="text-xl font-black text-white mb-2">جاري تصحيح كتابتك…</h2>
          <p className="text-slate-500 text-sm">نحلّل القواعد والمفردات والتراكيب.</p>
        </div>
      </Overlay>
    )
  }

  /* ═══ LEVEL UP ═══════════════════════════════════════════════════════ */
  if (phase === 'levelUp') {
    const done = LEVEL_ORDER[clearedIdx]
    const nxt  = LEVEL_ORDER[clearedIdx + 1]
    const more = HEARTS_BY_LEVEL[nxt] - HEARTS_BY_LEVEL[done]
    return (
      <Overlay onQuit={quit} sound={soundCtl}>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-8">
          <div className="max-w-md mx-auto text-center animate-fade-up">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-2xl"
                 style={{ background: `linear-gradient(135deg, ${LEVEL_META[done].from}, ${LEVEL_META[done].to})` }}>
              <Trophy size={44} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">أنهيت مستوى {done} 🎉</h2>
            <p className="text-slate-400 font-semibold mb-1">{LEVEL_META[done].label}</p>
            <p className="text-slate-500 text-sm mb-6">
              احتفظت بـ <span className="text-rose-400 font-black">{hearts}</span> من {HEARTS_BY_LEVEL[done]} قلوب.
            </p>

            <div className="bg-white/5 ring-1 ring-white/10 rounded-2xl p-5">
              <p className="text-white font-black mb-1">التالي: {nxt} — {LEVEL_META[nxt].label}</p>
              {more > 0 ? (
                <p className="text-emerald-300 text-[13px] font-bold flex items-center justify-center gap-1.5 mt-2">
                  <Plus size={13} /> {more === 1 ? 'قلب إضافي' : `${more} قلوب إضافية`} — الأسئلة تصبح أصعب
                </p>
              ) : (
                <p className="text-slate-500 text-[13px] font-semibold mt-1">تبدأ بـ {HEARTS_BY_LEVEL[nxt]} قلوب.</p>
              )}
              <div className="flex items-center justify-center gap-1 mt-3">
                {Array.from({ length: HEARTS_BY_LEVEL[nxt] }).map((_, i) => (
                  <Heart key={i} size={18}
                         className={`text-rose-500 fill-rose-500 ${i >= HEARTS_BY_LEVEL[done] ? 'animate-pulse' : ''}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <Footer>
          <button onClick={nextLevel}
                  className="w-full py-4 rounded-2xl bg-gradient-to-l from-yellow-400 to-amber-500 text-black font-black text-lg
                             hover:brightness-110 active:scale-[.99] transition shadow-xl">
            أكمل إلى {nxt} ←
          </button>
          <button onClick={stopHere}
                  className="w-full py-2.5 rounded-2xl text-slate-400 font-bold hover:text-white transition text-sm">
            أتوقف هنا وأرى نتيجتي
          </button>
        </Footer>
      </Overlay>
    )
  }

  /* ═══ WRITING ════════════════════════════════════════════════════════ */
  if (phase === 'writing') {
    const wp = WRITING_PROMPTS[LEVEL_ORDER[Math.max(0, clearedIdx)]]
    const words = essay.trim() ? essay.trim().split(/\s+/).filter(Boolean).length : 0
    const enough = words >= 10
    return (
      <Overlay onQuit={quit} sound={soundCtl}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shrink-0">
                <PenLine size={20} className="text-white" />
              </span>
              <div className="min-w-0">
                <h2 className="text-xl font-black text-white">اختبار الكتابة</h2>
                <p className="text-slate-500 text-xs font-semibold">آخر خطوة — يُصحَّح تلقائياً</p>
              </div>
            </div>

            <div className="bg-white/5 ring-1 ring-white/10 rounded-2xl p-5 mb-4">
              <p className="text-slate-400 text-[13px] font-semibold mb-2">{wp.hint}</p>
              <p className="text-white text-[16px] font-bold leading-relaxed mb-4 text-left" dir="ltr">{wp.prompt}</p>
              <ul className="space-y-1.5">
                {wp.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-400 text-[13px]">
                    <span className="text-yellow-400 mt-0.5 shrink-0">•</span><span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <textarea
              value={essay} onChange={e => setEssay(e.target.value)}
              dir="ltr" rows={8} placeholder="Write your answer here…"
              className="w-full p-4 rounded-2xl bg-white/[.04] ring-1 ring-white/10 text-white text-[15px] leading-relaxed
                         placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 transition text-left" />
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs font-bold ${enough ? 'text-emerald-400' : 'text-slate-500'}`}>
                {words} كلمة · المقترح {wp.minWords}
              </span>
              {!enough && <span className="text-slate-600 text-xs">10 كلمات على الأقل</span>}
            </div>
          </div>
        </div>

        <Footer>
          <button onClick={submitWriting} disabled={!enough}
                  className="w-full py-4 rounded-2xl bg-gradient-to-l from-yellow-400 to-amber-500 text-black font-black text-lg
                             hover:brightness-110 active:scale-[.99] transition shadow-xl disabled:opacity-40">
            صحّح كتابتي وأظهر النتيجة
          </button>
          <button onClick={skipWriting}
                  className="w-full py-2.5 rounded-2xl text-slate-500 font-bold hover:text-slate-300 transition text-sm">
            تخطّي الكتابة
          </button>
        </Footer>
      </Overlay>
    )
  }

  /* ═══ QUIZ ═══════════════════════════════════════════════════════════ */
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
    <Overlay onQuit={quit} sound={soundCtl} header={
      <>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-black text-white shadow shrink-0"
                  style={{ background: `linear-gradient(135deg, ${LEVEL_META[level].from}, ${LEVEL_META[level].to})` }}>
              {level}
            </span>
            <span className="text-slate-500 text-[11px] font-bold truncate">{LEVEL_META[level].label}</span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {Array.from({ length: HEARTS_BY_LEVEL[level] }).map((_, i) => (
              <Heart key={i} size={16}
                     className={`transition-all duration-300 ${
                       i < hearts ? 'text-rose-500 fill-rose-500' : 'text-slate-700 scale-90'}`} />
            ))}
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-l from-yellow-400 to-amber-500 transition-all duration-500"
               style={{ width: `${((qIdx + (answered ? 1 : 0)) / bank.length) * 100}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-slate-600 text-[10.5px] font-bold">سؤال {qIdx + 1} من {bank.length}</span>
          <span className="text-slate-600 text-[10.5px] font-bold">{TYPE_LABELS[q.type]}</span>
        </div>
      </>
    }>
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
        <div className="max-w-2xl mx-auto" key={q.id}>
          <div className="animate-fade-up">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-xl bg-white/[.06] ring-1 ring-white/10 flex items-center justify-center shrink-0">
                <Icon size={15} className="text-yellow-400" />
              </span>
              <span className="text-slate-400 text-[13px] font-bold">{q.hint}</span>
            </div>

            {q.passage && (
              <pre className="bg-white/[.04] ring-1 ring-white/10 rounded-2xl p-4 mb-4 text-slate-200 text-[13.5px]
                              leading-relaxed whitespace-pre-wrap font-sans text-left" dir="ltr">{q.passage}</pre>
            )}

            {needsAudio && (
              <AudioBox text={q.audio!} onPlay={() => { say(q.audio!); setHeard(true) }}
                        speaking={speaking} heard={heard} revealed={answered} />
            )}

            {q.type !== 'listenWrite' && (
              <h2 className="text-white text-lg sm:text-2xl font-black mb-5 leading-snug break-words"
                  dir={/[؀-ۿ]/.test(q.question) ? 'rtl' : 'ltr'}>
                {q.question}
              </h2>
            )}

            <QuestionBody
              q={q} answered={answered} verdict={verdict}
              option={option} setOption={setOption}
              multi={multi} setMulti={setMulti}
              texts={texts} setTexts={setTexts}
              order={order} setOrder={setOrder} />

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
          </div>
        </div>
      </div>

      <Footer>
        {!answered ? (
          <button onClick={submit} disabled={!canSubmit || (needsAudio && !heard)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-l from-yellow-400 to-amber-500 text-black font-black text-lg
                             hover:brightness-110 active:scale-[.99] transition shadow-xl disabled:opacity-30">
            {needsAudio && !heard ? 'استمع أولاً' : 'تحقّق'}
          </button>
        ) : (
          <button onClick={next}
                  className="w-full py-4 rounded-2xl bg-white text-black font-black text-lg hover:bg-slate-100 active:scale-[.99] transition shadow-xl">
            {hearts <= 0 ? 'انتهت القلوب — أظهر النتيجة'
              : qIdx + 1 < bank.length ? 'السؤال التالي ←'
              : 'أنهيت المستوى ←'}
          </button>
        )}
      </Footer>
    </Overlay>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   CHROME
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * The test's own screen. Fixed to the viewport as a flex column so the header
 * and the action button never move and only the question scrolls — on a phone
 * that is the difference between a reachable button and a lost one. Uses dvh
 * so the browser's collapsing address bar cannot crop the footer.
 */
function Overlay({
  children, header, onQuit, showQuit = true, sound,
}: {
  children: React.ReactNode
  header?: React.ReactNode
  onQuit?: () => void
  showQuit?: boolean
  sound?: { soundOn: boolean; musicOn: boolean; toggleSound: () => void; toggleMusic: () => void }
}) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    // z above the site's floating widgets (the chat FAB sits at 9999) so the
    // opaque background covers them — the action button must not share the
    // bottom-left corner of a phone with anything.
    <div dir="rtl"
         className="fixed inset-0 bg-[#0B1020] font-sans flex flex-col overflow-hidden"
         style={{ height: '100dvh', zIndex: 10000 }}>
      <div className="pointer-events-none absolute inset-0"
           style={{ backgroundImage:
             'radial-gradient(46rem 30rem at 85% -8%, rgba(245,158,11,.14), transparent 62%),' +
             'radial-gradient(40rem 26rem at 6% 6%, rgba(59,130,246,.12), transparent 60%)' }} />

      <header className="relative shrink-0 px-5 pt-[max(0.7rem,env(safe-area-inset-top))] pb-2.5 border-b border-white/[.06]">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-black text-slate-600">اختبار المستوى</span>
            <div className="flex items-center gap-1.5">
              {sound && (
                <>
                  <button onClick={sound.toggleMusic} aria-label="موسيقى الخلفية"
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition ring-1 ${
                            sound.musicOn ? 'bg-yellow-400/15 ring-yellow-400/40 text-yellow-300'
                                          : 'bg-white/[.04] ring-white/10 text-slate-500'}`}>
                    {sound.musicOn ? <Music size={14} /> : <Music2 size={14} />}
                  </button>
                  <button onClick={sound.toggleSound} aria-label="الأصوات"
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition ring-1 ${
                            sound.soundOn ? 'bg-white/[.06] ring-white/15 text-slate-300'
                                          : 'bg-white/[.04] ring-white/10 text-slate-600'}`}>
                    {sound.soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  </button>
                </>
              )}
              {showQuit && onQuit && (
                <button onClick={onQuit} aria-label="إنهاء الاختبار"
                        className="w-8 h-8 rounded-lg bg-white/[.04] ring-1 ring-white/10 text-slate-500 hover:text-rose-300 transition flex items-center justify-center">
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
          {header}
        </div>
      </header>

      {children}
    </div>
  )
}

/** Sticky action area, clear of the iPhone home indicator. */
function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative shrink-0 border-t border-white/[.06] bg-[#0B1020]/95 backdrop-blur
                    px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="max-w-2xl mx-auto space-y-1.5">{children}</div>
    </div>
  )
}

function AudioBox({
  text, onPlay, speaking, heard, revealed,
}: { text: string; onPlay: () => void; speaking: boolean; heard: boolean; revealed: boolean }) {
  return (
    <div className="mb-5 rounded-2xl bg-gradient-to-l from-blue-500/10 to-violet-500/10 ring-1 ring-blue-400/25 p-4">
      <button onClick={onPlay} disabled={speaking}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400
                         active:scale-[.99] transition text-white font-black text-[16px] shadow-lg disabled:opacity-70">
        {speaking ? <Loader2 size={20} className="animate-spin" /> : <Volume2 size={20} />}
        {speaking ? 'جاري التشغيل…' : heard ? 'استمع مرة أخرى' : 'اضغط للاستماع'}
      </button>
      <p className="text-blue-200/60 text-[11px] font-semibold text-center mt-2">
        {heard ? 'يمكنك الإعادة بقدر ما تحتاج' : 'يجب الاستماع قبل الإجابة'}
      </p>
      {revealed && (
        <p className="mt-3 pt-3 border-t border-blue-400/20 text-blue-100 text-[13px] text-left leading-relaxed break-words" dir="ltr">
          “{text}”
        </p>
      )}
    </div>
  )
}

/* ── Question bodies ─────────────────────────────────────────────────────── */

function QuestionBody({
  q, answered, verdict, option, setOption, multi, setMulti, texts, setTexts, order, setOrder,
}: {
  q: Question; answered: boolean; verdict: 'waiting' | 'correct' | 'wrong'
  option: number | null; setOption: (n: number) => void
  multi: number[]; setMulti: React.Dispatch<React.SetStateAction<number[]>>
  texts: string[]; setTexts: React.Dispatch<React.SetStateAction<string[]>>
  order: number[]; setOrder: React.Dispatch<React.SetStateAction<number[]>>
}) {

  if (q.type === 'mcq' || q.type === 'reading' || q.type === 'listenMcq') {
    return (
      <div className="space-y-2.5">
        {(q.options ?? []).map((opt, i) => {
          const chosen = option === i
          const right  = answered && i === q.answer
          const wrong  = answered && chosen && i !== q.answer
          return (
            <button key={i} onClick={() => !answered && setOption(i)} disabled={answered}
                    className={`w-full text-right p-3.5 rounded-2xl ring-1 font-bold text-[14.5px] transition-all active:scale-[.99]
                      ${right ? 'bg-emerald-500/15 ring-emerald-400/50 text-emerald-200'
                        : wrong ? 'bg-rose-500/15 ring-rose-400/50 text-rose-200'
                        : chosen ? 'bg-yellow-400/15 ring-yellow-400/50 text-white'
                        : 'bg-white/[.04] ring-white/10 text-slate-200 hover:bg-white/[.08]'}`}>
              <span className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-black
                  ${right ? 'bg-emerald-400 text-black' : wrong ? 'bg-rose-400 text-black'
                    : chosen ? 'bg-yellow-400 text-black' : 'bg-white/10 text-slate-400'}`}>
                  {right ? '✓' : wrong ? '✕' : String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 min-w-0 break-words" dir="ltr">{opt}</span>
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  if (q.type === 'multi') {
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
                      className={`w-full text-right p-3.5 rounded-2xl ring-1 font-bold text-[14.5px] transition-all active:scale-[.99]
                        ${right ? 'bg-emerald-500/15 ring-emerald-400/50 text-emerald-200'
                          : wrong ? 'bg-rose-500/15 ring-rose-400/50 text-rose-200'
                          : chosen ? 'bg-yellow-400/15 ring-yellow-400/50 text-white'
                          : 'bg-white/[.04] ring-white/10 text-slate-200 hover:bg-white/[.08]'}`}>
                <span className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-xs font-black ring-1
                    ${right ? 'bg-emerald-400 text-black ring-emerald-400'
                      : wrong ? 'bg-rose-400 text-black ring-rose-400'
                      : chosen ? 'bg-yellow-400 text-black ring-yellow-400' : 'ring-white/25 text-transparent'}`}>✓</span>
                  <span className="flex-1 min-w-0 break-words" dir="ltr">{opt}</span>
                </span>
              </button>
            )
          })}
        </div>
      </>
    )
  }

  if (q.type === 'gap' || q.type === 'listenGap') {
    const template = q.type === 'listenGap' ? (q.transcript ?? '') : q.question
    const parts = template.split('___')
    return (
      <div className="bg-white/[.04] ring-1 ring-white/10 rounded-2xl p-4">
        <p className="text-white text-[15.5px] leading-[2.6] text-left break-words" dir="ltr">
          {parts.map((part, i) => (
            <span key={i}>
              {part}
              {i < parts.length - 1 && (
                <input
                  value={texts[i] ?? ''} disabled={answered}
                  onChange={e => setTexts(prev => { const t = [...prev]; t[i] = e.target.value; return t })}
                  className={`inline-block mx-1 px-2 py-1 w-24 sm:w-28 rounded-lg text-center font-bold ring-1 transition
                    ${answered
                      ? verdict === 'correct'
                        ? 'bg-emerald-500/15 ring-emerald-400/50 text-emerald-200'
                        : 'bg-rose-500/15 ring-rose-400/50 text-rose-200'
                      : 'bg-white/10 ring-white/20 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/60'}`}
                  placeholder="…" />
              )}
            </span>
          ))}
        </p>
        {answered && verdict === 'wrong' && (
          <p className="mt-3 pt-3 border-t border-white/10 text-emerald-300 text-[13px] font-bold text-left break-words" dir="ltr">
            ✓ {(q.accept ?? []).map(a => a[0]).join('  ·  ')}
          </p>
        )}
      </div>
    )
  }

  if (q.type === 'listenWrite') {
    return (
      <div>
        <textarea
          value={texts[0] ?? ''} disabled={answered}
          onChange={e => setTexts([e.target.value])}
          dir="ltr" rows={3} placeholder="Type what you hear…"
          className={`w-full p-4 rounded-2xl ring-1 text-white text-[15px] leading-relaxed text-left transition
            ${answered
              ? verdict === 'correct' ? 'bg-emerald-500/10 ring-emerald-400/40' : 'bg-rose-500/10 ring-rose-400/40'
              : 'bg-white/[.04] ring-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400/60'}`} />
        <p className="text-slate-600 text-[11px] font-semibold mt-2">
          لا تقلق بشأن علامات الترقيم — نحن نقيس ما سمعته.
        </p>
      </div>
    )
  }

  if (q.type === 'order') {
    const words = q.words ?? []
    const pick = (i: number) => { if (!answered) setOrder(prev => prev.includes(i) ? prev : [...prev, i]) }
    const undo = () => { if (!answered) setOrder(prev => prev.slice(0, -1)) }
    return (
      <div>
        <div className={`min-h-[64px] rounded-2xl p-3 mb-4 ring-1 flex flex-wrap gap-2 items-center
          ${answered ? verdict === 'correct' ? 'bg-emerald-500/10 ring-emerald-400/40' : 'bg-rose-500/10 ring-rose-400/40'
            : 'bg-white/[.04] ring-white/10'}`} dir="ltr">
          {order.length === 0
            ? <span className="text-slate-600 text-[13px] px-2">اضغط الكلمات بالترتيب…</span>
            : order.map((wi, k) => (
                <span key={k} className="px-2.5 py-1.5 rounded-xl bg-yellow-400 text-black font-bold text-[14px]">
                  {words[wi]}
                </span>
              ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-3" dir="ltr">
          {words.map((w, i) => (
            <button key={i} onClick={() => pick(i)} disabled={answered || order.includes(i)}
                    className={`px-2.5 py-1.5 rounded-xl font-bold text-[14px] ring-1 transition active:scale-95
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
          <p className="text-emerald-300 text-[13.5px] font-bold text-left mt-2 break-words" dir="ltr">
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

/**
 * The intro has one job: get the button pressed.
 *
 * So the button sits above the fold on the smallest phone we support, and
 * everything that merely explains the test lives below it. The four features
 * are a two-column grid even on mobile — as full-width rows they left most of
 * their own width empty and pushed the button off the screen.
 */
function Intro({ onStart }: { onStart: () => void }) {
  const total = LEVEL_ORDER.reduce((n, l) => n + (QUESTIONS[l]?.length ?? 0), 0)
  return (
    <main dir="rtl" className="min-h-screen bg-[#0B1020] font-sans">
      <div className="pointer-events-none fixed top-0 left-0 w-screen h-screen -z-10"
           style={{ backgroundImage:
             'radial-gradient(46rem 30rem at 85% -8%, rgba(245,158,11,.14), transparent 62%),' +
             'radial-gradient(40rem 26rem at 6% 6%, rgba(59,130,246,.12), transparent 60%)' }} />

      {/* the site header is fixed at 60px, so the page has to clear it itself —
          without this the icon sits behind the logo */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-[76px] sm:pt-24 pb-12 text-center animate-fade-up">

        {/* ── Above the fold: what it is, and the way in ── */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-yellow-400 to-amber-500
                        flex items-center justify-center shadow-2xl">
          <Brain size={30} className="text-black sm:hidden" />
          <Brain size={38} className="text-black hidden sm:block" />
        </div>

        <h1 className="text-[26px] sm:text-4xl font-black text-white mb-2.5 leading-[1.2]">
          اختبر مستواك في الإنجليزية
        </h1>
        <p className="text-slate-400 text-[14px] sm:text-base font-semibold mb-5 leading-relaxed">
          اختبار حقيقي من <span className="text-white">A0</span> إلى <span className="text-white">C1</span> —
          {' '}{total} سؤالاً، ثم كتابة تُصحَّح تلقائياً.
        </p>

        <button onClick={onStart}
                className="w-full px-12 py-4 rounded-2xl bg-gradient-to-l from-yellow-400 to-amber-500 text-black
                           font-black text-lg hover:brightness-110 active:scale-[.99] transition shadow-2xl">
          ابدأ الاختبار
        </button>
        <p className="text-slate-500 text-[12px] font-semibold mt-2.5 flex items-center justify-center gap-1.5">
          <Sparkles size={12} className="text-yellow-400" />
          مجاني · بملء الشاشة · ينتهي عند نفاد قلوبك
        </p>

        {/* ── Below: what's inside ── */}
        <div className="grid grid-cols-2 gap-2.5 mt-8 text-right">
          {[
            { icon: Heart,      t: 'قلوب تتزايد',   s: '3 في A0 · 5 في C1' },
            { icon: Headphones, t: 'استماع حقيقي',  s: 'تسمع وتكتب' },
            { icon: ListChecks, t: '16 سؤالاً',     s: 'لكل مستوى' },
            { icon: PenLine,    t: 'كتابة مصحّحة',  s: 'تصحيح تلقائي' },
          ].map((f, i) => (
            <div key={i} className="bg-white/[.04] ring-1 ring-white/10 rounded-2xl p-3.5">
              <span className="w-9 h-9 rounded-xl bg-yellow-400/15 flex items-center justify-center mb-2">
                <f.icon size={17} className="text-yellow-400" />
              </span>
              <div className="text-white font-bold text-[13.5px] leading-tight">{f.t}</div>
              <div className="text-slate-500 text-[11.5px] leading-tight mt-1">{f.s}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white/[.03] ring-1 ring-white/[.07] rounded-2xl p-4 text-right">
          <h2 className="text-white font-bold text-[14px] mb-2">كيف يعمل الاختبار؟</h2>
          <ul className="space-y-1.5 text-slate-400 text-[12.5px] leading-relaxed">
            <li>• تبدأ من A0 وتصعد مستوى بعد مستوى حتى تنفد قلوبك.</li>
            <li>• كل خطأ يكلّفك قلباً — والقلوب المتبقية ترفع نتيجتك النهائية.</li>
            <li>• في النهاية تكتب فقرة، نصحّحها لك، ونقترح الدورة المناسبة.</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   RESULT
   ══════════════════════════════════════════════════════════════════════════ */

function Result({
  placement, quizLevel, report, log, skillStats, heartLog, onRestart, onExit,
}: {
  placement: ReturnType<typeof finalLevel>
  quizLevel: CEFRLevel
  report: WritingReport | null
  log: Answered[]
  skillStats: Partial<Record<SkillKey, { correct: number; total: number }>>
  heartLog: HeartRecord[]
  onRestart: () => void
  onExit: () => void
}) {
  const level = placement.level
  const meta = LEVEL_META[level]
  const fb   = CEFR_FEEDBACK[level]
  const plan = getPlan(recommendPlan(level))
  const correct = log.filter(a => a.ok).length

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
      <div className="max-w-2xl mx-auto space-y-4 animate-fade-up pb-8">

        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-5 rounded-3xl flex items-center justify-center shadow-2xl"
               style={{ background: `linear-gradient(135deg, ${meta.from}, ${meta.to})` }}>
            <Award size={44} className="text-white" />
          </div>
          <p className="text-slate-500 font-bold text-sm mb-1">مستواك في الإنجليزية</p>
          <h1 className="text-6xl font-black text-white mb-2 tracking-tight">{level}</h1>
          <p className={`text-lg font-black ${meta.text}`}>{meta.label}</p>
          <p className="text-slate-500 text-sm font-semibold">{meta.sub}</p>

          {placement.adjusted && (
            <div className="mt-3 flex items-start gap-1.5 px-3 py-2.5 rounded-xl bg-white/[.06] ring-1 ring-white/10 text-[12.5px] font-bold text-slate-300 text-right">
              <Sparkles size={13} className="text-yellow-400 mt-0.5 shrink-0" />
              <span>
                {placement.reason === 'hearts'
                  ? placement.adjusted === 'up'
                    ? `أنهيت ${quizLevel} محتفظاً بمعظم قلوبك — هذا مستوى تملكه لا تكافح فيه، فرفعناك إلى ${level}.`
                    : `اجتزت ${quizLevel} بصعوبة (بقي ${placement.heartsLeft} من ${placement.heartsAvailable} قلوب) — ${level} سيبني أساسك بثبات.`
                  : placement.adjusted === 'down'
                    ? `اجتزت أسئلة ${quizLevel}، لكن كتابتك تناسب ${level} — وضعناك حيث ستتقدم فعلاً.`
                    : `كتابتك أقوى من نتيجة الأسئلة — رفعناك من ${quizLevel} إلى ${level}.`}
              </span>
            </div>
          )}
        </div>

        <p className="text-slate-300 text-[14.5px] leading-relaxed text-center bg-white/[.04] ring-1 ring-white/10 rounded-2xl p-5">
          {fb.summary}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { v: `${correct}/${log.length}`, l: 'إجابة صحيحة' },
            { v: quizLevel, l: 'أعلى مستوى' },
            { v: `${placement.heartsLeft}/${placement.heartsAvailable}`, l: 'قلوب متبقية' },
            { v: report ? `${report.score}%` : '—', l: 'درجة الكتابة' },
          ].map((s, i) => (
            <div key={i} className="bg-white/[.04] ring-1 ring-white/10 rounded-2xl p-3.5 text-center">
              <div className="text-xl font-black text-white tabular-nums">{s.v}</div>
              <div className="text-slate-500 text-[10.5px] font-bold mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        {heartLog.length > 0 && (
          <div className="bg-white/[.04] ring-1 ring-white/10 rounded-2xl p-5">
            <h3 className="text-white font-black mb-3.5 text-[15px]">قلوبك في كل مستوى</h3>
            <div className="space-y-2.5">
              {heartLog.map((h, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded-md text-[10.5px] font-black text-white shrink-0"
                        style={{ background: `linear-gradient(135deg, ${LEVEL_META[h.level].from}, ${LEVEL_META[h.level].to})` }}>
                    {h.level}
                  </span>
                  <div className="flex items-center gap-0.5 flex-1 min-w-0">
                    {Array.from({ length: h.available }).map((_, k) => (
                      <Heart key={k} size={13} className={k < h.left ? 'text-rose-500 fill-rose-500' : 'text-slate-700'} />
                    ))}
                  </div>
                  <span className="text-[10.5px] font-bold text-slate-500 shrink-0">
                    {h.cleared ? 'أُنجز' : 'توقف'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white/[.04] ring-1 ring-white/10 rounded-2xl p-5">
          <h3 className="text-white font-black mb-4 text-[15px]">أداؤك حسب المهارة</h3>
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

        {report && <WritingFeedback report={report} />}

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

        {plan && <SubscribeCard level={level} plan={plan} onExit={onExit} />}

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button onClick={onRestart}
                  className="flex-1 py-3.5 rounded-2xl bg-white/[.06] ring-1 ring-white/10 text-slate-300 font-bold hover:bg-white/10 transition
                             flex items-center justify-center gap-2">
            <RotateCcw size={16} /> أعد الاختبار
          </button>
          <Link href="/courses" onClick={onExit}
                className="flex-1 py-3.5 rounded-2xl bg-white/[.06] ring-1 ring-white/10 text-slate-300 font-bold hover:bg-white/10 transition
                           flex items-center justify-center gap-2">
            <BookOpen size={16} /> تصفّح الدورات
          </Link>
        </div>
      </div>
    </div>
  )
}

function WritingFeedback({ report }: { report: WritingReport }) {
  return (
    <div className="bg-violet-500/[.07] ring-1 ring-violet-500/20 rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
          <PenLine size={16} className="text-white" />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-black text-[15px]">تصحيح كتابتك</h3>
          <p className="text-slate-500 text-[11.5px] font-semibold">
            {report.words} كلمة · {report.sentences} جملة{report.source === 'local' && ' · تحليل مبدئي'}
          </p>
        </div>
        <div className="text-center shrink-0">
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
                  <code className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 text-[12px] font-mono line-through break-all">
                    {iss.fragment}
                  </code>
                  {iss.fix && (
                    <>
                      <span className="text-slate-600">→</span>
                      <code className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 text-[12px] font-mono break-all">
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
        <details className="mt-4">
          <summary className="cursor-pointer text-violet-300 font-bold text-[13px] hover:text-violet-200 transition">
            اعرض نصك بعد التصحيح
          </summary>
          <p className="mt-2 p-3 rounded-xl bg-black/20 text-slate-200 text-[13.5px] leading-relaxed text-left break-words" dir="ltr">
            {report.corrected}
          </p>
        </details>
      )}
    </div>
  )
}

function SubscribeCard({ level, plan, onExit }: {
  level:  CEFRLevel
  plan:   NonNullable<ReturnType<typeof getPlan>>
  onExit: () => void
}) {
  const [name, setName]   = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy]   = useState(false)
  const [sent, setSent]   = useState(false)

  /* Keep the result for the session so the package page can pick it up if the
     visitor would rather read the details before giving us a number. */
  useEffect(() => { savePlacement(level, plan.id) }, [level, plan.id])

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
    try {
      await createSubscriptionLead({
        planId: plan.id, level, fullName: name.trim(),
        phone: phone.trim() || undefined, amountMad: plan.amount_mad,
        source: 'level-test', planInterest: plan.id, ...getAttribution(),
      })
    } catch { /* the conversation matters more than the record */ }
    setSent(true); setBusy(false)
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waText)}`, '_blank', 'noopener')
  }

  return (
    <div className="rounded-3xl bg-gradient-to-br from-yellow-400/[.12] to-amber-500/[.06] ring-1 ring-yellow-400/25 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-yellow-400" />
        <span className="text-yellow-400 font-black text-[12px]">الدورة المناسبة لمستواك</span>
      </div>
      <h3 className="text-white text-2xl font-black mb-1">{plan.title_ar}</h3>
      <p className="text-slate-400 text-[14px] font-semibold mb-4">{plan.subtitle_ar}</p>

      <div className="flex flex-wrap items-baseline gap-2 mb-4">
        <span className="text-3xl font-black text-white tabular-nums">{plan.amount_mad}</span>
        <span className="text-slate-400 font-bold">درهم</span>
        {plan.originalAmount && (
          <span className="text-slate-600 line-through text-sm tabular-nums">{plan.originalAmount}</span>
        )}
        <span className="text-slate-500 text-[12px] font-semibold mr-auto">{plan.levelFrom} → {plan.levelTo}</span>
      </div>

      {plan.idealFor_ar && (
        <p className="text-slate-300 text-[13.5px] leading-relaxed bg-black/20 rounded-xl p-3.5 mb-4">
          {plan.idealFor_ar}
        </p>
      )}

      {sent ? (
        <div className="text-center py-3">
          <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
          <p className="text-white font-black mb-1">تم إرسال طلبك</p>
          <p className="text-slate-400 text-[13px] mb-4">إن لم تُفتح المحادثة، اضغط:</p>
          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waText)}`}
             target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 text-white font-black hover:bg-emerald-400 transition">
            <MessageCircle size={18} /> افتح واتساب
          </a>
        </div>
      ) : (
        <form onSubmit={go} className="space-y-2.5">
          <input value={name} onChange={e => setName(e.target.value)} required placeholder="اسمك الكامل"
                 className="w-full px-4 py-3.5 rounded-xl bg-white/[.06] ring-1 ring-white/15 text-white font-semibold
                            placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 transition" />
          <input value={phone} onChange={e => setPhone(e.target.value)} dir="ltr" inputMode="tel"
                 placeholder="رقم الهاتف (اختياري)"
                 className="w-full px-4 py-3.5 rounded-xl bg-white/[.06] ring-1 ring-white/15 text-white font-semibold text-right
                            placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 transition" />
          <button type="submit" disabled={busy || !name.trim()}
                  className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black text-lg hover:bg-emerald-400
                             active:scale-[.99] transition shadow-xl disabled:opacity-40 flex items-center justify-center gap-2">
            {busy ? <Loader2 size={20} className="animate-spin" /> : <MessageCircle size={20} />}
            سجّل الآن عبر واتساب
          </button>
          <p className="text-slate-600 text-[11px] font-semibold text-center">نرسل لك التفاصيل مباشرة — بلا التزام.</p>
        </form>
      )}

      {/* Not ready to give a number yet — read the full package first. */}
      <Link
        href={`/pricing/${plan.id}`}
        onClick={onExit}
        className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/[.06] ring-1 ring-white/10
                   text-slate-300 font-bold text-[13.5px] hover:bg-white/10 transition"
      >
        <BookOpen size={15} /> شوف تفاصيل «{plan.title_ar}» كاملة
      </Link>
    </div>
  )
}
