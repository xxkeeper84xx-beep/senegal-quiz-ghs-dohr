package de.schule.notfall

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.graphics.drawable.GradientDrawable
import android.view.View
import android.widget.Button

/** Startet die Alarmbereitschaft nach einem Neustart des Handys bzw. nach einem App-Update. */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == Intent.ACTION_MY_PACKAGE_REPLACED) {
            AlarmController.createChannels(context)
            AlarmService.start(context)
        }
    }
}

/** „Ton aus“-Knopf in der Benachrichtigung. */
class StopAlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        AlarmController.stopSoundAndVibration(context)
    }
}

object Ui {
    fun dp(c: Context, v: Int) = (v * c.resources.displayMetrics.density).toInt()

    fun button(c: Context, label: String, bg: Int, fg: Int, onClick: (View) -> Unit) = Button(c).apply {
        text = label
        isAllCaps = false
        textSize = 17f
        setTextColor(fg)
        background = GradientDrawable().apply { setColor(bg); cornerRadius = dp(c, 14).toFloat() }
        setOnClickListener(onClick)
    }
}
