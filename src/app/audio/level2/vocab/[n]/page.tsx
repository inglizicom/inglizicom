import { notFound } from 'next/navigation'
import { INDEX } from '@/data/level2-book/plan'
import { l2VocabSections } from '@/data/level2-audio'
import { AudioShell, SectionList, flatten } from '../../../_shell'

/** /audio/level2/vocab/13 — the audio of a unit of the Level 2 vocabulary book (its pages' QR code opens it). */

export function generateStaticParams() { return INDEX.map(u => ({ n: String(u.n) })) }
export const dynamicParams = false

export default function Level2VocabUnit({ params }: { params: { n: string } }) {
  const n = Number(params.n)
  const unit = INDEX.find(u => u.n === n)
  if (!unit) notFound()
  const sections = l2VocabSections(n)
  const { clips, starts } = flatten(sections, `Level 2 › Vocabulary book › Unit ${n}`)
  return (
    <AudioShell crumbs={['Level 2', 'Vocabulary book', `Unit ${n}`]} title={`Unit ${n}: ${unit.titleEn}`}
      here={{ shelf: 'l2vocab', lesson: n }} sections={sections.map(s => s.title)} clips={clips}>
      <SectionList sections={sections} starts={starts} />
    </AudioShell>
  )
}
