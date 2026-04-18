'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft, Save, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { upsertLesson } from '@/lib/lessons-db'
import type { LessonRow } from '@/lib/lessons-db'

const EMPTY: Partial<LessonRow> = {
  id: '', title: '', title_ar: '',
  level: 'A1', emoji: '📚', color: '#3b82f6',
  vocab: [], sentences: [], natural: [], dialogue: [], exercises: [],
  status: 'draft', sort_order: 0,
}

const FIELDS: Array<keyof LessonRow> = ['vocab', 'sentences', 'natural', 'dialogue', 'exercises']

export default function LessonEditPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const isNew  = params.id === 'new'

  const [data, setData]       = useState<Partial<LessonRow>>(EMPTY)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [jsonFields, setJsonFields] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isNew) {
      const j: Record<string, string> = {}
      for (const f of FIELDS) j[f] = '[]'
      setJsonFields(j)
      return
    }
    supabase.from('lessons').select('*').eq('id', params.id).single()
      .then(({ data, error }) => {
        if (error) { setError(error.message); setLoading(false); return }
        setData(data as LessonRow)
        const j: Record<string, string> = {}
        for (const f of FIELDS) j[f] = JSON.stringify((data as LessonRow)[f] ?? [], null, 2)
        setJsonFields(j)
        setLoading(false)
      })
  }, [params.id, isNew])

  async function save() {
    setError(null)
    setSaving(true)
    try {
      const parsed: Partial<LessonRow> = { ...data }
      for (const f of FIELDS) {
        try {
          const v = JSON.parse(jsonFields[f] || '[]')
          if (!Array.isArray(v)) throw new Error(`${f} must be a JSON array`)
          ;(parsed as Record<string, unknown>)[f] = v
        } catch {
          throw new Error(`Invalid JSON in "${f}" field`)
        }
      }
      if (!parsed.id || !parsed.title) throw new Error('ID and title are required')

      const saved = await upsertLesson(parsed as Partial<LessonRow> & { id: string })
      router.replace(`/admin/lessons/${saved.id}`)
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
        <Link href="/admin/lessons" className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800">
          <ArrowLeft size={14} /> Back to lessons
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
        <h2 className="text-lg font-black text-gray-900">{isNew ? 'New lesson' : 'Edit lesson'}</h2>

        <Field label="ID (must match a journey unit ID — e.g. greetings, food)">
          <input type="text" value={data.id ?? ''} onChange={e => setData({ ...data, id: e.target.value })} className={input} disabled={!isNew} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Title (English)">
            <input type="text" value={data.title ?? ''} onChange={e => setData({ ...data, title: e.target.value })} className={input} />
          </Field>
          <Field label="Title (Arabic)">
            <input type="text" dir="rtl" value={data.title_ar ?? ''} onChange={e => setData({ ...data, title_ar: e.target.value })} className={input} />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Level">
            <select value={data.level ?? 'A1'} onChange={e => setData({ ...data, level: e.target.value })} className={input}>
              {['A0','A1','A2','B1','B2','C1'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Emoji">
            <input type="text" value={data.emoji ?? ''} onChange={e => setData({ ...data, emoji: e.target.value })} className={input} />
          </Field>
          <Field label="Color">
            <input type="color" value={data.color ?? '#3b82f6'} onChange={e => setData({ ...data, color: e.target.value })} className="w-full h-10 rounded-lg border border-gray-200" />
          </Field>
        </div>

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

      {FIELDS.map(f => (
        <div key={f} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 capitalize">{f}</h3>
            <p className="text-xs text-gray-400">JSON array</p>
          </div>
          <textarea
            value={jsonFields[f] ?? '[]'}
            onChange={e => setJsonFields(j => ({ ...j, [f]: e.target.value }))}
            spellCheck={false}
            className="w-full min-h-[180px] font-mono text-xs px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            dir="ltr"
          />
        </div>
      ))}
    </main>
  )
}

const input = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-60'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  )
}
