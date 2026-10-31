import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('redirects in astro.config.ts cover all critical legacy endpoints without loops', () => {
  const configSource = readFileSync(new URL('../astro.config.ts', import.meta.url), 'utf8');

  // Extract redirects object from astro.config.ts
  const match = configSource.match(/redirects:\s*\{([\s\S]*?)\n\s*\},/);
  assert.ok(match, 'astro.config.ts should contain redirects configuration');

  // Parse key-value pairs even when wrapped over multiple lines
  const redirectBlock = match[1];
  const redirects = {};
  const kvRegex = /'([^']+)'\s*:\s*'([^']+)'/g;
  let kvMatch;
  while ((kvMatch = kvRegex.exec(redirectBlock)) !== null) {
    redirects[kvMatch[1]] = kvMatch[2];
  }

  // Essential endpoints identified during audit
  const expectedMappings = {
    '/lead-follow-up-assessment': '/growth-tools/lead-follow-up-assessment',
    '/software-stack-assessment': '/growth-tools/software-stack-assessment',
    '/website-conversion-checklist': '/growth-tools/website-conversion-checklist',
    '/local-visibility-check': '/growth-tools/local-visibility-check',
    '/website-project-estimator': '/growth-tools/website-project-estimator',
    '/web-development-in-2026-a-practical-guide-to-building-faster-safer-conversion-ready-websites':
      '/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites',
    '/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites':
      '/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites',
    '/microsoft-ads-in-2026-the-complete-guide-to-advertising-beyond-google': '/services/ppc',
    '/blog/google-local-service-ads-in-2025': '/google-local-service-ads-in-2025',
    '/blog/marketing-automation-for-arizona-service-businesses-save-time-increase-bookings':
      '/marketing-automation-for-arizona-service-businesses-save-time-increase-bookings',
    '/blog/reduce-bounce-rate-with-ai': '/reduce-bounce-rate-with-ai',
    '/blog/website-analysis-tasks': '/website-analysis-tasks',
    '/blog/website-conversion-checklist-for-phoenix-businesses': '/website-conversion-checklist-for-phoenix-businesses',
    '/blog/phoenix-commercial-hvac-lead-intake': '/phoenix-commercial-hvac-lead-intake',
    '/services/astro': '/services/web-development',
    '/services/react': '/services/web-development',
    '/services/wix': '/services/web-development',
    '/services/shopify': '/services/ecommerce',
    '/case-studies/scottsdale-dental-patient-intake-automation': '/case-studies',
    '/category/strategy': '/blog',
    '/category/tutorial': '/blog',
    '/posts': '/blog',
  };

  for (const [from, to] of Object.entries(expectedMappings)) {
    assert.equal(redirects[from], to, `Expected redirect for "${from}" to be "${to}", got "${redirects[from]}"`);
  }

  // Ensure no redirect loops
  for (const [from, to] of Object.entries(redirects)) {
    assert.notEqual(from, to, `Self-referential redirect detected on ${from}`);
    assert.equal(Boolean(redirects[to]), false, `Redirect chain detected: ${from} -> ${to} -> ${redirects[to]}`);
  }
});

test('middleware mirrors redirect coverage for SSR and edge routing', () => {
  const middlewareSource = readFileSync(new URL('../src/middleware.ts', import.meta.url), 'utf8');

  // Verify critical endpoints are handled in middleware
  const criticalKeys = [
    '/lead-follow-up-assessment',
    '/software-stack-assessment',
    '/website-conversion-checklist',
    '/services/astro',
    '/services/shopify',
    '/case-studies/scottsdale-dental-patient-intake-automation',
    '/category/strategy',
  ];

  for (const key of criticalKeys) {
    assert.ok(middlewareSource.includes(key), `middleware.ts should explicitly cover redirect for ${key}`);
  }
});

test('404 template contains high-value recovery navigation paths', () => {
  const notFoundSource = readFileSync(new URL('../src/pages/404.astro', import.meta.url), 'utf8');

  // Check for recovery paths: Services, Growth tools, Blog, Contact, Audit
  assert.ok(notFoundSource.includes('/services'), '404 page should link to /services');
  assert.ok(notFoundSource.includes('/growth-tools'), '404 page should link to /growth-tools');
  assert.ok(notFoundSource.includes('/blog'), '404 page should link to /blog');
  assert.ok(notFoundSource.includes('/contact'), '404 page should link to /contact');
  assert.ok(notFoundSource.includes('/audit'), '404 page should link to /audit');
});
