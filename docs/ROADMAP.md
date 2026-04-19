# Inglizi.com — SaaS Roadmap

Goal: transform Inglizi.com from a single-teacher site into a subscription EdTech SaaS.

## Phase 1 — Plans + access gates

Foundation for everything else.

- Define tiers: `free`, `paid`, `pro` (names TBD).
- Tables:
  - `plans` — id, name, price_mad, price_usd, features (jsonb), active.
  - `user_plans` — user_id, plan_id, starts_at, expires_at, status.
- Extend existing `feature_access` seed to reference plan tiers instead of per-user flags.
- Gate server routes/components for lessons + AI pages on `user_plans.status = 'active'`.

## Phase 2 — Manual payment with receipt upload

Automate the workflow around the manual bank transfer. Keep the money flow manual.

- User flow: pick plan → shown bank details → upload receipt → `payments` row created (status: `pending`).
- Storage: Supabase Storage bucket `payment-receipts` (private, admin-only read).
- Admin notification: in-admin badge + email via Supabase Edge Function or Resend.
- Admin action: approve → flips `user_plans.status` to `active` and sets `expires_at`; decline → leaves a reason the user sees.
- User-visible states: `pending`, `approved`, `declined` (with reason).

**Schema hint:** design `payments` so a future Stripe webhook can insert rows with the same shape — don't couple it to the receipt-upload flow.

## Phase 3 — Admin user console

Single `/admin/users` page.

- List + search users.
- Actions: block / unblock, grant / revoke plan, view payment history, reset password (via Supabase admin API).
- Reuse existing `AdminGuard` + `is_admin()` RLS check.

## Phase 4 — Support chat

- `conversations` + `messages` tables. User opens a thread from their dashboard; admin inbox shows all open threads.
- Start human-only. Add AI agent later as a second participant type (Claude API with context: current plan, latest payment, recent lessons).

## Phase 5 — Course hosting vs skool.com

No new infrastructure — just a field on each course.

- `courses.course_type: 'native' | 'external'`.
- Native: render inside the site using the existing lessons infra.
- External: redirect to skool.com (store the URL).

Decide per-course — lightweight content stays native, cohort/community-heavy content goes to skool.

## Open decisions

- **Payment processor later:** Morocco/MENA card penetration is low, so manual + receipts is legitimate for v1. But design `payments` to accept Stripe/Paddle writes later without migration pain.
- **Pricing:** MAD primary, USD secondary? Monthly vs yearly? Annual discount?
- **Free tier scope:** how much content to give away before the paywall.
