'use client'

import Link from 'next/link'
import {
  Crown, Check, ArrowLeft, Sparkles, MessageCircle, Clock, Shield,
  RefreshCw, Star, Users, Globe, BookOpen, Calendar, Target, Flame,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useProfile } from '@/lib/profile-context'
import { PLANS, PAYMENT_WHATSAPP, type Plan } from '@/data/plans'
import { TESTIMONIALS, STATS } from '@/data/testimonials'
import { openSubscribe } from '@/lib/lead-source'

const FAQ: { q: string; a: string }[] = [
  {
    q: 'كيف أدفع؟',
    a: 'عن طريق تحويل بنكي، ثم ترفع صورة الإيصال في صفحة الاشتراك. نراجع الطلب ونفعّل الاشتراك خلال 24 ساعة.',
  },
  {
    q: 'هل يمكنني الإلغاء؟',
    a: 'نعم، الاشتراك لا يتجدد تلقائياً. ينتهي في تاريخ انتهائه ما لم تجدده بنفسك.',
  },
  {
    q: 'ماذا يحصل بعد انتهاء الاشتراك؟',
    a: 'ترجع لحسابك المجاني. لا تفقد تقدمك، فقط الكورسات المدفوعة تصبح مغلقة حتى تجدد.',
  },
  {
    q: 'هل يوجد فترة تجريبية؟',
    a: 'نعم، كل كورس يحتوي على دروس مجانية تجريبية قبل الاشتراك.',
  },
  {
    q: 'كيف أختار الباقة المناسبة؟',
    a: 'إذا كنت مبتدئاً تماماً ابدأ بالأساسية. لو عندك كلمات متفرقة لكن لا تستطيع المحادثة اختر الاحترافية. لو تفهم جيداً وتريد الطلاقة الممتازة. وإذا تبحث عن تحول شامل مع الأستاذ شخصياً فالـ VIP.',
  },
  {
    q: 'ما الفرق بين الباقات؟',
    a: 'كل باقة تشمل كل محتوى الباقة الأدنى منها وتضيف مستوى جديد من المحتوى + متابعة أعمق. الباقة الممتازة مثلاً تشمل كل دروس الأساسية والاحترافية بالإضافة لدروس B1-B2 ومراجعات أسبوعية.',
  },
]

export default function PricingPage() {
  const { status } = useProfile()
  useAuth()

  return (
    <main className="min-h-screen bg-gray-950 pt-[80px] pb-16 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            خطط الاشتراك
          </div>
          <h1 className="text-white font-black text-3xl sm:text-4xl leading-tight mb-3">
            افتح كل الكورسات والمميزات
          </h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            4 باقات متدرجة — كل واحدة تبني على التي قبلها، مع محتوى أعمق ومتابعة أقرب من الأستاذ
          </p>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-gray-400 text-xs sm:text-sm">
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
        </div>

        {status.isPaid && (
          <div className="max-w-xl mx-auto mb-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
            <Crown className="w-6 h-6 text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-white font-black text-sm">أنت مشترك حالياً</div>
              {status.expiresInDays !== null && (
                <div className="text-emerald-300 text-xs font-semibold">
                  يبقى {status.expiresInDays} يوماً على انتهاء اشتراكك
                </div>
              )}
            </div>
            <Link
              href="/billing"
              className="text-xs font-black bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              إدارة الاشتراك
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-14 items-stretch">
          {PLANS.map(p => (
            <DetailedPlanCard key={p.id} plan={p} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-14 max-w-3xl mx-auto">
          <TrustBadge icon={Shield}    title="دفع آمن"           subtitle="تحويل بنكي مغربي" />
          <TrustBadge icon={Clock}     title="تفعيل خلال 24h"    subtitle="مراجعة يدوية للطلب" />
          <TrustBadge icon={RefreshCw} title="بدون تجديد تلقائي" subtitle="أنت تتحكم دائماً" />
        </div>

        <div className="max-w-5xl mx-auto mb-14">
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
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
              >
                <div className="flex items-center gap-1 text-amber-400 mb-2">
                  {[0,1,2,3,4].map(j => <Star key={j} className="w-3.5 h-3.5 fill-amber-400" />)}
                </div>
                <p className="text-gray-200 text-sm leading-relaxed mb-4">{t.text}</p>
                <div className="flex items-center gap-3 pt-3 border-t border-gray-800">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-lg shadow-lg shadow-blue-900/40">
                    {t.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-black text-sm">{t.name}</div>
                    <div className="text-gray-500 text-xs font-semibold">مستوى {t.level}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-10">
          <h2 className="text-white font-black text-xl text-center mb-5">أسئلة شائعة</h2>
          <div className="space-y-2">
            {FAQ.map(f => (
              <details
                key={f.q}
                className="group bg-gray-900 border border-gray-800 rounded-xl open:border-gray-700"
              >
                <summary className="cursor-pointer list-none p-4 flex items-center justify-between gap-3 text-white font-bold text-sm">
                  <span>{f.q}</span>
                  <span className="text-gray-500 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                </summary>
                <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        <div className="max-w-xl mx-auto text-center bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <MessageCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <div className="text-white font-black mb-1">محتاج تسأل قبل ما تشترك؟</div>
          <div className="text-gray-400 text-sm mb-4">
            تواصل معنا عبر واتساب، نجاوب خلال وقت قصير
          </div>
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

/* ────────── Detailed pricing card (dark theme) ────────── */

const COLOR_STYLES: Record<Plan['color'], {
  ring: string; border: string; accent: string; pillBg: string; pillText: string; ctaBg: string;
}> = {
  emerald: { ring: 'ring-emerald-500/20', border: 'border-emerald-500/60', accent: 'text-emerald-400', pillBg: 'bg-emerald-500/10', pillText: 'text-emerald-300', ctaBg: 'bg-emerald-500 hover:bg-emerald-400 text-gray-900' },
  blue:    { ring: 'ring-blue-500/20',    border: 'border-blue-500/60',    accent: 'text-blue-400',    pillBg: 'bg-blue-500/10',    pillText: 'text-blue-300',    ctaBg: 'bg-blue-500 hover:bg-blue-400 text-white' },
  violet:  { ring: 'ring-violet-500/20',  border: 'border-violet-500/60',  accent: 'text-violet-400',  pillBg: 'bg-violet-500/10',  pillText: 'text-violet-300',  ctaBg: 'bg-violet-500 hover:bg-violet-400 text-white' },
  orange:  { ring: 'ring-orange-500/20',  border: 'border-orange-500/60',  accent: 'text-orange-400',  pillBg: 'bg-orange-500/10',  pillText: 'text-orange-300',  ctaBg: 'bg-orange-500 hover:bg-orange-400 text-gray-900' },
  amber:   { ring: 'ring-amber-500/20',   border: 'border-amber-500/70',   accent: 'text-amber-400',   pillBg: 'bg-amber-500/10',   pillText: 'text-amber-300',   ctaBg: 'bg-amber-500 hover:bg-amber-400 text-gray-900' },
  slate:   { ring: 'ring-slate-500/20',   border: 'border-slate-500/60',   accent: 'text-slate-300',   pillBg: 'bg-slate-500/10',   pillText: 'text-slate-300',   ctaBg: 'bg-slate-200 hover:bg-white text-gray-900' },
}

function DetailedPlanCard({ plan }: { plan: Plan }) {
  const c = COLOR_STYLES[plan.color]
  const levelBadge =
    plan.levelFrom && plan.levelTo
      ? plan.levelFrom === plan.levelTo
        ? plan.levelFrom
        : `${plan.levelFrom} → ${plan.levelTo}`
      : 'مخصّص'
  const savings =
    plan.originalAmount && plan.originalAmount > plan.amount_mad
      ? plan.originalAmount - plan.amount_mad
      : null

  return (
    <div
      className={`relative flex flex-col bg-gray-900 border-2 rounded-2xl p-6 transition-all ${
        plan.highlight ? `${c.border} ring-2 ${c.ring} xl:scale-[1.02]` : 'border-gray-800'
      }`}
    >
      {plan.badge_ar && (
        <div
          className={`absolute -top-3 right-5 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
            plan.highlight
              ? 'bg-amber-500 text-gray-900'
              : plan.isPremium
              ? 'bg-white text-gray-900'
              : `${c.pillBg} ${c.pillText}`
          }`}
        >
          {plan.badge_ar}
        </div>
      )}

      <div className={`inline-flex self-start items-center gap-1.5 ${c.pillBg} ${c.pillText} text-[11px] font-black px-2.5 py-1 rounded-full mb-3`}>
        <Target className="w-3 h-3" />
        المستوى {levelBadge}
      </div>

      <h3 className="text-white font-black text-xl leading-tight">{plan.title_ar}</h3>
      <p className="text-gray-400 text-xs font-semibold mt-0.5">{plan.subtitle_ar}</p>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-white font-black text-4xl tracking-tight">{plan.amount_mad.toLocaleString()}</span>
        <span className="text-gray-400 text-sm font-bold">درهم</span>
        {plan.originalAmount && plan.originalAmount > plan.amount_mad && (
          <span className="text-gray-500 text-sm font-bold line-through">{plan.originalAmount.toLocaleString()}</span>
        )}
      </div>
      <div className="text-gray-500 text-xs font-semibold mt-1">
        {plan.duration_months === 1 ? 'دفعة واحدة' : `دفعة واحدة · وصول ${plan.duration_months} أشهر`}
      </div>
      {savings && (
        <div className="mt-2 inline-flex self-start items-center gap-1 bg-emerald-500/10 text-emerald-400 text-xs font-black px-2 py-1 rounded-md">
          <Flame className="w-3 h-3" /> وفّر {savings.toLocaleString()} درهم
        </div>
      )}

      <div className={`mt-5 ${c.pillBg} border border-white/5 rounded-xl p-3`}>
        <div className="flex items-center gap-1.5 text-[11px] font-black text-gray-300 uppercase tracking-wider mb-0.5">
          <Calendar className={`w-3 h-3 ${c.accent}`} />
          المتابعة
        </div>
        <div className="text-white text-sm font-bold leading-snug">{plan.followUpLabel_ar}</div>
        <div className="text-gray-400 text-xs font-semibold mt-0.5">المدة · {plan.followUpDuration_ar}</div>
      </div>

      {plan.includesPrevious_ar && (
        <div className="mt-4 text-[12px] font-black text-gray-300">
          <span className={c.accent}>✓</span> {plan.includesPrevious_ar}
        </div>
      )}

      <div className="mt-4 space-y-3 flex-1">
        <FeatureGroup
          icon={BookOpen}
          title="محتوى التعلّم"
          accent={c.accent}
          items={plan.lifetimePerks}
        />
        {plan.monthlyPerks.length > 0 && (
          <FeatureGroup
            icon={Calendar}
            title="المتابعة المستمرّة"
            accent={c.accent}
            items={plan.monthlyPerks}
          />
        )}
      </div>

      {plan.idealFor_ar && (
        <div className="mt-4 bg-white/5 border border-white/5 rounded-xl p-3 text-gray-300 text-xs leading-relaxed">
          <span className={`${c.accent} font-black`}>✦ </span>
          {plan.idealFor_ar}
        </div>
      )}

      <button
        type="button"
        id={plan.id}
        onClick={() => openSubscribe({
          source: `pricing_card_${plan.id}`,
          planId: plan.id,
        })}
        className={`mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-black transition-all ${
          plan.highlight || plan.isPremium ? c.ctaBg : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
      >
        اشترك الآن
        <ArrowLeft className="w-4 h-4" />
      </button>
    </div>
  )
}

function FeatureGroup({
  icon: Icon, title, accent, items,
}: { icon: typeof Crown; title: string; accent: string; items: string[] }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">
        <Icon className={`w-3.5 h-3.5 ${accent}`} />
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map(item => (
          <li key={item} className="flex items-start gap-2 text-gray-300 text-[13px] leading-snug">
            <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${accent}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TrustBadge({
  icon: Icon, title, subtitle,
}: { icon: typeof Crown; title: string; subtitle: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
      <Icon className="w-5 h-5 text-amber-400 mx-auto mb-2" />
      <div className="text-white font-black text-sm">{title}</div>
      <div className="text-gray-500 text-xs font-semibold">{subtitle}</div>
    </div>
  )
}
