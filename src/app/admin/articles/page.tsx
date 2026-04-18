'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText, Plus, Pencil, Trash2, Eye, EyeOff,
  Loader2, AlertCircle, RefreshCw, Search, Star,
} from 'lucide-react'
import { fetchAllArticles, deleteArticle, upsertArticle } from '@/lib/articles-db'

type Row = Awaited<ReturnType<typeof fetchAllArticles>>[number]

export default function ArticlesAdminPage() {
  const [rows, setRows]         = useState<Row[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [search, setSearch]     = useState('')
  const [busy, setBusy]         = useState<string | null>(null)
  const [toast, setToast]       = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setRows(await fetchAllArticles())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function showToast(msg: string) {
    setToast(msg); setTimeout(() => setToast(null), 2200)
  }

  async function togglePublish(r: Row) {
    setBusy(r.uuid)
    try {
      await upsertArticle({
        id: r.uuid,
        slug: r.slug,
        status: r.status === 'published' ? 'draft' : 'published',
      })
      await load()
      showToast(r.status === 'published' ? 'Unpublished' : 'Published ✓')
    } catch (e) {
      showToast('Error: ' + (e instanceof Error ? e.message : 'failed'))
    }
    setBusy(null)
  }

  async function del(r: Row) {
    if (!confirm(`Delete article "${r.title}"? This cannot be undone.`)) return
    setBusy(r.uuid)
    try {
      await deleteArticle(r.uuid)
      setRows(prev => prev.filter(x => x.uuid !== r.uuid))
      showToast('Deleted')
    } catch (e) {
      showToast('Error: ' + (e instanceof Error ? e.message : 'failed'))
    }
    setBusy(null)
  }

  const q = search.toLowerCase()
  const filtered = rows.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.slug.toLowerCase().includes(q) ||
    r.category.toLowerCase().includes(q)
  )

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 font-black text-xl leading-none">Articles</h1>
          <p className="text-gray-400 text-xs mt-1">Manage blog posts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link
            href="/admin/articles/new"
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus size={14} /> New article
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-gray-500" />
            <h2 className="font-bold text-gray-800">All articles</h2>
            {!loading && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">
                {filtered.length}
              </span>
            )}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search title, slug, category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50 w-64"
            />
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Loader2 size={28} className="animate-spin text-indigo-400" />
            <p className="text-sm font-medium">Loading articles…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-red-500">
            <AlertCircle size={24} />
            <p className="text-sm font-semibold">{error}</p>
            <button onClick={load} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600">Try again</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <FileText size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No articles yet.</p>
            <Link href="/admin/articles/new" className="text-indigo-600 text-xs font-bold hover:underline mt-2 inline-block">
              Create your first article →
            </Link>
            <p className="text-xs text-gray-400 mt-3">
              Or import the existing 15 articles via <Link href="/admin/bootstrap" className="text-indigo-500 hover:underline">/admin/bootstrap</Link>.
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="divide-y divide-gray-50">
            {filtered.map(r => {
              const isBusy = busy === r.uuid
              const published = r.status === 'published'
              return (
                <div key={r.uuid} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {r.img && <img src={r.img} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-gray-900 font-semibold text-sm truncate" dir="rtl">{r.title}</p>
                      {r.featured && <Star size={12} className="text-amber-500 fill-amber-500" />}
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
                        style={{ background: r.categoryColor + '20', color: r.categoryColor }}
                      >
                        {r.category}
                      </span>
                      {published ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 uppercase">Live</span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 uppercase">Draft</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs font-mono truncate">{r.slug}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {isBusy && <Loader2 size={14} className="animate-spin text-gray-400 mr-1" />}
                    <button
                      onClick={() => togglePublish(r)}
                      disabled={isBusy}
                      title={published ? 'Unpublish' : 'Publish'}
                      className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-30"
                    >
                      {published ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <Link
                      href={`/admin/articles/${r.uuid}`}
                      className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={() => del(r)}
                      disabled={isBusy}
                      title="Delete"
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl z-50 ${
          toast.startsWith('Error') ? 'bg-red-600' : 'bg-gray-900'
        }`}>
          {toast}
        </div>
      )}
    </main>
  )
}
