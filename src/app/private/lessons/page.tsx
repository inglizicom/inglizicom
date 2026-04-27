import Link from 'next/link'
import { units } from '@/data/private-lessons'

export default function PrivateLessonsIndex() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8 md:p-14">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="inline-block px-4 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold tracking-widest uppercase mb-4">
            Private · Recording Tool
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-brand-900 mb-3">
            Real Life English 1
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-700" dir="rtl">
            الإنجليزية للمواقف اليومية
          </h2>
          <p className="mt-4 text-slate-600 max-w-2xl" dir="rtl">
            دروس متحركة جاهزة للتسجيل. استخدم Space أو السهم الأيمن للتقدم، السهم الأيسر للرجوع.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((u) => (
            <Link
              key={u.slug}
              href={`/private/lessons/${u.slug}`}
              className="group block bg-white rounded-2xl border-2 border-slate-200 hover:border-amber-500 hover:shadow-xl transition-all p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-5xl group-hover:scale-110 transition-transform">{u.emoji}</div>
                <div className="text-xs font-bold text-slate-400 tracking-wider">
                  UNIT {String(u.id).padStart(2, '0')}
                </div>
              </div>
              <div className="text-xl font-black text-brand-900 mb-1">{u.title.en}</div>
              <div className="text-base text-slate-600 font-bold" dir="rtl">
                {u.title.ar}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{u.sections.length} sections</span>
                <span className="text-amber-600 font-bold group-hover:translate-x-1 transition-transform">
                  ابدأ الدرس →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 p-6 bg-slate-900 text-white rounded-2xl">
          <h3 className="font-bold text-lg mb-3">Recording tips</h3>
          <ul className="text-sm text-slate-300 space-y-1.5">
            <li>· Press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">F11</kbd> for fullscreen before recording</li>
            <li>· Use <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">Space</kbd> or <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">→</kbd> to advance one step at your pace</li>
            <li>· <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">↓</kbd> jumps to the next section, <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">A</kbd> reveals everything in the current section</li>
            <li>· Press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">?</kbd> in any lesson for the full shortcut list</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
