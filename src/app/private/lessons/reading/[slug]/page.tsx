import { notFound } from 'next/navigation'
import { getReadingUnit, readingUnits } from '@/data/private-lessons/reading'
import LessonPlayer from '@/components/lessons/LessonPlayer'

export function generateStaticParams() {
  return readingUnits.map((u) => ({ slug: u.slug }))
}

export default function ReadingLessonPage({ params }: { params: { slug: string } }) {
  const unit = getReadingUnit(params.slug)
  if (!unit) notFound()
  return <LessonPlayer unit={unit} />
}
