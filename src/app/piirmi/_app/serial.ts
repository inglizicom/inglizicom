/**
 * The printed pages of a PIIRMI unit travel from the server to the browser
 * as JSON, and some of their blocks carry a RegExp (the vocabulary marks).
 * These keep a RegExp a RegExp on the way.
 */

export const toJson = (v: unknown) => JSON.stringify(v, (_, x) => (x instanceof RegExp ? { __re: x.source, flags: x.flags } : x))

export const fromJson = <T,>(s: string): T =>
  JSON.parse(s, (_, x) => (x && typeof x === 'object' && typeof x.__re === 'string' ? new RegExp(x.__re, x.flags) : x)) as T
