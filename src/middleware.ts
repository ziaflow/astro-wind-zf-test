import { defineMiddleware } from 'astro:middleware';
import { resolveLegacyRedirect } from './config/redirects';
import { sanityClient } from 'sanity:client';

interface SanityRedirect {
  from: string;
  to: string;
  isPermanent: boolean;
}

let cachedRedirects: SanityRedirect[] | null = null;
let lastFetched = 0;
const CACHE_TTL_MS = 60_000; // Cache redirects in memory for 60 seconds

async function getRedirects(): Promise<SanityRedirect[]> {
  const now = Date.now();
  if (cachedRedirects && now - lastFetched < CACHE_TTL_MS) {
    return cachedRedirects;
  }

  try {
    const redirects = await sanityClient.fetch<SanityRedirect[]>(
      `*[_type == "redirect" && defined(from) && defined(to)]{ from, to, isPermanent }`
    );
    cachedRedirects = redirects;
    lastFetched = now;
    return redirects;
  } catch (err) {
    cachedRedirects = [];
    lastFetched = now;
    console.error('Failed to fetch redirects from Sanity:', err);
    return [];
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  // 301 Redirect HTTP -> HTTPS and www -> non-www (only in production)
  if (!import.meta.env.DEV) {
    const forwardedProto = context.request.headers.get('x-forwarded-proto');
    const host = context.request.headers.get('host') || context.url.hostname;
    const isHttp = forwardedProto === 'http' || context.url.protocol === 'http:';
    const isWww = host === 'www.ziaflow.com' || context.url.hostname === 'www.ziaflow.com';

    if (isHttp || isWww) {
      const httpsUrl = new URL(context.url.pathname + context.url.search, 'https://ziaflow.com');
      return context.redirect(httpsUrl.toString(), 301);
    }
  }

  const pathname = context.url.pathname.replace(/\/$/, '') || '/';

  // Rate limiting for public lead intake endpoint (max 50 requests/minute per IP)
  if (pathname === '/api/contact' && context.request.method === 'POST') {
    const { checkRateLimit, getClientIp } = await import('~/lib/rate-limiter');
    const ip = getClientIp(context.request);
    const { allowed, resetInSeconds } = checkRateLimit(ip, {
      maxRequests: 50,
      windowMs: 60_000,
    });
    if (!allowed) {
      return new Response(
        JSON.stringify({
          message: 'Too many requests. Please wait before submitting again.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(resetInSeconds),
          },
        }
      );
    }
  }

  // Skip static assets and internal requests
  if (pathname.startsWith('/_astro') || pathname.startsWith('/api') || pathname.startsWith('/favicon')) {
    return next();
  }

  // Immediate 410 Gone for legacy spam / Network Solutions exploits
  if (pathname.includes('netsoltrademark.php') || pathname.includes('__media__')) {
    return new Response('Gone', { status: 410 });
  }

  // Legacy WordPress date archives (/2021/..., /2022/...)
  if (/^\/\d{4}\/\d{2}\/\d{2}\//.test(pathname)) {
    return context.redirect('/blog' + context.url.search, 301);
  }

  // Normalize legacy WordPress query parameters (?p=1, ?page_id=2)
  if (context.url.searchParams.has('p') || context.url.searchParams.has('page_id')) {
    return context.redirect('/', 301);
  }

  const legacyDestination = resolveLegacyRedirect(pathname, context.url.search);
  if (legacyDestination) {
    return context.redirect(legacyDestination, 301);
  }

  const redirects = await getRedirects();
  const match = redirects.find((r) => r.from.replace(/\/$/, '') === pathname || r.from === pathname);

  if (match) {
    const status = match.isPermanent ? 301 : 302;
    return context.redirect(match.to, status);
  }

  const response = await next();
  if (!response.headers.has('Document-Policy')) {
    response.headers.set('Document-Policy', 'js-profiling');
  }
  return response;
});
