import type { Metadata } from 'next'
import CoursesClient from './CoursesClient'
import { COURSES } from '@/data/courses'
import { getPlanByCourseSlug } from '@/data/plans'

export const metadata: Metadata = {
  title: 'الكورسات | إنجليزي — تعلم الإنجليزية بطريقة ذكية',
  description:
    'كورسات إنجليزية متدرجة من A0 إلى B2 مع متابعة شخصية وتصحيح صوتي واختبار محادثة LIVE. اختر مستواك وابدأ رحلتك اليوم.',
  alternates: { canonical: 'https://inglizi.com/courses' },
}

/* One Course entry per level so each shows up in Arabic search with its own
   price and provider, instead of the page ranking as a single generic result. */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: COURSES.map((c, i) => {
    const plan = getPlanByCourseSlug(c.slug)
    return {
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Course',
        name: `${c.title} (${c.fromLevel} → ${c.toLevel})`,
        description: c.hook,
        url: `https://inglizi.com/courses/${c.slug}`,
        inLanguage: 'ar',
        provider: {
          '@type': 'Organization',
          name: 'Inglizi.com',
          sameAs: 'https://inglizi.com',
        },
        offers: {
          '@type': 'Offer',
          price: plan?.amount_mad ?? c.price,
          priceCurrency: 'MAD',
          availability: 'https://schema.org/InStock',
        },
      },
    }
  }),
}

export default function CoursesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CoursesClient />
    </>
  )
}
