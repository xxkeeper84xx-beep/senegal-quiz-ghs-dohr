"""Geofabrik-PBF -> Overpass-ähnliches JSON für den Spielausschnitt (Mönchengladbach Innenstadt).
Aufruf: python3 -I pbf2json.py <in.osm.pbf> <out.json>"""
import json, sys
import osmium

S, W, N, E = 51.1855, 6.4180, 51.2075, 6.4580
M = 0.002
inb = lambda lat, lon: S - M <= lat <= N + M and W - M <= lon <= E + M
AREA_KEYS = ("building", "building:part", "leisure", "landuse", "natural", "amenity", "shop", "tourism", "aeroway", "place")
NODE_KEYS = ("amenity", "shop", "tourism", "aeroway", "place", "railway")


class H(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.el = []

    def node(self, n):
        if not n.tags or not n.location.valid(): return
        lat, lon = n.location.lat, n.location.lon
        if not inb(lat, lon): return
        t = dict((k, v) for k, v in ((x.k, x.v) for x in n.tags))
        if t.get("natural") == "tree" or any(k in t for k in NODE_KEYS):
            self.el.append({"type": "node", "id": n.id, "lat": lat, "lon": lon, "tags": t})

    def way(self, w):
        tg = w.tags
        hw, rw = tg.get("highway"), tg.get("railway")
        if not hw and rw not in ("rail", "light_rail", "tram"): return
        try:
            geom = [{"lat": nd.location.lat, "lon": nd.location.lon} for nd in w.nodes]
        except osmium.InvalidLocationError:
            return
        if not any(inb(g["lat"], g["lon"]) for g in geom): return
        self.el.append({"type": "way", "id": w.id, "nodes": [nd.ref for nd in w.nodes], "geometry": geom, "tags": {x.k: x.v for x in tg}})

    def area(self, a):
        tg = a.tags
        if not any(k in tg for k in AREA_KEYS) and not (tg.get("highway") == "pedestrian") and tg.get("railway") != "platform": return
        t = {x.k: x.v for x in tg}
        try:
            for outer in a.outer_rings():
                geom = [{"lat": nd.lat, "lon": nd.lon} for nd in outer]
                if len(geom) < 4 or not any(inb(g["lat"], g["lon"]) for g in geom): continue
                tt = dict(t)
                if tt.get("highway") == "pedestrian": tt["area"] = "yes"
                self.el.append({"type": "way", "id": a.id * 10, "area_src": True, "geometry": geom, "tags": tt})
        except osmium.InvalidLocationError:
            return


h = H()
h.apply_file(sys.argv[1], locations=True, idx="sparse_mem_array")
# Straßen-Wege, die zugleich Flächen sind (highway=pedestrian + area), nicht doppelt als Linie führen
json.dump({"elements": h.el}, open(sys.argv[2], "w", encoding="utf-8"))
print("elements", len(h.el))
