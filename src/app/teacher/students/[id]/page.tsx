'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowRight, Award, BookOpen, CalendarDays, CalendarPlus, ClipboardList, Loader2, MessageCircle, ShieldAlert, Wallet,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTeacher } from '@/lib/teacher-context'
import { demoStudentProfile, loadStudentProfileForTeacher, type StudentProfile } from '@/lib/student-profile'
import {
  IdentityBar, KpiGrid, LearningState, SmartActions, StudentSummary, type Action,
} from '@/components/student-profile/overview'
import { ActiveClasses, AttendancePanel, Timetable, UpcomingSchedule } from '@/components/student-profile/schedule'
import {
  ActivityFeed, Certificates, LevelProgress, ParentView, PaymentSummary, StudyActivity, TeachersAssigned,
} from '@/components/student-profile/progress'
import { Rise } from '../../_ds'
import { DEMO_STUDENTS, isTeacherDemo } from '../../_demo'
import { DemoBanner } from '../../_ui'
import { HelpBanner } from '../../_kit'

/**
 * ملف الطالب — one student, as the teacher sees them.
 *
 * Built from reusable sections (src/components/student-profile) over a single
 * StudentProfile shape (src/lib/student-profile). The live loader fills what a
 * teacher may read; payment, LMS progress and certificates stay null for a
 * teacher and their sections say so. `?demo=1` fills everything for review.
 */
export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>()
  const teacher = useTeacher()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [demo, setDemo] = useState(false)

  useEffect(() => {
    let alive = true
    if (isTeacherDemo()) {
      const s = DEMO_STUDENTS.find(x => x.id === id)
      setDemo(true); setProfile(demoStudentProfile(id, s?.full_name)); setLoading(false); return
    }
    loadStudentProfileForTeacher({
      id: teacher.id,
      name: teacher.profile?.display_name || teacher.fullName || 'أنت',
      avatarUrl: teacher.profile?.avatar_url ?? null,
      headline: teacher.profile?.headline ?? null,
      rating: teacher.profile?.rating_count ? Number(teacher.profile.rating_avg) : null,
    }, id).then(p => { if (alive) { setProfile(p); setLoading(false) } })
    return () => { alive = false }
  }, [id, teacher])

  async function message() {
    if (demo || !profile) return
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return
    const text = `مرحباً ${profile.name.split(' ')[0]}،`
    window.open(`/api/teacher/wa/${profile.id}?t=${encodeURIComponent(token)}&text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }

  if (loading) {
    return <div className="py-40 flex justify-center text-[#94A3B8]"><Loader2 size={20} className="animate-spin" /></div>
  }

  if (!profile) {
    return (
      <div className="py-24 text-center">
        <ShieldAlert size={30} className="mx-auto text-[#CBD5E1] mb-3" />
        <div className="text-[16px] font-extrabold text-[#1E3A8A]">لا يمكنك عرض هذا الطالب</div>
        <p className="mt-1 text-[13px] text-[#64748B]">يظهر هنا فقط الطلاب المسنَدون إليك أو المسجّلون في أقسامك.</p>
        <Link href="/teacher/students" className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-blue-700">
          <ArrowRight size={15} /> العودة إلى طلابي
        </Link>
      </div>
    )
  }

  const identityActions: Action[] = [
    { label: 'مراسلة الطالب', icon: MessageCircle, onClick: message, primary: true },
    { label: 'حجز حصة', icon: CalendarPlus, href: '/teacher/classes?new=1' },
    { label: 'الجدول', icon: CalendarDays, href: '#timetable' },
    { label: 'الدورات', icon: BookOpen, href: '#learning' },
  ]
  const smartActions: Action[] = [
    { label: 'حجز حصة', icon: CalendarPlus, href: '/teacher/classes?new=1', primary: true },
    { label: 'عرض الجدول', icon: CalendarDays, href: '#timetable' },
    { label: 'خطة الدفع', icon: Wallet, href: '#payment' },
    { label: 'مراسلة الطالب', icon: MessageCircle, onClick: message },
    { label: 'تقرير التقدّم', icon: ClipboardList, href: '/teacher/reports' },
    { label: 'الشهادات', icon: Award, href: '#certificates' },
  ]

  return (
    <div className="space-y-6">
      {demo && <DemoBanner />}

      <Link href="/teacher/students" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#64748B] hover:text-blue-700">
        <ArrowRight size={15} /> طلابي
      </Link>

      <Rise><IdentityBar p={profile} actions={identityActions} /></Rise>
      <Rise><KpiGrid p={profile} /></Rise>

      <div className="grid lg:grid-cols-12 gap-6">
        <Rise className="lg:col-span-8"><div id="learning" className="h-full scroll-mt-24"><LearningState p={profile} /></div></Rise>
        <div className="lg:col-span-4 space-y-6">
          <Rise><SmartActions actions={smartActions} /></Rise>
          <Rise><StudentSummary p={profile} /></Rise>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Rise><ActiveClasses p={profile} /></Rise>
        <Rise i={1}><UpcomingSchedule p={profile} /></Rise>
      </div>

      <Rise><Timetable p={profile} /></Rise>

      <div className="grid lg:grid-cols-2 gap-6">
        <Rise><AttendancePanel p={profile} /></Rise>
        <Rise i={1}><StudyActivity p={profile} /></Rise>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <Rise className="lg:col-span-5"><LevelProgress p={profile} /></Rise>
        <Rise className="lg:col-span-7"><div id="payment" className="h-full scroll-mt-24"><PaymentSummary p={profile} /></div></Rise>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <Rise className="lg:col-span-4"><TeachersAssigned p={profile} /></Rise>
        <Rise className="lg:col-span-8"><div id="certificates" className="h-full scroll-mt-24"><Certificates p={profile} /></div></Rise>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <Rise className="lg:col-span-7"><ParentView p={profile} /></Rise>
        <Rise className="lg:col-span-5"><ActivityFeed p={profile} /></Rise>
      </div>

      <HelpBanner title="تحتاج معلومة عن هذا الطالب؟" text="الإدارة تتابع المدفوعات والتسجيلات — تواصل معها لأي سؤال عن وضع الطالب." />
    </div>
  )
}
