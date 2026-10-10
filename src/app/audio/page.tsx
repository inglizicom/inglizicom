import { PlayShell, ShelfMenu } from './_shell'

/** /audio — the playlist of Level 1: the three shelves (course book, workbook, play cards), each a drop-down of the nineteen lessons. */
export default function PlayIndex() {
  return (
    <PlayShell title="Play & Speak English · Level 1" sub="A0 → A1 · Audio · الصوت">
      <p className="font-arabic -mt-2 text-[15px] text-[#5B6474]" dir="rtl">اختر الكتاب، ثم الدرس، ثم استمع: ببطء للتعلّم، أو بالسرعة العادية.</p>
      <ShelfMenu />
    </PlayShell>
  )
}
