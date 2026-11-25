/* صفحة اللعب: سباق + تحدي السرعة */
(function () {
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function arNum(n) { return String(n).replace(/\d/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[d]; }); }
  function gate(msg, withLink) {
    var g = $("g-gate");
    g.hidden = false;
    g.innerHTML = esc(msg) + (withLink ? ' <a href="auth.html?next=' + encodeURIComponent(location.pathname.split("/").pop() + location.search) + '">سجّل الدخول أولًا</a>' : "");
  }
  function shuffled(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  var id = new URLSearchParams(location.search).get("id");
  var user = null, game = null;

  if (!id) { gate("رابط غير صحيح.", false); return; }

  Store.init().then(function () {
    if (!Store.isReady()) { gate("خدمة الحسابات غير متاحة حاليًا.", false); return; }
    Store.onAuth(function (u) {
      user = u;
      if (!u) { gate("سجّل دخولك لتلعب وتحفظ نتيجتك.", true); return; }
      Teach.get("games", id).then(function (d) {
        if (!d || !d.published) { gate("هذه اللعبة غير متاحة.", false); return; }
        game = d;
        if (d.isHomework) Teach.markOpened("game", id, d.teacherId, u);
        $("g-title").textContent = d.title;
        $("g-desc").textContent = d.description || "";
        $("g-info").textContent = (d.gameType === "quiz" ? "تحدي السرعة: أجب عن أكبر عدد في ٦٠ ثانية" : "السباق: كل إجابة صحيحة تقدّمك نحو الراية قبل منافسك") + " · المعلم: " + (d.teacherName || "");
        $("g-intro").hidden = false;
      }).catch(function () { gate("تعذّر تحميل اللعبة.", false); });
    });
  });

  $("g-start").addEventListener("click", function () {
    $("g-intro").hidden = true;
    if (game.gameType === "quiz") startQuiz(); else startRace();
  });
  $("g-again").addEventListener("click", function () {
    $("g-done").hidden = true;
    if (game.gameType === "quiz") startQuiz(); else startRace();
  });

  /* ---------- السباق ---------- */
  var raceTimer = null;
  function startRace() {
    var qs = shuffled(game.questions);
    var qi = 0, correct = 0, botPos = 0, over = false, t0 = Date.now();
    $("g-race").hidden = false;
    var total = qs.length;
    /* المنافس يتقدم خطوة كل ٦ ثوانٍ */
    var botStepMs = 6000;
    function paint() {
      $("race-me").style.insetInlineStart = "calc(" + Math.min(100, qi / total * 100) + "% - 20px)";
      $("race-bot").style.insetInlineStart = "calc(" + Math.min(100, botPos / total * 100) + "% - 20px)";
    }
    function showQ() {
      if (qi >= total) { finish(true); return; }
      var q = qs[qi];
      $("race-q").innerHTML = '<div class="x-q-t">' + esc(q.question) + '</div>' +
        q.options.map(function (o, oi) {
          return '<button type="button" class="x-opt x-opt-btn" data-o="' + oi + '"><span>' + esc(o) + '</span></button>';
        }).join("");
    }
    function finish(won) {
      if (over) return; over = true;
      clearInterval(raceTimer);
      var dur = Math.round((Date.now() - t0) / 1000);
      $("g-race").hidden = true;
      done(won ? "فزت بالسباق! 🏆" : "سبقك المنافس، حاول مجددًا!", correct, total, dur);
    }
    $("g-race").addEventListener("click", function h(e) {
      var b = e.target.closest("button[data-o]");
      if (!b || over) return;
      var q = qs[qi];
      if (+b.dataset.o === q.answer) {
        correct++; qi++; paint();
        if (botPos >= total && qi < total) { /* المنافس أنهى أولًا */ finish(false); return; }
        showQ();
      } else {
        b.classList.add("x-wrong"); b.disabled = true;
      }
    });
    raceTimer = setInterval(function () {
      botPos++;
      paint();
      if (botPos >= total) finish(qi >= total);
    }, botStepMs);
    paint(); showQ();
  }

  /* ---------- تحدي السرعة ---------- */
  function startQuiz() {
    var qs = shuffled(game.questions);
    var qi = 0, score = 0, left = 60, over = false, t0 = Date.now();
    $("g-quiz").hidden = false;
    $("quiz-score").textContent = "النقاط: ٠";
    var tm = $("quiz-timer");
    function tick() {
      tm.textContent = "⏱ " + arNum(left);
      if (left <= 0) { finish(); return; }
      left--;
    }
    var int = setInterval(tick, 1000); tick();
    function showQ() {
      if (qi >= qs.length) { qi = 0; qs = shuffled(game.questions); }
      var q = qs[qi];
      $("quiz-q").innerHTML = '<div class="x-q-t">' + esc(q.question) + '</div>' +
        q.options.map(function (o, oi) {
          return '<button type="button" class="x-opt x-opt-btn" data-o="' + oi + '"><span>' + esc(o) + '</span></button>';
        }).join("");
    }
    function finish() {
      if (over) return; over = true;
      clearInterval(int);
      var dur = Math.round((Date.now() - t0) / 1000);
      $("g-quiz").hidden = true;
      done("انتهى الوقت!", score, qs.length, dur);
    }
    $("g-quiz").addEventListener("click", function h(e) {
      var b = e.target.closest("button[data-o]");
      if (!b || over) return;
      if (+b.dataset.o === qs[qi].answer) { score++; $("quiz-score").textContent = "النقاط: " + arNum(score); }
      qi++; showQ();
    });
    showQ();
  }

  function done(title, score, total, dur) {
    $("g-result-title").textContent = title;
    $("g-score").textContent = game.gameType === "quiz"
      ? "أجبت صحيحًا عن " + arNum(score) + " سؤال في دقيقة"
      : "إجابات صحيحة: " + arNum(score) + " من " + arNum(total);
    $("g-done").hidden = false;
    Teach.saveResult({
      kind: "game", refId: id, teacherId: game.teacherId,
      studentUid: user.uid, studentEmail: user.email || "",
      title: game.title, score: score, total: total, durationSec: dur
    }).catch(function () {});
  }
})();
