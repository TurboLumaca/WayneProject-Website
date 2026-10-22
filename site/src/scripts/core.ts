import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };

export type Theme = 'night' | 'bruce' | 'cave';
export interface FloorInfo {
  id: string;
  href: string;
  code: string;
  level: number;
  name: string;
  theme: Theme;
}

const root = document.documentElement;
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;

/* ───────────── Floors, read from the elevator panel ───────────── */
export const floors: FloorInfo[] = [...document.querySelectorAll<HTMLAnchorElement>('.elev-btn')].map((a) => ({
  id: a.dataset.floorLink!,
  href: a.getAttribute('href')!,
  code: a.dataset.code!,
  level: Number(a.dataset.level),
  name: a.dataset.name!,
  theme: a.dataset.themeOf as Theme,
}));
export const floorById = (id: string) => floors.find((f) => f.id === id);
const normPath = (p: string) => (p.length > 1 ? p.replace(/\/$/, '') : p);
export const floorByPath = (p: string) => floors.find((f) => normPath(f.href) === normPath(p));
export const currentFloorId = document.body.dataset.floor || 'atrium';

/* ───────────── Smooth scroll ───────────── */
export const lenis: Lenis | null = reduce
  ? null
  : new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function scrollToTarget(target: string | HTMLElement | number, immediate = false) {
  if (lenis) lenis.scrollTo(target as any, { offset: typeof target === 'number' ? 0 : -72, duration: immediate ? 0 : 1.6, immediate, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else if (typeof target === 'number') window.scrollTo({ top: target });
  else (typeof target === 'string' ? document.querySelector(target) : target)?.scrollIntoView();
}

/* ───────────── Theme ───────────── */
export function setTheme(t: Theme, instant = false) {
  if (root.dataset.theme === t) return;
  if (instant) root.classList.add('no-theme-fade');
  root.dataset.theme = t;
  if (instant) requestAnimationFrame(() => root.classList.remove('no-theme-fade'));
  window.dispatchEvent(new CustomEvent('pw:theme', { detail: t }));
}

/* ───────────── Elevator HUD ───────────── */
const hudCode = document.querySelector<HTMLElement>('[data-elev-code]');
const hudArrow = document.querySelector<HTMLElement>('[data-elev-arrow]');
const hudCar = document.querySelector<HTMLElement>('[data-elev-car]');
let hudId = '';
export function setHud(id: string) {
  const f = floorById(id);
  if (!f || id === hudId) return;
  const prev = floorById(hudId);
  hudId = id;
  if (hudCode) hudCode.textContent = f.code;
  if (hudArrow && prev) hudArrow.classList.toggle('up', f.level > prev.level);
  document.querySelectorAll('.elev-btn').forEach((b) => {
    if ((b as HTMLElement).dataset.floorLink === id) b.setAttribute('aria-current', 'true');
    else b.removeAttribute('aria-current');
  });
  // the car lives inside .elev-shaft, which owns the --car custom property
  hudCar?.parentElement?.style.setProperty('--car', `${(floors.indexOf(f) / (floors.length - 1)) * 76}px`);
}

function markNav(id: string) {
  document.querySelectorAll('.nav-links a, .brand').forEach((a) => {
    if ((a as HTMLElement).dataset.floorLink === id) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
}

/* ───────────── Doors + riding ───────────── */
const doorsEl = document.querySelector<HTMLElement>('.doors');
const doorL = document.querySelector<HTMLElement>('.door--l');
const doorR = document.querySelector<HTMLElement>('.door--r');
const dLabel = document.querySelector<HTMLElement>('[data-doors-label]');
const dCode = document.querySelector<HTMLElement>('[data-doors-code]');
const dName = document.querySelector<HTMLElement>('[data-doors-name]');
const dDisp = document.querySelector<HTMLElement>('.doors-display');
const live = document.querySelector<HTMLElement>('[data-doors-live]');
let riding = false;

export function ride(rawHref: string) {
  if (riding) return;
  const url = new URL(rawHref, location.href);
  if (url.origin !== location.origin) {
    window.open(url.href, '_blank', 'noopener');
    return;
  }
  const dest = floorByPath(url.pathname);
  const here = floorById(currentFloorId)!;

  // Same page: just scroll.
  if (normPath(url.pathname) === normPath(location.pathname)) {
    if (url.hash) {
      const el = document.querySelector<HTMLElement>(url.hash);
      if (el) {
        scrollToTarget(el);
        history.replaceState(null, '', url.hash);
        return;
      }
    }
    scrollToTarget(0);
    return;
  }

  if (!dest || reduce) {
    location.href = url.href;
    return;
  }

  riding = true;
  window.dispatchEvent(new Event('pw:ride'));
  sessionStorage.setItem('pw-ride', JSON.stringify({ to: dest.id, from: here.id }));
  lenis?.stop();
  root.classList.add('riding');

  const lo = floors.indexOf(here);
  const hi = floors.indexOf(dest);
  const step = lo < hi ? 1 : -1;
  const stops: FloorInfo[] = [];
  for (let i = lo; i !== hi + step; i += step) stops.push(floors[i]);
  const goingDown = dest.level < here.level;

  if (dLabel) dLabel.textContent = goingDown ? 'Going down' : 'Going up';
  if (dName) dName.textContent = dest.name;
  if (dCode) dCode.textContent = here.code;
  if (live) live.textContent = `${goingDown ? 'Going down' : 'Going up'} to ${dest.name}`;

  const tl = gsap.timeline({ onComplete: () => (location.href = url.href) });
  tl.set([doorL, doorR], { scaleX: 0 })
    .set(dDisp, { opacity: 0 })
    .to([doorL, doorR], { scaleX: 1, duration: 0.55, ease: 'power3.inOut' })
    .to(dDisp, { opacity: 1, duration: 0.25 }, '-=0.15');
  const per = Math.min(0.2, 0.9 / Math.max(stops.length - 1, 1));
  stops.forEach((s, i) => {
    tl.call(() => dCode && (dCode.textContent = s.code), [], i === 0 ? '>' : `>+${per}`);
  });
  tl.to({}, { duration: 0.18 });
}

/** Called on every page load: if we arrived by elevator, open the doors. */
function arrive() {
  const raw = sessionStorage.getItem('pw-ride');
  sessionStorage.removeItem('pw-ride');
  if (!raw || !root.classList.contains('doors-closed')) {
    root.classList.remove('doors-closed', 'riding');
    return Promise.resolve();
  }
  const { to, from } = JSON.parse(raw) as { to: string; from: string };
  const dest = floorById(to);
  if (dLabel) dLabel.textContent = 'Arriving';
  if (dCode && dest) dCode.textContent = dest.code;
  if (dName && dest) dName.textContent = dest.name;
  if (dest && floorById(from) && floorById(from)!.level !== dest.level) {
    // nothing else: the doors-display already shows the destination
  }
  return new Promise<void>((resolve) => {
    const open = () => {
      const tl = gsap.timeline({
        onComplete: () => {
          root.classList.remove('doors-closed', 'riding');
          gsap.set([doorL, doorR, dDisp], { clearProps: 'all' });
          resolve();
        },
      });
      tl.set([doorL, doorR], { scaleX: 1 })
        .to(dDisp, { opacity: 0, duration: 0.25, delay: 0.25 })
        .to([doorL, doorR], { scaleX: 0, duration: 0.85, ease: 'power3.inOut' }, '<+0.1');
      // Bring the page content up as the doors part.
      window.dispatchEvent(new CustomEvent('pw:arrive'));
    };
    const ready = document.fonts?.ready ?? Promise.resolve();
    Promise.race([ready, new Promise((r) => setTimeout(r, 1500))]).then(() => requestAnimationFrame(open));
  });
}

/* ───────────── Chrome (nav, keys, links) ───────────── */
function initChrome() {
  markNav(currentFloorId);

  // Intercept internal links → elevator
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    e.preventDefault();
    if (a.hasAttribute('data-signal-link')) {
      scrollToTarget('#signal');
      return;
    }
    ride(a.getAttribute('href')!);
  });

  // Nav: hide on scroll down, show on scroll up
  let last = 0;
  const onScroll = (y: number) => {
    root.classList.toggle('scrolled', y > 40);
    if (y > 240 && y > last + 4) root.classList.add('nav-hidden');
    else if (y < last - 4 || y < 240) root.classList.remove('nav-hidden');
    last = y;
  };
  if (lenis) lenis.on('scroll', (l: Lenis) => onScroll(l.scroll));
  else window.addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  onScroll(scrollY);

  // Keyboard: 1–6 ride, ⌘K palette
  window.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('pw:palette'));
      return;
    }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key.toLowerCase() === 'm') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('pw:map'));
      return;
    }
    if (e.key === '/') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('pw:palette'));
      return;
    }
    const n = Number(e.key);
    if (n >= 1 && n <= floors.length) ride(floors[n - 1].href);
  });

  // bfcache restore
  window.addEventListener('pageshow', (e) => {
    if ((e as PageTransitionEvent).persisted) {
      riding = false;
      root.classList.remove('riding', 'doors-closed');
      gsap.set([doorL, doorR, dDisp], { clearProps: 'all' });
      lenis?.start();
    }
  });
}

/* ───────────── Palette ───────────── */
function initPalette() {
  const el = document.querySelector<HTMLElement>('[data-palette]');
  const input = el?.querySelector<HTMLInputElement>('[data-palette-input]');
  const list = el?.querySelector<HTMLElement>('[data-palette-list]');
  const count = el?.querySelector<HTMLElement>('[data-palette-count]');
  const raw = document.getElementById('pw-index')?.textContent;
  if (!el || !input || !list || !raw) return;
  type Item = { t: string; s: string; k: string; h: string; f: string };
  const index: Item[] = JSON.parse(raw);
  let results: Item[] = [];
  let sel = 0;
  let lastFocus: HTMLElement | null = null;

  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
  const hl = (s: string, terms: string[]) => {
    let out = esc(s);
    terms.forEach((q) => {
      if (!q) return;
      out = out.replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'), '<mark>$1</mark>');
    });
    return out;
  };

  function search(q: string) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) {
      results = index.filter((i) => i.k === 'Space').concat(index.filter((i) => i.k === 'Case' && /Monk/.test(i.s)));
    } else {
      results = index
        .map((i) => {
          const hay = `${i.t} ${i.s} ${i.k}`.toLowerCase();
          if (!terms.every((t) => hay.includes(t))) return null;
          let score = 0;
          terms.forEach((t) => {
            if (i.t.toLowerCase().startsWith(t)) score += 4;
            else if (i.t.toLowerCase().includes(t)) score += 2;
            else score += 1;
          });
          if (i.k === 'Space') score += 3;
          return { i, score };
        })
        .filter(Boolean)
        .sort((a, b) => b!.score - a!.score)
        .slice(0, 40)
        .map((r) => r!.i);
    }
    sel = 0;
    render(terms);
  }

  function render(terms: string[]) {
    if (count) count.textContent = `${results.length} result${results.length === 1 ? '' : 's'}`;
    if (!results.length) {
      list!.innerHTML = '<li class="pi-empty" role="option" aria-selected="false">Nothing in the files. Try “monk”, “marathon” or “pull-ups”.</li>';
      return;
    }
    list!.innerHTML = results
      .map(
        (r, n) =>
          `<li role="option" id="pi-${n}" data-i="${n}" aria-selected="${n === sel}"><span class="pi-kind">${esc(r.k)}</span><span><span class="pi-t">${hl(r.t, terms)}</span><span class="pi-s">${hl(r.s, terms)}</span></span><span class="pi-go">↵ ride</span></li>`
      )
      .join('');
  }

  function move(d: number) {
    if (!results.length) return;
    sel = (sel + d + results.length) % results.length;
    list!.querySelectorAll('li').forEach((li, n) => li.setAttribute('aria-selected', String(n === sel)));
    const cur = list!.children[sel] as HTMLElement;
    cur?.scrollIntoView({ block: 'nearest' });
    input!.setAttribute('aria-activedescendant', `pi-${sel}`);
  }

  function open() {
    lastFocus = document.activeElement as HTMLElement;
    el!.hidden = false;
    lenis?.stop();
    input!.value = '';
    search('');
    gsap.fromTo('.palette-box', { y: -14, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out' });
    gsap.fromTo('.palette-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.3 });
    input!.focus();
  }
  function close() {
    if (el!.hidden) return;
    el!.hidden = true;
    if (!riding) lenis?.start();
    lastFocus?.focus?.();
  }
  function go(n: number) {
    const r = results[n];
    if (!r) return;
    close();
    ride(r.h);
  }

  window.addEventListener('pw:palette', () => (el.hidden ? open() : close()));
  document.querySelectorAll('[data-palette-open]').forEach((b) => b.addEventListener('click', open));
  el.querySelectorAll('[data-palette-close]').forEach((b) => b.addEventListener('click', close));
  input.addEventListener('input', () => search(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') (e.preventDefault(), move(1));
    else if (e.key === 'ArrowUp') (e.preventDefault(), move(-1));
    else if (e.key === 'Enter') (e.preventDefault(), go(sel));
    else if (e.key === 'Escape') close();
    else if (e.key === 'Tab') e.preventDefault();
  });
  list.addEventListener('click', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('li[data-i]');
    if (li) go(Number(li.dataset.i));
  });
  list.addEventListener('mousemove', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('li[data-i]');
    if (li && Number(li.dataset.i) !== sel) {
      sel = Number(li.dataset.i);
      list.querySelectorAll('li').forEach((x, n) => x.setAttribute('aria-selected', String(n === sel)));
    }
  });
}

/* ───────────── Building map ───────────── */
function initMap() {
  const el = document.querySelector<HTMLElement>('[data-map]');
  const raw = document.getElementById('pw-floors')?.textContent;
  if (!el || !raw) return;
  type Room = { id: string; label: string; blurb: string; anchor: string };
  type F = { id: string; code: string; name: string; fn: string; href: string; wing: string; ref: string; mood: string; rooms: Room[] };
  const data: F[] = JSON.parse(raw);
  const $ = (s: string) => el.querySelector<HTMLElement>(s)!;
  const panel = { wing: $('[data-mp-wing]'), name: $('[data-mp-name]'), fn: $('[data-mp-fn]'), mood: $('[data-mp-mood]'), rooms: $('[data-mp-rooms]'), ref: $('[data-mp-ref]'), go: $('[data-mp-go]') as HTMLAnchorElement };
  const items = [...el.querySelectorAll<SVGElement>('[data-map-floor]')];
  let lastFocus: HTMLElement | null = null;

  /* Route graph: the elevator shaft, the drive, the clock passage, the tunnel */
  const N: Record<string, [number, number]> = {
    atrium: [354, 103], record: [354, 197], blueprint: [354, 309], lobby: [354, 398], cases: [354, 477],
    drive: [580, 398], archive: [612, 372], study: [680, 372], trap: [680, 500],
    h1: [680, 546], h2: [680, 658], trE: [670, 546], training: [570, 546], tkW: [690, 546], track: [790, 546],
    wkE: [670, 658], workshop: [570, 658], csW: [690, 658], console: [790, 658],
    t1: [380, 500], t2: [412, 540], trW: [470, 546],
  };
  const E: [string, string, string][] = [
    ['atrium', 'record', 'Elevator'], ['record', 'blueprint', 'Elevator'], ['blueprint', 'lobby', 'Elevator'], ['lobby', 'cases', 'Elevator'],
    ['lobby', 'drive', 'The drive'], ['drive', 'archive', 'The drive'], ['archive', 'study', 'The study'], ['study', 'trap', 'Behind the clock'],
    ['trap', 'h1', 'The cave'], ['h1', 'h2', 'The cave'], ['h1', 'trE', 'The cave'], ['trE', 'training', 'The cave'], ['h1', 'tkW', 'The cave'],
    ['tkW', 'track', 'The cave'], ['h2', 'wkE', 'The cave'], ['wkE', 'workshop', 'The cave'], ['h2', 'csW', 'The cave'], ['csW', 'console', 'The cave'],
    ['cases', 't1', 'Tunnel'], ['t1', 't2', 'Tunnel'], ['t2', 'trW', 'Tunnel'], ['trW', 'training', 'The cave'],
  ];
  const adj: Record<string, { to: string; w: number; via: string }[]> = {};
  const dist = (a: string, b: string) => Math.hypot(N[a][0] - N[b][0], N[a][1] - N[b][1]);
  E.forEach(([a, b, via]) => {
    (adj[a] ||= []).push({ to: b, w: dist(a, b), via });
    (adj[b] ||= []).push({ to: a, w: dist(a, b), via });
  });
  function shortest(from: string, to: string) {
    const d: Record<string, number> = { [from]: 0 };
    const prev: Record<string, { n: string; via: string }> = {};
    const open = new Set(Object.keys(N));
    while (open.size) {
      let u = '';
      open.forEach((n) => (d[n] !== undefined && (u === '' || d[n] < d[u]) ? (u = n) : 0));
      if (!u || u === to) break;
      open.delete(u);
      for (const e of adj[u] || []) {
        const nd = d[u] + e.w;
        if (d[e.to] === undefined || nd < d[e.to]) {
          d[e.to] = nd;
          prev[e.to] = { n: u, via: e.via };
        }
      }
    }
    const path = [to];
    const vias: string[] = [];
    while (path[0] !== from && prev[path[0]]) {
      vias.unshift(prev[path[0]].via);
      path.unshift(prev[path[0]].n);
    }
    return { path, vias, len: d[to] ?? 0 };
  }
  const routeEl = el.querySelector<SVGPathElement>('[data-route]')!;
  const dotEl = el.querySelector<SVGCircleElement>('[data-route-dot]')!;
  const routeText = $('[data-mp-route]');
  const startNode = currentFloorId === 'cave' ? 'h1' : currentFloorId;
  let dotTween: gsap.core.Tween | null = null;

  function drawRoute(target: string) {
    dotTween?.kill();
    if (!N[target] || target === startNode) {
      routeEl.setAttribute('d', 'M0 0');
      dotEl.setAttribute('cx', '-20');
      routeText.textContent = target === startNode ? '● You are here' : '';
      return;
    }
    const { path, vias, len } = shortest(startNode, target);
    routeEl.setAttribute('d', 'M' + path.map((n) => N[n].join(' ')).join(' L'));
    const L = routeEl.getTotalLength();
    const steps = [...new Set(vias)].filter((v) => v !== 'The cave' || vias[vias.length - 1] === 'The cave');
    routeText.textContent = `${steps.join(' → ')} · ~${Math.max(1, Math.round(len / 190))} s`;
    if (reduce) {
      routeEl.style.strokeDasharray = 'none';
      return;
    }
    gsap.fromTo(routeEl, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.55, ease: 'power2.out', overwrite: true });
    const k = { t: 0 };
    dotTween = gsap.to(k, {
      t: 1,
      duration: Math.min(2.4, Math.max(0.9, L / 300)),
      ease: 'power1.inOut',
      repeat: -1,
      repeatDelay: 0.35,
      delay: 0.4,
      onUpdate: () => {
        const p = routeEl.getPointAtLength(k.t * L);
        dotEl.setAttribute('cx', p.x.toFixed(1));
        dotEl.setAttribute('cy', p.y.toFixed(1));
      },
    });
  }

  function show(id: string) {
    const f = data.find((x) => x.id === id);
    if (!f) return;
    items.forEach((i) => i.classList.toggle('on', i.getAttribute('data-map-floor') === id));
    const batman = f.wing === 'batman';
    panel.wing.style.setProperty('--wc', batman ? '#ffd400' : '#c9a45c');
    panel.wing.textContent = `${batman ? 'Batman' : 'Bruce Wayne'} wing · ${f.code}`;
    panel.wing.style.color = batman ? '#ffd400' : '#c9a45c';
    panel.name.textContent = f.name;
    panel.fn.textContent = f.fn;
    panel.mood.textContent = f.mood;
    panel.ref.textContent = `Inspired by ${f.ref}`;
    panel.go.setAttribute('href', f.href);
    panel.rooms.innerHTML = f.rooms
      .map((r) => `<li><a href="${f.href}${r.anchor}"><b>${r.label}</b><i>${r.blurb}</i></a></li>`)
      .join('');
  }

  function open() {
    lastFocus = document.activeElement as HTMLElement;
    el!.hidden = false;
    lenis?.stop();
    items.forEach((i) => i.classList.toggle('here', i.getAttribute('data-map-floor') === currentFloorId));
    show(currentFloorId);
    if (!reduce) {
      gsap.fromTo('.map-box', { y: 24, opacity: 0, scale: 0.985 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' });
      gsap.fromTo('.map-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo('.map-svg .m-floor', { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.06, delay: 0.15 });
    }
    const here = items.find((i) => i.getAttribute('data-map-floor') === currentFloorId) as any;
    (here ?? el!.querySelector<HTMLElement>('.map-x'))?.focus({ preventScroll: true });
    const scroller = el!.querySelector<HTMLElement>('[data-map-scroll]');
    if (scroller && here && scroller.scrollWidth > scroller.clientWidth) {
      const r = (here as SVGGraphicsElement).getBoundingClientRect();
      const sr = scroller.getBoundingClientRect();
      scroller.scrollLeft += r.left + r.width / 2 - (sr.left + sr.width / 2);
    }
    selected = '';
    drawRoute(startNode);
  }
  function close() {
    if (el!.hidden) return;
    el!.hidden = true;
    if (!riding) lenis?.start();
    lastFocus?.focus?.();
  }

  window.addEventListener('pw:map', () => (el.hidden ? open() : close()));
  document.querySelectorAll('[data-map-open]').forEach((b) => b.addEventListener('click', open));
  el.querySelectorAll('[data-map-close]').forEach((b) => b.addEventListener('click', close));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
  const select = (i: Element) => {
    const id = i.getAttribute('data-map-floor')!;
    show(id);
    drawRoute(i.getAttribute('data-room') || id);
  };
  items.forEach((i, n) => {
    i.addEventListener('pointerenter', () => select(i));
    i.addEventListener('focus', () => select(i));
    i.addEventListener('keydown', (e) => {
      const k = (e as KeyboardEvent).key;
      const step = k === 'ArrowDown' || k === 'ArrowRight' ? 1 : k === 'ArrowUp' || k === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      (items[(n + step + items.length) % items.length] as any).focus();
    });
  });
  window.addEventListener('pw:ride', () => {
    el.hidden = true;
    dotTween?.kill();
  });
  // Touch: the first tap on a space selects it (panel + route), the second rides.
  let pointerType = 'mouse';
  let selected = '';
  el.addEventListener('pointerdown', (e) => (pointerType = e.pointerType), true);
  // Close before the elevator starts so the doors are not hidden behind the map
  el.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest('a[href]');
    if (!a) return;
    const item = a.closest('[data-map-floor]');
    if (item && pointerType === 'touch') {
      const key = (item.getAttribute('data-room') || '') + item.getAttribute('data-map-floor');
      if (key !== selected) {
        e.preventDefault();
        selected = key;
        select(item);
        (item as any).focus({ preventScroll: true });
        el.querySelector('.map-panel')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
        return;
      }
    }
    el.hidden = true;
    lastFocus = null;
  });
}

/* ───────────── Newsletter ───────────── */
function initSignal() {
  const form = document.querySelector<HTMLFormElement>('[data-signal-form]');
  const note = document.querySelector<HTMLElement>('[data-signal-note]');
  const box = document.querySelector<HTMLElement>('.signal');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    box?.classList.remove('lit');
    void box?.offsetWidth;
    box?.classList.add('lit');
    if (note) note.textContent = 'Signal lit. (Prototype: the address was not stored or sent anywhere.)';
    form.reset();
  });
}

/* ───────────── Reveal helpers (for pages) ───────────── */
export function initReveals(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const delay = Number(el.dataset.delay || 0);
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      delay,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  document.fonts.ready.then(() => {
    scope.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
      if (reduce) return;
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'sl',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 112,
            duration: 1.15,
            ease: 'expo.out',
            stagger: 0.09,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        },
      });
    });
  });

  scope.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const to = Number(el.dataset.count);
    const dec = Number(el.dataset.dec || 0);
    const obj = { v: 0 };
    const fmt = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (reduce) return void (el.textContent = fmt(to));
    el.textContent = fmt(0);
    gsap.to(obj, {
      v: to,
      duration: 2.4,
      ease: 'expo.out',
      delay: Number(el.dataset.delay || 0),
      onUpdate: () => (el.textContent = fmt(obj.v)),
      scrollTrigger: { trigger: el, start: 'top 98%', once: true },
    });
  });
}

/* ───────────── Torch: a cone of light that reveals text ───────────── */
export function initTorch(el: HTMLElement) {
  if (reduce) {
    el.classList.add('torch-lit');
    return;
  }
  const set = (x: number, y: number) => {
    el.style.setProperty('--tx', `${x}px`);
    el.style.setProperty('--ty', `${y}px`);
  };
  const r0 = el.getBoundingClientRect();
  set(r0.width * 0.5, r0.height * 0.5);
  if (isTouch) {
    // No cursor on touch: the light patrols on its own.
    const p = { t: 0 };
    gsap.to(p, {
      t: 1,
      duration: 9,
      repeat: -1,
      ease: 'none',
      onUpdate: () => {
        const r = el.getBoundingClientRect();
        set(r.width * (0.5 + 0.38 * Math.sin(p.t * Math.PI * 2)), r.height * (0.5 + 0.3 * Math.sin(p.t * Math.PI * 4 + 1)));
      },
    });
    return;
  }
  const pos = { x: r0.width * 0.5, y: r0.height * 0.5 };
  const to = { x: pos.x, y: pos.y };
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    to.x = e.clientX - r.left;
    to.y = e.clientY - r.top;
  });
  gsap.ticker.add(() => {
    pos.x += (to.x - pos.x) * 0.14;
    pos.y += (to.y - pos.y) * 0.14;
    set(pos.x, pos.y);
  });
}

/* ───────────── Boot ───────────── */
export const arrived: Promise<void> = (() => {
  setHud(currentFloorId);
  initChrome();
  initPalette();
  initMap();
  initSignal();
  return arrive().then(() => {
    if (location.hash) {
      const el = document.querySelector<HTMLElement>(location.hash);
      if (el) scrollToTarget(el, true);
    }
  });
})();
