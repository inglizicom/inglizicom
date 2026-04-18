import { BookOpen } from 'lucide-react'
import { categories } from '@/data/articles'
import { fetchPublishedArticles } from '@/lib/articles-db'
import ArticleCard from '@/components/ArticleCard'
import FadeIn from '@/components/FadeIn'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: { category?: string }
}

export default async function BlogPage({ searchParams }: PageProps) {
  const activeCategory = searchParams.category ?? 'الكل'

  const articles = await fetchPublishedArticles()

  const filtered =
    activeCategory === 'الكل'
      ? articles
      : articles.filter(a => a.category === activeCategory)

  const featured  = articles.find(a => a.featured)
  const rest      = filtered.filter(a => !a.featured || activeCategory !== 'الكل')

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-hero pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '36px 36px' }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <FadeIn>
            <span className="inline-block bg-white/10 border border-white/20 text-blue-100 font-bold text-sm px-4 py-1.5 rounded-full mb-5">
              المدونة
            </span>
            <h1 className="text-5xl font-black text-white mb-5">
              مقالات تساعدك تتعلم أسرع
            </h1>
            <p className="text-blue-100/80 text-xl leading-relaxed max-w-2xl mx-auto mb-8">
              نصائح عملية، أسرار التعلم، وكيف تتجاوز أي عائق في رحلتك مع الإنجليزية.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { value: '15+', label: 'مقال متاح' },
                { value: '4',   label: 'تصنيفات' },
                { value: '100%', label: 'محتوى مجاني' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl font-black text-white">{s.value}</p>
                  <p className="text-blue-200/70 text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* ── Category Tabs ── */}
          <FadeIn>
            <div className="flex flex-wrap gap-3 mb-12 justify-center">
              {categories.map(cat => (
                <a
                  key={cat.label}
                  href={cat.label === 'الكل' ? '/blog' : `/blog?category=${encodeURIComponent(cat.label)}`}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border ${
                    activeCategory === cat.label
                      ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400 hover:text-brand-600'
                  }`}
                >
                  {cat.label}
                </a>
              ))}
            </div>
          </FadeIn>

          {/* ── Featured (only on 'الكل') ── */}
          {activeCategory === 'الكل' && featured && (
            <FadeIn delay={50}>
              <div className="mb-10">
                <ArticleCard article={featured} variant="featured" />
              </div>
            </FadeIn>
          )}

          {/* ── Articles Grid ── */}
          {rest.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((article, i) => (
                <FadeIn key={article.slug} delay={i * 50}>
                  <ArticleCard article={article} variant="default" />
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-black text-gray-700 mb-2">لا توجد مقالات في هذا التصنيف بعد</h2>
              <p className="text-gray-400">تابعنا قريباً لمزيد من المحتوى</p>
            </div>
          )}

          {/* ── Newsletter CTA ── */}
          <FadeIn delay={100}>
            <div className="mt-16 bg-gradient-to-br from-brand-900 to-brand-700 rounded-3xl p-10 text-center text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-5"
                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
              />
              <BookOpen size={44} className="mx-auto mb-4 text-brand-300 relative z-10" />
              <h2 className="text-2xl font-black mb-3 relative z-10">احصل على نصائح أسبوعية مجانية</h2>
              <p className="text-blue-200/80 mb-6 max-w-md mx-auto relative z-10">
                سجّل في قائمتنا عبر واتساب واحصل على نصائح حصرية مباشرة في هاتفك.
              </p>
              <a
                href="https://wa.me/212707902091?text=مرحبا،%20أريد%20الاشتراك%20في%20النصائح%20الأسبوعية"
                target="_blank" rel="noopener noreferrer"
                className="relative z-10 inline-flex items-center gap-2 bg-white text-brand-700 font-black py-3.5 px-8 rounded-2xl hover:bg-brand-50 transition-all duration-300"
              >
                اشترك مجاناً عبر واتساب
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
