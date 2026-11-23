import { expect, test } from '@playwright/test';

test('/docs/ is the start page of the docs', async ({ page }) => {
  const response = await page.goto('/docs/');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('recdr');
});

test('the docs are dark only', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'light' });
  const page = await context.newPage();
  await page.goto('/docs/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('starlight-theme-select')).toHaveCount(0);
  await expect(page.locator('starlight-lang-select')).toHaveCount(0);
  await context.close();
});

test('the docs share the header and footer of the site', async ({ page }) => {
  await page.goto('/docs/');
  const header = page.getByRole('banner');
  await expect(header.getByRole('link', { name: 'recdr' })).toHaveAttribute(
    'href',
    '/',
  );
  await expect(
    header.getByRole('link', { name: 'Install', exact: true }),
  ).toHaveAttribute('href', '/#install');
  // Starlight renders its footer inside <main>, so it is no landmark.
  await expect(
    page.getByText('recdr is open source under the MIT license.'),
  ).toBeVisible();
});
