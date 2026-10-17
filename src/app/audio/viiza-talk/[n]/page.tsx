import { notFound } from 'next/navigation'
import { STOPS } from '@/data/viiza-book'
import { viizaTalkSections } from '@/data/viiza-audio'
import { AudioShell, SectionList, flatten } from '../../_shell'

/** /audio/viiza-talk/16 — a stop of VIIZA Words & Conversations: its new words and four conversations (its page's QR code opens it). */

export function generateStaticParams() { return STOPS.map(s => ({ n: String(s.n) })) }
export const dynamicParams = false

export default function ViizaTalkStop({ params }: { params: { n: string } }) {
  const n = Number(params.n)
  const stop = STOPS.find(s => s.n === n)
  if (!stop) notFound()
  const sections = viizaTalkSections(n)
  const { clips, starts } = flatten(sections, `VIIZA Conversations › Stop ${n}`)
  return (
    <AudioShell crumbs={['VIIZA ENGLISH', 'Words & conversations', `Stop ${n}`]} title={`Stop ${n}: ${stop.titleEn}`}
      here={{ shelf: 'viizaTalk', lesson: n }} sections={sections.map(s => s.title)} clips={clips}>
      <SectionList sections={sections} starts={starts} />
    </AudioShell>
  )
}
