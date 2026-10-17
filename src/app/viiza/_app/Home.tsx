'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, Check, ChevronLeft, KeyRound, Loader2, Lock, LogOut, MessageCircle, Plane, Stamp } from 'lucide-react'
import { Ar, EN, Ico, V, pad2, useFonts, useProgress } from './kit'

/**
 * VIIZA interactive, the journey: sign in with the student's token, then the
 * 34 stops on a departure board by part, the next stop to open, and the
 * passport, which collects a stamp for every stop finished. Without access
 * the free sample stops stay open and the others show a lock.
 */

export interface StopCard { n: number; part: number; titleEn: string; titleAr: string; icon: string }
export interface PartCard { n: number; titleEn: string; titleAr: string; icon: string }

const WHATSAPP = 'https://wa.me/212707902091?text=' + encodeURIComponent('السلام عليكم، أريد الوصول إلى VIIZA ENGLISH التفاعلي (دليل السفر).')

const REASON: Record<string, string> = {
  invalid: 'الرمز غير صحيح. تأكّد منه كما وصلك (مثال: ING-1A2B3C4D).',
  no_access: 'رمزك صحيح، لكن VIIZA التفاعلي غير مفعّل لك بعد. تواصل معنا لتفعيله.',
  expired: 'انتهت مدة وصولك إلى VIIZA التفاعلي. تواصل معنا لتجديدها.',
  device_limit: 'هذا الرمز مستعمل على أجهزة أخرى. تواصل معنا لإضافة هذا الجهاز.',
  error: 'حدث خطأ في الاتصال. حاول مرة أخرى بعد لحظات.',
}

function deviceId(): string {
  const K = 'inglizi.device_id'
  let id = ''
  try { id = localStorage.getItem(K) || '' } catch {}
  if (!id) { id = crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`; try { localStorage.setItem(K, id) } catch {} }
  return id
}
function deviceLabel(): string {
  const ua = navigator.userAgent
  const os = /iPhone|iPad/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'جهاز'
  return `${os} · VIIZA`
}

export function Home({ parts, stops, access, free, locked }: { parts: PartCard[]; stops: StopCard[]; access: { name: string; until: string } | null; free: number[]; locked?: number }) {
  useFonts()
  const router = useRouter()
  const { progress } = useProgress()
  const open = (n: number) => !!access || free.includes(n)
  const done = progress.done
  const next = useMemo(() => stops.find(s => open(s.n) && !done.includes(s.n)) ?? stops[0], [stops, done, access])
  const pct = Math.round((done.length / stops.length) * 100)

  async function signOut() {
    await fetch('/api/viiza/session', { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="min-h-screen" style={{ background: V.paper, fontFamily: EN, color: V.ink }}>
      {/* Top bar */}
      <header className="sticky top-0 z-30" style={{ background: V.navy }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6" dir="ltr">
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-extrabold tracking-[-0.02em]" style={{ color: V.saff }}>VIIZA</span>
            <span className="text-[11px] font-extrabold tracking-[0.3em] text-white">ENGLISH</span>
            <Ar as="span" className="hidden text-[12px] font-bold text-white/70 sm:inline">· دليل السفر التفاعلي</Ar>
          </div>
          {access ? (
            <div className="flex items-center gap-3">
              <Ar as="span" className="hidden max-w-[180px] truncate text-[13px] font-bold text-white sm:inline">{`أهلًا ${access.name.split(' ')[0]}`}</Ar>
              <button onClick={signOut} className="flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-[12px] font-bold text-white/85 hover:bg-white/10"><LogOut size={14} /> Sign out</button>
            </div>
          ) : (
            <a href="#signin" className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-extrabold" style={{ background: V.saff, color: V.navy }}><KeyRound size={14} /> Enter your code</a>
          )}
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: `linear-gradient(160deg, ${V.navy} 0%, ${V.navy2} 55%, ${V.redD} 140%)` }} className="relative overflow-hidden text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-[320px] w-[320px] rounded-full opacity-[0.07]" style={{ border: '40px solid #fff' }} />
        <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-10 pt-8 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:pb-14 lg:pt-12">
          <div dir="ltr">
            <div className="text-[11px] font-extrabold tracking-[0.25em]" style={{ color: V.saff }}>YOUR JOURNEY · 34 STOPS</div>
            <h1 className="mt-2 text-[34px] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[46px]" style={{ color: "#fff", fontFamily: EN }}>From the visa form<br />to your front door.</h1>
            <Ar className="mt-3 text-[16px] font-bold leading-[1.8] text-white/85 sm:text-[18px]">كل جملة تسمعها بضغطة، وكل تمرين يصحّح نفسه، وفي آخر كل محطة لعبة وختم في جوازك.</Ar>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={open(next.n) ? `/viiza/${next.n}` : '#signin'} className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-[15px] font-extrabold shadow-lg transition active:scale-[0.97]" style={{ background: V.saff, color: V.navy }}>
                <Plane size={18} /> {done.length ? 'Continue' : 'Start'} · Stop {pad2(next.n)}
              </Link>
              {open(next.n) && <Link href={`/viiza/${next.n}#book`} className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/30 px-4 py-2.5 text-[14px] font-extrabold text-white transition hover:bg-white/10 active:scale-[0.97]"><BookOpen size={17} /> Read it as a book</Link>}
            </div>
          </div>
          {/* Boarding pass */}
          <div className="relative self-center rounded-3xl p-5 text-[#0E1240] shadow-2xl" style={{ background: V.cream }} dir="ltr">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-[0.2em]" style={{ color: V.red }}>BOARDING PASS</span>
              <span className="text-[11px] font-extrabold tracking-[0.2em] text-[#5B6474]">LEVEL 3 · A2 → B1</span>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div><div className="text-[10px] font-bold text-[#5B6474]">FROM</div><div className="text-[30px] font-extrabold leading-none">HOME</div></div>
              <Plane size={26} color={V.red} />
              <div className="text-right"><div className="text-[10px] font-bold text-[#5B6474]">TO</div><div className="text-[30px] font-extrabold leading-none">WORLD</div></div>
            </div>
            <div className="my-4 border-t-2 border-dashed" style={{ borderColor: V.line }} />
            <div className="grid grid-cols-3 gap-2 text-center">
              {[['STAMPS', `${done.length}/34`], ['PROGRESS', `${pct}%`], ['NEXT', `STOP ${pad2(next.n)}`]].map(([k, v]) => (
                <div key={k}><div className="text-[10px] font-bold text-[#5B6474]">{k}</div><div className="text-[18px] font-extrabold">{v}</div></div>
              ))}
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ background: V.line }}><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: V.red }} /></div>
            <div className="mt-3 text-[11px] font-bold text-[#5B6474]">{access ? <>PASSENGER · <span className="text-[#0E1240]">{access.name}</span> · VALID UNTIL {access.until}</> : 'PASSENGER · GUEST (Stop 1 is free to try)'}</div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {!access && <SignIn locked={locked} onDone={() => router.refresh()} />}

        {/* Departure board */}
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between" dir="ltr">
            <h2 className="flex items-center gap-2 text-[20px] font-extrabold" style={{ color: V.navy, fontFamily: EN }}><Plane size={20} color={V.red} /> Departures</h2>
            <Ar as="span" className="text-[16px] font-extrabold" style={{ color: V.red }}>لوحة المغادرة</Ar>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {parts.map(p => (
              <div key={p.n} className="overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(14,18,64,0.12)]" style={{ background: V.navy }}>
                <div className="flex items-center justify-between px-4 py-2.5" dir="ltr" style={{ background: V.navy3 }}>
                  <span className="flex items-center gap-2 text-[12px] font-extrabold tracking-[0.14em] text-white"><Ico name={p.icon} size={15} color={V.saff} /> PART {p.n} · {p.titleEn.toUpperCase()}</span>
                  <Ar as="span" className="text-[13px] font-bold" style={{ color: V.saff }}>{p.titleAr}</Ar>
                </div>
                <div className="divide-y divide-white/10">
                  {stops.filter(s => s.part === p.n).map(s => {
                    const isDone = done.includes(s.n), can = open(s.n), isNext = s.n === next.n && can
                    const row = (
                      <div className={`flex items-center gap-3 px-4 py-2.5 transition ${can ? 'hover:bg-white/5' : 'opacity-60'}`} dir="ltr">
                        <span className="w-[30px] text-[15px] font-extrabold tabular-nums" style={{ color: V.saff, fontFamily: 'ui-monospace, Consolas, monospace' }}>{pad2(s.n)}</span>
                        <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-white/10"><Ico name={s.icon} size={16} color="#fff" /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-bold text-white">{s.titleEn}</span>
                          <Ar as="span" className="block truncate text-left text-[11.5px] font-semibold text-white/55">{s.titleAr}</Ar>
                        </span>
                        <span className="shrink-0 rounded-md px-2 py-[3px] text-[10.5px] font-extrabold tracking-[0.08em]" style={
                          isDone ? { background: '#1E8E5A', color: '#fff' } : isNext ? { background: V.saff, color: V.navy } : can ? { background: 'rgba(255,255,255,0.12)', color: '#fff' } : { background: 'transparent', color: 'rgba(255,255,255,0.6)' }}>
                          {isDone ? <span className="flex items-center gap-1"><Check size={11} strokeWidth={3} /> DONE</span> : isNext ? 'BOARDING' : can ? (free.includes(s.n) && !access ? 'FREE' : 'OPEN') : <span className="flex items-center gap-1"><Lock size={11} /> LOCKED</span>}
                        </span>
                      </div>
                    )
                    return can ? <Link key={s.n} href={`/viiza/${s.n}`}>{row}</Link> : <a key={s.n} href="#signin">{row}</a>
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Passport */}
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between" dir="ltr">
            <h2 className="flex items-center gap-2 text-[20px] font-extrabold" style={{ color: V.navy, fontFamily: EN }}><Stamp size={20} color={V.red} /> My passport</h2>
            <Ar as="span" className="text-[16px] font-extrabold" style={{ color: V.red }}>جواز سفري</Ar>
          </div>
          <div className="rounded-3xl p-4 sm:p-6" style={{ background: '#fff', border: `2px solid ${V.line}` }}>
            <Ar className="mb-4 text-[13.5px] font-semibold" style={{ color: V.grey }}>أنهِ محطة (افتح أقسامها الستة واضغط «اختم جوازي» في آخر التمارين) لتحصل على ختمها.</Ar>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-9">
              {stops.map((s, i) => {
                const on = done.includes(s.n)
                const color = [V.red, V.navy, V.green, V.saffD][i % 4]
                return (
                  <div key={s.n} className="flex aspect-square items-center justify-center">
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-full text-center transition"
                      style={on ? { border: `3px double ${color}`, color, transform: `rotate(${(i % 5) * 7 - 14}deg)`, background: 'rgba(255,255,255,0.6)' } : { border: `2px dashed ${V.line}`, color: '#C9C2B5' }}>
                      <Ico name={s.icon} size={18} color={on ? color : '#C9C2B5'} />
                      <span className="mt-0.5 text-[10px] font-extrabold tracking-[0.06em]">{pad2(s.n)}</span>
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

function SignIn({ locked, onDone }: { locked?: number; onDone: () => void }) {
  const [token, setToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit() {
    if (!token.trim()) return
    setBusy(true); setErr('')
    try {
      const r = await fetch('/api/viiza/session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, deviceId: deviceId(), label: deviceLabel() }) })
      const j = await r.json().catch(() => ({}))
      if (j.ok) onDone()
      else setErr(REASON[j.reason] ?? REASON.error)
    } catch { setErr(REASON.error) }
    setBusy(false)
  }

  return (
    <section id="signin" className="relative -mt-6 rounded-3xl p-5 shadow-[0_10px_40px_rgba(14,18,64,0.18)] sm:p-7" style={{ background: '#fff', border: `2px solid ${V.saff}` }}>
      {locked && <Ar className="mb-3 rounded-xl px-3 py-2 text-[13.5px] font-bold" style={{ background: V.saffS, color: V.saffD }}>{`المحطة ${locked} مقفلة. ادخل رمزك لتفتح الدليل كاملًا.`}</Ar>}
      <div className="grid items-center gap-5 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Ar className="text-[22px] font-extrabold leading-snug">افتح دليل السفر كاملًا</Ar>
          <Ar className="mt-1.5 text-[14px] font-semibold leading-[1.8]" style={{ color: V.grey }}>اكتب رمز الطالب الذي وصلك مع الكتاب (يبدأ بـ ING-). 34 محطة، كل جملة بصوتها، تمارين تصحّح نفسها، وألعاب.</Ar>
        </div>
        <div>
          <div className="flex gap-2" dir="ltr">
            <input value={token} onChange={e => setToken(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="ING-XXXXXXXX" autoCapitalize="characters" autoComplete="off" spellCheck={false}
              className="min-w-0 flex-1 rounded-xl border-2 px-4 py-3 text-[17px] font-extrabold tracking-[0.12em] outline-none focus:border-[#0E1240]" style={{ borderColor: V.line, fontFamily: 'ui-monospace, Consolas, monospace' }} />
            <button onClick={submit} disabled={busy} className="flex shrink-0 items-center gap-2 rounded-xl px-5 text-[15px] font-extrabold text-white disabled:opacity-60" style={{ background: V.navy }}>
              {busy ? <Loader2 size={18} className="animate-spin" /> : <>Open <ChevronLeft size={18} className="rotate-180" /></>}
            </button>
          </div>
          {err && <Ar className="mt-2 text-[13px] font-bold" style={{ color: V.red }}>{err}</Ar>}
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-[13px] font-bold" style={{ color: V.green }}>
            <MessageCircle size={16} /> <Ar as="span">ليس لديك رمز؟ اطلب الوصول عبر واتساب</Ar>
          </a>
        </div>
      </div>
    </section>
  )
}
