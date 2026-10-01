'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Archive, CalendarClock, ChevronLeft, Link2, Loader2, Plus, Presentation, Users,
} from 'lucide-react'
import { useCrmBasePath } from '@/lib/use-crm-path'
import {
  CLASS_STATUS_AR, MODE_AR, fetchOnlineClasses, fetchUnlinkedSessions, fmtDay, linkSessions, seatsLabel,
  type OnlineClass, type UnlinkedSession,
} from '@/lib/online-classes'
import { Badge, ErrorNote, INP } from '@/components/crm/kit'
import ClassForm from './ClassForm'

const SEL = 'border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400'

/**
 * الأقسام المباشرة — online classes (cohorts).
 *
 * A class is the durable thing a student enrolls in; its sessions are the dated
 * meetings. Course enrollment, teacher assignment and attendance stay separate
 * and are never inferred from one another.
 */
export default function OnlineClassesPage() {
  const base = useCrmBasePath()
  const [classes, setClasses] = useState<OnlineClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [mode, setMode] = useState<'' | 'group' | 'private'>('')
  const [status, setStatus] = useState<'' | 'active' | 'completed' | 'cancelled'>('active')
  const [q, setQ] = useState('')
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setClasses(await fetchOnlineClasses(showArchived)) }
    catch (e: any) { setError(e?.message ?? 'تعذّر التحميل.') }
    finally { setLoading(false) }
  }, [showArchived])
  useEffect(() => { load() }, [load])

  const shown = useMemo(() => classes.filter(c =>
    (!mode || c.mode === mode) &&
    (!status || c.status === status) &&
    (!q.trim() || c.title.toLowerCase().includes(q.trim().toLowerCase()) || (c.teacher_name ?? '').toLowerCase().includes(q.trim().toLowerCase()))
  ), [classes, mode, status, q])

  const totals = useMemo(() => {
    const open = classes.filter(c => c.status === 'active' && !c.archived_at)
    return {
      open: open.length,
      seats: open.reduce((a, c) => a + c.active_count, 0),
      waitlisted: open.reduce((a, c) => a + c.waitlisted_count, 0),
      noTeacher: open.filter(c => !c.teacher_id).length,
    }
  }, [classes])

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center"><Presentation size={20} className="text-violet-600" /></div>
          <div>
            <h2 className="text-[17px] font-black text-zinc-900">الأقسام المباشرة</h2>
            <p className="text-[12px] text-zinc-400">أقسام جماعية وفردية: الأستاذ، الطلاب المسجّلون، المقاعد، وجدول الحصص</p>
          </div>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 bg-yellow-400 text-black rounded-xl hover:bg-yellow-300">
          <Plus size={14} /> قسم جديد
        </button>
      </div>

      {/* Current state — not date-ranged */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Stat label="أقسام جارية" value={totals.open} />
        <Stat label="مقاعد مشغولة" value={totals.seats} />
        <Stat label="في قائمة الانتظار" value={totals.waitlisted} tone={totals.waitlisted ? 'amber' : undefined} />
        <Stat label="أقسام بدون أستاذ" value={totals.noTeacher} tone={totals.noTeacher ? 'red' : undefined} />
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-3 flex flex-wrap items-center gap-2">
        <div className="w-full sm:w-72"><input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث باسم القسم أو الأستاذ…" className={INP} /></div>
        <select value={status} onChange={e => setStatus(e.target.value as any)} className={SEL}>
          <option value="">كل الحالات</option>
          <option value="active">جارٍ</option>
          <option value="completed">مكتمل</option>
          <option value="cancelled">ملغى</option>
        </select>
        <select value={mode} onChange={e => setMode(e.target.value as any)} className={SEL}>
          <option value="">جماعي وفردي</option>
          <option value="group">جماعي</option>
          <option value="private">فردي</option>
        </select>
        <label className="flex items-center gap-1.5 text-[12.5px] font-bold text-zinc-600 mr-auto">
          <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} className="accent-yellow-400" />
          <Archive size={13} /> إظهار المؤرشفة
        </label>
      </div>

      <ErrorNote>{error}</ErrorNote>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-zinc-300" size={26} /></div>
      ) : shown.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl py-14 text-center text-zinc-400">
          <Presentation size={28} className="mx-auto mb-2 text-zinc-300" />
          <div className="text-[14px] font-bold text-zinc-600">{classes.length === 0 ? 'لا أقسام بعد' : 'لا نتائج لهذه الفلاتر'}</div>
          {classes.length === 0 && <p className="text-[12.5px] mt-1">أنشئ قسمًا، أسنِد له أستاذًا، ثم سجّل الطلاب.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {shown.map(c => (
            <Link key={c.id} href={`${base}/classes/${c.id}`}
              className="bg-white border border-zinc-200 rounded-2xl p-4 hover:border-zinc-300 hover:shadow-sm transition flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-black text-[15px] text-zinc-900 truncate">{c.title}</div>
                  <div className="text-[12px] text-zinc-500 truncate mt-0.5">
                    {c.teacher_name ?? <span className="text-red-600 font-bold">بدون أستاذ</span>}
                    {c.course_title && <> · {c.course_title}</>}
                  </div>
                </div>
                <ChevronLeft size={18} className="text-zinc-300 shrink-0 mt-1" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge tone={c.mode}>{MODE_AR[c.mode]}</Badge>
                <Badge tone={c.status}>{CLASS_STATUS_AR[c.status]}</Badge>
                {c.level && <Badge tone="cancelled">{c.level}</Badge>}
                {c.archived_at && <Badge tone="archived">مؤرشف</Badge>}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Mini icon={Users} label="المقاعد" value={seatsLabel(c)} />
                <Mini icon={Users} label="انتظار" value={String(c.waitlisted_count)} />
                <Mini icon={CalendarClock} label="حصص منجزة" value={String(c.sessions_done)} />
              </div>
              <div className="text-[11.5px] text-zinc-400">
                {c.next_session_at ? <>الحصة القادمة: {fmtDay(c.next_session_at)}</> : 'لا حصة قادمة مبرمجة'}
                {c.schedule_note && <> · {c.schedule_note}</>}
              </div>
            </Link>
          ))}
        </div>
      )}

      <UnlinkedSessions classes={classes.filter(c => !c.archived_at)} onLinked={load} />

      {creating && (
        <ClassForm onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load() }} />
      )}
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'amber' | 'red' }) {
  const color = tone === 'red' ? 'text-red-600' : tone === 'amber' ? 'text-amber-600' : 'text-zinc-900'
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-3.5">
      <div className="text-[11.5px] text-zinc-400">{label}</div>
      <div className={`text-[22px] font-black tabular-nums ${color}`}>{value}</div>
      <div className="text-[10.5px] text-zinc-300">الوضع الحالي</div>
    </div>
  )
}

function Mini({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 py-2">
      <div className="text-[15px] font-black tabular-nums text-zinc-900" dir="ltr">{value}</div>
      <div className="text-[10.5px] text-zinc-400 flex items-center justify-center gap-1"><Icon size={11} /> {label}</div>
    </div>
  )
}

/**
 * Sessions created before classes existed. Staff attach them to a class here —
 * explicitly. Attendance on them is kept; it never turns into an enrollment.
 */
function UnlinkedSessions({ classes, onLinked }: { classes: OnlineClass[]; onLinked: () => void }) {
  const [rows, setRows] = useState<UnlinkedSession[]>([])
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [target, setTarget] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try { setRows(await fetchUnlinkedSessions()) } catch { setRows([]) }
  }, [])
  useEffect(() => { load() }, [load])

  if (rows.length === 0) return null

  async function link() {
    if (!target || picked.size === 0) return
    setBusy(true); setError(null); setMsg(null)
    try {
      const n = await linkSessions(target, [...picked])
      setMsg(`تم ربط ${n} حصة. افتح القسم لمراجعة الطلاب الذين حضروا دون تسجيل.`)
      setPicked(new Set()); await load(); onLinked()
    } catch (e: any) { setError(e?.message ?? 'تعذّر الربط.') }
    finally { setBusy(false) }
  }

  return (
    <div className="bg-white border border-amber-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-2 px-4 py-3 bg-amber-50/60 text-right">
        <Link2 size={15} className="text-amber-600" />
        <span className="flex-1 text-[13.5px] font-black text-amber-900">{rows.length} حصة غير مرتبطة بأي قسم</span>
        <span className="text-[12px] font-bold text-amber-700">{open ? 'إخفاء' : 'مراجعة وربط'}</span>
      </button>
      {open && (
        <div className="p-4 space-y-3">
          <p className="text-[12px] text-zinc-500 leading-relaxed">
            حصص قديمة أو مستقلة. اربطها بالقسم الصحيح يدويًا — لا شيء يُستنتج من العنوان أو الحضور، والحضور المسجّل يبقى كما هو.
          </p>
          <div className="max-h-72 overflow-y-auto rounded-xl border border-zinc-200 divide-y divide-zinc-100">
            {rows.map(s => (
              <label key={s.id} className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-zinc-50 cursor-pointer">
                <input type="checkbox" checked={picked.has(s.id)} className="accent-yellow-400"
                  onChange={() => setPicked(p => { const n = new Set(p); n.has(s.id) ? n.delete(s.id) : n.add(s.id); return n })} />
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-bold text-zinc-800 truncate">{s.title}</span>
                  <span className="block text-[11px] text-zinc-400">{fmtDay(s.starts_at)} · {s.teacher_name ?? '—'} · {MODE_AR[s.mode]}{s.level ? ` · ${s.level}` : ''} · {s.marks} علامة حضور</span>
                </span>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={target} onChange={e => setTarget(e.target.value)} className={`${SEL} w-full sm:w-96`}>
              <option value="">اختر القسم…</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.title} — {c.teacher_name ?? 'بدون أستاذ'}</option>)}
            </select>
            <button onClick={link} disabled={busy || !target || picked.size === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 text-white text-[13px] font-bold disabled:opacity-40">
              {busy && <Loader2 size={13} className="animate-spin" />} ربط {picked.size || ''} حصة
            </button>
          </div>
          {msg && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-[12.5px] font-bold text-emerald-800">{msg}</div>}
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}
    </div>
  )
}
