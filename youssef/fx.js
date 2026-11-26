(function(){
'use strict';
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var KEY='my-sound',ctx=null,master=null,on=true;
try{on=localStorage.getItem(KEY)!=='0';}catch(e){}
function ac(){
 if(!on)return null;
 if(!ctx){var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ctx=new C();master=ctx.createGain();master.gain.value=.5;master.connect(ctx.destination);}
 if(ctx.state==='suspended')ctx.resume();
 return ctx;
}
function tone(f,t0,d,type,g,f2){
 var c=ac();if(!c)return;var o=c.createOscillator(),v=c.createGain(),t=c.currentTime+t0;
 o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
 v.gain.setValueAtTime(0.0001,t);v.gain.exponentialRampToValueAtTime(g||.2,t+.012);v.gain.exponentialRampToValueAtTime(0.0001,t+d);
 o.connect(v);v.connect(master);o.start(t);o.stop(t+d+.03);
}
var S={
 tap:function(){tone(620,0,.07,'sine',.12,900);},
 pop:function(){tone(300,0,.12,'sine',.18,720);tone(900,.05,.08,'sine',.06);},
 ok:function(){tone(523.25,0,.16,'sine',.2);tone(659.25,.09,.16,'sine',.2);tone(783.99,.18,.28,'sine',.2);},
 no:function(){tone(392,0,.2,'triangle',.11,330);tone(330,.14,.3,'triangle',.09,294);},
 done:function(){[523.25,659.25,783.99,1046.5].forEach(function(f,i){tone(f,i*.11,.3,'sine',.2);});tone(1568,.5,.5,'sine',.08);}
};
var lastDone=0;window.mmSound=function(n){if(n==='done')lastDone=Date.now();if(S[n])S[n]();};
/* toggle */
var btn;
function paintBtn(){if(btn){btn.setAttribute('aria-pressed',on?'true':'false');btn.setAttribute('aria-label',on?'الصوت شغال، اضغط لإيقافه':'الصوت متوقف، اضغط لتشغيله');btn.title=btn.getAttribute('aria-label');}}
function mkBtn(){
 btn=document.createElement('button');btn.type='button';btn.className='mm-snd';
 btn.innerHTML='<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path class="w" d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/><path class="x" d="M16 9l5 6M21 9l-5 6"/></svg>';
 btn.onclick=function(e){e.stopPropagation();on=!on;try{localStorage.setItem(KEY,on?'1':'0');}catch(x){}paintBtn();if(on){ac();S.pop();}};
 var nav=document.querySelector('nav .wrap'),hd=document.querySelector('.nhd');
 if(nav){var b=nav.querySelector('.btn');nav.insertBefore(btn,b||null);}
 else if(hd){hd.insertBefore(btn,hd.querySelector('.nhome'));}
 else{btn.style.cssText='position:fixed;top:10px;left:10px;z-index:90';document.body.appendChild(btn);}
 paintBtn();
}
/* confetti */
function confetti(){
 if(RM)return;
 var cv=document.createElement('canvas');cv.className='mm-conf';var dpr=Math.min(window.devicePixelRatio||1,2);
 var W=cv.width=innerWidth*dpr,H=cv.height=innerHeight*dpr;document.body.appendChild(cv);var g=cv.getContext('2d');
 var cols=['#f5b301','#d64545','#2b6cb0','#1f4d3a','#f6d5d8','#cfe8d5'],P=[],n=innerWidth<500?60:90;
 for(var i=0;i<n;i++)P.push({x:W/2+(Math.random()-.5)*W*.3,y:H*.35,vx:(Math.random()-.5)*14*dpr,vy:(-Math.random()*13-4)*dpr,s:(5+Math.random()*6)*dpr,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:cols[i%cols.length]});
 var t0=performance.now();
 (function f(t){var e=t-t0;g.clearRect(0,0,W,H);
  P.forEach(function(p){p.vy+=.35*dpr;p.vx*=.992;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;g.save();g.globalAlpha=Math.max(0,1-e/2400);g.translate(p.x,p.y);g.rotate(p.r);g.fillStyle=p.c;g.fillRect(-p.s/2,-p.s/3,p.s,p.s*.6);g.restore();});
  if(e<2400)requestAnimationFrame(f);else cv.remove();})(t0);
}
/* click handling */
var lastClick=0,lastOpt=0;
document.addEventListener('click',function(e){
 var t=e.target.closest&&e.target.closest('button,a,.card,.ls,.opt');if(!t||t===btn)return;
 lastClick=Date.now();
 if(t.classList.contains('opt')||t.hasAttribute('data-mq')){lastOpt=Date.now();return;}
 S.tap();
 if(t.tagName==='A'&&!RM){var h=t.getAttribute('href');
  if(h&&h.charAt(0)!=='#'&&!/^(https?:|mailto:|tel:)/.test(h)&&!t.target&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey){
   e.preventDefault();document.body.classList.add('mm-leave');setTimeout(function(){location.href=t.href;},170);}}
},true);
window.addEventListener('pageshow',function(){document.body.classList.remove('mm-leave');});
/* react to app DOM */
var lastPop=0;
function pop(){var n=Date.now();if(n-lastPop>500){lastPop=n;S.pop();}}
function check(n){
 if(n.nodeType!==1)return;
 var f=n.matches&&n.matches('.feed')?n:(n.querySelector&&n.querySelector('.feed'));
 if(f&&Date.now()-lastOpt<900){if(f.classList.contains('ok'))S.ok();else S.no();lastOpt=0;}
 if(f&&Date.now()-lastOpt>=900){f.classList.add('mm-re');}
 var d=n.matches&&n.matches('.done-screen')?n:(n.querySelector&&n.querySelector('.done-screen'));
 if(d&&Date.now()-lastClick<1500){if(Date.now()-lastDone>1500)window.mmSound('done');confetti();}
}
function init(){
 document.documentElement.classList.add('fx');
 mkBtn();
 new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(check);});}).observe(document.body,{childList:true,subtree:true});
 var cw=document.getElementById('charWrap');
 if(cw){
  new MutationObserver(function(){if(!cw.hidden){pop();var b=document.getElementById('simpBub');if(b){b.style.animation='none';void b.offsetWidth;b.style.animation='';}}}).observe(cw,{attributes:true,attributeFilter:['hidden']});
  var tx=document.getElementById('sbTxt');if(tx)new MutationObserver(function(){if(!cw.hidden)pop();}).observe(tx,{childList:true,characterData:true,subtree:true});
 }
 var els=document.querySelectorAll('.card,.ls,.f,.unit,.sh,.stats>.wrap>div,.demo');
 els.forEach(function(el,i){el.classList.add('rv');el.style.setProperty('--d',((i%4)*.07)+'s');});
 if(RM||!('IntersectionObserver' in window)){els.forEach(function(el){el.classList.add('in');});}
 else{var clean=function(T){setTimeout(function(){T.classList.remove('rv','in');T.style.removeProperty('--d');},1200);};var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){var T=x.target;T.classList.add('in');io.unobserve(T);clean(T);}});},{threshold:.12,rootMargin:'0px 0px -30px 0px'});els.forEach(function(el){io.observe(el);});
  setTimeout(function(){els.forEach(function(el){el.classList.add('in');clean(el);});},4000);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

/* Mr. Youssef mascot: tap gives a happy bounce + a fresh bubble line (no hover effects) */
(function(){
var SEL='#heroPose,#trackPose,.auth-char img,.pop-ch',
 rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function hop(im){if(rm||!im.animate)return;im.animate([{scale:'1'},{scale:'1.05'},{scale:'.99'},{scale:'1'}],{duration:420,easing:'ease-out'});}
var cats=['greet','start','back'],ci=0;
document.addEventListener('click',function(e){var im=e.target.closest&&e.target.closest('#heroPose,#trackPose,.auth-char img');if(!im)return;hop(im);
 var b=im.parentNode&&im.parentNode.querySelector('.bubble');
 if(b&&window.mmBubble){var t=mmBubble('waving',cats[ci++%cats.length],'char');if(t)b.textContent=t;}
 if(window.mmSound)mmSound('pop');});
document.querySelectorAll('#heroPose,#trackPose,.auth-char img').forEach(function(im){im.style.cursor='pointer';im.setAttribute('role','button');im.setAttribute('aria-label','مستر يوسف');});
})();

/* Tappable headings: any element carrying data-go navigates (click, Enter or Space) */
(function(){
var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
document.addEventListener('click',function(e){var g=e.target.closest&&e.target.closest('[data-go]');if(!g)return;var d=g.getAttribute('data-go');if(!d||d==='1')return;
 if(window.mmSound)mmSound('tap');
 if(d.charAt(0)==='#'){var el=document.querySelector(d);if(el){el.scrollIntoView({behavior:rm?'auto':'smooth',block:'start'});return;}}
 location.href=d;});
document.addEventListener('keydown',function(e){if(e.key!=='Enter'&&e.key!==' ')return;var g=e.target.closest&&e.target.closest('[data-go]');if(!g)return;e.preventDefault();g.click();});
})();

/* No text selection or long-press callout on page content; inputs stay typable/selectable */
(function(){
['selectstart','contextmenu','dragstart'].forEach(function(ev){document.addEventListener(ev,function(e){var t=e.target;if(t&&t.closest&&t.closest('input,textarea,[contenteditable]'))return;e.preventDefault();},{capture:true});});
})();
