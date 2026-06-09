import { supabase } from './supabase'

export interface StudentAssignment {
  id:          string
  student_id?: string
  title:       string
  description: string | null
  link_url:    string | null
  is_done:     boolean
  created_at:  string
}
export interface StudentFile {
  id:         string
  student_id?: string
  file_name:  string
  file_path:  string
  size_bytes: number | null
  created_at: string
}

export interface StudentSpace {
  found:    boolean
  student?: {
    id: string; full_name: string; course: string | null
    student_type: string; enrollment_date: string; course_end_date: string | null
    teacher_name: string | null; is_active: boolean; verification_token: string
  }
  assignments?: StudentAssignment[]
  files?:       StudentFile[]
}

const BUCKET = 'student-files'

/** Public download URL for a stored file. */
export function fileUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

/** Token-gated student space (used by the public /student-space page). */
export async function fetchStudentSpace(token: string): Promise<StudentSpace> {
  const { data, error } = await supabase.rpc('student_space', { p_token: token.trim().toUpperCase() })
  if (error) { console.error('fetchStudentSpace', error.message); return { found: false } }
  return (data ?? { found: false }) as StudentSpace
}

/* ── Staff side ─────────────────────────────────────────── */
export async function fetchAssignments(studentId: string): Promise<StudentAssignment[]> {
  const { data } = await supabase.from('student_assignments').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
  return (data ?? []) as StudentAssignment[]
}
export async function addAssignment(input: { studentId: string; title: string; description?: string; linkUrl?: string; assignedBy?: string }): Promise<void> {
  await supabase.from('student_assignments').insert({
    student_id: input.studentId, title: input.title,
    description: input.description || null, link_url: input.linkUrl || null,
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
export async function uploadStudentFile(studentId: string, file: File, uploadedBy?: string): Promise<boolean> {
  const path = `${studentId}/${Date.now()}_${file.name.replace(/[^\w.\-]/g, '_')}`
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
  if (upErr) { console.error('uploadStudentFile', upErr.message); return false }
  const { error } = await supabase.from('student_files').insert({
    student_id: studentId, file_name: file.name, file_path: path,
    size_bytes: file.size, uploaded_by: uploadedBy || null,
  })
  if (error) { console.error('uploadStudentFile insert', error.message); return false }
  return true
}
export async function deleteStudentFile(id: string, path: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([path])
  await supabase.from('student_files').delete().eq('id', id)
}
