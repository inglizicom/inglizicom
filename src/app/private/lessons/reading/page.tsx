import Link from 'next/link'
import { readingUnits } from '@/data/private-lessons/reading'

export default function ReadingIndex() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8 md:p-14">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <div className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold tracking-widest uppercase mb-4">
            Private · Reading Practice
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-brand-900 mb-3">Reading — A0</h1>
          <h2 className="text-2xl font-bold text-slate-600" dir="rtl">
            نصوص للقراءة — المستوى صفر
          </h2>
          <p className="mt-3 text-slate-500 max-w-xl" dir="rtl">
            اضغط على أي كلمة لترجمتها · تعلم المفردات · واختبر نفسك بتمرين الفراغات.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {readingUnits.map((u) => (
            <Link
              key={u.slug}
              href={`/private/lessons/reading/${u.slug}`}
              className="group block bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-5xl group-hover:scale-110 transition-transform">{u.emoji}</div>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {u.level}
                </span>
              </div>
              <div className="text-xl font-black text-brand-900 mb-1">{u.title.en}</div>
              <div className="text-base text-slate-600 font-bold" dir="rtl">{u.title.ar}</div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">📖 نص</span>
                <span className="flex items-center gap-1">📝 مفردات</span>
                <span className="flex items-center gap-1">✏️ اختبار</span>
                <span className="ml-auto text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                  ابدأ القراءة →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <Link href="/private/lessons" className="text-slate-500 hover:text-slate-800 text-sm font-medium">
          ← الدروس
        </Link>
      </div>
    </main>
  )
}
