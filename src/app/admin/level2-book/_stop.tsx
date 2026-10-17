'use client'

import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import { PARTS, answersOf, checkAnswers, mixed, seedOf, type Exercise, type Pair, type Stop, type StopKind } from '@/data/viiza-book'
import { PLAY } from '@/components/QrLink'
import { Ar, Body, C, En, EN, Footer, Ico, PAD, Qr, RegionBadge, Route, Sec, Sheet, StopHead } from './_kit'
import { ScreenView } from './_screens'

/**
 * A stop's six pages, always in the same order, so a traveller who knows
 * one stop can find their way in all of them: opener · vocabulary ·
 * exchanges (what you hear and how to reply, what you say and what comes
 * back) · in real life · conversation · practice and survival card. The
 * vocabulary and the exchanges each get a page of their own, so a learner
 * can study the words, then the replies, before meeting them in the
 * conversation. Under the head of every page after the opener, a navy band
 * names the section in big letters and lights its step of the six, so the
 * reader always knows where they are.
 */

const SECTION: Record<StopKind, string> = { opener: 'Opener', words: 'Vocabulary', exchanges: 'You hear · You say', real: 'In real life', talk: 'Conversation', practice: 'Practice' }

/** The six pages of a stop, for the opener's map: [kind, icon, English, Arabic]. */
const PAGES: [StopKind, string, string, string][] = [
  ['opener', 'Flag', 'Opener', 'البداية'],
  ['words', 'BookA', 'Vocabulary', 'المفردات'],
  ['exchanges', 'ArrowLeftRight', 'You hear · You say', 'تسمع وتردّ'],
  ['real', 'Eye', 'In real life', 'في الواقع'],
  ['talk', 'MessagesSquare', 'Conversation', 'المحادثة'],
  ['practice', 'PenLine', 'Practice', 'التمارين'],
]

const BAND = 46

/** Where am I? A navy band under the head: the section, big, and the stop's six steps with this one lit. */
function SectionBand({ kind }: { kind: StopKind }) {
  const at = PAGES.findIndex(p => p[0] === kind)
  const [, icon, en, ar] = PAGES[at]
  return (
    <div className="absolute inset-x-0 flex items-center gap-4 px-10" style={{ top: 54, height: BAND, background: C.navy }} dir="ltr">
      <div className="flex w-[250px] items-center gap-2.5">
        <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg" style={{ background: C.saff }}><Ico name={icon} size={17} color={C.navy} stroke={2.3} /></span>
        <div className="min-w-0 leading-none">
          <div className="text-[9px] font-extrabold tracking-[0.18em]" style={{ color: C.saff }}>SECTION {at + 1} OF 6</div>
          <div className="mt-[3px] truncate text-[18px] font-extrabold uppercase tracking-[0.04em] text-white">{en}</div>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center">
        {PAGES.map(([k], i) => (
          <Fragment key={k}>
            {i > 0 && <span className="h-[2px] w-[14px]" style={{ background: i <= at ? C.saff : 'rgba(255,255,255,0.3)' }} />}
            <span className="flex items-center justify-center rounded-full text-[11px] font-extrabold"
              style={i === at
                ? { width: 28, height: 28, background: C.saff, color: C.navy, fontSize: 13 }
                : i < at
                  ? { width: 20, height: 20, background: 'rgba(255,255,255,0.9)', color: C.navy }
                  : { width: 20, height: 20, border: '1.5px solid rgba(255,255,255,0.45)', color: 'rgba(255,255,255,0.7)' }}>{i + 1}</span>
          </Fragment>
        ))}
      </div>
      <div className="w-[250px] text-right leading-none" dir="rtl">
        <Ar as="span" className="text-[20px] font-extrabold" style={{ color: C.saff }}>{ar}</Ar>
      </div>
    </div>
  )
}

export function StopPage({ stop, kind, pageNo, filename }: { stop: Stop; kind: StopKind; pageNo: number; filename: string }) {
  const label = `Stop ${PAD(stop.n)} · ${SECTION[kind]} · p. ${pageNo}`
  if (kind === 'opener') return <Sheet label={label} filename={filename}><Opener s={stop} /><Footer pageNo={pageNo} /></Sheet>
  return (
    <Sheet label={label} filename={filename}>
      <StopHead n={stop.n} titleEn={stop.titleEn} titleAr={stop.titleAr} part={stop.part} section={SECTION[kind]} />
      <SectionBand kind={kind} />
      <Body top={54 + BAND}>
        {kind === 'words' && <Vocabulary s={stop} />}
        {kind === 'exchanges' && <Exchanges s={stop} />}
        {kind === 'real' && <RealLife s={stop} />}
        {kind === 'talk' && <Talk s={stop} />}
        {kind === 'practice' && <Practice s={stop} />}
      </Body>
      <Footer pageNo={pageNo} />
    </Sheet>
  )
}

/* ── 1. Opener ──────────────────────────────────────────────────────── */

const HERO = 244

function Opener({ s }: { s: Stop }) {
  const part = PARTS.find(p => p.n === s.part)!
  return (
    <>
      <div className="absolute inset-x-0 top-0 px-10 pt-7 text-white" style={{ height: HERO, background: C.red }}>
        <div className="flex items-start justify-between" dir="ltr">
          <div className="flex items-start gap-5">
            <div className="leading-none">
              <div className="text-[11px] font-extrabold tracking-[0.3em]" style={{ color: C.saff }}>STOP</div>
              <div className="text-[76px] font-extrabold leading-[0.9] tracking-[-0.03em]" style={{ color: C.saff }}>{PAD(s.n)}</div>
            </div>
            <div className="pt-1">
              <div className="text-[10.5px] font-extrabold uppercase tracking-[0.16em] opacity-80">Part {part.n} · {part.titleEn} · {part.titleAr}</div>
              <div className="mt-1 max-w-[440px] text-[34px] font-extrabold leading-[1.02] tracking-[-0.01em]">{s.titleEn}</div>
              <Ar className="mt-1 text-[24px] font-extrabold leading-tight" style={{ color: C.saff }}>{s.titleAr}</Ar>
            </div>
          </div>
          <Qr url={PLAY.viiza(s.n)} size={66} />
        </div>
        <div className="absolute inset-x-10 bottom-4"><Route part={s.part} /></div>
      </div>
      <Body top={HERO - 14 + 4}>
        <div className="flex h-full flex-col justify-between gap-3">
          {/* The situation and the goals */}
          <div className="grid grid-cols-[1fr_1.05fr] gap-4" dir="ltr">
            <div className="rounded-xl px-4 py-3" style={{ background: C.cream }}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10.5px] font-extrabold uppercase tracking-[0.12em]" style={{ color: C.red }}>The situation</span>
                <Ar className="text-[12px] font-bold" style={{ color: C.red }}>الموقف</Ar>
              </div>
              <Ar className="text-[13.5px] font-semibold leading-[1.65]">{s.intro}</Ar>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-extrabold uppercase tracking-[0.12em]" style={{ color: C.navy }}>After this stop</span>
                <Ar className="text-[12px] font-bold" style={{ color: C.navy }}>بعد هذه المحطة</Ar>
              </div>
              {s.canDo.map(([en, ar]) => (
                <div key={en} className="flex items-start gap-2">
                  <span className="mt-[2px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full" style={{ background: C.navy }}><Ico name="Check" size={12} color="#fff" stroke={3} /></span>
                  <div className="min-w-0 leading-snug">
                    <div className="text-[13px] font-bold">{en}</div>
                    <Ar className="text-left text-[12px] font-semibold" style={{ color: C.grey }}>{ar}</Ar>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Know before you go */}
          <div>
            <Sec icon="Info" en="Know before you go" ar="اعرف قبل أن تسافر" color={C.navy} />
            <div className="mt-2 space-y-1.5">
              {s.know.map((t, i) => (
                <div key={i} className="flex items-center gap-3 border-b pb-1.5 last:border-0" dir="rtl" style={{ borderColor: C.line }}>
                  <RegionBadge region={t.region} />
                  <Ar className="flex-1 text-[13px] font-semibold leading-[1.55]">{t.text}</Ar>
                </div>
              ))}
            </div>
          </div>

          {/* Apps and sites for this stop */}
          {s.apps && s.apps.length > 0 && (
            <div>
              <Sec icon="Smartphone" en="Useful apps" ar="تطبيقات ومواقع مفيدة" color={C.navy} />
              <div className="mt-2 flex flex-wrap gap-1.5" dir="ltr">
                {s.apps.map(([name, ar]) => (
                  <span key={name} className="flex items-center gap-1.5 rounded-full py-[3px] pl-1 pr-3" style={{ border: `1px solid ${C.line}`, background: C.cream }}>
                    <span className="flex h-[20px] w-[20px] items-center justify-center rounded-full" style={{ background: C.navy }}><Ico name="Smartphone" size={11} color="#fff" /></span>
                    <span className="text-[12px] font-extrabold">{name}</span>
                    <Ar as="span" className="text-[11px] font-semibold" style={{ color: C.grey }}>{ar}</Ar>
                  </span>
                ))}
              </div>
            </div>
          )}

          <ProTip text={s.pro} />

          {/* The stop's six pages */}
          <div>
            <Sec icon="Map" en="This stop, page by page" ar="هذه المحطة صفحة بصفحة" color={C.navy} />
            <div className="mt-2 grid grid-cols-6 gap-1.5" dir="ltr">
              {PAGES.map(([kind, icon, en, ar], i) => (
                <div key={kind} className="flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-center" style={{ background: i ? C.navyS : C.redS }}>
                  <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full" style={{ background: i ? C.navy : C.red }}><Ico name={icon} size={14} color="#fff" /></span>
                  <span className="text-[10.5px] font-extrabold leading-tight">{i + 1} · {en}</span>
                  <Ar className="text-[10.5px] font-bold leading-tight" style={{ color: C.grey }}>{ar}</Ar>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Body>
    </>
  )
}

/** One insider tip, on saffron. */
function ProTip({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl px-4 py-2.5" style={{ background: C.saffS }} dir="rtl">
      <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full" style={{ background: C.saff }}><Ico name="Lightbulb" size={16} color={C.navy} /></span>
      <div className="min-w-0">
        <div className="flex items-center gap-2"><Ar as="span" className="text-[13px] font-extrabold" style={{ color: C.saffD }}>نصيحة مسافر</Ar><span className="text-[10.5px] font-extrabold tracking-[0.12em]" style={{ color: C.saffD }}>PRO TIP</span></div>
        <Ar className="text-[13px] font-semibold leading-[1.7]">{text}</Ar>
      </div>
    </div>
  )
}

/* ── 2. Vocabulary ──────────────────────────────────────────────────── */

/** An example sentence with its key word picked out (any of the word's forms, "surname / last name"). */
function Example({ text, word }: { text: string; word: string }) {
  const forms = word.replace(/\([^)]*\)/g, '').split(/\s*[/·]\s*/).map(w => w.trim()).filter(Boolean)
    .flatMap(w => [w, w.replace(/^(a|an|the) /i, '')]).sort((a, b) => b.length - a.length)
  const low = text.toLowerCase()
  const form = forms.find(w => low.includes(w.toLowerCase()))
  if (!form) return <En>{text}</En>
  const at = low.indexOf(form.toLowerCase())
  return <span dir="ltr">{text.slice(0, at)}<b style={{ color: C.red }}>{text.slice(at, at + form.length)}</b>{text.slice(at + form.length)}</span>
}

function Vocabulary({ s }: { s: Stop }) {
  const m = s.more
  return (
    <div className="flex h-full flex-col gap-3.5">
      <div>
        <Sec icon="BookA" en="Key words" ar="الكلمات الأساسية" />
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5" dir="ltr">
          {s.words.map(([en, ar, icon], i) => (
            <div key={en} className="flex items-start gap-2.5 rounded-lg px-2.5 py-1.5" style={{ border: `1px solid ${C.line}` }}>
              <span className="mt-[2px] flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-md" style={{ background: C.redS }}><Ico name={icon} size={18} color={C.red} /></span>
              <div className="min-w-0 flex-1 leading-snug">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[13.5px] font-extrabold">{en}</span>
                  <Ar as="span" className="shrink-0 text-[12px] font-bold" style={{ color: C.red }}>{ar}</Ar>
                </div>
                {m?.examples[i] && <div className="text-[12px] font-medium" style={{ color: '#2A3150' }}><Example text={m.examples[i]} word={en} /></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {m && (
        <div>
          <Sec icon="Zap" en="Action words" ar="أفعال تحتاجها" color={C.navy} />
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5" dir="ltr">
            {m.actions.map(([en, ar, ex]) => (
              <div key={en} className="rounded-lg px-3 py-1.5 leading-snug" style={{ background: C.navyS }}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[13.5px] font-extrabold" style={{ color: C.navy }}>{en}</span>
                  <Ar as="span" className="shrink-0 text-[12px] font-bold" style={{ color: C.grey }}>{ar}</Ar>
                </div>
                <div className="text-[12px] font-medium" style={{ color: '#2A3150' }}><Example text={ex} word={en} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {m && (
        <div>
          <Sec icon="Link" en="Words that go together" ar="كلمات تأتي معًا" color={C.saffD} />
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5" dir="ltr">
            {m.partners.map(([en, ar, ex]) => (
              <div key={en} className="rounded-lg px-3 py-1.5 leading-snug" style={{ background: C.saffS, border: `1px solid ${C.saff}` }}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[13.5px] font-extrabold">{en}</span>
                  <Ar as="span" className="shrink-0 text-[12px] font-bold" style={{ color: C.grey }}>{ar}</Ar>
                </div>
                <div className="text-[12px] font-medium" style={{ color: '#2A3150' }}><Example text={ex} word={en} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <NotesFill en="My new words" ar="كلماتي الجديدة" />
    </div>
  )
}

/* ── 3. You hear · You say ──────────────────────────────────────────── */

/** One bubble of an exchange. */
function Bubble({ en, ar, color, tint, icon, side }: { en: string; ar: string; color: string; tint: string; icon: string; side: 'l' | 'r' }) {
  return (
    <div className={`flex h-full min-w-0 items-start gap-2 rounded-xl px-2.5 py-[5px] ${side === 'l' ? 'rounded-tl-sm' : 'rounded-tr-sm'}`} style={{ background: tint, borderLeft: side === 'l' ? `3px solid ${color}` : undefined, borderRight: side === 'r' ? `3px solid ${color}` : undefined }}>
      <span className="mt-[3px] shrink-0"><Ico name={icon} size={14} color={color} stroke={2.4} /></span>
      <div className="min-w-0 leading-snug">
        <div className="text-[13.5px] font-bold"><En>{en}</En></div>
        <Ar className="text-left text-[11.5px] font-semibold" style={{ color: C.grey }}>{ar}</Ar>
      </div>
    </div>
  )
}

/** Six exchanges: the first speaker on the left, the reply on the right. */
function Exchange({ first, reply, them }: { first: Pair[]; reply: Pair[]; them: boolean }) {
  const a = them ? { color: C.navy, tint: C.navyS, icon: 'Ear' } : { color: C.red, tint: C.redS, icon: 'MessageSquare' }
  const b = them ? { color: C.red, tint: C.redS, icon: 'MessageSquare' } : { color: C.navy, tint: C.navyS, icon: 'Ear' }
  return (
    <div className="mt-2 space-y-1.5" dir="ltr">
      <div className="grid grid-cols-[1fr_22px_1fr] text-[10px] font-extrabold uppercase tracking-[0.1em]">
        <span style={{ color: a.color }}>{them ? 'They say' : 'You say'} · <Ar as="span">{them ? 'يقولون' : 'تقول'}</Ar></span><span />
        <span style={{ color: b.color }}>{them ? 'You reply' : 'They reply'} · <Ar as="span">{them ? 'تردّ أنت' : 'يردّون'}</Ar></span>
      </div>
      {reply.map(([en, ar], i) => (
        <div key={i} className="grid grid-cols-[1fr_22px_1fr] items-stretch">
          <Bubble en={first[i][0]} ar={first[i][1]} side="l" {...a} />
          <span className="flex items-center justify-center"><Ico name="ArrowRight" size={15} color={C.grey} stroke={2.4} /></span>
          <Bubble en={en} ar={ar} side="r" {...b} />
        </div>
      ))}
    </div>
  )
}

function Exchanges({ s }: { s: Stop }) {
  const m = s.more
  if (!m) return null
  const restSay = s.say.slice(m.answers.length), restHear = s.hear.slice(m.replies.length)
  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div>
        <Sec icon="Ear" en="You hear → you reply" ar="تسمع، فتردّ" color={C.navy} />
        <Exchange first={s.hear} reply={m.replies} them />
      </div>
      <div>
        <Sec icon="MessageSquare" en="You say → they reply" ar="تقول، فيردّون" />
        <Exchange first={s.say} reply={m.answers} them={false} />
      </div>
      {(restSay.length > 0 || restHear.length > 0) && (
        <div>
          <Sec icon="Plus" en="More to say, more to hear" ar="جمل أخرى تقولها وتسمعها" color={C.saffD} />
          <div className="mt-2 grid grid-cols-2 gap-3" dir="ltr">
            {[{ rows: restSay, color: C.red, icon: 'MessageSquare' }, { rows: restHear, color: C.navy, icon: 'Ear' }].map((col, k) => (
              <div key={k} className="space-y-1">
                {col.rows.map(([en, ar]) => (
                  <div key={en} className="flex items-start gap-2 border-b pb-1 leading-snug last:border-0" style={{ borderColor: C.line }}>
                    <span className="mt-[3px] shrink-0"><Ico name={col.icon} size={13} color={col.color} stroke={2.4} /></span>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-bold"><En>{en}</En></div>
                      <Ar className="text-left text-[11px] font-semibold" style={{ color: C.grey }}>{ar}</Ar>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── 4. In real life ───────────────────────────────────────────────── */

function RealLife({ s }: { s: Stop }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <div className="mb-2.5 flex items-baseline justify-between gap-3" dir="ltr">
          <span className="text-[13px] font-bold" style={{ color: C.grey }}>{s.screen.caption[0]}</span>
          <Ar className="text-[12.5px] font-semibold" style={{ color: C.grey }}>{s.screen.caption[1]}</Ar>
        </div>
        <ScreenView s={s.screen} />
      </div>
      <WatchOut s={s} />
      <NotesFill />
    </div>
  )
}

/** Three mistakes Arabic speakers make: what people say, what to say, why. */
function WatchOut({ s }: { s: Stop }) {
  return (
    <div>
      <Sec icon="TriangleAlert" en="Watch out" ar="انتبه" color={C.navy} />
      <div className="mt-2 space-y-1.5">
        {s.watch.map(([wrong, right, why]) => (
          <div key={wrong} className="grid grid-cols-[1fr_1fr_1.15fr] items-center gap-3 rounded-lg px-3 py-1.5" dir="ltr" style={{ background: C.navyS }}>
            <span className="flex items-start gap-1.5 text-[12.5px] font-semibold" style={{ color: '#8B93A7' }}><Ico name="X" size={14} color={C.red} stroke={3} /><span className="line-through decoration-[1.5px]"><En>{wrong}</En></span></span>
            <span className="flex items-start gap-1.5 text-[12.5px] font-extrabold"><Ico name="Check" size={14} color="#1E8E5A" stroke={3} /><En>{right}</En></span>
            <Ar className="text-[11.5px] font-semibold leading-snug" style={{ color: C.grey }}>{why}</Ar>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Lined space for the reader's own notes in whatever room a page has left (none when it is too small to write in). */
function NotesFill({ en = 'My notes', ar = 'ملاحظاتي وجملي الخاصة' }: { en?: string; ar?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [h, setH] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setH(el.clientHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={ref} className="min-h-0 flex-1">
      {h >= 90 && (
        <div className="flex h-full flex-col rounded-xl px-4 pb-2 pt-2" style={{ border: `1.5px dashed ${C.line}` }}>
          <div className="flex items-center justify-between" dir="ltr">
            <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em]" style={{ color: C.grey }}><Ico name="NotebookPen" size={13} color={C.grey} /> {en}</span>
            <Ar as="span" className="text-[12px] font-bold" style={{ color: C.grey }}>{ar}</Ar>
          </div>
          <div className="mt-1 flex-1" style={{ backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 29px, ${C.line} 29px 30px)` }} />
        </div>
      )}
    </div>
  )
}

/* ── 5. The conversation ────────────────────────────────────────────── */

const VOICES = [C.red, C.navy, C.saffD]

function Talk({ s }: { s: Stop }) {
  const cast = Object.keys(s.talk.cast)
  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <div className="flex items-center justify-between gap-3" dir="ltr">
          <span className="flex items-center gap-1.5 text-[12.5px] font-bold" style={{ color: C.grey }}><Ico name="MapPin" size={14} color={C.red} /> {s.talk.place}</span>
          <div className="flex gap-1.5">
            {cast.map((who, i) => (
              <span key={who} className="flex items-center gap-1.5 rounded-full px-2.5 py-[2px] text-[11px] font-extrabold" style={{ background: i === 0 ? C.redS : i === 1 ? C.navyS : C.saffS, color: VOICES[i] }}>
                {who} · <Ar as="span" className="font-bold">{s.talk.cast[who]}</Ar>
              </span>
            ))}
          </div>
        </div>
        <div className="mt-2.5 space-y-[5px]" dir="ltr">
          {s.talk.lines.map(([who, en, ar], i) => {
            const v = VOICES[Math.max(0, cast.indexOf(who)) % VOICES.length]
            return (
              <div key={i} className="grid grid-cols-[88px_1fr] items-start gap-3">
                <span className="mt-[2px] truncate rounded-md px-1.5 py-[2px] text-center text-[10.5px] font-extrabold tracking-[0.04em] text-white" style={{ background: v }}>{who}</span>
                <div className="leading-snug">
                  <div className="text-[14px] font-semibold"><En>{en}</En></div>
                  <Ar className="text-left text-[11.5px] font-semibold" style={{ color: C.grey }}>{ar}</Ar>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {s.more && <Check items={s.more.check} />}
      <NotesFill />
    </div>
  )
}

/** Did you understand? Four statements about the conversation, true or false. */
function Check({ items }: { items: [string, boolean][] }) {
  return (
    <div>
      <Sec icon="CircleCheck" en="Did you understand? True or false" ar="هل فهمت؟ صحيح أم خطأ" color={C.navy} />
      <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1.5" dir="ltr">
        {items.map(([t], k) => (
          <div key={k} className="flex items-center gap-2 text-[13px] font-semibold">
            <span className="w-[16px] shrink-0 text-[12px] font-extrabold" style={{ color: C.red }}>{k + 1}</span>
            <span className="flex-1 leading-snug"><En>{t}</En></span>
            {['T', 'F'].map(x => <span key={x} className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded border text-[10.5px] font-extrabold" style={{ borderColor: '#9AA1B4', color: '#9AA1B4' }}>{x}</span>)}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 6. Practice and the survival card ──────────────────────────────── */

const L = 'abcdefghij'

function ExerciseView({ ex, letter, seed }: { ex: Exercise; letter: string; seed: number }) {
  const head = (
    <div className="mb-1 flex items-center gap-2" dir="ltr">
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-md text-[12px] font-extrabold text-white" style={{ background: C.navy }}>{letter}</span>
      <span className="text-[13.5px] font-extrabold">{ex.title[0]}</span>
      <span className="h-[1px] flex-1" style={{ background: C.line }} />
      <Ar as="span" className="text-[13px] font-bold" style={{ color: C.grey }}>{ex.title[1]}</Ar>
    </div>
  )
  const num = (k: number) => <span className="inline-flex w-[18px] shrink-0 text-[12px] font-extrabold" style={{ color: C.red }}>{k + 1}</span>
  switch (ex.t) {
    case 'match': {
      const right = mixed(ex.items.map(i => i[1]), seed)
      const arRight = right.every(r => /[؀-ۿ]/.test(r))
      return (
        <div>{head}
          <div className="grid grid-cols-2 gap-x-8 gap-y-1" dir="ltr">
            {ex.items.map(([left], k) => (
              <Fragment key={k}>
                <div className="flex items-center gap-2 text-[13px] font-bold">{num(k)}<span className="flex-1"><En>{left}</En></span><span className="h-[18px] w-[24px] rounded border" style={{ borderColor: '#9AA1B4' }} /></div>
                <div className="flex items-center gap-2 text-[13px] font-semibold">
                  <span className="w-[16px] text-[12px] font-extrabold" style={{ color: C.navy }}>{L[k]}</span>
                  {arRight ? <Ar className="flex-1 text-[13px] font-semibold">{right[k]}</Ar> : <En>{right[k]}</En>}
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      )
    }
    case 'gaps': {
      const bank = mixed(ex.items.map(i => i[1]), seed)
      return (
        <div>{head}
          <div className="mb-1.5 flex flex-wrap gap-1.5" dir="ltr">
            {bank.map(w => <span key={w} className="rounded-md px-2 py-[2px] text-[12px] font-extrabold" style={{ background: C.saffS, border: `1px solid ${C.saff}` }}>{w}</span>)}
          </div>
          <div className="space-y-1" dir="ltr">
            {ex.items.map(([q], k) => <div key={k} className="flex items-baseline gap-2 text-[13px] font-semibold">{num(k)}<En>{q.replace('___', '__________')}</En></div>)}
          </div>
        </div>
      )
    }
    case 'choose': return (
      <div>{head}
        <div className="space-y-1.5" dir="ltr">
          {ex.items.map(([q, opts], k) => (
            <div key={k} className="text-[13px]">
              <div className="flex items-baseline gap-2 font-bold">{num(k)}<En>{q}</En></div>
              <div className="ml-[26px] flex flex-wrap gap-x-5 font-semibold" style={{ color: '#2A3150' }}>
                {opts.map((o, i) => <span key={i}><b style={{ color: C.navy }}>{L[i]})</b> <En>{o}</En></span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
    case 'say': return (
      <div>{head}
        <div className="space-y-2" dir="ltr">
          {ex.items.map(([sit], k) => (
            <div key={k} className="flex items-end gap-2">
              {num(k)}
              <Ar className="w-[260px] shrink-0 text-[13px] font-semibold leading-snug">{sit}</Ar>
              <span className="mb-[3px] flex-1 border-b-[1.5px] border-dotted" style={{ borderColor: '#8A93A6' }} />
            </div>
          ))}
        </div>
      </div>
    )
    case 'order': {
      const shown = mixed(ex.lines, seed)
      return (
        <div>{head}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1" dir="ltr">
            {shown.map((l, k) => (
              <div key={k} className="flex items-center gap-2 text-[12.5px] font-semibold">
                <span className="h-[18px] w-[22px] shrink-0 rounded border" style={{ borderColor: '#9AA1B4' }} />
                <span className="text-[12px] font-extrabold" style={{ color: C.navy }}>{L[k]}</span><En>{l}</En>
              </div>
            ))}
          </div>
        </div>
      )
    }
  }
}

function Practice({ s }: { s: Stop }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col justify-evenly gap-1.5">
        {s.practice.map((ex, i) => <ExerciseView key={i} ex={ex} letter={'ABCD'[i]} seed={seedOf(s.n, i)} />)}
      </div>
      <div className="space-y-1.5 pt-1.5">
        <RolePlay s={s} />
        <SurvivalCard s={s} />
      </div>
    </div>
  )
}

/** Speaking in pairs: the traveller's cues and the other person's. */
function RolePlay({ s }: { s: Stop }) {
  const Card = ({ who, whoAr, role, color, tint, cues }: { who: string; whoAr: string; role: [string, string]; color: string; tint: string; cues: [string, string][] }) => (
    <div className="overflow-hidden rounded-xl" style={{ border: `1.5px solid ${color}` }}>
      <div className="flex items-center justify-between px-3 py-1" style={{ background: tint }} dir="ltr">
        <span className="truncate text-[11px] font-extrabold uppercase tracking-[0.06em]" style={{ color }}>{who} · {role[0]}</span>
        <Ar as="span" className="shrink-0 text-[11.5px] font-bold" style={{ color }}>{role[1]}</Ar>
      </div>
      <div className="space-y-[3px] px-3 py-1.5" dir="ltr">
        {cues.map(([en, ar], i) => (
          <div key={i} className="flex items-baseline gap-2 leading-snug">
            <span className="text-[11px] font-extrabold" style={{ color }}>{i + 1}</span>
            <div className="min-w-0">
              <div className="text-[12.5px] font-bold">{en}</div>
              <Ar className="text-left text-[11px] font-semibold" style={{ color: C.grey }}>{ar}</Ar>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
  return (
    <div>
      <Sec icon="Users" en="Role-play in pairs" ar="مثّل الموقف مع زميلك" color={C.navy} />
      <div className="mt-2 grid grid-cols-2 gap-3" dir="ltr">
        <Card who="Student A" whoAr="الطالب أ" role={['the traveller', 'المسافر']} color={C.red} tint={C.redS} cues={s.roleplay.a} />
        <Card who="Student B" whoAr="الطالب ب" role={s.roleplay.role} color={C.navy} tint={C.navyS} cues={s.roleplay.b} />
      </div>
    </div>
  )
}

/** The card a traveller shows or reads out when the words won't come. */
export function SurvivalCard({ s }: { s: Stop }) {
  return (
    <div className="relative rounded-2xl border-[2px] border-dashed p-[5px]" style={{ borderColor: C.red }}>
      <span className="absolute -top-[11px] left-6 bg-white px-1.5"><Ico name="Scissors" size={17} color={C.red} /></span>
      <div className="overflow-hidden rounded-xl" style={{ background: C.cream }}>
        <div className="flex items-center justify-between px-4 py-2 text-white" style={{ background: C.red }} dir="ltr">
          <div className="leading-tight">
            <div className="text-[14px] font-extrabold tracking-[0.12em]">SURVIVAL CARD · STOP {PAD(s.n)}</div>
            <div className="text-[10.5px] font-bold opacity-85">Show it or read it aloud</div>
          </div>
          <div className="text-right leading-tight">
            <Ar className="text-[15px] font-extrabold" style={{ color: C.saff }}>بطاقة النجاة</Ar>
            <Ar className="text-[11px] font-semibold opacity-90">أظهرها أو اقرأها بصوت عالٍ</Ar>
          </div>
        </div>
        <div className="divide-y px-4 py-1" style={{ borderColor: C.line }} dir="ltr">
          {s.card.map(([en, ar]) => (
            <div key={en} className="flex items-center justify-between gap-4 py-[4px]" style={{ borderColor: C.line }}>
              <span className="text-[15px] font-extrabold leading-snug" style={{ fontFamily: EN }}><En>{en}</En></span>
              <Ar className="shrink-0 text-right text-[12.5px] font-bold" style={{ color: C.grey }}>{ar}</Ar>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** The key's lines for one stop. */
export function stopAnswers(s: Stop) {
  const key = s.practice.map((ex, i) => ({ letter: 'ABCD'[i], answers: answersOf(ex, seedOf(s.n, i)) }))
  return s.more ? [{ letter: 'T/F', answers: checkAnswers(s) }, ...key] : key
}
