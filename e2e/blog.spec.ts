import { expect, test } from '@playwright/test';

test('/blog/ is the list of posts', async ({ page }) => {
  await page.goto('/blog/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog');
});
