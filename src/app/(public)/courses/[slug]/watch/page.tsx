import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { COURSES } from '@/data/courses'
import { fetchCourseLessons, groupLessonsIntoSections } from '@/lib/course-lessons-db'
import { fetchCourseMeta } from '@/lib/course-meta-db'
import WatchClient from './WatchClient'

// Force server-render on every request — never statically generated
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Empty override prevents the parent [slug]/generateStaticParams from
// propagating into this sub-route and triggering SSG attempts here
export function generateStaticParams() { return [] }

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

  // DB calls wrapped in try-catch so a build-time or network failure
  // falls back gracefully to the static curriculum instead of crashing
  let sections = course!.curriculum
  try {
    const meta = await fetchCourseMeta(params.slug)
    if (meta?.course_type === 'external' && meta.external_url) {
      redirect(meta.external_url)
    }
    const rows = await fetchCourseLessons(params.slug)
    if (rows.length > 0) sections = groupLessonsIntoSections(rows)
  } catch {
    // fallback to static curriculum — will be correct on next real request
  }

  return <WatchClient course={course!} sections={sections} />
}
