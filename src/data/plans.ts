/**
 * Subscription tier plans — Free / Basic / Pro / Premium / VIP.
 *
 * Tiers are cumulative: each plan includes everything in the plan
 * below it, plus its own additional content and services.
 * `lifetimePerks` and `monthlyPerks` list ONLY what is NEW at this
 * tier — the view layer prepends an "everything in <previous> +" line
 * from `includesPrevious_ar`.
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
  /** Lifetime / one-time perks NEW at this tier. */
  lifetimePerks:   string[]
  /** Recurring perks NEW at this tier — lives, follow-up, coaching. */
  monthlyPerks:    string[]
  /** Short "ideal for …" line shown on pricing cards. */
  idealFor_ar?:    string
  /** Shown at the top of the feature list on higher tiers. */
  includesPrevious_ar?: string
  highlight?:      boolean
  isFree?:         boolean
  isPremium?:      boolean
  isBusiness?:     boolean
  badge_ar?:       string
  color:           PlanColor
  /** Course slug this plan unlocks (null for bundles / custom). */
  courseSlug:      string | null
}

export const PLANS: Plan[] = [
  {
    id:                  'free',
    levelFrom:           'A0',
    levelTo:             'A0',
    title_ar:            'الباقة المجانية',
    subtitle_ar:         'الوصول التمهيدي',
    amount_mad:          0,
    followUpLabel_ar:    'مجتمع الطلاب',
    followUpDuration_ar: 'وصول مفتوح',
    duration_months:     1,
    lifetimePerks: [
      'كلمات إنجليزية أساسية تُستخدم يومياً',
      'التحيات والتعريف بالنفس',
      'أساسيات زمن المضارع البسيط',
      'بناء جمل قصيرة صحيحة',
      'قواعد النطق الأساسية للمبتدئين',
      'الاستماع للإنجليزية البطيئة والواضحة',
      'تدريب على الثقة في المحادثة',
      'تمارين واختبارات يومية مصغرة',
      'مفردات السفر والعمل والحياة للمبتدئين',
      'خارطة طريق التعلم الأولى',
    ],
    monthlyPerks: [],
    idealFor_ar:  'مثالية للمبتدئين الكاملين الذين يريدون البدء بشكل صحيح.',
    isFree:       true,
    color:        'slate',
    courseSlug:   null,
  },
  {
    id:                  'basic',
    levelFrom:           'A1',
    levelTo:             'A2',
    title_ar:            'الباقة الأساسية',
    subtitle_ar:         'بناء قاعدة المبتدئين',
    amount_mad:          750,
    originalAmount:      1100,
    followUpLabel_ar:    'متابعة أسبوعية في مجموعة الطلاب',
    followUpDuration_ar: '8 أسابيع',
    duration_months:     3,
    includesPrevious_ar: 'كل ما في الباقة المجانية +',
    lifetimePerks: [
      'نظام قواعد شامل للمبتدئين (A1-A2)',
      'أنماط محادثة حقيقية للاستخدام اليومي',
      'توسيع المفردات عالية الاستخدام',
      'تمارين استماع مع شرح موجّه',
      'نظام تصحيح النطق',
      'قراءة نصوص بسيطة بثقة',
      'إتقان بناء الجُمَل',
      'الأخطاء الشائعة لدى المتعلمين العرب وكيفية تصحيحها',
      'دروس أسبوعية منظمة',
      'أوراق عمل وتمارين تطبيقية',
    ],
    monthlyPerks: [
      'لايف جماعي أسبوعي للمشتركين',
      'الرد على الأسئلة داخل مجموعة الواتساب',
    ],
    idealFor_ar: 'مثالية لمن يريد التحدث بشكل صحيح وبناء قاعدة قوية.',
    color:       'emerald',
    courseSlug:  'a1-a2',
  },
  {
    id:                  'pro',
    levelFrom:           'B1',
    levelTo:             'B2',
    title_ar:            'الباقة الاحترافية',
    subtitle_ar:         'التواصل بطلاقة',
    amount_mad:          1800,
    originalAmount:      2400,
    followUpLabel_ar:    'متابعة شخصية من الأستاذ',
    followUpDuration_ar: '12 أسبوعاً',
    duration_months:     4,
    highlight:           true,
    badge_ar:            'الأكثر طلباً',
    includesPrevious_ar: 'كل ما في الباقة الأساسية +',
    lifetimePerks: [
      'إتقان القواعد المتوسطة (B1-B2)',
      'تعبيرات إنجليزية منطوقة طبيعية',
      'تدريب على محادثات الحياة الواقعية',
      'طرق سريعة لفهم الاستماع',
      'اكتساب المفردات عبر القصص',
      'تمارين طلاقة المحادثة',
      'تقنيات تحسين اللهجة',
      'كتابة البريد الإلكتروني والتواصل المهني',
      'الثقة في المقابلات والاجتماعات',
    ],
    monthlyPerks: [
      'لايفان شهرياً للمشتركين فقط',
      'تحديات محادثة أسبوعية موجّهة',
      'تصحيح صوتي شخصي لتسجيلاتك',
    ],
    idealFor_ar: 'مثالية لمن يفهم الإنجليزية لكن يصارع التحدث بطلاقة.',
    color:       'blue',
    courseSlug:  'b1-b2',
  },
  {
    id:                  'premium',
    levelFrom:           'B2',
    levelTo:             'C1',
    title_ar:            'الباقة الممتازة',
    subtitle_ar:         'الإتقان المتقدم',
    amount_mad:          3000,
    originalAmount:      3900,
    followUpLabel_ar:    'متابعة شخصية + لايفات شهرية',
    followUpDuration_ar: '6 أشهر',
    duration_months:     6,
    isPremium:           true,
    badge_ar:            'الأفضل قيمة',
    includesPrevious_ar: 'كل ما في الباقة الاحترافية +',
    lifetimePerks: [
      'دقة القواعد المتقدمة (مستوى C1)',
      'استراتيجيات التحدث كالناطقين الأصليين',
      'مفردات متقدمة للأعمال والسفر',
      'مهارات النقاش والحوار',
      'إنجليزية العروض والخطابة العامة',
      'فهم استماع عالي المستوى',
      'نظام كتابة احترافي',
      'لغة الإقناع وسيكولوجية التواصل',
      'تلميع اللهجة وثقة الصوت',
      'خارطة طريق للطلاقة النخبوية',
    ],
    monthlyPerks: [
      '3 لايفات شهرية للمشتركين',
      'مراجعة كتابة شخصية أسبوعية',
      'جلسة تقييم تقدّم شهرية',
      'إطار عمل للتصحيح الشخصي',
    ],
    idealFor_ar: 'مثالية للمتعلمين الجادين الذين يريدون مهارات تواصل نخبوية.',
    color:       'violet',
    courseSlug:  null,
  },
  {
    id:                  'vip',
    levelFrom:           null,
    levelTo:             null,
    title_ar:            'باقة VIP',
    subtitle_ar:         'برنامج التحوّل الكامل',
    amount_mad:          5000,
    originalAmount:      7000,
    followUpLabel_ar:    'كوتشينغ 1:1 + متابعة يومية',
    followUpDuration_ar: '12 شهراً',
    duration_months:     12,
    isPremium:           true,
    badge_ar:            'الأكثر تحوّلاً',
    includesPrevious_ar: 'كل ما في الباقة الممتازة +',
    lifetimePerks: [
      'خارطة طريق تعلم مخصصة لك',
      'أهداف مخصصة: سفر / عمل / IELTS / أعمال',
      'استراتيجية مفردات شخصية',
      'محاكاة مواقف العالم الحقيقي',
      'دعم وإرشاد مميز مدى الحياة',
    ],
    monthlyPerks: [
      'حصة 1:1 أسبوعية مع الأستاذ',
      'كوتشينغ طلاقة عميق',
      'نظام تصحيح محادثة خاص',
      'تدريب نطق متقدم فردي',
      'إعادة برمجة الثقة للتغلب على رهبة التحدث',
      'متابعة يومية عبر واتساب',
      'أولوية في الرد خلال أقل من ساعة',
    ],
    idealFor_ar: 'مثالية لمن يريد أسرع تحوّل ممكن في الإنجليزية.',
    color:       'amber',
    courseSlug:  null,
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
