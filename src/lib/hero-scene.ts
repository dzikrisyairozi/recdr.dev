// What the hero demo shows at each moment of its loop. Pure, so the loop's
// timing is tested without a browser; src/scripts/hero-demo.ts applies it.

/** The recording's times, in milliseconds from its start. */
export type Timing = {
  /** t_ms of every stored frame, in file order. */
  frames: number[];
  clickMs: number;
  markMs: number;
  durationMs: number;
  /** Index of the frame with the whole banner, where the demo rests. */
  bannerFrame: number;
};

export type Scene = {
  /** How many lines of the agent's session show. */
  lines: number;
  /** Index of the frame in the window. */
  frame: number;
  /** How many tiles the timeline has so far. */
  tiles: number;
  recording: boolean;
  /** The running clock. null means the time of the frame that shows. */
  clockMs: number | null;
  /** The ring around the click. */
  ring: boolean;
};

/** The agent lists the tabs and starts the recording. */
export const LEAD_MS = 2400;
/** The agent stops the recording, then its finding stays on screen. */
export const TAIL_MS = 5100;
const RING_MS = 400;

export function loopMs(timing: Timing): number {
  return LEAD_MS + timing.durationMs + TAIL_MS;
}

/** Everything shown: the state without JavaScript, and while a visitor picks frames. */
export function endScene(
  timing: Timing,
  frame: number = timing.bannerFrame,
): Scene {
  return {
    lines: 6,
    frame,
    tiles: timing.frames.length,
    recording: false,
    clockMs: null,
    ring: false,
  };
}

export function sceneAt(ms: number, timing: Timing): Scene {
  const rec = ms - LEAD_MS;
  const after = rec - timing.durationMs;
  const last = timing.frames.length - 1;

  if (rec < 0) {
    return {
      lines: ms < 300 ? 0 : ms < 1200 ? 1 : 2,
      frame: 0,
      tiles: 0,
      recording: false,
      clockMs: 0,
      ring: false,
    };
  }
  if (after < 0) {
    // recdr can stamp a frame a few ms before the one stored ahead of it, so
    // this is the last frame whose time has come, not the first that has not.
    const frame = timing.frames.findLastIndex((t) => t <= rec);
    return {
      lines: rec < timing.clickMs ? 2 : rec < timing.markMs ? 3 : 4,
      frame,
      tiles: frame + 1,
      recording: true,
      clockMs: rec,
      ring: rec >= timing.clickMs && rec < timing.clickMs + RING_MS,
    };
  }
  if (after < 1500) {
    return {
      lines: after < 300 ? 4 : 5,
      frame: last,
      tiles: timing.frames.length,
      recording: false,
      clockMs: timing.durationMs,
      ring: false,
    };
  }
  return endScene(timing);
}
