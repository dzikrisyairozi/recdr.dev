import {
  fetchReleases,
  fetchStarCount,
  formatStars,
  type Release,
} from './github.ts';

// Each promise is kept, so one build asks GitHub once however many pages
// render the header or the changelog.
let releases: Promise<Release[] | null> | undefined;
let starLabel: Promise<string | null> | undefined;

export function getReleases(): Promise<Release[] | null> {
  return (releases ??= fetchReleases(fetch, process.env.GITHUB_TOKEN));
}

export function getStarLabel(): Promise<string | null> {
  return (starLabel ??= fetchStarCount(fetch, process.env.GITHUB_TOKEN).then(
    (count) => (count === null ? null : formatStars(count)),
  ));
}
