import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { buildEverydayBook, EVERYDAY_UNITS, EXTRAS, OPENERS, REVIEWS } from '@/data/everyday-book'
import { COOKIE, FREE, currentAccess } from '@/lib/viiza-access'
import { toJson } from '../_app/serial'
import { UnitApp } from '../_app/Unit'

/**
 * /piirmi/[n]: one unit of PIIRMI interactive. Only a signed-in student
 * with PIIRMI access (or anyone, for the free sample units) gets the
 * unit's content and its printed pages; everyone else goes back to sign in.
 */

export const dynamic = 'force-dynamic'

export default async function PiirmiUnit({ params }: { params: { n: string } }) {
  const n = Number(params.n)
  const u = EVERYDAY_UNITS.find(x => x.n === n)
  if (!u) notFound()
  const access = await currentAccess(cookies().get(COOKIE)?.value, 'piirmi')
  if (!access && !FREE.piirmi.includes(n)) redirect(`/piirmi?locked=${n}#signin`)

  const book = buildEverydayBook()
  const pages = book.pages.filter(p => p.unit === n)
  const i = EVERYDAY_UNITS.indexOf(u)
  const near = (x: (typeof EVERYDAY_UNITS)[number] | undefined) => (x ? { n: x.n, titleEn: x.titleEn } : null)
  return (
    <UnitApp
      unit={u}
      opener={OPENERS[n]}
      extras={EXTRAS[n]}
      review={REVIEWS.findIndex(([a, b]) => n >= a && n <= b) + 1}
      prev={near(EVERYDAY_UNITS[i - 1])}
      next={near(EVERYDAY_UNITS[i + 1])}
      sample={!access}
      pagesJson={toJson(pages)}
      pageNos={pages.map(p => book.pageNo(p))}
      parts={{ vocab: book.unitPage(n, 'vocab'), expressions: book.unitPage(n, 'expressions'), talk: book.unitPage(n, 'talk'), reading: book.unitPage(n, 'reading') }}
    />
  )
}
