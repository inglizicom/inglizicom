import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import { Analytics } from '@vercel/analytics/react'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Analytics />
      <Header />
      <main className="pt-[68px]">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
