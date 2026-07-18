import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/sales/', '/crm-login', '/student-space', '/private/', '/api/'],
      },
    ],
    sitemap: 'https://inglizi.com/sitemap.xml',
  }
}
