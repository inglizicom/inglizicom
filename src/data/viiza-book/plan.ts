import type { Part } from './types.ts'

/**
 * The journey: six parts, in the order a traveller lives them. The parts are
 * the stations of the route line drawn on every stop's opener, so a reader
 * always sees where they are in the trip; each opens on a divider page with
 * its own short introduction.
 */
export const PARTS: Part[] = [
  { n: 1, titleEn: 'Plan & book', titleAr: 'خطّط واحجز', icon: 'ClipboardList',
    intro: 'كل رحلة ناجحة تبدأ في البيت: الوثائق، والتأشيرة، والحجز، والمال، والحقيبة. في هذا الجزء تتعلّم إنجليزية الاستمارات والتطبيقات والمواعيد، قبل أن تغادر.' },
  { n: 2, titleEn: 'Departure day', titleAr: 'يوم السفر', icon: 'PlaneTakeoff',
    intro: 'من باب البيت إلى باب الطائرة: سيارة الأجرة، والتسجيل، والتفتيش، والشاشات، والصعود، وماذا تفعل إن تأخّرت رحلتك أو أُلغيت.' },
  { n: 3, titleEn: 'In the air', titleAr: 'في الجوّ', icon: 'Plane',
    intro: 'ساعات في السماء: مقعدك، ووجبتك، وطاقم الضيافة، وصحتك، ثم التوقف في مطار وسيط قبل رحلتك التالية.' },
  { n: 4, titleEn: 'Arrival', titleAr: 'الوصول', icon: 'PlaneLanding',
    intro: 'أول ساعة في بلد جديد: شرطة الحدود، والحقائب، والجمارك، والشريحة، والمال، والطريق من المطار إلى المدينة.' },
  { n: 5, titleEn: 'Your stay', titleAr: 'إقامتك', icon: 'Hotel',
    intro: 'أيام الرحلة: الفندق، والأكل، والتسوّق، والتنقّل، والناس، والصلاة، والصحة، والطوارئ. كل ما تعيشه هناك، يومًا بيوم.' },
  { n: 6, titleEn: 'Going home', titleAr: 'العودة', icon: 'House',
    intro: 'نهاية الرحلة: المغادرة، واسترجاع الضريبة، والوداع، والعودة إلى البيت بذكريات جميلة وإنجليزية أقوى.' },
]

/** When the book's facts were last checked (the title page and the welcome page print it). */
export const CHECKED = { en: 'October 2026', ar: 'أكتوبر 2026' }
