'use client'

import { useEffect, useRef, useState } from 'react'
import {
  X, Clock, Volume2, VolumeX, Play, Loader2, CheckCircle2, XCircle, Award,
  Headphones, BookOpen, ListChecks, MessageSquare, PenLine, Printer, Sparkles, RotateCcw,
} from 'lucide-react'
import { submitFinalExam, type FinalExamResult } from '@/lib/lms'

/* ─── Exam content (A0 / A1) ─────────────────────────────── */
interface MCQ { id: string; q: string; choices: string[]; answer: number; audio?: string }
interface Writing { id: string; prompt: string; keywords: string[]; minWords: number }

const DURATION_SEC = 25 * 60   // 25 minutes

const LISTENING: MCQ[] = [
  { id: 'l1', audio: 'Hello, my name is Sara. I am from Spain.', q: 'ما اسمها ومن أين هي؟', choices: ['Sara — from Spain', 'Sara — from Italy', 'Lina — from Spain', 'Sara — from France'], answer: 0 },
  { id: 'l2', audio: 'I am twenty five years old.', q: 'كم عمرها؟', choices: ['15', '25', '35', '20'], answer: 1 },
  { id: 'l3', audio: 'I wake up at seven o clock and then I go to work.', q: 'متى تستيقظ؟', choices: ['At 7', 'At 9', 'At 8', 'At 6'], answer: 0 },
  { id: 'l4', audio: 'My brother is a doctor and he lives in Rabat.', q: 'ما مهنة أخيها وأين يسكن؟', choices: ['Teacher in Rabat', 'Doctor in Rabat', 'Doctor in Fez', 'Driver in Rabat'], answer: 1 },
]

const READING_PASSAGE = `My name is Adil. I am 30 years old. I am from Morocco. I am a teacher. I live with my wife and my two children. Every morning I wake up at 6 o'clock, I drink a cup of coffee, and I go to work. In the evening, I read a book before I sleep.`
const READING: MCQ[] = [
  { id: 'r1', q: 'كم عمر عادل؟', choices: ['20', '25', '30', '35'], answer: 2 },
  { id: 'r2', q: 'ما مهنته؟', choices: ['Doctor', 'Teacher', 'Driver', 'Nurse'], answer: 1 },
  { id: 'r3', q: 'ماذا يشرب في الصباح؟', choices: ['Tea', 'Water', 'Coffee', 'Juice'], answer: 2 },
  { id: 'r4', q: 'ماذا يفعل في المساء قبل النوم؟', choices: ['Watches TV', 'Reads a book', 'Plays football', 'Cooks'], answer: 1 },
]

const GRAMMAR: MCQ[] = [
  { id: 'g1', q: 'اختر الصحيح: She ___ a nurse.', choices: ['am', 'is', 'are', 'be'], answer: 1 },
  { id: 'g2', q: 'اختر الأداة الصحيحة: I have ___ apple.', choices: ['a', 'an', 'the', '—'], answer: 1 },
  { id: 'g3', q: 'ما جمع كلمة «child»؟', choices: ['childs', 'children', 'childes', 'child'], answer: 1 },
  { id: 'g4', q: 'ما عكس كلمة «big»؟', choices: ['small', 'tall', 'long', 'new'], answer: 0 },
  { id: 'g5', q: 'اختر التهجئة الصحيحة ليوم الأربعاء:', choices: ['Wensday', 'Wednesday', 'Wendsday', 'Wednsday'], answer: 1 },
  { id: 'g6', q: 'رتّب الكلمات: «هل تحب القهوة؟»', choices: ['Do you like coffee?', 'You do like coffee?', 'Like you coffee do?', 'Coffee you like do?'], answer: 0 },
]

const DIALOGUE_LINES = [
  'A: Hello! How ①___ you?',
  'B: I am fine. What is your ②___?',
  'A: My name is Omar. Where are you ③___?',
  'B: I am from Spain. Nice to ④___ you.',
]
const DIALOGUE: MCQ[] = [
  { id: 'd1', q: 'املأ الفراغ ① :', choices: ['are', 'is', 'am', 'be'], answer: 0 },
  { id: 'd2', q: 'املأ الفراغ ② :', choices: ['name', 'age', 'job', 'city'], answer: 0 },
  { id: 'd3', q: 'املأ الفراغ ③ :', choices: ['from', 'in', 'at', 'to'], answer: 0 },
  { id: 'd4', q: 'املأ الفراغ ④ :', choices: ['meet', 'meat', 'met', 'meeting'], answer: 0 },
]

const WRITING: Writing[] = [
  { id: 'w1', prompt: 'اكتب جملة تُعرّف فيها بنفسك (اسمك، عمرك، بلدك) بالإنجليزية.', keywords: ['i am', 'my name', 'from'], minWords: 5 },
  { id: 'w2', prompt: 'اكتب جملة واحدة عن مهنتك أو شيء تحبّه بالإنجليزية.', keywords: ['i am', 'i like', 'i work', 'i love'], minWords: 3 },
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

interface Props { token: string; fullName: string; onClose: () => void }

export default function FinalExam({ token, fullName, onClose }: Props) {
  const [phase, setPhase] = useState<'intro' | 'exam' | 'result'>('intro')
  const [time, setTime] = useState(DURATION_SEC)
  const [mcq, setMcq] = useState<Record<string, number>>({})
  const [writes, setWrites] = useState<Record<string, string>>({})
  const [result, setResult] = useState<FinalExamResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [muted, setMuted] = useState(false)
  const [playing, setPlaying] = useState<string | null>(null)

  const audioCtx = useRef<AudioContext | null>(null)
  const masterGain = useRef<GainNode | null>(null)
  const clipRef = useRef<HTMLAudioElement | null>(null)

  /* calm ambient pad (soft A-major-ish chord with slow movement) */
  function startAmbient() {
    try {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext; if (!Ctx) return
      const ac = new Ctx(); audioCtx.current = ac
      const master = ac.createGain(); master.gain.value = muted ? 0 : 0.04; master.connect(ac.destination); masterGain.current = master
      const filter = ac.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 700; filter.connect(master)
      ;[220, 277.18, 329.63].forEach((f, i) => {
        const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f
        const g = ac.createGain(); g.gain.value = 0.5 - i * 0.1
        o.connect(g); g.connect(filter); o.start()
      })
      // slow LFO on the filter for gentle motion
      const lfo = ac.createOscillator(); lfo.frequency.value = 0.07
      const lfoGain = ac.createGain(); lfoGain.gain.value = 220
      lfo.connect(lfoGain); lfoGain.connect(filter.frequency); lfo.start()
    } catch {}
  }
  function toggleMute() {
    setMuted(m => { const n = !m; if (masterGain.current && audioCtx.current) masterGain.current.gain.setTargetAtTime(n ? 0 : 0.04, audioCtx.current.currentTime, 0.1); return n })
  }

  // countdown
  useEffect(() => {
    if (phase !== 'exam') return
    const iv = setInterval(() => setTime(t => { if (t <= 1) { clearInterval(iv); finish(); return 0 } return t - 1 }), 1000)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(() => () => { try { audioCtx.current?.close() } catch {}; try { clipRef.current?.pause() } catch {} }, [])

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

  async function finish() {
    if (submitting || result) return
    setSubmitting(true)
    let score = 0
    ALL_MCQ.forEach(q => { if (mcq[q.id] === q.answer) score++ })
    WRITING.forEach(w => { if (gradeWriting(writes[w.id] || '', w.keywords, w.minWords)) score++ })
    try { audioCtx.current?.close() } catch {}
    const res = await submitFinalExam(token, score, TOTAL)
    setSubmitting(false)
    setResult(res ?? { ok: true, passed: score / TOTAL >= 0.6, percent: Math.round(score / TOTAL * 100), score, total: TOTAL, cert_number: '', full_name: fullName, level: 'A0 - A1', date: new Date().toISOString().slice(0, 10) })
    setPhase('result')
  }

  const answeredCount = Object.keys(mcq).length + Object.values(writes).filter(v => v.trim()).length
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  /* ═══ INTRO ═══ */
  if (phase === 'intro') return (
    <div className="fixed inset-0 z-[120] bg-[#14161c] overflow-y-auto vp-fade" dir="rtl">
      <div className="max-w-lg mx-auto px-5 py-8">
        <button onClick={onClose} className="text-zinc-400 hover:text-white mb-4"><X size={22} /></button>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-black flex items-center justify-center mx-auto mb-4"><Award size={32} /></div>
          <h1 className="text-white font-black text-[22px]">الامتحان النهائي — المستوى A0 / A1</h1>
          <p className="text-zinc-400 text-[13px] mt-1.5 leading-relaxed">اجتَز هذا الامتحان لتحصل على شهادة إتمام المستوى الأول من Inglizi.com.</p>
        </div>

        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 mt-6 space-y-3">
          <div className="text-white font-bold text-[14px] mb-1">ماذا يتضمّن الامتحان؟</div>
          {[
            { icon: Headphones, t: 'الاستماع', d: `${LISTENING.length} أسئلة — استمع وأجب` },
            { icon: BookOpen, t: 'القراءة', d: `${READING.length} أسئلة عن نصّ قصير` },
            { icon: ListChecks, t: 'القواعد والمفردات', d: `${GRAMMAR.length} أسئلة اختيار من متعدّد` },
            { icon: MessageSquare, t: 'حوار — املأ الفراغات', d: `${DIALOGUE.length} فراغات` },
            { icon: PenLine, t: 'الكتابة', d: `${WRITING.length} جمل بسيطة` },
          ].map((s, i) => { const I = s.icon; return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-yellow-400/15 flex items-center justify-center flex-shrink-0"><I size={16} className="text-yellow-400" /></div>
              <div className="flex-1"><div className="text-white text-[13px] font-bold">{s.t}</div><div className="text-zinc-400 text-[11px]">{s.d}</div></div>
            </div>
          )})}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div className="bg-white/[0.04] rounded-xl p-3"><Clock size={16} className="text-yellow-400 mx-auto mb-1" /><div className="text-white font-black text-[15px]">25 دقيقة</div><div className="text-zinc-500 text-[10px]">المدّة</div></div>
          <div className="bg-white/[0.04] rounded-xl p-3"><ListChecks size={16} className="text-yellow-400 mx-auto mb-1" /><div className="text-white font-black text-[15px]">{TOTAL} سؤال</div><div className="text-zinc-500 text-[10px]">المجموع</div></div>
          <div className="bg-white/[0.04] rounded-xl p-3"><Award size={16} className="text-yellow-400 mx-auto mb-1" /><div className="text-white font-black text-[15px]">60%</div><div className="text-zinc-500 text-[10px]">للنجاح</div></div>
        </div>

        <ul className="text-zinc-400 text-[12px] mt-4 space-y-1.5 leading-relaxed list-disc pr-4">
          <li>المؤقّت يبدأ فور الضغط على «ابدأ» ولا يتوقّف — يُسلَّم الامتحان تلقائيًا عند انتهاء الوقت.</li>
          <li>يمكنك سماع مقاطع الاستماع أكثر من مرّة.</li>
          <li>تُعزف موسيقى هادئة في الخلفية لمساعدتك على التركيز (يمكنك كتمها).</li>
          <li>عند النجاح تحصل على شهادة باسمك يمكنك طباعتها.</li>
        </ul>

        <button onClick={begin} className="w-full mt-6 py-4 rounded-2xl bg-yellow-400 text-black font-black text-[16px] flex items-center justify-center gap-2 hover:bg-yellow-300"><Sparkles size={18} /> ابدأ الامتحان</button>
      </div>
    </div>
  )

  /* ═══ RESULT / CERTIFICATE ═══ */
  if (phase === 'result' && result) return (
    <div className="fixed inset-0 z-[120] bg-[#14161c] overflow-y-auto vp-fade" dir="rtl">
      <div className="max-w-lg mx-auto px-5 py-8">
        <div className={`rounded-2xl p-6 text-center ${result.passed ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
          <div className="text-5xl mb-2">{result.passed ? '🎉' : '💪'}</div>
          <div className={`font-black text-[26px] ${result.passed ? 'text-emerald-400' : 'text-amber-400'}`}>{result.percent}%</div>
          <div className="text-zinc-300 text-[13px] mt-1">{result.score} / {result.total} إجابة صحيحة</div>
          <div className="text-zinc-400 text-[12px] mt-2">{result.passed ? 'مبروك! لقد اجتزت الامتحان النهائي للمستوى A0/A1.' : 'لم تجتَز هذه المرّة. راجع دروسك وأعد المحاولة.'}</div>
        </div>

        {result.passed && <Cert result={result} />}

        <div className="flex gap-2 mt-5">
          {result.passed
            ? <button onClick={() => printCert(result)} className="flex-1 py-3 rounded-xl bg-yellow-400 text-black font-black text-[14px] flex items-center justify-center gap-1.5"><Printer size={16} /> طباعة الشهادة</button>
            : <button onClick={() => { setMcq({}); setWrites({}); setTime(DURATION_SEC); setResult(null); setPhase('intro') }} className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-black text-[14px] flex items-center justify-center gap-1.5"><RotateCcw size={15} /> أعد المحاولة</button>}
          <button onClick={onClose} className="px-5 py-3 rounded-xl border border-white/15 text-zinc-300 font-bold text-[13px]">إغلاق</button>
        </div>
      </div>
    </div>
  )

  /* ═══ EXAM ═══ */
  const low = time <= 60
  return (
    <div className="fixed inset-0 z-[120] bg-[#f4f4f6] overflow-y-auto" dir="rtl">
      {/* sticky timer bar */}
      <div className="sticky top-0 z-10 bg-[#14161c] text-white">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <span className="font-black text-[13px] flex items-center gap-1.5"><Award size={15} className="text-yellow-400" /> الامتحان النهائي</span>
          <div className="flex-1" />
          <span className="text-[11px] text-zinc-400">{answeredCount}/{TOTAL}</span>
          <button onClick={toggleMute} className="text-zinc-300 hover:text-white" title="الموسيقى">{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>
          <span className={`font-black text-[15px] tabular-nums flex items-center gap-1 px-2 py-0.5 rounded-lg ${low ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/10'}`}><Clock size={14} /> {fmt(time)}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <Section icon={Headphones} color="text-violet-600" title="القسم 1 — الاستماع" sub="استمع إلى كل مقطع ثم اختر الإجابة">
          {LISTENING.map((q, i) => (
            <QCard key={q.id} n={i + 1} q={q} val={mcq[q.id]} onPick={j => setMcq(m => ({ ...m, [q.id]: j }))}
              media={<button onClick={() => playClip(q.id, q.audio!)} className="inline-flex items-center gap-1.5 text-[12px] font-bold text-violet-700 bg-violet-50 px-3 py-1.5 rounded-lg mb-2">{playing === q.id ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />} استمع</button>} />
          ))}
        </Section>

        <Section icon={BookOpen} color="text-sky-600" title="القسم 2 — القراءة" sub="اقرأ النص ثم أجب">
          <div className="bg-white border border-zinc-100 rounded-xl p-3.5 mb-3 text-[14px] leading-loose text-zinc-800" dir="ltr" style={{ textAlign: 'left' }}>{READING_PASSAGE}</div>
          {READING.map((q, i) => <QCard key={q.id} n={i + 1} q={q} val={mcq[q.id]} onPick={j => setMcq(m => ({ ...m, [q.id]: j }))} />)}
        </Section>

        <Section icon={ListChecks} color="text-blue-600" title="القسم 3 — القواعد والمفردات" sub="اختر الإجابة الصحيحة">
          {GRAMMAR.map((q, i) => <QCard key={q.id} n={i + 1} q={q} val={mcq[q.id]} onPick={j => setMcq(m => ({ ...m, [q.id]: j }))} />)}
        </Section>

        <Section icon={MessageSquare} color="text-amber-600" title="القسم 4 — الحوار (املأ الفراغات)" sub="اقرأ الحوار واملأ الفراغات">
          <div className="bg-white border border-zinc-100 rounded-xl p-3.5 mb-3 text-[14px] leading-loose text-zinc-800 space-y-1" dir="ltr" style={{ textAlign: 'left' }}>
            {DIALOGUE_LINES.map((l, i) => <div key={i}>{l}</div>)}
          </div>
          {DIALOGUE.map((q, i) => <QCard key={q.id} n={i + 1} q={q} val={mcq[q.id]} onPick={j => setMcq(m => ({ ...m, [q.id]: j }))} />)}
        </Section>

        <Section icon={PenLine} color="text-emerald-600" title="القسم 5 — الكتابة" sub="اكتب جملًا بسيطة بالإنجليزية">
          {WRITING.map((w, i) => (
            <div key={w.id} className="rounded-xl border border-zinc-100 bg-white p-3 mb-2">
              <div className="font-bold text-[13.5px] text-zinc-800 mb-2" dir="rtl">{i + 1}. {w.prompt}</div>
              <textarea value={writes[w.id] || ''} onChange={e => setWrites(s => ({ ...s, [w.id]: e.target.value }))} rows={2} dir="ltr" placeholder="Write here..." className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] resize-y focus:outline-none focus:ring-2 focus:ring-yellow-400" style={{ textAlign: 'left' }} />
            </div>
          ))}
        </Section>

        <button onClick={() => { if (confirm('هل أنت متأكد من تسليم الامتحان؟')) finish() }} disabled={submitting}
          className="w-full py-4 rounded-2xl bg-black text-white font-black text-[15px] flex items-center justify-center gap-2 disabled:opacity-60">
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} تسليم الامتحان
        </button>
        <div className="h-6" />
      </div>
    </div>
  )
}

function Section({ icon: Icon, color, title, sub, children }: { icon: any; color: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2"><Icon size={17} className={color} /><div><div className="font-black text-[14px] text-zinc-900">{title}</div><div className="text-[11px] text-zinc-400">{sub}</div></div></div>
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

/* on-screen certificate preview */
function Cert({ result }: { result: { full_name: string; percent: number; level: string; cert_number: string; date: string } }) {
  return (
    <div className="mt-5 rounded-2xl overflow-hidden border-4 border-yellow-400 bg-gradient-to-br from-white to-amber-50 text-zinc-900 p-5 text-center" dir="rtl">
      <div className="text-[11px] font-black tracking-widest text-zinc-400">INGLIZI.COM · أكاديمية إنجليزي الدولية</div>
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

/* printable certificate (opens a styled window) */
function printCert(r: { full_name: string; percent: number; level: string; cert_number: string; date: string }) {
  const w = window.open('', '_blank', 'width=900,height=650'); if (!w) return
  w.document.write(`<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>شهادة ${r.full_name}</title>
  <style>
    *{margin:0;box-sizing:border-box;font-family:'Tahoma',Arial,sans-serif}
    body{padding:24px;background:#f4f4f5}
    .cert{max-width:820px;margin:0 auto;background:#fff;border:14px solid #facc15;border-radius:18px;padding:46px;text-align:center;position:relative}
    .brand{letter-spacing:4px;font-size:13px;font-weight:800;color:#a1a1aa}
    .title{font-size:30px;font-weight:900;margin-top:14px;color:#18181b}
    .sub{font-size:14px;color:#71717a;margin-top:4px}
    .rule{height:2px;background:#fde68a;margin:22px auto;width:70%}
    .to{font-size:14px;color:#71717a}
    .name{font-size:34px;font-weight:900;color:#18181b;margin:8px 0}
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
