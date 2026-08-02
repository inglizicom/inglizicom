import { supabase } from './supabase'

/**
 * Data layer for teacher.inglizi.com.
 *
 * A teacher is not CRM staff: every crm_* table returns zero rows to them, by
 * policy. Anything that crosses that line goes through a security-definer RPC
 * (teacher_my_students, teacher_overview) which returns only what a teacher
 * needs — including a MASKED phone number. To message a student the UI calls
 * /api/teacher/wa/[studentId], which resolves the real number server-side.
 *
 * Schema: supabase/migrations/044_teachers.sql
 */

const BUCKET = 'student-files'

/* ── Types ─────────────────────────────────────────────── */

export interface TeacherProfile {
  id:              string
  display_name:    string | null
  headline:        string | null
  bio:             string | null
  avatar_url:      string | null
  levels:          string[]
  specialties:     string[]
  languages:       string[]
  whatsapp:        string | null
  pay_model:       'hourly' | 'per_class' | 'monthly' | 'none'
  hourly_rate_mad: number | null
  availability:    AvailabilityWindow[]
  hired_at:        string
  is_active:       boolean
  rating_avg:      number
  rating_count:    number
}

export interface AvailabilityWindow { day: number; from: string; to: string }

export interface TeacherOverview {
  students_total:  number
  classes_month:   number
  hours_month:     number
  upcoming:        number
  reports_owed:    number
  attendance_rate: number | null
  rating_avg:      number | null
  rating_count:    number | null
}

export interface MyStudent {
  id:              string
  full_name:       string
  course:          string | null
  student_type:    string
  enrollment_date: string
  is_active:       boolean
  avatar_url:      string | null
  /** e.g. "+2126••••11" — the raw number never reaches the browser. */
  phone_masked:    string | null
  assigned_at:     string
}

export type SessionStatus = 'scheduled' | 'live' | 'done' | 'cancelled'

export interface ClassSession {
  id:            string
  teacher_id:    string
  course_id:     string | null
  title:         string
  mode:          'group' | 'private'
  level:         string | null
  starts_at:     string
  duration_min:  number
  meeting_url:   string | null
  location:      string | null
  status:        SessionStatus
  cancel_reason: string | null
  notes:         string | null
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused'

export interface AttendanceRow {
  id:         string
  session_id: string
  student_id: string
  status:     AttendanceStatus
  minutes:    number | null
  note:       string | null
}

export interface StudentNote {
  student_id:    string
  participation: number      // 1–5
  needs_help:    boolean
  note?:         string
}

export interface LessonReport {
  id:             string
  session_id:     string
  teacher_id:     string
  covered:        string
  homework:       string | null
  materials_used: string | null
  student_notes:  StudentNote[]
  founder_note:   string | null
  submitted_at:   string
}

export type MaterialVisibility = 'private' | 'students' | 'course'

export interface TeacherMaterial {
  id:             string
  teacher_id:     string
  course_id:      string | null
  title:          string
  description:    string | null
  file_path:      string
  file_type:      string | null
  size_bytes:     number | null
  level:          string | null
  unit_no:        number | null
  visibility:     MaterialVisibility
  download_count: number
  created_at:     string
}

export interface TeacherReview {
  id:           string
  teacher_id:   string
  student_id:   string
  rating:       number
  comment:      string | null
  is_published: boolean
  created_at:   string
}

export interface ScoreboardRow {
  id:              string
  display_name:    string | null
  email:           string | null
  headline:        string | null
  avatar_url:      string | null
  is_active:       boolean
  hired_at:        string | null
  rating_avg:      number
  rating_count:    number
  students:        number
  classes_month:   number
  hours_month:     number
  reports_owed:    number
  attendance_rate: number | null
}

/* ── Profile ───────────────────────────────────────────── */

export async function fetchTeacherProfile(id: string): Promise<TeacherProfile | null> {
  const { data, error } = await supabase
    .from('teacher_profiles').select('*').eq('id', id).maybeSingle()
  if (error) { console.error('fetchTeacherProfile', error.message); return null }
  return data as TeacherProfile | null
}

/** Create the profile row the first time a teacher opens their space. */
export async function ensureTeacherProfile(id: string, fallbackName?: string | null): Promise<TeacherProfile | null> {
  const existing = await fetchTeacherProfile(id)
  if (existing) return existing
  const { data, error } = await supabase
    .from('teacher_profiles')
    .insert({ id, display_name: fallbackName ?? null })
    .select('*').maybeSingle()
  if (error) { console.error('ensureTeacherProfile', error.message); return null }
  return data as TeacherProfile | null
}

export async function saveTeacherProfile(id: string, patch: Partial<TeacherProfile>): Promise<boolean> {
  const { error } = await supabase.from('teacher_profiles').update(patch).eq('id', id)
  if (error) { console.error('saveTeacherProfile', error.message); return false }
  return true
}

export async function uploadTeacherAvatar(id: string, file: File): Promise<string | null> {
  const path = `teachers/${id}/avatar_${Date.now()}_${safeName(file.name)}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
  if (error) { console.error('uploadTeacherAvatar', error.message); return null }
  const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  await saveTeacherProfile(id, { avatar_url: url })
  return url
}

/* ── Overview + roster ─────────────────────────────────── */

export async function fetchTeacherOverview(): Promise<TeacherOverview | null> {
  const { data, error } = await supabase.rpc('teacher_overview')
  if (error) { console.error('fetchTeacherOverview', error.message); return null }
  if (!data || Object.keys(data).length === 0) return null
  return data as TeacherOverview
}

export async function fetchMyStudents(): Promise<MyStudent[]> {
  const { data, error } = await supabase.rpc('teacher_my_students')
  if (error) { console.error('fetchMyStudents', error.message); return [] }
  return (data ?? []) as MyStudent[]
}

/* ── Classes ───────────────────────────────────────────── */

export async function fetchSessions(
  teacherId: string,
  opts: { from?: Date; to?: Date; status?: SessionStatus } = {},
): Promise<ClassSession[]> {
  let q = supabase.from('class_sessions').select('*').eq('teacher_id', teacherId)
  if (opts.from)   q = q.gte('starts_at', opts.from.toISOString())
  if (opts.to)     q = q.lte('starts_at', opts.to.toISOString())
  if (opts.status) q = q.eq('status', opts.status)
  const { data, error } = await q.order('starts_at', { ascending: true })
  if (error) { console.error('fetchSessions', error.message); return [] }
  return (data ?? []) as ClassSession[]
}

/** The next few classes, soonest first — what the dashboard opens on. */
export async function fetchUpcoming(teacherId: string, limit = 5): Promise<ClassSession[]> {
  const { data, error } = await supabase
    .from('class_sessions').select('*')
    .eq('teacher_id', teacherId)
    .in('status', ['scheduled', 'live'])
    .gte('starts_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())  // keep a class that just started
    .order('starts_at', { ascending: true })
    .limit(limit)
  if (error) { console.error('fetchUpcoming', error.message); return [] }
  return (data ?? []) as ClassSession[]
}

/** Finished classes with no report filed — surfaced in red until cleared. */
export async function fetchReportsOwed(teacherId: string): Promise<ClassSession[]> {
  const { data, error } = await supabase
    .from('class_sessions')
    .select('*, lesson_reports(id)')
    .eq('teacher_id', teacherId)
    .eq('status', 'done')
    .order('starts_at', { ascending: false })
    .limit(50)
  if (error) { console.error('fetchReportsOwed', error.message); return [] }
  return ((data ?? []) as any[])
    .filter(row => !row.lesson_reports || row.lesson_reports.length === 0)
    .map(({ lesson_reports, ...s }) => s as ClassSession)
}

export async function createSession(input: Partial<ClassSession> & { teacher_id: string; title: string; starts_at: string }): Promise<ClassSession | null> {
  const { data, error } = await supabase.from('class_sessions').insert(input).select('*').maybeSingle()
  if (error) { console.error('createSession', error.message); return null }
  return data as ClassSession | null
}

export async function updateSession(id: string, patch: Partial<ClassSession>): Promise<boolean> {
  const { error } = await supabase.from('class_sessions').update(patch).eq('id', id)
  if (error) { console.error('updateSession', error.message); return false }
  return true
}

export async function deleteSession(id: string): Promise<boolean> {
  const { error } = await supabase.from('class_sessions').delete().eq('id', id)
  if (error) { console.error('deleteSession', error.message); return false }
  return true
}

/* ── Attendance ────────────────────────────────────────── */

export async function fetchAttendance(sessionId: string): Promise<AttendanceRow[]> {
  const { data, error } = await supabase.from('class_attendance').select('*').eq('session_id', sessionId)
  if (error) { console.error('fetchAttendance', error.message); return [] }
  return (data ?? []) as AttendanceRow[]
}

/** Mark the whole roster in one pass — upsert so re-marking is safe. */
export async function markAttendance(
  sessionId: string,
  rows: { student_id: string; status: AttendanceStatus; minutes?: number | null; note?: string | null }[],
  markedBy?: string,
): Promise<boolean> {
  if (rows.length === 0) return true
  const payload = rows.map(r => ({
    session_id: sessionId,
    student_id: r.student_id,
    status:     r.status,
    minutes:    r.minutes ?? null,
    note:       r.note ?? null,
    marked_by:  markedBy ?? null,
    marked_at:  new Date().toISOString(),
  }))
  const { error } = await supabase
    .from('class_attendance')
    .upsert(payload, { onConflict: 'session_id,student_id' })
  if (error) { console.error('markAttendance', error.message); return false }
  return true
}

/* ── Lesson reports ────────────────────────────────────── */

export async function fetchReport(sessionId: string): Promise<LessonReport | null> {
  const { data, error } = await supabase
    .from('lesson_reports').select('*').eq('session_id', sessionId).maybeSingle()
  if (error) { console.error('fetchReport', error.message); return null }
  return data as LessonReport | null
}

export async function fetchReports(teacherId: string, limit = 30): Promise<LessonReport[]> {
  const { data, error } = await supabase
    .from('lesson_reports').select('*')
    .eq('teacher_id', teacherId)
    .order('submitted_at', { ascending: false })
    .limit(limit)
  if (error) { console.error('fetchReports', error.message); return [] }
  return (data ?? []) as LessonReport[]
}

export async function saveReport(input: {
  session_id: string
  teacher_id: string
  covered: string
  homework?: string | null
  materials_used?: string | null
  student_notes?: StudentNote[]
  founder_note?: string | null
}): Promise<boolean> {
  const { error } = await supabase
    .from('lesson_reports')
    .upsert({ ...input, student_notes: input.student_notes ?? [] }, { onConflict: 'session_id' })
  if (error) { console.error('saveReport', error.message); return false }
  return true
}

/* ── Materials ─────────────────────────────────────────── */

export function materialUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

export async function fetchMaterials(teacherId: string): Promise<TeacherMaterial[]> {
  const { data, error } = await supabase
    .from('teacher_materials').select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })
  if (error) { console.error('fetchMaterials', error.message); return [] }
  return (data ?? []) as TeacherMaterial[]
}

export async function uploadMaterial(
  teacherId: string,
  file: File,
  meta: { title?: string; description?: string; course_id?: string | null; level?: string | null; unit_no?: number | null; visibility?: MaterialVisibility } = {},
): Promise<boolean> {
  const path = `teachers/${teacherId}/${Date.now()}_${safeName(file.name)}`
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
  if (upErr) { console.error('uploadMaterial', upErr.message); return false }

  const { error } = await supabase.from('teacher_materials').insert({
    teacher_id:  teacherId,
    title:       meta.title?.trim() || file.name,
    description: meta.description ?? null,
    course_id:   meta.course_id ?? null,
    level:       meta.level ?? null,
    unit_no:     meta.unit_no ?? null,
    visibility:  meta.visibility ?? 'students',
    file_path:   path,
    file_type:   fileKind(file.name),
    size_bytes:  file.size,
  })
  if (error) {
    console.error('uploadMaterial insert', error.message)
    await supabase.storage.from(BUCKET).remove([path])   // don't orphan the object
    return false
  }
  return true
}

export async function deleteMaterial(id: string, path: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([path])
  await supabase.from('teacher_materials').delete().eq('id', id)
}

/* ── Reviews ───────────────────────────────────────────── */

export async function fetchMyReviews(teacherId: string): Promise<TeacherReview[]> {
  const { data, error } = await supabase
    .from('teacher_reviews').select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })
  if (error) { console.error('fetchMyReviews', error.message); return [] }
  return (data ?? []) as TeacherReview[]
}

/* ── Student side (token auth) ─────────────────────────── */

export interface StudentTeacherCard {
  id:           string
  display_name: string | null
  headline:     string | null
  bio:          string | null
  avatar_url:   string | null
  specialties:  string[] | null
  rating_avg:   number | null
  rating_count: number | null
  /** What this student already gave them, if anything. */
  my_rating:    number | null
}

export async function fetchMyTeachers(token: string): Promise<StudentTeacherCard[]> {
  const { data, error } = await supabase.rpc('student_my_teachers', { p_token: token.trim().toUpperCase() })
  if (error) { console.error('fetchMyTeachers', error.message); return [] }
  return (data ?? []) as StudentTeacherCard[]
}

/** Rate the teacher who actually teaches you — the RPC enforces the assignment. */
export async function submitTeacherReview(
  token: string, teacherId: string, rating: number, comment?: string,
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('submit_teacher_review', {
    p_token:      token.trim().toUpperCase(),
    p_teacher_id: teacherId,
    p_rating:     rating,
    p_comment:    comment ?? null,
  })
  if (error) { console.error('submitTeacherReview', error.message); return { ok: false, error: 'تعذّر إرسال التقييم.' } }
  return (data ?? { ok: false }) as { ok: boolean; error?: string }
}

/* ── Founder side ──────────────────────────────────────── */

export interface AbsenceRow {
  student_id:      string
  full_name:       string
  phone_number:    string | null
  course:          string | null
  absences:        number
  sessions:        number
  attendance_rate: number | null
  last_absence:    string | null
  teacher:         string | null
}

/** Who has been missing classes — staff-only, drives follow-up. */
export async function fetchAbsenceSummary(days = 30): Promise<AbsenceRow[]> {
  const { data, error } = await supabase.rpc('student_absence_summary', { p_days: days })
  if (error) { console.error('fetchAbsenceSummary', error.message); return [] }
  return (data ?? []) as AbsenceRow[]
}

export async function fetchTeachersScoreboard(): Promise<ScoreboardRow[]> {
  const { data, error } = await supabase.rpc('teachers_scoreboard')
  if (error) { console.error('fetchTeachersScoreboard', error.message); return [] }
  return (data ?? []) as ScoreboardRow[]
}

export async function assignStudent(teacherId: string, studentId: string, by?: string): Promise<boolean> {
  const { error } = await supabase
    .from('teacher_students')
    .upsert({ teacher_id: teacherId, student_id: studentId, assigned_by: by ?? null, is_active: true },
            { onConflict: 'teacher_id,student_id' })
  if (error) { console.error('assignStudent', error.message); return false }
  return true
}

export async function unassignStudent(teacherId: string, studentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('teacher_students').update({ is_active: false })
    .eq('teacher_id', teacherId).eq('student_id', studentId)
  if (error) { console.error('unassignStudent', error.message); return false }
  return true
}

/** Student ids this teacher holds — for the founder's assignment screen. */
export async function fetchAssignedIds(teacherId: string): Promise<string[]> {
  const { data } = await supabase
    .from('teacher_students').select('student_id')
    .eq('teacher_id', teacherId).eq('is_active', true)
  return (data ?? []).map((r: any) => r.student_id as string)
}

/** Founder-only: create a teaching account (email + password, no signup needed). */
export async function createTeacher(email: string, password: string, fullName?: string): Promise<{ id: string }> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error('Your session expired — please sign in again.')

  const res = await fetch('/api/admin/create-teacher', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body:    JSON.stringify({ email, password, full_name: fullName }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error ?? 'Could not create the teacher account.')
  return { id: json.id as string }
}

/* ── Small helpers ─────────────────────────────────────── */

function safeName(name: string): string {
  return name.replace(/[^\w.\-]/g, '_')
}

function fileKind(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['doc', 'docx'].includes(ext))              return 'doc'
  if (['ppt', 'pptx'].includes(ext))              return 'slides'
  if (['xls', 'xlsx', 'csv'].includes(ext))       return 'sheet'
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return 'image'
  if (['mp3', 'wav', 'm4a', 'ogg'].includes(ext)) return 'audio'
  if (['mp4', 'mov', 'webm'].includes(ext))       return 'video'
  return ext || 'file'
}

export function formatSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
