import Image from 'next/image'
import Link from 'next/link'
import { Clock, ArrowLeft } from 'lucide-react'
import type { Article } from '@/data/articles'

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'compact' | 'featured'
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  if (variant === 'compact') {
    return (
      <Link href={`/blog/${article.slug}`} className="flex gap-3 group">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
          <Image src={article.img} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${article.categoryColor}`}>
            {article.category}
          </span>
          <h4 className="text-sm font-bold text-gray-900 leading-snug mt-1 line-clamp-2 group-hover:text-brand-600 transition-colors">
            {article.title}
          </h4>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Clock size={11} /> {article.readTime} دقائق
          </p>
        </div>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Link href={`/blog/${article.slug}`} className="group block bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-brand-100 transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative h-64 lg:h-auto min-h-[280px] overflow-hidden">
            <Image
              src={article.img} alt={article.title} fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
            <span className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md">
              ✨ مقال مميز
            </span>
          </div>
          <div className="p-8 lg:p-10 flex flex-col justify-center">
            <span className={`inline-block ${article.categoryColor} text-xs font-black px-3 py-1 rounded-full mb-4 w-fit`}>
              {article.category}
            </span>
            <h2 className="text-2xl font-black text-gray-900 mb-3 leading-tight group-hover:text-brand-700 transition-colors">
              {article.title}
            </h2>
            <p className="text-gray-500 leading-relaxed mb-5 line-clamp-3">{article.excerpt}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
              <span className="flex items-center gap-1.5"><Clock size={14} />{article.readTime} دقائق</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>{article.date}</span>
            </div>
            <span className="inline-flex items-center gap-2 text-brand-600 font-bold group-hover:gap-3 transition-all">
              اقرأ المقال <ArrowLeft size={16} />
            </span>
          </div>
        </div>
      </Link>
    )
  }

  // default card
  return (
    <Link href={`/blog/${article.slug}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-brand-100/50 hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={article.img} alt={article.title} fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
        <span className={`absolute top-3 right-3 ${article.categoryColor} text-xs font-black px-2.5 py-1 rounded-full shadow-sm`}>
          {article.category}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-black text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-brand-700 transition-colors">
          {article.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Clock size={12} />{article.readTime} دقائق</span>
            <span>{article.date}</span>
          </div>
          <span className="text-brand-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
            اقرأ <ArrowLeft size={13} />
          </span>
        </div>
      </div>
    </Link>
  )
}
