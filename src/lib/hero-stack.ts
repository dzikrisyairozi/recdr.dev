// The hero's frame stack: every stored frame as a plane, one step further
// back for each step back in time. Pure; HeroStack.astro draws it.

export type Plane = {
  /** Index of the frame in the manifest. */
  frame: number;
  /** 0 for the newest frame, which is in front. */
  depth: number;
  /** How far the plane is lifted out of the stack, 0 to 1. */
  lift: number;
};

/**
 * The planes, front to back. A frame with the banner is lifted: all the way
 * where the banner is whole, one equal step less for each frame away from it.
 */
export function stackPlanes(
  frameCount: number,
  banner: { first: number; shown: number; after: number },
): Plane[] {
  const steps =
    Math.max(banner.shown - banner.first, banner.after - 1 - banner.shown) + 1;
  return Array.from({ length: frameCount }, (_, depth) => {
    const frame = frameCount - 1 - depth;
    const lifted = frame >= banner.first && frame < banner.after;
    return {
      frame,
      depth,
      lift: lifted ? 1 - Math.abs(frame - banner.shown) / steps : 0,
    };
  });
}
