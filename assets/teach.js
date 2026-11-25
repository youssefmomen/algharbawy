/*
 * طبقة بيانات المعلمين والاختبارات والألعاب والنتائج
 * تعمل فوق Firebase بعد Store.init() — كل الدوال تُستخدم من صفحات المعلم والطالب.
 * المجموعات: teachers, exams, games, results
 */
window.Teach = (function () {
  function db() { return firebase.firestore(); }
  function col(n) { return db().collection(n); }
  function now() { return firebase.firestore.FieldValue.serverTimestamp(); }
  function snap(s) { return s.docs.map(function (d) { var o = d.data(); o.id = d.id; return o; }); }

  /* ---------- تسجيل المعلم وحالته ---------- */
  function status(user) {
    return col("teachers").doc(user.uid).get()
      .then(function (d) { return d.exists ? d.data() : null; })
      .catch(function () { return null; });
  }
  function register(user, name) {
    var ref = col("teachers").doc(user.uid);
    return ref.get().then(function (d) {
      if (d.exists) return d.data();
      var doc = {
        email: user.email || "",
        name: (name || "").trim() || user.email || "",
        status: "pending",
        createdAt: now()
      };
      return ref.set(doc).then(function () { return doc; });
    });
  }

  /* ---------- الإدارة: الموافقة على المعلمين ---------- */
  function listTeachers() {
    return col("teachers").get().then(snap).catch(function () { return null; });
  }
  function setTeacherStatus(uid, st) {
    return col("teachers").doc(uid).set({ status: st }, { merge: true });
  }

  /* ---------- الاختبارات والألعاب (CRUD المعلم) ---------- */
  /* kind: "exams" أو "games" — البنية واحدة:
     {teacherId, teacherName, title, description, gameType, timeLimitMin,
      questions:[{question, options:[..], answer}], published, createdAt, updatedAt} */
  function save(kind, id, data, user) {
    data.teacherId = user.uid;
    data.teacherName = user.email || "";
    data.updatedAt = now();
    if (id) return col(kind).doc(id).set(data, { merge: true }).then(function () { return id; });
    data.createdAt = now();
    return col(kind).add(data).then(function (r) { return r.id; });
  }
  function get(kind, id) {
    return col(kind).doc(id).get()
      .then(function (d) { if (!d.exists) return null; var o = d.data(); o.id = d.id; return o; });
  }
  function remove(kind, id) { return col(kind).doc(id).delete(); }
  function listMine(kind, uid) {
    return col(kind).where("teacherId", "==", uid).get().then(snap)
      .then(function (a) { a.sort(function (x, y) { return (y.createdAt && y.createdAt.seconds || 0) - (x.createdAt && x.createdAt.seconds || 0); }); return a; });
  }
  function listPublished(kind) {
    return col(kind).where("published", "==", true).get().then(snap)
      .then(function (a) { a.sort(function (x, y) { return (y.createdAt && y.createdAt.seconds || 0) - (x.createdAt && x.createdAt.seconds || 0); }); return a; });
  }

  /* ---------- طلاب المعلم (قائمة التعيين) ---------- */
  /* {teacherId, email, addedAt} — المعلم يضيف بريد كل طالب يعيّن له واجبات */
  function listStudents(uid) {
    return col("teacherStudents").where("teacherId", "==", uid).get().then(snap)
      .then(function (a) { a.sort(function (x, y) { return String(x.email).localeCompare(String(y.email)); }); return a; })
      .catch(function () { return []; });
  }
  function addStudent(uid, email) {
    return col("teacherStudents").add({ teacherId: uid, email: String(email || "").trim().toLowerCase(), addedAt: now() });
  }
  function removeStudent(id) { return col("teacherStudents").doc(id).delete(); }

  /* ---------- تتبع فتح الواجبات ---------- */
  /* مستند لكل (واجب، طالب): {kind, refId, teacherId, uid, email, openedAt} — يُنشأ عند أول فتح */
  function markOpened(kind, refId, teacherId, user) {
    if (!user || !user.uid) return Promise.resolve();
    var ref = col("hwActivity").doc(refId + "_" + user.uid);
    return ref.get().then(function (d) {
      if (d.exists) return;
      return ref.set({
        kind: kind, refId: refId, teacherId: teacherId || "",
        uid: user.uid, email: (user.email || "").toLowerCase(), openedAt: now()
      });
    }).catch(function () {});
  }
  function listActivity(refId, teacherUid) {
    return col("hwActivity").where("refId", "==", refId).where("teacherId", "==", teacherUid).get().then(snap)
      .catch(function () { return []; });
  }

  /* ---------- النتائج ---------- */
  /* {kind:"exam"|"game", refId, teacherId, studentUid, studentEmail, title,
     score, total, durationSec, finishedAt} */
  function saveResult(r) {
    r.finishedAt = now();
    return col("results").add(r);
  }
  function listResults(kind, refId, teacherUid) {
    return col("results").where("refId", "==", refId).where("teacherId", "==", teacherUid).get().then(snap);
  }
  function myResults(uid) {
    return col("results").where("studentUid", "==", uid).get().then(snap)
      .then(function (a) { a.sort(function (x, y) { return (y.finishedAt && y.finishedAt.seconds || 0) - (x.finishedAt && x.finishedAt.seconds || 0); }); return a; });
  }

  return {
    status: status, register: register,
    listTeachers: listTeachers, setTeacherStatus: setTeacherStatus,
    save: save, get: get, remove: remove,
    listMine: listMine, listPublished: listPublished,
    saveResult: saveResult, listResults: listResults, myResults: myResults,
    listStudents: listStudents, addStudent: addStudent, removeStudent: removeStudent,
    markOpened: markOpened, listActivity: listActivity
  };
})();
