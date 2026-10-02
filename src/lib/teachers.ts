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

export interface Certificate  { title: string; issuer?: string; year?: string; url?: string }
export interface ExperienceRow { role: string; org?: string; from?: string; to?: string; description?: string }

/** Everything a teacher declares about themselves — editable, never derived. */
export interface TeacherDeclared {
  cover_url:        string | null
  tagline:          string | null
  english_level:    string | null
  competences:      string[]
  liked_qualities:  string[]
  certificates:     Certificate[]
  experiences:      ExperienceRow[]
  teaches:          string[]
  not_teaches:      string[]
  age_min:          number | null
  age_max:          number | null
  years_experience: number | null
}

/** Everything the rows already know — recomputed, never typed in. */
export interface TeacherProfileFull {
  profile:  TeacherProfile & TeacherDeclared
  identity: { email: string | null; full_name: string | null }
  stats: {
    students_total: number; students_active: number
    classes_done: number;   hours_total: number
    reports_written: number; materials: number
    exams_corrected: number; exams_passed: number
    attendance_rate: number | null
    rating_avg: number; rating_count: number
    is_top_rated: boolean
  }
  gender_split:  { male: number; female: number; unknown: number }
  age_bands:     { band: string; count: number }[]
  avg_age:       number | null
  level_split:   { level: string; count: number }[]
  upcoming:      ClassSession[]
  top_students: {
    id: string; name: string; avatar_url: string | null; level: string | null
    coins: number; streak: number; exams_passed: number
    last_seen: string | null; score: number
  }[]
  testimonials: {
    id: string; rating: number; comment: string | null; created_at: string
    student_name: string | null; student_avatar: string | null
  }[]
  rating_breakdown: Record<string, number>
}

/** A teacher's current roster — teacher_counts() in 051_teacher_counts_and_conversion.sql.
 *  Students are people (each counted once); seats and course enrollments are relationships. */
export interface TeacherRosterCounts {
  unique_students:    number   // assigned ∪ seated, each student once
  assigned_students:  number   // assigned by administration
  assigned_only:      number
  class_only:         number
  assigned_and_class: number
  course_students:    number   // roster students with ≥ 1 active course enrollment
  course_enrollments: number   // their active course enrollments (relationships)
  no_course_students: number
  class_students:     number   // students holding ≥ 1 active seat in my classes
  class_seats:        number   // active seats (relationships)
  group_seats:        number
  private_seats:      number
  group_students:     number
  private_students:   number
  group_classes:      number   // my active, non-archived classes
  private_classes:    number
}

export interface TeacherPeriodCounts {
  from: string | null; to: string | null; timezone: string
  sessions_delivered: number
  hours_delivered:    number
  sessions_cancelled: number
  sessions_scheduled: number
  reports_owed:       number
  attendance: {
    marks: number; present: number; late: number; absent: number; excused: number
    rate: number | null
  }
}

export interface TeacherOverview {
  /** assigned ∪ active class seats, each student once (same as roster.unique_students) */
  students_total:    number
  assigned_students?: number
  class_students?:   number
  classes_active?:   number
  classes_month:     number
  hours_month:       number
  upcoming:          number
  reports_owed:      number
  attendance_rate:   number | null
  rating_avg:        number | null
  rating_count:      number | null
  /** Present once migration 051 is applied. */
  roster?:            TeacherRosterCounts
  period?:            TeacherPeriodCounts
  upcoming_sessions?: number
  reports_owed_all_time?: number
}

export type EnrollmentStatus = 'active' | 'waitlisted' | 'completed' | 'cancelled'

export interface MyStudentCourse {
  course_id: string; title: string; level: string | null
  status: 'active' | 'completed'
  enrolled_at: string; completed_at: string | null
}

export interface MyStudentClass {
  enrollment_id: string; class_id: string; title: string; mode: 'group' | 'private'
  status: EnrollmentStatus
  class_status: 'active' | 'completed' | 'cancelled'; archived: boolean
  enrolled_at: string; ended_at: string | null
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
  /** Assigned to this teacher by the admin (teacher_students). */
  assigned?:       boolean
  assigned_at:     string | null
  /** Active seats in this teacher's online classes. */
  classes?:        { class_id: string; title: string; mode: 'group' | 'private' }[]
  /** Why the student is on my roster. Present once migration 051 is applied. */
  relationship?:   'assigned' | 'class' | 'both'
  /** The student's course enrollments (course access) — not classes, not payments. */
  courses?:        MyStudentCourse[]
  /** Seats in my classes: active, waitlisted or completed. */
  class_memberships?: MyStudentClass[]
}

/** One of my online classes (owner, or substitute who taught a session). */
export interface MyClass {
  id: string; title: string; mode: 'group' | 'private'; level: string | null
  status: 'active' | 'completed' | 'cancelled'
  course_id: string | null; course_title: string | null
  starts_on: string | null; ends_on: string | null; capacity: number | null
  meeting_url: string | null; schedule_note: string | null
  is_owner: boolean; archived: boolean
  active_count: number; waitlisted_count: number
  sessions_done: number; reports_owed: number; next_session_at: string | null
}

export interface ClassRosterRow {
  enrollment_id: string; student_id: string; full_name: string; avatar_url: string | null
  phone_masked: string | null
  status: 'active' | 'waitlisted' | 'completed' | 'cancelled'
  enrolled_at: string; start_date: string | null; end_date: string | null; ended_at: string | null
  attendance: { marked: number; present: number; absent: number }
}

/** A row of a session's attendance sheet. */
export interface SessionRosterRow {
  student_id: string; full_name: string; avatar_url: string | null
  /** On the roster for this session (may be marked). false = an old mark kept for history. */
  eligible: boolean
  attendance: AttendanceStatus | null
  note: string | null
}

export type SessionStatus = 'scheduled' | 'live' | 'done' | 'cancelled'

export interface ClassSession {
  id:            string
  teacher_id:    string
  /** The online class this session belongs to (null = legacy / ad-hoc). */
  class_id?:     string | null
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

/** teachers_scoreboard(p_from, p_to) — see 051_teacher_counts_and_conversion.sql. */
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
  period:          { from: string | null; to: string | null; timezone: string }
  // ── current roster (not affected by the period) ──
  assigned_students:   number
  class_students:      number
  unique_students:     number
  course_students:     number
  group_enrollments:   number
  private_enrollments: number
  classes_active:      number
  // ── within the period ──
  sessions_delivered:    number
  hours_delivered:       number
  sessions_cancelled:    number
  reports_owed:          number
  reports_owed_all_time: number
  attendance_marks:      number
  attendance_rate:       number | null
  new_class_enrollments: number
  // ── present once migration 051 is applied ──
  roster?:                 TeacherRosterCounts
  course_enrollments?:     number
  class_seats?:            number
  group_classes?:          number
  private_classes?:        number
  /** Paid payments in the period by students on this roster today. Non-exclusive:
   *  a student with two teachers counts for both — never sum across teachers. */
  roster_revenue?:         number
  roster_paying_students?: number
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

/** The whole tutor page — declared fields plus every computed aggregate. */
export async function fetchTeacherProfileFull(teacherId: string): Promise<TeacherProfileFull | null> {
  const { data, error } = await supabase.rpc('teacher_profile_full', { p_teacher: teacherId })
  if (error) { console.error('fetchTeacherProfileFull', error.message); return null }
  if (!data || !data.profile) return null
  return data as TeacherProfileFull
}

export async function uploadTeacherCover(id: string, file: File): Promise<string | null> {
  const path = `teachers/${id}/cover_${Date.now()}_${safeName(file.name)}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
  if (error) { console.error('uploadTeacherCover', error.message); return null }
  const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  await saveTeacherProfile(id, { cover_url: url } as Partial<TeacherProfile & TeacherDeclared>)
  return url
}

export async function saveTeacherProfile(
  id: string, patch: Partial<TeacherProfile & TeacherDeclared>,
): Promise<boolean> {
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

/** My own figures. Roster counts are current; `period` follows [from, to] (Morocco days, both null = all time). */
export async function fetchTeacherOverview(from: string | null = null, to: string | null = null): Promise<TeacherOverview | null> {
  let { data, error } = await supabase.rpc('teacher_overview', { p_from: from, p_to: to })
  // Before migration 051 the function takes no arguments; fall back to it.
  if (error) ({ data, error } = await supabase.rpc('teacher_overview'))
  if (error) { console.error('fetchTeacherOverview', error.message); return null }
  if (!data || Object.keys(data).length === 0) return null
  return data as TeacherOverview
}

export async function fetchMyStudents(): Promise<MyStudent[]> {
  const { data, error } = await supabase.rpc('teacher_my_students')
  if (error) { console.error('fetchMyStudents', error.message); return [] }
  return (data ?? []) as MyStudent[]
}

/* ── Online classes (read-only for teachers; staffed from the CRM) ── */

export async function fetchMyClasses(): Promise<MyClass[]> {
  const { data, error } = await supabase.rpc('teacher_my_classes')
  if (error) { console.error('fetchMyClasses', error.message); return [] }
  return (data ?? []) as MyClass[]
}

/** Throws when the class is not the caller's — the database decides, not the URL. */
export async function fetchClassRoster(classId: string): Promise<ClassRosterRow[]> {
  const { data, error } = await supabase.rpc('teacher_class_roster', { p_class_id: classId })
  if (error) throw new Error(error.message)
  return (data ?? []) as ClassRosterRow[]
}

/** The attendance sheet for one session: its roster plus any earlier marks. */
export async function fetchSessionRoster(sessionId: string): Promise<SessionRosterRow[]> {
  const { data, error } = await supabase.rpc('session_roster', { p_session_id: sessionId })
  if (error) { console.error('fetchSessionRoster', error.message); return [] }
  return (data ?? []) as SessionRosterRow[]
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

/** Only an untouched scheduled session can go; one with attendance or a report
 *  must be cancelled instead (enforced in the database). */
export async function deleteSession(id: string): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.from('class_sessions').delete().eq('id', id).select('id')
  if (error) {
    console.error('deleteSession', error.message)
    return { ok: false, error: /cancel it instead/.test(error.message)
      ? 'لهذه الحصة حضور أو تقرير — ألغِها بدل حذفها.' : 'تعذّر حذف الحصة.' }
  }
  if (!data || data.length === 0) return { ok: false, error: 'لا يمكن حذف حصة منتهية أو ملغاة — يمكنك إلغاؤها فقط.' }
  return { ok: true }
}

/** A session with records can still be called off; the reason is kept. */
export function canDeleteSession(s: ClassSession, hasRecords: boolean): boolean {
  return s.status === 'scheduled' && !hasRecords
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

/** Attendance tallied across every session this teacher has run — feeds the
 *  attendance bar on the dashboard. */
export async function fetchAttendanceTotals(
  teacherId: string,
): Promise<{ present: number; late: number; absent: number; excused: number }> {
  const empty = { present: 0, late: 0, absent: 0, excused: 0 }
  const { data, error } = await supabase
    .from('class_attendance')
    .select('status, class_sessions!inner(teacher_id)')
    .eq('class_sessions.teacher_id', teacherId)
  if (error) { console.error('fetchAttendanceTotals', error.message); return empty }
  return (data ?? []).reduce((acc: typeof empty, row: any) => {
    const k = row.status as keyof typeof empty
    if (k in acc) acc[k] += 1
    return acc
  }, { ...empty })
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

/** Period = Morocco calendar days, inclusive. Both null = all time. */
export async function fetchTeachersScoreboard(from: string | null, to: string | null): Promise<ScoreboardRow[]> {
  const { data, error } = await supabase.rpc('teachers_scoreboard', { p_from: from, p_to: to })
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

/** Raised when the email already has an account — the caller must confirm the
 *  conversion, because it resets that account's password. */
export class TeacherEmailTakenError extends Error {
  existingRole: string
  existingName: string | null
  constructor(message: string, existingRole: string, existingName: string | null) {
    super(message)
    this.name = 'TeacherEmailTakenError'
    this.existingRole = existingRole
    this.existingName = existingName
  }
}

/** Founder-only: create a teaching account (email + password, no signup needed).
 *  Pass convert = true only after the founder has confirmed taking over an
 *  existing account. */
export async function createTeacher(
  email: string, password: string, fullName?: string, convert = false,
): Promise<{ id: string; adopted: boolean }> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error('Your session expired — please sign in again.')

  const res = await fetch('/api/admin/create-teacher', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body:    JSON.stringify({ email, password, full_name: fullName, convert }),
  })
  const json = await res.json().catch(() => ({}))
  if (res.status === 409 && json?.needs_confirmation) {
    throw new TeacherEmailTakenError(json.error ?? '', json.existing_role ?? 'student', json.existing_name ?? null)
  }
  if (!res.ok) throw new Error(json?.error ?? 'Could not create the teacher account.')
  return { id: json.id as string, adopted: !!json.adopted }
}

/* ── Managing an existing teaching account (founder only) ─ */

export interface DeleteImpact {
  classes: number; reports: number; materials: number; students: number; reviews: number
}

async function authHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error('Your session expired — please sign in again.')
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

/** What a delete would take with it — shown before the founder confirms. */
export async function fetchDeleteImpact(teacherId: string): Promise<DeleteImpact> {
  const res  = await fetch(`/api/admin/teacher/${teacherId}`, { headers: await authHeader() })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error ?? 'Could not read the account.')
  return json as DeleteImpact
}

/** Change email, reset the password, or rename. Any subset. */
export async function updateTeacherAccount(
  teacherId: string, patch: { email?: string; password?: string; full_name?: string },
): Promise<void> {
  const res = await fetch(`/api/admin/teacher/${teacherId}`, {
    method: 'PATCH', headers: await authHeader(), body: JSON.stringify(patch),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error ?? 'Could not update the account.')
}

/** Irreversible — cascades through classes, attendance, reports and materials. */
export async function deleteTeacherAccount(teacherId: string): Promise<void> {
  const res = await fetch(`/api/admin/teacher/${teacherId}`, {
    method: 'DELETE', headers: await authHeader(),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error ?? 'Could not delete the account.')
}

/** Suspend without destroying anything — the safe alternative to delete. */
export async function setTeacherActive(teacherId: string, active: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('teacher_profiles').update({ is_active: active }).eq('id', teacherId)
  if (error) { console.error('setTeacherActive', error.message); return false }
  return true
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

/* ── Transparency (053) ────────────────────────────────── */

/** teacher_roster_payments(): one money line per student on my roster. */
export interface RosterPayment {
  student_id: string; total_paid: number; outstanding: number; overdue: boolean; last_paid_at: string | null
}

export async function fetchRosterPayments(): Promise<RosterPayment[]> {
  const { data, error } = await supabase.rpc('teacher_roster_payments')
  if (error) { console.warn('fetchRosterPayments', error.message); return [] }
  return ((data ?? []) as RosterPayment[]).map(r => ({ ...r, total_paid: Number(r.total_paid), outstanding: Number(r.outstanding) }))
}

/** teacher_student_payments(student): what one of my students paid, owes and when. */
export interface StudentPayments {
  total_paid: number; paid_count: number; last_paid_at: string | null
  outstanding: number; overdue: number; next_due_at: string | null
  monthly_fee: number | null; billing_type: string | null
  status: 'paid' | 'due' | 'overdue' | 'none'
  history: { id: string; at: string; amount: number; label: string; status: 'paid' | 'pending' | 'overdue' | 'declined'; due_date: string | null; installment: string | null }[]
}

export async function fetchStudentPayments(studentId: string): Promise<StudentPayments | null> {
  const { data, error } = await supabase.rpc('teacher_student_payments', { p_student: studentId })
  if (error) { console.warn('fetchStudentPayments', error.message); return null }
  return (data ?? null) as StudentPayments | null
}

/** teacher_leaderboard(from, to): every active teacher, ranked. Never another teacher's money. */
export interface LeaderboardRow {
  id: string; name: string | null; avatar_url: string | null; headline: string | null
  rating_avg: number; rating_count: number; is_top_rated: boolean
  students: number; live: number; active_7d: number
  sessions: number; hours: number; attendance_rate: number | null
  score: number; rank: number; is_me: boolean
}
export interface Leaderboard {
  period: { from: string; to: string; timezone: string }
  rows: LeaderboardRow[]
  me: { roster_revenue: number; roster_paying_students: number } | null
}

export async function fetchLeaderboard(from: string | null = null, to: string | null = null): Promise<Leaderboard | null> {
  const { data, error } = await supabase.rpc('teacher_leaderboard', { p_from: from, p_to: to })
  if (error) { console.warn('fetchLeaderboard', error.message); return null }
  return (data ?? null) as Leaderboard | null
}
