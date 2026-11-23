import { expect, test, type APIRequestContext } from '@playwright/test';
import { installCommands } from '../src/lib/install.ts';

/** The path of every page the sitemap lists. */
async function sitemapPaths(request: APIRequestContext): Promise<string[]> {
  const xml = await (await request.get('/sitemap-0.xml')).text();
  return [...xml.matchAll(/<loc>https:\/\/recdr\.dev([^<]+)<\/loc>/g)].map(
    (match) => match[1]!,
  );
}

/** The content of a <meta property="..."> tag in a page's HTML. */
function meta(html: string, property: string): string | undefined {
  return html.match(
    new RegExp(`<meta property="${property}" content="([^"]*)"`),
  )?.[1];
}

test('every page in the sitemap has a 1200 by 630 PNG as its social card', async ({
  request,
}) => {
  const paths = await sitemapPaths(request);
  // The landing page, the changelog, the blog and its post, and 14 docs pages.
  expect(paths.length).toBeGreaterThanOrEqual(18);

  for (const path of paths) {
    const html = await (await request.get(path)).text();
    const image = meta(html, 'og:image');
    expect(image, path).toMatch(/^https:\/\/recdr\.dev\/og\/.+\.png$/);
    expect(meta(html, 'og:image:type'), path).toBe('image/png');
    expect(meta(html, 'og:image:width'), path).toBe('1200');
    expect(meta(html, 'og:image:height'), path).toBe('630');
    expect(meta(html, 'og:image:alt'), path).toBeTruthy();
    expect(meta(html, 'og:site_name'), path).toBe('recdr');
    expect(html, path).toContain(
      '<meta name="twitter:card" content="summary_large_image"',
    );

    // The tag names the live site; the file is checked on this server.
    const response = await request.get(new URL(image!).pathname);
    expect(response.status(), path).toBe(200);
    expect(response.headers()['content-type'], path).toBe('image/png');
    // A PNG stores its width and height in bytes 16 to 23.
    const body = await response.body();
    expect(body.readUInt32BE(16), path).toBe(1200);
    expect(body.readUInt32BE(20), path).toBe(630);
  }
});

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

test('the landing page describes recdr and its FAQ as structured data', async ({
  page,
}) => {
  await page.goto('/');
  const data = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ??
      '',
  ) as { '@graph': { '@type': string; [key: string]: unknown }[] };
  const [app, faq] = data['@graph'];

  expect(app).toMatchObject({
    '@type': 'SoftwareApplication',
    name: 'recdr',
    url: 'https://recdr.dev/',
    operatingSystem: 'Windows, macOS, Linux',
    license: 'https://opensource.org/license/mit',
  });

  // One entry per question on the page, with the answer as plain text.
  const asked = await page.locator('#faq h3').allInnerTexts();
  const entries = faq?.mainEntity as {
    name: string;
    acceptedAnswer: { text: string };
  }[];
  expect(faq?.['@type']).toBe('FAQPage');
  expect(entries.map((entry) => entry.name)).toEqual(asked);
  for (const entry of entries) {
    expect(entry.acceptedAnswer.text).not.toContain('<');
  }
  expect(entries[0]?.acceptedAnswer.text).toContain(
    'which is ./.recdr unless you pass --out.',
  );
});

test('/llms.txt lists the install commands and every docs page', async ({
  request,
}) => {
  const response = await request.get('/llms.txt');
  expect(response.status()).toBe(200);
  const text = await response.text();
  expect(text.startsWith('# recdr\n\n> recdr records a window')).toBe(true);
  for (const command of installCommands) {
    expect(text).toContain(command.text);
  }
  const docs = (await sitemapPaths(request)).filter((path) =>
    path.startsWith('/docs/'),
  );
  expect(docs.length).toBe(14);
  for (const path of docs) {
    expect(text).toContain(`](https://recdr.dev${path}): `);
  }
});

// One page of each kind: the landing page, a docs page, the changelog, the
// blog and a post.
for (const [path, title] of [
  ['/', 'recdr: screen recorder your agent can use'],
  ['/docs/install/', 'Install | recdr'],
  ['/changelog/', 'Changelog | recdr'],
  ['/blog/', 'Blog | recdr'],
  ['/blog/introducing-recdr/', 'Introducing recdr | recdr'],
] as const) {
  test(`${path} has its title, description and canonical address`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(title);

    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(description?.length).toBeGreaterThan(50);
    expect(description?.length).toBeLessThanOrEqual(160);

    const address = `https://recdr.dev${path}`;
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      address,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      address,
    );
  });
}

test('the sitemap lists every page and nothing else', async ({ request }) => {
  const paths = await sitemapPaths(request);
  expect(paths).toEqual(
    expect.arrayContaining([
      '/',
      '/changelog/',
      '/blog/',
      '/blog/introducing-recdr/',
      '/docs/',
      '/docs/install/',
      '/docs/quick-start/',
      '/docs/build-from-source/',
      '/docs/guides/app/',
      '/docs/guides/browser-tabs/',
      '/docs/guides/export/',
      '/docs/guides/macos-permissions/',
      '/docs/guides/mcp/',
      '/docs/reference/commands/',
      '/docs/reference/error-codes/',
      '/docs/reference/limits/',
      '/docs/reference/output-files/',
      '/docs/reference/stop-reasons/',
    ]),
  );
  expect(paths).toHaveLength(18);
});
