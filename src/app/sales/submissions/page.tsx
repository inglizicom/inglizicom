'use client'

import { useEffect, useState } from 'react'
import { Loader2, MessageCircle, Send, CheckCircle2, Clock, Inbox } from 'lucide-react'
import { useStaff } from '@/lib/staff-context'
import { fetchSubmissions, reviewSubmission, type CorrectorSubmission } from '@/lib/lms'

const waDigits = (p?: string) => { const d = (p || '').replace(/\D/g, ''); return d.startsWith('0') ? '212' + d.slice(1) : d }

export default function SubmissionsPage() {
  const staff = useStaff()
  const [items, setItems] = useState<CorrectorSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'all'>('pending')

  async function load() { setLoading(true); setItems(await fetchSubmissions(tab === 'pending')); setLoading(false) }
  useEffect(() => { load() }, [tab])

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4" dir="rtl">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><Inbox size={20} className="text-indigo-600" /></div>
        <div>
          <h2 className="text-[17px] font-black text-zinc-900">تصحيح المحادثات</h2>
          <p className="text-[12px] text-zinc-400">راجع محادثات الطلاب، أعطِ تقييمًا وملاحظة — تظهر في لوحة الطالب فورًا</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(['pending', 'all'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-[12px] font-bold ${tab === t ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>{t === 'pending' ? 'قيد المراجعة' : 'الكل'}</button>
        ))}
      </div>

      {loading ? <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-zinc-300" size={26} /></div>
        : items.length === 0 ? <div className="text-center py-16 text-zinc-400"><div className="text-4xl mb-2">📭</div><div className="text-[14px]">لا توجد محادثات {tab === 'pending' ? 'قيد المراجعة' : ''}</div></div>
        : items.map(s => <SubmissionCard key={s.id} s={s} by={staff.id} onReviewed={load} />)}
    </div>
  )
}

function SubmissionCard({ s, by, onReviewed }: { s: CorrectorSubmission; by: string; onReviewed: () => void }) {
  const [feedback, setFeedback] = useState(s.feedback ?? '')
  const [score, setScore] = useState<string>(s.score != null ? String(s.score) : '')
  const [saving, setSaving] = useState(false)

  const wa = waDigits(s.student_phone)
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`مرحباً ${s.student_name || ''}، بخصوص محادثة وحدة «${s.module_title || ''}»:\n`)}` : null

  async function save() {
    setSaving(true)
    await reviewSubmission(s.id, feedback.trim(), score === '' ? null : Math.max(0, Math.min(100, Number(score) || 0)), by)
    setSaving(false); onReviewed()
  }

  return (
    <div className={`bg-white border rounded-2xl p-4 space-y-3 ${s.status === 'reviewed' ? 'border-emerald-200' : 'border-zinc-200'}`}>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[14px] text-zinc-900 truncate">{s.student_name || 'طالب'} <span className="text-[11px] font-mono text-zinc-400">{s.student_token}</span></div>
          <div className="text-[12px] text-zinc-500 truncate">{s.module_title} · {new Date(s.created_at).toLocaleDateString('ar-MA', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        {s.status === 'reviewed'
          ? <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={12} /> مُصحّح{s.score != null ? ` · ${s.score}/100` : ''}</span>
          : <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full flex items-center gap-1"><Clock size={12} /> بانتظار</span>}
      </div>

      <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3">
        <div className="text-[10px] font-bold text-zinc-400 mb-1">نص محادثة الطالب</div>
        <p className="text-[13px] text-zinc-800 leading-relaxed whitespace-pre-wrap" dir="ltr" style={{ textAlign: 'left' }}>{s.conversation_text || '—'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
        <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3} placeholder="ملاحظتك وتقييمك للطالب (يظهر في لوحته)..." className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] resize-y focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        <div className="flex sm:flex-col gap-2">
          <input value={score} onChange={e => setScore(e.target.value)} type="number" min={0} max={100} placeholder="/100" className="w-full sm:w-20 border border-zinc-200 rounded-lg px-2 py-2 text-[13px] text-center font-bold focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {waLink && <a href={waLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[12px] font-bold text-[#25D366] border border-[#25D366]/40 rounded-lg px-3 py-2 hover:bg-[#25D366]/5"><MessageCircle size={14} /> واتساب الطالب</a>}
        <button onClick={save} disabled={saving} className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-bold text-[13px] flex items-center justify-center gap-1.5 disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} {s.status === 'reviewed' ? 'تحديث التصحيح' : 'إرسال التصحيح'}
        </button>
      </div>
    </div>
  )
}
