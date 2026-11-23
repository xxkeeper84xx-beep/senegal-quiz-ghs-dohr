"""Bodenbilder je Kachel aus den Luftbildern der GLB-Pakete (Geobasis NRW, dl-de/zero-2-0).
   Rheydt/Dohr: Detailkarte (ca. 1,3 m/Pixel) → 2048 px; übrige Kacheln: Stadtkarte (ca. 7,5 m/Pixel) → 768 px.
   Ausgabe sk2/boden/<kachel>.jpg und sk2/boden/index.js (Ausschnitte in Spielkoordinaten). Aufruf: python3 -I tools/boden.py sk2 up_mg1/ortho_rheydt.jpg up_mg2/ortho_stadt.jpg"""
import sys, os, json
from PIL import Image, ImageFilter, ImageEnhance
Image.MAX_IMAGE_PIXELS = None
root, fr, fs = sys.argv[1:4]
s = open(os.path.join(root, 'gebiete', 'index.js')).read(); G = json.JSONDecoder().raw_decode(s[s.find('{'):])[0]
IR, IS = Image.open(fr).convert('RGB'), Image.open(fs).convert('RGB')
SRC = {'r': (IR, -2000, 2000, -2000, 2000), 's': (IS, -12000, 6000, -10000, 9000)}
os.makedirs(os.path.join(root, 'boden'), exist_ok=True); idx = {}
for key, c in G['cells'].items():
    x0, x1, y0, y1 = c['ext']
    if key == '0_0': x0, x1, y0, y1 = x0 - 300, x1 + 300, y0 - 300, y1 + 300
    X0, X1, Z0, Z1 = x0 - 50, x1 - 50, y0 + 200, y1 + 200
    src = 'r' if X0 >= -2000 and X1 <= 2000 and Z0 >= -2000 and Z1 <= 2000 else 's'
    im, a, b, cz, dz = SRC[src]; W, H = im.size
    box = ((X0 - a) / (b - a) * W, (Z0 - cz) / (dz - cz) * H, (X1 - a) / (b - a) * W, (Z1 - cz) / (dz - cz) * H)
    px = 2048 if src == 'r' else 768
    out = im.crop(tuple(int(round(v)) for v in box)).resize((px, px), Image.LANCZOS)
    if src == 's': out = out.filter(ImageFilter.GaussianBlur(1.2))
    out = ImageEnhance.Color(out).enhance(1.25); out = ImageEnhance.Brightness(out).enhance(1.08)
    name = 'rheydt' if key == '0_0' else 'g_' + key
    out.save(os.path.join(root, 'boden', name + '.jpg'), quality=80, optimize=True)
    idx[name] = {'ext': [x0, x1, y0, y1], 'q': src}
open(os.path.join(root, 'boden', 'index.js'), 'w').write('const BODEN=' + json.dumps(idx) + ';\n')
tot = sum(os.path.getsize(os.path.join(root, 'boden', f)) for f in os.listdir(os.path.join(root, 'boden')))
print(len(idx), 'Kacheln', round(tot / 1048576, 1), 'MB', 'detail:', [k for k, v in idx.items() if v['q'] == 'r'])
