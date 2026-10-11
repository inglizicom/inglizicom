import { clipPath, speakable, type AudioSection, type Clip, type Voice } from '../level1-audio/index.ts'
import { L2_UNITS } from '../level2-book/index.ts'
import { LEVEL2_VOCAB } from '../level2-vocab/index.ts'

/**
 * The audio of Level 2 (A2 → B1): each unit of the course book (its words and
 * their examples, the expressions of its steps, the conversation, the model
 * text) and each unit of the vocabulary book (its words, examples, groups,
 * word power, conversations, ask and answer, reading). The workbook's QR
 * codes open the course book's unit, whose lines its exercises use.
 *
 * Same files, voices and player as Level 1 (data/level1-audio): a clip's file
 * is a hash of its voice and text, so scripts/gen-level1-audio.mjs records
 * these clips too, and only what is new.
 */

const WOMEN = new Set(['imane', 'soukaina', 'lamia', 'hind', 'souad', 'salma', 'najwa', 'sara', 'nadia', 'nawal', 'leila', 'asmaa', 'ms alaoui',
  'khadija', 'ikram', 'hajar', 'meryem', 'zineb', 'nora', 'rim', 'siham', 'kawtar', 'aunt fatima', 'hiba', 'samira', 'rania', 'sofia', 'mrs chraibi',
  'mum', 'ghita', 'mrs ouazzani', 'lina', 'mariam', 'ilham', 'receptionist', 'housekeeper', 'mrs benjelloun', 'asmae', 'wiam', 'hanane', 'nour',
  'malak', 'kenza', 'teacher', 'tourist', 'interviewer'])

/** "MR TAZI" → "Mr Tazi": the conversations' names as the player shows them. */
const nameOf = (s: string) => s.trim().toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase())

/** Each speaker keeps one voice, and two speakers never share one. */
function cast(names: string[]): Map<string, Voice> {
  const out = new Map<string, Voice>()
  for (const who of names) {
    if (out.has(who)) continue
    const taken = new Set(out.values())
    const pool: Voice[] = WOMEN.has(who.toLowerCase()) ? ['coral', 'shimmer'] : ['ash', 'onyx']
    out.set(who, pool.find(v => !taken.has(v)) ?? pool[0])
  }
  return out
}

const coral = (en: string, ar?: string): Clip => ({ en: speakable(en), ...(ar ? { ar } : {}), voice: 'coral' })
/** A unit of the course book. */
export function l2BookSections(n: number): AudioSection[] {
  const u = L2_UNITS.find(x => x.n === n)
  if (!u) return []
  const words = u.vocab.groups.flatMap(g => g.words)
  const lines = u.talk.map(l => { const [who, ...said] = l.split(':'); return { who: nameOf(who), said: said.join(':') } })
  const voices = cast(lines.map(l => l.who))
  const expressions: Clip[] = u.ladder
    ? u.ladder.steps.flatMap(s => s.phrases.map(([en, ar]) => coral(en, ar)))
    : u.expressions.flatMap(([q, a, qAr, aAr]) => [coral(q, qAr), coral(a, aAr)])
  return [
    { kind: 'words', title: 'Words', titleAr: 'الكلمات', clips: words.map(([en, ar]) => coral(en, ar)) },
    { kind: 'phrases', title: 'Examples', titleAr: 'الأمثلة', clips: words.map(([, , ex]) => coral(ex)) },
    { kind: 'phrases', title: 'Expressions', titleAr: 'العبارات', clips: expressions },
    { kind: 'talk', title: 'Conversation', titleAr: 'المحادثة', clips: lines.map(l => ({ en: speakable(l.said), voice: voices.get(l.who)!, speaker: l.who })) },
    { kind: 'reading', title: u.writing.name, titleAr: u.writing.nameAr, clips: u.writing.model.body.split('\n').map(p => coral(p)).filter(c => c.en) },
  ]
}

/** A unit of the vocabulary book. */
export function l2VocabSections(n: number): AudioSection[] {
  const u = LEVEL2_VOCAB.find(x => x.n === n)
  if (!u) return []
  const talk = (t: (typeof u.talks)[number]): AudioSection => {
    const voices = cast(t.who)
    return { kind: 'talk', title: t.titleEn, titleAr: t.titleAr, clips: t.lines.map((l, i) => ({ en: speakable(l.en), ar: l.ar, voice: voices.get(t.who[i % 2])!, speaker: t.who[i % 2] })) }
  }
  return [
    { kind: 'words', title: 'Words', titleAr: 'الكلمات', clips: u.vocab.map(e => coral(e.en, e.ar)) },
    { kind: 'phrases', title: 'Examples', titleAr: 'الأمثلة', clips: u.vocab.map(e => coral(e.ex, e.exAr)) },
    ...u.groups.map((g): AudioSection => ({ kind: 'words', title: g.en, titleAr: g.ar, clips: g.words.map(w => coral(w.en, w.ar)) })),
    { kind: 'words', title: 'Words that go together', titleAr: 'كلمات تأتي معًا', clips: u.power.together.map(w => coral(w.en, w.ar)) },
    { kind: 'words', title: 'Word families', titleAr: 'عائلات الكلمات', clips: u.power.families.map(f => coral(f.filter(w => w !== '—').join(', ') + '.')) },
    ...u.talks.map(talk),
    { kind: 'phrases', title: 'Ask and answer', titleAr: 'اسأل وأجب', clips: u.ask.flatMap((q, i) => [coral(q.en, q.ar), ...(u.answer[i] ? [coral(u.answer[i].en, u.answer[i].ar)] : [])]) },
    { kind: 'reading', title: u.reading.title, titleAr: u.reading.titleAr, clips: [coral(u.reading.text)] },
  ]
}

/** Every Level 2 clip, each once (by file). */
export function level2Clips(): Clip[] {
  const all = [...L2_UNITS.flatMap(u => l2BookSections(u.n)), ...LEVEL2_VOCAB.flatMap(u => l2VocabSections(u.n))].flatMap(s => s.clips)
  const byFile = new Map<string, Clip>()
  for (const c of all) if (c.en) byFile.set(clipPath(c, 'normal'), c)
  return [...byFile.values()]
}
