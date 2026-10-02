import type { Metadata } from 'next'
import TeacherDirectory from '@/components/teachers/TeacherDirectory'
import { fetchPublicTeachers } from '@/lib/teacher-public'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'أساتذة إنجليزي.كوم',
  description: 'تعرّف على أساتذة إنجليزي.كوم واختر الأستاذ المناسب لمستواك وهدفك.',
  alternates: { canonical: 'https://teacher.inglizi.com/' },
  openGraph: {
    title: 'أساتذة إنجليزي.كوم',
    description: 'تعرّف على أساتذة إنجليزي.كوم واختر الأستاذ المناسب لمستواك وهدفك.',
    url: 'https://teacher.inglizi.com/',
    siteName: 'إنجليزي.كوم',
    locale: 'ar_MA',
    type: 'website',
  },
}

export default async function TeacherShowcasePage() {
  const teachers = await fetchPublicTeachers()
  return <TeacherDirectory teachers={teachers} />
}