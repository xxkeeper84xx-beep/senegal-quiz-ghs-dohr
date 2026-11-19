import SwiftUI
import UIKit
import UserNotifications

struct RootView: View {
    @EnvironmentObject private var model: AppModel
    @EnvironmentObject private var push: PushManager
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        Group {
            if model.serverURL == nil {
                ServerSetupView()
            } else {
                WebContainer()
                    .ignoresSafeArea()
            }
        }
        .background(Color(red: 0.08, green: 0.09, blue: 0.10).ignoresSafeArea())
        .preferredColorScheme(.dark)
        .sheet(isPresented: $model.showSettings) {
            SettingsView().environmentObject(model).environmentObject(push)
        }
        .onChange(of: scenePhase) { phase in
            if phase == .active { push.refreshSettings() }
        }
    }
}

struct ServerSetupView: View {
    @EnvironmentObject private var model: AppModel
    @State private var address = ""
    @State private var invalid = false

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("🚨 Notfall Kollegium").font(.largeTitle.bold())
            Text("Bitte die Adresse des Alarmservers eurer Schule eingeben (bekommt ihr von der Schulleitung).")
                .foregroundColor(.secondary)
            TextField("https://notfall.meine-schule.de", text: $address)
                .keyboardType(.URL)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .textFieldStyle(.roundedBorder)
            if invalid {
                Text("Ungültige Adresse – sie muss mit https:// beginnen.").foregroundColor(.red).font(.footnote)
            }
            Button {
                invalid = !model.setServer(address)
            } label: {
                Text("Weiter").bold().frame(maxWidth: .infinity).padding(.vertical, 6)
            }
            .buttonStyle(.borderedProminent)
            Spacer()
            Text("Im Notfall immer auch 110 / 112 anrufen.").font(.footnote).foregroundColor(.secondary)
        }
        .padding(24)
    }
}

struct SettingsView: View {
    @EnvironmentObject private var model: AppModel
    @EnvironmentObject private var push: PushManager
    @Environment(\.openURL) private var openURL
    @State private var testMessage: String?

    var body: some View {
        NavigationView {
            List {
                Section {
                    Text("Damit Alarme auch bei Stummschalter und Fokus/„Nicht stören“ laut ankommen, müssen alle Punkte grün sein.")
                        .font(.callout)
                }

                Section("Status") {
                    row("Mitteilungen erlaubt", ok: push.authorization == .authorized,
                        hint: push.authorization == .denied ? "In den iPhone-Einstellungen erlauben." : nil)
                    row("Kritische Hinweise (Stummschalter durchbrechen)", ok: push.critical == .enabled,
                        hint: criticalHint)
                    row("Dringende Mitteilungen (durchbrechen Fokus)", ok: push.timeSensitive == .enabled,
                        hint: push.timeSensitive == .enabled ? nil : "In den Mitteilungs-Einstellungen „Dringende Mitteilungen“ einschalten.")
                    row("Bei Apple registriert", ok: push.deviceToken != nil, hint: nil)
                    row("Beim Schulserver registriert", ok: push.serverRegistered,
                        hint: push.serverRegistered ? nil : (model.sessionToken == nil ? "Bitte in der App anmelden." : push.lastError))
                }

                Section {
                    Button("Mitteilungs-Einstellungen öffnen") {
                        if let url = URL(string: UIApplication.openNotificationSettingsURLString) { openURL(url) }
                    }
                    Button("Erneut registrieren") {
                        push.requestAuthorization()
                        push.registerWithServer()
                    }
                }

                Section("Testen") {
                    Button("🔊 Testalarm in 5 Sekunden (jetzt iPhone sperren/stummschalten)") {
                        push.localTest(silent: false)
                        testMessage = "Testalarm kommt in 5 Sekunden."
                    }
                    Button("📳 Test stiller Alarm (Amok) in 5 Sekunden") {
                        push.localTest(silent: true)
                        testMessage = "Stiller Testalarm kommt in 5 Sekunden."
                    }
                    Button("🌐 Testalarm über den Schulserver") {
                        push.serverTest { testMessage = $0 }
                    }
                    if let testMessage {
                        Text(testMessage).font(.footnote).foregroundColor(.secondary)
                    }
                }

                Section("Server") {
                    Text(model.serverURL ?? "–").font(.footnote).foregroundColor(.secondary)
                    Button("Server-Adresse ändern", role: .destructive) { model.changeServer() }
                }
            }
            .navigationTitle("Alarm-Einstellungen")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Fertig") { model.showSettings = false }
                }
            }
            .onAppear { push.refreshSettings() }
        }
    }

    private var criticalHint: String? {
        switch push.critical {
        case .enabled: return nil
        case .disabled: return "In den Mitteilungs-Einstellungen „Kritische Hinweise“ einschalten."
        default: return "Diese App-Version hat (noch) keine Apple-Genehmigung für kritische Hinweise. Alarme klingeln dann nur, wenn der Stummschalter aus ist."
        }
    }

    private func row(_ title: String, ok: Bool, hint: String?) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Label(title, systemImage: ok ? "checkmark.circle.fill" : "xmark.octagon.fill")
                .foregroundColor(ok ? .green : .red)
            if let hint, !ok {
                Text(hint).font(.footnote).foregroundColor(.secondary)
            }
        }
    }
}
