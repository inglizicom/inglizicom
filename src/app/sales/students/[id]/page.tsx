'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight, Phone, MessageCircle, Mail, MapPin, Loader2, GraduationCap,
  Wallet, Receipt, CreditCard, Printer, CheckCircle, XCircle, Plus,
  StickyNote, Activity, Edit3, Save, ChevronLeft, CalendarDays, BadgeCheck,
  Clock, BookOpen, FileText, ShieldCheck, Upload, Trash2, ExternalLink, Download, Archive,
} from 'lucide-react'

import { useStaff } from '@/lib/staff-context'
import { type CrmStudent, type CrmPayment, LEAD_COURSES } from '@/lib/crm-types'
import {
  fetchStudentById, fetchCrmPayments, approveCrmPayment, declineCrmPayment,
  createCrmPayment, patchStudent, recordMonthlyPayment, archiveStudent, unarchiveStudent, softDeleteStudent,
} from '@/lib/crm-db'
import {
  fetchReceiptsForStudent, printReceipt, buildReceiptWhatsAppMessage,
  ensurePaymentReceipt, type CrmReceipt,
} from '@/lib/crm-receipts'
import { whatsappLink } from '@/lib/leads-db'
import Avatar from '@/app/sales/_components/Avatar'
import {
  fetchAssignments, addAssignment, deleteAssignment,
  fetchStudentFiles, uploadStudentFile, deleteStudentFile, fileUrl,
  fetchExams, addExam, deleteExam, fetchStudentActivity,
  fetchTemplates, applyTemplateToStudent,
  type StudentAssignment, type StudentFile, type StudentExam, type PathTemplate,
} from '@/lib/student-portal'

const MAD = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n))
const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'

const PAY_STATUS_AR: Record<string, { text: string; cls: string }> = {
  pending:  { text: 'معلق',   cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  paid:     { text: 'مدفوع',  cls: 'bg-green-50 text-green-700 border border-green-200' },
  declined: { text: 'مرفوض', cls: 'bg-red-50 text-red-700 border border-red-200' },
}
const ACTIVITY_LABEL: Record<string, string> = {
  login: 'سجّل الدخول للفضاء', opened_lesson: 'فتح درسًا', opened_exercise: 'فتح تمرينًا',
  completed_exercise: 'أنجز تمرينًا', downloaded_file: 'حمّل ملفًا',
  completed_exam: 'أكمل امتحانًا', viewed_result: 'اطّلع على نتيجة', opened_today_task: 'بدأ مهمة اليوم',
}
const ACTIVITY_ICON: Record<string, string> = {
  login: '🔑', opened_lesson: '📖', opened_exercise: '✏️', completed_exercise: '✅',
  downloaded_file: '📎', completed_exam: '🎓', viewed_result: '📊', opened_today_task: '▶️',
}
const PAYMENT_TYPE_AR: Record<string, string> = {
  course_one_time: 'دورة (مرة واحدة)', private_monthly: 'شهري (خاص)',
}

type Tab = 'overview' | 'payments' | 'exams' | 'progress' | 'notes' | 'activity' | 'files'
const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'نظرة عامة' },
  { id: 'payments', label: 'المدفوعات والفواتير' },
  { id: 'exams',    label: 'الامتحانات' },
  { id: 'progress', label: 'التمارين' },
  { id: 'notes',    label: 'الملاحظات' },
  { id: 'activity', label: 'النشاط داخل المنصة' },
  { id: 'files',    label: 'الملفات' },
]

export default function StudentProfilePage() {
  const params  = useParams()
  const router  = useRouter()
  const staff   = useStaff()
  const id      = String(params?.id ?? '')

  const [student,  setStudent]  = useState<CrmStudent | null>(null)
  const [payments, setPayments] = useState<CrmPayment[]>([])
  const [receipts, setReceipts] = useState<CrmReceipt[]>([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState<Tab>('overview')
  const [payBusy,  setPayBusy]  = useState<string | null>(null)
  const [copied,   setCopied]   = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  // editable student core info
  const [editStudent, setEditStudent] = useState(false)
  const [savingStudent, setSavingStudent] = useState(false)
  const [sName, setSName]   = useState('')
  const [sPhone, setSPhone] = useState('')
  const [sCourse, setSCourse] = useState('')
  const [sType, setSType]   = useState<'course_student' | 'private_student'>('course_student')
  const [sFee, setSFee]     = useState('')
  const [sTotal, setSTotal] = useState('')
  const [sEnroll, setSEnroll] = useState('')
  const [sEnd, setSEnd]     = useState('')
  const [sActive, setSActive] = useState(true)

  // student portal: assignments + files
  const [assignments, setAssignments] = useState<StudentAssignment[]>([])
  const [files,       setFiles]       = useState<StudentFile[]>([])
  const [exams,       setExams]       = useState<StudentExam[]>([])
  const [activity,    setActivity]    = useState<{ event_type: string; entity_title: string | null; created_at: string }[]>([])
  const [aTitle, setATitle] = useState('')
  const [aDesc,  setADesc]  = useState('')
  const [aLink,  setALink]  = useState('')
  const [aCat,   setACat]   = useState('exercise')
  const [aDue,   setADue]   = useState('')
  const [aBusy,  setABusy]  = useState(false)
  const [uploading, setUploading] = useState(false)
  // path templates
  const [templates, setTemplates] = useState<PathTemplate[]>([])
  const [applyId, setApplyId] = useState('')
  const [applying, setApplying] = useState(false)

  // exam form
  const [exTitle, setExTitle] = useState('')
  const [exLevel, setExLevel] = useState('')
  const [exScore, setExScore] = useState('')
  const [exMax,   setExMax]   = useState('100')
  const [exNote,  setExNote]  = useState('')
  const [exBusy,  setExBusy]  = useState(false)

  // portal control (admin message / today lesson / next task / levels / stage)
  const [pcMsg,   setPcMsg]   = useState('')
  const [pcTask,  setPcTask]  = useState('')
  const [pcLesT,  setPcLesT]  = useState('')
  const [pcLesU,  setPcLesU]  = useState('')
  const [pcStage, setPcStage] = useState('')
  const [pcLevel, setPcLevel] = useState('')
  const [pcNext,  setPcNext]  = useState('')
  const [pcBusy,  setPcBusy]  = useState(false)

  // notes
  const [editNote, setEditNote] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  // add payment
  const [showPayForm, setShowPayForm] = useState(false)
  const [payAmt,    setPayAmt]    = useState('')
  const [payType,   setPayType]   = useState<'course_one_time' | 'private_monthly'>('private_monthly')
  const [payNotes,  setPayNotes]  = useState('')
  const [savingPay, setSavingPay] = useState(false)

  useEffect(() => { if (id) load() }, [id])

  async function load() {
    setLoading(true)
    const s = await fetchStudentById(id)
    if (!s) { setLoading(false); return }
    const [p, r, asg, fls] = await Promise.all([
      fetchCrmPayments({ studentId: id }),
      fetchReceiptsForStudent(id),
      fetchAssignments(id),
      fetchStudentFiles(id),
    ])
    const [exm, act, tpl] = await Promise.all([fetchExams(id), fetchStudentActivity(id), fetchTemplates()])
    setStudent(s); setPayments(p); setReceipts(r); setNoteText(s.notes ?? '')
    setAssignments(asg); setFiles(fls); setExams(exm); setActivity(act); setTemplates(tpl)
    // init editable fields
    setSName(s.full_name); setSPhone(s.phone_number ?? ''); setSCourse(s.course ?? '')
    setSType(s.student_type); setSFee(s.monthly_fee_mad ? String(s.monthly_fee_mad) : '')
    setSTotal(s.total_paid_mad ? String(s.total_paid_mad) : '')
    setSEnroll(s.enrollment_date?.slice(0, 10) ?? ''); setSEnd(s.course_end_date?.slice(0, 10) ?? '')
    setSActive(s.is_active)
    // portal control
    setPcMsg(s.admin_message ?? ''); setPcTask(s.next_task ?? '')
    setPcLesT(s.today_lesson_title ?? ''); setPcLesU(s.today_lesson_url ?? '')
    setPcStage(s.learning_stage ?? ''); setPcLevel(s.current_level ?? ''); setPcNext(s.next_level ?? '')
    setLoading(false)
  }

  async function savePortalControl() {
    if (!student) return
    setPcBusy(true)
    await patchStudent(student.id, {
      admin_message: pcMsg || null, next_task: pcTask || null,
      today_lesson_title: pcLesT || null, today_lesson_url: pcLesU || null,
      learning_stage: pcStage || null, current_level: pcLevel || null, next_level: pcNext || null,
    } as any)
    const s = await fetchStudentById(id); if (s) setStudent(s)
    setPcBusy(false)
  }

  async function submitExam() {
    if (!exTitle.trim()) return
    setExBusy(true)
    const score = exScore ? Number(exScore) : undefined
    const max = exMax ? Number(exMax) : 100
    await addExam({
      studentId: id, title: exTitle.trim(), level: exLevel || undefined,
      examDate: new Date().toISOString().slice(0, 10), score, maxScore: max,
      passed: score != null ? (score / max) >= 0.5 : undefined,
      teacherNote: exNote || undefined, createdBy: staff.id,
    })
    setExTitle(''); setExLevel(''); setExScore(''); setExNote('')
    setExams(await fetchExams(id)); setExBusy(false)
  }
  async function removeExam(eid: string) { await deleteExam(eid); setExams(await fetchExams(id)) }

  const [monthBusy, setMonthBusy] = useState(false)
  async function recordMonth() {
    if (!student) return
    const amt = student.monthly_fee_mad ?? 0
    if (!amt) { alert('حدّد الرسوم الشهرية أولًا من تعديل البيانات'); return }
    if (!confirm(`تسجيل دفعة شهرية بقيمة ${amt} د.م لـ ${student.full_name}؟`)) return
    setMonthBusy(true)
    await recordMonthlyPayment({ studentId: student.id, amountMad: amt, approverId: staff.id })
    await load()
    setMonthBusy(false)
  }
  async function doArchive() {
    if (!student) return
    if (student.is_active) {
      if (!confirm('أرشفة الطالب؟ يبقى مسجّلًا لكن تُستبعد إيراداته من اللوحة.')) return
      await archiveStudent(student.id)
    } else { await unarchiveStudent(student.id) }
    const s = await fetchStudentById(id); if (s) setStudent(s)
  }
  async function doRemove() {
    if (!student) return
    if (!confirm('نقل الطالب إلى سلة المحذوفين؟ يمكن استرجاعه بسجلّه كاملًا.')) return
    await softDeleteStudent(student.id, staff.id)
    router.push('/sales/workspace?tab=students')
  }

  async function saveStudent() {
    if (!student) return
    setSavingStudent(true)
    await patchStudent(student.id, {
      full_name: sName.trim() || student.full_name,
      phone_number: sPhone.trim() || null,
      course: sCourse || null,
      student_type: sType,
      monthly_fee_mad: sFee ? Number(sFee) : null,
      total_paid_mad: sTotal ? Number(sTotal) : null,
      enrollment_date: sEnroll || null,
      course_end_date: sEnd || null,
      is_active: sActive,
    } as any)
    const s = await fetchStudentById(id)
    if (s) setStudent(s)
    setSavingStudent(false); setEditStudent(false)
  }

  async function submitAssignment() {
    if (!aTitle.trim()) return
    setABusy(true)
    await addAssignment({ studentId: id, title: aTitle.trim(), description: aDesc.trim() || undefined, linkUrl: aLink.trim() || undefined, category: aCat, dueDate: aDue || undefined, course: student?.course ?? undefined, assignedBy: staff.id })
    setATitle(''); setADesc(''); setALink(''); setADue('')
    setAssignments(await fetchAssignments(id))
    setABusy(false)
  }
  async function applyPath() {
    if (!applyId) return
    const n = await applyTemplateToStudent(id, applyId, staff.id)
    setApplyId('')
    setAssignments(await fetchAssignments(id))
    alert(n > 0 ? `تم تطبيق المسار وإضافة ${n} خطوة` : 'لم تُضف خطوات')
  }
  async function removeAssignment(aid: string) {
    await deleteAssignment(aid); setAssignments(await fetchAssignments(id))
  }
  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    await uploadStudentFile(id, file, staff.id)
    setFiles(await fetchStudentFiles(id))
    setUploading(false)
    e.target.value = ''
  }
  async function removeFile(f: StudentFile) {
    if (!confirm('حذف هذا الملف؟')) return
    await deleteStudentFile(f.id, f.file_path); setFiles(await fetchStudentFiles(id))
  }

  async function reloadPay() {
    const [p, r] = await Promise.all([fetchCrmPayments({ studentId: id }), fetchReceiptsForStudent(id)])
    setPayments(p); setReceipts(r)
  }

  async function saveNote() {
    if (!student) return
    setSavingNote(true)
    await patchStudent(student.id, { notes: noteText } as any)
    setSavingNote(false); setEditNote(false)
    setStudent({ ...student, notes: noteText })
  }

  async function addPayment() {
    if (!student || !payAmt) return
    setSavingPay(true)
    await createCrmPayment({
      studentId: student.id, type: payType,
      courseOrService: student.course ?? undefined,
      amountMad: parseFloat(payAmt), notes: payNotes || undefined,
    })
    setPayAmt(''); setPayNotes(''); setShowPayForm(false)
    await reloadPay(); setSavingPay(false)
  }
  async function approve(pid: string) { setPayBusy(pid); await approveCrmPayment(pid, staff.id); await reloadPay(); setPayBusy(null) }
  async function decline(pid: string) { setPayBusy(pid); await declineCrmPayment(pid); await reloadPay(); setPayBusy(null) }

  /** Ensure a receipt exists for this paid payment, then return it. */
  async function getReceipt(p: CrmPayment): Promise<CrmReceipt | null> {
    const found = receipts.find(r => r.payment_id === p.id)
    if (found) return found
    if (!student) return null
    const r = await ensurePaymentReceipt({
      paymentId: p.id, studentId: student.id, leadId: student.lead_id,
      fullName: student.full_name, phoneNumber: student.phone_number, courseName: student.course,
      paymentType: p.payment_type, amountMad: Number(p.amount_mad),
      paymentDate: p.payment_date, notes: p.notes, issuedById: staff.id,
      verificationToken: student.verification_token,
    })
    if (r) setReceipts(prev => [r, ...prev])
    return r
  }
  function receiptOpts() {
    return {
      token:            student?.verification_token,
      teacherName:      student?.teacher_name,
      subscriptionDate: student?.enrollment_date,
      endDate:          student?.course_end_date,
      issuerName:       staff.email?.split('@')[0],
    }
  }
  async function downloadReceipt(p: CrmPayment) { const r = await getReceipt(p); if (r) printReceipt(r, receiptOpts()) }
  async function sendReceipt(p: CrmPayment) {
    const r = await getReceipt(p)
    if (r && phone) window.open(`https://wa.me/${phone.replace(/\D/g,'')}?text=${buildReceiptWhatsAppMessage(r)}`, '_blank')
  }

  if (loading) {
    return <div className="py-32 flex items-center justify-center text-zinc-300"><Loader2 size={28} className="animate-spin" /></div>
  }
  if (!student) {
    return (
      <div className="p-6 text-center">
        <p className="text-zinc-500 mb-3">لم يُعثر على الطالب</p>
        <Link href="/sales/workspace?tab=students" className="text-blue-600 font-semibold text-sm">← العودة إلى الطلاب</Link>
      </div>
    )
  }

  const phone   = student.phone_number ?? ''
  const paid    = payments.filter(p => p.payment_status === 'paid')
  const pending = payments.filter(p => p.payment_status === 'pending')
  const totalPaid    = paid.reduce((s, p) => s + Number(p.amount_mad), 0) || (student.total_paid_mad ?? 0)
  const outstanding  = pending.reduce((s, p) => s + Number(p.amount_mad), 0)
  const lastPaid     = paid[0]

  const statusBadge = student.payment_status === 'paid'
    ? 'bg-green-50 text-green-700 border-green-200'
    : student.payment_status === 'overdue' ? 'bg-red-50 text-red-600 border-red-200'
    : 'bg-amber-50 text-amber-700 border-amber-200'
  const statusText = student.payment_status === 'paid' ? 'مدفوع بالكامل' : student.payment_status === 'overdue' ? 'متأخر' : 'معلق'

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Back */}
      <Link href="/sales/workspace?tab=students" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-zinc-500 hover:text-zinc-800">
        <ArrowRight size={15} /> العودة إلى قائمة الطلاب
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">

        {/* ── Left column ─────────────────────────────── */}
        <div className="space-y-4">
          {/* Quick info card */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${student.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                ● {student.is_active ? 'نشط' : 'غير نشط'}
              </span>
            </div>
            <dl className="space-y-3">
              <InfoLine icon={CalendarDays} label="تاريخ التسجيل" value={fmtDate(student.enrollment_date)} />
              <InfoLine icon={BookOpen}     label="المستوى / الدورة" value={student.course?.toUpperCase() ?? '—'} />
              <InfoLine icon={GraduationCap} label="نوع الطالب" value={student.student_type === 'course_student' ? 'دورة جماعية' : 'دروس خاصة'} />
              {student.monthly_fee_mad && <InfoLine icon={Wallet} label="الرسوم الشهرية" value={`${MAD(student.monthly_fee_mad)} د.م`} />}
              {student.next_payment_date && <InfoLine icon={Clock} label="الدفع القادم" value={fmtDate(student.next_payment_date)} />}
            </dl>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 space-y-2">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1 px-1">إجراءات سريعة</div>
            {phone && (
              <>
                <a href={`tel:${phone}`} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-[13px] font-semibold text-zinc-700">
                  <Phone size={15} className="text-zinc-400" /> اتصال
                </a>
                <a href={whatsappLink(phone, `مرحبًا ${student.full_name}،`) ?? '#'} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-green-50 hover:bg-green-100 text-[13px] font-semibold text-green-700">
                  <MessageCircle size={15} /> واتساب
                </a>
              </>
            )}
            <button onClick={() => { setTab('payments'); setShowPayForm(true) }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-[13px] font-semibold text-zinc-700">
              <Receipt size={15} className="text-zinc-400" /> فاتورة جديدة
            </button>
          </div>

          {/* Verification token */}
          {student.verification_token && (
            <div className="bg-zinc-900 rounded-2xl p-4 text-white">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-bold uppercase tracking-widest mb-2">
                <ShieldCheck size={13} /> رمز التحقق
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[18px] font-black tracking-[3px] text-yellow-400" dir="ltr">{student.verification_token}</span>
                <button
                  onClick={() => { navigator.clipboard?.writeText(student.verification_token!); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20">
                  {copied ? '✓ نُسخ' : 'نسخ'}
                </button>
              </div>
              {/* QR + one-tap login */}
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&data=${encodeURIComponent(`https://student.inglizi.com/?token=${student.verification_token}`)}`}
                  alt="QR" width={72} height={72} className="w-[72px] h-[72px] rounded-lg bg-white p-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-zinc-400 mb-1.5">دخول الطالب بضغطة واحدة</div>
                  <button
                    onClick={() => { navigator.clipboard?.writeText(`https://student.inglizi.com/?token=${student.verification_token}`); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 1500) }}
                    className="w-full text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-yellow-400 text-black hover:bg-yellow-300">
                    {linkCopied ? '✓ نُسخ الرابط' : 'نسخ رابط الدخول'}
                  </button>
                  <a href={whatsappLink(phone, `🔑 رابط دخولك إلى فضاء الطالب على Inglizi.com:\nhttps://student.inglizi.com/?token=${student.verification_token}`) ?? '#'}
                    target="_blank" rel="noopener noreferrer"
                    className="mt-1.5 w-full block text-center text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20">إرسال عبر واتساب</a>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">يستخدم الطالب الرمز أو يمسح الـ QR للدخول إلى فضائه (الدروس، التمارين، الملفات، النتائج).</p>
            </div>
          )}

          {/* Monthly subscription */}
          {(student.billing_type === 'monthly' || student.student_type === 'private_student') && (
            <div className="bg-white rounded-2xl border border-purple-200 p-4">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-purple-700 mb-3"><CalendarDays size={14} /> الاشتراك الشهري</div>
              <div className="space-y-1.5">
                <InfoLine icon={Wallet} label="الرسوم الشهرية" value={student.monthly_fee_mad ? `${MAD(student.monthly_fee_mad)} د.م` : '—'} />
                <InfoLine icon={CalendarDays} label="بداية الاشتراك" value={fmtDate(student.subscription_start ?? student.enrollment_date)} />
                <InfoLine icon={Clock} label="الدفعة القادمة" value={fmtDate(student.next_payment_date)} />
              </div>
              {(() => {
                const overdue = student.next_payment_date && new Date(student.next_payment_date) < new Date()
                return (
                  <div className={`mt-2 text-[11px] font-bold px-2 py-1 rounded-lg text-center ${overdue ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                    {overdue ? '⚠ مستحق — بانتظار دفعة هذا الشهر' : '✓ الاشتراك ساري'}
                  </div>
                )
              })()}
              <button onClick={recordMonth} disabled={monthBusy}
                className="w-full mt-3 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-purple-700 disabled:opacity-50">
                {monthBusy ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> تسجيل دفعة الشهر</>}
              </button>
            </div>
          )}

          {/* Archive / Remove */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 space-y-2">
            <button onClick={doArchive}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[13px] font-semibold text-amber-700">
              <Archive size={15} /> {student.is_active ? 'أرشفة الطالب' : 'تفعيل الطالب'}
            </button>
            <button onClick={doRemove}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-[13px] font-semibold text-red-600">
              <Trash2 size={15} /> نقل إلى سلة المحذوفين
            </button>
          </div>
        </div>

        {/* ── Main column ─────────────────────────────── */}
        <div className="space-y-4 min-w-0">

          {/* Header card */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-5">
            <div className="flex items-start gap-4">
              <Avatar name={student.full_name} size={64} square />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[20px] font-black text-zinc-900">{student.full_name}</h2>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${student.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                    {student.is_active ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
                <p className="text-[13px] text-zinc-500 mt-0.5">
                  طالب في {student.student_type === 'private_student' ? 'دروس خاصة' : `دورة ${student.course?.toUpperCase() ?? ''}`}
                </p>
                <div className="flex items-center gap-4 mt-2 text-[13px] text-zinc-500 flex-wrap">
                  {phone && <span className="inline-flex items-center gap-1" dir="ltr"><Phone size={13} /> {phone}</span>}
                </div>
              </div>
              <button onClick={() => setEditStudent(v => !v)}
                className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 flex-shrink-0">
                <Edit3 size={13} /> {editStudent ? 'إلغاء' : 'تعديل البيانات'}
              </button>
            </div>

            {/* Edit panel */}
            {editStudent && (
              <div className="mt-4 pt-4 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SField label="الاسم الكامل"><input value={sName} onChange={e => setSName(e.target.value)} className={SINP} /></SField>
                <SField label="الهاتف"><input value={sPhone} onChange={e => setSPhone(e.target.value)} dir="ltr" className={`${SINP} text-right`} /></SField>
                <SField label="الدورة">
                  <select value={sCourse} onChange={e => setSCourse(e.target.value)} className={SINP}>
                    <option value="">—</option>
                    {LEAD_COURSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </SField>
                <SField label="نوع الطالب">
                  <select value={sType} onChange={e => setSType(e.target.value as any)} className={SINP}>
                    <option value="course_student">دورة جماعية</option>
                    <option value="private_student">دروس خاصة</option>
                  </select>
                </SField>
                <SField label="إجمالي المدفوع (د.م)"><input type="number" value={sTotal} onChange={e => setSTotal(e.target.value)} dir="ltr" className={`${SINP} text-right`} /></SField>
                <SField label="الرسوم الشهرية (د.م)"><input type="number" value={sFee} onChange={e => setSFee(e.target.value)} dir="ltr" className={`${SINP} text-right`} /></SField>
                <SField label="تاريخ التسجيل"><input type="date" value={sEnroll} onChange={e => setSEnroll(e.target.value)} dir="ltr" className={SINP} /></SField>
                <SField label="تاريخ انتهاء الدورة"><input type="date" value={sEnd} onChange={e => setSEnd(e.target.value)} dir="ltr" className={SINP} /></SField>
                <label className="flex items-center gap-2 text-[13px] text-zinc-600 sm:col-span-2">
                  <input type="checkbox" checked={sActive} onChange={e => setSActive(e.target.checked)} className="accent-yellow-400" /> طالب نشط
                </label>
                <button onClick={saveStudent} disabled={savingStudent}
                  className="sm:col-span-2 py-2.5 bg-black text-white rounded-lg font-bold text-[13px] flex items-center justify-center gap-2 disabled:opacity-50">
                  {savingStudent ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> حفظ بيانات الطالب</>}
                </button>
              </div>
            )}
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <StatCard label="إجمالي المدفوع" value={`${MAD(totalPaid)}`} unit="د.م" tone="text-emerald-700" />
            <StatCard label="المتبقي" value={outstanding > 0 ? MAD(outstanding) : '0'} unit="د.م" tone="text-zinc-900" />
            <StatCard label="إجمالي الفواتير" value={receipts.length} tone="text-zinc-900" />
            <StatCard label="آخر دفعة" value={lastPaid ? MAD(Number(lastPaid.amount_mad)) : '—'} unit={lastPaid ? 'د.م' : ''} sub={lastPaid ? fmtDate(lastPaid.payment_date) : ''} tone="text-zinc-900" />
            <div className={`rounded-2xl border p-4 flex flex-col justify-center ${statusBadge}`}>
              <div className="text-[11px] opacity-70 mb-1">حالة الدفع</div>
              <div className="text-[14px] font-black flex items-center gap-1"><BadgeCheck size={15} /> {statusText}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-zinc-200/80">
            <div className="flex overflow-x-auto border-b border-zinc-100">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={[
                    'px-4 py-3.5 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors flex-shrink-0',
                    tab === t.id ? 'border-yellow-400 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600',
                  ].join(' ')}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* OVERVIEW */}
              {tab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Portal control — what the student sees */}
                  <div className="md:col-span-2 border border-yellow-200 bg-yellow-50/40 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3"><span className="text-[13px] font-black text-zinc-800">🎛️ التحكم في فضاء الطالب</span><span className="text-[11px] text-zinc-400">يظهر مباشرة على student.inglizi.com</span></div>
                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-500">رسالة للطالب</label>
                        <input value={pcMsg} onChange={e => setPcMsg(e.target.value)} placeholder="مثال: أحسنت! ركّز هذا الأسبوع على المحادثة" className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div><label className="text-[11px] font-semibold text-zinc-500">عنوان درس اليوم</label><input value={pcLesT} onChange={e => setPcLesT(e.target.value)} placeholder="درس اليوم" className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" /></div>
                        <div><label className="text-[11px] font-semibold text-zinc-500">رابط درس اليوم</label><input value={pcLesU} onChange={e => setPcLesU(e.target.value)} placeholder="https://inglizi.com/..." dir="ltr" className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white text-right" /></div>
                      </div>
                      <div><label className="text-[11px] font-semibold text-zinc-500">الخطوة القادمة</label><input value={pcTask} onChange={e => setPcTask(e.target.value)} placeholder="ما الذي على الطالب فعله بعد ذلك" className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" /></div>
                      <div className="grid grid-cols-3 gap-2.5">
                        <div><label className="text-[11px] font-semibold text-zinc-500">المرحلة</label><input value={pcStage} onChange={e => setPcStage(e.target.value)} placeholder="Foundation" dir="ltr" className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white text-right" /></div>
                        <div><label className="text-[11px] font-semibold text-zinc-500">المستوى الحالي</label><input value={pcLevel} onChange={e => setPcLevel(e.target.value)} placeholder="A1" dir="ltr" className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white text-right" /></div>
                        <div><label className="text-[11px] font-semibold text-zinc-500">المستوى القادم</label><input value={pcNext} onChange={e => setPcNext(e.target.value)} placeholder="A2" dir="ltr" className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white text-right" /></div>
                      </div>
                      <button onClick={savePortalControl} disabled={pcBusy} className="w-full py-2 bg-black text-white rounded-lg font-bold text-[13px] flex items-center justify-center gap-2 disabled:opacity-50">
                        {pcBusy ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> حفظ وتحديث فضاء الطالب</>}
                      </button>
                    </div>
                  </div>

                  {/* Learning progress (placeholder until activity tracking lands) */}
                  <Panel title="تقدم التعلّم">
                    <div className="flex items-center gap-4 py-1">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f1f1f1" strokeWidth="3" />
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#facc15" strokeWidth="3" strokeDasharray="0 100" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[12px] font-black text-zinc-300">—</div>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {['الدروس', 'الاستماع', 'الامتحانات', 'الخريطة'].map(x => (
                          <div key={x} className="flex items-center justify-between text-[12px]">
                            <span className="text-zinc-500">{x}</span>
                            <span className="text-amber-700 font-bold text-[10px] bg-amber-50 px-1.5 rounded-full">قريباً</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Panel>
                  <Panel title="آخر امتحان">
                    <div className="flex flex-col items-center justify-center py-3 text-center text-zinc-400">
                      <BadgeCheck size={22} className="mb-2 text-zinc-300" />
                      <p className="text-[12px]">نتائج الامتحانات ستظهر هنا<br />بعد ربط حساب الطالب</p>
                    </div>
                  </Panel>
                  <Panel title="الدورة الحالية">
                    <Line label="المستوى" value={student.course?.toUpperCase() ?? '—'} />
                    <Line label="النوع" value={student.student_type === 'private_student' ? 'دروس خاصة' : 'دورة جماعية'} />
                    <Line label="تاريخ التسجيل" value={fmtDate(student.enrollment_date)} />
                    <Line label="الحالة" value={student.is_active ? 'نشط' : 'غير نشط'} />
                  </Panel>
                  <Panel title="الفواتير والمدفوعات الأخيرة">
                    {paid.length === 0 && pending.length === 0
                      ? <p className="text-[13px] text-zinc-400 py-3">لا توجد مدفوعات</p>
                      : [...pending, ...paid].slice(0, 4).map(p => {
                          const info = PAY_STATUS_AR[p.payment_status]
                          return (
                            <div key={p.id} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-none">
                              <div className="text-[13px]">
                                <div className="font-semibold text-zinc-800">{MAD(Number(p.amount_mad))} د.م</div>
                                <div className="text-[11px] text-zinc-400">{fmtDate(p.payment_date)}</div>
                              </div>
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${info.cls}`}>{info.text}</span>
                            </div>
                          )
                        })}
                  </Panel>
                  <Panel title="ملاحظات">
                    <p className="text-[13px] text-zinc-600 leading-relaxed whitespace-pre-wrap">
                      {student.notes || <span className="text-zinc-300 italic">لا توجد ملاحظات</span>}
                    </p>
                  </Panel>
                  <Panel title="النشاط داخل المنصة">
                    <div className="flex flex-col items-center justify-center py-4 text-center text-zinc-400">
                      <Activity size={22} className="mb-2 text-zinc-300" />
                      <p className="text-[12px]">تتبّع نشاط التعلّم سيظهر هنا<br />(دروس، امتحانات، وقت التعلّم)</p>
                    </div>
                  </Panel>
                </div>
              )}

              {/* PAYMENTS */}
              {tab === 'payments' && (
                <div className="space-y-3">
                  <button onClick={() => setShowPayForm(v => !v)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-zinc-200 text-zinc-500 hover:border-yellow-400 hover:text-yellow-600 font-semibold text-[13px]">
                    <Plus size={15} /> إضافة دفعة / فاتورة
                  </button>

                  {showPayForm && (
                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-zinc-500 font-semibold">المبلغ (د.م)</label>
                          <input type="number" value={payAmt} onChange={e => setPayAmt(e.target.value)} dir="ltr"
                            className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" placeholder="0" />
                        </div>
                        <div>
                          <label className="text-[11px] text-zinc-500 font-semibold">النوع</label>
                          <select value={payType} onChange={e => setPayType(e.target.value as any)}
                            className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white">
                            <option value="private_monthly">شهري (خاص)</option>
                            <option value="course_one_time">دورة (مرة واحدة)</option>
                          </select>
                        </div>
                      </div>
                      <input value={payNotes} onChange={e => setPayNotes(e.target.value)} placeholder="ملاحظات (اختياري)"
                        className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" />
                      <div className="flex gap-2">
                        <button onClick={addPayment} disabled={savingPay || !payAmt}
                          className="flex-1 py-2 bg-black text-white rounded-lg font-bold text-[13px] disabled:opacity-50">
                          {savingPay ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'تسجيل الدفعة'}
                        </button>
                        <button onClick={() => setShowPayForm(false)} className="px-4 py-2 border border-zinc-200 rounded-lg text-[13px] text-zinc-500">إلغاء</button>
                      </div>
                    </div>
                  )}

                  {payments.length === 0 && !showPayForm && <p className="text-center py-6 text-zinc-400 text-[14px]">لا توجد مدفوعات</p>}

                  {payments.map(p => {
                    const info = PAY_STATUS_AR[p.payment_status]
                    const receipt = receipts.find(r => r.payment_id === p.id)
                    return (
                      <div key={p.id} className="bg-white border border-zinc-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-bold text-[15px]">{MAD(Number(p.amount_mad))} د.م</div>
                            <div className="text-[12px] text-zinc-400">{PAYMENT_TYPE_AR[p.payment_type]} {p.payment_date && `· ${fmtDate(p.payment_date)}`}</div>
                          </div>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${info.cls}`}>{info.text}</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {p.payment_status === 'pending' && (
                            <>
                              <button onClick={() => approve(p.id)} disabled={!!payBusy}
                                className="flex items-center gap-1 text-[12px] font-bold px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50">
                                {payBusy === p.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />} قبول
                              </button>
                              <button onClick={() => decline(p.id)} disabled={!!payBusy}
                                className="flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-lg border border-red-200 text-red-500"><XCircle size={11} /> رفض</button>
                            </>
                          )}
                          {p.payment_status === 'paid' && (
                            <>
                              <button onClick={() => downloadReceipt(p)}
                                className="flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-black text-yellow-400 hover:bg-zinc-800"><Printer size={11} /> تحميل الوصل</button>
                              {phone && (
                                <button onClick={() => sendReceipt(p)}
                                  className="flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100"><MessageCircle size={11} /> إرسال الوصل</button>
                              )}
                              {receipt && <span className="text-[11px] text-zinc-400 self-center">{receipt.receipt_number}</span>}
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* NOTES */}
              {tab === 'notes' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-[14px]">ملاحظات الطالب</span>
                    <button onClick={() => setEditNote(v => !v)} className="flex items-center gap-1 text-[12px] text-zinc-400 hover:text-zinc-700">
                      <Edit3 size={12} /> {editNote ? 'إلغاء' : 'تعديل'}
                    </button>
                  </div>
                  {editNote ? (
                    <>
                      <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={8} placeholder="أضف ملاحظاتك..."
                        className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-[14px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                      <button onClick={saveNote} disabled={savingNote}
                        className="mt-3 w-full py-2.5 bg-black text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2">
                        {savingNote ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> حفظ</>}
                      </button>
                    </>
                  ) : (
                    <div className="bg-zinc-50 rounded-xl p-4 min-h-[120px] text-[14px] text-zinc-600 leading-relaxed whitespace-pre-wrap">
                      {noteText || <span className="text-zinc-300 italic">لا توجد ملاحظات</span>}
                    </div>
                  )}
                </div>
              )}

              {/* EXAMS */}
              {tab === 'exams' && (
                <div className="space-y-4">
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-2">
                    <div className="text-[13px] font-bold text-zinc-700">تسجيل نتيجة امتحان</div>
                    <input value={exTitle} onChange={e => setExTitle(e.target.value)} placeholder="عنوان الامتحان * (مثال: اختبار A1 — الوحدة 3)" className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" />
                    <div className="grid grid-cols-3 gap-2">
                      <input value={exLevel} onChange={e => setExLevel(e.target.value)} placeholder="المستوى" className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" />
                      <input type="number" value={exScore} onChange={e => setExScore(e.target.value)} placeholder="النتيجة" dir="ltr" className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white text-right" />
                      <input type="number" value={exMax} onChange={e => setExMax(e.target.value)} placeholder="من" dir="ltr" className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white text-right" />
                    </div>
                    <input value={exNote} onChange={e => setExNote(e.target.value)} placeholder="ملاحظة الأستاذ (اختياري)" className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" />
                    <button onClick={submitExam} disabled={exBusy || !exTitle.trim()} className="w-full py-2 bg-black text-white rounded-lg font-bold text-[13px] disabled:opacity-50">
                      {exBusy ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'حفظ النتيجة'}
                    </button>
                  </div>

                  {exams.length === 0 && <p className="text-center py-4 text-zinc-400 text-[13px]">لا توجد امتحانات مسجّلة</p>}
                  {exams.map(e => {
                    const pct = e.score != null && e.max_score ? Math.round((e.score / e.max_score) * 100) : null
                    return (
                      <div key={e.id} className="flex items-center gap-3 border border-zinc-100 rounded-xl p-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${e.passed === false ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}><span className="text-[14px] font-black">{pct != null ? `${pct}%` : '—'}</span></div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[14px] text-zinc-800">{e.title}</div>
                          <div className="text-[11px] text-zinc-400">{e.level ? `${e.level} · ` : ''}{fmtDate(e.exam_date)}{e.passed != null ? ` · ${e.passed ? 'ناجح' : 'يحتاج إعادة'}` : ''}</div>
                          {e.teacher_note && <div className="text-[11px] text-zinc-500 mt-0.5">📝 {e.teacher_note}</div>}
                        </div>
                        <button onClick={() => removeExam(e.id)} className="text-zinc-300 hover:text-red-500"><Trash2 size={15} /></button>
                      </div>
                    )
                  })}
                </div>
              )}

              {tab === 'progress' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[12px] text-blue-800 leading-relaxed">
                    💡 التمارين التي تُكلّف بها الطالب هنا تظهر له فورًا في فضائه على <b dir="ltr">student.inglizi.com</b> (تبويب «التمارين»). أضف رابط درس/تمرين من Inglizi.com ليفتحه الطالب مباشرة.
                  </div>

                  {/* Apply a ready path template */}
                  {templates.length > 0 && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2">
                      <span className="text-[12px] font-bold text-emerald-800 flex-shrink-0">🗺️ تطبيق مسار جاهز</span>
                      <select value={applyId} onChange={e => setApplyId(e.target.value)} className="flex-1 border border-emerald-200 rounded-lg px-2 py-1.5 text-[13px] bg-white">
                        <option value="">اختر مسارًا</option>
                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}{t.level ? ` (${t.level})` : ''}</option>)}
                      </select>
                      <button onClick={applyPath} disabled={!applyId} className="text-[12px] font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white disabled:opacity-50">تطبيق</button>
                    </div>
                  )}

                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-2">
                    <div className="text-[13px] font-bold text-zinc-700">تكليف تمرين جديد</div>
                    <input value={aTitle} onChange={e => setATitle(e.target.value)} placeholder="عنوان التمرين *"
                      className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" />
                    <input value={aDesc} onChange={e => setADesc(e.target.value)} placeholder="وصف / تعليمات (اختياري)"
                      className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" />
                    <input value={aLink} onChange={e => setALink(e.target.value)} placeholder="رابط التمرين/الدرس على Inglizi.com (اختياري)" dir="ltr"
                      className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white text-right" />
                    <div className="grid grid-cols-2 gap-2">
                      <select value={aCat} onChange={e => setACat(e.target.value)} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white">
                        <option value="exercise">تمرين</option>
                        <option value="lesson">درس</option>
                        <option value="reading">قراءة</option>
                        <option value="speaking">محادثة</option>
                        <option value="quiz">اختبار</option>
                        <option value="vocabulary">مفردات</option>
                      </select>
                      <input type="date" value={aDue} onChange={e => setADue(e.target.value)} dir="ltr"
                        className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" title="تاريخ الاستحقاق" />
                    </div>
                    <button onClick={submitAssignment} disabled={aBusy || !aTitle.trim()}
                      className="w-full py-2 bg-black text-white rounded-lg font-bold text-[13px] disabled:opacity-50">
                      {aBusy ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'تكليف الطالب'}
                    </button>
                  </div>

                  {assignments.length === 0 && <p className="text-center py-4 text-zinc-400 text-[13px]">لا توجد تمارين مكلّفة</p>}
                  {assignments.map(a => (
                    <div key={a.id} className="flex items-start justify-between gap-3 border border-zinc-100 rounded-xl p-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[14px] text-zinc-800">{a.title}</div>
                        {a.description && <div className="text-[12px] text-zinc-500 mt-0.5">{a.description}</div>}
                        {a.link_url && <a href={a.link_url} target="_blank" rel="noopener noreferrer" className="text-[12px] text-blue-600 inline-flex items-center gap-1 mt-1">الرابط <ExternalLink size={11} /></a>}
                      </div>
                      <button onClick={() => removeAssignment(a.id)} className="text-zinc-300 hover:text-red-500 flex-shrink-0"><Trash2 size={15} /></button>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'activity' && (
                <div>
                  <div className="text-[13px] font-bold text-zinc-700 mb-3">سجل نشاط الطالب على Inglizi.com</div>
                  {activity.length === 0
                    ? <ComingSoon icon={Activity} title="لا يوجد نشاط بعد" desc="سيظهر هنا كل ما يفعله الطالب: تسجيل الدخول، فتح الدروس، إنجاز التمارين، تحميل الملفات، والاطلاع على النتائج." />
                    : <div className="relative">
                        {activity.map((a, i) => (
                          <div key={i} className="flex gap-3 pb-3">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[13px]">{ACTIVITY_ICON[a.event_type] ?? '•'}</div>
                              {i < activity.length - 1 && <div className="w-px flex-1 bg-zinc-100 my-1" />}
                            </div>
                            <div className="flex-1 pb-1">
                              <div className="text-[13px] font-semibold text-zinc-800">{ACTIVITY_LABEL[a.event_type] ?? a.event_type}{a.entity_title ? `: ${a.entity_title}` : ''}</div>
                              <div className="text-[11px] text-zinc-400">{new Date(a.created_at).toLocaleString('ar-MA', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                            </div>
                          </div>
                        ))}
                      </div>}
                </div>
              )}

              {tab === 'files' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[12px] text-blue-800 leading-relaxed">
                    💡 الملفات التي ترفعها هنا (PDF، صور، تمارين...) تظهر للطالب في فضائه على <b dir="ltr">student.inglizi.com</b> ويمكنه تحميلها.
                  </div>
                  <label className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-zinc-200 text-zinc-500 hover:border-yellow-400 hover:text-yellow-600 font-semibold text-[13px] cursor-pointer">
                    {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                    {uploading ? 'جارٍ الرفع...' : 'رفع ملف (PDF أو غيره)'}
                    <input type="file" className="hidden" onChange={onUpload} disabled={uploading} />
                  </label>

                  {files.length === 0 && <p className="text-center py-4 text-zinc-400 text-[13px]">لا توجد ملفات بعد</p>}
                  {files.map(f => (
                    <div key={f.id} className="flex items-center gap-3 border border-zinc-100 rounded-xl p-3">
                      <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0"><FileText size={16} className="text-rose-500" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[13px] text-zinc-800 truncate">{f.file_name}</div>
                        <div className="text-[11px] text-zinc-400">{fmtDate(f.created_at)}</div>
                      </div>
                      <a href={fileUrl(f.file_path)} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-700"><Download size={16} /></a>
                      <button onClick={() => removeFile(f)} className="text-zinc-300 hover:text-red-500"><Trash2 size={15} /></button>
                    </div>
                  ))}

                  {student.verification_token && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[12px] text-blue-800 leading-relaxed">
                      🔑 يدخل الطالب إلى فضائه عبر <b dir="ltr">student.inglizi.com</b> باستخدام رمزه: <b dir="ltr">{student.verification_token}</b> — حيث يرى دوراته، التمارين، والملفات.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────── */
function ComingSoon({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
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

function InfoLine({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-[12px] text-zinc-400"><Icon size={14} className="text-zinc-300" /> {label}</span>
      <span className="text-[13px] font-semibold text-zinc-800">{value}</span>
    </div>
  )
}

const SINP = 'w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400'
function SField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-zinc-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

function StatCard({ label, value, unit, sub, tone }: { label: string; value: string | number; unit?: string; sub?: string; tone: string }) {
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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-zinc-100 rounded-xl p-4">
      <h4 className="text-[13px] font-bold text-zinc-800 mb-3">{title}</h4>
      {children}
    </div>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-zinc-50 last:border-none">
      <span className="text-[12px] text-zinc-400">{label}</span>
      <span className="text-[13px] font-semibold text-zinc-800">{value}</span>
    </div>
  )
}
