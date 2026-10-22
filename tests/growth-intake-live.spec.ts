import { test, expect } from '@playwright/test';
// Explicit opt-in; creates marked QA data. It cannot send welcome mail in this test setup.
test('marked live intake persists once and logs a held welcome', async ({ page }) => {
  test.skip(process.env.RUN_GROWTH_LIVE_QA !== 'true', 'Live database test requires explicit opt-in');
  const qaEmail = process.env.GROWTH_QA_EMAIL;
  if (!qaEmail) throw new Error('Set GROWTH_QA_EMAIL to an approved internal recipient');
  await page.goto('http://localhost:4321/growth-tools/website-project-estimator');
  await page.getByRole('button', { name: 'Show my results' }).click();
  const review = page.locator('#review-form');
  await review.getByLabel('Name', { exact: true }).fill('ZIAFLOW QA — connection verification');
  await review.getByLabel('Email', { exact: true }).fill(qaEmail);
  await review.getByLabel('Company', { exact: true }).fill('ZiaFlow internal QA');
  await review
    .getByLabel('What would you like help with?')
    .fill('INTERNAL TEST ONLY. Do not create a sales opportunity.');
  // Preserve the actual browser payload to replay its request ID, not an invented ID.
  const responsePromise = page.waitForResponse(
    (r) => r.url().endsWith('/api/growth-tools/intake') && r.request().method() === 'POST'
  );
  await review.getByRole('button', { name: 'Request a review', exact: true }).click();
  const response = await responsePromise;
  const body = await response.json();
  expect(response.status()).toBe(200);
  expect(body.ok).toBe(true);
  expect(body.welcome).toBe('held');
  const payload = response.request().postDataJSON();
  const duplicate = await page.request.post('http://localhost:4321/api/growth-tools/intake', {
    headers: { Origin: 'http://localhost:4321' },
    data: payload,
  });
  expect((await duplicate.json()).duplicate).toBe(true);
  await expect(page.locator('#review-status')).toContainText('Your review request is saved');
  console.log('LIVE_QA_REQUEST_ID', payload.id);
});
