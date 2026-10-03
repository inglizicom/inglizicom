'use client'

/* FilesTab — CRM student profile: the "files" tab, split out of page.tsx.
   Files the student uploaded or was sent.
   The page owns all state and data; this file only draws the tab from
   the values it is handed (props generated from what the JSX uses). */

import { Loader2, FileText, Upload, Trash2, Download } from 'lucide-react'

import { type CrmStudent } from '@/lib/crm-types'
import { fileUrl, type StudentFile } from '@/lib/student-portal'
import { fmtDate } from '../_parts'

export interface FilesTabProps {
  files: StudentFile[]
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  removeFile: (f: StudentFile) => Promise<void>
  student: CrmStudent
  uploading: boolean
}

export default function FilesTab({ files, onUpload, removeFile, student, uploading }: FilesTabProps) {
  return (
    <>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[12px] text-blue-800 leading-relaxed">
              💡 الملفات التي ترفعها هنا (PDF، صور، تمارين...) تظهر للطالب في فضائه على <b dir="ltr">student.inglizi.com</b> ويمكنه تحميلها.
            </div>
            <label className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-zinc-200 text-zinc-500 hover:border-yellow-400 hover:text-yellow-600 font-semibold text-[13px] cursor-pointer">
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {uploading ? 'جارٍ الرفع...' : 'رفع ملف (PDF أو غيره)'}
              <input type="file" className="hidden" onChange={onUpload} disabled={uploading} />
            </label>

            {files.length === 0 && <p className="text-center py-4 text-zinc-400 text-[13px]">لا توجد ملفات بعد</p>}
            {files.map(f => (
              <div key={f.id} className="flex items-center gap-3 border border-zinc-100 rounded-xl p-3">
                <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0"><FileText size={16} className="text-rose-500" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[13px] text-zinc-800 truncate">{f.file_name}</div>
                  <div className="text-[11px] text-zinc-400">{fmtDate(f.created_at)}</div>
                </div>
                <a href={fileUrl(f.file_path)} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-700"><Download size={16} /></a>
                <button onClick={() => removeFile(f)} className="text-zinc-300 hover:text-red-500"><Trash2 size={15} /></button>
              </div>
            ))}

            {student.verification_token && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[12px] text-blue-800 leading-relaxed">
                🔑 يدخل الطالب إلى فضائه عبر <b dir="ltr">student.inglizi.com</b> باستخدام رمزه: <b dir="ltr">{student.verification_token}</b> — حيث يرى دوراته، التمارين، والملفات.
              </div>
            )}
          </div>
    </>
  )
}
