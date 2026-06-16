// Per-course visual identity. The student portal re-skins itself to the course
// the student is currently inside, so a multi-course student instantly sees a
// different look per course (and never confuses A0-A1 with A1-A2). Palettes are
// chosen by CEFR level; add more as new courses launch.
export interface CourseTheme {
  key: string
  dark: string       // header + dark panels
  dark2: string      // dark gradient mid  (was #3a2817)
  dark3: string      // dark gradient end  (was #5a3d1f)
  cream: string      // page background
  gold: string       // primary accent
  goldSoft: string   // soft accent background
  grad: [string, string]   // gold gradient (light → deep)
  emoji: string
}

const THEMES: Record<string, CourseTheme> = {
  a0a1:       { key: 'a0a1',       dark: '#2a1d12', dark2: '#3a2817', dark3: '#5a3d1f', cream: '#faf6ef', gold: '#facc15', goldSoft: '#fef9c3', grad: ['#fcd34d', '#f59e0b'], emoji: '🌱' },
  a1a2:       { key: 'a1a2',       dark: '#0f2e2a', dark2: '#15433b', dark3: '#1c5a4e', cream: '#ecfdf5', gold: '#10b981', goldSoft: '#d1fae5', grad: ['#34d399', '#059669'], emoji: '🌿' },
  a2b1:       { key: 'a2b1',       dark: '#1e1b3a', dark2: '#2b2553', dark3: '#3b327a', cream: '#f5f3ff', gold: '#7c3aed', goldSoft: '#ede9fe', grad: ['#a78bfa', '#7c3aed'], emoji: '🚀' },
  b1b2:       { key: 'b1b2',       dark: '#0f2440', dark2: '#163454', dark3: '#1d4470', cream: '#eff6ff', gold: '#0284c7', goldSoft: '#dbeafe', grad: ['#38bdf8', '#0284c7'], emoji: '🏆' },
  business:   { key: 'business',   dark: '#08323a', dark2: '#0b4651', dark3: '#0f5c6b', cream: '#ecfeff', gold: '#06b6d4', goldSoft: '#cffafe', grad: ['#22d3ee', '#0891b2'], emoji: '💼' },
  travel:     { key: 'travel',     dark: '#36210f', dark2: '#4a2c13', dark3: '#663c19', cream: '#fff7ed', gold: '#f97316', goldSoft: '#ffedd5', grad: ['#fb923c', '#ea580c'], emoji: '✈️' },
  individual: { key: 'individual', dark: '#3a0f1f', dark2: '#52162b', dark3: '#741f3d', cream: '#fff1f2', gold: '#f43f5e', goldSoft: '#ffe4e6', grad: ['#fb7185', '#e11d48'], emoji: '🎯' },
}
export const DEFAULT_THEME = THEMES.a0a1

/** Look a palette up by its key (used by the static promo catalogue, which already
 *  knows which theme each card wants). Falls back to the default. */
export function themeForKey(key?: string | null): CourseTheme {
  return (key && THEMES[key]) ? THEMES[key] : DEFAULT_THEME
}

/** Pick a palette from the course's level/title (CEFR tokens, plus named courses
 *  whose title has no explicit level — business / travel / 1:1). */
export function courseTheme(course?: { title?: string | null; level?: string | null } | null): CourseTheme {
  const hay = `${course?.level ?? ''} ${course?.title ?? ''}`.toUpperCase().replace(/\s+/g, '')
  if (/BUSINESS|المهني|الأعمال|MEHANI/.test(hay)) return THEMES.business
  if (/TRAVEL|TRAVELLING|السفر|سفر|سياح/.test(hay)) return THEMES.travel
  if (/INDIVIDUAL|PRIVATE|1:1|فردي|الفردية|الحصص/.test(hay)) return THEMES.individual
  if (/A1-?A2|A1A2/.test(hay)) return THEMES.a1a2
  if (/A2-?B1|A2B1/.test(hay)) return THEMES.a2b1
  if (/B1-?B2|B1B2/.test(hay)) return THEMES.b1b2
  if (/A0-?A1|A0A1/.test(hay)) return THEMES.a0a1
  if (/REALLIFE|المواقف/.test(hay)) return THEMES.a1a2   // situational course → green
  return DEFAULT_THEME
}
