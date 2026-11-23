import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * The three pinned scenes of the landing page: #why, #how and #frames.
 * Each section holds a [data-pin] wrapper. The wrapper is pinned and its
 * children are animated, because ScrollTrigger must not animate the element
 * it pins. The page loads this module after the load event.
 */
export function initScrollScenes(): void {
  gsap.registerPlugin(ScrollTrigger);
  // A phone's address bar hides while scrolling. Without this every such
  // resize would recompute the pins and make them jump.
  ScrollTrigger.config({ ignoreMobileResize: true });

  // The pins add scroll height. A visitor who is already further down (they
  // followed a link to /#install, or the browser restored their position)
  // would now be looking at a section further up, so the section at the top
  // of the window is put back where it was.
  const anchor = [
    ...document.querySelectorAll<HTMLElement>('main > section'),
  ].find((section) => section.getBoundingClientRect().bottom > 0);
  const anchorTop = anchor?.getBoundingClientRect().top ?? 0;

  // matchMedia removes the timelines and pins again if the visitor turns
  // reduced motion on while the page is open.
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const scene = (name: string, end: string) => {
      const section = document.querySelector<HTMLElement>(
        `[data-scene="${name}"]`,
      );
      const pin = section?.querySelector<HTMLElement>('[data-pin]');
      if (!section || !pin) return null;
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin,
          start: 'top top',
          end,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      return { section, timeline };
    };

    // The attribute switches WhySection's CSS to one figure on top of the
    // other. It is set before the timeline exists, so the pin is measured
    // with the stacked layout.
    const whySection = document.querySelector('[data-scene="why"]');
    whySection?.setAttribute('data-scene-active', '');
    const why = scene('why', '+=100%');
    why?.timeline.fromTo(
      why.section.querySelector('[data-why-after]'),
      { clipPath: 'inset(0 0 0 100%)' },
      { clipPath: 'inset(0 0 0 0%)', ease: 'none' },
    );

    // Three beats over three units of time: the bar fills at a constant
    // rate, and the second and third beat come in at one and two thirds.
    const how = scene('how', '+=200%');
    if (how) {
      const beats = how.section.querySelectorAll('[data-beat]');
      how.timeline
        .fromTo(
          how.section.querySelector('[data-how-progress]'),
          { scaleX: 0 },
          { scaleX: 1, ease: 'none', duration: 3 },
          0,
        )
        .from(beats[1] ?? null, { autoAlpha: 0, y: 16, duration: 0.5 }, 1)
        .from(beats[2] ?? null, { autoAlpha: 0, y: 16, duration: 0.5 }, 2);
    }

    const frames = scene('frames', '+=60%');
    frames?.timeline.from(
      frames.section.querySelectorAll('[data-scrub-strip] button'),
      { yPercent: 40, autoAlpha: 0, stagger: 0.05 },
    );

    return () => whySection?.removeAttribute('data-scene-active');
  });

  if (anchor) {
    // ScrollTrigger would add the pin spacers on its next tick.
    ScrollTrigger.refresh();
    window.scrollBy({
      top: anchor.getBoundingClientRect().top - anchorTop,
      behavior: 'instant',
    });
  }
}
