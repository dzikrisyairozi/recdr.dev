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
  // The pinned scene brings the strip's buttons in over 60% of a viewport
  // height of scrolling. Before that they cannot take focus.
  await expect(page.locator('#frames .pin-spacer')).toBeAttached();
  await page.evaluate(() => {
    const top = document.querySelector('#frames')!.getBoundingClientRect().top;
    window.scrollTo(0, top + window.scrollY + window.innerHeight * 0.6);
  });
  const buttons = page.locator('[data-scrub-strip] button');
  await expect(buttons.first()).toBeVisible();

  const readout = page.locator('[data-scrub-readout]');
  await expect(readout).toContainText('frame 000001');
  await buttons.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(readout).toContainText('frame 000002');
  await expect(buttons.nth(1)).toHaveAttribute('aria-pressed', 'true');
});

test('the sections follow the hero in order', async ({ page }) => {
  await page.goto('/');
  const ids = await page
    .locator('main > section')
    .evaluateAll((sections) => sections.map((section) => section.id));
  expect(ids).toEqual(['top', 'why', 'how', 'frames', 'files']);
});

test('a section heading is revealed when it scrolls into view', async ({
  page,
}) => {
  await page.goto('/');
  const heading = page.locator('#how h2');
  await expect(heading).not.toHaveAttribute('data-revealed');
  // The pinned scenes add a screen of scrolling above #how when they start,
  // so scroll only once they are in place.
  await expect(page.locator('#how .pin-spacer')).toBeAttached();
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveAttribute('data-revealed');
});

test('the scroll scenes are requested after the load event', async ({
  page,
}) => {
  await page.goto('/');
  // The browser's own timings: when the chunk was requested, and when the
  // load event started.
  const timing = await page.waitForFunction(() => {
    const chunk = performance
      .getEntriesByType('resource')
      .find((entry) => entry.name.includes('scroll-scenes'));
    const [navigation] = performance.getEntriesByType('navigation');
    if (!chunk || !navigation) return null;
    return {
      requested: chunk.startTime,
      load: (navigation as PerformanceNavigationTiming).loadEventStart,
    };
  });
  const { requested, load } = (await timing.jsonValue())!;
  expect(load).toBeGreaterThan(0);
  expect(requested).toBeGreaterThanOrEqual(load);
});

test('the #how scene is pinned', async ({ page }) => {
  await page.goto('/');
  await page.locator('#how').scrollIntoViewIfNeeded();
  await expect(page.locator('#how .pin-spacer')).toBeAttached();
});

test('#files shows the six kinds of file a recording leaves', async ({
  page,
}) => {
  await page.goto('/');
  const files = page.locator('#files');
  await expect(files.getByRole('heading', { level: 3 })).toHaveText([
    'frames/000001.png, ...',
    'manifest.json',
    'diff.json',
    'contact_sheet.png',
    'recording.gif, recording.mp4',
    'result.json',
  ]);
  await expect(files.locator('pre').last()).toContainText('"stop_reason"');
});
