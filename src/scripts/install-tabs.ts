import type { InstallId } from '../lib/install.ts';

/** Wires the tabs and the Copy button of every [data-install] block. */
export function initInstallTabs(defaultId: InstallId): void {
  for (const root of document.querySelectorAll<HTMLElement>('[data-install]')) {
    const tabs = [...root.querySelectorAll<HTMLElement>('[role="tab"]')];
    const panels = [...root.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
    const copy = root.querySelector<HTMLElement>('[data-copy]');
    const status = root.querySelector<HTMLElement>('[data-copy-status]');

    const select = (id: string | undefined, focus = false) => {
      for (const tab of tabs) {
        const selected = tab.dataset.tab === id;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (selected && focus) tab.focus();
      }
      for (const panel of panels) {
        panel.classList.toggle('shown', panel.dataset.panel === id);
      }
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab.dataset.tab));
      tab.addEventListener('keydown', (event) => {
        const step =
          event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (step === 0) return;
        event.preventDefault();
        const next = tabs[(index + step + tabs.length) % tabs.length];
        select(next?.dataset.tab, true);
      });
    });

    copy?.addEventListener('click', async () => {
      const shown = panels.find((panel) => panel.classList.contains('shown'));
      const text = shown?.querySelector('code')?.textContent ?? '';
      let message = 'Copied';
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        message = 'Copy failed';
      }
      copy.textContent = message;
      if (status) status.textContent = message;
      setTimeout(() => {
        copy.textContent = 'Copy';
        if (status) status.textContent = '';
      }, 2000);
    });

    select(defaultId);
  }
}
