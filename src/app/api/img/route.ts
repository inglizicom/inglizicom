import { NextRequest, NextResponse } from 'next/server'
import { resolveImageUrl } from '@/lib/unit-image'

/**
 * GET /api/img?q=<keywords>
 * Returns { url } of a modest photo for the deck. Cached in the DB so each
 * unique query hits Unsplash at most once (content_filter=high enforced).
 */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim()
  if (!q) return NextResponse.json({ url: null })
  const url = await resolveImageUrl(q)
  return NextResponse.json({ url })
}
