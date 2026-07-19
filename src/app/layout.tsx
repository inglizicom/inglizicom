import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { ProfileProvider } from '@/lib/profile-context'
import { FeatureAccessProvider } from '@/lib/feature-access'

export const metadata: Metadata = {
  metadataBase: new URL('https://inglizi.com'),
  title: {
    default: 'إنجليزي.كوم | تعلم اللغة الإنجليزية وتحدث بثقة',
    template: '%s',
  },
  description:
    'تعلم اللغة الإنجليزية بالمحادثة والنطق مع الأستاذ حمزة القصراوي — دورات عملية للناطقين بالعربية في المغرب والسعودية والخليج، بمتابعة شخصية على واتساب. اختبر مستواك مجاناً.',
  keywords:
    'تعلم الإنجليزية, تعلم اللغة الإنجليزية من الصفر, دورة انجليزي اون لاين, تحسين النطق بالانجليزية, محادثة انجليزية, دورات إنجليزية بالعربية, حمزة القصراوي, انجليزي للمبتدئين',
  alternates: { canonical: 'https://inglizi.com' },
  openGraph: {
    title: 'إنجليزي.كوم | تعلم اللغة الإنجليزية وتحدث بثقة',
    description:
      'دورات إنجليزية عملية بالمحادثة والنطق للناطقين بالعربية — متابعة شخصية من الأستاذ حمزة القصراوي. اختبر مستواك مجاناً في 3 دقائق.',
    url: 'https://inglizi.com',
    siteName: 'إنجليزي.كوم',
    locale: 'ar',
    type: 'website',
  },
  robots: { index: true, follow: true },
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
      </head>
      <body className="font-sans">
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
