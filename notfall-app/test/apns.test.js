'use strict';
const test = require('node:test');
const assert = require('node:assert');
const http2 = require('http2');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'apns-'));
process.env.DATA_DIR = tmp;
process.env.SCHULCODE = 'SCHULE1';
process.env.ADMINCODE = 'LEITUNG1';
const { server, setApns } = require('../server');
const { Apns } = require('../lib/apns');

// TLS-Zertifikat für den nachgebauten Apple-Server
execFileSync('openssl', ['req', '-x509', '-newkey', 'ec', '-pkeyopt', 'ec_paramgen_curve:prime256v1', '-nodes',
  '-keyout', path.join(tmp, 'k.pem'), '-out', path.join(tmp, 'c.pem'), '-days', '1', '-subj', '/CN=localhost'], { stdio: 'ignore' });
const cert = fs.readFileSync(path.join(tmp, 'c.pem'));

const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
const received = [];
const GONE = 'b'.repeat(64);
const apple = http2.createSecureServer({ key: fs.readFileSync(path.join(tmp, 'k.pem')), cert });
apple.on('stream', (stream, headers) => {
  let body = '';
  stream.on('data', (c) => { body += c; });
  stream.on('end', () => {
    received.push({ headers, body: JSON.parse(body) });
    if (headers[':path'].endsWith(GONE)) {
      stream.respond({ ':status': 410 });
      stream.end(JSON.stringify({ reason: 'Unregistered' }));
    } else {
      stream.respond({ ':status': 200 });
      stream.end();
    }
  });
});

let base;
let client;
test.before(async () => {
  await new Promise((r) => apple.listen(0, r));
  const host = `https://localhost:${apple.address().port}`;
  client = new Apns({
    keyPem: privateKey.export({ type: 'pkcs8', format: 'pem' }),
    keyId: 'KEY123', teamId: 'TEAM123', bundleId: 'de.schule.notfall',
    hosts: { production: host, sandbox: host }, tls: { ca: cert },
  });
  setApns(client);
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => { client.close(); server.closeAllConnections(); server.close(); apple.close(); });

async function call(p, body, token) {
  const res = await fetch(base + p, { method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, data: await res.json() };
}
const until = async (fn) => { for (let i = 0; i < 100 && !fn(); i++) await new Promise((r) => setTimeout(r, 20)); };

test('iPhone-Alarme werden korrekt an Apple gesendet', async () => {
  const a = (await call('/api/login', { name: 'Anna', shortName: 'ANN', code: 'SCHULE1' })).data;
  const b = (await call('/api/login', { name: 'Ben', shortName: 'BEN', code: 'SCHULE1' })).data;
  const c = (await call('/api/login', { name: 'Cem', shortName: 'CEM', code: 'SCHULE1' })).data;
  assert.strictEqual((await call('/api/apns/register', { deviceToken: 'xyz' }, b.token)).status, 400);
  assert.strictEqual((await call('/api/apns/register', { deviceToken: 'A'.repeat(64), critical: true, environment: 'sandbox' }, b.token)).status, 200);
  assert.strictEqual((await call('/api/apns/register', { deviceToken: GONE, critical: false }, c.token)).status, 200);

  // Medizinischer Notfall: kritischer Alarm mit Sirene
  await call('/api/alarms', { type: 'medical', location: 'Raum 12' }, a.token);
  await until(() => received.length >= 2);
  const toB = received.find((r) => r.headers[':path'].endsWith('a'.repeat(64)));
  const toC = received.find((r) => r.headers[':path'].endsWith(GONE));
  assert.strictEqual(toB.headers['apns-topic'], 'de.schule.notfall');
  assert.strictEqual(toB.headers['apns-push-type'], 'alert');
  assert.strictEqual(toB.headers['apns-priority'], '10');
  assert.deepStrictEqual(toB.body.aps.sound, { critical: 1, name: 'siren.wav', volume: 1 });
  assert.strictEqual(toB.body.aps['interruption-level'], 'critical');
  assert.match(toB.body.aps.alert.title, /MEDIZINISCHER NOTFALL/);
  // Gerät ohne Critical-Alerts-Erlaubnis: zeitkritisch mit normalem Ton
  assert.strictEqual(toC.body.aps.sound, 'siren.wav');
  assert.strictEqual(toC.body.aps['interruption-level'], 'time-sensitive');

  // JWT prüfen
  const [h, p, s] = toB.headers.authorization.replace('bearer ', '').split('.');
  assert.deepStrictEqual(JSON.parse(Buffer.from(h, 'base64url')), { alg: 'ES256', kid: 'KEY123' });
  assert.strictEqual(JSON.parse(Buffer.from(p, 'base64url')).iss, 'TEAM123');
  assert.ok(crypto.verify('sha256', Buffer.from(`${h}.${p}`), { key: publicKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(s, 'base64url')));

  // Abgemeldetes Gerät (410) wird entfernt; Amok kommt still an
  received.length = 0;
  await call('/api/alarms', { type: 'amok', location: 'Aula' }, a.token);
  await until(() => received.length >= 1);
  await new Promise((r) => setTimeout(r, 100));
  assert.strictEqual(received.length, 1, 'abgemeldetes Gerät darf nicht mehr angeschrieben werden');
  assert.strictEqual(received[0].body.aps.sound, undefined);
  assert.strictEqual(received[0].body.aps['interruption-level'], 'time-sensitive');

  assert.strictEqual((await call('/api/apns/test', {}, b.token)).status, 200);
  assert.strictEqual((await call('/api/apns/unregister', { deviceToken: 'a'.repeat(64) }, b.token)).status, 200);
  assert.strictEqual((await call('/api/apns/test', {}, b.token)).status, 400);
});
