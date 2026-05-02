/**
 * Pricing plans — Individual levels + Packs + Business English.
 * Psychology: transformation, speaking from day 1, pronunciation = confidence,
 * facing fear. No grammar mentioned anywhere.
 */

export type PlanColor =
  | 'emerald' | 'blue' | 'violet' | 'orange' | 'amber' | 'slate' | 'rose' | 'cyan'

export interface Plan {
  id:              string
  levelFrom:       string | null
  levelTo:         string | null
  title_ar:        string
  subtitle_ar:     string
  amount_mad:      number
  originalAmount?: number
  levelsIncluded?: number
  sessionsIncluded?: number
  sessionDuration?:  string
  pricePerSession?:  number
  isPack?:           boolean
  isBusiness?:       boolean
  isClass?:          boolean
  isHourly?:         boolean
  minHoursPerMonth?: number
  followUpLabel_ar:    string
  followUpDuration_ar: string
  duration_months:     number
  lifetimePerks:       string[]
  monthlyPerks:        string[]
  idealFor_ar?:        string
  includesPrevious_ar?: string
  highlight?:      boolean
  isPremium?:      boolean
  badge_ar?:       string
  color:           PlanColor
  courseSlug:      string | null
}

// ─── Individual levels ─────────────────────────────────────────────────────────

const INDIVIDUAL: Plan[] = [
  {
    id:                  'basic',
    levelFrom:           'A0',
    levelTo:             'A1',
    title_ar:            'المستوى الأول',
    subtitle_ar:         'من الصمت إلى أول كلمة',
    amount_mad:          750,
    originalAmount:      1100,
    followUpLabel_ar:    'متابعة في مجموعة الطلاب',
    followUpDuration_ar: '6 أسابيع',
    duration_months:     3,
    lifetimePerks: [
      'تتكلم إنجليزي من أول يوم — بلا خوف',
      'نطق صحيح من البداية حرف بحرف',
      'تتجاوز رهبة اللغة الإنجليزية للأبد',
      'تعرّف بنفسك بثقة دون تردد',
      'أكثر من 500 كلمة تستخدمها يومياً',
      'محادثات حقيقية من أول أسبوع',
      'تفهم ما يقوله الناس وتردّ بشكل طبيعي',
      'تدريب مكثف على النطق والإيقاع',
      'الثقة في التحدث مع أشخاص جدد',
      'خارطة طريقك الأولى نحو الطلاقة',
    ],
    monthlyPerks: [
      'مجموعة واتساب للممارسة اليومية',
      'لايف جماعي مفتوح شهرياً',
    ],
    idealFor_ar: 'لمن لم يتكلم كلمة إنجليزية واحدة في حياته — هنا تبدأ رحلتك.',
    color:       'emerald',
    courseSlug:  'a0-a1',
  },
  {
    id:                  'pro',
    levelFrom:           'A1',
    levelTo:             'A2',
    title_ar:            'المستوى الثاني',
    subtitle_ar:         'من الكلمة إلى المحادثة',
    amount_mad:          1400,
    originalAmount:      1900,
    followUpLabel_ar:    'متابعة أسبوعية من الأستاذ',
    followUpDuration_ar: '8 أسابيع',
    duration_months:     3,
    highlight:           true,
    badge_ar:            'الأكثر طلباً',
    includesPrevious_ar: 'كل ما في المستوى الأول +',
    lifetimePerks: [
      'تتحدث عن نفسك وحياتك بسلاسة',
      'نطق طبيعي — تُفهم في أول مرة',
      'محادثات كاملة: سفر، عمل، سوق، صداقة',
      'تفهم بسرعة دون توقف أو تردد',
      'عبارات يستخدمها الناطقون الأصليون',
      'أكثر من 1000 كلمة للمواقف الحياتية',
      'تصحيح النطق عبر التسجيلات الصوتية',
      'تتحدث بثقة حتى مع الأخطاء',
      'تعبّر عن مشاعرك وآرائك بالإنجليزية',
    ],
    monthlyPerks: [
      'لايف أسبوعي للمشتركين فقط',
      'متابعة شخصية أسبوعية من الأستاذ',
      'تصحيح صوتي لتسجيلاتك',
    ],
    idealFor_ar: 'لمن بدأ وعنده كلمات متفرقة — لكن يريد يتكلم بجمل كاملة بثقة.',
    color:       'blue',
    courseSlug:  'a1-a2',
  },
  {
    id:                  'premium',
    levelFrom:           'B1',
    levelTo:             'B2',
    title_ar:            'المستوى الثالث',
    subtitle_ar:         'من المحادثة إلى الطلاقة',
    amount_mad:          3000,
    originalAmount:      3900,
    followUpLabel_ar:    'كوتشينغ شخصي + لايفات شهرية',
    followUpDuration_ar: '12 أسبوعاً',
    duration_months:     4,
    isPremium:           true,
    badge_ar:            'الأفضل قيمة',
    includesPrevious_ar: 'كل ما في المستوى الثاني +',
    lifetimePerks: [
      'تتحدث بطلاقة في أي موضوع',
      'نطق يشبه الناطقين الأصليين',
      'تفهم أفلام ومحادثات بدون ترجمة',
      'الفهم التلقائي — بدون ترجمة في رأسك',
      'مفردات السفر والأعمال والتقنية',
      'تعبّر عن أفكار معقدة بوضوح وطلاقة',
      'تتفاوض وتقنع بالإنجليزية',
      'الثقة الكاملة في أي موقف إنجليزي',
      'محاكاة مواقف الحياة الحقيقية',
    ],
    monthlyPerks: [
      '3 لايفات شهرية للمشتركين',
      'جلسة تقييم تقدّم شخصية كل شهر',
      'تحديات محادثة أسبوعية موجّهة',
      'مراجعة تسجيلاتك الصوتية',
    ],
    idealFor_ar: 'لمن يفهم الإنجليزية ويريد يتكلم بطلاقة طبيعية دون تفكير.',
    color:       'violet',
    courseSlug:  'b1-b2',
  },
  {
    id:                  'vip',
    levelFrom:           'A0',
    levelTo:             'B2',
    title_ar:            'باقة VIP',
    subtitle_ar:         'تحوّل كامل مع الأستاذ',
    amount_mad:          5000,
    originalAmount:      7000,
    followUpLabel_ar:    'كوتشينغ 1:1 + متابعة يومية',
    followUpDuration_ar: '9 أشهر',
    duration_months:     12,
    isPremium:           true,
    badge_ar:            'الأسرع تحوّلاً',
    includesPrevious_ar: 'كل المستويات الثلاثة +',
    lifetimePerks: [
      'المسيرة الكاملة من الصفر إلى الطلاقة',
      'برنامج تحوّل شخصي مصمم لك',
      'نطق متقدم وتدريب على الإيقاع الطبيعي',
      'إعادة برمجة علاقتك مع الإنجليزية',
      'نهاية نهائية لرهبة التحدث',
      'محاكاة مقابلات، سفر، أعمال، صداقات',
      'وصول كامل لجميع الكورسات A0 → B2',
      'أولوية في الرد خلال ساعة واحدة',
    ],
    monthlyPerks: [
      'حصة خاصة 1:1 أسبوعياً مع الأستاذ',
      'كوتشينغ طلاقة عميق',
      'تدريب نطق متقدم فردي',
      'متابعة يومية عبر واتساب',
    ],
    idealFor_ar: 'لمن يريد أسرع وأعمق تحوّل في الإنجليزية — مع الأستاذ شخصياً.',
    color:       'amber',
    courseSlug:  null,
  },
]

// ─── Packs ─────────────────────────────────────────────────────────────────────

const PACKS: Plan[] = [
  {
    id:                  'pack-starter',
    levelFrom:           'A0',
    levelTo:             'A2',
    title_ar:            'باك المستويين',
    subtitle_ar:         'من الصفر إلى محادثة حقيقية',
    amount_mad:          1750,
    originalAmount:      2150,
    levelsIncluded:      2,
    isPack:              true,
    followUpLabel_ar:    'متابعة أسبوعية',
    followUpDuration_ar: '10 أسابيع',
    duration_months:     5,
    lifetimePerks: [
      'المستوى الأول كاملاً (A0 → A1)',
      'المستوى الثاني كاملاً (A1 → A2)',
      'تتكلم إنجليزي بثقة في 5 أشهر',
      'أكثر من 1500 كلمة للحياة اليومية',
      'نطق طبيعي تُفهم معه من أول مرة',
      'محادثات حقيقية من أول أسبوع',
      'تجاوز الخوف من الإنجليزية نهائياً',
    ],
    monthlyPerks: [
      'متابعة أسبوعية من الأستاذ',
      'مجموعة واتساب للممارسة',
      'تصحيح صوتي لتسجيلاتك',
    ],
    idealFor_ar: 'وفّر 400 درهم مقارنة بالشراء منفرداً — ورحلة متواصلة بدون انقطاع.',
    color:       'emerald',
    courseSlug:  null,
  },
  {
    id:                  'pack-intensif',
    levelFrom:           'A0',
    levelTo:             'B2',
    title_ar:            'باك المستويات الثلاثة',
    subtitle_ar:         'من الصفر إلى الطلاقة الكاملة',
    amount_mad:          3800,
    originalAmount:      5150,
    levelsIncluded:      3,
    isPack:              true,
    highlight:           true,
    badge_ar:            'الأوفر والأفضل',
    followUpLabel_ar:    'كوتشينغ أسبوعي + متابعة شخصية',
    followUpDuration_ar: '6 أشهر',
    duration_months:     7,
    lifetimePerks: [
      'المستويات الثلاثة كاملة: A0 → A1 → A2 → B2',
      'تتكلم بطلاقة في الحياة، السفر، والعمل',
      'نطق متقدم — يشبه الناطقين الأصليين',
      'أكثر من 3000 كلمة وتعبير',
      'الفهم التلقائي دون ترجمة في رأسك',
      'محاكاة مواقف حقيقية: مقابلات، سفر، صداقات',
      'تحوّل كامل في طريقة تفكيرك بالإنجليزية',
    ],
    monthlyPerks: [
      'لايف أسبوعي خاص للمشتركين',
      'كوتشينغ شخصي من الأستاذ',
      'تصحيح صوتي أسبوعي',
      'متابعة يومية في المجموعة',
    ],
    idealFor_ar: 'وفّر 1,350 درهم — وأنجز تحوّلك الكامل في رحلة واحدة متصلة.',
    color:       'violet',
    courseSlug:  null,
  },
  {
    id:                  'pack-complet',
    levelFrom:           'A0',
    levelTo:             'B2+',
    title_ar:            'باك كل المستويات + الأعمال',
    subtitle_ar:         'أقوى رحلة تحوّل — لا شيء ينقصك',
    amount_mad:          4800,
    originalAmount:      6650,
    levelsIncluded:      4,
    isPack:              true,
    isPremium:           true,
    badge_ar:            'الأشمل',
    followUpLabel_ar:    'كوتشينغ شامل + أولوية في الرد',
    followUpDuration_ar: '9 أشهر',
    duration_months:     9,
    lifetimePerks: [
      'المستويات الثلاثة + الإنجليزية المهنية',
      'تتكلم في الحياة اليومية والبيئة المهنية',
      'نطق احترافي يُبني الثقة والمصداقية',
      'مفردات الأعمال، السفر، التقنية',
      'التحدث في الاجتماعات والعروض والمكالمات',
      'الطلاقة في أي موقف — بدون خوف',
      'وصول كامل لجميع المحتوى الحالي والقادم',
    ],
    monthlyPerks: [
      'كوتشينغ شخصي أسبوعي',
      'أولوية في الرد خلال ساعة',
      'تدريب نطق مهني متقدم',
      'محاكاة مواقف أعمال حقيقية',
    ],
    idealFor_ar: 'وفّر 1,850 درهم — رحلتك الكاملة من الصفر إلى الاحتراف في مكان واحد.',
    color:       'amber',
    courseSlug:  null,
  },
]

// ─── Business English ─────────────────────────────────────────────────────────

const BUSINESS: Plan[] = [
  {
    id:                  'business',
    levelFrom:           null,
    levelTo:             null,
    title_ar:            'الإنجليزية المهنية',
    subtitle_ar:         'تكلّم — أقنع — ابهر في بيئة العمل',
    amount_mad:          3500,
    originalAmount:      4500,
    isBusiness:          true,
    followUpLabel_ar:    'تدريب مهني متقدم',
    followUpDuration_ar: '8 أسابيع',
    duration_months:     3,
    lifetimePerks: [
      'تفتح الاجتماعات وتديرها بالإنجليزية',
      'تعرّف بنفسك مهنياً دون تردد',
      'نطق يُبني ثقتك ومصداقيتك',
      'مفردات الأعمال، التقنية، والتفاوض',
      'تقديم العروض والأفكار بوضوح',
      'المكالمات والمؤتمرات الصوتية بسلاسة',
      'التواصل مع العملاء والشركاء الأجانب',
      'التعبير عن آرائك في الاجتماعات',
      'أسلوب تحدث يُلهم الثقة والاحترام',
    ],
    monthlyPerks: [
      'محاكاة اجتماعات ومكالمات حقيقية',
      'تسجيلات لتحسين نطقك المهني',
      'تصحيح شخصي من الأستاذ',
    ],
    idealFor_ar: 'للموظف أو صاحب العمل الذي يريد يتكلم إنجليزي بثقة في بيئة مهنية — لا كتابة، لا قواعد، فقط تواصل.',
    color:       'cyan',
    courseSlug:  null,
  },
]

// ─── Individual Classes ────────────────────────────────────────────────────────

// Base rate: 400 MAD / session (1h30). Packs reduce the effective per-session cost.
const CLASSES: Plan[] = [
  {
    id:                  'class-1',
    levelFrom:           null,
    levelTo:             null,
    title_ar:            'حصة واحدة',
    subtitle_ar:         'جرّب التجربة الشخصية',
    amount_mad:          400,
    pricePerSession:     400,
    sessionsIncluded:    1,
    sessionDuration:     '1h30',
    isClass:             true,
    followUpLabel_ar:    'حصة فردية مع الأستاذ',
    followUpDuration_ar: '1h30',
    duration_months:     1,
    lifetimePerks: [
      'حصة 1:1 مباشرة مع الأستاذ',
      'تشخيص مستواك الحقيقي',
      'تدريب مكثف على النطق والكلام',
      'خطة تعلّم مخصصة لك',
    ],
    monthlyPerks: [],
    idealFor_ar: 'لمن يريد يجرّب قبل ما يلتزم بباقة.',
    color:       'slate',
    courseSlug:  null,
  },
  {
    id:                  'class-4',
    levelFrom:           null,
    levelTo:             null,
    title_ar:            '4 حصص',
    subtitle_ar:         'أسرع طريقة لكسر الحاجز',
    amount_mad:          1400,
    originalAmount:      1600,
    pricePerSession:     400,
    sessionsIncluded:    4,
    sessionDuration:     '1h30',
    isClass:             true,
    followUpLabel_ar:    '4 حصص 1:1 مع الأستاذ',
    followUpDuration_ar: '1h30 / الحصة',
    duration_months:     1,
    lifetimePerks: [
      '4 حصص فردية 1:1 مع الأستاذ',
      'نطق وإيقاع من أول حصة',
      'تدريب مكثف على المحادثة',
      'تصحيح فوري وشخصي',
      'تقدّم ملموس في أسبوعين',
    ],
    monthlyPerks: [],
    idealFor_ar: '350 درهم / الحصة — وفّر 200 درهم مقارنة بالحصة الواحدة.',
    color:       'blue',
    courseSlug:  null,
  },
  {
    id:                  'class-8',
    levelFrom:           null,
    levelTo:             null,
    title_ar:            '8 حصص',
    subtitle_ar:         'تحوّل حقيقي في شهرين',
    amount_mad:          2600,
    originalAmount:      3200,
    pricePerSession:     400,
    sessionsIncluded:    8,
    sessionDuration:     '1h30',
    isClass:             true,
    highlight:           true,
    badge_ar:            'الأكثر طلباً',
    followUpLabel_ar:    '8 حصص 1:1 مع الأستاذ',
    followUpDuration_ar: '1h30 / الحصة',
    duration_months:     2,
    lifetimePerks: [
      '8 حصص فردية 1:1 مع الأستاذ',
      'نطق متقدم ومحادثة طبيعية',
      'برنامج مخصص لهدفك',
      'تصحيح فوري وشخصي لكل حصة',
      'ثقة حقيقية في التحدث',
      'متابعة بين الحصص عبر واتساب',
    ],
    monthlyPerks: [],
    idealFor_ar: '325 درهم / الحصة — وفّر 600 درهم. تحوّل ملموس في شهرين.',
    color:       'violet',
    courseSlug:  null,
  },
  {
    id:                  'class-12',
    levelFrom:           null,
    levelTo:             null,
    title_ar:            '12 حصة',
    subtitle_ar:         'الطلاقة في 3 أشهر',
    amount_mad:          3600,
    originalAmount:      4800,
    pricePerSession:     400,
    sessionsIncluded:    12,
    sessionDuration:     '1h30',
    isClass:             true,
    isPremium:           true,
    badge_ar:            'الأوفر',
    followUpLabel_ar:    '12 حصة 1:1 مع الأستاذ',
    followUpDuration_ar: '1h30 / الحصة',
    duration_months:     3,
    lifetimePerks: [
      '12 حصة فردية 1:1 مع الأستاذ',
      'مسار تعلّم كامل ومخصص',
      'نطق طبيعي يشبه الناطقين',
      'طلاقة في المحادثة اليومية',
      'تصحيح مباشر في كل حصة',
      'متابعة يومية عبر واتساب',
      'تقرير تقدّم كل شهر',
    ],
    monthlyPerks: [],
    idealFor_ar: 'وفّر 900 درهم — رحلتك الكاملة مع الأستاذ شخصياً.',
    color:       'amber',
    courseSlug:  null,
  },
]

// ─── Exports ───────────────────────────────────────────────────────────────────

export const PLANS: Plan[] = [...INDIVIDUAL, ...PACKS, ...BUSINESS, ...CLASSES]

export const INDIVIDUAL_PLANS = INDIVIDUAL
export const PACK_PLANS       = PACKS
export const BUSINESS_PLANS   = BUSINESS
export const CLASS_PLANS      = CLASSES

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
