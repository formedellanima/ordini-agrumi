/* Service worker: rende l'app installabile (computer, Android, iPhone) e la fa aprire anche con rete scarsa.
   - Pagine e file del sito: prima la rete (così ogni pubblicazione arriva subito), copia salvata come riserva.
   - Librerie Firebase e caratteri: dalla copia salvata (hanno la versione nell'indirizzo, non cambiano).
   - I dati (Firestore, accesso) NON passano da qui: restano sempre in tempo reale. */
const CACHE = 'ordini-agrumi-v1';
const BASE = ['./', 'index.html', 'ordina.html', 'stato.html', 'stile.css', 'notifiche.js', 'config.js', 'manifest.webmanifest', 'icona-180.png', 'icona-192.png', 'icona-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(BASE.map(u => c.add(new Request(u, {cache:'reload'})).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const statico = url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/')
    || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (statico) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); } return res; })));
    return;
  }
  if (url.origin !== location.origin) return;
  // no-cache: chiede sempre al server se il file è cambiato (niente copie vecchie della cache del browser).
  e.respondWith(fetch(url.href, {cache:'no-cache', credentials:'same-origin'}).then(res => {
    if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
    return res;
  }).catch(() => caches.match(req, {ignoreSearch:true}).then(r => r || caches.match(url.pathname.endsWith('/') ? 'index.html' : req))));
});
