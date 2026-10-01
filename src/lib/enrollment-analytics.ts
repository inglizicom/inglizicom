import { supabase } from './supabase'
import type { AnalyticsFilters, Bucket, DateRange } from './enrollment-metrics'

/**
 * Fetchers for the analytics RPCs in 048_enrollment_analytics.sql. The counting
 * rules are documented in enrollment-metrics.ts (COUNTING_RULES).
 */

export interface EnrollmentKpis {
  course_enrollments: number
  course_students: number
  class_enrollments: number
  class_students: number
  group_enrollments: number
  private_enrollments: number
  group_students: number
  private_students: number
  unique_students: number
  both_students: number
  course_status: { active: number; completed: number; cancelled: number }
  class_status: { active: number; waitlisted: number; completed: number; cancelled: number }
  active_at_end: {
    as_of: string
    course_enrollments: number
    class_enrollments: number
    group_enrollments: number
    private_enrollments: number
    unique_students: number
  }
  sessions_done: number
  sessions_cancelled: number
  sessions_scheduled: number
  hours_done: number
  reports_owed: number
  attendance: { marks: number; present: number; late: number; absent: number; excused: number; rate: number | null }
}

export interface EnrollmentTrendPoint {
  bucket: string
  course_enrollments: number
  class_enrollments: number
  group_enrollments: number
  private_enrollments: number
  sessions_done: number
  attendance_marks: number
}

export interface EnrollmentAnalytics {
  range: { from: string | null; to: string; timezone: string; bucket: Bucket }
  kpis: EnrollmentKpis
  trend: EnrollmentTrendPoint[] | null
  by_course: { course_id: string; title: string; enrollments: number; students: number; active: number; completed: number; cancelled: number }[] | null
  by_class: { class_id: string; title: string; mode: 'group' | 'private'; capacity: number | null; teacher_name: string | null
              enrollments: number; students: number; active: number; waitlisted: number; completed: number; cancelled: number }[] | null
  by_mode: { group: { enrollments: number; students: number }; private: { enrollments: number; students: number } } | null
  by_teacher: { teacher_id: string | null; name: string; class_enrollments: number; class_students: number
                sessions_done: number; sessions_cancelled: number; attendance_rate: number | null }[] | null
  lifetime: { course_enrollments: number; class_enrollments: number; unique_students: number
              active_now_course: number; active_now_class: number } | null
}

export interface RevenueBreakdownRow { label: string; mad: number; count: number }

export interface RevenueAnalytics {
  range: { from: string | null; to: string; timezone: string; bucket: Bucket }
  kpis: { revenue: number; payments: number; paying_students: number }
  trend: { bucket: string; revenue: number; payments: number }[] | null
  by_course: RevenueBreakdownRow[] | null
  by_source: RevenueBreakdownRow[] | null
  by_staff: RevenueBreakdownRow[] | null
  funnel: { total: number; contacted: number; confirmed: number; paid: number } | null
  lifetime: { revenue: number; payments: number } | null
}

export interface EnrollmentRecordRow {
  kind: 'course' | 'class'
  student: string
  item: string
  mode: 'group' | 'private' | null
  teacher: string | null
  status: string
  enrolled_on: string
  ended_on: string | null
}

export async function fetchEnrollmentAnalytics(
  range: DateRange, filters: AnalyticsFilters, bucket: Bucket, detail = true,
): Promise<EnrollmentAnalytics> {
  const { data, error } = await supabase.rpc('enrollment_analytics', {
    p_from: range.from, p_to: range.to, p_filters: filters, p_bucket: bucket, p_detail: detail,
  })
  if (error) throw new Error(error.message)
  return data as EnrollmentAnalytics
}

export async function fetchRevenueAnalytics(range: DateRange, bucket: Bucket, detail = true): Promise<RevenueAnalytics> {
  const { data, error } = await supabase.rpc('revenue_analytics', {
    p_from: range.from, p_to: range.to, p_bucket: bucket, p_detail: detail,
  })
  if (error) throw new Error(error.message)
  return data as RevenueAnalytics
}

export async function fetchEnrollmentRows(range: DateRange, filters: AnalyticsFilters): Promise<EnrollmentRecordRow[]> {
  const { data, error } = await supabase.rpc('enrollment_analytics_rows', {
    p_from: range.from, p_to: range.to, p_filters: filters,
  })
  if (error) throw new Error(error.message)
  return (data ?? []) as EnrollmentRecordRow[]
}
