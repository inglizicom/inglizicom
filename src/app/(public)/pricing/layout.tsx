import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'أسعار دورات اللغة الإنجليزية',
  description:
    'باقات تعلم اللغة الإنجليزية مع الأستاذ حمزة القصراوي — مستويات فردية، باكات موفّرة، حصص خاصة 1:1، وإنجليزية مهنية. متابعة شخصية على واتساب وضمان استرداد خلال الأسبوع الأول.',
  alternates: { canonical: 'https://inglizi.com/pricing' },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
