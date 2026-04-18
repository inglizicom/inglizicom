'use client'

import { useState, useEffect } from 'react'
import {
  Users, Shield, UserCheck, Search, Loader2, AlertCircle,
  RefreshCw, ShieldCheck, ShieldOff, CalendarDays,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  id:         string
  email:      string | null
  full_name:  string | null
  avatar_url: string | null
  is_admin:   boolean
  created_at: string
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }: {
  label: string; value: string | number; icon: React.ReactNode; color: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-gray-900 text-2xl font-black">{value}</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user: me } = useAuth()
  const [rows, setRows]         = useState<Profile[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [search, setSearch]     = useState('')
  const [toast, setToast]       = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  async function fetchProfiles() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, is_admin, created_at')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else       setRows((data ?? []) as Profile[])
    setLoading(false)
  }

  useEffect(() => { fetchProfiles() }, [])

  async function toggleAdmin(p: Profile) {
    if (p.id === me?.id && p.is_admin) {
      showToast('Error: you cannot demote yourself')
      return
    }
    setUpdating(p.id)
    const next = !p.is_admin
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: next })
      .eq('id', p.id)

    if (error) {
      showToast('Error: ' + error.message)
    } else {
      setRows(prev => prev.map(r => r.id === p.id ? { ...r, is_admin: next } : r))
      showToast(next ? 'Promoted to admin ✓' : 'Demoted to user ✓')
    }
    setUpdating(null)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  // ── Derived ─────────────────────────────────────────────────────────────────

  const q = search.toLowerCase()
  const filtered = rows.filter(r =>
    (r.email?.toLowerCase().includes(q) ?? false) ||
    (r.full_name?.toLowerCase().includes(q) ?? false)
  )
  const totalAdmins = rows.filter(r => r.is_admin).length
  const oneWeekAgo  = Date.now() - 7 * 24 * 60 * 60 * 1000
  const newThisWeek = rows.filter(r => new Date(r.created_at).getTime() > oneWeekAgo).length

  function fmtDate(s: string) {
    const d = new Date(s)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      {/* Page header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 font-black text-xl leading-none">Dashboard</h1>
          <p className="text-gray-400 text-xs mt-1">Manage users and admins</p>
        </div>
        <button
          onClick={fetchProfiles}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-40"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Users" value={loading ? '—' : rows.length}
          icon={<Users size={20} className="text-indigo-600" />}
          color="bg-indigo-50"
        />
        <StatCard
          label="Admins" value={loading ? '—' : totalAdmins}
          icon={<ShieldCheck size={20} className="text-emerald-600" />}
          color="bg-emerald-50"
        />
        <StatCard
          label="New This Week" value={loading ? '—' : newThisWeek}
          icon={<CalendarDays size={20} className="text-amber-600" />}
          color="bg-amber-50"
        />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-gray-500" />
            <h2 className="font-bold text-gray-800">Users</h2>
            {!loading && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">
                {filtered.length}
              </span>
            )}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search email or name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              disabled={loading}
              className="pl-8 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50 w-56 disabled:opacity-50"
            />
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 size={28} className="animate-spin text-indigo-400" />
            <p className="text-sm font-medium">Loading users...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-red-400">
            <AlertCircle size={28} />
            <p className="text-sm font-semibold">Failed to load users</p>
            <p className="text-xs text-gray-400 max-w-sm text-center">{error}</p>
            <button
              onClick={fetchProfiles}
              className="mt-2 text-xs font-bold px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-16 text-gray-400">
                      <Users size={32} className="mx-auto mb-3 opacity-30" />
                      No users found.
                    </td>
                  </tr>
                )}
                {filtered.map(p => {
                  const isBusy = updating === p.id
                  const isMe   = p.id === me?.id
                  const initial = (p.full_name || p.email || 'U').trim().charAt(0).toUpperCase()
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {p.avatar_url ? (
                            <img src={p.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center">
                              {initial}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-gray-900 font-semibold truncate">
                              {p.full_name || '—'}
                              {isMe && <span className="ml-2 text-[10px] text-indigo-500 font-bold uppercase">You</span>}
                            </p>
                            <p className="text-gray-400 text-xs truncate">{p.email || '—'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {p.is_admin ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                            <Shield size={11} /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full">
                            User
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-gray-500 whitespace-nowrap">{fmtDate(p.created_at)}</td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {isBusy ? (
                            <Loader2 size={16} className="animate-spin text-gray-400" />
                          ) : p.is_admin ? (
                            <button
                              onClick={() => toggleAdmin(p)}
                              disabled={isMe}
                              title={isMe ? 'You cannot demote yourself' : ''}
                              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ShieldOff size={12} />
                              Demote
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleAdmin(p)}
                              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
                            >
                              <ShieldCheck size={12} />
                              Make Admin
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl z-50 ${
          toast.startsWith('Error') ? 'bg-red-600' : 'bg-gray-900'
        }`}>
          {toast}
        </div>
      )}
    </main>
  )
}
