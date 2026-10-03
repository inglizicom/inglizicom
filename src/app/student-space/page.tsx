'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Loader2, KeyRound, BookOpen, CheckCircle2, Sparkles, LogOut, Home, Route, PlayCircle, ArrowLeft,
  Lock, AlertCircle, MessageSquareText, ChevronDown, ListChecks, Bell, MessageSquare, Star, Medal,
  Clock, Coins, UserRound,
} from 'lucide-react'
import {
  fetchStudentSpace, completeExercise, logActivity, fileUrl, studentLogin, getDeviceId, deviceValid,
  fetchUnitSteps, fetchCourseCatalog, sendHeartbeat, fetchStudentAvatar, type CatalogCourse,
  type StudentSpace, type StudentAssignment, type PortalLesson, type PortalModule, type UnitSteps,
  fetchExerciseBoard, type ExerciseBoard, type ExerciseItem, type BoardTask,
} from '@/lib/student-portal'
import { checkCertificates, type StudentCert } from '@/lib/certificates'
import {
  openLesson, completeLesson, fetchStudentResources, fetchProgressMeta, fetchReadingUnits,
  fetchMySubmissions, fetchUnitExams, fetchNotifications, markNotificationsRead, CORRECTOR_WHATSAPP,
  type CourseResource, type ProgressMeta, type UnitSubmission, type StudentNotification,
} from '@/lib/lms'
import VideoPlayer from '@/components/VideoPlayer'
import InstallAppBanner from '@/components/InstallAppBanner'
import EnableNotifications from '@/components/EnableNotifications'
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
import { courseTheme } from '@/lib/course-theme'
import { isDemo, DEMO_SPACE, DEMO_BOARD } from '@/lib/demo'
import { fetchStudentAnnouncements, type StudentAnnouncement } from '@/lib/announcements'
import {
  fetchStudentDashboard, logWatchTime, classifyTracks, DEMO_STUDENT_DASHBOARD, type StudentDashboard,
} from '@/lib/student-dashboard'
import MyCourses from '@/components/student-dashboard/MyCourses'
import MyProfile from '@/components/student-dashboard/MyProfile'

import {
  isVideoUrl, NOTIF_SEEN_KEY, localDay, fmtShort, InitAva, DAY_AR, tabFromHash, TOKEN_KEY,
  HEARTBEAT_AR, COURSE_KEY, pct, CoursePicker, PortalErrorBoundary, type Tab,
} from './_shared'
import HomeTab from './tabs/HomeTab'
import PathTab from './tabs/PathTab'
import TasksTab from './tabs/TasksTab'
import FilesTab from './tabs/FilesTab'
import ProgressTab from './tabs/ProgressTab'

export default function StudentSpacePage() {
  return (
    <PortalErrorBoundary>
      <Suspense fallback={<div className="min-h-screen bg-[#2a1d12]" />}><Portal /></Suspense>
      <InstallAppBanner />
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
  const [board, setBoard] = useState<ExerciseBoard | null>(null)   // curriculum exercises + staff tasks, per course
  // "My courses" / "My profile": course + class tracks, attendance, payments (054).
  // undefined = loading, null = unavailable.
  const [dash, setDash] = useState<StudentDashboard | null | undefined>(undefined)

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
    if (demo) { setSpace(DEMO_SPACE); setToken('DEMO'); fetchCoins('DEMO').then(setCoins); const r = tabFromHash(); if (r) setTab(r); setBooting(false); return }   // token-free local preview (keeps #tab, like a real refresh)
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
  // exercises mapped to their real unit + lesson (and staff tasks, kept separate) — per chosen course
  useEffect(() => {
    if (demo) { setBoard(DEMO_BOARD); return }
    if (token && selectedCourseId) fetchExerciseBoard(token, selectedCourseId).then(setBoard)
  }, [token, space, selectedCourseId, submissions, unitExams])
  useEffect(() => {
    if (demo) { setDash(DEMO_STUDENT_DASHBOARD); return }
    if (token) fetchStudentDashboard(token).then(d => setDash(d.found ? d : null))
  }, [token, space])
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
  // Staff-assigned tasks. student_space returns them as `assignments` (the old
  // `exercises` key was never sent, so these never showed before).
  const manualEx = space.assignments ?? space.exercises ?? []
  const boardTasks: BoardTask[] = board?.tasks ?? []
  // exercise items per lesson, from the board (true source: lesson/unit fields)
  const itemsByLesson = new Map<string, ExerciseItem[]>()
  for (const u of board?.units ?? []) for (const l of u.lessons) itemsByLesson.set(l.lesson_id, l.items)
  const curriculumItems = (board?.units ?? []).flatMap(u => [
    ...u.lessons.flatMap(l => l.items.map(i => ({ ...i, key: `${l.lesson_id}:${i.kind}`, where: `${u.title} · ${l.title}` }))),
    ...u.unit_items.map(i => ({ ...i, key: `${u.module_id}:${i.kind}`, where: u.title })),
  ])

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
  const activeDates = new Set(recent.map(r => localDay(r.created_at)))
  const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return { day: DAY_AR[d.getDay()], active: activeDates.has(localDay(d)) } })

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
    { id: 'courses', label: 'دوراتي', icon: BookOpen },
    { id: 'path', label: 'مساري', icon: Route },
    { id: 'tasks', label: 'تماريني', icon: ListChecks, badge: boardTasks.filter(t => t.status !== 'done').length },
    { id: 'rewards', label: 'المكافآت', icon: Coins },
    { id: 'profile', label: 'ملفي', icon: UserRound },
  ]
  const tracks = dash ? classifyTracks(dash) : null
  const coursePct = pct(flat.filter(x => x.lesson.status === 'completed').length, flat.length)

  return (
    <div dir="rtl" className="min-h-screen pb-20" style={{
      background: theme.cream,
      ['--ic-dark' as string]: theme.dark, ['--ic-dark-2' as string]: theme.dark2, ['--ic-dark-3' as string]: theme.dark3,
      ['--ic-cream' as string]: theme.cream, ['--ic-gold' as string]: theme.gold, ['--ic-gold-soft' as string]: theme.goldSoft,
      ['--ic-grad-from' as string]: theme.grad[0], ['--ic-grad-to' as string]: theme.grad[1],
    } as React.CSSProperties}>
      {!demo && token && !overlayOpen && <EnableNotifications token={token} />}
      {/* ─── Static, non-sensitive watermark ─── */}
      <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden select-none" aria-hidden>
        <span className="absolute top-3 right-3 max-w-[40vw] truncate text-[10px] font-bold text-black/[0.035]">Inglizi · student space</span>
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
          {course && <button onClick={() => setPickerOpen(true)} className="lg:hidden text-[11px] font-bold rounded-full px-2.5 py-1 flex items-center gap-1 max-w-[32vw] active:scale-95 transition" style={{ background: theme.gold, color: theme.dark }} title="تبديل الدورة"><span className="truncate">{course.title}</span> <ChevronDown size={12} className="shrink-0" /></button>}
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
              <a href={`/certificate/${newCert.serial}?print=1`} target="_blank" rel="noreferrer" onClick={() => setNewCert(null)}
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
        {tab === 'home' && <HomeTab {...{ achievements, boardTasks, cert, coins, course, coursePct, currentModule, curriculumItems, dash, demo, examOk, files, firstName, fmtDate, goTab, isUnlocked, itemsByLesson, meta, modProg, myCerts, nextExam, notifs, onCompleteLesson, onOpenLesson, openFile, recent, resources, reviewedModules, s, sched, setExamUnit, setPractice, setQuizLesson, setShowExam, setSubmitUnit, setVocabOpen, stats, submissions, today, token, tracks, week }} />}

        {/* ═══════════ PATH ═══════════ */}
        {tab === 'path' && <PathTab {...{ course, examModules, examOk, examPassed, fmtDate, isUnlocked, itemsByLesson, markStep, modProg, notifs, onCompleteLesson, onOpenLesson, readingUnits, reviewedModules, setExamUnit, setQuizLesson, setReadingUnit, setSubmitUnit, stepDone, submissions, token, unitDeadlineMs }} />}

        {/* ═══════════ TASKS ═══════════ */}
        {tab === 'tasks' && <TasksTab {...{ board, boardTasks, manualEx, onCompleteManual }} />}

        {/* ═══════════ REWARDS ═══════════ */}
        {tab === 'rewards' && <RewardsCenter token={token} courseId={courseId} onPractice={k => setPractice(k)} onVocab={() => setVocabOpen(true)} onPicture={() => setPictureOpen(true)} />}

        {/* ═══════════ FILES ═══════════ */}
        {tab === 'files' && <FilesTab {...{ files, openFile, resources, token }} />}

        {/* ═══════════ PROGRESS ═══════════ */}
        {tab === 'progress' && <ProgressTab {...{ exams, stats }} />}
        {/* ═══════════ MY COURSES / MY PROFILE ═══════════ */}
        {(tab === 'courses' || tab === 'profile') && dash === undefined && (
          <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-[var(--ic-gold)]" size={26} /></div>
        )}
        {(tab === 'courses' || tab === 'profile') && dash === null && (
          <div className="max-w-md mx-auto my-12 rounded-3xl bg-white border border-zinc-100 p-6 text-center">
            <AlertCircle className="mx-auto text-amber-500 mb-2" size={26} />
            <p className="font-bold text-zinc-800">تعذّر تحميل لوحتك الآن</p>
            <p className="text-[12.5px] text-zinc-500 mt-1">أعد المحاولة بعد قليل — دروسك متاحة دائمًا في «مساري».</p>
            <button onClick={() => goTab('path')} className="mt-4 rounded-2xl bg-[var(--ic-dark)] px-5 py-2.5 text-[13px] font-bold text-white">افتح مساري</button>
          </div>
        )}
        {tab === 'courses' && dash && (
          <MyCourses dash={dash} name={s.full_name} avatarUrl={avatarUrl ?? dash.student?.avatar_url ?? null}
            level={{ current: s.current_level, next: s.next_level, stage: s.learning_stage }} overallPct={stats.overall}
            resume={today ? { lesson: today.lesson.title, unit: today.m.title, course: course?.title ?? null, type: today.lesson.type, courseProgress: coursePct } : null}
            onResume={() => { if (today) onOpenLesson(today.lesson, today.lesson.video_url || today.lesson.exercise_url || today.lesson.file_url) }}
            goTab={t => goTab(t)} />
        )}
        {tab === 'profile' && dash && (
          <MyProfile dash={dash} name={s.full_name} avatarUrl={avatarUrl ?? dash.student?.avatar_url ?? null}
            level={{ current: s.current_level, next: s.next_level, stage: s.learning_stage }}
            certs={myCerts} finalCert={cert} recent={recent}
            notes={{ adminMessage: s.admin_message, nextTask: s.next_task,
                     examNotes: exams.filter(e => e.teacher_note).map(e => ({ title: e.title, note: e.teacher_note as string })) }}
            onCourses={() => goTab('courses')} />
        )}
      </main>

      {/* In-page video player (hides YouTube branding, tracks watch progress) */}
      {videoLesson && (
        <VideoPlayer
          url={videoLesson.video_url || ''}
          title={videoLesson.title}
          onWatchTime={secs => logWatchTime(token, videoLesson.id, secs)}
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
