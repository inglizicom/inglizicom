/** @type {import('next').NextConfig} */
const nextConfig = {
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
    return [...toMofradati, ...toLevelTest, { source: '/live', destination: '/courses', permanent: true }]
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
