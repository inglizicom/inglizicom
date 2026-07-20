'use client'

import { Suspense, Component, type ReactNode, useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Loader2, KeyRound, BookOpen, FileText, Download, CheckCircle2, Circle,
  ExternalLink, Sparkles, LogOut, TrendingUp, Home, Route, Award, PlayCircle, ArrowLeft,
  Flame, Lock, AlertCircle, MessageSquareText, Video, PenLine, HelpCircle, Mic,
  ChevronLeft, ChevronRight, ChevronDown, ListChecks, Bell, MessageSquare, Star, Trophy, Medal,
  CalendarDays, Clock, BarChart3, Send, Play, Coins,
} from 'lucide-react'
import {
  fetchStudentSpace, completeExercise, logActivity, fileUrl, studentLogin, getDeviceId, deviceValid, fetchUnitSteps,
  fetchCourseCatalog, sendHeartbeat, fetchStudentAvatar, type CatalogCourse,
  type StudentSpace, type StudentAssignment, type PortalLesson, type PortalModule, type PortalCourse, type UnitSteps,
} from '@/lib/student-portal'
import { checkCertificates, CERT_KIND_AR, type StudentCert } from '@/lib/certificates'
import { openLesson, completeLesson, fetchStudentResources, resourceUrl, fetchProgressMeta, fetchReadingUnits, fetchMySubmissions, fetchUnitExams, fetchNotifications, markNotificationsRead, EXAMS_URL, CORRECTOR_WHATSAPP, type CourseResource, type ProgressMeta, type UnitSubmission, type StudentNotification } from '@/lib/lms'
import VideoPlayer from '@/components/VideoPlayer'
import QuizRunner from '@/components/QuizRunner'
import UnitExamRunner from '@/components/UnitExamRunner'
import ReadingViewer from '@/components/ReadingViewer'
import SubmissionPanel from '@/components/SubmissionPanel'
import StudentAnnouncements from '@/components/StudentAnnouncements'
import FinalExam from '@/components/FinalExam'
import RewardsCenter from '@/components/RewardsCenter'
import PracticeHub from '@/components/PracticeHub'
import VocabGames from '@/components/VocabGames'
import PictureWordGame from '@/components/PictureWordGame'
import { fetchCertificate, type Certificate } from '@/lib/lms'
import { earnCoins, streakBonus, fetchCoins, type EarnAction, type CoinSummary } from '@/lib/gamification'
import { courseTheme, themeForKey } from '@/lib/course-theme'
import { PROMO_CATALOG, MAX_DISCOUNT_PCT, seatsLeftThisMonth, type PromoCourse } from '@/data/course-catalog'
import { isDemo, DEMO_SPACE } from '@/lib/demo'
import { fetchStudentAnnouncements, type StudentAnnouncement } from '@/lib/announcements'

const isVideoUrl = (u?: string | null) => !!u && /(youtube\.com|youtu\.be)/i.test(u)
const ytId = (u?: string | null) => {
  const m = (u || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/))([\w-]{11})/) || (u || '').match(/[?&]v=([\w-]{11})/)
  return m ? m[1] : null
}
const ytThumb = (u?: string | null) => { const id = ytId(u); return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null }
/* AI-generated topical illustration (keyless, URL-based). We overlay the Arabic
   title as real HTML text on top — AI renders Arabic glyphs poorly, so we ask
   for "no text" art and add the words ourselves. Seed = lesson id → stable image. */
const aiThumb = (topic: string, seed: string) => {
  const prompt = `vibrant colorful cartoon illustration, English language learning scene about "${topic}", happy cartoon people and everyday objects, lively detailed background, playful professional vector art, bright lighting, no text, no letters, no words`
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=640&height=360&nologo=true&model=flux&seed=${encodeURIComponent(seed)}`
}
const NOTIF_SEEN_KEY = 'inglizi.notif_seen'

const fmtShort = (s?: string | null) => s ? new Date(s).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric' }) : '—'
const fmtTime  = (s?: string | null) => s ? new Date(s).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' }) : ''
const initialsOf = (name: string) => { const p = (name || '').trim().split(/\s+/); return ((p[0]?.[0] ?? '?') + (p[1]?.[0] ?? '')).toUpperCase() }
const hueOf = (name: string) => { let h = 0; for (const c of name || '') h = (h * 31 + c.charCodeAt(0)) % 360; return h }
function InitAva({ name, className }: { name: string; className?: string }) {
  const h = hueOf(name)
  return (
    <div className={`flex items-center justify-center font-black text-white ${className ?? ''}`}
      style={{ background: `linear-gradient(135deg, hsl(${h} 60% 52%), hsl(${(h + 40) % 360} 58% 42%))` }}>
      {initialsOf(name)}
    </div>
  )
}
const DAY_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

type Tab = 'home' | 'path' | 'tasks' | 'rewards' | 'files' | 'progress'
const TABS: Tab[] = ['home', 'path', 'tasks', 'rewards', 'files', 'progress']
const tabFromHash = (): Tab | null => { const b = (typeof window !== 'undefined' ? (location.hash || '').replace('#', '').split('/')[0] : '') as Tab; return TABS.includes(b) ? b : null }
const TOKEN_KEY = 'inglizi.student_token'
const HEARTBEAT_AR: Record<Tab, string> = {
  home: 'الرئيسية', path: 'مسار التعلّم', tasks: 'المهام',
  rewards: 'المكافآت', files: 'الملفات', progress: 'صفحة التقدّم',
}
const COURSE_KEY = 'inglizi.student_course.'   // + token → last chosen course id
const LTYPE_ICON: Record<string, any> = { video: Video, reading: FileText, exercise: PenLine, quiz: HelpCircle, speaking: Mic }
const LTYPE_AR: Record<string, string> = { video: 'فيديو', reading: 'قراءة', exercise: 'تمرين', quiz: 'اختبار', speaking: 'محادثة' }
const ACTIVITY = {
  login:              { ar: 'تسجيل دخول', icon: KeyRound, tone: 'text-zinc-500' },
  opened_lesson:      { ar: 'شاهد درسًا', icon: Video, tone: 'text-violet-500' },
  completed_lesson:   { ar: 'أكمل درسًا', icon: CheckCircle2, tone: 'text-emerald-500' },
  opened_exercise:    { ar: 'فتح تمرينًا', icon: PenLine, tone: 'text-amber-500' },
  completed_exercise: { ar: 'أكمل تمرينًا', icon: CheckCircle2, tone: 'text-emerald-500' },
  downloaded_file:    { ar: 'حمّل ملفًا', icon: Download, tone: 'text-rose-500' },
  opened_today_task:  { ar: 'بدأ مهمة اليوم', icon: PlayCircle, tone: 'text-blue-500' },
} as Record<string, { ar: string; icon: any; tone: string }>

export default function StudentSpacePage() {
  return (
    <PortalErrorBoundary>
      <Suspense fallback={<div className="min-h-screen bg-[#2a1d12]" />}><Portal /></Suspense>
    </PortalErrorBoundary>
  )
}

function Portal() {
  const sp = useSearchParams()
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)
  const [booting, setBooting] = useState(true)
  const demo = isDemo()   // ?demo=1 → token-free local preview (no backend)
  const [toast, setToast] = useState<string | null>(null)   // transient "new message" alert
  const [correctionPopup, setCorrectionPopup] = useState<StudentNotification | null>(null)   // urgent correction-done popup
  const [space, setSpace]     = useState<StudentSpace | null>(null)
  const [token, setToken]     = useState('')
  const [error, setError]     = useState('')
  const [tab, setTab]         = useState<Tab>('home')
  const [videoLesson, setVideoLesson] = useState<PortalLesson | null>(null)
  const [quizLesson, setQuizLesson] = useState<PortalLesson | null>(null)
  const [notifOpen, setNotifOpen] = useState(false)
  const [seenSig, setSeenSig] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem(NOTIF_SEEN_KEY) || '') : '')
  const [resources, setResources] = useState<CourseResource[]>([])
  const [meta, setMeta] = useState<ProgressMeta | null>(null)
  const [readingUnits, setReadingUnits] = useState<Set<string>>(new Set())
  const [readingUnit, setReadingUnit] = useState<{ id: string; title: string } | null>(null)
  const [submissions, setSubmissions] = useState<UnitSubmission[]>([])
  const [submitUnit, setSubmitUnit] = useState<{ id: string; title: string } | null>(null)
  const [unitExams, setUnitExams] = useState<{ module_id: string; passed: boolean }[]>([])
  const [examUnit, setExamUnit] = useState<{ id: string; title: string } | null>(null)
  const [notifs, setNotifs] = useState<StudentNotification[]>([])
  // new-device WhatsApp OTP
  const [otpFor, setOtpFor] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpPhone, setOtpPhone] = useState('')
  const [otpMsg, setOtpMsg] = useState('')
  const [otpBusy, setOtpBusy] = useState(false)
  const [otpReveal, setOtpReveal] = useState(false)   // show the self-serve WhatsApp-OTP option
  const [forcedMsg, setForcedMsg] = useState('')      // shown on login after a forced logout
  const seenCorrections = useRef<Set<string> | null>(null)
  const seenAnns = useRef<Set<string> | null>(null)
  const [anns, setAnns] = useState<StudentAnnouncement[]>([])
  const [showExam, setShowExam] = useState(false)
  const [cert, setCert] = useState<Certificate | null>(null)
  const [myCerts, setMyCerts] = useState<StudentCert[]>([])           // generic auto-awarded certificates
  const [newCert, setNewCert] = useState<StudentCert | null>(null)    // celebratory popup when one is freshly earned
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)     // staff-managed profile photo
  const [unitSteps, setUnitSteps] = useState<UnitSteps>({})   // server-tracked reading/exam steps
  const [coins, setCoins] = useState<CoinSummary | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)   // which enrolled course the portal is showing
  const [catalog, setCatalog] = useState<CatalogCourse[]>([])   // ALL published courses (enrolled = open, rest = locked)
  const [pickerOpen, setPickerOpen] = useState(false)           // user tapped the course switcher
  const [practice, setPractice] = useState<'sentence' | 'translation' | null>(null)
  const [vocabOpen, setVocabOpen] = useState(false)
  const [pictureOpen, setPictureOpen] = useState(false)

  async function enter(rawToken: string, isAuto = false): Promise<boolean> {
    const t = rawToken.trim().toUpperCase(); if (!t) return false
    setLoading(true); setError('')
    // 1) device-bound login (anti account-sharing)
    const gate = await studentLogin(t)
    if (!gate.ok) {
      setLoading(false)
      if (gate.reason === 'device_limit') { setOtpFor(t); setOtpSent(false); setOtpCode(''); setOtpMsg(''); setError(''); return false }  // → WhatsApp OTP step-up
      if (gate.reason === 'invalid') { if (!isAuto) setError('رمز غير صحيح، تواصل مع الإدارة.'); return false }
      if (!isAuto) setError('تعذّر الدخول، حاول مرة أخرى أو تواصل مع الإدارة.')
      return false
    }
    // 2) load the space
    const res = await fetchStudentSpace(t); setLoading(false)
    if (!res.found) { if (!isAuto) setError('رمز غير صحيح، تواصل مع الإدارة.'); return false }
    setSpace(res); setToken(t)
    // on refresh (auto-login) restore the tab from the URL; on a fresh login go home
    const restored = isAuto ? tabFromHash() : null
    if (restored) setTab(restored)
    else { setTab('home'); try { history.replaceState({ tab: 'home' }, '', '#home') } catch {} }
    try { localStorage.setItem(TOKEN_KEY, t) } catch {}
    logActivity(t, 'login')
    return true
  }
  useEffect(() => {
    if (demo) { setSpace(DEMO_SPACE); setToken('DEMO'); fetchCoins('DEMO').then(setCoins); setBooting(false); return }   // token-free local preview
    (async () => {
      const t = sp.get('token') || (() => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } })()
      if (t) await enter(t, true)
      setBooting(false)
    })()
  }, [])
  async function refresh() { if (demo || !token) return; const r = await fetchStudentSpace(token); if (r.found) setSpace(r) }

  /* ── In-app routing: the active tab lives in the URL hash so a refresh keeps
     the student where they were, and the browser Back/swipe button moves between
     tabs (and closes open overlays) instead of leaving the site. ── */
  const overlayOpen = !!(videoLesson || quizLesson || readingUnit || submitUnit || examUnit || vocabOpen || pictureOpen || practice || showExam || notifOpen)
  const overlayRef = useRef(overlayOpen); overlayRef.current = overlayOpen
  function closeOverlays() { setVideoLesson(null); setQuizLesson(null); setReadingUnit(null); setSubmitUnit(null); setExamUnit(null); setVocabOpen(false); setPictureOpen(false); setPractice(null); setShowExam(false); setNotifOpen(false) }
  function goTab(t: Tab) { setTab(t); try { history.pushState({ tab: t }, '', '#' + t) } catch {} ; if (typeof window !== 'undefined') window.scrollTo({ top: 0 }) }
  const prevOverlay = useRef(false)
  useEffect(() => { if (overlayOpen && !prevOverlay.current) { try { history.pushState({ ov: 1 }, '') } catch {} } prevOverlay.current = overlayOpen }, [overlayOpen])
  useEffect(() => {
    const onPop = () => {
      if (overlayRef.current) { closeOverlays(); return }   // Back closes a game/lesson/etc.
      setTab(tabFromHash() ?? 'home')
      if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  useEffect(() => { if (token && !demo) { fetchStudentResources(token).then(setResources); fetchProgressMeta(token).then(setMeta); fetchReadingUnits(token).then(ids => setReadingUnits(new Set(ids))); fetchMySubmissions(token).then(setSubmissions); fetchUnitExams(token).then(setUnitExams); fetchNotifications(token).then(setNotifs); fetchStudentAnnouncements(token).then(setAnns); fetchCertificate(token).then(setCert); fetchUnitSteps(token).then(setUnitSteps); fetchStudentAvatar(token).then(setAvatarUrl) } }, [token, space])

  // generic certificates: server awards anything newly earned, then returns the full list
  useEffect(() => {
    if (!token || demo) return
    checkCertificates(token).then(r => {
      setMyCerts(r.certs)
      if (r.newSerials.length > 0) {
        const c = r.certs.find(x => x.serial === r.newSerials[0])
        if (c) setNewCert(c)
      }
    })
  }, [token, space])

  // presence heartbeat — powers the owner's "online now" panel (every 60s + on tab switch)
  useEffect(() => {
    if (!token || demo) return
    const send = () => sendHeartbeat(token, HEARTBEAT_AR[tab] ?? tab, selectedCourseId)
    send()
    const iv = setInterval(send, 60_000)
    return () => clearInterval(iv)
  }, [token, tab, selectedCourseId])
  // coins are PER COURSE — refetch when the chosen course changes
  useEffect(() => { if (token && !demo) fetchCoins(token, selectedCourseId).then(setCoins) }, [token, space, selectedCourseId])
  // full catalog (for the picker's locked courses) — loaded once
  useEffect(() => { fetchCourseCatalog().then(setCatalog) }, [])
  // pick the course to show: keep a valid prior choice, else the saved one, else
  // auto-select when there's only one (the picker is shown for 2+).
  useEffect(() => {
    const cs = space?.courses ?? []
    setSelectedCourseId(prev => {
      if (prev && cs.some(c => c.id === prev)) return prev
      let saved: string | null = null
      try { saved = localStorage.getItem(COURSE_KEY + token) } catch {}
      if (saved && cs.some(c => c.id === saved)) return saved
      return cs.length === 1 ? cs[0].id : null
    })
  }, [space, token])
  // daily streak check (may award milestone coins) — once per session, on the chosen course
  useEffect(() => { if (token && !demo && selectedCourseId) streakBonus(token, selectedCourseId).then(r => { if (r && r.awarded > 0) fetchCoins(token, selectedCourseId).then(setCoins) }) }, [token, selectedCourseId])
  // whenever the student opens the course map, refetch the unlock inputs so a
  // finished correction (AI or team) is reflected immediately — no manual refresh
  useEffect(() => { if (tab === 'path' && token && !demo) { fetchMySubmissions(token).then(setSubmissions); fetchUnitExams(token).then(setUnitExams) } }, [tab])
  function reloadSubmissions() { if (token) fetchMySubmissions(token).then(setSubmissions) }
  function reloadExams() { if (token) fetchUnitExams(token).then(setUnitExams) }
  // refresh everything that can unlock the next unit (after a correction, AI or team)
  function reloadGate() { if (!token) return; fetchMySubmissions(token).then(setSubmissions); fetchUnitExams(token).then(setUnitExams); fetchProgressMeta(token).then(setMeta); refresh() }
  function refreshCoins() { if (token) fetchCoins(token, selectedCourseId).then(setCoins) }
  async function award(action: EarnAction, lessonId?: string | null, moduleId?: string | null) { const got = await earnCoins(token, action, lessonId, moduleId, selectedCourseId); if (got > 0) refreshCoins() }
  function chooseCourse(id: string) { setSelectedCourseId(id); setPickerOpen(false); try { localStorage.setItem(COURSE_KEY + token, id) } catch {} }

  // "message received" chime (3 gentle ascending tones)
  function getAudioCtx(): any {
    if (typeof window === 'undefined') return null
    const w = window as any
    const Ctx = w.AudioContext || w.webkitAudioContext; if (!Ctx) return null
    if (!w.__inglizi_ac) { try { w.__inglizi_ac = new Ctx() } catch { return null } }
    return w.__inglizi_ac
  }
  function playMessage() {
    try {
      const ac = getAudioCtx(); if (!ac) return
      if (ac.state === 'suspended') ac.resume()   // mobile: context starts suspended until unlocked
      const now = ac.currentTime
      ;[660, 880, 1175].forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain()
        o.type = 'sine'; o.frequency.value = f
        o.connect(g); g.connect(ac.destination)
        const t = now + i * 0.11
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
        o.start(t); o.stop(t + 0.22)
      })
    } catch {}
  }
  // iOS/Android block audio until the user interacts — unlock the shared context on first gesture.
  useEffect(() => {
    const unlock = () => { const ac = getAudioCtx(); if (ac && ac.state === 'suspended') ac.resume() }
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('touchstart', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => { window.removeEventListener('pointerdown', unlock); window.removeEventListener('touchstart', unlock); window.removeEventListener('keydown', unlock) }
  }, [])

  // Live guard: kick the session if access was removed; chime + toast on ANY new notification.
  useEffect(() => {
    if (!token || !space?.found || demo) return   // no live-guard polling in demo
    let alive = true
    async function tick() {
      if (!alive) return
      const ok = await deviceValid(token)
      if (alive && !ok) { setSpace(null); setToken(''); try { localStorage.removeItem(TOKEN_KEY) } catch {}; setForcedMsg('تم إنهاء جلستك على هذا الجهاز من قِبل الإدارة. سجّل الدخول مجددًا.'); return }
      const list = await fetchNotifications(token); if (!alive) return
      const unread = new Set(list.filter(n => !n.is_read).map(n => n.id))
      if (seenCorrections.current) {
        const fresh = [...unread].filter(id => !seenCorrections.current!.has(id))
        if (fresh.length) {
          playMessage()
          const freshNotifs = list.filter(n => fresh.includes(n.id))
          const corr = freshNotifs.find(n => n.type === 'correction')
          if (corr) setCorrectionPopup(corr)            // urgent clickable popup → jumps to the unlocked unit
          else setToast(freshNotifs[0].title)
        }
      } else {
        // first run after opening the app: surface any already-unread correction
        const corr = list.find(n => !n.is_read && n.type === 'correction')
        if (corr) { playMessage(); setCorrectionPopup(corr) }
      }
      seenCorrections.current = unread
      setNotifs(list)
      // a correction (AI or team) may have unlocked the next unit — refetch the gate inputs
      fetchMySubmissions(token).then(s => { if (alive) setSubmissions(s) })
      fetchUnitExams(token).then(e => { if (alive) setUnitExams(e) })
      // live announcements (chime + toast on a brand-new one)
      const a = await fetchStudentAnnouncements(token); if (!alive) return
      if (seenAnns.current) {
        const freshA = a.filter(x => !seenAnns.current!.has(x.id))
        if (freshA.length) { playMessage(); setToast(freshA[0].title) }
      }
      seenAnns.current = new Set(a.map(x => x.id))
      setAnns(a)
    }
    tick()   // run once on open so a finished correction surfaces immediately
    const iv = setInterval(tick, 45_000)
    const onVis = () => { if (document.visibilityState === 'visible') tick() }
    document.addEventListener('visibilitychange', onVis)
    return () => { alive = false; clearInterval(iv); document.removeEventListener('visibilitychange', onVis) }
  }, [token, space?.found])
  function logout() { try { localStorage.removeItem(TOKEN_KEY) } catch {}; setSpace(null); setToken(''); setCode(''); setError('') }
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 4500); return () => clearTimeout(t) }, [toast])

  async function sendOtpCode() {
    if (!otpFor) return
    setOtpBusy(true); setOtpMsg('')
    try {
      const r = await fetch('/api/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: otpFor }) })
      const d = await r.json()
      if (d.sent) { setOtpSent(true); setOtpPhone(d.phone || '') }
      else setOtpMsg(d.reason === 'not_configured' ? 'خدمة التحقق غير مفعّلة بعد. تواصل مع الإدارة.' : d.reason === 'no_phone' ? 'لا يوجد رقم واتساب مسجّل لديك. تواصل مع الإدارة.' : d.reason === 'rate' ? 'انتظر دقيقة قبل طلب رمز جديد.' : d.reason === 'invalid' ? 'رمز الدخول غير صحيح.' : 'تعذّر إرسال الرمز، حاول مجددًا.')
    } catch { setOtpMsg('تعذّر إرسال الرمز، حاول مجددًا.') }
    setOtpBusy(false)
  }
  async function verifyOtpCode() {
    if (!otpFor || otpCode.trim().length < 4) return
    setOtpBusy(true); setOtpMsg('')
    try {
      const r = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: otpFor, code: otpCode.trim(), device_id: getDeviceId(), ua: typeof navigator !== 'undefined' ? navigator.userAgent : '' }) })
      const d = await r.json()
      if (d.ok) { const t = otpFor; setOtpFor(''); setOtpSent(false); setOtpCode(''); setOtpBusy(false); await enter(t); return }
      setOtpMsg(d.reason === 'bad_code' ? 'الرمز غير صحيح.' : d.reason === 'expired' ? 'انتهت صلاحية الرمز، اطلب رمزًا جديدًا.' : d.reason === 'locked' ? 'محاولات كثيرة، اطلب رمزًا جديدًا.' : d.reason === 'no_code' ? 'اطلب الرمز أولًا.' : 'تعذّر التحقق، حاول مجددًا.')
    } catch { setOtpMsg('تعذّر التحقق، حاول مجددًا.') }
    setOtpBusy(false)
  }

  if (booting) return <div className="min-h-screen bg-[#2a1d12] flex items-center justify-center"><Loader2 className="animate-spin text-[#facc15]" size={28} /></div>

  /* ════ LOGIN ════ */
  if (!space?.found) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#2a1d12] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#facc15] text-black flex items-center justify-center font-black text-3xl mb-3">I</div>
            <h1 className="text-white font-black text-[22px]">فضاء الطالب</h1>
            <p className="text-zinc-400 text-[13px] mt-1">منصة Inglizi.com لتعلّم الإنجليزية</p>
          </div>
          {forcedMsg && !otpFor && (
            <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl px-4 py-3 mb-3 text-amber-200 text-[12.5px] flex items-center gap-2"><Lock size={15} /> {forcedMsg}</div>
          )}
          <form onSubmit={e => { e.preventDefault(); otpFor ? (otpSent ? verifyOtpCode() : sendOtpCode()) : enter(code) }} className="bg-white rounded-3xl p-6 shadow-2xl">
            {!otpFor ? (
              <>
                <label className="flex items-center gap-1.5 text-[13px] font-bold text-zinc-700 mb-2"><KeyRound size={15} className="text-zinc-400" /> رمز الدخول</label>
                <input value={code} onChange={e => setCode(e.target.value)} placeholder="ING-XXXXXXXX" dir="ltr"
                  className="w-full px-4 py-3.5 text-[17px] font-bold tracking-widest text-center uppercase bg-zinc-50 border-2 border-zinc-200 rounded-2xl focus:outline-none focus:border-[#facc15]" />
                {error && <p className="text-[13px] text-red-600 mt-2 font-medium flex items-center gap-1.5"><AlertCircle size={14} /> {error}</p>}
                <button type="submit" disabled={loading || !code.trim()} className="mt-4 w-full py-3.5 rounded-2xl bg-black text-white font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />} دخول
                </button>
                <p className="text-[11px] text-zinc-400 text-center mt-3 leading-relaxed">ستجد رمز الدخول على وصل الدفع الخاص بك أو من إدارة Inglizi.com.</p>
              </>
            ) : (
              <>
                {/* primary: warning + ask administration */}
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-3"><Lock size={22} className="text-amber-600" /></div>
                <h2 className="text-[15px] font-black text-zinc-900 text-center">الحساب مُفعّل على جهاز آخر</h2>
                <p className="text-[12.5px] text-zinc-500 leading-relaxed text-center mt-1.5 mb-4">هذا الحساب مرتبط بجهاز آخر. اطلب من الإدارة منحك صلاحية الدخول من هذا الجهاز.</p>
                <a href={`https://wa.me/${CORRECTOR_WHATSAPP}?text=${encodeURIComponent(`أرغب بالدخول من جهاز جديد إلى فضاء الطالب. رمزي: ${otpFor}`)}`} target="_blank" rel="noreferrer"
                  className="w-full py-3.5 rounded-2xl bg-[#25D366] text-white font-bold text-[15px] flex items-center justify-center gap-2"><MessageSquare size={17} /> تواصل مع الإدارة عبر واتساب</a>

                {/* secondary: optional self-serve WhatsApp code */}
                {!otpReveal ? (
                  <button type="button" onClick={() => setOtpReveal(true)} className="w-full text-[12px] text-zinc-400 mt-3 hover:text-zinc-600 underline">أو فعّل جهازك تلقائيًا عبر رمز واتساب</button>
                ) : (
                  <div className="mt-4 pt-4 border-t border-zinc-100">
                    {!otpSent ? (
                      <button type="button" onClick={sendOtpCode} disabled={otpBusy} className="w-full py-3 rounded-2xl bg-zinc-900 text-white font-bold text-[14px] flex items-center justify-center gap-2 disabled:opacity-50">
                        {otpBusy ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />} أرسل رمز تحقق إلى واتساب
                      </button>
                    ) : (
                      <>
                        <p className="text-[12px] text-zinc-500 mb-2 text-center">أدخل الرمز المُرسل إلى <span dir="ltr" className="font-bold">{otpPhone}</span></p>
                        <input value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="••••••" dir="ltr"
                          className="w-full px-4 py-3 text-[20px] font-black tracking-[8px] text-center bg-zinc-50 border-2 border-zinc-200 rounded-2xl focus:outline-none focus:border-[#facc15]" />
                        <button type="submit" disabled={otpBusy || otpCode.trim().length < 4} className="mt-3 w-full py-3 rounded-2xl bg-black text-white font-bold text-[14px] flex items-center justify-center gap-2 disabled:opacity-50">
                          {otpBusy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} تحقّق وادخل
                        </button>
                        <button type="button" onClick={sendOtpCode} disabled={otpBusy} className="w-full text-[11px] text-zinc-400 mt-2 hover:text-zinc-600">إعادة إرسال الرمز</button>
                      </>
                    )}
                  </div>
                )}
                {otpMsg && <p className="text-[12px] text-red-600 mt-3 font-medium flex items-center gap-1.5 justify-center"><AlertCircle size={13} /> {otpMsg}</p>}
                <button type="button" onClick={() => { setOtpFor(''); setOtpSent(false); setOtpMsg(''); setOtpCode(''); setOtpReveal(false); setError('') }} className="w-full text-[12px] text-zinc-400 mt-4 hover:text-zinc-600">رجوع</button>
              </>
            )}
          </form>
        </div>
      </div>
    )
  }

  /* ════ DATA ════ */
  const s = space.student!
  const stats = space.stats ?? { lessons_total: 0, lessons_done: 0, ex_total: 0, ex_done: 0, exam_total: 0, exam_done: 0, files_total: 0, files_opened: 0, overall: 0, streak: 0, last_activity: null }
  const courses = space.courses ?? []

  /* ════ COURSE PICKER ════ shows ALL published courses — the ones the student is
     enrolled in are open (and scope the whole portal: progress, exams, coins,
     leaderboard, colors); the rest are locked so students discover the catalogue.
     Shown when they must pick (2+ enrolled, none chosen) or tap the switcher. */
  const validSel = !!(selectedCourseId && courses.some(c => c.id === selectedCourseId))
  const mustPick = courses.length > 1 && !validSel
  if (pickerOpen || mustPick) {
    return <CoursePicker enrolled={courses} catalog={catalog} name={s.full_name} token={token}
      onPick={chooseCourse} onClose={validSel ? () => setPickerOpen(false) : undefined} onLogout={logout} />
  }
  const course = courses.find(c => c.id === selectedCourseId) ?? courses[0]
  const theme = courseTheme(course)
  const courseId = course?.id ?? null
  const exams = space.exams ?? []
  const files = space.files ?? []
  const recent = space.recent_activity ?? []
  const manualEx = space.exercises ?? []

  const firstName = (s.full_name || '').split(' ')[0]

  // flatten + sequential unlock
  const flat: { lesson: PortalLesson; m: PortalModule; mi: number }[] = []
  ;(course?.modules ?? []).forEach((m, mi) => m.lessons.forEach(l => flat.push({ lesson: l, m, mi })))
  // Unit gate: the next unit unlocks only after the current unit is finished AND
  // its exercise submission was REVIEWED (scored) by the correction team.
  // Grandfathered — already-completed lessons stay open, and units the student
  // already started are not retro-locked; the gate only blocks NEW progress.
  const reviewedModules = new Set(submissions.filter(s => s.status === 'reviewed').map(s => s.module_id))
  const examModules = new Set(unitExams.map(e => e.module_id))           // units that HAVE a test
  const examPassed  = new Set(unitExams.filter(e => e.passed).map(e => e.module_id))
  const examOk = (id: string) => !examModules.has(id) || examPassed.has(id)
  const unlocked = new Set<string>()
  let gatePassed = true
  for (const m of (course?.modules ?? [])) {
    const started = m.lessons.some(l => l.status === 'completed')
    const mayStartNew = gatePassed || started
    let prevDone = true
    for (const l of m.lessons) {
      if (l.status === 'completed') unlocked.add(l.id)
      else if (prevDone && mayStartNew && !l.is_locked) unlocked.add(l.id)
      prevDone = l.status === 'completed'
    }
    const allDone = m.lessons.length > 0 && m.lessons.every(l => l.status === 'completed')
    // next unit opens only when this unit is finished, its TEST passed, AND its conversation reviewed
    gatePassed = gatePassed && allDone && examOk(m.id) && reviewedModules.has(m.id)
  }
  const isUnlocked = (l: PortalLesson) => unlocked.has(l.id)
  const today = flat.find(x => isUnlocked(x.lesson) && x.lesson.status !== 'completed')
  const pendingLessons = flat.filter(x => x.lesson.status !== 'completed').length

  // module progress
  const modProg = (m: PortalModule) => { const t = m.lessons.length; const d = m.lessons.filter(l => l.status === 'completed').length; return { t, d, pct: t ? Math.round((d / t) * 100) : 0 } }
  // current unit = first unit not fully done, or done-but-awaiting team review
  const currentModule = (course?.modules ?? []).find(m => modProg(m).pct < 100 || !examOk(m.id) || !reviewedModules.has(m.id)) ?? (course?.modules ?? [])[0]
  const exerciseLessons = flat.filter(x => x.lesson.type === 'exercise' || x.lesson.type === 'quiz').slice(0, 4)
  const nextExam = exams.find(e => e.score == null)

  /* ════ DEADLINES (auto-split of the plan's subscription window across units) ════ */
  const DAY_MS = 86400000
  const schedBase = meta?.start_at ? (() => {
    const start = new Date(meta.start_at).getTime()
    const units = Math.max(1, meta.total_units)
    const courseEnd = meta.end_at ? new Date(meta.end_at).getTime() : start + units * (meta.days_per_unit || 7) * DAY_MS
    const per = (courseEnd - start) / units               // time window allotted per unit
    return { start, units, courseEnd, per }
  })() : null
  const sched = (schedBase && meta) ? (() => {
    const { start, units, courseEnd, per } = schedBase
    const unitEnd = start + meta.current_unit_order * per   // current unit deadline
    const now = Date.now()
    const allDone = meta.completed_units >= units
    return {
      courseEnd, unitEnd, allDone,
      daysLeftCourse: Math.ceil((courseEnd - now) / DAY_MS),
      daysLeftUnit: Math.ceil((unitEnd - now) / DAY_MS),
      unitOverdue: !allDone && now > unitEnd,
      courseOverdue: !allDone && now > courseEnd,
      currentUnit: meta.current_unit_title,
      completedUnits: meta.completed_units, totalUnits: units,
    }
  })() : null
  const fmtDate = (ms: number) => new Date(ms).toLocaleDateString('ar-MA', { day: 'numeric', month: 'long' })
  const unitDeadlineMs = (order: number) => schedBase ? schedBase.start + order * schedBase.per : null
  // sequential unit steps — tracked server-side (activity log), follows the student across devices
  const stepDone = (kind: 'reading' | 'exam', id: string) => !!unitSteps[id]?.[kind]
  const markStep = (kind: 'reading' | 'exam', id: string) => setUnitSteps(p => ({ ...p, [id]: { ...p[id], [kind]: true } }))   // optimistic; logActivity persists it

  // week streak
  const activeDates = new Set(recent.map(r => r.created_at.slice(0, 10)))
  const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); const k = d.toISOString().slice(0, 10); return { day: DAY_AR[d.getDay()], active: activeDates.has(k) } })

  // achievements
  const achievements = [
    { id: 'active', label: 'متعلم نشيط', sub: `${stats.streak} أيام متتالية`, icon: Star, on: stats.streak >= 3, color: 'bg-amber-100 text-amber-600' },
    { id: 'organized', label: 'منظّم', sub: `${stats.lessons_done} دروس مكتملة`, icon: BookOpen, on: stats.lessons_done >= 5, color: 'bg-violet-100 text-violet-600' },
    { id: 'explorer', label: 'مستكشف', sub: `${stats.ex_done + stats.lessons_done} تمرين`, icon: Medal, on: (stats.ex_done + stats.lessons_done) >= 10, color: 'bg-rose-100 text-rose-600' },
  ]

  // lesson actions
  async function onOpenLesson(l: PortalLesson, url?: string | null) {
    if (!demo) await openLesson(token, l.id)
    award('open_lesson', l.id)   // +10 coins (idempotent, server-verified)
    if (isVideoUrl(url)) { setVideoLesson(l); return }   // play in-page (no external YouTube)
    if (url) { window.open(url, '_blank'); refresh(); return }
    // No media attached yet (e.g. a conversation lesson whose video link is
    // missing). Never dead-click: open its quiz so the student can still finish
    // the lesson and the unit isn't blocked; otherwise tell them it's coming.
    if (l.has_quiz) { setQuizLesson(l); return }
    setToast('هذا الدرس قيد الإضافة — سيتوفّر قريبًا، تواصل مع الإدارة إن تأخّر.')
    refresh()
  }
  async function onCompleteLesson(l: PortalLesson) { if (demo) { award('complete_lesson', l.id); return } if (await completeLesson(token, l.id)) { refresh(); award('complete_lesson', l.id) } }
  async function onCompleteManual(a: StudentAssignment) { if (a.status !== 'done' && await completeExercise(token, a.id)) refresh() }
  function openFile(f: { id: string; file_name: string; file_path: string }) { logActivity(token, 'downloaded_file', 'file', f.id, f.file_name); window.open(fileUrl(f.file_path), '_blank') }

  const TABS: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'path', label: 'مساري', icon: Route },
    { id: 'rewards', label: 'المكافآت', icon: Coins },
    { id: 'files', label: 'الملفات', icon: FileText },
    { id: 'progress', label: 'تقدّمي', icon: TrendingUp },
  ]

  return (
    <div dir="rtl" className="min-h-screen pb-20" style={{
      background: theme.cream,
      ['--ic-dark' as string]: theme.dark, ['--ic-dark-2' as string]: theme.dark2, ['--ic-dark-3' as string]: theme.dark3,
      ['--ic-cream' as string]: theme.cream, ['--ic-gold' as string]: theme.gold, ['--ic-gold-soft' as string]: theme.goldSoft,
      ['--ic-grad-from' as string]: theme.grad[0], ['--ic-grad-to' as string]: theme.grad[1],
    } as React.CSSProperties}>
      {/* ─── Anti-sharing watermark: two faint labels gently floating, traceable ─── */}
      <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden select-none" aria-hidden>
        <span className="absolute top-0 right-0 text-[12px] font-bold text-black/[0.07] whitespace-nowrap wm-drift-a">{s.full_name} · {s.verification_token}</span>
        <span className="absolute top-0 right-0 text-[12px] font-bold text-black/[0.06] whitespace-nowrap wm-drift-b">{s.full_name} · {s.verification_token}</span>
      </div>

      {/* ─── Header ─── */}
      <header className="text-white sticky top-0 z-20" style={{ background: theme.dark }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--ic-gold)] text-black flex items-center justify-center font-black text-[18px] shadow-lg shadow-lg">I</div>
            <div className="hidden sm:block leading-none">
              <span className="font-black text-[16px] tracking-wide">INGLIZI</span>
              <div className="text-[10px] text-zinc-500 mt-1">منصّة تعلّم الإنجليزية</div>
            </div>
          </div>
          {/* desktop: greeting + course + overall progress */}
          <div className="hidden lg:flex items-center gap-3 pr-4 mr-2 border-r border-white/10">
            <span className="text-[13px] text-zinc-300">مرحباً <b className="text-white">{firstName}</b> 👋</span>
            {course && <button onClick={() => setPickerOpen(true)} className="text-[11px] font-bold rounded-full px-2.5 py-1 flex items-center gap-1 hover:opacity-90" style={{ background: theme.gold, color: theme.dark }} title="تبديل الدورة">{course.title} <ChevronDown size={12} /></button>}
            <span className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <span className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden"><span className="block h-full bg-gradient-to-l from-[var(--ic-grad-from)] to-[var(--ic-grad-to)] rounded-full transition-all" style={{ width: `${stats.overall}%` }} /></span>
              <b className="text-zinc-200">{stats.overall}%</b>
            </span>
          </div>
          {/* mobile/tablet: compact course switcher so every student can reach the full catalogue */}
          {course && <button onClick={() => setPickerOpen(true)} className="lg:hidden text-[11px] font-bold rounded-full px-2.5 py-1 flex items-center gap-1 max-w-[40vw] active:scale-95 transition" style={{ background: theme.gold, color: theme.dark }} title="تبديل الدورة"><span className="truncate">{course.title}</span> <ChevronDown size={12} className="shrink-0" /></button>}
          <div className="flex-1" />
          {(() => {
            const TYPE_ICON: Record<string, any> = { correction: CheckCircle2, reminder: Bell, deadline: Clock, lesson: PlayCircle, message: MessageSquareText, info: Bell }
            const TYPE_COLOR: Record<string, string> = { correction: 'bg-emerald-50 text-emerald-600', reminder: 'bg-[var(--ic-gold-soft)] text-yellow-600', deadline: 'bg-rose-50 text-rose-600', lesson: 'bg-violet-50 text-violet-600', message: 'bg-blue-50 text-blue-600', info: 'bg-zinc-100 text-zinc-500' }
            const unread = notifs.filter(n => !n.is_read).length
            function openBell() {
              setNotifOpen(o => {
                const next = !o
                if (next && unread > 0) { markNotificationsRead(token); setNotifs(ns => ns.map(n => ({ ...n, is_read: true }))) }
                return next
              })
            }
            return (
              <div className="relative">
                <button onClick={openBell} className="relative w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center text-zinc-300">
                  <Bell size={18} className={unread > 0 ? 'animate-[vp-pulse_2s_ease-in-out_infinite]' : ''} />
                  {unread > 0 && <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center vp-pop">{unread}</span>}
                </button>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <div className="fixed sm:absolute top-[62px] sm:top-auto inset-x-3 sm:inset-x-auto sm:right-0 sm:mt-2 sm:w-[360px] bg-white rounded-2xl shadow-2xl border border-zinc-100 z-50 overflow-hidden text-zinc-800" dir="rtl">
                      <div className="px-4 py-3 border-b border-zinc-100 font-bold text-[14px]">الإشعارات</div>
                      <div className="max-h-[70vh] overflow-y-auto">
                        {notifs.length === 0 ? <div className="py-8 text-center text-[13px] text-zinc-400">لا إشعارات بعد 🎉</div>
                          : notifs.map(n => { const Icon = TYPE_ICON[n.type] ?? Bell; return (
                            <button key={n.id} onClick={() => { if (n.tab) goTab(n.tab as Tab); setNotifOpen(false) }} className={`w-full flex items-start gap-3 px-4 py-2.5 text-right hover:bg-zinc-50 ${!n.is_read ? 'bg-[var(--ic-gold-soft)]' : ''}`}>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLOR[n.type] ?? TYPE_COLOR.info}`}><Icon size={15} /></div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-semibold flex items-start gap-1.5 break-words"><span className="flex-1">{n.title}</span>{!n.is_read && <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-rose-500 flex-shrink-0" />}</div>
                                {n.body && <div className="text-[12px] text-zinc-500 leading-relaxed break-words whitespace-pre-line">{n.body}</div>}
                                <div className="text-[10px] text-zinc-300 mt-0.5">{fmtShort(n.created_at)}</div>
                              </div>
                            </button>
                          )})}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })()}
          <div className="flex items-center gap-2.5">
            <div className="text-left hidden sm:block leading-tight"><div className="font-bold text-[13px]">{s.full_name}</div><div className="text-[11px] text-zinc-400">{course?.title ?? 'غير مسجّل'}</div></div>
            {avatarUrl
              /* eslint-disable-next-line @next/next/no-img-element */
              ? <img src={avatarUrl} alt={s.full_name} className="w-9 h-9 rounded-full object-cover ring-2 ring-[var(--ic-gold)] flex-shrink-0" />
              : <InitAva name={s.full_name} className="w-9 h-9 rounded-full text-[12px] ring-2 ring-[var(--ic-gold)]" />}
            <button onClick={logout} className="text-zinc-400 hover:text-white p-1.5"><LogOut size={16} /></button>
          </div>
        </div>
      </header>

      {/* CRM announcements: moving banner + login popup */}
      <StudentAnnouncements anns={anns} onShow={() => { playMessage(); }} />

      {/* transient "new message" toast (with chime) */}
      {toast && (
        <div className="fixed top-3 inset-x-0 z-[130] flex justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto max-w-sm w-full bg-[var(--ic-dark)] text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 vp-pop" onClick={() => { setToast(null); goTab('home') }}>
            <span className="w-9 h-9 rounded-xl bg-[var(--ic-gold)] text-black flex items-center justify-center flex-shrink-0"><Bell size={17} /></span>
            <div className="flex-1 min-w-0"><div className="text-[11px] text-amber-100/60">🔔 إشعار جديد</div><div className="text-[13px] font-bold truncate">{toast}</div></div>
          </div>
        </div>
      )}

      {/* 🎓 new certificate celebration */}
      {newCert && (
        <div className="fixed inset-0 z-[140] bg-black/70 flex items-center justify-center p-4 vp-fade" dir="rtl" onClick={() => setNewCert(null)}>
          <div onClick={e => e.stopPropagation()} className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl vp-pop text-center">
            <div className="bg-gradient-to-l from-amber-500 to-yellow-400 text-black px-5 py-6">
              <div className="text-[44px] leading-none mb-1">🎓</div>
              <div className="font-black text-[18px]">مبروك! حصلت على شهادة جديدة</div>
            </div>
            <div className="p-5">
              <p className="text-[15px] font-bold text-zinc-800 leading-relaxed mb-1">{newCert.title}</p>
              <p className="text-[11px] text-zinc-400 mb-4" dir="ltr">{newCert.serial}</p>
              <a href={`/certificate/${newCert.serial}`} target="_blank" rel="noreferrer" onClick={() => setNewCert(null)}
                className="block w-full py-3 rounded-2xl bg-[var(--ic-dark)] text-[var(--ic-gold)] font-black text-[14px]">
                عرض الشهادة وطباعتها 🖨️
              </a>
              <button onClick={() => setNewCert(null)} className="mt-2 text-[12px] text-zinc-400 hover:text-zinc-600">لاحقًا</button>
            </div>
          </div>
        </div>
      )}

      {/* Urgent correction-done popup — clickable → opens the unlocked unit */}
      {correctionPopup && (
        <div className="fixed inset-0 z-[135] bg-black/60 flex items-center justify-center p-4 vp-fade" dir="rtl" onClick={() => setCorrectionPopup(null)}>
          <div
            onClick={e => { e.stopPropagation(); const c = correctionPopup; setCorrectionPopup(null); markNotificationsRead(token); reloadGate(); goTab((c.tab as Tab) || 'path') }}
            className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl vp-pop text-right cursor-pointer">
            <div className="bg-gradient-to-l from-emerald-500 to-teal-500 text-white px-5 py-4 flex items-center gap-2">
              <span className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center"><CheckCircle2 size={22} /></span>
              <span className="font-black text-[15px]">{correctionPopup.title}</span>
            </div>
            <div className="p-5">
              {correctionPopup.body && <p className="text-[13.5px] text-zinc-700 leading-relaxed">{correctionPopup.body}</p>}
              <div className="mt-4 w-full py-3 rounded-2xl bg-emerald-600 text-white font-black text-[14px] flex items-center justify-center gap-1.5">تابِع إلى الدرس التالي <ArrowLeft size={16} /></div>
            </div>
          </div>
        </div>
      )}

      {/* Practice (sentence builder / translation) */}
      {practice && <PracticeHub token={token} courseId={courseId} kind={practice} currentModuleId={currentModule?.id ?? null} onClose={() => { setPractice(null); refreshCoins() }} onEarned={refreshCoins} />}
      {vocabOpen && <VocabGames token={token} courseId={courseId} onClose={() => { setVocabOpen(false); refreshCoins() }} onEarned={refreshCoins} />}
      {pictureOpen && <PictureWordGame token={token} courseId={courseId} onClose={() => { setPictureOpen(false); refreshCoins() }} onEarned={refreshCoins} />}

      {/* Final exam + certificate */}
      {showExam && <FinalExam token={token} fullName={s.full_name}
        locked={!cert && !(!!meta && meta.total_units > 0 && meta.completed_units >= meta.total_units)}
        initialCert={cert}
        onClose={() => { setShowExam(false); fetchCertificate(token).then(setCert) }} />}

      <main className="max-w-6xl mx-auto px-4 pt-4">

        {/* ═══════════ ALWAYS-VISIBLE DEADLINE REMINDER ═══════════ */}
        {sched && !sched.allDone && (() => {
          const unitSoon = !sched.unitOverdue && sched.daysLeftUnit <= 2   // current unit due within 2 days
          return (
          <div className={`mb-4 rounded-2xl px-4 py-3 flex items-center gap-3 ${sched.courseOverdue ? 'bg-rose-600 text-white' : sched.unitOverdue ? 'bg-rose-50 border border-rose-200 text-rose-800' : unitSoon ? 'bg-amber-500 text-white animate-pulse' : sched.daysLeftCourse <= 14 ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-[var(--ic-dark)] text-white'}`}>
            <Clock size={20} className="flex-shrink-0" />
            <div className="flex-1 min-w-0 text-[12.5px] leading-snug">
              {sched.courseOverdue ? (
                <><b>انتهت مدة الدورة!</b> راجع تقدّمك وتواصل مع الإدارة لإكمال ما تبقّى.</>
              ) : sched.unitOverdue ? (
                <><b>أنت متأخر في «{sched.currentUnit}».</b> كان الموعد {fmtDate(sched.unitEnd)} — أكملها الآن لتبقى ضمن الجدول.</>
              ) : unitSoon ? (
                <><b>⏰ سارع!</b> موعد وحدة «{sched.currentUnit}» {sched.daysLeftUnit <= 0 ? 'اليوم' : sched.daysLeftUnit === 1 ? 'غدًا' : `خلال ${sched.daysLeftUnit} يوم`} — أكملها قبل فوات الأجل.</>
              ) : (
                <>لإنهاء الدورة يتبقّى <b>{sched.daysLeftCourse} يومًا</b> · موعد الوحدة الحالية: <b>{sched.daysLeftUnit > 0 ? `${sched.daysLeftUnit} يوم` : 'اليوم'}</b> ({fmtDate(sched.unitEnd)})</>
              )}
            </div>
            <span className="text-[11px] font-bold bg-black/15 rounded-full px-2 py-0.5 flex-shrink-0">{sched.completedUnits}/{sched.totalUnits} وحدة</span>
          </div>
          )
        })()}

        {/* ═══════════ HOME ═══════════ */}
        {tab === 'home' && (
          <div className="lg:grid lg:grid-cols-3 lg:gap-5 space-y-5 lg:space-y-0">
            {/* MAIN COLUMN */}
            <div className="lg:col-span-2 space-y-5">

              {/* Hero */}
              <div className="bg-gradient-to-br from-[var(--ic-dark)] via-[var(--ic-dark-2)] to-[var(--ic-dark-3)] rounded-3xl p-5 text-white">
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex items-center gap-4">
                    <Ring pct={stats.overall} />
                    <div className="flex-1">
                      <div className="font-black text-[18px]">مرحباً {firstName}! 👋</div>
                      <div className="text-[12px] text-zinc-400 mt-0.5">جاهز لمواصلة رحلتك التعليمية اليوم؟</div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1 text-[12px] font-bold">{course?.title ?? 'لم تُسجّل في دورة'} 🎓</span>
                        {resources[0] && (
                          <a href={resourceUrl(resources[0].file_path)} target="_blank" rel="noreferrer"
                            onClick={() => logActivity(token, 'downloaded_file', 'resource', resources[0].id, resources[0].title)}
                            className="inline-flex items-center gap-1.5 bg-[var(--ic-gold)] text-black rounded-lg px-2.5 py-1 text-[12px] font-black hover:bg-[var(--ic-gold)]">
                            <Download size={13} /> 📘 كتاب الدورة
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Today's lesson */}
                  {course && today && (
                    <div className="flex-1 bg-white/[0.06] rounded-2xl p-4">
                      <div className="text-[11px] text-zinc-400 mb-2">درس اليوم</div>
                      <div className="mb-2.5">
                        <LessonThumb title={today.lesson.title} topic={today.lesson.title} chip={today.m.title} seed={today.lesson.id} videoUrl={today.lesson.video_url} onClick={() => onOpenLesson(today.lesson, today.lesson.video_url || today.lesson.exercise_url || today.lesson.file_url)} />
                      </div>
                      <div className="inline-block text-[10px] font-bold bg-violet-500/30 text-violet-200 px-2 py-0.5 rounded mb-1">{today.m.title}</div>
                      <div className="font-black text-[16px]">{today.lesson.title}</div>
                      {today.lesson.content && <div className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{today.lesson.content}</div>}
                      <button onClick={() => onOpenLesson(today.lesson, today.lesson.video_url || today.lesson.exercise_url || today.lesson.file_url)}
                        className="w-full mt-3 py-2.5 rounded-xl bg-[var(--ic-gold)] text-black font-black text-[13px] flex items-center justify-center gap-2 hover:bg-[var(--ic-gold)]"><PlayCircle size={16} /> ابدأ الدرس الآن</button>
                      <button onClick={() => goTab('path')} className="w-full mt-2 py-2 rounded-xl bg-white/[0.06] text-white font-semibold text-[12px] hover:bg-white/10">عرض كل دروس الوحدة</button>
                    </div>
                  )}
                </div>

                {/* Stat tiles */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                  <HeroStat icon={BookOpen} value={`${stats.lessons_done}/${stats.lessons_total}`} label="دروس مكتملة" />
                  <HeroStat icon={CheckCircle2} value={`${stats.ex_done}/${stats.ex_total}`} label="تمارين مكتملة" />
                  <HeroStat icon={Award} value={`${stats.exam_done}/${stats.exam_total}`} label="امتحانات" />
                  <HeroStat icon={Flame} value={`${stats.streak}`} label="أيام متتالية" />
                </div>
              </div>

              {/* Coins + level + quick access */}
              <div className="rounded-3xl bg-white border border-zinc-100 shadow-[0_2px_12px_rgba(58,40,23,0.06)] p-4">
                <button onClick={() => goTab('rewards')} className="w-full flex items-center gap-3 text-right">
                  <div className="w-11 h-11 rounded-2xl bg-[var(--ic-gold)] text-black flex items-center justify-center flex-shrink-0"><Coins size={22} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-[16px] text-[var(--ic-dark-2)]">{coins?.balance ?? 0} <span className="text-[11px] text-zinc-400 font-bold">كوين · {coins?.level ?? 'Bronze'}</span></div>
                    {coins?.next_level
                      ? <div className="mt-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-l from-[var(--ic-grad-from)] to-[var(--ic-grad-to)] rounded-full" style={{ width: `${coins.progress}%` }} /></div>
                      : <div className="text-[11px] text-amber-600 font-bold">أعلى مستوى 👑</div>}
                  </div>
                  <span className="text-[11px] text-zinc-400 flex-shrink-0">{coins?.next_level ? `باقٍ ${coins.to_next}` : ''} <ChevronLeft size={14} className="inline" /></span>
                </button>
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-100">
                  <button onClick={() => today && onOpenLesson(today.lesson, today.lesson.video_url || today.lesson.exercise_url || today.lesson.file_url)} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-gradient-to-br from-[var(--ic-grad-from)] to-[var(--ic-grad-to)] shadow-sm active:scale-95 transition-transform"><span className="text-[22px] leading-none">🎬</span><span className="text-[11px] font-black text-[var(--ic-dark)]">ابدأ الدرس</span></button>
                  <button onClick={() => setVocabOpen(true)} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-sm active:scale-95 transition-transform"><span className="text-[22px] leading-none">🎮</span><span className="text-[11px] font-black text-white">ألعاب المفردات</span></button>
                  <button onClick={() => setPractice('sentence')} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-gradient-to-br from-[var(--ic-dark-2)] to-[var(--ic-dark-3)] shadow-sm active:scale-95 transition-transform"><span className="text-[22px] leading-none">🧩</span><span className="text-[11px] font-black text-[var(--ic-gold)]">بناء الجمل</span></button>
                  <button onClick={() => setPractice('translation')} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-amber-50 border-2 border-amber-200 active:scale-95 transition-transform"><span className="text-[22px] leading-none">🔤</span><span className="text-[11px] font-black text-[var(--ic-dark-2)]">ترجم الجمل</span></button>
                </div>
              </div>

              {/* Final exam + certificate — unlocks after the whole course is complete */}
              {(() => {
                const courseDone = !!meta && meta.total_units > 0 && meta.completed_units >= meta.total_units
                const unlocked = courseDone || !!cert
                return (
                  <button onClick={() => setShowExam(true)}
                    className={`w-full text-right rounded-3xl p-4 flex items-center gap-3 transition-colors ${unlocked ? 'bg-gradient-to-l from-[var(--ic-grad-from)] to-[var(--ic-grad-to)] text-black hover:from-[var(--ic-gold)] hover:to-amber-200' : 'bg-[#3a2a1a] text-amber-100/90 hover:bg-[#43301d]'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${unlocked ? 'bg-black/10' : 'bg-[var(--ic-gold-soft)]'}`}>{unlocked ? <Award size={26} /> : <Lock size={24} className="text-[var(--ic-gold)]" />}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-[15px]">{cert ? 'شهادتك جاهزة 🎓' : 'الامتحان النهائي — A0 / A1'}</div>
                      <div className={`text-[12px] ${unlocked ? 'text-black/70' : 'text-amber-100/50'}`}>
                        {cert ? `اجتزت الامتحان بنتيجة ${cert.percent}% — اعرض شهادتك واطبعها`
                          : courseDone ? 'اجتَز الامتحان واحصل على شهادة إتمام المستوى الأول'
                          : `أكمل كل وحدات الدورة لفتح الامتحان (${meta?.completed_units ?? 0}/${meta?.total_units ?? '—'})`}
                      </div>
                    </div>
                    <ChevronLeft size={20} className="flex-shrink-0" />
                  </button>
                )
              })()}

              {/* Today's tasks */}
              {course && today && (
                <Card title="مهامك اليوم" sub="أكمل مهامك اليومية لتتقدم في مستواك" icon={CalendarDays} iconColor="text-amber-500">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {today.lesson.video_url && <TaskCard tone="violet" icon={PlayCircle} title="شاهد الفيديو" meta={today.lesson.title} cta="شاهد الآن" thumb={ytThumb(today.lesson.video_url) || aiThumb(today.lesson.title, today.lesson.id)} onClick={() => onOpenLesson(today.lesson, today.lesson.video_url)} />}
                    {today.lesson.file_url && <TaskCard tone="emerald" icon={FileText} title="اقرأ الملف" meta="ملف الدرس" cta="اقرأ الآن" onClick={() => onOpenLesson(today.lesson, today.lesson.file_url)} />}
                    {today.lesson.exercise_url && <TaskCard tone="amber" icon={PenLine} title="أكمل التمرين" meta="تمرين الدرس" cta="ابدأ التمرين" onClick={() => onOpenLesson(today.lesson, today.lesson.exercise_url)} />}
                    {today.lesson.has_quiz && <TaskCard tone="blue" icon={HelpCircle} title="اختبر نفسك" meta="اختبار الدرس" cta="ابدأ الاختبار" onClick={() => setQuizLesson(today.lesson)} />}
                    {!today.lesson.video_url && !today.lesson.file_url && !today.lesson.exercise_url && !today.lesson.has_quiz &&
                      <TaskCard tone="blue" icon={PlayCircle} title="ابدأ الدرس" meta={today.lesson.title} cta="ابدأ" onClick={() => onCompleteLesson(today.lesson)} />}
                  </div>
                </Card>
              )}

              {/* Exercises sent for correction — counts */}
              {course && (() => {
                const sent = submissions.length
                const reviewed = submissions.filter(x => x.status === 'reviewed').length
                const pending = submissions.filter(x => x.status === 'pending').length
                const hasUnread = notifs.some(n => n.type === 'correction' && !n.is_read)
                return (
                  <Card title="التمارين والتصحيح" sub="محادثاتك المُرسَلة لفريق التصحيح" icon={Send} iconColor="text-indigo-500">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-zinc-50 rounded-xl p-3"><div className="text-[22px] font-black text-zinc-900">{sent}</div><div className="text-[11px] text-zinc-400">مُرسَلة</div></div>
                      <div className="bg-emerald-50 rounded-xl p-3"><div className="text-[22px] font-black text-emerald-600">{reviewed}</div><div className="text-[11px] text-emerald-700/70">مُصحَّحة</div></div>
                      <div className="bg-amber-50 rounded-xl p-3"><div className="text-[22px] font-black text-amber-600">{pending}</div><div className="text-[11px] text-amber-700/70">بانتظار</div></div>
                    </div>
                    {hasUnread && <button onClick={() => goTab('path')} className="mt-3 w-full py-2.5 rounded-xl bg-emerald-500 text-white font-black text-[12.5px] flex items-center justify-center gap-1.5 animate-pulse">✅ وصلك تصحيح جديد — اضغط لقراءته</button>}
                  </Card>
                )
              })()}

              {/* Learning path */}
              {course && (
                <Card title="مساري التعليمي" icon={Route} iconColor="text-emerald-500" action={<button onClick={() => goTab('path')} className="text-[12px] text-blue-600 font-semibold">عرض الخريطة الكاملة</button>}>
                  {/* module stepper */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3">
                    {course.modules.map((m, i) => { const p = modProg(m); const active = m.id === currentModule?.id; return (
                      <div key={m.id} className="flex items-center gap-1 flex-shrink-0">
                        <div className={`w-28 rounded-xl border p-2.5 text-center ${active ? 'border-[var(--ic-gold)] bg-[var(--ic-gold-soft)]' : p.pct === 100 ? 'border-emerald-200 bg-emerald-50' : 'border-zinc-200 bg-white'}`}>
                          <div className="text-[10px] text-zinc-400">Module {i + 1}</div>
                          <div className="text-[11px] font-bold text-zinc-700 truncate">{m.title}</div>
                          <div className={`text-[13px] font-black mt-0.5 ${p.pct === 100 ? 'text-emerald-600' : active ? 'text-yellow-600' : 'text-zinc-400'}`}>{p.pct === 100 ? '✓ 100%' : `${p.pct}%`}</div>
                          <div className="text-[9px] text-zinc-400">{p.t} دروس</div>
                        </div>
                        {i < course.modules.length - 1 && <ChevronLeft size={14} className="text-zinc-300 flex-shrink-0" />}
                      </div>
                    )})}
                  </div>

                  {/* current module + lessons */}
                  {currentModule && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="bg-zinc-50 rounded-2xl p-4">
                        <div className="text-[11px] text-zinc-400">{currentModule.title}</div>
                        <div className="font-black text-[16px] text-zinc-900 mb-2">📚 {currentModule.title}</div>
                        {(() => { const p = modProg(currentModule); return (<>
                          <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1"><span>التقدم في الوحدة</span><span className="font-bold">{p.pct}%</span></div>
                          <div className="h-2 bg-zinc-200 rounded-full overflow-hidden mb-1"><div className="h-full bg-[var(--ic-gold)] rounded-full" style={{ width: `${p.pct}%` }} /></div>
                          <div className="text-[11px] text-zinc-400">{p.d}/{p.t} دروس مكتملة</div>
                        </>)})()}
                      </div>
                      <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                        <div className="px-3 py-2 bg-zinc-50 text-[12px] font-bold text-zinc-600 border-b border-zinc-100">دروس الوحدة ({currentModule.lessons.length})</div>
                        <div className="divide-y divide-zinc-50 max-h-[260px] overflow-y-auto">
                          {currentModule.lessons.map(l => <LessonRow key={l.id} l={l} unlocked={isUnlocked(l)} onOpen={onOpenLesson} onComplete={onCompleteLesson} onQuiz={setQuizLesson} />)}
                        </div>
                      </div>
                    </div>
                  )}
                  {currentModule && modProg(currentModule).pct >= 100 && !reviewedModules.has(currentModule.id) && (
                    !examOk(currentModule.id) ? (
                      <button onClick={() => setExamUnit({ id: currentModule.id, title: currentModule.title })}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-amber-100 text-amber-800 font-black text-[13px] hover:bg-amber-200">
                        <Award size={15} /> اجتَز اختبار الوحدة (٦٠٪+) أولًا
                      </button>
                    ) : (
                      <button onClick={() => setSubmitUnit({ id: currentModule.id, title: currentModule.title })}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[var(--ic-dark)] text-[var(--ic-gold)] font-black text-[13px] hover:bg-[var(--ic-dark-2)]">
                        <Send size={15} /> {submissions.some(x => x.module_id === currentModule.id) ? 'مهمتك قيد التصحيح — تُفتح الوحدة التالية بعد الاعتماد' : 'أرسل مهمة الوحدة للتصحيح لفتح الوحدة التالية'}
                      </button>
                    )
                  )}
                </Card>
              )}

              {/* Bottom 3 cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Files */}
                <Card title="ملفاتك" icon={FileText} iconColor="text-rose-500" action={<button onClick={() => goTab('files')} className="text-[11px] text-blue-600 font-semibold">عرض الكل</button>} compact>
                  {files.length === 0 ? <Empty mini text="لا ملفات بعد" /> : files.slice(0, 4).map(f => (
                    <button key={f.id} onClick={() => openFile(f)} className="w-full flex items-center gap-2.5 py-2 text-right">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0"><FileText size={14} className="text-rose-500" /></div>
                      <div className="flex-1 min-w-0"><div className="text-[12px] font-semibold text-zinc-800 truncate">{f.file_name}</div><div className="text-[10px] text-zinc-400">{fmtShort(f.created_at)}</div></div>
                      <Download size={14} className="text-zinc-300" />
                    </button>
                  ))}
                </Card>
                {/* Recent exercises */}
                <Card title="التمارين الأخيرة" icon={PenLine} iconColor="text-amber-500" action={<button onClick={() => goTab('tasks')} className="text-[11px] text-blue-600 font-semibold">الكل</button>} compact>
                  {exerciseLessons.length === 0 && manualEx.length === 0 ? <Empty mini text="لا تمارين بعد" /> :
                    [...exerciseLessons.map(x => ({ id: x.lesson.id, title: x.lesson.title, done: x.lesson.status === 'completed', prog: x.lesson.status === 'opened' })),
                     ...manualEx.slice(0, 2).map(a => ({ id: a.id, title: a.title, done: a.status === 'done', prog: a.status === 'in_progress' }))].slice(0, 4).map(e => (
                      <div key={e.id} className="flex items-center gap-2.5 py-2">
                        {e.done ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" /> : <Circle size={16} className="text-zinc-300 flex-shrink-0" />}
                        <div className="flex-1 min-w-0 text-[12px] font-semibold text-zinc-800 truncate">{e.title}</div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${e.done ? 'bg-emerald-50 text-emerald-600' : e.prog ? 'bg-amber-50 text-amber-600' : 'bg-zinc-100 text-zinc-400'}`}>{e.done ? 'مكتمل' : e.prog ? 'قيد التقدم' : 'معلّق'}</span>
                      </div>
                    ))}
                </Card>
                {/* Activity */}
                <Card title="آخر نشاطك" icon={Clock} iconColor="text-blue-500" compact>
                  {recent.length === 0 ? <Empty mini text="لا نشاط بعد" /> : recent.slice(0, 4).map((r, i) => { const a = ACTIVITY[r.event_type] ?? { ar: r.event_type, icon: Circle, tone: 'text-zinc-400' }; const Icon = a.icon; return (
                    <div key={i} className="flex items-center gap-2.5 py-2">
                      <Icon size={15} className={`${a.tone} flex-shrink-0`} />
                      <div className="flex-1 min-w-0"><div className="text-[12px] font-semibold text-zinc-700 truncate">{a.ar}{r.entity_title ? `: ${r.entity_title}` : ''}</div></div>
                      <span className="text-[10px] text-zinc-400 flex-shrink-0">{fmtShort(r.created_at)}</span>
                    </div>
                  )})}
                </Card>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="space-y-5">
              {/* Quick overview */}
              <Card title="نظرة سريعة" icon={BarChart3} iconColor="text-emerald-500" action={<button onClick={() => goTab('progress')} className="text-[11px] text-blue-600 font-semibold">التقرير</button>}>
                <div className="space-y-2.5 mt-1">
                  <MiniBar label="التقدم" pct={stats.overall} color="bg-[var(--ic-gold)]" />
                  <MiniBar label="الدروس" pct={pct(stats.lessons_done, stats.lessons_total)} color="bg-violet-500" />
                  <MiniBar label="التمارين" pct={pct(stats.ex_done, stats.ex_total)} color="bg-blue-500" />
                  <MiniBar label="الامتحانات" pct={pct(stats.exam_done, stats.exam_total)} color="bg-rose-500" />
                  <MiniBar label="الملفات" pct={pct(stats.files_opened, stats.files_total)} color="bg-orange-500" />
                </div>
              </Card>

              {/* Schedule / deadline */}
              {sched && (
                <Card title="الجدول الزمني" icon={Clock} iconColor="text-rose-500">
                  {sched.allDone ? (
                    <div className="text-center py-2"><div className="text-2xl mb-1">🎓</div><div className="text-[13px] font-bold text-emerald-600">أكملت كل الوحدات!</div></div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className={`rounded-xl p-3 ${sched.courseOverdue ? 'bg-rose-50' : 'bg-zinc-50'}`}>
                        <div className="text-[11px] text-zinc-400">المتبقّي لإنهاء الدورة</div>
                        <div className={`font-black text-[20px] ${sched.courseOverdue ? 'text-rose-600' : 'text-zinc-900'}`}>{sched.courseOverdue ? 'انتهت' : `${sched.daysLeftCourse} يوم`}</div>
                        <div className="text-[11px] text-zinc-400">آخر أجل: {fmtDate(sched.courseEnd)}</div>
                      </div>
                      <div className={`rounded-xl p-3 ${sched.unitOverdue ? 'bg-rose-50' : 'bg-amber-50'}`}>
                        <div className="text-[11px] text-zinc-400">الوحدة الحالية</div>
                        <div className="font-bold text-[13px] text-zinc-800 truncate">{sched.currentUnit || '—'}</div>
                        <div className={`text-[12px] font-bold mt-0.5 ${sched.unitOverdue ? 'text-rose-600' : 'text-amber-700'}`}>
                          {sched.unitOverdue ? `متأخّر · كان ${fmtDate(sched.unitEnd)}` : sched.daysLeftUnit > 0 ? `يتبقّى ${sched.daysLeftUnit} يوم (${fmtDate(sched.unitEnd)})` : `الموعد اليوم`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500"><span className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden"><span className="block h-full bg-rose-400 rounded-full" style={{ width: `${Math.round(sched.completedUnits / sched.totalUnits * 100)}%` }} /></span>{sched.completedUnits}/{sched.totalUnits}</div>
                      {sched.unitOverdue && <div className="text-[11px] text-rose-600 bg-rose-50 rounded-lg px-2.5 py-1.5 leading-snug">⚠️ تم تسجيلك كـ «متأخّر». أكمل الوحدة لتعود ضمن الجدول.</div>}
                    </div>
                  )}
                </Card>
              )}

              {/* Next exam */}
              <Card title="الامتحان القادم" icon={CalendarDays} iconColor="text-blue-500">
                {nextExam ? (
                  <div>
                    <div className="font-bold text-[14px] text-zinc-800">{nextExam.title}</div>
                    <div className="flex items-center gap-2 mt-1.5 text-[12px] text-zinc-500">
                      {(s.current_level || nextExam.level) && <span className="font-bold bg-zinc-100 px-1.5 rounded">{s.current_level ?? nextExam.level} {s.next_level ? `→ ${s.next_level}` : ''}</span>}
                    </div>
                    {nextExam.exam_date && <div className="text-[12px] text-zinc-500 mt-1.5 flex items-center gap-1"><CalendarDays size={12} /> {new Date(nextExam.exam_date).toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>}
                    <button onClick={() => goTab('progress')} className="w-full mt-3 py-2 rounded-xl bg-zinc-100 text-zinc-700 font-semibold text-[12px] hover:bg-zinc-200">مراجعة الامتحانات السابقة</button>
                  </div>
                ) : <Empty mini text="لا امتحان قادم محدّد" />}
              </Card>

              {/* Streak */}
              <Card title="سلسلة التعلم" icon={Flame} iconColor="text-orange-500">
                <div className="text-center">
                  <div className="text-[12px] text-zinc-500">{stats.streak > 0 ? 'أنت رائع! حافظ على الزخم' : 'ابدأ سلسلتك اليوم'}</div>
                  <div className="text-[40px] font-black text-orange-500 leading-none my-1">{stats.streak}</div>
                  <div className="text-[12px] text-zinc-400 mb-3">أيام متتالية</div>
                  <div className="flex items-center justify-between">
                    {week.map((d, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${d.active ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-300'}`}>{d.active ? <CheckCircle2 size={14} /> : <Circle size={14} />}</div>
                        <span className="text-[9px] text-zinc-400">{d.day.slice(0, 3)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Achievements */}
              <Card title="إنجازاتك" icon={Trophy} iconColor="text-amber-500">
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {achievements.map(a => { const Icon = a.icon; return (
                    <div key={a.id} className={`rounded-xl p-2.5 text-center ${a.on ? 'bg-white border border-zinc-100' : 'opacity-40 grayscale'}`}>
                      <div className={`w-10 h-10 rounded-full ${a.color} flex items-center justify-center mx-auto mb-1.5`}><Icon size={18} /></div>
                      <div className="text-[11px] font-bold text-zinc-800 leading-tight">{a.label}</div>
                      <div className="text-[9px] text-zinc-400 mt-0.5 leading-tight">{a.sub}</div>
                    </div>
                  )})}
                </div>
              </Card>

              {/* Certificates (auto-awarded: course completion, coins, streaks) */}
              {myCerts.length > 0 && (
                <Card title="شهاداتي" icon={Medal} iconColor="text-amber-600">
                  <div className="space-y-1.5 mt-1">
                    {myCerts.map(c => (
                      <a key={c.serial} href={`/certificate/${c.serial}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2.5 rounded-xl border border-amber-100 bg-amber-50/50 p-2.5 hover:bg-amber-50 transition-colors">
                        <span className="text-[18px] flex-shrink-0">{(CERT_KIND_AR[c.kind] ?? CERT_KIND_AR.custom).emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-bold text-zinc-800 leading-tight truncate">{c.title}</div>
                          <div className="text-[10px] text-zinc-400" dir="ltr">{c.serial} · {c.date}</div>
                        </div>
                        <ExternalLink size={13} className="text-amber-500 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">اضغط على أي شهادة لعرضها وطباعتها — لكل شهادة رقم تحقق رسمي.</p>
                </Card>
              )}
            </div>

            {/* Teacher message — full width */}
            {s.admin_message && (
              <div className="lg:col-span-3 bg-[var(--ic-gold-soft)] border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
                <InitAva name={s.teacher_name || 'مدرّس'} className="w-11 h-11 rounded-full text-[15px] flex-shrink-0" />
                <div className="flex-1"><div className="text-[12px] font-bold text-yellow-800">رسالة من مدرّسك 👩‍🏫</div><div className="text-[13px] text-yellow-900 leading-relaxed">{s.admin_message}</div></div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ PATH ═══════════ */}
        {tab === 'path' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <SectionTitle icon={Route} color="text-amber-700">مسار الدورة</SectionTitle>
            {!course ? <Empty text="لم يتم تسجيلك في دورة بعد" />
              : course.modules.length === 0 ? <Empty text="سيظهر محتوى دورتك هنا قريبًا" />
              : course.modules.map((m, mi) => {
                const p = modProg(m)
                const dl = unitDeadlineMs(mi + 1)
                const daysTo = dl != null ? Math.ceil((dl - Date.now()) / 86400000) : null
                const overdue = dl != null && p.pct < 100 && Date.now() > dl
                const soon = !overdue && p.pct < 100 && daysTo != null && daysTo <= 2   // due within 2 days
                // previous unit must be finished AND its exercise reviewed by the team
                const prev = mi > 0 ? course.modules[mi - 1] : null
                const started = m.lessons.some(l => l.status === 'completed')   // grandfather already-started units
                const prevReady = !prev || (modProg(prev).pct >= 100 && examOk(prev.id) && reviewedModules.has(prev.id))
                const unitLocked = !!prev && !started && !prevReady
                const lockReason = !prev ? ''
                  : modProg(prev).pct < 100 ? 'أكمل الوحدة السابقة بالكامل لفتحها'
                  : !examOk(prev.id) ? 'اجتَز اختبار الوحدة السابقة أولًا'
                  : 'بانتظار تصحيح الفريق لتمرين الوحدة السابقة'
                return (
                <div key={m.id} className={`rounded-2xl border overflow-hidden shadow-sm ${unitLocked ? 'bg-zinc-50/70 border-zinc-200' : overdue ? 'bg-white border-rose-300' : soon ? 'bg-white border-amber-300' : 'bg-white border-zinc-100'}`}>
                  <div className={`px-4 py-3 border-b flex items-center gap-2 ${unitLocked ? 'bg-zinc-100 border-zinc-200' : overdue ? 'bg-rose-50 border-rose-100' : soon ? 'bg-amber-50 border-amber-100' : 'bg-[#f5ecdc] border-amber-100/70'}`}>
                    <span className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center flex-shrink-0 ${unitLocked ? 'bg-zinc-300 text-zinc-600' : 'bg-[var(--ic-dark-2)] text-[var(--ic-gold)]'}`}>{unitLocked ? <Lock size={12} /> : mi + 1}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`font-bold text-[14px] ${unitLocked ? 'text-zinc-500' : 'text-zinc-800'}`}>{m.title}</span>
                      {unitLocked
                        ? <span className="block text-[10px] font-bold text-zinc-400">🔒 {lockReason}</span>
                        : dl != null && <span className={`block text-[10px] font-bold ${overdue ? 'text-rose-600' : soon ? 'text-amber-700' : 'text-zinc-400 font-normal'}`}>
                        {p.pct >= 100 ? '✓ مكتملة'
                          : overdue ? `⚠️ متأخّر · كان الموعد ${fmtDate(dl)}`
                          : soon ? `⏰ ينتهي ${daysTo! <= 0 ? 'اليوم' : daysTo === 1 ? 'غدًا' : `خلال ${daysTo} يوم`} — سارع بالإنجاز`
                          : `الموعد النهائي: ${fmtDate(dl)}`}
                      </span>}
                    </div>
                    {soon && !unitLocked && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />}
                    <span className="text-[11px] font-bold text-zinc-400">{p.d}/{p.t}</span>
                  </div>
                  {unitLocked ? (
                    <div className="px-4 py-7 text-center text-[12px] text-zinc-400 flex flex-col items-center gap-2"><Lock size={22} className="text-zinc-300" /> هذه الوحدة مقفلة — {lockReason}.</div>
                  ) : (
                  <>
                  <div className="divide-y divide-zinc-50">{m.lessons.map(l => <LessonRow key={l.id} l={l} unlocked={isUnlocked(l)} onOpen={onOpenLesson} onComplete={onCompleteLesson} onQuiz={setQuizLesson} />)}</div>
                  {/* Sequential steps — each lights up once the student reaches it */}
                  {(() => {
                    const lessonsDone = p.pct === 100
                    const hasReading = readingUnits.has(m.id)
                    const readingActive = lessonsDone
                    const examActive = lessonsDone && (!hasReading || stepDone('reading', m.id))
                    const hasExam = examModules.has(m.id)             // unit has a real team-written test
                    const examPassedHere = examPassed.has(m.id)
                    const examStepOk = hasExam ? examPassedHere : stepDone('exam', m.id)
                    const subs = submissions.filter(x => x.module_id === m.id); const last = subs[0]
                    const reviewed = last?.status === 'reviewed'
                    const unreadCorr = reviewed && notifs.some(n => n.type === 'correction' && !n.is_read && (n.body || '').includes(m.title))
                    const correctionActive = examActive && examStepOk
                    const DIM = 'flex items-center justify-center gap-2 px-4 py-3 border-t border-zinc-100 bg-zinc-50 text-zinc-300 font-bold text-[12.5px] cursor-not-allowed'
                    return (<>
                      {hasReading && (readingActive
                        ? <button onClick={() => { markStep('reading', m.id); setReadingUnit({ id: m.id, title: m.title }); logActivity(token, 'opened_reading', 'module', m.id, m.title) }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sky-50 border-t border-sky-100 text-sky-800 font-bold text-[12.5px] hover:bg-sky-100"><BookOpen size={15} /> القراءة والاستماع — نص الوحدة</button>
                        : <div className={'w-full ' + DIM}><Lock size={14} /> القراءة والاستماع — أكمل دروس الوحدة أولًا</div>)}

                      {/* End-of-unit TEST */}
                      {hasExam ? (
                        !examActive
                          ? <div className={'w-full ' + DIM}><Lock size={14} /> اختبار الوحدة — {hasReading ? 'افتح القراءة أولًا' : 'أكمل دروس الوحدة أولًا'}</div>
                          : examPassedHere
                            ? <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 border-t border-emerald-100 text-emerald-700 font-bold text-[12.5px]"><CheckCircle2 size={14} /> اجتزت اختبار الوحدة ✓</div>
                            : <button onClick={() => setExamUnit({ id: m.id, title: m.title })}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-100 border-t border-amber-200 text-amber-800 font-black text-[12.5px] hover:bg-amber-200"><Award size={15} /> اختبار الوحدة — يجب اجتيازه (٦٠٪+)</button>
                      ) : (examActive
                        ? <a href={EXAMS_URL} target="_blank" rel="noreferrer" onClick={() => { markStep('exam', m.id); logActivity(token, 'opened_exam', 'module', m.id, m.title) }}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--ic-gold-soft)] border-t border-[var(--ic-gold-soft)] text-yellow-800 font-bold text-[12.5px] hover:bg-[var(--ic-gold-soft)]"><Award size={15} /> امتحان نهاية الوحدة — اختبر معرفتك <ExternalLink size={13} /></a>
                        : <div className={'w-full ' + DIM}><Lock size={14} /> امتحان نهاية الوحدة — {hasReading ? 'افتح القراءة أولًا' : 'أكمل دروس الوحدة أولًا'}</div>)}

                      {reviewed ? (
                        <button onClick={() => setSubmitUnit({ id: m.id, title: m.title })}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-t font-black text-[12.5px] ${unreadCorr ? 'bg-emerald-500 text-white border-emerald-600 animate-pulse' : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'}`}>
                          {unreadCorr ? <><span className="w-2 h-2 rounded-full bg-white" /> تصحيحك جاهز — اضغط لقراءته الآن</> : <><CheckCircle2 size={14} /> عرض تصحيح المحادثة {last?.score != null ? `· ${last.score}/100` : ''}</>}
                        </button>
                      ) : correctionActive ? (
                        <button onClick={() => setSubmitUnit({ id: m.id, title: m.title })}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 border-t border-indigo-100 text-indigo-800 font-bold text-[12.5px] hover:bg-indigo-100">
                          <Send size={14} /> {last ? 'محادثتك قيد المراجعة…' : 'سلّم محادثة الوحدة للتصحيح'}
                        </button>
                      ) : (
                        <div className={'w-full ' + DIM}><Lock size={14} /> إرسال المحادثة للتصحيح — اجتَز امتحان الوحدة أولًا</div>
                      )}
                    </>)
                  })()}
                  </>
                  )}
                </div>
              )})}
          </div>
        )}

        {/* ═══════════ TASKS ═══════════ */}
        {tab === 'tasks' && (
          <div className="max-w-2xl mx-auto space-y-3">
            <SectionTitle icon={ListChecks} color="text-blue-500">تمارين إضافية</SectionTitle>
            {manualEx.length === 0 && <Empty emoji="🎯" text="لا توجد تمارين إضافية" sub="تمارينك الأساسية موجودة داخل «مساري»" />}
            {manualEx.map(a => (
              <div key={a.id} className="bg-white rounded-2xl border border-zinc-100 p-4 flex items-start gap-3">
                {a.status === 'done' ? <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" /> : <Circle size={20} className="text-zinc-300 flex-shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[14px] text-zinc-800">{a.title}</div>
                  {a.description && <div className="text-[12px] text-zinc-500 mt-1">{a.description}</div>}
                  <div className="flex gap-2 mt-2.5">
                    {a.link_url && <a href={a.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-blue-500 px-3 py-1.5 rounded-lg">ابدأ <ExternalLink size={12} /></a>}
                    {a.status !== 'done' ? <button onClick={() => onCompleteManual(a)} className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg"><CheckCircle2 size={12} /> تم الإنجاز</button> : <span className="text-[12px] font-bold text-emerald-600 px-3 py-1.5">مُنجز ✓</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══════════ REWARDS ═══════════ */}
        {tab === 'rewards' && <RewardsCenter token={token} courseId={courseId} onPractice={k => setPractice(k)} onVocab={() => setVocabOpen(true)} onPicture={() => setPictureOpen(true)} />}

        {/* ═══════════ FILES ═══════════ */}
        {tab === 'files' && (
          <div className="max-w-2xl mx-auto space-y-3">
            {resources.length > 0 && (
              <>
                <SectionTitle icon={BookOpen} color="text-emerald-600">ملفات الدورة</SectionTitle>
                {resources.map(r => (
                  <a key={r.id} href={resourceUrl(r.file_path)} target="_blank" rel="noreferrer"
                    onClick={() => logActivity(token, 'downloaded_file', 'resource', r.id, r.title)}
                    className="w-full flex items-center gap-3 bg-white rounded-2xl border border-emerald-100 p-4 hover:border-emerald-300">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0"><FileText size={18} className="text-emerald-600" /></div>
                    <div className="flex-1 min-w-0"><div className="font-bold text-[13px] text-zinc-800 truncate">{r.title}</div><div className="text-[11px] text-zinc-400">{(r.file_type ?? 'ملف').toUpperCase()}{r.course_title ? ` · ${r.course_title}` : ''}</div></div>
                    <Download size={18} className="text-emerald-500 flex-shrink-0" />
                  </a>
                ))}
                <div className="h-1" />
              </>
            )}
            <SectionTitle icon={FileText} color="text-rose-500">ملفاتي</SectionTitle>
            {files.length === 0 && <Empty emoji="📁" text="لا توجد ملفات بعد" />}
            {files.map(f => (
              <button key={f.id} onClick={() => openFile(f)} className="w-full flex items-center gap-3 bg-white rounded-2xl border border-zinc-100 p-4 text-right hover:border-zinc-300">
                <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0"><FileText size={18} className="text-rose-500" /></div>
                <div className="flex-1 min-w-0"><div className="font-bold text-[13px] text-zinc-800 truncate">{f.file_name}</div><div className="text-[11px] text-zinc-400">{(f.file_type ?? 'ملف').toUpperCase()} · {fmtShort(f.created_at)}</div></div>
                <Download size={18} className="text-zinc-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* ═══════════ PROGRESS ═══════════ */}
        {tab === 'progress' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <Card title="تقدّمي" icon={TrendingUp} iconColor="text-emerald-500">
              <div className="space-y-3 mt-1">
                <MiniBar label="دروس الدورة" pct={pct(stats.lessons_done, stats.lessons_total)} color="bg-emerald-500" big />
                <MiniBar label="التمارين" pct={pct(stats.ex_done, stats.ex_total)} color="bg-blue-500" big />
                <MiniBar label="الامتحانات" pct={pct(stats.exam_done, stats.exam_total)} color="bg-amber-500" big />
                <MiniBar label="الملفات" pct={pct(stats.files_opened, stats.files_total)} color="bg-rose-500" big />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <MiniStat icon={Flame} value={`${stats.streak}`} label="يوم متتالٍ" />
                <MiniStat icon={CheckCircle2} value={`${stats.lessons_done}`} label="درس منجز" />
                <MiniStat icon={Award} value={`${stats.overall}%`} label="إجمالي" />
              </div>
            </Card>
            <SectionTitle icon={Award} color="text-amber-500">الامتحانات والنتائج</SectionTitle>
            {exams.length === 0 && <Empty emoji="📝" text="لا توجد امتحانات بعد" />}
            {exams.map(e => <div key={e.id} className="bg-white rounded-2xl border border-zinc-100 p-4"><ExamRow e={e} /></div>)}
          </div>
        )}
      </main>

      {/* In-page video player (hides YouTube branding, tracks watch progress) */}
      {videoLesson && (
        <VideoPlayer
          url={videoLesson.video_url || ''}
          title={videoLesson.title}
          onClose={() => {
            const vl = videoLesson; setVideoLesson(null); refresh()
            if (vl.has_quiz) setQuizLesson(vl)   // must pass the quiz to complete the lesson
          }}
          // a lesson WITH a quiz is only completed by passing the quiz — watching isn't enough
          onWatched={async () => { if (!videoLesson.has_quiz) { await completeLesson(token, videoLesson.id); refresh(); award('complete_lesson', videoLesson.id) } }}
        />
      )}

      {/* Lesson quiz */}
      {quizLesson && (
        <QuizRunner
          token={token}
          lessonId={quizLesson.id}
          title={quizLesson.title}
          onClose={() => { setQuizLesson(null); refresh() }}
          onPassed={async () => { await completeLesson(token, quizLesson.id); refresh(); await award('complete_lesson', quizLesson.id); award('complete_quiz', quizLesson.id) }}
        />
      )}

      {/* End-of-unit TEST */}
      {examUnit && (
        <UnitExamRunner
          token={token}
          moduleId={examUnit.id}
          title={examUnit.title}
          onClose={() => { setExamUnit(null); reloadExams() }}
          onPassed={() => { reloadExams() }}
        />
      )}

      {/* Unit reading + listening + comprehension */}
      {readingUnit && (
        <ReadingViewer
          token={token}
          moduleId={readingUnit.id}
          title={readingUnit.title}
          onClose={() => { setReadingUnit(null); refresh() }}
          onDone={async (s, t) => { await logActivity(token, 'completed_reading_quiz', 'module', readingUnit.id, `${readingUnit.title} (${s}/${t})`); award('complete_reading', null, readingUnit.id) }}
        />
      )}

      {/* Unit conversation submission + feedback */}
      {submitUnit && (
        <SubmissionPanel
          token={token}
          moduleId={submitUnit.id}
          moduleTitle={submitUnit.title}
          existing={submissions.filter(x => x.module_id === submitUnit.id)}
          onClose={() => setSubmitUnit(null)}
          onSubmitted={reloadGate}
        />
      )}

      {/* Bottom nav — brown to match the dashboard, gold for the active tab */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-[var(--ic-dark)] border-t border-[var(--ic-dark-2)]">
        <div className="max-w-2xl mx-auto flex">
          {TABS.map(t => { const active = tab === t.id; return (
            <button key={t.id} onClick={() => goTab(t.id)} className="relative flex-1 flex flex-col items-center gap-0.5 py-2.5">
              {active && <span className="absolute top-0 inset-x-5 h-0.5 bg-[var(--ic-gold)] rounded-full" />}
              <div className="relative"><t.icon size={20} className={active ? 'text-[var(--ic-gold)]' : 'text-amber-100/45'} strokeWidth={active ? 2.4 : 2} />{(t.badge ?? 0) > 0 && <span className="absolute -top-1.5 -left-2 bg-rose-500 text-white text-[9px] font-bold min-w-[15px] h-[15px] px-0.5 rounded-full flex items-center justify-center">{t.badge}</span>}</div>
              <span className={`text-[10px] font-bold ${active ? 'text-[var(--ic-gold)]' : 'text-amber-100/45'}`}>{t.label}</span>
            </button>
          )})}
        </div>
      </nav>
    </div>
  )
}

/* ── helpers ─────────────────────────────────────────────── */
const pct = (d: number, t: number) => t > 0 ? Math.round((d / t) * 100) : 0

function Ring({ pct }: { pct: number }) {
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
function HeroStat({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return <div className="bg-white/[0.06] rounded-xl p-2.5 text-center"><Icon size={14} className="text-[var(--ic-gold)] mx-auto mb-1" /><div className="font-black text-[14px] text-white">{value}</div><div className="text-[9px] text-zinc-400 leading-tight">{label}</div></div>
}
function Card({ title, sub, icon: Icon, iconColor, action, children, compact }: { title: string; sub?: string; icon: any; iconColor: string; action?: ReactNode; children: ReactNode; compact?: boolean }) {
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
function LessonThumb({ title, topic, chip, seed, videoUrl, onClick }: { title: string; topic?: string | null; chip?: string; seed: string; videoUrl?: string | null; onClick?: () => void }) {
  const yt = ytThumb(videoUrl)
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
      <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 text-[10px] font-bold bg-black/55 backdrop-blur-sm text-white px-2 py-0.5 rounded-full"><Play size={9} fill="currentColor" /> فيديو</span>
      {chip && <span className="absolute top-2.5 right-2.5 text-[10px] font-bold bg-[var(--ic-gold)] text-black px-2 py-0.5 rounded-full">{chip}</span>}
      <span className="absolute inset-x-0 bottom-0 p-3.5 text-right">
        <span className="block text-white font-black text-[15px] leading-snug line-clamp-2 drop-shadow-lg">{title}</span>
        <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--ic-gold)]">ابدأ المشاهدة <ChevronLeft size={12} /></span>
      </span>
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30 transition-transform group-hover:scale-110">
          <span className="w-11 h-11 rounded-full bg-[var(--ic-gold)] flex items-center justify-center shadow-lg vp-pulse"><Play size={22} className="text-black" fill="currentColor" style={{ marginInlineStart: 2 }} /></span>
        </span>
      </span>
    </button>
  )
}
function TaskCard({ tone, icon: Icon, title, meta, cta, onClick, thumb }: { tone: string; icon: any; title: string; meta: string; cta: string; onClick: () => void; thumb?: string | null }) {
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
function MiniBar({ label, pct, color, big }: { label: string; pct: number; color: string; big?: boolean }) {
  return <div><div className="flex items-center justify-between text-[12px] mb-1"><span className="text-zinc-600">{label}</span><span className="font-bold text-zinc-800">{pct}%</span></div><div className={`${big ? 'h-2.5' : 'h-2'} bg-zinc-100 rounded-full overflow-hidden`}><div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} /></div></div>
}
function MiniStat({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return <div className="bg-zinc-50 rounded-xl p-2.5"><Icon size={15} className="text-yellow-500 mx-auto mb-1" /><div className="font-black text-[14px] text-zinc-900">{value}</div><div className="text-[10px] text-zinc-400">{label}</div></div>
}
function SectionTitle({ icon: Icon, color, children }: { icon: any; color: string; children: ReactNode }) { return <h2 className="flex items-center gap-2 font-bold text-[15px] text-zinc-900"><Icon size={16} className={color} /> {children}</h2> }
function Empty({ emoji, text, sub, mini }: { emoji?: string; text: string; sub?: string; mini?: boolean }) {
  if (mini) return <div className="py-4 text-center text-[12px] text-zinc-400">{text}</div>
  return <div className="flex flex-col items-center py-12 text-center"><div className="text-4xl mb-2">{emoji ?? '📭'}</div><div className="text-[14px] font-semibold text-zinc-600">{text}</div>{sub && <div className="text-[12px] text-zinc-400 mt-1 max-w-xs">{sub}</div>}</div>
}
/** Course chooser. Shows ALL published courses: the ones the student is enrolled
 *  in are OPEN (each in its own color); the rest are LOCKED, so students discover
 *  the full catalogue and can ask to subscribe. Reachable any time via the header
 *  switcher (onClose returns to the current course). */
function CoursePicker({ enrolled, catalog, name, token, onPick, onClose, onLogout }: {
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
const OFFER_HOURS = 48
const OFFER_KEY = 'inglizi.offer_deadline.'
function LimitedOfferBanner({ token }: { token: string }) {
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
function PromoCard({ p }: { p: PromoCourse }) {
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

function LessonRow({ l, unlocked, onOpen, onComplete, onQuiz }: { l: PortalLesson; unlocked: boolean; onOpen: (l: PortalLesson, url?: string | null) => void; onComplete: (l: PortalLesson) => void; onQuiz?: (l: PortalLesson) => void }) {
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
      <div className="flex-1 min-w-0"><div className="text-[13px] font-semibold text-zinc-800 truncate">{l.title}</div><div className="text-[11px] text-zinc-400">{LTYPE_AR[l.type] ?? l.type}{l.status === 'completed' ? ' · مكتمل' : l.status === 'opened' ? ' · قيد التقدم' : ''}</div></div>
      {/* the quiz launches automatically after the lesson — no 'اختبار' label that intimidates */}
      {l.has_quiz
        ? (l.status === 'completed' ? <span className="text-[11px] font-bold text-emerald-600 flex-shrink-0">✓</span> : null)
        : (l.status !== 'completed'
            ? <button onClick={e => { e.stopPropagation(); onComplete(l) }} className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex-shrink-0">تم</button>
            : <span className="text-[11px] font-bold text-emerald-600 flex-shrink-0">✓</span>)}
    </div>
  )
}
function ExamRow({ e }: { e: { title: string; level: string | null; exam_date: string | null; score: number | null; max_score: number | null; passed: boolean | null; teacher_note: string | null } }) {
  const p = e.score != null && e.max_score ? Math.round((e.score / e.max_score) * 100) : null
  return (
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${e.passed === false ? 'bg-red-50' : e.score == null ? 'bg-zinc-100' : 'bg-emerald-50'}`}><span className={`text-[15px] font-black ${e.passed === false ? 'text-red-600' : e.score == null ? 'text-zinc-400' : 'text-emerald-700'}`}>{p != null ? p : '—'}</span><span className="text-[8px] text-zinc-400">%</span></div>
      <div className="flex-1 min-w-0"><div className="font-bold text-[14px] text-zinc-800 truncate">{e.title}</div><div className="text-[11px] text-zinc-400">{e.level ? `${e.level} · ` : ''}{fmtShort(e.exam_date)}{e.passed != null ? ` · ${e.passed ? 'ناجح ✓' : 'يحتاج إعادة'}` : e.score == null ? ' · قادم' : ''}</div>{e.teacher_note && <div className="text-[11px] text-zinc-500 mt-0.5">📝 {e.teacher_note}</div>}</div>
    </div>
  )
}

class PortalErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
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
