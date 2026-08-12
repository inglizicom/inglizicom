'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  CalendarClock, Plus, Trash2, Loader2, Check, RotateCcw, Info, Sun, Moon,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import { saveTeacherProfile, type AvailabilityWindow } from '@/lib/teachers'
import { Action, Chip, Ghost, Head, Panel, Rise } from '../_ds'
import { isTeacherDemo } from '../_demo'

/**
 * When a teacher can teach.
 *
 * `availability` is a jsonb array on teacher_profiles that nothing has ever
 * written — the column shipped with 044 and stayed empty. It is one of the few
 * fields the guard trigger does NOT pin, so a teacher owns it outright.
 *
 * Days follow JavaScript's getDay(): 0 = Sunday … 6 = Saturday, so a window
 * can be compared against a session's start date without a lookup table.
 */

const DAYS = [
  { n: 0, label: 'الأحد' },
  { n: 1, label: 'الإثنين' },
  { n: 2, label: 'الثلاثاء' },
  { n: 3, label: 'الأربعاء' },
  { n: 4, label: 'الخميس' },
  { n: 5, label: 'الجمعة' },
  { n: 6, label: 'السبت' },
]

const DEFAULT_WINDOW = { from: '18:00', to: '20:00' }

/** "18:30" → 1110. Invalid or empty parses to NaN so callers can reject it. */
function toMinutes(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim())
  if (!m) return NaN
  const h = Number(m[1]), min = Number(m[2])
  if (h > 23 || min > 59) return NaN
  return h * 60 + min
}

function windowMinutes(w: AvailabilityWindow): number {
  const a = toMinutes(w.from), b = toMinutes(w.to)
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return 0
  return b - a
}

export default function TeacherSchedulePage() {
  const teacher = useTeacher()
  const demo    = isTeacherDemo()

  const [windows, setWindows] = useState<AvailabilityWindow[]>([])
  const [saved, setSaved]     = useState<AvailabilityWindow[]>([])
  const [busy, setBusy]       = useState(false)
  const [done, setDone]       = useState(false)

  useEffect(() => {
    const initial = teacher.profile?.availability ?? []
    setWindows(initial)
    setSaved(initial)
  }, [teacher.profile?.availability])

  const dirty = useMemo(
    () => JSON.stringify(windows) !== JSON.stringify(saved),
    [windows, saved],
  )

  const byDay = useMemo(() => {
    const map = new Map<number, AvailabilityWindow[]>()
    DAYS.forEach(d => map.set(d.n, []))
    for (const w of windows) map.get(w.day)?.push(w)
    for (const list of map.values()) list.sort((a, b) => toMinutes(a.from) - toMinutes(b.from))
    return map
  }, [windows])

  const weeklyMinutes = windows.reduce((a, w) => a + windowMinutes(w), 0)
  const weeklyHours   = Math.round((weeklyMinutes / 60) * 10) / 10
  const activeDays    = DAYS.filter(d => (byDay.get(d.n) ?? []).length > 0).length

  // An invalid row must not be saveable — an end before a start would silently
  // become a zero-length window that reads as availability but grants none.
  const invalid = windows.some(w => windowMinutes(w) === 0)

  function addWindow(day: number) {
    setDone(false)
    setWindows(prev => [...prev, { day, ...DEFAULT_WINDOW }])
  }

  function removeWindow(day: number, index: number) {
    setDone(false)
    setWindows(prev => {
      let seen = -1
      return prev.filter(w => {
        if (w.day !== day) return true
        seen += 1
        return seen !== index
      })
    })
  }

  function patchWindow(day: number, index: number, patch: Partial<AvailabilityWindow>) {
    setDone(false)
    setWindows(prev => {
      let seen = -1
      return prev.map(w => {
        if (w.day !== day) return w
        seen += 1
        return seen === index ? { ...w, ...patch } : w
      })
    })
  }

  async function save() {
    if (demo || invalid) return
    setBusy(true)
    const ok = await saveTeacherProfile(teacher.id, { availability: windows })
    setBusy(false)
    if (ok) {
      setSaved(windows)
      setDone(true)
      await teacher.refresh()
      window.setTimeout(() => setDone(false), 2600)
    }
  }

  return (
    <div className="space-y-5">

      {demo && (
        <Rise>
          <div className="flex items-center gap-2.5 rounded-2xl bg-fuchsia-50 ring-1 ring-fuchsia-200 px-4 py-2.5">
            <Info size={15} className="text-fuchsia-600 shrink-0" />
            <span className="text-[12.5px] font-medium text-fuchsia-800">معاينة — الحفظ معطّل في وضع العرض.</span>
            <a href="?demo=0" className="mr-auto text-[12px] font-bold text-fuchsia-700 hover:text-[#1C1917] transition-colors">إيقاف</a>
          </div>
        </Rise>
      )}

      {/* ═══ The week at a glance ═══ */}
      <Rise>
        <Panel glow="sky" className="p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <Chip tone="sky">أسبوعياً</Chip>
                {activeDays > 0 && <Chip tone="muted">{activeDays} من 7 أيام</Chip>}
              </div>
              <h1 className="text-[30px] sm:text-[38px] font-bold tracking-tight leading-[1.1]">
                <span className="bg-gradient-to-l from-[#0EA5E9] to-[#0369A1] bg-clip-text text-transparent tabular-nums">
                  {weeklyHours}
                </span>
                <span className="text-[20px] text-[#78716C] font-semibold"> ساعة</span>
              </h1>
              <p className="text-[#78716C] text-[14px] font-medium mt-2.5">
                {weeklyMinutes > 0
                  ? 'هذا ما تعلنه للمكتب كوقت متاح للتدريس.'
                  : 'لم تحدد أي وقت بعد — أضف نافذة ليعرف المكتب متى يبرمج لك.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {dirty && !demo && (
                <Ghost icon={RotateCcw} onClick={() => { setWindows(saved); setDone(false) }}>
                  تراجع
                </Ghost>
              )}
              <div onClick={save} className={(!dirty || demo || invalid || busy) ? 'opacity-50 pointer-events-none' : ''}>
                <Action icon={busy ? Loader2 : done ? Check : CalendarClock} grad="sky">
                  {busy ? 'جاري الحفظ…' : done ? 'تم الحفظ' : 'حفظ التوفر'}
                </Action>
              </div>
            </div>
          </div>

          {invalid && (
            <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-rose-50 ring-1 ring-rose-200 px-4 py-3">
              <Info size={15} className="text-rose-700 shrink-0 mt-0.5" />
              <p className="text-[12.5px] text-rose-800 font-medium">
                هناك نافذة تنتهي قبل أن تبدأ — صحّحها قبل الحفظ.
              </p>
            </div>
          )}
        </Panel>
      </Rise>

      {/* ═══ Seven days ═══ */}
      <div className="grid md:grid-cols-2 gap-4 [&>*]:min-w-0">
        {DAYS.map((d, i) => {
          const list = byDay.get(d.n) ?? []
          const mins = list.reduce((a, w) => a + windowMinutes(w), 0)
          return (
            <Rise key={d.n} i={i % 2}>
              <Panel className="p-5 h-full">
                <Head
                  icon={d.n === 5 || d.n === 6 ? Moon : Sun}
                  grad={list.length ? 'sky' : 'violet'}
                  title={d.label}
                  note={mins > 0 ? `${Math.round((mins / 60) * 10) / 10} ساعة` : 'غير متاح'}
                  action={
                    <button
                      onClick={() => addWindow(d.n)}
                      disabled={demo}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F6F4EF] ring-1 ring-[#E7E2D8]
                                 text-[11.5px] font-semibold text-[#57534E] hover:bg-[#EAE5DA] hover:text-[#1C1917]
                                 transition-colors disabled:opacity-40"
                    >
                      <Plus size={13} /> نافذة
                    </button>
                  }
                />

                {list.length === 0 ? (
                  <p className="text-[12px] text-[#C7C2BA] font-medium py-2">
                    لا وقت متاح في هذا اليوم.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {list.map((w, idx) => {
                      const bad = windowMinutes(w) === 0
                      return (
                        <div key={idx}
                             className={`flex items-center gap-2 p-2.5 rounded-xl bg-[#FBFAF7] ring-1 ${
                               bad ? 'ring-rose-300' : 'ring-[#E7E2D8]'}`}>
                          <input
                            type="time"
                            value={w.from}
                            disabled={demo}
                            onChange={e => patchWindow(d.n, idx, { from: e.target.value })}
                            className="bg-[#F6F4EF] ring-1 ring-[#E7E2D8] rounded-lg px-2.5 py-1.5
                                       text-[12.5px] font-semibold text-[#1C1917] tabular-nums
                                       focus:outline-none focus:ring-[#0369A1]/40 disabled:opacity-50"
                            dir="ltr"
                          />
                          <span className="text-[#A8A29E] text-[12px] font-medium">→</span>
                          <input
                            type="time"
                            value={w.to}
                            disabled={demo}
                            onChange={e => patchWindow(d.n, idx, { to: e.target.value })}
                            className="bg-[#F6F4EF] ring-1 ring-[#E7E2D8] rounded-lg px-2.5 py-1.5
                                       text-[12.5px] font-semibold text-[#1C1917] tabular-nums
                                       focus:outline-none focus:ring-[#0369A1]/40 disabled:opacity-50"
                            dir="ltr"
                          />
                          <button
                            onClick={() => removeWindow(d.n, idx)}
                            disabled={demo}
                            aria-label="حذف النافذة"
                            className="mr-auto w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                                       text-[#A8A29E] hover:text-rose-700 hover:bg-rose-50
                                       transition-colors disabled:opacity-40"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Panel>
            </Rise>
          )
        })}
      </div>

      <Rise>
        <div className="flex items-start gap-2.5 rounded-2xl bg-[#FBFAF7] ring-1 ring-[#E7E2D8] px-4 py-3">
          <Info size={15} className="text-[#78716C] shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-[#78716C] font-medium leading-relaxed">
            هذه نوافذ إعلانية، لا حجز. المكتب يبرمج الحصص داخلها — ولن يمنعك أحد من قبول حصة خارجها عند الحاجة.
          </p>
        </div>
      </Rise>
    </div>
  )
}
