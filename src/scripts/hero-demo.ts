import { formatTimecode } from '../lib/timecode.ts';
import { prefersReducedMotion } from './motion.ts';

// The same numbers as the keyframes in HeroDemo.astro.
const LOOP_MS = 8000;
const RECORDING_STARTS_MS = 1500;
const RECORDING_RUNS_MS = 5000;
const RECORDING_SHOWS_MS = 6000;

/** Pauses the hero demo while nobody can see it, and runs its timecode. */
export function initHeroDemo(): void {
  const root = document.querySelector<HTMLElement>('[data-hero-demo]');
  const clock = root?.querySelector('[data-demo-clock]');
  const timecode = root?.querySelector('[data-demo-timecode]');
  if (!root || !clock || !timecode || prefersReducedMotion()) return;

  let inView = true;
  const pause = () =>
    root.toggleAttribute('data-paused', !inView || document.hidden);
  new IntersectionObserver(([entry]) => {
    inView = entry?.isIntersecting ?? true;
    pause();
  }).observe(root);
  document.addEventListener('visibilitychange', pause);

  // The clock of a paused animation stands still, so the timecode pauses
  // with the rest of the demo.
  setInterval(() => {
    const now = clock.getAnimations()[0]?.currentTime;
    if (typeof now !== 'number') return;
    const sinceStart = (now % LOOP_MS) - RECORDING_STARTS_MS;
    const progress = Math.min(Math.max(sinceStart / RECORDING_RUNS_MS, 0), 1);
    timecode.textContent = formatTimecode(progress * RECORDING_SHOWS_MS);
  }, 100);
}
