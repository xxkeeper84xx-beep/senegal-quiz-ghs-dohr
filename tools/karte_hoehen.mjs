// Grobes Höhenraster (100 m) aus der Stadtkarte, in Spielkoordinaten (x = X + 50, y = Z − 200), Dezimeter als Int16
import { NodeIO } from '@gltf-transform/core'; import { ALL_EXTENSIONS } from '@gltf-transform/extensions'; import fs from 'node:fs';
const [inp, out] = process.argv.slice(2); const doc = await new NodeIO().registerExtensions(ALL_EXTENSIONS).read(inp);
const C = 100, x0 = -12000 + 50, y0 = -10000 - 200, W = 181, H = 191; const sum = new Float64Array(W * H), cnt = new Uint32Array(W * H);
for (const n of doc.getRoot().listNodes()) { const m = n.getMesh(); if (!m) continue; const T = n.getWorldMatrix();
  for (const p of m.listPrimitives()) { const a = p.getAttribute('POSITION'), v = [];
    for (let i = 0; i < a.getCount(); i++) { a.getElement(i, v); const x = v[0] + T[12] + 50, y = v[2] + T[14] - 200, h = v[1] + T[13];
      const gx = Math.round((x - x0) / C), gy = Math.round((y - y0) / C); if (gx < 0 || gy < 0 || gx >= W || gy >= H) continue; sum[gy * W + gx] += h; cnt[gy * W + gx]++; } } }
const o = new Int16Array(W * H); for (let i = 0; i < W * H; i++) o[i] = cnt[i] ? Math.round(sum[i] / cnt[i] * 10) : -32768;
// Lücken mit Nachbarn füllen
for (let it = 0; it < 6; it++) for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const k = j * W + i; if (o[k] !== -32768) continue; let s = 0, c = 0;
  for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = (j + b) * W + i + a; if (i + a >= 0 && i + a < W && j + b >= 0 && j + b < H && o[q] !== -32768) { s += o[q]; c++; } } if (c) o[k] = Math.round(s / c); }
for (let i = 0; i < W * H; i++) if (o[i] === -32768) o[i] = 0;
fs.writeFileSync(out, 'const FERN_H=' + JSON.stringify({ c: C, x0, y0, w: W, h: H, b64: Buffer.from(o.buffer).toString('base64') }) + ';\n');
console.log('Höhenraster', W, 'x', H, Math.min(...o) / 10, Math.max(...o) / 10);
