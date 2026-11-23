// Wahrzeichen (MG Teil 2): Grundriss (konvexe Hülle) in Spielkoordinaten + glTF-JSON je Modell
import { NodeIO } from '@gltf-transform/core'; import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import fs from 'node:fs'; import path from 'node:path';
const [dir, koordFile, outDir] = process.argv.slice(2); const K = JSON.parse(fs.readFileSync(koordFile)).gebaeude;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS); fs.mkdirSync(outDir, { recursive: true }); const list = [];
const hull = (P) => { P.sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo = [], up = [];
  for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of P.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1)); };
for (const [f, k] of Object.entries(K)) {
  const doc = await io.read(path.join(dir, f)); const P = []; let top = 0;
  for (const n of doc.getRoot().listNodes()) { const m = n.getMesh(); if (!m) continue; const W = n.getWorldMatrix();
    for (const pr of m.listPrimitives()) { const a = pr.getAttribute('POSITION'); const v = [];
      for (let i = 0; i < a.getCount(); i += 1) { a.getElement(i, v); const x = W[0]*v[0]+W[4]*v[1]+W[8]*v[2]+W[12], y = W[1]*v[0]+W[5]*v[1]+W[9]*v[2]+W[13], z = W[2]*v[0]+W[6]*v[1]+W[10]*v[2]+W[14];
        top = Math.max(top, y); if (y < 1.5) P.push([+(x + k.position_xyz_m[0] + 50).toFixed(2), +(z + k.position_xyz_m[2] - 200).toFixed(2)]); } } }
  const id = f.replace('.glb', ''); const { json, resources } = await io.writeJSON(doc, { format: 'json' });
  const mime = (u) => (u.endsWith('.png') ? 'image/png' : u.endsWith('.jpg') || u.endsWith('.jpeg') ? 'image/jpeg' : 'application/octet-stream');
  for (const b of json.buffers || []) if (b.uri && resources[b.uri]) b.uri = `data:${mime(b.uri)};base64,${Buffer.from(resources[b.uri]).toString('base64')}`;
  for (const im of json.images || []) if (im.uri && resources[im.uri]) im.uri = `data:${mime(im.uri)};base64,${Buffer.from(resources[im.uri]).toString('base64')}`;
  fs.writeFileSync(path.join(outDir, id + '.json'), JSON.stringify(json));
  list.push({ id, x: +(k.position_xyz_m[0] + 50).toFixed(2), y: +(k.position_xyz_m[2] - 200).toFixed(2), h: +top.toFixed(1), hull: hull(P).flat() });
  console.log(id, 'Höhe', top.toFixed(1), 'Hüllpunkte', hull(P).length);
}
fs.writeFileSync(path.join(outDir, 'index.js'), 'const WZ_DATA=' + JSON.stringify(list) + ';\n');
