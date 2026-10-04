import Link from 'next/link'
import { ArrowLeft, Clock, RefreshCw, Shield, ShieldCheck, type LucideIcon } from 'lucide-react'
import { CARD, CTA_GOLD, FaqList, FinalCall, ICON_TILE, PageHero, SectionTitle } from '@/components/site/kit'
import PricingTabs, { PaidBanner } from '@/components/site/PricingTabs'

/**
 * /pricing — every price in one place, organised as the three ways to learn
 * (course, private classes, business), at most three options each with one
 * recommended. The level test stays the way to choose when unsure.
 */

const TRUST: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Shield,      title: 'دفع آمن',            text: 'داخل المغرب وخارجه' },
  { icon: Clock,       title: 'تفعيل خلال 24 ساعة', text: 'بعد تأكيد الدفع' },
  { icon: RefreshCw,   title: 'بدون تجديد تلقائي',  text: 'أنت تتحكم دائمًا' },
  { icon: ShieldCheck, title: 'ضمان الأسبوع الأول', text: 'أو نعيد لك المبلغ' },
]

const FAQ = [
  { q: 'هل تدرّسون القواعد؟', a: 'نركّز على الكلام من أول يوم. القواعد تكتسبها وأنت تتكلم — كما تعلّمت العربية وأنت طفل.' },
  { q: 'ما الفرق بين الباكات والمستوى الواحد؟', a: 'المستوى الواحد تشتريه وحده. الباك يجمع مستويات متصلة بسعر أقل ويضمن لك ألا تتوقف بين مستوى وآخر.' },
  { q: 'كيف أدفع؟', a: 'داخل المغرب: تحويل بنكي. من خارج المغرب (السعودية، الإمارات، الخليج…) نرتّب طريقة الدفع معك على واتساب. بعد الدفع يُفعَّل حسابك خلال 24 ساعة.' },
]

export default function PricingPage() {
  return (
    <div dir="rtl" className="bg-white text-slate-900">
      <PageHero kicker="الأسعار" title="أوقف الترجمة في رأسك." accent="ابدأ تتكلّم."
        sub="ثلاث طرق للتعلّم، وكل الأسعار في مكان واحد — مع متابعة شخصية وضمان الأسبوع الأول في كل واحدة.">
        <div className="mt-7">
          <Link href="/level-test" className={`${CTA_GOLD} text-[16px] px-6 py-3.5`}>
            محتار؟ اختبر مستواك مجانًا <ArrowLeft size={17} />
          </Link>
        </div>
      </PageHero>

      <section className="bg-gradient-to-b from-brand-50 via-[#F3F7FF] to-white py-14 sm:py-20 px-5 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <PaidBanner />
          <PricingTabs />
        </div>
      </section>

      <section className="py-12 sm:py-16 px-5 sm:px-6">
        <div className="max-w-[1000px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3">
          {TRUST.map(t => (
            <div key={t.title} className={`ig-reveal p-5 text-center ${CARD}`}>
              <span className={`mx-auto w-11 h-11 ${ICON_TILE}`}><t.icon size={20} /></span>
              <div className="mt-2 font-extrabold text-[14.5px]">{t.title}</div>
              <div className="text-[13px] font-semibold text-slate-500">{t.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-14 sm:py-20 px-5 sm:px-6">
        <SectionTitle kicker="أسئلة" title="عن الأسعار والدفع" />
        <div className="mt-8"><FaqList items={FAQ} /></div>
      </section>

      <div className="pt-14 sm:pt-20"><FinalCall source="pricing_final_whatsapp" /></div>
    </div>
  )
}
