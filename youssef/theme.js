/* الوضع الليلي: يقرأ الاختيار المحفوظ أو إعداد الجهاز، ويضيف زر التبديل في الشريط العلوي. */
(function(){
'use strict';
var KEY='my-theme';
function stored(){try{return localStorage.getItem(KEY);}catch(e){return null;}}
function set(t){
 document.documentElement.setAttribute('data-theme',t);
 var m=document.querySelector('meta[name="theme-color"]');
 if(m)m.setAttribute('content',t==='dark'?'#0f1720':'#ffc93c');
}
function fromUrl(){try{var m=/[?&]theme=(dark|light)/.exec(location.search);return m?m[1]:null;}catch(e){return null;}}
var q=fromUrl(),s=q||stored();
set(s||((window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'));
var MOON='<svg class="ic-moon" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 13.2A8.6 8.6 0 1 1 10.8 3.5a7 7 0 0 0 9.7 9.7z"/></svg>';
var SUN='<svg class="ic-sun" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.1"/><path d="M12 2.6v2.3M12 19.1v2.3M4.5 4.5l1.7 1.7M17.8 17.8l1.7 1.7M2.6 12h2.3M19.1 12h2.3M4.5 19.5l1.7-1.7M17.8 6.2l1.7-1.7"/></svg>';
function add(){
 var host=document.querySelector('nav .wrap')||document.querySelector('.nhd');
 if(!host||host.querySelector('.themebtn'))return;
 var b=document.createElement('button');
 b.type='button';b.className='themebtn';
 b.innerHTML=MOON+SUN;
 b.setAttribute('aria-label','تبديل الوضع الليلي');
 b.title='الوضع الليلي / النهاري';
 b.addEventListener('click',function(){
  var next=(document.documentElement.getAttribute('data-theme')==='dark')?'light':'dark';
  set(next);
  try{localStorage.setItem(KEY,next);}catch(e){}
 });
 var anchor=host.querySelector('.mm-snd')||host.querySelector('a.btn')||host.querySelector('.nhome');
 host.insertBefore(b,anchor||null);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
})();
