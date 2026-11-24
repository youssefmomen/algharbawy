/*
 * طبقة الحسابات والتقدّم
 * إن وُجد إعداد Firebase صالح تعمل الحسابات ويُحفَظ التقدّم في Firestore،
 * وإلا يعمل الموقع بالتخزين المحلي فقط دون أي تغيير.
 */
window.Store = (function () {
  var cfg = window.FIREBASE_CONFIG || {};
  var ready = false, auth = null, db = null;

  function configured() {
    return !!(
      window.firebase &&
      cfg.apiKey && String(cfg.apiKey).indexOf("PASTE_") !== 0 &&
      cfg.projectId && String(cfg.projectId).indexOf("PASTE_") !== 0
    );
  }

  function init() {
    if (!configured()) return Promise.resolve(false);
    try {
      firebase.initializeApp(cfg);
      auth = firebase.auth();
      db = firebase.firestore();
      ready = true;
    } catch (e) {
      ready = false;
    }
    if (ready) watchProfile();
    return Promise.resolve(ready);
  }

  function isReady() { return ready; }

  function onAuth(cb) {
    if (!ready) { cb(null); return; }
    auth.onAuthStateChanged(cb);
  }

  /* ملف الطالب: بريده وآخر نشاط — يُكتب تلقائيًا عند كل دخول */
  function watchProfile() {
    if (!ready) return;
    auth.onAuthStateChanged(function (u) {
      if (!u || !u.email) return;
      db.collection("users").doc(u.uid).set({
        email: u.email,
        lastActive: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true }).catch(function () {});
    });
  }

  /* مزامنة النجوم ونقاط الخبرة مع الحساب (تظهر في لوحة التحكم) */
  function syncStats(uid, stats) {
    if (!ready || !uid) return Promise.resolve();
    return db.collection("progress").doc(uid).set({
      xp: stats.xp || 0,
      stars: stats.stars || {}
    }, { merge: true }).catch(function () {});
  }

  /* لوحة التحكم: قراءة كل الملفات والتقدم (للمدير فقط، والقواعد تفرض ذلك) */
  function adminListAll() {
    if (!ready) return Promise.resolve({ users: [], progress: [] });
    return Promise.all([
      db.collection("users").get().catch(function () { return null; }),
      db.collection("progress").get().catch(function () { return null; })
    ]).then(function (rs) {
      var users = rs[0] ? rs[0].docs.map(function (d) { var o = d.data(); o.uid = d.id; return o; }) : null;
      var progress = rs[1] ? rs[1].docs.map(function (d) { var o = d.data(); o.uid = d.id; return o; }) : null;
      return { users: users, progress: progress };
    });
  }
  function signInEmail(email, pass) { return auth.signInWithEmailAndPassword(email, pass); }
  function signUpEmail(email, pass) { return auth.createUserWithEmailAndPassword(email, pass); }
  function signInGoogle() {
    var p = new firebase.auth.GoogleAuthProvider();
    return auth.signInWithPopup(p);
  }
  function signOut() { return auth.signOut(); }
  function isAdmin(user) {
    return !!(user && cfg.adminEmail && user.email &&
      user.email.toLowerCase() === String(cfg.adminEmail).toLowerCase());
  }

  /* تقدّم الطالب: وثيقة واحدة لكل مستخدم، لا يقرأها ولا يكتبها سواه (قواعد Firestore) */
  function getProgress(uid) {
    if (!ready || !uid) return Promise.resolve([]);
    return db.collection("progress").doc(uid).get()
      .then(function (d) { return d.exists ? (d.data().completed || []) : []; })
      .catch(function () { return []; });
  }

  function setLessonDone(uid, lessonId, done) {
    var ref = db.collection("progress").doc(uid);
    var update = done
      ? { completed: firebase.firestore.FieldValue.arrayUnion(lessonId) }
      : { completed: firebase.firestore.FieldValue.arrayRemove(lessonId) };
    return ref.set(update, { merge: true });
  }

  return {
    init: init,
    isReady: isReady,
    onAuth: onAuth,
    signInEmail: signInEmail,
    signUpEmail: signUpEmail,
    signInGoogle: signInGoogle,
    signOut: signOut,
    isAdmin: isAdmin,
    getProgress: getProgress,
    setLessonDone: setLessonDone,
    syncStats: syncStats,
    adminListAll: adminListAll
  };
})();
