'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  Radio, Send, MessageCircle, Clock,
  ChevronRight, Users, Star,
  CheckCircle2, ExternalLink, Bell, WifiOff,
  Video, TrendingUp, Play,
} from 'lucide-react'

// ─── Constants ───────────────────────────────────────────────────────────────

const WHATSAPP_NUMBER = '212707902091'

function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url)
    // Already an embed URL — extract video ID from path
    if (u.pathname.startsWith('/embed/')) {
      const id = u.pathname.split('/embed/')[1]?.split('/')[0]
      if (id) return `https://www.youtube.com/embed/${id}`
    }
    // youtube.com/watch?v=ID or youtube.com/live/ID
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v') || u.pathname.split('/live/')[1] || u.pathname.split('/').pop()
      if (id) return `https://www.youtube.com/embed/${id}`
    }
    // youtu.be/ID
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1)
      if (id) return `https://www.youtube.com/embed/${id}`
    }
  } catch { /* fallback */ }
  return url
}

// ─── Floating Icons ──────────────────────────────────────────────────────────

const FLOATING_ICONS = [
  { icon: '🎥', size: 28, x: 5,  y: 12, delay: 0,   dur: 18 },
  { icon: '🎓', size: 22, x: 90, y: 18, delay: 2,   dur: 22 },
  { icon: '💬', size: 20, x: 12, y: 50, delay: 4,   dur: 20 },
  { icon: '✨', size: 18, x: 92, y: 55, delay: 1,   dur: 16 },
  { icon: '📡', size: 24, x: 8,  y: 82, delay: 3,   dur: 24 },
  { icon: '🌟', size: 20, x: 85, y: 88, delay: 5,   dur: 19 },
  { icon: '🎯', size: 16, x: 50, y: 8,  delay: 2.5, dur: 21 },
  { icon: '🔤', size: 22, x: 72, y: 42, delay: 1.5, dur: 17 },
]

function FloatingIcons() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {FLOATING_ICONS.map((f, i) => (
        <div key={i} className="absolute opacity-[0.06] animate-float-icon"
          style={{ left: `${f.x}%`, top: `${f.y}%`, fontSize: f.size, animationDelay: `${f.delay}s`, animationDuration: `${f.dur}s` }}>
          {f.icon}
        </div>
      ))}
      <style jsx>{`
        @keyframes float-icon {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25%      { transform: translateY(-20px) rotate(5deg); }
          50%      { transform: translateY(-8px) rotate(-3deg); }
          75%      { transform: translateY(-25px) rotate(4deg); }
        }
        .animate-float-icon {
          animation-name: float-icon;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  )
}

// ─── Icons ───────────────────────────────────────────────────────────────────

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

// ─── Types ───────────────────────────────────────────────────────────────────

interface LiveContent {
  id: number
  live_link: string | null
  youtube_link: string | null
  created_at: string
}

interface YTVideo {
  id: string
  title: string
  published: string
  thumbnail: string
  views: number
}

interface Comment {
  id: string
  author: string
  avatar: string
  color: string
  text: string
  time: string
}

// ─── Seed Comments ───────────────────────────────────────────────────────────

const SEED_COMMENTS: Comment[] = [
  { id: '1', author: 'سارة بنعلي',    avatar: 'س', color: 'bg-pink-500',    text: 'ما شاء الله على الحصة! استفدت كثيراً من تمارين النطق 🎉', time: 'منذ ٣ دقائق'  },
  { id: '2', author: 'أيوب المنصوري', avatar: 'أ', color: 'bg-blue-500',    text: 'جزاك الله خيراً أستاذ حمزة، الشرح واضح جداً 👍',         time: 'منذ ٧ دقائق'  },
  { id: '3', author: 'نورة الزهراء',  avatar: 'ن', color: 'bg-violet-500',  text: 'هل سيكون هناك ريبلاي لمن فاته الحضور؟',                 time: 'منذ ١٢ دقيقة' },
  { id: '4', author: 'رضا الخياط',    avatar: 'ر', color: 'bg-emerald-500', text: 'أحسن أستاذ في المغرب 🙌 الأسلوب مميز جداً',               time: 'منذ ٢٠ دقيقة' },
]

// ─── Video Card ──────────────────────────────────────────────────────────────

function VideoCard({ video }: { video: YTVideo }) {
  const [playing, setPlaying] = useState(false)

  const viewsStr = video.views >= 1000
    ? `${(video.views / 1000).toFixed(1)}K`
    : String(video.views)

  const dateStr = new Date(video.published).toLocaleDateString('ar-MA', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group">
      {playing ? (
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        </div>
      ) : (
        <button onClick={() => setPlaying(true)} className="relative block w-full aspect-video bg-black/40 overflow-hidden">
          {video.thumbnail && (
            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
          )}
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-white/25 transition-all duration-300 shadow-xl">
              <Play className="w-6 h-6 text-white fill-white translate-x-0.5" />
            </div>
          </div>
          {/* Views badge */}
          <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-white/70 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
            <Users className="w-3 h-3" />
            {viewsStr}
          </div>
        </button>
      )}

      <div className="p-3.5">
        <h3 className="font-bold text-white/80 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-white transition-colors">{video.title}</h3>
        <div className="flex items-center justify-between text-[10px] text-white/25">
          <span>{dateStr}</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{viewsStr} مشاهدة</span>
        </div>
      </div>
    </div>
  )
}

// ─── Stats Bar ───────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = [
    { icon: Users,      value: '+2,000',  label: 'طالب مسجل',    color: 'text-blue-400',    bg: 'bg-blue-500/10',   border: 'border-blue-500/20'   },
    { icon: Video,      value: '+50',     label: 'حصة مباشرة',   color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { icon: Star,       value: '5.0',     label: 'تقييم الطلاب', color: 'text-amber-400',   bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
    { icon: TrendingUp, value: '+200h',   label: 'محتوى مسجل',   color: 'text-violet-400',  bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(({ icon: Icon, value, label, color, bg, border }) => (
        <div key={label} className={`rounded-2xl p-5 ${bg} border ${border} text-center hover:scale-[1.02] transition-transform`}>
          <div className={`w-10 h-10 ${bg} border ${border} rounded-xl flex items-center justify-center mx-auto mb-3`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <p className={`text-2xl font-extrabold ${color} leading-none`}>{value}</p>
          <p className="text-xs text-white/40 mt-1.5 font-medium">{label}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Comments Section ────────────────────────────────────────────────────────

function CommentsSection() {
  const [comments, setComments] = useState<Comment[]>(SEED_COMMENTS)
  const [input, setInput]       = useState('')
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
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="font-bold text-white leading-none">التعليقات</h2>
          <p className="text-xs text-white/30 mt-0.5">{comments.length} تعليق</p>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-b border-white/[0.06] bg-white/[0.02]">
        <input
          type="text"
          placeholder="اسمك (اختياري)"
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
          dir="rtl"
          className="w-full border border-white/[0.08] bg-white/[0.03] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 mb-2.5 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
        />
        <div className="flex gap-2 items-end">
          <textarea
            rows={2}
            placeholder="شاركنا رأيك أو سؤالك… (Enter للإرسال)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            dir="rtl"
            className="flex-1 border border-white/[0.08] bg-white/[0.03] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
          <button onClick={submit}
            className="w-11 h-11 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-900/30 shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div ref={listRef} className="divide-y divide-white/[0.04] max-h-96 overflow-y-auto">
        {comments.map(c => (
          <div key={c.id} className="flex gap-3 p-4 hover:bg-white/[0.02] transition-colors">
            <div className={`w-9 h-9 rounded-full ${c.color} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm`}>
              {c.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-sm text-white/80">{c.author}</span>
                <span className="text-xs text-white/20 shrink-0">{c.time}</span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── WhatsApp CTA ────────────────────────────────────────────────────────────

function WhatsAppCTA() {
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('مرحباً أستاذ حمزة! شاهدت الحصة المباشرة وأريد أن أعرف أكثر عن الاشتراك.')}`
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600/20 to-teal-700/20 border border-emerald-500/20 p-8 md:p-12 text-center">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-lg mx-auto">
        <p className="text-emerald-400/60 text-xs font-bold mb-2 tracking-widest uppercase">تواصل مباشرة مع المعلم</p>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 leading-snug">عجبك المحتوى؟ تحدث معنا!</h2>
        <p className="text-white/40 text-base mb-8 leading-relaxed">احصل على خطة تعلم مخصصة واستشارة مجانية عبر واتساب</p>

        <a href={waUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-8 py-4 rounded-2xl text-lg transition-all shadow-lg shadow-emerald-900/30 hover:-translate-y-0.5 active:scale-95">
          <WAIcon size={24} />
          تواصل معي على واتساب
        </a>

        <p className="text-white/25 text-sm mt-5">⚡ يرد عادةً في أقل من ساعة</p>

        <div className="flex items-center justify-center gap-6 mt-7 flex-wrap">
          {['+2,000 طالب', '5 ★ تقييم', 'ضمان 30 يوم'].map(t => (
            <div key={t} className="flex items-center gap-1.5 text-white/30 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400/50" />
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function LiveClassesPage() {
  const [data, setData]           = useState<LiveContent | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(false)
  const [videos, setVideos]       = useState<YTVideo[]>([])
  const [videosLoading, setVideosLoading] = useState(true)

  // Fetch Supabase content row
  const fetchContent = useCallback(async () => {
    setLoading(true)
    const { data: rows, error: err } = await supabase
      .from('content')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)

    if (err) { console.error('FETCH ERROR:', err); setError(true); setLoading(false); return }
    setData((rows?.[0] as LiveContent) ?? null)
    setLoading(false)
  }, [])

  // Fetch YouTube channel videos
  const fetchVideos = useCallback(async () => {
    setVideosLoading(true)
    try {
      const res = await fetch('/api/youtube')
      const json = await res.json()
      setVideos((json.videos ?? []) as YTVideo[])
    } catch { /* silent */ }
    setVideosLoading(false)
  }, [])

  useEffect(() => { fetchContent(); fetchVideos() }, [fetchContent, fetchVideos])

  const hasLive = !!data?.live_link
  const hasYT   = !!data?.youtube_link

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-full" />
          <div className="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-white/20 text-sm">جاري التحميل...</p>
      </div>
    </div>
  )

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: '#0a0f1e' }}>
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl">⚠️</div>
      <p className="text-white/30 text-sm">حدث خطأ في تحميل المحتوى</p>
      <button onClick={fetchContent} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all active:scale-95">
        أعد المحاولة
      </button>
    </div>
  )

  // ── Main ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(160deg,#0a0f1e 0%,#111827 50%,#0a0f1e 100%)' }}>
      <FloatingIcons />

      {/* Spacer for fixed header */}
      <div className="h-[70px]" />

      {/* Sub-header */}
      <div className="sticky top-[70px] z-30 backdrop-blur-xl bg-[#0a0f1e]/80 border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 text-red-400" />
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-white text-sm leading-none">Live Classes</p>
              <p className="text-xs text-white/30 mt-0.5">حصص مباشرة أسبوعية</p>
            </div>
            <p className="sm:hidden font-bold text-white text-sm">حصص مباشرة</p>
          </div>

          <div className="flex items-center gap-2">
            {hasLive && (
              <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span className="hidden sm:inline">مباشر الآن</span>
                <span className="sm:hidden">Live</span>
              </span>
            )}
            <span className="hidden md:flex items-center gap-1.5 text-white/25 text-xs bg-white/[0.04] px-3 py-1.5 rounded-full">
              <Bell className="w-3.5 h-3.5" />
              حصة جديدة كل أسبوع
            </span>
            <Link href="/courses"
              className="hidden sm:flex items-center gap-1 text-white/40 text-xs font-semibold hover:text-indigo-400 transition-colors py-1.5">
              <ChevronRight className="w-3.5 h-3.5" />
              الدورات
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">

        {/* ═══════════════════════════════════════════════════════════════
            LIVE STATE — stream embedded + join button
           ═══════════════════════════════════════════════════════════════ */}
        {hasLive && hasYT && (
          <>
            {/* Live badge + title bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-red-500/15 border border-red-400/30 text-red-300 text-sm font-bold px-4 py-2 rounded-full">
                  <span className="w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse" />
                  بث مباشر الآن
                </div>
                <div>
                  <h1 className="text-white font-extrabold text-lg sm:text-xl leading-tight">محادثة يومية — Daily Conversation</h1>
                  <p className="text-white/30 text-xs sm:text-sm mt-0.5">شاهد الحصة مباشرة — Watch live</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-2 self-start sm:self-auto">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center font-extrabold text-white text-xs">ح</div>
                <span className="text-white/60 text-xs font-medium">حمزة القصراوي</span>
              </div>
            </div>

            {/* Live stream embed — full width, prominent */}
            <div className="rounded-2xl overflow-hidden border border-red-500/20 bg-black shadow-2xl shadow-red-900/10 ring-1 ring-red-500/10">
              {/* Live indicator strip */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-red-600/20 to-red-500/10 border-b border-red-500/15">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-red-300 text-xs font-bold uppercase tracking-wider">Live</span>
                </div>
                <span className="text-white/20 text-xs flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  جاري البث...
                </span>
              </div>
              {/* YouTube embed */}
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={`${toEmbedUrl(data!.youtube_link!)}${toEmbedUrl(data!.youtube_link!).includes('?') ? '&' : '?'}autoplay=1&mute=1`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="بث مباشر"
                />
              </div>
            </div>

            {/* Action bar below the stream */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Join on Meet CTA */}
              <a href={data!.live_link!} target="_blank" rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-3 bg-white text-blue-800 font-extrabold px-6 py-4 rounded-2xl text-base hover:bg-blue-50 transition-all shadow-xl hover:-translate-y-0.5 active:scale-95">
                <MeetIcon size={24} />
                شارك في الحصة عبر Google Meet
                <ExternalLink className="w-4 h-4 opacity-50" />
              </a>

              {/* WhatsApp quick contact */}
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('مرحباً! أريد المشاركة في الحصة المباشرة')}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/30 active:scale-95">
                <WAIcon size={20} />
                <span className="hidden sm:inline">تواصل عبر واتساب</span>
                <span className="sm:hidden">واتساب</span>
              </a>
            </div>

            {/* Info strip */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-white/20 text-xs">
              <span className="flex items-center gap-1.5">📺 شاهد الحصة مباشرة مجاناً</span>
              <span className="hidden sm:inline text-white/10">|</span>
              <span className="flex items-center gap-1.5">💬 شارك وتفاعل عبر Google Meet</span>
              <span className="hidden sm:inline text-white/10">|</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                حصة جديدة كل أسبوع
              </span>
            </div>
          </>
        )}

        {/* Live link exists but no YouTube stream — fallback hero */}
        {hasLive && !hasYT && (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-indigo-900/40 border border-white/[0.06] shadow-2xl">
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative px-6 py-12 md:py-16 max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2.5 bg-red-500/15 border border-red-400/30 text-red-300 text-sm font-bold px-5 py-2.5 rounded-full mb-6">
                <span className="w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse" />
                بث مباشر الآن — Live Now
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-3">محادثة يومية — Daily Conversation</h1>
              <p className="text-white/40 text-base mb-8">تدرب على المحادثة الحقيقية مع المعلم مباشرةً</p>
              <a href={data!.live_link!} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-white text-blue-800 font-extrabold px-8 py-4 rounded-2xl text-lg hover:bg-blue-50 transition-all shadow-2xl hover:-translate-y-1 active:scale-95">
                <MeetIcon size={26} />
                انضم للحصة عبر Google Meet
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            NOT LIVE — show channel videos
           ═══════════════════════════════════════════════════════════════ */}
        {!hasLive && (
          <>
            {/* Hero banner — no session currently */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-indigo-900/40 border border-white/[0.06] shadow-2xl">
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative px-6 py-10 md:py-12 max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.1] text-white/40 text-sm font-semibold px-5 py-2.5 rounded-full mb-5">
                  <WifiOff className="w-4 h-4" />
                  لا توجد حصة مباشرة حالياً
                </div>
                <h1 className="text-xl md:text-3xl font-extrabold text-white mb-2 leading-snug">شاهد محتوى حمزة القصراوي</h1>
                <p className="text-white/40 text-sm md:text-base mb-6">تعلم الإنجليزية مع دروس وحصص مسجلة — تابع القناة لمزيد من المحتوى</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('أريد أن أعرف موعد الحصة المباشرة القادمة')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-900/30 hover:-translate-y-0.5 active:scale-95 text-sm">
                    <Bell className="w-4 h-4" />
                    أعلمني بموعد الحصة القادمة
                  </a>
                  <a href="https://www.youtube.com/@hamzaelqasraoui" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-red-600/80 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-red-900/30 hover:-translate-y-0.5 active:scale-95 text-sm">
                    <Play className="w-4 h-4 fill-white" />
                    تابع القناة على يوتيوب
                  </a>
                </div>
              </div>
            </section>

            {/* Channel videos grid */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
                    <Play className="w-5 h-5 text-red-400 fill-red-400" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-white text-lg sm:text-xl leading-none">دروس وحصص مسجلة</h2>
                    <p className="text-sm text-white/30 mt-1">من قناة حمزة القصراوي</p>
                  </div>
                </div>
                <a href="https://www.youtube.com/@hamzaelqasraoui" target="_blank" rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 text-red-400/70 hover:text-red-400 text-xs font-bold transition-colors">
                  عرض الكل على يوتيوب
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {videosLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-10 h-10">
                      <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-full" />
                      <div className="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-white/20 text-xs">جاري تحميل الفيديوهات...</p>
                  </div>
                </div>
              ) : videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map(v => <VideoCard key={v.id} video={v} />)}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                    <span className="text-3xl opacity-30">📺</span>
                  </div>
                  <p className="text-white/30 text-sm">لم يتم العثور على فيديوهات</p>
                  <a href="https://www.youtube.com/@hamzaelqasraoui" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-bold mt-3 transition-colors">
                    <Play className="w-4 h-4 fill-current" />
                    زيارة القناة على يوتيوب
                  </a>
                </div>
              )}
            </section>
          </>
        )}

        {/* ── 4. Comments ── */}
        <CommentsSection />

        {/* ── 5. WhatsApp CTA ── */}
        <WhatsAppCTA />

      </div>
    </div>
  )
}
