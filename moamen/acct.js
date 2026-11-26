/* منصة مستر مؤمن: student accounts. Firebase Auth + Firestore (same project/rules as the old site).
   Cloud data: users/{uid} {email,name,role,avatarId,lastActive}; progress/{uid}.completed = string list:
   "bac2:<lesson>:<itemId>:p<picked>" | "bac2:<lesson>:<itemId>:o" | "bac2:day:YYYY-MM-DD".  Email must be verified (Google counts as verified). */
(function(){
'use strict';
try{history.scrollRestoration='manual';}catch(e){}
function top(){if(!location.hash)window.scrollTo(0,0);}
top();window.addEventListener('DOMContentLoaded',top);window.addEventListener('load',function(){top();setTimeout(top,60);});window.addEventListener('pageshow',function(e){if(e.persisted)top();});
var SDK=['https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js','firebase-config.js'];
var PFX='bac-g2p1-',DOM='@phone.mrmoamen.app',FLAG='mm-account';
var POSES={waving:'مرحبًا',thumbsup:'برافو',pointing:'ركّز',celebrating:'احتفال',trophy:'بطل',lightbulb:'فكرة',tablet:'تابلت',magnifier:'مُدقّق'};
var auth=null,db=null,loading=null,user=null,pending=null,profile=null,listeners=[];
function img(p){return 'assets/img/mr-moamen-'+p+'.png';}
function one(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
function load(){
 if(loading)return loading;
 loading=SDK.reduce(function(p,f){return p.then(function(){return one(f);});},Promise.resolve()).then(function(){
  firebase.initializeApp(window.FIREBASE_CONFIG);auth=firebase.auth();db=firebase.firestore();
  auth.onAuthStateChanged(function(u){
   if(u&&u.emailVerified){pending=null;activate(u);}
   else{user=null;pending=u||null;try{localStorage.removeItem(FLAG);}catch(e){}profile=null;clearProg();fire();paintChip();gateNo();}
  });return true;}).catch(function(){loading=null;return false;});
 return loading;
}
function activate(u){
 user=u;try{localStorage.setItem(FLAG,'1');}catch(e){}
 db.collection('users').doc(u.uid).set({email:u.email||'',role:'student',lastActive:firebase.firestore.FieldValue.serverTimestamp()},{merge:true}).catch(function(){});
 loadProfile().then(function(){return hydrate();}).then(function(h){fire();paintChip();gateOK(h);});}
function recheck(){return load().then(function(){if(!pending)return !!user;return pending.reload().then(function(){if(pending&&pending.emailVerified){var u=pending;pending=null;activate(u);return true;}return false;});});}
function resend(){return load().then(function(){if(!pending)throw{code:'auth/user-not-found'};return pending.sendEmailVerification();});}
function fire(){listeners.forEach(function(f){try{f(user,profile);}catch(e){}});}
function arDigits(s){return String(s).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d);}).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);});}
function toEmail(id){var s=arDigits(id).trim().replace(/\s/g,'').toLowerCase();return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(s)?s:null;}
function errMsg(e){var c=(e&&e.code)||'';
 var m={'auth/invalid-credential':'البيانات غلط. راجع الإيميل وكلمة السر.','auth/wrong-password':'كلمة السر غلط.','auth/user-not-found':'مفيش حساب بالبيانات دي. جرّب «حساب جديد».','auth/invalid-login-credentials':'البيانات غلط. راجع الإيميل وكلمة السر.','auth/email-already-in-use':'الحساب ده موجود قبل كده. جرّب تسجيل الدخول.','auth/weak-password':'كلمة السر لازم تكون ٦ حروف أو أرقام على الأقل.','auth/invalid-email':'اكتب إيميل صحيح.','auth/too-many-requests':'محاولات كتير. استنى شوية وجرّب تاني.','auth/network-request-failed':'مفيش إنترنت دلوقتي. جرّب تاني.','auth/too-many-requests':'محاولات كتير. استنى شوية وجرّب تاني.','auth/popup-closed-by-user':'اتقفلت نافذة جوجل.','auth/operation-not-allowed':'الطريقة دي مش مفعلة.','auth/unauthorized-domain':'الدومين ده مش مسموح لتسجيل جوجل.'};
 return m[c]||'حصلت مشكلة. جرّب تاني بعد شوية.';}
function signIn(id,pass){var em=toEmail(id);if(!em)return Promise.reject({code:'auth/invalid-email'});return load().then(function(ok){if(!ok)throw{code:'auth/network-request-failed'};return auth.signInWithEmailAndPassword(em,pass);}).then(function(c){return {verified:!!c.user.emailVerified};});}
function signUp(name,id,pass){var em=toEmail(id);if(!em)return Promise.reject({code:'auth/invalid-email'});
 return load().then(function(ok){if(!ok)throw{code:'auth/network-request-failed'};return auth.createUserWithEmailAndPassword(em,pass);}).then(function(c){
  return db.collection('users').doc(c.user.uid).set({email:em,name:String(name||'').slice(0,100),role:'student',avatarId:'waving',lastActive:firebase.firestore.FieldValue.serverTimestamp()},{merge:true}).catch(function(){}).then(function(){return c.user.sendEmailVerification().catch(function(){});}).then(function(){return {verified:false};});});}
function google(){return load().then(function(ok){if(!ok)throw{code:'auth/network-request-failed'};return auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());}).then(function(){return {verified:true};});}
function reset(id){var em=toEmail(id);if(!em)return Promise.reject({code:'auth/invalid-email'});return load().then(function(ok){if(!ok)throw{code:'auth/network-request-failed'};return auth.sendPasswordResetEmail(em);});}
function signOut(){return load().then(function(){clearProg();pending=null;return auth.signOut();});}
function loadProfile(){if(!user)return Promise.resolve(null);return db.collection('users').doc(user.uid).get().then(function(d){profile=d.exists?d.data():{};return profile;}).catch(function(){profile={};return profile;});}
function saveProfile(patch){if(!user)return Promise.reject();var p={};if(patch.name!=null)p.name=String(patch.name).slice(0,100);if(patch.avatarId)p.avatarId=String(patch.avatarId).slice(0,24);
 return db.collection('users').doc(user.uid).set(p,{merge:true}).then(function(){profile=Object.assign(profile||{},p);fire();paintChip();});}
/* ---- progress lives in the account only. In this tab it sits in sessionStorage (cleared when the tab closes),
   never in localStorage; the lesson page's localStorage calls for progress keys are redirected here. ---- */
var rawGet=Storage.prototype.getItem,rawSet=Storage.prototype.setItem,rawDel=Storage.prototype.removeItem;
function isProg(k){return typeof k==='string'&&(k.indexOf(PFX)===0||k==='mm-days');}
Storage.prototype.getItem=function(k){return rawGet.call((this===localStorage&&isProg(k))?sessionStorage:this,k);};
Storage.prototype.removeItem=function(k){return rawDel.call((this===localStorage&&isProg(k))?sessionStorage:this,k);};
Storage.prototype.setItem=function(k,v){
 if(this===localStorage&&isProg(k)){rawSet.call(sessionStorage,k,v);
  if(/^bac-g2p1-l\d+$/.test(k)){try{var S=JSON.parse(v);if(S&&S.done&&Object.keys(S.done).length){var ds=days(),t=today();if(ds.indexOf(t)<0){ds.push(t);rawSet.call(sessionStorage,'mm-days',JSON.stringify(ds));}}}catch(e){}push();}
  return;}
 return rawSet.call(this,k,v);};
(function purge(){try{var del=[];for(var i=0;i<localStorage.length;i++){var n=localStorage.key(i);if(isProg(n))del.push(n);}del.forEach(function(n){rawDel.call(localStorage,n);});}catch(e){}})();
function clearProg(){try{var del=[];for(var i=0;i<sessionStorage.length;i++){var n=sessionStorage.key(i);if(isProg(n)||n==='mm-h')del.push(n);}del.forEach(function(n){rawDel.call(sessionStorage,n);});}catch(e){}}
function today(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function localKeys(){var k=[];try{for(var i=0;i<sessionStorage.length;i++){var n=sessionStorage.key(i);if(n&&/^bac-g2p1-l\d+$/.test(n))k.push(n);}}catch(e){}return k;}
function days(){try{return JSON.parse(rawGet.call(sessionStorage,'mm-days')||'[]');}catch(e){return [];}}
function localItems(){
 var out=[];localKeys().forEach(function(n){var L=n.slice(PFX.length),S;try{S=JSON.parse(rawGet.call(sessionStorage,n));}catch(e){return;}
  if(!S||!S.done)return;Object.keys(S.done).forEach(function(id){var v=S.done[id];out.push('bac2:'+L+':'+id+':'+(v&&v.open?'o':'p'+(v&&v.picked!=null?v.picked:0)));});});
 days().forEach(function(d){out.push('bac2:day:'+d);});return out;}
function merge(list){
 var byL={},ds=days(),dch=false;
 list.forEach(function(s){var m=s.split(':');if(m[0]!=='bac2')return;if(m[1]==='day'){if(ds.indexOf(m[2])<0){ds.push(m[2]);dch=true;}return;}
  (byL[m[1]]=byL[m[1]]||[]).push({id:m[2],v:m[3]});});
 if(dch)rawSet.call(sessionStorage,'mm-days',JSON.stringify(ds));
 Object.keys(byL).forEach(function(L){var key=PFX+L,S;try{S=JSON.parse(rawGet.call(sessionStorage,key));}catch(e){}
  if(!S||typeof S!=='object')S={view:'map',seg:0,sub:0,done:{},seenIntro:true};S.done=S.done||{};
  byL[L].forEach(function(x){if(!S.done[x.id])S.done[x.id]=x.v==='o'?{open:true}:{picked:+x.v.slice(1)};});
  S.seenIntro=true;rawSet.call(sessionStorage,key,JSON.stringify(S));});}
/* load this account's progress from the cloud into the tab (once per tab and account) */
var hydrating=null;
function hydrate(){
 if(!user)return Promise.resolve(false);
 if(rawGet.call(sessionStorage,'mm-h')===user.uid)return Promise.resolve(false);
 if(hydrating)return hydrating;
 hydrating=db.collection('progress').doc(user.uid).get().then(function(d){clearProg();merge((d.exists&&d.data().completed)||[]);rawSet.call(sessionStorage,'mm-h',user.uid);hydrating=null;return true;}).catch(function(){hydrating=null;return false;});
 return hydrating;}
var tm=null;
function flush(){clearTimeout(tm);if(!user)return;var add=localItems();if(!add.length)return;
 db.collection('progress').doc(user.uid).set({completed:firebase.firestore.FieldValue.arrayUnion.apply(null,add)},{merge:true}).catch(function(){});}
function push(){clearTimeout(tm);tm=setTimeout(flush,500);}
window.addEventListener('pagehide',flush);document.addEventListener('visibilitychange',function(){if(document.hidden)flush();});
function stats(){
 var items=localItems().filter(function(x){return x.indexOf('bac2:day:')!==0;}).length,ds=days().slice().sort(),set={};ds.forEach(function(d){set[d]=1;});
 var streak=0,d=new Date();if(!set[today()])d.setDate(d.getDate()-1);
 for(;;){var s=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);if(set[s]){streak++;d.setDate(d.getDate()-1);}else break;}
 return {points:items*10,streak:streak,items:items,days:ds.length};}
/* header chip */
function first(n){return String(n||'').trim().split(/\s+/)[0]||'';}
function paintChip(){
 var old=document.getElementById('mmChip');if(old)old.remove();
 var host=document.querySelector('nav .wrap'),hd=document.querySelector('.nhd');if(!host&&!hd)return;
 var a=document.createElement('a');a.id='mmChip';a.className='mm-chip';
 if(user){var av=(profile&&profile.avatarId)||'waving';if(!POSES[av])av='waving';a.href='profile.html';a.setAttribute('aria-label','حسابي');
  a.innerHTML='<img src="'+img(av)+'" alt=""><span>'+(first(profile&&profile.name)||'حسابي').replace(/</g,'')+'</span>';}
 else{a.href='login.html?next='+encodeURIComponent(location.pathname.split('/').pop()+location.search);a.setAttribute('aria-label','دخول');a.innerHTML='<span>دخول</span>';a.classList.add('guest');}
 if(host){host.insertBefore(a,host.querySelector('.mm-snd')||host.querySelector('.btn'));}
 else{hd.insertBefore(a,hd.querySelector('.mm-snd')||hd.querySelector('.nhome'));}
}
/* lessons need an account: hide the page until we know, then send visitors to login (and back) */
var GATED=/\/bac\.html$/.test(location.pathname);
function loginUrl(){return 'login.html?need=1&next='+encodeURIComponent('bac.html'+location.search);}
function show(){document.documentElement.style.visibility='';}
function gateNo(){if(GATED)location.replace(loginUrl());}
function gateOK(h){if(!GATED)return;if(h){location.reload();return;}show();}
function wa(){var f=document.querySelector('footer .fl');if(!f||f.querySelector('.wa'))return;var x=document.createElement('a');x.className='wa';x.href='https://wa.me/201063272601';x.target='_blank';x.rel='noopener';x.textContent='تواصل مع مستر مؤمن على واتساب';f.appendChild(x);}
function init(){paintChip();wa();if(/login\.html|profile\.html/.test(location.pathname)||GATED||localStorage.getItem(FLAG))load();}
if(GATED){document.documentElement.style.visibility='hidden';
 if(!localStorage.getItem(FLAG)){location.replace(loginUrl());}
 else{setTimeout(function(){if(document.documentElement.style.visibility==='hidden')show();},12000);load();}}
window.MM={load:load,hydrate:hydrate,signIn:signIn,signUp:signUp,google:google,signOut:signOut,reset:reset,recheck:recheck,resend:resend,pending:function(){return pending;},saveProfile:saveProfile,onChange:function(f){listeners.push(f);if(auth&&(user||profile))f(user,profile);},err:errMsg,stats:stats,poses:POSES,img:img,user:function(){return user;},profile:function(){return profile;}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(init,0);});else setTimeout(init,0);
})();
