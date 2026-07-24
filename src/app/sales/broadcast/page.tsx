'use client'

/**
 * /sales/broadcast — send one WhatsApp message to a FILTERED audience
 * (students + leads) instead of messaging people one by one.
 *
 * Two channels, automatically chosen:
 *   • Cloud API (true bulk, sends by itself) when WHATSAPP_TOKEN +
 *     WHATSAPP_PHONE_ID are configured — uses the approved template
 *     WHATSAPP_TPL_BROADCAST with the composed text as {{1}}.
 *   • Click-to-chat queue (no setup, free): pre-filled wa.me links opened
 *     one by one — the fallback until the Cloud API is set up.
 *
 * Audience filters: students/leads/both · level · subscription/creation date
 * range · payment status · student type · lead status · VIP · search.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Megaphone, Loader2, Users, UserPlus, Filter, Send, MessageCircle,
  CheckCircle2, XCircle, ExternalLink, History, ChevronDown, Sparkles, AlertTriangle,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  EMPTY_FILTERS, PLACEHOLDERS, renderMessage, waLink,
  type Audience, type BroadcastFilters, type Recipient,
} from '@/lib/broadcast'

const INP = 'w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400'
const LEVELS = ['A0', 'A0-A1', 'A1', 'A1-A2', 'A2', 'B1']
const LEAD_STATUSES: [string, string][] = [
  ['new', 'جديد'], ['contacted', 'تم التواصل'], ['interested', 'مهتم'],
  ['confirmed', 'مؤكّد'], ['delayed', 'مؤجّل'], ['paid', 'دفع'], ['cancelled', 'ملغى'],
]
const PAY_STATUSES: [string, string][] = [['paid', 'مدفوع'], ['pending', 'قيد الانتظار'], ['overdue', 'متأخّر']]

type SendResult = { total: number; sent: number; failed: number; failures: { name: string; phone: string }[] }
type BroadcastRow = {
  id: string; created_at: string; created_by_email: string | null
  audience: string; message: string | null; channel: string
  total: number; sent: number; failed: number
}

async function api<T>(body: unknown): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error('انتهت الجلسة — سجّل الدخول من جديد.')
  const res = await fetch('/api/broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error ?? 'فشل الطلب.')
  return json as T
}

/* Toggle a value inside an optional string[] filter. */
const toggleIn = (arr: string[] | undefined, v: string): string[] | undefined => {
  const s = new Set(arr ?? []); if (s.has(v)) s.delete(v); else s.add(v)
  return s.size ? [...s] : undefined
}

export default function BroadcastPage() {
  const [filters, setFilters] = useState<BroadcastFilters>(EMPTY_FILTERS)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [excluded, setExcluded] = useState<Set<string>>(new Set())     // phones un-ticked
  const [waReady, setWaReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)
  const [confirming, setConfirming] = useState(false)
  // click-to-chat queue state
  const [queueAt, setQueueAt] = useState<number | null>(null)          // index in selected[]
  const [queueOpened, setQueueOpened] = useState(0)
  const [history, setHistory] = useState<BroadcastRow[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const msgRef = useRef<HTMLTextAreaElement>(null)

  const selected = useMemo(() => recipients.filter(r => !excluded.has(r.phone)), [recipients, excluded])

  /* ── live audience preview (debounced) ── */
  const seq = useRef(0)
  const refresh = useCallback((f: BroadcastFilters) => {
    const mine = ++seq.current
    setLoading(true); setError(null)
    api<{ recipients: Recipient[]; waConfigured: boolean }>({ mode: 'preview', filters: f })
      .then(d => { if (seq.current !== mine) return; setRecipients(d.recipients); setWaReady(d.waConfigured); setLoading(false) })
      .catch(e => { if (seq.current !== mine) return; setError(e.message); setLoading(false) })
  }, [])
  useEffect(() => { const t = setTimeout(() => refresh(filters), 350); return () => clearTimeout(t) }, [filters, refresh])
  useEffect(() => { setExcluded(new Set()); setResult(null); setQueueAt(null) }, [filters])

  async function loadHistory() {
    const { data } = await supabase.from('crm_broadcasts')
      .select('id, created_at, created_by_email, audience, message, channel, total, sent, failed')
      .order('created_at', { ascending: false }).limit(20)
    setHistory((data ?? []) as BroadcastRow[])
  }
  useEffect(() => { if (showHistory) loadHistory() }, [showHistory])

  function insertToken(tok: string) {
    const el = msgRef.current
    if (!el) { setMessage(m => m + tok); return }
    const s = el.selectionStart ?? message.length, e = el.selectionEnd ?? message.length
    const next = message.slice(0, s) + tok + message.slice(e)
    setMessage(next)
    requestAnimationFrame(() => { el.focus(); el.selectionStart = el.selectionEnd = s + tok.length })
  }

  /* ── Cloud API bulk send ── */
  async function sendBulk() {
    setConfirming(false); setSending(true); setError(null); setResult(null)
    try {
      const r = await api<SendResult>({ mode: 'send', filters, message, exclude: [...excluded] })
      setResult(r); loadHistory()
    } catch (e) { setError((e as Error).message) }
    setSending(false)
  }

  /* ── click-to-chat queue ── */
  function startQueue() { setResult(null); setQueueAt(0); setQueueOpened(0) }
  function openCurrent() {
    if (queueAt == null || queueAt >= selected.length) return
    const r = selected[queueAt]
    window.open(waLink(r.phone, renderMessage(message, r) || message), '_blank', 'noopener')
    setQueueOpened(n => Math.max(n, queueAt + 1))
  }
  async function advanceQueue() {
    if (queueAt == null) return
    const next = queueAt + 1
    if (next >= selected.length) {
      setQueueAt(null)
      setResult({ total: selected.length, sent: queueOpened, failed: 0, failures: [] })
      try { await api({ mode: 'log', filters, message, total: selected.length, sent: queueOpened }) } catch { /* history only */ }
      loadHistory()
    } else setQueueAt(next)
  }

  const canSend = message.trim().length > 0 && selected.length > 0 && !sending && queueAt == null
  const previewFor = selected[0]

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-4" dir="rtl">
      {/* header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center"><Megaphone size={20} className="text-yellow-600" /></div>
          <div>
            <h2 className="text-[17px] font-black text-zinc-900">رسائل جماعية — WhatsApp</h2>
            <p className="text-[12px] text-zinc-400">صفّ جمهورك بالفلاتر ثم أرسل رسالة واحدة للجميع</p>
          </div>
        </div>
        <button onClick={() => setShowHistory(v => !v)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition">
          <History size={13} /> السجلّ <ChevronDown size={13} className={`transition ${showHistory ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* channel banner */}
      <div className={`flex items-start gap-2 rounded-xl px-4 py-3 text-[12px] font-semibold ${waReady ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'}`}>
        {waReady
          ? <><CheckCircle2 size={15} className="mt-0.5 shrink-0" /> Cloud API مفعّل — الإرسال يتم تلقائيًا دفعة واحدة عبر قالب واتساب المعتمد.</>
          : <><AlertTriangle size={15} className="mt-0.5 shrink-0" /><span>واجهة Cloud API غير مهيّأة بعد، لذلك سنستخدم <b>قائمة الروابط</b>: رسالة مكتوبة مسبقًا لكل شخص، تفتحها وتضغط إرسال واحدًا تلو الآخر. عند إضافة WHATSAPP_TOKEN و WHATSAPP_PHONE_ID (+ قالب معتمد) يتحوّل الإرسال إلى تلقائي بالكامل.</span></>}
      </div>

      {/* history */}
      {showHistory && (
        <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          {history.length === 0 && <div className="p-4 text-[12px] text-zinc-400">لا توجد حملات بعد.</div>}
          {history.map(h => (
            <div key={h.id} className="flex items-center gap-3 px-4 py-2.5 text-[12px]">
              <span className={`px-2 py-0.5 rounded-full font-bold ${h.channel === 'cloud_api' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>{h.channel === 'cloud_api' ? 'تلقائي' : 'روابط'}</span>
              <span className="flex-1 truncate text-zinc-600">{h.message || '—'}</span>
              <span className="text-zinc-400 whitespace-nowrap">{h.sent}/{h.total} أُرسلت</span>
              <span className="text-zinc-300 whitespace-nowrap">{new Date(h.created_at).toLocaleDateString('ar-MA')}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-4 items-start">
        {/* ══ filters + audience ══ */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-[13px] font-black text-zinc-800"><Filter size={14} className="text-yellow-600" /> الجمهور</div>

            {/* audience */}
            <div className="flex gap-1.5">
              {([['students', 'الطلاب', Users], ['leads', 'العملاء المحتملون', UserPlus], ['both', 'الكل', Megaphone]] as [Audience, string, typeof Users][]).map(([id, label, Icon]) => (
                <button key={id} onClick={() => setFilters(f => ({ ...f, audience: id }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition ${filters.audience === id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>

            {/* level */}
            <div>
              <div className="text-[11px] font-bold text-zinc-400 mb-1">المستوى</div>
              <div className="flex flex-wrap gap-1.5">
                {LEVELS.map(lv => (
                  <button key={lv} onClick={() => setFilters(f => ({ ...f, levels: toggleIn(f.levels, lv) }))}
                    className={`px-2.5 py-1 rounded-lg text-[12px] font-bold transition ${filters.levels?.includes(lv) ? 'bg-yellow-400 text-zinc-900' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>{lv}</button>
                ))}
              </div>
            </div>

            {/* date range */}
            <div>
              <div className="text-[11px] font-bold text-zinc-400 mb-1">تاريخ الاشتراك / التسجيل</div>
              <div className="flex items-center gap-2">
                <input type="date" value={filters.from ?? ''} onChange={e => setFilters(f => ({ ...f, from: e.target.value || undefined }))} className={INP} />
                <span className="text-zinc-300 text-[12px]">→</span>
                <input type="date" value={filters.to ?? ''} onChange={e => setFilters(f => ({ ...f, to: e.target.value || undefined }))} className={INP} />
              </div>
            </div>

            {/* student-only filters */}
            {filters.audience !== 'leads' && (
              <div className="space-y-2">
                <div>
                  <div className="text-[11px] font-bold text-zinc-400 mb-1">حالة الدفع (الطلاب)</div>
                  <div className="flex flex-wrap gap-1.5">
                    {PAY_STATUSES.map(([v, label]) => (
                      <button key={v} onClick={() => setFilters(f => ({ ...f, paymentStatus: toggleIn(f.paymentStatus, v) }))}
                        className={`px-2.5 py-1 rounded-lg text-[12px] font-bold transition ${filters.paymentStatus?.includes(v) ? 'bg-yellow-400 text-zinc-900' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>{label}</button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-1.5 text-[12px] text-zinc-500">
                  <input type="checkbox" checked={filters.activeOnly !== false} onChange={e => setFilters(f => ({ ...f, activeOnly: e.target.checked }))} className="accent-yellow-400" />
                  الطلاب النشطون فقط
                </label>
              </div>
            )}

            {/* lead-only filters */}
            {filters.audience !== 'students' && (
              <div className="space-y-2">
                <div>
                  <div className="text-[11px] font-bold text-zinc-400 mb-1">حالة العميل المحتمل</div>
                  <div className="flex flex-wrap gap-1.5">
                    {LEAD_STATUSES.map(([v, label]) => (
                      <button key={v} onClick={() => setFilters(f => ({ ...f, leadStatus: toggleIn(f.leadStatus, v) }))}
                        className={`px-2.5 py-1 rounded-lg text-[12px] font-bold transition ${filters.leadStatus?.includes(v) ? 'bg-yellow-400 text-zinc-900' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>{label}</button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-1.5 text-[12px] text-zinc-500">
                  <input type="checkbox" checked={!!filters.vipOnly} onChange={e => setFilters(f => ({ ...f, vipOnly: e.target.checked || undefined }))} className="accent-yellow-400" />
                  VIP فقط
                </label>
              </div>
            )}

            <input placeholder="بحث بالاسم أو الهاتف…" value={filters.search ?? ''} onChange={e => setFilters(f => ({ ...f, search: e.target.value || undefined }))} className={INP} />
          </div>

          {/* audience list */}
          <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
              <span className="text-[13px] font-black text-zinc-800">
                {loading ? <Loader2 size={14} className="animate-spin inline" /> : <>{selected.length}</>} مستلم
                {excluded.size > 0 && <span className="text-zinc-400 font-bold"> ({excluded.size} مستبعد)</span>}
              </span>
              {recipients.length > 0 && (
                <button onClick={() => setExcluded(excluded.size ? new Set() : new Set(recipients.map(r => r.phone)))}
                  className="text-[11px] font-bold text-zinc-400 hover:text-zinc-700 transition">
                  {excluded.size ? 'تحديد الكل' : 'إلغاء تحديد الكل'}
                </button>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto divide-y divide-zinc-50">
              {!loading && recipients.length === 0 && <div className="p-4 text-[12px] text-zinc-400">لا أحد يطابق هذه الفلاتر (أو لا أرقام هواتف).</div>}
              {recipients.map(r => (
                <label key={r.kind + r.id} className="flex items-center gap-2.5 px-4 py-2 text-[12px] hover:bg-zinc-50 cursor-pointer">
                  <input type="checkbox" checked={!excluded.has(r.phone)}
                    onChange={() => setExcluded(prev => { const n = new Set(prev); if (n.has(r.phone)) n.delete(r.phone); else n.add(r.phone); return n })}
                    className="accent-yellow-400" />
                  <span className="font-bold text-zinc-800 flex-1 truncate">{r.name || '—'}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${r.kind === 'student' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'}`}>{r.kind === 'student' ? 'طالب' : 'محتمل'}</span>
                  {r.level && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-500">{r.level}</span>}
                  <span dir="ltr" className="text-zinc-400 font-mono text-[11px]">{r.phone}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ══ compose + send ══ */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-[13px] font-black text-zinc-800"><MessageCircle size={14} className="text-yellow-600" /> الرسالة</div>
            <div className="flex flex-wrap gap-1.5">
              {PLACEHOLDERS.map(p => (
                <button key={p.token} onClick={() => insertToken(p.token)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200 hover:bg-yellow-100 transition font-mono" dir="ltr">
                  {p.token} <span className="font-sans" dir="rtl">{p.ar}</span>
                </button>
              ))}
            </div>
            <textarea ref={msgRef} value={message} onChange={e => setMessage(e.target.value)} rows={6}
              placeholder={'مثال:\nسلام {{name}} 👋\nعرض خاص لطلاب مستوى {{level}} هذا الأسبوع…'}
              className={INP + ' resize-y leading-relaxed'} />
            {previewFor && message.trim() && (
              <div className="rounded-xl bg-zinc-50 ring-1 ring-zinc-100 px-3.5 py-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 mb-1"><Sparkles size={12} /> معاينة — كما ستصل إلى {previewFor.name || 'أول مستلم'}</div>
                <div className="text-[13px] text-zinc-800 whitespace-pre-wrap leading-relaxed">{renderMessage(message, previewFor)}</div>
              </div>
            )}
          </div>

          {/* send / queue */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
            {error && <div className="flex items-center gap-2 text-[12px] font-bold text-red-600 bg-red-50 rounded-lg px-3 py-2"><XCircle size={14} /> {error}</div>}

            {result && (
              <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-200 px-4 py-3 text-[13px] font-bold text-emerald-800">
                <CheckCircle2 size={15} className="inline ml-1" /> اكتملت الحملة: {result.sent} / {result.total} أُرسلت{result.failed > 0 && <span className="text-red-600"> · {result.failed} فشلت</span>}
                {result.failures.length > 0 && (
                  <div className="mt-1.5 text-[11px] font-semibold text-emerald-700/80">
                    {result.failures.slice(0, 5).map(f => <div key={f.phone} dir="ltr" className="font-mono">{f.phone} — {f.name}</div>)}
                  </div>
                )}
              </div>
            )}

            {/* click-to-chat queue walker */}
            {queueAt != null && selected[queueAt] && (
              <div className="rounded-xl bg-zinc-900 text-white px-4 py-4 space-y-3">
                <div className="flex items-center justify-between text-[12px] font-bold">
                  <span>{queueAt + 1} / {selected.length}</span>
                  <button onClick={() => setQueueAt(null)} className="text-white/50 hover:text-white transition">إيقاف</button>
                </div>
                <div className="h-1.5 rounded-full bg-white/15 overflow-hidden"><div className="h-full bg-yellow-400 transition-all" style={{ width: `${((queueAt) / selected.length) * 100}%` }} /></div>
                <div className="text-[14px] font-black">{selected[queueAt].name || selected[queueAt].phone}</div>
                <div className="flex gap-2">
                  <button onClick={openCurrent} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-yellow-400 text-zinc-900 font-black text-[13px] py-2.5 hover:bg-yellow-300 transition">
                    <ExternalLink size={14} /> فتح في واتساب
                  </button>
                  <button onClick={advanceQueue} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-white/10 font-black text-[13px] py-2.5 hover:bg-white/20 transition">
                    تم — التالي ←
                  </button>
                </div>
              </div>
            )}

            {/* confirm dialog (cloud api) */}
            {confirming ? (
              <div className="rounded-xl bg-amber-50 ring-1 ring-amber-200 px-4 py-3 space-y-2.5">
                <div className="text-[13px] font-black text-amber-900">إرسال الرسالة إلى {selected.length} شخصًا دفعة واحدة؟</div>
                <div className="flex gap-2">
                  <button onClick={sendBulk} className="flex-1 rounded-lg bg-zinc-900 text-white font-black text-[13px] py-2 hover:bg-zinc-700 transition">نعم، أرسل الآن</button>
                  <button onClick={() => setConfirming(false)} className="flex-1 rounded-lg bg-white ring-1 ring-zinc-200 text-zinc-600 font-black text-[13px] py-2 hover:bg-zinc-50 transition">إلغاء</button>
                </div>
              </div>
            ) : queueAt == null && (
              waReady ? (
                <button disabled={!canSend} onClick={() => setConfirming(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 text-white font-black text-[14px] py-3 hover:bg-zinc-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {sending ? 'جارٍ الإرسال…' : `إرسال تلقائي إلى ${selected.length} دفعة واحدة`}
                </button>
              ) : (
                <button disabled={!canSend} onClick={startQueue}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 text-white font-black text-[14px] py-3 hover:bg-zinc-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
                  <MessageCircle size={16} /> بدء الإرسال — قائمة الروابط ({selected.length})
                </button>
              )
            )}

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              ملاحظة: واتساب يشترط قالبًا معتمدًا للرسائل الجماعية التلقائية، ويبدأ الرقم الجديد بحدّ ~250–1000 رسالة/يوم يرتفع تدريجيًا. قائمة الروابط لا تخضع لهذه القيود لأنها ترسل من واتساب الخاص بك.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
