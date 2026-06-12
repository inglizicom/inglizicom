'use client'

import { useEffect, useRef, useState } from 'react'
import {
  X, Clock, Volume2, VolumeX, Play, Loader2, CheckCircle2, Award, Lock,
  Headphones, BookOpen, ListChecks, MessageSquare, PenLine, Printer, Sparkles, RotateCcw,
  Mic, Square, Send,
} from 'lucide-react'
import { submitFinalExam, uploadSpeaking, type FinalExamResult, type Certificate } from '@/lib/lms'

/* ─── Exam content (A0 / A1) ─────────────────────────────── */
interface MCQ { id: string; q: string; choices: string[]; answer: number; audio?: string }
interface Writing { id: string; prompt: string; keywords: string[]; minWords: number }

const DURATION_SEC = 35 * 60

const LISTENING: MCQ[] = [
  { id: 'l1', audio: 'Hello, my name is Sara. I am from Spain.', q: 'ما اسمها ومن أين هي؟', choices: ['Sara — from Spain', 'Sara — from Italy', 'Lina — from Spain', 'Sara — from France'], answer: 0 },
  { id: 'l2', audio: 'I am twenty five years old.', q: 'كم عمرها؟', choices: ['15', '25', '35', '20'], answer: 1 },
  { id: 'l3', audio: 'I wake up at seven o clock and then I go to work.', q: 'متى تستيقظ؟', choices: ['At 7', 'At 9', 'At 8', 'At 6'], answer: 0 },
  { id: 'l4', audio: 'My brother is a doctor and he lives in Rabat.', q: 'ما مهنة أخيها وأين يسكن؟', choices: ['Teacher in Rabat', 'Doctor in Rabat', 'Doctor in Fez', 'Driver in Rabat'], answer: 1 },
  { id: 'l5', audio: 'I like coffee but I do not like tea.', q: 'ماذا تحبّ وماذا لا تحبّ؟', choices: ['Likes coffee, not tea', 'Likes tea, not coffee', 'Likes both', 'Likes neither'], answer: 0 },
  { id: 'l6', audio: 'The bank is next to the school.', q: 'أين يقع البنك؟', choices: ['Next to the school', 'Behind the school', 'In front of the school', 'Near the hospital'], answer: 0 },
]

const READING_PASSAGE = `My name is Adil. I am 30 years old. I am from Morocco. I am a teacher. I live with my wife and my two children. Every morning I wake up at 6 o'clock, I drink a cup of coffee, and I go to work. In the evening, I read a book before I sleep.`
const READING: MCQ[] = [
  { id: 'r1', q: 'كم عمر عادل؟', choices: ['20', '25', '30', '35'], answer: 2 },
  { id: 'r2', q: 'ما مهنته؟', choices: ['Doctor', 'Teacher', 'Driver', 'Nurse'], answer: 1 },
  { id: 'r3', q: 'ماذا يشرب في الصباح؟', choices: ['Tea', 'Water', 'Coffee', 'Juice'], answer: 2 },
  { id: 'r4', q: 'ماذا يفعل في المساء قبل النوم؟', choices: ['Watches TV', 'Reads a book', 'Plays football', 'Cooks'], answer: 1 },
  { id: 'r5', q: 'مع من يسكن عادل؟', choices: ['Alone', 'With his wife and two children', 'With his parents', 'With friends'], answer: 1 },
  { id: 'r6', q: 'متى يستيقظ؟', choices: ['At 6', 'At 7', 'At 8', 'At 5'], answer: 0 },
]

const GRAMMAR: MCQ[] = [
  { id: 'g1', q: 'اختر الصحيح: She ___ a nurse.', choices: ['am', 'is', 'are', 'be'], answer: 1 },
  { id: 'g2', q: 'اختر الأداة الصحيحة: I have ___ apple.', choices: ['a', 'an', 'the', '—'], answer: 1 },
  { id: 'g3', q: 'ما جمع كلمة «child»؟', choices: ['childs', 'children', 'childes', 'child'], answer: 1 },
  { id: 'g4', q: 'ما عكس كلمة «big»؟', choices: ['small', 'tall', 'long', 'new'], answer: 0 },
  { id: 'g5', q: 'اختر التهجئة الصحيحة ليوم الأربعاء:', choices: ['Wensday', 'Wednesday', 'Wendsday', 'Wednsday'], answer: 1 },
  { id: 'g6', q: 'رتّب الكلمات: «هل تحب القهوة؟»', choices: ['Do you like coffee?', 'You do like coffee?', 'Like you coffee do?', 'Coffee you like do?'], answer: 0 },
  { id: 'g7', q: 'اختر الصحيح: They ___ from Italy.', choices: ['is', 'am', 'are', 'be'], answer: 2 },
  { id: 'g8', q: 'ما عكس كلمة «open»؟', choices: ['close', 'big', 'old', 'fast'], answer: 0 },
  { id: 'g9', q: 'اختر التهجئة الصحيحة لكلمة «بيت»:', choices: ['hous', 'house', 'howse', 'hause'], answer: 1 },
  { id: 'g10', q: 'أكمل: I ___ a student.', choices: ['am', 'is', 'are', 'be'], answer: 0 },
]

const DIALOGUE_LINES = [
  'A: Hello! How ①___ you?',
  'B: I am fine. What is your ②___?',
  'A: My name is Omar. Where are you ③___?',
  'B: I am from Spain. ④___ old are you?',
  'A: I am twenty. ⑤___ to meet you.',
  'B: Nice to meet you ⑥___.',
]
const DIALOGUE: MCQ[] = [
  { id: 'd1', q: 'املأ الفراغ ① :', choices: ['are', 'is', 'am', 'be'], answer: 0 },
  { id: 'd2', q: 'املأ الفراغ ② :', choices: ['name', 'age', 'job', 'city'], answer: 0 },
  { id: 'd3', q: 'املأ الفراغ ③ :', choices: ['from', 'in', 'at', 'to'], answer: 0 },
  { id: 'd4', q: 'املأ الفراغ ④ :', choices: ['How', 'What', 'Where', 'Who'], answer: 0 },
  { id: 'd5', q: 'املأ الفراغ ⑤ :', choices: ['Nice', 'Bad', 'Good night', 'Bye'], answer: 0 },
  { id: 'd6', q: 'املأ الفراغ ⑥ :', choices: ['too', 'to', 'two', 'so'], answer: 0 },
]

const WRITING: Writing[] = [
  { id: 'w1', prompt: 'اكتب جملة تُعرّف فيها بنفسك (اسمك، عمرك، بلدك) بالإنجليزية.', keywords: ['i am', 'my name', 'from'], minWords: 5 },
  { id: 'w2', prompt: 'اكتب جملة واحدة عن مهنتك أو شيء تحبّه بالإنجليزية.', keywords: ['i am', 'i like', 'i work', 'i love'], minWords: 3 },
  { id: 'w3', prompt: 'اكتب جملة تصف فيها روتينك اليومي (مثال: I wake up at ...).', keywords: ['i wake', 'i go', 'every', 'i get'], minWords: 4 },
]

const ALL_MCQ = [...LISTENING, ...READING, ...GRAMMAR, ...DIALOGUE]
const TOTAL = ALL_MCQ.length + WRITING.length

function gradeWriting(text: string, kw: string[], minWords: number) {
  const t = (text || '').trim().toLowerCase()
  const words = t ? t.split(/\s+/).filter(Boolean).length : 0
  return words >= minWords && kw.some(k => t.includes(k))
}

/* ─── TTS (OpenAI via /api/tts, browser fallback) ─────────── */
const ttsCache = new Map<string, string>()
async function fetchTTS(text: string): Promise<string | null> {
  if (ttsCache.has(text)) return ttsCache.get(text)!
  try {
    const r = await fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
    if (!r.ok) return null
    const url = URL.createObjectURL(await r.blob()); ttsCache.set(text, url); return url
  } catch { return null }
}
function speakFallback(text: string) {
  try { const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.85; speechSynthesis.cancel(); speechSynthesis.speak(u) } catch {}
}

interface Props { token: string; fullName: string; onClose: () => void; locked?: boolean; initialCert?: Certificate | null }

export default function FinalExam({ token, fullName, onClose, locked, initialCert }: Props) {
  const certResult = initialCert ? { ok: true, passed: true, percent: initialCert.percent, score: 0, total: 0, cert_number: initialCert.cert_number, full_name: initialCert.full_name, level: initialCert.level, date: initialCert.date } as FinalExamResult : null
  const [phase, setPhase] = useState<'intro' | 'exam' | 'speaking' | 'result'>(certResult ? 'result' : 'intro')
  const [time, setTime] = useState(DURATION_SEC)
  const [mcq, setMcq] = useState<Record<string, number>>({})
  const [writes, setWrites] = useState<Record<string, string>>({})
  const [writtenScore, setWrittenScore] = useState(0)
  const [result, setResult] = useState<FinalExamResult | null>(certResult)
  const [submitting, setSubmitting] = useState(false)
  const [muted, setMuted] = useState(true)        // music OFF by default
  const [playing, setPlaying] = useState<string | null>(null)

  // speaking
  const [recState, setRecState] = useState<'idle' | 'recording' | 'recorded' | 'error'>('idle')
  const [recUrl, setRecUrl] = useState<string>('')
  const recBlob = useRef<Blob | null>(null)
  const recorder = useRef<MediaRecorder | null>(null)
  const recStream = useRef<MediaStream | null>(null)
  const recTimer = useRef<any>(null)
  const [recSecs, setRecSecs] = useState(0)

  const audioCtx = useRef<AudioContext | null>(null)
  const masterGain = useRef<GainNode | null>(null)
  const clipRef = useRef<HTMLAudioElement | null>(null)

  /* very soft, slow ambient pad (gentle — and starts muted) */
  const ON_GAIN = 0.018
  function startAmbient() {
    try {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext; if (!Ctx) return
      const ac = new Ctx(); audioCtx.current = ac
      const master = ac.createGain(); master.gain.value = muted ? 0 : ON_GAIN; master.connect(ac.destination); masterGain.current = master
      const filter = ac.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 520; filter.Q.value = 0.3; filter.connect(master)
      ;[220, 329.63].forEach((f, i) => {   // soft root + fifth
        const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f
        const g = ac.createGain(); g.gain.value = 0.5 - i * 0.15
        o.connect(g); g.connect(filter); o.start()
      })
      // very slow, shallow tremolo for life (not a filter sweep)
      const lfo = ac.createOscillator(); lfo.frequency.value = 0.08
      const lfoGain = ac.createGain(); lfoGain.gain.value = ON_GAIN * 0.35
      lfo.connect(lfoGain); lfoGain.connect(master.gain); lfo.start()
    } catch {}
  }
  function setAmbient(on: boolean) { if (masterGain.current && audioCtx.current) masterGain.current.gain.setTargetAtTime(on ? ON_GAIN : 0, audioCtx.current.currentTime, 0.2) }
  function toggleMute() { setMuted(m => { const n = !m; setAmbient(!n); return n }) }

  // countdown (exam only)
  useEffect(() => {
    if (phase !== 'exam') return
    const iv = setInterval(() => setTime(t => { if (t <= 1) { clearInterval(iv); finishWritten(); return 0 } return t - 1 }), 1000)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(() => () => { try { audioCtx.current?.close() } catch {}; try { clipRef.current?.pause() } catch {}; stopStream() }, [])

  function begin() { setPhase('exam'); startAmbient() }

  async function playClip(id: string, text: string) {
    setPlaying(id)
    try { clipRef.current?.pause() } catch {}
    const url = await fetchTTS(text)
    if (!url) { speakFallback(text); setTimeout(() => setPlaying(p => p === id ? null : p), 2500); return }
    const a = new Audio(url); clipRef.current = a
    a.onended = () => setPlaying(p => p === id ? null : p)
    a.play().catch(() => { speakFallback(text); setPlaying(null) })
  }

  function gradeWritten() {
    let s = 0
    ALL_MCQ.forEach(q => { if (mcq[q.id] === q.answer) s++ })
    WRITING.forEach(w => { if (gradeWriting(writes[w.id] || '', w.keywords, w.minWords)) s++ })
    return s
  }

  async function finishWritten() {
    if (submitting || result) return
    const s = gradeWritten(); setWrittenScore(s)
    if (s / TOTAL >= 0.6) {
      setPhase('speaking')   // must record the speaking step before the certificate
    } else {
      setSubmitting(true)
      try { audioCtx.current?.close() } catch {}
      const res = await submitFinalExam(token, s, TOTAL)
      setSubmitting(false)
      setResult(res ?? { ok: true, passed: false, percent: Math.round(s / TOTAL * 100), score: s, total: TOTAL, cert_number: '', full_name: fullName, level: 'A0 - A1', date: new Date().toISOString().slice(0, 10) })
      setPhase('result')
    }
  }

  /* ── speaking recorder ── */
  function stopStream() { try { recStream.current?.getTracks().forEach(t => t.stop()) } catch {}; clearInterval(recTimer.current) }
  async function startRec() {
    setAmbient(false)   // don't capture the music
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      recStream.current = stream
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : ''
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined); recorder.current = mr
      const chunks: Blob[] = []
      mr.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }
      mr.onstop = () => { const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' }); recBlob.current = blob; setRecUrl(URL.createObjectURL(blob)); setRecState('recorded'); stopStream() }
      mr.start(); setRecState('recording'); setRecSecs(0)
      recTimer.current = setInterval(() => setRecSecs(s => { if (s >= 90) { stopRec(); return s } return s + 1 }), 1000)
    } catch { setRecState('error') }
  }
  function stopRec() { try { recorder.current?.state === 'recording' && recorder.current.stop() } catch {}; clearInterval(recTimer.current) }
  function reRec() { setRecState('idle'); setRecUrl(''); recBlob.current = null; setRecSecs(0) }

  async function submitSpeaking() {
    setSubmitting(true)
    let path: string | null = null
    if (recBlob.current) path = await uploadSpeaking(token, recBlob.current)
    try { audioCtx.current?.close() } catch {}
    const res = await submitFinalExam(token, writtenScore, TOTAL, path)
    setSubmitting(false)
    setResult(res ?? { ok: true, passed: true, percent: Math.round(writtenScore / TOTAL * 100), score: writtenScore, total: TOTAL, cert_number: '', full_name: fullName, level: 'A0 - A1', date: new Date().toISOString().slice(0, 10) })
    setPhase('result')
  }

  const answeredCount = Object.keys(mcq).length + Object.values(writes).filter(v => v.trim()).length
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  /* ═══ LOCKED ═══ */
  if (locked && !initialCert) return (
    <div className="fixed inset-0 z-[120] bg-[#2a1d12] flex items-center justify-center p-5 vp-fade" dir="rtl">
      <div className="max-w-sm text-center">
        <button onClick={onClose} className="absolute top-5 left-5 text-amber-200/60 hover:text-white"><X size={22} /></button>
        <div className="w-16 h-16 rounded-2xl bg-amber-900/40 flex items-center justify-center mx-auto mb-4"><Lock size={30} className="text-yellow-400" /></div>
        <h1 className="text-white font-black text-[20px]">الامتحان النهائي مقفل</h1>
        <p className="text-amber-100/70 text-[13px] mt-2 leading-relaxed">يجب إكمال جميع وحدات الدورة أولًا لفتح الامتحان النهائي والحصول على الشهادة. واصل دروسك — أنت قريب!</p>
        <button onClick={onClose} className="mt-6 px-6 py-3 rounded-xl bg-yellow-400 text-black font-bold text-[14px]">العودة للدروس</button>
      </div>
    </div>
  )

  /* ═══ INTRO ═══ */
  if (phase === 'intro') return (
    <div className="fixed inset-0 z-[120] bg-[#2a1d12] overflow-y-auto vp-fade" dir="rtl">
      <div className="max-w-lg mx-auto px-5 py-8">
        <button onClick={onClose} className="text-amber-200/60 hover:text-white mb-4"><X size={22} /></button>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-black flex items-center justify-center mx-auto mb-4"><Award size={32} /></div>
          <h1 className="text-white font-black text-[22px]">الامتحان النهائي — المستوى A0 / A1</h1>
          <p className="text-amber-100/70 text-[13px] mt-1.5 leading-relaxed">اجتَز هذا الامتحان لتحصل على شهادة إتمام المستوى الأول من Inglizi.com.</p>
        </div>

        <div className="bg-white/[0.05] border border-yellow-400/15 rounded-2xl p-4 mt-6 space-y-3">
          <div className="text-white font-bold text-[14px] mb-1">ماذا يتضمّن الامتحان؟</div>
          {[
            { icon: Headphones, t: 'الاستماع', d: `${LISTENING.length} أسئلة — استمع وأجب` },
            { icon: BookOpen, t: 'القراءة', d: `${READING.length} أسئلة عن نصّ قصير` },
            { icon: ListChecks, t: 'القواعد والمفردات', d: `${GRAMMAR.length} أسئلة اختيار من متعدّد` },
            { icon: MessageSquare, t: 'حوار — املأ الفراغات', d: `${DIALOGUE.length} فراغات` },
            { icon: PenLine, t: 'الكتابة', d: `${WRITING.length} جمل بسيطة` },
            { icon: Mic, t: 'المحادثة (تسجيل صوتي)', d: 'تسجّل نفسك في الخطوة الأخيرة' },
          ].map((s, i) => { const I = s.icon; return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-yellow-400/15 flex items-center justify-center flex-shrink-0"><I size={16} className="text-yellow-400" /></div>
              <div className="flex-1"><div className="text-white text-[13px] font-bold">{s.t}</div><div className="text-amber-100/50 text-[11px]">{s.d}</div></div>
            </div>
          )})}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div className="bg-white/[0.05] rounded-xl p-3"><Clock size={16} className="text-yellow-400 mx-auto mb-1" /><div className="text-white font-black text-[15px]">35 دقيقة</div><div className="text-amber-100/40 text-[10px]">المدّة</div></div>
          <div className="bg-white/[0.05] rounded-xl p-3"><ListChecks size={16} className="text-yellow-400 mx-auto mb-1" /><div className="text-white font-black text-[15px]">{TOTAL} سؤال</div><div className="text-amber-100/40 text-[10px]">+ محادثة</div></div>
          <div className="bg-white/[0.05] rounded-xl p-3"><Award size={16} className="text-yellow-400 mx-auto mb-1" /><div className="text-white font-black text-[15px]">60%</div><div className="text-amber-100/40 text-[10px]">للنجاح</div></div>
        </div>

        <ul className="text-amber-100/60 text-[12px] mt-4 space-y-1.5 leading-relaxed list-disc pr-4">
          <li>المؤقّت يبدأ فور الضغط على «ابدأ» ولا يتوقّف — يُسلَّم الامتحان تلقائيًا عند انتهاء الوقت.</li>
          <li>بعد اجتياز الأسئلة، الخطوة الأخيرة محادثة: تسجّل صوتك ثم ترسله.</li>
          <li>يمكنك تشغيل موسيقى هادئة للتركيز (متوقّفة افتراضيًا — فعّلها بالأيقونة 🎵).</li>
          <li>عند النجاح تحصل على شهادة باسمك يمكنك طباعتها.</li>
        </ul>

        <button onClick={begin} className="w-full mt-6 py-4 rounded-2xl bg-yellow-400 text-black font-black text-[16px] flex items-center justify-center gap-2 hover:bg-yellow-300"><Sparkles size={18} /> ابدأ الامتحان</button>
      </div>
    </div>
  )

  /* ═══ SPEAKING ═══ */
  if (phase === 'speaking') return (
    <div className="fixed inset-0 z-[120] bg-[#2a1d12] overflow-y-auto vp-fade" dir="rtl">
      <div className="max-w-lg mx-auto px-5 py-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-black flex items-center justify-center mx-auto mb-4"><Mic size={30} /></div>
          <h1 className="text-white font-black text-[20px]">الخطوة الأخيرة — المحادثة 🎙️</h1>
          <p className="text-amber-100/70 text-[13px] mt-1.5 leading-relaxed">أحسنت! نجحت في الأسئلة. للحصول على الشهادة، سجّل نفسك تتحدّث بالإنجليزية حسب التعليمات.</p>
        </div>

        <div className="bg-white/[0.05] border border-yellow-400/15 rounded-2xl p-4 mt-5 text-amber-50 text-[13px] leading-relaxed">
          <b className="text-yellow-400">تحدّث لمدّة 30–60 ثانية عن:</b>
          <div className="mt-1.5" dir="ltr" style={{ textAlign: 'left' }}>Your name · your age · your country · your job · what you like.</div>
          <div className="text-amber-100/50 text-[11px] mt-1">مثال: «Hello, my name is… I am … years old. I am from … I am a … I like …»</div>
        </div>

        <div className="bg-white/[0.05] rounded-2xl p-5 mt-4 text-center">
          {recState === 'error' ? (
            <>
              <p className="text-rose-300 text-[13px] mb-3">تعذّر الوصول إلى الميكروفون. اسمح بالإذن وأعد المحاولة.</p>
              <button onClick={() => { setRecState('idle') }} className="px-5 py-2.5 rounded-xl bg-yellow-400 text-black font-bold text-[13px]">حسنًا</button>
            </>
          ) : recState === 'idle' ? (
            <button onClick={startRec} className="w-20 h-20 rounded-full bg-rose-500 hover:bg-rose-400 flex items-center justify-center mx-auto shadow-lg"><Mic size={34} className="text-white" /></button>
          ) : recState === 'recording' ? (
            <>
              <button onClick={stopRec} className="w-20 h-20 rounded-full bg-rose-600 flex items-center justify-center mx-auto shadow-lg animate-pulse"><Square size={28} className="text-white" fill="currentColor" /></button>
              <div className="text-white font-black text-[16px] mt-3 tabular-nums">{fmt(recSecs)}</div>
              <div className="text-amber-100/50 text-[11px]">جارٍ التسجيل… اضغط للإيقاف</div>
            </>
          ) : (
            <>
              <audio src={recUrl} controls className="w-full mb-3" />
              <button onClick={reRec} className="text-[12px] text-amber-200/70 underline">إعادة التسجيل</button>
            </>
          )}
        </div>

        {recState === 'recorded' && (
          <button onClick={submitSpeaking} disabled={submitting} className="w-full mt-4 py-4 rounded-2xl bg-yellow-400 text-black font-black text-[15px] flex items-center justify-center gap-2 disabled:opacity-60">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={17} />} إرسال وإصدار الشهادة
          </button>
        )}
        <p className="text-amber-100/40 text-[11px] text-center mt-3">يصل تسجيلك إلى فريق Inglizi.com للمراجعة.</p>
      </div>
    </div>
  )

  /* ═══ RESULT / CERTIFICATE ═══ */
  if (phase === 'result' && result) return (
    <div className="fixed inset-0 z-[120] bg-[#2a1d12] overflow-y-auto vp-fade" dir="rtl">
      <div className="max-w-lg mx-auto px-5 py-8">
        <button onClick={onClose} className="text-amber-200/60 hover:text-white mb-3"><X size={22} /></button>
        <div className={`rounded-2xl p-6 text-center ${result.passed ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
          <div className="text-5xl mb-2">{result.passed ? '🎉' : '💪'}</div>
          <div className={`font-black text-[26px] ${result.passed ? 'text-emerald-400' : 'text-amber-400'}`}>{result.percent}%</div>
          {result.total > 0 && <div className="text-amber-50 text-[13px] mt-1">{result.score} / {result.total} إجابة صحيحة</div>}
          <div className="text-amber-100/60 text-[12px] mt-2">{result.passed ? 'مبروك! لقد اجتزت الامتحان النهائي للمستوى A0/A1.' : 'لم تجتَز هذه المرّة. راجع دروسك وأعد المحاولة.'}</div>
        </div>

        {result.passed && <Cert result={result} />}

        <div className="flex gap-2 mt-5">
          {result.passed
            ? <button onClick={() => printCert(result)} className="flex-1 py-3 rounded-xl bg-yellow-400 text-black font-black text-[14px] flex items-center justify-center gap-1.5"><Printer size={16} /> طباعة الشهادة</button>
            : <button onClick={() => { setMcq({}); setWrites({}); setTime(DURATION_SEC); setResult(null); setPhase('intro') }} className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-black text-[14px] flex items-center justify-center gap-1.5"><RotateCcw size={15} /> أعد المحاولة</button>}
          <button onClick={onClose} className="px-5 py-3 rounded-xl border border-white/15 text-amber-100/70 font-bold text-[13px]">إغلاق</button>
        </div>
      </div>
    </div>
  )

  /* ═══ EXAM ═══ */
  const low = time <= 60
  return (
    <div className="fixed inset-0 z-[120] bg-[#faf7f2] overflow-y-auto" dir="rtl">
      <div className="sticky top-0 z-10 bg-[#2a1d12] text-white">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <span className="font-black text-[13px] flex items-center gap-1.5"><Award size={15} className="text-yellow-400" /> الامتحان النهائي</span>
          <div className="flex-1" />
          <span className="text-[11px] text-amber-100/50">{answeredCount}/{TOTAL}</span>
          <button onClick={toggleMute} className="text-amber-100/70 hover:text-white" title="موسيقى هادئة">{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>
          <span className={`font-black text-[15px] tabular-nums flex items-center gap-1 px-2 py-0.5 rounded-lg ${low ? 'bg-rose-500 text-white animate-pulse' : 'bg-yellow-400 text-black'}`}><Clock size={14} /> {fmt(time)}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <Section icon={Headphones} accent="violet" title="القسم 1 — الاستماع" sub="استمع إلى كل مقطع ثم اختر الإجابة">
          {LISTENING.map((q, i) => (
            <QCard key={q.id} n={i + 1} q={q} val={mcq[q.id]} onPick={j => setMcq(m => ({ ...m, [q.id]: j }))}
              media={<button onClick={() => playClip(q.id, q.audio!)} className="inline-flex items-center gap-1.5 text-[12px] font-bold text-violet-700 bg-violet-50 px-3 py-1.5 rounded-lg mb-2">{playing === q.id ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />} استمع</button>} />
          ))}
        </Section>

        <Section icon={BookOpen} accent="sky" title="القسم 2 — القراءة" sub="اقرأ النص ثم أجب">
          <div className="bg-white border border-zinc-100 rounded-xl p-3.5 mb-3 text-[14px] leading-loose text-zinc-800" dir="ltr" style={{ textAlign: 'left' }}>{READING_PASSAGE}</div>
          {READING.map((q, i) => <QCard key={q.id} n={i + 1} q={q} val={mcq[q.id]} onPick={j => setMcq(m => ({ ...m, [q.id]: j }))} />)}
        </Section>

        <Section icon={ListChecks} accent="blue" title="القسم 3 — القواعد والمفردات" sub="اختر الإجابة الصحيحة">
          {GRAMMAR.map((q, i) => <QCard key={q.id} n={i + 1} q={q} val={mcq[q.id]} onPick={j => setMcq(m => ({ ...m, [q.id]: j }))} />)}
        </Section>

        <Section icon={MessageSquare} accent="amber" title="القسم 4 — الحوار (املأ الفراغات)" sub="اقرأ الحوار واملأ الفراغات">
          <div className="bg-white border border-zinc-100 rounded-xl p-3.5 mb-3 text-[14px] leading-loose text-zinc-800 space-y-1" dir="ltr" style={{ textAlign: 'left' }}>
            {DIALOGUE_LINES.map((l, i) => <div key={i}>{l}</div>)}
          </div>
          {DIALOGUE.map((q, i) => <QCard key={q.id} n={i + 1} q={q} val={mcq[q.id]} onPick={j => setMcq(m => ({ ...m, [q.id]: j }))} />)}
        </Section>

        <Section icon={PenLine} accent="emerald" title="القسم 5 — الكتابة" sub="اكتب جملًا بسيطة بالإنجليزية">
          {WRITING.map((w, i) => (
            <div key={w.id} className="rounded-xl border border-zinc-100 bg-white p-3 mb-2">
              <div className="font-bold text-[13.5px] text-zinc-800 mb-2" dir="rtl">{i + 1}. {w.prompt}</div>
              <textarea value={writes[w.id] || ''} onChange={e => setWrites(s => ({ ...s, [w.id]: e.target.value }))} rows={2} dir="ltr" placeholder="Write here..." className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] resize-y focus:outline-none focus:ring-2 focus:ring-yellow-400" style={{ textAlign: 'left' }} />
            </div>
          ))}
        </Section>

        <button onClick={() => { if (confirm('هل أنت متأكد من تسليم الأسئلة والانتقال للمحادثة؟')) finishWritten() }} disabled={submitting}
          className="w-full py-4 rounded-2xl bg-[#2a1d12] text-white font-black text-[15px] flex items-center justify-center gap-2 disabled:opacity-60">
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} تسليم والانتقال للمحادثة
        </button>
        <div className="h-6" />
      </div>
    </div>
  )
}

const ACCENT: Record<string, string> = { violet: 'text-violet-600', sky: 'text-sky-600', blue: 'text-blue-600', amber: 'text-amber-600', emerald: 'text-emerald-600' }
function Section({ icon: Icon, accent, title, sub, children }: { icon: any; accent: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2"><Icon size={17} className={ACCENT[accent]} /><div><div className="font-black text-[14px] text-zinc-900">{title}</div><div className="text-[11px] text-zinc-400">{sub}</div></div></div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}
function QCard({ n, q, val, onPick, media }: { n: number; q: MCQ; val?: number; onPick: (j: number) => void; media?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-3">
      {media}
      <div className="font-bold text-[13.5px] text-zinc-800 mb-2 leading-relaxed" dir="rtl">{n}. {q.q}</div>
      <div className="space-y-1.5">
        {q.choices.map((c, j) => (
          <button key={j} onClick={() => onPick(j)} dir="ltr" style={{ textAlign: 'left' }}
            className={`w-full px-3 py-2 rounded-lg border text-[13px] transition-colors ${val === j ? 'border-yellow-400 bg-yellow-50 text-zinc-900 font-bold' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>{c}</button>
        ))}
      </div>
    </div>
  )
}

function Cert({ result }: { result: { full_name: string; percent: number; level: string; cert_number: string; date: string } }) {
  return (
    <div className="mt-5 rounded-2xl overflow-hidden border-4 border-yellow-400 bg-gradient-to-br from-white to-amber-50 text-zinc-900 p-5 text-center" dir="rtl">
      <div className="text-[11px] font-black tracking-widest text-amber-700/60">INGLIZI.COM · أكاديمية إنجليزي الدولية</div>
      <div className="text-[18px] font-black mt-2 text-zinc-900">شهادة إتمام المستوى</div>
      <div className="text-[12px] text-zinc-500">Certificate of Completion — Level {result.level}</div>
      <div className="my-3 h-px bg-yellow-300" />
      <div className="text-[12px] text-zinc-500">تُمنح هذه الشهادة إلى</div>
      <div className="text-[20px] font-black text-zinc-900 my-1">{result.full_name}</div>
      <div className="text-[12px] text-zinc-500 leading-relaxed">لاجتيازه الامتحان النهائي للمستوى الأوّل (A0 – A1) بنتيجة <b className="text-emerald-600">{result.percent}%</b></div>
      <div className="flex items-center justify-between mt-4 text-[10px] text-zinc-400">
        <span>التاريخ: {result.date}</span>
        <span className="font-mono">{result.cert_number}</span>
      </div>
      <div className="text-[12px] font-bold text-zinc-700 mt-3">الأستاذ: حمزة القصراوي ✍️</div>
    </div>
  )
}

function printCert(r: { full_name: string; percent: number; level: string; cert_number: string; date: string }) {
  const w = window.open('', '_blank', 'width=900,height=650'); if (!w) return
  w.document.write(`<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>شهادة ${r.full_name}</title>
  <style>
    *{margin:0;box-sizing:border-box;font-family:'Tahoma',Arial,sans-serif}
    body{padding:24px;background:#faf7f2}
    .cert{max-width:820px;margin:0 auto;background:#fff;border:14px solid #facc15;border-radius:18px;padding:46px;text-align:center}
    .brand{letter-spacing:4px;font-size:13px;font-weight:800;color:#b45309}
    .title{font-size:30px;font-weight:900;margin-top:14px;color:#3a2a1a}
    .sub{font-size:14px;color:#71717a;margin-top:4px}
    .rule{height:2px;background:#fde68a;margin:22px auto;width:70%}
    .to{font-size:14px;color:#71717a}
    .name{font-size:34px;font-weight:900;color:#3a2a1a;margin:8px 0}
    .desc{font-size:15px;color:#52525b;line-height:1.9}
    .pct{color:#059669;font-weight:900}
    .foot{display:flex;justify-content:space-between;margin-top:34px;font-size:12px;color:#a1a1aa}
    .sig{font-size:15px;font-weight:800;color:#3f3f46;margin-top:18px}
    @media print{body{background:#fff;padding:0}.cert{border-radius:0}}
  </style></head><body><div class="cert">
    <div class="brand">INGLIZI.COM — أكاديمية إنجليزي الدولية</div>
    <div class="title">شهادة إتمام المستوى</div>
    <div class="sub">Certificate of Completion — Level ${r.level}</div>
    <div class="rule"></div>
    <div class="to">تُمنح هذه الشهادة بكل فخر إلى</div>
    <div class="name">${r.full_name}</div>
    <div class="desc">لاجتيازه الامتحان النهائي للمستوى الأوّل (A0 – A1)<br>بنتيجة <span class="pct">${r.percent}%</span></div>
    <div class="sig">الأستاذ: حمزة القصراوي ✍️</div>
    <div class="foot"><span>التاريخ: ${r.date}</span><span>${r.cert_number}</span></div>
  </div><script>window.onload=function(){setTimeout(function(){window.print()},300)}</script></body></html>`)
  w.document.close()
}
