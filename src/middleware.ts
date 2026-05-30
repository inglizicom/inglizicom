import { NextResponse, type NextRequest } from 'next/server'

/**
 * admin.inglizi.com — CRM middleware (rewrite, not redirect)
 *
 * Requests on admin.inglizi.com are internally rewritten to their
 * /sales/* equivalents. The browser URL stays clean (no /sales prefix).
 *
 *   admin.inglizi.com/          → /sales        (CRM dashboard)
 *   admin.inglizi.com/login     → /sales/login  (CRM login — email/pass)
 *   admin.inglizi.com/leads     → /sales/leads
 *   admin.inglizi.com/today     → /sales/today
 *   admin.inglizi.com/students  → /sales/students
 *   admin.inglizi.com/payments  → /sales/payments
 *   admin.inglizi.com/renewals  → /sales/renewals
 *   admin.inglizi.com/revenue   → /sales/revenue
 *   admin.inglizi.com/support   → /sales/support
 *   admin.inglizi.com/analytics → /admin/analytics  (founder)
 *   admin.inglizi.com/activity  → /admin/activity    (founder)
 *   admin.inglizi.com/settings  → /admin/settings    (founder)
 *   admin.inglizi.com/auth/*    → /auth/*  (Supabase auth callbacks)
 */

const CRM_ROUTES: Record<string, string> = {
  '/':           '/sales',
  '/login':      '/sales/login',
  '/leads':      '/sales/leads',
  '/today':      '/sales/today',
  '/students':   '/sales/students',
  '/payments':   '/sales/payments',
  '/renewals':   '/sales/renewals',
  '/revenue':    '/sales/revenue',
  '/support':    '/sales/support',
  '/analytics':  '/admin/analytics',
  '/activity':   '/admin/activity',
  '/settings':   '/admin/settings',
}

export function middleware(request: NextRequest) {
  const host     = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  const isAdmin =
    host === 'admin.inglizi.com' ||
    host.startsWith('admin.localhost') ||
    request.nextUrl.searchParams.get('_admin') === '1'

  if (!isAdmin) return NextResponse.next()

  // Auth callbacks and Next.js internals pass through unchanged
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  // Already on an internal CRM path (happens during server-component fetches)
  if (pathname.startsWith('/sales') || pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Exact match
  const exact = CRM_ROUTES[pathname]
  if (exact) {
    const url = request.nextUrl.clone()
    url.pathname = exact
    return NextResponse.rewrite(url)
  }

  // Prefix match for dynamic sub-paths (/leads?add=1, /support/123, etc.)
  for (const [prefix, target] of Object.entries(CRM_ROUTES)) {
    if (prefix !== '/' && pathname.startsWith(prefix + '/')) {
      const url = request.nextUrl.clone()
      url.pathname = target + pathname.slice(prefix.length)
      return NextResponse.rewrite(url)
    }
  }

  // Fallback: unknown path → CRM dashboard
  const fallback = request.nextUrl.clone()
  fallback.pathname = '/sales'
  return NextResponse.rewrite(fallback)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
