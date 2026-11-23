import { formatTimecode } from '../lib/timecode.ts';
import { prefersReducedMotion } from './motion.ts';

/** Counts up in every [data-rec-timecode] element from the moment the page loaded. */
export function initRecTimecode(): void {
  if (prefersReducedMotion()) return;
  const targets = document.querySelectorAll('[data-rec-timecode]');
  const start = performance.now();
  setInterval(() => {
    if (document.hidden) return;
    const text = formatTimecode(performance.now() - start);
    for (const target of targets) target.textContent = text;
  }, 100);
}
