"""Fernansicht der ganzen Stadt: aus allen Kacheln ein Raster (40 m) mit Gebäudehöhe, bebautem Anteil und Gebäudeart.
   Ausgabe: sk2/fern/stadt_fern.js (FERN_DATA). Aufruf: python3 -I tools/fern.py sk2"""
import json, sys, os, glob, math, base64
root = sys.argv[1]; C = 40.0
files = [os.path.join(root, 'mg-echt.js')] + sorted(glob.glob(os.path.join(root, 'gebiete', 'g_*.js')))
seen = set(); B = []
for f in files:
    s = open(f, encoding='utf-8').read(); i = s.find('{'); d, _ = json.JSONDecoder().raw_decode(s[i:])
    for b in d.get('buildings', []):
        k = b.get('o') or (round(b['p'][0], 1), round(b['p'][1], 1))
        if k in seen: continue
        seen.add(k); B.append(b)
print('Gebäude', len(B))
xs = [b['p'][0] for b in B]; ys = [b['p'][1] for b in B]
x0, y0 = math.floor(min(xs) / C) * C, math.floor(min(ys) / C) * C
W, H = int((max(xs) - x0) // C) + 2, int((max(ys) - y0) // C) + 2
hmax = [0.0] * (W * H); area = [0.0] * (W * H); kind = [0] * (W * H)
def code(b):
    t = b.get('t') or ''
    if any(w in t for w in ('church', 'cathedral', 'chapel')): return 4
    if any(w in t for w in ('industrial', 'warehouse', 'garage', 'shed', 'roof', 'carport', 'parking', 'retail', 'commercial')): return 2
    if b.get('h', 8) > 20 or any(w in t for w in ('office', 'hotel', 'hospital', 'apartments')) and b.get('h', 8) > 14: return 3
    return 1
for b in B:
    p = b['p']; n = len(p) // 2
    if n < 3: continue
    a = 0.0
    for i in range(n):
        j = (i + 1) % n; a += p[2*i] * p[2*j+1] - p[2*j] * p[2*i+1]
    a = abs(a) / 2
    cx = sum(p[0::2]) / n; cy = sum(p[1::2]) / n
    gx, gy = int((cx - x0) // C), int((cy - y0) // C)
    if not (0 <= gx < W and 0 <= gy < H): continue
    k = gy * W + gx; h = b.get('h', 8) + b.get('m', 0)
    area[k] += a
    if h > hmax[k]: hmax[k] = h
    if a > 60 and (kind[k] == 0 or code(b) in (2, 3, 4)): kind[k] = code(b)
out = bytearray(W * H * 2); cnt = 0
for k in range(W * H):
    if area[k] < 25: continue
    cov = min(15, int(area[k] / (C * C) * 15 + .5)) or 1
    out[2*k] = min(255, int(hmax[k] + .5)); out[2*k+1] = (cov << 4) | (kind[k] or 1); cnt += 1
os.makedirs(os.path.join(root, 'fern'), exist_ok=True)
js = 'const FERN_DATA=' + json.dumps({'c': C, 'x0': x0, 'y0': y0, 'w': W, 'h': H, 'b64': base64.b64encode(bytes(out)).decode()}) + ';\n'
open(os.path.join(root, 'fern', 'stadt_fern.js'), 'w').write(js)
print('Raster', W, 'x', H, 'bebaut', cnt, 'Datei', round(len(js) / 1024), 'KB')
