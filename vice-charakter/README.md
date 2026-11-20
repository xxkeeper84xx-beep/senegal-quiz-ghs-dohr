# Vice-Charakter – 3D-Charakter im Miami-Sunset-Look

Eigenständige Three.js-Szene (r160): PBR-Materialien, weiche Schatten, HDRI-Reflexionen,
Bloom, ACES Filmic Tone Mapping, Tiefenunschärfe, Vignette und Orbit-Kamera.

## Starten
Die Seite lädt ES-Module und Dateien per `fetch`, darum braucht sie einen lokalen Webserver
(ein Doppelklick auf `index.html` reicht nicht):

```bash
cd vice-charakter
python3 -m http.server 8080      # oder: npx serve .
# dann http://localhost:8080 öffnen
```

## Eigene Dateien
| Datei | Pflicht | Wofür |
|---|---|---|
| `character.glb` | nein (sonst Platzhalter) | Dein Charakter als glTF-Binary, gern mit Animation „Idle“ |
| `sunset.hdr` | nein (sonst prozeduraler Sonnenuntergang) | Eigene HDRI für Reflexionen und Hintergrund |

Pfade und alle Stellschrauben (Licht, Bloom, Unschärfe, Kamera) stehen oben in `main.js` im `CONFIG`-Objekt.
Materialien werden anhand ihrer Namen erkannt (`skin`, `hair`, `eye`, `shirt`, `jeans` …) und automatisch verbessert.

## Abhängigkeiten
Keine Installation nötig: Three.js 0.160.0 kommt per Import-Map vom CDN (jsDelivr).
Für ein Bundler-Projekt (Vite o. Ä.): `npm install three@0.160.0` und die Import-Map entfernen.
