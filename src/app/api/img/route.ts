import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/img?q=<keywords>
 * Returns { url } of a modest, on-topic photo for the teaching deck.
 *
 * Source: Unsplash `search/photos` with content_filter=high (strict, family-
 * friendly) — enforced server-side so no immodest result can come through.
 * Needs UNSPLASH_ACCESS_KEY in the env; without it returns { url: null } and
 * the deck falls back to a safe emoji tile.
 */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim()
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key || !q) return NextResponse.json({ url: null })
  try {
    const api = 'https://api.unsplash.com/search/photos'
      + `?query=${encodeURIComponent(q)}&per_page=3&orientation=landscape&content_filter=high`
    const r = await fetch(api, {
      headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' },
      next: { revalidate: 60 * 60 * 24 }, // cache a day
    })
    if (!r.ok) return NextResponse.json({ url: null })
    const d = await r.json()
    const hit = d?.results?.[0]?.urls
    const url = hit?.small || hit?.regular || null
    return NextResponse.json({ url })
  } catch {
    return NextResponse.json({ url: null })
  }
}
