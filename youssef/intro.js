(function(){
'use strict';
if(window.__mmIntro)return;window.__mmIntro=1;
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
if(RM||!Element.prototype.animate)return;
function go(){
 var anims=[],bar=document.createElement('div');
 bar.setAttribute('aria-hidden','true');
 bar.style.cssText='position:fixed;top:0;left:0;right:0;height:4px;background:#f2b200;z-index:99999;pointer-events:none;transform-origin:right center';
 document.body.appendChild(bar);
 function A(el,kf,o){try{var a=el.animate(kf,o);anims.push(a);return a;}catch(e){}}
 var b=A(bar,[{transform:'scaleX(0)',opacity:1},{transform:'scaleX(1)',opacity:1,offset:.7},{transform:'scaleX(1)',opacity:0}],{duration:900,easing:'ease-out'});
 if(b)b.onfinish=function(){bar.remove();};else bar.remove();
 /* mascot entrance, a different one each load */
 var img=document.querySelector('.hero .char img, .th .char img'),bub=document.querySelector('.hero .bubble, .th .bubble');
 if(img){
  var V=[
   [{transform:'scale(.2) translateY(60px)',opacity:0},{transform:'scale(1.08) translateY(-6px)',opacity:1,offset:.7},{transform:'scale(1) translateY(0)',opacity:1}],
   [{transform:'translateX(-120px) rotate(-6deg)',opacity:0},{transform:'translateX(8px) rotate(2deg)',opacity:1,offset:.75},{transform:'none',opacity:1}],
   [{transform:'translateY(-140px)',opacity:0},{transform:'translateY(0)',opacity:1,offset:.55},{transform:'translateY(-16px)',offset:.75},{transform:'translateY(0)',offset:.9},{transform:'translateY(-4px)',offset:.95},{transform:'none'}],
   [{transform:'translateY(90px) rotate(5deg)',opacity:0},{transform:'translateY(-8px) rotate(-3deg)',opacity:1,offset:.6},{transform:'rotate(2deg)',offset:.8},{transform:'none'}]
  ];
  var v=V[Math.floor(Math.random()*V.length)];
  A(img,v,{duration:850,easing:'cubic-bezier(.2,.8,.3,1)',delay:120,fill:'backwards'});
  if(bub)A(bub,[{transform:'scale(.3)',opacity:0},{transform:'scale(1.06)',opacity:1,offset:.7},{transform:'scale(1)',opacity:1}],{duration:380,delay:650,fill:'backwards'});
 }
 /* content reveal */
 var sel='.hero h1,.hero .subj,.hero p,.hero .cta .btn,.th .crumb,.th h1,.th h2,.th .subj,.th .btn';
 var els=[].slice.call(document.querySelectorAll(sel));
 if(!els.length){els=[].slice.call(document.querySelectorAll('body > :not(nav):not(script):not(style):not(footer):not(.bubble) .wrap > *'));}
 els=els.filter(function(e){var r=e.getBoundingClientRect();return r.top<innerHeight&&r.height>0;}).slice(0,8);
 els.forEach(function(e,i){A(e,[{transform:'translateY(14px)',opacity:0},{transform:'none',opacity:1}],{duration:380,delay:i*70,easing:'ease-out',fill:'backwards'});});
 /* tap skips */
 function skip(){anims.forEach(function(a){try{a.finish();}catch(e){}});bar.remove();removeEventListener('pointerdown',skip,true);removeEventListener('keydown',skip,true);}
 addEventListener('pointerdown',skip,true);addEventListener('keydown',skip,true);
 setTimeout(skip,1600);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
