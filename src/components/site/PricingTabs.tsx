'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BriefcaseBusiness, Crown, GraduationCap, UserRound, type LucideIcon } from 'lucide-react'
import { useProfile } from '@/lib/profile-context'
import OfferOptions, { type Option } from './OfferOptions'

/**
 * /pricing — the three ways to learn as tabs, each with its (at most three)
 * options. Old anchors (#classes, #business, #packs, #levels) open the right
 * tab, so links shared before the redesign still land well.
 */

type Door = 'course' | 'classes' | 'business'

const DOORS: { id: Door; label: string; icon: LucideIcon; href: string; more: string; options: Option[] }[] = [
  {
    id: 'course', label: 'الدورة', icon: GraduationCap, href: '/courses', more: 'كل تفاصيل الدورة والمستويات',
    options: [
      { kind: 'pick', planIds: ['basic', 'pro', 'intermediate', 'premium'], title: 'مستوى واحد', sub: 'تبدأ من مستواك وتنتقل للتالي متى شئت' },
      { kind: 'plan', planId: 'pack-starter' },
      { kind: 'plan', planId: 'pack-intensif', recommended: true },
    ],
  },
  {
    id: 'classes', label: 'الحصص الخاصة', icon: UserRound, href: '/classes', more: 'كل تفاصيل الحصص الخاصة',
    options: [
      { kind: 'plan', planId: 'class-4' },
      { kind: 'plan', planId: 'class-8', recommended: true },
      { kind: 'plan', planId: 'class-12' },
    ],
  },
  {
    id: 'business', label: 'المهنية', icon: BriefcaseBusiness, href: '/business', more: 'كل تفاصيل البرنامج المهني',
    options: [
      { kind: 'plan', planId: 'business', recommended: true },
      { kind: 'plan', planId: 'pack-complet' },
    ],
  },
]

const FROM_HASH: Record<string, Door> = { classes: 'classes', business: 'business', packs: 'course', levels: 'course', course: 'course' }

export default function PricingTabs() {
  const [door, setDoor] = useState<Door>('course')
  useEffect(() => {
    const h = window.location.hash.replace('#', '')
    if (FROM_HASH[h]) setDoor(FROM_HASH[h])
  }, [])
  const d = DOORS.find(x => x.id === door)!

  return (
    <div>
      <div role="tablist" aria-label="طريقة التعلّم" className="ig-reveal mx-auto w-full max-w-[560px] grid grid-cols-3 gap-1 rounded-2xl bg-white ring-1 ring-slate-200 p-1.5 shadow-[0_14px_34px_-16px_rgba(15,23,42,0.3)]">
        {DOORS.map(x => (
          <button key={x.id} role="tab" aria-selected={door === x.id} onClick={() => setDoor(x.id)}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-1.5 py-2.5 text-[13.5px] sm:text-[14.5px] font-extrabold whitespace-nowrap transition-colors ${
              door === x.id ? 'bg-gradient-to-b from-brand-600 to-brand-800 text-white shadow-[0_8px_18px_-8px_rgba(30,64,175,0.8)]' : 'text-slate-600 hover:bg-slate-50'
            }`}>
            <x.icon size={16} className="shrink-0 hidden sm:block" /> {x.label}
          </button>
        ))}
      </div>
      <div className="mt-10" role="tabpanel">
        <OfferOptions key={d.id} source={`pricing_${d.id}`} options={d.options} />
      </div>
      <div className="mt-7 text-center">
        <Link href={d.href} className="inline-flex items-center gap-1.5 text-[14.5px] font-extrabold text-brand-700 no-underline hover:underline">
          {d.more} <ArrowLeft size={15} />
        </Link>
      </div>
    </div>
  )
}

/** For someone already subscribed: where to manage it, instead of a sales pitch. */
export function PaidBanner() {
  const { status } = useProfile()
  if (!status.isPaid) return null
  return (
    <div className="max-w-xl mx-auto mb-8 rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4 flex items-center gap-3">
      <Crown className="w-6 h-6 text-amber-500 shrink-0" />
      <div className="flex-1">
        <div className="font-extrabold text-[14.5px] text-slate-900">أنت مشترك حاليًا</div>
        {status.expiresInDays !== null && (
          <div className="text-emerald-700 text-[13px] font-semibold">يبقى {status.expiresInDays} يومًا على انتهاء اشتراكك</div>
        )}
      </div>
      <Link href="/billing" className="text-[13px] font-extrabold bg-white ring-1 ring-emerald-200 hover:bg-emerald-100 text-slate-900 px-3 py-2 rounded-lg no-underline whitespace-nowrap">
        إدارة الاشتراك
      </Link>
    </div>
  )
}
