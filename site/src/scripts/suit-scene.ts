import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  Group,
  HemisphereLight,
  LatheGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PMREMGenerator,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  RingGeometry,
  Scene,
  Sprite,
  SpriteMaterial,
  SphereGeometry,
  Vector2,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { gsap, isTouch, lenis } from './core';

/**
 * An original armored vigilante, built from primitives: a lathe-turned torso,
 * segmented pauldrons and abs, a cowl with a brow and two ears, gauntlet
 * fins, and a pleated cape that reacts to scroll speed. Thin edge lines pick
 * out every plate in the dark. Stylised in the spirit of the tactical suits of
 * the 2005+ films; no emblem, no official model. Swap `buildFigure` for a
 * licensed glTF if you have one.
 */

export type Pose = 'hero' | 'manifesto' | 'cases' | 'cave' | 'dim' | 'hidden';

interface Target {
  x: number;
  rotY: number;
  scale: number;
  opacity: number;
}

const POSES: Record<Pose, Target> = {
  hero: { x: 1, rotY: -0.42, scale: 1, opacity: 1 },
  manifesto: { x: 1, rotY: Math.PI + 0.3, scale: 1.04, opacity: 0.92 },
  cases: { x: 1, rotY: 0.55, scale: 0.95, opacity: 0.36 },
  cave: { x: 1, rotY: -0.32, scale: 1, opacity: 0.6 },
  dim: { x: 1, rotY: 0.2, scale: 0.95, opacity: 0.14 },
  hidden: { x: 1, rotY: 0, scale: 1, opacity: 0 },
};

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,248,220,1)');
  grd.addColorStop(0.25, 'rgba(255,230,160,0.55)');
  grd.addColorStop(1, 'rgba(255,230,160,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

function buildFigure() {
  const suit = new MeshStandardMaterial({ color: 0x2a2e36, roughness: 0.52, metalness: 0.3, flatShading: true });
  const plate = new MeshStandardMaterial({ color: 0x3a414d, roughness: 0.36, metalness: 0.55, flatShading: true });
  const trim = new MeshStandardMaterial({ color: 0x4a5363, roughness: 0.42, metalness: 0.45, flatShading: true });
  const eye = new MeshBasicMaterial({ color: 0xfff3cf });
  const edgeMat = new LineBasicMaterial({ color: 0xa8bdf2, transparent: true, opacity: 0.3 });

  const root = new Group();
  const body = new Group();
  root.add(body);

  // mesh + faint edge lines so every plate reads against the dark
  const mk = (parent: Group, geo: any, mat: any, x = 0, y = 0, z = 0, edges = true) => {
    const m = new Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    if (edges) m.add(new LineSegments(new EdgesGeometry(geo, 30), edgeMat));
    return m;
  };

  /* ───── Legs: heavy thighs, angular knee guards, boots with a toe wedge ───── */
  const legs: Group[] = [];
  for (const side of [-1, 1]) {
    const leg = new Group();
    leg.position.set(side * 0.25, -0.24, 0);
    leg.rotation.z = side * 0.07;
    leg.rotation.x = side < 0 ? -0.07 : 0.06; // weight on one leg
    mk(leg, new CylinderGeometry(0.2, 0.15, 0.84, 7), suit, 0, -0.5, 0);
    mk(leg, new BoxGeometry(0.2, 0.2, 0.06), trim, 0, -0.94, 0.15).rotation.x = -0.35; // knee guard
    mk(leg, new SphereGeometry(0.15, 7, 5), plate, 0, -0.96, 0.02).scale.set(1, 0.7, 1.05);
    mk(leg, new CylinderGeometry(0.15, 0.11, 0.76, 7), plate, 0, -1.34, 0);
    mk(leg, new BoxGeometry(0.06, 0.5, 0.2), trim, side * 0.13, -1.3, 0.03); // greave rail
    mk(leg, new BoxGeometry(0.29, 0.28, 0.5), trim, 0, -1.65, 0.08);
    const toe = mk(leg, new BoxGeometry(0.27, 0.1, 0.22), plate, 0, -1.76, 0.3);
    toe.rotation.x = -0.22;
    body.add(leg);
    legs.push(leg);
  }

  /* ───── Belt ───── */
  mk(body, new BoxGeometry(0.76, 0.17, 0.42), trim, 0, -0.16, 0);
  mk(body, new BoxGeometry(0.15, 0.13, 0.05), plate, 0, -0.16, 0.23);
  for (const x of [-0.31, -0.19, 0.19, 0.31]) mk(body, new BoxGeometry(0.1, 0.14, 0.1), plate, x, -0.16, 0.22);

  /* ───── Torso: a V-taper turned on a lathe, ringed abs, pectoral wedges ───── */
  const torso = new Group();
  body.add(torso);
  const prof = [
    [0, -0.1], [0.27, -0.1], [0.3, 0.12], [0.38, 0.42], [0.51, 0.78], [0.58, 1.06], [0.5, 1.24], [0.2, 1.3], [0, 1.3],
  ].map(([r, y]) => new Vector2(r, y));
  const core = mk(torso, new LatheGeometry(prof, 8), suit, 0, 0, 0);
  core.scale.z = 0.58;
  core.rotation.y = Math.PI / 8;
  for (let i = 0; i < 3; i++) {
    const ring = mk(torso, new CylinderGeometry(0.325 + i * 0.045, 0.325 + i * 0.045, 0.055, 8), i === 1 ? plate : trim, 0, i * 0.17, 0);
    ring.scale.z = 0.6;
    ring.rotation.y = Math.PI / 8;
  }
  for (const side of [-1, 1]) {
    const pec = mk(torso, new BoxGeometry(0.34, 0.3, 0.12), plate, side * 0.2, 0.86, 0.255);
    pec.rotation.set(-0.22, side * 0.1, side * -0.1);
  }
  mk(torso, new BoxGeometry(0.06, 0.52, 0.05), trim, 0, 0.78, 0.3);

  /* ───── Shoulders: three-layer segmented pauldrons ───── */
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const s = mk(torso, new SphereGeometry(0.255 - i * 0.025, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), i === 0 ? trim : plate, side * 0.67, 1.16 - i * 0.075, 0);
      s.scale.set(1.2, 0.62, 1.1);
      s.rotation.z = side * -0.32;
    }
  }
  mk(torso, new CylinderGeometry(0.12, 0.16, 0.24, 7), suit, 0, 1.4, 0);

  /* ───── Head: cowl, brow, jaw, long ears, glowing slits ───── */
  const head = new Group();
  head.position.set(0, 1.68, 0.01);
  torso.add(head);
  const cowl = mk(head, new SphereGeometry(0.27, 10, 8), suit, 0, 0, 0);
  cowl.scale.set(0.9, 1.12, 1);
  mk(head, new CylinderGeometry(0.2, 0.125, 0.24, 6), trim, 0, -0.17, 0.06).rotation.y = Math.PI / 6;
  const glow = glowTexture();
  for (const side of [-1, 1]) {
    const ear = mk(head, new ConeGeometry(0.07, 0.46, 4), suit, side * 0.135, 0.38, -0.03);
    ear.rotation.z = side * -0.15;
    ear.rotation.x = -0.12;
    mk(head, new BoxGeometry(0.17, 0.042, 0.17), trim, side * 0.1, 0.125, 0.2).rotation.z = side * 0.28; // brow, inner end down
    const slit = mk(head, new BoxGeometry(0.105, 0.024, 0.012), eye, side * 0.092, 0.07, 0.258, false);
    slit.rotation.z = side * 0.3;
    const halo = new Sprite(new SpriteMaterial({ map: glow, color: 0xffeeb8, blending: AdditiveBlending, transparent: true, opacity: 0.85, depthWrite: false }));
    halo.position.set(side * 0.092, 0.07, 0.28);
    halo.scale.setScalar(0.2);
    head.add(halo);
  }

  /* ───── Arms: segmented upper arm, elbow guard, gauntlet with fins ───── */
  const arms: { upper: Group; fore: Group; side: number; baseZ: number; baseX: number }[] = [];
  for (const side of [-1, 1]) {
    const upper = new Group();
    upper.position.set(side * 0.74, 1.08, 0);
    const baseZ = side * (side < 0 ? 0.3 : 0.5);
    upper.rotation.z = baseZ;
    mk(upper, new CylinderGeometry(0.12, 0.095, 0.6, 7), suit, 0, -0.3, 0);
    const fore = new Group();
    fore.position.set(0, -0.6, 0);
    const baseX = side < 0 ? -0.2 : -0.55; // one arm hangs, the other is bent forward
    fore.rotation.x = baseX;
    fore.rotation.z = side * 0.08;
    mk(fore, new SphereGeometry(0.11, 6, 5), plate, 0, 0, -0.01);
    mk(fore, new CylinderGeometry(0.098, 0.13, 0.54, 7), plate, 0, -0.31, 0);
    for (let i = 0; i < 3; i++) {
      const fin = mk(fore, new BoxGeometry(0.02, 0.18, 0.12), trim, side * 0.145, -0.2 - i * 0.1, 0);
      fin.rotation.z = side * 0.6;
    }
    mk(fore, new BoxGeometry(0.17, 0.2, 0.2), suit, 0, -0.68, 0.01);
    upper.add(fore);
    torso.add(upper);
    arms.push({ upper, fore, side, baseZ, baseX });
  }

  /* ───── Cape: collar + a cloth plane displaced every frame ───── */
  for (const side of [-1, 1]) {
    const c = mk(torso, new BoxGeometry(0.17, 0.42, 0.045), suit, side * 0.22, 1.46, -0.2, false);
    c.rotation.set(-0.25, side * 0.2, side * -0.3);
  }
  const capeGeo = new PlaneGeometry(2.1, 3, 20, 28);
  const cape = new Mesh(capeGeo, new MeshStandardMaterial({ color: 0x20232b, roughness: 0.86, metalness: 0.04, side: DoubleSide }));
  cape.position.set(0, 1.32 - 1.5, -0.26);
  torso.add(cape);
  const base = Float32Array.from(capeGeo.attributes.position.array as Float32Array);

  const updateCape = (t: number, sway: number, whip: number) => {
    const pos = capeGeo.attributes.position as any;
    const wind = Math.sin(t * 0.45) * 0.3 + 0.3 + whip * 1.2;
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3];
      const by = base[i * 3 + 1];
      const v = (1.5 - by) / 3; // 0 at the shoulders, 1 at the hem
      const spread = 0.5 + 1.05 * Math.pow(v, 0.85);
      const pleat = Math.sin(bx * 8.5 + t * 0.5) * 0.035 * v;
      const flutter = (Math.sin(v * 4 + t * 1.7 + bx * 2.4) * 0.1 + Math.sin(t * 0.9 + bx * 3.1 + v * 1.4) * 0.05) * v * (1 + whip * 2.4);
      const scallop = Math.pow(v, 4) * Math.max(0, Math.sin(bx * 7.2 + 0.6)) * 0.22;
      pos.setXYZ(i, bx * spread + sway * v * 0.35 + wind * v * v * 0.55, by - scallop, -v * 0.5 - wind * 0.22 * v + pleat + flutter);
    }
    pos.needsUpdate = true;
    capeGeo.computeVertexNormals();
  };
  updateCape(0, 0, 0);

  return { root, body, torso, head, arms, legs, updateCape };
}

export function createSuit(canvas: HTMLCanvasElement, initial: Pose) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new Scene();
  // a soft studio environment gives the metal plates something to reflect
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.05).texture;
  (scene as any).environmentIntensity = 0.26;

  const camera = new PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0.1, 8.6);
  camera.lookAt(0, 0, 0);

  const fig = buildFigure();
  const stage = new Group();
  stage.add(fig.root);
  scene.add(stage);
  fig.root.position.y = -0.05;

  // Warm key from the beam side, cold rims from behind, a yellow pool at the feet.
  scene.add(new AmbientLight(0x8d97ad, 0.7));
  scene.add(new HemisphereLight(0xb6c4e6, 0x2a1f0e, 0.7));
  const key = new DirectionalLight(0xffd49a, 3);
  key.position.set(-3.2, 4, 3.4);
  scene.add(key);
  const rim = new DirectionalLight(0x8fb0ff, 6.5);
  rim.position.set(3.4, 2.2, -3.2);
  scene.add(rim);
  const rim2 = new DirectionalLight(0xdfe8ff, 3.5);
  rim2.position.set(-2.8, 1.4, -3.4);
  scene.add(rim2);
  const pool = new PointLight(0xffd400, 7, 5.5, 2);
  pool.position.set(0, -1.7, 1.1);
  stage.add(pool);

  const ring = new Mesh(
    new RingGeometry(0.55, 1.2, 56),
    new MeshBasicMaterial({ color: 0xffd400, transparent: true, opacity: 0.2, blending: AdditiveBlending, depthWrite: false })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, -1.86, 0);
  stage.add(ring);

  /* Sizing */
  let aspect = 1;
  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    aspect = w / h;
  };
  resize();
  window.addEventListener('resize', resize);

  /* Pose state, eased every frame */
  const cur = { x: 0, rotY: 0, scale: 1 };
  let tgt: Target = { ...POSES[initial] };
  let pose: Pose = initial;
  const worldX = (k: number) => {
    // right third of the screen on wide viewports, centred on narrow ones
    const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * aspect;
    return aspect > 1.25 ? k * halfW * 0.56 : 0;
  };
  cur.x = worldX(tgt.x);
  cur.rotY = tgt.rotY - 0.8;
  cur.scale = tgt.scale * 0.92;

  const setPose = (p: Pose) => {
    if (p === pose) return;
    pose = p;
    tgt = { ...POSES[p] };
  };

  /* Pointer */
  const m = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!isTouch) {
    window.addEventListener('pointermove', (e) => {
      m.tx = (e.clientX / window.innerWidth) * 2 - 1;
      m.ty = (e.clientY / window.innerHeight) * 2 - 1;
    });
  }

  let canvasOpacity = 0;
  let whip = 0;
  gsap.ticker.add((time) => {
    cur.x += (worldX(tgt.x) - cur.x) * 0.06;
    cur.rotY += (tgt.rotY - cur.rotY) * 0.045;
    cur.scale += (tgt.scale - cur.scale) * 0.06;
    canvasOpacity += (tgt.opacity - canvasOpacity) * 0.06;
    canvas.style.opacity = canvasOpacity.toFixed(3);
    if (canvasOpacity < 0.005) return; // nothing to see: skip the work

    m.x += (m.tx - m.x) * 0.05;
    m.y += (m.ty - m.y) * 0.05;
    // the cape whips when the page is scrolled fast
    const vel = Math.min(Math.abs(lenis?.velocity ?? 0), 40) / 40;
    whip += (vel - whip) * 0.07;

    stage.position.x = cur.x;
    stage.scale.setScalar(cur.scale * 0.8);
    stage.rotation.y = cur.rotY + m.x * 0.18 + Math.sin(time * 0.4) * 0.03;
    fig.body.rotation.z = Math.sin(time * 0.5) * 0.012; // weight shift
    fig.torso.rotation.y = Math.sin(time * 0.37) * 0.05;
    fig.torso.position.y = Math.sin(time * 1.6) * 0.009; // breathing
    fig.head.rotation.y = m.x * 0.38;
    fig.head.rotation.x = m.y * 0.16 + 0.03;
    fig.head.rotation.z = Math.sin(time * 0.3) * 0.02;
    for (const a of fig.arms) {
      a.upper.rotation.z = a.baseZ + Math.sin(time * 1.1 + a.side) * 0.014 + whip * a.side * 0.12;
      a.fore.rotation.x = a.baseX + Math.sin(time * 1.3 + a.side) * 0.022;
    }
    fig.updateCape(time, m.x * 0.35, whip);
    ring.rotation.z = time * 0.12;
    renderer.render(scene, camera);
  });

  window.addEventListener('pw:pose', (e) => setPose((e as CustomEvent<Pose>).detail));

  return { setPose };
}
