/* الدورة كلعبة: يحوّل صفحة الدورة إلى مسار دوولينجو داخل الصفحة نفسها.
   يعمل حاليًا على: nahw?course=wahi (وحي المنام) و adab?course=alhamasa (الحماسة).
   القائمة التقليدية تبقى متاحة عبر ?mode=list. */
(function () {
  var q = new URLSearchParams(location.search);
  var cid = q.get("course");
  var CFG = {
    "wahi": { stepOne: "البيت", stepMany: "بيتًا" },
    "alhamasa": { stepOne: "الدرس", stepMany: "درسًا" }
  };
  var cfg = cid && CFG[cid];
  var lessonsEl = document.getElementById("lessons");
  if (!cfg || !lessonsEl) return;

  var secId = q.get("id") || "";
  var listHref = "section.html?id=" + encodeURIComponent(secId) + "&course=" + encodeURIComponent(cid) + "&mode=list";
  var gameHref = "section.html?id=" + encodeURIComponent(secId) + "&course=" + encodeURIComponent(cid);

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function arNum(n) { return String(n).replace(/\d/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[d]; }); }
  function dayStr(d) { return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function cgGate(html) {
    var g = document.getElementById("p-gate");
    g.hidden = false;
    g.innerHTML = html;
  }

  /* وضع القائمة التقليدية: لافتة للعودة إلى اللعبة */
  if (q.get("mode") === "list") {
    var b = document.createElement("div");
    b.className = "cg-banner";
    b.innerHTML = 'أنتَ تتصفّح قائمة الدروس التقليدية. <a href="' + gameHref + '">جرّب وضع اللعبة: خطوة بخطوة مع نقاط وقلوب وحفظٍ للتقدّم</a>.';
    lessonsEl.parentNode.insertBefore(b, lessonsEl);
    return;
  }

  var wrap = document.getElementById("cg-wrap");
  if (!wrap || !window.PathEngine) return;

  /* تبديل إلى القائمة التقليدية */
  var tog = document.createElement("div");
  tog.className = "cg-toggle";
  tog.innerHTML = '<a href="' + listHref + '">عرض قائمة الدروس التقليدية</a>';
  wrap.parentNode.insertBefore(tog, wrap);

  /* إخفاء قائمة الدروس وسطر التقدم القديم */
  lessonsEl.style.display = "none";
  var meta = document.querySelector(".course-meta");
  if (meta) meta.style.display = "none";
  wrap.hidden = false;

  if (!window.StoreLoader) { cgGate("خدمة الحسابات غير متاحة حاليًا."); return; }
  StoreLoader.load().then(function (ok) {
    if (!ok || !window.Store) { cgGate("خدمة الحسابات غير متاحة حاليًا."); return; }
    Store.init().then(function () {
      if (!Store.isReady()) { cgGate("خدمة الحسابات غير متاحة حاليًا."); return; }
      Store.onAuth(function (user) {
        if (!user) {
          cgGate('سجّل دخولك لتلعب هذه الدورة خطوة بخطوة ويُحفَظ تقدّمك ونقاطك. <a href="auth.html?next=' +
            encodeURIComponent("section.html" + location.search) + '">سجّل الدخول</a> · <a href="' + listHref + '">تصفّح قائمة الدروس دون حساب</a>');
          return;
        }
        start(user);
      });
    });
  });

  function loadCourse(cb) {
    if (window.SITE_COURSES && SITE_COURSES[cid] && SITE_COURSES[cid].lessons) return cb(SITE_COURSES[cid]);
    var s = document.createElement("script");
    s.src = "assets/data/" + ((window.DATA_FILES && DATA_FILES[cid]) || cid + ".js") + "?v=" + (window.DATA_V || "1");
    s.onload = function () { cb(window.SITE_COURSES && SITE_COURSES[cid]); };
    s.onerror = function () { cb(null); };
    document.head.appendChild(s);
  }

  /* درس ← خطوة لعبة */
  function toSteps(lessons) {
    return lessons.map(function (l) {
      var st = { title: l.title, questions: [], noMem: true };
      if (l.verse && l.verse.text) { st.verse = l.verse.text; st.noMem = false; }
      (l.segments || []).forEach(function (sg) {
        if (sg.images && sg.images.length && !st.image) st.image = sg.images[0].src;
        if (sg.body && sg.body.length) st.note = (st.note ? st.note + "\n\n" : "") + sg.body.join("\n");
        if (sg.examples && sg.examples.length) st.note = (st.note ? st.note + "\n" : "") + "أمثلة: " + sg.examples.join(" — ");
        if (sg.vocab && sg.vocab.length && !st.vocab) st.vocab = sg.vocab;
        if (sg.questions) st.questions = st.questions.concat(sg.questions);
      });
      return st;
    }).filter(function (s) { return s.verse || s.image || s.note; });
  }

  function start(user) {
    loadCourse(function (course) {
      if (!course || !course.lessons || !course.lessons.length) { cgGate("تعذّر تحميل بيانات الدورة."); return; }
      var steps = toSteps(course.lessons);
      if (!steps.length) { cgGate("لا خطوات في هذه الدورة بعد."); return; }
      var db = firebase.firestore();
      var pid = "course_" + cid; /* يبقى doc id = uid + "_" + pathId */
      var ref = db.collection("pathProgress").doc(user.uid + "_" + pid);
      var fresh = { step: 0, wrong: 0, xp: 0, streak: 0, done: false };
      /* القواعد تمنع قراءة مستند غير موجود — عند الرفض نبدأ بتقدم جديد */
      ref.get().then(function (doc) { mountWith(doc.exists ? doc.data() : fresh); }, function () { mountWith(fresh); });
      function mountWith(prog) {
        var today = dayStr(new Date());
        if (prog.lastDay !== today) {
          var y = dayStr(new Date(Date.now() - 864e5));
          prog.streak = prog.lastDay === y ? (prog.streak || 0) + 1 : 1;
          prog.lastDay = today;
        }
        PathEngine.mount({
          steps: steps,
          title: (document.getElementById("page-title").textContent || "").trim(),
          description: "",
          info: arNum(steps.length) + " " + cfg.stepMany,
          stepOne: cfg.stepOne,
          stepMany: cfg.stepMany,
          tallMap: true,
          initialProg: prog,
          saveProg: function (full) {
            var f = Object.assign({}, full, { uid: user.uid, pathId: pid, totalSteps: steps.length, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            var clean = {};
            ["uid", "pathId", "step", "totalSteps", "wrong", "done", "xp", "streak", "lastDay", "updatedAt"].forEach(function (k) { if (f[k] !== undefined) clean[k] = f[k]; });
            return ref.set(clean);
          },
          doneSub: function (p, st) { return "أتممتَ " + arNum(st.length) + " " + cfg.stepMany + " من هذه الدورة."; },
          doneHref: "section.html?id=" + encodeURIComponent(secId),
          doneLabel: "عودة إلى دورات القسم",
          exitHref: "section.html?id=" + encodeURIComponent(secId)
        });
      }
    });
  }
})();
