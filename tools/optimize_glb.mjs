// Verkleinert die Stadtfiguren für das Spiel auf Schul-iPads.
//   node tools/optimize_glb.mjs <eingabe-ordner> <ausgabe-ordner>
// Benötigt: npm i @gltf-transform/core@4.1.1 @gltf-transform/functions@4.1.1 meshoptimizer@0.22.0 sharp@0.33.5
//
// 1. Entfernt Teile, die man aus Spielentfernung nicht sieht (Zähne, Zunge, Wimpern, Haut-Detailschicht)
// 2. Fasst Teile mit gleichem Material zusammen (weniger Zeichenaufrufe)
// 3. Vereinfacht die Geometrie auf etwa 45 % (meshoptimizer, Skelett und UVs bleiben erhalten)
// 4. Verkleinert Texturen auf höchstens 512 px; Texturen ohne Transparenz werden JPEG
import { NodeIO } from '@gltf-transform/core';
import { dedup, prune, join, weld, simplify } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const [inDir, outDir] = process.argv.slice(2);
const DROP = /teeth|tongue|eyelash|skin details/i;
const MAX = 512;
fs.mkdirSync(outDir, { recursive: true });
await MeshoptSimplifier.ready;
const io = new NodeIO();

for (const file of fs.readdirSync(inDir).filter((f) => f.endsWith('.glb')).sort()) {
  const doc = await io.read(path.join(inDir, file));
  const root = doc.getRoot();

  for (const mesh of root.listMeshes())
    for (const prim of mesh.listPrimitives()) {
      const m = prim.getMaterial();
      if (m && DROP.test(m.getName())) { mesh.removePrimitive(prim); prim.dispose(); }
    }

  await doc.transform(prune(), dedup(), weld(), join({ keepNamed: false }),
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.45, error: 0.002, lockBorder: true }), prune());

  // Welche Texturen brauchen Transparenz?
  const needsAlpha = new Set();
  for (const m of root.listMaterials()) if (m.getAlphaMode() !== 'OPAQUE' && m.getBaseColorTexture()) needsAlpha.add(m.getBaseColorTexture());

  for (const tex of root.listTextures()) {
    const img = tex.getImage(); if (!img) continue;
    const meta = await sharp(img).metadata();
    let p = sharp(img);
    if (Math.max(meta.width, meta.height) > MAX) p = p.resize(MAX, MAX, { fit: 'inside' });
    if (needsAlpha.has(tex)) { tex.setImage(await p.png({ compressionLevel: 9, palette: true }).toBuffer()).setMimeType('image/png'); }
    else { tex.setImage(await p.flatten({ background: '#808080' }).jpeg({ quality: 80, mozjpeg: true }).toBuffer()).setMimeType('image/jpeg'); }
    tex.setURI(tex.getURI().replace(/\.png$/i, needsAlpha.has(tex) ? '.png' : '.jpg'));
  }
  await doc.transform(dedup(), prune());

  const out = path.join(outDir, file);
  await io.write(out, doc);
  let tris = 0, prims = 0;
  for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) { prims++; tris += (prim.getIndices()?.getCount() ?? 0) / 3; }
  console.log(`${file}: ${(fs.statSync(path.join(inDir, file)).size / 1048576).toFixed(1)} MB → ${(fs.statSync(out).size / 1048576).toFixed(2)} MB · ${prims} Teile · ${Math.round(tris)} Dreiecke`);
}
