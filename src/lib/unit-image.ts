import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

/** Slug used to name a phrase's image file (matches public/deck-images/<slug>.jpg). */
export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}
const EXTS = ['jpg', 'jpeg', 'png', 'webp', 'avif']
const DECK_DIR = path.join(process.cwd(), 'public', 'deck-images')

/** If the teacher dropped a picture for this phrase, return its public URL. */
export function localImageUrl(en: string): string | null {
  if (!en) return null
  const base = slugify(en)
  for (const ext of EXTS) if (fs.existsSync(path.join(DECK_DIR, `${base}.${ext}`))) return `/deck-images/${base}.${ext}`
  return null
}
/** Absolute path of a local picture (for embedding into the offline export). */
export function localImageFile(en: string): string | null {
  if (!en) return null
  const base = slugify(en)
  for (const ext of EXTS) { const p = path.join(DECK_DIR, `${base}.${ext}`); if (fs.existsSync(p)) return p }
  return null
}

/**
 * Resolve a search query to a modest image URL, caching the result in
 * lms_image_cache so each unique query hits the Unsplash API only ONCE, ever.
 * After the first resolve, the deck and the offline export serve from the cache
 * with no API calls — so the 50/hour Demo limit stops being a problem.
 */

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
}

export async function resolveImageUrl(query: string): Promise<string | null> {
  const q = query.trim().toLowerCase()
  if (!q) return null
  const db = admin()

  // 1) cache hit?
  const { data: cached } = await db.from('lms_image_cache').select('url').eq('q', q).maybeSingle()
  if (cached) return cached.url ?? null

  // 2) resolve from Unsplash (content_filter=high = modest)
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) return null
  try {
    const r = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=1&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' } },
    )
    if (!r.ok) return null // rate-limited or error → don't cache, fall back to emoji
    const d = await r.json()
    const url = d?.results?.[0]?.urls?.small || d?.results?.[0]?.urls?.regular || null
    if (url) await db.from('lms_image_cache').upsert({ q, url }) // 3) store for next time
    return url
  } catch {
    return null
  }
}
