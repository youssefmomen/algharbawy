/* محرّك مسار التعلّم — تدفّق دوولينجو: شرح ← تحقّق حفظ ← أسئلة، سؤال واحد في كل شاشة.
   محرّك مستقل يستعمله path.html (مسارات المعلمين) و section.html (الدورات كألعاب).
   الاستعمال: PathEngine.mount(opts) بعد ملء حاوية DOM بأدوات p-* (انظر path.html). */
window.PathEngine = (function () {
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function br(s) { return esc(s).replace(/\n/g, "<br>"); }
  function arNum(n) { return String(n).replace(/\d/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[d]; }); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function gate(msg, withLink) {
    var g = $("p-gate");
    if (!g) return;
    g.hidden = false;
    g.innerHTML = esc(msg) + (withLink ? ' <a href="auth.html?next=' + encodeURIComponent(location.pathname.split("/").pop() + location.search) + '">سجّل الدخول أولًا</a>' : "");
  }

  var HEART_SVG = '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.9-9.7-9C.7 9.2 2 5.9 5.2 5c1.9-.5 3.9.3 4.8 2 .9-1.7 2.9-2.5 4.8-2 3.2.9 4.5 4.2 2.9 7-2.2 4.1-9.7 9-9.7 9z"/></svg>';
  var XP_SVG = '<svg viewBox="0 0 24 24"><path d="M12 2l2.4 7.1L22 12l-7.6 2.9L12 22l-2.4-7.1L2 12l7.6-2.9z"/></svg>';
  var FLAME_SVG = '<svg viewBox="0 0 24 24"><path d="M12 22c4 0 7-2.8 7-6.7 0-3-1.7-5.2-3.2-7C14.3 6.6 13 5 13 2c-3 2-4.5 4.7-4.4 7-.9-.5-1.5-1.3-1.8-2.3C4.9 8.4 5 10 5 11.7 5 19.2 8 22 12 22z"/></svg>';

  /* opts:
     steps        [{verse?, image?, note?, vocab?, questions?, noMem?, memorize?, title?}]
     title, description, info    نصوص بطاقة البداية
     stepOne, stepMany           «البيت»/«بيتًا» أو «الدرس»/«دروسًا»...
     initialProg                 كائن التقدم المحفوظ (أو null)
     saveProg(fullProg)          يحفظ الكائن الكامل، يعيد Promise
     onFinish(prog)              اختياري: يُستدعى عند إتمام كل الخطوات
     doneHref, doneLabel         زر شاشة الإتمام
     doneSub(prog, steps)        اختياري: سطر تحت النتيجة في شاشة الإتمام
     exitHref                    وجهة زر ✕ من الخريطة
     tallMap                     true لخريطة أطول (الدورات الكبيرة)
  */
  function mount(opts) {
    var steps = opts.steps || [];
    var prog = Object.assign({ step: 0, wrong: 0, xp: 0, streak: 0, done: false }, opts.initialProg);
    var t0 = Date.now();
    var reviewing = false;
    var i = 0, phase = "explain", quizQs = [], quizIx = 0, hearts = 3, sel = -1;

    if (!steps.length) { gate("لا خطوات في هذا المسار بعد.", false); return; }

    function commit(patch) {
      prog = Object.assign(prog, patch);
      return Promise.resolve(opts.saveProg(prog)).catch(function () {});
    }

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
      var opts2 = document.querySelectorAll(".p-opt");
      opts2.forEach(function (b) {
        b.addEventListener("click", function () {
          opts2.forEach(function (x) { x.classList.remove("on"); });
          b.classList.add("on");
          sel = +b.dataset.v;
          $("p-check").disabled = false;
        });
      });
    }

    function tag(t) { return '<span class="p-tag">' + esc(t) + "</span>"; }
    function stepOne() { return opts.stepOne || "البيت"; }
    function stepMany() { return opts.stepMany || "بيتًا"; }
    function stepLabel(t) { return (reviewing ? "مراجعة · " : "") + stepOne() + " " + arNum(i + 1) + " من " + arNum(steps.length) + " · " + t; }

    function render() {
      hud();
      $("p-feedback").hidden = true;
      $("p-back").style.display = (phase === "explain") ? "none" : ""; /* [hidden] يخسر أمام display في .btn */
      var st = steps[i];
      if (phase === "explain") {
        stage('<div class="p-card">' + tag(stepLabel("الشرح")) +
          (st.title ? '<h3 class="p-ltitle">' + esc(st.title) + "</h3>" : "") +
          (st.verse ? '<p class="p-verse">' + br(st.verse) + "</p>" : "") +
          (st.image ? '<img class="p-verse-img" src="' + esc(st.image) + '" alt="نص القطعة">' : "") +
          (st.note ? '<p class="p-note">' + br(st.note) + "</p>" : "") +
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
        var mopts = [{ t: mp.tail, ok: true }].concat(others.slice(0, 3).map(function (t) { return { t: t, ok: false }; }));
        shuffle(mopts);
        stage('<div class="p-card">' + tag(stepLabel("تحقّق الحفظ")) +
          '<p class="p-q">أكمل البيت من حيث توقّف:</p>' +
          '<p class="p-verse">' + br(mp.head) + " …؟</p>" +
          '<div class="p-opts">' + mopts.map(function (o, oi) {
            return '<button type="button" class="p-opt" data-v="' + oi + '" data-ok="' + (o.ok ? 1 : 0) + '">' + br(o.t) + "</button>";
          }).join("") + "</div></div>");
        $("p-check").textContent = "تحقّق";
        $("p-check").disabled = true;
      } else { /* quiz */
        var q = quizQs[quizIx];
        stage('<div class="p-card">' + tag(stepLabel("فهم المعنى")) +
          '<p class="p-q">' + br(q.q) + "</p>" +
          '<div class="p-opts">' + q.opts.map(function (o, oi) {
            return '<button type="button" class="p-opt" data-v="' + oi + '" data-ok="' + (o.ok ? 1 : 0) + '">' + br(o.t) + "</button>";
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
        var o2 = q.options.map(function (t, oi) { return { t: t, ok: oi === q.answer }; });
        shuffle(o2);
        return { q: q.question, opts: o2 };
      });
      quizIx = 0;
      if (!quizQs.length) return verseDone();
      phase = "quiz"; render();
    }

    function verseDone() {
      if (reviewing) { showMap("أتممتَ مراجعة هذه الخطوة، وتقدّمك محفوظ كما هو."); return; }
      var xp = (prog.xp || 0) + 15;
      commit({ step: i + 1, xp: xp }); /* الحفظ في الخلفية */
      i++;
      if (i >= steps.length) return finish();
      phase = "explain"; hearts = 3; render();
    }

    function backToExplain() {
      hearts = 3;
      phase = "explain";
      if (reviewing) { render(); return; }
      commit({ wrong: (prog.wrong || 0) + 1 }).then(render);
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
      var map = $("p-map");
      if (opts.tallMap) map.classList.add("tall");
      map.innerHTML = steps.map(function (s, ix) {
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
      var curNode = map.querySelector(".p-node.current");
      if (curNode && curNode.scrollIntoView) curNode.scrollIntoView({ block: "center", inline: "nearest" });
      $("p-start").textContent = (prog.step || 0) > 0 && !prog.done ? "تابع من " + stepOne() + " " + arNum(cur + 1) : "ابدأ";
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
      commit({ done: true, step: steps.length });
      if (opts.onFinish) { try { opts.onFinish(prog); } catch (e) {} }
      $("p-play").hidden = true;
      $("p-done").hidden = false;
      $("p-done-xp").textContent = "نقاطك: " + arNum(prog.xp || 0) + " نقطة" + (prog.streak ? " · سلسلة " + arNum(prog.streak) + " يوم" : "");
      $("p-done-sub").textContent = opts.doneSub ? opts.doneSub(prog, steps) : "أتممتَ " + arNum(steps.length) + " " + stepMany() + ".";
      var back = $("p-done").querySelector("a.btn");
      if (back) { back.href = opts.doneHref || "#"; back.textContent = opts.doneLabel || "عودة"; }
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
          commit({ xp: (prog.xp || 0) + 10 }); /* الحفظ في الخلفية — القناة بطيئة أول مرة */
          feedback(true, "أحسنت! ✓", "+١٠ نقاط. حفظك صحيح.", "تابع إلى الأسئلة", function () { startQuiz(st); });
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
        commit({ xp: (prog.xp || 0) + 10 }); /* الحفظ في الخلفية */
        quizIx++;
        if (quizIx >= quizQs.length) {
          feedback(true, "أحسنت! ✓", "+١٠ نقاط. أنهيتَ هذه الخطوة (+١٥ نقطة إتمام).", "الخطوة التالية", verseDone);
        } else {
          feedback(true, "أحسنت! ✓", "+١٠ نقاط.", "السؤال التالي", render);
        }
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
      location.href = opts.exitHref || "index.html";
    });
    $("p-back").addEventListener("click", goBackExplain);

    /* بطاقة البداية */
    if (prog.done) {
      finish();
      return { showMap: showMap };
    }
    $("p-title").textContent = opts.title || "";
    $("p-desc").textContent = opts.description || "";
    $("p-info").textContent = opts.info || (arNum(steps.length) + " " + stepMany());
    i = Math.min(prog.step || 0, steps.length - 1);
    renderMap();
    $("p-intro").hidden = false;
    $("p-start").onclick = function () {
      startStep(Math.min(prog.step || 0, steps.length - 1), false);
    };
    return { showMap: showMap };
  }

  return { mount: mount, gate: gate };
})();
