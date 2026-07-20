'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Briefcase, Presentation, PhoneCall, Handshake, Users2, Globe2,
  Sparkles, ArrowLeft,
} from 'lucide-react'
import { BUSINESS_PLANS, PAYMENT_WHATSAPP } from '@/data/plans'
import { BusinessCard, WhatsAppCTABox } from '@/components/pricing/PlanCards'

const SCENARIOS = [
  { icon: Presentation, title: 'اجتماعات وعروض', desc: 'تفتح الاجتماع، تعرض فكرتك، وتجيب عن الأسئلة بثقة.' },
  { icon: PhoneCall,    title: 'مكالمات ومؤتمرات', desc: 'مكالمات صوتية وفيديو بسلاسة — بلا توتر ولا تحضير مطوّل.' },
  { icon: Handshake,    title: 'تفاوض وإقناع',     desc: 'تعرض موقفك، تناقش الشروط، وتصل إلى اتفاق بالإنجليزية.' },
  { icon: Users2,       title: 'عملاء وشركاء',      desc: 'تبني علاقات مهنية مع عملاء وشركاء أجانب دون وسيط.' },
]

const AUDIENCE = [
  '👨‍💼 موظف يتعامل مع شركات أجنبية',
  '🚀 صاحب مشروع يريد التوسع خارجياً',
  '🎯 باحث عن ترقية أو وظيفة دولية',
  '💻 مستقل (فريلانسر) يخدم عملاء أجانب',
]

export default function BusinessPage() {
  const plan = BUSINESS_PLANS[0]

  return (
    <main className="min-h-screen bg-[#050d1a] pt-[80px] pb-20" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">

        {/* ── HERO ─────────────────────────────────────── */}
        <div className="text-center pt-8 pb-10">
          <div className="inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold px-3 py-1 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Business English
          </div>

          <h1 className="text-white font-black text-4xl sm:text-5xl leading-tight mb-4">
            الإنجليزية المهنية:
            <br />
            <span className="text-cyan-400">تكلّم — أقنع — ابهر</span>
          </h1>

          <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed mb-8">
            برنامج متخصص لبيئة العمل: اجتماعات، عروض، مكالمات، وتواصل مع العملاء.
            لا كتابة ولا قواعد — تدريب عملي على المواقف المهنية الحقيقية التي تواجهها كل يوم.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            {AUDIENCE.map(a => (
              <span key={a} className="px-3.5 py-1.5 rounded-full bg-[#0a1628] border border-[#1a2d4a] text-gray-300 font-bold">
                {a}
              </span>
            ))}
          </div>
        </div>

        {/* ── SCENARIOS ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {SCENARIOS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-[#0a1628] border border-[#1a2d4a] rounded-2xl p-5 text-center"
            >
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3">
                <s.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-white font-black text-base mb-1.5">{s.title}</h3>
              <p className="text-gray-400 text-[13px] leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ── THE PROGRAM ──────────────────────────────── */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-white font-black text-2xl text-center mb-8 flex items-center justify-center gap-2">
            <Briefcase className="w-6 h-6 text-cyan-400" />
            البرنامج الكامل
          </h2>
          {plan && <BusinessCard plan={plan} />}
        </div>

        {/* ── CROSS-LINKS ──────────────────────────────── */}
        <div className="max-w-3xl mx-auto mb-16 grid sm:grid-cols-2 gap-4">
          <div className="bg-[#0a1628] border border-[#1a2d4a] rounded-2xl p-6 flex flex-col gap-3">
            <Globe2 className="w-6 h-6 text-amber-400" />
            <div>
              <div className="text-white font-black">ما زلت تبني أساسك؟</div>
              <div className="text-gray-400 text-sm mt-1">ابدأ بالمستويات العامة أولاً — ثم انتقل إلى المهنية.</div>
            </div>
            <Link href="/pricing" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-black text-sm transition-colors">
              شوف المستويات <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-[#0a1628] border border-[#1a2d4a] rounded-2xl p-6 flex flex-col gap-3">
            <Users2 className="w-6 h-6 text-amber-400" />
            <div>
              <div className="text-white font-black">تفضّل تدريباً فردياً؟</div>
              <div className="text-gray-400 text-sm mt-1">حصص 1:1 مباشرة مع الأستاذ — مخصصة لهدفك المهني.</div>
            </div>
            <Link href="/classes" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-black text-sm transition-colors">
              شوف الحصص الخاصة <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <WhatsAppCTABox whatsapp={PAYMENT_WHATSAPP} />
      </div>
    </main>
  )
}
