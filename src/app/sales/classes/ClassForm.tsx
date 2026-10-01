'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { fetchCourses, type LmsCourse } from '@/lib/lms'
import {
  createOnlineClass, fetchTeacherOptions, updateOnlineClass,
  type ClassInput, type ClassMode, type ClassStatus, type OnlineClass, type TeacherOption,
} from '@/lib/online-classes'
import { ErrorNote, Field, INP, Modal } from '@/components/crm/kit'

const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1']

/** Create or edit an online class. Teacher assignment happens here (CRM only). */
export default function ClassForm({ initial, onClose, onSaved }: {
  initial?: Partial<OnlineClass> & { id?: string }
  onClose: () => void
  onSaved: (id: string) => void
}) {
  const editing = !!initial?.id
  const [teachers, setTeachers] = useState<TeacherOption[]>([])
  const [courses, setCourses] = useState<LmsCourse[]>([])
  const [form, setForm] = useState<ClassInput>({
    title:            initial?.title ?? '',
    mode:             (initial?.mode as ClassMode) ?? 'group',
    teacher_id:       initial?.teacher_id ?? null,
    course_id:        initial?.course_id ?? null,
    level:            initial?.level ?? null,
    status:           (initial?.status as ClassStatus) ?? 'active',
    starts_on:        initial?.starts_on ?? null,
    ends_on:          initial?.ends_on ?? null,
    capacity:         initial?.capacity ?? null,
    waitlist_enabled: initial?.waitlist_enabled ?? false,
    meeting_url:      initial?.meeting_url ?? null,
    schedule_note:    initial?.schedule_note ?? null,
    notes:            initial?.notes ?? null,
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeacherOptions().then(setTeachers).catch(() => setTeachers([]))
    fetchCourses().then(setCourses)
  }, [])

  const set = <K extends keyof ClassInput>(k: K, v: ClassInput[K]) => setForm(f => ({ ...f, [k]: v }))
  const nn = (s: string) => (s.trim() === '' ? null : s.trim())

  async function save() {
    if (!form.title.trim()) { setError('اكتب اسم القسم.'); return }
    if (form.starts_on && form.ends_on && form.ends_on < form.starts_on) { setError('تاريخ النهاية قبل تاريخ البداية.'); return }
    setBusy(true); setError(null)
    const payload: ClassInput = {
      ...form,
      title: form.title.trim(),
      capacity: form.mode === 'private' ? 1 : form.capacity,
      waitlist_enabled: form.mode === 'private' ? false : form.waitlist_enabled,
    }
    try {
      if (editing) { await updateOnlineClass(initial!.id!, payload); onSaved(initial!.id!) }
      else onSaved(await createOnlineClass(payload))
    } catch (e: any) {
      setError(e?.message ?? 'تعذّر الحفظ.'); setBusy(false)
    }
  }

  return (
    <Modal title={editing ? 'تعديل القسم' : 'قسم مباشر جديد'} onClose={onClose} wide>
      <div className="space-y-3.5">
        <Field label="اسم القسم *">
          <input value={form.title} onChange={e => set('title', e.target.value)} className={INP} placeholder="مثال: A1 مساءً — الإثنين والأربعاء" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="النوع">
            <select value={form.mode} onChange={e => set('mode', e.target.value as ClassMode)} className={INP}>
              <option value="group">جماعي</option>
              <option value="private">فردي (طالب واحد)</option>
            </select>
          </Field>
          <Field label="الأستاذ">
            <select value={form.teacher_id ?? ''} onChange={e => set('teacher_id', e.target.value || null)} className={INP}>
              <option value="">— بدون أستاذ بعد —</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}{t.is_active ? '' : ' (موقوف)'}</option>)}
            </select>
          </Field>
          <Field label="الحالة">
            <select value={form.status} onChange={e => set('status', e.target.value as ClassStatus)} className={INP}>
              <option value="active">جارٍ</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغى</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="الدورة المرتبطة (اختياري)" hint="الحصص تأخذ دورة القسم تلقائيًا.">
            <select value={form.course_id ?? ''} onChange={e => set('course_id', e.target.value || null)} className={INP}>
              <option value="">— بدون دورة —</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}{c.level ? ` (${c.level})` : ''}</option>)}
            </select>
          </Field>
          <Field label="المستوى">
            <select value={form.level ?? ''} onChange={e => set('level', e.target.value || null)} className={INP}>
              <option value="">—</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="تاريخ البداية">
            <input type="date" value={form.starts_on ?? ''} onChange={e => set('starts_on', e.target.value || null)} dir="ltr" className={INP} />
          </Field>
          <Field label="تاريخ النهاية">
            <input type="date" value={form.ends_on ?? ''} onChange={e => set('ends_on', e.target.value || null)} dir="ltr" className={INP} />
          </Field>
        </div>

        {form.mode === 'group' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <Field label="عدد المقاعد" hint="اتركه فارغًا لعدد غير محدود.">
              <input type="number" min={1} value={form.capacity ?? ''} dir="ltr" className={INP}
                onChange={e => set('capacity', e.target.value ? Math.max(1, parseInt(e.target.value) || 1) : null)} />
            </Field>
            <label className="flex items-center gap-2 text-[13px] font-bold text-zinc-700 pb-2.5">
              <input type="checkbox" checked={form.waitlist_enabled} onChange={e => set('waitlist_enabled', e.target.checked)}
                className="w-4 h-4 accent-yellow-400" />
              قائمة انتظار عند الامتلاء
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="رابط الحصص">
            <input value={form.meeting_url ?? ''} onChange={e => set('meeting_url', nn(e.target.value))} dir="ltr" className={`${INP} text-left`} placeholder="https://meet.google.com/…" />
          </Field>
          <Field label="المواعيد (نص حر)">
            <input value={form.schedule_note ?? ''} onChange={e => set('schedule_note', nn(e.target.value))} className={INP} placeholder="الإثنين والأربعاء 18:00" />
          </Field>
        </div>

        <Field label="ملاحظات">
          <textarea value={form.notes ?? ''} onChange={e => set('notes', nn(e.target.value))} rows={2} className={INP} />
        </Field>

        <ErrorNote>{error}</ErrorNote>
        <div className="flex gap-2">
          <button onClick={save} disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-black text-white rounded-xl font-bold text-[13px] disabled:opacity-50">
            {busy && <Loader2 size={14} className="animate-spin" />} {editing ? 'حفظ التعديلات' : 'إنشاء القسم'}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border border-zinc-200 rounded-xl text-[13px] text-zinc-500">إلغاء</button>
        </div>
      </div>
    </Modal>
  )
}
