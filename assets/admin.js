/* لوحة التحكم — قراءة فقط: إحصائيات + تقدم الطلاب */
(function () {
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function arNum(n) { return String(n).replace(/\d/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[d]; }); }
  function fmtDate(t) {
    if (!t || !t.toDate) return "—";
    var d = t.toDate();
    return d.toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
  }
  function gate(msg, withLink) {
    var g = $("adm-gate");
    g.hidden = false;
    g.innerHTML = esc(msg) + (withLink ? ' <a href="auth.html">سجّل الدخول أولًا</a>' : "");
  }

  Store.init().then(function () {
    Store.onAuth(function (user) {
      if (!user) { gate("هذه الصفحة خاصة بإدارة الموقع.", true); return; }
      if (!Store.isAdmin(user)) { gate("غير مصرح لك بعرض هذه الصفحة.", false); return; }
      gate("جارٍ التحميل…", false);
      loadDash();
    });
  });

  function loadDash() {
    Store.adminListAll().then(function (r) {
      if (!r.users || !r.progress) {
        gate("تعذّر تحميل البيانات. راجع قواعد Firestore أو الاتصال.", false);
        return;
      }
      var progByUid = {};
      r.progress.forEach(function (p) { progByUid[p.uid] = p; });
      var rows = r.users.map(function (u) {
        var p = progByUid[u.uid] || {};
        var stars = 0;
        if (p.stars) Object.keys(p.stars).forEach(function (k) { stars += p.stars[k] || 0; });
        return {
          email: u.email || u.uid,
          done: (p.completed || []).length,
          stars: stars,
          xp: p.xp || 0,
          last: u.lastActive || null
        };
      });
      rows.sort(function (a, b) { return b.done - a.done; });

      var totalDone = rows.reduce(function (s, r2) { return s + r2.done; }, 0);
      var weekAgo = Date.now() - 7 * 864e5;
      var active = rows.filter(function (r2) { return r2.last && r2.last.toDate && r2.last.toDate().getTime() > weekAgo; }).length;
      var avg = rows.length ? Math.round(totalDone / rows.length * 10) / 10 : 0;

      $("adm-cards").innerHTML =
        card(arNum(rows.length), "الطلاب المسجلون") +
        card(arNum(totalDone), "الدروس المكتملة") +
        card(arNum(avg), "متوسط الدروس لكل طالب") +
        card(arNum(active), "نشطون هذا الأسبوع");
      $("adm-rows").innerHTML = rows.map(function (r2) {
        return "<tr><td dir=\"ltr\">" + esc(r2.email) + "</td><td>" + arNum(r2.done) + "</td><td>" + arNum(r2.stars) + "</td><td>" + arNum(r2.xp) + "</td><td>" + esc(fmtDate(r2.last)) + "</td></tr>";
      }).join("");
      $("adm-empty").hidden = rows.length > 0;
      $("adm-gate").hidden = true;
      $("adm-body").hidden = false;
    });
  }
  function card(num, label) {
    return '<div class="adm-card rv"><b>' + num + '</b><span>' + esc(label) + '</span></div>';
  }
})();
