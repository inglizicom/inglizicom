# Online classes, enrollment analytics, teacher isolation — runbook

Migrations: `047_online_classes_enrollment.sql`, `048_enrollment_analytics.sql`, `049_curriculum_exercises.sql`.

## What changed in the database

| Concept | Where | Notes |
|---|---|---|
| Course enrollment | `lms_enrollments` (+ `completed_at`, `updated_at`, status `active`/`completed`) | A row still means "can open the course" — the 16 portal functions that join it are untouched. |
| Removed course enrollments | `lms_enrollment_history` (new, staff read-only) | Filled by an `AFTER DELETE` trigger with reason and actor. Not filled when the student or course itself is hard-deleted. |
| Online class (cohort) | `online_classes` (new) | group/private, teacher, course, level, dates, capacity (private = 1), waitlist, archive. |
| Class enrollment | `online_class_enrollments` (new) | active / waitlisted / completed / cancelled. One open seat per student per class (partial unique index). Ended seats are history; re-joining creates a new row. |
| Sessions | `class_sessions.class_id` (new, nullable) | Existing sessions stay unlinked until staff link them. Session takes the class's mode and course. |
| Staff tasks | `student_assignments.lesson_id`, `course_id` (new) | Course derived from the lesson by trigger. |
| Curriculum exercises | `lms_curriculum_items` (view) | Lesson/unit fields remain the single source of truth. |
| Audit trail | `crm_student_events` | Every enrollment, seat and assignment change is logged by trigger. |

Constraints added with `NOT VALID` + `VALIDATE` (live data checked on 2026-10-01): session status/mode/duration, attendance status, enrollment status, task status.

## Security rules

- Teachers read only their own classes (`teacher_id`) or classes where they taught a session; raw roster rows only for the owner.
  Names + masked phones come from `teacher_class_roster()` / `session_roster()`, which refuse other classes.
- Attendance insert/update: the student must hold a seat that covered the session (class sessions) or be assigned to the teacher (legacy sessions). Teachers cannot delete marks; `marked_by` is forced to the teacher.
- Reports: only on the teacher's own session. No teacher deletes.
- Sessions: teachers may delete only an untouched `scheduled` session; anyone deleting a session with attendance/report is refused (except the confirmed teacher-account deletion cascade).
- A teacher cannot attach a session to another teacher's class or move it between classes.
- `/api/teacher/wa` uses `teacher_can_reach_student()` (service-role only): assignment or active seat.
- All staff RPCs call `require_staff()`; analytics/staff/teacher RPCs are revoked from `anon`.

## Deploy

1. Take a backup (Supabase dashboard → Database → Backups, or `pg_dump`).
2. Apply the three migrations **in order**, each in one transaction, with the same mechanism used for 041/042
   (Supabase MCP `apply_migration`, `supabase db push`, or the SQL editor). They are idempotent.
3. Deploy the app. The database change is backward compatible with the current app, so step 2 can go first safely.
4. `npm install` (adds the `@electric-sql/pglite` devDependency; the lockfile entry is already present).

## After deploy (CRM)

1. **Online classes → قسم جديد**: create the real classes and assign teachers.
2. **حصة غير مرتبطة بأي قسم**: link the 14 existing sessions to their classes. Nothing is inferred automatically.
3. Open each class: the yellow panel lists students who were marked present without a seat. Tick only those who belong; they are enrolled from their first attended session. (Existing private sessions have 8 attendance rows each — the old sheet listed every assigned student — so review those carefully.)
4. **الدورات → تدقيق التمارين**: on 2026-10-01 production had 38 lessons whose quiz is a bare array; the lesson gate does not enforce those. Re-save them in the `{ questions }` shape if the quiz should gate the lesson.

## Tests

```
npm run test:unit   # date ranges, previous period, URL state, CSV, Morocco wall-clock scheduling (Node ≥ 22.18)
npm run test:db     # fresh DB: production schema @046 + 047–049, then 47 behavioural tests
```

`supabase/tests/000_legacy_baseline.sql` is a structure-only snapshot of production at 046 (history 001–046 is not replayable: production was partly built outside this folder). `baseline-fidelity.json` pins md5 of every production function so drift is caught.
