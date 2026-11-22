# Trailer „Pythagoras City“
`Pythagoras_City_Trailer.mp4` – 48 s, 1280×720, 24 fps. Titelmelodie „Rheydt bei Nacht“ (`titelmusik.mp3`, geliefert). Alle Bilder stammen aus dem laufenden Spiel.

- `musik.py` erzeugt die Musik (eigener Synthwave-Track, 100 BPM, rein synthetisch, keine fremden Samples).
- `szenen.js` + `overlay.css`: Kamerafahrten, Einblendungen und Logo; `aufnahme.js` nimmt Bild für Bild mit Playwright auf.
- `schnitt.sh` setzt Bilder und Musik mit ffmpeg zusammen (warmer Farblook, Vignette, Kinobalken bis zum Logo).
