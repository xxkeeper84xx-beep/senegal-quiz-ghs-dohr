# Stand: echte Karte Mönchengladbach (Auftrag aus `CLAUDE_AUFTRAG.md`)

Stand 20.11.2026. Die echte Karte ist als **Vorschau** spielbar (`echt.html`, Startmenü → „Echte Karte Rheydt“).
Die bisherige verdichtete Spielkarte bleibt das Hauptspiel, bis alle Missionen umgezogen sind.

## Erledigt
- **Noah** ist die Spielfigur (`figuren/Noah_Pythagoras.*`, optimiert von 8,7 MB auf 2,9 MB; 43 000 Dreiecke).
  Idle/Walk/Run mit Überblendung, Blick in Laufrichtung, Füße am Boden (Standfuß beim Gehen 0 cm, beim Laufen 0,2–0,4 cm pro Bild).
- **Konverter** `tools/realkarte.py` (pyproj, shapely) erzeugt `mg-echt.js` für den Phase-1-Ausschnitt
  X −1350…1250, Z −950…1350 (beide Schulen, Rheydt Markt, Rheydt Hbf). Projektion EPSG:4326 → EPSG:25832,
  Ursprung Ost 322000 / Nord 5671000; geprüft: Marker Torfbend ergibt X 832,98 / Z 412,56 wie in `orte.geojson`.
- **Straßen und Wege** aus `wegenetz.json`, verbunden über gemeinsame OSM-Knoten (2448 Wege, 7429 Knoten);
  Breite aus `width`, sonst `lanes` × 3,2 m, sonst Standard je Straßentyp; Einbahn, Brücke, Tunnel, Belag übernommen.
- **Gebäude**: 10 338 OSM-Grundrisse; davon 6201 mit echter Höhe aus den amtlichen LoD2-Modellen
  (pro Gebäudebox höchster minus tiefster Punkt), 4127 mit angenommener Standardhöhe (`d:1` in den Daten).
- **Flächen, Gewässer, Gleise**, 13 **Schulgrundstücke** (Regel „Nicht auf dem Schulgelände fahren“ nutzt die echten Grundstücke),
  **Stadtteilnamen** aus den amtlichen Grenzen, **Startpunkt** auf dem Gehweg vor der Schule Am Torfbend.
- **Quellenangabe** © OpenStreetMap-Mitwirkende (ODbL) mit Lizenzlink im Startbildschirm und in der Kartenansicht.

## Testergebnisse (Playwright, Software-Rendering – kein echtes iPad)
| Ort | Straße/Stadtteil im Spiel | Dreiecke pro Bild | Zeichenaufrufe |
|---|---|---|---|
| Start Torfbend | Am Torfbend · Mülfort | ca. 926 000 | 344 |
| Rheydt Markt | Hauptstraße · Rheydt | ca. 978 000 | 731 |
| Rheydt Hbf | Vierhausstraße · Rheydt | ca. 916 000 | 263 |
| Haupthaus Altenbroicher Str. | Mülfort, liegt auf Schulgrundstück | – | – |

Ladezeit der Welt im Test: ca. 2 s. Ohne Begrenzung der Bäume waren es über 3 Mio. Dreiecke; jetzt höchstens 1200 Bäume auf Tablets.
**Nicht getestet:** echtes Schul-iPad (Bildrate, Speicher, Touch). Das muss vor dem Einsatz im Unterricht passieren.

## Noch offen (nächste Schritte)
1. **Gelände**: Höhenraster (bis 26 m Unterschied im Ausschnitt) ist noch nicht eingebaut; die Welt ist flach.
   Die Engine braucht dafür Bodenhöhen für Straßen, Kollision, Fahrzeuge und Gebäudesockel.
2. **LoD2-Meshes** als Gebäudeform statt extrudierter Grundrisse (aktuell nur ihre Höhen genutzt), mit Detailstufen.
3. **Inhalte umziehen**: Schulmodell (aus den Fotos) auf das echte Grundstück Am Torfbend setzen und ausrichten,
   Hauptmissionen, Läden, Dreiecksjagd, Enten und Geheimnisse an echte Orte verlegen; Werkhof-Mission ist fiktiv und braucht einen Ersatz.
4. **Drei Startmissionen** (Schulhof-Diagonale, Markt mit zwei rechtwinkligen Strecken, Modellaufgabe am Bahnhof) mit getrennten
   Werten für „vor Ort gemessen“ und „vereinfachte Aufgabenwerte“.
5. **Freischalten** der Phasen 2–5 mit Punkt-in-Polygon auf `grenzen/freischaltgebiete.geojson`, Sperren am Übergang,
   Speicherung im Spielstand, keine doppelten Belohnungen.
6. **Kacheln nachladen** statt eines festen Ausschnitts; weiter entfernte Geometrie vereinfachen.
7. **Fassaden der Schule**: Für den Standort Torfbend liegen Fotos vor. Für das **Haupthaus Altenbroicher Straße 50–52** fehlen
   Referenzfotos (Fenster, Eingänge, Schilder, Hof).
