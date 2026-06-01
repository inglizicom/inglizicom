'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Settings as SettingsIcon, Loader2, Crown, UserCheck, UserMinus,
  Search, Plus, RotateCcw, ShieldAlert, X, Mail, Lock, User as UserIcon,
  Eye, EyeOff, Copy, Check,
} from 'lucide-react'
import {
  fetchStaff, searchProfiles, setProfileRole, createAssistant,
  ROLE_BADGE, type StaffRow, type StaffRole,
} from '@/lib/staff-db'
import { logActivity } from '@/lib/activity-log-db'
import { useStaff } from '@/lib/staff-context'

/**
 * Settings — founder-only management of who is staff.
 *
 * Sections:
 *   1. Current staff list (founders + assistants)
 *   2. Promote-a-user search (any signed-up profile can be promoted)
 *   3. Personal info card (the current user)
 */
export default function SettingsPage() {
  const me = useStaff()
  const isFounder = me.role === 'founder'

  const [rows, setRows]         = useState<StaffRow[] | null>(null)
  const [loading, setLoading]   = useState(true)
  const [savingId, setSaving]   = useState<string | null>(null)
  const [showAdd, setShowAdd]   = useState(false)

  async function load() {
    setLoading(true)
    setRows(await fetchStaff())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function changeRole(row: StaffRow, role: StaffRole) {
    if (!isFounder) return
    if (row.id === me.id && role !== 'founder') {
      if (!confirm('Demote yourself? You will lose founder privileges.')) return
    }
    setSaving(row.id)
    try {
      await setProfileRole(row.id, role)
      await logActivity({
        action:     'profile_role_changed',
        entityType: 'profile',
        entityId:   row.id,
        before:     { role: row.role },
        after:      { role },
        metadata:   { email: row.email },
      })
      await load()
    } catch (err: any) {
      alert('Could not update: ' + (err?.message ?? 'unknown'))
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] uppercase font-bold tracking-[0.18em] text-gray-400 mb-1">Admin</div>
          <h1 className="text-[24px] font-black tracking-tight text-gray-900 flex items-center gap-2">
            <SettingsIcon size={20} className="text-gray-700" /> Settings
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage staff access, your profile, and CRM defaults.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50"
          >
            <RotateCcw size={14} />
          </button>
          {isFounder && (
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-zinc-800"
            >
              <Plus size={14} /> Add assistant
            </button>
          )}
        </div>
      </header>

      {/* Personal card */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 text-black flex items-center justify-center font-black text-lg">
            {(me.email?.[0] ?? '?').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-900 text-sm truncate">{me.email}</div>
            <div className="text-xs text-gray-500 mt-0.5">Your account</div>
          </div>
          <RoleBadge role={me.role} />
        </div>
      </section>

      {/* Staff list */}
      <section className="bg-white border border-gray-200 rounded-2xl">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 text-base">Staff</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Anyone listed here can sign in to the CRM at /admin.
            </p>
          </div>
          {!isFounder && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-100 border border-gray-200 rounded px-2 py-1">
              <ShieldAlert size={11} /> View-only — only founders edit roles
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center text-gray-400">
            <Loader2 size={18} className="animate-spin" />
          </div>
        ) : (rows ?? []).length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No staff yet. Founder accounts (any profile with is_admin=true) are auto-listed.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {(rows ?? []).map(row => (
              <StaffRowItem
                key={row.id}
                row={row}
                isMe={row.id === me.id}
                canEdit={isFounder}
                saving={savingId === row.id}
                onPromote={() => changeRole(row, 'founder')}
                onDemote={() => changeRole(row, 'assistant')}
                onRemove={() => changeRole(row, 'student')}
              />
            ))}
          </div>
        )}
      </section>

      {/* Add-assistant modal (create new OR promote existing) */}
      {showAdd && isFounder && (
        <AddAssistantModal
          onClose={() => setShowAdd(false)}
          onDone={async () => { await load() }}
        />
      )}
    </div>
  )
}

/* ───────────── row ───────────── */

function StaffRowItem({
  row, isMe, canEdit, saving, onPromote, onDemote, onRemove,
}: {
  row:       StaffRow
  isMe:      boolean
  canEdit:   boolean
  saving:    boolean
  onPromote: () => void
  onDemote:  () => void
  onRemove:  () => void
}) {
  const display = row.full_name || row.email || row.id.slice(0, 8)
  return (
    <div className="px-5 py-3.5 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-black text-sm">
        {(row.email?.[0] ?? '?').toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 text-sm truncate flex items-center gap-1.5">
          {display}
          {isMe && <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">· you</span>}
        </div>
        {row.email && row.email !== display && (
          <div className="text-[11px] text-gray-400 truncate">{row.email}</div>
        )}
      </div>
      <RoleBadge role={row.role} />
      {canEdit && (
        <div className="flex items-center gap-1.5">
          {row.role === 'assistant' && (
            <button
              onClick={onPromote}
              disabled={saving}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-yellow-400 text-black text-[12px] font-bold hover:bg-yellow-500 disabled:opacity-50"
              title="Promote to founder"
            >
              <Crown size={11} /> Promote
            </button>
          )}
          {row.role === 'founder' && (
            <button
              onClick={onDemote}
              disabled={saving}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-[12px] font-bold hover:bg-gray-50 disabled:opacity-50"
              title="Demote to assistant"
            >
              <UserCheck size={11} /> Make assistant
            </button>
          )}
          <button
            onClick={onRemove}
            disabled={saving}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-red-600 text-[12px] font-bold hover:bg-red-50 hover:border-red-200 disabled:opacity-50"
            title="Remove from staff"
          >
            {saving ? <Loader2 size={11} className="animate-spin" /> : <UserMinus size={11} />}
            Remove
          </button>
        </div>
      )}
    </div>
  )
}

function RoleBadge({ role }: { role: StaffRole }) {
  const label = role === 'founder' ? 'Founder' : role === 'assistant' ? 'Assistant' : 'Member'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${ROLE_BADGE[role]}`}>
      {role === 'founder' && <Crown size={10} />}
      {label}
    </span>
  )
}

/* ───────────── add-assistant modal ───────────── */

type AddTab = 'create' | 'promote'

function AddAssistantModal({ onClose, onDone }: { onClose: () => void; onDone: () => Promise<void> }) {
  const [tab, setTab] = useState<AddTab>('create')

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
          <header className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Add assistant</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
          </header>

          {/* Tabs */}
          <div className="px-5 pt-4">
            <div className="inline-flex rounded-lg bg-gray-100 p-0.5 text-[12px] font-bold">
              <button
                onClick={() => setTab('create')}
                className={`px-3 py-1.5 rounded-md transition ${tab === 'create' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Create new
              </button>
              <button
                onClick={() => setTab('promote')}
                className={`px-3 py-1.5 rounded-md transition ${tab === 'promote' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Promote existing
              </button>
            </div>
          </div>

          {tab === 'create'
            ? <CreatePanel onDone={onDone} onClose={onClose} />
            : <PromotePanel onDone={onDone} />}
        </div>
      </div>
    </>
  )
}

/* Create a brand-new assistant with email + password. */
function CreatePanel({ onDone, onClose }: { onDone: () => Promise<void>; onClose: () => void }) {
  const [email, setEmail]       = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [busy, setBusy]         = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [done, setDone]         = useState(false)
  const [copied, setCopied]     = useState(false)

  function genPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
    let out = ''
    const arr = new Uint32Array(14)
    crypto.getRandomValues(arr)
    for (const n of arr) out += chars[n % chars.length]
    setPassword(out)
    setShowPw(true)
  }

  async function submit() {
    setError(null)
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setError('Enter a valid email address.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setBusy(true)
    try {
      const { id } = await createAssistant(email.trim(), password, fullName.trim() || undefined)
      await logActivity({
        action:     'profile_role_changed',
        entityType: 'profile',
        entityId:   id,
        before:     { role: 'student' },
        after:      { role: 'assistant' },
        metadata:   { email: email.trim(), created: true },
      })
      await onDone()
      setDone(true)
    } catch (err: any) {
      setError(err?.message ?? 'Could not create assistant.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="p-5">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm">
          <div className="font-bold text-green-800 flex items-center gap-1.5 mb-2">
            <Check size={15} /> Assistant created
          </div>
          <p className="text-green-700 mb-3">
            They can sign in right away at the CRM login with these credentials. Share them securely —
            the password is shown only now.
          </p>
          <div className="bg-white border border-green-200 rounded-lg p-3 font-mono text-[12px] text-gray-800 space-y-1">
            <div><span className="text-gray-400">email:</span> {email.trim()}</div>
            <div className="flex items-center gap-2">
              <span><span className="text-gray-400">password:</span> {password}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(`${email.trim()} / ${password}`); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
                className="text-gray-400 hover:text-gray-700"
                title="Copy email + password"
              >
                {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800">
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5">
      <p className="text-sm text-gray-500 mb-4">
        Provision an account with a custom email and password — no sign-up needed on their end.
        Assistants get leads, payments, support, and renewals, but not founder-only sections.
      </p>

      <label className="block text-[12px] font-bold text-gray-700 mb-1">Full name <span className="text-gray-400 font-normal">(optional)</span></label>
      <div className="relative mb-3">
        <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Fatima Ezzahra"
          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        />
      </div>

      <label className="block text-[12px] font-bold text-gray-700 mb-1">Email</label>
      <div className="relative mb-3">
        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          autoFocus
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="assistant@example.com"
          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        />
      </div>

      <div className="flex items-center justify-between mb-1">
        <label className="block text-[12px] font-bold text-gray-700">Password</label>
        <button onClick={genPassword} className="text-[11px] font-bold text-blue-600 hover:text-blue-700">Generate</button>
      </div>
      <div className="relative mb-1">
        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={showPw ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-white border border-gray-200 text-sm font-mono focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        />
        <button
          onClick={() => setShowPw(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          tabIndex={-1}
        >
          {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>

      {error && <div className="mt-3 text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Create assistant
        </button>
      </div>
    </div>
  )
}

/* Promote an already signed-up user (the original flow). */
function PromotePanel({ onDone }: { onDone: () => Promise<void> }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<StaffRow[] | null>(null)
  const [searching, setSearch]= useState(false)
  const [savingId, setSaving] = useState<string | null>(null)

  useEffect(() => {
    const id = window.setTimeout(async () => {
      if (!query.trim()) { setResults(null); return }
      setSearch(true)
      try { setResults(await searchProfiles(query)) }
      finally { setSearch(false) }
    }, 250)
    return () => window.clearTimeout(id)
  }, [query])

  async function promote(row: StaffRow) {
    setSaving(row.id)
    try {
      await setProfileRole(row.id, 'assistant')
      await logActivity({
        action:     'profile_role_changed',
        entityType: 'profile',
        entityId:   row.id,
        before:     { role: row.role },
        after:      { role: 'assistant' },
        metadata:   { email: row.email },
      })
      await onDone()
    } catch (err: any) {
      alert('Could not promote: ' + (err?.message ?? 'unknown'))
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="p-5">
      <p className="text-sm text-gray-500 mb-3">
        Search a user who already signed up, then promote them to assistant.
      </p>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          autoFocus
          placeholder="email@example.com"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        />
      </div>

      <div className="mt-3 max-h-72 overflow-y-auto -mx-1">
        {searching && (
          <div className="py-6 flex items-center justify-center text-gray-400">
            <Loader2 size={16} className="animate-spin" />
          </div>
        )}
        {!searching && results && results.length === 0 && (
          <div className="py-6 text-center text-xs text-gray-400">No profiles match &quot;{query}&quot;.</div>
        )}
        {!searching && (results ?? []).map(row => (
          <div key={row.id} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-[12px] font-black">
              {(row.email?.[0] ?? '?').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-gray-900 truncate">{row.email}</div>
              <div className="text-[11px] text-gray-400 truncate">{row.full_name ?? '—'}</div>
            </div>
            <RoleBadge role={row.role} />
            {row.role !== 'founder' && row.role !== 'assistant' && (
              <button
                onClick={() => promote(row)}
                disabled={savingId === row.id}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-yellow-400 text-black text-[11px] font-bold hover:bg-yellow-500 disabled:opacity-50"
              >
                {savingId === row.id ? <Loader2 size={11} className="animate-spin" /> : 'Promote'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
