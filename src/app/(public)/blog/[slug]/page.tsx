import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, ArrowRight, User, Tag, Share2 } from 'lucide-react'
import { fetchArticleBySlug, fetchRelatedArticles, fetchRecentArticles } from '@/lib/articles-db'
import type { BlockType } from '@/data/articles'
import BlogSidebar from '@/components/BlogSidebar'
import ArticleCard from '@/components/ArticleCard'
import QuoteBlock from '@/components/QuoteBlock'
import ReadingProgress from '@/components/ReadingProgress'

/* ──────────────────────────────────────────────
   Block renderer — turns data blocks into JSX
──────────────────────────────────────────────── */
function RenderBlock({ block }: { block: BlockType }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="text-gray-700 leading-[1.95] text-lg mb-5">
          {block.text}
        </p>
      )

    case 'heading':
      if (block.level === 2) {
        return (
          <h2 className="text-2xl font-black text-gray-900 mt-10 mb-4 flex items-center gap-2">
            <span className="w-1 h-7 bg-brand-500 rounded-full inline-block flex-shrink-0" />
            {block.text}
          </h2>
        )
      }
      return (
        <h3 className="text-xl font-bold text-gray-800 mt-7 mb-3">
          {block.text}
        </h3>
      )

    case 'quote':
      return (
        <QuoteBlock
          text={block.text}
          author={block.author}
          variant={block.author ? 'side' : 'default'}
        />
      )

    case 'list':
      if (block.ordered) {
        return (
          <ol className="space-y-2.5 mb-6 mr-4">
            {block.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-brand-600 text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-gray-700 leading-relaxed">{item}</span>
              </li>
            ))}
          </ol>
        )
      }
      return (
        <ul className="space-y-2.5 mb-6">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs">✓</span>
              </span>
              <span className="text-gray-700 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )

    case 'image':
      return (
        <figure className="my-8 rounded-2xl overflow-hidden shadow-lg">
          <div className="relative h-72 sm:h-96">
            <Image
              src={block.src}
              alt={block.alt}
              fill
              className="object-cover"
            />
          </div>
          {block.caption && (
            <figcaption className="bg-gray-50 border border-gray-100 text-center text-sm text-gray-500 py-3 px-4 font-medium">
              {block.caption}
            </figcaption>
          )}
        </figure>
      )

    case 'tip':
      return (
        <div className="my-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4">
          <span className="text-2xl flex-shrink-0">{block.label?.split(' ')[0] ?? '💡'}</span>
          <div>
            {block.label && (
              <p className="font-black text-amber-800 text-sm mb-1">
                {block.label.slice(block.label.indexOf(' ') + 1)}
              </p>
            )}
            <p className="text-amber-900 leading-relaxed text-sm">{block.text}</p>
          </div>
        </div>
      )

    case 'highlight':
      return (
        <div className="my-6 bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 text-white">
          <p className="font-bold leading-relaxed">{block.text}</p>
        </div>
      )

    case 'divider':
      return <hr className="my-8 border-gray-200" />

    default:
      return null
  }
}

/* ──────────────────────────────────────────────
   Share buttons (client-side copy link)
──────────────────────────────────────────────── */
function ShareButtons({ title }: { title: string }) {
  const waText = `اقرأ هذا المقال المفيد: ${title}`
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-bold text-gray-500 flex items-center gap-1.5">
        <Share2 size={15} /> شارك المقال:
      </span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(waText)}`}
        target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        واتساب
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(waText)}`}
        target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
      >
        𝕏 تويتر
      </a>
    </div>
  )
}

/* ──────────────────────────────────────────────
   PAGE
──────────────────────────────────────────────── */
export const dynamic = 'force-dynamic'

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article  = await fetchArticleBySlug(params.slug)
  if (!article || article.status !== 'published') notFound()

  const [related, recent] = await Promise.all([
    fetchRelatedArticles(article.slug, article.category, 3),
    fetchRecentArticles(5),
  ])

  return (
    <>
      {/* Reading progress bar at very top */}
      <ReadingProgress />

      {/* ── Article Hero ── */}
      <section className="bg-hero pt-32 pb-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '36px 36px' }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-blue-300/70 mb-6">
            <Link href="/blog" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowRight size={14} />
              المدونة
            </Link>
            <span>/</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${article.categoryColor}`}>
              {article.category}
            </span>
          </nav>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
            {article.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-blue-200/70 text-sm">
            <span className="flex items-center gap-1.5">
              <User size={15} />
              {article.author}
            </span>
            <span className="w-1 h-1 bg-blue-400/40 rounded-full" />
            <span className="flex items-center gap-1.5">
              <Clock size={15} />
              {article.readTime} دقائق للقراءة
            </span>
            <span className="w-1 h-1 bg-blue-400/40 rounded-full" />
            <span>{article.date}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map(tag => (
              <span key={tag} className="bg-white/10 border border-white/20 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <Tag size={11} /> {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hero Image ── */}
      <div className="relative -mt-8 max-w-5xl mx-auto px-4 sm:px-6 z-10">
        <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden shadow-2xl shadow-brand-900/30">
          <Image
            src={article.img}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent" />
        </div>
      </div>

      {/* ── Main Layout: Article + Sidebar ── */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">

            {/* ═══ ARTICLE BODY ═══ */}
            <article className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12">

              {/* Lead excerpt */}
              <p className="text-xl text-brand-700 font-semibold leading-relaxed border-r-4 border-brand-400 pr-5 mb-8 bg-brand-50 py-4 rounded-l-xl">
                {article.excerpt}
              </p>

              {/* Content blocks */}
              <div className="article-body">
                {article.content.map((block, i) => (
                  <RenderBlock key={i} block={block} />
                ))}
              </div>

              {/* ── Article Footer ── */}
              <div className="mt-12 pt-8 border-t border-gray-100 space-y-6">
                {/* Author card */}
                <div className="flex items-start gap-4 bg-brand-50 rounded-2xl p-5 border border-brand-100">
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-600 to-brand-400 rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                    ح
                  </div>
                  <div>
                    <p className="font-black text-gray-900">{article.author}</p>
                    <p className="text-brand-600 text-sm font-semibold mb-2">مدرب التواصل بالإنجليزية</p>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      ساعد أكثر من 2000 طالب من 15 دولة على التحدث بثقة. متخصص في المبتدئين والخجولين.
                    </p>
                  </div>
                </div>

                {/* Share */}
                <ShareButtons title={article.title} />

                {/* CTA */}
                <div className="bg-gradient-to-br from-brand-700 to-brand-900 rounded-2xl p-7 text-center text-white">
                  <p className="font-black text-xl mb-2">هل استفدت من هذا المقال؟</p>
                  <p className="text-blue-100/80 text-sm mb-5 leading-relaxed">
                    ابدأ رحلتك الفعلية مع دوراتنا وتكلم الإنجليزية بثقة في أسابيع.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/courses"
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-7 rounded-xl transition-all duration-300"
                    >
                      عرض الدورات
                    </Link>
                    <a
                      href="https://wa.me/212707902091?text=مرحبا،%20أريد%20تعلم%20الإنجليزية"
                      target="_blank" rel="noopener noreferrer"
                      className="bg-[#25d366] hover:bg-[#20b858] text-white font-bold py-3 px-7 rounded-xl transition-all duration-300"
                    >
                      تواصل على واتساب
                    </a>
                  </div>
                </div>
              </div>
            </article>

            {/* ═══ SIDEBAR ═══ */}
            <div className="lg:sticky lg:top-28">
              <BlogSidebar recentArticles={recent} currentSlug={article.slug} />
            </div>
          </div>

          {/* ── Related Articles ── */}
          {related.length > 0 && (
            <div className="mt-14">
              <h2 className="text-2xl font-black text-gray-900 mb-7">
                مقالات ذات صلة
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map(a => (
                  <ArticleCard key={a.slug} article={a} variant="default" />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

