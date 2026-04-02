interface QuoteBlockProps {
  text: string
  author?: string
  variant?: 'default' | 'side' | 'featured'
}

export default function QuoteBlock({ text, author, variant = 'default' }: QuoteBlockProps) {
  if (variant === 'side') {
    return (
      <aside className="my-8 border-r-4 border-brand-500 bg-brand-50 rounded-l-2xl pr-6 pl-4 py-5">
        <p className="text-brand-800 font-bold text-lg leading-relaxed italic">
          "{text}"
        </p>
        {author && (
          <p className="text-brand-600 font-semibold text-sm mt-3">— {author}</p>
        )}
      </aside>
    )
  }

  if (variant === 'featured') {
    return (
      <div className="my-8 bg-gradient-to-br from-brand-700 to-brand-900 rounded-2xl p-8 text-center relative overflow-hidden">
        <div className="absolute top-2 right-4 text-7xl text-white/10 font-serif select-none">"</div>
        <p className="text-white font-bold text-xl leading-relaxed relative z-10">
          "{text}"
        </p>
        {author && (
          <p className="text-blue-300 font-semibold text-sm mt-3 relative z-10">— {author}</p>
        )}
      </div>
    )
  }

  // default
  return (
    <blockquote className="my-6 relative">
      <div className="absolute top-0 right-0 text-6xl text-brand-100 font-serif leading-none select-none">
        "
      </div>
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 pr-8">
        <p className="text-gray-700 font-semibold text-lg leading-relaxed italic">
          "{text}"
        </p>
        {author && (
          <p className="text-brand-600 font-bold text-sm mt-2">— {author}</p>
        )}
      </div>
    </blockquote>
  )
}
