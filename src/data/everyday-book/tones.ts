/**
 * The PIIRMI book's colour key and the word list's sort, on their own so the
 * printed pages can be drawn in the browser (PIIRMI interactive's book view)
 * without the book's index, and with it every unit.
 */

export type EverydayKind = 'welcome' | 'howto' | 'contents' | 'planner' | 'progress' | 'opener' | 'vocab' | 'expressions' | 'talk' | 'reading' | 'review' | 'key' | 'wordlist'

/**
 * The book's colour key: one colour per kind of section, the same in every
 * unit, so a student always knows where they are — vocabulary blue,
 * expressions green, conversation violet, reading orange, every practice box
 * teal — and the book's own gold for openers, front and back matter.
 */
export const TONES = {
  // the series palette, from the PIIRMI ENGLISH covers: Piirmi green, deep saffron, navy, and the series' blue and orange
  vocab: { m: '#2B36C9', s: '#EEF0FD' },
  expr: { m: '#0E6B4E', s: '#EAF6F1' },
  talk: { m: '#0E1240', s: '#EEF0F8' },
  reading: { m: '#B7791F', s: '#FFF6DE' },
  practice: { m: '#C2541F', s: '#FFF1E8' },
  brand: { m: '#0E6B4E', s: '#FFF4E0' },
} as const
export type Tone = keyof typeof TONES
/** The colour of a page (its frame, and any section without a tone of its own). */
export const KIND_TONE: Record<EverydayKind, Tone> = {
  welcome: 'brand', howto: 'brand', contents: 'brand', planner: 'brand', progress: 'brand', opener: 'brand', wordlist: 'brand', key: 'brand',
  vocab: 'vocab', expressions: 'expr', talk: 'talk', reading: 'reading', review: 'practice',
}

/* The word list's alphabetical key: "a missed call" files under M, "to go" under G. */
export const sortKey = (en: string) => en.toLowerCase().replace(/^(a|an|the|to)\s+/, '').replace(/[^a-z0-9 ]/g, '')

const pad = (n: number) => String(n).padStart(2, '0')
/** A word's file name: "Wi-Fi password" → wi-fi-password, "for here / to go" → for-here-to-go. */
export const photoSlug = (en: string) => en.toLowerCase().replace(/&/g, 'and').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
/** The word's photograph, from the author's course pictures (public/everyday-book/vocab). */
export const photoOf = (unit: number, en: string) => `/everyday-book/vocab/u${pad(unit)}/${photoSlug(en)}.webp`
/** An extra word's photograph (public/everyday-book/extra); until it is added, the card shows the word's picture sign. */
export const extraPhotoOf = (unit: number, en: string) => `/everyday-book/extra/u${pad(unit)}/${photoSlug(en)}.webp`

/** Each speaker's face in the conversations. */
export const AVATARS: Record<string, string> = {
  // The two people of a conversation must look different at a glance: hijab or not, beard or not, skin tones apart.
  SAMI: '👨🏻', AMINE: '👨🏽', OMAR: '🧔🏻', KARIM: '👨🏾',
  NOUR: '🧕', LINA: '🧕🏽', HODA: '🧕🏻', SALMA: '🧕🏾', NADIA: '👩🏽', RANIA: '👩🏻', LAYLA: '👩🏼', SARA: '👩🏾',
  STAFF: '🧑‍💼', FARID: '🧑‍💼', WAITER: '🤵', CASHIER: '🧑‍💼', BAKER: '🧑‍🍳', ASSISTANT: '💁', PHARMACIST: '🧑‍⚕️',
  RECEPTIONIST: '💁', DOCTOR: '🧑‍⚕️', SELLER: '🧑‍🌾', DRIVER: '🧔🏽', 'BUS DRIVER': '🧑🏾', CLERK: '🧑‍💼', PASSENGER: '🧑',
}
