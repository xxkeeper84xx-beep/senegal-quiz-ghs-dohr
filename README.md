# senegal-quiz-ghs-dohr
## Pythagoras City (`pythagoras-city.html` + `mg-data.js`)

3D-Open-World-Lernspiel (Third-Person, three.js) für Mathe Klasse 9 zum Satz des Pythagoras.
Spielort ist eine verdichtete Spielkarte von Mönchengladbach (Dohr/Torfbend, Rheydt, Gladbacher Innenstadt,
Nordpark, Schloss Rheydt). Wege und Entfernungen sind vereinfacht, alle Maße in den Aufgaben sind Werte für das Spielmodell.

- Start in Dohr an der Haltestelle Am Torfbend bei der GHS Dohr.
- Mess-Aufträge mit Messpunkten, Skizze, Formelgerüst und gestuften Tipps:
  „Licht für den Werkhof“ (Dohr, öffnet den Werkhof-Durchgang) und „Quer über den Markt“ (Rheydt).
- Kurier-Aufträge (Feuerwehr, Baustelle, Elektromarkt, Rathaus, Park-Kurier, Taxi, Luftrettung) und Fahrzeuge
  vom E-Scooter bis zum Hubschrauber.

Beide Dateien müssen im selben Ordner liegen. Im Browser öffnen, Internetverbindung für three.js nötig.
Steuerung: WASD/Pfeiltasten, E Aktion, J Auftragsheft, M Karte, N Wegmarkierung, V Kamera, G Garage, H Theorie.
Auf Tablets erscheinen Touch-Tasten. Die Karte wird mit `python3 tools/spielkarte.py mg-data.js` erzeugt.
