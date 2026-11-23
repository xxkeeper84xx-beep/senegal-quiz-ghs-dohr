// Stadtkarte (Höhengelände + Luftbild) für die Fernansicht: Gitter vereinfachen, Luftbild auf 2048 px JPEG
import { NodeIO } from '@gltf-transform/core'; import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, weld, simplify, textureCompress } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer'; import sharp from 'sharp';
const [inp, out, px, ratio] = process.argv.slice(2); await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS); const doc = await io.read(inp); const root = doc.getRoot();
await doc.transform(weld(), simplify({ simplifier: MeshoptSimplifier, ratio: +(ratio || .25), error: 0.0004 }), prune(),
  textureCompress({ encoder: sharp, targetFormat: 'jpeg', quality: 78, resize: [+(px || 2048), +(px || 2048)] }));
let tri = 0; for (const m of root.listMeshes()) for (const p of m.listPrimitives()) tri += p.getIndices().getCount() / 3;
await io.write(out, doc); console.log(Math.round(tri), 'Dreiecke');
