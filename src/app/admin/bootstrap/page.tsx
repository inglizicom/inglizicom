'use client'

import { useState } from 'react'
import { CheckCircle2, AlertCircle, Loader2, Database, FileText, BookOpen } from 'lucide-react'
import { articles as STATIC_ARTICLES } from '@/data/articles'
import { LESSONS_DATA } from '@/data/lessons-data'
import { bootstrapArticles } from '@/lib/articles-db'
import { bootstrapLessons } from '@/lib/lessons-db'

export default function BootstrapPage() {
  const [status, setStatus] = useState<Record<string, { state: 'idle' | 'busy' | 'done' | 'error'; msg?: string }>>({
    articles: { state: 'idle' },
    lessons:  { state: 'idle' },
  })

  async function importArticles() {
    setStatus(s => ({ ...s, articles: { state: 'busy' } }))
    try {
      const rows = STATIC_ARTICLES.map((a, i) => ({
        slug:           a.slug,
        title:          a.title,
        excerpt:        a.excerpt,
        content:        a.content,
        category:       a.category,
        category_color: a.categoryColor,
        tags:           a.tags,
        read_time:      a.readTime,
        date:           a.date,
        img:            a.img,
        featured:       a.featured,
        author:         a.author,
        status:         'published' as const,
        sort_order:     STATIC_ARTICLES.length - i,
      }))
      await bootstrapArticles(rows)
      setStatus(s => ({ ...s, articles: { state: 'done', msg: `Imported ${rows.length} articles` } }))
    } catch (e) {
      setStatus(s => ({ ...s, articles: { state: 'error', msg: e instanceof Error ? e.message : 'failed' } }))
    }
  }

  async function importLessons() {
    setStatus(s => ({ ...s, lessons: { state: 'busy' } }))
    try {
      const rows = LESSONS_DATA.map((l, i) => ({
        ...l,
        status:     'published' as const,
        sort_order: i,
      }))
      await bootstrapLessons(rows)
      setStatus(s => ({ ...s, lessons: { state: 'done', msg: `Imported ${rows.length} lessons` } }))
    } catch (e) {
      setStatus(s => ({ ...s, lessons: { state: 'error', msg: e instanceof Error ? e.message : 'failed' } }))
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      <div>
        <h1 className="text-gray-900 font-black text-xl leading-none">Bootstrap content</h1>
        <p className="text-gray-400 text-xs mt-1">One-time import of static content into Supabase</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 flex items-start gap-2">
        <AlertCircle size={16} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Run this once after migration 004.</p>
          <p className="text-xs mt-1">Re-running is safe — it upserts by slug/id. Existing rows in the DB will be overwritten with the static data.</p>
        </div>
      </div>

      <Card
        icon={<FileText size={20} className="text-indigo-600" />}
        title="Articles"
        subtitle={`${STATIC_ARTICLES.length} articles in src/data/articles.ts`}
        status={status.articles}
        onRun={importArticles}
      />

      <Card
        icon={<BookOpen size={20} className="text-emerald-600" />}
        title="Lessons"
        subtitle={`${LESSONS_DATA.length} lessons in src/data/lessons-data.ts`}
        status={status.lessons}
        onRun={importLessons}
      />

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-600 flex items-start gap-2">
        <Database size={14} className="shrink-0 mt-0.5 text-gray-400" />
        <div>
          <p className="font-bold mb-1">After import:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>You can delete the static <code className="bg-white px-1 py-0.5 rounded">articles.ts</code> / <code className="bg-white px-1 py-0.5 rounded">lessons-data.ts</code> files later — but keep them until everything is verified working.</li>
            <li>The public blog and learn pages now read from Supabase.</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

function Card({ icon, title, subtitle, status, onRun }: {
  icon: React.ReactNode
  title: string
  subtitle: string
  status: { state: 'idle' | 'busy' | 'done' | 'error'; msg?: string }
  onRun: () => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 font-bold">{title}</p>
        <p className="text-gray-400 text-xs">{subtitle}</p>
        {status.msg && (
          <p className={`text-xs mt-1 font-semibold ${
            status.state === 'error' ? 'text-red-600' : 'text-emerald-600'
          }`}>
            {status.state === 'error' ? '✗ ' : '✓ '}{status.msg}
          </p>
        )}
      </div>
      <button
        onClick={onRun}
        disabled={status.state === 'busy'}
        className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {status.state === 'busy' && <Loader2 size={14} className="animate-spin" />}
        {status.state === 'done'  && <CheckCircle2 size={14} />}
        {status.state === 'busy'  ? 'Importing…' :
         status.state === 'done'  ? 'Re-import'  :
         status.state === 'error' ? 'Retry'      : 'Import'}
      </button>
    </div>
  )
}
