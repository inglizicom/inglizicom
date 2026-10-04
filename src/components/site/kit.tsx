import Link from 'next/link'
import { ArrowLeft, Check, ChevronDown, ShieldCheck } from 'lucide-react'
import SubscribeButton from '@/components/SubscribeButton'
import { WhatsAppIcon } from '@/components/StickyCTA'

/**
 * The public site's building blocks (light theme): one section rhythm, one
 * title style, one FAQ list, one closing call. Every marketing page is made
 * of these, so the site reads as one product instead of several.
 */

export const CTA_GOLD =
  'inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold no-underline shadow-[0_6px_20px_rgba(245,158,11,0.35)] transition-colors'

export const fmtMad = (n: number) => `${n.toLocaleString('en-US')} د.م`

export function SectionTitle({ kicker, title, sub }: { kicker?: string; title: string; sub?: string }) {
  return (
    <div className="text-center">
      {kicker && <div className="text-[13px] font-extrabold text-amber-600">{kicker}</div>}
      <h2 className="mt-1.5 text-[26px] sm:text-[36px] font-black tracking-tight leading-tight text-slate-900">{title}</h2>
      {sub && <p className="mt-2.5 text-[15.5px] sm:text-[17px] text-slate-600 max-w-[40rem] mx-auto">{sub}</p>}
    </div>
  )
}

/** The top of every page: what this page is, in one sentence, and the one action. */
export function PageHero({ kicker, title, accent, sub, children }: {
  kicker: string; title: string; accent?: string; sub: string; children?: React.ReactNode
}) {
  return (
    <section className="bg-gradient-to-b from-brand-50/70 via-white to-white pt-[92px] sm:pt-[116px] pb-10 sm:pb-14 px-5 sm:px-6">
      <div className="max-w-[860px] mx-auto text-center">
        <div className="inline-flex rounded-full bg-white ring-1 ring-slate-200 px-3 py-1.5 text-[13px] font-bold text-slate-600 shadow-sm">{kicker}</div>
        <h1 className="mt-5 text-[32px] leading-[1.2] sm:text-[46px] font-black tracking-tight text-slate-900">
          {title}{accent && <span className="block text-brand-700">{accent}</span>}
        </h1>
        <p className="mt-4 text-[16.5px] sm:text-[18.5px] leading-relaxed text-slate-600 max-w-[38rem] mx-auto">{sub}</p>
        {children}
      </div>
    </section>
  )
}

export function Guarantee({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-[14px] font-semibold text-slate-600 ${className}`}>
      <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
      لم تحسّ بالفرق في الأسبوع الأول؟ نعيد لك المبلغ كاملًا.
    </div>
  )
}

export function Points({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map(p => (
        <li key={p} className="flex items-start gap-2 text-[14.5px] font-semibold text-slate-700">
          <Check size={17} className="text-emerald-600 mt-0.5 shrink-0" /> {p}
        </li>
      ))}
    </ul>
  )
}

export function FaqList({ items, moreHref = '/faq' }: { items: { q: string; a: string }[]; moreHref?: string | null }) {
  return (
    <div className="max-w-[760px] mx-auto">
      <div className="space-y-2.5">
        {items.map(x => (
          <details key={x.q} className="group rounded-2xl bg-white ring-1 ring-slate-200 open:ring-brand-200 open:shadow-sm">
            <summary className="list-none cursor-pointer flex items-center justify-between gap-4 p-5 font-extrabold text-[15.5px] text-slate-900">
              {x.q}
              <ChevronDown size={18} className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-5 pb-5 -mt-1 text-[15px] leading-relaxed text-slate-600">{x.a}</p>
          </details>
        ))}
      </div>
      {moreHref && (
        <div className="mt-5 text-center">
          <Link href={moreHref} className="text-[14.5px] font-bold text-brand-700 no-underline hover:underline">كل الأسئلة الشائعة</Link>
        </div>
      )}
    </div>
  )
}

/** The closing band: the level test once more, WhatsApp as the quiet alternative. */
export function FinalCall({ title = 'جاهز تبدأ تتكلّم؟', sub, source }: { title?: string; sub?: string; source: string }) {
  return (
    <section className="px-5 sm:px-6 pb-14 sm:pb-20">
      <div className="max-w-[1200px] mx-auto rounded-[28px] bg-brand-800 text-white text-center px-6 py-12 sm:py-16">
        <h2 className="text-[28px] sm:text-[40px] font-black leading-tight">{title}</h2>
        <p className="mt-3 text-[16px] sm:text-[18px] text-blue-100/85 max-w-[34rem] mx-auto">
          {sub ?? 'ابدأ باختبار مستواك المجاني: يتوقف عند مستواك الحقيقي، ويقترح عليك من أين تبدأ وما الطريقة الأنسب لك.'}
        </p>
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/level-test" className={`${CTA_GOLD} w-full sm:w-auto text-[17px] px-8 py-4`}>
            اختبر مستواك مجانًا <ArrowLeft size={18} />
          </Link>
          <SubscribeButton source={source}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/15 ring-1 ring-white/25 px-6 py-4 text-[15.5px] font-bold text-white transition-colors">
            <WhatsAppIcon size={19} /> أو اسألنا على واتساب
          </SubscribeButton>
        </div>
      </div>
    </section>
  )
}
