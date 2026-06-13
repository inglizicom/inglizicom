/**
 * Shared enumerations and display maps for the Inglizi CRM.
 * Imported by lead forms, Kanban, drawer, analytics, etc.
 */

// ─── Lead source ────────────────────────────────────────────
export type LeadSource =
  | 'tiktok' | 'instagram' | 'facebook' | 'youtube'
  | 'website' | 'whatsapp' | 'referral' | 'manual' | 'other'

export const LEAD_SOURCES: { id: LeadSource; label: string; emoji: string; color: string }[] = [
  { id: 'tiktok',    label: 'TikTok',    emoji: '🎵', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'instagram', label: 'Instagram', emoji: '📸', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { id: 'facebook',  label: 'Facebook',  emoji: '👥', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'youtube',   label: 'YouTube',   emoji: '▶️', color: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'website',   label: 'Website',   emoji: '🌐', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'whatsapp',  label: 'WhatsApp',  emoji: '💬', color: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'referral',  label: 'Referral',  emoji: '🤝', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'manual',    label: 'Manual',    emoji: '✍️', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { id: 'other',     label: 'Other',     emoji: '🔗', color: 'bg-gray-100 text-gray-600 border-gray-200' },
]

export function getSourceMeta(id: string | null | undefined) {
  return LEAD_SOURCES.find(s => s.id === id) ?? LEAD_SOURCES[LEAD_SOURCES.length - 1]
}

// ─── Course / programme ─────────────────────────────────────
export type LeadCourse = 'a0a1' | 'a1a2' | 'a2b1' | 'private' | 'bootcamp' | 'other'

export const LEAD_COURSES: { id: LeadCourse; label: string; short: string }[] = [
  { id: 'a0a1',     label: 'A0 - A1',    short: 'A0-A1' },
  { id: 'a1a2',     label: 'A1 - A2',    short: 'A1-A2' },
  { id: 'a2b1',     label: 'A2 - B1',    short: 'A2-B1' },
  { id: 'private',  label: 'دروس خاصة',  short: 'خاص' },
  { id: 'other',    label: 'أخرى',       short: 'أخرى' },
]

export function getCourseMeta(id: string | null | undefined) {
  return LEAD_COURSES.find(c => c.id === id) ?? { id: 'other', label: id ?? 'Unknown', short: id ?? '—' }
}

// ─── Lead type ──────────────────────────────────────────────
export type LeadType = 'course' | 'private_class'
export const LEAD_TYPES: { id: LeadType; label: string }[] = [
  { id: 'course',        label: 'Group Course' },
  { id: 'private_class', label: 'Private Classes (monthly)' },
]

// ─── Lost reason ────────────────────────────────────────────
export type LostReason =
  | 'too_expensive' | 'no_time' | 'no_reply' | 'not_serious'
  | 'other_school' | 'wants_installment' | 'other'

export const LOST_REASONS: { id: LostReason; label: string }[] = [
  { id: 'too_expensive',     label: 'Too expensive' },
  { id: 'no_time',           label: 'No time right now' },
  { id: 'no_reply',          label: 'No reply' },
  { id: 'not_serious',       label: 'Not serious' },
  { id: 'other_school',      label: 'Chose another school' },
  { id: 'wants_installment', label: 'Wants installment plan' },
  { id: 'other',             label: 'Other' },
]

// ─── Enrollment type (Phase 3) ──────────────────────────────
// Only 'paid' generates revenue. The rest count as active students but never as money.
export type EnrollmentType = 'paid' | 'free' | 'coupon' | 'sponsored' | 'trial'

export const ENROLLMENT_TYPES: { id: EnrollmentType; label: string; emoji: string; color: string }[] = [
  { id: 'paid',      label: 'مدفوع',          emoji: '💳', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'free',      label: 'مجاني',           emoji: '🎈', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { id: 'coupon',    label: 'كوبون / مكافأة',  emoji: '🎁', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  { id: 'sponsored', label: 'منحة / راعٍ',      emoji: '🤝', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'trial',     label: 'تجريبي',          emoji: '⏳', color: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
]

// ─── CRM Student ────────────────────────────────────────────
export interface CrmStudent {
  id:                string
  lead_id:           string | null
  full_name:         string
  phone_number:      string | null
  course:            string | null
  student_type:      'course_student' | 'private_student'
  enrollment_date:   string
  payment_status:    'paid' | 'pending' | 'overdue'
  total_paid_mad:    number | null
  monthly_fee_mad:   number | null
  next_payment_date: string | null
  notes:             string | null
  is_active:         boolean
  added_by_id:       string | null
  created_at:        string
  updated_at:        string
  // Migration 016
  verification_token: string | null
  course_end_date:    string | null
  teacher_name:       string | null
  // Migration 018
  source?:             string | null
  billing_type?:       'one_time' | 'monthly'
  subscription_start?: string | null
  current_level?:      string | null
  next_level?:         string | null
  deleted_at?:         string | null
  // Migration 020 — portal control
  admin_message?:      string | null
  next_task?:          string | null
  today_lesson_url?:   string | null
  today_lesson_title?: string | null
  learning_stage?:     string | null
  // Migration 018 (this branch) — enrollment types
  enrollment_type?:    EnrollmentType
  coupon_code?:        string | null
  reward_source?:      string | null
  sponsor_reason?:     string | null
  trial_expires_at?:   string | null
}

// ─── CRM Payment ────────────────────────────────────────────
export type PaymentType   = 'course_one_time' | 'private_monthly'
export type PaymentStatus = 'pending' | 'paid' | 'declined'

export interface CrmPayment {
  id:                 string
  lead_id:            string | null
  student_id:         string | null
  payment_type:       PaymentType
  course_or_service:  string | null
  amount_mad:         number
  payment_status:     PaymentStatus
  payment_date:       string | null
  next_payment_date:  string | null
  receipt_url:        string | null
  notes:              string | null
  added_by_id:        string | null
  approved_by_id:     string | null
  approved_at:        string | null
  created_at:         string
  updated_at:         string
}

// ─── Lead timeline event ─────────────────────────────────────
export type LeadEventType =
  | 'created' | 'status_changed' | 'note_added' | 'contacted'
  | 'followup_set' | 'payment_added' | 'converted_to_student'
  | 'file_uploaded' | 'assigned'

export interface LeadEvent {
  id:           string
  lead_id:      string
  actor_id:     string | null
  actor_email:  string | null
  event_type:   LeadEventType | string
  title:        string
  body:         string | null
  before_value: Record<string, unknown> | null
  after_value:  Record<string, unknown> | null
  created_at:   string
}

export const EVENT_ICONS: Record<string, string> = {
  created:               '✨',
  status_changed:        '🔄',
  note_added:            '📝',
  contacted:             '📞',
  followup_set:          '📅',
  payment_added:         '💳',
  converted_to_student:  '🎓',
  file_uploaded:         '📎',
  assigned:              '👤',
}

// ─── Plan presets ────────────────────────────────────────────
export const PLAN_PRESETS = [
  { id: 'basic',   label: 'Basic',   amount: 750  },
  { id: 'pro',     label: 'Pro',     amount: 1400 },
  { id: 'premium', label: 'Premium', amount: 3000 },
  { id: 'vip',     label: 'VIP',     amount: 5000 },
] as const
