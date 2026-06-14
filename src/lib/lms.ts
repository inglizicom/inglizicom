import { supabase } from './supabase'

/* ── Types ─────────────────────────────────────────────── */
export interface LmsCourse { id: string; title: string; level: string | null; description: string | null; is_published: boolean; created_at: string; days_per_unit?: number }
export interface ProgressMeta {
  course_id: string; course_title: string; start_at: string; end_at: string | null; days_per_unit: number
  total_units: number; completed_units: number; current_unit_order: number; current_unit_title: string
  total_lessons: number; done_lessons: number
}
export interface StudentNotification { id: string; type: string; title: string; body: string | null; tab: string | null; is_read: boolean; created_at: string }
/** Public exams/test bank — linked at the end of every unit. */
export const EXAMS_URL = 'https://inglizi.com/exams'
/** Corrector-team WhatsApp (voice notes for unit conversations). */
export const CORRECTOR_WHATSAPP = '212764189311'

export interface UnitSubmission {
  id: string; module_id: string; module_title?: string; conversation_text: string | null
  status: 'pending' | 'reviewed'; feedback: string | null; score: number | null
  reviewed_at: string | null; created_at: string
}
export interface LmsModule { id: string; course_id: string; title: string; module_order: number; reading_text?: string | null; reading_audio_url?: string | null; reading_video_url?: string | null; reading_quiz?: LessonQuiz | null; exam_quiz?: LessonQuiz | null }
export interface UnitReading { title?: string; text: string | null; audio: string | null; video: string | null; quiz: LessonQuiz | null }
export interface LmsLesson {
  id: string; module_id: string; title: string; lesson_order: number
  lesson_type: string; video_url: string | null; file_url: string | null
  exercise_url: string | null; has_quiz: boolean; content: string | null; is_locked: boolean
  quiz?: LessonQuiz | null
}
export interface QuizQuestion { q: string; choices: string[]; answer: number; explain?: string }
export interface LessonExercise { prompt: string; sample_answer?: string }
export interface LessonQuiz { questions: QuizQuestion[]; exercise?: LessonExercise | null }
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
export async function setCourseDaysPerUnit(id: string, days: number): Promise<void> { await supabase.from('lms_courses').update({ days_per_unit: Math.max(1, days) }).eq('id', id) }
export async function fetchProgressMeta(token: string): Promise<ProgressMeta | null> {
  const { data } = await supabase.rpc('student_progress_meta', { p_token: token.trim().toUpperCase() })
  const row = Array.isArray(data) ? data[0] : data
  return (row ?? null) as ProgressMeta | null
}

/* ── Notifications (dashboard center; mirrored to WhatsApp) ── */
export async function fetchNotifications(token: string): Promise<StudentNotification[]> {
  const { data } = await supabase.rpc('student_notifications_list', { p_token: token.trim().toUpperCase() })
  return (data ?? []) as StudentNotification[]
}
export async function markNotificationsRead(token: string): Promise<void> {
  await supabase.rpc('student_notifications_read', { p_token: token.trim().toUpperCase() })
}
/* Create an in-app notification (CRM/staff side) and optionally fan-out to WhatsApp. */
export async function createStudentNotification(studentId: string, n: { type?: string; title: string; body?: string; tab?: string }): Promise<void> {
  await supabase.from('student_notifications').insert({ student_id: studentId, type: n.type || 'info', title: n.title, body: n.body || null, tab: n.tab || null })
}
/* Fire a WhatsApp message via our server route (Meta Cloud API). No-op until env is set. */
export async function sendWhatsApp(phone: string, kind: string, params: Record<string, string>): Promise<boolean> {
  try {
    const r = await fetch('/api/wa/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, kind, params }) })
    const d = await r.json().catch(() => ({}))
    return !!d.sent
  } catch { return false }
}

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
/* Per-unit reading passage: text + course-voice audio + how-to-read video + quiz. */
export async function updateModuleReading(id: string, r: { text?: string | null; audioUrl?: string | null; videoUrl?: string | null; quiz?: LessonQuiz | null }): Promise<void> {
  const patch: Record<string, any> = {}
  if (r.text !== undefined)     patch.reading_text      = r.text || null
  if (r.audioUrl !== undefined) patch.reading_audio_url = r.audioUrl || null
  if (r.videoUrl !== undefined) patch.reading_video_url = r.videoUrl || null
  if (r.quiz !== undefined)     patch.reading_quiz      = r.quiz
  await supabase.from('lms_modules').update(patch).eq('id', id)
}
/* Per-unit TEST (team-authored auto-graded quiz). */
export async function updateModuleExam(id: string, quiz: LessonQuiz | null): Promise<void> {
  await supabase.from('lms_modules').update({ exam_quiz: quiz }).eq('id', id)
}
export async function fetchUnitExam(token: string, moduleId: string): Promise<{ quiz: LessonQuiz | null; passed: boolean } | null> {
  const { data } = await supabase.rpc('student_unit_exam', { p_token: token.trim().toUpperCase(), p_module_id: moduleId })
  return (data ?? null) as { quiz: LessonQuiz | null; passed: boolean } | null
}
export async function submitUnitExam(token: string, moduleId: string, score: number, total: number, answers: number[]): Promise<boolean> {
  const { data } = await supabase.rpc('student_submit_unit_exam', { p_token: token.trim().toUpperCase(), p_module_id: moduleId, p_score: score, p_total: total, p_answers: answers })
  return data === true
}
export async function fetchUnitExams(token: string): Promise<{ module_id: string; passed: boolean }[]> {
  const { data } = await supabase.rpc('student_unit_exams', { p_token: token.trim().toUpperCase() })
  return (data ?? []) as { module_id: string; passed: boolean }[]
}

export async function fetchReadingUnits(token: string): Promise<string[]> {
  const { data } = await supabase.rpc('student_reading_units', { p_token: token.trim().toUpperCase() })
  return (data ?? []) as string[]
}
export async function fetchUnitReading(token: string, moduleId: string): Promise<UnitReading | null> {
  const { data } = await supabase.rpc('student_unit_reading', { p_token: token.trim().toUpperCase(), p_module_id: moduleId })
  if (!data) return null
  return data as UnitReading
}

/* ── Lessons ───────────────────────────────────────────── */
export async function fetchLessons(moduleId: string): Promise<LmsLesson[]> {
  const { data } = await supabase.from('lms_lessons').select('*').eq('module_id', moduleId).order('lesson_order')
  return (data ?? []) as LmsLesson[]
}
export async function addLesson(input: {
  moduleId: string; title: string; order: number; lessonType?: string
  videoUrl?: string; fileUrl?: string; exerciseUrl?: string; hasQuiz?: boolean; content?: string; isLocked?: boolean; quiz?: LessonQuiz | null
}): Promise<void> {
  await supabase.from('lms_lessons').insert({
    module_id: input.moduleId, title: input.title, lesson_order: input.order,
    lesson_type: input.lessonType || 'video', video_url: input.videoUrl || null,
    file_url: input.fileUrl || null, exercise_url: input.exerciseUrl || null,
    has_quiz: input.hasQuiz ?? !!input.quiz, content: input.content || null, is_locked: input.isLocked ?? false,
    quiz: input.quiz ?? null,
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

/* ── Course resources (shared files for ALL enrolled students) ── */
export interface CourseResource { id: string; course_id?: string; title: string; file_path: string; file_type: string | null; size_bytes: number | null; course_title?: string }
const RES_BUCKET = 'student-files'
export function resourceUrl(path: string): string {
  return supabase.storage.from(RES_BUCKET).getPublicUrl(path).data.publicUrl
}
export async function fetchCourseResources(courseId: string): Promise<CourseResource[]> {
  const { data } = await supabase.from('lms_resources').select('*').eq('course_id', courseId).order('created_at', { ascending: false })
  return (data ?? []) as CourseResource[]
}
export async function uploadCourseResource(courseId: string, file: File, by?: string): Promise<boolean> {
  const path = `resources/${courseId}/${Date.now()}_${file.name.replace(/[^\w.\-]/g, '_')}`
  const { error: upErr } = await supabase.storage.from(RES_BUCKET).upload(path, file, { upsert: false })
  if (upErr) { console.error('uploadCourseResource', upErr.message); return false }
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const { error } = await supabase.from('lms_resources').insert({
    course_id: courseId, title: file.name, file_path: path,
    file_type: ext === 'pdf' ? 'pdf' : ext, size_bytes: file.size, created_by: by || null,
  })
  if (error) { console.error('uploadCourseResource insert', error.message); return false }
  return true
}
export async function deleteCourseResource(id: string, path: string): Promise<void> {
  await supabase.storage.from(RES_BUCKET).remove([path])
  await supabase.from('lms_resources').delete().eq('id', id)
}
export async function fetchStudentResources(token: string): Promise<CourseResource[]> {
  const { data } = await supabase.rpc('student_resources', { p_token: token.trim().toUpperCase() })
  return (data ?? []) as CourseResource[]
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

/* ── AI quiz generation (server route uses OPENAI_API_KEY) ─ */
export async function generateQuiz(input: { title: string; level?: string | null; source?: string; count?: number }): Promise<LessonQuiz | null> {
  try {
    const r = await fetch('/api/ai/generate-quiz', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: input.title, level: input.level || undefined, source: input.source || undefined, count: input.count }),
    })
    if (!r.ok) { console.error('generateQuiz', await r.text()); return null }
    const data = await r.json()
    return { questions: data.questions ?? [], exercise: data.exercise ?? null }
  } catch (e) { console.error('generateQuiz', e); return null }
}

/* ── Unit conversation submissions (text in-site, audio via WhatsApp) ── */
export async function submitUnitText(token: string, moduleId: string, text: string): Promise<string | null> {
  const { data } = await supabase.rpc('student_submit_text', { p_token: token.trim().toUpperCase(), p_module_id: moduleId, p_text: text })
  return (data as string) ?? null
}
/** AI correction pass for a unit conversation. If it passes, the submission is
 *  marked reviewed (status='reviewed') server-side and the next unit opens. */
export async function aiCorrectSubmission(token: string, moduleId: string): Promise<{ ok: boolean; correct: boolean; score: number | null; status: string; feedback?: string } | null> {
  try {
    const r = await fetch('/api/ai/correct-submission', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, moduleId }),
    })
    const d = await r.json().catch(() => null)
    return d
  } catch { return null }
}
export async function fetchMySubmissions(token: string): Promise<UnitSubmission[]> {
  const { data } = await supabase.rpc('student_submissions', { p_token: token.trim().toUpperCase() })
  return (data ?? []) as UnitSubmission[]
}
/* CRM corrector side (staff). */
export interface CorrectorSubmission extends UnitSubmission { student_id: string; student_name?: string; student_token?: string; student_phone?: string }
export async function fetchSubmissions(onlyPending = false): Promise<CorrectorSubmission[]> {
  let q = supabase.from('lms_submissions').select('*, crm_students(full_name, verification_token, phone_number), lms_modules(title)').order('created_at', { ascending: false })
  if (onlyPending) q = q.eq('status', 'pending')
  const { data } = await q
  return ((data ?? []) as any[]).map(r => ({
    id: r.id, module_id: r.module_id, module_title: r.lms_modules?.title, conversation_text: r.conversation_text,
    status: r.status, feedback: r.feedback, score: r.score, reviewed_at: r.reviewed_at, created_at: r.created_at,
    student_id: r.student_id, student_name: r.crm_students?.full_name, student_token: r.crm_students?.verification_token,
    student_phone: r.crm_students?.phone_number,
  }))
}
/** Count of conversations awaiting correction (for the sidebar badge). */
export async function countPendingSubmissions(): Promise<number> {
  const { count } = await supabase.from('lms_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending')
  return count ?? 0
}
export async function reviewSubmission(id: string, feedback: string, score: number | null, by?: string): Promise<void> {
  await supabase.from('lms_submissions').update({ feedback, score, status: 'reviewed', reviewed_by: by || null, reviewed_at: new Date().toISOString() }).eq('id', id)
}

/* ── Final exam + certificate (token-gated) ───────────── */
export interface Certificate { cert_number: string; percent: number; level: string; full_name: string; date: string }
export interface FinalExamResult extends Certificate { ok: boolean; passed: boolean; score: number; total: number }
export async function submitFinalExam(token: string, score: number, total: number, speakingPath?: string | null): Promise<FinalExamResult | null> {
  const { data } = await supabase.rpc('student_submit_final_exam', { p_token: token.trim().toUpperCase(), p_score: score, p_total: total, p_speaking_path: speakingPath ?? null })
  if (!data || !data.ok) return null
  return data as FinalExamResult
}
/** Upload the final-exam speaking recording; returns the stored path. */
export async function uploadSpeaking(token: string, blob: Blob): Promise<string | null> {
  try {
    const fd = new FormData(); fd.append('token', token); fd.append('audio', blob, 'speaking.webm')
    const r = await fetch('/api/final-speaking', { method: 'POST', body: fd })
    const d = await r.json().catch(() => ({}))
    return d.ok ? (d.path as string) : null
  } catch { return null }
}
export async function fetchCertificate(token: string): Promise<Certificate | null> {
  const { data } = await supabase.rpc('student_certificate', { p_token: token.trim().toUpperCase() })
  return (data ?? null) as Certificate | null
}

/* ── Student quiz (token-gated) ───────────────────────── */
export async function fetchLessonQuiz(token: string, lessonId: string): Promise<{ quiz: LessonQuiz; best_score: number | null; best_total: number | null } | null> {
  const { data } = await supabase.rpc('student_lesson_quiz', { p_token: token.trim().toUpperCase(), p_lesson_id: lessonId })
  if (!data || !data.quiz) return null
  return data as any
}
export async function submitQuiz(token: string, lessonId: string, score: number, total: number, answers: number[]): Promise<boolean> {
  const { data } = await supabase.rpc('student_submit_quiz', { p_token: token.trim().toUpperCase(), p_lesson_id: lessonId, p_score: score, p_total: total, p_answers: answers })
  return data === true
}

/* ── Portal lesson actions (token-gated) ──────────────── */
export async function openLesson(token: string, lessonId: string): Promise<void> {
  await supabase.rpc('student_open_lesson', { p_token: token.trim().toUpperCase(), p_lesson_id: lessonId })
}
export async function completeLesson(token: string, lessonId: string): Promise<boolean> {
  const { data } = await supabase.rpc('student_complete_lesson', { p_token: token.trim().toUpperCase(), p_lesson_id: lessonId })
  return data === true
}
