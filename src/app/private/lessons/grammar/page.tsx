import Link from 'next/link'
import { grammarLessons, type GrammarLesson } from '@/data/private-lessons/grammar'

export default function GrammarIndex() {
  const a0 = grammarLessons.filter((l) => l.level === 'A0' && !l.isReview)
  const a1 = grammarLessons.filter((l) => l.level === 'A1' && !l.isReview)
  const a2 = grammarLessons.filter((l) => l.level === 'A2' && !l.isReview)
  const reviews = grammarLessons.filter((l) => l.isReview)
  const totalLessons = a0.length + a1.length + a2.length
  const totalReviews = reviews.length

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-10" dir="rtl">

        {/* Header */}
        <div>
          <Link href="/private/lessons" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            ← الدروس
          </Link>
          <div className="mt-5 space-y-2">
            <div className="inline-block bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase">
              Grammar · القواعد
            </div>
            <h1 className="text-3xl font-black text-white">دروس القواعد</h1>
            <p className="text-slate-400 text-sm">
              {totalLessons} درساً · {totalReviews} مراجعات · A0 / A1 — شرح مبسط بدون تعقيد
            </p>
          </div>
        </div>

        {/* A0 lessons */}
        <LevelSection
          label="A0 · مبتدئ تماماً"
          color="emerald"
          lessons={a0}
          reviews={grammarLessons.filter((l) => l.isReview && l.level === 'A0')}
          allLessons={grammarLessons}
        />

        {/* A1 lessons */}
        <LevelSection
          label="A1 · مبتدئ"
          color="blue"
          lessons={a1}
          reviews={grammarLessons.filter((l) => l.isReview && l.level === 'A1')}
          allLessons={grammarLessons}
        />

        {/* A2 lessons */}
        {a2.length > 0 && (
          <LevelSection
            label="A2 · فوق المبتدئ"
            color="violet"
            lessons={a2}
            reviews={grammarLessons.filter((l) => l.isReview && l.level === 'A2')}
            allLessons={grammarLessons}
          />
        )}

        {/* Color legend */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5 space-y-3">
          <p className="text-slate-500 text-xs font-bold tracking-wider uppercase">دليل الألوان في الدروس</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-blue-500/20 text-blue-300 border border-blue-400/40 rounded-full px-3 py-1 font-bold">👤 ضمير</span>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-full px-3 py-1 font-bold">⚡ فعل رئيسي</span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full px-3 py-1 font-bold">💬 ما يليه</span>
            <span className="bg-red-500/20 text-red-300 border border-red-400/40 rounded-full px-3 py-1 font-bold">🚫 النفي</span>
            <span className="bg-purple-500/20 text-purple-300 border border-purple-400/40 rounded-full px-3 py-1 font-bold">❓ سؤال</span>
          </div>
        </div>

      </div>
    </main>
  )
}

/* ── Grouped section per level ─────────────────────────────────────────────── */

function LevelSection({
  label,
  color,
  lessons,
  reviews,
  allLessons,
}: {
  label: string
  color: 'emerald' | 'blue' | 'violet'
  lessons: GrammarLesson[]
  reviews: GrammarLesson[]
  allLessons: GrammarLesson[]
}) {
  const badgeColor = color === 'emerald'
    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    : color === 'violet'
    ? 'bg-violet-500/15 text-violet-400 border-violet-500/30'
    : 'bg-blue-500/15 text-blue-400 border-blue-500/30'

  // Build interleaved list as they appear in the full curriculum
  const levelKey = color === 'emerald' ? 'A0' : color === 'violet' ? 'A2' : 'A1'
  const slugsInOrder = allLessons
    .filter((l) => l.level === levelKey)
    .map((l) => l.slug)

  const combined = slugsInOrder
    .map((slug) => allLessons.find((l) => l.slug === slug)!)
    .filter(Boolean)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badgeColor}`}>{label}</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      {combined.map((lesson) =>
        lesson.isReview ? (
          <ReviewCard key={lesson.slug} lesson={lesson} />
        ) : (
          <LessonCard key={lesson.slug} lesson={lesson} />
        )
      )}
    </div>
  )
}

function LessonCard({ lesson }: { lesson: GrammarLesson }) {
  const levelColor =
    lesson.level === 'A0'
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : 'bg-blue-500/15 text-blue-400 border-blue-500/30'

  return (
    <Link
      href={`/private/lessons/grammar/${lesson.slug}`}
      className="group flex items-center gap-4 bg-slate-900 rounded-2xl border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all p-5"
    >
      <div className="text-3xl flex-shrink-0">{lesson.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${levelColor}`}>
            {lesson.level}
          </span>
          <span className="text-slate-600 text-xs">درس {lesson.id}</span>
        </div>
        <div className="text-white font-black text-base leading-tight" dir="ltr">
          {lesson.title.en}
        </div>
        <div className="text-slate-400 text-sm mt-0.5">{lesson.title.ar}</div>
      </div>
      <div className="text-slate-700 group-hover:text-amber-500 group-hover:-translate-x-1 transition-all font-bold flex-shrink-0">←</div>
    </Link>
  )
}

function ReviewCard({ lesson }: { lesson: GrammarLesson }) {
  return (
    <Link
      href={`/private/lessons/grammar/${lesson.slug}`}
      className="group flex items-center gap-4 bg-amber-500/8 rounded-2xl border border-amber-500/25 hover:border-amber-500/60 hover:bg-amber-500/12 transition-all p-5"
    >
      <div className="text-3xl flex-shrink-0">{lesson.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold px-2 py-0.5 rounded-full">
            مراجعة شاملة
          </span>
        </div>
        <div className="text-amber-200 font-black text-base leading-tight" dir="ltr">
          {lesson.title.en}
        </div>
        <div className="text-amber-400/70 text-sm mt-0.5">{lesson.title.ar}</div>
      </div>
      <div className="text-amber-600 group-hover:text-amber-400 group-hover:-translate-x-1 transition-all font-bold text-xl flex-shrink-0">
        🏆
      </div>
    </Link>
  )
}
