import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { expansionPages, pagesOfKind } from '../src/data/expansion-pages.ts';

const plan = JSON.parse(readFileSync(new URL('../docs/content-expansion-plan.json', import.meta.url), 'utf8'));
const baseline = JSON.parse(readFileSync(new URL('../docs/content-url-baseline.json', import.meta.url), 'utf8'));
const livePaths = new Set([...baseline.paths, ...expansionPages.map((page) => page.path), '/industries', '/locations']);

test('only explicit editorial pages are generated and established URLs keep their owners', () => {
  assert.equal(expansionPages.length, 14);
  assert.equal(pagesOfKind('service').length, 10);
  assert.equal(pagesOfKind('industry').length, 3);
  assert.equal(pagesOfKind('location').length, 1);
  assert.equal(new Set(expansionPages.map((page) => page.path)).size, expansionPages.length);
  for (const page of expansionPages) {
    assert.equal(baseline.paths.includes(page.path), false, `Would shadow an existing route: ${page.path}`);
    assert.ok(/^\/(services|industries|locations)\/[a-z0-9-]+$/.test(page.path));
    for (const link of page.related) assert.ok(livePaths.has(link.href), `Missing related destination: ${link.href}`);
    assert.equal(page.sections.length, 3);
    assert.ok(page.faqs.length >= 2);
  }
  assert.equal(new Set(expansionPages.map((page) => page.title)).size, 14);
  assert.equal(new Set(expansionPages.map((page) => page.description)).size, 14);
});

test('the coverage plan maps requested topics without generating city or ZIP permutations', () => {
  assert.equal(plan.topics.length, 51);
  for (const topic of plan.topics) assert.ok(livePaths.has(topic.canonicalHub), topic.topic);
  assert.ok(plan.topics.find((topic) => topic.topic === '85302'));
  assert.ok(plan.topics.find((topic) => topic.topic === 'Tucson'));
  assert.equal(
    expansionPages.some((page) => /85302|85251/.test(page.slug)),
    false
  );
  assert.equal(
    expansionPages.some((page) => /phoenix|scottsdale|tucson/.test(page.slug)),
    false
  );
});

test('supporting articles remain draft and have distinct commercial hub links', () => {
  for (const slug of [
    'contact-page-visit-is-not-a-lead',
    'arizona-service-area-pages-before-zip-code-pages',
    'google-search-microsoft-ads-linkedin-arizona',
  ]) {
    const article = readFileSync(new URL(`../src/data/post/${slug}.md`, import.meta.url), 'utf8');
    assert.match(article, /draft: true/);
    for (const match of article.matchAll(/\]\((\/[^)]+)\)/g)) assert.ok(livePaths.has(match[1]), match[1]);
  }
});

test('new pages use the receipt-based intake contract and explicit privacy boundaries', () => {
  const form = readFileSync(new URL('../src/components/expansion/ProjectInquiry.astro', import.meta.url), 'utf8');
  assert.match(form, /data-lead-form\s+action="\/api\/contact"/);
  assert.match(form, /name="page" value=\{Astro.url.pathname\}/);
  assert.match(form, /name="service_interest"/);
  assert.match(form, /bindLeadForms\(\)/);
  assert.match(form, /Do not include patient information/);
  const health = expansionPages.find((page) => page.slug === 'healthcare');
  assert.match(health.faqs[0].answer, /No blanket compliance claim/);
});
