"""OSM (Overpass JSON) -> kompakte Spieldaten für Pythagoras City (Mönchengladbach).
Aufruf: python3 -I process.py <overpass.json> <out.js>
Koordinaten in Metern: x nach Osten, y nach Süden, Ursprung = Spielmitte."""
import json, math, sys, hashlib

src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src, encoding="utf-8"))
LAT0, LON0 = 51.1962, 6.4380
KX = math.cos(math.radians(LAT0)) * 111320.0
KY = 110574.0
HALF_X, HALF_Y = 1380.0, 1210.0


def P(lat, lon):
    return ((lon - LON0) * KX, -(lat - LAT0) * KY)


def inside_box(x, y, m=0):
    return -HALF_X - m <= x <= HALF_X + m and -HALF_Y - m <= y <= HALF_Y + m


def r1(v):
    return round(v, 1)


def h01(s):
    return int(hashlib.md5(str(s).encode()).hexdigest()[:8], 16) / 0xFFFFFFFF


def num(v):
    try:
        return float(str(v).replace(",", ".").replace("m", "").strip().split(";")[0])
    except Exception:
        return None


def area(pts):
    a = 0
    for i in range(len(pts)):
        x1, y1 = pts[i]; x2, y2 = pts[(i + 1) % len(pts)]
        a += x1 * y2 - x2 * y1
    return a / 2


def centroid(pts):
    return (sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts))


def clip_poly(pts):
    """Sutherland-Hodgman an der Spielfeldgrenze."""
    def clip(poly, inside, inter):
        res = []
        for i in range(len(poly)):
            a, b = poly[i - 1], poly[i]
            ia, ib = inside(a), inside(b)
            if ib:
                if not ia: res.append(inter(a, b))
                res.append(b)
            elif ia:
                res.append(inter(a, b))
        return res
    def ix(x0):
        return lambda a, b: (x0, a[1] + (b[1] - a[1]) * (x0 - a[0]) / ((b[0] - a[0]) or 1e-9))
    def iy(y0):
        return lambda a, b: (a[0] + (b[0] - a[0]) * (y0 - a[1]) / ((b[1] - a[1]) or 1e-9), y0)
    p = pts
    for ins, it in ((lambda q: q[0] >= -HALF_X, ix(-HALF_X)), (lambda q: q[0] <= HALF_X, ix(HALF_X)),
                    (lambda q: q[1] >= -HALF_Y, iy(-HALF_Y)), (lambda q: q[1] <= HALF_Y, iy(HALF_Y))):
        if not p: break
        p = clip(p, ins, it)
    return p


def ring(geom):
    pts = [P(g["lat"], g["lon"]) for g in geom if g]
    if len(pts) > 2 and pts[0] == pts[-1]:
        pts = pts[:-1]
    return pts


def join_outer(members):
    """Äußere Ringe einer Multipolygon-Relation aus Teil-Wegen zusammensetzen."""
    segs = [ring_raw(m["geometry"]) for m in members if m.get("type") == "way" and m.get("role") in ("outer", "") and m.get("geometry")]
    rings = []
    segs = [s for s in segs if len(s) >= 2]
    while segs:
        cur = segs.pop(0)
        changed = True
        while cur[0] != cur[-1] and changed:
            changed = False
            for i, s in enumerate(segs):
                if s[0] == cur[-1]: cur = cur + s[1:]
                elif s[-1] == cur[-1]: cur = cur + s[::-1][1:]
                elif s[-1] == cur[0]: cur = s + cur[1:]
                elif s[0] == cur[0]: cur = s[::-1] + cur[1:]
                else: continue
                segs.pop(i); changed = True; break
        if cur[0] == cur[-1] and len(cur) > 3:
            rings.append([P(lat, lon) for lat, lon in cur[:-1]])
    return rings


def ring_raw(geom):
    return [(g["lat"], g["lon"]) for g in geom if g]


DRIVE = {"motorway": 14, "trunk": 13, "primary": 12, "primary_link": 7, "secondary": 11, "secondary_link": 7,
         "tertiary": 9.5, "tertiary_link": 6, "unclassified": 7.5, "residential": 7, "living_street": 6, "service": 4.5}
WALK = {"pedestrian": 8, "footway": 2.6, "path": 2.2, "cycleway": 2.4, "steps": 2.5, "track": 3, "bridleway": 2.5, "corridor": 2}

roads, nodes_idx, nodes = [], {}, []
buildings, parts, areas, rails, trees, pois = [], [], [], [], [], []
BLOCKED = set()  # nicht jugendfreie Orte: weder als Ort noch als Gebäudename übernehmen


def nid(n, lat, lon):
    if n not in nodes_idx:
        x, y = P(lat, lon)
        nodes_idx[n] = len(nodes) // 2
        nodes.extend([r1(x), r1(y)])
    return nodes_idx[n]


def btype_height(tags, key):
    h = num(tags.get("height")) or num(tags.get("building:height"))
    lv = num(tags.get("building:levels"))
    if h is None and lv is not None:
        h = lv * 3.2 + (1.5 if tags.get("roof:shape") not in (None, "flat") else 0.6)
    if h is None:
        b = tags.get("building") or tags.get("building:part") or "yes"
        r = h01(key)
        if b in ("garage", "garages", "shed", "carport", "hut", "kiosk", "roof"): h = 3 + r
        elif b in ("church", "cathedral", "chapel"): h = 16 + r * 6
        elif b in ("house", "detached", "semidetached_house", "terrace", "bungalow"): h = 8 + r * 4
        elif b in ("train_station", "transportation"): h = 14
        elif b in ("industrial", "warehouse", "retail", "supermarket"): h = 8 + r * 5
        else: h = 11 + r * 8
    mh = num(tags.get("min_height")) or ((num(tags.get("building:min_level")) or 0) * 3.2)
    return max(2.5, min(h, 120)), max(0.0, min(mh or 0.0, 100))


POI_KEYS = ("amenity", "shop", "tourism", "railway", "aeroway", "place", "leisure")

for e in d["elements"]:
    t = e.get("tags", {})
    typ = e["type"]
    # POIs (benannte Orte für Aufträge und Beschriftung)
    if any(k in t for k in POI_KEYS) and (t.get("name") or t.get("amenity") in ("fire_station", "taxi", "townhall", "hospital") or t.get("aeroway")):
        if typ == "node":
            x, y = P(e["lat"], e["lon"])
        elif typ == "way" and e.get("geometry"):
            x, y = centroid(ring(e["geometry"]) or [(0, 0)])
        elif typ == "relation" and e.get("members"):
            pts = [P(g["lat"], g["lon"]) for m in e["members"] if m.get("geometry") for g in m["geometry"] if g]
            x, y = centroid(pts) if pts else (9e9, 9e9)
        else:
            x = y = 9e9
        adult = t.get("amenity") in ("brothel", "nightclub", "stripclub", "swingerclub", "gambling", "casino", "love_hotel") or t.get("shop") in ("erotic", "pawnbroker") or t.get("leisure") == "adult_gaming_centre"
        if adult and t.get("name"): BLOCKED.add(t["name"])
        if inside_box(x, y) and not adult:
            kind = next((f"{k}={t[k]}" for k in POI_KEYS if k in t), "")
            pois.append({"n": t.get("name", ""), "k": kind, "x": r1(x), "y": r1(y)})
    if typ == "node":
        if t.get("natural") == "tree":
            x, y = P(e["lat"], e["lon"])
            if inside_box(x, y): trees.extend([r1(x), r1(y)])
        continue
    hw = t.get("highway")
    if typ == "way" and hw and e.get("geometry") and t.get("area") != "yes":
        if hw in DRIVE or hw in WALK:
            ids = [nid(n, g["lat"], g["lon"]) for n, g in zip(e["nodes"], e["geometry"])]
            xs = [nodes[i * 2] for i in ids]; ys = [nodes[i * 2 + 1] for i in ids]
            if any(inside_box(x, y, 50) for x, y in zip(xs, ys)):
                w = num(t.get("width")) or (DRIVE.get(hw) or WALK.get(hw))
                lanes = num(t.get("lanes"))
                if lanes and hw in DRIVE: w = max(w, lanes * 3.2)
                ow = 1 if t.get("oneway") in ("yes", "1", "true") or t.get("junction") == "roundabout" else (-1 if t.get("oneway") == "-1" else 0)
                car = 1 if hw in DRIVE and t.get("access") not in ("no", "private") and t.get("motor_vehicle") not in ("no",) and t.get("service") not in ("parking_aisle", "driveway") else 0
                roads.append({"h": hw, "n": t.get("name", ""), "w": r1(min(w, 22)), "o": ow, "c": car, "b": 1 if t.get("bridge") else 0, "tu": 1 if t.get("tunnel") else 0, "i": ids})
        continue
    if typ == "way" and t.get("highway") == "pedestrian" and t.get("area") == "yes" and e.get("geometry"):
        pts = clip_poly(ring(e["geometry"]))
        if len(pts) > 2: areas.append({"t": "plaza", "p": [r1(v) for q in pts for v in q]})
        continue
    if "building" in t or "building:part" in t:
        rings = []
        if typ == "way" and e.get("geometry"):
            rings = [ring(e["geometry"])]
        elif typ == "relation":
            rings = join_outer(e.get("members", []))
        for k, pts in enumerate(rings):
            if len(pts) < 3: continue
            c = centroid(pts)
            if not inside_box(*c): continue
            pts = clip_poly(pts)
            if len(pts) < 3 or abs(area(pts)) < 6: continue
            h, mh = btype_height(t, f"{e['id']}-{k}")
            rec = {"p": [r1(v) for q in pts for v in q], "h": r1(h), "m": r1(mh), "t": (t.get("building") or t.get("building:part") or "yes")[:14]}
            if t.get("name"): rec["n"] = t["name"]
            if t.get("building:colour"): rec["c"] = t["building:colour"]
            if t.get("roof:colour"): rec["rc"] = t["roof:colour"]
            if t.get("building:material"): rec["mat"] = t["building:material"]
            (parts if "building:part" in t and "building" not in t else buildings).append(rec)
        continue
    if typ in ("way", "relation") and t.get("railway") in ("rail", "light_rail", "tram", "subway") and typ == "way" and e.get("geometry"):
        pts = [P(g["lat"], g["lon"]) for g in e["geometry"] if g]
        if any(inside_box(x, y) for x, y in pts):
            rails.append([r1(v) for q in pts for v in q])
        continue
    kind = None
    if t.get("leisure") in ("park", "garden"): kind = "park"
    elif t.get("leisure") in ("pitch", "playground"): kind = "pitch"
    elif t.get("landuse") in ("grass", "meadow", "recreation_ground", "village_green"): kind = "grass"
    elif t.get("landuse") in ("forest",) or t.get("natural") in ("wood", "scrub"): kind = "wood"
    elif t.get("landuse") == "cemetery": kind = "cemetery"
    elif t.get("landuse") == "railway": kind = "rail"
    elif t.get("natural") == "water" or t.get("waterway") in ("riverbank",): kind = "water"
    elif t.get("railway") == "platform": kind = "platform"
    elif t.get("place") == "square": kind = "plaza"
    if kind:
        rings = [ring(e["geometry"])] if typ == "way" and e.get("geometry") else (join_outer(e.get("members", [])) if typ == "relation" else [])
        for pts in rings:
            if len(pts) < 3 or pts[0] == pts[-1] and len(pts) < 4: continue
            if typ == "way" and e["geometry"][0] != e["geometry"][-1]: continue  # offene Linie
            pts = clip_poly(pts)
            if len(pts) > 2 and abs(area(pts)) > 20:
                rec = {"t": kind, "p": [r1(v) for q in pts for v in q]}
                if t.get("name"): rec["n"] = t["name"]
                areas.append(rec)


# Gebäude, die durch building:part ersetzt werden, auslassen (verhindert doppelte Wände)
def pip(x, y, flat):
    c = False; n = len(flat) // 2
    for i in range(n):
        x1, y1 = flat[2 * i], flat[2 * i + 1]; x2, y2 = flat[2 * ((i + 1) % n)], flat[2 * ((i + 1) % n) + 1]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / ((y2 - y1) or 1e-9) + x1: c = not c
    return c

pc = [centroid(list(zip(p["p"][::2], p["p"][1::2]))) for p in parts]
kept = []
for b in buildings:
    xs, ys = b["p"][::2], b["p"][1::2]
    bx0, bx1, by0, by1 = min(xs), max(xs), min(ys), max(ys)
    hits = [c for c in pc if bx0 <= c[0] <= bx1 and by0 <= c[1] <= by1 and pip(c[0], c[1], b["p"])]
    if len(hits) >= 1 and b["t"] in ("church", "cathedral", "chapel", "yes", "train_station", "civic", "public", "university") and len(hits) > 0:
        b["skip"] = 1  # Teile übernehmen
    kept.append(b)
buildings = [b for b in kept if not b.get("skip")] + parts
for b in buildings:
    if b.get("n") in BLOCKED or "pfandhaus" in b.get("n", "").lower(): b.pop("n")

data = {"origin": [LAT0, LON0], "half": [HALF_X, HALF_Y], "nodes": nodes, "roads": roads, "buildings": buildings,
        "areas": areas, "rails": rails, "trees": trees, "pois": pois}
s = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
open(out, "w", encoding="utf-8").write("const MG=" + s + ";\n")
print(f"roads {len(roads)} nodes {len(nodes)//2} buildings {len(buildings)} (parts {len(parts)}) areas {len(areas)} rails {len(rails)} trees {len(trees)//2} pois {len(pois)} size {len(s)/1e6:.2f} MB")
