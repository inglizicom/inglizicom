import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { EVERYDAY_UNITS, REVIEWS } from '@/data/everyday-book'
import { COOKIE, currentAccess } from '@/lib/viiza-access'
import { PartCheck, type CheckPool } from '../../../viiza/_app/Check'

/**
 * /piirmi/check/[part]: the review check after a group of units (the book's
 * four reviews: units 1–5, 6–10, 11–15, 16–19), for students with PIIRMI
 * access: ten questions made fresh from the units' expressions and words.
 */

export const dynamic = 'force-dynamic'

export default async function PiirmiCheck({ params }: { params: { part: string } }) {
  const r = Number(params.part)
  const range = REVIEWS[r - 1]
  if (!range) notFound()
  const access = await currentAccess(cookies().get(COOKIE)?.value, 'piirmi')
  if (!access) redirect(`/piirmi?locked=${range[0]}#signin`)
  const units = EVERYDAY_UNITS.filter(u => u.n >= range[0] && u.n <= range[1])
  const pool: CheckPool = {
    replies: units.flatMap(u => u.expressions.map(([q, a, qAr, aAr]) => ({ cue: q, cueAr: qAr, reply: a, replyAr: aAr, stop: u.n }))),
    words: units.flatMap(u => u.vocab.map(([, en, ar]) => ({ en, ar, stop: u.n }))),
    lines: units.flatMap(u => u.expressions.map(([, a, , aAr]) => ({ en: a, ar: aAr, stop: u.n }))),
  }
  return (
    <PartCheck
      book={{ product: 'piirmi', base: '/piirmi', part: 'Review', unit: 'Unit', reviewHash: 'expressions' }}
      part={{ n: r, titleEn: `Units ${range[0]}–${range[1]}`, titleAr: 'مراجعة', icon: 'RotateCcw' }}
      stops={units.map(u => ({ n: u.n, titleEn: u.titleEn }))}
      pool={pool}
      clips={{}}
    />
  )
}
