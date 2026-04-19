import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { COURSES } from '@/data/courses'
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

export default function WatchPage({ params }: Params) {
  const course = COURSES.find(c => c.slug === params.slug)
  if (!course) notFound()

  return <WatchClient course={course} />
}
