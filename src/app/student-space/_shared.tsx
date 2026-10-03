'use client'

/* Student space — shared helpers and small presentational pieces, split out of
   page.tsx so the page holds state and flow, not every card it draws. */

import { Component, type ReactNode, useEffect, useState } from 'react'
import {
  Loader2, KeyRound, BookOpen, FileText, Download, CheckCircle2, Circle, PlayCircle, Lock, Video,
  PenLine, HelpCircle, Mic, ChevronLeft, ChevronRight, Clock, Play,
} from 'lucide-react'
import {
  type CatalogCourse, type PortalLesson, type PortalCourse, isExerciseDone, EXERCISE_KIND_AR,
  EXERCISE_STATUS_AR, type ExerciseItem,
} from '@/lib/student-portal'
import { CORRECTOR_WHATSAPP } from '@/lib/lms'
import { courseTheme, themeForKey } from '@/lib/course-theme'
import { PROMO_CATALOG, MAX_DISCOUNT_PCT, seatsLeftThisMonth, type PromoCourse } from '@/data/course-catalog'

export const isVideoUrl = (u?: string | null) => !!u && /(youtube\.com|youtu\.be)/i.test(u)
export const ytId = (u?: string | null) => {
  const m = (u || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/))([\w-]{11})/) || (u || '').match(/[?&]v=([\w-]{11})/)
  return m ? m[1] : null
}
export const ytThumb = (u?: string | null) => { const id = ytId(u); return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null }
/* AI-generated topical illustration (keyless, URL-based). We overlay the Arabic
   title as real HTML text on top — AI renders Arabic glyphs poorly, so we ask
   for "no text" art and add the words ourselves. Seed = lesson id → stable image. */
export const aiThumb = (topic: string, seed: string) => {
  const prompt = `vibrant colorful cartoon illustration, English language learning scene about "${topic}", happy cartoon people and everyday objects, lively detailed background, playful professional vector art, bright lighting, no text, no letters, no words`
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=640&height=360&nologo=true&model=flux&seed=${encodeURIComponent(seed)}`
}
export const NOTIF_SEEN_KEY = 'inglizi.notif_seen'

/* Calendar day in the STUDENT's own timezone. `created_at` is UTC, so slicing the
   ISO string would put a Gulf student's late-night session on the previous day —
   the week grid and the streak would silently skip it. */
export const localDay = (d: Date | string) => {
  const t = typeof d === 'string' ? new Date(d) : d
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}
export const fmtShort = (s?: string | null) => s ? new Date(s).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric' }) : '—'
export const fmtTime  = (s?: string | null) => s ? new Date(s).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' }) : ''
export const initialsOf = (name: string) => { const p = (name || '').trim().split(/\s+/); return ((p[0]?.[0] ?? '?') + (p[1]?.[0] ?? '')).toUpperCase() }
export const hueOf = (name: string) => { let h = 0; for (const c of name || '') h = (h * 31 + c.charCodeAt(0)) % 360; return h }
export function InitAva({ name, className }: { name: string; className?: string }) {
  const h = hueOf(name)
  return (
    <div className={`flex items-center justify-center font-black text-white ${className ?? ''}`}
      style={{ background: `linear-gradient(135deg, hsl(${h} 60% 52%), hsl(${(h + 40) % 360} 58% 42%))` }}>
      {initialsOf(name)}
    </div>
  )
}
export const DAY_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

export type Tab = 'home' | 'courses' | 'profile' | 'path' | 'tasks' | 'rewards' | 'files' | 'progress'
export const TABS: Tab[] = ['home', 'courses', 'profile', 'path', 'tasks', 'rewards', 'files', 'progress']
export const tabFromHash = (): Tab | null => { const b = (typeof window !== 'undefined' ? (location.hash || '').replace('#', '').split('/')[0] : '') as Tab; return TABS.includes(b) ? b : null }
export const TOKEN_KEY = 'inglizi.student_token'
export const HEARTBEAT_AR: Record<Tab, string> = {
  home: 'الرئيسية', courses: 'دوراتي', profile: 'ملفي', path: 'مسار التعلّم', tasks: 'المهام',
  rewards: 'المكافآت', files: 'الملفات', progress: 'صفحة التقدّم',
}
export const COURSE_KEY = 'inglizi.student_course.'   // + token → last chosen course id
export const LTYPE_ICON: Record<string, any> = { video: Video, reading: FileText, exercise: PenLine, quiz: HelpCircle, speaking: Mic }
export const LTYPE_AR: Record<string, string> = { video: 'فيديو', reading: 'قراءة', exercise: 'تمرين', quiz: 'اختبار', speaking: 'محادثة' }
export const ACTIVITY = {
  login:              { ar: 'تسجيل دخول', icon: KeyRound, tone: 'text-zinc-500' },
  opened_lesson:      { ar: 'شاهد درسًا', icon: Video, tone: 'text-violet-500' },
  completed_lesson:   { ar: 'أكمل درسًا', icon: CheckCircle2, tone: 'text-emerald-500' },
  opened_exercise:    { ar: 'فتح تمرينًا', icon: PenLine, tone: 'text-amber-500' },
  completed_exercise: { ar: 'أكمل تمرينًا', icon: CheckCircle2, tone: 'text-emerald-500' },
  downloaded_file:    { ar: 'حمّل ملفًا', icon: Download, tone: 'text-rose-500' },
  opened_today_task:  { ar: 'بدأ مهمة اليوم', icon: PlayCircle, tone: 'text-blue-500' },
} as Record<string, { ar: string; icon: any; tone: string }>

export const pct = (d: number, t: number) => t > 0 ? Math.round((d / t) * 100) : 0

export function Ring({ pct }: { pct: number }) {
  const r = 26, c = 2 * Math.PI * r, off = c - (pct / 100) * c
  return (
    <div className="relative w-[72px] h-[72px] flex-shrink-0">
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="6" />
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--ic-gold)" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-[16px] font-black text-white">{pct}%</span><span className="text-[8px] text-zinc-400">التقدم</span></div>
    </div>
  )
}
export function HeroStat({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return <div className="bg-white/[0.06] rounded-xl p-2.5 text-center"><Icon size={14} className="text-[var(--ic-gold)] mx-auto mb-1" /><div className="font-black text-[14px] text-white">{value}</div><div className="text-[9px] text-zinc-400 leading-tight">{label}</div></div>
}
export function Card({ title, sub, icon: Icon, iconColor, action, children, compact }: { title: string; sub?: string; icon: any; iconColor: string; action?: ReactNode; children: ReactNode; compact?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100/80 p-4 shadow-[0_2px_12px_rgba(58,40,23,0.06)]">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-zinc-100">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-[var(--ic-cream)] border border-amber-100/70 flex items-center justify-center flex-shrink-0"><Icon size={15} className={iconColor} /></span>
          <div className="min-w-0"><h3 className="font-black text-[14.5px] text-[var(--ic-dark-2)] truncate">{title}</h3>{sub && <p className="text-[11px] text-zinc-400 truncate">{sub}</p>}</div>
        </div>
        {action}
      </div>
      <div className={compact ? 'divide-y divide-zinc-50' : ''}>{children}</div>
    </div>
  )
}
/* AI-illustrated lesson thumbnail with a crisp Arabic title overlay.
   If the AI image fails/slow, it falls back to the real video frame — never a plain colour. */
export function LessonThumb({ title, topic, chip, seed, videoUrl, onClick }: { title: string; topic?: string | null; chip?: string; seed: string; videoUrl?: string | null; onClick?: () => void }) {
  const yt = ytThumb(videoUrl)
  // Only promise a video when there actually is one — otherwise the badge, the play
  // button and "ابدأ المشاهدة" advertise something the lesson cannot deliver.
  const hasVideo = isVideoUrl(videoUrl)
  const [src, setSrc] = useState(aiThumb(topic || title, seed))
  const [loaded, setLoaded] = useState(false)
  const [triedYt, setTriedYt] = useState(false)
  function onErr() {
    if (yt && !triedYt) { setTriedYt(true); setLoaded(false); setSrc(yt) }  // real video frame fallback
  }
  return (
    <button onClick={onClick} className="group relative block w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-500 to-amber-400 ring-1 ring-black/5 shadow-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" onLoad={() => setLoaded(true)} onError={onErr}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-[800ms] group-hover:scale-[1.07] ${loaded ? 'opacity-100' : 'opacity-0'}`} />
      {!loaded && <span className="absolute inset-0 flex items-center justify-center"><Loader2 size={22} className="animate-spin text-white/80" /></span>}
      {/* cinematic gradient for legible text */}
      <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/10" />
      <span className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
      {/* video tag + module chip */}
      <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 text-[10px] font-bold bg-black/55 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
        {hasVideo ? <><Play size={9} fill="currentColor" /> فيديو</> : <><BookOpen size={9} /> درس</>}
      </span>
      {chip && <span className="absolute top-2.5 right-2.5 text-[10px] font-bold bg-[var(--ic-gold)] text-black px-2 py-0.5 rounded-full">{chip}</span>}
      <span className="absolute inset-x-0 bottom-0 p-3.5 text-right">
        <span className="block text-white font-black text-[15px] leading-snug line-clamp-2 drop-shadow-lg">{title}</span>
        <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--ic-gold)]">{hasVideo ? 'ابدأ المشاهدة' : 'ابدأ الدرس'} <ChevronLeft size={12} /></span>
      </span>
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30 transition-transform group-hover:scale-110">
          <span className="w-11 h-11 rounded-full bg-[var(--ic-gold)] flex items-center justify-center shadow-lg vp-pulse">
            {hasVideo
              ? <Play size={22} className="text-black" fill="currentColor" style={{ marginInlineStart: 2 }} />
              : <BookOpen size={20} className="text-black" />}
          </span>
        </span>
      </span>
    </button>
  )
}
export function TaskCard({ tone, icon: Icon, title, meta, cta, onClick, thumb }: { tone: string; icon: any; title: string; meta: string; cta: string; onClick: () => void; thumb?: string | null }) {
  const tones: Record<string, string> = { violet: 'bg-violet-50 text-violet-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', blue: 'bg-blue-50 text-blue-600' }
  const btns: Record<string, string> = { violet: 'bg-violet-100 text-violet-700', emerald: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700', blue: 'bg-blue-100 text-blue-700' }
  return (
    <button onClick={onClick} className="group rounded-2xl border border-zinc-100 p-3 text-center hover:border-zinc-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {thumb ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <span className="absolute inset-0 bg-black/15 flex items-center justify-center"><span className="w-9 h-9 rounded-full bg-[var(--ic-gold)] flex items-center justify-center"><Icon size={16} className="text-black" /></span></span>
        </div>
      ) : (
        <div className={`w-10 h-10 rounded-full ${tones[tone]} flex items-center justify-center mx-auto mb-2 transition-transform group-hover:scale-110`}><Icon size={18} /></div>
      )}
      <div className="font-bold text-[13px] text-zinc-800">{title}</div>
      <div className="text-[10px] text-zinc-400 mb-2 truncate">{meta}</div>
      <span className={`block w-full py-1.5 rounded-lg text-[11px] font-bold ${btns[tone]}`}>{cta}</span>
    </button>
  )
}
export function MiniBar({ label, pct, color, big }: { label: string; pct: number; color: string; big?: boolean }) {
  return <div><div className="flex items-center justify-between text-[12px] mb-1"><span className="text-zinc-600">{label}</span><span className="font-bold text-zinc-800">{pct}%</span></div><div className={`${big ? 'h-2.5' : 'h-2'} bg-zinc-100 rounded-full overflow-hidden`}><div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} /></div></div>
}
export function MiniStat({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return <div className="bg-zinc-50 rounded-xl p-2.5"><Icon size={15} className="text-yellow-500 mx-auto mb-1" /><div className="font-black text-[14px] text-zinc-900">{value}</div><div className="text-[10px] text-zinc-400">{label}</div></div>
}
export function SectionTitle({ icon: Icon, color, children }: { icon: any; color: string; children: ReactNode }) { return <h2 className="flex items-center gap-2 font-bold text-[15px] text-zinc-900"><Icon size={16} className={color} /> {children}</h2> }
export function Empty({ emoji, text, sub, mini }: { emoji?: string; text: string; sub?: string; mini?: boolean }) {
  if (mini) return <div className="py-4 text-center text-[12px] text-zinc-400">{text}</div>
  return <div className="flex flex-col items-center py-12 text-center"><div className="text-4xl mb-2">{emoji ?? '📭'}</div><div className="text-[14px] font-semibold text-zinc-600">{text}</div>{sub && <div className="text-[12px] text-zinc-400 mt-1 max-w-xs">{sub}</div>}</div>
}
/** Course chooser. Shows ALL published courses: the ones the student is enrolled
 *  in are OPEN (each in its own color); the rest are LOCKED, so students discover
 *  the full catalogue and can ask to subscribe. Reachable any time via the header
 *  switcher (onClose returns to the current course). */
export function CoursePicker({ enrolled, catalog, name, token, onPick, onClose, onLogout }: {
  enrolled: PortalCourse[]; catalog: CatalogCourse[]; name: string; token: string
  onPick: (id: string) => void; onClose?: () => void; onLogout: () => void
}) {
  const first = (name || '').split(' ')[0]
  const enrolledIds = new Set(enrolled.map(c => c.id))
  // Promo cards for everything the student isn't already enrolled in (info cards
  // like the 1:1 classes always show — they're never an enrolled "course").
  const promo = PROMO_CATALOG.filter(p => p.status === 'info' || !enrolled.some(c => p.match(c)))
  // Any real published course not covered by a promo entry (future-proofing).
  const lockedDb = catalog.filter(c => !enrolledIds.has(c.id) && !PROMO_CATALOG.some(p => p.match(c)))
  const hasLocked = promo.some(p => p.status === 'locked') || lockedDb.length > 0

  return (
    <div dir="rtl" className="min-h-screen bg-[#2a1d12] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-7 text-center relative">
          {onClose && <button onClick={onClose} className="absolute right-0 top-0 text-zinc-400 hover:text-white text-[12px] flex items-center gap-1"><ChevronRight size={16} /> رجوع</button>}
          <div className="w-14 h-14 rounded-2xl bg-yellow-400 text-black flex items-center justify-center font-black text-2xl mb-3">I</div>
          <h1 className="text-white font-black text-[20px]">مرحبًا {first} 👋</h1>
          <p className="text-zinc-400 text-[13px] mt-1">اختر دورتك — وتعرّف على باقي الدورات المتاحة</p>
        </div>

        {/* OPEN — enrolled courses, each in its own color */}
        {enrolled.length > 0 && (
          <div className="space-y-3">
            {enrolled.map(c => {
              const t = courseTheme(c)
              return (
                <button key={c.id} onClick={() => onPick(c.id)}
                  className="w-full text-right rounded-2xl p-4 flex items-center gap-3.5 shadow-lg active:scale-[0.99] transition ring-1 ring-white/10"
                  style={{ background: t.dark }}>
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center text-[24px] shrink-0" style={{ background: t.gold, color: t.dark }}>{t.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-[15px] text-white truncate">{c.title}</div>
                    <div className="text-[12px] font-bold" style={{ color: t.gold }}>{c.level || 'دورة'} · {c.modules.length} وحدة · مفتوحة</div>
                  </div>
                  <ChevronLeft size={20} className="text-white/40 shrink-0" />
                </button>
              )
            })}
          </div>
        )}

        {/* LIMITED OFFER — urgency banner (per-student 48h timer + discount + seats) */}
        {hasLocked && <LimitedOfferBanner token={token} />}

        {/* THE REST OF THE CATALOGUE — locked (subscribe), "coming soon", and the 1:1 info card */}
        {(promo.length > 0 || lockedDb.length > 0) && (
          <>
            <div className="text-zinc-500 text-[11px] font-bold mt-5 mb-2 px-1">كل دورات Inglizi.com</div>
            <div className="space-y-3">
              {promo.map(p => <PromoCard key={p.key} p={p} />)}
              {lockedDb.map(c => {
                const t = courseTheme(c)
                const wa = `https://wa.me/${CORRECTOR_WHATSAPP}?text=${encodeURIComponent(`أرغب بالاشتراك في «${c.title}».`)}`
                return (
                  <a key={c.id} href={wa} target="_blank" rel="noreferrer"
                    className="w-full text-right rounded-2xl p-4 flex items-center gap-3.5 bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.07] transition">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center text-[22px] shrink-0 grayscale opacity-70" style={{ background: t.gold, color: t.dark }}>{t.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-[14px] text-zinc-200 truncate">{c.title}</div>
                      <div className="text-[11px] text-zinc-500 font-bold">{c.level || 'دورة'} · {c.units} وحدة · اضغط للاشتراك</div>
                    </div>
                    <Lock size={16} className="text-zinc-500 shrink-0" />
                  </a>
                )
              })}
            </div>
          </>
        )}

        <button onClick={onLogout} className="w-full text-center text-[12px] text-zinc-500 hover:text-zinc-300 mt-7">تسجيل الخروج</button>
      </div>
    </div>
  )
}

/** Limited-offer urgency banner: a personal 48-hour countdown (saved per student
 *  so it's stable across refreshes/devices via the token key), the headline launch
 *  discount, and a slowly-declining "seats left this month" scarcity line. Once a
 *  student's window passes it shows an expired state (no fake reset). */
export const OFFER_HOURS = 48
export const OFFER_KEY = 'inglizi.offer_deadline.'
export function LimitedOfferBanner({ token }: { token: string }) {
  const [left, setLeft] = useState<number | null>(null)
  useEffect(() => {
    const k = OFFER_KEY + (token || 'guest')
    let dl = 0
    try { dl = Number(localStorage.getItem(k)) || 0 } catch {}
    if (!dl) { dl = Date.now() + OFFER_HOURS * 3600_000; try { localStorage.setItem(k, String(dl)) } catch {} }
    const tick = () => setLeft(Math.max(0, dl - Date.now()))
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [token])

  const expired = left !== null && left <= 0
  const ms = left ?? 0
  const hh = Math.floor(ms / 3600_000)
  const mm = Math.floor((ms % 3600_000) / 60_000)
  const ss = Math.floor((ms % 60_000) / 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  const seats = seatsLeftThisMonth()

  if (expired) {
    return (
      <div className="mt-6 rounded-2xl px-4 py-3 bg-white/[0.04] ring-1 ring-white/10 text-center">
        <div className="text-[12.5px] font-bold text-zinc-300">انتهى عرضك الخاص ⏳</div>
        <div className="text-[11px] text-zinc-500 mt-0.5">تواصل مع الإدارة لمعرفة العروض الحالية قبل أن ترتفع الأسعار.</div>
      </div>
    )
  }

  const Box = ({ v, lbl }: { v: number; lbl: string }) => (
    <div className="flex flex-col items-center">
      <span className="w-11 tabular-nums text-center text-[20px] font-black text-white bg-black/30 rounded-lg py-1">{pad(v)}</span>
      <span className="text-[9px] text-white/70 mt-1">{lbl}</span>
    </div>
  )
  return (
    <div className="mt-6 rounded-2xl p-4 text-center shadow-lg" style={{ background: 'linear-gradient(135deg,#dc2626,#ea580c)' }}>
      <div className="text-[13px] font-black text-white flex items-center justify-center gap-1.5">
        🔥 عرض الإطلاق — وفّر حتى {MAX_DISCOUNT_PCT}%
      </div>
      <div className="text-[11px] text-white/80 mt-0.5">عرض خاص لك ينتهي خلال</div>
      <div className="flex items-center justify-center gap-2 mt-2" dir="ltr">
        <Box v={hh} lbl="ساعة" /><span className="text-white font-black text-lg pb-3">:</span>
        <Box v={mm} lbl="دقيقة" /><span className="text-white font-black text-lg pb-3">:</span>
        <Box v={ss} lbl="ثانية" />
      </div>
      <div className="mt-3 inline-flex items-center gap-1.5 bg-black/25 rounded-full px-3 py-1 text-[11px] font-bold text-amber-100">
        ⚡ بقي {seats} {seats === 1 ? 'مقعد' : 'مقاعد'} بهذا السعر هذا الشهر
      </div>
    </div>
  )
}

/** One catalogue card: locked → WhatsApp subscribe (with price); soon → greyed
 *  "coming soon"; info → an open "discover" card (the 1:1 classes) → /pricing. */
export function PromoCard({ p }: { p: PromoCourse }) {
  const t = themeForKey(p.key)
  const Badge = p.badge ? (
    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0"
      style={{ background: p.status === 'soon' ? 'rgba(255,255,255,0.1)' : t.gold, color: p.status === 'soon' ? '#a1a1aa' : t.dark }}>{p.badge}</span>
  ) : null

  // INFO — the 1:1 classes: an inviting, fully-coloured "discover" card
  if (p.status === 'info') {
    return (
      <a href={p.href} className="block w-full text-right rounded-2xl p-4 shadow-lg ring-1 ring-white/10 hover:opacity-95 transition" style={{ background: t.dark }}>
        <div className="flex items-center gap-3.5">
          <span className="w-12 h-12 rounded-xl flex items-center justify-center text-[24px] shrink-0" style={{ background: t.gold, color: t.dark }}>{t.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5"><span className="font-black text-[15px] text-white truncate">{p.title}</span></div>
            <div className="text-[12px] font-bold" style={{ color: t.gold }}>{p.level} · {p.priceLabel}</div>
          </div>
          <ChevronLeft size={20} className="text-white/40 shrink-0" />
        </div>
        {p.perks && (
          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {p.perks.map(x => <li key={x} className="text-[11px] text-zinc-300 flex items-start gap-1"><span style={{ color: t.gold }}>✦</span><span className="leading-snug">{x}</span></li>)}
          </ul>
        )}
      </a>
    )
  }

  // a course icon that unmistakably reads as "locked" (greyed emoji + lock badge)
  const LockedIcon = (
    <span className="relative w-12 h-12 shrink-0">
      <span className="w-12 h-12 rounded-xl flex items-center justify-center text-[22px] grayscale opacity-50" style={{ background: t.gold, color: t.dark }}>{t.emoji}</span>
      <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-zinc-900 ring-2 ring-[#2a1d12] flex items-center justify-center"><Lock size={11} className="text-zinc-300" /></span>
    </span>
  )

  // SOON — coming soon, locked and not yet clickable
  if (p.status === 'soon') {
    return (
      <div className="w-full text-right rounded-2xl p-4 flex items-center gap-3.5 bg-white/[0.03] ring-1 ring-white/10 opacity-80">
        {LockedIcon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5"><span className="font-black text-[14px] text-zinc-300 truncate">{p.title}</span>{Badge}</div>
          <div className="text-[11px] text-zinc-500 font-bold">{p.level} · {p.blurb}</div>
        </div>
        <Clock size={16} className="text-zinc-500 shrink-0" />
      </div>
    )
  }

  // LOCKED — clearly locked; tap → subscribe via WhatsApp, with struck "before" price + discount
  const wa = `https://wa.me/${CORRECTOR_WHATSAPP}?text=${encodeURIComponent(p.waText || `أرغب بالاشتراك في «${p.title}».`)}`
  return (
    <a href={wa} target="_blank" rel="noreferrer"
      className="w-full text-right rounded-2xl p-4 flex items-center gap-3.5 bg-white/[0.05] ring-1 ring-white/10 hover:bg-white/[0.09] transition">
      {LockedIcon}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-black text-[14px] text-zinc-100 truncate">{p.title}</span>
          {Badge}
          {p.discountPct && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 shrink-0">-{p.discountPct}%</span>}
        </div>
        <div className="text-[11px] font-bold mt-0.5 flex items-center gap-1.5 flex-wrap" style={{ color: t.gold }}>
          <span>{p.level}</span>
          {p.origPriceLabel && <span className="text-zinc-500 line-through font-semibold">{p.origPriceLabel}</span>}
          <span>{p.priceLabel}</span>
        </div>
        <div className="text-[10.5px] text-zinc-400 mt-0.5">🔓 اضغط للاشتراك وفتح الدورة</div>
      </div>
      <Lock size={16} className="text-zinc-400 shrink-0" />
    </a>
  )
}

export const CHIP_TONE: Record<string, string> = {
  passed: 'bg-emerald-50 text-emerald-700 border-emerald-100', completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  reviewed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-100', attempted: 'bg-amber-50 text-amber-700 border-amber-100',
  pending_review: 'bg-indigo-50 text-indigo-700 border-indigo-100', failed: 'bg-rose-50 text-rose-700 border-rose-100',
  locked: 'bg-zinc-50 text-zinc-400 border-zinc-100', not_started: 'bg-white text-zinc-500 border-zinc-200',
}
/** One curriculum exercise: what kind it is and where the student stands. */
export function ExerciseChip({ item }: { item: ExerciseItem }) {
  const done = isExerciseDone(item.status)
  const score = item.kind === 'unit_conversation' && item.detail?.score != null ? ` · ${item.detail.score}/100` : ''
  return (
    <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${CHIP_TONE[item.status] ?? CHIP_TONE.not_started}`}>
      {done ? <CheckCircle2 size={11} /> : item.status === 'locked' ? <Lock size={10} /> : <Circle size={10} />}
      {EXERCISE_KIND_AR[item.kind]} · {EXERCISE_STATUS_AR[item.status]}{score}
    </span>
  )
}

export function LessonRow({ l, unlocked, onOpen, onComplete, onQuiz, items }: { l: PortalLesson; unlocked: boolean; onOpen: (l: PortalLesson, url?: string | null) => void; onComplete: (l: PortalLesson) => void; onQuiz?: (l: PortalLesson) => void; items?: ExerciseItem[] }) {
  const Icon = LTYPE_ICON[l.type] ?? Video
  const url = l.video_url || l.exercise_url || l.file_url
  if (!unlocked) return (
    <div className="flex items-center gap-3 px-4 py-3 opacity-60"><Lock size={16} className="text-zinc-300 flex-shrink-0" /><div className="flex-1 min-w-0"><div className="text-[13px] font-semibold text-zinc-500 truncate">{l.title}</div><div className="text-[11px] text-zinc-400">{l.is_locked ? 'مقفل' : 'أكمل الدرس السابق لفتحه'}</div></div></div>
  )
  // whole row is clickable → opens the lesson
  return (
    <div onClick={() => onOpen(l, url)} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50 transition-colors">
      {l.status === 'completed' ? <CheckCircle2 size={17} className="text-emerald-500 flex-shrink-0" /> : l.status === 'opened' ? <PlayCircle size={17} className="text-yellow-500 flex-shrink-0" /> : <Icon size={17} className="text-zinc-400 flex-shrink-0" />}
      {/* play button right next to the title */}
      <button onClick={e => { e.stopPropagation(); onOpen(l, url) }} aria-label="تشغيل الدرس"
        className="w-8 h-8 rounded-full bg-[var(--ic-gold)] text-black flex items-center justify-center flex-shrink-0 shadow-sm hover:bg-[var(--ic-gold)] active:scale-95 transition">
        <Play size={15} fill="currentColor" style={{ marginInlineStart: 2 }} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-zinc-800 truncate">{l.title}</div>
        <div className="text-[11px] text-zinc-400">{LTYPE_AR[l.type] ?? l.type}{l.status === 'completed' ? ' · مكتمل' : l.status === 'opened' ? ' · قيد التقدم' : ''}</div>
        {items && items.length > 0 && <div className="flex flex-wrap gap-1 mt-1">{items.map(i => <ExerciseChip key={i.kind} item={i} />)}</div>}
      </div>
      {/* the quiz launches automatically after the lesson — no 'اختبار' label that intimidates */}
      {l.has_quiz
        ? (l.status === 'completed' ? <span className="text-[11px] font-bold text-emerald-600 flex-shrink-0">✓</span> : null)
        : (l.status !== 'completed'
            ? <button onClick={e => { e.stopPropagation(); onComplete(l) }} className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex-shrink-0">تم</button>
            : <span className="text-[11px] font-bold text-emerald-600 flex-shrink-0">✓</span>)}
    </div>
  )
}
export function ExamRow({ e }: { e: { title: string; level: string | null; exam_date: string | null; score: number | null; max_score: number | null; passed: boolean | null; teacher_note: string | null } }) {
  const p = e.score != null && e.max_score ? Math.round((e.score / e.max_score) * 100) : null
  return (
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${e.passed === false ? 'bg-red-50' : e.score == null ? 'bg-zinc-100' : 'bg-emerald-50'}`}><span className={`text-[15px] font-black ${e.passed === false ? 'text-red-600' : e.score == null ? 'text-zinc-400' : 'text-emerald-700'}`}>{p != null ? p : '—'}</span><span className="text-[8px] text-zinc-400">%</span></div>
      <div className="flex-1 min-w-0"><div className="font-bold text-[14px] text-zinc-800 truncate">{e.title}</div><div className="text-[11px] text-zinc-400">{e.level ? `${e.level} · ` : ''}{fmtShort(e.exam_date)}{e.passed != null ? ` · ${e.passed ? 'ناجح ✓' : 'يحتاج إعادة'}` : e.score == null ? ' · قادم' : ''}</div>{e.teacher_note && <div className="text-[11px] text-zinc-500 mt-0.5">📝 {e.teacher_note}</div>}</div>
    </div>
  )
}

export class PortalErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(p: any) { super(p); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err: any) { console.error('portal error', err) }
  render() {
    if (this.state.hasError) return (
      <div dir="rtl" className="min-h-screen bg-[#2a1d12] flex items-center justify-center p-4 text-center"><div className="max-w-sm"><div className="text-4xl mb-3">⚠️</div><h1 className="text-white font-black text-[18px] mb-2">حدث خطأ غير متوقع</h1><p className="text-zinc-400 text-[13px] mb-4">أعد تحميل الصفحة، وإن استمرّ الخطأ تواصل مع الإدارة.</p><button onClick={() => location.reload()} className="px-5 py-2.5 rounded-xl bg-[#facc15] text-black font-bold text-[14px]">إعادة تحميل</button></div></div>
    )
    return this.props.children
  }
}
