import { NextResponse } from 'next/server';
import { locales } from './lib/i18n';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;
  console.log('Current pathname:', pathname);
  
  const pathnameHasLocale = Object.keys(locales).map(locale => `/${locale}`).some(
    (localePath) => pathname.startsWith(localePath) && (pathname === localePath || pathname.startsWith(localePath + '/'))
  );

  if (pathnameHasLocale) {
    console.log('Path already has locale:', pathname);
    return NextResponse.next();
  }

  const referer = request.headers.get('referer');
  let preferredLocale = 'en';

  if (referer) {
    const refererUrl = new URL(referer);
    const refererPathname = refererUrl.pathname;
    
    const localeFromReferer = Object.keys(locales).find(locale => 
      refererPathname.startsWith(`/${locale}/`) || refererPathname === `/${locale}`
    );
    
    if (localeFromReferer) {
      preferredLocale = localeFromReferer;
      console.log('Using locale from referer:', preferredLocale);
    }
  }

  if (preferredLocale === 'en' && !referer) {
    const acceptLanguage = request.headers.get('accept-language') || '';
    console.log('Accept-Language:', acceptLanguage);

    preferredLocale = acceptLanguage
      .split(',')
      .map((lang) => {
        const cleanLang = lang.split(';')[0].trim();
        if (cleanLang.includes('zh') && cleanLang !== 'zh-CN') {
          return 'zh-HK';
        }
        return cleanLang;
      })
      .find((lang) => Object.keys(locales).includes(lang)) || 'en';
  }

  console.log('Final preferred locale:', preferredLocale);


  if (preferredLocale === 'en') {
    console.log('English detected, rewriting to /en');
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    url.search = request.nextUrl.search;
    
    return NextResponse.rewrite(url);
  }

  const redirectUrl = new URL(`/${preferredLocale}${pathname}`, request.url);
  redirectUrl.search = request.nextUrl.search;
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    '/((?!api/|_next/|favicon.ico|ads.txt|robots.txt|sitemap|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
}; 