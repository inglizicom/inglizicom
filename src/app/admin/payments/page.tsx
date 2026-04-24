'use client'

import { useEffect, useState } from 'react'
import {
  CreditCard, Loader2, Check, X, FileText, User as UserIcon,
  Mail, Clock, ExternalLink, ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import {
  fetchAllPayments,
  getReceiptSignedUrl,
  approvePayment,
  declinePayment,
  type PaymentWithProfile,
  type PaymentStatus,
} from '@/lib/payments-db'
import { getPlan } from '@/data/plans'

export default function AdminPaymentsPage() {
  const { user } = useAuth()
  const [filter, setFilter]     = useState<PaymentStatus | 'all'>('pending')
  const [rows, setRows]         = useState<PaymentWithProfile[]>([])
  const [loading, setLoading]   = useState(true)
  const [busy, setBusy]         = useState<string | null>(null)
  const [reviewing, setReviewing] = useState<PaymentWithProfile | null>(null)

  async function load() {
    setLoading(true)
    const status = filter === 'all' ? undefined : filter
    setRows(await fetchAllPayments(status))
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  async function onApprove(p: PaymentWithProfile) {
    if (!user) return
    if (!confirm(`Approve ${p.amount} ${p.currency} for ${p.profile?.email ?? p.user_id.slice(0, 8)}?`)) return
    setBusy(p.id)
    try {
      await approvePayment(p.id, user.id)
      await load()
      setReviewing(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'failed')
    }
    setBusy(null)
  }

  async function onDecline(p: PaymentWithProfile) {
    if (!user) return
    const reason = prompt('Reason for decline (shown to user):')
    if (!reason) return
    setBusy(p.id)
    try {
      await declinePayment(p.id, user.id, reason)
      await load()
      setReviewing(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'failed')
    }
    setBusy(null)
  }

  const counts = {
    pending:  rows.filter(r => r.status === 'pending').length,
    approved: rows.filter(r => r.status === 'approved').length,
    declined: rows.filter(r => r.status === 'declined').length,
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-gray-900 font-black text-xl leading-none">Payments</h1>
        <p className="text-gray-400 text-xs mt-1">Review receipts and approve subscriptions</p>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {([
          ['pending',  'Pending'],
          ['approved', 'Approved'],
          ['declined', 'Declined'],
          ['all',      'All'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key as PaymentStatus | 'all')}
            className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 ${
              filter === key
                ? 'text-indigo-600 border-indigo-600'
                : 'text-gray-500 border-transparent hover:text-gray-900'
            }`}
          >
            {label}
            {key === filter && (counts[key as keyof typeof counts] ?? 0) > 0 && (
              <span className="ml-1.5 text-xs font-black text-indigo-400">
                · {(counts[key as keyof typeof counts])}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700 font-bold">No payments</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map(p => {
            const plan = getPlan(p.plan_requested)
            return (
              <button
                key={p.id}
                onClick={() => setReviewing(p)}
                className={`w-full text-left bg-white border rounded-2xl p-4 hover:shadow-sm transition-all ${
                  p.status === 'pending' ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    p.status === 'pending'  ? 'bg-amber-50'    :
                    p.status === 'approved' ? 'bg-emerald-50'  :
                                              'bg-red-50'
                  }`}>
                    {p.status === 'pending'  ? <Clock className="w-4 h-4 text-amber-600" /> :
                     p.status === 'approved' ? <Check className="w-4 h-4 text-emerald-600" /> :
                                               <X     className="w-4 h-4 text-red-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-gray-900 text-sm truncate">
                        {p.profile?.full_name || p.profile?.email || p.user_id.slice(0, 8)}
                      </span>
                      <span className="text-xs font-bold text-gray-500">
                        · {p.amount} {p.currency}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 font-semibold">
                      {plan?.title_ar ?? p.plan_requested} ·{' '}
                      {new Date(p.created_at).toLocaleString('en', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {reviewing && (
        <ReviewModal
          payment={reviewing}
          onClose={() => setReviewing(null)}
          onApprove={() => onApprove(reviewing)}
          onDecline={() => onDecline(reviewing)}
          busy={busy === reviewing.id}
        />
      )}
    </main>
  )
}

function ReviewModal({
  payment, onClose, onApprove, onDecline, busy,
}: {
  payment:    PaymentWithProfile
  onClose:    () => void
  onApprove:  () => void
  onDecline:  () => void
  busy:       boolean
}) {
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [loadingUrl, setLoadingUrl] = useState(true)
  const plan = getPlan(payment.plan_requested)

  useEffect(() => {
    if (!payment.receipt_path) { setLoadingUrl(false); return }
    getReceiptSignedUrl(payment.receipt_path).then(url => {
      setReceiptUrl(url)
      setLoadingUrl(false)
    })
  }, [payment.receipt_path])

  const isPdf = payment.receipt_path?.toLowerCase().endsWith('.pdf')

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900">Payment review</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {payment.id.slice(0, 8)} · {new Date(payment.created_at).toLocaleString('en')}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoRow icon={UserIcon} label="User">
              {payment.profile?.full_name || '—'}
            </InfoRow>
            <InfoRow icon={Mail} label="Email">
              {payment.profile?.email || '—'}
            </InfoRow>
            <InfoRow icon={CreditCard} label="Plan">
              {plan?.title_ar ?? payment.plan_requested}
            </InfoRow>
            <InfoRow icon={CreditCard} label="Amount">
              {payment.amount} {payment.currency} · {payment.duration_months} month(s)
            </InfoRow>
          </div>

          {payment.user_note && (
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <div className="text-xs font-black text-gray-500 mb-1 uppercase tracking-wider">User note</div>
              <div className="text-gray-700" dir="auto">{payment.user_note}</div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-black text-gray-500 uppercase tracking-wider">Receipt</div>
              {receiptUrl && (
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  <ExternalLink className="w-3 h-3" /> Open in new tab
                </a>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 min-h-[300px] flex items-center justify-center">
              {loadingUrl ? (
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              ) : !receiptUrl ? (
                <div className="text-center text-gray-400 text-sm py-10">
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  No receipt uploaded
                </div>
              ) : isPdf ? (
                <iframe src={receiptUrl} className="w-full h-[500px]" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={receiptUrl} alt="receipt" className="max-w-full max-h-[500px] object-contain" />
              )}
            </div>
          </div>

          {payment.status !== 'pending' && (
            <div className={`rounded-xl p-3 text-sm ${
              payment.status === 'approved' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
            }`}>
              <div className="font-black text-xs uppercase tracking-wider mb-1">
                {payment.status === 'approved' ? 'Approved' : 'Declined'}
              </div>
              {payment.decline_reason && <div>{payment.decline_reason}</div>}
              {payment.reviewed_at && (
                <div className="text-xs opacity-70 mt-1">
                  {new Date(payment.reviewed_at).toLocaleString('en')}
                </div>
              )}
            </div>
          )}
        </div>

        {payment.status === 'pending' && (
          <div className="border-t border-gray-100 p-4 flex gap-2">
            <button
              onClick={onDecline}
              disabled={busy}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-sm py-3 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" /> Decline
            </button>
            <button
              onClick={onApprove}
              disabled={busy}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Approve & extend plan
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon, label, children,
}: { icon: typeof CreditCard; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className="text-gray-900 font-semibold">{children}</div>
    </div>
  )
}
