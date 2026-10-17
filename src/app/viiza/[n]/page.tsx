import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { PARTS, STOPS } from '@/data/viiza-book'
import { viizaStopAudio } from '@/data/viiza-audio'
import { COOKIE, FREE_STOPS, currentAccess } from '@/lib/viiza-access'
import { StopApp } from '../_app/Stop'

/**
 * /viiza/[n]: one stop of VIIZA interactive. Only a signed-in student with
 * VIIZA access (or anyone, for the free sample stops) gets the stop's
 * content; everyone else goes back to the journey to sign in.
 */

export const dynamic = 'force-dynamic'

export default async function ViizaStop({ params }: { params: { n: string } }) {
  const n = Number(params.n)
  const s = STOPS.find(x => x.n === n)
  if (!s) notFound()
  const access = await currentAccess(cookies().get(COOKIE)?.value)
  if (!access && !FREE_STOPS.includes(n)) redirect(`/viiza?locked=${n}#signin`)
  const i = STOPS.indexOf(s)
  const near = (x: (typeof STOPS)[number] | undefined) => (x ? { n: x.n, titleEn: x.titleEn } : null)
  return (
    <StopApp
      stop={s}
      part={PARTS.find(p => p.n === s.part)!}
      prev={near(STOPS[i - 1])}
      next={near(STOPS[i + 1])}
      clips={viizaStopAudio(n)}
      sample={!access}
    />
  )
}
