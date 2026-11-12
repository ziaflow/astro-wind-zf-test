/** Legacy URLs shared by Astro build redirects and request middleware. */
export const LEGACY_REDIRECTS: Record<string, string> = {
  '/old-service-page': '/services/web-development',
  '/kairo-preview': '/',

  // Growth Tools
  '/local-visibility-check': '/growth-tools/local-visibility-check',
  '/website-project-estimator': '/growth-tools/website-project-estimator',
  '/lead-follow-up-assessment': '/growth-tools/lead-follow-up-assessment',
  '/software-stack-assessment': '/growth-tools/software-stack-assessment',
  '/website-conversion-checklist': '/growth-tools/website-conversion-checklist',

  // Article URLs observed returning 404 in production
  '/posts/microsoft-ads-complete-guide-2026': '/services/ppc',
  '/microsoft-ads-complete-guide-2026': '/services/ppc',
  '/blog/microsoft-ads-complete-guide-2026': '/services/ppc',
  '/posts/microsoft-ads-in-2026-the-complete-guide-to-advertising-beyond-google': '/services/ppc',
  '/microsoft-ads-in-2026-the-complete-guide-to-advertising-beyond-google': '/services/ppc',
  '/posts/web-development-in-2026-a-practical-guide-to-building-faster-safer-higher-converting-websites':
    '/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites',
  '/posts/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites':
    '/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites',
  '/posts/web-development-in-2026-a-practical-guide-to-building-fast-secure-highconverting-websites':
    '/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites',
  '/posts/web-development-in-2026-a-practical-guide-to-building-faster-safer-conversion-ready-websites':
    '/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites',
  '/posts/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites':
    '/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites',

  // Blog post legacy slug variations - consolidated to primary canonical
  '/web-development-in-2026-a-practical-guide-to-building-fast-secure-highconverting-websites':
    '/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites',
  '/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites':
    '/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites',
  '/web-development-in-2026-a-practical-guide-to-building-faster-safer-conversion-ready-websites':
    '/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites',
  '/blog/web-development-in-2026-a-practical-guide-to-building-fast-secure-highconverting-websites':
    '/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites',
  '/blog/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites':
    '/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites',
  '/blog/web-development-in-2026-a-practical-guide-to-building-faster-safer-conversion-ready-websites':
    '/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites',
  '/blog/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites':
    '/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites',
  '/guide-to-web-development-2026':
    '/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites',
  '/2026-web-development-guide':
    '/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites',

  // Legacy /blog/:slug routes mapping to root /:slug
  '/blog/google-local-service-ads-in-2025': '/google-local-service-ads-in-2025',
  '/blog/marketing-automation-for-arizona-service-businesses-save-time-increase-bookings':
    '/marketing-automation-for-arizona-service-businesses-save-time-increase-bookings',
  '/blog/reduce-bounce-rate-with-ai': '/reduce-bounce-rate-with-ai',
  '/blog/website-analysis-tasks': '/website-analysis-tasks',
  '/blog/website-conversion-checklist-for-phoenix-businesses': '/website-conversion-checklist-for-phoenix-businesses',
  '/blog/phoenix-commercial-hvac-lead-intake': '/case-studies/phoenix-commercial-hvac-lead-intake',

  // Legacy Service & Sub-technology Slugs
  '/services/astro': '/services/web-development',
  '/services/react': '/services/web-development',
  '/services/wix': '/services/web-development',
  '/services/shopify': '/services/ecommerce',

  // Case Studies - consolidated to /case-studies/:slug
  '/phoenix-commercial-hvac-lead-intake': '/case-studies/phoenix-commercial-hvac-lead-intake',
  '/case-studies/phoenix-commercial-hvac': '/case-studies/phoenix-commercial-hvac-lead-intake',
  '/case-studies/scottsdale-dental-patient-intake-automation': '/case-studies',

  // Empty / Legacy Categories & Taxonomies
  '/category/strategy': '/blog',
  '/category/tutorial': '/blog',
  '/category/uncategorized': '/blog',
  '/category/analysis': '/blog',
  '/category/paid-search': '/services/ppc',
  '/category/marketing-automation': '/services/automation',
  '/category/conversion-optimization': '/services/cro',
  '/category/web-development': '/services/web-development',
  '/category/ai-automation': '/services/automation',
  '/tag/analysis': '/blog',
  '/tag/artificial': '/blog',
  '/tag/software': '/blog',
  '/tag/arizona': '/blog',
  '/tag/conversion-rate-optimization': '/blog',
  '/tag/lead-generation': '/blog',
  '/tag/marketing-automation': '/blog',
  '/tag/phoenix': '/blog',
  '/tag/seo': '/blog',

  // Legacy WordPress Slugs
  '/hello-world': '/blog',
  '/about-ziaflow': '/about',
  '/2021/01/20/consulted-admitting-is-power-acuteness': '/blog',

  // Posts archive
  '/posts': '/blog',
};

export function resolveLegacyRedirect(pathname: string, search = ''): string | undefined {
  const path = pathname.replace(/\/$/, '') || '/';
  return Object.hasOwn(LEGACY_REDIRECTS, path) ? LEGACY_REDIRECTS[path] + search : undefined;
}
