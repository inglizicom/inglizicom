'use client'

/* TasksTab — the student space's "tasks" tab, split out of page.tsx.
   Curriculum exercises under their unit and lesson, then staff-assigned tasks.
   The page owns all state and data; this file only draws the tab from
   the values it is handed (props generated from what the JSX uses). */

import { Loader2, CheckCircle2, Circle, ExternalLink, ListChecks } from 'lucide-react'
import { type StudentAssignment, type ExerciseBoard, type BoardTask } from '@/lib/student-portal'

import { fmtShort, pct, MiniBar, SectionTitle, Empty, ExerciseChip } from '../_shared'

export interface TasksTabProps {
  board: ExerciseBoard | null
  boardTasks: BoardTask[]
  manualEx: StudentAssignment[]
  onCompleteManual: (a: StudentAssignment) => Promise<void>
}

export default function TasksTab({ board, boardTasks, manualEx, onCompleteManual }: TasksTabProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Curriculum exercises — each under its real unit and lesson */}
      <SectionTitle icon={ListChecks} color="text-amber-700">تمارين المنهج</SectionTitle>
      {board?.summary && board.summary.curriculum_total > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-100 p-3.5">
          <MiniBar label={`أنجزت ${board.summary.curriculum_done} من ${board.summary.curriculum_total}`}
            pct={pct(board.summary.curriculum_done, board.summary.curriculum_total)} color="bg-[var(--ic-gold)]" />
          <p className="text-[11px] text-zinc-400 mt-1.5">يُحتسب التمرين مكتملًا عند النجاح في الاختبار أو إكمال الدرس أو تصحيح المحادثة — فتح الرابط وحده لا يكفي.</p>
        </div>
      )}
      {!board ? <div className="py-8 flex justify-center"><Loader2 size={20} className="animate-spin text-zinc-300" /></div>
        : (board.units ?? []).length === 0 ? <Empty emoji="📘" text="لا تمارين منهج بعد" sub="تظهر تمارين دورتك هنا تحت كل درس" />
        : (board.units ?? []).map(u => (
          <div key={u.module_id} className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            <div className="px-4 py-2.5 bg-[#f5ecdc] border-b border-amber-100/70 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center bg-[var(--ic-dark-2)] text-[var(--ic-gold)] flex-shrink-0">{u.order}</span>
              <span className="font-bold text-[13.5px] text-zinc-800 flex-1 truncate">{u.title}</span>
            </div>
            <div className="divide-y divide-zinc-50">
              {u.lessons.filter(l => l.items.length > 0).map(l => (
                <div key={l.lesson_id} className="px-4 py-2.5">
                  <div className="text-[12.5px] font-semibold text-zinc-700 mb-1.5">{l.order}. {l.title}</div>
                  <div className="flex flex-wrap gap-1.5">{l.items.map(i => <ExerciseChip key={i.kind} item={i} />)}</div>
                </div>
              ))}
              {u.unit_items.length > 0 && (
                <div className="px-4 py-2.5 bg-zinc-50/60">
                  <div className="text-[11.5px] font-bold text-zinc-500 mb-1.5">نهاية الوحدة</div>
                  <div className="flex flex-wrap gap-1.5">{u.unit_items.map(i => <ExerciseChip key={i.kind} item={i} />)}</div>
                </div>
              )}
            </div>
          </div>
        ))}

      {/* Staff-assigned tasks — labelled as such, never mixed into the curriculum */}
      <SectionTitle icon={ListChecks} color="text-blue-500">مهام إضافية من الفريق</SectionTitle>
      {manualEx.length === 0 && <Empty emoji="🎯" text="لا توجد مهام إضافية" sub="يضيفها فريقك عند الحاجة" />}
      {manualEx.map(a => {
        const linked = boardTasks.find(t => t.id === a.id)
        return (
        <div key={a.id} className="bg-white rounded-2xl border border-zinc-100 p-4 flex items-start gap-3">
          {a.status === 'done' ? <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" /> : <Circle size={20} className="text-zinc-300 flex-shrink-0 mt-0.5" />}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[14px] text-zinc-800">{a.title}</div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">مهمة إضافية</span>
              {linked?.lesson_title && <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">الدرس: {linked.module_title} · {linked.lesson_title}</span>}
              {a.due_date && <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500">قبل {fmtShort(a.due_date)}</span>}
            </div>
            {a.description && <div className="text-[12px] text-zinc-500 mt-1">{a.description}</div>}
            <div className="flex gap-2 mt-2.5">
              {a.link_url && <a href={a.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-blue-500 px-3 py-1.5 rounded-lg">ابدأ <ExternalLink size={12} /></a>}
              {a.status !== 'done' ? <button onClick={() => onCompleteManual(a)} className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg"><CheckCircle2 size={12} /> تم الإنجاز</button> : <span className="text-[12px] font-bold text-emerald-600 px-3 py-1.5">مُنجز ✓</span>}
            </div>
          </div>
        </div>
      )})}
    </div>
  )
}
