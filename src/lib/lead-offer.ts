/**
 * Which offer a lead is about — one answer for every CRM screen.
 *
 * The forms store it in several places, and not all of them mean "the
 * visitor chose this":
 *   plan_id         the plan card they clicked, or the plan picked in the
 *                   form; 'website' when the general buttons (sticky CTA,
 *                   footer, WhatsApp bar) opened the form and none was picked
 *   plan_interest   the same choice (older rows sometimes only have this)
 *   source          'level-test' → the plan was the test's suggestion
 *   recommended_plan / level   what the test or the form said
 *   page_path       the page the form was sent from; /pricing/<id> tells
 *                   which offer they were reading even with no choice
 * Pure (plans come in through `planOf`) so the rules are unit-tested.
 */

export interface OfferPlan { title: string; amount: number; from: string | null; to: string | null }

export interface OfferLead {
  plan_id?: string | null
  plan_interest?: string | null
  course?: string | null
  source?: string | null
  lead_source?: string | null
  recommended_plan?: string | null
  level?: string | null
  page_path?: string | null
}

export type OfferState = 'chosen' | 'suggested' | 'none'

export interface LeadOffer {
  state: OfferState
  /** The offer's name, or «لم يختر عرضًا». */
  title: string
  /** "750 درهم · A0 → A1" when it is a known plan. */
  detail: string | null
  /** Why we think so / what else we know. */
  hint: string | null
  planId: string | null
}

const NO_PLAN = new Set(['', 'website', 'inquiry'])

/** The goal options of the subscribe form (components/SubscribeModal). */
export const GOAL_AR: Record<string, string> = {
  daily: 'محادثة يومية', work: 'العمل / المقابلات', travel: 'السفر', exam: 'IELTS / TOEFL', other: 'هدف آخر',
}

const COURSE_AR: Record<string, string> = {
  a0a1: 'مستوى A0 → A1', a1a2: 'مستوى A1 → A2', a2b1: 'مستوى A2 → B1', private: 'الدروس الخاصة',
}

const detailOf = (p: OfferPlan) =>
  [`${p.amount.toLocaleString('en-US')} درهم`, p.from && p.to ? `${p.from} → ${p.to}` : null].filter(Boolean).join(' · ')

/** The plan id in a /pricing/<id> path, if any. */
export function planIdFromPath(path: string | null | undefined): string | null {
  const m = path?.match(/^\/pricing\/([a-z0-9-]+)\/?$/i)
  return m ? m[1].toLowerCase() : null
}

export function leadOffer(l: OfferLead, planOf: (id: string) => OfferPlan | undefined): LeadOffer {
  const src = l.source ?? l.lead_source ?? ''
  const id = [l.plan_id, l.plan_interest].map(x => (x ?? '').trim()).find(x => !NO_PLAN.has(x)) ?? null
  const plan = id ? planOf(id) : undefined
  const levelHint = l.level ? `المستوى: ${l.level}` : null

  if (plan && id) {
    if (src === 'level-test') {
      return { state: 'suggested', title: plan.title, detail: detailOf(plan), planId: id,
        hint: `اقترحها اختبار المستوى${l.level ? ` (النتيجة ${l.level})` : ''} — تأكّد معه` }
    }
    return { state: 'chosen', title: plan.title, detail: detailOf(plan), planId: id, hint: levelHint }
  }
  if (l.course && COURSE_AR[l.course]) {
    return { state: 'chosen', title: COURSE_AR[l.course], detail: null, planId: null, hint: levelHint }
  }

  const seen = planIdFromPath(l.page_path)
  const seenPlan = seen ? planOf(seen) : undefined
  const rec = l.recommended_plan ? planOf(l.recommended_plan) : undefined
  const hints = [
    seenPlan ? `كان يقرأ صفحة «${seenPlan.title}»` : null,
    rec ? `الاختبار اقترح «${rec.title}»` : null,
    levelHint,
  ].filter(Boolean)
  return { state: 'none', title: 'لم يختر عرضًا', detail: null, planId: null, hint: hints.length ? hints.join(' · ') : null }
}
