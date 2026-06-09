'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight, User, Phone, BookOpen, Link2, StickyNote, Check,
  Loader2, Crown, Lightbulb, ChevronLeft, MessageCircle, Mail,
} from 'lucide-react'

import { useStaff } from '@/lib/staff-context'
import { createManualLead, patchLead, LEAD_STATUS_META, type LeadStatus } from '@/lib/leads-db'
import { LEAD_SOURCES, LEAD_COURSES, PLAN_PRESETS } from '@/lib/crm-types'
import { logLeadEvent } from '@/lib/crm-db'
import { logActivity } from '@/lib/activity-log-db'
import { fetchStaff, type StaffRow } from '@/lib/staff-db'

const STEPS = [
  { id: 1, label: 'المعلومات الأساسية', icon: User },
  { id: 2, label: 'معلومات التواصل',    icon: Phone },
  { id: 3, label: 'دورة واهتمامات',      icon: BookOpen },
  { id: 4, label: 'مصدر العميل',        icon: Link2 },
  { id: 5, label: 'ملاحظات إضافية',      icon: StickyNote },
] as const

const ACTIVE_STATUSES: LeadStatus[] = ['new', 'contacted', 'interested', 'follow_up', 'confirmed', 'delayed']
const inp = 'w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white transition'

export default function NewLeadPage() {
  const router = useRouter()
  const staff  = useStaff()

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // form state
  const [fullName, setFullName] = useState('')
  const [gender,   setGender]   = useState('')
  const [birth,    setBirth]    = useState('')
  const [phone,    setPhone]    = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email,    setEmail]    = useState('')
  const [city,     setCity]     = useState('')
  const [course,   setCourse]   = useState('a1a2')
  const [level,    setLevel]    = useState('')
  const [planId,   setPlanId]   = useState<string>(PLAN_PRESETS[1].id)
  const [amount,   setAmount]   = useState<number>(PLAN_PRESETS[1].amount)
  const [interests,setInterests]= useState('')
  const [source,   setSource]   = useState('instagram')
  const [status,   setStatus]   = useState<LeadStatus>('new')
  const [notes,    setNotes]    = useState('')
  const [isVip,    setIsVip]    = useState(false)
  const [assignSelf, setAssignSelf] = useState(true)
  const [assigneeId, setAssigneeId] = useState<string>(staff.id)
  const [staffList, setStaffList] = useState<StaffRow[]>([])

  useEffect(() => { fetchStaff().then(setStaffList) }, [])
  useEffect(() => { const p = PLAN_PRESETS.find(p => p.id === planId); if (p) setAmount(p.amount) }, [planId])

  const canSave = fullName.trim().length > 0

  async function doSave(): Promise<string | null> {
    setError('')
    if (!canSave) { setError('الاسم الكامل مطلوب'); setStep(1); return null }
    setSaving(true)
    try {
      const extra: string[] = []
      if (email)  extra.push(`البريد: ${email}`)
      if (gender) extra.push(`الجنس: ${gender}`)
      if (birth)  extra.push(`تاريخ الميلاد: ${birth}`)
      if (whatsapp && whatsapp !== phone) extra.push(`واتساب: ${whatsapp}`)
      if (interests) extra.push(`اهتمامات: ${interests}`)
      const fullNotes = [notes.trim(), extra.join(' · ')].filter(Boolean).join('\n')

      const id = await createManualLead({
        fullName: fullName.trim(), phone: phone.trim() || whatsapp.trim() || undefined,
        city: city.trim() || undefined, source, planId, amountMad: amount,
        status, notes: fullNotes || undefined, isVip,
        courseInterested: course, assignedToId: assignSelf ? staff.id : (assigneeId || null),
      })
      await patchLead(id, { course, lead_type: 'course', lead_source: source, level: level || null } as any)
      await logLeadEvent({ leadId: id, eventType: 'created', title: `أُنشئ بواسطة ${staff.email}` })
      await logActivity({ action: 'lead_created', entityType: 'lead', entityId: id,
        after: { status, source, amount_mad: amount }, metadata: { by: staff.email } })
      return id
    } catch (err: any) { setError(err?.message ?? 'تعذّر الحفظ'); return null }
    finally { setSaving(false) }
  }

  async function saveAndClose() { const id = await doSave(); if (id) router.push('/sales/workspace') }
  async function saveAndFollow() { const id = await doSave(); if (id) router.push('/sales/workspace?tab=followups') }
  async function saveAndAnother() {
    const id = await doSave()
    if (id) { setFullName(''); setPhone(''); setWhatsapp(''); setEmail(''); setCity(''); setNotes(''); setBirth(''); setGender(''); setInterests(''); setIsVip(false); setStep(1) }
  }

  const sourceMeta = LEAD_SOURCES.find(s => s.id === source)
  const courseMeta = LEAD_COURSES.find(c => c.id === course)

  return (
    <div className="p-4 lg:p-6">
      <Link href="/sales/workspace" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-zinc-500 hover:text-zinc-800 mb-4">
        <ArrowRight size={15} /> العودة إلى قائمة العملاء
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_280px] gap-4">

        {/* ── Step nav ─────────────────────────────────── */}
        <div className="space-y-4 order-2 lg:order-1">
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-4">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">خطوات الإضافة</div>
            <div className="space-y-1">
              {STEPS.map(s => {
                const active = step === s.id
                const done   = step > s.id
                return (
                  <button key={s.id} onClick={() => setStep(s.id)}
                    className={[
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors text-right',
                      active ? 'bg-yellow-50 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50',
                    ].join(' ')}>
                    <span className={[
                      'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0',
                      active ? 'bg-yellow-400 text-black' : done ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-400',
                    ].join(' ')}>
                      {done ? <Check size={13} /> : s.id}
                    </span>
                    <span className="flex-1">{s.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tip */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-2.5">
            <Lightbulb size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-amber-800 leading-relaxed">
              كلّما أضفت معلومات أكثر، كانت المتابعة أسهل وأسرع. بعد الحفظ يمكنك إضافة متابعة مباشرة.
            </p>
          </div>
        </div>

        {/* ── Form ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 lg:p-6 min-h-[420px] order-1 lg:order-2">
          {/* Step 1 */}
          {step === 1 && (
            <Section icon={User} title="المعلومات الأساسية" sub="أدخل المعلومات الأساسية للعميل">
              <Field label="الاسم الكامل" required>
                <input autoFocus value={fullName} onChange={e => setFullName(e.target.value)} placeholder="مثال: أحمد محمد" className={inp} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="الجنس">
                  <select value={gender} onChange={e => setGender(e.target.value)} className={inp}>
                    <option value="">اختر الجنس</option>
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </Field>
                <Field label="تاريخ الميلاد (اختياري)">
                  <input type="date" value={birth} onChange={e => setBirth(e.target.value)} className={inp} dir="ltr" />
                </Field>
              </div>
              <Field label="المدينة">
                <input value={city} onChange={e => setCity(e.target.value)} placeholder="الدار البيضاء، الرباط..." className={inp} />
              </Field>
            </Section>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <Section icon={Phone} title="معلومات التواصل" sub="طرق التواصل مع العميل">
              <Field label="رقم الهاتف" required>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+212 6 00 00 00 00" inputMode="tel" className={inp} dir="ltr" />
              </Field>
              <Field label="واتساب (إن اختلف)">
                <div className="relative">
                  <MessageCircle size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-green-500" />
                  <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+212 6 00 00 00 00" className={`${inp} pr-9`} dir="ltr" />
                </div>
              </Field>
              <Field label="البريد الإلكتروني (اختياري)">
                <div className="relative">
                  <Mail size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-zinc-400" />
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="example@gmail.com" className={`${inp} pr-9`} dir="ltr" />
                </div>
              </Field>
            </Section>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <Section icon={BookOpen} title="الدورة والاهتمامات" sub="الدورة أو الخدمة التي يهتم بها العميل">
              <Field label="الدورة المهتم بها" required>
                <div className="grid grid-cols-2 gap-2">
                  {LEAD_COURSES.map(c => (
                    <button key={c.id} type="button" onClick={() => setCourse(c.id)}
                      className={`px-3 py-2.5 rounded-xl border text-[13px] font-semibold text-right transition ${course === c.id ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="المستوى الحالي">
                  <select value={level} onChange={e => setLevel(e.target.value)} className={inp}>
                    <option value="">اختر المستوى</option>
                    {['A0','A1','A2','B1','B2'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </Field>
                <Field label="الخطة / المبلغ">
                  <select value={planId} onChange={e => setPlanId(e.target.value)} className={inp}>
                    {PLAN_PRESETS.map(p => <option key={p.id} value={p.id}>{p.label} — {p.amount} د.م</option>)}
                  </select>
                </Field>
              </div>
              <Field label="المبلغ المتوقع (د.م)">
                <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className={inp} dir="ltr" />
              </Field>
              <Field label="تفاصيل إضافية عن الاهتمامات (اختياري)">
                <textarea value={interests} onChange={e => setInterests(e.target.value)} rows={2} placeholder="أهداف العميل، توقيت الدراسة..." className={`${inp} resize-none`} />
              </Field>
            </Section>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <Section icon={Link2} title="مصدر العميل" sub="من أين تعرّف العميل علينا؟">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {LEAD_SOURCES.filter(s => s.id !== 'manual').map(s => (
                  <button key={s.id} type="button" onClick={() => setSource(s.id)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border text-[13px] font-semibold transition ${source === s.id ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}>
                    <span className="text-[22px] leading-none">{s.emoji}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
              <Field label="الحالة الأولية">
                <div className="grid grid-cols-3 gap-2">
                  {ACTIVE_STATUSES.map(s => (
                    <button key={s} type="button" onClick={() => setStatus(s)}
                      className={`px-2.5 py-2 rounded-xl border text-[12px] font-semibold transition ${status === s ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}>
                      {LEAD_STATUS_META[s].short}
                    </button>
                  ))}
                </div>
              </Field>
            </Section>
          )}

          {/* Step 5 */}
          {step === 5 && (
            <Section icon={StickyNote} title="ملاحظات وتفاصيل إضافية" sub="معلومات تساعد في المتابعة">
              <Field label="ملاحظات">
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="اكتب ملاحظاتك هنا..." className={`${inp} resize-none`} />
              </Field>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div onClick={() => setIsVip(v => !v)} className={`w-10 h-5 rounded-full transition flex items-center ${isVip ? 'bg-yellow-400' : 'bg-zinc-200'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow mx-0.5 transition-transform ${isVip ? '-translate-x-5' : ''}`} />
                </div>
                <span className="text-[13px] font-semibold text-zinc-700 flex items-center gap-1"><Crown size={14} className="text-rose-500" /> تمييز كـ VIP</span>
              </label>

              <Field label="تعيين مسؤول">
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input type="checkbox" checked={assignSelf} onChange={e => setAssignSelf(e.target.checked)} className="accent-yellow-400" />
                  <span className="text-[13px] text-zinc-600">تعيينه لي</span>
                </label>
                {!assignSelf && (
                  <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className={inp}>
                    <option value="">اختر المسؤول</option>
                    {staffList.map(s => <option key={s.id} value={s.id}>{s.email?.split('@')[0]}</option>)}
                  </select>
                )}
              </Field>
            </Section>
          )}

          {error && <p className="text-[13px] text-red-600 font-medium mt-4">{error}</p>}

          {/* Step nav buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-100">
            <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold text-zinc-500 hover:bg-zinc-50 disabled:opacity-40">السابق</button>
            {step < 5 ? (
              <button onClick={() => setStep(s => Math.min(5, s + 1))}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-bold hover:bg-black">
                التالي <ChevronLeft size={15} />
              </button>
            ) : (
              <button onClick={saveAndClose} disabled={saving || !canSave}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 text-white text-[13px] font-bold hover:bg-emerald-600 disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={15} />} حفظ العميل
              </button>
            )}
          </div>
        </div>

        {/* ── Live preview ─────────────────────────────── */}
        <div className="space-y-4 order-3">
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-5">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">ملخص العميل</div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 font-black text-2xl mb-3">
                {fullName.trim()[0] ?? <User size={26} />}
              </div>
              <div className="font-black text-[16px] text-zinc-900">{fullName.trim() || 'عميل جديد'}</div>
              <span className="mt-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                {LEAD_STATUS_META[status]?.short ?? status}
              </span>
            </div>
            <dl className="mt-5 space-y-2.5">
              <PreviewLine label="الهاتف" value={phone || whatsapp || '—'} ltr />
              <PreviewLine label="الدورة" value={courseMeta?.short ?? '—'} />
              <PreviewLine label="المصدر" value={sourceMeta ? `${sourceMeta.emoji} ${sourceMeta.label}` : '—'} />
              <PreviewLine label="المبلغ" value={amount ? `${amount.toLocaleString('en-US')} د.م` : '—'} />
              {isVip && <PreviewLine label="مميّز" value="⭐ VIP" />}
            </dl>
          </div>

          {/* Post-save actions */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 space-y-2">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1 px-1">حفظ بطرق أخرى</div>
            <button onClick={saveAndFollow} disabled={saving || !canSave}
              className="w-full text-right px-3 py-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-[13px] font-semibold text-zinc-700 disabled:opacity-50">
              حفظ وإضافة متابعة
            </button>
            <button onClick={saveAndAnother} disabled={saving || !canSave}
              className="w-full text-right px-3 py-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-[13px] font-semibold text-zinc-700 disabled:opacity-50">
              حفظ وإضافة عميل آخر
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Helpers ────────────────────────────────────────────── */
function Section({ icon: Icon, title, sub, children }: { icon: any; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={17} className="text-zinc-400" />
        <h3 className="text-[16px] font-black text-zinc-900">{title}</h3>
      </div>
      <p className="text-[12px] text-zinc-400 mb-5">{sub}</p>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5">
        {label}{required && <span className="text-red-500 mr-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function PreviewLine({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-zinc-400">{label}</span>
      <span className="text-[13px] font-semibold text-zinc-800" dir={ltr ? 'ltr' : undefined}>{value}</span>
    </div>
  )
}
