import { notFound } from 'next/navigation'
import { getGrammarLesson, grammarLessons } from '@/data/private-lessons/grammar'
import GrammarPlayer from '@/components/lessons/GrammarPlayer'

export function generateStaticParams() {
  return grammarLessons.map((l) => ({ slug: l.slug }))
}

export default function GrammarLessonPage({ params }: { params: { slug: string } }) {
  const lesson = getGrammarLesson(params.slug)
  if (!lesson) notFound()
  return <GrammarPlayer lesson={lesson} />
}
