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
import astrowind from './vendor/integration';

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

    astrowind({
      config: './src/config.yaml',
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
    '/local-visibility-check': '/growth-tools/local-visibility-check',
    '/website-project-estimator': '/growth-tools/website-project-estimator',
    '/web-development-in-2026-a-practical-guide-to-building-fast-secure-highconverting-websites':
      '/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites',
    '/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites':
      '/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites',
    '/blog/web-development-in-2026-a-practical-guide-to-building-fast-secure-highconverting-websites':
      '/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites',
    '/blog/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites':
      '/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites',
    '/guide-to-web-development-2026':
      '/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites',
    '/2026-web-development-guide':
      '/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites',
    '/case-studies/phoenix-commercial-hvac-lead-intake': '/phoenix-commercial-hvac-lead-intake',
    '/case-studies/phoenix-commercial-hvac': '/phoenix-commercial-hvac-lead-intake',
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
