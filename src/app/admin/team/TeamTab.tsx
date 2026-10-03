'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Activity, Ban, CheckCircle2, Loader2, MessageCircle, Pencil, Save, Star, X, ShieldCheck, Clock, Trash2, UserPlus,
} from 'lucide-react'
import { ConfirmDialog, INP } from '@/components/crm/kit'
import { ROLE_AR, setPaySettings, setStaffBlocked, type TeamMember } from '@/lib/founder'
import { setProfileRole } from '@/lib/staff-db'
import { deleteTeacherAccount, fetchDeleteImpact, type DeleteImpact } from '@/lib/teachers'
import AddMember from './AddMember'
import { CARD, Initial, Stat, ago, isOnline, mad, waLink } from './_shared'

/**
 * الفريق — one card per person. Assistants show what they did in the period
 * (from the database's own trail, not from what they report) and their
 * salary; teachers show sessions, hours and rating. The founder can block
 * or unblock anyone but a founder, and jump to that person's trail.
 */
export default function TeamTab({ people, loading, limited, onChanged, onShowActivity }: {
  people: TeamMember[] | null
  loading: boolean
  /** 057 not deployed: list only, no activity / block / salary. */
  limited: boolean
  onChanged: () => void
  onShowActivity: (id: string) => void
}) {
  const [confirm, setConfirm] = useState<TeamMember | null>(null)
  const [removing, setRemoving] = useState<TeamMember | null>(null)
  const [adding, setAdding] = useState(false)

  if (loading && !people) {
    return <div className="py-16 flex justify-center text-zinc-400"><Loader2 className="animate-spin" /></div>
  }
  const list = people ?? []
  const groups: { title: string; note: string; rows: TeamMember[] }[] = [
    { title: 'المساعدون', note: 'عملهم في الفترة المختارة', rows: list.filter(p => p.role === 'assistant') },
    { title: 'الأساتذة', note: 'الحصص والساعات في الفترة', rows: list.filter(p => p.role === 'teacher') },
    { title: 'المؤسسون', note: 'حسابات بصلاحيات كاملة', rows: list.filter(p => p.role === 'founder') },
  ]

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] text-zinc-500">أضف مساعدًا أو أستاذًا ببريد وكلمة مرور تعطيها له — لا يحتاج إلى التسجيل بنفسه.</p>
        <button onClick={() => setAdding(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-l from-amber-400 to-yellow-500 text-[#1E3A8A] text-[13px] font-bold ring-1 ring-amber-300 shadow-sm">
          <UserPlus size={16} /> إضافة عضو
        </button>
      </div>

      {groups.map(g => g.rows.length > 0 && (
        <section key={g.title}>
          <div className="flex items-baseline gap-2 mb-3">
            <h2 className="text-[16px] font-extrabold text-zinc-900">{g.title}</h2>
            <span className="text-[12px] text-zinc-400">{g.rows.length} · {g.note}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
            {g.rows.map(p => (
              <PersonCard key={p.id} p={p} limited={limited} onBlock={() => setConfirm(p)} onRemove={() => setRemoving(p)}
                          onShowActivity={() => onShowActivity(p.id)} onChanged={onChanged} />
            ))}
          </div>
        </section>
      ))}

      {confirm && (
        <ConfirmDialog
          title={confirm.blocked ? `إعادة تفعيل ${confirm.name}` : `إيقاف ${confirm.name}`}
          danger={!confirm.blocked}
          body={confirm.blocked
            ? 'سيستعيد هذا الحساب صلاحياته فور تسجيل الدخول.'
            : confirm.role === 'teacher'
              ? 'سيُمنع الأستاذ من فضاء الأساتذة فورًا وسيختفي ملفه من صفحة الأساتذة العامة.'
              : 'سيفقد هذا الحساب الوصول إلى كل بيانات الـCRM فورًا، حتى لو كانت صفحته مفتوحة.'}
          keeps={confirm.blocked ? undefined : ['سجل نشاطه كاملًا', 'العملاء والطلاب الذين أضافهم', 'رواتبه السابقة']}
          confirmLabel={confirm.blocked ? 'إعادة التفعيل' : 'إيقاف الحساب'}
          onConfirm={async () => { await setStaffBlocked(confirm.id, !confirm.blocked); onChanged() }}
          onClose={() => setConfirm(null)}
        />
      )}

      {removing && <RemoveDialog p={removing} onClose={() => setRemoving(null)} onRemoved={onChanged} />}
      {adding && <AddMember onClose={() => setAdding(false)} onAdded={onChanged} />}
    </div>
  )
}

function PersonCard({ p, limited, onBlock, onRemove, onShowActivity, onChanged }: {
  p: TeamMember; limited: boolean; onBlock: () => void; onRemove: () => void; onShowActivity: () => void; onChanged: () => void
}) {
  const online = isOnline(p.last_seen_at)
  const wa = waLink(p.phone, `مرحبًا ${p.name}`)
  return (
    <div className={`${CARD} p-4 sm:p-5 flex flex-col gap-4 min-w-0 ${p.blocked ? 'opacity-75' : ''}`}>
      {/* who */}
      <div className="flex items-start gap-3 min-w-0">
        <div className="relative">
          <Initial name={p.name} size={48} tone={p.role === 'founder' ? 'gold' : p.blocked ? 'slate' : 'blue'} />
          {online && <span className="absolute bottom-0 left-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" title="متصل الآن" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[15px] font-extrabold text-zinc-900 truncate">{p.name}</span>
            <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{ROLE_AR[p.role]}</span>
            {p.blocked && <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">موقوف</span>}
          </div>
          <div className="text-[11.5px] text-zinc-400 truncate" dir="ltr">{p.email ?? '—'}</div>
          <div className="mt-1 flex items-center gap-1 text-[11.5px] font-semibold text-zinc-500">
            <Clock size={12} />
            {online ? <span className="text-emerald-600">متصل الآن</span> : <>آخر ظهور {ago(p.last_seen_at ?? p.last_sign_in_at)}</>}
          </div>
        </div>
      </div>

      {/* what they did */}
      {p.role === 'assistant' && (
        <div className="grid grid-cols-3 gap-2">
          <Stat label="إجراءات" value={p.actions} />
          <Stat label="عملاء أضافهم" value={p.leads_created} />
          <Stat label="طلاب أضافهم" value={p.students_added} />
          <Stat label="دفعات سجّلها" value={p.payments_recorded} />
          <Stat label="مبلغها" value={mad(p.revenue_recorded)} tone="good" />
          <Stat label="متابعات متأخرة" value={p.followups_overdue} tone={p.followups_overdue > 0 ? 'bad' : undefined} />
        </div>
      )}
      {p.role === 'teacher' && (
        <div className="grid grid-cols-3 gap-2">
          <Stat label="حصص منجزة" value={p.sessions_done} />
          <Stat label="ساعات" value={p.hours_done} />
          <Stat label="طلاب مسندون" value={p.students_assigned} />
          <Stat label="التقييم" value={p.rating_count ? `${Number(p.rating_avg ?? 0).toFixed(1)} ★` : '—'} tone="warn" />
          <Stat label="سعر الساعة" value={p.hourly_rate_mad != null ? mad(p.hourly_rate_mad) : '—'} />
          <Stat label="مستحق تقديري" value={p.hourly_rate_mad != null ? mad(p.hours_done * p.hourly_rate_mad) : '—'} tone="good" />
        </div>
      )}
      {p.role === 'founder' && (
        <div className="grid grid-cols-3 gap-2">
          <Stat label="إجراءات" value={p.actions} />
          <Stat label="جلسات" value={p.sessions_opened} />
          <Stat label="آخر إجراء" value={ago(p.last_action_at)} />
        </div>
      )}

      {p.role === 'assistant' && !limited && <SalaryEditor p={p} onSaved={onChanged} />}

      {/* actions */}
      <div className="flex flex-wrap gap-2 mt-auto">
        <button onClick={onShowActivity} disabled={limited}
                className="disabled:opacity-40 flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-[12.5px] font-bold hover:bg-blue-100 transition-colors">
          <Activity size={14} /> النشاط
        </button>
        {p.role === 'teacher' && (
          <Link href="/admin/teachers" title="الملف وسعر الساعة"
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-600 text-[12.5px] font-bold hover:border-blue-300 hover:text-blue-700">
            <Star size={14} /> الملف
          </Link>
        )}
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="واتساب"
             className="w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
            <MessageCircle size={16} />
          </a>
        )}
        {p.role !== 'founder' && !limited && (
          <button onClick={onBlock}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[12.5px] font-bold transition-colors
                              ${p.blocked ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'}`}>
            {p.blocked ? <><CheckCircle2 size={14} /> تفعيل</> : <><Ban size={14} /> إيقاف</>}
          </button>
        )}
        {p.role !== 'founder' && (
          <button onClick={onRemove} aria-label="إزالة من الفريق" title="إزالة من الفريق"
                  className="w-10 flex items-center justify-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50">
            <Trash2 size={15} />
          </button>
        )}
        {p.role === 'founder' && (
          <span className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-50 text-amber-700 text-[12px] font-bold">
            <ShieldCheck size={14} /> صلاحيات كاملة
          </span>
        )}
      </div>
    </div>
  )
}

function SalaryEditor({ p, onSaved }: { p: TeamMember; onSaved: () => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(p.monthly_salary_mad || ''))
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  useEffect(() => { setValue(String(p.monthly_salary_mad || '')) }, [p.monthly_salary_mad])

  async function save() {
    const n = Number(value)
    if (!Number.isFinite(n) || n < 0) { setErr('أدخل مبلغًا صحيحًا'); return }
    setBusy(true); setErr(null)
    try { await setPaySettings(p.id, n); setEditing(false); onSaved() }
    catch (e: any) { setErr(e?.message ?? 'تعذّر الحفظ') }
    finally { setBusy(false) }
  }

  return (
    <div className="rounded-2xl bg-amber-50/70 border border-amber-100 px-3.5 py-2.5">
      {editing ? (
        <div className="flex items-center gap-2">
          <input value={value} onChange={e => setValue(e.target.value)} inputMode="decimal" dir="ltr" autoFocus
                 className={`${INP} text-left`} placeholder="3000" />
          <span className="text-[12px] font-bold text-amber-800 shrink-0">د.م / شهر</span>
          <button onClick={save} disabled={busy} aria-label="حفظ"
                  className="w-9 h-9 shrink-0 rounded-lg bg-gradient-to-l from-blue-600 to-blue-800 text-white flex items-center justify-center disabled:opacity-50">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          </button>
          <button onClick={() => { setEditing(false); setErr(null) }} aria-label="إلغاء"
                  className="w-9 h-9 shrink-0 rounded-lg text-zinc-400 hover:bg-white flex items-center justify-center"><X size={14} /></button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12.5px] font-bold text-amber-900">الراتب الشهري</span>
          <span className="flex items-center gap-2">
            <span className="text-[15px] font-extrabold text-amber-800"><bdi>{p.monthly_salary_mad ? mad(p.monthly_salary_mad) : 'غير محدد'}</bdi></span>
            <button onClick={() => setEditing(true)} aria-label="تعديل الراتب"
                    className="w-8 h-8 rounded-lg text-amber-700 hover:bg-white flex items-center justify-center"><Pencil size={14} /></button>
          </span>
        </div>
      )}
      {err && <div className="text-[11.5px] font-bold text-rose-600 mt-1">{err}</div>}
    </div>
  )
}

/**
 * Remove someone from the team.
 *   assistant → back to a plain account: CRM access ends at once; everything
 *               they did, added and were paid stays.
 *   teacher   → the existing irreversible delete (classes, reports, materials
 *               go with the account), shown with its real impact first, and
 *               suspend offered as the safer path.
 */
function RemoveDialog({ p, onClose, onRemoved }: { p: TeamMember; onClose: () => void; onRemoved: () => void }) {
  const [impact, setImpact] = useState<DeleteImpact | null>(null)
  const [impactErr, setImpactErr] = useState<string | null>(null)
  useEffect(() => {
    if (p.role !== 'teacher') return
    fetchDeleteImpact(p.id).then(setImpact).catch(e => setImpactErr(e?.message ?? 'تعذّر حساب الأثر'))
  }, [p.id, p.role])

  if (p.role === 'assistant') {
    return (
      <ConfirmDialog
        title={`إزالة ${p.name} من الفريق`}
        body="سيفقد هذا الحساب الوصول إلى الـCRM فورًا ويصبح حسابًا عاديًا. يمكنك إعادته لاحقًا من «إضافة عضو» بنفس البريد."
        keeps={['سجل نشاطه كاملًا', 'العملاء والطلاب والدفعات التي سجّلها', 'رواتبه السابقة']}
        confirmLabel="إزالة من الفريق"
        onConfirm={async () => { await setProfileRole(p.id, 'student'); onRemoved() }}
        onClose={onClose}
      />
    )
  }

  return (
    <ConfirmDialog
      title={`حذف حساب ${p.name} نهائيًا`}
      body={
        <div className="space-y-2">
          <p>لا يمكن التراجع عن الحذف. إذا كنت تريد فقط إبعاده مؤقتًا فاستعمل «إيقاف» بدلًا من الحذف.</p>
          {impactErr && <p className="text-rose-600 font-bold">{impactErr}</p>}
          {!impact && !impactErr && <p className="flex items-center gap-2 text-zinc-400"><Loader2 size={13} className="animate-spin" /> حساب ما سيُحذف…</p>}
          {impact && (
            <ul className="rounded-xl bg-rose-50 border border-rose-100 px-3.5 py-2.5 text-[12.5px] text-rose-800 space-y-0.5">
              <li>· {impact.classes} حصة وسجلّات حضورها</li>
              <li>· {impact.reports} تقرير · {impact.materials} ملف</li>
              <li>· إسناد {impact.students} طالب (الطلاب أنفسهم يبقون)</li>
              <li>· {impact.reviews} تقييم</li>
            </ul>
          )}
        </div>
      }
      confirmLabel="حذف الحساب نهائيًا"
      onConfirm={async () => { await deleteTeacherAccount(p.id); onRemoved() }}
      onClose={onClose}
    />
  )
}