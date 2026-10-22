import { gsap, SplitText, ScrollTrigger, initReveals, isBruceFloor, arrived, reduce } from './core';
import { rain } from './viz';

/** Shared boot for inner pages: hero entrance + scroll reveals. */
const hero = document.querySelector<HTMLElement>('[data-phero]');
if (hero && !reduce && !isBruceFloor(hero)) {
  const title = hero.querySelector<HTMLElement>('[data-ptitle]');
  const rest = hero.querySelectorAll<HTMLElement>('[data-pin]');
  if (rest.length) gsap.set(rest, { opacity: 0, y: 22 });
  if (title) gsap.set(title, { visibility: 'hidden' });
  Promise.all([arrived, document.fonts.ready]).then(() => {
    const tl = gsap.timeline({ delay: 0.15 });
    if (title) {
      const split = SplitText.create(title, { type: 'lines', mask: 'lines' });
      gsap.set(title, { visibility: 'visible' });
      tl.from(split.lines, { yPercent: 112, duration: 1.25, ease: 'expo.out', stagger: 0.1 }, 0);
    }
    if (rest.length) tl.to(rest, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1 }, 0.35);
  });
}

document.querySelectorAll<HTMLCanvasElement>('canvas[data-rain]').forEach((c) => rain(c));

const poseHome = ({ cases: 'cases', cave: 'cave' } as Record<string, string>)[document.body.dataset.floor || ''];
if (poseHome && hero && !reduce) {
  ScrollTrigger.create({
    trigger: hero,
    start: 'bottom 40%',
    onEnter: () => window.dispatchEvent(new CustomEvent('pw:pose', { detail: 'dim' })),
    onLeaveBack: () => window.dispatchEvent(new CustomEvent('pw:pose', { detail: poseHome })),
  });
}

initReveals();
ScrollTrigger.refresh();
