import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PLANS, getPlan } from '@/data/plans'
import { getPlanPage } from '@/data/plan-pages'
import PlanPageClient from './PlanPageClient'

/* Every plan in data/plans.ts gets its own static page — add a plan there and
   its landing page, metadata and structured data appear with zero extra work. */
export function generateStaticParams() {
  return PLANS.map(p => ({ plan: p.id }))
}

export const dynamicParams = false

export function generateMetadata({ params }: { params: { plan: string } }): Metadata {
  const plan = getPlan(params.plan)
  if (!plan) return {}

  const page  = getPlanPage(plan)
  const level = plan.levelFrom && plan.levelTo ? ` (${plan.levelFrom} → ${plan.levelTo})` : ''
  const title = `${plan.title_ar}${level} — ${plan.amount_mad.toLocaleString()} درهم`
  const url   = `https://inglizi.com/pricing/${plan.id}`

  return {
    title,
    description: `${page.promise_ar} ${plan.subtitle_ar}. متابعة شخصية مع الأستاذ حمزة القصراوي وضمان الأسبوع الأول.`,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: page.promise_ar,
      url,
      type: 'website',
      locale: 'ar_MA',
      siteName: 'Inglizi.com',
    },
  }
}

export default function PlanDetailPage({ params }: { params: { plan: string } }) {
  const plan = getPlan(params.plan)
  if (!plan) notFound()

  const page = getPlanPage(plan)

  /* Product + FAQ structured data — this is what makes the price and the
     answers show up directly in Arabic Google results. */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: plan.title_ar,
        description: page.promise_ar,
        brand: { '@type': 'Brand', name: 'Inglizi.com' },
        offers: {
          '@type': 'Offer',
          price: plan.amount_mad,
          priceCurrency: 'MAD',
          availability: 'https://schema.org/InStock',
          url: `https://inglizi.com/pricing/${plan.id}`,
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.objections.map(o => ({
          '@type': 'Question',
          name: o.q,
          acceptedAnswer: { '@type': 'Answer', text: o.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'الأسعار', item: 'https://inglizi.com/pricing' },
          { '@type': 'ListItem', position: 2, name: plan.title_ar, item: `https://inglizi.com/pricing/${plan.id}` },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PlanPageClient plan={plan} page={page} />
    </>
  )
}
