'use client'

import { Component, type ReactNode } from 'react'

/**
 * Catches render/runtime errors in the CRM. A very common one after a deploy is
 * a stale cached page trying to load old JS chunk hashes (ChunkLoadError) — for
 * that we reload once automatically. Everything else shows a clean recovery screen
 * instead of the generic "Application error" white page.
 */
export default class CrmErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(p: any) { super(p); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }

  componentDidCatch(err: any) {
    const msg = String(err?.name ?? '') + ' ' + String(err?.message ?? '')
    const isChunk = /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(msg)
    if (isChunk && typeof window !== 'undefined') {
      // Reload once to pick up the fresh build (guard against reload loops).
      try {
        if (!sessionStorage.getItem('crm_chunk_reload')) {
          sessionStorage.setItem('crm_chunk_reload', '1')
          window.location.reload()
          return
        }
      } catch {}
    }
    console.error('CRM error', err)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div dir="rtl" className="min-h-screen bg-[#f6f6f5] flex items-center justify-center p-4 text-center">
          <div className="max-w-sm">
            <div className="text-4xl mb-3">⚠️</div>
            <h1 className="text-zinc-900 font-black text-[18px] mb-2">حدث خطأ غير متوقع</h1>
            <p className="text-zinc-500 text-[13px] mb-4">أعد تحميل الصفحة. إذا استمرّ الخطأ، تواصل مع الدعم.</p>
            <button
              onClick={() => { try { sessionStorage.removeItem('crm_chunk_reload') } catch {}; location.reload() }}
              className="px-5 py-2.5 rounded-xl bg-yellow-400 text-black font-bold text-[14px]">
              إعادة تحميل
            </button>
          </div>
        </div>
      )
    }
    // Clear the reload guard on a healthy render.
    if (typeof window !== 'undefined') { try { sessionStorage.removeItem('crm_chunk_reload') } catch {} }
    return this.props.children
  }
}
