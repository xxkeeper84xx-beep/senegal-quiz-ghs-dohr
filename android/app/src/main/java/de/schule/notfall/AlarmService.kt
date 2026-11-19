package de.schule.notfall

import android.app.Notification
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Color
import android.os.Build
import android.os.IBinder
import android.util.Log
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

/**
 * Vordergrund-Dienst: hält eine dauerhafte Verbindung (Server-Sent Events) zum Schulserver
 * und löst bei eingehenden Alarmen den Geräte-Alarm aus. Kommt ohne Google-Dienste aus.
 */
class AlarmService : Service() {

    companion object {
        private const val TAG = "AlarmService"
        private const val NOTIF_STATUS = 1
        @Volatile var connected = false
            private set
        @Volatile var lastError: String? = null
            private set

        fun start(c: Context) {
            if (Prefs.token(c) == null || Prefs.serverUrl(c).isBlank()) return
            try {
                c.startForegroundService(Intent(c, AlarmService::class.java))
            } catch (e: Exception) {
                Log.w(TAG, "Dienst konnte nicht gestartet werden", e)
            }
        }

        fun stop(c: Context) = c.stopService(Intent(c, AlarmService::class.java))
    }

    @Volatile private var running = false
    private var worker: Thread? = null
    @Volatile private var connection: HttpURLConnection? = null

    // Daten vom Server
    private var types = JSONObject()
    private var users = JSONObject()
    private val helpSeen = HashMap<String, MutableSet<String>>()

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        AlarmController.createChannels(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startInForeground("Verbinde …")
        if (Prefs.token(this) == null) { stopSelf(); return START_NOT_STICKY }
        if (!running) {
            running = true
            worker = Thread({ loop() }, "notfall-sse").also { it.start() }
        }
        return START_STICKY
    }

    override fun onDestroy() {
        running = false
        connected = false
        connection?.disconnect()
        worker?.interrupt()
        super.onDestroy()
    }

    private fun startInForeground(text: String) {
        val open = PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val n = Notification.Builder(this, AlarmController.CH_STATUS)
            .setSmallIcon(R.drawable.ic_stat)
            .setContentTitle("Alarmbereitschaft aktiv")
            .setContentText(text)
            .setContentIntent(open)
            .setOngoing(true)
            .build()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(NOTIF_STATUS, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        } else {
            startForeground(NOTIF_STATUS, n)
        }
    }

    private fun setStatus(text: String) {
        try { startInForeground(text) } catch (_: Exception) {}
    }

    // ------------------------------------------------------------------ Verbindung
    private fun loop() {
        var backoff = 2000L
        while (running) {
            try {
                connectOnce()
                backoff = 2000L
            } catch (e: UnauthorizedException) {
                Log.w(TAG, "Sitzung ungültig")
                Prefs.setToken(this, null)
                notifyInfo("Notfall Kollegium: Bitte neu anmelden", "Die Anmeldung ist abgelaufen. Ohne Anmeldung kommen keine Alarme an!", true)
                running = false
                stopSelf()
                return
            } catch (e: InterruptedException) {
                return
            } catch (e: Exception) {
                lastError = e.message ?: e.javaClass.simpleName
                Log.w(TAG, "Verbindung unterbrochen: $lastError")
            }
            connected = false
            setStatus("⚠️ Keine Verbindung – neuer Versuch …")
            try { Thread.sleep(backoff) } catch (_: InterruptedException) { return }
            backoff = (backoff * 2).coerceAtMost(30_000L)
        }
    }

    private class UnauthorizedException : Exception()

    private fun request(path: String): HttpURLConnection {
        val c = URL(Prefs.serverUrl(this) + path).openConnection() as HttpURLConnection
        c.setRequestProperty("Authorization", "Bearer ${Prefs.token(this)}")
        c.connectTimeout = 15_000
        c.readTimeout = 20_000
        return c
    }

    private fun getJson(path: String): JSONObject {
        val c = request(path)
        try {
            if (c.responseCode == 401) throw UnauthorizedException()
            if (c.responseCode !in 200..299) throw Exception("HTTP ${c.responseCode}")
            return JSONObject(c.inputStream.bufferedReader().use { it.readText() })
        } finally {
            c.disconnect()
        }
    }

    private fun connectOnce() {
        types = getJson("/api/config").getJSONObject("alarmTypes")

        // Ereignisstrom zuerst öffnen, dann Zustand laden – so geht dazwischen nichts verloren
        val token = URLEncoder.encode(Prefs.token(this), "UTF-8")
        val c = request("/api/events?token=$token")
        c.readTimeout = 70_000 // Server sendet alle 25 s ein Lebenszeichen
        c.setRequestProperty("Accept", "text/event-stream")
        connection = c
        if (c.responseCode == 401) throw UnauthorizedException()
        if (c.responseCode != 200) throw Exception("HTTP ${c.responseCode}")

        val state = getJson("/api/state")
        Prefs.setUserId(this, state.getJSONObject("me").getString("id"))
        users = state.getJSONObject("users")
        val alarms = state.getJSONArray("alarms")
        for (i in 0 until alarms.length()) handleAlarm(alarms.getJSONObject(i), fromState = true)

        connected = true
        lastError = null
        setStatus("✅ Verbunden mit ${java.net.URI(Prefs.serverUrl(this)).host}")

        BufferedReader(InputStreamReader(c.inputStream, Charsets.UTF_8)).use { reader ->
            var event = "message"
            val data = StringBuilder()
            while (running) {
                val line = reader.readLine() ?: throw Exception("Verbindung vom Server geschlossen")
                when {
                    line.isEmpty() -> {
                        if (data.isNotEmpty()) dispatch(event, data.toString())
                        event = "message"
                        data.setLength(0)
                    }
                    line.startsWith("event:") -> event = line.substring(6).trim()
                    line.startsWith("data:") -> { if (data.isNotEmpty()) data.append('\n'); data.append(line.substring(5).trim()) }
                }
            }
        }
    }

    private fun dispatch(event: String, data: String) {
        try {
            val json = JSONObject(data)
            when (event) {
                "alarm" -> handleAlarm(json, fromState = false)
                "message" -> handleMessage(json)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Ereignis konnte nicht verarbeitet werden", e)
        }
    }

    // ------------------------------------------------------------------ Alarme
    private fun userName(id: String?): String {
        val u = id?.let { users.optJSONObject(it) } ?: return "Unbekannt"
        return "${u.optString("name")} (${u.optString("shortName")})"
    }

    private fun handleAlarm(a: JSONObject, fromState: Boolean) {
        val id = a.getString("id")
        val me = Prefs.userId(this)
        val type = types.optJSONObject(a.getString("type")) ?: return
        val label = type.optString("label")
        val icon = type.optString("icon")
        val color = try { Color.parseColor(type.optString("color", "#B00020")) } catch (_: Exception) { Color.RED }
        val silent = type.optBoolean("silent", false)
        val location = a.optString("location")
        val status = a.optString("status")

        if (status != "active") {
            if (Prefs.wasNotified(this, "$id:active") && !Prefs.wasNotified(this, "$id:end")) {
                Prefs.markNotified(this, "$id:end")
                AlarmController.dismiss(this, id)
                val word = if (status == "false_alarm") "FEHLALARM" else "ENTWARNUNG"
                notifyInfo("✅ $word: $label", "Ort: $location. Beendet von ${userName(a.optString("resolvedBy"))}. ${a.optString("resolveNote")}".trim(), false, id.hashCode())
            }
            return
        }

        val createdBy = a.optString("createdBy")
        // Beim Neuverbinden nur Alarme der letzten 15 Minuten nachholen
        val recent = System.currentTimeMillis() - a.optLong("createdAt") < 15 * 60 * 1000
        if (createdBy != me && !Prefs.wasNotified(this, "$id:active") && (!fromState || recent)) {
            Prefs.markNotified(this, "$id:active")
            val note = a.optString("note")
            AlarmController.start(this, AlarmController.AlarmInfo(
                id = id,
                title = "$icon ${label.uppercase()}",
                location = location,
                text = (if (note.isNotBlank()) "$note\n" else "") + "Gemeldet von ${userName(createdBy)}",
                color = color,
                silent = silent,
            ))
        } else if (createdBy != me) {
            Prefs.markNotified(this, "$id:active")
        }

        // Neue Hilferufe („Brauche Hilfe“) erneut alarmieren
        val seen = helpSeen.getOrPut(id) { mutableSetOf() }
        val responses = a.optJSONObject("responses") ?: JSONObject()
        for (uid in responses.keys()) {
            val r = responses.getJSONObject(uid)
            if (r.optString("response") != "help" || uid == me || !seen.add(uid)) continue
            if (fromState || Prefs.wasNotified(this, "$id:help:$uid")) continue
            Prefs.markNotified(this, "$id:help:$uid")
            AlarmController.start(this, AlarmController.AlarmInfo(
                id = id,
                title = "🆘 HILFE BENÖTIGT – $label",
                location = r.optString("location").ifBlank { location },
                text = "${userName(uid)} braucht Hilfe!",
                color = color,
                silent = silent,
            ))
        }
    }

    private fun handleMessage(m: JSONObject) {
        val from = m.optString("userId")
        if (from == Prefs.userId(this)) return
        val inAlarm = !m.isNull("alarmId")
        val open = PendingIntent.getActivity(
            this, 3, Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val n = Notification.Builder(this, if (inAlarm) AlarmController.CH_INFO else AlarmController.CH_CHAT)
            .setSmallIcon(R.drawable.ic_stat)
            .setContentTitle("💬 ${userName(from)}${if (inAlarm) " (Alarm-Chat)" else ""}")
            .setContentText(m.optString("text"))
            .setStyle(Notification.BigTextStyle().bigText(m.optString("text")))
            .setContentIntent(open)
            .setAutoCancel(true)
            .build()
        try { getSystemService(NotificationManager::class.java).notify(2000 + (m.optString("id").hashCode() and 0xfff), n) } catch (_: SecurityException) {}
    }

    private fun notifyInfo(title: String, text: String, important: Boolean, id: Int = 3000) {
        val open = PendingIntent.getActivity(
            this, 4, Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val n = Notification.Builder(this, AlarmController.CH_INFO)
            .setSmallIcon(R.drawable.ic_stat)
            .setContentTitle(title)
            .setContentText(text)
            .setStyle(Notification.BigTextStyle().bigText(text))
            .setContentIntent(open)
            .setAutoCancel(!important)
            .build()
        try { getSystemService(NotificationManager::class.java).notify(id, n) } catch (_: SecurityException) {}
    }
}
