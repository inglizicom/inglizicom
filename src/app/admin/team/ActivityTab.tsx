'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Download, Loader2, LogIn, RotateCcw } from 'lucide-react'
import { ErrorNote, INP } from '@/components/crm/kit'
import { describeAction, fetchActivity, fieldAr, type ActivityRow, type TeamMember } from '@/lib/founder'
import { CARD, Initial } from './_shared'

/**
 * سجل النشاط — every move a founder or assistant made, as the database saw
 * it: who, what, on which record, when, and exactly which fields changed.
 * Filter by person, kind of record and period; export what you see as CSV.
 */

const ENTITIES: [string, string][] = [
  ['', 'كل الأنواع'], ['lead', 'العملاء'], ['student', 'الطلاب'], ['payment', 'المدفوعات'],
  ['class', 'الأقسام'], ['class_enrollment', 'التسجيل في الأقسام'], ['course_enrollment', 'التسجيل في الدورات'],
  ['teacher_assignment', 'إسناد الأساتذة'], ['teacher', 'الأساتذة'], ['profile', 'الحسابات'],
  ['payout', 'الرواتب'], ['task', 'المهام'], ['announcement', 'الإعلانات'], ['broadcast', 'الرسائل'], ['session', 'الجلسات'],
]
const PERIODS: [string, string, number][] = [['today', 'اليوم', 0], ['7d', '7 أيام', 7], ['30d', '30 يومًا', 30], ['90d', '90 يومًا', 90]]

export default function ActivityTab({ people, actor, onActor }: {
  people: TeamMember[] | null
  actor: string
  onActor: (id: string) => void
}) {
  const [entity, setEntity] = useState('')
  const [period, setPeriod] = useState('7d')
  const [rows, setRows] = useState<ActivityRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState<Set<string>>(new Set())

  async function load() {
    setLoading(true); setError(null)
    const days = PERIODS.find(p => p[0] === period)?.[2] ?? 7
    const from = new Date(); from.setHours(0, 0, 0, 0); from.setDate(from.getDate() - days)
    try { setRows(await fetchActivity({ actor: actor || null, entity: entity || null, from: from.toISOString(), limit: 1000 })) }
    catch (e: any) { setError(e?.message ?? 'تعذّر تحميل السجل') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [actor, entity, period]) // eslint-disable-line react-hooks/exhaustive-deps

  const byDay = useMemo(() => {
    const m = new Map<string, ActivityRow[]>()
    for (const r of rows ?? []) {
      const d = new Date(r.created_at).toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long' })
      if (!m.has(d)) m.set(d, [])
      m.get(d)!.push(r)
    }
    return [...m.entries()]
  }, [rows])

  function exportCsv() {
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = [['التاريخ', 'الشخص', 'الإجراء', 'النوع', 'السجل', 'قبل', 'بعد'].map(esc).join(',')]
    for (const r of rows ?? []) {
      lines.push([new Date(r.created_at).toISOString(), r.actor_name, describeAction(r), r.entity_type, r.entity_label,
        JSON.stringify(r.before_value ?? ''), JSON.stringify(r.after_value ?? '')].map(esc).join(','))
    }
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `activity-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
  }

  const staff = (people ?? []).filter(p => p.role !== 'teacher')

  return (
    <div className="space-y-4">
      {/* filters */}
      <div className={`${CARD} p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2.5 items-end`}>
        <label className="block min-w-0">
          <span className="block text-[11px] font-bold text-zinc-500 mb-1">الشخص</span>
          <select value={actor} onChange={e => onActor(e.target.value)} className={INP}>
            <option value="">كل الفريق</option>
            {staff.map(p => <option key={p.id} value={p.id}>{p.name}{p.role === 'founder' ? ' (مؤسس)' : ''}</option>)}
          </select>
        </label>
        <label className="block min-w-0">
          <span className="block text-[11px] font-bold text-zinc-500 mb-1">النوع</span>
          <select value={entity} onChange={e => setEntity(e.target.value)} className={INP}>
            {ENTITIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {PERIODS.map(([v, l]) => (
            <button key={v} onClick={() => setPeriod(v)}
                    className={`px-3 py-2 rounded-lg text-[12px] font-bold whitespace-nowrap transition-colors
                                ${period === v ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[12.5px] font-bold text-zinc-500">{rows ? `${rows.length} إجراء` : ''}</span>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-zinc-200 text-[12px] font-bold text-zinc-600 hover:border-blue-300">
            <RotateCcw size={13} /> تحديث
          </button>
          <button onClick={exportCsv} disabled={!rows?.length} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-zinc-200 text-[12px] font-bold text-zinc-600 hover:border-blue-300 disabled:opacity-40">
            <Download size={13} /> CSV
          </button>
        </div>
      </div>

      <ErrorNote>{error}</ErrorNote>
      {loading && !rows && <div className="py-16 flex justify-center text-zinc-400"><Loader2 className="animate-spin" /></div>}
      {rows && rows.length === 0 && <div className={`${CARD} p-10 text-center text-[13px] text-zinc-400`}>لا نشاط في هذه الفترة.</div>}

      {byDay.map(([day, list]) => (
        <section key={day}>
          <div className="text-[12px] font-extrabold text-zinc-500 mb-2 px-1">{day}</div>
          <div className={`${CARD} divide-y divide-zinc-100 overflow-hidden`}>
            {list.map(r => {
              const isOpen = open.has(r.id)
              const changed = Object.keys(r.after_value ?? r.before_value ?? {})
              const diffable = r.action.endsWith('_updated') || r.action.endsWith('_changed') || r.action.endsWith('_blocked')
                || r.action.endsWith('_unblocked') || r.action.endsWith('_archived') || r.action.endsWith('_activated') || r.action.endsWith('_deactivated')
              return (
                <div key={r.id}>
                  <button onClick={() => setOpen(s => { const n = new Set(s); n.has(r.id) ? n.delete(r.id) : n.add(r.id); return n })}
                          className="w-full flex items-start gap-3 px-3.5 sm:px-4 py-3 text-right hover:bg-zinc-50 transition-colors">
                    {r.action === 'session_started'
                      ? <span className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><LogIn size={15} /></span>
                      : <Initial name={r.actor_name ?? '?'} size={36} tone={r.actor_role === 'founder' ? 'gold' : 'blue'} />}
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] text-zinc-800 leading-snug">
                        <b className="font-extrabold text-zinc-900">{r.actor_name ?? 'النظام'}</b> {describeAction(r)}
                      </span>
                      {diffable && changed.length > 0 && !isOpen && (
                        <span className="block text-[11.5px] text-zinc-400 truncate">{changed.map(fieldAr).join('، ')}</span>
                      )}
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-400 shrink-0 mt-0.5" dir="ltr">
                      {new Date(r.created_at).toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {(r.after_value || r.before_value) && (
                      <ChevronDown size={15} className={`text-zinc-300 shrink-0 mt-0.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {isOpen && (r.after_value || r.before_value) && (
                    <div className="px-4 pb-3.5 pr-[60px]">
                      <Diff before={r.before_value} after={r.after_value} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

function show(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'boolean') return v ? 'نعم' : 'لا'
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return new Date(v).toLocaleString('ar-MA', { dateStyle: 'medium', timeStyle: 'short' })
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

function Diff({ before, after }: { before: Record<string, unknown> | null; after: Record<string, unknown> | null }) {
  const keys = [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])]
    .filter(k => !['id', 'created_at', 'added_by_id', 'created_by'].includes(k))
  if (keys.length === 0) return null
  const both = !!before && !!after
  return (
    <div className="rounded-xl bg-zinc-50 border border-zinc-100 divide-y divide-zinc-100 text-[12px]">
      {keys.map(k => (
        <div key={k} className="grid grid-cols-[110px_1fr] gap-2 px-3 py-2">
          <span className="font-bold text-zinc-500 truncate">{fieldAr(k)}</span>
          <span className="min-w-0 break-words">
            {both && <><span className="text-rose-600 line-through decoration-rose-300"><bdi>{show(before?.[k])}</bdi></span><span className="text-zinc-300 mx-1.5">←</span></>}
            <span className={both ? 'text-emerald-700 font-bold' : 'text-zinc-700'}><bdi>{show((after ?? before)?.[k])}</bdi></span>
          </span>
        </div>
      ))}
    </div>
  )
}
