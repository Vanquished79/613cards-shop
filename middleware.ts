import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith('/admin');

  // Admin Route Protection
  if (isAdminRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Maintenance Mode (Coming Soon) Logic
  const isMaintenanceMode = true; // process.env.MAINTENANCE_MODE === 'true';
  const isAdminUser = token?.role === 'ADMIN';
  
  const isExemptRoute = 
    pathname.startsWith('/coming-soon') || 
    pathname.startsWith('/login') || 
    pathname.startsWith('/register') || 
    pathname.startsWith('/api/auth') || 
    pathname.startsWith('/_next') || 
    pathname === '/logo.png' || 
    pathname === '/logo-transparent.png' || 
    pathname === '/favicon.ico';

  if (isMaintenanceMode && !isAdminUser && !isExemptRoute) {
    return NextResponse.redirect(new URL('/coming-soon', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
