# 🧪 Notfall-App auf dem iPhone testen (ohne Mac, ohne Developer-Konto)

So testest du das komplette Alarmsystem mit deinem iPhone. Der Server läuft dabei für den Test auf deinem
Windows-PC, und ein kostenloser Tunnel macht ihn über eine `https://`-Adresse erreichbar.

Auf dem iPhone läuft die **Web-App** (installiert auf dem Home-Bildschirm). Alarme, Rückmeldungen, Chat und
Push-Benachrichtigungen funktionieren damit. **Was nicht geht:** Die Web-App kann den Stummschalter nicht
durchbrechen. Das kann nur die eigene iPhone-App mit Apple-Developer-Konto (siehe [`../ios`](../ios/README.md)).

## Einmalig vorbereiten (PC, ca. 10 Minuten)

1. **Node.js** installieren: https://nodejs.org → Version „LTS“ herunterladen und installieren.
2. **cloudflared** (Tunnel) installieren: Startmenü → „Eingabeaufforderung“ öffnen und eingeben:
   ```
   winget install --id Cloudflare.cloudflared
   ```
   Danach die Eingabeaufforderung schließen.
3. **Den Code herunterladen:**
   https://github.com/xxkeeper84xx-beep/senegal-quiz-ghs-dohr/archive/refs/heads/claude/admiring-babbage-c8on3h.zip
   und die ZIP-Datei entpacken.

## Test starten

1. Im entpackten Ordner `notfall-app` die Datei **`start-test-windows.bat`** doppelklicken.
   (Bei einer Windows-Warnung: „Weitere Informationen“ → „Trotzdem ausführen“.)
2. Es öffnen sich zwei Fenster:
   - **„Notfall-Server“**: zeigt den **Zugangscode Kollegium** und den **Zugangscode Leitung**.
   - **Tunnel**: Nach ein paar Sekunden steht dort eine Adresse wie `https://xyz-abc.trycloudflare.com`.
3. Beide Fenster während des Tests offen lassen.

## Auf dem iPhone (iOS 16.4 oder neuer)

1. Die `trycloudflare.com`-Adresse in **Safari** öffnen.
2. **Teilen-Symbol** (Quadrat mit Pfeil) → **„Zum Home-Bildschirm“** → „Hinzufügen“.
3. Die App **vom Home-Bildschirm aus** öffnen. Wichtig: nicht in Safari, sonst gibt es keine Push-Nachrichten.
4. Mit Name, Kürzel und dem **Zugangscode Kollegium** anmelden und den Standort setzen.
5. Unten **„Kollegium“** → **„Push-Benachrichtigungen aktivieren“** → „Erlauben“ → **„Test senden“**.
   Es sollte sofort eine Testbenachrichtigung kommen.

## Alarm ausprobieren

Am PC die gleiche `trycloudflare.com`-Adresse im Browser öffnen und als zweite Person anmelden
(anderes Kürzel, z. B. „TEST“). Wenn noch jemand ein Handy hat, geht das auch damit.

| Test | Erwartung auf dem iPhone |
|---|---|
| App geöffnet, am PC „Medizinischer Notfall“ gedrückt halten | Vollbild-Alarm mit Anweisungen, Rückmelde-Knöpfe |
| iPhone gesperrt, Stummschalter **aus**, Alarm auslösen | Push-Nachricht auf dem Sperrbildschirm mit Ton |
| iPhone gesperrt, Stummschalter **an** | Push-Nachricht, nur Vibration, kein Ton. Das ist bei der Web-App normal. |
| Auf dem iPhone „Ich komme“ tippen | Am PC erscheint die Rückmeldung |
| Chat-Nachricht am PC schreiben | Push-Nachricht auf dem iPhone |
| „Entwarnung geben“ am PC | Alarm verschwindet, Entwarnungs-Nachricht |

## Hinweise

- Die Tunnel-Adresse **ändert sich bei jedem Start**. Danach die App auf dem iPhone löschen und neu zum
  Home-Bildschirm hinzufügen.
- Der kostenlose Tunnel ist nur für Tests gedacht. Er leitet die Live-Verbindung nicht direkt durch, deshalb
  fragt die App automatisch alle 3 Sekunden nach. Alarme kommen dadurch mit bis zu ~7 Sekunden Verzögerung an.
  Im echten Betrieb läuft der Server auf einem richtigen Server mit eigener Adresse (siehe [README](README.md)).
- Zum Beenden beide Fenster schließen. Die Testdaten liegen im Ordner `notfall-app/data` und können gelöscht werden.
