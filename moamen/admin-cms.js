/* لوحة التحكم بالمحتوى — محرر مشترك لمنصتي مستر يوسف ومستر مؤمن.
   يعتمد على acct.js (MM: دخول جوجل/بريد + ملف المستخدم) و cms.js (MMCMS: تطبيق التعديلات).
   الصلاحيات: المدير (admins/{uid}) تعديل + نشر. المعلم المقبول (teachers/{uid}) تعديل مسودة فقط.
   التعديلات تُحفظ كوثيقة مسودة cmsDraft/<track> ولا تظهر للطلاب إلا بعد «نشر» (ينسخها المدير إلى cmsLive/<track>). */
(function(){
'use strict';
var CFG=window.MMCMS_ADMIN||{};
var app,db,role=null,user=null;
var track=null,SD=null,OV=null,WC=null,dirty=false,srcKind='none',busy=false;
var curLesson=null,editQ=null,addQSeg=null,addVidSeg=null,addBlkSeg=null,msgT=null;
var SRC_DEF=['أسئلة الكتاب المقرر','امتحانات السنوات السابقة','أسئلة سريعة'];

function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function clone(o){return JSON.parse(JSON.stringify(o));}
function msg(t,ok){var m=$('cmsmsg');if(!m)return;m.textContent=t;m.style.color=ok?'#1a7f4b':'#c0392b';clearTimeout(msgT);msgT=setTimeout(function(){m.textContent='';},6000);}
function ytId(u){u=String(u||'').trim();var m=u.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([\w-]{6,20})/);if(m)return m[1];return /^[\w-]{6,20}$/.test(u)?u:null;}

/* ---------- دخول وصلاحيات ---------- */
function boot(){
  app=$('cmsapp');
  app.innerHTML='<p class="ld">جاري تجهيز اللوحة...</p>';
  MM.load().then(function(ok){
    if(!ok){app.innerHTML='<p class="ld">تعذر الاتصال. اتأكد من الإنترنت وأعد تحميل الصفحة.</p>';return;}
    user=MM.user();
    if(!user){renderLogin();return;}
    db=firebase.firestore();
    db.collection('admins').doc(user.uid).get().then(function(a){
      if(a.exists){role='admin';renderShell();return;}
      db.collection('teachers').doc(user.uid).get().then(function(t){
        if(t.exists&&t.data().status==='approved'){role='teacher';renderShell();}
        else app.innerHTML='<div class="deny"><h2>الصفحة دي خاصة بإدارة الموقع</h2><p>حسابك ('+esc(user.email||'')+') مش مسجل كمدير ولا مساعد. لو ده حساب المدرّس، صاحب الموقع يضيفه من لوحة المعلمين الأول.</p><button class="b" id="out">تسجيل خروج</button></div>',$('out').onclick=function(){MM.signOut().then(function(){location.reload();});};
      });
    }).catch(function(){app.innerHTML='<p class="ld">تعذر التحقق من الصلاحيات. أعد تحميل الصفحة.</p>';});
  });
}
function renderLogin(){
  app.innerHTML='<div class="deny"><h2>لوحة التحكم بالمحتوى</h2><p>سجّل دخولك بحساب الإدارة الأول.</p><button class="b" id="gg">الدخول بحساب جوجل</button></div>';
  $('gg').onclick=function(){$('gg').disabled=true;MM.google().then(function(){location.reload();}).catch(function(e){$('gg').disabled=false;msg(MM.err(e));});};
}

/* ---------- تحميل بيانات التراك ---------- */
var loadedFiles={};
function one(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
function loadTrackFiles(t){
  var p=Promise.resolve();
  (t.files||[]).forEach(function(f){p=p.then(function(){if(loadedFiles[f])return;loadedFiles[f]=1;return one(f);});});
  return p;
}
function pickTrack(id){
  track=id;curLesson=null;editQ=null;addQSeg=null;addVidSeg=null;addBlkSeg=null;
  var t=CFG.tracks[id];
  app.innerHTML='<p class="ld">جاري تحميل محتوى «'+esc(t.label)+'»...</p>';
  loadTrackFiles(t).then(function(){
    SD=window[t.glob];
    if(!SD||!SD.lessons){app.innerHTML='<p class="ld">تعذر تحميل بيانات الصف.</p>';return;}
    tagStatic(SD);
    db.collection('cmsDraft').doc(id).get().then(function(d){
      if(d.exists){OV=d.data()||{};srcKind='draft';}
      else return db.collection('cmsLive').doc(id).get().then(function(l){OV=l.exists?(l.data()||{}):{};srcKind=l.exists?'live':'none';});
      rebuild();
    }).catch(function(){OV={};srcKind='none';rebuild();msg('تعذرت قراءة المسودة من القاعدة — المعروض هو المحتوى الأصلي.');});
  }).catch(function(){app.innerHTML='<p class="ld">تعذر تحميل ملفات المحتوى. أعد تحميل الصفحة.</p>';});
}
function tagStatic(D){
  (D.stages||[]).forEach(function(st,i){st._six=i;});
  (D.lessons||[]).forEach(function(l,i){l._six=i;
    (l.segments||[]).forEach(function(sg,j){sg._sfp=MMCMS.hash(sg.label);sg._six=j;
      (sg.explain||[]).forEach(function(e){e._key=MMCMS.entryKey(e);});
      (sg.questions||[]).forEach(function(q,k){q._sfp=MMCMS.hash(q.q);q._six=k;});
      (sg.check||[]).forEach(function(q,k){q._sfp=MMCMS.hash(q.q);q._six=k;});
    });
  });
}

/* ---------- بناء نسخة العمل ومطابقة التعديلات ---------- */
function rebuild(){
  WC=clone(SD);
  // مطابقة مفاتيح تعديلات الأسئلة الموجودة
  if(OV.questions)for(var k in OV.questions)if(OV.questions.hasOwnProperty(k)){
    var hit=locateQ(WC,OV.questions[k]);if(hit)hit._ovk=k;
  }
  MMCMS.apply(WC,OV,{editor:true});
  // مطابقة الأسئلة والأجزاء المضافة بالمرجع
  (OV.addQuestions||[]).forEach(function(aq,i){
    WC.lessons.forEach(function(l){(l.segments||[]).forEach(function(sg){
      ['questions','check'].forEach(function(g){(sg[g]||[]).forEach(function(q){if(q===aq.q)q._aq=i;});});
    });});
  });
  (OV.addSegments||[]).forEach(function(as,i){
    WC.lessons.forEach(function(l){(l.segments||[]).forEach(function(sg){if(sg.questions===as.questions)sg._as=i;});});
  });
  dirty=dirty;render();
}
function locateQ(D,p){
  var L=(D.lessons||[]).filter(function(l){return l.id===p.lesson;})[0];if(!L)return null;
  function findSeg(){if(!L.segments)return null;var sg=L.segments[p.seg];
    if(sg&&(p.segFp==null||MMCMS.hash(sg.label)===p.segFp))return sg;
    for(var j=0;j<L.segments.length;j++)if(MMCMS.hash(L.segments[j].label)===p.segFp)return L.segments[j];return null;}
  function findQ(arr,ix,fp){if(!arr)return null;var q=arr[ix];
    if(q&&(fp==null||MMCMS.hash(q.q)===fp))return q;
    for(var j=0;j<arr.length;j++)if(MMCMS.hash(arr[j].q)===fp)return arr[j];return null;}
  var sg=L.segments?findSeg():null,hit=null;
  if(sg){hit=findQ(p.grp==='c'?(sg.check||[]):sg.questions,p.ix,p.fp)||findQ(p.grp==='c'?sg.questions:(sg.check||[]),p.ix,p.fp);}
  if(!hit&&L.segments)for(var si=0;si<L.segments.length&&!hit;si++){var s2=L.segments[si];
    hit=findQ(s2.questions,0,p.fp)||findQ(s2.check||[],0,p.fp);}
  return hit;
}

/* ---------- عمليات على وثيقة التعديلات ---------- */
function lp(l){ // تعديلات درس ثابت
  if(l._added){var e=(OV.addLessons||[]).filter(function(a){return a.id===l.id;})[0];return e;}
  OV.lessons=OV.lessons||{};OV.lessons[l.id]=OV.lessons[l.id]||{};return OV.lessons[l.id];
}
function sp(l,st){OV.stages=OV.stages||{};OV.stages[st.id]=OV.stages[st.id]||{};return OV.stages[st.id];}
function segP(l,sg){ // تعديلات جزء (شرح) ثابت
  if(sg._as!=null)return OV.addSegments[sg._as];
  var key='s'+l.id+'_'+sg._six;
  OV.segs=OV.segs||{};if(!OV.segs[key])OV.segs[key]={lesson:l.id,seg:sg._six,segFp:sg._sfp};
  return OV.segs[key];
}
function qEntry(l,sg,q,grp){
  if(q._aq!=null)return OV.addQuestions[q._aq].q; // سؤال مضاف: يُعدَّل مباشرة
  var key=q._ovk||('q'+MMCMS.hash(l.id+'_'+(sg._six!=null?sg._six:'x')+'_'+q._sfp));
  OV.questions=OV.questions||{};
  if(!OV.questions[key])OV.questions[key]={lesson:l.id,seg:(sg._six!=null?sg._six:-1),segFp:sg._sfp||MMCMS.hash(sg.label),ix:q._six||0,fp:q._sfp||MMCMS.hash(q.q),grp:grp};
  q._ovk=key;return OV.questions[key];
}
function touch(){dirty=true;rebuild();}

/* ---------- حفظ ونشر ---------- */
function saveDraft(){
  if(busy)return;busy=true;msg('جاري حفظ المسودة...',true);
  db.collection('cmsDraft').doc(track).set(clone(OV)).then(function(){
    busy=false;dirty=false;srcKind='draft';render();msg('اتحفظت المسودة ✓ — الطلاب لسه شايفين النسخة المنشورة.',true);
  }).catch(function(e){busy=false;msg('فشل الحفظ: '+(e&&e.code||''));});
}
function publish(){
  if(role!=='admin')return;
  if(!confirm('نشر التعديلات؟ كل الطلاب هيشوفوها فورًا.'))return;
  if(busy)return;busy=true;msg('جاري النشر...',true);
  var clean=clone(OV);
  db.collection('cmsLive').doc(track).set(clean).then(function(){
    return db.collection('cmsDraft').doc(track).set(clean);
  }).then(function(){busy=false;dirty=false;srcKind='draft';render();msg('تم النشر ✓ التعديلات ظاهرة دلوقتي لكل الطلاب.',true);
  }).catch(function(e){busy=false;msg('فشل النشر: '+(e&&e.code||''));});
}
function discardDraft(){
  if(!confirm('تجاهل المسودة والرجوع للنسخة المنشورة؟'))return;
  db.collection('cmsDraft').doc(track).delete().then(function(){dirty=false;pickTrack(track);msg('اتجاهلت المسودة.',true);
  }).catch(function(e){msg('فشل: '+(e&&e.code||''));});
}

/* ---------- الواجهة ---------- */
function renderShell(){
  var ids=Object.keys(CFG.tracks);
  var h='<div class="bar"><div><b>لوحة التحكم بالمحتوى</b><span class="who">'+esc(user.email||'')+(role==='admin'?' · مالك الموقع':' · مساعد')+'</span></div>'
    +'<div class="acts"><span id="cmsmsg"></span>'
    +'<button class="b" id="pv">معاينة</button>'
    +'<button class="b" id="sv">حفظ مسودة</button>'
    +(role==='admin'?'<button class="b pub" id="pb">نشر التعديلات</button>':'<span class="hint2">النشر لصاحب الموقع فقط</span>')
    +'<button class="b gry" id="dc">تجاهل المسودة</button></div></div>'
    +'<div class="tabs2">'+ids.map(function(id){return '<button class="tb" data-t="'+id+'">'+esc(CFG.tracks[id].label)+'</button>';}).join('')+'</div>'
    +'<div id="cmsbody"><p class="ld">اختار الصف من فوق.</p></div>';
  app.innerHTML=h;
  ids.forEach(function(id){document.querySelector('[data-t="'+id+'"]').onclick=function(){pickTrack(id);};});
  $('sv').onclick=saveDraft;$('dc').onclick=discardDraft;
  if(role==='admin')$('pb').onclick=publish;else $('pb')&&($('pb').disabled=true);
  $('pv').onclick=function(){if(track)window.open(CFG.preview(track),'blank');};
  pickTrack(ids[0]);
}
function render(){
  var body=$('cmsbody');if(!body||!WC)return;
  var tabs=document.querySelectorAll('.tb');tabs.forEach(function(b){b.classList.toggle('on',b.dataset.t===track);});
  var src={draft:'تشتغل على مسودة غير منشورة',live:'تشتغل على نسخة من المحتوى المنشور',none:'لا توجد تعديلات بعد — تشتغل على المحتوى الأصلي'}[srcKind];
  var h='<div class="stat">'+(dirty?'● تعديلات غير محفوظة':'')+' <span>'+src+'</span>'
    +(window.MMCMS_MISSED&&MMCMS_MISSED.length?' <span class="warn">تنبيه: '+MMCMS_MISSED.length+' تعديل قديم لم يعد مطابقًا للمحتوى.</span>':'')+'</div>';
  h+=curLesson?lessonHTML():treeHTML();
  body.innerHTML=h;wire(body);
}

/* شجرة الوحدات والدروس */
function treeHTML(){
  var h='<button class="b add" id="addLessonTop">+ إضافة درس جديد</button>';
  (WC.stages||[]).forEach(function(st){
    var ls=(WC.lessons||[]).filter(function(l){return l.stage===st.id;});
    if(!ls.length&&st._cmsHidden)return;
    h+='<div class="unit'+(st._cmsHidden?' hid':'')+'"><div class="urow"><input class="ut" data-st="'+st.id+'" value="'+esc(st.title)+'">'
      +'<label class="sw"><input type="checkbox" data-sth="'+st.id+'"'+(st._cmsHidden?'':' checked')+'><span>ظاهر</span></label></div>';
    ls.forEach(function(l,i){
      h+='<div class="lrow'+(l._cmsHidden?' hid':'')+'" data-l="'+l.id+'">'
        +'<span class="mv"><button data-mv="'+l.id+':-1" title="أعلى">▲</button><button data-mv="'+l.id+':1" title="أسفل">▼</button></span>'
        +'<b class="lt">'+esc(l.title)+(l._added?' <em class="nw">جديد</em>':'')+'</b>'
        +'<label class="sw"><input type="checkbox" data-lh="'+l.id+'"'+(l._cmsHidden?'':' checked')+'><span>ظاهر</span></label>'
        +'<button class="b sm" data-ed="'+l.id+'">تعديل</button></div>';
    });
    h+='<button class="b sm add2" data-addl="'+st.id+'">+ درس في «'+esc(st.title)+'»</button></div>';
  });
  return h;
}

/* صفحة تعديل درس */
function curL(){return (WC.lessons||[]).filter(function(l){return l.id===curLesson;})[0];}
function lessonHTML(){
  var l=curL();if(!l){curLesson=null;return treeHTML();}
  var h='<div class="lhead"><button class="b gry" id="back">◂ رجوع</button><input class="lt2" id="ltitle" value="'+esc(l.title)+'">'
    +'<select id="lstage">'+(WC.stages||[]).map(function(st){return '<option value="'+st.id+'"'+(st.id===l.stage?' selected':'')+'>'+esc(st.title)+'</option>';}).join('')+'</select>'
    +'<label class="sw"><input type="checkbox" id="lhid"'+(l._cmsHidden?'':' checked')+'><span>ظاهر</span></label></div>';
  (l.segments||[]).forEach(function(sg,si){
    h+='<div class="seg'+(sg._cmsHidden?' hid':'')+'"><div class="srow"><input class="sl" data-sl="'+si+'" value="'+esc(sg.label)+'">'
      +'<span class="mv"><button data-smv="'+si+':-1">▲</button><button data-smv="'+si+':1">▼</button></span>'
      +'<label class="sw"><input type="checkbox" data-sh="'+si+'"'+(sg._cmsHidden?'':' checked')+'><span>ظاهر</span></label></div>';
    // عناصر الشرح
    h+='<div class="xl">';
    (sg.explain||[]).forEach(function(e,ei){
      var typ=e.v?'🎬 فيديو':(e.img?'🖼 صورة':'📄 نص');
      var cap=e.v?(e.cap||e.v):(e.b?(WC.B&&WC.B[e.b]?strip(WC.B[e.b]):e.b):(e.illus?'توضيح':''));
      var hidden=entryHidden(l,sg,e);
      h+='<div class="xrow'+(hidden?' hid':'')+'"><span class="xt">'+typ+'</span><span class="xc">'+esc(cap).slice(0,90)+'</span>'
        +'<span class="mv"><button data-xmv="'+si+':'+ei+':-1">▲</button><button data-xmv="'+si+':'+ei+':1">▼</button></span>'
        +'<button class="b sm gry" data-xh="'+si+':'+ei+'">'+(hidden?'إظهار':'إخفاء')+'</button></div>';
    });
    h+='</div><div class="addrow"><button class="b sm" data-addv="'+si+'">+ فيديو يوتيوب</button><button class="b sm" data-addb="'+si+'">+ نص</button></div>';
    // الأسئلة
    h+=qGroupHTML(l,sg,si,'q','الأسئلة')+qGroupHTML(l,sg,si,'c','أسئلة سريعة (تقييم ذاتي)');
    h+='<div class="addrow"><button class="b sm add" data-addq="'+si+'">+ إضافة سؤال</button>'
      +(sg._as!=null?'<button class="b sm gry" data-delseg="'+si+'">حذف الجزء المضاف</button>':'')
      +'</div></div>';
  });
  h+='<button class="b add" id="addSeg">+ إضافة جزء شرح جديد</button>';
  return h;
}
function strip(s){return String(s||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();}
function entryHidden(l,sg,e){
  if(sg._as!=null)return false;
  var key='s'+l.id+'_'+sg._six,p=OV.segs&&OV.segs[key];
  return !!(p&&p.hideEntries&&p.hideEntries.indexOf(e._key||MMCMS.entryKey(e))>=0);
}
function qGroupHTML(l,sg,si,grp,title){
  var arr=grp==='c'?(sg.check||[]):(sg.questions||[]);
  var h='<div class="qg"><h4>'+title+'</h4>';
  arr.forEach(function(q,qi){
    var qid=si+':'+grp+':'+qi;
    if(editQ===qid){h+=qFormHTML(l,sg,q,grp,qid);return;}
    var hid=!!q._cmsHidden;
    h+='<div class="qrow'+(hid?' hid':'')+'"><span class="qb">'+esc(q.src||'سؤال')+'</span><span class="qq">'+esc(q.q).slice(0,110)+'</span>'
      +'<span class="mv"><button data-qmv="'+qid+':-1">▲</button><button data-qmv="'+qid+':1">▼</button></span>'
      +'<button class="b sm" data-qe="'+qid+'">تعديل</button>'
      +'<button class="b sm gry" data-qh="'+qid+'">'+(hid?'إظهار':'إخفاء')+'</button></div>';
  });
  if(addQSeg===si&&grp==='q')h+=qFormHTML(l,sg,{t:'mcq',src:SRC_DEF[0],q:'',options:['','',''],a:0},grp,'new',true);
  return h+'</div>';
}
function qFormHTML(l,sg,q,grp,qid,isNew){
  var srcs=SRC_DEF.slice();
  (WC.lessons||[]).forEach(function(x){(x.segments||[]).forEach(function(s2){(s2.questions||[]).concat(s2.check||[]).forEach(function(z){if(z.src&&srcs.indexOf(z.src)<0)srcs.push(z.src);});});});
  var mcq=(q.t||'mcq')==='mcq';
  var h='<div class="qform"><div class="fr"><label>المصدر</label><input id="qf-src" list="srcs" value="'+esc(q.src||SRC_DEF[0])+'"><datalist id="srcs">'+srcs.map(function(s){return '<option value="'+esc(s)+'">';}).join('')+'</datalist></div>'
    +'<div class="fr"><label>نص السؤال</label><textarea id="qf-q" rows="3">'+esc(q.q||'')+'</textarea></div>'
    +'<div class="fr"><label>النوع</label><select id="qf-t"><option value="mcq"'+(mcq?' selected':'')+'>اختيار من متعدد</option><option value="open"'+(!mcq?' selected':'')+'>سؤال مقالي + إجابة نموذجية</option></select></div>'
    +(mcq?'<div class="fr"><label>الاختيارات (كل اختيار في سطر، علّم الصحيحة)</label><textarea id="qf-opt" rows="4">'+esc((q.options||[]).join('\n'))+'</textarea><label class="sw2">رقم الإجابة الصحيحة: <input id="qf-a" type="number" min="1" value="'+((q.a||0)+1)+'" style="width:60px"></label></div>'
       :'<div class="fr"><label>الإجابة النموذجية</label><textarea id="qf-mod" rows="4">'+esc(q.mod||'')+'</textarea></div>')
    +'<div class="fr"><button class="b" data-qs="'+qid+'">حفظ السؤال</button> <button class="b gry" data-qc="'+qid+'">إلغاء</button></div></div>';
  return h;
}

/* ---------- ربط الأحداث ---------- */
function wire(body){
  if($('back'))$('back').onclick=function(){curLesson=null;editQ=null;render();};
  if($('addSeg'))$('addSeg').onclick=function(){
    var l=curL();var label=prompt('عنوان الجزء الجديد (مثال: تطبيقات على الدرس):');if(!label)return;
    OV.addSegments=OV.addSegments||[];OV.addSegments.push({lesson:l.id,label:label,explain:[],questions:[],check:[]});touch();
  };
  if($('ltitle'))$('ltitle').onchange=function(){var l=curL();lp(l).title=this.value;touch();};
  if($('lstage'))$('lstage').onchange=function(){var l=curL();lp(l).stage=this.value;l.stage=this.value;touch();};
  if($('lhid'))$('lhid').onchange=function(){var l=curL();lp(l).hidden=!this.checked;touch();};
  if($('addLessonTop'))$('addLessonTop').onclick=function(){addLesson((WC.stages[0]||{}).id);};
  body.querySelectorAll('[data-addl]').forEach(function(b){b.onclick=function(){addLesson(b.dataset.addl);};});
  body.querySelectorAll('[data-st]').forEach(function(i){i.onchange=function(){var st=WC.stages.filter(function(s){return s.id===i.dataset.st;})[0];sp(null,st).title=i.value;touch();};});
  body.querySelectorAll('[data-sth]').forEach(function(i){i.onchange=function(){var st=WC.stages.filter(function(s){return s.id===i.dataset.sth;})[0];sp(null,st).hidden=!i.checked;touch();};});
  body.querySelectorAll('[data-lh]').forEach(function(i){i.onchange=function(){var l=WC.lessons.filter(function(x){return x.id===i.dataset.lh;})[0];lp(l).hidden=!i.checked;touch();};});
  body.querySelectorAll('[data-ed]').forEach(function(b){b.onclick=function(){curLesson=b.dataset.ed;editQ=null;render();window.scrollTo(0,0);};});
  body.querySelectorAll('[data-mv]').forEach(function(b){b.onclick=function(){
    var p=b.dataset.mv.split(':'),id=p[0],d=+p[1];
    var ix=WC.lessons.findIndex(function(x){return x.id===id;});var jx=ix+d;
    if(jx<0||jx>=WC.lessons.length)return;
    var t=WC.lessons[ix];WC.lessons[ix]=WC.lessons[jx];WC.lessons[jx]=t;
    WC.lessons.forEach(function(l,i2){lp(l).order=i2;});touch();
  };});
  if(curLesson){
    var l=curL();
    body.querySelectorAll('[data-sl]').forEach(function(i){i.onchange=function(){var sg=l.segments[+i.dataset.sl];segP(l,sg).label=i.value;touch();};});
    body.querySelectorAll('[data-sh]').forEach(function(i){i.onchange=function(){var sg=l.segments[+i.dataset.sh];segP(l,sg).hidden=!i.checked;touch();};});
    body.querySelectorAll('[data-smv]').forEach(function(b){b.onclick=function(){
      var p=b.dataset.smv.split(':'),si=+p[0],d=+p[1],jx=si+d;
      if(jx<0||jx>=l.segments.length)return;
      // إعادة ترتيب الأجزاء الثابتة غير مدعومة بوثيقة التعديلات — نحوّلها لترتيب كامل للدرس عبر overlay غير متاح حاليًا
      if(l.segments[si]._as==null||l.segments[jx]._as==null){msg('إعادة ترتيب أجزاء الشرح الأساسية غير متاحة — يمكن الإخفاء والإضافة فقط.');return;}
      var t=l.segments[si];l.segments[si]=l.segments[jx];l.segments[jx]=t;
      // تبديل داخل addSegments نفسها
      var ai=l.segments[si]._as,aj=l.segments[jx]._as;var tmp=OV.addSegments[ai];OV.addSegments[ai]=OV.addSegments[jx];OV.addSegments[jx]=tmp;touch();
    };});
    body.querySelectorAll('[data-xh]').forEach(function(b){b.onclick=function(){
      var p=b.dataset.xh.split(':'),sg=l.segments[+p[0]],e=sg.explain[+p[1]];
      var sp2=segP(l,sg);if(sg._as!=null){msg('عناصر الجزء المضاف تُدار من تعديل الجزء نفسه.');return;}
      sp2.hideEntries=sp2.hideEntries||[];var k=e._key||MMCMS.entryKey(e);var ix=sp2.hideEntries.indexOf(k);
      if(ix>=0)sp2.hideEntries.splice(ix,1);else sp2.hideEntries.push(k);touch();
    };});
    body.querySelectorAll('[data-xmv]').forEach(function(b){b.onclick=function(){
      var p=b.dataset.xmv.split(':'),sg=l.segments[+p[0]],ei=+p[1],d=+p[2],jx=ei+d;
      if(jx<0||jx>=sg.explain.length)return;
      var t=sg.explain[ei];sg.explain[ei]=sg.explain[jx];sg.explain[jx]=t;
      var sp2=segP(l,sg);sp2.entryOrder=sg.explain.map(function(e){return e._key||MMCMS.entryKey(e);});touch();
    };});
    body.querySelectorAll('[data-addv]').forEach(function(b){b.onclick=function(){var si=+b.dataset.addv;
      var url=prompt('رابط فيديو يوتيوب:');if(!url)return;var vid=ytId(url);
      if(!vid){msg('الرابط مش واضح — ابعت رابط يوتيوب كامل.');return;}
      var cap=prompt('عنوان الفيديو (يظهر فوقه):')||'';
      var sg=l.segments[si];var sp2=segP(l,sg);
      if(sg._as!=null){sg.explain.push({v:vid,cap:cap});}
      else{sp2.add=sp2.add||[];sp2.add.push({type:'video',vid:vid,cap:cap});}
      touch();
    };});
    body.querySelectorAll('[data-addb]').forEach(function(b){b.onclick=function(){var si=+b.dataset.addb;
      var txt=prompt('النص (يظهر كفقرة شرح):');if(!txt)return;
      var html='<p class="tx">'+esc(txt)+'</p>';
      var sg=l.segments[si];var sp2=segP(l,sg);
      if(sg._as!=null){var bid='cmsb_'+MMCMS.hash(html);WC.B=WC.B||{};sg.explain.push({b:bid});OV.addSegments[sg._as].blocks=OV.addSegments[sg._as].blocks||{};OV.addSegments[sg._as].blocks[bid]=html;}
      else{sp2.add=sp2.add||[];sp2.add.push({type:'block',html:html});}
      touch();
    };});
    body.querySelectorAll('[data-qe]').forEach(function(b){b.onclick=function(){editQ=b.dataset.qe;render();};});
    body.querySelectorAll('[data-qc]').forEach(function(b){b.onclick=function(){editQ=null;addQSeg=null;render();};});
    body.querySelectorAll('[data-qh]').forEach(function(b){b.onclick=function(){
      var p=b.dataset.qh.split(':'),sg=l.segments[+p[0]],grp=p[1],q=(grp==='c'?sg.check:sg.questions)[+p[2]];
      var e=qEntry(l,sg,q,grp);e.hidden=!q._cmsHidden;touch();
    };});
    body.querySelectorAll('[data-qmv]').forEach(function(b){b.onclick=function(){
      var p=b.dataset.qmv.split(':'),sg=l.segments[+p[0]],grp=p[1],qi=+p[2],d=+p[3];
      var arr=grp==='c'?sg.check:sg.questions;var jx=qi+d;
      if(jx<0||jx>=arr.length)return;
      var t=arr[qi];arr[qi]=arr[jx];arr[jx]=t;
      arr.forEach(function(q,i2){qEntry(l,sg,q,grp).order=i2;});touch();
    };});
    body.querySelectorAll('[data-qs]').forEach(function(b){b.onclick=function(){
      var qid=b.dataset.qs;var t=$('qf-t').value,src=$('qf-src').value.trim()||SRC_DEF[0],qt=$('qf-q').value.trim();
      if(!qt){msg('اكتب نص السؤال الأول.');return;}
      var q;
      if(t==='mcq'){var opts=$('qf-opt').value.split('\n').map(function(x){return x.trim();}).filter(Boolean);
        if(opts.length<2){msg('اكتب اختيارين على الأقل.');return;}
        var a=Math.min(Math.max((parseInt($('qf-a').value,10)||1)-1,0),opts.length-1);
        q={t:'mcq',src:src,q:qt,options:opts,a:a};}
      else{var mod=$('qf-mod').value.trim();q={t:'open',src:src,q:qt,mod:mod};}
      if(qid==='new'){
        var sg=l.segments[addQSeg];
        if(sg._as!=null){sg.questions.push(q);}
        else{OV.addQuestions=OV.addQuestions||[];OV.addQuestions.push({lesson:l.id,seg:sg._six,segFp:sg._sfp,segLabel:sg.label,q:q});}
        addQSeg=null;
      }else{
        var p=qid.split(':'),sg2=l.segments[+p[0]],grp=p[1],old=(grp==='c'?sg2.check:sg2.questions)[+p[2]];
        if(old._aq!=null){OV.addQuestions[old._aq].q=q;}
        else{var e=qEntry(l,sg2,old,grp);e.q=q.q;e.src=q.src;
          if(q.t==='mcq'){e.options=q.options;e.a=q.a;e.mod=null;}
          else{e.mod=q.mod;e.options=null;e.a=null;}}
        editQ=null;
      }
      touch();
    };});
    body.querySelectorAll('[data-addq]').forEach(function(b){b.onclick=function(){addQSeg=+b.dataset.addq;editQ=null;render();};});
    body.querySelectorAll('[data-delseg]').forEach(function(b){b.onclick=function(){var si=+b.dataset.delseg;var sg=l.segments[si];
      if(sg._as!=null&&confirm('حذف الجزء المضاف نهائيًا؟')){OV.addSegments.splice(sg._as,1);touch();}
    };});
    // نوع السؤال داخل الفورم: إعادة رسم عند التغيير
    var qt=$('qf-t');if(qt)qt.onchange=function(){
      var qid=this.closest('.qform').querySelector('[data-qs]').dataset.qs;
      if(qid!=='new'){var p=qid.split(':'),sg=l.segments[+p[0]],grp=p[1],old=(grp==='c'?sg.check:sg.questions)[+p[2]];old.t=this.value;render();}
      else{/* للسؤال الجديد: أعد الرسم بفورم من النوع الآخر */addQSeg=addQSeg;var keep=addQSeg;render();
        var f=document.querySelector('.qform select#qf-t');if(f){f.value=this.value;}}
    };
  }
}
function addLesson(stageId){
  if(!stageId){msg('أضف وحدة أولًا.');return;}
  var title=prompt('عنوان الدرس الجديد:');if(!title)return;
  OV.addLessons=OV.addLessons||[];
  var id='cms'+Date.now().toString(36);
  OV.addLessons.push({id:id,stage:stageId,title:title,segments:[{label:'الشرح',explain:[],questions:[],check:[]}]});
  curLesson=id;touch();
}

/* ---------- تنسيق ---------- */
var css='.ld{padding:30px;text-align:center;font-weight:700;color:#8a8068}'
+'.bar{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;background:#fffdf2;border:2px solid #b7ab90;border-radius:14px;padding:12px 16px;margin:14px 0;box-shadow:3px 3px 0 #b7ab90}'
+'.who{display:block;font-size:12px;color:#8a8068;font-weight:600}'
+'.acts{display:flex;gap:8px;align-items:center;flex-wrap:wrap}'
+'.b{font-family:inherit;font-weight:800;font-size:14px;border:2px solid #2b2b2b;background:#ffd23f;color:#2b2b2b;border-radius:10px;padding:8px 16px;cursor:pointer;box-shadow:2px 2px 0 #2b2b2b}'
+'.b:active{transform:translate(2px,2px);box-shadow:none}'
+'.b.pub{background:#2d5da1;color:#fffdf2}'
+'.b.gry{background:#efe6cf}'
+'.b.sm{padding:4px 10px;font-size:12px}'
+'.b.add{background:#1a7f4b;color:#fff;margin:10px 0}'
+'.b.add2{margin:8px 0 4px}'
+'.hint2{font-size:12px;color:#8a8068;font-weight:700}'
+'.tabs2{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}'
+'.tb{font-family:inherit;font-weight:800;border:2px solid #b7ab90;background:#fffdf2;border-radius:10px;padding:8px 14px;cursor:pointer}'
+'.tb.on{background:#2b2b2b;color:#ffd23f}'
+'.stat{font-size:13px;color:#8a8068;margin:8px 2px;font-weight:700}.stat .warn{color:#c0392b}'
+'.unit{background:#fffdf2;border:2px solid #b7ab90;border-radius:14px;padding:12px 14px;margin:12px 0;box-shadow:3px 3px 0 #b7ab90}'
+'.urow{display:flex;gap:10px;align-items:center;margin-bottom:6px}'
+'.ut{flex:1;font-family:inherit;font-weight:900;font-size:16px;border:none;background:transparent;border-bottom:2px dashed #b7ab90;padding:4px}'
+'.lrow{display:flex;gap:8px;align-items:center;background:#faf4e3;border:1.5px solid #d8cba6;border-radius:10px;padding:8px 10px;margin:6px 0}'
+'.lt{flex:1;font-size:14px}.nw{font-size:11px;color:#1a7f4b;font-style:normal;font-weight:900}'
+'.mv{display:flex;flex-direction:column;gap:2px}.mv button{border:1px solid #b7ab90;background:#fff;border-radius:6px;cursor:pointer;font-size:9px;line-height:1;padding:2px 5px}'
+'.sw{display:flex;gap:4px;align-items:center;font-size:11px;font-weight:800;color:#8a8068;white-space:nowrap}'
+'.hid{opacity:.45}'
+'.lhead{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:14px 0}'
+'.lt2{flex:1;min-width:200px;font-family:inherit;font-weight:900;font-size:17px;border:2px solid #b7ab90;border-radius:10px;padding:8px 12px;background:#fffdf2}'
+'.lhead select{font-family:inherit;font-weight:700;border:2px solid #b7ab90;border-radius:10px;padding:8px;background:#fffdf2}'
+'.seg{background:#fffdf2;border:2px solid #b7ab90;border-radius:14px;padding:12px 14px;margin:12px 0;box-shadow:3px 3px 0 #b7ab90}'
+'.srow{display:flex;gap:8px;align-items:center}'
+'.sl{flex:1;font-family:inherit;font-weight:900;font-size:15px;border:none;background:transparent;border-bottom:2px dashed #b7ab90;padding:4px}'
+'.xl{margin:8px 0}.xrow{display:flex;gap:8px;align-items:center;background:#faf4e3;border:1.5px solid #d8cba6;border-radius:8px;padding:6px 10px;margin:4px 0;font-size:13px}'
+'.xt{white-space:nowrap}.xc{flex:1;color:#6b6148;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
+'.addrow{display:flex;gap:8px;margin:6px 0}'
+'.qg{margin-top:10px}.qg h4{font-size:13px;color:#8a8068;margin:8px 0 4px}'
+'.qrow{display:flex;gap:8px;align-items:center;background:#fdf8ec;border:1.5px solid #d8cba6;border-radius:8px;padding:7px 10px;margin:4px 0}'
+'.qb{flex:none;font-size:10px;font-weight:900;background:#efe6cf;border:1px solid #b7ab90;border-radius:6px;padding:2px 6px;color:#6b6148;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
+'.qq{flex:1;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
+'.qform{background:#fff;border:2px solid #2d5da1;border-radius:12px;padding:12px;margin:8px 0}'
+'.qform .fr{margin:8px 0}.qform label{display:block;font-size:12px;font-weight:800;color:#6b6148;margin-bottom:4px}'
+'.qform input[type=text],.qform input:not([type]),.qform textarea,.qform select{width:100%;font-family:inherit;font-size:14px;border:1.5px solid #b7ab90;border-radius:8px;padding:8px;background:#fffdf2;box-sizing:border-box}'
+'.deny{max-width:520px;margin:60px auto;text-align:center;background:#fffdf2;border:2px solid #b7ab90;border-radius:14px;padding:26px;box-shadow:3px 3px 0 #b7ab90}'
+'.deny p{color:#6b6148;font-size:14px;line-height:1.9}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
