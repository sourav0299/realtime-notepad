import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const restrictedPaths = ['/all-notepads', '/notepad/sourav']
  const authCookie = request.cookies.get('auth')?.value
  const expectedCookie = process.env.NEXT_PUBLIC_COOKIE

  if (restrictedPaths.some(restrictedPath => path === restrictedPath)) {
    if (!authCookie || authCookie !== expectedCookie) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/all-notepads', '/notepad/sourav']
}