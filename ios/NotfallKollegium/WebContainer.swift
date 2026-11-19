import SwiftUI
import UIKit
import UserNotifications
import WebKit

/// Zeigt die Web-Oberfläche des Schulservers und verbindet sie über `window.NativeAlarm` mit der App
/// (gleiche Schnittstelle wie die Android-App).
struct WebContainer: UIViewRepresentable {
    @EnvironmentObject private var model: AppModel

    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let controller = WKUserContentController()
        controller.add(context.coordinator, name: "nativeAlarm")
        controller.addUserScript(WKUserScript(source: Coordinator.bridgeScript, injectionTime: .atDocumentStart, forMainFrameOnly: true))

        let config = WKWebViewConfiguration()
        config.userContentController = controller
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        let web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = context.coordinator
        web.uiDelegate = context.coordinator
        web.isOpaque = false
        web.backgroundColor = UIColor(red: 0.08, green: 0.09, blue: 0.10, alpha: 1)
        web.scrollView.contentInsetAdjustmentBehavior = .never
        web.allowsBackForwardNavigationGestures = false
        context.coordinator.webView = web
        context.coordinator.load()
        return web
    }

    func updateUIView(_ web: WKWebView, context: Context) {
        let c = context.coordinator
        if c.loadedReloadID != model.reloadID { c.load() }
        if let id = model.pendingAlarmId {
            DispatchQueue.main.async {
                AppModel.shared.pendingAlarmId = nil
                c.openAlarm(id)
            }
        }
    }

    static func dismantleUIView(_ web: WKWebView, coordinator: Coordinator) {
        web.configuration.userContentController.removeScriptMessageHandler(forName: "nativeAlarm")
    }

    final class Coordinator: NSObject, WKScriptMessageHandler, WKNavigationDelegate, WKUIDelegate {
        weak var webView: WKWebView?
        var loadedReloadID: UUID?
        private var pageLoaded = false
        private var queuedAlarm: String?

        static let bridgeScript = """
        (function () {
          function post(action, value) {
            try { window.webkit.messageHandlers.nativeAlarm.postMessage({ action: action, value: value || null }); } catch (e) {}
          }
          window.NativeAlarm = {
            isNative: function () { return true; },
            platform: function () { return 'ios'; },
            setSession: function (token) { post('setSession', token); },
            clearSession: function () { post('clearSession'); },
            stopAlarm: function () { post('stopAlarm'); },
            dismissAlarm: function (id) { post('dismissAlarm', id); },
            openSettings: function () { post('openSettings'); },
            changeServer: function () { post('changeServer'); },
            isConnected: function () { return true; }
          };
        })();
        """

        func load() {
            let model = AppModel.shared
            loadedReloadID = model.reloadID
            pageLoaded = false
            // Ein offener Alarm (Mitteilung angetippt) wird nach dem Laden über openAlarm() angezeigt
            guard let server = model.serverURL, let url = URL(string: server + "/") else { return }
            webView?.load(URLRequest(url: url))
        }

        func openAlarm(_ id: String) {
            guard pageLoaded, let web = webView else { queuedAlarm = id; return }
            let data = (try? JSONSerialization.data(withJSONObject: [id])) ?? Data("[]".utf8)
            let arg = String(data: data, encoding: .utf8) ?? "[]"
            web.evaluateJavaScript("window.openAlarmFromNative && window.openAlarmFromNative(\(arg)[0])")
        }

        // MARK: Brücke

        func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
            guard let body = message.body as? [String: Any], let action = body["action"] as? String else { return }
            let model = AppModel.shared
            // „Adresse ändern“ ist auch von der Fehlerseite aus erlaubt, alles andere nur von der Schulserver-Seite
            if action == "changeServer" { model.changeServer(); return }
            let origin = message.frameInfo.securityOrigin
            var comps = URLComponents()
            comps.scheme = origin.protocol
            comps.host = origin.host
            if origin.port != 0 { comps.port = origin.port }
            guard message.frameInfo.isMainFrame, model.isSameOrigin(comps.url) else { return }

            switch action {
            case "setSession":
                if let token = body["value"] as? String, !token.isEmpty { model.setSession(token) }
            case "clearSession":
                model.clearSession()
            case "openSettings":
                model.showSettings = true
            case "stopAlarm", "dismissAlarm":
                // Zugestellte Alarm-Mitteilungen entfernen (beendet einen noch laufenden Ton)
                UNUserNotificationCenter.current().removeAllDeliveredNotifications()
            default:
                break
            }
        }

        // MARK: Navigation

        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = navigationAction.request.url else { decisionHandler(.cancel); return }
            if url.scheme == "about" || AppModel.shared.isSameOrigin(url) {
                decisionHandler(.allow)
                return
            }
            // tel:110, externe Links usw. außerhalb der App öffnen
            UIApplication.shared.open(url)
            decisionHandler(.cancel)
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            pageLoaded = true
            if let id = queuedAlarm {
                queuedAlarm = nil
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { self.openAlarm(id) }
            }
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            showError(webView, error)
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            showError(webView, error)
        }

        private func showError(_ webView: WKWebView, _ error: Error) {
            if (error as NSError).code == NSURLErrorCancelled { return }
            let server = AppModel.shared.serverURL ?? ""
            let esc = { (s: String) in
                s.replacingOccurrences(of: "&", with: "&amp;").replacingOccurrences(of: "<", with: "&lt;")
                    .replacingOccurrences(of: "\"", with: "&quot;").replacingOccurrences(of: "'", with: "&#39;")
            }
            let html = """
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <body style="background:#14161a;color:#fff;font-family:-apple-system,sans-serif;padding:48px 24px">
            <h2>Server nicht erreichbar</h2><p>\(esc(server))</p><p>\(esc(error.localizedDescription))</p>
            <p><b>Im Notfall: 110 / 112 anrufen!</b></p>
            <p><button style="font-size:18px;padding:12px" onclick="location.href='\(esc(server))/'">Erneut versuchen</button></p>
            <p><button style="font-size:18px;padding:12px" onclick="NativeAlarm.changeServer()">Adresse ändern</button></p>
            </body>
            """
            webView.loadHTMLString(html, baseURL: nil)
        }

        // MARK: alert() / confirm() der Web-Oberfläche

        func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
                     initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
            let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler() })
            present(alert, fallback: completionHandler)
        }

        func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
                     initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
            let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "Abbrechen", style: .cancel) { _ in completionHandler(false) })
            alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler(true) })
            present(alert, fallback: { completionHandler(false) })
        }

        private func present(_ alert: UIAlertController, fallback: @escaping () -> Void) {
            let scene = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.first
            var top = scene?.windows.first(where: { $0.isKeyWindow })?.rootViewController
            while let presented = top?.presentedViewController { top = presented }
            guard let top else { fallback(); return }
            top.present(alert, animated: true)
        }
    }
}
