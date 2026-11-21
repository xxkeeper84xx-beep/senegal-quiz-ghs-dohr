# Silhouetten bekannter Mönchengladbacher Wahrzeichen (eigene, vereinfachte Zeichnungen) für Startbildschirm und Trailer.
# Ersetzen die früheren Palmen (es gibt keine Palmen in Mönchengladbach).
import urllib.parse
W = {
 # Münster St. Vitus: romanische Basilika, Westturm mit Pyramidendach, gotischer Chor mit hohen Fenstern
 "muenster": ("0 0 260 400", [
   "M150 400 V92 H204 V400 Z", "M146 94 L177 6 L208 94 Z", "M171 18 h12 v-14 h-12 z",
   "M18 400 V214 H150 V400 Z", "M14 216 L84 160 L154 216 Z",
   "M204 400 V250 H248 V400 Z", "M200 252 L226 214 L252 252 Z",
   "M30 400 V300 H40 V400 Z", "M60 400 V300 H70 V400 Z", "M90 400 V300 H100 V400 Z", "M120 400 V300 H130 V400 Z"]),
 # Wasserturm Viersener Straße: Backsteinschaft mit breitem Behälterkopf und Laterne
 "wasserturm": ("0 0 200 400", [
   "M76 400 L82 150 H118 L124 400 Z", "M42 150 V78 H158 V150 Z", "M36 80 Q100 30 164 80 Z",
   "M93 50 V30 H107 V50 Z", "M90 32 L100 16 L110 32 Z", "M60 400 V360 H140 V400 Z"]),
 # Schloss Rheydt: Renaissance-Wasserschloss mit Ecktürmen, Mittelturm und Wassergraben
 "schloss": ("0 0 400 260", [
   "M70 236 V118 H290 V236 Z", "M64 120 L90 82 H270 L296 120 Z",
   "M28 236 V104 H72 V236 Z", "M24 106 L50 52 L76 106 Z", "M288 236 V104 H332 V236 Z", "M284 106 L310 52 L336 106 Z",
   "M168 120 V56 H192 V120 Z", "M162 58 Q180 18 198 58 Z", "M177 30 h6 v-16 h-6 z",
   "M0 260 V236 H400 V260 Z"]),
 # Borussia-Park: Stadionschüssel mit geschwungenem Dach und Dachträgern
 "stadion": ("0 0 420 200", [
   "M0 200 L22 118 Q210 74 398 118 L420 200 Z", "M10 126 Q210 64 410 126 L410 132 Q210 72 10 132 Z",
   "M60 104 L66 82 H72 L70 104 Z", "M150 90 L154 66 H160 L160 90 Z", "M260 90 L260 66 H266 L270 90 Z", "M350 104 L348 82 H354 L360 104 Z"]),
 # Museum Abteiberg (Hans Hollein): Sheddächer und Turm des Verwaltungsbaus
 "abteiberg": ("0 0 320 220", [
   "M0 220 V150 H320 V220 Z", "M10 150 L10 112 L50 132 L50 112 L90 132 L90 112 L130 132 L130 112 L170 132 V150 Z",
   "M212 220 V36 H262 V220 Z", "M206 40 H268 V30 H206 Z", "M180 150 V118 H212 V150 Z"]),
 # Evangelische Hauptkirche Rheydt: schlanker neugotischer Turm mit Spitzhelm
 "hauptkirche": ("0 0 200 400", [
   "M84 400 V120 H116 V400 Z", "M80 122 L100 0 L120 122 Z", "M20 400 V250 H84 V400 Z", "M16 252 L50 210 L84 252 Z",
   "M116 400 V270 H176 V400 Z", "M112 272 L146 236 L180 272 Z"]),
}
def svg(name, fill="#12061f", op=1, flip=False):
    vb, paths = W[name]; w = vb.split()[2]
    tr = f' transform="translate({w} 0) scale(-1 1)"' if flip else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"><g fill="{fill}" fill-opacity="{op}"{tr}>' + "".join(f'<path d="{d}"/>' for d in paths) + '</g></svg>'
def url(name, fill="#12061f", op=1, flip=False):
    return 'url("data:image/svg+xml,' + urllib.parse.quote(svg(name, fill, op, flip), safe=' /=:"').replace('"', "'") + '")'
