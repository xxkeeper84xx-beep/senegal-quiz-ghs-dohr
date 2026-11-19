'use strict';
// Notfall-App für das Lehrerkollegium – Server
// Keine externen Abhängigkeiten: Node.js >= 18 genügt.

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const webpush = require('./lib/webpush');
const { Apns, buildPayload } = require('./lib/apns');

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');
const SCHOOL_NAME = process.env.SCHULNAME || 'Unsere Schule';
// Amokalarm standardmäßig ohne Ton (nur Vibration + Bildschirm). AMOK_STUMM=0 macht ihn laut.
const AMOK_SILENT = process.env.AMOK_STUMM !== '0';

// ---------------------------------------------------------------------------
// Alarmarten
// ---------------------------------------------------------------------------
const ALARM_TYPES = {
  amok: {
    label: 'Amokalarm',
    icon: '🚨',
    color: '#b00020',
    silent: AMOK_SILENT, // kein Ton auf den Geräten – verrät sonst den Standort
    adminResolveOnly: true,
    instructions: [
      'Tür abschließen bzw. verbarrikadieren, Licht aus.',
      'Weg von Türen und Fenstern, in Deckung gehen, absolute Ruhe.',
      'Handy lautlos stellen. Den Raum nicht verlassen.',
      'Polizei 110 wählen, sofern gefahrlos möglich.',
      'Tür erst für die Polizei öffnen – nicht auf Klopfen/Rufe reagieren.',
    ],
    responses: [
      { id: 'secured', label: 'Raum gesichert' },
      { id: 'help', label: 'Brauche Hilfe' },
      { id: 'called110', label: '110 informiert' },
    ],
  },
  medical: {
    label: 'Medizinischer Notfall',
    icon: '🩺',
    color: '#c75000',
    instructions: [
      'Ruhe bewahren, Eigenschutz beachten, Erste Hilfe leisten.',
      'Notruf 112 wählen: Wo? Was? Wie viele? Welche Verletzungen?',
      'Ersthelfer / Schulsanitäter hinzuziehen, Sekretariat informieren.',
      'Rettungsdienst am Eingang abholen und einweisen lassen.',
    ],
    responses: [
      { id: 'coming', label: 'Ich komme' },
      { id: 'called112', label: '112 gerufen' },
      { id: 'onsite', label: 'Bin vor Ort' },
    ],
  },
  fight: {
    label: 'Schlägerei / Gewalt',
    icon: '⚠️',
    color: '#8a2be2',
    instructions: [
      'Eigenschutz geht vor – nicht allein dazwischengehen.',
      'Laut und deutlich ansprechen, Beteiligte trennen, Zuschauer wegschicken.',
      'Verletzte versorgen, bei Bedarf 112 / 110.',
      'Schulleitung informieren, Vorfall dokumentieren.',
    ],
    responses: [
      { id: 'coming', label: 'Ich komme' },
      { id: 'onsite', label: 'Bin vor Ort' },
      { id: 'control', label: 'Lage unter Kontrolle' },
    ],
  },
  danger: {
    label: 'Sonstige Gefahr',
    icon: '❗',
    color: '#1f5fbf',
    instructions: [
      'Lage einschätzen, Schüler*innen aus dem Gefahrenbereich bringen.',
      'Details im Chat zum Alarm beschreiben.',
      'Bei Bedarf 112 / 110 verständigen, Schulleitung informieren.',
    ],
    responses: [
      { id: 'coming', label: 'Ich komme' },
      { id: 'seen', label: 'Gesehen' },
      { id: 'onsite', label: 'Bin vor Ort' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Persistenz (JSON-Datei)
// ---------------------------------------------------------------------------
fs.mkdirSync(DATA_DIR, { recursive: true });
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

const randomCode = (len) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(crypto.randomBytes(len), (b) => chars[b % chars.length]).join('');
};

const config = readJson(CONFIG_FILE, {});
if (!config.vapid) config.vapid = webpush.generateVapidKeys();
if (!config.schoolCode) config.schoolCode = randomCode(8);
if (!config.adminCode) config.adminCode = randomCode(10);
fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });

const SCHOOL_CODE = process.env.SCHULCODE || config.schoolCode;
const ADMIN_CODE = process.env.ADMINCODE || config.adminCode;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@example.org';

// iPhone-App: Apple Push (optional). Benötigt einen APNs-Schlüssel (.p8) aus dem Apple-Developer-Konto.
let apns = null;
if (process.env.APNS_KEY_FILE) {
  try {
    apns = new Apns({
      keyPem: fs.readFileSync(process.env.APNS_KEY_FILE, 'utf8'),
      keyId: process.env.APNS_KEY_ID,
      teamId: process.env.APNS_TEAM_ID,
      bundleId: process.env.APNS_BUNDLE_ID,
    });
    if (!process.env.APNS_KEY_ID || !process.env.APNS_TEAM_ID || !process.env.APNS_BUNDLE_ID) {
      throw new Error('APNS_KEY_ID, APNS_TEAM_ID und APNS_BUNDLE_ID müssen gesetzt sein.');
    }
  } catch (e) {
    console.error('APNs (iPhone-Push) deaktiviert:', e.message);
    apns = null;
  }
}
function setApns(instance) { apns = instance; } // für Tests

const db = Object.assign(
  { users: {}, sessions: {}, alarms: [], messages: [], subscriptions: [], apnsDevices: [] },
  readJson(DB_FILE, {}),
);

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    // Alte Daten begrenzen
    if (db.messages.length > 2000) db.messages = db.messages.slice(-2000);
    if (db.alarms.length > 500) db.alarms = db.alarms.slice(-500);
    const tmp = DB_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(db), { mode: 0o600 });
    fs.renameSync(tmp, DB_FILE);
  }, 200);
}

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------
const id = () => crypto.randomBytes(9).toString('base64url');
const now = () => Date.now();
const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a).toUpperCase()).digest();
  const hb = crypto.createHash('sha256').update(String(b).toUpperCase()).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function publicUser(u) {
  return u && { id: u.id, name: u.name, shortName: u.shortName, isAdmin: !!u.isAdmin };
}

function send(res, status, body, headers = {}) {
  const data = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > 64 * 1024) { reject(new Error('Anfrage zu groß')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); }
      catch { reject(new Error('Ungültiges JSON')); }
    });
    req.on('error', reject);
  });
}

function auth(req, url) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : url.searchParams.get('token');
  const session = token && db.sessions[token];
  if (!session) return null;
  return db.users[session.userId] || null;
}

// Einfache Bremse gegen das Erraten des Schulcodes
const loginAttempts = new Map();
function loginAllowed(ip) {
  const entry = loginAttempts.get(ip) || { count: 0, since: now() };
  if (now() - entry.since > 15 * 60 * 1000) { entry.count = 0; entry.since = now(); }
  entry.count++;
  loginAttempts.set(ip, entry);
  return entry.count <= 20;
}

// ---------------------------------------------------------------------------
// Echtzeit: Server-Sent Events
// ---------------------------------------------------------------------------
const clients = new Set(); // { res, userId }

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const c of clients) c.res.write(payload);
}

function onlineUsers() {
  const ids = new Set([...clients].map((c) => c.userId));
  return [...ids].map((uid) => publicUser(db.users[uid])).filter(Boolean);
}

function broadcastPresence() {
  broadcast('presence', onlineUsers());
}

setInterval(() => {
  // Lebenszeichen als echtes Ereignis: Clients erkennen so, ob die Live-Verbindung durchkommt
  // (manche Proxys/Tunnel puffern Server-Sent Events – dann weichen die Clients auf Abfragen aus)
  for (const c of clients) c.res.write('event: ping\ndata: {}\n\n');
}, 10000).unref();

// ---------------------------------------------------------------------------
// Push
// ---------------------------------------------------------------------------
async function pushToAll(payload, exceptUserId, opts) {
  const subs = db.subscriptions.filter((s) => s.userId !== exceptUserId);
  const results = await Promise.allSettled(
    subs.map((s) => webpush.sendPush(s.subscription, payload, config.vapid, VAPID_SUBJECT, opts)),
  );
  let changed = false;
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value.gone) {
      db.subscriptions = db.subscriptions.filter((s) => s !== subs[i]);
      changed = true;
    } else if (r.status === 'rejected' || !r.value.ok) {
      console.warn('Push fehlgeschlagen:', r.status === 'rejected' ? r.reason.message : r.value.status);
    }
  });
  if (changed) save();
  await pushToApple(payload, exceptUserId, opts);
}

async function pushToApple(payload, exceptUserId, opts = {}) {
  if (!apns) return;
  const devices = db.apnsDevices.filter((d) => d.userId !== exceptUserId);
  const results = await Promise.allSettled(devices.map((d) => apns.send(d.token, buildPayload(payload, { critical: d.critical }), {
    environment: d.environment,
    priority: opts.urgency === 'normal' ? 5 : 10,
    expiration: Math.floor(Date.now() / 1000) + (opts.ttl || 3600),
    collapseId: payload.kind === 'alarm' && payload.alarmId ? payload.alarmId.slice(0, 64) : undefined,
  })));
  let changed = false;
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value.gone) {
      db.apnsDevices = db.apnsDevices.filter((d) => d !== devices[i]);
      changed = true;
    } else if (r.status === 'rejected' || !r.value.ok) {
      console.warn('iPhone-Push fehlgeschlagen:', r.status === 'rejected' ? r.reason.message : `${r.value.status} ${r.value.reason || ''}`);
    }
  });
  if (changed) save();
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
async function handleApi(req, res, url) {
  const route = `${req.method} ${url.pathname}`;

  if (route === 'GET /api/config') {
    return send(res, 200, { schoolName: SCHOOL_NAME, vapidPublicKey: config.vapid.publicKey, alarmTypes: ALARM_TYPES });
  }

  if (route === 'POST /api/login') {
    const ip = req.socket.remoteAddress;
    if (!loginAllowed(ip)) return send(res, 429, { error: 'Zu viele Versuche. Bitte später erneut.' });
    const body = await readBody(req);
    const name = clean(body.name, 60);
    const shortName = clean(body.shortName, 8).toUpperCase();
    const code = clean(body.code, 40);
    if (!name || !shortName) return send(res, 400, { error: 'Bitte Name und Kürzel angeben.' });
    const isAdmin = safeEqual(code, ADMIN_CODE);
    if (!isAdmin && !safeEqual(code, SCHOOL_CODE)) return send(res, 403, { error: 'Zugangscode ist falsch.' });

    let user = Object.values(db.users).find((u) => u.shortName === shortName);
    if (!user) {
      user = { id: id(), createdAt: now() };
      db.users[user.id] = user;
    }
    Object.assign(user, { name, shortName, isAdmin: isAdmin || !!user.isAdmin });
    const token = crypto.randomBytes(32).toString('base64url');
    db.sessions[token] = { userId: user.id, createdAt: now() };
    save();
    broadcast('user', publicUser(user)); // damit alle Geräte den Namen kennen

    return send(res, 200, { token, user: publicUser(user) });
  }

  const user = auth(req, url);
  if (!user) return send(res, 401, { error: 'Nicht angemeldet.' });

  if (route === 'GET /api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write('retry: 3000\nevent: hello\ndata: {}\n\n');
    const client = { res, userId: user.id };
    clients.add(client);
    broadcastPresence();
    req.on('close', () => { clients.delete(client); broadcastPresence(); });
    return;
  }

  if (route === 'GET /api/state') {
    const users = Object.fromEntries(Object.values(db.users).map((u) => [u.id, publicUser(u)]));
    return send(res, 200, {
      me: publicUser(user),
      users,
      online: onlineUsers(),
      alarms: db.alarms.slice(-50),
      messages: db.messages.slice(-300),
    });
  }

  if (route === 'POST /api/logout') {
    const token = (req.headers.authorization || '').slice(7);
    delete db.sessions[token];
    save();
    return send(res, 200, { ok: true });
  }

  if (route === 'POST /api/alarms') {
    const body = await readBody(req);
    const type = ALARM_TYPES[body.type] ? body.type : null;
    if (!type) return send(res, 400, { error: 'Unbekannte Alarmart.' });
    const location = clean(body.location, 80);
    if (!location) return send(res, 400, { error: 'Bitte Standort angeben.' });
    const alarm = {
      id: id(),
      type,
      location,
      note: clean(body.note, 300),
      createdBy: user.id,
      createdAt: now(),
      status: 'active',
      responses: {},
    };
    db.alarms.push(alarm);
    save();
    broadcast('alarm', alarm);
    console.log(`[ALARM] ${ALARM_TYPES[type].label} – ${location} – ausgelöst von ${user.name}`);
    const t = ALARM_TYPES[type];
    pushToAll({
      kind: 'alarm',
      alarmId: alarm.id,
      title: `${t.icon} ${t.label.toUpperCase()}`,
      body: `Ort: ${location}${alarm.note ? ' – ' + alarm.note : ''}\nGemeldet von ${user.name} (${user.shortName})`,
      silent: !!t.silent,
    }, user.id, { ttl: 1800, urgency: 'high' }).catch((e) => console.warn(e));
    return send(res, 201, alarm);
  }

  let m = url.pathname.match(/^\/api\/alarms\/([\w-]+)\/(respond|resolve)$/);
  if (m && req.method === 'POST') {
    const alarm = db.alarms.find((a) => a.id === m[1]);
    if (!alarm) return send(res, 404, { error: 'Alarm nicht gefunden.' });
    if (alarm.status !== 'active') return send(res, 409, { error: 'Alarm ist bereits beendet.' });
    const body = await readBody(req);
    const t = ALARM_TYPES[alarm.type];

    if (m[2] === 'respond') {
      const response = t.responses.find((r) => r.id === body.response);
      if (!response) return send(res, 400, { error: 'Ungültige Rückmeldung.' });
      alarm.responses[user.id] = { response: response.id, at: now(), location: clean(body.location, 80) };
      save();
      broadcast('alarm', alarm);
      if (response.id === 'help') {
        pushToAll({
          kind: 'alarm', alarmId: alarm.id, silent: !!t.silent,
          title: `${t.icon} HILFE BENÖTIGT`,
          body: `${user.name} (${user.shortName}) braucht Hilfe${body.location ? ' – ' + clean(body.location, 80) : ''}`,
        }, user.id).catch(() => {});
      }
      return send(res, 200, alarm);
    }

    // resolve
    if (t.adminResolveOnly && !user.isAdmin && alarm.createdBy !== user.id) {
      return send(res, 403, { error: 'Nur die Schulleitung oder die auslösende Person kann diesen Alarm beenden.' });
    }
    alarm.status = body.falseAlarm ? 'false_alarm' : 'resolved';
    alarm.resolvedBy = user.id;
    alarm.resolvedAt = now();
    alarm.resolveNote = clean(body.note, 300);
    save();
    broadcast('alarm', alarm);
    pushToAll({
      kind: 'resolved', alarmId: alarm.id,
      title: `✅ ${body.falseAlarm ? 'FEHLALARM' : 'ENTWARNUNG'}: ${t.label}`,
      body: `Ort: ${alarm.location}. Beendet von ${user.name}.${alarm.resolveNote ? ' ' + alarm.resolveNote : ''}`,
    }, null).catch(() => {});
    return send(res, 200, alarm);
  }

  if (route === 'POST /api/messages') {
    const body = await readBody(req);
    const text = clean(body.text, 1000);
    if (!text) return send(res, 400, { error: 'Leere Nachricht.' });
    const alarmId = body.alarmId && db.alarms.some((a) => a.id === body.alarmId) ? body.alarmId : null;
    const msg = { id: id(), userId: user.id, text, alarmId, at: now() };
    db.messages.push(msg);
    save();
    broadcast('message', msg);
    pushToAll({
      kind: 'message', alarmId,
      title: `💬 ${user.name}${alarmId ? ' (Alarm-Chat)' : ''}`,
      body: text.slice(0, 200),
      // Während eines Amokalarms keine Töne
      silent: db.alarms.some((a) => a.status === 'active' && ALARM_TYPES[a.type].silent),
    }, user.id, { ttl: 600, urgency: alarmId ? 'high' : 'normal' }).catch(() => {});
    return send(res, 201, msg);
  }

  if (route === 'POST /api/push/subscribe') {
    const body = await readBody(req);
    const sub = body.subscription;
    if (!sub || typeof sub.endpoint !== 'string' || !/^https:\/\//.test(sub.endpoint) || !sub.keys?.p256dh || !sub.keys?.auth) {
      return send(res, 400, { error: 'Ungültiges Push-Abo.' });
    }
    db.subscriptions = db.subscriptions.filter((s) => s.subscription.endpoint !== sub.endpoint);
    db.subscriptions.push({ userId: user.id, subscription: { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } } });
    save();
    return send(res, 200, { ok: true });
  }

  if (route === 'POST /api/apns/register') {
    const body = await readBody(req);
    const token = clean(body.deviceToken, 200).toLowerCase();
    if (!/^[0-9a-f]{32,200}$/.test(token)) return send(res, 400, { error: 'Ungültiger Geräte-Token.' });
    db.apnsDevices = db.apnsDevices.filter((d) => d.token !== token);
    db.apnsDevices.push({
      userId: user.id,
      token,
      critical: body.critical === true,
      environment: body.environment === 'sandbox' ? 'sandbox' : 'production',
      updatedAt: now(),
    });
    save();
    return send(res, 200, { ok: true, apnsEnabled: !!apns });
  }

  if (route === 'POST /api/apns/unregister') {
    const body = await readBody(req);
    const token = clean(body.deviceToken, 200).toLowerCase();
    db.apnsDevices = db.apnsDevices.filter((d) => !(d.token === token && d.userId === user.id));
    save();
    return send(res, 200, { ok: true });
  }

  if (route === 'POST /api/apns/test') {
    const devices = db.apnsDevices.filter((d) => d.userId === user.id);
    if (!apns) return send(res, 503, { error: 'iPhone-Push ist auf dem Server nicht eingerichtet (APNS_KEY_FILE fehlt).' });
    if (!devices.length) return send(res, 400, { error: 'Kein iPhone für dieses Konto registriert.' });
    const results = await Promise.allSettled(devices.map((d) => apns.send(d.token, buildPayload({
      kind: 'alarm', title: '🔔 TESTALARM', body: 'Test – kein Notfall. So klingt ein Alarm.', alarmId: 'test',
    }, { critical: d.critical }), { environment: d.environment })));
    const ok = results.some((r) => r.status === 'fulfilled' && r.value.ok);
    return send(res, ok ? 200 : 502, ok ? { ok: true } : { error: 'Apple hat die Mitteilung abgelehnt: ' +
      results.map((r) => (r.status === 'fulfilled' ? r.value.reason || r.value.status : r.reason.message)).join(', ') });
  }

  if (route === 'POST /api/push/test') {
    const subs = db.subscriptions.filter((s) => s.userId === user.id);
    if (!subs.length) return send(res, 400, { error: 'Kein Push-Abo für dieses Gerät gefunden.' });
    await Promise.allSettled(subs.map((s) => webpush.sendPush(s.subscription, {
      kind: 'test', title: '🔔 Testbenachrichtigung', body: 'Push-Benachrichtigungen funktionieren.',
    }, config.vapid, VAPID_SUBJECT)));
    return send(res, 200, { ok: true });
  }

  return send(res, 404, { error: 'Nicht gefunden.' });
}

// ---------------------------------------------------------------------------
// Statische Dateien
// ---------------------------------------------------------------------------
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json',
};

function serveStatic(req, res, url) {
  let p = decodeURIComponent(url.pathname);
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(PUBLIC_DIR, p));
  if (!file.startsWith(PUBLIC_DIR + path.sep)) return send(res, 403, 'Verboten');
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, 'Nicht gefunden');
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname.startsWith('/api/')) await handleApi(req, res, url);
    else serveStatic(req, res, url);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, 400, { error: e.message || 'Fehler' });
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\nNotfall-App läuft auf http://localhost:${PORT}`);
    console.log(`Schule:                 ${SCHOOL_NAME}`);
    console.log(`Zugangscode Kollegium:  ${SCHOOL_CODE}`);
    console.log(`Zugangscode Leitung:    ${ADMIN_CODE}`);
    console.log(`(Codes gespeichert in ${CONFIG_FILE} – per SCHULCODE/ADMINCODE überschreibbar)\n`);
  });
}

module.exports = { server, ALARM_TYPES, setApns };
