"""Baut aus dem Kartenpaket (karte/) die Spielwelt-Daten für die echte Karte von Rheydt (Phase 1).

Aufruf:  python3 tools/realkarte.py karte/ mg-echt.js

Koordinaten wie im Kartenpaket: X = Ost − 322000, Z = 5671000 − Nord (Meter, Z nach Süden).
Die Spielengine arbeitet mit einem zentrierten Ausschnitt: x = X − CX, y = Z − CZ.
Benötigt: pyproj, shapely.
"""
import json, math, sys, os, hashlib
from pyproj import Transformer
from shapely.geometry import shape, Polygon, MultiPolygon, LineString, Point, box as sbox
from shapely.ops import unary_union

PKG, OUT = sys.argv[1], sys.argv[2]
W = json.load(open(os.path.join(PKG, "world.json")))
E0, N0, H0 = W["origin_utm_nhn_m"]
T = Transformer.from_crs("EPSG:4326", "EPSG:25832", always_xy=True)

# Ausschnitt Phase 1 (beide Schulen, Rheydt Markt, Rheydt Hbf) in Paket-Koordinaten
X0, X1, Z0, Z1 = -1350.0, 1250.0, -950.0, 1350.0
CX, CZ = (X0 + X1) / 2, (Z0 + Z1) / 2
HX, HY = (X1 - X0) / 2, (Z1 - Z0) / 2
CLIP = sbox(X0, Z0, X1, Z1)


def lonlat_to_xz(lon, lat):
    e, n = T.transform(lon, lat)
    return e - E0, N0 - n


def proj_coords(coords):
    return [lonlat_to_xz(c[0], c[1]) for c in coords]


def to_game(x, z):
    return round(x - CX, 2), round(z - CZ, 2)


def flat(pts):
    out = []
    for x, z in pts:
        gx, gz = to_game(x, z)
        out += [gx, gz]
    return out


def hval(s):
    try:
        return float(str(s).replace("m", "").replace(",", ".").split(";")[0].strip())
    except Exception:
        return None


# ------------------------------------------------------------ Kacheln laden (nur die, die den Ausschnitt schneiden)
tiles = []
for k in W["kacheln"]:
    bx0, by0, bx1, by1 = k["bbox_utm_m"]
    tx0, tx1 = bx0 - E0, bx1 - E0
    tz0, tz1 = N0 - by1, N0 - by0
    if tx1 < X0 or tx0 > X1 or tz1 < Z0 or tz0 > Z1:
        continue
    tiles.append(k)
feats = []
for k in tiles:
    feats += json.load(open(os.path.join(PKG, k["geojson"])))["features"]
print(len(tiles), "Kacheln,", len(feats), "Objekte")

# ------------------------------------------------------------ Gebäude
DEF_H = {"house": 8, "detached": 8, "semidetached_house": 8, "terrace": 9, "residential": 9, "apartments": 13,
         "school": 11, "church": 18, "chapel": 9, "garage": 3, "garages": 3, "shed": 3, "carport": 3, "roof": 4,
         "commercial": 10, "retail": 8, "industrial": 9, "warehouse": 8, "office": 14, "hospital": 15,
         "train_station": 9, "public": 11, "civic": 11, "parking": 12, "kindergarten": 5, "hut": 3}
PALETTE = ["#efe8da", "#e2d5bd", "#d6c4a6", "#f3efe6", "#d9d2c4", "#e6d9b8", "#b5674c", "#a85a43", "#cfc1ad", "#c9c2b6", "#e9e4da"]
ROOFS = ["#7a3b2a", "#8a4a35", "#5a5d63", "#6b4a3a", "#4a4d52"]
buildings, seen_b = [], {}
modelled = 0
for f in feats:
    p = f["properties"]
    if p.get("layer") not in ("gebaeude", "gebaeudeteile"):
        continue
    oid = p.get("osm_id")
    g = f["geometry"]
    polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    for ring_set in polys:
        outer = proj_coords(ring_set[0])
        poly = Polygon(outer)
        if not poly.is_valid:
            poly = poly.buffer(0)
            if poly.is_empty or poly.geom_type != "Polygon":
                continue
        if not poly.intersects(CLIP) or poly.area < 6:
            continue
        key = (oid, round(poly.centroid.x, 1), round(poly.centroid.y, 1))
        if key in seen_b:
            continue
        seen_b[key] = 1
        t = p.get("building") or p.get("building:part") or "yes"
        h = hval(p.get("height"))
        lv = hval(p.get("building:levels"))
        d = 0
        if h is None and lv is not None:
            h = lv * 3.0 + (1.5 if p.get("roof:shape") not in (None, "flat") else 0.5)
        if h is None:
            h = DEF_H.get(t, 8.0)
            d = 1
            modelled += 1
        m = hval(p.get("min_height")) or ((hval(p.get("building:min_level")) or 0) * 3.0)
        hsh = int(hashlib.md5(str(oid).encode()).hexdigest()[:6], 16)
        c = PALETTE[hsh % len(PALETTE)]
        b = {"p": flat(list(poly.exterior.coords)[:-1]), "h": round(min(h, 120), 1), "m": round(m, 1), "t": t,
             "c": c, "rc": ROOFS[(hsh >> 4) % len(ROOFS)], "o": oid}
        if c in ("#b5674c", "#a85a43"):
            b["k"] = "brick"
        if d:
            b["d"] = 1          # Standardhöhe angenommen (keine Höhenangabe in den Daten)
        if p.get("name"):
            b["n"] = p["name"]
        buildings.append(b)
# Echte Höhen aus den amtlichen LoD2-Modellen: pro Gebäudebox höchster minus tiefster Punkt
import struct, numpy as np
LI = json.load(open(os.path.join(PKG, "lod2_glb", "index.json")))
boxes = []          # (x0, z0, x1, z1, höhe, grund)
for tl in LI["tiles"]:
    fn = os.path.join(PKG, "lod2_glb", tl["file"])
    if not os.path.exists(fn):
        continue
    raw = open(fn, "rb").read()
    jl = struct.unpack("<I", raw[12:16])[0]
    J = json.loads(raw[20:20 + jl])
    binoff = 20 + jl + 8
    P = []
    for m in J["meshes"]:
        for pr in m["primitives"]:
            acc = J["accessors"][pr["attributes"]["POSITION"]]
            bv = J["bufferViews"][acc["bufferView"]]
            off = binoff + bv.get("byteOffset", 0) + acc.get("byteOffset", 0)
            P.append(np.frombuffer(raw, dtype="<f4", count=acc["count"] * 3, offset=off).reshape(-1, 3))
    P = np.concatenate(P) + np.array(tl["translation_xyz_m"], dtype="f4")
    order = np.argsort(P[:, 0]); P = P[order]; xs = P[:, 0]
    tx, ty, tz = tl["translation_xyz_m"]
    for bx0, bz0, bx1, bz1 in tl["building_bboxes_local_xz_m"]:
        bx0 += tx; bx1 += tx; bz0 += tz; bz1 += tz
        if bx1 < X0 or bx0 > X1 or bz1 < Z0 or bz0 > Z1:
            continue
        i0, i1 = np.searchsorted(xs, bx0 - .05), np.searchsorted(xs, bx1 + .05)
        q = P[i0:i1]; q = q[(q[:, 2] >= bz0 - .05) & (q[:, 2] <= bz1 + .05)]
        if len(q) < 4:
            continue
        boxes.append((bx0, bz0, bx1, bz1, float(q[:, 1].max() - q[:, 1].min()), float(q[:, 1].min())))
print(len(boxes), "LoD2-Gebäude mit gemessener Höhe")
bx = np.array([b[:4] for b in boxes]) if boxes else np.zeros((0, 4))
areas_b = (bx[:, 2] - bx[:, 0]) * (bx[:, 3] - bx[:, 1]) if len(bx) else bx
lod_hit = 0
for b in buildings:
    xs_, zs_ = b["p"][0::2], b["p"][1::2]
    cx_, cz_ = sum(xs_) / len(xs_) + CX, sum(zs_) / len(zs_) + CZ
    if not len(bx):
        break
    m = (bx[:, 0] <= cx_) & (bx[:, 2] >= cx_) & (bx[:, 1] <= cz_) & (bx[:, 3] >= cz_)
    if m.any():
        j = np.where(m)[0][np.argmin(areas_b[m])]
        hgt = boxes[j][4]
        if 2 <= hgt <= 120:
            b["h"] = round(hgt, 1); b.pop("d", None); b["lod2"] = 1; b["g"] = round(boxes[j][5], 2); lod_hit += 1
modelled = sum(1 for b in buildings if b.get("d"))
print(len(buildings), "Gebäude:", lod_hit, "mit LoD2-Höhe,", modelled, "mit angenommener Standardhöhe")

# ------------------------------------------------------------ Flächen und Gewässer
AMAP = {"park": "park", "garden": "park", "playground": "park", "dog_park": "park", "recreation_ground": "grass",
        "grass": "grass", "grassland": "grass", "meadow": "grass", "village_green": "grass", "flowerbed": "grass",
        "scrub": "wood", "heath": "grass", "orchard": "grass", "allotments": "grass", "pitch": "pitch",
        "wood": "wood", "forest": "wood", "cemetery": "cemetery", "grave_yard": "cemetery", "parking": "plaza",
        "schoolyard": "plaza", "marketplace": "plaza", "railway": "rail", "water": "water", "basin": "water", "reservoir": "water"}
areas = []
for f in feats:
    p = f["properties"]
    lay = p.get("layer")
    if lay not in ("flaechennutzung", "wasserflaechen", "strassenflaechen"):
        continue
    kind = "water" if lay == "wasserflaechen" else "plaza" if lay == "strassenflaechen" else None
    if not kind:
        for k in ("leisure", "landuse", "natural", "amenity", "place"):
            if p.get(k) in AMAP:
                kind = AMAP[p[k]]
                break
    if not kind:
        continue
    g = shape(f["geometry"])
    g = Polygon(proj_coords(g.exterior.coords)) if g.geom_type == "Polygon" else MultiPolygon([Polygon(proj_coords(q.exterior.coords)) for q in g.geoms])
    g = g.buffer(0).intersection(CLIP)
    for q in ([g] if g.geom_type == "Polygon" else getattr(g, "geoms", [])):
        if q.geom_type != "Polygon" or q.area < 20:
            continue
        a = {"t": kind, "p": flat(list(q.exterior.coords)[:-1])}
        if p.get("name"):
            a["n"] = p["name"]
        areas.append(a)
# Bäche und Flüsse als schmale Wasserflächen
for f in feats:
    p = f["properties"]
    if p.get("layer") != "wasserlaeufe" or p.get("tunnel") in ("yes", "culvert"):
        continue
    wv = {"river": 12, "canal": 8, "stream": 3, "ditch": 1.5, "drain": 1.5}.get(p.get("waterway"), 2)
    g = shape(f["geometry"])
    lines = [g] if g.geom_type == "LineString" else list(getattr(g, "geoms", []))
    for ln in lines:
        q = LineString(proj_coords(ln.coords)).buffer(wv / 2, cap_style=2).intersection(CLIP)
        for qq in ([q] if q.geom_type == "Polygon" else getattr(q, "geoms", [])):
            if qq.geom_type == "Polygon" and qq.area > 4:
                areas.append({"t": "water", "p": flat(list(qq.exterior.coords)[:-1])})
# Schulgrundstücke (für die Regel „Auf dem Schulgelände wird nicht gefahren“)
schools = []
for f in feats:
    p = f["properties"]
    if p.get("layer") != "flaechennutzung" or p.get("amenity") != "school":
        continue
    g = shape(f["geometry"])
    for q in ([g] if g.geom_type == "Polygon" else list(g.geoms)):
        qq = Polygon(proj_coords(q.exterior.coords)).buffer(0)
        if qq.intersects(CLIP) and qq.geom_type == "Polygon":
            schools.append({"n": p.get("name", "Schule"), "p": flat(list(qq.exterior.coords)[:-1])})
print(len(schools), "Schulgrundstücke")
print(len(areas), "Flächen")

# ------------------------------------------------------------ Gleise
rails = []
for f in feats:
    p = f["properties"]
    if p.get("layer") != "bahn" or p.get("railway") not in ("rail", "light_rail", "narrow_gauge"):
        continue
    if p.get("tunnel") == "yes":
        continue
    g = shape(f["geometry"])
    for ln in ([g] if g.geom_type == "LineString" else list(getattr(g, "geoms", []))):
        q = LineString(proj_coords(ln.coords)).intersection(CLIP)
        for qq in ([q] if q.geom_type == "LineString" else getattr(q, "geoms", [])):
            if qq.geom_type == "LineString" and qq.length > 5:
                rails.append(flat(list(qq.coords)))
print(len(rails), "Gleisabschnitte")

# ------------------------------------------------------------ Straßen und Wege aus dem Wegenetz (Verbindung über OSM-Knoten)
WN = json.load(open(os.path.join(PKG, "wegenetz.json")))
CAR = {"motorway": 12, "trunk": 11, "primary": 10, "secondary": 9, "tertiary": 8, "unclassified": 6.5, "residential": 6.5,
       "living_street": 5.5, "service": 4.5, "road": 6, "motorway_link": 6, "trunk_link": 6, "primary_link": 6,
       "secondary_link": 6, "tertiary_link": 6}
WALK = {"pedestrian": 6, "footway": 2.5, "path": 2.2, "cycleway": 2.5, "steps": 2.5, "track": 3, "bridleway": 2.5, "corridor": 2}
nodes, nidx, roads = [], {}, []


def node_id(osm, x, z):
    if osm not in nidx:
        nidx[osm] = len(nodes) // 2
        gx, gz = to_game(x, z)
        nodes.extend([gx, gz])
    return nidx[osm]


inside = lambda x, z: X0 - 30 <= x <= X1 + 30 and Z0 - 30 <= z <= Z1 + 30
for wid, nids, pts, tags in WN["ways"]:
    hw = tags.get("highway")
    if hw not in CAR and hw not in WALK:
        continue
    if tags.get("area") == "yes" or tags.get("access") in ("private", "no") and hw == "service":
        continue
    # in zusammenhängende Stücke innerhalb des Ausschnitts zerlegen
    runs, cur = [], []
    for nid, (x, z) in zip(nids, pts):
        if inside(x, z):
            cur.append((nid, x, z))
        else:
            if len(cur) >= 2:
                runs.append(cur)
            cur = []
    if len(cur) >= 2:
        runs.append(cur)
    for run in runs:
        car = 1 if hw in CAR else 0
        w = hval(tags.get("width"))
        lanes = hval(tags.get("lanes"))
        if not w:
            w = (lanes * 3.2 if car and lanes else (CAR.get(hw) or WALK.get(hw)))
        w = max(2, min(w, 16))
        r = {"h": hw if hw in ("pedestrian", "living_street", "service", "footway", "path", "cycleway", "steps", "track") else ("residential" if hw in ("residential", "unclassified", "road") else hw.replace("_link", "")),
             "w": round(w, 1), "c": car, "o": 1 if tags.get("oneway") in ("yes", "1", "true") else -1 if tags.get("oneway") == "-1" else 0,
             "b": 1 if tags.get("bridge") not in (None, "no") else 0, "tu": 1 if tags.get("tunnel") not in (None, "no") else 0,
             "i": [node_id(n, x, z) for n, x, z in run], "osm": wid}
        if tags.get("name"):
            r["n"] = tags["name"]
        if tags.get("layer"):
            r["l"] = tags["layer"]
        if tags.get("surface"):
            r["s"] = tags["surface"]
        roads.append(r)
print(len(roads), "Straßen/Wege,", len(nodes) // 2, "Knoten")

# ------------------------------------------------------------ Bäume, Orte, Stadtteile
trees, pois = [], []
for f in feats:
    p = f["properties"]
    if p.get("layer") != "orte":
        continue
    x, z = lonlat_to_xz(*f["geometry"]["coordinates"][:2])
    if not (X0 <= x <= X1 and Z0 <= z <= Z1):
        continue
    if p.get("natural") == "tree":
        trees += list(to_game(x, z))
    elif p.get("name") and (p.get("amenity") or p.get("public_transport") or p.get("railway") or p.get("tourism") or p.get("shop")):
        gx, gz = to_game(x, z)
        pois.append({"x": gx, "y": gz, "n": p["name"], "k": p.get("amenity") or p.get("public_transport") or p.get("railway") or p.get("shop") or p.get("tourism")})
ORTE = {}
for f in json.load(open(os.path.join(PKG, "orte.geojson")))["features"]:
    pr = f["properties"]
    x, z = pr["welt_xz_m"]
    ORTE[pr["id"]] = {"x": to_game(x, z)[0], "y": to_game(x, z)[1], "n": pr["name"], "adresse": pr.get("adresse"), "phase": pr.get("phase")}
districts = []
for f in json.load(open(os.path.join(PKG, "grenzen", "stadtteile.geojson")))["features"]:
    pr = f["properties"]
    g = shape(f["geometry"])
    polys = [g] if g.geom_type == "Polygon" else list(g.geoms)
    rings = []
    for q in polys:
        qq = Polygon(proj_coords(q.exterior.coords))
        if qq.intersects(CLIP):
            rings.append(flat(list(qq.exterior.coords)[:-1]))
    if rings:
        name = pr.get("name") or pr.get("stadtteil") or pr.get("STADTTEIL") or next((v for v in pr.values() if isinstance(v, str) and not v.isdigit()), "?")
        xs = [v for r in rings for v in r[0::2]]
        ys = [v for r in rings for v in r[1::2]]
        districts.append({"n": name, "b": [min(xs), min(ys), max(xs), max(ys)], "poly": rings, "hint": ""})
print(len(trees) // 2, "Bäume,", len(pois), "Orte,", len(districts), "Stadtteile")

# ------------------------------------------------------------ Startpunkt: Gehweg vor der Schule am Torfbend
tor = ORTE["torfbend"]
best = None
for r in roads:
    if r.get("n") != "Am Torfbend" or not r["c"]:
        continue
    for a, b2 in zip(r["i"], r["i"][1:]):
        ax, ay, bx, by = nodes[2 * a], nodes[2 * a + 1], nodes[2 * b2], nodes[2 * b2 + 1]
        dx, dy = bx - ax, by - ay
        L2 = dx * dx + dy * dy or 1
        t = max(0, min(1, ((tor["x"] - ax) * dx + (tor["y"] - ay) * dy) / L2))
        px, py = ax + dx * t, ay + dy * t
        d = math.hypot(tor["x"] - px, tor["y"] - py)
        if best is None or d < best[0]:
            best = (d, px, py, dx, dy, r["w"])
d, px, py, dx, dy, w = best
L = math.hypot(dx, dy)
nx, ny = -dy / L, dx / L
side = 1 if (tor["x"] - px) * nx + (tor["y"] - py) * ny > 0 else -1
start = [round(px + nx * side * (w / 2 + 1.6), 2), round(py + ny * side * (w / 2 + 1.6), 2), round(math.atan2(dy, dx), 3)]
print("Start am Torfbend:", start, "Abstand Straße–Marker", round(d, 1), "m")

# Herr Dittmann empfängt am Gehweg vor der Schule (Start der Geschichte)
sx, sy, sa = start
talk = [{"x": round(sx + math.cos(sa) * 6, 2), "y": round(sy + math.sin(sa) * 6, 2), "name": "Herr Dittmann", "role": "Lehrer, Klassenlehrer der 9c",
         "say": ["Willkommen in Rheydt! Das ist die echte Karte – Straßen und Gebäude stimmen mit der Stadt überein.", "Merk dir: Die Hypotenuse liegt immer dem rechten Winkel gegenüber und ist die längste Seite."]}]
MG = {"origin": [51.159, 6.466], "half": [HX, HY], "real": {"offset": [CX, CZ], "bbox": [X0, Z0, X1, Z1], "orte": ORTE,
      "quelle": "© OpenStreetMap-Mitwirkende (ODbL) · Geobasis NRW (dl-de/zero-2-0) · Stadt Mönchengladbach",
      "hinweis": "Gebäude mit d=1 haben eine angenommene Standardhöhe"},
      "nodes": nodes, "roads": roads, "buildings": buildings, "areas": areas, "rails": rails, "trees": trees, "pois": pois,
      "districts": districts, "start": start, "schools": schools, "talk": talk}
open(OUT, "w", encoding="utf-8").write("const MG=" + json.dumps(MG, separators=(",", ":"), ensure_ascii=False) + ";\n")
print("geschrieben:", OUT, round(os.path.getsize(OUT) / 1048576, 1), "MB")
