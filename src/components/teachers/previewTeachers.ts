import type { PublicLeaderboardRow, PublicTeacherCard } from '@/lib/teacher-public'

/**
 * Sample teachers for local design review ONLY.
 *
 * The teachers page adds these when NODE_ENV is 'development' (`npm run dev`),
 * so the directory and the leaderboard can be judged with a few faces in them.
 * A production build (Vercel, `next build`) never includes them — only real
 * teachers appear there. Every sample links to the demo profile page.
 */

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&h=400&q=80`

const SAMPLES: (PublicTeacherCard & { students: number; live: number; sessions_month: number })[] = [
  { id: 'preview-1', name: 'ريم الكتاني', headline: 'المحادثة وإنجليزية الأعمال', tagline: 'تحدث بثقة أكبر، خطوة عملية في كل حصة.',
    avatar_url: photo('photo-1580489944761-15a19d654956'), cover_url: null, years_experience: 6,
    levels: ['A2', 'B1', 'B2'], specialties: ['المحادثة', 'إنجليزية الأعمال'], languages: ['العربية', 'الإنجليزية'],
    rating_avg: 4.9, rating_count: 26, students: 38, live: 5, sessions_month: 31 },
  { id: 'preview-2', name: 'ياسين المرابط', headline: 'تحضير IELTS والكتابة الأكاديمية', tagline: 'من Band 5.5 إلى 7 بخطة واضحة.',
    avatar_url: photo('photo-1507003211169-0a1dd7228f2d'), cover_url: null, years_experience: 8,
    levels: ['B1', 'B2', 'C1'], specialties: ['IELTS', 'الكتابة'], languages: ['العربية', 'الإنجليزية', 'الفرنسية'],
    rating_avg: 4.7, rating_count: 18, students: 29, live: 3, sessions_month: 27 },
  { id: 'preview-3', name: 'سلمى بنعلي', headline: 'المبتدئون والنطق', tagline: 'نبدأ من الصفر ونتكلم من أول حصة.',
    avatar_url: photo('photo-1494790108377-be9c29b29330'), cover_url: null, years_experience: 4,
    levels: ['A0', 'A1', 'A2'], specialties: ['النطق', 'المبتدئون'], languages: ['العربية', 'الإنجليزية'],
    rating_avg: 4.6, rating_count: 9, students: 22, live: 2, sessions_month: 19 },
]

export const PREVIEW_TEACHERS: PublicTeacherCard[] = SAMPLES.map(({ students, live, sessions_month, ...card }) => card)

export const PREVIEW_LEADERBOARD: Omit<PublicLeaderboardRow, 'rank'>[] = SAMPLES.map(s => ({
  id: s.id, name: s.name, avatar_url: s.avatar_url, headline: s.tagline || s.headline,
  rating_avg: s.rating_avg, rating_count: s.rating_count, is_top_rated: s.rating_avg >= 4.5 && s.rating_count >= 5,
  students: s.students, live: s.live, sessions_month: s.sessions_month,
  score: s.sessions_month * 10 + s.students * 5 + (s.rating_count >= 3 ? Math.round(s.rating_avg * 20) : 0),
}))

/** Real profile ids link to their page; samples link to the demo profile. */
export const profileHref = (id: string) => `/teacher-showcase/${id.startsWith('preview-') ? 'demo' : id}`
