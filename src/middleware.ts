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
  const pathname = context.url.pathname.replace(/\/$/, '') || '/';

  // Skip static assets and internal requests
  if (
    pathname.startsWith('/_astro') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon')
  ) {
    return next();
  }

  const redirects = await getRedirects();
  const match = redirects.find(
    (r) => r.from.replace(/\/$/, '') === pathname || r.from === pathname
  );

  if (match) {
    const status = match.isPermanent ? 301 : 302;
    return context.redirect(match.to, status);
  }

  return next();
});
