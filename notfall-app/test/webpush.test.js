'use strict';
const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const wp = require('../lib/webpush');

// Entschlüsselt wie ein Browser (RFC 8291), um die Verschlüsselung zu prüfen
function decrypt(body, ua, authSecret) {
  const salt = body.subarray(0, 16);
  const idlen = body[20];
  const asPublic = body.subarray(21, 21 + idlen);
  const ct = body.subarray(21 + idlen);
  const shared = ua.computeSecret(asPublic);
  const keyInfo = Buffer.concat([Buffer.from('WebPush: info\0'), ua.getPublicKey(), asPublic]);
  const ikm = Buffer.from(crypto.hkdfSync('sha256', shared, authSecret, keyInfo, 32));
  const cek = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: aes128gcm\0'), 16));
  const nonce = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: nonce\0'), 12));
  const d = crypto.createDecipheriv('aes-128-gcm', cek, nonce);
  d.setAuthTag(ct.subarray(ct.length - 16));
  const pt = Buffer.concat([d.update(ct.subarray(0, ct.length - 16)), d.final()]);
  assert.strictEqual(pt[pt.length - 1], 2);
  return pt.subarray(0, -1).toString();
}

test('Push-Payload lässt sich wie im Browser entschlüsseln', () => {
  const ua = crypto.createECDH('prime256v1'); ua.generateKeys();
  const auth = crypto.randomBytes(16);
  const msg = JSON.stringify({ title: '🚨 AMOKALARM', body: 'Raum 104' });
  const body = wp.encrypt(msg, ua.getPublicKey().toString('base64url'), auth.toString('base64url'));
  assert.strictEqual(decrypt(body, ua, auth), msg);
});

test('VAPID-JWT ist gültig signiert (ES256)', () => {
  const keys = wp.generateVapidKeys();
  const jwt = wp.vapidJwt('https://push.example.com', 'mailto:a@b.de', keys);
  const [h, p, s] = jwt.split('.');
  const pub = Buffer.from(keys.publicKey, 'base64url');
  const key = crypto.createPublicKey({ format: 'jwk', key: { kty: 'EC', crv: 'P-256',
    x: pub.subarray(1, 33).toString('base64url'), y: pub.subarray(33).toString('base64url') } });
  assert.ok(crypto.verify('sha256', Buffer.from(`${h}.${p}`), { key, dsaEncoding: 'ieee-p1363' }, Buffer.from(s, 'base64url')));
  assert.strictEqual(JSON.parse(Buffer.from(p, 'base64url')).aud, 'https://push.example.com');
});
