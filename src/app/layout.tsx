import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { ProfileProvider } from '@/lib/profile-context'
import { FeatureAccessProvider } from '@/lib/feature-access'
import PwaRegister from '@/components/PwaRegister'

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'إنجليزي.كوم',
  url: 'https://inglizi.com',
  description:
    'دورات إنجليزية عملية بالمحادثة والنطق مع الأستاذ حمزة القصراوي، مع متابعة شخصية ونتائج محسوسة من أول أسبوع.',
  inLanguage: ['ar', 'en'],
  areaServed: ['MA', 'SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG'],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://inglizi.com'),
  title: {
    default: 'إنجليزي.كوم | تعلم الإنجليزية بالمحادثة مع حمزة القصراوي',
    template: '%s | إنجليزي.كوم',
  },
  description:
    'تعلم الإنجليزية من الصفر إلى الطلاقة مع دروس قصيرة، محادثة عملية، ومتابعة شخصية من الأستاذ حمزة القصراوي. اختبر مستواك مجاناً في 3 دقائق.',
  keywords:
    'تعلم الإنجليزية, تعلم اللغة الإنجليزية من الصفر, دورة انجليزي اون لاين, تحسين النطق بالانجليزية, محادثة انجليزية, دورات إنجليزية بالعربية, حمزة القصراوي, انجليزي للمبتدئين, تعلم الإنجليزية بالمحادثة',
  alternates: { canonical: 'https://inglizi.com' },
  openGraph: {
    title: 'إنجليزي.كوم | تعلم الإنجليزية بالمحادثة مع حمزة القصراوي',
    description:
      'دورات إنجليزية عملية بالمحادثة والنطق للناطقين بالعربية — متابعة شخصية من الأستاذ حمزة القصراوي. اختبر مستواك مجاناً في 3 دقائق.',
    url: 'https://inglizi.com',
    siteName: 'إنجليزي.كوم',
    locale: 'ar_MA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'إنجليزي.كوم | تعلم الإنجليزية بالمحادثة مع حمزة القصراوي',
    description:
      'تعلم الإنجليزية من الصفر إلى الطلاقة مع دروس قصيرة ومتابعة شخصية من الأستاذ حمزة القصراوي.',
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Inglizi' },
}

export const viewport: Viewport = {
  themeColor: '#facc15',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="font-sans">
        <PwaRegister />
        <AuthProvider>
          <ProfileProvider>
            <FeatureAccessProvider>
              {children}
            </FeatureAccessProvider>
          </ProfileProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
