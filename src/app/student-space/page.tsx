'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, Loader2, KeyRound, BookOpen, FileText, Download,
  ListChecks, CheckCircle2, Circle, ExternalLink, Sparkles, LogOut,
  TrendingUp, Home, Trophy, Clock, Flame, Star,
} from 'lucide-react'
import { fetchStudentSpace, fileUrl, type StudentSpace } from '@/lib/student-portal'

const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'
const fmtSize = (b?: number | null) =>
  !b ? '' : b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`
const avatarUrl = (name: string) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name || '?')}`

type Tab = 'home' | 'tasks' | 'files' | 'progress'

export default function StudentSpacePage() {
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)
  const [space, setSpace]     = useState<StudentSpace | null>(null)
  const [error, setError]     = useState('')
  const [tab, setTab]         = useState<Tab>('home')

  async function enter(e?: React.FormEvent) {
    e?.preventDefault()
    if (!code.trim()) return
    setLoading(true); setError('')
    const res = await fetchStudentSpace(code)
    if (!res.found) { setError('رمز الدخول غير صحيح. تأكد من الرمز أو تواصل مع الإدارة.'); setSpace(null) }
    else { setSpace(res); setTab('home') }
    setLoading(false)
  }
  function logout() { setSpace(null); setCode(''); setError('') }

  /* ════════════════ LOGIN ════════════════ */
  if (!space?.found) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-[#14161c] to-[#1f2230] flex items-center justify-center p-4 relative overflow-hidden">
        {/* floating blobs */}
        <motion.div className="absolute w-72 h-72 rounded-full bg-yellow-400/10 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 12, repeat: Infinity }} style={{ top: '10%', right: '10%' }} />
        <motion.div className="absolute w-72 h-72 rounded-full bg-blue-500/10 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 14, repeat: Infinity }} style={{ bottom: '5%', left: '5%' }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm relative z-10">
          <div className="flex flex-col items-center mb-6">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
              className="w-16 h-16 rounded-2xl bg-yellow-400 text-black flex items-center justify-center font-black text-3xl mb-3 shadow-lg shadow-yellow-400/30">I</motion.div>
            <h1 className="text-white font-black text-[22px]">فضاء الطالب</h1>
            <p className="text-zinc-400 text-[13px] mt-1">منصة Inglizi.com لتعلّم الإنجليزية</p>
          </div>

          <form onSubmit={enter} className="bg-white rounded-3xl p-6 shadow-2xl">
            <label className="flex items-center gap-1.5 text-[13px] font-bold text-zinc-700 mb-2">
              <KeyRound size={15} className="text-zinc-400" /> رمز الدخول
            </label>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="ING-XXXXXXXX" dir="ltr"
              className="w-full px-4 py-3.5 text-[17px] font-bold tracking-widest text-center uppercase bg-zinc-50 border-2 border-zinc-200 rounded-2xl focus:outline-none focus:border-yellow-400 transition-colors" />
            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] text-red-600 mt-2 font-medium">{error}</motion.p>}
            <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading || !code.trim()}
              className="mt-4 w-full py-3.5 rounded-2xl bg-black text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50">
              {loading ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />} دخول
            </motion.button>
            <p className="text-[11px] text-zinc-400 text-center mt-3 leading-relaxed">
              ستجد رمز الدخول على وصل الدفع الخاص بك أو من إدارة Inglizi.com.
            </p>
          </form>
        </motion.div>
      </div>
    )
  }

  /* ════════════════ APP ════════════════ */
  const s = space.student!
  const assignments = space.assignments ?? []
  const files       = space.files ?? []
  const stats       = space.stats ?? { done: 0, total: 0 }

  const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1']
  const curLevel  = (s.current_level || s.course || 'A0').toUpperCase().replace(/[^A-C0-9]/g, '').slice(0, 2) || 'A0'
  const curIdx    = Math.max(0, LEVELS.findIndex(l => curLevel.startsWith(l)))
  const nextLevel = s.next_level || LEVELS[Math.min(curIdx + 1, LEVELS.length - 1)]
  const progress  = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
  const daysActive = Math.max(1, Math.round((Date.now() - new Date(s.subscription_start || s.enrollment_date).getTime()) / 86400000))
  const pendingTasks = assignments.filter(a => !a.is_done).length

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'tasks', label: 'التمارين', icon: ListChecks },
    { id: 'files', label: 'الملفات', icon: FileText },
    { id: 'progress', label: 'تقدّمي', icon: TrendingUp },
  ]

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f4f6] pb-24">
      {/* App bar */}
      <header className="bg-[#14161c] text-white sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <motion.img initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            src={avatarUrl(s.full_name)} alt="" className="w-11 h-11 rounded-full bg-white/10 ring-2 ring-yellow-400/40" />
          <div className="flex-1 min-w-0">
            <div className="font-black text-[15px] truncate">{s.full_name}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <span className="bg-yellow-400 text-black font-bold px-1.5 rounded">{curLevel}</span>
              <span>{s.student_type === 'private_student' ? 'دروس خاصة' : 'دورة جماعية'}</span>
            </div>
          </div>
          <button onClick={logout} className="text-zinc-400 hover:text-white p-2"><LogOut size={18} /></button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

            {/* ─── HOME ─── */}
            {tab === 'home' && (
              <div className="space-y-4">
                {/* Hero */}
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl p-5 text-white relative overflow-hidden">
                  <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-yellow-400/10 blur-2xl" />
                  <div className="flex items-center gap-4 relative">
                    <img src={avatarUrl(s.full_name)} alt="" className="w-20 h-20 rounded-2xl bg-white/10 ring-2 ring-yellow-400/40" />
                    <div className="flex-1">
                      <div className="text-[11px] text-zinc-400">مرحبًا 👋</div>
                      <div className="font-black text-[18px]">{s.full_name}</div>
                      <div className="text-[12px] text-zinc-400 mt-0.5">الأستاذ {s.teacher_name ?? 'حمزة'}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4 relative">
                    <Stat icon={Trophy} value={curLevel} label="مستواك" />
                    <Stat icon={Flame} value={`${daysActive}`} label="يوم" />
                    <Stat icon={Star} value={`${progress}%`} label="إنجاز" />
                  </div>
                </div>

                {/* Quick cards */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setTab('tasks')}
                    className="bg-white rounded-2xl p-4 text-right border border-zinc-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-2"><ListChecks size={20} className="text-blue-500" /></div>
                    <div className="font-bold text-[14px] text-zinc-800">التمارين</div>
                    <div className="text-[12px] text-zinc-400">{pendingTasks > 0 ? `${pendingTasks} مطلوب` : 'لا تمارين معلّقة 🎉'}</div>
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setTab('files')}
                    className="bg-white rounded-2xl p-4 text-right border border-zinc-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center mb-2"><FileText size={20} className="text-rose-500" /></div>
                    <div className="font-bold text-[14px] text-zinc-800">الملفات</div>
                    <div className="text-[12px] text-zinc-400">{files.length} ملف</div>
                  </motion.button>
                </div>

                {/* Progress preview */}
                <ProgressCard {...{ LEVELS, curIdx, curLevel, nextLevel, progress, stats }} />
              </div>
            )}

            {/* ─── TASKS ─── */}
            {tab === 'tasks' && (
              <div className="space-y-3">
                <SectionTitle icon={ListChecks} color="text-blue-500">التمارين المطلوبة</SectionTitle>
                {assignments.length === 0 && <Empty emoji="🎯" text="لا توجد تمارين مطلوبة حاليًا" />}
                {assignments.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      {a.is_done ? <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" /> : <Circle size={20} className="text-zinc-300 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[14px] text-zinc-800">{a.title}</div>
                        {a.description && <div className="text-[12px] text-zinc-500 mt-1 leading-relaxed">{a.description}</div>}
                        {a.link_url && (
                          <motion.a whileTap={{ scale: 0.96 }} href={a.link_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg mt-2">
                            ابدأ التمرين <ExternalLink size={12} />
                          </motion.a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ─── FILES ─── */}
            {tab === 'files' && (
              <div className="space-y-3">
                <SectionTitle icon={FileText} color="text-rose-500">الملفات والمستندات</SectionTitle>
                {files.length === 0 && <Empty emoji="📁" text="لا توجد ملفات بعد" />}
                {files.map((f, i) => (
                  <motion.a key={f.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.98 }} href={fileUrl(f.file_path)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm hover:border-zinc-300">
                    <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0"><FileText size={18} className="text-rose-500" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[13px] text-zinc-800 truncate">{f.file_name}</div>
                      <div className="text-[11px] text-zinc-400">{fmtSize(f.size_bytes)} · {fmtDate(f.created_at)}</div>
                    </div>
                    <Download size={18} className="text-zinc-400 flex-shrink-0" />
                  </motion.a>
                ))}
              </div>
            )}

            {/* ─── PROGRESS ─── */}
            {tab === 'progress' && (
              <div className="space-y-4">
                <ProgressCard {...{ LEVELS, curIdx, curLevel, nextLevel, progress, stats }} />
                <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
                  <SectionTitle icon={BookOpen} color="text-yellow-500">دورتي</SectionTitle>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <Info label="الأستاذ" value={s.teacher_name ?? 'الأستاذ حمزة'} />
                    <Info label="نوع الدراسة" value={s.student_type === 'private_student' ? 'دروس خاصة' : 'دورة جماعية'} />
                    <Info label="تاريخ البدء" value={fmtDate(s.subscription_start ?? s.enrollment_date)} />
                    <Info label={s.billing_type === 'monthly' ? 'الاشتراك' : 'تاريخ الانتهاء'} value={s.billing_type === 'monthly' ? 'شهري' : fmtDate(s.course_end_date)} />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-zinc-200">
        <div className="max-w-2xl mx-auto flex">
          {TABS.map(t => {
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className="relative flex-1 flex flex-col items-center gap-0.5 py-2.5">
                {active && <motion.span layoutId="tabIndicator" className="absolute top-0 inset-x-5 h-0.5 bg-yellow-400 rounded-full" />}
                <t.icon size={21} className={active ? 'text-zinc-900' : 'text-zinc-400'} strokeWidth={active ? 2.4 : 2} />
                <span className={`text-[10px] font-bold ${active ? 'text-zinc-900' : 'text-zinc-400'}`}>{t.label}</span>
                {t.id === 'tasks' && pendingTasks > 0 && (
                  <span className="absolute top-1.5 left-[28%] bg-rose-500 text-white text-[9px] font-bold min-w-[15px] h-[15px] px-0.5 rounded-full flex items-center justify-center">{pendingTasks}</span>
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
function Stat({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <div className="bg-white/10 rounded-xl p-2.5 text-center">
      <Icon size={16} className="text-yellow-400 mx-auto mb-1" />
      <div className="font-black text-[15px]">{value}</div>
      <div className="text-[10px] text-zinc-400">{label}</div>
    </div>
  )
}

function ProgressCard({ LEVELS, curIdx, curLevel, nextLevel, progress, stats }: any) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
      <SectionTitle icon={TrendingUp} color="text-emerald-500">مستواي وتقدّمي</SectionTitle>
      {/* ladder */}
      <div className="flex items-center gap-1 my-4 overflow-x-auto">
        {LEVELS.map((lv: string, i: number) => (
          <div key={lv} className="flex items-center gap-1 flex-shrink-0">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.06 }}
              className={[
                'w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-black',
                i < curIdx ? 'bg-emerald-100 text-emerald-700'
                : i === curIdx ? 'bg-yellow-400 text-black ring-2 ring-yellow-200'
                : 'bg-zinc-100 text-zinc-400',
              ].join(' ')}>{lv}</motion.div>
            {i < LEVELS.length - 1 && <div className={`w-4 h-0.5 ${i < curIdx ? 'bg-emerald-300' : 'bg-zinc-200'}`} />}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-[12px] mb-1">
        <span className="text-zinc-500">إكمال التمارين</span>
        <span className="font-bold text-zinc-800">{stats.done}/{stats.total} · {progress}%</span>
      </div>
      <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className="h-full bg-emerald-500 rounded-full" />
      </div>
      <div className="flex items-center justify-between mt-3 text-[12px]">
        <span className="text-zinc-400">المستوى الحالي: <b className="text-zinc-700">{curLevel}</b></span>
        <span className="text-zinc-400">القادم: <b className="text-yellow-600">{nextLevel}</b></span>
      </div>
    </div>
  )
}

function SectionTitle({ icon: Icon, color, children }: { icon: any; color: string; children: React.ReactNode }) {
  return <h2 className="flex items-center gap-2 font-bold text-[15px] text-zinc-900"><Icon size={16} className={color} /> {children}</h2>
}
function Info({ label, value }: { label: string; value: string }) {
  return <div className="bg-zinc-50 rounded-xl p-3"><div className="text-[11px] text-zinc-400 mb-0.5">{label}</div><div className="text-[14px] font-bold text-zinc-800">{value}</div></div>
}
function Empty({ emoji, text }: { emoji: string; text: string }) {
  return <div className="flex flex-col items-center py-14 text-zinc-400"><div className="text-4xl mb-2">{emoji}</div><div className="text-[14px]">{text}</div></div>
}
