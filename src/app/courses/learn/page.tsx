'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronRight, ChevronLeft, Lock, CheckCircle2,
  Trophy, Clock, Target, ChevronDown, ChevronUp, Award,
  Zap, BookOpen, Star, Play, Pause, Settings,
  Volume2, Crown, X, Check, TrendingUp,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type VideoSource = 'youtube' | 'hosted' | 'uploaded'

interface Lesson {
  id: string
  titleAr: string
  titleEn: string
  duration: string
  durationMin: number
  source: VideoSource
  videoUrl: string
  descriptionAr: string
}

interface CourseLevel {
  id: string
  code: string
  nameAr: string
  colorKey: string
  lessons: Lesson[]
}

// ─── Mock Student ─────────────────────────────────────────────────────────────

const STUDENT = {
  nameAr: 'أحمد بنعلي',
  avatarInitial: 'أ',
  currentLevel: 'A2',
  levelLabelAr: 'يتحسن بسرعة',
  totalHours: 40,
  watchedHours: 12,
  streak: 7,
  isPaid: false,
}

// ─── Course Data ──────────────────────────────────────────────────────────────

const COURSE_LEVELS: CourseLevel[] = [
  {
    id: 'a1', code: 'A1', nameAr: 'المبتدئ', colorKey: 'emerald',
    lessons: [
      {
        id: 'a1-1', titleAr: 'مرحباً بك في إنجليزي.كوم', titleEn: 'Welcome to Inglizi.com',
        duration: '8:24', durationMin: 8, source: 'youtube',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        descriptionAr: 'تعرف على منهج الدورة وكيف ستتعلم الإنجليزية بشكل عملي وممتع. في هذا الدرس ستكتشف الطريقة المثلى للاستفادة من كل محتوى الدورة.',
      },
      {
        id: 'a1-2', titleAr: 'التحيات والتعريف بالنفس', titleEn: 'Greetings & Self-Introduction',
        duration: '11:15', durationMin: 11, source: 'youtube',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        descriptionAr: 'تعلم كيف تُقدّم نفسك وتحيّي الآخرين بشكل طبيعي وواثق مع تدريبات تفاعلية حية.',
      },
      {
        id: 'a1-3', titleAr: 'الأرقام والمفردات الأساسية', titleEn: 'Numbers & Basic Vocabulary',
        duration: '9:40', durationMin: 9, source: 'youtube',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        descriptionAr: 'إتقان الأرقام والكلمات اليومية الأكثر استخداماً في المحادثات اليومية.',
      },
      {
        id: 'a1-4', titleAr: 'الألوان والأيام والأشهر', titleEn: 'Colors, Days & Months',
        duration: '10:05', durationMin: 10, source: 'youtube',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        descriptionAr: 'مفردات أساسية لا غنى عنها في الحياة اليومية مع أمثلة جمل حقيقية.',
      },
    ],
  },
  {
    id: 'a2', code: 'A2', nameAr: 'ما قبل المتوسط', colorKey: 'blue',
    lessons: [
      {
        id: 'a2-1', titleAr: 'المضارع البسيط والمستمر', titleEn: 'Present Simple & Continuous',
        duration: '14:20', durationMin: 14, source: 'youtube',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        descriptionAr: 'إتقان زمن المضارع وأشكاله المختلفة مع تطبيقات عملية وتدريبات على الكلام.',
      },
      {
        id: 'a2-2', titleAr: 'الماضي البسيط', titleEn: 'Past Simple',
        duration: '16:10', durationMin: 16, source: 'youtube',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        descriptionAr: 'تعلم التحدث عن الأحداث الماضية بشكل صحيح وتلقائي.',
      },
      {
        id: 'a2-3', titleAr: 'أزمنة المستقبل', titleEn: 'Future Tenses',
        duration: '13:55', durationMin: 13, source: 'youtube',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        descriptionAr: 'التعبير عن الخطط والأحداث المستقبلية باستخدام will و going to.',
      },
      {
        id: 'a2-4', titleAr: 'الأسئلة والنفي', titleEn: 'Questions & Negations',
        duration: '12:30', durationMin: 12, source: 'youtube',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        descriptionAr: 'طريقة صياغة الأسئلة والنفي في اللغة الإنجليزية بشكل طبيعي.',
      },
    ],
  },
  {
    id: 'b1', code: 'B1', nameAr: 'المتوسط', colorKey: 'violet',
    lessons: [
      {
        id: 'b1-1', titleAr: 'الجمل الشرطية', titleEn: 'Conditionals',
        duration: '18:45', durationMin: 18, source: 'youtube',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        descriptionAr: 'الجمل الشرطية الصفر والأول والثاني وكيفية استخدامها في الكلام.',
      },
      {
        id: 'b1-2', titleAr: 'المبني للمجهول', titleEn: 'Passive Voice',
        duration: '15:20', durationMin: 15, source: 'youtube',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        descriptionAr: 'الفرق بين المبني للمعلوم والمجهول وكيفية التحويل بينهما.',
      },
      {
        id: 'b1-3', titleAr: 'الكلام المنقول', titleEn: 'Reported Speech',
        duration: '17:10', durationMin: 17, source: 'youtube',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        descriptionAr: 'كيفية نقل الكلام من مباشر إلى غير مباشر مع أمثلة واقعية.',
      },
    ],
  },
  {
    id: 'b2', code: 'B2', nameAr: 'فوق المتوسط', colorKey: 'rose',
    lessons: [
      {
        id: 'b2-1', titleAr: 'المفردات المتقدمة', titleEn: 'Advanced Vocabulary',
        duration: '20:00', durationMin: 20, source: 'youtube',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        descriptionAr: 'مفردات الأعمال والأكاديمية التي تحتاجها في بيئات العمل الدولية.',
      },
      {
        id: 'b2-2', titleAr: 'الطلاقة والنطق', titleEn: 'Fluency & Pronunciation',
        duration: '22:15', durationMin: 22, source: 'youtube',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        descriptionAr: 'تقنيات لتحسين الطلاقة والنطق الصحيح حتى تبدو كمتحدث أصلي.',
      },
      {
        id: 'b2-3', titleAr: 'المقابلات الوظيفية بالإنجليزية', titleEn: 'Job Interviews in English',
        duration: '25:30', durationMin: 25, source: 'youtube',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        descriptionAr: 'كيف تنجح في مقابلتك الوظيفية باللغة الإنجليزية بثقة واحترافية.',
      },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ALL_LESSONS = COURSE_LEVELS.flatMap(l => l.lessons)
const TOTAL_LESSONS = ALL_LESSONS.length

const SPEEDS = [0.75, 1, 1.25, 1.5]

const MOTIVATION_MSGS = [
  'استمر! أنت أقرب بـ 30% من التحدث بثقة 🔥',
  'كل درس يُقربك خطوة أخرى نحو هدفك 🎯',
  'الثبات هو مفتاح النجاح — واصل بقوة! 💪',
  'أنت تتحسن كل يوم، لا تتوقف الآن! ⭐',
]

const LEVEL_STYLE: Record<string, { badge: string; bar: string; bg: string; text: string; border: string }> = {
  emerald: { badge: 'bg-emerald-500', bar: 'bg-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  blue:    { badge: 'bg-blue-500',    bar: 'bg-blue-400',    bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
  violet:  { badge: 'bg-violet-500',  bar: 'bg-violet-400',  bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200'  },
  rose:    { badge: 'bg-rose-500',    bar: 'bg-rose-400',    bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200'    },
}

function canAccessLesson(lesson: Lesson): boolean {
  if (STUDENT.isPaid) return true
  const a1Ids = COURSE_LEVELS.find(l => l.code === 'A1')!.lessons.map(l => l.id)
  const a2FirstId = COURSE_LEVELS.find(l => l.code === 'A2')!.lessons[0].id
  return a1Ids.includes(lesson.id) || lesson.id === a2FirstId
}

// ─── VideoPlayer Component ────────────────────────────────────────────────────

function VideoPlayer({
  lesson, speed, onSpeedChange,
}: {
  lesson: Lesson
  speed: number
  onSpeedChange: (s: number) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSpeed, setShowSpeed] = useState(false)
  const [showCC, setShowCC] = useState(false)

  useEffect(() => {
    setIsPlaying(false)
    setShowSpeed(false)
  }, [lesson.id])

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed
  }, [speed])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) { videoRef.current.pause() } else { videoRef.current.play() }
    setIsPlaying(!isPlaying)
  }

  /* ── YouTube Embed ── */
  if (lesson.source === 'youtube') {
    const embedUrl = `${lesson.videoUrl}?rel=0&modestbranding=1&showinfo=0`
    return (
      <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
        <div style={{ paddingTop: '56.25%', position: 'relative' }}>
          <iframe
            src={embedUrl}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={lesson.titleAr}
          />
        </div>
        {/* Speed overlay pill */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          <div className="relative">
            <button
              onClick={() => setShowSpeed(v => !v)}
              className="bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-black transition-all"
            >
              <Settings className="w-3 h-3" />
              السرعة: {speed}x
            </button>
            {showSpeed && (
              <div className="absolute top-full mt-1 left-0 bg-gray-900 rounded-xl overflow-hidden shadow-2xl z-50 min-w-[100px]">
                {SPEEDS.map(s => (
                  <button
                    key={s}
                    onClick={() => { onSpeedChange(s); setShowSpeed(false) }}
                    className={`block w-full px-4 py-2.5 text-sm text-right transition-colors ${speed === s ? 'bg-blue-600 text-white' : 'text-white hover:bg-gray-700'}`}
                  >
                    {s}x {speed === s && '✓'}
                  </button>
                ))}
                <p className="text-gray-500 text-xs px-4 py-2 border-t border-gray-700">
                  * يطبق على يوتيوب داخلياً
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  /* ── Native Video (hosted / uploaded) ── */
  return (
    <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl group">
      <video
        ref={videoRef}
        src={lesson.videoUrl}
        className="w-full aspect-video object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      >
        {showCC && <track kind="subtitles" src="/subtitles/en.vtt" srcLang="en" label="English" default />}
      </video>

      {/* Centre play button (when paused) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center group/btn"
        >
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 transition-transform group-hover/btn:scale-110">
            <Play className="w-8 h-8 text-white fill-white translate-x-0.5" />
          </div>
        </button>
      )}

      {/* Bottom controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
              {isPlaying
                ? <Pause className="w-6 h-6" />
                : <Play className="w-6 h-6 fill-white" />}
            </button>
            <button className="text-white hover:text-blue-400 transition-colors">
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {/* Subtitles */}
            <button
              onClick={() => setShowCC(v => !v)}
              className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors ${showCC ? 'bg-blue-600 border-blue-500 text-white' : 'border-white/30 text-white hover:bg-white/20'}`}
            >
              CC
            </button>
            {/* Speed */}
            <div className="relative">
              <button
                onClick={() => setShowSpeed(v => !v)}
                className="bg-white/20 border border-white/30 text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-white/30 transition-colors"
              >
                <Settings className="w-3 h-3" />
                {speed}x
              </button>
              {showSpeed && (
                <div className="absolute bottom-full mb-2 left-0 bg-gray-900 rounded-xl overflow-hidden shadow-2xl z-50 min-w-[90px]">
                  {SPEEDS.map(s => (
                    <button
                      key={s}
                      onClick={() => { onSpeedChange(s); setShowSpeed(false) }}
                      className={`block w-full px-4 py-2.5 text-sm text-right transition-colors ${speed === s ? 'bg-blue-600 text-white' : 'text-white hover:bg-gray-700'}`}
                    >
                      {s}x {speed === s && '✓'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Locked Video Placeholder ─────────────────────────────────────────────────

function LockedVideoPlaceholder() {
  return (
    <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl aspect-video flex flex-col items-center justify-center text-center p-8">
      {/* Blurred preview backdrop */}
      <div className="absolute inset-0 opacity-10 blur-xl bg-gradient-to-br from-blue-600 to-violet-600" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center mb-6 animate-pulse">
          <Lock className="w-12 h-12 text-amber-400" />
        </div>
        <h3 className="text-white text-2xl font-bold mb-3">هذا الدرس مقفل</h3>
        <p className="text-slate-300 mb-2 max-w-xs">
          افتح هذا الدرس لمواصلة رحلتك نحو الإنجليزية
        </p>
        <p className="text-slate-400 text-sm mb-8 max-w-xs">
          "Unlock this lesson to continue your journey"
        </p>
        <a
          href="#upgrade"
          className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-8 py-3.5 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5"
        >
          <Crown className="w-5 h-5" />
          احصل على الوصول الكامل — 3,000 درهم / سنة
        </a>
      </div>
    </div>
  )
}

// ─── Completion Banner ────────────────────────────────────────────────────────

function CompletionBanner({ nextLesson, onNext, onClose }: {
  nextLesson: Lesson | null
  onNext: () => void
  onClose: () => void
}) {
  return (
    <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg shadow-emerald-500/25 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-white/25 rounded-full flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-base">أحسنت! 🎉 تم إنهاء الدرس بنجاح</p>
          {nextLesson && (
            <p className="text-emerald-100 text-sm">الدرس التالي: {nextLesson.titleAr}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {nextLesson && canAccessLesson(nextLesson) && (
          <button
            onClick={onNext}
            className="bg-white text-emerald-700 font-bold px-4 py-2 rounded-xl text-sm hover:bg-emerald-50 transition-colors"
          >
            التالي ←
          </button>
        )}
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

// ─── Student Dashboard (Right Panel) ─────────────────────────────────────────

function StudentDashboard({
  completedCount,
  progressPct,
  motivationMsg,
}: {
  completedCount: number
  progressPct: number
  motivationMsg: string
}) {
  const isEligible = progressPct >= 80
  const levelCodes = ['A1', 'A2', 'B1', 'B2']

  return (
    <div className="space-y-4">

      {/* ── Profile + Progress Card ─────────────────────── */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-xl shadow-blue-500/25 overflow-hidden relative">
        {/* Decorative circle */}
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 -right-4 w-24 h-24 bg-white/5 rounded-full" />

        {/* Student info */}
        <div className="relative flex items-center gap-3 mb-5">
          <div className="w-13 h-13 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-xl font-bold w-12 h-12 shrink-0">
            {STUDENT.avatarInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-base">{STUDENT.nameAr}</p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-xs bg-white/25 px-2 py-0.5 rounded-full font-semibold">{STUDENT.currentLevel}</span>
              <span className="text-xs text-blue-200">{STUDENT.levelLabelAr}</span>
            </div>
          </div>
          {!STUDENT.isPaid && (
            <span className="shrink-0 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full">
              مجاني
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="relative mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-200 text-sm">إجمالي التقدم</span>
            <span className="font-extrabold text-white text-xl leading-none">{progressPct}%</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-green-300 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-blue-200 text-xs mt-1.5">{completedCount} من {TOTAL_LESSONS} درس مكتمل</p>
        </div>

        {/* Motivation */}
        <div className="relative bg-white/10 border border-white/20 rounded-xl p-3.5">
          <p className="text-sm text-white leading-relaxed">{motivationMsg}</p>
        </div>
      </div>

      {/* ── Stats Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">

        {/* Hours Watched */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs text-slate-500 leading-tight">ساعات المشاهدة</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-800 leading-none">{STUDENT.watchedHours}h</p>
          <p className="text-xs text-slate-400 mt-1">من {STUDENT.totalHours}h الإجمالية</p>
          <div className="mt-2.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${(STUDENT.watchedHours / STUDENT.totalHours) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Level */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs text-slate-500 leading-tight">مستواك الحالي</span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 leading-none">{STUDENT.currentLevel}</p>
          <p className="text-xs text-slate-400 mt-1">{STUDENT.levelLabelAr}</p>
          <div className="mt-2.5 flex gap-1">
            {levelCodes.map(l => (
              <div
                key={l}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  l === STUDENT.currentLevel
                    ? 'bg-emerald-500'
                    : l < STUDENT.currentLevel
                      ? 'bg-emerald-200'
                      : 'bg-slate-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Streak */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-orange-500" />
            </div>
            <span className="text-xs text-slate-500 leading-tight">أيام متتالية</span>
          </div>
          <p className="text-2xl font-extrabold text-orange-500 leading-none">{STUDENT.streak} 🔥</p>
          <p className="text-xs text-slate-400 mt-1">أسبوع كامل!</p>
        </div>

        {/* Lessons done */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-violet-600" />
            </div>
            <span className="text-xs text-slate-500 leading-tight">دروس مكتملة</span>
          </div>
          <p className="text-2xl font-extrabold text-violet-600 leading-none">{completedCount}</p>
          <p className="text-xs text-slate-400 mt-1">من أصل {TOTAL_LESSONS} درس</p>
        </div>
      </div>

      {/* ── Certificate Card ─────────────────────────────── */}
      <div className={`rounded-2xl p-5 shadow-sm border transition-all ${isEligible ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isEligible ? 'bg-amber-100' : 'bg-slate-100'}`}>
            <Award className={`w-6 h-6 ${isEligible ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">شهادة الإتمام</p>
            <p className={`text-xs font-medium ${isEligible ? 'text-amber-600' : 'text-slate-400'}`}>
              {isEligible
                ? '✓ مؤهل للحصول على الشهادة!'
                : `مطلوب ${80 - progressPct}% إضافي للتأهل`}
            </p>
          </div>
        </div>

        {!isEligible && (
          <div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">{progressPct}% من 80% المطلوب</p>
          </div>
        )}

        {isEligible && (
          <button className="w-full mt-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm shadow-sm">
            🏆 تحميل شهادتك الآن
          </button>
        )}
      </div>

      {/* ── Upgrade CTA (free users) ─────────────────────── */}
      {!STUDENT.isPaid && (
        <div id="upgrade" className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-xl overflow-hidden relative">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-500/10 rounded-full" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <p className="font-bold text-base">اشترك وافتح كل شيء</p>
            </div>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
              وصول فوري لجميع الدروس من A1 إلى B2 بدون قيود
            </p>
            <ul className="space-y-2 mb-5">
              {[
                'جميع الدروس (A1 → B2)',
                'تمارين تفاعلية + اختبارات',
                'تصحيح النطق بالذكاء الاصطناعي',
                'شهادة إتمام معتمدة',
                'دعم مباشر عبر واتساب',
              ].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3.5 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 text-sm">
              اشترك الآن — 3,000 درهم / سنة
            </button>
            <p className="text-center text-xs text-slate-500 mt-2.5">ضمان استرداد الأموال خلال 30 يوماً ✓</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Course Outline Component ─────────────────────────────────────────────────

function CourseOutline({
  currentId,
  completed,
  expanded,
  onToggleLevel,
  onSelect,
}: {
  currentId: string
  completed: Set<string>
  expanded: Set<string>
  onToggleLevel: (id: string) => void
  onSelect: (lesson: Lesson) => void
}) {
  const progressPct = Math.round((completed.size / TOTAL_LESSONS) * 100)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">محتوى الدورة</h2>
            <p className="text-xs text-slate-500">{TOTAL_LESSONS} درس • 4 مستويات</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-bold text-blue-600">{progressPct}% مكتمل</span>
        </div>
      </div>

      {/* Levels */}
      {COURSE_LEVELS.map(level => {
        const style = LEVEL_STYLE[level.colorKey]
        const isOpen = expanded.has(level.id)
        const doneCount = level.lessons.filter(l => completed.has(l.id)).length

        return (
          <div key={level.id} className="border-b border-slate-100 last:border-0">
            {/* Level accordion header */}
            <button
              onClick={() => onToggleLevel(level.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-right"
            >
              <div className="flex items-center gap-3">
                <span className={`w-10 h-10 rounded-xl ${style.badge} text-white font-bold text-sm flex items-center justify-center shadow-sm shrink-0`}>
                  {level.code}
                </span>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{level.nameAr}</p>
                  <p className="text-xs text-slate-500">{doneCount} / {level.lessons.length} دروس</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${style.bar} rounded-full transition-all`}
                    style={{ width: `${(doneCount / level.lessons.length) * 100}%` }}
                  />
                </div>
                {isOpen
                  ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
              </div>
            </button>

            {/* Lessons */}
            {isOpen && (
              <div className="bg-slate-50/60">
                {level.lessons.map((lesson, idx) => {
                  const accessible = canAccessLesson(lesson)
                  const isDone = completed.has(lesson.id)
                  const isCurrent = lesson.id === currentId

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => accessible && onSelect(lesson)}
                      disabled={!accessible}
                      className={[
                        'w-full flex items-center gap-3 px-5 py-3.5 text-right transition-all',
                        isCurrent ? 'bg-blue-50 border-r-4 border-blue-500' : '',
                        accessible ? 'hover:bg-white cursor-pointer' : 'cursor-not-allowed',
                        !accessible ? 'opacity-70' : '',
                      ].join(' ')}
                    >
                      {/* Status icon */}
                      <div className={[
                        'w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-all',
                        isDone ? 'bg-emerald-100' : isCurrent ? 'bg-blue-100' : !accessible ? 'bg-slate-200' : 'bg-white border border-slate-200',
                      ].join(' ')}>
                        {isDone
                          ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          : !accessible
                            ? <Lock className="w-4 h-4 text-slate-400" />
                            : isCurrent
                              ? <Play className="w-4 h-4 text-blue-500 fill-blue-500 translate-x-0.5" />
                              : <span className="text-xs font-bold text-slate-500">{idx + 1}</span>
                        }
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={[
                          'font-medium text-sm truncate',
                          isCurrent ? 'text-blue-700' : isDone ? 'text-slate-500' : !accessible ? 'text-slate-400' : 'text-slate-700',
                        ].join(' ')}>
                          {lesson.titleAr}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{lesson.titleEn}</p>
                      </div>

                      {/* Duration / lock */}
                      <div className="shrink-0">
                        {!accessible
                          ? <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                              <Lock className="w-3 h-3" /> مقفل
                            </div>
                          : <span className="text-xs text-slate-400 tabular-nums">{lesson.duration}</span>
                        }
                      </div>
                    </button>
                  )
                })}

                {/* Per-level upgrade nudge (skip A1) */}
                {!STUDENT.isPaid && level.code !== 'A1' && (
                  <div className={`mx-4 mb-4 mt-1 p-4 ${style.bg} ${style.border} border rounded-xl`}>
                    <p className={`text-sm font-bold ${style.text} mb-1`}>
                      🔓 افتح جميع دروس مستوى {level.code}
                    </p>
                    <p className="text-xs text-slate-500 mb-3">
                      اشترك للوصول الفوري بدون قيود
                    </p>
                    <a
                      href="#upgrade"
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      اشترك — 3,000 درهم/سنة
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CourseLearningPage() {
  const [currentId, setCurrentId] = useState('a1-1')
  const [completed, setCompleted] = useState<Set<string>>(new Set(['a1-1', 'a1-2']))
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['a1', 'a2']))
  const [showBanner, setShowBanner] = useState(false)
  const [speed, setSpeed] = useState(1)

  const currentLesson = ALL_LESSONS.find(l => l.id === currentId)!
  const currentIndex = ALL_LESSONS.indexOf(currentLesson)
  const prevLesson = currentIndex > 0 ? ALL_LESSONS[currentIndex - 1] : null
  const nextLesson = currentIndex < ALL_LESSONS.length - 1 ? ALL_LESSONS[currentIndex + 1] : null

  const progressPct = Math.round((completed.size / TOTAL_LESSONS) * 100)
  const motivationMsg = MOTIVATION_MSGS[completed.size % MOTIVATION_MSGS.length]

  const handleSelect = (lesson: Lesson) => {
    if (!canAccessLesson(lesson)) return
    setCurrentId(lesson.id)
    setShowBanner(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleMarkComplete = () => {
    setCompleted(prev => new Set(Array.from(prev).concat(currentId)))
    setShowBanner(true)
  }

  const toggleLevel = (id: string) => {
    setExpanded(prev => {
      const next = new Set(Array.from(prev))
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const isCurrentDone = completed.has(currentId)
  const isAccessible = canAccessLesson(currentLesson)

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Breadcrumb bar ────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">الرئيسية</Link>
          <ChevronLeft className="w-4 h-4 text-slate-300" />
          <Link href="/courses" className="hover:text-blue-600 transition-colors">الدورات</Link>
          <ChevronLeft className="w-4 h-4 text-slate-300" />
          <span className="text-slate-800 font-semibold truncate">دورة الإنجليزية الشاملة</span>
          <span className="mr-auto text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-0.5 rounded-full hidden sm:inline">
            {progressPct}% مكتمل
          </span>
        </div>
      </div>

      {/* ── Page body ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-5 lg:py-7">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ══════════════════════════════════════════════════════════
              LEFT PANEL  (70%)
          ══════════════════════════════════════════════════════════ */}
          <div className="w-full lg:w-[70%] space-y-5">

            {/* Video Player or Locked Placeholder */}
            {isAccessible
              ? <VideoPlayer lesson={currentLesson} speed={speed} onSpeedChange={setSpeed} />
              : <LockedVideoPlaceholder />
            }

            {/* Completion banner */}
            {showBanner && (
              <CompletionBanner
                nextLesson={nextLesson}
                onNext={() => nextLesson && handleSelect(nextLesson)}
                onClose={() => setShowBanner(false)}
              />
            )}

            {/* Lesson Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              {/* Tags row */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                  {currentLesson.titleEn}
                </span>
                {isCurrentDone && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> مكتمل ✅
                  </span>
                )}
                {!isAccessible && (
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" /> مقفل
                  </span>
                )}
              </div>

              {/* Title row */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-xl font-extrabold text-slate-800 leading-snug">{currentLesson.titleAr}</h1>
                <div className="flex items-center gap-1.5 text-slate-500 text-sm shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                  <span className="tabular-nums">{currentLesson.duration}</span>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed text-sm mb-5">{currentLesson.descriptionAr}</p>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 flex-wrap">
                {/* Previous */}
                <button
                  onClick={() => prevLesson && handleSelect(prevLesson)}
                  disabled={!prevLesson || !canAccessLesson(prevLesson ?? ALL_LESSONS[0])}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <ChevronRight className="w-4 h-4" />
                  الدرس السابق
                </button>

                {/* Mark complete */}
                {!isCurrentDone && isAccessible && (
                  <button
                    onClick={handleMarkComplete}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-blue-500/30 text-sm"
                  >
                    <Check className="w-4 h-4" />
                    تحديد كمكتمل
                  </button>
                )}
                {isCurrentDone && (
                  <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm px-3 py-2.5">
                    <CheckCircle2 className="w-5 h-5" /> تم إتمام الدرس
                  </span>
                )}

                {/* Next */}
                <button
                  onClick={() => nextLesson && handleSelect(nextLesson)}
                  disabled={!nextLesson || !canAccessLesson(nextLesson ?? ALL_LESSONS[0])}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
                >
                  الدرس التالي
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Course Outline */}
            <CourseOutline
              currentId={currentId}
              completed={completed}
              expanded={expanded}
              onToggleLevel={toggleLevel}
              onSelect={handleSelect}
            />
          </div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT PANEL  (30%)  — sticky on desktop
          ══════════════════════════════════════════════════════════ */}
          <div className="w-full lg:w-[30%]">
            <div className="lg:sticky lg:top-16 lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto lg:pb-4 space-y-4 scrollbar-thin">
              <StudentDashboard
                completedCount={completed.size}
                progressPct={progressPct}
                motivationMsg={motivationMsg}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
