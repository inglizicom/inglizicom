import { notFound } from 'next/navigation'
import { STOPS } from '@/data/viiza-book'
import { viizaSections } from '@/data/viiza-audio'
import { AudioShell, SectionList, flatten } from '../../_shell'

/** /audio/viiza/16 — the audio of a stop of VIIZA ENGLISH, the travel guide (its opener's QR code opens it). */

export function generateStaticParams() { return STOPS.map(s => ({ n: String(s.n) })) }
export const dynamicParams = false

export default function ViizaStop({ params }: { params: { n: string } }) {
  const n = Number(params.n)
  const stop = STOPS.find(s => s.n === n)
  if (!stop) notFound()
  const sections = viizaSections(n)
  const { clips, starts } = flatten(sections, `VIIZA › Stop ${n}`)
  return (
    <AudioShell crumbs={['VIIZA ENGLISH', 'Travel guide', `Stop ${n}`]} title={`Stop ${n}: ${stop.titleEn}`}
      here={{ shelf: 'viiza', lesson: n }} sections={sections.map(s => s.title)} clips={clips}>
      <SectionList sections={sections} starts={starts} />
    </AudioShell>
  )
}
