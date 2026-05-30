import { NextResponse, type NextRequest } from 'next/server'

/**
 * admin.inglizi.com — CRM middleware
 *
 * When a request arrives on the admin subdomain, the URL is internally
 * rewritten so the CRM pages are served at clean admin.inglizi.com paths.
 * The visitor's address bar never shows /sales — it stays admin.inglizi.com.
 *
 * Mapping:
 *   admin.inglizi.com/           → /sales        (CRM dashboard)
 *   admin.inglizi.com/leads      → /sales/leads
 *   admin.inglizi.com/today      → /sales/today
 *   admin.inglizi.com/students   → /sales/students
 *   admin.inglizi.com/payments   → /sales/payments
 *   admin.inglizi.com/renewals   → /sales/renewals
 *   admin.inglizi.com/revenue    → /sales/revenue
 *   admin.inglizi.com/support    → /sales/support
 *   admin.inglizi.com/analytics  → /admin/analytics  (founder)
 *   admin.inglizi.com/activity   → /admin/activity    (founder)
 *   admin.inglizi.com/settings   → /admin/settings    (founder)
 *   admin.inglizi.com/login      → /login
 */

/** CRM routes — mapped to their internal Next.js path */
const CRM_ROUTES: Record<string, string> = {
  '/':           '/sales',
  '/leads':      '/sales/leads',
  '/today':      '/sales/today',
  '/students':   '/sales/students',
  '/payments':   '/sales/payments',
  '/renewals':   '/sales/renewals',
  '/revenue':    '/sales/revenue',
  '/support':    '/sales/support',
  // Founder-only sections
  '/analytics':  '/admin/analytics',
  '/activity':   '/admin/activity',
  '/settings':   '/admin/settings',
}

export function middleware(request: NextRequest) {
  const host     = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  /* ── detect the admin subdomain ────────────────────────────
     Works in production (admin.inglizi.com) and locally
     via the ?_admin=1 override for testing. */
  const isAdmin =
    host === 'admin.inglizi.com' ||
    host.startsWith('admin.localhost') ||
    request.nextUrl.searchParams.get('_admin') === '1'

  if (!isAdmin) return NextResponse.next()

  /* ── auth pass-through ─────────────────────────────────────
     The login page and Next.js internals must reach their
     actual paths unchanged. */
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  /* ── already on an internal CRM path ───────────────────────
     (happens when Next.js server-components fetch sub-paths) */
  if (pathname.startsWith('/sales') || pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  /* ── rewrite to the matching internal path ─────────────────
     Exact match first, then prefix match for dynamic segments
     like /leads/[id] or /support/[id]. */
  const exact = CRM_ROUTES[pathname]
  if (exact) {
    const url = request.nextUrl.clone()
    url.pathname = exact
    return NextResponse.rewrite(url)
  }

  // Prefix match — e.g. /leads?add=1 or /support/123
  for (const [prefix, target] of Object.entries(CRM_ROUTES)) {
    if (prefix !== '/' && pathname.startsWith(prefix)) {
      const url = request.nextUrl.clone()
      url.pathname = target + pathname.slice(prefix.length)
      return NextResponse.rewrite(url)
    }
  }

  // Unknown path on admin subdomain → rewrite to CRM dashboard
  const fallback = request.nextUrl.clone()
  fallback.pathname = '/sales'
  return NextResponse.rewrite(fallback)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
