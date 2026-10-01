import { supabase } from './supabase'

/**
 * Online classes (cohorts), class enrollment, and the staff tools around them.
 *
 * Kept apart on purpose — each has its own table and rules:
 *   course enrollment  lms_enrollments (+ lms_enrollment_history)   access to course content
 *   class enrollment   online_class_enrollments                      a seat in a live class
 *   teacher assignment teacher_students                              who follows a student
 *   attendance         class_attendance                              per session, never an enrollment
 *
 * Schema + rules: supabase/migrations/047_online_classes_enrollment.sql
 */

export type ClassMode = 'group' | 'private'
export type ClassStatus = 'active' | 'completed' | 'cancelled'
export type SeatStatus = 'active' | 'waitlisted' | 'completed' | 'cancelled'
export type CourseEnrollmentStatus = 'active' | 'completed' | 'cancelled'

export const MODE_AR: Record<ClassMode, string> = { group: 'جماعي', private: 'فردي' }
export const CLASS_STATUS_AR: Record<ClassStatus, string> = { active: 'جارٍ', completed: 'مكتمل', cancelled: 'ملغى' }
export const SEAT_STATUS_AR: Record<SeatStatus, string> = {
  active: 'نشط', waitlisted: 'قائمة انتظار', completed: 'مكتمل', cancelled: 'ملغى',
}

export interface OnlineClass {
  id:               string
  title:            string
  mode:             ClassMode
  level:            string | null
  status:           ClassStatus
  teacher_id:       string | null
  teacher_name:     string | null
  course_id:        string | null
  course_title:     string | null
  starts_on:        string | null
  ends_on:          string | null
  capacity:         number | null
  waitlist_enabled: boolean
  meeting_url:      string | null
  schedule_note:    string | null
  notes:            string | null
  archived_at:      string | null
  created_at:       string
  active_count:     number
  waitlisted_count: number
  sessions_done:    number
  sessions_upcoming: number
  next_session_at:  string | null
}

export interface RosterSeat {
  enrollment_id: string
  student_id:    string
  full_name:     string
  phone_number:  string | null
  avatar_url:    string | null
  status:        SeatStatus
  enrolled_at:   string
  activated_at:  string | null
  start_date:    string | null
  end_date:      string | null
  ended_at:      string | null
  end_reason:    string | null
  attendance:    { marked: number; present: number; absent: number }
}

export interface ClassSessionRow {
  id:            string
  title:         string
  starts_at:     string
  duration_min:  number
  status:        'scheduled' | 'live' | 'done' | 'cancelled'
  cancel_reason: string | null
  teacher_id:    string
  teacher_name:  string | null
  marks:         number
  present:       number
  has_report:    boolean
}

export interface OnlineClassDetail {
  class:    Omit<OnlineClass, 'active_count' | 'waitlisted_count' | 'sessions_done' | 'sessions_upcoming' | 'next_session_at'>
  roster:   RosterSeat[]
  sessions: ClassSessionRow[]
}

export interface UnlinkedSession {
  id: string; title: string; mode: ClassMode; level: string | null; starts_at: string
  status: string; teacher_id: string; teacher_name: string | null; marks: number
}

export interface TeacherOption { id: string; name: string; is_active: boolean }

export type EnrollResult =
  | { student_id: string; result: 'active' | 'waitlisted'; enrollment_id: string }
  | { student_id: string; result: 'duplicate' | 'not_found' }
  | { student_id: string; result: 'error'; message: string }

/* ── Errors ─────────────────────────────────────────────── */

/** Turn a Postgres error into a sentence a staff member can act on. */
export function explainDbError(message: string | undefined | null): string {
  const m = message ?? ''
  if (/is full/.test(m))                 return 'القسم ممتلئ — فعّل قائمة الانتظار أو زد عدد المقاعد.'
  if (/not open for enrollment/.test(m)) return 'القسم غير مفتوح للتسجيل (مكتمل، ملغى أو مؤرشف).'
  if (/has ended/.test(m))               return 'هذا التسجيل منتهٍ — أنشئ تسجيلًا جديدًا لإعادة الطالب.'
  if (/not a teacher/i.test(m))          return 'الحساب المختار ليس حساب أستاذ.'
  if (/private class holds one/.test(m)) return 'القسم الفردي يتّسع لطالب واحد فقط.'
  if (/cancel it instead/.test(m))       return 'لهذه الحصة حضور أو تقرير — ألغِها بدل حذفها.'
  if (/no waitlist/.test(m))             return 'لا توجد قائمة انتظار لهذا القسم.'
  if (/Staff only|permission denied|row-level security/.test(m)) return 'ليست لديك صلاحية لهذا الإجراء.'
  if (/duplicate key|one_open/.test(m))  return 'الطالب مسجّل بالفعل في هذا القسم.'
  return m || 'تعذّر تنفيذ العملية.'
}

async function call<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args)
  if (error) throw new Error(explainDbError(error.message))
  return data as T
}

/* ── Classes ────────────────────────────────────────────── */

export async function fetchOnlineClasses(includeArchived = false): Promise<OnlineClass[]> {
  return (await call<OnlineClass[]>('staff_online_classes', { p_include_archived: includeArchived })) ?? []
}

export async function fetchOnlineClassDetail(classId: string): Promise<OnlineClassDetail | null> {
  return (await call<OnlineClassDetail | null>('staff_online_class_detail', { p_class_id: classId })) ?? null
}

export interface ClassInput {
  title: string
  mode: ClassMode
  teacher_id: string | null
  course_id: string | null
  level: string | null
  status: ClassStatus
  starts_on: string | null
  ends_on: string | null
  capacity: number | null
  waitlist_enabled: boolean
  meeting_url: string | null
  schedule_note: string | null
  notes: string | null
}

export async function createOnlineClass(input: ClassInput): Promise<string> {
  const { data, error } = await supabase.from('online_classes').insert(input).select('id').single()
  if (error) throw new Error(explainDbError(error.message))
  return (data as { id: string }).id
}

export async function updateOnlineClass(id: string, patch: Partial<ClassInput>): Promise<void> {
  const { error } = await supabase.from('online_classes').update(patch).eq('id', id)
  if (error) throw new Error(explainDbError(error.message))
}

/** Archive hides a class from day-to-day lists. Nothing is deleted. */
export async function setClassArchived(id: string, archived: boolean): Promise<void> {
  const { error } = await supabase.from('online_classes')
    .update({ archived_at: archived ? new Date().toISOString() : null }).eq('id', id)
  if (error) throw new Error(explainDbError(error.message))
}

export async function fetchTeacherOptions(): Promise<TeacherOption[]> {
  return (await call<TeacherOption[]>('staff_teacher_options')) ?? []
}

/* ── Seats ──────────────────────────────────────────────── */

export async function enrollInClass(
  classId: string, studentIds: string[],
  opts: { enrolledOn?: string | null; startDate?: string | null; waitlist?: boolean } = {},
): Promise<EnrollResult[]> {
  return (await call<EnrollResult[]>('staff_enroll_class', {
    p_class_id: classId, p_student_ids: studentIds,
    p_enrolled_on: opts.enrolledOn || null, p_start_date: opts.startDate || null,
    p_waitlist: !!opts.waitlist,
  })) ?? []
}

export async function setSeatStatus(
  enrollmentId: string, status: SeatStatus,
  opts: { reason?: string | null; startDate?: string | null; endDate?: string | null } = {},
): Promise<void> {
  await call('staff_set_class_enrollment', {
    p_enrollment_id: enrollmentId, p_status: status, p_reason: opts.reason ?? null,
    p_start_date: opts.startDate ?? null, p_end_date: opts.endDate ?? null,
  })
}

/* ── Sessions ───────────────────────────────────────────── */

export async function fetchUnlinkedSessions(): Promise<UnlinkedSession[]> {
  return (await call<UnlinkedSession[]>('staff_unlinked_sessions')) ?? []
}

export async function linkSessions(classId: string | null, sessionIds: string[]): Promise<number> {
  return (await call<number>('staff_link_sessions', { p_class_id: classId, p_session_ids: sessionIds })) ?? 0
}

/** Schedule one session per date for a class (staff). */
export async function scheduleClassSessions(input: {
  classId: string; teacherId: string; title: string; startsAt: string[]; durationMin: number; meetingUrl?: string | null
}): Promise<void> {
  const rows = input.startsAt.map(starts_at => ({
    class_id: input.classId, teacher_id: input.teacherId, title: input.title,
    starts_at, duration_min: input.durationMin, meeting_url: input.meetingUrl || null, status: 'scheduled',
  }))
  const { error } = await supabase.from('class_sessions').insert(rows)
  if (error) throw new Error(explainDbError(error.message))
}

export async function cancelSession(id: string, reason: string | null): Promise<void> {
  const { error } = await supabase.from('class_sessions').update({ status: 'cancelled', cancel_reason: reason }).eq('id', id)
  if (error) throw new Error(explainDbError(error.message))
}

export interface AttendanceOnlyStudent {
  student_id: string; full_name: string; marks: number; present: number; first_at: string; last_at: string
}

/** Students marked in this class's sessions with no seat — staff review, nothing automatic. */
export async function fetchAttendanceWithoutSeat(classId: string): Promise<AttendanceOnlyStudent[]> {
  return (await call<AttendanceOnlyStudent[]>('staff_class_attendance_without_enrollment', { p_class_id: classId })) ?? []
}

/* ── Student profile ────────────────────────────────────── */

export interface StudentCourseEnrollment {
  id: string; course_id: string; title: string; level: string | null
  status: CourseEnrollmentStatus; enrolled_at: string; completed_at: string | null
  ended_at: string | null; end_reason: string | null
  /** false = archived history row (removed enrollment) */
  current: boolean
}
export interface StudentClassEnrollment {
  id: string; class_id: string; title: string; mode: ClassMode; class_status: ClassStatus; archived: boolean
  status: SeatStatus; enrolled_at: string; start_date: string | null; end_date: string | null
  ended_at: string | null; end_reason: string | null
  teacher_id: string | null; teacher_name: string | null; course_title: string | null
}
export interface StudentTeacherLink { teacher_id: string; name: string; is_active: boolean; assigned_at: string }

export interface StudentEnrollments {
  courses:  StudentCourseEnrollment[]
  classes:  StudentClassEnrollment[]
  teachers: StudentTeacherLink[]
}

export async function fetchStudentEnrollments(studentId: string): Promise<StudentEnrollments> {
  return (await call<StudentEnrollments>('staff_student_enrollments', { p_student_id: studentId }))
    ?? { courses: [], classes: [], teachers: [] }
}

/* ── Course enrollment (staff) ──────────────────────────── */

export async function enrollInCourse(courseId: string, studentIds: string[]): Promise<{ enrolled: number; already: number; not_found: number }> {
  return await call('staff_enroll_course', { p_course_id: courseId, p_student_ids: studentIds })
}

/** Revokes course access; the enrollment is archived with the reason, progress is kept. */
export async function endCourseEnrollment(studentId: string, courseId: string, reason?: string | null): Promise<void> {
  await call('staff_end_course_enrollment', { p_student_id: studentId, p_course_id: courseId, p_reason: reason ?? null })
}

export async function setCourseEnrollmentStatus(studentId: string, courseId: string, status: 'active' | 'completed'): Promise<void> {
  await call('staff_set_course_enrollment_status', { p_student_id: studentId, p_course_id: courseId, p_status: status })
}

/* ── Teacher assignment (staff) ─────────────────────────── */

export async function assignTeacher(teacherId: string, studentIds: string[], active = true): Promise<number> {
  return (await call<number>('staff_assign_teacher', { p_teacher_id: teacherId, p_student_ids: studentIds, p_active: active })) ?? 0
}

/* ── Formatting ─────────────────────────────────────────── */

export function fmtDay(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = iso.length === 10 ? new Date(`${iso}T12:00:00Z`) : new Date(iso)
  return d.toLocaleDateString('ar-MA', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Casablanca' })
}

export function seatsLabel(c: Pick<OnlineClass, 'active_count' | 'capacity' | 'mode'>): string {
  const cap = c.mode === 'private' ? 1 : c.capacity
  return cap ? `${c.active_count} / ${cap}` : `${c.active_count}`
}
