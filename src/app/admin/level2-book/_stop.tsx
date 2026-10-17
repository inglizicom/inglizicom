'use client'

import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import { PARTS, answersOf, mixed, seedOf, type Exercise, type Stop, type StopKind } from '@/data/viiza-book'
import { PLAY } from '@/components/QrLink'
import { Ar, Body, C, En, EN, Footer, Ico, PAD, Qr, RegionBadge, Route, Sec, Sheet, StopHead } from './_kit'
import { ScreenView } from './_screens'

/**
 * A stop's four pages, always in the same order, so a traveller who knows
 * one stop can find their way in all of them: opener · say & hear ·
 * conversation · practice and survival card.
 */

const SECTION: Record<StopKind, string> = { opener: 'Opener', sayhear: 'Say it · Hear it', talk: 'Conversation', practice: 'Practice' }

export function StopPage({ stop, kind, pageNo, filename }: { stop: Stop; kind: StopKind; pageNo: number; filename: string }) {
  const label = `Stop ${PAD(stop.n)} · ${SECTION[kind]} · p. ${pageNo}`
  if (kind === 'opener') return <Sheet label={label} filename={filename}><Opener s={stop} /><Footer pageNo={pageNo} /></Sheet>
  return (
    <Sheet label={label} filename={filename}>
      <StopHead n={stop.n} titleEn={stop.titleEn} titleAr={stop.titleAr} part={stop.part} section={SECTION[kind]} />
      <Body>
        {kind === 'sayhear' && <SayHear s={stop} />}
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

          {/* Key words */}
          <div>
            <Sec icon="BookA" en="Key words" ar="الكلمات الأساسية" />
            <div className="mt-2 grid grid-cols-4 gap-2" dir="ltr">
              {s.words.map(([en, ar, icon]) => (
                <div key={en} className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ border: `1px solid ${C.line}` }}>
                  <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-md" style={{ background: C.redS }}><Ico name={icon} size={17} color={C.red} /></span>
                  <div className="min-w-0 leading-tight">
                    <div className="text-[12.5px] font-extrabold">{en}</div>
                    <Ar className="text-[11.5px] font-bold" style={{ color: C.grey }}>{ar}</Ar>
                  </div>
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
        </div>
      </Body>
    </>
  )
}

/* ── 2. Say it · Hear it ────────────────────────────────────────────── */

function PhraseColumn({ title, titleAr, icon, color, tint, rows }: { title: string; titleAr: string; icon: string; color: string; tint: string; rows: [string, string][] }) {
  return (
    <div className="overflow-hidden rounded-xl" style={{ border: `1.5px solid ${color}` }}>
      <div className="flex items-center justify-between px-3 py-1.5 text-white" style={{ background: color }} dir="ltr">
        <span className="flex items-center gap-2 text-[12.5px] font-extrabold uppercase tracking-[0.1em]"><Ico name={icon} size={15} color="#fff" /> {title}</span>
        <Ar className="text-[14px] font-bold">{titleAr}</Ar>
      </div>
      <div>
        {rows.map(([en, ar], i) => (
          <div key={i} className="px-3 py-[5px] leading-snug" style={{ background: i % 2 ? tint : '#fff' }}>
            <div className="text-[13px] font-bold"><En>{en}</En></div>
            <Ar className="text-left text-[11.5px] font-semibold" style={{ color: C.grey }}>{ar}</Ar>
          </div>
        ))}
      </div>
    </div>
  )
}

function SayHear({ s }: { s: Stop }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="grid grid-cols-2 gap-4" dir="ltr">
        <PhraseColumn title="You say" titleAr="تقول أنت" icon="MessageSquare" color={C.red} tint={C.redS} rows={s.say} />
        <PhraseColumn title="You hear" titleAr="تسمع" icon="Ear" color={C.navy} tint={C.navyS} rows={s.hear} />
      </div>
      <div>
        <Sec icon="Eye" en="In real life" ar="في الواقع" color={C.navy} />
        <div className="mb-2.5 mt-1 flex items-baseline justify-between gap-3" dir="ltr">
          <span className="text-[13px] font-bold" style={{ color: C.grey }}>{s.screen.caption[0]}</span>
          <Ar className="text-[12.5px] font-semibold" style={{ color: C.grey }}>{s.screen.caption[1]}</Ar>
        </div>
        <ScreenView s={s.screen} />
      </div>
      <NotesFill />
    </div>
  )
}

/** Lined space for the reader's own notes in whatever room a page has left (none when it is too small to write in). */
function NotesFill() {
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
            <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em]" style={{ color: C.grey }}><Ico name="NotebookPen" size={13} color={C.grey} /> My notes</span>
            <Ar as="span" className="text-[12px] font-bold" style={{ color: C.grey }}>ملاحظاتي وجملي الخاصة</Ar>
          </div>
          <div className="mt-1 flex-1" style={{ backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 29px, ${C.line} 29px 30px)` }} />
        </div>
      )}
    </div>
  )
}

/* ── 3. The conversation ────────────────────────────────────────────── */

const VOICES = [C.red, C.navy, C.saffD]

function Talk({ s }: { s: Stop }) {
  const cast = Object.keys(s.talk.cast)
  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div>
        <Sec icon="MessagesSquare" en="Conversation" ar="المحادثة" />
        <div className="mt-2 flex items-center justify-between gap-3" dir="ltr">
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

      <div className="flex items-start gap-3 rounded-xl px-4 py-2.5" style={{ background: C.saffS }} dir="rtl">
        <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full" style={{ background: C.saff }}><Ico name="Lightbulb" size={16} color={C.navy} /></span>
        <div className="min-w-0">
          <div className="flex items-center gap-2"><Ar as="span" className="text-[13px] font-extrabold" style={{ color: C.saffD }}>نصيحة مسافر</Ar><span className="text-[10.5px] font-extrabold tracking-[0.12em]" style={{ color: C.saffD }}>PRO TIP</span></div>
          <Ar className="text-[13px] font-semibold leading-[1.6]">{s.pro}</Ar>
        </div>
      </div>
    </div>
  )
}

/* ── 4. Practice and the survival card ──────────────────────────────── */

const L = 'abcdefghij'

function ExerciseView({ ex, letter, seed }: { ex: Exercise; letter: string; seed: number }) {
  const head = (
    <div className="mb-1.5 flex items-center gap-2" dir="ltr">
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
      <Sec icon="PenLine" en="Practice" ar="تمارين" />
      <div className="mt-2 flex flex-1 flex-col justify-evenly gap-3">
        {s.practice.map((ex, i) => <ExerciseView key={i} ex={ex} letter={'ABCD'[i]} seed={seedOf(s.n, i)} />)}
      </div>
      <div className="space-y-2.5 pt-2.5">
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
  return s.practice.map((ex, i) => ({ letter: 'ABCD'[i], answers: answersOf(ex, seedOf(s.n, i)) }))
}
