'use client'

import Link from 'next/link'
import {
  Crown, Check, ArrowLeft, Sparkles, MessageCircle, Clock, Shield,
  RefreshCw, Star, Users, Globe, BookOpen, Calendar, Target, Flame,
  Mic, Brain, Zap, TrendingUp, Package, Video,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useProfile } from '@/lib/profile-context'
import {
  INDIVIDUAL_PLANS, PACK_PLANS, BUSINESS_PLANS, CLASS_PLANS,
  PAYMENT_WHATSAPP, type Plan,
} from '@/data/plans'
import { TESTIMONIALS, STATS } from '@/data/testimonials'
import { openSubscribe } from '@/lib/lead-source'

const FAQ: { q: string; a: string }[] = [
  {
    q: 'هل تدرّسون القواعد؟',
    a: 'لا. نحن نركز على الكلام من أول يوم. القواعد تكتسبها تلقائياً وأنت تتحدث — بالضبط كيف تعلّمت العربية وأنت طفل.',
  },
  {
    q: 'أنا خائف من الإنجليزية — هل يصلح لي؟',
    a: 'هذا البرنامج صُمّم بالضبط لمن عنده خوف. النطق والثقة يأتيان من التكرار والممارسة — لا من الدراسة. هنا تواجه خوفك بطريقة مريحة ومدروسة.',
  },
  {
    q: 'ما الفرق بين الباكات والمستويات الفردية؟',
    a: 'المستويات تُشترى واحداً واحداً. الباكات تجمع مستويين أو أكثر بسعر أوفر ورحلة متصلة تضمن لك الاستمرارية.',
  },
  {
    q: 'ما الفرق بين الحصص الفردية والمستويات؟',
    a: 'المستويات برنامج متكامل ذاتي. الحصص الفردية تعلّم 1:1 مباشر مع الأستاذ — مخصّص تماماً لك، بإيقاعك وهدفك.',
  },
  {
    q: 'كيف أدفع؟',
    a: 'تحويل بنكي مغربي، ثم ترفع صورة الإيصال في صفحة الاشتراك. نفعّل حسابك خلال 24 ساعة.',
  },
  {
    q: 'ما الذي يميّز الإنجليزية المهنية؟',
    a: 'برنامج مخصص لبيئة العمل: اجتماعات، مكالمات، عروض، تواصل مع العملاء. لا كتابة، لا قواعد — فقط تكلم وأقنع.',
  },
]

// ─── Color palette ─────────────────────────────────────────────────────────────

const COLOR_STYLES: Record<Plan['color'], {
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

function SectionHeadline({
  tag, tagColor = 'text-amber-400', borderColor = 'border-[#1a2d4a]',
  en, ar, sub,
}: {
  tag: string
  tagColor?: string
  borderColor?: string
  en: string
  ar: string
  sub: string
}) {
  return (
    <div className={`w-full border-t border-b ${borderColor} bg-[#030a16] py-16 text-center`}>
      <p className={`text-[11px] font-black tracking-[0.5em] uppercase mb-5 ${tagColor}`}>
        — {tag} —
      </p>
      <h2 className="text-white font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-none tracking-tighter mb-4">
        {en}
      </h2>
      <p className="text-gray-300 font-black text-xl sm:text-2xl mb-3">{ar}</p>
      <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed px-4">{sub}</p>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const { status } = useProfile()
  useAuth()

  return (
    <main className="min-h-screen bg-[#050d1a] pt-[80px] pb-20" dir="rtl">

      {/* ── HERO ──────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center pt-8 pb-12">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            بدون قواعد — بدون حفظ — فقط كلام
          </div>

          <h1 className="text-white font-black text-4xl sm:text-5xl leading-tight mb-4">
            أوقف الترجمة في رأسك.
            <br />
            <span className="text-amber-400">ابدأ تتكلم.</span>
          </h1>

          <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed mb-8">
            برنامج Inglizi.com يبني ثقتك من أول يوم — عبر النطق والمحادثة الحقيقية.
            لا قواعد، لا حفظ، فقط كلام من الدقيقة الأولى.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-gray-400 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="text-white font-black">+{STATS.students}</span> طالب
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="text-white font-black">{STATS.countries}</span> دولة
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-white font-black">{STATS.rating}</span>/5
              <span className="text-gray-500">({STATS.reviews} تقييم)</span>
            </span>
          </div>

          {/* 4 pillars */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { icon: Mic,        title: 'النطق من يوم 1',  sub: 'تتكلم مباشرة' },
              { icon: Brain,      title: 'بلا قواعد',        sub: 'تكتسب بالممارسة' },
              { icon: Zap,        title: 'ثقة حقيقية',       sub: 'تواجه الخوف' },
              { icon: TrendingUp, title: 'تحوّل ملموس',      sub: 'من الأسبوع الأول' },
            ].map(p => (
              <div key={p.title} className="bg-[#0a1628] border border-[#1a2d4a] rounded-xl p-4 text-center">
                <p.icon className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
                <div className="text-white font-black text-sm mb-0.5">{p.title}</div>
                <div className="text-gray-500 text-xs">{p.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {status.isPaid && (
          <div className="max-w-xl mx-auto mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
            <Crown className="w-6 h-6 text-amber-400 shrink-0" />
            <div className="flex-1">
              <div className="text-white font-black text-sm">أنت مشترك حالياً</div>
              {status.expiresInDays !== null && (
                <div className="text-emerald-300 text-xs font-semibold">
                  يبقى {status.expiresInDays} يوماً على انتهاء اشتراكك
                </div>
              )}
            </div>
            <Link href="/billing" className="text-xs font-black bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
              إدارة الاشتراك
            </Link>
          </div>
        )}
      </div>{/* close hero container */}

      {/* ════════════════════════════════════════════════════
            SECTION 1 — PACKS  (full-width headline)
      ════════════════════════════════════════════════════ */}
      <SectionHeadline
        tag="Our Packs"
        tagColor="text-violet-400"
        borderColor="border-violet-800/50"
        en="Explore Our Packs"
        ar="أقصى قيمة — رحلة متصلة"
        sub="كلما زاد التزامك زادت توفيراتك. الباكات مصممة لمن يريد تحوّلاً حقيقياً بلا انقطاع."
      />
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {PACK_PLANS.map(p => <PackCard key={p.id} plan={p} />)}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
            SECTION 2 — INDIVIDUAL LEVELS  (full-width)
      ════════════════════════════════════════════════════ */}
      <SectionHeadline
        tag="Individual Levels"
        tagColor="text-blue-400"
        borderColor="border-blue-800/50"
        en="Level by Level"
        ar="المستويات الفردية"
        sub="ابدأ بمستوى واحد وانتقل للتالي. كل مستوى مبني على السابق — يمكنك الترقية في أي وقت."
      />
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
          {INDIVIDUAL_PLANS.map(p => <IndividualCard key={p.id} plan={p} />)}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
            SECTION 3 — 1:1 CLASSES  (full-width)
      ════════════════════════════════════════════════════ */}
      <SectionHeadline
        tag="1:1 Private Classes"
        tagColor="text-amber-400"
        borderColor="border-amber-800/50"
        en="Explore Our Classes"
        ar="الحصص الفردية — 1:1 مع الأستاذ"
        sub="كلما اشتريت حصصاً أكثر، كان سعر الحصة أرخص. السعر الأساسي 400 درهم للحصة الواحدة."
      />
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-20">
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-4 bg-[#0a1628] border border-amber-500/30 rounded-2xl px-8 py-4">
            <Clock className="w-6 h-6 text-amber-400 shrink-0" />
            <div className="text-right">
              <div className="text-white font-black text-xl">400 درهم / الحصة</div>
              <div className="text-amber-300 text-sm font-bold">1h30 · مباشر مع الأستاذ · سعر يقل كلما زادت الحصص</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {CLASS_PLANS.map(p => <ClassCard key={p.id} plan={p} />)}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
            SECTION 4 — BUSINESS ENGLISH  (full-width)
      ════════════════════════════════════════════════════ */}
      <SectionHeadline
        tag="Business English"
        tagColor="text-cyan-400"
        borderColor="border-cyan-800/50"
        en="Speak Like a Professional"
        ar="الإنجليزية المهنية"
        sub="برنامج متخصص للمحترفين. تكلّم، أقنع، وابهر في بيئة العمل — بدون قواعد، بدون كتابة."
      />
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-20">
        <div className="max-w-3xl mx-auto">
          {BUSINESS_PLANS.map(p => <BusinessCard key={p.id} plan={p} />)}
        </div>
      </div>

      {/* ── TRUST + TESTIMONIALS + FAQ + CTA ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 pb-4">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto mb-16">
          <TrustBadge icon={Shield}    title="دفع آمن"           subtitle="تحويل بنكي مغربي" />
          <TrustBadge icon={Clock}     title="تفعيل خلال 24h"    subtitle="مراجعة يدوية للطلب" />
          <TrustBadge icon={RefreshCw} title="بدون تجديد تلقائي" subtitle="أنت تتحكم دائماً" />
        </div>

        <div className="mb-16">
          <div className="text-center mb-6">
            <h2 className="text-white font-black text-xl mb-1">ماذا يقول الطلاب؟</h2>
            <div className="inline-flex items-center gap-1 text-amber-400 text-sm">
              {[0,1,2,3,4].map(i => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              <span className="text-gray-400 text-xs mr-2 font-semibold">
                {STATS.rating}/5 من {STATS.reviews} تقييم
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TESTIMONIALS.slice(0, 6).map((t, i) => (
              <div key={i} className="bg-[#0a1628] border border-[#1a2d4a] rounded-2xl p-5">
                <div className="flex items-center gap-1 text-amber-400 mb-2">
                  {[0,1,2,3,4].map(j => <Star key={j} className="w-3.5 h-3.5 fill-amber-400" />)}
                </div>
                <p className="text-gray-200 text-sm leading-relaxed mb-4">{t.text}</p>
                <div className="flex items-center gap-3 pt-3 border-t border-[#1a2d4a]">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-lg">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white font-black text-sm">{t.name}</div>
                    <div className="text-gray-500 text-xs font-semibold">مستوى {t.level}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-white font-black text-xl text-center mb-5">أسئلة شائعة</h2>
          <div className="space-y-2">
            {FAQ.map(f => (
              <details key={f.q} className="group bg-[#0a1628] border border-[#1a2d4a] rounded-xl open:border-[#1e3455]">
                <summary className="cursor-pointer list-none p-4 flex items-center justify-between gap-3 text-white font-bold text-sm">
                  <span>{f.q}</span>
                  <span className="text-gray-500 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                </summary>
                <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </div>

        <div className="max-w-xl mx-auto text-center bg-[#0a1628] border border-[#1a2d4a] rounded-2xl p-6">
          <MessageCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <div className="text-white font-black mb-1">عندك سؤال قبل ما تشترك؟</div>
          <div className="text-gray-400 text-sm mb-4">تواصل معنا على واتساب — نرد خلال وقت قصير.</div>
          <a
            href={`https://wa.me/${PAYMENT_WHATSAPP.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#20c05c] text-white font-black text-sm px-6 py-3 rounded-xl transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            تواصل عبر واتساب
          </a>
        </div>

      </div>
    </main>
  )
}

// ─── Card components ───────────────────────────────────────────────────────────

function PackCard({ plan }: { plan: Plan }) {
  const c = COLOR_STYLES[plan.color]
  const savings = plan.originalAmount && plan.originalAmount > plan.amount_mad
    ? plan.originalAmount - plan.amount_mad : null

  return (
    <div className={`relative flex flex-col bg-[#0a1628] border-2 rounded-2xl p-6 transition-all ${
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
      {savings && (
        <div className="mt-2 inline-flex self-start items-center gap-1 bg-emerald-500/10 text-emerald-400 text-xs font-black px-2 py-1 rounded-md">
          <Flame className="w-3 h-3" /> وفّر {savings.toLocaleString()} درهم
        </div>
      )}

      <div className={`mt-4 ${c.pillBg} border border-white/5 rounded-xl p-3`}>
        <div className="text-white text-sm font-bold">{plan.followUpLabel_ar}</div>
        <div className="text-gray-400 text-xs mt-0.5">{plan.followUpDuration_ar}</div>
      </div>

      <ul className="mt-4 space-y-2 flex-1">
        {plan.lifetimePerks.map(item => (
          <li key={item} className="flex items-start gap-2 text-gray-300 text-[13px] leading-snug">
            <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${c.accent}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {plan.idealFor_ar && (
        <div className="mt-4 bg-white/5 rounded-xl p-3 text-gray-300 text-xs leading-relaxed">
          <span className={`${c.accent} font-black`}>✦ </span>{plan.idealFor_ar}
        </div>
      )}

      <button
        type="button"
        onClick={() => openSubscribe({ source: `pricing_pack_${plan.id}`, planId: plan.id })}
        className={`mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-black transition-all ${
          plan.highlight ? c.ctaBg : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
      >
        اشترك في الباك <ArrowLeft className="w-4 h-4" />
      </button>
    </div>
  )
}

function IndividualCard({ plan }: { plan: Plan }) {
  const c = COLOR_STYLES[plan.color]
  const levelBadge = plan.levelFrom && plan.levelTo ? `${plan.levelFrom} → ${plan.levelTo}` : 'مخصّص'
  const savings = plan.originalAmount && plan.originalAmount > plan.amount_mad
    ? plan.originalAmount - plan.amount_mad : null

  return (
    <div className={`relative flex flex-col bg-[#0a1628] border-2 rounded-2xl p-5 transition-all ${
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

      <ul className="mt-3 space-y-1.5 flex-1">
        {plan.lifetimePerks.map(item => (
          <li key={item} className="flex items-start gap-1.5 text-gray-300 text-[12px] leading-snug">
            <Check className={`w-3 h-3 shrink-0 mt-0.5 ${c.accent}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {plan.idealFor_ar && (
        <div className="mt-3 bg-white/5 rounded-lg p-2.5 text-gray-400 text-[11px] leading-relaxed">
          {plan.idealFor_ar}
        </div>
      )}

      <button
        type="button"
        onClick={() => openSubscribe({ source: `pricing_card_${plan.id}`, planId: plan.id })}
        className={`mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-black transition-all ${
          plan.highlight || plan.isPremium ? c.ctaBg : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
      >
        اشترك الآن <ArrowLeft className="w-4 h-4" />
      </button>
    </div>
  )
}

function ClassCard({ plan }: { plan: Plan }) {
  const c = COLOR_STYLES[plan.color]
  const savings = plan.originalAmount && plan.originalAmount > plan.amount_mad
    ? plan.originalAmount - plan.amount_mad : null

  return (
    <div className={`relative flex flex-col bg-[#0a1628] border-2 rounded-2xl p-5 transition-all ${
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

      <ul className="mt-3 space-y-1.5 flex-1">
        {plan.lifetimePerks.map(item => (
          <li key={item} className="flex items-start gap-1.5 text-gray-300 text-[12px] leading-snug">
            <Check className={`w-3 h-3 shrink-0 mt-0.5 ${c.accent}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {plan.idealFor_ar && (
        <div className="mt-3 bg-white/5 rounded-lg p-2.5 text-gray-400 text-[11px] leading-relaxed">
          {plan.idealFor_ar}
        </div>
      )}

      <button
        type="button"
        onClick={() => openSubscribe({ source: `pricing_class_${plan.id}`, planId: plan.id })}
        className={`mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-black transition-all ${
          plan.highlight || plan.isPremium ? c.ctaBg : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
      >
        احجز الحصص <ArrowLeft className="w-4 h-4" />
      </button>
    </div>
  )
}

function BusinessCard({ plan }: { plan: Plan }) {
  const c = COLOR_STYLES[plan.color]
  const savings = plan.originalAmount && plan.originalAmount > plan.amount_mad
    ? plan.originalAmount - plan.amount_mad : null

  return (
    <div className={`relative bg-[#0a1628] border-2 ${c.border} ring-2 ${c.ring} rounded-2xl p-7`}>
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
          {savings && (
            <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-sm font-black px-3 py-1 rounded-md mb-5">
              <Flame className="w-3.5 h-3.5" /> وفّر {savings.toLocaleString()} درهم
            </div>
          )}

          <div className={`${c.pillBg} border border-white/5 rounded-xl p-4 mb-4`}>
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
            onClick={() => openSubscribe({ source: 'pricing_business', planId: plan.id })}
            className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl font-black text-base transition-all ${c.ctaBg}`}
          >
            اشترك في البرنامج المهني <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function TrustBadge({ icon: Icon, title, subtitle }: { icon: typeof Crown; title: string; subtitle: string }) {
  return (
    <div className="bg-[#0a1628] border border-[#1a2d4a] rounded-xl p-4 text-center">
      <Icon className="w-5 h-5 text-amber-400 mx-auto mb-2" />
      <div className="text-white font-black text-sm">{title}</div>
      <div className="text-gray-500 text-xs font-semibold">{subtitle}</div>
    </div>
  )
}
