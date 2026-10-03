'use client'

/* NotesTab — CRM student profile: the "notes" tab, split out of page.tsx.
   Staff notes about the student.
   The page owns all state and data; this file only draws the tab from
   the values it is handed (props generated from what the JSX uses). */

import { Loader2, Edit3, Save } from 'lucide-react'

import type { Dispatch, SetStateAction } from 'react'

export interface NotesTabProps {
  editNote: boolean
  noteText: string
  saveNote: () => Promise<void>
  savingNote: boolean
  setEditNote: Dispatch<SetStateAction<boolean>>
  setNoteText: Dispatch<SetStateAction<string>>
}

export default function NotesTab({ editNote, noteText, saveNote, savingNote, setEditNote, setNoteText }: NotesTabProps) {
  return (
    <>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-[14px]">ملاحظات الطالب</span>
              <button onClick={() => setEditNote(v => !v)} className="flex items-center gap-1 text-[12px] text-zinc-400 hover:text-zinc-700">
                <Edit3 size={12} /> {editNote ? 'إلغاء' : 'تعديل'}
              </button>
            </div>
            {editNote ? (
              <>
                <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={8} placeholder="أضف ملاحظاتك..."
                  className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-[14px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                <button onClick={saveNote} disabled={savingNote}
                  className="mt-3 w-full py-2.5 bg-black text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2">
                  {savingNote ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> حفظ</>}
                </button>
              </>
            ) : (
              <div className="bg-zinc-50 rounded-xl p-4 min-h-[120px] text-[14px] text-zinc-600 leading-relaxed whitespace-pre-wrap">
                {noteText || <span className="text-zinc-300 italic">لا توجد ملاحظات</span>}
              </div>
            )}
          </div>
    </>
  )
}
