import { formatTimecode } from './timecode.ts';

export type Box = { x: number; y: number; width: number; height: number };
export type Click = { t_ms: number; x: number; y: number; button: string };

/** The parts of recdr's manifest.json the site reads. */
export type Manifest = {
  id: string;
  width: number;
  height: number;
  duration_ms: number;
  frames: { index: number; t_ms: number; file: string }[];
  clicks: Click[];
  marks: { t_ms: number; label: string }[];
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

/** "frames/000013.png" is "000013". */
export function frameLabel(file: string): string {
  return file.replace(/^.*\//, '').replace(/\.png$/, '');
}

/**
 * Height of a frame's bar in the change chart, in percent of the tallest.
 * The square root keeps a 0.1% change visible next to an 8% one.
 */
export function barHeight(fraction: number, max: number): number {
  if (fraction === 0 || max === 0) return 0;
  return Math.max(4, Math.round(Math.sqrt(fraction / max) * 100));
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
      label: frameLabel(frame.file),
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
): { x: number; y: number; t_ms: number } | null {
  const click = manifest.clicks[0];
  if (!click) return null;
  return {
    x: percent(click.x, manifest.width),
    y: percent(click.y, manifest.height),
    t_ms: click.t_ms,
  };
}
