import { createClient } from '@supabase/supabase-js'
import { businessToday, casablancaWallTimeToIso } from './enrollment-metrics'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  throw new Error('Server-side Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
}

const supabaseAdmin = createClient(url, key, { auth: { persistSession: false } })

export interface TeacherPublicProfile {
  id: string
  name: string | null
  profile: {
    display_name: string | null
    headline: string | null
    bio: string | null
    avatar_url: string | null
    cover_url: string | null
    tagline: string | null
    english_level: string | null
    levels: string[]
    specialties: string[]
    languages: string[]
    competences: string[]
    liked_qualities: string[]
    certificates: { title: string; issuer?: string | null; year?: string | null }[]
    experiences: { role: string; org?: string | null; from?: string | null; to?: string | null; description?: string | null }[]
    teaches: string[]
    not_teaches: string[]
    age_min: number | null
    age_max: number | null
    years_experience: number | null
    /** Weekly windows the teacher set on /teacher/schedule. 0 = Sunday … 6 = Saturday. */
    availability: { day: number; from: string; to: string }[]
    hired_at: string | null
  }
  stats: {
    students_total: number
    classes_done: number
    hours_total: number
    exams_corrected: number
    rating_avg: number
    rating_count: number
    is_top_rated: boolean
    upcoming: number
  }
  rating_breakdown: Record<string, number>
  /** Published reviews that carry a comment, newest first. No student identity
   *  leaves the server — a public page quotes the words, not the person. */
  reviews?: { rating: number; comment: string; created_at: string }[]
}

export interface PublicTeacherCard {
  id: string
  name: string
  headline: string | null
  tagline: string | null
  avatar_url: string | null
  cover_url: string | null
  years_experience: number | null
  levels: string[]
  specialties: string[]
  languages: string[]
  rating_avg: number
  rating_count: number
}

/**
 * PostgREST returns a to-one embed as an object, but supabase-js types every
 * nested select as an array — so `teacher_profiles` reads as `any[]` even
 * though a row arrives. Normalise both shapes rather than assert one.
 */
type TeacherProfileRow = Record<string, any>

function oneOf(embed: unknown): TeacherProfileRow | null {
  if (!embed) return null
  const row = Array.isArray(embed) ? embed[0] : embed
  return row ? (row as TeacherProfileRow) : null
}

/** Directory fields only; never return private rates, WhatsApp, or student rows. */
export async function fetchPublicTeachers(): Promise<PublicTeacherCard[]> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(`id, full_name, teacher_profiles(
      is_active, display_name, headline, tagline, avatar_url, cover_url,
      years_experience, levels, specialties, languages, rating_avg, rating_count)`)
    .eq('role', 'teacher')

  if (error) {
    console.error('fetchPublicTeachers', error.message)
    return []
  }

  return (data ?? [])
    .map(row => {
      const profile = oneOf(row.teacher_profiles)
      if (!profile || profile.is_active === false) return null
      const name = profile.display_name || row.full_name
      if (!name) return null
      return {
        id: row.id,
        name,
        headline: profile.headline ?? null,
        tagline: profile.tagline ?? null,
        avatar_url: profile.avatar_url ?? null,
        cover_url: profile.cover_url ?? null,
        years_experience: profile.years_experience == null ? null : Number(profile.years_experience),
        levels: profile.levels ?? [],
        specialties: profile.specialties ?? [],
        languages: profile.languages ?? [],
        rating_avg: Number(profile.rating_avg ?? 0),
        rating_count: Number(profile.rating_count ?? 0),
      } satisfies PublicTeacherCard
    })
    .filter((row): row is PublicTeacherCard => row !== null)
    .sort((a, b) => b.rating_count - a.rating_count || b.rating_avg - a.rating_avg || a.name.localeCompare(b.name, 'ar'))
}

export async function fetchTeacherPublicProfile(teacherId: string): Promise<TeacherPublicProfile | null> {
  const studentIds = await getTeacherStudentIds(teacherId)

  const [{ data: profileData, error: profileError },
         { data: classRows },
         { count: upcomingCount },
         { count: examsCount },
         { data: ratingsData }] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      // Named columns, not `*` — this runs on an anonymous page, and
      // teacher_profiles also holds whatsapp, pay_model and hourly_rate_mad.
      .select(`full_name, teacher_profiles(
        is_active, display_name, headline, bio, avatar_url, cover_url, tagline,
        english_level, levels, specialties, languages, competences, liked_qualities,
        certificates, experiences, teaches, not_teaches, age_min, age_max,
        years_experience, rating_avg, rating_count, availability, hired_at)`)
      .eq('id', teacherId)
      .single(),

    supabaseAdmin
      .from('class_sessions')
      .select('duration_min')
      .eq('teacher_id', teacherId)
      .eq('status', 'done'),

    supabaseAdmin
      .from('class_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('teacher_id', teacherId)
      .in('status', ['scheduled', 'live'])
      .gte('starts_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()),

    supabaseAdmin
      .from('lms_unit_exam_results')
      .select('id', { count: 'exact', head: true })
      .in('student_id', studentIds),

    supabaseAdmin
      .from('teacher_reviews')
      .select('rating, comment, created_at')
      .eq('teacher_id', teacherId)
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
  ])

  const profile = oneOf(profileData?.teacher_profiles)
  // A deactivated teacher keeps their row but loses the public page.
  if (profileError || !profile || profile.is_active === false) {
    return null
  }
  const ratings: Array<{ rating: number | null; comment: string | null; created_at: string }> = ratingsData ?? []
  const breakdown: Record<string, number> = {}
  ratings.forEach(({ rating }) => {
    const key = String(rating ?? 0)
    breakdown[key] = (breakdown[key] ?? 0) + 1
  })

  const hoursTotal = classRows?.reduce((sum, row) => sum + Number(row.duration_min ?? 0), 0) ?? 0

  return {
    id: teacherId,
    name: profile.display_name || profileData.full_name || null,
    profile: {
      display_name: profile.display_name,
      headline: profile.headline,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      cover_url: profile.cover_url,
      tagline: profile.tagline,
      english_level: profile.english_level,
      levels: profile.levels ?? [],
      specialties: profile.specialties ?? [],
      languages: profile.languages ?? [],
      competences: profile.competences ?? [],
      liked_qualities: profile.liked_qualities ?? [],
      certificates: profile.certificates ?? [],
      experiences: profile.experiences ?? [],
      teaches: profile.teaches ?? [],
      not_teaches: profile.not_teaches ?? [],
      age_min: profile.age_min,
      age_max: profile.age_max,
      years_experience: profile.years_experience,
      availability: Array.isArray(profile.availability) ? profile.availability : [],
      hired_at: profile.hired_at ?? null,
    },
    stats: {
      students_total: studentIds.length,
      classes_done: classRows?.length ?? 0,
      hours_total: Math.round((hoursTotal / 60) * 10) / 10,
      exams_corrected: Number(examsCount ?? 0),
      rating_avg: Number(profile.rating_avg ?? 0),
      rating_count: Number(profile.rating_count ?? 0),
      is_top_rated: Boolean(profile.rating_avg >= 4.5 && profile.rating_count >= 5),
      upcoming: Number(upcomingCount ?? 0),
    },
    rating_breakdown: breakdown,
    reviews: ratings
      .filter(r => r.rating != null && r.comment && r.comment.trim())
      .slice(0, 6)
      .map(r => ({ rating: Number(r.rating), comment: (r.comment as string).trim(), created_at: r.created_at })),
  }
}

async function getTeacherStudentIds(teacherId: string): Promise<string[]> {
  const [assigned, seated] = await Promise.all([
    supabaseAdmin.from('teacher_students')
      .select('student_id, crm_students!inner(deleted_at)')
      .eq('teacher_id', teacherId)
      .eq('is_active', true)
      .is('crm_students.deleted_at', null),
    supabaseAdmin.from('online_class_enrollments')
      .select('student_id, online_classes!inner(teacher_id, archived_at), crm_students!inner(deleted_at)')
      .eq('online_classes.teacher_id', teacherId)
      .is('online_classes.archived_at', null)
      .eq('status', 'active')
      .is('crm_students.deleted_at', null),
  ])

  if (assigned.error) console.error('teacher public assigned roster', assigned.error.message)
  if (seated.error) console.error('teacher public class roster', seated.error.message)
  return [...new Set([...(assigned.data ?? []), ...(seated.data ?? [])].map(row => row.student_id))]
}

/* ── Public leaderboard ─────────────────────────────────────────────────── */

export interface PublicLeaderboardRow {
  id: string; name: string; avatar_url: string | null; headline: string | null
  rating_avg: number; rating_count: number; is_top_rated: boolean
  students: number; live: number; sessions_month: number; score: number; rank: number
}

/**
 * The public face of the teachers' leaderboard (teacher_leaderboard, 053):
 * same roster rule, same score — 10 per session delivered this month + 5 per
 * current student + 20 × rating once a teacher has 3 reviews — and the same
 * top-rated rule as the profile page. Built here with the service role because
 * visitors are anonymous; it returns counts and ratings only, never money,
 * names of students, or anything from crm_* beyond a head count.
 */
export async function fetchPublicLeaderboard(teachers: PublicTeacherCard[]): Promise<PublicLeaderboardRow[]> {
  if (teachers.length === 0) return []
  const today = businessToday()
  const monthStart = casablancaWallTimeToIso(`${today.slice(0, 8)}01`, '00:00')
  const ids = teachers.map(t => t.id)

  const [{ data: sessions, error: sErr }, rosters] = await Promise.all([
    supabaseAdmin.from('class_sessions').select('teacher_id')
      .in('teacher_id', ids).eq('status', 'done').gte('starts_at', monthStart),
    Promise.all(ids.map(id => getTeacherStudentIds(id))),
  ])
  if (sErr) console.error('public leaderboard sessions', sErr.message)

  const allStudents = [...new Set(rosters.flat())]
  const { data: online } = allStudents.length
    ? await supabaseAdmin.from('student_presence').select('student_id')
        .in('student_id', allStudents).gte('last_seen_at', new Date(Date.now() - 15 * 60_000).toISOString())
    : { data: [] as { student_id: string }[] }
  const onlineSet = new Set((online ?? []).map(r => r.student_id))

  const rows = teachers.map((t, i) => {
    const roster = rosters[i]
    const sessions_month = (sessions ?? []).filter(s => s.teacher_id === t.id).length
    const score = sessions_month * 10 + roster.length * 5 + (t.rating_count >= 3 ? Math.round(t.rating_avg * 20) : 0)
    return {
      id: t.id, name: t.name, avatar_url: t.avatar_url, headline: t.tagline || t.headline,
      rating_avg: t.rating_avg, rating_count: t.rating_count,
      is_top_rated: t.rating_avg >= 4.5 && t.rating_count >= 5,
      students: roster.length, live: roster.filter(id => onlineSet.has(id)).length,
      sessions_month, score, rank: 0,
    }
  }).sort((a, b) => b.score - a.score || b.rating_avg - a.rating_avg || b.students - a.students)

  // Standard competition ranking: ties share a rank, the next rank skips.
  rows.forEach((r, i) => {
    const prev = rows[i - 1]
    r.rank = prev && prev.score === r.score && prev.rating_avg === r.rating_avg && prev.students === r.students ? prev.rank : i + 1
  })
  return rows
}