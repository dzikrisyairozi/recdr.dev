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
