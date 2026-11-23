import { expect, test } from '@playwright/test';

test('/docs/ is the start page of the docs', async ({ page }) => {
  const response = await page.goto('/docs/');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('recdr');
});
