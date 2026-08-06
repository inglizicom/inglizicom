import type { MetadataRoute } from 'next'
import { fetchPublishedArticles } from '@/lib/articles-db'
import { PLANS } from '@/data/plans'
import { COURSES } from '@/data/courses'

const BASE = 'https://inglizi.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,           changeFrequency: 'weekly',  priority: 1 },
    { url: `${BASE}/level-test`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/pricing`,    changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/classes`,    changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/business`,   changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/courses`,    changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/faq`,        changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/blog`,       changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE}/about`,      changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contact`,    changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/support`,    changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/privacy`,    changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE}/terms`,      changeFrequency: 'yearly',  priority: 0.2 },
  ]

  /* One indexable landing page per package and per course level — each one
     carries its own price, FAQ and Product structured data. */
  const planPages: MetadataRoute.Sitemap = PLANS.map(p => ({
    url: `${BASE}/pricing/${p.id}`,
    changeFrequency: 'weekly' as const,
    priority: p.highlight || p.isPremium ? 0.85 : 0.75,
  }))

  const coursePages: MetadataRoute.Sitemap = COURSES.map(c => ({
    url: `${BASE}/courses/${c.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  let articles: MetadataRoute.Sitemap = []
  try {
    const rows = await fetchPublishedArticles()
    articles = rows.map((a) => ({
      url: `${BASE}/blog/${a.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch {
    // Sitemap must still render if the DB is unreachable.
  }

  return [...staticPages, ...planPages, ...coursePages, ...articles]
}
