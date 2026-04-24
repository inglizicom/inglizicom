'use client'

import Link from 'next/link'
import { Crown, Check, ArrowLeft, Sparkles, MessageCircle, Clock, Shield, RefreshCw, Star, Users, Globe } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useProfile } from '@/lib/profile-context'
import { PLANS, PAYMENT_WHATSAPP } from '@/data/plans'
import { TESTIMONIALS, STATS } from '@/data/testimonials'

const BENEFITS = [
  'دخول كامل لجميع الكورسات',
  'دروس جديدة كل أسبوع',
  'متابعة شخصية من الأستاذ',
  'إلغاء في أي وقت',
]

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
]

export default function PricingPage() {
  const { user } = useAuth()
  const { status } = useProfile()

  return (
    <main className="min-h-screen bg-gray-950 pt-[80px] pb-16 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            خطط الاشتراك
          </div>
          <h1 className="text-white font-black text-3xl sm:text-4xl leading-tight mb-3">
            افتح كل الكورسات والمميزات
          </h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            اختر المدة المناسبة لك، وابدأ التعلم فوراً بعد تأكيد الدفع
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {PLANS.map(p => (
            <div
              key={p.id}
              className={`relative bg-gray-900 border-2 rounded-2xl p-6 transition-all ${
                p.highlight
                  ? 'border-amber-500 ring-2 ring-amber-500/20 md:scale-105'
                  : 'border-gray-800'
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 right-5 text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-500 text-gray-900 uppercase tracking-wider">
                  الأكثر طلباً
                </div>
              )}

              <h3 className="text-white font-black text-xl mb-2">{p.title_ar}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-white font-black text-4xl">{p.amount_mad}</span>
                <span className="text-gray-400 text-sm font-bold">درهم</span>
              </div>
              <div className="text-gray-500 text-xs font-semibold mb-3">
                {p.duration_months === 1 ? 'شهرياً' : `لمدة ${p.duration_months} أشهر`}
              </div>
              {p.originalAmount && p.originalAmount > p.amount_mad && (
                <div className="inline-block bg-emerald-500/10 text-emerald-400 text-xs font-black px-2 py-1 rounded-md mb-4">
                  وفّر {p.originalAmount - p.amount_mad} درهم
                </div>
              )}

              <ul className="space-y-2 mb-6 mt-5">
                {BENEFITS.map(b => (
                  <li key={b} className="flex items-start gap-2 text-gray-300 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={user ? '/billing' : `/login?next=${encodeURIComponent('/billing')}`}
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-black transition-all ${
                  p.highlight
                    ? 'bg-amber-500 hover:bg-amber-400 text-gray-900'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                اشترك الآن
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12 max-w-3xl mx-auto">
          <TrustBadge icon={Shield}    title="دفع آمن"        subtitle="تحويل بنكي مغربي" />
          <TrustBadge icon={Clock}     title="تفعيل خلال 24h" subtitle="مراجعة يدوية للطلب" />
          <TrustBadge icon={RefreshCw} title="بدون تجديد تلقائي" subtitle="أنت تتحكم دائماً" />
        </div>

        <div className="max-w-5xl mx-auto mb-12">
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
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-lg`}>
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
