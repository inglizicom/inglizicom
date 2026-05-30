import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware for admin.inglizi.com
 *
 * When a request comes in on the admin subdomain, redirect the root
 * to /sales (the CRM workspace). Requests already targeting /sales/*
 * or /admin/* are let through untouched.
 *
 * DOMAIN SETUP (Vercel + Hostinger DNS)
 * -------------------------------------
 * 1. In Vercel → Project → Settings → Domains:
 *    Add "admin.inglizi.com" and set DNS mode to "CNAME".
 * 2. In Hostinger DNS Manager:
 *    Add a CNAME record:  admin  →  cname.vercel-dns.com
 * 3. Deploy — done. Both inglizi.com and admin.inglizi.com now
 *    serve the same Next.js app, and this middleware routes the
 *    admin subdomain to the CRM workspace.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  // Detect the admin subdomain (works in both prod and local preview)
  const isAdminSubdomain =
    host === 'admin.inglizi.com' ||
    host.startsWith('admin.') ||
    request.nextUrl.searchParams.get('_admin') === '1'  // dev override: ?_admin=1

  if (!isAdminSubdomain) return NextResponse.next()

  // Already inside the CRM sections — pass through.
  if (pathname.startsWith('/sales') || pathname.startsWith('/admin') || pathname.startsWith('/login')) {
    return NextResponse.next()
  }

  // Root or any unmatched path → redirect to the sales workspace.
  const url = request.nextUrl.clone()
  url.pathname = '/sales'
  return NextResponse.redirect(url, 308)
}

export const config = {
  // Run on all paths except static files and API routes.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
