'use client'

import { useEffect, useState } from 'react'
import { X, Loader2, Save, Mail, Shield, Clock, CalendarDays, LogOut, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Props {
  open:      boolean
  onClose:   () => void
  email?:    string | null
  roleLabel: string
  onSignOut?: () => void
}

const fmtDateTime = (s?: string | null) =>
  s ? new Date(s).toLocaleString('ar-MA', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

export default function ProfileModal({ open, onClose, email, roleLabel, onSignOut }: Props) {
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone]       = useState('')
  const [lastSignIn, setLastSignIn] = useState<string | null>(null)
  const [createdAt, setCreatedAt]   = useState<string | null>(null)
  const [userId, setUserId]     = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true); setSaved(false)
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setLastSignIn(user?.last_sign_in_at ?? null)
      setCreatedAt(user?.created_at ?? null)
      setUserId(user?.id ?? null)
      if (user?.id) {
        const { data } = await supabase.from('profiles').select('full_name, phone').eq('id', user.id).maybeSingle()
        setFullName((data as any)?.full_name ?? '')
        setPhone((data as any)?.phone ?? '')
      }
      setLoading(false)
    })()
  }, [open])

  async function save() {
    if (!userId) return
    setSaving(true)
    await supabase.from('profiles').update({ full_name: fullName || null, phone: phone || null }).eq('id', userId)
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 1500)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-0 sm:p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="bg-zinc-900 px-5 py-5 flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-yellow-400 text-black flex items-center justify-center font-black text-2xl">
            {(email?.[0] ?? '?').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-black text-[16px] truncate">{fullName || email?.split('@')[0]}</div>
            <div className="text-zinc-400 text-[12px]">{roleLabel}</div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1"><X size={20} /></button>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 size={24} className="animate-spin text-zinc-300" /></div>
        ) : (
          <div className="p-5 space-y-5 overflow-y-auto">
            {/* Read-only info */}
            <div className="space-y-2">
              <InfoRow icon={Mail}        label="البريد الإلكتروني" value={email ?? '—'} ltr />
              <InfoRow icon={Shield}      label="الدور"            value={roleLabel} />
              <InfoRow icon={Clock}       label="آخر تسجيل دخول"   value={fmtDateTime(lastSignIn)} />
              <InfoRow icon={CalendarDays} label="عضو منذ"         value={fmtDateTime(createdAt)} />
            </div>

            {/* Editable */}
            <div className="space-y-3 pt-2 border-t border-zinc-100">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">معلومات قابلة للتعديل</div>
              <div>
                <label className="text-[12px] font-semibold text-zinc-600">الاسم الكامل</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="اسمك"
                  className="w-full mt-1 border border-zinc-200 rounded-xl px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-zinc-600">رقم الهاتف</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+212 ..." dir="ltr"
                  className="w-full mt-1 border border-zinc-200 rounded-xl px-3 py-2.5 text-[14px] text-right focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <button onClick={save} disabled={saving}
                className="w-full py-2.5 rounded-xl bg-black text-white font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50">
                {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <><Check size={15} /> تم الحفظ</> : <><Save size={15} /> حفظ التغييرات</>}
              </button>
            </div>

            {onSignOut && (
              <button onClick={onSignOut}
                className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 font-semibold text-[13px] flex items-center justify-center gap-2 hover:bg-red-50">
                <LogOut size={15} /> تسجيل الخروج
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, ltr }: { icon: any; label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="flex items-center gap-2 text-[13px] text-zinc-400"><Icon size={15} className="text-zinc-300" /> {label}</span>
      <span className="text-[13px] font-semibold text-zinc-800 truncate" dir={ltr ? 'ltr' : undefined}>{value}</span>
    </div>
  )
}
