const twColors = require('tailwindcss/colors')
const plugin = require('tailwindcss/plugin')

/*
 * Themable neutrals. The CRM (/sales, /admin) was written against zinc / gray /
 * stone / neutral, black and yellow — forty-odd screens of them. Instead of
 * rewriting every class, those palettes read from CSS variables: on :root they
 * hold Tailwind's own values, so the public site and the other spaces render
 * exactly as before; inside `.crm-theme` they are restated as the brand — slate
 * greys, navy where the CRM used black, amber gold where it used lemon yellow.
 * Hover, opacity (`/80`), ring, divide and gradient variants all follow.
 * `.crm-raw` puts the original values back for a subtree (the lesson presenter).
 */
const THEMED = ['zinc', 'gray', 'stone', 'neutral', 'yellow']
const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']
const rgb = hex => {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}
const varColor = name => `rgb(var(--c-${name}) / <alpha-value>)`
const themedScale = p => Object.fromEntries(SHADES.map(s => [s, varColor(`${p}-${s}`)]))

/** The CRM's neutral scale: slate greys that turn navy at the dark end. */
const CRM_NEUTRAL = {
  50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8',
  500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E40AF', 900: '#1E3A8A', 950: '#172554',
}
/** Lemon yellow → the site's amber gold. */
const CRM_YELLOW = {
  50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A', 300: '#FCD34D', 400: '#FBBF24',
  500: '#F59E0B', 600: '#D97706', 700: '#B45309', 800: '#92400E', 900: '#78350F', 950: '#451A03',
}

const vars = map => Object.fromEntries(Object.entries(map).map(([k, v]) => [`--c-${k}`, rgb(v)]))
const defaults = {}
for (const p of THEMED) for (const s of SHADES) defaults[`${p}-${s}`] = twColors[p][s]
defaults.black = '#000000'
const crm = {}
for (const p of THEMED) for (const s of SHADES) crm[`${p}-${s}`] = (p === 'yellow' ? CRM_YELLOW : CRM_NEUTRAL)[s]
crm.black = '#1E3A8A'

const themePlugin = plugin(({ addBase }) => {
  addBase({
    ':root, .crm-raw': vars(defaults),
    '.crm-theme': vars(crm),
  })
})

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'sans-serif'],
        arabic: ['Tajawal', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        // Teacher space. Inter leads for Latin and numerals — it has no Arabic
        // coverage, so IBM Plex Sans Arabic sits behind it and picks up every
        // Arabic glyph. One stack, both scripts, no fallback surprises.
        plex: ['Inter', '"IBM Plex Sans Arabic"', 'Tajawal', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        ui: ['"DM Sans"', 'system-ui', 'sans-serif'],
        // Teacher space, warm-paper era. Outfit is geometric and carries the
        // headings and every numeral; Tajawal — a humanist Arabic face that
        // suits paper better than Plex's screen geometry — takes the Arabic.
        paper: ['Outfit', 'Tajawal', 'sans-serif'],
      },
      colors: {
        ...Object.fromEntries(THEMED.map(p => [p, themedScale(p)])),
        black: varColor('black'),
        // Teacher space palette — warm paper. The space is a workbook, not a
        // control panel: an off-white ground, white sheets, ink-brown text,
        // and one accent per domain stated at a weight that reads on white.
        paper: {
          bg:    '#F6F4EF',   // the desk
          card:  '#FFFFFF',   // the sheet
          line:  '#E7E2D8',   // a ruled hairline, never a grey box
          text:  '#1C1917',   // ink
          muted: '#78716C',   // pencil
        },
        // Domain colours, restated for light. Same meanings as the dark era:
        // violet identity, sky schedule, emerald money, amber achievement.
        domain: {
          violet:  '#6D28D9',
          sky:     '#0369A1',
          emerald: '#047857',
          amber:   '#B45309',
          rose:    '#BE123C',
        },
        ink: {
          bg:    '#0B1020',
          card:  '#151C32',
          line:  '#232C4A',
          text:  '#FFFFFF',
          muted: '#94A3B8',
        },
        prim:  '#5B5FEF',
        sec:   '#8B5CF6',
        acc:   '#38BDF8',
        ok:    '#22C55E',
        warn:  '#F59E0B',
        bad:   '#EF4444',
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#0f2157',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [themePlugin],
}
