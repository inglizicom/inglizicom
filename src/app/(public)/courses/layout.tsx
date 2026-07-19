import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'دورات تعلم اللغة الإنجليزية للناطقين بالعربية',
  description:
    'دورات إنجليزية عملية من الصفر حتى الاحتراف: نطق صحيح، محادثة من اليوم الأول، ومتابعة شخصية من الأستاذ حمزة القصراوي. دروس مسجلة تبقى معك مدى الحياة.',
}

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children
}
