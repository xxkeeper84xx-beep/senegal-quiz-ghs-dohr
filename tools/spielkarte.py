"""Erzeugt die verdichtete Spielkarte von Mönchengladbach für Pythagoras City.
Spielkarte – Wege und Entfernungen vereinfacht. Ortsnamen sind echt, Lage und Maße sind Spielmodell.
Aufruf: python3 tools/spielkarte.py mg-data.js
Koordinaten in Metern: x nach Osten, y nach Süden."""
import json, math, random, sys

random.seed(7)
HX, HY = 520, 480
nodes, idx, roads, buildings, areas, rails, trees, pois = [], {}, [], [], [], [], [], []
raw_roads = []


def road(name, pts, h="residential", w=7, car=1, oneway=0):
    raw_roads.append({"n": name, "p": [tuple(p) for p in pts], "h": h, "w": w, "c": car, "o": oneway})


def box(x0, y0, x1, y1, h, t="yes", n=None, c=None, k=None, rc=None, m=0):
    b = {"p": [x0, y0, x1, y0, x1, y1, x0, y1], "h": h, "m": m, "t": t}
    if n: b["n"] = n
    if c: b["c"] = c
    if k: b["k"] = k
    if rc: b["rc"] = rc
    buildings.append(b)
    return b


def poly(pts, h, t="yes", n=None, c=None, k=None, rc=None):
    b = {"p": [v for p in pts for v in p], "h": h, "m": 0, "t": t}
    if n: b["n"] = n
    if c: b["c"] = c
    if k: b["k"] = k
    if rc: b["rc"] = rc
    buildings.append(b)


def area(t, x0, y0, x1, y1, n=None, **kw):
    a = {"t": t, "p": [x0, y0, x1, y0, x1, y1, x0, y1]}
    if n: a["n"] = n
    a.update(kw)
    areas.append(a)


HOUSE_COLS = ["#efe8da", "#e2d5bd", "#d6c4a6", "#f3efe6", "#d9d2c4", "#e6d9b8", "#b5674c", "#a85a43", "#cfc1ad"]


def houses_x(xa, xb, y0, y1, step=14, w=10, t="house", hmin=7, hmax=9.5, skip=()):
    x = xa
    while x + w <= xb + 0.01:
        if not any(s0 - 1 < x + w and x < s1 + 1 for s0, s1 in skip):
            c = random.choice(HOUSE_COLS)
            box(x, y0, x + w, y1, round(random.uniform(hmin, hmax), 1), t, c=c, k="brick" if c in ("#b5674c", "#a85a43") else None,
                rc=random.choice(["#7a3b2a", "#8a4a35", "#5a5d63"]))
        x += step


def houses_y(ya, yb, x0, x1, step=14, w=10, **kw):
    y = ya
    t = kw.get("t", "house"); hmin = kw.get("hmin", 7); hmax = kw.get("hmax", 9.5)
    while y + w <= yb + 0.01:
        c = random.choice(HOUSE_COLS)
        box(x0, y, x1, y + w, round(random.uniform(hmin, hmax), 1), t, c=c, k="brick" if c in ("#b5674c", "#a85a43") else None,
            rc=random.choice(["#7a3b2a", "#8a4a35", "#5a5d63"]))
        y += step


# ------------------------------------------------------------------ Dohr / Torfbend (Startgebiet)
road("Am Torfbend", [(-420, -50), (-340, -50), (-250, -50), (-100, -50)])
road("Dohrer Straße", [(-460, 40), (-420, 40), (-250, 40), (-100, 40), (120, 40)], "tertiary", 9)
road("Schrofweg", [(-420, -50), (-420, 40)])
road("Am Rottland", [(-100, -50), (-100, 40)])
road("Buschweiher", [(-340, -50), (-340, -118)])
road("Werkhof-Durchgang", [(-250, -50), (-250, 40)], "footway", 4, car=0)
# Werkhof: ummauerter Hof mit Halle; Tor im Süden bleibt zu, bis der Auftrag gelöst ist
W = 1.6
box(-292, -41, -254.5, -41 + W, 3, "wall", c="#9a9388", k="plain")          # Nordmauer West
box(-245.5, -41, -213, -41 + W, 3, "wall", c="#9a9388", k="plain")          # Nordmauer Ost
box(-292, 30, -253, 30 + W, 3, "wall", c="#9a9388", k="plain")              # Südmauer West
box(-247, 30, -213, 30 + W, 3, "wall", c="#9a9388", k="plain")              # Südmauer Ost
box(-292, -41, -292 + W, 31.6, 3, "wall", c="#9a9388", k="plain")           # Westmauer
box(-214.6, -41, -213, 31.6, 3, "wall", c="#9a9388", k="plain")             # Ostmauer
box(-288, -32, -262, 12, 8, "industrial", n="Werkhof Dohr", c="#c9c6bf", k="plain", rc="#5e6064")
box(-238, -4, -220, 22, 4.5, "industrial", c="#b9b4a8", k="plain", rc="#6b6d70")
area("plaza", -290.4, -39.4, -214.6, 30, None)
box(-333, -60.5, -327, -58.6, 2.6, "roof", n="Haltestelle Am Torfbend", c="#4a7fa8", k="plain")
# GHS Dohr · Standort Torfbend: Schulgelände nördlich der Straße (Gebäude als Detailmodell im Spiel, hier nur Kollision)
SCHOOL = {"label": "GHS Dohr · Standort Torfbend",
          "wings": [{"r": [-318, -84, -262, -70], "f": 3, "win": "ns"}, {"r": [-318, -114, -304, -84], "f": 2, "win": "ew"},
                    {"r": [-262, -86, -238, -70], "f": 1, "hall": 1}],
          "door": [-250, -70], "sign": [-268.5, -61.9]}
for wg in SCHOOL["wings"]:
    x0, y0, x1, y1 = wg["r"]
    buildings.append({"p": [x0, y0, x1, y0, x1, y1, x0, y1], "h": wg["f"] * 3.4 + .8, "m": 0, "t": "school", "x": 1})
area("plaza", -326, -128, -200, -63.4, "Schulhof")
box(-226, -124, -204, -94, 8, "school", n="Sporthalle Am Torfbend", c="#d8d2c4", k="plain", rc="#6b6d70")
F = .22
area("grass", -326, -69.6, -264, -63.7, "Grünstreifen"); area("grass", -236, -69.6, -200, -63.7)
for tx in (-314, -300, -286, -272, -228, -212): trees.extend([tx, -66.6])
SIGNS = [{"x": -296, "y": -56.4, "k": "zone30"}, {"x": -246.6, "y": -56.4, "k": "zebra"}]
DECALS = [{"x": -292, "y": -48.3, "t": "30", "a": 1.5708}]
for fx0, fy0, fx1, fy1 in [(-326, -63.4, -264, -63.4 + F), (-236, -63.4, -200, -63.4 + F), (-326, -128, -326 + F, -63.4),
                           (-200 - F, -128, -200, -63.4), (-326, -128, -200, -128 + F)]:
    box(fx0, fy0, fx1, fy1, 1.7, "fence", k="fence", c="#5d646b")
houses_x(-365, -112, -74, -62, skip=[(-346, -196)])                           # Am Torfbend Nordseite
houses_x(-410, -300, -38, -28)                                                # Am Torfbend Südseite (West)
houses_x(-410, -300, 18, 28)                                                  # Dohrer Straße Nordseite (West)
houses_x(-450, 96, 52, 62, skip=[(-104, -96)])                                # Dohrer Straße Südseite
houses_x(-88, 100, 16, 28, step=24, w=20, t="apartments", hmin=10.5, hmax=13)  # Mehrfamilienhäuser Richtung Rheydter Straße
houses_y(-112, -66, -360, -350)
area("park", -205, -41, -110, 31, "Grünanlage Am Rottland", quest=1)
area("pitch", -175, -20, -150, 5, "Spielplatz Am Rottland")
# Hecken vor den Vorgärten
for x in range(-410, -300, 14):
    box(x, -42.7, x + 6.4, -41.9, 1.2, "hedge", k="hedge"); box(x, 14.2, x + 6.4, 15, 1.2, "hedge", k="hedge")
for x in range(-450, 90, 14):
    if abs(x + 100) > 12: box(x, 48.7, x + 6.4, 49.5, 1.2, "hedge", k="hedge")
for x in range(-196, -112, 14):
    box(x, -58.8, x + 6.4, -58, 1.2, "hedge", k="hedge")
PARKED = [[-385, -47.6, 0, "#2d5fa8"], [-378, -47.6, 0, "#d9d4c6"], [-234.5, -52.4, 3.1416, "#6b6f78"], [-227.5, -52.4, 3.1416, "#b8262e"], [-262, -47.6, 0, "#1d3a5f"], [-150, -47.6, 0, "#8a8f96"],
          [-204, 43.2, 0, "#2b2f3d"], [-197.5, 43.2, 0, "#e8eaf2"], [-60, 36.8, 3.1416, "#3f7f4f"], [60, 43.2, 0, "#c9952e"]]
ZEBRA = [{"x": -250, "y": -50, "w": 7, "dir": "x"}, {"x": 120, "y": 222, "w": 10, "dir": "y"}]

# ------------------------------------------------------------------ Achse Gladbach – Rheydt
road("Rheydter Straße", [(120, -330), (120, -150), (120, 40)], "secondary", 10)
road("Gartenstraße", [(120, 40), (120, 150), (120, 230)], "secondary", 10)
houses_y(-290, -175, 96, 110, step=24, w=18, t="apartments", hmin=11, hmax=14)
houses_y(-290, -175, 130, 144, step=24, w=18, t="apartments", hmin=11, hmax=14)
houses_y(-120, 5, 130, 144, step=24, w=18, t="apartments", hmin=11, hmax=14)
houses_y(-120, 5, 96, 110, step=24, w=18, t="apartments", hmin=11, hmax=14)
houses_y(75, 135, 96, 110, step=22, w=16, t="apartments", hmin=11, hmax=14)
houses_y(165, 205, 96, 110, step=22, w=16, t="apartments", hmin=11, hmax=14)
houses_y(165, 205, 130, 144, step=22, w=16, t="apartments", hmin=11, hmax=14)
box(134, 52, 168, 74, 7, "retail", n="Autohaus Gartenstraße", c="#e8eef2", k="glass", rc="#5e6064")
# Bahndamm mit Lärmschutzwand trennt Nord und Süd; Durchlass nur an der Rheydter Straße
box(-520, -152, 112, -150.4, 3.2, "wall", c="#7f8a7c", k="plain")
box(128, -152, 520, -150.4, 3.2, "wall", c="#7f8a7c", k="plain")
rails.append([-520, -146, 112, -146]); rails.append([128, -146, 520, -146])
rails.append([-520, -142, 112, -142]); rails.append([128, -142, 520, -142])
area("rail", -520, -150, 112, -138); area("rail", 128, -150, 520, -138)

# ------------------------------------------------------------------ Rheydt: Marktplatz
road("Limitenstraße", [(40, 200), (40, 230), (40, 410)])
road("Stresemannstraße", [(200, 200), (200, 230), (200, 410)])
road("Markt", [(40, 230), (120, 230), (200, 230)], "pedestrian", 8, car=0)
road("Hauptstraße", [(10, 410), (40, 410), (200, 410), (300, 410)], "pedestrian", 9, car=0)
area("plaza", 46, 236, 194, 404, "Marktplatz Rheydt")
box(166, 262, 190, 308, 15, "civic", c="#e9e2d0", rc="#7a3b2a")
box(161, 308, 190, 332, 26, "civic", n="Rathaus Rheydt", c="#efe8d6", rc="#5a5d63")
box(166, 332, 190, 378, 15, "civic", c="#e9e2d0", rc="#7a3b2a")
box(52, 292, 80, 352, 22, "church", n="Ev. Hauptkirche Rheydt", c="#b9ad98", rc="#4e5257")
box(57, 276, 75, 292, 44, "church", c="#b3a58f", rc="#3f4347")
houses_x(46, 108, 208, 222, step=22, w=18, t="retail", hmin=12, hmax=15)
houses_x(132, 194, 208, 222, step=22, w=18, t="retail", hmin=12, hmax=15)
houses_x(46, 194, 420, 434, step=22, w=18, t="retail", hmin=12, hmax=15)
houses_y(240, 400, 12, 28, step=24, w=20, t="apartments", hmin=12, hmax=15)
houses_y(240, 400, 212, 228, step=24, w=20, t="apartments", hmin=12, hmax=15)
houses_x(212, 296, 420, 434, step=22, w=18, t="retail", hmin=11, hmax=14)
houses_x(212, 296, 388, 402, step=22, w=18, t="retail", hmin=11, hmax=14)

# ------------------------------------------------------------------ Schloss Rheydt (Bonusbereich)
road("Schloßstraße", [(120, 150), (300, 150), (345, 150)])
road("Schlossbrücke", [(345, 150), (383, 150)], "footway", 5, car=0)
area("park", 300, 70, 505, 250, "Schlosspark Rheydt")
area("water", 352, 102, 448, 121, "Schlossgraben"); area("water", 352, 179, 448, 198)
area("water", 352, 121, 371, 179); area("water", 429, 121, 448, 179)
area("plaza", 371, 121, 429, 179)
box(390, 126, 426, 142, 12, "castle", n="Schloss Rheydt", c="#dccfae", rc="#7a3b2a")
box(413, 142, 426, 174, 10, "castle", c="#d6c8a4", rc="#7a3b2a")
box(390, 118.5, 398, 126, 17, "castle", c="#cfc09a", rc="#4e5257")

# ------------------------------------------------------------------ Gladbacher Innenstadt
road("Abteistraße", [(20, -330), (120, -330), (220, -330)])
road("Bismarckstraße", [(220, -330), (400, -330), (400, -350)])
road("Alter Markt", [(120, -330), (120, -385)], "pedestrian", 8, car=0)
road("Hindenburgstraße", [(120, -385), (250, -385), (400, -385)], "pedestrian", 10, car=0)
road("Waldhausener Straße", [(120, -385), (62, -432), (20, -446)], "pedestrian", 5, car=0)
area("plaza", 70, -422, 152, -348, "Alter Markt")
box(26, -378, 62, -352, 24, "church", n="Münster St. Vitus", c="#a99c86", rc="#4e5257")
box(12, -374, 26, -356, 46, "church", c="#a39680", rc="#3f4347")
box(30, -350, 60, -338, 11, "civic", n="Rathaus Abtei", c="#e6dcc6", rc="#7a3b2a")
houses_x(74, 150, -440, -426, step=20, w=17, t="retail", hmin=12, hmax=15)
houses_x(160, 392, -411, -395, step=24, w=21, t="retail", hmin=14, hmax=19)
houses_x(132, 246, -375, -360, step=24, w=21, t="retail", hmin=14, hmax=19)
box(252, -375, 312, -344, 18, "retail", n="Minto", c="#e9edf0", k="glass", rc="#5e6064")
houses_x(320, 390, -375, -360, step=24, w=21, t="retail", hmin=14, hmax=19)
box(412, -412, 452, -358, 14, "train_station", n="Mönchengladbach Hbf", c="#d9cdb4", rc="#5e6064")
area("plaza", 392, -412, 412, -352, "Europaplatz")
rails.append([462, -470, 462, -152]); rails.append([468, -470, 468, -152])
area("rail", 455, -470, 475, -152)
houses_x(140, 380, -318, -304, step=26, w=22, t="apartments", hmin=13, hmax=16)

# ------------------------------------------------------------------ Nordpark
road("Aachener Straße", [(20, -330), (-200, -330)], "primary", 11)
road("Hennes-Weisweiler-Allee", [(-200, -330), (-262, -330)], "primary", 12)
road("Am Nordpark", [(-262, -330), (-262, -420), (-440, -420), (-440, -240), (-262, -240), (-262, -330)], "tertiary", 9)
area("grass", -490, -465, -215, -195, "Nordpark")
area("pitch", -386, -352, -314, -308, "Spielfeld")
cx, cy, RX, RY, rx, ry, NSEG = -350, -330, 64, 52, 46, 34, 20
for i in range(NSEG):
    if i in (0,):  # Eingang zum Vorplatz an der Hennes-Weisweiler-Allee
        continue
    a0, a1 = (i - .5) / NSEG * 2 * math.pi + .012, (i + .5) / NSEG * 2 * math.pi - .012
    pts = [(cx + RX * math.cos(a0), cy + RY * math.sin(a0)), (cx + RX * math.cos(a1), cy + RY * math.sin(a1)),
           (cx + rx * math.cos(a1), cy + ry * math.sin(a1)), (cx + rx * math.cos(a0), cy + ry * math.sin(a0))]
    poly([(round(x, 1), round(y, 1)) for x, y in pts], 21, "stadium", n="BORUSSIA-PARK" if i == 10 else None,
         c="#1f7a3a" if i % 2 else "#f2f2f2", k="plain", rc="#d9dde0")
houses_x(-180, -20, -318, -304, step=28, w=22, t="apartments", hmin=12, hmax=15)
houses_x(-180, -20, -356, -342, step=28, w=22, t="apartments", hmin=12, hmax=15)
# Geplante Verbindung Dohr – Nordpark: Tor in der Lärmschutzwand bleibt noch geschlossen
area("rail", -424, -236, -416, -54, "Verbindungsweg (im Bau)")

# ------------------------------------------------------------------ Bäume an Straßen und Plätzen
for x in list(range(-400, -332, 28)) + list(range(-190, -110, 28)):
    trees.extend([x, -56.5])
for y in range(-300, 30, 30):
    if abs(y + 150) > 14: trees.extend([113.5, y + 9])
for x, y in [(60, 250), (60, 390), (180, 250), (180, 390), (100, 395), (140, 395), (84, -355), (140, -355), (84, -415), (140, -415)]:
    trees.extend([x, y])
for x in range(-250, -205, 15):
    trees.extend([x, -322]); trees.extend([x, -338])

# ------------------------------------------------------------------ Straßennetz: gemeinsame Knoten an Einmündungen
def on_seg(p, a, b):
    (px, py), (ax, ay), (bx, by) = p, a, b
    cross = (bx - ax) * (py - ay) - (by - ay) * (px - ax)
    if abs(cross) > 1e-6: return False
    dot = (px - ax) * (bx - ax) + (py - ay) * (by - ay)
    return 1e-6 < dot < (bx - ax) ** 2 + (by - ay) ** 2 - 1e-6

allpts = {p for r in raw_roads for p in r["p"]}
for r in raw_roads:
    out = [r["p"][0]]
    for a, b in zip(r["p"], r["p"][1:]):
        ins = sorted([p for p in allpts if on_seg(p, a, b)], key=lambda p: (p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2)
        out.extend(ins); out.append(b)
    ids = []
    for p in out:
        if p not in idx:
            idx[p] = len(nodes) // 2; nodes.extend([p[0], p[1]])
        ids.append(idx[p])
    roads.append({"h": r["h"], "n": r["n"], "w": r["w"], "o": r["o"], "c": r["c"], "b": 0, "tu": 0, "i": ids})

data = {
    "origin": [51.17, 6.43], "half": [HX, HY], "nodes": nodes, "roads": roads, "buildings": buildings, "areas": areas,
    "rails": rails, "trees": trees, "pois": pois, "spielkarte": True, "school": SCHOOL, "parked": PARKED, "zebra": ZEBRA, "signs": SIGNS, "decals": DECALS,
    "start": [-243, -55.3, -2.2],
    "districts": [
        {"n": "Dohr/Torfbend", "b": [-505, -140, 62, 125], "hint": "Werkhof mit gelbem Tor"},
        {"n": "Rheydt", "b": [0, 190, 310, 470], "hint": "Rathausturm und Hauptkirche am Markt"},
        {"n": "Gladbacher Innenstadt", "b": [-5, -470, 505, -296], "hint": "Münsterturm am Alten Markt"},
        {"n": "Nordpark", "b": [-505, -470, -190, -180], "hint": "Stadion"},
        {"n": "Schloss Rheydt", "b": [292, 60, 510, 262], "hint": "Wasserschloss mit Graben"},
    ],
    "givers": {
        "fire": [100, -362, "Einsatzleitung am Alten Markt"], "tv": [282, -383, "Elektromarkt im Minto"],
        "taxi": [402, -372, "Taxistand am Hauptbahnhof"], "amt": [158, 320, "Rathaus Rheydt"],
        "park": [-198, -36, "Grünanlage Am Rottland"], "crane": [-272, -258, "Trainingsgelände am Nordpark"],
        "heli": [-300, -408, "Übungsplatz Nordpark"], "shop": [130, 63, "Gartenstraße"],
    },
    "q": {
        "werkhof": {"giver": [-246.5, -34], "wall": [-262, -8], "drum": [-254, -8], "gate": [-253, 30.8, -247, 30.8],
                    "lamps": [[-247, -22], [-247, 6], [-247, 36], [-262.5, -8]]},
        "markt": {"giver": [104, 294], "zone": [110, 300, 122, 309], "stalls": [[96, 268], [110, 268], [124, 268], [138, 268], [96, 340], [110, 340]],
                  "fixed": [[130, 372], [144, 372]]},
        "soon": [[100, -390, "Alter Markt", "Wie weit von der Wand?"], [-270, -322, "Nordpark", "Abspannung vor dem Spiel"], [362, 142, "Schloss Rheydt", "Bonus-Auftrag"]],
        "closed": [-420, -151.2, "Verbindung zum Nordpark: öffnet mit einem späteren Auftrag"],
    },
    "talk": [
        {"x": -322, "y": -56.2, "name": "Mats", "role": "wartet auf den Bus", "say": ["Neu hier? Am Werkhof gleich um die Ecke sucht Frau Yıldız jemanden, der rechnen kann.", "Wenn das Tor am Werkhof offen wäre, käme man viel schneller zur Dohrer Straße. So muss man außen herum."]},
        {"x": -160, "y": 8, "name": "Elif", "role": "auf dem Spielplatz", "say": ["Quer über die Wiese ist kürzer als außen herum. Warum eigentlich? Frag mal den Park-Kurier.", "Zum Rheydter Markt? Immer die Dohrer Straße runter und dann rechts in die Gartenstraße."]},
        {"x": 136, "y": 350, "name": "Herr Brands", "role": "Markthändler", "say": ["Frische Äpfel vom Niederrhein! Wenn der Marktmeister endlich die neuen Stände aufbauen lässt, wird es hier richtig voll.", "Vom Rathaus bis zur Hauptkirche sind es nur ein paar Schritte. Aber diagonal über den Platz ist noch kürzer."]},
        {"x": 92, "y": -372, "name": "Frau Okafor", "role": "Stadtführerin", "say": ["Der Turm da drüben gehört zum Münster St. Vitus. Den sieht man von fast überall in der Innenstadt.", "Die Hindenburgstraße führt vom Alten Markt hinunter zum Hauptbahnhof."]},
        {"x": -268, "y": -338, "name": "Tarik", "role": "Platzwart", "say": ["Heute ist kein Spiel. Aber bald bauen wir hier ein Veranstaltungszelt auf, dafür brauchen wir noch jemanden zum Rechnen."]},
    ],
}
s = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
open(sys.argv[1], "w", encoding="utf-8").write("const MG=" + s + ";\n")
print(f"roads {len(roads)} nodes {len(nodes)//2} buildings {len(buildings)} areas {len(areas)} size {len(s)/1000:.0f} kB")
