'use client'

/**
 * Dues board — "who has to pay and who hasn't", shared by the assistant CRM
 * (workspace → المدفوعات) and the owner side (admin analytics).
 * Overdue first, then upcoming. Each row: WhatsApp reminder (also drops an
 * in-app bell notification + records the nudge) and one-tap collection.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, BellRing, HandCoins, AlertTriangle, CalendarClock, Wallet, TrendingUp, RefreshCw } from 'lucide-react'
import PersonAvatar from '@/components/PersonAvatar'
import { useStaff } from '@/lib/staff-context'
import { recordMonthlyPayment } from '@/lib/crm-db'
import {
  fetchDues, collectInstallment, markReminded, dueWhatsAppLink,
  type DuesData, type DueRow,
} from '@/lib/dues'

const MAD = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n))
const fmtD = (s: string) => new Date(s).toLocaleDateString('ar-MA', { month: 'long', day: 'numeric' })

function dueLabel(days: number, due: string): { text: string; cls: string } {
  if (days < 0)  return { text: `متأخر ${Math.abs(days)} يوم`, cls: 'bg-red-100 text-red-700' }
  if (days === 0) return { text: 'مستحق اليوم', cls: 'bg-amber-100 text-amber-800' }
  if (days <= 7) return { text: `بعد ${days} أيام · ${fmtD(due)}`, cls: 'bg-amber-50 text-amber-700' }
  return { text: fmtD(due), cls: 'bg-zinc-100 text-zinc-500' }
}

export default function DuesBoard({ showKpis = true, onChanged }: { showKpis?: boolean; onChanged?: () => void }) {
  const staff = useStaff()
  const [dues, setDues] = useState<DuesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  async function load() { setLoading(true); setDues(await fetchDues()); setLoading(false) }
  useEffect(() => { load() }, [])

  async function remind(d: DueRow) {
    const key = d.payment_id ?? d.student_id
    setBusy(key)
    const wa = dueWhatsAppLink(d)
    if (wa) window.open(wa, '_blank')
    await markReminded(d)
    await load(); setBusy(null)
  }

  async function collect(d: DueRow) {
    const key = d.payment_id ?? d.student_id
    if (!confirm(`تسجيل قبض ${MAD(d.amount)} د.م من ${d.name}؟`)) return
    setBusy(key)
    if (d.payment_id) await collectInstallment(d.payment_id, d.student_id, Number(d.amount), staff.id)
    else await recordMonthlyPayment({ studentId: d.student_id, amountMad: Number(d.amount), approverId: staff.id })
    await load(); setBusy(null); onChanged?.()
  }

  if (loading && !dues) {
    return <div className="py-10 flex justify-center text-zinc-300"><Loader2 size={22} className="animate-spin" /></div>
  }
  if (!dues) return null

  const rows: DueRow[] = [...dues.installments, ...dues.monthly].sort((a, b) => a.days - b.days)
  const overdue = rows.filter(r => r.days < 0)
  const upcoming = rows.filter(r => r.days >= 0)
  const t = dues.totals

  return (
    <div className="space-y-4">
      {showKpis && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 lg:gap-3">
          <Kpi icon={Wallet} label="المقبوض هذا الشهر" value={`${MAD(t.collected_month)} د.م`} cls="text-emerald-600" />
          <Kpi icon={HandCoins} label="مستحقات غير مدفوعة" value={`${MAD(t.outstanding)} د.م`} cls="text-zinc-900" />
          <Kpi icon={AlertTriangle} label="متأخرة" value={`${MAD(t.overdue)} د.م`} cls={t.overdue > 0 ? 'text-red-600' : 'text-zinc-900'} />
          <Kpi icon={CalendarClock} label="مستحقة خلال 7 أيام" value={`${MAD(t.due_7d)} د.م`} cls="text-amber-600" />
          <Kpi icon={TrendingUp} label="اشتراكات شهرية متوقعة" value={`${MAD(t.monthly_mrr)} د.م/شهر`} cls="text-blue-600" />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-200/80">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100">
          <HandCoins size={15} className="text-amber-600" />
          <span className="text-[13.5px] font-black text-zinc-800">لوحة المستحقات — من عليه أن يدفع؟</span>
          <span className="text-[11px] text-zinc-400 font-semibold">أقساط مجدولة + اشتراكات شهرية</span>
          <button onClick={load} disabled={loading} className="mr-auto text-zinc-400 hover:text-zinc-700 disabled:opacity-50">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {rows.length === 0 ? (
          <p className="text-[13px] text-zinc-400 py-8 text-center font-semibold">لا مستحقات حاليًا — الجميع خالص 🎉</p>
        ) : (
          <div className="divide-y divide-zinc-50">
            {overdue.length > 0 && <GroupHead cls="bg-red-50 text-red-700">⚠️ متأخرة ({overdue.length})</GroupHead>}
            {overdue.map(d => <Row key={(d.payment_id ?? '') + d.student_id} d={d} busy={busy} onRemind={remind} onCollect={collect} />)}
            {upcoming.length > 0 && <GroupHead cls="bg-amber-50 text-amber-700">⏳ قادمة ({upcoming.length})</GroupHead>}
            {upcoming.map(d => <Row key={(d.payment_id ?? '') + d.student_id} d={d} busy={busy} onRemind={remind} onCollect={collect} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function GroupHead({ children, cls }: { children: React.ReactNode; cls: string }) {
  return <div className={`px-4 py-1.5 text-[11px] font-black ${cls}`}>{children}</div>
}

function Row({ d, busy, onRemind, onCollect }: {
  d: DueRow; busy: string | null
  onRemind: (d: DueRow) => void; onCollect: (d: DueRow) => void
}) {
  const key = d.payment_id ?? d.student_id
  const isBusy = busy === key
  const due = dueLabel(d.days, d.due_date)
  const kind = d.payment_id
    ? `قسط ${d.installment_no ?? 2}/${d.installment_count ?? 2}`
    : 'اشتراك شهري'
  return (
    <div className="flex items-center gap-x-3 gap-y-2 px-4 py-2.5 hover:bg-zinc-50/60 flex-wrap">
      <Link href={`/sales/students/${d.student_id}`} className="flex items-center gap-2.5 flex-1 min-w-[160px]">
        <PersonAvatar name={d.name} size={34} src={d.avatar_url} />
        <div className="min-w-0">
          <div className="text-[13px] font-bold text-zinc-800 truncate">{d.name}</div>
          <div className="text-[11px] text-zinc-400 truncate">
            {d.course ? `${d.course.toUpperCase()} · ` : ''}{kind}
            {d.reminded_at && <span> · ذُكِّر {new Date(d.reminded_at).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric' })}</span>}
          </div>
        </div>
      </Link>
      <div className="text-left flex-shrink-0">
        <div className="text-[14px] font-black text-zinc-900">{MAD(d.amount)} <span className="text-[10px] text-zinc-400 font-semibold">د.م</span></div>
        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${due.cls}`}>{due.text}</span>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button onClick={() => onRemind(d)} disabled={isBusy} title="تذكير عبر واتساب + إشعار في فضاء الطالب"
          className="flex items-center gap-1 text-[11.5px] font-bold px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50">
          {isBusy ? <Loader2 size={12} className="animate-spin" /> : <BellRing size={12} />} تذكير
        </button>
        <button onClick={() => onCollect(d)} disabled={isBusy} title="تسجيل القبض الآن"
          className="flex items-center gap-1 text-[11.5px] font-bold px-2.5 py-1.5 rounded-lg bg-zinc-900 text-yellow-400 hover:bg-black disabled:opacity-50">
          <HandCoins size={12} /> تحصيل
        </button>
      </div>
    </div>
  )
}

function Kpi({ icon: Icon, label, value, cls }: { icon: any; label: string; value: string; cls: string }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-3.5">
      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-bold mb-1"><Icon size={13} /> {label}</div>
      <div className={`text-[17px] font-black ${cls}`}>{value}</div>
    </div>
  )
}
