/* منصة مستر مؤمن: student accounts. Firebase Auth + Firestore (same project/rules as the old site).
   Cloud data: users/{uid} {email,name,role,avatarId,lastActive}; progress/{uid}.completed = string list:
   "g1:<lesson>:<itemId>:p<picked>" | "g1:<lesson>:<itemId>:o" | "g1:day:YYYY-MM-DD".  Email must be verified (Google counts as verified). */
(function(){
'use strict';
try{history.scrollRestoration='manual';}catch(e){}
function top(){if(!location.hash)window.scrollTo(0,0);}
top();window.addEventListener('DOMContentLoaded',top);window.addEventListener('load',function(){top();setTimeout(top,60);});window.addEventListener('pageshow',function(e){if(e.persisted)top();});
var SDK=['https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js','firebase-config.js'];
var DOM='@phone.mryoussef.app',FLAG='my-account';
var PROGKEY=/^ar-([a-z0-9]+)-([A-Za-z0-9_]+)$/;
var POSES={waving:'مرحبًا',thumbsup:'برافو',pointing:'ركّز',celebrating:'احتفال',trophy:'بطل',tablet:'تابلت',magnifier:'مُدقّق'};
var TRACKS={g1:{name:'أولى ابتدائي',live:true},g2:{name:'تانية ابتدائي'},g3:{name:'تالتة ابتدائي'},g4:{name:'رابعة ابتدائي'},g5:{name:'خامسة ابتدائي'},g6:{name:'سادسة ابتدائي'},g7:{name:'أولى إعدادي'},g8:{name:'تانية إعدادي'},g9:{name:'تالتة إعدادي'}},auth=null,db=null,loading=null,user=null,pending=null,profile=null,listeners=[];

/* student avatars: simple hand-drawn SVG faces (no photos of the teacher) */
var K='#22303c',HC=['#1b1410','#3a2a1c','#6b3f1d','#b5651d','#d9a441','#c0456b','#2b6cb0','#7a4bb0'],SKIN=['#f9d9bd','#f1c9a5','#e8b48a','#c98e66','#8d5a3b','#5e3a26'],
 SC=['#2b6cb0','#1f4d3a','#c0456b','#e07a3a','#7a4bb0','#f5b301','#22303c','#2f6b57'],BG=['#f5b301','#f6b8c4','#bfe3d0','#cfe0f5','#fde6a8','#d9d2f2','#f9d2b8','#c9ecf0'],
 AVO={hair:['بدون شعر','قصير','كيرلي','شوكي','طويل','كاريه','ذيل','كعكة','خفيف'],glasses:['بدون','دايرة','مربعة'],hijab:['من غير','حجاب'],shirt:['تيشرت','هودي','قميص'],eyes:['عادية','مبتسمة','لامعة'],mouth:['ابتسامة','ضحكة','غمزة','هادئة'],acc:['بدون','ربطة راس','فيونكة','سماعة'],hc:HC,skin:SKIN,sc:SC,bg:BG},
 /* config = [hair,hairColor,skin,glasses,hijab,shirtStyle,shirtColor,eyes,mouth,bg,accessory]; saved as avatarId "b"+11 base-36 chars */
 LIM=[9,8,6,3,2,3,8,3,4,8,4],
 PRE=[[1,0,2,0,0,0,0,0,0,0,0],[0,5,2,0,1,0,5,0,0,1,0],[1,0,3,1,0,0,1,0,0,2,0],[4,2,1,0,0,0,3,0,0,3,0],[0,7,2,1,1,0,7,0,0,4,0],[2,0,4,0,0,0,5,0,0,5,0],[6,0,1,0,0,0,4,0,0,6,0],[3,1,3,1,0,0,2,0,0,7,0],[0,6,2,0,1,0,6,0,0,4,0],[5,0,4,0,0,0,0,0,0,1,0],[3,3,1,0,0,0,3,0,0,2,0],[7,0,3,1,0,0,4,0,0,4,0]],avN=0;
function avEnc(c){return 'b'+c.map(function(n){return n.toString(36);}).join('');}
function avDec(id){id=String(id||'');var m=/^st(\d+)$/.exec(id);if(m){var n=+m[1];return PRE[(n>=1&&n<=PRE.length)?n-1:0].slice();}
 if(/^b[0-9a-z]{11}$/.test(id)){var c=id.slice(1).split('').map(function(x){return parseInt(x,36);});for(var i=0;i<11;i++)if(!(c[i]>=0&&c[i]<LIM[i]))return null;return c;}return null;}
function avRand(){return LIM.map(function(n){return Math.floor(Math.random()*n);});}
function avSvg(id,size){var c=Array.isArray(id)?id:(avDec(id)||PRE[0]),o='',f='fill="',st='stroke="'+K+'" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"',cid='avc'+(++avN);
 var hair=c[0],hc=HC[c[1]],skin=SKIN[c[2]],gl=c[3],hj=c[4]===1,shs=c[5],shc=hj?hc:SC[c[6]],eyes=c[7],mo=c[8],bg=BG[c[9]],acc=c[10],hs=f+hc+'" '+st;
 o+='<circle cx="50" cy="50" r="48" '+f+bg+'" '+st+'/><clipPath id="'+cid+'"><circle cx="50" cy="50" r="47"/></clipPath><g clip-path="url(#'+cid+')">';
 if(!hj&&hair===4)o+='<path d="M27 48Q27 22 50 22Q73 22 73 48L76 84L24 84Z" '+hs+'/>';
 if(!hj&&hair===5)o+='<path d="M27 50Q27 22 50 22Q73 22 73 50L72 66L28 66Z" '+hs+'/>';
 if(hj)o+='<path d="M24 52Q22 18 50 18Q78 18 76 52Q78 80 66 100L34 100Q22 80 24 52Z" '+f+shc+'" '+st+'/>';
 else{o+='<path d="M12 100Q12 74 50 72Q88 74 88 100Z" '+f+shc+'" '+st+'/><rect x="44" y="60" width="12" height="14" '+f+skin+'" '+st+'/>';
  if(shs===1)o+='<path d="M31 76Q33 64 50 64Q67 64 69 76Q50 90 31 76Z" '+f+shc+'" '+st+'/><path d="M45 82v8M55 82v8" fill="none" '+st+' stroke-width="2.4"/>';
  else if(shs===2)o+='<path d="M39 72L50 86L61 72Z" '+f+'#fff" '+st+'/>';
  else o+='<path d="M41 73Q50 82 59 73" fill="none" '+st+'/>';
  o+='<circle cx="30" cy="48" r="4.5" '+f+skin+'" '+st+'/><circle cx="70" cy="48" r="4.5" '+f+skin+'" '+st+'/>';}
 o+='<circle cx="50" cy="'+(hj?49:46)+'" r="'+(hj?17:20)+'" '+f+skin+'" '+st+'/>';
 if(!hj){if(hair===1||hair===4||hair===5||hair===6||hair===7)o+='<path d="M29 44Q29 23 50 23Q71 23 71 44Q62 33 50 33Q38 33 29 44Z" '+hs+'/>';
  if(hair===8)o+='<path d="M31 42Q31 28 50 28Q69 28 69 42Q60 36 50 36Q40 36 31 42Z" '+hs+'/>';
  if(hair===6)o+='<circle cx="72" cy="40" r="7" '+hs+'/>';
  if(hair===7)o+='<circle cx="50" cy="19" r="8" '+hs+'/>';
  if(hair===2)[[34,30],[44,25],[56,25],[66,30],[30,40],[70,40]].forEach(function(p){o+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="8" '+hs+'/>';});
  if(hair===3)o+='<path d="M29 42L32 24L40 33L46 20L54 33L62 22L68 34L71 42Q62 32 50 32Q38 32 29 42Z" '+hs+'/>';}
 else o+='<path d="M33 46Q33 31 50 31Q67 31 67 46" fill="none" '+st+'/>';
 if(acc===1)o+='<path d="M30 37Q50 25 70 37" fill="none" stroke="'+K+'" stroke-width="8" stroke-linecap="round"/><path d="M30 37Q50 25 70 37" fill="none" stroke="'+SC[c[6]]+'" stroke-width="4" stroke-linecap="round"/>';
 if(acc===2)o+='<path d="M64 30L76 22L76 38Z" '+f+'#c0456b" '+st+' stroke-width="2.4"/><path d="M64 30L52 22L52 38Z" '+f+'#c0456b" '+st+' stroke-width="2.4"/><circle cx="64" cy="30" r="4" '+f+'#f5b301" '+st+' stroke-width="2.4"/>';
 if(acc===3)o+='<path d="M28 48Q28 18 50 18Q72 18 72 48" fill="none" '+st+' stroke-width="4"/><rect x="23" y="44" width="8" height="14" rx="3" '+f+'#f5b301" '+st+' stroke-width="2.4"/><rect x="69" y="44" width="8" height="14" rx="3" '+f+'#f5b301" '+st+' stroke-width="2.4"/>';
 var ey=hj?49:47;
 if(eyes===0)o+='<circle cx="43" cy="'+ey+'" r="2.4" fill="'+K+'"/><circle cx="57" cy="'+ey+'" r="2.4" fill="'+K+'"/>';
 else if(eyes===1)o+='<path d="M39.5 '+(ey+1)+'Q43 '+(ey-4)+' 46.5 '+(ey+1)+'M53.5 '+(ey+1)+'Q57 '+(ey-4)+' 60.5 '+(ey+1)+'" fill="none" '+st+' stroke-width="2.4"/>';
 else o+='<circle cx="43" cy="'+ey+'" r="3.8" fill="#fff" '+st+' stroke-width="1.6"/><circle cx="57" cy="'+ey+'" r="3.8" fill="#fff" '+st+' stroke-width="1.6"/><circle cx="43.6" cy="'+ey+'" r="1.8" fill="'+K+'"/><circle cx="57.6" cy="'+ey+'" r="1.8" fill="'+K+'"/>';
 var my=ey+8;
 if(mo===0)o+='<path d="M43 '+my+'Q50 '+(my+6)+' 57 '+my+'" fill="none" '+st+'/>';
 else if(mo===1)o+='<path d="M42 '+(my-1)+'Q50 '+(my+11)+' 58 '+(my-1)+'Z" '+f+'#fff" '+st+' stroke-width="2.4"/>';
 else if(mo===2)o+='<path d="M44 '+(my+1)+'Q52 '+(my+5)+' 58 '+(my-2)+'" fill="none" '+st+'/>';
 else o+='<path d="M45 '+(my+1)+'Q50 '+(my+4)+' 55 '+(my+1)+'" fill="none" '+st+'/>';
 if(gl===1)o+='<circle cx="43" cy="'+ey+'" r="7" fill="none" '+st+' stroke-width="2.4"/><circle cx="57" cy="'+ey+'" r="7" fill="none" '+st+' stroke-width="2.4"/><path d="M50 '+ey+'h0" '+st+'/>';
 if(gl===2)o+='<rect x="35.5" y="'+(ey-6)+'" width="14" height="12" rx="3" fill="none" '+st+' stroke-width="2.4"/><rect x="50.5" y="'+(ey-6)+'" width="14" height="12" rx="3" fill="none" '+st+' stroke-width="2.4"/><path d="M49.5 '+ey+'h1" '+st+' stroke-width="2.4"/>';
 o+='</g>';
 return '<svg class="avs" viewBox="0 0 100 100" width="'+(size||28)+'" height="'+(size||28)+'" aria-hidden="true">'+o+'</svg>';}
function avId(p,uid){var a=p&&p.avatarId;if(typeof a==='string'&&avDec(a))return a;var h=0,u=String(uid||'x');for(var i=0;i<u.length;i++)h=(h*31+u.charCodeAt(i))>>>0;return 'st'+(h%PRE.length+1);}
function img(p){return 'assets/img/mr-youssef-wave.png';}
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
 migrateLocal();
 db.collection('users').doc(u.uid).set({email:u.email||'',role:'student',lastActive:firebase.firestore.FieldValue.serverTimestamp()},{merge:true}).catch(function(){});
 loadProfile().then(function(){return hydrate();}).then(function(h){fire();paintChip();gateOK(h);});}
function recheck(){return load().then(function(){if(!pending)return !!user;return pending.reload().then(function(){if(pending&&pending.emailVerified){var u=pending;pending=null;activate(u);return true;}return false;});});}
function resend(){return load().then(function(){if(!pending)throw{code:'auth/user-not-found'};return pending.sendEmailVerification();});}
function track(){var t=rawGet.call(sessionStorage,'my-track');return TRACKS[t]?t:'g1';}
function setTrack(id){if(!TRACKS[id])return Promise.reject();var u=auth&&auth.currentUser;rawSet.call(sessionStorage,'my-track',id);
 if(!u){fire();return Promise.resolve();}
 var ref=db.collection('progress').doc(u.uid),FV=firebase.firestore.FieldValue,others=Object.keys(TRACKS).filter(function(k){return k!==id;}).map(function(k){return 'mm:track:'+k;});
 return ref.set({completed:FV.arrayRemove.apply(null,others)},{merge:true}).then(function(){return ref.set({completed:FV.arrayUnion('mm:track:'+id)},{merge:true});}).then(function(){fire();});}
function links(){var t=track(),n=TRACKS[t].name;
 document.querySelectorAll('nav .btn[href^="track.html"],.cta .btn[href^="track.html"],.teach .btn[href^="track.html"]').forEach(function(a){a.setAttribute('href','track.html?t='+t);});
 var h=document.querySelector('.cta .btn[href^="track.html"]');if(h&&/^ابدأ من /.test(h.textContent))h.textContent='ابدأ من '+n;}
function trackPage(){if(!/\/track\.html$/.test(location.pathname))return;var t=new URLSearchParams(location.search).get('t')||'g1';if(t==='g1'||!TRACKS[t])return;
 var c=document.querySelector('.crumbs'),h=document.querySelector('.hero h1'),u=document.getElementById('units'),tb=document.querySelector('.tabs'),dm=document.querySelector('.demo'),sj=document.querySelector('.hero .subj');
 if(c)c.textContent='الرئيسية ‹ المسارات ‹ '+TRACKS[t].name;if(h)h.innerHTML=TRACKS[t].name+'<br><em style="font-style:normal;color:var(--yellow)">قريبًا</em>';if(sj)sj.hidden=true;if(tb)tb.hidden=true;if(dm)dm.hidden=true;
 if(u)u.innerHTML='<div class="hint">هذا المسار ما زال قيد التجهيز. فور صدوره ستجده هنا، وتقدّمك محفوظ في حسابك.<br><a class="pbtn" href="track.html?t=g1" style="display:inline-block;width:auto;margin-top:10px;text-decoration:none">روح لأولى ابتدائي</a></div>';}
function fire(){links();listeners.forEach(function(f){try{f(user,profile);}catch(e){}});}
function arDigits(s){return String(s).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d);}).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);});}
function toEmail(id){var s=arDigits(id).trim().replace(/\s/g,'').toLowerCase();return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(s)?s:null;}
function errMsg(e){var c=(e&&e.code)||'';
 var m={'auth/invalid-credential':'البيانات غير صحيحة. راجع البريد الإلكتروني وكلمة السر.','auth/wrong-password':'كلمة السر غير صحيحة.','auth/user-not-found':'لا يوجد حساب بهذه البيانات. جرّب «حساب جديد».','auth/invalid-login-credentials':'البيانات غير صحيحة. راجع البريد الإلكتروني وكلمة السر.','auth/email-already-in-use':'هذا الحساب موجود بالفعل. جرّب تسجيل الدخول.','auth/weak-password':'كلمة السر يجب أن تكون ٦ أحرف أو أرقام على الأقل.','auth/invalid-email':'اكتب بريدًا إلكترونيًا صحيحًا.','auth/too-many-requests':'محاولات كثيرة. انتظر قليلًا وحاول مجددًا.','auth/network-request-failed':'لا يوجد اتصال بالإنترنت الآن. حاول مجددًا.','auth/too-many-requests':'محاولات كثيرة. انتظر قليلًا وحاول مجددًا.','auth/popup-closed-by-user':'أُغلقت نافذة جوجل.','auth/operation-not-allowed':'هذه الطريقة غير مفعّلة.','auth/unauthorized-domain':'هذا النطاق غير مسموح له بتسجيل جوجل.'};
 return m[c]||'حدثت مشكلة. حاول مجددًا بعد قليل.';}
function signIn(id,pass){var em=toEmail(id);if(!em)return Promise.reject({code:'auth/invalid-email'});return load().then(function(ok){if(!ok)throw{code:'auth/network-request-failed'};return auth.signInWithEmailAndPassword(em,pass);}).then(function(c){return {verified:!!c.user.emailVerified};});}
function signUp(name,id,pass){var em=toEmail(id);if(!em)return Promise.reject({code:'auth/invalid-email'});
 return load().then(function(ok){if(!ok)throw{code:'auth/network-request-failed'};return auth.createUserWithEmailAndPassword(em,pass);}).then(function(c){
  return db.collection('users').doc(c.user.uid).set({email:em,name:String(name||'').slice(0,100),role:'student',avatarId:avId(null,c.user.uid),lastActive:firebase.firestore.FieldValue.serverTimestamp()},{merge:true}).catch(function(){}).then(function(){return c.user.sendEmailVerification().catch(function(){});}).then(function(){return {verified:false};});});}
function google(){return load().then(function(ok){if(!ok)throw{code:'auth/network-request-failed'};return auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());}).then(function(){return {verified:true};});}
function reset(id){var em=toEmail(id);if(!em)return Promise.reject({code:'auth/invalid-email'});return load().then(function(ok){if(!ok)throw{code:'auth/network-request-failed'};return auth.sendPasswordResetEmail(em);});}
function signOut(){return load().then(function(){clearProg();pending=null;return auth.signOut();});}
function loadProfile(){if(!user)return Promise.resolve(null);return db.collection('users').doc(user.uid).get().then(function(d){profile=d.exists?d.data():{};if(!avDec(profile.avatarId)){var nid=avId(profile,user.uid);profile.avatarId=nid;db.collection('users').doc(user.uid).set({avatarId:nid},{merge:true}).catch(function(){});}return profile;}).catch(function(){profile={};return profile;});}
function saveProfile(patch){if(!user)return Promise.reject();var p={};if(patch.avatarData!=null){var ad=String(patch.avatarData);if(ad.length>100000)return Promise.reject({code:'big'});p.avatarData=ad?ad:firebase.firestore.FieldValue.delete();}if(patch.name!=null)p.name=String(patch.name).slice(0,100);if(patch.avatarId)p.avatarId=String(patch.avatarId).slice(0,24);
 return db.collection('users').doc(user.uid).set(p,{merge:true}).then(function(){profile=Object.assign(profile||{},p);if(patch.avatarData!=null){if(patch.avatarData)profile.avatarData=patch.avatarData;else delete profile.avatarData;}fire();paintChip();});}
/* progress saves on the device (localStorage) with no account. When a student signs in, it moves to this
   tab's sessionStorage and syncs to the cloud; the lesson page's localStorage calls for progress keys are redirected here. */
var rawGet=Storage.prototype.getItem,rawSet=Storage.prototype.setItem,rawDel=Storage.prototype.removeItem;
function isProg(k){return typeof k==='string'&&(PROGKEY.test(k)||k==='my-days');}
function pStore(){return user?sessionStorage:localStorage;}
Storage.prototype.getItem=function(k){return rawGet.call((this===localStorage&&isProg(k)&&user)?sessionStorage:this,k);};
Storage.prototype.removeItem=function(k){return rawDel.call((this===localStorage&&isProg(k)&&user)?sessionStorage:this,k);};
Storage.prototype.setItem=function(k,v){
 if(this===localStorage&&isProg(k)){var st=pStore();rawSet.call(st,k,v);
  if(PROGKEY.test(k)){try{var S=JSON.parse(v);if(S&&S.done&&Object.keys(S.done).length){var ds=days(),t=today();if(ds.indexOf(t)<0){ds.push(t);rawSet.call(st,'my-days',JSON.stringify(ds));}}}catch(e){}push();}
  return;}
 return rawSet.call(this,k,v);};
/* on sign-in, move any on-device guest progress into the account's tab storage (then hydrate merges the cloud copy) */
function migrateLocal(){try{var del=[];for(var i=0;i<localStorage.length;i++){var n=localStorage.key(i);if(isProg(n))del.push(n);}del.forEach(function(n){try{var v=rawGet.call(localStorage,n);if(v!=null&&rawGet.call(sessionStorage,n)==null)rawSet.call(sessionStorage,n,v);}catch(e){}rawDel.call(localStorage,n);});}catch(e){}}
function clearProg(){try{var del=[];for(var i=0;i<sessionStorage.length;i++){var n=sessionStorage.key(i);if(isProg(n)||n==='my-h'||n==='my-track')del.push(n);}del.forEach(function(n){rawDel.call(sessionStorage,n);});}catch(e){}}
function today(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function localKeys(){var k=[];try{var st=pStore();for(var i=0;i<st.length;i++){var n=st.key(i);if(n&&PROGKEY.test(n))k.push(n);}}catch(e){}return k;}
function days(){try{return JSON.parse(rawGet.call(pStore(),'my-days')||'[]');}catch(e){return [];}}
function localItems(){
 var out=[];localKeys().forEach(function(n){var mk=PROGKEY.exec(n);if(!mk)return;var S;try{S=JSON.parse(rawGet.call(pStore(),n));}catch(e){return;}
  if(!S||!S.done)return;Object.keys(S.done).forEach(function(id){var v=S.done[id];out.push(mk[1]+':'+mk[2]+':'+id+':'+(v&&v.open?'o':'p'+(v&&v.picked!=null?v.picked:0)));});});
 days().forEach(function(d){out.push('g1:day:'+d);});return out;}
function merge(list){
 var byL={},ds=days(),dch=false;
 list.forEach(function(s){var m=s.split(':');if(m[0]==='mm'||!/^[a-z0-9]+$/.test(m[0]))return;
  if(m.length===3&&m[1]==='day'){if(ds.indexOf(m[2])<0){ds.push(m[2]);dch=true;}return;}
  if(m.length!==4||!/^[A-Za-z0-9_]+$/.test(m[1]))return;
  (byL[m[0]+'-'+m[1]]=byL[m[0]+'-'+m[1]]||[]).push({id:m[2],v:m[3]});});
 if(dch)rawSet.call(sessionStorage,'my-days',JSON.stringify(ds));
 Object.keys(byL).forEach(function(L){var key='ar-'+L,S;try{S=JSON.parse(rawGet.call(sessionStorage,key));}catch(e){}
  if(!S||typeof S!=='object')S={view:'map',seg:0,sub:0,step:0,done:{},seenIntro:true};S.done=S.done||{};
  byL[L].forEach(function(x){if(!S.done[x.id])S.done[x.id]=x.v==='o'?{open:true}:{picked:+x.v.slice(1)};});
  S.seenIntro=true;rawSet.call(sessionStorage,key,JSON.stringify(S));});}
/* load this account's progress from the cloud into the tab (once per tab and account) */
var hydrating=null;
function hydrate(){
 if(!user)return Promise.resolve(false);
 if(rawGet.call(sessionStorage,'my-h')===user.uid)return Promise.resolve(false);
 if(hydrating)return hydrating;
 hydrating=db.collection('progress').doc(user.uid).get().then(function(d){var keep=localItems();clearProg();var L=(d.exists&&d.data().completed)||[];L.forEach(function(x){if(typeof x==='string'&&x.indexOf('mm:track:')===0&&TRACKS[x.slice(9)])rawSet.call(sessionStorage,'my-track',x.slice(9));});merge(keep.concat(L));rawSet.call(sessionStorage,'my-h',user.uid);hydrating=null;push();return true;}).catch(function(){hydrating=null;return false;});
 return hydrating;}
var tm=null;
function flush(){clearTimeout(tm);if(!user)return;var add=localItems();if(!add.length)return;
 db.collection('progress').doc(user.uid).set({completed:firebase.firestore.FieldValue.arrayUnion.apply(null,add)},{merge:true}).catch(function(){});}
function push(){clearTimeout(tm);tm=setTimeout(flush,500);}
window.addEventListener('pagehide',flush);document.addEventListener('visibilitychange',function(){if(document.hidden)flush();});
function stats(){
 var items=localItems().filter(function(x){return x.split(':')[1]!=='day';}).length,ds=days().slice().sort(),set={};ds.forEach(function(d){set[d]=1;});
 var streak=0,d=new Date();if(!set[today()])d.setDate(d.getDate()-1);
 for(;;){var s=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);if(set[s]){streak++;d.setDate(d.getDate()-1);}else break;}
 return {points:items,streak:streak,items:items,days:ds.length};} /* points = stars: 1 per answered item; old 10-per-item totals were derived, so they convert by /10 automatically */
/* header chip */
function first(n){return String(n||'').trim().split(/\s+/)[0]||'';}
function paintChip(){
 var old=document.getElementById('mmChip');if(old)old.remove();
 var host=document.querySelector('nav .wrap'),hd=document.querySelector('.nhd');if(!host&&!hd)return;
 var a=document.createElement('a');a.id='mmChip';a.className='mm-chip';
 if(user){a.href='profile.html';a.setAttribute('aria-label','حسابي');
  var ph=profile&&typeof profile.avatarData==='string'&&profile.avatarData.indexOf('data:image/jpeg')===0;a.innerHTML=(ph?'<img class="ph" src="'+profile.avatarData+'" alt="">':avSvg(avId(profile,user.uid),28))+'<span>'+(first(profile&&profile.name)||'حسابي').replace(/</g,'')+'</span>';}
 else{var gn=gname();a.href='profile.html';a.setAttribute('aria-label','حسابي');a.innerHTML='<span>'+(gn?gn.replace(/</g,''):'حسابي')+'</span>';a.classList.add('guest');}
 if(host){host.insertBefore(a,host.querySelector('.mm-snd')||host.querySelector('.btn'));}
 else{hd.insertBefore(a,hd.querySelector('.mm-snd')||hd.querySelector('.nhome'));}
}
/* no sign-in requirement: lessons open for everyone and progress saves on the device. Accounts stay optional (cloud sync). */
var GATED=/\/lesson\.html$/.test(location.pathname);
function show(){document.documentElement.style.visibility='';}
function gateNo(){show();}
function gateOK(h){if(GATED&&h){location.reload();return;}show();}
function gname(){try{return rawGet.call(localStorage,'my-name')||'';}catch(e){return '';}}
function setGname(n){n=String(n||'').trim().slice(0,60);try{if(n)rawSet.call(localStorage,'my-name',n);else rawDel.call(localStorage,'my-name');}catch(e){}paintChip();}
function wa(){links();trackPage();var f=document.querySelector('footer .fl');if(!f||f.querySelector('.wa'))return;var x=document.createElement('a');x.className='wa';x.href='https://wa.me/201063272601';x.target='_blank';x.rel='noopener';x.textContent='تواصل مع مستر يوسف عبر واتساب';f.appendChild(x);}
function init(){paintChip();wa();if(/login\.html|profile\.html/.test(location.pathname)||localStorage.getItem(FLAG))load();}
window.MM={load:load,hydrate:hydrate,gname:gname,setGname:setGname,signIn:signIn,signUp:signUp,google:google,signOut:signOut,setTrack:setTrack,track:track,tracks:TRACKS,reset:reset,recheck:recheck,resend:resend,pending:function(){return pending;},saveProfile:saveProfile,onChange:function(f){listeners.push(f);if(auth&&(user||profile))f(user,profile);},err:errMsg,stats:stats,poses:POSES,img:img,avSvg:avSvg,avIds:function(){return PRE.map(function(x,i){return 'st'+(i+1);});},avEnc:avEnc,avDec:avDec,avRand:avRand,AVO:AVO,LIM:LIM,avId:avId,user:function(){return user;},profile:function(){return profile;}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(init,0);});else setTimeout(init,0);
})();
