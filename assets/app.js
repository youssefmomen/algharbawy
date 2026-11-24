// منطق العرض: يقرأ كل المحتوى من data.js ويرسم الصفحة مع الحركات
(function () {
  var data = window.SITE_DATA;
  if (!data) return;
  document.documentElement.classList.add("js");

  function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
  function param(n){return new URLSearchParams(location.search).get(n);}
  function find(arr,id){for(var i=0;i<arr.length;i++)if(arr[i].id===id)return arr[i];return null;}
  var AR="٠١٢٣٤٥٦٧٨٩";
  function ar(n){return String(n).replace(/\d/g,function(d){return AR[d];});}
  function pad(n){return ar(n<10?"0"+n:n);}
  var page=document.body.getAttribute("data-page");
  var total=0;data.sections.forEach(function(s){total+=s.lessons.length;});

  // علامة القسم: أول حرف من اسمه بعد إسقاط «ال» التعريف
  function markOf(s){
    var t=String(s.title).replace(/^ال/,"");
    return '<span class="mark"><i>'+esc(t.charAt(0))+'</i></span>';
  }

  // ---------- الهيكل المشترك ----------
  var navHTML='<div class="progress" id="progress"></div>'+
  '<nav class="nav" id="nav"><div class="wrap"><a class="brand" href="index.html"><i><b>غ</b></i><span>'+esc(data.siteTitle)+'</span></a>'+
  '<div class="links" id="links"><a href="index.html">الرئيسة</a><a href="index.html#sections">الأقسام</a>'+
  data.sections.map(function(s){return '<a href="section.html?id='+encodeURIComponent(s.id)+'">'+esc(s.title)+'</a>';}).join("")+
  '</div><button class="burger" id="burger" aria-label="القائمة">☰</button></div></nav>';
  document.body.insertAdjacentHTML("afterbegin",navHTML);
  var year=ar(new Date().getFullYear());
  var foot=document.getElementById("footer");
  if(foot)foot.innerHTML='<div class="wrap"><div class="foot-big gold">'+esc(data.siteTitle)+'</div><div class="foot-row"><span>'+esc(data.siteTagline)+'</span><span>'+
   data.sections.map(function(s){return '<a href="section.html?id='+encodeURIComponent(s.id)+'" style="margin-inline-start:18px">'+esc(s.title)+'</a>';}).join("")+
   '</span><span>© '+year+' '+esc(data.siteTitle)+'</span></div></div>';

  // ---------- الصفحات ----------
  if(page==="home"){
    document.title=data.siteTitle+" | "+data.siteTagline;
    var words=data.siteTitle.split(" ");
    document.getElementById("hero-title").innerHTML=words.map(function(w,i){return '<span class="rv'+(i?' gold':'')+'" style="--d:'+(.15+i*.14)+'s">'+esc(w)+'</span>';}).join("");
    document.getElementById("hero-tag").textContent=data.siteTagline;
    document.getElementById("tiles").innerHTML=data.sections.map(function(s,i){
      return '<a class="tile rv" style="--d:'+((i%2)*.1)+'s" href="section.html?id='+encodeURIComponent(s.id)+'">'+
      '<span class="num">'+pad(i+1)+'</span>'+markOf(s)+'<h3>'+esc(s.title)+'</h3><p>'+esc(s.description)+'</p>'+
      '<div class="meta"><span>'+ar(s.lessons.length)+' '+(s.lessons.length>2&&s.lessons.length<11?'دروس':'درس')+'</span><span class="go">←</span></div></a>';
    }).join("");
    var stats=[[data.sections.length,"أقسام"],[total,"درسًا"],[28,"حرفًا"]];
    document.getElementById("stats").innerHTML=stats.map(function(x,i){return '<div class="stat rv" style="--d:'+i*.1+'s"><b class="gold">'+ar(x[0])+'</b><span>'+x[1]+'</span></div>';}).join("");
  }

  if(page==="section"){
    var sec=find(data.sections,param("id"))||data.sections[0];
    document.title=sec.title+" | "+data.siteTitle;
    document.getElementById("crumbs").innerHTML='<a href="index.html">الرئيسة</a><span class="sep">◆</span><span>'+esc(sec.title)+'</span>';
    var pm=document.getElementById("page-mark");if(pm)pm.innerHTML=markOf(sec);
    document.getElementById("page-title").innerHTML='<span class="gold">'+esc(sec.title)+'</span>';
    document.getElementById("page-desc").textContent=sec.description;
    document.getElementById("lessons").innerHTML=sec.lessons.map(function(l,i){
      return '<li class="rv" style="--d:'+i*.06+'s"><a href="lesson.html?section='+encodeURIComponent(sec.id)+'&lesson='+encodeURIComponent(l.id)+'">'+
      '<span class="n">'+pad(i+1)+'</span><div><div class="t">'+esc(l.title)+'</div><div class="s">'+esc(l.summary)+'</div></div><span class="go">←</span></a></li>';
    }).join("");
  }

  if(page==="lesson"){
    var sec2=find(data.sections,param("section"))||data.sections[0];
    var les=find(sec2.lessons,param("lesson"))||sec2.lessons[0];
    var li=sec2.lessons.indexOf(les);
    document.title=les.title+" | "+data.siteTitle;
    document.getElementById("crumbs").innerHTML='<a href="index.html">الرئيسة</a><span class="sep">◆</span><a href="section.html?id='+encodeURIComponent(sec2.id)+'">'+esc(sec2.title)+'</a><span class="sep">◆</span><span>'+esc(les.title)+'</span>';
    document.getElementById("page-title").innerHTML='<span class="gold">'+esc(les.title)+'</span>';
    document.getElementById("page-desc").textContent=les.summary||"";
    document.getElementById("lesson-body").innerHTML=les.body.map(function(p,i){
      var cls=/^\s*(تدريب|تمرين)/.test(p)?' tadreeb':'';
      return '<p class="rv'+cls+'">'+esc(p)+'</p>';
    }).join("");
    function lk(l,lab,c){return l?'<a class="'+c+'" href="lesson.html?section='+encodeURIComponent(sec2.id)+'&lesson='+encodeURIComponent(l.id)+'"><small>'+lab+'</small><b>'+esc(l.title)+'</b></a>':'<a class="empty '+c+'"></a>';}
    var prev=sec2.lessons[li-1],next=sec2.lessons[li+1];
    var last=!next?'<a class="nx" href="section.html?id='+encodeURIComponent(sec2.id)+'"><small>أحسنت، أنهيت القسم</small><b>العودة إلى '+esc(sec2.title)+'</b></a>':lk(next,"الدرس التالي ←","nx");
    document.getElementById("pager").innerHTML=lk(prev,"→ الدرس السابق","pv")+last;
  }

  // ---------- التفاعل ----------
  var nav=document.getElementById("nav"),bar=document.getElementById("progress");
  function onScroll(){
    var y=window.scrollY,h=document.documentElement.scrollHeight-innerHeight;
    nav.classList.toggle("solid",y>30);
    bar.style.transform="scaleX("+(h>0?Math.min(1,y/h):0)+")";
  }
  addEventListener("scroll",onScroll,{passive:true});onScroll();
  var burger=document.getElementById("burger"),links=document.getElementById("links");
  burger.addEventListener("click",function(){links.classList.toggle("open");});
  links.addEventListener("click",function(e){if(e.target.tagName==="A")links.classList.remove("open");});

  var io=new IntersectionObserver(function(es){es.forEach(function(en){
    if(en.isIntersecting){en.target.classList.add("in");io.unobserve(en.target);}
  });},{threshold:.12,rootMargin:"0px 0px -40px 0px"});
  document.querySelectorAll(".rv").forEach(function(el){io.observe(el);});
  setTimeout(function(){document.querySelectorAll(".hero .rv").forEach(function(e){e.classList.add("in");});},60);
})();
