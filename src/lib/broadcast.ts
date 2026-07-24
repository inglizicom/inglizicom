/* Shared broadcast helpers — safe to import from both client and server.
 * (Keep this free of server-only imports; the CRM page uses it too.) */

export type Audience = 'students' | 'leads' | 'both'

/** The audience filter set. Everything is optional except `audience`. */
export type BroadcastFilters = {
  audience:       Audience
  levels?:        string[]   // students: current_level · leads: level
  paymentStatus?: string[]   // students only — paid | pending | overdue
  studentType?:   string[]   // students only — course_student | private_student
  activeOnly?:    boolean    // students only
  leadStatus?:    string[]   // leads only
  vipOnly?:       boolean    // leads only
  from?:          string     // subscription date >= YYYY-MM-DD
  to?:            string     // subscription date <= YYYY-MM-DD
  country?:       string
  search?:        string     // name / phone contains
}

export type Recipient = {
  id:    string
  kind:  'student' | 'lead'
  name:  string
  phone: string          // normalised international digits, e.g. 2126…
  level: string | null
  date:  string | null   // subscription_start (students) · created_at (leads)
}

export const EMPTY_FILTERS: BroadcastFilters = { audience: 'both', activeOnly: true }

/** Normalise a Moroccan number to international digits (0612… → 212612…). */
export function normalizePhone(phone: string | null | undefined): string {
  const d = (phone || '').replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith('212')) return d
  if (d.startsWith('0')) return '212' + d.slice(1)
  return d
}

/** A phone we can actually message (long enough to be real). */
export function isSendable(phone: string | null | undefined): boolean {
  return normalizePhone(phone).length >= 9
}

export function firstName(full: string | null | undefined): string {
  return (full || '').trim().split(/\s+/)[0] || ''
}

/** Placeholders the composer supports. */
export const PLACEHOLDERS = [
  { token: '{{name}}',  label: 'First name', ar: 'الاسم الأول' },
  { token: '{{level}}', label: 'Level',      ar: 'المستوى' },
] as const

/** Fill {{name}} / {{level}} for one recipient. */
export function renderMessage(template: string, r: Pick<Recipient, 'name' | 'level'>): string {
  return (template || '')
    .replace(/\{\{\s*name\s*\}\}/gi, firstName(r.name))
    .replace(/\{\{\s*level\s*\}\}/gi, r.level || '')
    .trim()
}

/** Click-to-chat link with the message pre-filled. */
export function waLink(phone: string, text: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(text)}`
}
