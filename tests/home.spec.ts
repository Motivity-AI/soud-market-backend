import { test, expect } from '@playwright/test';

test.describe('الصفحة الرئيسية', () => {
  test('تُحمّل وتعرض العنوان', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/بورصة أسعار السودان/);
    await expect(page.locator('h1')).toContainText('الأسعار المتاحة');
  });

  test('البحث يعمل', async ({ page }) => {
    await page.goto('/');
    const search = page.getByPlaceholder('ابحث عن منتج، تاجر، أو سوق...');
    await expect(search).toBeVisible();
    await search.fill('سكر');
    await page.waitForTimeout(300);
    // يجب ألا يظهر خطأ
    await expect(page.locator('body')).not.toContainText('حدث خطأ');
  });

  test('فلتر التصنيف موجود', async ({ page }) => {
    await page.goto('/');
    const select = page.locator('select').first();
    await expect(select).toBeVisible();
  });
});

test.describe('التنقل', () => {
  test('زر حساب تاجر يفتح التسجيل', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /حساب تاجر/ }).click();
    await expect(page).toHaveURL(/register/);
    await expect(page.locator('h1')).toContainText('حساب تاجر جديد');
  });

  test('رابط الدخول يعمل', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'دخول' }).click();
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('صفحة 404', () => {
  test('تعرض رسالة مناسبة', async ({ page }) => {
    await page.goto('/صفحة-غير-موجودة');
    await expect(page.locator('body')).toContainText('الصفحة غير موجودة');
  });
});
