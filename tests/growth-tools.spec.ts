import { test, expect } from '@playwright/test';
const base = 'http://localhost:4321';
test.beforeEach(async ({ page }) => {
  // These are local application checks, not a Clarity integration test. Keep QA
  // traffic out of live telemetry and avoid provider CORS failures in WebKit.
  await page.route(/^https:\/\/(?:[a-z0-9-]+\.)*clarity\.ms\//i, (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
  );
  page.on('pageerror', (error) => {
    throw error;
  });
});
const pages = [
  ['website-project-estimator', 'Website project estimator'],
  ['lead-follow-up-assessment', 'Lead follow-up assessment'],
  ['software-stack-assessment', 'Software stack assessment'],
  ['local-visibility-check', 'Local visibility check'],
  ['website-conversion-checklist', 'Website conversion checklist'],
];
for (const [slug, title] of pages) {
  test(slug + ' is independently usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + '/growth-tools/' + slug);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Show my results' }).click();
    await expect(page.getByRole('button', { name: 'Download report' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
test('unknowns stay unscored and edits require recalculation', async ({ page }) => {
  await page.goto(base + '/growth-tools/local-visibility-check');
  await page.locator('select[name=profile]').selectOption('unknown');
  await page.getByRole('button', { name: 'Show my results' }).click();
  await expect(page.locator('#results')).toContainText('More evidence needed');
  await page.locator('select[name=profile]').selectOption('yes');
  await expect(page.getByRole('button', { name: 'Download report' })).toBeHidden();
  await page.getByRole('button', { name: 'Show my results' }).click();
  await expect(page.locator('#results')).toContainText('Provisional readiness: 100/100');
  await expect(page.locator('#results')).toContainText('1 of 8 checks assessed');
});
test('estimator export preserves inputs and itemized result', async ({ page }) => {
  await page.goto(base + '/growth-tools/website-project-estimator');
  await page.getByRole('button', { name: 'Show my results' }).click();
  await expect(page.locator('#results')).toContainText('$6,800');
  await expect(page.locator('#results')).toContainText('68 planning hours');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download report' }).click();
  expect((await download).suggestedFilename()).toBe('website-project-estimator-report.json');
});
test('inventory overlap is a review candidate and removable', async ({ page }) => {
  await page.goto(base + '/growth-tools/software-stack-assessment');
  for (const name of ['Tool A', 'Tool B']) {
    await page.getByRole('button', { name: 'Add software', exact: true }).click();
    const row = page.locator('.stack-row').last();
    await row.locator('[data-name]').fill(name);
    await row.locator('[data-function]').fill('CRM');
    await row.locator('[data-cost]').fill('25');
  }
  await page.getByRole('button', { name: 'Show my results' }).click();
  await expect(page.locator('#results')).toContainText('$50/month');
  await expect(page.locator('#results')).toContainText('Review overlap in crm: Tool A, Tool B');
  await page.getByRole('button', { name: 'Remove software' }).first().click();
  await expect(page.getByRole('button', { name: 'Download report' })).toBeHidden();
});
test('separate tools do not reuse each other answers', async ({ page }) => {
  await page.goto(base + '/growth-tools/local-visibility-check');
  await page.locator('select[name=profile]').selectOption('yes');
  await page.goto(base + '/growth-tools/lead-follow-up-assessment');
  await expect(page.locator('select[name=capture]')).toHaveValue('');
  await page.goto(base + '/growth-tools/local-visibility-check');
  await expect(page.locator('select[name=profile]')).toHaveValue('yes');
  await page.getByRole('button', { name: 'Clear this assessment' }).click();
  await expect(page.locator('select[name=profile]')).toHaveValue('');
});

// Mock only the transport in this test; the opt-in live spec verifies actual persistence.
test('review form retains errors and retries the same request without leaking contact data to storage', async ({
  page,
}) => {
  await page.goto(base + '/growth-tools/website-project-estimator');
  await page.getByRole('button', { name: 'Show my results' }).click();
  const form = page.locator('#review-form');
  await form.getByLabel('Name', { exact: true }).fill('QA User');
  await form.getByLabel('Email', { exact: true }).fill('qa@example.com');
  const ids: string[] = [];
  await page.route('**/api/growth-tools/intake', async (route) => {
    const data = route.request().postDataJSON();
    ids.push(data.id);
    await route.fulfill({
      status: ids.length === 1 ? 503 : 200,
      contentType: 'application/json',
      body: JSON.stringify(ids.length === 1 ? { ok: false } : { ok: true, welcome: 'held' }),
    });
  });
  await form.getByRole('button', { name: 'Request a review', exact: true }).click();
  await expect(page.locator('#review-status')).toContainText('could not save');
  await expect(form.getByLabel('Email', { exact: true })).toHaveValue('qa@example.com');
  await form.getByRole('button', { name: 'Request a review', exact: true }).click();
  await expect(page.locator('#review-status')).toContainText('request is saved');
  expect(ids[0]).toBe(ids[1]);
  const state = await page.evaluate(() => JSON.stringify({ ...sessionStorage }));
  expect(state).not.toContain('qa@example.com');
});
test('print control invokes printing and local lookup includes entered business', async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => {
      document.body.dataset.printRequested = 'true';
    };
  });
  await page.goto(base + '/growth-tools/local-visibility-check');
  await page.getByLabel('Business name', { exact: true }).fill('ZiaFlow QA');
  await page.getByLabel('City / service area', { exact: true }).fill('Phoenix');
  await page.getByLabel('Main service', { exact: true }).fill('Web development');
  await page.getByLabel('Main service', { exact: true }).press('Tab');
  await expect(page.locator('#local-search')).toHaveAttribute('href', /ZiaFlow%20QA%20Phoenix%20Web%20development/);
  await page.getByRole('button', { name: 'Show my results' }).click();
  await page.getByRole('button', { name: 'Print / save PDF' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-print-requested', 'true');
});
