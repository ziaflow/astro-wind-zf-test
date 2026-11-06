import { test, expect } from '@playwright/test';
import { expansionPages } from '../src/data/expansion-pages';

for (const entry of expansionPages) {
  test(`expansion page ${entry.path} has useful content and a canonical`, async ({ page }) => {
    const response = await page.goto(entry.path, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(entry.title);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main h1')).toHaveText(entry.heading);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://ziaflow.com${entry.path}`);
    await expect(page.locator('form[data-lead-form]')).toHaveAttribute('action', '/api/contact');
  });
}

for (const width of [390, 1440]) {
  test(`project inquiry at ${width}px retains page attribution without sending mail`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    let requests = 0;
    let captured: Record<string, unknown> = {};
    await page.route('**/api/contact', async (route) => {
      requests++;
      captured = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ submission_id: 'synthetic-test-receipt', duplicate: false }),
      });
    });
    await page.goto('/services/crm?internal_qa=1', { waitUntil: 'domcontentloaded' });
    expect(requests).toBe(0);
    await expect(page.getByRole('heading', { name: 'Every inquiry needs an owner.' })).toBeVisible();
    await page.getByLabel('Your name').fill('Internal QA');
    await page.getByLabel('Business email').fill('qa@example.invalid');
    await page.getByLabel('What would you like to improve?').fill('Synthetic browser test; no real submission.');
    await page.getByRole('button', { name: 'Send project inquiry' }).click();
    await expect(page.locator('[data-form-status]')).toContainText('received');
    expect(requests).toBe(1);
    expect(captured.page).toBe('/services/crm');
    expect(captured.form_type).toBe('expansion_project_inquiry');
    expect(captured.service_interest).toBe('CRM Setup & Lead Follow-Up for Arizona Businesses | ZiaFlow');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
