'use client'

import { useEffect, useState } from 'react'
import { X, User, Phone, GraduationCap, MessageSquare, Send, CheckCircle } from 'lucide-react'
import { PAYMENT_WHATSAPP } from '@/data/plans'

interface Props {
  open:         boolean
  onClose:      () => void
  courseTitle:  string
  coursePrice?: string
}

const LEVELS = [
  { value: 'A0', label: 'A0 — مبتدئ تماماً' },
  { value: 'A1', label: 'A1 — أساسيات' },
  { value: 'A2', label: 'A2 — محادثة يومية' },
  { value: 'B1', label: 'B1 — متوسط' },
  { value: 'B2', label: 'B2 — متقدم' },
  { value: '?',  label: 'لست متأكداً' },
]

export default function SubscribeModal({ open, onClose, courseTitle, coursePrice }: Props) {
  const [name,  setName]  = useState('')
  const [phone, setPhone] = useState('')
  const [level, setLevel] = useState('')
  const [note,  setNote]  = useState('')

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const canSubmit = name.trim().length >= 2 && phone.trim().length >= 8 && level.length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    const lines = [
      '🎓 *طلب اشتراك جديد*',
      '━━━━━━━━━━━━━━',
      `📚 الكورس: ${courseTitle}`,
      coursePrice ? `💰 السعر: ${coursePrice}` : null,
      `👤 الاسم: ${name.trim()}`,
      `📞 الهاتف: ${phone.trim()}`,
      `📊 المستوى: ${level}`,
      note.trim() ? `📝 ملاحظة: ${note.trim()}` : null,
    ].filter(Boolean).join('\n')

    const url = `https://wa.me/${PAYMENT_WHATSAPP.replace(/\D/g, '')}?text=${encodeURIComponent(lines)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    onClose()
    setName(''); setPhone(''); setLevel(''); setNote('')
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      dir="rtl"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        <div className="bg-gradient-to-l from-green-500 to-emerald-600 px-5 py-4 text-white flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-bold opacity-90 mb-0.5">طلب اشتراك</div>
            <h3 className="font-black text-lg leading-tight truncate">{courseTitle}</h3>
            {coursePrice && (
              <div className="text-sm font-bold opacity-95 mt-1">{coursePrice}</div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center shrink-0 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <Field icon={User} label="الاسم الكامل" required>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="محمد العلمي"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-green-500 focus:bg-white transition-colors"
            />
          </Field>

          <Field icon={Phone} label="رقم الهاتف (واتساب)" required>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+212 6 12 34 56 78"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-green-500 focus:bg-white transition-colors"
              dir="ltr"
            />
          </Field>

          <Field icon={GraduationCap} label="مستواك الحالي" required>
            <select
              value={level}
              onChange={e => setLevel(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-green-500 focus:bg-white transition-colors appearance-none"
            >
              <option value="" disabled>اختر مستواك</option>
              {LEVELS.map(l => (
                <option key={l.value} value={l.label}>{l.label}</option>
              ))}
            </select>
          </Field>

          <Field icon={MessageSquare} label="ملاحظة (اختياري)">
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              placeholder="أي تفاصيل تريد مشاركتها…"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-green-500 focus:bg-white transition-colors resize-none"
            />
          </Field>

          <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-xs text-green-800 font-semibold leading-relaxed">
              بعد الإرسال، سنتواصل معك عبر واتساب خلال وقت قصير لتأكيد الاشتراك
            </p>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#20c05c] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-2xl shadow-lg shadow-green-500/20 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            إرسال عبر واتساب
          </button>

          <p className="text-center text-[11px] text-gray-400 font-semibold">
            بالضغط على "إرسال"، ستنفتح محادثة واتساب جاهزة بمعلوماتك
          </p>
        </form>
      </div>
    </div>
  )
}

function Field({
  icon: Icon, label, required, children,
}: {
  icon:      typeof User
  label:     string
  required?: boolean
  children:  React.ReactNode
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-xs font-black text-gray-700 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  )
}
