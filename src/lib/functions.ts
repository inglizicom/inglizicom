/**
 * Language Functions — DB-backed access for the teaching deck + CRM editor.
 * Content lives in the `language_functions` table (migration 033); the bundled
 * src/data/functions.ts stays as the offline fallback used when the table is
 * empty or unreachable (e.g. before the migration runs, or no auth session).
 */
import { supabase } from './supabase'
import { FUNCTIONS, type LangFunction } from '@/data/functions'

export type { LangFunction, FnGroup, FnLine } from '@/data/functions'

type Row = {
  id: string; title: string; ar: string; emoji: string; intro: string
  groups: LangFunction['groups']; examples: LangFunction['examples']
  sort_order: number; is_published: boolean
}

const rowToFn = (r: Row): LangFunction => ({
  id: r.id, title: r.title, ar: r.ar, emoji: r.emoji, intro: r.intro,
  groups: r.groups ?? [], examples: r.examples ?? [],
})

/** Published functions for the deck, ordered. Falls back to the bundled seed. */
export async function fetchFunctions(): Promise<LangFunction[]> {
  const { data, error } = await supabase
    .from('language_functions')
    .select('*')
    .eq('is_published', true)
    .order('sort_order')
  if (error || !data || data.length === 0) return FUNCTIONS
  return (data as Row[]).map(rowToFn)
}

/** All functions (incl. unpublished) for the editor. Falls back to the seed. */
export async function fetchAllFunctions(): Promise<LangFunction[]> {
  const { data, error } = await supabase
    .from('language_functions')
    .select('*')
    .order('sort_order')
  if (error || !data || data.length === 0) return FUNCTIONS
  return (data as Row[]).map(rowToFn)
}

/** Persist the whole collection: upsert each (sort_order = list index) and
 *  delete any rows no longer present. Returns an error string on failure. */
export async function saveAllFunctions(list: LangFunction[]): Promise<string | null> {
  const rows = list.map((f, i) => ({
    id: f.id, title: f.title, ar: f.ar, emoji: f.emoji, intro: f.intro,
    groups: f.groups, examples: f.examples, sort_order: i, is_published: true,
    updated_at: new Date().toISOString(),
  }))
  const { error: upErr } = await supabase.from('language_functions').upsert(rows)
  if (upErr) return upErr.message
  const { data: existing, error: selErr } = await supabase.from('language_functions').select('id')
  if (selErr) return selErr.message
  const keep = new Set(list.map(f => f.id))
  const remove = (existing ?? []).map(r => r.id).filter((id: string) => !keep.has(id))
  if (remove.length) {
    const { error: delErr } = await supabase.from('language_functions').delete().in('id', remove)
    if (delErr) return delErr.message
  }
  return null
}
