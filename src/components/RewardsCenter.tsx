'use client'

import { useEffect, useState } from 'react'
import { Trophy, Gift, Lock, CheckCircle2, Clock, Loader2, Crown } from 'lucide-react'
import { fetchCoins, fetchRewardsStatus, claimReward, fetchLeaderboard, type CoinSummary, type RewardStatus, type LeaderboardData } from '@/lib/gamification'
import PersonAvatar from '@/components/PersonAvatar'

const ACTION_AR: Record<string, string> = {
  open_lesson: '📖 فتح درس', complete_lesson: '✅ إكمال درس', complete_quiz: '🎯 اجتياز اختبار',
  complete_reading: '📚 إكمال قراءة', complete_unit: '🏅 إكمال وحدة كاملة',
  challenge_sentence: '🧩 تمرين بناء جمل', challenge_translation: '🔤 تمرين ترجمة',
  streak_7: '🔥 سلسلة 7 أيام', streak_30: '🔥 سلسلة 30 يومًا', final_exam: '🎓 الامتحان النهائي',
  admin_add: '➕ إضافة من الإدارة', admin_remove: '➖ خصم من الإدارة',
}
const LEVEL_STYLE: Record<string, string> = {
  Bronze: 'from-amber-700 to-amber-900', Silver: 'from-zinc-400 to-zinc-600',
  Gold: 'from-yellow-400 to-amber-500', Platinum: 'from-sky-300 to-sky-500', Master: 'from-violet-500 to-fuchsia-600',
}
const LEVEL_EMOJI: Record<string, string> = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎', Master: '👑' }
const RANK_RING: Record<number, string> = { 1: 'ring-yellow-400', 2: 'ring-zinc-300', 3: 'ring-amber-600' }

function SectionLabel({ emoji, title, sub }: { emoji: string; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 px-1 pt-1">
      <span className="text-[19px] leading-none">{emoji}</span>
      <div><div className="font-black text-[15px] text-[#3a2817] leading-tight">{title}</div>{sub && <div className="text-[11px] text-zinc-400">{sub}</div>}</div>
    </div>
  )
}

export default function RewardsCenter({ token, onPractice }: { token: string; onPractice: (kind: 'sentence' | 'translation') => void }) {
  const [coins, setCoins] = useState<CoinSummary | null>(null)
  const [rewards, setRewards] = useState<RewardStatus[]>([])
  const [board, setBoard] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sub, setSub] = useState<'rewards' | 'board'>('rewards')
  const [claiming, setClaiming] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  async function load() {
    setLoading(true)
    const [c, r, b] = await Promise.all([fetchCoins(token), fetchRewardsStatus(token), fetchLeaderboard(token)])
    setCoins(c); setRewards(r); setBoard(b); setLoading(false)
  }
  useEffect(() => { load() }, [token])

  async function onClaim(id: string) {
    setClaiming(id); setMsg('')
    const res = await claimReward(token, id)
    setClaiming(null)
    if (res.ok) { setMsg('✅ تم إرسال طلبك للإدارة. ستتم الموافقة قريبًا.'); load() }
    else setMsg(res.reason === 'locked' ? 'لم تجمع كوينات كافية بعد.' : res.reason === 'already' ? 'لديك طلب سابق على هذه المكافأة.' : 'تعذّر الإرسال، حاول لاحقًا.')
  }

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-zinc-300" size={26} /></div>

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* balance + level */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-[#2a1d12] via-[#3a2817] to-[#5a3d1f] text-white shadow-[0_6px_20px_rgba(42,29,18,0.25)]">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-yellow-400 text-black flex items-center justify-center text-[26px]">🪙</div>
          <div className="flex-1">
            <div className="text-[12px] text-amber-100/60">💰 رصيدك من الكوينات</div>
            <div className="font-black text-[28px] leading-none">{coins?.balance ?? 0} <span className="text-[13px] font-bold text-yellow-400">كوين</span></div>
          </div>
          <div className="text-center flex-shrink-0">
            <div className="text-[26px] leading-none">{LEVEL_EMOJI[coins?.level ?? 'Bronze']}</div>
            <span className={`mt-1 inline-block text-[11px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r text-white ${LEVEL_STYLE[coins?.level ?? 'Bronze'] ?? LEVEL_STYLE.Bronze}`}>{coins?.level}</span>
          </div>
        </div>
        {coins?.next_level ? (
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] text-amber-100/70 mb-1"><span>⬆️ التالي: {LEVEL_EMOJI[coins.next_level]} {coins.next_level}</span><span className="font-bold text-yellow-300">باقٍ {coins.to_next} كوين</span></div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-l from-yellow-400 to-amber-300 rounded-full transition-all" style={{ width: `${coins.progress}%` }} /></div>
          </div>
        ) : <div className="mt-3 text-[12px] text-yellow-400 font-bold flex items-center gap-1.5"><Crown size={15} /> 👑 أعلى مستوى — Master!</div>}
      </div>

      {/* quick practice */}
      <SectionLabel emoji="🎯" title="تدرّب واكسب الكوينات" sub="كل جملة صحيحة = +30 كوين" />
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onPractice('sentence')} className="group rounded-2xl p-4 text-right bg-gradient-to-br from-yellow-300 to-amber-400 shadow-[0_4px_14px_rgba(245,158,11,0.25)] hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between mb-2"><div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center text-[26px]">🧩</div><span className="text-[10px] font-black text-amber-900 bg-white/50 px-2 py-0.5 rounded-full">+30 🪙</span></div>
          <div className="font-black text-[15px] text-[#2a1d12]">بناء الجمل</div>
          <div className="text-[11px] text-amber-900/70 font-medium">رتّب الكلمات أو ترجم الجملة</div>
        </button>
        <button onClick={() => onPractice('translation')} className="group rounded-2xl p-4 text-right bg-gradient-to-br from-[#3a2817] to-[#5a3d1f] text-white shadow-[0_4px_14px_rgba(42,29,18,0.3)] hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between mb-2"><div className="w-12 h-12 rounded-2xl bg-yellow-400/20 flex items-center justify-center text-[26px]">🔤</div><span className="text-[10px] font-black text-[#2a1d12] bg-yellow-400 px-2 py-0.5 rounded-full">+30 🪙</span></div>
          <div className="font-black text-[15px] text-white">ترجم الجمل</div>
          <div className="text-[11px] text-amber-100/70 font-medium">عربي ← إنجليزي</div>
        </button>
      </div>

      {/* sub tabs */}
      <div className="flex gap-1.5 bg-amber-100/70 p-1 rounded-2xl">
        <button onClick={() => setSub('rewards')} className={`flex-1 py-2.5 rounded-xl text-[13.5px] font-black transition-colors ${sub === 'rewards' ? 'bg-[#3a2817] text-yellow-400 shadow' : 'text-[#3a2817] hover:bg-white/50'}`}>🎁 المكافآت</button>
        <button onClick={() => setSub('board')} className={`flex-1 py-2.5 rounded-xl text-[13.5px] font-black transition-colors ${sub === 'board' ? 'bg-[#3a2817] text-yellow-400 shadow' : 'text-[#3a2817] hover:bg-white/50'}`}>🏆 المتصدرون</button>
      </div>

      {msg && <div className="text-[12.5px] text-center text-zinc-700 bg-emerald-50 border border-emerald-200 rounded-xl py-2.5 font-bold">{msg}</div>}

      {sub === 'rewards' ? (
        <div className="space-y-3">
          <SectionLabel emoji="🎁" title="مكافآتك" sub="اجمع الكوينات لتفتحها وتطلبها" />
          {rewards.map(r => {
            const claimable = r.unlocked && (!r.claim_status || r.claim_status === 'rejected')
            const need = Math.max(0, r.min_coins - (coins?.balance ?? 0))
            return (
              <div key={r.id} className={`rounded-2xl overflow-hidden bg-white shadow-[0_3px_14px_rgba(58,40,23,0.07)] border-2 ${r.unlocked ? 'border-yellow-400' : 'border-zinc-100'}`}>
                <div className="flex items-center gap-3 p-4">
                  <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${r.unlocked ? `text-white bg-gradient-to-br ${LEVEL_STYLE[r.level] ?? LEVEL_STYLE.Bronze}` : 'bg-zinc-100 text-zinc-300'}`}>{r.unlocked ? <Gift size={22} /> : <Lock size={20} />}<span className="absolute -bottom-1.5 -right-1.5 text-[16px]">{LEVEL_EMOJI[r.level]}</span></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap"><span className="font-black text-[15px] text-[#3a2817]">{r.title}</span><span className="text-[10px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">{LEVEL_EMOJI[r.level]} {r.level}</span></div>
                    {r.desc && <div className="text-[12px] text-zinc-500 mt-0.5">{r.desc}</div>}
                  </div>
                  {r.unlocked && !r.claim_status && <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full flex-shrink-0">جاهزة ✓</span>}
                </div>
                {!r.unlocked && (
                  <div className="px-4 pb-3">
                    <div className="flex items-center justify-between text-[11px] mb-1.5"><span className="text-zinc-500 font-bold">{coins?.balance ?? 0} / {r.min_coins} كوين</span><span className="text-amber-600 font-black">باقٍ {need}</span></div>
                    <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-l from-yellow-400 to-amber-400 rounded-full" style={{ width: `${r.progress}%` }} /></div>
                  </div>
                )}
                <div className="px-4 pb-4">
                  {r.claim_status === 'pending' ? <div className="w-full py-2 rounded-xl bg-amber-50 text-amber-700 font-bold text-[12px] flex items-center justify-center gap-1.5"><Clock size={14} /> بانتظار موافقة الإدارة</div>
                    : r.claim_status === 'approved' ? <div className="w-full py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-[12px] flex items-center justify-center gap-1.5"><CheckCircle2 size={14} /> تمت الموافقة — تواصل مع الإدارة</div>
                    : r.claim_status === 'used' ? <div className="w-full py-2 rounded-xl bg-zinc-100 text-zinc-400 font-bold text-[12px] flex items-center justify-center gap-1.5"><CheckCircle2 size={14} /> تم الاستخدام</div>
                    : claimable ? <button onClick={() => onClaim(r.id)} disabled={claiming === r.id} className="w-full py-2.5 rounded-xl bg-yellow-400 text-black font-black text-[13px] hover:bg-yellow-300 disabled:opacity-50">{claiming === r.id ? <Loader2 size={14} className="animate-spin mx-auto" /> : '🎁 اطلب المكافأة'}</button>
                    : <div className="w-full py-2 rounded-xl bg-zinc-50 text-zinc-400 font-bold text-[12px] text-center flex items-center justify-center gap-1.5"><Lock size={13} /> اجمع {need} كوين لفتحها</div>}
                </div>
              </div>
            )
          })}

          {/* coin history */}
          {coins && coins.recent.length > 0 && (
            <>
            <SectionLabel emoji="📜" title="سجل الكوينات" sub="آخر ما كسبته" />
            <div className="rounded-2xl border border-zinc-100 p-4 bg-white shadow-[0_2px_12px_rgba(58,40,23,0.06)]">
              <div className="space-y-2">
                {coins.recent.slice(0, 12).map((t, i) => (
                  <div key={i} className="flex items-center justify-between text-[12.5px] border-b border-zinc-50 last:border-0 pb-1.5 last:pb-0">
                    <span className="text-zinc-700 font-medium">{ACTION_AR[t.action] ?? t.action}{t.notes && t.source === 'admin' ? ` — ${t.notes}` : ''}</span>
                    <span className={`font-black inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full ${t.amount >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>{t.amount >= 0 ? '+' : ''}{t.amount} 🪙</span>
                  </div>
                ))}
              </div>
            </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
        <SectionLabel emoji="🏆" title="لوحة المتصدرين" sub="الترتيب يبدأ من جديد كل إثنين" />
        <div className="rounded-2xl overflow-hidden bg-white shadow-[0_3px_14px_rgba(67,56,202,0.08)] border border-zinc-100">
          <div className="px-4 py-3 text-white flex items-center gap-2" style={{ background: 'linear-gradient(120deg,#4338ca,#7c3aed)' }}>
            <Trophy size={16} className="text-yellow-300" />
            <span className="font-black text-[14px]">🏅 أبطال هذا الأسبوع</span>
            <span className="mr-auto text-[10px] text-white/60">يبدأ كل إثنين</span>
          </div>
          {(!board || board.top.length === 0) ? <div className="text-center text-zinc-400 py-10 text-[13px]">لا نتائج هذا الأسبوع بعد — كن أول المتصدرين! 🏆</div> : (
            <div className="p-3 space-y-1.5">
              {board.top.map(r => (
                <div key={r.rank} className={`flex items-center gap-3 px-2.5 py-2 rounded-xl ${r.me ? 'bg-violet-50 ring-2 ring-violet-300' : r.rank <= 3 ? 'bg-violet-50/50' : ''}`}>
                  <div className="relative flex-shrink-0">
                    <PersonAvatar name={r.name} size={44} className={`ring-2 ${RANK_RING[r.rank] ?? 'ring-zinc-200'}`} />
                    <span className={`absolute -bottom-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center ring-2 ring-white ${r.rank === 1 ? 'bg-yellow-400 text-black' : r.rank === 2 ? 'bg-zinc-300 text-zinc-700' : r.rank === 3 ? 'bg-amber-700 text-white' : 'bg-violet-600 text-white'}`}>{r.rank}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-[13.5px] text-zinc-800 truncate">{r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] + ' ' : ''}{r.name}{r.me && <span className="text-[10px] text-violet-600 font-bold mr-1">· أنت</span>}</div>
                    <div className="text-[10.5px] text-zinc-400">{r.challenges} تمرين{r.streak > 0 ? ` · 🔥 ${r.streak} يوم` : ''}</div>
                  </div>
                  <span className="font-black text-[13px] inline-flex items-center gap-1 bg-violet-600 text-white px-2.5 py-1 rounded-full flex-shrink-0">{r.points} 🪙</span>
                </div>
              ))}
              {board.me && !board.top.some(t => t.me) && (
                <div className="flex items-center gap-3 px-2.5 py-2 rounded-xl bg-violet-50 ring-2 ring-violet-300 mt-1">
                  <div className="relative flex-shrink-0">
                    <PersonAvatar name="أنت" size={44} className="ring-2 ring-violet-300" />
                    <span className="absolute -bottom-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center ring-2 ring-white bg-violet-600 text-white">{board.me.rank}</span>
                  </div>
                  <div className="flex-1 font-black text-[13.5px] text-zinc-800">أنت</div>
                  <span className="font-black text-[13px] inline-flex items-center gap-1 bg-violet-600 text-white px-2.5 py-1 rounded-full">{board.me.points} 🪙</span>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  )
}
