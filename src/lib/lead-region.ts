/**
 * Where we don't take leads yet: Algeria, Tunisia, Egypt, Libya, Mauritania.
 * People from these countries who live elsewhere (Europe, the Gulf…) can pay
 * through the transfer services Morocco accepts, so they stay welcome.
 *
 * Two signals, because neither is enough alone:
 *   ipCountry  where the visitor is right now (/api/geo, ISO alpha-2)
 *   phone      its country code — only when written internationally: a local
 *              05/06/07… number looks the same in Algeria and Morocco
 * Blocked when the visitor is in one of the countries, or has a phone from
 * one of them and we can't see them anywhere else. Pure, unit-tested.
 */

export const BLOCKED_COUNTRIES = ['DZ', 'TN', 'EG', 'LY', 'MR'] as const
const CODES: [string, string][] = [['213', 'DZ'], ['216', 'TN'], ['218', 'LY'], ['222', 'MR'], ['20', 'EG']]

/** Country of an internationally written number (+213…, 00213…, 213… with
 *  enough digits), or null for a local number we can't place. */
export function phoneCountry(phone: string | null | undefined): string | null {
  const raw = (phone ?? '').trim()
  let d = raw.replace(/\D/g, '')
  if (!d) return null
  if (d.startsWith('00')) d = d.slice(2)
  else if (!raw.startsWith('+') && (d.startsWith('0') || d.length < 11)) return null
  if (d.startsWith('212')) return 'MA'
  for (const [code, cc] of CODES) if (d.startsWith(code)) return cc
  return 'OTHER'
}

/** The blocked country this lead comes from, or null when we take it. */
export function blockedRegion(ipCountry: string | null | undefined, phone: string | null | undefined): string | null {
  const ip = ipCountry && /^[A-Z]{2}$/i.test(ipCountry) ? ipCountry.toUpperCase() : null
  const blocked = (c: string | null): c is string => !!c && (BLOCKED_COUNTRIES as readonly string[]).includes(c)
  if (blocked(ip)) return ip
  const ph = phoneCountry(phone)
  if (blocked(ph) && !ip) return ph
  return null
}

export const REGION_BLOCKED_AR =
  'شكرًا لاهتمامك 🙏 دوراتنا غير متاحة حاليًا في بلدك. إن كنت تقيم في المغرب أو في دولة أخرى، تواصل معنا من هناك وسنسعد بمساعدتك.'

export class LeadRegionBlockedError extends Error {
  country: string
  constructor(country: string) {
    super(REGION_BLOCKED_AR)
    this.name = 'LeadRegionBlockedError'
    this.country = country
  }
}
