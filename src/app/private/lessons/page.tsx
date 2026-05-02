import Link from 'next/link'
import { units } from '@/data/private-lessons'

export default function PrivateLessonsIndex() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* ── Header ──────────────────────────────────────────── */}
        <div>
          <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold tracking-widest uppercase mb-3">
            Private · Recording Tool
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900">Inglizi.com</h1>
          <p className="mt-1 text-slate-500 text-sm" dir="rtl">اختر القسم الذي تريد التسجيل فيه</p>
        </div>

        {/* ── Three course sections ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Level 01 A0/A1 */}
          <Link
            href="/private/lessons/level01"
            className="group flex flex-col gap-3 bg-white rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 hover:shadow-xl transition-all p-6"
          >
            <span className="text-4xl">📗</span>
            <div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">المستوى الأول</div>
              <div className="text-xl font-black text-slate-900">Level 01 — A0 / A1</div>
              <div className="text-sm text-slate-500 mt-1" dir="rtl">من الصفر إلى المحادثة في 30 يوماً</div>
            </div>
            <div className="mt-auto text-sm font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              19 درساً ←
            </div>
          </Link>

          {/* Reading A0 */}
          <Link
            href="/private/lessons/reading"
            className="group flex flex-col gap-3 bg-white rounded-2xl border-2 border-blue-200 hover:border-blue-500 hover:shadow-xl transition-all p-6"
          >
            <span className="text-4xl">📖</span>
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">القراءة</div>
              <div className="text-xl font-black text-slate-900">Reading — A0</div>
              <div className="text-sm text-slate-500 mt-1" dir="rtl">نصوص تفاعلية · ترجمة بالضغط · اختبار الفراغات</div>
            </div>
            <div className="mt-auto text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              12 نصاً ←
            </div>
          </Link>

          {/* Real Life English */}
          <div className="flex flex-col gap-3 bg-white rounded-2xl border-2 border-amber-200 p-6">
            <span className="text-4xl">🏙️</span>
            <div>
              <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">المواقف الحياتية</div>
              <div className="text-xl font-black text-slate-900">Real Life English 1</div>
              <div className="text-sm text-slate-500 mt-1" dir="rtl">الإنجليزية للمواقف اليومية — A1/A2</div>
            </div>
            <div className="mt-auto text-xs text-slate-400">20 وحدة — أدناه</div>
          </div>
        </div>

        {/* ── Real Life English units ───────────────────────────── */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">
            Real Life English 1
            <span className="ml-3 text-sm font-normal text-slate-400">A1 – A2</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {units.map((u) => (
              <Link
                key={u.slug}
                href={`/private/lessons/${u.slug}`}
                className="group block bg-white rounded-xl border-2 border-slate-200 hover:border-amber-500 hover:shadow-lg transition-all p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-3xl group-hover:scale-110 transition-transform">{u.emoji}</div>
                  <div className="text-[11px] font-bold text-slate-400 tracking-wider">
                    {String(u.id).padStart(2, '0')}
                  </div>
                </div>
                <div className="text-base font-black text-slate-900 leading-tight">{u.title.en}</div>
                <div className="text-xs text-slate-500 mt-0.5" dir="rtl">{u.title.ar}</div>
                <div className="mt-3 text-xs text-amber-600 font-bold group-hover:translate-x-1 transition-transform">
                  ابدأ →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Tips ─────────────────────────────────────────────── */}
        <div className="p-5 bg-slate-900 text-white rounded-2xl text-sm">
          <p className="font-bold mb-2">اختصارات التسجيل</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-slate-300 text-xs">
            <span><kbd className="bg-slate-700 px-1.5 py-0.5 rounded font-mono">Space / →</kbd> التالي</span>
            <span><kbd className="bg-slate-700 px-1.5 py-0.5 rounded font-mono">←</kbd> رجوع</span>
            <span><kbd className="bg-slate-700 px-1.5 py-0.5 rounded font-mono">F</kbd> ملء الشاشة</span>
            <span><kbd className="bg-slate-700 px-1.5 py-0.5 rounded font-mono">?</kbd> كل الاختصارات</span>
          </div>
        </div>

      </div>
    </main>
  )
}
