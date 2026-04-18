import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { FeatureAccessProvider } from '@/lib/feature-access'

export const metadata: Metadata = {
  title: 'إنجليزي.كوم | تعلم الإنجليزية وتكلم بثقة',
  description:
    'برنامج عملي مع حمزة القصراوي لتحسين النطق والتواصل باللغة الإنجليزية. أكثر من 2000 طالب حول العالم.',
  keywords: 'تعلم الإنجليزية، نطق، تواصل، دورات إنجليزية، حمزة القصراوي',
  openGraph: {
    title: 'إنجليزي.كوم | تعلم الإنجليزية وتكلم بثقة',
    description: 'برنامج عملي لتحسين النطق والتواصل مع أكثر من 2000 طالب حول العالم',
    locale: 'ar_MA',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <AuthProvider>
          <FeatureAccessProvider>
            {children}
          </FeatureAccessProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
