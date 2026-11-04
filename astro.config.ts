import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'astro/config';
import { LEGACY_REDIRECTS } from './src/config/redirects';

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
  redirects: LEGACY_REDIRECTS,

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
