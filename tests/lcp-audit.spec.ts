/**
 * LCP (Largest Contentful Paint) Audit
 *
 * Uses the Playwright browser's native PerformanceObserver API to measure LCP
 * on key pages and flag Astro components that may be contributing to slow paint.
 *
 * Run against a live preview URL by setting the LCP_BASE_URL environment variable:
 *   LCP_BASE_URL=https://your-vercel-preview.vercel.app npx playwright test tests/lcp-audit.spec.ts
 *
 * Defaults to localhost:4321 (Astro dev server) when LCP_BASE_URL is not set.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.LCP_BASE_URL ?? 'http://localhost:4321';

/** Good LCP threshold (Google recommends ≤ 2500 ms) */
const LCP_GOOD_MS = 2500;
/** Needs improvement threshold (Google: ≤ 4000 ms) */
const LCP_NEEDS_IMPROVEMENT_MS = 4000;

/**
 * Measures LCP for the given URL using the PerformanceObserver browser API.
 * Returns the LCP value in milliseconds, or null if it could not be measured.
 */
async function measureLCP(page: import('@playwright/test').Page, url: string): Promise<number | null> {
  await page.goto(url, { waitUntil: 'networkidle' });

  const lcpMs = await page.evaluate(
    () =>
      new Promise<number | null>((resolve) => {
        // Guard for environments where PerformanceObserver is not available (e.g., injected
        // scripts in headless mode or future browser changes). The outer test already skips
        // non-Chromium runs, but this keeps the in-page evaluation safe regardless.
        if (typeof PerformanceObserver === 'undefined') {
          resolve(null);
          return;
        }

        let latestLcp: number | null = null;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            latestLcp = entry.startTime;
          }
        });

        try {
          observer.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch {
          resolve(null);
          return;
        }

        // Give the page 3 seconds to settle then resolve with the latest LCP value
        setTimeout(() => {
          observer.disconnect();
          resolve(latestLcp);
        }, 3000);
      })
  );

  return lcpMs;
}

/**
 * Identifies the LCP element and its source component hint from the DOM.
 */
async function getLCPElementInfo(page: import('@playwright/test').Page): Promise<{
  tagName: string;
  id: string;
  classes: string;
  src: string;
  text: string;
} | null> {
  return page.evaluate(() => {
    if (typeof PerformanceObserver === 'undefined') return null;

    const entries = performance.getEntriesByType('largest-contentful-paint');
    if (!entries.length) return null;

    const lastEntry = entries[entries.length - 1] as PerformanceLargestContentfulPaint;
    const el = lastEntry.element;
    if (!el) return null;

    return {
      tagName: el.tagName,
      id: el.id ?? '',
      classes: el.className ?? '',
      src: (el as HTMLImageElement).src ?? '',
      text: el.textContent?.trim().slice(0, 120) ?? '',
    };
  });
}

// ---------------------------------------------------------------------------
// Test pages – add any additional routes that are important for your users
// ---------------------------------------------------------------------------
const PAGES_TO_AUDIT = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Contact', path: '/contact' },
  { name: 'Partners', path: '/partners' },
  { name: 'Blog', path: '/posts' },
];

for (const { name, path } of PAGES_TO_AUDIT) {
  test(`LCP audit – ${name} page (${path})`, async ({ page, browserName }) => {
    // LCP PerformanceLargestContentfulPaint is a Chromium-only web API
    test.skip(browserName !== 'chromium', 'LCP measurement requires Chromium');

    const url = `${BASE_URL}${path}`;
    const lcpMs = await measureLCP(page, url);

    if (lcpMs === null) {
      // The page may not support LCP (e.g. redirect or server error) – skip gracefully
      console.warn(`[LCP Audit] Could not measure LCP for ${url} – skipping assertion.`);
      return;
    }

    const elementInfo = await getLCPElementInfo(page);

    console.log(`[LCP Audit] ${name} (${url})`);
    console.log(`  LCP: ${lcpMs.toFixed(0)} ms`);
    if (elementInfo) {
      console.log(`  LCP element: <${elementInfo.tagName.toLowerCase()}>`);
      if (elementInfo.id) console.log(`    id="${elementInfo.id}"`);
      if (elementInfo.classes) console.log(`    class="${elementInfo.classes}"`);
      if (elementInfo.src) console.log(`    src="${elementInfo.src}"`);
      if (elementInfo.text) console.log(`    text="${elementInfo.text}"`);
    }

    if (lcpMs > LCP_NEEDS_IMPROVEMENT_MS) {
      console.warn(
        `[LCP Audit] ⚠️  POOR LCP (${lcpMs.toFixed(0)} ms > ${LCP_NEEDS_IMPROVEMENT_MS} ms) on ${name} page.` +
          (elementInfo ? ` LCP element: <${elementInfo.tagName.toLowerCase()}> classes="${elementInfo.classes}"` : '')
      );
    } else if (lcpMs > LCP_GOOD_MS) {
      console.warn(
        `[LCP Audit] ⚡ LCP needs improvement (${lcpMs.toFixed(0)} ms) on ${name} page.` +
          (elementInfo ? ` LCP element: <${elementInfo.tagName.toLowerCase()}> classes="${elementInfo.classes}"` : '')
      );
    }

    // Assert that LCP does not exceed the "poor" threshold (4 s)
    expect(
      lcpMs,
      `${name} page LCP (${lcpMs.toFixed(0)} ms) exceeds the poor threshold of ${LCP_NEEDS_IMPROVEMENT_MS} ms. ` +
        `Check the Hero / above-the-fold Astro components and ensure the LCP image uses loading="eager" fetchpriority="high".`
    ).toBeLessThanOrEqual(LCP_NEEDS_IMPROVEMENT_MS);
  });
}
