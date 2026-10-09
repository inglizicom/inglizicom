'use client'

import { Check, Globe, Languages, MessageCircle, PenLine, Phone, Users } from 'lucide-react'
import type { EverydayUnit } from '@/data/everyday-book'
import { AR, CodeSlot, Frame, HEAD, type BookInfo } from '../level1-book/_blocks'
import { DISPLAY, EN_FONT } from './_fonts'

/**
 * The book's selling pages, in its own frame and colours: «لماذا هذا الكتاب؟»
 * right after the cover (what's inside, in numbers and situations — the page
 * a buyer sees first in a preview), the certificate the reader fills in after
 * the last unit, and «خطوتك التالية» before the back cover (what the reader
 * can now do, and the next books and classes). The selling pages carry the
 * WhatsApp number and the QR slot. Also the copyright notice for the
 * thank-you page. Plain <p>/<div> only: the CRM's global heading colours
 * would repaint <h1>–<h3>.
 */

const GOLD = { m: '#E0A100', s: '#FFF6DB' }
const intl = (phone: string) => (phone.startsWith('0') ? `+212 ${phone.slice(1, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}` : phone)

export interface BookStats { units: number; words: number; expressions: number; lines: number }

function Contact({ info }: { info: BookInfo }) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-[var(--k)] text-white px-10 py-5 flex items-center gap-6" dir="rtl">
      <div className="flex-1">
        <p className="text-[20px] leading-tight" style={DISPLAY}>للطلب والاستفسار، راسلنا الآن</p>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[14px] font-bold" dir="ltr">
          <span className="flex items-center gap-1.5"><Phone size={15} className="text-[var(--m)]" /> {intl(info.phone)}</span>
          <span className="flex items-center gap-1.5"><Globe size={15} className="text-[var(--m)]" /> {info.website}</span>
        </div>
      </div>
      <CodeSlot info={info} size={84} />
    </div>
  )
}

export function ValuePage({ info, stats, units, filename }: { info: BookInfo; stats: BookStats; units: EverydayUnit[]; filename: string }) {
  const tiles: [string, string, string][] = [
    [String(stats.units), 'موقفًا', 'Situations'],
    [`${Math.floor(stats.words / 10) * 10}+`, 'كلمة', 'Words'],
    [`${Math.floor(stats.expressions / 10) * 10}+`, 'عبارة', 'Expressions'],
    [String(stats.units), 'محادثة كاملة', 'Conversations'],
    [String(stats.units), 'نصّ قراءة', 'Readings'],
  ]
  const why: [typeof MessageCircle, string, string][] = [
    [MessageCircle, 'إنجليزية حقيقية', 'جُمل يستعملها الناس فعلًا في المقهى والسوق والفندق والبنك.'],
    [Languages, 'كل شيء مترجم', 'كل كلمة وكل عبارة مع ترجمتها العربية، فلا تضيع أبدًا.'],
    [Users, 'محادثات تتدرّب عليها', 'اقرأ كل محادثة مع صديق، تبادلا الأدوار، ثم تكلّم دون قراءة.'],
    [PenLine, 'اجعلها خاصة بك', 'في آخر كل وحدة مهام لتتكلّم وتكتب عن حياتك أنت.'],
  ]
  return (
    <Frame info={info} label="لماذا هذا الكتاب؟" filename={filename} colour={GOLD}>
      <div className="absolute inset-0" style={{ fontFamily: AR }}>
        <div className="relative px-10 pt-8 pb-14 bg-[var(--k)] text-white overflow-hidden" dir="rtl">
          <div className="absolute -left-20 -top-24 w-72 h-72 rounded-full bg-[var(--m)] opacity-20" />
          <div className="absolute left-24 bottom-[-60px] w-40 h-40 rounded-full border-[18px] border-white/5" />
          <p dir="ltr" className="text-right text-[11.5px] font-extrabold tracking-[0.28em] text-[var(--m)]" style={{ fontFamily: HEAD }}>ENGLISH FOR EVERYDAY SITUATIONS · A1 → A2</p>
          <p className="mt-3 text-[40px] leading-[1.2]" style={DISPLAY}>تكلّم الإنجليزية في حياتك اليومية… <span className="text-[var(--m)]">بثقة</span></p>
          <p className="mt-2 max-w-[640px] text-[16px] font-bold leading-relaxed text-white/80">{stats.units} موقفًا من الصباح إلى المساء، وفي كل موقف: ماذا تقول، كيف تردّ، وكيف تبدو المحادثة الحقيقية.</p>
        </div>

        <div className="relative -mt-9 px-8 grid grid-cols-5 gap-2.5" dir="rtl">
          {tiles.map(([n, ar, en]) => (
            <div key={en} className="rounded-2xl bg-white shadow-[0_8px_24px_rgba(42,29,18,0.14)] border border-[var(--s)] py-3 text-center">
              <p className="text-[28px] font-extrabold leading-none text-[var(--k)]" style={{ fontFamily: HEAD }} dir="ltr">{n}</p>
              <p className="mt-1 text-[13.5px] font-bold">{ar}</p>
              <p className="text-[9.5px] font-extrabold tracking-[0.18em] uppercase text-[var(--m)]" dir="ltr">{en}</p>
            </div>
          ))}
        </div>

        <div className="px-10 mt-5" dir="rtl">
          <p className="text-[19px] text-[var(--k)]" style={DISPLAY}>المواقف التي ستتقنها</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {units.map(u => (
              <div key={u.n} className="flex items-center gap-2 rounded-xl bg-[var(--s)] px-2.5 py-1.5">
                <span className="text-[20px] leading-none">{u.icons[0]}</span>
                <div className="min-w-0 leading-tight">
                  <p className="text-[13px] font-bold">{u.titleAr}</p>
                  <p className="text-[9.5px] font-bold text-[#8a7560]" dir="ltr" style={{ textAlign: 'right' }}>{u.titleEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-10 mt-5" dir="rtl">
          <p className="text-[19px] text-[var(--k)]" style={DISPLAY}>لماذا هذا الكتاب مختلف؟</p>
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            {why.map(([Icon, title, text]) => (
              <div key={title} className="flex gap-3 rounded-2xl border-[1.5px] border-[var(--s)] px-3.5 py-2.5">
                <span className="w-10 h-10 shrink-0 rounded-xl bg-[var(--m)] text-white flex items-center justify-center"><Icon size={20} /></span>
                <div>
                  <p className="text-[15.5px] font-extrabold text-[var(--k)]">{title}</p>
                  <p className="text-[13px] font-bold leading-snug text-[#6b5a48]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Contact info={info} />
      </div>
    </Frame>
  )
}

/** The copyright notice, at the foot of the thank-you page; names the buyer of a personal copy. */
export function Imprint({ info }: { info: BookInfo }) {
  const name = info.buyer.trim()
  return (
    <div className="rounded-xl border-[1.5px] border-[var(--s)] bg-white/95 px-4 py-2.5 text-center" dir="rtl" style={{ fontFamily: AR }}>
      <p className="text-[13px] font-extrabold">
        <bdi dir="ltr">© {new Date().getFullYear()} {info.teacher} · Inglizi.com</bdi> — جميع الحقوق محفوظة
      </p>
      <p className="mt-0.5 text-[11.5px] font-bold leading-snug text-[#526079]">لا يجوز نسخ هذا الكتاب أو تصويره أو مشاركته أو بيعه، كليًا أو جزئيًا، دون إذن كتابي من المؤلف.</p>
      {name && <p className="mt-1 text-[12.5px] font-extrabold text-[var(--m)]">نسخة مرخّصة لـ: {name} — للاستعمال الشخصي فقط.</p>}
      <p dir="ltr" className="mt-0.5 text-[10px] font-semibold text-[#64748B]" style={{ fontFamily: 'var(--en)' }}>
        All rights reserved. No part of this book may be copied, shared or sold without the author&apos;s written permission.
      </p>
    </div>
  )
}

/** The certificate of completion, for the reader to fill in (a buyer's copy comes with their name). */
export function CertificatePage({ info, stats, filename }: { info: BookInfo; stats: BookStats; filename: string }) {
  const name = info.buyer.trim()
  const corner = 'absolute w-[18px] h-[18px] rotate-45 bg-[var(--m)]'
  const level = info.level.replace(/^level\s*/i, '')
  return (
    <Frame info={info} label="شهادة الإتمام" filename={filename} colour={GOLD}>
      <div className="absolute inset-0 bg-[#FFFCF3]" style={{ fontFamily: AR }} dir="ltr">
        <div className="absolute inset-[22px] border-[3px] border-[var(--m)] rounded-[6px]" />
        <div className="absolute inset-[32px] border border-[var(--m)] rounded-[3px] opacity-60" />
        <span className={`${corner} left-[13px] top-[13px]`} /><span className={`${corner} right-[13px] top-[13px]`} />
        <span className={`${corner} left-[13px] bottom-[13px]`} /><span className={`${corner} right-[13px] bottom-[13px]`} />
        <div className="absolute left-1/2 top-[290px] -translate-x-1/2 w-[560px] h-[560px] rounded-full border-[46px] border-[var(--m)] opacity-[0.05]" />

        <div className="absolute inset-x-[70px] top-[76px] bottom-[84px] flex flex-col items-center justify-between text-center">
          <div className="flex flex-col items-center">
            <p className="text-[26px] font-extrabold text-[var(--k)]" style={{ fontFamily: EN_FONT }}>Inglizi<span className="text-[var(--m)]">.com</span></p>
            <p className="mt-7 text-[60px] font-extrabold leading-none tracking-[0.14em] text-[var(--k)]" style={{ fontFamily: EN_FONT }}>CERTIFICATE</p>
            <p className="mt-2 text-[16px] font-bold tracking-[0.5em] text-[var(--m)]" style={{ fontFamily: EN_FONT }}>OF COMPLETION</p>
            <p className="mt-3 text-[40px] leading-tight text-[var(--k)]" style={DISPLAY} dir="rtl">شهادة إتمام</p>
            <div className="mt-3 flex items-center gap-3 w-[360px]">
              <span className="flex-1 h-[2px] bg-[var(--m)]" /><span className="text-[var(--m)] text-[18px]">★</span><span className="flex-1 h-[2px] bg-[var(--m)]" />
            </div>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-[16px] font-bold text-[#6b5a48]" style={{ fontFamily: EN_FONT }}>This is to certify that · <span style={{ fontFamily: AR }}>نشهد بأنّ</span></p>
            <div className="mt-2 w-[520px] h-[82px] border-b-2 border-dotted border-[var(--k)] flex items-end justify-center pb-1">
              {name && <span className="text-[46px] font-bold leading-none whitespace-nowrap text-[var(--k)]" style={{ fontFamily: /[؀-ۿ]/.test(name) ? AR : EN_FONT }}>{name}</span>}
            </div>
            <p className="mt-7 text-[16px] font-bold text-[#6b5a48]" style={{ fontFamily: EN_FONT }}>has successfully completed the course book</p>
            <p className="mt-1 text-[28px] font-extrabold text-[var(--k)]" style={{ fontFamily: EN_FONT }}>English for Everyday Situations</p>
            <p className="text-[18px] font-bold text-[#6b5a48]" dir="rtl">{name ? (info.buyerFemale ? 'قد أتمّت' : 'قد أتمّ') : 'قد أتمّ (ت)'} بنجاح كتاب «{info.title}»</p>
            <p className="mt-3 rounded-full bg-[var(--s)] px-5 py-1 text-[13.5px] font-extrabold text-[var(--k)]" style={{ fontFamily: EN_FONT }}>
              Level {level} · {stats.units} situations · {Math.floor(stats.words / 10) * 10}+ words · {Math.floor(stats.expressions / 10) * 10}+ expressions
            </p>
          </div>

          <div className="w-full">
            <div className="grid grid-cols-3 items-end">
              <div className="text-center">
                <div className="h-[48px] border-b-2 border-[var(--k)] mx-4" />
                <p className="mt-1.5 text-[13px] font-extrabold" style={{ fontFamily: EN_FONT }}>Date · <span style={{ fontFamily: AR }}>التاريخ</span></p>
              </div>
              <div className="flex justify-center">
                <div className="relative w-[136px] h-[136px] rounded-full bg-[var(--m)] text-white flex flex-col items-center justify-center shadow-[0_6px_18px_rgba(160,110,0,0.35)]">
                  <div className="absolute inset-[7px] rounded-full border-2 border-dashed border-white/70" />
                  <span className="text-[13px] tracking-[0.3em]">★★★</span>
                  <span className="text-[20px] font-extrabold leading-tight" style={{ fontFamily: EN_FONT }}>{level}</span>
                  <span className="text-[14px] font-extrabold" style={{ fontFamily: AR }}>تمّ بنجاح</span>
                </div>
              </div>
              <div className="text-center">
                <div className="h-[48px] border-b-2 border-[var(--k)] mx-4 flex items-end justify-center">
                  <span className="text-[19px] font-semibold leading-none whitespace-nowrap text-[var(--k)]" style={{ fontFamily: EN_FONT }}>{info.teacher}</span>
                </div>
                <p className="mt-1.5 text-[13px] font-extrabold" style={{ fontFamily: EN_FONT }}>Teacher · <span style={{ fontFamily: AR }}>الأستاذ {info.teacherAr}</span></p>
              </div>
            </div>
            <p className="mt-6 text-[12px] font-bold tracking-[0.2em] uppercase text-[var(--m)]" style={{ fontFamily: EN_FONT }}>
              Awarded by Inglizi International Academy ·<span className="tracking-normal" style={{ fontFamily: AR }}>أكاديمية إنجليزي الدولية</span>
            </p>
          </div>
        </div>
      </div>
    </Frame>
  )
}

const CAN_DO = [
  'أطلب في المقهى والمطعم بثقة.',
  'أتسوّق من السوبرماركت والمخبزة والسوق.',
  'أشرح ما أشعر به للطبيب والصيدلي.',
  'أستقلّ سيارة الأجرة والحافلة والقطار.',
  'أسأل عن الطريق وأفهم الجواب.',
  'أسجّل الدخول في الفندق وأحلّ مشكلة.',
  'أسحب المال وأحوّله في البنك.',
  'أتّصل وأراسل وأغيّر المواعيد.',
]

const NEXT: [string, string, string, string][] = [
  ['📒', 'دفتر التمارين', 'Workbook', 'تمارين ممتعة لكل وحدة: صِل، أكمل، رتّب، ترجم… لتثبيت ما تعلّمته.'],
  ['📗', 'كتاب المفردات', 'Vocabulary book', 'كلمات وعبارات ومحادثات إضافية لكل موقف، مع أمثلة مترجمة.'],
  ['🎓', 'الحصص المباشرة', 'Live classes', 'تكلّم مع أستاذ ومجموعة، وطبّق كل موقف في محادثات حقيقية.'],
]

export function NextStepPage({ info, filename }: { info: BookInfo; filename: string }) {
  return (
    <Frame info={info} label="خطوتك التالية" filename={filename} colour={GOLD}>
      <div className="absolute inset-0" style={{ fontFamily: AR }} dir="rtl">
        <div className="px-10 pt-14 text-center">
          <p className="text-[64px] leading-none">🎉</p>
          <p className="mt-4 text-[44px] leading-tight text-[var(--k)]" style={DISPLAY}>أحسنت! لقد أنهيت الكتاب</p>
          <p dir="ltr" className="mt-1 text-[16px] font-bold text-[var(--m)]" style={{ fontFamily: HEAD }}>Well done! You've finished all the situations.</p>
        </div>

        <div className="mx-10 mt-8 rounded-3xl bg-[var(--s)] px-7 py-6">
          <p className="text-[21px] text-[var(--k)]" style={DISPLAY}>الآن أستطيع أن…</p>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
            {CAN_DO.map(t => (
              <p key={t} className="flex items-center gap-2.5 text-[15.5px] font-bold">
                <span className="w-7 h-7 shrink-0 rounded-full bg-[var(--m)] text-white flex items-center justify-center"><Check size={16} strokeWidth={3} /></span>{t}
              </p>
            ))}
          </div>
        </div>

        <div className="px-10 mt-8">
          <p className="text-[21px] text-[var(--k)]" style={DISPLAY}>خطوتك التالية</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {NEXT.map(([icon, ar, en, text]) => (
              <div key={en} className="rounded-2xl border-[1.5px] border-[var(--s)] shadow-[0_4px_14px_rgba(42,29,18,0.08)] px-4 py-5 text-center">
                <p className="text-[48px] leading-none">{icon}</p>
                <p className="mt-2.5 text-[18px] font-extrabold text-[var(--k)]">{ar}</p>
                <p dir="ltr" className="text-[10.5px] font-extrabold tracking-[0.18em] uppercase text-[var(--m)]">{en}</p>
                <p className="mt-2 text-[13.5px] font-bold leading-snug text-[#6b5a48]">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-10 mt-7 rounded-2xl border-2 border-dashed border-[var(--m)] px-6 py-4 flex items-center gap-4">
          <span className="text-[36px] leading-none">💡</span>
          <p className="text-[15.5px] font-bold leading-relaxed text-[var(--k)]">تذكّر: عشر دقائق من الكلام كل يوم أفضل من ساعتين مرة في الأسبوع. ارجع إلى المحادثات، وتكلّم بها مع أصدقائك.</p>
        </div>

        <Contact info={info} />
      </div>
    </Frame>
  )
}
