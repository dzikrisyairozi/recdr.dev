import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { installCommands } from '../src/lib/install.ts';

declare global {
  interface Window {
    copiedText?: string;
  }
}

test('the home page renders without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('requestfailed', (request) =>
    errors.push(`requestfailed: ${request.url()}`),
  );
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Screen recorder your agent can use.',
  );
  expect(errors).toEqual([]);
});

// The landing page has a second install block further down, so these
// checks use the first one.
for (const [platform, label] of [
  ['Win32', 'PowerShell'],
  ['MacIntel', 'curl'],
] as const) {
  test(`the install block opens on ${label} when the platform is ${platform}`, async ({
    page,
  }) => {
    await page.addInitScript((value) => {
      Object.defineProperty(navigator, 'platform', { get: () => value });
    }, platform);
    await page.goto('/');
    const install = page.locator('[data-install]').first();
    await expect(install.getByRole('tab', { selected: true })).toHaveText(
      label,
    );
  });
}

test('Copy copies the command that is shown', async ({ page }) => {
  // WebKit rejects the clipboard-write permission, so the clipboard is replaced.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          window.copiedText = text;
        },
      },
    });
  });
  await page.goto('/');
  const install = page.locator('[data-install]').first();
  await install.getByRole('tab', { name: 'brew' }).click();
  await install.getByRole('button', { name: 'Copy' }).click();
  await expect(install.locator('[data-copy-status]')).toHaveText('Copied');
  expect(await page.evaluate(() => window.copiedText)).toBe(
    'brew install dzikrisyairozi/tap/recdr',
  );
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('all four install commands are visible', async ({ page }) => {
    await page.goto('/');
    const install = page.locator('[data-install]').first();
    for (const command of installCommands) {
      await expect(
        install.getByText(command.text, { exact: true }),
      ).toBeVisible();
    }
  });
});

test('the build output has both install redirects', () => {
  const redirects = readFileSync('dist/_redirects', 'utf8');
  expect(redirects).toContain(
    '/install.sh https://github.com/dzikrisyairozi/recdr/releases/latest/download/install.sh 302',
  );
  expect(redirects).toContain(
    '/install.ps1 https://github.com/dzikrisyairozi/recdr/releases/latest/download/install.ps1 302',
  );
});

test('the build output keeps pages.dev deployments out of search', () => {
  const headers = readFileSync('dist/_headers', 'utf8');
  expect(headers).toContain(
    'https://:project.pages.dev/*\n  X-Robots-Tag: noindex',
  );
});

test('the header timecode counts up', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-rec-timecode]').first()).not.toHaveText(
    '00:00.0',
  );
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the header timecode stays at 00:00.0', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1200);
    await expect(page.locator('[data-rec-timecode]').first()).toHaveText(
      '00:00.0',
    );
  });
});

test('an unknown path answers 404 with the custom page', async ({ page }) => {
  const response = await page.goto('/nope/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Page not found',
  );
});

test('every page but the home page has the site name in its title', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page).not.toHaveTitle(/\| recdr$/);
  await page.goto('/nowhere/');
  await expect(page).toHaveTitle('Page not found | recdr');
});

test('the 404 page is kept out of search indexes', async ({ page }) => {
  await page.goto('/nowhere/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex',
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

  await page.goto('/');
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://recdr.dev/',
  );
});
