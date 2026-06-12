import { NextResponse, type NextRequest } from 'next/server'

/**
 * admin.inglizi.com — CRM routing middleware
 *
 * On the admin subdomain every request is internally rewritten so the
 * CRM pages serve at clean paths. The browser URL never shows /sales.
 *
 * UNAUTHENTICATED flow (fixed):
 *   1. admin.inglizi.com/          → rewrite → /sales (StaffGuard runs)
 *   2. Not signed in               → StaffGuard → router.replace('/crm-login')
 *   3. admin.inglizi.com/crm-login → rewrite → /crm-login  ← unprotected ✓
 *   4. Enter code → sign in        → router.replace('/sales')
 *   5. admin.inglizi.com/sales     → passes through → CRM dashboard ✓
 */

const ADMIN_ROUTES: Record<string, string> = {
  '/':            '/sales',
  '/crm-login':   '/crm-login',   // CRM access gate — unprotected
  '/dashboard':   '/sales/dashboard',
  '/workspace':   '/sales/workspace',
  '/verify':      '/sales/verify',
  '/courses':     '/sales/courses',
  '/announcements': '/sales/announcements',
  '/gamification': '/sales/gamification',
  '/submissions': '/sales/submissions',
  '/templates':   '/sales/templates',
  '/leads':       '/sales/leads',
  '/today':       '/sales/today',
  '/students':    '/sales/students',
  '/payments':    '/sales/payments',
  '/renewals':    '/sales/renewals',
  '/revenue':     '/sales/revenue',
  '/support':     '/sales/support',
  '/analytics':   '/admin/analytics',
  '/activity':    '/admin/activity',
  '/settings':    '/admin/settings',
}

export function middleware(request: NextRequest) {
  const host     = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  // ── Student portal subdomain ──────────────────────────────
  // student.inglizi.com (also space./my. as aliases) → /student-space
  const isStudent =
    host === 'student.inglizi.com' ||
    host === 'space.inglizi.com' ||
    host === 'my.inglizi.com' ||
    host.startsWith('student.localhost') ||
    request.nextUrl.searchParams.get('_student') === '1'

  if (isStudent) {
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/student-space')
    ) {
      return NextResponse.next()
    }
    const url = request.nextUrl.clone()
    url.pathname = '/student-space'
    return NextResponse.rewrite(url)
  }

  const isAdmin =
    host === 'admin.inglizi.com' ||
    host.startsWith('admin.localhost') ||
    request.nextUrl.searchParams.get('_admin') === '1'

  if (!isAdmin) return NextResponse.next()

  // Next.js internals + auth callbacks pass through unchanged
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth')
  ) {
    return NextResponse.next()
  }

  // Already on an internal CRM path — pass through
  if (pathname.startsWith('/sales') || pathname.startsWith('/admin') || pathname.startsWith('/crm-login')) {
    return NextResponse.next()
  }

  // Exact match in route table
  const target = ADMIN_ROUTES[pathname]
  if (target) {
    const url = request.nextUrl.clone()
    url.pathname = target
    return NextResponse.rewrite(url)
  }

  // Prefix match for dynamic sub-paths (/leads?add=1, /support/123, etc.)
  for (const [prefix, dest] of Object.entries(ADMIN_ROUTES)) {
    if (prefix.length > 1 && pathname.startsWith(prefix + '/')) {
      const url = request.nextUrl.clone()
      url.pathname = dest + pathname.slice(prefix.length)
      return NextResponse.rewrite(url)
    }
  }

  // Unknown path → CRM dashboard
  const url = request.nextUrl.clone()
  url.pathname = '/sales'
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
