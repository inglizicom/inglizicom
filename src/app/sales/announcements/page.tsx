'use client'

import { useEffect, useState } from 'react'
import { Megaphone, Plus, Trash2, Loader2, Search, X, Users, BookOpen, User, Eye, EyeOff } from 'lucide-react'
import { useStaff } from '@/lib/staff-context'
import { fetchCourses, type LmsCourse } from '@/lib/lms'
import {
  fetchAnnouncements, createAnnouncement, deleteAnnouncement, toggleAnnouncement, searchStudents,
  type Announcement, type AnnType, type AnnSeverity, type AnnAudience, type StudentLite,
} from '@/lib/announcements'

const INP = 'w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400'
const SEV_AR: Record<AnnSeverity, { label: string; cls: string }> = {
  info: { label: 'خبر', cls: 'bg-blue-50 text-blue-700' },
  update: { label: 'تحديث', cls: 'bg-violet-50 text-violet-700' },
  maintenance: { label: 'صيانة', cls: 'bg-amber-50 text-amber-700' },
}
const AUD_AR: Record<AnnAudience, string> = { all: 'كل الطلاب', course: 'دورة محددة', students: 'طلاب محددون' }

export default function AnnouncementsPage() {
  const staff = useStaff()
  const [list, setList] = useState<Announcement[]>([])
  const [courses, setCourses] = useState<LmsCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)

  // form
  const [title, setTitle] = useState(''); const [body, setBody] = useState('')
  const [type, setType] = useState<AnnType>('banner'); const [severity, setSeverity] = useState<AnnSeverity>('info')
  const [audience, setAudience] = useState<AnnAudience>('all'); const [courseId, setCourseId] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [picked, setPicked] = useState<StudentLite[]>([])
  const [q, setQ] = useState(''); const [results, setResults] = useState<StudentLite[]>([]); const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)

  async function load() { setLoading(true); setList(await fetchAnnouncements()); setLoading(false) }
  useEffect(() => { load(); fetchCourses().then(setCourses) }, [])

  useEffect(() => {
    if (audience !== 'students' || q.trim().length < 2) { setResults([]); return }
    let alive = true; setSearching(true)
    const t = setTimeout(async () => { const r = await searchStudents(q); if (alive) { setResults(r); setSearching(false) } }, 350)
    return () => { alive = false; clearTimeout(t) }
  }, [q, audience])

  function addStudent(s: StudentLite) { if (!picked.find(p => p.id === s.id)) setPicked([...picked, s]); setQ(''); setResults([]) }
  function resetForm() { setTitle(''); setBody(''); setType('banner'); setSeverity('info'); setAudience('all'); setCourseId(''); setEndsAt(''); setPicked([]); setQ('') }

  async function create() {
    if (!title.trim()) return
    if (audience === 'course' && !courseId) { alert('اختر الدورة'); return }
    if (audience === 'students' && picked.length === 0) { alert('اختر طالبًا واحدًا على الأقل'); return }
    setSaving(true)
    await createAnnouncement({
      title: title.trim(), body: body.trim() || undefined, type, severity, audience,
      courseId: audience === 'course' ? courseId : null, endsAt: endsAt || null,
      studentIds: audience === 'students' ? picked.map(p => p.id) : undefined, createdBy: staff.id,
    })
    setSaving(false); resetForm(); setShowNew(false); load()
  }
  async function remove(id: string) { if (confirm('حذف الإعلان؟')) { await deleteAnnouncement(id); load() } }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center"><Megaphone size={20} className="text-rose-600" /></div>
          <div>
            <h2 className="text-[17px] font-black text-zinc-900">الإعلانات والأخبار</h2>
            <p className="text-[12px] text-zinc-400">أخبر الطلاب بالجديد، الصيانة، التحديثات — كنافذة منبثقة أو شريط متحرك</p>
          </div>
        </div>
        <button onClick={() => setShowNew(v => !v)} className="flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 bg-yellow-400 text-black rounded-xl hover:bg-yellow-300"><Plus size={14} /> إعلان جديد</button>
      </div>

      {showNew && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان الإعلان *" className={INP} />
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={3} placeholder="نص الإعلان (اختياري)" className={INP + ' resize-y'} />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[11px] font-bold text-zinc-500 mb-1">طريقة العرض</div>
              <div className="flex gap-1.5">
                {(['banner', 'popup'] as AnnType[]).map(t => (
                  <button key={t} onClick={() => setType(t)} className={`flex-1 py-2 rounded-lg text-[12px] font-bold ${type === t ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>{t === 'banner' ? 'شريط متحرك' : 'نافذة منبثقة'}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-zinc-500 mb-1">النوع</div>
              <select value={severity} onChange={e => setSeverity(e.target.value as AnnSeverity)} className={INP}>
                <option value="info">خبر</option><option value="update">تحديث</option><option value="maintenance">صيانة</option>
              </select>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-zinc-500 mb-1">الجمهور المستهدف</div>
            <div className="flex gap-1.5">
              {(['all', 'course', 'students'] as AnnAudience[]).map(a => (
                <button key={a} onClick={() => setAudience(a)} className={`flex-1 py-2 rounded-lg text-[12px] font-bold flex items-center justify-center gap-1 ${audience === a ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                  {a === 'all' ? <Users size={13} /> : a === 'course' ? <BookOpen size={13} /> : <User size={13} />} {AUD_AR[a]}
                </button>
              ))}
            </div>
          </div>

          {audience === 'course' && (
            <select value={courseId} onChange={e => setCourseId(e.target.value)} className={INP}>
              <option value="">— اختر الدورة —</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          )}

          {audience === 'students' && (
            <div className="space-y-2">
              {picked.length > 0 && <div className="flex flex-wrap gap-1.5">{picked.map(p => (
                <span key={p.id} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2 py-1 rounded-full">{p.full_name}<button onClick={() => setPicked(picked.filter(x => x.id !== p.id))}><X size={11} /></button></span>
              ))}</div>}
              <div className="relative">
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث بالاسم أو الرمز أو الهاتف…" className={INP + ' pr-9'} />
                {(results.length > 0 || searching) && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-zinc-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                    {searching ? <div className="py-3 text-center"><Loader2 size={15} className="animate-spin text-zinc-300 mx-auto" /></div>
                      : results.map(s => (
                        <button key={s.id} onClick={() => addStudent(s)} className="w-full flex items-center justify-between gap-2 px-3 py-2 hover:bg-zinc-50 text-right">
                          <span className="text-[12px] font-semibold text-zinc-800 truncate">{s.full_name}</span>
                          <span className="text-[10px] font-mono text-zinc-400">{s.verification_token}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 items-center">
            <label className="text-[11px] text-zinc-500">ينتهي في (اختياري) <input type="date" value={endsAt} onChange={e => setEndsAt(e.target.value)} className={INP + ' mt-1'} /></label>
          </div>

          <div className="flex gap-2">
            <button onClick={create} disabled={saving || !title.trim()} className="flex-1 py-2.5 bg-black text-white rounded-lg font-bold text-[13px] disabled:opacity-50">{saving ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'نشر الإعلان'}</button>
            <button onClick={() => { resetForm(); setShowNew(false) }} className="px-4 py-2.5 border border-zinc-200 rounded-lg text-[13px] text-zinc-500">إلغاء</button>
          </div>
        </div>
      )}

      {loading ? <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-zinc-300" size={26} /></div>
        : list.length === 0 ? <div className="text-center py-16 text-zinc-400"><div className="text-4xl mb-2">📣</div><div className="text-[14px]">لا إعلانات بعد</div></div>
        : list.map(a => (
          <div key={a.id} className={`bg-white border rounded-2xl p-4 ${a.is_active ? 'border-zinc-200' : 'border-zinc-100 opacity-60'}`}>
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[14px] text-zinc-900">{a.title}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${SEV_AR[a.severity].cls}`}>{SEV_AR[a.severity].label}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500">{a.type === 'banner' ? 'شريط' : 'نافذة'}</span>
                  <span className="text-[10px] text-zinc-400">· {AUD_AR[a.audience]}{a.audience === 'students' ? ` (${a.target_count})` : ''}</span>
                </div>
                {a.body && <div className="text-[12px] text-zinc-500 mt-1 line-clamp-2">{a.body}</div>}
              </div>
              <button onClick={() => toggleAnnouncement(a.id, !a.is_active).then(load)} className="text-zinc-400 hover:text-zinc-700" title={a.is_active ? 'إيقاف' : 'تفعيل'}>{a.is_active ? <Eye size={16} /> : <EyeOff size={16} />}</button>
              <button onClick={() => remove(a.id)} className="text-zinc-300 hover:text-red-500"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
    </div>
  )
}
