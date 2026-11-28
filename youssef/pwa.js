/* تثبيت منصة مستر يوسف كتطبيق + تسجيل الـ service worker */
(function () {
  if (!('serviceWorker' in navigator)) return;
  var base = (document.currentScript && document.currentScript.src) ? new URL('.', document.currentScript.src).href : './';
  var standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  window.addEventListener('load', function () {
    navigator.serviceWorker.register(base + 'sw.js', { scope: base, updateViaCache: 'none' }).then(function (reg) {
      document.addEventListener('visibilitychange', function () { if (!document.hidden) reg.update().catch(function () {}); });
    }).catch(function () {});
  });
  if (standalone) return;

  var ua = navigator.userAgent || '';
  var ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var KEY = 'my-pwa-hide-until', deferred = null, btn = null;
  var hideUntil = 0; try { hideUntil = +localStorage.getItem(KEY) || 0; } catch (e) {}
  if (Date.now() < hideUntil) return;

  function style() {
    var s = document.createElement('style');
    s.textContent = '.pwa-bar{position:fixed;z-index:99999;left:12px;right:12px;bottom:12px;max-width:440px;margin:0 auto;display:flex;align-items:center;gap:10px;background:#fff;color:#17252e;border:3px solid #17252e;border-radius:16px;box-shadow:4px 4px 0 #17252e;padding:10px 12px;font-family:Cairo,Tahoma,Arial,sans-serif;direction:rtl}.pwa-bar img{width:44px;height:44px;border-radius:12px;border:2px solid #17252e;flex:none}.pwa-bar div{flex:1;font-size:14px;line-height:1.5;font-weight:700}.pwa-bar button{font:inherit;font-weight:800;font-size:14px;border:2px solid #17252e;border-radius:12px;padding:7px 14px;cursor:pointer;background:#ffc93c;color:#17252e}.pwa-bar .x{background:#fff;padding:7px 10px}';
    document.head.appendChild(s);
  }
  function close(days) {
    try { localStorage.setItem(KEY, String(Date.now() + days * 864e5)); } catch (e) {}
    if (btn) { btn.remove(); btn = null; }
  }
  function bar(text, action) {
    if (btn) return; style();
    btn = document.createElement('div'); btn.className = 'pwa-bar'; btn.setAttribute('role', 'dialog');
    btn.innerHTML = '<img src="' + base + 'icons/icon-192.png" alt=""><div></div>' + (action ? '<button type="button" class="go">تثبيت</button>' : '') + '<button type="button" class="x" aria-label="إغلاق">✕</button>';
    btn.querySelector('div').textContent = text;
    btn.querySelector('.x').onclick = function () { close(ios ? 14 : 7); };
    if (action) btn.querySelector('.go').onclick = action;
    document.body.appendChild(btn);
  }
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e;
    /* نتأخر بالشريط شوية عشان ما يغطّيش أول شاشة */
    setTimeout(function () {
      if (!deferred) return;
      bar('ثبّت منصة مستر يوسف على موبايلك وافتحها كتطبيق', function () {
        deferred.prompt(); deferred.userChoice.then(function (r) { deferred = null; close(r && r.outcome === 'accepted' ? 365 : 3); });
      });
    }, 9000);
  });
  window.addEventListener('appinstalled', function () { close(365); });
  if (ios) setTimeout(function () {
    bar('للتثبيت: اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية»', null);
  }, 9000);
})();
