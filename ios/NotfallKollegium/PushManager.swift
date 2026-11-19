import Foundation
import UIKit
import UserNotifications

/// Mitteilungen: Berechtigungen (inkl. „Kritische Hinweise“), Geräte-Token, Registrierung beim Schulserver.
final class PushManager: ObservableObject {
    static let shared = PushManager()

    @Published private(set) var authorization: UNAuthorizationStatus = .notDetermined
    @Published private(set) var critical: UNNotificationSetting = .notSupported
    @Published private(set) var timeSensitive: UNNotificationSetting = .notSupported
    @Published private(set) var deviceToken: String?
    @Published private(set) var serverRegistered = false
    @Published private(set) var lastError: String?

    /// Debug-Builds aus Xcode nutzen die Apple-Testumgebung, alle anderen die Produktivumgebung.
    private var environment: String {
        #if DEBUG
        return "sandbox"
        #else
        return "production"
        #endif
    }

    private init() {}

    func requestAuthorization() {
        // .criticalAlert wirkt nur, wenn Apple die Berechtigung „Critical Alerts“ erteilt hat
        let options: UNAuthorizationOptions = [.alert, .sound, .badge, .criticalAlert]
        UNUserNotificationCenter.current().requestAuthorization(options: options) { _, error in
            if let error { self.setError(error.localizedDescription) }
            self.refreshSettings()
            DispatchQueue.main.async { UIApplication.shared.registerForRemoteNotifications() }
        }
    }

    func refreshSettings() {
        UNUserNotificationCenter.current().getNotificationSettings { s in
            DispatchQueue.main.async {
                let criticalChanged = self.critical != s.criticalAlertSetting
                self.authorization = s.authorizationStatus
                self.critical = s.criticalAlertSetting
                self.timeSensitive = s.timeSensitiveSetting
                // Server muss wissen, ob dieses Gerät kritische Hinweise annehmen darf
                if criticalChanged { self.registerWithServer() }
            }
        }
    }

    func didRegister(deviceToken data: Data) {
        let token = data.map { String(format: "%02x", $0) }.joined()
        DispatchQueue.main.async {
            self.deviceToken = token
            self.registerWithServer()
        }
    }

    func didFailToRegister(error: Error) {
        setError("Keine Push-Registrierung bei Apple möglich: \(error.localizedDescription)")
    }

    // MARK: - Schulserver

    func registerWithServer() {
        guard let token = deviceToken, AppModel.shared.sessionToken != nil else { return }
        post("/api/apns/register", [
            "deviceToken": token,
            "critical": critical == .enabled,
            "environment": environment,
        ]) { ok, message in
            self.serverRegistered = ok
            if !ok { self.setError(message ?? "Registrierung beim Server fehlgeschlagen.") }
            else { self.lastError = nil }
        }
    }

    func unregisterFromServer() {
        guard let token = deviceToken else { return }
        post("/api/apns/unregister", ["deviceToken": token]) { _, _ in self.serverRegistered = false }
    }

    /// Testalarm vom Server über Apple – prüft den kompletten Weg.
    func serverTest(completion: @escaping (String) -> Void) {
        post("/api/apns/test", [:]) { ok, message in
            completion(ok ? "Testalarm gesendet – kommt gleich an." : (message ?? "Fehler"))
        }
    }

    /// Lokaler Testalarm in 5 Sekunden (Zeit, um das iPhone zu sperren oder stummzuschalten).
    func localTest(silent: Bool) {
        let content = UNMutableNotificationContent()
        content.title = silent ? "🔔 TEST STILLER ALARM" : "🔔 TESTALARM"
        content.body = silent ? "So kommt ein Amokalarm an: ohne Ton." : "Test – kein Notfall. So klingt ein Alarm."
        content.userInfo = ["alarmId": "test"]
        if silent {
            content.interruptionLevel = .timeSensitive
        } else if critical == .enabled {
            content.interruptionLevel = .critical
            content.sound = .criticalSoundNamed(UNNotificationSoundName("siren.wav"), withAudioVolume: 1.0)
        } else {
            content.interruptionLevel = .timeSensitive
            content.sound = UNNotificationSound(named: UNNotificationSoundName("siren.wav"))
        }
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 5, repeats: false)
        let request = UNNotificationRequest(identifier: "test-\(UUID().uuidString)", content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request)
    }

    private func setError(_ message: String) {
        DispatchQueue.main.async { self.lastError = message }
    }

    private func post(_ path: String, _ body: [String: Any], completion: @escaping (Bool, String?) -> Void) {
        guard let server = AppModel.shared.serverURL, let url = URL(string: server + path),
              let session = AppModel.shared.sessionToken else {
            completion(false, "Nicht angemeldet.")
            return
        }
        var req = URLRequest(url: url, timeoutInterval: 20)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(session)", forHTTPHeaderField: "Authorization")
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)
        URLSession.shared.dataTask(with: req) { data, response, error in
            let status = (response as? HTTPURLResponse)?.statusCode ?? 0
            var message = error?.localizedDescription
            if let data, let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let e = json["error"] as? String {
                message = e
            }
            DispatchQueue.main.async { completion((200..<300).contains(status), message) }
        }.resume()
    }
}
