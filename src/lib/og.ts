// The social cards. src/pages/og/[...route].ts draws one PNG per page;
// Site.astro and src/route-data.ts point each page at its own.

export type Card = { title: string; description?: string };

/** `/docs/install/` gives `docs/install`, and `/` gives `index`. */
export function cardKey(pathname: string): string {
  return pathname.replace(/^\/|\/$/g, '') || 'index';
}

/** The address of a page's card. */
export function cardUrl(pathname: string, site: URL | undefined): string {
  return new URL(`/og/${cardKey(pathname)}.png`, site).href;
}

/** The Open Graph tags for a page's card, as [property, content] pairs. */
export function cardMeta(
  pathname: string,
  site: URL | undefined,
  alt: string,
): [property: string, content: string][] {
  return [
    ['og:image', cardUrl(pathname, site)],
    ['og:image:type', 'image/png'],
    ['og:image:width', '1200'],
    ['og:image:height', '630'],
    ['og:image:alt', alt],
  ];
}

// The card is 1200 by 630 with the title at 72 px and the description at
// 32 px. Longer text than this runs off its lower edge.
const TITLE_MAX = 40;
const DESCRIPTION_MAX = 160;

/** Throws, and so fails the build, when a card's text would not fit. */
export function checkCard(key: string, card: Card): void {
  if (card.title.length > TITLE_MAX) {
    throw new Error(
      `The social card of "${key}" has a title of ${card.title.length} characters; ${TITLE_MAX} fit.`,
    );
  }
  const description = card.description ?? '';
  if (description.length > DESCRIPTION_MAX) {
    throw new Error(
      `The social card of "${key}" has a description of ${description.length} characters; ${DESCRIPTION_MAX} fit.`,
    );
  }
}
