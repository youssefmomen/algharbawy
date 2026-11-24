// صفحة الدخول وإنشاء الحساب
(function () {
  var mode = "in";
  var el = function (id) { return document.getElementById(id); };

  function next() {
    // يقبل فقط اسم صفحة داخلية من الموقع (مثل index.html) ويرفض أي رابط خارجي أو javascript:
    var n = new URLSearchParams(location.search).get("next") || "";
    return /^[A-Za-z0-9_-]+\.html(\?[A-Za-z0-9_=&%.-]*)?$/.test(n) ? n : "index.html";
  }
  function errMsg(code) {
    var map = {
      "auth/invalid-email": "صيغة البريد الإلكتروني غير صحيحة.",
      "auth/user-not-found": "تأكد من البريد الإلكتروني وكلمة المرور.",
      "auth/wrong-password": "تأكد من البريد الإلكتروني وكلمة المرور.",
      "auth/invalid-credential": "تأكد من البريد الإلكتروني وكلمة المرور.",
      "auth/email-already-in-use": "هذا البريد مسجّل من قبل، جرّب تسجيل الدخول.",
      "auth/weak-password": "كلمة المرور قصيرة، استخدم ٦ أحرف على الأقل.",
      "auth/popup-closed-by-user": "",
      "auth/cancelled-popup-request": "",
      "auth/network-request-failed": "تحقق من اتصالك بالإنترنت وحاول مجددًا."
    };
    return map[code] !== undefined ? map[code] : "حدث خطأ، حاول مرة أخرى.";
  }
  function showErr(code) {
    el("auth-err").textContent = errMsg(code);
  }
  function setMode(m) {
    mode = m;
    el("tab-in").classList.toggle("on", m === "in");
    el("tab-up").classList.toggle("on", m === "up");
    el("auth-title").textContent = m === "in" ? "تسجيل الدخول" : "إنشاء حساب جديد";
    el("auth-sub").textContent = m === "in"
      ? "سجّل دخولك ليُحفَظ تقدّمك في الدروس على حسابك."
      : "أنشئ حسابك في دقيقة، واحفظ تقدّمك في كل الدروس.";
    el("auth-go").textContent = m === "in" ? "دخول" : "إنشاء الحساب";
    el("f-pass").setAttribute("autocomplete", m === "in" ? "current-password" : "new-password");
    el("auth-err").textContent = "";
  }

  Store.init().then(function () {
    if (!Store.isReady()) {
      el("auth-err").textContent = "خدمة الحسابات غير متاحة حاليًا.";
      return;
    }
    Store.onAuth(function (u) {
      if (u) location.href = next();
    });
    el("tab-in").addEventListener("click", function () { setMode("in"); });
    el("tab-up").addEventListener("click", function () { setMode("up"); });
    el("auth-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var email = el("f-email").value.trim(), pass = el("f-pass").value;
      if (!email || !pass) { el("auth-err").textContent = "املأ البريد الإلكتروني وكلمة المرور."; return; }
      el("auth-go").disabled = true;
      var p = mode === "in" ? Store.signInEmail(email, pass) : Store.signUpEmail(email, pass);
      p.catch(function (err) {
        el("auth-go").disabled = false;
        showErr(err && err.code);
      });
    });
    el("auth-google").addEventListener("click", function () {
      el("auth-err").textContent = "";
      Store.signInGoogle().catch(function (err) { showErr(err && err.code); });
    });
  });
})();
