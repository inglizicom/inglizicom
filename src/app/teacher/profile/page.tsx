'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Camera, Check, Loader2, MessageSquareQuote, Pencil, Plus, X,
  Users, CalendarDays, Clock, TrendingUp,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import {
  fetchMyReviews, fetchMyStudents, fetchTeacherOverview, saveTeacherProfile,
  uploadTeacherAvatar,
  type MyStudent, type TeacherOverview, type TeacherReview,
} from '@/lib/teachers'
import { Card, Empty, SectionTitle, Stars } from '../_ui'

const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1']

/** The teacher's public face: the card a student would judge them by, plus the
 *  reviews those students left. Editing happens in place — no separate screen. */
export default function TeacherProfilePage() {
  const teacher = useTeacher()
  const p       = teacher.profile

  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState(p?.display_name ?? '')
  const [headline,    setHeadline]    = useState(p?.headline ?? '')
  const [bio,         setBio]         = useState(p?.bio ?? '')
  const [whatsapp,    setWhatsapp]    = useState(p?.whatsapp ?? '')
  const [levels,      setLevels]      = useState<string[]>(p?.levels ?? [])
  const [specialties, setSpecialties] = useState<string[]>(p?.specialties ?? [])
  const [languages,   setLanguages]   = useState<string[]>(p?.languages ?? [])
  const [specInput,   setSpecInput]   = useState('')
  const [langInput,   setLangInput]   = useState('')

  const [reviews,  setReviews]  = useState<TeacherReview[]>([])
  const [students, setStudents] = useState<MyStudent[]>([])
  const [ov,       setOv]       = useState<TeacherOverview | null>(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [r, s, o] = await Promise.all([
        fetchMyReviews(teacher.id), fetchMyStudents(), fetchTeacherOverview(),
      ])
      if (!alive) return
      setReviews(r); setStudents(s); setOv(o); setLoading(false)
    })()
    return () => { alive = false }
  }, [teacher.id])

  // Re-seed the form whenever the stored profile changes under us.
  useEffect(() => {
    if (!p || editing) return
    setDisplayName(p.display_name ?? ''); setHeadline(p.headline ?? '')
    setBio(p.bio ?? ''); setWhatsapp(p.whatsapp ?? '')
    setLevels(p.levels ?? []); setSpecialties(p.specialties ?? []); setLanguages(p.languages ?? [])
  }, [p, editing])

  const nameOf = useMemo(() => {
    const map = new Map(students.map(s => [s.id, s.full_name]))
    return (id: string) => map.get(id) ?? 'طالب'
  }, [students])

  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]   // index 0 = 1 star
    reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1] += 1 })
    return counts
  }, [reviews])

  async function save() {
    setSaving(true)
    const ok = await saveTeacherProfile(teacher.id, {
      display_name: displayName.trim() || null,
      headline:     headline.trim() || null,
      bio:          bio.trim() || null,
      whatsapp:     whatsapp.trim() || null,
      levels, specialties, languages,
    })
    setSaving(false)
    if (ok) { await teacher.refresh(); setEditing(false) }
  }

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    await uploadTeacherAvatar(teacher.id, file)
    await teacher.refresh()
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const shown   = p?.display_name || teacher.fullName || teacher.email || 'أستاذ'
  const rating  = p?.rating_avg ?? 0
  const count   = p?.rating_count ?? 0

  return (
    <div className="space-y-7">

      {/* ── Tutor card ───────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-l from-amber-200 via-amber-100 to-stone-100" />
        <div className="px-5 sm:px-7 pb-6 -mt-12">
          <div className="flex flex-wrap items-end gap-5">

            <div className="relative">
              {p?.avatar_url
                ? /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={p.avatar_url} alt="" className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-sm" />
                : <div className="w-24 h-24 rounded-2xl bg-stone-900 text-amber-400 border-4 border-white shadow-sm flex items-center justify-center text-3xl font-black">
                    {shown.trim().charAt(0)}
                  </div>}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center shadow hover:bg-stone-700 transition"
                aria-label="تغيير الصورة"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatar} />
            </div>

            <div className="flex-1 min-w-[14rem] pb-1">
              <h1 className="text-[24px] font-black tracking-tight">{shown}</h1>
              <p className="text-stone-500 text-[14px] font-semibold">
                {p?.headline || 'أضف عنواناً مهنياً — مثلاً: محادثة وتحضير IELTS · 5 سنوات خبرة'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Stars value={rating} />
                <span className="text-[13px] font-black tabular-nums">{count ? Number(rating).toFixed(1) : '—'}</span>
                <span className="text-[12.5px] text-stone-400 font-semibold">
                  {count ? `(${count} تقييم)` : 'لا تقييمات بعد'}
                </span>
              </div>
            </div>

            <button
              onClick={() => (editing ? save() : setEditing(true))}
              disabled={saving}
              className="mb-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-[13px] font-bold hover:bg-stone-800 transition disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : editing ? <Check size={15} /> : <Pencil size={15} />}
              {editing ? 'حفظ' : 'تعديل الملف'}
            </button>
          </div>
        </div>
      </Card>

      {/* ── Numbers ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Users,        label: 'طلابي',          value: ov?.students_total ?? 0 },
          { icon: CalendarDays, label: 'حصص هذا الشهر',  value: ov?.classes_month ?? 0 },
          { icon: Clock,        label: 'ساعات التدريس',  value: ov?.hours_month ?? 0 },
          { icon: TrendingUp,   label: 'نسبة الحضور',    value: ov?.attendance_rate != null ? `${ov.attendance_rate}%` : '—' },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-2 text-stone-400 mb-1">
              <s.icon size={15} />
              <span className="text-[11.5px] font-bold">{s.label}</span>
            </div>
            <div className="text-[24px] font-black tabular-nums leading-none">{s.value}</div>
          </Card>
        ))}
      </div>

      {/* ── Details ──────────────────────────────────── */}
      <Card className="p-5 sm:p-6 space-y-5">
        <SectionTitle>عن الأستاذ</SectionTitle>

        {editing ? (
          <div className="space-y-4">
            <Field label="الاسم المعروض">
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} className={inputCls} placeholder="حمزة القصراوي" />
            </Field>
            <Field label="العنوان المهني">
              <input value={headline} onChange={e => setHeadline(e.target.value)} className={inputCls} placeholder="محادثة وتحضير IELTS · 5 سنوات خبرة" />
            </Field>
            <Field label="نبذة">
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} className={inputCls} placeholder="كيف تُدرّس، ولمن، وما الذي يميّز حصصك…" />
            </Field>
            <Field label="واتساب">
              <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} dir="ltr" className={`${inputCls} text-left`} placeholder="+2126…" />
            </Field>

            <Field label="المستويات التي تُدرّسها">
              <div className="flex flex-wrap gap-2">
                {LEVELS.map(l => {
                  const on = levels.includes(l)
                  return (
                    <button
                      key={l}
                      onClick={() => setLevels(v => on ? v.filter(x => x !== l) : [...v, l])}
                      className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-bold border transition ${
                        on ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-300 hover:border-stone-400'}`}
                    >
                      {l}
                    </button>
                  )
                })}
              </div>
            </Field>

            <TagField label="التخصصات" items={specialties} setItems={setSpecialties}
                      input={specInput} setInput={setSpecInput} placeholder="محادثة، نطق، إنجليزية الأعمال…" />
            <TagField label="اللغات" items={languages} setItems={setLanguages}
                      input={langInput} setInput={setLangInput} placeholder="العربية، الفرنسية…" />

            <button onClick={() => setEditing(false)} className="text-[13px] font-bold text-stone-500 hover:text-stone-700">
              إلغاء
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[14.5px] leading-relaxed text-stone-600 whitespace-pre-wrap">
              {p?.bio || 'لا نبذة بعد — اضغط «تعديل الملف» لكتابة تعريف بك يراه الطلاب.'}
            </p>
            <ChipRow label="المستويات"  items={p?.levels ?? []} />
            <ChipRow label="التخصصات"  items={p?.specialties ?? []} />
            <ChipRow label="اللغات"    items={p?.languages ?? []} />
          </div>
        )}
      </Card>

      {/* ── Reviews ──────────────────────────────────── */}
      <div id="reviews">
        <SectionTitle>آراء الطلاب</SectionTitle>

        <Card className="p-5 sm:p-6">
          {loading ? (
            <div className="py-10 flex justify-center text-stone-400"><Loader2 size={18} className="animate-spin" /></div>
          ) : reviews.length === 0 ? (
            <Empty
              icon={MessageSquareQuote}
              title="لا تقييمات بعد"
              hint="يظهر هنا رأي كل طالب بعد أن يقيّمك من فضائه الخاص."
            />
          ) : (
            <div className="space-y-6">
              {/* Distribution */}
              <div className="flex flex-wrap gap-6 items-center pb-5 border-b border-stone-100">
                <div className="text-center">
                  <div className="text-[40px] font-black leading-none tabular-nums">{Number(rating).toFixed(1)}</div>
                  <Stars value={rating} size={15} />
                  <div className="text-[12px] text-stone-400 font-semibold mt-1">{count} تقييم</div>
                </div>
                <div className="flex-1 min-w-[12rem] space-y-1.5">
                  {[5, 4, 3, 2, 1].map(star => {
                    const n   = distribution[star - 1]
                    const pct = count ? Math.round((n / count) * 100) : 0
                    return (
                      <div key={star} className="flex items-center gap-2.5">
                        <span className="text-[11.5px] font-bold text-stone-400 w-3 tabular-nums">{star}</span>
                        <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11.5px] font-bold text-stone-400 w-8 tabular-nums text-left">{n}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* The reviews themselves */}
              <div className="divide-y divide-stone-100">
                {reviews.map(r => (
                  <div key={r.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center font-black text-[13px]">
                          {nameOf(r.student_id).trim().charAt(0)}
                        </div>
                        <span className="font-bold text-[14px]">{nameOf(r.student_id)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Stars value={r.rating} size={13} />
                        <span className="text-[11.5px] text-stone-400 font-semibold">
                          {new Date(r.created_at).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-[14px] text-stone-600 leading-relaxed pr-10">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

/* ── Small form pieces ───────────────────────────────── */

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-[14px] font-semibold ' +
  'focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-black text-stone-500 mb-1.5">{label}</span>
      {children}
    </label>
  )
}

function ChipRow({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[12px] font-black text-stone-400 ml-1">{label}</span>
      {items.map(i => (
        <span key={i} className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-[12.5px] font-bold">{i}</span>
      ))}
    </div>
  )
}

function TagField({
  label, items, setItems, input, setInput, placeholder,
}: {
  label: string; items: string[]; setItems: (v: string[]) => void
  input: string; setInput: (v: string) => void; placeholder: string
}) {
  function add() {
    const v = input.trim()
    if (!v || items.includes(v)) { setInput(''); return }
    setItems([...items, v]); setInput('')
  }
  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map(i => (
          <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-[12.5px] font-bold">
            {i}
            <button onClick={() => setItems(items.filter(x => x !== i))} aria-label={`حذف ${i}`} className="text-stone-400 hover:text-red-500">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          className={inputCls}
          placeholder={placeholder}
        />
        <button onClick={add} className="px-3.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 transition" aria-label="إضافة">
          <Plus size={16} />
        </button>
      </div>
    </Field>
  )
}
