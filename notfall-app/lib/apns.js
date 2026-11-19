'use strict';
// Apple Push Notification service (APNs) über HTTP/2 mit Token-Authentifizierung (.p8-Schlüssel).
// Ohne externe Abhängigkeiten.

const http2 = require('http2');
const crypto = require('crypto');

const HOSTS = {
  production: 'https://api.push.apple.com',
  sandbox: 'https://api.sandbox.push.apple.com',
};

// Antworten von Apple, bei denen das Gerät nicht mehr erreichbar ist
const GONE_REASONS = new Set(['BadDeviceToken', 'Unregistered', 'DeviceTokenNotForTopic']);

class Apns {
  /**
   * @param {object} o
   * @param {string} o.keyPem    Inhalt der .p8-Datei
   * @param {string} o.keyId     Key-ID aus dem Apple-Developer-Konto
   * @param {string} o.teamId    Team-ID
   * @param {string} o.bundleId  Bundle-ID der iOS-App
   * @param {object} [o.hosts]   nur für Tests: abweichende Server
   * @param {object} [o.tls]     nur für Tests: TLS-Optionen (z. B. ca)
   */
  constructor({ keyPem, keyId, teamId, bundleId, hosts, tls }) {
    this.key = crypto.createPrivateKey(keyPem);
    this.keyId = keyId;
    this.teamId = teamId;
    this.bundleId = bundleId;
    this.hosts = { ...HOSTS, ...hosts };
    this.tls = tls || {};
    this.sessions = {};
    this.jwt = null;
    this.jwtAt = 0;
  }

  token() {
    // Apple erlaubt einen neuen Token höchstens alle 20 Minuten, gültig ist er 60 Minuten
    if (this.jwt && Date.now() - this.jwtAt < 45 * 60 * 1000) return this.jwt;
    const b64u = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const data = `${b64u({ alg: 'ES256', kid: this.keyId })}.${b64u({ iss: this.teamId, iat: Math.floor(Date.now() / 1000) })}`;
    const sig = crypto.sign('sha256', Buffer.from(data), { key: this.key, dsaEncoding: 'ieee-p1363' });
    this.jwt = `${data}.${sig.toString('base64url')}`;
    this.jwtAt = Date.now();
    return this.jwt;
  }

  session(env) {
    let s = this.sessions[env];
    if (!s || s.closed || s.destroyed) {
      s = http2.connect(this.hosts[env] || this.hosts.production, this.tls);
      s.on('error', () => { delete this.sessions[env]; });
      s.on('goaway', () => { delete this.sessions[env]; });
      s.on('close', () => { if (this.sessions[env] === s) delete this.sessions[env]; });
      s.setTimeout(10 * 60 * 1000, () => s.close());
      s.unref();
      this.sessions[env] = s;
    }
    return s;
  }

  /**
   * Sendet eine Mitteilung an ein Gerät.
   * @returns {Promise<{ok:boolean,status:number,reason?:string,gone:boolean}>}
   */
  send(deviceToken, payload, { environment = 'production', priority = 10, expiration = 0, collapseId } = {}) {
    return new Promise((resolve, reject) => {
      const headers = {
        ':method': 'POST',
        ':path': `/3/device/${deviceToken}`,
        authorization: `bearer ${this.token()}`,
        'apns-topic': this.bundleId,
        'apns-push-type': 'alert',
        'apns-priority': String(priority),
        'apns-expiration': String(expiration),
      };
      if (collapseId) headers['apns-collapse-id'] = collapseId;

      let req;
      try {
        req = this.session(environment).request(headers);
      } catch (e) {
        delete this.sessions[environment];
        reject(e);
        return;
      }
      let status = 0;
      let body = '';
      req.setEncoding('utf8');
      req.setTimeout(15000, () => req.close(http2.constants.NGHTTP2_CANCEL));
      req.on('response', (h) => { status = h[':status']; });
      req.on('data', (c) => { body += c; });
      req.on('error', reject);
      req.on('close', () => {
        if (!status) { reject(new Error('Keine Antwort von APNs')); return; }
        let reason;
        try { reason = body ? JSON.parse(body).reason : undefined; } catch {}
        resolve({ ok: status === 200, status, reason, gone: status === 410 || GONE_REASONS.has(reason) });
      });
      req.end(JSON.stringify(payload));
    });
  }

  close() {
    for (const s of Object.values(this.sessions)) s.close();
    this.sessions = {};
  }
}

/**
 * Baut die APNs-Nutzlast für eine Mitteilung der Notfall-App.
 * critical=true nur, wenn die App die Apple-Genehmigung „Critical Alerts“ hat und
 * die Lehrkraft sie auf dem iPhone erlaubt hat – dann klingelt es trotz Stummschalter.
 */
function buildPayload(p, { critical }) {
  const aps = {
    alert: { title: p.title, body: p.body },
    'thread-id': p.alarmId || 'chat',
  };
  if (p.kind === 'alarm') {
    if (p.silent) {
      // Stiller Alarm (Amok): durchbricht Fokus/„Nicht stören“, aber ohne Ton
      aps['interruption-level'] = 'time-sensitive';
    } else if (critical) {
      aps['interruption-level'] = 'critical';
      aps.sound = { critical: 1, name: 'siren.wav', volume: 1.0 };
    } else {
      aps['interruption-level'] = 'time-sensitive';
      aps.sound = 'siren.wav';
    }
  } else if (p.kind === 'resolved') {
    aps['interruption-level'] = 'time-sensitive';
    aps.sound = 'default';
  } else {
    aps['interruption-level'] = p.silent ? 'passive' : 'active';
    if (!p.silent) aps.sound = 'default';
  }
  return { aps, alarmId: p.alarmId || null, kind: p.kind };
}

module.exports = { Apns, buildPayload };
