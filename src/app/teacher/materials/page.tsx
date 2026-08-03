'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Download, FileText, FolderOpen, Image as ImageIcon, Loader2, Music,
  Presentation, Sheet, Trash2, Upload, Video as VideoIcon, Lock, Users, BookOpen,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import {
  deleteMaterial, fetchMaterials, formatSize, materialUrl, uploadMaterial,
  type MaterialVisibility, type TeacherMaterial,
} from '@/lib/teachers'
import { Card, DemoBanner, Empty, PageHero } from '../_ui'
import { DEMO_MATERIALS, isTeacherDemo } from '../_demo'

const ICONS: Record<string, typeof FileText> = {
  pdf: FileText, doc: FileText, slides: Presentation, sheet: Sheet,
  image: ImageIcon, audio: Music, video: VideoIcon,
}

const VISIBILITY: { key: MaterialVisibility; label: string; icon: typeof Lock; hint: string }[] = [
  { key: 'private',  label: 'خاص بي',      icon: Lock,     hint: 'لا يراه أحد غيرك' },
  { key: 'students', label: 'طلابي',       icon: Users,    hint: 'يراه الطلاب المسنَدون إليك' },
  { key: 'course',   label: 'كل الدورة',   icon: BookOpen, hint: 'يراه كل من في الدورة' },
]

/** Materials library — PDF, Word, slides, audio, video. Files land in the same
 *  student-files bucket the LMS already uses, under teachers/<id>/, and storage
 *  policy keeps a teacher inside their own folder. */
export default function TeacherMaterialsPage() {
  const teacher = useTeacher()
  const [items, setItems]     = useState<TeacherMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]       = useState(false)
  const [visibility, setVis]  = useState<MaterialVisibility>('students')
  const [error, setError]     = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [demo, setDemo] = useState(false)

  const load = useCallback(async () => {
    if (isTeacherDemo()) { setDemo(true); setItems(DEMO_MATERIALS); setLoading(false); return }
    setItems(await fetchMaterials(teacher.id))
    setLoading(false)
  }, [teacher.id])

  useEffect(() => { load() }, [load])

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setBusy(true); setError(null)
    let failed = 0
    for (const file of Array.from(files)) {
      const ok = await uploadMaterial(teacher.id, file, { visibility })
      if (!ok) failed += 1
    }
    setBusy(false)
    if (failed) setError(`تعذّر رفع ${failed} ${failed === 1 ? 'ملف' : 'ملفات'}. تأكد من الحجم ثم أعد المحاولة.`)
    if (fileRef.current) fileRef.current.value = ''
    load()
  }

  async function remove(m: TeacherMaterial) {
    if (!window.confirm(`حذف «${m.title}» نهائياً؟`)) return
    await deleteMaterial(m.id, m.file_path)
    load()
  }

  return (
    <div className="space-y-4">
      {demo && <DemoBanner />}

      <PageHero
        icon={FolderOpen} tone="emerald" title="ملفاتي"
        subtitle="دروسك ومرفقاتك — PDF، Word، عروض، صوتيات وفيديو"
        stats={[
          { label: 'ملف',     value: items.length },
          { label: 'ميغابايت', value: Math.round(items.reduce((a, m) => a + (m.size_bytes ?? 0), 0) / 1048576) },
          { label: 'تحميل',   value: items.reduce((a, m) => a + m.download_count, 0) },
          { label: 'خاص بي',  value: items.filter(m => m.visibility === 'private').length },
        ]}
      />

      {/* Upload */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[12px] font-black text-stone-500 ml-1">من يرى الملف؟</span>
          {VISIBILITY.map(v => (
            <button
              key={v.key}
              onClick={() => setVis(v.key)}
              title={v.hint}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12.5px] font-bold border transition ${
                visibility === v.key
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-300 hover:border-stone-400'}`}
            >
              <v.icon size={13} /> {v.label}
            </button>
          ))}
        </div>

        <label
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); onFiles(e.dataTransfer.files) }}
          className="flex flex-col items-center justify-center gap-2 py-10 rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-400 hover:bg-amber-50/40 transition cursor-pointer"
        >
          {busy ? (
            <>
              <Loader2 size={22} className="animate-spin text-stone-400" />
              <span className="text-[13.5px] font-bold text-stone-500">جاري الرفع…</span>
            </>
          ) : (
            <>
              <Upload size={22} className="text-stone-400" />
              <span className="text-[13.5px] font-bold text-stone-600">اسحب الملفات هنا أو اضغط للاختيار</span>
              <span className="text-[11.5px] font-semibold text-stone-400">PDF · Word · PowerPoint · صور · صوت · فيديو</span>
            </>
          )}
          <input ref={fileRef} type="file" multiple hidden onChange={e => onFiles(e.target.files)} />
        </label>

        {error && (
          <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-[13px] font-bold text-red-700">{error}</div>
        )}
      </Card>

      {/* Library */}
      {loading ? (
        <div className="py-20 flex justify-center text-stone-400"><Loader2 size={20} className="animate-spin" /></div>
      ) : items.length === 0 ? (
        <Card>
          <Empty icon={FolderOpen} title="لا ملفات بعد" hint="ارفع أول درس، وسيصبح متاحاً لطلابك فوراً." />
        </Card>
      ) : (
        <Card className="divide-y divide-stone-100">
          {items.map(m => {
            const Icon = ICONS[m.file_type ?? ''] ?? FileText
            const vis  = VISIBILITY.find(v => v.key === m.visibility)
            return (
              <div key={m.id} className="flex items-center gap-3.5 px-5 py-3.5">
                <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[14.5px] truncate">{m.title}</div>
                  <div className="text-[11.5px] text-stone-400 font-semibold flex items-center gap-2">
                    <span>{formatSize(m.size_bytes)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      {vis && <vis.icon size={11} />} {vis?.label}
                    </span>
                    {m.download_count > 0 && <><span>·</span><span>{m.download_count} تحميل</span></>}
                  </div>
                </div>
                <a
                  href={materialUrl(m.file_path)} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition"
                  aria-label="تحميل"
                >
                  <Download size={16} />
                </a>
                <button
                  onClick={() => remove(m)}
                  className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                  aria-label="حذف"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )
          })}
        </Card>
      )}
    </div>
  )
}
