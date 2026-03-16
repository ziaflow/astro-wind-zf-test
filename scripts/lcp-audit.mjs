#!/usr/bin/env node
/**
 * lcp-audit.mjs
 *
 * Performance Agent: Playwright-based LCP audit for Vercel preview deployments.
 *
 * Usage:
 *   node scripts/lcp-audit.mjs [baseUrl]
 *
 * Examples:
 *   node scripts/lcp-audit.mjs https://astro-wind-zf-test.vercel.app
 *   node scripts/lcp-audit.mjs http://localhost:4321
 *
 * The script visits a set of pages, collects the Largest Contentful Paint (LCP)
 * metric via the PerformanceObserver API, and reports which Astro component/element
 * is responsible so the team can prioritise optimisations.
 */

import { chromium } from 'playwright';

const BASE_URL = process.argv[2] || 'http://localhost:4321';

/** Pages to audit — extend this list as needed. */
const PAGES = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/partnerships', label: 'Partnerships' },
  { path: '/services/seo', label: 'Services – SEO' },
  { path: '/services/automation', label: 'Services – Automation' },
  { path: '/contact', label: 'Contact' },
  { path: '/pricing', label: 'Pricing' },
];

/** LCP thresholds (ms) per Web Vitals spec */
const LCP_GOOD = 2500;
const LCP_NEEDS_IMPROVEMENT = 4000;

function rating(lcp) {
  if (lcp <= LCP_GOOD) return '✅ Good';
  if (lcp <= LCP_NEEDS_IMPROVEMENT) return '⚠️  Needs Improvement';
  return '❌ Poor';
}

async function auditPage(page, url) {
  // Inject PerformanceObserver before navigation so we capture all LCP candidates.
  await page.addInitScript(() => {
    window.__lcpEntries = [];
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__lcpEntries.push({
          startTime: entry.startTime,
          size: entry.size,
          url: entry.url || null,
          element: entry.element
            ? {
                tagName: entry.element.tagName,
                id: entry.element.id || null,
                className: entry.element.className || null,
                src: entry.element.src || entry.element.currentSrc || null,
                textContent: (entry.element.textContent || '').slice(0, 80).trim() || null,
                // Try to map back to an Astro component via data-astro-* attributes
                astroComponent: entry.element.closest('[data-astro-cid]')
                  ? entry.element.closest('[data-astro-cid]')?.getAttribute('data-astro-cid')
                  : null,
                // Walk up to find the nearest section/component wrapper class
                nearestSection: (() => {
                  let el = entry.element;
                  while (el && el !== document.body) {
                    if (el.tagName === 'SECTION') return el.className.split(' ')[0] || 'section';
                    el = el.parentElement;
                  }
                  return null;
                })(),
              }
            : null,
        });
      }
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  // Allow browser to settle and fire final LCP candidate.
  await page.waitForTimeout(2000);

  const entries = await page.evaluate(() => window.__lcpEntries || []);

  if (!entries.length) {
    return { lcp: null, element: null };
  }

  // The last entry is the winning LCP candidate.
  const last = entries[entries.length - 1];
  return { lcp: Math.round(last.startTime), element: last.element };
}

(async () => {
  console.log(`\n🔍  ZiaFlow LCP Audit — ${BASE_URL}\n${'─'.repeat(60)}`);

  const browser = await chromium.launch();
  const results = [];

  for (const { path, label } of PAGES) {
    const url = `${BASE_URL}${path}`;
    const context = await browser.newContext({
      // Simulate a mid-range mobile device (Moto G4) for realistic LCP.
      userAgent:
        'Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Mobile Safari/537.36',
      viewport: { width: 412, height: 823 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    try {
      const { lcp, element } = await auditPage(page, url);

      if (lcp === null) {
        console.log(`  ${label.padEnd(30)} — no LCP captured (page may have redirected)`);
      } else {
        const r = rating(lcp);
        console.log(`  ${label.padEnd(30)} ${String(lcp).padStart(6)} ms  ${r}`);

        if (element) {
          console.log(`    └─ LCP element: <${element.tagName?.toLowerCase()}>`);
          if (element.src) console.log(`       src: ${element.src}`);
          if (element.textContent) console.log(`       text: "${element.textContent}"`);
          if (element.nearestSection) console.log(`       section class: ${element.nearestSection}`);
          if (element.astroComponent) console.log(`       astro-cid: ${element.astroComponent}`);
        }
      }

      results.push({ label, path, lcp, element });
    } catch (err) {
      console.log(`  ${label.padEnd(30)} — ERROR: ${err.message}`);
      results.push({ label, path, lcp: null, error: err.message });
    } finally {
      await context.close();
    }
  }

  await browser.close();

  // Summary
  const measured = results.filter((r) => r.lcp !== null);
  if (measured.length) {
    const worst = measured.sort((a, b) => b.lcp - a.lcp)[0];
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📊  Pages audited: ${results.length}  |  Measured: ${measured.length}`);
    console.log(`🐢  Highest LCP  : ${worst.label} — ${worst.lcp} ms  ${rating(worst.lcp)}`);

    const poor = measured.filter((r) => r.lcp > LCP_NEEDS_IMPROVEMENT);
    if (poor.length) {
      console.log(`\n⚠️   Pages needing attention:`);
      poor.forEach(({ label, lcp, element }) => {
        console.log(`   • ${label} (${lcp} ms)`);
        if (element?.tagName) {
          const hint =
            element.tagName === 'IMG'
              ? 'Add fetchpriority="high" and loading="eager" to the hero <Image> component.'
              : element.tagName.match(/^H[1-3]$/)
                ? 'Large heading is LCP — consider reducing font weight or using system font.'
                : 'Profile this element in DevTools and consider skeleton/preload strategies.';
          console.log(`     Hint: ${hint}`);
        }
      });
    } else {
      console.log(`\n✅  All measured pages have Good or Needs-Improvement LCP.`);
    }
  }

  console.log('');
})();
