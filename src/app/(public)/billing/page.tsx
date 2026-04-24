'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Crown, Loader2, Lock, Check, Clock, XCircle, Upload, ArrowRight,
  Copy, MessageCircle, Calendar, Sparkles,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import {
  createPaymentWithReceipt,
  fetchMyPayments,
  type Payment,
} from '@/lib/payments-db'
import { PLANS, BANK_DETAILS, PAYMENT_WHATSAPP, getPlan, type Plan } from '@/data/plans'

interface ProfileSummary {
  plan:            'free' | 'paid'
  plan_expires_at: string | null
}

export default function BillingPage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile]   = useState<ProfileSummary | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<Plan | null>(null)

  useEffect(() => {
    if (authLoading || !user) { if (!authLoading) setLoading(false); return }
    (async () => {
      const [pRes, paysRes] = await Promise.all([
        supabase.from('profiles').select('plan, plan_expires_at').eq('id', user.id).maybeSingle(),
        fetchMyPayments(),
      ])
      setProfile(pRes.data as ProfileSummary | null)
      setPayments(paysRes)
      setLoading(false)
    })()
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-950 pt-[60px]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-950 pt-[120px] pb-16 px-4" dir="rtl">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-5 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-3">سجّل الدخول للاشتراك</h1>
          <Link
            href="/login?next=/billing"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-black text-sm px-6 py-3 rounded-xl transition-colors"
          >
            تسجيل الدخول
          </Link>
        </div>
      </main>
    )
  }

  const isPaid = profile?.plan === 'paid'
    && profile.plan_expires_at
    && new Date(profile.plan_expires_at) > new Date()

  return (
    <main className="min-h-screen bg-gray-950 pt-[80px] pb-16 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">

        {/* Current plan card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">
                الاشتراك الحالي
              </div>
              <div className="flex items-center gap-2">
                {isPaid ? (
                  <>
                    <Crown className="w-5 h-5 text-amber-400" />
                    <span className="text-white font-black text-lg">مشترك</span>
                  </>
                ) : (
                  <span className="text-gray-300 font-bold text-lg">مجاني</span>
                )}
              </div>
              {profile?.plan_expires_at && (
                <div className="text-gray-400 text-xs mt-2 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {isPaid ? 'تنتهي في' : 'انتهى في'}{' '}
                  {new Date(profile.plan_expires_at).toLocaleDateString('ar', { dateStyle: 'medium' })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plans */}
        {!selected && (
          <>
            <div className="mb-5">
              <h1 className="text-white font-black text-2xl leading-snug">
                <Sparkles className="inline w-6 h-6 text-amber-400 ml-1" />
                افتح كل الكورسات والمميزات
              </h1>
              <p className="text-gray-400 text-sm mt-1">اختر مدة الاشتراك المناسبة لك</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {PLANS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={`text-right bg-gray-900 border-2 rounded-2xl p-5 transition-all hover:scale-[1.02] ${
                    p.highlight
                      ? 'border-brand-500 ring-2 ring-brand-500/20'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {p.highlight && (
                    <div className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-500 text-white uppercase tracking-wider mb-3">
                      الأكثر طلباً
                    </div>
                  )}
                  <h3 className="text-white font-black text-lg mb-1">{p.title_ar}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-white font-black text-3xl">{p.amount_mad}</span>
                    <span className="text-gray-400 text-sm font-bold">درهم</span>
                  </div>
                  {p.originalAmount && p.originalAmount > p.amount_mad && (
                    <div className="text-emerald-400 text-xs font-bold">
                      وفّر {p.originalAmount - p.amount_mad} درهم
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="inline-flex items-center gap-1.5 text-brand-400 text-sm font-bold">
                      اشترك الآن <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {selected && (
          <CheckoutFlow
            plan={selected}
            userId={user.id}
            onCancel={() => setSelected(null)}
            onSuccess={async () => {
              const fresh = await fetchMyPayments()
              setPayments(fresh)
              setSelected(null)
            }}
          />
        )}

        {/* Payment history */}
        {payments.length > 0 && !selected && (
          <div>
            <h2 className="text-white font-black text-lg mb-3">سجل المدفوعات</h2>
            <div className="space-y-2">
              {payments.map(p => <PaymentRow key={p.id} payment={p} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function CheckoutFlow({
  plan, userId, onCancel, onSuccess,
}: {
  plan:      Plan
  userId:    string
  onCancel:  () => void
  onSuccess: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setErr(null)
    setSubmitting(true)
    try {
      await createPaymentWithReceipt({
        userId,
        planId:         plan.id,
        amount:         plan.amount_mad,
        currency:       'MAD',
        durationMonths: plan.duration_months,
        receipt:        file,
        note:           note.trim() || undefined,
      })
      onSuccess()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'failed')
    } finally {
      setSubmitting(false)
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {})
  }

  const waUrl = `https://wa.me/${PAYMENT_WHATSAPP.replace(/[^\d]/g, '')}?text=${
    encodeURIComponent(`مرحباً، أود الاشتراك في ${plan.title_ar} (${plan.amount_mad} درهم)`)
  }`

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <button
        type="button"
        onClick={onCancel}
        className="text-gray-400 hover:text-white text-sm font-semibold"
      >
        ← تغيير الخطة
      </button>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="text-white font-black text-lg mb-1">{plan.title_ar}</h2>
        <div className="flex items-baseline gap-1">
          <span className="text-white font-black text-2xl">{plan.amount_mad}</span>
          <span className="text-gray-400 text-sm font-bold">درهم</span>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-white font-bold text-base mb-3">1. حوّل المبلغ إلى الحساب البنكي</h3>
        <div className="space-y-2 text-sm">
          <BankRow label="البنك" value={BANK_DETAILS.bank_name} />
          <BankRow label="اسم الحساب" value={BANK_DETAILS.account_holder} />
          <BankRow label="RIB" value={BANK_DETAILS.rib} onCopy={() => copy(BANK_DETAILS.rib)} />
          <BankRow label="SWIFT" value={BANK_DETAILS.swift} onCopy={() => copy(BANK_DETAILS.swift)} />
          <BankRow label="المبلغ" value={`${plan.amount_mad} MAD`} onCopy={() => copy(String(plan.amount_mad))} />
        </div>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 bg-[#25d366]/10 hover:bg-[#25d366]/20 border border-[#25d366]/30 text-[#25d366] text-xs font-bold px-3 py-2 rounded-lg transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          مشكلة؟ تواصل معنا على واتساب
        </a>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-white font-bold text-base mb-3">2. ارفع وصل التحويل</h3>
        <label className="block">
          <input
            type="file"
            required
            accept="image/*,application/pdf"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
          <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            file ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-700 hover:border-gray-600'
          }`}>
            {file ? (
              <>
                <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">{file.name}</p>
                <p className="text-gray-500 text-xs mt-1">{(file.size / 1024).toFixed(0)} KB — اضغط للتغيير</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-300 font-semibold text-sm">اختر صورة الوصل أو ملف PDF</p>
                <p className="text-gray-500 text-xs mt-1">JPG, PNG, PDF — حتى 10MB</p>
              </>
            )}
          </div>
        </label>

        <label className="block mt-4">
          <div className="text-xs font-bold text-gray-400 mb-1.5">ملاحظة (اختياري)</div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            placeholder="أي تفاصيل إضافية تريد إخبارنا بها…"
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm font-semibold outline-none focus:border-brand-500 resize-none"
          />
        </label>
      </div>

      {err && <p className="text-red-400 text-sm font-bold text-center">{err}</p>}

      <button
        type="submit"
        disabled={!file || submitting}
        className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-base py-4 rounded-2xl transition-colors"
      >
        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
        {submitting ? 'جاري الإرسال…' : 'إرسال للمراجعة'}
      </button>
      <p className="text-center text-gray-500 text-xs">
        سنراجع الوصل ونفعّل اشتراكك خلال 24 ساعة كحد أقصى
      </p>
    </form>
  )
}

function BankRow({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-gray-800 last:border-0">
      <span className="text-gray-500 text-xs font-semibold">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-white text-sm font-bold font-mono truncate">{value}</span>
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="text-gray-400 hover:text-white transition-colors shrink-0"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

function PaymentRow({ payment }: { payment: Payment }) {
  const plan = getPlan(payment.plan_requested)
  const badge =
    payment.status === 'approved' ? { cls: 'bg-emerald-500/20 text-emerald-400', icon: Check,    label: 'مقبول' } :
    payment.status === 'declined' ? { cls: 'bg-red-500/20 text-red-400',          icon: XCircle, label: 'مرفوض' } :
                                    { cls: 'bg-amber-500/20 text-amber-400',      icon: Clock,   label: 'قيد المراجعة' }
  const Icon = badge.icon

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="min-w-0">
          <div className="text-white font-bold text-sm">
            {plan?.title_ar ?? payment.plan_requested}
          </div>
          <div className="text-gray-400 text-xs mt-0.5 font-semibold">
            {payment.amount} {payment.currency} ·{' '}
            {new Date(payment.created_at).toLocaleDateString('ar', { dateStyle: 'medium' })}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full ${badge.cls}`}>
          <Icon className="w-3 h-3" /> {badge.label}
        </span>
      </div>
      {payment.status === 'declined' && payment.decline_reason && (
        <p className="text-red-400 text-xs mt-2 font-semibold">سبب الرفض: {payment.decline_reason}</p>
      )}
    </div>
  )
}
