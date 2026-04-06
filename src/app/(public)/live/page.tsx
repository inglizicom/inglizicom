'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Radio, Lock, Crown, Send, MessageCircle, Clock,
  Calendar, ChevronRight, PlayCircle, Users, Star,
  CheckCircle2, X, ExternalLink, Bell, WifiOff,
  Play, Video, TrendingUp,
} from 'lucide-react'

// ─── Configuration ────────────────────────────────────────────────────────────
// ↓ Edit these values to control the page state

const LIVE_CONFIG = {
  isLive: true,
  liveLink: 'https://meet.google.com/abc-defg-hij', // ← paste your Google Meet link
  sessionTitle: 'محادثة يومية — Daily Conversation Practice',
  sessionSubtitle: 'تدرب على المحادثة الحقيقية مع المعلم مباشرةً',
  // Set to a future Date to show countdown instead of "no session":
  scheduledAt: null as Date | null,
  hostName: 'حمزة القصراوي',
  hostTitle: 'مدرب الإنجليزية المعتمد',
  attendees: 42,
}

const IS_PAID_USER = false // ← flip to true to simulate paid access

const WHATSAPP_NUMBER = '212707902091'

// ─── Replay Videos ────────────────────────────────────────────────────────────

const REPLAYS = [
  {
    id: 'r1',
    titleAr: 'تدريب على المحادثة اليومية',
    titleEn: 'Daily Conversation Practice',
    date: '٢ أبريل ٢٠٢٥',
    duration: '45:12',
    views: '1.2K',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    level: 'A1 – A2',
  },
  {
    id: 'r2',
    titleAr: 'أسئلة المقابلة الوظيفية بالإنجليزية',
    titleEn: 'Job Interview Questions in English',
    date: '٢٦ مارس ٢٠٢٥',
    duration: '52:30',
    views: '2.4K',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    level: 'B1 – B2',
  },
  {
    id: 'r3',
    titleAr: 'نطق الحروف الصعبة في الإنجليزية',
    titleEn: 'Difficult English Pronunciation',
    date: '١٩ مارس ٢٠٢٥',
    duration: '38:15',
    views: '3.1K',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    level: 'A1 – B1',
  },
]

// ─── Seed Comments ────────────────────────────────────────────────────────────

const SEED_COMMENTS = [
  { id: '1', author: 'سارة بنعلي',     avatar: 'س', color: 'bg-pink-500',    text: 'ما شاء الله على الحصة! استفدت كثيراً من تمارين النطق 🎉', time: 'منذ ٣ دقائق'  },
  { id: '2', author: 'أيوب المنصوري',  avatar: 'أ', color: 'bg-blue-500',    text: 'جزاك الله خيراً أستاذ حمزة، الشرح واضح جداً 👍',         time: 'منذ ٧ دقائق'  },
  { id: '3', author: 'نورة الزهراء',   avatar: 'ن', color: 'bg-violet-500',  text: 'هل سيكون هناك ريبلاي لمن فاته الحضور؟',                 time: 'منذ ١٢ دقيقة' },
  { id: '4', author: 'رضا الخياط',     avatar: 'ر', color: 'bg-emerald-500', text: 'أحسن أستاذ في المغرب 🙌 الأسلوب مميز جداً',               time: 'منذ ٢٠ دقيقة' },
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface Comment {
  id: string
  author: string
  avatar: string
  color: string
  text: string
  time: string
}

// ─── Icon Components ──────────────────────────────────────────────────────────

function WAIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function MeetIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 87.5 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M51.5 36 67 49.5V22.5L51.5 36Z" fill="#00832d" />
      <path d="M0 51.5v12c0 4.4 3.6 8 8 8h12l3-11.5-3-8.5H0Z" fill="#0066da" />
      <path d="M20 72l15.5-8.5V51.5H20V72Z" fill="#e94235" />
      <path d="M20 0H8C3.6 0 0 3.6 0 8v43.5h20V20H35.5L51.5 8H20V0Z" fill="#2684fc" />
      <path d="M35.5 20v31.5H51.5V22.5L35.5 20Z" fill="#00ac47" />
      <path d="M67 22.5V8c0-4.4-3.6-8-8-8H51.5L35.5 20 51.5 22.5 67 22.5Z" fill="#ff6d00" />
      <path d="M67 49.5l-15.5 2V72H59c4.4 0 8-3.6 8-8v-14.5Z" fill="#00832d" />
    </svg>
  )
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────

function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    const update = () => setTimeLeft(Math.max(0, Math.floor((targetDate.getTime() - Date.now()) / 1000)))
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [targetDate])

  if (timeLeft === 0) return null

  const units = [
    { v: Math.floor(timeLeft / 3600),         l: 'ساعة'   },
    { v: Math.floor((timeLeft % 3600) / 60),  l: 'دقيقة'  },
    { v: timeLeft % 60,                        l: 'ثانية'  },
  ]

  return (
    <div className="flex items-center justify-center gap-3 mt-5 mb-2">
      {units.map(({ v, l }) => (
        <div key={l} className="flex flex-col items-center">
          <div className="w-16 h-16 bg-white/10 border border-white/25 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white tabular-nums shadow-inner">
            {String(v).padStart(2, '0')}
          </div>
          <span className="text-blue-300 text-xs mt-1.5 font-medium">{l}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Access Gate Modal ────────────────────────────────────────────────────────

function AccessModal({ onClose }: { onClose: () => void }) {
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('مرحباً! أريد الاشتراك في الخطة السنوية للحصص المباشرة')}`

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md p-7 sm:p-8 text-center animate-in">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-xl hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
          <Lock className="w-10 h-10 text-amber-500" />
        </div>

        <h3 className="text-xl font-extrabold text-slate-800 mb-2 leading-snug">
          هذه الحصة للمشتركين فقط 🔒
        </h3>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          اشترك في الخطة السنوية للوصول إلى جميع الحصص المباشرة والريبلايات بدون قيود
        </p>

        {/* Pricing box */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 mb-6 text-right">
          <div className="flex items-baseline gap-2 justify-center mb-3">
            <span className="text-4xl font-extrabold text-blue-700">3,000</span>
            <span className="text-blue-500 font-bold">درهم / سنة</span>
          </div>
          <ul className="space-y-2">
            {[
              'جميع الحصص المباشرة الأسبوعية',
              'ريبلايات كاملة غير محدودة',
              'دورات A1 → B2 كاملة',
              'شهادة إتمام معتمدة',
              'دعم مباشر عبر واتساب',
            ].map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold py-4 rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25 hover:-translate-y-0.5 text-base"
        >
          <Crown className="w-5 h-5" />
          احصل على الوصول الكامل — 3,000 درهم/سنة
        </a>
        <p className="text-slate-400 text-xs mt-3">ضمان استرداد الأموال خلال 30 يوماً ✓</p>
      </div>
    </div>
  )
}

// ─── Live Hero Section ────────────────────────────────────────────────────────

function LiveSection({ onJoinAttempt }: { onJoinAttempt: () => void }) {
  const { isLive, liveLink, sessionTitle, sessionSubtitle, scheduledAt, hostName, hostTitle, attendees } = LIVE_CONFIG
  const showNoSession = !isLive && !scheduledAt

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 shadow-2xl shadow-blue-900/40">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />
      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="relative px-6 py-12 md:py-16 max-w-2xl mx-auto text-center">

        {/* Status badge */}
        {isLive && (
          <div className="inline-flex items-center gap-2.5 bg-red-500/20 border border-red-400/40 text-red-300 text-sm font-bold px-5 py-2.5 rounded-full mb-6 shadow-inner">
            <span className="w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse" />
            🔴 بث مباشر الآن — Live Now
          </div>
        )}
        {!isLive && scheduledAt && (
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-sm font-bold px-5 py-2.5 rounded-full mb-4">
            <Calendar className="w-4 h-4" />
            حصة قادمة — يبدأ العد التنازلي:
          </div>
        )}
        {showNoSession && (
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-slate-300 text-sm font-semibold px-5 py-2.5 rounded-full mb-6">
            <WifiOff className="w-4 h-4" />
            لا توجد حصة مباشرة حالياً
          </div>
        )}

        {/* Countdown */}
        {!isLive && scheduledAt && <Countdown targetDate={scheduledAt} />}

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-3 leading-snug mt-2">
          {sessionTitle}
        </h1>
        <p className="text-blue-200 text-base md:text-lg mb-7">{sessionSubtitle}</p>

        {/* Host pill */}
        <div className="inline-flex items-center gap-3 bg-white/10 border border-white/15 rounded-full px-5 py-3 mb-8">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center font-extrabold text-white text-base">
            ح
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-sm leading-none">{hostName}</p>
            <p className="text-blue-300 text-xs mt-0.5">{hostTitle}</p>
          </div>
          <div className="h-6 w-px bg-white/20 mx-1" />
          <div className="flex items-center gap-1.5 text-blue-200 text-xs">
            <Users className="w-4 h-4" />
            <span className="font-semibold">{attendees} مشارك</span>
          </div>
        </div>

        {/* CTA — paid user: direct link */}
        {isLive && IS_PAID_USER && (
          <a
            href={liveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-blue-800 font-extrabold px-8 py-4 rounded-2xl text-lg hover:bg-blue-50 transition-all shadow-2xl hover:-translate-y-1 active:scale-95"
          >
            <MeetIcon size={26} />
            انضم للحصة المباشرة الآن
            <ExternalLink className="w-5 h-5" />
          </a>
        )}

        {/* CTA — free user: trigger modal */}
        {isLive && !IS_PAID_USER && (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={onJoinAttempt}
              className="inline-flex items-center gap-3 bg-white/15 border border-white/30 text-white font-extrabold px-8 py-4 rounded-2xl text-lg hover:bg-white/25 transition-all group"
            >
              <Lock className="w-5 h-5 text-amber-400" />
              انضم للحصة — للمشتركين فقط
              <Crown className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
            </button>
            <button
              onClick={onJoinAttempt}
              className="text-amber-300 hover:text-amber-200 text-sm font-semibold underline underline-offset-4 transition-colors"
            >
              اشترك الآن — 3,000 درهم/سنة ←
            </button>
          </div>
        )}

        {/* No session state */}
        {showNoSession && (
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('أريد أن أعرف موعد الحصة المباشرة القادمة')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-7 py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5"
          >
            <Bell className="w-5 h-5" />
            أعلمني بموعد الحصة القادمة
          </a>
        )}

        {/* Footer note */}
        <p className="text-blue-400 text-sm mt-6 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4" />
          حصة مباشرة جديدة كل أسبوع — New session every week
        </p>
      </div>
    </section>
  )
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = [
    { icon: Users,       value: '+2,000',  label: 'طالب مسجل',     color: 'text-blue-600',   bg: 'bg-blue-100'   },
    { icon: Video,       value: '+50',     label: 'حصة مباشرة',    color: 'text-emerald-600', bg: 'bg-emerald-100'},
    { icon: Star,        value: '5.0',     label: 'تقييم الطلاب',  color: 'text-amber-500',  bg: 'bg-amber-100'  },
    { icon: TrendingUp,  value: '+200h',   label: 'محتوى مسجل',    color: 'text-violet-600', bg: 'bg-violet-100' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(({ icon: Icon, value, label, color, bg }) => (
        <div
          key={label}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <p className={`text-2xl font-extrabold ${color} leading-none`}>{value}</p>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">{label}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Replay Card ──────────────────────────────────────────────────────────────

type Replay = typeof REPLAYS[0]

function ReplayCard({ replay }: { replay: Replay }) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all group">
      {playing ? (
        <div style={{ paddingTop: '56.25%', position: 'relative' }}>
          <iframe
            src={`${replay.embedUrl}?autoplay=1&rel=0&modestbranding=1`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={replay.titleAr}
          />
        </div>
      ) : (
        <button
          onClick={() => setPlaying(true)}
          className="relative block w-full aspect-video bg-gradient-to-br from-slate-700 to-slate-900 overflow-hidden"
        >
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300 shadow-xl">
              <Play className="w-7 h-7 text-white fill-white translate-x-0.5" />
            </div>
          </div>
          {/* Duration */}
          <div className="absolute bottom-3 left-3 bg-black/75 text-white text-xs font-bold px-2.5 py-1 rounded-lg tabular-nums">
            {replay.duration}
          </div>
          {/* Level */}
          <div className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg">
            {replay.level}
          </div>
          {/* Hover tint */}
          <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors" />
        </button>
      )}

      <div className="p-4">
        <h3 className="font-bold text-slate-800 mb-1 leading-snug">{replay.titleAr}</h3>
        <p className="text-xs text-slate-400 mb-3">{replay.titleEn}</p>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {replay.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {replay.views} مشاهدة
          </span>
        </div>
        {!playing && (
          <button
            onClick={() => setPlaying(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold py-2.5 rounded-xl transition-all text-sm border border-blue-100 hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
          >
            <PlayCircle className="w-4 h-4" />
            مشاهدة الحصة
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Comments Section ─────────────────────────────────────────────────────────

function CommentsSection() {
  const [comments, setComments] = useState<Comment[]>(SEED_COMMENTS)
  const [input, setInput] = useState('')
  const [authorName, setAuthorName] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const EXTRA_COLORS = ['bg-rose-500', 'bg-sky-500', 'bg-teal-500', 'bg-orange-500']

  const submit = () => {
    const text = input.trim()
    if (!text) return
    const author = authorName.trim() || 'زائر'
    const newComment: Comment = {
      id: Date.now().toString(),
      author,
      avatar: author.charAt(0),
      color: EXTRA_COLORS[Math.floor(Math.random() * EXTRA_COLORS.length)],
      text,
      time: 'الآن',
    }
    setComments(prev => [newComment, ...prev])
    setInput('')
    setTimeout(() => listRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 leading-none">التعليقات</h2>
          <p className="text-xs text-slate-500 mt-0.5">{comments.length} تعليق</p>
        </div>
      </div>

      {/* Input area */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/60">
        <input
          type="text"
          placeholder="اسمك (اختياري)"
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
          className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm text-right mb-2.5 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
        />
        <div className="flex gap-2 items-end">
          <textarea
            rows={2}
            placeholder="شاركنا رأيك أو سؤالك… (Enter للإرسال)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            className="flex-1 border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm text-right resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          <button
            onClick={submit}
            className="w-11 h-11 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl flex items-center justify-center transition-all shadow-sm hover:shadow-blue-500/30 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div ref={listRef} className="divide-y divide-slate-50 max-h-96 overflow-y-auto scrollbar-thin">
        {comments.map(c => (
          <div key={c.id} className="flex gap-3 p-4 hover:bg-slate-50/60 transition-colors">
            <div className={`w-9 h-9 rounded-full ${c.color} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm`}>
              {c.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-sm text-slate-800">{c.author}</span>
                <span className="text-xs text-slate-400 shrink-0">{c.time}</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── WhatsApp CTA Section ─────────────────────────────────────────────────────

function WhatsAppCTA() {
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('مرحباً أستاذ حمزة! شاهدت الحصة المباشرة وأريد أن أعرف أكثر عن الاشتراك.')}`

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-8 md:p-12 text-center text-white shadow-xl shadow-emerald-600/30">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/8 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-white/8 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-lg mx-auto">
        <p className="text-emerald-200 text-sm font-bold mb-2 tracking-widest uppercase">
          تواصل مباشرة مع المعلم
        </p>
        <h2 className="text-2xl md:text-3xl font-extrabold mb-3 leading-snug">
          🔥 عجبك المحتوى؟ تحدث معنا!
        </h2>
        <p className="text-emerald-100 text-base mb-8 leading-relaxed">
          احصل على خطة تعلم مخصصة واستشارة مجانية عبر واتساب
        </p>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-white text-emerald-700 font-extrabold px-8 py-4 rounded-2xl text-lg hover:bg-emerald-50 transition-all shadow-2xl hover:-translate-y-1 active:scale-95"
        >
          <WAIcon size={24} />
          تواصل معي على واتساب
        </a>

        <p className="text-emerald-200 text-sm mt-5">⚡ يرد عادةً في أقل من ساعة</p>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-6 mt-7 flex-wrap">
          {['+2,000 طالب', '5 ★ تقييم', 'ضمان 30 يوم'].map(t => (
            <div key={t} className="flex items-center gap-1.5 text-emerald-200 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Sticky Page Sub-Header ───────────────────────────────────────────────────

function PageHeader({ onJoinAttempt }: { onJoinAttempt: () => void }) {
  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-16 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Left: title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4 text-red-500" />
          </div>
          <div className="hidden sm:block">
            <p className="font-bold text-slate-800 text-sm leading-none">Live Classes</p>
            <p className="text-xs text-slate-500 mt-0.5">حصص مباشرة أسبوعية</p>
          </div>
          <p className="sm:hidden font-bold text-slate-800 text-sm">حصص مباشرة</p>
        </div>

        {/* Right: status + actions */}
        <div className="flex items-center gap-2">
          {LIVE_CONFIG.isLive && (
            <span className="flex items-center gap-1.5 text-red-500 text-xs font-bold bg-red-50 border border-red-100 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="hidden sm:inline">مباشر الآن</span>
              <span className="sm:hidden">Live</span>
            </span>
          )}

          <span className="hidden md:flex items-center gap-1.5 text-slate-500 text-xs bg-slate-100 px-3 py-1.5 rounded-full">
            <Bell className="w-3.5 h-3.5" />
            حصة جديدة كل أسبوع
          </span>

          {LIVE_CONFIG.isLive && !IS_PAID_USER && (
            <button
              onClick={onJoinAttempt}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-amber-500/25"
            >
              <Crown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">اشترك الآن</span>
              <span className="sm:hidden">اشترك</span>
            </button>
          )}

          <Link
            href="/courses"
            className="hidden sm:flex items-center gap-1 text-slate-600 text-xs font-semibold hover:text-blue-600 transition-colors py-1.5"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            الدورات
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LiveClassesPage() {
  const [showModal, setShowModal] = useState(false)

  // Close modal on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowModal(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 pt-16">

      {/* Sticky sub-header (sits below the site header at top-16) */}
      <PageHeader onJoinAttempt={() => setShowModal(true)} />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {/* 1 ── Live Hero */}
        <LiveSection onJoinAttempt={() => setShowModal(true)} />

        {/* 2 ── Stats */}
        <StatsBar />

        {/* 3 ── Replays */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-800 text-xl leading-none">📺 حصص سابقة</h2>
                <p className="text-sm text-slate-500 mt-1">شاهد الحصص التي فاتتك في أي وقت</p>
              </div>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-3 py-1.5 rounded-full hidden sm:inline">
              {REPLAYS.length} حصص متاحة
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {REPLAYS.map(r => <ReplayCard key={r.id} replay={r} />)}
          </div>
        </section>

        {/* 4 ── Comments */}
        <section>
          <CommentsSection />
        </section>

        {/* 5 ── WhatsApp CTA */}
        <WhatsAppCTA />

      </div>

      {/* Access Gate Modal */}
      {showModal && <AccessModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
