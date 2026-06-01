'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, X, MessageCircle, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { whatsappLink, LEAD_STATUS_META, normalizeStatus } from '@/lib/leads-db'
import { LEAD_SOURCES } from '@/lib/crm-types'
import Link from 'next/link'

interface Lead {
  id:         string
  full_name:  string
  phone:      string | null
  source:     string | null
  lead_source: string | null
  plan_id:    string | null
  amount_mad: number | null
  status:     string
  created_at: string
}

const SEEN_KEY = 'crm:seen-leads'

function getSeenIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]')) }
  catch { return new Set() }
}
function markSeen(id: string) {
  const seen = getSeenIds(); seen.add(id)
  localStorage.setItem(SEEN_KEY, JSON.stringify([...seen].slice(-500)))
}
function markAllSeen(ids: string[]) {
  const seen = getSeenIds(); ids.forEach(id => seen.add(id))
  localStorage.setItem(SEEN_KEY, JSON.stringify([...seen].slice(-500)))
}

export default function NotificationBell({ basePath = '/sales' }: { basePath?: string }) {
  const [leads,     setLeads]     = useState<Lead[]>([])
  const [unseenIds, setUnseenIds] = useState<Set<string>>(new Set())
  const [open,      setOpen]      = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  /* Initial load — last 50 leads ordered newest first */
  async function loadLeads() {
    const { data } = await supabase
      .from('subscription_leads')
      .select('id, full_name, phone, source, lead_source, plan_id, amount_mad, status, created_at')
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .limit(50)

    const rows  = (data ?? []) as Lead[]
    const seen  = getSeenIds()
    setLeads(rows)
    setUnseenIds(new Set(rows.filter(l => !seen.has(l.id)).map(l => l.id)))
  }

  /* Supabase realtime — listen for new leads */
  useEffect(() => {
    loadLeads()

    const channel = supabase
      .channel('crm-new-leads')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'subscription_leads' },
        payload => {
          const lead = payload.new as Lead
          setLeads(prev => [lead, ...prev].slice(0, 50))
          setUnseenIds(prev => new Set([...prev, lead.id]))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  /* Close panel on outside click */
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  function handleOpen() {
    setOpen(o => !o)
  }

  function handleMarkAllRead() {
    markAllSeen(leads.map(l => l.id))
    setUnseenIds(new Set())
  }

  function handleClickLead(id: string) {
    markSeen(id)
    setUnseenIds(prev => { const n = new Set(prev); n.delete(id); return n })
    setOpen(false)
  }

  const unreadCount = unseenIds.size

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        title="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center tabular-nums shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification panel */}
      {open && (
        <div className="absolute left-0 bottom-full mb-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-50">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-gray-500" />
              <span className="text-sm font-bold text-gray-800">New leads</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-md tabular-nums">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-blue-600 font-semibold hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Lead list */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {leads.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No leads yet. New submissions will appear here instantly.
              </div>
            ) : (
              leads.map(lead => {
                const unseen = unseenIds.has(lead.id)
                const wa     = whatsappLink(lead.phone, `مرحبا ${lead.full_name}`)
                const src    = LEAD_SOURCES.find(s => s.id === (lead.lead_source ?? lead.source))
                const status = normalizeStatus(lead.status as any)
                const age    = timeAgo(lead.created_at)

                return (
                  <div
                    key={lead.id}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${
                      unseen ? 'bg-blue-50/60' : 'bg-white'
                    }`}
                  >
                    {/* Unread dot */}
                    <div className="mt-1.5 flex-shrink-0">
                      {unseen
                        ? <div className="w-2 h-2 rounded-full bg-blue-500" />
                        : <div className="w-2 h-2 rounded-full bg-gray-200" />
                      }
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <p className={`text-sm truncate ${unseen ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                            {lead.full_name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {src && <span className="text-[11px] text-gray-500">{src.emoji} {src.label}</span>}
                            {lead.amount_mad && (
                              <span className="text-[11px] font-bold text-gray-700 tabular-nums">
                                {lead.amount_mad.toLocaleString()} MAD
                              </span>
                            )}
                            <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${
                              LEAD_STATUS_META[status]?.color?.split(' ').slice(0, 2).join(' ') ?? 'bg-gray-100 text-gray-600'
                            }`}>
                              {LEAD_STATUS_META[status]?.short ?? status}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">{age}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {wa && (
                            <a
                              href={wa}
                              target="_blank"
                              rel="noopener"
                              onClick={() => handleClickLead(lead.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                              title="WhatsApp"
                            >
                              <MessageCircle size={13} />
                            </a>
                          )}
                          <Link
                            href={`${basePath}/leads`}
                            onClick={() => handleClickLead(lead.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                            title="Open leads"
                          >
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
            <Link
              href={`${basePath}/leads`}
              onClick={() => { handleMarkAllRead(); setOpen(false) }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              View all leads →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h}h ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}
