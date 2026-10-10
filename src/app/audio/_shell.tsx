import Link from 'next/link'
import type { ReactNode } from 'react'
import { BookOpen, ChevronDown, Layers, Menu, PenLine, type LucideIcon } from 'lucide-react'
import { CARD_LESSONS } from '@/data/level1-cards'
import { clipBase, type AudioSection, type Clip } from '@/data/level1-audio'
import { Player, PlayAll, PlayLine, SpeedSwitch, type PlayClip } from './_player'

/**
 * The frame of every /audio page: the navy bar (where you are, slow / normal)
 * and the menu, a drop-down of the three shelves (course book, workbook,
 * play cards), each a drop-down of the nineteen lessons. The audio of a
 * lesson comes as drop-down sections (words, phrases, each conversation…).
 */

export type Shelf = 'book' | 'workbook' | 'cards'
const pad = (n: number) => String(n).padStart(2, '0')

export const SHELVES: { id: Shelf; en: string; ar: string; Icon: LucideIcon; href: (n: number) => string }[] = [
  { id: 'book', en: 'Course book', ar: 'كتاب الدروس', Icon: BookOpen, href: n => `/audio/book/${n}` },
  { id: 'workbook', en: 'Workbook', ar: 'دفتر التمارين', Icon: PenLine, href: n => `/audio/workbook/${n}` },
  { id: 'cards', en: 'Play cards', ar: 'بطاقات اللعب', Icon: Layers, href: n => `/audio/L${pad(n)}` },
]

export const toPlay = (c: Clip & { label?: string }): PlayClip => ({
  en: c.en, src: clipBase(c), ...(c.ar ? { ar: c.ar } : {}), ...(c.speaker ? { speaker: c.speaker } : {}), ...(c.label ? { label: c.label } : {}),
})

const SUMMARY = 'list-none cursor-pointer select-none [&::-webkit-details-marker]:hidden'

/** The shelves and their lessons, as drop-downs; `here` is open and marked. */
export function ShelfMenu({ here }: { here?: { shelf: Shelf; lesson: number } }) {
  return (
    <div className="flex flex-col gap-2">
      {SHELVES.map(s => (
        <details key={s.id} open={here?.shelf === s.id} className="group rounded-2xl border border-[#D6DCE8] bg-white">
          <summary className={`${SUMMARY} flex items-center gap-3 px-3 py-3`} dir="ltr">
            <span className="w-9 h-9 rounded-xl bg-[#14306B] flex items-center justify-center"><s.Icon size={18} color="#fff" /></span>
            <span className="flex-1 leading-tight">
              <span className="block text-[15.5px] font-bold text-[#14306B]">{s.en}</span>
              <span className="font-arabic block text-[12.5px] text-[#5B6474]">{s.ar} · 19 lessons</span>
            </span>
            <ChevronDown size={18} className="text-[#B8862F] transition group-open:rotate-180" />
          </summary>
          <div className="grid grid-cols-1 gap-1 px-2 pb-2 sm:grid-cols-2">
            {CARD_LESSONS.map(l => {
              const on = here?.shelf === s.id && here.lesson === l.n
              return (
                <Link key={l.n} href={s.href(l.n)} className={`flex items-center gap-2 rounded-xl px-2 py-1.5 ${on ? 'bg-[#FBF5E9] ring-1 ring-[#B8862F]' : 'hover:bg-[#EEF2F9]'}`} dir="ltr">
                  <span className="shrink-0 rounded-md bg-[#14306B] px-1.5 py-0.5 text-[11.5px] font-bold text-white">L{pad(l.n)}</span>
                  <span className="min-w-0 leading-tight">
                    <span className="block truncate text-[13.5px] font-semibold text-[#14306B]">{l.titleEn}</span>
                    <span className="font-arabic block truncate text-[11.5px] text-[#5B6474]" dir="rtl" style={{ textAlign: 'left' }}>{l.titleAr}</span>
                  </span>
                </Link>
              )
            })}
          </div>
        </details>
      ))}
    </div>
  )
}

/** A page of the playlist: the bar, the menu (a drop-down), then the page. */
export function PlayShell({ title, sub, here, children }: { title: string; sub?: string; here?: { shelf: Shelf; lesson: number }; children: ReactNode }) {
  return (
    <Player>
      <header className="sticky top-0 z-10 bg-[#14306B] text-white shadow-md">
        <div className="mx-auto max-w-[720px] px-4 py-3 flex items-center justify-between gap-3" dir="ltr">
          <Link href="/audio" className="min-w-0 leading-tight">
            <div className="text-[15px] font-bold">Inglizi<span className="text-[#D9AA52]">.com</span> · Level 1</div>
            <div className="truncate text-[12px] text-white/75">{sub ?? 'Audio · الصوت'}</div>
          </Link>
          <SpeedSwitch />
        </div>
      </header>
      <main className="mx-auto max-w-[720px] px-4 pb-16 pt-4 flex flex-col gap-4">
        {here && (
          <details className="group rounded-2xl bg-[#EEF2F9]">
            <summary className={`${SUMMARY} flex items-center gap-2 px-3 py-2.5 text-[14px] font-semibold text-[#14306B]`} dir="ltr">
              <Menu size={17} /> All books and lessons <span className="font-arabic text-[12.5px] text-[#5B6474]">· كل الكتب والدروس</span>
              <ChevronDown size={17} className="ml-auto text-[#B8862F] transition group-open:rotate-180" />
            </summary>
            <div className="px-2 pb-2"><ShelfMenu here={here} /></div>
          </details>
        )}
        <h1 className="text-[22px] font-bold leading-tight text-[#14306B]" dir="ltr">{title}</h1>
        {children}
        {here && <LessonNav here={here} />}
      </main>
    </Player>
  )
}

function LessonNav({ here }: { here: { shelf: Shelf; lesson: number } }) {
  const s = SHELVES.find(x => x.id === here.shelf)!
  const prev = CARD_LESSONS.find(l => l.n === here.lesson - 1), next = CARD_LESSONS.find(l => l.n === here.lesson + 1)
  return (
    <nav className="mt-4 flex items-center justify-between text-[14px] font-semibold text-[#14306B]" dir="ltr">
      {prev ? <Link href={s.href(prev.n)}>← Lesson {prev.n}</Link> : <span />}
      <Link href="/audio" className="text-[#B8862F]">All lessons</Link>
      {next ? <Link href={s.href(next.n)}>Lesson {next.n} →</Link> : <span />}
    </nav>
  )
}

/** A lesson's audio as drop-down sections: the first one open, each with "play all". */
export function SectionList({ sections, k, openAll }: { sections: AudioSection[]; k: string; openAll?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      {sections.map((s, i) => {
        const clips = s.clips.map(toPlay)
        const key = `${k}-${i}`
        const sequence = s.kind === 'talk' || s.kind === 'reading'
        return (
          <details key={key} open={openAll || i === 0} className="group rounded-2xl border border-[#D6DCE8] bg-white">
            <summary className={`${SUMMARY} flex items-center gap-2 px-3 py-3`} dir="ltr">
              <span className="text-[15px] font-bold text-[#14306B]">{s.title}</span>
              <span className="font-arabic text-[12.5px] text-[#5B6474]">{s.titleAr}</span>
              <span className="ml-auto rounded-full bg-[#EEF2F9] px-2 text-[11.5px] font-semibold text-[#14306B]">{clips.length}</span>
              <ChevronDown size={18} className="text-[#B8862F] transition group-open:rotate-180" />
            </summary>
            <div className="px-2 pb-2">
              <div className="px-1 pb-1.5"><PlayAll k={key} clips={clips} /></div>
              <div className={s.kind === 'words' ? 'grid grid-cols-2 gap-0.5' : 'flex flex-col gap-0.5'}>
                {clips.map((c, j) => (sequence
                  ? <PlayLine key={j} k={key} clip={c} list={clips} index={j} />
                  : <PlayLine key={j} k={`${key}-${j}`} clip={c} />))}
              </div>
            </div>
          </details>
        )
      })}
    </div>
  )
}
