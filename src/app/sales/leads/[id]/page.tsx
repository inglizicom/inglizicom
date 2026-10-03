'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight, MessageCircle, Phone, Crown, Loader2,
  Clock, MapPin, Banknote, Tag, User, CalendarDays,
  AlertCircle, CheckCircle2, Pencil,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  LEAD_STATUS_META, LEAD_STATUS_AR, normalizeStatus, whatsappLink,
  type SubscriptionLead, type LeadStatus,
} from '@/lib/leads-db'
import { LEAD_SOURCES } from '@/lib/crm-types'
import { fetchLeadTimeline, fetchStudentByLeadId, convertLeadToStudent } from '@/lib/crm-db'
import { logLeadEvent } from '@/lib/crm-db'
import type { LeadEvent } from '@/lib/crm-types'
import { useCrmBasePath } from '@/lib/use-crm-path'
import { GraduationCap } from 'lucide-react'
import { countryFlag } from '@/lib/geo-currency'
import Avatar from '../../_components/Avatar'

const CARD = 'bg-white border border-zinc-200 rounded-[22px] shadow-sm'
const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString('ar-MA', { day: 'numeric', month: 'long', year: 'numeric' })

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={20} className="animate-spin text-zinc-400" />
      </div>
    )
  }

  if (notFound || !lead) {
    return (
      <div className="px-6 py-16 text-center max-w-md mx-auto">
        <AlertCircle size={32} className="mx-auto text-zinc-300 mb-3" />
        <h1 className="font-bold text-zinc-800">العميل غير موجود</h1>
        <p className="text-sm text-zinc-400 mt-1 mb-5">ربما حُذف هذا العميل أو أن الرابط غير صحيح.</p>
        <Link href={`${base}/workspace`} className="text-sm font-bold text-blue-700 underline">العودة إلى العملاء</Link>
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
    } catch (e) { setConvertErr(e instanceof Error ? e.message : 'تعذّر التحويل') }
    finally { setConverting(false) }
  }

  return (
    <div className="px-4 lg:px-8 py-6 max-w-[1100px] mx-auto">

      {/* Back */}
      <Link href={`${base}/workspace`}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-zinc-500 hover:text-blue-700 mb-5 transition-colors">
        <ArrowRight size={14} /> العودة إلى العملاء المحتملين
      </Link>

      {/* Header */}
      <div className={`${CARD} p-5 flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-3.5 min-w-0">
          <Avatar name={lead.full_name} size={56} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900">{lead.full_name}</h1>
              {lead.country && <span title={lead.country} className="text-lg leading-none">{countryFlag(lead.country)}</span>}
              {lead.is_vip && <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800"><Crown size={12} /> VIP</span>}
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-[11.5px] font-bold px-2.5 py-0.5 rounded-full border ${statusMeta?.color ?? 'bg-zinc-100 text-zinc-500'}`}>
                {LEAD_STATUS_AR[status as LeadStatus] ?? status}
              </span>
              {isOverdue && (
                <span className="text-[11.5px] font-bold px-2.5 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1">
                  <Clock size={11} /> متابعة متأخرة
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {wa && (
            <a href={wa} target="_blank" rel="noopener"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-[13px] font-bold hover:bg-emerald-600 shadow-sm transition-colors">
              <MessageCircle size={15} /> واتساب
            </a>
          )}
          {lead.phone && (
            <a href={`tel:${lead.phone}`}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-700 text-[13px] font-bold hover:border-blue-300 hover:text-blue-700 transition-colors">
              <Phone size={15} /> اتصال
            </a>
          )}
          {student && (
            <Link href={`${base}/students/${student.id}`}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-[13px] font-bold hover:bg-emerald-100 transition-colors">
              <CheckCircle2 size={15} /> ملف الطالب
            </Link>
          )}
          {canConvert && !convertConfirm && (
            <button onClick={() => setConvertConfirm(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-l from-blue-600 to-blue-800 text-white text-[13px] font-bold shadow-sm hover:from-blue-500 hover:to-blue-700 transition">
              <GraduationCap size={15} /> تحويل إلى طالب
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
              تحويل <span className="font-black">{lead.full_name}</span> إلى طالب؟
            </p>
            <p className="text-[11.5px] text-emerald-700 mt-0.5">
              سيُنشأ ملف طالب من اسم العميل وهاتفه ودورته والمبلغ.
            </p>
          </div>
          {convertErr && <p className="w-full text-xs font-bold text-red-600">{convertErr}</p>}
          <div className="flex items-center gap-2">
            <button onClick={() => { setConvertConfirm(false); setConvertErr(null) }}
              className="px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors">
              تراجع
            </button>
            <button onClick={handleConvert} disabled={converting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50">
              {converting ? <Loader2 size={12} className="animate-spin" /> : <GraduationCap size={12} />}
              تأكيد التحويل
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">

        {/* ── Contact info ──────────────────────────── */}
        <div className="lg:col-span-1 space-y-4 min-w-0">
          <div className={`${CARD} p-5 space-y-3.5`}>
            <h2 className="text-[14px] font-extrabold text-zinc-900">معلومات التواصل</h2>
            {lead.phone && (
              <InfoLine icon={Phone} label="الهاتف">
                <a href={`tel:${lead.phone}`} dir="ltr" className="font-semibold text-zinc-900 hover:underline">{lead.phone}</a>
              </InfoLine>
            )}
            {lead.city && <InfoLine icon={MapPin} label="المدينة"><span className="text-zinc-700">{lead.city}</span></InfoLine>}
            {lead.amount_mad ? (
              <InfoLine icon={Banknote} label="قيمة الخطة">
                <span className="font-bold text-zinc-900">{lead.amount_mad.toLocaleString('en-US')} د.م</span>
                {lead.plan_id && <span className="text-zinc-400 text-[11px] mr-1">· {lead.plan_id}</span>}
              </InfoLine>
            ) : null}
            {srcMeta && (
              <InfoLine icon={Tag} label="المصدر">
                <span className="text-zinc-700">{srcMeta.emoji} {srcMeta.label}</span>
              </InfoLine>
            )}
            {lead.course && (
              <InfoLine icon={User} label="الدورة"><span className="text-zinc-700 uppercase">{lead.course}</span></InfoLine>
            )}
            {lead.next_followup_at && (
              <InfoLine icon={CalendarDays} label="المتابعة القادمة">
                <span className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-zinc-700'}`}>
                  {fmtDay(lead.next_followup_at)}
                  {isOverdue && ' · متأخرة'}
                </span>
              </InfoLine>
            )}
            <InfoLine icon={CalendarDays} label="تاريخ الإضافة">
              <span className="text-zinc-500 text-[12.5px]">{fmtDay(lead.created_at)}</span>
            </InfoLine>
          </div>

          {(lead.notes || lead.admin_note) && (
            <div className={`${CARD} p-5`}>
              <h2 className="text-[14px] font-extrabold text-zinc-900 mb-2">ملاحظات</h2>
              <p className="text-[13px] text-zinc-700 whitespace-pre-wrap leading-relaxed">
                {lead.notes || lead.admin_note}
              </p>
            </div>
          )}

          <button onClick={() => router.push(`${base}/workspace`)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12.5px] font-bold text-zinc-500 hover:text-blue-700 hover:bg-white transition-colors">
            <Pencil size={13} /> تعديل العميل من قائمة العملاء
          </button>
        </div>

        {/* ── Timeline ─────────────────────────────── */}
        <div className="lg:col-span-2 min-w-0">
          <div className={`${CARD} p-5`}>
            <h2 className="text-[14px] font-extrabold text-zinc-900 mb-4">السجل الزمني</h2>
            {timeline.length === 0 ? (
              <div className="py-8 text-center">
                <Clock size={24} className="mx-auto text-zinc-300 mb-2" />
                <p className="text-[13px] text-zinc-400">لا أحداث مسجّلة بعد.</p>
              </div>
            ) : (
              <ol className="relative border-r-2 border-zinc-100 space-y-4 pr-5 mr-1.5">
                {timeline.map(event => (
                  <li key={event.id} className="relative">
                    <div className="absolute -right-[1.72rem] top-0.5 w-3.5 h-3.5 rounded-full bg-white border-[3px] border-blue-500" />
                    <div className="text-[11px] text-zinc-400 mb-0.5">
                      {new Date(event.created_at).toLocaleString('ar-MA', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                      {event.actor_email && <span className="mr-1">· {event.actor_email}</span>}
                    </div>
                    <div className="text-[13px] font-semibold text-zinc-800">{event.title}</div>
                    {event.body && <p className="text-[12px] text-zinc-500 mt-0.5">{event.body}</p>}
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
    <div className="flex items-start gap-3">
      <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
        <Icon size={14} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-zinc-400">{label}</div>
        <div className="text-[13px]">{children}</div>
      </div>
    </div>
  )
}
