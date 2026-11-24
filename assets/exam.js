/* صفحة أداء الاختبار */
(function () {
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function arNum(n) { return String(n).replace(/\d/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[d]; }); }
  function gate(msg, withLink) {
    var g = $("x-gate");
    g.hidden = false;
    g.innerHTML = esc(msg) + (withLink ? ' <a href="auth.html?next=' + encodeURIComponent(location.pathname.split("/").pop() + location.search) + '">سجّل الدخول أولًا</a>' : "");
  }

  var id = new URLSearchParams(location.search).get("id");
  var user = null, exam = null, t0 = 0, timerInt = null;

  if (!id) { gate("رابط غير صحيح.", false); return; }

  Store.init().then(function () {
    if (!Store.isReady()) { gate("خدمة الحسابات غير متاحة حاليًا.", false); return; }
    Store.onAuth(function (u) {
      user = u;
      if (!u) { gate("سجّل دخولك لأداء الاختبار وحفظ نتيجتك.", true); return; }
      Teach.get("exams", id).then(function (d) {
        if (!d || !d.published) { gate("هذا الاختبار غير متاح.", false); return; }
        exam = d;
        $("x-title").textContent = d.title;
        $("x-desc").textContent = d.description || "";
        $("x-info").textContent = arNum(d.questions.length) + " سؤال" + (d.timeLimitMin ? " · " + arNum(d.timeLimitMin) + " دقيقة" : " · بدون وقت محدد") + " · المعلم: " + (d.teacherName || "");
        $("x-intro").hidden = false;
      }).catch(function () { gate("تعذّر تحميل الاختبار.", false); });
    });
  });

  $("x-start").addEventListener("click", function () {
    $("x-intro").hidden = true; $("x-body").hidden = false;
    t0 = Date.now();
    render();
    if (exam.timeLimitMin) {
      var left = exam.timeLimitMin * 60;
      var tm = $("x-timer"); tm.hidden = false;
      function tick() {
        var m = Math.floor(left / 60), s = left % 60;
        tm.textContent = "⏱ " + arNum(m) + ":" + arNum(s < 10 ? "0" + s : s);
        if (left <= 0) { clearInterval(timerInt); submit(); return; }
        left--;
      }
      tick(); timerInt = setInterval(tick, 1000);
    }
  });

  function render() {
    $("x-count").textContent = "أجب عن كل الأسئلة ثم سلّم";
    $("x-questions").innerHTML = exam.questions.map(function (q, i) {
      return '<div class="x-q"><div class="x-q-t">' + arNum(i + 1) + ". " + esc(q.question) + '</div>' +
        q.options.map(function (o, oi) {
          return '<label class="x-opt"><input type="radio" name="q' + i + '" value="' + oi + '"><span>' + esc(o) + '</span></label>';
        }).join("") + '</div>';
    }).join("");
  }

  function submit() {
    if (timerInt) clearInterval(timerInt);
    var score = 0, answered = 0;
    var review = exam.questions.map(function (q, i) {
      var pick = document.querySelector('input[name="q' + i + '"]:checked');
      var a = pick ? +pick.value : -1;
      if (a >= 0) answered++;
      var good = a === q.answer;
      if (good) score++;
      return '<div class="x-q"><div class="x-q-t">' + arNum(i + 1) + ". " + esc(q.question) + '</div>' +
        q.options.map(function (o, oi) {
          var cls = oi === q.answer ? "x-correct" : (oi === a ? "x-wrong" : "");
          return '<div class="x-opt-s ' + cls + '">' + esc(o) + '</div>';
        }).join("") + '</div>';
    }).join("");
    var dur = Math.round((Date.now() - t0) / 1000);
    $("x-body").hidden = true; $("x-done").hidden = false;
    $("x-score").textContent = "نتيجتك: " + arNum(score) + " من " + arNum(exam.questions.length);
    $("x-review").innerHTML = review;
    Teach.saveResult({
      kind: "exam", refId: id, teacherId: exam.teacherId,
      studentUid: user.uid, studentEmail: user.email || "",
      title: exam.title, score: score, total: exam.questions.length,
      durationSec: dur
    }).catch(function () {});
  }
  $("x-submit").addEventListener("click", function () {
    var unanswered = exam.questions.filter(function (q, i) { return !document.querySelector('input[name="q' + i + '"]:checked'); }).length;
    if (unanswered && !confirm("لم تجب عن " + arNum(unanswered) + " سؤال. تسليم الآن؟")) return;
    submit();
  });
})();
