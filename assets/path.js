/* مسار المعلم: يحمّل المسار من Firestore ويسلّمه لمحرّك اللعبة (path-engine.js) */
(function () {
  function $(id) { return document.getElementById(id); }
  function arNum(n) { return String(n).replace(/\d/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[d]; }); }

  var id = new URLSearchParams(location.search).get("id");
  if (!id) { PathEngine.gate("رابط غير صحيح.", false); return; }

  function db() { return firebase.firestore(); }
  function progRef(uid) { return db().collection("pathProgress").doc(uid + "_" + id); }
  function cleanProg(prog, uid) {
    var full = Object.assign({ step: 0, wrong: 0, xp: 0, streak: 0, done: false }, prog);
    full.uid = uid; full.pathId = id;
    full.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    var clean = {};
    ["uid", "pathId", "step", "totalSteps", "wrong", "done", "xp", "streak", "lastDay", "updatedAt"].forEach(function (k) { if (full[k] !== undefined) clean[k] = full[k]; });
    return clean;
  }

  /* قراءة التقدم عبر REST: أسرع بكثير من قناة SDK عند أول تحميل */
  function restGetProg(user, docId, cb) {
    user.getIdToken().then(function (tok) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "https://firestore.googleapis.com/v1/projects/" + (window.FIREBASE_CONFIG || {}).projectId + "/databases/(default)/documents/pathProgress/" + docId);
      xhr.setRequestHeader("Authorization", "Bearer " + tok);
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        if (xhr.status !== 200) { cb(null); return; }
        try {
          var f = JSON.parse(xhr.responseText).fields || {};
          function num(k) { return f[k] && f[k].integerValue ? +f[k].integerValue : 0; }
          cb({ step: num("step"), wrong: num("wrong"), xp: num("xp"), streak: num("streak"),
               done: !!(f.done && f.done.booleanValue), lastDay: f.lastDay ? f.lastDay.stringValue : undefined });
        } catch (e) { cb(null); }
      };
      xhr.send(null);
    }, function () { cb(null); });
  }

  function dayStr(d) { return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }

  Store.init().then(function () {
    if (!Store.isReady()) { PathEngine.gate("خدمة الحسابات غير متاحة حاليًا.", false); return; }
    Store.onAuth(function (user) {
      if (!user) { PathEngine.gate("سجّل دخولك لتبدأ مسار التعلّم ويُحفَظ تقدمك.", true); return; }
      Teach.get("paths", id).then(function (d) {
        if (!d || !(d.published || d.teacherId === user.uid)) { PathEngine.gate("هذا المسار غير متاح.", false); return; }
        if (d.teacherId === user.uid && !d.published) { PathEngine.gate("هذا المسار مسودة غير منشورة بعد.", false); return; }
        var steps = (d.steps || []).filter(function (s) { return s && (s.verse || s.image); });
        if (!steps.length) { PathEngine.gate("لا خطوات في هذا المسار بعد.", false); return; }
        var totalSteps = steps.length;
        var fresh = { step: 0, wrong: 0, xp: 0, streak: 0, done: false };
        /* قراءة أولى سريعة عبر REST؛ مستند غير موجود أو أي خطأ = تقدم جديد */
        restGetProg(user, user.uid + "_" + id, function (doc) { mountWith(doc || fresh); });
        function mountWith(prog) {
          /* سلسلة الأيام */
          var today = dayStr(new Date());
          if (prog.lastDay !== today) {
            var y = dayStr(new Date(Date.now() - 864e5));
            prog.streak = prog.lastDay === y ? (prog.streak || 0) + 1 : 1;
            prog.lastDay = today;
          }
          PathEngine.mount({
            steps: steps,
            title: d.title,
            description: d.description || "",
            info: arNum(steps.length) + " " + (d.stepMany || "بيتًا") + " · المعلم: " + (d.teacherName || ""),
            stepOne: d.stepOne,
            stepMany: d.stepMany,
            initialProg: prog,
            saveProg: function (full) {
              full.totalSteps = totalSteps;
              return progRef(user.uid).set(cleanProg(full, user.uid));
            },
            onFinish: function (p) {
              Teach.saveResult({
                kind: "path", refId: id, teacherId: d.teacherId,
                studentUid: user.uid, studentEmail: user.email || "",
                title: d.title, score: steps.length, total: steps.length,
                durationSec: Math.round((Date.now() - t0start) / 1000)
              }).catch(function () {});
            },
            doneSub: function (p, st) { return "أتممتَ " + arNum(st.length) + " " + (d.stepMany || "بيتًا") + ". سُجّلت نتيجتك عند معلمك."; },
            doneHref: "student.html",
            doneLabel: "عودة إلى واجباتي",
            exitHref: "student.html"
          });
        }
      }).catch(function () { PathEngine.gate("تعذّر تحميل المسار.", false); });
    });
  });
  var t0start = Date.now();
})();
