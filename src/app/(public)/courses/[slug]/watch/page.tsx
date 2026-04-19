import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { COURSES } from '@/data/courses'
import { fetchCourseLessons, groupLessonsIntoSections } from '@/lib/course-lessons-db'
import WatchClient from './WatchClient'

interface Params {
  params: { slug: string }
}

export function generateMetadata({ params }: Params): Metadata {
  const course = COURSES.find(c => c.slug === params.slug)
  if (!course) return { title: 'الدروس' }
  return {
    title: `دروس ${course.title} | إنجليزي`,
    description: `شاهد دروس كورس ${course.title} المجانية مباشرة — ${course.subtitle}`,
  }
}

export default async function WatchPage({ params }: Params) {
  const course = COURSES.find(c => c.slug === params.slug)
  if (!course) notFound()

  const rows = await fetchCourseLessons(params.slug)
  const sections = rows.length > 0 ? groupLessonsIntoSections(rows) : course.curriculum

  return <WatchClient course={course} sections={sections} />
}
