import { clipBase, clipPath, speakable, type AudioSection, type Clip, type Voice } from '../level1-audio/index.ts'
import { STOPS } from '../viiza-book/index.ts'
import { TALK_STOPS } from '../viiza-talk/index.ts'

/**
 * The audio of VIIZA ENGLISH, the travel guide: each stop's key words and
 * vocabulary page, the exchanges (what you hear and how you reply, what you
 * say and what comes back), the conversation and the survival card (the QR
 * on every opener opens /audio/viiza/{n}); and each stop of Words &
 * Conversations, its new words and four conversations (/audio/viiza-talk/{n}).
 *
 * Same files, voices and player as Level 1 (data/level1-audio): a clip's
 * file is a hash of its voice and text, so scripts/gen-level1-audio.mjs
 * records these clips too, and only what is new.
 */

/** Speakers who are women: the travellers by name, the others by their Arabic role (a feminine first word). */
const WOMEN = new Set(['SALMA', 'HIBA', 'EMMA', 'NADIA', 'IMANE', 'SARA', 'KHADIJA', 'FATIMA', 'LUCY', 'EMILY', 'MRS', 'WOMAN'])
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
  const m = s.more
  // The exchanges: the other person in a man's voice, the traveller in the book's voice (so "You say" lines reuse their files).
  const them = (en: string, ar: string): Clip => ({ en: sayable(en), ar, voice: 'ash', speaker: 'They' })
  const you = (en: string, ar: string): Clip => ({ ...coral(en, ar), speaker: 'You' })
  return [
    { kind: 'words', title: 'Key words', titleAr: 'الكلمات الأساسية', clips: s.words.map(([en, ar]) => coral(en.replace(/\s*\/\s*/g, ', '), ar)) },
    ...(m ? [
      { kind: 'phrases' as const, title: 'Key words in sentences', titleAr: 'الكلمات في جمل', clips: m.examples.map(e => coral(e)) },
      { kind: 'words' as const, title: 'Action words', titleAr: 'أفعال تحتاجها', clips: m.actions.map(([en, ar]) => coral(en, ar)) },
      { kind: 'phrases' as const, title: 'Action words in sentences', titleAr: 'الأفعال في جمل', clips: m.actions.map(([, , ex]) => coral(ex)) },
      { kind: 'words' as const, title: 'Words that go together', titleAr: 'كلمات تأتي معًا', clips: m.partners.map(([en, ar]) => coral(en, ar)) },
      { kind: 'phrases' as const, title: 'Words that go together in sentences', titleAr: 'كلمات تأتي معًا في جمل', clips: m.partners.map(([, , ex]) => coral(ex)) },
      { kind: 'talk' as const, title: 'You hear → you reply', titleAr: 'تسمع، فتردّ', clips: m.replies.flatMap(([en, ar], i) => [them(...s.hear[i]), you(en, ar)]) },
      { kind: 'talk' as const, title: 'You say → they reply', titleAr: 'تقول، فيردّون', clips: m.answers.flatMap(([en, ar], i) => [you(...s.say[i]), them(en, ar)]) },
      { kind: 'phrases' as const, title: 'More to say, more to hear', titleAr: 'جمل أخرى تقولها وتسمعها', clips: [...s.say.slice(m.answers.length), ...s.hear.slice(m.replies.length)].map(([en, ar]) => coral(en, ar)) },
    ] : [
      { kind: 'phrases' as const, title: 'You say', titleAr: 'تقول أنت', clips: s.say.map(([en, ar]) => coral(en, ar)) },
      { kind: 'phrases' as const, title: 'You hear', titleAr: 'تسمع', clips: s.hear.map(([en, ar]) => coral(en, ar)) },
    ]),
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

/* ── Words & Conversations ──────────────────────────────────────────── */

/** A stop of Words & Conversations: its new words, then its four conversations, each speaker with a voice. */
export function viizaTalkSections(n: number): AudioSection[] {
  const t = TALK_STOPS.find(x => x.n === n)
  if (!t) return []
  return [
    { kind: 'words', title: 'New words', titleAr: 'كلمات جديدة', clips: t.words.map(([en, ar]) => coral(en, ar)) },
    ...t.talks.map((c, i): AudioSection => {
      const voices = cast(c.cast)
      return { kind: 'talk', title: `${i + 1}. ${c.title[0]}`, titleAr: c.title[1], clips: c.lines.map(([who, en, ar]) => ({ en: sayable(en), ar, voice: voices.get(who)!, speaker: nameOf(who) })) }
    }),
  ]
}

/** Every Words & Conversations clip, each once (by file). */
export function viizaTalkClips(): Clip[] {
  const byFile = new Map<string, Clip>()
  for (const t of TALK_STOPS) for (const sec of viizaTalkSections(t.n)) for (const c of sec.clips) if (c.en) byFile.set(clipPath(c, 'normal'), c)
  return [...byFile.values()]
}

/* ── VIIZA interactive ──────────────────────────────────────────────── */

/**
 * A stop's sentences as the app (/viiza) shows them, each with the file of
 * its clip (without the speed): the same voices as viizaSections, so the
 * app plays exactly the files scripts/gen-level1-audio.mjs records.
 */
export function viizaStopAudio(n: number): Record<string, string> {
  const s = STOPS.find(x => x.n === n)
  if (!s) return {}
  const out: Record<string, string> = {}
  const put = (shown: string, c: Clip) => { if (shown && !(shown in out)) out[shown] = clipBase(c) }
  const m = s.more
  const voices = cast(s.talk.cast)
  for (const [en] of s.words) put(en, coral(en.replace(/\s*\/\s*/g, ', ')))
  if (m) {
    m.examples.forEach(e => put(e, coral(e)))
    for (const [en, , ex] of m.actions) { put(en, coral(en)); put(ex, coral(ex)) }
    for (const [en, , ex] of m.partners) { put(en, coral(en)); put(ex, coral(ex)) }
    m.replies.forEach(([en], i) => { put(s.hear[i][0], { en: sayable(s.hear[i][0]), voice: 'ash' }); put(en, coral(en)) })
    m.answers.forEach(([en], i) => { put(s.say[i][0], coral(s.say[i][0])); put(en, { en: sayable(en), voice: 'ash' }) })
  }
  for (const [en] of [...s.say, ...s.hear]) put(en, coral(en))
  for (const [who, en] of s.talk.lines) put(en, { en: sayable(en), voice: voices.get(who)! })
  for (const [en] of s.card) put(en, coral(en))
  return out
}
