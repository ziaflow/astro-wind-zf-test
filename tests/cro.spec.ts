import { test, expect } from '@playwright/test';

const baseUrl = process.env.CRO_BASE_URL || 'http://localhost:4321';

// Mock submission delivery: these tests must never create leads or send email.
test.beforeEach(async ({ page }) => {
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    return url.hostname === 'localhost' ? route.continue() : route.abort();
  });
});

for (const path of ['/', '/contact']) {
  test(`${path} keeps failed input, retries, and records only confirmed success`, async ({ page }) => {
    let attempts = 0;
    await page.route('**/api/contact', async (route) => {
      attempts++;
      await route.fulfill({
        status: attempts === 1 ? 503 : 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: attempts > 1 }),
      });
    });
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
    const form = page.locator('ziaflow-inquiry form');
    await expect(form).toHaveAttribute('data-initialized', 'true');
    await form.getByLabel('Your name (required)').fill('CRO Test');
    await form.getByLabel('Email (required)').fill('cro-test@example.com');
    await form
      .getByLabel('What do you need help with? (required)')
      .selectOption({ label: 'Not sure yet — help me decide' });
    await form.getByRole('button', { name: 'Request a consultation' }).click();
    await expect(form.getByRole('status')).toContainText('couldn’t confirm');
    await expect(form.getByLabel('Email (required)')).toHaveValue('cro-test@example.com');
    await expect(form.locator('[data-recovery] a')).toHaveAttribute('href', 'mailto:info@ziaflow.com');
    expect(
      await page.evaluate(() => (window.dataLayer || []).filter((x) => x.event === 'form_submit_success').length)
    ).toBe(0);
    await form.getByRole('button', { name: 'Request a consultation' }).click();
    await expect(form.getByRole('status')).toContainText('we received your inquiry');
    await expect(form.locator('[data-success] a')).toBeVisible();
    expect(
      await page.evaluate(() => (window.dataLayer || []).filter((x) => x.event === 'form_submit_success').length)
    ).toBe(1);
    expect(await page.evaluate(() => (window.dataLayer || []).filter((x) => x.event === 'email_sent').length)).toBe(0);
    expect(attempts).toBe(2);
  });
}

test('contact retains campaign attribution after navigating from the landing page', async ({ page }) => {
  let payload: Record<string, string> = {};
  await page.route('**/api/contact', async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({ json: { ok: true } });
  });
  await page.goto(`${baseUrl}/?utm_source=linkedin&utm_medium=social&utm_campaign=local-intake&utm_content=post-a`, {
    waitUntil: 'domcontentloaded',
  });
  await page.goto(`${baseUrl}/contact`, { waitUntil: 'domcontentloaded' });
  const form = page.locator('ziaflow-inquiry form');
  await form.getByLabel('Your name (required)').fill('CRO Test');
  await form.getByLabel('Email (required)').fill('cro-test@example.com');
  await form.getByLabel('What do you need help with? (required)').selectOption({ index: 1 });
  await form.getByRole('button', { name: 'Request a consultation' }).click();
  await expect(form.getByRole('status')).toContainText('we received');
  expect(payload).toMatchObject({
    utm_source: 'linkedin',
    utm_medium: 'social',
    utm_campaign: 'local-intake',
    utm_content: 'post-a',
  });
});

test('homepage and contact fit mobile and desktop viewports', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/contact']) {
      await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('ziaflow-inquiry')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.screenshot({
        path: `outputs/cro-review/${path === '/' ? 'home' : 'contact'}-${width}.png`,
        fullPage: false,
      });
    }
  }
});
