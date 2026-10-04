import Link from 'next/link'
import { ArrowLeft, ChevronDown, Handshake, PhoneCall, Presentation, Users2, type LucideIcon } from 'lucide-react'
import { CTA_GOLD, FaqList, FinalCall, PageHero, SectionTitle } from '@/components/site/kit'
import OfferOptions from '@/components/site/OfferOptions'

/**
 * /business — the third way to learn: English for the workplace.
 * What you will be able to do, who it is for, the programme (and the pack
 * that adds the four levels to it), and when to start elsewhere instead.
 */

const SCENARIOS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Presentation, title: 'اجتماعات وعروض',  text: 'تفتح الاجتماع، تعرض فكرتك، وتجيب عن الأسئلة بثقة.' },
  { icon: PhoneCall,    title: 'مكالمات ومؤتمرات', text: 'مكالمات صوتية وفيديو بسلاسة — بلا توتر ولا تحضير طويل.' },
  { icon: Handshake,    title: 'تفاوض وإقناع',     text: 'تعرض موقفك، تناقش الشروط، وتصل إلى اتفاق بالإنجليزية.' },
  { icon: Users2,       title: 'عملاء وشركاء',     text: 'تبني علاقات مهنية مع عملاء وشركاء أجانب دون وسيط.' },
]

const AUDIENCE = ['موظف يتعامل مع شركات أجنبية', 'صاحب مشروع يريد التوسع', 'باحث عن ترقية أو وظيفة دولية', 'مستقل يخدم عملاء أجانب']

const FAQ = [
  { q: 'هل يشمل الكتابة والإيميلات؟', a: 'التركيز على الكلام — لأنه ما يخذل أغلب الناس في الاجتماع. المفردات المهنية التي تتعلّمها تخدم إيميلاتك تلقائيًا.' },
  { q: 'مستواي متوسط. هل يكفي؟', a: 'يكفي إذا كنت تجري محادثة يومية. إذا لم تكن كذلك، ابدأ بالدورة أولًا — البرنامج المهني يُبنى فوقها لا بدلًا منها.' },
  { q: 'هل يمكن أن يكون فرديًا؟', a: 'نعم، عبر الحصص الخاصة 1:1 مع الأستاذ، مخصّصة لهدفك المهني.' },
]

export default function BusinessPage() {
  return (
    <div dir="rtl" className="bg-white text-slate-900">
      <PageHero kicker="الإنجليزية المهنية · Business English" title="الإنجليزية المهنية" accent="تكلّم، أقنع، وانجح في عملك"
        sub="برنامج لبيئة العمل: اجتماعات، عروض، مكالمات، وتواصل مع العملاء. لا قواعد ولا حشو — تدريب على المواقف التي تواجهها فعلًا.">
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {AUDIENCE.map(a => (
            <span key={a} className="rounded-full bg-white ring-1 ring-slate-200 px-3 py-1.5 text-[13px] font-bold text-slate-600">{a}</span>
          ))}
        </div>
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <a href="#options" className={`${CTA_GOLD} w-full sm:w-auto text-[17px] px-7 py-4`}>
            شوف البرنامج والسعر <ChevronDown size={18} />
          </a>
          <Link href="/level-test" className="inline-flex items-center gap-1.5 px-4 py-3 text-[15px] font-bold text-brand-700 no-underline">
            اختبر مستواك أولًا <ArrowLeft size={16} />
          </Link>
        </div>
      </PageHero>

      <section className="px-5 sm:px-6 pb-14 sm:pb-20">
        <div className="max-w-[1200px] mx-auto grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SCENARIOS.map(x => (
            <div key={x.title} className="rounded-2xl bg-slate-50 ring-1 ring-slate-200/70 p-5">
              <span className="w-10 h-10 rounded-xl bg-white ring-1 ring-slate-200 text-brand-700 flex items-center justify-center"><x.icon size={20} /></span>
              <h3 className="mt-3 font-extrabold text-[16.5px]">{x.title}</h3>
              <p className="mt-1 text-[14.5px] leading-relaxed text-slate-600">{x.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="options" className="scroll-mt-20 bg-slate-50 py-14 sm:py-20 px-5 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle kicker="السعر" title="البرنامج المهني" sub="وحده، أو مع المستويات الأربعة في باك واحد." />
          <div className="mt-10">
            <OfferOptions source="business" options={[
              { kind: 'plan', planId: 'business', recommended: true },
              { kind: 'plan', planId: 'pack-complet' },
            ]} />
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 px-5 sm:px-6">
        <SectionTitle kicker="أسئلة" title="عن البرنامج المهني" />
        <div className="mt-8"><FaqList items={FAQ} /></div>
      </section>

      <FinalCall source="business_final_whatsapp" />
    </div>
  )
}
