import type { Block, ExerciseItem, Lesson, Pair } from '../level1-book.ts'

/** Helpers to write the Bac pack's pages compactly (see bac-pack.ts). */

export type BacSection = 'contents' | 'start' | 'reading' | 'vocab' | 'grammar' | 'functions' | 'writing' | 'exam' | 'key'
export type BacPage = Lesson & { section: BacSection }

export const page = (section: BacSection, tag: string, titleEn: string, titleAr: string, blocks: Block[]): BacPage =>
  ({ n: 0, section, tag, titleEn, titleAr, blocks })

/** [question, answer] or [question, answer, [options]] */
type Row = [string, string] | [string, string, string[]]
export const ex = (title: string, instr: string, rows: Row[], opts: { cols?: 1 | 2; lines?: boolean; size?: number } = {}): Block =>
  ({ t: 'exercise', title, instr, items: rows.map(([q, a, options]): ExerciseItem => (options ? { q, a, options } : { q, a })), ...opts })

/** A ✗ / ✓ table of the mistakes students make most with a rule. */
export const mistakes = (rows: [wrong: string, right: string][]): Block => ({
  t: 'grid', title: 'Watch out! Common mistakes - أخطاء شائعة', rows: [
    { dark: true, cells: ['✗ Wrong', '✓ Right'] },
    ...rows.map(([w, r]) => ({ size: 11.5, cells: [w, r] })),
  ],
})

/** 'en=ar|en=ar' → word pairs */
export const pairs = (s: string): Pair[] => s.split('|').map(x => { const [en, ar] = x.split('='); return [en.trim(), ar.trim()] })

/** A vocabulary list in two columns of dotted rows. */
export const words = (s: string): Block => ({ t: 'pairs', cols: 2, side: true, size: 12.5, items: pairs(s) })
