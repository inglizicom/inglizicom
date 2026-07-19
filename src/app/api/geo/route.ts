import { NextResponse } from 'next/server'

/* Returns the visitor's ISO-3166 alpha-2 country code from Vercel's edge
   header — used for GCC currency display and CRM lead country capture. */
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const country = (req.headers.get('x-vercel-ip-country') || '').toUpperCase() || null
  return NextResponse.json({ country })
}
