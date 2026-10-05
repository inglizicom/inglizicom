'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Check, Copy, Facebook, Globe, Instagram, Link2, Loader2, MessageCircle, MousePointerClick, Music2, Search,
  Sparkles, UserPlus, Youtube, type LucideIcon,
} from 'lucide-react'
import {
  CHANNEL_LABEL, SHORT_LINKS, SITE, fetchChannelReport, type Channel, type ChannelRow,
} from '@/lib/channels'

/**
 * /sales/channels — which platform brings students, not just clicks.
 * For each channel: the leads it sent, the students they became, how many
 * pay, and what they paid — so time and money go where students come from.
 * Below: the short links that tag every visit with its source.
 */

const ICON: Record<Channel, LucideIcon> = {
  instagram: Instagram, tiktok: Music2, facebook: Facebook, whatsapp: MessageCircle, youtube: Youtube,
  search: Search, ai: Sparkles, referral: UserPlus, other: Globe, direct: MousePointerClick,
}
const PERIODS = [
  { id: '30', label: '30 يومًا', days: 30 },
  { id: '90', label: '90 يومًا', days: 90 },
  { id: 'all', label: 'منذ البداية', days: null },
] as const
const mad = (n: number) => `${Math.round(n).toLocaleString('en-US')} د.م`
const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : '—')

export default function ChannelsPage() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]['id']>('90')
  const [rows, setRows] = useState<ChannelRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setRows(null); setError(null)
    const p = PERIODS.find(x => x.id === period)!
    const from = p.days ? new Date(Date.now() - p.days * 86_400_000).toISOString().slice(0, 10) : null
    fetchChannelReport(from, null).then(r => setRows(r.channels)).catch(e => { setError(e.message); setRows([]) })
  }, [period])

  const total = useMemo(() => (rows ?? []).reduce((t, r) => ({
    leads: t.leads + r.leads, students: t.students + r.students, paying: t.paying + r.paying, revenue: t.revenue + r.revenue,
  }), { leads: 0, students: 0, paying: 0, revenue: 0 }), [rows])
  const maxLeads = Math.max(1, ...(rows ?? []).map(r => r.leads))

  return (
    <div dir="rtl" className="px-4 lg:px-8 py-5 max-w-[1100px] mx-auto space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-extrabold text-zinc-900">من أين يأتي الطلاب؟</h2>
          <p className="text-[13px] text-zinc-500">العملاء المحتملون ← الطلاب ← المداخيل، لكل منصة.</p>
        </div>
        <div className="flex gap-1.5" role="tablist" aria-label="الفترة">
          {PERIODS.map(p => (
            <button key={p.id} role="tab" aria-selected={period === p.id} onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-full text-[12.5px] font-bold border ${period === p.id ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-600'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: 'عملاء محتملون', v: total.leads.toLocaleString('en-US') },
          { l: 'صاروا طلابًا', v: `${total.students} · ${pct(total.students, total.leads)}` },
          { l: 'يدفعون', v: total.paying.toLocaleString('en-US') },
          { l: 'ما دفعه هؤلاء الطلاب', v: mad(total.revenue) },
        ].map(k => (
          <div key={k.l} className="rounded-2xl bg-white border border-zinc-200 p-4">
            <div className="text-[12px] font-bold text-zinc-500">{k.l}</div>
            <div className="mt-1 text-[20px] font-black text-zinc-900 tabular-nums">{rows ? k.v : '…'}</div>
          </div>
        ))}
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] font-bold text-red-700">{error}</div>}

      <section className="rounded-2xl bg-white border border-zinc-200 overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.6fr_1.4fr_0.8fr_0.8fr_0.7fr_1fr] gap-3 px-4 py-2.5 bg-zinc-50 text-[11.5px] font-extrabold text-zinc-500">
          <span>القناة</span><span>العملاء المحتملون</span><span>طلاب</span><span>التحويل</span><span>يدفعون</span><span>المداخيل</span>
        </div>
        {rows === null ? (
          <div className="py-16 flex justify-center text-zinc-300"><Loader2 className="animate-spin" /></div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-zinc-400">لا عملاء في هذه الفترة.</div>
        ) : rows.map(r => {
          const Icon = ICON[r.channel] ?? Globe
          return (
            <div key={r.channel} className="grid grid-cols-2 md:grid-cols-[1.6fr_1.4fr_0.8fr_0.8fr_0.7fr_1fr] gap-x-3 gap-y-2 px-4 py-3.5 border-t border-zinc-100 items-center">
              <div className="col-span-2 md:col-span-1 flex items-center gap-2.5 min-w-0">
                <span className="w-9 h-9 shrink-0 rounded-xl bg-zinc-900 text-white flex items-center justify-center"><Icon size={17} /></span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-extrabold text-zinc-900 truncate">{CHANNEL_LABEL[r.channel] ?? r.channel}</span>
                  <span className="block text-[11.5px] font-semibold text-zinc-400">{r.from_site} من الموقع · {r.leads - r.from_site} أُدخلوا يدويًا</span>
                </span>
              </div>
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden"><div className="h-full rounded-full bg-yellow-400" style={{ width: `${(r.leads / maxLeads) * 100}%` }} /></div>
                  <span className="w-10 text-left text-[13px] font-extrabold tabular-nums text-zinc-900">{r.leads}</span>
                </div>
              </div>
              <Cell label="طلاب" value={r.students} />
              <Cell label="التحويل" value={pct(r.students, r.leads)} strong={r.students > 0} />
              <Cell label="يدفعون" value={r.paying} />
              <Cell label="المداخيل" value={mad(r.revenue)} strong={r.revenue > 0} />
            </div>
          )
        })}
      </section>

      <p className="text-[12px] text-zinc-500 leading-relaxed">
        الطالب يُربط بالعميل المحتمل عبر الربط المسجّل أو نفس رقم الهاتف، ويُحسب مرة واحدة لأول نموذج أرسله.
        «مباشر» يعني أن الزائر لم يأتِ برابط موسوم ولا من موقع معروف — استعمل الروابط القصيرة أسفله لتقليل هذا الرقم.
      </p>

      <ShortLinks />
    </div>
  )
}

function Cell({ label, value, strong }: { label: string; value: string | number; strong?: boolean }) {
  return (
    <div className="text-[13.5px] tabular-nums">
      <span className="md:hidden text-[11px] font-bold text-zinc-400 ml-1">{label}:</span>
      <span className={strong ? 'font-extrabold text-zinc-900' : 'font-semibold text-zinc-600'}>{value}</span>
    </div>
  )
}

function ShortLinks() {
  const [copied, setCopied] = useState<string | null>(null)
  function copy(url: string) {
    navigator.clipboard?.writeText(url).then(() => { setCopied(url); setTimeout(() => setCopied(null), 1600) }).catch(() => {})
  }
  return (
    <section className="rounded-2xl bg-white border border-zinc-200 p-4 sm:p-5">
      <h3 className="flex items-center gap-2 text-[15px] font-extrabold text-zinc-900"><Link2 size={17} /> روابطك القصيرة</h3>
      <p className="mt-1 text-[12.5px] text-zinc-500 leading-relaxed">
        ضع هذا الرابط مكان inglizi.com في كل منصة — يعرف الموقع مصدر الزائر حتى داخل متصفح إنستغرام وتيك توك.
        ولصفحة محددة: أضف المسار بعده، مثل <bdi dir="ltr">inglizi.com/ig/level-test</bdi>.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {SHORT_LINKS.map(l => {
          const url = `${SITE}${l.path}`
          const Icon = ICON[l.channel]
          return (
            <div key={l.path} className="flex items-center gap-3 rounded-xl border border-zinc-200 px-3 py-2.5">
              <span className="w-8 h-8 shrink-0 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center"><Icon size={16} /></span>
              <span className="flex-1 min-w-0">
                <span className="block text-[13.5px] font-extrabold text-zinc-900" dir="ltr">inglizi.com{l.path}</span>
                <span className="block text-[11.5px] text-zinc-500">{CHANNEL_LABEL[l.channel]} — {l.where}</span>
              </span>
              <button onClick={() => copy(url)} aria-label={`نسخ ${url}`}
                className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-zinc-900 text-white px-2.5 py-1.5 text-[12px] font-bold">
                {copied === url ? <><Check size={13} /> نُسخ</> : <><Copy size={13} /> نسخ</>}
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
