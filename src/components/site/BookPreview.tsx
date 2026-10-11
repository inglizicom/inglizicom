'use client'

import { useState } from 'react'
import { BookOpen, Check, Headphones, MessageCircle, PenLine } from 'lucide-react'
import FlipBook from './FlipBook'
import { CTA_GOLD } from './kit'

/**
 * The «look inside» of the three levels: pick a level (LA KAART, PIIRMI,
 * VIIZA ENGLISH) and its student's book or workbook, then leaf through its
 * cover and first pages (captured from the print files into
 * public/preview/<id>/00–14.jpg). The last leaf, and the card beside the
 * book, send the reader to order on WhatsApp. A sales page will come later.
 */

/** Inside pages captured per book (public/preview/<id>/01…), after the cover (00). */
const PAGES: Record<string, number> = { 'piirmi-workbook': 12 }
const WHATSAPP = '212707902091'

type Kind = 'book' | 'workbook'
const LEVELS = [
  {
    id: 'lakaart', name: 'LA KAART ENGLISH', ar: 'لاكارط إنگليش', level: 'Level 1 · A0 → A1', levelAr: 'المستوى الأول · من الصفر',
    colour: '#2B36C9', tag: 'خرّج لاكارط ديالك… بالإنجليزية!',
    points: ['19 درسًا من الصفر: التحية، الأرقام، العائلة، الوقت، السكن…', 'شرح بالعربية لكل قاعدة وكل كلمة', 'صوت لكل كلمة وجملة بمسح الرمز', 'كتاب تمارين لكل درس'],
  },
  {
    id: 'piirmi', name: 'PIIRMI ENGLISH', ar: 'بيرمي إنگليش', level: 'Level 2 · A1 → A2', levelAr: 'المستوى الثاني · المواقف اليومية',
    colour: '#0E6B4E', tag: 'دوّز البيرمي… بالإنجليزية!',
    points: ['19 وحدة للمواقف اليومية: السوق، الطبيب، السفر، العمل…', 'عبارات جاهزة ومحادثات من الحياة في المغرب', 'شرح بالعربية وتمارين بعد كل وحدة', 'كتاب تمارين لكل وحدة'],
  },
  {
    id: 'viiza', name: 'VIIZA ENGLISH', ar: 'فيزا إنگليش', level: 'Level 3 · A2 → B1', levelAr: 'المستوى الثالث · تكلّم واكتب بدقّة',
    colour: '#A3262A', tag: 'خود الفيزا… بالإنجليزية!',
    points: ['20 وحدة: تجاربك، خططك، العمل، الشكاوى، الآراء', 'محادثة لكل وحدة خطوة بخطوة، ثم القواعد والكتابة', 'صوت لكل جملة بمسح الرمز في كل صفحة', 'كتاب تمارين واختبار بعد كل محور'],
  },
] as const

const KINDS: { id: Kind; ar: string; en: string; Icon: typeof BookOpen }[] = [
  { id: 'book', ar: 'كتاب الطالب', en: "Student's Book", Icon: BookOpen },
  { id: 'workbook', ar: 'كتاب التمارين', en: 'Workbook', Icon: PenLine },
]

export default function BookPreview() {
  const [lv, setLv] = useState<(typeof LEVELS)[number]['id']>('viiza')
  const [kind, setKind] = useState<Kind>('book')
  const level = LEVELS.find(l => l.id === lv)!
  const k = KINDS.find(x => x.id === kind)!
  const pages = Array.from({ length: (PAGES[`${lv}-${kind}`] ?? 14) + 1 }, (_, i) => `/preview/${lv}-${kind}/${String(i).padStart(2, '0')}.jpg`)
  const order = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`السلام عليكم، أريد طلب ${level.name} (${k.ar})`)}`

  const end = (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center" dir="rtl">
      <span className="text-[40px]">📚</span>
      <p className="font-arabic text-[20px] font-extrabold text-[#0B1B4D]">أعجبك ما رأيت؟</p>
      <p className="font-arabic text-[14px] text-slate-600">هذه الصفحات الأولى فقط. الكتاب الكامل يصلك مطبوعًا، مع الصوت لكل صفحة.</p>
      <a href={order} target="_blank" rel="noopener" className={`${CTA_GOLD} px-5 py-3 text-[15px]`}><MessageCircle size={18} />اطلبه عبر واتساب</a>
    </div>
  )

  return (
    <section className="px-5 sm:px-6 pb-16" dir="rtl">
      <div className="mx-auto max-w-[1200px]">
        {/* the three levels */}
        <div className="grid gap-3 sm:grid-cols-3" role="tablist" aria-label="المستويات">
          {LEVELS.map(l => (
            <button key={l.id} type="button" role="tab" aria-selected={l.id === lv} onClick={() => setLv(l.id)}
              className={`rounded-2xl p-4 text-right ring-2 transition ${l.id === lv ? 'text-white shadow-lg' : 'bg-white text-[#0B1B4D] ring-slate-200 hover:ring-slate-300'}`}
              style={l.id === lv ? { background: l.colour, ['--tw-ring-color' as string]: l.colour } : undefined}>
              <span className="block text-[12px] font-bold opacity-80" dir="ltr">{l.level}</span>
              <span className="block text-[22px] font-extrabold tracking-tight" dir="ltr">{l.name}</span>
              <span className="font-arabic block text-[14px] font-bold opacity-90">{l.ar} · {l.levelAr}</span>
            </button>
          ))}
        </div>

        {/* student's book or workbook */}
        <div className="mt-5 flex justify-center gap-2" role="tablist" aria-label="الكتاب">
          {KINDS.map(x => (
            <button key={x.id} type="button" role="tab" aria-selected={x.id === kind} onClick={() => setKind(x.id)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-bold ring-1 transition ${x.id === kind ? 'bg-[#0B1B4D] text-white ring-[#0B1B4D]' : 'bg-white text-[#0B1B4D] ring-slate-200'}`}>
              <x.Icon size={16} /><span className="font-arabic">{x.ar}</span><span className="opacity-70" dir="ltr">{x.en}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_300px]">
          <FlipBook key={`${lv}-${kind}`} pages={pages} end={end} label={`${level.name} ${k.en}`} />

          <aside className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-[0_14px_34px_-16px_rgba(15,23,42,0.28)]">
            <span className="inline-block rounded-full px-3 py-1 text-[12px] font-bold text-white" style={{ background: level.colour }} dir="ltr">{level.level}</span>
            <h2 className="mt-3 text-[24px] font-extrabold text-[#0B1B4D]" dir="ltr">{level.name}</h2>
            <p className="font-arabic text-[15px] font-bold" style={{ color: level.colour }}>{level.tag}</p>
            <ul className="mt-4 space-y-2.5">
              {level.points.map(p => (
                <li key={p} className="font-arabic flex gap-2 text-[14px] leading-relaxed text-slate-700"><Check size={18} className="mt-0.5 shrink-0" style={{ color: level.colour }} />{p}</li>
              ))}
            </ul>
            <p className="font-arabic mt-4 flex items-center gap-2 text-[13px] text-slate-500"><Headphones size={16} />امسح الرمز في الصفحة واستمع على هاتفك.</p>
            <a href={order} target="_blank" rel="noopener" className={`${CTA_GOLD} mt-5 w-full px-5 py-3 text-[15px]`}><MessageCircle size={18} />اطلب {k.ar}</a>
            <p className="font-arabic mt-3 text-center text-[12.5px] text-slate-500">التصفّح بالأسهم أو بالسحب، أو اضغط على الصفحة.</p>
          </aside>
        </div>
      </div>
    </section>
  )
}
