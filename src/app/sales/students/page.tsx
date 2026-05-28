'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Users, Search, Loader2, Shield, ShieldOff,
  Crown, Ban, Check, X, Calendar,
} from 'lucide-react'
import { fetchAllUsers, updateUser, type UserProfile } from '@/lib/users-db'

type PlanFilter = 'all' | 'free' | 'paid' | 'admin' | 'blocked'

export default function AdminUsersPage() {
  const [users, setUsers]         = useState<UserProfile[]>([])
  const [loading, setLoading]     = useState(true)
  const [query, setQuery]         = useState('')
  const [filter, setFilter]       = useState<PlanFilter>('all')
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchAllUsers().then(rows => {
      setUsers(rows)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter(u => {
      if (filter === 'free'    && u.plan !== 'free')  return false
      if (filter === 'paid'    && u.plan !== 'paid')  return false
      if (filter === 'admin'   && !u.is_admin)        return false
      if (filter === 'blocked' && !u.blocked)         return false
      if (!q) return true
      return (
        u.email?.toLowerCase().includes(q) ||
        u.full_name?.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      )
    })
  }, [users, query, filter])

  async function apply(id: string, patch: Partial<UserProfile>) {
    try {
      const updated = await updateUser(id, patch)
      setUsers(u => u.map(x => x.id === id ? updated : x))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'failed')
    }
  }

  const stats = {
    total:   users.length,
    paid:    users.filter(u => u.plan === 'paid').length,
    admin:   users.filter(u => u.is_admin).length,
    blocked: users.filter(u => u.blocked).length,
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-gray-900 font-black text-xl leading-none">Users</h1>
        <p className="text-gray-400 text-xs mt-1">
          {stats.total} total · {stats.paid} paid · {stats.admin} admin · {stats.blocked} blocked
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by email, name, or id…"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-sm font-semibold outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {([
            ['all',     'All'],
            ['paid',    'Paid'],
            ['free',    'Free'],
            ['admin',   'Admin'],
            ['blocked', 'Blocked'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key as PlanFilter)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                filter === key
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700 font-bold">No users match</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-black uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Plan</th>
                <th className="text-left px-4 py-3">Expires</th>
                <th className="text-left px-4 py-3">Flags</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <UserRow
                  key={u.id}
                  user={u}
                  editing={editingId === u.id}
                  onEdit={() => setEditingId(u.id)}
                  onCancel={() => setEditingId(null)}
                  onSave={async (patch) => {
                    await apply(u.id, patch)
                    setEditingId(null)
                  }}
                  onToggleAdmin={() => apply(u.id, { is_admin: !u.is_admin })}
                  onToggleBlock={() => apply(u.id, { blocked: !u.blocked })}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

function UserRow({
  user, editing, onEdit, onCancel, onSave, onToggleAdmin, onToggleBlock,
}: {
  user:            UserProfile
  editing:         boolean
  onEdit:          () => void
  onCancel:        () => void
  onSave:          (patch: Partial<UserProfile>) => Promise<void>
  onToggleAdmin:   () => void
  onToggleBlock:   () => void
}) {
  const [plan, setPlan]       = useState<UserProfile['plan']>(user.plan)
  const [expires, setExpires] = useState(user.plan_expires_at?.slice(0, 10) ?? '')
  const [note, setNote]       = useState(user.plan_note ?? '')

  useEffect(() => {
    if (editing) {
      setPlan(user.plan)
      setExpires(user.plan_expires_at?.slice(0, 10) ?? '')
      setNote(user.plan_note ?? '')
    }
  }, [editing, user])

  const expired = user.plan === 'paid'
    && user.plan_expires_at
    && new Date(user.plan_expires_at) < new Date()

  return (
    <tr className={`border-t border-gray-100 ${user.blocked ? 'bg-red-50/40' : ''}`}>
      <td className="px-4 py-3 align-middle">
        <div className="font-bold text-gray-900 leading-tight">
          {user.full_name || <span className="text-gray-400 font-normal">—</span>}
        </div>
        <div className="text-xs text-gray-500 truncate max-w-[260px]">{user.email || user.id.slice(0, 8)}</div>
      </td>
      <td className="px-4 py-3 align-middle">
        {editing ? (
          <select
            value={plan}
            onChange={e => setPlan(e.target.value as UserProfile['plan'])}
            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold focus:border-indigo-500 outline-none"
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        ) : user.plan === 'paid' ? (
          <span className="inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            <Crown size={10} /> Paid
          </span>
        ) : (
          <span className="text-xs font-bold text-gray-500">Free</span>
        )}
      </td>
      <td className="px-4 py-3 align-middle">
        {editing ? (
          <input
            type="date"
            value={expires}
            onChange={e => setExpires(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold focus:border-indigo-500 outline-none"
          />
        ) : user.plan_expires_at ? (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
            expired ? 'text-red-600' : 'text-gray-600'
          }`}>
            <Calendar size={10} />
            {new Date(user.plan_expires_at).toLocaleDateString('en', { dateStyle: 'medium' })}
            {expired && ' (expired)'}
          </span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )}
      </td>
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-1.5">
          {user.is_admin && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase">
              <Shield size={10} /> Admin
            </span>
          )}
          {user.blocked && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700 uppercase">
              <Ban size={10} /> Blocked
            </span>
          )}
          {!user.is_admin && !user.blocked && (
            <span className="text-gray-300 text-xs">—</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-right align-middle">
        {editing ? (
          <div className="flex items-center justify-end gap-1.5">
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold focus:border-indigo-500 outline-none w-36"
            />
            <button
              onClick={() => onSave({
                plan,
                plan_expires_at: expires ? new Date(expires).toISOString() : null,
                plan_note:       note || null,
              })}
              className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              <Check size={12} /> Save
            </button>
            <button
              onClick={onCancel}
              className="inline-flex items-center text-gray-400 hover:text-gray-700 w-7 h-7 justify-center rounded-lg transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={onEdit}
              title="Set plan"
              className="text-xs font-bold px-2.5 py-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              Set plan
            </button>
            <button
              onClick={onToggleAdmin}
              title={user.is_admin ? 'Revoke admin' : 'Grant admin'}
              className="text-gray-400 hover:text-indigo-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50"
            >
              {user.is_admin ? <ShieldOff size={14} /> : <Shield size={14} />}
            </button>
            <button
              onClick={onToggleBlock}
              title={user.blocked ? 'Unblock' : 'Block'}
              className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors ${
                user.blocked ? 'text-red-600' : 'text-gray-400 hover:text-red-600'
              }`}
            >
              <Ban size={14} />
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}
