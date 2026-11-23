import { prefersReducedMotion } from './motion.ts';

/**
 * Fades each [data-reveal] element in the first time it scrolls into view.
 * The hidden state hangs on the reveal-ready class, which only this function
 * sets, so the elements show when the script never runs.
 */
export function initReveals(): void {
  if (prefersReducedMotion()) return;

  document.documentElement.classList.add('reveal-ready');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.setAttribute('data-revealed', '');
      observer.unobserve(entry.target);
    }
  });
  for (const element of document.querySelectorAll('[data-reveal]')) {
    observer.observe(element);
  }
}
