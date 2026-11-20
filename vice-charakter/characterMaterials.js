/**
 * characterMaterials.js – macht ein geladenes Charaktermodell fotorealistischer (Three.js r160)
 *
 *   import { enhanceCharacter, addRimLight } from './characterMaterials.js';
 *   const gltf = await loader.loadAsync('./character.glb');
 *   enhanceCharacter(gltf.scene, { renderer });
 *   addRimLight(scene, gltf.scene);
 *
 * Erkennt Haut, Augen, Haare, Stoff, Denim, Leder und Metall am Material- oder Mesh-Namen
 * (z. B. "Body_Skin", "Eye_L", "Hair_Cards", "Jeans"). Für eigene Namen die Muster in MATCH anpassen.
 * Voraussetzung für glaubwürdige Reflexionen: scene.environment ist gesetzt (HDRI oder PMREM).
 */
import * as THREE from 'three';

/* ------------------------------------------------------------------ Einstellungen */
export const LOOK = {
  skin: {
    roughness: 0.55,            // Basiswert ohne Roughness-Map (0.45–0.65)
    ior: 1.4,                   // Brechungsindex von Haut → F0 ≈ 0.028, kein Plastikglanz
    specularIntensity: 0.55,
    sheen: 0.25, sheenColor: 0xff9277, sheenRoughness: 0.5,   // weiche, rötliche Kanten
    sss: { color: 0xff5a3c, wrap: 0.45, strength: 0.75, back: 0.35 }, // Streuung unter der Haut
    normalScale: 0.9,           // vorhandene Normal-Map (Poren, Falten) leicht entschärfen
    poreBumpScale: 0.35,        // nur ohne Normal-Map: prozedurale Poren
    poreRepeat: 14,             // Kachelung der Poren-Textur je UV-Einheit
  },
  eyes:  { roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.03, ior: 1.376, envMapIntensity: 1.4 },
  hair:  { roughness: 0.42, anisotropy: 0.65, anisotropyRotation: Math.PI / 2, alphaTest: 0.35 },
  cotton:  { roughness: 0.82, sheen: 0.8, sheenRoughness: 0.75 },
  denim:   { roughness: 0.88, sheen: 0.55, sheenRoughness: 0.65, sheenColor: 0xa9b8d6 },
  leather: { roughness: 0.42, sheen: 0.15, sheenRoughness: 0.4, clearcoat: 0.25, clearcoatRoughness: 0.4 },
  metal:   { roughness: 0.25, metalness: 1 },
};

const MATCH = {
  eyes:    /eye(?!brow|lash|lid)|cornea|iris|sclera|pupil/i,
  hair:    /hair|brow|lash|beard|mustache|fur/i,
  skin:    /skin|body|face|head|neck|arm|hand|leg|foot|feet|torso|ear|nose/i,
  denim:   /jean|denim/i,
  leather: /leather|boot|belt/i,
  metal:   /metal|buckle|zip|chain|watch|ring|earring|piercing|glass(es)?_frame/i,
  cotton:  /cloth|shirt|tshirt|t_shirt|hoodie|sweat|jacket|pants|trouser|short|sock|dress|fabric|cap|hat|shoe|sneaker/i,
};

/* ------------------------------------------------------------------ Hauptfunktion */
/**
 * Durchläuft alle Meshes des Charakters und ersetzt ihre Materialien durch veredelte PBR-Varianten.
 * @param {THREE.Object3D} root   gltf.scene oder fbx-Gruppe
 * @param {{renderer?: THREE.WebGLRenderer}} [opts]  renderer → bestmögliche Texturfilterung
 */
export function enhanceCharacter(root, { renderer } = {}) {
  const maxAniso = renderer ? renderer.capabilities.getMaxAnisotropy() : 8;
  const cache = new Map();                    // gleiche Materialien nur einmal umbauen

  root.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.castShadow = true;                    // Selbstverschattung: Nase, Kinn, Kleidung
    obj.receiveShadow = true;
    if (obj.isSkinnedMesh) obj.frustumCulled = false;

    const convert = (mat) => {
      if (!mat) return mat;
      if (cache.has(mat)) return cache.get(mat);
      const kind = classify(`${mat.name} ${obj.name}`);
      const out = kind ? BUILDERS[kind](mat) : tidyGeneric(mat);
      sharpenTextures(out, maxAniso);
      if (out !== mat) mat.dispose();
      cache.set(mat, out);
      return out;
    };
    obj.material = Array.isArray(obj.material) ? obj.material.map(convert) : convert(obj.material);
  });
  return root;
}

function classify(name) {
  // Reihenfolge wichtig: Augen und Haare vor Haut („Head_Hair“ ist Haar, nicht Haut)
  for (const kind of ['eyes', 'hair', 'denim', 'leather', 'metal', 'cotton', 'skin']) if (MATCH[kind].test(name)) return kind;
  return null;
}

/** Übernimmt alle Texturen und Grundwerte eines glTF-Standardmaterials in ein MeshPhysicalMaterial. */
function toPhysical(src, extra = {}) {
  const m = new THREE.MeshPhysicalMaterial();
  for (const key of ['name', 'map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'aoMapIntensity', 'emissiveMap',
    'alphaMap', 'transparent', 'opacity', 'alphaTest', 'side', 'vertexColors', 'flatShading']) {
    if (src[key] !== undefined) m[key] = src[key];
  }
  if (src.color) m.color.copy(src.color);
  if (src.emissive) m.emissive.copy(src.emissive);
  if (src.normalScale) m.normalScale.copy(src.normalScale);
  if (src.normalMapType !== undefined) m.normalMapType = src.normalMapType;
  m.roughness = src.roughness ?? 1;
  m.metalness = src.metalness ?? 0;
  m.envMapIntensity = 1;
  return Object.assign(m, extra);
}

/* ------------------------------------------------------------------ Materialtypen */
const BUILDERS = {
  skin(src) {
    const L = LOOK.skin;
    const m = toPhysical(src, {
      metalness: 0,
      roughness: src.roughnessMap ? 1 : L.roughness,     // mit Map bestimmt die Map die Rauheit
      ior: L.ior,
      specularIntensity: L.specularIntensity,
      sheen: L.sheen, sheenRoughness: L.sheenRoughness,
      transparent: false,
    });
    m.sheenColor.set(L.sheenColor);
    m.metalnessMap = null;                                // Haut ist nie metallisch
    if (m.normalMap) m.normalScale.multiplyScalar(L.normalScale);
    else { m.bumpMap = poreTexture(); m.bumpScale = L.poreBumpScale; }
    addSubsurfaceScattering(m, L.sss);
    return m;
  },

  eyes(src) {
    const L = LOOK.eyes;
    const clear = src.transparent || src.opacity < 1;     // Hornhaut-Hülle über der Iris
    const m = toPhysical(src, {
      metalness: 0, roughness: L.roughness, clearcoat: L.clearcoat, clearcoatRoughness: L.clearcoatRoughness,
      ior: L.ior, specularIntensity: 1, envMapIntensity: L.envMapIntensity,
    });
    if (clear) { m.transparent = true; m.depthWrite = false; m.opacity = Math.min(src.opacity, 0.25); m.roughness = 0.02; }
    return m;
  },

  hair(src) {
    const L = LOOK.hair;
    const hasAlpha = !!src.alphaMap || (!!src.map && (src.transparent || src.alphaTest > 0 || src.opacity < 1)); // glTF MASK oder BLEND
    const m = toPhysical(src, {
      metalness: 0,
      roughness: src.roughnessMap ? 1 : L.roughness,
      side: THREE.DoubleSide,                              // Haarkarten sind einseitige Flächen
      anisotropy: L.anisotropy,                            // gestreckte Glanzlichter entlang der Strähnen
      anisotropyRotation: L.anisotropyRotation,
      sheen: 0.3, sheenRoughness: 0.4,
    });
    if (hasAlpha) {
      m.alphaTest = L.alphaTest;                           // harte Kanten für Schatten und Sortierung
      m.alphaToCoverage = true;                            // weiche Strähnen-Kanten bei MSAA
      m.transparent = false;                               // kein Sortier-Flimmern
      m.depthWrite = true;
    }
    // Haar-Glanz ist leicht in der Haarfarbe getönt (zweites Glanzlicht nach Marschner)
    m.specularColor.copy(m.color).lerp(new THREE.Color(1, 1, 1), 0.55);
    m.sheenColor.copy(m.color).multiplyScalar(1.4);
    return m;
  },

  cotton: (src) => fabric(src, LOOK.cotton),
  denim: (src) => fabric(src, LOOK.denim),

  leather(src) {
    const L = LOOK.leather;
    const m = toPhysical(src, { metalness: 0, roughness: src.roughnessMap ? 1 : L.roughness, sheen: L.sheen, sheenRoughness: L.sheenRoughness,
      clearcoat: L.clearcoat, clearcoatRoughness: L.clearcoatRoughness });
    m.sheenColor.set(0xffffff);
    return m;
  },

  metal(src) {
    return toPhysical(src, { metalness: LOOK.metal.metalness, roughness: Math.min(src.roughness ?? 1, LOOK.metal.roughness) });
  },
};

function fabric(src, L) {
  const m = toPhysical(src, { metalness: 0, roughness: src.roughnessMap ? 1 : Math.max(src.roughness ?? 1, L.roughness),
    sheen: L.sheen, sheenRoughness: L.sheenRoughness, specularIntensity: 0.4 });
  // Mikrofaser-Glanz an den Kanten: helle Version der Stofffarbe (oder feste Tönung)
  if (L.sheenColor) m.sheenColor.set(L.sheenColor);
  else m.sheenColor.copy(m.color).lerp(new THREE.Color(1, 1, 1), 0.5);
  return m;
}

/** Unbekannte Materialien: nur Plastikglanz entschärfen, sonst unverändert lassen. */
function tidyGeneric(mat) {
  if (mat.isMeshStandardMaterial) {
    mat.envMapIntensity = 1;
    if (!mat.metalnessMap && mat.metalness < 0.5) { mat.metalness = 0; if (!mat.roughnessMap) mat.roughness = Math.max(mat.roughness, 0.5); }
  }
  return mat;
}

function sharpenTextures(mat, maxAniso) {
  for (const key of ['map', 'normalMap', 'roughnessMap', 'bumpMap', 'aoMap']) {
    const t = mat[key];
    if (t && t.anisotropy !== undefined) { t.anisotropy = Math.min(8, maxAniso); t.needsUpdate = true; }
  }
}

/* ------------------------------------------------------------------ Subsurface Scattering (Näherung) */
/**
 * Three.js hat kein echtes SSS. Diese Erweiterung des Physical-Shaders simuliert die zwei
 * sichtbarsten Effekte: (1) Licht „wandert“ über die Schattengrenze hinaus und färbt sie rötlich
 * (Wrap-Lighting), (2) Gegenlicht schimmert durch dünne Stellen wie Ohren und Nasenflügel.
 */
function addSubsurfaceScattering(material, sss) {
  const target = 'reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );';
  const chunk = THREE.ShaderChunk.lights_physical_pars_fragment;
  if (!chunk.includes(target)) {
    console.warn('characterMaterials: SSS-Shader passt nicht zu dieser three.js-Version – nur Sheen aktiv.');
    return;
  }
  const patched = chunk.replace(target, /* glsl */`
    float sssWrap = saturate( ( dot( geometryNormal, directLight.direction ) + uSssWrap ) / ( 1.0 + uSssWrap ) );
    vec3 sssTerminator = uSssColor * max( sssWrap - dotNL, 0.0 ) * uSssStrength;
    float sssBack = pow( saturate( dot( geometryViewDir, - directLight.direction ) ), 4.0 ) * uSssBack;
    reflectedLight.directDiffuse += ( irradiance + directLight.color * ( sssTerminator + uSssColor * sssBack ) )
      * BRDF_Lambert( material.diffuseColor );`);

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uSssColor = { value: new THREE.Color(sss.color) };
    shader.uniforms.uSssWrap = { value: sss.wrap };
    shader.uniforms.uSssStrength = { value: sss.strength };
    shader.uniforms.uSssBack = { value: sss.back };
    shader.fragmentShader = 'uniform vec3 uSssColor;\nuniform float uSssWrap, uSssStrength, uSssBack;\n'
      + shader.fragmentShader.replace('#include <lights_physical_pars_fragment>', patched);
  };
  material.customProgramCacheKey = () => 'character-skin-sss-v1';
}

/* ------------------------------------------------------------------ Poren-Textur (nur ohne Normal-Map) */
let _pores = null;
function poreTexture() {
  if (_pores) return _pores;
  const size = 512, c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  g.fillStyle = '#808080';
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < 9000; i++) {                    // feine Poren: kleine dunkle Punkte
    const x = Math.random() * size, y = Math.random() * size, r = 0.6 + Math.random() * 1.4;
    g.fillStyle = `rgba(0,0,0,${0.08 + Math.random() * 0.18})`;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  for (let i = 0; i < 1400; i++) {                    // leichte Unebenheit
    g.fillStyle = `rgba(255,255,255,${Math.random() * 0.06})`;
    g.fillRect(Math.random() * size, Math.random() * size, 2 + Math.random() * 3, 2 + Math.random() * 3);
  }
  _pores = new THREE.CanvasTexture(c);
  _pores.wrapS = _pores.wrapT = THREE.RepeatWrapping;
  _pores.repeat.set(LOOK.skin.poreRepeat, LOOK.skin.poreRepeat);
  _pores.colorSpace = THREE.NoColorSpace;            // Höhenwerte, keine Farbe
  return _pores;
}

/* ------------------------------------------------------------------ Rim-Light */
/**
 * Subtiles Kantenlicht hinter der Figur: hebt Silhouette, Haarspitzen und Schultern vom Hintergrund ab.
 * @returns {THREE.SpotLight}
 */
export function addRimLight(scene, character, { color = 0xcfe0ff, intensity = 22, side = -1 } = {}) {
  const box = new THREE.Box3().setFromObject(character);
  const h = box.max.y - box.min.y, c = box.getCenter(new THREE.Vector3());
  const rim = new THREE.SpotLight(color, intensity, h * 4, Math.PI / 7, 0.65, 2);
  rim.position.set(c.x + side * h * 0.45, box.min.y + h * 1.05, c.z - h * 0.9);   // hinten, leicht seitlich, über Kopfhöhe
  rim.target.position.set(c.x, box.min.y + h * 0.78, c.z);                        // zielt auf Schultern/Kopf
  rim.castShadow = false;                                                          // nur Kante, keine zweiten Schatten
  scene.add(rim, rim.target);
  return rim;
}
