'use client'

/* ActivityTab — CRM student profile: the "activity" tab, split out of page.tsx.
   What the student did on the platform, newest first.
   The page owns all state and data; this file only draws the tab from
   the values it is handed (props generated from what the JSX uses). */

import { Activity } from 'lucide-react'

import { ACTIVITY_LABEL, ACTIVITY_ICON, ComingSoon } from '../_parts'

export interface ActivityTabProps {
  activity: { event_type: string; entity_title: string | null; created_at: string; }[]
}

export default function ActivityTab({ activity }: ActivityTabProps) {
  return (
    <>
          <div>
            <div className="text-[13px] font-bold text-zinc-700 mb-3">سجل نشاط الطالب على Inglizi.com</div>
            {activity.length === 0
              ? <ComingSoon icon={Activity} title="لا يوجد نشاط بعد" desc="سيظهر هنا كل ما يفعله الطالب: تسجيل الدخول، فتح الدروس، إنجاز التمارين، تحميل الملفات، والاطلاع على النتائج." />
              : <div className="relative">
                  {activity.map((a, i) => (
                    <div key={i} className="flex gap-3 pb-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[13px]">{ACTIVITY_ICON[a.event_type] ?? '•'}</div>
                        {i < activity.length - 1 && <div className="w-px flex-1 bg-zinc-100 my-1" />}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="text-[13px] font-semibold text-zinc-800">{ACTIVITY_LABEL[a.event_type] ?? a.event_type}{a.entity_title ? `: ${a.entity_title}` : ''}</div>
                        <div className="text-[11px] text-zinc-400">{new Date(a.created_at).toLocaleString('ar-MA', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                      </div>
                    </div>
                  ))}
                </div>}
          </div>
    </>
  )
}
