'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowLeft, BookOpen, Check, ChevronLeft, ChevronRight, Headphones, Languages, Layers, ListChecks, MapPin, MessageCircle,
  MessagesSquare, X, ZoomIn, type LucideIcon,
} from 'lucide-react'
import { BOOK_LEVELS, insidePages, orderLink, type BookLevel, type LevelId } from '@/data/books'
import { CARD, CTA_GOLD, ICON_TILE, SectionTitle } from './kit'

/**
 * The home page's books section: the printed series, sold on what it does
 * for the learner, not on price (there is none here).
 *
 * One level at a time (LA KAART, PIIRMI, VIIZA): its three books fanned like
 * a real set on a desk (tap one to bring it forward and read what is inside),
 * what you can do at the end of the level, and a strip of real inside pages
 * that open full screen right here (there is no separate preview page: /books
 * redirects to #books). Every path ends on ordering through WhatsApp. Then why
 * these books, and how they differ from an ordinary textbook. Images go
 * through next/image, so a phone gets a small file of a print-size JPG.
 */

export default function BooksShowcase() {
  const [lv, setLv] = useState<LevelId>('lakaart')
  const level = BOOK_LEVELS.find(l => l.id === lv)!

  return (
    <section id="books" className="scroll-mt-20 relative bg-gradient-to-b from-white via-[#FFF8EC] to-white py-16 sm:py-24 px-5 sm:px-6" dir="rtl">
      <div className="max-w-[1200px] mx-auto">
        <SectionTitle kicker="كتب Inglizi.com" title="كتبك من الصفر… إلى السفر"
          sub="ثلاثة مستويات، وفي كل مستوى ثلاثة كتب تكمّل بعضها. شرح بالعربية، وأمثلة من حياتك، والصوت في كل صفحة." />

        <div className="ig-reveal mt-9 grid grid-cols-3 gap-2 sm:gap-3 max-w-[760px] mx-auto" role="tablist" aria-label="المستويات">
          {BOOK_LEVELS.map(l => {
            const on = l.id === lv
            return (
              <button key={l.id} type="button" role="tab" aria-selected={on} onClick={() => setLv(l.id)}
                className={`rounded-2xl px-2 py-3 sm:p-4 text-center ring-2 transition-all duration-300 ${on ? 'text-white shadow-lg -translate-y-0.5' : 'bg-white text-[#0B1B4D] ring-slate-200 hover:ring-slate-300'}`}
                style={on ? { background: l.colour, ['--tw-ring-color' as string]: l.colour } : undefined}>
                <span className="block text-[11px] sm:text-[12px] font-bold opacity-80" dir="ltr">{l.cefr}</span>
                <span className="block text-[14px] sm:text-[19px] font-black tracking-tight leading-tight" dir="ltr">{l.name.replace(' ENGLISH', '')}</span>
                <span className="block text-[11.5px] sm:text-[13px] font-bold opacity-90">{l.levelAr}</span>
              </button>
            )
          })}
        </div>

        <LevelPanel key={lv} level={level} />
        <WhyThese />
        <Compare />
      </div>
    </section>
  )
}

/* ── One level: the set of books, the outcomes, the inside pages ─────────── */

function LevelPanel({ level }: { level: BookLevel }) {
  const [front, setFront] = useState(0)
  const [viewing, setViewing] = useState<number | null>(null)
  const book = level.books[front]
  const order = orderLink(`السلام عليكم، أريد طلب كتب ${level.name} (${level.ar})`)

  return (
    <div className="mt-10 sm:mt-12">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        {/* the books: first on a phone, on the left on a wide screen */}
        <div className="ig-pop lg:order-2">
          <BookFan level={level} front={front} onPick={setFront} />
          <div className="mt-5 flex flex-wrap justify-center gap-2" role="tablist" aria-label="كتب المستوى">
            {level.books.map((b, i) => (
              <button key={b.kind} type="button" role="tab" aria-selected={i === front} onClick={() => setFront(i)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-bold ring-1 transition ${i === front ? 'text-white' : 'bg-white text-slate-700 ring-slate-200 hover:ring-slate-300'}`}
                style={i === front ? { background: level.colour, ['--tw-ring-color' as string]: level.colour } : undefined}>
                {b.ar}
              </button>
            ))}
          </div>
        </div>

        <div className="ig-pop [animation-delay:80ms] lg:order-1">
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12.5px] font-extrabold text-white" style={{ background: level.colour }}>
            <span dir="ltr">{level.cefr}</span> · {level.levelAr}
          </span>
          <h3 className="mt-3 text-[30px] sm:text-[40px] font-black tracking-tight leading-none text-[#0B1B4D]" dir="ltr" style={{ textAlign: 'right' }}>{level.name}</h3>
          <p className="mt-2 text-[17px] font-extrabold" style={{ color: level.colour }}>{level.tag}</p>
          <p className="mt-3 text-[15.5px] leading-relaxed text-slate-700"><b className="text-slate-900">لمن؟ </b>{level.forWho}</p>

          <div className="mt-5 rounded-2xl bg-white ring-1 ring-slate-200 p-4 shadow-[0_10px_26px_-16px_rgba(15,23,42,0.35)]" aria-live="polite">
            <p className="text-[13px] font-bold text-slate-500">
              {book.ar} · <span dir="ltr">{book.en}</span>
            </p>
            <p className="mt-1 text-[15px] leading-relaxed text-slate-800">{book.about}</p>
          </div>

          <p className="mt-6 text-[16px] font-black text-slate-900">في نهاية هذا المستوى، ستستطيع أن:</p>
          <ul className="mt-3 space-y-2.5">
            {level.outcomes.map(o => (
              <li key={o} className="flex gap-2.5 text-[15px] leading-relaxed text-slate-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white" style={{ background: level.colour }}><Check size={13} strokeWidth={3} /></span>
                {o}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <a href={order} target="_blank" rel="noopener" className={`${CTA_GOLD} px-6 py-3.5 text-[16px]`}>
              <MessageCircle size={18} /> اطلب الكتب عبر واتساب
            </a>
            <button type="button" onClick={() => setViewing(0)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-[15px] font-extrabold text-[#0B1B4D] ring-1 ring-slate-300 transition hover:ring-slate-400 hover:-translate-y-0.5">
              <BookOpen size={18} /> تصفّح الكتاب من الداخل
            </button>
          </div>
        </div>
      </div>

      <InsideStrip level={level} onOpen={setViewing} />
      {viewing !== null && <PageViewer level={level} start={viewing} order={order} onClose={() => setViewing(null)} />}
    </div>
  )
}

/**
 * The level's three books as a set on a desk: one in front, two behind,
 * floating gently. Tapping a book behind brings it forward. Laid out
 * left-to-right whatever the page direction: these are English books.
 */
function BookFan({ level, front, onPick }: { level: BookLevel; front: number; onPick: (i: number) => void }) {
  // Where each book sits: in front, behind on the left, behind on the right.
  const SLOTS = [
    'translate(-50%, 0) rotate(0deg) scale(1)',
    'translate(-98%, 5%) rotate(-8deg) scale(0.84)',
    'translate(-2%, 5%) rotate(8deg) scale(0.84)',
  ]
  const slotOf = (i: number) => (i === front ? 0 : i === (front + 1) % 3 ? 2 : 1)

  return (
    <div className="ig-float relative mx-auto w-full max-w-[520px] aspect-[1/0.86]" dir="ltr">
      {/* the shadow the books cast on the desk */}
      <div aria-hidden className="absolute inset-x-[12%] bottom-[1%] h-[9%] rounded-[50%] bg-slate-900/20 blur-xl" />
      {level.books.map((b, i) => {
        const slot = slotOf(i)
        return (
          <button key={b.kind} type="button" onClick={() => onPick(i)} aria-label={`${b.ar} — ${b.en}`}
            className="absolute left-1/2 top-[2%] w-[50%] origin-bottom transition-[transform,filter] duration-500 ease-[cubic-bezier(.16,1,.3,1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 rounded-[4px_12px_12px_4px]"
            style={{ transform: SLOTS[slot], zIndex: slot === 0 ? 30 : 10 + i, filter: slot === 0 ? 'none' : 'brightness(.92)' }}>
            <PrintedBook src={b.cover} alt={`${level.name} — ${b.en}`} colour={level.colour} priority={slot === 0} />
          </button>
        )
      })}
    </div>
  )
}

/** A cover made to look like a bound book: the spine's crease, the page block, the gloss. */
function PrintedBook({ src, alt, colour, priority }: { src: string; alt: string; colour: string; priority?: boolean }) {
  return (
    <span className="relative block aspect-[2481/3509]">
      {/* the page block, peeking out on the right */}
      <span aria-hidden className="absolute top-[1.2%] bottom-[1.2%] -right-[3.2%] w-[4%] rounded-r-[6px] bg-[repeating-linear-gradient(90deg,#fff_0_2px,#e5e7eb_2px_3px)] shadow-[2px_0_6px_rgba(15,23,42,0.18)]" />
      {/* the level's colour until the cover arrives: never a blank white book on a slow phone */}
      <span className="absolute inset-0 overflow-hidden rounded-[4px_12px_12px_4px] shadow-[0_26px_44px_-16px_rgba(15,23,42,0.6),0_4px_10px_-4px_rgba(15,23,42,0.3)]" style={{ background: colour }}>
        <Image src={src} alt={alt} fill sizes="(max-width: 640px) 50vw, 260px" className="object-cover" priority={priority} />
        {/* the spine's crease and a soft gloss */}
        <span aria-hidden className="absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-black/30 via-white/15 to-transparent" />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10" />
      </span>
    </span>
  )
}

/** Six real inside pages, slightly askew like pages laid on a table; each opens the page viewer. */
function InsideStrip({ level, onOpen }: { level: BookLevel; onOpen: (i: number) => void }) {
  const pages = insidePages(level.id)
  return (
    <div className="mt-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[20px] sm:text-[24px] font-black text-slate-950">نظرة من الداخل</p>
          <p className="text-[14px] text-slate-600">صفحات حقيقية من {level.books[0].ar} · <span dir="ltr" className="whitespace-nowrap">{level.name}</span></p>
        </div>
        <button type="button" onClick={() => onOpen(0)} className="shrink-0 inline-flex items-center gap-1.5 text-[14px] font-extrabold" style={{ color: level.colour }}>
          تصفّح الصفحات <ArrowLeft size={16} />
        </button>
      </div>
      <div className="-mx-5 sm:mx-0 mt-5 flex gap-4 overflow-x-auto snap-x snap-mandatory px-5 sm:px-1 pb-6 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {pages.map((src, i) => (
          <button key={src} type="button" onClick={() => onOpen(i)} aria-label={`افتح الصفحة ${i + 1}`}
            className={`group relative shrink-0 snap-start w-[150px] sm:w-[180px] aspect-[794/1123] rounded-lg bg-white ring-1 ring-slate-200 shadow-[0_16px_30px_-14px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-[0_24px_40px_-14px_rgba(15,23,42,0.55)] ${i % 2 ? 'rotate-[1.5deg]' : '-rotate-[1.5deg]'}`}>
            <Image src={src} alt="" fill sizes="180px" className="rounded-lg object-cover" />
            <span className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-1 rounded-full bg-[#0B1B4D]/85 py-1 text-[12px] font-bold text-white opacity-0 transition group-hover:opacity-100">
              <ZoomIn size={13} /> افتح
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * The inside pages full screen, on the same page: turn them with the arrows,
 * a swipe or the keyboard (the next page comes from the left, as in the strip),
 * tap a page to zoom in and read it, then order on WhatsApp.
 */
function PageViewer({ level, start, order, onClose }: { level: BookLevel; start: number; order: string; onClose: () => void }) {
  const pages = insidePages(level.id)
  const [i, setI] = useState(start)
  const [zoom, setZoom] = useState(false)
  const touchX = useRef<number | null>(null)
  const go = (d: number) => { setZoom(false); setI(n => Math.min(pages.length - 1, Math.max(0, n + d))) }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') go(1)
      else if (e.key === 'ArrowRight') go(-1)
    }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = overflow; window.removeEventListener('keydown', onKey) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const arrow = 'absolute top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#0B1B4D] shadow-lg transition hover:bg-white disabled:opacity-0'
  // On <body>, so no moving section around it can hold the overlay inside its own box.
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`${level.name} — ${level.books[0].en}`} dir="rtl"
      className="fixed inset-0 z-[100] flex flex-col bg-[#0B1B4D]/95 backdrop-blur-sm text-white">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: level.colour }} />
        <p className="min-w-0 flex-1 truncate text-[14px] sm:text-[15px] font-bold">
          <span dir="ltr">{level.name}</span> · {level.books[0].ar}
        </p>
        <span className="text-[13px] font-bold text-blue-100/80" dir="ltr">{i + 1} / {pages.length}</span>
        <button type="button" onClick={onClose} aria-label="إغلاق" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"><X size={20} /></button>
      </div>

      <div className="relative min-h-0 flex-1 px-3 sm:px-16"
        onTouchStart={e => { touchX.current = zoom ? null : e.touches[0].clientX }}
        onTouchEnd={e => {
          if (touchX.current === null) return
          const dx = e.changedTouches[0].clientX - touchX.current
          touchX.current = null
          if (Math.abs(dx) > 50) go(dx > 0 ? 1 : -1)
        }}>
        <button type="button" onClick={() => go(-1)} disabled={i === 0} aria-label="الصفحة السابقة" className={`${arrow} right-2 sm:right-4`}><ChevronRight size={24} /></button>
        <button type="button" onClick={() => go(1)} disabled={i === pages.length - 1} aria-label="الصفحة التالية" className={`${arrow} left-2 sm:left-4`}><ChevronLeft size={24} /></button>

        {/* ltr: zoomed in, an English page is read from its top-left corner */}
        <div dir="ltr" className={`h-full w-full ${zoom ? 'overflow-auto' : 'flex items-center justify-center'}`}>
          <button type="button" onClick={() => setZoom(z => !z)} aria-label={zoom ? 'تصغير' : 'تكبير'}
            className={`relative block aspect-[794/1123] ${zoom ? 'mx-auto w-[220%] max-w-[1600px] cursor-zoom-out sm:w-full' : 'h-full max-h-full max-w-full cursor-zoom-in'}`}>
            <Image key={pages[i]} src={pages[i]} alt={`الصفحة ${i + 1}`} fill priority sizes="(max-width: 640px) 220vw, 1200px" className="object-contain" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p className="text-[12.5px] text-blue-100/75">{zoom ? 'اضغط على الصفحة للتصغير' : 'اضغط على الصفحة للتكبير · اسحب لتقلب الصفحات'}</p>
        <a href={order} target="_blank" rel="noopener" className={`${CTA_GOLD} w-full max-w-[420px] px-6 py-3.5 text-[16px]`}>
          <MessageCircle size={18} /> اطلب الكتب عبر واتساب
        </a>
      </div>
    </div>,
    document.body,
  )
}

/* ── Why these books ─────────────────────────────────────────────────────── */

const WHY: { Icon: LucideIcon; title: string; text: string }[] = [
  { Icon: Languages, title: 'الشرح بالعربية', text: 'كل قاعدة وكل كلمة مشروحة بالعربية، فلا تضيع ولا تحتاج قاموسًا بجانبك.' },
  { Icon: Headphones, title: 'الصوت في كل صفحة', text: 'امسح الرمز بهاتفك واستمع لكل كلمة وجملة ومحادثة: ببطء لتتعلّم، أو بالسرعة العادية.' },
  { Icon: MapPin, title: 'من حياتك أنت', text: 'السوق، والحمّام، والطاكسي الكبير، والقطار… أمثلة من المغرب ومن رحلاتك، لا من مدينة لا تعرفها.' },
  { Icon: MessagesSquare, title: 'تتكلّم من أول درس', text: 'محادثات قصيرة من مواقف حقيقية في كل درس، تقرؤها مع زميل وتعيدها حتى تخرج منك بسهولة.' },
  { Icon: Layers, title: 'ثلاثة كتب تكمّل بعضها', text: 'كتاب الطالب يشرح، وكتاب التمارين يثبّت، وكتاب المفردات يوسّع كلماتك، درسًا بدرس.' },
  { Icon: ListChecks, title: 'تعرف أين وصلت', text: 'تمارين بعد كل درس، ومراجعات منتظمة، والأجوبة في آخر الكتاب لتصحّح وحدك.' },
]

function WhyThese() {
  return (
    <div className="mt-20 sm:mt-24">
      <SectionTitle kicker="لماذا هذه الكتب" title="كتاب يتعلّم معك، لا كتاب تحفظه"
        sub="صُمّمت لمتعلّم عربي يريد أن يفهم ويتكلّم، لا أن يحفظ قواعد وينساها." />
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {WHY.map(({ Icon, title, text }) => (
          <div key={title} className={`ig-reveal ${CARD} p-5 sm:p-6`}>
            <span className={`${ICON_TILE} h-12 w-12`}><Icon size={22} /></span>
            <p className="mt-4 text-[18px] font-black text-slate-950">{title}</p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">{text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── An ordinary textbook, and these ─────────────────────────────────────── */

const ROWS: [string, string, string][] = [
  ['الشرح', 'بالإنجليزية فقط', 'بالعربية، خطوة بخطوة'],
  ['الأمثلة', 'من بلد لا تعرفه', 'من حياتك في المغرب ورحلاتك'],
  ['الصوت', 'قرص ضائع أو لا شيء', 'رمز في كل صفحة، على هاتفك'],
  ['الكلام', 'قواعد كثيرة وكلام قليل', 'محادثات في كل درس'],
  ['التصحيح', 'تبحث عن الحل وحدك', 'الأجوبة في آخر الكتاب'],
]

function Compare() {
  return (
    <div className="ig-reveal mt-16 sm:mt-20 max-w-[860px] mx-auto">
      <p className="text-center text-[22px] sm:text-[28px] font-black text-slate-950">ما الفرق عن كتاب عادي؟</p>
      <div className="mt-6 overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_20px_44px_-22px_rgba(15,23,42,0.4)]">
        <div className="grid grid-cols-[0.8fr_1fr_1.15fr] text-[12.5px] sm:text-[14px] font-extrabold">
          <span className="px-3 sm:px-5 py-3 bg-slate-50" />
          <span className="px-3 sm:px-5 py-3 bg-slate-50 text-slate-500">كتاب عادي</span>
          <span className="px-3 sm:px-5 py-3 bg-[#0B1B4D] text-amber-300">كتب Inglizi.com</span>
        </div>
        {ROWS.map(([what, other, ours]) => (
          <div key={what} className="grid grid-cols-[0.8fr_1fr_1.15fr] border-t border-slate-100 text-[13px] sm:text-[15px]">
            <span className="px-3 sm:px-5 py-3.5 font-extrabold text-slate-900">{what}</span>
            <span className="px-3 sm:px-5 py-3.5 flex gap-1.5 text-slate-500"><X size={16} className="mt-0.5 shrink-0 text-slate-400" />{other}</span>
            <span className="px-3 sm:px-5 py-3.5 flex gap-1.5 font-bold text-slate-900 bg-amber-50/60"><Check size={16} strokeWidth={3} className="mt-0.5 shrink-0 text-emerald-600" />{ours}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-[15px] text-slate-700">
        لا تعرف من أين تبدأ؟{' '}
        <Link href="/level-test" className="font-extrabold text-brand-700 underline-offset-4 hover:underline">اجتز الاختبار المجاني</Link>
        {' '}وسنقترح عليك المستوى المناسب.
      </p>
    </div>
  )
}
