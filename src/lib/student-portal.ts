import { supabase } from './supabase'

/* ── Types ─────────────────────────────────────────────── */
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
export interface StudentSpace {
  found:    boolean
  student?: {
    id: string; full_name: string; course: string | null; student_type: string
    enrollment_date: string; course_end_date: string | null; teacher_name: string | null
    is_active: boolean; verification_token: string
    current_level: string | null; next_level: string | null; learning_stage: string | null
    subscription_start: string | null; billing_type: string | null
    admin_message: string | null; next_task: string | null
    today_lesson_url: string | null; today_lesson_title: string | null
  }
  exercises?:       StudentAssignment[]
  files?:           StudentFile[]
  exams?:           StudentExam[]
  recent_activity?: StudentActivity[]
  stats?: {
    ex_done: number; ex_total: number
    exam_done: number; exam_total: number
    files_total: number; files_opened: number; lessons_opened: number
    overall: number; streak: number; last_activity: string | null
    categories: Record<string, { done: number; total: number }>
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

/* ── Portal (token-gated RPCs) ─────────────────────────── */
export async function fetchStudentSpace(token: string): Promise<StudentSpace> {
  const { data, error } = await supabase.rpc('student_space', { p_token: token.trim().toUpperCase() })
  if (error) { console.error('fetchStudentSpace', error.message); return { found: false } }
  return (data ?? { found: false }) as StudentSpace
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

/* ── CRM staff side ────────────────────────────────────── */
export async function fetchAssignments(studentId: string): Promise<StudentAssignment[]> {
  const { data } = await supabase.from('student_assignments').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
  return (data ?? []) as StudentAssignment[]
}
export async function addAssignment(input: { studentId: string; title: string; description?: string; linkUrl?: string; category?: string; dueDate?: string; course?: string; assignedBy?: string }): Promise<void> {
  await supabase.from('student_assignments').insert({
    student_id: input.studentId, title: input.title,
    description: input.description || null, link_url: input.linkUrl || null,
    category: input.category || 'exercise', due_date: input.dueDate || null, course: input.course || null,
    assigned_by: input.assignedBy || null,
  })
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
