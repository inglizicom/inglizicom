'use client'

import { MessageCircle, Phone, Crown, Clock, AlertTriangle, CheckCircle2, Circle } from 'lucide-react'
import { type SubscriptionLead, normalizeStatus, whatsappLink } from '@/lib/leads-db'
import { LEAD_STATUS_META } from '@/lib/leads-db'
import { getSourceMeta, getCourseMeta } from '@/lib/crm-types'

/* Arabic status labels */
const STATUS_AR: Record<string, string> = {
  new:        'جديد',
  contacted:  'تم التواصل',
  interested: 'مهتم',
  follow_up:  'متابعة',
  confirmed:  'مؤكد',
  paid:       'دفع',
  delayed:    'متأخر',
  cancelled:  'ملغي',
  vip:        'VIP',
}

const todayStr = () => new Date().toISOString().slice(0, 10)

function urgencyLabel(lead: SubscriptionLead): { text: string; color: string; icon: React.ReactNode } | null {
  const s = normalizeStatus(lead.status)
  if (s === 'paid' || s === 'cancelled') return null
  const d = lead.next_followup_at?.slice(0, 10)
  const t = todayStr()
  if (d && d < t)  return { text: 'متأخر', color: 'text-red-600', icon: <AlertTriangle size={11} /> }
  if (d && d === t) return { text: 'اليوم', color: 'text-orange-600', icon: <Clock size={11} /> }
  return null
}

function fmtDate(s?: string | null) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric' })
}

interface Props {
  lead:       SubscriptionLead
  selected?:  boolean
  onSelect?:  (id: string) => void
  onClick?:   (lead: SubscriptionLead) => void
  staffName?: string
}

export default function LeadCard({ lead, selected, onSelect, onClick, staffName }: Props) {
  const status  = normalizeStatus(lead.status)
  const meta    = LEAD_STATUS_META[status]
  const source  = getSourceMeta(lead.lead_source ?? lead.source)
  const course  = getCourseMeta(lead.course)
  const urgency = urgencyLabel(lead)
  const phone   = lead.phone ?? ''

  return (
    <div
      className={[
        'group relative bg-white rounded-xl border transition-all cursor-pointer',
        'hover:shadow-md hover:border-zinc-300',
        selected ? 'border-yellow-400 ring-2 ring-yellow-200 shadow-sm' : 'border-zinc-200',
      ].join(' ')}
      onClick={() => onClick?.(lead)}
    >
      {/* Selection checkbox */}
      {onSelect && (
        <button
          className="absolute top-3 right-3 z-10"
          onClick={e => { e.stopPropagation(); onSelect(lead.id) }}
        >
          {selected
            ? <CheckCircle2 size={18} className="text-yellow-500 fill-yellow-400" />
            : <Circle size={18} className="text-zinc-300 group-hover:text-zinc-400" />
          }
        </button>
      )}

      <div className="p-4">
        {/* Top row: name + VIP + urgency */}
        <div className="flex items-start gap-2 mb-2 pr-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {lead.is_vip && <Crown size={13} className="text-rose-500 flex-shrink-0" />}
              <span className="font-bold text-[15px] text-zinc-900 truncate">{lead.full_name}</span>
            </div>
            {urgency && (
              <div className={`flex items-center gap-1 text-[11px] font-semibold mt-0.5 ${urgency.color}`}>
                {urgency.icon} {urgency.text}
                {lead.next_followup_at && (
                  <span className="font-normal text-zinc-400 mr-1">— {fmtDate(lead.next_followup_at)}</span>
                )}
              </div>
            )}
          </div>
          {/* Status badge */}
          <span className={`flex-shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full border ${meta.color}`}>
            {STATUS_AR[status] ?? status}
          </span>
        </div>

        {/* Middle row: source + course + amount */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${source.color}`}>
            {source.emoji} {source.label}
          </span>
          {lead.course && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
              {course.short}
            </span>
          )}
          {(lead.amount_mad ?? 0) > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {lead.amount_mad?.toLocaleString('ar-MA')} درهم
            </span>
          )}
          {staffName && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-50 text-zinc-400 border border-zinc-100">
              👤 {staffName}
            </span>
          )}
        </div>

        {/* Bottom row: phone + WhatsApp + last action */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {phone && (
              <>
                <a
                  href={`tel:${phone}`}
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1 text-[12px] text-zinc-500 hover:text-zinc-700"
                >
                  <Phone size={12} />
                  <span dir="ltr">{phone}</span>
                </a>
                <a
                  href={whatsappLink(phone, `مرحبًا ${lead.full_name}،`) ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1 text-[12px] font-semibold text-green-600 hover:text-green-700 bg-green-50 px-2 py-0.5 rounded-full"
                >
                  <MessageCircle size={11} /> واتساب
                </a>
              </>
            )}
          </div>
          {lead.last_contact_at && (
            <span className="text-[11px] text-zinc-400">
              آخر تواصل: {fmtDate(lead.last_contact_at)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
