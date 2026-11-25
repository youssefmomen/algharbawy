/* مسار التعلّم — تدفّق دوولينجو: شرح ← تحقّق حفظ ← أسئلة، سؤال واحد في كل شاشة */
(function () {
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function arNum(n) { return String(n).replace(/\d/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[d]; }); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function gate(msg, withLink) {
    var g = $("p-gate");
    g.hidden = false;
    g.innerHTML = esc(msg) + (withLink ? ' <a href="auth.html?next=' + encodeURIComponent(location.pathname.split("/").pop() + location.search) + '">سجّل الدخول أولًا</a>' : "");
  }

  var HEART_SVG = '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.9-9.7-9C.7 9.2 2 5.9 5.2 5c1.9-.5 3.9.3 4.8 2 .9-1.7 2.9-2.5 4.8-2 3.2.9 4.5 4.2 2.9 7-2.2 4.1-9.7 9-9.7 9z"/></svg>';
  var XP_SVG = '<svg viewBox="0 0 24 24"><path d="M12 2l2.4 7.1L22 12l-7.6 2.9L12 22l-2.4-7.1L2 12l7.6-2.9z"/></svg>';
  var FLAME_SVG = '<svg viewBox="0 0 24 24"><path d="M12 22c4 0 7-2.8 7-6.7 0-3-1.7-5.2-3.2-7C14.3 6.6 13 5 13 2c-3 2-4.5 4.7-4.4 7-.9-.5-1.5-1.3-1.8-2.3C4.9 8.4 5 10 5 11.7 5 19.2 8 22 12 22z"/></svg>';

  var id = new URLSearchParams(location.search).get("id");
  var user = null, path = null, steps = [], t0 = 0;
  var prog = null;          /* {step, wrong, xp, streak, lastDay, done} */
  var reviewing = false;    /* مراجعة خطوة مكتملة — لا تُحفَظ ولا تؤثر في التقدم */
  var i = 0, phase = "explain", quizQs = [], quizIx = 0, hearts = 3, sel = -1;

  if (!id) { gate("رابط غير صحيح.", false); return; }

  function db() { return firebase.firestore(); }
  function progRef() { return db().collection("pathProgress").doc(user.uid + "_" + id); }
  function saveProg(patch) {
    prog = Object.assign({ uid: user.uid, pathId: id, step: 0, wrong: 0, xp: 0, streak: 0, done: false }, prog, patch);
    prog.uid = user.uid; prog.pathId = id; prog.totalSteps = steps.length;
    prog.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    var clean = {};
    ["uid", "pathId", "step", "totalSteps", "wrong", "done", "xp", "streak", "lastDay", "updatedAt"].forEach(function (k) { if (prog[k] !== undefined) clean[k] = prog[k]; });
    return progRef().set(clean).catch(function () {});
  }
  function dayStr(d) { return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }

  function hud() {
    var frac = i / steps.length + (phase === "memorize" ? 0.34 : phase === "quiz" ? 0.67 : 0) / steps.length;
    $("p-bar").style.width = Math.min(100, Math.round(frac * 100)) + "%";
    var hs = "";
    for (var h = 0; h < 3; h++) {
      hs += '<span style="color:' + (h < hearts ? "#d4af5f" : "#3a332a") + '">' + HEART_SVG.replace("<svg", '<svg width="18" height="18" fill="currentColor"') + "</span>";
    }
    $("p-hearts").innerHTML = hs;
    $("p-xp").innerHTML = '<span style="color:#c6a34f">' + XP_SVG.replace("<svg", '<svg width="16" height="16" fill="currentColor"') + "</span><b>" + arNum(prog.xp || 0) + "</b>";
    $("p-streak").innerHTML = '<span style="color:#c6a34f">' + FLAME_SVG.replace("<svg", '<svg width="16" height="16" fill="currentColor"') + "</span><b>" + arNum(prog.streak || 0) + "</b>";
  }

  /* نقطة نهاية البيت للتحقق من الحفظ */
  function memorizeParts(st) {
    if (st.memorize && st.memorize.head && st.memorize.tail) return st.memorize;
    var w = String(st.verse || "").replace(/[‏‎]/g, "").trim().split(/\s+/);
    var k = Math.min(4, Math.max(2, w.length - 3));
    return { head: w.slice(0, w.length - k).join(" "), tail: w.slice(w.length - k).join(" ") };
  }

  function stage(html) {
    $("p-stage").innerHTML = html;
    sel = -1;
    var opts = document.querySelectorAll(".p-opt");
    opts.forEach(function (b) {
      b.addEventListener("click", function () {
        opts.forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        sel = +b.dataset.v;
        $("p-check").disabled = false;
      });
    });
  }

  function tag(t) { return '<span class="p-tag">' + esc(t) + "</span>"; }
  function stepOne() { return (path && path.stepOne) || "البيت"; }
  function stepMany() { return (path && path.stepMany) || "بيتًا"; }
  function stepLabel(t) { return (reviewing ? "مراجعة · " : "") + stepOne() + " " + arNum(i + 1) + " من " + arNum(steps.length) + " · " + t; }

  function render() {
    hud();
    $("p-feedback").hidden = true;
    $("p-back").hidden = (phase === "explain");
    var st = steps[i];
    if (phase === "explain") {
      stage('<div class="p-card">' + tag(stepLabel("الشرح")) +
        (st.verse ? '<p class="p-verse">' + esc(st.verse) + "</p>" : "") +
        (st.image ? '<img class="p-verse-img" src="' + esc(st.image) + '" alt="نص القطعة">' : "") +
        (st.note ? '<p class="p-note">' + esc(st.note) + "</p>" : "") +
        (st.vocab && st.vocab.length ? '<div class="p-vocab"><div class="p-vocab-h">المفردات</div>' +
          st.vocab.map(function (v) { return '<p class="p-vocab-i"><b>' + esc(v[0]) + ":</b> " + esc(v[1]) + "</p>"; }).join("") + "</div>" : "") +
        "</div>");
      $("p-check").textContent = st.noMem ? "فهمتُه — اختبِرني" : "حفظتُه — اختبِرني";
      $("p-check").disabled = false;
    } else if (phase === "memorize") {
      var mp = memorizeParts(st);
      var others = [];
      steps.forEach(function (s2, ix) { if (ix !== i && !s2.noMem) others.push(memorizeParts(s2).tail); });
      others = shuffle(others.filter(function (t) { return t !== mp.tail; }));
      var opts = [{ t: mp.tail, ok: true }].concat(others.slice(0, 3).map(function (t) { return { t: t, ok: false }; }));
      shuffle(opts);
      stage('<div class="p-card">' + tag(stepLabel("تحقّق الحفظ")) +
        '<p class="p-q">أكمل البيت من حيث توقّف:</p>' +
        '<p class="p-verse">' + esc(mp.head) + " …؟</p>" +
        '<div class="p-opts">' + opts.map(function (o, oi) {
          return '<button type="button" class="p-opt" data-v="' + oi + '" data-ok="' + (o.ok ? 1 : 0) + '">' + esc(o.t) + "</button>";
        }).join("") + "</div></div>");
      $("p-check").textContent = "تحقّق";
      $("p-check").disabled = true;
    } else { /* quiz */
      var q = quizQs[quizIx];
      stage('<div class="p-card">' + tag(stepLabel("فهم المعنى")) +
        '<p class="p-q">' + esc(q.q) + "</p>" +
        '<div class="p-opts">' + q.opts.map(function (o, oi) {
          return '<button type="button" class="p-opt" data-v="' + oi + '" data-ok="' + (o.ok ? 1 : 0) + '">' + esc(o.t) + "</button>";
        }).join("") + "</div></div>");
      $("p-check").textContent = "تحقّق";
      $("p-check").disabled = true;
    }
  }

  function feedback(good, title, msg, nextLabel, onNext) {
    var f = $("p-feedback");
    f.hidden = false;
    f.className = "p-feedback " + (good ? "good" : "bad");
    $("p-fb-title").textContent = title;
    $("p-fb-msg").textContent = msg;
    var b = $("p-fb-next");
    b.textContent = nextLabel;
    b.onclick = function () { f.hidden = true; onNext(); };
  }

  function startQuiz(st) {
    var pool = shuffle((st.questions || []).slice());
    quizQs = pool.slice(0, Math.min(2, pool.length)).map(function (q) {
      var opts = q.options.map(function (t, oi) { return { t: t, ok: oi === q.answer }; });
      shuffle(opts);
      return { q: q.question, opts: opts };
    });
    quizIx = 0;
    if (!quizQs.length) return verseDone();
    phase = "quiz"; render();
  }

  function verseDone() {
    if (reviewing) { showMap("أتممتَ مراجعة هذه الخطوة، وتقدّمك محفوظ كما هو."); return; }
    var xp = (prog.xp || 0) + 15;
    saveProg({ step: i + 1, xp: xp }).then(function () {
      i++;
      if (i >= steps.length) return finish();
      phase = "explain"; hearts = 3; render();
    });
  }

  function backToExplain() {
    hearts = 3;
    phase = "explain";
    if (reviewing) { render(); return; }
    saveProg({ wrong: (prog.wrong || 0) + 1 }).then(render);
  }

  /* زر الرجوع: من الأسئلة يعود إلى شرح الخطوة نفسها دون خسارة التقدم المحفوظ */
  function goBackExplain() {
    hearts = 3;
    phase = "explain";
    render();
  }

  function startStep(ix, review) {
    t0 = Date.now();
    i = ix;
    reviewing = !!review;
    $("p-intro").hidden = true;
    $("p-done").hidden = true;
    $("p-play").hidden = false;
    phase = "explain"; hearts = 3; render();
  }

  function renderMap(note) {
    var cur = Math.min(prog.step || 0, steps.length - 1);
    $("p-map").innerHTML = steps.map(function (s, ix) {
      var cls = prog.done || ix < cur ? "done" : (ix === cur ? "current" : "locked");
      var label = prog.done || ix < cur ? "✓" : arNum(ix + 1);
      if (cls === "locked") return '<div class="p-node locked">' + label + "</div>";
      return '<button type="button" class="p-node ' + cls + '" data-ix="' + ix + '" title="' +
        (cls === "done" ? "راجِع " + stepOne() + " " + arNum(ix + 1) : "أكمل من هنا") + '">' + label + "</button>";
    }).join("");
    document.querySelectorAll("#p-map .p-node[data-ix]").forEach(function (b) {
      b.addEventListener("click", function () {
        var ix = +b.dataset.ix;
        startStep(ix, prog.done || ix < cur);
      });
    });
    $("p-start").textContent = (prog.step || 0) > 0 && !prog.done ? "تابع من " + stepOne() + " " + arNum(cur + 1) : "ابدأ المسار";
    $("p-map-note").textContent = note || "اضغط أي خطوة مكتملة لمراجعتها دون أن يتغيّر تقدّمك.";
  }

  function showMap(note) {
    reviewing = false;
    $("p-play").hidden = true;
    $("p-done").hidden = true;
    renderMap(note);
    $("p-intro").hidden = false;
  }

  function finish() {
    saveProg({ done: true, step: steps.length });
    Teach.saveResult({
      kind: "path", refId: id, teacherId: path.teacherId,
      studentUid: user.uid, studentEmail: user.email || "",
      title: path.title, score: steps.length, total: steps.length,
      durationSec: Math.round((Date.now() - t0) / 1000)
    }).catch(function () {});
    $("p-play").hidden = true;
    $("p-done").hidden = false;
    $("p-done-xp").textContent = "نقاطك: " + arNum(prog.xp || 0) + " نقطة" + (prog.streak ? " · سلسلة " + arNum(prog.streak) + " يوم" : "");
    $("p-done-sub").textContent = "أتممتَ " + arNum(steps.length) + " " + stepMany() + ". سُجّلت نتيجتك عند معلمك.";
  }

  $("p-check").addEventListener("click", function () {
    var st = steps[i];
    if (phase === "explain") {
      if (st.noMem) { startQuiz(st); } else { phase = "memorize"; render(); }
      return;
    }
    if (sel < 0) return;
    var ok = document.querySelector('.p-opt[data-v="' + sel + '"]').dataset.ok === "1";
    if (phase === "memorize") {
      if (ok) {
        if (reviewing) { feedback(true, "أحسنت! ✓", "حفظك صحيح.", "تابع إلى الأسئلة", function () { startQuiz(st); }); return; }
        saveProg({ xp: (prog.xp || 0) + 10 }).then(function () {
          feedback(true, "أحسنت! ✓", "+١٠ نقاط. حفظك صحيح.", "تابع إلى الأسئلة", function () { startQuiz(st); });
        });
      } else {
        hearts--;
        hud();
        var correct = memorizeParts(st).tail;
        if (hearts <= 0) {
          feedback(false, "نفدت القلوب", "الإجابة الصحيحة: " + correct + ". ستعود إلى الشرح لتعيد الحفظ، ثم تحاول من جديد.", "ارجع إلى الشرح", backToExplain);
        } else {
          feedback(false, "ليست الإجابة", "الإجابة الصحيحة: " + correct + ". خسرت قلبًا — تبقّى لديك " + arNum(hearts) + ".", "حاول مرة أخرى", render);
        }
      }
      return;
    }
    /* quiz */
    var q = quizQs[quizIx];
    var correctT = q.opts.filter(function (o) { return o.ok; })[0].t;
    if (ok && reviewing) {
      quizIx++;
      if (quizIx >= quizQs.length) {
        feedback(true, "أحسنت! ✓", "أنهيتَ مراجعة هذه الخطوة.", "عودة إلى الخريطة", verseDone);
      } else {
        feedback(true, "أحسنت! ✓", "إجابة صحيحة.", "السؤال التالي", render);
      }
      return;
    }
    if (ok) {
      saveProg({ xp: (prog.xp || 0) + 10 }).then(function () {
        quizIx++;
        if (quizIx >= quizQs.length) {
          feedback(true, "أحسنت! ✓", "+١٠ نقاط. أنهيتَ هذه الخطوة (+١٥ نقطة إتمام).", "الخطوة التالية", verseDone);
        } else {
          feedback(true, "أحسنت! ✓", "+١٠ نقاط.", "السؤال التالي", render);
        }
      });
    } else {
      hearts--;
      hud();
      if (hearts <= 0) {
        feedback(false, "نفدت القلوب", "الإجابة الصحيحة: " + correctT + ". ستعود إلى شرح هذه الخطوة ثم تعيد المحاولة.", "ارجع إلى الشرح", backToExplain);
      } else {
        quizQs.push(q); /* يعاد السؤال في آخر المجموعة كما في دوولينجو */
        quizIx++;
        if (quizIx >= quizQs.length) { quizIx = 0; quizQs = shuffle(quizQs); }
        feedback(false, "ليست الإجابة", "الإجابة الصحيحة: " + correctT + ". خسرت قلبًا، وسيعود إليك هذا السؤال.", "تابع", render);
      }
    }
  });

  $("p-exit").addEventListener("click", function () {
    if (!$("p-play").hidden) { showMap(); return; }
    location.href = "student.html";
  });
  $("p-back").addEventListener("click", goBackExplain);

  Store.init().then(function () {
    if (!Store.isReady()) { gate("خدمة الحسابات غير متاحة حاليًا.", false); return; }
    Store.onAuth(function (u) {
      user = u;
      if (!u) { gate("سجّل دخولك لتبدأ مسار التعلّم ويُحفَظ تقدمك.", true); return; }
      Teach.get("paths", id).then(function (d) {
        if (!d || !(d.published || d.teacherId === u.uid)) { gate("هذا المسار غير متاح.", false); return; }
        if (d.teacherId === u.uid && !d.published) { gate("هذا المسار مسودة غير منشورة بعد.", false); return; }
        path = d; steps = (d.steps || []).filter(function (s) { return s && (s.verse || s.image); });
        if (!steps.length) { gate("لا خطوات في هذا المسار بعد.", false); return; }
        progRef().get().then(function (doc) {
          prog = doc.exists ? doc.data() : { step: 0, wrong: 0, xp: 0, streak: 0, done: false };
          /* سلسلة الأيام */
          var today = dayStr(new Date());
          if (prog.lastDay !== today) {
            var y = dayStr(new Date(Date.now() - 864e5));
            saveProg({ streak: prog.lastDay === y ? (prog.streak || 0) + 1 : 1, lastDay: today });
          }
          if (prog.done) { t0 = Date.now(); finish(); return; }
          $("p-title").textContent = d.title;
          $("p-desc").textContent = d.description || "";
          $("p-info").textContent = arNum(steps.length) + " " + ((d && d.stepMany) || "بيتًا") + " · المعلم: " + (d.teacherName || "");
          i = Math.min(prog.step || 0, steps.length - 1);
          renderMap();
          $("p-intro").hidden = false;
          $("p-start").onclick = function () {
            startStep(Math.min(prog.step || 0, steps.length - 1), false);
          };
        });
      }).catch(function () { gate("تعذّر تحميل المسار.", false); });
    });
  });
})();
