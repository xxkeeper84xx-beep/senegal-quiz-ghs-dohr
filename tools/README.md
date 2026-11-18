# Kartendaten für Pythagoras City (Mönchengladbach)

Erzeugt `mg-data.js` aus OpenStreetMap-Daten (© OpenStreetMap-Mitwirkende, ODbL).

```
pip install osmium
curl -L -o dus.osm.pbf https://download.geofabrik.de/europe/germany/nordrhein-westfalen/duesseldorf-regbez-latest.osm.pbf
python3 tools/pbf2json.py dus.osm.pbf mg.json
python3 tools/process.py mg.json mg-data.js
```
