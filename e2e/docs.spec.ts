import { expect, test } from '@playwright/test';

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
  ['/docs/guides/mcp/', 'MCP'],
  ['/docs/guides/macos-permissions/', 'macOS permissions'],
  ['/docs/reference/commands/', 'Commands'],
  ['/docs/reference/output-files/', 'What a recording leaves'],
  ['/docs/reference/stop-reasons/', 'Stop reasons'],
  ['/docs/reference/error-codes/', 'Error codes'],
  ['/docs/reference/limits/', 'Limits'],
  ['/docs/build-from-source/', 'Build from source'],
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

test('search finds the commands page', async ({ page }) => {
  await page.goto('/docs/');
  await page.getByRole('button', { name: 'Search' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').fill('record');
  await expect(
    dialog.locator('a[href="/docs/reference/commands/"]').first(),
  ).toBeVisible();
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('a docs page fits the screen and its menu opens', async ({ page }) => {
    // The commands page has the widest code blocks of the docs.
    await page.goto('/docs/reference/commands/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    const link = page.getByRole('link', { name: 'Error codes' });
    await expect(link).toBeHidden();
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(link).toBeVisible();
  });
});

test('the landing page links into the docs from its body', async ({
  page,
  request,
}) => {
  await page.goto('/');
  for (const href of [
    '/docs/install/',
    '/docs/guides/mcp/',
    '/docs/reference/output-files/',
    '/docs/guides/macos-permissions/',
    '/docs/reference/limits/',
  ]) {
    await expect(page.locator(`main a[href="${href}"]`)).toHaveCount(1);
    expect((await request.get(href)).status()).toBe(200);
  }
});
