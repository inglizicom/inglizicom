'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CONTACT, PLANS, waLink } from '@/data/chatbot-knowledge'

type Msg = { role: 'user' | 'assistant'; content: string }

const STORAGE_KEY = 'inglizi.chat.v1'
const POPUP_DELAY_MS = 25000
const POPUP_DISMISSED_KEY = 'inglizi.chat.popup-dismissed'

const GREETING: Msg = {
  role: 'assistant',
  content:
    'مرحباً بك في إنجليزي.كوم 👋\nأنا هنا لمساعدتك. هل تريد معرفة المستويات والأسعار؟ أم لديك سؤال آخر؟',
}

// Tiny language detector for the proactive popup text
function uiLang(messages: Msg[]): 'ar' | 'fr' | 'en' {
  const text = messages.map((m) => m.content).join(' ')
  if (/[؀-ۿ]/.test(text)) return 'ar'
  if (/\b(je|tu|nous|vous|bonjour|merci|oui|non|prix|cours)\b/i.test(text)) return 'fr'
  if (/\b(hello|hi|price|course|level|thanks|need|want)\b/i.test(text)) return 'en'
  return 'ar'
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([GREETING])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Load persisted conversation
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Msg[]
        if (Array.isArray(saved) && saved.length > 0) setMessages(saved)
      }
    } catch { /* ignore */ }
  }, [])

  // Save on change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)) } catch { /* ignore */ }
  }, [messages])

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, busy, showPricing, open])

  // Proactive popup once per session
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(POPUP_DISMISSED_KEY)) return
    const t = window.setTimeout(() => {
      if (!open) setShowPopup(true)
    }, POPUP_DELAY_MS)
    return () => window.clearTimeout(t)
  }, [open])

  const dismissPopup = () => {
    setShowPopup(false)
    try { sessionStorage.setItem(POPUP_DISMISSED_KEY, '1') } catch { /* ignore */ }
  }

  const openChat = () => {
    setOpen(true)
    dismissPopup()
    setTimeout(() => inputRef.current?.focus(), 80)
  }

  const send = useCallback(async (raw?: string) => {
    const text = (raw ?? input).trim()
    if (!text || busy) return
    setInput('')
    setShowPricing(false)
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setBusy(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-12) }),
      })
      if (!res.ok) throw new Error(String(res.status))
      const data = await res.json()
      const reply: string = (data?.reply || '').trim()
      if (!reply) throw new Error('empty')
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch {
      const lang = uiLang(next)
      const fallback =
        lang === 'fr'
          ? `Désolé, problème technique. Contactez le professeur directement sur WhatsApp.`
          : lang === 'en'
          ? `Sorry, technical issue. Please reach the teacher on WhatsApp directly.`
          : `عذراً، حدث خلل تقني. تواصل مع الأستاذ مباشرة على واتساب وسيجاوبك بأسرع وقت.`
      setMessages([...next, { role: 'assistant', content: fallback }])
    } finally {
      setBusy(false)
    }
  }, [input, busy, messages])

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const resetChat = () => {
    setMessages([GREETING])
    setShowPricing(false)
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }

  const lang = uiLang(messages)
  const t = {
    title:    lang === 'fr' ? 'Assistant Inglizi'    : lang === 'en' ? 'Inglizi Assistant'  : 'مساعد إنجليزي',
    subtitle: lang === 'fr' ? 'Réponses instantanées'  : lang === 'en' ? 'Instant answers'   : 'إجابات فورية',
    pricing:  lang === 'fr' ? 'Tarifs'                 : lang === 'en' ? 'Pricing'           : 'الأسعار',
    enroll:   lang === 'fr' ? 'Je veux m\'inscrire'    : lang === 'en' ? 'I want to enroll'  : 'أريد التسجيل',
    speakTeacher: lang === 'fr' ? 'Parler au professeur' : lang === 'en' ? 'Talk to teacher' : 'تحدث مع الأستاذ',
    placeholder: lang === 'fr' ? 'Écrivez votre question…' : lang === 'en' ? 'Type your question…' : 'اكتب سؤالك هنا…',
    send: lang === 'fr' ? 'Envoyer' : lang === 'en' ? 'Send' : 'إرسال',
    typing: lang === 'fr' ? 'En train d\'écrire…' : lang === 'en' ? 'Typing…' : 'يكتب…',
    reset:  lang === 'fr' ? 'Réinitialiser' : lang === 'en' ? 'Reset chat' : 'محادثة جديدة',
    months: lang === 'fr' ? 'mois' : lang === 'en' ? 'months' : 'أشهر',
    poweredBy: lang === 'fr' ? 'Avec' : lang === 'en' ? 'Powered by' : 'بدعم من',
    popup1: lang === 'fr' ? 'Besoin d\'aide ?' : lang === 'en' ? 'Need help?' : 'هل تحتاج مساعدة؟',
    popup2: lang === 'fr' ? 'Je suis là si vous cherchez une info.' : lang === 'en' ? 'I\'m here if you can\'t find something.' : 'أنا هنا لمساعدتك إذا لم تجد ما تبحث عنه ✨',
  }
  const rtl = lang === 'ar'

  return (
    <>
      <style jsx>{`
        .fab { position: fixed; bottom: 24px; left: 24px; z-index: 9999; display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
        .fab-btn { width: 60px; height: 60px; border-radius: 999px; border: none; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; cursor: pointer; box-shadow: 0 10px 30px -8px rgba(217, 119, 6, 0.55), 0 0 0 4px rgba(255,255,255,0.85); display: flex; align-items: center; justify-content: center; font-size: 26px; transition: transform .15s ease; }
        .fab-btn:hover { transform: scale(1.05); }
        .fab-btn:active { transform: scale(0.98); }
        .fab-btn.is-online::after { content: ""; position: absolute; bottom: 4px; right: 4px; width: 12px; height: 12px; border-radius: 999px; background: #22c55e; border: 2px solid white; }

        .popup { position: relative; max-width: 280px; background: white; padding: 14px 16px; border-radius: 14px; box-shadow: 0 14px 30px -10px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(15, 23, 42, 0.06); cursor: pointer; font-family: 'Tajawal', system-ui, sans-serif; animation: slideUp .35s ease both; }
        .popup::after { content: ""; position: absolute; bottom: -8px; left: 22px; width: 16px; height: 16px; background: white; transform: rotate(45deg); box-shadow: 2px 2px 4px -1px rgba(0,0,0,.08); }
        .popup-title { font-weight: 800; color: #0f172a; font-size: 14px; margin-bottom: 4px; }
        .popup-text { color: #475569; font-size: 13px; line-height: 1.45; }
        .popup-close { position: absolute; top: 6px; right: 8px; border: none; background: transparent; color: #94a3b8; font-size: 16px; cursor: pointer; padding: 2px 6px; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .panel { position: fixed; bottom: 96px; left: 24px; width: min(92vw, 380px); max-height: min(85vh, 640px); background: #fff; border-radius: 20px; box-shadow: 0 30px 60px -20px rgba(15,23,42,.30), 0 0 0 1px rgba(15,23,42,.06); display: flex; flex-direction: column; overflow: hidden; z-index: 9999; font-family: 'Tajawal', system-ui, sans-serif; animation: slideUp .25s ease both; }
        .head { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 60%, #d97706 100%); color: white; padding: 16px 18px; display: flex; gap: 12px; align-items: center; }
        .avatar { width: 40px; height: 40px; border-radius: 999px; background: rgba(255,255,255,.18); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .head-text { flex: 1; min-width: 0; }
        .head-title { font-weight: 800; font-size: 15px; letter-spacing: -.01em; }
        .head-sub { font-size: 11px; color: rgba(255,255,255,.75); display: flex; align-items: center; gap: 5px; }
        .head-sub::before { content: ""; display: inline-block; width: 7px; height: 7px; border-radius: 999px; background: #4ade80; }
        .head-close { border: none; background: rgba(255,255,255,.16); color: white; width: 32px; height: 32px; border-radius: 999px; cursor: pointer; font-size: 14px; }
        .head-close:hover { background: rgba(255,255,255,.28); }

        .quick-bar { display: flex; gap: 6px; padding: 10px 12px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; flex-wrap: wrap; }
        .quick { flex: 1; min-width: 100px; border: 1px solid #e2e8f0; background: white; padding: 7px 10px; border-radius: 8px; font-size: 12px; font-weight: 700; color: #1e293b; cursor: pointer; transition: all .15s ease; display: flex; align-items: center; justify-content: center; gap: 5px; font-family: inherit; }
        .quick:hover { border-color: #d97706; color: #d97706; background: #fff7ed; }
        .quick.wa:hover { border-color: #22c55e; color: #16a34a; background: #f0fdf4; }

        .body { flex: 1; overflow-y: auto; padding: 14px 14px 4px; display: flex; flex-direction: column; gap: 10px; background: #fafafa; }
        .body::-webkit-scrollbar { width: 6px; }
        .body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }

        .msg { max-width: 85%; padding: 9px 13px; border-radius: 14px; font-size: 13.5px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; }
        .msg.user { background: linear-gradient(135deg, #1e40af, #1e3a8a); color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
        .msg.assistant { background: white; color: #0f172a; align-self: flex-start; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,.03); }
        .typing { display: flex; gap: 4px; padding: 4px 0; }
        .typing span { width: 6px; height: 6px; border-radius: 999px; background: #94a3b8; animation: bounce 1.2s infinite ease-in-out; }
        .typing span:nth-child(2) { animation-delay: .15s; }
        .typing span:nth-child(3) { animation-delay: .3s; }
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); opacity: .5; } 30% { transform: translateY(-5px); opacity: 1; } }

        .pricing-card { background: white; border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px 14px; align-self: flex-start; width: 90%; max-width: 320px; }
        .pricing-title { font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 8px; }
        .plan-row { display: flex; align-items: center; gap: 8px; padding: 8px 10px; margin-bottom: 6px; background: #f8fafc; border-radius: 10px; border-left: 3px solid var(--c, #d97706); font-size: 12px; }
        .plan-name { font-weight: 700; color: #0f172a; flex: 1; }
        .plan-level { color: #64748b; font-size: 10px; }
        .plan-price { font-weight: 800; color: var(--c, #d97706); font-family: 'DM Sans', sans-serif; }
        .plan-cta { display: block; margin-top: 4px; padding: 7px 10px; background: #25d366; color: white; text-decoration: none; border-radius: 8px; text-align: center; font-size: 12px; font-weight: 700; }
        .plan-cta:hover { background: #1da851; }

        .foot { padding: 10px 12px 12px; border-top: 1px solid #e2e8f0; background: white; display: flex; flex-direction: column; gap: 8px; }
        .input-row { display: flex; gap: 8px; align-items: flex-end; }
        .input-row textarea { flex: 1; resize: none; border: 1px solid #cbd5e1; border-radius: 12px; padding: 9px 12px; font-size: 13.5px; font-family: inherit; max-height: 100px; min-height: 38px; line-height: 1.4; outline: none; transition: border-color .15s ease; }
        .input-row textarea:focus { border-color: #d97706; box-shadow: 0 0 0 3px rgba(217,119,6,.12); }
        .send-btn { background: linear-gradient(135deg, #d97706, #b45309); color: white; border: none; padding: 0 14px; height: 38px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 13px; font-family: inherit; flex-shrink: 0; }
        .send-btn:disabled { opacity: .5; cursor: not-allowed; }
        .foot-meta { font-size: 10px; color: #94a3b8; display: flex; align-items: center; justify-content: space-between; }
        .foot-meta button { border: none; background: transparent; color: #94a3b8; font-size: 10px; cursor: pointer; padding: 0; font-family: inherit; }
        .foot-meta button:hover { color: #475569; text-decoration: underline; }

        @media (max-width: 480px) {
          .panel { left: 12px; right: 12px; bottom: 90px; width: auto; max-height: 80vh; }
          .fab { left: 16px; bottom: 16px; }
        }
      `}</style>

      {/* ── FAB + popup ── */}
      <div className="fab" dir={rtl ? 'rtl' : 'ltr'}>
        {showPopup && !open && (
          <div className="popup" onClick={openChat} role="button" tabIndex={0}>
            <button className="popup-close" onClick={(e) => { e.stopPropagation(); dismissPopup() }} aria-label="close">×</button>
            <div className="popup-title">{t.popup1}</div>
            <div className="popup-text">{t.popup2}</div>
          </div>
        )}
        {!open && (
          <button className="fab-btn is-online" onClick={openChat} aria-label="Open chat" style={{ position: 'relative' }}>
            💬
          </button>
        )}
      </div>

      {/* ── Panel ── */}
      {open && (
        <div className="panel" dir={rtl ? 'rtl' : 'ltr'}>
          <header className="head">
            <div className="avatar">🦉</div>
            <div className="head-text">
              <div className="head-title">{t.title}</div>
              <div className="head-sub">{t.subtitle}</div>
            </div>
            <button className="head-close" onClick={() => setOpen(false)} aria-label="close">✕</button>
          </header>

          <div className="quick-bar">
            <button className="quick" onClick={() => setShowPricing((v) => !v)}>💰 {t.enroll}</button>
            <a className="quick wa" href={waLink('مرحباً، عندي سؤال أو مشكلة وأحتاج المساعدة.')} target="_blank" rel="noopener noreferrer">📱 {t.speakTeacher}</a>
          </div>

          <div className="body">
            {messages.map((m, i) => (
              <div key={i} className={'msg ' + m.role}>{m.content}</div>
            ))}

            {showPricing && (
              <div className="pricing-card">
                <div className="pricing-title">💎 {t.pricing}</div>
                {PLANS.map((p, i) => {
                  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#d97706']
                  return (
                    <div key={p.id} className="plan-row" style={{ ['--c' as string]: colors[i] } as React.CSSProperties}>
                      <div style={{ flex: 1 }}>
                        <div className="plan-name">{p.name_ar} <span className="plan-level">· {p.level}</span></div>
                        <div className="plan-level">{p.duration}</div>
                      </div>
                      <div className="plan-price">{p.price_mad} {lang === 'ar' ? 'د.م' : 'MAD'}</div>
                    </div>
                  )
                })}
                <a className="plan-cta" href={waLink('مرحباً، أريد التسجيل. أرجو تزويدي بطرق الدفع المتاحة.')} target="_blank" rel="noopener noreferrer">
                  📱 {t.speakTeacher} → {CONTACT.whatsappDisplay}
                </a>
              </div>
            )}

            {busy && (
              <div className="msg assistant typing">
                <span></span><span></span><span></span>
              </div>
            )}
            <div ref={endRef}></div>
          </div>

          <div className="foot">
            <div className="input-row">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={t.placeholder}
                rows={1}
                disabled={busy}
              />
              <button className="send-btn" onClick={() => send()} disabled={busy || !input.trim()}>
                {busy ? '…' : t.send}
              </button>
            </div>
            <div className="foot-meta">
              <button onClick={resetChat}>↻ {t.reset}</button>
              <span>{t.poweredBy} <b style={{ color: '#d97706' }}>{CONTACT.site}</b></span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
