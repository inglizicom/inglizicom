import Link from 'next/link'
import { Grid3x3, ListOrdered, Rows3 } from 'lucide-react'

/**
 * /admin/games — three printable game generators for any course's word
 * list, not just one book. Each tool is its own page (lib/game-generators.ts
 * holds the pure algorithms); this is just the menu.
 */

const TOOLS = [
  { href: '/admin/games/word-search', icon: Grid3x3, title: 'البحث عن الكلمات', body: 'كلمات مخفية داخل شبكة حروف، في كل الاتجاهات — أدخل كلمات أي وحدة وسيُنشئ الشبكة تلقائيًا.' },
  { href: '/admin/games/matching',    icon: Rows3,   title: 'التوصيل والبينغو', body: 'عمودا توصيل (إنجليزي ↔ عربي) أو بطاقات بينغو مخلوطة — مثالية لأكثر من طالب في نفس الحصة.' },
  { href: '/admin/games/scramble',    icon: ListOrdered, title: 'ترتيب الجملة', body: 'كلمات الجملة أو العبارة مبعثرة، يُعيد الطالب ترتيبها — يثبّت ترتيب الـchunk كوحدة واحدة.' },
]

export default function GamesIndexPage() {
  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1100px] mx-auto">
      <p className="text-[13.5px] text-zinc-500 mb-6 max-w-[640px]">
        أدخل كلمات أو جملًا من أي دورة، واحصل على صفحة لعبة جاهزة بألوانك — صوّرها (PNG) أو اطبعها (PDF) وضعها في تصميم Canva أو دفتر التمارين.
      </p>
      <div className="grid sm:grid-cols-3 gap-4">
        {TOOLS.map(t => (
          <Link key={t.href} href={t.href}
            className="group rounded-2xl bg-white border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-md transition-all">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-zinc-900 text-white mb-3">
              <t.icon size={20} />
            </span>
            <h3 className="font-extrabold text-[15px] text-zinc-900">{t.title}</h3>
            <p className="mt-1.5 text-[12.5px] text-zinc-500 leading-relaxed">{t.body}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
