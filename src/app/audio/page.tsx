import { AudioShell, LEVELS, ShelfGrid } from './_shell'

/** /audio — the library: each level's shelves (course book, workbook, vocabulary book, play cards), each a folder of its lessons. */
export default function AudioHome() {
  return (
    <AudioShell crumbs={['Library']} title="Inglizi.com · Audio library">
      <p className="font-arabic -mt-2 text-[15px] text-[#5B6474]" dir="rtl">اختر الكتاب، ثم الدرس، ثم استمع: ببطء للتعلّم، بالسرعة العادية، أو بسرعة.</p>
      {LEVELS.map(level => (
        <section key={level.name} className="flex flex-col gap-2">
          <h2 className="text-[17px] font-bold text-[#14306B]" dir="ltr">{level.name}</h2>
          <ShelfGrid level={level} />
        </section>
      ))}
    </AudioShell>
  )
}
