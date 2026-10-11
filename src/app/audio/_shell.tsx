import Link from 'next/link'
import type { ReactNode } from 'react'
import { BookA, BookOpen, ChevronDown, Folder, FolderOpen, Layers, Library, Music2, PenLine, type LucideIcon } from 'lucide-react'
import { CARD_LESSONS } from '@/data/level1-cards'
import { INDEX as L2_INDEX } from '@/data/level2-book/plan'
import { clipBase, type AudioSection, type Clip } from '@/data/level1-audio'
import { Player, PlayerCard, PlayerDock, PlayAll, Track, type PlayClip } from './_player'

/**
 * The frame of every /audio page, organised as a library of folders:
 * a level › a shelf (course book, workbook, vocabulary book, play cards) ›
 * a lesson › its sections. Level 2 has two shelves: its course book (the
 * workbook's codes open it too) and its vocabulary book. On a computer the folders stand on the left and
 * the big white player on the right; on a phone the folders fold into one
 * drop-down above the player. A lesson's lines are listed under the player,
 * section by section.
 */

export type Shelf = 'book' | 'workbook' | 'vocab' | 'cards' | 'l2book' | 'l2vocab'
const pad = (n: number) => String(n).padStart(2, '0')

export const SHELVES: { id: Shelf; en: string; ar: string; Icon: LucideIcon; href: (n: number) => string }[] = [
  { id: 'book', en: 'Course book', ar: 'كتاب الدروس', Icon: BookOpen, href: n => `/audio/book/${n}` },
  { id: 'workbook', en: 'Workbook', ar: 'دفتر التمارين', Icon: PenLine, href: n => `/audio/workbook/${n}` },
  { id: 'vocab', en: 'Vocabulary book', ar: 'كتاب المفردات', Icon: BookA, href: n => `/audio/vocab/${n}` },
  { id: 'cards', en: 'Play cards', ar: 'بطاقات اللعب', Icon: Layers, href: n => `/audio/L${pad(n)}` },
]
export const L2_SHELVES: typeof SHELVES = [
  { id: 'l2book', en: 'Course book', ar: 'كتاب الدروس', Icon: BookOpen, href: n => `/audio/level2/book/${n}` },
  { id: 'l2vocab', en: 'Vocabulary book', ar: 'كتاب المفردات', Icon: BookA, href: n => `/audio/level2/vocab/${n}` },
]
export const shelfOf = (id: Shelf) => [...SHELVES, ...L2_SHELVES].find(s => s.id === id)!

/** Each level: its name, its shelves, its lessons and how a lesson is labelled. */
export const LEVELS = [
  { name: 'Level 1 · A0 → A1', shelves: SHELVES, lessons: CARD_LESSONS, code: (n: number) => `L${pad(n)}` },
  { name: 'Level 2 · A2 → B1', shelves: L2_SHELVES, lessons: L2_INDEX, code: (n: number) => `U${pad(n)}` },
]

export const toPlay = (c: Clip & { label?: string }, where: string): PlayClip => ({
  en: c.en, src: clipBase(c), where, ...(c.ar ? { ar: c.ar } : {}), ...(c.speaker ? { speaker: c.speaker } : {}), ...(c.label ? { label: c.label } : {}),
})

/** A lesson's sections as one list for the player, and where each section starts in it. */
export function flatten(sections: AudioSection[], place: string) {
  const clips: PlayClip[] = [], starts: number[] = []
  for (const s of sections) { starts.push(clips.length); clips.push(...s.clips.map(c => toPlay(c, `${place} › ${s.title}`))) }
  return { clips, starts }
}

const SUMMARY = 'list-none cursor-pointer select-none [&::-webkit-details-marker]:hidden'

/** The folders: shelves › lessons, and the open lesson's sections. */
export function LibraryTree({ here, sections }: { here?: { shelf: Shelf; lesson: number }; sections?: string[] }) {
  return (
    <nav className="flex flex-col gap-1" dir="ltr">
      {LEVELS.map(level => <div key={level.name} className="flex flex-col gap-1">
      <div className="flex items-center gap-2 px-2 pb-1 pt-1 text-[13px] font-bold text-[#14306B]"><Library size={16} className="text-[#B8862F]" />{level.name}</div>
      {level.shelves.map(s => (
        <details key={s.id} open={here?.shelf === s.id} className="group/shelf">
          <summary className={`${SUMMARY} flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-[#EEF2F9]`}>
            <span className="text-[#B8862F]"><Folder size={18} className="group-open/shelf:hidden" /><FolderOpen size={18} className="hidden group-open/shelf:block" /></span>
            <s.Icon size={15} className="text-[#14306B]" />
            <span className="flex-1 text-[14px] font-bold text-[#14306B]">{s.en} <span className="font-arabic text-[12px] font-semibold text-[#5B6474]">{s.ar}</span></span>
            <ChevronDown size={16} className="text-[#5B6474] transition group-open/shelf:rotate-180" />
          </summary>
          <div className="ml-4 border-l border-[#D6DCE8] pl-2 py-1 flex flex-col gap-0.5">
            {level.lessons.map(l => {
              const on = here?.shelf === s.id && here.lesson === l.n
              return (
                <div key={l.n}>
                  <Link href={s.href(l.n)} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${on ? 'bg-[#FBF5E9] ring-1 ring-[#B8862F]' : 'hover:bg-[#EEF2F9]'}`}>
                    {on ? <FolderOpen size={15} className="shrink-0 text-[#B8862F]" /> : <Folder size={15} className="shrink-0 text-[#5B6474]" />}
                    <span className="shrink-0 text-[12px] font-bold text-[#14306B]">{level.code(l.n)}</span>
                    <span className="truncate text-[13px] text-[#1F2937]">{l.titleEn}</span>
                  </Link>
                  {on && sections && (
                    <div className="ml-4 border-l border-[#D6DCE8] pl-2 py-0.5 flex flex-col">
                      {sections.map((t, i) => (
                        <a key={i} href={`#sec-${i}`} className="flex items-center gap-2 rounded-md px-2 py-1 text-[12.5px] text-[#14306B] hover:bg-[#EEF2F9]">
                          <Music2 size={13} className="shrink-0 text-[#B8862F]" /><span className="truncate">{t}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </details>
      ))}
      </div>)}
    </nav>
  )
}

/** A page of the library: the bar, the folders, the player, the page's lines. */
export function AudioShell({ crumbs, title, here, sections, clips, children }: {
  crumbs: string[]; title: string; here?: { shelf: Shelf; lesson: number }; sections?: string[]; clips?: PlayClip[]; children: ReactNode
}) {
  const body = (
    <div className={`mx-auto max-w-[1180px] px-3 sm:px-5 pt-4 grid gap-5 lg:grid-cols-[300px_1fr] ${clips ? 'pb-[250px] lg:pb-16' : 'pb-16'}`}>
      {/* the folders: a column on a computer, a drop-down on a phone */}
      <aside className="lg:sticky lg:top-[76px] lg:self-start lg:max-h-[calc(100vh-96px)] lg:overflow-auto">
        <details className="group lg:hidden rounded-2xl bg-white ring-1 ring-[#D6DCE8]" open={!here}>
          <summary className={`${SUMMARY} flex items-center gap-2 px-4 py-3 text-[14.5px] font-bold text-[#14306B]`} dir="ltr">
            <Library size={17} className="text-[#B8862F]" />Library <span className="font-arabic text-[12.5px] font-semibold text-[#5B6474]">· المكتبة</span>
            <ChevronDown size={17} className="ml-auto text-[#B8862F] transition group-open:rotate-180" />
          </summary>
          <div className="px-2 pb-3"><LibraryTree here={here} sections={sections} /></div>
        </details>
        <div className="hidden lg:block rounded-2xl bg-white p-2 ring-1 ring-[#D6DCE8]"><LibraryTree here={here} sections={sections} /></div>
      </aside>
      <div className="min-w-0 flex flex-col gap-4">
        {clips && <div className="hidden lg:block lg:sticky lg:top-[76px] z-[5]"><PlayerCard /></div>}
        <h1 className="text-[21px] sm:text-[24px] font-bold leading-tight text-[#14306B]" dir="ltr">{title}</h1>
        {children}
      </div>
    </div>
  )
  return (
    <div className="min-h-screen bg-[#F4F6FB]">
      <header className="sticky top-0 z-10 bg-[#14306B] text-white shadow-md">
        <div className="mx-auto max-w-[1180px] px-4 py-3 flex items-center gap-3" dir="ltr">
          <Link href="/audio" className="shrink-0 text-[15px] font-bold">Inglizi<span className="text-[#D9AA52]">.com</span></Link>
          <span className="min-w-0 truncate text-[12.5px] text-white/75">{crumbs.join(' › ')}</span>
        </div>
      </header>
      {clips ? (
        <Player clips={clips}>
          {body}
          {/* on a phone or a tablet, the player docked at the foot of the screen */}
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[720px]"><PlayerDock /></div>
        </Player>
      ) : body}
    </div>
  )
}

/** A lesson's sections under the player: each a drop-down of its lines, with "play all". */
export function SectionList({ sections, starts, openAll }: { sections: AudioSection[]; starts: number[]; openAll?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      {sections.map((s, i) => (
        <details key={i} id={`sec-${i}`} open={openAll || i === 0} className="group scroll-mt-24 rounded-2xl bg-white ring-1 ring-[#D6DCE8]">
          <summary className={`${SUMMARY} flex items-center gap-2 px-4 py-3`} dir="ltr">
            <Music2 size={16} className="text-[#B8862F]" />
            <span className="text-[15px] font-bold text-[#14306B]">{s.title}</span>
            <span className="font-arabic text-[12.5px] text-[#5B6474]">{s.titleAr}</span>
            <span className="ml-auto rounded-full bg-[#EEF2F9] px-2 text-[11.5px] font-semibold text-[#14306B]">{s.clips.length}</span>
            <ChevronDown size={18} className="text-[#B8862F] transition group-open:rotate-180" />
          </summary>
          <div className="px-2 pb-2">
            <div className="px-1 pb-1.5"><PlayAll from={starts[i]} to={starts[i] + s.clips.length - 1} /></div>
            <div className={s.kind === 'words' ? 'grid grid-cols-1 sm:grid-cols-2 gap-0.5' : 'flex flex-col gap-0.5'} dir="ltr">
              {s.clips.map((_, j) => <Track key={j} i={starts[i] + j} compact={s.kind === 'words'} />)}
            </div>
          </div>
        </details>
      ))}
    </div>
  )
}

/** The shelves as big folders (the library's home page). */
export function ShelfGrid({ level = LEVELS[0] }: { level?: (typeof LEVELS)[number] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {level.shelves.map(s => (
        <details key={s.id} className="group rounded-2xl bg-white ring-1 ring-[#D6DCE8]">
          <summary className={`${SUMMARY} flex items-center gap-3 px-4 py-4`} dir="ltr">
            <span className="w-11 h-11 rounded-xl bg-[#14306B] flex items-center justify-center"><s.Icon size={20} color="#fff" /></span>
            <span className="flex-1 leading-tight">
              <span className="block text-[16px] font-bold text-[#14306B]">{s.en}</span>
              <span className="font-arabic block text-[13px] text-[#5B6474]">{s.ar} · {level.lessons.length} {level === LEVELS[0] ? 'lessons' : 'units'}</span>
            </span>
            <ChevronDown size={18} className="text-[#B8862F] transition group-open:rotate-180" />
          </summary>
          <div className="grid gap-1 px-2 pb-3" dir="ltr">
            {level.lessons.map(l => (
              <Link key={l.n} href={s.href(l.n)} className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[#EEF2F9]">
                <Folder size={15} className="shrink-0 text-[#B8862F]" />
                <span className="shrink-0 text-[12px] font-bold text-[#14306B]">{level.code(l.n)}</span>
                <span className="truncate text-[13.5px] text-[#1F2937]">{l.titleEn}</span>
                <span className="font-arabic ml-auto truncate text-[12px] text-[#5B6474]">{l.titleAr}</span>
              </Link>
            ))}
          </div>
        </details>
      ))}
    </div>
  )
}
