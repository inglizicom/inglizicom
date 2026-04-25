import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyCTA from '@/components/StickyCTA'
import SubscribeHost from '@/components/SubscribeHost'
import { Analytics } from '@vercel/analytics/react'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Analytics />
      <Header />
      <main>{children}</main>
      <Footer />
      <StickyCTA />
      <SubscribeHost />
    </>
  )
}
