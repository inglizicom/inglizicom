'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft, Save, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { upsertArticle } from '@/lib/articles-db'
import type { ArticleRow } from '@/lib/articles-db'

const EMPTY: Partial<ArticleRow> = {
  slug: '',
  title: '',
  excerpt: '',
  content: [],
  category: '',
  category_color: '#3b82f6',
  tags: [],
  read_time: '5 د',
  date: '',
  img: '',
  featured: false,
  author: '',
  status: 'draft',
  sort_order: 0,
}

export default function ArticleEditPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const isNew  = params.id === 'new'

  const [data, setData]       = useState<Partial<ArticleRow>>(EMPTY)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [contentJson, setContentJson] = useState('[]')
  const [tagsCsv, setTagsCsv]         = useState('')

  useEffect(() => {
    if (isNew) {
      setContentJson('[]')
      return
    }
    supabase.from('articles').select('*').eq('id', params.id).single()
      .then(({ data, error }) => {
        if (error) { setError(error.message); setLoading(false); return }
        setData(data as ArticleRow)
        setContentJson(JSON.stringify(data.content ?? [], null, 2))
        setTagsCsv(((data.tags as string[]) ?? []).join(', '))
        setLoading(false)
      })
  }, [params.id, isNew])

  async function save() {
    setError(null)
    setSaving(true)
    try {
      let parsedContent: unknown = []
      try { parsedContent = JSON.parse(contentJson || '[]') }
      catch { throw new Error('Content JSON is invalid — fix the syntax') }
      if (!Array.isArray(parsedContent)) throw new Error('Content must be a JSON array')

      const tags = tagsCsv.split(',').map(t => t.trim()).filter(Boolean)

      const payload = {
        ...data,
        content: parsedContent,
        tags,
      } as Partial<ArticleRow> & { slug: string }

      if (!payload.slug || !payload.title) throw new Error('Slug and title are required')

      const saved = await upsertArticle(payload)
      router.replace(`/admin/articles/${saved.id}`)
      setData(saved)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-indigo-400" />
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      <div className="flex items-center justify-between">
        <Link href="/admin/articles" className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800">
          <ArrowLeft size={14} /> Back to articles
        </Link>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-red-700 text-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">

        <h2 className="text-lg font-black text-gray-900">{isNew ? 'New article' : 'Edit article'}</h2>

        <Field label="Slug (URL — e.g. how-to-learn)">
          <input type="text" value={data.slug ?? ''} onChange={e => setData({ ...data, slug: e.target.value })} className={input} />
        </Field>

        <Field label="Title (Arabic)">
          <input type="text" dir="rtl" value={data.title ?? ''} onChange={e => setData({ ...data, title: e.target.value })} className={input} />
        </Field>

        <Field label="Excerpt (Arabic)">
          <textarea dir="rtl" value={data.excerpt ?? ''} onChange={e => setData({ ...data, excerpt: e.target.value })} className={input + ' min-h-[80px]'} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <input type="text" dir="rtl" value={data.category ?? ''} onChange={e => setData({ ...data, category: e.target.value })} className={input} />
          </Field>
          <Field label="Category color">
            <input type="color" value={data.category_color ?? '#3b82f6'} onChange={e => setData({ ...data, category_color: e.target.value })} className="w-full h-10 rounded-lg border border-gray-200" />
          </Field>
        </div>

        <Field label="Tags (comma-separated)">
          <input type="text" dir="rtl" value={tagsCsv} onChange={e => setTagsCsv(e.target.value)} className={input} />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Read time">
            <input type="text" dir="rtl" value={data.read_time ?? ''} onChange={e => setData({ ...data, read_time: e.target.value })} className={input} />
          </Field>
          <Field label="Date">
            <input type="text" dir="rtl" value={data.date ?? ''} onChange={e => setData({ ...data, date: e.target.value })} className={input} />
          </Field>
          <Field label="Author">
            <input type="text" dir="rtl" value={data.author ?? ''} onChange={e => setData({ ...data, author: e.target.value })} className={input} />
          </Field>
        </div>

        <Field label="Cover image URL">
          <input type="text" value={data.img ?? ''} onChange={e => setData({ ...data, img: e.target.value })} className={input} />
        </Field>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input type="checkbox" checked={!!data.featured} onChange={e => setData({ ...data, featured: e.target.checked })} className="w-4 h-4" />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={data.status === 'published'}
              onChange={e => setData({ ...data, status: e.target.checked ? 'published' : 'draft' })}
              className="w-4 h-4"
            />
            Published
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Content blocks (JSON)</h3>
          <p className="text-xs text-gray-400">Array of blocks: paragraph, heading, quote, list, image, tip, highlight, divider</p>
        </div>
        <textarea
          value={contentJson}
          onChange={e => setContentJson(e.target.value)}
          spellCheck={false}
          className="w-full min-h-[400px] font-mono text-xs px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          dir="ltr"
        />
        <p className="text-xs text-gray-500">
          Example block: <code className="bg-gray-100 px-1 rounded">{`{"type":"paragraph","text":"..."}`}</code>
        </p>
      </div>
    </main>
  )
}

const input = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  )
}
