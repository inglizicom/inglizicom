import { notFound } from 'next/navigation'
import { CARD_LESSONS } from '@/data/level1-cards'
import { bookSections } from '@/data/level1-audio'
import { AudioShell, SectionList, flatten } from '../../_shell'

/** /audio/book/13 — the audio of a lesson of the course book (its page's QR code opens it). */

export function generateStaticParams() { return CARD_LESSONS.map(l => ({ n: String(l.n) })) }
export const dynamicParams = false

export default function BookLesson({ params }: { params: { n: string } }) {
  const n = Number(params.n)
  const lesson = CARD_LESSONS.find(l => l.n === n)
  if (!lesson) notFound()
  const sections = bookSections(n)
  const { clips, starts } = flatten(sections, `Course book › Lesson ${n}`)
  return (
    <AudioShell crumbs={['Level 1', 'Course book', `Lesson ${n}`]} title={`Lesson ${n}: ${lesson.titleEn}`}
      here={{ shelf: 'book', lesson: n }} sections={sections.map(s => s.title)} clips={clips}>
      <SectionList sections={sections} starts={starts} />
    </AudioShell>
  )
}
