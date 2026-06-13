/** Real gold-coin icon (shiny gradient disc with a star) — replaces the 🪙 emoji. */
export default function CoinIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`inline-block align-[-0.15em] ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id="coinFace" cx="36%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#fff7c2" />
          <stop offset="48%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="#a16207" />
      <circle cx="12" cy="12" r="9.4" fill="url(#coinFace)" />
      <circle cx="12" cy="12" r="9.4" fill="none" stroke="#fde68a" strokeWidth="1" opacity="0.7" />
      <path d="M12 6.6l1.7 3.45 3.8.55-2.75 2.68.65 3.79L12 15.95 8.6 17.05l.65-3.79L6.5 10.6l3.8-.55z" fill="#b45309" opacity="0.9" />
    </svg>
  )
}
