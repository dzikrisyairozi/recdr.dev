/** The frame strip under #frames: hover, click, drag or arrow keys pick a frame. */
export function initScrubber(): void {
  const strip = document.querySelector<HTMLElement>('[data-scrub-strip]');
  const image = document.querySelector<HTMLImageElement>('[data-scrub-image]');
  const box = document.querySelector<HTMLElement>('[data-scrub-box]');
  const readout = document.querySelector<HTMLElement>('[data-scrub-readout]');
  if (!strip || !image || !box || !readout) return;

  const buttons = [...strip.querySelectorAll('button')];

  const select = (button: HTMLButtonElement) => {
    if (button.getAttribute('aria-pressed') === 'true') return;
    for (const other of buttons) {
      const selected = other === button;
      other.setAttribute('aria-pressed', String(selected));
      other.tabIndex = selected ? 0 : -1;
    }

    const frame = button.dataset;
    image.src = frame.full ?? '';
    readout.textContent = `frame ${frame.label} · ${frame.timecode} · ${frame.changed} changed`;

    // data-box is "x,y,width,height" in percent, or empty for an unchanged frame.
    const [x, y, width, height] = (frame.box ?? '').split(',');
    box.hidden = !frame.box;
    box.style.left = `${x}%`;
    box.style.top = `${y}%`;
    box.style.width = `${width}%`;
    box.style.height = `${height}%`;
  };

  buttons.forEach((button, index) => {
    button.addEventListener('pointerenter', () => select(button));
    button.addEventListener('click', () => select(button));
    button.addEventListener('keydown', (event) => {
      const step =
        event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      const next = buttons[index + step];
      if (step === 0 || !next) return;
      event.preventDefault();
      select(next);
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
    if (under && buttons.includes(under)) select(under);
  });
}
