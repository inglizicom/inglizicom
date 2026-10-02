import type { Metadata } from 'next'
import TeacherDirectory from '@/components/teachers/TeacherDirectory'
import { fetchPublicLeaderboard, fetchPublicTeachers } from '@/lib/teacher-public'
import { PREVIEW_LEADERBOARD, PREVIEW_TEACHERS } from '@/components/teachers/previewTeachers'

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
  const leaderboard = await fetchPublicLeaderboard(teachers)

  // Local design review only: `npm run dev` adds three sample teachers. A
  // production build never does — the live page shows real teachers only.
  if (process.env.NODE_ENV === 'development') {
    const board = [...leaderboard, ...PREVIEW_LEADERBOARD.map(r => ({ ...r, rank: 0 }))]
      .sort((a, b) => b.score - a.score || b.rating_avg - a.rating_avg || b.students - a.students)
    board.forEach((r, i) => { r.rank = i + 1 })
    return <TeacherDirectory teachers={[...teachers, ...PREVIEW_TEACHERS]} leaderboard={board} />
  }

  return <TeacherDirectory teachers={teachers} leaderboard={leaderboard} />
}