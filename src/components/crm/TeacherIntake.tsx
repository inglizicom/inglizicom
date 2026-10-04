'use client'

import { useCallback, useEffect, useState } from 'react'
import { Building2, Check, CheckCircle2, Copy, GraduationCap, Image as ImageIcon, Loader2, MessageCircle, UserPlus, X } from 'lucide-react'
import { ConfirmDialog } from '@/components/crm/kit'
import { useStaff } from '@/lib/staff-context'
import {
  fetchSides, fetchTeacherIntake, receiptUrl, reviewTeacherStudent, settleDeclaredPayment, PAY_METHOD_AR,
  type IntakeItem, type Side,
} from '@/lib/teacher-intake'

/**
 * The CRM home's view of students that teachers bring in (059):
 *   TeacherIntakePanel  new students waiting for review, and payments teachers
 *                       declared — approve (the student gets their access code),
 *                       reject, confirm or decline each payment.
 *   SidesPanel          one card per side — each teacher, and the academy —
 *                       students, active, waiting, money in the period and in
 *                       total, money waiting for confirmation. Exclusive: the
 *                       sides add up to total revenue.
 */

const CARD = 'bg-white border border-zinc-200 rounded-[22px] shadow-sm'
const mad = (n: number) => `${Math.round(n).toLocaleString('en-US')} د.م`
const waLink = (phone: string | null, text: string) => {
  const d = (phone ?? '').replace(/\D/g, '')
  if (d.length < 9) return null
  return `https://wa.me/${d.startsWith('0') ? '212' + d.slice(1) : d}?text=${encodeURIComponent(text)}`
}

export function TeacherIntakePanel({ onChanged }: { onChanged?: () => void }) {
  const me = useStaff()
  const [items, setItems] = useState<IntakeItem[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<IntakeItem | null>(null)
  const [approved, setApproved] = useState<{ item: IntakeItem; token: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    fetchTeacherIntake().then(setItems).catch(e => { setItems([]); if (!/Could not find/i.test(e.message)) setError(e.message) })
  }, [])
  useEffect(() => { load() }, [load])

  async function approve(item: IntakeItem) {
    setBusy(item.id); setError(null)
    try {
      const r = await reviewTeacherStudent(item.id, true)
      if (r.verification_token) setApproved({ item, token: r.verification_token })
      load(); onChanged?.()
    } catch (e: any) { setError(e.message) } finally { setBusy(null) }
  }
  async function settle(paymentId: string, confirm: boolean) {
    setBusy(paymentId); setError(null)
    try { await settleDeclaredPayment(paymentId, me.id, confirm); load(); onChanged?.() }
    catch (e: any) { setError(e.message) } finally { setBusy(null) }
  }
  async function openReceipt(path: string) {
    const url = await receiptUrl(path)
    if (url) window.open(url, '_blank', 'noopener')
  }

  if (!items || items.length === 0) return null
  const pendingStudents = items.filter(i => i.review_status === 'pending').length
  const pendingPayments = items.reduce((s, i) => s + i.payments.length, 0)

  return (
    <section className={`${CARD} p-4 sm:p-5`}>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center"><UserPlus size={18} /></span>
        <div className="flex-1 min-w-0">
          <h2 className="text-[16px] font-extrabold text-zinc-900">جديد من الأساتذة</h2>
          <p className="text-[12px] text-zinc-500">{pendingStudents} طالب بانتظار المراجعة · {pendingPayments} دفعة بانتظار التأكيد</p>
        </div>
      </div>
      {error && <div className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2 text-[12.5px] font-bold text-red-700">{error}</div>}
      <ul className="space-y-3">
        {items.map(i => (
          <li key={i.id} className="rounded-2xl border border-zinc-200 p-3.5">
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14.5px] font-extrabold text-zinc-900">{i.full_name}</span>
                  {i.review_status === 'pending'
                    ? <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">بانتظار المراجعة</span>
                    : <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">مقبول</span>}
                </div>
                <div className="text-[12px] text-zinc-500 mt-0.5">
                  <bdi dir="ltr">{i.phone ?? '—'}</bdi>{i.level ? ` · ${i.level}` : ''} · {i.kind === 'private' ? 'فردي' : 'جماعي'}
                  {' · '}أضافه <b className="text-zinc-700">{i.teacher_name ?? 'أستاذ'}</b>
                  {' · '}{new Date(i.created_at).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' })}
                </div>
                {i.note && <div className="text-[12px] text-zinc-600 mt-1">«{i.note}»</div>}
              </div>
              {i.review_status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => approve(i)} disabled={busy === i.id}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-[12.5px] font-bold disabled:opacity-50">
                    {busy === i.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} قبول
                  </button>
                  <button onClick={() => setRejecting(i)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 text-zinc-600 text-[12.5px] font-bold hover:border-red-300 hover:text-red-600">
                    <X size={14} /> رفض
                  </button>
                </div>
              )}
            </div>
            {i.payments.length > 0 && (
              <div className="mt-3 space-y-2">
                {i.payments.map(p => (
                  <div key={p.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-amber-50/70 border border-amber-100 px-3 py-2">
                    <span className="text-[14px] font-extrabold text-amber-800"><bdi>{mad(p.amount_mad)}</bdi></span>
                    <span className="text-[11.5px] text-amber-900/80 flex-1 min-w-[8rem]">
                      {PAY_METHOD_AR[p.payment_method ?? ''] ?? p.payment_method ?? '—'}
                      {p.payment_date ? ` · ${new Date(p.payment_date).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' })}` : ''}
                      {p.notes ? ` · ${p.notes}` : ''}
                    </span>
                    {p.receipt_path && (
                      <button onClick={() => openReceipt(p.receipt_path!)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 text-[11.5px] font-bold text-amber-800">
                        <ImageIcon size={13} /> الوصل
                      </button>
                    )}
                    <button onClick={() => settle(p.id, true)} disabled={busy === p.id}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[11.5px] font-bold disabled:opacity-50">
                      <Check size={13} /> تأكيد
                    </button>
                    <button onClick={() => settle(p.id, false)} disabled={busy === p.id}
                      className="px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-500 text-[11.5px] font-bold hover:text-red-600">
                      رفض
                    </button>
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      {rejecting && (
        <ConfirmDialog
          title={`رفض ${rejecting.full_name}`}
          body="سيبقى الطالب في القاعدة غير نشط ولن يتوصّل برمز دخول. يرى الأستاذ أنه مرفوض مع السبب."
          askReason reasonLabel="السبب (يراه الأستاذ)"
          confirmLabel="رفض"
          onConfirm={async (reason) => { await reviewTeacherStudent(rejecting.id, false, reason || null); load(); onChanged?.() }}
          onClose={() => setRejecting(null)}
        />
      )}
      {approved && <ApprovedDialog item={approved.item} token={approved.token} onClose={() => setApproved(null)} />}
    </section>
  )
}

function ApprovedDialog({ item, token, onClose }: { item: IntakeItem; token: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const msg = `مرحبًا ${item.full_name.split(' ')[0]} 👋\nمرحبًا بك في إنجليزي.كوم!\nرمز الدخول إلى فضائك: ${token}\nالرابط: https://student.inglizi.com`
  const wa = waLink(item.phone, msg)
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" dir="rtl" role="dialog" aria-modal="true" aria-label="تم القبول">
      <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 space-y-4 text-center">
        <span className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={28} /></span>
        <div className="text-[15px] font-extrabold text-zinc-900">قُبل {item.full_name}</div>
        <div className="rounded-xl bg-zinc-50 border border-zinc-200 py-3 text-[22px] font-black tracking-widest text-zinc-900" dir="ltr">{token}</div>
        <div className="flex gap-2">
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 text-white text-[13px] font-bold">
              <MessageCircle size={15} /> إرسال الرمز عبر واتساب
            </a>
          )}
          <button onClick={async () => { await navigator.clipboard.writeText(msg).catch(() => {}); setCopied(true) }}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 text-[13px] font-bold text-zinc-600">
            {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'نُسخ' : 'نسخ'}
          </button>
        </div>
        <button onClick={onClose} className="w-full py-2 text-[13px] font-bold text-zinc-500">إغلاق</button>
      </div>
    </div>
  )
}

const PERIODS = [{ id: 'month', label: 'هذا الشهر' }, { id: 'all', label: 'منذ البداية' }] as const

export function SidesPanel({ refreshKey = 0 }: { refreshKey?: number }) {
  const [period, setPeriod] = useState<'month' | 'all'>('month')
  const [sides, setSides] = useState<Side[] | null>(null)
  useEffect(() => {
    fetchSides(period === 'all' ? '2000-01-01' : null, null).then(r => setSides(r.sides)).catch(() => setSides([]))
  }, [period, refreshKey])
  if (!sides || sides.length === 0) return null
  const total = sides.reduce((s, x) => s + x.revenue_period, 0)

  return (
    <section className={`${CARD} p-4 sm:p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-[16px] font-extrabold text-zinc-900">الطلاب والمداخيل حسب الأستاذ</h2>
          <p className="text-[12px] text-zinc-500">كل دفعة تُحسب لأستاذ الحصص التي دُفعت مقابلها · «بدون أستاذ»: دفعات لم تُربط بعد · المجموع <bdi>{mad(total)}</bdi></p>
        </div>
        <div className="flex gap-1.5">
          {PERIODS.map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold ${period === p.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>{p.label}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {sides.map(s => (
          <div key={s.teacher_id ?? 'academy'} className={`rounded-2xl border p-3.5 ${s.is_academy ? 'border-amber-200 bg-amber-50/40' : 'border-zinc-200'}`}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className={`w-9 h-9 rounded-full flex items-center justify-center ${s.is_academy ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                {s.is_academy ? <Building2 size={16} /> : <GraduationCap size={16} />}
              </span>
              <div className="min-w-0">
                <div className="text-[14px] font-extrabold text-zinc-900 truncate">{s.name}</div>
                <div className="text-[11px] text-zinc-500">{s.students} طالب · {s.active} نشط{s.pending_review ? ` · ${s.pending_review} بانتظار` : ''}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white border border-zinc-100 px-2.5 py-2">
                <div className="text-[10.5px] font-bold text-zinc-400">{period === 'month' ? 'هذا الشهر' : 'منذ البداية'}</div>
                <div className="text-[15px] font-extrabold text-emerald-700"><bdi>{mad(period === 'month' ? s.revenue_period : s.revenue_total)}</bdi></div>
              </div>
              <div className="rounded-xl bg-white border border-zinc-100 px-2.5 py-2">
                <div className="text-[10.5px] font-bold text-zinc-400">بانتظار التأكيد</div>
                <div className={`text-[15px] font-extrabold ${s.awaiting_confirmation ? 'text-amber-600' : 'text-zinc-300'}`}><bdi>{mad(s.awaiting_confirmation)}</bdi></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
