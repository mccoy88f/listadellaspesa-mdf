import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  // Estrai la lingua dal pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Se non c'è la lingua nel path, usa il middleware intl per reindirizzare
  if (!pathnameHasLocale && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    return intlMiddleware(request);
  }

  // Rimuovi la lingua dal pathname per i controlli di autenticazione
  let pathWithoutLocale = pathname;
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}`)) {
      pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
      break;
    }
  }

  // Route pubbliche (non richiedono autenticazione)
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.some(route => pathWithoutLocale === route || pathWithoutLocale.startsWith(route + '/'));

  // Se l'utente è autenticato e cerca di accedere a login/register, reindirizza alla dashboard
  if (session && isPublicRoute) {
    const locale = pathname.split('/')[1] || defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Se l'utente non è autenticato e cerca di accedere a route protette, reindirizza al login
  if (!session && !isPublicRoute && pathWithoutLocale !== '/') {
    const locale = pathname.split('/')[1] || defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // Applica il middleware intl
  return intlMiddleware(request);
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
