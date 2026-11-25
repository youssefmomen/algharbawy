/* صفحة الملف الشخصي: الإعداد الأول، العرض، والتعديل */
(function () {
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function arNum(n) { return String(n).replace(/\d/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[d]; }); }
  function fmtDate(t) {
    if (!t || !t.toDate) return "—";
    return t.toDate().toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
  }

  var user = null, profile = null, editMode = false;
  var selAvatarId = null, selAvatarData = null, selRole = "student";

  function gate(msg, withLink) {
    var g = $("p-gate");
    g.hidden = false;
    g.innerHTML = esc(msg) + (withLink ? ' <a href="auth.html?next=profile.html">سجّل الدخول أولًا</a>' : "");
  }

  function avatarSrc(p) {
    if (p && p.avatarData) return p.avatarData;
    if (p && p.avatarId && window.Avatars) return Avatars.url(p.avatarId);
    return "";
  }

  /* ---------- الإعداد / التعديل ---------- */
  function renderSetup() {
    $("p-view").hidden = true;
    $("p-setup").hidden = false;
    var first = !profile || !profile.role;
    $("p-setup-title").textContent = first ? "أكمل ملفك" : "تعديل الملف";
    $("p-setup-sub").textContent = first
      ? "مرة واحدة فقط: اسمك ونوع حسابك وصورتك الرمزية."
      : "غيّر اسمك أو صورتك الرمزية.";
    $("p-role-row").style.display = first ? "" : "none";
    $("p-cancel").hidden = first;
    $("p-name").value = (profile && profile.name) || "";

    /* الدور: من الجلسة (قدوم من صفحة الدخول) ثم من الملف */
    var pending = "";
    try { pending = sessionStorage.getItem("gh_role") || ""; } catch (e) {}
    selRole = (profile && profile.role) || (pending === "teacher" ? "teacher" : "student");
    Array.prototype.forEach.call(document.querySelectorAll(".pf-role"), function (b) {
      b.classList.toggle("on", b.getAttribute("data-role") === selRole);
      b.onclick = function () {
        selRole = b.getAttribute("data-role");
        Array.prototype.forEach.call(document.querySelectorAll(".pf-role"), function (x) {
          x.classList.toggle("on", x === b);
        });
      };
    });

    /* الصور الجاهزة */
    selAvatarId = (profile && profile.avatarId) || null;
    selAvatarData = (profile && profile.avatarData) || null;
    var grid = $("p-avas");
    grid.innerHTML = Avatars.PRESETS.map(function (p) {
      return '<button type="button" class="pf-ava' + (selAvatarId === p.id && !selAvatarData ? " on" : "") + '" data-ava="' + p.id + '">' +
        '<img src="' + Avatars.url(p.id) + '" alt=""></button>';
    }).join("");
    Array.prototype.forEach.call(grid.querySelectorAll(".pf-ava"), function (b) {
      b.onclick = function () {
        selAvatarId = b.getAttribute("data-ava");
        selAvatarData = null;
        $("p-up-preview").hidden = true;
        $("p-up-err").textContent = "";
        Array.prototype.forEach.call(grid.querySelectorAll(".pf-ava"), function (x) {
          x.classList.toggle("on", x === b);
        });
      };
    });
    if (selAvatarData) {
      var pv = $("p-up-preview");
      pv.src = selAvatarData; pv.hidden = false;
    } else {
      $("p-up-preview").hidden = true;
    }
  }

  /* رفع صورة: تصغيرها في المتصفح إلى 128×128 ثم حفظها كنص داخل الحساب (بلا أي خدمة مدفوعة) */
  function handleUpload(file) {
    $("p-up-err").textContent = "";
    if (!file || !/^image\//.test(file.type)) { $("p-up-err").textContent = "اختر ملف صورة."; return; }
    var rd = new FileReader();
    rd.onload = function () {
      var img = new Image();
      img.onload = function () {
        var S = 128, c = document.createElement("canvas");
        c.width = S; c.height = S;
        var ctx = c.getContext("2d");
        var sc = Math.max(S / img.width, S / img.height);
        var w = img.width * sc, h = img.height * sc;
        ctx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
        var q = 0.82, out = c.toDataURL("image/jpeg", q);
        while (out.length > 110000 && q > 0.3) { q -= 0.15; out = c.toDataURL("image/jpeg", q); }
        if (out.length > 110000) { $("p-up-err").textContent = "الصورة كبيرة جدًا، جرّب صورة أبسط."; return; }
        selAvatarData = out; selAvatarId = null;
        var pv = $("p-up-preview");
        pv.src = out; pv.hidden = false;
        Array.prototype.forEach.call($("p-avas").querySelectorAll(".pf-ava"), function (x) { x.classList.remove("on"); });
      };
      img.onerror = function () { $("p-up-err").textContent = "تعذّر قراءة الصورة، جرّب صورة أخرى."; };
      img.src = rd.result;
    };
    rd.readAsDataURL(file);
  }

  function save() {
    var name = $("p-name").value.trim();
    $("p-err").textContent = ""; $("p-ok").textContent = "";
    if (!name) { $("p-err").textContent = "اكتب اسمك."; return; }
    if (!selAvatarId && !selAvatarData) { $("p-err").textContent = "اختر صورة رمزية أو ارفع صورتك."; return; }
    var first = !profile || !profile.role;
    var patch = { name: name, avatarId: selAvatarId || "", avatarData: selAvatarData || "" };
    if (first) patch.role = selRole;
    $("p-save").disabled = true;
    Store.saveProfile(user.uid, patch).then(function () {
      try {
        sessionStorage.removeItem("gh_role");
        /* حدّث كاش الشريحة فورًا بالملف الكامل بدل حذفه */
        sessionStorage.setItem("gh_prof_" + user.uid, JSON.stringify(Object.assign({}, profile, patch)));
      } catch (e) {}
      if (first && selRole === "teacher") {
        /* طريق المعلم القائم: تسجيل الطلب ثم صفحة المعلم تعرض «قيد المراجعة» */
        return Teach.register(user, name).then(function () { location.href = "teacher.html"; });
      }
      profile = Object.assign({}, profile, patch);
      renderView();
    }).catch(function () {
      $("p-err").textContent = "تعذّر الحفظ، تحقق من اتصالك وحاول مجددًا.";
    }).then(function () {
      $("p-save").disabled = false;
    });
  }

  /* ---------- العرض ---------- */
  function renderView() {
    $("p-setup").hidden = true;
    $("p-view").hidden = false;
    var src = avatarSrc(profile);
    $("p-avatar").src = src || Avatars.url("a1");
    $("p-vname").textContent = profile.name || user.email || "";
    $("p-vrole").textContent = profile.role === "teacher" ? "معلم" : "طالب";
    $("p-vemail").textContent = user.email || "";

    var db = firebase.firestore();
    var progP = db.collection("progress").doc(user.uid).get().then(function (d) { return d.exists ? d.data() : {}; }).catch(function () { return {}; });
    var ppP = db.collection("pathProgress").where("uid", "==", user.uid).get()
      .then(function (s) { return s.docs.map(function (d) { return d.data(); }); }).catch(function () { return [] });
    var rsP = Teach.myResults(user.uid).catch(function () { return []; });

    /* الإحصاءات */
    Promise.all([progP, ppP]).then(function (v) {
      var pr = v[0], pps = v[1];
      var xp = pr.xp || 0, streak = 0;
      pps.forEach(function (p) { xp += p.xp || 0; if ((p.streak || 0) > streak) streak = p.streak; });
      var stars = 0;
      if (pr.stars) Object.keys(pr.stars).forEach(function (k) { stars += pr.stars[k] || 0; });
      $("ps-xp").textContent = arNum(xp);
      $("ps-streak").textContent = arNum(streak);
      $("ps-lessons").textContent = arNum((pr.completed || []).length);
      $("ps-stars").textContent = arNum(stars);
    });

    /* مساراتي مع عناوينها */
    ppP.then(function (pps) {
      if (!pps.length) { $("p-paths-empty").hidden = false; return; }
      Promise.all(pps.map(function (p) {
        return Teach.get("paths", p.pathId).then(function (d) { return { p: p, d: d }; }).catch(function () { return { p: p, d: null }; });
      })).then(function (rows) {
        $("p-paths").innerHTML = rows.map(function (r) {
          var p = r.p, total = p.totalSteps || 0, step = Math.min(p.step || 0, total);
          var pct = total ? Math.round(100 * step / total) : 0;
          var title = r.d ? r.d.title : "مسار تعلّم";
          return '<a class="t-item t-item-link" href="path.html?id=' + encodeURIComponent(p.pathId) + '">' +
            '<div class="t-item-main"><b>' + esc(title) + '</b>' +
            '<span class="t-meta">' + (p.done ? "مكتمل ✓" : "البيت " + arNum(step) + " من " + arNum(total)) + ' · ' + arNum(p.xp || 0) + " نقطة" + (p.streak ? " · سلسلة " + arNum(p.streak) + " يوم" : "") + '</span>' +
            '<span class="pf-bar"><i style="width:' + pct + '%"></i></span></div><span class="go">←</span></a>';
        }).join("");
      });
    });

    /* واجباتي: نفس منطق صفحة الطالب */
    var myEmail = (user.email || "").toLowerCase();
    Promise.all([Teach.listPublished("exams"), Teach.listPublished("games"), Teach.listPublished("paths"), rsP]).then(function (v) {
      var best = {};
      v[3].forEach(function (r) { if (!best[r.refId] || r.score > best[r.refId].score) best[r.refId] = r; });
      var hw = v[0].map(function (d) { return { kind: "exams", d: d }; })
        .concat(v[1].map(function (d) { return { kind: "games", d: d }; }))
        .concat(v[2].map(function (d) { return { kind: "paths", d: d }; }))
        .filter(function (x) {
          if (!x.d.isHomework) return false;
          var asg = x.d.assignedToEmails;
          if (!asg || !asg.length) return true;
          return asg.some(function (e) { return String(e).toLowerCase() === myEmail; });
        });
      hw.sort(function (a, b) { return ((b.d.createdAt && b.d.createdAt.seconds) || 0) - ((a.d.createdAt && a.d.createdAt.seconds) || 0); });
      $("p-hw-empty").hidden = hw.length > 0;
      $("p-hw").innerHTML = hw.map(function (x) {
        var href = (x.kind === "exams" ? "exam.html?id=" : (x.kind === "games" ? "game.html?id=" : "path.html?id=")) + encodeURIComponent(x.d.id);
        var res = best[x.d.id];
        var st = res ? '<span class="t-meta hw-done">تم الحل ✓ · ' + arNum(res.score) + " / " + arNum(res.total) + "</span>"
          : '<span class="t-meta hw-open">لم يُحل بعد</span>';
        return '<a class="t-item t-item-link" href="' + href + '"><div class="t-item-main"><b>' + esc(x.d.title) + '</b>' + st + '</div><span class="go">←</span></a>';
      }).join("");
    });

    /* بطاقة المعلم */
    Teach.status(user).then(function (st) {
      if (!st) return;
      $("p-teacher-card").hidden = false;
      if (st.status === "approved") $("p-teacher-status").textContent = "معلم معتمد — يمكنك إنشاء الاختبارات والواجبات.";
      else { $("p-teacher-status").textContent = "طلبك قيد مراجعة الإدارة."; $("p-teacher-link").textContent = "متابعة الطلب"; }
    });
  }

  /* ---------- الإقلاع ---------- */
  Store.init().then(function () {
    if (!Store.isReady()) { gate("خدمة الحسابات غير متاحة حاليًا.", false); return; }
    Store.onAuth(function (u) {
      if (!u) { gate("سجّل دخولك لترى ملفك الشخصي.", true); return; }
      user = u;
      Store.getProfile(u.uid).then(function (p) {
        profile = p || {};
        if (!profile.role || !profile.name) renderSetup();
        else renderView();
      });
    });
    $("p-save").addEventListener("click", save);
    $("p-edit").addEventListener("click", renderSetup);
    $("p-cancel").addEventListener("click", renderView);
    $("p-up-btn").addEventListener("click", function () { $("p-up-file").click(); });
    $("p-up-file").addEventListener("change", function (e) { handleUpload(e.target.files[0]); });
  });
})();
