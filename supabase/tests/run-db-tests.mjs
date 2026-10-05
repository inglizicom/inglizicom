// Database tests: fresh database → production baseline (046) → migrations 047+,
// then enrollment counting, date boundaries, duplicates, capacity, cancellation
// and deletion, teacher isolation, staff permissions, and the student exercise
// board against the unchanged progression gates.
//
//   npm run test:db

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { freshDatabase, checkBaselineFidelity, pendingMigrations, MIGRATIONS_DIR } from './db.mjs'
import {
  as, q, one, rpc, rejects, makeUser, makeStudent, makeCourse, makeClass, enrollClass, enrollCourse,
  makeSession, pay, QUIZ2,
} from './fixtures.mjs'

async function setup() {
  let fidelity = null
  const { db, applied } = await freshDatabase({ beforeMigrations: async d => { fidelity = await checkBaselineFidelity(d) } })
  const founder   = await makeUser(db, 'founder', 'Founder')
  const assistant = await makeUser(db, 'assistant', 'Assistant')
  const teacherA  = await makeUser(db, 'teacher', 'Teacher A')
  const teacherB  = await makeUser(db, 'teacher', 'Teacher B')
  return { db, applied, fidelity, founder, assistant, teacherA, teacherB }
}

const analytics = (ctx, from, to, filters = {}, bucket = 'day', detail = true) =>
  as(ctx.db, ctx.founder, () => rpc(ctx.db, 'enrollment_analytics', [from, to, JSON.stringify(filters), bucket, detail]))
const revenue = (ctx, from, to) =>
  as(ctx.db, ctx.founder, () => rpc(ctx.db, 'revenue_analytics', [from, to, 'day', true]))

// ════════════════════════════════════════════════════════════
describe('migrations on a fresh database', () => {
  let ctx
  before(async () => { ctx = await setup() })

  it('the baseline matches production at 046 (function bodies + object counts)', () => {
    assert.deepEqual(ctx.fidelity, [])
  })

  it('applies every migration after 046', () => {
    assert.deepEqual(ctx.applied, pendingMigrations())
    assert.ok(ctx.applied.includes('047_online_classes_enrollment.sql'))
  })

  it('is idempotent — re-applying 047+ changes nothing and does not fail', async () => {
    for (const f of pendingMigrations()) await ctx.db.exec(readFileSync(join(MIGRATIONS_DIR, f), 'utf8'))
    const t = await one(ctx.db, `select count(*)::int n from pg_class where relname in
      ('online_classes','online_class_enrollments','lms_enrollment_history')`)
    assert.equal(t.n, 3)
  })

  it('has RLS on every new table', async () => {
    const rows = await q(ctx.db, `select relname, relrowsecurity from pg_class
      where relname in ('online_classes','online_class_enrollments','lms_enrollment_history')`)
    for (const r of rows) assert.equal(r.relrowsecurity, true, r.relname)
  })
})

// ════════════════════════════════════════════════════════════
describe('enrollment counting', () => {
  let ctx, course, otherCourse, group, priv, s1, s2, s3
  const FROM = '2026-09-01', TO = '2026-09-30'

  before(async () => {
    ctx = await setup()
    course      = await makeCourse(ctx.db, 'English A1')
    otherCourse = await makeCourse(ctx.db, 'Business')
    group = await makeClass(ctx.db, { title: 'Group 1', teacher: ctx.teacherA, course: course.id })
    priv  = await makeClass(ctx.db, { title: 'Private 1', mode: 'private', teacher: ctx.teacherB })
    s1 = await makeStudent(ctx.db, 'Amal'); s2 = await makeStudent(ctx.db, 'Badr'); s3 = await makeStudent(ctx.db, 'Chama')
  })

  it('a course enrollment moves course metrics only', async () => {
    const before = (await analytics(ctx, FROM, TO)).kpis
    await enrollCourse(ctx.db, course.id, s1.id, '2026-09-10T10:00:00Z')
    const after = (await analytics(ctx, FROM, TO)).kpis
    assert.equal(after.course_enrollments, before.course_enrollments + 1)
    assert.equal(after.course_students, before.course_students + 1)
    assert.equal(after.class_enrollments, before.class_enrollments)
    assert.equal(after.class_students, before.class_students)
    assert.equal(after.unique_students, before.unique_students + 1)
    assert.equal(after.attendance.marks, before.attendance.marks)
    const rev = await revenue(ctx, FROM, TO)
    assert.equal(Number(rev.kpis.revenue), 0, 'an enrollment is not revenue')
  })

  it('a class enrollment moves class metrics, not revenue and not course metrics', async () => {
    const before = (await analytics(ctx, FROM, TO)).kpis
    const revBefore = (await revenue(ctx, FROM, TO)).kpis
    await enrollClass(ctx.db, group, s2.id, '2026-09-12T10:00:00Z')
    const after = (await analytics(ctx, FROM, TO)).kpis
    assert.equal(after.class_enrollments, before.class_enrollments + 1)
    assert.equal(after.group_enrollments, before.group_enrollments + 1)
    assert.equal(after.private_enrollments, before.private_enrollments)
    assert.equal(after.course_enrollments, before.course_enrollments)
    const revAfter = (await revenue(ctx, FROM, TO)).kpis
    assert.deepEqual(revAfter, revBefore)
  })

  it('attendance moves attendance metrics, never enrollment counts', async () => {
    const before = (await analytics(ctx, FROM, TO)).kpis
    const sess = await makeSession(ctx.db, { teacher: ctx.teacherA, classId: group, startsAt: '2026-09-15T17:00:00Z' })
    // s3 has no enrollment at all: an attendance row must not make them a student of anything.
    await ctx.db.query(`insert into class_attendance (session_id, student_id, status) values ($1, $2, 'present'), ($1, $3, 'absent')`,
      [sess, s2.id, s3.id])
    const after = (await analytics(ctx, FROM, TO)).kpis
    assert.equal(after.attendance.marks, before.attendance.marks + 2)
    assert.equal(after.sessions_done, before.sessions_done + 1)
    for (const k of ['course_enrollments', 'class_enrollments', 'unique_students', 'course_students', 'class_students']) {
      assert.equal(after[k], before[k], k)
    }
  })

  it('a payment moves revenue, never enrollment counts', async () => {
    const before = (await analytics(ctx, FROM, TO)).kpis
    await pay(ctx.db, s3.id, 500, '2026-09-20')
    const after = (await analytics(ctx, FROM, TO)).kpis
    assert.deepEqual(after, before)
    const rev = await revenue(ctx, FROM, TO)
    assert.equal(Number(rev.kpis.revenue), 500)
    assert.equal(rev.kpis.paying_students, 1)
  })

  it('unique students de-duplicates a student enrolled in a course and a class', async () => {
    await enrollClass(ctx.db, group, s1.id, '2026-09-13T10:00:00Z')   // s1 already has the course
    const k = (await analytics(ctx, FROM, TO)).kpis
    assert.equal(k.course_students, 1)
    assert.equal(k.class_students, 2)
    assert.equal(k.unique_students, 2)                               // s1, s2 — not 3
    assert.equal(k.both_students, 1)
  })

  it('separates group and private', async () => {
    await enrollClass(ctx.db, priv, s3.id, '2026-09-14T10:00:00Z')
    const k = (await analytics(ctx, FROM, TO)).kpis
    assert.equal(k.group_enrollments, 2)
    assert.equal(k.private_enrollments, 1)
    assert.equal(k.group_students + k.private_students, 3)
    assert.equal(k.class_enrollments, k.group_enrollments + k.private_enrollments)
  })

  it('every breakdown and the trend add up to the KPIs under a custom range and filters', async () => {
    for (const filters of [{}, { course_id: course.id }, { teacher_id: ctx.teacherA }, { mode: 'private' }, { status: 'active' }]) {
      const a = await analytics(ctx, '2026-09-05', '2026-09-25', filters, 'day')
      const k = a.kpis
      const sum = (arr, key) => arr.reduce((t, r) => t + Number(r[key]), 0)
      assert.equal(sum(a.trend, 'course_enrollments'), k.course_enrollments, `trend course ${JSON.stringify(filters)}`)
      assert.equal(sum(a.trend, 'class_enrollments'), k.class_enrollments, `trend class ${JSON.stringify(filters)}`)
      assert.equal(sum(a.trend, 'sessions_done'), k.sessions_done, `trend sessions ${JSON.stringify(filters)}`)
      assert.equal(sum(a.trend, 'attendance_marks'), k.attendance.marks, `trend attendance ${JSON.stringify(filters)}`)
      assert.equal(sum(a.by_course, 'enrollments'), k.course_enrollments, `by_course ${JSON.stringify(filters)}`)
      assert.equal(sum(a.by_class, 'enrollments'), k.class_enrollments, `by_class ${JSON.stringify(filters)}`)
      assert.equal(sum(a.by_teacher, 'class_enrollments'), k.class_enrollments, `by_teacher ${JSON.stringify(filters)}`)
      assert.equal(a.by_mode.group.enrollments + a.by_mode.private.enrollments, k.class_enrollments)
      assert.equal(k.course_status.active + k.course_status.completed + k.course_status.cancelled, k.course_enrollments)
      assert.equal(k.class_status.active + k.class_status.waitlisted + k.class_status.completed + k.class_status.cancelled,
        k.class_enrollments)
      // first and last trend buckets sit inside the range
      assert.ok(a.trend[0].bucket <= '2026-09-05' && a.trend.at(-1).bucket === '2026-09-25')
    }
  })

  it('filters mean what the definitions say', async () => {
    const byCourse = (await analytics(ctx, FROM, TO, { course_id: course.id })).kpis
    assert.equal(byCourse.course_enrollments, 1)
    assert.equal(byCourse.class_enrollments, 2, 'Group 1 is linked to the course; Private 1 is not')
    const byOther = (await analytics(ctx, FROM, TO, { course_id: otherCourse.id })).kpis
    assert.equal(byOther.course_enrollments + byOther.class_enrollments, 0)
    const byPrivate = (await analytics(ctx, FROM, TO, { mode: 'private' })).kpis
    assert.equal(byPrivate.class_enrollments, 1)
    assert.equal(byPrivate.course_enrollments, 0, 'cohort: the private student has no course')
    const byTeacherA = (await analytics(ctx, FROM, TO, { teacher_id: ctx.teacherA })).kpis
    assert.equal(byTeacherA.class_enrollments, 2)
    assert.equal(byTeacherA.course_enrollments, 1, "cohort: Amal is in Teacher A's class and in the course")
    assert.equal(byTeacherA.sessions_done, 1)
  })

  it('status filters scope both class enrollments and linked course cohorts', async () => {
    const filteredCourse = await makeCourse(ctx.db, 'Status cohort course')
    const filteredClass = await makeClass(ctx.db, { title: 'Status cohort class', teacher: ctx.teacherA, course: filteredCourse.id })
    const activeStudent = await makeStudent(ctx.db, 'Active cohort')
    const cancelledStudent = await makeStudent(ctx.db, 'Cancelled cohort')
    await enrollCourse(ctx.db, filteredCourse.id, activeStudent.id, '2026-09-10T10:00:00Z')
    await enrollCourse(ctx.db, filteredCourse.id, cancelledStudent.id, '2026-09-11T10:00:00Z')
    await enrollClass(ctx.db, filteredClass, activeStudent.id, '2026-09-10T10:00:00Z')
    const cancelled = await enrollClass(ctx.db, filteredClass, cancelledStudent.id, '2026-09-11T10:00:00Z')
    await as(ctx.db, ctx.assistant, () => rpc(ctx.db, 'staff_set_class_enrollment', [cancelled.id, 'cancelled', 'test', null, null]))

    // makeClass returns the class id itself
    const active = (await analytics(ctx, FROM, TO, { class_id: filteredClass, status: 'active' })).kpis
    assert.equal(active.class_enrollments, 1)
    assert.equal(active.course_enrollments, 1, 'only the active class student contributes course enrollments')
    assert.equal(active.unique_students, 1)

    const ended = (await analytics(ctx, FROM, TO, { class_id: filteredClass, status: 'cancelled' })).kpis
    assert.equal(ended.class_enrollments, 1)
    assert.equal(ended.course_enrollments, 0, 'an active course enrollment is not a cancelled course enrollment')
  })

  it('does not count completed legacy enrollments without a completion date as active', async () => {
    const legacyCourse = await makeCourse(ctx.db, 'Legacy completion')
    const legacyStudent = await makeStudent(ctx.db, 'Legacy completion student')
    await enrollCourse(ctx.db, legacyCourse.id, legacyStudent.id, '2026-09-10T10:00:00Z')
    await ctx.db.query(`update lms_enrollments set status = 'completed', completed_at = null where course_id = $1 and student_id = $2`,
      [legacyCourse.id, legacyStudent.id])
    // The touch trigger fills completed_at on the status transition; null it
    // in a second update to model pre-migration completed rows.
    await ctx.db.query(`update lms_enrollments set completed_at = null where course_id = $1 and student_id = $2`,
      [legacyCourse.id, legacyStudent.id])

    const result = await analytics(ctx, FROM, TO, { course_id: legacyCourse.id })
    assert.equal(result.kpis.course_status.completed, 1)
    assert.equal(result.kpis.active_at_end.course_enrollments, 0)
    assert.equal(result.lifetime.active_now_course, 0)
  })

  it('date boundaries follow Morocco local days, not UTC', async () => {
    const c = await makeCourse(ctx.db, 'Boundary')
    const a = await makeStudent(ctx.db, 'Late night'); const b = await makeStudent(ctx.db, 'Just after midnight')
    // 2026-10-31 23:30 local (UTC+1) = 22:30Z — still October.
    await enrollCourse(ctx.db, c.id, a.id, '2026-10-31T22:30:00Z')
    // 2026-11-01 00:30 local = 2026-10-31T23:30Z — UTC says October, Morocco says November.
    await enrollCourse(ctx.db, c.id, b.id, '2026-10-31T23:30:00Z')
    const oct = (await analytics(ctx, '2026-10-01', '2026-10-31', { course_id: c.id })).kpis
    const nov = (await analytics(ctx, '2026-11-01', '2026-11-30', { course_id: c.id })).kpis
    assert.equal(oct.course_enrollments, 1)
    assert.equal(nov.course_enrollments, 1)
    const day = (await analytics(ctx, '2026-11-01', '2026-11-01', { course_id: c.id })).kpis
    assert.equal(day.course_enrollments, 1, 'a single-day range is that whole local day')
    // revenue: payment_date is the local day it was paid
    await pay(ctx.db, a.id, 100, '2026-10-31'); await pay(ctx.db, b.id, 40, '2026-11-01')
    assert.equal(Number((await revenue(ctx, '2026-10-31', '2026-10-31')).kpis.revenue), 100)
    assert.equal(Number((await revenue(ctx, '2026-11-01', '2026-11-01')).kpis.revenue), 40)
  })

  it('a previous period does not overlap the current one', async () => {
    const cur = (await analytics(ctx, '2026-09-16', '2026-09-30')).kpis
    const prev = (await analytics(ctx, '2026-09-01', '2026-09-15')).kpis
    const all = (await analytics(ctx, '2026-09-01', '2026-09-30')).kpis
    assert.equal(cur.class_enrollments + prev.class_enrollments, all.class_enrollments)
    assert.equal(cur.course_enrollments + prev.course_enrollments, all.course_enrollments)
  })

  it('rejects an inverted range and unknown filter values', async () => {
    await rejects(analytics(ctx, '2026-09-30', '2026-09-01'), /before its start/)
    await rejects(analytics(ctx, FROM, TO, { mode: 'vip' }), /Unknown mode/)
    await rejects(analytics(ctx, FROM, TO, { status: 'deleted' }), /Unknown status/)
  })
})

// ════════════════════════════════════════════════════════════
describe('duplicates, capacity and lifecycle', () => {
  let ctx, s1, s2, s3
  before(async () => {
    ctx = await setup()
    s1 = await makeStudent(ctx.db, 'One'); s2 = await makeStudent(ctx.db, 'Two'); s3 = await makeStudent(ctx.db, 'Three')
  })

  it('prevents a duplicate open seat in the same class', async () => {
    const c = await makeClass(ctx.db, { title: 'Dup', teacher: ctx.teacherA })
    await enrollClass(ctx.db, c, s1.id)
    await rejects(enrollClass(ctx.db, c, s1.id), /duplicate key|one_open/)
    const res = await as(ctx.db, ctx.assistant, () => rpc(ctx.db, 'staff_enroll_class', [c, [s1.id, s2.id], null, null, false]))
    assert.deepEqual(res.map(r => r.result), ['duplicate', 'active'])
  })

  it('allows re-enrolling after an enrollment ended, keeping the old row', async () => {
    const c = await makeClass(ctx.db, { title: 'Rejoin', teacher: ctx.teacherA })
    const first = await enrollClass(ctx.db, c, s1.id)
    await as(ctx.db, ctx.assistant, () => rpc(ctx.db, 'staff_set_class_enrollment', [first.id, 'cancelled', 'moved city', null, null]))
    await rejects(as(ctx.db, ctx.assistant, () => rpc(ctx.db, 'staff_set_class_enrollment', [first.id, 'active', null, null, null])),
      /has ended/)
    await enrollClass(ctx.db, c, s1.id)
    const rows = await q(ctx.db, `select status, end_reason, ended_at is not null ended from online_class_enrollments
                                  where class_id = $1 order by created_at`, [c])
    assert.deepEqual(rows.map(r => r.status), ['cancelled', 'active'])
    assert.equal(rows[0].end_reason, 'moved city')
    assert.equal(rows[0].ended, true)
  })

  it('prevents a duplicate course enrollment', async () => {
    const course = await makeCourse(ctx.db, 'C')
    const r1 = await as(ctx.db, ctx.assistant, () => rpc(ctx.db, 'staff_enroll_course', [course.id, [s1.id, s2.id]]))
    const r2 = await as(ctx.db, ctx.assistant, () => rpc(ctx.db, 'staff_enroll_course', [course.id, [s1.id]]))
    assert.deepEqual(r1, { enrolled: 2, already: 0, not_found: 0 })
    assert.deepEqual(r2, { enrolled: 0, already: 1, not_found: 0 })
  })

  it('a private class holds exactly one student', async () => {
    const p = await makeClass(ctx.db, { title: 'Solo', mode: 'private', teacher: ctx.teacherB, capacity: 5 })
    assert.equal((await one(ctx.db, `select capacity from online_classes where id = $1`, [p])).capacity, 1)
    await enrollClass(ctx.db, p, s1.id)
    await rejects(enrollClass(ctx.db, p, s2.id), /full/)
  })

  it('fills a group to capacity, then waitlists, and promotes only when a seat frees up', async () => {
    const g = await makeClass(ctx.db, { title: 'Small', teacher: ctx.teacherA, capacity: 2, waitlist: true })
    const res = await as(ctx.db, ctx.assistant, () => rpc(ctx.db, 'staff_enroll_class', [g, [s1.id, s2.id, s3.id], null, null, false]))
    assert.deepEqual(res.map(r => r.result), ['active', 'active', 'waitlisted'])
    const waiting = res[2].enrollment_id
    await rejects(as(ctx.db, ctx.assistant, () => rpc(ctx.db, 'staff_set_class_enrollment', [waiting, 'active', null, null, null])), /full/)
    await as(ctx.db, ctx.assistant, () => rpc(ctx.db, 'staff_set_class_enrollment', [res[0].enrollment_id, 'cancelled', 'left', null, null]))
    const promoted = await as(ctx.db, ctx.assistant, () => rpc(ctx.db, 'staff_set_class_enrollment', [waiting, 'active', null, null, null]))
    assert.equal(promoted.status, 'active')
    assert.ok(promoted.activated_at, 'promotion stamps activated_at')
  })

  it('refuses enrollment into an archived or closed class', async () => {
    const c = await makeClass(ctx.db, { title: 'Old', teacher: ctx.teacherA })
    await ctx.db.query(`update online_classes set archived_at = now() where id = $1`, [c])
    await rejects(enrollClass(ctx.db, c, s1.id), /not open/)
  })

  it('refuses a non-teacher as class teacher', async () => {
    await rejects(makeClass(ctx.db, { title: 'X', teacher: ctx.assistant }), /not a teacher/)
  })
})

// ════════════════════════════════════════════════════════════
describe('cancellation and deletion', () => {
  let ctx, course, s1, s2
  before(async () => {
    ctx = await setup()
    course = await makeCourse(ctx.db, 'Cancelable', { units: [{ lessons: [{ quiz: QUIZ2 }] }] })
    s1 = await makeStudent(ctx.db, 'Keeps history'); s2 = await makeStudent(ctx.db, 'Gets deleted')
    await enrollCourse(ctx.db, course.id, s1.id, '2026-09-02T09:00:00Z')
    await enrollCourse(ctx.db, course.id, s2.id, '2026-09-02T09:00:00Z')
  })

  it('removing a course enrollment revokes access but keeps the record as cancelled', async () => {
    const lesson = course.modules[0].lessons[0]
    assert.ok(await rpc(ctx.db, 'student_lesson_quiz', [s1.token, lesson]), 'enrolled → can open the quiz')
    const ok = await as(ctx.db, ctx.assistant, () => rpc(ctx.db, 'staff_end_course_enrollment', [s1.id, course.id, 'refund']))
    assert.equal(ok, true)
    assert.equal(await rpc(ctx.db, 'student_lesson_quiz', [s1.token, lesson]), null, 'access revoked')
    const h = await one(ctx.db, `select final_status, end_reason, course_title, ended_by from lms_enrollment_history where student_id = $1`, [s1.id])
    assert.deepEqual({ ...h, ended_by: !!h.ended_by }, { final_status: 'active', end_reason: 'refund', course_title: 'Cancelable', ended_by: true })
    const k = (await analytics(ctx, '2026-09-01', '2026-09-30')).kpis
    assert.equal(k.course_enrollments, 2, 'the cancelled record still happened in September')
    assert.equal(k.course_status.cancelled, 1)
    assert.equal(k.course_status.active, 1)
    const ev = await one(ctx.db, `select count(*)::int n from crm_student_events where student_id = $1 and event_type = 'course_unenrolled'`, [s1.id])
    assert.equal(ev.n, 1, 'the student timeline records the removal')
  })

  it('a soft-deleted student disappears from every metric', async () => {
    const before = (await analytics(ctx, '2026-09-01', '2026-09-30')).kpis
    await ctx.db.query(`update crm_students set deleted_at = now() where id = $1`, [s2.id])
    const after = (await analytics(ctx, '2026-09-01', '2026-09-30')).kpis
    assert.equal(after.course_enrollments, before.course_enrollments - 1)
    assert.equal(after.unique_students, before.unique_students - 1)
  })

  it('a hard-deleted student or course takes its enrollments with it (no orphan history)', async () => {
    const tmpCourse = await makeCourse(ctx.db, 'Temp')
    const tmp = await makeStudent(ctx.db, 'Temp')
    await enrollCourse(ctx.db, tmpCourse.id, tmp.id)
    await ctx.db.query(`delete from crm_students where id = $1`, [tmp.id])
    const other = await makeStudent(ctx.db, 'Other')
    await enrollCourse(ctx.db, tmpCourse.id, other.id)
    await ctx.db.query(`delete from lms_courses where id = $1`, [tmpCourse.id])
    const n = await one(ctx.db, `select count(*)::int n from lms_enrollment_history where student_id in ($1, $2)`, [tmp.id, other.id])
    assert.equal(n.n, 0)
  })

  it('a session with attendance or a report cannot be deleted — not even by staff', async () => {
    const s = await makeSession(ctx.db, { teacher: ctx.teacherA, startsAt: '2026-09-03T17:00:00Z' })
    await ctx.db.query(`insert into class_attendance (session_id, student_id, status) values ($1, $2, 'present')`, [s, s1.id])
    await rejects(as(ctx.db, ctx.founder, () => ctx.db.query(`delete from class_sessions where id = $1`, [s])), /cancel it instead/)
    // …unless the teacher account itself is deleted (explicit, confirmed in the CRM).
    await ctx.db.query(`delete from auth.users where id = $1`, [ctx.teacherA])
    const left = await one(ctx.db, `select count(*)::int n from class_sessions where id = $1`, [s])
    assert.equal(left.n, 0)
  })
})

// ════════════════════════════════════════════════════════════
describe('teacher isolation', () => {
  let ctx, classA, classB, sessA, sessB, legacyA, mine, theirs, loose
  before(async () => {
    ctx = await setup()
    mine = await makeStudent(ctx.db, 'Mine'); theirs = await makeStudent(ctx.db, 'Theirs'); loose = await makeStudent(ctx.db, 'Nobody')
    classA = await makeClass(ctx.db, { title: 'A class', teacher: ctx.teacherA })
    classB = await makeClass(ctx.db, { title: 'B class', teacher: ctx.teacherB })
    await enrollClass(ctx.db, classA, mine.id)
    await enrollClass(ctx.db, classB, theirs.id)
    sessA = await makeSession(ctx.db, { teacher: ctx.teacherA, classId: classA, startsAt: '2026-09-10T17:00:00Z', status: 'scheduled' })
    sessB = await makeSession(ctx.db, { teacher: ctx.teacherB, classId: classB, startsAt: '2026-09-10T17:00:00Z', status: 'scheduled' })
    legacyA = await makeSession(ctx.db, { teacher: ctx.teacherA, startsAt: '2026-09-01T17:00:00Z' })
    await ctx.db.query(`insert into teacher_students (teacher_id, student_id) values ($1, $2)`, [ctx.teacherA, loose.id])
  })

  const asA = (fn) => as(ctx.db, ctx.teacherA, fn)

  it("cannot see another teacher's class or roster rows", async () => {
    const classes = await asA(() => q(ctx.db, `select id from online_classes`))
    assert.deepEqual(classes.map(r => r.id), [classA])
    const enr = await asA(() => q(ctx.db, `select class_id from online_class_enrollments`))
    assert.ok(enr.every(r => r.class_id === classA))
    const sessions = await asA(() => q(ctx.db, `select id from class_sessions where id = $1`, [sessB]))
    assert.equal(sessions.length, 0)
  })

  it("cannot read another teacher's roster by swapping the id in the RPC", async () => {
    const own = await asA(() => rpc(ctx.db, 'teacher_class_roster', [classA]))
    assert.deepEqual(own.map(r => r.full_name), ['Mine'])
    assert.match(own[0].phone_masked, /••••/)
    assert.equal(own[0].phone_number, undefined, 'raw phone never reaches a teacher')
    await rejects(asA(() => rpc(ctx.db, 'teacher_class_roster', [classB])), /Not your class/)
    await rejects(asA(() => rpc(ctx.db, 'session_roster', [sessB])), /Not your session/)
  })

  it('records attendance only for students on the session roster', async () => {
    await asA(() => ctx.db.query(`insert into class_attendance (session_id, student_id, status) values ($1, $2, 'present')`, [sessA, mine.id]))
    await rejects(asA(() => ctx.db.query(`insert into class_attendance (session_id, student_id, status) values ($1, $2, 'present')`, [sessA, theirs.id])),
      /row-level security/)
    await rejects(asA(() => ctx.db.query(`insert into class_attendance (session_id, student_id, status) values ($1, $2, 'present')`, [sessB, theirs.id])),
      /row-level security/)
    await rejects(asA(() => ctx.db.query(`insert into class_attendance (session_id, student_id, status) values ($1, $2, 'present')`, [sessA, loose.id])),
      /row-level security/, 'an assigned student is not on a class roster')
    // legacy session (no class): assignment still rules, as before
    await asA(() => ctx.db.query(`insert into class_attendance (session_id, student_id, status) values ($1, $2, 'late')`, [legacyA, loose.id]))
    await rejects(asA(() => ctx.db.query(`insert into class_attendance (session_id, student_id, status) values ($1, $2, 'late')`, [legacyA, mine.id])),
      /row-level security/)
  })

  it('a teacher mark is always signed by that teacher', async () => {
    await asA(() => ctx.db.query(`update class_attendance set status = 'absent', marked_by = $2 where session_id = $1`, [sessA, ctx.teacherB]))
    const r = await one(ctx.db, `select marked_by from class_attendance where session_id = $1`, [sessA])
    assert.equal(r.marked_by, ctx.teacherA)
  })

  it("cannot schedule into, or move a session into, another teacher's class", async () => {
    await rejects(asA(() => ctx.db.query(`insert into class_sessions (teacher_id, class_id, title, starts_at) values ($1, $2, 'x', now())`,
      [ctx.teacherA, classB])), /your own classes/)
    await rejects(asA(() => ctx.db.query(`update class_sessions set class_id = $2 where id = $1`, [sessA, classB])), /another class|your own classes/)
    await rejects(asA(() => ctx.db.query(`insert into class_sessions (teacher_id, title, starts_at) values ($1, 'x', now())`,
      [ctx.teacherB])), /row-level security/)
  })

  it("cannot file a report on another teacher's session", async () => {
    await rejects(asA(() => ctx.db.query(`insert into lesson_reports (session_id, teacher_id, covered) values ($1, $2, 'x')`, [sessB, ctx.teacherA])),
      /row-level security/)
    await asA(() => ctx.db.query(`insert into lesson_reports (session_id, teacher_id, covered) values ($1, $2, 'ok')`, [sessA, ctx.teacherA]))
  })

  it('can complete or cancel own sessions; can delete only an untouched scheduled one', async () => {
    const fresh = await makeSession(ctx.db, { teacher: ctx.teacherA, classId: classA, startsAt: '2026-09-20T17:00:00Z', status: 'scheduled' })
    await asA(() => ctx.db.query(`update class_sessions set status = 'cancelled', cancel_reason = 'sick' where id = $1`, [fresh]))
    await asA(() => ctx.db.query(`update class_sessions set status = 'done' where id = $1`, [sessA]))
    await rejects(asA(() => ctx.db.query(`delete from class_sessions where id = $1`, [sessA])).then(async () => {
      const n = await one(ctx.db, `select count(*)::int n from class_sessions where id = $1`, [sessA])
      if (n.n === 1) throw new Error('not deleted (policy)')
    }), /not deleted|cancel it instead/)
    const untouched = await makeSession(ctx.db, { teacher: ctx.teacherA, startsAt: '2026-09-25T17:00:00Z', status: 'scheduled' })
    await asA(() => ctx.db.query(`delete from class_sessions where id = $1`, [untouched]))
    assert.equal((await one(ctx.db, `select count(*)::int n from class_sessions where id = $1`, [untouched])).n, 0)
  })

  it('gets nothing from CRM tables and cannot call staff RPCs or analytics', async () => {
    await pay(ctx.db, mine.id, 300, '2026-09-10')
    assert.equal((await asA(() => q(ctx.db, `select * from crm_payments`))).length, 0)
    assert.equal((await asA(() => q(ctx.db, `select * from crm_students`))).length, 0)
    assert.equal((await asA(() => q(ctx.db, `select * from lms_enrollment_history`))).length, 0)
    await rejects(asA(() => rpc(ctx.db, 'staff_enroll_class', [classA, [theirs.id], null, null, false])), /Staff only/)
    await rejects(asA(() => rpc(ctx.db, 'enrollment_analytics', [null, null, '{}', 'month', true])), /Staff only/)
    await rejects(asA(() => rpc(ctx.db, 'staff_online_class_detail', [classB])), /Staff only/)
    await rejects(asA(() => ctx.db.query(`insert into online_class_enrollments (class_id, student_id) values ($1, $2)`, [classA, theirs.id])),
      /row-level security/)
    await rejects(asA(() => ctx.db.query(`update online_classes set teacher_id = $2 where id = $1`, [classB, ctx.teacherA])).then(async () => {
      const r = await one(ctx.db, `select teacher_id from online_classes where id = $1`, [classB])
      if (r.teacher_id !== ctx.teacherA) throw new Error('unchanged (policy)')
    }), /unchanged/)
    assert.deepEqual(await asA(() => rpc(ctx.db, 'teachers_scoreboard', [null, null])), [])
  })

  it('the roster RPC shows assigned and class students with the reason', async () => {
    const list = await asA(() => rpc(ctx.db, 'teacher_my_students'))
    const byName = Object.fromEntries(list.map(s => [s.full_name, s]))
    assert.deepEqual(Object.keys(byName).sort(), ['Mine', 'Nobody'])
    assert.equal(byName.Mine.assigned, false); assert.equal(byName.Mine.classes[0].title, 'A class')
    assert.equal(byName.Nobody.assigned, true); assert.deepEqual(byName.Nobody.classes, [])
  })

  it('a substitute sees only the seats that covered their session', async () => {
    const late = await makeStudent(ctx.db, 'Joined later')
    const subSession = await makeSession(ctx.db, { teacher: ctx.teacherB, classId: classA, startsAt: '2026-09-11T17:00:00Z', status: 'done' })
    // "Joined later" enrolls after the substitute's session and is cancelled before…
    // the cover rule is about the seat's end, so end their seat before the session.
    const e = await enrollClass(ctx.db, classA, late.id, '2026-09-01T10:00:00Z')
    await ctx.db.query(`update online_class_enrollments set status = 'cancelled', ended_at = '2026-09-05T10:00:00Z' where id = $1`, [e.id])
    const roster = await as(ctx.db, ctx.teacherB, () => rpc(ctx.db, 'teacher_class_roster', [classA]))
    assert.deepEqual(roster.map(r => r.full_name), ['Mine'])
    const sheet = await as(ctx.db, ctx.teacherB, () => rpc(ctx.db, 'session_roster', [subSession]))
    assert.deepEqual(sheet.filter(r => r.eligible).map(r => r.full_name), ['Mine'])
  })

  it('the WhatsApp check is service-role only and follows the roster', async () => {
    await rejects(asA(() => rpc(ctx.db, 'teacher_can_reach_student', [ctx.teacherA, mine.id])), /permission denied/)
    assert.equal(await rpc(ctx.db, 'teacher_can_reach_student', [ctx.teacherA, mine.id]), true)
    assert.equal(await rpc(ctx.db, 'teacher_can_reach_student', [ctx.teacherA, theirs.id]), false)
    assert.equal(await rpc(ctx.db, 'teacher_can_reach_student', [ctx.teacherA, loose.id]), true)
  })

  it('anonymous callers cannot reach staff or teacher RPCs', async () => {
    await rejects(as(ctx.db, 'anon', () => rpc(ctx.db, 'staff_online_classes', [false])), /permission denied/)
    await rejects(as(ctx.db, 'anon', () => rpc(ctx.db, 'teacher_class_roster', [classA])), /permission denied/)
    await rejects(as(ctx.db, 'anon', () => rpc(ctx.db, 'enrollment_analytics', [null, null, '{}', 'month', true])), /permission denied/)
  })
})

// ════════════════════════════════════════════════════════════
describe('staff permissions', () => {
  let ctx, s1, c
  before(async () => {
    ctx = await setup()
    s1 = await makeStudent(ctx.db, 'Staffed')
    c = await makeClass(ctx.db, { title: 'Run by staff', teacher: ctx.teacherA })
  })

  it('an assistant can create classes, enroll, assign teachers and read analytics', async () => {
    const asst = (fn) => as(ctx.db, ctx.assistant, fn)
    await asst(() => ctx.db.query(`insert into online_classes (title, mode, teacher_id) values ('By assistant', 'group', $1)`, [ctx.teacherB]))
    const r = await asst(() => rpc(ctx.db, 'staff_enroll_class', [c, [s1.id], null, null, false]))
    assert.equal(r[0].result, 'active')
    assert.equal(await asst(() => rpc(ctx.db, 'staff_assign_teacher', [ctx.teacherB, [s1.id], true])), 1)
    assert.equal(await asst(() => rpc(ctx.db, 'staff_assign_teacher', [ctx.teacherB, [s1.id], true])), 0, 'idempotent')
    const a = await asst(() => rpc(ctx.db, 'enrollment_analytics', [null, null, '{}', 'month', false]))
    assert.equal(a.kpis.class_enrollments, 1)
    const detail = await asst(() => rpc(ctx.db, 'staff_student_enrollments', [s1.id]))
    assert.equal(detail.classes.length, 1); assert.equal(detail.teachers[0].is_active, true)
  })

  it('the scoreboard separates assigned, class, course students and the period', async () => {
    const s2 = await makeStudent(ctx.db, 'Both')
    const course = await makeCourse(ctx.db, 'Course for scoreboard')
    await enrollCourse(ctx.db, course.id, s2.id)
    await enrollClass(ctx.db, c, s2.id)
    await ctx.db.query(`insert into teacher_students (teacher_id, student_id) values ($1, $2)`, [ctx.teacherA, s2.id])
    await makeSession(ctx.db, { teacher: ctx.teacherA, classId: c, startsAt: '2026-08-10T17:00:00Z', status: 'done' })
    await makeSession(ctx.db, { teacher: ctx.teacherA, classId: c, startsAt: '2026-09-10T17:00:00Z', status: 'done' })
    await makeSession(ctx.db, { teacher: ctx.teacherA, classId: c, startsAt: '2026-09-11T17:00:00Z', status: 'cancelled' })
    const rows = await as(ctx.db, ctx.founder, () => rpc(ctx.db, 'teachers_scoreboard', ['2026-09-01', '2026-09-30']))
    const a = rows.find(r => r.id === ctx.teacherA)
    assert.equal(a.assigned_students, 1)
    assert.equal(a.class_students, 2)
    assert.equal(a.unique_students, 2)
    assert.equal(a.course_students, 1)
    assert.equal(a.group_enrollments, 2)
    assert.equal(a.sessions_delivered, 1, 'August session is outside the period')
    assert.equal(a.sessions_cancelled, 1)
    assert.equal(a.reports_owed, 1)
    assert.equal(a.reports_owed_all_time, 2)
    assert.deepEqual(a.period, { from: '2026-09-01', to: '2026-09-30', timezone: 'Africa/Casablanca' })
  })
})

// ════════════════════════════════════════════════════════════
describe('student exercises and progression gates', () => {
  let ctx, course, student, u1l1, u1l2, u2l1, unit1, unit2
  before(async () => {
    ctx = await setup()
    course = await makeCourse(ctx.db, 'Path', { units: [
      { title: 'Unit 1', exam: QUIZ2, lessons: [
        { title: 'Greetings', type: 'quiz', quiz: QUIZ2 },
        { title: 'Practice sheet', type: 'exercise', exercise_url: 'https://inglizi.com/ex/1' }] },
      { title: 'Unit 2', lessons: [{ title: 'Numbers', type: 'quiz', quiz: QUIZ2 }] },
    ] })
    ;[unit1, unit2] = course.modules
    ;[u1l1, u1l2] = unit1.lessons
    ;[u2l1] = unit2.lessons
    student = await makeStudent(ctx.db, 'Learner')
    await enrollCourse(ctx.db, course.id, student.id)
  })

  const board = () => rpc(ctx.db, 'student_exercise_board', [student.token, null])
  const lessonItems = (b, lessonId) => b.units.flatMap(u => u.lessons).find(l => l.lesson_id === lessonId).items

  it('maps every exercise to its real course, unit and lesson', async () => {
    const b = await board()
    assert.deepEqual(b.units.map(u => [u.module_id, u.course_id, u.title]),
      [[unit1.id, course.id, 'Unit 1'], [unit2.id, course.id, 'Unit 2']])
    assert.deepEqual(b.units[0].lessons.map(l => l.lesson_id), [u1l1, u1l2])
    assert.deepEqual(lessonItems(b, u1l1).map(i => i.kind), ['lesson_quiz'])
    assert.deepEqual(lessonItems(b, u1l2).map(i => i.kind), ['external_exercise'])
    assert.deepEqual(b.units[0].unit_items.map(i => i.kind), ['unit_exam', 'unit_conversation'])
    assert.deepEqual(b.units[1].unit_items.map(i => i.kind), ['unit_conversation'])
  })

  it('keeps the lesson gate: the quiz must be passed before the lesson completes', async () => {
    assert.equal(await rpc(ctx.db, 'student_open_lesson', [student.token, u1l2]), false, 'lesson 2 locked before lesson 1')
    assert.equal(await rpc(ctx.db, 'student_complete_lesson', [student.token, u1l1]), false, 'quiz not passed yet')
    await rpc(ctx.db, 'student_submit_quiz', [student.token, u1l1, 1, 2, '[0,0]'])
    assert.equal(lessonItems(await board(), u1l1)[0].status, 'attempted')
    assert.equal(await rpc(ctx.db, 'student_complete_lesson', [student.token, u1l1]), false, '50% is not a pass')
    await rpc(ctx.db, 'student_submit_quiz', [student.token, u1l1, 2, 2, '[0,2]'])
    assert.equal(await rpc(ctx.db, 'student_complete_lesson', [student.token, u1l1]), true)
    assert.equal(lessonItems(await board(), u1l1)[0].status, 'passed')
  })

  it('opening an exercise link never completes it', async () => {
    assert.equal(await rpc(ctx.db, 'student_open_lesson', [student.token, u1l2]), true)
    const item = lessonItems(await board(), u1l2)[0]
    assert.equal(item.status, 'in_progress')
    assert.equal(item.detail.url, 'https://inglizi.com/ex/1')
    assert.equal(await rpc(ctx.db, 'student_complete_lesson', [student.token, u1l2]), true)
    assert.equal(lessonItems(await board(), u1l2)[0].status, 'completed')
  })

  it('keeps the unit gate: unit exam and correction review before the next unit', async () => {
    let b = await board()
    assert.equal(b.units[1].lessons[0].unlocked, false)
    assert.equal(lessonItems(b, u2l1)[0].status, 'locked')
    await rpc(ctx.db, 'student_submit_unit_exam', [student.token, unit1.id, 2, 2, '[0,2]'])
    assert.equal(await rpc(ctx.db, 'student_open_lesson', [student.token, u2l1]), false, 'review still pending')
    await rpc(ctx.db, 'student_submit_text', [student.token, unit1.id, 'Hello, my name is…'])
    assert.equal((await board()).units[0].unit_items.find(i => i.kind === 'unit_conversation').status, 'pending_review')
    await ctx.db.query(`update lms_submissions set status = 'reviewed', score = 90 where student_id = $1`, [student.id])
    assert.equal(await rpc(ctx.db, 'student_open_lesson', [student.token, u2l1]), true)
    b = await board()
    assert.equal(b.units[0].unit_items.find(i => i.kind === 'unit_exam').status, 'passed')
    assert.equal(b.units[0].unit_items.find(i => i.kind === 'unit_conversation').status, 'reviewed')
    assert.equal(b.units[1].lessons[0].unlocked, true)
  })

  it('staff tasks stay separate, may link a lesson, and take that lesson\'s course', async () => {
    const other = await makeCourse(ctx.db, 'Other course')
    await ctx.db.query(`insert into student_assignments (student_id, title, lesson_id, course_id) values ($1, 'Extra listening', $2, $3)`,
      [student.id, u2l1, other.id])
    await ctx.db.query(`insert into student_assignments (student_id, title) values ($1, 'Free task')`, [student.id])
    const b = await board()
    const linked = b.tasks.find(t => t.title === 'Extra listening')
    assert.equal(linked.course_id, course.id, 'course derived from the lesson, not the stale value')
    assert.equal(linked.lesson_title, 'Numbers'); assert.equal(linked.module_title, 'Unit 2')
    assert.ok(b.tasks.find(t => t.title === 'Free task' && t.lesson_id === null))
    assert.equal(b.units.flatMap(u => u.lessons).flatMap(l => l.items).length, 3, 'tasks never mix into curriculum items')
    const done = await rpc(ctx.db, 'student_complete_exercise', [student.token, linked.id])
    assert.equal(done, true)
  })

  it('the audit finds missing exercises, broken units, bad answers and orphans', async () => {
    const broken = await makeCourse(ctx.db, 'Broken', { units: [
      { lessons: [{ title: 'Video only', type: 'video' }, { title: 'Empty quiz lesson', type: 'quiz' },
                  { title: 'Bad answer', type: 'quiz', quiz: { questions: [{ q: 'x', choices: ['a'], answer: 3 }] } },
                  { title: 'Legacy array', type: 'quiz', quiz: [{ q: 'x', choices: ['a', 'b'], answer: 1 }] }] },
      { lessons: [] },
    ] })
    const outsider = await makeStudent(ctx.db, 'Not enrolled')
    await ctx.db.query(`insert into student_assignments (student_id, title, lesson_id) values ($1, 'Wrong course', $2)`,
      [outsider.id, broken.modules[0].lessons[0]])
    const audit = await as(ctx.db, ctx.assistant, () => rpc(ctx.db, 'curriculum_exercise_audit'))
    const kinds = (k) => audit.issues.filter(i => i.kind === k && i.course_title === 'Broken')
    assert.equal(kinds('lesson_missing_exercise').length, 2)
    assert.equal(kinds('lesson_missing_exercise').find(i => i.lesson_title === 'Empty quiz lesson').severity, 'error')
    assert.equal(kinds('lesson_missing_exercise').find(i => i.lesson_title === 'Video only').severity, 'warning')
    assert.equal(kinds('unit_without_lessons').length, 1)
    assert.equal(kinds('quiz_bad_answer').length, 1)
    assert.equal(kinds('quiz_not_gating').length, 1)
    assert.equal(kinds('task_outside_enrollment').length, 1)
    assert.equal(audit.issues.filter(i => i.course_title === 'Path' && i.severity !== 'info').length, 0, 'the healthy course is clean')
    await rejects(as(ctx.db, ctx.teacherA, () => rpc(ctx.db, 'curriculum_exercise_audit')), /Staff only/)
  })

  it('an unknown token gets nothing', async () => {
    assert.deepEqual(await rpc(ctx.db, 'student_exercise_board', ['ING-NOPE', null]), { found: false })
  })
})

// ════════════════════════════════════════════════════════════
describe('status filters and period-end snapshots (mixed course and class records)', () => {
  // Every record below is modelled in JS, then the RPC is checked against the
  // model under each status filter × entity filter × range.
  let ctx, C, K
  const recs = []           // { kind, student, status, enrolled, ended, completed, activated }
  const T = (s) => Date.parse(s)
  const dayEnd = (day) => T(`${day}T00:00:00+01:00`) + 86_400_000   // Morocco is UTC+1 in Sept/Oct 2026

  before(async () => {
    ctx = await setup()
    C = (await makeCourse(ctx.db, 'Matrix course')).id
    K = await makeClass(ctx.db, { title: 'Matrix class', teacher: ctx.teacherA, course: C, waitlist: true })
    const asst = (fn) => as(ctx.db, ctx.assistant, fn)
    const st = {}
    for (const n of ['P', 'Q', 'R', 'W', 'L', 'X']) st[n] = (await makeStudent(ctx.db, n)).id

    // P — active course + active seat
    await enrollCourse(ctx.db, C, st.P, '2026-09-10T10:00:00Z')
    await enrollClass(ctx.db, K, st.P, '2026-09-10T10:00:00Z')
    recs.push({ kind: 'course', student: 'P', status: 'active', enrolled: '2026-09-10T10:00:00Z' },
              { kind: 'class', student: 'P', status: 'active', enrolled: '2026-09-10T10:00:00Z', activated: '2026-09-10T10:00:00Z' })
    // Q — course removed on 09-20 (history → cancelled), seat cancelled on 09-20
    await enrollCourse(ctx.db, C, st.Q, '2026-09-11T10:00:00Z')
    await asst(() => rpc(ctx.db, 'staff_end_course_enrollment', [st.Q, C, 'refund']))
    await ctx.db.query(`update lms_enrollment_history set ended_at = '2026-09-20T10:00:00Z' where student_id = $1`, [st.Q])
    const q = await enrollClass(ctx.db, K, st.Q, '2026-09-11T10:00:00Z')
    await asst(() => rpc(ctx.db, 'staff_set_class_enrollment', [q.id, 'cancelled', 'left', null, null]))
    await ctx.db.query(`update online_class_enrollments set ended_at = '2026-09-20T10:00:00Z' where id = $1`, [q.id])
    recs.push({ kind: 'course', student: 'Q', status: 'cancelled', enrolled: '2026-09-11T10:00:00Z', ended: '2026-09-20T10:00:00Z' },
              { kind: 'class', student: 'Q', status: 'cancelled', enrolled: '2026-09-11T10:00:00Z', activated: '2026-09-11T10:00:00Z', ended: '2026-09-20T10:00:00Z' })
    // R — course completed 09-25, seat completed 09-25
    await enrollCourse(ctx.db, C, st.R, '2026-09-12T10:00:00Z')
    await ctx.db.query(`update lms_enrollments set status = 'completed', completed_at = '2026-09-25T10:00:00Z' where student_id = $1`, [st.R])
    const r = await enrollClass(ctx.db, K, st.R, '2026-09-12T10:00:00Z')
    await asst(() => rpc(ctx.db, 'staff_set_class_enrollment', [r.id, 'completed', null, null, null]))
    await ctx.db.query(`update online_class_enrollments set ended_at = '2026-09-25T10:00:00Z' where id = $1`, [r.id])
    recs.push({ kind: 'course', student: 'R', status: 'completed', enrolled: '2026-09-12T10:00:00Z', completed: '2026-09-25T10:00:00Z' },
              { kind: 'class', student: 'R', status: 'completed', enrolled: '2026-09-12T10:00:00Z', activated: '2026-09-12T10:00:00Z', ended: '2026-09-25T10:00:00Z' })
    // W — active course, waitlisted seat (never activated)
    await enrollCourse(ctx.db, C, st.W, '2026-09-13T10:00:00Z')
    await enrollClass(ctx.db, K, st.W, '2026-09-13T10:00:00Z', 'waitlisted')
    recs.push({ kind: 'course', student: 'W', status: 'active', enrolled: '2026-09-13T10:00:00Z' },
              { kind: 'class', student: 'W', status: 'waitlisted', enrolled: '2026-09-13T10:00:00Z' })
    // L — legacy completed course with no completed_at, no class
    await enrollCourse(ctx.db, C, st.L, '2026-09-14T10:00:00Z')
    await ctx.db.query(`update lms_enrollments set status = 'completed' where student_id = $1`, [st.L])
    await ctx.db.query(`update lms_enrollments set completed_at = null where student_id = $1`, [st.L])
    recs.push({ kind: 'course', student: 'L', status: 'completed', enrolled: '2026-09-14T10:00:00Z' })
    // X — active seat, no course
    await enrollClass(ctx.db, K, st.X, '2026-09-15T10:00:00Z')
    recs.push({ kind: 'class', student: 'X', status: 'active', enrolled: '2026-09-15T10:00:00Z', activated: '2026-09-15T10:00:00Z' })
  })

  /** What the counting rules say the KPIs must be. */
  function model(filters, toDay) {
    const s = filters.status
    const okStatus = (x) => !s || x.status === s
    const cohort = filters.class_id
      ? new Set(recs.filter(x => x.kind === 'class' && okStatus(x)).map(x => x.student)) : null
    const ce = recs.filter(x => x.kind === 'course' && okStatus(x) && (!cohort || cohort.has(x.student)))
    const ke = recs.filter(x => x.kind === 'class' && okStatus(x))
    const t = dayEnd(toDay)
    const ceSnap = ce.filter(x => T(x.enrolled) < t && (!x.ended || T(x.ended) > t)
      && (x.completed ? T(x.completed) > t : x.status !== 'completed'))
    const keSnap = ke.filter(x => x.activated && T(x.activated) < t && (!x.ended || T(x.ended) > t))
    const count = (arr, st) => arr.filter(x => x.status === st).length
    return {
      course_enrollments: ce.length, class_enrollments: ke.length,
      unique_students: new Set([...ce, ...ke].map(x => x.student)).size,
      course_status: { active: count(ce, 'active'), completed: count(ce, 'completed'), cancelled: count(ce, 'cancelled') },
      class_status: { active: count(ke, 'active'), waitlisted: count(ke, 'waitlisted'),
                      completed: count(ke, 'completed'), cancelled: count(ke, 'cancelled') },
      snap: { course: ceSnap.length, class: keSnap.length,
              unique: new Set([...ceSnap, ...keSnap].map(x => x.student)).size },
    }
  }

  it('every status filter × entity filter × range matches the counting rules, and the CSV rows match the KPIs', async () => {
    for (const status of [undefined, 'active', 'waitlisted', 'completed', 'cancelled']) {
      for (const entity of [{}, { course_id: C }, { class_id: K }]) {
        for (const [from, to] of [['2026-09-01', '2026-09-30'], ['2026-09-01', '2026-09-22']]) {
          const filters = { ...entity, ...(status ? { status } : {}) }
          const label = `${JSON.stringify(filters)} ${from}..${to}`
          const k = (await analytics(ctx, from, to, filters)).kpis
          const m = model(filters, to)
          assert.equal(k.course_enrollments, m.course_enrollments, `course_enrollments ${label}`)
          assert.equal(k.class_enrollments, m.class_enrollments, `class_enrollments ${label}`)
          assert.equal(k.unique_students, m.unique_students, `unique_students ${label}`)
          assert.deepEqual(k.course_status, m.course_status, `course_status ${label}`)
          assert.deepEqual(k.class_status, m.class_status, `class_status ${label}`)
          assert.equal(k.active_at_end.course_enrollments, m.snap.course, `active_at_end.course ${label}`)
          assert.equal(k.active_at_end.class_enrollments, m.snap.class, `active_at_end.class ${label}`)
          assert.equal(k.active_at_end.unique_students, m.snap.unique, `active_at_end.unique ${label}`)
          const rows = await as(ctx.db, ctx.founder, () => rpc(ctx.db, 'enrollment_analytics_rows', [from, to, JSON.stringify(filters)]))
          assert.equal(rows.filter(x => x.kind === 'course').length, k.course_enrollments, `csv course rows ${label}`)
          assert.equal(rows.filter(x => x.kind === 'class').length, k.class_enrollments, `csv class rows ${label}`)
        }
      }
    }
  })

  it('period-end counts: a legacy completed row with no completed_at is never active', async () => {
    const sept = (await analytics(ctx, '2026-09-01', '2026-09-30')).kpis.active_at_end
    assert.equal(sept.course_enrollments, 2, 'P and W; Q ended 09-20, R completed 09-25, L legacy-completed')
    const mid = (await analytics(ctx, '2026-09-01', '2026-09-22')).kpis.active_at_end
    assert.equal(mid.course_enrollments, 3, 'R was still active on 09-22; L is not')
    assert.equal(mid.class_enrollments, 3, 'P, R and X held seats on 09-22; W was only waitlisted')
    const life = (await analytics(ctx, null, '2026-09-30')).lifetime
    assert.equal(life.active_now_course, 2)
    assert.equal(life.active_now_class, 2)
  })
})

// ════════════════════════════════════════════════════════════
describe('teacher home, roster and scoreboard counts', () => {
  let ctx, teacherC, st, cls
  const SEPT = ['2026-09-01', '2026-09-30']
  const asA = (fn) => as(ctx.db, ctx.teacherA, fn)

  before(async () => {
    ctx = await setup()
    teacherC = await makeUser(ctx.db, 'teacher', 'Teacher Empty')
    const C1 = (await makeCourse(ctx.db, 'Course One')).id
    const C2 = (await makeCourse(ctx.db, 'Course Two')).id
    cls = {
      GA1: await makeClass(ctx.db, { title: 'A group 1', teacher: ctx.teacherA, course: C1 }),
      GA2: await makeClass(ctx.db, { title: 'A group 2', teacher: ctx.teacherA, waitlist: true }),
      PA:  await makeClass(ctx.db, { title: 'A private', mode: 'private', teacher: ctx.teacherA }),
      ARC: await makeClass(ctx.db, { title: 'A archived', teacher: ctx.teacherA }),
      GB:  await makeClass(ctx.db, { title: 'B group', teacher: ctx.teacherB }),
    }
    st = {}
    for (const n of ['assignedOnly', 'courseNotClass', 'both', 'classOnly', 'waitlisted', 'archived', 'deleted']) {
      st[n] = (await makeStudent(ctx.db, n)).id
    }
    const assign = (t, s) => ctx.db.query(`insert into teacher_students (teacher_id, student_id) values ($1, $2)`, [t, s])
    // assigned, no course, no class
    await assign(ctx.teacherA, st.assignedOnly)
    // assigned to A, active in a course, seated in B's class only
    await assign(ctx.teacherA, st.courseNotClass)
    await enrollCourse(ctx.db, C1, st.courseNotClass)
    await enrollClass(ctx.db, cls.GB, st.courseNotClass)
    // assigned, two active courses, two of A's classes (group + private)
    await assign(ctx.teacherA, st.both)
    await enrollCourse(ctx.db, C1, st.both); await enrollCourse(ctx.db, C2, st.both)
    await enrollClass(ctx.db, cls.GA1, st.both); await enrollClass(ctx.db, cls.PA, st.both)
    // two of A's group classes, not assigned, course completed (not active)
    await enrollClass(ctx.db, cls.GA1, st.classOnly); await enrollClass(ctx.db, cls.GA2, st.classOnly)
    await enrollCourse(ctx.db, C1, st.classOnly)
    await ctx.db.query(`update lms_enrollments set status = 'completed' where student_id = $1`, [st.classOnly])
    // only waitlisted, only in an archived class, soft-deleted: none of them are A's students
    await enrollClass(ctx.db, cls.GA2, st.waitlisted, null, 'waitlisted')
    await enrollClass(ctx.db, cls.ARC, st.archived)
    await ctx.db.query(`update online_classes set archived_at = now() where id = $1`, [cls.ARC])
    await assign(ctx.teacherA, st.deleted)
    await ctx.db.query(`update crm_students set deleted_at = now() where id = $1`, [st.deleted])
    // sessions: one done in September with two marks, one done in August, one cancelled, one ahead
    const sept = await makeSession(ctx.db, { teacher: ctx.teacherA, classId: cls.GA1, startsAt: '2026-09-10T17:00:00Z' })
    await ctx.db.query(`insert into class_attendance (session_id, student_id, status) values ($1, $2, 'present'), ($1, $3, 'absent')`,
      [sept, st.both, st.classOnly])
    await makeSession(ctx.db, { teacher: ctx.teacherA, classId: cls.GA1, startsAt: '2026-08-10T17:00:00Z' })
    await makeSession(ctx.db, { teacher: ctx.teacherA, classId: cls.GA1, startsAt: '2026-09-12T17:00:00Z', status: 'cancelled' })
    await makeSession(ctx.db, { teacher: ctx.teacherA, classId: cls.GA1, startsAt: '2099-01-05T17:00:00Z', status: 'scheduled' })
    // payments: two in September, one in August
    await pay(ctx.db, st.both, 300, '2026-09-12')
    await pay(ctx.db, st.courseNotClass, 200, '2026-09-13')
    await pay(ctx.db, st.assignedOnly, 100, '2026-08-01')
  })

  it('separates assigned, course and live-class figures and de-duplicates unique students', async () => {
    const ov = await asA(() => rpc(ctx.db, 'teacher_overview', SEPT))
    assert.deepEqual(ov.roster, {
      unique_students: 4,        // assignedOnly, courseNotClass, both, classOnly — each once
      assigned_students: 3, assigned_only: 2, class_only: 1, assigned_and_class: 1,
      course_students: 2,        // courseNotClass, both (classOnly's course is completed)
      course_enrollments: 3,     // both holds two active courses: relationships, not people
      no_course_students: 2,
      class_students: 2,         // both, classOnly
      class_seats: 4,            // both: GA1 + PA, classOnly: GA1 + GA2
      group_seats: 3, private_seats: 1, group_students: 2, private_students: 1,
      group_classes: 2, private_classes: 1,   // the archived class is not active
    })
    assert.ok(ov.roster.unique_students < ov.roster.assigned_students + ov.roster.class_students,
      'a student both assigned and seated is counted once')
  })

  it('period figures follow the chosen dates; upcoming does not', async () => {
    const sept = await asA(() => rpc(ctx.db, 'teacher_overview', SEPT))
    assert.equal(sept.period.sessions_delivered, 1)
    assert.equal(sept.period.sessions_cancelled, 1)
    assert.deepEqual(sept.period.attendance, { marks: 2, present: 1, late: 0, absent: 1, excused: 0, rate: 50 })
    assert.equal(sept.upcoming_sessions, 1)
    const aug = await asA(() => rpc(ctx.db, 'teacher_overview', ['2026-08-01', '2026-08-31']))
    assert.equal(aug.period.sessions_delivered, 1)
    assert.equal(aug.period.attendance.marks, 0)
    assert.equal(aug.period.attendance.rate, null)
    assert.deepEqual(aug.roster, sept.roster, 'roster figures are current, not period figures')
    await rejects(asA(() => rpc(ctx.db, 'teacher_overview', ['2026-09-30', '2026-09-01'])), /before its start/)
  })

  it('the no-argument call (current app) still returns its keys', async () => {
    const ov = await asA(() => rpc(ctx.db, 'teacher_overview'))
    assert.equal(ov.students_total, 4)
    assert.equal(ov.assigned_students, 3)
    assert.equal(ov.class_students, 2)
    assert.equal(ov.classes_active, 3)
    assert.equal(ov.period.sessions_delivered, 2, 'no dates = all time')
    for (const k of ['classes_month', 'hours_month', 'upcoming', 'reports_owed', 'attendance_rate', 'rating_avg', 'rating_count']) {
      assert.ok(k in ov, k)
    }
  })

  it('the roster lists courses and class memberships separately, with the relationship', async () => {
    const list = await asA(() => rpc(ctx.db, 'teacher_my_students'))
    const by = Object.fromEntries(list.map(s => [s.full_name, s]))
    assert.deepEqual(Object.keys(by).sort(), ['assignedOnly', 'both', 'classOnly', 'courseNotClass'])

    assert.equal(by.assignedOnly.relationship, 'assigned')
    assert.deepEqual(by.assignedOnly.courses, []); assert.deepEqual(by.assignedOnly.class_memberships, [])

    assert.equal(by.courseNotClass.relationship, 'assigned')
    assert.deepEqual(by.courseNotClass.courses.map(c => [c.title, c.status]), [['Course One', 'active']])
    assert.deepEqual(by.courseNotClass.class_memberships, [], "another teacher's class is not shown")

    assert.equal(by.both.relationship, 'both')
    assert.deepEqual(by.both.courses.map(c => c.title), ['Course One', 'Course Two'])
    assert.deepEqual(by.both.class_memberships.map(m => [m.title, m.mode, m.status]).sort(),
      [['A group 1', 'group', 'active'], ['A private', 'private', 'active']])

    assert.equal(by.classOnly.relationship, 'class')
    assert.deepEqual(by.classOnly.courses.map(c => c.status), ['completed'])
    assert.equal(by.classOnly.class_memberships.length, 2)

    const keys = JSON.stringify(list)
    assert.doesNotMatch(keys, /phone_number|amount|payment|paid/i, 'no raw phones and no payments reach a teacher')
  })

  it('another teacher, and a teacher with an empty roster, see only their own (or nothing)', async () => {
    const b = await as(ctx.db, ctx.teacherB, () => rpc(ctx.db, 'teacher_overview', SEPT))
    assert.equal(b.roster.unique_students, 1)
    assert.equal(b.roster.class_only, 1)
    assert.equal(b.roster.course_students, 1)
    const bList = await as(ctx.db, ctx.teacherB, () => rpc(ctx.db, 'teacher_my_students'))
    assert.deepEqual(bList.map(s => s.full_name), ['courseNotClass'])
    assert.deepEqual(bList[0].class_memberships.map(m => m.title), ['B group'])
    assert.equal(bList[0].assigned, false, "B does not see A's assignment as theirs")

    const empty = await as(ctx.db, teacherC, () => rpc(ctx.db, 'teacher_overview', SEPT))
    assert.ok(Object.values(empty.roster).every(v => v === 0), 'all zero')
    assert.equal(empty.period.sessions_delivered, 0)
    assert.equal(empty.period.attendance.rate, null)
    assert.deepEqual(await as(ctx.db, teacherC, () => rpc(ctx.db, 'teacher_my_students')), [])

    assert.deepEqual(await as(ctx.db, ctx.assistant, () => rpc(ctx.db, 'teacher_overview', SEPT)), {}, 'staff are not teachers')
    await rejects(asA(() => rpc(ctx.db, 'teacher_counts', [ctx.teacherB, null, null])), /permission denied/)
    await rejects(asA(() => q(ctx.db, `select * from teacher_roster($1)`, [ctx.teacherB])), /permission denied/)
  })

  it('the scoreboard shows the same figures as each teacher sees, with revenue labelled non-exclusive', async () => {
    const rows = await as(ctx.db, ctx.founder, () => rpc(ctx.db, 'teachers_scoreboard', SEPT))
    for (const [id, who] of [[ctx.teacherA, ctx.teacherA], [ctx.teacherB, ctx.teacherB], [teacherC, teacherC]]) {
      const own = await as(ctx.db, who, () => rpc(ctx.db, 'teacher_overview', SEPT))
      const row = rows.find(r => r.id === id)
      assert.deepEqual(row.roster, own.roster)
      assert.equal(row.sessions_delivered, own.period.sessions_delivered)
      assert.equal(row.attendance_marks, own.period.attendance.marks)
    }
    const a = rows.find(r => r.id === ctx.teacherA)
    assert.equal(a.unique_students, 4); assert.equal(a.course_enrollments, 3); assert.equal(a.class_seats, 4)
    assert.equal(Number(a.roster_revenue), 500, 'September payments by A\'s students; August excluded')
    assert.equal(a.roster_paying_students, 2)
    const b = rows.find(r => r.id === ctx.teacherB)
    assert.equal(Number(b.roster_revenue), 200, 'the same payment also appears under B: never sum this column')
    const total = await as(ctx.db, ctx.founder, () => rpc(ctx.db, 'revenue_analytics', [...SEPT, 'month', false]))
    assert.equal(Number(total.kpis.revenue), 500)
  })
})

// ════════════════════════════════════════════════════════════
describe('founder revenue and conversion', () => {
  let ctx, s1
  before(async () => {
    ctx = await setup()
    s1 = (await makeStudent(ctx.db, 'Payer')).id
    const lead = (plan, status, archived = false) => ctx.db.query(
      `insert into subscription_leads (plan_id, full_name, status, is_archived, amount_mad) values ($1, 'Lead', $2, $3, 300)`,
      [plan, status, archived])
    await lead('monthly', 'paid'); await lead('monthly', 'converted')
    await lead('monthly', 'new');  await lead('monthly', 'contacted')
    await lead('monthly', 'paid', true)                          // archived
    await lead('test_completed', 'new'); await lead('test_completed', 'new'); await lead('inquiry', 'paid')
    await pay(ctx.db, s1, 100, '2026-10-31')
    await pay(ctx.db, s1, 40, '2026-11-01')
    // legacy row: no payment_date, recorded 2026-11-01 00:30 Morocco time
    await ctx.db.query(`insert into crm_payments (student_id, payment_type, amount_mad, payment_status, payment_date, created_at)
                        values ($1, 'course_one_time', 7, 'paid', null, '2026-10-31T23:30:00Z')`, [s1])
  })

  it('conversion is paid leads over leads from one cohort', async () => {
    const ov = await as(ctx.db, ctx.founder, () => rpc(ctx.db, 'owner_overview'))
    assert.deepEqual({ leads: ov.conversion.leads, paid: ov.conversion.paid }, { leads: 4, paid: 2 })
    assert.equal(Number(ov.conversion_rate), 50, 'archived, test and inquiry leads are in neither side')
    assert.equal(await as(ctx.db, ctx.assistant, () => rpc(ctx.db, 'owner_overview')), null, 'founder only')
  })

  it('revenue is dated by payment_date, legacy rows by their Morocco day, in every session time zone', async () => {
    const between = (a, b) => one(ctx.db, `select revenue_between(casa_day_start($1::date), casa_day_start($2::date)) as v`, [a, b])
    const rev = (a, b) => as(ctx.db, ctx.founder, () => rpc(ctx.db, 'revenue_analytics', [a, b, 'month', false]))
    for (const tz of ['UTC', 'Asia/Tokyo', 'America/Los_Angeles']) {
      await ctx.db.exec(`set timezone = '${tz}'`)
      assert.equal(Number((await between('2026-10-01', '2026-11-01')).v), 100, `October owner revenue in ${tz}`)
      assert.equal(Number((await between('2026-11-01', '2026-12-01')).v), 47, `November owner revenue in ${tz}`)
    }
    await ctx.db.exec(`set timezone = 'UTC'`)
    assert.equal(Number((await rev('2026-10-01', '2026-10-31')).kpis.revenue), 100, 'analytics agrees with the owner view')
    assert.equal(Number((await rev('2026-11-01', '2026-11-30')).kpis.revenue), 47)
  })
})

// ════════════════════════════════════════════════════════════
describe('student ratings: who may rate a teacher', () => {
  let ctx, groupA, groupB
  const myTeachers = (token) => as(ctx.db, 'anon', () => rpc(ctx.db, 'student_my_teachers', [token]))
  const review = (token, teacher, stars, comment = null) =>
    as(ctx.db, 'anon', () => rpc(ctx.db, 'submit_teacher_review', [token, teacher, stars, comment]))
  const asst = fn => as(ctx.db, ctx.assistant, fn)

  before(async () => {
    ctx = await setup()
    groupA = await makeClass(ctx.db, { title: 'Group A', teacher: ctx.teacherA, waitlist: true })
    groupB = await makeClass(ctx.db, { title: 'Group B', teacher: ctx.teacherB })
  })

  it('a student with only a class seat sees the class teacher and can rate them', async () => {
    const s = await makeStudent(ctx.db, 'Seated')
    await enrollClass(ctx.db, groupA, s.id)
    const list = await myTeachers(s.token)
    assert.deepEqual(list.map(t => t.id), [ctx.teacherA])
    assert.equal((await review(s.token, ctx.teacherA, 5, 'Great class')).ok, true)
    const row = await one(ctx.db, `select rating, comment from teacher_reviews where teacher_id = $1 and student_id = $2`, [ctx.teacherA, s.id])
    assert.equal(row.rating, 5); assert.equal(row.comment, 'Great class')
  })

  it('a finished (completed) seat can still rate; a waitlisted one cannot', async () => {
    const done = await makeStudent(ctx.db, 'Finished')
    const e = await enrollClass(ctx.db, groupA, done.id)
    await asst(() => rpc(ctx.db, 'staff_set_class_enrollment', [e.id, 'completed', null, null, null]))
    assert.equal((await review(done.token, ctx.teacherA, 4)).ok, true)

    const waiting = await makeStudent(ctx.db, 'Waiting')
    await enrollClass(ctx.db, groupA, waiting.id, null, 'waitlisted')
    assert.deepEqual(await myTeachers(waiting.token), [])
    assert.equal((await review(waiting.token, ctx.teacherA, 5)).ok, false)
  })

  it('assignment by the admin still works, and rating again replaces the old rating', async () => {
    const s = await makeStudent(ctx.db, 'Assigned')
    await ctx.db.query(`insert into teacher_students (teacher_id, student_id) values ($1, $2)`, [ctx.teacherB, s.id])
    assert.equal((await review(s.token, ctx.teacherB, 3, 'ok')).ok, true)
    assert.equal((await review(s.token, ctx.teacherB, 5, 'much better')).ok, true)
    const rows = await q(ctx.db, `select rating, comment from teacher_reviews where teacher_id = $1 and student_id = $2`, [ctx.teacherB, s.id])
    assert.equal(rows.length, 1); assert.equal(rows[0].rating, 5); assert.equal(rows[0].comment, 'much better')
  })

  it('nobody can rate a teacher who does not teach them', async () => {
    const stranger = await makeStudent(ctx.db, 'Stranger')
    assert.equal((await review(stranger.token, ctx.teacherA, 1)).ok, false)
    const other = await makeStudent(ctx.db, 'Other group')
    await enrollClass(ctx.db, groupB, other.id)
    assert.equal((await review(other.token, ctx.teacherA, 1)).ok, false, 'a seat in B does not reach teacher A')
    assert.equal((await review('ING-NOPE', ctx.teacherA, 5)).ok, false, 'unknown token')
    const n = await one(ctx.db, `select count(*)::int n from teacher_reviews where rating = 1`)
    assert.equal(n.n, 0)
  })
})

// ════════════════════════════════════════════════════════════
describe('teacher view of a student\'s learning (052)', () => {
  let ctx, course, s1, s2
  const learning = (who, student) => as(ctx.db, who, () => rpc(ctx.db, 'teacher_student_learning', [student]))

  before(async () => {
    ctx = await setup()
    course = await makeCourse(ctx.db, 'English A1', { units: [
      { title: 'Unit 1', exam: QUIZ2, lessons: [{ title: 'L1' }, { title: 'L2' }] },
      { title: 'Unit 2', lessons: [{ title: 'L3' }, { title: 'L4' }] },
    ] })
    s1 = await makeStudent(ctx.db, 'Learner')
    s2 = await makeStudent(ctx.db, 'No course')
    await enrollCourse(ctx.db, course.id, s1.id)
    await ctx.db.query(`insert into teacher_students (teacher_id, student_id) values ($1, $2), ($1, $3)`, [ctx.teacherA, s1.id, s2.id])
    await ctx.db.query(`insert into lms_lesson_progress (student_id, lesson_id, status, completed_at) values ($1, $2, 'completed', now())`,
      [s1.id, course.modules[0].lessons[0]])
    await ctx.db.query(`insert into lms_quiz_results (student_id, lesson_id, score, total, passed) values ($1, $2, 4, 5, true)`,
      [s1.id, course.modules[0].lessons[0]])
    await ctx.db.query(`insert into student_certificates (student_id, course_id, kind, title, serial) values ($1, $2, 'course', 'A0 certificate', 'SER-1')`,
      [s1.id, course.id])
  })

  it('the student\'s own teacher sees progress, position and certificates', async () => {
    const r = await learning(ctx.teacherA, s1.id)
    assert.equal(r.course.title, 'English A1')
    assert.equal(r.course.lessons_total, 4)
    assert.equal(r.course.lessons_done, 1)
    assert.equal(r.course.progress_pct, 25)
    assert.equal(r.course.unit, 'Unit 1')
    assert.equal(r.course.lesson, 'L2')
    assert.match(r.course.next_milestone, /Unit 1/)
    assert.equal(r.lessons_completed, 1)
    assert.equal(r.quizzes_passed, 1)
    assert.equal(r.quiz_avg, 80)
    assert.equal(r.weekly.length, 8)
    assert.equal(r.weekly[7].lessons, 1, 'this week counts the completed lesson')
    assert.deepEqual(r.certificates.map(c => c.serial), ['SER-1'])
  })

  it('never returns payment or contact fields', async () => {
    const r = await learning(ctx.teacherA, s1.id)
    const keys = JSON.stringify(r)
    for (const k of ['payment', 'amount', 'paid', 'phone', 'balance']) assert.ok(!keys.includes(`"${k}`), k)
  })

  it('a student with no active course returns an empty course, not an error', async () => {
    const r = await learning(ctx.teacherA, s2.id)
    assert.equal(r.course, null)
    assert.equal(r.lessons_completed, 0)
    assert.deepEqual(r.certificates, [])
  })

  it('another teacher, staff and strangers get nothing', async () => {
    assert.equal(await learning(ctx.teacherB, s1.id), null, 'not on B\'s roster')
    assert.equal(await learning(ctx.founder, s1.id), null, 'not a teacher')
    assert.equal(await learning(ctx.assistant, s1.id), null, 'not a teacher')
    await rejects(learning('anon', s1.id), /permission denied/)
  })

  it('a class seat is enough to see the student', async () => {
    const k = await makeClass(ctx.db, { title: 'B group', teacher: ctx.teacherB })
    await enrollClass(ctx.db, k, s1.id)
    const r = await learning(ctx.teacherB, s1.id)
    assert.equal(r.course.progress_pct, 25)
  })
})

// ════════════════════════════════════════════════════════════
describe('teacher transparency: student payments and the leaderboard (053)', () => {
  let ctx, s1, s2, classB
  const TODAY = new Date().toISOString().slice(0, 10)
  const YESTERDAY = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
  const call = (who, fn, args = []) => as(ctx.db, who, () => rpc(ctx.db, fn, args))

  before(async () => {
    ctx = await setup()
    s1 = await makeStudent(ctx.db, 'Payer A')
    s2 = await makeStudent(ctx.db, 'Seat B')
    await ctx.db.query(`insert into teacher_students (teacher_id, student_id) values ($1, $2)`, [ctx.teacherA, s1.id])
    classB = await makeClass(ctx.db, { title: 'B group', teacher: ctx.teacherB })
    await enrollClass(ctx.db, classB, s2.id)
    await pay(ctx.db, s1.id, 500, TODAY)
    await ctx.db.query(`insert into crm_payments (student_id, payment_type, amount_mad, payment_status, due_date, description)
                        values ($1, 'course_one_time', 300, 'pending', $2, 'Part 2')`, [s1.id, YESTERDAY])
    await ctx.db.query(`insert into crm_payments (student_id, payment_type, amount_mad, payment_status, payment_date, excluded_from_revenue)
                        values ($1, 'course_one_time', 100, 'paid', $2, true)`, [s1.id, TODAY])
    // B: one delivered session this month and a top-rated rating
    await makeSession(ctx.db, { teacher: ctx.teacherB, classId: classB, startsAt: new Date().toISOString(), status: 'done' })
    await ctx.db.query(`select set_config('app.rating_refresh', 'on', false)`)
    await ctx.db.query(`update teacher_profiles set rating_avg = 4.8, rating_count = 6 where id = $1`, [ctx.teacherB])
    await ctx.db.query(`select set_config('app.rating_refresh', '', false)`)
    await ctx.db.query(`insert into student_presence (student_id, last_seen_at) values ($1, now())`, [s1.id])
  })

  it('a teacher sees what their own student paid, owes and when', async () => {
    const r = await call(ctx.teacherA, 'teacher_student_payments', [s1.id])
    assert.equal(Number(r.total_paid), 500, 'excluded payments do not count')
    assert.equal(Number(r.outstanding), 300)
    assert.equal(Number(r.overdue), 300)
    assert.equal(r.status, 'overdue')
    assert.equal(r.history.length, 2)
    assert.ok(r.history.some(h => h.status === 'overdue' && h.label === 'Part 2'))
    const raw = JSON.stringify(r)
    for (const k of ['receipt', 'method', 'phone']) assert.ok(!raw.includes(k), k)
  })

  it('no one else sees that student\'s payments', async () => {
    assert.equal(await call(ctx.teacherB, 'teacher_student_payments', [s1.id]), null)
    assert.equal(await call(ctx.founder, 'teacher_student_payments', [s1.id]), null, 'staff use the CRM, not this')
    await rejects(call('anon', 'teacher_student_payments', [s1.id]), /permission denied/)
  })

  it('roster payments: one line per student, mine only', async () => {
    const a = await call(ctx.teacherA, 'teacher_roster_payments')
    assert.deepEqual(a.map(x => x.student_id), [s1.id])
    assert.equal(Number(a[0].total_paid), 500)
    assert.equal(a[0].overdue, true)
    const b = await call(ctx.teacherB, 'teacher_roster_payments')
    assert.deepEqual(b.map(x => x.student_id), [s2.id])
  })

  it('the leaderboard ranks every active teacher by the published score', async () => {
    const lb = await call(ctx.teacherA, 'teacher_leaderboard', [null, null])
    const a = lb.rows.find(r => r.id === ctx.teacherA)
    const b = lb.rows.find(r => r.id === ctx.teacherB)
    assert.equal(b.score, 10 + 5 + 96, 'B: 1 session, 1 student, 4.8 × 20')
    assert.equal(a.score, 5, 'A: 1 student, no sessions, too few reviews to count')
    assert.equal(b.rank, 1); assert.equal(a.rank, 2)
    assert.equal(b.is_top_rated, true); assert.equal(a.is_top_rated, false)
    assert.equal(a.is_me, true); assert.equal(b.is_me, false)
    assert.equal(a.live, 1, 'student seen in the last 15 minutes')
    assert.equal(a.students, 1); assert.equal(b.students, 1); assert.equal(b.sessions, 1)
  })

  it('the leaderboard never shows another teacher\'s money; my own roster revenue is mine', async () => {
    const lb = await call(ctx.teacherA, 'teacher_leaderboard', [null, null])
    const rows = JSON.stringify(lb.rows)
    for (const k of ['revenue', 'paid', 'amount']) assert.ok(!rows.includes(k), k)
    assert.equal(Number(lb.me.roster_revenue), 500)
    assert.equal(lb.me.roster_paying_students, 1)
    const asB = await call(ctx.teacherB, 'teacher_leaderboard', [null, null])
    assert.equal(Number(asB.me.roster_revenue), 0, 'B does not see A\'s student payments')
  })

  it('staff can read the board without a personal block; anon cannot', async () => {
    const lb = await call(ctx.founder, 'teacher_leaderboard', [null, null])
    assert.equal(lb.rows.length >= 2, true)
    assert.equal(lb.me, null)
    await rejects(call('anon', 'teacher_leaderboard', [null, null]), /permission denied/)
  })
})

// ════════════════════════════════════════════════════════════
describe('student dashboard: tracks, sessions, attendance, payments, watch time (054)', () => {
  let ctx, course, groupA, privB, otherK, courseOnly, classOnly, both, stranger
  const dash = token => as(ctx.db, 'anon', () => rpc(ctx.db, 'student_dashboard', [token]))
  const watch = (token, lesson, secs) => as(ctx.db, 'anon', () => rpc(ctx.db, 'student_log_watch', [token, lesson, secs]))
  const asst = fn => as(ctx.db, ctx.assistant, fn)
  const TODAY = new Date().toISOString().slice(0, 10)
  const YESTERDAY = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
  const inDays = d => new Date(Date.now() + d * 864e5).toISOString()

  before(async () => {
    ctx = await setup()
    course = await makeCourse(ctx.db, 'English A1', { units: [{ title: 'Unit 1', lessons: [{ title: 'L1', type: 'video' }, { title: 'L2' }] }] })
    groupA = await makeClass(ctx.db, { title: 'Group A', teacher: ctx.teacherA })
    privB  = await makeClass(ctx.db, { title: 'Private B', mode: 'private', teacher: ctx.teacherB })
    otherK = await makeClass(ctx.db, { title: 'Not mine', teacher: ctx.teacherB })
    await ctx.db.query(`update online_classes set meeting_url = 'https://meet.example/' || title where id in ($1, $2, $3)`, [groupA, privB, otherK])

    courseOnly = await makeStudent(ctx.db, 'Course only')
    classOnly  = await makeStudent(ctx.db, 'Class only')
    both       = await makeStudent(ctx.db, 'Both tracks')
    stranger   = await makeStudent(ctx.db, 'Stranger')

    await enrollCourse(ctx.db, course.id, courseOnly.id)
    await enrollCourse(ctx.db, course.id, both.id)
    await ctx.db.query(`insert into lms_lesson_progress (student_id, lesson_id, status, completed_at) values ($1, $2, 'completed', now())`,
      [courseOnly.id, course.modules[0].lessons[0]])

    await enrollClass(ctx.db, groupA, classOnly.id)
    const e = await enrollClass(ctx.db, privB, classOnly.id)
    await asst(() => rpc(ctx.db, 'staff_set_class_enrollment', [e.id, 'completed', null, null, null]))
    await enrollClass(ctx.db, groupA, both.id)
    await enrollClass(ctx.db, otherK, stranger.id)
    await ctx.db.query(`insert into teacher_students (teacher_id, student_id) values ($1, $2)`, [ctx.teacherA, both.id])

    // sessions: two past (marked) and one upcoming in Group A; one upcoming in a class classOnly is not in
    const past1 = await makeSession(ctx.db, { teacher: ctx.teacherA, classId: groupA, startsAt: inDays(-3), status: 'done' })
    const past2 = await makeSession(ctx.db, { teacher: ctx.teacherA, classId: groupA, startsAt: inDays(-1), status: 'done' })
    const next  = await makeSession(ctx.db, { teacher: ctx.teacherA, classId: groupA, startsAt: inDays(2), status: 'scheduled' })
    await makeSession(ctx.db, { teacher: ctx.teacherB, classId: otherK, startsAt: inDays(2), status: 'scheduled' })
    await ctx.db.query(`update class_sessions set meeting_url = 'https://meet.example/session' where id = $1`, [next])
    await ctx.db.query(`insert into class_attendance (session_id, student_id, status) values ($1, $3, 'present'), ($2, $3, 'absent')`,
      [past1, past2, classOnly.id])

    // payments for the class student
    await pay(ctx.db, classOnly.id, 800, TODAY)
    await ctx.db.query(`insert into crm_payments (student_id, payment_type, amount_mad, payment_status, due_date, installment_no, installment_count)
                        values ($1, 'course_one_time', 400, 'pending', $2, 2, 2)`, [classOnly.id, YESTERDAY])
    await ctx.db.query(`insert into crm_payments (student_id, payment_type, amount_mad, payment_status, payment_date, excluded_from_revenue)
                        values ($1, 'course_one_time', 999, 'paid', $2, true)`, [classOnly.id, TODAY])
  })

  it('a wrong or inactive token finds nothing', async () => {
    assert.deepEqual(await dash('ING-NOPE'), { found: false })
    await ctx.db.query(`update crm_students set is_active = false where id = $1`, [stranger.id])
    assert.equal((await dash(stranger.token)).found, false)
  })

  it('a course-only student has a course track and no class track', async () => {
    const d = await dash(courseOnly.token)
    assert.equal(d.found, true)
    assert.equal(d.courses.length, 1)
    assert.equal(d.courses[0].lessons_total, 2)
    assert.equal(d.courses[0].lessons_done, 1)
    assert.deepEqual(d.classes, [])
    assert.deepEqual(d.sessions, [])
    assert.equal(d.study.videos_completed, 1)
  })

  it('a class-only student sees their seats, only their sessions, and the link only while seated', async () => {
    const d = await dash(classOnly.token)
    assert.deepEqual(d.courses, [])
    const byTitle = Object.fromEntries(d.classes.map(c => [c.title, c]))
    assert.equal(byTitle['Group A'].status, 'active')
    assert.equal(byTitle['Group A'].meeting_url, 'https://meet.example/Group A')
    assert.equal(byTitle['Private B'].status, 'completed')
    assert.equal(byTitle['Private B'].mode, 'private')
    assert.equal(byTitle['Private B'].meeting_url, null, 'no link once the seat has ended')
    assert.ok(!d.classes.some(c => c.title === 'Not mine'))
    assert.equal(d.sessions.length, 3, 'Group A only — two past, one upcoming')
    assert.ok(d.sessions.every(s => s.class_title === 'Group A'))
    const upcoming = d.sessions.find(s => s.status === 'scheduled')
    assert.equal(upcoming.meeting_url, 'https://meet.example/session')
    assert.equal(byTitle['Group A'].attended, 1)
  })

  it('attendance counts present + late over marked sessions', async () => {
    const d = await dash(classOnly.token)
    assert.equal(d.attendance.marks, 2)
    assert.equal(d.attendance.present, 1)
    assert.equal(d.attendance.absent, 1)
    assert.equal(d.attendance.rate, 50)
    assert.equal(d.attendance.recent.length, 2)
  })

  it('teachers: one row per teacher, tagged assigned and/or by class', async () => {
    const d = await dash(both.token)
    assert.equal(d.teachers.length, 1)
    assert.equal(d.teachers[0].assigned, true)
    assert.deepEqual(d.teachers[0].classes, ['Group A'])
    const c = await dash(classOnly.token)
    const b = c.teachers.find(t => t.id === ctx.teacherB)
    assert.equal(b.assigned, false)
    assert.deepEqual(b.classes, ['Private B'], 'a completed seat still names its teacher')
  })

  it('payments: paid and outstanding, excluded payments ignored, overdue status, no receipts', async () => {
    const d = await dash(classOnly.token)
    assert.equal(Number(d.payments.total_paid), 800)
    assert.equal(Number(d.payments.outstanding), 400)
    assert.equal(d.payments.status, 'overdue')
    assert.equal(d.payments.history.length, 2)
    assert.ok(d.payments.history.some(h => h.installment === '2/2' && h.status === 'overdue'))
    assert.ok(!JSON.stringify(d.payments).includes('receipt'))
  })

  it('watch time: short or unknown is refused, long is capped, and it shows up as minutes', async () => {
    const lesson = course.modules[0].lessons[0]
    assert.equal(await watch(courseOnly.token, lesson, 3), false)
    assert.equal(await watch('ING-NOPE', lesson, 600), false)
    assert.equal(await watch(courseOnly.token, lesson, 600), true)
    assert.equal(await watch(courseOnly.token, lesson, 99999), true)
    const d = await dash(courseOnly.token)
    assert.equal(d.study.watch_minutes, 10 + 240, '600s + capped 4h')
    assert.equal(d.study.weekly.length, 8)
  })
})

describe('security hardening (055)', () => {
  let ctx, leadA, leadB, stu
  const newLead = async name => (await one(ctx.db,
    `insert into subscription_leads (plan_id, full_name, status, is_archived, amount_mad) values ('monthly', $1, 'paid', false, 300) returning id`, [name])).id
  const convert = (who, lead, actor = null) =>
    as(ctx.db, who, () => one(ctx.db, `select public.convert_lead_to_student($1, $2) as r`, [lead, actor]))
  const logEvent = (who, lead) =>
    as(ctx.db, who, () => one(ctx.db, `select public.log_lead_event($1, 'note_added', 'Note') as r`, [lead]))

  before(async () => {
    ctx = await setup()
    leadA = await newLead('Lead A')
    leadB = await newLead('Lead B')
    stu = await makeStudent(ctx.db, 'Coin Student')
    await ctx.db.query(`insert into coin_transactions (student_id, action_type, coins_amount) values ($1, 'challenge_done', 40)`, [stu.id])
  })

  it('a logged-out caller cannot convert a lead or write to its timeline', async () => {
    await rejects(convert('anon', leadA), /permission denied/)
    await rejects(logEvent('anon', leadA), /permission denied/)
    const n = await one(ctx.db, `select count(*)::int as n from crm_students where lead_id = $1`, [leadA])
    assert.equal(n.n, 0)
  })

  it('a logged-in non-staff account is refused by the function itself', async () => {
    await rejects(convert(ctx.teacherA, leadA), /Only staff/)
    await rejects(logEvent(ctx.teacherA, leadA), /Only staff/)
  })

  it('staff convert, and the recorded actor is always the caller', async () => {
    const r = await convert(ctx.assistant, leadA, ctx.founder)
    const s = await one(ctx.db, `select added_by_id, payment_status from crm_students where id = $1`, [r.r])
    assert.equal(s.added_by_id, ctx.assistant, 'a passed actor id is not trusted')
    assert.equal(s.payment_status, 'paid')
    const again = await convert(ctx.assistant, leadA)
    assert.equal(again.r, r.r, 'converting twice returns the same student')
    const ev = await one(ctx.db, `select actor_id from crm_lead_events where lead_id = $1 and event_type = 'converted_to_student'`, [leadA])
    assert.equal(ev.actor_id, ctx.assistant)
  })

  it('staff write timeline events under their own name', async () => {
    const r = await logEvent(ctx.founder, leadB)
    const ev = await one(ctx.db, `select actor_id, title from crm_lead_events where id = $1`, [r.r])
    assert.equal(ev.actor_id, ctx.founder)
    assert.equal(ev.title, 'Note')
  })

  it('the weekly leaderboard view runs with the caller rights: staff see it, other accounts do not', async () => {
    const teacher = await as(ctx.db, ctx.teacherA, () => q(ctx.db, `select * from leaderboard_weekly`))
    assert.equal(teacher.length, 0)
    const staff = await as(ctx.db, ctx.assistant, () => q(ctx.db, `select * from leaderboard_weekly`))
    assert.equal(staff.length, 1)
    assert.equal(Number(staff[0].week_points), 40)
  })

  it('students still get their leaderboard through the token RPC', async () => {
    const r = await as(ctx.db, 'anon', () => rpc(ctx.db, 'student_leaderboard_weekly', [stu.token, null]))
    assert.equal(r.top.length, 1)
    assert.equal(r.me.rank, 1)
  })

  it('owner and staff functions are closed to anon, open to logged-in callers that they then check', async () => {
    const rows = await q(ctx.db, `
      select p.proname, has_function_privilege('anon', p.oid, 'execute') as anon,
             has_function_privilege('authenticated', p.oid, 'execute') as auth
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname in ('owner_overview', 'convert_lead_to_student', 'log_lead_event', 'handle_new_user', 'is_crm_staff')`)
    const by = Object.fromEntries(rows.map(r => [r.proname, r]))
    for (const f of ['owner_overview', 'convert_lead_to_student', 'log_lead_event']) {
      assert.equal(by[f].anon, false, `${f} anon`)
      assert.equal(by[f].auth, true, `${f} authenticated`)
    }
    assert.equal(by.handle_new_user.anon, false)
    assert.equal(by.is_crm_staff.anon, true, 'RLS helpers stay callable')
    assert.equal(await as(ctx.db, ctx.teacherA, () => rpc(ctx.db, 'owner_overview')), null, 'a teacher gets nothing')
  })

  it('triggers whose functions anon cannot execute still fire', async () => {
    const s = await makeStudent(ctx.db, 'Trigger Student')
    await ctx.db.query(`insert into crm_payments (student_id, amount_mad, payment_status, payment_type) values ($1, 100, 'pending', 'full_course')`, [s.id])
    // auto_create_receipt fires on the move to paid, as an API caller would make it.
    await as(ctx.db, ctx.assistant, () => ctx.db.query(`update crm_payments set payment_status = 'paid' where student_id = $1`, [s.id]))
    const p = await one(ctx.db, `select payment_status from crm_payments where student_id = $1`, [s.id])
    assert.equal(p.payment_status, 'paid')
  })

  it('pins search_path on the flagged functions', async () => {
    const rows = await q(ctx.db, `
      select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname in ('set_updated_at', 'casa_date', 'mask_phone', '_norm', 'log_crm_activity', 'convert_lead_to_student')
        and not coalesce(p.proconfig, '{}') && array['search_path=public', 'search_path="public"']`)
    assert.deepEqual(rows, [])
  })
})
describe('profile privileged fields (056)', () => {
  let ctx, student
  const upd = (who, id, set) =>
    as(ctx.db, who, () => ctx.db.query(`update public.profiles set ${set} where id = $1`, [id]))
  const prof = id => one(ctx.db, `select role::text as role, is_admin, blocked, plan, full_name, phone from profiles where id = $1`, [id])

  before(async () => {
    ctx = await setup()
    student = await makeUser(ctx.db, 'student', 'Signup User')
    // Production founders carry the legacy is_admin flag; profiles_admin_update reads it.
    await ctx.db.query(`update profiles set is_admin = true where id = $1`, [ctx.founder])
  })

  it('a signed-up user cannot make themselves founder or admin', async () => {
    await rejects(upd(student, student, `role = 'founder'`), /Only a founder/)
    await rejects(upd(student, student, `is_admin = true`), /Only a founder/)
    const p = await prof(student)
    assert.equal(p.role, 'student')
    assert.equal(p.is_admin, false)
  })

  it('nor give themselves a plan, lift a block or change their email', async () => {
    await rejects(upd(student, student, `plan = 'paid', plan_expires_at = now() + interval '1 year'`), /Only a founder/)
    await rejects(upd(student, student, `blocked = false, role = 'assistant'`), /Only a founder/)
    await rejects(upd(student, student, `email = 'founder@inglizi.com'`), /Only a founder/)
  })

  it('assistants and teachers cannot promote themselves either', async () => {
    await rejects(upd(ctx.assistant, ctx.assistant, `role = 'founder'`), /Only a founder/)
    await rejects(upd(ctx.teacherA, ctx.teacherA, `is_admin = true`), /Only a founder/)
  })

  it('users still edit their own name and phone', async () => {
    await upd(student, student, `full_name = 'New Name', phone = '+212600000000'`)
    const p = await prof(student)
    assert.equal(p.full_name, 'New Name')
    assert.equal(p.phone, '+212600000000')
  })

  it('a founder can change roles, and server-side writes are unaffected', async () => {
    const u = await makeUser(ctx.db, 'student', 'Future Assistant')
    await upd(ctx.founder, u, `role = 'assistant'`)
    assert.equal((await prof(u)).role, 'assistant')
    await ctx.db.query(`update profiles set plan = 'paid' where id = $1`, [u])   // no JWT: service / migration
    assert.equal((await prof(u)).plan, 'paid')
  })
})
describe('founder control: blocking, audit trail, payroll (057)', () => {
  let ctx, stu, month
  const asF = fn => as(ctx.db, ctx.founder, fn)
  const asA = fn => as(ctx.db, ctx.assistant, fn)
  const logRows = (where = 'true', params = []) =>
    q(ctx.db, `select actor_id, action, entity_type, entity_id, before_value, after_value from crm_activity_log where ${where} order by created_at`, params)

  before(async () => {
    ctx = await setup()
    stu = await makeStudent(ctx.db, 'Audit Student')
    month = new Date().toISOString().slice(0, 7) + '-01'
    // Pay fields only move for staff callers (guard_teacher_profile_fields), as in the CRM.
    await asF(() => ctx.db.query(`update teacher_profiles set pay_model = 'hourly', hourly_rate_mad = 100 where id = $1`, [ctx.teacherA]))
    // two delivered hours this month (90 + 30 minutes), one cancelled session that must not count
    const noon = new Date(); noon.setUTCDate(Math.min(noon.getUTCDate(), 27)); noon.setUTCHours(12, 0, 0, 0)
    for (const [mins, status] of [[90, 'done'], [30, 'done'], [60, 'cancelled']]) {
      await ctx.db.query(`insert into class_sessions (teacher_id, title, mode, starts_at, duration_min, status) values ($1, 'S', 'group', $2, $3, $4)`,
        [ctx.teacherA, noon.toISOString(), mins, status])
    }
  })

  it('records an assistant edit with only the changed fields, and nothing for public writes', async () => {
    await asA(() => ctx.db.query(`update crm_students set notes = 'called twice', phone_number = phone_number where id = $1`, [stu.id]))
    const rows = await logRows(`entity_id = $1`, [stu.id])
    assert.equal(rows.length, 1)
    assert.equal(rows[0].actor_id, ctx.assistant)
    assert.equal(rows[0].action, 'student_updated')
    assert.deepEqual(Object.keys(rows[0].after_value), ['notes'])
    assert.equal(rows[0].after_value.notes, 'called twice')

    await asA(() => ctx.db.query(`update crm_students set payment_status = 'overdue' where id = $1`, [stu.id]))
    const st = await logRows(`entity_id = $1 and action = 'student_status_changed'`, [stu.id])
    assert.equal(st.length, 1)
    assert.equal(st[0].after_value.payment_status, 'overdue')

    const before = (await logRows()).length
    await as(ctx.db, 'anon', () => ctx.db.query(
      `insert into subscription_leads (plan_id, full_name, status, is_archived) values ('monthly', 'Visitor', 'new', false)`)).catch(() => {})
    await ctx.db.query(`update crm_students set notes = 'server job' where id = $1`, [stu.id])
    assert.equal((await logRows()).length, before, 'no staff JWT, no staff move')
  })

  it('never copies a student access token into the log', async () => {
    await asA(() => ctx.db.query(`update crm_students set verification_token = 'ING-NEW001' where id = $1`, [stu.id]))
    const rows = await logRows(`entity_id = $1 and after_value ? 'verification_token'`, [stu.id])
    assert.equal(rows.length, 1)
    assert.equal(rows[0].after_value.verification_token, '••••')
  })

  it('the log is private and append-only: assistants read their own rows, nobody writes directly', async () => {
    await asF(() => ctx.db.query(`update crm_students set notes = 'founder note' where id = $1`, [stu.id]))
    const mine = await asA(() => q(ctx.db, `select distinct actor_id from crm_activity_log`))
    assert.deepEqual(mine.map(r => r.actor_id), [ctx.assistant])
    const all = await asF(() => q(ctx.db, `select distinct actor_id from crm_activity_log`))
    assert.ok(all.some(r => r.actor_id === ctx.founder) && all.some(r => r.actor_id === ctx.assistant))
    await rejects(asA(() => ctx.db.query(`insert into crm_activity_log (actor_id, action, entity_type) values ($1, 'x', 'y')`, [ctx.founder])), /permission denied/)
    await rejects(asA(() => ctx.db.query(`delete from crm_activity_log`)), /permission denied/)
  })

  it('a session is logged once, then only last-seen moves', async () => {
    await asA(() => rpc(ctx.db, 'staff_ping', ['/sales/dashboard']))
    await asA(() => rpc(ctx.db, 'staff_ping', ['/sales/workspace']))
    const s = await logRows(`actor_id = $1 and action = 'session_started'`, [ctx.assistant])
    assert.equal(s.length, 1)
    const p = await one(ctx.db, `select last_path from staff_presence where profile_id = $1`, [ctx.assistant])
    assert.equal(p.last_path, '/sales/workspace')
  })

  it('founder_team shows each person with what they did; others are refused', async () => {
    const t = await asF(() => rpc(ctx.db, 'founder_team', [null, null]))
    const a = t.people.find(p => p.id === ctx.assistant)
    assert.equal(a.role, 'assistant')
    assert.ok(a.actions >= 3)
    assert.equal(a.sessions_opened, 1)
    const teacher = t.people.find(p => p.id === ctx.teacherA)
    assert.equal(teacher.sessions_done, 2)
    assert.equal(Number(teacher.hours_done), 2)
    await rejects(asA(() => rpc(ctx.db, 'founder_team', [null, null])), /Founder only/)
    await rejects(as(ctx.db, 'anon', () => rpc(ctx.db, 'founder_team', [null, null])), /permission denied/)
  })

  it('founder_activity names the record and filters by person', async () => {
    const rows = await asF(() => rpc(ctx.db, 'founder_activity', [ctx.assistant, null, null, 'student', 50]))
    assert.ok(rows.length >= 2)
    assert.ok(rows.every(r => r.actor_id === ctx.assistant && r.entity_type === 'student'))
    assert.equal(rows[0].entity_label, 'Audit Student')
  })

  it('payroll suggests teacher pay from delivered hours × rate and assistant pay from salary', async () => {
    await asF(() => rpc(ctx.db, 'founder_set_pay_settings', [ctx.assistant, 3000, null]))
    const p = await asF(() => rpc(ctx.db, 'founder_payroll', [month]))
    const t = p.rows.find(r => r.id === ctx.teacherA)
    assert.equal(Number(t.hours), 2)
    assert.equal(t.sessions, 2)
    assert.equal(Number(t.suggested_base), 200)
    const a = p.rows.find(r => r.id === ctx.assistant)
    assert.equal(Number(a.suggested_base), 3000)
    assert.ok(!p.rows.some(r => r.id === ctx.founder), 'founders are not on the payroll')
  })

  it('saves a payout, marks it paid once, and is logged', async () => {
    const r1 = await asF(() => rpc(ctx.db, 'founder_save_payout', [ctx.teacherA, month, 200, 50, 20, 'pending', null, null, 'first']))
    assert.equal(Number(r1.amount_mad), 230)
    assert.equal(r1.paid_at, null)
    const r2 = await asF(() => rpc(ctx.db, 'founder_save_payout', [ctx.teacherA, month, 200, 50, 20, 'paid', 'bank_transfer', 'TX-1', 'first']))
    assert.equal(r2.id, r1.id, 'one payout per person per month')
    assert.ok(r2.paid_at)
    const r3 = await asF(() => rpc(ctx.db, 'founder_save_payout', [ctx.teacherA, month, 200, 60, 20, 'paid', 'bank_transfer', 'TX-1', 'bonus fixed']))
    assert.equal(new Date(r3.paid_at).getTime(), new Date(r2.paid_at).getTime(), 'paid_at keeps the first payment time')
    await rejects(asF(() => rpc(ctx.db, 'founder_save_payout', [ctx.teacherA, month, 10, 0, 50, 'pending', null, null, null])), /larger than the pay/)
    await rejects(asF(() => rpc(ctx.db, 'founder_save_payout', [ctx.founder, month, 10, 0, 0, 'pending', null, null, null])), /assistants and teachers/)
    await rejects(asA(() => rpc(ctx.db, 'founder_save_payout', [ctx.assistant, month, 9999, 0, 0, 'paid', null, null, null])), /Founder only/)
    const log = await logRows(`entity_type = 'payout'`)
    assert.ok(log.some(l => l.action === 'payout_created'))
    assert.ok(log.some(l => l.action === 'payout_status_changed' && l.after_value.status === 'paid'))
    const totals = (await asF(() => rpc(ctx.db, 'founder_payroll', [month]))).totals
    assert.equal(Number(totals.paid), 240)
  })

  it('payees see only their own payouts, and cannot write them', async () => {
    const mine = await as(ctx.db, ctx.teacherA, () => rpc(ctx.db, 'my_payouts'))
    assert.equal(mine.payouts.length, 1)
    assert.equal(Number(mine.payouts[0].amount_mad), 240)
    const other = await as(ctx.db, ctx.teacherB, () => rpc(ctx.db, 'my_payouts'))
    assert.equal(other.payouts.length, 0)
    const direct = await as(ctx.db, ctx.teacherB, () => q(ctx.db, `select * from staff_payouts`))
    assert.equal(direct.length, 0)
    await rejects(as(ctx.db, ctx.teacherA, () => ctx.db.query(`update staff_payouts set bonus_mad = 9999`)), /permission denied/)
    const asst = await asA(() => rpc(ctx.db, 'my_payouts'))
    assert.equal(Number(asst.salary), 3000)
  })

  it('blocking an assistant shuts their CRM access at the database; founders cannot be blocked', async () => {
    const seen = await asA(() => q(ctx.db, `select id from crm_students where id = $1`, [stu.id]))
    assert.equal(seen.length, 1)
    await asF(() => rpc(ctx.db, 'founder_set_staff_blocked', [ctx.assistant, true]))
    const after = await asA(() => q(ctx.db, `select id from crm_students where id = $1`, [stu.id]))
    assert.equal(after.length, 0, 'a blocked assistant sees no CRM rows')
    await rejects(asA(() => one(ctx.db, `select public.convert_lead_to_student(gen_random_uuid()) as r`)), /Only staff/)
    const log = await logRows(`entity_id = $1 and action = 'profile_blocked'`, [ctx.assistant])
    assert.equal(log.length, 1)
    await asF(() => rpc(ctx.db, 'founder_set_staff_blocked', [ctx.assistant, false]))
    assert.equal((await asA(() => q(ctx.db, `select id from crm_students where id = $1`, [stu.id]))).length, 1)
    await rejects(asF(() => rpc(ctx.db, 'founder_set_staff_blocked', [ctx.founder, true])), /yourself/)
    const f2 = await makeUser(ctx.db, 'founder', 'Co-founder')
    await rejects(asF(() => rpc(ctx.db, 'founder_set_staff_blocked', [f2, true])), /founder cannot be blocked/)
  })

  it('blocking a teacher takes them out of the teacher space and the public directory', async () => {
    await asF(() => rpc(ctx.db, 'founder_set_staff_blocked', [ctx.teacherB, true]))
    const r = await one(ctx.db, `select public.is_teacher($1) as t, (select is_active from teacher_profiles where id = $1) as a`, [ctx.teacherB])
    assert.equal(r.t, false)
    assert.equal(r.a, false)
    await asF(() => rpc(ctx.db, 'founder_set_staff_blocked', [ctx.teacherB, false]))
    assert.equal((await one(ctx.db, `select public.is_teacher($1) as t`, [ctx.teacherB])).t, true)
  })
})
describe('assistants: teachers and live classes (058)', () => {
  let ctx, cls, stu, session
  const asF = fn => as(ctx.db, ctx.founder, fn)
  const asA = fn => as(ctx.db, ctx.assistant, fn)
  const rate = async () => Number((await one(ctx.db, `select hourly_rate_mad as r from teacher_profiles where id = $1`, [ctx.teacherA])).r)

  before(async () => {
    ctx = await setup()
    cls = await makeClass(ctx.db, { title: 'Evening group', teacher: ctx.teacherA })
    stu = await makeStudent(ctx.db, 'Seated Student')
    await enrollClass(ctx.db, cls, stu.id)
    session = await makeSession(ctx.db, { teacher: ctx.teacherA, classId: cls, startsAt: new Date().toISOString(), status: 'done' })
    await asF(() => ctx.db.query(`update teacher_profiles set pay_model = 'hourly', hourly_rate_mad = 100 where id = $1`, [ctx.teacherA]))
  })

  it('an assistant cannot change a teacher\'s pay; the founder can', async () => {
    await rejects(asA(() => ctx.db.query(`update teacher_profiles set hourly_rate_mad = 500 where id = $1`, [ctx.teacherA])), /Only a founder/)
    await rejects(asA(() => ctx.db.query(`update teacher_profiles set pay_model = 'monthly' where id = $1`, [ctx.teacherA])), /Only a founder/)
    assert.equal(await rate(), 100)
    await asF(() => ctx.db.query(`update teacher_profiles set hourly_rate_mad = 120 where id = $1`, [ctx.teacherA]))
    assert.equal(await rate(), 120)
  })

  it('an assistant still edits everything else and can read pay', async () => {
    await asA(() => ctx.db.query(`update teacher_profiles set is_active = false, headline = 'IELTS' where id = $1`, [ctx.teacherA]))
    const r = await one(ctx.db, `select is_active, headline from teacher_profiles where id = $1`, [ctx.teacherA])
    assert.equal(r.is_active, false)
    assert.equal(r.headline, 'IELTS')
    const seen = await asA(() => one(ctx.db, `select hourly_rate_mad from teacher_profiles where id = $1`, [ctx.teacherA]))
    assert.equal(Number(seen.hourly_rate_mad), 120)
    await asA(() => ctx.db.query(`update teacher_profiles set is_active = true where id = $1`, [ctx.teacherA]))
  })

  it('the teacher still cannot touch their own pay', async () => {
    await as(ctx.db, ctx.teacherA, () => ctx.db.query(`update teacher_profiles set hourly_rate_mad = 999 where id = $1`, [ctx.teacherA]))
    assert.equal(await rate(), 120)
  })

  it('an assistant marks attendance for a class session', async () => {
    await asA(() => ctx.db.query(
      `insert into class_attendance (session_id, student_id, status, marked_by) values ($1, $2, 'late', $3)
       on conflict (session_id, student_id) do update set status = excluded.status, marked_by = excluded.marked_by`,
      [session, stu.id, ctx.assistant]))
    const a = await one(ctx.db, `select status, marked_by from class_attendance where session_id = $1 and student_id = $2`, [session, stu.id])
    assert.equal(a.status, 'late')
    const seen = await asA(() => q(ctx.db, `select status from class_attendance where session_id = $1`, [session]))
    assert.equal(seen.length, 1)
  })

  it('a blocked assistant can do neither', async () => {
    await asF(() => rpc(ctx.db, 'founder_set_staff_blocked', [ctx.assistant, true]))
    const seen = await asA(() => q(ctx.db, `select id from class_attendance where session_id = $1`, [session]))
    assert.equal(seen.length, 0)
    await rejects(asA(() => ctx.db.query(`insert into class_attendance (session_id, student_id, status) values ($1, $2, 'present')`, [session, stu.id])), /row-level security|violates/)
    await asF(() => rpc(ctx.db, 'founder_set_staff_blocked', [ctx.assistant, false]))
  })
})
describe('teachers add their own students (059)', () => {
  let ctx, clsA, clsB, academyStudent
  const asT = (who, fn) => as(ctx.db, who, fn)
  const asA = fn => as(ctx.db, ctx.assistant, fn)
  const add = (who, name, phone, extra = {}) => asT(who, () => rpc(ctx.db, 'teacher_add_student',
    [name, phone, extra.level ?? 'A1', extra.kind ?? 'group', extra.classId ?? null, extra.note ?? null, null]))
  const student = id => one(ctx.db, `select full_name, origin_teacher_id, review_status, verification_token, is_active, source from crm_students where id = $1`, [id])
  const today = new Date().toISOString().slice(0, 10)

  before(async () => {
    ctx = await setup()
    // Since 061 adding students is a per-teacher permission.
    await as(ctx.db, ctx.founder, () => ctx.db.query(`update teacher_profiles set can_add_students = true where id in ($1, $2)`, [ctx.teacherA, ctx.teacherB]))
    clsA = await makeClass(ctx.db, { title: 'A group', teacher: ctx.teacherA })
    clsB = await makeClass(ctx.db, { title: 'B group', teacher: ctx.teacherB })
    academyStudent = await makeStudent(ctx.db, 'Academy Student', { phone: '+212600000001' })
  })

  it('a teacher adds a student: pending, no access code, linked and seated in their class', async () => {
    const r = await add(ctx.teacherA, 'Hiba', '0611223344', { classId: clsA })
    assert.equal(r.result, 'created')
    assert.equal(r.seat, 'seated')
    const s = await student(r.student_id)
    assert.equal(s.origin_teacher_id, ctx.teacherA)
    assert.equal(s.review_status, 'pending')
    assert.equal(s.verification_token, null, 'no code → no student-space access')
    assert.equal(s.source, 'teacher')
    const link = await one(ctx.db, `select is_active from teacher_students where teacher_id = $1 and student_id = $2`, [ctx.teacherA, r.student_id])
    assert.equal(link.is_active, true)
    const login = await as(ctx.db, 'anon', () => rpc(ctx.db, 'student_space', ['ING-NOPE0000']))
    assert.ok(!login || login.found === false)
  })

  it('the same phone in another format links the existing student instead of duplicating', async () => {
    const r = await add(ctx.teacherB, 'Hiba again', '+212 611-22-33-44')
    assert.equal(r.result, 'linked')
    const n = await one(ctx.db, `select count(*)::int as n from crm_students where public.phone_key(phone_number) = '611223344'`)
    assert.equal(n.n, 1)
    const s = await student(r.student_id)
    assert.equal(s.origin_teacher_id, ctx.teacherA, 'the side does not move to the second teacher')
    const r2 = await add(ctx.teacherB, 'Known', '0600000001')
    assert.equal(r2.result, 'linked')
    assert.equal((await student(r2.student_id)).origin_teacher_id, null, 'an academy student stays the academy\'s')
  })

  it('a teacher cannot seat a student in another teacher\'s class', async () => {
    const r = await add(ctx.teacherA, 'Yassine', '0622334455', { classId: clsB })
    assert.equal(r.seat, 'not_your_class')
    const seats = await one(ctx.db, `select count(*)::int as n from online_class_enrollments where class_id = $1 and student_id = $2`, [clsB, r.student_id])
    assert.equal(seats.n, 0)
  })

  it('a declared payment is pending and not revenue until staff confirm it', async () => {
    const r = await add(ctx.teacherA, 'Salma', '0633445566')
    const d = await asT(ctx.teacherA, () => rpc(ctx.db, 'teacher_declare_payment', [r.student_id, 900, 'bank_transfer', today, 'monthly', 'TX-1', null, null]))
    assert.equal(d.payment_status, 'pending')
    let sides = (await asA(() => rpc(ctx.db, 'staff_sides_breakdown', [null, null]))).sides
    let a = sides.find(x => x.teacher_id === ctx.teacherA)
    assert.equal(Number(a.revenue_total), 0)
    assert.equal(Number(a.awaiting_confirmation), 900)
    await asA(() => ctx.db.query(`update crm_payments set payment_status = 'paid', approved_by_id = $2 where id = $1`, [d.id, ctx.assistant]))
    sides = (await asA(() => rpc(ctx.db, 'staff_sides_breakdown', [null, null]))).sides
    a = sides.find(x => x.teacher_id === ctx.teacherA)
    assert.equal(Number(a.revenue_total), 900)
    assert.equal(Number(a.revenue_period), 900)
  })

  it('a teacher cannot declare for someone else\'s student or attach someone else\'s file', async () => {
    const mine = await add(ctx.teacherA, 'Omar', '0644556677')
    await rejects(asT(ctx.teacherB, () => rpc(ctx.db, 'teacher_declare_payment', [mine.student_id, 100, 'cash', null, 'monthly', null, null, null])), /not one of yours/)
    await rejects(asT(ctx.teacherA, () => rpc(ctx.db, 'teacher_declare_payment', [mine.student_id, 100, 'cash', null, 'monthly', null, null, `${ctx.teacherB}/x.jpg`])), /your uploads/)
    await rejects(asT(ctx.teacherA, () => rpc(ctx.db, 'teacher_declare_payment', [mine.student_id, -5, 'cash', null, 'monthly', null, null, null])), /valid amount/)
  })

  it('staff approve (access code created) or reject (kept, inactive)', async () => {
    const ok = await add(ctx.teacherA, 'Nora', '0655667788')
    const no = await add(ctx.teacherA, 'Fake', '0666778899')
    const intake = await asA(() => rpc(ctx.db, 'staff_teacher_intake'))
    assert.ok(intake.some(i => i.id === ok.student_id && i.teacher_id === ctx.teacherA))
    const r1 = await asA(() => rpc(ctx.db, 'staff_review_teacher_student', [ok.student_id, true, null]))
    assert.match(r1.verification_token, /^ING-[0-9A-F]{8}$/)
    await asA(() => rpc(ctx.db, 'staff_review_teacher_student', [no.student_id, false, 'Duplicate']))
    const s = await student(no.student_id)
    assert.equal(s.review_status, 'rejected')
    assert.equal(s.is_active, false)
    await rejects(asA(() => rpc(ctx.db, 'staff_review_teacher_student', [ok.student_id, true, null])), /already reviewed/)
    const mine = await asT(ctx.teacherA, () => rpc(ctx.db, 'teacher_added_students'))
    assert.equal(mine.find(m => m.id === no.student_id).review_status, 'rejected')
    assert.ok(mine.every(m => m.phone.includes('••••')), 'phones come back masked')
  })

  it('the sides add up to total revenue; others cannot call these functions', async () => {
    // Since 061 a side is the teacher a payment is linked to: the academy
    // student is now taught by teacher B only, so their payment is B's.
    await pay(ctx.db, academyStudent.id, 500, today)
    const loose = await makeStudent(ctx.db, 'No Teacher', { phone: '+212600000077' })
    await pay(ctx.db, loose.id, 70, today)
    const sides = (await asA(() => rpc(ctx.db, 'staff_sides_breakdown', [null, null]))).sides
    assert.equal(Number(sides.find(s => s.teacher_id === ctx.teacherB).revenue_total), 500)
    const none = sides.find(s => s.is_academy)
    assert.equal(Number(none.revenue_total), 70)
    const total = await one(ctx.db, `select coalesce(sum(amount_mad), 0) as t from crm_payments where payment_status = 'paid' and amount_mad > 0 and not coalesce(excluded_from_revenue, false)`)
    assert.equal(sides.reduce((s, x) => s + Number(x.revenue_total), 0), Number(total.t))
    await rejects(asA(() => rpc(ctx.db, 'teacher_add_student', ['X', '0677889900', null, 'group', null, null, null])), /Teachers only/)
    await rejects(asT(ctx.teacherA, () => rpc(ctx.db, 'staff_sides_breakdown', [null, null])), /Staff only/)
    await rejects(as(ctx.db, 'anon', () => rpc(ctx.db, 'teacher_add_student', ['X', '0677889900', null, 'group', null, null, null])), /permission denied/)
  })
})
describe('teacher monthly report (060)', () => {
  let ctx, month, cls, brought, assigned, s1, s2, s3
  const asF = fn => as(ctx.db, ctx.founder, fn)
  const asA = fn => as(ctx.db, ctx.assistant, fn)
  const report = (who, teacher) => as(ctx.db, who, () => rpc(ctx.db, 'teacher_month_report', [teacher, month]))
  const midMonth = () => { const d = new Date(); d.setUTCDate(Math.min(d.getUTCDate(), 25)); d.setUTCHours(12, 0, 0, 0); return d }
  const today = () => new Date().toISOString().slice(0, 10)

  before(async () => {
    ctx = await setup()
    month = new Date().toISOString().slice(0, 7) + '-01'
    await asF(() => ctx.db.query(`update teacher_profiles set pay_model = 'revenue_share', revenue_share_pct = 60, can_add_students = true where id = $1`, [ctx.teacherA]))
    cls = await makeClass(ctx.db, { title: 'Report group', teacher: ctx.teacherA })
    // one student the teacher brought (via 059), one the academy assigned
    brought = (await as(ctx.db, ctx.teacherA, () => rpc(ctx.db, 'teacher_add_student', ['Brought One', '0611000001', 'A1', 'group', cls, null, null]))).student_id
    const a = await makeStudent(ctx.db, 'Academy One', { phone: '+212622000002' })
    assigned = a.id
    await enrollClass(ctx.db, cls, assigned)
    // sessions: two delivered (one with a report), one cancelled
    const t = midMonth()
    s1 = await makeSession(ctx.db, { teacher: ctx.teacherA, classId: cls, startsAt: t.toISOString(), status: 'done' })
    s2 = await makeSession(ctx.db, { teacher: ctx.teacherA, classId: cls, startsAt: new Date(t.getTime() + 3600e3).toISOString(), status: 'done' })
    s3 = await makeSession(ctx.db, { teacher: ctx.teacherA, classId: cls, startsAt: new Date(t.getTime() + 7200e3).toISOString(), status: 'cancelled' })
    await ctx.db.query(`update class_sessions set duration_min = 60 where id in ($1, $2)`, [s1, s2])
    await ctx.db.query(`update class_sessions set cancel_reason = 'Teacher sick' where id = $1`, [s3])
    await ctx.db.query(`insert into lesson_reports (session_id, teacher_id, covered) values ($1, $2, 'Unit 1')`, [s1, ctx.teacherA])
    for (const [sess, st, status] of [[s1, brought, 'present'], [s1, assigned, 'absent'], [s2, brought, 'late'], [s2, assigned, 'present']]) {
      await ctx.db.query(`insert into class_attendance (session_id, student_id, status) values ($1, $2, $3)`, [sess, st, status])
    }
    // money: 1,000 confirmed from the brought student, 400 from the academy student
    await pay(ctx.db, brought, 1000, today())
    await pay(ctx.db, assigned, 400, today())
    await ctx.db.query(`insert into teacher_reviews (teacher_id, student_id, rating, comment) values ($1, $2, 5, 'Great')`, [ctx.teacherA, brought])
  })

  it('counts the month: students, sessions, attendance, reviews', async () => {
    const r = await report(ctx.teacherA, ctx.teacherA)
    assert.equal(r.students.total, 2)
    assert.equal(r.students.new, 2, 'both joined this month (added / seated)')
    assert.equal(r.sessions.done, 2)
    assert.equal(r.sessions.cancelled, 1)
    assert.equal(r.sessions.cancel_reasons[0].reason, 'Teacher sick')
    assert.equal(Number(r.sessions.hours), 2)
    assert.equal(r.sessions.missing_reports, 1)
    assert.equal(r.attendance.marked, 4)
    assert.equal(r.attendance.absent, 1)
    assert.equal(r.reviews.length, 1)
    assert.equal(r.reviews[0].rating, 5)
    assert.ok(!('student_id' in r.reviews[0]), 'reviews come without who wrote them')
    const b = r.students.list.find(s => s.id === brought)
    assert.equal(b.present, 1); assert.equal(b.late, 1); assert.equal(Number(b.paid), 1000)
  })

  it('money: every payment for the teacher\'s lessons counts toward their share (061)', async () => {
    const r = await report(ctx.teacherA, ctx.teacherA)
    assert.equal(Number(r.money.revenue), 1400, 'both students have only this teacher')
    assert.equal(Number(r.money.unlinked), 0)
    assert.equal(r.teacher.pay_model, 'revenue_share')
    assert.equal(Number(r.teacher.revenue_share_pct), 60)
    const p = await asF(() => rpc(ctx.db, 'founder_payroll', [month]))
    const row = p.rows.find(x => x.id === ctx.teacherA)
    assert.equal(Number(row.suggested_base), 840, '60% of 1,400')
    assert.equal(Number(row.revenue_brought), 1400)
  })

  it('an assistant cannot change the share; the founder can', async () => {
    await rejects(asA(() => ctx.db.query(`update teacher_profiles set revenue_share_pct = 90 where id = $1`, [ctx.teacherA])), /Only a founder/)
    await as(ctx.db, ctx.teacherA, () => ctx.db.query(`update teacher_profiles set revenue_share_pct = 95 where id = $1`, [ctx.teacherA]))
    assert.equal(Number((await one(ctx.db, `select revenue_share_pct from teacher_profiles where id = $1`, [ctx.teacherA])).revenue_share_pct), 60)
    await rejects(asF(() => ctx.db.query(`update teacher_profiles set revenue_share_pct = 120 where id = $1`, [ctx.teacherA])), /check/)
  })

  it('a teacher reads only their own report; staff read anyone\'s', async () => {
    await rejects(report(ctx.teacherB, ctx.teacherA), /Not allowed/)
    const r = await report(ctx.assistant, ctx.teacherA)
    assert.equal(r.students.total, 2)
    await rejects(report('anon', ctx.teacherA), /permission denied/)
  })

  it('the academy note: staff write it, the teacher sees it, nobody else writes', async () => {
    await asA(() => rpc(ctx.db, 'staff_set_teacher_month_note', [ctx.teacherA, month, 'Good month — write every report.']))
    const r = await report(ctx.teacherA, ctx.teacherA)
    assert.equal(r.academy_note.note, 'Good month — write every report.')
    await rejects(as(ctx.db, ctx.teacherA, () => rpc(ctx.db, 'staff_set_teacher_month_note', [ctx.teacherA, month, 'All great'])), /Staff only/)
    await rejects(as(ctx.db, ctx.teacherA, () => ctx.db.query(`insert into teacher_month_notes (teacher_id, period, note) values ($1, $2, 'x')`, [ctx.teacherA, month])), /permission denied/)
    await asA(() => rpc(ctx.db, 'staff_set_teacher_month_note', [ctx.teacherA, month, '  ']))
    assert.equal((await report(ctx.teacherA, ctx.teacherA)).academy_note, null, 'an empty note removes it')
  })
})
describe('the academy brings students; payments follow the lessons (061)', () => {
  let ctx, clsA
  const asF = fn => as(ctx.db, ctx.founder, fn)
  const asA = fn => as(ctx.db, ctx.assistant, fn)
  const today = new Date().toISOString().slice(0, 10)
  const month = today.slice(0, 7) + '-01'
  const lastPayment = async student => one(ctx.db, `select id, teacher_id from crm_payments where student_id = $1 order by created_at desc limit 1`, [student])
  const assign = (teacher, student) => ctx.db.query(`insert into teacher_students (teacher_id, student_id, is_active) values ($1, $2, true)`, [teacher, student])

  before(async () => {
    ctx = await setup()
    clsA = await makeClass(ctx.db, { title: 'A group', teacher: ctx.teacherA })
  })

  it('only a teacher the founder allowed can add students or declare payments', async () => {
    await rejects(as(ctx.db, ctx.teacherA, () => rpc(ctx.db, 'teacher_add_student', ['Hiba', '0611223344', 'A1', 'group', null, null, null])), /not enabled/)
    await rejects(asA(() => ctx.db.query(`update teacher_profiles set can_add_students = true where id = $1`, [ctx.teacherA])), /Only a founder/)
    await as(ctx.db, ctx.teacherA, () => ctx.db.query(`update teacher_profiles set can_add_students = true where id = $1`, [ctx.teacherA]))
    assert.equal((await one(ctx.db, `select can_add_students from teacher_profiles where id = $1`, [ctx.teacherA])).can_add_students, false, 'a teacher cannot allow themselves')
    await asF(() => ctx.db.query(`update teacher_profiles set can_add_students = true where id = $1`, [ctx.teacherA]))
    const r = await as(ctx.db, ctx.teacherA, () => rpc(ctx.db, 'teacher_add_student', ['Hiba', '0611223344', 'A1', 'group', null, null, null]))
    assert.equal(r.result, 'created')
    const d = await as(ctx.db, ctx.teacherA, () => rpc(ctx.db, 'teacher_declare_payment', [r.student_id, 300, 'cash', today, 'monthly', null, null, null]))
    assert.equal((await one(ctx.db, `select teacher_id from crm_payments where id = $1`, [d.id])).teacher_id, ctx.teacherA)
    // teacher B was never allowed: even for a student assigned to them
    await assign(ctx.teacherB, r.student_id)
    await rejects(as(ctx.db, ctx.teacherB, () => rpc(ctx.db, 'teacher_declare_payment', [r.student_id, 100, 'cash', null, 'monthly', null, null, null])), /not enabled/)
  })

  it('a payment links itself to the student\'s only teacher — now, or when they are assigned later', async () => {
    const seated = await makeStudent(ctx.db, 'Seated', { phone: '+212600000101' })
    await enrollClass(ctx.db, clsA, seated.id)
    await pay(ctx.db, seated.id, 450, today)
    assert.equal((await lastPayment(seated.id)).teacher_id, ctx.teacherA)

    const later = await makeStudent(ctx.db, 'Later', { phone: '+212600000102' })
    await pay(ctx.db, later.id, 200, today)
    assert.equal((await lastPayment(later.id)).teacher_id, null, 'no teacher yet')
    await assign(ctx.teacherB, later.id)
    assert.equal((await lastPayment(later.id)).teacher_id, ctx.teacherB, 'linked when assigned')
  })

  it('a student with two teachers: unlinked until staff link it, then it counts for that teacher', async () => {
    const both = await makeStudent(ctx.db, 'Both', { phone: '+212600000103' })
    await enrollClass(ctx.db, clsA, both.id)
    await assign(ctx.teacherB, both.id)
    await pay(ctx.db, both.id, 300, today)
    const p = await lastPayment(both.id)
    assert.equal(p.teacher_id, null)
    let r = await as(ctx.db, ctx.teacherA, () => rpc(ctx.db, 'teacher_month_report', [ctx.teacherA, month]))
    assert.equal(Number(r.money.unlinked), 300, 'the teacher sees money waiting to be linked')
    assert.equal(Number(r.students.list.find(s => s.id === both.id).unlinked), 300)

    const opts = await asA(() => rpc(ctx.db, 'staff_payment_teacher_options', [both.id]))
    assert.match(opts.find(o => o.teacher_id === ctx.teacherA).via, /A group/)
    assert.match(opts.find(o => o.teacher_id === ctx.teacherB).via, /مسنَد/)

    await rejects(as(ctx.db, ctx.teacherA, () => rpc(ctx.db, 'staff_set_payment_teacher', [p.id, ctx.teacherA])), /Staff only/)
    await rejects(asA(() => rpc(ctx.db, 'staff_set_payment_teacher', [p.id, ctx.assistant])), /only be linked to a teacher/)
    await asA(() => rpc(ctx.db, 'staff_set_payment_teacher', [p.id, ctx.teacherB]))
    r = await as(ctx.db, ctx.teacherB, () => rpc(ctx.db, 'teacher_month_report', [ctx.teacherB, month]))
    assert.equal(Number(r.money.revenue), 500, '300 linked now + 200 from the student assigned later')
    assert.equal(Number(r.money.unlinked), 0)
  })

  it('the sides add up to total revenue, with unlinked money on its own row', async () => {
    const sides = (await asA(() => rpc(ctx.db, 'staff_sides_breakdown', [null, null]))).sides
    const total = await one(ctx.db, `select coalesce(sum(amount_mad), 0) as t from crm_payments where payment_status = 'paid' and amount_mad > 0 and not coalesce(excluded_from_revenue, false)`)
    assert.equal(sides.reduce((s, x) => s + Number(x.revenue_total), 0), Number(total.t))
    assert.equal(Number(sides.find(s => s.teacher_id === ctx.teacherA).revenue_total), 450)
    const a = sides.find(s => s.teacher_id === ctx.teacherA)
    assert.equal(a.students, 3, 'Hiba (assigned on add), Seated, Both')
  })
})
describe('notifications (062)', () => {
  let ctx, cls, s1, s2, other
  const asA = fn => as(ctx.db, ctx.assistant, fn)
  const today = new Date().toISOString().slice(0, 10)
  const inbox = who => q(ctx.db, `select kind, title, body, url, read_at from notifications where recipient = $1 order by created_at`, [who])
  const studentInbox = sid => q(ctx.db, `select type, title, body, sender_profile from student_notifications where student_id = $1 order by created_at`, [sid])
  const assign = (teacher, student, by = null) => ctx.db.query(`insert into teacher_students (teacher_id, student_id, is_active, assigned_by) values ($1, $2, true, $3)`, [teacher, student, by])

  before(async () => {
    ctx = await setup()
    cls = await makeClass(ctx.db, { title: 'Evening A1', teacher: ctx.teacherA })
    s1 = await makeStudent(ctx.db, 'Salma', { phone: '+212600000201' })
    s2 = await makeStudent(ctx.db, 'Omar', { phone: '+212600000202' })
    other = await makeStudent(ctx.db, 'Not Mine', { phone: '+212600000203' })
    await enrollClass(ctx.db, cls, s1.id)
    await asA(() => assign(ctx.teacherA, s2.id, ctx.assistant))
  })

  it('students: a teacher hears about a student assigned or seated; the student hears who their teacher is', async () => {
    const t = await inbox(ctx.teacherA)
    assert.ok(t.some(n => n.kind === 'student_assigned' && n.body === 'Omar'))
    assert.ok(t.some(n => n.kind === 'student_assigned' && n.body.includes('Salma') && n.body.includes('Evening A1')))
    assert.ok((await studentInbox(s2.id)).some(n => n.body.includes('Teacher A')))
  })

  it('money: a paid payment reaches its teacher and the student, once', async () => {
    await pay(ctx.db, s1.id, 450, today)
    const t = (await inbox(ctx.teacherA)).filter(n => n.kind === 'payment')
    assert.equal(t.length, 1)
    assert.match(t[0].body, /Salma · 450 د.م/)
    assert.ok((await studentInbox(s1.id)).some(n => n.type === 'payment' && n.body.includes('450')))
    await ctx.db.query(`update crm_payments set payment_status = 'paid', notes = 'x' where student_id = $1`, [s1.id])
    assert.equal((await inbox(ctx.teacherA)).filter(n => n.kind === 'payment').length, 1, 'no second notification')
  })

  it('money: unlinked payment of a student with two teachers → staff; a teacher-declared one → staff', async () => {
    await assign(ctx.teacherB, s1.id)
    await pay(ctx.db, s1.id, 300, today)
    const f = await inbox(ctx.founder)
    assert.ok(f.some(n => n.kind === 'payment_unlinked' && n.url === `/sales/students/${s1.id}`))
    assert.ok((await inbox(ctx.assistant)).some(n => n.kind === 'payment_unlinked'))
    await as(ctx.db, ctx.founder, () => ctx.db.query(`update teacher_profiles set can_add_students = true where id = $1`, [ctx.teacherA]))
    await as(ctx.db, ctx.teacherA, () => rpc(ctx.db, 'teacher_declare_payment', [s2.id, 200, 'cash', today, 'monthly', null, null, null]))
    assert.ok((await inbox(ctx.founder)).some(n => n.kind === 'payment_pending' && n.body.includes('Omar')))
  })

  it('pay marked paid → the payee', async () => {
    const month = today.slice(0, 7) + '-01'
    await ctx.db.query(`insert into staff_payouts (payee_id, period, base_mad, status) values ($1, $2, 1000, 'pending')`, [ctx.teacherA, month])
    await ctx.db.query(`update staff_payouts set status = 'paid' where payee_id = $1`, [ctx.teacherA])
    assert.ok((await inbox(ctx.teacherA)).some(n => n.kind === 'payout' && n.body.includes('1,000')))
  })

  it('classes: a cancelled or moved session reaches its students; a teacher cancelling also tells staff', async () => {
    const start = new Date(Date.now() + 3 * 86400e3).toISOString()
    const sess = await makeSession(ctx.db, { teacher: ctx.teacherA, classId: cls, startsAt: start, status: 'scheduled', title: 'Unit 3' })
    await ctx.db.query(`update class_sessions set starts_at = starts_at + interval '1 hour' where id = $1`, [sess])
    assert.ok((await studentInbox(s1.id)).some(n => n.title.includes('تغيّر موعد')))
    await as(ctx.db, ctx.teacherA, () => ctx.db.query(`update class_sessions set status = 'cancelled', cancel_reason = 'Sick' where id = $1`, [sess]))
    assert.ok((await studentInbox(s1.id)).some(n => n.title.includes('أُلغيت') && n.body.includes('Sick')))
    assert.ok((await inbox(ctx.founder)).some(n => n.kind === 'session_cancelled' && n.body.includes('Teacher A')))
  })

  it('students: absent twice in a row → the teacher and staff', async () => {
    const d = Date.now() - 5 * 86400e3
    for (const k of [0, 1]) {
      const sess = await makeSession(ctx.db, { teacher: ctx.teacherA, classId: cls, startsAt: new Date(d + k * 86400e3).toISOString(), status: 'done' })
      await ctx.db.query(`insert into class_attendance (session_id, student_id, status) values ($1, $2, 'absent')`, [sess, s1.id])
    }
    assert.equal((await inbox(ctx.teacherA)).filter(n => n.kind === 'absence').length, 1)
    assert.ok((await inbox(ctx.assistant)).some(n => n.kind === 'absence' && n.body.includes('Salma')))
  })

  it('reports: the academy note and the daily job (missing reports, month ready)', async () => {
    const month = today.slice(0, 7) + '-01'
    await asA(() => rpc(ctx.db, 'staff_set_teacher_month_note', [ctx.teacherA, month, 'Write every report.']))
    assert.ok((await inbox(ctx.teacherA)).some(n => n.kind === 'month_note' && n.url.startsWith('/teacher/monthly?month=')))
    const r = await rpc(ctx.db, 'notify_scheduled')
    assert.ok(r.missing_reports >= 2, 'the two done sessions above have no report')
    const again = await rpc(ctx.db, 'notify_scheduled')
    const missing = (await inbox(ctx.teacherA)).filter(n => n.kind === 'report_missing')
    assert.equal(missing.length, r.missing_reports, 'running twice does not repeat')
    assert.ok(again)
  })

  it('staff send to chosen people only; it is logged with its recipients', async () => {
    await rejects(asA(() => rpc(ctx.db, 'staff_send_notification', ['Hi', 'x', [], [], null, null])), /at least one recipient/)
    const r = await asA(() => rpc(ctx.db, 'staff_send_notification', ['Meeting', 'Friday 6pm', [ctx.teacherB], [], null, cls]))
    assert.equal(r.teachers, 1)
    assert.equal(r.students, 1, 'the class has one active student')
    assert.ok((await inbox(ctx.teacherB)).some(n => n.kind === 'message' && n.title === 'Meeting'))
    assert.ok((await studentInbox(s1.id)).some(n => n.type === 'message' && n.title === 'Meeting'))
    assert.equal((await studentInbox(other.id)).filter(n => n.type === 'message').length, 0, 'nobody else')
    const log = await asA(() => q(ctx.db, `select sender_role, recipient_count from notification_messages where id = $1`, [r.message_id]))
    assert.deepEqual(log[0], { sender_role: 'assistant', recipient_count: 2 })
    await rejects(as(ctx.db, ctx.teacherA, () => rpc(ctx.db, 'staff_send_notification', ['x', 'y', [ctx.teacherB], [], null, null])), /Staff only/)
  })

  it('a teacher writes to their own students only; staff see the message', async () => {
    await rejects(as(ctx.db, ctx.teacherA, () => rpc(ctx.db, 'teacher_send_notification', ['Hello', 'x', [other.id], null])), /not one of yours/)
    const r = await as(ctx.db, ctx.teacherA, () => rpc(ctx.db, 'teacher_send_notification', ['Homework', 'Page 12', [s2.id], null]))
    assert.equal(r.students, 1)
    const n = (await studentInbox(s2.id)).find(x => x.type === 'message')
    assert.equal(n.title, 'Teacher A · Homework')
    assert.equal(n.sender_profile, ctx.teacherA)
    const seen = await asA(() => q(ctx.db, `select sender_role from notification_messages where id = $1`, [r.message_id]))
    assert.equal(seen[0].sender_role, 'teacher', 'staff read it')
    const notMine = await as(ctx.db, ctx.teacherB, () => q(ctx.db, `select id from notification_messages where id = $1`, [r.message_id]))
    assert.equal(notMine.length, 0, 'another teacher does not')
  })

  it('a student writes to their teacher or the academy; staff see it; a stranger teacher is refused', async () => {
    const mine = await as(ctx.db, 'anon', () => rpc(ctx.db, 'student_my_teachers', [s2.token]))
    assert.deepEqual(mine.map(t => t.id), [ctx.teacherA])
    await as(ctx.db, 'anon', () => rpc(ctx.db, 'student_send_notification', [s2.token, 'I will be late', ctx.teacherA]))
    assert.ok((await inbox(ctx.teacherA)).some(n => n.kind === 'message' && n.body === 'I will be late'))
    await as(ctx.db, 'anon', () => rpc(ctx.db, 'student_send_notification', [s2.token, 'Invoice please', null]))
    assert.ok((await inbox(ctx.founder)).some(n => n.kind === 'message' && n.body === 'Invoice please'))
    await rejects(as(ctx.db, 'anon', () => rpc(ctx.db, 'student_send_notification', [s2.token, 'x', ctx.teacherB])), /Not your teacher/)
    await rejects(as(ctx.db, 'anon', () => rpc(ctx.db, 'student_send_notification', ['ING-NOPE', 'x', null])), /Not signed in/)
    const log = await asA(() => q(ctx.db, `select count(*)::int n from notification_messages where sender_role = 'student'`))
    assert.equal(log[0].n, 2)
  })

  it('each person reads and clears only their own; nobody writes notifications directly', async () => {
    const mineB = await as(ctx.db, ctx.teacherB, () => q(ctx.db, `select recipient from notifications`))
    assert.ok(mineB.length > 0 && mineB.every(n => n.recipient === ctx.teacherB))
    const n = await as(ctx.db, ctx.teacherB, () => rpc(ctx.db, 'notifications_mark_read', [null]))
    assert.ok(n >= 1)
    assert.ok((await inbox(ctx.teacherA)).some(x => x.read_at === null), 'teacher A untouched')
    await rejects(as(ctx.db, ctx.teacherA, () => ctx.db.query(`insert into notifications (recipient, title) values ($1, 'x')`, [ctx.teacherA])), /permission denied/)
    await rejects(as(ctx.db, ctx.teacherA, () => rpc(ctx.db, 'notify_scheduled')), /permission denied/)
    await rejects(as(ctx.db, ctx.teacherA, () => rpc(ctx.db, 'notifications_claim_push', [10])), /permission denied/)
  })

  it('the push queue: claimed once; old student notifications are never pushed', async () => {
    const first = await rpc(ctx.db, 'notifications_claim_push', [1000])
    assert.ok(first.profiles.length > 0 && first.students.length > 0)
    const second = await rpc(ctx.db, 'notifications_claim_push', [1000])
    assert.equal(second.profiles.length + second.students.length, 0)
  })
})
describe('lead channels (063)', () => {
  let ctx
  const today = new Date().toISOString().slice(0, 10)
  const channel = (utm, ref, source, page) => rpc(ctx.db, 'lead_channel', [utm, ref, source, page])
  const lead = async (name, phone, cols = {}) => (await one(ctx.db, `
    insert into subscription_leads (plan_id, full_name, phone, utm_source, referrer, source, lead_source, page_path, landing_path)
    values ('basic', $1, $2, $3, $4, $5, $5, $6, $7) returning id`,
    [name, phone, cols.utm ?? null, cols.ref ?? null, cols.source ?? null, cols.page ?? null, cols.landing ?? null])).id

  before(async () => { ctx = await setup() })

  it('classifies a lead by its UTM tags, then its referrer, then the source staff chose', async () => {
    assert.equal(await channel('instagram', null, 'level-test', '/level-test'), 'instagram')
    assert.equal(await channel('ig', null, null, '/'), 'instagram')
    assert.equal(await channel(null, 'https://l.instagram.com/?u=x', 'sticky_cta', '/'), 'instagram')
    assert.equal(await channel(null, 'https://m.facebook.com/', 'hero', '/'), 'facebook')
    assert.equal(await channel('tt', null, null, '/'), 'tiktok')
    assert.equal(await channel(null, 'https://l.wl.co/l?u=x', null, '/'), 'whatsapp')
    assert.equal(await channel(null, 'https://www.google.com/', null, '/'), 'search')
    assert.equal(await channel('chatgpt.com', null, null, '/'), 'ai')
    assert.equal(await channel(null, 'https://example.org/', null, '/'), 'other')
    assert.equal(await channel(null, null, 'sticky_cta', '/pricing'), 'direct', 'site lead without a source')
    assert.equal(await channel(null, null, 'tiktok', null), 'tiktok', 'typed in by staff')
    assert.equal(await channel(null, null, 'manual', null), 'other')
  })

  it('reports leads, the students they became (by link or by phone), and their revenue — each student once', async () => {
    const igA = await lead('From IG', '0611000001', { utm: 'instagram', page: '/level-test', landing: '/' })
    await lead('From IG again', '+212 611-00-00-01', { ref: 'https://l.instagram.com/', page: '/pricing' })   // same person, second form
    await lead('From FB', '0622000002', { ref: 'https://m.facebook.com/', page: '/' })
    await lead('Typed in', '0633000003', { source: 'tiktok' })
    const linked = await makeStudent(ctx.db, 'IG student', { phone: '+212611000001' })
    await ctx.db.query(`update crm_students set lead_id = $1 where id = $2`, [igA, linked.id])
    await pay(ctx.db, linked.id, 1400, today)
    await makeStudent(ctx.db, 'TikTok student', { phone: '0633000003' })   // matched by phone only

    const r = await as(ctx.db, ctx.assistant, () => rpc(ctx.db, 'staff_channel_report', [null, null]))
    const by = Object.fromEntries(r.channels.map(c => [c.channel, c]))
    assert.equal(by.instagram.leads, 2)
    assert.equal(by.instagram.students, 1, 'two forms, one student')
    assert.equal(Number(by.instagram.revenue), 1400)
    assert.equal(by.instagram.paying, 1)
    assert.equal(by.facebook.leads, 1)
    assert.equal(by.facebook.students, 0)
    assert.equal(by.tiktok.students, 1, 'matched by phone')
    assert.equal(by.tiktok.from_site, 0)
    assert.equal(r.channels[0].channel, 'instagram', 'sorted by revenue')
  })

  it('counts real leads only — a finished level test or an inquiry is not a lead (064)', async () => {
    const before = await as(ctx.db, ctx.assistant, () => rpc(ctx.db, 'staff_channel_report', [null, null]))
    const total = r => r.channels.reduce((n, c) => n + c.leads, 0)
    await ctx.db.query(`insert into subscription_leads (plan_id, full_name, utm_source, page_path)
                        values ('test_completed', 'Test only', 'instagram', '/level-test'),
                               ('inquiry', 'Question', null, '/contact')`)
    const after = await as(ctx.db, ctx.assistant, () => rpc(ctx.db, 'staff_channel_report', [null, null]))
    assert.equal(total(after), total(before))
  })

  it('is for staff only', async () => {
    await rejects(as(ctx.db, ctx.teacherA, () => rpc(ctx.db, 'staff_channel_report', [null, null])), /Staff only/)
    await rejects(as(ctx.db, 'anon', () => rpc(ctx.db, 'staff_channel_report', [null, null])), /permission denied/)
  })
})