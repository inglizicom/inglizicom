'use client'

/**
 * /gcc — standalone Fus7a (MSA) conversion landing page for the Gulf market.
 * Sells the English Writing course (A1→B1 + professional writing) and funnels
 * leads into subscription_leads (source='gcc_landing') so the CRM + Broadcast +
 * push can follow up. Distraction-free: its own header/footer, no site chrome.
 */

import { useState } from 'react'
import {
  MessageCircle, Check, ChevronDown, PenLine, BookOpen, Mail, Award, Video,
  Zap, Loader2, GraduationCap, Star, ArrowLeft, Sparkles,
} from 'lucide-react'
import { createSubscriptionLead } from '@/lib/leads-db'

const WA = '212764189311'
const AR = { fontFamily: "'Tajawal', sans-serif" } as const
const waHref = (msg: string) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`
const WA_MSG = 'السلام عليكم، أنا مهتمّ بدورة الكتابة الإنجليزية (باقة الخليج). أودّ معرفة التفاصيل وطريقة التسجيل.'

const scrollToForm = () => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })

export default function GccLanding() {
  return (
    <div dir="rtl" style={AR} className="min-h-screen bg-white text-zinc-900 overflow-x-hidden">
      <Header />
      <Hero />
      <TrustBar />
      <Outcomes />
      <Units />
      <Offer />
      <Coaching />
      <Faq />
      <SignupSection />
      <Footer />
    </div>
  )
}

/* ── header ── */
function Header() {
  return (
    <header className="sticky top-0 z-40 bg-[#2a1d12]/95 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-yellow-400 text-[#2a1d12] flex items-center justify-center font-black text-lg">إن</div>
          <span className="text-white font-black text-lg">إنجليزي<span className="text-yellow-400">.كوم</span></span>
        </div>
        <a href={waHref(WA_MSG)} target="_blank" rel="noopener"
          className="flex items-center gap-2 rounded-full bg-yellow-400 text-[#2a1d12] font-black text-[13px] px-4 py-2 hover:bg-yellow-300 transition">
          <MessageCircle size={16} /> تواصل معنا
        </a>
      </div>
    </header>
  )
}

/* ── hero ── */
function Hero() {
  return (
    <section className="relative bg-[#2a1d12] text-white overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-yellow-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[32rem] h-[32rem] rounded-full bg-amber-500/10 blur-3xl" />
      <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-4 py-1.5 text-[13px] font-bold text-yellow-300 mb-6">
          <Sparkles size={14} /> خاصّ بدول الخليج · شرح بالعربية الفصحى
        </span>
        <h1 className="text-3xl sm:text-5xl font-black leading-[1.25] max-w-3xl mx-auto">
          اكتب الإنجليزية بثقة —
          <span className="text-yellow-400"> من أول جملة إلى إيميلٍ يوظّفك</span>
        </h1>
        <p className="mt-5 text-white/70 text-[16px] sm:text-lg max-w-2xl mx-auto leading-relaxed">
          دورةٌ عمليّة تأخذك من الصفر إلى كتابة الفقرات والرسائل المهنية بالإنجليزية —
          قواعد سهلة وممتعة، قراءةٌ تتحسّن معك، وتصحيحٌ شخصيّ لكتاباتك أنت.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={scrollToForm}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 text-[#2a1d12] font-black text-[16px] px-8 py-4 hover:bg-yellow-300 transition shadow-[0_18px_40px_-12px_rgba(250,204,21,0.5)]">
            سجّل الآن <ArrowLeft size={18} />
          </button>
          <a href={waHref(WA_MSG)} target="_blank" rel="noopener"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-white/10 ring-1 ring-white/20 text-white font-black text-[16px] px-8 py-4 hover:bg-white/15 transition">
            <MessageCircle size={18} /> اسأل عبر واتساب
          </a>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-white/60 font-bold">
          <span className="flex items-center gap-1.5"><Check size={15} className="text-yellow-400" /> وصول مدى الحياة</span>
          <span className="flex items-center gap-1.5"><Check size={15} className="text-yellow-400" /> شهادة إتمام</span>
          <span className="flex items-center gap-1.5"><Check size={15} className="text-yellow-400" /> تصحيح شخصي لواجباتك</span>
          <span className="flex items-center gap-1.5"><Check size={15} className="text-yellow-400" /> لايف أسبوعي للأسئلة</span>
        </div>
      </div>
    </section>
  )
}

/* ── trust bar ── */
function TrustBar() {
  const items: [typeof BookOpen, string][] = [
    [BookOpen, '٥٠ درسًا متدرّجًا'],
    [PenLine, 'من A1 إلى B1'],
    [Mail, 'كتابة احترافية وإيميلات'],
    [GraduationCap, 'إشراف الأستاذ حمزة القصراوي'],
  ]
  return (
    <div className="bg-[#faf6ef] border-y border-yellow-100">
      <div className="max-w-6xl mx-auto px-4 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map(([Icon, label], i) => (
          <div key={i} className="flex items-center justify-center gap-2 text-[13px] font-black text-[#5b3a16]">
            <Icon size={18} className="text-yellow-600 shrink-0" /> <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── outcomes ── */
function Outcomes() {
  const rows: [string, string][] = [
    ['تكتب فقرةً كاملة وصحيحة', 'بجملةٍ موضوعية وتفاصيل داعمة وخاتمة — قصيرة أو طويلة.'],
    ['تكتب إيميلًا مهنيًا يُحترَم', 'رسمي، واضح، ومؤثّر — طلبات، شكاوى، وتقديم على الوظائف.'],
    ['تتقن القواعد دون ملل', 'الأزمنة، الجُمل، والترقيم — بأمثلةٍ كبيرة وواضحة وتمارين ممتعة.'],
    ['تقرأ وتفهم بثقة', 'نصوصٌ حقيقية مع كل درس تُنمّي حصيلتك وطلاقتك.'],
    ['تتجاوز أخطاء العربية الشائعة', 'ترتيب الكلمات والصفات والضمائر — مصمّمة خصّيصًا للناطقين بالعربية.'],
    ['يصحّح لك مدرّبٌ كتاباتك', 'تصحيح مكتوب أو صوتي سريع — تتعلّم من أخطائك أنت، لا من فيديو عام.'],
  ]
  return (
    <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
      <h2 className="text-2xl sm:text-4xl font-black text-center leading-snug">
        بعد هذه الدورة، <span className="text-yellow-600">ستكون قادرًا على…</span>
      </h2>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map(([t, d], i) => (
          <div key={i} className="rounded-2xl bg-white ring-1 ring-zinc-100 shadow-[0_20px_50px_-30px_rgba(42,29,18,0.4)] p-6">
            <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center mb-4">
              <Check size={22} className="text-yellow-600" strokeWidth={3} />
            </div>
            <h3 className="font-black text-[16px] text-zinc-900">{t}</h3>
            <p className="mt-1.5 text-[14px] text-zinc-500 leading-relaxed">{d}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── the 5 units ── */
function Units() {
  const units: [string, string, string, string][] = [
    ['١', 'أساسيات الكتابة', 'A1', 'الحروف الكبيرة، الترقيم، الأدوات، والفاصلة العليا.'],
    ['٢', 'الكلمات والأزمنة', 'A1–A2', 'الأسماء، الضمائر، الصفات، والأزمنة الست كاملة.'],
    ['٣', 'بناء الجمل', 'A2', 'الجمل الكاملة، الربط، جمل الوصل، والأسلوب.'],
    ['٤', 'كتابة الفقرات', 'B1', 'الجملة الموضوعية، الدعم، التوسيع، وأنواع الفقرات.'],
    ['٥', 'الكتابة الاحترافية', 'B1', 'الإيميلات الودّية والرسمية، الطلبات، والتقديم للوظائف.'],
  ]
  return (
    <section className="bg-[#faf6ef] py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl sm:text-4xl font-black text-center">خمس وحدات، رحلةٌ واضحة</h2>
        <p className="text-center text-zinc-500 mt-3 max-w-xl mx-auto">من الصفر إلى الكتابة الاحترافية، خطوةً بخطوة — لا قفزات ولا ثغرات.</p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {units.map(([n, title, cefr, desc], i) => (
            <div key={i} className="rounded-2xl bg-white ring-1 ring-zinc-100 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="w-9 h-9 rounded-xl bg-[#2a1d12] text-yellow-400 flex items-center justify-center font-black">{n}</span>
                <span className="text-[11px] font-black text-cyan-700 bg-cyan-50 rounded-full px-2 py-0.5">{cefr}</span>
              </div>
              <h3 className="font-black text-[15px] text-zinc-900">{title}</h3>
              <p className="mt-1.5 text-[13px] text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── offer + price ── */
function Offer() {
  const stack: [typeof BookOpen, string, string][] = [
    [BookOpen, '٥٠ درسًا كاملًا (A1→B1)', 'فيديوهات، أمثلة، تمارين، ونصوص قراءة'],
    [Mail, 'وحدة الكتابة الاحترافية', 'إيميلات ورسائل عملٍ تُحدث فرقًا'],
    [PenLine, 'تصحيح شخصي لواجباتك', 'مكتوب أو صوتي — نتائج سريعة'],
    [Video, 'لايف أسبوعي للأسئلة والأجوبة', 'مباشرةً مع المدرّب'],
    [Award, 'شهادة إتمام باسمك', 'تضيفها إلى سيرتك الذاتية'],
    [Zap, 'وصول مدى الحياة + التحديثات', 'ادرس على راحتك، متى شئت'],
  ]
  return (
    <section className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
      <h2 className="text-2xl sm:text-4xl font-black text-center">كلّ ما تحصل عليه</h2>
      <div className="mt-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
        {/* value stack */}
        <div className="space-y-3">
          {stack.map(([Icon, t, d], i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl bg-white ring-1 ring-zinc-100 p-4">
              <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center shrink-0"><Icon size={20} className="text-yellow-600" /></div>
              <div>
                <div className="font-black text-[15px] text-zinc-900">{t}</div>
                <div className="text-[13px] text-zinc-500">{d}</div>
              </div>
            </div>
          ))}
        </div>
        {/* price card */}
        <div className="rounded-3xl bg-[#2a1d12] text-white p-7 sm:sticky sm:top-24 shadow-[0_30px_70px_-24px_rgba(42,29,18,0.7)] ring-2 ring-yellow-400/30">
          <div className="text-center">
            <div className="text-yellow-400 font-black text-[13px] tracking-wide">باقة الخليج · دفعة واحدة</div>
            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="text-white/40 line-through text-2xl font-bold">$497</span>
              <span className="text-5xl font-black text-yellow-400">$297</span>
            </div>
            <div className="mt-1 text-white/50 text-[13px]">≈ 1,100 ريال / 1,090 درهم · وصول مدى الحياة</div>
          </div>
          <button onClick={scrollToForm}
            className="mt-6 w-full rounded-2xl bg-yellow-400 text-[#2a1d12] font-black text-[16px] py-4 hover:bg-yellow-300 transition">
            سجّل الآن
          </button>
          <a href={waHref(WA_MSG)} target="_blank" rel="noopener"
            className="mt-2.5 w-full flex items-center justify-center gap-2 rounded-2xl bg-white/10 ring-1 ring-white/15 text-white font-black text-[14px] py-3 hover:bg-white/15 transition">
            <MessageCircle size={16} /> استفسر قبل التسجيل
          </a>
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[12px] text-white/50">
            <Sparkles size={13} className="text-yellow-400" /> عرض الإطلاق — مقاعد محدودة
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── coaching upsell teaser (the funnel ceiling) ── */
function Coaching() {
  return (
    <section className="bg-[#faf6ef] py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-3xl bg-white ring-1 ring-yellow-200 p-8 text-center shadow-[0_24px_60px_-34px_rgba(42,29,18,0.4)]">
          <span className="inline-block rounded-full bg-yellow-100 text-yellow-800 font-black text-[12px] px-3 py-1">المرحلة القادمة</span>
          <h3 className="mt-4 text-2xl font-black">تدريبٌ فرديّ 1‑على‑1 مع الأستاذ حمزة</h3>
          <p className="mt-2 text-zinc-500 max-w-xl mx-auto leading-relaxed">
            لمن يريد نتائج أسرع: خطّة شخصية، تصحيحٌ مباشر لكتاباتك ومحادثاتك، وجلساتٌ حيّة —
            بأولويّةٍ لطلاب هذه الدورة. اكمل الدورة أولًا، ثم انتقل إلى المستوى التالي.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ── FAQ ── */
function Faq() {
  const faqs: [string, string][] = [
    ['هل الشرح بالعربية الفصحى؟', 'نعم، شرح باقة الخليج بالكامل بالعربية الفصحى الواضحة، مع أمثلةٍ إنجليزية مكتوبة.'],
    ['هل تناسبني إن كان مستواي ضعيفًا؟', 'الدورة تبدأ من الصفر تمامًا (A1) وتتدرّج بثبات حتى B1، فلا يُشترط أي مستوى سابق.'],
    ['كيف أدفع، ومتى أبدأ؟', 'الدفع دفعة واحدة، وتحصل على وصولٍ فوري مدى الحياة. راسلنا على واتساب لإتمام التسجيل والدفع.'],
    ['كم من الوقت تحتاج الدورة؟', '٥٠ درسًا قصيرًا تدرسها على راحتك. أغلب الطلاب ينهونها خلال ٦–١٠ أسابيع بمعدّل درسٍ يوميًا.'],
    ['هل أحصل على تصحيح لكتاباتي؟', 'نعم — ترسل واجباتك وتحصل على تصحيحٍ شخصي مكتوب أو صوتي، بالإضافة إلى لايف أسبوعي للأسئلة.'],
    ['هل هناك شهادة؟', 'نعم، شهادة إتمامٍ باسمك عند إنهاء الدورة، يمكنك إضافتها إلى سيرتك الذاتية.'],
  ]
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="max-w-3xl mx-auto px-4 py-16 sm:py-20">
      <h2 className="text-2xl sm:text-4xl font-black text-center mb-8">أسئلة شائعة</h2>
      <div className="space-y-3">
        {faqs.map(([q, a], i) => (
          <div key={i} className="rounded-2xl bg-white ring-1 ring-zinc-100 overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-3 p-4 text-right">
              <span className="font-black text-[15px] text-zinc-900">{q}</span>
              <ChevronDown size={18} className={`text-zinc-400 shrink-0 transition ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && <div className="px-4 pb-4 text-[14px] text-zinc-600 leading-relaxed">{a}</div>}
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── signup form (writes to the CRM) ── */
function SignupSection() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (name.trim().length < 2) { setErr('الرجاء إدخال اسمك.'); return }
    if (phone.replace(/\D/g, '').length < 8) { setErr('الرجاء إدخال رقم واتساب صحيح مع رمز الدولة.'); return }
    setBusy(true)
    try {
      await createSubscriptionLead({
        planId: 'writing_gcc',
        fullName: name.trim(),
        phone: phone.trim(),
        source: 'gcc_landing',
        planInterest: 'GCC Writing Course — $297',
        notes: 'باقة الخليج · دورة الكتابة · طلب من صفحة الهبوط',
        pagePath: '/gcc',
      })
      setDone(true)
    } catch (e) { setErr((e as Error).message || 'حدث خطأ، حاول مرة أخرى.') }
    setBusy(false)
  }

  const waAfter = waHref(`السلام عليكم، اسمي ${name || ''}. سجّلت اهتمامي بدورة الكتابة (باقة الخليج) وأودّ إتمام التسجيل.`)

  return (
    <section id="signup" className="bg-[#2a1d12] text-white py-16 sm:py-24">
      <div className="max-w-md mx-auto px-4">
        {done ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-yellow-400 text-[#2a1d12] flex items-center justify-center mb-5"><Check size={30} strokeWidth={3} /></div>
            <h2 className="text-2xl font-black">تمّ تسجيل طلبك! 🎉</h2>
            <p className="mt-2 text-white/60 leading-relaxed">سنتواصل معك قريبًا. للإسراع، أكمل التسجيل مباشرةً عبر واتساب:</p>
            <a href={waAfter} target="_blank" rel="noopener"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-yellow-400 text-[#2a1d12] font-black px-8 py-4 hover:bg-yellow-300 transition">
              <MessageCircle size={18} /> إكمال التسجيل عبر واتساب
            </a>
          </div>
        ) : (
          <>
            <h2 className="text-2xl sm:text-3xl font-black text-center">احجز مقعدك في باقة الخليج</h2>
            <p className="text-center text-white/60 mt-2">اترك اسمك ورقم واتساب، وسنتكفّل بالباقي.</p>
            <form onSubmit={submit} className="mt-8 space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="الاسم الكامل"
                className="w-full rounded-xl bg-white/10 ring-1 ring-white/15 px-4 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              <input value={phone} onChange={e => setPhone(e.target.value)} inputMode="tel" dir="ltr"
                placeholder="+966 5x xxx xxxx  (رقم واتساب مع رمز الدولة)"
                className="w-full rounded-xl bg-white/10 ring-1 ring-white/15 px-4 py-3.5 text-white placeholder:text-white/40 text-right focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              {err && <div className="text-[13px] font-bold text-red-300 bg-red-500/10 rounded-lg px-3 py-2">{err}</div>}
              <button disabled={busy} type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-yellow-400 text-[#2a1d12] font-black text-[16px] py-4 hover:bg-yellow-300 transition disabled:opacity-50">
                {busy ? <Loader2 size={18} className="animate-spin" /> : <Star size={18} />} سجّل اهتمامي
              </button>
              <p className="text-center text-[12px] text-white/40 pt-1">أو راسلنا مباشرةً على واتساب —
                <a href={waHref(WA_MSG)} target="_blank" rel="noopener" className="text-yellow-400 font-bold"> اضغط هنا</a>
              </p>
            </form>
          </>
        )}
      </div>
    </section>
  )
}

/* ── footer ── */
function Footer() {
  return (
    <footer className="bg-[#1a110a] text-white/60">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 text-[#2a1d12] flex items-center justify-center font-black">إن</div>
          <span className="text-white font-black">إنجليزي.كوم</span>
        </div>
        <div className="flex items-center gap-5">
          <a href={waHref(WA_MSG)} target="_blank" rel="noopener" className="flex items-center gap-1.5 hover:text-yellow-400 transition"><MessageCircle size={15} /> واتساب</a>
          <a href="/faq" className="hover:text-yellow-400 transition">الأسئلة</a>
          <a href="/terms" className="hover:text-yellow-400 transition">الشروط</a>
        </div>
        <div className="text-white/30">© {new Date().getFullYear()} إنجليزي.كوم</div>
      </div>
    </footer>
  )
}
