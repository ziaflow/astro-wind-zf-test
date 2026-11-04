import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { LEGACY_REDIRECTS as redirects, resolveLegacyRedirect } from '../src/config/redirects.ts';

test('redirects in astro.config.ts cover all critical legacy endpoints without loops', () => {
  const configSource = readFileSync(new URL('../astro.config.ts', import.meta.url), 'utf8');

  assert.match(configSource, /import \{ LEGACY_REDIRECTS \} from ['"]\.\/src\/config\/redirects['"]/);
  assert.match(configSource, /redirects: LEGACY_REDIRECTS/);

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
    '/posts/microsoft-ads-complete-guide-2026': '/services/ppc',
    '/posts/microsoft-ads-in-2026-the-complete-guide-to-advertising-beyond-google': '/services/ppc',
    '/posts/web-development-in-2026-a-practical-guide-to-building-faster-safer-higher-converting-websites':
      '/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites',
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

test('middleware returns permanent redirects with attribution and trailing-slash variants', async () => {
  const source = readFileSync(new URL('../src/middleware.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source.replace('import.meta.env.DEV', 'false'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  let sanityReads = 0;
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    console,
    URL,
    Response,
    require(id) {
      if (id === 'astro:middleware') return { defineMiddleware: (handler) => handler };
      if (id === './config/redirects') return { resolveLegacyRedirect };
      if (id === 'sanity:client')
        return {
          sanityClient: {
            fetch: async () => {
              sanityReads++;
              return [];
            },
          },
        };
      throw new Error('Unexpected import: ' + id);
    },
  });
  for (const [from, destination] of Object.entries(redirects)) {
    for (const suffix of ['', '/']) {
      const url = new URL('https://ziaflow.com' + from + suffix + '?utm_source=regression');
      const response = await exports.onRequest(
        {
          url,
          request: new Request(url),
          redirect: (to, status) => new Response(null, { status, headers: { Location: to } }),
        },
        () => {
          throw new Error('Expected redirect for ' + from);
        }
      );
      assert.equal(response.status, 301);
      assert.equal(response.headers.get('Location'), destination + '?utm_source=regression');
    }
  }
  assert.equal(sanityReads, 0, 'Built-in recovery routes must work without Sanity');
  for (const path of ['/constructor', '/unknown-article', '/posts/unknown-article']) {
    const url = new URL('https://ziaflow.com' + path);
    const response = await exports.onRequest(
      {
        url,
        request: new Request(url),
        redirect: () => {
          throw new Error('Unknown route must not redirect');
        },
      },
      () => new Response('Not found', { status: 404 })
    );
    assert.equal(response.status, 404);
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
