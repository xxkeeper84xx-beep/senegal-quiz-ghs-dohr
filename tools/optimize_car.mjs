// Bereitet die Rheydt-Autos (MG Teil 2) für das Spiel auf.
//   MODE=verkehr node optimize_car.mjs <ein> <aus>  → leicht: ohne Innenraum/Kleinteile, alles je Material zusammengefasst, starr
//   MODE=spieler node optimize_car.mjs <ein> <aus>  → fein: Radknoten bleiben einzeln (Rollen/Lenken), leicht vereinfacht
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, join, weld, simplify, flatten } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import fs from 'node:fs'; import path from 'node:path';
const [inDir, outDir] = process.argv.slice(2), MODE = process.env.MODE || 'verkehr';
const DROP = MODE === 'verkehr' ? /Sitzleder|Fugen|Dichtungen|Bremsscheibe|Tagfahrlicht/ : /Fugen|Dichtungen/;
fs.mkdirSync(outDir, { recursive: true }); await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
for (const f of fs.readdirSync(inDir).filter((f) => f.endsWith('.glb')).sort()) {
  const doc = await io.read(path.join(inDir, f)); const root = doc.getRoot();
  for (const mesh of root.listMeshes()) for (const p of mesh.listPrimitives()) { const m = p.getMaterial(); if (m && DROP.test(m.getName())) { mesh.removePrimitive(p); p.dispose(); } }
  // Innenraum-Knoten (Sitze, Lenkrad, Boden) im Verkehr weglassen
  if (MODE === 'verkehr') for (const n of root.listNodes()) if (/Sitz|Lenk|Innenraum|Armatur/i.test(n.getName())) { n.setMesh(null); }
  for (const e of root.listExtensionsUsed()) if (/clearcoat|emissive_strength/.test(e.extensionName)) e.dispose();
  if (MODE === 'verkehr') await doc.transform(prune(), dedup(), flatten(), weld(), join({ keepNamed: false }), simplify({ simplifier: MeshoptSimplifier, ratio: 0.3, error: 0.003 }), prune());
  else await doc.transform(prune(), dedup(), weld(), join({ keepNamed: true }), simplify({ simplifier: MeshoptSimplifier, ratio: 0.6, error: 0.0015 }), prune());
  let tri = 0, prims = 0; for (const m of root.listMeshes()) for (const p of m.listPrimitives()) { prims++; tri += p.getIndices() ? p.getIndices().getCount() / 3 : 0; }
  const out = path.join(outDir, f); await io.write(out, doc);
  console.log(`${f}: ${Math.round(tri)} Dreiecke, ${prims} Teile, ${(fs.statSync(out).size / 1048576).toFixed(2)} MB`);
}
