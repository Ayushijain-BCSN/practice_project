import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // 1. Protect Administrative Routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (pathname === '/admin-login') return NextResponse.next();

    if (!token) {
      return pathname.startsWith('/api') 
        ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        : NextResponse.redirect(new URL('/admin-login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      if (payload.role !== 'admin') {
        return pathname.startsWith('/api')
          ? NextResponse.json({ error: 'Forbidden' }, { status: 403 })
          : NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (error) {
      return pathname.startsWith('/api')
        ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        : NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }

  // 2. Protect Standard User Dashboard & APIs
  const isDashboard = pathname.startsWith('/dashboard');
  const isUserApi = pathname.startsWith('/api/') && !pathname.startsWith('/api/auth') && !pathname.startsWith('/api/admin');

  if (isDashboard || isUserApi) {
    if (!token) {
      return isUserApi
        ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        : NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      await jwtVerify(token, secret);
      // All valid tokens (admin or user) can access dashboard for now
      // but specific user data access is handled in API logic
    } catch (error) {
      return isUserApi
        ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        : NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Matchers for optimization
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/user/:path*',
    '/api/scores/:path*',
    '/api/subscription/:path*'
  ],
};
