import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { PARTS, STOPS } from '@/data/viiza-book'
import { viizaStopAudio } from '@/data/viiza-audio'
import { COOKIE, currentAccess } from '@/lib/viiza-access'
import { PartCheck, type CheckPool } from '../../_app/Check'

/**
 * /viiza/check/[part]: the self-test at the end of a part, for students
 * with VIIZA access. The server sends only what the questions are made of
 * (the part's replies, key words and sentences) and their clips.
 */

export const dynamic = 'force-dynamic'

export default async function ViizaPartCheck({ params }: { params: { part: string } }) {
  const n = Number(params.part)
  const part = PARTS.find(p => p.n === n)
  if (!part) notFound()
  const access = await currentAccess(cookies().get(COOKIE)?.value)
  if (!access) redirect(`/viiza?locked=${STOPS.find(s => s.part === n)?.n ?? 1}#signin`)
  const stops = STOPS.filter(s => s.part === n)
  const pool: CheckPool = {
    replies: stops.flatMap(s => (s.more?.replies ?? []).map(([en, ar], i) => ({ cue: s.hear[i][0], cueAr: s.hear[i][1], reply: en, replyAr: ar, stop: s.n }))),
    words: stops.flatMap(s => s.words.map(([en, ar]) => ({ en, ar, stop: s.n }))),
    lines: stops.flatMap(s => s.say.map(([en, ar]) => ({ en, ar, stop: s.n }))),
  }
  const clips = Object.assign({}, ...stops.map(s => viizaStopAudio(s.n)))
  return <PartCheck part={{ n: part.n, titleEn: part.titleEn, titleAr: part.titleAr, icon: part.icon }} stops={stops.map(s => ({ n: s.n, titleEn: s.titleEn }))} pool={pool} clips={clips} />
}
