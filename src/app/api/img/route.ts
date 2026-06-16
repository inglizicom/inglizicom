import { NextRequest, NextResponse } from 'next/server'
import { resolveImageUrl, localImageUrl, slotImageUrl } from '@/lib/unit-image'

/**
 * GET /api/img?en=<phrase>&q=<keywords>&unit=<N>&i=<phraseIndex>
 * Returns { url } for a deck slide. Priority:
 *   1) the teacher's positional picture public/deck-images/unit-<N>/<letter><i>.jpg
 *   2) the teacher's picture named by phrase public/deck-images/<slug>.jpg
 *   3) a cached Unsplash photo (content_filter=high), resolved once per query
 */
export async function GET(req: NextRequest) {
  const en = (req.nextUrl.searchParams.get('en') || '').trim()
  const q = (req.nextUrl.searchParams.get('q') || en).trim()
  const unit = parseInt(req.nextUrl.searchParams.get('unit') || '', 10)
  const i = parseInt(req.nextUrl.searchParams.get('i') || '', 10)
  if (unit && i) { const slot = slotImageUrl(unit, i); if (slot) return NextResponse.json({ url: slot, own: true }) }
  if (en) { const local = localImageUrl(en); if (local) return NextResponse.json({ url: local, own: true }) }
  if (!q) return NextResponse.json({ url: null })
  return NextResponse.json({ url: await resolveImageUrl(q) })
}
