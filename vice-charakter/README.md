# Vice-Charakter – 3D-Charakter in zwei Stimmungen

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

Zwei Stimmungen (Knöpfe oben rechts, Taste L oder `?mood=neon` in der Adresse):
- **Sonnenuntergang:** Gegenlicht-Sonne, Küstendunst, Skyline-Silhouette, warme Farbkorrektur
- **Neon-Nacht:** Club-Terrasse mit LED-umwickelten Palmen, Lichterketten, Neonröhren, magentafarbenem Hauptlicht

Licht, Nebel, Bloom, Unschärfe, Farbkorrektur und Kulisse jeder Stimmung stehen in `moods.js`. Pfade und Kamera stehen oben in `main.js` im `CONFIG`-Objekt.
Materialien veredelt `characterMaterials.js` (Haut mit Streuungs-Shader, Augen, Haare, Stoff, Denim, Leder, Metall) anhand der Material- oder Mesh-Namen (`skin`, `eye`, `hair`, `jeans`, `leather` …). Die Werte stehen dort im `LOOK`-Objekt, die Namensmuster in `MATCH`.

## Abhängigkeiten
Keine Installation nötig: Three.js 0.160.0 kommt per Import-Map vom CDN (jsDelivr).
Für ein Bundler-Projekt (Vite o. Ä.): `npm install three@0.160.0` und die Import-Map entfernen.
