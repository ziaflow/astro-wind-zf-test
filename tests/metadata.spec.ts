import { test, expect } from '@playwright/test';

function tags(html: string, tag: string) {
  return Array.from(html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'gi')), ([match]) =>
    Object.fromEntries(Array.from(match.matchAll(/([\w:-]+)="([^"]*)"/g), ([, key, value]) => [key, value]))
  );
}

function meta(html: string, key: string) {
  return tags(html, 'meta').find((tag) => tag.name === key || tag.property === key)?.content;
}

test('Kairo metadata preserves public previews and site verification', async ({ request }) => {
  const response = await request.get('/');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(tags(html, 'meta').filter((tag) => tag.property === 'og:title')).toHaveLength(1);
  expect(meta(html, 'og:type')).toBe('website');
  expect(meta(html, 'google-site-verification')).toBeTruthy();
  const image = meta(html, 'og:image');
  expect(image).toBe('https://ziaflow.com/images/og-image.jpg');
  expect(meta(html, 'twitter:image')).toBe(image);
  const asset = await request.get(new URL(image!).pathname);
  expect(asset.status()).toBe(200);
  expect(asset.headers()['content-type']).toContain('image/');
});

test('Kairo metadata retains noindex and nofollow from compatibility pages', async ({ request }) => {
  const response = await request.get('/form-test');
  expect(response.status()).toBe(200);
  const html = await response.text();
  const robots = meta(html, 'robots');
  expect(robots).toContain('noindex');
  expect(robots).toContain('nofollow');
  expect(tags(html, 'link').find((tag) => tag.rel === 'canonical')?.href).toBe('https://ziaflow.com/form-test');
});

test('Kairo article metadata retains article type and its own preview image', async ({ request }) => {
  const response = await request.get('/website-analysis-tasks');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(meta(html, 'og:type')).toBe('article');
  const image = meta(html, 'og:image');
  expect(image).toBeTruthy();
  expect(image).not.toBe('https://ziaflow.com/images/og-image.jpg');
  expect(meta(html, 'twitter:image')).toBe(image);
  const assetUrl = new URL(image!);
  const asset = await request.get(assetUrl.pathname + assetUrl.search.replaceAll('&amp;', '&'));
  expect(asset.status()).toBe(200);
  expect(asset.headers()['content-type']).toContain('image/');
});

test('booking retains a direct calendar link when an embed cannot load', async ({ request }) => {
  const response = await request.get('/booking');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('Open Booking Portal');
  expect(html).not.toContain('booking-fallback--hidden');
  expect(tags(html, 'iframe').some((tag) => tag.title === 'Book a consultation')).toBe(true);
  expect(tags(html, 'a').some((tag) => tag.href?.startsWith('https://outlook.office.com/book/'))).toBe(true);
});
