import Link from 'next/link'
import { CARD_LESSONS } from '@/data/level1-cards'

/** /play — the nineteen lessons of Level 1, each opening its cards and the book's audio. */

const pad = (n: number) => String(n).padStart(2, '0')

export default function PlayIndex() {
  return (
    <>
      <header className="bg-[#14306B] text-white">
        <div className="mx-auto max-w-[680px] px-4 py-6" dir="ltr">
          <div className="text-[15px] font-bold">Inglizi<span className="text-[#D9AA52]">.com</span> · Level 1 · A0 → A1</div>
          <h1 className="mt-2 text-[26px] font-bold leading-tight">Play &amp; Speak English</h1>
          <p className="font-arabic mt-1 text-[16px] text-[#D9AA52]" dir="rtl">العب وتكلّم الإنجليزية: استمع إلى كل بطاقة وكل درس</p>
        </div>
      </header>
      <main className="mx-auto max-w-[680px] px-4 py-5 grid gap-2 sm:grid-cols-2">
        {CARD_LESSONS.map(l => (
          <Link key={l.n} href={`/play/L${pad(l.n)}`} className="flex items-center gap-3 rounded-2xl border border-[#D6DCE8] bg-white px-3 py-2.5 hover:border-[#B8862F]" dir="ltr">
            <span className="shrink-0 rounded-lg bg-[#14306B] px-2 py-1 text-[13px] font-bold text-white">L{pad(l.n)}</span>
            <span className="min-w-0 leading-tight">
              <span className="block text-[14.5px] font-semibold text-[#14306B]">{l.titleEn}</span>
              <span className="font-arabic block text-[12.5px] text-[#5B6474]" dir="rtl" style={{ textAlign: 'left' }}>{l.titleAr}</span>
            </span>
          </Link>
        ))}
      </main>
    </>
  )
}
