/* إعدادات Firebase — مشروع algharbawy */
/* ملاحظة: مفتاح apiKey ليس سرًا في تطبيقات الويب؛ الحماية الحقيقية تأتي من
   قواعد Firestore (ملف firestore.rules) ومن وثيقة admins/{uid} التي تحدد المدير. */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBVkPcAfh0UqPY604Bk-Ne62eOs4v2RypU",
  authDomain: "algharbawy.firebaseapp.com",
  projectId: "algharbawy",
  appId: "1:765682449753:web:6037ec22bf458a981d2048",

  /* مؤقت حتى المرحلة ٢: بصمة SHA-256 لبريد المدير (وليس البريد نفسه) كحل بديل
     إلى أن تُنشأ وثيقة admins/{uid} وتُفعَّل قواعد firestore.rules. */
  adminEmailHash: "733c56287a65d23c5cbf79126714bd5122830a02b7bfcc7d3f7282daa6bb4b28"
};
