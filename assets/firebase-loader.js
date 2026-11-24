/*
 * محمّل Firebase الكسول
 * الصفحات العامة لا تحتاج Firebase إلا للزائر الذي له حساب مسجّل من قبل،
 * لذلك نحمّل مكتبات Firebase (نحو 300KB) فقط عند الحاجة:
 *   - صفحتا الدخول ولوحة التحكم تحمّلان ملفات Firebase مباشرة من HTML
 *   - الصفحات العامة تكتشف علامة "له حساب" في التخزين المحلي
 * النتيجة: وعد window.StoreReady يُستعمل في app.js
 */
(function () {
  var loaded = null;
  var FILES = [
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js",
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js",
    "assets/firebase-config.js?v=2",
    "assets/store.js?v=3"
  ];
  function one(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  function load() {
    if (loaded) return loaded;
    var p = Promise.resolve();
    FILES.forEach(function (f) { p = p.then(function () { return one(f); }); });
    loaded = p.then(function () { return true; }).catch(function () { return false; });
    return loaded;
  }
  var returning = false;
  try { returning = !!localStorage.getItem("gh-account"); } catch (e) {}
  window.Store = window.Store || null;
  window.StoreLoader = { load: load };
  window.StoreReady = returning ? load() : Promise.resolve(false);
})();
