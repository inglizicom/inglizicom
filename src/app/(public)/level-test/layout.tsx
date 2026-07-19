import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'اختبار مستوى اللغة الإنجليزية — مجاني في 3 دقائق | إنجليزي.كوم',
  description:
    'اختبر مستواك في اللغة الإنجليزية مجاناً: 10 أسئلة في 3 دقائق تحدد مستواك بدقة (A0 حتى B1) مع الباقة المناسبة لك. للناطقين بالعربية في المغرب والخليج.',
  alternates: { canonical: 'https://inglizi.com/level-test' },
}

export default function LevelTestLayout({ children }: { children: React.ReactNode }) {
  return children
}
