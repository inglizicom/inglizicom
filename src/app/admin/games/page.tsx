import Link from 'next/link'
import { BookOpen, Grid3x3, Link2, ListOrdered } from 'lucide-react'

/**
 * /admin/games — printable workbook exercises. The workbook generator builds
 * the book's pages unit by unit; the three single tools make one exercise
 * from any word list (other courses, or an edited book unit).
 */

const TOOLS = [
  { href: '/admin/games/word-search', icon: Grid3x3,    title: 'البحث عن الكلمات', body: 'شبكة حروف بمستوى صعوبة تختاره، بنك كلمات مع المعنى، ومفتاح حل ملوّن.' },
  { href: '/admin/games/scramble',    icon: ListOrdered, title: 'رتّب الكلمات',     body: 'كلمات العبارة مبعثرة بلا علامات تكشف الجواب، مع سطر للكتابة ومفتاح حل.' },
  { href: '/admin/games/matching',    icon: Link2,       title: 'صِل الكلمة بمعناها', body: 'عمود إنجليزي وعمود عربي مخلوط، خانات للأحرف، ومفتاح حل.' },
]

export default function GamesIndexPage() {
  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1100px] mx-auto space-y-6">
      <Link href="/admin/games/workbook"
        className="group flex items-center gap-5 rounded-2xl p-6 text-white bg-[#2B1B0F] hover:shadow-xl transition-shadow">
        <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFD54A] text-[#2B1B0F] shrink-0"><BookOpen size={26} /></span>
        <span className="flex-1">
          <span className="block text-[18px] font-black">دفتر التمارين — الإنجليزية للمواقف اليومية</span>
          <span className="block mt-1 text-[13px] text-white/70 leading-relaxed">
            صفحات A4 جاهزة للطباعة لكل وحدة من الوحدات 19: البحث عن الكلمات، رتّب الكلمات، صِل الكلمة بمعناها — ومفاتيح الحل في آخر الدفتر.
          </span>
        </span>
        <span className="hidden sm:inline rounded-xl bg-[#FFD54A] text-[#2B1B0F] font-black text-[13px] px-4 py-2.5">افتح</span>
      </Link>

      <div>
        <h2 className="text-[13px] font-extrabold text-zinc-500 mb-3">تمرين واحد من أي قائمة كلمات (لدورات أخرى)</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {TOOLS.map(t => (
            <Link key={t.href} href={t.href} className="rounded-2xl bg-white border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-md transition-all">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-zinc-900 text-white mb-3"><t.icon size={20} /></span>
              <h3 className="font-extrabold text-[15px] text-zinc-900">{t.title}</h3>
              <p className="mt-1.5 text-[12.5px] text-zinc-500 leading-relaxed">{t.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
