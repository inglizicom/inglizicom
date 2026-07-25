import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/img/search?q=<query>  →  { provider, results: [{ thumb, full, credit, link }] }
 *
 * Image search for the teaching notepad (/admin/present/writing). The API keys stay
 * on the server — the browser never sees them, and Unsplash/Google both refuse
 * cross-origin calls from a page anyway.
 *
 * Provider order:
 *   1) Google Programmable Search, IF both GOOGLE_CSE_KEY and GOOGLE_CSE_CX are set.
 *      Google has no open Images API; this is the only sanctioned route, and its free
 *      tier is 100 queries/day. Set the engine to "Search the entire web" + Image search.
 *   2) Unsplash (UNSPLASH_ACCESS_KEY — already configured for the deck slides).
 *      Fewer "any picture on the web" results, but every photo is licensed for
 *      commercial use, which matters for a paid course.
 *
 * Results are cached in memory per query so flipping back to a search you already ran
 * costs no quota. The cache dies with the server process, which is fine.
 */

export const runtime = 'nodejs'

type Hit = { thumb: string; full: string; credit: string; link: string }
type Payload = { provider: string; results: Hit[]; term?: string }

const TTL_MS = 30 * 60 * 1000
const MAX = 24
const cache = new Map<string, { at: number; payload: Payload }>()

function cached(k: string): Payload | null {
  const e = cache.get(k)
  if (!e) return null
  if (Date.now() - e.at > TTL_MS) { cache.delete(k); return null }
  return e.payload
}

function store(k: string, payload: Payload) {
  // Keep the map from growing without bound across a long recording session.
  if (cache.size > 120) for (const key of Array.from(cache.keys()).slice(0, 40)) cache.delete(key)
  cache.set(k, { at: Date.now(), payload })
}

/* Stock-photo indexes are English-only, so an Arabic query returns nothing — and
   Arabic is the teaching language here. Translate it to a few English keywords first.
   Cheap, cached with the results, and it degrades to the raw query if the call fails. */
const hasArabic = (s: string) => /[؀-ۿ]/.test(s)

async function toEnglish(q: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return q
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        max_tokens: 20,
        messages: [
          { role: 'system', content: 'Translate the user\'s Arabic into 1-3 English keywords for a stock-photo search. Reply with the keywords only — no quotes, no punctuation, no explanation.' },
          { role: 'user', content: q },
        ],
      }),
    })
    if (!r.ok) return q
    const d = await r.json()
    const out = (d?.choices?.[0]?.message?.content || '').trim().replace(/["'.]/g, '')
    return out && !hasArabic(out) ? out.slice(0, 60) : q
  } catch { return q }
}

async function google(q: string): Promise<Payload | null> {
  const key = process.env.GOOGLE_CSE_KEY
  const cx = process.env.GOOGLE_CSE_CX
  if (!key || !cx) return null
  const url = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&searchType=image&safe=active&num=10&q=${encodeURIComponent(q)}`
  const r = await fetch(url)
  if (!r.ok) return null
  const d = await r.json()
  const results: Hit[] = (d?.items ?? []).map((it: any) => ({
    thumb: it?.image?.thumbnailLink || it?.link,
    full: it?.link,
    credit: it?.displayLink || '',
    link: it?.image?.contextLink || it?.link,
  })).filter((h: Hit) => h.thumb && h.full)
  return results.length ? { provider: 'google', results } : null
}

async function unsplash(q: string): Promise<Payload | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) return null
  const r = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=${MAX}&content_filter=high`,
    { headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' } },
  )
  if (!r.ok) return null
  const d = await r.json()
  const results: Hit[] = (d?.results ?? []).map((p: any) => ({
    thumb: p?.urls?.thumb,
    full: p?.urls?.regular || p?.urls?.small,
    credit: p?.user?.name ? `${p.user.name} / Unsplash` : 'Unsplash',
    link: p?.links?.html || '',
  })).filter((h: Hit) => h.thumb && h.full)
  return results.length ? { provider: 'unsplash', results } : null
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim()
  if (q.length < 2) return NextResponse.json({ provider: 'none', results: [] })

  const k = q.toLowerCase()
  const hit = cached(k)
  if (hit) return NextResponse.json(hit)

  try {
    // Google indexes Arabic fine; Unsplash does not. Only pay for a translation when
    // we are actually going to fall through to the stock-photo search.
    const useGoogle = !!(process.env.GOOGLE_CSE_KEY && process.env.GOOGLE_CSE_CX)
    const term = (!useGoogle && hasArabic(q)) ? await toEnglish(q) : q

    const payload = (await google(term)) ?? (await unsplash(term))
    if (!payload) return NextResponse.json({ provider: 'none', results: [], error: 'no-provider' })
    if (term !== q) payload.term = term          // so the panel can show what was searched
    store(k, payload)
    return NextResponse.json(payload)
  } catch {
    return NextResponse.json({ provider: 'none', results: [], error: 'search-failed' })
  }
}
