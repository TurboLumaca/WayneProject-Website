import { reduce } from './core';
import type { Pose } from './suit-scene';

/**
 * Background 3D figure. Lazy: three.js is only fetched on wide screens, for
 * motion-friendly users, on the dark floors.
 */
const canvas = document.querySelector<HTMLCanvasElement>('[data-suit]');
const floor = document.body.dataset.floor || 'atrium';
const initial: Pose | null = ({ atrium: 'hero', cases: 'cases', cave: 'cave' } as Record<string, Pose>)[floor] ?? null;

const hasGL = (() => {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
})();

let booted = false;
const boot = () => {
  if (booted || window.innerWidth < 760) return;
  booted = true;
  window.removeEventListener('resize', boot);
  import('./suit-scene')
    .then((m) => m.createSuit(canvas!, initial!))
    .catch((err) => console.warn('3D figure unavailable', err));
};

if (canvas && initial && !reduce && hasGL) {
  // wait for the page to settle; boot later if the window is widened
  if ('requestIdleCallback' in window) (window as any).requestIdleCallback(boot, { timeout: 1500 });
  else setTimeout(boot, 400);
  window.addEventListener('resize', boot);
}
