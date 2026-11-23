import { REPO } from './github.ts';

/** The links of the site header, and of the docs menu on a phone. */
export const siteLinks: { href: string; label: string }[] = [
  { href: '/docs/', label: 'Docs' },
  { href: '/changelog/', label: 'Changelog' },
  { href: `https://github.com/${REPO}`, label: 'GitHub' },
];
