package de.schule.notfall

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.text.InputType
import android.view.Gravity
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast

/**
 * Zeigt die Web-Oberfläche der Schule (Notfallknöpfe, Chat …) und verbindet sie
 * über eine JavaScript-Brücke mit dem nativen Alarm.
 */
class MainActivity : Activity() {

    companion object {
        const val EXTRA_ALARM_ID = "alarmId"
    }

    private var web: WebView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        AlarmController.createChannels(this)
        window.statusBarColor = Color.parseColor("#1E2127")
        if (Build.VERSION.SDK_INT >= 33 &&
            checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 1)
        }
        if (Prefs.serverUrl(this).isBlank()) showServerSetup() else showWeb(intent.getStringExtra(EXTRA_ALARM_ID))
        AlarmService.start(this)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        intent.getStringExtra(EXTRA_ALARM_ID)?.let { id ->
            web?.evaluateJavascript("window.openAlarmFromNative && window.openAlarmFromNative(${org.json.JSONObject.quote(id)})", null)
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        val w = web
        if (w != null && w.canGoBack()) w.goBack() else @Suppress("DEPRECATION") super.onBackPressed()
    }

    // ------------------------------------------------------------------ Server-Adresse
    private fun showServerSetup() {
        web = null
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#14161A"))
            setPadding(Ui.dp(this@MainActivity, 24), Ui.dp(this@MainActivity, 64), Ui.dp(this@MainActivity, 24), Ui.dp(this@MainActivity, 24))
        }
        fun label(s: String, size: Float = 16f) = TextView(this).apply { text = s; textSize = size; setTextColor(Color.WHITE) }
        root.addView(label("🚨 Notfall Kollegium", 26f).apply { gravity = Gravity.CENTER })
        root.addView(label("Bitte die Adresse des Alarmservers eurer Schule eingeben (bekommt ihr von der Schulleitung):").apply {
            setPadding(0, Ui.dp(this@MainActivity, 24), 0, Ui.dp(this@MainActivity, 8))
        })
        val input = EditText(this).apply {
            hint = "https://notfall.meine-schule.de"
            setText(Prefs.serverUrl(this@MainActivity))
            inputType = InputType.TYPE_TEXT_VARIATION_URI
            setTextColor(Color.WHITE)
            setHintTextColor(Color.GRAY)
        }
        root.addView(input)
        root.addView(Ui.button(this, "Weiter", Color.parseColor("#2F7CF6"), Color.WHITE) {
            val url = Prefs.normalizeUrl(input.text.toString())
            if (Uri.parse(url).host.isNullOrBlank()) {
                Toast.makeText(this, "Ungültige Adresse", Toast.LENGTH_SHORT).show()
            } else {
                Prefs.setServerUrl(this, url)
                showWeb(null)
            }
        }, LinearLayout.LayoutParams(-1, Ui.dp(this, 56)).apply { topMargin = Ui.dp(this@MainActivity, 16) })
        setContentView(root)
    }

    // ------------------------------------------------------------------ Web-Oberfläche
    @SuppressLint("SetJavaScriptEnabled")
    private fun showWeb(alarmId: String?) {
        val server = Prefs.serverUrl(this)
        val w = WebView(this)
        w.settings.javaScriptEnabled = true
        w.settings.domStorageEnabled = true
        w.settings.mediaPlaybackRequiresUserGesture = false
        w.setBackgroundColor(Color.parseColor("#14161A"))
        w.addJavascriptInterface(Bridge(), "NativeAlarm")
        w.webChromeClient = WebChromeClient()
        w.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url.toString()
                if (Prefs.sameOrigin(url, server)) return false
                // tel:, fremde Seiten usw. außerhalb der App öffnen
                try {
                    val action = if (request.url.scheme == "tel") Intent.ACTION_DIAL else Intent.ACTION_VIEW
                    startActivity(Intent(action, request.url))
                } catch (_: Exception) {}
                return true
            }

            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: android.webkit.WebResourceError) {
                if (request.isForMainFrame) {
                    view.loadDataWithBaseURL(null, """
                        <body style="background:#14161a;color:#fff;font-family:sans-serif;padding:24px">
                        <h2>Server nicht erreichbar</h2><p>${android.text.TextUtils.htmlEncode(server)}</p>
                        <p>Bitte Internetverbindung prüfen.</p>
                        <p><b>Im Notfall: 110 / 112 anrufen!</b></p>
                        <button style="font-size:18px;padding:12px" onclick="location.href='${server}/'">Erneut versuchen</button>
                        <button style="font-size:18px;padding:12px" onclick="NativeAlarm.changeServer()">Adresse ändern</button>
                        </body>""".trimIndent(), "text/html", "utf-8", null)
                }
            }
        }
        val url = server + "/" + (alarmId?.let { "?alarm=" + Uri.encode(it) } ?: "")
        w.loadUrl(url)
        web = w
        setContentView(w)
    }

    /** Wird aus der Web-Oberfläche aufgerufen (window.NativeAlarm). */
    inner class Bridge {
        private fun fromServer(): Boolean {
            // Nur die Seite des eingestellten Servers darf die Brücke benutzen
            var ok = false
            val latch = java.util.concurrent.CountDownLatch(1)
            runOnUiThread { ok = web?.url?.let { Prefs.sameOrigin(it, Prefs.serverUrl(this@MainActivity)) } == true; latch.countDown() }
            latch.await()
            return ok
        }

        @JavascriptInterface fun isNative(): Boolean = true

        @JavascriptInterface
        fun setSession(token: String) {
            if (!fromServer()) return
            val changed = Prefs.token(this@MainActivity) != token
            Prefs.setToken(this@MainActivity, token)
            runOnUiThread {
                if (changed) AlarmService.stop(this@MainActivity)
                AlarmService.start(this@MainActivity)
            }
        }

        @JavascriptInterface
        fun clearSession() {
            if (!fromServer()) return
            Prefs.setToken(this@MainActivity, null)
            Prefs.setUserId(this@MainActivity, null)
            runOnUiThread { AlarmService.stop(this@MainActivity) }
        }

        @JavascriptInterface fun stopAlarm() = AlarmController.stopSoundAndVibration(this@MainActivity)

        @JavascriptInterface fun dismissAlarm(id: String) = AlarmController.dismiss(this@MainActivity, id)

        @JavascriptInterface
        fun openSettings() = runOnUiThread { startActivity(Intent(this@MainActivity, SettingsActivity::class.java)) }

        @JavascriptInterface
        fun changeServer() = runOnUiThread { showServerSetup() }

        @JavascriptInterface fun isConnected(): Boolean = AlarmService.connected
    }
}
