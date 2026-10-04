import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyCTA from '@/components/StickyCTA'
import SubscribeHost from '@/components/SubscribeHost'
import { Analytics } from '@vercel/analytics/react'

/* One action at a time: the header's gold button and, on the phone, one
   bottom bar (StickyCTA). The chatbot lives on /faq and /contact only —
   site-wide it covered content and popped up uninvited. */
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
