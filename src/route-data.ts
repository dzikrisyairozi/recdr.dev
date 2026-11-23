import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

// Starlight writes the Open Graph title and description of a docs page, and
// the twitter:card tag, itself. This adds the card that
// src/pages/og/[...route].ts draws for the page.
export const onRequest = defineRouteMiddleware((context) => {
  const { id, head } = context.locals.starlightRoute;
  const image = new URL(`/og/${id || 'index'}.png`, context.site);
  head.push({
    tag: 'meta',
    attrs: { property: 'og:image', content: image.href },
  });
});
