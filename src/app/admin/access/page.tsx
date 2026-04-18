'use client'

import { useState, useEffect } from 'react'
import {
  Lock, Unlock, CreditCard, Loader2, AlertCircle, RefreshCw,
  Globe, Map as MapIcon, BookOpen,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Feature = {
  slug:          string
  label_ar:      string
  category:      string
  requires_auth: boolean
  requires_paid: boolean
  sort_order:    number
}

type LockMode = 'free' | 'auth' | 'paid'

const CATEGORIES: { key: string; label: string; icon: React.ElementType }[] = [
  { key: 'pages',   label: 'Pages',      icon: Globe },
  { key: 'cities',  label: 'Map Cities', icon: MapIcon },
  { key: 'courses', label: 'Courses',    icon: BookOpen },
]

function modeOf(f: Feature): LockMode {
  if (f.requires_paid) return 'paid'
  if (f.requires_auth) return 'auth'
  return 'free'
}

function flagsOf(mode: LockMode): { requires_auth: boolean; requires_paid: boolean } {
  if (mode === 'paid') return { requires_auth: true,  requires_paid: true  }
  if (mode === 'auth') return { requires_auth: true,  requires_paid: false }
  return                       { requires_auth: false, requires_paid: false }
}

export default function AccessPage() {
  const [rows, setRows]         = useState<Feature[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [toast, setToast]       = useState<string | null>(null)

  async function fetchAll() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('feature_access')
      .select('slug, label_ar, category, requires_auth, requires_paid, sort_order')
      .order('sort_order')

    if (error) setError(error.message)
    else       setRows((data ?? []) as Feature[])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  async function setMode(f: Feature, mode: LockMode) {
    setUpdating(f.slug)
    const flags = flagsOf(mode)
    const { error } = await supabase
      .from('feature_access')
      .update(flags)
      .eq('slug', f.slug)

    if (error) {
      showToast('Error: ' + error.message)
    } else {
      setRows(prev => prev.map(r => r.slug === f.slug ? { ...r, ...flags } : r))
      showToast(`${f.label_ar}: ${labelOf(mode)}`)
    }
    setUpdating(null)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  function labelOf(mode: LockMode) {
    return mode === 'paid' ? 'Paid' : mode === 'auth' ? 'Login required' : 'Free'
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 font-black text-xl leading-none">Feature Access</h1>
          <p className="text-gray-400 text-xs mt-1">Control which features require login or payment</p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-40"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 size={28} className="animate-spin text-indigo-400" />
          <p className="text-sm font-medium">Loading features...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-white rounded-2xl border border-red-200 p-6 flex flex-col items-center gap-3 text-red-500">
          <AlertCircle size={28} />
          <p className="text-sm font-semibold">Failed to load features</p>
          <p className="text-xs text-gray-500 max-w-sm text-center">{error}</p>
          <button
            onClick={fetchAll}
            className="mt-2 text-xs font-bold px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm text-amber-800">
          <p className="font-bold mb-1">No features found.</p>
          <p>Run the seed migration <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">003_feature_access_seed.sql</code> in the Supabase SQL editor.</p>
        </div>
      )}

      {!loading && !error && rows.length > 0 && CATEGORIES.map(({ key, label, icon: Icon }) => {
        const items = rows.filter(r => r.category === key)
        if (items.length === 0) return null
        return (
          <section key={key} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Icon size={18} className="text-gray-500" />
              <h2 className="font-bold text-gray-800">{label}</h2>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">
                {items.length}
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {items.map(f => {
                const mode  = modeOf(f)
                const isBusy = updating === f.slug
                return (
                  <div key={f.slug} className="px-6 py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-900 font-semibold text-sm" dir="rtl">{f.label_ar}</p>
                      <p className="text-gray-400 text-xs font-mono">{f.slug}</p>
                    </div>

                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                      <ModeButton
                        active={mode === 'free'}
                        onClick={() => setMode(f, 'free')}
                        disabled={isBusy}
                        icon={<Unlock size={12} />}
                        label="Free"
                        activeColor="bg-emerald-500 text-white"
                      />
                      <ModeButton
                        active={mode === 'auth'}
                        onClick={() => setMode(f, 'auth')}
                        disabled={isBusy}
                        icon={<Lock size={12} />}
                        label="Login"
                        activeColor="bg-indigo-500 text-white"
                      />
                      <ModeButton
                        active={mode === 'paid'}
                        onClick={() => setMode(f, 'paid')}
                        disabled={isBusy}
                        icon={<CreditCard size={12} />}
                        label="Paid"
                        activeColor="bg-amber-500 text-white"
                      />
                      {isBusy && <Loader2 size={14} className="animate-spin text-gray-400 ml-1" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

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

function ModeButton({ active, onClick, disabled, icon, label, activeColor }: {
  active: boolean; onClick: () => void; disabled: boolean
  icon: React.ReactNode; label: string; activeColor: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || active}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
        active ? activeColor + ' shadow-sm' : 'text-gray-500 hover:text-gray-800'
      } disabled:cursor-default`}
    >
      {icon}
      {label}
    </button>
  )
}
