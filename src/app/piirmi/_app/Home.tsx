'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Award, BookOpen, Check, KeyRound, Lock, LogOut, Maximize, Minimize, Play, Sparkles } from 'lucide-react'
import { Ar, EN, V, pad2, useFonts, useFullscreen, useProgress, useStageZoom } from '../../viiza/_app/kit'
import { SignIn } from '../../viiza/_app/Home'
import { P } from './theme'

/**
 * PIIRMI interactive, the home: sign in with the student's token, then the
 * 19 everyday situations as a grid of unit cards, the four review checks
 * (a gold seal each at 7/10), and the sticker album, a sticker for every
 * unit finished. Without access the free sample unit stays open.
 */

export interface UnitCard { n: number; titleEn: string; titleAr: string; icon: string }

const WHATSAPP = 'https://wa.me/212707902091?text=' + encodeURIComponent('السلام عليكم، أريد الوصول إلى PIIRMI ENGLISH التفاعلي (الإنجليزية للمواقف اليومية).')

export function PiirmiHome({ units, reviews, access, free, locked }: { units: UnitCard[]; reviews: [number, number][]; access: { name: string; until: string } | null; free: number[]; locked?: number }) {
  useFonts()
  const router = useRouter()
  const { progress } = useProgress('piirmi')
  const fs = useFullscreen()
  const zoom = useStageZoom(fs.on)
  const open = (n: number) => !!access || free.includes(n)
  const done = progress.done
  const next = useMemo(() => units.find(u => open(u.n) && !done.includes(u.n)) ?? units[0], [units, done, access]) // eslint-disable-line react-hooks/exhaustive-deps
  const pct = Math.round((done.length / units.length) * 100)

  async function signOut() {
    await fetch('/api/viiza/session', { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="min-h-screen" style={{ background: P.paper, fontFamily: EN, color: V.ink, zoom }}>
      <header className="sticky top-0 z-30" style={{ background: P.green }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6" dir="ltr">
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-extrabold tracking-[-0.02em]" style={{ color: V.saff }}>PIIRMI</span>
            <span className="text-[11px] font-extrabold tracking-[0.3em] text-white">ENGLISH</span>
            <Ar as="span" className="hidden text-[12px] font-bold text-white/75 sm:inline">· الإنجليزية للمواقف اليومية</Ar>
          </div>
          <div className="flex items-center gap-2">
            {fs.can && (
              <button onClick={fs.toggle} title={fs.on ? 'Exit full screen' : 'Full screen'} className="flex items-center gap-1.5 rounded-full border border-white/30 px-2.5 py-1.5 text-[12px] font-bold text-white hover:bg-white/10">
                {fs.on ? <Minimize size={14} /> : <Maximize size={14} />}<span className="hidden md:inline">{fs.on ? 'Exit' : 'Full screen'}</span>
              </button>
            )}
            {access
              ? <button onClick={signOut} className="flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-white/10"><LogOut size={14} /> Sign out</button>
              : <a href="#signin" className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-extrabold" style={{ background: V.saff, color: V.navy }}><KeyRound size={14} /> Enter your code</a>}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden text-white" style={{ background: `linear-gradient(150deg, ${P.green} 0%, ${P.greenD} 60%, ${V.navy} 140%)` }}>
        <div className="pointer-events-none absolute -left-16 -top-16 h-[260px] w-[260px] rounded-full opacity-10" style={{ border: '36px solid #fff' }} />
        <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-12 pt-8 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:pt-12">
          <div dir="ltr">
            <div className="text-[11px] font-extrabold tracking-[0.25em]" style={{ color: V.saff }}>EVERYDAY ENGLISH · A1 → A2 · 19 SITUATIONS</div>
            <h1 className="mt-2 text-[34px] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[46px]" style={{ color: '#fff', fontFamily: EN }}>English for<br />your everyday life.</h1>
            <Ar className="mt-3 text-[16px] font-bold leading-[1.8] text-white/85 sm:text-[18px]">من صباحك إلى المقهى والسوق والطبيب: كل كلمة بصورتها وصوتها، وكل جواب تتدرّب عليه، وفي آخر كل وحدة لعبة وملصق.</Ar>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={open(next.n) ? `/piirmi/${next.n}` : '#signin'} className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-[15px] font-extrabold shadow-lg transition active:scale-[0.97]" style={{ background: V.saff, color: V.navy }}>
                <Play size={18} /> {done.length ? 'Continue' : 'Start'} · Unit {pad2(next.n)}
              </Link>
              {open(next.n) && <Link href={`/piirmi/${next.n}#book`} className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/30 px-4 py-2.5 text-[14px] font-extrabold text-white transition hover:bg-white/10"><BookOpen size={17} /> Read it as a book</Link>}
            </div>
          </div>
          <div className="self-center rounded-3xl p-5 text-[#0E1240] shadow-2xl" style={{ background: '#fff' }} dir="ltr">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-[0.2em]" style={{ color: P.green }}>MY PROGRESS</span>
              <Sparkles size={18} color={V.saff} />
            </div>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-[56px] font-extrabold leading-none" style={{ color: P.green }}>{done.length}</span>
              <span className="pb-2 text-[15px] font-bold text-[#5B6474]">of {units.length} units done</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full" style={{ background: P.greenS }}><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: P.green }} /></div>
            <div className="mt-3 text-[11px] font-bold text-[#5B6474]">{access ? <>STUDENT · <span className="text-[#0E1240]">{access.name}</span> · UNTIL {access.until}</> : 'GUEST · Unit 1 is free to try'}</div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {!access && (
          <SignIn locked={locked} onDone={() => router.refresh()} product="piirmi" unitWord="الوحدة" whatsapp={WHATSAPP}
            title="افتح كتاب PIIRMI كاملًا"
            blurb="اكتب رمز الطالب الذي وصلك مع الكتاب (يبدأ بـ ING-). 19 موقفًا يوميًا، كل كلمة بصورتها وصوتها، تمارين تصحّح نفسها، وألعاب." />
        )}

        {/* Units, a review after each group */}
        {reviews.map(([from, to], r) => {
          const best = progress.best[`part:${r + 1}`], passed = (best ?? 0) >= 7
          return (
            <section key={r} className="mt-8">
              <div className="mb-3 flex items-center justify-between" dir="ltr">
                <h2 className="text-[19px] font-extrabold" style={{ color: P.green, fontFamily: EN }}>Units {from}–{to}</h2>
                <Ar as="span" className="text-[14px] font-bold" style={{ color: V.grey }}>{`الوحدات ${from}–${to}`}</Ar>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" dir="ltr">
                {units.filter(u => u.n >= from && u.n <= to).map(u => {
                  const can = open(u.n), isDone = done.includes(u.n)
                  const card = (
                    <div className={`relative flex h-full flex-col rounded-2xl p-4 transition ${can ? 'hover:-translate-y-0.5 hover:shadow-lg' : 'opacity-60'}`}
                      style={{ background: '#fff', boxShadow: '0 2px 14px rgba(14,18,64,0.07)', border: `2px solid ${isDone ? P.green : 'transparent'}` }}>
                      <div className="flex items-start justify-between">
                        <span className="text-[34px] leading-none">{u.icon}</span>
                        <span className="rounded-md px-1.5 py-[2px] text-[10px] font-extrabold" style={isDone ? { background: P.green, color: '#fff' } : can ? { background: P.greenS, color: P.green } : { background: '#EEE', color: '#888' }}>
                          {isDone ? <span className="flex items-center gap-0.5"><Check size={10} strokeWidth={3} /> DONE</span> : can ? (free.includes(u.n) && !access ? 'FREE' : `UNIT ${pad2(u.n)}`) : <span className="flex items-center gap-0.5"><Lock size={10} /> LOCKED</span>}
                        </span>
                      </div>
                      <div className="mt-3 text-[15px] font-extrabold leading-tight">{u.titleEn}</div>
                      <Ar className="mt-0.5 text-left text-[12.5px] font-semibold" style={{ color: V.grey }}>{u.titleAr}</Ar>
                    </div>
                  )
                  return can ? <Link key={u.n} href={`/piirmi/${u.n}`}>{card}</Link> : <a key={u.n} href="#signin">{card}</a>
                })}
                {(() => {
                  const inner = (
                    <div className="flex h-full flex-col justify-between rounded-2xl p-4" style={passed ? { background: V.saffS, border: `2px solid ${V.saff}` } : { background: P.green, color: '#fff' }}>
                      <Award size={30} color={passed ? V.saffD : V.saff} />
                      <div>
                        <div className="mt-2 text-[15px] font-extrabold">Review {r + 1} check</div>
                        <div className="text-[12px] font-bold opacity-80">{!access ? <span className="flex items-center gap-1"><Lock size={11} /> Locked</span> : best === undefined ? '10 questions' : `Best ${best}/10`}</div>
                      </div>
                    </div>
                  )
                  return access ? <Link href={`/piirmi/check/${r + 1}`}>{inner}</Link> : <a href="#signin">{inner}</a>
                })()}
              </div>
            </section>
          )
        })}

        {/* Sticker album */}
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between" dir="ltr">
            <h2 className="flex items-center gap-2 text-[20px] font-extrabold" style={{ color: V.navy, fontFamily: EN }}><Sparkles size={20} color={P.green} /> My sticker album</h2>
            <Ar as="span" className="text-[16px] font-extrabold" style={{ color: P.green }}>ألبوم ملصقاتي</Ar>
          </div>
          <div className="rounded-3xl p-4 sm:p-6" style={{ background: '#fff', border: `2px solid ${P.greenS}` }}>
            <Ar className="mb-4 text-[13.5px] font-semibold" style={{ color: V.grey }}>أنهِ وحدة (اضغط «ألصق الملصق» في آخر التمارين) لتحصل على ملصقها، ونجح في المراجعات لتحصل على الأختام الذهبية.</Ar>
            <div className="mb-5 grid grid-cols-4 gap-3" dir="ltr">
              {reviews.map((_, r) => {
                const on = (progress.best[`part:${r + 1}`] ?? 0) >= 7
                return (
                  <div key={r} className="flex flex-col items-center gap-1 rounded-2xl p-2 text-center" style={on ? { background: V.saffS, border: `2px solid ${V.saff}` } : { border: `2px dashed ${V.line}` }}>
                    <Award size={24} color={on ? V.saffD : '#C9C2B5'} />
                    <span className="text-[10.5px] font-extrabold tracking-[0.06em]" style={{ color: on ? V.saffD : '#B8B0A2' }}>REVIEW {r + 1}</span>
                  </div>
                )
              })}
            </div>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-7 lg:grid-cols-10" dir="ltr">
              {units.map((u, i) => {
                const on = done.includes(u.n)
                return (
                  <div key={u.n} className="flex aspect-square items-center justify-center">
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl text-center transition"
                      style={on ? { background: P.greenS, border: `2px solid ${P.green}`, transform: `rotate(${(i % 5) * 4 - 8}deg)` } : { border: `2px dashed ${V.line}` }}>
                      <span className="text-[26px] leading-none" style={on ? undefined : { filter: 'grayscale(1)', opacity: 0.35 }}>{u.icon}</span>
                      <span className="mt-0.5 text-[10px] font-extrabold" style={{ color: on ? P.green : '#C9C2B5' }}>{pad2(u.n)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
