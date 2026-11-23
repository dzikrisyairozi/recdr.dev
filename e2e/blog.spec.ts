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
