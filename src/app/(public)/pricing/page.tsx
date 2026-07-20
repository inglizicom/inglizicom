'use client'

import Link from 'next/link'
import {
  Crown, Sparkles, Clock, Shield, RefreshCw, Star, Users,
  Globe, ArrowLeft, Video, Briefcase, BookOpen,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useProfile } from '@/lib/profile-context'
import {
  INDIVIDUAL_PLANS, PACK_PLANS, CLASS_PLANS, BUSINESS_PLANS, PAYMENT_WHATSAPP,
} from '@/data/plans'
import { TESTIMONIALS, STATS } from '@/data/testimonials'
import {
  SectionHeadline, PackCard, IndividualCard, TrustBadge, WhatsAppCTABox,
} from '@/components/pricing/PlanCards'

const FAQ_PREVIEW: { q: string; a: string }[] = [
  {
    q: 'هل تدرّسون القواعد؟',
    a: 'لا. نحن نركز على الكلام من أول يوم. القواعد تكتسبها تلقائياً وأنت تتحدث — بالضبط كيف تعلّمت العربية وأنت طفل.',
  },
  {
    q: 'ما الفرق بين الباكات والمستويات الفردية؟',
    a: 'المستويات تُشترى واحداً واحداً. الباكات تجمع مستويين أو أكثر بسعر أوفر ورحلة متصلة تضمن لك الاستمرارية.',
  },
  {
    q: 'كيف أدفع؟',
    a: 'داخل المغرب: تحويل بنكي، ومن خارج المغرب (السعودية، الإمارات، الخليج…) نرتّب طريقة الدفع معك عبر واتساب. بعد الدفع يُفعَّل حسابك خلال 24 ساعة.',
  },
]

export default function PricingPage() {
  const { status } = useProfile()
  useAuth()

  const minClassPrice = Math.min(...CLASS_PLANS.map(p => p.amount_mad))
  const business = BUSINESS_PLANS[0]

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
            اختر رحلتك: باك موفّر لتحوّل كامل، أو مستوى واحد تبدأ به.
            متابعة شخصية على واتساب، وصول مدى الحياة، وضمان الأسبوع الأول.
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

          {/* Primary decision CTAs — the level test picks the right plan */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/level-test"
              className="inline-flex items-center gap-2 bg-gradient-to-l from-amber-400 to-yellow-500 text-blue-900 font-black text-sm sm:text-base px-7 py-3.5 rounded-2xl shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 transition-all border border-amber-300"
            >
              🧭 لست متأكداً؟ اختبر مستواك مجاناً
            </Link>
            <a
              href="#packs"
              className="inline-flex items-center gap-2 border-2 border-[#1e3455] hover:border-amber-400/50 text-white font-extrabold text-sm sm:text-base px-7 py-3.5 rounded-2xl transition-all hover:bg-white/5"
            >
              أعرف مستواي — اعرض الباقات ↓
            </a>
          </div>

          {/* Quick section nav */}
          <nav className="mt-8 flex flex-wrap items-center justify-center gap-2 text-[13px] font-bold" aria-label="أقسام الصفحة">
            {[
              { href: '#packs',    label: '📦 الباكات' },
              { href: '#levels',   label: '🎯 المستويات' },
              { href: '/classes',  label: '👨‍🏫 حصص 1:1' },
              { href: '/business', label: '💼 المهنية' },
              { href: '/faq',      label: '❓ الأسئلة' },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="px-3.5 py-1.5 rounded-full bg-[#0a1628] border border-[#1a2d4a] text-gray-300 hover:text-white hover:border-amber-400/40 transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
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
        id="packs"
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
        id="levels"
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

        {/* What a subscription unlocks — full showcase lives on /courses */}
        <div className="mt-10 max-w-3xl mx-auto bg-[#0a1628] border border-[#1a2d4a] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-right">
            <BookOpen className="w-8 h-8 text-emerald-400 shrink-0 hidden sm:block" />
            <div>
              <div className="text-white font-black">شنو كيفتح ليك الاشتراك؟</div>
              <div className="text-gray-400 text-sm mt-1">دورات تفاعلية كاملة بالصوت والصورة، تتبّع تقدّمك، كوينات ومكافآت.</div>
            </div>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 font-black text-sm px-5 py-3 rounded-xl transition-colors whitespace-nowrap"
          >
            شوف الدورات <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
            MORE PROGRAMS — moved to their own pages
            (ids kept so old #classes / #business links land here)
      ════════════════════════════════════════════════════ */}
      <SectionHeadline
        tag="More Programs"
        tagColor="text-amber-400"
        borderColor="border-amber-800/50"
        en="Private Classes & Business English"
        ar="برامج أخرى"
        sub="تدريب فردي مباشر مع الأستاذ، أو برنامج متخصص لبيئة العمل — لكلٍّ صفحته الكاملة."
      />
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-20">
        <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {/* Classes teaser */}
          <Link
            id="classes"
            href="/classes"
            className="scroll-mt-24 group bg-[#0a1628] border-2 border-[#1a2d4a] hover:border-amber-500/50 rounded-2xl p-7 flex flex-col gap-4 transition-all no-underline"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Video className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-black tracking-widest uppercase text-amber-400 mb-1">1:1 Private Classes</div>
              <h3 className="font-black text-xl text-white mb-2">الحصص الخاصة</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                حصة مباشرة 1h30 مع الأستاذ — برنامج مخصص لهدفك، وتصحيح فوري.
                ابتداءً من <span className="text-white font-black">{minClassPrice.toLocaleString()} درهم</span> للحصة.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-amber-400 group-hover:text-amber-300 font-black text-sm transition-colors">
              شوف العروض والأسعار <ArrowLeft className="w-4 h-4" />
            </span>
          </Link>

          {/* Business teaser */}
          <Link
            id="business"
            href="/business"
            className="scroll-mt-24 group bg-[#0a1628] border-2 border-[#1a2d4a] hover:border-cyan-500/50 rounded-2xl p-7 flex flex-col gap-4 transition-all no-underline"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-black tracking-widest uppercase text-cyan-400 mb-1">Business English</div>
              <h3 className="font-black text-xl text-white mb-2">الإنجليزية المهنية</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                اجتماعات، عروض، ومكالمات بثقة — برنامج المحترفين الكامل
                بـ<span className="text-white font-black">{business ? business.amount_mad.toLocaleString() : '3,500'} درهم</span>.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-cyan-400 group-hover:text-cyan-300 font-black text-sm transition-colors">
              اعرف المزيد <ArrowLeft className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>

      {/* ── TRUST + TESTIMONIALS + FAQ + CTA ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 pb-4">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto mb-16">
          <TrustBadge icon={Shield}    title="دفع آمن"           subtitle="داخل المغرب وخارجه" />
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
            {TESTIMONIALS.slice(0, 3).map((t, i) => (
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

        <div id="faq" className="max-w-2xl mx-auto mb-16 scroll-mt-24">
          <h2 className="text-white font-black text-xl text-center mb-5">أسئلة شائعة</h2>
          <div className="space-y-2">
            {FAQ_PREVIEW.map(f => (
              <details key={f.q} className="group bg-[#0a1628] border border-[#1a2d4a] rounded-xl open:border-[#1e3455]">
                <summary className="cursor-pointer list-none p-4 flex items-center justify-between gap-3 text-white font-bold text-sm">
                  <span>{f.q}</span>
                  <span className="text-gray-500 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                </summary>
                <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link href="/faq" className="text-amber-400 hover:text-amber-300 text-sm font-black transition-colors">
              كل الأسئلة الشائعة ←
            </Link>
          </div>
        </div>

        <WhatsAppCTABox whatsapp={PAYMENT_WHATSAPP} />

      </div>
    </main>
  )
}
