import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import TeacherPublicProfileView, { DEMO_PUBLIC_TEACHER } from '@/components/teachers/TeacherPublicProfileView'
import { fetchTeacherPublicProfile } from '@/lib/teacher-public'

export const revalidate = 60

interface PageProps { params: { teacherId: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (params.teacherId === 'demo') {
    return {
      title: 'معاينة صفحة الأستاذ | إنجليزي.كوم',
      description: 'مثال توضيحي لشكل صفحة الأستاذ العامة.',
      robots: { index: false, follow: false },
    }
  }
  const teacher = await fetchTeacherPublicProfile(params.teacherId)
  if (!teacher) return { title: 'أستاذ غير موجود | إنجليزي.كوم', robots: { index: false, follow: false } }
  return {
    title: `${teacher.name ?? 'الأستاذ'} | أساتذة إنجليزي.كوم`,
    description: teacher.profile.tagline || teacher.profile.headline || teacher.profile.bio || 'تعرّف على الأستاذ وتخصصاته في إنجليزي.كوم.',
    alternates: { canonical: `https://teacher.inglizi.com/teacher-showcase/${teacher.id}` },
    openGraph: {
      title: `${teacher.name ?? 'الأستاذ'} | أساتذة إنجليزي.كوم`,
      description: teacher.profile.tagline || teacher.profile.headline || 'ملف الأستاذ في إنجليزي.كوم.',
      url: `https://teacher.inglizi.com/teacher-showcase/${teacher.id}`,
      siteName: 'إنجليزي.كوم',
      locale: 'ar_MA',
      type: 'profile',
      images: teacher.profile.cover_url ? [teacher.profile.cover_url] : teacher.profile.avatar_url ? [teacher.profile.avatar_url] : undefined,
    },
  }
}

export default async function TeacherShowcaseProfilePage({ params }: PageProps) {
  if (params.teacherId === 'demo') return <TeacherPublicProfileView teacher={DEMO_PUBLIC_TEACHER} demo />
  const teacher = await fetchTeacherPublicProfile(params.teacherId)
  if (!teacher) notFound()
  return <TeacherPublicProfileView teacher={teacher} />
}