'use client'

/**
 * Shared plan-card components for the pricing family of pages
 * (/pricing, /classes, /business). Dark navy theme, RTL.
 * Every card reads exclusively from the canonical Plan objects
 * in /data/plans.ts — no duplicated prices or perks.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check, ArrowLeft, Flame, Package, Target, Video, Zap, Crown, MessageCircle,
} from 'lucide-react'
import { openSubscribe } from '@/lib/lead-source'
import ApproxPrice from '@/components/ApproxPrice'
import type { Plan } from '@/data/plans'

// ─── Color palette ─────────────────────────────────────────────────────────────

export const COLOR_STYLES: Record<Plan['color'], {
  ring: string; border: string; accent: string; pillBg: string; pillText: string; ctaBg: string;
}> = {
  emerald: { ring: 'ring-emerald-500/20', border: 'border-emerald-500/60', accent: 'text-emerald-400', pillBg: 'bg-emerald-500/10', pillText: 'text-emerald-300', ctaBg: 'bg-emerald-500 hover:bg-emerald-400 text-gray-900' },
  blue:    { ring: 'ring-blue-500/20',    border: 'border-blue-500/60',    accent: 'text-blue-400',    pillBg: 'bg-blue-500/10',    pillText: 'text-blue-300',    ctaBg: 'bg-blue-500 hover:bg-blue-400 text-white' },
  violet:  { ring: 'ring-violet-500/20',  border: 'border-violet-500/60',  accent: 'text-violet-400',  pillBg: 'bg-violet-500/10',  pillText: 'text-violet-300',  ctaBg: 'bg-violet-500 hover:bg-violet-400 text-white' },
  orange:  { ring: 'ring-orange-500/20',  border: 'border-orange-500/60',  accent: 'text-orange-400',  pillBg: 'bg-orange-500/10',  pillText: 'text-orange-300',  ctaBg: 'bg-orange-500 hover:bg-orange-400 text-gray-900' },
  amber:   { ring: 'ring-amber-500/20',   border: 'border-amber-500/70',   accent: 'text-amber-400',   pillBg: 'bg-amber-500/10',   pillText: 'text-amber-300',   ctaBg: 'bg-amber-500 hover:bg-amber-400 text-gray-900' },
  slate:   { ring: 'ring-slate-500/20',   border: 'border-slate-500/60',   accent: 'text-slate-300',   pillBg: 'bg-slate-500/10',   pillText: 'text-slate-300',   ctaBg: 'bg-white/10 hover:bg-white/20 text-white' },
  rose:    { ring: 'ring-rose-500/20',    border: 'border-rose-500/60',    accent: 'text-rose-400',    pillBg: 'bg-rose-500/10',    pillText: 'text-rose-300',    ctaBg: 'bg-rose-500 hover:bg-rose-400 text-white' },
  cyan:    { ring: 'ring-cyan-500/20',    border: 'border-cyan-500/60',    accent: 'text-cyan-400',    pillBg: 'bg-cyan-500/10',    pillText: 'text-cyan-300',    ctaBg: 'bg-cyan-500 hover:bg-cyan-400 text-gray-900' },
}

// ─── Section headline — full-width break banner ────────────────────────────────

export function SectionHeadline({
  tag, tagColor = 'text-amber-400', borderColor = 'border-[#1a2d4a]',
  en, ar, sub, id,
}: {
  tag: string
  tagColor?: string
  borderColor?: string
  en: string
  ar: string
  sub: string
  id?: string
}) {
  return (
    <div id={id} className={`w-full border-t border-b ${borderColor} bg-[#030a16] py-10 text-center scroll-mt-20`}>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <p className={`text-[11px] font-black tracking-[0.5em] uppercase mb-3 ${tagColor}`}>
          — {tag} —
        </p>
        <h2 className="text-white font-black text-3xl sm:text-4xl md:text-5xl leading-tight tracking-tight mb-2">
          {ar}
        </h2>
        <p className={`font-black text-sm sm:text-base mb-3 ${tagColor}`}>{en}</p>
        <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed px-4">{sub}</p>
      </motion.div>
    </div>
  )
}

/* Collapsible perk list — keeps cards light: 4 perks visible, rest behind a toggle. */
export function PerkList({ perks, accent, dense = false }: { perks: string[]; accent: string; dense?: boolean }) {
  const [open, setOpen] = useState(false)
  const LIMIT = 4
  const shown = open ? perks : perks.slice(0, LIMIT)
  const extra = perks.length - LIMIT
  return (
    <div className="mt-3 flex-1">
      <ul className={dense ? 'space-y-1.5' : 'space-y-2'}>
        {shown.map(item => (
          <li key={item} className={`flex items-start gap-1.5 text-gray-300 leading-snug ${dense ? 'text-[12px]' : 'text-[13px]'}`}>
            <Check className={`${dense ? 'w-3 h-3' : 'w-3.5 h-3.5'} shrink-0 mt-0.5 ${accent}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {extra > 0 && (
        <button type="button" onClick={() => setOpen(o => !o)}
          className={`mt-2 text-[11px] font-black ${accent} hover:underline`}>
          {open ? 'عرض أقل ↑' : `+${extra} مزايا أخرى ↓`}
        </button>
      )}
    </div>
  )
}

export function PackCard({ plan, source = 'pricing_pack_' }: { plan: Plan; source?: string }) {
  const c = COLOR_STYLES[plan.color]
  const savings = plan.originalAmount && plan.originalAmount > plan.amount_mad
    ? plan.originalAmount - plan.amount_mad : null

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.45 }} whileHover={{ y: -6 }}
      id={plan.id} className={`scroll-mt-24 relative flex flex-col bg-[#0a1628] border-2 rounded-2xl p-6 transition-all ${
      plan.highlight ? `${c.border} ring-2 ${c.ring} scale-[1.02]` : 'border-[#1a2d4a] hover:border-[#1e3455]'
    }`}>
      {plan.badge_ar && (
        <div className={`absolute -top-3 right-5 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
          plan.highlight ? 'bg-amber-500 text-gray-900' : `${c.pillBg} ${c.pillText}`
        }`}>{plan.badge_ar}</div>
      )}

      <div className={`inline-flex self-start items-center gap-1.5 ${c.pillBg} ${c.pillText} text-[11px] font-black px-2.5 py-1 rounded-full mb-3`}>
        <Package className="w-3 h-3" />
        {plan.levelsIncluded} مستويات · {plan.levelFrom} → {plan.levelTo}
      </div>

      <h3 className="text-white font-black text-xl leading-tight">{plan.title_ar}</h3>
      <p className="text-gray-400 text-sm mt-0.5">{plan.subtitle_ar}</p>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-white font-black text-4xl">{plan.amount_mad.toLocaleString()}</span>
        <span className="text-gray-400 text-sm font-bold">درهم</span>
        {plan.originalAmount && <span className="text-gray-600 text-sm line-through">{plan.originalAmount.toLocaleString()}</span>}
      </div>
      <ApproxPrice mad={plan.amount_mad} className="mt-1 text-amber-300/90 text-sm font-bold" />
      {savings && (
        <div className="mt-2 inline-flex self-start items-center gap-1 bg-emerald-500/10 text-emerald-400 text-xs font-black px-2 py-1 rounded-md">
          <Flame className="w-3 h-3" /> وفّر {savings.toLocaleString()} درهم
        </div>
      )}

      <div className={`mt-4 ${c.pillBg} border border-white/5 rounded-xl p-3`}>
        <div className="text-white text-sm font-bold">{plan.followUpLabel_ar}</div>
        <div className="text-gray-400 text-xs mt-0.5">{plan.followUpDuration_ar}</div>
      </div>

      <PerkList perks={plan.lifetimePerks} accent={c.accent} />

      {plan.idealFor_ar && (
        <div className="mt-4 bg-white/5 rounded-xl p-3 text-gray-300 text-xs leading-relaxed">
          <span className={`${c.accent} font-black`}>✦ </span>{plan.idealFor_ar}
        </div>
      )}

      <button
        type="button"
        onClick={() => openSubscribe({ source: `${source}${plan.id}`, planId: plan.id })}
        className={`mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-black transition-all ${
          plan.highlight ? c.ctaBg : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
      >
        اشترك في الباك <ArrowLeft className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export function IndividualCard({ plan, source = 'pricing_card_' }: { plan: Plan; source?: string }) {
  const c = COLOR_STYLES[plan.color]
  const levelBadge = plan.levelFrom && plan.levelTo ? `${plan.levelFrom} → ${plan.levelTo}` : 'مخصّص'
  const savings = plan.originalAmount && plan.originalAmount > plan.amount_mad
    ? plan.originalAmount - plan.amount_mad : null

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.45 }} whileHover={{ y: -6 }}
      id={plan.id} className={`scroll-mt-24 relative flex flex-col bg-[#0a1628] border-2 rounded-2xl p-5 transition-all ${
      plan.highlight ? `${c.border} ring-2 ${c.ring}` : 'border-[#1a2d4a] hover:border-[#1e3455]'
    }`}>
      {plan.badge_ar && (
        <div className={`absolute -top-3 right-4 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
          plan.highlight ? 'bg-amber-500 text-gray-900' : `${c.pillBg} ${c.pillText}`
        }`}>{plan.badge_ar}</div>
      )}

      <div className={`inline-flex self-start items-center gap-1 ${c.pillBg} ${c.pillText} text-[11px] font-black px-2 py-0.5 rounded-full mb-2`}>
        <Target className="w-2.5 h-2.5" /> {levelBadge}
      </div>

      <h3 className="text-white font-black text-lg leading-tight">{plan.title_ar}</h3>
      <p className="text-gray-400 text-xs mt-0.5">{plan.subtitle_ar}</p>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-white font-black text-3xl">{plan.amount_mad.toLocaleString()}</span>
        <span className="text-gray-400 text-xs font-bold">درهم</span>
        {plan.originalAmount && <span className="text-gray-600 text-xs line-through">{plan.originalAmount.toLocaleString()}</span>}
      </div>
      <ApproxPrice mad={plan.amount_mad} className="mt-1 text-amber-300/90 text-xs font-bold" />
      {savings && (
        <div className="mt-1.5 inline-flex self-start items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[11px] font-black px-2 py-0.5 rounded-md">
          <Flame className="w-2.5 h-2.5" /> وفّر {savings.toLocaleString()}
        </div>
      )}

      <div className={`mt-3 ${c.pillBg} border border-white/5 rounded-lg p-2.5`}>
        <div className="text-white text-xs font-bold">{plan.followUpLabel_ar}</div>
        <div className="text-gray-400 text-[11px] mt-0.5">{plan.followUpDuration_ar}</div>
      </div>

      {plan.includesPrevious_ar && (
        <div className="mt-2.5 text-[11px] font-black text-gray-300">
          <span className={c.accent}>✓</span> {plan.includesPrevious_ar}
        </div>
      )}

      <PerkList perks={plan.lifetimePerks} accent={c.accent} dense />

      {plan.idealFor_ar && (
        <div className="mt-3 bg-white/5 rounded-lg p-2.5 text-gray-400 text-[11px] leading-relaxed">
          {plan.idealFor_ar}
        </div>
      )}

      <button
        type="button"
        onClick={() => openSubscribe({ source: `${source}${plan.id}`, planId: plan.id })}
        className={`mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-black transition-all ${
          plan.highlight || plan.isPremium ? c.ctaBg : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
      >
        اشترك الآن <ArrowLeft className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export function ClassCard({ plan, source = 'classes_card_' }: { plan: Plan; source?: string }) {
  const c = COLOR_STYLES[plan.color]
  const savings = plan.originalAmount && plan.originalAmount > plan.amount_mad
    ? plan.originalAmount - plan.amount_mad : null

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.45 }} whileHover={{ y: -6 }}
      className={`relative flex flex-col bg-[#0a1628] border-2 rounded-2xl p-5 transition-all ${
      plan.highlight ? `${c.border} ring-2 ${c.ring} scale-[1.02]` : 'border-[#1a2d4a] hover:border-[#1e3455]'
    }`}>
      {plan.badge_ar && (
        <div className={`absolute -top-3 right-4 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
          plan.highlight ? 'bg-amber-500 text-gray-900' : `${c.pillBg} ${c.pillText}`
        }`}>{plan.badge_ar}</div>
      )}

      {/* Session count badge */}
      <div className={`inline-flex self-start items-center gap-1.5 ${c.pillBg} ${c.pillText} text-[11px] font-black px-2.5 py-1 rounded-full mb-3`}>
        <Video className="w-3 h-3" />
        {plan.sessionsIncluded} {plan.sessionsIncluded === 1 ? 'حصة' : 'حصص'} · {plan.sessionDuration}
      </div>

      <h3 className="text-white font-black text-lg leading-tight">{plan.title_ar}</h3>
      <p className="text-gray-400 text-xs mt-0.5">{plan.subtitle_ar}</p>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-white font-black text-3xl">{plan.amount_mad.toLocaleString()}</span>
        <span className="text-gray-400 text-xs font-bold">درهم</span>
        {plan.originalAmount && <span className="text-gray-600 text-xs line-through">{plan.originalAmount.toLocaleString()}</span>}
      </div>
      <ApproxPrice mad={plan.amount_mad} className="mt-1 text-amber-300/90 text-xs font-bold" />

      {plan.sessionsIncluded && plan.sessionsIncluded > 1 && (
        <div className="text-gray-500 text-[11px] mt-1">
          {Math.round(plan.amount_mad / plan.sessionsIncluded)} درهم / حصة
        </div>
      )}

      {savings && (
        <div className="mt-1.5 inline-flex self-start items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[11px] font-black px-2 py-0.5 rounded-md">
          <Flame className="w-2.5 h-2.5" /> وفّر {savings.toLocaleString()} درهم
        </div>
      )}

      <PerkList perks={plan.lifetimePerks} accent={c.accent} dense />

      {plan.idealFor_ar && (
        <div className="mt-3 bg-white/5 rounded-lg p-2.5 text-gray-400 text-[11px] leading-relaxed">
          {plan.idealFor_ar}
        </div>
      )}

      <button
        type="button"
        onClick={() => openSubscribe({ source: `${source}${plan.id}`, planId: plan.id })}
        className={`mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-black transition-all ${
          plan.highlight || plan.isPremium ? c.ctaBg : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
      >
        احجز الحصص <ArrowLeft className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export function BusinessCard({ plan, source = 'business_page' }: { plan: Plan; source?: string }) {
  const c = COLOR_STYLES[plan.color]
  const savings = plan.originalAmount && plan.originalAmount > plan.amount_mad
    ? plan.originalAmount - plan.amount_mad : null

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.45 }}
      className={`relative bg-[#0a1628] border-2 ${c.border} ring-2 ${c.ring} rounded-2xl p-7`}>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className={`inline-flex items-center gap-1.5 ${c.pillBg} ${c.pillText} text-[11px] font-black px-2.5 py-1 rounded-full mb-4`}>
            <Zap className="w-3 h-3" />
            برنامج المحترفين
          </div>
          <h3 className="text-white font-black text-2xl mb-1">{plan.title_ar}</h3>
          <p className="text-gray-400 text-sm mb-5">{plan.subtitle_ar}</p>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-white font-black text-5xl">{plan.amount_mad.toLocaleString()}</span>
            <span className="text-gray-400 text-base">درهم</span>
            {plan.originalAmount && <span className="text-gray-600 text-base line-through">{plan.originalAmount.toLocaleString()}</span>}
          </div>
          <ApproxPrice mad={plan.amount_mad} className="text-amber-300/90 text-sm font-bold" />
          {savings && (
            <div className="mt-2 inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-sm font-black px-3 py-1 rounded-md mb-5">
              <Flame className="w-3.5 h-3.5" /> وفّر {savings.toLocaleString()} درهم
            </div>
          )}

          <div className={`${c.pillBg} border border-white/5 rounded-xl p-4 mb-4 mt-3`}>
            <div className="text-white text-sm font-bold">{plan.followUpLabel_ar}</div>
            <div className="text-gray-400 text-xs mt-1">{plan.followUpDuration_ar}</div>
          </div>

          {plan.idealFor_ar && (
            <div className="bg-white/5 rounded-xl p-4 text-gray-300 text-sm leading-relaxed">
              <span className={`${c.accent} font-black`}>✦ </span>{plan.idealFor_ar}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <ul className="space-y-2.5 mb-6">
            {plan.lifetimePerks.map(item => (
              <li key={item} className="flex items-start gap-2 text-gray-300 text-sm leading-snug">
                <Check className={`w-4 h-4 shrink-0 mt-0.5 ${c.accent}`} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => openSubscribe({ source, planId: plan.id })}
            className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl font-black text-base transition-all ${c.ctaBg}`}
          >
            اشترك في البرنامج المهني <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export function TrustBadge({ icon: Icon, title, subtitle }: { icon: typeof Crown; title: string; subtitle: string }) {
  return (
    <div className="bg-[#0a1628] border border-[#1a2d4a] rounded-xl p-4 text-center">
      <Icon className="w-5 h-5 text-amber-400 mx-auto mb-2" />
      <div className="text-white font-black text-sm">{title}</div>
      <div className="text-gray-500 text-xs font-semibold">{subtitle}</div>
    </div>
  )
}

export function WhatsAppCTABox({ whatsapp }: { whatsapp: string }) {
  return (
    <div className="max-w-xl mx-auto text-center bg-[#0a1628] border border-[#1a2d4a] rounded-2xl p-6">
      <MessageCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
      <div className="text-white font-black mb-1">هل لديك سؤال قبل الاشتراك؟</div>
      <div className="text-gray-400 text-sm mb-4">تواصل معنا على واتساب — نرد خلال وقت قصير.</div>
      <a
        href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#20c05c] text-white font-black text-sm px-6 py-3 rounded-xl transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        تواصل عبر واتساب
      </a>
    </div>
  )
}
