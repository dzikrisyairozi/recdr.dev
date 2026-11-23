import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cardKey, cardMeta, checkCard } from './og.ts';

test('cardKey is the path without its outer slashes, and index for the home page', () => {
  assert.equal(cardKey('/'), 'index');
  assert.equal(cardKey('/changelog/'), 'changelog');
  assert.equal(cardKey('/docs/'), 'docs');
  assert.equal(
    cardKey('/docs/reference/output-files/'),
    'docs/reference/output-files',
  );
  assert.equal(cardKey('/blog/introducing-recdr/'), 'blog/introducing-recdr');
});

test('cardMeta gives the image, its type, its size and its alt text', () => {
  assert.deepEqual(
    cardMeta('/docs/install/', new URL('https://recdr.dev'), 'Install | recdr'),
    [
      ['og:image', 'https://recdr.dev/og/docs/install.png'],
      ['og:image:type', 'image/png'],
      ['og:image:width', '1200'],
      ['og:image:height', '630'],
      ['og:image:alt', 'Install | recdr'],
    ],
  );
});

test('checkCard accepts text that fits the card', () => {
  checkCard('blog', { title: 'a'.repeat(40), description: 'b'.repeat(160) });
  checkCard('index', { title: 'Screen recorder your agent can use.' });
});

test('checkCard names the page whose title or description is too long', () => {
  assert.throws(
    () => checkCard('blog/a-long-post', { title: 'a'.repeat(41) }),
    /blog\/a-long-post.*title.*41/,
  );
  assert.throws(
    () =>
      checkCard('docs/install', {
        title: 'Install',
        description: 'b'.repeat(161),
      }),
    /docs\/install.*description.*161/,
  );
});
