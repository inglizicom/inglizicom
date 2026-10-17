import { cookies } from 'next/headers'
import { PARTS, STOPS } from '@/data/viiza-book'
import { COOKIE, FREE_STOPS, currentAccess } from '@/lib/viiza-access'
import { Home } from './_app/Home'

/**
 * /viiza: the journey. The server checks the sign-in cookie and sends only
 * the stops' titles; a stop's content is sent by /viiza/[n] once the
 * student may open it.
 */

export const dynamic = 'force-dynamic'

export default async function ViizaHome({ searchParams }: { searchParams: { locked?: string } }) {
  const access = await currentAccess(cookies().get(COOKIE)?.value)
  return (
    <Home
      parts={PARTS.map(({ n, titleEn, titleAr, icon }) => ({ n, titleEn, titleAr, icon }))}
      stops={STOPS.map(({ n, part, titleEn, titleAr, icon }) => ({ n, part, titleEn, titleAr, icon }))}
      access={access ? { name: access.name, until: access.until } : null}
      free={FREE_STOPS}
      locked={Number(searchParams.locked) || undefined}
    />
  )
}
