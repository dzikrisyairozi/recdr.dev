/**
 * Frame selection inside `root`: hover, click, drag or arrow keys on the
 * strip pick a frame, and the image, the box and the readout follow.
 *
 * `onSelect` is called for every frame a visitor picks. The function that
 * is returned shows a frame without calling it. Returns null when `root`
 * has no strip, image or box.
 */
export function initScrubber(
  root: HTMLElement,
  onSelect?: (index: number) => void,
): ((index: number) => void) | null {
  const strip = root.querySelector<HTMLElement>('[data-scrub-strip]');
  const image = root.querySelector<HTMLImageElement>('[data-scrub-image]');
  const box = root.querySelector<HTMLElement>('[data-scrub-box]');
  const readout = root.querySelector<HTMLElement>('[data-scrub-readout]');
  if (!strip || !image || !box) return null;

  const buttons = [...strip.querySelectorAll('button')];

  const show = (button: HTMLButtonElement) => {
    if (button.getAttribute('aria-pressed') === 'true') return;
    for (const other of buttons) {
      const selected = other === button;
      other.setAttribute('aria-pressed', String(selected));
      other.tabIndex = selected ? 0 : -1;
    }

    const frame = button.dataset;
    image.src = frame.full ?? '';
    if (readout) {
      readout.textContent = `frame ${frame.label} · ${frame.timecode} · ${frame.changed} changed`;
    }

    // data-box is the box's position as CSS, or empty for an unchanged frame.
    box.hidden = !frame.box;
    box.style.cssText = frame.box ?? '';

    // Keep the frame inside the strip. scrollIntoView would also scroll the page.
    const visible = strip.getBoundingClientRect();
    const tile = button.getBoundingClientRect();
    if (tile.left < visible.left) strip.scrollLeft -= visible.left - tile.left;
    else if (tile.right > visible.right) {
      strip.scrollLeft += tile.right - visible.right;
    }
  };

  // The visitor picked this frame. onSelect hears it even when the frame
  // already shows, which is how the hero knows to stop playing.
  const pick = (button: HTMLButtonElement) => {
    show(button);
    onSelect?.(buttons.indexOf(button));
  };

  buttons.forEach((button, index) => {
    button.addEventListener('pointerenter', () => pick(button));
    button.addEventListener('click', () => pick(button));
    button.addEventListener('keydown', (event) => {
      const step =
        event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      const next = buttons[index + step];
      if (step === 0 || !next) return;
      event.preventDefault();
      pick(next);
      next.focus();
    });
  });

  // A finger or pen held down stays captured by the button it started on,
  // so the frame under it is looked up by position.
  strip.addEventListener('pointermove', (event) => {
    if (event.buttons === 0) return;
    const under = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest('button');
    if (under && buttons.includes(under)) pick(under);
  });

  return (index) => {
    const button = buttons[index];
    if (button) show(button);
  };
}
