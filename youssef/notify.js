/* جرس الإشعارات: يقرأ مجموعة announcements من Firestore ويعرض غير المقروء. */
(function(){
'use strict';
if(window.__mmNotify)return;window.__mmNotify=1;
var KEY='my-notif-seen',FS=['https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js','firebase-config.js'];
var items=[],seen={};
try{seen=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){}
function load(src){return new Promise(function(ok,no){if(/firebase-config/.test(src)&&window.FIREBASE_CONFIG)return ok();if(/app-compat/.test(src)&&window.firebase)return ok();if(/firestore-compat/.test(src)&&window.firebase&&firebase.firestore)return ok();var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
function seq(a){return a.reduce(function(p,s){return p.then(function(){return load(s);});},Promise.resolve());}
function grade(){try{return (window.MM&&MM.track&&MM.track())||'g1';}catch(e){return 'g1';}}
function stageOf(g){return /^g[1-6]$/.test(g)?'primary':(g==='g7az'?'azhar':'prep');}
function mine(a){var t=a.to||'all';if(t==='all')return true;var g=grade();return t==='grade:'+g||t==='stage:'+stageOf(g);}
function unread(){return items.filter(function(a){return !seen[a.id];}).length;}
var btn,badge,panel;
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function paint(){
 if(!btn)return;var n=unread();badge.textContent=n>9?'9+':n;badge.hidden=!n;
 panel.innerHTML=items.length?items.map(function(a){var d=a.createdAt&&a.createdAt.toDate?a.createdAt.toDate().toLocaleDateString('ar-EG'):'';
  var h='<div class="nt-i'+(seen[a.id]?'':' new')+'"><b>'+esc(a.title)+'</b><p>'+esc(a.body)+'</p><span>'+esc(d)+'</span>';
  if(a.link&&/^(?!javascript)/i.test(a.link))h+='<a href="'+esc(a.link)+'">فتح</a>';return h+'</div>';}).join(''):'<div class="nt-e">لا توجد إشعارات.</div>';
}
function add(){
 var host=document.querySelector('nav .wrap');if(!host||host.querySelector('.ntbtn'))return;
 var w=document.createElement('div');w.className='ntwrap';
 btn=document.createElement('button');btn.type='button';btn.className='ntbtn';btn.setAttribute('aria-label','الإشعارات');
 btn.innerHTML='<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg><i class="ntb" hidden></i>';
 badge=btn.querySelector('.ntb');panel=document.createElement('div');panel.className='ntpanel';panel.hidden=true;
 w.appendChild(btn);w.appendChild(panel);
 var a=host.querySelector('.themebtn')||host.querySelector('a.btn');host.insertBefore(w,a||null);
 btn.onclick=function(e){e.stopPropagation();panel.hidden=!panel.hidden;if(!panel.hidden){items.forEach(function(x){seen[x.id]=1;});try{localStorage.setItem(KEY,JSON.stringify(seen));}catch(e2){}setTimeout(function(){badge.hidden=true;},0);}};
 document.addEventListener('click',function(e){if(!w.contains(e.target))panel.hidden=true;});
 paint();
}
function init(){add();
 seq(FS).then(function(){if(!firebase.apps.length)firebase.initializeApp(window.FIREBASE_CONFIG);
  firebase.firestore().collection('announcements').orderBy('createdAt','desc').limit(30).onSnapshot(function(s){items=s.docs.map(function(d){var x=d.data();x.id=d.id;return x;}).filter(function(a){return a.active!==false&&mine(a);});paint();},function(){});
 }).catch(function(){});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
