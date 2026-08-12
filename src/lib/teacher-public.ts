import { createClient } from '@supabase/supabase-js'

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

export async function fetchTeacherPublicProfile(teacherId: string): Promise<TeacherPublicProfile | null> {
  const studentIds = await getTeacherStudentIds(teacherId)

  const [{ data: profileData, error: profileError },
         { count: activeStudentCount },
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
        years_experience, rating_avg, rating_count)`)
      .eq('id', teacherId)
      .single(),

    supabaseAdmin
      .from('teacher_students')
      .select('id', { count: 'exact', head: true })
      .eq('teacher_id', teacherId)
      .eq('is_active', true),

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
      .select('rating')
      .eq('teacher_id', teacherId)
      .eq('is_published', true),
  ])

  const profile = oneOf(profileData?.teacher_profiles)
  // A deactivated teacher keeps their row but loses the public page.
  if (profileError || !profile || profile.is_active === false) {
    return null
  }
  const ratings: Array<{ rating: number | null }> = ratingsData ?? []
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
    },
    stats: {
      students_total: Number(activeStudentCount ?? 0),
      classes_done: classRows?.length ?? 0,
      hours_total: Math.round((hoursTotal / 60) * 10) / 10,
      exams_corrected: Number(examsCount ?? 0),
      rating_avg: Number(profile.rating_avg ?? 0),
      rating_count: Number(profile.rating_count ?? 0),
      is_top_rated: Boolean(profile.rating_avg >= 4.5 && profile.rating_count >= 5),
      upcoming: Number(upcomingCount ?? 0),
    },
    rating_breakdown: breakdown,
  }
}

async function getTeacherStudentIds(teacherId: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('teacher_students')
    .select('student_id')
    .eq('teacher_id', teacherId)
    .eq('is_active', true)

  if (error || !data) return []
  return data.map(row => row.student_id)
}
