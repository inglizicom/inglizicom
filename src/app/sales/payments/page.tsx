'use client'

import { useEffect, useState } from 'react'
import {
  CreditCard, Loader2, Check, X, FileText, User as UserIcon,
  Mail, Clock, ExternalLink, ChevronRight, AlertTriangle,
} from 'lucide-react'
import { useStaff } from '@/lib/staff-context'
import {
  fetchAllPayments,
  getReceiptSignedUrl,
  approvePayment,
  declinePayment,
  type PaymentWithProfile,
  type PaymentStatus,
} from '@/lib/payments-db'
import { logActivity } from '@/lib/activity-log-db'
import { getPlan } from '@/data/plans'

export default function PaymentsPage() {
  const staff = useStaff()
  const [filter,    setFilter]    = useState<PaymentStatus | 'all'>('pending')
  const [rows,      setRows]      = useState<PaymentWithProfile[]>([])
  const [loading,   setLoading]   = useState(true)
  const [busy,      setBusy]      = useState<string | null>(null)
  const [reviewing, setReviewing] = useState<PaymentWithProfile | null>(null)
  const [error,     setError]     = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setRows(await fetchAllPayments(filter === 'all' ? undefined : filter))
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])  // eslint-disable-line react-hooks/exhaustive-deps

  async function handleApprove(p: PaymentWithProfile) {
    setBusy(p.id); setError(null)
    try {
      await approvePayment(p.id, staff.id)
      await logActivity({
        action: 'payment_approved', entityType: 'payment', entityId: p.id,
        after: { status: 'approved', amount: p.amount, currency: p.currency },
        metadata: { user_id: p.user_id, user_email: p.profile?.email ?? null },
      })
      await load(); setReviewing(null)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to approve.') }
    setBusy(null)
  }

  async function handleDecline(p: PaymentWithProfile, reason: string) {
    setBusy(p.id); setError(null)
    try {
      await declinePayment(p.id, staff.id, reason)
      await logActivity({
        action: 'payment_declined', entityType: 'payment', entityId: p.id,
        after: { status: 'declined' },
        metadata: { user_id: p.user_id, user_email: p.profile?.email ?? null, reason },
      })
      await load(); setReviewing(null)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to decline.') }
    setBusy(null)
  }

  const counts = {
    pending:  rows.filter(r => r.status === 'pending').length,
    approved: rows.filter(r => r.status === 'approved').length,
    declined: rows.filter(r => r.status === 'declined').length,
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-gray-900 font-black text-xl">Payments</h1>
        <p className="text-gray-400 text-xs mt-1">Review receipts and approve subscriptions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(['pending', 'approved', 'declined', 'all'] as const).map(key => {
          const label = key.charAt(0).toUpperCase() + key.slice(1)
          const count = counts[key as keyof typeof counts]
          return (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-2.5 text-[13px] font-bold border-b-2 transition-colors ${
                filter === key ? 'text-gray-900 border-gray-900' : 'text-gray-400 border-transparent hover:text-gray-700'
              }`}>
              {label}
              {count > 0 && (
                <span className={`ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded ${
                  key === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                }`}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-semibold">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700 font-bold text-sm">No payments</p>
          <p className="text-gray-400 text-xs mt-1">
            {filter === 'pending' ? 'No pending receipts to review.' : `No ${filter} payments found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map(p => {
            const plan = getPlan(p.plan_requested)
            return (
              <button key={p.id} onClick={() => setReviewing(p)}
                className={`w-full text-left bg-white border rounded-2xl p-4 hover:shadow-sm transition-all ${
                  p.status === 'pending' ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-100'
                }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    p.status === 'pending' ? 'bg-amber-50' : p.status === 'approved' ? 'bg-emerald-50' : 'bg-red-50'
                  }`}>
                    {p.status === 'pending'  ? <Clock className="w-4 h-4 text-amber-600" /> :
                     p.status === 'approved' ? <Check className="w-4 h-4 text-emerald-600" /> :
                                               <X className="w-4 h-4 text-red-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-gray-900 text-sm truncate">
                        {p.profile?.full_name || p.profile?.email || p.user_id.slice(0, 8)}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">· {p.amount} {p.currency}</span>
                    </div>
                    <div className="text-xs text-gray-400 font-semibold">
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
          busy={busy === reviewing.id}
          onClose={() => { setReviewing(null); setError(null) }}
          onApprove={() => handleApprove(reviewing)}
          onDecline={reason => handleDecline(reviewing, reason)}
        />
      )}
    </main>
  )
}

/* ─── ReviewModal ────────────────────────────────────────────── */
function ReviewModal({ payment, busy, onClose, onApprove, onDecline }: {
  payment:   PaymentWithProfile
  busy:      boolean
  onClose:   () => void
  onApprove: () => void
  onDecline: (reason: string) => void
}) {
  const [receiptUrl,  setReceiptUrl]  = useState<string | null>(null)
  const [loadingUrl,  setLoadingUrl]  = useState(true)
  const [declining,   setDeclining]   = useState(false)
  const [reason,      setReason]      = useState('')
  const [approving,   setApproving]   = useState(false)
  const plan = getPlan(payment.plan_requested)

  useEffect(() => {
    if (!payment.receipt_path) { setLoadingUrl(false); return }
    getReceiptSignedUrl(payment.receipt_path).then(url => { setReceiptUrl(url); setLoadingUrl(false) })
  }, [payment.receipt_path])

  const isPdf = payment.receipt_path?.toLowerCase().endsWith('.pdf')
  const isPending = payment.status === 'pending'

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900">Payment review</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {payment.id.slice(0, 8)} · {new Date(payment.created_at).toLocaleString('en')}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900"><X className="w-5 h-5" /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoRow icon={UserIcon}  label="User"  >{payment.profile?.full_name || '—'}</InfoRow>
            <InfoRow icon={Mail}      label="Email" >{payment.profile?.email || '—'}</InfoRow>
            <InfoRow icon={CreditCard}label="Plan"  >{plan?.title_ar ?? payment.plan_requested}</InfoRow>
            <InfoRow icon={CreditCard}label="Amount">{payment.amount} {payment.currency} · {payment.duration_months}mo</InfoRow>
          </div>

          {payment.user_note && (
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <div className="text-xs font-black text-gray-500 mb-1 uppercase tracking-wider">User note</div>
              <div className="text-gray-700" dir="auto">{payment.user_note}</div>
            </div>
          )}

          {/* Receipt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-black text-gray-500 uppercase tracking-wider">Receipt</div>
              {receiptUrl && (
                <a href={receiptUrl} target="_blank" rel="noopener"
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700">
                  <ExternalLink className="w-3 h-3" /> Open in new tab
                </a>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 min-h-[300px] flex items-center justify-center">
              {loadingUrl ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
               : !receiptUrl ? (
                 <div className="text-center text-gray-400 text-sm py-10">
                   <FileText className="w-8 h-8 mx-auto mb-2" />No receipt uploaded
                 </div>
               ) : isPdf ? (
                 <iframe src={receiptUrl} className="w-full h-[500px]" />
               ) : (
                 // eslint-disable-next-line @next/next/no-img-element
                 <img src={receiptUrl} alt="receipt" className="max-w-full max-h-[500px] object-contain" />
               )}
            </div>
          </div>

          {/* Already-reviewed banner */}
          {!isPending && (
            <div className={`rounded-xl p-3 text-sm ${payment.status === 'approved' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
              <div className="font-black text-xs uppercase tracking-wider mb-1">
                {payment.status === 'approved' ? 'Approved' : 'Declined'}
              </div>
              {payment.decline_reason && <div>{payment.decline_reason}</div>}
              {payment.reviewed_at && (
                <div className="text-xs opacity-70 mt-1">{new Date(payment.reviewed_at).toLocaleString('en')}</div>
              )}
            </div>
          )}
        </div>

        {/* Actions — inline, no confirm/prompt */}
        {isPending && (
          <div className="border-t border-gray-100 p-4 space-y-3">

            {/* Approve confirmation */}
            {approving ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
                <p className="text-[13px] font-bold text-emerald-800">
                  Approve {payment.amount} {payment.currency} for{' '}
                  <span className="font-black">{payment.profile?.full_name || payment.profile?.email || 'this user'}</span>?
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setApproving(false)}
                    className="flex-1 py-2 rounded-lg border border-emerald-200 text-emerald-700 text-sm font-bold hover:bg-emerald-100 transition-colors">
                    Cancel
                  </button>
                  <button onClick={onApprove} disabled={busy}
                    className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Confirm approval
                  </button>
                </div>
              </div>
            ) : null}

            {/* Decline reason input */}
            {declining ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                <label className="text-[12px] font-bold text-red-700 uppercase tracking-wide block">
                  Reason for declining (shown to user)
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={2}
                  placeholder="e.g. Receipt is unclear, please resubmit…"
                  className="w-full px-3 py-2 rounded-lg border border-red-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-red-400 resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={() => { setDeclining(false); setReason('') }}
                    className="flex-1 py-2 rounded-lg border border-red-200 text-red-700 text-sm font-bold hover:bg-red-100 transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => onDecline(reason)} disabled={busy || !reason.trim()}
                    className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                    Confirm decline
                  </button>
                </div>
              </div>
            ) : null}

            {/* Primary action buttons */}
            {!approving && !declining && (
              <div className="flex gap-2">
                <button onClick={() => setDeclining(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-sm py-3 rounded-xl transition-colors">
                  <X className="w-4 h-4" /> Decline
                </button>
                <button onClick={() => setApproving(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 rounded-xl transition-colors">
                  <Check className="w-4 h-4" /> Approve
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, children }: { icon: typeof CreditCard; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className="text-gray-900 font-semibold text-sm">{children}</div>
    </div>
  )
}
