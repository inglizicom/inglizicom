'use client'

import { useEffect, useState } from 'react'
import { Route, Plus, Trash2, Loader2, ChevronDown, ChevronLeft, GripVertical, X } from 'lucide-react'
import { useStaff } from '@/lib/staff-context'
import {
  fetchTemplates, fetchTemplateSteps, createTemplate, addTemplateStep,
  deleteTemplateStep, deleteTemplate,
  type PathTemplate, type PathStep,
} from '@/lib/student-portal'

const CATS = [
  { id: 'vocabulary', label: 'مفردات' }, { id: 'lesson', label: 'درس' },
  { id: 'reading', label: 'قراءة' }, { id: 'speaking', label: 'محادثة' },
  { id: 'exercise', label: 'تمرين' }, { id: 'quiz', label: 'اختبار' },
]

export default function TemplatesPage() {
  const staff = useStaff()
  const [templates, setTemplates] = useState<PathTemplate[]>([])
  const [loading, setLoading]     = useState(true)
  const [openId, setOpenId]       = useState<string | null>(null)
  const [steps, setSteps]         = useState<Record<string, PathStep[]>>({})

  // new template
  const [showNew, setShowNew] = useState(false)
  const [tName, setTName] = useState(''); const [tLevel, setTLevel] = useState(''); const [tDesc, setTDesc] = useState('')
  const [creating, setCreating] = useState(false)

  // new step (per open template)
  const [sTitle, setSTitle] = useState(''); const [sCat, setSCat] = useState('vocabulary'); const [sLink, setSLink] = useState(''); const [sDesc, setSDesc] = useState('')
  const [addingStep, setAddingStep] = useState(false)

  async function load() { setLoading(true); setTemplates(await fetchTemplates()); setLoading(false) }
  useEffect(() => { load() }, [])

  async function toggle(id: string) {
    if (openId === id) { setOpenId(null); return }
    setOpenId(id)
    if (!steps[id]) setSteps(p => ({ ...p, [id]: [] })) // placeholder
    const s = await fetchTemplateSteps(id)
    setSteps(p => ({ ...p, [id]: s }))
  }

  async function createT() {
    if (!tName.trim()) return
    setCreating(true)
    const id = await createTemplate({ name: tName.trim(), level: tLevel || undefined, description: tDesc || undefined, createdBy: staff.id })
    setTName(''); setTLevel(''); setTDesc(''); setShowNew(false); setCreating(false)
    await load()
    if (id) toggle(id)
  }
  async function addStep(templateId: string) {
    if (!sTitle.trim()) return
    setAddingStep(true)
    const order = (steps[templateId]?.length ?? 0) + 1
    await addTemplateStep({ templateId, order, title: sTitle.trim(), category: sCat, linkUrl: sLink || undefined, description: sDesc || undefined })
    setSTitle(''); setSLink(''); setSDesc('')
    setSteps(p => ({ ...p, [templateId]: [] })); setSteps(p => ({ ...p, [templateId]: [] }))
    setSteps(p => ({ ...p, [templateId]: [] }))
    const s = await fetchTemplateSteps(templateId); setSteps(p => ({ ...p, [templateId]: s }))
    setAddingStep(false)
  }
  async function removeStep(templateId: string, id: string) {
    await deleteTemplateStep(id)
    const s = await fetchTemplateSteps(templateId); setSteps(p => ({ ...p, [templateId]: s }))
  }
  async function removeTemplate(id: string) {
    if (!confirm('حذف هذا المسار نهائيًا؟')) return
    await deleteTemplate(id); setOpenId(null); await load()
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><Route size={20} className="text-emerald-600" /></div>
          <div>
            <h2 className="text-[17px] font-black text-zinc-900">مسارات التعلّم الجاهزة</h2>
            <p className="text-[12px] text-zinc-400">صمّم مسارًا مرّة واحدة وطبّقه على أي طالب بضغطة</p>
          </div>
        </div>
        <button onClick={() => setShowNew(v => !v)} className="flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 bg-yellow-400 text-black rounded-xl hover:bg-yellow-300"><Plus size={14} /> مسار جديد</button>
      </div>

      {showNew && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input value={tName} onChange={e => setTName(e.target.value)} placeholder="اسم المسار * (مثال: Foundation A1)" className={INP + ' sm:col-span-2'} />
            <input value={tLevel} onChange={e => setTLevel(e.target.value)} placeholder="المستوى (A1)" dir="ltr" className={INP + ' text-right'} />
          </div>
          <input value={tDesc} onChange={e => setTDesc(e.target.value)} placeholder="وصف (اختياري)" className={INP} />
          <div className="flex gap-2">
            <button onClick={createT} disabled={creating || !tName.trim()} className="flex-1 py-2 bg-black text-white rounded-lg font-bold text-[13px] disabled:opacity-50">{creating ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'إنشاء المسار'}</button>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 border border-zinc-200 rounded-lg text-[13px] text-zinc-500">إلغاء</button>
          </div>
        </div>
      )}

      {loading ? <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-zinc-300" size={26} /></div>
        : templates.length === 0 ? <div className="text-center py-16 text-zinc-400"><div className="text-4xl mb-2">🗺️</div><div className="text-[14px]">لا توجد مسارات بعد — أنشئ أول مسار</div></div>
        : templates.map(t => {
          const open = openId === t.id
          const tSteps = steps[t.id] ?? []
          return (
            <div key={t.id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              <button onClick={() => toggle(t.id)} className="w-full flex items-center gap-3 p-4 text-right hover:bg-zinc-50">
                {open ? <ChevronDown size={16} className="text-zinc-400" /> : <ChevronLeft size={16} className="text-zinc-400" />}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[15px] text-zinc-900">{t.name}{t.level && <span className="mr-2 text-[11px] font-bold bg-zinc-100 text-zinc-600 px-1.5 rounded">{t.level}</span>}</div>
                  {t.description && <div className="text-[12px] text-zinc-400">{t.description}</div>}
                </div>
                <span className="text-[11px] text-zinc-400">{open ? `${tSteps.length} خطوة` : 'عرض الخطوات'}</span>
                <button onClick={e => { e.stopPropagation(); removeTemplate(t.id) }} className="text-zinc-300 hover:text-red-500"><Trash2 size={15} /></button>
              </button>

              {open && (
                <div className="px-4 pb-4 space-y-2 border-t border-zinc-50 pt-3">
                  {tSteps.map((st, i) => (
                    <div key={st.id} className="flex items-center gap-3 border border-zinc-100 rounded-xl p-2.5">
                      <span className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-500 text-[11px] font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-zinc-800">{st.title}</div>
                        <div className="text-[11px] text-zinc-400">{CATS.find(c => c.id === st.category)?.label ?? st.category}{st.link_url ? ' · رابط' : ''}</div>
                      </div>
                      <button onClick={() => removeStep(t.id, st.id)} className="text-zinc-300 hover:text-red-500"><X size={15} /></button>
                    </div>
                  ))}

                  {/* Add step */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 space-y-2 mt-2">
                    <div className="text-[12px] font-bold text-zinc-600">إضافة خطوة</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input value={sTitle} onChange={e => setSTitle(e.target.value)} placeholder="عنوان الخطوة *" className={INP} />
                      <select value={sCat} onChange={e => setSCat(e.target.value)} className={INP}>{CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
                    </div>
                    <input value={sLink} onChange={e => setSLink(e.target.value)} placeholder="رابط الدرس/التمرين (اختياري)" dir="ltr" className={INP + ' text-right'} />
                    <button onClick={() => addStep(t.id)} disabled={addingStep || !sTitle.trim()} className="w-full py-2 bg-emerald-600 text-white rounded-lg font-bold text-[13px] disabled:opacity-50">{addingStep ? <Loader2 size={13} className="animate-spin mx-auto" /> : '+ إضافة الخطوة'}</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
    </div>
  )
}

const INP = 'w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400'
