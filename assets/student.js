/* صفحة الطالب: الاختبارات والألعاب المنشورة ونتائجه */
(function () {
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function arNum(n) { return String(n).replace(/\d/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[d]; }); }
  function fmtDate(t) {
    if (!t || !t.toDate) return "—";
    return t.toDate().toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
  }
  function gate(msg, withLink) {
    var g = $("s-gate");
    g.hidden = false;
    g.innerHTML = esc(msg) + (withLink ? ' <a href="auth.html?next=student.html">سجّل الدخول أولًا</a>' : "");
  }

  Store.init().then(function () {
    if (!Store.isReady()) { gate("خدمة الحسابات غير متاحة حاليًا.", false); return; }
    Store.onAuth(function (u) {
      if (!u) { gate("سجّل دخولك لتشاهد الاختبارات والألعاب وتحفظ نتائجك.", true); return; }
      $("s-gate").hidden = true; $("s-body").hidden = false;
      load(u);
    });
  });

  function card(kind, d) {
    var href = (kind === "exams" ? "exam.html?id=" : "game.html?id=") + encodeURIComponent(d.id);
    var type = kind === "exams" ? "اختبار" : (d.gameType === "quiz" ? "تحدي السرعة" : "لعبة سباق");
    return '<a class="t-item t-item-link" href="' + href + '">' +
      '<div class="t-item-main"><b>' + esc(d.title) + '</b>' +
      '<span class="t-meta">' + type + ' · ' + arNum((d.questions || []).length) + ' سؤال · ' + esc(d.teacherName || "") + '</span>' +
      (d.description ? '<span class="t-meta">' + esc(d.description) + '</span>' : "") +
      '</div><span class="go">←</span></a>';
  }
  function hwCard(kind, d, res, prog) {
    var href = (kind === "exams" ? "exam.html?id=" : (kind === "games" ? "game.html?id=" : "path.html?id=")) + encodeURIComponent(d.id);
    var type = kind === "exams" ? "اختبار" : (kind === "paths" ? "مسار تعلّم" : (d.gameType === "quiz" ? "تحدي السرعة" : "لعبة سباق"));
    var count = kind === "paths" ? arNum((d.steps || []).length) + " بيت" : arNum((d.questions || []).length) + " سؤال";
    var status;
    if (res) status = '<span class="t-meta hw-done">تم الحل ✓ · ' + arNum(res.score) + " / " + arNum(res.total) + "</span>";
    else if (kind === "paths" && prog && prog.step > 0) status = '<span class="t-meta hw-open">وصلت إلى البيت ' + arNum(prog.step + 1) + " من " + arNum((d.steps || []).length) + "</span>";
    else status = '<span class="t-meta hw-open">لم يُحل بعد</span>';
    return '<a class="t-item t-item-link" href="' + href + '">' +
      '<div class="t-item-main"><b>' + esc(d.title) + '</b>' +
      '<span class="t-meta">' + type + ' · ' + count + ' · ' + esc(d.teacherName || "") + '</span>' +
      status + '</div><span class="go">←</span></a>';
  }
  function myProgress(uid) {
    return firebase.firestore().collection("pathProgress").where("uid", "==", uid).get()
      .then(function (s) { var m = {}; s.forEach(function (d) { var v = d.data(); m[v.pathId] = v; }); return m; })
      .catch(function () { return {}; });
  }
  function load(u) {
    var exP = Teach.listPublished("exams");
    var gmP = Teach.listPublished("games");
    var paP = Teach.listPublished("paths");
    var ppP = myProgress(u.uid);
    var rsP = Teach.myResults(u.uid);
    exP.then(function (a) {
      $("s-exams").innerHTML = a.map(function (d) { return card("exams", d); }).join("");
      $("s-exams-empty").hidden = a.length > 0;
    });
    gmP.then(function (a) {
      $("s-games").innerHTML = a.map(function (d) { return card("games", d); }).join("");
      $("s-games-empty").hidden = a.length > 0;
    });
    rsP.then(function (rows) {
      $("s-rows").innerHTML = rows.map(function (r) {
        return "<tr><td>" + esc(r.title || "—") + "</td><td>" + arNum(r.score) + " / " + arNum(r.total) + "</td><td>" + esc(fmtDate(r.finishedAt)) + "</td></tr>";
      }).join("");
      $("s-empty").hidden = rows.length > 0;
    });
    /* مسارات التعلّم المنشورة، مع التقدم */
    Promise.all([paP, ppP, rsP]).then(function (v) {
      var best = {};
      v[2].forEach(function (r) { if (!best[r.refId] || r.score > best[r.refId].score) best[r.refId] = r; });
      $("s-paths").innerHTML = v[0].map(function (d) { return hwCard("paths", d, best[d.id], v[1][d.id]); }).join("");
      $("s-paths-empty").hidden = v[0].length > 0;
    });
    /* واجباتي: المنشور والمعلَّم كواجب، مع حالة الحل */
    Promise.all([exP, gmP, paP, ppP, rsP]).then(function (v) {
      var best = {};
      v[4].forEach(function (r) { if (!best[r.refId] || r.score > best[r.refId].score) best[r.refId] = r; });
      var hw = v[0].map(function (d) { return { kind: "exams", d: d }; })
        .concat(v[1].map(function (d) { return { kind: "games", d: d }; }))
        .concat(v[2].map(function (d) { return { kind: "paths", d: d }; }))
        .filter(function (x) { return x.d.isHomework; });
      hw.sort(function (a, b) { return ((b.d.createdAt && b.d.createdAt.seconds) || 0) - ((a.d.createdAt && a.d.createdAt.seconds) || 0); });
      $("s-hw").innerHTML = hw.map(function (x) { return hwCard(x.kind, x.d, best[x.d.id], v[3][x.d.id]); }).join("");
      $("s-hw-empty").hidden = hw.length > 0;
    });
  }
})();
