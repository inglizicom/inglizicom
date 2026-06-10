'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Loader2, KeyRound, BookOpen, FileText, Download, CheckCircle2, Circle,
  ExternalLink, Sparkles, LogOut, TrendingUp, Home, Route, Award, PlayCircle,
  Flame, Lock, AlertCircle, MessageSquareText, Video, PenLine, HelpCircle, Mic,
  ChevronLeft, ListChecks,
} from 'lucide-react'
import {
  fetchStudentSpace, completeExercise, logActivity, fileUrl,
  type StudentSpace, type StudentAssignment, type PortalLesson, type PortalCourse,
} from '@/lib/student-portal'
import { openLesson, completeLesson } from '@/lib/lms'

const fmtShort = (s?: string | null) => s ? new Date(s).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric' }) : '—'

type Tab = 'home' | 'path' | 'tasks' | 'files' | 'progress'
const TOKEN_KEY = 'inglizi.student_token'
const LTYPE_ICON: Record<string, any> = { video: Video, reading: FileText, exercise: PenLine, quiz: HelpCircle, speaking: Mic }
const LTYPE_AR: Record<string, string> = { video: 'فيديو', reading: 'قراءة', exercise: 'تمرين', quiz: 'اختبار', speaking: 'محادثة' }
const ACTIVITY_AR: Record<string, string> = {
  login: 'سجّل الدخول', opened_lesson: 'فتح درسًا', completed_lesson: 'أكمل درسًا',
  opened_exercise: 'فتح تمرينًا', completed_exercise: 'أنجز تمرينًا', downloaded_file: 'حمّل ملفًا',
  completed_exam: 'أكمل امتحانًا', viewed_result: 'اطّلع على نتيجة', opened_today_task: 'بدأ مهمة اليوم',
}

export default function StudentSpacePage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#14161c]" />}><Portal /></Suspense>
}

function Portal() {
  const sp = useSearchParams()
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)
  const [booting, setBooting] = useState(true)
  const [space, setSpace]     = useState<StudentSpace | null>(null)
  const [token, setToken]     = useState('')
  const [error, setError]     = useState('')
  const [tab, setTab]         = useState<Tab>('home')

  async function enter(rawToken: string, isAuto = false): Promise<boolean> {
    const t = rawToken.trim().toUpperCase(); if (!t) return false
    setLoading(true); setError('')
    const res = await fetchStudentSpace(t); setLoading(false)
    if (!res.found) { if (!isAuto) setError('رمز غير صحيح، تواصل مع الإدارة.'); return false }
    setSpace(res); setToken(t); setTab('home')
    try { localStorage.setItem(TOKEN_KEY, t) } catch {}
    logActivity(t, 'login')
    return true
  }
  useEffect(() => {
    (async () => {
      const t = sp.get('token') || (() => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } })()
      if (t) await enter(t, true)
      setBooting(false)
    })()
  }, [])
  async function refresh() { if (token) { const r = await fetchStudentSpace(token); if (r.found) setSpace(r) } }
  function logout() { try { localStorage.removeItem(TOKEN_KEY) } catch {}; setSpace(null); setToken(''); setCode(''); setError('') }

  if (booting) return <div className="min-h-screen bg-[#14161c] flex items-center justify-center"><Loader2 className="animate-spin text-yellow-400" size={28} /></div>

  /* ════ LOGIN ════ */
  if (!space?.found) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#14161c] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-black flex items-center justify-center font-black text-3xl mb-3">I</div>
            <h1 className="text-white font-black text-[22px]">فضاء الطالب</h1>
            <p className="text-zinc-400 text-[13px] mt-1">منصة Inglizi.com لتعلّم الإنجليزية</p>
          </div>
          <form onSubmit={e => { e.preventDefault(); enter(code) }} className="bg-white rounded-3xl p-6 shadow-2xl">
            <label className="flex items-center gap-1.5 text-[13px] font-bold text-zinc-700 mb-2"><KeyRound size={15} className="text-zinc-400" /> رمز الدخول</label>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="ING-XXXXXXXX" dir="ltr"
              className="w-full px-4 py-3.5 text-[17px] font-bold tracking-widest text-center uppercase bg-zinc-50 border-2 border-zinc-200 rounded-2xl focus:outline-none focus:border-yellow-400" />
            {error && <p className="text-[13px] text-red-600 mt-2 font-medium flex items-center gap-1.5"><AlertCircle size={14} /> {error}</p>}
            <button type="submit" disabled={loading || !code.trim()} className="mt-4 w-full py-3.5 rounded-2xl bg-black text-white font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />} دخول
            </button>
            <p className="text-[11px] text-zinc-400 text-center mt-3 leading-relaxed">ستجد رمز الدخول على وصل الدفع الخاص بك أو من إدارة Inglizi.com.</p>
          </form>
        </div>
      </div>
    )
  }

  /* ════ APP ════ */
  const s = space.student!
  const stats = space.stats!
  const courses = space.courses ?? []
  const course = courses[0]   // primary enrolled course
  const exams = space.exams ?? []
  const files = space.files ?? []
  const manualEx = (space.exercises ?? []).filter(e => e.status !== 'done')
  const recent = space.recent_activity ?? []

  // flatten lessons in order with their module
  const flatLessons = useMemo(() => {
    const out: { lesson: PortalLesson; moduleTitle: string }[] = []
    for (const m of course?.modules ?? []) for (const l of m.lessons) out.push({ lesson: l, moduleTitle: m.title })
    return out
  }, [course])
  const todayLesson = flatLessons.find(x => x.lesson.status !== 'completed' && !x.lesson.is_locked)
  const pendingLessons = flatLessons.filter(x => x.lesson.status !== 'completed').length

  async function onOpenLesson(l: PortalLesson, url?: string | null) {
    await openLesson(token, l.id)
    if (url) window.open(url, '_blank')
    refresh()
  }
  async function onCompleteLesson(l: PortalLesson) {
    if (await completeLesson(token, l.id)) refresh()
  }
  async function onCompleteManual(a: StudentAssignment) {
    if (a.status === 'done') return
    if (await completeExercise(token, a.id)) refresh()
  }
  function openFile(f: { id: string; file_name: string; file_path: string }) {
    logActivity(token, 'downloaded_file', 'file', f.id, f.file_name)
    window.open(fileUrl(f.file_path), '_blank')
  }

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'path', label: 'مساري', icon: Route },
    { id: 'tasks', label: 'التمارين', icon: ListChecks },
    { id: 'files', label: 'الملفات', icon: FileText },
    { id: 'progress', label: 'تقدّمي', icon: TrendingUp },
  ]

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f4f6] pb-20">
      <header className="bg-[#14161c] text-white sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black">I</div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-[15px] truncate">{s.full_name}</div>
            <div className="text-[11px] text-zinc-400 truncate">{course ? course.title : 'غير مسجّل في دورة'}{s.current_level ? ` · ${s.current_level}` : ''}</div>
          </div>
          <button onClick={logout} className="text-zinc-400 hover:text-white p-2"><LogOut size={18} /></button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* ─── HOME ─── */}
        {tab === 'home' && (
          <>
            {s.admin_message && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex gap-3">
                <MessageSquareText size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div><div className="text-[11px] font-bold text-yellow-700 mb-0.5">رسالة من الأستاذ</div><div className="text-[13px] text-yellow-900 leading-relaxed">{s.admin_message}</div></div>
              </div>
            )}

            {!course ? (
              <Empty emoji="📚" text="لم يتم تسجيلك في دورة بعد" sub="تواصل مع الإدارة لتسجيلك في دورتك" />
            ) : (
              <>
                {/* Today's lesson */}
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl p-5 text-white">
                  <div className="text-[12px] text-zinc-400 mb-1">{todayLesson ? `${course.title} · ${todayLesson.moduleTitle}` : course.title}</div>
                  <div className="font-black text-[18px] mb-1">{todayLesson ? todayLesson.lesson.title : 'أكملت كل الدروس المتاحة 🎉'}</div>
                  <div className="text-[12px] text-zinc-400 mb-4">{todayLesson ? (s.next_task || 'تابع درسك القادم') : 'بانتظار درس جديد من أستاذك'}</div>
                  {todayLesson && (
                    <button onClick={() => onOpenLesson(todayLesson.lesson, todayLesson.lesson.video_url || todayLesson.lesson.exercise_url || todayLesson.lesson.file_url)}
                      className="w-full py-3 rounded-2xl bg-yellow-400 text-black font-black text-[15px] flex items-center justify-center gap-2 hover:bg-yellow-300">
                      <PlayCircle size={18} /> ابدأ درس اليوم
                    </button>
                  )}
                </div>

                {/* Progress snapshot */}
                <div className="bg-white rounded-2xl border border-zinc-100 p-5">
                  <div className="flex items-center justify-between mb-3"><span className="font-bold text-[14px] text-zinc-800">تقدّمك في الدورة</span><span className="text-[20px] font-black text-zinc-900">{stats.overall}%</span></div>
                  <Bar pct={stats.overall} />
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <MiniStat icon={CheckCircle2} value={`${stats.lessons_done}/${stats.lessons_total}`} label="دروس" />
                    <MiniStat icon={Flame} value={`${stats.streak}`} label="يوم متتالٍ" />
                    <MiniStat icon={Award} value={`${stats.exam_done}`} label="امتحانات" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <QuickCard onClick={() => setTab('path')} icon={Route} tone="bg-emerald-50 text-emerald-500" title="مساري" sub={`${pendingLessons} درس متبقٍ`} />
                  <QuickCard onClick={() => setTab('progress')} icon={Award} tone="bg-amber-50 text-amber-500" title="الامتحانات" sub={exams.length > 0 ? `${exams.length} نتيجة` : 'لا امتحانات'} />
                  <QuickCard onClick={() => setTab('files')} icon={FileText} tone="bg-rose-50 text-rose-500" title="الملفات" sub={`${files.length} ملف`} />
                  <QuickCard onClick={() => setTab('tasks')} icon={ListChecks} tone="bg-blue-50 text-blue-500" title="تمارين إضافية" sub={manualEx.length > 0 ? `${manualEx.length} مطلوب` : 'لا شيء'} />
                </div>

                {exams[0] && <div className="bg-white rounded-2xl border border-zinc-100 p-4"><div className="text-[12px] font-bold text-zinc-400 mb-2">آخر نتيجة</div><ExamRow e={exams[0]} /></div>}
              </>
            )}
          </>
        )}

        {/* ─── PATH (course curriculum) ─── */}
        {tab === 'path' && (
          <>
            <SectionTitle icon={Route} color="text-emerald-500">مسار الدورة</SectionTitle>
            {!course ? <Empty emoji="🗺️" text="لم يتم تسجيلك في دورة بعد" />
              : course.modules.length === 0 ? <Empty emoji="🗺️" text="سيظهر محتوى دورتك هنا قريبًا" />
              : course.modules.map((m, mi) => (
                <div key={m.id} className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                  <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-100 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-[11px] font-black flex items-center justify-center">{mi + 1}</span>
                    <span className="font-bold text-[14px] text-zinc-800">{m.title}</span>
                  </div>
                  <div className="divide-y divide-zinc-50">
                    {m.lessons.map(l => <LessonRow key={l.id} l={l} onOpen={onOpenLesson} onComplete={onCompleteLesson} />)}
                    {m.lessons.length === 0 && <div className="px-4 py-3 text-[12px] text-zinc-400">لا دروس في هذه الوحدة بعد</div>}
                  </div>
                </div>
              ))}
          </>
        )}

        {/* ─── TASKS (manual extras) ─── */}
        {tab === 'tasks' && (
          <>
            <SectionTitle icon={ListChecks} color="text-blue-500">تمارين إضافية</SectionTitle>
            {(space.exercises ?? []).length === 0 && <Empty emoji="🎯" text="لا توجد تمارين إضافية" sub="تمارينك الأساسية موجودة داخل «مساري»" />}
            {(space.exercises ?? []).map(a => (
              <div key={a.id} className="bg-white rounded-2xl border border-zinc-100 p-4">
                <div className="flex items-start gap-3">
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
              </div>
            ))}
          </>
        )}

        {/* ─── FILES ─── */}
        {tab === 'files' && (
          <>
            <SectionTitle icon={FileText} color="text-rose-500">ملفاتي</SectionTitle>
            {files.length === 0 && <Empty emoji="📁" text="لا توجد ملفات بعد" />}
            {files.map(f => (
              <button key={f.id} onClick={() => openFile(f)} className="w-full flex items-center gap-3 bg-white rounded-2xl border border-zinc-100 p-4 text-right hover:border-zinc-300">
                <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0"><FileText size={18} className="text-rose-500" /></div>
                <div className="flex-1 min-w-0"><div className="font-bold text-[13px] text-zinc-800 truncate">{f.file_name}</div><div className="text-[11px] text-zinc-400">{fmtShort(f.created_at)}</div></div>
                <Download size={18} className="text-zinc-400 flex-shrink-0" />
              </button>
            ))}
          </>
        )}

        {/* ─── PROGRESS ─── */}
        {tab === 'progress' && (
          <>
            <div className="bg-white rounded-2xl border border-zinc-100 p-5">
              <SectionTitle icon={TrendingUp} color="text-emerald-500">تقدّمي</SectionTitle>
              <div className="mt-3 space-y-3">
                <CatBar label="دروس الدورة" done={stats.lessons_done} total={stats.lessons_total} color="bg-emerald-500" />
                <CatBar label="الامتحانات" done={stats.exam_done} total={stats.exam_total} color="bg-amber-500" />
                <CatBar label="تمارين إضافية" done={stats.ex_done} total={stats.ex_total} color="bg-blue-500" />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <MiniStat icon={Flame} value={`${stats.streak}`} label="يوم متتالٍ" />
                <MiniStat icon={CheckCircle2} value={`${stats.lessons_done}`} label="درس منجز" />
                <MiniStat icon={Award} value={`${stats.overall}%`} label="إجمالي" />
              </div>
            </div>

            <SectionTitle icon={Award} color="text-amber-500">الامتحانات والنتائج</SectionTitle>
            {exams.length === 0 && <Empty emoji="📝" text="لا توجد امتحانات بعد" />}
            {exams.map(e => <div key={e.id} className="bg-white rounded-2xl border border-zinc-100 p-4"><ExamRow e={e} /></div>)}

            {recent.length > 0 && (
              <div className="bg-white rounded-2xl border border-zinc-100 p-4">
                <div className="text-[13px] font-bold text-zinc-700 mb-3">آخر نشاطك</div>
                <div className="space-y-2">
                  {recent.slice(0, 8).map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-[12px]"><span className="w-1.5 h-1.5 rounded-full bg-zinc-300" /><span className="text-zinc-600 flex-1">{ACTIVITY_AR[r.event_type] ?? r.event_type}{r.entity_title ? `: ${r.entity_title}` : ''}</span><span className="text-zinc-400">{fmtShort(r.created_at)}</span></div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-zinc-200">
        <div className="max-w-2xl mx-auto flex">
          {TABS.map(t => {
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className="relative flex-1 flex flex-col items-center gap-0.5 py-2.5">
                {active && <span className="absolute top-0 inset-x-5 h-0.5 bg-yellow-400 rounded-full" />}
                <t.icon size={20} className={active ? 'text-zinc-900' : 'text-zinc-400'} strokeWidth={active ? 2.4 : 2} />
                <span className={`text-[10px] font-bold ${active ? 'text-zinc-900' : 'text-zinc-400'}`}>{t.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

/* ── Lesson row ─────────────────────────────────────────── */
function LessonRow({ l, onOpen, onComplete }: { l: PortalLesson; onOpen: (l: PortalLesson, url?: string | null) => void; onComplete: (l: PortalLesson) => void }) {
  const Icon = LTYPE_ICON[l.type] ?? Video
  const url = l.video_url || l.exercise_url || l.file_url
  if (l.is_locked) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 opacity-60">
        <Lock size={18} className="text-zinc-300 flex-shrink-0" />
        <div className="flex-1 min-w-0"><div className="text-[13px] font-semibold text-zinc-500 truncate">{l.title}</div><div className="text-[11px] text-zinc-400">مقفل</div></div>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {l.status === 'completed' ? <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> : <Icon size={18} className="text-zinc-400 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-zinc-800 truncate">{l.title}</div>
        <div className="text-[11px] text-zinc-400 flex gap-1.5">{LTYPE_AR[l.type] ?? l.type}{l.video_url && <span>· 🎬</span>}{l.file_url && <span>· 📎</span>}{l.has_quiz && <span>· اختبار</span>}</div>
      </div>
      {url && <button onClick={() => onOpen(l, url)} className="text-[11px] font-bold text-white bg-blue-500 px-2.5 py-1 rounded-lg flex items-center gap-1">فتح <ExternalLink size={11} /></button>}
      {l.status !== 'completed'
        ? <button onClick={() => onComplete(l)} className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">تم</button>
        : <span className="text-[11px] font-bold text-emerald-600">✓</span>}
    </div>
  )
}

/* ── pieces ─────────────────────────────────────────────── */
function Bar({ pct }: { pct: number }) { return <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} /></div> }
function CatBar({ label, done, total, color }: { label: string; done: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return <div><div className="flex items-center justify-between text-[12px] mb-1"><span className="text-zinc-600">{label}</span><span className="font-bold text-zinc-800">{done}/{total}</span></div><div className="h-2 bg-zinc-100 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} /></div></div>
}
function MiniStat({ icon: Icon, value, label }: { icon: any; value: string; label: string }) { return <div className="bg-zinc-50 rounded-xl p-2.5"><Icon size={15} className="text-yellow-500 mx-auto mb-1" /><div className="font-black text-[14px] text-zinc-900">{value}</div><div className="text-[10px] text-zinc-400">{label}</div></div> }
function QuickCard({ onClick, icon: Icon, tone, title, sub }: { onClick: () => void; icon: any; tone: string; title: string; sub: string }) {
  return <button onClick={onClick} className="bg-white rounded-2xl p-4 text-right border border-zinc-100 hover:border-zinc-300"><div className={`w-10 h-10 rounded-xl ${tone} flex items-center justify-center mb-2`}><Icon size={20} /></div><div className="font-bold text-[14px] text-zinc-800">{title}</div><div className="text-[12px] text-zinc-400">{sub}</div></button>
}
function SectionTitle({ icon: Icon, color, children }: { icon: any; color: string; children: React.ReactNode }) { return <h2 className="flex items-center gap-2 font-bold text-[15px] text-zinc-900"><Icon size={16} className={color} /> {children}</h2> }
function Empty({ emoji, text, sub }: { emoji: string; text: string; sub?: string }) { return <div className="flex flex-col items-center py-12 text-center"><div className="text-4xl mb-2">{emoji}</div><div className="text-[14px] font-semibold text-zinc-600">{text}</div>{sub && <div className="text-[12px] text-zinc-400 mt-1 max-w-xs">{sub}</div>}</div> }
function ExamRow({ e }: { e: { title: string; level: string | null; exam_date: string | null; score: number | null; max_score: number | null; passed: boolean | null; teacher_note: string | null } }) {
  const pct = e.score != null && e.max_score ? Math.round((e.score / e.max_score) * 100) : null
  return (
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${e.passed === false ? 'bg-red-50' : 'bg-emerald-50'}`}><span className={`text-[15px] font-black ${e.passed === false ? 'text-red-600' : 'text-emerald-700'}`}>{pct != null ? pct : '—'}</span><span className="text-[8px] text-zinc-400">%</span></div>
      <div className="flex-1 min-w-0"><div className="font-bold text-[14px] text-zinc-800 truncate">{e.title}</div><div className="text-[11px] text-zinc-400">{e.level ? `${e.level} · ` : ''}{fmtShort(e.exam_date)}{e.passed != null ? ` · ${e.passed ? 'ناجح ✓' : 'يحتاج إعادة'}` : ''}</div>{e.teacher_note && <div className="text-[11px] text-zinc-500 mt-0.5">📝 {e.teacher_note}</div>}</div>
    </div>
  )
}
