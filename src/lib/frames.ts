import { formatTimecode } from './timecode.ts';

export type Box = { x: number; y: number; width: number; height: number };
export type Click = { t_ms: number; x: number; y: number; button: string };

/** The parts of recdr's manifest.json the site reads. */
export type Manifest = {
  width: number;
  height: number;
  frames: { index: number; t_ms: number; file: string }[];
  clicks: Click[];
};

/** recdr's diff.json. A frame with no change has no bbox. */
export type Diff = {
  frames: {
    t_ms: number;
    changed_fraction: number;
    keyframe: boolean;
    bbox?: Box;
  }[];
};

export function percent(part: number, whole: number): number {
  return Math.round((part / whole) * 1000) / 10;
}

export function formatChanged(fraction: number): string {
  return `${percent(fraction, 1)}%`;
}

/** One entry per frame. `box` is in percent of the frame, so it scales with the image. */
export function buildFrames(manifest: Manifest, diff: Diff) {
  if (manifest.frames.length !== diff.frames.length) {
    throw new Error(
      `manifest.json has ${manifest.frames.length} frames, diff.json has ${diff.frames.length}`,
    );
  }
  return manifest.frames.map((frame, i) => {
    const change = diff.frames[i]!;
    const box = change.bbox;
    return {
      file: frame.file,
      label: frame.file.replace(/^.*\//, '').replace(/\.png$/, ''),
      // Rounded to the nearest tenth, the way recdr labels the tiles of its
      // contact sheet. formatTimecode rounds down, which suits a running clock.
      timecode: formatTimecode(Math.round(frame.t_ms / 100) * 100),
      changed: formatChanged(change.changed_fraction),
      keyframe: change.keyframe,
      box: box
        ? {
            x: percent(box.x, manifest.width),
            y: percent(box.y, manifest.height),
            width: percent(box.width, manifest.width),
            height: percent(box.height, manifest.height),
          }
        : null,
    };
  });
}

export function clickPoint(
  manifest: Manifest,
): { x: number; y: number } | null {
  const click = manifest.clicks[0];
  if (!click) return null;
  return {
    x: percent(click.x, manifest.width),
    y: percent(click.y, manifest.height),
  };
}
