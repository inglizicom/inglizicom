'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  X, User, Send, CheckCircle, Clock,
  Crown, AlertCircle, Loader2, Flame, Target, MessageCircle,
} from 'lucide-react'
import type { Plan } from '@/data/plans'
import { MONTHLY_SEAT_LIMIT, PLANS, PAYMENT_WHATSAPP } from '@/data/plans'
import {
  createSubscriptionLead,
  countLeadsThisMonth,
  fetchLatestLeadAt,
  getAttribution,
} from '@/lib/leads-db'
import { readLeadSource, clearLeadSource } from '@/lib/lead-source'

interface Props {
  open:    boolean
  onClose: () => void
  /** Plan card that was clicked. Omit for a general inquiry from the sticky CTA. */
  plan?:   Plan
  /** Override for the source tag. Falls back to sessionStorage value. */
  source?: string
  /** Pre-fill the level select — used by test-result page. */
  defaultLevel?: string
  /** Pre-fill the goal select — used by test-result page. */
  defaultGoal?: string
  /** Extra signal saved with the lead — e.g. test score / recommended plan. */
  testScore?: number
  recommendedPlan?: string
}

const LEVEL_OPTIONS = [
  { value: '',           label: 'لا أعرف — غيحدّد ليا الأستاذ' },
  { value: 'A0',         label: 'A0 — مبتدئ كامل، ما كنعرف والو' },
  { value: 'A1-A2',      label: 'A1-A2 — عندي أساس بسيط' },
  { value: 'B1-B2',      label: 'B1-B2 — كنفهم وكنتلعتم' },
  { value: 'C1+',        label: 'C1+ — متقدم، باغي الاحتراف' },
]

const GOAL_OPTIONS = [
  { value: '',               label: 'اختر هدفك' },
  { value: 'daily',          label: '🗣️ محادثة يومية' },
  { value: 'work',           label: '💼 خدمة / مقابلات' },
  { value: 'travel',         label: '✈️ السفر' },
  { value: 'exam',           label: '🎓 IELTS / TOEFL' },
  { value: 'other',          label: '🎯 هدف آخر' },
]

const PLAN_INTEREST_OPTIONS: { value: string; label: string }[] = [
  { value: '',        label: 'خليني نختار معاك' },
  ...PLANS.map(p => ({ value: p.id, label: p.title_ar })),
]

export default function SubscribeModal({
  open, onClose, plan, source, defaultLevel, defaultGoal, testScore, recommendedPlan,
}: Props) {
  const [name,         setName]         = useState('')
  const [level,        setLevel]        = useState(defaultLevel ?? '')
  const [goal,         setGoal]         = useState(defaultGoal  ?? '')
  const [planInterest, setPlanInterest] = useState(plan?.id ?? recommendedPlan ?? '')

  const [submitting, setSubmitting] = useState(false)
  const [done,       setDone]       = useState(false)
  const [err,        setErr]        = useState<string | null>(null)

  const [seatsTaken,    setSeatsTaken]    = useState<number | null>(null)
  const [lastSignupAgo, setLastSignupAgo] = useState<string | null>(null)

  /* Lock scroll + escape */
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

  /* Reset whenever we reopen or the contextual plan changes */
  useEffect(() => {
    if (!open) return
    setDone(false); setErr(null); setName('')
    setLevel(defaultLevel ?? '')
    setGoal(defaultGoal  ?? '')
    setPlanInterest(plan?.id ?? recommendedPlan ?? '')
  }, [open, plan?.id, recommendedPlan, defaultLevel, defaultGoal])

  /* Load scarcity data on open */
  useEffect(() => {
    if (!open) return
    let cancelled = false
    ;(async () => {
      const [count, latest] = await Promise.all([
        countLeadsThisMonth(),
        fetchLatestLeadAt(),
      ])
      if (cancelled) return
      setSeatsTaken(count)
      setLastSignupAgo(latest ? timeAgo(latest) : null)
    })()
    return () => { cancelled = true }
  }, [open])

  const countdown = useCountdownToMonthEnd(open)

  const canSubmit = name.trim().length >= 2 && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setErr(null); setSubmitting(true)

    const effectiveSource   = source ?? readLeadSource() ?? 'subscribe_modal'
    const interestPlanId    = planInterest || plan?.id || recommendedPlan || null
    const interestPlan      = interestPlanId ? PLANS.find(p => p.id === interestPlanId) : undefined
    const attribution       = getAttribution()

    try {
      await createSubscriptionLead({
        planId:          interestPlanId ?? 'inquiry',
        fullName:        name.trim(),
        level:           level || null,
        goal:            goal  || null,
        planInterest:    interestPlanId,
        amountMad:       interestPlan?.amount_mad ?? null,
        source:          effectiveSource,
        testScore:       testScore ?? null,
        recommendedPlan: recommendedPlan ?? null,
        ...attribution,
      })

      /* Hand the conversation off to WhatsApp with a prefilled message. */
      const waText =
        `السلام عليكم أستاذ حمزة 👋\n` +
        `الاسم: ${name.trim()}\n` +
        (level ? `المستوى: ${level}\n` : '') +
        (goal  ? `الهدف: ${humanGoal(goal)}\n` : '') +
        (interestPlan ? `الباقة اللي تهمّني: ${interestPlan.title_ar} (${interestPlan.amount_mad} درهم)\n` : '') +
        (testScore !== undefined ? `نتيجة الاختبار: ${testScore}/10\n` : '') +
        (recommendedPlan && !interestPlanId ? `الباقة المقترحة: ${recommendedPlan}\n` : '') +
        `\nباغي نبدا الاشتراك.`

      const waUrl = `https://wa.me/${PAYMENT_WHATSAPP.replace(/\D/g, '')}?text=${encodeURIComponent(waText)}`

      clearLeadSource()
      window.open(waUrl, '_blank', 'noopener,noreferrer')
      setDone(true)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'حدث خطأ، حاول مرة أخرى')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  const heading = plan
    ? plan.title_ar
    : recommendedPlan
    ? `الباقة المقترحة: ${PLANS.find(p => p.id === recommendedPlan)?.title_ar ?? recommendedPlan}`
    : 'سجّل الآن'

  const seatsLeft = seatsTaken !== null
    ? Math.max(0, MONTHLY_SEAT_LIMIT - seatsTaken)
    : null

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      dir="rtl"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-l from-brand-600 to-brand-500 px-5 py-4 text-white flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-[11px] font-black mb-1">
              <Crown className="w-3 h-3" />
              جاوبك فواتساب شخصياً
            </div>
            <h3 className="font-black text-lg leading-tight truncate">{heading}</h3>
            {plan && (
              <div className="text-sm font-bold opacity-90 mt-0.5">
                {plan.amount_mad.toLocaleString()} درهم
                {plan.originalAmount && plan.originalAmount > plan.amount_mad && (
                  <span className="opacity-75 line-through mr-2 text-xs">
                    {plan.originalAmount.toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white shrink-0 p-1 -m-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <ThanksScreen onClose={onClose} />
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">

            {/* Scarcity strip */}
            {seatsLeft !== null && seatsLeft > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
                <Flame className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="flex-1">
                  <span className="text-amber-900 font-black">باقي {seatsLeft} مقعد هاد الشهر</span>
                  {lastSignupAgo && (
                    <span className="text-amber-700 font-semibold mr-2">· آخر اشتراك {lastSignupAgo}</span>
                  )}
                </div>
                <span className="text-amber-700 font-black tabular-nums">{countdown}</span>
              </div>
            )}

            <Field icon={User} label="الاسم الكامل" required>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="مثلاً: كريم العلمي"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </Field>

            <Field icon={Target} label="مستواك التقديري">
              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                {LEVEL_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>

            <Field icon={Crown} label="هدفك من تعلّم الإنجليزية">
              <select
                value={goal}
                onChange={e => setGoal(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                {GOAL_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>

            <Field icon={Crown} label="الباقة اللي تهمّك">
              <select
                value={planInterest}
                onChange={e => setPlanInterest(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                {PLAN_INTEREST_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>

            {err && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {err}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#20c05c] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4" />
              )}
              أرسل لي على واتساب
            </button>

            <p className="text-[11px] text-gray-500 text-center font-semibold leading-relaxed">
              بالضغط على الزر، كنحفظو بياناتك وكنفتحو ليك واتساب. <br />
              كنجاوبك شخصياً فأقل من ساعة.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

function ThanksScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-emerald-600" />
      </div>
      <h3 className="text-xl font-black text-gray-900 mb-2">✓ راه واتساب تفتح</h3>
      <p className="text-sm text-gray-600 mb-5 leading-relaxed">
        إذا ما فتحاتش تلقائياً، تواصل معانا مباشرة:
        <br />
        <span className="font-black text-gray-900 text-base">{PAYMENT_WHATSAPP}</span>
      </p>
      <a
        href={`https://wa.me/${PAYMENT_WHATSAPP.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#20c05c] text-white font-black text-sm px-6 py-3 rounded-xl transition-colors mb-2"
      >
        <MessageCircle className="w-4 h-4" />
        فتح واتساب
      </a>
      <div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 font-bold text-xs px-3 py-2 mt-2"
        >
          سكّر
        </button>
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

/* -------------------- helpers -------------------- */

function humanGoal(g: string): string {
  return GOAL_OPTIONS.find(o => o.value === g)?.label.replace(/^[^\s]+\s/, '') ?? g
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins   = Math.max(1, Math.floor(diffMs / 60_000))
  if (mins < 60)   return `منذ ${mins} دقيقة`
  const hours    = Math.floor(mins / 60)
  if (hours < 24)  return `منذ ${hours} ساعة`
  const days     = Math.floor(hours / 24)
  return `منذ ${days} يوم`
}

function useCountdownToMonthEnd(active: boolean): string {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [active])

  return useMemo(() => {
    const d = new Date(now)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0)
    const diff = Math.max(0, end.getTime() - now)
    const days = Math.floor(diff / 86_400_000)
    const h    = Math.floor((diff % 86_400_000) / 3_600_000)
    const m    = Math.floor((diff % 3_600_000) / 60_000)
    const s    = Math.floor((diff % 60_000) / 1000)
    if (days > 0) return `${days}ي ${h}س ${m}د`
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }, [now])
}
