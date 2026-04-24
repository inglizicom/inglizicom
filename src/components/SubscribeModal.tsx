'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  X, User, Phone, MapPin, Send, CheckCircle, Clock,
  Crown, AlertCircle, Loader2, Flame,
} from 'lucide-react'
import type { Plan } from '@/data/plans'
import { MONTHLY_SEAT_LIMIT } from '@/data/plans'
import {
  createSubscriptionLead,
  countLeadsThisMonth,
  fetchLatestLeadAt,
} from '@/lib/leads-db'

interface Props {
  open:    boolean
  onClose: () => void
  plan:    Plan
}

export default function SubscribeModal({ open, onClose, plan }: Props) {
  const [name,  setName]  = useState('')
  const [phone, setPhone] = useState('')
  const [city,  setCity]  = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [done,       setDone]       = useState(false)
  const [err,        setErr]        = useState<string | null>(null)

  const [seatsTaken,      setSeatsTaken]      = useState<number | null>(null)
  const [lastSignupAgo,   setLastSignupAgo]   = useState<string | null>(null)

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

  /* Reset the form whenever we reopen or switch plans */
  useEffect(() => {
    if (open) {
      setDone(false); setErr(null)
      setName(''); setPhone(''); setCity('')
    }
  }, [open, plan.id])

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

  const canSubmit =
    name.trim().length >= 2
    && phone.trim().length >= 8
    && city.trim().length >= 2
    && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setErr(null); setSubmitting(true)
    try {
      await createSubscriptionLead({
        planId:    plan.id,
        level:     plan.levelFrom && plan.levelTo
                     ? `${plan.levelFrom} → ${plan.levelTo}`
                     : null,
        fullName:  name.trim(),
        phone:     phone.trim(),
        city:      city.trim(),
        amountMad: plan.isHourly ? null : plan.amount_mad,
      })
      setDone(true)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'حدث خطأ، حاول مرة أخرى')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  const levelBadge = plan.levelFrom && plan.levelTo
    ? `${plan.levelFrom} → ${plan.levelTo}`
    : plan.isBusiness ? 'Business 1:1' : ''

  const priceLabel = plan.isHourly
    ? `${plan.amount_mad} درهم / الساعة`
    : `${plan.amount_mad} درهم`

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
        {/* Header with plan recap */}
        <div className="bg-gradient-to-l from-brand-600 to-brand-500 px-5 py-4 text-white flex items-start justify-between gap-3">
          <div className="min-w-0">
            {levelBadge && (
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-[11px] font-black mb-1">
                <Crown className="w-3 h-3" />
                {levelBadge}
              </div>
            )}
            <h3 className="font-black text-lg leading-tight truncate">{plan.title_ar}</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-base font-black">{priceLabel}</span>
              {plan.isHourly && plan.minHoursPerMonth && (
                <span className="text-xs font-bold opacity-90">
                  · حد أدنى {plan.minHoursPerMonth} حصص شهرياً
                </span>
              )}
            </div>
            <div className="text-xs font-semibold opacity-90 mt-0.5">
              {plan.followUpLabel_ar} · {plan.followUpDuration_ar}
            </div>
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

        {done ? (
          <SuccessPanel onClose={onClose} />
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            {/* Scarcity strip */}
            <div className="px-5 pt-4 space-y-2">
              {lastSignupAgo && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <p className="text-[12px] font-bold text-emerald-800">
                    شخص اشترك {lastSignupAgo} فقط
                  </p>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                <div className="flex items-center justify-between text-[12px] font-black mb-1.5">
                  <span className="flex items-center gap-1.5 text-amber-900">
                    <Flame className="w-3.5 h-3.5" />
                    {seatsLeft !== null
                      ? `تبقى ${seatsLeft} مقعد من أصل ${MONTHLY_SEAT_LIMIT}`
                      : `${MONTHLY_SEAT_LIMIT} مقعد فقط هذا الشهر`}
                  </span>
                  <span className="inline-flex items-center gap-1 text-amber-700 tabular-nums">
                    <Clock className="w-3 h-3" />
                    {countdown}
                  </span>
                </div>
                <div className="h-1.5 bg-amber-200/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        100,
                        ((seatsTaken ?? 0) / MONTHLY_SEAT_LIMIT) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="p-5 space-y-3">
              <Field icon={User} label="الاسم الكامل" required>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="محمد العلمي"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                />
              </Field>

              <Field icon={Phone} label="رقم الهاتف (واتساب)" required>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+212 6 12 34 56 78"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                  dir="ltr"
                />
              </Field>

              <Field icon={MapPin} label="المدينة / البلد" required>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="الدار البيضاء، المغرب"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                />
              </Field>

              {err && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-800 font-bold">{err}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-2xl shadow-lg shadow-brand-500/20 transition-all active:scale-95"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> جاري الإرسال…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> اشترك الآن
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-gray-400 font-semibold">
                نتواصل معك خلال أقل من 24 ساعة لتأكيد الاشتراك والدفع
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

/* -------------------- sub components -------------------- */

function SuccessPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-emerald-600" />
      </div>
      <h4 className="text-xl font-black text-gray-900 mb-2">تم استلام طلبك 🎉</h4>
      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        الأستاذ سيتواصل معك خلال أقل من 24 ساعة عبر الهاتف أو واتساب
        لتأكيد الاشتراك وإرسال تفاصيل الدفع.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors"
      >
        حسناً
      </button>
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

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins   = Math.max(1, Math.floor(diffMs / 60_000))
  if (mins < 60)   return `منذ ${mins} دقيقة`
  const hours    = Math.floor(mins / 60)
  if (hours < 24)  return `منذ ${hours} ساعة`
  const days     = Math.floor(hours / 24)
  return `منذ ${days} يوم`
}

/** Live countdown to the end of the current month, refreshed every second. */
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
