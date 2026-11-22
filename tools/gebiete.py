"""Zerlegt ganz Mönchengladbach in Gebiete und erzeugt die Spieldaten dafür.

Aufruf:  python3 tools/gebiete.py karte/ <ziel-ordner> <arbeits-ordner> [nur-index]

- Raster aus Kernzellen 2600 m × 2300 m, ausgerichtet am Phase-1-Ausschnitt (Rheydt, Zelle 0_0).
- Jedes Gebiet = Kernzelle plus 300 m Rand (Überlappung zum Nachbarn); nur Zellen, die die Stadtgrenze schneiden.
  Zelle 0_0 bleibt der bisherige Phase-1-Ausschnitt (mg-echt.js) ohne Rand.
- Freischaltraster (25 m) aus grenzen/freischaltgebiete.geojson: 0 = außerhalb der Stadt, 1–5 = Phase.
- Schreibt <ziel>/gebiete/<id>.js (Kartendaten + umgezogene Spielinhalte) und <ziel>/gebiete/index.js.
Spielkoordinaten wie in realkarte.py: x = X − CX, y = Z − CZ mit CX = −50, CZ = 200.
"""
import json, os, subprocess, sys
from pyproj import Transformer
from shapely.geometry import shape, box as sbox, Point
from shapely.ops import unary_union, transform as stransform
from shapely.prepared import prep

PKG, OUT, WORK = sys.argv[1], sys.argv[2], sys.argv[3]
ONLY_INDEX = len(sys.argv) > 4 and sys.argv[4] == "nur-index"
HERE = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(os.path.join(PKG, "world.json")))
E0, N0, H0 = W["origin_utm_nhn_m"]
T = Transformer.from_crs("EPSG:4326", "EPSG:25832", always_xy=True)
CX, CZ = -50.0, 200.0
CW, CH, MARGIN = 2600.0, 2300.0, 300.0
GX0, GZ0 = -1350.0, -950.0          # Kernzelle 0_0 = Phase-1-Ausschnitt (Paket-Koordinaten)


def to_xz(geom):
    return stransform(lambda lon, lat, z=None: (lambda e, n: (e - E0, N0 - n))(*T.transform(lon, lat)), geom)


city = unary_union([to_xz(shape(f["geometry"])) for f in json.load(open(os.path.join(PKG, "grenzen", "stadtgrenze.geojson")))["features"]])
phases = []
for f in json.load(open(os.path.join(PKG, "grenzen", "freischaltgebiete.geojson")))["features"]:
    pr = f["properties"]
    phases.append((pr["phase"], pr["name"], pr.get("bedingung", ""), to_xz(shape(f["geometry"]))))
phases.sort(key=lambda p: p[0])
minx, minz, maxx, maxz = city.bounds
print("Stadt:", [round(v) for v in city.bounds])

cells = {}
for k in range(int((minx - GX0) // CW) - 1, int((maxx - GX0) // CW) + 2):
    for m in range(int((minz - GZ0) // CH) - 1, int((maxz - GZ0) // CH) + 2):
        x0, z0 = GX0 + k * CW, GZ0 + m * CH
        core = sbox(x0, z0, x0 + CW, z0 + CH)
        if not core.intersects(city):
            continue
        ph = sorted({p[0] for p in phases if p[3].intersects(core)})
        cid = f"{k}_{m}"
        ext = (x0, x0 + CW, z0, z0 + CH) if cid == "0_0" else (x0 - MARGIN, x0 + CW + MARGIN, z0 - MARGIN, z0 + CH + MARGIN)
        cells[cid] = {"k": k, "m": m, "ph": ph, "ext": ext}
print(len(cells), "Gebiete")

# ------------------------------------------------------------ Freischaltraster (25 m)
C = 25.0
rx0, rz0 = GX0 + min(c["k"] for c in cells.values()) * CW, GZ0 + min(c["m"] for c in cells.values()) * CH
rx1, rz1 = GX0 + (max(c["k"] for c in cells.values()) + 1) * CW, GZ0 + (max(c["m"] for c in cells.values()) + 1) * CH
nw, nh = int((rx1 - rx0) / C), int((rz1 - rz0) / C)
pp = [(p[0], prep(p[3])) for p in phases]
pc = prep(city)
vals = bytearray(nw * nh)
for j in range(nh):
    z = rz0 + (j + .5) * C
    for i in range(nw):
        x = rx0 + (i + .5) * C
        pt = Point(x, z)
        v = 0
        for ph, g in pp:
            if g.contains(pt):
                v = ph
                break
        if not v and pc.contains(pt):
            v = 5
        vals[j * nw + i] = v
# Lauflängen: "<wert><anzahl base36>," …
rle, i = [], 0
while i < len(vals):
    j = i
    while j < len(vals) and vals[j] == vals[i] and j - i < 1295:
        j += 1
    n, s = j - i, ""
    while True:
        s = "0123456789abcdefghijklmnopqrstuvwxyz"[n % 36] + s
        n //= 36
        if not n:
            break
    rle.append(f"{vals[i]}{s}")
    i = j
os.makedirs(os.path.join(OUT, "gebiete"), exist_ok=True)
idx = {"cw": CW, "ch": CH, "x0": GX0 - CX, "y0": GZ0 - CZ, "margin": MARGIN,
       "cells": {cid: {"ph": c["ph"], "ext": [c["ext"][0] - CX, c["ext"][1] - CX, c["ext"][2] - CZ, c["ext"][3] - CZ]} for cid, c in cells.items()},
       "raster": {"x0": rx0 - CX, "y0": rz0 - CZ, "c": C, "w": nw, "h": nh, "rle": ",".join(rle)},
       "phasen": [{"p": p[0], "n": p[1], "bed": p[2]} for p in phases]}
open(os.path.join(OUT, "gebiete", "index.js"), "w", encoding="utf-8").write("const GEB=" + json.dumps(idx, separators=(",", ":"), ensure_ascii=False) + ";\n")
print("Index:", nw, "×", nh, "Rasterzellen,", len(rle), "Läufe")

# Kontrolle: Phase wichtiger Orte
for f in json.load(open(os.path.join(PKG, "orte.geojson")))["features"]:
    x, z = f["properties"]["welt_xz_m"]
    i, j = int((x - rx0) // C), int((z - rz0) // C)
    print("  ", f["properties"]["name"], "→ Phase", vals[j * nw + i] if 0 <= i < nw and 0 <= j < nh else "-")

if ONLY_INDEX:
    sys.exit(0)
# ------------------------------------------------------------ Gebietsdaten
os.makedirs(WORK, exist_ok=True)
for cid, c in sorted(cells.items()):
    if cid == "0_0":
        continue
    out = os.path.join(OUT, "gebiete", f"g_{cid}.js")
    basis = os.path.join(WORK, f"g_{cid}.basis.js")
    x0, x1, z0, z1 = c["ext"]
    r = subprocess.run([sys.executable, os.path.join(HERE, "realkarte.py"), PKG, basis, str(x0), str(x1), str(z0), str(z1), f"g_{cid}"], capture_output=True, text=True)
    if r.returncode:
        print("FEHLER", cid, r.stderr[-400:])
        continue
    with open(out, "w", encoding="utf-8") as fo:
        subprocess.run(["node", os.path.join(HERE, "fx_build.js"), os.path.join(OUT, "mg-data.js"), basis, os.path.join(HERE, "spielinhalte.js")], stdout=fo, check=True)
    print(cid, "Phasen", c["ph"], round(os.path.getsize(out) / 1048576, 2), "MB")
