import { expect, test } from '@playwright/test';

const title = 'Introducing recdr';

test('/blog/ links to the launch post', async ({ page }) => {
  await page.goto('/blog/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog');
  await page.getByRole('link', { name: title }).click();
  await expect(page).toHaveURL(/\/blog\/introducing-recdr\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
});

test('the feed is XML and has the launch post', async ({ page, request }) => {
  const response = await request.get('/blog/rss.xml');
  expect(response.status()).toBe(200);
  const xml = await response.text();

  await page.goto('/blog/');
  const titles = await page.evaluate((source) => {
    const feed = new DOMParser().parseFromString(source, 'application/xml');
    if (feed.querySelector('parsererror')) return null;
    return [...feed.querySelectorAll('item > title')].map(
      (item) => item.textContent,
    );
  }, xml);
  expect(titles).toContain(title);
});

test('the header links to the blog', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page
    .getByRole('banner')
    .getByRole('link', { name: 'Blog', exact: true })
    .click();
  await expect(page).toHaveURL(/\/blog\/$/);
});

test('code in a post is light text on the dark page', async ({ browser }) => {
  // Expressive Code, which Starlight brings, renders the code blocks. It
  // follows the system theme unless <html> names one.
  const context = await browser.newContext({ colorScheme: 'light' });
  const page = await context.newPage();
  await page.goto('/blog/introducing-recdr/');
  const [red, green, blue] = await page
    .locator('.prose pre span')
    .first()
    .evaluate((span) =>
      getComputedStyle(span).color.match(/\d+/g)!.map(Number),
    );
  expect(red! + green! + blue!).toBeGreaterThan(450);
  await context.close();
});

for (const path of ['/', '/blog/', '/changelog/']) {
  test(`${path} announces the feed to feed readers`, async ({ page }) => {
    await page.goto(path);
    const feed = page.locator('link[rel="alternate"]');
    await expect(feed).toHaveAttribute('type', 'application/rss+xml');
    await expect(feed).toHaveAttribute('title', 'recdr blog');
    await expect(feed).toHaveAttribute('href', '/blog/rss.xml');
  });
}

test('/blog/ has a visible link to the feed', async ({ page }) => {
  await page.goto('/blog/');
  await expect(
    page.getByRole('main').getByRole('link', { name: 'RSS feed' }),
  ).toHaveAttribute('href', '/blog/rss.xml');
});

test('a post describes itself to search engines as a BlogPosting', async ({
  page,
}) => {
  await page.goto('/blog/introducing-recdr/');
  const data: unknown = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ??
      '',
  );
  expect(data).toMatchObject({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    datePublished: '2026-11-23',
    url: 'https://recdr.dev/blog/introducing-recdr/',
    author: { '@type': 'Organization', name: 'recdr' },
  });
  expect(data).toHaveProperty(
    'description',
    await page.locator('meta[name="description"]').getAttribute('content'),
  );
});
