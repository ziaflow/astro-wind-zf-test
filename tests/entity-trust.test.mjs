import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ENTITY_NAME = 'Custom Web Development & SEO';

test('Homepage title explicitly contains the entity name', () => {
  const indexSource = readFileSync(resolve('src/pages/index.astro'), 'utf-8');
  assert.match(
    indexSource,
    /title="[^"]*Custom Web Development & SEO[^"]*"/,
    'Homepage Layout title must include "Custom Web Development & SEO"'
  );
});

test('Homepage H1 explicitly includes the entity name', () => {
  const homeDataSource = readFileSync(resolve('src/kairo/data/home.ts'), 'utf-8');
  assert.match(
    homeDataSource,
    /text:\s*['"]Custom Web Development & SEO['"]/,
    'Hero heading lines must contain "Custom Web Development & SEO"'
  );
});

test('Opening copy directly defines the entity within the first sentences', () => {
  const homeDataSource = readFileSync(resolve('src/kairo/data/home.ts'), 'utf-8');
  assert.match(
    homeDataSource,
    /intro:\s*['"]Custom Web Development & SEO is/,
    'Hero opening copy must begin with a direct definition of "Custom Web Development & SEO"'
  );
});

test('Organization, WebSite, and LocalBusiness schema align with visible brand and title/H1', () => {
  const schemaSource = readFileSync(resolve('src/components/seo/LocalBusinessSchema.astro'), 'utf-8');
  
  // Organization with brand name
  assert.match(
    schemaSource,
    /@type':\s*'Organization'/,
    'Schema must contain an explicit Organization object'
  );
  assert.match(
    schemaSource,
    /name:\s*'ZiaFlow'/,
    'Schema name must match the visible brand name "ZiaFlow"'
  );
  assert.match(
    schemaSource,
    /alternateName:\s*'Custom Web Development & SEO'/,
    'Schema alternateName must ground the main entity "Custom Web Development & SEO"'
  );

  // WebSite schema with headline
  assert.match(
    schemaSource,
    /@type':\s*'WebSite'/,
    'Schema must contain an explicit WebSite object'
  );

  // WebPage schema with name = title and headline = H1
  assert.match(
    schemaSource,
    /@type':\s*'WebPage'/,
    'Schema must contain an explicit WebPage object'
  );
  assert.match(
    schemaSource,
    /name:\s*'Custom Web Development & SEO for Arizona Service Businesses \| ZiaFlow'/,
    'WebPage schema name must match exact visible page title'
  );
  assert.match(
    schemaSource,
    /headline:\s*'Custom Web Development & SEO for Arizona service businesses\.'/,
    'WebPage schema headline must match exact visible H1'
  );

  const requiredSameAs = [
    'https://www.linkedin.com/company/ziaflow/',
    'https://www.facebook.com/ZiaFlowAZ/',
    'https://www.instagram.com/ziaflowaz/',
    'https://www.yelp.com/biz/ziaflow-phoenix',
  ];

  for (const url of requiredSameAs) {
    assert.ok(
      schemaSource.includes(url),
      `Schema sameAs must include verified identity profile: ${url}`
    );
  }
});

test('Logo and navigation include accessible entity name', () => {
  const logoSource = readFileSync(resolve('src/kairo/components/shared/icons/logo.astro'), 'utf-8');
  assert.ok(
    logoSource.includes(ENTITY_NAME),
    'Logo sr-only text must include "Custom Web Development & SEO"'
  );

  const navbarSource = readFileSync(resolve('src/kairo/components/shared/layout/navbar.astro'), 'utf-8');
  assert.ok(
    navbarSource.includes(ENTITY_NAME),
    'Navbar home link aria-label must include "Custom Web Development & SEO"'
  );
});

test('Footer reinforces the entity name across brand panel and tagline', () => {
  const footerSource = readFileSync(resolve('src/components/widgets/Footer.astro'), 'utf-8');
  assert.ok(
    footerSource.includes(ENTITY_NAME),
    'Footer must explicitly mention "Custom Web Development & SEO"'
  );
  assert.match(
    footerSource,
    /<span class="tagline-title">CUSTOM WEB DEVELOPMENT & SEO<\/span>/,
    'Footer tagline bar must display "CUSTOM WEB DEVELOPMENT & SEO"'
  );
});

test('Visible FAQ component is mounted on homepage with matching FAQPage schema', () => {
  const indexSource = readFileSync(resolve('src/pages/index.astro'), 'utf-8');
  const homeDataSource = readFileSync(resolve('src/kairo/data/home.ts'), 'utf-8');

  // Verify visible FAQ mounting
  assert.match(
    indexSource,
    /<Faq\s+title="[^"]*"\s+items=\{homeFaqs\}/,
    'Homepage must visibly mount <Faq /> with items={homeFaqs}'
  );

  // Verify FAQPage JSON-LD schema mirrors visible items
  assert.match(
    indexSource,
    /mainEntity:\s*homeFaqs\.map/,
    'FAQPage schema must dynamically mirror visible homeFaqs array'
  );

  // Verify count of questions is 3-5
  const questionMatches = Array.from(homeDataSource.matchAll(/question:\s*['"]([^'"]+)['"]/g));
  assert.ok(
    questionMatches.length >= 3 && questionMatches.length <= 8,
    `Must have between 3 and 8 question headings, found ${questionMatches.length}`
  );

  // Verify all questions are question-style (end with ?)
  for (const [, q] of questionMatches) {
    assert.ok(q.endsWith('?'), `FAQ question must end with '?': ${q}`);
  }
});

test('Evidence & benchmarks section provides self-contained citability with outbound source links', () => {
  const indexSource = readFileSync(resolve('src/pages/index.astro'), 'utf-8');
  const benchmarksSource = readFileSync(resolve('src/kairo/components/home/evidence-benchmarks.astro'), 'utf-8');

  // Verify mounting on homepage
  assert.match(
    indexSource,
    /<EvidenceBenchmarks\s*\/>/,
    'Homepage must visibly mount <EvidenceBenchmarks />'
  );

  // Verify self-contained headings and main entity inclusion
  assert.ok(
    benchmarksSource.includes(ENTITY_NAME),
    'Benchmarks section must ground claims by repeating "Custom Web Development & SEO"'
  );

  // Verify authoritative outbound sources
  const expectedSources = [
    'https://web.dev/articles/vitals',
    'https://hbr.org/2011/03/the-short-life-of-online-sales-leads',
    'https://www.brightlocal.com/research/local-consumer-review-survey/',
    'https://schema.org/LocalBusiness',
  ];

  for (const source of expectedSources) {
    assert.ok(
      benchmarksSource.includes(source),
      `Benchmarks section must cite verified source: ${source}`
    );
  }

  // Verify comparison table exists with semantic table tags
  assert.match(benchmarksSource, /<table\b/, 'Benchmarks must contain a semantic <table>');
  assert.match(benchmarksSource, /<thead\b/, 'Comparison table must contain <thead>');
  assert.match(benchmarksSource, /<tbody\b/, 'Comparison table must contain <tbody>');
  assert.match(benchmarksSource, /scope="col"/, 'Table headers must define scope="col"');
  assert.match(benchmarksSource, /scope="row"/, 'Row headers must define scope="row"');
});

test('Content quality avoids boilerplate n-grams and incorporates concrete operational specs', () => {
  const homeDataSource = readFileSync(resolve('src/kairo/data/home.ts'), 'utf-8');

  // Ensure repetitive boilerplate phrases are eliminated
  assert.ok(
    !homeDataSource.includes('agreed inquiry sources'),
    'Should not use repetitive "agreed inquiry sources" filler'
  );
  assert.ok(
    !homeDataSource.includes('scope a practical Sprint'),
    'Should not repeat boilerplate "scope a practical Sprint"'
  );

  // Ensure concrete numbers, prices, and timeframes are present
  assert.match(homeDataSource, /\$2,500/, 'Must mention concrete starting price point');
  assert.match(homeDataSource, /14 to 28 business days/, 'Must state specific delivery timeframe');
  assert.match(homeDataSource, /99\.9/, 'Must state SLA uptime metric');
  assert.match(homeDataSource, /95\+ on Google Lighthouse/, 'Must cite verifiable Lighthouse target score');

  // Ensure named platform entities are cited
  const namedPlatforms = ['HubSpot', 'ServiceTitan', 'Twilio', 'CallRail', 'PostgreSQL'];
  for (const platform of namedPlatforms) {
    assert.ok(homeDataSource.includes(platform), `Should integrate concrete technical entity: ${platform}`);
  }
});

test('Answer extractability provides an answer-first direct definition and executive summary block', () => {
  const indexSource = readFileSync(resolve('src/pages/index.astro'), 'utf-8');
  const summarySource = readFileSync(resolve('src/kairo/components/home/quick-summary.astro'), 'utf-8');
  const homeDataSource = readFileSync(resolve('src/kairo/data/home.ts'), 'utf-8');

  // Verify mounting on homepage right after Hero
  assert.match(
    indexSource,
    /<Hero\s*\/>\s*<QuickSummary\s*\/>/,
    'QuickSummary must be mounted immediately following Hero'
  );

  // Verify direct definition blockquote
  assert.match(
    summarySource,
    /<blockquote[^>]*>[\s\S]*<strong>Custom Web Development & SEO<\/strong>\s+is/i,
    'Must include direct quoteable definition sentence with strong entity name'
  );

  // Verify executive summary H2 and H3 extractable sections
  assert.match(
    summarySource,
    /<h2[^>]*>[\s\S]*Custom Web Development & SEO: Core Overview[\s\S]*<\/h2>/,
    'Must contain summary H2 heading'
  );
  assert.match(
    summarySource,
    /<h3[^>]*>[\s\S]*\{item\.label\}[\s\S]*<\/h3>/,
    'Must render H3 headings for each takeaway item'
  );
  assert.match(
    summarySource,
    /label:\s*'Direct Definition'/,
    'Must include Direct Definition takeaway card'
  );

  // Ensure "What business operators say." is eliminated from proofSection
  assert.ok(
    !homeDataSource.includes('What business operators say.'),
    'Pseudo-question heading "What business operators say." must be eliminated'
  );
});

