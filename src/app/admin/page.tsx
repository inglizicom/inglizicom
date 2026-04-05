'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Users, Zap, Flame, Crown, UserCheck, Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? ''

// ─── Types ────────────────────────────────────────────────────────────────────

type Plan = 'free' | 'premium'

interface User {
  id: string
  email: string
  plan: Plan
  xp: number
  streak: number
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon, color,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
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
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [users, setUsers]     = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [search, setSearch]   = useState('')
  const [toast, setToast]     = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  // ── Auth guard ─────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email === ADMIN_EMAIL) {
        setAuthChecked(true)
      } else {
        router.replace('/')
      }
    })
  }, [router])

  // ── Fetch ──────────────────────────────────────────────────────────────────

  async function fetchUsers() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('users')
      .select('id, email, plan, xp, streak')
      .order('xp', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setUsers((data ?? []) as User[])
    }
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  // ── Update plan ────────────────────────────────────────────────────────────

  async function setPlan(id: string, plan: Plan) {
    setUpdating(id)
    const { error } = await supabase
      .from('users')
      .update({ plan })
      .eq('id', id)

    if (error) {
      showToast('Error: ' + error.message)
    } else {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, plan } : u))
      showToast(plan === 'premium' ? 'Upgraded to Premium ✓' : 'Moved to Free ✓')
    }
    setUpdating(null)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  // ── Derived stats ──────────────────────────────────────────────────────────

  const filtered     = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()))
  const totalPremium = users.filter(u => u.plan === 'premium').length
  const totalXP      = users.reduce((s, u) => s + (u.xp ?? 0), 0)
  const avgStreak    = users.length
    ? Math.round(users.reduce((s, u) => s + (u.streak ?? 0), 0) / users.length)
    : 0

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="ltr">
        <Loader2 size={28} className="animate-spin text-indigo-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="ltr">

      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 font-black text-lg leading-none">Admin Dashboard</h1>
            <p className="text-gray-400 text-xs mt-0.5">Inglizi.com — internal use only</p>
          </div>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-40"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Total Users" value={loading ? '—' : users.length}
            icon={<Users size={20} className="text-indigo-600" />}
            color="bg-indigo-50"
          />
          <StatCard
            label="Premium" value={loading ? '—' : totalPremium}
            icon={<Crown size={20} className="text-amber-600" />}
            color="bg-amber-50"
          />
          <StatCard
            label="Total XP" value={loading ? '—' : totalXP.toLocaleString()}
            icon={<Zap size={20} className="text-emerald-600" />}
            color="bg-emerald-50"
          />
          <StatCard
            label="Avg Streak" value={loading ? '—' : `${avgStreak}d`}
            icon={<Flame size={20} className="text-orange-500" />}
            color="bg-orange-50"
          />
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Table toolbar */}
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
                placeholder="Search email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                disabled={loading}
                className="pl-8 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50 w-48 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <Loader2 size={28} className="animate-spin text-indigo-400" />
              <p className="text-sm font-medium">Loading users...</p>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-red-400">
              <AlertCircle size={28} />
              <p className="text-sm font-semibold">Failed to load users</p>
              <p className="text-xs text-gray-400 max-w-xs text-center">{error}</p>
              <button
                onClick={fetchUsers}
                className="mt-2 text-xs font-bold px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Email</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Plan</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">XP</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Streak</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-gray-400">
                        <Users size={32} className="mx-auto mb-3 opacity-30" />
                        No users found.
                      </td>
                    </tr>
                  )}
                  {filtered.map(user => {
                    const isBusy = updating === user.id
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">

                        {/* Email */}
                        <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">{user.email}</td>

                        {/* Plan badge */}
                        <td className="px-4 py-4">
                          {user.plan === 'premium' ? (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                              <Crown size={11} /> Premium
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full">
                              Free
                            </span>
                          )}
                        </td>

                        {/* XP */}
                        <td className="px-4 py-4">
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                            <Zap size={13} className="text-emerald-500" />
                            {(user.xp ?? 0).toLocaleString()}
                          </span>
                        </td>

                        {/* Streak */}
                        <td className="px-4 py-4">
                          <span className={`flex items-center gap-1 font-semibold ${(user.streak ?? 0) > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                            <Flame size={13} />
                            {user.streak ?? 0}d
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            {isBusy ? (
                              <Loader2 size={16} className="animate-spin text-gray-400" />
                            ) : (
                              <>
                                <button
                                  onClick={() => setPlan(user.id, 'premium')}
                                  disabled={user.plan === 'premium'}
                                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  Make Premium
                                </button>
                                <button
                                  onClick={() => setPlan(user.id, 'free')}
                                  disabled={user.plan === 'free'}
                                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  Make Free
                                </button>
                              </>
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
      </main>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl animate-fadeUp ${
          toast.startsWith('Error') ? 'bg-red-600' : 'bg-gray-900'
        }`}>
          {toast}
        </div>
      )}
    </div>
  )
}
