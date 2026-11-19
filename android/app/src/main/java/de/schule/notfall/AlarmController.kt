package de.schule.notfall

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.os.VibrationAttributes
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log

/**
 * Löst den Alarm auf dem Gerät aus – auch bei Stummschaltung und „Nicht stören“:
 *  - Ton über den ALARM-Audiokanal (wird vom Stumm-/Vibrationsmodus nicht unterdrückt),
 *    Alarm-Lautstärke wird vorübergehend auf Maximum gesetzt,
 *  - „Nicht stören“ wird (mit erteilter Berechtigung) für die Dauer des Alarms gelockert,
 *  - Vibration mit Alarm-Priorität,
 *  - Vollbild-Anzeige auch auf dem Sperrbildschirm.
 */
object AlarmController {
    private const val TAG = "AlarmController"
    const val CH_ALARM = "alarm_v1"
    const val CH_SILENT_ALARM = "alarm_silent_v1"
    const val CH_INFO = "info_v1"
    const val CH_CHAT = "chat_v1"
    const val CH_STATUS = "status_v1"
    const val NOTIF_ALARM = 1001
    private const val AUTO_STOP_MS = 3 * 60 * 1000L

    private val handler = Handler(Looper.getMainLooper())
    private var player: MediaPlayer? = null
    private var savedVolume: Int? = null
    private var savedFilter: Int? = null
    private var wakeLock: PowerManager.WakeLock? = null

    /** Aktuell laufender Alarm (für die Vollbild-Anzeige). */
    @Volatile var current: AlarmInfo? = null
        private set

    data class AlarmInfo(
        val id: String,
        val title: String,
        val location: String,
        val text: String,
        val color: Int,
        val silent: Boolean,
    )

    fun createChannels(c: Context) {
        val nm = c.getSystemService(NotificationManager::class.java)
        val alarm = NotificationChannel(CH_ALARM, "Notfallalarm (laut)", NotificationManager.IMPORTANCE_HIGH).apply {
            description = "Alarme – durchbrechen Stummschaltung und „Nicht stören“"
            setSound(null, null) // Ton spielt die App selbst über den Alarm-Kanal
            enableVibration(false)
            setBypassDnd(true)
            lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        }
        val silent = NotificationChannel(CH_SILENT_ALARM, "Stiller Alarm (Amok)", NotificationManager.IMPORTANCE_HIGH).apply {
            description = "Stiller Alarm: nur Vibration und Bildschirm"
            setSound(null, null)
            enableVibration(false)
            setBypassDnd(true)
            lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        }
        val info = NotificationChannel(CH_INFO, "Entwarnungen & Hinweise", NotificationManager.IMPORTANCE_HIGH)
        val chat = NotificationChannel(CH_CHAT, "Chat", NotificationManager.IMPORTANCE_DEFAULT)
        val status = NotificationChannel(CH_STATUS, "Alarmbereitschaft", NotificationManager.IMPORTANCE_MIN).apply {
            description = "Dauerhafte Anzeige, solange die Alarmbereitschaft aktiv ist"
            setShowBadge(false)
        }
        nm.createNotificationChannels(listOf(alarm, silent, info, chat, status))
    }

    @Synchronized
    fun start(c: Context, info: AlarmInfo) {
        val ctx = c.applicationContext
        stopSoundAndVibration(ctx)
        current = info
        acquireWakeLock(ctx)

        showNotification(ctx, info)
        vibrate(ctx, info.silent)
        if (!info.silent) {
            relaxDoNotDisturb(ctx)
            playSiren(ctx)
        }
        // Vollbild direkt öffnen (klappt, wenn die App im Vordergrund ist oder das Recht dazu hat;
        // sonst übernimmt der Full-Screen-Intent der Benachrichtigung)
        try {
            ctx.startActivity(Intent(ctx, AlarmActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        } catch (e: Exception) {
            Log.w(TAG, "Vollbild konnte nicht direkt geöffnet werden", e)
        }
        handler.removeCallbacksAndMessages(null)
        handler.postDelayed({ stopSoundAndVibration(ctx) }, AUTO_STOP_MS)
    }

    /** Ton & Vibration beenden, Alarmanzeige bleibt bestehen. */
    @Synchronized
    fun stopSoundAndVibration(c: Context) {
        val ctx = c.applicationContext
        handler.removeCallbacksAndMessages(null)
        player?.let { try { it.stop() } catch (_: Exception) {}; it.release() }
        player = null
        vibrator(ctx)?.cancel()
        val am = ctx.getSystemService(AudioManager::class.java)
        savedVolume?.let { v -> try { am.setStreamVolume(AudioManager.STREAM_ALARM, v, 0) } catch (_: Exception) {} }
        savedVolume = null
        savedFilter?.let { f ->
            val nm = ctx.getSystemService(NotificationManager::class.java)
            try { if (nm.isNotificationPolicyAccessGranted) nm.setInterruptionFilter(f) } catch (_: Exception) {}
        }
        savedFilter = null
        wakeLock?.let { if (it.isHeld) it.release() }
        wakeLock = null
    }

    /** Alarm vollständig beenden (z. B. bei Entwarnung). */
    @Synchronized
    fun dismiss(c: Context, alarmId: String? = null) {
        if (alarmId != null && current?.id != alarmId) return
        stopSoundAndVibration(c)
        current = null
        c.getSystemService(NotificationManager::class.java).cancel(NOTIF_ALARM)
        AlarmActivity.closeIfOpen()
    }

    fun isRinging() = player != null

    private fun showNotification(ctx: Context, info: AlarmInfo) {
        val full = PendingIntent.getActivity(
            ctx, 1, Intent(ctx, AlarmActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val stop = PendingIntent.getBroadcast(
            ctx, 2, Intent(ctx, StopAlarmReceiver::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val n = Notification.Builder(ctx, if (info.silent) CH_SILENT_ALARM else CH_ALARM)
            .setSmallIcon(R.drawable.ic_stat)
            .setContentTitle(info.title)
            .setContentText("📍 ${info.location}")
            .setStyle(Notification.BigTextStyle().bigText("📍 ${info.location}\n${info.text}"))
            .setColor(info.color)
            .setCategory(Notification.CATEGORY_ALARM)
            .setVisibility(Notification.VISIBILITY_PUBLIC)
            .setFullScreenIntent(full, true)
            .setContentIntent(full)
            .setOngoing(true)
            .addAction(Notification.Action.Builder(null, "Ton aus", stop).build())
            .build()
        try {
            ctx.getSystemService(NotificationManager::class.java).notify(NOTIF_ALARM, n)
        } catch (e: SecurityException) {
            Log.w(TAG, "Keine Benachrichtigungs-Berechtigung", e)
        }
    }

    private fun playSiren(ctx: Context) {
        val am = ctx.getSystemService(AudioManager::class.java)
        if (Prefs.maxVolume(ctx)) {
            try {
                savedVolume = am.getStreamVolume(AudioManager.STREAM_ALARM)
                am.setStreamVolume(AudioManager.STREAM_ALARM, am.getStreamMaxVolume(AudioManager.STREAM_ALARM), 0)
            } catch (e: Exception) {
                Log.w(TAG, "Alarm-Lautstärke konnte nicht gesetzt werden", e)
                savedVolume = null
            }
        }
        try {
            player = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build(),
                )
                setDataSource(ctx, Uri.parse("android.resource://${ctx.packageName}/${R.raw.siren}"))
                isLooping = true
                prepare()
                start()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Sirene konnte nicht abgespielt werden", e)
        }
    }

    /** „Nicht stören“ so lockern, dass Alarme durchkommen – Einstellung wird danach wiederhergestellt. */
    private fun relaxDoNotDisturb(ctx: Context) {
        val nm = ctx.getSystemService(NotificationManager::class.java)
        if (!nm.isNotificationPolicyAccessGranted) return
        try {
            val f = nm.currentInterruptionFilter
            val alarmsAllowed = when (f) {
                NotificationManager.INTERRUPTION_FILTER_ALL, NotificationManager.INTERRUPTION_FILTER_ALARMS -> true
                NotificationManager.INTERRUPTION_FILTER_PRIORITY ->
                    Build.VERSION.SDK_INT >= Build.VERSION_CODES.P &&
                        (nm.notificationPolicy.priorityCategories and NotificationManager.Policy.PRIORITY_CATEGORY_ALARMS) != 0
                else -> false
            }
            if (!alarmsAllowed) {
                savedFilter = f
                nm.setInterruptionFilter(
                    if (f == NotificationManager.INTERRUPTION_FILTER_NONE) NotificationManager.INTERRUPTION_FILTER_ALARMS
                    else NotificationManager.INTERRUPTION_FILTER_ALL,
                )
            }
        } catch (e: Exception) {
            Log.w(TAG, "Nicht-stören konnte nicht angepasst werden", e)
        }
    }

    private fun vibrator(ctx: Context): Vibrator? =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            ctx.getSystemService(VibratorManager::class.java)?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            ctx.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }

    private fun vibrate(ctx: Context, silent: Boolean) {
        val v = vibrator(ctx) ?: return
        val pattern = if (silent) longArrayOf(0, 400, 250, 400, 1500) else longArrayOf(0, 800, 300, 800, 300)
        val effect = VibrationEffect.createWaveform(pattern, 0)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            v.vibrate(effect, VibrationAttributes.createForUsage(VibrationAttributes.USAGE_ALARM))
        } else {
            @Suppress("DEPRECATION")
            v.vibrate(effect, AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).build())
        }
    }

    private fun acquireWakeLock(ctx: Context) {
        val pm = ctx.getSystemService(PowerManager::class.java)
        wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "notfall:alarm").apply { acquire(AUTO_STOP_MS + 5000) }
    }
}
