'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, Loader2, Wallet } from 'lucide-react'
import { PAYOUT_METHOD_AR, PAYOUT_STATUS_AR, fetchMyPayouts, type MyPayouts as Data, type Payout } from '@/lib/founder'

/**
 * دفعاتي — a teacher's or assistant's own monthly pay, as the founder recorded
 * it: paid (with the date and how) or pending. Reads my_payouts(), which only
 * ever returns the caller's own rows. Used on the teacher earnings page and in
 * the CRM profile window.
 */

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر']
const monthLabel = (p: string) => `${MONTHS_AR[Number(p.slice(5, 7)) - 1]} ${p.slice(0, 4)}`
const mad = (n: number) => `${Math.round(n).toLocaleString('en-US')} د.م`

const DEMO: Data = {
  salary: null,
  payouts: [
    { id: 'd1', payee_id: 'demo', period: '2026-09-01', base_mad: 4200, bonus_mad: 300, deduction_mad: 0, amount_mad: 4500, hours: 42, sessions: 28, status: 'paid', method: 'bank_transfer', reference: null, note: 'مكافأة الحضور الكامل', paid_at: '2026-10-02T10:00:00Z' },
    { id: 'd2', payee_id: 'demo', period: '2026-10-01', base_mad: 1800, bonus_mad: 0, deduction_mad: 0, amount_mad: 1800, hours: 18, sessions: 12, status: 'pending', method: null, reference: null, note: null, paid_at: null },
  ],
}

export default function MyPayouts({ demo = false, compact = false }: { demo?: boolean; compact?: boolean }) {
  const [data, setData] = useState<Data | null>(demo ? DEMO : null)
  const [loading, setLoading] = useState(!demo)

  useEffect(() => {
    if (demo) return
    let alive = true
    fetchMyPayouts().then(d => { if (alive) { setData(d); setLoading(false) } })
    return () => { alive = false }
  }, [demo])

  if (loading) return <div className="py-6 flex justify-center text-slate-400"><Loader2 size={18} className="animate-spin" /></div>
  const list = data?.payouts ?? []
  const paidTotal = list.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount_mad, 0)
  const pending = list.filter(p => p.status === 'pending')

  return (
    <div className="space-y-3">
      {!compact && (
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 px-3.5 py-3">
            <div className="text-[11.5px] font-bold text-emerald-700">مجموع ما توصّلت به</div>
            <div className="text-[19px] font-extrabold text-emerald-800"><bdi>{mad(paidTotal)}</bdi></div>
          </div>
          <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-100 px-3.5 py-3">
            <div className="text-[11.5px] font-bold text-amber-700">قيد الصرف</div>
            <div className="text-[19px] font-extrabold text-amber-800"><bdi>{mad(pending.reduce((s, p) => s + p.amount_mad, 0))}</bdi></div>
          </div>
        </div>
      )}
      {data?.salary != null && data.salary > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-[12.5px]">
          <span className="font-bold text-slate-500">راتبك الشهري</span>
          <span className="font-extrabold text-[#1E3A8A]"><bdi>{mad(data.salary)}</bdi></span>
        </div>
      )}
      {list.length === 0 ? (
        <div className="py-6 text-center">
          <Wallet size={22} className="mx-auto text-slate-300 mb-2" />
          <p className="text-[13px] text-slate-400">لم تُسجَّل أي دفعة بعد. ستظهر هنا شهرًا بشهر.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-2xl ring-1 ring-slate-200 bg-white overflow-hidden">
          {list.map(p => <Row key={p.id} p={p} />)}
        </ul>
      )}
    </div>
  )
}

function Row({ p }: { p: Payout }) {
  const paid = p.status === 'paid'
  return (
    <li className="flex items-center gap-3 px-3.5 py-3">
      <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
        {paid ? <CheckCircle2 size={16} /> : <Clock size={16} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-extrabold text-[#1E3A8A]">{monthLabel(p.period)}</div>
        <div className="text-[11.5px] text-slate-500 truncate">
          {paid
            ? <>دُفع {p.paid_at ? new Date(p.paid_at).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' }) : ''}{p.method ? ` · ${PAYOUT_METHOD_AR[p.method]}` : ''}</>
            : PAYOUT_STATUS_AR[p.status]}
          {p.hours != null && <> · {p.hours} ساعة</>}
          {p.bonus_mad > 0 && <> · مكافأة {mad(p.bonus_mad)}</>}
          {p.deduction_mad > 0 && <> · خصم {mad(p.deduction_mad)}</>}
        </div>
        {p.note && <div className="text-[11px] text-slate-400 truncate">{p.note}</div>}
      </div>
      <span className={`text-[15px] font-extrabold shrink-0 ${paid ? 'text-emerald-700' : 'text-amber-700'}`}><bdi>{mad(p.amount_mad)}</bdi></span>
    </li>
  )
}
