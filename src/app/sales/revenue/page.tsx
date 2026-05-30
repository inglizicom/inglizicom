'use client'

import { useEffect, useState } from 'react'
import {
  Wallet, TrendingUp, Loader2, RotateCcw, Calendar,
  CheckCircle2, Clock, ArrowUpRight,
} from 'lucide-react'
import {
  fetchRevenueTotals, fetchRevenueByMonth, fetchCrmPayments,
  type CrmPayment,
} from '@/lib/crm-db'

/**
 * Revenue page — the founder's financial view.
 * Shows today / week / month / year totals plus a monthly bar chart
 * and the recent paid payment log.
 */
export default function RevenuePage() {
  const [totals, setTotals]   = useState({ today: 0, week: 0, month: 0, year: 0, allTime: 0 })
  const [monthly, setMonthly] = useState<{ month: string; mad: number }[]>([])
  const [recent, setRecent]   = useState<CrmPayment[]>([])
  const [pending, setPending] = useState<CrmPayment[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const [t, m, rec, pend] = await Promise.all([
      fetchRevenueTotals(),
      fetchRevenueByMonth(12),
      fetchCrmPayments({ status: 'paid', limit: 15 }),
      fetchCrmPayments({ status: 'pending', limit: 10 }),
    ])
    setTotals(t); setMonthly(m); setRecent(rec); setPending(pend)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const maxMonthly = Math.max(1, ...monthly.map(m => m.mad))

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1500px] mx-auto">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] uppercase font-bold tracking-[0.18em] text-gray-400 mb-1">Finance</div>
          <h1 className="text-[24px] font-black tracking-tight text-gray-900 flex items-center gap-2">
            <Wallet size={20} className="text-yellow-600" /> Revenue
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Confirmed CRM payments. Data updates in real time.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">
          <RotateCcw size={14} />
        </button>
      </header>

      {/* Totals */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <RevTile label="Today"    value={totals.today}   accent="yellow"  loading={loading} />
        <RevTile label="This week" value={totals.week}   accent="blue"    loading={loading} />
        <RevTile label="This month" value={totals.month} accent="emerald" loading={loading} />
        <RevTile label="This year"  value={totals.year}  accent="indigo"  loading={loading} />
        <RevTile label="All time"   value={totals.allTime} accent="gray"  loading={loading} />
      </section>

      {/* Pending alert */}
      {!loading && pending.length > 0 && (
        <div className="mb-5 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
          <Clock size={15} className="text-orange-600 flex-shrink-0" />
          <div className="flex-1 text-[13px] font-semibold text-orange-800">
            {pending.length} payment{pending.length > 1 ? 's' : ''} pending review —&nbsp;
            total {pending.reduce((s, p) => s + p.amount_mad, 0).toLocaleString()} MAD
          </div>
          <a href="/sales/payments" className="inline-flex items-center gap-1 text-[12px] font-bold text-orange-700 hover:text-orange-900">
            Review <ArrowUpRight size={12} />
          </a>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Monthly bar chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="font-bold text-gray-900 text-base mb-4">Revenue per month (MAD)</h2>
          {loading ? (
            <div className="py-10 flex justify-center"><Loader2 size={18} className="animate-spin text-gray-400" /></div>
          ) : (
            <div>
              <div className="flex items-end gap-2 h-48">
                {monthly.map(m => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full relative flex flex-col justify-end" style={{ height: '160px' }}>
                      <div
                        className="w-full bg-yellow-400 rounded-t group-hover:bg-yellow-500 transition-colors"
                        style={{ height: `${Math.max(2, (m.mad / maxMonthly) * 100)}%` }}
                        title={`${m.month}: ${m.mad.toLocaleString()} MAD`}
                      />
                    </div>
                    <div className="text-[9px] text-gray-400 font-bold tabular-nums">{m.month.slice(5)}</div>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-gray-400 text-center mt-1 font-mono">
                Peak: {Math.max(...monthly.map(m => m.mad)).toLocaleString()} MAD
              </div>
            </div>
          )}
        </div>

        {/* Recent payments */}
        <div className="bg-white border border-gray-200 rounded-2xl">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-base">Recent payments</h2>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </div>
          {loading ? (
            <div className="py-8 flex justify-center"><Loader2 size={16} className="animate-spin text-gray-400" /></div>
          ) : recent.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">No payments yet.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recent.map(p => (
                <li key={p.id} className="px-4 py-2.5 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-gray-900 tabular-nums">{p.amount_mad.toLocaleString()} MAD</div>
                    <div className="text-[11px] text-gray-400 truncate">
                      {p.course_or_service ?? p.payment_type} · {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : '—'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function RevTile({ label, value, accent, loading }: {
  label: string; value: number; loading?: boolean
  accent: 'yellow' | 'blue' | 'emerald' | 'indigo' | 'gray'
}) {
  const c = {
    yellow:  'bg-yellow-50 text-yellow-600',
    blue:    'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo:  'bg-indigo-50 text-indigo-600',
    gray:    'bg-gray-100 text-gray-600',
  }[accent]
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500 mb-1.5">{label}</div>
      <div className="text-[22px] font-black text-gray-900 tabular-nums leading-none">
        {loading
          ? <span className="inline-block w-20 h-6 bg-gray-100 rounded animate-pulse" />
          : value === 0
            ? <span className="text-gray-300">0 MAD</span>
            : `${new Intl.NumberFormat('en-US').format(value)} MAD`}
      </div>
    </div>
  )
}
