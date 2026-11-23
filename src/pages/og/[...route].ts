import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { publishedPosts } from '../../lib/blog.ts';
import { headline } from '../../lib/landing.ts';
import { checkCard, type Card } from '../../lib/og.ts';

// The key is the page's path without its outer slashes, so /docs/install/
// has its card at /og/docs/install.png. cardKey in src/lib/og.ts works the
// same key out from a page's URL.
const pages: Record<string, Card> = {
  index: { title: headline },
  changelog: { title: 'recdr changelog' },
  blog: { title: 'recdr blog' },
};
for (const entry of await getCollection('docs')) {
  // A draft has no page in a production build, so it needs no card.
  if (!entry.data.draft) pages[entry.id] = entry.data;
}
for (const post of publishedPosts(await getCollection('blog'))) {
  pages[`blog/${post.id}`] = post.data;
}
for (const [key, card] of Object.entries(pages)) checkCard(key, card);

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgImage: { path: './src/assets/og/bg.png', fit: 'cover' },
    logo: { path: './src/assets/og/logo.png', size: [96] },
    padding: 72,
    fonts: [
      './src/assets/og/Geist-SemiBold.ttf',
      './src/assets/og/GeistMono-Regular.ttf',
    ],
    font: {
      title: {
        size: 72,
        families: ['Geist'],
        weight: 'SemiBold',
        color: [242, 243, 245],
      },
      description: {
        size: 32,
        families: ['Geist Mono'],
        color: [155, 161, 173],
      },
    },
  }),
});
