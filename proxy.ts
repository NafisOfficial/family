import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, getAuthToken } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes that don't need authentication
  const publicRoutes = ['/login', '/register', '/api/auth/login', '/api/auth/register'];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Protected routes check
  if (pathname.startsWith('/(root)') || pathname.startsWith('/app/(root)')) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = verifyToken(token);

    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
