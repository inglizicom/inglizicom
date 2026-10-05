/** @type {import('next').NextConfig} */
const nextConfig = {
  // The e2e suite runs its own server with its own build folder, so it never
  // fights a running `npm run dev` over .next (see playwright.config.ts).
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    const toMofradati = ['map', 'learn', 'play', 'practice', 'listen'].map((p) => ({
      source: `/${p}`,
      destination: 'https://mofradati.com',
      permanent: true,
    }))
    const toLevelTest = ['a0', 'a1', 'exams', 'corrector'].map((p) => ({
      source: `/${p}`,
      destination: '/level-test',
      permanent: true,
    }))
    /* Short links for bios, posts and statuses: inglizi.com/ig, /tt, /fb, /wa, /yt
       (and /ig/level-test, /tt/pricing …). They add the UTM tags in-app
       browsers otherwise strip, so the CRM's channel report knows where each
       lead came from. Temporary (307) so a link can be repointed later. */
    const SHORT = { ig: 'instagram', tt: 'tiktok', fb: 'facebook', wa: 'whatsapp', yt: 'youtube' }
    const tag = (src) => `utm_source=${src}&utm_medium=social&utm_campaign=bio`
    const shortLinks = Object.entries(SHORT).flatMap(([k, src]) => [
      { source: `/${k}`, destination: `/?${tag(src)}`, permanent: false },
      { source: `/${k}/:path*`, destination: `/:path*?${tag(src)}`, permanent: false },
    ])
    return [...toMofradati, ...toLevelTest, ...shortLinks, { source: '/live', destination: '/courses', permanent: true }]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), payment=()' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
