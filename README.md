# senegal-quiz-ghs-dohr
## Pythagoras City (`pythagoras-city.html` + `mg-echt.js` + `figuren/`)

3D-Open-World-Lernspiel (Third-Person, three.js) für Mathe Klasse 9 zum Satz des Pythagoras.
Spielort ist die **echte Karte von Mönchengladbach** (Rheydt und Mülfort, Phase 1 aus `karte/`): echte Straßen,
Gebäude und Stadtteile aus OpenStreetMap und den amtlichen 3D-Gebäuden. Alle Maße in den Aufgaben sind Werte für das Spielmodell.
Stand und offene Punkte der Karte: `karte/STATUS.md`.

- Start auf dem Gehweg vor der GHS Dohr, Standort Am Torfbend.
- Mess-Aufträge mit Messpunkten, Skizze, Formelgerüst und gestuften Tipps:
  „Licht für den Werkhof“ (Dohr, öffnet den Werkhof-Durchgang) und „Quer über den Markt“ (Rheydt).
- Kurier-Aufträge (Feuerwehr, Baustelle, Elektromarkt, Rathaus, Park-Kurier, Taxi, Luftrettung) und Fahrzeuge
  vom E-Scooter bis zum Hubschrauber.

Grafik: leicht erhöhte, drehbare Third-Person-Kamera, animierte Spielfigur, Autos mit Radkästen und Scheiben,
modellierte Bordsteine, GHS Dohr als 3D-Gebäude (vorläufige Gestaltung ohne Fotovorlage). Beispielbilder in `screenshots/`.

`pythagoras-city.html`, `mg-echt.js` und der Ordner `figuren/` müssen im selben Ordner liegen. Im Browser öffnen, Internetverbindung für three.js nötig.
Steuerung: WASD/Pfeiltasten, E Aktion, X aussteigen, Maus ziehen/wischen dreht die Kamera, J Auftragsheft, M Karte, N Wegmarkierung, V Kamera, G Garage, H Theorie.
Auf Tablets erscheinen Touch-Tasten. Die Karte entsteht aus `python3 tools/realkarte.py karte/ mg-echt-basis.js` und `node tools/fx_build.js mg-data.js mg-echt-basis.js tools/spielinhalte.js > mg-echt.js` (setzt Schule, Werkhof und Missionen der früheren Spielkarte an echte Orte).
