'use client'

/**
 * /admin/present/functions/edit — founder editor for the Language Functions
 * teaching content (DB table `language_functions`, migration 033). Edit each
 * function's title/emoji/intro, its ask/give phrase groups, and the example
 * mini-dialogues. "Save" upserts the whole collection (sort_order = position)
 * and deletes any removed functions. The deck at ../functions reads the same
 * rows; the bundled src/data/functions.ts remains the offline fallback.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Plus, Trash2, ChevronUp, ChevronDown, Save, Play, ArrowLeft } from 'lucide-react'
import { fetchAllFunctions, saveAllFunctions, type LangFunction } from '@/lib/functions'

const inp = 'w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900'
const ar = { fontFamily: "'Tajawal', sans-serif" } as const

export default function FunctionsEditor() {
  const [list, setList] = useState<LangFunction[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => { fetchAllFunctions().then(f => { setList(f); setLoading(false) }) }, [])

  /* immutable updaters keyed by index */
  const setFn = (fi: number, patch: Partial<LangFunction>) =>
    setList(l => l.map((f, i) => (i === fi ? { ...f, ...patch } : f)))
  const setGroup = (fi: number, gi: number, patch: Partial<LangFunction['groups'][number]>) =>
    setFn(fi, { groups: list[fi].groups.map((g, i) => (i === gi ? { ...g, ...patch } : g)) })
  const setLine = (fi: number, gi: number, li: number, patch: Partial<{ en: string; ar: string }>) =>
    setGroup(fi, gi, { lines: list[fi].groups[gi].lines.map((ln, i) => (i === li ? { ...ln, ...patch } : ln)) })
  const setEx = (fi: number, ei: number, side: 'q' | 'a', patch: Partial<{ en: string; ar: string }>) =>
    setFn(fi, { examples: list[fi].examples.map((ex, i) => (i === ei ? { ...ex, [side]: { ...ex[side], ...patch } } : ex)) })

  const move = (fi: number, d: number) => setList(l => {
    const j = fi + d
    if (j < 0 || j >= l.length) return l
    const n = [...l]; [n[fi], n[j]] = [n[j], n[fi]]; return n
  })
  const addFn = () => setList(l => [...l, {
    id: `fn-${Date.now()}`, title: 'New function', ar: '', emoji: '💬', intro: '',
    groups: [{ label: 'Ask', ar: '', lines: [{ en: '', ar: '' }] }],
    examples: [{ q: { en: '', ar: '' }, a: { en: '', ar: '' } }],
  }])
  const removeFn = (fi: number) => setList(l => l.filter((_, i) => i !== fi))

  async function save() {
    setSaving(true); setMsg(null)
    const err = await saveAllFunctions(list)
    setSaving(false)
    setMsg(err ? { ok: false, text: err } : { ok: true, text: 'تم الحفظ — Saved' })
    if (!err) setTimeout(() => setMsg(null), 2500)
  }

  if (loading) return (
    <div className="flex items-center gap-2 text-zinc-400 p-8"><Loader2 className="animate-spin" size={18} /> Loading…</div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-28">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-black">Language Functions — وظائف اللغة</h1>
        <Link href="/admin/present/functions" className="flex items-center gap-1.5 text-[13px] font-bold text-yellow-600 hover:text-yellow-700"><Play size={15} /> Preview deck</Link>
      </div>
      <p className="text-sm text-zinc-500 mb-6">Edit the bilingual content shown in the recording deck. English on the left, Arabic on the right.</p>

      <div className="space-y-5">
        {list.map((fn, fi) => (
          <div key={fn.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_10px_30px_-26px_rgba(42,29,18,0.5)]">
            {/* function header */}
            <div className="flex items-start gap-2 mb-3">
              <input value={fn.emoji} onChange={e => setFn(fi, { emoji: e.target.value })} className={`${inp} w-14 text-center text-lg`} aria-label="emoji" />
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input value={fn.title} onChange={e => setFn(fi, { title: e.target.value })} placeholder="English title" className={inp} />
                <input dir="rtl" style={ar} value={fn.ar} onChange={e => setFn(fi, { ar: e.target.value })} placeholder="العنوان بالعربية" className={inp} />
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => move(fi, -1)} disabled={fi === 0} className="text-stone-400 hover:text-stone-700 disabled:opacity-25" aria-label="up"><ChevronUp size={16} /></button>
                <button onClick={() => move(fi, 1)} disabled={fi === list.length - 1} className="text-stone-400 hover:text-stone-700 disabled:opacity-25" aria-label="down"><ChevronDown size={16} /></button>
              </div>
              <button onClick={() => removeFn(fi)} className="text-red-300 hover:text-red-600" aria-label="delete function"><Trash2 size={16} /></button>
            </div>
            <input dir="rtl" style={ar} value={fn.intro} onChange={e => setFn(fi, { intro: e.target.value })} placeholder="ملاحظة تعليمية قصيرة بالعربية" className={`${inp} mb-4`} />

            {/* groups */}
            <div className="grid sm:grid-cols-2 gap-3">
              {fn.groups.map((g, gi) => (
                <div key={gi} className="rounded-xl bg-amber-50/50 ring-1 ring-amber-100 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <input value={g.label} onChange={e => setGroup(fi, gi, { label: e.target.value })} placeholder="Group label" className={`${inp} text-[13px] font-bold`} />
                    <input dir="rtl" style={ar} value={g.ar} onChange={e => setGroup(fi, gi, { ar: e.target.value })} placeholder="العنوان" className={`${inp} text-[13px]`} />
                    <button onClick={() => setFn(fi, { groups: fn.groups.filter((_, i) => i !== gi) })} className="text-red-300 hover:text-red-600 shrink-0" aria-label="delete group"><Trash2 size={14} /></button>
                  </div>
                  <div className="space-y-1.5">
                    {g.lines.map((ln, li) => (
                      <div key={li} className="flex items-center gap-1.5">
                        <input value={ln.en} onChange={e => setLine(fi, gi, li, { en: e.target.value })} placeholder="English" className={`${inp} text-[13px]`} />
                        <input dir="rtl" style={ar} value={ln.ar} onChange={e => setLine(fi, gi, li, { ar: e.target.value })} placeholder="العربية" className={`${inp} text-[13px]`} />
                        <button onClick={() => setGroup(fi, gi, { lines: g.lines.filter((_, i) => i !== li) })} className="text-red-200 hover:text-red-600 shrink-0" aria-label="delete line"><Trash2 size={13} /></button>
                      </div>
                    ))}
                    <button onClick={() => setGroup(fi, gi, { lines: [...g.lines, { en: '', ar: '' }] })} className="flex items-center gap-1 text-[12px] font-bold text-amber-700 hover:text-amber-900 mt-1"><Plus size={13} /> phrase</button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setFn(fi, { groups: [...fn.groups, { label: '', ar: '', lines: [{ en: '', ar: '' }] }] })} className="flex items-center gap-1 text-[12px] font-bold text-stone-500 hover:text-stone-800 mt-2"><Plus size={13} /> group</button>

            {/* examples */}
            <div className="mt-4 border-t border-stone-100 pt-3">
              <div className="text-[12px] font-black text-stone-500 mb-2" dir="rtl" style={ar}>أمثلة · Examples</div>
              <div className="space-y-2">
                {fn.examples.map((ex, ei) => (
                  <div key={ei} className="grid grid-cols-[1fr_1fr_auto] gap-1.5 items-center">
                    <input value={ex.q.en} onChange={e => setEx(fi, ei, 'q', { en: e.target.value })} placeholder="Question (EN)" className={`${inp} text-[13px]`} />
                    <input value={ex.a.en} onChange={e => setEx(fi, ei, 'a', { en: e.target.value })} placeholder="Answer (EN)" className={`${inp} text-[13px]`} />
                    <button onClick={() => setFn(fi, { examples: fn.examples.filter((_, i) => i !== ei) })} className="text-red-200 hover:text-red-600 row-span-2" aria-label="delete example"><Trash2 size={14} /></button>
                    <input dir="rtl" style={ar} value={ex.q.ar} onChange={e => setEx(fi, ei, 'q', { ar: e.target.value })} placeholder="السؤال" className={`${inp} text-[13px]`} />
                    <input dir="rtl" style={ar} value={ex.a.ar} onChange={e => setEx(fi, ei, 'a', { ar: e.target.value })} placeholder="الجواب" className={`${inp} text-[13px]`} />
                  </div>
                ))}
                <button onClick={() => setFn(fi, { examples: [...fn.examples, { q: { en: '', ar: '' }, a: { en: '', ar: '' } }] })} className="flex items-center gap-1 text-[12px] font-bold text-stone-500 hover:text-stone-800 mt-1"><Plus size={13} /> example</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addFn} className="flex items-center gap-1.5 text-[13px] font-bold text-stone-600 hover:text-stone-900 mt-5"><Plus size={15} /> Add function</button>

      {/* sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-stone-200 px-4 py-3 z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <Link href="/admin/present" className="flex items-center gap-1.5 text-[13px] font-bold text-stone-500 hover:text-stone-800"><ArrowLeft size={15} /> Decks</Link>
          {msg && <span className={`text-[13px] font-bold ${msg.ok ? 'text-green-600' : 'text-red-600'}`} dir="auto">{msg.text}</span>}
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[#2a1d12] disabled:opacity-50" style={{ background: '#facc15' }}>
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save
          </button>
        </div>
      </div>
    </div>
  )
}
