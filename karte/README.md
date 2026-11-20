# Mönchengladbach · Kartenpaket für die Pythagoras-Open-World

Entpacke das ZIP in das Spielprojekt. Gib Claude den beigefügten
`CLAUDE_AUFTRAG.md` und lass es mit `world.json` beginnen.

| Datei | Inhalt |
|---|---|
| `world.json` | Einstieg mit Koordinatenursprung, 216 Kartenkacheln, Gelände und Freischaltphasen |
| `grenzen/` | Stadtgrenze, 4 Bezirke, 44 Stadtteile und 5 Freischaltgebiete als GeoJSON |
| `kacheln/` | Straßen, Wege, Gleise, Gewässer, Gebäudeflächen, Orte und Flächennutzung als GeoJSON |
| `wegenetz.json` | Straßenzüge und Wegverbindungen mit OSM-Knoten in lokalen Metern |
| `orte.geojson` | Beide Schulstandorte, Rheydt Markt, Rheydt Hbf, Schloss Rheydt, Gladbach Hbf und Borussia-Park |
| `gelaende/` | Höhenraster in Metern über dem Spielnullpunkt, Auflösung 25 m für die Stadt und 5 m rund um Rheydt |
| `lod2_glb/` | Acht Geländeausschnitte mit amtlicher 3D-Gebäudegeometrie als GLB und einer Platzierungsliste |
| `tools/` | Helfer für Kartenkoordinaten, Höhensampling und die Umwandlung weiterer amtlicher CityGML-Kacheln |
| `QUELLEN.md` | Quellen und Lizenzhinweise |

Die Kartenkacheln decken das gesamte amtliche Stadtgebiet ab. Innerhalb der
mitgelieferten LoD2-Kacheln kommen echte amtliche Gebäudeformen und
Dachgeometrien hinzu. Für den Rest bietet der Kachelindex Links zu den
amtlichen CityGML-Dateien. Das Paket liefert die Geodaten und den
Einbauauftrag. Die Spielintegration und fotorealistische Fassaden
entstehen im nächsten Schritt im vorhandenen Spielprojekt.
