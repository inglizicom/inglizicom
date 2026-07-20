import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'حصص خاصة 1:1 مع الأستاذ',
  description:
    'حصص إنجليزية فردية 1:1 مباشرة مع الأستاذ حمزة القصراوي — 1h30 للحصة، برنامج مخصص لهدفك، تصحيح فوري للنطق، ومتابعة عبر واتساب. كلما زادت الحصص انخفض سعر الحصة.',
  alternates: { canonical: 'https://inglizi.com/classes' },
}

export default function ClassesLayout({ children }: { children: React.ReactNode }) {
  return children
}
