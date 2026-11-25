/* الوضع الليلي/النهاري — داكن افتراضيًا ويُحفظ اختيار الزائر في المتصفح */
(function(){
  var K="gh-theme",SUN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.6" fill="currentColor" stroke="none"/><line x1="12" y1="2.2" x2="12" y2="4.6"/><line x1="12" y1="19.4" x2="12" y2="21.8"/><line x1="2.2" y1="12" x2="4.6" y2="12"/><line x1="19.4" y1="12" x2="21.8" y2="12"/><line x1="4.5" y1="4.5" x2="6.2" y2="6.2"/><line x1="17.8" y1="17.8" x2="19.5" y2="19.5"/><line x1="4.5" y1="19.5" x2="6.2" y2="17.8"/><line x1="17.8" y1="6.2" x2="19.5" y2="4.5"/></svg>',
  MOON='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.2 13.6A8.6 8.6 0 1 1 10.4 3.8a7 7 0 0 0 9.8 9.8z"/></svg>';
  function get(){try{return localStorage.getItem(K)||"dark"}catch(e){return"dark"}}
  function set(t){try{localStorage.setItem(K,t)}catch(e){}}
  document.documentElement.dataset.theme=get();
  function meta(t){var m=document.querySelector('meta[name=theme-color]');if(m)m.content=t==="light"?"#faf5e8":"#0a0907"}
  function paint(b){b.innerHTML=document.documentElement.dataset.theme==="light"?MOON:SUN}
  function mount(){
    var b=document.getElementById("ghThemeBtn");
    if(!b||b.dataset.wired)return;
    b.dataset.wired="1";
    paint(b);
    b.addEventListener("click",function(){
      var n=document.documentElement.dataset.theme==="light"?"dark":"light";
      document.documentElement.dataset.theme=n;set(n);meta(n);paint(b);
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();
  meta(get());
})();
