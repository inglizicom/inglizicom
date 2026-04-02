import Link from 'next/link'
import { ArrowLeft, Tag } from 'lucide-react'
import ArticleCard from './ArticleCard'
import type { Article } from '@/data/articles'
import { categories } from '@/data/articles'

interface BlogSidebarProps {
  recentArticles: Article[]
  currentSlug?: string
}

export default function BlogSidebar({ recentArticles, currentSlug }: BlogSidebarProps) {
  return (
    <aside className="space-y-6">

      {/* ── WhatsApp CTA Card ── */}
      <div className="bg-gradient-to-br from-brand-700 to-brand-900 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <div className="text-3xl mb-3">🎯</div>
          <h3 className="font-black text-xl mb-2 leading-tight">
            ابدأ تعلم الإنجليزية الآن
          </h3>
          <p className="text-blue-100/80 text-sm leading-relaxed mb-5">
            انضم لأكثر من 2000 طالب وحسّن مستواك في أسابيع قليلة.
          </p>
          <div className="space-y-3">
            <Link
              href="/courses"
              className="block text-center bg-orange-500 hover:bg-orange-600 text-white font-black py-3 rounded-xl transition-all duration-300 text-sm"
            >
              عرض الدورات
            </Link>
            <a
              href="https://wa.me/212707902091?text=مرحبا،%20أريد%20تعلم%20الإنجليزية"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#20b858] text-white font-bold py-3 rounded-xl transition-all duration-300 text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              احجز عبر واتساب
            </a>
          </div>
        </div>
      </div>

      {/* ── Level Test CTA ── */}
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 text-center">
        <div className="text-3xl mb-2">🎯</div>
        <h3 className="font-black text-gray-900 mb-1.5">اختبر مستواك</h3>
        <p className="text-gray-500 text-xs mb-4 leading-relaxed">10 أسئلة تحدد مستواك وتوجهك للدورة المناسبة.</p>
        <Link
          href="/level-test"
          className="block text-center bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all duration-300"
        >
          ابدأ مجاناً
        </Link>
      </div>

      {/* ── Categories ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
          <Tag size={16} className="text-brand-500" />
          التصنيفات
        </h3>
        <div className="space-y-2">
          {categories.slice(1).map((cat) => (
            <Link
              key={cat.label}
              href={`/blog?category=${encodeURIComponent(cat.label)}`}
              className="flex items-center justify-between group px-3 py-2 rounded-xl hover:bg-brand-50 transition-colors"
            >
              <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${cat.color}`}>
                {cat.label}
              </span>
              <ArrowLeft size={14} className="text-gray-400 group-hover:text-brand-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent Articles ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-black text-gray-900 mb-4">أحدث المقالات</h3>
        <div className="space-y-5">
          {recentArticles
            .filter(a => a.slug !== currentSlug)
            .slice(0, 4)
            .map(article => (
              <ArticleCard key={article.slug} article={article} variant="compact" />
            ))
          }
        </div>
      </div>

      {/* ── Tags Cloud ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-black text-gray-900 mb-4">الوسوم الشائعة</h3>
        <div className="flex flex-wrap gap-2">
          {['نطق', 'مبتدئ', 'تحدث', 'مفردات', 'قواعد', 'ثقة', 'سفر', 'عمل', 'روتين', 'تقنيات', 'أخطاء', 'تحفيز'].map(tag => (
            <span
              key={tag}
              className="bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 cursor-pointer transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </aside>
  )
}
