import type { MetadataRoute } from 'next'
import { fetchPublishedArticles } from '@/lib/articles-db'

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

  return [...staticPages, ...articles]
}
