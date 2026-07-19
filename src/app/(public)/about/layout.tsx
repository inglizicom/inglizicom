import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'من نحن — الأستاذ حمزة القصراوي | إنجليزي.كوم',
  description:
    'قصة إنجليزي.كوم ومنهج الأستاذ حمزة القصراوي في تعليم الإنجليزية بالمحادثة والنطق بدل الحفظ والقواعد — مع أكثر من 1200 طالب من المغرب والعالم العربي.',
  alternates: { canonical: 'https://inglizi.com/about' },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
