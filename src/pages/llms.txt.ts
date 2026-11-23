// /llms.txt: what recdr is and where its docs are, as Markdown, for a language
// model that reads the site (https://llmstxt.org). Built from the docs
// collection and the install commands, so it cannot fall behind them.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { REPO } from '../lib/github.ts';
import { installCommands } from '../lib/install.ts';

export const GET: APIRoute = async ({ site }) => {
  const docs = (await getCollection('docs'))
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => a.id.localeCompare(b.id));
  // The docs home page opens with the README's first paragraph.
  const summary = docs.find((entry) => entry.id === 'docs')?.body?.trim();
  if (!summary) throw new Error('src/content/docs/docs/index.md has no text');

  const link = (title: string, path: string, description?: string) =>
    `- [${title}](${new URL(path, site).href})${description ? `: ${description}` : ''}`;

  const text = [
    '# recdr',
    `> ${summary.split('\n\n')[0]}`,
    '## Install',
    installCommands
      .map((command) => `- ${command.label}: \`${command.text}\``)
      .join('\n'),
    '## Docs',
    docs
      .map((entry) =>
        link(entry.data.title, `/${entry.id}/`, entry.data.description),
      )
      .join('\n'),
    '## More',
    [
      link('Changelog', '/changelog/', 'Every release and what changed in it.'),
      link('Blog', '/blog/'),
      `- [Source on GitHub](https://github.com/${REPO})`,
    ].join('\n'),
  ].join('\n\n');

  return new Response(`${text}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
