import { notFound } from 'next/navigation'
import { CARD_LESSONS } from '@/data/level1-cards'
import { bookSections } from '@/data/level1-audio'
import { PlayShell, SectionList } from '../../_shell'

/** /audio/book/13 — the audio of a lesson of the course book (its page's QR code opens it). */

export function generateStaticParams() { return CARD_LESSONS.map(l => ({ n: String(l.n) })) }
export const dynamicParams = false

export default function BookLesson({ params }: { params: { n: string } }) {
  const n = Number(params.n)
  const lesson = CARD_LESSONS.find(l => l.n === n)
  if (!lesson) notFound()
  return (
    <PlayShell title={`Lesson ${n}: ${lesson.titleEn}`} sub={`Course book · كتاب الدروس · ${lesson.titleAr}`} here={{ shelf: 'book', lesson: n }}>
      <SectionList sections={bookSections(n)} k={`book-${n}`} />
    </PlayShell>
  )
}
