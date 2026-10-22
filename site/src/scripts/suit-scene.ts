import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  AmbientLight,
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PMREMGenerator,
  PerspectiveCamera,
  RepeatWrapping,
  Scene,
  Shape,
  ShapeUtils,
  Sprite,
  SpriteMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { gsap, isTouch } from './core';

/**
 * The chest of an armored suit in the spirit of the Arkham Knight, built from
 * code and traced over reference frames: the black sternum, ribbed panels and
 * glossy side plates form one big bat across the chest, framed by domed navy
 * plates (pectorals, shoulders, lower ribs). A slatted gorget with two blue
 * lights sits on top. The camera moves through five shots, one per reference
 * frame, in order as the page scrolls. Fan-made from primitives.
 */

export type Pose = 'hero' | 'manifesto' | 'cases' | 'cave' | 'dim' | 'hidden';

interface Shot {
  y: number; // vertical offset of the chest centre
  s: number; // scale (how close the shot is)
  rx: number; // tilt: negative looks up at the chest from below
  ry: number;
  light: number; // key light multiplier
}

// one per reference frame, in file order (1 … 5)
const SHOTS: Shot[] = [
  { y: 0.02, s: 2.2, rx: -0.12, ry: 0, light: 1 },
  { y: -0.06, s: 2.38, rx: -0.2, ry: 0.035, light: 0.78 },
  { y: 0.05, s: 2.3, rx: -0.1, ry: -0.02, light: 1 },
  { y: -0.3, s: 2.12, rx: 0.08, ry: 0, light: 0.95 },
  { y: 0.12, s: 2.55, rx: -0.5, ry: 0.04, light: 0.7 },
];

// shot -1 keeps the current framing
const POSES: Record<Pose, { shot: number; opacity: number }> = {
  hero: { shot: 0, opacity: 1 },
  manifesto: { shot: 1, opacity: 0.92 }, // then 1 → 2 with the manifesto's scroll progress
  cases: { shot: 3, opacity: 0.4 },
  cave: { shot: 4, opacity: 0.65 },
  dim: { shot: -1, opacity: 0.14 },
  hidden: { shot: -1, opacity: 0 },
};

const lerpShot = (i: number): Shot => {
  const a = SHOTS[Math.floor(i)];
  const b = SHOTS[Math.min(SHOTS.length - 1, Math.ceil(i))];
  const f = i - Math.floor(i);
  return { y: a.y + (b.y - a.y) * f, s: a.s + (b.s - a.s) * f, rx: a.rx + (b.rx - a.rx) * f, ry: a.ry + (b.ry - a.ry) * f, light: a.light + (b.light - a.light) * f };
};

function canvasTexture(size: number, paint: (g: CanvasRenderingContext2D, s: number) => void) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  paint(c.getContext('2d')!, size);
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

function glowTexture() {
  return canvasTexture(64, (g) => {
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.25, 'rgba(255,255,255,0.5)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
  });
}

// roughness map: satin base, clusters of glossy rain drops, a few dull scratches
function wetTexture() {
  return canvasTexture(256, (g, s) => {
    g.fillStyle = 'rgb(165,165,165)';
    g.fillRect(0, 0, s, s);
    const drop = (x: number, y: number, r: number) => {
      const v = 80 + Math.random() * 50;
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.beginPath();
      g.ellipse(x, y, r, r * (0.6 + Math.random() * 0.5), Math.random() * 3, 0, Math.PI * 2);
      g.fill();
    };
    for (let c = 0; c < 5; c++) {
      const cx = Math.random() * s;
      const cy = Math.random() * s;
      for (let i = 0; i < 35; i++) drop((cx + (Math.random() - 0.5) * 70 + s) % s, (cy + (Math.random() - 0.5) * 50 + s) % s, 1 + Math.random() * 3.5);
    }
    for (let i = 0; i < 120; i++) drop(Math.random() * s, Math.random() * s, 0.6 + Math.random() * 1.6);
    g.strokeStyle = 'rgba(225,225,225,0.7)';
    g.lineWidth = 0.7;
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * s;
      const y = Math.random() * s;
      const a = -0.6 + Math.random() * 1.2;
      const l = 10 + Math.random() * 40;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      g.stroke();
    }
  });
}

// bump map: fine horizontal ribs for the armored undersuit
function ribTexture() {
  const t = canvasTexture(64, (g, s) => {
    for (let y = 0; y < s; y++) {
      const v = 128 + Math.sin((y / s) * Math.PI * 2 * 8) * 110;
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.fillRect(0, y, s, 1);
    }
  });
  t.repeat.set(1, 4);
  return t;
}

/* ───── Chest surface: a barrel with an elliptical cross-section ───── */
const PROF: [number, number][] = [
  [0, -0.05], [0.62, -0.05], [0.66, 0.1], [0.72, 0.3], [0.775, 0.6], [0.77, 0.8], [0.76, 0.95], [0.7, 1.05], [0.56, 1.12], [0.36, 1.2], [0.2, 1.26], [0, 1.26],
];
const DEPTH = 0.55; // front-to-back depth relative to width
const CENTRE = 0.62; // height of the chest centre

const radiusAt = (y: number) => {
  for (let i = 2; i < PROF.length - 1; i++) {
    const [r1, y1] = PROF[i];
    if (y <= y1) {
      const [r0, y0] = PROF[i - 1];
      return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0 || 1);
    }
  }
  return PROF[PROF.length - 2][0];
};

// front-view coordinates (X, Y, h above the surface) -> point on the chest
const onChest = (X: number, y: number, h: number, out = new Vector3()) => {
  const r = radiusAt(y);
  const a = Math.asin(Math.max(-0.995, Math.min(0.995, X / r)));
  return out.set(Math.sin(a) * (r + h), y, Math.cos(a) * (r * DEPTH + h));
};

/*
 * Outlines are traced in pixels over the frontal reference frame (3.webp,
 * 2000 × 1166, chest centred on x = 1030); P maps a pixel to front-view chest
 * coordinates.
 */
const K = 0.00079;
const P = (x: number, y: number): [number, number] => [(x - 1030) * K, 1 - (y - 135) * K];
type Cmd = [number, number] | [number, number, number, number];

const shapeOf = (cmds: Cmd[]) => {
  const s = new Shape();
  s.moveTo(...P(cmds[0][0], cmds[0][1]));
  for (const c of cmds.slice(1)) {
    if (c.length === 2) s.lineTo(...P(c[0], c[1]));
    else s.quadraticCurveTo(...P(c[0], c[1]), ...P(c[2], c[3]));
  }
  s.closePath();
  return s;
};
const trace = (cmds: Cmd[], divisions = 72) => {
  const pts = shapeOf(cmds).getSpacedPoints(divisions);
  if (pts[0].distanceTo(pts[pts.length - 1]) < 1e-6) pts.pop();
  return pts;
};
const mirror = (pts: Vector2[]) => pts.map((p) => new Vector2(-p.x, p.y));

/**
 * A domed armor plate draped on the chest: rings shrink from the outline to the
 * centre, rising in a quarter-round bevel then a soft dome, so the plate reads
 * as a thick moulded piece with rounded edges (no flat caps).
 */
function chestPlate(pts: Vector2[], { t = 0.04, dome = 0.012, edge = 0.09, lift = 0 } = {}) {
  const ring = ShapeUtils.isClockWise(pts) ? [...pts].reverse() : pts;
  const n = ring.length;
  const c = ring.reduce((a, p) => a.add(p), new Vector2()).divideScalar(n);
  const RINGS = 12;
  const pos: number[] = [];
  const uv: number[] = [];
  const v = new Vector3();
  const push = (x: number, y: number, h: number) => {
    onChest(x, y, lift + h, v);
    pos.push(v.x, v.y, v.z);
    uv.push(x * 2.5, y * 2.5);
  };
  push(c.x, c.y, t + dome);
  for (let r = 1; r <= RINGS; r++) {
    const k = r / RINGS;
    let s: number;
    let h: number;
    if (k <= 0.5) {
      const q = k / 0.5;
      s = q * (1 - edge);
      h = t + dome * (1 - q * q);
    } else {
      const phi = ((k - 0.5) / 0.5) * (Math.PI / 2);
      s = 1 - edge + edge * Math.sin(phi);
      h = r === RINGS ? -0.015 : t * Math.cos(phi);
    }
    for (const p of ring) push(c.x + (p.x - c.x) * s, c.y + (p.y - c.y) * s, h);
  }
  const idx: number[] = [];
  for (let i = 0; i < n; i++) idx.push(0, 1 + i, 1 + ((i + 1) % n));
  for (let r = 1; r < RINGS; r++) {
    const a = 1 + (r - 1) * n;
    const b = 1 + r * n;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      idx.push(a + i, b + i, b + j, a + i, b + j, a + j);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// a crisp bevelled relief for shapes a dome can't follow (the bat head's ears)
function chestRelief(cmds: Cmd[], { depth = 0.025, bevel = 0.01, lift = 0 } = {}) {
  const g = new ExtrudeGeometry(shapeOf(cmds), { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.6, bevelSegments: 2, curveSegments: 8 });
  const p = g.attributes.position;
  const v = new Vector3();
  for (let i = 0; i < p.count; i++) {
    onChest(p.getX(i), p.getY(i), lift + p.getZ(i), v);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

// right-hand plates, traced over 3.webp
const PLATES = {
  pec: [[1150, 560], [1130, 470, 1170, 420], [1210, 345, 1300, 320], [1490, 300], [1560, 300, 1560, 380], [1555, 470], [1550, 560, 1470, 580], [1250, 610], [1160, 620, 1150, 560]],
  ribbed: [[1160, 610], [1540, 585], [1545, 820], [1230, 845], [1190, 845, 1185, 810]],
  wing: [[1545, 330], [1740, 325], [1900, 380, 1960, 625], [1790, 650, 1700, 830], [1560, 840]],
  shoulder: [[1500, 330], [1500, 215], [1540, 160, 1650, 150], [1780, 150], [1950, 180, 1990, 380], [1992, 600], [1962, 622], [1900, 375, 1740, 322], [1545, 326]],
  flank: [[1700, 840], [1790, 660, 1965, 640], [1995, 800, 1940, 900], [1860, 1030, 1700, 1060], [1640, 1040], [1650, 860]],
  lowRib: [[1120, 945], [1150, 880, 1260, 860], [1600, 840], [1640, 845, 1635, 900], [1620, 1030], [1400, 1060, 1200, 1000], [1120, 975, 1120, 945]],
  trap: [[1170, 330], [1180, 265], [1545, 150], [1555, 210], [1500, 300], [1300, 322]],
  collarbone: [[1118, 342], [1180, 330], [1150, 560], [1140, 615], [1080, 615], [1110, 560], [1112, 480]],
  frame: [[1072, 615], [1150, 605], [1185, 845], [1120, 950], [1068, 1000]],
} satisfies Record<string, Cmd[]>;

function buildChest() {
  const wet = wetTexture();
  const rib = ribTexture();
  const armor = new MeshPhysicalMaterial({ color: 0x2a3a4c, roughness: 0.82, roughnessMap: wet, metalness: 0.28, clearcoat: 1, clearcoatRoughness: 0.18 });
  const armorPale = new MeshPhysicalMaterial({ color: 0x37485a, roughness: 0.86, roughnessMap: wet, metalness: 0.22, clearcoat: 0.8, clearcoatRoughness: 0.24 });
  const gloss = new MeshPhysicalMaterial({ color: 0x090d14, roughness: 0.5, roughnessMap: wet, metalness: 0.5, clearcoat: 1, clearcoatRoughness: 0.05 });
  const under = new MeshStandardMaterial({ color: 0x111720, roughness: 0.7, metalness: 0.3, bumpMap: rib, bumpScale: 1.6 });
  const steel = new MeshPhysicalMaterial({ color: 0x5b6d88, roughness: 0.28, metalness: 0.75, clearcoat: 1, clearcoatRoughness: 0.1 });
  const tab = new MeshBasicMaterial({ color: 0xe8f3ff });
  const led = new MeshBasicMaterial({ color: 0x9fdcff });
  const glow = glowTexture();

  const root = new Group();
  const chest = new Group();
  chest.position.y = -CENTRE;
  root.add(chest);

  const mk = (geo: BufferGeometry, mat: any, x = 0, y = 0, z = 0) => {
    const m = new Mesh(geo, mat);
    m.position.set(x, y, z);
    chest.add(m);
    return m;
  };
  const rbox = (w: number, h: number, d: number, r: number) => new RoundedBoxGeometry(w, h, d, 3, r);
  const plate = (cmds: Cmd[], mat: any, opts: Parameters<typeof chestPlate>[1], both = true) => {
    const pts = trace(cmds);
    mk(chestPlate(pts, opts), mat);
    if (both) mk(chestPlate(mirror(pts), opts), mat);
  };

  // ribbed core under everything
  const core = mk(new LatheGeometry(PROF.map(([r, y]) => new Vector2(r, y)), 64), under);
  core.scale.z = DEPTH;

  /* ───── The bat: head and ears, sternum, ribbed panels, glossy wings ───── */
  mk(chestRelief([[965, 415], [952, 500], [960, 580], [1000, 622], [1060, 622], [1100, 580], [1108, 500], [1095, 418], [1072, 468], [1030, 498], [988, 468]], { depth: 0.03, bevel: 0.012, lift: 0.02 }), gloss);
  plate([[992, 610], [1068, 610], [1066, 1110], [994, 1110]], gloss, { t: 0.045, dome: 0.018, edge: 0.3 }, false);
  plate(PLATES.collarbone, gloss, { t: 0.03, dome: 0.006, edge: 0.12, lift: -0.004 });
  plate(PLATES.frame, gloss, { t: 0.03, dome: 0.006, edge: 0.12, lift: -0.004 });
  plate(PLATES.ribbed, under, { t: 0.022, dome: 0.004, edge: 0.06, lift: -0.004 });
  plate(PLATES.wing, gloss, { t: 0.05, dome: 0.02, edge: 0.08 });

  /* ───── Navy plates around it ───── */
  plate([[935, 340], [1125, 340], [1100, 410], [1075, 465], [1030, 492], [985, 465], [960, 410]], armor, { t: 0.04, dome: 0.008, edge: 0.12 }, false);
  plate(PLATES.pec, armor, { t: 0.06, dome: 0.016, edge: 0.1 });
  plate(PLATES.shoulder, armor, { t: 0.055, dome: 0.014, edge: 0.08, lift: -0.004 });
  plate(PLATES.flank, armorPale, { t: 0.055, dome: 0.016, edge: 0.09 });
  plate(PLATES.lowRib, armor, { t: 0.055, dome: 0.014, edge: 0.09 });
  plate(PLATES.trap, gloss, { t: 0.04, dome: 0.008, edge: 0.1, lift: -0.008 });

  for (const side of [-1, 1]) {
    // white tabs where the wings meet the ribbed panels
    for (const [x, y] of [[1540, 578], [1508, 792]]) {
      const [X, Y] = P(1030 + side * (x - 1030), y);
      const p = onChest(X, Y, 0.012);
      const t = mk(rbox(0.012, 0.035, 0.012, 0.004), tab, p.x, p.y, p.z);
      t.rotation.y = Math.atan2(p.x, p.z / DEPTH);
    }
    // shoulder bolts
    const [X, Y] = P(1030 + side * 700, 130);
    const bolt = new Group();
    bolt.position.copy(onChest(X, Y, 0.07));
    bolt.lookAt(bolt.position.clone().add(new Vector3(bolt.position.x * 0.8, 0.6, bolt.position.z / DEPTH)));
    bolt.add(new Mesh(new CylinderGeometry(0.028, 0.03, 0.014, 24).rotateX(Math.PI / 2), steel));
    bolt.add(new Mesh(new CylinderGeometry(0.017, 0.017, 0.02, 6).rotateX(Math.PI / 2), gloss));
    chest.add(bolt);
  }

  /* ───── Gorget: a ring of slats around the neck, two blue lights at the front ───── */
  const neck = mk(new CylinderGeometry(0.3, 0.34, 0.42, 32), under, 0, 1.2, 0.1);
  neck.scale.z = 0.75;
  const SLATS = 40;
  for (let i = 0; i < SLATS; i++) {
    const a = (i / SLATS) * Math.PI * 2;
    const slat = mk(rbox(0.05, 0.3, 0.05, 0.014), i % 3 ? gloss : armor, Math.sin(a) * 0.36, 1.08, 0.14 + Math.cos(a) * 0.27);
    slat.rotation.order = 'YXZ';
    slat.rotation.y = a;
    slat.rotation.x = -0.28; // flared at the bottom
  }
  for (const side of [-1, 1]) {
    mk(rbox(0.02, 0.045, 0.012, 0.006), led, side * 0.048, 1.02, 0.45).rotation.x = -0.28;
    const s = new Sprite(new SpriteMaterial({ map: glow, color: 0x6fc2ff, blending: AdditiveBlending, transparent: true, opacity: 0.7, depthWrite: false }));
    s.position.set(side * 0.048, 1.02, 0.475);
    s.scale.setScalar(0.1);
    chest.add(s);
  }

  // breathing: the chest swells a touch
  const breathe = (t: number) => {
    const k = Math.sin(t * 1.4) * 0.006;
    chest.scale.set(1 + k, 1 + k * 0.5, 1 + k * 1.6);
  };

  return { root, breathe };
}

export function createSuit(canvas: HTMLCanvasElement, initial: Pose) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new Scene();
  // a soft studio environment gives the wet plates something to reflect
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.05).texture;
  (scene as any).environmentIntensity = 0.5;

  const camera = new PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 8.6);
  camera.lookAt(0, 0, 0);

  const chest = buildChest();
  const stage = new Group();
  stage.add(chest.root);
  scene.add(stage);

  // Cold, monochrome light as in the frames: a key from above, a hot spec on the right, blue rims.
  scene.add(new AmbientLight(0x7d8fb0, 0.3));
  scene.add(new HemisphereLight(0xb3c6e0, 0x05070a, 0.35));
  const key = new DirectionalLight(0xdfe9ff, 2.8);
  key.position.set(-1, 4, 2.6);
  scene.add(key);
  const spec = new DirectionalLight(0xe6f0ff, 2.2);
  spec.position.set(3.2, 1.2, 3);
  scene.add(spec);
  const fill = new DirectionalLight(0x6f95e0, 1.2);
  fill.position.set(-3, -1, 3);
  scene.add(fill);
  const rim = new DirectionalLight(0x8fb0ff, 4);
  rim.position.set(3.4, 2.2, -3.2);
  scene.add(rim);

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

  const halfH = () => Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
  // right third of the screen on wide viewports, centred on narrow ones
  const wide = () => aspect > 1.25;
  const worldX = () => (wide() ? halfH() * aspect * 0.52 : 0);

  /* Shot state, eased every frame */
  let shot = Math.max(0, POSES[initial].shot);
  let opacity = POSES[initial].opacity;
  let pose: Pose = initial;
  const cur = { x: worldX(), ...lerpShot(shot) };
  cur.ry -= 0.5;
  cur.s *= 0.92;

  const setPose = (p: Pose) => {
    if (p === pose) return;
    pose = p;
    if (POSES[p].shot >= 0) shot = POSES[p].shot;
    opacity = POSES[p].opacity;
  };

  /* Pointer */
  const m = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!isTouch) {
    window.addEventListener('pointermove', (e) => {
      m.tx = (e.clientX / window.innerWidth) * 2 - 1;
      m.ty = (e.clientY / window.innerHeight) * 2 - 1;
    });
  }

  // fade the edges of the chest into the page with a mask that follows it
  const centre = new Vector3();
  let mask = '';
  const updateMask = () => {
    centre.set(cur.x, cur.y, 0).project(camera);
    const hh = halfH();
    const v = [
      (centre.x * 0.5 + 0.5) * 100,
      (-centre.y * 0.5 + 0.5) * 100,
      ((0.92 * stage.scale.x) / (hh * aspect)) * 50,
      ((0.62 * stage.scale.x) / hh) * 50,
    ].map((n) => n.toFixed(1));
    const next = v.join();
    if (next === mask) return;
    mask = next;
    canvas.style.setProperty('--cx', `${v[0]}%`);
    canvas.style.setProperty('--cy', `${v[1]}%`);
    canvas.style.setProperty('--rx', `${v[2]}%`);
    canvas.style.setProperty('--ry', `${v[3]}%`);
  };

  let canvasOpacity = 0;
  const keys = ['y', 's', 'rx', 'ry', 'light'] as const;
  gsap.ticker.add((time) => {
    const tgt = lerpShot(shot);
    for (const k of keys) cur[k] += (tgt[k] - cur[k]) * 0.045;
    cur.x += (worldX() - cur.x) * 0.06;
    canvasOpacity += (opacity - canvasOpacity) * 0.06;
    canvas.style.opacity = canvasOpacity.toFixed(3);
    if (canvasOpacity < 0.005) return; // nothing to see: skip the work

    m.x += (m.tx - m.x) * 0.05;
    m.y += (m.ty - m.y) * 0.05;

    stage.position.set(cur.x, cur.y, 0);
    stage.scale.setScalar(cur.s * (wide() ? 0.88 : 0.78));
    stage.rotation.set(cur.rx + m.y * 0.05, cur.ry + m.x * 0.14 + Math.sin(time * 0.4) * 0.02, Math.sin(time * 0.3) * 0.006);
    chest.breathe(time);
    key.intensity = 4.2 * cur.light;
    spec.intensity = 3.2 * cur.light;
    updateMask();
    renderer.render(scene, camera);
  });

  window.addEventListener('pw:pose', (e) => setPose((e as CustomEvent<Pose>).detail));
  // the manifesto scrubs from the second frame to the third
  window.addEventListener('pw:shot', (e) => {
    if (pose === 'manifesto') shot = Math.min(SHOTS.length - 1, Math.max(0, (e as CustomEvent<number>).detail));
  });

  return { setPose };
}
