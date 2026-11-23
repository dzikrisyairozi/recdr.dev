import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    ringsSeen?: number;
  }
}

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
  expect(ids).toEqual([
    'top',
    'why',
    'how',
    'frames',
    'files',
    'agents',
    'platforms',
    'faq',
    'install',
  ]);
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

test('the chat in #agents shows every item once it is in view', async ({
  page,
}) => {
  await page.goto('/');
  const items = page.locator('#agents [data-chat] > li');
  await expect(items).toHaveCount(7);
  await page.locator('#agents [data-chat]').scrollIntoViewIfNeeded();
  // The items come in one at a time, 600 ms apart.
  for (const item of await items.all()) {
    await expect(item).toBeVisible({ timeout: 8000 });
  }
  await expect(page.locator('#agents')).toContainText(
    'claude mcp add recdr -- /path/to/recdr mcp',
  );
  await expect(items.last()).toContainText(
    /appears at \d\.\ds and is gone by \d\.\ds\./,
  );
});

test('the platform table says what runs where', async ({ page }) => {
  await page.goto('/');
  const table = page.locator('#platforms table');
  await expect(table.locator('caption')).toHaveText(
    'What recdr records on each system',
  );
  const row = table.getByRole('row', { name: /^Browser tab/ });
  await expect(row.getByRole('cell')).toHaveText(['Yes', 'Yes', 'Yes']);
});

test('the FAQ has eight questions with their answers showing', async ({
  page,
}) => {
  await page.goto('/');
  const faq = page.locator('#faq');
  await expect(faq.getByRole('heading', { level: 3 })).toHaveCount(8);
  await expect(
    faq.getByText('No. recdr never uploads anything.'),
  ).toBeVisible();
});

test('the header Install link leads to the install section', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('banner')
    .getByRole('link', { name: 'Install', exact: true })
    .click();
  await expect(page).toHaveURL(/#install$/);
  await expect(page.locator('#install [data-install]')).toBeInViewport();
  await expect(page.locator('#install')).toContainText('MIT license');
});

test('a click draws one ring, which is removed when it has faded', async ({
  page,
}) => {
  await page.goto('/');
  // A ring lives for 400 ms, so the page counts the rings itself; polling
  // for the element from here can miss it.
  await page.evaluate(() => {
    window.ringsSeen = 0;
    new MutationObserver((records) => {
      for (const record of records) {
        window.ringsSeen! += record.addedNodes.length;
      }
    }).observe(document.querySelector('[data-click-rings]')!, {
      childList: true,
    });
  });
  await page.mouse.click(200, 300);
  await expect.poll(() => page.evaluate(() => window.ringsSeen)).toBe(1);
  await expect(page.locator('[data-click-rings] .ring')).toHaveCount(0);
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('no section makes the page scroll sideways', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#how .pin-spacer')).toBeAttached();
    const ids = await page
      .locator('main > section')
      .evaluateAll((sections) => sections.map((section) => section.id));
    for (const id of ids) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `#${id}`).toBeLessThanOrEqual(0);
    }
  });
});
