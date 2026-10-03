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