'use client'

import { useEffect, useState } from 'react'
import { Trophy, Gift, Coins, ListChecks, Inbox, Loader2, Check, X, Plus, Trash2, Pencil, MessageCircle } from 'lucide-react'
import { useStaff } from '@/lib/staff-context'
import {
  fetchClaims, reviewClaim, fetchRewardsCRM, saveReward, fetchChallengesCRM, createChallenge, deleteChallenge, fetchLeaderboardCRM,
  type RewardClaimRow, type Reward, type Challenge,
} from '@/lib/gamification'

const INP = 'w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400'
const COIN_RULES: [string, string][] = [
  ['فتح درس', '+10'], ['إكمال درس', '+25'], ['إكمال قراءة', '+15'], ['اجتياز اختبار/امتحان', '+50'],
  ['تمرين بناء جمل', '+30'], ['تمرين ترجمة', '+30'], ['إكمال وحدة كاملة', '+100'],
  ['سلسلة 7 أيام', '+150'], ['سلسلة 30 يومًا', '+700'],
]

type Tab = 'claims' | 'rewards' | 'rules' | 'challenges' | 'board'

export default function GamificationPage() {
  const staff = useStaff()
  const [tab, setTab] = useState<Tab>('claims')

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4" dir="rtl">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center"><Trophy size={20} className="text-yellow-600" /></div>
        <div>
          <h2 className="text-[17px] font-black text-zinc-900">المكافآت والتحديات</h2>
          <p className="text-[12px] text-zinc-400">نظام الكوينات والمكافآت والتمارين</p>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {([['claims', 'الطلبات', Inbox], ['rewards', 'المكافآت', Gift], ['rules', 'قواعد الكوينات', Coins], ['challenges', 'التحديات', ListChecks], ['board', 'المتصدرون', Trophy]] as [Tab, string, any][]).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap ${tab === id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}><Icon size={13} /> {label}</button>
        ))}
      </div>

      {tab === 'claims' && <ClaimsTab by={staff.id} />}
      {tab === 'rewards' && <RewardsTab />}
      {tab === 'rules' && <RulesTab />}
      {tab === 'challenges' && <ChallengesTab />}
      {tab === 'board' && <BoardTab />}
    </div>
  )
}

function ClaimsTab({ by }: { by: string }) {
  const [items, setItems] = useState<RewardClaimRow[]>([])
  const [loading, setLoading] = useState(true)
  const [only, setOnly] = useState(true)
  async function load() { setLoading(true); setItems(await fetchClaims(only ? 'pending' : undefined)); setLoading(false) }
  useEffect(() => { load() }, [only])
  async function act(id: string, status: 'approved' | 'rejected' | 'used') { await reviewClaim(id, status, by); load() }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-1.5 text-[12px] text-zinc-500"><input type="checkbox" checked={only} onChange={e => setOnly(e.target.checked)} className="accent-yellow-400" /> الطلبات المعلّقة فقط</label>
      {loading ? <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-zinc-300" size={24} /></div>
        : items.length === 0 ? <div className="text-center py-12 text-zinc-400 text-[14px]">لا طلبات {only ? 'معلّقة' : ''}</div>
        : items.map(c => (
          <div key={c.id} className="bg-white border border-zinc-200 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[14px] text-zinc-900">{c.student_name} <span className="text-[11px] font-mono text-zinc-400">{c.student_token}</span></div>
                <div className="text-[12px] text-zinc-500">طلب: <b>{c.reward_title}</b> ({c.level_name}) · رصيد {c.coins_at_claim} كوين · {new Date(c.created_at).toLocaleDateString('ar-MA', { day: 'numeric', month: 'long' })}</div>
              </div>
              <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${c.status === 'pending' ? 'bg-amber-50 text-amber-700' : c.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : c.status === 'used' ? 'bg-zinc-100 text-zinc-500' : 'bg-rose-50 text-rose-600'}`}>{c.status === 'pending' ? 'معلّق' : c.status === 'approved' ? 'موافَق' : c.status === 'used' ? 'مُستخدَم' : 'مرفوض'}</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              {c.student_token && <a href={`https://wa.me/?text=${encodeURIComponent(`بخصوص مكافأة «${c.reward_title}»`)}`} target="_blank" rel="noreferrer" className="text-[12px] font-bold text-[#25D366] border border-[#25D366]/40 rounded-lg px-3 py-1.5 flex items-center gap-1"><MessageCircle size={13} /> واتساب</a>}
              {c.status === 'pending' && <>
                <button onClick={() => act(c.id, 'approved')} className="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-bold text-[12px] flex items-center justify-center gap-1"><Check size={14} /> موافقة</button>
                <button onClick={() => act(c.id, 'rejected')} className="py-2 px-3 rounded-lg bg-rose-50 text-rose-600 font-bold text-[12px] flex items-center gap-1"><X size={14} /> رفض</button>
              </>}
              {c.status === 'approved' && <button onClick={() => act(c.id, 'used')} className="flex-1 py-2 rounded-lg bg-zinc-900 text-white font-bold text-[12px]">تحديد كمُستخدَمة</button>}
            </div>
          </div>
        ))}
    </div>
  )
}

function RewardsTab() {
  const [items, setItems] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [edit, setEdit] = useState<Reward | null>(null)
  async function load() { setLoading(true); setItems(await fetchRewardsCRM()); setLoading(false) }
  useEffect(() => { load() }, [])
  async function save() { if (!edit) return; await saveReward(edit); setEdit(null); load() }

  if (loading) return <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-zinc-300" size={24} /></div>
  return (
    <div className="space-y-2">
      {items.map(r => (
        <div key={r.id} className="bg-white border border-zinc-200 rounded-xl p-3 flex items-center gap-2">
          <span className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center flex-shrink-0"><Gift size={16} className="text-yellow-600" /></span>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[13px] text-zinc-800">{r.level_name} · {r.min_coins} كوين</div>
            <div className="text-[11px] text-zinc-400 truncate">{r.reward_title || '— لا مكافأة'}{r.reward_desc ? ` · ${r.reward_desc}` : ''}</div>
          </div>
          <button onClick={() => setEdit(r)} className="text-zinc-300 hover:text-blue-600"><Pencil size={14} /></button>
        </div>
      ))}
      {edit && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input value={edit.level_name} onChange={e => setEdit({ ...edit, level_name: e.target.value })} placeholder="المستوى" className={INP} />
            <input type="number" value={edit.min_coins} onChange={e => setEdit({ ...edit, min_coins: Number(e.target.value) })} placeholder="الكوينات" className={INP} />
          </div>
          <input value={edit.reward_title ?? ''} onChange={e => setEdit({ ...edit, reward_title: e.target.value })} placeholder="عنوان المكافأة" className={INP} />
          <input value={edit.reward_desc ?? ''} onChange={e => setEdit({ ...edit, reward_desc: e.target.value })} placeholder="الوصف" className={INP} />
          <div className="flex gap-2"><button onClick={save} className="flex-1 py-2 bg-black text-white rounded-lg font-bold text-[12px]">حفظ</button><button onClick={() => setEdit(null)} className="px-4 py-2 border border-zinc-200 rounded-lg text-[12px] text-zinc-500">إلغاء</button></div>
        </div>
      )}
    </div>
  )
}

function RulesTab() {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-4">
      <p className="text-[12px] text-zinc-400 mb-3">الكوينات تُمنح تلقائيًا من الإجراءات الحقيقية (تُحسب في الخادم — لا يمكن تزويرها).</p>
      <div className="divide-y divide-zinc-50">
        {COIN_RULES.map(([label, amt], i) => (
          <div key={i} className="flex items-center justify-between py-2"><span className="text-[13px] text-zinc-700">{label}</span><span className="font-black text-[13px] text-emerald-600">{amt}</span></div>
        ))}
      </div>
    </div>
  )
}

function ChallengesTab() {
  const [type, setType] = useState<'sentence' | 'translation'>('sentence')
  const [items, setItems] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [level, setLevel] = useState('A0'); const [arabic, setArabic] = useState(''); const [english, setEnglish] = useState('')
  async function load() { setLoading(true); setItems(await fetchChallengesCRM(type)); setLoading(false) }
  useEffect(() => { load() }, [type])
  async function add() { if (!arabic.trim() || !english.trim()) return; await createChallenge(type, { level, arabic: arabic.trim(), english: english.trim() }); setArabic(''); setEnglish(''); load() }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(['sentence', 'translation'] as const).map(t => <button key={t} onClick={() => setType(t)} className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${type === t ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>{t === 'sentence' ? 'بناء الجمل' : 'الترجمة'}</button>)}
      </div>
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 space-y-2">
        <div className="flex gap-2">
          <select value={level} onChange={e => setLevel(e.target.value)} className={INP + ' w-24'}><option>A0</option><option>A1</option><option>A2</option></select>
          <input value={arabic} onChange={e => setArabic(e.target.value)} placeholder="الجملة بالعربية" className={INP} />
        </div>
        <input value={english} onChange={e => setEnglish(e.target.value)} dir="ltr" placeholder="Correct English sentence" className={INP + ' text-right'} />
        <button onClick={add} disabled={!arabic.trim() || !english.trim()} className="w-full py-2 bg-black text-white rounded-lg font-bold text-[12px] disabled:opacity-50 flex items-center justify-center gap-1"><Plus size={14} /> إضافة</button>
      </div>
      {loading ? <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-zinc-300" size={22} /></div>
        : items.map(c => (
          <div key={c.id} className="bg-white border border-zinc-200 rounded-xl p-3 flex items-center gap-2">
            <span className="text-[10px] font-bold bg-zinc-100 text-zinc-500 px-1.5 rounded">{c.level}</span>
            <div className="flex-1 min-w-0"><div className="text-[13px] text-zinc-800 truncate">{c.arabic}</div><div className="text-[11px] text-zinc-400 truncate" dir="ltr">{c.english}</div></div>
            <button onClick={() => deleteChallenge(type, c.id).then(load)} className="text-zinc-300 hover:text-red-500"><Trash2 size={14} /></button>
          </div>
        ))}
    </div>
  )
}

function BoardTab() {
  const [rows, setRows] = useState<{ student_id: string; week_points: number; challenges: number; name?: string }[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetchLeaderboardCRM().then(r => { setRows(r); setLoading(false) }) }, [])
  if (loading) return <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-zinc-300" size={24} /></div>
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-4">
      <div className="text-[11px] text-zinc-400 mb-3">ترتيب هذا الأسبوع (يبدأ كل إثنين)</div>
      {rows.length === 0 ? <div className="text-center py-8 text-zinc-400 text-[13px]">لا نتائج بعد هذا الأسبوع</div>
        : <div className="space-y-1.5">{rows.map((r, i) => (
          <div key={r.student_id} className="flex items-center gap-3 py-1.5">
            <span className="w-6 text-center font-black text-[14px] text-zinc-400">{i + 1}</span>
            <span className="flex-1 font-bold text-[13px] text-zinc-800 truncate">{r.name ?? '—'}</span>
            <span className="text-[11px] text-zinc-400">{r.challenges} تحدٍّ</span>
            <span className="font-black text-[13px] text-zinc-900 inline-flex items-center gap-1"><Coins size={12} className="text-yellow-500" /> {r.week_points}</span>
          </div>
        ))}</div>}
    </div>
  )
}
