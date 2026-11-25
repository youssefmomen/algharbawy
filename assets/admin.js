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

  var currentUser = null;
  Store.init().then(function () {
    Store.onAuth(function (user) {
      currentUser = user;
      if (!user) { gate("هذه الصفحة خاصة بإدارة الموقع.", true); return; }
      Store.isAdmin(user).then(function (ok) {
        if (!ok) { gate("غير مصرح لك بعرض هذه الصفحة.", false); return; }
        gate("جارٍ التحميل…", false);
        loadDash();
        loadTeachers();
        loadTicker();
      });
    });
  });

  function gateSetupHint() {
    var email = (currentUser && currentUser.email) || "";
    gate("", false);
    var g = document.getElementById("adm-gate");
    g.innerHTML =
      '<div style="text-align:right;line-height:2">' +
      "<b>صلاحية المدير غير مفعّلة بعد في قاعدة البيانات.</b><br>" +
      'بريدك المسجّل دخولك: <b dir="ltr">' + esc(email) + "</b><br>" +
      "راجع خطوة «صلاحية المدير»: في Firestore Database ← تبويب «البيانات» تأكد أن لديك بالضبط:<br>" +
      '• مجموعة (Collection) اسمها <b dir="ltr">config</b> بحروف صغيرة<br>' +
      '• مستند (Document) اسمه <b dir="ltr">admin</b> بحروف صغيرة<br>' +
      '• حقل (Field) اسمه <b dir="ltr">email</b> نوعه string وقيمته بريدك أعلاه بحروف صغيرة بدون مسافات<br>' +
      "بعد التصحيح أعد تحميل الصفحة." +
      "</div>";
  }


  /* شريط الإعلانات: تحميل وحفظ (صلاحية المدير) */
  function loadTicker() {
    firebase.firestore().collection("announcements").doc("main").get()
      .then(function (d) {
        var v = d.exists ? d.data() : {};
        $("ticker-text").value = v.text || "";
        $("ticker-active").checked = !!v.active;
      })
      .catch(function () {});
    $("ticker-save").addEventListener("click", function () {
      var msg = $("ticker-msg");
      msg.textContent = "جارٍ الحفظ…";
      firebase.firestore().collection("announcements").doc("main").set({
        text: $("ticker-text").value.trim(),
        active: $("ticker-active").checked,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function () { msg.textContent = "تم الحفظ ✓"; })
        .catch(function (e) { msg.textContent = "تعذر الحفظ: " + (e && e.code ? e.code : "خطأ"); });
    });
  }

  function loadDash() {
    Store.adminListAll().then(function (r) {
      if (!r.users || !r.progress) { gateSetupHint(); return; }
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
  /* موافقات المعلمين */
  function loadTeachers() {
    if (!window.Teach) return;
    Teach.listTeachers().then(function (rows) {
      if (!rows) { if (!document.getElementById("adm-gate").hidden) return; gateSetupHint(); return; }
      var pend = rows.filter(function (t) { return t.status === "pending"; });
      var others = rows.filter(function (t) { return t.status !== "pending"; });
      $("adm-teachers-empty").hidden = pend.length > 0;
      $("adm-teachers").innerHTML = pend.map(function (t) {
        return '<div class="t-item"><div class="t-item-main"><b>' + esc(t.name || t.email || t.id) + '</b>' +
          '<span class="t-meta" dir="ltr">' + esc(t.email || "") + '</span></div>' +
          '<div class="t-item-acts">' +
          '<button type="button" class="btn fill" data-t="' + t.id + '" data-s="approved">قبول</button>' +
          '<button type="button" class="btn ghost t-del" data-t="' + t.id + '" data-s="rejected">رفض</button>' +
          '</div></div>';
      }).join("") + (others.length ? '<div class="t-meta t-sect-sm">المعلمون الحاليون: ' + others.map(function (t) {
        return esc(t.name || t.email || t.id) + " (" + (t.status === "approved" ? "مقبول" : "مرفوض") + ")";
      }).join("، ") + "</div>" : "");
    });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-t]");
    if (!b) return;
    b.disabled = true;
    Teach.setTeacherStatus(b.dataset.t, b.dataset.s).then(loadTeachers).catch(function () {
      b.disabled = false;
      alert("تعذّر حفظ القرار. تحقّق من اتصالك بالإنترنت ثم حاول مرة أخرى.");
    });
  });

  function card(num, label) {
    return '<div class="adm-card rv"><b>' + num + '</b><span>' + esc(label) + '</span></div>';
  }
})();
