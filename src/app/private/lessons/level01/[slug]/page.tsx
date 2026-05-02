import { notFound } from 'next/navigation'
import { getLevel01Unit, level01Units } from '@/data/private-lessons/level01'
import LessonPlayer from '@/components/lessons/LessonPlayer'

export function generateStaticParams() {
  return level01Units.map((u) => ({ slug: u.slug }))
}

export default function Level01LessonPage({ params }: { params: { slug: string } }) {
  const unit = getLevel01Unit(params.slug)
  if (!unit) notFound()
  return <LessonPlayer unit={unit} />
}
