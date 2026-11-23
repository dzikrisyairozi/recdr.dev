import { expect, test } from '@playwright/test';

test('the hero has the headline, the install block and the demo', async ({
  page,
}) => {
  await page.goto('/');
  const hero = page.locator('section#top');
  await expect(hero.getByRole('heading', { level: 1 })).toHaveText(
    'Screen recorder your agent can use.',
  );
  await expect(hero.locator('[data-install]')).toBeVisible();
  await expect(hero.locator('[data-hero-demo]')).toBeVisible();
});

test('the hero demo runs its timecode', async ({ page }) => {
  await page.goto('/');
  // On a phone the demo starts below the fold, where it is paused.
  await page.locator('[data-hero-demo]').scrollIntoViewIfNeeded();
  // The recording part of the loop starts 1.5 s in.
  await expect(page.locator('[data-demo-timecode]')).not.toHaveText('00:00.0', {
    timeout: 6000,
  });
});

test('the right arrow key moves the scrubber to the next frame', async ({
  page,
}) => {
  await page.goto('/');
  const readout = page.locator('[data-scrub-readout]');
  await expect(readout).toContainText('frame 000001');
  await page.locator('[data-scrub-strip] button').first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(readout).toContainText('frame 000002');
  await expect(
    page.locator('[data-scrub-strip] button').nth(1),
  ).toHaveAttribute('aria-pressed', 'true');
});

test('the sections follow the hero in order', async ({ page }) => {
  await page.goto('/');
  const ids = await page
    .locator('main > section')
    .evaluateAll((sections) => sections.map((section) => section.id));
  expect(ids).toEqual(['top', 'why', 'how', 'frames']);
});

test('a section heading is revealed when it scrolls into view', async ({
  page,
}) => {
  await page.goto('/');
  const heading = page.locator('#how h2');
  await expect(heading).not.toHaveAttribute('data-revealed');
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveAttribute('data-revealed');
});
