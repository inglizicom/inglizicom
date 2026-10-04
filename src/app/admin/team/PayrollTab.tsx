'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2, ChevronLeft, ChevronRight, Clock, Loader2, MessageCircle, RotateCcw, Save, Wallet, Ban,
} from 'lucide-react'
import { Field, INP, Modal, ErrorNote } from '@/components/crm/kit'
import {
  PAYOUT_METHOD_AR, PAYOUT_STATUS_AR, ROLE_AR, fetchPayroll, savePayout,
  type Payroll, type PayrollRow, type PayoutMethod, type PayoutStatus,
} from '@/lib/founder'
import { CARD, Initial, Stat, mad, waLink } from './_shared'

/**
 * الرواتب — one month at a time. Each assistant and teacher gets a card with
 * the suggested base (an assistant's salary; a teacher's delivered hours ×
 * hourly rate), a bonus and a deduction. Saving records the month as pending;
 * "تسجيل الدفع" records it as paid with the method and a reference, then
 * offers a WhatsApp note to the person. Teachers and assistants see their own
 * months in their space.
 */

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر']
const monthLabel = (m: string) => `${MONTHS_AR[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`
const shiftMonth = (m: string, by: number) => {
  const d = new Date(Date.UTC(Number(m.slice(0, 4)), Number(m.slice(5, 7)) - 1 + by, 1))
  return d.toISOString().slice(0, 10)
}

export default function PayrollTab({ initialMonth }: { initialMonth: string }) {
  const [month, setMonth] = useState(initialMonth)
  const [data, setData] = useState<Payroll | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load(m = month) {
    setLoading(true); setError(null)
    try { setData(await fetchPayroll(m)) }
    catch (e: any) { setError(e?.message ?? 'تعذّر تحميل الرواتب') }
    finally { setLoading(false) }
  }
  useEffect(() => { load(month) }, [month]) // eslint-disable-line react-hooks/exhaustive-deps

  const unsaved = useMemo(() =>
    (data?.rows ?? []).filter(r => !r.payout && r.suggested_base > 0).reduce((s, r) => s + r.suggested_base, 0), [data])

  return (
    <div className="space-y-5">
      {/* month switcher */}
      <div className={`${CARD} p-3 sm:p-4 flex items-center justify-between gap-3`}>
        <button onClick={() => setMonth(m => shiftMonth(m, -1))} aria-label="الشهر السابق"
                className="w-10 h-10 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600 hover:border-blue-300 hover:text-blue-700">
          <ChevronRight size={18} />
        </button>
        <div className="text-center">
          <div className="text-[11.5px] font-bold text-zinc-400">رواتب شهر</div>
          <div className="text-[18px] font-extrabold text-zinc-900">{monthLabel(month)}</div>
        </div>
        <button onClick={() => setMonth(m => shiftMonth(m, 1))} aria-label="الشهر التالي"
                className="w-10 h-10 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600 hover:border-blue-300 hover:text-blue-700">
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* totals */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Total icon={CheckCircle2} tone="emerald" label="مدفوع" value={mad(data?.totals.paid)} note={`${data?.totals.n_paid ?? 0} شخص`} />
        <Total icon={Clock} tone="amber" label="مسجّل وقيد الانتظار" value={mad(data?.totals.pending)} note={`${data?.totals.n_pending ?? 0} شخص`} />
        <Total icon={Wallet} tone="blue" label="مقترح لم يُسجَّل بعد" value={mad(unsaved)} note="من الرواتب وساعات الأساتذة" />
      </div>

      <ErrorNote>{error}</ErrorNote>
      {loading && !data && <div className="py-16 flex justify-center text-zinc-400"><Loader2 className="animate-spin" /></div>}
      {data && data.rows.length === 0 && (
        <div className={`${CARD} p-10 text-center text-[13px] text-zinc-400`}>لا مساعدين ولا أساتذة بعد.</div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data?.rows.map(r => <PayCard key={r.id} row={r} month={month} onSaved={() => load()} />)}
      </div>
    </div>
  )
}

function Total({ icon: Icon, tone, label, value, note }: {
  icon: typeof Wallet; tone: 'emerald' | 'amber' | 'blue'; label: string; value: string; note: string
}) {
  const t = { emerald: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700', blue: 'bg-blue-100 text-blue-700' }[tone]
  return (
    <div className={`${CARD} p-3 sm:p-4 flex items-center gap-3 min-w-0`}>
      <span className={`hidden sm:flex w-11 h-11 rounded-full items-center justify-center shrink-0 ${t}`}><Icon size={19} /></span>
      <div className="min-w-0">
        <div className="text-[11px] sm:text-[12px] font-bold text-zinc-500 leading-tight">{label}</div>
        <div className="text-[15px] sm:text-[20px] font-extrabold text-zinc-900 leading-tight mt-0.5"><bdi>{value}</bdi></div>
        <div className="text-[10.5px] sm:text-[11px] text-zinc-400 truncate">{note}</div>
      </div>
    </div>
  )
}

const STATUS_STYLE: Record<PayoutStatus | 'none', string> = {
  paid:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  cancelled: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  none:      'bg-blue-50 text-blue-700 border-blue-200',
}

function PayCard({ row, month, onSaved }: { row: PayrollRow; month: string; onSaved: () => void }) {
  const p = row.payout
  const [base, setBase] = useState(String(p?.base_mad ?? row.suggested_base ?? 0))
  const [bonus, setBonus] = useState(String(p?.bonus_mad ?? 0))
  const [deduction, setDeduction] = useState(String(p?.deduction_mad ?? 0))
  const [note, setNote] = useState(p?.note ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    setBase(String(p?.base_mad ?? row.suggested_base ?? 0)); setBonus(String(p?.bonus_mad ?? 0))
    setDeduction(String(p?.deduction_mad ?? 0)); setNote(p?.note ?? '')
  }, [p?.id, p?.base_mad, p?.bonus_mad, p?.deduction_mad, p?.note, row.suggested_base])

  const total = (Number(base) || 0) + (Number(bonus) || 0) - (Number(deduction) || 0)
  const status: PayoutStatus | 'none' = p?.status ?? 'none'
  const locked = status === 'paid'

  async function save(next: PayoutStatus, extra: { method?: PayoutMethod | null; reference?: string | null } = {}) {
    setBusy(true); setErr(null)
    try {
      await savePayout({
        payee: row.id, month, base: Number(base) || 0, bonus: Number(bonus) || 0, deduction: Number(deduction) || 0,
        status: next, method: extra.method ?? p?.method ?? null, reference: extra.reference ?? p?.reference ?? null, note,
      })
      onSaved()
    } catch (e: any) { setErr(e?.message ?? 'تعذّر الحفظ') }
    finally { setBusy(false) }
  }

  const wa = p?.status === 'paid'
    ? waLink(row.phone, `مرحبًا ${row.name}، تم صرف راتب شهر ${monthLabel(month)}: ${mad(p.amount_mad)}${p.method ? ` (${PAYOUT_METHOD_AR[p.method]})` : ''}. شكرًا على مجهودك 🌟 — إنجليزي.كوم`)
    : null

  return (
    <div className={`${CARD} p-4 sm:p-5 flex flex-col gap-4 min-w-0`}>
      <div className="flex items-start gap-3">
        <Initial name={row.name} size={44} tone={row.blocked ? 'slate' : 'blue'} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[15px] font-extrabold text-zinc-900 truncate">{row.name}</span>
            <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{ROLE_AR[row.role]}</span>
            {row.blocked && <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">موقوف</span>}
          </div>
          <div className="text-[11.5px] text-zinc-500 mt-0.5">
            {row.role === 'teacher' && row.pay_model === 'revenue_share'
              ? <>{row.revenue_share_pct != null ? `${row.revenue_share_pct}%` : 'نسبة غير محددة'} من {mad(row.revenue_brought ?? 0)} · مداخيل طلابه · {row.sessions} حصة</>
              : row.role === 'teacher'
              ? <>{row.sessions} حصة · {row.hours} ساعة × {row.hourly_rate_mad != null ? mad(row.hourly_rate_mad) : 'سعر غير محدد'}</>
              : <>الراتب الشهري: {row.monthly_salary_mad ? mad(row.monthly_salary_mad) : 'غير محدد'}</>}
          </div>
        </div>
        <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLE[status]}`}>
          {status === 'none' ? 'لم يُسجَّل' : PAYOUT_STATUS_AR[status]}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MoneyInput label="الأساسي" value={base} onChange={setBase} disabled={locked}
                    hint={row.suggested_base && Number(base) !== row.suggested_base ? `المقترح ${mad(row.suggested_base)}` : undefined} />
        <MoneyInput label="مكافأة" value={bonus} onChange={setBonus} disabled={locked} />
        <MoneyInput label="خصم" value={deduction} onChange={setDeduction} disabled={locked} />
      </div>

      {!locked && (
        <input value={note} onChange={e => setNote(e.target.value)} className={INP} placeholder="ملاحظة (اختياري): سبب المكافأة أو الخصم…" />
      )}

      <div className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-l from-blue-50 to-white border border-blue-100 px-4 py-3">
        <span className="text-[12.5px] font-bold text-blue-800">الصافي</span>
        <span className={`text-[22px] font-extrabold ${total < 0 ? 'text-rose-600' : 'text-blue-900'}`}><bdi>{mad(total)}</bdi></span>
      </div>

      {locked && p && (
        <div className="grid grid-cols-3 gap-2">
          <Stat label="دُفع في" value={p.paid_at ? new Date(p.paid_at).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' }) : '—'} tone="good" />
          <Stat label="الطريقة" value={p.method ? PAYOUT_METHOD_AR[p.method] : '—'} />
          <Stat label="المرجع" value={p.reference ?? '—'} />
        </div>
      )}

      {err && <div className="text-[12px] font-bold text-rose-600">{err}</div>}

      <div className="flex flex-wrap gap-2">
        {!locked && (
          <>
            <button onClick={() => setPaying(true)} disabled={busy || total < 0}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-l from-amber-400 to-yellow-500 text-[#1E3A8A] text-[13px] font-bold ring-1 ring-amber-300 shadow-sm disabled:opacity-50">
              <CheckCircle2 size={15} /> تسجيل الدفع
            </button>
            <button onClick={() => save('pending')} disabled={busy || total < 0}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-700 text-[13px] font-bold hover:border-blue-300 hover:text-blue-700 disabled:opacity-50">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} حفظ كمعلّق
            </button>
            {p && p.status !== 'cancelled' && (
              <button onClick={() => save('cancelled')} disabled={busy} aria-label="إلغاء هذا الشهر"
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-zinc-500 text-[12.5px] font-bold hover:bg-zinc-50">
                <Ban size={14} /> إلغاء
              </button>
            )}
          </>
        )}
        {locked && (
          <>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer"
                 className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 text-white text-[13px] font-bold hover:bg-emerald-600">
                <MessageCircle size={15} /> إشعار عبر واتساب
              </a>
            )}
            <button onClick={() => save('pending')} disabled={busy}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-600 text-[12.5px] font-bold hover:border-rose-300 hover:text-rose-700 disabled:opacity-50">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} إرجاع إلى معلّق
            </button>
          </>
        )}
      </div>

      {paying && (
        <PayDialog name={row.name} amount={total} month={month}
                   onClose={() => setPaying(false)}
                   onConfirm={async (method, reference) => { await save('paid', { method, reference }); setPaying(false) }} />
      )}
    </div>
  )
}

function MoneyInput({ label, value, onChange, disabled, hint }: {
  label: string; value: string; onChange: (v: string) => void; disabled?: boolean; hint?: string
}) {
  return (
    <label className="block min-w-0">
      <span className="block text-[11px] font-bold text-zinc-500 mb-1">{label}</span>
      <input value={value} onChange={e => onChange(e.target.value.replace(/[^\d.]/g, ''))} disabled={disabled}
             inputMode="decimal" dir="ltr" className={`${INP} text-left font-bold`} />
      {hint && <span className="block text-[10.5px] text-blue-600 mt-0.5 truncate">{hint}</span>}
    </label>
  )
}

function PayDialog({ name, amount, month, onClose, onConfirm }: {
  name: string; amount: number; month: string
  onClose: () => void; onConfirm: (method: PayoutMethod, reference: string) => Promise<void>
}) {
  const [method, setMethod] = useState<PayoutMethod>('bank_transfer')
  const [reference, setReference] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <Modal title={`تسجيل دفع راتب ${name}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-center">
          <div className="text-[12px] font-bold text-blue-700">{monthLabel(month)}</div>
          <div className="text-[26px] font-extrabold text-blue-900"><bdi>{mad(amount)}</bdi></div>
        </div>
        <Field label="طريقة الدفع">
          <select value={method} onChange={e => setMethod(e.target.value as PayoutMethod)} className={INP}>
            {(Object.keys(PAYOUT_METHOD_AR) as PayoutMethod[]).map(m => <option key={m} value={m}>{PAYOUT_METHOD_AR[m]}</option>)}
          </select>
        </Field>
        <Field label="مرجع العملية (اختياري)" hint="رقم التحويل أو الوصل — يظهر لك فقط">
          <input value={reference} onChange={e => setReference(e.target.value)} className={INP} dir="ltr" placeholder="TX-2026-10-001" />
        </Field>
        <div className="flex gap-2">
          <button disabled={busy} onClick={async () => { setBusy(true); try { await onConfirm(method, reference) } finally { setBusy(false) } }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-l from-blue-600 to-blue-800 text-white text-[13px] font-bold disabled:opacity-50">
            {busy && <Loader2 size={14} className="animate-spin" />} تأكيد الدفع
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-zinc-200 text-[13px] font-bold text-zinc-500">تراجع</button>
        </div>
      </div>
    </Modal>
  )
}
