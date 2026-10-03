'use client'

/* CRM student profile — formatting helpers, labels and the self-contained sections (devices, avatar, certificates, coins), split out of page.tsx. */


import { useEffect, useState } from 'react'
import { Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react'

import { type CrmStudent } from '@/lib/crm-types'
import Avatar from '@/app/sales/_components/Avatar'
import {
  fetchStudentDevices, deleteStudentDevice, resetStudentDevices, setDeviceLimit, uploadStudentAvatar,
  removeStudentAvatar, type StudentDevice,
} from '@/lib/student-portal'
import {
  fetchStudentCertificates, issueCustomCertificate, deleteCertificate, certUrl, CERT_KIND_AR,
  type CertRow,
} from '@/lib/certificates'
import { Smartphone, Coins, Gift, Award, Camera } from 'lucide-react'
import {
  fetchStudentCoinsCRM, fetchStudentClaims, adjustCoins, type CoinTx, type RewardClaimRow,
} from '@/lib/gamification'


export const MAD = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n))
export const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'

export const PAY_STATUS_AR: Record<string, { text: string; cls: string }> = {
  pending:  { text: 'معلق',   cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  paid:     { text: 'مدفوع',  cls: 'bg-green-50 text-green-700 border border-green-200' },
  declined: { text: 'مرفوض', cls: 'bg-red-50 text-red-700 border border-red-200' },
}
export const ACTIVITY_LABEL: Record<string, string> = {
  login: 'سجّل الدخول للفضاء', opened_lesson: 'فتح درسًا', opened_exercise: 'فتح تمرينًا',
  completed_exercise: 'أنجز تمرينًا', downloaded_file: 'حمّل ملفًا',
  completed_exam: 'أكمل امتحانًا', viewed_result: 'اطّلع على نتيجة', opened_today_task: 'بدأ مهمة اليوم',
}
export const ACTIVITY_ICON: Record<string, string> = {
  login: '🔑', opened_lesson: '📖', opened_exercise: '✏️', completed_exercise: '✅',
  downloaded_file: '📎', completed_exam: '🎓', viewed_result: '📊', opened_today_task: '▶️',
}
export const PAYMENT_TYPE_AR: Record<string, string> = {
  course_one_time: 'دورة (مرة واحدة)', private_monthly: 'شهري (خاص)',
}

export type Tab = 'overview' | 'payments' | 'exams' | 'progress' | 'notes' | 'activity' | 'files'
export const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'نظرة عامة' },
  { id: 'payments', label: 'المدفوعات والفواتير' },
  { id: 'exams',    label: 'الامتحانات' },
  { id: 'progress', label: 'المهام الإضافية' },
  { id: 'notes',    label: 'الملاحظات' },
  { id: 'activity', label: 'النشاط داخل المنصة' },
  { id: 'files',    label: 'الملفات' },
]



/* ── Sub-components ─────────────────────────────────────── */
export function ComingSoon({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-3">
        <Icon size={26} className="text-zinc-400" />
      </div>
      <p className="text-[15px] font-bold text-zinc-700">{title}</p>
      <p className="text-[12px] text-zinc-400 mt-1.5 max-w-sm leading-relaxed">{desc}</p>
      <span className="mt-3 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">قريباً</span>
    </div>
  )
}

export function InfoLine({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-[12px] text-zinc-400"><Icon size={14} className="text-zinc-300" /> {label}</span>
      <span className="text-[13px] font-semibold text-zinc-800">{value}</span>
    </div>
  )
}

export const SINP = 'w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400'
export function SField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-zinc-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

export function StatCard({ label, value, unit, sub, tone }: { label: string; value: string | number; unit?: string; sub?: string; tone: string }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-4">
      <div className="text-[11px] text-zinc-400 mb-1">{label}</div>
      <div className={`text-[18px] font-black ${tone} flex items-baseline gap-1`}>
        {value}{unit && <span className="text-[12px] font-semibold text-zinc-400">{unit}</span>}
      </div>
      {sub && <div className="text-[10px] text-zinc-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-zinc-100 rounded-xl p-4">
      <h4 className="text-[13px] font-bold text-zinc-800 mb-3">{title}</h4>
      {children}
    </div>
  )
}

export function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-zinc-50 last:border-none">
      <span className="text-[12px] text-zinc-400">{label}</span>
      <span className="text-[13px] font-semibold text-zinc-800">{value}</span>
    </div>
  )
}

/* Device-bound login management — see active devices, reset, set the limit. */
export function DevicesSection({ studentId, limit }: { studentId: string; limit: number }) {
  const [devices, setDevices] = useState<StudentDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [lim, setLim] = useState(limit)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function load() { setLoading(true); setDevices(await fetchStudentDevices(studentId)); setLoading(false) }
  useEffect(() => { load() }, [studentId])

  async function allowNewDevice() {
    setBusy(true)
    await resetStudentDevices(studentId)
    await load(); setBusy(false)
    setDone(true); setTimeout(() => setDone(false), 2500)
  }
  async function rm(id: string) { await deleteStudentDevice(id); load() }
  async function changeLimit(n: number) { const v = Math.max(1, n); setLim(v); await setDeviceLimit(studentId, v) }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-4">
      <div className="flex items-center gap-1.5 text-[12px] font-bold text-zinc-700 mb-3"><Smartphone size={14} className="text-indigo-600" /> أجهزة الدخول والأمان</div>

      {/* One-tap: free the account so the student can sign in on a new device */}
      <button onClick={allowNewDevice} disabled={busy}
        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-black text-[13px] flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-60">
        {busy ? <Loader2 size={15} className="animate-spin" /> : done ? <><CheckCircle size={15} /> تم — يمكنه الدخول من جهازه الجديد</> : <><Smartphone size={15} /> السماح بدخول جهاز جديد</>}
      </button>
      <p className="text-[10px] text-zinc-400 mt-1.5 mb-3 leading-relaxed text-center">اضغط، ثم اطلب من الطالب تسجيل الدخول من جهازه الجديد — سيُسجَّل خروجه من الجهاز القديم تلقائيًا.</p>

      <div className="flex items-center justify-between mb-3 bg-zinc-50 rounded-lg px-3 py-2">
        <span className="text-[12px] text-zinc-600">عدد الأجهزة المسموح بها</span>
        <div className="flex items-center gap-1.5">
          <button onClick={() => changeLimit(lim - 1)} disabled={lim <= 1} className="w-6 h-6 rounded bg-white border border-zinc-200 text-zinc-600 disabled:opacity-40">−</button>
          <span className="w-7 text-center font-black text-[14px]">{lim}</span>
          <button onClick={() => changeLimit(lim + 1)} className="w-6 h-6 rounded bg-white border border-zinc-200 text-zinc-600">+</button>
        </div>
      </div>
      {loading ? <div className="py-3 flex justify-center"><Loader2 size={16} className="animate-spin text-zinc-300" /></div>
        : devices.length === 0 ? <div className="text-[11px] text-zinc-400 py-1">لم يسجّل الطالب الدخول من أي جهاز بعد.</div>
        : <div className="space-y-1.5">
            {devices.map(d => (
              <div key={d.id} className="flex items-center gap-2 border border-zinc-100 rounded-lg p-2">
                <Smartphone size={14} className="text-zinc-400 flex-shrink-0" />
                <div className="flex-1 min-w-0"><div className="text-[12px] font-semibold text-zinc-800 truncate">{d.label || 'جهاز'}</div><div className="text-[10px] text-zinc-400">آخر دخول: {fmtDate(d.last_seen)}</div></div>
                <button onClick={() => rm(d.id)} className="text-zinc-300 hover:text-red-500" title="إزالة الجهاز"><XCircle size={15} /></button>
              </div>
            ))}
          </div>}
      <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">يمنع هذا مشاركة الحساب: الرمز يعمل فقط على الأجهزة المسجّلة (الحد الأقصى أعلاه).</p>
    </div>
  )
}

/* Profile photo: real photo when set (upload/replace/remove), cartoon fallback. */
export function AvatarUpload({ student, onChange }: { student: CrmStudent; onChange: (url: string | null) => void }) {
  const [busy, setBusy] = useState(false)
  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('اختر صورة (JPG أو PNG)'); return }
    setBusy(true)
    const url = await uploadStudentAvatar(student.id, file)
    setBusy(false)
    if (url) onChange(url)
    e.target.value = ''
  }
  async function onRemove() {
    if (!confirm('حذف صورة الطالب؟')) return
    await removeStudentAvatar(student.id)
    onChange(null)
  }
  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
      <div className="relative group">
        <Avatar name={student.full_name} size={72} square src={student.avatar_url} />
        <label className="absolute inset-0 rounded-2xl bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" title="تغيير الصورة">
          {busy ? <Loader2 size={18} className="animate-spin text-white" /> : <Camera size={18} className="text-white" />}
          <input type="file" accept="image/*" className="hidden" onChange={onPick} disabled={busy} />
        </label>
      </div>
      {student.avatar_url && (
        <button onClick={onRemove} className="text-[10px] text-zinc-400 hover:text-red-500">إزالة الصورة</button>
      )}
    </div>
  )
}

/* Certificates: auto-awarded + custom staff-issued; verify/print via public serial page. */
export function CertificatesSection({ studentId, staffId, isFounder }: { studentId: string; staffId: string; isFounder: boolean }) {
  const [certs, setCerts] = useState<CertRow[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() { setLoading(true); setCerts(await fetchStudentCertificates(studentId)); setLoading(false) }
  useEffect(() => { load() }, [studentId])

  async function issue() {
    if (!title.trim()) return
    setBusy(true)
    await issueCustomCertificate(studentId, title.trim(), staffId)
    setTitle(''); setBusy(false); load()
  }
  async function remove(id: string) {
    if (!confirm('حذف هذه الشهادة نهائيًا؟')) return
    await deleteCertificate(id); load()
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-4">
      <div className="flex items-center gap-1.5 text-[12px] font-bold text-zinc-700 mb-3"><Award size={14} className="text-amber-600" /> الشهادات</div>
      {loading ? <div className="py-3 flex justify-center"><Loader2 size={16} className="animate-spin text-zinc-300" /></div> : (
        <>
          {certs.length === 0 && <div className="text-[11px] text-zinc-400 pb-2">لا شهادات بعد — تُمنح تلقائيًا عند إتمام دورة أو جمع العملات، أو أصدر واحدة يدويًا.</div>}
          <div className="space-y-1.5 mb-3">
            {certs.map(c => {
              const k = CERT_KIND_AR[c.kind] ?? CERT_KIND_AR.custom
              return (
                <div key={c.id} className="flex items-center gap-2 border border-zinc-100 rounded-lg p-2">
                  <span className="text-[16px] flex-shrink-0">{k.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-zinc-800 truncate">{c.title}</div>
                    <div className="text-[10px] text-zinc-400" dir="ltr">{c.serial} · {fmtDate(c.created_at)}</div>
                  </div>
                  <a href={`/certificate/${c.serial}?print=1`} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 flex-shrink-0">🖨️ طباعة</a>
                  <button onClick={() => navigator.clipboard?.writeText(certUrl(c.serial))}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-50 text-zinc-500 hover:bg-zinc-100 flex-shrink-0" title="نسخ رابط التحقق">نسخ</button>
                  {isFounder && (
                    <button onClick={() => remove(c.id)} className="text-zinc-300 hover:text-red-500 flex-shrink-0" title="حذف"><Trash2 size={13} /></button>
                  )}
                </div>
              )
            })}
          </div>
          <div className="border-t border-zinc-100 pt-3">
            <div className="text-[11px] font-bold text-zinc-400 mb-1.5">إصدار شهادة خاصة</div>
            <div className="flex gap-2">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: أفضل طالب لشهر يوليوز"
                className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-[12px]" />
              <button onClick={issue} disabled={busy || !title.trim()}
                className="px-3 py-2 rounded-lg bg-amber-500 text-white font-bold text-[12px] disabled:opacity-50">
                {busy ? <Loader2 size={13} className="animate-spin" /> : 'إصدار'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export const COIN_ACTION_AR: Record<string, string> = {
  open_lesson: 'فتح درس', complete_lesson: 'إكمال درس', complete_quiz: 'اجتياز اختبار',
  complete_reading: 'إكمال قراءة', complete_unit: 'إكمال وحدة', challenge_sentence: 'تمرين بناء جمل',
  challenge_translation: 'تمرين ترجمة', streak_7: 'سلسلة 7 أيام', streak_30: 'سلسلة 30 يومًا',
  admin_add: 'إضافة يدوية', admin_remove: 'خصم يدوي',
}

/* Coins, history, reward claims, and a manual +/- adjustment. */
export function CoinsSection({ studentId, by }: { studentId: string; by: string }) {
  const [data, setData] = useState<{ balance: number; recent: CoinTx[]; challenges: number } | null>(null)
  const [claims, setClaims] = useState<RewardClaimRow[]>([])
  const [loading, setLoading] = useState(true)
  const [amt, setAmt] = useState(''); const [reason, setReason] = useState(''); const [busy, setBusy] = useState(false)

  async function load() { setLoading(true); const [c, cl] = await Promise.all([fetchStudentCoinsCRM(studentId), fetchStudentClaims(studentId)]); setData(c); setClaims(cl); setLoading(false) }
  useEffect(() => { load() }, [studentId])

  async function adjust() {
    const n = Number(amt); if (!n || !reason.trim()) return
    setBusy(true); await adjustCoins(studentId, n, reason.trim(), by); setBusy(false); setAmt(''); setReason(''); load()
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-4">
      <div className="flex items-center gap-1.5 text-[12px] font-bold text-zinc-700 mb-3"><Coins size={14} className="text-yellow-600" /> الكوينات والمكافآت</div>
      {loading ? <div className="py-3 flex justify-center"><Loader2 size={16} className="animate-spin text-zinc-300" /></div> : (
        <>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-yellow-50 rounded-xl p-3 text-center"><div className="font-black text-[20px] text-yellow-700">{data?.balance ?? 0}</div><div className="text-[10px] text-yellow-700/70">كوين</div></div>
            <div className="bg-zinc-50 rounded-xl p-3 text-center"><div className="font-black text-[20px] text-zinc-800">{data?.challenges ?? 0}</div><div className="text-[10px] text-zinc-400">تحدٍّ صحيح</div></div>
          </div>

          {claims.length > 0 && (
            <div className="mb-3">
              <div className="text-[11px] font-bold text-zinc-400 mb-1.5">طلبات المكافآت</div>
              {claims.map(c => (
                <div key={c.id} className="flex items-center gap-2 text-[12px] py-1">
                  <Gift size={13} className="text-zinc-400" />
                  <span className="flex-1 text-zinc-700">{c.reward_title}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.status === 'pending' ? 'bg-amber-50 text-amber-700' : c.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : c.status === 'used' ? 'bg-zinc-100 text-zinc-500' : 'bg-rose-50 text-rose-600'}`}>{c.status === 'pending' ? 'معلّق' : c.status === 'approved' ? 'موافَق' : c.status === 'used' ? 'مُستخدَم' : 'مرفوض'}</span>
                </div>
              ))}
            </div>
          )}

          {(data?.recent.length ?? 0) > 0 && (
            <div className="mb-3 max-h-40 overflow-y-auto">
              <div className="text-[11px] font-bold text-zinc-400 mb-1.5">سجل الكوينات</div>
              {data!.recent.slice(0, 15).map((t, i) => (
                <div key={i} className="flex items-center justify-between text-[12px] py-0.5">
                  <span className="text-zinc-600 truncate">{COIN_ACTION_AR[t.action] ?? t.action}{t.notes ? ` — ${t.notes}` : ''}</span>
                  <span className={`font-bold flex-shrink-0 ${t.amount >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{t.amount >= 0 ? '+' : ''}{t.amount}</span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-zinc-100 pt-3">
            <div className="text-[11px] font-bold text-zinc-400 mb-1.5">تعديل يدوي (بسبب)</div>
            <div className="flex gap-2">
              <input value={amt} onChange={e => setAmt(e.target.value)} type="number" placeholder="±كوين" className="w-24 border border-zinc-200 rounded-lg px-2 py-2 text-[13px] text-center" />
              <input value={reason} onChange={e => setReason(e.target.value)} placeholder="السبب" className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px]" />
              <button onClick={adjust} disabled={busy || !amt || !reason.trim()} className="px-3 py-2 rounded-lg bg-zinc-900 text-white font-bold text-[12px] disabled:opacity-50">{busy ? <Loader2 size={13} className="animate-spin" /> : 'تطبيق'}</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
