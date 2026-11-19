# 🚨 Notfall Kollegium

Web-App (installierbar auf Handy, Tablet und PC) zur schnellen Alarmierung des Lehrerkollegiums.

> **Wichtig:** Diese App ersetzt **keinen** Notruf und keine offizielle Alarmanlage der Schule.
> Im Ernstfall immer **110** (Polizei) bzw. **112** (Rettungsdienst/Feuerwehr) wählen.
> Den Einsatz bitte vorab mit Schulleitung, Schulträger und Datenschutzbeauftragten abstimmen.

## Funktionen

- **Vier Notfallknöpfe:** Amokalarm, Medizinischer Notfall, Schlägerei/Gewalt, Sonstige Gefahr.
  Zum Auslösen hält man den Knopf **1,5 Sekunden gedrückt**, das verhindert Fehlalarme durch versehentliches Antippen.
- **Standort:** Jede Lehrkraft setzt ihren aktuellen Raum. Er wird bei Alarm und Rückmeldung mitgeschickt.
- **Vollbild-Alarm** bei allen Kolleg*innen mit Handlungsanweisungen, Ort, Uhrzeit und auslösender Person.
- **Amokalarm ist ein stiller Alarm:** Die Geräte spielen keinen Ton ab, sie vibrieren nur, damit der Standort nicht verraten wird.
  Die anderen Alarme lösen eine Sirene aus.
- **Rückmeldungen per Knopfdruck**, z. B. „Raum gesichert“, „Brauche Hilfe 🆘“, „Ich komme“, „112 gerufen“.
  Alle sehen, wer was gemeldet hat.
- **Chat:** ein allgemeiner Kanal für das ganze Kollegium und pro Alarm ein eigener Lage-Chat.
- **Push-Benachrichtigungen** auch bei geschlossener App (Web Push).
- **Entwarnung / Fehlalarm:** Einen Amokalarm können nur die Schulleitung oder die auslösende Person beenden,
  die übrigen Alarme alle Lehrkräfte.
- **Android-App mit NINA-Alarm:** Der Alarm kommt auch bei stummgeschaltetem Handy und bei „Nicht stören“ laut
  durch, mit Vollbild auf dem Sperrbildschirm. Siehe [`../android`](../android/README.md).
- **iPhone-App:** Alarme kommen per Apple Push, mit Apple-Genehmigung „Critical Alerts“ auch trotz
  Stummschalter. Siehe [`../ios`](../ios/README.md).
- Verlauf aller Alarme, Anzeige der Kolleg*innen, die gerade online sind, und Direktwahl 110/112.

## Starten

Voraussetzung: [Node.js](https://nodejs.org) ab Version 18. Externe Pakete sind nicht nötig.

```bash
cd notfall-app
SCHULNAME="GHS Dohr" npm start
```

Beim ersten Start werden zwei Zugangscodes erzeugt und in der Konsole angezeigt (gespeichert in `data/config.json`):

| Code | Wofür |
|------|-------|
| Zugangscode Kollegium | Anmeldung aller Lehrkräfte |
| Zugangscode Leitung | Anmeldung der Schulleitung (darf Amokalarme beenden) |

### Einstellungen (Umgebungsvariablen)

| Variable | Bedeutung | Standard |
|---|---|---|
| `PORT` | Port des Servers | `3000` |
| `SCHULNAME` | Name, der beim Anmelden angezeigt wird | `Unsere Schule` |
| `SCHULCODE` / `ADMINCODE` | feste Zugangscodes statt der erzeugten | zufällig |
| `DATA_DIR` | Speicherort der Daten | `./data` |
| `AMOK_STUMM` | `0` = Amokalarm auch mit Ton (Standard: stiller Alarm, nur Vibration) | `1` |
| `APNS_KEY_FILE`, `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_BUNDLE_ID` | Apple-Push für die iPhone-App (siehe [`../ios`](../ios/README.md)) | aus |
| `VAPID_SUBJECT` | Kontakt für Push-Dienste (`mailto:…`) | `mailto:admin@example.org` |

## Betrieb im Schulalltag

1. **HTTPS ist Pflicht** für Push-Benachrichtigungen und die Installation als App (außer auf `localhost`).
   Am einfachsten setzt man einen Reverse-Proxy mit Let's-Encrypt-Zertifikat davor, z. B. Caddy:
   ```
   notfall.meine-schule.de {
     reverse_proxy localhost:3000
   }
   ```
2. Alle Lehrkräfte öffnen die Adresse, melden sich an, **installieren die App** und tippen unter
   **Kollegium → Push-Benachrichtigungen aktivieren**. Danach mit „Test senden“ prüfen.
   - **Android/Chrome:** Menü → „App installieren“.
   - **iPhone (ab iOS 16.4):** Safari → Teilen → „Zum Home-Bildschirm“, die App von dort öffnen und dann Push aktivieren.
3. Regelmäßig einen **Probealarm** durchführen und danach „Fehlalarm“ wählen.
4. Den Server dauerhaft betreiben, z. B. als systemd-Dienst oder mit `pm2`, und den Ordner `data/` sichern.

## Datenschutz und Sicherheit

- Gespeichert werden nur Name, Kürzel, Alarme, Chatnachrichten und Push-Abos, und zwar in `data/db.json` auf dem eigenen Server.
  Es gibt keine Cloud-Dienste von Dritten. Nur die Push-Benachrichtigungen laufen Ende-zu-Ende-verschlüsselt über den Push-Dienst
  des jeweiligen Browsers (Google, Apple, Mozilla).
- Der Zugang ist durch den Schulcode geschützt, Fehlversuche werden gebremst. Wenn der Code nach außen gelangt ist,
  den neuen Code per `SCHULCODE` setzen oder in `data/config.json` ändern und den Server neu starten.
- **Keine Schülerdaten** (Namen, Gesundheitsdaten) in den Chat schreiben, wenn es nicht nötig ist.

## Grenzen

- Ohne Internet bzw. WLAN kommen keine Alarme an. Die App ist ein **zusätzlicher** Kanal neben Durchsage, Telefon und Alarmanlage.
- Die **Web-App** (iPhone, PC) zeigt Alarme bei „Nicht stören“ oder Stummschaltung nur lautlos an.
  Laut trotz Stummschaltung klingeln nur die **Android-App** und die **iPhone-App** (iPhone: mit Apple-Genehmigung „Critical Alerts“).
- Der stille Amokalarm vibriert nur. Ob ein Ton kommt, hängt bei Push-Nachrichten zusätzlich vom Betriebssystem ab.

## Tests

```bash
npm test
```
