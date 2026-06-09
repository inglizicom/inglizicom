import type { Metadata } from 'next'
import './ebook.css'

export const metadata: Metadata = {
  title: 'كتاب إنجليزي.كوم — Hamza El Qasraoui',
  description: 'كتاب شامل لتعلم الإنجليزية من الصفر — الأستاذ حمزة القصراوي · 0764189311 · inglizi.com',
  robots: { index: false, follow: false },
}

export default function EbookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
