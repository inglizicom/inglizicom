'use client'

/* ─────────────────────────────────────────────────
   Infinite marquee-style partners strip.
   Two identical rows run in opposite directions for depth.
───────────────────────────────────────────────────── */

const PARTNERS = [
  { name: 'Oxford Spires',                      abbr: 'OS',  color: '#1e3a8a', bg: '#dbeafe', emoji: '🎓' },
  { name: 'Oxford Academy',                     abbr: 'OA',  color: '#1e40af', bg: '#eff6ff', emoji: '📚' },
  { name: 'Les Génies',                         abbr: 'LG',  color: '#7c3aed', bg: '#f5f3ff', emoji: '🌟' },
  { name: 'Fondation des Classes Préparatoires', abbr: 'FCP', color: '#0369a1', bg: '#e0f2fe', emoji: '🏛️' },
]

// Duplicate for seamless loop
const TRACK = [...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS]

interface PartnerCardProps {
  partner: typeof PARTNERS[number]
}

function PartnerCard({ partner }: PartnerCardProps) {
  return (
    <div className="flex-shrink-0 mx-4 flex items-center gap-3 bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default select-none"
      style={{ minWidth: 220 }}
    >
      {/* Logo placeholder circle */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl font-black"
        style={{ background: partner.bg, color: partner.color }}
      >
        {partner.emoji}
      </div>
      <div>
        <p className="font-black text-gray-900 text-sm leading-tight">{partner.name}</p>
        <p className="text-xs font-bold mt-0.5" style={{ color: partner.color }}>شريك معتمد</p>
      </div>
    </div>
  )
}

export default function PartnersScroll() {
  return (
    <section className="py-14 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 text-center">
        <span className="inline-block bg-blue-100 text-blue-700 font-bold text-sm px-4 py-1.5 rounded-full mb-3">
          شركاؤنا
        </span>
        <h2 className="text-3xl font-black text-gray-900">
          نتعاون مع أفضل المؤسسات التعليمية
        </h2>
      </div>

      {/* Track 1 — scrolls right→left */}
      <div className="relative">
        <div
          className="flex"
          style={{
            animation: 'marquee-rtl 28s linear infinite',
            width: 'max-content',
          }}
        >
          {TRACK.map((p, i) => (
            <PartnerCard key={i} partner={p} />
          ))}
        </div>
      </div>

      {/* Track 2 — scrolls left→right (reversed), with slight opacity */}
      <div className="relative mt-4 opacity-60">
        <div
          className="flex"
          style={{
            animation: 'marquee-ltr 34s linear infinite',
            width: 'max-content',
          }}
        >
          {[...TRACK].reverse().map((p, i) => (
            <PartnerCard key={i} partner={p} />
          ))}
        </div>
      </div>

      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

      <style>{`
        @keyframes marquee-rtl {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-ltr {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </section>
  )
}
