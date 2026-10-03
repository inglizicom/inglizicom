# CLAUDE.md

This file guides Claude Code (claude.ai/code) when it works in this repository.

## What this is

Inglizi.com (إنجليزي.كوم) teaches English to Arabic speakers. Everything runs from one Next.js 14 App Router app, and middleware routes requests to four surfaces by hostname:

| Host | Serves | Code |
|---|---|---|
| `inglizi.com` | Marketing site, courses, level test, blog, pricing | `src/app/(public)/*` (shared Header/Footer/ChatBot layout), plus `free`, `gcc`, `ebook`, `private/lessons` |
| `student.` / `space.` / `my.inglizi.com` | Student portal | every path is rewritten to `src/app/student-space/page.tsx` (one very large client component) |
| `teacher.inglizi.com` | `/` → public teacher directory (`teacher-showcase`); any other path → `/teacher/*` workspace | `src/app/teacher/*`, `src/app/teacher-showcase/*` |
| `admin.inglizi.com` | Staff CRM. Clean paths map to `/sales/*` and `/admin/*` through `ADMIN_ROUTES` | `src/app/sales/*`, `src/app/admin/*`, `src/app/crm-login` |

All of this routing lives in [src/middleware.ts](src/middleware.ts). For local development, use hosts like `admin.localhost:3000`, `teacher.localhost:3000` and `student.localhost:3000`, or add the query flags `?_admin=1`, `?_teacher=1` or `?_student=1`. A new admin-domain page needs an entry in `ADMIN_ROUTES`. CRM links should build their paths with `useCrmBasePath()` ([src/lib/use-crm-path.ts](src/lib/use-crm-path.ts)), which returns `''` on the admin domain and `/sales` everywhere else.

The UI is Arabic and right-to-left: the root layout sets `<html lang="ar" dir="rtl">`. User-facing copy is in Arabic. Code comments and developer docs are in English.

## Commands

```bash
npm run dev          # next dev on :3000
npm run build        # production build
npm run typecheck    # tsc --noEmit (strict); there is no ESLint config, so this is the main static check
npm test             # test:unit + test:db
npm run test:unit    # node --test tests/unit/   (needs Node ≥ 22.18: imports .ts directly through type stripping)
npm run test:db      # node supabase/tests/run-db-tests.mjs  (in-process Postgres via PGlite, touches no real project)
node --test --test-name-pattern="teacher isolation" supabase/tests/run-db-tests.mjs   # run a single describe/it
npm run test:e2e     # Playwright smoke tests (e2e/), desktop + phone, installed Chrome
npx playwright test --project=desktop e2e/crm.spec.ts   # one file, one viewport
```

The e2e suite starts its own `next dev` on port 3123 with a separate build folder (`.next-e2e`, via `NEXT_DIST_DIR`) and a fake Supabase URL. [e2e/mock.ts](e2e/mock.ts) answers every Supabase request with fixed data and records calls, so it never touches the real project and needs no secrets. Add a page to the route lists in `e2e/crm.spec.ts` / `e2e/spaces.spec.ts` when you add one.

The one-off AI content generators in `scripts/gen-*.mjs` write straight to the production Supabase. Run them as `node --env-file=.env.local scripts/<name>.mjs`, and only when asked to.

`git` is not on PATH in this Windows/PowerShell environment.

## Architecture

### Data: Supabase, mostly called from the client
- [src/lib/supabase.ts](src/lib/supabase.ts) holds the browser client (anon key). Most pages are `'use client'` and query Supabase directly through the helper modules in `src/lib/*-db.ts`, `teachers.ts`, `lms.ts` and `student-portal.ts`. Keep Supabase calls in those `src/lib` modules, not in components.
- Security is enforced in Postgres through RLS and `security definer` RPCs, not in the UI. Teachers get zero rows from the `crm_*` tables. They only reach data through RPCs such as `teacher_overview`, `teacher_my_students` and `teacher_class_roster`, which return masked phone numbers. Staff RPCs call `require_staff()`.
- Server-only work uses the service-role key in API routes (`src/app/api/**/route.ts`, `runtime = 'nodejs'`) and in [src/lib/teacher-public.ts](src/lib/teacher-public.ts). These routes authenticate the caller from a `Authorization: Bearer <access token>` header and then check `profiles.role`. Never import a service-role module into client code.
- The `@/*` alias resolves to `src/*`.

### Auth and roles
- `AuthProvider` ([src/lib/auth-context.tsx](src/lib/auth-context.tsx)) wraps the whole app in the root layout, together with `ProfileProvider` and `FeatureAccessProvider`.
- `profiles.role` is one of `student`, `assistant`, `founder` or `teacher`. A user with `is_admin = true` and no explicit role counts as a founder.
- Guards are client components:
  - `StaffGuard mode="staff"` protects `/sales` and lets founders and assistants in.
  - `StaffGuard mode="founder"` protects `/admin` and redirects assistants to `/sales`.
  - `TeacherGuard` protects `/teacher`, except `/teacher/login`. It admits teachers, and founders as a read-only "preview". It creates the `teacher_profiles` row the first time a teacher visits.
- The student portal has its own login flow with codes, device IDs and WhatsApp OTP (`/api/auth/send-otp`, `/api/auth/verify-otp`).

### Teacher space (`src/app/teacher`)
- [TeacherRoot.tsx](src/app/teacher/TeacherRoot.tsx) wraps every page in `TeacherGuard`, then `TeacherShell`, which holds the nav. Its sections are today, groups, classes, students, reports, materials, earnings, schedule, reviews and profile.
- The dashboard and profile pages are built from `_kit.tsx`: `Surface`, `Kpi`, `CardHead`, `Btn`/`ShareBtn`, `Face` and `profileChecklist`. The look is ivory ground, white soft-shadow cards and one dark hero, with gold `#C8973F` as the accent. Its private design system lives in underscore files: `_ds.tsx` (tokens `T`, `GRAD`, motion presets, primitives), `_paper.tsx` (editorial "Band"/figure layout), `_ui.tsx`, `_charts.tsx` (Recharts) and `_motion.tsx`. The look is warm paper: the `paper.*` and `domain.*` colours plus the `font-paper` and `font-plex` families in [tailwind.config.js](tailwind.config.js).
- The data layer and types are in [src/lib/teachers.ts](src/lib/teachers.ts) (`TeacherProfile`, `TeacherProfileFull`, `TeacherOverview` and others). The public profile type and its fetch are in `src/lib/teacher-public.ts`.
- Public profile rendering is handled by [TeacherPublicProfileView.tsx](src/components/teachers/TeacherPublicProfileView.tsx), used by `teacher-showcase/[teacherId]` (ISR, `revalidate = 60`). There is also an older `(public)/teachers/[teacherId]` page.
- Demo mode works without any backend. Add `?demo=1` (it is remembered in sessionStorage). The teacher mock data is in `src/app/teacher/_demo.ts` and `teacher/profile/demoData.ts`. The student portal uses `src/lib/demo.ts`. `/teacher-showcase/demo` renders `DEMO_PUBLIC_TEACHER`.

### CRM (`src/app/sales`, `src/app/admin`)
- Leads, students, payments, live classes (with attendance), teachers, broadcasts, gamification and support, for all staff. The teachers page is one component served at `/sales/teachers` (staff) and `/admin/teachers`; inside it only a founder can change a teacher's pay (also enforced by `guard_teacher_profile_fields`, migration 058) or delete an account. Founders also get analytics, Team & payroll (`admin/team`: staff, salaries, payouts, the audit trail) and course and lesson builders (`admin/present/*`, which are very large files).
- Every write a founder or assistant makes to the main CRM tables is recorded in `crm_activity_log` by a database trigger (`audit_staff_change`, migration 057). Don't add browser-side `logActivity` calls for those; only server-route actions (account creation) need one.
- Shared pieces live in `src/app/sales/_components` (KpiCard, Charts, Avatar), `src/components/crm/kit.tsx` and `src/components/analytics/*`.
- The metric definitions in `src/lib/enrollment-metrics.ts` and `crm-stats.ts` are tested. Business dates use the Morocco clock (Africa/Casablanca).

### Content
- Course and lesson content is static TypeScript under `src/data`. Some of these files are huge, for example `writing-course.ts` at about 680 KB. Read them with offsets or grep rather than reading them whole.
- `play/` and `sahla/` are standalone static HTML sites, each deployed as its own Vercel project. They are not part of the Next build. See [docs/SAHLA_SUBDOMAIN.md](docs/SAHLA_SUBDOMAIN.md). `public/units/unit-4` is the source of truth for the copies in `sahla/units/unit-4`.

### Database migrations (`supabase/migrations`)
- Files are numbered `NNN_name.sql` and must be idempotent, so re-applying one changes nothing. The DB tests check this.
- Migrations 001–046 cannot be replayed. Tests start from `supabase/tests/000_legacy_baseline.sql`, a production snapshot at 046, and apply 047 onward. `baseline-fidelity.json` pins the md5 of each production function to catch drift.
- Every new table needs RLS. New RPCs should be revoked from `anon` and should check roles with `require_staff()` or `auth.uid()`.
- Migrations are applied by hand, through Supabase MCP `apply_migration`, `supabase db push` or the SQL editor, in order. Deploy runbook: [docs/online-classes-enrollment.md](docs/online-classes-enrollment.md).
- When you add a migration, add behavioural tests to `supabase/tests/run-db-tests.mjs`, using the helpers in `fixtures.mjs`.

## Environment

The variables live in `.env.local`, which is gitignored:

| Purpose | Variables |
|---|---|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| AI | `OPENAI_API_KEY`, `GEMINI_API_KEY` (TTS) |
| Images | `UNSPLASH_ACCESS_KEY`, `GOOGLE_CSE_KEY` / `GOOGLE_CSE_CX` |
| Web push | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` |
| WhatsApp Cloud API | `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_TPL_*` |
| Cron | `CRON_SECRET` |

Vercel runs one cron, `/api/cron/daily-reminders`, daily at 08:00 ([vercel.json](vercel.json)). The app is also a PWA (`public/sw.js`, `manifest.webmanifest`). Middleware must keep passing `sw.js`, `manifest.webmanifest`, `/offline` and `/icons/*` through on every host.

## Conventions
- Match the comment style in the surrounding code. Files open with a doc comment that explains why the code is shaped the way it is.
- Use Tailwind for styling, with arbitrary values where the design calls for them. Icons come from `lucide-react`, animation from `framer-motion` and charts from `recharts`.
- The `/teacher` tree and staff pages are `noindex`. Keep it that way for anything behind a login.
- Do not break admin or CRM flows when changing shared `src/lib` modules. `teachers.ts` and the guards are used by both the teacher space and the CRM teachers page.
