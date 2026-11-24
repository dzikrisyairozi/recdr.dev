import { expect, test } from '@playwright/test';
import manifest from '../src/assets/demo/manifest.json' with { type: 'json' };
import { formatTimecode } from '../src/lib/timecode.ts';

declare global {
  interface Window {
    ringsSeen?: number;
  }
}

test('the hero has the headline, the install block and the frame stack', async ({
  page,
}) => {
  await page.goto('/');
  const hero = page.locator('section#top');
  await expect(hero.getByRole('heading', { level: 1 })).toHaveText(
    'Screen recorder your agent can use.',
  );
  await expect(hero.locator('[data-install]')).toBeVisible();

  // One plane per stored frame. The stack is decoration: the demo in the
  // next section is what a screen reader gets.
  const stack = hero.locator('[data-hero-stack]');
  await expect(stack).toBeVisible();
  await expect(stack).toHaveAttribute('aria-hidden', 'true');
  await expect(stack.locator('img')).toHaveCount(manifest.frames.length);
});

test('the frame stack loops, and stops while the hero is off screen', async ({
  page,
}) => {
  await page.goto('/');
  const stack = page.locator('[data-hero-stack]');
  // Not the animation that follows the scroll position, where there is one.
  const running = () =>
    stack.evaluate(
      (el) =>
        el
          .getAnimations({ subtree: true })
          .filter(
            (animation) =>
              animation.timeline === document.timeline &&
              animation.playState === 'running',
          ).length,
    );
  await expect.poll(running).toBeGreaterThan(0);

  await page.locator('#install').scrollIntoViewIfNeeded();
  await expect(stack).toHaveAttribute('data-offscreen', '');
  await expect.poll(running).toBe(0);
});

test('the demo has a section of its own under the hero', async ({ page }) => {
  await page.goto('/');
  const demo = page.locator('section#demo');
  await expect(demo.getByRole('heading', { level: 2 })).toHaveText(
    'Watch an agent use it',
  );
  await expect(demo.locator('[data-hero-demo]')).toBeVisible();
  // The hero's stack is the page's first image now.
  await expect(demo.locator('img[fetchpriority]')).toHaveCount(0);
});

// The demo loops: 2.4 s before the recording, the recording, 5.1 s after
// it. It starts below the fold, where it stands still, so these tests
// scroll to it first. Their waits add up to more than 30 s.
test.describe('the hero demo', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/');
    await page.locator('[data-hero-demo]').scrollIntoViewIfNeeded();
  });

  test('it plays', async ({ page }) => {
    await expect(page.locator('[data-hero-demo][data-live]')).toBeAttached({
      timeout: 15_000,
    });
    const timecode = page.locator('[data-demo-timecode]');
    const before = await timecode.textContent();
    await expect(timecode).not.toHaveText(before!, { timeout: 20_000 });
  });

  test('the pause button stops it and starts it again', async ({ page }) => {
    // While it records, the timecode changes ten times a second.
    await expect(page.locator('[data-hero-demo][data-recording]')).toBeAttached(
      { timeout: 20_000 },
    );
    const pause = page.locator('[data-demo-pause]');
    const timecode = page.locator('[data-demo-timecode]');
    await pause.click();
    await expect(pause).toHaveAttribute('aria-pressed', 'true');
    const stopped = await timecode.textContent();
    await page.waitForTimeout(500);
    await expect(timecode).toHaveText(stopped!);

    await pause.click();
    await expect(pause).toHaveAttribute('aria-pressed', 'false');
    await expect(timecode).not.toHaveText(stopped!, { timeout: 20_000 });
  });

  test('the pointer on the timeline shows the whole session', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'a phone has no pointer that rests on the timeline');
    const demo = page.locator('[data-hero-demo]');
    await expect(page.locator('[data-hero-demo][data-live]')).toBeAttached({
      timeout: 15_000,
    });
    // Before the recording starts the timeline has no tile yet.
    await demo.locator('[data-scrub-strip]').hover();
    await expect(demo.locator('.finding')).toBeVisible();
    await expect(
      demo.locator('[data-scrub-strip] button').last(),
    ).toBeVisible();

    await page.mouse.move(0, 0);
    await expect(demo.locator('.finding')).toBeHidden({ timeout: 20_000 });
  });

  test('a tile picked with the keyboard shows its frame until focus leaves', async ({
    page,
  }) => {
    const demo = page.locator('[data-hero-demo]');
    // The timeline has its first tile once the recording has started.
    await expect(page.locator('[data-hero-demo][data-recording]')).toBeAttached(
      { timeout: 20_000 },
    );
    const tiles = demo.locator('[data-scrub-strip] button');
    await tiles.first().focus();
    await page.keyboard.press('ArrowRight');

    const second = tiles.nth(1);
    await expect(second).toBeFocused();
    await expect(second).toHaveAttribute('aria-pressed', 'true');
    await expect(demo.locator('[data-scrub-image]')).toHaveAttribute(
      'src',
      (await second.getAttribute('data-full'))!,
    );
    const timecode = demo.locator('[data-demo-timecode]');
    const time = (await second.getAttribute('data-timecode'))!;
    await expect(timecode).toHaveText(time);
    await page.waitForTimeout(500);
    await expect(timecode).toHaveText(time);

    // Not a click somewhere else: that would scroll the page on a phone.
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expect(timecode).not.toHaveText(time, { timeout: 20_000 });
  });
});

test('the hero and #agents report the same finding', async ({ page }) => {
  await page.goto('/');
  const finding = await page.locator('[data-hero-demo] .finding').textContent();
  await expect(page.locator('#agents [data-chat] > li').last()).toContainText(
    finding!.trim(),
  );
});

test('the right arrow key moves the scrubber to the next frame', async ({
  page,
}) => {
  await page.goto('/');
  // The pinned scene brings the chart's bars in over 60% of a viewport
  // height of scrolling. Before that they cannot take focus.
  await expect(page.locator('#frames .pin-spacer')).toBeAttached();
  await page.evaluate(() => {
    const top = document.querySelector('#frames')!.getBoundingClientRect().top;
    window.scrollTo(0, top + window.scrollY + window.innerHeight * 0.6);
  });
  const buttons = page.locator('#frames [data-scrub-strip] button');
  await expect(buttons.first()).toBeVisible();

  const readout = page.locator('#frames [data-scrub-readout]');
  await expect(readout).toContainText('frame 000001');
  await buttons.first().focus();
  await page.keyboard.press('ArrowRight');
  // The strip rounds a frame's time to the nearest tenth of a second.
  const second = manifest.frames[1]!;
  const time = formatTimecode(Math.round(second.t_ms / 100) * 100);
  await expect(readout).toContainText(`frame 000002 · ${time}`);
  await expect(buttons.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#frames [data-scrub-json]')).toContainText(
    `"t_ms": ${second.t_ms}`,
  );
});

test('every bar of the frame chart has a name', async ({ page }) => {
  await page.goto('/');
  const names = await page
    .locator('#frames [data-scrub-strip] button')
    .evaluateAll((bars) => bars.map((bar) => bar.getAttribute('aria-label')));
  expect(names).toHaveLength(manifest.frames.length);
  for (const name of names) {
    expect(name).toMatch(/^Frame \d{6} at \d\d:\d\d\.\d, .+ changed$/);
  }
});

test('the pinned inspector fits a 1440 by 900 window', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('#frames .pin-spacer')).toBeAttached();
  await page.evaluate(() => {
    const top = document.querySelector('#frames')!.getBoundingClientRect().top;
    window.scrollTo(0, top + window.scrollY + window.innerHeight * 0.3);
  });
  // ScrollTrigger pins after the scroll event, not in the same task.
  const pin = page.locator('#frames [data-pin]');
  await expect(pin).toHaveCSS('position', 'fixed');
  const bottom = await pin.evaluate((el) => el.getBoundingClientRect().bottom);
  expect(bottom).toBeLessThanOrEqual(900);
});

test('the sections follow the hero in order', async ({ page }) => {
  await page.goto('/');
  const ids = await page
    .locator('main > section')
    .evaluateAll((sections) => sections.map((section) => section.id));
  expect(ids).toEqual([
    'top',
    'demo',
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
  await expect(items).toHaveCount(8);
  await page.locator('#agents [data-chat]').scrollIntoViewIfNeeded();
  // The items come in one at a time, 600 ms apart.
  for (const item of await items.all()) {
    await expect(item).toBeVisible({ timeout: 8000 });
  }
  await expect(page.locator('#agents')).toContainText(
    'claude mcp add recdr -- /path/to/recdr mcp',
  );
  await expect(items.last()).toContainText(
    /shows at \d+\.\ds and is gone by \d+\.\ds\./,
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

test('a link to /#install from another page lands on the install section', async ({
  page,
}) => {
  await page.goto('/#install');
  // The pinned scenes add scroll height above #install after the load event.
  await expect(page.locator('#how .pin-spacer')).toBeAttached();
  await expect(page.locator('#install [data-install]')).toBeInViewport();
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
