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
    if (ready) return Promise.resolve(true);
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
      // علامة محلية: لهذا المتصفح حساب، ليحمّل firebase-loader المكتبات في الزيارات القادمة
      try {
        if (u) localStorage.setItem("gh-account", "1");
        else localStorage.removeItem("gh-account");
      } catch (e) {}
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
  /* الملف الشخصي: الاسم والدور والصورة الرمزية في وثيقة users/{uid} */
  function getProfile(uid) {
    if (!ready || !uid) return Promise.resolve(null);
    function once() {
      return db.collection("users").doc(uid).get()
        .then(function (d) { return d.exists ? d.data() : null; })
        .catch(function () { return null; });
    }
    /* عند فتح الصفحة قد تسبق القراءة وصول رمز الدخول إلى Firestore فيُرفض الاستعلام — إعادة واحدة بعد لحظة */
    return once().then(function (p) {
      if (p || !auth.currentUser) return p;
      return new Promise(function (res) { setTimeout(function () { once().then(res); }, 700); });
    });
  }
  function saveProfile(uid, patch) {
    if (!ready || !uid) return Promise.reject(new Error("not-ready"));
    return db.collection("users").doc(uid).set(patch, { merge: true });
  }

  function signInEmail(email, pass) { return auth.signInWithEmailAndPassword(email, pass); }
  function signUpEmail(email, pass) { return auth.createUserWithEmailAndPassword(email, pass); }
  function signInGoogle() {
    var p = new firebase.auth.GoogleAuthProvider();
    return auth.signInWithPopup(p);
  }
  function signOut() { return auth.signOut(); }
  /* هل المستخدم مدير؟ وثيقة admins/{uid} في Firestore هي المرجع، وتفرضها القواعد.
     ترجع Promise لأنها قراءة من القاعدة؛ النتيجة تُخزّن مؤقتًا للجلسة. */
  var adminCache = {};
  /* حل مؤقت للمرحلة ١: يقارن بصمة بريد المدير إلى أن تُنشأ وثيقة admins/{uid} */
  function legacyAdmin(user) {
    if (!user || !user.email || !cfg.adminEmailHash || !window.crypto || !crypto.subtle) return Promise.resolve(false);
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(user.email.trim().toLowerCase()))
      .then(function (buf) {
        var hex = Array.prototype.map.call(new Uint8Array(buf), function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
        return hex === cfg.adminEmailHash;
      })
      .catch(function () { return false; });
  }
  function isAdmin(user) {
    if (!ready || !user) return Promise.resolve(false);
    if (adminCache[user.uid] !== undefined) return Promise.resolve(adminCache[user.uid]);
    return db.collection("admins").doc(user.uid).get()
      .then(function (d) {
        if (d && d.exists) { adminCache[user.uid] = true; return true; }
        return legacyAdmin(user);
      })
      .catch(function () { return legacyAdmin(user); })
      .then(function (ok) { adminCache[user.uid] = !!ok; return !!ok; });
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
    getProfile: getProfile,
    saveProfile: saveProfile,
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
