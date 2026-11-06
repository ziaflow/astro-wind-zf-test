import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArticleSchema, postPresentation, serializeJsonLd } from '../src/lib/sanity-editorial.ts';

const url = 'https://ziaflow.com/posts/existing-slug';
test('legacy posts keep title and publication date; technical saves do not claim review', () => {
  const post = { title: 'Existing title', publishedAt: '2026-01-01T12:00:00Z', _updatedAt: '2026-10-01T00:00:00Z' };
  const view = postPresentation(post);
  const schema = buildArticleSchema(post, url);
  assert.equal(view.title, post.title);
  assert.equal(view.reviewed, undefined);
  assert.equal(schema.dateModified, schema.datePublished);
  assert.equal(schema.url, url);
  assert.equal(schema.mainEntityOfPage['@id'], url);
  assert.equal(schema.author['@type'], 'Organization');
  assert.equal(view.alt, '');
});
test('an undated draft stays undated in presentation and JSON-LD', () => {
  const post = { title: 'Draft' };
  const schema = JSON.parse(serializeJsonLd(buildArticleSchema(post, url)));
  assert.equal(schema.datePublished, undefined);
  assert.equal(schema.dateModified, undefined);
  assert.equal(postPresentation(post).published, undefined);
});
test('explicit substantive review supplies the same visible and structured date', () => {
  const post = { title: 'Post', publishedAt: '2026-01-01', lastReviewedAt: '2026-02-01' };
  assert.equal(buildArticleSchema(post, url).dateModified, postPresentation(post).reviewed);
  for (const bad of ['invalid', '2025-01-01', '2999-01-01']) {
    assert.equal(postPresentation({ ...post, lastReviewedAt: bad }).reviewed, undefined);
  }
});
test('SEO title changes metadata title while visible H1 and schema headline use post title', () => {
  const post = { title: 'Reader title', seoTitle: 'Search title', seoDescription: 'Actual summary' };
  assert.equal(postPresentation(post).title, 'Search title');
  assert.equal(buildArticleSchema(post, url).headline, 'Reader title');
  assert.equal(buildArticleSchema(post, url).description, 'Actual summary');
});
test('all resolved authors supply consistent real profile data, tolerating dangling references', () => {
  const post = {
    title: 'Post',
    authors: [
      null,
      {},
      {
        name: ' Jeremy ',
        role: 'Engineer',
        bio: 'Builds websites.',
        profileUrl: 'https://ziaflow.com/about',
        socialUrls: ['https://example.com/jeremy', 'javascript:bad'],
        credentials: ['Verified qualification'],
        imageUrl: 'https://ziaflow.com/jeremy.png',
      },
      { name: 'Coauthor' },
    ],
  };
  const view = postPresentation(post);
  const schema = buildArticleSchema(post, url);
  assert.deepEqual(
    schema.author.map((author) => author.name),
    view.authors.map((author) => author.name)
  );
  assert.equal(schema.author[0].jobTitle, 'Engineer');
  assert.equal(schema.author[0].description, view.authors[0].bio);
  assert.deepEqual(schema.author[0].sameAs, ['https://example.com/jeremy']);
  assert.equal(schema.author[0].hasCredential[0].name, view.authors[0].credentials[0]);
});
test('stored hero alt is preserved; missing and decorative alt stay empty, not the title', () => {
  for (const alt of ['', undefined, 'Electrician reviewing a panel']) {
    assert.equal(postPresentation({ title: 'Wrong image description', mainImage: { alt } }).alt, alt || '');
  }
  assert.equal(buildArticleSchema({ title: 'No image' }, url).image, undefined);
});
test('JSON-LD cannot terminate its script through CMS text', () => {
  const title = '</script><script>alert(1)</script>';
  const json = serializeJsonLd(buildArticleSchema({ title }, url));
  assert.equal(json.includes('<'), false);
  assert.equal(JSON.parse(json).headline, title);
});
