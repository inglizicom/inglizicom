/* Server-only WhatsApp sender (Meta Cloud API).
   Inert until WHATSAPP_TOKEN + WHATSAPP_PHONE_ID are set in the env.
   Business-initiated messages must use a pre-approved template. */

const API_VER = process.env.WHATSAPP_API_VERSION || 'v21.0'

export function waConfigured(): boolean {
  return !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID)
}

/** Normalise a Moroccan number to international digits (e.g. 0612.. → 212612..). */
export function waNormalize(phone: string): string {
  const d = (phone || '').replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith('212')) return d
  if (d.startsWith('0')) return '212' + d.slice(1)
  return d
}

/** Send an approved template message. Returns true only if Meta accepted it. */
export async function sendTemplate(to: string, template: string, lang: string, bodyParams: string[]): Promise<boolean> {
  if (!waConfigured()) return false
  const num = waNormalize(to)
  if (!num || !template) return false
  const url = `https://graph.facebook.com/${API_VER}/${process.env.WHATSAPP_PHONE_ID}/messages`
  const payload: any = {
    messaging_product: 'whatsapp', to: num, type: 'template',
    template: { name: template, language: { code: lang || 'ar' } },
  }
  if (bodyParams.length) payload.template.components = [{ type: 'body', parameters: bodyParams.map(t => ({ type: 'text', text: t })) }]
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!r.ok) { console.error('[whatsapp] send failed', await r.text()); return false }
    return true
  } catch (e) { console.error('[whatsapp] network', e); return false }
}

/* kind → { env template var (with default name), language, ordered param keys } */
const KINDS: Record<string, { tpl: string; def: string; lang: string; keys: string[] }> = {
  reminder:   { tpl: 'WHATSAPP_TPL_REMINDER',   def: 'daily_reminder',  lang: 'ar', keys: ['name', 'unit', 'days'] },
  correction: { tpl: 'WHATSAPP_TPL_CORRECTION', def: 'correction_ready', lang: 'ar', keys: ['name', 'unit'] },
  deadline:   { tpl: 'WHATSAPP_TPL_DEADLINE',   def: 'deadline_warning', lang: 'ar', keys: ['name', 'unit', 'days'] },
  lesson:     { tpl: 'WHATSAPP_TPL_LESSON',     def: 'new_lesson',       lang: 'ar', keys: ['name', 'lesson'] },
}

/** Send by semantic kind, mapping a params object to the template's ordered body params. */
export async function sendByKind(to: string, kind: string, params: Record<string, string>): Promise<boolean> {
  const k = KINDS[kind]; if (!k) return false
  const template = process.env[k.tpl] || k.def
  const bodyParams = k.keys.map(key => params[key] ?? '')
  return sendTemplate(to, template, k.lang, bodyParams)
}
