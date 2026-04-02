import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Google Fonts – Cairo Arabic */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Cairo', sans-serif" }}>
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  )
}
