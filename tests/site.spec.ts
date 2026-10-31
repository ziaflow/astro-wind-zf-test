import { test, expect } from '@playwright/test';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`Kairo homepage and menu at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/ZiaFlow/);
    await expect(page.locator('main h1')).toBeVisible();
    if (viewport.width >= 1024) {
      await expect(page.getByRole('navigation', { name: 'Primary', exact: true })).toBeVisible();
      await expect(
        page.getByRole('navigation', { name: 'Primary', exact: true }).locator('a[href="/services"]')
      ).toBeVisible();
      return;
    }
    const toggle = page.locator('[data-menu-toggle]');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('[data-menu]')).toHaveAttribute('aria-hidden', 'false');
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
}
