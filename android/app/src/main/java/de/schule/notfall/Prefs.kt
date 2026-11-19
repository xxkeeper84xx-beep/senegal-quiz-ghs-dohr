package de.schule.notfall

import android.content.Context
import android.content.SharedPreferences
import android.net.Uri

/** Einstellungen und Sitzung, lokal auf dem Gerät gespeichert. */
object Prefs {
    private fun p(c: Context): SharedPreferences = c.getSharedPreferences("notfall", Context.MODE_PRIVATE)

    fun serverUrl(c: Context): String =
        p(c).getString("serverUrl", null)?.takeIf { it.isNotBlank() } ?: BuildConfig.DEFAULT_SERVER_URL

    fun setServerUrl(c: Context, url: String) = p(c).edit().putString("serverUrl", normalizeUrl(url)).apply()

    fun token(c: Context): String? = p(c).getString("token", null)
    fun setToken(c: Context, token: String?) = p(c).edit().putString("token", token).apply()

    fun userId(c: Context): String? = p(c).getString("userId", null)
    fun setUserId(c: Context, id: String?) = p(c).edit().putString("userId", id).apply()

    /** Ob die Ton-Lautstärke beim Alarm auf Maximum gesetzt wird. */
    fun maxVolume(c: Context): Boolean = p(c).getBoolean("maxVolume", true)
    fun setMaxVolume(c: Context, v: Boolean) = p(c).edit().putBoolean("maxVolume", v).apply()

    /** Bereits gemeldete Alarme, damit nach einem Neuverbinden nicht doppelt alarmiert wird. */
    fun wasNotified(c: Context, key: String): Boolean = p(c).getStringSet("notified", emptySet())!!.contains(key)
    fun markNotified(c: Context, key: String) {
        val set = p(c).getStringSet("notified", emptySet())!!.toMutableList()
        set.add(key)
        p(c).edit().putStringSet("notified", set.takeLast(300).toSet()).apply()
    }

    fun normalizeUrl(url: String): String {
        var u = url.trim().trimEnd('/')
        if (u.isNotEmpty() && !u.startsWith("http://") && !u.startsWith("https://")) u = "https://$u"
        return u
    }

    fun sameOrigin(a: String, b: String): Boolean {
        val ua = Uri.parse(a)
        val ub = Uri.parse(b)
        return ua.scheme == ub.scheme && ua.host == ub.host && ua.port == ub.port
    }
}
