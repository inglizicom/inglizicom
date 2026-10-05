import { supabase } from './supabase'

/**
 * Which platform brings the students (063): leads → students → revenue per
 * channel, and the short links that tag a visit with its source
 * (next.config.js redirects /ig, /tt, /fb, /wa, /yt).
 */

export type Channel =
  | 'instagram' | 'tiktok' | 'facebook' | 'whatsapp' | 'youtube' | 'search' | 'ai' | 'referral' | 'other' | 'direct'

export interface ChannelRow {
  channel: Channel
  leads: number
  /** Leads that came through a form on the site (the rest were typed in by staff). */
  from_site: number
  students: number
  paying: number
  revenue: number
}

export const CHANNEL_LABEL: Record<Channel, string> = {
  instagram: 'إنستغرام', tiktok: 'تيك توك', facebook: 'فيسبوك', whatsapp: 'واتساب', youtube: 'يوتيوب',
  search: 'بحث Google', ai: 'ChatGPT والذكاء الاصطناعي', referral: 'توصية', other: 'مواقع أخرى', direct: 'مباشر / غير معروف',
}

export async function fetchChannelReport(from?: string | null, to?: string | null): Promise<{ from: string; to: string; channels: ChannelRow[] }> {
  const { data, error } = await supabase.rpc('staff_channel_report', { p_from: from ?? null, p_to: to ?? null })
  if (error) throw new Error(/staff_channel_report/.test(error.message) ? 'التقرير غير متاح بعد — شغّل الملف 063 في Supabase.' : error.message)
  return {
    from: data.from, to: data.to,
    channels: (data.channels ?? []).map((c: any) => ({
      ...c, leads: Number(c.leads), from_site: Number(c.from_site), students: Number(c.students),
      paying: Number(c.paying), revenue: Number(c.revenue),
    })),
  }
}

/** The short links to put in bios, posts and statuses. */
export const SHORT_LINKS: { path: string; channel: Channel; where: string }[] = [
  { path: '/ig', channel: 'instagram', where: 'البايو، الستوري، الريلز' },
  { path: '/tt', channel: 'tiktok',    where: 'البايو والتعليقات' },
  { path: '/fb', channel: 'facebook',  where: 'المنشورات والصفحة' },
  { path: '/wa', channel: 'whatsapp',  where: 'الحالة والرسائل' },
  { path: '/yt', channel: 'youtube',   where: 'وصف الفيديو' },
]
export const SITE = 'https://inglizi.com'
