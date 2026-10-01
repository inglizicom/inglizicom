// Test fixtures: people, courses, classes — created as the database owner
// (bypassing RLS), then exercised through `as(db, user, …)` like the real API.

import { randomUUID } from 'node:crypto'
import { as } from './db.mjs'

export { as }

export async function q(db, sql, params = []) {
  return (await db.query(sql, params)).rows
}
export async function one(db, sql, params = []) {
  const rows = await q(db, sql, params)
  return rows[0]
}
/** Call an RPC returning a single jsonb value. */
export async function rpc(db, fn, args = []) {
  const ph = args.map((_, i) => `$${i + 1}`).join(', ')
  const row = await one(db, `select public.${fn}(${ph}) as r`, args)
  return row.r
}

/** Expect `promise` to reject; optionally match the message. Returns the error. */
export async function rejects(promise, pattern) {
  try { await promise } catch (e) {
    if (pattern && !pattern.test(String(e.message))) {
      throw new Error(`expected error matching ${pattern}, got: ${e.message}`)
    }
    return e
  }
  throw new Error(`expected an error${pattern ? ` matching ${pattern}` : ''}, but it succeeded`)
}

export async function makeUser(db, role, name) {
  const id = randomUUID()
  await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, jsonb_build_object('full_name', $3::text))`,
    [id, `${role}-${id.slice(0, 6)}@test.local`, name ?? role])
  await db.query(`update public.profiles set role = $2::user_role where id = $1`, [id, role])
  if (role === 'teacher') await db.query(`insert into public.teacher_profiles (id, display_name) values ($1, $2)`, [id, name ?? 'Teacher'])
  return id
}

let tokenSeq = 0
export async function makeStudent(db, name = 'Student', extra = {}) {
  const token = `ING-T${String(++tokenSeq).padStart(6, '0')}`
  const row = await one(db, `
    insert into public.crm_students (full_name, phone_number, total_paid_mad, verification_token, student_type)
    values ($1, $2, 0, $3, $4) returning id`,
    [name, extra.phone ?? '+212600112233', token, extra.type ?? 'course_student'])
  return { id: row.id, token }
}

export async function makeCourse(db, title = 'Course', { units = [] } = {}) {
  const c = await one(db, `insert into public.lms_courses (title, level) values ($1, 'A1') returning id`, [title])
  const modules = []
  for (let i = 0; i < units.length; i++) {
    const u = units[i]
    const m = await one(db, `insert into public.lms_modules (course_id, title, module_order, exam_quiz)
                             values ($1, $2, $3, $4) returning id`,
      [c.id, u.title ?? `Unit ${i + 1}`, i + 1, u.exam ? JSON.stringify(u.exam) : null])
    const lessons = []
    for (let j = 0; j < (u.lessons ?? []).length; j++) {
      const l = u.lessons[j]
      const quiz = l.quiz ?? null
      const row = await one(db, `insert into public.lms_lessons (module_id, title, lesson_order, lesson_type, exercise_url, quiz, has_quiz)
                                 values ($1, $2, $3, $4, $5, $6, $7) returning id`,
        [m.id, l.title ?? `Lesson ${j + 1}`, j + 1, l.type ?? 'video', l.exercise_url ?? null,
         quiz ? JSON.stringify(quiz) : null,
         !!(quiz && (Array.isArray(quiz) ? quiz.length : quiz.questions?.length))])
      lessons.push(row.id)
    }
    modules.push({ id: m.id, lessons })
  }
  return { id: c.id, modules }
}

export const QUIZ2 = { questions: [
  { q: 'one?', choices: ['a', 'b'], answer: 0 },
  { q: 'two?', choices: ['a', 'b', 'c'], answer: 2 },
] }

export async function makeClass(db, { title = 'Class', mode = 'group', teacher = null, course = null,
  capacity = null, waitlist = false } = {}) {
  const row = await one(db, `
    insert into public.online_classes (title, mode, teacher_id, course_id, capacity, waitlist_enabled)
    values ($1, $2, $3, $4, $5, $6) returning id`, [title, mode, teacher, course, capacity, waitlist])
  return row.id
}

export async function enrollClass(db, classId, studentId, enrolledAt = null, status = 'active') {
  const row = await one(db, `
    insert into public.online_class_enrollments (class_id, student_id, status, enrolled_at)
    values ($1, $2, $3, coalesce($4::timestamptz, now())) returning id, status`,
    [classId, studentId, status, enrolledAt])
  return row
}

export async function enrollCourse(db, courseId, studentId, enrolledAt = null) {
  const row = await one(db, `
    insert into public.lms_enrollments (course_id, student_id, enrolled_at)
    values ($1, $2, coalesce($3::timestamptz, now())) returning id`, [courseId, studentId, enrolledAt])
  return row.id
}

export async function makeSession(db, { teacher, classId = null, startsAt, status = 'done', mode = 'group', title = 'Session' }) {
  const row = await one(db, `
    insert into public.class_sessions (teacher_id, class_id, title, mode, starts_at, status)
    values ($1, $2, $3, $4, $5, $6) returning id`, [teacher, classId, title, mode, startsAt, status])
  return row.id
}

export async function pay(db, studentId, amount, paymentDate) {
  await db.query(`insert into public.crm_payments (student_id, payment_type, amount_mad, payment_status, payment_date)
                  values ($1, 'course_one_time', $2, 'paid', $3)`, [studentId, amount, paymentDate])
}
