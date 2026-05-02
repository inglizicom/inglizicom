import Link from 'next/link'
import { level01Units } from '@/data/private-lessons/level01'

export default function Level01Index() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8 md:p-14">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-widest uppercase mb-4">
            Private · Recording Tool
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-brand-900 mb-3">
            Level 1 — A0 / A1
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-700" dir="rtl">
            المستوى الأول من الصفر — 30 يوماً
          </h2>
          <p className="mt-4 text-slate-600 max-w-2xl" dir="rtl">
            دروس المستوى الأول. استخدم Space أو السهم الأيمن للتقدم، السهم الأيسر للرجوع.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {level01Units.map((u) => (
            <Link
              key={u.slug}
              href={`/private/lessons/level01/${u.slug}`}
              className="group block bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-5xl group-hover:scale-110 transition-transform">{u.emoji}</div>
                <div className="text-xs font-bold text-slate-400 tracking-wider">
                  L{String(u.id - 100).padStart(2, '0')}
                </div>
              </div>
              <div className="text-xl font-black text-brand-900 mb-1">{u.title.en}</div>
              <div className="text-base text-slate-600 font-bold" dir="rtl">
                {u.title.ar}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold">{u.level}</span>
                <span className="text-emerald-600 font-bold group-hover:translate-x-1 transition-transform">
                  ابدأ الدرس →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/private/lessons" className="text-slate-500 hover:text-slate-800 text-sm font-medium">
            ← Real Life English 1
          </Link>
        </div>
      </div>
    </main>
  )
}
