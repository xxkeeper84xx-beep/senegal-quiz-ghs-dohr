// Wandelt GLB-Dateien in eigenständige glTF-JSON-Dateien um (Puffer und Bilder als data:-URIs eingebettet).
// Nötig, weil das Artifact-Hosting keine .glb ausliefert, aber .json.   node tools/glb_to_json.mjs <ordner>
import { NodeIO } from '@gltf-transform/core';
import fs from 'node:fs';
import path from 'node:path';
const dir = process.argv[2], io = new NodeIO();
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.glb')).sort()) {
  const doc = await io.read(path.join(dir, f));
  const { json, resources } = await io.writeJSON(doc, { format: 'json' });
  const mime = (uri) => (uri.endsWith('.png') ? 'image/png' : uri.endsWith('.jpg') || uri.endsWith('.jpeg') ? 'image/jpeg' : 'application/octet-stream');
  const embed = (uri) => `data:${mime(uri)};base64,${Buffer.from(resources[uri]).toString('base64')}`;
  for (const b of json.buffers || []) if (b.uri && resources[b.uri]) b.uri = embed(b.uri);
  for (const im of json.images || []) if (im.uri && resources[im.uri]) im.uri = embed(im.uri);
  const out = path.join(dir, f.replace(/\.glb$/, '.json'));
  fs.writeFileSync(out, JSON.stringify(json));
  console.log(`${f} → ${path.basename(out)} (${(fs.statSync(out).size / 1048576).toFixed(2)} MB)`);
}
