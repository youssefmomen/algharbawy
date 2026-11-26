/* منصة مستر مؤمن: student accounts. Firebase Auth + Firestore (same project/rules as the old site).
   Cloud data: users/{uid} {email,name,role,avatarId,lastActive}; progress/{uid}.completed = string list:
   "bac2:<lesson>:<itemId>:p<picked>" | "bac2:<lesson>:<itemId>:o" | "bac2:day:YYYY-MM-DD".  Guest mode keeps working with localStorage. */
(function(){
'use strict';
var SDK=['https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js','firebase-config.js'];
var PFX='bac-g2p1-',DOM='@phone.mrmoamen.app',FLAG='mm-account';
var POSES={waving:'مرحبًا',thumbsup:'برافو',pointing:'ركّز',celebrating:'احتفال',trophy:'بطل',lightbulb:'فكرة',tablet:'تابلت',magnifier:'مُدقّق'};
var auth=null,db=null,loading=null,user=null,profile=null,listeners=[],pulled=false;
function img(p){return 'assets/img/mr-moamen-'+p+'.png';}
function one(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
function load(){
 if(loading)return loading;
 loading=SDK.reduce(function(p,f){return p.then(function(){return one(f);});},Promise.resolve()).then(function(){
  firebase.initializeApp(window.FIREBASE_CONFIG);auth=firebase.auth();db=firebase.firestore();
  auth.onAuthStateChanged(function(u){
   user=u;try{u?localStorage.setItem(FLAG,'1'):localStorage.removeItem(FLAG);}catch(e){}
   if(u){db.collection('users').doc(u.uid).set({email:u.email||'',role:'student',lastActive:firebase.firestore.FieldValue.serverTimestamp()},{merge:true}).catch(function(){});
    loadProfile().then(function(){return pull();}).then(function(){fire();paintChip();});}
   else{profile=null;pulled=false;fire();paintChip();}
  });return true;}).catch(function(){loading=null;return false;});
 return loading;
}
function fire(){listeners.forEach(function(f){try{f(user,profile);}catch(e){}});}
function arDigits(s){return String(s).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d);}).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);});}
function toEmail(id){
 var s=arDigits(id).trim().replace(/[\s-]/g,'');
 if(s.indexOf('@')>-1)return s.toLowerCase();
 s=s.replace(/^\+?20/,'0');if(/^1[0125]\d{8}$/.test(s))s='0'+s;
 if(/^01[0125]\d{8}$/.test(s))return s+DOM;
 return null;
}
function errMsg(e){var c=(e&&e.code)||'';
 var m={'auth/invalid-credential':'البيانات غلط. راجع رقم الموبايل أو الإيميل وكلمة السر.','auth/wrong-password':'كلمة السر غلط.','auth/user-not-found':'مفيش حساب بالبيانات دي. جرّب «حساب جديد».','auth/invalid-login-credentials':'البيانات غلط. راجع رقم الموبايل أو الإيميل وكلمة السر.','auth/email-already-in-use':'الحساب ده موجود قبل كده. جرّب تسجيل الدخول.','auth/weak-password':'كلمة السر لازم تكون ٦ حروف أو أرقام على الأقل.','auth/invalid-email':'اكتب رقم موبايل صحيح (١١ رقم) أو إيميل صحيح.','auth/network-request-failed':'مفيش إنترنت دلوقتي. جرّب تاني.','auth/too-many-requests':'محاولات كتير. استنى شوية وجرّب تاني.','auth/popup-closed-by-user':'اتقفلت نافذة جوجل.','auth/operation-not-allowed':'الطريقة دي مش مفعلة.','auth/unauthorized-domain':'الدومين ده مش مسموح لتسجيل جوجل.'};
 return m[c]||'حصلت مشكلة. جرّب تاني بعد شوية.';}
function signIn(id,pass){var em=toEmail(id);if(!em)return Promise.reject({code:'auth/invalid-email'});return load().then(function(ok){if(!ok)throw{code:'auth/network-request-failed'};return auth.signInWithEmailAndPassword(em,pass);});}
function signUp(name,id,pass){var em=toEmail(id);if(!em)return Promise.reject({code:'auth/invalid-email'});
 return load().then(function(ok){if(!ok)throw{code:'auth/network-request-failed'};return auth.createUserWithEmailAndPassword(em,pass);}).then(function(c){
  return db.collection('users').doc(c.user.uid).set({email:em,name:String(name||'').slice(0,100),role:'student',avatarId:'waving',lastActive:firebase.firestore.FieldValue.serverTimestamp()},{merge:true}).then(function(){return c;});});}
function google(){return load().then(function(ok){if(!ok)throw{code:'auth/network-request-failed'};return auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());});}
function signOut(){return load().then(function(){return auth.signOut();});}
function loadProfile(){if(!user)return Promise.resolve(null);return db.collection('users').doc(user.uid).get().then(function(d){profile=d.exists?d.data():{};return profile;}).catch(function(){profile={};return profile;});}
function saveProfile(patch){if(!user)return Promise.reject();var p={};if(patch.name!=null)p.name=String(patch.name).slice(0,100);if(patch.avatarId)p.avatarId=String(patch.avatarId).slice(0,24);
 return db.collection('users').doc(user.uid).set(p,{merge:true}).then(function(){profile=Object.assign(profile||{},p);fire();paintChip();});}
/* ---- local state <-> cloud list ---- */
function today(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function localKeys(){var k=[];try{for(var i=0;i<localStorage.length;i++){var n=localStorage.key(i);if(n&&n.indexOf(PFX)===0&&/^bac-g2p1-l\d+$/.test(n))k.push(n);}}catch(e){}return k;}
function days(){try{return JSON.parse(localStorage.getItem('mm-days')||'[]');}catch(e){return [];}}
function localItems(){
 var out=[];localKeys().forEach(function(n){var L=n.slice(PFX.length),S;try{S=JSON.parse(localStorage.getItem(n));}catch(e){return;}
  if(!S||!S.done)return;Object.keys(S.done).forEach(function(id){var v=S.done[id];out.push('bac2:'+L+':'+id+':'+(v&&v.open?'o':'p'+(v&&v.picked!=null?v.picked:0)));});});
 days().forEach(function(d){out.push('bac2:day:'+d);});return out;}
function merge(list){
 var changed=false,byL={};
 list.forEach(function(s){var m=s.split(':');if(m[0]!=='bac2')return;if(m[1]==='day'){var ds=days();if(ds.indexOf(m[2])<0){ds.push(m[2]);localStorage.setItem('mm-days',JSON.stringify(ds));}return;}
  (byL[m[1]]=byL[m[1]]||[]).push({id:m[2],v:m[3]});});
 Object.keys(byL).forEach(function(L){var key=PFX+L,S;try{S=JSON.parse(localStorage.getItem(key));}catch(e){}
  if(!S||typeof S!=='object')S={view:'map',seg:0,sub:0,done:{},seenIntro:true};S.done=S.done||{};var ch=false;
  byL[L].forEach(function(x){if(!S.done[x.id]){S.done[x.id]=x.v==='o'?{open:true}:{picked:+x.v.slice(1)};ch=true;}});
  if(ch){S.seenIntro=true;rawSet.call(localStorage,key,JSON.stringify(S));changed=true;}});
 return changed;}
function pull(){
 if(!user||pulled)return Promise.resolve();pulled=true;
 return db.collection('progress').doc(user.uid).get().then(function(d){
  var cloud=(d.exists&&d.data().completed)||[];var ch=merge(cloud);
  var set={};cloud.forEach(function(x){set[x]=1;});var add=localItems().filter(function(x){return !set[x];});
  var p=add.length?db.collection('progress').doc(user.uid).set({completed:firebase.firestore.FieldValue.arrayUnion.apply(null,add)},{merge:true}):Promise.resolve();
  return p.then(function(){if(ch&&/bac\.html/.test(location.pathname)&&!sessionStorage.getItem('mm-rl')){sessionStorage.setItem('mm-rl','1');location.reload();}});
 }).catch(function(){pulled=false;});}
var tm=null;
function push(){clearTimeout(tm);tm=setTimeout(function(){if(!user||!pulled)return;var add=localItems();if(!add.length)return;
 db.collection('progress').doc(user.uid).set({completed:firebase.firestore.FieldValue.arrayUnion.apply(null,add)},{merge:true}).catch(function(){});},1800);}
/* hook localStorage writes from the lesson page */
var rawSet=Storage.prototype.setItem;
Storage.prototype.setItem=function(k,v){rawSet.call(this,k,v);
 if(this===localStorage&&typeof k==='string'&&/^bac-g2p1-l\d+$/.test(k)){
  try{var S=JSON.parse(v);if(S&&S.done&&Object.keys(S.done).length){var ds=days(),t=today();if(ds.indexOf(t)<0){ds.push(t);rawSet.call(localStorage,'mm-days',JSON.stringify(ds));}}}catch(e){}
  push();nag();}};
/* stats */
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
/* gentle prompt (guests only, once a day, after 3 answers) */
function nag(){
 if(user||localStorage.getItem(FLAG))return;var st=stats();if(st.items<3)return;
 var until=+localStorage.getItem('mm-nag')||0;if(Date.now()<until||document.getElementById('mmNag')||document.querySelector('.overlay'))return;
 setTimeout(function(){if(user||document.querySelector('.overlay'))return;
  rawSet.call(localStorage,'mm-nag',String(Date.now()+864e5));
  var n=document.createElement('div');n.id='mmNag';n.className='mm-nag';
  n.innerHTML='<img src="'+img('thumbsup')+'" alt=""><div><b>شغلك حلو!</b><p>اعمل حساب علشان تحفظ تقدمك وتكمل من أي جهاز.</p><div class="r"><a class="y" href="login.html?mode=up&next='+encodeURIComponent(location.pathname.split('/').pop()+location.search)+'">احفظ تقدمي</a><button type="button">مش دلوقتي</button></div></div>';
  n.querySelector('button').onclick=function(){n.remove();};document.body.appendChild(n);setTimeout(function(){n.remove();},15000);},2500);}
function init(){paintChip();var r=false;try{r=!!localStorage.getItem(FLAG);}catch(e){}
 if(r||/login\.html|profile\.html/.test(location.pathname))load();}
window.MM={load:load,signIn:signIn,signUp:signUp,google:google,signOut:signOut,saveProfile:saveProfile,onChange:function(f){listeners.push(f);if(auth&&(user||profile))f(user,profile);},err:errMsg,stats:stats,poses:POSES,img:img,user:function(){return user;},profile:function(){return profile;}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(init,0);});else setTimeout(init,0);
})();
