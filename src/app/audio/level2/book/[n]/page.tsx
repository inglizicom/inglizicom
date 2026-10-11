import { notFound } from 'next/navigation'
import { INDEX } from '@/data/level2-book/plan'
import { l2BookSections } from '@/data/level2-audio'
import { AudioShell, SectionList, flatten } from '../../../_shell'

/** /audio/level2/book/13 — the audio of a unit of the Level 2 course book (its pages' and its workbook pages' QR codes open it). */

export function generateStaticParams() { return INDEX.map(u => ({ n: String(u.n) })) }
export const dynamicParams = false

export default function Level2BookUnit({ params }: { params: { n: string } }) {
  const n = Number(params.n)
  const unit = INDEX.find(u => u.n === n)
  if (!unit) notFound()
  const sections = l2BookSections(n)
  const { clips, starts } = flatten(sections, `Level 2 › Unit ${n}`)
  return (
    <AudioShell crumbs={['Level 2', 'Course book', `Unit ${n}`]} title={`Unit ${n}: ${unit.titleEn}`}
      here={{ shelf: 'l2book', lesson: n }} sections={sections.map(s => s.title)} clips={clips}>
      <SectionList sections={sections} starts={starts} />
    </AudioShell>
  )
}
