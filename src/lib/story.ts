// What the site says about the recording in src/assets/demo/: the steps an
// agent takes to make it, and what the agent finds in it. The hero and
// #agents both render this, so the two cannot tell different stories.
import { frameLabel, type Manifest } from './frames.ts';

/** demo/story.json, written by demo/record.ts. The three frames are named by label. */
export type Story = {
  title: string;
  tab_id: string;
  banner_first: string;
  banner_shown: string;
  banner_after: string;
};

/** The parts of recdr's result.json the story uses. */
export type Result = {
  frames_stored: number;
  duration_ms: number;
  keyframes: unknown[];
};

export type Step =
  | { kind: 'tool'; name: string; args: string; result: string }
  | { kind: 'action'; text: string }
  | { kind: 'finding'; text: string };

/**
 * Indices of the first frame with the banner, the frame with the whole
 * banner, and the first frame after it.
 */
export function bannerFrames(
  manifest: Manifest,
  story: Story,
): { first: number; shown: number; after: number } {
  const index = (label: string) => {
    const i = manifest.frames.findIndex(
      (frame) => frameLabel(frame.file) === label,
    );
    if (i === -1)
      throw new Error(
        `story.json names frame ${label}, which the recording does not have`,
      );
    return i;
  };
  const first = index(story.banner_first);
  const shown = index(story.banner_shown);
  const after = index(story.banner_after);
  if (first > shown || shown >= after) {
    throw new Error('story.json has the banner frames out of order');
  }
  return { first, shown, after };
}

/** Index of the first frame at or after the mark; the last frame when none is. */
export function markFrame(manifest: Manifest, mark: { t_ms: number }): number {
  const i = manifest.frames.findIndex((frame) => frame.t_ms >= mark.t_ms);
  return i === -1 ? manifest.frames.length - 1 : i;
}

/** 2149 is "2.1s". Rounded to the nearest tenth, like a frame's timecode. */
export function seconds(tMs: number): string {
  return `${(Math.round(tMs / 100) / 10).toFixed(1)}s`;
}

export function finding(manifest: Manifest, story: Story): string {
  const { first, after } = bannerFrames(manifest, story);
  const shows = seconds(manifest.frames[first]!.t_ms);
  const gone = seconds(manifest.frames[after]!.t_ms);
  return `A "Payment failed" banner shows at ${shows} and is gone by ${gone}. The page ends on "Order confirmed".`;
}

/**
 * The calls to recdr's MCP tools that make this recording, and the finding.
 * Tool and argument names are recdr's; every value comes from the recording.
 */
export function session(
  manifest: Manifest,
  story: Story,
  result: Result,
): Step[] {
  const mark = manifest.marks[0];
  if (!mark) throw new Error('the recording has no mark');
  const tab = `${story.tab_id.slice(0, 6)}…`;
  return [
    {
      kind: 'tool',
      name: 'list_tabs',
      args: 'cdp: "9222"',
      result: `"${story.title}", id ${tab}`,
    },
    {
      kind: 'tool',
      name: 'start_recording',
      args: `cdp: "9222", tab_id: "${tab}"`,
      result: `id: "${manifest.id}"`,
    },
    { kind: 'action', text: 'The agent clicks Buy.' },
    // recdr answers a mark with the id and the label, which the call already shows.
    { kind: 'tool', name: 'mark', args: `label: "${mark.label}"`, result: '' },
    {
      kind: 'tool',
      name: 'stop_recording',
      args: `id: "${manifest.id}"`,
      result: `${result.frames_stored} frames, ${result.keyframes.length} keyframes, ${seconds(result.duration_ms)}`,
    },
    { kind: 'finding', text: finding(manifest, story) },
  ];
}
