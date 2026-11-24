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
  var allSections=data.sections.concat(data.tracks||[]);
  var topSections=data.sections.filter(function(s){return !s.group;});
  function lessonsCount(s){var n=0;if(s.children){s.children.forEach(function(id){var c=find(data.sections,id);if(c)n+=lessonsCount(c);});return n;}n=s.lessons.length;if(s.courses)s.courses.forEach(function(c){n+=c.lessons.length;});return n;}
  var page=document.body.getAttribute("data-page");
  var total=0;data.sections.forEach(function(s){if(!s.children)total+=lessonsCount(s);});

  // علامة القسم: أول حرف من اسمه بعد إسقاط «ال» التعريف
  function markOf(s){
    var t=String(s.title).replace(/^ال/,"");
    return '<span class="mark"><i>'+esc(t.charAt(0))+'</i></span>';
  }

  // ---------- الهيكل المشترك ----------
  var navHTML='<div class="progress" id="progress"></div>'+
  '<nav class="nav" id="nav"><div class="wrap"><a class="brand" href="index.html"><i><b>غ</b></i><span>'+esc(data.siteTitle)+'</span></a>'+
  '<div class="links" id="links"><a href="index.html">الرئيسة</a>'+
  topSections.map(function(s){return '<a href="section.html?id='+encodeURIComponent(s.id)+'">'+esc(s.title)+'</a>';}).join("")+
  '</div><button class="burger" id="burger" aria-label="القائمة">☰</button></div></nav>';
  document.body.insertAdjacentHTML("afterbegin",navHTML);
  var year=ar(new Date().getFullYear());
  var foot=document.getElementById("footer");
  if(foot)foot.innerHTML='<div class="wrap"><div class="foot-big gold">'+esc(data.siteTitle)+'</div><div class="foot-row"><span>'+esc(data.siteTagline)+'</span><span>'+
   topSections.concat(data.tracks||[]).map(function(s){return '<a href="section.html?id='+encodeURIComponent(s.id)+'" style="margin-inline-start:18px">'+esc(s.title)+'</a>';}).join("")+
   '</span><span>© '+year+' '+esc(data.siteTitle)+'</span></div></div>';

  // ---------- الصفحات ----------
  if(page==="home"){
    document.title=data.siteTitle+" | "+data.siteTagline;
    var words=data.siteTitle.split(" ");
    document.getElementById("hero-title").innerHTML=words.map(function(w,i){return '<span class="rv'+(i?' gold':'')+'" style="--d:'+(.15+i*.14)+'s">'+esc(w)+'</span>';}).join("");
    document.getElementById("hero-tag").textContent=data.siteTagline;
    document.getElementById("tiles").innerHTML=topSections.map(function(s,i){
      return '<a class="tile rv" style="--d:'+((i%2)*.1)+'s" href="section.html?id='+encodeURIComponent(s.id)+'">'+
      '<span class="num">'+pad(i+1)+'</span>'+markOf(s)+'<h3>'+esc(s.title)+'</h3><p>'+esc(s.description)+'</p>'+
      '<div class="meta"><span>'+(lessonsCount(s)?ar(lessonsCount(s))+' '+(lessonsCount(s)>2&&lessonsCount(s)<11?'دروس':'درس'):'قريبًا')+'</span><span class="go">←</span></div></a>';
    }).join("");
    var tk=document.getElementById("tracks");
    if(tk&&data.tracks){tk.innerHTML=data.tracks.map(function(s,i){
      return '<a class="tile side rv" style="--d:'+((i%2)*.1)+'s" href="section.html?id='+encodeURIComponent(s.id)+'">'+
      markOf(s)+'<h3>'+esc(s.title)+'</h3><p>'+esc(s.description)+'</p>'+
      '<div class="meta"><span>قريبًا</span><span class="go">←</span></div></a>';
    }).join("");}
    var contentSecs=allSections.filter(function(s){return !s.children;});var stats=[[contentSecs.length,"أقسام"],[total,"درسًا"],[28,"حرفًا"]];
    document.getElementById("stats").innerHTML=stats.map(function(x,i){return '<div class="stat rv" style="--d:'+i*.1+'s"><b class="gold">'+ar(x[0])+'</b><span>'+x[1]+'</span></div>';}).join("");
  }

  if(page==="section"){
    var sec=find(allSections,param("id"))||data.sections[0];
    if(sec.id==="tasis")document.body.classList.add("kids");
    var crs=param("course")&&sec.courses?find(sec.courses,param("course")):null;
    var courseParam=crs?'&course='+encodeURIComponent(crs.id):'';
    document.title=(crs?crs.title:sec.title)+" | "+data.siteTitle;
    var grp=sec.group?find(data.sections,sec.group):null;
    document.getElementById("crumbs").innerHTML='<a href="index.html">الرئيسة</a><span class="sep">◆</span>'+(grp?'<a href="section.html?id='+encodeURIComponent(grp.id)+'">'+esc(grp.title)+'</a><span class="sep">◆</span>':'')+(crs?'<a href="section.html?id='+encodeURIComponent(sec.id)+'">'+esc(sec.title)+'</a><span class="sep">◆</span><span>'+esc(crs.title)+'</span>':'<span>'+esc(sec.title)+'</span>');
    var pm=document.getElementById("page-mark");if(pm)pm.innerHTML=markOf(sec);
    document.getElementById("page-title").innerHTML='<span class="gold">'+esc(crs?crs.title:sec.title)+'</span>';
    document.getElementById("page-desc").textContent=crs?crs.description:sec.description;
    if(sec.children){document.getElementById("lessons").innerHTML=sec.children.map(function(cid,i){
      var c=find(data.sections,cid);if(!c)return '';
      return '<li class="rv" style="--d:'+i*.06+'s"><a href="section.html?id='+encodeURIComponent(c.id)+'">'+
      '<span class="n">'+pad(i+1)+'</span><div><div class="t">'+esc(c.title)+'</div><div class="s">'+esc(c.description)+'</div></div><span class="go">←</span></a></li>';
    }).join("");}
    else if(crs){document.getElementById("lessons").innerHTML=crs.lessons.map(function(l,i){
      return '<li class="rv" style="--d:'+i*.06+'s"><a href="lesson.html?section='+encodeURIComponent(sec.id)+courseParam+'&lesson='+encodeURIComponent(l.id)+'">'+
      '<span class="n">'+pad(i+1)+'</span><div><div class="t">'+esc(l.title)+'</div><div class="s">'+esc(l.summary)+'</div></div><span class="go">←</span></a></li>';
    }).join("");}
    else{var rows='';
    if(sec.courses){rows+=sec.courses.map(function(c,i){
      return '<li class="rv" style="--d:'+i*.06+'s"><a href="section.html?id='+encodeURIComponent(sec.id)+'&course='+encodeURIComponent(c.id)+'">'+
      '<span class="n">'+pad(i+1)+'</span><div><div class="t"><span class="chip">دورة</span>'+esc(c.title)+'</div><div class="s">'+esc(c.description)+'</div></div><span class="go">←</span></a></li>';
    }).join("");}
    rows+=sec.lessons.map(function(l,i){
      return '<li class="rv" style="--d:'+(i+(sec.courses?sec.courses.length:0))*.06+'s"><a href="lesson.html?section='+encodeURIComponent(sec.id)+'&lesson='+encodeURIComponent(l.id)+'">'+
      '<span class="n">'+pad(i+1+(sec.courses?sec.courses.length:0))+'</span><div><div class="t">'+esc(l.title)+'</div><div class="s">'+esc(l.summary)+'</div></div><span class="go">←</span></a></li>';
    }).join("");
    document.getElementById("lessons").innerHTML=rows||'<li class="rv"><div class="soon-card">قريبًا</div></li>';}
  }

  if(page==="lesson"){
    var sec2=find(allSections,param("section"))||data.sections[0];
    if(sec2.id==="tasis")document.body.classList.add("kids");
    var crs2=param("course")&&sec2.courses?find(sec2.courses,param("course")):null;
    var pool=crs2?crs2.lessons:sec2.lessons;
    var courseParam2=crs2?'&course='+encodeURIComponent(crs2.id):'';
    var les=find(pool,param("lesson"))||pool[0];
    var li=pool.indexOf(les);
    document.title=les.title+" | "+data.siteTitle;
    var grp2=sec2.group?find(data.sections,sec2.group):null;
    document.getElementById("crumbs").innerHTML='<a href="index.html">الرئيسة</a><span class="sep">◆</span>'+(grp2?'<a href="section.html?id='+encodeURIComponent(grp2.id)+'">'+esc(grp2.title)+'</a><span class="sep">◆</span>':'')+'<a href="section.html?id='+encodeURIComponent(sec2.id)+'">'+esc(sec2.title)+'</a><span class="sep">◆</span>'+(crs2?'<a href="section.html?id='+encodeURIComponent(sec2.id)+'&course='+encodeURIComponent(crs2.id)+'">'+esc(crs2.title)+'</a><span class="sep">◆</span>':'')+'<span>'+esc(les.title)+'</span>';
    document.getElementById("page-title").innerHTML='<span class="gold">'+esc(les.title)+'</span>';
    document.getElementById("page-desc").textContent=les.summary||"";
    var lb=document.getElementById("lesson-body");
    var segs=les.segments&&les.segments.length?les.segments:[{verse:les.verse,body:les.body,examples:les.examples,questions:les.questions}];
    var pg=document.getElementById("pager");
    var counters=segs.map(function(sg){return sg.questions&&sg.questions.length?sg.questions.length:0;});
    var segDone=counters.map(function(c){return c===0;});
    for(var u=1;u<segs.length;u++)segDone[u]=counters[u]===0&&segDone[u-1];
    var totalQ=counters.reduce(function(a,b){return a+b;},0);
    var unlocked=segs.map(function(_,i){return i===0;});
    for(var k=1;k<segs.length;k++)unlocked[k]=unlocked[k-1]&&segDone[k-1];
    var preV=(les.segments&&les.segments.length&&les.verse)?'<div class="verse-card rv"><div class="verse-meta">البيت '+ar(les.verse.number)+' ◆ '+esc(les.verse.section)+'</div><div class="verse-text">'+esc(les.verse.text)+'</div></div>':'';
    lb.innerHTML=preV+segs.map(function(sg,si){
      var h='<div class="seg" data-s="'+si+'"'+(unlocked[si]?'':' hidden')+'>';
      if(sg.verse)h+='<div class="verse-card rv"><div class="verse-meta">البيت '+ar(sg.verse.number)+' ◆ '+esc(sg.verse.section)+'</div><div class="verse-text">'+esc(sg.verse.text)+'</div></div>';
      var paras=Array.isArray(sg.body)?sg.body:(sg.body?[sg.body]:[]);
      h+=paras.map(function(p){var cls=/^\s*(تدريب|تمرين)/.test(p)?' tadreeb':'';return '<p class="rv'+cls+'">'+esc(p)+'</p>';}).join("");
      if(sg.examples&&sg.examples.length)h+='<div class="ex-head rv">أمثلة</div>'+sg.examples.map(function(x){return '<p class="rv ex">'+esc(x)+'</p>';}).join("");
      if(counters[si]){
        var laterQ=segs.slice(si+1).some(function(s2){return s2.questions&&s2.questions.length;});
        h+='<div class="ex-head rv">الأسئلة</div><div class="quiz-note rv">'+(laterQ?'أجب على كل الأسئلة إجابة صحيحة لفتح الجزء التالي.':'أجب على كل الأسئلة إجابة صحيحة لفتح الدرس التالي.')+'</div>'+sg.questions.map(function(q,qi){
          return '<div class="q rv" data-s="'+si+'" data-q="'+qi+'"><div class="q-t">'+esc(q.question)+'</div><div class="opts">'+
          q.options.map(function(o,oi){return '<button type="button" class="opt" data-o="'+oi+'"><span class="ol">'+["أ","ب","ج","د"][oi]+'</span>'+esc(o)+'</button>';}).join("")+
          '</div><div class="exp"></div></div>';
        }).join("");
      }
      h+='</div>';
      if(si<segs.length-1)h+='<div class="seg-pass" data-s="'+si+'" hidden><i>◆</i></div>';
      return h;
    }).join("")+(totalQ?'<div class="quiz-done" id="quiz-done" hidden><span class="mark"><i>◆</i></span><div><b>أحسنت، أتممت هذا الدرس</b><span>يمكنك الانتقال إلى الدرس التالي.</span></div></div>':'');
    if(totalQ&&pg)pg.classList.add("locked");
    var doneCount=counters.map(function(){return 0;});
    lb.addEventListener("click",function(e){
      var b=e.target.closest(".opt");if(!b||b.disabled)return;
      var qEl=b.closest(".q"),si=+qEl.getAttribute("data-s"),qi=+qEl.getAttribute("data-q"),oi=+b.getAttribute("data-o"),q=segs[si].questions[qi],exp=qEl.querySelector(".exp");
      if(oi===q.answer){
        b.classList.add("ok");
        qEl.querySelectorAll(".opt").forEach(function(x){x.disabled=true;});
        exp.className="exp show";exp.textContent=q.explanation;
        doneCount[si]++;
        if(doneCount[si]===counters[si]){
          segDone[si]=true;
          var dEl=lb.querySelector('.seg-pass[data-s="'+si+'"]');if(dEl)dEl.hidden=false;
          var nEl=lb.querySelector('.seg[data-s="'+(si+1)+'"]');
          if(nEl){nEl.hidden=false;nEl.scrollIntoView({behavior:"smooth",block:"start"});}
          if(segDone.every(function(x){return x;})){
            var d=document.getElementById("quiz-done");if(d)d.hidden=false;
            if(pg)pg.classList.remove("locked");
          }
        }
      }else{
        b.classList.add("bad");b.disabled=true;
        exp.className="exp show try";exp.textContent="إجابة غير صحيحة، حاول مرة أخرى.";
      }
    });
    function lk(l,lab,c){return l?'<a class="'+c+'" href="lesson.html?section='+encodeURIComponent(sec2.id)+courseParam2+'&lesson='+encodeURIComponent(l.id)+'"><small>'+lab+'</small><b>'+esc(l.title)+'</b></a>':'<a class="empty '+c+'"></a>';}
    var prev=pool[li-1],next=pool[li+1];
    var backTo=crs2?'section.html?id='+encodeURIComponent(sec2.id)+'&course='+encodeURIComponent(crs2.id):'section.html?id='+encodeURIComponent(sec2.id);
    var last=!next?'<a class="nx" href="'+backTo+'"><small>أحسنت، أنهيت القسم</small><b>العودة إلى '+esc(crs2?crs2.title:sec2.title)+'</b></a>':lk(next,"الدرس التالي ←","nx");
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
