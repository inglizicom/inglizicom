import Link from 'next/link'
import {
  ArrowLeft, BriefcaseBusiness, Check, ChevronDown, GraduationCap, Headphones, Mic, PlayCircle, Quote,
  ShieldCheck, Sparkles, Star, UserRound, type LucideIcon,
} from 'lucide-react'
import { TESTIMONIALS, STATS } from '@/data/testimonials'
import { BUSINESS_PLANS, CLASS_PLANS, INDIVIDUAL_PLANS } from '@/data/plans'
import { BTN_NAVY, CARD, CTA_GOLD as CTA, FaqList, FinalCall, ICON_TILE, NavyGround, SectionTitle } from '@/components/site/kit'

/**
 * The home page — one story, one action.
 *
 * Most visitors arrive from Instagram / TikTok / Facebook on a phone and decide
 * on the first screen. So: what you get and the free level test above the
 * fold, on a deep navy ground where the gold button cannot be missed; then how
 * it works, the three ways to learn (one recommended), what students say,
 * four honest answers, and the same single action again.
 *
 * The visual is the product itself (a lesson, a voice note being corrected),
 * gently alive: the cards float, the waveform plays, the progress bar fills.
 * Sections rise in as they scroll into view (globals.css, .ig-*). Prices come
 * from src/data/plans.ts.
 */

const minPrice = (xs: { amount_mad: number }[]) => Math.min(...xs.map(x => x.amount_mad))
const fmt = (n: number) => n.toLocaleString('en-US')

export default function HomePage() {
  return (
    <div dir="rtl" className="bg-white text-slate-950">
      <Hero />
      <HowItWorks />
      <Offers />
      <Voices />
      <Answers />
      <div className="pt-4"><FinalCall source="home_final_whatsapp" /></div>
    </div>
  )
}

/* ── 1. Hero ─────────────────────────────────────────────── */

function Hero() {
  return (
    <NavyGround className="pt-[88px] sm:pt-[118px] pb-16 sm:pb-24 px-5 sm:px-6">
      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-14 items-center">
        <div>
          <div className="ig-pop inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur px-3.5 py-1.5 text-[13px] font-bold text-blue-50">
            <span className="flex">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={13} className="fill-amber-300 text-amber-300" />)}</span>
            {STATS.rating} · أكثر من {fmt(STATS.students)} طالب من {STATS.countries} دولة
          </div>

          <h1 className="ig-pop mt-6 text-[36px] leading-[1.15] sm:text-[52px] lg:text-[60px] font-black tracking-tight text-white [animation-delay:80ms]">
            تكلّم الإنجليزية بثقة
            <span className="relative block w-fit">
              <span className="bg-gradient-to-l from-amber-200 via-amber-300 to-amber-400 bg-clip-text text-transparent">في 30 يومًا</span>
              <svg aria-hidden viewBox="0 0 300 14" className="absolute -bottom-2 right-0 w-full h-3 text-amber-400/80" preserveAspectRatio="none">
                <path d="M2 10 C 80 2, 200 2, 298 8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="ig-pop mt-6 text-[17px] sm:text-[19px] leading-relaxed text-blue-100/90 max-w-[34rem] [animation-delay:160ms]">
            دروس قصيرة بشرح عربي، تصحيح صوتي لنطقك، ومتابعة شخصية من الأستاذ حمزة على واتساب — من الصفر إلى الطلاقة.
          </p>

          <div className="ig-pop mt-8 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 [animation-delay:240ms]">
            <div className="flex flex-col items-stretch sm:items-start">
              <Link href="/level-test" className={`${CTA} text-[17.5px] px-8 py-4`}>
                اختبر مستواك مجانًا <ArrowLeft size={19} />
              </Link>
              <p className="mt-2.5 text-center sm:text-right text-[13px] font-semibold text-blue-200/80">مجاني · يتوقف عند مستواك الحقيقي · ويقترح عليك المسار</p>
            </div>
            <a href="#offers" className="inline-flex items-center justify-center gap-1.5 px-4 py-3 sm:py-4 text-[15px] font-bold text-white/90 no-underline hover:text-white">
              شوف طرق التعلّم <ChevronDown size={16} className="animate-bounce" />
            </a>
          </div>

          <div className="ig-pop mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-400/10 ring-1 ring-emerald-300/25 px-3.5 py-2 text-[14px] font-semibold text-emerald-50 [animation-delay:320ms]">
            <ShieldCheck size={18} className="text-emerald-300 shrink-0" />
            لم تحسّ بالفرق في الأسبوع الأول؟ نعيد لك المبلغ كاملًا.
          </div>
        </div>

        <ProductPreview />
      </div>
    </NavyGround>
  )
}

/** The product itself: today's lesson and a voice note being corrected — gently alive. */
function ProductPreview() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-[440px] select-none">
      <div className="relative space-y-4">
        <div className="ig-float rounded-3xl bg-white p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/40">
          <div className="flex items-center justify-between text-[12.5px] font-bold text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> درسك اليوم</span>
            <span className="rounded-full bg-brand-50 text-brand-700 px-2.5 py-0.5">المستوى A1</span>
          </div>
          <div className="mt-3 aspect-[16/8] rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-[#0B1B4D] flex items-center justify-center relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-amber-400/25 blur-2xl" />
            <span className="absolute top-3 right-4 text-white/85 text-[13px] font-bold" dir="ltr">Introduce yourself</span>
            <span className="relative w-16 h-16 rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur flex items-center justify-center">
              <span className="absolute inset-0 rounded-full ring-2 ring-white/40 animate-ping" />
              <PlayCircle size={40} className="text-white" strokeWidth={1.6} />
            </span>
            <span className="absolute bottom-3 left-4 rounded-md bg-black/35 text-white text-[11.5px] font-bold px-2 py-0.5">6 دقائق</span>
          </div>
          <div className="mt-3 font-extrabold text-[15px] text-slate-900">عرّف بنفسك بثقة — بدون ترجمة في رأسك</div>
          <div className="mt-2.5 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="ig-fill h-full w-[42%] rounded-full bg-gradient-to-l from-amber-300 to-amber-500" /></div>
          <div className="mt-1.5 text-[12px] font-semibold text-slate-500">الدرس 5 من 12</div>
        </div>

        <div className="ig-float-late rounded-3xl bg-[#ECE5DD] p-3.5 space-y-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)] mr-6 sm:mr-10">
          <div className="mr-auto w-[80%] rounded-2xl rounded-tl-md bg-[#DCF8C6] px-3 py-2.5 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0"><Mic size={15} /></span>
            <span className="ig-wave flex-1 flex items-center gap-[3px] h-6" dir="ltr">
              {[8, 14, 20, 11, 17, 22, 9, 15, 19, 7, 13, 18, 10, 16, 12].map((h, i) => (
                <span key={i} className="w-[3px] rounded-full bg-emerald-700/70" style={{ height: h }} />
              ))}
            </span>
            <span className="text-[11px] font-bold text-slate-500">0:24</span>
          </div>
          <div className="ml-auto w-[88%] rounded-2xl rounded-tr-md bg-white px-3.5 py-2.5 shadow-sm">
            <div className="text-[12px] font-extrabold text-brand-700 flex items-center gap-1"><Headphones size={12} /> الأستاذ حمزة</div>
            <div className="text-[14px] leading-relaxed text-slate-800 mt-0.5">ممتاز! ركّز فقط على نطق <b dir="ltr">th</b> في <b dir="ltr">think</b> — اسمع التسجيل وأعِد 👌</div>
          </div>
        </div>

        <div className="ig-float absolute -top-4 -left-3 sm:-left-6 rounded-2xl bg-amber-300 text-slate-950 px-3.5 py-2 text-[12.5px] font-extrabold shadow-[0_14px_30px_-10px_rgba(245,158,11,0.8)] flex items-center gap-1.5 [animation-delay:-1.2s]">
          <Sparkles size={14} /> +12 كلمة جديدة اليوم
        </div>
      </div>
    </div>
  )
}

/* ── 2. How it works ─────────────────────────────────────── */

function HowItWorks() {
  const STEPS = [
    { n: 1, title: 'اختبر مستواك', text: 'اختبار مجاني يتوقف عند مستواك الحقيقي، ويقترح عليك المسار المناسب.' },
    { n: 2, title: 'تعلّم بدروس قصيرة', text: 'فيديوهات من 5 إلى 8 دقائق بشرح عربي، وتمارين بعد كل درس.' },
    { n: 3, title: 'تكلّم وصحّح نطقك', text: 'ترسل تسجيلاتك الصوتية، والأستاذ يصحّحها ويتابعك شخصيًا.' },
  ]
  return (
    <section className="py-16 sm:py-24 px-5 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <SectionTitle kicker="كيف تشتغل" title="ثلاث خطوات، وتبدأ تتكلّم" />
        <ol className="relative mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
          <div aria-hidden className="hidden md:block absolute top-11 right-[16%] left-[16%] h-[3px] rounded-full bg-gradient-to-l from-brand-200 via-amber-300 to-brand-200" />
          {STEPS.map(s => (
            <li key={s.n} className={`ig-reveal relative flex md:flex-col md:items-center md:text-center gap-4 p-5 sm:p-6 ${CARD}`}>
              <span className="relative w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 font-black text-[20px] flex items-center justify-center shadow-[0_10px_22px_-8px_rgba(245,158,11,0.8)]">{s.n}</span>
              <div>
                <h3 className="font-extrabold text-[18px] text-slate-950">{s.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-slate-700">{s.text}</p>
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
    <section id="offers" className="scroll-mt-20 relative bg-gradient-to-b from-brand-50 via-[#F3F7FF] to-white py-16 sm:py-24 px-5 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <SectionTitle kicker="طرق التعلّم" title="اختر طريقتك في التعلّم" sub="ثلاث طرق واضحة — والاختبار المجاني يقترح عليك الأنسب." />
        <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:gap-6 items-stretch">
          {DOORS.map(d => (
            <article key={d.href}
              className={`ig-reveal relative flex flex-col p-6 sm:p-7 ${d.recommended
                ? 'rounded-3xl bg-white ring-2 ring-brand-600 shadow-[0_30px_60px_-24px_rgba(30,64,175,0.55)] lg:-translate-y-3 transition-transform duration-300 hover:-translate-y-4'
                : CARD}`}>
              {d.recommended && (
                <span className="absolute -top-3.5 right-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-l from-amber-300 to-amber-400 text-slate-950 text-[12px] font-extrabold px-3 py-1 shadow-[0_8px_18px_-6px_rgba(245,158,11,0.8)]">
                  <Star size={12} className="fill-slate-950" /> الأكثر اختيارًا
                </span>
              )}
              <div className="flex items-center gap-3">
                <span className={`w-12 h-12 ${ICON_TILE}`}><d.icon size={22} /></span>
                <h3 className="text-[21px] font-black text-slate-950">{d.title}</h3>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-700">{d.lead}</p>
              <ul className="mt-5 space-y-2.5">
                {d.points.map(p => (
                  <li key={p} className="flex items-start gap-2.5 text-[14.5px] font-semibold text-slate-800">
                    <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center"><Check size={13} strokeWidth={3} /></span> {p}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-7">
                <div className="flex items-baseline gap-2">
                  <span className="text-[30px] font-black text-slate-950">{d.price}</span>
                  {d.priceNote && <span className="text-[13px] font-semibold text-slate-500">{d.priceNote}</span>}
                </div>
                <Link href={d.href}
                  className={`mt-4 w-full ${d.recommended ? BTN_NAVY : 'inline-flex items-center justify-center gap-2 rounded-2xl bg-white ring-1 ring-slate-300 hover:ring-brand-400 hover:text-brand-800 text-slate-900 font-extrabold no-underline transition-all'} py-3.5 text-[15.5px]`}>
                  {d.cta} <ArrowLeft size={17} />
                </Link>
              </div>
            </article>
          ))}
        </div>
        <p className="ig-reveal mt-8 text-center text-[15px] font-semibold text-slate-700">
          محتار؟{' '}
          <Link href="/level-test" className="font-extrabold text-brand-700 no-underline underline-offset-4 hover:underline">اختبر مستواك مجانًا</Link>
          {' '}— ونقترح عليك الطريقة المناسبة.
        </p>
      </div>
    </section>
  )
}

/* ── 4. What students say ────────────────────────────────── */

function Voices() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-[1200px] mx-auto">
        <div className="px-5 sm:px-6">
          <SectionTitle kicker="آراء الطلاب" title="ماذا يقول الطلاب" />
          <div className="ig-reveal mt-4 flex items-center justify-center gap-2 text-[14.5px] font-bold text-slate-700">
            <span className="flex">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={18} className="fill-amber-400 text-amber-400" />)}</span>
            {STATS.rating} من 5 · {STATS.reviews} تقييم
          </div>
        </div>
        {/* Phone: swipe sideways inside the strip; desktop: three columns. */}
        <div className="mt-10 flex lg:grid lg:grid-cols-3 gap-5 overflow-x-auto snap-x snap-mandatory px-5 sm:px-6 pb-4 pt-2 [scrollbar-width:none]">
          {TESTIMONIALS.slice(0, 3).map((t, i) => (
            <figure key={t.name} className={`ig-reveal snap-start shrink-0 w-[84%] sm:w-[60%] lg:w-auto relative p-6 sm:p-7 ${CARD}`}>
              <Quote aria-hidden size={40} className={`absolute top-5 left-5 ${i === 1 ? 'text-amber-300' : 'text-brand-100'}`} />
              <div className="flex">{[0, 1, 2, 3, 4].map(k => <Star key={k} size={15} className="fill-amber-400 text-amber-400" />)}</div>
              <blockquote className="relative mt-4 text-[16px] leading-[1.9] text-slate-800">«{t.text}»</blockquote>
              <figcaption className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
                <span className={`w-11 h-11 rounded-full font-black text-[17px] flex items-center justify-center ${ICON_TILE}`}>{t.name.trim().charAt(0)}</span>
                <span>
                  <span className="block font-extrabold text-[15px] text-slate-950">{t.name}</span>
                  <span className="block text-[13px] font-semibold text-emerald-700">وصل إلى مستوى {t.level}</span>
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
    <section className="bg-slate-50 py-16 sm:py-24 px-5 sm:px-6">
      <div className="max-w-[760px] mx-auto">
        <SectionTitle kicker="أسئلة" title="قبل أن تبدأ" />
        <div className="mt-10"><FaqList items={QA} /></div>
      </div>
    </section>
  )
}
