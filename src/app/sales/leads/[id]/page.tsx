'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeft, MessageCircle, Phone, Crown, Loader2,
  Clock, MapPin, Banknote, Tag, User, CalendarDays,
  AlertCircle, CheckCircle2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  LEAD_STATUS_META, normalizeStatus, whatsappLink,
  type SubscriptionLead, type LeadStatus,
} from '@/lib/leads-db'
import { LEAD_SOURCES } from '@/lib/crm-types'
import { fetchLeadTimeline, fetchStudentByLeadId, convertLeadToStudent } from '@/lib/crm-db'
import { logLeadEvent } from '@/lib/crm-db'
import type { LeadEvent } from '@/lib/crm-types'
import { useCrmBasePath } from '@/lib/use-crm-path'
import { GraduationCap } from 'lucide-react'
import { countryFlag } from '@/lib/geo-currency'

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const base   = useCrmBasePath()
  const id     = params?.id as string

  const [lead,           setLead]           = useState<SubscriptionLead | null>(null)
  const [timeline,       setTimeline]       = useState<LeadEvent[]>([])
  const [student,        setStudent]        = useState<{ id: string } | null>(null)
  const [loading,        setLoading]        = useState(true)
  const [notFound,       setNotFound]       = useState(false)
  const [convertConfirm, setConvertConfirm] = useState(false)
  const [converting,     setConverting]     = useState(false)
  const [convertErr,     setConvertErr]     = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    async function load() {
      const [{ data }, tl, st] = await Promise.all([
        supabase.from('subscription_leads').select('*').eq('id', id).maybeSingle(),
        fetchLeadTimeline(id),
        fetchStudentByLeadId(id),
      ])
      if (!data) { setNotFound(true) } else { setLead(data as SubscriptionLead) }
      setTimeline(tl)
      setStudent(st)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={20} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (notFound || !lead) {
    return (
      <div className="px-6 py-16 text-center max-w-md mx-auto">
        <AlertCircle size={32} className="mx-auto text-gray-300 mb-3" />
        <h1 className="font-bold text-gray-800">Lead not found</h1>
        <p className="text-sm text-gray-400 mt-1 mb-5">This lead may have been deleted or the URL is incorrect.</p>
        <Link href={`${base}/leads`} className="text-sm font-bold text-gray-900 underline">← Back to leads</Link>
      </div>
    )
  }

  const status     = normalizeStatus(lead.status)
  const statusMeta = LEAD_STATUS_META[status as LeadStatus]
  const wa         = whatsappLink(lead.phone, `مرحبا ${lead.full_name}، أنا من إنجليزي.كوم`)
  const srcMeta    = LEAD_SOURCES.find(s => s.id === (lead.lead_source ?? lead.source))
  const isOverdue  = lead.next_followup_at && new Date(lead.next_followup_at) < new Date()
    && !['paid', 'cancelled'].includes(status)
  const canConvert = status === 'paid' && !student

  async function handleConvert() {
    setConverting(true); setConvertErr(null)
    try {
      await convertLeadToStudent(id)
      await logLeadEvent({ leadId: id, eventType: 'converted', title: 'Converted to student' })
      const st = await fetchStudentByLeadId(id)
      setStudent(st); setConvertConfirm(false)
      const tl = await fetchLeadTimeline(id); setTimeline(tl)
    } catch (e) { setConvertErr(e instanceof Error ? e.message : 'Conversion failed') }
    finally { setConverting(false) }
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1100px] mx-auto">

      {/* Back */}
      <Link href={`${base}/leads`}
        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-gray-400 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft size={13} /> Back to leads
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-black text-lg">
            {lead.full_name[0]?.toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-black tracking-tight text-gray-900">{lead.full_name}</h1>
              {lead.country && <span title={lead.country} className="text-lg leading-none">{countryFlag(lead.country)}</span>}
              {lead.is_vip && <Crown size={15} className="text-rose-500" />}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${statusMeta?.color ?? 'bg-gray-100 text-gray-500'}`}>
                {statusMeta?.label ?? status}
              </span>
              {isOverdue && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded border bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1">
                  <Clock size={9} /> Overdue
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          {wa && (
            <a href={wa} target="_blank" rel="noopener"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500 text-white text-[13px] font-bold hover:bg-green-600 transition-colors">
              <MessageCircle size={14} /> WhatsApp
            </a>
          )}
          {lead.phone && (
            <a href={`tel:${lead.phone}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-[13px] font-bold hover:bg-gray-200 transition-colors">
              <Phone size={14} /> Call
            </a>
          )}
          {student && (
            <Link href={`${base}/students`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-[13px] font-bold hover:bg-emerald-100 transition-colors">
              <CheckCircle2 size={14} /> View student
            </Link>
          )}
          {canConvert && !convertConfirm && (
            <button onClick={() => setConvertConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-[13px] font-bold hover:bg-emerald-700 transition-colors">
              <GraduationCap size={14} /> Convert to student
            </button>
          )}
        </div>
      </div>

      {/* ── Convert confirmation banner ─────────────── */}
      {convertConfirm && (
        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-wrap items-center gap-3">
          <GraduationCap size={16} className="text-emerald-700 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-emerald-900">
              Convert <span className="font-black">{lead.full_name}</span> to a student?
            </p>
            <p className="text-[11px] text-emerald-600 mt-0.5">
              A student record will be created from this lead's name, phone, course and amount.
            </p>
          </div>
          {convertErr && <p className="w-full text-xs font-bold text-red-600">{convertErr}</p>}
          <div className="flex items-center gap-2">
            <button onClick={() => { setConvertConfirm(false); setConvertErr(null) }}
              className="px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors">
              Cancel
            </button>
            <button onClick={handleConvert} disabled={converting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50">
              {converting ? <Loader2 size={12} className="animate-spin" /> : <GraduationCap size={12} />}
              Confirm conversion
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5 mt-6">

        {/* ── Contact info ──────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">Contact info</h2>
            {lead.phone && (
              <InfoLine icon={Phone} label="Phone">
                <a href={`tel:${lead.phone}`} className="font-semibold text-gray-900 hover:underline">{lead.phone}</a>
              </InfoLine>
            )}
            {lead.city && <InfoLine icon={MapPin} label="City"><span className="text-gray-700">{lead.city}</span></InfoLine>}
            {lead.amount_mad && (
              <InfoLine icon={Banknote} label="Plan value">
                <span className="font-bold text-gray-900">{lead.amount_mad.toLocaleString()} MAD</span>
                {lead.plan_id && <span className="text-gray-400 text-[11px] ml-1">· {lead.plan_id}</span>}
              </InfoLine>
            )}
            {srcMeta && (
              <InfoLine icon={Tag} label="Source">
                <span className="text-gray-700">{srcMeta.emoji} {srcMeta.label}</span>
              </InfoLine>
            )}
            {lead.course && (
              <InfoLine icon={User} label="Course"><span className="text-gray-700">{lead.course}</span></InfoLine>
            )}
            {lead.next_followup_at && (
              <InfoLine icon={CalendarDays} label="Follow-up">
                <span className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-gray-700'}`}>
                  {new Date(lead.next_followup_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {isOverdue && ' · overdue'}
                </span>
              </InfoLine>
            )}
            <InfoLine icon={CalendarDays} label="Created">
              <span className="text-gray-500 text-[12px]">
                {new Date(lead.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </InfoLine>
          </div>

          {(lead.notes || lead.admin_note) && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">Notes</h2>
              <p className="text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed">
                {lead.notes || lead.admin_note}
              </p>
            </div>
          )}

          <div className="text-center">
            <button onClick={() => router.push(`${base}/leads`)}
              className="text-xs text-gray-400 hover:text-gray-900 font-semibold underline">
              Edit this lead in the leads list →
            </button>
          </div>
        </div>

        {/* ── Timeline ─────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">Timeline</h2>
            {timeline.length === 0 ? (
              <div className="py-8 text-center">
                <Clock size={24} className="mx-auto text-gray-200 mb-2" />
                <p className="text-[13px] text-gray-400">No events recorded yet.</p>
              </div>
            ) : (
              <ol className="relative border-l border-gray-200 space-y-4 pl-4">
                {timeline.map(event => (
                  <li key={event.id} className="relative">
                    <div className="absolute -left-[1.375rem] w-3 h-3 rounded-full bg-white border-2 border-gray-300" />
                    <div className="text-[11px] text-gray-400 mb-0.5">
                      {new Date(event.created_at).toLocaleString('en-GB', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                      {event.actor_email && <span className="ml-1">· {event.actor_email}</span>}
                    </div>
                    <div className="text-[13px] font-semibold text-gray-800">{event.title}</div>
                    {event.body && <p className="text-[12px] text-gray-500 mt-0.5">{event.body}</p>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoLine({ icon: Icon, label, children }: {
  icon: LucideIcon
  label: string; children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</div>
        <div className="text-[13px]">{children}</div>
      </div>
    </div>
  )
}
