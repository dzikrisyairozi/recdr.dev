import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { cardMeta } from './lib/og.ts';

// Starlight writes the Open Graph title and description of a docs page, and
// the twitter:card tag, itself. This adds the card that
// src/pages/og/[...route].ts draws for the page.
export const onRequest = defineRouteMiddleware((context) => {
  const { head } = context.locals.starlightRoute;
  const title = head.find((tag) => tag.tag === 'title')?.content ?? 'recdr';
  for (const [property, content] of cardMeta(
    context.url.pathname,
    context.site,
    title,
  )) {
    head.push({ tag: 'meta', attrs: { property, content } });
  }
});
