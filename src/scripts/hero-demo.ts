import { endScene, type Scene, type Timing } from '../lib/hero-scene.ts';
import { formatTimecode } from '../lib/timecode.ts';
import { prefersReducedMotion } from './motion.ts';
import { initScrubber } from './scrubber.ts';

/**
 * The hero demo. A visitor can pick any frame on its timeline; the window
 * and the timecode follow.
 */
export function initHeroDemo(): void {
  const root = document.querySelector<HTMLElement>('[data-hero-demo]');
  const strip = root?.querySelector<HTMLElement>('[data-scrub-strip]');
  const timecode = root?.querySelector<HTMLElement>('[data-demo-timecode]');
  if (!root || !strip || !timecode) return;

  const timing = JSON.parse(root.dataset.timing!) as Timing;
  const lines = [...root.querySelectorAll('[data-line]')];
  const tiles = [...strip.querySelectorAll('button')];

  // A frame the visitor picks shows with the whole session around it.
  const showFrame = initScrubber(root, (index) =>
    apply(endScene(timing, index)),
  );
  if (!showFrame) return;

  function apply(scene: Scene) {
    lines.forEach((line, i) =>
      line.toggleAttribute('data-shown', i < scene.lines),
    );
    tiles.forEach((tile, i) =>
      tile.toggleAttribute('data-shown', i < scene.tiles),
    );
    showFrame!(scene.frame);
    root!.toggleAttribute('data-recording', scene.recording);
    root!.toggleAttribute('data-ring', scene.ring);
    // A running clock rounds down. A frame that stands still shows the time
    // on its tile, which is rounded to the nearest tenth.
    const text =
      scene.clockMs === null
        ? (tiles[scene.frame]?.dataset.timecode ?? '')
        : formatTimecode(scene.clockMs);
    if (timecode!.textContent !== text) timecode!.textContent = text;
  }

  // The frame in the window is somewhere in the middle of the timeline.
  const resting = tiles[timing.bannerFrame];
  if (resting) {
    strip.scrollLeft =
      resting.offsetLeft - (strip.clientWidth - resting.offsetWidth) / 2;
  }

  if (prefersReducedMotion()) return;
}
