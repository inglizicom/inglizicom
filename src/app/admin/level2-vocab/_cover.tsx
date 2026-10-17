'use client'

/* eslint-disable @next/next/no-img-element */
import { Ar, C, Sheet } from '../level2-book/_kit'

/**
 * The front cover of Words & Conversations: the series' VIIZA vocabulary
 * cover (word cards, the plane, «مزيان» stamp), its bottom band redrawn
 * with the book's new name. The print JPG public/covers/viiza/vocab-front.jpg
 * is rendered from this sheet, so it starts from a copy of the original art.
 */

/** The band's yellow and top edge, measured on the original art (CSS px of the A4 sheet). */
const BAND = { color: '#F2B200', top: 935 }

export function TalkFrontCover({ filename }: { filename: string }) {
  return (
    <Sheet label="الغلاف الأمامي" filename={filename}>
      <img src="/covers/viiza/vocab-front-art.jpg" alt="VIIZA ENGLISH Words & Conversations cover" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col justify-center px-12" style={{ top: BAND.top, background: BAND.color, color: C.navy }} dir="ltr">
        <div className="flex items-end justify-between gap-4">
          <div className="leading-[0.95]">
            <div className="text-[30px] font-extrabold tracking-[-0.01em]">WORDS &amp;</div>
            <div className="text-[40px] font-extrabold tracking-[-0.02em]">CONVERSATIONS</div>
          </div>
          <Ar className="pb-1 text-[38px] font-extrabold leading-tight">الكلمات والمحادثات</Ar>
        </div>
        <div className="mt-3 h-[2px]" style={{ background: C.navy }} />
        <div className="mt-2.5 flex items-center justify-between text-[13px] font-bold">
          <span>Hamza El Qasraoui · Level 3 · A2 → B1 · 136 conversations and audio</span>
          <Ar as="span" className="text-[14px] font-bold">حمزة القصراوي · المستوى الثالث</Ar>
        </div>
      </div>
    </Sheet>
  )
}
