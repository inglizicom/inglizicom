import { supabase } from './supabase'

/* ── Types ─────────────────────────────────────────────── */
export interface LmsCourse { id: string; title: string; level: string | null; description: string | null; is_published: boolean; created_at: string }
export interface LmsModule { id: string; course_id: string; title: string; module_order: number }
export interface LmsLesson {
  id: string; module_id: string; title: string; lesson_order: number
  lesson_type: string; video_url: string | null; file_url: string | null
  exercise_url: string | null; has_quiz: boolean; content: string | null; is_locked: boolean
  quiz?: QuizQuestion[] | null
}
export interface QuizQuestion { q: string; choices: string[]; answer: number; explain?: string }
export interface LessonExercise { prompt: string; sample_answer?: string }
export interface CourseProgress { course_id: string; title: string; level: string | null; total: number; done: number; progress: number }

export const LESSON_TYPES = [
  { id: 'video', label: 'فيديو' }, { id: 'reading', label: 'قراءة' },
  { id: 'exercise', label: 'تمرين' }, { id: 'quiz', label: 'اختبار' }, { id: 'speaking', label: 'محادثة' },
]

/* ── Courses ───────────────────────────────────────────── */
export async function fetchCourses(): Promise<LmsCourse[]> {
  const { data } = await supabase.from('lms_courses').select('*').order('created_at', { ascending: false })
  return (data ?? []) as LmsCourse[]
}
export async function createCourse(input: { title: string; level?: string; description?: string; createdBy?: string }): Promise<string | null> {
  const { data, error } = await supabase.from('lms_courses').insert({ title: input.title, level: input.level || null, description: input.description || null, created_by: input.createdBy || null }).select('id').single()
  if (error) { console.error('createCourse', error.message); return null }
  return (data as { id: string }).id
}
export async function deleteCourse(id: string): Promise<void> { await supabase.from('lms_courses').delete().eq('id', id) }
export async function setCoursePublished(id: string, v: boolean): Promise<void> { await supabase.from('lms_courses').update({ is_published: v }).eq('id', id) }

/* ── Modules ───────────────────────────────────────────── */
export async function fetchModules(courseId: string): Promise<LmsModule[]> {
  const { data } = await supabase.from('lms_modules').select('*').eq('course_id', courseId).order('module_order')
  return (data ?? []) as LmsModule[]
}
export async function addModule(courseId: string, title: string, order: number): Promise<void> {
  await supabase.from('lms_modules').insert({ course_id: courseId, title, module_order: order })
}
export async function updateModule(id: string, title: string): Promise<void> {
  await supabase.from('lms_modules').update({ title }).eq('id', id)
}
export async function deleteModule(id: string): Promise<void> { await supabase.from('lms_modules').delete().eq('id', id) }
/* Persist a new module order (1-based) from the given sequence of ids. */
export async function reorderModules(orderedIds: string[]): Promise<void> {
  await Promise.all(orderedIds.map((id, i) => supabase.from('lms_modules').update({ module_order: i + 1 }).eq('id', id)))
}

/* ── Lessons ───────────────────────────────────────────── */
export async function fetchLessons(moduleId: string): Promise<LmsLesson[]> {
  const { data } = await supabase.from('lms_lessons').select('*').eq('module_id', moduleId).order('lesson_order')
  return (data ?? []) as LmsLesson[]
}
export async function addLesson(input: {
  moduleId: string; title: string; order: number; lessonType?: string
  videoUrl?: string; fileUrl?: string; exerciseUrl?: string; hasQuiz?: boolean; content?: string; isLocked?: boolean
}): Promise<void> {
  await supabase.from('lms_lessons').insert({
    module_id: input.moduleId, title: input.title, lesson_order: input.order,
    lesson_type: input.lessonType || 'video', video_url: input.videoUrl || null,
    file_url: input.fileUrl || null, exercise_url: input.exerciseUrl || null,
    has_quiz: input.hasQuiz ?? false, content: input.content || null, is_locked: input.isLocked ?? false,
  })
}
export async function updateLesson(id: string, fields: {
  title?: string; lessonType?: string; videoUrl?: string | null; fileUrl?: string | null
  exerciseUrl?: string | null; hasQuiz?: boolean; content?: string | null; isLocked?: boolean; quiz?: any
}): Promise<void> {
  const patch: Record<string, any> = {}
  if (fields.title !== undefined)       patch.title        = fields.title
  if (fields.lessonType !== undefined)  patch.lesson_type  = fields.lessonType
  if (fields.videoUrl !== undefined)    patch.video_url    = fields.videoUrl || null
  if (fields.fileUrl !== undefined)     patch.file_url     = fields.fileUrl || null
  if (fields.exerciseUrl !== undefined) patch.exercise_url = fields.exerciseUrl || null
  if (fields.hasQuiz !== undefined)     patch.has_quiz     = fields.hasQuiz
  if (fields.content !== undefined)     patch.content      = fields.content || null
  if (fields.isLocked !== undefined)    patch.is_locked    = fields.isLocked
  if (fields.quiz !== undefined)        patch.quiz         = fields.quiz
  await supabase.from('lms_lessons').update(patch).eq('id', id)
}
export async function deleteLesson(id: string): Promise<void> { await supabase.from('lms_lessons').delete().eq('id', id) }
export async function toggleLessonLock(id: string, locked: boolean): Promise<void> { await supabase.from('lms_lessons').update({ is_locked: locked }).eq('id', id) }
/* Persist a new lesson order (1-based) within a module. */
export async function reorderLessons(orderedIds: string[]): Promise<void> {
  await Promise.all(orderedIds.map((id, i) => supabase.from('lms_lessons').update({ lesson_order: i + 1 }).eq('id', id)))
}

/* Count lessons in a course (for the authoring summary) */
export async function countCourseLessons(courseId: string): Promise<number> {
  const { data: mods } = await supabase.from('lms_modules').select('id').eq('course_id', courseId)
  const ids = (mods ?? []).map((m: any) => m.id)
  if (ids.length === 0) return 0
  const { count } = await supabase.from('lms_lessons').select('id', { count: 'exact', head: true }).in('module_id', ids)
  return count ?? 0
}

/* ── Enrollment ────────────────────────────────────────── */
export async function fetchEnrollments(studentId: string): Promise<{ id: string; course_id: string }[]> {
  const { data } = await supabase.from('lms_enrollments').select('id, course_id').eq('student_id', studentId)
  return (data ?? []) as any
}
export async function enrollStudent(studentId: string, courseId: string, by?: string): Promise<void> {
  await supabase.from('lms_enrollments').insert({ student_id: studentId, course_id: courseId, created_by: by || null })
}
export async function unenrollStudent(studentId: string, courseId: string): Promise<void> {
  await supabase.from('lms_enrollments').delete().eq('student_id', studentId).eq('course_id', courseId)
}
export async function fetchCourseProgress(studentId: string): Promise<CourseProgress[]> {
  const { data } = await supabase.rpc('student_course_progress', { p_student: studentId })
  return (data ?? []) as CourseProgress[]
}

/* ── Portal lesson actions (token-gated) ──────────────── */
export async function openLesson(token: string, lessonId: string): Promise<void> {
  await supabase.rpc('student_open_lesson', { p_token: token.trim().toUpperCase(), p_lesson_id: lessonId })
}
export async function completeLesson(token: string, lessonId: string): Promise<boolean> {
  const { data } = await supabase.rpc('student_complete_lesson', { p_token: token.trim().toUpperCase(), p_lesson_id: lessonId })
  return data === true
}
