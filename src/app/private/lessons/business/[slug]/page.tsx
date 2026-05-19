import { notFound } from 'next/navigation'
import { businessUnits, getBusinessUnit } from '@/data/private-lessons/business'
import LessonPlayer from '@/components/lessons/LessonPlayer'

export function generateStaticParams() {
  return businessUnits.map((u) => ({ slug: u.slug }))
}

export default function BusinessLessonPage({ params }: { params: { slug: string } }) {
  const unit = getBusinessUnit(params.slug)
  if (!unit) notFound()
  return <LessonPlayer unit={unit} />
}
