/**
 * Vice-Charakter: 3D-Charakter im Miami-Sunset-Look
 * Three.js r160 · PBR · HDRI · Bloom · ACES Filmic · Tiefenunschärfe · Vignette · Orbit-Kamera
 *
 * Aufbau:
 *   1. CONFIG            – alle Stellschrauben an einem Ort
 *   2. Renderer & Szene
 *   3. Umgebung (HDRI oder prozeduraler Sonnenuntergang)
 *   4. Licht
 *   5. Boden & Neon-Kulisse
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

/* ------------------------------------------------------------------ 1. CONFIG */
const isMobile = matchMedia('(pointer: coarse)').matches;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const CONFIG = {
  modelUrl: './character.glb',      // dein Charakter (glTF-Binary)
  hdrUrl: './sunset.hdr',           // optional: eigene HDRI; fehlt sie, wird ein Sonnenuntergang erzeugt
  dracoDecoderPath: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/', // nur für Draco-komprimierte Modelle
  targetHeight: 1.8,                // Modelle werden auf diese Größe (Meter) normiert
  idleClipPattern: /idle|breath|stand|wait/i,

  exposure: 1.0,
  pixelRatio: Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2),
  shadowMapSize: isMobile ? 1024 : 2048,

  sun:     { color: 0xffa65c, intensity: 4.2, elevationDeg: 10, azimuthDeg: -128 }, // tiefstehende Goldorange-Sonne, seitlich hinter der Figur
  ambient: { sky: 0x6c5cff, ground: 0x2a0f3a, intensity: 0.95 },                     // kühles Violett-Blau
  rimPink: { color: 0xff2a85, intensity: 45 },
  rimCyan: { color: 0x00f0ff, intensity: 28 },

  bloom:    { strength: 0.55, radius: 0.5, threshold: 1.4 },   // nur echte HDR-Lichter (Sonne, Neon) leuchten
  dof:      { enabled: !isMobile, aperture: 0.0016, maxBlur: 0.006 },
  vignette: { offset: 1.05, darkness: 1.15, grain: 0.035 },
  fog:      { color: 0x2a1238, density: 0.035 },

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
renderer.toneMappingExposure = CONFIG.exposure;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(CONFIG.fog.color, CONFIG.fog.density);

const camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, innerWidth / innerHeight, 0.1, 200);

const ui = {
  loader: document.getElementById('loader'),
  bar: document.querySelector('#bar i'),
  note: document.getElementById('note'),
  showNote(text) { this.note.textContent = text; this.note.hidden = false; },
  progress(p) { this.bar.style.width = `${Math.round(p * 100)}%`; },
  done() { this.loader.style.opacity = '0'; setTimeout(() => (this.loader.hidden = true), 500); },
};

/* ------------------------------------------------------------------ 3. Umgebung */
const sunDir = new THREE.Vector3().setFromSphericalCoords(
  1,
  THREE.MathUtils.degToRad(90 - CONFIG.sun.elevationDeg),
  THREE.MathUtils.degToRad(CONFIG.sun.azimuthDeg),
);

/** Prozeduraler Sonnenuntergang als HDR-Umgebung (Fallback ohne HDRI-Datei). */
function createSunsetEnvironment() {
  const envScene = new THREE.Scene();
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(50, 64, 32),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uSunDir: { value: sunDir },
        uZenith: { value: new THREE.Color(0x1b0b45) },
        uMid: { value: new THREE.Color(0xd8306f) },
        uHorizon: { value: new THREE.Color(0xff8a2a) },
        uGround: { value: new THREE.Color(0x12061f) },
      },
      vertexShader: /* glsl */`
        varying vec3 vDir;
        void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */`
        uniform vec3 uSunDir, uZenith, uMid, uHorizon, uGround;
        varying vec3 vDir;
        void main() {
          float h = vDir.y;
          vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.18, h));
          col = mix(col, uZenith, smoothstep(0.15, 0.65, h));
          col = mix(col, uGround, smoothstep(0.0, -0.12, h));
          float s = max(dot(vDir, normalize(uSunDir)), 0.0);
          col += vec3(1.0, 0.55, 0.22) * pow(s, 8.0) * 1.6;          // Halo
          col += vec3(1.0, 0.75, 0.45) * smoothstep(0.9985, 0.9995, s) * 40.0; // Sonnenscheibe (HDR)
          gl_FragColor = vec4(col, 1.0);
        }`,
    }),
  );
  envScene.add(sky);
  return envScene;
}

async function setupEnvironment() {
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envMap = null;
  try {
    const head = await fetch(CONFIG.hdrUrl, { method: 'HEAD' });
    if (head.ok) {
      const hdr = await new RGBELoader().loadAsync(CONFIG.hdrUrl);
      hdr.mapping = THREE.EquirectangularReflectionMapping;
      envMap = pmrem.fromEquirectangular(hdr).texture;
      scene.background = hdr;
    }
  } catch { /* keine HDRI vorhanden: prozedurale Umgebung */ }

  if (!envMap) {
    const envScene = createSunsetEnvironment();
    envMap = pmrem.fromScene(envScene, 0.02).texture;
    scene.background = envMap;
  }
  scene.environment = envMap;
  scene.backgroundBlurriness = 0.25;   // weicher Hintergrund wie bei offener Blende
  scene.backgroundIntensity = 0.9;
  pmrem.dispose();
}

/* ------------------------------------------------------------------ 4. Licht */
function setupLights() {
  // Warme, tiefstehende Sonne: Hauptlicht mit weichen Schatten
  const sun = new THREE.DirectionalLight(CONFIG.sun.color, CONFIG.sun.intensity);
  sun.position.copy(sunDir).multiplyScalar(12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(CONFIG.shadowMapSize, CONFIG.shadowMapSize);
  Object.assign(sun.shadow.camera, { left: -2.5, right: 2.5, top: 2.8, bottom: -0.6, near: 1, far: 30 });
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.025;
  sun.shadow.radius = 4;
  scene.add(sun, sun.target);

  // Schwaches warmes Fülllicht von vorn, damit Haut und Gesicht lesbar bleiben
  const fill = new THREE.DirectionalLight(0xffc9a0, 0.9);
  fill.position.set(2.5, 2.2, 4);
  scene.add(fill);

  // Kühles violett-blaues Umgebungslicht für den Kontrast
  scene.add(new THREE.HemisphereLight(CONFIG.ambient.sky, CONFIG.ambient.ground, CONFIG.ambient.intensity));

  // Neon-Kantenlichter von hinten (Vice-City-Rim)
  const rimPink = new THREE.SpotLight(CONFIG.rimPink.color, CONFIG.rimPink.intensity, 12, Math.PI / 6, 0.6, 2);
  rimPink.position.set(-2.2, 2.4, -2.6);
  const rimCyan = new THREE.SpotLight(CONFIG.rimCyan.color, CONFIG.rimCyan.intensity, 12, Math.PI / 6, 0.6, 2);
  rimCyan.position.set(2.4, 1.6, -2.2);
  for (const l of [rimPink, rimCyan]) { l.target.position.set(0, 1.1, 0); scene.add(l, l.target); }
}

/* ------------------------------------------------------------------ 5. Boden & Kulisse */
function setupStage() {
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(14, 64),
    new THREE.MeshStandardMaterial({ color: 0x1c1026, roughness: 0.42, metalness: 0.15 }), // leicht nasser Asphalt
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Neonröhren im Hintergrund: leuchten über Bloom und verschwimmen in der Tiefenunschärfe
  const neon = (color, w, x, y, z, rotZ = 0) => {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, w, 4, 12),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(6), toneMapped: true }));
    m.position.set(x, y, z); m.rotation.z = Math.PI / 2 + rotZ; scene.add(m);
  };
  neon(0xff2a85, 3.2, -1.6, 2.6, -5.5);
  neon(0x00f0ff, 2.4, 2.2, 1.9, -6.5);
  neon(0xff7b00, 1.6, 0.6, 3.3, -7.5, 0.12);
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
const VignetteShader = {
  uniforms: { tDiffuse: { value: null }, uOffset: { value: 1 }, uDarkness: { value: 1 }, uGrain: { value: 0 }, uTime: { value: 0 } },
  vertexShader: /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse; uniform float uOffset, uDarkness, uGrain, uTime; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - 0.5) * uOffset;
      c.rgb *= mix(1.0, 1.0 - uDarkness, dot(uv, uv));                 // Vignette
      c.rgb += (hash(vUv * 1000.0 + uTime) - 0.5) * uGrain;            // feines Filmkorn
      gl_FragColor = c;
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
    bokeh = new BokehPass(scene, camera, { focus: CONFIG.camera.distance, aperture: CONFIG.dof.aperture, maxblur: CONFIG.dof.maxBlur });
    composer.addPass(bokeh);
  }

  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), CONFIG.bloom.strength, CONFIG.bloom.radius, CONFIG.bloom.threshold);
  composer.addPass(bloom);

  composer.addPass(new OutputPass());          // ACES Filmic + sRGB

  const vignette = new ShaderPass(VignetteShader);
  vignette.uniforms.uOffset.value = CONFIG.vignette.offset;
  vignette.uniforms.uDarkness.value = CONFIG.vignette.darkness;
  vignette.uniforms.uGrain.value = CONFIG.vignette.grain;
  composer.addPass(vignette);

  return { composer, bokeh, bloom, vignette };
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
  await setupEnvironment();
  ui.progress(0.3);
  const height = await loadCharacter(manager);
  ui.progress(1);

  const controls = setupCamera(height);
  const post = setupPostprocessing();

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
    post.vignette.uniforms.uTime.value = t;
    post.composer.render(dt);
  });

  ui.done();
}

init().catch((err) => {
  console.error(err);
  ui.showNote('Die 3D-Szene konnte nicht gestartet werden. Prüfe die Konsole.');
});
