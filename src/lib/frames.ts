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

export type FrameView = {
  index: number;
  file: string;
  label: string;
  timecode: string;
  changed: string;
  keyframe: boolean;
  /** In percent of the frame's width and height, so it scales with the image. */
  box: Box | null;
};

export function percent(part: number, whole: number): number {
  return Math.round((part / whole) * 1000) / 10;
}

export function formatChanged(fraction: number): string {
  return `${percent(fraction, 1)}%`;
}

export function buildFrames(manifest: Manifest, diff: Diff): FrameView[] {
  if (manifest.frames.length !== diff.frames.length) {
    throw new Error(
      `manifest.json has ${manifest.frames.length} frames, diff.json has ${diff.frames.length}`,
    );
  }
  return manifest.frames.map((frame, i) => {
    const change = diff.frames[i]!;
    const box = change.bbox;
    return {
      index: frame.index,
      file: frame.file,
      label: frame.file.replace(/^.*\//, '').replace(/\.png$/, ''),
      timecode: formatTimecode(frame.t_ms),
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
