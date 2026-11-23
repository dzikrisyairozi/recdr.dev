import { prefersReducedMotion } from './motion.ts';

const STEP_MS = 600;

/** Plays the chat in #agents once: its items appear one at a time. */
export function initChatDemo(): void {
  const list = document.querySelector<HTMLElement>('[data-chat]');
  if (!list || prefersReducedMotion()) return;

  // From here the CSS hides every item that has no data-shown.
  list.setAttribute('data-chat-ready', '');
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      [...list.children].forEach((item, i) => {
        setTimeout(() => item.setAttribute('data-shown', ''), i * STEP_MS);
      });
    },
    { threshold: 0.2 },
  );
  observer.observe(list);
}
