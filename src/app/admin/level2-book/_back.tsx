'use client'

import { BookA, BookOpen, Layers, PenLine, type LucideIcon } from 'lucide-react'
import { PLAY } from '@/components/QrLink'
import { Ar, C, Qr, Sheet } from './_kit'

/**
 * The back cover of VIIZA ENGLISH, the travel guide: the series' back-cover
 * layout (red band, cream page, the three papers, the pack), with the
 * travel guide's own promise. The print JPG in public/covers/viiza is
 * rendered from this sheet, so the covers page and the book agree.
 */

const CAN: [string, string][] = [
  ['I can get my visa and book my trip.', 'أحصل على التأشيرة وأحجز رحلتي'],
  ['I can get through the airport calmly.', 'أمرّ من المطار بلا توتّر'],
  ['I can answer the border officer.', 'أجيب ضابط الحدود بثقة'],
  ['I can check in, eat out and shop.', 'أسكن وآكل وأتسوّق بسهولة'],
  ['I can find my way and make friends.', 'أجد طريقي وأتعرّف على الناس'],
  ['I can handle problems and emergencies.', 'أتصرّف في المشاكل والطوارئ'],
]

const SERIES: { level: number; cefr: string; name: string; ar: string; tagEn: string; tagAr: string; on?: boolean }[] = [
  { level: 1, cefr: 'A0 → A1', name: 'LA KAART', ar: 'لاكارط إنگليش', tagEn: 'Who you are', tagAr: 'شكون نتا' },
  { level: 2, cefr: 'A1 → A2', name: 'PIIRMI', ar: 'بيرمي إنگليش', tagEn: 'Get around', tagAr: 'تحرّك بلا خوف' },
  { level: 3, cefr: 'A2 → B1', name: 'VIIZA', ar: 'فيزا إنگليش', tagEn: 'Travel the world', tagAr: 'سافر بثقة', on: true },
]

const PACK: [LucideIcon, string, string, boolean][] = [
  [BookOpen, "Student's Book", 'كتاب الطالب', true], [PenLine, 'Workbook', 'كتاب التمارين', false],
  [BookA, 'Vocabulary', 'كتاب المفردات', false], [Layers, 'Play Cards', 'بطاقات اللعب', false],
]

const CREAM = '#FDF3E1'

export function ViizaBackCover({ filename }: { filename: string }) {
  return (
    <Sheet label="الغلاف الخلفي" filename={filename} bg={CREAM}>
      <div className="absolute inset-0 flex flex-col" dir="ltr">
        {/* The red band */}
        <div className="px-12 pb-8 pt-12 text-white" style={{ background: C.red }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[64px] font-extrabold leading-[0.85] tracking-[-0.03em]" style={{ color: C.saff }}>VIIZA</div>
              <div className="mt-3 text-[17px] font-extrabold tracking-[0.5em]">ENGLISH</div>
            </div>
            <div className="text-right">
              <Ar className="text-[46px] font-extrabold leading-none">فيزا إنگليش</Ar>
              <div className="mt-3 text-[12px] font-extrabold tracking-[0.14em]" style={{ color: C.saff }}>STUDENT'S BOOK · THE TRAVEL GUIDE · A2 → B1</div>
            </div>
          </div>
          <div className="mt-6 h-[3px]" style={{ background: C.saff }} />
          <Ar className="mt-5 text-[17px] font-bold leading-[1.75]">دليلك الكامل للسفر بالإنجليزية: من استمارة التأشيرة وحجز الطيران، إلى المطار والطائرة والفندق والمطعم والشارع، حتى العودة إلى بيتك. 34 محطة فيها ما تقوله وما ستسمعه، وشاشات حقيقية مشروحة، وبطاقات نجاة، وصوت لكل محطة بمسح الرمز.</Ar>
          <div className="mt-3 text-[13.5px] font-semibold leading-[1.6] opacity-95">Your complete travel companion in English: from the visa form and the flight booking to the airport, the plane, the hotel, the restaurant and the street, and all the way home. 34 stops, with audio for every stop.</div>
        </div>

        {/* The cream page */}
        <div className="flex flex-1 flex-col px-12 pb-9 pt-7" style={{ color: C.navy }}>
          <div className="flex items-baseline justify-between">
            <span className="text-[25px] font-extrabold">With this visa, you can…</span>
            <Ar className="text-[25px] font-extrabold" style={{ color: C.red }}>بهاد الفيزا، تقدر…</Ar>
          </div>
          <div className="mt-2 h-[2px]" style={{ background: C.navy }} />
          <div className="grid grid-cols-2 gap-x-8">
            {CAN.map(([en, ar], i) => (
              <div key={en} className="flex items-center gap-3 border-b py-[9px]" style={{ borderColor: '#E3D6BD' }}>
                <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold" style={{ background: C.saff }}>{String(i + 1).padStart(2, '0')}</span>
                <div className="leading-snug">
                  <div className="text-[13.5px] font-extrabold">{en}</div>
                  <Ar className="text-left text-[13px] font-bold" style={{ color: '#3A4060' }}>{ar}</Ar>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-baseline justify-between">
            <span className="text-[25px] font-extrabold">One series, three papers</span>
            <Ar className="text-[25px] font-extrabold" style={{ color: C.red }}>سلسلة واحدة، ثلاث وثائق</Ar>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-4">
            {SERIES.map(s => (
              <div key={s.name} className="rounded-2xl px-4 py-3" style={s.on ? { background: C.red, color: '#fff' } : { border: `2px solid ${C.navy}` }}>
                <div className="flex justify-between text-[10.5px] font-extrabold tracking-[0.14em]" style={s.on ? { color: C.saff } : undefined}><span>LEVEL {s.level}</span><span>{s.cefr}</span></div>
                <div className="mt-1 text-[27px] font-extrabold leading-none" style={s.on ? { color: C.saff } : undefined}>{s.name}</div>
                <div className="mt-1 text-[9.5px] font-extrabold tracking-[0.35em]">ENGLISH</div>
                <Ar className="mt-1.5 text-right text-[16px] font-extrabold">{s.ar}</Ar>
                <div className="mt-2 flex justify-between border-t pt-1.5 text-[11.5px] font-bold" style={{ borderColor: s.on ? 'rgba(255,255,255,0.4)' : '#C9C3B4' }}>
                  <span>{s.tagEn}</span><Ar as="span">{s.tagAr}</Ar>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3 border-y py-2.5" style={{ borderColor: C.navy }}>
            <span className="w-[70px] text-[11px] font-extrabold tracking-[0.16em]">THE PACK</span>
            {PACK.map(([Icon, en, ar, on]) => (
              <div key={en} className="flex flex-1 items-center gap-2 rounded-xl px-3 py-1.5" style={on ? { background: C.red, color: '#fff' } : undefined}>
                <Icon size={20} />
                <div className="whitespace-nowrap leading-tight"><div className="text-[12px] font-extrabold">{en}</div><Ar className="text-left text-[11.5px] font-bold">{ar}</Ar></div>
              </div>
            ))}
          </div>

          <div className="mt-auto flex items-end justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-xl border-2 p-1" style={{ borderColor: C.navy }}><Qr url={PLAY.library} size={62} /></span>
              <div className="leading-snug">
                <div className="text-[14px] font-extrabold">Scan and listen</div>
                <Ar className="text-left text-[13px] font-bold">امسح الرمز واستمع</Ar>
                <div className="text-[11.5px] font-bold underline">inglizi.com/audio</div>
              </div>
            </div>
            <div className="text-center leading-snug">
              <div className="text-[22px] font-extrabold">Inglizi<span style={{ color: C.red }}>.com</span></div>
              <div className="text-[11.5px] font-bold">Hamza El Qasraoui · <bdi dir="rtl">حمزة القصراوي</bdi></div>
              <div className="text-[11.5px] font-extrabold">WhatsApp +212 707 902 091</div>
            </div>
            <div className="flex h-[78px] w-[148px] flex-col items-center justify-center rounded-xl border-2 border-dashed text-center" style={{ borderColor: C.navy }}>
              <span className="text-[11px] font-extrabold tracking-[0.2em]">ISBN</span>
              <Ar className="text-[11px] font-bold">[مكان الباركود]</Ar>
            </div>
          </div>
        </div>
      </div>
    </Sheet>
  )
}
