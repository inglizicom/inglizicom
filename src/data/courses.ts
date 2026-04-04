export interface CourseDetailFeature {
  icon: string
  title: string
  description: string
}

export interface Course {
  id: string
  slug: string
  fromLevel: string
  toLevel: string
  title: string
  subtitle: string
  hook: string
  description: string
  price: number
  originalPrice: number
  currency: string
  image: string
  badge: string
  isBestValue: boolean
  colorKey: 'emerald' | 'blue' | 'violet' | 'orange'
  features: string[]
  detailFeatures: CourseDetailFeature[]
  spotsLeft: number
  studentsCount: string
  rating: number
  weeks: number
  lessons: number
  promise: string
  beforeState: string
  afterState: string
}

const SHARED_DETAIL_FEATURES: CourseDetailFeature[] = [
  {
    icon: '🎥',
    title: 'دروس مسجلة',
    description: 'دروس مسجلة عالية الجودة تشاهدها في أي وقت ومن أي مكان دون أي قيود',
  },
  {
    icon: '🎤',
    title: 'تصحيح صوتي شخصي',
    description: 'سجّل صوتك وأرسله للأستاذ — يسمعك ويصحح نطقك بشكل شخصي وليس آلياً',
  },
  {
    icon: '💬',
    title: 'متابعة بعد كل درس',
    description: 'رد مباشر من الأستاذ بعد كل درس على كل أسئلتك واستفساراتك',
  },
  {
    icon: '📋',
    title: 'خطة واضحة ومحددة',
    description: 'خطوات عملية وواضحة بعد كل درس حتى تعرف دائماً ماذا تفعل بعد ذلك',
  },
  {
    icon: '🏆',
    title: 'اختبار LIVE نهائي',
    description: 'اختبار محادثة نهائي مباشر عبر Google Meet مع الأستاذ شخصياً لتقييم تقدمك',
  },
  {
    icon: '📱',
    title: 'مجموعة واتساب خاصة',
    description: 'قناة واتساب حصرية للطلاب للأسئلة والدعم المستمر على مدار الأسبوع',
  },
]

export const COURSES: Course[] = [
  {
    id: 'a0-a1',
    slug: 'a0-a1',
    fromLevel: 'A0',
    toLevel: 'A1',
    title: 'من الصفر إلى أول جملة',
    subtitle: 'للمبتدئين الكاملين',
    hook: 'ابدأ من الصفر تماماً وتكلم أول جملة كاملة في 6 أسابيع فقط',
    description:
      'مثالي لمن لم يتعلم الإنجليزية قط. ستتعلم الأساسيات الصحيحة من الصفر بدون تعقيد وتخرج قادراً على التعريف بنفسك والتواصل في المواقف اليومية البسيطة بثقة حقيقية.',
    price: 750,
    originalPrice: 1100,
    currency: 'درهم',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    badge: 'للمبتدئين',
    isBestValue: false,
    colorKey: 'emerald',
    features: [
      'الأبجدية والنطق الصحيح من الأساس',
      'التعريف بالنفس بثقة كاملة',
      '200+ كلمة من الحياة اليومية',
      'الجمل الأساسية للمحادثة',
      'تمارين صوتية مع تصحيح الأستاذ',
      'اختبار محادثة نهائي LIVE',
    ],
    detailFeatures: SHARED_DETAIL_FEATURES,
    spotsLeft: 5,
    studentsCount: '850+',
    rating: 4.9,
    weeks: 6,
    lessons: 24,
    promise: 'بعد هذا الكورس ستتكلم أول جملة كاملة بالإنجليزية بثقة تامة',
    beforeState: 'لا أعرف كيف أقول حتى "مرحبا" بالإنجليزية بشكل صحيح',
    afterState: 'أتعرف بنفسي وأتحدث في المواقف اليومية بثقة وسلاسة',
  },
  {
    id: 'a1-a2',
    slug: 'a1-a2',
    fromLevel: 'A1',
    toLevel: 'A2',
    title: 'من الجملة إلى المحادثة',
    subtitle: 'المستوى الأساسي',
    hook: 'حوّل جملتك الأولى إلى محادثة يومية حقيقية ومستمرة',
    description:
      'إذا كنت تعرف بعض الأساسيات لكن لا تستطيع المحادثة بطلاقة، هذا الكورس يأخذك خطوة أعمق ويعلمك كيف تتحدث في مواقف يومية متنوعة دون توقف أو تردد.',
    price: 950,
    originalPrice: 1400,
    currency: 'درهم',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
    badge: 'الأكثر طلباً',
    isBestValue: false,
    colorKey: 'blue',
    features: [
      'محادثات يومية متنوعة بثقة',
      'الأزمنة الأساسية: ماضي، حاضر، مستقبل',
      '500+ مفردة عملية ومفيدة',
      'التعبير عن الرأي والمشاعر',
      'مراجعة أسبوعية للنطق',
      'اختبار محادثة نهائي LIVE',
    ],
    detailFeatures: SHARED_DETAIL_FEATURES,
    spotsLeft: 3,
    studentsCount: '1200+',
    rating: 5.0,
    weeks: 8,
    lessons: 32,
    promise: 'ستتمكن من إجراء محادثة يومية كاملة بالإنجليزية دون توقف',
    beforeState: 'أعرف بعض الكلمات لكن لا أستطيع تكوين جملة كاملة بسهولة',
    afterState: 'أجري محادثات يومية متنوعة بثقة تامة وأعبر عن نفسي بوضوح',
  },
  {
    id: 'a2-b1',
    slug: 'a2-b1',
    fromLevel: 'A2',
    toLevel: 'B1',
    title: 'من المحادثة إلى الطلاقة',
    subtitle: 'مستوى ما فوق المتوسط',
    hook: 'تكلم الإنجليزية بطلاقة حقيقية وتوقف عن الترجمة في رأسك',
    description:
      'مرحلة التحول الحقيقية. هنا تنتقل من "أعرف الإنجليزية" إلى "أتكلم الإنجليزية". ستتوقف عن الترجمة في ذهنك وتبدأ التفكير مباشرة بالإنجليزية بطريقة طبيعية وعفوية.',
    price: 1200,
    originalPrice: 1800,
    currency: 'درهم',
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80',
    badge: '✨ الأفضل قيمة',
    isBestValue: true,
    colorKey: 'violet',
    features: [
      'التفكير مباشرة بالإنجليزية',
      'محادثات معقدة ومتنوعة',
      'الفروق الدقيقة في اللغة',
      '1000+ مفردة متقدمة',
      'تصحيح الأخطاء الشائعة جذرياً',
      'اختبار محادثة نهائي LIVE',
    ],
    detailFeatures: SHARED_DETAIL_FEATURES,
    spotsLeft: 2,
    studentsCount: '600+',
    rating: 4.9,
    weeks: 10,
    lessons: 40,
    promise: 'ستتكلم الإنجليزية بطلاقة دون التوقف للتفكير في الترجمة',
    beforeState: 'أتكلم ببطء وأترجم كل كلمة في رأسي قبل أن أقولها',
    afterState: 'أتكلم بطلاقة تامة وأفكر مباشرة بالإنجليزية دون أي توقف',
  },
  {
    id: 'b1-b2',
    slug: 'b1-b2',
    fromLevel: 'B1',
    toLevel: 'B2',
    title: 'من الطلاقة إلى الاحتراف',
    subtitle: 'المستوى المتقدم',
    hook: 'تحدث كالمحترفين في العمل والمقابلات والسفر الدولي',
    description:
      'للذين يريدون الوصول إلى المستوى الاحترافي الكامل. تعلم الإنجليزية التجارية والمهنية وعبّر عن أفكار معقدة بدقة وأناقة تُبهر من حولك.',
    price: 1500,
    originalPrice: 2200,
    currency: 'درهم',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80',
    badge: 'للمحترفين',
    isBestValue: false,
    colorKey: 'orange',
    features: [
      'الإنجليزية التجارية والمهنية',
      'مقابلات العمل بثقة واحتراف',
      'الكتابة الاحترافية الرسمية',
      'محادثات عالية المستوى',
      'لهجة وأسلوب المتحدثين الأصليين',
      'اختبار محادثة نهائي LIVE',
    ],
    detailFeatures: SHARED_DETAIL_FEATURES,
    spotsLeft: 4,
    studentsCount: '400+',
    rating: 4.8,
    weeks: 12,
    lessons: 48,
    promise: 'ستصبح قادراً على العمل والتواصل باحترافية كاملة بالإنجليزية',
    beforeState: 'أتكلم بطلاقة لكن أفشل في المواقف الاحترافية والمهنية',
    afterState: 'أتحدث باحتراف كامل في العمل والمقابلات والمؤتمرات الدولية',
  },
]
