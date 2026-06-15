import { NextRequest, NextResponse } from 'next/server'
import { resolveImageUrl, localImageUrl } from '@/lib/unit-image'

/**
 * GET /api/img?en=<phrase>&q=<keywords>
 * Returns { url } for a deck slide. Priority:
 *   1) the teacher's own picture in public/deck-images/<slug>.jpg (if present)
 *   2) a cached Unsplash photo (content_filter=high), resolved once per query
 */
export async function GET(req: NextRequest) {
  const en = (req.nextUrl.searchParams.get('en') || '').trim()
  const q = (req.nextUrl.searchParams.get('q') || en).trim()
  if (en) { const local = localImageUrl(en); if (local) return NextResponse.json({ url: local, own: true }) }
  if (!q) return NextResponse.json({ url: null })
  return NextResponse.json({ url: await resolveImageUrl(q) })
}
