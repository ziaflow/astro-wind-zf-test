import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.route('**/*', (route) =>
    new URL(route.request().url()).hostname === 'localhost' ? route.continue() : route.abort()
  );
});

test('homepage exposes the consultation form', async ({ page }) => {
  await page.goto('http://localhost:4321/', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/ZiaFlow/i);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('ziaflow-inquiry form')).toBeVisible();
});

test('contact page exposes an email recovery option', async ({ page }) => {
  await page.goto('http://localhost:4321/contact', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('ziaflow-inquiry form')).toBeVisible();
  await expect(page.locator('ziaflow-inquiry [data-recovery] a')).toHaveAttribute('href', 'mailto:info@ziaflow.com');
});
