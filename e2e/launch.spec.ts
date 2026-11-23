import { expect, test } from '@playwright/test';

const cardPages = [
  '/',
  '/docs/install/',
  '/blog/',
  '/changelog/',
  '/blog/introducing-recdr/',
];

for (const path of cardPages) {
  test(`the social card of ${path} is a 1200 by 630 PNG`, async ({
    page,
    request,
  }) => {
    await page.goto(path);
    const image = await page
      .locator('meta[property="og:image"]')
      .getAttribute('content');
    expect(image).toMatch(/^https:\/\/recdr\.dev\/og\/.+\.png$/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );

    // The tag names the live site; the file is checked on this server.
    const response = await request.get(new URL(image!).pathname);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('image/png');
    // A PNG stores its width and height in bytes 16 to 23.
    const body = await response.body();
    expect(body.readUInt32BE(16)).toBe(1200);
    expect(body.readUInt32BE(20)).toBe(630);
  });
}

test('the 404 page has no social card', async ({ page }) => {
  await page.goto('/nowhere/');
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
});

test('the sitemap exists and robots.txt names it', async ({ request }) => {
  expect((await request.get('/sitemap-index.xml')).status()).toBe(200);
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Sitemap: https://recdr.dev/sitemap-index.xml');
});

for (const path of ['/', '/docs/install/']) {
  test(`${path} loads no script from another site`, async ({ page }) => {
    await page.goto(path);
    const sources = await page
      .locator('script[src]')
      .evaluateAll((scripts) =>
        scripts.map((script) => (script as HTMLScriptElement).src),
      );
    for (const source of sources) {
      expect(new URL(source).origin).toBe(new URL(page.url()).origin);
    }
  });
}
