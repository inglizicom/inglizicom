'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, Loader2, Plus, Receipt, UserPlus, X, XCircle, Wallet } from 'lucide-react'
import { fetchMyClasses, type MyClass } from '@/lib/teachers'
import {
  fetchTeacherAddedStudents, teacherAddStudent, teacherDeclarePayment, uploadReceipt, PAY_METHOD_AR,
  type AddedStudent, type AddStudentResult, type StudentKind,
} from '@/lib/teacher-intake'

/**
 * A teacher adds their own students (059). The student lands in the CRM at
 * once, linked to this teacher; the office reviews them before the student
 * gets their access code. A payment the teacher reports is recorded as
 * pending and only counts once the office confirms it.
 */

const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1']
const METHODS = ['cash', 'bank_transfer', 'wafacash', 'cashplus', 'other']
const INP = 'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-[13.5px] font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15'
const today = () => new Date().toISOString().slice(0, 10)

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" dir="rtl" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-[#1E3A8A]/35 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92dvh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[16px] font-extrabold text-[#1E3A8A]">{title}</h2>
          <button onClick={onClose} aria-label="إغلاق" className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function Label({ text, children, hint }: { text: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-bold text-slate-500 mb-1">{text}</span>
      {children}
      {hint && <span className="block text-[11px] text-slate-400 mt-1">{hint}</span>}
    </label>
  )
}

/** Amount / method / date / reference / receipt photo — shared by both forms. */
function PaymentFields({ v, set }: {
  v: { amount: string; method: string; paidOn: string; reference: string; file: File | null }
  set: (patch: Partial<{ amount: string; method: string; paidOn: string; reference: string; file: File | null }>) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Label text="المبلغ (د.م)">
        <input value={v.amount} onChange={e => set({ amount: e.target.value.replace(/[^\d.]/g, '') })} inputMode="decimal" dir="ltr" className={`${INP} text-left`} placeholder="450" />
      </Label>
      <Label text="طريقة الدفع">
        <select value={v.method} onChange={e => set({ method: e.target.value })} className={INP}>
          {METHODS.map(m => <option key={m} value={m}>{PAY_METHOD_AR[m]}</option>)}
        </select>
      </Label>
      <Label text="تاريخ الدفع">
        <input type="date" value={v.paidOn} onChange={e => set({ paidOn: e.target.value })} className={INP} dir="ltr" />
      </Label>
      <Label text="المرجع (اختياري)">
        <input value={v.reference} onChange={e => set({ reference: e.target.value })} className={INP} dir="ltr" placeholder="رقم العملية" />
      </Label>
      <div className="col-span-2">
        <Label text="صورة الوصل (اختياري)" hint="تراها الإدارة فقط، وتساعد على تأكيد الدفعة بسرعة.">
          {/* The browser's own file button speaks English — draw ours, keep the input for the picker. */}
          <span className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3.5 py-2.5 cursor-pointer hover:border-blue-400">
            <span className="shrink-0 rounded-lg bg-blue-50 px-3 py-1.5 text-[12px] font-bold text-blue-700">اختيار صورة</span>
            <span className="min-w-0 truncate text-[12.5px] text-slate-500" dir="auto">{v.file ? v.file.name : 'لم يتم اختيار أي ملف'}</span>
            <input type="file" accept="image/*,application/pdf" onChange={e => set({ file: e.target.files?.[0] ?? null })} className="sr-only" />
          </span>
        </Label>
      </div>
    </div>
  )
}

const emptyPay = () => ({ amount: '', method: 'cash', paidOn: today(), reference: '', file: null as File | null })

export function AddStudentModal({ teacherId, demo, onClose, onAdded }: {
  teacherId: string; demo: boolean; onClose: () => void; onAdded: () => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [level, setLevel] = useState('A1')
  const [kind, setKind] = useState<StudentKind>('group')
  const [classId, setClassId] = useState('')
  const [note, setNote] = useState('')
  const [withPay, setWithPay] = useState(false)
  const [pay, setPay] = useState(emptyPay)
  const [classes, setClasses] = useState<MyClass[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<AddStudentResult | null>(null)

  useEffect(() => { if (!demo) fetchMyClasses().then(cs => setClasses(cs.filter(c => c.status === 'active'))) }, [demo])

  async function submit() {
    setError(null)
    if (demo) { setError('معاينة فقط — لا يُحفظ شيء.'); return }
    if (name.trim().length < 2) { setError('أدخل اسم الطالب الكامل.'); return }
    if (phone.replace(/\D/g, '').length < 9) { setError('أدخل رقم هاتف صحيحًا.'); return }
    if (withPay && !(Number(pay.amount) > 0)) { setError('أدخل مبلغ الدفعة أو ألغِ خيار الدفعة.'); return }
    setBusy(true)
    try {
      const r = await teacherAddStudent({ fullName: name.trim(), phone: phone.trim(), level, kind, classId: classId || null, note: note.trim() || null })
      if (withPay) {
        const receiptPath = pay.file ? await uploadReceipt(teacherId, pay.file) : null
        await teacherDeclarePayment({ studentId: r.student_id, amount: Number(pay.amount), method: pay.method, paidOn: pay.paidOn, reference: pay.reference || null, receiptPath })
      }
      setDone(r); onAdded()
    } catch (e: any) { setError(e?.message ?? 'تعذّر الحفظ.') }
    finally { setBusy(false) }
  }

  if (done) {
    return (
      <Sheet title="تمت الإضافة" onClose={onClose}>
        <div className="space-y-4 text-center">
          <span className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={28} /></span>
          <p className="text-[14px] font-bold text-[#1E3A8A]">
            {done.result === 'linked'
              ? 'هذا الطالب مسجّل مسبقًا في إنجليزي.كوم — تم ربطه بك مباشرة.'
              : 'أُضيف الطالب إلى قائمتك وإلى قاعدة الإدارة.'}
          </p>
          {done.review_status === 'pending' && (
            <p className="text-[12.5px] text-slate-500">ستراجع الإدارة بياناته ثم ترسل له رمز الدخول إلى فضاء الطالب.</p>
          )}
          {done.seat === 'waitlisted' && <p className="text-[12.5px] font-bold text-amber-700">القسم ممتلئ — وُضع الطالب في قائمة الانتظار.</p>}
          {done.seat && done.seat.startsWith('seat_refused') && <p className="text-[12.5px] font-bold text-red-600">تعذّر إدخاله إلى القسم: القسم غير مفتوح أو ممتلئ.</p>}
          {withPay && <p className="text-[12.5px] text-slate-500">الدفعة مسجّلة «بانتظار التأكيد» حتى تؤكدها الإدارة.</p>}
          <button onClick={onClose} className="w-full py-3 rounded-xl bg-gradient-to-l from-blue-600 to-blue-800 text-white text-[13.5px] font-bold">تم</button>
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet title="إضافة طالب" onClose={onClose}>
      <div className="space-y-3.5">
        <Label text="الاسم الكامل"><input value={name} onChange={e => setName(e.target.value)} className={INP} placeholder="مثال: هبة العلوي" /></Label>
        <Label text="رقم الهاتف (واتساب)" hint="إن كان الرقم مسجّلًا من قبل، يُربط الطالب بك بدل إنشاء نسخة ثانية.">
          <input value={phone} onChange={e => setPhone(e.target.value)} className={`${INP} text-left`} dir="ltr" inputMode="tel" placeholder="06 12 34 56 78" />
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <Label text="المستوى">
            <select value={level} onChange={e => setLevel(e.target.value)} className={INP}>{LEVELS.map(l => <option key={l}>{l}</option>)}</select>
          </Label>
          <Label text="نوع الدراسة">
            <select value={kind} onChange={e => setKind(e.target.value as StudentKind)} className={INP}>
              <option value="group">جماعي</option><option value="private">فردي</option>
            </select>
          </Label>
        </div>
        {classes.length > 0 && (
          <Label text="إدخاله إلى أحد أقسامي (اختياري)">
            <select value={classId} onChange={e => setClassId(e.target.value)} className={INP}>
              <option value="">— بدون قسم الآن —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.title}{c.level ? ` · ${c.level}` : ''}</option>)}
            </select>
          </Label>
        )}
        <Label text="ملاحظة للإدارة (اختياري)"><input value={note} onChange={e => setNote(e.target.value)} className={INP} placeholder="مثال: يريد حصتين في الأسبوع" /></Label>

        <label className="flex items-center gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-3 cursor-pointer">
          <input type="checkbox" checked={withPay} onChange={e => setWithPay(e.target.checked)} className="w-4 h-4 accent-amber-500" />
          <span className="text-[13px] font-bold text-amber-900">الطالب دفع لي مبلغًا</span>
        </label>
        {withPay && <PaymentFields v={pay} set={p => setPay(prev => ({ ...prev, ...p }))} />}

        {error && <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-[13px] font-bold text-red-700">{error}</div>}
        <button onClick={submit} disabled={busy}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-l from-amber-400 to-yellow-500 text-[#1E3A8A] text-[14px] font-bold ring-1 ring-amber-300 shadow-lg shadow-amber-500/25 disabled:opacity-50">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} إضافة الطالب
        </button>
      </div>
    </Sheet>
  )
}

export function DeclarePaymentModal({ teacherId, student, demo, onClose, onDone }: {
  teacherId: string; student: { id: string; full_name: string }; demo: boolean; onClose: () => void; onDone: () => void
}) {
  const [pay, setPay] = useState(emptyPay)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function submit() {
    setError(null)
    if (demo) { setError('معاينة فقط — لا يُحفظ شيء.'); return }
    if (!(Number(pay.amount) > 0)) { setError('أدخل مبلغًا صحيحًا.'); return }
    setBusy(true)
    try {
      const receiptPath = pay.file ? await uploadReceipt(teacherId, pay.file) : null
      await teacherDeclarePayment({ studentId: student.id, amount: Number(pay.amount), method: pay.method, paidOn: pay.paidOn, reference: pay.reference || null, receiptPath })
      onDone()
    } catch (e: any) { setError(e?.message ?? 'تعذّر الحفظ.') }
    finally { setBusy(false) }
  }
  return (
    <Sheet title={`دفعة من ${student.full_name}`} onClose={onClose}>
      <div className="space-y-3.5">
        <p className="text-[12.5px] text-slate-500">تُسجَّل «بانتظار التأكيد» وتُحتسب بعد أن تؤكدها الإدارة.</p>
        <PaymentFields v={pay} set={p => setPay(prev => ({ ...prev, ...p }))} />
        {error && <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-[13px] font-bold text-red-700">{error}</div>}
        <button onClick={submit} disabled={busy}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-l from-blue-600 to-blue-800 text-white text-[14px] font-bold disabled:opacity-50">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Receipt size={16} />} تسجيل الدفعة
        </button>
      </div>
    </Sheet>
  )
}

const REVIEW_PILL: Record<AddedStudent['review_status'], { text: string; cls: string; icon: typeof Clock }> = {
  pending:  { text: 'بانتظار مراجعة الإدارة', cls: 'bg-amber-50 text-amber-700 ring-amber-200', icon: Clock },
  approved: { text: 'مقبول — توصّل برمز الدخول', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: CheckCircle2 },
  rejected: { text: 'مرفوض', cls: 'bg-red-50 text-red-700 ring-red-200', icon: XCircle },
}
const mad = (n: number) => `${Math.round(n).toLocaleString('en-US')} د.م`

/** "Students I added": their review status, what was paid, what waits for confirmation. */
export function AddedStudentsPanel({ teacherId, demo, refreshKey, onAdd }: {
  teacherId: string; demo: boolean; refreshKey: number; onAdd: () => void
}) {
  const [rows, setRows] = useState<AddedStudent[] | null>(null)
  const [paying, setPaying] = useState<AddedStudent | null>(null)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (demo) { setRows([]); return }
    fetchTeacherAddedStudents().then(setRows).catch(() => setRows([]))
  }, [demo, refreshKey, tick])

  const total = (rows ?? []).reduce((s, r) => s + r.paid, 0)
  const waiting = (rows ?? []).reduce((s, r) => s + r.pending, 0)

  return (
    <section className="rounded-[22px] bg-white ring-1 ring-[#D6DFEC] shadow-[0_1px_3px_rgba(30,58,138,.10),0_12px_32px_-10px_rgba(30,58,138,.26)] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-[16px] font-extrabold text-[#1E3A8A]">طلاب أضفتهم</h2>
          <p className="text-[12px] text-slate-500">تظهر عند الإدارة مباشرة · تُحتسب لك كل دفعة تؤكدها الإدارة</p>
        </div>
        <button onClick={onAdd}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-l from-amber-400 to-yellow-500 text-[#1E3A8A] text-[13px] font-bold ring-1 ring-amber-300 shadow-md shadow-amber-500/25">
          <Plus size={16} /> إضافة طالب
        </button>
      </div>
      {rows && rows.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-center"><div className="text-[11px] font-bold text-slate-400">طلاب</div><div className="text-[17px] font-extrabold text-[#1E3A8A]">{rows.length}</div></div>
          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-center"><div className="text-[11px] font-bold text-emerald-600">مؤكَّد</div><div className="text-[15px] font-extrabold text-emerald-700"><bdi>{mad(total)}</bdi></div></div>
          <div className="rounded-xl bg-amber-50 px-3 py-2 text-center"><div className="text-[11px] font-bold text-amber-600">بانتظار التأكيد</div><div className="text-[15px] font-extrabold text-amber-700"><bdi>{mad(waiting)}</bdi></div></div>
        </div>
      )}
      {rows === null ? (
        <div className="py-6 flex justify-center text-slate-300"><Loader2 className="animate-spin" size={18} /></div>
      ) : rows.length === 0 ? (
        <p className="py-4 text-center text-[13px] text-slate-400">لم تضف أي طالب بعد. كل طالب تضيفه يصل إلى الإدارة مرتبطًا بك.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map(r => {
            const pill = REVIEW_PILL[r.review_status]
            return (
              <li key={r.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-bold text-[#1E3A8A] truncate">{r.full_name}</div>
                  <div className="text-[11.5px] text-slate-400"><bdi dir="ltr">{r.phone ?? '—'}</bdi>{r.level ? ` · ${r.level}` : ''} · {r.kind === 'private' ? 'فردي' : 'جماعي'}</div>
                  <span className={`mt-1 inline-flex items-center gap-1 rounded-full ring-1 px-2 py-0.5 text-[11px] font-bold ${pill.cls}`}>
                    <pill.icon size={12} /> {pill.text}{r.review_status === 'rejected' && r.review_note ? ` — ${r.review_note}` : ''}
                  </span>
                </div>
                <div className="text-left text-[12px] leading-tight">
                  {r.paid > 0 && <div className="font-extrabold text-emerald-700"><bdi>{mad(r.paid)}</bdi></div>}
                  {r.pending > 0 && <div className="font-bold text-amber-600"><bdi>{mad(r.pending)}</bdi> بانتظار</div>}
                </div>
                {r.review_status !== 'rejected' && (
                  <button onClick={() => setPaying(r)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl ring-1 ring-blue-200 text-blue-700 text-[12px] font-bold hover:bg-blue-50">
                    <Wallet size={14} /> تسجيل دفعة
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {paying && (
        <DeclarePaymentModal teacherId={teacherId} student={paying} demo={demo}
          onClose={() => setPaying(null)} onDone={() => { setPaying(null); setTick(t => t + 1) }} />
      )}
    </section>
  )
}
