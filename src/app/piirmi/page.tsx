import { cookies } from 'next/headers'
import { EVERYDAY_UNITS, REVIEWS } from '@/data/everyday-book'
import { COOKIE, FREE, currentAccess } from '@/lib/viiza-access'
import { PiirmiHome } from './_app/Home'

/**
 * /piirmi: the book's 19 units, its four reviews and the sticker album. The
 * server checks the sign-in and sends only the units' titles; a unit's
 * content is sent by /piirmi/[n] once the student may open it.
 */

export const dynamic = 'force-dynamic'

export default async function PiirmiHomePage({ searchParams }: { searchParams: { locked?: string } }) {
  const access = await currentAccess(cookies().get(COOKIE)?.value, 'piirmi')
  return (
    <PiirmiHome
      units={EVERYDAY_UNITS.map(({ n, titleEn, titleAr, icons }) => ({ n, titleEn, titleAr, icon: icons[0] }))}
      reviews={REVIEWS}
      access={access ? { name: access.name, until: access.until } : null}
      free={FREE.piirmi}
      locked={Number(searchParams.locked) || undefined}
    />
  )
}
