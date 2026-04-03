'use client'

import { useState, useRef } from 'react'
import {
  PenLine, Mic, MicOff, CheckCircle2,
  XCircle, Lightbulb, ArrowRight, Loader2, RotateCcw,
  MessageCircle, Volume2, AlertCircle, Sparkles,
} from 'lucide-react'

// ─── Configuration ────────────────────────────────────────────────────────────

const WHATSAPP_NUMBER = '212707902091'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Mistake {
  original: string
  corrected: string
  explanation: string
}

interface CorrectionResult {
  corrected: string
  mistakes: Mistake[]
  suggestions: string[]
  transcript?: string // for audio
}

// ─── Simulated AI Engine ──────────────────────────────────────────────────────
// Replace simulateCorrection() with a real OpenAI/Claude API call when ready.

async function simulateCorrection(text: string): Promise<CorrectionResult> {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 1800))

  const lower = text.trim().toLowerCase()

  // Example correction patterns
  if (lower.includes('i go yesterday') || lower.includes('go yesterday')) {
    return {
      corrected: 'I went to school yesterday.',
      mistakes: [
        {
          original: 'go',
          corrected: 'went',
          explanation: 'استخدم الماضي (went) للأفعال التي حدثت في الماضي. الفعل "go" هو المضارع.',
        },
        {
          original: 'I go yesterday to school',
          corrected: 'I went to school yesterday',
          explanation: 'ترتيب الجملة: الفاعل + الفعل + المكان + الزمن.',
        },
      ],
      suggestions: [
        'Try to always place time expressions like "yesterday" at the end of the sentence.',
        'Practice irregular verbs: go → went, see → saw, eat → ate.',
      ],
    }
  }

  if (lower.includes('she don\'t') || lower.includes('he don\'t')) {
    return {
      corrected: text.replace(/she don't/gi, "she doesn't").replace(/he don't/gi, "he doesn't"),
      mistakes: [
        {
          original: "don't",
          corrected: "doesn't",
          explanation: 'مع الضمائر he / she / it نستخدم "doesn\'t" وليس "don\'t".',
        },
      ],
      suggestions: [
        'Remember: I/You/We/They → don\'t | He/She/It → doesn\'t',
      ],
    }
  }

  if (lower.includes('more better') || lower.includes('more faster') || lower.includes('more bigger')) {
    return {
      corrected: text
        .replace(/more better/gi, 'better')
        .replace(/more faster/gi, 'faster')
        .replace(/more bigger/gi, 'bigger'),
      mistakes: [
        {
          original: 'more better / more faster',
          corrected: 'better / faster',
          explanation: 'لا تضف "more" مع الصفات القصيرة التي تنتهي بـ -er. استخدم إما "more" أو "-er" وليس كليهما.',
        },
      ],
      suggestions: [
        'Short adjectives (1–2 syllables): add -er → faster, bigger, better.',
        'Long adjectives (3+ syllables): use more → more beautiful, more intelligent.',
      ],
    }
  }

  // Generic improvement for any input
  const words = text.trim().split(/\s+/)
  const capitalized = words[0][0].toUpperCase() + words[0].slice(1)
  const correctedText =
    capitalized + ' ' + words.slice(1).join(' ') + (text.endsWith('.') ? '' : '.')

  return {
    corrected: correctedText,
    mistakes:
      text === correctedText
        ? []
        : [
            {
              original: words[0],
              corrected: capitalized,
              explanation: 'دائماً ابدأ الجملة بحرف كبير (Capital Letter).',
            },
          ],
    suggestions: [
      'Your sentence structure looks good! Keep practicing.',
      'Try to vary your vocabulary — use synonyms to sound more natural.',
      'Read English daily to absorb natural sentence patterns.',
    ],
  }
}

// ─── WhatsApp URL ─────────────────────────────────────────────────────────────

const waUrl = (msg: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CorrectorPage() {
  const [activeTab, setActiveTab] = useState<'writing' | 'speaking'>('writing')

  // ── Text tab state
  const [inputText, setInputText] = useState('')
  const [textResult, setTextResult] = useState<CorrectionResult | null>(null)
  const [textLoading, setTextLoading] = useState(false)
  const [textError, setTextError] = useState('')

  // ── Audio tab state
  const [isRecording, setIsRecording] = useState(false)
  const [audioResult, setAudioResult] = useState<CorrectionResult | null>(null)
  const [audioLoading, setAudioLoading] = useState(false)
  const [audioError, setAudioError] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // ── Handle text correction
  // → Replace simulateCorrection() body with a real API call when ready.
  const handleTextCorrection = async () => {
    if (!inputText.trim()) {
      setTextError('الرجاء كتابة جملة أولاً.')
      return
    }
    setTextError('')
    setTextLoading(true)
    setTextResult(null)
    try {
      const result = await simulateCorrection(inputText)
      setTextResult(result)
    } catch {
      setTextError('حدث خطأ. حاول مجدداً.')
    } finally {
      setTextLoading(false)
    }
  }

  // ── Handle recording
  const startRecording = async () => {
    setAudioError('')
    setAudioResult(null)
    setAudioBlob(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(t => t.stop())
        handleAudioCorrection(blob)
      }
      mediaRecorderRef.current = mr
      mr.start()
      setIsRecording(true)
    } catch {
      setAudioError('لم يتم السماح بالوصول إلى المايكروفون. تحقق من إعدادات المتصفح.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  // Speech-to-text + correction.
  // TODO: replace the simulated transcript with a real Whisper API call:
  //   const { text } = await openai.audio.transcriptions.create({ file: blob, model: 'whisper-1' })
  //   then pass `text` into simulateCorrection() (or a real correction API).
  // Show "لم أتمكن من فهم الصوت" only when the API returns an empty/null transcript.
  const handleAudioCorrection = async (_blob: Blob) => {
    setAudioLoading(true)
    try {
      await new Promise(r => setTimeout(r, 2200))

      // Simulated transcript — replace with real STT result when API is connected.
      const simulatedTranscript = 'I go yesterday to school'

      if (!simulatedTranscript.trim()) {
        setAudioError('لم أتمكن من فهم الصوت جيداً')
        return
      }

      const result = await simulateCorrection(simulatedTranscript)
      result.transcript = simulatedTranscript
      setAudioResult(result)
    } catch {
      setAudioError('لم أتمكن من فهم الصوت جيداً')
    } finally {
      setAudioLoading(false)
    }
  }

  const resetText = () => {
    setInputText('')
    setTextResult(null)
    setTextError('')
  }

  const resetAudio = () => {
    setAudioResult(null)
    setAudioError('')
    setAudioBlob(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" dir="rtl">
      {/* ── Hero Header ──────────────────────────────────────────────────────── */}
      <div className="pt-24 pb-12 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 mb-6 text-sm text-blue-100 backdrop-blur-sm">
          <Sparkles size={15} className="text-amber-400" />
          مجاني 100% — Completely Free
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
          مصحح الإنجليزية{' '}
          <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            الذكي
          </span>
        </h1>
        <p className="text-blue-100 text-lg max-w-xl mx-auto mb-3">
          اكتب جملة أو تكلم بالإنجليزية واحصل على تصحيح فوري مثل معلم خاص
        </p>
        <p className="text-amber-300 text-sm font-medium">
          🚀 Practice daily to improve faster
        </p>
      </div>

      {/* ── Main Card ────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 pb-24">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* ── Tabs ─────────────────────────────────────────────────────────── */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('writing')}
              className={`flex-1 flex items-center justify-center gap-2 py-5 text-base font-bold transition-all duration-200 ${
                activeTab === 'writing'
                  ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <PenLine size={18} />
              ✍️ الكتابة
            </button>
            <button
              onClick={() => setActiveTab('speaking')}
              className={`flex-1 flex items-center justify-center gap-2 py-5 text-base font-bold transition-all duration-200 ${
                activeTab === 'speaking'
                  ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Mic size={18} />
              🎤 الكلام
            </button>
          </div>

          {/* ── Tab Content ──────────────────────────────────────────────────── */}
          <div className="p-6 md:p-8">

            {/* ══════════════ WRITING TAB ══════════════ */}
            {activeTab === 'writing' && (
              <div className="space-y-5">
                {/* Free tool notice */}
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-sm text-green-700 font-medium">
                  <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                  This tool is completely FREE. Practice as much as you want 🚀
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    اكتب جملة أو فقرة بالإنجليزية
                  </label>
                  <textarea
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="Example: I go yesterday to school..."
                    rows={5}
                    dir="ltr"
                    className="w-full rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none px-4 py-3 text-gray-800 text-base resize-none transition-colors placeholder:text-gray-300"
                  />
                  {textError && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} /> {textError}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleTextCorrection}
                    disabled={textLoading || !inputText.trim()}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 active:scale-95"
                  >
                    {textLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        جارٍ التصحيح...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        صحح إنجليزيتي
                      </>
                    )}
                  </button>
                  {textResult && (
                    <button
                      onClick={resetText}
                      title="إعادة"
                      className="p-3.5 rounded-2xl border-2 border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700 transition-all"
                    >
                      <RotateCcw size={18} />
                    </button>
                  )}
                </div>

                {/* Result */}
                {textResult && (
                  <>
                    <CorrectionCard result={textResult} />
                    <p className="text-center text-gray-400 text-xs pt-1">
                      💪 Consistency beats perfection. Keep going.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* ══════════════ SPEAKING TAB ══════════════ */}
            {activeTab === 'speaking' && (
              <div className="space-y-5">
                <p className="text-sm text-gray-500 text-center">
                  اضغط الزر وتحدث بالإنجليزية — سيتم تحليل كلامك وتصحيحه فوراً
                </p>

                {/* Record button */}
                <div className="flex flex-col items-center gap-4 py-4">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={audioLoading}
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl active:scale-95 disabled:opacity-50 ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600 shadow-red-400/50'
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/40'
                    }`}
                  >
                    {isRecording && (
                      <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" />
                    )}
                    {audioLoading ? (
                      <Loader2 size={32} className="text-white animate-spin" />
                    ) : isRecording ? (
                      <MicOff size={32} className="text-white" />
                    ) : (
                      <Mic size={32} className="text-white" />
                    )}
                  </button>

                  <p className="text-sm font-semibold text-gray-600">
                    {audioLoading
                      ? 'جارٍ تحليل الصوت...'
                      : isRecording
                      ? '🔴 جارٍ التسجيل — اضغط للإيقاف'
                      : audioBlob
                      ? 'تم التسجيل'
                      : 'اضغط للتسجيل'}
                  </p>
                </div>

                {/* Unclear audio error */}
                {audioError && (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 text-center space-y-3">
                    <p className="text-orange-700 font-bold text-lg">
                      لم أستطع فهم الصوت جيداً
                    </p>
                    <p className="text-orange-600 text-sm">
                      تأكد من التحدث بوضوح وقرب المايكروفون
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={resetAudio}
                        className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-5 rounded-xl transition-all text-sm"
                      >
                        <RotateCcw size={15} />
                        حاول مجدداً
                      </button>
                      <a
                        href={waUrl('مرحبا، أحتاج مساعدة في تصحيح إنجليزيتي')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#1ebe5d] text-white font-bold py-2.5 px-5 rounded-xl transition-all text-sm"
                      >
                        <MessageCircle size={15} />
                        تواصل مع المعلم
                      </a>
                    </div>
                  </div>
                )}

                {/* Audio result */}
                {audioResult && (
                  <div className="space-y-4">
                    {audioResult.transcript && (
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 flex items-start gap-2">
                        <Volume2 size={16} className="text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">ما فهمته من كلامك:</p>
                          <p className="text-gray-700 text-sm font-medium dir-ltr text-left" dir="ltr">
                            "{audioResult.transcript}"
                          </p>
                        </div>
                      </div>
                    )}
                    <CorrectionCard result={audioResult} />
                    <p className="text-center text-gray-400 text-xs">
                      💪 Consistency beats perfection. Keep going.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Tip Strip ────────────────────────────────────────────────────── */}
        <p className="text-center text-blue-200/70 text-sm mt-6">
          💡 كلما تدربت يومياً، كلما تحسنت بسرعة أكبر
        </p>
      </div>

      {/* ── Fixed WhatsApp Button ─────────────────────────────────────────────── */}
      <a
        href={waUrl('Hello, I need help correcting my English')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact teacher on WhatsApp"
        className="whatsapp-btn flex items-center justify-center group"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="absolute bottom-full mb-3 right-0 bg-gray-900 text-white text-xs rounded-xl px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          تواصل مع المعلم 💬
        </span>
      </a>
    </div>
  )
}

// ─── Correction Result Card ───────────────────────────────────────────────────

function CorrectionCard({ result }: { result: CorrectionResult }) {
  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden">

      {/* ── Corrected Sentence ── */}
      <div className="p-5 border-b border-gray-100 bg-green-50">
        <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-1">
          <CheckCircle2 size={13} /> الجملة الصحيحة
        </p>
        <p className="text-green-800 font-bold text-lg" dir="ltr">
          ✅ {result.corrected}
        </p>
      </div>

      {/* ── Mistakes ── */}
      {result.mistakes.length > 0 && (
        <div className="p-5 border-b border-gray-100">
          <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-1">
            <XCircle size={13} /> الأخطاء وشرحها
          </p>
          <div className="space-y-3">
            {result.mistakes.map((m, i) => (
              <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-2 mb-2 text-sm" dir="ltr">
                  <span className="bg-red-100 text-red-700 line-through px-2 py-0.5 rounded-lg font-mono">
                    {m.original}
                  </span>
                  <ArrowRight size={14} className="text-gray-400" />
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-lg font-mono font-bold">
                    {m.corrected}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{m.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Suggestions ── */}
      {result.suggestions.length > 0 && (
        <div className="p-5">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-1">
            <Lightbulb size={13} /> اقتراحات للتحسين
          </p>
          <ul className="space-y-2">
            {result.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span dir="ltr" className="text-left leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.mistakes.length === 0 && (
        <div className="p-5 flex items-center gap-3 text-green-700 bg-green-50 border-b border-gray-100">
          <CheckCircle2 size={20} className="text-green-500 shrink-0" />
          <p className="text-sm font-semibold">
            لم أجد أخطاء واضحة — جملتك جيدة! 🎉
          </p>
        </div>
      )}

      {/* ── WhatsApp CTA ── */}
      <div className="p-4 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-500">
          هل تريد مساعدة أعمق من المعلم؟
        </p>
        <a
          href={`https://wa.me/212707902091?text=${encodeURIComponent('Hello, I need help correcting my English')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#25d366] hover:bg-[#1ebe5d] text-white font-bold py-2 px-4 rounded-xl transition-all text-sm shrink-0"
        >
          <MessageCircle size={15} />
          Need deeper help? Contact your teacher
        </a>
      </div>
    </div>
  )
}
