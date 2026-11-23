export const REPO = 'dzikrisyairozi/recdr';

export type Release = {
  tag: string;
  /** When it was published, as GitHub's ISO 8601 string. */
  date: string;
  url: string;
  prerelease: boolean;
  /** The release notes as HTML, rendered and sanitized by GitHub. */
  html: string;
};

/** The part of `fetch` this module uses, so a test can pass its own. */
export type FetchLike = (
  url: string,
  init: { headers: Record<string, string>; signal: AbortSignal },
) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

const API = `https://api.github.com/repos/${REPO}`;

async function getJson(
  fetchFn: FetchLike,
  url: string,
  accept: string,
  token?: string,
): Promise<unknown> {
  const request = (authorization?: string) => {
    const headers: Record<string, string> = { Accept: accept };
    if (authorization) headers.Authorization = authorization;
    // GitHub answers in well under a second. A build should not wait on a
    // connection that hangs.
    return fetchFn(url, { headers, signal: AbortSignal.timeout(10_000) });
  };
  let response = await request(token && `Bearer ${token}`);
  // Everything read here is public. An expired or revoked token gets 401,
  // and the same request without it still answers.
  if (response.status === 401 && token) response = await request();
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return response.json();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// A build must pass without network access, so a failed request is a
// warning and a null, and the page shows a link to GitHub.
function warn(what: string, error: unknown): null {
  const reason = error instanceof Error ? error.message : String(error);
  console.warn(`[github] ${what} not read: ${reason}`);
  return null;
}

// The page prints each release as an <h2>, so the highest heading in its
// notes becomes an <h3> and the ones under it move down with it.
function demoteHeadings(html: string): string {
  const levels = [...html.matchAll(/<h([1-6])/g)].map((m) => Number(m[1]));
  const shift = Math.max(0, 3 - Math.min(...levels));
  return html.replace(
    /<(\/?)h([1-6])/g,
    (_, slash: string, level: string) =>
      `<${slash}h${Math.min(6, Number(level) + shift)}`,
  );
}

// GitHub marks up mentions and issue links for its own scripts and styles
// (class="user-mention", data-hovercard-url="..."). None of it means
// anything on this site.
function dropGithubAttributes(html: string): string {
  return html.replace(/\s(?:class|data-[\w-]+)="[^"]*"/g, '');
}

function toRelease(entry: unknown): Release {
  if (
    !isRecord(entry) ||
    typeof entry.tag_name !== 'string' ||
    typeof entry.published_at !== 'string' ||
    typeof entry.html_url !== 'string'
  ) {
    throw new Error('a release does not have the expected fields');
  }
  return {
    tag: entry.tag_name,
    date: entry.published_at,
    url: entry.html_url,
    prerelease: entry.prerelease === true,
    html:
      typeof entry.body_html === 'string'
        ? dropGithubAttributes(demoteHeadings(entry.body_html))
        : '',
  };
}

/** The published releases, newest first, or null when GitHub cannot be read. */
export async function fetchReleases(
  fetchFn: FetchLike,
  token?: string,
): Promise<Release[] | null> {
  try {
    const body = await getJson(
      fetchFn,
      `${API}/releases?per_page=100`,
      // The html media type adds body_html, the notes as rendered HTML.
      'application/vnd.github.html+json',
      token,
    );
    if (!Array.isArray(body)) throw new Error('the answer is not a list');
    return body
      .filter((entry) => !(isRecord(entry) && entry.draft === true))
      .map(toRelease)
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    return warn('releases', error);
  }
}

export async function fetchStarCount(
  fetchFn: FetchLike,
  token?: string,
): Promise<number | null> {
  try {
    const body = await getJson(
      fetchFn,
      API,
      'application/vnd.github+json',
      token,
    );
    if (!isRecord(body) || typeof body.stargazers_count !== 'number') {
      throw new Error('the answer has no stargazers_count');
    }
    return body.stargazers_count;
  } catch (error) {
    return warn('star count', error);
  }
}

/** 999 gives '999', 1234 gives '1.2k'. Zero gives null: no count is shown. */
export function formatStars(count: number): string | null {
  if (count <= 0) return null;
  if (count < 1000) return String(count);
  return `${Math.floor(count / 100) / 10}k`;
}
