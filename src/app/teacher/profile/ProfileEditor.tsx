'use client'

import { useState } from 'react'
import { Loader2, Plus, Trash2, X } from 'lucide-react'
import {
  saveTeacherProfile,
  type Certificate, type ExperienceRow, type TeacherDeclared, type TeacherProfile,
} from '@/lib/teachers'

const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']

/** Everything a teacher declares, in one form. Nothing computed appears here —
 *  student counts, ratings and exam totals come from rows and can't be typed. */
export default function ProfileEditor({
  teacherId, profile, onClose, onSaved,
}: {
  teacherId: string
  profile: TeacherProfile & TeacherDeclared
  onClose: () => void
  onSaved: () => void
}) {
  const [f, setF] = useState({
    display_name:     profile.display_name ?? '',
    tagline:          profile.tagline ?? '',
    headline:         profile.headline ?? '',
    bio:              profile.bio ?? '',
    whatsapp:         profile.whatsapp ?? '',
    english_level:    profile.english_level ?? '',
    years_experience: profile.years_experience?.toString() ?? '',
    age_min:          profile.age_min?.toString() ?? '',
    age_max:          profile.age_max?.toString() ?? '',
  })
  const [levels,      setLevels]      = useState<string[]>(profile.levels ?? [])
  const [specialties, setSpecialties] = useState<string[]>(profile.specialties ?? [])
  const [languages,   setLanguages]   = useState<string[]>(profile.languages ?? [])
  const [competences, setCompetences] = useState<string[]>(profile.competences ?? [])
  const [liked,       setLiked]       = useState<string[]>(profile.liked_qualities ?? [])
  const [teaches,     setTeaches]     = useState<string[]>(profile.teaches ?? [])
  const [notTeaches,  setNotTeaches]  = useState<string[]>(profile.not_teaches ?? [])
  const [certs,       setCerts]       = useState<Certificate[]>(profile.certificates ?? [])
  const [exps,        setExps]        = useState<ExperienceRow[]>(profile.experiences ?? [])

  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(k: keyof typeof f, v: string) { setF(prev => ({ ...prev, [k]: v })) }
  const num = (v: string) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : null }

  async function save() {
    setBusy(true); setError(null)
    const ok = await saveTeacherProfile(teacherId, {
      display_name:     f.display_name.trim() || null,
      tagline:          f.tagline.trim() || null,
      headline:         f.headline.trim() || null,
      bio:              f.bio.trim() || null,
      whatsapp:         f.whatsapp.trim() || null,
      english_level:    f.english_level.trim() || null,
      years_experience: num(f.years_experience),
      age_min:          num(f.age_min),
      age_max:          num(f.age_max),
      levels, specialties, languages,
      competences, liked_qualities: liked,
      teaches, not_teaches: notTeaches,
      certificates: certs.filter(c => c.title.trim()),
      experiences:  exps.filter(e => e.role.trim()),
    })
    setBusy(false)
    if (!ok) { setError('تعذّر الحفظ. حاول مرة أخرى.'); return }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl border border-stone-200 shadow-xl max-h-[92vh] overflow-y-auto">

        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="font-black text-[17px]">تعديل الملف الشخصي</h2>
          <button onClick={onClose} aria-label="إغلاق" className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-6">

          <Group title="التعريف">
            <Field label="الاسم المعروض">
              <input value={f.display_name} onChange={e => set('display_name', e.target.value)} className={inp} />
            </Field>
            <Field label="ما الذي تُتقنه أكثر؟" hint="سطر واحد يظهر تحت اسمك مباشرة">
              <input value={f.tagline} onChange={e => set('tagline', e.target.value)} className={inp}
                     placeholder="المحادثة العملية والنطق للناطقين بالعربية" />
            </Field>
            <Field label="العنوان المهني">
              <input value={f.headline} onChange={e => set('headline', e.target.value)} className={inp} />
            </Field>
            <Field label="نبذة">
              <textarea value={f.bio} onChange={e => set('bio', e.target.value)} rows={6} className={inp} />
            </Field>
          </Group>

          <Group title="اللغة والخبرة">
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="مستواك في الإنجليزية">
                <input value={f.english_level} onChange={e => set('english_level', e.target.value)} className={inp} placeholder="C2 · IELTS 8.0" />
              </Field>
              <Field label="سنوات الخبرة">
                <input type="number" min={0} value={f.years_experience} onChange={e => set('years_experience', e.target.value)} className={inp} />
              </Field>
              <Field label="واتساب">
                <input value={f.whatsapp} onChange={e => set('whatsapp', e.target.value)} dir="ltr" className={`${inp} text-left`} />
              </Field>
            </div>
            <Field label="المستويات التي تُدرّسها">
              <div className="flex flex-wrap gap-2">
                {LEVELS.map(l => (
                  <Toggle key={l} on={levels.includes(l)} onClick={() =>
                    setLevels(v => v.includes(l) ? v.filter(x => x !== l) : [...v, l])}>{l}</Toggle>
                ))}
              </div>
            </Field>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="أصغر سن تُدرّسه">
                <input type="number" min={3} value={f.age_min} onChange={e => set('age_min', e.target.value)} className={inp} />
              </Field>
              <Field label="أكبر سن تُدرّسه">
                <input type="number" min={3} value={f.age_max} onChange={e => set('age_max', e.target.value)} className={inp} />
              </Field>
            </div>
          </Group>

          <Group title="التخصصات والفئات">
            <Tags label="التخصصات"            items={specialties} setItems={setSpecialties} placeholder="محادثة، نطق…" />
            <Tags label="المهارات والكفاءات"   items={competences} setItems={setCompetences} placeholder="تصحيح فوري، بناء الثقة…" />
            <Tags label="اللغات"              items={languages}   setItems={setLanguages}   placeholder="العربية، الفرنسية…" />
            <Tags label="ما تُدرّسه"           items={teaches}     setItems={setTeaches}     placeholder="إنجليزية الأعمال، تحضير الامتحانات…" />
            <Tags label="ما لا تُدرّسه"        items={notTeaches}  setItems={setNotTeaches}  placeholder="الأطفال دون 10، الترجمة الفورية…" />
            <Tags label="ما يحبه الطلاب فيك"   items={liked}       setItems={setLiked}       placeholder="الصبر، الشرح البسيط…" />
          </Group>

          <Group title="الشهادات">
            {certs.map((c, i) => (
              <Row key={i} onRemove={() => setCerts(certs.filter((_, j) => j !== i))}>
                <input value={c.title} onChange={e => setCerts(upd(certs, i, { title: e.target.value }))}
                       className={inp} placeholder="اسم الشهادة" />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input value={c.issuer ?? ''} onChange={e => setCerts(upd(certs, i, { issuer: e.target.value }))}
                         className={inp} placeholder="الجهة المانحة" />
                  <input value={c.year ?? ''} onChange={e => setCerts(upd(certs, i, { year: e.target.value }))}
                         className={inp} placeholder="السنة" />
                </div>
              </Row>
            ))}
            <AddBtn onClick={() => setCerts([...certs, { title: '' }])}>أضف شهادة</AddBtn>
          </Group>

          <Group title="الخبرات">
            {exps.map((e, i) => (
              <Row key={i} onRemove={() => setExps(exps.filter((_, j) => j !== i))}>
                <input value={e.role} onChange={ev => setExps(upd(exps, i, { role: ev.target.value }))}
                       className={inp} placeholder="المسمى (مثلاً: مدرّس إنجليزية)" />
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <input value={e.org ?? ''} onChange={ev => setExps(upd(exps, i, { org: ev.target.value }))}
                         className={inp} placeholder="الجهة" />
                  <input value={e.from ?? ''} onChange={ev => setExps(upd(exps, i, { from: ev.target.value }))}
                         className={inp} placeholder="من" />
                  <input value={e.to ?? ''} onChange={ev => setExps(upd(exps, i, { to: ev.target.value }))}
                         className={inp} placeholder="إلى" />
                </div>
                <textarea value={e.description ?? ''} onChange={ev => setExps(upd(exps, i, { description: ev.target.value }))}
                          rows={2} className={`${inp} mt-2`} placeholder="وصف مختصر (اختياري)" />
              </Row>
            ))}
            <AddBtn onClick={() => setExps([...exps, { role: '' }])}>أضف خبرة</AddBtn>
          </Group>

          {error && <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-[13px] font-bold text-red-700">{error}</div>}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-stone-100 p-4 flex gap-2">
          <button onClick={save} disabled={busy}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 text-white text-sm font-black hover:bg-stone-800 transition disabled:opacity-50">
            {busy && <Loader2 size={16} className="animate-spin" />} حفظ الملف
          </button>
          <button onClick={onClose} className="px-5 py-3 rounded-xl border border-stone-300 text-stone-600 text-sm font-bold hover:bg-stone-50">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Form primitives ─────────────────────────────────── */

const inp =
  'w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-[14px] font-semibold ' +
  'focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition'

function upd<T>(arr: T[], i: number, patch: Partial<T>): T[] {
  return arr.map((x, j) => (j === i ? { ...x, ...patch } : x))
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-[12px] font-black text-stone-400 uppercase tracking-wider">{title}</h3>
      {children}
    </section>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-black text-stone-600 mb-1.5">
        {label}{hint && <span className="text-stone-400 font-semibold"> — {hint}</span>}
      </span>
      {children}
    </label>
  )
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-bold border transition ${
        on ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-300 hover:border-stone-400'}`}>
      {children}
    </button>
  )
}

function Row({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="relative rounded-xl border border-stone-200 p-3 pt-3">
      <button onClick={onRemove} aria-label="حذف"
              className="absolute top-2 left-2 text-stone-300 hover:text-red-500 transition">
        <Trash2 size={14} />
      </button>
      {children}
    </div>
  )
}

function AddBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-stone-300 text-stone-500 text-[13px] font-bold hover:border-stone-500 hover:text-stone-700 transition">
      <Plus size={14} /> {children}
    </button>
  )
}

function Tags({
  label, items, setItems, placeholder,
}: { label: string; items: string[]; setItems: (v: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('')
  function add() {
    const v = input.trim()
    if (!v || items.includes(v)) { setInput(''); return }
    setItems([...items, v]); setInput('')
  }
  return (
    <Field label={label}>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {items.map(i => (
            <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-[12.5px] font-bold">
              {i}
              <button onClick={() => setItems(items.filter(x => x !== i))} aria-label={`حذف ${i}`}
                      className="text-stone-400 hover:text-red-500"><X size={12} /></button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
               onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
               className={inp} placeholder={placeholder} />
        <button onClick={add} className="px-3.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 transition" aria-label="إضافة">
          <Plus size={16} />
        </button>
      </div>
    </Field>
  )
}
