import { notFound } from 'next/navigation'
import { getUnit, units } from '@/data/private-lessons'
import LessonPlayer from '@/components/lessons/LessonPlayer'

export function generateStaticParams() {
  return units.map((u) => ({ slug: u.slug }))
}

export default function UnitPage({ params }: { params: { slug: string } }) {
  const unit = getUnit(params.slug)
  if (!unit) notFound()
  return <LessonPlayer unit={unit} />
}
