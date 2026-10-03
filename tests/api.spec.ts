import { test, expect } from '@playwright/test';

test.describe('API', () => {
  test('نقطة تتبع النقرات تعمل', async ({ request }) => {
    // UUID وهمي — يجب ألا يفشل
    const res = await request.post(
      '/api/products/00000000-0000-0000-0000-000000000000/click'
    );
    expect([200, 404]).toContain(res.status());
  });
});
