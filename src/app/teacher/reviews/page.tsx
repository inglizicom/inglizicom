'use client'

import { useEffect, useMemo, useState } from 'react'
import { Star, Loader2, MessageSquareQuote, Trophy, Info, Users } from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import { fetchTeacherProfileFull, type TeacherProfileFull } from '@/lib/teachers'
import { Bar, Chip, Count, Head, Panel, Rise } from '../_ds'
import { isTeacherDemo } from '../_demo'

/**
 * What students said.
 *
 * The rating on teacher_profiles is a rollup a trigger maintains; the reviews
 * themselves live in teacher_reviews and the founder can hide one without
 * deleting it. This page reads the published set through teacher_profile_full,
 * which is the same source the public profile uses — so a teacher sees exactly
 * what a visitor sees, never a private draft of their own reputation.
 */

type Testimonial = TeacherProfileFull['testimonials'][number]

const DEMO_TESTIMONIALS: Testimonial[] = [
  { id: 'd1', rating: 5, comment: 'أسلوب واضح وصبر كبير. صرت نهضر بلا ما نخاف نغلط.',
    created_at: new Date(Date.now() - 3 * 864e5).toISOString(), student_name: 'كوثر بن دحمان', student_avatar: null },
  { id: 'd2', rating: 5, comment: 'الحصص منظمة والتمارين مفيدة بزاف.',
    created_at: new Date(Date.now() - 12 * 864e5).toISOString(), student_name: 'أمين الرامي', student_avatar: null },
  { id: 'd3', rating: 4, comment: null,
    created_at: new Date(Date.now() - 26 * 864e5).toISOString(), student_name: 'سلمى بركة', student_avatar: null },
]

const DEMO_BREAKDOWN: Record<string, number> = { '5': 2, '4': 1 }

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} من 5`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={size}
          className={n <= Math.round(value) ? 'text-amber-500' : 'text-[#D6D3D1]'}
          fill={n <= Math.round(value) ? 'currentColor' : 'none'}
        />
      ))}
    </span>
  )
}

function fromNow(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5)
  if (days <= 0) return 'اليوم'
  if (days === 1) return 'أمس'
  if (days < 30) return `قبل ${days} يوماً`
  const months = Math.floor(days / 30)
  if (months < 12) return `قبل ${months} ${months === 1 ? 'شهر' : 'أشهر'}`
  return `قبل ${Math.floor(months / 12)} سنة`
}

export default function TeacherReviewsPage() {
  const teacher = useTeacher()
  const [full, setFull]       = useState<TeacherProfileFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [demo, setDemo]       = useState(false)

  useEffect(() => {
    let alive = true
    if (isTeacherDemo()) { setDemo(true); setLoading(false); return }
    ;(async () => {
      const f = await fetchTeacherProfileFull(teacher.id)
      if (!alive) return
      setFull(f); setLoading(false)
    })()
    return () => { alive = false }
  }, [teacher.id])

  const testimonials = demo ? DEMO_TESTIMONIALS : (full?.testimonials ?? [])
  const breakdown    = demo ? DEMO_BREAKDOWN    : (full?.rating_breakdown ?? {})

  const total = useMemo(
    () => Object.values(breakdown).reduce((a, b) => a + b, 0),
    [breakdown],
  )

  const avg = useMemo(() => {
    if (demo) return 4.7
    if (full?.stats.rating_avg) return Number(full.stats.rating_avg)
    if (total === 0) return 0
    const sum = Object.entries(breakdown).reduce((a, [k, n]) => a + Number(k) * n, 0)
    return Math.round((sum / total) * 10) / 10
  }, [demo, full, breakdown, total])

  const topRated = demo ? true : Boolean(full?.stats.is_top_rated)
  const withComment = testimonials.filter(t => t.comment && t.comment.trim())

  if (loading) {
    return (
      <div className="py-40 flex items-center justify-center gap-3 text-[#A8A29E]">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-[13px] font-medium">جاري تحميل تقييماتك…</span>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {demo && (
        <Rise>
          <div className="flex items-center gap-2.5 rounded-2xl bg-fuchsia-50 ring-1 ring-fuchsia-200 px-4 py-2.5">
            <Info size={15} className="text-fuchsia-600 shrink-0" />
            <span className="text-[12.5px] font-medium text-fuchsia-800">معاينة ببيانات وهمية — لا شيء هنا حقيقي.</span>
            <a href="?demo=0" className="mr-auto text-[12px] font-bold text-fuchsia-700 hover:text-[#1C1917] transition-colors">إيقاف</a>
          </div>
        </Rise>
      )}

      {/* ═══ The score, and how it was reached ═══ */}
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-4 items-stretch [&>*]:min-w-0">

        <Rise>
          <Panel glow="amber" className="p-6 sm:p-7 h-full flex flex-col justify-center text-center">
            {topRated && (
              <div className="flex justify-center mb-4">
                <Chip tone="warn"><Trophy size={11} /> من الأفضل تقييماً</Chip>
              </div>
            )}
            <div className="text-[56px] font-bold tracking-tight leading-none">
              <Count value={avg} decimals={1}
                     className="bg-gradient-to-l from-[#F59E0B] to-[#B45309] bg-clip-text text-transparent" />
            </div>
            <div className="mt-3 flex justify-center">
              <Stars value={avg} size={18} />
            </div>
            <p className="text-[#78716C] text-[13px] font-medium mt-3">
              {total > 0
                ? <>من <span className="text-[#1C1917] font-semibold">{total}</span> {total === 1 ? 'تقييم' : 'تقييماً'}</>
                : 'لا تقييمات بعد'}
            </p>
          </Panel>
        </Rise>

        <Rise i={1}>
          <Panel className="p-5 sm:p-6 h-full">
            <Head icon={Star} grad="amber" title="توزيع التقييمات"
                  note={total > 0 ? 'كم نجمة أعطى كل طالب' : 'سيظهر التوزيع بعد أول تقييم'} />
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(n => {
                const count = breakdown[String(n)] ?? 0
                const pct = total > 0 ? (count / total) * 100 : 0
                return (
                  <div key={n} className="flex items-center gap-3">
                    <div className="w-9 shrink-0 flex items-center gap-1 text-[12px] font-bold text-[#57534E] tabular-nums">
                      {n} <Star size={11} className="text-amber-500" fill="currentColor" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Bar pct={pct} grad="amber" height={8} />
                    </div>
                    <div className="w-8 shrink-0 text-left text-[12px] font-bold tabular-nums text-[#78716C]">
                      {count || '—'}
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>
        </Rise>
      </div>

      {/* ═══ What they wrote ═══ */}
      <Rise>
        <Panel className="p-5 sm:p-6">
          <Head icon={MessageSquareQuote} grad="violet" title="ما كتبه طلابك"
                note={withComment.length > 0 ? `${withComment.length} تعليقاً` : undefined} />

          {testimonials.length === 0 ? (
            <div className="py-14 text-center">
              <span className="inline-flex w-14 h-14 rounded-2xl bg-[#F6F4EF] items-center justify-center mb-4">
                <Users size={24} className="text-[#C7C2BA]" />
              </span>
              <p className="text-[14px] font-semibold text-[#57534E]">لا تقييمات بعد</p>
              <p className="text-[12px] text-[#A8A29E] mt-1.5 max-w-sm mx-auto leading-relaxed">
                يظهر هنا رأي كل طالب بمجرد أن يقيّمك من فضائه. التقييم اختياري، ولا يمكنك طلبه أو تعديله —
                وهذا ما يجعله ذا قيمة.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {testimonials.map((t, i) => (
                <Rise key={t.id} i={Math.min(i, 4)}>
                  <div className="flex gap-3.5 p-4 rounded-2xl bg-[#FBFAF7] ring-1 ring-[#E7E2D8]">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#F1EDE4] shrink-0 flex items-center justify-center">
                      {t.student_avatar
                        ? <img src={t.student_avatar} alt="" className="w-full h-full object-cover" />
                        : <span className="text-[14px] font-bold text-[#78716C]">
                            {(t.student_name ?? '؟').slice(0, 1)}
                          </span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[13.5px] text-[#1C1917] truncate">
                          {t.student_name ?? 'طالب'}
                        </span>
                        <Stars value={t.rating} size={12} />
                        <span className="text-[11px] text-[#A8A29E] font-medium mr-auto shrink-0">
                          {fromNow(t.created_at)}
                        </span>
                      </div>
                      {t.comment && t.comment.trim() ? (
                        <p className="text-[13px] text-[#57534E] leading-relaxed mt-2 whitespace-pre-wrap">
                          {t.comment}
                        </p>
                      ) : (
                        <p className="text-[12px] text-[#C7C2BA] font-medium mt-2">قيّم دون تعليق.</p>
                      )}
                    </div>
                  </div>
                </Rise>
              ))}
            </div>
          )}
        </Panel>
      </Rise>

      <Rise>
        <div className="flex items-start gap-2.5 rounded-2xl bg-[#FBFAF7] ring-1 ring-[#E7E2D8] px-4 py-3">
          <Info size={15} className="text-[#78716C] shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-[#78716C] font-medium leading-relaxed">
            التقييمات تُحتسب تلقائياً ولا يمكن لأي أستاذ تعديل نتيجته. إن رأيت تقييماً مخالفاً، تواصل مع المكتب.
          </p>
        </div>
      </Rise>
    </div>
  )
}
