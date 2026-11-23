import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { publishedPosts } from '../../lib/blog.ts';

export const GET: APIRoute = async (context) => {
  const posts = publishedPosts(await getCollection('blog'));
  return rss({
    title: 'recdr blog',
    description: 'News about recdr.',
    // astro.config.ts sets `site`, so it is never undefined here.
    site: context.site!,
    // A feed that names its own address and language passes the W3C validator.
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>en</language><atom:link href="${new URL('/blog/rss.xml', context.site).href}" rel="self" type="application/rss+xml"/>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.id}/`,
    })),
  });
};
