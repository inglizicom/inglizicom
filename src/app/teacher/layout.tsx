import type { Metadata } from 'next'
import TeacherRoot from './TeacherRoot'

/** teacher.inglizi.com — the teaching space.
 *
 *  A server layout purely so it can own its metadata: the space inherited the
 *  marketing site's title and, worse, its crawlability. A staff login page has
 *  no business in a search index, so noindex applies to the whole tree —
 *  including /teacher/login, the one page a crawler could otherwise reach. */
export const metadata: Metadata = {
  // absolute, not default — otherwise the root layout's "%s | إنجليزي.كوم"
  // template wraps it and the tab reads like the marketing site again.
  title: {
    absolute: 'فضاء الأساتذة | Inglizi',
    template: '%s | فضاء الأساتذة',
  },
  description: 'مساحة الأساتذة في إنجليزي.كوم — الحصص، الطلاب، التقارير والملفات.',
  robots: {
    index: false, follow: false,
    googleBot: { index: false, follow: false },
  },
  alternates: {},
  openGraph: undefined,
  twitter: undefined,
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <TeacherRoot>{children}</TeacherRoot>
}
