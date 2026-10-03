'use client'

/* Shared bits of the Team & payroll page: card surface, money, relative time. */

export const CARD = 'bg-white border border-zinc-200 rounded-[22px] shadow-sm'

export const mad = (n: number | null | undefined) =>
  `${Math.round(Number(n ?? 0)).toLocaleString('en-US')} د.م`

export function ago(iso: string | null | undefined): string {
  if (!iso) return '—'
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return 'الآن'
  if (mins < 60) return `منذ ${mins} د`
  const h = Math.floor(mins / 60)
  if (h < 24) return `منذ ${h} س`
  const d = Math.floor(h / 24)
  if (d < 30) return `منذ ${d} ي`
  return new Date(iso).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Online = seen by the CRM frame in the last 10 minutes. */
export const isOnline = (iso: string | null | undefined) =>
  !!iso && Date.now() - new Date(iso).getTime() < 10 * 60000

export function Initial({ name, size = 44, tone = 'blue' }: { name: string; size?: number; tone?: 'blue' | 'gold' | 'slate' }) {
  const bg = tone === 'gold' ? 'from-amber-400 to-yellow-500 text-[#1E3A8A]'
    : tone === 'slate' ? 'from-slate-400 to-slate-500 text-white'
    : 'from-blue-600 to-blue-800 text-white'
  return (
    <span className={`rounded-full bg-gradient-to-br ${bg} flex items-center justify-center font-black shrink-0 ring-2 ring-white shadow-sm`}
          style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}>
      {(name.trim()[0] ?? '?').toUpperCase()}
    </span>
  )
}

export function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: 'good' | 'bad' | 'warn' }) {
  const c = tone === 'bad' ? 'text-rose-600' : tone === 'good' ? 'text-emerald-600' : tone === 'warn' ? 'text-amber-600' : 'text-zinc-900'
  return (
    <div className="rounded-xl bg-zinc-50 px-2.5 py-2 text-center min-w-0">
      <div className="text-[10.5px] font-bold text-zinc-400 truncate">{label}</div>
      <div className={`text-[15px] font-extrabold ${c} truncate`}><bdi>{value}</bdi></div>
    </div>
  )
}

export function waLink(phone: string | null | undefined, text: string): string | null {
  const digits = (phone ?? '').replace(/[^\d]/g, '')
  if (digits.length < 8) return null
  const intl = digits.startsWith('0') ? '212' + digits.slice(1) : digits
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`
}
