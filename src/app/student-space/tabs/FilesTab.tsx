'use client'

/* FilesTab — the student space's "files" tab, split out of page.tsx.
   Course files and resources to open or download.
   The page owns all state and data; this file only draws the tab from
   the values it is handed (props generated from what the JSX uses). */

import { BookOpen, FileText, Download } from 'lucide-react'
import { logActivity } from '@/lib/student-portal'
import { resourceUrl, type CourseResource } from '@/lib/lms'

import { fmtShort, SectionTitle, Empty } from '../_shared'
import type { StudentFile } from '@/lib/student-portal'

export interface FilesTabProps {
  files: StudentFile[]
  openFile: (f: { id: string; file_name: string; file_path: string; }) => void
  resources: CourseResource[]
  token: string
}

export default function FilesTab({ files, openFile, resources, token }: FilesTabProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {resources.length > 0 && (
        <>
          <SectionTitle icon={BookOpen} color="text-emerald-600">ملفات الدورة</SectionTitle>
          {resources.map(r => (
            <a key={r.id} href={resourceUrl(r.file_path)} target="_blank" rel="noreferrer"
              onClick={() => logActivity(token, 'downloaded_file', 'resource', r.id, r.title)}
              className="w-full flex items-center gap-3 bg-white rounded-2xl border border-emerald-100 p-4 hover:border-emerald-300">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0"><FileText size={18} className="text-emerald-600" /></div>
              <div className="flex-1 min-w-0"><div className="font-bold text-[13px] text-zinc-800 truncate">{r.title}</div><div className="text-[11px] text-zinc-400">{(r.file_type ?? 'ملف').toUpperCase()}{r.course_title ? ` · ${r.course_title}` : ''}</div></div>
              <Download size={18} className="text-emerald-500 flex-shrink-0" />
            </a>
          ))}
          <div className="h-1" />
        </>
      )}
      <SectionTitle icon={FileText} color="text-rose-500">ملفاتي</SectionTitle>
      {files.length === 0 && <Empty emoji="📁" text="لا توجد ملفات بعد" />}
      {files.map(f => (
        <button key={f.id} onClick={() => openFile(f)} className="w-full flex items-center gap-3 bg-white rounded-2xl border border-zinc-100 p-4 text-right hover:border-zinc-300">
          <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0"><FileText size={18} className="text-rose-500" /></div>
          <div className="flex-1 min-w-0"><div className="font-bold text-[13px] text-zinc-800 truncate">{f.file_name}</div><div className="text-[11px] text-zinc-400">{(f.file_type ?? 'ملف').toUpperCase()} · {fmtShort(f.created_at)}</div></div>
          <Download size={18} className="text-zinc-400 flex-shrink-0" />
        </button>
      ))}
    </div>
  )
}
