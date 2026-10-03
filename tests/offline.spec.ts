import { test, expect } from '@playwright/test';

test.describe('وضع الأوفلاين', () => {
  test('يظهر بانر عدم الاتصال', async ({ page, context }) => {
    await page.goto('/');
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await expect(page.locator('text=أنت غير متصل')).toBeVisible({ timeout: 5000 });
    await context.setOffline(false);
  });

  test('يتعافى عند عودة الاتصال', async ({ page, context }) => {
    await page.goto('/');
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await expect(page.locator('text=أنت غير متصل')).toBeVisible({ timeout: 5000 });

    await context.setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await page.waitForTimeout(1000);
    await expect(page.locator('text=أنت غير متصل')).toBeHidden({ timeout: 5000 });
  });
});
