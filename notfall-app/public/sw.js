/* Service Worker: Push-Benachrichtigungen und Offline-Grundgerüst */
const CACHE = 'notfall-v1';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'icon.svg', 'manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Netzwerk zuerst, Cache nur als Rückfall (API nie cachen)
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.pathname.startsWith('/api/')) return;
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request)),
  );
});

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data.json(); } catch { d = { title: 'Notfall Kollegium', body: e.data && e.data.text() }; }
  const isAlarm = d.kind === 'alarm';
  e.waitUntil(self.registration.showNotification(d.title || 'Notfall Kollegium', {
    body: d.body || '',
    tag: d.alarmId ? 'alarm-' + d.alarmId : d.kind === 'message' ? 'chat' : undefined,
    renotify: true,
    requireInteraction: isAlarm,
    silent: !!d.silent,
    vibrate: isAlarm ? (d.silent ? [400, 200, 400] : [800, 300, 800, 300, 800]) : [200],
    icon: 'icon.svg',
    badge: 'icon.svg',
    data: { alarmId: d.alarmId || null },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const alarmId = e.notification.data && e.notification.data.alarmId;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (all.length) {
      const c = all[0];
      await c.focus();
      if (alarmId) c.postMessage({ alarmId });
      return;
    }
    await self.clients.openWindow(alarmId ? './?alarm=' + encodeURIComponent(alarmId) : './');
  })());
});
