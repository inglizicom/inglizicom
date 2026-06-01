'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, X, MessageCircle, ExternalLink, Clock } from 'lucide-react'
import { createPortal } from 'react-dom'
import { supabase } from '@/lib/supabase'
import { whatsappLink, LEAD_STATUS_META, normalizeStatus } from '@/lib/leads-db'
import { LEAD_SOURCES } from '@/lib/crm-types'
import Link from 'next/link'

interface Lead {
  id:          string
  full_name:   string
  phone:       string | null
  source:      string | null
  lead_source: string | null
  plan_id:     string | null
  amount_mad:  number | null
  status:      string
  created_at:  string
}

const SEEN_KEY = 'crm:seen-leads'
const getSeenIds  = (): Set<string> => { try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]')) } catch { return new Set() } }
const markSeen    = (id: string)   => { const s = getSeenIds(); s.add(id); localStorage.setItem(SEEN_KEY, JSON.stringify([...s].slice(-500))) }
const markAllSeen = (ids: string[]) => { const s = getSeenIds(); ids.forEach(id => s.add(id)); localStorage.setItem(SEEN_KEY, JSON.stringify([...s].slice(-500))) }

export default function NotificationBell({ basePath = '/sales' }: { basePath?: string }) {
  const [leads,     setLeads]     = useState<Lead[]>([])
  const [unseenIds, setUnseenIds] = useState<Set<string>>(new Set())
  const [open,      setOpen]      = useState(false)
  const [panelPos,  setPanelPos]  = useState<React.CSSProperties>({})
  const btnRef  = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  async function loadLeads() {
    const { data } = await supabase
      .from('subscription_leads')
      .select('id,full_name,phone,source,lead_source,plan_id,amount_mad,status,created_at')
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .limit(50)
    const rows = (data ?? []) as Lead[]
    const seen = getSeenIds()
    setLeads(rows)
    setUnseenIds(new Set(rows.filter(l => !seen.has(l.id)).map(l => l.id)))
  }

  useEffect(() => {
    loadLeads()
    const ch = supabase.channel('notif-leads')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'subscription_leads' }, payload => {
        const lead = payload.new as Lead
        setLeads(prev => [lead, ...prev].slice(0, 50))
        setUnseenIds(prev => new Set([...prev, lead.id]))
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  /* Open panel using portal — position to the right of the button */
  function openPanel() {
    if (!btnRef.current) return
    const r  = btnRef.current.getBoundingClientRect()
    setPanelPos({ position: 'fixed', top: r.top, left: r.right + 8, zIndex: 99999 })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (panelRef.current?.contains(e.target as Node) || btnRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  function handleClickLead(id: string) {
    markSeen(id)
    setUnseenIds(prev => { const n = new Set(prev); n.delete(id); return n })
    setOpen(false)
  }
  function handleMarkAll() { markAllSeen(leads.map(l => l.id)); setUnseenIds(new Set()) }

  const unread = unseenIds.size

  return (
    <>
      {/* Full-width row button — always visible in sidebar */}
      <button
        ref={btnRef}
        onClick={() => open ? setOpen(false) : openPanel()}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors group"
      >
        <div className="relative flex-shrink-0">
          <Bell size={16} className={unread > 0 ? 'text-yellow-400' : ''} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[8px] font-bold flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </div>
        <span className="text-[13px] font-semibold flex-1 text-left">
          Notifications
        </span>
        {unread > 0 && (
          <span className="px-1.5 py-0.5 bg-red-500 text-white rounded text-[9px] font-bold tabular-nums">
            {unread} new
          </span>
        )}
      </button>

      {/* Panel via portal — opens to the right of the sidebar */}
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          style={{ ...panelPos as React.CSSProperties, maxHeight: 'calc(100vh - 32px)' }}
          className="w-80 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-gray-500" />
              <span className="text-sm font-bold text-gray-800">Notifications</span>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unread > 0 && (
                <button onClick={handleMarkAll} className="text-[11px] text-blue-600 font-semibold hover:text-blue-800">
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Lead list */}
          <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
            {leads.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell size={24} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">No leads yet.</p>
                <p className="text-xs text-gray-300 mt-1">New submissions appear here instantly.</p>
              </div>
            ) : leads.map(lead => {
              const unseen = unseenIds.has(lead.id)
              const wa     = whatsappLink(lead.phone, `مرحبا ${lead.full_name}`)
              const src    = LEAD_SOURCES.find(s => s.id === (lead.lead_source ?? lead.source))
              const status = normalizeStatus(lead.status as any)
              const meta   = LEAD_STATUS_META[status]

              return (
                <div key={lead.id}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors ${unseen ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}>

                  {/* Unread indicator */}
                  <div className="mt-2 flex-shrink-0 w-2 h-2 rounded-full" style={{ background: unseen ? '#3b82f6' : '#e5e7eb' }} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${unseen ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                      {lead.full_name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {src && <span className="text-[11px] text-gray-500">{src.emoji} {src.label}</span>}
                      {lead.amount_mad ? (
                        <span className="text-[11px] font-bold text-gray-700 tabular-nums">{lead.amount_mad.toLocaleString()} MAD</span>
                      ) : null}
                      {meta && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${meta.color?.split(' ').slice(0, 2).join(' ') ?? 'bg-gray-100 text-gray-600'}`}>
                          {meta.short}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock size={9} /> {timeAgo(lead.created_at)}
                    </p>
                  </div>

                  {/* Quick actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {wa && (
                      <a href={wa} target="_blank" rel="noopener"
                        onClick={() => handleClickLead(lead.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        title="WhatsApp">
                        <MessageCircle size={13} />
                      </a>
                    )}
                    <Link href={`${basePath}/leads`}
                      onClick={() => handleClickLead(lead.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                      title="Open leads">
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <Link href={`${basePath}/leads`}
              onClick={() => { handleMarkAll(); setOpen(false) }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              View all leads →
            </Link>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1)  return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}
