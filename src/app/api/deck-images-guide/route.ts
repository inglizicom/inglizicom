import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { slugify } from '@/lib/unit-image'

/**
 * GET /api/deck-images-guide
 * Downloads a .txt listing every phrase and the exact filename to use when the
 * teacher adds their own picture in public/deck-images/.
 */
const COURSE = '53f91433-429b-473e-87e6-20739206a3e3'

export async function GET() {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
  const { data } = await db
    .from('vocab_words')
    .select('en, module_id, lms_modules!inner(title, module_order)')
    .eq('course_id', COURSE)
  const rows = (data || []) as unknown as { en: string; lms_modules: { title: string; module_order: number } }[]

  const byUnit = new Map<number, { title: string; items: string[] }>()
  for (const r of rows) {
    const m = r.lms_modules
    if (!byUnit.has(m.module_order)) byUnit.set(m.module_order, { title: m.title, items: [] })
    byUnit.get(m.module_order)!.items.push(`  ${slugify(r.en)}.jpg   ←  ${r.en}`)
  }

  let out = 'DECK IMAGE FILENAMES\n====================\n'
    + 'Drop your pictures in: public/deck-images/\n'
    + 'Name each file exactly as shown below (left). Your picture overrides the auto photo.\n\n'
  for (const k of [...byUnit.keys()].sort((a, b) => a - b)) {
    const u = byUnit.get(k)!
    out += `\n${u.title}\n${'-'.repeat(u.title.length)}\n` + [...new Set(u.items)].sort().join('\n') + '\n'
  }

  return new NextResponse(out, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Disposition': 'attachment; filename="deck-image-filenames.txt"' },
  })
}
