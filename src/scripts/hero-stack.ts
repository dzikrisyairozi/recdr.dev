import { prefersReducedMotion } from './motion.ts';

const TILT_DEG = 5;

/**
 * The hero's frame stack. Its loop is CSS. This adds two things: the loop
 * stops while the hero is off screen, and on a device with a mouse the
 * stack leans toward the pointer.
 */
export function initHeroStack(): void {
  const stack = document.querySelector<HTMLElement>('[data-hero-stack]');
  const hero = stack?.closest<HTMLElement>('section');
  if (!stack || !hero || prefersReducedMotion()) return;

  new IntersectionObserver(([entry]) => {
    stack.toggleAttribute('data-offscreen', !entry?.isIntersecting);
  }).observe(hero);

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  hero.addEventListener('pointermove', (event) => {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    stack.style.setProperty('--ry', `${(x * 2 * TILT_DEG).toFixed(2)}deg`);
    stack.style.setProperty('--rx', `${(-y * 2 * TILT_DEG).toFixed(2)}deg`);
  });
  hero.addEventListener('pointerleave', () => {
    stack.style.removeProperty('--rx');
    stack.style.removeProperty('--ry');
  });
}
