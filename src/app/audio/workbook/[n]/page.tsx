import { notFound } from 'next/navigation'
import { CARD_LESSONS } from '@/data/level1-cards'
import { workbookSections } from '@/data/level1-audio'
import { AudioShell, SectionList, flatten } from '../../_shell'

/** /audio/workbook/13 — the audio of a lesson of the workbook: its words, its sentences (the answers to check), its conversation. */

export function generateStaticParams() { return CARD_LESSONS.map(l => ({ n: String(l.n) })) }
export const dynamicParams = false

export default function WorkbookLesson({ params }: { params: { n: string } }) {
  const n = Number(params.n)
  const lesson = CARD_LESSONS.find(l => l.n === n)
  if (!lesson) notFound()
  const sections = workbookSections(n)
  const { clips, starts } = flatten(sections, `Workbook › Lesson ${n}`)
  return (
    <AudioShell crumbs={['Level 1', 'Workbook', `Lesson ${n}`]} title={`Lesson ${n}: ${lesson.titleEn}`}
      here={{ shelf: 'workbook', lesson: n }} sections={sections.map(s => s.title)} clips={clips}>
      <SectionList sections={sections} starts={starts} openAll />
    </AudioShell>
  )
}
