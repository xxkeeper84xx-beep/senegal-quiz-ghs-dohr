# 📱 iPhone-App „Notfall Kollegium“

iOS-Gegenstück zur [Android-App](../android/README.md). Die App zeigt dieselbe Oberfläche (Notfallknöpfe, Chat)
und bekommt Alarme über **Apple Push** zugestellt, auch wenn die App geschlossen ist.

## Was ein iPhone-Alarm durchbricht

| | Ohne Apple-Genehmigung | Mit Genehmigung „Critical Alerts“ |
|---|---|---|
| **Fokus / „Nicht stören“** | ✅ als „Dringende Mitteilung“ | ✅ |
| **Stummschalter / Stumm-Modus** | ❌ nur Vibration, kein Ton | ✅ **Sirene in voller Lautstärke** (wie NINA) |
| Sperrbildschirm | ✅ | ✅ |

Der laute Alarm trotz Stummschalter funktioniert auf dem iPhone **nur mit der Sondergenehmigung
„Critical Alerts“ von Apple**. NINA hat diese Genehmigung. Ohne sie läuft die App trotzdem, sie klingelt dann aber nur bei
ausgeschaltetem Stummschalter.

Der **Amokalarm** bleibt auch auf dem iPhone ein stiller Alarm: Er erscheint als dringende Mitteilung, aber ohne Ton
(Einstellung `AMOK_STUMM` am Server, siehe [notfall-app](../notfall-app/README.md)).

## Was ihr braucht

1. **Apple-Developer-Konto**, am besten auf die Schule bzw. den Schulträger: 99 €/Jahr, bei
   gemeinnützigen Organisationen und Bildungseinrichtungen auf Antrag kostenlos
   (https://developer.apple.com/support/membership-fee-waiver/). Für eine Organisation braucht ihr eine D-U-N-S-Nummer.
2. **Einen Mac** mit aktuellem Xcode (aus dem Mac App Store).
3. **Den Schulserver** der Notfall-App über HTTPS.

## Schritt für Schritt

### 1. Projekt öffnen

```bash
brew install xcodegen        # einmalig (https://brew.sh)
cd ios
```

In `project.yml` anpassen:
- `APP_BUNDLE_ID`: eine eigene, weltweit eindeutige ID, z. B. `de.ghs-dohr.notfall`
- `DEVELOPMENT_TEAM`: eure Team-ID (steht im Apple-Developer-Konto unter „Membership“)
- optional `NOTFALL_SERVER_URL`: dann müssen die Lehrkräfte die Adresse nicht eintippen

```bash
xcodegen                      # erzeugt NotfallKollegium.xcodeproj
open NotfallKollegium.xcodeproj
```

### 2. Push-Schlüssel für den Server anlegen

Im Apple-Developer-Konto unter **Certificates, Identifiers & Profiles → Keys → „+“**:
- einen Namen vergeben, z. B. „Notfall Push“, und **Apple Push Notifications service (APNs)** ankreuzen,
- die `.p8`-Datei herunterladen. Das geht **nur einmal**, also gut aufbewahren. Dazu die **Key ID** notieren.

Den Server dann so starten:

```bash
APNS_KEY_FILE=/pfad/AuthKey_XXXXXXXXXX.p8 \
APNS_KEY_ID=XXXXXXXXXX \
APNS_TEAM_ID=YYYYYYYYYY \
APNS_BUNDLE_ID=de.ghs-dohr.notfall \
SCHULNAME="GHS Dohr" npm start
```

Die `.p8`-Datei ist geheim. Sie gehört nicht ins Repository und nur auf den Server.

### 3. „Critical Alerts“ bei Apple beantragen

Antragsformular: https://developer.apple.com/contact/request/notifications-critical-alerts-entitlement/

Ein Begründungstext, den ihr anpassen könnt:

> Our app is used exclusively by the teaching staff of [Schulname], a school in Germany, to alert colleagues
> during emergencies on school premises: armed intruder / school shooting (Amokalarm), medical emergencies
> (e.g. unconscious student, seizure) and violent incidents. Teachers often keep their phones muted while teaching,
> so a standard notification would go unnoticed in exactly the situations where every second counts. Critical alerts
> are only sent when a staff member actively triggers an emergency alarm (press-and-hold button); chat messages
> and all other notifications use normal or time-sensitive delivery. The app is distributed privately to verified staff
> members only (school access code), similar to public warning apps such as NINA.

Apple antwortet in der Regel nach einigen Tagen bis Wochen. Nach der Zusage:
1. Unter **Identifiers → eure App-ID** die Berechtigung „Critical Alerts“ aktivieren.
2. In `Config/NotfallKollegium.entitlements` den Abschnitt `critical-alerts` einkommentieren.
3. Die App neu bauen und verteilen. Beim ersten Start fragt das iPhone, ob „kritische Hinweise“ erlaubt werden.

### 4. Auf die iPhones bringen

- **Zum Ausprobieren:** Das iPhone per Kabel an den Mac anschließen, in Xcode auswählen und ▶ drücken.
  Debug-Builds nutzen automatisch die Apple-Testumgebung.
- **Für das Kollegium:** **Product → Archive → Distribute App → TestFlight**. Die Kolleg*innen bekommen eine
  Einladung per E-Mail und installieren die App über die TestFlight-App. Ein TestFlight-Build läuft 90 Tage und muss dann neu hochgeladen werden.
- **Dauerhaft, ohne Ablauf:** Verteilung als **„Unlisted App“** im App Store (nur per Link auffindbar,
  Antrag unter https://developer.apple.com/contact/request/unlisted-app/), oder über ein MDM der Schule bzw. des Schulträgers
  („Custom App“ im Apple Business/School Manager).

### 5. Einrichten auf jedem iPhone

1. Die App öffnen, die Server-Adresse eingeben und sich mit Name, Kürzel und Schulcode anmelden.
2. **Mitteilungen erlauben**, bei der Frage nach **kritischen Hinweisen** ebenfalls „Erlauben“ tippen.
3. **Kollegium → „⚙️ Alarm-Einstellungen des Handys“**: Alle Punkte sollten grün sein.
4. **„Testalarm in 5 Sekunden“** tippen, das iPhone sofort sperren und stummschalten, dann muss die Sirene kommen.
   „Testalarm über den Schulserver“ prüft zusätzlich den kompletten Weg über Apple.

## Technik

- SwiftUI-App mit `WKWebView`. Die Web-Oberfläche spricht über `window.NativeAlarm` mit der App,
  über dieselbe Schnittstelle wie die Android-App.
- Mitteilungsstufen: `critical` mit `siren.wav` (25 s) bei Genehmigung, sonst `time-sensitive`. Der Amokalarm ist
  `time-sensitive` ohne Ton.
- Der Server sendet per HTTP/2 an Apple mit Token-Authentifizierung (`notfall-app/lib/apns.js`) und kommt
  ohne zusätzliche Pakete aus. Abgemeldete Geräte werden automatisch entfernt.
- Der Sitzungs-Token liegt im iOS-Schlüsselbund. Die App verbindet sich nur über HTTPS.
- Bei jedem Push auf GitHub wird geprüft, ob die App fehlerfrei baut (Workflow „iPhone-App prüfen“).
