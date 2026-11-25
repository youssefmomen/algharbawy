/* لوحة المعلم: التسجيل، إنشاء الاختبارات والألعاب، ومتابعة النتائج */
(function () {
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function arNum(n) { return String(n).replace(/\d/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[d]; }); }
  function fmtDate(t) {
    if (!t || !t.toDate) return "—";
    return t.toDate().toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
  }
  function gate(msg, withLink) {
    var g = $("t-gate");
    g.hidden = false;
    g.innerHTML = esc(msg) + (withLink ? ' <a href="auth.html?next=teacher.html">سجّل الدخول أولًا</a>' : "");
  }
  function hideAll() { ["t-gate", "t-register", "t-pending", "t-dash"].forEach(function (i) { $(i).hidden = true; }); }

  var user = null, teacher = null, editing = { kind: null, id: null };

  Store.init().then(function () {
    if (!Store.isReady()) { gate("خدمة الحسابات غير متاحة حاليًا.", false); return; }
    Store.onAuth(function (u) {
      user = u;
      if (!u) { hideAll(); gate("هذه الصفحة للمعلمين. سجّل دخولك أولًا.", true); return; }
      Teach.status(u).then(function (t) {
        teacher = t;
        hideAll();
        if (!t) { $("t-register").hidden = false; }
        else if (t.status === "pending") { $("t-pending").hidden = false; }
        else if (t.status !== "approved") { gate("تم رفض طلب انضمامك كمعلم. تواصل مع إدارة الموقع.", false); }
        else { $("t-dash").hidden = false; loadLists(); }
      });
    });
  });

  /* ---------- تسجيل معلم ---------- */
  $("t-reg-go").addEventListener("click", function () {
    var name = $("t-name").value.trim();
    if (!name) { $("t-reg-err").textContent = "اكتب اسمك أولًا."; return; }
    $("t-reg-go").disabled = true;
    Teach.register(user, name).then(function () {
      hideAll(); $("t-pending").hidden = false;
    }).catch(function () {
      $("t-reg-go").disabled = false;
      $("t-reg-err").textContent = "حدث خطأ، حاول مرة أخرى.";
    });
  });

  /* ---------- التبويبات ---------- */
  document.querySelectorAll(".t-tabs button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".t-tabs button").forEach(function (x) { x.classList.toggle("on", x === b); });
      ["exams", "games", "paths", "new", "newpath", "results", "hw"].forEach(function (t) { $("tab-" + t).hidden = t !== b.dataset.tab; });
      if (b.dataset.tab === "results") fillResultPicker();
      if (b.dataset.tab === "hw") loadHw();
    });
  });

  /* ---------- القوائم ---------- */
  var myExams = [], myGames = [], myPaths = [];
  function kindOf(kind) { return kind === "exams" ? "exam" : (kind === "games" ? "game" : "path"); }
  function loadLists() {
    Teach.listMine("exams", user.uid).then(function (a) {
      myExams = a; renderList("exams", a, $("t-exams"), $("t-exams-empty"));
    });
    Teach.listMine("games", user.uid).then(function (a) {
      myGames = a; renderList("games", a, $("t-games"), $("t-games-empty"));
    });
    Teach.listMine("paths", user.uid).then(function (a) {
      myPaths = a; renderList("paths", a, $("t-paths"), $("t-paths-empty"));
    });
  }
  function typeLabel(d, kind) {
    if (kind === "exams") return "اختبار";
    if (kind === "paths") return "مسار تعلّم";
    return d.gameType === "quiz" ? "تحدي السرعة" : "سباق";
  }
  function renderList(kind, arr, box, empty) {
    empty.hidden = arr.length > 0;
    box.innerHTML = arr.map(function (d) {
      return '<div class="t-item">' +
        '<div class="t-item-main"><b>' + esc(d.title) + '</b>' +
        '<span class="t-meta">' + typeLabel(d, kind) + ' · ' + (kind === "paths" ? arNum((d.steps || []).length) + " بيت" : arNum((d.questions || []).length) + " سؤال") + ' · ' +
        (d.published ? '<span class="t-live">منشور</span>' : 'مسودة') +
        (d.isHomework ? ' · <span class="t-hw">واجب</span>' : '') + '</span></div>' +
        '<div class="t-item-acts">' +
        '<button type="button" class="btn ghost" data-act="link" data-kind="' + kind + '" data-id="' + d.id + '">نسخ الرابط</button>' +
        '<button type="button" class="btn ghost" data-act="edit" data-kind="' + kind + '" data-id="' + d.id + '">تعديل</button>' +
        '<button type="button" class="btn ghost" data-act="pub" data-kind="' + kind + '" data-id="' + d.id + '">' + (d.published ? "إخفاء" : "نشر") + '</button>' +
        '<button type="button" class="btn ghost t-del" data-act="del" data-kind="' + kind + '" data-id="' + d.id + '">حذف</button>' +
        '</div></div>';
    }).join("");
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-act]");
    if (!b) return;
    var kind = b.dataset.kind, id = b.dataset.id;
    var d = (kind === "exams" ? myExams : (kind === "games" ? myGames : myPaths)).find(function (x) { return x.id === id; });
    if (!d) return;
    if (b.dataset.act === "link") {
      var page = kind === "exams" ? "exam.html?id=" : (kind === "games" ? "game.html?id=" : "path.html?id=");
      var url = location.href.slice(0, location.href.lastIndexOf("/") + 1) + page + encodeURIComponent(id);
      var done = function () { b.textContent = "تم النسخ ✓"; setTimeout(function () { b.textContent = "نسخ الرابط"; }, 2000); };
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(url).then(done, done); }
      else {
        var ta = document.createElement("textarea"); ta.value = url; document.body.appendChild(ta);
        ta.select(); try { document.execCommand("copy"); } catch (e) {} ta.remove(); done();
      }
      return;
    }
    if (b.dataset.act === "pub") {
      Teach.save(kind, id, { published: !d.published }, user).then(loadLists);
    } else if (b.dataset.act === "del") {
      if (!confirm("حذف «" + d.title + "» نهائيًا؟")) return;
      Teach.remove(kind, id).then(loadLists);
    } else if (b.dataset.act === "edit") {
      if (kind === "paths") startPathEdit(d); else startEdit(kind, d);
    }
  });

  /* ---------- المنشئ ---------- */
  function qHtml(i, q) {
    q = q || {};
    var opts = q.options || ["", "", "", ""];
    return '<div class="t-q" data-i="' + i + '">' +
      '<div class="t-q-top"><b>سؤال ' + arNum(i + 1) + '</b><button type="button" class="t-q-del" data-delq="' + i + '">✕</button></div>' +
      '<input type="text" class="q-text" maxlength="300" placeholder="نص السؤال" value="' + esc(q.question || "") + '">' +
      opts.map(function (o, oi) {
        return '<div class="t-opt"><input type="radio" name="ans-' + i + '" value="' + oi + '"' + ((q.answer || 0) === oi ? " checked" : "") + '>' +
          '<input type="text" class="q-opt" maxlength="200" placeholder="الاختيار ' + arNum(oi + 1) + '" value="' + esc(o) + '"></div>';
      }).join("") +
      '<div class="t-hint">حدّد الدائرة بجانب الإجابة الصحيحة.</div></div>';
  }
  function addQ(q) {
    var n = $("f-questions").children.length;
    $("f-questions").insertAdjacentHTML("beforeend", qHtml(n, q));
    renumber();
  }
  function renumber() {
    Array.prototype.forEach.call($("f-questions").children, function (el, i) {
      el.dataset.i = i;
      el.querySelector(".t-q-top b").textContent = "سؤال " + arNum(i + 1);
      el.querySelector(".t-q-del").dataset.delq = i;
      el.querySelectorAll("input[type=radio]").forEach(function (r) { r.name = "ans-" + i; });
    });
  }
  $("f-addq").addEventListener("click", function () { addQ(); });
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-delq]");
    if (!b) return;
    b.closest(".t-q").remove(); renumber();
  });
  $("f-kind").addEventListener("change", function () {
    $("f-time-wrap").style.display = $("f-kind").value === "exam" ? "" : "none";
  });

  function resetForm() {
    editing = { kind: null, id: null };
    $("f-kind").value = "exam"; $("f-kind").dispatchEvent(new Event("change"));
    $("f-title").value = ""; $("f-desc").value = ""; $("f-time").value = "10";
    $("f-pub").checked = true; $("f-hw").checked = false; $("f-err").textContent = "";
    $("f-questions").innerHTML = ""; addQ();
    $("f-save").textContent = "حفظ";
  }
  function startEdit(kind, d) {
    resetForm();
    editing = { kind: kind, id: d.id };
    $("f-kind").value = kind === "exams" ? "exam" : (d.gameType || "race");
    $("f-kind").dispatchEvent(new Event("change"));
    $("f-title").value = d.title || ""; $("f-desc").value = d.description || "";
    $("f-time").value = d.timeLimitMin || 0;
    $("f-pub").checked = !!d.published;
    $("f-hw").checked = !!d.isHomework;
    $("f-questions").innerHTML = "";
    (d.questions || []).forEach(function (q) { addQ(q); });
    if (!$("f-questions").children.length) addQ();
    $("f-save").textContent = "حفظ التعديلات";
    document.querySelector('.t-tabs [data-tab="new"]').click();
    window.scrollTo(0, 0);
  }
  function collect() {
    var kindV = $("f-kind").value;
    var qs = [];
    var ok = true, err = "";
    Array.prototype.forEach.call($("f-questions").children, function (el, i) {
      var text = el.querySelector(".q-text").value.trim();
      var opts = Array.prototype.map.call(el.querySelectorAll(".q-opt"), function (o) { return o.value.trim(); });
      var ans = el.querySelector("input[type=radio]:checked");
      if (!text) { ok = false; err = "اكتب نص السؤال " + arNum(i + 1) + "."; }
      if (opts.some(function (o) { return !o; })) { ok = false; err = "أكمل كل اختيارات السؤال " + arNum(i + 1) + "."; }
      if (!ans) { ok = false; err = "حدّد الإجابة الصحيحة للسؤال " + arNum(i + 1) + "."; }
      qs.push({ question: text, options: opts, answer: ans ? +ans.value : 0 });
    });
    if (!$("f-title").value.trim()) { ok = false; err = "اكتب العنوان أولًا."; }
    if (!qs.length) { ok = false; err = "أضف سؤالًا واحدًا على الأقل."; }
    if (!ok) return { err: err };
    var data = {
      title: $("f-title").value.trim(),
      description: $("f-desc").value.trim(),
      questions: qs,
      published: $("f-pub").checked,
      isHomework: $("f-hw").checked
    };
    var kind;
    if (kindV === "exam") { kind = "exams"; data.timeLimitMin = Math.max(0, +$("f-time").value || 0); }
    else { kind = "games"; data.gameType = kindV; }
    return { kind: kind, data: data };
  }
  $("f-save").addEventListener("click", function () {
    var c = collect();
    if (c.err) { $("f-err").textContent = c.err; return; }
    $("f-err").textContent = ""; $("f-save").disabled = true;
    Teach.save(c.kind, editing.id, c.data, user).then(function () {
      $("f-save").disabled = false;
      resetForm();
      loadLists();
      document.querySelector('.t-tabs [data-tab="' + c.kind + '"]').click();
    }).catch(function () {
      $("f-save").disabled = false;
      $("f-err").textContent = "تعذّر الحفظ، حاول مرة أخرى.";
    });
  });

  /* ---------- النتائج ---------- */
  function fillResultPicker() {
    var all = myExams.map(function (d) { return { kind: "exams", d: d }; })
      .concat(myGames.map(function (d) { return { kind: "games", d: d }; }))
      .concat(myPaths.map(function (d) { return { kind: "paths", d: d }; }));
    $("r-pick").innerHTML = all.map(function (x, i) {
      return '<option value="' + i + '">' + esc(x.d.title) + " (" + typeLabel(x.d, x.kind) + ")" + '</option>';
    }).join("");
    $("r-pick").onchange = function () { showResults(all[+this.value]); };
    if (all.length) showResults(all[0]);
    else { $("r-rows").innerHTML = ""; $("r-empty").hidden = false; }
  }
  function showResults(x) {
    if (!x) return;
    Teach.listResults(kindOf(x.kind), x.d.id, user.uid).then(function (rows) {
      rows.sort(function (a, b) { return b.score - a.score; });
      $("r-rows").innerHTML = rows.map(function (r) {
        return "<tr><td dir=\"ltr\">" + esc(r.studentEmail || "—") + "</td><td>" + arNum(r.score) + " / " + arNum(r.total) +
          "</td><td>" + (r.durationSec ? arNum(r.durationSec) + " ث" : "—") + "</td><td>" + esc(fmtDate(r.finishedAt)) + "</td></tr>";
      }).join("");
      $("r-empty").hidden = rows.length > 0;
    });
  }

  /* ---------- محرر مسار التعلّم ---------- */
  var editingPath = { id: null };
  function stepHtml(i, st) {
    st = st || {};
    return '<div class="t-q" data-step="' + i + '">' +
      '<div class="t-q-top"><b>البيت ' + arNum(i + 1) + '</b><button type="button" class="t-q-del" data-delstep="' + i + '">✕</button></div>' +
      '<textarea class="st-verse" rows="2" maxlength="400" placeholder="نص البيت كاملًا">' + esc(st.verse || "") + '</textarea>' +
      '<textarea class="st-note" rows="2" maxlength="600" placeholder="شرح البيت (يظهر للطالب قبل الاختبار)">' + esc(st.note || "") + '</textarea>' +
      '<div class="st-questions">' + (st.questions || []).map(function (q) { return stQHtml(q); }).join("") + '</div>' +
      '<button type="button" class="btn ghost" data-addstq="' + i + '">+ سؤال على هذا البيت</button></div>';
  }
  function stQHtml(q) {
    q = q || {};
    var opts = q.options || ["", "", "", ""];
    return '<div class="t-q st-q">' +
      '<div class="t-q-top"><b>سؤال</b><button type="button" class="t-q-del" data-delstq>✕</button></div>' +
      '<input type="text" class="q-text" maxlength="300" placeholder="نص السؤال" value="' + esc(q.question || "") + '">' +
      opts.map(function (o, oi) {
        return '<div class="t-opt"><input type="radio" value="' + oi + '"' + ((q.answer || 0) === oi ? " checked" : "") + '>' +
          '<input type="text" class="q-opt" maxlength="200" placeholder="الاختيار ' + arNum(oi + 1) + '" value="' + esc(o) + '"></div>';
      }).join("") +
      '<div class="t-hint">حدّد الدائرة بجانب الإجابة الصحيحة.</div></div>';
  }
  function renumberSteps() {
    Array.prototype.forEach.call($("pf-steps").children, function (el, i) {
      el.dataset.step = i;
      el.querySelector(".t-q-top b").textContent = "البيت " + arNum(i + 1);
      el.querySelector("[data-delstep]").dataset.delstep = i;
      el.querySelector("[data-addstq]").dataset.addstq = i;
      el.querySelectorAll(".st-q").forEach(function (q, qi) {
        q.querySelectorAll("input[type=radio]").forEach(function (r) { r.name = "stq-" + i + "-" + qi; });
      });
    });
  }
  function addStep(st) {
    $("pf-steps").insertAdjacentHTML("beforeend", stepHtml($("pf-steps").children.length, st));
    renumberSteps();
  }
  $("pf-addstep").addEventListener("click", function () { addStep(); });
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-delstep]");
    if (b) { b.closest("[data-step]").remove(); renumberSteps(); return; }
    var a = e.target.closest("[data-addstq]");
    if (a) {
      var box = a.closest("[data-step]").querySelector(".st-questions");
      box.insertAdjacentHTML("beforeend", stQHtml());
      renumberSteps();
      return;
    }
    var dq = e.target.closest("[data-delstq]");
    if (dq) { dq.closest(".st-q").remove(); renumberSteps(); }
  });
  function resetPathForm() {
    editingPath = { id: null };
    $("pf-title").value = ""; $("pf-desc").value = "";
    $("pf-pub").checked = true; $("pf-hw").checked = false; $("pf-err").textContent = "";
    $("pf-steps").innerHTML = ""; addStep();
    $("pf-save").textContent = "حفظ المسار";
  }
  function startPathEdit(d) {
    resetPathForm();
    editingPath = { id: d.id };
    $("pf-title").value = d.title || ""; $("pf-desc").value = d.description || "";
    $("pf-pub").checked = !!d.published; $("pf-hw").checked = !!d.isHomework;
    $("pf-steps").innerHTML = "";
    (d.steps || []).forEach(function (st) { addStep(st); });
    if (!$("pf-steps").children.length) addStep();
    $("pf-save").textContent = "حفظ التعديلات";
    document.querySelector('.t-tabs [data-tab="newpath"]').click();
    window.scrollTo(0, 0);
  }
  $("pf-save").addEventListener("click", function () {
    var steps = [];
    var ok = true, err = "";
    Array.prototype.forEach.call($("pf-steps").children, function (el, i) {
      var verse = el.querySelector(".st-verse").value.trim();
      var note = el.querySelector(".st-note").value.trim();
      var qs = [];
      el.querySelectorAll(".st-q").forEach(function (qel, qi) {
        var text = qel.querySelector(".q-text").value.trim();
        var opts = Array.prototype.map.call(qel.querySelectorAll(".q-opt"), function (o) { return o.value.trim(); });
        var ans = qel.querySelector("input[type=radio]:checked");
        if (!text) { ok = false; err = "اكتب نص السؤال " + arNum(qi + 1) + " في البيت " + arNum(i + 1) + "."; }
        if (opts.some(function (o) { return !o; })) { ok = false; err = "أكمل كل اختيارات السؤال " + arNum(qi + 1) + " في البيت " + arNum(i + 1) + "."; }
        if (!ans) { ok = false; err = "حدّد الإجابة الصحيحة للسؤال " + arNum(qi + 1) + " في البيت " + arNum(i + 1) + "."; }
        qs.push({ question: text, options: opts, answer: ans ? +ans.value : 0 });
      });
      if (!verse) { ok = false; err = "اكتب نص البيت " + arNum(i + 1) + "."; }
      if (!qs.length) { ok = false; err = "أضف سؤالًا واحدًا على الأقل للبيت " + arNum(i + 1) + "."; }
      steps.push({ verse: verse, note: note, questions: qs });
    });
    if (!$("pf-title").value.trim()) { ok = false; err = "اكتب عنوان المسار أولًا."; }
    if (!steps.length) { ok = false; err = "أضف بيتًا واحدًا على الأقل."; }
    if (!ok) { $("pf-err").textContent = err; return; }
    $("pf-err").textContent = ""; $("pf-save").disabled = true;
    Teach.save("paths", editingPath.id, {
      title: $("pf-title").value.trim(),
      description: $("pf-desc").value.trim(),
      steps: steps,
      published: $("pf-pub").checked,
      isHomework: $("pf-hw").checked
    }, user).then(function () {
      $("pf-save").disabled = false;
      resetPathForm();
      loadLists();
      document.querySelector('.t-tabs [data-tab="paths"]').click();
    }).catch(function () {
      $("pf-save").disabled = false;
      $("pf-err").textContent = "تعذّر الحفظ، حاول مرة أخرى.";
    });
  });

  /* ---------- الواجبات: قائمة الطلاب والتتبع ---------- */
  var roster = [];
  function loadHw() {
    Teach.listStudents(user.uid).then(function (a) { roster = a; renderRoster(); renderHwItems(); });
  }
  function renderRoster() {
    $("hw-roster-empty").hidden = roster.length > 0;
    $("hw-roster").innerHTML = roster.map(function (s) {
      return '<div class="t-item"><div class="t-item-main"><b dir="ltr">' + esc(s.email) + '</b></div>' +
        '<div class="t-item-acts"><button type="button" class="btn ghost t-del" data-rmdel="' + s.id + '">إزالة</button></div></div>';
    }).join("");
  }
  $("hw-add").addEventListener("click", function () {
    var email = $("hw-email").value.trim().toLowerCase();
    if (!email || email.indexOf("@") < 0) { $("hw-add-err").textContent = "اكتب بريد الطالب كاملًا."; return; }
    if (roster.some(function (s) { return s.email === email; })) { $("hw-add-err").textContent = "هذا الطالب في قائمتك بالفعل."; return; }
    $("hw-add-err").textContent = ""; $("hw-add").disabled = true;
    Teach.addStudent(user.uid, email).then(function () {
      $("hw-email").value = ""; $("hw-add").disabled = false; loadHw();
    }).catch(function () { $("hw-add").disabled = false; $("hw-add-err").textContent = "تعذّرت الإضافة، حاول مرة أخرى."; });
  });
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-rmdel]");
    if (!b) return;
    Teach.removeStudent(b.dataset.rmdel).then(loadHw);
  });

  function hwStatusChip(state, res) {
    if (state === "done") return '<span class="t-meta hw-done">حلّ الواجب ✓ · ' + arNum(res.score) + " / " + arNum(res.total) + "</span>";
    if (state === "open") return '<span class="t-meta hw-open">فتح ولم يُكمل</span>';
    return '<span class="t-meta hw-no">لم يفتح بعد</span>';
  }
  function renderHwItems() {
    var all = myExams.map(function (d) { return { kind: "exams", d: d }; })
      .concat(myGames.map(function (d) { return { kind: "games", d: d }; }))
      .concat(myPaths.map(function (d) { return { kind: "paths", d: d }; }))
      .filter(function (x) { return x.d.isHomework; });
    $("hw-items-empty").hidden = all.length > 0;
    $("hw-items").innerHTML = all.map(function (x, i) {
      var asg = (x.d.assignedToEmails || []).map(function (e2) { return String(e2).toLowerCase(); });
      var boxes = roster.map(function (s) {
        return '<label class="hw-check"><input type="checkbox" data-hwasg="' + i + '" value="' + esc(s.email) + '"' + (asg.indexOf(s.email) >= 0 ? " checked" : "") + '> <span dir="ltr">' + esc(s.email) + '</span></label>';
      }).join("");
      return '<div class="t-item t-hwitem">' +
        '<div class="t-item-main"><b>' + esc(x.d.title) + '</b>' +
        '<span class="t-meta">' + typeLabel(x.d, x.kind) + ' · <span class="t-hw">واجب</span></span></div>' +
        '<div class="hw-assign">' +
        (roster.length
          ? '<div class="hw-checks">' + boxes + '</div><button type="button" class="btn ghost" data-hwsave="' + i + '">حفظ التعيين</button> <span class="t-meta" data-hwmsg="' + i + '"></span>'
          : '<span class="t-meta">أضف طلابك من الأعلى أولًا لتعيين هذا الواجب لهم.</span>') +
        (asg.length ? "" : '<div class="t-meta hw-warn">لم تُعيّن طلابًا محددين، يظهر هذا الواجب لجميع الطلاب.</div>') +
        '</div>' +
        '<div class="hw-track" data-hwtrack="' + i + '"></div>' +
        '</div>';
    }).join("");
    all.forEach(function (x, i) { fillTrack(x, i); });
  }
  function fillTrack(x, i) {
    var box = document.querySelector('[data-hwtrack="' + i + '"]');
    if (!box) return;
    Promise.all([Teach.listResults(kindOf(x.kind), x.d.id, user.uid), Teach.listActivity(x.d.id, user.uid)]).then(function (v) {
      var best = {};
      v[0].forEach(function (r) {
        var em = (r.studentEmail || "").toLowerCase();
        if (!best[em] || r.score > best[em].score) best[em] = r;
      });
      var opened = {};
      v[1].forEach(function (a) { opened[(a.email || "").toLowerCase()] = true; });
      var asg = (x.d.assignedToEmails || []).map(function (e2) { return String(e2).toLowerCase(); });
      /* بدون تعيين: نعرض كل من تفاعل حتى الآن */
      var emails = asg.length ? asg : Object.keys(best).concat(Object.keys(opened)).filter(function (e2, j, arr) { return arr.indexOf(e2) === j; });
      if (!emails.length) { box.innerHTML = '<div class="t-meta">لا تفاعل بعد.</div>'; return; }
      box.innerHTML = '<div class="adm-tablewrap"><table class="adm-table"><thead><tr><th>الطالب</th><th>الحالة</th></tr></thead><tbody>' +
        emails.map(function (em) {
          var state = best[em] ? "done" : (opened[em] ? "open" : "none");
          return '<tr><td dir="ltr">' + esc(em) + '</td><td>' + hwStatusChip(state, best[em]) + '</td></tr>';
        }).join("") + '</tbody></table></div>';
    });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-hwsave]");
    if (!b) return;
    var i = +b.dataset.hwsave;
    var all = myExams.map(function (d) { return { kind: "exams", d: d }; })
      .concat(myGames.map(function (d) { return { kind: "games", d: d }; }))
      .concat(myPaths.map(function (d) { return { kind: "paths", d: d }; }))
      .filter(function (x) { return x.d.isHomework; });
    var x = all[i];
    if (!x) return;
    var emails = Array.prototype.map.call(document.querySelectorAll('[data-hwasg="' + i + '"]:checked'), function (c) { return c.value; });
    b.disabled = true;
    Teach.save(x.kind, x.d.id, { assignedToEmails: emails }, user).then(function () {
      x.d.assignedToEmails = emails;
      b.disabled = false;
      renderHwItems();
    }).catch(function () {
      b.disabled = false;
      var msg = document.querySelector('[data-hwmsg="' + i + '"]');
      if (msg) msg.textContent = "تعذّر الحفظ، حاول مرة أخرى.";
    });
  });

  resetForm();
  resetPathForm();
})();
