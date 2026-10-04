import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'اختبار مستوى اللغة الإنجليزية مجاناً — من A0 إلى C1',
  description:
    'اختبر مستواك في الإنجليزية مجاناً: أسئلة استماع وقراءة وقواعد تتدرّج من A0 إلى C1 وتتوقف عند مستواك الحقيقي، ثم فقرة كتابة تُصحَّح تلقائياً — ونقترح عليك المستوى المناسب. للناطقين بالعربية في المغرب والخليج.',
  alternates: { canonical: 'https://inglizi.com/level-test' },
}

export default function LevelTestLayout({ children }: { children: React.ReactNode }) {
  return children
}
