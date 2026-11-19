package de.schule.notfall

import android.app.Activity
import android.app.KeyguardManager
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.Gravity
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.TextView
import java.lang.ref.WeakReference

/** Vollbild-Alarm – erscheint auch auf dem Sperrbildschirm und schaltet das Display ein. */
class AlarmActivity : Activity() {

    companion object {
        private var instance: WeakReference<AlarmActivity>? = null
        fun closeIfOpen() { instance?.get()?.runOnUiThread { instance?.get()?.finish() } }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        instance = WeakReference(this)
        setShowWhenLocked(true)
        setTurnScreenOn(true)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        render()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        render()
    }

    override fun onDestroy() {
        if (instance?.get() === this) instance = null
        super.onDestroy()
    }

    private fun render() {
        val info = AlarmController.current
        if (info == null) { finish(); return }
        window.statusBarColor = info.color

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_HORIZONTAL
            setBackgroundColor(info.color)
            setPadding(dp(24), dp(48), dp(24), dp(32))
        }
        root.addView(text(info.title, 30f, bold = true))
        root.addView(text("📍 ${info.location}", 26f, bold = true).apply {
            setBackgroundColor(Color.argb(80, 0, 0, 0))
            setPadding(dp(12), dp(12), dp(12), dp(12))
        }, LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(24) })
        root.addView(text(info.text, 18f), LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(16) })
        if (info.silent) {
            root.addView(text("Stiller Alarm – Tür abschließen, Licht aus, Ruhe bewahren, 110 wählen.", 16f).apply {
                alpha = 0.9f
            }, LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(16) })
        }

        root.addView(android.view.View(this), LinearLayout.LayoutParams(1, 0, 1f))

        root.addView(Ui.button(this, if (AlarmController.isRinging()) "🔕  Ton aus / Gesehen" else "✔  Gesehen", Color.WHITE, Color.BLACK) {
            AlarmController.stopSoundAndVibration(this)
            render()
        }, LinearLayout.LayoutParams(-1, dp(64)))

        root.addView(Ui.button(this, "App öffnen – Rückmeldung & Chat", Color.argb(90, 0, 0, 0), Color.WHITE) {
            AlarmController.stopSoundAndVibration(this)
            val km = getSystemService(KeyguardManager::class.java)
            val open = { startActivity(Intent(this, MainActivity::class.java)
                .putExtra(MainActivity.EXTRA_ALARM_ID, info.id)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)); finish() }
            if (km.isKeyguardLocked) {
                km.requestDismissKeyguard(this, object : KeyguardManager.KeyguardDismissCallback() {
                    override fun onDismissSucceeded() = open()
                })
            } else open()
        }, LinearLayout.LayoutParams(-1, dp(64)).apply { topMargin = dp(12) })

        setContentView(root)
    }

    private fun text(s: String, size: Float, bold: Boolean = false) = TextView(this).apply {
        text = s
        textSize = size
        setTextColor(Color.WHITE)
        gravity = Gravity.CENTER
        if (bold) setTypeface(typeface, android.graphics.Typeface.BOLD)
    }

    private fun dp(v: Int) = Ui.dp(this, v)
}
