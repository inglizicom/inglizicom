import { supabase } from './supabase'

/* ── Types ─────────────────────────────────────────────── */
/** A free-form task assigned by staff — NOT a curriculum exercise. It may point
 *  at a lesson; its course then follows that lesson (set in the database). */
export interface StudentAssignment {
  id:           string
  student_id?:  string
  title:        string
  description:  string | null
  link_url:     string | null
  status:       'pending' | 'in_progress' | 'done'
  category:     string
  due_date:     string | null
  course:       string | null
  completed_at: string | null
  is_done?:     boolean
  created_at:   string
  course_id?:   string | null
  lesson_id?:   string | null
}

/* ── Curriculum exercises (049_curriculum_exercises.sql) ── */

export type ExerciseKind =
  | 'lesson_quiz' | 'writing_prompt' | 'external_exercise'
  | 'unit_reading_quiz' | 'unit_exam' | 'unit_conversation'

export type ExerciseStatus =
  | 'not_started' | 'locked' | 'in_progress' | 'attempted' | 'completed'
  | 'passed' | 'failed' | 'pending_review' | 'reviewed'

export interface ExerciseItem {
  kind:   ExerciseKind
  status: ExerciseStatus
  detail: Record<string, any> | null
}
export interface BoardLesson {
  lesson_id: string; title: string; order: number; type: string
  lesson_status: 'not_started' | 'opened' | 'completed'; unlocked: boolean
  items: ExerciseItem[]
}
export interface BoardUnit {
  module_id: string; course_id: string; title: string; order: number
  lessons: BoardLesson[]
  unit_items: ExerciseItem[]
}
export interface BoardTask {
  id: string; title: string; description: string | null; link_url: string | null
  status: 'pending' | 'in_progress' | 'done'; category: string; due_date: string | null
  completed_at: string | null; created_at: string
  lesson_id: string | null; lesson_title: string | null
  module_id: string | null; module_title: string | null
  course_id: string | null; course_title: string | null
}
export interface ExerciseBoard {
  found:   boolean
  courses?: { course_id: string; title: string }[]
  units?:   BoardUnit[]
  tasks?:   BoardTask[]
  summary?: { curriculum_total: number; curriculum_done: number; tasks_total: number; tasks_done: number }
}

export const EXERCISE_KIND_AR: Record<ExerciseKind, string> = {
  lesson_quiz:       'اختبار الدرس',
  writing_prompt:    'تمرين كتابي (تصحيح ذاتي)',
  external_exercise: 'تمرين تطبيقي',
  unit_reading_quiz: 'اختبار القراءة',
  unit_exam:         'اختبار الوحدة',
  unit_conversation: 'محادثة الوحدة (تصحيح الفريق)',
}

export const EXERCISE_STATUS_AR: Record<ExerciseStatus, string> = {
  not_started:    'لم يبدأ',
  locked:         'مقفل',
  in_progress:    'قيد الإنجاز',
  attempted:      'حاولت — لم تنجح بعد',
  completed:      'مكتمل',
  passed:         'ناجح',
  failed:         'لم تنجح بعد',
  pending_review: 'بانتظار التصحيح',
  reviewed:       'مُصحَّح',
}

/** Done = counts toward progress. "Opened" or "attempted" never does. */
export function isExerciseDone(s: ExerciseStatus): boolean {
  return s === 'completed' || s === 'passed' || s === 'reviewed'
}

export async function fetchExerciseBoard(token: string, courseId?: string | null): Promise<ExerciseBoard> {
  const { data, error } = await supabase.rpc('student_exercise_board', {
    p_token: token.trim().toUpperCase(), p_course_id: courseId ?? null,
  })
  if (error) { console.error('fetchExerciseBoard', error.message); return { found: false } }
  return (data ?? { found: false }) as ExerciseBoard
}
export interface StudentFile {
  id:         string
  student_id?: string
  file_name:  string
  file_path:  string
  file_type:  string | null
  size_bytes: number | null
  course:     string | null
  created_at: string
}
export interface StudentExam {
  id:            string
  student_id?:   string
  title:         string
  level:         string | null
  exam_date:     string | null
  score:         number | null
  max_score:     number | null
  passed:        boolean | null
  teacher_note:  string | null
  retry_allowed: boolean
}
export interface StudentActivity {
  event_type:   string
  entity_title: string | null
  created_at:   string
}
export interface PortalLesson {
  id: string; title: string; type: string; order: number
  video_url: string | null; file_url: string | null; exercise_url: string | null
  has_quiz: boolean; is_locked: boolean; content: string | null
  status: 'not_started' | 'opened' | 'completed'
}
export interface PortalModule { id: string; title: string; order: number; lessons: PortalLesson[] }
export interface PortalCourse { id: string; title: string; level: string | null; description: string | null; modules: PortalModule[] }

export interface StudentSpace {
  found:    boolean
  student?: {
    id: string; full_name: string; course: string | null; student_type: string
    teacher_name: string | null; is_active: boolean; verification_token: string
    current_level: string | null; next_level: string | null; learning_stage: string | null
    admin_message: string | null; next_task: string | null
    today_lesson_url: string | null; today_lesson_title: string | null
  }
  courses?:         PortalCourse[]
  /** Staff-assigned tasks. The RPC returns them as `assignments`. */
  assignments?:     StudentAssignment[]
  /** @deprecated never sent by student_space — kept so older demo data still types. */
  exercises?:       StudentAssignment[]
  files?:           StudentFile[]
  exams?:           StudentExam[]
  recent_activity?: StudentActivity[]
  stats?: {
    lessons_total: number; lessons_done: number
    ex_total: number; ex_done: number
    exam_total: number; exam_done: number
    files_total: number; files_opened: number
    overall: number; streak: number; last_activity: string | null
  }
}

const BUCKET = 'student-files'
export function fileUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
export function guessFileType(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['pdf'].includes(ext)) return 'pdf'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image'
  if (['mp3', 'wav', 'm4a', 'ogg'].includes(ext)) return 'audio'
  return 'document'
}

/* ── Device-bound login (anti account-sharing) ─────────── */
export interface StudentDevice { id: string; device_id: string; label: string | null; user_agent: string | null; last_seen: string; created_at: string }
const DEVICE_KEY = 'inglizi.device_id'
export function getDeviceId(): string {
  if (typeof window === 'undefined') return ''
  let id = ''
  try { id = localStorage.getItem(DEVICE_KEY) || '' } catch {}
  if (!id) { id = (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`); try { localStorage.setItem(DEVICE_KEY, id) } catch {} }
  return id
}
function deviceLabel(): string {
  if (typeof navigator === 'undefined') return ''
  const ua = navigator.userAgent
  const os = /iPhone|iPad/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'جهاز'
  const br = /Chrome/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : /Firefox/.test(ua) ? 'Firefox' : 'متصفح'
  return `${os} · ${br}`
}
/** Validate token + register/verify this device. Returns ok or a reason. */
export async function studentLogin(token: string): Promise<{ ok: boolean; reason?: string }> {
  const { data, error } = await supabase.rpc('student_login', {
    p_token: token.trim().toUpperCase(), p_device_id: getDeviceId(),
    p_label: deviceLabel(), p_ua: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 300) : null,
  })
  if (error) { console.error('studentLogin', error.message); return { ok: false, reason: 'error' } }
  return (data ?? { ok: false, reason: 'error' }) as { ok: boolean; reason?: string }
}
/** Is the current device still authorised? Polled so admin "reset" logs the session out live. */
export async function deviceValid(token: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('student_device_valid', { p_token: token.trim().toUpperCase(), p_device_id: getDeviceId() })
  if (error) return true   // network blip → don't kick the student
  return data === true
}
/* CRM device management (staff). */
export async function fetchStudentDevices(studentId: string): Promise<StudentDevice[]> {
  const { data } = await supabase.from('student_devices').select('*').eq('student_id', studentId).order('last_seen', { ascending: false })
  return (data ?? []) as StudentDevice[]
}
export async function deleteStudentDevice(id: string): Promise<void> { await supabase.from('student_devices').delete().eq('id', id) }
export async function resetStudentDevices(studentId: string): Promise<void> { await supabase.from('student_devices').delete().eq('student_id', studentId) }
export async function setDeviceLimit(studentId: string, n: number): Promise<void> { await supabase.from('crm_students').update({ device_limit: Math.max(1, n) }).eq('id', studentId) }

/* Per-unit step progress (reading/exam opened), tracked server-side via activity. */
export type UnitSteps = Record<string, { reading?: boolean; exam?: boolean }>
export async function fetchUnitSteps(token: string): Promise<UnitSteps> {
  const { data } = await supabase.rpc('student_unit_steps', { p_token: token.trim().toUpperCase() })
  return (data ?? {}) as UnitSteps
}

/* ── Portal (token-gated RPCs) ─────────────────────────── */
export async function fetchStudentSpace(token: string): Promise<StudentSpace> {
  const { data, error } = await supabase.rpc('student_space', { p_token: token.trim().toUpperCase() })
  if (error) { console.error('fetchStudentSpace', error.message); return { found: false } }
  return (data ?? { found: false }) as StudentSpace
}
/** Public catalog of all published courses (for the picker's locked courses + pricing). */
export interface CatalogCourse { id: string; title: string; level: string | null; description: string | null; units: number }
export async function fetchCourseCatalog(): Promise<CatalogCourse[]> {
  const { data } = await supabase.rpc('course_catalog')
  return (data ?? []) as CatalogCourse[]
}
export async function completeExercise(token: string, assignmentId: string): Promise<boolean> {
  const { data } = await supabase.rpc('student_complete_exercise', { p_token: token.trim().toUpperCase(), p_assignment_id: assignmentId })
  return data === true
}
export async function logActivity(token: string, event: string, entityType?: string, entityId?: string, title?: string): Promise<void> {
  await supabase.rpc('student_log_activity', {
    p_token: token.trim().toUpperCase(), p_event: event,
    p_entity_type: entityType ?? null, p_entity_id: entityId ?? null, p_title: title ?? null,
  })
}
/** A Bac pack result (see lib/bac-practice.ts), logged as activity. Throws when it doesn't land, so it is sent again later. */
export async function reportBacResult(token: string, r: { event: string; id: string; title: string }): Promise<void> {
  const { data, error } = await supabase.rpc('student_log_activity', {
    p_token: token.trim().toUpperCase(), p_event: r.event, p_entity_type: 'bac', p_entity_id: r.id, p_title: r.title,
  })
  if (error || data === false) throw new Error(error?.message ?? 'not logged')
}
/** Every Bac pack result row (CRM), newest first: one student's, or all students'. Paged past the API's row cap. */
export async function fetchBacActivity(studentId?: string): Promise<{ student_id: string | null; event_type: string; entity_id: string | null; entity_title: string | null; created_at: string }[]> {
  const out: any[] = []
  for (let from = 0; from < 50_000; from += 1000) {
    let q = supabase.from('student_activity').select('student_id, event_type, entity_id, entity_title, created_at')
      .in('event_type', ['bac_exercise', 'bac_mock', 'bac_read']).order('created_at', { ascending: false }).range(from, from + 999)
    if (studentId) q = q.eq('student_id', studentId)
    const { data } = await q
    out.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return out
}
/** Names and phones of the given students (CRM lists). */
export async function fetchStudentNames(ids: string[]): Promise<{ id: string; full_name: string; phone_number: string | null; course: string | null }[]> {
  const out: any[] = []
  for (let i = 0; i < ids.length; i += 200) {
    const { data } = await supabase.from('crm_students').select('id, full_name, phone_number, course').in('id', ids.slice(i, i + 200))
    out.push(...(data ?? []))
  }
  return out
}
/** Presence heartbeat — powers the owner's "online now" panel. Fire every ~60s. */
export async function sendHeartbeat(token: string, activity?: string, courseId?: string | null): Promise<void> {
  try {
    await supabase.rpc('student_heartbeat', {
      p_token: token.trim().toUpperCase(), p_activity: activity ?? null, p_course: courseId ?? null,
    })
  } catch { /* presence is best-effort */ }
}
/** The student's staff-managed profile photo (null → initials avatar). */
export async function fetchStudentAvatar(token: string): Promise<string | null> {
  const { data } = await supabase.rpc('student_avatar', { p_token: token.trim().toUpperCase() })
  return (data ?? null) as string | null
}

/* ── CRM staff side ────────────────────────────────────── */
export async function fetchAssignments(studentId: string): Promise<StudentAssignment[]> {
  const { data } = await supabase.from('student_assignments').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
  return (data ?? []) as StudentAssignment[]
}
export async function addAssignment(input: { studentId: string; title: string; description?: string; linkUrl?: string; category?: string; dueDate?: string; course?: string; assignedBy?: string; lessonId?: string | null }): Promise<void> {
  await supabase.from('student_assignments').insert({
    student_id: input.studentId, title: input.title,
    description: input.description || null, link_url: input.linkUrl || null,
    category: input.category || 'exercise', due_date: input.dueDate || null, course: input.course || null,
    assigned_by: input.assignedBy || null,
    lesson_id: input.lessonId || null,          // course_id is derived from the lesson in the database
  })
}

export interface LessonOption {
  lesson_id: string; lesson_title: string; lesson_order: number
  module_id: string; module_title: string; module_order: number
}
/** Lessons of one course, in path order — for linking a staff task to a lesson. */
export async function fetchLessonOptions(courseId: string): Promise<LessonOption[]> {
  const { data, error } = await supabase.rpc('staff_lesson_options', { p_course_id: courseId })
  if (error) { console.error('fetchLessonOptions', error.message); return [] }
  return (data ?? []) as LessonOption[]
}

/* Curriculum audit (staff): lessons without exercises, orphans, mismatches. */
export interface AuditIssue {
  severity: 'error' | 'warning' | 'info'
  kind: string; detail: string; ref_id: string | null
  course_id: string | null; course_title: string | null
  module_id: string | null; module_title: string | null; module_order: number | null
  lesson_id: string | null; lesson_title: string | null; lesson_order: number | null
}
export interface CurriculumAudit {
  generated_at: string
  summary: { error: number; warning: number; info: number; lessons: number; lessons_with_exercise: number }
  issues: AuditIssue[]
}
export async function fetchCurriculumAudit(): Promise<CurriculumAudit | null> {
  const { data, error } = await supabase.rpc('curriculum_exercise_audit')
  if (error) { console.error('fetchCurriculumAudit', error.message); return null }
  return data as CurriculumAudit
}
export async function deleteAssignment(id: string): Promise<void> {
  await supabase.from('student_assignments').delete().eq('id', id)
}

export async function fetchStudentFiles(studentId: string): Promise<StudentFile[]> {
  const { data } = await supabase.from('student_files').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
  return (data ?? []) as StudentFile[]
}
export async function uploadStudentFile(studentId: string, file: File, uploadedBy?: string, course?: string): Promise<boolean> {
  const path = `${studentId}/${Date.now()}_${file.name.replace(/[^\w.\-]/g, '_')}`
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
  if (upErr) { console.error('uploadStudentFile', upErr.message); return false }
  const { error } = await supabase.from('student_files').insert({
    student_id: studentId, file_name: file.name, file_path: path,
    file_type: guessFileType(file.name), size_bytes: file.size, course: course || null, uploaded_by: uploadedBy || null,
  })
  if (error) { console.error('uploadStudentFile insert', error.message); return false }
  return true
}
export async function deleteStudentFile(id: string, path: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([path])
  await supabase.from('student_files').delete().eq('id', id)
}

/* Profile photo (staff): upload to student-files/avatars, save url on crm_students. */
export async function uploadStudentAvatar(studentId: string, file: File): Promise<string | null> {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `avatars/${studentId}/${Date.now()}.${ext}`
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
  if (upErr) { console.error('uploadStudentAvatar', upErr.message); return null }
  const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  const { error } = await supabase.from('crm_students').update({ avatar_url: url }).eq('id', studentId)
  if (error) { console.error('uploadStudentAvatar save', error.message); return null }
  return url
}
export async function removeStudentAvatar(studentId: string): Promise<void> {
  await supabase.from('crm_students').update({ avatar_url: null }).eq('id', studentId)
}

/* Exams */
export async function fetchExams(studentId: string): Promise<StudentExam[]> {
  const { data } = await supabase.from('student_exams').select('*').eq('student_id', studentId).order('exam_date', { ascending: false })
  return (data ?? []) as StudentExam[]
}
export async function addExam(input: { studentId: string; title: string; level?: string; examDate?: string; score?: number; maxScore?: number; passed?: boolean; teacherNote?: string; retryAllowed?: boolean; createdBy?: string }): Promise<void> {
  await supabase.from('student_exams').insert({
    student_id: input.studentId, title: input.title, level: input.level || null,
    exam_date: input.examDate || null, score: input.score ?? null, max_score: input.maxScore ?? 100,
    passed: input.passed ?? null, teacher_note: input.teacherNote || null,
    retry_allowed: input.retryAllowed ?? false, created_by: input.createdBy || null,
  })
}
export async function deleteExam(id: string): Promise<void> {
  await supabase.from('student_exams').delete().eq('id', id)
}

/* Activity timeline (CRM view) */
export async function fetchStudentActivity(studentId: string, limit = 50): Promise<{ event_type: string; entity_title: string | null; created_at: string }[]> {
  const { data } = await supabase.from('student_activity').select('event_type, entity_title, created_at').eq('student_id', studentId).order('created_at', { ascending: false }).limit(limit)
  return (data ?? []) as any
}

/* ── Path templates ────────────────────────────────────── */
export interface PathTemplate { id: string; name: string; level: string | null; description: string | null; created_at: string }
export interface PathStep { id: string; template_id?: string; step_order: number; title: string; category: string; link_url: string | null; description: string | null }

export async function fetchTemplates(): Promise<PathTemplate[]> {
  const { data } = await supabase.from('path_templates').select('*').order('created_at', { ascending: false })
  return (data ?? []) as PathTemplate[]
}
export async function fetchTemplateSteps(templateId: string): Promise<PathStep[]> {
  const { data } = await supabase.from('path_template_steps').select('*').eq('template_id', templateId).order('step_order')
  return (data ?? []) as PathStep[]
}
export async function createTemplate(input: { name: string; level?: string; description?: string; createdBy?: string }): Promise<string | null> {
  const { data, error } = await supabase.from('path_templates').insert({ name: input.name, level: input.level || null, description: input.description || null, created_by: input.createdBy || null }).select('id').single()
  if (error) { console.error('createTemplate', error.message); return null }
  return (data as { id: string }).id
}
export async function addTemplateStep(input: { templateId: string; order: number; title: string; category?: string; linkUrl?: string; description?: string }): Promise<void> {
  await supabase.from('path_template_steps').insert({ template_id: input.templateId, step_order: input.order, title: input.title, category: input.category || 'exercise', link_url: input.linkUrl || null, description: input.description || null })
}
export async function deleteTemplateStep(id: string): Promise<void> { await supabase.from('path_template_steps').delete().eq('id', id) }
export async function deleteTemplate(id: string): Promise<void> { await supabase.from('path_templates').delete().eq('id', id) }
export async function applyTemplateToStudent(studentId: string, templateId: string, actor?: string): Promise<number> {
  const { data } = await supabase.rpc('apply_path_template', { p_student_id: studentId, p_template_id: templateId, p_actor: actor ?? null })
  return Number(data ?? 0)
}

/* ── Engagement (inactivity follow-up flag) ────────────── */
export interface Engagement { student_id: string; last_activity_at: string | null; activity_count: number }
export async function fetchEngagement(): Promise<Map<string, Engagement>> {
  const { data } = await supabase.rpc('student_engagement')
  const map = new Map<string, Engagement>()
  for (const e of (data ?? []) as Engagement[]) map.set(e.student_id, e)
  return map
}
/** Days since last activity (null = never active). */
export function daysInactive(e?: Engagement): number | null {
  if (!e || !e.last_activity_at) return null
  return Math.floor((Date.now() - new Date(e.last_activity_at).getTime()) / 86400000)
}
