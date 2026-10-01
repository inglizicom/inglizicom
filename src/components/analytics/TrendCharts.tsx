'use client'

import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Table2, BarChart3 } from 'lucide-react'
import type { Bucket } from '@/lib/enrollment-metrics'

/* Validated with the dataviz validator (light surface #fff): slot 1 blue,
   slot 2 orange — CVD ΔE 24.7, normal ΔE 33.6, both ≥ 3:1 contrast. Fixed
   order: course is always blue, class always orange, on every chart. */
export const SERIES = {
  course:  { color: '#2a78d6', label: 'تسجيلات الدورات' },
  class:   { color: '#eb6834', label: 'تسجيلات الأقسام' },
  revenue: { color: '#eda100', label: 'الإيرادات المدفوعة' },
} as const

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر']

export function bucketLabel(day: string, bucket: Bucket): string {
  const [y, m, d] = day.split('-').map(Number)
  if (bucket === 'month') return `${MONTHS_AR[m - 1]} ${String(y).slice(2)}`
  if (bucket === 'week') return `أسبوع ${d}/${m}`
  return `${d}/${m}`
}

const axisTick = { fontSize: 11, fill: '#71717a' }
const tooltipStyle = { borderRadius: 12, border: '1px solid #e4e4e7', fontSize: 12, direction: 'rtl' as const }

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-3 text-[12px] text-zinc-600">
      {items.map(i => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: i.color }} />{i.label}
        </span>
      ))}
    </div>
  )
}

/** Course vs class enrollments per bucket — one axis, one measure (count). */
export function EnrollmentTrend({ data, bucket, height = 260 }: {
  data: { bucket: string; course_enrollments: number; class_enrollments: number }[]
  bucket: Bucket
  height?: number
}) {
  const [table, setTable] = useState(false)
  const rows = data.map(d => ({ label: bucketLabel(d.bucket, bucket), course: d.course_enrollments, klass: d.class_enrollments }))
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Legend items={[SERIES.course, SERIES.class]} />
        <ViewToggle table={table} onChange={setTable} />
      </div>
      {table ? (
        <DataTable head={['الفترة', SERIES.course.label, SERIES.class.label]} rows={rows.map(r => [r.label, r.course, r.klass])} />
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={rows} margin={{ top: 8, right: 4, left: 4, bottom: 0 }} barGap={2} barCategoryGap="22%">
            <CartesianGrid stroke="#f4f4f5" vertical={false} />
            <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} reversed interval="preserveStartEnd" minTickGap={12} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} width={32} orientation="right" allowDecimals={false} />
            <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={tooltipStyle}
              formatter={(v: number, name: string) => [v, name === 'course' ? SERIES.course.label : SERIES.class.label]} />
            <Bar dataKey="course" fill={SERIES.course.color} radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="klass" fill={SERIES.class.color} radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

/** Paid revenue per bucket, by payment date. Single series → no legend box. */
export function RevenueTrend({ data, bucket, height = 220 }: {
  data: { bucket: string; revenue: number }[]
  bucket: Bucket
  height?: number
}) {
  const [table, setTable] = useState(false)
  const rows = data.map(d => ({ label: bucketLabel(d.bucket, bucket), revenue: Number(d.revenue) }))
  return (
    <div className="space-y-3">
      <div className="flex justify-end"><ViewToggle table={table} onChange={setTable} /></div>
      {table ? (
        <DataTable head={['الفترة', 'د.م']} rows={rows.map(r => [r.label, r.revenue.toLocaleString('en-US')])} />
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={rows} margin={{ top: 8, right: 4, left: 4, bottom: 0 }} barCategoryGap="22%">
            <CartesianGrid stroke="#f4f4f5" vertical={false} />
            <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} reversed interval="preserveStartEnd" minTickGap={12} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} width={40} orientation="right"
              tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)} />
            <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={tooltipStyle}
              formatter={(v: number) => [`${v.toLocaleString('en-US')} د.م`, SERIES.revenue.label]} />
            <Bar dataKey="revenue" fill={SERIES.revenue.color} radius={[4, 4, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

function ViewToggle({ table, onChange }: { table: boolean; onChange: (t: boolean) => void }) {
  return (
    <button onClick={() => onChange(!table)} className="inline-flex items-center gap-1 text-[11.5px] font-bold text-zinc-500 hover:text-zinc-800"
      aria-label={table ? 'عرض كرسم' : 'عرض كجدول'}>
      {table ? <><BarChart3 size={13} /> رسم</> : <><Table2 size={13} /> جدول</>}
    </button>
  )
}

export function DataTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="max-h-72 overflow-auto rounded-xl border border-zinc-100">
      <table className="w-full text-[12.5px]">
        <thead className="sticky top-0 bg-zinc-50">
          <tr>{head.map(h => <th key={h} className="text-right font-bold text-zinc-500 px-3 py-2">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="px-3 py-1.5 tabular-nums text-zinc-700">{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  )
}
