'use client'

import { useEffect, type ReactNode } from 'react'
import { Globe, ImagePlus, Instagram, KeyRound, Phone, X } from 'lucide-react'
import { BareSheet, Field, INP, type SheetTheme } from './_shared'

/**
 * The workbook's front cover: a full-bleed A4 page in the textbook's own
 * colours, printed and exported (PNG) like every other page.
 *
 * Display fonts are loaded here, on demand, rather than in the root layout —
 * only this page needs them: Alexandria for the Arabic title (a geometric
 * Kufi that holds up at 100 px), Readex Pro for Arabic text, Montserrat for
 * English. Arabic text never gets letter-spacing: html2canvas draws spaced
 * text letter by letter, which would break the joined script in the PNG.
 * The photo is a background-image (cover) for the same reason — html2canvas
 * ignores object-fit.
 */

const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Alexandria:wght@500;700;800;900&family=Readex+Pro:wght@400;500;600;700&family=Montserrat:wght@500;600;700;800;900&display=swap'
/* A book can swap these with --book-display / --book-ar / --book-en on a parent element. */
const AR_DISPLAY = "var(--book-display, 'Alexandria'), 'Tajawal', sans-serif"
const AR_TEXT = "var(--book-ar, 'Readex Pro'), 'Tajawal', sans-serif"
const EN = "var(--book-en, 'Montserrat'), 'Inter', sans-serif"

export interface CoverPalette { id: string; label: string; from: string; to: string; accent: string; ink: string; mist: string }
export const COVER_PALETTES: CoverPalette[] = [
  { id: 'royal', label: 'أزرق ملكي وأصفر (ألوان الكتاب)', from: '#1747D6', to: '#081F78', accent: '#FFD23F', ink: '#071A5E', mist: '#C9D7FF' },
  { id: 'navy',  label: 'كحلي وذهبي',                    from: '#17306F', to: '#070F2B', accent: '#D9AA52', ink: '#0B1636', mist: '#C8D0E6' },
  { id: 'brown', label: 'بني وأصفر',                      from: '#4E3019', to: '#1E1209', accent: '#FFD54A', ink: '#2B1B0F', mist: '#EBD9C3' },
]

export interface CoverInfo {
  palette: string
  titleAr1: string; titleAr2: string
  titleEn1: string; titleEn2: string
  level: string
  authorAr: string; authorEn: string
  /** One line about the author, for the back cover. */
  bioAr: string
  website: string; phone1: string; phone2: string; social: string
  photo: string | null
}

export const DEFAULT_COVER: CoverInfo = {
  palette: 'royal',
  titleAr1: 'الإنجليزية', titleAr2: 'للمواقف اليومية',
  titleEn1: 'English for', titleEn2: 'Everyday Situations',
  level: 'A1 → A2',
  authorAr: 'الأستاذ حمزة القصراوي', authorEn: 'Hamza El Qasraoui',
  bioAr: 'أستاذ اللغة الإنجليزية ومؤسّس أكاديمية إنجليزي الدولية، يعلّم الإنجليزية للناطقين بالعربية بطريقة عملية ومبسّطة.',
  website: 'inglizi.com', phone1: '+212 764 189 311', phone2: '', social: '@elqasraouihamza',
  photo: null,
}

function useCoverFonts() {
  useEffect(() => {
    if (document.getElementById('cover-fonts')) return
    const link = document.createElement('link')
    // crossOrigin lets html-to-image read the rules and inline the fonts in the PNG.
    link.id = 'cover-fonts'; link.rel = 'stylesheet'; link.crossOrigin = 'anonymous'; link.href = FONTS_HREF
    document.head.appendChild(link)
  }, [])
}

/** A floating speech bubble — the book is about talking in real situations. */
function Bubble({ children, style, tone, tail, p }: {
  children: ReactNode; style: React.CSSProperties; tone: 'light' | 'accent'; tail: 'left' | 'right'; p: CoverPalette
}) {
  const bg = tone === 'light' ? '#FFFFFF' : p.accent
  return (
    <div className="absolute" style={style}>
      <div className="relative rounded-[18px] px-5 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]" style={{ background: bg, color: p.ink }}>
        {children}
        <span className="absolute w-4 h-4 rotate-45" style={{ background: bg, bottom: -6, [tail]: 22 }} />
      </div>
    </div>
  )
}

const Stat = ({ n, ar, en, p, icon }: { n?: string; ar: string; en: string; p: CoverPalette; icon?: ReactNode }) => (
  <div className="flex-1 flex flex-col items-center justify-center rounded-2xl py-3"
    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.16)' }}>
    <span dir="ltr" className="flex items-center justify-center h-[34px] text-[30px] font-black leading-none" style={{ fontFamily: EN, color: p.accent }}>{n ?? icon}</span>
    <span className="mt-1.5 text-[14px] font-semibold text-white" style={{ fontFamily: AR_TEXT }}>{ar}</span>
    <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ fontFamily: EN, color: p.mist }}>{en}</span>
  </div>
)

export interface CoverStat { n?: string; icon?: ReactNode; ar: string; en: string }
export interface CoverBubble { text: string; ar?: boolean }

/** The workbook's own stats, for its cover. */
export const workbookStats = (units: number, kinds: number): CoverStat[] => [
  { n: String(units), ar: 'وحدة', en: 'Units' },
  { n: String(kinds), ar: 'أنواع تمارين', en: 'Exercise types' },
  { n: String(units * kinds), ar: 'صفحة تمارين', en: 'Practice pages' },
  { icon: <KeyRound size={28} strokeWidth={2.6} />, ar: 'مفاتيح الحل', en: 'Answer keys' },
]

const WORKBOOK_BADGE = { ar: 'دفتر التمارين', en: 'WORKBOOK' }
const WORKBOOK_BUBBLES: CoverBubble[] = [
  { text: 'Nice to meet you!' }, { text: 'بكم هذا؟', ar: true }, { text: 'أين المحطة؟', ar: true }, { text: 'How much is it?' },
]

/** Title line one shrinks with its length, so a longer title still fits the width. */
const titleSize = (s: string) => Math.min(104, Math.floor(1160 / Math.max(1, s.trim().length)))

export const paletteOf = (info: CoverInfo) => COVER_PALETTES.find(x => x.id === info.palette) ?? COVER_PALETTES[0]

export function CoverPage({ info, theme, stats, badge = WORKBOOK_BADGE, bubbles = WORKBOOK_BUBBLES, filename = '00-cover' }: {
  info: CoverInfo; theme: SheetTheme; stats: CoverStat[]
  badge?: { ar: string; en: string }; bubbles?: CoverBubble[]; filename?: string
}) {
  useCoverFonts()
  const p = paletteOf(info)
  const phones = [info.phone1, info.phone2].map(s => s.trim()).filter(Boolean)
  const spots: { style: React.CSSProperties; tail: 'left' | 'right' }[] = [
    { style: { top: 572, left: 58, transform: 'rotate(-4deg)' }, tail: 'right' },
    { style: { top: 704, left: 92, transform: 'rotate(3deg)' }, tail: 'left' },
    { style: { top: 590, right: 64, transform: 'rotate(4deg)' }, tail: 'right' },
    { style: { top: 724, right: 46, transform: 'rotate(-3deg)' }, tail: 'left' },
  ]

  return (
    <BareSheet theme={theme} label="الغلاف (بدون رقم صفحة)" filename={filename}>
      <div className="absolute inset-0 overflow-hidden text-white" dir="rtl"
        style={{ background: `linear-gradient(160deg, ${p.from} 0%, ${p.to} 72%)`, fontFamily: AR_TEXT }}>

        {/* ── Decoration: rings, dot grid, the ghost "Aa" ── */}
        <div className="absolute rounded-full" style={{ width: 720, height: 720, top: -330, left: -300, border: '90px solid rgba(255,255,255,0.045)' }} />
        <div className="absolute rounded-full" style={{ width: 460, height: 460, bottom: 40, right: -250, border: `2px solid ${p.accent}`, opacity: 0.35 }} />
        <div className="absolute rounded-full" style={{ width: 380, height: 380, bottom: 80, right: -210, border: '1px solid rgba(255,255,255,0.18)' }} />
        <svg className="absolute" style={{ top: 128, right: 26 }} width="70" height="142" aria-hidden>
          {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={5 + (i % 3) * 30} cy={5 + Math.floor(i / 3) * 19} r="2.2" fill="#fff" opacity="0.22" />)}
        </svg>
        <div className="absolute font-black leading-none select-none" dir="ltr"
          style={{ fontFamily: EN, fontSize: 420, left: -24, top: 470, color: 'rgba(255,255,255,0.035)' }}>Aa</div>

        {/* ── Top bar ── */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-12" style={{ height: 92 }} dir="ltr">
          <span className="text-[26px] font-extrabold" style={{ fontFamily: EN }}>Inglizi<span style={{ color: p.accent }}>.com</span></span>
          <span className="flex items-center gap-3 text-[15px] font-medium" style={{ color: p.mist }} dir="rtl">
            <span className="w-8 h-[2px]" style={{ background: p.accent }} />
            أكاديمية إنجليزي الدولية
          </span>
        </div>
        <div className="absolute inset-x-12" style={{ top: 92, height: 1, background: 'rgba(255,255,255,0.16)' }} />

        {/* ── Titles ── */}
        <div className="absolute inset-x-0 flex flex-col items-center text-center" style={{ top: 128 }}>
          <span className="inline-flex items-center gap-3 rounded-full px-6 py-2 text-[15px] font-bold" style={{ background: p.accent, color: p.ink }}>
            <span style={{ fontFamily: AR_TEXT }}>{badge.ar}</span>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.ink }} />
            <span className="tracking-[0.2em]" style={{ fontFamily: EN }}>{badge.en}</span>
          </span>

          {/* Room under line one: the hamza of «إ» and the dot of «ج» hang low
              and would otherwise land on line two. */}
          <p className="mt-5 font-black leading-[1.15] whitespace-nowrap" style={{ fontFamily: AR_DISPLAY, fontSize: titleSize(info.titleAr1), color: '#FFFFFF' }}>{info.titleAr1}</p>
          <p className="mt-5 font-extrabold leading-[1.25]" style={{ fontFamily: AR_DISPLAY, fontSize: 62, color: p.accent }}>{info.titleAr2}</p>

          <div className="mt-5 flex items-center gap-4" dir="ltr">
            <span className="h-px w-14" style={{ background: 'rgba(255,255,255,0.4)' }} />
            <span className="text-[17px] font-semibold uppercase tracking-[0.42em]" style={{ fontFamily: EN, color: p.mist }}>{info.titleEn1}</span>
            <span className="h-px w-14" style={{ background: 'rgba(255,255,255,0.4)' }} />
          </div>
          <p className="mt-1 text-[38px] font-black uppercase tracking-[0.03em]" style={{ fontFamily: EN }} dir="ltr">{info.titleEn2}</p>
        </div>

        {/* ── Centre: photo (or level emblem) among speech bubbles ── */}
        <div className="absolute" style={{ top: 560, left: '50%', marginLeft: -142, width: 284, height: 284 }}>
          <div className="absolute rounded-full" style={{ inset: -18, border: '2px dashed rgba(255,255,255,0.3)' }} />
          <div className="absolute inset-0 rounded-full" style={{ background: p.accent, padding: 7 }}>
            {info.photo ? (
              <div className="w-full h-full rounded-full" style={{ backgroundImage: `url(${info.photo})`, backgroundSize: 'cover', backgroundPosition: 'center top' }} />
            ) : (
              <div className="w-full h-full rounded-full flex flex-col items-center justify-center" style={{ background: `linear-gradient(160deg, ${p.from}, ${p.to})` }}>
                <span className="text-[16px] font-semibold" style={{ color: p.mist }}>المستوى</span>
                <span className="mt-1 text-[54px] font-black leading-none" style={{ fontFamily: EN }} dir="ltr">{info.level}</span>
                <span className="mt-2 text-[12px] font-bold uppercase tracking-[0.3em]" style={{ fontFamily: EN, color: p.accent }}>Level</span>
              </div>
            )}
          </div>
          {info.photo && (
            <div className="absolute flex flex-col items-center justify-center rounded-full shadow-[0_10px_24px_rgba(0,0,0,0.3)]"
              style={{ width: 112, height: 112, left: -26, bottom: -22, background: p.accent, color: p.ink, transform: 'rotate(-10deg)' }}>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ fontFamily: EN }}>Level</span>
              <span className="text-[24px] font-black leading-tight" style={{ fontFamily: EN }} dir="ltr">{info.level}</span>
            </div>
          )}
        </div>

        {bubbles.slice(0, 4).map((b, i) => (
          <Bubble key={i} p={p} tone={b.ar ? 'accent' : 'light'} tail={spots[i].tail} style={spots[i].style}>
            {b.ar
              ? <span className="text-[20px] font-bold" style={{ fontFamily: AR_TEXT }}>{b.text}</span>
              : <span className="text-[19px] font-bold" style={{ fontFamily: EN }} dir="ltr">{b.text}</span>}
          </Bubble>
        ))}

        {/* ── What's inside ── */}
        <div className="absolute inset-x-12 flex gap-3" style={{ top: 866 }}>
          {stats.map(s => <Stat key={s.en} p={p} n={s.n} icon={s.icon} ar={s.ar} en={s.en} />)}
        </div>

        {/* ── Author ── */}
        <div className="absolute inset-x-0 flex items-center justify-center gap-4" style={{ top: 994 }}>
          <span className="text-[14px] font-medium" style={{ color: p.mist }}>إعداد وتقديم</span>
          <span className="w-px h-9" style={{ background: 'rgba(255,255,255,0.3)' }} />
          <span className="flex flex-col items-start">
            <span className="text-[23px] font-bold leading-tight" style={{ fontFamily: AR_DISPLAY }}>{info.authorAr}</span>
            <span className="text-[12.5px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: EN, color: p.mist }} dir="ltr">{info.authorEn}</span>
          </span>
        </div>

        {/* ── Contact bar ── */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-7 px-10" style={{ height: 64, background: p.accent, color: p.ink }} dir="ltr">
          {info.website && <Contact icon={<Globe size={17} strokeWidth={2.4} />} text={info.website} />}
          {phones.map(n => <Contact key={n} icon={<Phone size={16} strokeWidth={2.4} />} text={n} />)}
          {info.social && <Contact icon={<Instagram size={17} strokeWidth={2.4} />} text={info.social} />}
        </div>
      </div>
    </BareSheet>
  )
}

export const Contact = ({ icon, text }: { icon: ReactNode; text: string }) => (
  <span className="flex items-center gap-2 text-[16px] font-extrabold whitespace-nowrap" style={{ fontFamily: EN }}>
    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-black/10">{icon}</span>
    <bdi>{text}</bdi>
  </span>
)

/** The back cover, in the same palette: a headline, the pitch, what's
 *  inside, the author, the other books of the series, a free box for the
 *  printer's barcode / ISBN, and the same contact bar as the front. */
export function BackCoverPage({ info, theme, headline, blurbAr, bullets, series, filename = '99-back-cover' }: {
  info: CoverInfo; theme: SheetTheme
  headline: { ar: string; en: string }
  blurbAr: string
  bullets: { ar: string; en: string }[]
  series: { ar: string; en: string; current?: boolean }[]
  filename?: string
}) {
  useCoverFonts()
  const p = paletteOf(info)
  const phones = [info.phone1, info.phone2].map(s => s.trim()).filter(Boolean)
  const initials = info.authorEn.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('')

  return (
    <BareSheet theme={theme} label="الغلاف الخلفي (بدون رقم صفحة)" filename={filename}>
      <div className="absolute inset-0 overflow-hidden text-white" dir="rtl"
        style={{ background: `linear-gradient(200deg, ${p.from} 0%, ${p.to} 70%)`, fontFamily: AR_TEXT }}>
        <div className="absolute rounded-full" style={{ width: 640, height: 640, bottom: -330, right: -260, border: '80px solid rgba(255,255,255,0.045)' }} />
        <div className="absolute rounded-full" style={{ width: 380, height: 380, top: -150, left: -170, border: `2px solid ${p.accent}`, opacity: 0.3 }} />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-12" style={{ height: 92 }} dir="ltr">
          <span className="text-[24px] font-extrabold" style={{ fontFamily: EN }}>Inglizi<span style={{ color: p.accent }}>.com</span></span>
          <span className="text-[14px] font-medium" style={{ color: p.mist }}>أكاديمية إنجليزي الدولية</span>
        </div>
        <div className="absolute inset-x-12" style={{ top: 92, height: 1, background: 'rgba(255,255,255,0.16)' }} />

        <div className="absolute inset-x-12" style={{ top: 124 }}>
          <p className="font-black leading-[1.3]" style={{ fontFamily: AR_DISPLAY, fontSize: 44 }}>{headline.ar}</p>
          <p className="mt-1 text-[21px] font-bold" style={{ fontFamily: EN, color: p.accent }} dir="ltr">{headline.en}</p>

          <p className="mt-6 text-[16.5px] leading-[1.9] font-medium" style={{ color: '#EEF2FF' }}>{blurbAr}</p>

          <div className="mt-6 rounded-2xl px-6 py-5" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.16)' }}>
            <div className="flex items-center justify-between text-[13px] font-bold mb-3">
              <span style={{ color: p.accent }}>داخل الكتاب</span>
              <span className="uppercase tracking-[0.2em]" style={{ fontFamily: EN, color: p.mist }} dir="ltr">Inside this book</span>
            </div>
            <div className="space-y-2.5">
              {bullets.map(b => (
                <div key={b.en} className="flex items-start gap-3">
                  <span className="mt-1 flex items-center justify-center w-5 h-5 shrink-0 rounded-full text-[12px] font-black" style={{ background: p.accent, color: p.ink }}>✓</span>
                  <span className="flex-1">
                    <span className="block text-[15.5px] font-bold leading-snug">{b.ar}</span>
                    <span className="block text-[12px] font-semibold text-right" style={{ fontFamily: EN, color: p.mist }}><bdi>{b.en}</bdi></span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="w-[84px] h-[84px] shrink-0 rounded-full p-[4px]" style={{ background: p.accent }}>
              {info.photo
                ? <div className="w-full h-full rounded-full" style={{ backgroundImage: `url(${info.photo})`, backgroundSize: 'cover', backgroundPosition: 'center top' }} />
                : <div className="w-full h-full rounded-full flex items-center justify-center text-[26px] font-black" style={{ background: p.to, fontFamily: EN }} dir="ltr">{initials}</div>}
            </div>
            <div className="flex-1">
              <div className="text-[12.5px] font-medium" style={{ color: p.mist }}>عن المؤلف</div>
              <div className="text-[21px] font-bold leading-tight" style={{ fontFamily: AR_DISPLAY }}>{info.authorAr}</div>
              <div className="text-[13.5px] font-medium leading-relaxed" style={{ color: '#E5EAF7' }}>{info.bioAr}</div>
            </div>
          </div>
        </div>

        {/* Series + barcode box */}
        <div className="absolute inset-x-12 flex items-end justify-between gap-6" style={{ bottom: 96 }}>
          <div>
            <div className="text-[12.5px] font-bold mb-2" style={{ color: p.mist }}>من نفس السلسلة · <span style={{ fontFamily: EN }} dir="ltr">In the series</span></div>
            <div className="flex flex-wrap gap-2">
              {series.map(s => (
                <span key={s.en} className="rounded-xl px-3 py-1.5 text-[13px] font-bold"
                  style={s.current ? { background: p.accent, color: p.ink } : { border: '1px solid rgba(255,255,255,0.35)' }}>
                  {s.ar} <span className="opacity-60">·</span> <bdi className="opacity-70 text-[11px]" style={{ fontFamily: EN }}>{s.en}</bdi>
                </span>
              ))}
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1 text-[14px] font-black" style={{ background: 'rgba(255,255,255,0.12)', fontFamily: EN }} dir="ltr">
              LEVEL {info.level}
            </div>
          </div>
          <div className="w-[190px] h-[110px] shrink-0 rounded-lg bg-white flex flex-col items-center justify-center text-[11px] font-bold text-zinc-400" style={{ border: '2px dashed #CBD5E1' }}>
            <span style={{ fontFamily: EN }}>ISBN / BARCODE</span>
            <span>مكان الباركود</span>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-7 px-10" style={{ height: 64, background: p.accent, color: p.ink }} dir="ltr">
          {info.website && <Contact icon={<Globe size={17} strokeWidth={2.4} />} text={info.website} />}
          {phones.map(n => <Contact key={n} icon={<Phone size={16} strokeWidth={2.4} />} text={n} />)}
          {info.social && <Contact icon={<Instagram size={17} strokeWidth={2.4} />} text={info.social} />}
        </div>
      </div>
    </BareSheet>
  )
}

/* ── Admin-side form ─────────────────────────────────────────────────── */

export function CoverFields({ value, onChange, defaults = DEFAULT_COVER, showBio }: {
  value: CoverInfo; onChange: (v: CoverInfo) => void; defaults?: CoverInfo; showBio?: boolean
}) {
  const set = (k: keyof CoverInfo) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [k]: e.target.value })

  function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange({ ...value, photo: String(reader.result) })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const row = (label: string, k: keyof CoverInfo, ltr?: boolean, placeholder?: string) => (
    <label className="block">
      <span className="block text-[11.5px] font-bold text-zinc-400 mb-0.5">{label}</span>
      <input value={String(value[k] ?? '')} onChange={set(k)} dir={ltr ? 'ltr' : 'rtl'} placeholder={placeholder} className={INP} />
    </label>
  )

  return (
    <Field label="الغلاف" hint="تُحفظ هذه البيانات في متصفحك.">
      <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-3">
        <div className="flex flex-col gap-1.5">
          {COVER_PALETTES.map(p => (
            <button key={p.id} type="button" onClick={() => onChange({ ...value, palette: p.id })} aria-pressed={value.palette === p.id}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[12px] font-bold text-right ${value.palette === p.id ? 'border-zinc-900 ring-2 ring-zinc-200' : 'border-zinc-200'}`}>
              <span className="flex -space-x-1 shrink-0">
                <span className="w-4 h-4 rounded-full border border-white" style={{ background: p.from }} />
                <span className="w-4 h-4 rounded-full border border-white" style={{ background: p.accent }} />
              </span>
              {p.label}
            </button>
          ))}
        </div>
        {row('العنوان (السطر الأول)', 'titleAr1')}
        {row('العنوان (السطر الثاني)', 'titleAr2')}
        {row('English (small line)', 'titleEn1', true)}
        {row('English title', 'titleEn2', true)}
        {row('المستوى', 'level', true)}
        {row('الاسم بالعربية', 'authorAr')}
        {row('Name in English', 'authorEn', true)}
        {showBio && row('نبذة عنك (الغلاف الخلفي)', 'bioAr')}
        {row('الموقع', 'website', true)}
        {row('الهاتف / واتساب 1', 'phone1', true)}
        {row('الهاتف 2 (اختياري)', 'phone2', true, '+212 …')}
        {row('إنستغرام (اختياري)', 'social', true)}
        <div className="flex items-center gap-2 pt-1">
          <label className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-300 py-2 text-[12.5px] font-bold text-zinc-600 cursor-pointer hover:bg-zinc-50">
            <ImagePlus size={15} /> {value.photo ? 'تغيير الصورة' : 'أضف صورتك (اختياري)'}
            <input type="file" accept="image/*" onChange={pickPhoto} className="hidden" />
          </label>
          {value.photo && (
            <button type="button" onClick={() => onChange({ ...value, photo: null })} title="إزالة الصورة"
              className="rounded-lg border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-50"><X size={15} /></button>
          )}
        </div>
        <button type="button" onClick={() => onChange({ ...defaults, palette: value.palette, photo: value.photo })}
          className="w-full text-[12px] font-bold text-zinc-400 hover:text-zinc-700">استرجاع النصوص الأصلية</button>
      </div>
    </Field>
  )
}
