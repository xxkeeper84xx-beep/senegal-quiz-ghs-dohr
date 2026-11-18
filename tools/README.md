# Kartendaten für Pythagoras City

`mg-data.js` enthält die Spielkarte, die `pythagoras-city.html` lädt.

## Spielkarte (aktuell im Spiel)

Verdichtete Spielversion von Mönchengladbach: echte Ortsnamen, Wege und Entfernungen vereinfacht.

```
python3 tools/spielkarte.py mg-data.js
```

In `spielkarte.py` stehen Straßen, Gebäude, Stadtteile, Auftragsorte, das Schulgelände der GHS Dohr und die Begegnungen.

## Maßstabsgetreue Innenstadt aus OpenStreetMap (nicht im Spiel aktiv)

`pbf2json.py` und `process.py` wandeln OpenStreetMap-Daten (© OpenStreetMap-Mitwirkende, ODbL) in dasselbe Datenformat um:

```
python3 tools/process.py export.json mg-data-osm.js     # Overpass-Export (out geom)
pip install osmium && python3 tools/pbf2json.py dus.osm.pbf mg.json   # oder Geofabrik-PBF
```
