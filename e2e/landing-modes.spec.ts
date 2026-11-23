import { expect, test } from '@playwright/test';
import { installCommands } from '../src/lib/install.ts';

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('nothing is pinned and the hero demo does not animate', async ({
    page,
  }) => {
    await page.goto('/');
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    });
    await expect(page.locator('.pin-spacer')).toHaveCount(0);

    const animations = await page.evaluate(
      () =>
        document
          .querySelector('[data-hero-demo]')!
          .getAnimations({ subtree: true }).length,
    );
    expect(animations).toBe(0);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the headline, the commands and the FAQ answers show', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Screen recorder your agent can use.',
    );

    const install = page.locator('[data-install]').first();
    for (const command of installCommands) {
      await expect(
        install.getByText(command.text, { exact: true }),
      ).toBeVisible();
    }

    const faq = page.locator('#faq');
    await expect(
      faq.getByText('No. recdr never uploads anything.'),
    ).toBeVisible();
    await expect(faq.getByText('Delete the binary.')).toBeVisible();
  });
});
