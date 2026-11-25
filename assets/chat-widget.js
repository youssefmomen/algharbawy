/*
 * فصيح — روبوت إرشاد الزوار في موقع مؤسسة الغرباوي (المرحلة ١)
 * ------------------------------------------------------------
 * فقاعة محادثة عائمة تظهر في كل الصفحات العامة، تجيب عن أسئلة الزوار
 * وترشدهم إلى أقسام الموقع ودروسه واختباراته.
 *
 * التقنية: Firebase AI Logic (واجهة Gemini Developer API المجانية) عبر
 * الحزمة الموديولار من CDN — لا تتعارض مع نسخة compat التي يحمّلها الموقع.
 * الحماية: App Check (reCAPTCHA Enterprise) إن توفّر، وحد أقصى للرسائل
 * في الجلسة الواحدة حتى لا يُستهلك الرصيد المجاني.
 * كل شيء يعمل على الخطة المجانية (Spark) بدون أي بطاقة.
 */
(function () {
  "use strict";

  var RECAPTCHA_SITE_KEY = "6Le4IDEuAAAAANYA2EvvnsJSnQwTKx3i5OzdPgcG";
  var MODEL_NAME = "gemini-flash-lite-latest";
  var SDK = "https://www.gstatic.com/firebasejs/11.10.0/";
  var MAX_PER_SESSION = 30; // حد الرسائل لكل زائر في الجلسة الواحدة
  var COUNT_KEY = "gh_chat_count";
  var isOwner = false;    // المالك المسجَّل يتجاوز حد الرسائل

  var ai = null;          // عميل المحادثة بعد التهيئة
  var aiReady = null;     // وعد التهيئة
  var aiError = null;

  function sectionsSummary() {
    try {
      var meta = window.SITE_META;
      if (!meta || !meta.sections) return "";
      var live = meta.sections.filter(function (s) { return s.live !== false; });
      return live.map(function (s) {
        return "- " + s.title + (s.description ? ": " + s.description : "");
      }).join("\n");
    } catch (e) { return ""; }
  }

  function systemPrompt() {
    return [
      "أنت «فصيح»، روبوت ودود داخل موقع مؤسسة الغرباوي لتعليم اللغة العربية لكل الأعمار. إذا سألك أحد عن اسمك فأخبره أنك «فصيح».",
      "مهمتك: الترحيب بالزائر، وشرح ما يقدمه الموقع، وإرشاده إلى القسم أو الدرس أو الاختبار أو اللعبة المناسبة له.",
      "تحدث دائمًا باللغة العربية الفصحى الحديثة فقط، ولا تستخدم أي عامية أو لهجة، وبجمل قصيرة واضحة ونبرة ودودة مرحة تليق بروبوت صديق.",
      "لا تخترع روابط أبدًا. إذا أردت توجيه الزائر لصفحة فاذكر اسم القسم فقط، مثل: «افتح قسم النحو من القائمة».",
      "الموقع يحتوي على: دروس مرتبة في أقسام، واختبارات تفاعلية، وألعاب تعليمية، وصفحة للطلاب وأخرى للمعلم.",
      "هذه أقسام الموقع المتاحة حاليًا:",
      sectionsSummary(),
      "إذا سألك الزائر سؤالًا في اللغة العربية أو النحو فأجب إجابة تعليمية قصيرة ومفيدة.",
      "إذا سُئلت عن شيء لا تعرفه أو خارج نطاق الموقع، فاعتذر بلطف واقترح على الزائر تصفّح الأقسام.",
      "لا تتحدث عن أسعار أو اشتراكات؛ الموقع مجاني بالكامل."
    ].join("\n");
  }

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  function initAI() {
    if (aiReady) return aiReady;
    aiReady = (async function () {
      // إعدادات Firebase: محمّلة مسبقًا في صفحات الدخول، ونحمّلها هنا إن لزم
      if (!window.FIREBASE_CONFIG) {
        await loadScript("assets/firebase-config.js?v=2");
      }
      var appMod = await import(SDK + "firebase-app.js");
      var app = appMod.initializeApp(window.FIREBASE_CONFIG, "chat-widget");

      // App Check للحماية من إساءة الاستخدام — اختياري: إن فشل يعمل البوت بدونه
      try {
        var acMod = await import(SDK + "firebase-app-check.js");
        acMod.initializeAppCheck(app, {
          provider: new acMod.ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY),
          isTokenAutoRefreshEnabled: true
        });
      } catch (e) { /* يعمل بدون App Check */ }

      // تجاوز حد الرسائل للمالك المسجَّل: نقارن بصمة بريده بالبصمة المحفوظة
      // (نفس أسلوب legacyAdmin في store.js — جلسة الدخول مشتركة لنفس appId)
      try {
        var auMod = await import(SDK + "firebase-auth.js");
        auMod.getAuth(app).onAuthStateChanged(function (u) {
          if (!u || !u.email || !window.FIREBASE_CONFIG.adminEmailHash || !window.crypto || !crypto.subtle) return;
          crypto.subtle.digest("SHA-256", new TextEncoder().encode(u.email.trim().toLowerCase()))
            .then(function (buf) {
              var hex = Array.prototype.map.call(new Uint8Array(buf), function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
              isOwner = (hex === window.FIREBASE_CONFIG.adminEmailHash);
            })
            .catch(function () {});
        });
      } catch (e) { /* بدون تجاوز */ }

      var vMod = await import(SDK + "firebase-ai.js");
      var vertex = vMod.getAI(app, { backend: new vMod.GoogleAIBackend() });
      var model = vMod.getGenerativeModel(vertex, {
        model: MODEL_NAME,
        systemInstruction: systemPrompt()
      });
      ai = model.startChat();
      return ai;
    })().catch(function (e) {
      aiError = e;
      throw e;
    });
    return aiReady;
  }

  function remaining() {
    if (isOwner) return 9999;
    var n = 0;
    try { n = parseInt(sessionStorage.getItem(COUNT_KEY) || "0", 10) || 0; } catch (e) {}
    return MAX_PER_SESSION - n;
  }
  function bump() {
    try {
      var n = parseInt(sessionStorage.getItem(COUNT_KEY) || "0", 10) || 0;
      sessionStorage.setItem(COUNT_KEY, String(n + 1));
    } catch (e) {}
  }

  /* ---------- الواجهة ---------- */
  var css = document.createElement("style");
  css.textContent =
    "#ghChatBtn{position:fixed;left:16px;bottom:16px;z-index:9999;width:64px;height:64px;border-radius:50%;" +
    "border:2px solid #c6a34f;cursor:pointer;background:#0f0d09;box-shadow:0 4px 16px rgba(0,0,0,.45),0 0 12px rgba(198,163,79,.35);" +
    "display:flex;align-items:center;justify-content:center;padding:0;animation:ghBob 3s ease-in-out infinite;}" +
    "#ghChatBtn:hover{box-shadow:0 6px 20px rgba(0,0,0,.5),0 0 18px rgba(198,163,79,.55);}" +
    "@keyframes ghBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}" +
    ".ghEye{transform-box:fill-box;transform-origin:center;animation:ghBlink 4.2s infinite;}" +
    "@keyframes ghBlink{0%,92%,100%{transform:scaleY(1)}95%,97%{transform:scaleY(.08)}}" +
    ".ghTip{animation:ghPulse 2s ease-in-out infinite;}" +
    "@keyframes ghPulse{0%,100%{opacity:.5}50%{opacity:1}}" +
    ".ghArm{transform-box:fill-box;transform-origin:top center;animation:ghWave 3s ease-in-out 1s 2;}" +
    "@keyframes ghWave{0%,100%{transform:rotate(0)}25%{transform:rotate(-28deg)}55%{transform:rotate(14deg)}80%{transform:rotate(-10deg)}}" +
    "#ghChatHi{position:fixed;left:92px;bottom:30px;z-index:9998;background:#171410;color:#ece4d2;border-radius:14px 14px 4px 14px;" +
    "padding:10px 34px 10px 14px;font-family:Amiri,'Noto Naskh Arabic',serif;font-size:15px;line-height:1.8;max-width:230px;direction:rtl;" +
    "box-shadow:0 6px 22px rgba(0,0,0,.5);border:1px solid rgba(198,163,79,.35);display:none;animation:ghPop .35s ease-out;}" +
    "#ghChatHi b{color:#c6a34f;}" +
    "@keyframes ghPop{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}" +
    "#ghChatHiX{position:absolute;top:4px;left:8px;border:none;background:none;font-size:16px;color:#9c917b;cursor:pointer;padding:2px 4px;}" +
    "#ghChatPanel{position:fixed;left:16px;bottom:88px;z-index:9999;width:330px;max-width:calc(100vw - 32px);" +
    "height:440px;max-height:calc(100vh - 110px);background:#171410;border:1px solid rgba(198,163,79,.35);border-radius:14px;" +
    "box-shadow:0 8px 30px rgba(0,0,0,.6);display:none;flex-direction:column;overflow:hidden;" +
    "font-family:Amiri,'Noto Naskh Arabic',serif;direction:rtl;}" +
    "#ghChatHead{background:#0f0d09;color:#c6a34f;padding:12px 14px;font-weight:700;font-family:'Reem Kufi',Amiri,sans-serif;" +
    "border-bottom:1px solid rgba(198,163,79,.35);}" +
    "#ghChatMsgs{flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:8px;}" +
    ".ghMsg{max-width:85%;padding:8px 12px;border-radius:12px;line-height:1.9;font-size:15px;white-space:pre-wrap;}" +
    ".ghMsg.user{align-self:flex-start;background:#c6a34f;color:#171206;}" +
    ".ghMsg.bot{align-self:flex-end;background:#0f0d09;color:#ece4d2;border:1px solid rgba(198,163,79,.22);}" +
    "#ghChatForm{display:flex;gap:6px;padding:10px;border-top:1px solid rgba(198,163,79,.22);}" +
    "#ghChatInput{flex:1;border:1px solid rgba(198,163,79,.35);background:#0f0d09;color:#ece4d2;border-radius:20px;" +
    "padding:8px 14px;font-family:Cairo,'Segoe UI',sans-serif;font-size:14px;}" +
    "#ghChatInput::placeholder{color:#9c917b;}" +
    "#ghChatInput:focus{outline:none;border-color:#c6a34f;}" +
    "#ghChatSend{border:none;background:#c6a34f;color:#171206;border-radius:20px;padding:8px 16px;cursor:pointer;" +
    "font-family:Cairo,'Segoe UI',sans-serif;font-weight:700;}" +
    "#ghChatSend:disabled{opacity:.5;cursor:default;}";
  document.head.appendChild(css);

  var btn = document.createElement("button");
  btn.id = "ghChatBtn";
  btn.title = "فصيح - مساعد الغرباوي";
  btn.setAttribute("aria-label", "فصيح مساعد الغرباوي - افتح المحادثة");
  btn.innerHTML =
    '<svg viewBox="0 0 64 64" width="46" height="46" aria-hidden="true">' +
    '<line x1="32" y1="6" x2="32" y2="14" stroke="#c6a34f" stroke-width="3" stroke-linecap="round"/>' +
    '<circle class="ghTip" cx="32" cy="6" r="3.4" fill="#e9c766"/>' +
    '<rect x="14" y="14" width="36" height="26" rx="9" fill="#1e1e1e" stroke="#c6a34f" stroke-width="2.4"/>' +
    '<rect x="20" y="21" width="24" height="13" rx="6" fill="#0a0a0a"/>' +
    '<circle class="ghEye" cx="27" cy="27.5" r="3" fill="#e9c766"/>' +
    '<circle class="ghEye" cx="37" cy="27.5" r="3" fill="#e9c766"/>' +
    '<path d="M27 35 q5 4 10 0" stroke="#c6a34f" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
    '<rect x="20" y="42" width="24" height="15" rx="7" fill="#1e1e1e" stroke="#c6a34f" stroke-width="2.4"/>' +
    '<circle cx="32" cy="49.5" r="3" fill="#e9c766" class="ghTip"/>' +
    '<rect x="10" y="43" width="7" height="11" rx="3.5" fill="#1e1e1e" stroke="#c6a34f" stroke-width="2"/>' +
    '<rect class="ghArm" x="47" y="43" width="7" height="11" rx="3.5" fill="#1e1e1e" stroke="#c6a34f" stroke-width="2"/>' +
    '</svg>';

  var panel = document.createElement("div");
  panel.id = "ghChatPanel";
  panel.innerHTML =
    '<div id="ghChatHead">فصيح 🤖 مساعد الغرباوي</div>' +
    '<div id="ghChatMsgs"></div>' +
    '<form id="ghChatForm"><input id="ghChatInput" placeholder="اكتب سؤالك هنا…" autocomplete="off">' +
    '<button id="ghChatSend" type="submit">أرسل</button></form>';

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  var msgs = panel.querySelector("#ghChatMsgs");
  var form = panel.querySelector("#ghChatForm");
  var input = panel.querySelector("#ghChatInput");
  var sendBtn = panel.querySelector("#ghChatSend");
  var greeted = false;

  function addMsg(text, who) {
    var d = document.createElement("div");
    d.className = "ghMsg " + who;
    d.textContent = text.replace(/\*\*/g, "").replace(/^#+\s*/gm, "");
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  var hi = document.createElement("div");
  hi.id = "ghChatHi";
  hi.innerHTML = '<button id="ghChatHiX" title="إخفاء">✕</button>أهلًا 👋 أنا <b>فصيح</b>، روبوت مساعد الغرباوي! اسألني عن الأقسام أو الدروس أو الاختبارات.';
  document.body.appendChild(hi);
  function hideHi() { hi.style.display = "none"; try { sessionStorage.setItem("ghRobotHi", "1"); } catch (e) {} }
  hi.querySelector("#ghChatHiX").addEventListener("click", hideHi);
  var hiShown = false;
  try { hiShown = !!sessionStorage.getItem("ghRobotHi"); } catch (e) {}
  if (!hiShown) {
    setTimeout(function () {
      if (panel.style.display !== "flex") { hi.style.display = "block"; }
    }, 2500);
    setTimeout(hideHi, 14000);
  }

  btn.addEventListener("click", function () {
    hideHi();
    var open = panel.style.display === "flex";
    panel.style.display = open ? "none" : "flex";
    if (!open && !greeted) {
      greeted = true;
      addMsg("أهلًا بك في مؤسسة الغرباوي! 🌿 أنا فصيح، مساعدك هنا. اسألني عن أقسام الموقع أو الدروس أو الاختبارات، وسأرشدك إلى ما تبحث عنه.", "bot");
      initAI().catch(function () {});
      input.focus();
    }
  });

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    if (remaining() <= 0) {
      addMsg("ما شاء الله، ثلاثون رسالةً في جلسةٍ واحدة! 🌿 لقد بلغتَ حدَّ هذه الجلسة. تصفَّح أقسامَ الموقع ودروسَه واختباراتِه من القائمة، ثم عُد إليّ في جلسةٍ جديدةٍ متى شئتَ، وسأكون في انتظارك.", "bot");
      return;
    }
    input.value = "";
    addMsg(text, "user");
    bump();
    sendBtn.disabled = true;
    var thinking = document.createElement("div");
    thinking.className = "ghMsg bot";
    thinking.textContent = "…";
    msgs.appendChild(thinking);
    msgs.scrollTop = msgs.scrollHeight;

    initAI()
      .then(function (chat) { return chat.sendMessage(text); })
      .then(function (res) {
        thinking.textContent = res.response.text().replace(/\*\*/g, "").replace(/^#+\s*/gm, "");
      })
      .catch(function () {
        thinking.textContent = "عذرًا، أنا مشغول الآن. أعِد المحاولة بعد قليل 🌿 ويمكنك تصفُّح أقسام الموقع من القائمة.";
      })
      .then(function () {
        sendBtn.disabled = false;
        msgs.scrollTop = msgs.scrollHeight;
      });
  });
})();
