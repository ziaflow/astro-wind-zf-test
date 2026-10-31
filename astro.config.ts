import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import icon from 'astro-icon';
import compress from 'astro-compress';
import prefetch from '@astrojs/prefetch';
import type { AstroIntegration } from 'astro';

import sanity from '@sanity/astro';

import vercel from '@astrojs/vercel';
import { readingTimeRemarkPlugin, responsiveTablesRehypePlugin, lazyImagesRehypePlugin } from './src/utils/frontmatter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const hasExternalScripts = false;
const whenExternalScripts = (items: (() => AstroIntegration) | (() => AstroIntegration)[] = []) =>
  hasExternalScripts ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : [];

export default defineConfig({
  site: 'https://ziaflow.com',
  output: 'static',
  adapter: vercel(),

  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/staging') &&
        !page.includes('/category/') &&
        !page.includes('/tag/') &&
        !page.includes('/form-test') &&
        !page.includes('/kairo-preview') &&
        !page.includes('/posts') &&
        !page.endsWith('/ziaflow') &&
        !page.includes('/ziaflow/'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
    robotsTxt(),
    mdx(),
    icon({
      include: {
        tabler: ['*'],
        'flat-color-icons': [
          'template',
          'gallery',
          'approval',
          'document',
          'advertising',
          'currency-exchange',
          'voice-presentation',
          'business-contact',
          'database',
        ],
      },
    }),

    // UX: Prefetches links on hover for "instant" page loads
    prefetch({
      prefetchAll: true,
    }),

    ...whenExternalScripts(() =>
      partytown({
        config: { forward: ['dataLayer.push'] },
      })
    ),

    compress({
      CSS: true,
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false,
        },
      },
      Image: false,
      JavaScript: true,
      SVG: false,
      Logger: 1,
    }),

    sanity({
      projectId: '92p0tpps',
      dataset: 'production',
      useCdn: false,
    }),
  ],

  // REDIRECTS: Managing Link Equity (301s)
  redirects: {
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
  },

  image: {
    domains: ['cdn.pixabay.com', 'gmldsdtmahtgrbwwowtn.supabase.co'],
  },

  markdown: {
    remarkPlugins: [readingTimeRemarkPlugin],
    rehypePlugins: [responsiveTablesRehypePlugin, lazyImagesRehypePlugin],
  },

  vite: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
        '@': path.resolve(__dirname, './src/kairo'),
      },
    },
    optimizeDeps: {
      include: ['number-flow'],
    },
    ssr: {
      noExternal: ['@supabase/supabase-js'],
    },
  },
});
