import { reduce, gsap } from './core';

const LIT = '#ffd400';
const DIM = 'rgba(230, 228, 223, 0.14)';

/**
 * 100 × 100 dots = 10,000 pull-ups, the 24-hour record target.
 * Each row is 100 reps: one of his daily sets.
 */
export function pullGrid(canvas: HTMLCanvasElement, cols = 100, rows = 100) {
  const ctx = canvas.getContext('2d')!;
  const back = document.createElement('canvas');
  const bctx = back.getContext('2d')!;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let p = reduce ? 0.42 : 0;

  function layout() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width;
    h = r.height;
    if (!w || !h) return; // not laid out yet
    canvas.width = back.width = Math.round(w * dpr);
    canvas.height = back.height = Math.round(h * dpr);
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bctx.clearRect(0, 0, w, h);
    bctx.fillStyle = DIM;
    const cw = w / cols;
    const ch = h / rows;
    const rad = Math.max(0.6, Math.min(cw, ch) * 0.3);
    bctx.beginPath();
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        bctx.moveTo((x + 0.5) * cw + rad, (y + 0.5) * ch);
        bctx.arc((x + 0.5) * cw, (y + 0.5) * ch, rad, 0, Math.PI * 2);
      }
    }
    bctx.fill();
    draw();
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(back, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cw = w / cols;
    const ch = h / rows;
    const rad = Math.max(0.6, Math.min(cw, ch) * 0.3);
    const lit = Math.round(p * cols * rows);
    const fullRows = Math.floor(lit / cols);
    ctx.fillStyle = LIT;
    ctx.beginPath();
    for (let y = 0; y < fullRows; y++) {
      for (let x = 0; x < cols; x++) {
        ctx.moveTo((x + 0.5) * cw + rad, (y + 0.5) * ch);
        ctx.arc((x + 0.5) * cw, (y + 0.5) * ch, rad, 0, Math.PI * 2);
      }
    }
    const rem = lit - fullRows * cols;
    for (let x = 0; x < rem; x++) {
      ctx.moveTo((x + 0.5) * cw + rad, (fullRows + 0.5) * ch);
      ctx.arc((x + 0.5) * cw, (fullRows + 0.5) * ch, rad, 0, Math.PI * 2);
    }
    ctx.fill();
    // glow on the working row
    if (lit > 0 && lit < cols * rows) {
      ctx.shadowColor = LIT;
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#fff6c2';
      ctx.beginPath();
      for (let x = 0; x < Math.max(rem, 1); x++) {
        ctx.moveTo((x + 0.5) * cw + rad * 1.15, (fullRows + 0.5) * ch);
        ctx.arc((x + 0.5) * cw, (fullRows + 0.5) * ch, rad * 1.15, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  const ro = new ResizeObserver(layout);
  ro.observe(canvas);
  layout();

  return {
    set(v: number) {
      p = Math.max(0, Math.min(1, v));
      draw();
    },
    get count() {
      return Math.round(p * cols * rows);
    },
  };
}

/** Rain for dark floors: three depth layers, light wind, paused off-screen. */
export function rain(canvas: HTMLCanvasElement) {
  if (reduce) return;
  const ctx = canvas.getContext('2d')!;
  type Drop = { x: number; y: number; l: number; v: number; z: number };
  let drops: Drop[] = [];
  let w = 0;
  let h = 0;
  let visible = true;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  const seed = () => {
    const n = Math.round((w * h) / 9000);
    drops = Array.from({ length: n }, () => {
      const z = Math.random();
      return { x: Math.random() * (w + 80), y: Math.random() * h, l: 10 + z * 22, v: 520 + z * 760, z };
    });
  };
  const ro = new ResizeObserver(() => {
    const r = canvas.getBoundingClientRect();
    w = r.width;
    h = r.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  });
  ro.observe(canvas);
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);

  const wind = -0.16;
  gsap.ticker.add(() => {
    if (!visible || !w) return;
    const dt = Math.min(gsap.ticker.deltaRatio(60) / 60, 0.05);
    ctx.clearRect(0, 0, w, h);
    for (const band of [0, 1, 2]) {
      ctx.strokeStyle = `rgba(190, 205, 230, ${[0.08, 0.14, 0.22][band]})`;
      ctx.lineWidth = [0.6, 0.9, 1.2][band];
      ctx.beginPath();
      for (const d of drops) {
        if (Math.min(2, Math.floor(d.z * 3)) !== band) continue;
        d.y += d.v * dt;
        d.x += d.v * wind * dt;
        if (d.y > h + 40) {
          d.y = -d.l;
          d.x = Math.random() * (w + 80);
        }
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.l * wind, d.y + d.l);
      }
      ctx.stroke();
    }
  });
}
