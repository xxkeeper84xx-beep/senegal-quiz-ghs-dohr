# 📱 Android-App „Notfall Kollegium“

Native Android-App zur [Notfall-App](../notfall-app/). Wie bei der Warn-App NINA kommt der Alarm **auch dann durch,
wenn das Handy stummgeschaltet ist oder auf „Nicht stören“ steht**.

## Was die App macht

| Situation | Verhalten |
|---|---|
| Handy auf **lautlos / Vibration** | Die Sirene läuft über den **Alarm-Lautstärkekanal** (wie ein Wecker) und wird deshalb nicht stummgeschaltet. Die Alarm-Lautstärke wird kurz auf Maximum gestellt und danach zurückgesetzt. |
| **„Nicht stören“** aktiv | Mit der Berechtigung „Nicht-stören-Zugriff“ lockert die App „Nicht stören“ für die Dauer des Alarms und stellt es danach wieder her. |
| **Bildschirm gesperrt** | Das Display geht an und zeigt den Alarm im Vollbild über dem Sperrbildschirm. |
| App **geschlossen** | Ein Hintergrunddienst hält die Verbindung zum Schulserver offen und startet nach einem Neustart des Handys automatisch. Google-/Firebase-Dienste sind nicht nötig. |
| **Amokalarm** | Standardmäßig ein **stiller Alarm**: Das Handy vibriert und zeigt den Alarm im Vollbild, aber ohne Ton, damit eine versteckte Klasse nicht durch ein klingelndes Handy verraten wird. Wenn auch der Amokalarm laut sein soll, den Server mit `AMOK_STUMM=0` starten. |
| „Brauche Hilfe“ | Meldet eine Kolleg*in „🆘 Brauche Hilfe“, wird erneut alarmiert. |

Der Ton läuft bis „Ton aus / Gesehen“ getippt wird, bis eine Rückmeldung gegeben wird oder höchstens 3 Minuten lang.
Bei einer Entwarnung endet der Alarm auf allen Geräten automatisch.

## Installation auf den Handys

1. Die APK-Datei herunterladen: im GitHub-Repo unter **Actions → „Android-App bauen“ → letzter Lauf → Artifacts**.
   Alternativ selbst bauen (siehe unten).
2. Die APK auf dem Handy öffnen und die Installation aus „unbekannten Quellen“ für diesen einen Vorgang erlauben.
3. Die App öffnen, die **Server-Adresse** eingeben (z. B. `https://notfall.meine-schule.de`) und mit Name, Kürzel und Schulcode anmelden.
4. **Kollegium → „⚙️ Alarm-Einstellungen des Handys“** öffnen und alle Punkte auf grün bringen:
   - Benachrichtigungen erlaubt
   - „Nicht stören“ durchbrechen
   - Vollbild-Alarm auf dem Sperrbildschirm
   - Akku-Optimierung deaktiviert
5. Mit **„Testalarm“** im Stumm-Modus ausprobieren.

> Bei Samsung, Xiaomi, Huawei, Oppo u. a. zusätzlich in den Akku- bzw. App-Einstellungen
> „Keine Einschränkungen“ und Autostart erlauben, sonst beendet das Handy den Hintergrunddienst.
> Hinweise je Hersteller: https://dontkillmyapp.com

## Selbst bauen

Voraussetzungen: JDK 17 und Android SDK.

```bash
cd android
./gradlew assembleRelease                                         # ohne fest eingebaute Server-Adresse
./gradlew assembleRelease -PserverUrl=https://notfall.meine-schule.de
```

Die APK liegt danach unter `app/build/outputs/apk/release/app-release.apk`.

### Feste Signatur (für Updates)

Ohne eigenen Schlüssel wird die APK mit einem zufälligen Debug-Schlüssel signiert. Ein späteres Update
lässt sich dann nur nach einer Deinstallation einspielen. Für den Dauerbetrieb deshalb einmalig einen Schlüssel erzeugen:

```bash
keytool -genkeypair -v -keystore notfall.jks -alias notfall -keyalg RSA -keysize 4096 -validity 10000
base64 -w0 notfall.jks   # Ausgabe als Secret NOTFALL_KEYSTORE_BASE64 im GitHub-Repo hinterlegen
```

Dazu die Secrets `NOTFALL_KEYSTORE_PASSWORD`, `NOTFALL_KEY_ALIAS` (`notfall`) und `NOTFALL_KEY_PASSWORD` anlegen.
Die Datei `notfall.jks` sicher aufbewahren und **nicht** ins Repository legen.

## Hinweise

- Die App verbindet sich nur über **HTTPS** mit dem Server.
- Mindestversion: Android 8.1.
- **iPhone:** Apple erlaubt das Durchbrechen des Stumm-Schalters nur Apps mit der Sondergenehmigung
  „Critical Alerts“, die man bei Apple beantragen muss (so macht es NINA). Dafür sind ein Apple-Developer-Konto
  (99 €/Jahr), ein Mac mit Xcode und eine eigene iOS-App nötig. Bis dahin bekommen iPhones Alarme über die
  installierte Web-App per Push-Nachricht, die aber vom Stumm-Schalter stummgeschaltet wird.
