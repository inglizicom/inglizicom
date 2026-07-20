'use client'

/**
 * Public certificate — /certificate/[serial]      (?print=1 → auto-opens print)
 *
 * A fixed A4-LANDSCAPE canvas (1123×794px ≈ 297×210mm) that scales to fit any
 * screen and prints pixel-perfect: @page landscape, zero margins, exact colors.
 * Anyone with the serial can view/verify; data comes live from certificate_verify().
 */

import { Suspense, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Loader2, Printer, ShieldCheck, XCircle } from 'lucide-react'
import { verifyCertificate, CERT_KIND_AR, type VerifiedCert } from '@/lib/certificates'

const W = 1123 // px at 96dpi = 297mm
const H = 794  // px at 96dpi = 210mm

export default function CertificatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#10162e]" />}>
      <CertificateInner />
    </Suspense>
  )
}

function CertificateInner() {
  const params = useParams()
  const sp = useSearchParams()
  const serial = String(params?.serial ?? '')
  const wantPrint = sp.get('print') === '1'

  const [cert, setCert] = useState<VerifiedCert | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrReady, setQrReady] = useState(false)
  const [scale, setScale] = useState(0.35)
  const wrapRef = useRef<HTMLDivElement>(null)
  const printed = useRef(false)

  useEffect(() => {
    if (!serial) return
    verifyCertificate(serial).then(c => { setCert(c); setLoading(false) })
  }, [serial])

  /* fit the fixed canvas to the viewport */
  useEffect(() => {
    const compute = () => {
      const w = wrapRef.current?.clientWidth ?? window.innerWidth
      setScale(Math.min(1, (w - 8) / W))
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [cert])

  /* auto-print: wait for the QR + fonts so nothing prints half-loaded */
  useEffect(() => {
    if (!wantPrint || !cert?.found || printed.current) return
    printed.current = true
    let t: ReturnType<typeof setTimeout>
    const go = () => (document as any).fonts?.ready
      ? (document as any).fonts.ready.then(() => { t = setTimeout(() => window.print(), 300) })
      : (t = setTimeout(() => window.print(), 600))
    if (qrReady) go()
    else t = setTimeout(go, 2200) // QR never loaded → print anyway
    return () => clearTimeout(t)
  }, [wantPrint, cert, qrReady])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#10162e]"><Loader2 size={28} className="animate-spin text-amber-400" /></div>
  }
  if (!cert?.found) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#10162e] px-6 text-center">
        <XCircle size={44} className="text-rose-400 mb-3" />
        <h1 className="text-xl font-black text-white mb-1">شهادة غير موجودة</h1>
        <p className="text-[14px] text-slate-400">الرقم التسلسلي <b dir="ltr">{serial}</b> غير صحيح أو أُلغيت الشهادة.</p>
      </div>
    )
  }

  const kind = CERT_KIND_AR[cert.kind ?? 'custom'] ?? CERT_KIND_AR.custom
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&color=1c2340&bgcolor=fdfaf1&data=${encodeURIComponent(`https://inglizi.com/certificate/${cert.serial}`)}`
  const dateAr = cert.date ? new Date(cert.date + 'T12:00:00').toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' }) : cert.date

  return (
    <div className="min-h-screen bg-[#10162e] py-6 px-2 print:bg-white print:p-0 print:min-h-0">

      {/* screen-only action bar */}
      <div className="print-hide max-w-[1123px] mx-auto flex items-center justify-between gap-2 mb-4 px-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full">
          <ShieldCheck size={14} /> شهادة موثّقة من Inglizi.com
        </div>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-black text-[13px] font-black hover:bg-amber-300 shadow-lg shadow-amber-500/20">
          <Printer size={15} /> طباعة / حفظ PDF
        </button>
      </div>

      {/* scale-to-fit stage */}
      <div ref={wrapRef} className="cert-stage relative mx-auto max-w-[1123px]" style={{ height: H * scale }}>
        <div className="certA" dir="rtl"
          style={{ transform: `translateX(50%) scale(${scale})` }}>

          {/* ── paper + watermark ── */}
          <div className="abs-fill" style={{ background: 'radial-gradient(ellipse at 50% 38%, #fffdf7 0%, #fbf5e6 58%, #f3e9d2 100%)' }} />
          <div className="abs-fill flex items-center justify-center" style={{ opacity: 0.05 }}>
            <div style={{
              width: 460, height: 460, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '14px solid #1c2340', color: '#1c2340', fontFamily: 'Georgia, serif', fontWeight: 800, fontSize: 210,
            }}>In</div>
          </div>

          {/* ── gold frame ── */}
          <div className="abs-fill" style={{ inset: 18, border: '3px solid #b98a2e', borderRadius: 6 }} />
          <div className="abs-fill" style={{ inset: 26, border: '1px solid #d9b968', borderRadius: 4 }} />
          <div className="abs-fill" style={{ inset: 34, border: '1px solid rgba(28,35,64,.25)', borderRadius: 3 }} />
          {/* corner ornaments (gold L-brackets) */}
          {([
            { pos: { top: 6, right: 6 },    rot: 90 },
            { pos: { top: 6, left: 6 },     rot: 0 },
            { pos: { bottom: 6, right: 6 }, rot: 180 },
            { pos: { bottom: 6, left: 6 },  rot: -90 },
          ] as { pos: React.CSSProperties; rot: number }[]).map((c, i) => (
            <div key={i} style={{
              position: 'absolute', width: 74, height: 74, ...c.pos,
              background: 'conic-gradient(from 45deg, #b98a2e, #e8cf8a, #b98a2e, #8a6420, #e8cf8a, #b98a2e)',
              clipPath: 'polygon(0 0, 100% 0, 100% 18%, 18% 18%, 18% 100%, 0 100%)',
              transform: `rotate(${c.rot}deg)`, borderRadius: 4,
            }} />
          ))}

          {/* ── content ── */}
          <div className="relative flex flex-col items-center text-center" style={{ padding: '52px 90px 42px', height: '100%' }}>

            {/* brand */}
            <div className="flex items-center gap-3">
              <div style={{
                width: 46, height: 46, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #e8cf8a 0%, #c79a35 45%, #8a6420 100%)',
                color: '#171e38', fontFamily: 'Georgia, serif', fontWeight: 800, fontSize: 22,
                boxShadow: '0 2px 8px rgba(138,100,32,.35)',
              }}>In</div>
              <div className="text-right">
                <div dir="ltr" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 19, letterSpacing: '0.12em', color: '#1c2340' }}>INGLIZI.COM</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#8a6420', letterSpacing: '0.06em' }}>أكاديمية تعليم اللغة الإنجليزية</div>
              </div>
            </div>

            {/* rule ornament */}
            <Flourish style={{ marginTop: 18 }} />

            {/* title */}
            <div dir="ltr" style={{
              fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 40, fontWeight: 700, color: '#1c2340',
              letterSpacing: '0.22em', marginTop: 10, lineHeight: 1.1,
            }}>CERTIFICATE</div>
            <div dir="ltr" style={{
              fontFamily: 'Georgia, serif', fontSize: 14, color: '#8a6420', letterSpacing: '0.55em', marginTop: 4, fontWeight: 600,
            }}>OF ACHIEVEMENT</div>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: '#b98a2e', marginTop: 8 }}>{kind.emoji} شهادة {kind.label}</div>

            {/* recipient */}
            <div style={{ fontSize: 14, color: '#5a5f74', marginTop: 20 }}>تُمنح هذه الشهادة بكل فخر إلى</div>
            <div style={{
              fontFamily: "'Tajawal', sans-serif", fontWeight: 900, fontSize: 52, color: '#141a33',
              lineHeight: 1.25, marginTop: 4, maxWidth: 780,
            }}>{cert.student_name}</div>
            <div style={{
              width: 300, height: 3, marginTop: 2, borderRadius: 2,
              background: 'linear-gradient(to left, transparent, #b98a2e 25%, #e8cf8a 50%, #b98a2e 75%, transparent)',
            }} />

            {/* achievement */}
            <div style={{ fontSize: 19, fontWeight: 700, color: '#31384f', marginTop: 16, maxWidth: 720, lineHeight: 1.55 }}>
              {cert.title}
            </div>
            {cert.course_title && (
              <div style={{
                marginTop: 10, fontSize: 13.5, fontWeight: 800, color: '#1c2340',
                background: 'rgba(185,138,46,.12)', border: '1px solid rgba(185,138,46,.45)',
                borderRadius: 999, padding: '5px 18px',
              }}>
                📘 {cert.course_title}{cert.course_level ? <span dir="ltr"> — {cert.course_level}</span> : null}
              </div>
            )}

            {/* footer: date | seal | signature — pushed to the bottom */}
            <div className="mt-auto w-full flex items-end justify-between" style={{ paddingTop: 18 }}>
              {/* date + serial + QR */}
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="تحقق" width={84} height={84} onLoad={() => setQrReady(true)}
                  style={{ width: 84, height: 84, borderRadius: 8, border: '1px solid rgba(28,35,64,.2)', padding: 5, background: '#fdfaf1' }} />
                <div className="text-right">
                  <div style={{ fontSize: 11, color: '#8a8fa3', fontWeight: 700 }}>تاريخ الإصدار</div>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: '#1c2340' }}>{dateAr}</div>
                  <div style={{ fontSize: 11, color: '#8a8fa3', fontWeight: 700, marginTop: 6 }}>الرقم التسلسلي</div>
                  <div dir="ltr" style={{ fontSize: 13.5, fontWeight: 800, color: '#1c2340', fontFamily: "'Outfit', monospace", letterSpacing: '0.06em' }}>{cert.serial}</div>
                </div>
              </div>

              {/* seal */}
              <div className="flex flex-col items-center" style={{ transform: 'translateY(6px)' }}>
                <div style={{
                  width: 108, height: 108, borderRadius: '50%', position: 'relative',
                  background: 'radial-gradient(circle at 32% 28%, #f2dfae 0%, #d9b25a 38%, #b98a2e 68%, #8a6420 100%)',
                  boxShadow: '0 3px 10px rgba(138,100,32,.4), inset 0 0 0 4px rgba(255,255,255,.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 86, height: 86, borderRadius: '50%', border: '2px dashed rgba(23,30,56,.55)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#171e38',
                  }}>
                    <span style={{ fontSize: 22, lineHeight: 1 }}>★</span>
                    <span dir="ltr" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 12.5, letterSpacing: '0.08em' }}>INGLIZI</span>
                    <span dir="ltr" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 7.5, letterSpacing: '0.2em' }}>CERTIFIED</span>
                  </div>
                </div>
              </div>

              {/* signature */}
              <div className="flex flex-col items-center" style={{ minWidth: 220 }}>
                <div dir="ltr" style={{
                  fontFamily: '"Brush Script MT", "Snell Roundhand", "Segoe Script", cursive',
                  fontSize: 34, color: '#1c2340', lineHeight: 1, transform: 'rotate(-3deg)',
                }}>Hamza Kasraoui</div>
                <div style={{ width: 210, height: 1.5, background: '#1c2340', opacity: 0.65, marginTop: 6 }} />
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1c2340', marginTop: 6 }}>الأستاذ حمزة القصراوي</div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: '#8a8fa3' }}>المؤسس والمدرب الرئيسي — Inglizi.com</div>
              </div>
            </div>

            {/* verify strip */}
            <div dir="ltr" style={{ fontSize: 10, color: '#9aa0b4', marginTop: 14, letterSpacing: '0.04em' }}>
              Verify this certificate at <b style={{ color: '#8a6420' }}>inglizi.com/certificate/{cert.serial}</b>
            </div>
          </div>
        </div>
      </div>

      {/* screen hint */}
      <p className="print-hide text-center text-[11.5px] text-slate-500 mt-4">
        💡 عند الطباعة اختر الاتجاه <b className="text-slate-300">أفقي (Landscape)</b> وفعّل «طباعة الخلفيات» إن لم تظهر الألوان.
      </p>

      {/* certificate print + layout engine */}
      <style>{`
        .certA {
          position: absolute; top: 0; right: 50%;
          width: ${W}px; height: ${H}px;
          transform-origin: top center;
          overflow: hidden; border-radius: 10px;
          box-shadow: 0 24px 70px rgba(0,0,0,.5);
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
        }
        .abs-fill { position: absolute; inset: 0; }
        @page { size: A4 landscape; margin: 0; }
        @media print {
          html, body { background: #fff !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-hide { display: none !important; }
          .cert-stage { height: auto !important; max-width: none !important; margin: 0 !important; }
          .certA {
            position: fixed; top: 0; left: 0; right: auto;
            width: 297mm; height: 210mm;
            transform: none !important;
            border-radius: 0; box-shadow: none;
          }
        }
      `}</style>
    </div>
  )
}

function Flourish({ style }: { style?: React.CSSProperties }) {
  return (
    <div className="flex items-center gap-2.5" style={style}>
      <div style={{ width: 120, height: 1.5, background: 'linear-gradient(to right, transparent, #b98a2e)' }} />
      <span style={{ color: '#b98a2e', fontSize: 13 }}>❖</span>
      <div style={{ width: 120, height: 1.5, background: 'linear-gradient(to left, transparent, #b98a2e)' }} />
    </div>
  )
}
