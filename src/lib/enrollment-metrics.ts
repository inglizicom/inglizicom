/**
 * Enrollment analytics — ranges, comparisons and the counting rules.
 *
 * Pure functions only (no Supabase), so the same code drives the UI and the
 * unit tests. The SQL that does the counting lives in
 * supabase/migrations/048_enrollment_analytics.sql; COUNTING_RULES below is the
 * human-readable copy shown in the analytics page — keep the two in step.
 *
 * Every date here is a Morocco calendar day ('YYYY-MM-DD' in Africa/Casablanca),
 * the same clock the revenue functions use (029_revenue_local_timezone.sql).
 * The database turns a day into instants, so DST and Ramadan offsets are
 * handled by Postgres' timezone data, not by browser maths.
 */

export const BUSINESS_TZ = 'Africa/Casablanca'

export type RangePreset = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom'
export type Bucket = 'day' | 'week' | 'month'

export interface DateRange {
  preset: RangePreset
  /** First day, inclusive. null = since the first record. */
  from: string | null
  /** Last day, inclusive. */
  to: string
}

export const PRESET_LABELS: Record<RangePreset, string> = {
  today:  'اليوم',
  week:   'هذا الأسبوع',
  month:  'هذا الشهر',
  year:   'هذا العام',
  all:    'كل الأوقات',
  custom: 'فترة مخصّصة',
}

/* ── Calendar days, without time zones ─────────────────── */

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/

export function isDay(s: unknown): s is string {
  if (typeof s !== 'string' || !DAY_RE.test(s)) return false
  const d = new Date(`${s}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}

/** Today's date on the Morocco business clock. */
export function businessToday(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now)
}

function toUtc(day: string): Date { return new Date(`${day}T00:00:00Z`) }
function fromUtc(d: Date): string { return d.toISOString().slice(0, 10) }

export function addDays(day: string, n: number): string {
  const d = toUtc(day); d.setUTCDate(d.getUTCDate() + n); return fromUtc(d)
}

/** Whole days from `a` to `b`, inclusive of both (a ≤ b → ≥ 1). */
export function daysInclusive(a: string, b: string): number {
  return Math.round((toUtc(b).getTime() - toUtc(a).getTime()) / 86_400_000) + 1
}

/** Monday of the ISO week containing `day` (same as Postgres date_trunc('week')). */
export function startOfWeek(day: string): string {
  const d = toUtc(day)
  const dow = (d.getUTCDay() + 6) % 7          // Monday = 0
  return addDays(day, -dow)
}
export function startOfMonth(day: string): string { return `${day.slice(0, 7)}-01` }
export function startOfYear(day: string): string { return `${day.slice(0, 4)}-01-01` }

function lastDayOfMonth(year: number, month0: number): number {
  return new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate()
}

/** Same calendar position one month earlier, clipped (Mar 31 → Feb 28/29). */
export function minusOneMonth(day: string): string {
  const [y, m, d] = day.split('-').map(Number)
  const y2 = m === 1 ? y - 1 : y
  const m0 = m === 1 ? 11 : m - 2
  const dd = Math.min(d, lastDayOfMonth(y2, m0))
  return `${y2}-${String(m0 + 1).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
}
export function minusOneYear(day: string): string {
  const [y, m, d] = day.split('-').map(Number)
  const dd = Math.min(d, lastDayOfMonth(y - 1, m - 1))
  return `${y - 1}-${String(m).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
}

/**
 * A Morocco wall-clock time ("2026-10-05", "18:00") as an absolute ISO instant,
 * whatever time zone the browser is in. Uses the platform's tz data, so the
 * Ramadan switch to UTC+0 is respected.
 */
export function casablancaWallTimeToIso(day: string, time: string): string {
  const [y, m, d] = day.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const wall = Date.UTC(y, m - 1, d, hh, mm)
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TZ, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  })
  let guess = wall
  for (let i = 0; i < 3; i++) {
    const parts = Object.fromEntries(fmt.formatToParts(new Date(guess)).map(p => [p.type, p.value]))
    const seen = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute)
    const next = guess + (wall - seen)
    if (next === guess) break
    guess = next
  }
  return new Date(guess).toISOString()
}

/** Every date from `from` to `to` (inclusive) whose ISO weekday (Mon = 1 … Sun = 7) is in `weekdays`. */
export function datesOnWeekdays(from: string, to: string, weekdays: number[], limit = 120): string[] {
  const out: string[] = []
  if (!isDay(from) || !isDay(to) || from > to || weekdays.length === 0) return out
  for (let d = from; d <= to && out.length < limit; d = addDays(d, 1)) {
    const iso = ((toUtc(d).getUTCDay() + 6) % 7) + 1
    if (weekdays.includes(iso)) out.push(d)
  }
  return out
}

/* ── Ranges ────────────────────────────────────────────── */

/**
 * The range a preset stands for, as of `today`. Calendar presets run from the
 * start of the period to today ("to date"); future days hold no records.
 */
export function presetRange(preset: Exclude<RangePreset, 'custom'>, today: string): DateRange {
  switch (preset) {
    case 'today': return { preset, from: today, to: today }
    case 'week':  return { preset, from: startOfWeek(today), to: today }
    case 'month': return { preset, from: startOfMonth(today), to: today }
    case 'year':  return { preset, from: startOfYear(today), to: today }
    case 'all':   return { preset, from: null, to: today }
  }
}

export function customRange(from: string, to: string): DateRange {
  if (!isDay(from) || !isDay(to)) throw new Error('Dates must be YYYY-MM-DD')
  return from <= to ? { preset: 'custom', from, to } : { preset: 'custom', from: to, to: from }
}

/**
 * The period a range is compared against.
 *   today        → yesterday
 *   week / month / year (to date) → the same span of the previous week / month /
 *                  year (e.g. 1–15 Oct vs 1–15 Sep), so partial periods compare fairly
 *   custom       → the equal-length period immediately before
 *   all          → nothing to compare with
 */
export function previousRange(r: DateRange): DateRange | null {
  if (r.from == null || r.preset === 'all') return null
  switch (r.preset) {
    case 'today': { const y = addDays(r.to, -1); return { preset: 'custom', from: y, to: y } }
    case 'week':  return { preset: 'custom', from: addDays(r.from, -7), to: addDays(r.to, -7) }
    case 'month': {
      const from = minusOneMonth(r.from)
      // to = same day-of-month last month, clipped, never before `from`
      return { preset: 'custom', from, to: minusOneMonth(r.to) }
    }
    case 'year':  return { preset: 'custom', from: minusOneYear(r.from), to: minusOneYear(r.to) }
    case 'custom': {
      const len = daysInclusive(r.from, r.to)
      const to = addDays(r.from, -1)
      return { preset: 'custom', from: addDays(to, -(len - 1)), to }
    }
  }
}

/** Trend granularity: daily up to a month, weekly up to ~6 months, then monthly. */
export function bucketFor(r: DateRange): Bucket {
  if (r.from == null) return 'month'
  const n = daysInclusive(r.from, r.to)
  if (n <= 31) return 'day'
  if (n <= 183) return 'week'
  return 'month'
}

/* ── Filters + URL query parameters ────────────────────── */

export type EnrollmentStatusFilter = 'active' | 'waitlisted' | 'completed' | 'cancelled'

export interface AnalyticsFilters {
  course_id?:  string
  class_id?:   string
  teacher_id?: string
  mode?:       'group' | 'private'
  status?:     EnrollmentStatusFilter
}

export interface AnalyticsQuery { range: DateRange; filters: AnalyticsFilters }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const STATUSES: EnrollmentStatusFilter[] = ['active', 'waitlisted', 'completed', 'cancelled']

/** Read the page state from `?range=…&from=…&to=…&course=…`. Invalid values fall back to defaults. */
export function parseQuery(params: URLSearchParams | Record<string, string | undefined>, today: string): AnalyticsQuery {
  const get = (k: string): string | undefined =>
    params instanceof URLSearchParams ? params.get(k) ?? undefined : params[k]
  const preset = get('range') as RangePreset | undefined
  let range: DateRange
  if (preset === 'custom' && isDay(get('from')) && isDay(get('to'))) {
    range = customRange(get('from')!, get('to')!)
  } else if (preset && preset !== 'custom' && preset in PRESET_LABELS) {
    range = presetRange(preset, today)
  } else {
    range = presetRange('month', today)
  }
  const filters: AnalyticsFilters = {}
  const uuid = (k: string) => { const v = get(k); return v && UUID_RE.test(v) ? v : undefined }
  filters.course_id  = uuid('course')
  filters.class_id   = uuid('class')
  filters.teacher_id = uuid('teacher')
  const mode = get('mode'); if (mode === 'group' || mode === 'private') filters.mode = mode
  const status = get('status') as EnrollmentStatusFilter | undefined
  if (status && STATUSES.includes(status)) filters.status = status
  return { range, filters: stripEmpty(filters) }
}

/** The inverse of parseQuery — only non-default values are written. */
export function toQueryString(q: AnalyticsQuery): string {
  const p = new URLSearchParams()
  if (q.range.preset !== 'month') p.set('range', q.range.preset)
  if (q.range.preset === 'custom') { p.set('from', q.range.from ?? ''); p.set('to', q.range.to) }
  if (q.filters.course_id)  p.set('course', q.filters.course_id)
  if (q.filters.class_id)   p.set('class', q.filters.class_id)
  if (q.filters.teacher_id) p.set('teacher', q.filters.teacher_id)
  if (q.filters.mode)       p.set('mode', q.filters.mode)
  if (q.filters.status)     p.set('status', q.filters.status)
  return p.toString()
}

function stripEmpty<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== '')) as T
}

export function hasEntityFilters(f: AnalyticsFilters): boolean {
  return !!(f.course_id || f.class_id || f.teacher_id || f.mode || f.status)
}

/* ── Comparison ────────────────────────────────────────── */

/**
 * Percentage change. null when there is no meaningful percentage (nothing
 * before, something now) — the UI then says "جديد" instead of "+∞%".
 */
export function deltaPct(current: number, previous: number | null | undefined): number | null {
  if (previous == null) return null
  if (previous === 0) return current === 0 ? 0 : null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

/* ── Formatting ────────────────────────────────────────── */

const AR_DAY = new Intl.DateTimeFormat('ar-MA', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

export function formatDay(day: string): string { return AR_DAY.format(toUtc(day)) }

export function describeRange(r: DateRange): string {
  if (r.from == null) return `حتى ${formatDay(r.to)}`
  if (r.from === r.to) return formatDay(r.from)
  return `${formatDay(r.from)} – ${formatDay(r.to)}`
}

/* ── CSV ───────────────────────────────────────────────── */

export type CsvCell = string | number | boolean | null | undefined

function csvCell(v: CsvCell): string {
  if (v == null) return ''
  const s = String(v)
  // Quote anything with a delimiter, quote or newline; neutralise spreadsheet formulas.
  const safe = /^[=+\-@]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s) ? `'${s}` : s
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

/** RFC 4180 CSV with a UTF-8 BOM so Excel opens Arabic correctly. */
export function toCsv(rows: CsvCell[][]): string {
  return '﻿' + rows.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n'
}

/* ── Counting rules (shown in the UI) ──────────────────── */

export interface CountingRule { term: string; rule: string }

export const COUNTING_RULES: CountingRule[] = [
  { term: 'التوقيت',
    rule: 'كل التواريخ بتوقيت المغرب (Africa/Casablanca). الفترة تشمل اليوم الأول والأخير كاملين.' },
  { term: 'تسجيل في دورة',
    rule: 'صفّ في تسجيلات الدورات (نشط أو مكتمل) أو في سجلّها التاريخي (أُلغي بعد الحذف). يُؤرَّخ بتاريخ التسجيل.' },
  { term: 'تسجيل في قسم مباشر',
    rule: 'صفّ في تسجيلات الأقسام (نشط، قائمة انتظار، مكتمل، ملغى). يُؤرَّخ بتاريخ التسجيل.' },
  { term: 'طلاب فريدون',
    rule: 'يُحسب الطالب مرة واحدة حتى لو كان مسجّلًا في دورة وقسم معًا أو في أكثر من دورة.' },
  { term: 'نشط في نهاية الفترة',
    rule: 'تسجيل بدأ قبل نهاية الفترة ولم ينتهِ (ولم يكتمل) قبلها. قائمة الانتظار لا تُحسب.' },
  { term: 'المحذوفون',
    rule: 'الطلاب المحذوفون (في سلة المحذوفين) مستبعدون من كل الأرقام.' },
  { term: 'ما ليس تسجيلًا',
    rule: 'الدفعات، سجلات الحضور، وصفوف الطلاب في الـ CRM لا تُعدّ تسجيلات أبدًا.' },
  { term: 'الحضور',
    rule: 'يُؤرَّخ بتاريخ الحصة. نسبة الحضور = (حاضر + متأخر) ÷ كل العلامات المسجّلة.' },
  { term: 'الإيرادات',
    rule: 'الدفعات المؤكَّدة فقط (paid، مبلغ > 0، غير مستبعدة)، حسب تاريخ الدفع. لا تتأثر بفلاتر الدورة/القسم/الأستاذ لأن الدفعة غير مرتبطة بتسجيل بعينه.' },
  { term: 'الفلاتر',
    rule: 'الدورة: تسجيلاتها والأقسام والحصص المرتبطة بها. القسم/الأستاذ/النوع: تسجيلات الأقسام والحصص المطابقة، وتسجيلات الدورات لطلاب هذه المجموعة. الحالة: الحالة الحالية للتسجيل.' },
  { term: 'المقارنة',
    rule: 'اليوم ↔ الأمس؛ الأسبوع/الشهر/السنة حتى اليوم ↔ نفس المدة من الفترة السابقة؛ الفترة المخصّصة ↔ فترة بنفس الطول قبلها مباشرة.' },
]
