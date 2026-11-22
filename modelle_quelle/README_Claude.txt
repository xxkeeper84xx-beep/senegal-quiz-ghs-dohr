PYTHAGORAS CITY – GLB-MODELLE

Alle 20 Modelle liegen als einzelne GLB-Dateien im Ordner Modelle.
Die GLB-Dateien enthalten ihre verwendeten Texturen und Materialien.
Skalierung in Metern. In glTF ist +Y oben.

FIGUREN
Noah_Pythagoras.glb und die acht Passanten aus Figuren/ verwenden die
vorherigen Dateinamen. Die ursprünglichen Knochen, Clip-Namen und
Keyframes von Idle, Walk und Run sind erhalten. Ersetze die bisherigen
Assets und entlade bei einem Test gegebenenfalls den alten Asset-Cache.
Noahs rotes Shirt und gelber Rucksack mit Dreieck sind Bestandteil des
Modells. Das Modell steht in seiner Grundstellung auf Y=0. Kontrolliere
am Spawnpunkt zusätzlich Bodenabfrage, Kapselversatz und Schatten im Spiel.

FAHRZEUGE
Auto.glb, Fahrrad.glb, E_Scooter.glb, Motorrad.glb
Vorne zeigt in +Z. Der Modellursprung liegt auf der Bodenebene. Die
Materialnamen für die bestehende Erkennung lauten Lack, Glas, Reifen, Chrom.
Für die Radrotation die lokalen X-Achsen der folgenden Knoten verwenden:

Auto       Rad_Vorne_L, Rad_Vorne_R, Rad_Hinten_L, Rad_Hinten_R
Zweiräder  Rad_Vorne, Rad_Hinten

Die Radknoten liegen auf den Achsmitten. Beim Lenken den vorderen
Radknoten um +Y drehen und sein Kind mit der Endung _Mesh separat um X
rollen lassen. Die Ansteuerung der Fahrzeuge erfolgt im Spiel.

GEBÄUDE
Die sichtbare Fassadenseite zeigt in +Z. Fenster und Dachgaube haben
ihren Ursprung in der Fenstermitte bzw. an der Dachbasis. Beim
Fenstermodul einen Ausschnitt in der Fassadenfläche vorsehen, damit
Fenster, Rahmen und Laibung sichtbar sind. Ladenerdgeschoss, Hauseingang
und Regenrohr können jeweils am Boden an der Fassadenkante platziert werden.
Ladenerdgeschoss und Eingang sind Bausätze für die Häuserzeilen. Das
eigentliche Gebäude und seine Kollision entstehen beim Zusammenbau.

STADTMOBILIAR
Laterne und Ampel am Sockel auf Bodenhöhe platzieren. Die Signalköpfe
der Ampel zeigen nach +Z. Signal_Rot, Signal_Gelb und Signal_Gruen
sind einzeln adressierbar. Die Ampel startet visuell auf Rot.
Signalwechsel und Beleuchtung werden durch das Spiel gesteuert.

DREIECKE PRO MODELL
Fahrzeuge/Auto.glb: 14.986
Fahrzeuge/E_Scooter.glb: 6.044
Fahrzeuge/Fahrrad.glb: 6.280
Fahrzeuge/Motorrad.glb: 9.336
Figuren/01_Schuelerin.glb: 10.186
Figuren/02_Fussballfan.glb: 10.184
Figuren/03_Seniorin.glb: 8.742
Figuren/04_Senior.glb: 9.939
Figuren/05_Strassenbauer.glb: 10.182
Figuren/06_Joggerin.glb: 9.932
Figuren/07_Geschaeftsfrau.glb: 10.732
Figuren/08_Passant.glb: 10.190
Figuren/Noah_Pythagoras.glb: 23.951
Gebaeude/Dachgaube.glb: 1.347
Gebaeude/Fenster_Laibung_Fensterbank.glb: 1.232
Gebaeude/Hauseingang_mit_Stufe.glb: 1.620
Gebaeude/Ladenerdgeschoss.glb: 4.236
Gebaeude/Regenrohr.glb: 988
Stadtmobiliar/Ampel.glb: 940
Stadtmobiliar/Laterne.glb: 612
