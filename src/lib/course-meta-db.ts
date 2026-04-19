import { unstable_noStore as noStore } from 'next/cache'
import { supabase } from './supabase'

export interface CourseMeta {
  slug:         string
  course_type:  'native' | 'external'
  external_url: string | null
  updated_at:   string
}

export async function fetchCourseMeta(slug: string): Promise<CourseMeta | null> {
  noStore()
  const { data, error } = await supabase
    .from('course_meta')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error) {
    console.error('fetchCourseMeta', error.message)
    return null
  }
  return data as CourseMeta | null
}

export async function fetchAllCourseMeta(): Promise<CourseMeta[]> {
  noStore()
  const { data, error } = await supabase
    .from('course_meta')
    .select('*')
  if (error) {
    console.error('fetchAllCourseMeta', error.message)
    return []
  }
  return (data ?? []) as CourseMeta[]
}

export async function upsertCourseMeta(
  input: Pick<CourseMeta, 'slug' | 'course_type' | 'external_url'>,
) {
  const { error } = await supabase.from('course_meta').upsert(input)
  if (error) throw new Error(error.message)
}
