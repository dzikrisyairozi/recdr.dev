import { prefersReducedMotion } from './motion.ts';

/** Draws a ring where the visitor presses, and removes it when it has faded. */
export function initClickRings(): void {
  const layer = document.querySelector('[data-click-rings]');
  if (!layer || prefersReducedMotion()) return;

  document.addEventListener('pointerdown', (event) => {
    const ring = document.createElement('span');
    ring.className = 'ring';
    ring.style.left = `${event.clientX}px`;
    ring.style.top = `${event.clientY}px`;
    ring.addEventListener('animationend', () => ring.remove());
    layer.append(ring);
  });
}
