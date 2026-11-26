/* Tappable headings. Reusable: set window.MM_HEADS=[{sel:'css',href:'url'|'#id'|function}] before this file.
   A heading with no rule that sits inside a block holding a link goes to that block's first link.
   Headings already inside a link are left alone. */
(function(){
'use strict';
if(window.__mmHeads)return;window.__mmHeads=1;
var RULES=window.MM_HEADS||[],HS='h1,h2,h3,.sec-h';
var css=document.createElement('style');
css.textContent='[data-go]{cursor:pointer;-webkit-tap-highlight-color:transparent}[data-go]:focus-visible{outline:3px solid #f2b200;outline-offset:4px;border-radius:6px}[data-go]:not(h1)::after{content:"\\2039";display:inline-block;margin-inline-start:.4em;opacity:.45;transition:transform .2s,opacity .2s}[data-go]:hover::after{opacity:1;transform:translateX(-4px)}h1[data-go]:hover{text-decoration:underline dotted;text-underline-offset:8px;text-decoration-thickness:2px}';
document.head.appendChild(css);
function dest(h){
 if(h.closest('a'))return null;
 for(var i=0;i<RULES.length;i++){var r=RULES[i];if(h.matches(r.sel)){return typeof r.href==='function'?r.href():r.href;}}
 var c=h.parentElement,n=0;
 while(c&&c!==document.body&&n++<3){
  var a=c.querySelector('a[href]:not([href^="#"]):not(.btn)');
  if(!a)a=c.querySelector('a[href]:not([href^="#"])');
  if(a&&!h.contains(a))return a.getAttribute('href');
  c=c.parentElement;
 }
 return null;
}
function mark(){
 [].forEach.call(document.querySelectorAll(HS),function(h){
  if(h.__mmG)return;h.__mmG=1;
  if(h.closest('nav,.pop,.overlay,[data-nogo]'))return;
  var d=dest(h);
  if(d===null&&!RULES.some(function(r){return h.matches(r.sel);}))return;
  h.setAttribute('data-go','1');h.setAttribute('role','link');h.tabIndex=0;
 });
}
function go(h){
 var d=dest(h);if(!d)return;
 if(d.charAt(0)==='#'){var t=document.getElementById(d.slice(1));if(t){t.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}return;}
 location.href=d;
}
document.addEventListener('click',function(e){
 var h=e.target.closest&&e.target.closest('[data-go]');if(!h)return;
 var sel=window.getSelection&&String(getSelection());if(sel)return;
 go(h);
});
document.addEventListener('keydown',function(e){
 if(e.key!=='Enter')return;var h=e.target.closest&&e.target.closest('[data-go]');if(h)go(h);
});
function init(){mark();try{new MutationObserver(function(){clearTimeout(init.t);init.t=setTimeout(mark,150);}).observe(document.body,{childList:true,subtree:true});}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
