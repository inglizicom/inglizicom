import Link from 'next/link'
import { ArrowLeft, CalendarCheck, ChevronDown, Mic, Video } from 'lucide-react'
import { getPlan } from '@/data/plans'
import SubscribeButton from '@/components/SubscribeButton'
import { CTA_GOLD, FaqList, FinalCall, PageHero, SectionTitle, fmtMad } from '@/components/site/kit'
import OfferOptions from '@/components/site/OfferOptions'

/**
 * /classes — the second way to learn: live 1:1 sessions with the teacher.
 * How it works, three bundles (8 sessions recommended), a one-session trial
 * for the hesitant, and the honest comparison with the recorded course.
 */

const STEPS = [
  { icon: CalendarCheck, title: 'احجز موعدك', text: 'تختار الباقة، ونتفق معك على واتساب على مواعيد تناسب جدولك.' },
  { icon: Video,         title: 'حصة مباشرة 1h30', text: 'لقاء فيديو مع الأستاذ: محادثة، نطق، وتصحيح فوري — حول هدفك أنت.' },
  { icon: Mic,           title: 'متابعة بين الحصص', text: 'واجبات صوتية قصيرة على واتساب يصحّحها الأستاذ، حتى لا يتوقف تقدّمك.' },
]

const FAQ = [
  { q: 'ما الفرق بين الحصص الخاصة والدورة؟', a: 'الدورة دروس مسجّلة مع متابعة وتصحيح صوتي. الحصص الخاصة تعلّم مباشر 1:1 مع الأستاذ — مخصّص تمامًا لك، بإيقاعك وهدفك.' },
  { q: 'كيف تُحدد مواعيد الحصص؟', a: 'بعد الحجز نتفق معك على جدول ثابت يناسبك عبر واتساب. يمكن تعديل موعد أي حصة قبل 24 ساعة.' },
  { q: 'هل أحتاج مستوى معينًا للبدء؟', a: 'لا. الحصة الأولى تتضمن تشخيصًا لمستواك الحقيقي، ويُبنى البرنامج عليه — من الصفر إلى المتقدم.' },
  { q: 'هل يمكن الجمع بين الحصص والدورة؟', a: 'نعم، وهو الخيار الأقوى: الدروس المسجّلة تبني الأساس، والحصص تسرّع الكلام. تواصل معنا لنرتّب لك برنامجًا مدمجًا.' },
]

export default function ClassesPage() {
  const trial = getPlan('class-1')
  return (
    <div dir="rtl" className="bg-white text-slate-900">
      <PageHero kicker="حصص خاصة 1:1 · 1h30 للحصة" title="حصص خاصة" accent="وجهًا لوجه مع الأستاذ"
        sub="أسرع طريق لكسر حاجز الكلام: حصة مباشرة مصمّمة حول هدفك — سفر، عمل، مقابلة، أو ثقة في المحادثة — مع تصحيح فوري.">
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <a href="#options" className={`${CTA_GOLD} w-full sm:w-auto text-[17px] px-7 py-4`}>
            اختر باقتك <ChevronDown size={18} />
          </a>
          <Link href="/level-test" className="inline-flex items-center gap-1.5 px-4 py-3 text-[15px] font-bold text-brand-700 no-underline">
            أو اختبر مستواك أولًا <ArrowLeft size={16} />
          </Link>
        </div>
      </PageHero>

      <section className="px-5 sm:px-6 pb-14 sm:pb-20">
        <ol className="max-w-[1200px] mx-auto grid gap-3 md:grid-cols-3 md:gap-5">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex md:flex-col gap-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200/70 p-5">
              <span className="w-10 h-10 shrink-0 rounded-full bg-brand-700 text-white font-black text-[17px] flex items-center justify-center">{i + 1}</span>
              <div>
                <h3 className="font-extrabold text-[17px] flex items-center gap-2"><s.icon size={17} className="text-brand-700" /> {s.title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-slate-600">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="options" className="scroll-mt-20 bg-slate-50 py-14 sm:py-20 px-5 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle kicker="الأسعار" title="اختر عدد الحصص" sub="كلما زاد عدد الحصص انخفض سعر الحصة." />
          <div className="mt-10">
            <OfferOptions source="classes" options={[
              { kind: 'plan', planId: 'class-4' },
              { kind: 'plan', planId: 'class-8', recommended: true },
              { kind: 'plan', planId: 'class-12' },
            ]} />
          </div>
          {trial && (
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-2 text-[15px] font-semibold text-slate-600">
              تريد التجربة أولًا؟ حصة واحدة بـ {fmtMad(trial.amount_mad)}
              <SubscribeButton source="classes_trial" planId={trial.id}
                className="font-extrabold text-brand-700 hover:underline">
                احجز حصة تجريبية
              </SubscribeButton>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 px-5 sm:px-6">
        <div className="max-w-[860px] mx-auto rounded-3xl ring-1 ring-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
          <div>
            <div className="font-extrabold text-[16.5px]">تفضّل دروسًا مسجّلة بسعر أقل؟</div>
            <div className="text-[14.5px] text-slate-600 mt-1">الدورة تعطيك منهجًا كاملًا بأربعة مستويات + متابعة وتصحيح صوتي.</div>
          </div>
          <Link href="/courses" className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-slate-100 hover:bg-slate-200 px-5 py-3 text-[14.5px] font-extrabold text-slate-900 no-underline">
            شوف الدورة <ArrowLeft size={16} />
          </Link>
        </div>
      </section>

      <section className="bg-slate-50 py-14 sm:py-20 px-5 sm:px-6">
        <SectionTitle kicker="أسئلة" title="عن الحصص الخاصة" />
        <div className="mt-8"><FaqList items={FAQ} /></div>
      </section>

      <div className="pt-14 sm:pt-20"><FinalCall source="classes_final_whatsapp" /></div>
    </div>
  )
}
