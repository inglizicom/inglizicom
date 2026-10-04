import Link from 'next/link'
import {
  ArrowLeft, BriefcaseBusiness, Check, ChevronDown, GraduationCap, Mic, PlayCircle, ShieldCheck, Star, UserRound,
  type LucideIcon,
} from 'lucide-react'
import { TESTIMONIALS, STATS } from '@/data/testimonials'
import { BUSINESS_PLANS, CLASS_PLANS, INDIVIDUAL_PLANS } from '@/data/plans'
import SubscribeButton from '@/components/SubscribeButton'
import { WhatsAppIcon } from '@/components/StickyCTA'

/**
 * The home page — one story, one action.
 *
 * Most visitors arrive from Instagram / TikTok / Facebook on a phone and decide
 * on the first screen. So: what you get and the free level test above the
 * fold; then how it works, the three ways to learn (one recommended), what
 * students say, four honest answers, and the same single action again.
 * About six phone screens, no slider, no counters, no side quests.
 *
 * The visual shows the product itself (a lesson, a corrected voice note)
 * instead of stock photos. Prices come from src/data/plans.ts.
 */

const minPrice = (xs: { amount_mad: number }[]) => Math.min(...xs.map(x => x.amount_mad))
const fmt = (n: number) => n.toLocaleString('en-US')

const CTA = 'inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold no-underline shadow-[0_6px_20px_rgba(245,158,11,0.35)] transition-colors'

export default function HomePage() {
  return (
    <div dir="rtl" className="bg-white text-slate-900">
      <Hero />
      <HowItWorks />
      <Offers />
      <Voices />
      <Answers />
      <FinalCall />
    </div>
  )
}

/* ── 1. Hero ─────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white pt-[88px] sm:pt-[112px] pb-14 sm:pb-20 px-5 sm:px-6">
      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1.5 text-[13px] font-bold text-slate-600 shadow-sm">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            {STATS.rating} · أكثر من {fmt(STATS.students)} طالب من {STATS.countries} دولة
          </div>

          <h1 className="mt-5 text-[34px] leading-[1.2] sm:text-[48px] lg:text-[56px] font-black tracking-tight">
            تكلّم الإنجليزية بثقة <span className="block text-brand-700">في 30 يومًا</span>
          </h1>
          <p className="mt-4 text-[17px] sm:text-[19px] leading-relaxed text-slate-600 max-w-[34rem]">
            دروس قصيرة بشرح عربي، تصحيح صوتي لنطقك، ومتابعة شخصية من الأستاذ حمزة على واتساب — من الصفر إلى الطلاقة.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
            <div className="flex flex-col items-stretch sm:items-start">
              <Link href="/level-test" className={`${CTA} text-[17px] px-7 py-4`}>
                اختبر مستواك مجانًا <ArrowLeft size={18} />
              </Link>
              <p className="mt-2 text-center sm:text-right text-[13px] font-semibold text-slate-500">3 دقائق · مجاني · تعرف مستواك والمسار المناسب لك</p>
            </div>
            <a href="#offers" className="inline-flex items-center justify-center gap-1.5 px-4 py-3 sm:py-4 text-[15px] font-bold text-brand-700 no-underline hover:text-brand-900">
              شوف طرق التعلّم <ChevronDown size={16} />
            </a>
          </div>

          <div className="mt-6 flex items-center gap-2 text-[14px] font-semibold text-slate-600">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
            لم تحسّ بالفرق في الأسبوع الأول؟ نعيد لك المبلغ كاملًا.
          </div>
        </div>

        <ProductPreview />
      </div>
    </section>
  )
}

/** The product itself: today's lesson and a corrected voice note. */
function ProductPreview() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-[440px] select-none">
      <div className="absolute -inset-6 rounded-[40px] bg-gradient-to-br from-brand-100/70 to-amber-100/60 blur-2xl" />
      <div className="relative space-y-3">
        <div className="rounded-3xl bg-white ring-1 ring-slate-200 shadow-xl shadow-slate-900/5 p-4">
          <div className="flex items-center justify-between text-[12.5px] font-bold text-slate-500">
            <span>درسك اليوم</span>
            <span className="rounded-full bg-brand-50 text-brand-700 px-2.5 py-0.5">المستوى A1</span>
          </div>
          <div className="mt-3 aspect-[16/8] rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 flex items-center justify-center relative overflow-hidden">
            <span className="absolute top-3 right-4 text-white/80 text-[13px] font-bold" dir="ltr">Introduce yourself</span>
            <PlayCircle size={52} className="text-white/95" strokeWidth={1.6} />
            <span className="absolute bottom-3 left-4 rounded-md bg-black/30 text-white text-[11.5px] font-bold px-2 py-0.5">6 دقائق</span>
          </div>
          <div className="mt-3 font-extrabold text-[15px]">عرّف بنفسك بثقة — بدون ترجمة في رأسك</div>
          <div className="mt-2.5 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full w-[42%] rounded-full bg-amber-400" /></div>
          <div className="mt-1.5 text-[12px] font-semibold text-slate-400">الدرس 5 من 12</div>
        </div>

        <div className="rounded-3xl bg-[#ECE5DD] p-3.5 space-y-2 shadow-lg shadow-slate-900/5">
          <div className="mr-auto w-[78%] rounded-2xl rounded-tl-md bg-[#DCF8C6] px-3 py-2.5 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0"><Mic size={15} /></span>
            <span className="flex-1 flex items-center gap-[3px] h-6" dir="ltr">
              {[8, 14, 20, 11, 17, 22, 9, 15, 19, 7, 13, 18, 10, 16, 12].map((h, i) => (
                <span key={i} className="w-[3px] rounded-full bg-emerald-700/60" style={{ height: h }} />
              ))}
            </span>
            <span className="text-[11px] font-bold text-slate-500">0:24</span>
          </div>
          <div className="ml-auto w-[86%] rounded-2xl rounded-tr-md bg-white px-3.5 py-2.5">
            <div className="text-[12px] font-extrabold text-brand-700">الأستاذ حمزة</div>
            <div className="text-[14px] leading-relaxed text-slate-800 mt-0.5">ممتاز! ركّز فقط على نطق <b dir="ltr">th</b> في <b dir="ltr">think</b> — اسمع التسجيل وأعِد 👌</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── 2. How it works ─────────────────────────────────────── */

function HowItWorks() {
  const STEPS = [
    { n: 1, title: 'اختبر مستواك', text: '3 دقائق تحدد نقطة انطلاقك والمسار المناسب لك.' },
    { n: 2, title: 'تعلّم بدروس قصيرة', text: 'فيديوهات من 5 إلى 8 دقائق بشرح عربي، وتمارين بعد كل درس.' },
    { n: 3, title: 'تكلّم وصحّح نطقك', text: 'ترسل تسجيلاتك الصوتية، والأستاذ يصحّحها ويتابعك شخصيًا.' },
  ]
  return (
    <section className="bg-slate-50 py-14 sm:py-20 px-5 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <SectionTitle kicker="كيف تشتغل" title="ثلاث خطوات، وتبدأ تتكلّم" />
        <ol className="mt-8 grid gap-3 md:grid-cols-3 md:gap-5">
          {STEPS.map(s => (
            <li key={s.n} className="flex md:flex-col gap-4 rounded-2xl bg-white ring-1 ring-slate-200 p-5">
              <span className="w-10 h-10 shrink-0 rounded-full bg-brand-700 text-white font-black text-[17px] flex items-center justify-center">{s.n}</span>
              <div>
                <h3 className="font-extrabold text-[17px]">{s.title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-slate-600">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ── 3. The three ways to learn ──────────────────────────── */

interface Door {
  href: string; icon: LucideIcon; title: string; lead: string; points: string[]
  price: string; priceNote?: string; cta: string; recommended?: boolean
}

function Offers() {
  const DOORS: Door[] = [
    {
      href: '/courses', icon: GraduationCap, title: 'الدورة + المتابعة', recommended: true,
      lead: 'تتعلّم بوتيرتك بدروس مسجّلة، ومعك متابعة أسبوعية من الأستاذ.',
      points: ['من الصفر (A0) إلى الطلاقة (B2)', 'تصحيح صوتي لتسجيلاتك', 'مجموعة واتساب ولايفات للمشتركين'],
      price: `${fmt(minPrice(INDIVIDUAL_PLANS.filter(p => p.courseSlug)))} د.م`, priceNote: 'ابتداءً من · المستوى الواحد',
      cta: 'اكتشف الدورة',
    },
    {
      href: '/classes', icon: UserRound, title: 'حصص خاصة 1:1',
      lead: 'حصة مباشرة مدتها ساعة ونصف، وجهًا لوجه مع الأستاذ.',
      points: ['برنامج مخصص لهدفك', 'تصحيح فوري في كل حصة', 'متابعة بين الحصص على واتساب'],
      price: `${fmt(minPrice(CLASS_PLANS))} د.م`, priceNote: 'للحصة · أقل مع الباقات',
      cta: 'اكتشف الحصص',
    },
    {
      href: '/business', icon: BriefcaseBusiness, title: 'الإنجليزية المهنية',
      lead: 'للاجتماعات والعروض والمكالمات في بيئة العمل.',
      points: ['مفردات العمل والتفاوض', 'محاكاة اجتماعات حقيقية', 'تصحيح شخصي من الأستاذ'],
      price: `${fmt(minPrice(BUSINESS_PLANS))} د.م`, priceNote: 'البرنامج كاملًا',
      cta: 'اكتشف البرنامج',
    },
  ]
  return (
    <section id="offers" className="scroll-mt-20 py-14 sm:py-20 px-5 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <SectionTitle kicker="طرق التعلّم" title="اختر طريقتك في التعلّم" sub="ثلاث طرق واضحة — والاختبار المجاني يقترح عليك الأنسب." />
        <div className="mt-8 grid gap-4 lg:grid-cols-3 lg:gap-5 items-stretch">
          {DOORS.map(d => (
            <article key={d.href}
              className={`relative flex flex-col rounded-3xl p-6 ${d.recommended ? 'bg-white ring-2 ring-brand-700 shadow-xl shadow-brand-900/10' : 'bg-white ring-1 ring-slate-200'}`}>
              {d.recommended && (
                <span className="absolute -top-3 right-6 rounded-full bg-brand-700 text-white text-[12px] font-extrabold px-3 py-1">الأكثر اختيارًا</span>
              )}
              <div className="flex items-center gap-3">
                <span className={`w-11 h-11 rounded-2xl flex items-center justify-center ${d.recommended ? 'bg-brand-700 text-white' : 'bg-brand-50 text-brand-700'}`}>
                  <d.icon size={21} />
                </span>
                <h3 className="text-[20px] font-black">{d.title}</h3>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{d.lead}</p>
              <ul className="mt-4 space-y-2">
                {d.points.map(p => (
                  <li key={p} className="flex items-start gap-2 text-[14.5px] font-semibold text-slate-700">
                    <Check size={17} className="text-emerald-600 mt-0.5 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-[26px] font-black">{d.price}</span>
                  {d.priceNote && <span className="text-[13px] font-semibold text-slate-500">{d.priceNote}</span>}
                </div>
                <Link href={d.href}
                  className={`mt-4 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[15.5px] font-extrabold no-underline transition-colors ${
                    d.recommended ? 'bg-brand-700 hover:bg-brand-800 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}>
                  {d.cta} <ArrowLeft size={17} />
                </Link>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 text-center text-[15px] font-semibold text-slate-600">
          محتار؟{' '}
          <Link href="/level-test" className="font-extrabold text-brand-700 no-underline hover:underline">اختبر مستواك مجانًا</Link>
          {' '}— ونقترح عليك الطريقة المناسبة.
        </p>
      </div>
    </section>
  )
}

/* ── 4. What students say ────────────────────────────────── */

function Voices() {
  return (
    <section className="bg-slate-50 py-14 sm:py-20">
      <div className="max-w-[1200px] mx-auto">
        <div className="px-5 sm:px-6">
          <SectionTitle kicker="آراء الطلاب" title="ماذا يقول الطلاب" />
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[14px] font-bold text-slate-600">
            <span className="flex">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={16} className="fill-amber-400 text-amber-400" />)}</span>
            {STATS.rating} من 5 · {STATS.reviews} تقييم
          </div>
        </div>
        {/* Phone: swipe sideways inside the strip; desktop: three columns. */}
        <div className="mt-8 flex lg:grid lg:grid-cols-3 gap-4 overflow-x-auto snap-x snap-mandatory px-5 sm:px-6 pb-2 [scrollbar-width:none]">
          {TESTIMONIALS.slice(0, 3).map(t => (
            <figure key={t.name} className="snap-start shrink-0 w-[84%] sm:w-[60%] lg:w-auto rounded-3xl bg-white ring-1 ring-slate-200 p-6">
              <div className="flex">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}</div>
              <blockquote className="mt-3 text-[15.5px] leading-[1.9] text-slate-700">«{t.text}»</blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 font-black flex items-center justify-center">{t.name.trim().charAt(0)}</span>
                <span>
                  <span className="block font-extrabold text-[14.5px]">{t.name}</span>
                  <span className="block text-[12.5px] font-semibold text-slate-500">وصل إلى مستوى {t.level}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── 5. Honest answers ───────────────────────────────────── */

function Answers() {
  const QA = [
    { q: 'درست الإنجليزية سنوات وما زلت لا أتكلم. أين المشكلة؟', a: 'المدرسة تعلّمك القواعد والكلمات، لا كيف تتكلم. هنا تبدأ الكلام من اليوم الأول: جمل قصيرة، محادثات حقيقية، وتصحيح لنطقك.' },
    { q: 'أنا خجول وأخاف من الخطأ. هل سأستطيع؟', a: 'نعم. ترسل تسجيلاتك الصوتية للأستاذ على واتساب، بعيدًا عن أعين الناس وبلا إحراج. كل خطأ يُصحَّح خطوة نحو الثقة.' },
    { q: 'هل 30 يومًا تكفي لأبدأ الكلام؟', a: 'إذا التزمت 15 إلى 20 دقيقة يوميًا، ففي اليوم الثلاثين تدير محادثة قصيرة بنفسك. السر هو الاستمرار، ونحن نتابعك حتى لا تتوقف.' },
    { q: 'هل يوجد ضمان؟', a: 'نعم. إن لم تقتنع خلال الأسبوع الأول نعيد لك المبلغ كاملًا، بلا أسئلة.' },
  ]
  return (
    <section className="py-14 sm:py-20 px-5 sm:px-6">
      <div className="max-w-[760px] mx-auto">
        <SectionTitle kicker="أسئلة" title="قبل أن تبدأ" />
        <div className="mt-8 space-y-2.5">
          {QA.map(x => (
            <details key={x.q} className="group rounded-2xl bg-white ring-1 ring-slate-200 open:ring-brand-200 open:shadow-sm">
              <summary className="list-none cursor-pointer flex items-center justify-between gap-4 p-5 font-extrabold text-[15.5px]">
                {x.q}
                <ChevronDown size={18} className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-5 -mt-1 text-[15px] leading-relaxed text-slate-600">{x.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-5 text-center">
          <Link href="/faq" className="text-[14.5px] font-bold text-brand-700 no-underline hover:underline">كل الأسئلة الشائعة</Link>
        </div>
      </div>
    </section>
  )
}

/* ── 6. The same single action, once more ────────────────── */

function FinalCall() {
  return (
    <section className="px-5 sm:px-6 pb-14 sm:pb-20">
      <div className="max-w-[1200px] mx-auto rounded-[28px] bg-brand-800 text-white text-center px-6 py-12 sm:py-16">
        <h2 className="text-[28px] sm:text-[40px] font-black leading-tight">جاهز تبدأ تتكلّم؟</h2>
        <p className="mt-3 text-[16px] sm:text-[18px] text-blue-100/85 max-w-[34rem] mx-auto">
          ابدأ باختبار مستواك المجاني: 3 دقائق، وتعرف من أين تبدأ وما الطريقة الأنسب لك.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/level-test" className={`${CTA} w-full sm:w-auto text-[17px] px-8 py-4`}>
            اختبر مستواك مجانًا <ArrowLeft size={18} />
          </Link>
          <SubscribeButton source="home_final_whatsapp"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/15 ring-1 ring-white/25 px-6 py-4 text-[15.5px] font-bold text-white transition-colors">
            <WhatsAppIcon size={19} /> أو اسألنا على واتساب
          </SubscribeButton>
        </div>
      </div>
    </section>
  )
}

/* ── Shared ──────────────────────────────────────────────── */

function SectionTitle({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="text-center">
      <div className="text-[13px] font-extrabold text-amber-600">{kicker}</div>
      <h2 className="mt-1.5 text-[26px] sm:text-[36px] font-black tracking-tight leading-tight">{title}</h2>
      {sub && <p className="mt-2.5 text-[15.5px] sm:text-[17px] text-slate-600">{sub}</p>}
    </div>
  )
}
