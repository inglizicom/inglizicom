'use client'

import type { ReactNode } from 'react'
import {
  APPS_INDEX, CHECKED, CHECKLIST, CURRENCIES, DATES, DAYS, DICTIONARY, EMERGENCY, EMERGENCY_CALL, EMERGENCY_PHRASES, LETTER_TRAPS,
  LOST_PASSPORT, MEASURES, MONTHS, MY_TRIP, ORDINALS, PARTS, PLUGS, SAY_NUMBERS, SAY_PRICES, SIZES, SPELLING, STOPS,
  SURVIVAL, TEMPERATURES, TIMES, type buildViizaBook, type Region, type ViizaPage,
} from '@/data/viiza-book'
import { PLAY } from '@/components/QrLink'
import { Ar, Body, C, En, Footer, Ico, PAD, Qr, REGION, RegionBadge, Route, Sec, Sheet } from './_kit'
import { stopAnswers } from './_stop'

/**
 * The pages around the journey. Before it: the title page, the welcome and
 * how-to page, the contents as a route, "My trip" to fill in, the toolkit
 * (letters, numbers, times, dates, money) and the survival phrases. Between
 * the parts: a red divider. After it: the reference pages a traveller opens
 * on the road (point-and-show pictures, emergencies, sizes and conversions,
 * the apps), the travel stamps and the answer key.
 */

type Book = ReturnType<typeof buildViizaBook>
type MatterKind = Exclude<ViizaPage, { stop: number }> | { kind: 'title' }

export function MatterPage({ page, pageNo, book, filename }: { page: MatterKind; pageNo: number; book: Book; filename: string }) {
  const label = `${page.kind} · p. ${pageNo}`
  switch (page.kind) {
    case 'title': return <Sheet label="Title page" filename={filename} bg={C.cream}><TitlePage /></Sheet>
    case 'part': return <Sheet label={label} filename={filename} bg={C.red}><PartDivider part={page.part} book={book} /><Footer pageNo={pageNo} dark /></Sheet>
    default: {
      const head = HEADS[page.kind]
      return (
        <Sheet label={label} filename={filename}>
          <PageHead {...head} />
          <Body>{BODY[page.kind](page, book)}</Body>
          <Footer pageNo={pageNo} />
        </Sheet>
      )
    }
  }
}

/* ── Shared pieces ──────────────────────────────────────────────────── */

const HEADS: Record<string, { en: string; ar: string; icon: string; tag: string }> = {
  welcome: { en: 'Welcome aboard', ar: 'مرحبًا بك على متن الرحلة', icon: 'Plane', tag: 'Before you go' },
  contents: { en: 'Your journey', ar: 'رحلتك: الفهرس', icon: 'Route', tag: 'Contents' },
  mytrip: { en: 'My trip', ar: 'معلومات رحلتي', icon: 'Contact', tag: 'Fill it in before you leave' },
  'toolkit-1': { en: 'Toolkit · Letters & numbers', ar: 'أدوات المسافر: الحروف والأرقام', icon: 'Hash', tag: 'Toolkit 1' },
  'toolkit-2': { en: 'Toolkit · Time, dates & money', ar: 'أدوات المسافر: الوقت والتاريخ والمال', icon: 'Clock', tag: 'Toolkit 2' },
  'phrases-1': { en: 'Survival phrases', ar: 'جمل تنقذك في كل مكان', icon: 'LifeBuoy', tag: 'Survival kit 1' },
  'phrases-2': { en: 'Survival phrases', ar: 'جمل تنقذك في كل مكان', icon: 'LifeBuoy', tag: 'Survival kit 2' },
  'dictionary-1': { en: 'Point & show', ar: 'أشِر وأظهر: قاموس مصوّر', icon: 'Pointer', tag: 'On the road 1' },
  'dictionary-2': { en: 'Point & show', ar: 'أشِر وأظهر: قاموس مصوّر', icon: 'Pointer', tag: 'On the road 2' },
  emergency: { en: 'Emergencies', ar: 'الطوارئ', icon: 'Siren', tag: 'On the road 3' },
  conversions: { en: 'Sizes & conversions', ar: 'المقاسات والتحويلات', icon: 'Ruler', tag: 'On the road 4' },
  apps: { en: 'Apps for every step', ar: 'تطبيقات لكل مرحلة', icon: 'Smartphone', tag: 'On the road 5' },
  stamps: { en: 'Your travel stamps', ar: 'أختام رحلتك', icon: 'Stamp', tag: 'Your progress' },
  key: { en: 'Answer key', ar: 'الأجوبة', icon: 'CircleCheck', tag: 'Practice answers' },
}

export function PageHead({ en, ar, icon, tag }: { en: string; ar: string; icon: string; tag: string }) {
  return (
    <div className="flex h-[54px] items-stretch" dir="ltr" style={{ borderBottom: `2px solid ${C.red}` }}>
      <div className="flex w-[64px] items-center justify-center" style={{ background: C.navy }}><Ico name={icon} size={24} color={C.saff} /></div>
      <div className="flex flex-1 items-center justify-between gap-3 px-5">
        <div className="leading-tight">
          <div className="text-[17px] font-extrabold">{en}</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: C.grey }}>{tag}</div>
        </div>
        <Ar className="text-[17px] font-extrabold" style={{ color: C.red }}>{ar}</Ar>
      </div>
    </div>
  )
}

/** A row of English over Arabic, left-aligned. */
const EnAr = ({ en, ar, size = 13, arSize = 11.5, bold = true }: { en: string; ar: string; size?: number; arSize?: number; bold?: boolean }) => (
  <div className="min-w-0 leading-snug">
    <div className={bold ? 'font-bold' : 'font-semibold'} style={{ fontSize: size }}><En>{en}</En></div>
    <Ar className="text-left font-semibold" style={{ fontSize: arSize, color: C.grey }}>{ar}</Ar>
  </div>
)

const Box = ({ children, tint = C.cream, className = '' }: { children: ReactNode; tint?: string; className?: string }) => (
  <div className={`rounded-xl px-4 py-3 ${className}`} style={{ background: tint }}>{children}</div>
)

/** A small table: the first row is the head. */
function Grid({ rows, cols, size = 12.5 }: { rows: string[][]; cols: string; size?: number }) {
  return (
    <div className="overflow-hidden rounded-lg" dir="ltr" style={{ border: `1.5px solid ${C.navy}` }}>
      {rows.map((r, k) => (
        <div key={k} className="grid items-center" style={{ gridTemplateColumns: cols, background: k === 0 ? C.navy : k % 2 ? '#fff' : C.cream, color: k === 0 ? '#fff' : C.ink }}>
          {r.map((c, i) => (
            /[؀-ۿ]/.test(c) && !/^[A-Za-z]/.test(c)
              ? <Ar key={i} className="px-3 py-[4px] text-left font-semibold" style={{ fontSize: size - 0.5, color: k === 0 ? '#fff' : C.grey }}>{c}</Ar>
              : <div key={i} className={`px-3 py-[4px] ${k === 0 ? 'text-[10.5px] font-extrabold uppercase tracking-[0.06em]' : i === 0 ? 'font-extrabold' : 'font-semibold'}`} style={k === 0 ? {} : { fontSize: size }}>{c}</div>
          ))}
        </div>
      ))}
    </div>
  )
}

/* ── Title page ─────────────────────────────────────────────────────── */

function TitlePage() {
  return (
    <div className="absolute inset-0 flex flex-col px-14 pb-10 pt-12" dir="ltr">
      <div className="flex items-center justify-between">
        <span className="text-[16px] font-extrabold">Inglizi<span style={{ color: C.red }}>.com</span></span>
        <span className="text-[11px] font-extrabold tracking-[0.2em]" style={{ color: C.grey }}>LEVEL 3 · A2 → B1 · STUDENT'S BOOK</span>
      </div>
      <div className="mt-20">
        <div className="text-[150px] font-extrabold leading-[0.85] tracking-[-0.04em]" style={{ color: C.red }}>VIIZA</div>
        <div className="mt-3 text-[26px] font-extrabold tracking-[0.55em]" style={{ color: C.navy }}>ENGLISH</div>
      </div>
      <div className="mt-10 h-[3px] w-[120px]" style={{ background: C.saff }} />
      <div className="mt-8 text-[34px] font-extrabold leading-tight">The Travel English Guide</div>
      <Ar className="mt-1 text-right text-[34px] font-extrabold leading-tight" style={{ color: C.red }}>دليل الإنجليزية للسفر</Ar>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <span className="text-[17px] font-bold" style={{ color: C.grey }}>From your visa to your front door.</span>
        <Ar className="text-[17px] font-bold" style={{ color: C.grey }}>من التأشيرة إلى باب بيتك.</Ar>
      </div>
      <div className="mt-12 rounded-2xl px-6 py-5" style={{ background: C.red }}><Route part={0} /></div>
      <div className="mt-10 grid grid-cols-2 gap-6">
        <div className="rounded-xl border-2 border-dashed px-5 py-4" style={{ borderColor: C.line }}>
          <div className="flex items-center justify-between"><span className="text-[11px] font-extrabold tracking-[0.12em]" style={{ color: C.grey }}>THIS BOOK BELONGS TO</span><Ar className="text-[12px] font-bold" style={{ color: C.grey }}>هذا الكتاب ملك</Ar></div>
          <div className="mt-7 border-b-[1.5px]" style={{ borderColor: '#9AA1B4' }} />
          <div className="mt-6 border-b-[1.5px]" style={{ borderColor: '#9AA1B4' }} />
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-[18px] font-extrabold">Hamza El Qasraoui</div>
          <Ar className="text-left text-[17px] font-bold" style={{ color: C.grey }}>حمزة القصراوي</Ar>
          <div className="mt-2 text-[12.5px] font-bold" style={{ color: C.grey }}>34 stops · 6 parts · audio for every stop</div>
        </div>
      </div>
      <div className="mt-auto flex items-end justify-between gap-6 border-t pt-4 text-[10.5px] font-semibold leading-relaxed" style={{ borderColor: C.line, color: C.grey }}>
        <div>Travel rules, numbers and prices were checked in {CHECKED.en}. Rules change:<br />always check the official website before you travel. © Inglizi.com — all rights reserved.</div>
        <div className="shrink-0 text-right text-[11px] font-semibold leading-relaxed">
          <Ar>{`المعلومات محدّثة حتى ${CHECKED.ar}. القوانين تتغيّر:`}</Ar>
          <Ar>تحقّق دائمًا من الموقع الرسمي قبل السفر.</Ar>
        </div>
      </div>
    </div>
  )
}

/* ── Part divider ───────────────────────────────────────────────────── */

function PartDivider({ part, book }: { part: number; book: Book }) {
  const p = PARTS.find(x => x.n === part)!
  const stops = STOPS.filter(s => s.part === part)
  return (
    <div className="absolute inset-x-0 top-0 bottom-[34px] flex flex-col px-12 pb-8 pt-14 text-white" dir="ltr">
      <div className="absolute right-[-40px] top-[90px] opacity-[0.09]"><Ico name={p.icon} size={420} color="#fff" stroke={1.4} /></div>
      <div className="text-[13px] font-extrabold tracking-[0.35em]" style={{ color: C.saff }}>PART</div>
      <div className="text-[150px] font-extrabold leading-[0.85] tracking-[-0.04em]" style={{ color: C.saff }}>{part}</div>
      <div className="mt-6 text-[52px] font-extrabold leading-[1.02]">{p.titleEn}</div>
      <Ar className="mt-1 text-left text-[42px] font-extrabold" style={{ color: C.saff }}>{p.titleAr}</Ar>
      <Ar className="mt-5 max-w-[560px] text-right text-[17px] font-semibold leading-[1.75] opacity-95" style={{ marginLeft: 'auto' }}>{p.intro}</Ar>
      <div className="mt-8"><Route part={part} /></div>
      <div className="mt-auto space-y-1.5">
        {stops.map(s => (
          <div key={s.n} className="flex items-center gap-4 rounded-xl px-4 py-2.5" style={{ background: C.redD }}>
            <span className="w-[54px] text-[22px] font-extrabold" style={{ color: C.saff }}>{PAD(s.n)}</span>
            <Ico name={s.icon} size={20} color="#fff" />
            <span className="flex-1 text-[16px] font-extrabold">{s.titleEn}</span>
            <Ar className="text-[15px] font-bold opacity-90">{s.titleAr}</Ar>
            <span className="w-[40px] text-right text-[14px] font-extrabold" style={{ color: C.saff }}>{book.stopPage(s.n)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Front matter ───────────────────────────────────────────────────── */

const WELCOME = [
  'عزيزي المسافر،',
  'هذا الكتاب ليس كتاب قواعد. إنه رفيقك في السفر: يمشي معك خطوة بخطوة، من استمارة التأشيرة إلى باب بيتك عند العودة. في كل محطة يعطيك الجمل التي تقولها، والجمل التي ستسمعها، وما يجب أن تعرفه قبل أن تصل، والتطبيقات التي تحتاجها.',
  'لا تحتاج إنجليزية مثالية لتسافر. تحتاج جملًا واضحة في اللحظة المناسبة، وقليلًا من الشجاعة. ضع هذا الكتاب في حقيبتك، وافتحه في المطار والفندق والشارع، واستعمل بطاقات النجاة كلما توقّفت الكلمات.',
  'رحلة سعيدة! — حمزة القصراوي',
]

const HOW: { icon: string; en: string; ar: string; items: string }[] = [
  { icon: 'Flag', en: '1 · Opener', ar: 'البداية', items: 'الموقف، وما ستتعلمه، و«اعرف قبل أن تسافر» حسب الوجهة، والتطبيقات، ونصيحة مسافر.' },
  { icon: 'BookA', en: '2 · Vocabulary', ar: 'المفردات', items: 'الكلمات الأساسية بمثال لكل كلمة، والأفعال التي تحتاجها، وكلمات تأتي معًا.' },
  { icon: 'ArrowLeftRight', en: '3 · You hear · You say', ar: 'تسمع وتردّ', items: 'ما تسمعه وكيف تردّ عليه، وما تقوله وما قد يُردّ عليك.' },
  { icon: 'Eye', en: '4 · In real life', ar: 'في الواقع', items: 'شاشة أو وثيقة أو لوحة حقيقية مشروحة بالأرقام، والأخطاء التي يقع فيها المتكلمون بالعربية.' },
  { icon: 'MessagesSquare', en: '5 · Conversation', ar: 'المحادثة', items: 'حوار حقيقي بترجمته سطرًا سطرًا، ثم «صحيح أم خطأ» لتتأكد أنك فهمت.' },
  { icon: 'PenLine', en: '6 · Practice', ar: 'التمارين', items: 'ثلاثة تمارين، وتمثيل الموقف مع زميل، ثم بطاقة النجاة: جمل تُظهرها أو تقرؤها عند الحاجة.' },
]

const THREE_WAYS = [
  { icon: 'GraduationCap', en: 'In class', ar: 'في القسم', tint: C.navyS, text: 'استمع إلى المحطة (الرمز)، احفظ المفردات، تدرّب على «تسمع وتردّ»، مثّل المحادثة، ثم التمارين والتمثيل مع زميل.' },
  { icon: 'House', en: 'Before the trip', ar: 'قبل السفر', tint: C.redS, text: 'املأ «معلومات رحلتي»، وراجع محطات وجهتك، وحمّل التطبيقات، وتدرّب على بطاقات النجاة.' },
  { icon: 'Plane', en: 'On the trip', ar: 'أثناء السفر', tint: C.saffS, text: 'افتح المحطة التي تعيشها الآن، وأظهر بطاقة النجاة أو القاموس المصوّر، واكتب جملك الجديدة.' },
]

function Welcome() {
  return (
    <div className="space-y-3.5">
      <Box>
        {WELCOME.map((p, i) => <Ar key={i} className={`text-[14px] leading-[1.8] ${i === 0 || i === WELCOME.length - 1 ? 'font-extrabold' : 'font-semibold'} ${i ? 'mt-2' : ''}`} style={i === WELCOME.length - 1 ? { color: C.red } : undefined}>{p}</Ar>)}
      </Box>
      <div>
        <Sec icon="Map" en="How every stop works" ar="كيف تعمل كل محطة: ست صفحات" />
        <div className="mt-2.5 grid grid-cols-3 gap-2.5" dir="ltr">
          {HOW.map(h => (
            <div key={h.en} className="rounded-xl px-3 py-2" style={{ border: `1px solid ${C.line}` }}>
              <div className="flex items-center gap-2">
                <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md" style={{ background: C.redS }}><Ico name={h.icon} size={15} color={C.red} /></span>
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-extrabold">{h.en}</span>
                <Ar as="span" className="shrink-0 text-[12px] font-bold" style={{ color: C.red }}>{h.ar}</Ar>
              </div>
              <Ar className="mt-1 text-[11.5px] font-semibold leading-[1.6]" style={{ color: C.grey }}>{h.items}</Ar>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Sec icon="Info" en="Signs in this book" ar="رموز الكتاب" color={C.navy} />
        <div className="mt-2.5 grid grid-cols-[1.3fr_1fr] gap-4" dir="ltr">
          <div className="space-y-1">
            {(['all', 'gulf', 'usa', 'uk', 'europe'] as Region[]).map(r => (
              <div key={r} className="flex items-center gap-3" dir="rtl">
                <RegionBadge region={r} />
                <Ar className="text-[12.5px] font-semibold">{r === 'all' ? 'معلومة صالحة لكل الوجهات.' : `معلومة خاصة بـ${REGION[r].ar}.`}</Ar>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3"><Qr url={PLAY.viiza(1)} size={46} /><Ar className="text-[12.5px] font-semibold leading-snug">امسح الرمز في أول كل محطة لتسمع كلماتها وجملها ومحادثتها.</Ar></div>
            <div className="flex items-center gap-3"><span className="flex h-[40px] w-[58px] shrink-0 items-center justify-center rounded-lg border-2 border-dashed" style={{ borderColor: C.red }}><Ico name="Scissors" size={18} color={C.red} /></span><Ar className="text-[12.5px] font-semibold leading-snug">بطاقة النجاة: صوّرها بهاتفك أو أظهر الصفحة نفسها.</Ar></div>
          </div>
        </div>
      </div>
      <div>
        <Sec icon="Compass" en="Use it three ways" ar="ثلاث طرق لاستعمال الكتاب" />
        <div className="mt-2.5 grid grid-cols-3 gap-3" dir="ltr">
          {THREE_WAYS.map(w => (
            <div key={w.en} className="rounded-xl px-3 py-2.5" style={{ background: w.tint }}>
              <div className="flex items-center gap-2"><Ico name={w.icon} size={17} color={C.navy} /><span className="text-[13px] font-extrabold">{w.en}</span></div>
              <Ar className="mt-0.5 text-left text-[13px] font-extrabold" style={{ color: C.red }}>{w.ar}</Ar>
              <Ar className="mt-1 text-[12px] font-semibold leading-[1.65]" style={{ color: C.grey }}>{w.text}</Ar>
            </div>
          ))}
        </div>
      </div>
      <Box tint={C.saffS}>
        <div className="flex items-start gap-3" dir="rtl">
          <Ico name="ShieldCheck" size={20} color={C.saffD} />
          <Ar className="text-[12.5px] font-semibold leading-[1.7]">{`المعلومات في هذا الكتاب (القوانين، الأرقام، الحدود) محدّثة حتى ${CHECKED.ar}. القوانين تتغيّر من سنة إلى أخرى ومن جنسية إلى أخرى: تحقّق دائمًا من الموقع الرسمي للسفارة أو شركة الطيران قبل السفر. أسماء التطبيقات للتوضيح فقط، والشاشات في الكتاب أمثلة مرسومة.`}</Ar>
        </div>
      </Box>
    </div>
  )
}

function Contents({ book }: { book: Book }) {
  const front: [string, string, string][] = [
    ['My trip', 'معلومات رحلتي', 'mytrip'], ['Toolkit: letters, numbers, time, money', 'أدوات المسافر', 'toolkit-1'], ['Survival phrases', 'جمل تنقذك', 'phrases-1'],
  ]
  const back: [string, string, string][] = [
    ['Point & show', 'قاموس مصوّر', 'dictionary-1'], ['Emergencies', 'الطوارئ', 'emergency'], ['Sizes & conversions', 'المقاسات والتحويلات', 'conversions'],
    ['Apps for every step', 'التطبيقات', 'apps'], ['Your travel stamps', 'أختام رحلتك', 'stamps'], ['Answer key', 'الأجوبة', 'key'],
  ]
  const at = (kind: string) => book.pageOf(p => p.kind === kind)
  const Ref = ({ items, title, titleAr }: { items: [string, string, string][]; title: string; titleAr: string }) => (
    <div className="rounded-xl px-3 py-2" style={{ background: C.cream }}>
      <div className="mb-1 flex justify-between"><span className="text-[10.5px] font-extrabold uppercase tracking-[0.1em]" style={{ color: C.navy }}>{title}</span><Ar className="text-[11.5px] font-bold" style={{ color: C.navy }}>{titleAr}</Ar></div>
      {items.map(([en, ar, k]) => (
        <div key={k} className="flex items-baseline gap-2 text-[12px] font-bold"><span className="flex-1">{en}</span><Ar as="span" className="text-[11px] font-semibold" style={{ color: C.grey }}>{ar}</Ar><span className="w-[26px] text-right" style={{ color: C.red }}>{at(k)}</span></div>
      ))}
    </div>
  )
  return (
    <div className="flex h-full flex-col gap-3" dir="ltr">
      <div className="grid grid-cols-2 gap-3"><Ref items={front} title="Before you go" titleAr="قبل السفر" /><Ref items={back} title="On the road" titleAr="في الطريق" /></div>
      <div className="grid flex-1 grid-cols-2 gap-x-6">
        {[[1, 2, 3], [4, 5, 6]].map((col, ci) => (
          <div key={ci} className="flex flex-col gap-4">
            {col.map(n => {
              const p = PARTS.find(x => x.n === n)!
              return (
                <div key={n}>
                  <div className="flex items-center gap-2 rounded-lg px-2.5 py-1 text-white" style={{ background: C.red }}>
                    <Ico name={p.icon} size={14} color={C.saff} />
                    <span className="text-[12px] font-extrabold uppercase tracking-[0.08em]">Part {n} · {p.titleEn}</span>
                    <Ar className="ml-auto text-[12.5px] font-bold" style={{ color: C.saff }}>{p.titleAr}</Ar>
                    <span className="w-[24px] text-right text-[11.5px] font-extrabold">{book.partPage(n)}</span>
                  </div>
                  {STOPS.filter(s => s.part === n).map(s => (
                    <div key={s.n} className="flex items-center gap-2 border-b px-1 py-[3px]" style={{ borderColor: C.line }}>
                      <span className="w-[20px] text-[11px] font-extrabold" style={{ color: C.red }}>{PAD(s.n)}</span>
                      <div className="min-w-0 flex-1 leading-tight">
                        <div className="truncate text-[12px] font-bold">{s.titleEn}</div>
                        <Ar className="text-left text-[10.5px] font-semibold" style={{ color: C.grey }}>{s.titleAr}</Ar>
                      </div>
                      <span className="text-[11.5px] font-extrabold">{book.stopPage(s.n)}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function MyTrip() {
  return (
    <div className="space-y-3">
      <Ar className="text-[13px] font-semibold leading-relaxed" style={{ color: C.grey }}>املأ هذه الصفحة بقلم قبل السفر، وصوّرها بهاتفك. إن ضاع هاتفك أو نفدت بطاريته، كل ما تحتاجه هنا.</Ar>
      {MY_TRIP.map(g => (
        <div key={g.en}>
          <Sec icon={g.icon} en={g.en} ar={g.ar} color={C.navy} />
          <div className="mt-1 grid grid-cols-2 gap-x-6" dir="ltr">
            {g.fields.map(([en, ar]) => (
              <div key={en} className="pt-1.5">
                <div className="flex items-baseline justify-between gap-2"><span className="text-[10.5px] font-extrabold uppercase tracking-[0.04em]" style={{ color: C.grey }}>{en}</span><Ar as="span" className="text-[10.5px] font-semibold" style={{ color: C.grey }}>{ar}</Ar></div>
                <div className="mt-8 border-b-[1.5px]" style={{ borderColor: '#9AA1B4' }} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div>
        <Sec icon="ListChecks" en="The night before you leave" ar="الليلة التي قبل السفر" />
        <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2" dir="ltr">
          {CHECKLIST.map(([en, ar]) => (
            <div key={en} className="flex items-center gap-2">
              <span className="h-[16px] w-[16px] shrink-0 rounded border-[1.5px]" style={{ borderColor: C.navy }} />
              <span className="text-[12px] font-bold">{en}</span>
              <Ar as="span" className="ml-auto text-[11px] font-semibold" style={{ color: C.grey }}>{ar}</Ar>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Toolkit1() {
  return (
    <div className="space-y-4">
      <div>
        <Sec icon="Phone" en="Spell it on the phone" ar="تهجَّ اسمك ورقم حجزك" />
        <Ar className="mt-1 text-[12.5px] font-semibold" style={{ color: C.grey }}>في الهاتف والمطار والفندق يتهجّون الحروف بهذه الكلمات: B for Bravo، K for Kilo.</Ar>
        <div className="mt-2 grid grid-cols-7 gap-1.5" dir="ltr">
          {SPELLING.map(([l, w]) => (
            <div key={l} className="flex items-center gap-1.5 rounded-lg px-2 py-1" style={{ border: `1px solid ${C.line}` }}>
              <span className="text-[18px] font-extrabold" style={{ color: C.red }}>{l}</span>
              <span className="text-[11.5px] font-bold">{w}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Sec icon="AudioLines" en="Letters that confuse us" ar="حروف نخلط بينها" color={C.navy} />
        <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1.5" dir="ltr">
          {LETTER_TRAPS.map(([l, sound, tip]) => (
            <div key={l} className="flex items-center gap-3 rounded-lg px-3 py-1.5" style={{ background: C.navyS }}>
              <span className="w-[66px] shrink-0 text-[14px] font-extrabold" style={{ color: C.navy }}>{l}</span>
              <div className="min-w-0 leading-snug">
                <Ar className="text-left text-[13px] font-extrabold">{sound}</Ar>
                <Ar className="text-left text-[11px] font-semibold" style={{ color: C.grey }}>{tip}</Ar>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Sec icon="Hash" en="Say numbers like a traveller" ar="الأرقام كما يقولها المسافرون" />
        <div className="mt-2"><Grid cols="1fr 1.6fr 1.3fr" rows={[['You see', 'You say', 'ملاحظة'], ...SAY_NUMBERS]} size={12} /></div>
      </div>
    </div>
  )
}

function Toolkit2() {
  const Chips = ({ items }: { items: [string, string][] }) => (
    <div className="flex flex-wrap gap-1" dir="ltr">
      {items.map(([en, ar]) => (
        <span key={en} className="flex items-center gap-1.5 rounded-md px-2 py-[2px]" style={{ background: C.cream }}>
          <span className="text-[11.5px] font-bold">{en}</span><Ar as="span" className="text-[10.5px] font-semibold" style={{ color: C.grey }}>{ar}</Ar>
        </span>
      ))}
    </div>
  )
  return (
    <div className="space-y-3">
      <div>
        <Sec icon="Clock" en="Time" ar="الوقت" />
        <div className="mt-1.5"><Grid cols="70px 1.7fr 1.2fr" rows={[['24 h', 'You say', 'بالعربية'], ...TIMES]} size={12} /></div>
        <Ar className="mt-1 text-[11.5px] font-semibold" style={{ color: C.grey }}>am = قبل الظهر · pm = بعد الظهر. الشاشات والتذاكر تستعمل نظام 24 ساعة، وتعطي دائمًا الوقت المحلي (local time).</Ar>
      </div>
      <div>
        <Sec icon="CalendarDays" en="Dates" ar="التاريخ" color={C.navy} />
        <div className="mt-1.5"><Grid cols="1fr 0.9fr 2fr" rows={[['Where', 'Written', 'Said'], ...DATES]} size={12} /></div>
        <div className="mt-1.5 space-y-1"><Chips items={ORDINALS} /><Chips items={MONTHS} /><Chips items={DAYS} /></div>
      </div>
      <div>
        <Sec icon="Coins" en="Money" ar="المال" />
        <div className="mt-1.5 grid grid-cols-[1.4fr_1fr] gap-3" dir="ltr">
          <Grid cols="1.2fr 0.9fr 0.8fr 1.1fr" rows={[['Currency', 'Code', 'Small unit', 'بالعربية'], ...CURRENCIES]} size={11.5} />
          <div className="space-y-1.5" dir="ltr">
            {SAY_PRICES.map(([w, s]) => (
              <div key={w} className="rounded-lg px-3 py-1.5" style={{ background: C.navyS }}>
                <div className="text-[15px] font-extrabold" style={{ color: C.navy }}>{w}</div>
                <div className="text-[11.5px] font-semibold">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Phrases({ groups, extra }: { groups: typeof SURVIVAL; extra?: boolean }) {
  return (
    <div className="space-y-5">
      {groups.map((g, gi) => (
        <div key={g.en}>
          <Sec icon={g.icon} en={g.en} ar={g.ar} color={gi % 2 ? C.navy : C.red} />
          <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1" dir="ltr">
            {g.items.map(([en, ar]) => (
              <div key={en} className="rounded-lg px-3 py-[8px]" style={{ background: gi % 2 ? C.navyS : C.redS }}><EnAr en={en} ar={ar} size={14.5} arSize={12} /></div>
            ))}
          </div>
        </div>
      ))}
      {extra && (
        <Box tint={C.saffS}>
          <div className="flex items-center justify-between" dir="ltr"><span className="text-[13px] font-extrabold" style={{ color: C.saffD }}>THE MAGIC WORDS</span><Ar className="text-[13px] font-extrabold" style={{ color: C.saffD }}>الكلمات السحرية</Ar></div>
          <div className="mt-1.5 grid grid-cols-3 gap-2" dir="ltr">
            {[["Could you…?", 'لتطلب من شخص أن يفعل شيئًا'], ["Can I…?", 'لتطلب الإذن'], ["I'd like…", 'لتطلب شيئًا تريده']].map(([en, ar]) => (
              <div key={en} className="rounded-lg bg-white px-3 py-2"><div className="text-[18px] font-extrabold">{en}</div><Ar className="text-left text-[11.5px] font-semibold" style={{ color: C.grey }}>{ar}</Ar></div>
            ))}
          </div>
          <Ar className="mt-2 text-[12px] font-semibold">أضف please في آخر الجملة، وابدأ بـ Excuse me مع الغرباء: هكذا يسمعك الجميع بلطف.</Ar>
        </Box>
      )}
    </div>
  )
}

/* ── Back matter ────────────────────────────────────────────────────── */

function Dictionary({ themes }: { themes: typeof DICTIONARY }) {
  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <Ar className="text-[13px] font-semibold" style={{ color: C.grey }}>لا تجد الكلمة؟ أشِر إلى الصورة وقل: «Excuse me, I need this, please.» — سيفهمونك.</Ar>
      {themes.map((t, ti) => (
        <div key={t.en}>
          <Sec icon={ti ? 'MapPin' : 'Utensils'} en={t.en} ar={t.ar} color={ti % 2 ? C.navy : C.red} />
          <div className="mt-2 grid grid-cols-5 gap-2" dir="ltr">
            {t.items.map(([icon, en, ar]) => (
              <div key={en} className="flex flex-col items-center rounded-xl px-1.5 pb-2 pt-2.5 text-center" style={{ border: `1px solid ${C.line}` }}>
                <span className="flex h-[44px] w-[44px] items-center justify-center rounded-lg" style={{ background: ti % 2 ? C.navyS : C.redS }}><Ico name={icon} size={25} color={ti % 2 ? C.navy : C.red} /></span>
                <div className="mt-1 text-[12.5px] font-extrabold leading-tight">{en}</div>
                <Ar className="text-[11.5px] font-bold leading-tight" style={{ color: C.grey }}>{ar}</Ar>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Emergency() {
  return (
    <div className="space-y-3.5">
      <div>
        <Sec icon="Phone" en="Emergency numbers" ar="أرقام الطوارئ" />
        <div className="mt-1.5"><Grid cols="1.15fr 1.6fr 1.1fr" rows={[['Where', 'Call', 'ملاحظة'], ...EMERGENCY]} size={12.5} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4" dir="ltr">
        <div>
          <Sec icon="PhoneCall" en="On the phone, say" ar="في الهاتف قل" color={C.navy} />
          <div className="mt-1.5 space-y-1">{EMERGENCY_CALL.map(([en, ar]) => <div key={en} className="rounded-lg px-3 py-1" style={{ background: C.navyS }}><EnAr en={en} ar={ar} size={12.5} /></div>)}</div>
        </div>
        <div>
          <Sec icon="BookUser" en="Lost passport" ar="ضاع جوازي" color={C.navy} />
          <div className="mt-1.5 space-y-1">{LOST_PASSPORT.map(([en, ar], i) => <div key={en} className="flex items-start gap-2 rounded-lg px-3 py-1" style={{ background: C.navyS }}><span className="text-[13px] font-extrabold" style={{ color: C.red }}>{i + 1}</span><EnAr en={en} ar={ar} size={12.5} /></div>)}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3" dir="ltr">
        {[['My embassy / consulate here', 'سفارة بلدي هنا'], ['My travel insurance (24 h)', 'تأميني (24 ساعة)'], ['My bank (lost card)', 'بنكي (بطاقة ضائعة)']].map(([en, ar]) => (
          <div key={en} className="rounded-xl border-2 border-dashed px-3 pb-3 pt-2" style={{ borderColor: C.red }}>
            <div className="flex items-center gap-1.5"><Ico name="Phone" size={13} color={C.red} /><span className="text-[11px] font-extrabold uppercase tracking-[0.04em]">{en}</span></div>
            <Ar className="text-left text-[11.5px] font-bold" style={{ color: C.grey }}>{ar}</Ar>
            <div className="mt-6 border-b-[1.5px]" style={{ borderColor: '#9AA1B4' }} />
          </div>
        ))}
      </div>
      <div>
        <Sec icon="Megaphone" en="Shout it" ar="قلها بصوت عالٍ" />
        <div className="mt-1.5 grid grid-cols-4 gap-2" dir="ltr">
          {EMERGENCY_PHRASES.map(([en, ar]) => (
            <div key={en} className="rounded-xl px-3 py-2 text-white" style={{ background: C.red }}>
              <div className="text-[16px] font-extrabold leading-tight">{en}</div>
              <Ar className="text-left text-[12px] font-bold" style={{ color: C.saff }}>{ar}</Ar>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Conversions() {
  return (
    <div className="space-y-3.5">
      <div>
        <Sec icon="Shirt" en="Clothes & shoe sizes" ar="مقاسات الملابس والأحذية" />
        <Ar className="mt-1 text-[12px] font-semibold" style={{ color: C.grey }}>المقاسات تقريبية وتختلف بين العلامات: جرّب دائمًا قبل الشراء.</Ar>
        <div className="mt-1.5 grid grid-cols-2 gap-3" dir="ltr">
          {SIZES.map(t => (
            <div key={t.en}>
              <div className="mb-1 flex justify-between"><span className="text-[12px] font-extrabold">{t.en}</span><Ar className="text-[11.5px] font-bold" style={{ color: C.grey }}>{t.ar}</Ar></div>
              <Grid cols="1.3fr repeat(5, 1fr)" rows={t.rows} size={12} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <Sec icon="Thermometer" en="Temperature" ar="درجة الحرارة" color={C.navy} />
        <div className="mt-1.5 grid grid-cols-8 gap-1.5" dir="ltr">
          {TEMPERATURES.map(([c, f]) => (
            <div key={c} className="rounded-lg py-1.5 text-center" style={{ background: C.navyS }}>
              <div className="text-[14px] font-extrabold" style={{ color: C.navy }}>{c}</div>
              <div className="text-[12px] font-bold" style={{ color: C.red }}>{f}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Sec icon="Coins" en="My exchange rates" ar="أسعار الصرف قبل سفري" />
        <Ar className="mt-1 text-[12px] font-semibold" style={{ color: C.grey }}>اكتب السعر قبل السفر (من بنكك أو XE Currency)، لتعرف بسرعة كم يساوي الثمن بعملتك.</Ar>
        <div className="mt-1.5 grid grid-cols-4 gap-2" dir="ltr">
          {['1 € =', '1 £ =', '1 $ =', '1 AED / SAR ='].map(c => (
            <div key={c} className="flex items-end gap-2 rounded-xl px-3 py-2.5" style={{ background: C.cream }}>
              <span className="text-[14px] font-extrabold" style={{ color: C.navy }}>{c}</span>
              <span className="mb-[3px] flex-1 border-b-[1.5px]" style={{ borderColor: '#9AA1B4' }} />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[1.2fr_1fr] gap-4" dir="ltr">
        <div>
          <Sec icon="Ruler" en="Measures" ar="القياسات" />
          <div className="mt-1.5 space-y-1">{MEASURES.map(([en, ar]) => <div key={en} className="flex items-center justify-between gap-3 border-b pb-1" style={{ borderColor: C.line }}><span className="text-[12.5px] font-extrabold">{en}</span><Ar className="text-[11.5px] font-semibold" style={{ color: C.grey }}>{ar}</Ar></div>)}</div>
        </div>
        <div>
          <Sec icon="Plug" en="Plugs & voltage" ar="المقابس والتيار" color={C.navy} />
          <div className="mt-1.5"><Grid cols="1.4fr 0.8fr 0.8fr" rows={[['Where', 'Plug', 'Volts'], ...PLUGS]} size={12} /></div>
          <Ar className="mt-1 text-[11px] font-semibold" style={{ color: C.grey }}>شاحن مكتوب عليه 100–240V يعمل في كل مكان مع المحوّل المناسب.</Ar>
        </div>
      </div>
    </div>
  )
}

function Apps() {
  return (
    <div className="flex h-full flex-col gap-2">
      <Ar className="text-[12.5px] font-semibold leading-[1.6]" style={{ color: C.grey }}>حمّل التطبيقات من المتجر الرسمي (App Store أو Google Play) قبل السفر، وجرّبها في البيت. الأسماء للتوضيح فقط، وكل تطبيق قد يغيّر خدماته. الأرقام = المحطات التي تحتاجه فيها.</Ar>
      <div className="grid flex-1 grid-cols-2 gap-x-5" dir="ltr">
        {[APPS_INDEX.slice(0, 4), APPS_INDEX.slice(4)].map((col, ci) => (
          <div key={ci} className="flex flex-col justify-between pb-1">
            {col.map((g, gi) => (
              <div key={g.en}>
                <Sec icon={g.icon} en={g.en} ar={g.ar} color={(ci + gi) % 2 ? C.navy : C.red} />
                <div className="mt-[3px] space-y-[2px]">
                  {g.items.map(([name, ar, stops]) => (
                    <div key={name} className="flex items-center gap-2 rounded-md px-2 py-[0.5px]" style={{ background: C.cream }}>
                      <div className="min-w-0 flex-1 leading-tight">
                        <div className="text-[11.5px] font-extrabold leading-[1.15]">{name}</div>
                        <Ar className="text-left text-[10.5px] font-semibold" style={{ color: C.grey }}>{ar}</Ar>
                      </div>
                      <div className="flex shrink-0 flex-wrap justify-end gap-[2px]" style={{ maxWidth: 92 }}>
                        {stops.map(n => <span key={n} className="flex h-[15px] min-w-[19px] items-center justify-center rounded-full text-[8.5px] font-extrabold text-white" style={{ background: C.navy }}>{PAD(n)}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Stamps() {
  return (
    <div className="flex h-full flex-col gap-3">
      <Ar className="text-[13px] font-semibold" style={{ color: C.grey }}>بعد كل محطة: اقرأها، تدرّب عليها مع زميل، ثم ضع ختمك (علامة أو توقيع) وتاريخ اليوم.</Ar>
      <div className="grid flex-1 grid-cols-6 gap-2.5" dir="ltr">
        {STOPS.map(s => (
          <div key={s.n} className="flex flex-col items-center justify-center rounded-full border-[2px] border-dashed text-center" style={{ borderColor: s.part % 2 ? C.red : C.navy, aspectRatio: '1' }}>
            <span className="text-[9px] font-extrabold tracking-[0.15em]" style={{ color: C.grey }}>STOP</span>
            <span className="text-[22px] font-extrabold leading-none" style={{ color: s.part % 2 ? C.red : C.navy }}>{PAD(s.n)}</span>
            <span className="mt-0.5 px-2 text-[8.5px] font-bold leading-tight">{s.titleEn}</span>
          </div>
        ))}
      </div>
      <div className="rounded-2xl px-6 py-4 text-white" style={{ background: C.navy }}>
        <div className="flex items-center justify-between" dir="ltr">
          <div><div className="text-[11px] font-extrabold tracking-[0.2em]" style={{ color: C.saff }}>VISA APPROVED</div><div className="text-[20px] font-extrabold">I finished my journey in English!</div></div>
          <Ar className="text-[20px] font-extrabold" style={{ color: C.saff }}>أنهيت رحلتي بالإنجليزية!</Ar>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-8" dir="ltr">
          {['Name · الاسم', 'Date · التاريخ'].map(l => <div key={l}><div className="text-[10.5px] font-bold opacity-80">{l}</div><div className="mt-5 border-b-[1.5px] border-white/60" /></div>)}
        </div>
      </div>
    </div>
  )
}

function Key({ stops }: { stops: number[] }) {
  return (
    <div className="columns-2 gap-6" dir="ltr">
      {stops.map(n => {
        const s = STOPS.find(x => x.n === n)!
        return (
          <div key={n} className="mb-2.5 break-inside-avoid">
            <div className="flex items-baseline gap-2 border-b pb-0.5" style={{ borderColor: C.line }}>
              <span className="text-[12px] font-extrabold" style={{ color: C.red }}>STOP {PAD(n)}</span>
              <span className="truncate text-[11.5px] font-bold">{s.titleEn}</span>
            </div>
            {stopAnswers(s).map(({ letter, answers }) => (
              <div key={letter} className="mt-0.5 flex gap-1.5 text-[10.5px] leading-snug">
                <span className="font-extrabold" style={{ color: C.navy }}>{letter}</span>
                <span className="font-semibold">{answers.join(' · ')}</span>
              </div>
            ))}
          </div>
        )
      })}
      <div className="break-inside-avoid text-[10px] font-semibold" style={{ color: C.grey }}>C = model answers: other correct sentences are fine. · <bdi dir="rtl" style={{ fontFamily: 'inherit' }}>أجوبة C نماذج: الجمل الصحيحة الأخرى مقبولة.</bdi></div>
    </div>
  )
}

const BODY: Record<string, (page: MatterKind, book: Book) => ReactNode> = {
  welcome: () => <Welcome />,
  contents: (_, book) => <Contents book={book} />,
  mytrip: () => <MyTrip />,
  'toolkit-1': () => <Toolkit1 />,
  'toolkit-2': () => <Toolkit2 />,
  'phrases-1': () => <Phrases groups={SURVIVAL.slice(0, 3)} />,
  'phrases-2': () => <Phrases groups={SURVIVAL.slice(3)} extra />,
  'dictionary-1': () => <Dictionary themes={DICTIONARY.slice(0, 2)} />,
  'dictionary-2': () => <Dictionary themes={DICTIONARY.slice(2)} />,
  emergency: () => <Emergency />,
  conversions: () => <Conversions />,
  apps: () => <Apps />,
  stamps: () => <Stamps />,
  key: page => ('stops' in page ? <Key stops={page.stops} /> : null),
}


