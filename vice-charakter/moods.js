/**
 * moods.js – zwei Stimmungen für die Charakterszene
 *   sunset: dunstiger Golden-Hour-Gegenlichtlook über der Küste mit Skyline-Silhouette
 *   neon:   Club-Terrasse bei Nacht mit Palmen, LED-Bändern, Lichterketten und magentafarbenem Hauptlicht
 * Jede Stimmung beschreibt Himmel, Licht, Nebel, Bloom, Tiefenunschärfe, Farbkorrektur und Kulisse.
 */
import * as THREE from 'three';

export const MOODS = {
  sunset: {
    label: 'Sonnenuntergang',
    exposure: 0.82,
    sky: { zenith: 0x4c5276, mid: 0xb98f7c, horizon: 0xe9a86e, ground: 0x2a2024, sun: { elevationDeg: 6, azimuthDeg: -122, disk: 22, halo: 0.9 }, panels: [] },
    key:  { color: 0xffae66, intensity: 4.6, fromSun: true },                      // Gegenlicht-Sonne
    fill: { color: 0xa9b8ff, intensity: 0.55, position: [-2.5, 2.0, 3.5] },       // kühles Fülllicht im Gesicht
    hemi: { sky: 0xc6ceff, ground: 0x3a2a26, intensity: 0.6 },
    rimA: { color: 0xffc27a, intensity: 70, position: [-2.0, 2.3, -2.6] },        // goldene Kante an Haar und Schulter
    rimB: { color: 0xffe2b8, intensity: 28, position: [2.4, 1.8, -2.2] },
    fog:  { color: 0xb08f7a, density: 0.0062 },                                       // Küstendunst
    bloom: { strength: 0.45, radius: 0.55, threshold: 1.6 },
    dofAperture: 0.0024,
    grade: { lift: [0.025, 0.02, 0.02], gamma: [1.0, 1.0, 1.04], gain: [1.07, 1.0, 0.88], saturation: 0.9 },
    ground: { color: 0x4a3d36, roughness: 0.65, metalness: 0.05 },
    set: 'skyline',
  },
  neon: {
    label: 'Neon-Nacht',
    exposure: 1.15,
    sky: { zenith: 0x05030c, mid: 0x170a2b, horizon: 0x341348, ground: 0x040208, sun: null,
      panels: [ { color: 0xff2a85, pos: [-6, 3, -4], size: [3, 6], power: 6 }, { color: 0x7a5cff, pos: [6, 4, -6], size: [6, 3], power: 4 },
                { color: 0x00f0ff, pos: [5, 2, 5], size: [2, 4], power: 3 }, { color: 0xffa860, pos: [-5, 2.5, 6], size: [3, 2], power: 2 } ] },
    key:  { color: 0xff5ad2, intensity: 3.2, position: [-3.2, 3.6, 3.0] },          // Neonschild links vorn
    fill: { color: 0xffa860, intensity: 0.7, position: [3.0, 1.6, 2.5] },           // warme Barbeleuchtung
    hemi: { sky: 0x3b2c90, ground: 0x0a0510, intensity: 0.55 },
    rimA: { color: 0xff2a85, intensity: 85, position: [-2.2, 2.4, -2.6] },
    rimB: { color: 0x00f0ff, intensity: 55, position: [2.4, 1.7, -2.2] },
    fog:  { color: 0x1c0b2c, density: 0.05 },
    bloom: { strength: 0.95, radius: 0.65, threshold: 0.95 },
    dofAperture: 0.0032,
    grade: { lift: [0.02, 0.0, 0.045], gamma: [1.0, 1.0, 1.0], gain: [1.0, 0.93, 1.08], saturation: 1.08 },
    ground: { color: 0x140b1c, roughness: 0.22, metalness: 0.2 },                     // nasser, spiegelnder Boden
    set: 'club',
  },
};

/* ------------------------------------------------------------------ Himmel als HDR-Umgebung */
export function createSkyScene(mood) {
  const S = mood.sky, env = new THREE.Scene();
  const sun = S.sun ? new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - S.sun.elevationDeg), THREE.MathUtils.degToRad(S.sun.azimuthDeg)) : new THREE.Vector3(0, -1, 0);
  env.add(new THREE.Mesh(new THREE.SphereGeometry(50, 64, 32), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: {
      uSunDir: { value: sun }, uSun: { value: S.sun ? 1 : 0 }, uDisk: { value: S.sun ? S.sun.disk : 0 }, uHalo: { value: S.sun ? S.sun.halo : 0 },
      uZenith: { value: new THREE.Color(S.zenith) }, uMid: { value: new THREE.Color(S.mid) },
      uHorizon: { value: new THREE.Color(S.horizon) }, uGround: { value: new THREE.Color(S.ground) },
    },
    vertexShader: /* glsl */`varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform vec3 uSunDir, uZenith, uMid, uHorizon, uGround; uniform float uSun, uDisk, uHalo; varying vec3 vDir;
      void main(){
        float h = vDir.y;
        vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.16, h));
        col = mix(col, uZenith, smoothstep(0.14, 0.7, h));
        col = mix(col, uGround, smoothstep(0.0, -0.1, h));
        float s = max(dot(vDir, normalize(uSunDir)), 0.0);
        col += uSun * vec3(1.0, 0.62, 0.3) * (pow(s, 6.0) * uHalo + pow(s, 64.0) * 3.0);   // Dunst-Glühen um die Sonne
        col += uSun * vec3(1.0, 0.82, 0.55) * smoothstep(0.9982, 0.9994, s) * uDisk;       // Sonnenscheibe (HDR)
        gl_FragColor = vec4(col, 1.0);
      }`,
  })));
  // Leuchtflächen spiegeln sich als Neon-Reflexe auf Haut, Augen und Boden
  for (const p of S.panels) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(p.size[0], p.size[1]), new THREE.MeshBasicMaterial({ color: new THREE.Color(p.color).multiplyScalar(p.power), side: THREE.DoubleSide }));
    m.position.set(...p.pos); m.lookAt(0, 1.4, 0); env.add(m);
  }
  return { env, sunDir: sun };
}

/* ------------------------------------------------------------------ Kulissen */
const mat = (color, roughness = 0.85, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const glow = (color, power) => new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power) });

/** Palme aus gebogenem Stamm und hängenden Wedeln. */
function palm(height, lean, leafMat, trunkMat) {
  const g = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3([0, 0.35, 0.7, 1].map((t) => new THREE.Vector3(Math.sin(t * 1.4) * lean, t * height, 0)));
  g.add(Object.assign(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.14, 8), trunkMat), { castShadow: true }));
  const top = curve.getPoint(1);
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2, len = 2.2 + (i % 3) * 0.4;
    const geo = new THREE.PlaneGeometry(len, 0.42, 10, 1);
    const pos = geo.attributes.position;
    for (let k = 0; k < pos.count; k++) {                         // Wedel biegt sich nach unten und verjüngt sich
      const x = pos.getX(k) + len / 2, u = x / len;
      pos.setXYZ(k, x, -u * u * 1.3, pos.getY(k) * (1 - u * 0.85));
    }
    geo.computeVertexNormals();
    const leaf = new THREE.Mesh(geo, leafMat);
    leaf.position.copy(top); leaf.rotation.y = a; leaf.rotation.z = 0.25; leaf.castShadow = true;
    g.add(leaf);
  }
  g.userData.curve = curve;
  return g;
}

/** Sonnenuntergang: Küstenpromenade, Wasser, dunstige Skyline, Palmen-Silhouetten. */
function buildSkyline() {
  const g = new THREE.Group();
  const water = new THREE.Mesh(new THREE.CircleGeometry(320, 64), mat(0x7a6a66, 0.18, 0.6));
  water.rotation.x = -Math.PI / 2; water.position.y = -0.05; g.add(water);
  const towers = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat(0x5d6378, 0.9), 46);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), rnd = mulberry(7);
  for (let i = 0; i < 46; i++) {
    const x = -150 + i * 6.6 + rnd() * 3, z = -170 - rnd() * 50, w = 6 + rnd() * 9, h = 18 + Math.pow(rnd(), 1.5) * 85;
    m4.compose(new THREE.Vector3(x, h / 2, z), q, new THREE.Vector3(w, h, w * (0.7 + rnd() * 0.6)));
    towers.setMatrixAt(i, m4);
  }
  g.add(towers);
  const leaf = mat(0x2a2a1c, 0.8), trunk = mat(0x3a2e26, 0.9);
  for (const [x, z, h, lean] of [[-6.5, -9, 7.5, 0.6], [7.5, -12, 8.5, -0.8], [-11, -16, 9, 0.4], [12, -20, 7, 0.3]]) {
    const p = palm(h, lean, leaf, trunk); p.position.set(x, 0, z); g.add(p);
  }
  return g;
}

/** Neon-Nacht: Club-Terrasse mit LED-umwickelten Palmen, Lichterketten, Neonröhre, Gästen. */
function buildClub() {
  const g = new THREE.Group(), rnd = mulberry(3);
  const leaf = mat(0x1f3a22, 0.7), trunk = mat(0x4a3a30, 0.85);
  const palms = [[-2.6, -4.2, 6.5, 0.35], [3.4, -6.5, 7.2, -0.5], [-5.5, -9, 7.8, 0.6]];
  const ledCols = [0xff2a85, 0x00f0ff, 0xf4e8ff, 0x7a5cff];
  const leds = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), palms.length * 140);
  let n = 0; const m4 = new THREE.Matrix4(), c = new THREE.Color();
  for (const [x, z, h, lean] of palms) {
    const p = palm(h, lean, leaf, trunk); p.position.set(x, 0, z); g.add(p);
    for (let k = 0; k < 140; k++) {                               // LED-Band spiralförmig um den Stamm
      const t = 0.03 + (k / 140) * 0.8, pt = p.userData.curve.getPoint(t), a = t * 60;
      m4.makeTranslation(x + pt.x + Math.cos(a) * 0.16, pt.y, z + Math.sin(a) * 0.16);
      leds.setMatrixAt(n, m4); leds.setColorAt(n, c.set(ledCols[Math.floor(k / 6) % ledCols.length]).multiplyScalar(5)); n++;
    }
  }
  leds.count = n; g.add(leds);

  // Lichterkette zwischen zwei Masten (Bokeh im Hintergrund)
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), 120);
  let b = 0;
  for (const [x0, x1, z, y] of [[-7, 6, -8, 3.6], [-6, 7, -12, 4.2]]) {
    for (const px of [x0, x1]) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, y, 6), mat(0x2a2030)); post.position.set(px, y / 2, z); g.add(post); }
    for (let k = 0; k <= 50; k++) {
      const t = k / 50, x = x0 + (x1 - x0) * t, sag = Math.sin(t * Math.PI) * 0.9;
      m4.makeTranslation(x, y - sag, z); bulbs.setMatrixAt(b, m4); bulbs.setColorAt(b, c.set(0xffb36b).multiplyScalar(5 + rnd() * 2)); b++;
    }
  }
  bulbs.count = b; g.add(bulbs);

  // Senkrechte Neonröhre links (wie ein Club-Schild)
  const tube = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 4.2, 4, 12), glow(0xff3fb4, 7)); tube.position.set(-4.2, 2.6, -5.2); g.add(tube);
  const tube2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 2.4, 4, 12), glow(0x00f0ff, 6)); tube2.rotation.z = Math.PI / 2; tube2.position.set(4.6, 3.1, -7.5); g.add(tube2);

  // Gäste als unscharfe Silhouetten im Hintergrund
  const guest = mat(0x2a2030, 0.75);
  for (const [x, z, h] of [[-1.6, -3.6, 1.72], [-1.0, -4.4, 1.62], [2.1, -3.9, 1.8], [2.8, -5.2, 1.68], [0.6, -6.2, 1.75]]) {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, h - 0.62, 6, 12), guest); body.position.set(x, (h - 0.25) / 2 + 0.02, z);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), guest); head.position.set(x, h - 0.12, z);
    body.castShadow = head.castShadow = true; g.add(body, head);
  }
  // Pflanzkübel
  for (const [x, z] of [[-3.6, -2.6], [4.2, -3.2]]) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.6, 16), mat(0x2b2b33, 0.6)); pot.position.set(x, 0.3, z); g.add(pot);
    for (let k = 0; k < 9; k++) { const l = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.9, 5), leaf); l.position.set(x + (rnd() - 0.5) * 0.4, 0.95, z + (rnd() - 0.5) * 0.4); l.rotation.set((rnd() - 0.5) * 0.8, 0, (rnd() - 0.5) * 0.8); g.add(l); }
  }
  return g;
}

export function buildSets() {
  return { skyline: buildSkyline(), club: buildClub() };
}

function mulberry(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
