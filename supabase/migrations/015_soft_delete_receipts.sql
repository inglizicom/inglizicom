-- =============================================================
-- Migration 015 — Soft Delete, Receipts, Student Activity
-- =============================================================

-- ─── 1. Soft delete on leads ─────────────────────────────────
ALTER TABLE public.subscription_leads
  ADD COLUMN IF NOT EXISTS deleted_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS subscription_leads_deleted_idx
  ON public.subscription_leads (deleted_at)
  WHERE deleted_at IS NOT NULL;

-- ─── 2. Soft delete on students ──────────────────────────────
ALTER TABLE public.crm_students
  ADD COLUMN IF NOT EXISTS deleted_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ─── 3. Payment method on crm_payments ───────────────────────
ALTER TABLE public.crm_payments
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash'; -- cash|bank_transfer|card|other

-- ─── 4. Receipt number sequence ──────────────────────────────
CREATE SEQUENCE IF NOT EXISTS crm_receipt_number_seq START 1001 INCREMENT 1;

-- ─── 5. CRM Receipts table ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.crm_receipts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number  TEXT        UNIQUE NOT NULL DEFAULT ('ING-' || nextval('crm_receipt_number_seq')::TEXT),
  payment_id      UUID        REFERENCES public.crm_payments(id) ON DELETE SET NULL,
  lead_id         UUID        REFERENCES public.subscription_leads(id) ON DELETE SET NULL,
  student_id      UUID        REFERENCES public.crm_students(id) ON DELETE SET NULL,
  -- Snapshot of student info at time of receipt (won't change if student is edited later)
  full_name       TEXT        NOT NULL,
  phone_number    TEXT,
  course_name     TEXT,
  -- Payment details
  payment_type    TEXT        NOT NULL DEFAULT 'course_one_time', -- course_one_time|private_monthly
  amount_mad      NUMERIC(10,2) NOT NULL,
  payment_date    DATE        NOT NULL DEFAULT CURRENT_DATE,
  payment_method  TEXT        NOT NULL DEFAULT 'cash',            -- cash|bank_transfer|card|other
  -- Meta
  notes           TEXT,
  issued_by_id    UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS crm_receipts_payment_id_idx  ON public.crm_receipts (payment_id);
CREATE INDEX IF NOT EXISTS crm_receipts_lead_id_idx     ON public.crm_receipts (lead_id);
CREATE INDEX IF NOT EXISTS crm_receipts_student_id_idx  ON public.crm_receipts (student_id);
CREATE INDEX IF NOT EXISTS crm_receipts_issued_at_idx   ON public.crm_receipts (issued_at DESC);

ALTER TABLE public.crm_receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crm_receipts_staff_all  ON public.crm_receipts;
DROP POLICY IF EXISTS crm_receipts_staff_read ON public.crm_receipts;

CREATE POLICY crm_receipts_staff_all ON public.crm_receipts
  FOR ALL USING (public.is_crm_staff(auth.uid()));

-- ─── 6. Auto-create receipt when payment is approved ─────────
-- Trigger: when crm_payments.payment_status changes to 'paid', auto-create a receipt.
CREATE OR REPLACE FUNCTION public.auto_create_receipt()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_full_name      TEXT;
  v_phone          TEXT;
  v_course         TEXT;
  v_issued_by      UUID;
BEGIN
  -- Only fire when status changes to 'paid'
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS DISTINCT FROM 'paid') THEN
    -- Get student info (prefer student record, fall back to lead)
    IF NEW.student_id IS NOT NULL THEN
      SELECT full_name, phone_number, course
        INTO v_full_name, v_phone, v_course
        FROM public.crm_students WHERE id = NEW.student_id;
    ELSIF NEW.lead_id IS NOT NULL THEN
      SELECT full_name, phone, course
        INTO v_full_name, v_phone, v_course
        FROM public.subscription_leads WHERE id = NEW.lead_id;
    END IF;

    v_issued_by := COALESCE(NEW.approved_by_id, NEW.added_by_id);

    -- Insert receipt (idempotent — skip if already exists for this payment)
    INSERT INTO public.crm_receipts (
      payment_id, lead_id, student_id,
      full_name, phone_number, course_name,
      payment_type, amount_mad, payment_date,
      payment_method, notes, issued_by_id
    )
    SELECT
      NEW.id, NEW.lead_id, NEW.student_id,
      COALESCE(v_full_name, 'طالب'),
      v_phone,
      COALESCE(v_course, NEW.course_or_service),
      NEW.payment_type, NEW.amount_mad,
      COALESCE(NEW.payment_date::DATE, CURRENT_DATE),
      COALESCE(NEW.payment_method, 'cash'),
      NEW.notes,
      v_issued_by
    WHERE NOT EXISTS (
      SELECT 1 FROM public.crm_receipts WHERE payment_id = NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_create_receipt ON public.crm_payments;
CREATE TRIGGER trg_auto_create_receipt
  AFTER UPDATE OF payment_status ON public.crm_payments
  FOR EACH ROW EXECUTE FUNCTION public.auto_create_receipt();

-- ─── 7. Student Activity Tracking ────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_activity (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id      UUID        REFERENCES public.subscription_leads(id) ON DELETE SET NULL,
  -- Event classification
  event_type   TEXT        NOT NULL,  -- login|page_view|lesson_view|video_play|video_complete|test_attempt|test_score|listening|map_progress
  entity_type  TEXT,                  -- lesson|test|video|page|section
  entity_id    TEXT,                  -- slug or UUID of the content
  entity_title TEXT,                  -- human-readable title snapshot
  -- Metrics
  score        NUMERIC(5,2),          -- 0-100 for test scores
  duration_sec INTEGER,               -- seconds spent (from video/lesson)
  -- Extra
  metadata     JSONB,                 -- level_result, map_node, etc.
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS student_activity_user_idx     ON public.student_activity (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS student_activity_lead_idx     ON public.student_activity (lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS student_activity_event_idx    ON public.student_activity (event_type);
CREATE INDEX IF NOT EXISTS student_activity_created_idx  ON public.student_activity (created_at DESC);

ALTER TABLE public.student_activity ENABLE ROW LEVEL SECURITY;

-- Staff can read all activity
DROP POLICY IF EXISTS student_activity_staff_read ON public.student_activity;
CREATE POLICY student_activity_staff_read ON public.student_activity
  FOR SELECT USING (public.is_crm_staff(auth.uid()));

-- Students can insert their own activity
DROP POLICY IF EXISTS student_activity_self_insert ON public.student_activity;
CREATE POLICY student_activity_self_insert ON public.student_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── 8. Archived leads helper view ───────────────────────────
CREATE OR REPLACE VIEW public.crm_archived_leads AS
  SELECT * FROM public.subscription_leads
  WHERE is_archived = TRUE OR deleted_at IS NOT NULL;

-- ─── 9. Revenue-safe view (only approved paid payments) ───────
CREATE OR REPLACE VIEW public.crm_revenue_safe AS
  SELECT
    p.*,
    r.receipt_number,
    r.id AS receipt_id
  FROM public.crm_payments p
  LEFT JOIN public.crm_receipts r ON r.payment_id = p.id
  WHERE p.payment_status = 'paid';
