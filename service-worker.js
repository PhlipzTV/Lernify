// Lernify Service Worker
// Cached die App-Hülle (HTML/Manifest/Icons) und die externen Bibliotheken
// (pdf.js, Google Fonts), damit die App nach dem ersten Laden auch offline
// startet und PDFs auch ohne Internetverbindung verarbeitet werden können.
// Die KI-Funktionen (Lernzettel/Karteikarten/Aufgaben/Suche) brauchen weiterhin
// eine aktive Internetverbindung, da sie live bei Anthropic angefragt werden.

const CACHE_NAME = 'lernify-cache-v1';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

// Externe Ressourcen werden beim ersten erfolgreichen Laden automatisch
// mitgecacht (siehe fetch-Handler), da ihre exakten URLs/Versionen sich
// ändern können und Cross-Origin-Precaching leicht fehlschlägt.

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch((err) => {
      console.warn('Lernify SW: App-Shell konnte nicht vollständig gecacht werden:', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Anfragen an die Anthropic-API NIE cachen — die müssen immer live sein.
  if (req.url.includes('api.anthropic.com')) {
    return; // Browser-Standardverhalten, kein Eingriff durch den Service Worker.
  }

  // Cache-first, mit Netzwerk-Fallback; erfolgreiche Antworten werden
  // nachträglich in den Cache gelegt (gilt auch für pdf.js/Fonts von CDNs).
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
          }
          return networkResponse;
        })
        .catch(() => {
          // Weder Cache noch Netzwerk verfügbar (z.B. Erststart ohne Internet).
          if (req.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('', { status: 504, statusText: 'Offline und nicht im Cache' });
        });
    })
  );
});
