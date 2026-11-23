import { expect, test } from '@playwright/test';

const releasesUrl = 'https://github.com/dzikrisyairozi/recdr/releases';

test('/changelog/ lists the releases, or links to them on GitHub', async ({
  page,
}) => {
  await page.goto('/changelog/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Changelog');
  // A build without network access has no release to show.
  await expect(
    page
      .locator('main article')
      .or(page.locator(`main a[href="${releasesUrl}"]`))
      .first(),
  ).toBeVisible();
});

for (const path of ['/', '/docs/']) {
  test(`the header on ${path} links to the changelog`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(path);
    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Changelog', exact: true })
      .click();
    await expect(page).toHaveURL(/\/changelog\/$/);
  });
}

test('a release can be linked to by its tag', async ({ page }) => {
  await page.goto('/changelog/');
  const release = page.locator('main article').first();
  test.skip((await release.count()) === 0, 'built without network access');
  const tag = await release.getByRole('heading', { level: 2 }).innerText();
  await expect(release).toHaveAttribute('id', tag.trim());
});
