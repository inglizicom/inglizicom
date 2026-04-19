import { unstable_noStore as noStore } from 'next/cache'
import { supabase } from './supabase'
import type { CurriculumSection } from '@/data/courses'

export interface CourseLessonRow {
  id:             string
  course_slug:    string
  section_title:  string
  section_order:  number
  lesson_title:   string
  duration:       string
  youtube_id:     string
  is_free:        boolean
  sort_order:     number
  created_at?:    string
  updated_at?:    string
}

export async function fetchCourseLessons(slug: string): Promise<CourseLessonRow[]> {
  noStore()
  const { data, error } = await supabase
    .from('course_lessons')
    .select('*')
    .eq('course_slug', slug)
    .order('section_order', { ascending: true })
    .order('sort_order', { ascending: true })
  if (error) {
    console.error('fetchCourseLessons', error.message)
    return []
  }
  return (data ?? []) as CourseLessonRow[]
}

export function groupLessonsIntoSections(rows: CourseLessonRow[]): CurriculumSection[] {
  const byKey = new Map<string, CurriculumSection>()
  for (const row of rows) {
    const key = `${row.section_order}|${row.section_title}`
    let section = byKey.get(key)
    if (!section) {
      section = { title: row.section_title, lessons: [] }
      byKey.set(key, section)
    }
    section.lessons.push({
      title:     row.lesson_title,
      duration:  row.duration,
      youtubeId: row.youtube_id,
      isFree:    row.is_free,
    })
  }
  return Array.from(byKey.values())
}

export async function fetchAllCourseLessons(): Promise<CourseLessonRow[]> {
  noStore()
  const { data, error } = await supabase
    .from('course_lessons')
    .select('*')
    .order('course_slug', { ascending: true })
    .order('section_order', { ascending: true })
    .order('sort_order', { ascending: true })
  if (error) {
    console.error('fetchAllCourseLessons', error.message)
    return []
  }
  return (data ?? []) as CourseLessonRow[]
}

export async function upsertCourseLesson(
  input: Partial<CourseLessonRow> & { course_slug: string; lesson_title: string },
) {
  const { data, error } = await supabase
    .from('course_lessons')
    .upsert(input)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as CourseLessonRow
}

export async function deleteCourseLesson(id: string) {
  const { error } = await supabase.from('course_lessons').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function bootstrapCourseLessons(
  rows: Omit<CourseLessonRow, 'id' | 'created_at' | 'updated_at'>[],
) {
  const slugs = Array.from(new Set(rows.map(r => r.course_slug)))
  if (slugs.length > 0) {
    const { error: delErr } = await supabase
      .from('course_lessons')
      .delete()
      .in('course_slug', slugs)
    if (delErr) throw new Error(delErr.message)
  }
  const { error } = await supabase.from('course_lessons').insert(rows)
  if (error) throw new Error(error.message)
}
