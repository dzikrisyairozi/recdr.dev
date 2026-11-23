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

test('the header links to the docs from the landing page', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page
    .getByRole('banner')
    .getByRole('link', { name: 'Docs', exact: true })
    .click();
  await expect(page).toHaveURL(/\/docs\/$/);
});

test('the start page leads to Install and Quick start', async ({ page }) => {
  await page.goto('/docs/');
  const content = page.locator('.sl-markdown-content');
  await content.getByRole('link', { name: 'Install' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Install');
  await page.goto('/docs/');
  await content.getByRole('link', { name: 'Quick start' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Quick start',
  );
});

// One entry per page of the docs: its URL and its <h1>.
const pages: [string, string][] = [
  ['/docs/', 'recdr'],
  ['/docs/install/', 'Install'],
  ['/docs/quick-start/', 'Quick start'],
  ['/docs/guides/browser-tabs/', 'Record a browser tab'],
  ['/docs/guides/export/', 'Export part of a recording'],
  ['/docs/guides/app/', 'The app'],
];

test('every docs page answers and has its title', async ({ page }) => {
  for (const [url, title] of pages) {
    const response = await page.goto(url);
    expect(response?.status(), url).toBe(200);
    await expect(page.getByRole('heading', { level: 1 }), url).toHaveText(
      title,
    );
  }
});
