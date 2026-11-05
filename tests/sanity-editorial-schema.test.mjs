import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { Schema } = createRequire(new URL('../studio-gemini-blog/package.json', import.meta.url))('@sanity/schema');
import { postType } from '../studio-gemini-blog/schemaTypes/postType.ts';
import { authorType } from '../studio-gemini-blog/schemaTypes/author.ts';

const field = (name) => postType.fields.find((field) => field.name === name);
// Exercise the schema's actual custom validators with the context Sanity supplies.
function validate(name, value, document = {}) {
  let callback;
  field(name).validation({
    custom(fn) {
      callback = fn;
      return this;
    },
  });
  return callback(value, { document });
}
test('draft-safe approval validation and no automatic publication timestamp survive', () => {
  assert.equal(field('publishedAt').initialValue, undefined);
  assert.equal(validate('publishedAt', undefined, { editorialStatus: 'ai_drafted' }), true);
  assert.equal(validate('publishedAt', undefined, {}), true);
  assert.equal(typeof validate('publishedAt', undefined, { editorialStatus: 'approved' }), 'string');
  assert.equal(validate('publishedAt', '2026-01-01', { editorialStatus: 'approved' }), true);
});
test('body styles preserve normal, lists, marks and H2-H6 while rejecting new H1 content', () => {
  const body = field('body');
  const link = body.of[0].marks.annotations.find((annotation) => annotation.name === 'link');
  let uriOptions;
  link.fields[0].validation({
    uri(options) {
      uriOptions = options;
      return this;
    },
  });
  assert.equal(uriOptions.allowRelative, true);
  assert.equal(
    body.of[0].styles.some((style) => style.value === 'h1'),
    false
  );
  assert.equal(validate('body', [{ _type: 'block', style: 'h2' }]), true);
  assert.equal(typeof validate('body', [{ _type: 'block', style: 'h1' }]), 'string');
  assert.equal(validate('body', undefined), true);
  assert.equal(
    body.of.some((item) => item.type === 'image'),
    false
  );
});
test('review date is optional but chronological, completed, and explicit', () => {
  assert.equal(validate('lastReviewedAt', undefined), true);
  assert.equal(validate('lastReviewedAt', '2026-02-01', { publishedAt: '2026-01-01' }), true);
  for (const value of ['bad', '2999-01-01', '2025-01-01']) {
    assert.equal(typeof validate('lastReviewedAt', value, { publishedAt: '2026-01-01' }), 'string');
  }
});
test('existing reference array remains and new content fields are optional', () => {
  assert.equal(field('authors').of[0].type, 'reference');
  assert.equal(field('authors').of[0].to[0].type, 'author');
  assert.equal(field('mainImage').validation, undefined);
  assert.equal(field('mainImage').fields[0].name, 'alt');
  assert.equal(field('canonicalUrl'), undefined);
  assert.equal(field('schemaJson'), undefined);
  for (const name of ['bio', 'role', 'credentials', 'profileUrl', 'socialUrls']) {
    assert.ok(authorType.fields.some((field) => field.name === name));
  }
});

test('post and author definitions compile through the installed Sanity schema compiler', () => {
  const compiled = Schema.compile({ name: 'editorial-test', types: [postType, authorType] });
  assert.equal(compiled.get('post').fields.find((field) => field.name === 'authors').type.name, 'array');
  assert.ok(compiled.get('author').fields.some((field) => field.name === 'bio'));
});
