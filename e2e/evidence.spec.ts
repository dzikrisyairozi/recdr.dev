// Takes a screenshot of every landing section at three widths:
//
//   EVIDENCE=1 pnpm test:e2e --project=chromium e2e/evidence.spec.ts
//
// The files go to spec/1-recdr-dev-site/evidence/, or to the folder in
// EVIDENCE_DIR. Everything under spec/ is git-ignored.
import { mkdirSync } from 'node:fs';
import { test } from '@playwright/test';

const out = process.env.EVIDENCE_DIR ?? 'spec/1-recdr-dev-site/evidence';
const ids = [
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
];

test.skip(!process.env.EVIDENCE, 'runs only with EVIDENCE=1');
// Reduced motion: no pinned scene, and nothing is half way through a fade.
test.use({ reducedMotion: 'reduce' });

for (const width of [390, 768, 1440]) {
  test(`landing sections at ${width} px`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'one browser is enough');
    mkdirSync(out, { recursive: true });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    for (const id of ids) {
      // Put the section right under the sticky header.
      await page.evaluate((sectionId) => {
        const section = document.getElementById(sectionId)!;
        const header = document.querySelector('header')!;
        window.scrollTo(
          0,
          section.getBoundingClientRect().top +
            window.scrollY -
            header.offsetHeight,
        );
      }, id);
      // Images below the fold load when they scroll into view.
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `${out}/${width}-${id}.png` });
    }
  });
}
