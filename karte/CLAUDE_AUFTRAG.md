# Mönchengladbach als echte Geografie in die Pythagoras-Open-World einbauen

Arbeite im vorhandenen Spielprojekt mit den mitgelieferten Dateien. Noah bleibt
die Spielfigur. Integriere die Karte in die vorhandene Steuerung, Kamera,
Aufgabenlogik und Speicherung. Öffne im ersten Schritt Rheydt und beide
Schulstandorte. Die fünf Gebiete sind Vorschläge für den Spielfortschritt. Die
Grenzen der 44 Stadtteile stammen aus dem städtischen Datensatz.

## 1. Kartendaten laden und korrekt ausrichten

- Nutze `world.json` als Einstieg. Jede 1-km-Kachel enthält echte
  OpenStreetMap-Geometrien für das jeweilige Gebiet. Lade GeoJSON als
  Längengrad, Breitengrad, projiziere nach ETRS89 / UTM Zone 32N
  (EPSG:25832) und überführe in Meter der Spielwelt. Der feste Ursprung ist
  Ost 322000, Nord 5671000, Höhe 45 m NHN. Weltachsen: X = E − 322000,
  Y = H − 45, Z = 5671000 − N. In Three.js ist damit Y oben und −Z Norden.
  `tools/kartenfunktionen.mjs` zeigt Projektions- und Höhenfunktionen.
- Nutze das feinere Höhenraster im Startumfeld und das stadtweite Raster
  außerhalb. Lade das Raster anhand der Angaben in `world.json`. Lege
  Straßen und Flächen auf das Gelände. Behandle Brücken und Tunnel anhand
  von `bridge`, `tunnel` und `layer` separat. Nutze bekannte Höhen, sonst
  Annahmen, die im Debugmodus erkennbar bleiben.
- Stelle Straßen und Wege nach deren tatsächlichem Verlauf dar. Verwende
  Breite, Belag und Spurzahl aus den Daten, wenn verfügbar. Gleise,
  Gewässer und Flächennutzung bleiben auf ihren realen Positionen.
  `wegenetz.json` enthält die OSM-Knoten-IDs und Kartenkoordinaten für
  durchgehende Wege. Verbinde die Wege über gemeinsame OSM-Knoten, statt
  Kreuzungen allein aus sich schneidenden Linien abzuleiten. Gerenderte
  Linien können an Kachelgrenzen geteilt sein.
- Verwende für die enthaltenen LoD2-Kacheln `lod2_glb/index.json` und jede
  `translation_xyz_m` beim Einsetzen. Gelände, Gebäude und Straßen
  bleiben in den gemeinsamen Weltkoordinaten. Ersetze überlappende
  OSM-Gebäudemassen, damit keine zwei Gebäude übereinanderstehen.
  Die LoD2-Meshes enthalten Wände, Dächer und Grundflächen mit neutralen
  Materialien. Für weitere Kacheln steht die amtliche CityGML-Quelle im
  Kachelindex. Konvertiere bei Bedarf mit `tools/citygml_to_glb.py`.
- Extrudiere anfangs Grundrisse außerhalb der enthaltenen LoD2-Kacheln.
  Nutze `height` oder `building:levels` als vorhandene Höheninformationen und
  kennzeichne modellierte Standardhöhen in deinen Daten. Bewahre die
  untexturierte amtliche Geometrie als Referenz. Ergänze Schulfenster,
  Eingänge, Schilder und Hofdetails erst anhand geprüfter Referenzfotos.

## 2. Rheydt zuerst spielbar machen

- Starte Noah auf begehbarem Boden am GHS-Dohr-Standort Torfbend. Der
  Marker für Am Torfbend 17 benennt die Lage des Schulgeländes. Lege den
  tatsächlichen Startpunkt separat an den erreichbaren Gehweg vor der
  Schule. Das Haupthaus Altenbroicher Straße 50–52 ist ebenfalls ab
  Start erreichbar. Beide Schulgelände liegen laut Stadtteilgrenzen in
  Mülfort. Deshalb umfasst das Startgebiet Rheydt und angrenzende Teile.
- Baue zuerst den Schulbereich, Rheydt Markt und den Bereich am
  Hauptbahnhof. Setze die vorhandenen Stadtfiguren auf Gehwege und
  belebe Marktplatz, Haltestellen und Schulumfeld mit ihnen.
- Platziere drei kurze Startmissionen. Nutze am Schulhof die Diagonale
  eines Rechtecks, am Markt zwei rechtwinklige Strecken und beim Bahnhof
  eine geometrische Modellaufgabe. Stimmen reale Abstände für den
  Unterricht nicht mit ganzen Zahlen überein, unterscheide vor Ort
  gemessene Entfernungen von vereinfachten Aufgabenwerten. Halte den
  realen Straßenverlauf und die Position der Gebäude unverändert.

## 3. Freischalten und Fortschritt speichern

- Phase 1 ist sofort frei. Die weiteren Phasen folgen auf die in
  `world.json` und `grenzen/freischaltgebiete.geojson` angegebenen
  Missionsereignisse. Jede spätere Phase erfordert auch alle vorigen Phasen.
  Reihenfolge: Rheydt mit Schulumfeld, Rheydter Süden, Gladbach und
  Innenstadt, Nord und Ost, West.
- Verwende die tatsächlichen Freischaltpolygone für den Zugang. Eine
  1-km-Kachel kann mehrere Phasen schneiden. Nutze ihre Phasenliste fürs
  Laden und prüfe die Zugangsgrenze mit Punkt-in-Polygon. Berücksichtige
  GeoJSON-MultiPolygons und Löcher. Zeige gesperrte Gebiete auf der Karte
  und blockiere den Zugang am nächsten nachvollziehbaren Übergang.
- Speichere abgeschlossene Missionen und Freischaltungen zusammen mit
  dem Spielstand. Ein erneutes Abschließen einer Mission soll keine
  doppelten Belohnungen erzeugen. Bestehende Spielstände sollen weiter
  laden können.
- Halte an Kreuzungen und Kachelgrenzen Kollisionen und Oberflächen
  konsistent. Lade nur benötigte Kacheln, verwende weiter entfernte
  vereinfachte Geometrie und prüfe ein echtes Schul-iPad, bevor du mehr
  Modelle gleichzeitig einblendest.

## Abnahme

1. Neue Spielstände starten am Torfbend. Beide Schulen, Rheydt Markt und
   der Bereich am Hauptbahnhof sind von Beginn an erreichbar.
2. Freischalten funktioniert in der vorgesehenen Reihenfolge und bleibt
   nach einem Neustart erhalten. Es gibt keine Lücken an Kachelrändern.
3. Marker, Straßennetz, Geländehöhe und Gebäude stehen deckungsgleich.
   Prüfe beide Schulen im Detail und verwende im Spiel bei der Karte
   die Quellenangabe aus `QUELLEN.md`.
4. Teste Steuerung, Aufgaben und Bildrate auf einem Schul-iPad. Halte
   tatsächliche Testergebnisse und noch fehlende Fassadenreferenzen fest.
