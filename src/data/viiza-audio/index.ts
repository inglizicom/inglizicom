import { clipPath, speakable, type AudioSection, type Clip, type Voice } from '../level1-audio/index.ts'
import { STOPS } from '../viiza-book/index.ts'

/**
 * The audio of VIIZA ENGLISH, the travel guide: each stop's key words, what
 * you say, what you hear, the conversation and the survival card. The QR
 * code on every stop's opener opens /audio/viiza/{n}.
 *
 * Same files, voices and player as Level 1 (data/level1-audio): a clip's
 * file is a hash of its voice and text, so scripts/gen-level1-audio.mjs
 * records these clips too, and only what is new.
 */

/** Speakers who are women: the travellers by name, the others by their Arabic role (a feminine first word). */
const WOMEN = new Set(['SALMA', 'HIBA', 'EMMA'])
const isWoman = (who: string, roleAr: string) => WOMEN.has(who) || /^[^\s(]*ة(\s|$)/.test(roleAr) || /سائحة|مسافرة/.test(roleAr)

/** "PASSENGER" → "Passenger": the speakers as the player shows them. */
const nameOf = (s: string) => s.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase())

/** A line with its blanks ("My name is ______.") read with a pause where the blank is. */
const sayable = (en: string) => speakable(en.replace(/_{3,}/g, '…'))

const coral = (en: string, ar?: string): Clip => ({ en: sayable(en), ...(ar ? { ar } : {}), voice: 'coral' })

/** Each speaker keeps one voice, and two speakers never share one. */
function cast(roles: Record<string, string>): Map<string, Voice> {
  const out = new Map<string, Voice>()
  for (const [who, roleAr] of Object.entries(roles)) {
    const taken = new Set(out.values())
    const pool: Voice[] = isWoman(who, roleAr) ? ['shimmer', 'coral'] : ['ash', 'onyx', 'sage']
    out.set(who, pool.find(v => !taken.has(v)) ?? pool[0])
  }
  return out
}

/** A stop's audio, in the order of its pages. */
export function viizaSections(n: number): AudioSection[] {
  const s = STOPS.find(x => x.n === n)
  if (!s) return []
  const voices = cast(s.talk.cast)
  return [
    { kind: 'words', title: 'Key words', titleAr: 'الكلمات الأساسية', clips: s.words.map(([en, ar]) => coral(en.replace(/\s*\/\s*/g, ', '), ar)) },
    { kind: 'phrases', title: 'You say', titleAr: 'تقول أنت', clips: s.say.map(([en, ar]) => coral(en, ar)) },
    { kind: 'phrases', title: 'You hear', titleAr: 'تسمع', clips: s.hear.map(([en, ar]) => coral(en, ar)) },
    { kind: 'talk', title: 'Conversation', titleAr: 'المحادثة', clips: s.talk.lines.map(([who, en, ar]) => ({ en: sayable(en), ar, voice: voices.get(who)!, speaker: nameOf(who) })) },
    { kind: 'phrases', title: 'Survival card', titleAr: 'بطاقة النجاة', clips: s.card.map(([en, ar]) => coral(en, ar)) },
  ]
}

/** Every VIIZA clip, each once (by file). */
export function viizaClips(): Clip[] {
  const byFile = new Map<string, Clip>()
  for (const s of STOPS) for (const sec of viizaSections(s.n)) for (const c of sec.clips) if (c.en) byFile.set(clipPath(c, 'normal'), c)
  return [...byFile.values()]
}
