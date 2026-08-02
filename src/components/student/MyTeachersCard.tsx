'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2, Star } from 'lucide-react'
import { fetchMyTeachers, submitTeacherReview, type StudentTeacherCard } from '@/lib/teachers'

/**
 * "أساتذتي" — the student's view of who teaches them, and the only place a
 * teacher rating can be written. The RPC underneath refuses a review from a
 * student the teacher doesn't actually hold, so ratings can't be stuffed.
 */
export default function MyTeachersCard({ token }: { token: string }) {
  const [teachers, setTeachers] = useState<StudentTeacherCard[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    let alive = true
    fetchMyTeachers(token).then(t => { if (alive) { setTeachers(t); setLoading(false) } })
    return () => { alive = false }
  }, [token])

  if (loading || teachers.length === 0) return null

  return (
    <div className="lg:col-span-3 bg-white border border-zinc-200 rounded-2xl p-4">
      <div className="text-[13px] font-black text-zinc-800 mb-3">أساتذتي 👩‍🏫</div>
      <div className="grid sm:grid-cols-2 gap-3">
        {teachers.map(t => <TeacherRow key={t.id} teacher={t} token={token} />)}
      </div>
    </div>
  )
}

function TeacherRow({ teacher, token }: { teacher: StudentTeacherCard; token: string }) {
  const [rating, setRating] = useState(teacher.my_rating ?? 0)
  const [hover,  setHover]  = useState(0)
  const [comment, setComment] = useState('')
  const [open,   setOpen]   = useState(false)
  const [busy,   setBusy]   = useState(false)
  const [done,   setDone]   = useState(!!teacher.my_rating)
  const [error,  setError]  = useState<string | null>(null)

  const name = teacher.display_name ?? 'أستاذ'

  async function send(stars: number) {
    setRating(stars)
    setOpen(true)
    setError(null)
  }

  async function confirm() {
    if (rating < 1) return
    setBusy(true); setError(null)
    const res = await submitTeacherReview(token, teacher.id, rating, comment.trim() || undefined)
    setBusy(false)
    if (!res.ok) { setError(res.error ?? 'تعذّر إرسال التقييم.'); return }
    setDone(true); setOpen(false)
  }

  return (
    <div className="border border-zinc-200 rounded-xl p-3.5">
      <div className="flex items-center gap-3">
        {teacher.avatar_url
          ? /* eslint-disable-next-line @next/next/no-img-element */
            <img src={teacher.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover border border-zinc-200 flex-shrink-0" />
          : <div className="w-11 h-11 rounded-full bg-zinc-900 text-[var(--ic-gold,#facc15)] flex items-center justify-center font-black flex-shrink-0">
              {name.trim().charAt(0)}
            </div>}
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-black text-zinc-800 truncate">{name}</div>
          {teacher.headline && (
            <div className="text-[11px] text-zinc-400 font-semibold truncate">{teacher.headline}</div>
          )}
          {!!teacher.rating_count && (
            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-amber-600 font-bold">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              {Number(teacher.rating_avg ?? 0).toFixed(1)}
              <span className="text-zinc-400">({teacher.rating_count})</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-zinc-100">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11.5px] font-bold text-zinc-500">
            {done ? 'شكراً على تقييمك' : 'كيف تجد حصصه؟'}
          </span>
          <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map(i => (
              <button
                key={i}
                onClick={() => send(i)}
                onMouseEnter={() => setHover(i)}
                aria-label={`${i} من 5`}
                className="p-0.5"
              >
                <Star
                  size={17}
                  className={i <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}
                />
              </button>
            ))}
          </div>
        </div>

        {open && (
          <div className="mt-2.5 space-y-2">
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={2}
              placeholder="اكتب رأيك (اختياري)"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-[12.5px] font-semibold
                         focus:outline-none focus:border-zinc-800 transition"
            />
            {error && <div className="text-[11.5px] font-bold text-red-600">{error}</div>}
            <div className="flex gap-2">
              <button
                onClick={confirm} disabled={busy}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 text-white text-[12px] font-black hover:bg-zinc-800 transition disabled:opacity-50"
              >
                {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} إرسال
              </button>
              <button onClick={() => setOpen(false)} className="text-[12px] font-bold text-zinc-400 hover:text-zinc-600">
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
