/* شريط الإعلان وجدول المواعيد: يقرآن من announcements (kind: bar / sched). */
(function(){
'use strict';
if(window.__mmBoard)return;window.__mmBoard=1;
var FS=['https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js','firebase-config.js'];
function load(src){return new Promise(function(ok,no){if(/firebase-config/.test(src)&&window.FIREBASE_CONFIG)return ok();if(/app-compat/.test(src)&&window.firebase)return ok();if(/firestore-compat/.test(src)&&window.firebase&&firebase.firestore)return ok();var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
function seq(a){return a.reduce(function(p,s){return p.then(function(){return load(s);});},Promise.resolve());}
function stageOf(g){return /^g[1-6]$/.test(g)?'primary':(g==='g7az'?'azhar':'prep');}
function myStage(){var s='';try{s=localStorage.getItem('my-stage')||'';}catch(e){}if(/^(primary|prep|azhar)$/.test(s))return s;var g='g1';try{g=(window.MM&&MM.track&&MM.track())||'g1';}catch(e){}return stageOf(g);}
function mine(a){var t=a.to||'all',st=myStage();return t==='all'||t==='stage:'+st;}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
var docs=[];
function today(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function fmt(s){var p=String(s).split('-');if(p.length!==3)return s;var d=new Date(+p[0],+p[1]-1,+p[2]);return d.toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'});}
function bar(){
 var old=document.getElementById('mmBar');if(old)old.remove();
 var b=docs.filter(function(a){return a.kind==='bar'&&a.active!==false&&mine(a)&&a.text;})[0];
 if(!b)return;var k='my-bar-closed',closed='';try{closed=localStorage.getItem(k)||'';}catch(e){}
 if(closed===b.id)return;
 var nav=document.querySelector('nav');if(!nav)return;
 var d=document.createElement('div');d.id='mmBar';d.className='mmbar';d.setAttribute('role','status');
 d.innerHTML='<div class="wrap"><span>'+esc(b.text)+'</span><button type="button" aria-label="إغلاق">إغلاق</button></div>';
 d.querySelector('button').onclick=function(){d.remove();try{localStorage.setItem(k,b.id);}catch(e){}};
 nav.parentNode.insertBefore(d,nav.nextSibling);
}
function sched(){
 var old=document.getElementById('mmSched');if(old)old.remove();
 var anchor=document.getElementById('grades');if(!anchor)return;
 var t=today(),L=docs.filter(function(a){return a.kind==='sched'&&a.active!==false&&mine(a)&&a.date&&a.date>=t;}).sort(function(a,b){return a.date<b.date?-1:1;}).slice(0,6);
 if(!L.length)return;
 var s=document.createElement('section');s.id='mmSched';s.className='mmsched';
 s.innerHTML='<div class="wrap"><div class="sh center"><h2>المواعيد القادمة</h2><p>الامتحانات وحصص المراجعة لمرحلتك</p></div><div class="mmsl">'+L.map(function(a){return '<div class="mmsi '+(a.type==='exam'?'ex':'rv')+'"><span class="mmst">'+(a.type==='exam'?'امتحان':'مراجعة')+'</span><b>'+esc(a.title)+'</b><span class="mmsd">'+esc(fmt(a.date))+'</span>'+(a.note?'<small>'+esc(a.note)+'</small>':'')+'</div>';}).join('')+'</div></div>';
 anchor.parentNode.insertBefore(s,anchor.nextSibling);
}
function init(){
 seq(FS).then(function(){if(!firebase.apps.length)firebase.initializeApp(window.FIREBASE_CONFIG);
  firebase.firestore().collection('announcements').orderBy('createdAt','desc').limit(60).onSnapshot(function(s){docs=s.docs.map(function(d){var x=d.data();x.id=d.id;return x;});bar();sched();},function(){});
 }).catch(function(){});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
