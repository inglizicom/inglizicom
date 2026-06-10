'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Loader2, KeyRound, BookOpen, FileText, Download, ListChecks, CheckCircle2,
  Circle, ExternalLink, Sparkles, LogOut, TrendingUp, Home, Route, Award,
  PlayCircle, Clock, Flame, ChevronLeft, FileAudio, Image as ImageIcon, FileType,
  Lock, AlertCircle, MessageSquareText,
} from 'lucide-react'
import {
  fetchStudentSpace, completeExercise, logActivity, fileUrl, guessFileType,
  type StudentSpace, type StudentAssignment,
} from '@/lib/student-portal'

const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'
const fmtShort = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric' }) : '—'
const fmtSize = (b?: number | null) => !b ? '' : b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`

type Tab = 'home' | 'path' | 'tasks' | 'files' | 'progress'
const TOKEN_KEY = 'inglizi.student_token'

const ACTIVITY_AR: Record<string, string> = {
  login: 'سجّل الدخول', opened_lesson: 'فتح درسًا', opened_exercise: 'فتح تمرينًا',
  completed_exercise: 'أنجز تمرينًا', downloaded_file: 'حمّل ملفًا',
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
    const t = rawToken.trim().toUpperCase()
    if (!t) return false
    setLoading(true); setError('')
    const res = await fetchStudentSpace(t)
    setLoading(false)
    if (!res.found) { if (!isAuto) setError('رمز غير صحيح، تواصل مع الإدارة.'); return false }
    setSpace(res); setToken(t); setTab('home')
    try { localStorage.setItem(TOKEN_KEY, t) } catch {}
    logActivity(t, 'login')   // fire-and-forget
    return true
  }

  /* One-tap login from ?token= or saved token */
  useEffect(() => {
    (async () => {
      const urlToken = sp.get('token')
      const saved = (() => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } })()
      const t = urlToken || saved
      if (t) await enter(t, true)
      setBooting(false)
    })()
  }, [])

  async function refresh() { if (token) { const r = await fetchStudentSpace(token); if (r.found) setSpace(r) } }
  function logout() { try { localStorage.removeItem(TOKEN_KEY) } catch {}; setSpace(null); setToken(''); setCode(''); setError('') }

  if (booting) return <div className="min-h-screen bg-[#14161c] flex items-center justify-center"><Loader2 className="animate-spin text-yellow-400" size={28} /></div>

  /* ════════ LOGIN ════════ */
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
            <button type="submit" disabled={loading || !code.trim()}
              className="mt-4 w-full py-3.5 rounded-2xl bg-black text-white font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />} دخول
            </button>
            <p className="text-[11px] text-zinc-400 text-center mt-3 leading-relaxed">ستجد رمز الدخول على وصل الدفع الخاص بك أو من إدارة Inglizi.com.</p>
          </form>
        </div>
      </div>
    )
  }

  /* ════════ APP ════════ */
  const s = space.student!
  const stats = space.stats!
  const exercises = space.exercises ?? []
  const files = space.files ?? []
  const exams = space.exams ?? []
  const recent = space.recent_activity ?? []
  const pending = exercises.filter(e => e.status !== 'done')

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'path', label: 'مساري', icon: Route },
    { id: 'tasks', label: 'التمارين', icon: ListChecks },
    { id: 'files', label: 'الملفات', icon: FileText },
    { id: 'progress', label: 'تقدّمي', icon: TrendingUp },
  ]

  async function onComplete(a: StudentAssignment) {
    if (a.status === 'done') return
    const ok = await completeExercise(token, a.id)
    if (ok) refresh()
  }
  function openExercise(a: StudentAssignment) {
    logActivity(token, 'opened_exercise', 'exercise', a.id, a.title)
    if (a.link_url) window.open(a.link_url, '_blank')
  }
  function openFile(f: { id: string; file_name: string; file_path: string }) {
    logActivity(token, 'downloaded_file', 'file', f.id, f.file_name)
    window.open(fileUrl(f.file_path), '_blank')
  }
  function startTodayLesson() {
    logActivity(token, 'opened_today_task', 'lesson', undefined, s.today_lesson_title ?? 'درس اليوم')
    if (s.today_lesson_url) window.open(s.today_lesson_url, '_blank')
    else setTab('tasks')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f4f6] pb-20">
      {/* App bar */}
      <header className="bg-[#14161c] text-white sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black">I</div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-[15px] truncate">{s.full_name}</div>
            <div className="text-[11px] text-zinc-400">{s.learning_stage || (s.student_type === 'private_student' ? 'دروس خاصة' : 'دورة')} · المستوى {s.current_level || s.course?.toUpperCase() || 'A0'}</div>
          </div>
          <button onClick={logout} className="text-zinc-400 hover:text-white p-2"><LogOut size={18} /></button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* ─────────── HOME ─────────── */}
        {tab === 'home' && (
          <>
            {/* Admin message */}
            {s.admin_message && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex gap-3">
                <MessageSquareText size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div><div className="text-[11px] font-bold text-yellow-700 mb-0.5">رسالة من الأستاذ</div><div className="text-[13px] text-yellow-900 leading-relaxed">{s.admin_message}</div></div>
              </div>
            )}

            {/* Today's task — main CTA */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl p-5 text-white">
              <div className="text-[12px] text-zinc-400 mb-1">درس اليوم</div>
              <div className="font-black text-[18px] mb-1">{s.today_lesson_title || (pending[0]?.title) || 'لا يوجد درس محدّد لليوم'}</div>
              <div className="text-[12px] text-zinc-400 mb-4">
                {s.next_task || (pending.length > 0 ? `لديك ${pending.length} تمرين بانتظارك` : 'تابع مع أستاذك لتحديد خطوتك القادمة')}
              </div>
              <button onClick={startTodayLesson}
                className="w-full py-3 rounded-2xl bg-yellow-400 text-black font-black text-[15px] flex items-center justify-center gap-2 hover:bg-yellow-300">
                <PlayCircle size={18} /> ابدأ درس اليوم
              </button>
            </div>

            {/* Progress snapshot */}
            <div className="bg-white rounded-2xl border border-zinc-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-[14px] text-zinc-800">تقدّمك العام</span>
                <span className="text-[20px] font-black text-zinc-900">{stats.overall}%</span>
              </div>
              <Bar pct={stats.overall} />
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <MiniStat icon={Flame} value={`${stats.streak}`} label="يوم متتالٍ" />
                <MiniStat icon={CheckCircle2} value={`${stats.ex_done}/${stats.ex_total}`} label="تمارين" />
                <MiniStat icon={Award} value={`${stats.exam_done}`} label="امتحانات" />
              </div>
            </div>

            {/* Quick sections */}
            <div className="grid grid-cols-2 gap-3">
              <QuickCard onClick={() => setTab('tasks')} icon={ListChecks} tone="bg-blue-50 text-blue-500" title="التمارين" sub={pending.length > 0 ? `${pending.length} مطلوب` : 'لا تمارين معلّقة'} />
              <QuickCard onClick={() => setTab('files')} icon={FileText} tone="bg-rose-50 text-rose-500" title="الملفات" sub={`${files.length} ملف`} />
              <QuickCard onClick={() => setTab('progress')} icon={Award} tone="bg-amber-50 text-amber-500" title="الامتحانات" sub={exams.length > 0 ? `${exams.length} نتيجة` : 'لا امتحانات بعد'} />
              <QuickCard onClick={() => setTab('path')} icon={Route} tone="bg-emerald-50 text-emerald-500" title="مساري" sub={`المستوى ${s.current_level || s.course?.toUpperCase() || 'A0'}`} />
            </div>

            {/* Latest result */}
            {exams[0] && (
              <div className="bg-white rounded-2xl border border-zinc-100 p-4">
                <div className="text-[12px] font-bold text-zinc-400 mb-2">آخر نتيجة</div>
                <ExamRow e={exams[0]} />
              </div>
            )}
          </>
        )}

        {/* ─────────── PATH (مساري) ─────────── */}
        {tab === 'path' && (
          <>
            <SectionTitle icon={Route} color="text-emerald-500">مسار التعلّم</SectionTitle>
            <LevelLadder current={s.current_level || s.course} />
            <div className="bg-white rounded-2xl border border-zinc-100 p-4">
              <div className="text-[13px] font-bold text-zinc-700 mb-3">خطوات {s.learning_stage || 'دورتك الحالية'}</div>
              {exercises.length === 0
                ? <Empty emoji="🗺️" text="سيظهر مسار دروسك هنا بمجرد أن يحدّده أستاذك" />
                : <div className="relative pr-3">
                    {exercises.map((a, i) => (
                      <div key={a.id} className="flex gap-3 pb-4 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black ${a.status === 'done' ? 'bg-emerald-500 text-white' : a.id === pending[0]?.id ? 'bg-yellow-400 text-black' : 'bg-zinc-200 text-zinc-500'}`}>
                            {a.status === 'done' ? '✓' : i + 1}
                          </div>
                          {i < exercises.length - 1 && <div className={`w-0.5 flex-1 mt-1 ${a.status === 'done' ? 'bg-emerald-300' : 'bg-zinc-200'}`} />}
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="font-semibold text-[14px] text-zinc-800">{a.title}</div>
                          <div className="text-[11px] text-zinc-400">{CATEGORY_AR[a.category] ?? a.category}{a.status === 'done' && a.completed_at ? ` · أُنجز ${fmtShort(a.completed_at)}` : a.due_date ? ` · حتى ${fmtShort(a.due_date)}` : ''}</div>
                        </div>
                      </div>
                    ))}
                  </div>}
            </div>
          </>
        )}

        {/* ─────────── TASKS ─────────── */}
        {tab === 'tasks' && (
          <>
            <SectionTitle icon={ListChecks} color="text-blue-500">التمارين المطلوبة</SectionTitle>
            {exercises.length === 0 && <Empty emoji="🎯" text="لم يتم تكليفك بتمارين بعد" sub="تواصل مع الإدارة إذا كنت تعتقد أن هناك خطأ" />}
            {exercises.map(a => (
              <div key={a.id} className="bg-white rounded-2xl border border-zinc-100 p-4">
                <div className="flex items-start gap-3">
                  {a.status === 'done' ? <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" /> : <Circle size={20} className="text-zinc-300 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[14px] text-zinc-800">{a.title}</div>
                    {a.description && <div className="text-[12px] text-zinc-500 mt-1 leading-relaxed">{a.description}</div>}
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-400">
                      <span className="bg-zinc-100 px-1.5 py-0.5 rounded">{CATEGORY_AR[a.category] ?? a.category}</span>
                      {a.due_date && <span className="flex items-center gap-0.5"><Clock size={11} /> حتى {fmtShort(a.due_date)}</span>}
                      {a.status === 'done' && a.completed_at && <span className="text-emerald-600">✓ {fmtShort(a.completed_at)}</span>}
                    </div>
                    <div className="flex gap-2 mt-2.5">
                      {a.link_url && (
                        <button onClick={() => openExercise(a)} className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg">
                          ابدأ التمرين <ExternalLink size={12} />
                        </button>
                      )}
                      {a.status !== 'done'
                        ? <button onClick={() => onComplete(a)} className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg"><CheckCircle2 size={12} /> تم الإنجاز</button>
                        : <span className="text-[12px] font-bold text-emerald-600 px-3 py-1.5">مُنجز ✓</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ─────────── FILES ─────────── */}
        {tab === 'files' && (
          <>
            <SectionTitle icon={FileText} color="text-rose-500">الملفات والمستندات</SectionTitle>
            {files.length === 0 && <Empty emoji="📁" text="لا توجد ملفات بعد" sub="سيشارك أستاذك ملفاتك هنا" />}
            {files.map(f => {
              const type = f.file_type || guessFileType(f.file_name)
              const Icon = type === 'audio' ? FileAudio : type === 'image' ? ImageIcon : type === 'pdf' ? FileType : FileText
              return (
                <button key={f.id} onClick={() => openFile(f)} className="w-full flex items-center gap-3 bg-white rounded-2xl border border-zinc-100 p-4 text-right hover:border-zinc-300">
                  <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0"><Icon size={18} className="text-rose-500" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[13px] text-zinc-800 truncate">{f.file_name}</div>
                    <div className="text-[11px] text-zinc-400">{type.toUpperCase()}{f.size_bytes ? ` · ${fmtSize(f.size_bytes)}` : ''} · {fmtShort(f.created_at)}</div>
                  </div>
                  <Download size={18} className="text-zinc-400 flex-shrink-0" />
                </button>
              )
            })}
          </>
        )}

        {/* ─────────── PROGRESS ─────────── */}
        {tab === 'progress' && (
          <>
            {/* Overall + categories */}
            <div className="bg-white rounded-2xl border border-zinc-100 p-5">
              <SectionTitle icon={TrendingUp} color="text-emerald-500">تقدّمي حسب الفئة</SectionTitle>
              <div className="mt-3 space-y-3">
                <CatBar label="التمارين" done={stats.ex_done} total={stats.ex_total} color="bg-blue-500" />
                <CatBar label="الامتحانات" done={stats.exam_done} total={stats.exam_total} color="bg-amber-500" />
                <CatBar label="الملفات المفتوحة" done={stats.files_opened} total={stats.files_total} color="bg-rose-500" />
                <CatBar label="الدروس المفتوحة" done={stats.lessons_opened} total={Math.max(stats.lessons_opened, stats.ex_total)} color="bg-emerald-500" />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <MiniStat icon={Flame} value={`${stats.streak}`} label="يوم متتالٍ" />
                <MiniStat icon={CheckCircle2} value={`${stats.ex_done}`} label="مهمة منجزة" />
                <MiniStat icon={Clock} value={stats.last_activity ? fmtShort(stats.last_activity) : '—'} label="آخر نشاط" />
              </div>
            </div>

            {/* Exams */}
            <SectionTitle icon={Award} color="text-amber-500">الامتحانات والنتائج</SectionTitle>
            {exams.length === 0 && <Empty emoji="📝" text="لا توجد امتحانات بعد" />}
            {exams.map(e => <div key={e.id} className="bg-white rounded-2xl border border-zinc-100 p-4"><ExamRow e={e} /></div>)}

            {/* Activity */}
            {recent.length > 0 && (
              <div className="bg-white rounded-2xl border border-zinc-100 p-4">
                <div className="text-[13px] font-bold text-zinc-700 mb-3">آخر نشاطك</div>
                <div className="space-y-2">
                  {recent.slice(0, 8).map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-[12px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                      <span className="text-zinc-600 flex-1">{ACTIVITY_AR[r.event_type] ?? r.event_type}{r.entity_title ? `: ${r.entity_title}` : ''}</span>
                      <span className="text-zinc-400">{fmtShort(r.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom tabs */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-zinc-200">
        <div className="max-w-2xl mx-auto flex">
          {TABS.map(t => {
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className="relative flex-1 flex flex-col items-center gap-0.5 py-2.5">
                {active && <span className="absolute top-0 inset-x-5 h-0.5 bg-yellow-400 rounded-full" />}
                <t.icon size={20} className={active ? 'text-zinc-900' : 'text-zinc-400'} strokeWidth={active ? 2.4 : 2} />
                <span className={`text-[10px] font-bold ${active ? 'text-zinc-900' : 'text-zinc-400'}`}>{t.label}</span>
                {t.id === 'tasks' && pending.length > 0 && (
                  <span className="absolute top-1.5 left-[26%] bg-rose-500 text-white text-[9px] font-bold min-w-[15px] h-[15px] px-0.5 rounded-full flex items-center justify-center">{pending.length}</span>
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

/* ── pieces ─────────────────────────────────────────────── */
const CATEGORY_AR: Record<string, string> = {
  exercise: 'تمرين', lesson: 'درس', reading: 'قراءة', speaking: 'محادثة', quiz: 'اختبار', vocabulary: 'مفردات',
}

function Bar({ pct }: { pct: number }) {
  return <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} /></div>
}
function CatBar({ label, done, total, color }: { label: string; done: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between text-[12px] mb-1"><span className="text-zinc-600">{label}</span><span className="font-bold text-zinc-800">{done}/{total}</span></div>
      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} /></div>
    </div>
  )
}
function MiniStat({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return <div className="bg-zinc-50 rounded-xl p-2.5"><Icon size={15} className="text-yellow-500 mx-auto mb-1" /><div className="font-black text-[14px] text-zinc-900">{value}</div><div className="text-[10px] text-zinc-400">{label}</div></div>
}
function QuickCard({ onClick, icon: Icon, tone, title, sub }: { onClick: () => void; icon: any; tone: string; title: string; sub: string }) {
  return (
    <button onClick={onClick} className="bg-white rounded-2xl p-4 text-right border border-zinc-100 hover:border-zinc-300">
      <div className={`w-10 h-10 rounded-xl ${tone} flex items-center justify-center mb-2`}><Icon size={20} /></div>
      <div className="font-bold text-[14px] text-zinc-800">{title}</div>
      <div className="text-[12px] text-zinc-400">{sub}</div>
    </button>
  )
}
function SectionTitle({ icon: Icon, color, children }: { icon: any; color: string; children: React.ReactNode }) {
  return <h2 className="flex items-center gap-2 font-bold text-[15px] text-zinc-900"><Icon size={16} className={color} /> {children}</h2>
}
function Empty({ emoji, text, sub }: { emoji: string; text: string; sub?: string }) {
  return <div className="flex flex-col items-center py-12 text-center"><div className="text-4xl mb-2">{emoji}</div><div className="text-[14px] font-semibold text-zinc-600">{text}</div>{sub && <div className="text-[12px] text-zinc-400 mt-1 max-w-xs">{sub}</div>}</div>
}
function LevelLadder({ current }: { current?: string | null }) {
  const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1']
  const cur = (current || 'A0').toUpperCase().replace(/[^A-C0-9]/g, '').slice(0, 2) || 'A0'
  const idx = Math.max(0, LEVELS.findIndex(l => cur.startsWith(l)))
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-4 flex items-center gap-1 overflow-x-auto">
      {LEVELS.map((lv, i) => (
        <div key={lv} className="flex items-center gap-1 flex-shrink-0">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-[12px] font-black ${i < idx ? 'bg-emerald-100 text-emerald-700' : i === idx ? 'bg-yellow-400 text-black ring-2 ring-yellow-200' : 'bg-zinc-100 text-zinc-400'}`}>
            {i > idx ? <Lock size={13} /> : lv}
          </div>
          {i < LEVELS.length - 1 && <div className={`w-4 h-0.5 ${i < idx ? 'bg-emerald-300' : 'bg-zinc-200'}`} />}
        </div>
      ))}
    </div>
  )
}
function ExamRow({ e }: { e: { title: string; level: string | null; exam_date: string | null; score: number | null; max_score: number | null; passed: boolean | null; teacher_note: string | null } }) {
  const pct = e.score != null && e.max_score ? Math.round((e.score / e.max_score) * 100) : null
  return (
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${e.passed === false ? 'bg-red-50' : 'bg-emerald-50'}`}>
        <span className={`text-[15px] font-black ${e.passed === false ? 'text-red-600' : 'text-emerald-700'}`}>{pct != null ? `${pct}` : '—'}</span>
        <span className="text-[8px] text-zinc-400">%</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[14px] text-zinc-800 truncate">{e.title}</div>
        <div className="text-[11px] text-zinc-400">{e.level ? `${e.level} · ` : ''}{fmtShort(e.exam_date)}{e.passed != null ? ` · ${e.passed ? 'ناجح ✓' : 'يحتاج إعادة'}` : ''}</div>
        {e.teacher_note && <div className="text-[11px] text-zinc-500 mt-0.5">📝 {e.teacher_note}</div>}
      </div>
    </div>
  )
}
