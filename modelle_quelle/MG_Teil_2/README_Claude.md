# Pythagoras City · 3D-Modelle für Mönchengladbach

Das Paket enthält 14 eigenständige GLB-Dateien. Texturen und Materialien sind in den jeweiligen Dateien eingebettet. Die GLBs wurden in Blender importiert. Das Paket ist für den Einbau in das bestehende Browser-Spiel vorbereitet. Der Test mit der Spielszene auf einem Schul-iPad steht aus.

## Die Karten

| GLB | Abdeckung und Zweck |
|---|---|
| Moenchengladbach_Stadtkarte_3D.glb | 18 × 19 km, gesamtes Stadtgebiet mit Umgebung. 3D-Höhengelände mit amtlichem Luftbild für die Stadtübersicht. |
| Rheydt_Dohr_Detailkarte_3D.glb | 4 × 4 km mit Rheydt, Dohr, Luftbild-Gelände und 16 amtlichen LoD2-Gebäudekacheln als getrennte Knoten. Detaillierte Gesamtansicht. |
| Dohr_Schulumfeld_3D.glb | 700 × 1.120 m rund um Torfbend und Haupthaus mit einem feineren Luftbild, Höhenraster und amtlichen Gebäudeformen. Kleinste detailreiche Startszene. |

Die Kartenmodelle sind eigenständige Ansichten. Überlappende Karten sollten als Alternativen verwendet werden, damit nicht zwei Bodenflächen exakt übereinander liegen. Die große Rheydt-Detailkarte enthält rund eine Million Dreiecke und ist für eine Übersicht oder weitere Aufteilung gedacht. Für den ersten iPad-Test mit einer spielbaren Szene bietet sich die kleinere Schulkarte an. Straßen sind bereits im Luftbild sichtbar. Fahrlogik, Kollisionen, Navigationsdaten und Freischaltungen werden vom bestehenden Spiel bereitgestellt. Der Kartenimport ersetzt diese Systeme nicht.

## Koordinaten und Gebäude

Alle Karten nutzen denselben Ursprung wie das bestehende Kartenpaket in Metern, EPSG:25832, 322000 m Ost, 5671000 m Nord und 45 m NHN. Achsen in GLB sind X = Ost, Y = oben und Z = Süd. Die Karten direkt auf (0, 0, 0) importieren. Keine zusätzliche Zentrierung oder Skalierung anwenden.

Die Einzelgebäude GHS Dohr Torfbend, GHS Dohr Haupthaus, Hauptkirche Rheydt, Schloss Rheydt, Borussia-Park und Mönchengladbach Hauptbahnhof haben jeweils einen eigenen Ursprung an der Unterkante. Ihre exakten Platzierungen in der Spielwelt stehen in Koordinaten.json. Die Kartengebäude und einzeln platzierten Gebäude können sich überdecken. Ersetze beim Einbau das jeweilige Gebäude oder verwende den Einzelbau in einer Szene ohne den doppelten Kartenausschnitt. Platzierungsdaten für gestaltete Gebäude wie den Eckladen und das Reihenhaus sind frei wählbar.

Die amtlichen Modelle liefern Grundformen und Dachgeometrie. Die Dachfarben beruhen auf den amtlichen Luftbildern. Die Fassaden sind für das Spiel gestaltet. Fensterpositionen und Fassadendetails sind angenähert. Der Eckladen und das Klinker-Reihenhaus sind gestalterische Spielmodelle für Straßennähe.

## Fahrzeuge

SUV, Limousine und Stadtauto sind eigene Varianten eines gemeinsamen Fahrzeugaufbaus. Der Ursprung liegt auf Höhe der Straße. Die Fahrzeugfront zeigt in +Z. Die vier Radknoten Rad_Vorne_L, Rad_Vorne_R, Rad_Hinten_L und Rad_Hinten_R sind einzeln ansteuerbar. Für Lenken die lokalen Y-Achsen der vorderen Radknoten verwenden. Zum Rollen die Kinder mit der Endung _Mesh um ihre lokale X-Achse drehen. Die Materialnamen Lack, Glas, Reifen und Chrom sind enthalten.

## Quellen

- Land Nordrhein-Westfalen, Bezirksregierung Köln, Geobasis NRW. Digitale Orthophotos, DGM und 3D-Gebäudemodelle LoD2. Datenlizenz Deutschland Zero 2.0.
- Orthophoto-Dienst: https://www.wms.nrw.de/geobasis/wms_nw_dop
- Amtliche Gebäude: https://www.opengeodata.nrw.de/produkte/geobasis/3dg/lod2_gml/lod2_gml/
- Lizenz: https://www.govdata.de/dl-de/zero-2-0
- Für die Auswahl einzelner Bauwerke und Schulgelände wurden räumliche Referenzen aus dem bestehenden Kartenpaket genutzt, © OpenStreetMap-Mitwirkende, https://www.openstreetmap.org/copyright. Die routbaren OSM-Straßendaten bleiben im ursprünglichen Kartenpaket.
