'use client'

import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'

/** Share a teacher's public page: the native share sheet on phones, the
 *  clipboard on desktop. The page itself stays a server component. */
export default function ShareProfileButton({
  title, className = '', label = 'مشاركة',
}: { title: string; className?: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href.split('#')[0]
    try {
      if (navigator.share) { await navigator.share({ title, url }); return }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* share sheet dismissed */ }
  }

  return (
    <button type="button" onClick={share} className={className}>
      {copied ? <Check size={15} /> : <Share2 size={15} />}
      {copied ? 'تم نسخ الرابط' : label}
    </button>
  )
}
