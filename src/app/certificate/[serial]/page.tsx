'use client'

/**
 * Public certificate page — /certificate/[serial]
 * Anyone with the serial can view, verify and print the certificate
 * (anti-forgery: the data comes live from certificate_verify()).
 */

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, Printer, ShieldCheck, XCircle } from 'lucide-react'
import { verifyCertificate, CERT_KIND_AR, type VerifiedCert } from '@/lib/certificates'

export default function CertificatePage() {
  const params = useParams()
  const serial = String(params?.serial ?? '')
  const [cert, setCert] = useState<VerifiedCert | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!serial) return
    verifyCertificate(serial).then(c => { setCert(c); setLoading(false) })
  }, [serial])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#faf6ef]"><Loader2 size={28} className="animate-spin text-amber-600" /></div>
  }

  if (!cert?.found) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf6ef] px-6 text-center">
        <XCircle size={44} className="text-red-400 mb-3" />
        <h1 className="text-xl font-black text-zinc-800 mb-1">شهادة غير موجودة</h1>
        <p className="text-[14px] text-zinc-500">الرقم التسلسلي <b dir="ltr">{serial}</b> غير صحيح أو أُلغيت الشهادة.</p>
      </div>
    )
  }

  const kind = CERT_KIND_AR[cert.kind ?? 'custom'] ?? CERT_KIND_AR.custom

  return (
    <div className="min-h-screen bg-[#efe9dd] py-8 px-3 print:bg-white print:py-0">
      {/* actions (hidden on print) */}
      <div className="max-w-[820px] mx-auto flex items-center justify-between mb-4 print:hidden">
        <div className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          <ShieldCheck size={14} /> شهادة موثّقة من Inglizi.com
        </div>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-yellow-400 text-[13px] font-bold hover:bg-black">
          <Printer size={14} /> طباعة / حفظ PDF
        </button>
      </div>

      {/* the certificate */}
      <div className="max-w-[820px] mx-auto bg-white rounded-2xl print:rounded-none shadow-xl print:shadow-none overflow-hidden border-[10px] border-double border-amber-600/70 relative">
        {/* corner ornaments */}
        <div className="absolute top-3 right-3 w-16 h-16 border-t-4 border-r-4 border-amber-500/50 rounded-tr-xl" />
        <div className="absolute top-3 left-3 w-16 h-16 border-t-4 border-l-4 border-amber-500/50 rounded-tl-xl" />
        <div className="absolute bottom-3 right-3 w-16 h-16 border-b-4 border-r-4 border-amber-500/50 rounded-br-xl" />
        <div className="absolute bottom-3 left-3 w-16 h-16 border-b-4 border-l-4 border-amber-500/50 rounded-bl-xl" />

        <div className="px-8 sm:px-14 py-12 text-center relative">
          {/* brand */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-10 h-10 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black text-lg">In</span>
            <div className="text-right leading-tight">
              <div className="font-black text-[17px] text-zinc-900" dir="ltr">Inglizi.com</div>
              <div className="text-[10px] text-zinc-400 font-semibold">منصة تعلّم الإنجليزية</div>
            </div>
          </div>

          <div className="text-[13px] font-bold text-amber-700 tracking-[0.35em] mb-2">{kind.emoji} شهادة {kind.label}</div>
          <h1 className="text-[26px] sm:text-[32px] font-black text-zinc-900 leading-snug mb-6" dir="ltr">CERTIFICATE OF ACHIEVEMENT</h1>

          <p className="text-[14px] text-zinc-500 mb-2">تشهد منصة Inglizi.com بأن</p>
          <div className="text-[30px] sm:text-[38px] font-black text-zinc-900 mb-2">{cert.student_name}</div>
          <div className="w-40 h-px bg-gradient-to-l from-transparent via-amber-500 to-transparent mx-auto mb-5" />

          <p className="text-[16px] font-bold text-zinc-700 leading-relaxed max-w-lg mx-auto mb-2">{cert.title}</p>
          {cert.course_title && (
            <p className="text-[13px] text-zinc-500 mb-1">
              الدورة: <b>{cert.course_title}</b>{cert.course_level ? <span dir="ltr"> ({cert.course_level})</span> : null}
            </p>
          )}

          <div className="flex items-center justify-center gap-8 mt-8 mb-2 text-[12px] text-zinc-500">
            <div>
              <div className="font-black text-zinc-800" dir="ltr">{cert.date}</div>
              <div className="mt-0.5">تاريخ الإصدار</div>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-amber-500/60 flex items-center justify-center text-[22px]">🏅</div>
            <div>
              <div className="font-black text-zinc-800" dir="ltr">{cert.serial}</div>
              <div className="mt-0.5">الرقم التسلسلي</div>
            </div>
          </div>

          <p className="text-[10.5px] text-zinc-400 mt-6" dir="ltr">
            Verify at inglizi.com/certificate/{cert.serial}
          </p>
        </div>
      </div>
    </div>
  )
}
