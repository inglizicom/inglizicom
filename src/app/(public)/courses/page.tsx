import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, ListChecks, Mic, PlayCircle, Trophy, type LucideIcon } from 'lucide-react'
import { COURSES } from '@/data/courses'
import { getPlan, getPlanByCourseSlug } from '@/data/plans'
import { CARD, CTA_GOLD, FaqList, FinalCall, Guarantee, ICON_TILE, PageHero, SectionTitle, fmtMad } from '@/components/site/kit'
import OfferOptions from '@/components/site/OfferOptions'

/**
 * /courses — the first way to learn: recorded lessons + personal follow-up.
 *
 * What you get, then the choice (one level, or connected levels — three
 * cards, the big pack recommended), then the four levels themselves with
 * their curriculum pages. Prices come from src/data/plans.ts.
 */

export const metadata: Metadata = {
  title: 'الدورة — 4 مستويات من الصفر إلى الطلاقة',
  description:
    'دورة إنجليزية بأربعة مستويات من A0 إلى B2: دروس فيديو قصيرة بشرح عربي، تصحيح صوتي شخصي من الأستاذ، تمارين، واختبار محادثة LIVE. ابدأ باختبار مستواك المجاني.',
  alternates: { canonical: 'https://inglizi.com/courses' },
}

/* One Course entry per level so each shows up in Arabic search with its own
   price and provider, instead of the page ranking as a single generic result. */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: COURSES.map((c, i) => {
    const plan = getPlanByCourseSlug(c.slug)
    return {
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Course',
        name: `${c.title} (${c.fromLevel} → ${c.toLevel})`,
        description: c.hook,
        url: `https://inglizi.com/courses/${c.slug}`,
        inLanguage: 'ar',
        provider: { '@type': 'Organization', name: 'Inglizi.com', sameAs: 'https://inglizi.com' },
        offers: { '@type': 'Offer', price: plan?.amount_mad ?? c.price, priceCurrency: 'MAD', availability: 'https://schema.org/InStock' },
      },
    }
  }),
}

const INCLUDED: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: PlayCircle, title: 'دروس فيديو قصيرة',  text: 'من 5 إلى 8 دقائق بشرح عربي، تشاهدها متى شئت وتبقى معك.' },
  { icon: Mic,        title: 'تصحيح صوتي شخصي',   text: 'ترسل تسجيلك بعد الدرس، والأستاذ يسمعك ويصحّح نطقك بنفسه.' },
  { icon: ListChecks, title: 'تمارين بعد كل درس',  text: 'تطبّق مباشرة ما تعلّمته، وتعرف دائمًا ما الخطوة التالية.' },
  { icon: Trophy,     title: 'اختبار محادثة LIVE',  text: 'في نهاية كل مستوى، محادثة حية مع الأستاذ تُثبت تقدّمك.' },
]

const FAQS = [
  { q: 'من أين أبدأ إذا لم أعرف شيئًا عن الإنجليزية؟', a: 'من المستوى الأول (A0 → A1). مصمَّم للمبتدئ الكامل ولا يفترض أي معرفة سابقة.' },
  { q: 'كيف تتم المتابعة مع الأستاذ؟', a: 'بعد كل درس تسجّل صوتك وترسله على واتساب. الأستاذ يستمع إليك شخصيًا ويصحّح نطقك ويعطيك ملاحظات في نفس اليوم.' },
  { q: 'ما الفرق بين المستوى الواحد والباك؟', a: 'المستوى الواحد تشتريه وحده وتنتقل للتالي متى شئت. الباك يجمع مستويات متصلة بسعر أقل، ويضمن لك ألا تتوقف بين مستوى وآخر.' },
  { q: 'كيف أعرف مستواي قبل التسجيل؟', a: 'اختبار المستوى المجاني يتوقف عند مستواك الحقيقي ويقترح عليك المستوى المناسب.' },
  { q: 'هل يوجد ضمان؟', a: 'نعم. إذا طبّقت الخطوات ولم تشعر بأي تحسّن خلال الأسبوع الأول، نعيد لك المبلغ كاملًا.' },
]

export default function CoursesPage() {
  const complet = getPlan('pack-complet')
  const vip = getPlan('vip')
  return (
    <div dir="rtl" className="bg-white text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero kicker="الدورة + المتابعة · 4 مستويات" title="دروس قصيرة ومتابعة حقيقية" accent="من الصفر إلى الطلاقة"
        sub="تتعلّم بوتيرتك بدروس مسجّلة تبقى معك، وبعد كل درس ترسل صوتك ويصحّحه الأستاذ شخصيًا.">
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <Link href="/level-test" className={`${CTA_GOLD} w-full sm:w-auto text-[17px] px-7 py-4`}>
            اختبر مستواك مجانًا <ArrowLeft size={18} />
          </Link>
          <a href="#options" className="inline-flex items-center gap-1.5 px-4 py-3 text-[15px] font-bold text-white/90 hover:text-white no-underline">
            شوف الأسعار <ChevronDown size={16} />
          </a>
        </div>
        <Guarantee className="mt-6" onDark />
      </PageHero>

      {/* What you get */}
      <section className="px-5 sm:px-6 py-14 sm:py-20">
        <div className="max-w-[1200px] mx-auto grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {INCLUDED.map(x => (
            <div key={x.title} className={`ig-reveal p-5 sm:p-6 ${CARD}`}>
              <span className={`w-12 h-12 ${ICON_TILE}`}><x.icon size={21} /></span>
              <h3 className="mt-4 font-extrabold text-[17px] text-slate-950">{x.title}</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-slate-700">{x.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The choice */}
      <section id="options" className="scroll-mt-20 bg-gradient-to-b from-brand-50 via-[#F3F7FF] to-white py-16 sm:py-24 px-5 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle kicker="الأسعار" title="اختر خطتك" sub="مستوى واحد تبدأ به، أو مستويات متصلة بسعر أوفر وبلا انقطاع." />
          <div className="mt-10">
            <OfferOptions source="courses" options={[
              { kind: 'pick', planIds: ['basic', 'pro', 'intermediate', 'premium'], title: 'مستوى واحد', sub: 'تبدأ من مستواك وتنتقل للتالي متى شئت' },
              { kind: 'plan', planId: 'pack-starter' },
              { kind: 'plan', planId: 'pack-intensif', recommended: true },
            ]} />
          </div>
          {(complet || vip) && (
            <p className="mt-7 text-center text-[14.5px] font-semibold text-slate-600 leading-relaxed">
              خيارات أخرى:{' '}
              {complet && <Link href="/pricing/pack-complet" className="font-extrabold text-brand-700 no-underline hover:underline">{complet.title_ar} — {fmtMad(complet.amount_mad)}</Link>}
              {complet && vip && ' · '}
              {vip && <Link href="/pricing/vip" className="font-extrabold text-brand-700 no-underline hover:underline">{vip.title_ar} مع الأستاذ شخصيًا — {fmtMad(vip.amount_mad)}</Link>}
            </p>
          )}
        </div>
      </section>

      {/* The four levels */}
      <section className="py-14 sm:py-20 px-5 sm:px-6">
        <div className="max-w-[860px] mx-auto">
          <SectionTitle kicker="المنهج" title="المستويات الأربعة" sub="كل مستوى يُبنى على السابق — والاختبار المجاني يحدد من أين تبدأ." />
          <ol className="mt-8 space-y-3">
            {COURSES.map((c, i) => {
              const plan = getPlanByCourseSlug(c.slug)
              return (
                <li key={c.slug}>
                  <Link href={`/courses/${c.slug}`}
                    className={`ig-reveal flex items-center gap-4 p-4 sm:p-5 no-underline ${CARD}`}>
                    <span className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 font-black text-[19px] flex items-center justify-center shadow-[0_10px_22px_-8px_rgba(245,158,11,0.8)]">{i + 1}</span>
                    <span className="flex-1 min-w-0">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-extrabold text-[16.5px] text-slate-900">{c.title}</span>
                        <span className="text-[13px] font-bold text-brand-700" dir="ltr">{c.fromLevel} → {c.toLevel}</span>
                      </span>
                      <span className="block text-[13.5px] font-semibold text-slate-500 mt-0.5">
                        {c.weeks} أسابيع · {c.lessons} درسًا{plan ? ` · ${fmtMad(plan.amount_mad)}` : ''}
                      </span>
                    </span>
                    <span className="hidden sm:inline text-[13.5px] font-bold text-brand-700">المنهج</span>
                    <ArrowLeft size={17} className="text-slate-400 shrink-0" />
                  </Link>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section className="bg-slate-50 py-14 sm:py-20 px-5 sm:px-6">
        <SectionTitle kicker="أسئلة" title="قبل التسجيل" />
        <div className="mt-8"><FaqList items={FAQS} /></div>
      </section>

      <div className="pt-14 sm:pt-20"><FinalCall source="courses_final_whatsapp" /></div>
    </div>
  )
}
