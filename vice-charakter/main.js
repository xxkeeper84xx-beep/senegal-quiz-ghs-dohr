/**
 * Vice-Charakter: 3D-Charakter in zwei Stimmungen – Sonnenuntergang an der Küste und Neon-Nacht im Club
 * Three.js r160 · PBR · HDRI · Bloom · ACES Filmic · Tiefenunschärfe · Vignette · Orbit-Kamera
 *
 * Aufbau:
 *   1. CONFIG            – alle Stellschrauben an einem Ort
 *   2. Renderer & Szene
 *   3. Umgebung je Stimmung (HDRI oder prozeduraler Himmel, siehe moods.js)
 *   4. Licht
 *   5. Boden & Kulissen, Stimmung anwenden
 *   6. Charakter laden, Materialien verbessern, Idle-Animation
 *   7. Post-Processing
 *   8. Kamera & Orbit-Steuerung
 *   9. Größe anpassen & Render-Schleife
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { enhanceCharacter, addRimLight } from './characterMaterials.js';
import { MOODS, createSkyScene, buildSets } from './moods.js';

/* ------------------------------------------------------------------ 1. CONFIG */
const isMobile = matchMedia('(pointer: coarse)').matches;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const CONFIG = {
  modelUrl: './character.glb',      // dein Charakter (glTF-Binary)
  hdrUrl: './sunset.hdr',           // optional: eigene HDRI für die Stimmung „Sonnenuntergang“
  dracoDecoderPath: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/', // nur für Draco-komprimierte Modelle
  targetHeight: 1.8,                // Modelle werden auf diese Größe (Meter) normiert
  idleClipPattern: /idle|breath|stand|wait/i,
  startMood: new URLSearchParams(location.search).get('mood') === 'neon' ? 'neon' : 'sunset',

  pixelRatio: Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2),
  shadowMapSize: isMobile ? 1024 : 2048,
  dof:      { enabled: !isMobile, maxBlur: 0.007 },
  vignette: { offset: 1.05, darkness: 1.1, grain: 0.035 },
  camera:   { fov: 32, distance: 2.9, minDistance: 1.3, maxDistance: 6 },
  autoRotateSpeed: reducedMotion ? 0 : 0.35,
};

/* ------------------------------------------------------------------ 2. Renderer & Szene */
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(CONFIG.pixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;   // wird im OutputPass angewendet
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.02);
scene.backgroundBlurriness = 0.25;    // weicher Hintergrund wie bei offener Blende

const camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, innerWidth / innerHeight, 0.1, 600);

const ui = {
  loader: document.getElementById('loader'),
  bar: document.querySelector('#bar i'),
  note: document.getElementById('note'),
  moodButtons: [...document.querySelectorAll('[data-mood]')],
  showNote(text) { this.note.textContent = text; this.note.hidden = false; },
  progress(p) { this.bar.style.width = `${Math.round(p * 100)}%`; },
  done() { this.loader.style.opacity = '0'; setTimeout(() => (this.loader.hidden = true), 500); },
};

/* ------------------------------------------------------------------ 3. Umgebung je Stimmung */
const envCache = {};
async function environmentFor(id) {
  if (envCache[id]) return envCache[id];
  const pmrem = new THREE.PMREMGenerator(renderer);
  const { env, sunDir } = createSkyScene(MOODS[id]);
  let entry = null;
  if (id === 'sunset') {
    try {
      const head = await fetch(CONFIG.hdrUrl, { method: 'HEAD' });
      if (head.ok) {
        const hdr = await new RGBELoader().loadAsync(CONFIG.hdrUrl);
        hdr.mapping = THREE.EquirectangularReflectionMapping;
        entry = { env: pmrem.fromEquirectangular(hdr).texture, background: hdr, sunDir };
      }
    } catch { /* keine HDRI vorhanden: prozeduraler Himmel */ }
  }
  if (!entry) { const tex = pmrem.fromScene(env, 0.02).texture; entry = { env: tex, background: tex, sunDir }; }
  pmrem.dispose();
  return (envCache[id] = entry);
}

/* ------------------------------------------------------------------ 4. Licht (Werte kommen aus der Stimmung) */
const L = {};
function setupLights() {
  L.key = new THREE.DirectionalLight(0xffffff, 1);            // Hauptlicht mit weichen Schatten
  L.key.castShadow = true;
  L.key.shadow.mapSize.set(CONFIG.shadowMapSize, CONFIG.shadowMapSize);
  Object.assign(L.key.shadow.camera, { left: -2.5, right: 2.5, top: 2.8, bottom: -0.6, near: 1, far: 30 });
  L.key.shadow.bias = -0.0003;
  L.key.shadow.normalBias = 0.025;
  L.key.shadow.radius = 4;
  L.fill = new THREE.DirectionalLight(0xffffff, 1);           // Fülllicht fürs Gesicht
  L.hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 1);  // Umgebungslicht für den Kontrast
  L.rimA = new THREE.SpotLight(0xffffff, 1, 12, Math.PI / 6, 0.6, 2);   // Kantenlichter von hinten
  L.rimB = new THREE.SpotLight(0xffffff, 1, 12, Math.PI / 6, 0.6, 2);
  for (const l of [L.rimA, L.rimB]) l.target.position.set(0, 1.1, 0);
  scene.add(L.key, L.key.target, L.fill, L.hemi, L.rimA, L.rimA.target, L.rimB, L.rimB.target);
}

/* ------------------------------------------------------------------ 5. Boden & Kulissen */
let ground, sets;
function setupStage() {
  ground = new THREE.Mesh(new THREE.CircleGeometry(14, 64), new THREE.MeshStandardMaterial());
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  sets = buildSets();
  for (const g of Object.values(sets)) { g.visible = false; scene.add(g); }
}

/* ------------------------------------------------------------------ Stimmung anwenden */
let post = null, currentMood = null;
async function applyMood(id) {
  const M = MOODS[id], E = await environmentFor(id);
  currentMood = id;
  scene.environment = E.env;
  scene.background = E.background;
  scene.backgroundIntensity = id === 'neon' ? 0.7 : 0.8;
  scene.fog.color.set(M.fog.color);
  scene.fog.density = M.fog.density;
  renderer.toneMappingExposure = M.exposure;

  L.key.color.set(M.key.color); L.key.intensity = M.key.intensity;
  if (M.key.fromSun) L.key.position.copy(E.sunDir).multiplyScalar(12); else L.key.position.set(...M.key.position);
  L.fill.color.set(M.fill.color); L.fill.intensity = M.fill.intensity; L.fill.position.set(...M.fill.position);
  L.hemi.color.set(M.hemi.sky); L.hemi.groundColor.set(M.hemi.ground); L.hemi.intensity = M.hemi.intensity;
  for (const k of ['rimA', 'rimB']) { L[k].color.set(M[k].color); L[k].intensity = M[k].intensity; L[k].position.set(...M[k].position); }

  ground.material.color.set(M.ground.color); ground.material.roughness = M.ground.roughness; ground.material.metalness = M.ground.metalness;
  for (const [name, g] of Object.entries(sets)) g.visible = name === M.set;

  if (post) {
    Object.assign(post.bloom, { strength: M.bloom.strength, radius: M.bloom.radius, threshold: M.bloom.threshold });
    if (post.bokeh) post.bokeh.uniforms.aperture.value = M.dofAperture;
    const u = post.grade.uniforms;
    u.uLift.value.set(...M.grade.lift); u.uGamma.value.set(...M.grade.gamma); u.uGain.value.set(...M.grade.gain); u.uSaturation.value = M.grade.saturation;
  }
  for (const b of ui.moodButtons) b.setAttribute('aria-pressed', String(b.dataset.mood === id));
  document.body.dataset.scene = id;
}

/* ------------------------------------------------------------------ 6. Charakter */
function prepareCharacter(root) {
  enhanceCharacter(root, { renderer });              // Haut, Augen, Haare, Stoff veredeln + Schatten an jedem Teil-Mesh

  // Auf Zielgröße normieren (FBX-Exporte sind oft in Zentimetern) und auf den Boden stellen
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  if (size.y > 0) root.scale.multiplyScalar(CONFIG.targetHeight / size.y);
  box.setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= box.min.y;
  return CONFIG.targetHeight;
}

/** Platzhalter-Figur, bis ein echtes Modell vorhanden ist (nutzt dieselben PBR-Materialien). */
function createPlaceholder() {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ name: 'skin', color: 0xc98a64, roughness: 0.5 });
  const shirt = new THREE.MeshStandardMaterial({ name: 'shirt', color: 0xf2ece4, roughness: 0.8 });
  const pants = new THREE.MeshStandardMaterial({ name: 'jeans', color: 0x2c3e66, roughness: 0.85 });
  const hair = new THREE.MeshStandardMaterial({ name: 'hair', color: 0x1b120c, roughness: 0.45 });
  const add = (geo, mat, x, y, z, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };

  const chest = new THREE.Group(); chest.position.y = 1.08; g.add(chest);
  add(new THREE.CapsuleGeometry(0.19, 0.42, 8, 24), shirt, 0, 0.22, 0, chest).scale.set(1, 1, 0.7);
  add(new THREE.CylinderGeometry(0.05, 0.055, 0.1, 16), skin, 0, 0.6, 0, chest);
  const head = add(new THREE.SphereGeometry(0.115, 48, 32), skin, 0, 0.76, 0.01, chest); head.scale.set(0.92, 1.12, 1);
  add(new THREE.SphereGeometry(0.12, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, 0, 0.79, -0.005, chest);
  for (const s of [-1, 1]) {
    const arm = add(new THREE.CapsuleGeometry(0.048, 0.5, 8, 16), shirt, s * 0.25, 0.18, 0, chest); arm.rotation.z = s * 0.08;
    add(new THREE.SphereGeometry(0.045, 16, 12), skin, s * 0.275, -0.13, 0.01, chest);
    add(new THREE.CapsuleGeometry(0.075, 0.78, 8, 16), pants, s * 0.1, 0.5, 0);
    add(new THREE.BoxGeometry(0.11, 0.07, 0.26), new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.6 }), s * 0.1, 0.035, 0.04);
  }
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.016, 16, 12), new THREE.MeshStandardMaterial({ name: 'eye', color: 0x2a1a10 }), 0.035 * s, 0.775, 0.114, chest);
  g.userData.chest = chest;   // für die Atem-Animation
  enhanceCharacter(g, { renderer });
  return g;
}

const clock = new THREE.Clock();
let mixer = null;
let placeholder = null;

async function loadCharacter(manager) {
  const loader = new GLTFLoader(manager);
  const draco = new DRACOLoader().setDecoderPath(CONFIG.dracoDecoderPath);
  loader.setDRACOLoader(draco);

  try {
    const head = await fetch(CONFIG.modelUrl, { method: 'HEAD' });
    if (!head.ok) throw new Error(`HTTP ${head.status}`);
    const gltf = await loader.loadAsync(CONFIG.modelUrl);
    const root = gltf.scene;
    const height = prepareCharacter(root);
    scene.add(root);
    addRimLight(scene, root);

    if (gltf.animations.length) {
      mixer = new THREE.AnimationMixer(root);
      const clip = gltf.animations.find((c) => CONFIG.idleClipPattern.test(c.name)) || gltf.animations[0];
      mixer.clipAction(clip).play();
    }
    return height;
  } catch (err) {
    console.info(`Kein Modell unter ${CONFIG.modelUrl} gefunden (${err.message}) – Platzhalter wird gezeigt.`);
    ui.showNote(`Platzhalter-Figur · Lege dein Modell als ${CONFIG.modelUrl.replace('./', '')} neben index.html`);
    placeholder = createPlaceholder();
    scene.add(placeholder);
    addRimLight(scene, placeholder);
    return 1.8;
  } finally {
    draco.dispose();
  }
}

/* ------------------------------------------------------------------ 7. Post-Processing */
/** Farbkorrektur (Lift/Gamma/Gain, Sättigung), Vignette und Filmkorn – nach dem Tone Mapping. */
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null }, uTime: { value: 0 },
    uLift: { value: new THREE.Vector3() }, uGamma: { value: new THREE.Vector3(1, 1, 1) }, uGain: { value: new THREE.Vector3(1, 1, 1) }, uSaturation: { value: 1 },
    uOffset: { value: 1 }, uDarkness: { value: 1 }, uGrain: { value: 0 },
  },
  vertexShader: /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse; uniform vec3 uLift, uGamma, uGain; uniform float uSaturation, uOffset, uDarkness, uGrain, uTime; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      c = c * uGain + uLift * (1.0 - c);                                   // Lichter tönen, Schatten anheben (Dunst)
      c = pow(max(c, 0.0), 1.0 / uGamma);
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c = mix(vec3(l), c, uSaturation);
      vec2 uv = (vUv - 0.5) * uOffset;
      c *= mix(1.0, 1.0 - uDarkness, dot(uv, uv));                         // Vignette
      c += (hash(vUv * 1000.0 + uTime) - 0.5) * uGrain;                    // Filmkorn
      gl_FragColor = vec4(c, 1.0);
    }`,
};

function setupPostprocessing() {
  const target = new THREE.WebGLRenderTarget(innerWidth, innerHeight, { type: THREE.HalfFloatType, samples: isMobile ? 0 : 4 });
  const composer = new EffectComposer(renderer, target);
  composer.setPixelRatio(CONFIG.pixelRatio);
  composer.setSize(innerWidth, innerHeight);

  composer.addPass(new RenderPass(scene, camera));

  let bokeh = null;
  if (CONFIG.dof.enabled) {
    bokeh = new BokehPass(scene, camera, { focus: CONFIG.camera.distance, aperture: 0.002, maxblur: CONFIG.dof.maxBlur });
    composer.addPass(bokeh);
  }

  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.6, 0.6, 1.2);   // Werte setzt die Stimmung
  composer.addPass(bloom);

  composer.addPass(new OutputPass());          // ACES Filmic + sRGB

  const grade = new ShaderPass(GradeShader);
  grade.uniforms.uOffset.value = CONFIG.vignette.offset;
  grade.uniforms.uDarkness.value = CONFIG.vignette.darkness;
  grade.uniforms.uGrain.value = CONFIG.vignette.grain;
  composer.addPass(grade);

  return { composer, bokeh, bloom, grade };
}

/* ------------------------------------------------------------------ 8. Kamera & Steuerung */
function setupCamera(height) {
  const target = new THREE.Vector3(0, height * 0.8, 0);            // Brust-/Gesichtshöhe: Porträtwinkel
  const eye = new THREE.Vector3(0.9, height * 0.9, CONFIG.camera.distance);   // Augenhöhe, leicht seitlich
  camera.position.copy(eye);
  camera.lookAt(target);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.minDistance = CONFIG.camera.minDistance;
  controls.maxDistance = CONFIG.camera.maxDistance;
  controls.minPolarAngle = THREE.MathUtils.degToRad(55);         // nicht von oben
  controls.maxPolarAngle = THREE.MathUtils.degToRad(98);         // nicht unter den Boden
  controls.autoRotate = CONFIG.autoRotateSpeed > 0;
  controls.autoRotateSpeed = CONFIG.autoRotateSpeed;
  controls.addEventListener('start', () => { controls.autoRotate = false; });
  controls.update();
  return controls;
}

/* ------------------------------------------------------------------ 9. Start, Größe, Schleife */
async function init() {
  const manager = new THREE.LoadingManager();
  manager.onProgress = (_url, loaded, total) => ui.progress(total ? loaded / total : 1);

  setupLights();
  setupStage();
  await environmentFor('sunset'); await environmentFor('neon');   // beide Himmel vorab berechnen
  ui.progress(0.3);
  const height = await loadCharacter(manager);
  ui.progress(1);

  const controls = setupCamera(height);
  post = setupPostprocessing();
  await applyMood(CONFIG.startMood);

  // Stimmung umschalten: Knöpfe oder Taste L
  for (const b of ui.moodButtons) b.addEventListener('click', () => applyMood(b.dataset.mood));
  addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 'l') applyMood(currentMood === 'sunset' ? 'neon' : 'sunset'); });

  const onResize = () => {
    const w = innerWidth, h = innerHeight;
    camera.aspect = w / h;
    camera.fov = w < h ? CONFIG.camera.fov + 10 : CONFIG.camera.fov;   // Hochformat: etwas weiter
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    post.composer.setSize(w, h);
    post.bloom.resolution.set(w, h);
  };
  addEventListener('resize', onResize);
  onResize();

  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    if (mixer) mixer.update(dt);
    if (placeholder) {                                     // sanftes Atmen als Idle-Ersatz
      const c = placeholder.userData.chest;
      c.scale.setScalar(1 + Math.sin(t * 1.6) * 0.008);
      c.rotation.y = Math.sin(t * 0.5) * 0.04;
    }
    controls.update();
    if (post.bokeh) post.bokeh.uniforms.focus.value = camera.position.distanceTo(controls.target);
    post.grade.uniforms.uTime.value = t;
    post.composer.render(dt);
  });

  ui.done();
}

init().catch((err) => {
  console.error(err);
  ui.showNote('Die 3D-Szene konnte nicht gestartet werden. Prüfe die Konsole.');
});
