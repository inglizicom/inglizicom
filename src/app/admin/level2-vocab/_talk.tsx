'use client'

import { PARTS, STOPS } from '@/data/viiza-book'
import { talkOf, type buildTalkBook, type Conversation, type TalkPage, type TalkStop } from '@/data/viiza-talk'
import { PLAY } from '@/components/QrLink'
import { Ar, Body, C, En, Footer, Ico, PAD, Qr, RegionBadge, Sec, Sheet, StopHead } from '../level2-book/_kit'
import { PageHead } from '../level2-book/_matter'

/**
 * The pages of Words & Conversations, in the travel guide's look: a stop's
 * twelve new words and its four conversations over two pages, each line in
 * English with its Arabic beside it, so a conversation reads like a script.
 */

type Book = ReturnType<typeof buildTalkBook>
const FOOT = 'WORDS & CONVERSATIONS'
const VOICES = [C.red, C.navy, C.saffD]

export function TalkBookPage({ page, pageNo, book, filename }: { page: TalkPage; pageNo: number; book: Book; filename: string }) {
  if (page.kind === 'howto') {
    return (
      <Sheet label={`howto · p. ${pageNo}`} filename={filename}>
        <PageHead en="Words & conversations" ar="الكلمات والمحادثات" icon="MessagesSquare" tag="Before you start" />
        <Body><HowTo book={book} /></Body>
        <Footer pageNo={pageNo} book={FOOT} />
      </Sheet>
    )
  }
  const t = talkOf(page.stop)!
  const s = STOPS[page.stop - 1]
  return (
    <Sheet label={`Stop ${PAD(s.n)} · ${page.kind} · p. ${pageNo}`} filename={filename}>
      <StopHead n={s.n} titleEn={s.titleEn} titleAr={s.titleAr} part={s.part} section={page.kind === 'a' ? 'Words & conversations 1–2' : 'Conversations 3–4'} />
      <Body>{page.kind === 'a' ? <PageA t={t} /> : <PageB t={t} />}</Body>
      <Footer pageNo={pageNo} book={FOOT} />
    </Sheet>
  )
}

function PageA({ t }: { t: TalkStop }) {
  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div>
        <div className="flex items-start gap-4" dir="ltr">
          <div className="min-w-0 flex-1">
            <Sec icon="BookA" en="New words" ar="كلمات جديدة" />
            <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1">
              {t.words.map(([en, ar]) => (
                <div key={en} className="flex items-baseline justify-between gap-2 border-b pb-[3px]" style={{ borderColor: C.line }}>
                  <span className="text-[13px] font-extrabold">{en}</span>
                  <Ar as="span" className="text-[12px] font-bold" style={{ color: C.grey }}>{ar}</Ar>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-1 text-center"><Qr url={PLAY.viizaTalk(t.n)} size={60} /></div>
        </div>
      </div>
      <Talk c={t.talks[0]} i={0} />
      <Talk c={t.talks[1]} i={1} />
    </div>
  )
}

function PageB({ t }: { t: TalkStop }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Talk c={t.talks[2]} i={2} />
      <Talk c={t.talks[3]} i={3} />
      <div className="flex min-h-[110px] flex-1 items-stretch gap-3 rounded-xl px-4 py-3" style={{ background: C.saffS }} dir="ltr">
        <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full" style={{ background: C.saff }}><Ico name="Users" size={16} color={C.navy} /></span>
        <div className="flex h-full min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-extrabold uppercase tracking-[0.1em]" style={{ color: C.saffD }}>Your turn · Conversation 5</span>
            <Ar as="span" className="text-[13px] font-extrabold" style={{ color: C.saffD }}>دورك: المحادثة الخامسة</Ar>
          </div>
          <div className="mt-0.5 text-[13.5px] font-bold">{t.yourTurn[0]}</div>
          <Ar className="text-left text-[12.5px] font-semibold" style={{ color: C.grey }}>{t.yourTurn[1]}</Ar>
          <div className="mt-1 text-[11px] font-semibold" style={{ color: C.grey }}>Act it out with a partner, then write it.</div>
          <div className="mt-1 min-h-0 flex-1" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 29px, #D9C68F 29px 30px)' }} />
        </div>
      </div>
    </div>
  )
}

/** One conversation: number, title, region and place, then its lines as a two-language script. */
function Talk({ c, i }: { c: Conversation; i: number }) {
  const cast = Object.keys(c.cast)
  return (
    <div>
      <div className="flex items-center gap-2.5" dir="ltr">
        <span className="flex h-[28px] w-[28px] items-center justify-center rounded-lg text-[14px] font-extrabold text-white" style={{ background: C.red }}>{i + 1}</span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-extrabold">{c.title[0]}</span>
            <span className="flex items-center gap-1 truncate text-[11px] font-bold" style={{ color: C.grey }}><Ico name="MapPin" size={11} color={C.red} />{c.place}</span>
          </div>
          <div className="mt-[2px] flex gap-1.5">
            {cast.map((who, k) => (
              <span key={who} className="rounded-full px-2 py-[1px] text-[9.5px] font-extrabold" style={{ background: k === 0 ? C.redS : k === 1 ? C.navyS : C.saffS, color: VOICES[k] }}>
                {who} · <Ar as="span" className="font-bold">{c.cast[who]}</Ar>
              </span>
            ))}
          </div>
        </div>
        <Ar className="text-[14px] font-extrabold" style={{ color: C.red }}>{c.title[1]}</Ar>
        <RegionBadge region={c.region} />
      </div>
      <div className="mt-1.5 overflow-hidden rounded-xl" style={{ border: `1px solid ${C.line}` }} dir="ltr">
        {c.lines.map(([who, en, ar], k) => {
          const v = VOICES[Math.max(0, cast.indexOf(who)) % VOICES.length]
          return (
            <div key={k} className="grid grid-cols-[76px_1fr_0.78fr] items-start gap-2.5 px-2.5 py-[4px]" style={{ background: k % 2 ? C.cream : '#fff' }}>
              <span className="mt-[1px] truncate rounded px-1 py-[1px] text-center text-[9.5px] font-extrabold text-white" style={{ background: v }}>{who}</span>
              <span className="text-[13px] font-semibold leading-snug"><En>{en}</En></span>
              <Ar className="text-[12px] font-semibold leading-snug" style={{ color: C.grey }}>{ar}</Ar>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function HowTo({ book }: { book: Book }) {
  const at = (n: number) => book.pageOf(p => p.kind === 'a' && p.stop === n)
  return (
    <div className="flex h-full flex-col gap-3.5">
      <div className="flex items-start gap-4 rounded-xl px-4 py-3" style={{ background: C.cream }} dir="rtl">
        <Ar className="flex-1 text-[13.5px] font-semibold leading-[1.8]">في كتاب الطالب محادثة واحدة لكل محطة. هنا أربع محادثات أخرى للموقف نفسه: في الخليج وأمريكا وبريطانيا وأوروبا، مع أشخاص مختلفين، وبمشكلة أو مكالمة أو سوء فهم. حين تصل إلى الموقف الحقيقي، تكون قد سمعته خمس مرات. واقرأ اثنتي عشرة كلمة جديدة في كل محطة.</Ar>
        <Qr url={PLAY.viizaTalk(1)} size={58} />
      </div>
      <div>
        <Sec icon="Repeat" en="How to practise a conversation" ar="كيف تتدرّب على محادثة" />
        <div className="mt-2 grid grid-cols-4 gap-2" dir="ltr">
          {[['Headphones', 'Listen', 'استمع', 'امسح الرمز واستمع إلى المحادثة.'], ['BookOpen', 'Read', 'اقرأ', 'اقرأ الإنجليزية، وانظر إلى العربية عند الحاجة.'], ['Users', 'Act', 'مثّل', 'مثّلها مع زميل، كلٌّ في دور.'], ['RefreshCw', 'Change', 'غيّر', 'غيّر المكان والأسماء والأرقام، وأعدها.']].map(([icon, en, ar, text]) => (
            <div key={en} className="rounded-xl px-3 py-2" style={{ border: `1px solid ${C.line}` }}>
              <div className="flex items-center gap-1.5"><Ico name={icon} size={15} color={C.red} /><span className="text-[13px] font-extrabold">{en}</span><Ar as="span" className="ml-auto text-[12.5px] font-bold" style={{ color: C.red }}>{ar}</Ar></div>
              <Ar className="mt-0.5 text-[11.5px] font-semibold leading-snug" style={{ color: C.grey }}>{text}</Ar>
            </div>
          ))}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <Sec icon="Route" en="Contents" ar="الفهرس" color={C.navy} />
        <div className="mt-2 grid flex-1 grid-cols-2 gap-x-6" dir="ltr">
          {[[1, 2, 3], [4, 5, 6]].map((col, ci) => (
            <div key={ci} className="flex flex-col gap-2.5">
              {col.map(n => (
                <div key={n}>
                  <div className="flex items-center gap-2 rounded-md px-2 py-[2px] text-white" style={{ background: C.red }}>
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.06em]">Part {n} · {PARTS[n - 1].titleEn}</span>
                    <Ar className="ml-auto text-[11.5px] font-bold" style={{ color: C.saff }}>{PARTS[n - 1].titleAr}</Ar>
                  </div>
                  {STOPS.filter(s => s.part === n).map(s => (
                    <div key={s.n} className="flex items-center gap-2 border-b px-1 py-[2px] text-[12px] font-bold" style={{ borderColor: C.line }}>
                      <span className="w-[18px] font-extrabold" style={{ color: C.red }}>{PAD(s.n)}</span>
                      <span className="flex-1 truncate">{s.titleEn}</span>
                      <span>{at(s.n) || '—'}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
