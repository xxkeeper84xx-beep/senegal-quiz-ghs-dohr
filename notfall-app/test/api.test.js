'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'notfall-'));
process.env.SCHULCODE = 'SCHULE1';
process.env.ADMINCODE = 'LEITUNG1';
const { server } = require('../server');

let base;
test.before(() => new Promise((r) => server.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; r(); })));
test.after(() => { server.closeAllConnections(); server.close(); });

async function call(p, body, token) {
  const res = await fetch(base + p, { method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, data: await res.json() };
}

// Liest SSE-Ereignisse mit, bis `count` Ereignisse des Typs `type` empfangen wurden
async function listen(token, type, count) {
  const res = await fetch(`${base}/api/events?token=${token}`);
  const reader = res.body.getReader();
  const got = [];
  let buf = '';
  const done = (async () => {
    while (got.length < count) {
      const { value } = await reader.read();
      buf += new TextDecoder().decode(value);
      let i;
      while ((i = buf.indexOf('\n\n')) >= 0) {
        const block = buf.slice(0, i); buf = buf.slice(i + 2);
        const ev = /event: (\w+)/.exec(block)?.[1];
        const data = /data: (.*)/.exec(block)?.[1];
        if (ev === type) got.push(JSON.parse(data));
      }
    }
    reader.cancel();
    return got;
  })();
  return done;
}

test('Kompletter Ablauf: Anmeldung, Alarm, Rückmeldung, Chat, Entwarnung', async () => {
  assert.strictEqual((await call('/api/login', { name: 'X', shortName: 'X', code: 'falsch' })).status, 403);
  assert.strictEqual((await call('/api/state')).status, 401);

  const a = (await call('/api/login', { name: 'Anna Müller', shortName: 'mül', code: 'schule1' })).data;
  const b = (await call('/api/login', { name: 'Ben Kurz', shortName: 'KUR', code: 'SCHULE1' })).data;
  const sl = (await call('/api/login', { name: 'Chefin', shortName: 'SL', code: 'LEITUNG1' })).data;
  assert.strictEqual(a.user.shortName, 'MÜL');
  assert.strictEqual(sl.user.isAdmin, true);

  const alarmsSeenByB = listen(b.token, 'alarm', 4);
  await new Promise((r) => setTimeout(r, 100));

  assert.strictEqual((await call('/api/alarms', { type: 'amok', location: '' }, a.token)).status, 400);
  const alarm = (await call('/api/alarms', { type: 'amok', location: 'Raum 104', note: 'Schüsse gehört' }, a.token));
  assert.strictEqual(alarm.status, 201);
  const id = alarm.data.id;

  const r = await call(`/api/alarms/${id}/respond`, { response: 'secured', location: 'Raum 210' }, b.token);
  assert.strictEqual(r.data.responses[b.user.id].response, 'secured');

  const msg = await call('/api/messages', { text: 'Bin mit 25 SuS im Raum 210', alarmId: id }, b.token);
  assert.strictEqual(msg.status, 201);

  // Amok darf nur Schulleitung oder auslösende Person beenden
  assert.strictEqual((await call(`/api/alarms/${id}/resolve`, {}, b.token)).status, 403);
  // Zweiter Alarm (medizinisch) darf von allen beendet werden
  const med = (await call('/api/alarms', { type: 'medical', location: 'Turnhalle' }, b.token)).data;
  assert.strictEqual((await call(`/api/alarms/${med.id}/resolve`, { falseAlarm: true }, a.token)).data.status, 'false_alarm');

  const end = await call(`/api/alarms/${id}/resolve`, { note: 'Polizei: Lage sicher' }, sl.token);
  assert.strictEqual(end.data.status, 'resolved');

  const seen = await alarmsSeenByB;
  assert.deepStrictEqual(seen.map((x) => x.status), ['active', 'active', 'active', 'false_alarm']);

  const st = (await call('/api/state', null, a.token)).data;
  assert.strictEqual(st.messages.length, 1);
  assert.strictEqual(st.alarms.length, 2);
  assert.strictEqual((await call('/api/push/subscribe', { subscription: { endpoint: 'http://evil' } }, a.token)).status, 400);
});
