
import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard');
  const isLoginRoute = req.nextUrl.pathname === '/login';

  console.log("Middleware - session:", session);

  // ❌ فقط امنع غير المسجلين من دخول /dashboard
  if (isDashboardRoute && !session && !isLoginRoute) {
    // return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
