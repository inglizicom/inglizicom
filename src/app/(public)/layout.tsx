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
      {/* clip, not hidden: nothing may widen the page on a phone (an entrance
          animation starting 40px to the side made browsers zoom the whole
          page out), and sticky children keep working. */}
      <main className="overflow-x-clip">{children}</main>
      <Footer />
      <StickyCTA />
      <SubscribeHost />
    </>
  )
}
