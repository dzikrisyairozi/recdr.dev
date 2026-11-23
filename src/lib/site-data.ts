import { fetchStarCount, formatStars } from './github.ts';

// The promise is kept, so one build asks GitHub once however many pages
// render the header.
let starLabel: Promise<string | null> | undefined;

export function getStarLabel(): Promise<string | null> {
  return (starLabel ??= fetchStarCount(fetch, process.env.GITHUB_TOKEN).then(
    (count) => (count === null ? null : formatStars(count)),
  ));
}
