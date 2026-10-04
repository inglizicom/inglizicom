'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight, Phone, MessageCircle, Loader2, GraduationCap, Wallet, Receipt, Plus, Edit3, Save,
  CalendarDays, BadgeCheck, Clock, BookOpen, ShieldCheck, Trash2, Archive,
} from 'lucide-react'

import { useStaff } from '@/lib/staff-context'
import { type CrmStudent, type CrmPayment, LEAD_COURSES } from '@/lib/crm-types'
import {
  fetchStudentById, fetchCrmPayments, approveCrmPayment, declineCrmPayment, createCrmPayment,
  patchStudent, recordMonthlyPayment, archiveStudent, unarchiveStudent, softDeleteStudent,
} from '@/lib/crm-db'
import {
  fetchReceiptsForStudent, printReceipt, buildReceiptWhatsAppMessage, ensurePaymentReceipt,
  type CrmReceipt,
} from '@/lib/crm-receipts'
import { whatsappLink } from '@/lib/leads-db'
import {
  fetchAssignments, addAssignment, deleteAssignment, fetchStudentFiles, uploadStudentFile,
  deleteStudentFile, fetchExams, addExam, deleteExam, fetchStudentActivity, fetchTemplates,
  applyTemplateToStudent, type StudentAssignment, type StudentFile, type StudentExam,
  type PathTemplate,
} from '@/lib/student-portal'
import { createSplitPayment, dueWhatsAppLink, markReminded, type DueRow } from '@/lib/dues'
import { countryFlag } from '@/lib/geo-currency'
import { fetchCourses, type LmsCourse } from '@/lib/lms'
import {
  MAD, fmtDate, TABS, InfoLine, SINP, SField, StatCard, DevicesSection, AvatarUpload,
  CertificatesSection, CoinsSection, type Tab,
} from './_parts'
import OverviewTab from './tabs/OverviewTab'
import PaymentsTab from './tabs/PaymentsTab'
import NotesTab from './tabs/NotesTab'
import ExamsTab from './tabs/ExamsTab'
import ExtraTasksTab from './tabs/ExtraTasksTab'
import ActivityTab from './tabs/ActivityTab'
import FilesTab from './tabs/FilesTab'

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
  // LMS courses (for linking a staff task to a lesson)
  const [allCourses, setAllCourses]   = useState<LmsCourse[]>([])
  const [aLesson, setALesson]         = useState<string | null>(null)

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
  // split (installments): part 1 now, part 2 scheduled
  const [splitOn,    setSplitOn]    = useState(false)
  const [splitFirst, setSplitFirst] = useState('')
  const [splitDate,  setSplitDate]  = useState(() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString().slice(0, 10) })

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
    const [exm, act, tpl, crs] = await Promise.all([
      fetchExams(id), fetchStudentActivity(id), fetchTemplates(), fetchCourses(),
    ])
    setStudent(s); setPayments(p); setReceipts(r); setNoteText(s.notes ?? '')
    setAssignments(asg); setFiles(fls); setExams(exm); setActivity(act); setTemplates(tpl)
    setAllCourses(crs)
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
    await addAssignment({ studentId: id, title: aTitle.trim(), description: aDesc.trim() || undefined, linkUrl: aLink.trim() || undefined, category: aCat, dueDate: aDue || undefined, course: student?.course ?? undefined, assignedBy: staff.id, lessonId: aLesson })
    setATitle(''); setADesc(''); setALink(''); setADue(''); setALesson(null)
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
    if (splitOn) {
      const total = parseFloat(payAmt), first = parseFloat(splitFirst)
      if (!total || !first || first <= 0 || first >= total || !splitDate) {
        alert('تحقق من المبالغ: الدفعة الأولى يجب أن تكون أقل من الإجمالي، مع تحديد تاريخ الدفعة الثانية.')
        setSavingPay(false); return
      }
      await createSplitPayment({
        studentId: student.id, courseOrService: student.course ?? undefined,
        totalMad: total, firstMad: first, secondDueDate: splitDate,
        staffId: staff.id, notes: payNotes || undefined,
      })
      const s = await fetchStudentById(id); if (s) setStudent(s)
    } else {
      await createCrmPayment({
        studentId: student.id, type: payType,
        courseOrService: student.course ?? undefined,
        amountMad: parseFloat(payAmt), notes: payNotes || undefined,
      })
    }
    setPayAmt(''); setPayNotes(''); setSplitOn(false); setSplitFirst(''); setShowPayForm(false)
    await reloadPay(); setSavingPay(false)
  }
  async function approve(pid: string) { setPayBusy(pid); await approveCrmPayment(pid, staff.id); await reloadPay(); setPayBusy(null) }
  async function decline(pid: string) { setPayBusy(pid); await declineCrmPayment(pid); await reloadPay(); setPayBusy(null) }
  /** WhatsApp + in-app reminder for a scheduled (pending) installment. */
  async function remindPayment(p: CrmPayment) {
    if (!student || !p.due_date) return
    setPayBusy(p.id)
    const due: DueRow = {
      payment_id: p.id, student_id: student.id, name: student.full_name,
      phone: student.phone_number, avatar_url: student.avatar_url ?? null, course: student.course,
      amount: Number(p.amount_mad), due_date: p.due_date,
      days: Math.ceil((new Date(p.due_date).getTime() - Date.now()) / 86400000),
      installment_no: p.installment_no, installment_count: p.installment_count,
      reminded_at: p.reminder_sent_at ?? null,
    }
    const wa = dueWhatsAppLink(due)
    if (wa) window.open(wa, '_blank')
    await markReminded(due)
    await reloadPay(); setPayBusy(null)
  }

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
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 overflow-x-clip">
      {/* Back */}
      <Link href="/sales/workspace?tab=students" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-zinc-500 hover:text-zinc-800">
        <ArrowRight size={15} /> العودة إلى قائمة الطلاب
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">

        {/* ── Left column (drops BELOW the main content on mobile) ── */}
        <div className="space-y-4 order-2 lg:order-none min-w-0">
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

          {/* Device security */}
          <DevicesSection studentId={student.id} limit={(student as any).device_limit ?? 1} />

          {/* Coins & rewards */}
          <CoinsSection studentId={student.id} by={staff.id} />

          {/* Certificates */}
          <CertificatesSection studentId={student.id} staffId={staff.id} isFounder={staff.role === 'founder' || staff.isAdmin} />

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

        {/* ── Main column (first on mobile) ────────────── */}
        <div className="space-y-4 min-w-0 order-1 lg:order-none">

          {/* Header card */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-5">
            <div className="flex items-start gap-4">
              <AvatarUpload student={student} onChange={url => setStudent({ ...student, avatar_url: url })} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[20px] font-black text-zinc-900">{student.full_name}</h2>
                  {student.country && <span title={student.country} className="text-lg leading-none">{countryFlag(student.country)}</span>}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 lg:gap-3">
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
              {tab === 'overview' && <OverviewTab {...{ id, paid, pcBusy, pcLesT, pcLesU, pcLevel, pcMsg, pcNext, pcStage, pcTask, pending, savePortalControl, setAssignments, setPcLesT, setPcLesU, setPcLevel, setPcMsg, setPcNext, setPcStage, setPcTask, student }} />}

              {/* PAYMENTS */}
              {tab === 'payments' && <PaymentsTab studentId={id} {...{ addPayment, approve, decline, downloadReceipt, payAmt, payBusy, payments, payNotes, payType, phone, receipts, remindPayment, savingPay, sendReceipt, setPayAmt, setPayNotes, setPayType, setShowPayForm, setSplitDate, setSplitFirst, setSplitOn, showPayForm, splitDate, splitFirst, splitOn }} />}

              {/* NOTES */}
              {tab === 'notes' && <NotesTab {...{ editNote, noteText, saveNote, savingNote, setEditNote, setNoteText }} />}

              {/* EXAMS */}
              {tab === 'exams' && <ExamsTab {...{ exams, exBusy, exLevel, exMax, exNote, exScore, exTitle, removeExam, setExLevel, setExMax, setExNote, setExScore, setExTitle, submitExam }} />}

              {tab === 'progress' && <ExtraTasksTab {...{ aBusy, aCat, aDesc, aDue, aLesson, aLink, allCourses, applyId, applyPath, assignments, aTitle, removeAssignment, setACat, setADesc, setADue, setALesson, setALink, setApplyId, setATitle, submitAssignment, templates }} />}

              {tab === 'activity' && <ActivityTab {...{ activity }} />}

              {tab === 'files' && <FilesTab {...{ files, onUpload, removeFile, student, uploading }} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
