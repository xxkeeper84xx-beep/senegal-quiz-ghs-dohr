package de.schule.notfall

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.app.NotificationManager
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.widget.CheckBox
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView

/**
 * Prüft alle Geräte-Einstellungen, die nötig sind, damit der Alarm auch bei
 * Stummschaltung, „Nicht stören“ und gesperrtem Bildschirm durchkommt.
 */
class SettingsActivity : Activity() {

    override fun onResume() {
        super.onResume()
        render()
    }

    private fun render() {
        val nm = getSystemService(NotificationManager::class.java)
        val pm = getSystemService(PowerManager::class.java)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(32), dp(20), dp(32))
        }
        root.addView(text("Alarm-Einstellungen", 24f, Color.WHITE))
        root.addView(text("Damit der Alarm wie bei NINA auch bei stummgeschaltetem Handy laut durchkommt, " +
            "müssen alle Punkte grün sein.", 15f, Color.LTGRAY).apply { setPadding(0, dp(8), 0, dp(16)) })

        val notifOk = Build.VERSION.SDK_INT < 33 ||
            checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
        val channelOk = nm.areNotificationsEnabled() &&
            nm.getNotificationChannel(AlarmController.CH_ALARM)?.importance != NotificationManager.IMPORTANCE_NONE
        check(root, "Benachrichtigungen erlaubt", notifOk && channelOk, "Ohne Benachrichtigungen kann kein Alarm angezeigt werden.") {
            if (!notifOk && Build.VERSION.SDK_INT >= 33) requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 1)
            else startActivity(Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, packageName))
        }

        check(root, "„Nicht stören“ durchbrechen", nm.isNotificationPolicyAccessGranted,
            "Erlaubt der App, „Nicht stören“ während eines Alarms kurz aufzuheben. In der Liste „Notfall Kollegium“ aktivieren.") {
            startActivity(Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS))
        }

        val fullScreenOk = Build.VERSION.SDK_INT < 34 || nm.canUseFullScreenIntent()
        check(root, "Vollbild-Alarm auf dem Sperrbildschirm", fullScreenOk,
            "Schaltet bei Alarm das Display ein und zeigt den Alarm groß an.") {
            if (Build.VERSION.SDK_INT >= 34) {
                startActivity(Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT, Uri.parse("package:$packageName")))
            }
        }

        check(root, "Akku-Optimierung deaktiviert", pm.isIgnoringBatteryOptimizations(packageName),
            "Sonst trennt Android die Verbindung im Ruhezustand und Alarme kommen verspätet oder gar nicht an.") {
            @SuppressLint("BatteryLife")
            val i = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:$packageName"))
            startActivity(i)
        }

        val connected = AlarmService.connected
        check(root, "Verbunden mit dem Alarmserver", connected,
            if (connected) Prefs.serverUrl(this)
            else if (Prefs.token(this) == null) "Bitte in der App anmelden."
            else "Keine Verbindung: ${AlarmService.lastError ?: "wird hergestellt …"}") {
            AlarmService.start(this)
            root.postDelayed({ render() }, 1500)
        }

        root.addView(CheckBox(this).apply {
            text = "Alarm-Lautstärke beim Alarm auf Maximum setzen"
            setTextColor(Color.WHITE)
            isChecked = Prefs.maxVolume(this@SettingsActivity)
            setOnCheckedChangeListener { _, v -> Prefs.setMaxVolume(this@SettingsActivity, v) }
        }, LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(12) })

        root.addView(Ui.button(this, "🔊  Testalarm (laut, auch im Stumm-Modus)", Color.parseColor("#C75000"), Color.WHITE) {
            AlarmController.start(this, AlarmController.AlarmInfo(
                id = "test", title = "🔔 TESTALARM", location = "Test – kein Notfall",
                text = "So sieht und hört sich ein Alarm an. Mit „Ton aus“ beenden.",
                color = Color.parseColor("#C75000"), silent = false,
            ))
        }, LinearLayout.LayoutParams(-1, dp(56)).apply { topMargin = dp(20) })

        root.addView(Ui.button(this, "📳  Test stiller Alarm (Amok: nur Vibration)", Color.parseColor("#B00020"), Color.WHITE) {
            AlarmController.start(this, AlarmController.AlarmInfo(
                id = "test", title = "🔔 TEST STILLER ALARM", location = "Test – kein Notfall",
                text = "Beim Amokalarm vibriert das Handy nur und zeigt den Alarm an.",
                color = Color.parseColor("#B00020"), silent = true,
            ))
        }, LinearLayout.LayoutParams(-1, dp(56)).apply { topMargin = dp(10) })

        root.addView(text("Tipp: Bei Samsung, Xiaomi, Huawei u. a. zusätzlich in den Akku-Einstellungen " +
            "„Notfall Kollegium“ als „Nicht optimiert / Keine Einschränkungen“ eintragen und Autostart erlauben.",
            13f, Color.GRAY).apply { setPadding(0, dp(20), 0, 0) })

        setContentView(ScrollView(this).apply { setBackgroundColor(Color.parseColor("#14161A")); addView(root) })
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        render()
    }

    private fun check(root: LinearLayout, title: String, ok: Boolean, hint: String, fix: () -> Unit) {
        val box = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(14), dp(12), dp(14), dp(12))
            background = android.graphics.drawable.GradientDrawable().apply {
                setColor(Color.parseColor("#1E2127"))
                setStroke(dp(2), if (ok) Color.parseColor("#2FA86A") else Color.parseColor("#E5383B"))
                cornerRadius = dp(12).toFloat()
            }
            if (!ok) setOnClickListener { fix() }
        }
        box.addView(text((if (ok) "✅  " else "❌  ") + title, 17f, Color.WHITE))
        box.addView(text(hint + if (ok) "" else "\n➜ Antippen zum Einrichten", 13f, Color.LTGRAY))
        root.addView(box, LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(10) })
    }

    private fun text(s: String, size: Float, color: Int) = TextView(this).apply { text = s; textSize = size; setTextColor(color) }
    private fun dp(v: Int) = Ui.dp(this, v)
}
