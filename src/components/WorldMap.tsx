'use client'

import { useState } from 'react'

/* ─────────────────────────────────────────────────
   Simplified world SVG map with highlighted Arab
   countries and pulsing student-location dots.
───────────────────────────────────────────────────── */

// [cx, cy, country, students]
const DOTS: [number, number, string, string][] = [
  [370, 198, 'المغرب 🇲🇦',         '+600 طالب'],
  [390, 195, 'الجزائر 🇩🇿',         '+350 طالب'],
  [420, 192, 'تونس 🇹🇳',            '+280 طالب'],
  [450, 200, 'ليبيا 🇱🇾',            '+120 طالب'],
  [480, 210, 'مصر 🇪🇬',             '+400 طالب'],
  [510, 220, 'السودان 🇸🇩',          '+90 طالب'],
  [525, 215, 'السعودية 🇸🇦',         '+250 طالب'],
  [532, 208, 'الأردن 🇯🇴',           '+180 طالب'],
  [528, 205, 'فلسطين 🇵🇸',           '+100 طالب'],
  [522, 200, 'لبنان 🇱🇧',            '+140 طالب'],
  [518, 198, 'سوريا 🇸🇾',            '+110 طالب'],
  [510, 195, 'العراق 🇮🇶',            '+130 طالب'],
  [540, 220, 'اليمن 🇾🇪',            '+80 طالب'],
  [550, 215, 'عُمان 🇴🇲',            '+95 طالب'],
  [545, 210, 'الإمارات 🇦🇪',          '+310 طالب'],
  [542, 208, 'قطر 🇶🇦',             '+150 طالب'],
  [540, 206, 'البحرين 🇧🇭',          '+70 طالب'],
  [536, 207, 'الكويت 🇰🇼',           '+190 طالب'],
  [700, 150, 'فرنسا 🇫🇷',            '+45 طالب'],
  [720, 145, 'ألمانيا 🇩🇪',           '+30 طالب'],
  [760, 140, 'هولندا 🇳🇱',            '+25 طالب'],
  [220, 200, 'كندا 🇨🇦',             '+20 طالب'],
  [200, 220, 'أمريكا 🇺🇸',            '+35 طالب'],
]

const COLORS = ['#3b82f6','#22c55e','#f97316','#a855f7','#ec4899','#06b6d4']

export default function WorldMap() {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; country: string; students: string } | null>(null)

  return (
    <section className="py-20 bg-gradient-to-br from-brand-950 to-brand-900 relative overflow-hidden">
      {/* BG glow */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-20 w-96 h-96 bg-brand-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block bg-white/10 text-blue-200 font-bold text-sm px-4 py-1.5 rounded-full mb-4">
            انتشارنا العالمي
          </span>
          <h2 className="text-4xl font-black text-white mb-3">
            أكثر من 2000 طالب من مختلف الدول
          </h2>
          <p className="text-blue-200/70 text-lg">
            مرّر على النقاط لمعرفة عدد الطلاب من كل دولة
          </p>
        </div>

        {/* Map container */}
        <div className="relative bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6 overflow-hidden">
          <svg
            viewBox="0 100 900 400"
            className="w-full h-auto"
            style={{ maxHeight: 420 }}
          >
            {/* ── Simplified world land shapes ── */}
            <g fill="#1e3a8a" opacity="0.5">
              {/* North America */}
              <path d="M60 130 L240 120 L260 180 L240 240 L180 260 L140 240 L100 210 L60 190 Z" />
              {/* South America */}
              <path d="M160 270 L220 265 L240 310 L220 370 L180 390 L150 360 L140 310 Z" />
              {/* Europe */}
              <path d="M660 110 L800 105 L820 150 L800 175 L760 185 L700 175 L660 155 Z" />
              {/* Africa */}
              <path d="M640 175 L760 170 L780 230 L760 310 L720 360 L680 350 L650 300 L630 240 Z" />
              {/* Asia - main */}
              <path d="M780 100 L980 95 L1000 160 L980 210 L900 225 L820 210 L780 170 Z" />
              {/* Middle East */}
              <path d="M780 195 L900 188 L920 230 L900 260 L840 265 L790 245 Z" />
              {/* Australia */}
              <path d="M840 280 L960 278 L975 330 L950 360 L880 355 L845 330 Z" />
            </g>

            {/* ── Ocean tint ── */}
            <rect x="0" y="100" width="1000" height="400" fill="#0f2157" opacity="0.2" rx="16" />

            {/* ── Grid lines ── */}
            <g stroke="rgba(255,255,255,0.05)" strokeWidth="0.5">
              {[130,160,190,220,250,280,310,340,370,400,430,460].map(y => (
                <line key={y} x1="0" y1={y} x2="1000" y2={y} />
              ))}
              {[100,160,220,280,340,400,460,520,580,640,700,760,820,880,940].map(x => (
                <line key={x} x1={x} y1="100" x2={x} y2="500" />
              ))}
            </g>

            {/* ── Student location dots ── */}
            {DOTS.map(([cx, cy, country, students], i) => {
              const color = COLORS[i % COLORS.length]
              return (
                <g
                  key={country}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    const rect = (e.currentTarget.closest('svg') as SVGElement).getBoundingClientRect()
                    const svgX = (cx / 900) * rect.width
                    const svgY = ((cy - 100) / 400) * rect.height
                    setTooltip({ x: svgX, y: svgY, country, students })
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {/* Outer pulse ring */}
                  <circle cx={cx} cy={cy} r="10" fill={color} opacity="0.15">
                    <animate attributeName="r" values="8;14;8" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.2;0;0.2" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                  {/* Dot */}
                  <circle cx={cx} cy={cy} r="5" fill={color} opacity="0.9" />
                  <circle cx={cx} cy={cy} r="2.5" fill="white" opacity="0.8" />
                </g>
              )
            })}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute z-20 bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl pointer-events-none whitespace-nowrap border border-white/10"
              style={{ left: tooltip.x, top: tooltip.y - 60, transform: 'translateX(-50%)' }}
            >
              <p>{tooltip.country}</p>
              <p className="text-green-400">{tooltip.students}</p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-4 border-transparent border-t-gray-900" />
            </div>
          )}
        </div>

        {/* Country pills */}
        <div className="flex flex-wrap gap-2 justify-center mt-8">
          {['🇲🇦 المغرب','🇸🇦 السعودية','🇦🇪 الإمارات','🇪🇬 مصر','🇰🇼 الكويت','🇩🇿 الجزائر','🇯🇴 الأردن','🇹🇳 تونس','🇶🇦 قطر','🇱🇧 لبنان','🇮🇶 العراق','🇾🇪 اليمن','🇸🇩 السودان'].map(c => (
            <span key={c} className="bg-white/10 border border-white/20 text-blue-100 text-xs font-semibold px-3 py-1.5 rounded-full">
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
