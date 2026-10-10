import { test } from 'node:test'
import assert from 'node:assert/strict'
import { allClips, bookSections, bouchtaClips, cardClips, cardCode, clipPath, numberWords } from '../../src/data/level1-audio/index.ts'
import { BOUCHTA, CARDS } from '../../src/data/level1-cards/index.ts'
import { LEVEL1_V2_LESSONS } from '../../src/data/level1-book-v2.ts'

const AR = /[؀-ۿ]/

test('every clip is English that can be read aloud', () => {
  for (const c of allClips()) {
    assert.ok(c.en && !AR.test(c.en), `«${c.en}»`)
    assert.ok(!/\p{Extended_Pictographic}/u.test(c.en), `no emoji in «${c.en}»`)
    assert.ok(c.en.length <= 1500, `«${c.en.slice(0, 30)}…» is short enough for one request`)
  }
})

test('every lesson has its words, and every conversation keeps one voice per speaker', () => {
  for (const l of LEVEL1_V2_LESSONS) {
    const sections = bookSections(l.n)
    assert.ok(sections.length, `lesson ${l.n}`)
    for (const s of sections.filter(x => x.kind === 'talk')) {
      const voiceOf = new Map()
      for (const c of s.clips) {
        if (voiceOf.has(c.speaker)) assert.equal(voiceOf.get(c.speaker), c.voice, `${s.title}: ${c.speaker}`)
        voiceOf.set(c.speaker, c.voice)
      }
      assert.equal(new Set(voiceOf.values()).size, voiceOf.size, `${s.title}: two speakers share a voice`)
    }
  }
})

test('every card and every silly question has its audio, behind a QR code of its own', () => {
  for (const c of CARDS) assert.ok(cardClips(c).length >= 1 && cardClips(c).every(x => x.en), c.id)
  for (const b of BOUCHTA.filter(x => x.kind === 'silly')) assert.equal(bouchtaClips(b).length, 2, b.id)
  const codes = [...CARDS.map(c => cardCode(c.id)), ...BOUCHTA.map(b => cardCode(b.id))]
  assert.equal(new Set(codes).size, codes.length)
  for (const code of codes) assert.match(code, /^(L\d\d-\d|B-\d\d)$/)
})

test('file names: the same line in the same voice is one file; slow and normal differ', () => {
  const c = { en: 'Good morning', voice: 'coral' }
  assert.equal(clipPath(c, 'slow'), clipPath({ ...c }, 'slow'))
  assert.notEqual(clipPath(c, 'slow'), clipPath(c, 'normal'))
  assert.notEqual(clipPath(c, 'normal'), clipPath({ ...c, voice: 'ash' }, 'normal'))
  assert.equal(numberWords(42), 'forty-two')
  assert.equal(numberWords(900), 'nine hundred')
})
