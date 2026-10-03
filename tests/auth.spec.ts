import { test, expect } from '@playwright/test';

test.describe('المصادقة', () => {
  test('لوحة التاجر محمية', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('لوحة الأدمن محمية', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/login/);
  });

  test('نموذج التسجيل يعرض الحقول', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByPlaceholder('محمد أحمد علي')).toBeVisible();
    await expect(page.getByPlaceholder('0912345678')).toBeVisible();
    await expect(page.getByPlaceholder('trader@example.com')).toBeVisible();
  });

  test('التحقق من صيغة الهاتف', async ({ page }) => {
    await page.goto('/register');
    const phone = page.getByPlaceholder('0912345678');
    await phone.fill('123');
    const form = page.locator('form');
    const valid = await form.evaluate((el: HTMLFormElement) => el.checkValidity());
    expect(valid).toBe(false);
  });
});
