import type { Page } from '@playwright/test';

/** Collects uncaught errors, console errors and failed requests of a page. */
export function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('requestfailed', (request) =>
    errors.push(`requestfailed: ${request.url()}`),
  );
  return errors;
}
