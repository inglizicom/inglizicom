/**
 * Promotional course catalogue — the FULL line-up of Inglizi.com courses, shown to
 * every student in the course-picker (and re-usable on /pricing). Courses the
 * student is actually enrolled in come from the LMS (real, open, scoped portal);
 * everything here is the rest of the catalogue so students discover that we cover
 * many levels and goals — most locked behind a price, a couple "coming soon".
 *
 * Prices (and the struck-through "before" price + discount %) are pulled from
 * `plans.ts` (single source of truth) so they never drift. `match()` dedupes a
 * promo card against a course the student already has open.
 */
import { getPlan, MONTHLY_SEAT_LIMIT } from './plans'

export type PromoStatus = 'locked' | 'soon' | 'info'

interface RawPromo {
  key:      string
  title:    string
  level:    string | null
  blurb:    string
  status:   PromoStatus
  planId?:  string          // → pulls price / original / discount from plans.ts (locked cards)
  priceText?: string        // explicit label when there's no single plan (info card)
  badge:    string | null
  href?:    string
  waText?:  string
  perks?:   string[]
  match:    (c: { title?: string | null; level?: string | null }) => boolean
}

export interface PromoCourse extends RawPromo {
  priceLabel:    string | null   // discounted / current price, e.g. '٧٥٠ درهم'
  origPriceLabel: string | null  // struck-through "before" price, or null
  discountPct:   number | null   // e.g. 32  → "وفّر 32%"
}

const mad = (n: number) => `${n.toLocaleString('ar-MA')} درهم`
const lvl = (c: { title?: string | null; level?: string | null }) =>
  `${c.level ?? ''} ${c.title ?? ''}`.toUpperCase().replace(/\s+/g, '')

const RAW: RawPromo[] = [
  {
    key: 'a0a1', title: 'المستوى الأول', level: 'A0 → A1',
    blurb: 'من الصمت إلى أول محادثة — تتكلم بثقة من أول يوم.',
    status: 'locked', planId: 'basic', badge: 'متاحة الآن',
    waText: 'أرغب بالاشتراك في «المستوى الأول A0 → A1».',
    match: c => /A0-?A1|A0A1/.test(lvl(c)),
  },
  {
    key: 'a1a2', title: 'المستوى الثاني', level: 'A1 → A2',
    blurb: 'من الكلمة إلى المحادثة الكاملة في كل مواقف الحياة.',
    status: 'locked', planId: 'pro', badge: 'جديدة',
    waText: 'أرغب بالاشتراك في «المستوى الثاني A1 → A2».',
    match: c => /A1-?A2|A1A2/.test(lvl(c)),
  },
  {
    key: 'a2b1', title: 'المستوى الثالث', level: 'A2 → B1',
    blurb: 'تبني جملك بنفسك وتعبّر عن أفكارك بطلاقة متزايدة.',
    status: 'soon', badge: 'قريباً',
    match: c => /A2-?B1|A2B1/.test(lvl(c)),
  },
  {
    key: 'b1b2', title: 'المستوى الرابع', level: 'B1 → B2',
    blurb: 'من المحادثة إلى الطلاقة — تفهم بدون ترجمة في رأسك.',
    status: 'locked', planId: 'premium', badge: null,
    waText: 'أرغب بالاشتراك في «المستوى الرابع B1 → B2».',
    match: c => /B1-?B2|B1B2/.test(lvl(c)),
  },
  {
    key: 'business', title: 'الإنجليزية المهنية', level: 'Business',
    blurb: 'تكلّم وأقنع في الاجتماعات والمكالمات والعروض المهنية.',
    status: 'locked', planId: 'business', badge: null,
    waText: 'أرغب بالاشتراك في دورة «الإنجليزية المهنية».',
    match: c => /BUSINESS|المهني|الأعمال/.test(lvl(c)),
  },
  {
    key: 'travel', title: 'إنجليزية السفر', level: 'Travel',
    blurb: 'كل ما تحتاجه للمطار والفندق والتنقّل والمطاعم بثقة.',
    status: 'soon', badge: 'قريباً',
    match: c => /TRAVEL|السفر|سفر|سياح/.test(lvl(c)),
  },
  {
    key: 'individual', title: 'الحصص الفردية', level: '1:1 مع الأستاذ',
    blurb: 'تعلّم مخصّص لك تمامًا — بإيقاعك وهدفك.',
    status: 'info', priceText: 'من 400 درهم / حصة', badge: null,
    href: '/pricing',
    perks: ['دروس مخصّصة لمستواك وهدفك', 'توقيت مرن يناسبك', 'تحسّن سريع وملموس', 'تصحيح فوري ومباشر مع الأستاذ'],
    match: () => false,   // never an enrolled "course" — always shown as a discover card
  },
]

export const PROMO_CATALOG: PromoCourse[] = RAW.map(r => {
  const p = r.planId ? getPlan(r.planId) : undefined
  const priceLabel = r.priceText ?? (p ? mad(p.amount_mad) : null)
  const hasDisc = !!(p && p.originalAmount && p.originalAmount > p.amount_mad)
  return {
    ...r,
    priceLabel,
    origPriceLabel: hasDisc ? mad(p!.originalAmount!) : null,
    discountPct: hasDisc ? Math.round((1 - p!.amount_mad / p!.originalAmount!) * 100) : null,
  }
})

/** Biggest discount across the locked courses — drives the "وفّر حتى X%" banner. */
export const MAX_DISCOUNT_PCT = Math.max(0, ...PROMO_CATALOG.map(p => p.discountPct ?? 0))

/** A believable, deterministic "seats left at this price" that slowly declines
 *  through the month (resets at month start). Stable within a day so it never
 *  flickers, capped low for scarcity. */
export function seatsLeftThisMonth(): number {
  const day = new Date().getDate()
  const start = Math.min(12, Math.round(MONTHLY_SEAT_LIMIT / 4))
  return Math.max(3, start - Math.floor((day - 1) / 3))
}
