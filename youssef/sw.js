/* منصة مستر يوسف: service worker
   - HTML / CSS / JS: الشبكة أولاً (دائماً أحدث نسخة)، والكاش فقط عند انقطاع الاتصال
   - الصور والخطوط من نفس الموقع: الكاش أولاً مع تحديث في الخلفية
   - أي طلب لموقع آخر (Firebase وغيره) لا يمرّ من هنا إطلاقاً
   لإجبار تحديث الكاش القديم: غيّر رقم VERSION */
var VERSION = 'my-pwa-20261127-1';
var CORE = 'core-' + VERSION, PAGES = 'pages-' + VERSION, MEDIA = 'media-' + VERSION;
var OFFLINE = 'offline.html';

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CORE).then(function (c) {
      return c.addAll([OFFLINE, 'icons/icon-192.png']);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k.indexOf(VERSION) === -1;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isCode(req, url) {
  if (req.mode === 'navigate') return true;
  return /\.(html|css|js|json|webmanifest)$/i.test(url.pathname) || url.pathname.slice(-1) === '/';
}

function networkFirst(req, isNav) {
  // cache:'no-cache' يتخطى كاش المتصفح (10 دقائق في GitHub Pages) ويتحقق من السيرفر
  return fetch(req, { cache: 'no-cache' }).then(function (res) {
    if (res && res.status === 200 && res.type === 'basic') {
      var copy = res.clone();
      caches.open(PAGES).then(function (c) { c.put(req, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: false }).then(function (hit) {
      if (hit) return hit;
      if (isNav) return caches.match(OFFLINE);
      return Response.error();
    });
  });
}

function cacheFirst(req) {
  return caches.match(req).then(function (hit) {
    var net = fetch(req).then(function (res) {
      if (res && res.status === 200 && res.type === 'basic') {
        var copy = res.clone();
        caches.open(MEDIA).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () { return hit; });
    return hit || net;
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.indexOf(new URL(self.registration.scope).pathname) !== 0) return;
  if (url.pathname.slice(-6) === '/sw.js') return;
  if (isCode(req, url)) { e.respondWith(networkFirst(req, req.mode === 'navigate')); return; }
  e.respondWith(cacheFirst(req));
});
