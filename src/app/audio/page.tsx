import { AudioShell, ShelfGrid } from './_shell'

/** /audio — the library of Level 1: four shelves (course book, workbook, vocabulary book, play cards), each a folder of nineteen lessons. */
export default function AudioHome() {
  return (
    <AudioShell crumbs={['Level 1 · A0 → A1', 'Library']} title="Play & Speak English · Level 1">
      <p className="font-arabic -mt-2 text-[15px] text-[#5B6474]" dir="rtl">اختر الكتاب، ثم الدرس، ثم استمع: ببطء للتعلّم، بالسرعة العادية، أو بسرعة.</p>
      <ShelfGrid />
    </AudioShell>
  )
}
