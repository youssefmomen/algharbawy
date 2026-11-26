/* Shared interaction layer. Reusable on any page: <script src="inter.js?v=1" defer></script>
   Reactions for buttons, chips, cards, mascot, path nodes, headings, answers.
   Each type has a bank of 10+ reactions drawn from a shuffle bag kept in localStorage,
   so the same one never repeats back to back and a full round passes before any returns.
   Only transform and opacity move. Never blocks a tap. Off with reduced motion. */
(function(){
'use strict';
if(window.__mmInter)return;window.__mmInter=1;
var CFG=window.MM_INTER||{},PFX=CFG.prefix||'ia';
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
if(RM||!Element.prototype.animate)return;
var HOVER=window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches;

/* motion shapes: each returns transform frames; a is amplitude */
var P='perspective(500px) ';
var SH={
 hop:function(a){return['translateY(0)','translateY('+(-9*a)+'px)','translateY(0)','translateY('+(-3*a)+'px)','translateY(0)'];},
 hop2:function(a){return['translateY(0)','translateY('+(-8*a)+'px)','translateY(0)','translateY('+(-8*a)+'px)','translateY(0)'];},
 squash:function(a){return['scale(1,1)','scale('+(1+.1*a)+','+(1-.14*a)+')','scale('+(1-.07*a)+','+(1+.1*a)+')','scale(1,1)'];},
 swell:function(a){return['scale(1)','scale('+(1+.1*a)+')','scale(1)'];},
 press:function(a){return['scale(1)','scale('+(1-.07*a)+')','scale(1.03)','scale(1)'];},
 wobble:function(a){return['rotate(0)','rotate('+(-5*a)+'deg)','rotate('+(4*a)+'deg)','rotate('+(-2*a)+'deg)','rotate(0)'];},
 tiltL:function(a){return['rotate(0)','rotate('+(-6*a)+'deg)','rotate(0)'];},
 tiltR:function(a){return['rotate(0)','rotate('+(6*a)+'deg)','rotate(0)'];},
 shake:function(a){return['translateX(0)','translateX('+(-6*a)+'px)','translateX('+(6*a)+'px)','translateX('+(-4*a)+'px)','translateX('+(3*a)+'px)','translateX(0)'];},
 slideR:function(a){return['translateX(0)','translateX('+(8*a)+'px)','translateX(0)'];},
 slideL:function(a){return['translateX(0)','translateX('+(-8*a)+'px)','translateX(0)'];},
 skew:function(a){return['skewX(0)','skewX('+(-8*a)+'deg)','skewX('+(5*a)+'deg)','skewX(0)'];},
 flipX:function(a){return[P+'rotateX(0)',P+'rotateX('+(12*a)+'deg)',P+'rotateX(0)'];},
 flipY:function(a){return[P+'rotateY(0)',P+'rotateY('+(12*a)+'deg)',P+'rotateY(0)'];},
 jelly:function(a){return['scale(1,1)','scale('+(1+.12*a)+','+(1-.1*a)+')','scale('+(1-.08*a)+','+(1+.08*a)+')','scale('+(1+.04*a)+','+(1-.03*a)+')','scale(1,1)'];},
 sway:function(a){return['translateX(0) rotate(0)','translateX('+(-5*a)+'px) rotate('+(-3*a)+'deg)','translateX('+(5*a)+'px) rotate('+(3*a)+'deg)','translateX(0) rotate(0)'];},
 nod:function(a){return['translateY(0) rotate(0)','translateY('+(3*a)+'px) rotate('+(2*a)+'deg)','translateY('+(-4*a)+'px) rotate('+(-2*a)+'deg)','translateY(0) rotate(0)'];},
 rise:function(a){return['translateY(0)','translateY('+(-5*a)+'px) scale('+(1+.03*a)+')','translateY(0)'];},
 drop:function(a){return['translateY(0)','translateY('+(5*a)+'px) scale('+(1-.03*a)+')','translateY('+(-2*a)+'px)','translateY(0)'];},
 shiver:function(a){return['rotate(0)','rotate('+(1.6*a)+'deg)','rotate('+(-1.6*a)+'deg)','rotate('+(1.2*a)+'deg)','rotate('+(-1.2*a)+'deg)','rotate(0)'];},
 spin:function(a){return['rotate(0)','rotate('+(8*a)+'deg)','rotate(0)'];}
};
/* banks: [shape, amplitude, duration ms] */
var BANK={
 button:[['squash',1,420],['swell',1.3,380],['hop',1,460],['wobble',1,480],['jelly',1,520],['shake',.9,420],['flipX',1,650],['press',1.3,320],['sway',1.2,460],['skew',1,420],['hop2',.8,560],['tiltR',1,380]],
 chip:[['swell',1.6,360],['wobble',1.3,440],['hop',.8,420],['jelly',1.2,500],['flipY',1,650],['tiltL',1.3,360],['shiver',1.4,440],['squash',1.2,380],['sway',1,420],['slideL',1,340],['hop2',.7,520],['skew',1.2,400]],
 card:[['rise',1.4,420],['press',.8,340],['tiltL',.5,420],['tiltR',.5,420],['swell',.6,420],['sway',.7,520],['nod',.9,480],['jelly',.4,560],['shiver',.6,420],['hop',.7,460],['drop',1.2,420],['flipX',.8,420]],
 mascot:[['hop',1.6,520],['hop2',1.3,640],['wobble',1.2,560],['jelly',1.1,620],['flipY',1,800],['sway',1.6,600],['nod',1.8,560],['shiver',1.6,500],['squash',1,480],['tiltL',1.2,500],['tiltR',1.2,500],['swell',1.2,460]],
 heading:[['slideR',1.2,420],['slideL',1.2,420],['rise',1,400],['drop',1,420],['swell',.6,420],['skew',.6,460],['tiltR',.3,420],['shiver',.5,420],['sway',.8,480],['nod',.8,440],['wobble',.4,480],['flipX',.5,420]],
 node:[['swell',1.8,420],['hop',1.2,460],['jelly',1.4,520],['wobble',1.5,480],['spin',1,700],['flipY',1,700],['squash',1.4,420],['hop2',1,580],['shiver',1.6,440],['press',1.6,340],['sway',1.2,460],['flipX',1,700]],
 tile:[['swell',1.5,380],['hop',1,440],['jelly',1.2,500],['wobble',1.2,460],['flipX',1,650],['squash',1.2,400],['rise',1.6,420],['sway',1,440],['spin',1,700],['press',1.4,320],['shiver',1.3,440],['hop2',.8,560]],
 avatar:[['swell',1.8,380],['hop',1.3,440],['jelly',1.5,500],['wobble',1.6,460],['spin',1,700],['flipY',1,700],['squash',1.5,400],['press',1.6,320],['shiver',1.6,440],['hop2',1.1,560],['tiltR',1.4,380],['tiltL',1.4,380]],
 field:[['rise',.7,360],['swell',.35,340],['nod',.7,380],['slideR',.6,340],['slideL',.6,340],['hop',.5,380],['press',.5,300],['sway',.6,400],['skew',.4,360],['squash',.4,340]],
 ok:[['hop2',1.6,640],['jelly',1.6,620],['flipY',1,800],['spin',1,800],['swell',1.8,500],['wobble',1.6,560],['sway',1.8,600],['hop',2,560],['rise',2.2,520],['nod',2,520],['squash',1.6,500],['tiltR',1.8,460],['tiltL',1.8,460],['flipX',1,800]],
 bad:[['shake',1,460],['nod',1.4,480],['drop',1.6,460],['shiver',1.5,500],['press',1.6,360],['skew',1,420],['slideL',1.2,380],['sway',.8,460],['squash',.8,420],['wobble',.8,500],['tiltL',.9,420],['tiltR',.9,420]],
 answer:[['press',1,320],['hop',.8,420],['shake',.6,380],['swell',.5,380],['wobble',.7,440],['sway',.7,420],['jelly',.5,500],['slideR',.9,360],['slideL',.9,360],['nod',.7,420],['skew',.6,400],['squash',.7,400]]
};
/* scroll reveal bank: [from transform, duration] */
var REV=[['translateY(26px)',480],['translateY(-22px)',480],['translateX(26px)',480],['translateX(-26px)',480],['scale(.88)',460],['scale(1.08)',460],['rotate(2.5deg) translateY(18px)',520],['rotate(-2.5deg) translateY(18px)',520],['perspective(500px) rotateX(-35deg)',560],['skewX(6deg) translateX(18px)',500],['translateY(14px) scale(.94)',440],['perspective(500px) rotateY(30deg)',560]];

/* shuffle bag with memory */
function ls(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');localStorage.setItem(k,JSON.stringify(v));}catch(e){}return null;}
var mem={};
function draw(key,n){
 var k=PFX+':'+key,s=mem[k]||ls(k)||{bag:[],last:-1};
 if(!s.bag||!s.bag.length){
  var a=[],i,j,t;for(i=0;i<n;i++)a.push(i);
  for(i=n-1;i>0;i--){j=Math.floor(Math.random()*(i+1));t=a[i];a[i]=a[j];a[j]=t;}
  if(a[a.length-1]===s.last&&n>1){t=a[0];a[0]=a[a.length-1];a[a.length-1]=t;}
  s.bag=a;
 }
 var x=s.bag.pop();s.last=x;mem[k]=s;ls(k,s);return x;
}
function react(el,type,mode){
 var b=BANK[type],i=draw(type+':'+mode,b.length),r=b[i],a=r[1]*.45,f=SH[r[0]](a);
 var kf=f.map(function(t){return{transform:t};});
 var an;try{an=el.animate(kf,{duration:r[2]*.75,easing:'ease-in-out',composite:'add'});}catch(e){try{an=el.animate(kf,{duration:r[2]*.75,easing:'ease-in-out'});}catch(e2){}}
 return an;
}

var SEL={
 answer:'.opt,.ans',
 node:'.pnode,.node',
 field:'input:not([type=checkbox]):not([type=radio]),select,textarea',
 avatar:'.sw,.ch,.av,.avopt,[data-av]',
 button:'.btn,button,.pbtn,.pop-btn,.next,.nback,.nhome,.tabs a,nav a,.arrow,.nav-arrow',
 tile:'.stat,.tile,.stats>*,.pts,.streak,.xp,.chipstat',
 chip:'.subj,.chip,.tag,.simp-chip,.crumbs a',
 mascot:'img[src*="mr-moamen"]',
 card:'.card,.lessons a,.ls a,.f,.unit,.mod,.why,.q,.row',
 heading:'h1,h2,h3,.sec-h,.grp-t,.pop-h'
};
if(CFG.selectors)for(var ck in CFG.selectors){SEL[ck]=(SEL[ck]?SEL[ck]+',':'')+CFG.selectors[ck];}
var TAP=['button','answer','mascot'];
var ORDER=['answer','node','avatar','field','tile','button','chip','mascot','card','heading'];
function find(t){
 if(!t||!t.closest)return null;
 for(var i=0;i<ORDER.length;i++){var e=t.closest(SEL[ORDER[i]]);if(e&&!e.closest('[data-nointer]'))return[e,ORDER[i]];}
 return null;
}
function busy(el){return el.__mmI&&el.__mmI.playState==='running';}
addEventListener('pointerdown',function(e){
 var f=find(e.target);if(!f||busy(f[0]))return;
 if(TAP.indexOf(f[1])<0||f[0].disabled)return;
 f[0].__mmI=react(f[0],f[1],'t');
},{capture:true,passive:true});
/* scroll reveal for things that start below the fold */
if(window.IntersectionObserver){
 var seen=typeof WeakSet==='function'?new WeakSet():null,first=true;
 var io=new IntersectionObserver(function(es){es.forEach(function(en){
  if(!en.isIntersecting)return;io.unobserve(en.target);
  var el=en.target;
  try{el.animate([{opacity:.35},{opacity:1}],{duration:380,easing:'ease-out'});}catch(e){}
 });},{threshold:.15});
 function scan(){
  var q=SEL.card+','+SEL.heading,els=document.querySelectorAll(q),h=innerHeight;
  [].forEach.call(els,function(el){
   if(seen&&seen.has(el))return;if(seen)seen.add(el);
   if(el.closest('[data-nointer],.overlay,nav'))return;
   var r=el.getBoundingClientRect();
   if(r.top<h&&r.bottom>0)return; /* already on screen: leave it still */
   if(!first&&r.top<h*1.2)return;
   io.observe(el);
  });first=false;
 }
 var tm=null;
 function later(){clearTimeout(tm);tm=setTimeout(scan,250);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){scan();});else scan();
 try{new MutationObserver(later).observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
}
/* new feedback blocks get a correct / wrong reaction */
try{new MutationObserver(function(ms){ms.forEach(function(m){[].forEach.call(m.addedNodes,function(n){
 if(n.nodeType!==1)return;var c=n.classList;if(!c)return;
 var ty=(c.contains('ok')&&(c.contains('feed')||c.contains('fb')||c.contains('correct')))?'ok':(c.contains('no')&&(c.contains('feed')||c.contains('fb'))||c.contains('wrong'))?'bad':null;
 if(ty)n.__mmI=react(n,ty,'t');
});});}).observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
/* API: mmInter.react(el,type) with type in banks keys; mmInter.feedback(el,true|false) */
window.mmInter={feedback:function(el,ok){return react(el,ok?'ok':'bad','t');},react:function(el,type){return react(el,type,'t');},banks:BANK};
})();
