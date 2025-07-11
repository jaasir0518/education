// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const url = request.nextUrl.clone()
  
  // Define protected routes
  const protectedRoutes = ['/home', '/dashboard', '/profile', '/courses']
  const authRoutes = ['/auth/login', '/auth/register']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    url.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some(route => 
    url.pathname.startsWith(route)
  )
  const isRootRoute = url.pathname === '/'

  // If user is authenticated and on root route, redirect to home
  if (session && isRootRoute) {
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  // If user is not authenticated and trying to access protected route
  if (!session && isProtectedRoute) {
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // If user is authenticated and trying to access auth pages
  if (session && isAuthRoute) {
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}