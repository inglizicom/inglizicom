'use client'

/**
 * Certificate readiness board — "who is ready to get a certificate".
 * Shown at the top of the CRM students tab. Three buckets:
 *   ready  — qualifies now → "منح الشهادة" awards + notifies the student
 *   close  — 75–99% through a course → nudge to finish
 *   recent — issued in the last 30 days → print / send
 * Collapsible; hides itself entirely when there is nothing to show.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Award, Loader2, Sparkles, ChevronDown, Printer, RefreshCw, GraduationCap, CheckCircle2,
} from 'lucide-react'
import PersonAvatar from '@/components/PersonAvatar'
import {
  fetchCertCandidates, awardStudentCertificates,
  type CertCandidates, type CertReadyStudent,
} from '@/lib/certificates'

type Sub = 'ready' | 'close' | 'recent'

export default function CertReadyBoard() {
  const [data, setData] = useState<CertCandidates | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(true)
  const [sub, setSub] = useState<Sub>('ready')
  const [busy, setBusy] = useState<string | null>(null)
  const [done, setDone] = useState<Record<string, string>>({})  // student_id → newest serial after award

  async function load() { setLoading(true); setData(await fetchCertCandidates()); setLoading(false) }
  useEffect(() => { load() }, [])

  async function award(s: CertReadyStudent) {
    setBusy(s.student_id)
    const serials = await awardStudentCertificates(s.token)
    setBusy(null)
    if (serials.length > 0) {
      setDone(d => ({ ...d, [s.student_id]: serials[0] }))
      // auto-open the first freshly-issued certificate ready to print
      window.open(`/certificate/${serials[0]}?print=1`, '_blank')
    }
    load()
  }

  if (loading && !data) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 mb-4 flex items-center gap-2 text-zinc-400">
        <Loader2 size={16} className="animate-spin" /> <span className="text-[13px]">فحص الطلاب المؤهلين للشهادات…</span>
      </div>
    )
  }
  if (!data) return null

  const c = data.counts
  // nothing anywhere → don't clutter the page
  if (c.ready === 0 && c.close === 0 && c.recent === 0) return null

  const TABS: { id: Sub; label: string; n: number }[] = [
    { id: 'ready',  label: '✅ جاهزون الآن', n: c.ready },
    { id: 'close',  label: '⏳ قاربوا الإتمام', n: c.close },
    { id: 'recent', label: '🎓 مُنِحت مؤخرًا', n: c.recent },
  ]

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-l from-amber-50/70 to-white mb-4 overflow-hidden">
      {/* header */}
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-2.5 px-4 py-3 text-right">
        <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
          <Award size={17} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-black text-zinc-900 flex items-center gap-2 flex-wrap">
            الشهادات — من جاهز للحصول عليها؟
            {c.ready > 0 && <span className="text-[11px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">{c.ready} جاهز</span>}
          </div>
          <div className="text-[11.5px] text-zinc-500">امنح الشهادة بضغطة — تُرسَل للطالب إشعارًا وتُفتح جاهزة للطباعة</div>
        </div>
        <span onClick={e => { e.stopPropagation(); load() }} className="text-zinc-400 hover:text-zinc-700 p-1.5 cursor-pointer">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </span>
        <ChevronDown size={18} className={`text-zinc-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-3 pb-3">
          {/* sub-tabs */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-0.5">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setSub(t.id)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap border transition-colors ${
                  sub === t.id ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'}`}>
                {t.label} <span className="opacity-70">({t.n})</span>
              </button>
            ))}
          </div>

          {/* READY */}
          {sub === 'ready' && (
            data.ready.length === 0
              ? <Empty>لا أحد مؤهل الآن — تُمنح الشهادات تلقائيًا عند بلوغ الطالب المعايير.</Empty>
              : <div className="grid sm:grid-cols-2 gap-2">
                  {data.ready.map(s => {
                    const awarded = done[s.student_id]
                    return (
                      <div key={s.student_id} className="bg-white rounded-xl border border-zinc-200 p-3">
                        <div className="flex items-center gap-2.5">
                          <PersonAvatar name={s.name} size={36} src={s.avatar_url} />
                          <Link href={`/sales/students/${s.student_id}`} className="flex-1 min-w-0">
                            <div className="text-[13.5px] font-bold text-zinc-800 truncate hover:underline">{s.name}</div>
                            <div className="text-[11px] text-zinc-400">{s.count} شهادة مستحقة</div>
                          </Link>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {s.items.map((it, i) => (
                            <span key={i} className="text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-full">{it}</span>
                          ))}
                        </div>
                        {awarded ? (
                          <a href={`/certificate/${awarded}?print=1`} target="_blank" rel="noopener noreferrer"
                            className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[12px] hover:bg-emerald-100">
                            <CheckCircle2 size={13} /> تم المنح — طباعة الشهادة
                          </a>
                        ) : (
                          <button onClick={() => award(s)} disabled={busy === s.student_id}
                            className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-500 text-white font-black text-[12px] hover:bg-amber-400 disabled:opacity-60">
                            {busy === s.student_id ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} منح الشهادة الآن
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
          )}

          {/* CLOSE */}
          {sub === 'close' && (
            data.close.length === 0
              ? <Empty>لا أحد قريب من إتمام دورة حاليًا.</Empty>
              : <div className="bg-white rounded-xl border border-zinc-200 divide-y divide-zinc-50">
                  {data.close.map(s => (
                    <Link key={s.student_id} href={`/sales/students/${s.student_id}`} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-zinc-50">
                      <PersonAvatar name={s.name} size={32} src={s.avatar_url} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-zinc-800 truncate">{s.name}</div>
                        <div className="text-[11px] text-zinc-400 truncate">{s.course}</div>
                      </div>
                      <div className="w-24 flex-shrink-0">
                        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 mb-0.5"><span>{s.pct}%</span></div>
                        <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{ width: `${s.pct}%` }} /></div>
                      </div>
                    </Link>
                  ))}
                </div>
          )}

          {/* RECENT */}
          {sub === 'recent' && (
            data.recent.length === 0
              ? <Empty>لم تُمنح شهادات خلال آخر 30 يومًا.</Empty>
              : <div className="grid sm:grid-cols-2 gap-2">
                  {data.recent.map(r => (
                    <div key={r.serial} className="bg-white rounded-xl border border-zinc-200 p-3 flex items-center gap-2.5">
                      <PersonAvatar name={r.name} size={34} src={r.avatar_url} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-zinc-800 truncate">{r.name}</div>
                        <div className="text-[11px] text-zinc-400 truncate">{r.title}</div>
                        <div className="text-[10px] text-zinc-300" dir="ltr">{r.serial} · {r.date}</div>
                      </div>
                      <a href={`/certificate/${r.serial}?print=1`} target="_blank" rel="noopener noreferrer"
                        className="flex-shrink-0 w-9 h-9 rounded-lg bg-zinc-900 text-yellow-400 flex items-center justify-center hover:bg-black" title="طباعة">
                        <Printer size={15} />
                      </a>
                    </div>
                  ))}
                </div>
          )}
        </div>
      )}
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-[12.5px] text-zinc-400 py-6 text-center font-semibold flex flex-col items-center gap-1.5"><GraduationCap size={22} className="text-zinc-300" />{children}</div>
}
