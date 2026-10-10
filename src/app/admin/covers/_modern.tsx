'use client'

import { useEffect, type CSSProperties } from 'react'
import { BookOpen, Check, Headphones, Languages, Layers, MessageCircle, PenLine, type LucideIcon } from 'lucide-react'
import { PLAY, QrLink } from '@/components/QrLink'
import { ENGLISH_AR, SERIES } from './_covers'

/**
 * The modern cover: what a current course book does to make you want to
 * open it — a real learner, smiling, in a place of study, over clean,
 * confident type. White, ink and one blue; no patterns. The series' idea
 * (each level is a paper) stays as a small card emblem, not the picture.
 *
 * Photo: Joseph Ogbonnaya on Unsplash (Unsplash License), saved at print
 * size in public/covers.
 */

const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@500;600;700&family=IBM+Plex+Mono:wght@500&display=swap'
const EN = "'Plus Jakarta Sans', 'IBM Plex Sans Arabic', sans-serif"
const AR = "'IBM Plex Sans Arabic', sans-serif"
const MONO = "'IBM Plex Mono', monospace"

const BLUE = '#2B36C9', INK = '#0D0F1A', GREY = '#4B5063', LINE = '#E4E6EE', MIST = '#F4F5F9'

const E = (w: number): CSSProperties => ({ fontFamily: EN, fontWeight: w })
const A = (w: number): CSSProperties => ({ fontFamily: AR, fontWeight: w })

export function useModernFonts() {
  useEffect(() => {
    if (document.getElementById('cover-modern-fonts')) return
    const link = document.createElement('link')
    link.id = 'cover-modern-fonts'; link.rel = 'stylesheet'; link.crossOrigin = 'anonymous'; link.href = FONTS_HREF
    document.head.appendChild(link)
  }, [])
}

/** The series' emblem: a small blue card, the level's paper. */
function Emblem() {
  return (
    <div className="relative overflow-hidden rounded-[18px] text-white" dir="ltr"
      style={{ width: 230, height: 145, background: BLUE, boxShadow: '0 30px 50px -20px rgba(13,15,26,0.6), 0 10px 20px -10px rgba(13,15,26,0.4)' }}>
      <div className="absolute left-4 right-4 top-3.5 flex items-center justify-between">
        <span className="text-[17px] tracking-[-0.02em]" style={E(800)}>LA KAART</span>
        <span className="text-[9px] tracking-[0.2em] opacity-80" style={E(700)}>LEVEL 1</span>
      </div>
      <svg className="absolute left-4 top-[48px]" width="34" height="26" viewBox="0 0 44 34" aria-hidden>
        <rect x="0.75" y="0.75" width="42.5" height="32.5" rx="7" fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth="1.6" />
        <path d="M0 11H14M0 23H14M30 11H44M30 23H44M14 0V34M30 0V34" stroke="#fff" strokeOpacity="0.75" strokeWidth="1.3" fill="none" />
      </svg>
      <div className="absolute left-[64px] top-[46px] leading-tight">
        <div className="text-[8px] tracking-[0.18em] opacity-70" style={E(700)}>LANGUAGE</div>
        <div className="text-[13px]" style={E(700)}>English · A0 → A1</div>
      </div>
      <div className="absolute left-4 right-4 bottom-3 text-[8.5px] leading-[1.5] tracking-[0.24em] opacity-80" style={{ fontFamily: MONO }}>
        <div>ID&lt;ENGLISH&lt;&lt;LA&lt;KAART&lt;&lt;&lt;&lt;</div>
        <div>HELLO&lt;&lt;MY&lt;NAME&lt;IS&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
      </div>
    </div>
  )
}

const PROMISES: [LucideIcon, string, string][] = [
  [MessageCircle, 'Speak from day one', 'تكلّم من أول درس'],
  [Headphones, 'Audio for every line', 'صوت لكل جملة'],
  [BookOpen, '19 real-life lessons', '19 درسًا من حياتنا'],
]

export function ModernFront({ photo = '/covers/la-kaart-student.jpg', book = "STUDENT'S BOOK", bookAr = 'كتاب الطالب' }: { photo?: string; book?: string; bookAr?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-white" dir="ltr" style={{ color: INK }}>
      {/* the learner */}
      <div className="absolute inset-x-0 top-0 h-[640px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: '50% 38%' }} />
        <div className="absolute inset-x-0 top-0 h-[170px]" style={{ background: 'linear-gradient(180deg, rgba(13,15,26,0.55), rgba(13,15,26,0))' }} />
      </div>

      <div className="absolute left-[52px] right-[52px] top-[44px] flex items-center justify-between">
        <span className="text-[21px] text-white tracking-[-0.02em]" style={E(800)}>Inglizi.com</span>
        <span className="rounded-full px-4 py-[7px] text-[12.5px] tracking-[0.16em] text-white" style={{ ...E(700), background: BLUE }}>LEVEL 1 · A0 → A1</span>
      </div>

      {/* what she says: the book's first lesson */}
      <div className="absolute left-[52px] top-[150px] rounded-[20px] rounded-bl-[6px] bg-white px-5 py-3" style={{ boxShadow: '0 18px 40px -18px rgba(13,15,26,0.55)' }}>
        <div className="text-[22px] leading-tight tracking-[-0.01em]" style={E(800)}>Hi! I'm Salma.</div>
        <div className="text-[15px] leading-snug" style={{ ...A(600), color: GREY }} dir="rtl">مرحبًا! أنا سلمى.</div>
      </div>

      <div className="absolute right-[52px] top-[512px]" style={{ transform: 'rotate(-6deg)' }}><Emblem /></div>

      {/* the title */}
      <div className="absolute left-[52px] right-[52px] top-[676px]">
        <div className="text-[13px] tracking-[0.2em]" style={{ ...E(800), color: BLUE }}>{book} · <span className="tracking-normal" style={A(700)}>{bookAr}</span></div>
        <h1 className="mt-3 text-[120px] leading-[0.9] tracking-[-0.05em]" style={E(800)}>LA KAART<br /><span style={{ color: BLUE }}>ENGLISH</span></h1>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-[17px]" style={{ ...E(600), color: GREY }}>Your first ID in English.</span>
          <span className="text-[44px] leading-none" dir="rtl" style={A(700)}>لاكارط {ENGLISH_AR}</span>
        </div>
      </div>

      {/* the promise */}
      <div className="absolute left-[52px] right-[52px] bottom-[50px] pt-5 grid grid-cols-3 gap-4" style={{ borderTop: `1.5px solid ${INK}` }}>
        {PROMISES.map(([Icon, en, ar]) => (
          <div key={en} className="flex items-start gap-2.5">
            <span className="mt-[2px] w-[30px] h-[30px] shrink-0 rounded-full flex items-center justify-center" style={{ background: MIST }}>
              <Icon size={16} color={BLUE} strokeWidth={2.2} />
            </span>
            <span className="flex flex-col leading-[1.3]">
              <span className="text-[13.5px]" style={E(700)}>{en}</span>
              <span className="text-[13px]" dir="rtl" style={{ ...A(600), color: GREY, textAlign: 'left' }}>{ar}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── The back ─────────────────────────────────────────────────────────── */

const CAN_DO: [string, string][] = [
  ['Introduce yourself', 'تقدّم نفسك وتسلّم على الناس'],
  ['Give your age and phone number', 'تقول عمرك ورقم هاتفك'],
  ['Talk about your family and home', 'تتحدث عن عائلتك وبيتك'],
  ['Tell the time and the days', 'تقول الساعة وأيام الأسبوع'],
  ['Order food and drinks', 'تطلب الأكل والمشروبات'],
  ['Ask the way in your town', 'تسأل عن الطريق في مدينتك'],
]

const PACK: [LucideIcon, string, string][] = [
  [BookOpen, "Student's Book", 'كتاب الطالب'], [PenLine, 'Workbook', 'كتاب التمارين'],
  [Languages, 'Vocabulary Builder', 'كتاب المفردات'], [Layers, 'Play Cards', 'بطاقات اللعب'],
]

function Head({ en, ar }: { en: string; ar: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="text-[24px] tracking-[-0.02em]" style={E(800)}>{en}</h2>
      <span className="text-[20px]" dir="rtl" style={{ ...A(700), color: BLUE }}>{ar}</span>
    </div>
  )
}

export function ModernBack({ phone = '+212 707 902 091' }: { phone?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-white" dir="ltr" style={{ color: INK }}>
      <div className="absolute left-[56px] right-[56px] top-[56px]">
        <div className="flex items-end justify-between">
          <div className="text-[52px] leading-[0.92] tracking-[-0.05em]" style={E(800)}>LA KAART<br /><span style={{ color: BLUE }}>ENGLISH</span></div>
          <div className="text-right">
            <div className="text-[34px] leading-tight" dir="rtl" style={A(700)}>لاكارط {ENGLISH_AR}</div>
            <div className="text-[12.5px] tracking-[0.16em]" style={{ ...E(700), color: GREY }}>STUDENT&apos;S BOOK · LEVEL 1 · A0 → A1</div>
          </div>
        </div>

        <p className="mt-6 text-[19px] leading-[1.8]" dir="rtl" style={A(600)}>
          أول وثيقة تحتاجها في الإنجليزية. تسعة عشر درسًا من حياتنا اليومية في المغرب: تعرّف بنفسك، وتحدّث عن عائلتك وبيتك ويومك، واطلب وتسوّق واسأل عن الطريق. شرح عربي واضح، وصوت لكل جملة تسمعه بمسح الرمز.
        </p>
        <p className="mt-2 text-[15px] leading-[1.6]" style={{ ...E(500), color: GREY }}>
          Your first document in English: 19 lessons from everyday Moroccan life, explained in Arabic, with audio for every line.
        </p>

        <div className="mt-7"><Head en="After this book, you can" ar="بعد هاد الكتاب، تقدر" /></div>
        <div className="mt-3 grid grid-cols-2 gap-x-8" style={{ borderTop: `1.5px solid ${INK}` }}>
          {CAN_DO.map(([en, ar]) => (
            <div key={en} className="flex items-center gap-3 py-3" style={{ borderBottom: `1px solid ${LINE}` }}>
              <span className="w-[26px] h-[26px] shrink-0 rounded-full flex items-center justify-center" style={{ background: BLUE }}><Check size={15} color="#fff" strokeWidth={3} /></span>
              <span className="flex flex-col leading-[1.3]">
                <span className="text-[15px]" style={E(700)}>{en}</span>
                <span className="text-[13.5px]" dir="rtl" style={{ ...A(600), color: GREY, textAlign: 'left' }}>{ar}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="mt-7"><Head en="Three papers, three levels" ar="ثلاث وثائق، ثلاث مستويات" /></div>
        <div className="relative mt-5 grid grid-cols-3">
          <div className="absolute left-[14px] right-[33%] top-[13px] h-[2px]" style={{ background: LINE }} />
          {SERIES.map((s, i) => {
            const on = i === 0
            return (
              <div key={s.en} className="relative">
                <span className="relative z-10 w-[28px] h-[28px] rounded-full flex items-center justify-center text-[12px]"
                  style={on ? { ...E(800), background: BLUE, color: '#fff' } : { ...E(800), background: '#fff', color: GREY, boxShadow: `inset 0 0 0 2px ${LINE}` }}>{i + 1}</span>
                <div className="mt-2 text-[26px] leading-none tracking-[-0.03em]" style={{ ...E(800), color: on ? BLUE : INK }}>{s.en}</div>
                <div className="text-[15px]" dir="rtl" style={{ ...A(700), textAlign: 'left' }}>{s.ar} {ENGLISH_AR}</div>
                <div className="mt-1 text-[12.5px]" style={{ ...E(600), color: GREY }}>{s.level} · {s.goalEn}</div>
                {on && <span className="mt-1.5 inline-block rounded-full px-2.5 py-[3px] text-[10px] tracking-[0.14em] text-white" style={{ ...E(800), background: INK }}>THIS BOOK</span>}
              </div>
            )
          })}
        </div>

        <div className="mt-7 grid grid-cols-4 gap-2.5">
          {PACK.map(([Icon, en, ar], i) => (
            <div key={en} className="rounded-[14px] px-3 py-3" style={i === 0 ? { background: BLUE, color: '#fff' } : { background: MIST }}>
              <Icon size={20} color={i === 0 ? '#fff' : BLUE} strokeWidth={2} />
              <div className="mt-2 text-[13.5px] leading-tight" style={E(700)}>{en}</div>
              <div className="text-[13px] leading-tight" dir="rtl" style={{ ...A(600), textAlign: 'left', opacity: i === 0 ? 0.85 : 1, color: i === 0 ? '#fff' : GREY }}>{ar}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute left-[56px] right-[56px] bottom-[52px] pt-5 flex items-center justify-between" style={{ borderTop: `1.5px solid ${INK}` }}>
        <div className="flex items-center gap-3">
          <QrLink url={PLAY.library} size={72} color={INK} label={null} />
          <div className="flex flex-col leading-[1.35]">
            <span className="text-[15px]" style={E(800)}>Scan and listen</span>
            <span className="text-[13.5px]" dir="rtl" style={{ ...A(600), textAlign: 'left' }}>امسح الرمز واستمع</span>
            <span className="text-[12.5px]" style={{ ...E(600), color: GREY }}>inglizi.com/audio</span>
          </div>
        </div>
        <div className="flex flex-col items-center leading-[1.45]">
          <span className="text-[20px] tracking-[-0.02em]" style={E(800)}>Inglizi<span style={{ color: BLUE }}>.com</span></span>
          <span className="text-[12.5px]" style={{ ...E(600), color: GREY }}>Hamza El Qasraoui · <span style={A(600)}>حمزة القصراوي</span></span>
          <span className="text-[12.5px]" style={E(700)}>WhatsApp {phone}</span>
        </div>
        <div className="w-[140px] h-[80px] rounded-[10px] flex flex-col items-center justify-center" style={{ border: `1.5px dashed ${GREY}` }}>
          <span className="text-[11px] tracking-[0.2em]" style={{ ...E(700), color: GREY }}>ISBN</span>
          <span className="text-[11.5px]" dir="rtl" style={{ ...A(600), color: GREY }}>مكان الباركود</span>
        </div>
      </div>
    </div>
  )
}
