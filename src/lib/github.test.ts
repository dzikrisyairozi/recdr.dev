import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  fetchReleases,
  fetchStarCount,
  formatStars,
  type FetchLike,
} from './github.ts';

type Call = { url: string; headers: Record<string, string> };

/** A fetch that answers every request with `body` and notes what was asked. */
function fakeFetch(body: unknown, ok = true) {
  const calls: Call[] = [];
  const fetchFn: FetchLike = (url, init) => {
    calls.push({ url, headers: init.headers });
    return Promise.resolve({
      ok,
      status: ok ? 200 : 403,
      json: () => Promise.resolve(body),
    });
  };
  return { fetchFn, calls };
}

const throwingFetch: FetchLike = () => Promise.reject(new Error('offline'));

// The fields fetchReleases reads, as the GitHub API names them.
const apiReleases = [
  {
    tag_name: 'v0.2.0',
    name: '',
    draft: true,
    prerelease: false,
    published_at: null,
    html_url: 'https://github.com/dzikrisyairozi/recdr/releases/tag/untagged',
    body_html: '<p>Not out yet.</p>',
  },
  {
    tag_name: 'v0.1.0',
    name: 'recdr 0.1.0',
    draft: false,
    prerelease: false,
    published_at: '2026-11-20T10:00:00Z',
    html_url: 'https://github.com/dzikrisyairozi/recdr/releases/tag/v0.1.0',
    body_html: '<p>First release.</p>',
  },
  {
    tag_name: 'v0.2.0-rc.1',
    name: '',
    draft: false,
    prerelease: true,
    published_at: '2026-11-22T10:00:00Z',
    html_url:
      'https://github.com/dzikrisyairozi/recdr/releases/tag/v0.2.0-rc.1',
    body_html: null,
  },
];

test('fetchReleases drops drafts, maps the fields and sorts newest first', async () => {
  const { fetchFn } = fakeFetch(apiReleases);
  assert.deepEqual(await fetchReleases(fetchFn), [
    {
      tag: 'v0.2.0-rc.1',
      title: 'v0.2.0-rc.1',
      date: '2026-11-22T10:00:00Z',
      url: 'https://github.com/dzikrisyairozi/recdr/releases/tag/v0.2.0-rc.1',
      prerelease: true,
      html: '',
    },
    {
      tag: 'v0.1.0',
      title: 'recdr 0.1.0',
      date: '2026-11-20T10:00:00Z',
      url: 'https://github.com/dzikrisyairozi/recdr/releases/tag/v0.1.0',
      prerelease: false,
      html: '<p>First release.</p>',
    },
  ]);
});

test('fetchReleases gives an empty list when there are no releases', async () => {
  assert.deepEqual(await fetchReleases(fakeFetch([]).fetchFn), []);
});

test('fetchReleases gives null when GitHub cannot be read', async () => {
  assert.equal(await fetchReleases(fakeFetch([], false).fetchFn), null);
  assert.equal(await fetchReleases(throwingFetch), null);
  assert.equal(
    await fetchReleases(fakeFetch({ message: 'Not Found' }).fetchFn),
    null,
  );
});

test('fetchReleases asks for rendered HTML, with the token only when given', async () => {
  const without = fakeFetch([]);
  await fetchReleases(without.fetchFn);
  assert.equal(
    without.calls[0]?.url,
    'https://api.github.com/repos/dzikrisyairozi/recdr/releases?per_page=100',
  );
  assert.equal(
    without.calls[0]?.headers.Accept,
    'application/vnd.github.html+json',
  );
  assert.equal('Authorization' in (without.calls[0]?.headers ?? {}), false);

  const withToken = fakeFetch([]);
  await fetchReleases(withToken.fetchFn, 'abc');
  assert.equal(withToken.calls[0]?.headers.Authorization, 'Bearer abc');
});

test('fetchStarCount reads stargazers_count', async () => {
  const { fetchFn, calls } = fakeFetch({ stargazers_count: 42 });
  assert.equal(await fetchStarCount(fetchFn), 42);
  assert.equal(
    calls[0]?.url,
    'https://api.github.com/repos/dzikrisyairozi/recdr',
  );
});

test('fetchStarCount gives null when GitHub cannot be read', async () => {
  assert.equal(await fetchStarCount(fakeFetch({}, false).fetchFn), null);
  assert.equal(await fetchStarCount(throwingFetch), null);
  assert.equal(await fetchStarCount(fakeFetch({}).fetchFn), null);
});

test('formatStars hides zero and shortens thousands, rounded down', () => {
  assert.equal(formatStars(0), null);
  assert.equal(formatStars(999), '999');
  assert.equal(formatStars(1000), '1k');
  assert.equal(formatStars(1234), '1.2k');
  assert.equal(formatStars(15600), '15.6k');
});
