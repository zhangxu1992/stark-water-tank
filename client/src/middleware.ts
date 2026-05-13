import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    '/',
    '/(en|zh|es|fr|de|ar|pt|ru|ja|ko)/:path*',
    '/((?!api|_next|_vercel|admin|uploads|favicon.ico|sitemap|robots).*)',
  ],
};
