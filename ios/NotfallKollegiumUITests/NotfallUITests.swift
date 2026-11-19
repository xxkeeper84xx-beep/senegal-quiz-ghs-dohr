import XCTest

/// Spielt einen kompletten Alarm in der iPhone-App durch (Simulator) und macht dabei Bildschirmfotos.
/// Erwartet einen laufenden Notfall-Server unter http://localhost:3000 mit SCHULCODE=TEST123.
final class NotfallUITests: XCTestCase {
    private let server = "http://localhost:3000"

    override func setUp() {
        continueAfterFailure = false
    }

    func testAlarmAblauf() throws {
        let app = XCUIApplication()
        app.launchArguments += ["-AppleLanguages", "(de)", "-AppleLocale", "de_DE"]
        app.launch()

        // Abfrage „Mitteilungen erlauben?“ bestätigen
        let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        for label in ["Allow", "Erlauben"] {
            let button = springboard.buttons[label]
            if button.waitForExistence(timeout: 8) { button.tap(); break }
        }

        // Anmeldung in der Web-Oberfläche
        let web = app.webViews.firstMatch
        XCTAssertTrue(web.waitForExistence(timeout: 30))
        let nameField = web.textFields.element(boundBy: 0)
        require(nameField, 30, "Anmeldeseite nicht geladen", app)
        shot("01 Anmeldung", app)
        enter(nameField, "Iris Phone")
        enter(web.textFields.element(boundBy: 1), "IPH")
        enter(web.textFields.element(boundBy: 2), "TEST123")
        web.buttons["Anmelden"].tap()

        // Standort wählen
        let chip = web.buttons["Lehrerzimmer"]
        require(chip, 20, "Standort-Dialog fehlt", app)
        chip.tap()
        web.buttons["Speichern"].tap()
        sleep(2)
        shot("02 Notfallknoepfe", app)

        // Eine Kollegin löst über den Server einen medizinischen Notfall aus
        let kai = post("/api/login", ["name": "Kai Lehrer", "shortName": "KAI", "code": "TEST123"])
        let token = try XCTUnwrap(kai["token"] as? String)
        _ = post("/api/alarms", ["type": "medical", "location": "Turnhalle", "note": "Schüler gestürzt, nicht ansprechbar"], token: token)

        // Überschrift wird per CSS in Großbuchstaben dargestellt – daher ohne Groß-/Kleinschreibung suchen
        let title = web.staticTexts.matching(NSPredicate(format: "label CONTAINS[c] 'medizinischer notfall'")).firstMatch
        require(title, 20, "Alarm ist in der App nicht angekommen", app)
        sleep(1)
        shot("03 Alarm eingegangen", app)

        let coming = web.buttons.matching(NSPredicate(format: "label CONTAINS[c] 'ich komme'")).firstMatch
        require(coming, 10, "Rückmelde-Knopf fehlt", app)
        coming.tap()
        sleep(2)
        shot("04 Rueckmeldung gegeben", app)

        // Native Alarm-Einstellungen öffnen
        let minimize = web.buttons.matching(NSPredicate(format: "label CONTAINS[c] 'minimieren'")).firstMatch
        require(minimize, 10, "Minimieren fehlt", app)
        minimize.tap()
        let teamTab = web.buttons.matching(NSPredicate(format: "label CONTAINS 'Kollegium'")).firstMatch
        require(teamTab, 10, "Reiter Kollegium fehlt", app)
        teamTab.tap()
        let settingsButton = web.buttons.matching(NSPredicate(format: "label CONTAINS 'Alarm-Einstellungen'")).firstMatch
        require(settingsButton, 10, "Knopf für native Einstellungen fehlt", app)
        settingsButton.tap()
        require(app.navigationBars["Alarm-Einstellungen"], 10, "Einstellungen nicht geöffnet", app)
        sleep(1)
        shot("05 Alarm-Einstellungen", app)

        // Lokaler Testalarm, dann App in den Hintergrund: Mitteilung auf dem Home-Bildschirm
        app.buttons.matching(NSPredicate(format: "label CONTAINS 'Testalarm in 5 Sekunden'")).firstMatch.tap()
        XCUIDevice.shared.press(.home)
        sleep(8)
        shot("06 Testalarm als Mitteilung", nil)
    }

    // MARK: - Hilfen

    /// Wartet auf ein Element; fehlt es, gibt es ein Foto und den Bildschirminhalt als Text, dann Abbruch.
    private func require(_ element: XCUIElement, _ timeout: TimeInterval, _ message: String, _ app: XCUIApplication) {
        if element.waitForExistence(timeout: timeout) { return }
        shot("FEHLER - \(message)", app)
        print("UI-BAUM:\n\(app.debugDescription)")
        XCTFail(message)
    }

    private func enter(_ field: XCUIElement, _ text: String) {
        field.tap()
        field.typeText(text)
    }

    private func shot(_ name: String, _ app: XCUIApplication?) {
        let attachment = XCTAttachment(screenshot: app?.screenshot() ?? XCUIScreen.main.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }

    private func post(_ path: String, _ body: [String: Any], token: String? = nil) -> [String: Any] {
        var request = URLRequest(url: URL(string: server + path)!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token { request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        let done = expectation(description: path)
        var result: [String: Any] = [:]
        URLSession.shared.dataTask(with: request) { data, _, _ in
            if let data, let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] { result = json }
            done.fulfill()
        }.resume()
        wait(for: [done], timeout: 15)
        return result
    }
}
