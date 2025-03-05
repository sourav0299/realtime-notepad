import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const restrictedPaths = ['/all-notepads', '/notepad/sourav']

  if (restrictedPaths.some(restrictedPath => path === restrictedPath)) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/all-notepads', '/notepad/sourav']
}