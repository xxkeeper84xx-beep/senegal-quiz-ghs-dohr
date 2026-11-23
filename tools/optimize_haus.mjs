// Klinker-Reihenhaus (MG Teil 2) für den Fassaden-Bausatz: je Material zusammengefasst, Innenraum-Attrappe bleibt, leicht vereinfacht
import { NodeIO } from '@gltf-transform/core'; import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, join, weld, simplify, flatten, textureCompress } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer'; import sharp from 'sharp';
const [inp, out] = process.argv.slice(2); await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS); const doc = await io.read(inp); const root = doc.getRoot();
await doc.transform(prune(), dedup(), flatten(), weld(), join({ keepNamed: false }), simplify({ simplifier: MeshoptSimplifier, ratio: 0.4, error: 0.02 }), prune(),
  textureCompress({ encoder: sharp, targetFormat: 'jpeg', quality: 82, resize: [512, 512] }));
let tri = 0, prims = 0; for (const m of root.listMeshes()) for (const p of m.listPrimitives()) { prims++; tri += p.getIndices().getCount() / 3; }
await io.write(out, doc); console.log(`${Math.round(tri)} Dreiecke, ${prims} Teile`, root.listMaterials().map((m) => m.getName()).join('|'));
