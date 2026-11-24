import {
  endScene,
  loopMs,
  sceneAt,
  type Scene,
  type Timing,
} from '../lib/hero-scene.ts';
import { formatTimecode } from '../lib/timecode.ts';
import { prefersReducedMotion } from './motion.ts';
import { initScrubber } from './scrubber.ts';

const TILT_DEG = 3;

/**
 * The hero demo. It plays the agent's session in a loop: the lines come in,
 * the recorded frames play at their real times, the finding shows. A visitor
 * can pause it, or pick a frame on the timeline, which holds the loop while
 * the pointer or the focus is there.
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
    // First, because it reads the layout before it writes.
    showFrame!(scene.frame);
    lines.forEach((line, i) =>
      line.toggleAttribute('data-shown', i < scene.lines),
    );
    tiles.forEach((tile, i) =>
      tile.toggleAttribute('data-shown', i < scene.tiles),
    );
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
  // In a frame callback, where the browser is about to lay the page out anyway.
  requestAnimationFrame(() => {
    const resting = tiles[timing.bannerFrame];
    if (!resting) return;
    strip.scrollLeft =
      resting.offsetLeft - (strip.clientWidth - resting.offsetWidth) / 2;
  });

  const pauseButton = root.querySelector<HTMLElement>('[data-demo-pause]');
  const scene = root.querySelector<HTMLElement>('[data-demo-scene]');
  if (!pauseButton || !scene || prefersReducedMotion()) return;

  let t = 0;
  let last = 0;
  let drawn = '';
  let paused = false;
  let inView = false;
  // The pointer or the focus is on the timeline: the visitor's frame stays.
  let hovering = false;
  let focused = false;

  const tick = (now: number) => {
    const delta = now - last;
    last = now;
    if (!hovering && !focused) {
      if (!paused && inView && !document.hidden) {
        // A tab that was in the background reports one very long frame.
        t = (t + Math.min(delta, 100)) % loopMs(timing);
      }
      // Most frames change nothing but a clock that shows tenths of a second.
      const next = sceneAt(t, timing);
      const key = JSON.stringify({
        ...next,
        clockMs: next.clockMs === null ? null : Math.floor(next.clockMs / 100),
      });
      if (key !== drawn) apply(next);
      drawn = key;
    } else {
      drawn = '';
    }
    requestAnimationFrame(tick);
  };

  new IntersectionObserver(([entry]) => {
    inView = entry?.isIntersecting ?? true;
  }).observe(root);

  strip.addEventListener('pointerenter', () => (hovering = true));
  strip.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'mouse') hovering = false;
  });
  // A finger leaves the timeline when it lifts. The frame it picked stays
  // until the next touch somewhere else.
  document.addEventListener('pointerdown', (event) => {
    if (!strip.contains(event.target as Node)) hovering = false;
  });
  strip.addEventListener('focusin', () => (focused = true));
  strip.addEventListener('focusout', () => (focused = false));

  pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.setAttribute('aria-pressed', String(paused));
    root.toggleAttribute('data-paused', paused);
  });

  // The scene leans a few degrees toward the pointer. The CSS reads --rx and
  // --ry only on a device with a mouse.
  const level = () => {
    scene.style.removeProperty('--rx');
    scene.style.removeProperty('--ry');
  };
  root.addEventListener('pointermove', (event) => {
    // A timeline that moves under the pointer is hard to pick a frame on.
    if (hovering) return level();
    const rect = root.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    scene.style.setProperty('--ry', `${(x * 2 * TILT_DEG).toFixed(2)}deg`);
    scene.style.setProperty('--rx', `${(-y * 2 * TILT_DEG).toFixed(2)}deg`);
  });
  root.addEventListener('pointerleave', level);

  // Play only once every frame is in the cache, so the window never shows a
  // frame that is still loading. The images are kept so they stay decoded.
  const preloaded: HTMLImageElement[] = [];
  const start = async () => {
    await Promise.allSettled(
      tiles.map((tile) => {
        const image = new Image();
        image.src = tile.dataset.full ?? '';
        preloaded.push(image);
        return image.decode();
      }),
    );
    pauseButton.hidden = false;
    root.setAttribute('data-live', '');
    last = performance.now();
    requestAnimationFrame(tick);
  };
  // The pinned scenes further down set themselves up on the load event too,
  // and that is heavy work. The demo starts when the page has gone quiet.
  const whenIdle = () =>
    'requestIdleCallback' in window
      ? requestIdleCallback(() => void start(), { timeout: 3000 })
      : setTimeout(() => void start(), 300);
  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle, { once: true });
}
