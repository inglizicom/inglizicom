/**
 * Level-based payment plans.
 *
 * Each plan is a ONE-TIME payment that gives lifetime access to the
 * video course + book + WhatsApp group. The "monthly perks" (lives,
 * follow-up) run for the follow-up period defined per plan and do NOT
 * unlock extra courses — only the recurring services.
 */

export type PlanColor =
  | 'emerald' | 'blue' | 'violet' | 'orange' | 'amber' | 'slate'

export interface Plan {
  id:              string
  levelFrom:       string | null
  levelTo:         string | null
  title_ar:        string
  subtitle_ar:     string
  amount_mad:      number
  originalAmount?: number
  isHourly?:         boolean
  minHoursPerMonth?: number
  /** Follow-up cadence, e.g. "متابعة أسبوعية". */
  followUpLabel_ar:    string
  /** How long the follow-up runs, e.g. "8 أسابيع". */
  followUpDuration_ar: string
  /** Kept for billing flow compatibility (extends profile.plan_expires_at). */
  duration_months: number
  /** Lifetime / one-time perks — course access, book, group. */
  lifetimePerks:   string[]
  /** Recurring perks — lives, follow-up, coaching. */
  monthlyPerks:    string[]
  highlight?:      boolean
  isPremium?:      boolean
  isBusiness?:     boolean
  badge_ar?:       string
  color:           PlanColor
  /** Course slug this plan unlocks (null for bundles / business). */
  courseSlug:      string | null
}

export const PLANS: Plan[] = [
  {
    id:                  'a0-a1',
    levelFrom:           'A0',
    levelTo:             'A1',
    title_ar:            'من الصفر إلى أول جملة',
    subtitle_ar:         'للمبتدئين الكاملين',
    amount_mad:          750,
    originalAmount:      1100,
    followUpLabel_ar:    'متابعة داخل مجموعة واتساب',
    followUpDuration_ar: '6 أسابيع',
    duration_months:     3,
    lifetimePerks: [
      'الكتاب مجاناً',
      'الدروس المسجلة — وصول مدى الحياة',
      'مجموعة واتساب للطلاب',
    ],
    monthlyPerks: [
      'لايفات مجانية (مفتوحة للجميع)',
    ],
    color:      'emerald',
    courseSlug: 'a0-a1',
  },
  {
    id:                  'a1-a2',
    levelFrom:           'A1',
    levelTo:             'A2',
    title_ar:            'من الجملة إلى المحادثة',
    subtitle_ar:         'المستوى الأساسي',
    amount_mad:          1400,
    originalAmount:      1900,
    followUpLabel_ar:    'متابعة أسبوعية',
    followUpDuration_ar: '8 أسابيع',
    duration_months:     3,
    lifetimePerks: [
      'الكتاب مجاناً',
      'الدروس المسجلة — وصول مدى الحياة',
    ],
    monthlyPerks: [
      'لايف واحد شهرياً للمشتركين فقط',
      'متابعة أسبوعية من الأستاذ',
    ],
    color:      'blue',
    courseSlug: 'a1-a2',
  },
  {
    id:                  'a2-b1',
    levelFrom:           'A2',
    levelTo:             'B1',
    title_ar:            'من المحادثة إلى الطلاقة',
    subtitle_ar:         'ما فوق المتوسط',
    amount_mad:          1800,
    originalAmount:      2400,
    followUpLabel_ar:    'متابعة شخصية',
    followUpDuration_ar: '10 أسابيع',
    duration_months:     3,
    lifetimePerks: [
      'الكتاب مجاناً',
      'الدروس المسجلة — وصول مدى الحياة',
    ],
    monthlyPerks: [
      'متابعة شخصية من الأستاذ',
    ],
    highlight:  true,
    badge_ar:   'الأفضل قيمة',
    color:      'violet',
    courseSlug: 'a2-b1',
  },
  {
    id:                  'b1-b2',
    levelFrom:           'B1',
    levelTo:             'B2',
    title_ar:            'من الطلاقة إلى الاحتراف',
    subtitle_ar:         'المستوى المتقدم',
    amount_mad:          3000,
    originalAmount:      3900,
    followUpLabel_ar:    'متابعة شخصية + لايفات',
    followUpDuration_ar: '12 أسبوعاً',
    duration_months:     4,
    lifetimePerks: [
      'الكتاب مجاناً',
      'الدروس المسجلة — وصول مدى الحياة',
    ],
    monthlyPerks: [
      'متابعة شخصية من الأستاذ',
      'لايفان شهرياً للمشتركين',
    ],
    color:      'orange',
    courseSlug: 'b1-b2',
  },
  {
    id:                  'a0-b2-full',
    levelFrom:           'A0',
    levelTo:             'B2',
    title_ar:            'الباقة الكاملة — من الصفر إلى الاحتراف',
    subtitle_ar:         'مسار شامل A0 → B2',
    amount_mad:          5000,
    originalAmount:      7000,
    followUpLabel_ar:    '1:1 متابعة + كوتشينغ',
    followUpDuration_ar: '9 أشهر',
    duration_months:     12,
    lifetimePerks: [
      'كل الكتب مجاناً',
      'جميع الدروس المسجلة (A0 → B2) — وصول مدى الحياة',
    ],
    monthlyPerks: [
      '3 لايفات شهرياً للمشتركين',
      'كوتشينغ 1:1 مع الأستاذ',
      'متابعة شخصية 1:1',
    ],
    isPremium:  true,
    badge_ar:   'الأكثر شمولاً',
    color:      'amber',
    courseSlug: null,
  },
  {
    id:                  'business',
    levelFrom:           null,
    levelTo:             null,
    title_ar:            'الإنجليزية للأعمال — حصص فردية',
    subtitle_ar:         'Business English 1:1',
    amount_mad:          400,
    isHourly:            true,
    minHoursPerMonth:    5,
    followUpLabel_ar:    'متابعة يومية + كوتشينغ 1:1',
    followUpDuration_ar: 'شهرياً (حسب اشتراكك)',
    duration_months:     1,
    lifetimePerks: [
      'الكتاب مجاناً',
      'الدروس الفيديو مجاناً',
    ],
    monthlyPerks: [
      'حصة فردية 1:30 إلى ساعتين',
      'العمل على أهدافك ونقاط ضعفك',
      'متابعة يومية من الأستاذ',
      'كوتشينغ 1:1',
      'حد أدنى 5 حصص شهرياً',
    ],
    isBusiness: true,
    badge_ar:   'فردي 1:1',
    color:      'slate',
    courseSlug: null,
  },
]

export function getPlan(id: string): Plan | undefined {
  return PLANS.find(p => p.id === id)
}

export function getPlanByCourseSlug(slug: string): Plan | undefined {
  return PLANS.find(p => p.courseSlug === slug)
}

export const BANK_DETAILS = {
  bank_name:      'Cih Bank',
  account_holder: 'El Qasraoui Hamza',
  account_number: '6183417211014000',
  rib:            '230411618341721101400092',
  swift:          'CIHAMAMC',
}

export const PAYMENT_WHATSAPP = '+212707902091'

/** Hard monthly seat cap — used for scarcity UI. */
export const MONTHLY_SEAT_LIMIT = 50
