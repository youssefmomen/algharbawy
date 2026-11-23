// منطق عرض الصفحات: يقرأ البيانات من data.js ويرسم الصفحة المناسبة
(function () {
  var data = window.SITE_DATA;
  if (!data) return;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function param(name) {
    return new URLSearchParams(location.search).get(name);
  }
  function findSection(id) {
    for (var i = 0; i < data.sections.length; i++) if (data.sections[i].id === id) return data.sections[i];
    return null;
  }
  function findLesson(sec, id) {
    for (var i = 0; i < sec.lessons.length; i++) if (sec.lessons[i].id === id) return sec.lessons[i];
    return null;
  }

  // العنوان العام في كل الصفحات
  var brandLinks = document.querySelectorAll(".brand");
  brandLinks.forEach(function (a) { a.textContent = data.siteTitle; a.href = "index.html"; });
  var year = new Date().getFullYear();
  document.querySelectorAll("footer .foot").forEach(function (f) {
    f.textContent = data.siteTitle + "، " + year;
  });

  var page = document.body.getAttribute("data-page");

  if (page === "home") {
    document.title = data.siteTitle;
    document.getElementById("hero-title").textContent = data.siteTitle;
    document.getElementById("hero-tag").textContent = data.siteTagline;
    var cards = document.getElementById("cards");
    cards.innerHTML = data.sections.map(function (s) {
      return '<a class="card" href="section.html?id=' + encodeURIComponent(s.id) + '">' +
        '<div class="icon">' + esc(s.icon) + '</div>' +
        '<h2>' + esc(s.title) + '</h2>' +
        '<p>' + esc(s.description) + '</p>' +
        '<span class="count">' + s.lessons.length + ' درس</span>' +
        '</a>';
    }).join("");
  }

  if (page === "section") {
    var sec = findSection(param("id")) || data.sections[0];
    document.title = sec.title + " | " + data.siteTitle;
    document.getElementById("crumb-section").textContent = sec.title;
    document.getElementById("page-title").textContent = sec.icon + " " + sec.title;
    document.getElementById("page-desc").textContent = sec.description;
    var list = document.getElementById("lessons");
    list.innerHTML = sec.lessons.map(function (l) {
      return '<li><a href="lesson.html?section=' + encodeURIComponent(sec.id) + '&lesson=' + encodeURIComponent(l.id) + '">' +
        '<div class="t">' + esc(l.title) + '</div>' +
        '<div class="s">' + esc(l.summary) + '</div>' +
        '</a></li>';
    }).join("");
  }

  if (page === "lesson") {
    var sec2 = findSection(param("section")) || data.sections[0];
    var les = findLesson(sec2, param("lesson")) || sec2.lessons[0];
    document.title = les.title + " | " + data.siteTitle;
    var crumbSec = document.getElementById("crumb-section");
    crumbSec.textContent = sec2.title;
    crumbSec.href = "section.html?id=" + encodeURIComponent(sec2.id);
    document.getElementById("crumb-lesson").textContent = les.title;
    document.getElementById("page-title").textContent = les.title;
    document.getElementById("lesson-body").innerHTML =
      les.body.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    var back = document.getElementById("back-link");
    back.href = "section.html?id=" + encodeURIComponent(sec2.id);
    back.textContent = "→ رجوع إلى قسم " + sec2.title;
  }
})();
