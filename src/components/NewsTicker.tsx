'use client'

/* ─── Data ─────────────────────────────────────────────── */
const TIPS = [
  { type: 'correction', wrong: 'I did a mistake',              right: 'I made a mistake',            emoji: '❌✅' },
  { type: 'tip',        text: 'Tip: Practice 10 minutes daily — consistency beats intensity',         emoji: '💡' },
  { type: 'correction', wrong: 'I am agree',                   right: 'I agree',                      emoji: '❌✅' },
  { type: 'tip',        text: 'Tip: Think in English — don\'t translate in your head',                emoji: '🧠' },
  { type: 'correction', wrong: 'It depends of the situation',  right: 'It depends on the situation',  emoji: '❌✅' },
  { type: 'tip',        text: 'Tip: Learn whole phrases, not just single words',                       emoji: '📚' },
  { type: 'correction', wrong: 'I want to make a photo',       right: 'I want to take a photo',       emoji: '❌✅' },
  { type: 'tip',        text: 'Tip: Read English out loud every day — your mouth needs practice',     emoji: '🗣️' },
  { type: 'correction', wrong: 'She is very funny since I know her', right: 'She has been funny since I met her', emoji: '❌✅' },
  { type: 'tip',        text: 'Tip: Talk to yourself in English during daily tasks',                  emoji: '🪞' },
  { type: 'correction', wrong: 'I have 30 years old',          right: 'I am 30 years old',            emoji: '❌✅' },
  { type: 'tip',        text: 'Tip: Listen to English podcasts even while driving or cooking',        emoji: '🎧' },
  { type: 'correction', wrong: 'Can you explain me this?',     right: 'Can you explain this to me?',  emoji: '❌✅' },
  { type: 'tip',        text: 'Tip: Make mistakes on purpose — that\'s how you learn fastest',       emoji: '🚀' },
]

/* ─── Color map ─────────────────────────────────────────── */
const CORRECTION_COLORS = [
  'bg-red-500/10 border-red-400/30 text-red-900',
  'bg-rose-500/10 border-rose-400/30 text-rose-900',
]
const TIP_COLORS = [
  'bg-emerald-500/10 border-emerald-400/30 text-emerald-900',
  'bg-blue-500/10 border-blue-400/30 text-blue-900',
  'bg-violet-500/10 border-violet-400/30 text-violet-900',
  'bg-amber-500/10 border-amber-400/30 text-amber-900',
]

/* ─── Component ─────────────────────────────────────────── */
export default function NewsTicker() {
  // Double the list so the seamless loop works (we scroll exactly 50%)
  const items = [...TIPS, ...TIPS]

  return (
    <div className="relative bg-gradient-to-r from-indigo-950 via-violet-950 to-indigo-950 border-y border-white/10 overflow-hidden py-0">
      {/* Left + right fade masks */}
      <div className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none"
           style={{ background: 'linear-gradient(to left, #1e1b4b, transparent)' }} />
      <div className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none"
           style={{ background: 'linear-gradient(to right, #1e1b4b, transparent)' }} />

      {/* Label pill */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center gap-2">
        <span className="flex items-center gap-2 bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          نصائح لغوية
        </span>
      </div>

      {/* Ticker track — direction: ltr so scroll direction is left */}
      <div className="overflow-hidden" dir="ltr">
        <div className="ticker-track py-3.5 sm:pr-40">
          {items.map((item, idx) => (
            <TickerItem key={idx} item={item} index={idx} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Single ticker item ─────────────────────────────────── */
function TickerItem({
  item,
  index,
}: {
  item: (typeof TIPS)[number]
  index: number
}) {
  if (item.type === 'correction') {
    return (
      <span className="inline-flex items-center gap-2 mx-4 whitespace-nowrap">
        {/* Wrong */}
        <span className="inline-flex items-center gap-1.5 bg-red-500/15 border border-red-400/25 text-red-200 text-sm font-semibold px-3 py-1.5 rounded-full">
          <span className="text-red-400 text-xs font-black">✗</span>
          {(item as { wrong: string }).wrong}
        </span>
        {/* Arrow */}
        <span className="text-white/40 font-bold">→</span>
        {/* Right */}
        <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-400/25 text-emerald-200 text-sm font-semibold px-3 py-1.5 rounded-full">
          <span className="text-emerald-400 text-xs font-black">✓</span>
          {(item as { right: string }).right}
        </span>
        {/* Separator dot */}
        <span className="w-1.5 h-1.5 bg-white/20 rounded-full mx-3" />
      </span>
    )
  }

  // Tip
  const tipColors = ['text-blue-300', 'text-amber-300', 'text-violet-300', 'text-teal-300']
  const color = tipColors[index % tipColors.length]

  return (
    <span className="inline-flex items-center gap-2 mx-4 whitespace-nowrap">
      <span className="text-base">{item.emoji}</span>
      <span className={`text-sm font-semibold ${color}`}>
        {(item as { text: string }).text}
      </span>
      <span className="w-1.5 h-1.5 bg-white/20 rounded-full mx-3" />
    </span>
  )
}
