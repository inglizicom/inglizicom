import type { Plan } from '@/data/plans'

/**
 * Per-plan accent colours for the plan pages (/pricing/[plan]) on the light
 * site. The accent only tints details (pills, ticks, the highlighted card);
 * every primary button is the brand navy, so the pages read as one product.
 * Full class strings — Tailwind's scanner needs literals.
 */
export const COLOR_STYLES: Record<Plan['color'], {
  ring: string; border: string; accent: string; pillBg: string; pillText: string; ctaBg: string
}> = {
  emerald: { ring: 'ring-emerald-200', border: 'border-emerald-400', accent: 'text-emerald-600', pillBg: 'bg-emerald-50', pillText: 'text-emerald-700', ctaBg: 'bg-brand-700 hover:bg-brand-800 text-white' },
  blue:    { ring: 'ring-blue-200',    border: 'border-blue-400',    accent: 'text-blue-600',    pillBg: 'bg-blue-50',    pillText: 'text-blue-700',    ctaBg: 'bg-brand-700 hover:bg-brand-800 text-white' },
  violet:  { ring: 'ring-violet-200',  border: 'border-violet-400',  accent: 'text-violet-600',  pillBg: 'bg-violet-50',  pillText: 'text-violet-700',  ctaBg: 'bg-brand-700 hover:bg-brand-800 text-white' },
  orange:  { ring: 'ring-orange-200',  border: 'border-orange-400',  accent: 'text-orange-600',  pillBg: 'bg-orange-50',  pillText: 'text-orange-700',  ctaBg: 'bg-brand-700 hover:bg-brand-800 text-white' },
  amber:   { ring: 'ring-amber-200',   border: 'border-amber-400',   accent: 'text-amber-600',   pillBg: 'bg-amber-50',   pillText: 'text-amber-700',   ctaBg: 'bg-brand-700 hover:bg-brand-800 text-white' },
  slate:   { ring: 'ring-slate-200',   border: 'border-slate-400',   accent: 'text-slate-600',   pillBg: 'bg-slate-100',  pillText: 'text-slate-700',   ctaBg: 'bg-brand-700 hover:bg-brand-800 text-white' },
  rose:    { ring: 'ring-rose-200',    border: 'border-rose-400',    accent: 'text-rose-600',    pillBg: 'bg-rose-50',    pillText: 'text-rose-700',    ctaBg: 'bg-brand-700 hover:bg-brand-800 text-white' },
  cyan:    { ring: 'ring-cyan-200',    border: 'border-cyan-400',    accent: 'text-cyan-600',    pillBg: 'bg-cyan-50',    pillText: 'text-cyan-700',    ctaBg: 'bg-brand-700 hover:bg-brand-800 text-white' },
}
