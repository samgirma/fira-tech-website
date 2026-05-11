import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookie, verifyToken } from './lib/jwt'

export async function middleware(req: NextRequest) {
  // Only protect admin routes
  if (req.nextUrl.pathname.startsWith('/api/admin/')) {
    const token = getTokenFromCookie(req)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    // Token is valid, allow request to proceed
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.id)
    response.headers.set('x-user-email', payload.email)
    return response
  }
  
  // For non-admin routes, continue normally
  return NextResponse.next()
}

export const config = {
  matcher: '/api/admin/:path*'
}
