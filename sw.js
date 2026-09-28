const CACHE='venta3d-v13';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./favicon.png','./jszip.min.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const copy=r.clone();if(new URL(e.request.url).origin===location.origin)caches.open(CACHE).then(x=>x.put(e.request,copy));return r}).catch(()=>caches.match('./index.html'))));});
