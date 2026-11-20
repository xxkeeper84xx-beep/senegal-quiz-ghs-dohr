# Stand: echte Karte Mönchengladbach (Auftrag aus `CLAUDE_AUFTRAG.md`)

Stand 20.11.2026. **Das Spiel nutzt nur noch die echte Karte** (`pythagoras-city.html` lädt `mg-echt.js`).
Die Auswahl zwischen Spielkarte und echter Karte ist entfernt; `echt.html` leitet auf das Spiel weiter.

## Alle Personen als 3D-Figuren
Passanten, Gruppen, Lehrkräfte, Ladenbesitzer und Auftraggeber nutzen die 3D-Stadtfiguren aus `figuren/` (Idle, Walk, Run,
umgefärbte Kleidung). Die einfachen Figuren erscheinen nur noch, solange die 3D-Figuren laden. Auf Tablets höchstens 18 Passanten
im Umkreis von 70 m (Computer 40 im Umkreis von 110 m); weiter entfernte Figuren werden seltener animiert.
Test (Software-Rendering, Tablet-Einstellung): ca. 1,3–1,5 Mio. Dreiecke und 780–1240 Zeichenaufrufe pro Bild – deutlich mehr als vorher,
deshalb unbedingt auf dem Schul-iPad prüfen. Auf Roller, Fahrrad und Moped fährt die eigene Spielfigur (z. B. Noah) mit Haltung aus dem Skelett: auf dem Fahrrad tretend, auf dem Moped sitzend, auf dem Roller stehend, Hände am Lenker.

## Fahrzeugmodelle (`fahrzeuge/`, `tools/fahrzeuge.js`)
E-Scooter, Fahrrad, Motorrad (früher Motorroller), Helikopter sowie neu **Kompaktwagen** (Rang 2, 900 $) und **Flugzeug** (Rang 5, 9000 $)
aus den gelieferten GLB-Modellen (als glTF-JSON wie die Figuren). Räder drehen um ihre Achse, Vorderräder des Autos lenken, Hauptrotor,
Heckrotor und Propeller drehen sich. Kollision: Kreis aus halber Fahrzeugbreite (Helikopter/Flugzeug etwas kleiner als Rotor bzw. Spannweite).
Flugzeug: Startlauf auf der Straße, ab 18 m/s mit R abheben, in der Luft mindestens 17 m/s, Landen durch Sinken (F).
Die übrigen Autos (Smart, Transporter, Prius, Aston Martin, Maserati) und der Verkehr nutzen noch die eingebauten Modelle.

## Auf- und Absteigen, Ein- und Aussteigen
Zweiräder: zur Seite des Fahrzeugs gehen, Bein über den Sattel schwingen (Roller: auf das Trittbrett steigen); Absteigen rückwärts.
Autos und Hubschrauber: zur Fahrertür gehen, bücken und hineingleiten; Aussteigen rückwärts. Dauer 0,6–1,7 s, Steuerung währenddessen gesperrt.
Türen öffnen sich nicht (die Automodelle haben keine beweglichen Türen).

## Umzug der Spielinhalte (`tools/spielinhalte.js`, `tools/fx_build.js`, `tools/fx_pass.js`)
| Inhalt | neuer Ort |
|---|---|
| Schulmodell GHS Dohr, Schulhof, Aufträge „Außentreppe“ und „Quer über den Schulhof“, Dreiecksjagd | Grundstück Am Torfbend, um 11° gedreht wie die Straße |
| Werkhof mit Halle, Tor und Licht („Licht für den Werkhof“), Herr Maaß | freie Fläche südwestlich der Schule zwischen Am Torfbend und den Kleingärten |
| „Quer über den Markt“, Marktstände, Frau Krahe, Jana, Frau Rossi | Rheydter Markt (Stände enger gestellt, Messzone weiter 12 m × 9 m) |
| Rathaus-Auftrag | Rathaus Rheydt |
| Taxistand | Rheydt Hauptbahnhof |
| Einsatzleitung, Stadtführerin | Evangelische Hauptkirche Rheydt |
| Elektromarkt, Bäcker Hennes | Hauptstraße |
| Autohaus, Kalles Schrauberbude | Gartenstraße |
| Kran- und Hubschrauber-Aufträge, Platzwart, Knotenseil, UFO (früher Nordpark) | Mülforter Bruch |
| Grünanlage, Spielplatz, Elif | Grünanlage in Mülfort |
| Herr Yilmaz (Büdchen) | Am Torfbend östlich der Schule |

Für Schule und Werkhof wurden 6 OSM-Gebäude entfernt, die unter den Modellen lagen (u. a. Teile der Orthodoxen Gemeinde
westlich des Schulgrundstücks): Das Schulmodell nach den Fotos ist 72 m breit, das OSM-Grundstück nur etwa 50 m.
Alter Markt, Nordpark und Schloss Rheydt liegen außerhalb von Phase 1 und stehen im Auftragsheft als „folgt“.
Nicht übernommen: geparkte Autos, Schilder und Zebrastreifen der alten Spielkarte (lagen auf deren Straßen).

## Erledigt
- **Noah** ist die Spielfigur (`figuren/Noah_Pythagoras.*`, optimiert von 8,7 MB auf 2,9 MB; 43 000 Dreiecke).
  Idle/Walk/Run mit Überblendung, Blick in Laufrichtung, Füße am Boden (Standfuß beim Gehen 0 cm, beim Laufen 0,2–0,4 cm pro Bild).
  Zu Fuß: Gehen 1,8 m/s mit „Walk“, Sprinten (Shift oder nach 2 s Gedrückthalten) 4,8 m/s mit „Run“; vorher lief Noah schon beim normalen Gehen mit „Run“.
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

## Figuren freispielen
Neue Profile wählen nur **Noah**, **Schülerin** oder **Klassisch**; Haut-, Haar- und Kleidungsfarben sind bei allen frei wählbar.
Die übrigen Figuren sind im Startbildschirm (Menü „Figuren“ und im Figuren-Editor) mit Schloss, Bedingung, Fortschrittsbalken und 3D-Vorschau zu sehen.

| Figur | Spielzeit | gelöste Aufgaben |
|---|---|---|
| Fußballfan | 10 Min. | 8 |
| Passant | 15 Min. | 12 |
| Joggerin | 20 Min. | 18 |
| Straßenbauer | 30 Min. | 25 |
| Geschäftsfrau | 40 Min. | 32 |
| Seniorin | 50 Min. | 40 |
| Senior | 60 Min. | 50 |

Spielzeit zählt nur im laufenden Spiel (`save.playTime`, Sekunden). Werte stehen in `FIG_REQ` in `tools/story.js`.

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
3. **Drei Startmissionen laut Kartenauftrag** (Schulhof-Diagonale, Markt mit zwei rechtwinkligen Strecken, Modellaufgabe am Bahnhof)
   mit getrennten Werten für „vor Ort gemessen“ und „vereinfachte Aufgabenwerte“. Die umgezogenen Missionen nutzen noch die Werte des Spielmodells.
4. **Freischalten** der Phasen 2–5 mit Punkt-in-Polygon auf `grenzen/freischaltgebiete.geojson`, Sperren am Übergang,
   Speicherung im Spielstand, keine doppelten Belohnungen.
5. **Kacheln nachladen** statt eines festen Ausschnitts; weiter entfernte Geometrie vereinfachen.
6. **Fassaden der Schule**: Für den Standort Torfbend liegen Fotos vor. Für das **Haupthaus Altenbroicher Straße 50–52** fehlen
   Referenzfotos (Fenster, Eingänge, Schilder, Hof).
