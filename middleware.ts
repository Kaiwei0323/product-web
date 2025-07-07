import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Block access to any CVS-related paths
  if (pathname.startsWith('/CVS/')) {
    return NextResponse.redirect(new URL('/404', request.url))
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/CVS/:path*', '/_next/static/:path*'],
}
