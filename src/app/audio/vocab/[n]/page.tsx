import { notFound } from 'next/navigation'
import { CARD_LESSONS } from '@/data/level1-cards'
import { vocabSections } from '@/data/level1-audio'
import { AudioShell, SectionList, flatten } from '../../_shell'

/** /audio/vocab/13 — the audio of a lesson of the extended vocabulary book (its pages' QR code opens it). */

export function generateStaticParams() { return CARD_LESSONS.map(l => ({ n: String(l.n) })) }
export const dynamicParams = false

export default function VocabLesson({ params }: { params: { n: string } }) {
  const n = Number(params.n)
  const lesson = CARD_LESSONS.find(l => l.n === n)
  if (!lesson) notFound()
  const sections = vocabSections(n)
  const { clips, starts } = flatten(sections, `Vocabulary book › Lesson ${n}`)
  return (
    <AudioShell crumbs={['Level 1', 'Vocabulary book', `Lesson ${n}`]} title={`Lesson ${n}: ${lesson.titleEn}`}
      here={{ shelf: 'vocab', lesson: n }} sections={sections.map(s => s.title)} clips={clips}>
      <SectionList sections={sections} starts={starts} />
    </AudioShell>
  )
}
