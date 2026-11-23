# Stand: echte Karte Mönchengladbach (Auftrag aus `CLAUDE_AUFTRAG.md`)

Stand 20.11.2026. **Das Spiel nutzt nur noch die echte Karte** (`pythagoras-city.html` lädt `mg-echt.js`).
Die Auswahl zwischen Spielkarte und echter Karte ist entfernt; `echt.html` leitet auf das Spiel weiter.

## Gräben ausheben (`tools/graben.js`)
- **Hauptmission (Kapitel 3, nach dem Werkhof): „Ein Graben für die Wasserleitung“** bei Frau Lenzen in den Kleingärten neben dem Werkhof.
  Garten 16 m × 12 m vermessen, schräger Graben 20 m, Zusatzfrage schräge Grabenwand (1,2 m tief, 0,5 m breiter → 1,3 m), Rohr wählen
  (18/20/25 m). Danach Graben selbst ausheben: 8 Pflöcke, an jedem graben (E bzw. Tippen); der Graben entsteht Stück für Stück, das Rohr wird
  verlegt, am Beet sprudelt Wasser.
- **Nebenjob „Gräben für die Stadtwerke“** bei Herrn Kowalski am Mülforter Bruch, beliebig oft: neue Maße je Auftrag (Pythagoras-Aufgabe),
  dann 3–6 Stücke graben, Lohn je nach Grabenlänge.

## Verkehr, Regeln und neue Figuren (`tools/verkehr.js`, `tools/rig.js`)
- **Ampeln** (`fahrzeuge/Ampel.*`) an 12 echten Kreuzungen um Schule, Rheydter Markt, Rheydt Hbf und Haupthaus, mit Fußgängersignal.
  Zyklus 24 s, schaltet automatisch (Autos 11 s Grün, 2 s Gelb, 11 s Rot; Fußgänger 8 s Grün); Autos des Stadtverkehrs halten bei Rot. Bei Rot über die Kreuzung: gesehen von Polizei (70 m) oder Lehrkraft (35 m)
  → Bußgeld (zu Fuß 5 $, Fahrrad/E-Scooter 60 $, Motorrad/Auto 90 $). Ohne Zeugen meist Glück, manchmal ruft eine Nachbarin die Eltern an.
  Ab dem zweiten Verstoß, bei Lehrkraft-Zeugen oder wenn das Geld nicht reicht: **Elternbrief** (SMS von Mama, Hinweis oben links,
  Autohaus verkauft nichts) – erledigt durch **Verkehrsunterricht bei Frau Costantino** (Pythagoras-Aufgabe: Diagonale über die Kreuzung).
- **Polizei** (`fahrzeuge/Polizeifahrzeug.*`): zwei Streifenwagen im Stadtverkehr, bleiben in der Nähe, Blaulicht bei Kontrollen.
- **E-Scooter-Tuning** bei Kalle (80 $): bis 40 km/h, Neonlicht unter dem Trittbrett. Schneller als 20 km/h in Sicht von Polizei (40 m)
  oder Lehrkraft (24 m) → E-Scooter einkassiert (Polizei: zusätzlich Elternbrief).
- **Frau Costantino**: Lehrerin für Mathe und Deutsch, Verkehrsbeauftragte, steht vor dem Schuleingang, auch im Smartphone. Mama ist ebenfalls Kontakt.
- **Lehrkräfte** haben eine helle Hautfarbe.
- **Herr Dittmann (Cap, Freizeitlook)** als spielbare Figur (`figuren/Dittmann_Cap.*`): freischalten mit 90 Min. Spielzeit, 80 gelösten
  Aufgaben und 2500 XP. Das gelieferte Modell ist starr; `tools/rig.js` (`rigFromDonor`) übernimmt beim Laden Skelett, Gewichte und
  Animationen der Passant-Figur (Gewichte vom nächstgelegenen Punkt, Arm nur von Arm, Rumpf/Beine nur von Rumpf/Beinen).
- **Martinshorn**: gelieferte Aufnahme `sounds/martinshorn.wav` (auf 22 kHz verkleinert) als Endlosschleife bei Blaulicht, lauter je näher.

## Alle Personen als 3D-Figuren
GLTFLoader und SkeletonUtils sind direkt ins Spiel eingebaut (vorher Nachladen von cdn.jsdelivr.net, das in Schulnetzen gesperrt sein kann:
dann blieben alle Menschen einfache Klötzchen). Einfache Figuren erscheinen nur noch als Notlösung, wenn die 3D-Figuren nach 60 s nicht
geladen sind. Der Spielstart wartet, bis Noah geladen ist; unten läuft eine Ladeanzeige „3D-Figuren werden geladen … x von 9“.
Passanten, Gruppen, Lehrkräfte, Ladenbesitzer und Auftraggeber nutzen die 3D-Stadtfiguren aus `figuren/` (Idle, Walk, Run,
umgefärbte Kleidung). Die einfachen Figuren erscheinen nur noch, solange die 3D-Figuren laden. Auf Tablets höchstens 18 Passanten
im Umkreis von 70 m (Computer 40 im Umkreis von 110 m); weiter entfernte Figuren werden seltener animiert.
Test (Software-Rendering, Tablet-Einstellung): ca. 1,3–1,5 Mio. Dreiecke und 780–1240 Zeichenaufrufe pro Bild – deutlich mehr als vorher,
deshalb unbedingt auf dem Schul-iPad prüfen. Auf Roller, Fahrrad und Moped fährt die eigene Spielfigur (z. B. Noah) mit Haltung aus dem Skelett: auf dem Fahrrad tretend, auf dem Moped sitzend, auf dem Roller stehend, Hände am Lenker.

## Boden und Fahrzeughöhe (`tools/feinschliff.js`)
- Flackern behoben: Bodenschichten (Boden, Plätze, Wiesen, Wald, Wege, Gehweg, Fahrbahn, Markierungen) haben feste Tiefenverschiebungen;
  die Schattenkamera rastet auf das Raster der Schattenkarte ein, damit Schatten beim Gehen nicht flimmern.
- Fahrzeuge stehen mit Vorder- und Hinterrad getrennt auf dem Boden (Bordstein/Gehweg/Fahrbahn) und neigen sich passend.

## Fahrzeugmodelle (`fahrzeuge/`, `tools/fahrzeuge.js`)
E-Scooter, Fahrrad, Motorrad (früher Motorroller), Helikopter sowie neu **Kompaktwagen** (Rang 2, 900 $) und **Flugzeug** (Rang 5, 9000 $)
aus den gelieferten GLB-Modellen (als glTF-JSON wie die Figuren). Räder drehen um ihre Achse, Vorderräder des Autos lenken, Hauptrotor,
Heckrotor und Propeller drehen sich. Kollision: Kreis aus halber Fahrzeugbreite (Helikopter/Flugzeug etwas kleiner als Rotor bzw. Spannweite).
Flugzeug: Startlauf auf der Straße, ab 18 m/s mit R abheben, in der Luft mindestens 17 m/s, Landen durch Sinken (F).
Die übrigen Autos (Smart, Transporter, Prius, Aston Martin, Maserati) und der Verkehr nutzen noch die eingebauten Modelle.

## Auf- und Absteigen, Ein- und Aussteigen
Zweiräder: zur Seite des Fahrzeugs gehen, Bein über den Sattel schwingen (Roller: auf das Trittbrett steigen); Absteigen rückwärts.
Autos und Hubschrauber: zur Fahrertür gehen, bücken und hineingleiten; Aussteigen rückwärts. Dauer 0,6–1,7 s, Steuerung währenddessen gesperrt.
Bei Autos schwenkt an der Einstiegsseite eine Tür in Wagenfarbe auf und wieder zu (die Modelle haben keine eigene Tür; `tools/feinschliff.js`).

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

## Sporthalle, Läden, ganz Mönchengladbach (22.11.)
- **Sporthalle GHS Dohr begehbar** (`tools/sporthalle.js`): Tür am Umkleidetrakt (E/Tippen). Innenraum nach den Fotos: Holzpaneele,
  Prallschutz, hohe Fenster, Rasterdecke, Basketballkörbe mit aufgemalten Toren, Sprossenwand mit Weichbodenmatte, Ringe, Langbank,
  Geräteraum mit Kasten und Bock. Hauptmission **„Der Diagonal-Sprint“** (Kapitel nach dem Schulhof) bei Herrn Maaß (Sportlehrer):
  grünes Spielfeld 15 m × 8 m vermessen → Diagonale 17 m; Zusatzfrage Weichbodenmatte (2,5 m, 0,7 m Abstand → 2,4 m hoch);
  6 Diagonalen für 100 m; danach den Sprint selbst laufen (Countdown, Zeit wird gespeichert).
- **Läden begehbar** (`tools/laeden.js`, automatische Schiebetür, drinnen frei laufen, Modelle ausgestellt):
  Fahrradladen „Radwerk Rheydt“ (Hauptstraße): City-, Komfort-, Sport-Roller; Stadtrad, Mountainbike, Rennrad, E-Bike.
  Autohaus „An der Gracht“: Roller Classic, Motorrad Sport, Smart, Kompaktwagen, Kompakt Sport, Elektro-Kompakt, Transporter, Prius,
  Aston Martin, Maserati. Modelle = Varianten der Fahrzeugtypen mit eigener Farbe, Ausstattung (Korb, Akku, Streifen, Spoiler),
  Fahrwerten und Preisen. Gekauftes steht vor dem Laden. Garage (G) zeigt die eigenen Modelle.
- **Flughafen Mönchengladbach an der echten Stelle** (Phase 4): Bahn 13/31, Rollwege und Vorfelder aus OSM; Flugschule & Verleih
  am Vorfeld westlich des Terminals. Mieten pro Flug: Rundflug-Hubschrauber, Hubschrauber XL, Ultraleichtflieger, Sportflugzeug,
  Reiseflugzeug. Mietende = landen und aussteigen. Fliegen ab Rang 3.
- **Ganz Mönchengladbach** (`tools/gebiete.py`, `tools/gebiete.js`, `tools/gebiete_patch.py`): 46 Gebiete (Kern 2,6 × 2,3 km,
  300 m Überlappung), immer eines geladen; am Rand wird das Nachbargebiet nachgeladen (Position, Fahrzeug, Flughöhe bleiben).
  Freischalten mit Raster (25 m) aus `freischaltgebiete.geojson`: Phase 2 nach drei Hauptmissionen, Phase 3 nach allen
  Hauptmissionen in Rheydt, Phase 4 zusätzlich Rang 3, Phase 5 zusätzlich Rang 4. Gesperrtes und die Stadtgrenze sind nicht
  befahrbar (Hinweis), auf der Minikarte abgedunkelt. Freischaltungen in `save.phases`.
- **Noch offen:** eigene Missionen in den Phasen 2–5 (laut Kartenauftrag: Diagonalen-, Vermessungs-, Entfernungs-Mission);
  bis dahin schalten Fortschritt und Rang frei. Gebietswechsel lädt die Seite neu (ca. 2–4 s). Nicht auf echtem iPad getestet.

## Lehrerrollen und Aufgaben je Figur (22.11.)
- **Rollen:** Herr Dittmann Klassenlehrer 9c · Herr Maaß Sportlehrer (Diagonal-Sprint in der Sporthalle, dort auch sein Sprint-Nebenjob) ·
  Herr Jessen Deutschlehrer (Sponsorenlauf „Quer über den Schulhof“) · Frau Krahe Klassenlehrerin 10b (Markt) · Frau Ziemer Klassenlehrerin 9a (Außentreppe) ·
  Frau Costantino Englischlehrerin und Verkehrsbeauftragte (Aufgaben auf Englisch, auch der Verkehrsunterricht) · Herr Ballhorn Hausmeister (jetzt „Licht für den Werkhof“) ·
  Herr Meindorfner Mathelehrer (auf dem Schulhof, „Mathe-Training“ passend zur Figur, Kontakt im Handy) ·
  MPT Herr Aktas, Frau Colonna, Frau Brand: Tipps und Übungsaufgaben (`tools/rollen.js`).
- **Aufgaben je Figur:** Kinder (Noah, Schülerin, Klassisch) leichter, Herr Dittmann immer Stufe 3 (Raumdiagonale, Dachsparren mit Überstand,
  Koordinaten, Kommazahlen). Themen: Straßenbauer Baustelle/Mauern, Joggerin und Fußballfan Sport, Geschäftsfrau Büro, Seniorin/Senior Garten und Rampen,
  Passant Stadt, Kinder Schule. Kurieraufträge nehmen oft das Thema der Figur, MPT-Übungen immer.
- **Kinder** kaufen und fahren nur Fahrräder und E-Scooter (Läden, Garage, Einsteigen, Mieten gesperrt).

## Vorgemerkt: verkaufbare Fassung (noch NICHT umsetzen, erst auf Wunsch)
Falls das Spiel verkauft werden soll, vorher:
1. Echte Namen der Lehrkräfte und MPT-Kräfte durch erfundene ersetzen; Einstellung „Schulfassung“ schaltet die echten Namen wieder ein.
   (Alternativ schriftliche Zustimmung aller Personen.)
2. Automarken (Toyota Prius, Aston Martin, Maserati) durch erfundene Modellnamen ersetzen.
3. Offen beim Lehrer zu klären: Zustimmung Schulleitung/Schulträger (Name GHS Dohr, Gebäude, Fotos), Lizenzen der gelieferten
   GLB-Modelle, der Musik „Rheydt bei Nacht“ und des Martinshorns (bei KI-Diensten deren Nutzungsbedingungen),
   Nebentätigkeit (Bezirksregierung Düsseldorf), kein „GTA“ in der Werbung, keine Werbung/Käufe im Spiel für Kinder.
   Stand 22.11.: GLB-Modelle, Bilder und übrige Dateien stammen laut Lehrer aus ChatGPT (bezahltes Abo) – kommerzielle Nutzung
   nach OpenAI-Bedingungen erlaubt; rein KI-erzeugte Inhalte sind aber kaum urheberrechtlich geschützt. Noch prüfen, mit welchem
   Dienst die Musik „Rheydt bei Nacht“ erzeugt wurde (z. B. Suno/Udio haben eigene Bedingungen).

## Grafik-Umbau Teststrecke Schultor → Gehweg → Büdchen (22.11.)
- `tools/grafik.js`, `tools/grafik_patch.py`: Kantenglättung (MSAA) an, Auflösung je Profil bis Gerätepixeldichte, dynamisch nachgeregelt
  (Ziel 30 FPS Touch); Profile im Menü: Schul-iPad / Standard / Hoch; Bildratenanzeige im Menü.
- Nachmittagslicht (Sonne Südwest ~34°, warm), Himmelslicht kühl, Dunst färbt Entfernung (Tiefe), Himmel passt in die Sichtweite.
- Schatten enger um die Figur (schärfer), Kontaktschatten unter Noah, Passanten, Lehrkräften und Fahrzeugen.
- Noah steht auf dem Boden (Sohle 2 cm unter Gehweg gemessen); der Schwebe-Eindruck kam vom fehlenden Kontaktschatten und dem groben, versetzten Sonnenschatten.
- Häuser: Satteldächer für rechteckige Wohnhäuser, dunkler Sockel, Traufkante an Flachdächern. Gehweg nicht mehr weiß, Bordstein dunkler.
- Fahrzeuge (GLB): Lack mit Klarlack/Spiegelung, getöntes Glas, matte Reifen. Zubehör an Autos entfernt (saß falsch).
- Straßenmöbel entlang der Gehwege (Mülleimer, Bänke, Fahrradbügel, Poller), Schilder „Am Torfbend“ und Kinder-Warnschild, Büdchen als Kiosk.
- Kamera weiter hinten/höher, Hochformat 66° Blickwinkel, ruhigere Drehung, rückt vor Laternenmasten. Oberfläche Hochformat kompakt
  (Geld/Menü/Handy in einer Zeile, kleine Minikarte, Missionshinweis vollständig), Missionsmarker kleiner. Shader werden vor Spielstart übersetzt.
- Gemessen nur in Software-Rendering (kein echtes Gerät): Gebietswechsel ~2,5 s Daten, ~10 s bis spielbar (Figuren laden neu).
- Neu zu erstellende Modelle für den nächsten Qualitätsschritt: siehe Antwort vom 22.11. (Noah, Passanten, Fahrzeuge, Laternen, Gebäudeteile).

## Neue Modelle eingebaut (22.11., `tools/modelle.js`, Quellen in `modelle_quelle/`)
- Figuren (Noah + 8 Passanten) ersetzt: gleiche Knochen und Clips, Fußhöhe/Schrittgeschwindigkeit neu berechnet (praktisch unverändert);
  Noah 23 000, Passanten ~10 000 Dreiecke; Texturen 1024/512 px.
- Fahrzeuge Auto, Fahrrad, E-Scooter, Motorrad ersetzt (Material „Lack“, Räder Rad_Vorne/Rad_Hinten mit *_Mesh zum Rollen);
  Sitz-/Trittbretthöhe aus Sattel/Sitz/Trittbrett. Neu: **SUV Rheydt** (Autohaus, $1.690, ab Rang 2, nur Erwachsene).
- Ampel ersetzt (Signal_Rot/Gelb/Gruen), Laternen als neues Modell (instanziert, leuchten nachts).
- Fassaden-Bausatz in Noahs Nähe (Reichweite je Profil 28/42/65 m): Fenster mit Laibung genau auf den gemalten Fenstern,
  Hauseingänge auf den gemalten Haustüren, Regenrohre, Dachgauben auf Satteldächern; Ladenerdgeschoss an Gewerbebauten,
  **Ladenfassade Rheydt** an Einkaufsstraßen der Rheydter Innenstadt (bis 650 m um den Markt). OSM enthält in Rheydt keine Ladenpunkte.

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

## Bausatz-Feinschliff (23.11.)
- Dachgauben: bis zu 4 je Dachseite, 30 % größer, sitzen auf der Dachfläche hinter der Traufe; zu kleine Dächer bekommen keine Gaube mehr (vorher ragten sie über Giebel und Traufe).
- Regenrohre liegen direkt an der Wand an.
- Geparkte Fahrräder und E-Scooter (Modelle aus Pythagoras_City_GLB_Modelle) vor Läden und neben Haustüren; auf schmalen Gehwegen längs an der Wand, auf breiten quer im Ständer. Rahmenfarbe je Rad verschieden.
- Höchstzahl je Profil: Schul-iPad 8/3, Standard 24/8, Hoch 40/14 (Fahrrad/Scooter, je ca. 6 300 Dreiecke).
