// منطق العرض: يقرأ كل المحتوى من data.js ويرسم الصفحة مع الحركات
(function () {
  var data = window.SITE_DATA || window.SITE_META;
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
  function lessonsCount(s){if(typeof s.count==="number")return s.count;var n=0;if(s.children){s.children.forEach(function(id){var c=find(data.sections,id);if(c)n+=lessonsCount(c);});return n;}n=s.lessons.length;if(s.courses)s.courses.forEach(function(c){n+=c.lessons.length;});return n;}
  var page=document.body.getAttribute("data-page");
  var total=0;data.sections.forEach(function(s){if(!s.children)total+=lessonsCount(s);});

  // علامة القسم: أول حرف من اسمه بعد إسقاط «ال» التعريف
  function miniMark(letter){
    return '<span class="mini"><b>'+esc(letter)+'</b></span>';
  }
  function markOf(s){
    var t=String(s.title).replace(/^ال/,"");
    return '<span class="mark"><i>'+esc(t.charAt(0))+'</i></span>';
  }

  var authUser=null;

  // ---------- الحساب: شريحة الدخول ومزامنة التقدّم ----------
  function paintChip(user){
    var chip=document.getElementById("auth-chip");
    if(!chip||!window.Store||!Store.isReady())return;
    chip.classList.add("show");
    var old=document.getElementById("chip-menu");if(old)old.remove();
    if(!user){
      chip.textContent="دخول";
      chip.setAttribute("href","auth.html");
      chip.onclick=null;
      return;
    }
    var letter=(user.email||"؟").charAt(0).toUpperCase();
    chip.innerHTML=miniMark(letter);
    chip.removeAttribute("href");
    chip.onclick=function(e){
      e.preventDefault();
      var m=document.getElementById("chip-menu");
      if(m){m.remove();return;}
      Store.isAdmin(user).then(function(isAdm){
        var old2=document.getElementById("chip-menu");if(old2)old2.remove();
        var html='<div class="chip-menu open" id="chip-menu"><div class="who">'+esc(user.email||"")+'</div>'+
          '<a class="chip-admin" href="student.html">الاختبارات والألعاب</a>'+
          '<a class="chip-admin" href="teacher.html">لوحة المعلم</a>'+
          (isAdm?'<a class="chip-admin" href="admin.html">لوحة التحكم</a>':'')+
          '<button type="button" id="btn-out">تسجيل الخروج</button></div>';
        document.body.insertAdjacentHTML("beforeend",html);
      document.getElementById("btn-out").addEventListener("click",function(){
        Store.signOut();
      });
        document.addEventListener("click",function h(ev){
          var m2=document.getElementById("chip-menu");
          if(m2&&!m2.contains(ev.target)&&ev.target!==chip&&!chip.contains(ev.target)){m2.remove();document.removeEventListener("click",h);}
        });
      });
    };
  }
  function syncRemoteProgress(user){
    if(!user)return;
    Store.getProgress(user.uid).then(function(done){
      if(!done||!done.length)return;
      var p=progGet();p.completed=p.completed||{};
      var added=0;
      done.forEach(function(id){if(!p.completed[id]){p.completed[id]=Date.now();added++;}});
      if(added){
        try{localStorage.setItem("gharbawy-progress-v1",JSON.stringify(p));}catch(e){}
        if(!sessionStorage.getItem("gh_sync_"+user.uid)){
          sessionStorage.setItem("gh_sync_"+user.uid,"1");
          location.reload();
        }
      }
    });
  }
  function startStore(){
    if(!window.Store)return;
    Store.init().then(function(){
      paintChip(null);
      Store.onAuth(function(user){
        authUser=user;
        paintChip(user);
        if(user)syncRemoteProgress(user);
      });
    });
  }
  if(window.Store){ startStore(); }
  else if(window.StoreReady){ StoreReady.then(function(ok){ if(ok)startStore(); }); }

  // ---------- النطق (لعبة الأطفال) ----------
  var SEQ_OPEN_ALL=true; // مؤقت بطلب الأستاذ: فتح كل الدروس للتجربة — رجّعها false لإعادة قفل التتابع
  var ttsUnlocked=false,ttsVoice=null;
  document.addEventListener("pointerdown",function(){ttsUnlocked=true;},{once:true});
  function pickVoice(){
    if(!("speechSynthesis" in window))return;
    var vs=speechSynthesis.getVoices();
    ttsVoice=vs.find(function(v){return /^ar([-_]|$)/i.test(v.lang)&&/google/i.test(v.name);})||
             vs.find(function(v){return /^ar([-_]|$)/i.test(v.lang);})||null;
  }
  if("speechSynthesis" in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice;}
  function speak(text){
    if(!("speechSynthesis" in window)||!ttsUnlocked||!text)return;
    try{
      speechSynthesis.cancel();
      var u=new SpeechSynthesisUtterance(String(text));
      u.lang="ar-SA";u.rate=.85;
      if(ttsVoice)u.voice=ttsVoice;
      speechSynthesis.speak(u);
    }catch(e){}
  }
  function speakBtn(text){
    return '<button type="button" class="speak" data-say="'+esc(text)+'" aria-label="تشغيل الصوت"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6.5 9H3v6h3.5L11 19V5z" fill="currentColor" stroke="none"/><path d="M15 9a4.2 4.2 0 0 1 0 6"/><path d="M17.6 6.4a8 8 0 0 1 0 11.2"/></svg></button>';
  }

  // ---------- الهيكل المشترك ----------
  var navHTML='<div class="progress" id="progress"></div>'+
  '<nav class="nav" id="nav"><div class="wrap"><a class="brand" href="index.html"><i><b>غ</b></i><span>'+esc(data.siteTitle)+'</span></a>'+
  '<div class="links" id="links"><a href="index.html">الرئيسة</a>'+
  topSections.map(function(s){return '<a href="section.html?id='+encodeURIComponent(s.id)+'">'+esc(s.title)+'</a>';}).join("")+
  '</div><a class="chip" id="auth-chip" href="auth.html">دخول</a><button class="burger" id="burger" aria-label="القائمة"><span class="bl"></span><span class="bl"></span><span class="bl"></span></button></div></div></nav>';
  document.body.insertAdjacentHTML("afterbegin",navHTML);
  var chip0=document.getElementById("auth-chip");if(chip0)chip0.classList.add("show");
  var year=ar(new Date().getFullYear());
  var foot=document.getElementById("footer");
  if(foot)foot.innerHTML='<div class="wrap"><div class="foot-big gold">'+esc(data.siteTitle)+'</div><div class="foot-row"><span>'+esc(data.siteTagline)+'</span><span>'+
   topSections.concat(data.tracks||[]).map(function(s){return '<a href="'+(s.href||('section.html?id='+encodeURIComponent(s.id)))+'" style="margin-inline-start:18px">'+esc(s.title)+'</a>';}).join("")+
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
      '<div class="meta"><span>'+(lessonsCount(s)?ar(lessonsCount(s))+' '+(lessonsCount(s)>2&&lessonsCount(s)<11?'دُرُوس':'دَرْس'):'قريبًا')+'</span><span class="go">←</span></div></a>';
    }).join("");
    var tk=document.getElementById("tracks");
    if(tk&&data.tracks){tk.innerHTML=data.tracks.map(function(s,i){
      var live=data.sections&&data.sections.some(function(x){return x.id===s.id&&(x.live||(x.courses&&x.courses.length)||(x.lessons&&x.lessons.length));});
      return '<a class="tile side rv" style="--d:'+((i%2)*.1)+'s" href="'+(s.href||('section.html?id='+encodeURIComponent(s.id)))+'">'+
      markOf(s)+'<h3>'+esc(s.title)+'</h3><p>'+esc(s.description)+'</p>'+
      '<div class="meta">'+(live?'':'<span>قَرِيبًا</span>')+'<span class="go">←</span></div></a>';
    }).join("");}
    var contentSecs=allSections.filter(function(s){return !s.children;});var stats=[[contentSecs.length,"أَقْسَامٌ",""],[30,"طَالِبٌ","+"],[total,"دَرْسٌ تَفَاعُلِيٌّ","+"]];
    document.getElementById("stats").innerHTML=stats.map(function(x,i){return '<div class="stat rv" style="--d:'+i*.1+'s"><b class="gold">'+x[2]+ar(x[0])+'</b><span>'+x[1]+'</span></div>';}).join("");
  }

  function progGet(){try{return JSON.parse(localStorage.getItem("gharbawy-progress-v1"))||{};}catch(e){return{};}}
  function progDone(id){var p=progGet();return !!(p.completed&&p.completed[id]);}
  function progMark(id){var p=progGet();p.completed=p.completed||{};p.completed[id]=Date.now();try{localStorage.setItem("gharbawy-progress-v1",JSON.stringify(p));}catch(e){}
    if(authUser&&window.Store&&Store.isReady()){Store.setLessonDone(authUser.uid,id,true).catch(function(){});}}
  function progSave(p){try{localStorage.setItem("gharbawy-progress-v1",JSON.stringify(p));}catch(e){}}
  function xpGet(){var p=progGet();return p.xp||0;}
  function xpAdd(n){var p=progGet();p.xp=(p.xp||0)+n;progSave(p);if(authUser&&window.Store&&Store.isReady())Store.syncStats(authUser.uid,p);}
  function lesStarsGet(id){var p=progGet();return (p.stars&&p.stars[id])||0;}
  function lesStarsSet(id,n){var p=progGet();p.stars=p.stars||{};p.stars[id]=Math.max(p.stars[id]||0,n);progSave(p);if(authUser&&window.Store&&Store.isReady())Store.syncStats(authUser.uid,p);}
  function nmTitle(t){var x=String(t||"").replace(/^الدرس\s+[^:：]{1,20}[:：]\s*/,"").trim();return x||t;}
  function dzDecor(){if(!document.body.classList.contains("nour-skin")||document.getElementById("dz-sun"))return;
    var PALM='<path d="M58,165 C56,120 55,90 60,55 L68,55 C70,90 70,120 72,165 Z" fill="#a5713f"/><g fill="#4f9b54"><path d="M64,58 C40,45 20,48 8,62 C28,60 44,62 62,70 Z"/><path d="M64,58 C88,45 108,48 118,64 C98,60 84,63 66,70 Z"/><path d="M64,56 C52,36 34,30 18,34 C36,40 48,50 60,66 Z"/><path d="M64,56 C78,36 96,30 110,36 C92,42 80,52 68,66 Z"/><path d="M64,55 C60,32 50,20 36,16 C50,26 56,40 62,58 Z"/><path d="M64,55 C70,32 82,22 96,18 C82,28 74,42 66,58 Z"/></g><circle cx="58" cy="66" r="6" fill="#c97b2e"/><circle cx="70" cy="68" r="6" fill="#c97b2e"/>';
    document.body.insertAdjacentHTML("beforeend",'<div class="dz-sun" aria-hidden="true"></div>'
    +'<svg class="dz-dunes" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true"><path d="M0,120 C240,60 420,150 720,110 C1020,70 1200,150 1440,100 L1440,220 L0,220 Z" fill="#f2cd8a"/><path d="M0,170 C260,120 520,190 820,150 C1100,115 1300,180 1440,150 L1440,220 L0,220 Z" fill="#eabf74"/></svg>'
    +'<svg class="dz-palm" style="bottom:60px;left:3%;width:130px" viewBox="0 0 120 170" aria-hidden="true">'+PALM+'</svg>'
    +'<svg class="dz-palm" style="bottom:230px;right:8%;width:95px" viewBox="0 0 120 170" aria-hidden="true">'+PALM+'</svg>');}
  function lockRow(num,title){return '<div class="lock-row"><span class="n">'+num+'</span><div><div class="t"><span class="lock-ic" aria-hidden="true"></span>'+esc(title)+'</div><div class="s">أَنْهِ الدَّرْسَ السَّابِقَ أَوَّلًا</div></div></div>';}
  function courseRow(sec,c,i){
    if(!(c.lessons&&c.lessons.length))return '<li class="rv" style="--d:'+i*.06+'s"><div class="soon-row"><span class="n">'+pad(i+1)+'</span><div><div class="t"><span class="chip">قَرِيبًا</span>'+esc(c.title)+'</div></div></div></li>';
    return '<li class="rv" style="--d:'+i*.06+'s"><a href="section.html?id='+encodeURIComponent(sec.id)+'&course='+encodeURIComponent(c.id)+'">'+
    '<span class="n">'+pad(i+1)+'</span><div><div class="t"><span class="chip">دَوْرَةٌ</span>'+esc(c.title)+'</div><div class="s">'+esc(c.description)+'</div>'+(c.price?'<div class="price-row"><del>'+esc(c.price)+'</del><span class="badge">مَجَّانِيَّةً لِفَتْرَةٍ مَحْدُودَةٍ</span></div>':'')+'</div><span class="go">←</span></a></li>';
  }
  if(page==="section"){
    var sec=find(allSections,param("id"))||data.sections[0];
    if(sec.id==="tasis")document.body.classList.add("kids");
    if(sec.id==="manahij")document.body.classList.add("school");
    var crs=param("course")&&sec.courses?find(sec.courses,param("course")):null;
    var courseParam=crs?'&course='+encodeURIComponent(crs.id):'';
    document.title=(crs?crs.title:sec.title)+" | "+data.siteTitle;
    var grp=sec.group?find(data.sections,sec.group):null;
    if(sec.id==="tasis")document.body.classList.add("kids");
    document.getElementById("crumbs").innerHTML='<a href="index.html">الرئيسة</a><span class="sep">◆</span>'+(grp?'<a href="section.html?id='+encodeURIComponent(grp.id)+'">'+esc(grp.title)+'</a><span class="sep">◆</span>':'')+(crs?'<a href="section.html?id='+encodeURIComponent(sec.id)+'">'+esc(sec.title)+'</a><span class="sep">◆</span><span>'+esc(crs.title)+'</span>':'<span>'+esc(sec.title)+'</span>');
    var pm=document.getElementById("page-mark");if(pm)pm.innerHTML=markOf(sec);
    document.getElementById("page-title").innerHTML='<span class="gold">'+esc(crs?crs.title:sec.title)+'</span>';
    document.getElementById("page-desc").textContent=crs?crs.description:sec.description;
    if(crs&&crs.price&&crs.lessons&&crs.lessons.length)document.getElementById("page-desc").insertAdjacentHTML('afterend','<div class="price-row hero-price"><del>'+esc(crs.price)+'</del><span class="badge">مَجَّانِيَّةً لِفَتْرَةٍ مَحْدُودَةٍ</span></div>');
    if(crs&&crs.lessons&&crs.lessons.length){
      var cN=crs.lessons.length,cD=crs.lessons.filter(function(l){return progDone(l.id);}).length;
      var metaH='<div class="course-meta"><span>'+ar(cN)+' '+(cN>2&&cN<11?'دُرُوس':'دَرْس')+'</span><span class="prog-line"><i style="width:'+Math.round(cD/cN*100)+'%"></i></span><span>'+ar(cD)+' / '+ar(cN)+'</span></div>';
      document.getElementById("page-desc").insertAdjacentHTML('afterend',metaH);
      var secLessonsEl=document.getElementById("lessons");
      if(secLessonsEl)secLessonsEl.insertAdjacentHTML('beforebegin','<div class="inst-card rv"><img src="assets/founder.jpg" alt=""><div><b>يوسف مؤمن الغرباوي</b><span>خِرِّيجُ كُلِّيَّةِ دَارِ الْعُلُومِ جَامِعَةِ الْقَاهِرَةِ</span></div></div>');
    }
    if(sec.children){document.getElementById("lessons").innerHTML=sec.children.map(function(cid,i){
      var c=find(data.sections,cid);if(!c)return '';
      return '<li class="rv" style="--d:'+i*.06+'s"><a href="section.html?id='+encodeURIComponent(c.id)+'">'+
      '<span class="n">'+pad(i+1)+'</span><div><div class="t">'+esc(c.title)+'</div><div class="s">'+esc(c.description)+'</div></div><span class="go">←</span></a></li>';
    }).join("");}
    else if(crs&&crs.id==="nour-albayan"){
      var NST='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17l-5.7 3 1.2-6.3L2.8 9.3l6.4-.8z" fill="currentColor"/></svg>';
      var NLK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 1 1 6 0v3H9z" fill="currentColor"/></svg>';
      var LSN=crs.lessons,totSt=0,doneN=0,firstOpen=-1;
      LSN.forEach(function(l){totSt+=lesStarsGet(l.id);if(progDone(l.id))doneN++;});
      var XS=[50,70,50,30],Y0=70,DY=150,MH=Y0+LSN.length*DY+40,pts=[],nodesH='';
      LSN.forEach(function(l,i){
        var xx=XS[i%4],yy=Y0+i*DY;
        pts.push([xx*10,yy]);
        var open=SEQ_OPEN_ALL||i===0||progDone(LSN[i-1].id),dn=progDone(l.id),st=dn?'done':open?'open':'locked';
        if(st==='open'&&firstOpen<0)firstOpen=i;
        var inner=dn?'<b>'+ar(i+1)+'</b><small>'+NST+' '+ar(lesStarsGet(l.id))+'</small>':(st==='locked'?NLK:'<b>'+ar(i+1)+'</b>');
        var pos='style="left:'+xx+'%;top:'+yy+'px"',lpos='style="left:'+xx+'%;top:'+(yy+92)+'px"';
        nodesH+=(st==='locked'
          ?'<span class="nm-node locked" '+pos+'>'+inner+'</span>'
          :'<a class="nm-node '+st+'" '+pos+' href="lesson.html?section='+encodeURIComponent(sec.id)+courseParam+'&lesson='+encodeURIComponent(l.id)+'">'+inner+'</a>')
          +'<span class="nm-lbl" '+lpos+'>'+esc(nmTitle(l.title))+'</span>';
      });
      if(firstOpen<0)firstOpen=LSN.length-1;
      var pd='M'+pts.map(function(p){return p[0]+' '+(p[1]+42);}).join(' L');
      document.getElementById("lessons").innerHTML='<li class="nour-map-li">'
        +'<div class="nm-hud"><span class="nm-pill">'+NST+'<b>'+ar(totSt)+'</b></span><span class="nm-bar"><i style="width:'+Math.round(doneN/LSN.length*100)+'%"></i></span><span class="nm-pill"><b>'+ar(xpGet())+'</b>&nbsp;XP</span></div>'
        +'<div class="nour-map" style="height:'+MH+'px"><svg viewBox="0 0 1000 '+MH+'" preserveAspectRatio="none"><path d="'+pd+'" fill="none"/></svg>'
        +nodesH+'<img class="nm-guide" src="assets/nour/326-camel-mascot-512.png" alt="" style="left:calc('+XS[firstOpen%4]+'% '+(XS[firstOpen%4]>=70?'- 206px':'+ 96px')+');top:'+(pts[firstOpen][1]+8)+'px"></div></li>';
      document.body.classList.add("nour-skin");dzDecor();
    }
    else if(crs){var rowFound=false;document.getElementById("lessons").innerHTML=crs.lessons.map(function(l,i){
      var open=(crs.flow==="poem"?false:SEQ_OPEN_ALL)||i===0||progDone(crs.lessons[i-1].id);
      if(!open)return '<li class="rv locked" style="--d:'+i*.06+'s">'+lockRow(pad(i+1),l.title)+'</li>';
      var dn=progDone(l.id);
      var cur=false;if(!dn&&!rowFound){cur=true;rowFound=true;}
      return '<li class="rv'+(dn?' done':'')+(cur?' current':'')+'" style="--d:'+i*.06+'s"><a href="lesson.html?section='+encodeURIComponent(sec.id)+courseParam+'&lesson='+encodeURIComponent(l.id)+'">'+
      '<span class="n">'+pad(i+1)+'</span><div><div class="t">'+(dn?'<span class="done-ic" aria-hidden="true"></span>':'')+esc(l.title)+'</div><div class="s">'+esc(l.summary)+'</div></div><span class="go">←</span></a></li>';
    }).join("");}
    else{var rows='';
    if(sec.terms){rows+=sec.terms.map(function(t,ti){
      var tcs=(sec.courses||[]).filter(function(c){return c.term===t.id;});
      var h='<li class="rv term-head" style="--d:'+ti*.06+'s"><h3>'+esc(t.title)+'</h3></li>';
      if(!tcs.length)return h+'<li class="rv" style="--d:'+(ti*.06+.03)+'s"><div class="soon-card">قَرِيبًا</div></li>';
      return h+tcs.map(function(c,i){return courseRow(sec,c,i);}).join("");
    }).join("");}
    else if(sec.courses){rows+=sec.courses.map(function(c,i){return courseRow(sec,c,i);}).join("");}
    rows+=sec.lessons.map(function(l,i){
      var open=SEQ_OPEN_ALL||i===0||progDone(sec.lessons[i-1].id);
      if(!open)return '<li class="rv locked" style="--d:'+(i+(sec.courses?sec.courses.length:0))*.06+'s">'+lockRow(pad(i+1+(sec.courses?sec.courses.length:0)),l.title)+'</li>';
      var dn=progDone(l.id);
      return '<li class="rv'+(dn?' done':'')+'" style="--d:'+(i+(sec.courses?sec.courses.length:0))*.06+'s"><a href="lesson.html?section='+encodeURIComponent(sec.id)+'&lesson='+encodeURIComponent(l.id)+'">'+
      '<span class="n">'+pad(i+1+(sec.courses?sec.courses.length:0))+'</span><div><div class="t">'+(dn?'<span class="done-ic" aria-hidden="true"></span>':'')+esc(l.title)+'</div><div class="s">'+esc(l.summary)+'</div></div><span class="go">←</span></a></li>';
    }).join("");
    document.getElementById("lessons").innerHTML=rows||'<li class="rv"><div class="soon-card">قَرِيبًا</div></li>';}
  }

  if(page==="lesson"){
    var lbw=document.getElementById("lesson-body");if(lbw)lbw.innerHTML='<div class="load-pulse" aria-hidden="true">◆</div>';
    var sec2=find(allSections,param("section"))||data.sections[0];
    var crs2pre=param("course")&&sec2.courses?find(sec2.courses,param("course")):null;
    loadLessons(crs2pre||sec2,function(){
    if(sec2.id==="tasis")document.body.classList.add("kids");
    if(sec2.id==="manahij")document.body.classList.add("school");
    var crs2=param("course")&&sec2.courses?find(sec2.courses,param("course")):null;
    var pool=crs2?crs2.lessons:sec2.lessons;
    var courseParam2=crs2?'&course='+encodeURIComponent(crs2.id):'';
    var les=find(pool,param("lesson"))||pool[0];
    var li=pool.indexOf(les);
    // وضع اللعب لدروس المناهج: جلد أطفال للصف الأول، وجلد مدرسي مبهج لباقي المناهج
    var kidCourse=crs2&&(crs2.id==="nour-albayan"||(sec2.id==="manahij"&&crs2.id==="g1-arabic-t1"));
    var gameMode=sec2.id==="manahij"||!!kidCourse;
    var kidSkin=!!kidCourse;
    var nourOv=!!(crs2&&crs2.id==="nour-albayan");var streak=0;
    if(gameMode){document.body.classList.add("game");if(kidSkin){document.body.classList.add("kids");document.body.classList.remove("school");}}
    if(crs2&&crs2.id==="nour-albayan"){document.body.classList.add("nour-skin");dzDecor();var gmi=document.createElement("img");gmi.id="gmascot";gmi.src="assets/nour/326-camel-mascot-512.png";gmi.alt="";document.body.appendChild(gmi);}
    if(crs2&&crs2.id==="nour-albayan"){document.body.insertAdjacentHTML('beforeend',
      '<div class="fx-ov" id="fx-segov"><div class="fx-ov-in"><h2 id="fx-seg-t"></h2><div class="fx-stars" id="fx-seg-stars"></div><div class="fx-badge" id="fx-seg-b"></div><button type="button" class="btn fill" id="fx-seg-n"></button></div></div>'
      +'<div class="fx-ov" id="fx-lvov"><div class="fx-ov-in"><h2>مَرْحَلَةٌ جَدِيدَةٌ مَفْتُوحَةٌ!</h2><div class="fx-stars" id="fx-lv-stars"></div><div class="fx-badge" id="fx-lv-b"></div><button type="button" class="btn fill" id="fx-lv-n">إِلَى الْخَرِيطَةِ</button></div></div>'
      +'<div class="fx-combo" id="fx-combo"></div>');}
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
    var already=progDone(les.id);
    if(already)segDone=segDone.map(function(){return true;});
    var poemMode=!!(crs2&&crs2.flow==="poem");
    function shufQ(q){var idx=q.options.map(function(_,i){return i});for(var i=idx.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=idx[i];idx[i]=idx[j];idx[j]=t;}var o2={question:q.question,audio:q.audio,options:idx.map(function(k){return q.options[k];}),answer:idx.indexOf(q.answer),explanation:q.explanation||""};if(q.optionImages)o2.optionImages=idx.map(function(k){return q.optionImages[k];});if(q.questionImage)o2.questionImage=q.questionImage;return o2;}
    var ordDep=/كل ما سبق|جميع ما سبق|كل ما ذكر|الإجابتان|الخياران|جميع الخيارات|كل الخيارات|أ و ب معًا|بالترتيب نفسه|نفس الترتيب/;segs=segs.map(function(sg){if(!sg.questions||!sg.questions.length)return sg;var c={};for(var k2 in sg)c[k2]=sg[k2];c.questions=sg.questions.map(function(q){var tx=q.question+" "+(q.options||[]).join(" ");return ordDep.test(tx)?q:shufQ(q)});return c;});
    var tapMode=(totalQ===0&&segs.length>1)||poemMode;
    var unlocked=segs.map(function(_,i){return i===0||already;});
    if(!tapMode)for(var k=1;k<segs.length;k++)unlocked[k]=unlocked[k-1]&&segDone[k-1];
    // إعداد اللعب: نجوم، أصوات، سلّم
    var starCfg=(les.stars)||{perCorrectAnswer:1,perfectSegmentBonus:2};
    var starTotal=0,wrongFlags=counters.map(function(){return false;}),doneCount=counters.map(function(){return 0;});
    var STAR_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17l-5.7 3 1.2-6.3L2.8 9.3l6.4-.8z" fill="currentColor"/></svg>';
    var SPK_SVG='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6.5 9H3v6h3.5L11 19V5z" fill="currentColor" stroke="none"/><path d="M15 9a4.2 4.2 0 0 1 0 6"/><path d="M17.6 6.4a8 8 0 0 1 0 11.2"/></svg>';
    function snd(){
      if(!snd.ctx){try{var AC=window.AudioContext||window.webkitAudioContext;snd.ctx=AC?new AC():null;}catch(e){snd.ctx=null;}}
      if(snd.ctx&&snd.ctx.state==="suspended")snd.ctx.resume();
      return snd.ctx;
    }
    function tone(fr,t0,dur,type,vol){
      var c=snd();if(!c)return;
      var o=c.createOscillator(),g=c.createGain();
      o.type=type||"triangle";o.frequency.value=fr;
      g.gain.setValueAtTime(0.0001,c.currentTime+t0);
      g.gain.exponentialRampToValueAtTime(vol||0.12,c.currentTime+t0+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+t0+dur);
      o.connect(g);g.connect(c.destination);
      o.start(c.currentTime+t0);o.stop(c.currentTime+t0+dur+0.05);
    }
    function sndGood(){tone(523.25,0,0.14);tone(783.99,0.09,0.22);}
    function sndBad(){tone(196,0,0.3,"sine",0.09);}
    function sndBonus(){tone(523.25,0,0.12);tone(659.25,0.1,0.12);tone(783.99,0.2,0.12);tone(1046.5,0.3,0.25);}
    function sndWin(){tone(523.25,0,0.14);tone(659.25,0.12,0.14);tone(783.99,0.24,0.14);tone(1046.5,0.36,0.3);tone(1318.5,0.5,0.4);}
    function confetti(n){
      var colors=["#ef476f","#ffd166","#06d6a0","#118ab2","#9b5de5"];
      for(var i=0;i<n;i++){var e=document.createElement("div");e.className="fx-conf";e.style.left=(Math.random()*100)+"vw";e.style.background=colors[i%5];e.style.animationDelay=(Math.random()*.4)+"s";document.body.appendChild(e);(function(el){setTimeout(function(){el.remove();},2400);})(e);}
    }
    function flyStar(fromEl){
      var cEl=document.getElementById("ghud-count");if(!fromEl||!cEl)return;
      var r=fromEl.getBoundingClientRect(),t=cEl.getBoundingClientRect();
      var s=document.createElement("div");s.className="fx-fly";s.innerHTML=STAR_SVG;
      s.style.left=(r.left+r.width/2)+"px";s.style.top=(r.top+r.height/2)+"px";
      document.body.appendChild(s);
      requestAnimationFrame(function(){s.style.left=(t.left+t.width/2)+"px";s.style.top=(t.top+t.height/2)+"px";s.style.opacity=".15";s.style.transform="translate(-50%,-50%) scale(.4)";});
      setTimeout(function(){s.remove();},950);
    }
    function mascotJump(){
      var gm=document.getElementById("gmascot");if(!gm)return;
      gm.classList.remove("jump");void gm.offsetWidth;gm.classList.add("jump");
    }
    function xpAddUI(n){xpAdd(n);var x=document.getElementById("ghud-xp");if(x)x.textContent=ar(xpGet());}
    function ghudBar(){var bf=document.getElementById("ghud-barf");if(!bf)return;var dn=doneCount.reduce(function(a,b){return a+b;},0);bf.style.width=Math.round(dn/Math.max(1,totalQ)*100)+"%";}
    var PRAISE=["أَحْسَنْتَ!","مُمْتَازٌ!","رَائِعٌ!","بَطَلٌ!","مَا شَاءَ اللَّهُ!"];
    function showCombo(n){
      var c=document.getElementById("fx-combo");if(!c)return;
      c.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c2 4-3 5-3 9a6 6 0 0 0 12 0c0-2-1-3-1-3s3 1 3 5a9 9 0 1 1-18 0c0-5 5-7 7-11z" fill="currentColor"/></svg>'+ar(n)+' مُتَتَالِيَةٌ!';
      c.classList.add("on");setTimeout(function(){c.classList.remove("on");},1100);
    }
    function fxStarsHtml(st){return [0,1,2].map(function(i){return '<span style="animation-delay:'+(i*.25)+'s;opacity:'+(i<st?1:.2)+'">'+'★'+'</span>';}).join("");}
    function showSegOv(si){
      var st=wrongFlags[si]?2:3,last=si>=segs.length-1;
      var o=document.getElementById("fx-segov");if(!o)return;
      document.getElementById("fx-seg-t").textContent=PRAISE[si%PRAISE.length];
      document.getElementById("fx-seg-stars").innerHTML=fxStarsHtml(st);
      document.getElementById("fx-seg-b").textContent=st===3?'مِنْ غَيْرِ أَيِّ خَطَأٍ! +٣٠ XP':'+١٥ XP';
      var nb=document.getElementById("fx-seg-n");nb.textContent=last?'أَنْهَيْتُ الْمَرْحَلَةَ':'الْمَقْطَعُ التَّالِي';
      o.classList.add("on");speak(last?'أَحْسَنْتَ':'يَلَّا');
      nb.onclick=function(){
        o.classList.remove("on");
        if(last){showLvOv();return;}
        var dEl=lb.querySelector('.seg-pass[data-s="'+si+'"]');if(dEl)dEl.hidden=false;
        var nEl=lb.querySelector('.seg[data-s="'+(si+1)+'"]');
        if(nEl){nEl.hidden=false;nEl.scrollIntoView({behavior:"smooth",block:"start"});}
      };
    }
    function showLvOv(){
      progMark(les.id);
      var wrongN=wrongFlags.filter(function(x){return x;}).length;
      var st=wrongN===0?3:wrongN<=2?2:1;
      lesStarsSet(les.id,st);xpAddUI(50);
      if(pg)pg.classList.remove("locked");
      sndWin();confetti(140);mascotJump();
      var o=document.getElementById("fx-lvov");if(!o)return;
      document.getElementById("fx-lv-stars").innerHTML=fxStarsHtml(st);
      var nxt=pool[li+1];
      document.getElementById("fx-lv-b").textContent=(nxt?'فُتِحَتِ الْمَرْحَلَةُ '+ar(li+2)+' · ':'')+'+٥٠ XP';
      o.classList.add("on");speak('أَحْسَنْتَ يَا بَطَلُ!');
      document.getElementById("fx-lv-n").onclick=function(){location.href='section.html?id='+encodeURIComponent(sec2.id)+courseParam2;};
    }
    function toast(txt){
      var t=document.createElement("div");t.className="g-toast";t.textContent=txt;document.body.appendChild(t);
      requestAnimationFrame(function(){t.classList.add("on");});
      setTimeout(function(){t.classList.remove("on");setTimeout(function(){t.remove();},400);},1100);
    }
    function bumpStars(n){
      starTotal+=n;
      var cEl=document.getElementById("ghud-count");if(!cEl)return;
      cEl.textContent=ar(starTotal);
      var w=cEl.closest(".ghud-stars");if(w){w.classList.remove("pop");void w.offsetWidth;w.classList.add("pop");}
      var steps=document.querySelectorAll("#ghud-ladder .step:not(.full)");
      for(var i=0;i<n&&i<steps.length;i++)steps[i].classList.add("full");
    }
    if(gameMode&&totalQ>0){
      var lad='';for(var ls=0;ls<totalQ;ls++)lad+='<span class="step"></span>';
      document.getElementById("page-desc").insertAdjacentHTML('afterend',
        '<div class="ghud" id="ghud"><div class="ghud-stars"><span class="gs-ic">'+STAR_SVG+'</span><span class="gs-lb">نُجُومُكَ</span><b id="ghud-count">٠</b></div><div class="ghud-ladder" id="ghud-ladder">'+lad+'</div>'+(nourOv?'<div class="ghud-bar"><i id="ghud-barf"></i></div><div class="ghud-xp"><b id="ghud-xp">'+ar(xpGet())+'</b><span>XP</span></div>':'')+'</div>');
    }
    function reduceT(s){
      if(!kidSkin) return s;
      return String(s).split(/(\s+)/).map(function(w){
        var base=w.replace(/[\u064B-\u0652\u0670]/g,'');
        var letters=base.replace(/[^\u0621-\u064A\u0671\u0623\u0625\u0622\u0627]/g,'');
        if(letters.length<=1) return w;
        return w.replace(/[\u064B-\u0650\u0652\u0670]/g,'');
      }).join('');
    }
    var preV=(les.segments&&les.segments.length&&les.verse)?'<div class="verse-card rv"><div class="verse-meta">البيت '+ar(les.verse.number)+' ◆ '+esc(les.verse.section)+'</div><div class="verse-text">'+esc(les.verse.text)+'</div></div>':'';
    if(les['شاهد'])preV+='<div class="verse-card rv"><div class="verse-meta">الشاهد</div><div class="verse-text">'+esc(String(les['شاهد']).split('***').join('\n'))+'</div></div>';
    if(les.images&&les.images.length)preV+=les.images.map(function(im){return '<figure class="les-img rv"><img src="'+esc(im.src)+'" alt="'+esc(im.alt||'')+'" loading="lazy"></figure>';}).join('');
    lb.innerHTML=preV+segs.map(function(sg,si){
      var h='<div class="seg'+(gameMode?' g-seg':'')+'" data-s="'+si+'"'+(unlocked[si]?'':' hidden')+'>';
      if(sg.verse)h+='<div class="verse-card rv"><div class="verse-meta">البيت '+ar(sg.verse.number)+' ◆ '+esc(sg.verse.section)+'</div><div class="verse-text">'+esc(sg.verse.text)+'</div></div>';
      var paras=Array.isArray(sg.body)?sg.body:(sg.body?[sg.body]:[]);
      h+=paras.map(function(p){var cls=/^\s*(تدريب|تمرين)/.test(p)?' tadreeb':'';return '<p class="rv'+cls+'">'+esc(reduceT(p))+'</p>';}).join("");
      if(sg.examples&&sg.examples.length)h+='<div class="ex-head ex-h rv">أمثلة</div><div class="ex-wrap">'+sg.examples.map(function(x){return '<p class="rv ex">'+esc(reduceT(x))+'</p>';}).join("")+'</div>';
      if(sg.images&&sg.images.length)h+=sg.images.map(function(im){return '<figure class="les-img rv"><img src="'+esc(im.src)+'" alt="'+esc(im.alt||'')+'" loading="lazy"></figure>';}).join('');
      if(sg.game&&kidSkin)h+='<div class="g-name rv">'+esc(sg.game)+'</div>';
      if(sg.vocab&&sg.vocab.length)h+='<div class="ex-head rv">الْمُفْرَدَاتُ</div><div class="vocab">'+sg.vocab.map(function(v){return '<div class="voc rv"><b>'+esc(v[0])+'</b><span>'+esc(v[1])+'</span></div>';}).join("")+'</div>';
      if(sg.meaning&&sg.meaning.length)h+='<div class="ex-head rv">الْمَعْنَى</div>'+sg.meaning.map(function(m){return '<div class="mean rv"><b>'+esc(m[0])+'</b><p>'+esc(m[1])+'</p></div>';}).join("");
      if(sg.words&&sg.words.length)h+='<div class="wf" data-s="'+si+'"><div class="wf-head"><div class="wf-pill">★ <b class="wf-cnt">٠</b></div><div class="wf-bar"><i class="wf-fill"></i></div></div><div class="wf-card"></div><div class="wf-dots"></div><div class="wf-row"><button type="button" class="wf-say" aria-label="سماع">'+SPK_SVG+'</button><button type="button" class="wf-nx">التَّالِي <span class="ar">←</span></button></div></div>';
      if(counters[si]){
        var laterQ=segs.slice(si+1).some(function(s2){return s2.questions&&s2.questions.length;});
        h+='<div class="ex-head rv">الأسئلة</div><div class="quiz-note rv">'+(laterQ?'أَجِبْ عَلَى كُلِّ الْأَسْئِلَةِ إِجَابَةً صَحِيحَةً لِفَتْحِ الْجُزْءِ التَّالِي.':'أَجِبْ عَلَى كُلِّ الْأَسْئِلَةِ إِجَابَةً صَحِيحَةً لِفَتْحِ الدَّرْسِ التَّالِي.')+'</div>'+sg.questions.map(function(q,qi){
          return '<div class="q rv'+(qi>0?' q-hidden':'')+'" data-s="'+si+'" data-q="'+qi+'"><div class="q-t">'+esc(q.question)+(kidSkin?speakBtn(q.audio||q.question):"")+'</div>'+
          (q.questionImage?'<figure class="q-img rv"><img src="'+esc(q.questionImage)+'" alt="" loading="lazy"></figure>':'')+
          '<div class="opts'+(q.optionImages?' has-imgs':'')+'">'+
          q.options.map(function(o,oi){var im=q.optionImages&&q.optionImages[oi];return '<button type="button" class="opt'+(im?' has-img':'')+'" data-o="'+oi+'" data-say="'+esc(o)+'">'+(im?'<span class="oi"><img src="'+esc(im)+'" alt="'+esc(o)+'" loading="lazy"></span>':'<span class="ol">'+["أ","ب","ج","د"][oi]+'</span>')+'<span class="ot">'+esc(reduceT(o))+'</span></button>';}).join("")+
          '</div><div class="exp"></div></div>';
        }).join("");
      }
      if(tapMode&&si<segs.length-1&&!(sg.words&&sg.words.length))h+='<div class="seg-next-wrap"><button type="button" class="btn fill seg-next" data-s="'+si+'">'+(poemMode?'جَاهِزٌ':'الْجُزْءُ التَّالِي')+' <span class="ar">←</span></button></div>';
      h+='</div>';
      if(si<segs.length-1)h+='<div class="seg-pass" data-s="'+si+'" hidden><i>◆</i></div>';
      return h;
    }).join("")+((totalQ>0||tapMode)?'<div class="quiz-done" id="quiz-done" hidden><span class="mark"><i>◆</i></span><div><b>'+(kidSkin?'أَحْسَنْتَ يَا بَطَلُ!':'أَحْسَنْتَ، أَتَمْمْتَ هَذَا الدَّرْسَ')+'</b><span>يُمْكِنُكَ الِانْتِقَالُ إِلَى الدَّرْسِ التَّالِي.</span></div>'+(pool[li+1]?'<a class="btn fill next-les" href="lesson.html?section='+encodeURIComponent(sec2.id)+courseParam2+'&lesson='+encodeURIComponent(pool[li+1].id)+'">الدَّرْسُ التَّالِي <span class="ar">←</span></a>':'')+'</div>':'');
    if((totalQ>0||tapMode)&&pg&&!already)pg.classList.add("locked");
    if(totalQ===0&&!tapMode&&!already)progMark(les.id);
    if(tapMode)lb.addEventListener("click",function(e){
      var nb=e.target.closest(".seg-next");if(!nb)return;
      var si=+nb.getAttribute("data-s"),nx=si+1;
      var w=nb.closest(".seg-next-wrap");if(w)w.remove();
      var dEl=lb.querySelector('.seg-pass[data-s="'+si+'"]');if(dEl)dEl.hidden=false;
      var nEl=lb.querySelector('.seg[data-s="'+nx+'"]');
      if(nEl){nEl.hidden=false;nEl.scrollIntoView({behavior:"smooth",block:"start"});}
      if(poemMode){var pEl=lb.querySelector('.seg[data-s="'+si+'"]');if(pEl)pEl.hidden=true;}
      if(nx===segs.length-1&&counters[nx]===0){progMark(les.id);var d=document.getElementById("quiz-done");if(d)d.hidden=false;if(pg)pg.classList.remove("locked");}
    });
    lb.querySelectorAll(".wf").forEach(function(w){
      var wsi=+w.getAttribute("data-s"),WL=segs[wsi].words,wi=0;
      var wcard=w.querySelector(".wf-card"),wdots=w.querySelector(".wf-dots"),wfill=w.querySelector(".wf-fill"),wcnt=w.querySelector(".wf-cnt");
      function wfShow(){
        wcard.classList.remove("pop");void wcard.offsetWidth;wcard.classList.add("pop");
        wcard.textContent=WL[wi];
        wdots.innerHTML=WL.map(function(_,k){return '<span class="wf-d'+(k<wi?' on':'')+(k===wi?' c':'')+'"></span>';}).join("");
        if(wfill)wfill.style.width=(wi/WL.length*100)+"%";
        if(wcnt)wcnt.textContent=ar(wi);
        speak(WL[wi]);
      }
      function wfDone(){
        if(wfill)wfill.style.width="100%";
        if(wcnt)wcnt.textContent=ar(WL.length);
        var nx=wsi+1;
        var dEl=lb.querySelector('.seg-pass[data-s="'+wsi+'"]');if(dEl)dEl.hidden=false;
        var nEl=lb.querySelector('.seg[data-s="'+nx+'"]');
        if(nEl){nEl.hidden=false;nEl.scrollIntoView({behavior:"smooth",block:"start"});}
        else{
          progMark(les.id);
          var d=document.getElementById("quiz-done");if(d)d.hidden=false;
          if(pg)pg.classList.remove("locked");
          if(gameMode){sndWin();confetti(60);mascotJump();}
          speak('أَحْسَنْتَ يَا بَطَلُ!');
        }
      }
      w.querySelector(".wf-say").addEventListener("click",function(){speak(WL[wi]);});
      w.querySelector(".wf-nx").addEventListener("click",function(){wi++;if(wi>=WL.length){wfDone();return;}wfShow();});
      wfShow();
    });
    lb.addEventListener("click",function(e){
      var b=e.target.closest(".opt");if(!b||b.disabled)return;
      var qEl=b.closest(".q"),si=+qEl.getAttribute("data-s"),qi=+qEl.getAttribute("data-q"),oi=+b.getAttribute("data-o"),q=segs[si].questions[qi],exp=qEl.querySelector(".exp");if(gameMode){var sgEl0=lb.querySelector('.seg[data-s="'+si+'"]');if(sgEl0)sgEl0.classList.add("solving");}
      if(kidSkin&&q.audio&&!b.classList.contains("picked")){
        qEl.querySelectorAll(".opt").forEach(function(x){x.classList.remove("picked");});
        b.classList.add("picked");
        speak(b.getAttribute("data-say"));
        return;
      }
      if(kidSkin)qEl.querySelectorAll(".opt").forEach(function(x){x.classList.remove("picked");});
      if(oi===q.answer){
        b.classList.add("ok");
        qEl.querySelectorAll(".opt").forEach(function(x){x.disabled=true;});
        exp.className="exp show";exp.textContent=reduceT(q.explanation||"");
        var nxQ=qEl.parentElement.querySelector('.q[data-s="'+si+'"][data-q="'+(qi+1)+'"]');
        if(nxQ){setTimeout(function(){nxQ.classList.remove('q-hidden');nxQ.scrollIntoView({behavior:"smooth",block:"center"});},700);}
        doneCount[si]++;
        if(gameMode){sndGood();bumpStars(starCfg.perCorrectAnswer||1);toast('أَحْسَنْتَ!');flyStar(b);mascotJump();if(kidSkin){confetti(18);speak('أَحْسَنْتَ!');}}
        if(nourOv){streak++;if(streak>=3)showCombo(streak);xpAddUI(wrongFlags[si]?5:10);ghudBar();}
        if(doneCount[si]===counters[si]){
          segDone[si]=true;
          if(gameMode&&!wrongFlags[si]&&counters[si]>0){bumpStars(starCfg.perfectSegmentBonus||2);sndBonus();confetti(35);}
          if(nourOv){
            xpAddUI(wrongFlags[si]?15:30);
            if(si<segs.length-1){var dEl0=lb.querySelector('.seg-pass[data-s="'+si+'"]');if(dEl0)dEl0.hidden=false;}
            showSegOv(si);
          }else{
          var dEl=lb.querySelector('.seg-pass[data-s="'+si+'"]');if(dEl)dEl.hidden=false;
          var nEl=lb.querySelector('.seg[data-s="'+(si+1)+'"]');
          if(nEl){nEl.hidden=false;nEl.scrollIntoView({behavior:"smooth",block:"start"});}
          if(segDone.every(function(x){return x;})){
            progMark(les.id);
            var d=document.getElementById("quiz-done");if(d)d.hidden=false;
            if(gameMode){sndWin();confetti(90);}
            if(pg)pg.classList.remove("locked");
          }
          }
        }
      }else{
        b.classList.add("bad");b.disabled=true;
        wrongFlags[si]=true;
        if(gameMode)sndBad();if(kidSkin&&q.audio)setTimeout(function(){speak(q.audio);},900);if(nourOv)streak=0;
        exp.className="exp show try";exp.textContent="إِجَابَةٌ غَيْرُ صَحِيحَةٍ. رَاجِعِ الشَّرْحَ بِالْأَعْلَى ثُمَّ حَاوِلْ مِنْ جَدِيدٍ.";
        setTimeout(function(){
          lb.querySelectorAll('.q[data-s="'+si+'"]').forEach(function(q2){
            q2.querySelectorAll(".opt").forEach(function(x){x.disabled=false;x.classList.remove("ok","bad");});
            var ex2=q2.querySelector(".exp");ex2.className="exp";ex2.textContent="";
          });
          doneCount[si]=0;
          var segEl=lb.querySelector('.seg[data-s="'+si+'"]');
          if(segEl){segEl.classList.remove("solving");segEl.scrollIntoView({behavior:"smooth",block:"start"});}
        },1400);
      }
    });
    lb.addEventListener("click",function(e){
      var sp=e.target.closest(".speak");if(!sp)return;
      e.preventDefault();e.stopPropagation();
      speak(sp.getAttribute("data-say"));
    });
    if(kidSkin&&"IntersectionObserver" in window){
      var qio=new IntersectionObserver(function(es){es.forEach(function(en){
        if(en.isIntersecting&&!en.target.dataset.spoken&&ttsUnlocked){
          en.target.dataset.spoken="1";
          var s=en.target.querySelector(".speak");if(s)speak(s.getAttribute("data-say"));
          qio.unobserve(en.target);
        }
      });},{threshold:.6});
      lb.querySelectorAll(".q").forEach(function(q){qio.observe(q);});
    }
    function lk(l,lab,c){return l?'<a class="'+c+'" href="lesson.html?section='+encodeURIComponent(sec2.id)+courseParam2+'&lesson='+encodeURIComponent(l.id)+'"><small>'+lab+'</small><b>'+esc(l.title)+'</b></a>':'<a class="empty '+c+'"></a>';}
    var prev=pool[li-1],next=pool[li+1];
    var backTo=crs2?'section.html?id='+encodeURIComponent(sec2.id)+'&course='+encodeURIComponent(crs2.id):'section.html?id='+encodeURIComponent(sec2.id);
    var last=!next?'<a class="nx" href="'+backTo+'"><small>أَحْسَنْتَ، أَنْهَيْتَ الْقِسْمَ</small><b>الْعَوْدَةُ إِلَى '+esc(crs2?crs2.title:sec2.title)+'</b></a>':lk(next,"الدَّرْسُ التَّالِي ←","nx");
    document.getElementById("pager").innerHTML=lk(prev,"→ الدَّرْسُ السَّابِقُ","pv")+last;
    });
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
