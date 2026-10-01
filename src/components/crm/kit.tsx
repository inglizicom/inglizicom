'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Check, Loader2, Search, X } from 'lucide-react'
import { fetchStudents } from '@/lib/crm-db'
import type { CrmStudent } from '@/lib/crm-types'

/* Shared pieces for the enrollment screens of the CRM (classes, student
   profile, teachers). Same visual language as the rest of /sales: zinc
   surfaces, yellow accent, RTL. */

export const INP =
  'w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-zinc-50'

export function Modal({ title, onClose, children, wide }: {
  title: string; onClose: () => void; children: React.ReactNode; wide?: boolean
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" dir="rtl" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'} bg-white rounded-t-3xl sm:rounded-2xl border border-zinc-200 shadow-xl max-h-[92vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 sticky top-0 bg-white z-10">
          <h2 className="font-black text-[16px] text-zinc-900">{title}</h2>
          <button onClick={onClose} aria-label="إغلاق" className="text-zinc-400 hover:text-zinc-700"><X size={19} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11.5px] font-bold text-zinc-500 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-zinc-400 mt-1">{hint}</span>}
    </label>
  )
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  if (!children) return null
  return <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-[13px] font-bold text-red-700">{children}</div>
}

const BADGE: Record<string, string> = {
  active:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  waitlisted: 'bg-amber-50 text-amber-700 border-amber-200',
  completed:  'bg-sky-50 text-sky-700 border-sky-200',
  cancelled:  'bg-zinc-100 text-zinc-500 border-zinc-200',
  group:      'bg-violet-50 text-violet-700 border-violet-200',
  private:    'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  archived:   'bg-zinc-100 text-zinc-500 border-zinc-200',
}
export function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-bold whitespace-nowrap ${BADGE[tone] ?? BADGE.cancelled}`}>
      {children}
    </span>
  )
}

/**
 * A confirmation for anything that ends or removes something. Says what will
 * and will not be lost, and can ask for a reason that is stored with the record.
 */
export function ConfirmDialog({
  title, body, keeps, confirmLabel, askReason, reasonLabel = 'السبب (يُحفظ في السجل)', danger = true,
  onConfirm, onClose,
}: {
  title: string
  body: React.ReactNode
  /** What survives — shown so staff know history is safe. */
  keeps?: string[]
  confirmLabel: string
  askReason?: boolean
  reasonLabel?: string
  danger?: boolean
  onConfirm: (reason: string) => Promise<void>
  onClose: () => void
}) {
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function go() {
    setBusy(true); setError(null)
    try { await onConfirm(reason.trim()); onClose() }
    catch (e: any) { setError(e?.message ?? 'تعذّر تنفيذ العملية.'); setBusy(false) }
  }
  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-2.5">
          <AlertTriangle size={17} className={danger ? 'text-red-500 shrink-0 mt-0.5' : 'text-amber-500 shrink-0 mt-0.5'} />
          <div className="text-[13.5px] text-zinc-700 leading-relaxed">{body}</div>
        </div>
        {keeps && keeps.length > 0 && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3.5 py-2.5 text-[12.5px] text-emerald-800">
            <div className="font-bold mb-1">يبقى محفوظًا:</div>
            <ul className="space-y-0.5">{keeps.map(k => <li key={k}>· {k}</li>)}</ul>
          </div>
        )}
        {askReason && (
          <Field label={reasonLabel}>
            <input value={reason} onChange={e => setReason(e.target.value)} className={INP} placeholder="مثال: انتقل إلى قسم آخر" />
          </Field>
        )}
        <ErrorNote>{error}</ErrorNote>
        <div className="flex gap-2">
          <button onClick={go} disabled={busy}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-black text-white disabled:opacity-50 ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-zinc-900 hover:bg-zinc-800'}`}>
            {busy && <Loader2 size={14} className="animate-spin" />} {confirmLabel}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-zinc-200 text-[13px] font-bold text-zinc-500">تراجع</button>
        </div>
      </div>
    </Modal>
  )
}

/**
 * Pick several active students (search by name / phone / course). Students in
 * `exclude` are shown greyed with `excludeLabel`.
 */
export function StudentMultiPicker({ selected, onChange, exclude, excludeLabel = 'مسجّل', onLoaded }: {
  selected: Set<string>
  onChange: (next: Set<string>) => void
  exclude?: Set<string>
  excludeLabel?: string
  /** Receives the loaded list once (e.g. to show names in a result summary). */
  onLoaded?: (students: CrmStudent[]) => void
}) {
  const [students, setStudents] = useState<CrmStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    let alive = true
    fetchStudents({ active: true }).then(s => { if (alive) { setStudents(s); setLoading(false); onLoaded?.(s) } })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase()
    if (!n) return students
    return students.filter(s =>
      s.full_name.toLowerCase().includes(n) || (s.phone_number ?? '').includes(n) || (s.course ?? '').toLowerCase().includes(n))
  }, [students, q])

  const selectable = filtered.filter(s => !exclude?.has(s.id))
  const allOn = selectable.length > 0 && selectable.every(s => selected.has(s.id))

  function toggle(id: string) {
    const next = new Set(selected); next.has(id) ? next.delete(id) : next.add(id); onChange(next)
  }
  function toggleAll() {
    const next = new Set(selected)
    selectable.forEach(s => allOn ? next.delete(s.id) : next.add(s.id))
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input value={q} onChange={e => setQ(e.target.value)} className={`${INP} pr-9`} placeholder="ابحث بالاسم أو الهاتف أو الدورة…" />
      </div>
      <div className="flex items-center justify-between text-[12px]">
        <span className="font-bold text-zinc-500">{selected.size} محدَّد</span>
        {selectable.length > 0 && (
          <button onClick={toggleAll} className="font-bold text-blue-600 hover:text-blue-800">
            {allOn ? 'إلغاء تحديد النتائج' : `تحديد كل النتائج (${selectable.length})`}
          </button>
        )}
      </div>
      <div className="max-h-72 overflow-y-auto rounded-xl border border-zinc-200 divide-y divide-zinc-100">
        {loading ? (
          <div className="py-10 flex justify-center text-zinc-300"><Loader2 size={18} className="animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-zinc-400">لا نتائج</div>
        ) : filtered.map(s => {
          const blocked = exclude?.has(s.id)
          const on = selected.has(s.id)
          return (
            <button key={s.id} type="button" disabled={blocked} onClick={() => toggle(s.id)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-right hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-white">
              <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${on ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-zinc-300'}`}>
                {on && <Check size={13} />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-bold text-[13px] text-zinc-900 truncate">{s.full_name}</span>
                <span className="block text-[11px] text-zinc-400 truncate">
                  {s.course ?? '—'} · {s.student_type === 'private_student' ? 'فردي' : 'دورة'}
                </span>
              </span>
              {blocked && <span className="text-[11px] font-bold text-zinc-400">{excludeLabel}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
