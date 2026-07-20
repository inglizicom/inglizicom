import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { PAYMENT_WHATSAPP } from '@/data/plans'

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة',
  description:
    'كل الأسئلة الشائعة عن منصة إنجليزي.كوم — المنهج، المتابعة الشخصية مع الأستاذ حمزة، الفرق بين الباقات، طرق الدفع، والضمان. إجابات صريحة قبل أن تسأل.',
  alternates: { canonical: 'https://inglizi.com/faq' },
}

type QA = { q: string; a: string }

const GROUPS: { title: string; emoji: string; items: QA[] }[] = [
  {
    title: 'البداية والمنهج',
    emoji: '🎯',
    items: [
      {
        q: 'درست الإنجليزية سنوات في المدرسة وما زلت لا أستطيع التحدث. أين المشكلة؟',
        a: 'المدرسة تعلّمك القواعد والكلمات، لكنها لا تعلّمك كيف تتحدث. مع الأستاذ حمزة تبدأ الحديث من اليوم الأول — جُمل قصيرة، محادثات حقيقية، وتصحيح فوري. وبعد 30 يوماً ستجد نفسك تتحدث دون أن تفكر في الترجمة.',
      },
      {
        q: 'هل تدرّسون القواعد؟',
        a: 'لا. نحن نركز على الكلام من أول يوم. القواعد تكتسبها تلقائياً وأنت تتحدث — بالضبط كيف تعلّمت العربية وأنت طفل.',
      },
      {
        q: 'جرّبت Duolingo وتطبيقات أخرى دون نتيجة. لماذا سيكون هذا البرنامج مختلفاً؟',
        a: 'التطبيقات تعلّمك كلمات منفصلة، بينما تحتاج أنت إلى التدرب مع إنسان حقيقي يصحّح لك ويتابعك ويفهم سياقك العربي. حمزة يجمع بين دروس مسجلة + متابعة شخصية + مجموعة واتساب — نظام كامل وليس لعبة.',
      },
      {
        q: 'هل 30 يوماً تكفي لأبدأ التحدث؟',
        a: 'نعم — إذا التزمت 15-20 دقيقة يومياً بالمنهج الصحيح. في الأسبوع الأول تحفظ أكثر من 50 جملة يومية، وفي الأسبوع الثاني تبدأ باستخدامها، وفي اليوم 30 تدير محادثة قصيرة بنفسك. المفتاح هو الاستمرارية — ونحن نتابعك حتى لا تتوقف.',
      },
      {
        q: 'مشغول بالعمل أو الدراسة ولا أملك وقتاً. هل أستفيد؟',
        a: 'الدروس كلها مسجلة وتبقى معك مدى الحياة — تشاهدها متى شئت وأينما كنت. 15-20 دقيقة يومياً تكفي. معظم طلابنا مشغولون — وهذا بالضبط ما صُمِّم له النظام.',
      },
      {
        q: 'تقدّم بي العمر وأشعر أن الحفظ صار أصعب. هل أستطيع التعلم؟',
        a: 'منهج الأستاذ حمزة لا يقوم على الحفظ بل على التفعيل. كل متعلم يعرف كلمات إنجليزية أكثر مما يظن — والطريقة تعلّمك كيف تستخدمها. لدينا طلاب تجاوزوا الخمسين وغيّروا حياتهم في 3 أشهر.',
      },
    ],
  },
  {
    title: 'المتابعة والأستاذ',
    emoji: '👨‍🏫',
    items: [
      {
        q: 'أنا خجول جداً وأخاف من الخطأ. هل سأستطيع التحدث؟',
        a: 'هذا الخوف هو ما يوقفك. الأستاذ حمزة يتابعك شخصياً على واتساب — ترسل له رسائل صوتية في أي وقت، بعيداً عن أعين الناس وبلا إحراج. كل خطأ خطوة تقدّم — نصحّحه معك بلطف.',
      },
      {
        q: 'هل الأستاذ حمزة نفسه من يتابعني أم مساعد؟',
        a: 'حمزة شخصياً هو من يرد على واتساب — لا روبوت ولا مساعد. في باقات المستوى الثاني والثالث وVIP تنضم إلى مجموعة واتساب مباشرة معه + تدريب شخصي في VIP. تسجّل صوتك وهو يصحّحه بنفسه.',
      },
      {
        q: 'كيف تتم المتابعة عملياً؟',
        a: 'بعد كل درس تسجل صوتك وترسله عبر واتساب. الأستاذ يستمع إليك شخصياً ويصحح نطقك ويعطيك تغذية راجعة مفصلة — وكل أسبوع واجبات بسيطة نراجعها معك.',
      },
    ],
  },
  {
    title: 'الباقات والفرق بينها',
    emoji: '📦',
    items: [
      {
        q: 'ما الفرق بين الباكات والمستويات الفردية؟',
        a: 'المستويات تُشترى واحداً واحداً. الباكات تجمع مستويين أو أكثر بسعر أوفر ورحلة متصلة تضمن لك الاستمرارية. كل التفاصيل في صفحة الأسعار.',
      },
      {
        q: 'ما الفرق بين الحصص الفردية والمستويات؟',
        a: 'المستويات برنامج متكامل ذاتي بدروس مسجلة. الحصص الفردية تعلّم 1:1 مباشر مع الأستاذ — مخصّص تماماً لك، بإيقاعك وهدفك. لها صفحة خاصة: الحصص الخاصة.',
      },
      {
        q: 'ما الذي يميّز الإنجليزية المهنية؟',
        a: 'برنامج مخصص لبيئة العمل: اجتماعات، مكالمات، عروض، تواصل مع العملاء. لا كتابة، لا قواعد — فقط تكلم وأقنع. تفاصيله في صفحة الإنجليزية المهنية.',
      },
      {
        q: 'كيف أعرف مستواي قبل الاشتراك؟',
        a: 'اختبار المستوى المجاني على الموقع يحدد مستواك في 3 دقائق ويرشح لك الباقة المناسبة. ويمكنك أيضاً سؤالنا مباشرة على واتساب.',
      },
    ],
  },
  {
    title: 'الدفع والضمان',
    emoji: '💳',
    items: [
      {
        q: 'كيف أدفع؟ وهل يتجدد الاشتراك تلقائياً؟',
        a: 'داخل المغرب: تحويل بنكي CIH، ومن خارج المغرب (السعودية، الإمارات، الخليج…) نرتّب طريقة الدفع معك عبر واتساب — ويُفعَّل الاشتراك خلال أقل من 24 ساعة. لا تجديد تلقائي: أنت المتحكم، ينتهي الاشتراك في وقته بلا مفاجآت وبلا خصم من بطاقتك.',
      },
      {
        q: 'هل يوجد ضمان إن لم ينجح البرنامج معي؟',
        a: 'نعم. إن لم تقتنع خلال الأسبوع الأول نعيد لك المبلغ كاملاً بلا أسئلة. ولديك وصول مدى الحياة إلى الدروس — يبقى المحتوى معك حتى بعد انتهاء الاشتراك.',
      },
    ],
  },
]

const ALL_QA = GROUPS.flatMap(g => g.items)

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ALL_QA.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-white pt-[92px] pb-20" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto px-5 sm:px-6">
        {/* ── HERO ───────────────────────────────────── */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black px-3 py-1.5 rounded-full mb-4">
            ❓ إجابات صريحة — قبل أن تسأل
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 leading-tight mb-4">
            الأسئلة الشائعة
          </h1>
          <p className="text-gray-500 text-base font-semibold max-w-xl mx-auto">
            كل ما يسألنا عنه الطلاب — عن المنهج، المتابعة، الباقات، والدفع.
            وإن لم تجد سؤالك، واتساب مفتوح دائماً.
          </p>
        </div>

        {/* ── GROUPS ─────────────────────────────────── */}
        <div className="space-y-10">
          {GROUPS.map(group => (
            <section key={group.title}>
              <h2 className="flex items-center gap-2.5 text-xl font-black text-gray-900 mb-4">
                <span className="text-2xl">{group.emoji}</span>
                {group.title}
              </h2>
              <div className="space-y-2">
                {group.items.map(f => (
                  <details
                    key={f.q}
                    className="group bg-gray-50 border border-gray-200 rounded-2xl open:border-gray-300 open:bg-white open:shadow-sm transition-shadow"
                  >
                    <summary className="cursor-pointer list-none p-4 sm:p-5 flex items-center justify-between gap-3 text-gray-900 font-black text-sm sm:text-base">
                      <span>{f.q}</span>
                      <span className="text-gray-400 group-open:rotate-45 transition-transform text-xl leading-none shrink-0">+</span>
                    </summary>
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-gray-600 text-sm leading-relaxed font-semibold">
                      {f.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* ── QUICK LINKS ────────────────────────────── */}
        <div className="mt-12 grid sm:grid-cols-3 gap-3 text-center">
          <Link href="/pricing" className="bg-white border-2 border-gray-100 hover:border-blue-200 rounded-2xl p-4 font-black text-sm text-gray-800 shadow-sm hover:shadow-md transition-all">
            💰 المستويات والباكات
          </Link>
          <Link href="/classes" className="bg-white border-2 border-gray-100 hover:border-amber-200 rounded-2xl p-4 font-black text-sm text-gray-800 shadow-sm hover:shadow-md transition-all">
            👨‍🏫 الحصص الخاصة 1:1
          </Link>
          <Link href="/business" className="bg-white border-2 border-gray-100 hover:border-cyan-200 rounded-2xl p-4 font-black text-sm text-gray-800 shadow-sm hover:shadow-md transition-all">
            💼 الإنجليزية المهنية
          </Link>
        </div>

        {/* ── WHATSAPP CTA ───────────────────────────── */}
        <div className="mt-10 text-center bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl p-8 shadow-xl shadow-blue-900/20">
          <MessageCircle className="w-9 h-9 text-emerald-400 mx-auto mb-3" />
          <div className="text-white font-black text-lg mb-1">لم تجد سؤالك؟</div>
          <div className="text-blue-100/80 text-sm mb-5 font-semibold">اسألنا مباشرة على واتساب — نرد خلال وقت قصير.</div>
          <a
            href={`https://wa.me/${PAYMENT_WHATSAPP.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#20c05c] text-white font-black text-sm px-7 py-3.5 rounded-xl transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            تواصل عبر واتساب
          </a>
        </div>
      </div>
    </main>
  )
}
