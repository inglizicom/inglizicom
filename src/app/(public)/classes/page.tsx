'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Clock, Video, MessageCircle, CalendarCheck, Mic, Sparkles, ArrowLeft, Star,
} from 'lucide-react'
import { CLASS_PLANS, PAYMENT_WHATSAPP } from '@/data/plans'
import { ClassCard, WhatsAppCTABox } from '@/components/pricing/PlanCards'

const STEPS = [
  {
    icon: CalendarCheck,
    title: 'احجز موعدك',
    desc: 'تختار الباقة وتتواصل معنا على واتساب — نحدد معك المواعيد التي تناسب جدولك.',
  },
  {
    icon: Video,
    title: 'حصة مباشرة 1h30',
    desc: 'لقاء فيديو مباشر مع الأستاذ: محادثة، نطق، وتصحيح فوري — مصمم حول هدفك أنت.',
  },
  {
    icon: Mic,
    title: 'متابعة بين الحصص',
    desc: 'واجبات صوتية قصيرة على واتساب يصححها الأستاذ — حتى لا يتوقف تقدمك بين الحصص.',
  },
]

const FAQ = [
  {
    q: 'ما الفرق بين الحصص الفردية والمستويات؟',
    a: 'المستويات برنامج متكامل ذاتي بدروس مسجلة ومتابعة جماعية. الحصص الفردية تعلّم 1:1 مباشر مع الأستاذ — مخصّص تماماً لك، بإيقاعك وهدفك.',
  },
  {
    q: 'كيف تُحدد مواعيد الحصص؟',
    a: 'بعد الحجز نتفق معك على جدول ثابت يناسبك عبر واتساب. يمكن تعديل موعد أي حصة قبل 24 ساعة.',
  },
  {
    q: 'هل أحتاج مستوى معيناً للبدء؟',
    a: 'لا — الحصة الأولى تتضمن تشخيصاً لمستواك الحقيقي، ويُبنى البرنامج عليه. من الصفر الكامل إلى المتقدم.',
  },
  {
    q: 'هل يمكن الجمع بين الحصص ومستوى مسجّل؟',
    a: 'نعم، وهو الخيار الأقوى: الدروس المسجلة تبني الأساس، والحصص الفردية تسرّع الكلام. تواصل معنا لنرتب لك برنامجاً مدمجاً.',
  },
]

export default function ClassesPage() {
  return (
    <main className="min-h-screen bg-[#050d1a] pt-[80px] pb-20" dir="rtl">

      {/* ── HERO ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center pt-8 pb-10">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            1:1 Private Classes
          </div>

          <h1 className="text-white font-black text-4xl sm:text-5xl leading-tight mb-4">
            حصص خاصة
            <span className="text-amber-400"> وجهاً لوجه مع الأستاذ</span>
          </h1>

          <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed mb-8">
            أسرع طريق لكسر حاجز الكلام: حصة مباشرة 1h30 مصممة حول هدفك —
            سفر، عمل، مقابلة، أو ثقة في المحادثة. تصحيح فوري، وبرنامج يمشي بإيقاعك أنت.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-gray-400 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-white font-black">1h30</span> للحصة
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Video className="w-4 h-4 text-amber-400" />
              مباشرة <span className="text-white font-black">بالفيديو</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-amber-400" />
              متابعة <span className="text-white font-black">واتساب</span> بين الحصص
            </span>
          </div>
        </div>

        {/* Rate banner */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-4 bg-[#0a1628] border border-amber-500/30 rounded-2xl px-8 py-4">
            <Star className="w-6 h-6 text-amber-400 shrink-0 fill-amber-400" />
            <div className="text-right">
              <div className="text-white font-black text-xl">400 درهم / الحصة الواحدة</div>
              <div className="text-amber-300 text-sm font-bold">كلما اشتريت حصصاً أكثر، انخفض سعر الحصة — حتى 300 درهم</div>
            </div>
          </div>
        </div>

        {/* ── PLANS ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch mb-16">
          {CLASS_PLANS.map(p => <ClassCard key={p.id} plan={p} />)}
        </div>

        {/* ── HOW A SESSION WORKS ───────────────────────── */}
        <div className="mb-16">
          <h2 className="text-white font-black text-2xl text-center mb-8">كيف تسير الحصص؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-[#0a1628] border border-[#1a2d4a] rounded-2xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                  <s.icon className="w-6 h-6 text-amber-400" />
                </div>
                <div className="text-amber-400 text-xs font-black mb-2">الخطوة {i + 1}</div>
                <h3 className="text-white font-black text-lg mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── CROSS-LINK to full programs ───────────────── */}
        <div className="max-w-3xl mx-auto mb-16 bg-gradient-to-l from-[#0a1628] to-[#0d1d36] border border-[#1a2d4a] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-right">
            <div className="text-white font-black">تفضّل برنامجاً متكاملاً بالدروس المسجلة؟</div>
            <div className="text-gray-400 text-sm mt-1">المستويات والباكات تعطيك منهجاً كاملاً + متابعة — بتكلفة أقل من الحصص.</div>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-black text-sm px-5 py-3 rounded-xl transition-colors whitespace-nowrap"
          >
            شوف المستويات والباكات <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* ── FAQ ───────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-white font-black text-xl text-center mb-5">أسئلة عن الحصص الخاصة</h2>
          <div className="space-y-2">
            {FAQ.map(f => (
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
