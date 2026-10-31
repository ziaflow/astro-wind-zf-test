import { defineMiddleware } from 'astro:middleware';
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
    console.error('Failed to fetch redirects from Sanity:', err);
    return cachedRedirects || [];
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  // 301 Redirect HTTP -> HTTPS (only in production)
  if (!import.meta.env.DEV) {
    const forwardedProto = context.request.headers.get('x-forwarded-proto');
    if (forwardedProto === 'http' || context.url.protocol === 'http:') {
      const httpsUrl = new URL(context.url.pathname + context.url.search, 'https://ziaflow.com');
      return context.redirect(httpsUrl.toString(), 301);
    }
  }

  const pathname = context.url.pathname.replace(/\/$/, '') || '/';

  // Rate limiting for public lead intake endpoint (max 50 requests/minute per IP)
  if (pathname === '/api/contact' && context.request.method === 'POST') {
    const { checkRateLimit, getClientIp } = await import('~/lib/rate-limiter');
    const ip = getClientIp(context.request);
    const { allowed, resetInSeconds } = checkRateLimit(ip, { maxRequests: 50, windowMs: 60_000 });
    if (!allowed) {
      return new Response(JSON.stringify({ message: 'Too many requests. Please wait before submitting again.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(resetInSeconds),
        },
      });
    }
  }

  // Skip static assets and internal requests
  if (pathname.startsWith('/_astro') || pathname.startsWith('/api') || pathname.startsWith('/favicon')) {
    return next();
  }

  // Built-in 301 Redirects for legacy routes, growth tools, and renamed URLs
  const builtInRedirects: Record<string, string> = {
    '/old-service-page': '/services/web-development',
    '/kairo-preview': '/',

    // Growth Tools
    '/local-visibility-check': '/growth-tools/local-visibility-check',
    '/website-project-estimator': '/growth-tools/website-project-estimator',
    '/lead-follow-up-assessment': '/growth-tools/lead-follow-up-assessment',
    '/software-stack-assessment': '/growth-tools/software-stack-assessment',
    '/website-conversion-checklist': '/growth-tools/website-conversion-checklist',

    // Blog post legacy slug variations
    '/web-development-in-2026-a-practical-guide-to-building-fast-secure-highconverting-websites':
      '/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites',
    '/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites':
      '/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites',
    '/web-development-in-2026-a-practical-guide-to-building-faster-safer-conversion-ready-websites':
      '/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites',
    '/blog/web-development-in-2026-a-practical-guide-to-building-fast-secure-highconverting-websites':
      '/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites',
    '/blog/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites':
      '/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites',
    '/blog/web-development-in-2026-a-practical-guide-to-building-faster-safer-conversion-ready-websites':
      '/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites',
    '/guide-to-web-development-2026':
      '/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites',
    '/2026-web-development-guide':
      '/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites',
    '/microsoft-ads-in-2026-the-complete-guide-to-advertising-beyond-google': '/services/ppc',

    // Legacy /blog/:slug routes mapping to root /:slug
    '/blog/google-local-service-ads-in-2025': '/google-local-service-ads-in-2025',
    '/blog/marketing-automation-for-arizona-service-businesses-save-time-increase-bookings':
      '/marketing-automation-for-arizona-service-businesses-save-time-increase-bookings',
    '/blog/reduce-bounce-rate-with-ai': '/reduce-bounce-rate-with-ai',
    '/blog/website-analysis-tasks': '/website-analysis-tasks',
    '/blog/website-conversion-checklist-for-phoenix-businesses': '/website-conversion-checklist-for-phoenix-businesses',
    '/blog/phoenix-commercial-hvac-lead-intake': '/phoenix-commercial-hvac-lead-intake',

    // Legacy Service & Sub-technology Slugs
    '/services/astro': '/services/web-development',
    '/services/react': '/services/web-development',
    '/services/wix': '/services/web-development',
    '/services/shopify': '/services/ecommerce',

    // Case Studies
    '/case-studies/phoenix-commercial-hvac-lead-intake': '/phoenix-commercial-hvac-lead-intake',
    '/case-studies/phoenix-commercial-hvac': '/phoenix-commercial-hvac-lead-intake',
    '/case-studies/scottsdale-dental-patient-intake-automation': '/case-studies',

    // Empty / Legacy Categories
    '/category/strategy': '/blog',
    '/category/tutorial': '/blog',

    // Posts archive
    '/posts': '/blog',
  };

  if (builtInRedirects[pathname]) {
    return context.redirect(builtInRedirects[pathname], 301);
  }

  const redirects = await getRedirects();
  const match = redirects.find((r) => r.from.replace(/\/$/, '') === pathname || r.from === pathname);

  if (match) {
    const status = match.isPermanent ? 301 : 302;
    return context.redirect(match.to, status);
  }

  return next();
});
