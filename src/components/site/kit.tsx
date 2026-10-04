import Link from 'next/link'
import { ArrowLeft, Check, ChevronDown, ShieldCheck } from 'lucide-react'
import SubscribeButton from '@/components/SubscribeButton'
import { WhatsAppIcon } from '@/components/StickyCTA'

/**
 * The public site's building blocks: one section rhythm, one title style, one
 * card, one FAQ list, one closing call. Every marketing page is made of these,
 * so the site reads as one product instead of several.
 *
 * The look is contrast and depth: each page opens on a deep navy band (white
 * type, the gold action), the body alternates white and pale-blue sections,
 * cards carry real shadows and lift on hover, and a few things move —
 * sections rise in (.ig-reveal), the gold button catches the light
 * (.ig-shine). Motion classes live in globals.css and respect reduced motion.
 */

/** The one action: gold, deep shadow, a slow shine, lifts on hover. */
export const CTA_GOLD =
  'ig-shine inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-400 text-slate-950 font-extrabold no-underline ' +
  'shadow-[0_12px_30px_-8px_rgba(245,158,11,0.65),inset_0_1px_0_rgba(255,255,255,0.6)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(245,158,11,0.75),inset_0_1px_0_rgba(255,255,255,0.6)] active:translate-y-0 transition-all duration-200'

/** The secondary solid button: brand navy with depth. */
export const BTN_NAVY =
  'inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-brand-600 to-brand-800 text-white font-extrabold no-underline ' +
  'shadow-[0_12px_26px_-10px_rgba(30,64,175,0.7),inset_0_1px_0_rgba(255,255,255,0.18)] hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-12px_rgba(30,64,175,0.8)] active:translate-y-0 transition-all duration-200'

/** A white card with real depth that lifts on hover. */
export const CARD =
  'rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-[0_14px_34px_-16px_rgba(15,23,42,0.28)] ' +
  'transition-all duration-300 hover:-translate-y-1 hover:ring-brand-200 hover:shadow-[0_26px_50px_-20px_rgba(30,64,175,0.38)]'

/** Icon tile: a small navy gradient square. */
export const ICON_TILE =
  'flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-[0_8px_18px_-6px_rgba(30,64,175,0.6)]'

export const fmtMad = (n: number) => `${n.toLocaleString('en-US')} د.م`

export function SectionTitle({ kicker, title, sub, onDark = false }: { kicker?: string; title: string; sub?: string; onDark?: boolean }) {
  return (
    <div className="ig-reveal text-center">
      {kicker && (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-extrabold ${onDark ? 'bg-white/10 text-amber-300 ring-1 ring-white/15' : 'bg-amber-100 text-amber-800'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${onDark ? 'bg-amber-300' : 'bg-amber-500'}`} /> {kicker}
        </span>
      )}
      <h2 className={`mt-3 text-[28px] sm:text-[40px] font-black tracking-tight leading-[1.15] ${onDark ? 'text-white' : 'text-slate-950'}`}>{title}</h2>
      {sub && <p className={`mt-3 text-[16px] sm:text-[18px] max-w-[40rem] mx-auto leading-relaxed ${onDark ? 'text-blue-100/85' : 'text-slate-700'}`}>{sub}</p>}
    </div>
  )
}

/** The navy ground every page opens on: two slow glows and a faint grid. */
export function NavyGround({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`relative overflow-hidden bg-[#0B1B4D] text-white ${className}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.55),transparent_60%)]" />
      <div aria-hidden className="ig-drift pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-blue-500/30 blur-3xl" />
      <div aria-hidden className="ig-drift-late pointer-events-none absolute -bottom-32 -left-20 w-[380px] h-[380px] rounded-full bg-amber-400/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="relative">{children}</div>
    </section>
  )
}

/** The top of every page: what this page is, in one sentence, and the one action. */
export function PageHero({ kicker, title, accent, sub, children }: {
  kicker: string; title: string; accent?: string; sub: string; children?: React.ReactNode
}) {
  return (
    <NavyGround className="pt-[96px] sm:pt-[124px] pb-14 sm:pb-20 px-5 sm:px-6">
      <div className="max-w-[860px] mx-auto text-center">
        <div className="ig-pop inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur px-3.5 py-1.5 text-[13px] font-bold text-blue-50">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-300" /> {kicker}
        </div>
        <h1 className="ig-pop mt-5 text-[34px] leading-[1.18] sm:text-[52px] font-black tracking-tight text-white [animation-delay:80ms]">
          {title}{accent && <span className="block bg-gradient-to-l from-amber-200 via-amber-300 to-amber-400 bg-clip-text text-transparent">{accent}</span>}
        </h1>
        <p className="ig-pop mt-5 text-[16.5px] sm:text-[19px] leading-relaxed text-blue-100/90 max-w-[38rem] mx-auto [animation-delay:160ms]">{sub}</p>
        <div className="ig-pop [animation-delay:240ms]">{children}</div>
      </div>
    </NavyGround>
  )
}

export function Guarantee({ className = '', onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-[14px] font-semibold ${onDark ? 'text-blue-100/90' : 'text-slate-700'} ${className}`}>
      <ShieldCheck size={18} className={`shrink-0 ${onDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
      لم تحسّ بالفرق في الأسبوع الأول؟ نعيد لك المبلغ كاملًا.
    </div>
  )
}

export function Points({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map(p => (
        <li key={p} className="flex items-start gap-2.5 text-[14.5px] font-semibold text-slate-800">
          <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center"><Check size={13} strokeWidth={3} /></span> {p}
        </li>
      ))}
    </ul>
  )
}

export function FaqList({ items, moreHref = '/faq' }: { items: { q: string; a: string }[]; moreHref?: string | null }) {
  return (
    <div className="max-w-[760px] mx-auto">
      <div className="space-y-3">
        {items.map(x => (
          <details key={x.q} className="ig-reveal group rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_8px_22px_-14px_rgba(15,23,42,0.25)] open:ring-brand-300 open:shadow-[0_16px_34px_-16px_rgba(30,64,175,0.35)] transition-shadow">
            <summary className="list-none cursor-pointer flex items-center justify-between gap-4 p-5 font-extrabold text-[15.5px] text-slate-950">
              {x.q}
              <span className="w-8 h-8 shrink-0 rounded-full bg-slate-100 group-open:bg-brand-700 group-open:text-white text-slate-500 flex items-center justify-center transition-colors">
                <ChevronDown size={17} className="transition-transform duration-300 group-open:rotate-180" />
              </span>
            </summary>
            <p className="px-5 pb-5 -mt-1 text-[15px] leading-relaxed text-slate-700">{x.a}</p>
          </details>
        ))}
      </div>
      {moreHref && (
        <div className="mt-6 text-center">
          <Link href={moreHref} className="inline-flex items-center gap-1.5 text-[14.5px] font-extrabold text-brand-700 no-underline hover:gap-2.5 transition-all">كل الأسئلة الشائعة <ArrowLeft size={15} /></Link>
        </div>
      )}
    </div>
  )
}

/** The closing band: the level test once more, WhatsApp as the quiet alternative. */
export function FinalCall({ title = 'جاهز تبدأ تتكلّم؟', sub, source }: { title?: string; sub?: string; source: string }) {
  return (
    <section className="px-5 sm:px-6 pb-14 sm:pb-20">
      <div className="ig-reveal max-w-[1200px] mx-auto rounded-[32px] overflow-hidden shadow-[0_30px_60px_-24px_rgba(11,27,77,0.65)]">
        <NavyGround className="text-center px-6 py-14 sm:py-20">
          <h2 className="text-[30px] sm:text-[44px] font-black leading-tight">{title}</h2>
          <p className="mt-4 text-[16px] sm:text-[18.5px] text-blue-100/90 max-w-[34rem] mx-auto leading-relaxed">
            {sub ?? 'ابدأ باختبار مستواك المجاني: يتوقف عند مستواك الحقيقي، ويقترح عليك من أين تبدأ وما الطريقة الأنسب لك.'}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/level-test" className={`${CTA_GOLD} w-full sm:w-auto text-[17px] px-9 py-4`}>
              اختبر مستواك مجانًا <ArrowLeft size={18} />
            </Link>
            <SubscribeButton source={source}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 ring-1 ring-white/25 backdrop-blur px-6 py-4 text-[15.5px] font-bold text-white transition-colors">
              <WhatsAppIcon size={19} /> أو اسألنا على واتساب
            </SubscribeButton>
          </div>
        </NavyGround>
      </div>
    </section>
  )
}
