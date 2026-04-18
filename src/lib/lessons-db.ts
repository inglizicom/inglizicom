import { supabase } from './supabase'
import type { LessonData } from '@/data/lessons-data'

export type LessonStatus = 'draft' | 'published'

export interface LessonRow extends LessonData {
  status:      LessonStatus
  sort_order:  number
  created_at?: string
  updated_at?: string
}

export async function fetchPublishedLessons(): Promise<LessonRow[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('status', 'published')
    .order('sort_order')
  if (error) { console.error('fetchPublishedLessons', error.message); return [] }
  return (data ?? []) as LessonRow[]
}

export async function fetchAllLessons(): Promise<LessonRow[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .order('sort_order')
  if (error) { console.error('fetchAllLessons', error.message); return [] }
  return (data ?? []) as LessonRow[]
}

export async function fetchLessonById(id: string): Promise<LessonRow | null> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null
  return data as LessonRow
}

export async function upsertLesson(input: Partial<LessonRow> & { id: string }) {
  const { data, error } = await supabase
    .from('lessons')
    .upsert(input, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as LessonRow
}

export async function deleteLesson(id: string) {
  const { error } = await supabase.from('lessons').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function bootstrapLessons(rows: LessonRow[]) {
  const { error } = await supabase.from('lessons').upsert(rows, { onConflict: 'id' })
  if (error) throw new Error(error.message)
}
