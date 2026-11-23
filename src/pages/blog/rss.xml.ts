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
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.id}/`,
    })),
  });
};
