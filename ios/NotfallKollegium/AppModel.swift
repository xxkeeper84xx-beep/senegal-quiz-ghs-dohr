import Foundation
import Security

/// Zustand der App: Server-Adresse, Anmeldung, offene Alarme.
final class AppModel: ObservableObject {
    static let shared = AppModel()

    @Published private(set) var serverURL: String?
    @Published var pendingAlarmId: String?
    @Published var showSettings = false
    /// Ändert sich, wenn die Web-Oberfläche neu geladen werden soll.
    @Published var reloadID = UUID()

    var sessionToken: String? { Keychain.get("sessionToken") }

    private init() {
        serverURL = UserDefaults.standard.string(forKey: "serverURL") ?? AppModel.bundledServerURL
    }

    /// Optional beim Bauen fest eingetragene Adresse (Build-Einstellung NOTFALL_SERVER_URL).
    static var bundledServerURL: String? {
        guard let s = Bundle.main.object(forInfoDictionaryKey: "NotfallServerURL") as? String,
              !s.isEmpty, !s.hasPrefix("$(") else { return nil }
        return normalize(s)
    }

    static func normalize(_ raw: String) -> String {
        var s = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        while s.hasSuffix("/") { s.removeLast() }
        if !s.isEmpty && !s.lowercased().hasPrefix("https://") && !s.lowercased().hasPrefix("http://") {
            s = "https://" + s
        }
        return s
    }

    /// Gibt false zurück, wenn die Adresse ungültig ist. Nur HTTPS ist erlaubt.
    @discardableResult
    func setServer(_ raw: String) -> Bool {
        let s = AppModel.normalize(raw)
        guard let url = URL(string: s), url.scheme == "https", let host = url.host, !host.isEmpty else { return false }
        UserDefaults.standard.set(s, forKey: "serverURL")
        serverURL = s
        reloadID = UUID()
        return true
    }

    func changeServer() {
        PushManager.shared.unregisterFromServer()
        Keychain.set(nil, for: "sessionToken")
        UserDefaults.standard.removeObject(forKey: "serverURL")
        serverURL = nil
        showSettings = false
    }

    /// Aufruf aus der Web-Oberfläche nach der Anmeldung.
    func setSession(_ token: String) {
        Keychain.set(token, for: "sessionToken")
        PushManager.shared.registerWithServer()
    }

    /// Aufruf aus der Web-Oberfläche beim Abmelden.
    func clearSession() {
        PushManager.shared.unregisterFromServer()
        Keychain.set(nil, for: "sessionToken")
    }

    func openAlarm(_ id: String) {
        pendingAlarmId = id
    }

    func isSameOrigin(_ url: URL?) -> Bool {
        guard let url, let server = serverURL.flatMap(URL.init(string:)) else { return false }
        return url.scheme == server.scheme && url.host == server.host && url.port == server.port
    }
}

/// Sitzungs-Token sicher im Schlüsselbund speichern.
enum Keychain {
    private static func query(_ key: String) -> [String: Any] {
        [kSecClass as String: kSecClassGenericPassword,
         kSecAttrService as String: "de.schule.notfall",
         kSecAttrAccount as String: key]
    }

    static func set(_ value: String?, for key: String) {
        SecItemDelete(query(key) as CFDictionary)
        UserDefaults.standard.removeObject(forKey: "fallback." + key)
        guard let value else { return }
        var item = query(key)
        item[kSecValueData as String] = Data(value.utf8)
        // Auch bei gesperrtem Gerät lesbar (nach dem ersten Entsperren), damit Push-Registrierungen funktionieren
        item[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock
        if SecItemAdd(item as CFDictionary, nil) != errSecSuccess {
            // Schlüsselbund nicht verfügbar (z. B. unsignierter Test-Build) – im App-Speicher ablegen
            UserDefaults.standard.set(value, forKey: "fallback." + key)
        }
    }

    static func get(_ key: String) -> String? {
        var q = query(key)
        q[kSecReturnData as String] = true
        q[kSecMatchLimit as String] = kSecMatchLimitOne
        var out: CFTypeRef?
        guard SecItemCopyMatching(q as CFDictionary, &out) == errSecSuccess, let data = out as? Data else {
            return UserDefaults.standard.string(forKey: "fallback." + key)
        }
        return String(data: data, encoding: .utf8)
    }
}
