/**
 * Promotional course catalogue — the FULL line-up of Inglizi.com courses, shown to
 * every student in the course-picker (and re-usable on /pricing). Courses the
 * student is actually enrolled in come from the LMS (real, open, scoped portal);
 * everything here is the rest of the catalogue so students discover that we cover
 * many levels and goals — most locked behind a price, a couple "coming soon".
 *
 * Prices are pulled from `plans.ts` (single source of truth) so they never drift.
 * `match()` dedupes a promo card against a course the student already has open.
 */
import { getPlan } from './plans'

export type PromoStatus = 'locked' | 'soon' | 'info'

export interface PromoCourse {
  key:        string          // course-theme palette key (drives its colour)
  title:      string          // Arabic title
  level:      string | null   // CEFR badge text, e.g. 'A2 → B1'
  blurb:      string          // one line: what you learn here
  status:     PromoStatus     // locked = subscribe · soon = coming soon · info = open discover card
  priceLabel: string | null   // e.g. '٣٬٠٠٠ درهم' — null for soon/info
  badge:      string | null   // small corner tag, e.g. 'جديدة' / 'قريباً'
  href?:      string          // info card → internal link
  waText?:    string          // locked card → WhatsApp subscribe message
  perks?:     string[]        // info card bullet points
  /** True when an enrolled (already-open) course represents this same card. */
  match:      (c: { title?: string | null; level?: string | null }) => boolean
}

const mad = (n: number) => `${n.toLocaleString('ar-MA')} درهم`
const price = (id: string) => { const p = getPlan(id); return p ? mad(p.amount_mad) : null }
const lvl = (c: { title?: string | null; level?: string | null }) =>
  `${c.level ?? ''} ${c.title ?? ''}`.toUpperCase().replace(/\s+/g, '')

export const PROMO_CATALOG: PromoCourse[] = [
  {
    key: 'a0a1', title: 'المستوى الأول', level: 'A0 → A1',
    blurb: 'من الصمت إلى أول محادثة — تتكلم بثقة من أول يوم.',
    status: 'locked', priceLabel: price('basic'), badge: 'متاحة الآن',
    waText: 'أرغب بالاشتراك في «المستوى الأول A0 → A1».',
    match: c => /A0-?A1|A0A1/.test(lvl(c)),
  },
  {
    key: 'a1a2', title: 'المستوى الثاني', level: 'A1 → A2',
    blurb: 'من الكلمة إلى المحادثة الكاملة في كل مواقف الحياة.',
    status: 'locked', priceLabel: price('pro'), badge: 'جديدة',
    waText: 'أرغب بالاشتراك في «المستوى الثاني A1 → A2».',
    match: c => /A1-?A2|A1A2/.test(lvl(c)),
  },
  {
    key: 'a2b1', title: 'المستوى الثالث', level: 'A2 → B1',
    blurb: 'تبني جملك بنفسك وتعبّر عن أفكارك بطلاقة متزايدة.',
    status: 'soon', priceLabel: null, badge: 'قريباً',
    match: c => /A2-?B1|A2B1/.test(lvl(c)),
  },
  {
    key: 'b1b2', title: 'المستوى الرابع', level: 'B1 → B2',
    blurb: 'من المحادثة إلى الطلاقة — تفهم بدون ترجمة في رأسك.',
    status: 'locked', priceLabel: price('premium'), badge: null,
    waText: 'أرغب بالاشتراك في «المستوى الرابع B1 → B2».',
    match: c => /B1-?B2|B1B2/.test(lvl(c)),
  },
  {
    key: 'business', title: 'الإنجليزية المهنية', level: 'Business',
    blurb: 'تكلّم وأقنع في الاجتماعات والمكالمات والعروض المهنية.',
    status: 'locked', priceLabel: price('business'), badge: null,
    waText: 'أرغب بالاشتراك في دورة «الإنجليزية المهنية».',
    match: c => /BUSINESS|المهني|الأعمال/.test(lvl(c)),
  },
  {
    key: 'travel', title: 'إنجليزية السفر', level: 'Travel',
    blurb: 'كل ما تحتاجه للمطار والفندق والتنقّل والمطاعم بثقة.',
    status: 'soon', priceLabel: null, badge: 'قريباً',
    match: c => /TRAVEL|السفر|سفر|سياح/.test(lvl(c)),
  },
  {
    key: 'individual', title: 'الحصص الفردية', level: '1:1 مع الأستاذ',
    blurb: 'تعلّم مخصّص لك تمامًا — بإيقاعك وهدفك.',
    status: 'info', priceLabel: 'من 400 درهم / حصة', badge: null,
    href: '/pricing',
    perks: ['دروس مخصّصة لمستواك وهدفك', 'توقيت مرن يناسبك', 'تحسّن سريع وملموس', 'تصحيح فوري ومباشر مع الأستاذ'],
    match: () => false,   // never an enrolled "course" — always shown as a discover card
  },
]
