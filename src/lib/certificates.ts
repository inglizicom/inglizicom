import { supabase } from './supabase'

/**
 * Generic certificates (migration 037) — separate from the final-exam
 * certificate in lms_certificates. Auto-awarded server-side (course
 * completion / coin milestones / streaks) via student_check_certificates,
 * plus staff-issued custom ones. Every certificate has a public serial
 * verifiable at /certificate/[serial].
 */

export type CertKind = 'course_complete' | 'coins' | 'streak' | 'custom'

export interface StudentCert {
  serial: string
  kind: CertKind
  title: string
  milestone: number | null
  course_title: string | null
  date: string
}

export interface CertRow {
  id: string
  student_id: string
  course_id: string | null
  kind: CertKind
  milestone: number | null
  title: string
  serial: string
  issued_by: string | null
  created_at: string
}

export interface VerifiedCert {
  found: boolean
  serial?: string
  kind?: CertKind
  title?: string
  milestone?: number | null
  student_name?: string
  course_title?: string | null
  course_level?: string | null
  date?: string
}

export const CERT_KIND_AR: Record<string, { label: string; emoji: string }> = {
  course_complete: { label: 'إتمام دورة', emoji: '🎓' },
  coins:           { label: 'إنجاز عملات', emoji: '🪙' },
  streak:          { label: 'مواظبة', emoji: '🔥' },
  custom:          { label: 'شهادة خاصة', emoji: '🏅' },
}

export function certUrl(serial: string): string {
  return `https://inglizi.com/certificate/${serial}`
}

/* ── Student side (token-gated; also runs the auto-award rules) ── */
export async function checkCertificates(token: string): Promise<{ certs: StudentCert[]; newSerials: string[] }> {
  const { data, error } = await supabase.rpc('student_check_certificates', { p_token: token.trim().toUpperCase() })
  if (error || !data?.found) return { certs: [], newSerials: [] }
  return { certs: (data.certs ?? []) as StudentCert[], newSerials: (data.new ?? []) as string[] }
}

/* ── Public verification (anon) ── */
export async function verifyCertificate(serial: string): Promise<VerifiedCert> {
  const { data, error } = await supabase.rpc('certificate_verify', { p_serial: serial.trim().toUpperCase() })
  if (error) return { found: false }
  return (data ?? { found: false }) as VerifiedCert
}

/* ── CRM staff side (RLS: staff read/insert, founder delete) ── */
export async function fetchStudentCertificates(studentId: string): Promise<CertRow[]> {
  const { data } = await supabase.from('student_certificates').select('*')
    .eq('student_id', studentId).order('created_at', { ascending: false })
  return (data ?? []) as CertRow[]
}

/** Issue a custom certificate by hand (e.g. "Best student of the month"). */
export async function issueCustomCertificate(studentId: string, title: string, issuedBy: string): Promise<string | null> {
  const serial = `IGZ-${new Date().toISOString().slice(2, 7).replace('-', '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  const { data, error } = await supabase.from('student_certificates')
    .insert({ student_id: studentId, kind: 'custom', title: title.trim(), serial, issued_by: issuedBy })
    .select('serial').single()
  if (error) { console.error('issueCustomCertificate', error.message); return null }
  return (data as { serial: string }).serial
}

export async function deleteCertificate(id: string): Promise<void> {
  await supabase.from('student_certificates').delete().eq('id', id)
}

/* ── Certificate readiness board (staff) ── */
export interface CertReadyStudent {
  student_id: string; name: string; token: string; avatar_url: string | null
  items: string[]; count: number
}
export interface CertCloseStudent {
  student_id: string; name: string; avatar_url: string | null; course: string; pct: number
}
export interface CertRecentRow {
  student_id: string; name: string; avatar_url: string | null; serial: string; title: string; date: string
}
export interface CertCandidates {
  ready: CertReadyStudent[]
  close: CertCloseStudent[]
  recent: CertRecentRow[]
  counts: { ready: number; close: number; recent: number }
}

export async function fetchCertCandidates(): Promise<CertCandidates | null> {
  const { data, error } = await supabase.rpc('cert_candidates')
  if (error) { console.error('cert_candidates', error.message); return null }
  return data as CertCandidates | null
}

/**
 * Staff-triggered award: runs the same idempotent check the student's portal
 * runs on login (awards every qualifying certificate + notifies the student).
 * Returns the serials that were newly awarded.
 */
export async function awardStudentCertificates(token: string): Promise<string[]> {
  const { data, error } = await supabase.rpc('student_check_certificates', { p_token: token.trim().toUpperCase() })
  if (error || !data?.found) return []
  return (data.new ?? []) as string[]
}
