import assert from 'node:assert/strict';
import { test } from 'node:test';
import { publishedPosts } from './blog.ts';

const post = (id: string, date: string, draft = false) => ({
  id,
  data: { draft, date: new Date(date) },
});

test('publishedPosts drops drafts and sorts newest first', () => {
  const posts = [
    post('first', '2026-11-01'),
    post('unfinished', '2026-11-30', true),
    post('second', '2026-11-20'),
  ];
  assert.deepEqual(
    publishedPosts(posts).map((entry) => entry.id),
    ['second', 'first'],
  );
});

test('publishedPosts gives an empty list for no posts', () => {
  assert.deepEqual(publishedPosts([]), []);
});
