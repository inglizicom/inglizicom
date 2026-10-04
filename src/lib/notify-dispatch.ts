import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { pushConfigured, sendOne, type SubRow } from '@/lib/push-server'
import type { PushPayload } from '@/lib/push'

/**
 * Deliver the push queue (062): every notification created in the last day
 * that has not been pushed yet — staff/teacher ones to their profile's
 * devices, student ones to the student's devices. Claiming marks them pushed
 * first, so two runs never send the same notification twice. Dead endpoints
 * are pruned. Called by /api/notifications/dispatch (database trigger, the
 * sender's screen) and the daily cron.
 */

interface ProfileItem { id: string; recipient: string; kind: string; title: string; body: string | null; url: string | null }
interface StudentItem { id: string; student_id: string; type: string; title: string; body: string | null; tab: string | null }

export async function flushPushQueue(db: SupabaseClient): Promise<{ claimed: number; sent: number; pruned: number }> {
  const { data, error } = await db.rpc('notifications_claim_push', { p_limit: 300 })
  if (error) throw new Error(error.message)
  const profiles = (data?.profiles ?? []) as ProfileItem[]
  const students = (data?.students ?? []) as StudentItem[]
  const claimed = profiles.length + students.length
  if (!claimed || !pushConfigured()) return { claimed, sent: 0, pruned: 0 }

  const subsBy = async (col: 'profile_id' | 'student_id', ids: string[]) => {
    const map = new Map<string, SubRow[]>()
    if (!ids.length) return map
    const { data: rows } = await db.from('push_subscriptions').select(`id, endpoint, p256dh, auth, ${col}`).in(col, ids)
    for (const r of (rows ?? []) as any[]) {
      const k = r[col] as string
      map.set(k, [...(map.get(k) ?? []), r as SubRow])
    }
    return map
  }
  const byProfile = await subsBy('profile_id', Array.from(new Set(profiles.map(p => p.recipient))))
  const byStudent = await subsBy('student_id', Array.from(new Set(students.map(s => s.student_id))))

  const jobs: { sub: SubRow; payload: PushPayload }[] = []
  for (const n of profiles) for (const sub of byProfile.get(n.recipient) ?? [])
    jobs.push({ sub, payload: { title: n.title, body: n.body ?? '', url: n.url || '/', tag: `n-${n.id}` } })
  for (const n of students) for (const sub of byStudent.get(n.student_id) ?? [])
    jobs.push({ sub, payload: { title: n.title, body: n.body ?? '', url: `/student-space${n.tab ? `#${n.tab}` : ''}`, tag: `n-${n.id}` } })

  let sent = 0
  const dead = new Set<string>()
  let i = 0
  await Promise.all(Array.from({ length: Math.min(12, jobs.length) }, async () => {
    while (i < jobs.length) {
      const j = jobs[i++]
      if (dead.has(j.sub.id)) continue
      const r = await sendOne(j.sub, j.payload)
      if (r === 'ok') sent++
      else if (r === 'gone') dead.add(j.sub.id)
    }
  }))
  if (dead.size) await db.from('push_subscriptions').delete().in('id', Array.from(dead))
  return { claimed, sent, pruned: dead.size }
}
