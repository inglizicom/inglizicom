import Image from 'next/image'
import Link from 'next/link'
import { Clock, ArrowLeft, BookOpen } from 'lucide-react'
import { fetchPublishedArticles } from '@/lib/articles-db'
import type { Article } from '@/data/articles'
import FadeIn from './FadeIn'

const OVERLAY_GRADIENTS: Record<string, string> = {
  'نصائح التعلم':   'from-blue-600/80',
  'النطق والكلام':  'from-emerald-600/80',
  'أخطاء شائعة':   'from-rose-600/80',
  'تحفيز وثقة':    'from-amber-600/80',
  'إنجليزية العمل': 'from-violet-600/80',
}

export default async function LatestArticles() {
  const all = await fetchPublishedArticles()
  const featured = all.find(a => a.featured)
  const rest     = all.filter(a => !a.featured)
  const showcase = (featured ? [featured, ...rest] : all).slice(0, 3)

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">

      {/* Soft background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-r from-blue-50 via-violet-50 to-pink-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* ── Section header ── */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-14">
            <div>
              {/* English eyebrow */}
              <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 font-black text-xs px-4 py-1.5 rounded-full mb-4 tracking-wide uppercase">
                <BookOpen size={13} />
                Latest Articles
              </span>

              {/* Main headline — bilingual */}
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-2">
                تعلم الإنجليزية
                <span
                  className="block"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  بنصائح عملية
                </span>
              </h2>

              {/* Arabic subtitle */}
              <p className="text-gray-500 text-lg max-w-xl">
                آخر المقالات لمساعدتك على تحسين مستواك وتجاوز عقبات التعلم
              </p>
            </div>

            {/* View all — desktop */}
            <Link
              href="/blog"
              className="hidden sm:inline-flex items-center gap-2 border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 font-black py-3 px-7 rounded-2xl transition-all duration-300 text-sm flex-shrink-0 group"
            >
              كل المقالات
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </FadeIn>

        {/* ── Cards grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {showcase.map((article, i) => {
            const overlayFrom = OVERLAY_GRADIENTS[article.category] ?? 'from-indigo-600/80'
            return (
              <FadeIn key={article.slug} delay={i * 110}>
                <ArticleCard article={article} overlayFrom={overlayFrom} index={i} />
              </FadeIn>
            )
          })}
        </div>

        {/* ── View all — mobile ── */}
        <FadeIn delay={350}>
          <div className="flex justify-center mt-12">
            <Link
              href="/blog"
              className="sm:hidden inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black py-4 px-10 rounded-2xl shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-opacity text-base active:scale-95"
            >
              <BookOpen size={18} />
              عرض كل المقالات
              <ArrowLeft size={18} />
            </Link>

            {/* Desktop secondary CTA (below grid) */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-gray-200" />
              <Link
                href="/blog"
                className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-bold text-sm transition-colors group"
              >
                اكتشف المزيد من المقالات
                <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-gray-200" />
            </div>
          </div>
        </FadeIn>

      </div>
    </section>
  )
}

/* ─── Article card ─────────────────────────────────────────── */
interface CardProps {
  article: Article
  overlayFrom: string
  index: number
}

function ArticleCard({ article, overlayFrom, index }: CardProps) {
  /* Accent ring color per index for hover state */
  const rings = [
    'hover:ring-indigo-300  hover:shadow-indigo-100',
    'hover:ring-violet-300  hover:shadow-violet-100',
    'hover:ring-pink-300    hover:shadow-pink-100',
  ]
  const ringClass = rings[index % rings.length]

  return (
    <Link
      href={`/blog/${article.slug}`}
      className={`group flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:ring-2 ${ringClass} transition-all duration-350 h-full`}
    >
      {/* ── Image ── */}
      <div className="relative h-52 overflow-hidden flex-shrink-0">
        <Image
          src={article.img}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${overlayFrom} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

        {/* Category badge */}
        <span className={`absolute top-3 right-3 ${article.categoryColor} text-xs font-black px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm`}>
          {article.category}
        </span>

        {/* Featured star */}
        {article.featured && (
          <span className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
            ✨ مميز
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-6">

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-gray-400 font-semibold mb-3">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {article.readTime} دقائق
          </span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span>{article.date}</span>
        </div>

        {/* Title */}
        <h3 className="font-black text-gray-900 text-lg leading-snug mb-2 line-clamp-2 group-hover:text-indigo-700 transition-colors duration-200">
          {article.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1 mb-5">
          {article.excerpt}
        </p>

        {/* CTA row */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-400 font-semibold">{article.author}</span>
          <span className="inline-flex items-center gap-1.5 text-indigo-600 font-black text-sm group-hover:gap-2.5 transition-all duration-200">
            اقرأ المقال
            <ArrowLeft size={14} />
          </span>
        </div>
      </div>
    </Link>
  )
}
