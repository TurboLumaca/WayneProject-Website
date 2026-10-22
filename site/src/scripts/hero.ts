import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { gsap, reduce, isTouch } from './core';

const vertex = /* glsl */ `
  attribute vec2 position;
  void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

// A signal beam in fog: a cone from below the fold, volumetric noise inside it,
// and a hot core. Cheap on purpose (two fbm calls, no loops over the beam).
const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uIntro;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.0; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    // the beam leaves the Wayne Tower roof (right third of the skyline) and leans back over the title
    vec2 src = vec2(0.25 * uRes.x / uRes.y, -0.78);
    float ang = -0.14 + (uMouse.x - 0.5) * 0.4 + sin(uTime * 0.21) * 0.035;
    vec2 d = p - src;
    float a = atan(d.x, d.y) - ang;
    float r = length(d);

    // Beam widens slightly with distance, like a real searchlight.
    float width = 0.075 + r * 0.09;
    float cone = smoothstep(width, 0.0, abs(a));
    cone *= smoothstep(0.02, 0.35, r) * exp(-r * 0.62);

    vec2 q = p * 2.4 + vec2(uTime * 0.025, -uTime * 0.045);
    float f = fbm(q + 1.6 * fbm(q * 1.4 + uTime * 0.035));

    float haze = cone * (0.35 + 1.15 * f);
    float core = smoothstep(width * 0.32, 0.0, abs(a)) * exp(-r * 0.95) * (0.65 + 0.5 * f);

    vec3 warm = vec3(1.0, 0.82, 0.30);
    vec3 hot = vec3(1.0, 0.96, 0.80);
    vec3 col = warm * haze * 0.62 + hot * core * 0.36;

    // Ambient fog bank low in the frame, and a soft vignette.
    float fog = fbm(p * 1.6 + vec2(uTime * 0.012, 0.0)) * smoothstep(0.1, -0.7, p.y);
    col += vec3(0.06, 0.065, 0.08) * fog * 0.9;
    col *= 1.0 - smoothstep(0.45, 1.25, length(p * vec2(0.8, 1.0)));

    // Intro: the beam ignites from the source outward.
    float reach = smoothstep(0.0, 1.0, uIntro) * 2.2;
    col *= smoothstep(reach, reach - 0.5, r) * smoothstep(0.0, 0.25, uIntro);

    col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.012; // dither
    // premultiplied alpha: the page (and the figure behind it) shows through the dark parts
    float alpha = clamp(max(max(col.r, col.g), col.b), 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

export function startHero(canvas: HTMLCanvasElement, hero: HTMLElement) {
  let renderer: Renderer;
  try {
    renderer = new Renderer({ canvas, dpr: Math.min(window.devicePixelRatio, 1.5), alpha: true, antialias: false });
  } catch {
    hero.classList.add('no-gl');
    return { intro: Promise.resolve() };
  }
  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);
  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uTime: { value: 0 },
      uRes: { value: [1, 1] },
      uMouse: { value: [0.5, 0.5] },
      uIntro: { value: reduce ? 1 : 0 },
    },
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  const resize = () => {
    const { width, height } = hero.getBoundingClientRect();
    renderer.setSize(width, height);
    program.uniforms.uRes.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
  };
  new ResizeObserver(resize).observe(hero);
  resize();

  // Pointer steers the beam (autonomous sway on touch).
  const target = { x: 0.5, y: 0.5 };
  const cur = { x: 0.5, y: 0.5 };
  if (!isTouch) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = (e.clientY - r.top) / r.height;
    });
  }

  let visible = true;
  new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(hero);

  const render = (t: number) => {
    const time = t * 0.001;
    if (isTouch) target.x = 0.5 + Math.sin(time * 0.35) * 0.22;
    cur.x += (target.x - cur.x) * 0.04;
    cur.y += (target.y - cur.y) * 0.04;
    program.uniforms.uTime.value = time;
    program.uniforms.uMouse.value = [cur.x, cur.y];
    // title light follows the beam
    hero.style.setProperty('--lx', `${(cur.x * 100).toFixed(1)}%`);
    renderer.render({ scene: mesh });
  };

  if (reduce) {
    render(8000);
    return { intro: Promise.resolve() };
  }

  gsap.ticker.add((t) => visible && render(t * 1000));

  const intro = new Promise<void>((resolve) => {
    gsap.to(program.uniforms.uIntro, { value: 1, duration: 2.6, ease: 'power2.inOut', delay: 0.2, onComplete: resolve });
  });
  return { intro };
}
