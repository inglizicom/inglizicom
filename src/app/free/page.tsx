'use client'

/**
 * inglizi.com/free — the link that replaces wa.me in every bio.
 *
 * The problem this exists to fix: ~750K followers and ~6M views a month were
 * being sent straight into a WhatsApp chat with one human being. Anyone who was
 * not ready to buy *that day* was lost for ever, and the founder's own numbers
 * said the DMs were not coming.
 *
 * So the page does three things a chat cannot:
 *   1. GIVES FIRST — three chunks play out loud before anything is asked. The
 *      visitor hears the product working on their own ear inside ten seconds.
 *   2. CAPTURES — name + WhatsApp, straight into subscription_leads, where the
 *      CRM Kanban already lives. A lead who never replies is still a lead.
 *   3. DELIVERS INSTANTLY — the rest of the pack unlocks on the page. No email,
 *      no "check your inbox", no reason to bounce.
 *
 * ?src=tiktok|instagram|facebook tags the lead so the CRM can finally answer
 * "which platform actually sends buyers?" — which today nobody knows.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Volume2, Check, MessageCircle, Lock, Sparkles, Rabbit, Gauge, Turtle, Headphones, ArrowLeft,
} from 'lucide-react'
import { createSubscriptionLead, getAttribution } from '@/lib/leads-db'

const WA = '212764189311'
const BG = '#07070c'
const MINT = '#34d399'
const CYAN = '#22d3ee'

/* Each chunk carries BOTH forms: the careful one and the linked one natives
   actually say. The voice is given the linked text for the fast gears, so what
   the ear hears matches what the eye reads — the whole point of the method. */
type Chunk = { en: string; linked: string; say: string; ar: string }

const FREE: Chunk[] = [
  { en: 'What are you doing?', linked: 'Whaddaya doin?', say: 'wuh-duh-yuh-DOO-in', ar: 'ماذا تفعل؟' },
  { en: 'Nice to meet you.', linked: 'Nice ta meetcha.', say: 'NAIS-tuh-MEE-chuh', ar: 'سعيد بلقائك.' },
  { en: 'I have to go now.', linked: 'I hafta go now.', say: 'ai-HAF-tuh-GOH-NOW', ar: 'يجب أن أذهب الآن.' },
]

const LOCKED: Chunk[] = [
  { en: 'Where are you from?', linked: 'Wherarya from?', say: 'wuh-ruh-yuh-FRUHM', ar: 'من أين أنت؟' },
  { en: 'Sorry, I didn’t catch that.', linked: 'Sorry, I didn catchat.', say: 'SAA-ree-ai-din-KAA-chaat', ar: 'عذرًا، لم أفهم.' },
  { en: 'Can I get a coffee?', linked: 'Kn-I geda coffee?', say: 'kn-ai-GE-duh-KAA-fee', ar: 'هل يمكنني قهوة؟' },
  { en: 'I’m going to call you later.', linked: 'I’m gonna call ya later.', say: 'aim-GUH-nuh-KAWL-yuh-LAY-duh', ar: 'سأتّصل بك لاحقًا.' },
  { en: 'What do you think?', linked: 'Whaddaya think?', say: 'wuh-duh-yuh-THINK', ar: 'ما رأيك؟' },
  { en: 'A cup of tea.', linked: 'A cuppa tea.', say: 'uh-KU-puh-TEE', ar: 'فنجان شاي.' },
  { en: 'I don’t know.', linked: 'I dunno.', say: 'ai-doh-NOH', ar: 'لا أعرف.' },
  { en: 'Did you see it?', linked: 'Didja see it?', say: 'DI-juh-SEE-it', ar: 'هل رأيته؟' },
  { en: 'It’s a lot of work.', linked: 'It’s a lotta work.', say: 'i-tsuh-LAA-duh-WERK', ar: 'إنه عمل كثير.' },
  { en: 'Let me check.', linked: 'Lemme check.', say: 'le-mee-CHEK', ar: 'دعني أتحقّق.' },
  { en: 'How is it going?', linked: 'How’zit goin?', say: 'how-zi-GOH-ing', ar: 'كيف تسير الأمور؟' },
  { en: 'I’ll get back to you.', linked: 'I’ll get back ta ya.', say: 'al-get-BAAK-tuh-yuh', ar: 'سأعاود التواصل معك.' },
  { en: 'My brother and I.', linked: 'My brotheran I.', say: 'muh-BRUH-thuh-ruh-nai', ar: 'أنا وأخي.' },
  { en: 'Take it easy.', linked: 'Take it easy.', say: 'tay-ki-DEE-zee', ar: 'خذ الأمر ببساطة.' },
  { en: 'What did you say?', linked: 'Whatja say?', say: 'wuh-juh-SAY', ar: 'ماذا قلت؟' },
]

const GEARS = [
  { g: 'clear', label: 'واضح', Icon: Volume2, linked: false },
  { g: 'slow', label: 'مترابط ببطء', Icon: Turtle, linked: true },
  { g: 'natural', label: 'متوسط', Icon: Gauge, linked: true },
  { g: 'fast', label: 'سرعة الناطق', Icon: Rabbit, linked: true },
] as const

function ChunkCard({ c, locked }: { c: Chunk; locked?: boolean }) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const [on, setOn] = useState<string | null>(null)
  useEffect(() => { if (!on) return; const t = setTimeout(() => setOn(null), 1800); return () => clearTimeout(t) }, [on])
  const play = (g: string, linked: boolean) => {
    const a = audio.current ?? (audio.current = new Audio())
    a.pause()
    a.playbackRate = g === 'fast' ? 1.12 : 1
    ;(a as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true
    a.src = `/api/tts?g=${g}&t=${encodeURIComponent(linked ? c.linked : c.en)}`
    setOn(g)
    a.play().catch(() => setOn(null))
  }
  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', boxShadow: `inset 0 0 0 1.5px ${locked ? 'rgba(255,255,255,0.07)' : 'rgba(52,211,153,0.25)'}` }}>
      <div dir="ltr" className="text-center font-black text-white" style={{ fontSize: 22 }}>{c.en}</div>
      <div dir="ltr" className="text-center font-black mt-1" style={{ color: CYAN, fontSize: 17 }}>{c.linked}</div>
      <div dir="ltr" className="text-center font-bold mt-1" style={{ color: 'rgba(244,244,245,0.45)', fontSize: 14 }}>{c.say}</div>
      <div className="text-center font-bold mt-1" style={{ color: 'rgba(244,244,245,0.55)', fontSize: 14 }}>{c.ar}</div>
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {GEARS.map(x => (
          <button key={x.g} onClick={() => play(x.g, x.linked)}
            className="flex flex-col items-center gap-1 rounded-xl py-2 transition active:scale-95"
            style={{
              background: on === x.g ? MINT : 'rgba(255,255,255,0.06)',
              color: on === x.g ? BG : 'rgba(244,244,245,0.75)',
            }}>
            <x.Icon size={15} />
            <span style={{ fontSize: 10, fontWeight: 800 }}>{x.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function FreePack() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [src, setSrc] = useState('direct')

  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get('src')
    if (s) setSrc(s.toLowerCase().replace(/[^a-z_]/g, '').slice(0, 20) || 'direct')
    try { if (localStorage.getItem('inglizi.free.done') === '1') setDone(true) } catch { /* private mode */ }
  }, [])

  const waAfter = useMemo(() => {
    const msg = `السلام عليكم، اسمي ${name || ''}. أخذت باقة الجمل المجانية وأريد معرفة تفاصيل دورة النطق.`
    return `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`
  }, [name])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (name.trim().length < 2) { setErr('الرجاء إدخال اسمك.'); return }
    if (phone.replace(/\D/g, '').length < 8) { setErr('الرجاء إدخال رقم واتساب صحيح.'); return }
    setBusy(true)
    try {
      await createSubscriptionLead({
        planId: 'free_chunks',
        fullName: name.trim(),
        phone: phone.trim(),
        source: src,                       // tiktok · instagram · facebook · direct
        planInterest: 'باقة ١٠٠ جملة مجانية — دورة النطق',
        notes: `باقة الجمل المجانية · المصدر: ${src}`,
        pagePath: '/free',
        ...getAttribution(),
      })
      try { localStorage.setItem('inglizi.free.done', '1') } catch { /* private mode */ }
      setDone(true)
    } catch (e) { setErr((e as Error).message || 'حدث خطأ، حاول مرة أخرى.') }
    setBusy(false)
  }

  return (
    <main dir="rtl" style={{ background: BG, color: '#f4f4f5', minHeight: '100vh', fontFamily: "'Tajawal', sans-serif" }}>
      <div className="pointer-events-none fixed -top-40 -right-32 w-[80vw] h-[80vw] max-w-[520px] max-h-[520px] rounded-full blur-3xl" style={{ background: 'rgba(52,211,153,0.18)' }} />
      <div className="pointer-events-none fixed -bottom-52 -left-32 w-[80vw] h-[80vw] max-w-[520px] max-h-[520px] rounded-full blur-3xl" style={{ background: 'rgba(34,211,238,0.14)' }} />

      <div className="relative max-w-lg mx-auto px-5 py-10">
        {/* hero */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-black"
            style={{ background: 'rgba(52,211,153,0.14)', color: MINT, fontSize: 12 }}>
            <Sparkles size={13} /> مجانًا — بلا بريد إلكتروني، بلا تسجيل
          </span>
          <h1 className="mt-4 font-black leading-tight" style={{ fontSize: 30 }}>
            ١٠٠ جملة أمريكية<br />تُنطق ككلمة واحدة
          </h1>
          <p className="mt-3 font-bold leading-relaxed" style={{ color: 'rgba(244,244,245,0.6)', fontSize: 15 }}>
            سبب عدم فهمك للكلام السريع ليس ضعف مفرداتك — بل أن الأمريكي يلصق الكلمات ببعضها.
            اسمع كل جملة بأربع سرعات، وقلّدها. هذا كل شيء.
          </p>
          <div dir="ltr" className="mt-4 flex items-center justify-center gap-2 font-black" style={{ color: 'rgba(244,244,245,0.35)', fontSize: 12 }}>
            <span>Where are you from?</span>
            <ArrowLeft size={14} />
            <span style={{ color: CYAN }}>Wherarya from?</span>
          </div>
        </div>

        {/* give first — three chunks that play before anything is asked */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Headphones size={16} style={{ color: MINT }} />
            <span className="font-black" style={{ fontSize: 14 }}>جرّبها الآن — اضغط أي سرعة</span>
          </div>
          <div className="flex flex-col gap-3">
            {FREE.map((c, i) => <ChunkCard key={i} c={c} />)}
          </div>
        </div>

        {/* capture */}
        <div id="get" className="mt-8 rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.05)', boxShadow: `inset 0 0 0 1.5px ${done ? MINT : 'rgba(255,255,255,0.10)'}` }}>
          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl grid place-items-center mb-3" style={{ background: MINT, color: BG }}>
                <Check size={28} strokeWidth={3} />
              </div>
              <h2 className="font-black" style={{ fontSize: 20 }}>تمّ فتح الباقة كاملة 🎉</h2>
              <p className="mt-2 font-bold" style={{ color: 'rgba(244,244,245,0.6)', fontSize: 14 }}>
                الجمل تحتك مباشرة. للحصول على الدورة كاملة وتصحيح نطقك صوتيًا:
              </p>
              <a href={waAfter} target="_blank" rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 font-black transition active:scale-95"
                style={{ background: MINT, color: BG, fontSize: 15 }}>
                <MessageCircle size={18} /> تحدّث معنا على واتساب
              </a>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h2 className="font-black text-center" style={{ fontSize: 19 }}>افتح الـ٩٧ جملة الباقية</h2>
              <p className="mt-1.5 text-center font-bold" style={{ color: 'rgba(244,244,245,0.55)', fontSize: 13.5 }}>
                اكتب اسمك ورقمك وتُفتح لك فورًا في هذه الصفحة.
              </p>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="الاسم الكامل"
                className="mt-4 w-full rounded-xl px-4 py-3 font-bold outline-none"
                style={{ background: 'rgba(0,0,0,0.35)', color: '#fff', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.12)', fontSize: 15 }} />
              <input value={phone} onChange={e => setPhone(e.target.value)} inputMode="tel" placeholder="رقم الواتساب (مع رمز الدولة)"
                dir="ltr" className="mt-2.5 w-full rounded-xl px-4 py-3 font-bold outline-none text-right"
                style={{ background: 'rgba(0,0,0,0.35)', color: '#fff', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.12)', fontSize: 15 }} />
              {err && <div className="mt-2 font-bold" style={{ color: '#fb7185', fontSize: 13 }}>{err}</div>}
              <button type="submit" disabled={busy}
                className="mt-3 w-full rounded-xl py-3.5 font-black transition active:scale-95 disabled:opacity-60"
                style={{ background: MINT, color: BG, fontSize: 16 }}>
                {busy ? '…جارٍ الفتح' : 'افتح الباقة مجانًا'}
              </button>
              <p className="mt-2.5 text-center font-bold" style={{ color: 'rgba(244,244,245,0.35)', fontSize: 11.5 }}>
                لن نرسل لك رسائل مزعجة. رقمك يُستعمل للتواصل بخصوص الدورات فقط.
              </p>
            </form>
          )}
        </div>

        {/* the rest of the pack */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            {done ? <Check size={16} style={{ color: MINT }} /> : <Lock size={16} style={{ color: 'rgba(244,244,245,0.4)' }} />}
            <span className="font-black" style={{ fontSize: 14 }}>{done ? 'الباقة الكاملة' : 'مقفلة — افتحها من الأعلى'}</span>
          </div>
          <div className="flex flex-col gap-3" style={done ? undefined : { filter: 'blur(6px)', pointerEvents: 'none', opacity: 0.5 }}>
            {LOCKED.map((c, i) => <ChunkCard key={i} c={c} locked={!done} />)}
          </div>
          {done && (
            <p className="mt-4 text-center font-bold" style={{ color: 'rgba(244,244,245,0.45)', fontSize: 13 }}>
              باقي الجمل تصلك على واتساب — والدورة الكاملة فيها ٤٥ درسًا وتصحيح صوتي لتسجيلاتك.
            </p>
          )}
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="font-black" style={{ color: 'rgba(244,244,245,0.4)', fontSize: 13 }}>inglizi.com — أكاديمية إنجليزي الدولية</Link>
        </div>
      </div>
    </main>
  )
}
