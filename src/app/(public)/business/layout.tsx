import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الإنجليزية المهنية للمحترفين',
  description:
    'برنامج الإنجليزية المهنية مع الأستاذ حمزة القصراوي — اجتماعات، عروض، مكالمات، وتواصل مع العملاء بثقة. بدون قواعد وبدون كتابة: فقط تحدث وأقنع في بيئة العمل.',
  alternates: { canonical: 'https://inglizi.com/business' },
}

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return children
}
