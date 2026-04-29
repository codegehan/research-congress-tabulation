import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/app/lib/jwt';

const protectedRoutes = ['/dashboard', '/admin'];

export async function middleware(request: NextRequest) {
  const isProtectedPage = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedPage) {
    const token = request.cookies.get('token')?.value;
    const payload = token ? await verifyToken(token) : null;

    if (!payload) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};