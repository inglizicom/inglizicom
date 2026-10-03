'use client'

import { useState } from 'react'
import { Check, Copy, Eye, EyeOff, GraduationCap, Headset, Loader2, RefreshCw } from 'lucide-react'
import { ErrorNote, Field, INP, Modal } from '@/components/crm/kit'
import { createAssistant, searchProfiles, setProfileRole } from '@/lib/staff-db'
import { createTeacher, TeacherEmailTakenError } from '@/lib/teachers'
import { logActivity } from '@/lib/activity-log-db'
import { setPaySettings } from '@/lib/founder'

/**
 * Add someone to the team: an assistant (CRM access) or a teacher (teacher
 * space). Creates the login with an email and a password the founder hands
 * over, so the person never has to sign up. If the email already has an
 * account, offer to promote that account instead of failing.
 *
 * Account creation runs server-side (service role, no staff JWT), so the
 * database trail cannot see who did it — that one action is logged from here.
 */
type Kind = 'assistant' | 'teacher'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
function genPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const arr = new Uint32Array(12)
  crypto.getRandomValues(arr)
  return Array.from(arr, n => chars[n % chars.length]).join('')
}

export default function AddMember({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [kind, setKind] = useState<Kind>('assistant')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState(genPassword)
  const [show, setShow] = useState(true)
  const [salary, setSalary] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existing, setExisting] = useState<{ role: string; name: string | null } | null>(null)
  const [done, setDone] = useState(false)
  const [copied, setCopied] = useState(false)
  const [promoted, setPromoted] = useState(false)

  async function afterCreate(id: string, how: 'created' | 'promoted') {
    await logActivity({
      action: kind === 'teacher' ? 'teacher_created' : 'assistant_created', entityType: 'profile', entityId: id,
      after: { role: kind }, metadata: { email: email.trim().toLowerCase(), how },
    }).catch(() => {})
    const n = Number(salary)
    if (kind === 'assistant' && salary && Number.isFinite(n) && n > 0) {
      await setPaySettings(id, n).catch(() => {})   // needs 057; the salary can be set later on the card
    }
    setPromoted(how === 'promoted')
    setDone(true)
    onAdded()
  }

  async function submit(convert = false) {
    setError(null)
    if (!EMAIL_RE.test(email.trim())) { setError('أدخل بريدًا إلكترونيًا صحيحًا.'); return }
    if (!convert && password.length < 8) { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل.'); return }
    setBusy(true)
    try {
      if (kind === 'teacher') {
        const { id } = await createTeacher(email.trim(), password, name.trim() || undefined, convert)
        await afterCreate(id, convert ? 'promoted' : 'created')
      } else if (convert) {
        const match = (await searchProfiles(email.trim())).find(p => (p.email ?? '').toLowerCase() === email.trim().toLowerCase())
        if (!match) throw new Error('لم نجد الحساب الموجود بهذا البريد.')
        await setProfileRole(match.id, 'assistant')
        await afterCreate(match.id, 'promoted')
      } else {
        const { id } = await createAssistant(email.trim(), password, name.trim() || undefined)
        await afterCreate(id, 'created')
      }
      setExisting(null)
    } catch (e: any) {
      if (e instanceof TeacherEmailTakenError) {
        setExisting({ role: e.existingRole, name: e.existingName })
      } else if (/already exists|already.*registered|Promote existing/i.test(e?.message ?? '')) {
        setExisting({ role: 'حساب موجود', name: null })
      } else {
        setError(e?.message ?? 'تعذّر إنشاء الحساب.')
      }
    } finally { setBusy(false) }
  }

  const login = kind === 'teacher' ? 'https://teacher.inglizi.com/teacher/login' : 'https://admin.inglizi.com'
  const handover = `مرحبًا ${name || ''}\nحسابك في إنجليزي.كوم جاهز:\n${login}\nالبريد: ${email.trim()}\nكلمة المرور: ${password}`

  if (done) {
    return (
      <Modal title="تمت الإضافة" onClose={onClose}>
        <div className="space-y-4">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-[13px] text-emerald-900">
            <b>{name || email}</b> أصبح {kind === 'teacher' ? 'أستاذًا' : 'مساعدًا'} في الفريق. أرسل له بيانات الدخول:
          </div>
          {promoted ? (
            <p className="text-[12.5px] text-zinc-600">يدخل بنفس البريد وكلمة المرور التي يستعملها حاليًا: <bdi dir="ltr">{login}</bdi></p>
          ) : (
            <pre dir="rtl" className="whitespace-pre-wrap rounded-xl bg-zinc-50 border border-zinc-200 p-3 text-[12.5px] text-zinc-800 font-sans">{handover}</pre>
          )}
          <div className="flex gap-2">
            {!promoted && <button onClick={async () => { await navigator.clipboard.writeText(handover).catch(() => {}); setCopied(true) }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-l from-blue-600 to-blue-800 text-white text-[13px] font-bold">
              {copied ? <><Check size={14} /> نُسخ</> : <><Copy size={14} /> نسخ بيانات الدخول</>}
            </button>}
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-zinc-200 text-[13px] font-bold text-zinc-500">إغلاق</button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="إضافة عضو إلى الفريق" onClose={onClose}>
      <div className="space-y-4">
        {/* kind */}
        <div className="grid grid-cols-2 gap-2">
          {([['assistant', 'مساعد(ة)', 'يدخل إلى الـCRM', Headset], ['teacher', 'أستاذ(ة)', 'يدخل إلى فضاء الأساتذة', GraduationCap]] as const).map(([k, label, note, Icon]) => (
            <button key={k} type="button" onClick={() => { setKind(k); setExisting(null); setError(null) }}
                    className={`rounded-2xl border p-3 text-right transition-colors ${kind === k ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-zinc-200 hover:border-blue-300'}`}>
              <Icon size={18} className={kind === k ? 'text-blue-600' : 'text-zinc-400'} />
              <div className="mt-1 text-[13.5px] font-extrabold text-zinc-900">{label}</div>
              <div className="text-[11px] text-zinc-500">{note}</div>
            </button>
          ))}
        </div>

        <Field label="الاسم الكامل">
          <input value={name} onChange={e => setName(e.target.value)} className={INP} placeholder="مثال: فاطمة الزهراء" />
        </Field>
        <Field label="البريد الإلكتروني (لتسجيل الدخول)">
          <input value={email} onChange={e => { setEmail(e.target.value); setExisting(null) }} className={`${INP} text-left`} dir="ltr" type="email" placeholder="name@gmail.com" />
        </Field>
        <Field label="كلمة المرور" hint="ستعطيها للشخص؛ يمكنه تغييرها لاحقًا.">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input value={password} onChange={e => setPassword(e.target.value)} type={show ? 'text' : 'password'} dir="ltr" className={`${INP} text-left pr-9`} />
              <button type="button" onClick={() => setShow(s => !s)} aria-label="إظهار"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400">{show ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>
            <button type="button" onClick={() => setPassword(genPassword())} aria-label="توليد كلمة مرور"
                    className="w-10 shrink-0 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-blue-700 hover:border-blue-300"><RefreshCw size={15} /></button>
          </div>
        </Field>
        {kind === 'assistant' && (
          <Field label="الراتب الشهري (اختياري)" hint="يمكن تعديله لاحقًا من بطاقة المساعد.">
            <input value={salary} onChange={e => setSalary(e.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" dir="ltr" className={`${INP} text-left`} placeholder="3000" />
          </Field>
        )}

        {existing && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-[12.5px] text-amber-900 space-y-2">
            <div>هذا البريد مسجّل مسبقًا{existing.name ? ` باسم «${existing.name}»` : ''}{existing.role && existing.role !== 'حساب موجود' ? ` (${existing.role})` : ''}.
              يمكنك تحويل هذا الحساب نفسه إلى {kind === 'teacher' ? 'أستاذ' : 'مساعد'} — يحتفظ بكلمة مروره الحالية.</div>
            <button onClick={() => submit(true)} disabled={busy}
                    className="w-full py-2 rounded-lg bg-amber-500 text-white text-[12.5px] font-bold disabled:opacity-50">
              {busy ? <Loader2 size={13} className="animate-spin inline" /> : 'تحويل الحساب الموجود'}
            </button>
          </div>
        )}

        <ErrorNote>{error}</ErrorNote>

        <div className="flex gap-2">
          <button onClick={() => submit(false)} disabled={busy || !!existing}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-l from-amber-400 to-yellow-500 text-[#1E3A8A] text-[13px] font-bold ring-1 ring-amber-300 disabled:opacity-50">
            {busy && <Loader2 size={14} className="animate-spin" />} إنشاء الحساب
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-zinc-200 text-[13px] font-bold text-zinc-500">تراجع</button>
        </div>
      </div>
    </Modal>
  )
}
