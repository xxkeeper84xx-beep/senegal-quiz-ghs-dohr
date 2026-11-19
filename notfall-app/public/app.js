'use strict';
/* Notfall Kollegium – Client */

const $ = (s) => document.querySelector(s);
const el = (tag, props = {}, ...children) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') e.className = v;
    else if (k === 'style') e.style.cssText = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null && v !== false) e.setAttribute(k, v);
  }
  for (const c of children.flat()) if (c != null) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
};

const store = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};

const S = {
  config: null,
  token: store.get('token'),
  me: null,
  users: {},
  online: [],
  alarms: new Map(),
  messages: [],
  location: store.get('location', ''),
  recentLocations: store.get('recentLocations', []),
  minimized: new Set(),
  overlayId: null,
  tab: 'alarm',
  channel: '',
  unread: 0,
  es: null,
};

// Android-/iPhone-App (NINA-ähnlicher Alarm): übernimmt Ton/Vibration/Vollbild selbst
const NATIVE = typeof window.NativeAlarm !== 'undefined';
const native = (fn, ...args) => { try { if (NATIVE) return window.NativeAlarm[fn](...args); } catch {} };
window.openAlarmFromNative = (id) => openOverlay(id, true);

const COMMON_LOCATIONS = ['Lehrerzimmer', 'Schulhof', 'Turnhalle', 'Mensa', 'Sekretariat', 'Aula', 'Bibliothek'];

// ---------------------------------------------------------------- API
async function api(path, body) {
  const res = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', ...(S.token ? { Authorization: 'Bearer ' + S.token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && S.token) { logout(true); throw new Error('Sitzung abgelaufen.'); }
  if (!res.ok) throw new Error(data.error || 'Fehler ' + res.status);
  return data;
}

// ---------------------------------------------------------------- Start
async function init() {
  S.config = await fetch('/api/config').then((r) => r.json());
  $('#school-name').textContent = S.config.schoolName;
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  if (S.token) await enterApp().catch(() => showLogin());
  else showLogin();

  // Klick auf eine Push-Benachrichtigung
  navigator.serviceWorker?.addEventListener('message', (e) => {
    if (e.data?.alarmId) openOverlay(e.data.alarmId, true);
  });
  const p = new URLSearchParams(location.search).get('alarm');
  if (p) setTimeout(() => openOverlay(p, true), 500);
}

function showLogin() {
  $('#main').classList.add('hidden');
  $('#login').classList.remove('hidden');
}

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  $('#login-error').textContent = '';
  try {
    const r = await api('/api/login', Object.fromEntries(f));
    S.token = r.token;
    store.set('token', r.token);
    unlockAudio();
    await enterApp();
  } catch (err) {
    $('#login-error').textContent = err.message;
  }
});

async function enterApp() {
  await loadState();
  $('#login').classList.add('hidden');
  $('#main').classList.remove('hidden');
  $('#me-label').textContent = `${S.me.name} (${S.me.shortName})${S.me.isAdmin ? ' · Schulleitung' : ''}`;
  renderLocation();
  renderAlarmButtons();
  renderAll();
  connectEvents();
  native('setSession', S.token);
  updatePushStatus();
  if (!S.location) setTimeout(askLocation, 400);
}

async function loadState() {
  const st = await api('/api/state');
  S.me = st.me;
  S.users = st.users;
  S.online = st.online;
  S.alarms = new Map(st.alarms.map((a) => [a.id, a]));
  S.messages = st.messages;
}

function connectEvents() {
  if (S.es) S.es.close();
  const es = new EventSource('/api/events?token=' + encodeURIComponent(S.token));
  S.es = es;
  let first = true;
  es.onopen = async () => {
    $('#conn').className = 'dot on';
    if (!first) { await loadState().catch(() => {}); renderAll(); }
    first = false;
  };
  es.onerror = () => { $('#conn').className = 'dot off'; };
  es.addEventListener('alarm', (e) => onAlarm(JSON.parse(e.data)));
  es.addEventListener('message', (e) => onMessage(JSON.parse(e.data)));
  es.addEventListener('presence', (e) => { S.online = JSON.parse(e.data); for (const u of S.online) S.users[u.id] = u; renderTeam(); });
}

// ---------------------------------------------------------------- Ereignisse
function onAlarm(a) {
  const isNew = !S.alarms.has(a.id);
  const prev = S.alarms.get(a.id);
  S.alarms.set(a.id, a);
  const t = S.config.alarmTypes[a.type];
  if (isNew && a.status === 'active') {
    S.minimized.delete(a.id);
    openOverlay(a.id);
    if (a.createdBy !== S.me.id) {
      vibrate(t.silent ? [400, 200, 400] : [800, 300, 800, 300, 800]);
      if (!t.silent && !NATIVE) startSiren();
      if (!NATIVE) notifyLocal(`${t.icon} ${t.label.toUpperCase()}`, `Ort: ${a.location}`, a.id, t.silent);
    }
  } else if (prev?.status === 'active' && a.status !== 'active') {
    if (S.overlayId === a.id) closeOverlay();
    stopSiren();
    notifyLocal(`✅ ${a.status === 'false_alarm' ? 'Fehlalarm' : 'Entwarnung'}: ${t.label}`, `Ort: ${a.location}`, a.id, true);
  } else if (prev) {
    // Hilferuf neu hinzugekommen?
    for (const [uid, r] of Object.entries(a.responses)) {
      if (r.response === 'help' && prev.responses[uid]?.response !== 'help' && uid !== S.me.id) {
        vibrate([500, 200, 500]);
        openOverlay(a.id, true);
      }
    }
  }
  renderAll();
}

function onMessage(m) {
  S.messages.push(m);
  const visible = (S.tab === 'chat' && (S.channel || null) === (m.alarmId || null)) || (S.overlayId && S.overlayId === m.alarmId);
  if (!visible && m.userId !== S.me.id) {
    S.unread++;
    if (document.hidden) notifyLocal(`💬 ${userName(m.userId)}`, m.text, m.alarmId, true);
  }
  renderChat();
  renderOverlay();
  renderBadge();
}

// ---------------------------------------------------------------- Alarm auslösen
function renderAlarmButtons() {
  const grid = $('#alarm-grid');
  grid.textContent = '';
  const subs = {
    amok: 'Stiller Alarm – kein Ton auf den Geräten',
    medical: 'Verletzung, Bewusstlosigkeit, Anfall …',
    fight: 'Schlägerei, Bedrohung, Gewalt',
    danger: 'Alles andere (Gefahrstoff, Feuer, Person …)',
  };
  for (const [key, t] of Object.entries(S.config.alarmTypes)) {
    const btn = el('button', { class: 'alarm-btn' + (key === 'amok' ? ' big' : ''), style: `background:${t.color}`, type: 'button' },
      el('span', { class: 'fill' }),
      el('span', { class: 'ico' }, t.icon),
      el('span', {}, t.label),
      el('span', { class: 'sub' }, subs[key] || ''));
    setupHold(btn, () => triggerAlarm(key));
    grid.append(btn);
  }
}

function setupHold(btn, action) {
  const HOLD = 1500;
  let start = 0, raf = 0;
  const fill = btn.querySelector('.fill');
  const reset = () => { cancelAnimationFrame(raf); start = 0; fill.style.width = '0'; };
  const tick = () => {
    const p = Math.min(1, (performance.now() - start) / HOLD);
    fill.style.width = p * 100 + '%';
    if (p >= 1) { reset(); vibrate(100); action(); return; }
    raf = requestAnimationFrame(tick);
  };
  btn.addEventListener('pointerdown', (e) => { e.preventDefault(); unlockAudio(); start = performance.now(); raf = requestAnimationFrame(tick); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, reset));
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
  // Tastatur: Enter/Leertaste gedrückt halten
  btn.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && !start) { e.preventDefault(); start = performance.now(); raf = requestAnimationFrame(tick); } });
  btn.addEventListener('keyup', reset);
}

async function triggerAlarm(type) {
  const t = S.config.alarmTypes[type];
  let loc = S.location;
  let note = '';
  const r = await dialog(`${t.icon} ${t.label} auslösen`, (body) => {
    body.append(
      el('label', {}, 'Ort des Notfalls', el('input', { id: 'dlg-loc', value: loc, required: true, placeholder: 'z. B. Raum 104' })),
      chips([...new Set([loc, ...S.recentLocations, ...COMMON_LOCATIONS].filter(Boolean))].slice(0, 9), (v) => { $('#dlg-loc').value = v; }),
      el('label', { style: 'margin-top:12px' }, 'Kurze Info (optional)', el('input', { id: 'dlg-note', maxlength: 300, placeholder: 'z. B. Schüler bewusstlos' })),
    );
    setTimeout(() => (loc ? $('#dlg-note') : $('#dlg-loc')).focus(), 50);
  }, [['cancel', 'Abbrechen', ''], ['ok', 'ALARM SENDEN', 'danger']], () => {
    loc = $('#dlg-loc').value.trim();
    note = $('#dlg-note').value.trim();
    return !!loc;
  });
  if (r !== 'ok') return;
  setLocation(loc);
  try {
    const a = await api('/api/alarms', { type, location: loc, note });
    S.alarms.set(a.id, a);
    openOverlay(a.id, true);
    renderAll();
  } catch (e) {
    alert('Alarm konnte NICHT gesendet werden: ' + e.message + '\n\nBitte sofort telefonisch alarmieren (110 / 112)!');
  }
}

// ---------------------------------------------------------------- Overlay
function openOverlay(id, force) {
  const a = S.alarms.get(id);
  if (!a || a.status !== 'active') return;
  if (!force && S.overlayId && S.overlayId !== id) {
    // Bereits ein Alarm sichtbar: Amok hat Vorrang
    const cur = S.alarms.get(S.overlayId);
    if (cur && cur.type === 'amok' && a.type !== 'amok') { renderAll(); return; }
  }
  S.minimized.delete(id);
  S.overlayId = id;
  renderOverlay();
}

function closeOverlay() {
  S.overlayId = null;
  $('#overlay').classList.add('hidden');
  // Nächsten nicht minimierten Alarm zeigen
  const next = activeAlarms().find((a) => !S.minimized.has(a.id));
  if (next) openOverlay(next.id);
}

function renderOverlay() {
  const ov = $('#overlay');
  const a = S.overlayId && S.alarms.get(S.overlayId);
  if (!a || a.status !== 'active') { ov.classList.add('hidden'); return; }
  const t = S.config.alarmTypes[a.type];
  ov.classList.remove('hidden');
  ov.style.setProperty('--alarm', t.color);
  ov.classList.toggle('flash', !t.silent && !a.responses[S.me.id]);
  $('#ov-icon').textContent = t.icon;
  $('#ov-title').textContent = t.label;
  $('#ov-loc').textContent = '📍 ' + a.location;
  $('#ov-meta').textContent = `${a.note ? a.note + ' · ' : ''}gemeldet von ${userName(a.createdBy)} um ${time(a.createdAt)}`;

  const steps = $('#ov-steps');
  steps.textContent = '';
  t.instructions.forEach((s) => steps.append(el('li', {}, s)));

  const mine = a.responses[S.me.id]?.response;
  const resp = $('#ov-responses');
  resp.textContent = '';
  t.responses.forEach((r) => resp.append(el('button', {
    class: 'btn' + (mine === r.id ? ' chosen' : ''), type: 'button',
    onclick: () => respond(a.id, r.id),
  }, r.label)));

  const list = $('#ov-resp-list');
  list.textContent = '';
  const entries = Object.entries(a.responses).sort((x, y) => x[1].at - y[1].at);
  entries.forEach(([uid, r]) => {
    const label = t.responses.find((x) => x.id === r.response)?.label || r.response;
    list.append(el('div', {}, `${r.response === 'help' ? '🆘 ' : '✔︎ '}${userName(uid)}: ${label}${r.location ? ' (' + r.location + ')' : ''} – ${time(r.at)}`));
  });

  renderMessages($('#ov-chat-list'), a.id);

  const canResolve = !t.adminResolveOnly || S.me.isAdmin || a.createdBy === S.me.id;
  $('#ov-resolve').classList.toggle('hidden', !canResolve);
}

async function respond(alarmId, response) {
  stopSiren();
  native('stopAlarm');
  try {
    const a = await api(`/api/alarms/${alarmId}/respond`, { response, location: S.location });
    S.alarms.set(a.id, a);
    renderOverlay();
  } catch (e) { alert(e.message); }
}

$('#ov-minimize').addEventListener('click', () => {
  stopSiren();
  native('stopAlarm');
  if (S.overlayId) S.minimized.add(S.overlayId);
  S.overlayId = null;
  $('#overlay').classList.add('hidden');
  renderAll();
});

$('#ov-resolve').addEventListener('click', async () => {
  const a = S.alarms.get(S.overlayId);
  if (!a) return;
  let note = '';
  const r = await dialog('Alarm beenden?', (body) => {
    body.append(
      el('p', {}, `${S.config.alarmTypes[a.type].label} – ${a.location}`),
      el('label', {}, 'Hinweis (optional)', el('input', { id: 'dlg-note', maxlength: 300, placeholder: 'z. B. Polizei vor Ort, Lage sicher' })),
    );
  }, [['cancel', 'Abbrechen', ''], ['false', 'Fehlalarm', ''], ['ok', 'Entwarnung', 'ok']], () => { note = $('#dlg-note').value; return true; });
  if (r === 'cancel' || !r) return;
  try {
    const res = await api(`/api/alarms/${a.id}/resolve`, { falseAlarm: r === 'false', note });
    onAlarm(res);
  } catch (e) { alert(e.message); }
});

$('#ov-chat-form').addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage($('#ov-chat-input'), S.overlayId);
});

// ---------------------------------------------------------------- Rendering
const activeAlarms = () => [...S.alarms.values()].filter((a) => a.status === 'active').sort((a, b) => b.createdAt - a.createdAt);
const userName = (uid) => (S.users[uid] ? `${S.users[uid].name} (${S.users[uid].shortName})` : 'Unbekannt');
const time = (ts) => new Date(ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
const dateTime = (ts) => new Date(ts).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

function renderAll() {
  renderBanners();
  renderHistory();
  renderChannels();
  renderChat();
  renderTeam();
  renderOverlay();
  renderBadge();
}

function renderBanners() {
  const area = $('#banner-area');
  area.textContent = '';
  for (const a of activeAlarms()) {
    if (a.id === S.overlayId) continue;
    const t = S.config.alarmTypes[a.type];
    area.append(el('div', { class: 'banner', style: `background:${t.color}`, onclick: () => openOverlay(a.id, true) },
      el('span', {}, t.icon), el('span', { style: 'flex:1' }, `${t.label} – ${a.location}`), el('span', { class: 'small' }, 'öffnen ›')));
  }
}

function renderHistory() {
  const h = $('#history');
  h.textContent = '';
  const all = [...S.alarms.values()].sort((a, b) => b.createdAt - a.createdAt).slice(0, 20);
  if (!all.length) h.append(el('p', { class: 'muted small' }, 'Noch keine Alarme.'));
  for (const a of all) {
    const t = S.config.alarmTypes[a.type];
    const status = a.status === 'active' ? 'AKTIV' : a.status === 'false_alarm' ? 'Fehlalarm' : 'Entwarnung';
    h.append(el('div', { class: 'item' + (a.status === 'active' ? ' clickable' : ''), onclick: () => openOverlay(a.id, true) },
      el('span', { class: 'ico' }, t.icon),
      el('div', { class: 'grow' },
        el('div', { class: 't' }, `${t.label} – ${a.location}`),
        el('div', { class: 'small muted' }, `${dateTime(a.createdAt)} · ${userName(a.createdBy)}${a.resolvedAt ? ' · beendet ' + time(a.resolvedAt) : ''}`)),
      el('span', { class: 'tag' + (a.status === 'active' ? ' active' : '') }, status)));
  }
}

function renderChannels() {
  const sel = $('#chat-channel');
  const cur = S.channel;
  sel.textContent = '';
  sel.append(el('option', { value: '' }, '💬 Allgemein (ganzes Kollegium)'));
  const alarms = [...S.alarms.values()].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
  for (const a of alarms) {
    const t = S.config.alarmTypes[a.type];
    sel.append(el('option', { value: a.id }, `${t.icon} ${t.label} – ${a.location} (${dateTime(a.createdAt)})${a.status === 'active' ? ' • AKTIV' : ''}`));
  }
  sel.value = [...sel.options].some((o) => o.value === cur) ? cur : '';
  S.channel = sel.value;
}

$('#chat-channel').addEventListener('change', (e) => { S.channel = e.target.value; renderChat(); });

function renderMessages(container, alarmId) {
  const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 40;
  container.textContent = '';
  const msgs = S.messages.filter((m) => (m.alarmId || null) === (alarmId || null)).slice(-150);
  if (!msgs.length) container.append(el('div', { class: 'msg system' }, alarmId ? 'Noch keine Lagemeldungen.' : 'Noch keine Nachrichten.'));
  for (const m of msgs) {
    container.append(el('div', { class: 'msg' + (m.userId === S.me.id ? ' mine' : '') },
      el('div', { class: 'who' }, `${m.userId === S.me.id ? 'Ich' : userName(m.userId)} · ${time(m.at)}`),
      el('div', { class: 'txt' }, m.text)));
  }
  if (atBottom || container.dataset.init !== '1') container.scrollTop = container.scrollHeight;
  container.dataset.init = '1';
}

function renderChat() {
  if (S.tab === 'chat') { S.unread = 0; renderBadge(); }
  renderMessages($('#chat-list'), S.channel || null);
}

function renderBadge() {
  const b = $('#chat-badge');
  b.textContent = S.unread > 99 ? '99+' : S.unread;
  b.classList.toggle('hidden', !S.unread);
}

function renderTeam() {
  $('#online-count').textContent = S.online.length;
  const l = $('#online-list');
  l.textContent = '';
  for (const u of S.online.sort((a, b) => a.name.localeCompare(b.name))) {
    l.append(el('div', { class: 'item' }, el('span', { class: 'dot on' }), el('div', { class: 'grow t' }, `${u.name} (${u.shortName})`),
      u.isAdmin ? el('span', { class: 'tag' }, 'Schulleitung') : null));
  }
}

// ---------------------------------------------------------------- Chat
$('#chat-form').addEventListener('submit', (e) => { e.preventDefault(); sendMessage($('#chat-input'), S.channel || null); });

async function sendMessage(input, alarmId) {
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  try { await api('/api/messages', { text, alarmId }); }
  catch (e) { input.value = text; alert('Nachricht nicht gesendet: ' + e.message); }
}

// ---------------------------------------------------------------- Tabs
document.querySelectorAll('.tabbar button').forEach((b) => b.addEventListener('click', () => {
  S.tab = b.dataset.tab;
  document.querySelectorAll('.tabbar button').forEach((x) => x.classList.toggle('active', x === b));
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('hidden', t.id !== 'tab-' + S.tab));
  if (S.tab === 'chat') renderChat();
}));

// ---------------------------------------------------------------- Standort
function setLocation(loc) {
  S.location = loc;
  store.set('location', loc);
  S.recentLocations = [loc, ...S.recentLocations.filter((x) => x !== loc)].slice(0, 5);
  store.set('recentLocations', S.recentLocations);
  renderLocation();
}
function renderLocation() { $('#loc-label').textContent = S.location || 'Standort setzen'; }

async function askLocation() {
  let v = '';
  const r = await dialog('Wo bist du gerade?', (body) => {
    body.append(
      el('p', { class: 'small muted' }, 'Wird bei Alarmen und Rückmeldungen mitgesendet. Bitte bei Raumwechsel aktualisieren.'),
      el('input', { id: 'dlg-loc', value: S.location, placeholder: 'z. B. Raum 104' }),
      chips([...new Set([...S.recentLocations, ...COMMON_LOCATIONS])].slice(0, 10), (x) => { $('#dlg-loc').value = x; }),
    );
  }, [['cancel', 'Abbrechen', ''], ['ok', 'Speichern', 'primary']], () => { v = $('#dlg-loc').value.trim(); return true; });
  if (r === 'ok' && v) setLocation(v);
}
$('#loc-btn').addEventListener('click', askLocation);

// ---------------------------------------------------------------- Dialog-Helfer
function chips(values, onPick) {
  return el('div', { class: 'chips' }, values.map((v) => el('button', { class: 'chip', type: 'button', onclick: () => onPick(v) }, v)));
}

function dialog(title, build, actions, validate) {
  return new Promise((resolve) => {
    const d = $('#dialog');
    $('#dlg-title').textContent = title;
    const body = $('#dlg-body');
    body.textContent = '';
    build(body);
    const act = $('#dlg-actions');
    act.textContent = '';
    for (const [value, label, cls] of actions) {
      act.append(el('button', { class: 'btn ' + cls, value, type: value === 'cancel' ? 'button' : 'submit',
        onclick: value === 'cancel' ? () => d.close('cancel') : null }, label));
    }
    const form = $('#dialog-form');
    form.onsubmit = (e) => {
      const v = e.submitter?.value || 'ok';
      if (v !== 'cancel' && validate && !validate()) { e.preventDefault(); return; }
    };
    d.onclose = () => resolve(d.returnValue || 'cancel');
    d.returnValue = '';
    d.showModal();
  });
}

// ---------------------------------------------------------------- Ton, Vibration, Benachrichtigung
let audioCtx = null, siren = null;
function unlockAudio() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch {}
}
function startSiren(seconds = 20) {
  if (!audioCtx || siren) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  gain.gain.value = 0.25;
  const t0 = audioCtx.currentTime;
  for (let i = 0; i < seconds; i++) {
    osc.frequency.setValueAtTime(650, t0 + i);
    osc.frequency.linearRampToValueAtTime(1300, t0 + i + 0.5);
    osc.frequency.linearRampToValueAtTime(650, t0 + i + 1);
  }
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(t0 + seconds);
  osc.onended = () => { if (siren === osc) siren = null; };
  siren = osc;
}
function stopSiren() { try { siren?.stop(); } catch {} siren = null; }
function vibrate(p) { try { navigator.vibrate?.(p); } catch {} }

async function notifyLocal(title, body, alarmId, silent) {
  if (!document.hidden || Notification?.permission !== 'granted') return;
  const reg = await navigator.serviceWorker?.getRegistration();
  reg?.showNotification(title, { body, tag: alarmId || 'chat', renotify: true, silent, requireInteraction: !!alarmId, data: { alarmId }, icon: 'icon.svg' });
}

$('#sound-test').addEventListener('click', () => { unlockAudio(); siren ? stopSiren() : startSiren(3); });

// ---------------------------------------------------------------- Push
function urlB64ToUint8(b64) {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function updatePushStatus() {
  const s = $('#push-status');
  if (NATIVE) {
    s.textContent = 'Alarme kommen über die Handy-App – auch bei Stummschaltung. Bitte einmal die Alarm-Einstellungen prüfen.';
    $('#push-enable').textContent = '⚙️ Alarm-Einstellungen des Handys';
    $('#push-test').classList.add('hidden');
    $('#sound-test').classList.add('hidden');
    return;
  }
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    s.textContent = '⚠️ Dieses Gerät/dieser Browser unterstützt keine Push-Benachrichtigungen (ggf. App zum Home-Bildschirm hinzufügen oder HTTPS nutzen).';
    return;
  }
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    // Abo erneut beim Server melden (z. B. nach Neuanmeldung)
    api('/api/push/subscribe', { subscription: sub.toJSON() }).catch(() => {});
    s.textContent = '✅ Push-Benachrichtigungen sind auf diesem Gerät aktiv.';
  } else {
    s.textContent = Notification.permission === 'denied'
      ? '⛔ Benachrichtigungen wurden blockiert. Bitte in den Browser-Einstellungen erlauben.'
      : '⚠️ Push ist noch nicht aktiv – ohne Push kommen Alarme nur bei geöffneter App an!';
  }
}

$('#push-enable').addEventListener('click', async () => {
  if (NATIVE) { native('openSettings'); return; }
  try {
    unlockAudio();
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') throw new Error('Benachrichtigungen wurden nicht erlaubt.');
    const reg = await navigator.serviceWorker.ready;
    const sub = (await reg.pushManager.getSubscription()) ||
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8(S.config.vapidPublicKey) }));
    await api('/api/push/subscribe', { subscription: sub.toJSON() });
  } catch (e) { alert(e.message); }
  updatePushStatus();
});

$('#push-test').addEventListener('click', async () => {
  try { await api('/api/push/test', {}); } catch (e) { alert(e.message); }
});

// ---------------------------------------------------------------- Abmelden
async function logout(silent) {
  if (!silent && !confirm('Wirklich abmelden? Du erhältst dann keine Alarme mehr auf diesem Gerät.')) return;
  try {
    if (!silent) {
      const reg = await navigator.serviceWorker?.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      await sub?.unsubscribe();
      await api('/api/logout', {});
    }
  } catch {}
  S.es?.close();
  native('clearSession');
  S.token = null;
  store.del('token');
  showLogin();
}
$('#logout').addEventListener('click', () => logout(false));

document.addEventListener('pointerdown', unlockAudio, { once: true });
init().catch((e) => { document.body.textContent = 'Fehler beim Start: ' + e.message; });
