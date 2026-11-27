/* لوحة تحكم المحتوى - منصة مستر يوسف.
   مالك + مساعدون: تعديل/إخفاء/إضافة/ترتيب مراحل ودروس ونصوص وفيديوهات وأسئلة.
   التعديلات تتحفظ كمسودة (cmsDraft) ولا تظهر للطلاب إلا بعد النشر (cmsLive). */
(function(){
'use strict';
var TRACKS={
 g1:{name:'أولى ابتدائي',glob:'AR_G1',files:['ar-g1','ar-g1-simplify']},
 g8ar:{name:'تانية إعدادي',glob:'AR_G8',files:['ar-g8','ar-g8-simplify','ar-g8-pre','ar-g8-nahw','ar-g8-u1','ar-g8-u1b','ar-g8-u1c','ar-g8-u1d','ar-g8-u2','ar-g8-u2b','ar-g8-u2c','ar-g8-u3','ar-g8-u3b','ar-g8-u3c','ar-g8-bal','ar-g8-bal2','ar-g8-imla','ar-g8-tabeer','ar-g8-tahaddath','ar-g8-qb1','ar-g8-qb1b','ar-g8-qb1c']},
 g7az:{name:'أولى إعدادي أزهر',glob:'AR_G7AZ',files:['ar-g7az','ar-g7az-simplify','ar-g7az-mot','ar-g7az-fonon','ar-g7az-exams','ar-g7az-nahw-e','ar-g7az-nahw-a','ar-g7az-nahw-b','ar-g7az-nahw-c','ar-g7az-nahw-d','ar-g7az-unit1','ar-g7az-unit2','ar-g7az-rev']}
};
var auth,db,user=null,role=null,track=null,PD=null,ov=null,dirty=false,view={kind:'tree',open:{},lesson:null};
var siteOv=null,siteDirty=false,curTab='content';
var $=function(id){return document.getElementById(id);};
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function stripTags(h){var d=document.createElement('div');d.innerHTML=h||'';return (d.textContent||'').replace(/\s+/g,' ').trim();}
function snip(h,n){var t=stripTags(h);return t.length>(n||60)?t.slice(0,n||60)+'…':t;}
function hash(s){return MMCMS.hash(s);}
function errMsg(e){var c=(e&&e.code)||'';
 var m={'auth/invalid-credential':'البيانات غلط. راجع الإيميل وكلمة السر.','auth/wrong-password':'كلمة السر غلط.','auth/user-not-found':'مفيش حساب بالبيانات دي.','auth/email-already-in-use':'الإيميل ده مسجل قبل كده.','auth/weak-password':'كلمة السر لازم ٦ حروف أو أرقام على الأقل.','auth/invalid-email':'اكتب إيميل صحيح.','auth/too-many-requests':'محاولات كتير. استنى شوية.','auth/network-request-failed':'مفيش إنترنت دلوقتي.','permission-denied':'مفيش صلاحية للعملية دي.'};
 return m[c]||'حصلت مشكلة. جرّب تاني.';}

firebase.initializeApp(window.FIREBASE_CONFIG);
auth=firebase.auth();db=firebase.firestore();

/* ---------- الدخول والصلاحيات ---------- */
function showGate(msg){$('loading').hidden=true;$('app').hidden=true;$('saveBar').hidden=true;$('gate').hidden=false;if(msg){$('gMsg').textContent=msg;$('gMsg').className='adm-msg';}}
function resolveRole(u){
 return db.collection('admins').doc(u.uid).get().then(function(d){
  if(d.exists)return {owner:true,perms:{view:true,edit:true,publish:true,texts:true}};
  return db.collection('staff').doc(u.uid).get().then(function(s){
   if(s.exists){var p=(s.data()&&s.data().perms)||{};return {owner:false,name:(s.data()||{}).name||'',perms:{view:true,edit:!!p.edit,publish:!!p.publish,texts:!!p.texts}};}
   /* مالك عن طريق config/admin: نجرب قراءة قائمة الفريق (مسموحة للمالك فقط) */
   return db.collection('staff').limit(1).get().then(function(){return {owner:true,perms:{view:true,edit:true,publish:true,texts:true}};}).catch(function(){return null;});
  });
 }).catch(function(){return null;});
}
function canEdit(){return role&&(role.owner||role.perms.edit);}
function canPublish(){return role&&(role.owner||role.perms.publish);}
function canTexts(){return role&&(role.owner||role.perms.texts);}
auth.onAuthStateChanged(function(u){
 if(!u){user=null;role=null;showGate();return;}
 user=u;$('loading').hidden=false;
 resolveRole(u).then(function(r){
  $('loading').hidden=true;
  if(!r){showGate('الحساب ده ملوش صلاحية على لوحة المحتوى.');auth.signOut();return;}
  role=r;$('gate').hidden=true;$('app').hidden=false;
  $('whoEmail').textContent=u.email||'';
  $('whoRole').textContent=r.owner?'مالك':'مساعد';
  $('whoRole').className='adm-badge'+(r.owner?' owner':'');
  $('tabTeam').hidden=!r.owner;
  $('tabTexts').hidden=!canTexts();
  $('tabHistory').hidden=!canPublish();
  $('btnSave').disabled=!canEdit();$('btnPublish').disabled=!canPublish();
  if(!canEdit())$('draftInfo').hidden=false,$('draftInfo').textContent='صلاحيتك «عرض فقط»: تقدر تشوف كل حاجة من غير ما تغيّر.';
  if(!track)pickTrack('g1');
 });
});
$('gGo').onclick=function(){var em=$('gEmail').value.trim(),pw=$('gPass').value;
 if(!em||!pw){$('gMsg').textContent='اكتب الإيميل وكلمة السر.';return;}
 $('gGo').disabled=true;$('gMsg').textContent='ثواني…';$('gMsg').className='adm-msg ok';
 auth.signInWithEmailAndPassword(em,pw).catch(function(e){$('gMsg').textContent=errMsg(e);$('gMsg').className='adm-msg';$('gGo').disabled=false;});};
$('gPass').addEventListener('keydown',function(e){if(e.key==='Enter')$('gGo').click();});
$('gGoogle').onclick=function(){
 $('gGoogle').disabled=true;$('gMsg').textContent='ثواني… بنحوّلك لجوجل';$('gMsg').className='adm-msg ok';
 var pr=new firebase.auth.GoogleAuthProvider();
 auth.signInWithRedirect(pr).catch(function(e){$('gMsg').textContent=errMsg(e);$('gMsg').className='adm-msg';$('gGoogle').disabled=false;});
};
auth.getRedirectResult().catch(function(e){if(e&&e.code&&e.code!=='auth/no-auth-event'){$('gMsg').textContent=errMsg(e);$('gMsg').className='adm-msg';$('gGoogle').disabled=false;}});
$('gForgot').onclick=function(){var em=$('gEmail').value.trim();if(!em){$('gMsg').textContent='اكتب إيميلك فوق الأول.';return;}
 auth.sendPasswordResetEmail(em).then(function(){$('gMsg').textContent='بعتنا لك رابط تغيير كلمة السر. شوف Spam كمان.';$('gMsg').className='adm-msg ok';}).catch(function(e){$('gMsg').textContent=errMsg(e);$('gMsg').className='adm-msg';});};
$('btnOut').onclick=function(){auth.signOut();};

/* ---------- تحميل بيانات الصف ---------- */
function one(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
function loadTrack(t){
 var TC=TRACKS[t],cb='?t='+Math.floor(Date.now()/300000);
 return TC.files.reduce(function(p,f){return p.then(function(){return one('assets/data/'+f+'.js'+cb);});},Promise.resolve())
  .then(function(){
   PD=JSON.parse(JSON.stringify(window[TC.glob]||{stages:[],B:{},lessons:[]}));
   PD.stages=PD.stages||[];PD.B=PD.B||{};PD.lessons=PD.lessons||[];
   return db.collection('cmsDraft').doc(t).get().then(function(d){
    if(d.exists)return d.data();
    return db.collection('cmsLive').doc(t).get().then(function(l){return l.exists?l.data():{};}).catch(function(){return {};});
   }).catch(function(){return {};})
   .then(function(d){ov=normOv(d);dirty=false;paintBar();});
  });
}
function normOv(d){d=d||{};return {stages:d.stages||{},lessons:d.lessons||{},blocks:d.blocks||{},questions:d.questions||{},addQuestions:d.addQuestions||[],segs:d.segs||{},addSegments:d.addSegments||[],addLessons:d.addLessons||[]};}
function pickTrack(t){
 track=t;view={kind:'tree',open:{},lesson:null};
 var ch=$('trackChips');ch.innerHTML='';
 Object.keys(TRACKS).forEach(function(k){var b=document.createElement('button');b.textContent=TRACKS[k].name;if(k===t)b.className='on';
  b.onclick=function(){if(dirty&&!confirm('في تعديلات مش محفوظة في المسودة. تكمل وتنساها؟'))return;pickTrack(k);};ch.appendChild(b);});
 $('treeBox').innerHTML='<div class="adm-load">جارٍ تحميل بيانات الصف…</div>';$('editorBox').innerHTML='';
 loadTrack(t).then(function(){render();}).catch(function(e){$('treeBox').innerHTML='<div class="adm-note">تعذّر تحميل البيانات: '+esc(errMsg(e))+'</div>';});
}

/* ---------- الحالة الفعالة (ثابت + تعديلات) ---------- */
function effStages(){
 return PD.stages.map(function(st,ix){var p=ov.stages[st.id]||{};
  return {id:st.id,title:p.title||st.title,hidden:!!p.hidden,ord:(p.order!=null?p.order:(st.n!=null?st.n:ix)),ix:ix};})
  .sort(function(a,b){return a.ord-b.ord||a.ix-b.ix;});
}
function stageHidden(id){var p=ov.stages[id];return !!(p&&p.hidden);}
function effLessons(stageId){
 var list=PD.lessons.map(function(l,ix){var p=ov.lessons[l.id]||{};
  return {id:l.id,title:p.title||l.title,hidden:!!p.hidden||stageHidden(l.stage),stage:l.stage,ord:(p.order!=null?p.order:null),ix:ix,cms:false};});
 ov.addLessons.forEach(function(al,ix){list.push({id:al.id,title:al.title,hidden:!!al.hidden||stageHidden(al.stage),stage:al.stage,ord:(al.order!=null?al.order:null),ix:1000+ix,cms:true});});
 return list.filter(function(l){return l.stage===stageId;})
  .sort(function(a,b){return (a.ord!=null?a.ord:a.ix)-(b.ord!=null?b.ord:b.ix);});
}
function findPLesson(id){return PD.lessons.filter(function(l){return l.id===id;})[0];}
function findCLesson(id){return ov.addLessons.filter(function(l){return l.id===id;})[0];}
function qKey(l,s,g,i){return l+'/'+s+'/'+g+'/'+i;}
function segPatch(lessonId,segIx,segLabel){var k=lessonId+'/'+segIx;
 if(!ov.segs[k])ov.segs[k]={lesson:lessonId,seg:segIx,segFp:hash(segLabel)};
 return ov.segs[k];}
function qPatch(lessonId,segIx,segLabel,grp,ix,qText){var k=qKey(lessonId,segIx,grp,ix);
 if(!ov.questions[k])ov.questions[k]={lesson:lessonId,seg:segIx,segFp:hash(segLabel),grp:grp,ix:ix,fp:hash(qText)};
 return ov.questions[k];}
function markDirty(){dirty=true;paintBar();}
function markSiteDirty(){siteDirty=true;paintBar();}
function paintBar(){
 if(!role)return;
 $('saveBar').hidden=false;
 var d=curTab==='texts'?siteDirty:dirty;
 $('btnSave').textContent=d?'حفظ مسودة ●':'حفظ مسودة';
 var di=$('draftInfo');
 if(!canEdit())return;
 di.hidden=false;
 db&&di.classList.add('adm-note');
}

/* ---------- عرض الشجرة: مراحل ودروس ---------- */
function render(){
 if(view.kind==='editor'){renderEditor();return;}
 var h='',st=effStages();
 st.forEach(function(s,si){
  h+='<div class="adm-row'+(s.hidden?' hidden-item':'')+'">'
   +'<button class="adm-ib" data-act="st-up" data-id="'+s.id+'" '+(si===0?'disabled':'')+'>▲</button>'
   +'<button class="adm-ib" data-act="st-dn" data-id="'+s.id+'" '+(si===st.length-1?'disabled':'')+'>▼</button>'
   +'<div class="t" data-act="st-open" data-id="'+s.id+'">'+esc(s.title)+'<small>'+(s.hidden?'مخفي عن الطلاب':'ظاهر')+' · '+effLessons(s.id).filter(function(l){return !l.hidden;}).length+' درس</small></div>'
   +'<button class="adm-ib" data-act="st-ren" data-id="'+s.id+'" title="تغيير الاسم">✏️</button>'
   +'<button class="adm-ib'+(s.hidden?' off':'')+'" data-act="st-hide" data-id="'+s.id+'" title="إخفاء/إظهار">'+(s.hidden?'🚫':'👁')+'</button>'
   +'</div>';
  if(view.open[s.id]){
   var ls=effLessons(s.id);
   h+='<div class="adm-sub">';
   ls.forEach(function(l,li){
    h+='<div class="adm-row'+(l.hidden?' hidden-item':'')+'">'
     +'<button class="adm-ib" data-act="ls-up" data-id="'+l.id+'" data-st="'+s.id+'" '+(li===0?'disabled':'')+'>▲</button>'
     +'<button class="adm-ib" data-act="ls-dn" data-id="'+l.id+'" data-st="'+s.id+'" '+(li===ls.length-1?'disabled':'')+'>▼</button>'
     +'<div class="t" data-act="ls-edit" data-id="'+l.id+'">'+esc(l.title)+'<small>'+(l.cms?'درس مضاف من اللوحة':'من ملفات المنصة')+(l.hidden?' · مخفي':'')+'</small></div>'
     +'<button class="adm-ib" data-act="ls-ren" data-id="'+l.id+'" title="تغيير الاسم">✏️</button>'
     +'<button class="adm-ib'+(l.hidden?' off':'')+'" data-act="ls-hide" data-id="'+l.id+'">'+(l.hidden?'🚫':'👁')+'</button>'
     +'<button class="adm-ib go" data-act="ls-edit" data-id="'+l.id+'" title="تحرير المحتوى">تحرير</button>'
     +(l.cms?'<button class="adm-ib warn" data-act="ls-del" data-id="'+l.id+'" title="حذف الدرس المضاف">🗑</button>':'')
     +'</div>';
   });
   h+='<button class="adm-btn block" data-act="ls-add" data-st="'+s.id+'">+ إضافة درس جديد في «'+esc(s.title)+'»</button>';
   h+='</div>';
  }
 });
 $('treeBox').innerHTML=h||'<div class="adm-empty">لا يوجد محتوى في هذا الصف بعد.</div>';
 $('editorBox').innerHTML='';
}
$('treeBox').addEventListener('click',function(e){
 var b=e.target.closest('[data-act]');if(!b)return;
 var act=b.dataset.act,id=b.dataset.id,st=b.dataset.st;
 if(!canEdit()&&['st-up','st-dn','st-ren','st-hide','ls-up','ls-dn','ls-ren','ls-hide','ls-add','ls-del'].indexOf(act)>=0)return;
 if(act==='st-open'){view.open[id]=!view.open[id];render();return;}
 if(act==='ls-edit'){view.kind='editor';view.lesson=id;render();window.scrollTo(0,0);return;}
 if(act==='st-hide'){ov.stages[id]=ov.stages[id]||{};ov.stages[id].hidden=!stageHidden(id);markDirty();render();return;}
 if(act==='ls-hide'){var clh=findCLesson(id);
  if(clh){clh.hidden=!clh.hidden;}
  else{ov.lessons[id]=ov.lessons[id]||{};var eff=effLessons(st).filter(function(l){return l.id===id;})[0];ov.lessons[id].hidden=stageHidden(eff.stage)?false:!eff.hidden;}
  markDirty();render();return;}
 if(act==='st-ren'){var t0=prompt('اسم المرحلة:',effStages().filter(function(s){return s.id===id;})[0].title);if(t0&&t0.trim()){ov.stages[id]=ov.stages[id]||{};ov.stages[id].title=t0.trim();markDirty();render();}return;}
 if(act==='ls-ren'){var c=findCLesson(id);var cur=effLessons(st||'').concat(effLessons(findPLesson(id)?findPLesson(id).stage:(c?c.stage:''))).filter(function(l){return l.id===id;})[0];
  var t1=prompt('اسم الدرس:',cur?cur.title:'');if(t1&&t1.trim()){if(c){c.title=t1.trim();}else{ov.lessons[id]=ov.lessons[id]||{};ov.lessons[id].title=t1.trim();}markDirty();render();}return;}
 if(act==='st-up'||act==='st-dn'){moveStage(id,act==='st-up'?-1:1);return;}
 if(act==='ls-up'||act==='ls-dn'){moveLesson(st,id,act==='ls-up'?-1:1);return;}
 if(act==='ls-add'){var t2=prompt('عنوان الدرس الجديد:');if(!t2||!t2.trim())return;
  var nl={id:'cms_'+Date.now().toString(36),stage:st,title:t2.trim(),segments:[],blocks:{}};
  ov.addLessons.push(nl);markDirty();view.kind='editor';view.lesson=nl.id;render();window.scrollTo(0,0);return;}
 if(act==='ls-del'){var cl=findCLesson(id);if(cl&&confirm('تحذف الدرس «'+cl.title+'» نهائيًا من المسودة؟')){ov.addLessons=ov.addLessons.filter(function(x){return x!==cl;});markDirty();render();}return;}
});
function moveStage(id,dir){
 var st=effStages();var i=st.findIndex(function(s){return s.id===id;});var j=i+dir;
 if(j<0||j>=st.length)return;
 var tmp=st[i];st[i]=st[j];st[j]=tmp;
 st.forEach(function(s,k){ov.stages[s.id]=ov.stages[s.id]||{};ov.stages[s.id].order=k;});
 markDirty();render();
}
function moveLesson(stageId,id,dir){
 var ls=effLessons(stageId);var i=ls.findIndex(function(l){return l.id===id;});var j=i+dir;
 if(j<0||j>=ls.length)return;
 var tmp=ls[i];ls[i]=ls[j];ls[j]=tmp;
 ls.forEach(function(l,k){
  var c=findCLesson(l.id);
  if(c){c.order=k;}else{ov.lessons[l.id]=ov.lessons[l.id]||{};ov.lessons[l.id].order=k;}
 });
 markDirty();render();
}

/* ---------- محرر الدرس ---------- */
function editorLesson(){var c=findCLesson(view.lesson);if(c)return {cms:true,obj:c,segments:c.segments=Array.isArray(c.segments)?c.segments:[]};
 var p=findPLesson(view.lesson);return p?{cms:false,obj:p,segments:p.segments||[]}:null;}
function segEntriesCms(sg){return (sg.explain||[]).map(function(e,ix){return {e:e,ix:ix,key:MMCMS.entryKey(e)||('added'+ix),hidden:false,cms:true};});}
function segEntriesRepo(lessonId,sg,sgIx){
 var sp=ov.segs[lessonId+'/'+sgIx]||{};
 var list=(sg.explain||[]).map(function(e,ix){var k=MMCMS.entryKey(e)||('ix'+ix);
  return {e:e,ix:ix,key:k,hidden:(sp.hideEntries||[]).indexOf(k)>=0,cms:false};});
 (sp.add||[]).forEach(function(ad,ai){list.push({e:ad.type==='video'?{v:ad.vid,cap:ad.cap}:{b:'cmsb_'+hash(ad.html)},addIx:ai,key:'added_'+ai,hidden:false,cms:true,added:ad});});
 return list;
}
function entryDesc(en){
 var e=en.e;
 if(e.b){var h=(en.added&&en.added.html)||PD.B[e.b]||'';return {icon:'📄',txt:snip(h,70)||'نص'};}
 if(e.v)return {icon:'🎬',txt:'فيديو يوتيوب'+(e.cap?': '+e.cap:'')};
 if(e.img)return {icon:'🖼',txt:'صورة: '+e.img};
 if(e.illus)return {icon:'✨',txt:'رسم توضيحي'};
 return {icon:'📄',txt:'عنصر'};
}
function segQuestionsCms(sg){return (sg.questions||[]).map(function(q,ix){return {q:q,ix:ix,grp:'q',hidden:false,cms:true};});}
function segQuestionsRepo(lessonId,sg,sgIx){
 var out=[];
 ['q','c'].forEach(function(grp){
  var arr=grp==='c'?(sg.check||[]):(sg.questions||[]);
  arr.forEach(function(q,ix){var p=ov.questions[qKey(lessonId,sgIx,grp,ix)]||{};
   out.push({q:q,ix:ix,grp:grp,hidden:!!p.hidden,patch:p,cms:false});});
 });
 ov.addQuestions.forEach(function(aq,ai){
  if(aq.lesson===lessonId&&aq.seg===sgIx)out.push({q:aq.q,ix:ai,grp:'q',hidden:false,cms:true,added:aq});
 });
 return out;
}
function qDesc(q){return {badge:q.t==='open'?'مقالي':'اختياري',txt:snip(q.q,70)};}

function renderEditor(){
 var L=editorLesson();
 if(!L){view.kind='tree';render();return;}
 var title=L.cms?L.obj.title:((ov.lessons[L.obj.id]||{}).title||L.obj.title);
 var h='<button class="adm-back" data-act="back">‹ رجوع لقائمة الدروس</button>'
  +'<div class="adm-sect">تحرير درس</div>'
  +'<div class="adm-card"><div class="adm-fld"><label>عنوان الدرس</label><input type="text" id="edTitle" value="'+esc(title)+'" '+(canEdit()?'':'disabled')+'></div></div>';
 L.segments.forEach(function(sg,si){
  h+='<div class="adm-card" data-seg="'+si+'">'
   +'<div class="adm-fld"><label>الجزء '+(si+1)+': اسم الجزء</label>'
   +'<input type="text" data-seglabel="'+si+'" value="'+esc(segLabel(L,sg,si))+'" '+(canEdit()?'':'disabled')+'></div>'
  +'<div class="adm-fld"><label>فيديو الجزء (رابط يوتيوب أو كود الفيديو — اتركه فارغًا إن لم يوجد)</label>'
   +'<input type="text" data-segvideo="'+si+'" dir="ltr" placeholder="https://youtu.be/..." value="'+esc(segVideo(L,sg,si))+'" '+(canEdit()?'':'disabled')+'></div>';
  /* عناصر الشرح */
  h+='<div class="adm-kv" style="margin:6px 0">الشرح (نصوص وصور وفيديوهات):</div>';
  var ents=L.cms?segEntriesCms(sg):segEntriesRepo(L.obj.id,sg,si);
  ents.forEach(function(en,ei){
   var d=entryDesc(en);
   h+='<div class="adm-row'+(en.hidden?' hidden-item':'')+'">'
    +'<button class="adm-ib" data-act="en-up" data-seg="'+si+'" data-ix="'+ei+'" '+(ei===0?'disabled':'')+'>▲</button>'
    +'<button class="adm-ib" data-act="en-dn" data-seg="'+si+'" data-ix="'+ei+'" '+(ei===ents.length-1?'disabled':'')+'>▼</button>'
    +'<div class="t">'+d.icon+' '+esc(d.txt)+'</div>';
   if(en.e.b)h+='<button class="adm-ib" data-act="en-edit" data-seg="'+si+'" data-ix="'+ei+'" title="تعديل النص">✏️</button>';
   h+='<button class="adm-ib'+(en.hidden?' off':'')+'" data-act="en-hide" data-seg="'+si+'" data-ix="'+ei+'">'+(en.hidden?'🚫':'👁')+'</button>';
   if(en.cms)h+='<button class="adm-ib warn" data-act="en-del" data-seg="'+si+'" data-ix="'+ei+'">🗑</button>';
   h+='</div>';
  });
  if(canEdit())h+='<div class="adm-addrow">'
   +'<button class="adm-btn" data-act="en-add-text" data-seg="'+si+'">+ نص</button>'
   +'<button class="adm-btn" data-act="en-add-img" data-seg="'+si+'">+ صورة</button>'
   +'<button class="adm-btn" data-act="en-add-vid" data-seg="'+si+'">+ فيديو يوتيوب</button></div>';
  /* الأسئلة */
  h+='<div class="adm-kv" style="margin:10px 0 6px">الأسئلة:</div>';
  var qs=L.cms?segQuestionsCms(sg):segQuestionsRepo(L.obj.id,sg,si);
  qs.forEach(function(qi,order){
   var d=qDesc(qi.q);
   h+='<div class="adm-row'+(qi.hidden?' hidden-item':'')+'">'
    +'<button class="adm-ib" data-act="q-up" data-seg="'+si+'" data-ix="'+order+'" '+(order===0?'disabled':'')+'>▲</button>'
    +'<button class="adm-ib" data-act="q-dn" data-seg="'+si+'" data-ix="'+order+'" '+(order===qs.length-1?'disabled':'')+'>▼</button>'
    +'<div class="t">'+esc(d.txt)+'<small>'+d.badge+(qi.grp==='c'?' · سؤال فهم سريع':'')+(qi.cms?' · مضاف':'')+'</small></div>'
    +'<button class="adm-ib" data-act="q-edit" data-seg="'+si+'" data-ix="'+order+'">✏️</button>'
    +'<button class="adm-ib'+(qi.hidden?' off':'')+'" data-act="q-hide" data-seg="'+si+'" data-ix="'+order+'">'+(qi.hidden?'🚫':'👁')+'</button>'
    +(qi.cms?'<button class="adm-ib warn" data-act="q-del" data-seg="'+si+'" data-ix="'+order+'">🗑</button>':'')
    +'</div>';
  });
  if(canEdit())h+='<div class="adm-addrow">'
   +'<button class="adm-btn" data-act="q-add-mcq" data-seg="'+si+'">+ سؤال اختياري</button>'
   +'<button class="adm-btn" data-act="q-add-open" data-seg="'+si+'">+ سؤال مقالي</button></div>';
  if(canEdit()&&L.cms)h+='<button class="adm-btn dan block" data-act="seg-del" data-seg="'+si+'">حذف هذا الجزء</button>';
  if(canEdit()&&!L.cms)h+='<button class="adm-btn block" data-act="seg-hide" data-seg="'+si+'">'+((ov.segs[L.obj.id+'/'+si]||{}).hidden?'إظهار هذا الجزء':'إخفاء هذا الجزء كله')+'</button>';
  h+='</div>';
 });
 if(canEdit())h+='<button class="adm-btn yel block" data-act="seg-add">+ إضافة جزء جديد للدرس</button>';
 $('editorBox').innerHTML=h;
 $('treeBox').innerHTML='';
 var ti=$('edTitle');
 if(ti)ti.onchange=function(){var v=ti.value.trim();if(!v)return;
  if(L.cms)L.obj.title=v;else{ov.lessons[L.obj.id]=ov.lessons[L.obj.id]||{};ov.lessons[L.obj.id].title=v;}
  markDirty();};
 document.querySelectorAll('[data-seglabel]').forEach(function(inp){
  inp.onchange=function(){var si=+inp.dataset.seglabel,v=inp.value.trim();if(!v)return;
   var LL=editorLesson();
   if(LL.cms){LL.segments[si].label=v;}
   else{var sp=segPatch(LL.obj.id,si,LL.segments[si].label);sp.label=v;}
   markDirty();};
 });
 document.querySelectorAll('[data-segvideo]').forEach(function(inp){
  inp.onchange=function(){var si=+inp.dataset.segvideo,id=normVideo(inp.value);
   if(id===null){alert('الرابط ده مش رابط يوتيوب صحيح. حط رابط الفيديو كامل أو كوده.');inp.value=segVideo(editorLesson(),editorLesson().segments[si],si);return;}
   var LL=editorLesson();
   if(LL.cms){if(id)LL.segments[si].video=id;else delete LL.segments[si].video;}
   else{var sp=segPatch(LL.obj.id,si,LL.segments[si].label);sp.video=id;}
   inp.value=id;markDirty();};
 });
}
function segLabel(L,sg,si){if(L.cms)return sg.label||'';var sp=ov.segs[L.obj.id+'/'+si];return (sp&&sp.label)||sg.label||'';}
function segVideo(L,sg,si){if(L.cms)return sg.video||'';var sp=ov.segs[L.obj.id+'/'+si];if(sp&&Object.prototype.hasOwnProperty.call(sp,'video'))return sp.video;return sg.video||'';}
function normVideo(v){v=(v||'').trim();if(!v)return '';var id=ytId(v);if(id)return id;if(/^[A-Za-z0-9_-]{6,15}$/.test(v))return v;return null;}
$('editorBox').addEventListener('click',function(e){
 var b=e.target.closest('[data-act]');if(!b)return;
 var act=b.dataset.act,si=+b.dataset.seg,ix=+b.dataset.ix;
 var L=editorLesson();if(!L)return;
 if(act==='back'){view.kind='tree';view.lesson=null;render();return;}
 if(!canEdit())return;
 if(act==='seg-add'){var lb=prompt('اسم الجزء الجديد:');if(!lb||!lb.trim())return;
  if(L.cms){L.segments.push({label:lb.trim(),explain:[],questions:[],check:[]});}
  else{ov.addSegments.push({lesson:L.obj.id,label:lb.trim(),explain:[],questions:[],check:[]});}
  markDirty();renderEditor();return;}
 if(act==='seg-del'){if(confirm('تحذف هذا الجزء بكل محتواه؟')){L.segments.splice(si,1);markDirty();renderEditor();}return;}
 if(act==='seg-hide'){var sp=segPatch(L.obj.id,si,L.segments[si].label);sp.hidden=!sp.hidden;markDirty();renderEditor();return;}
 if(act==='en-add-text'){openTextEditor({seg:si});return;}
 if(act==='en-add-img'){
  var iu=prompt('رابط الصورة (https://…):\nأو اتركه فارغًا واضغط موافق لرفع ملف صغير من جهازك (حتى ٧٠٠ كيلوبايت).');
  if(iu===null)return;
  iu=iu.trim();
  if(iu){addImageEntry(L,si,iu);markDirty();renderEditor();return;}
  var fi=document.createElement('input');fi.type='file';fi.accept='image/*';
  fi.onchange=function(){var f=fi.files&&fi.files[0];if(!f)return;
   if(f.size>700*1024){alert('الملف أكبر من ٧٠٠ كيلوبايت. ارفعه على موقع صور وضع رابطه.');return;}
   var rd=new FileReader();rd.onload=function(){addImageEntry(L,si,String(rd.result||''));markDirty();renderEditor();};rd.readAsDataURL(f);};
  fi.click();return;}
 if(act==='en-add-vid'){var url=prompt('رابط فيديو اليوتيوب:');if(!url)return;
  var vid=ytId(url);if(!vid){alert('الرابط ده مش رابط يوتيوب صحيح.');return;}
  var cap=prompt('عنوان الفيديو (اختياري):')||'';
  addVideoEntry(L,si,vid,cap);markDirty();renderEditor();return;}
 if(act==='en-edit'){var ents=L.cms?segEntriesCms(L.segments[si]):segEntriesRepo(L.obj.id,L.segments[si],si);var en=ents[ix];
  if(en)openTextEditor({seg:si,entry:en});return;}
 if(act==='en-hide'){toggleEntry(L,si,ix);markDirty();renderEditor();return;}
 if(act==='en-del'){delEntry(L,si,ix);markDirty();renderEditor();return;}
 if(act==='en-up'||act==='en-dn'){moveEntry(L,si,ix,act==='en-up'?-1:1);markDirty();renderEditor();return;}
 if(act==='q-add-mcq'||act==='q-add-open'){openQEditor({seg:si,type:act==='q-add-mcq'?'mcq':'open'});return;}
 if(act==='q-edit'){var qs=L.cms?segQuestionsCms(L.segments[si]):segQuestionsRepo(L.obj.id,L.segments[si],si);openQEditor({seg:si,item:qs[ix]});return;}
 if(act==='q-hide'){toggleQ(L,si,ix);markDirty();renderEditor();return;}
 if(act==='q-del'){delQ(L,si,ix);markDirty();renderEditor();return;}
 if(act==='q-up'||act==='q-dn'){moveQ(L,si,ix,act==='q-up'?-1:1);markDirty();renderEditor();return;}
});
function ytId(u){var m=String(u).match(/(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,15})/);if(m)return m[1];
 return /^[A-Za-z0-9_-]{6,15}$/.test(String(u).trim())?String(u).trim():null;}

/* ---------- عمليات العناصر والأسئلة ---------- */
function textToHtml(txt){
 var chunks=String(txt||'').split(/\n\s*\n/).map(function(c){return c.trim();}).filter(Boolean);
 var h='';
 chunks.forEach(function(c,ci){
  var inner=esc(c).replace(/\n/g,'<br>');
  if(ci===0&&c.length<90&&chunks.length>1)h+='<div class="mh">'+inner+'</div>';
  else h+='<p class="tx">'+inner+'</p>';
 });
 return h||'<p class="tx"></p>';
}
function htmlToText(h){
 return String(h||'').replace(/<br\s*\/?>/gi,'\n').replace(/<\/(p|div|li|tr|h\d|ul|ol|table)>/gi,'\n').replace(/<li[^>]*>/gi,'- ').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\n{3,}/g,'\n\n').trim();
}
function realKeyOf(en){if(en.added)return en.added.type==='video'?en.added.vid:('cmsb_'+hash(en.added.html));return MMCMS.entryKey(en.e);}
function toggleEntry(L,si,ix){
 var ents=L.cms?segEntriesCms(L.segments[si]):segEntriesRepo(L.obj.id,L.segments[si],si);var en=ents[ix];if(!en)return;
 if(en.cms){delEntry(L,si,ix);return;}
 var sp=segPatch(L.obj.id,si,L.segments[si].label);sp.hideEntries=sp.hideEntries||[];
 var k=en.key,i=sp.hideEntries.indexOf(k);
 if(i>=0)sp.hideEntries.splice(i,1);else sp.hideEntries.push(k);
}
function delEntry(L,si,ix){
 if(L.cms){L.segments[si].explain.splice(ix,1);return;}
 var sp=segPatch(L.obj.id,si,L.segments[si].label);
 var ents=segEntriesRepo(L.obj.id,L.segments[si],si);var en=ents[ix];
 if(en&&en.added)sp.add=(sp.add||[]).filter(function(a){return a!==en.added;});
}
function moveEntry(L,si,ix,dir){
 if(L.cms){var ex=L.segments[si].explain;var j=ix+dir;if(j<0||j>=ex.length)return;
  var t=ex[ix];ex[ix]=ex[j];ex[j]=t;return;}
 var ents=segEntriesRepo(L.obj.id,L.segments[si],si);var j2=ix+dir;if(j2<0||j2>=ents.length)return;
 var t2=ents[ix];ents[ix]=ents[j2];ents[j2]=t2;
 var sp=segPatch(L.obj.id,si,L.segments[si].label);
 sp.entryOrder=ents.map(function(en){return realKeyOf(en);});
}
function addImageEntry(L,si,src){
 if(L.cms){var sg0=L.segments[si];sg0.explain=sg0.explain||[];sg0.explain.push({img:src});return;}
 var sp=segPatch(L.obj.id,si,L.segments[si].label);sp.add=sp.add||[];sp.add.push({type:'image',src:src});
}
function addVideoEntry(L,si,vid,cap){
 if(L.cms){var sg=L.segments[si];sg.explain=sg.explain||[];sg.explain.push({v:vid,cap:cap});return;}
 var sp=segPatch(L.obj.id,si,L.segments[si].label);sp.add=sp.add||[];sp.add.push({type:'video',vid:vid,cap:cap});
}
function toggleQ(L,si,ix){
 var qs=L.cms?segQuestionsCms(L.segments[si]):segQuestionsRepo(L.obj.id,L.segments[si],si);var it=qs[ix];if(!it)return;
 if(it.cms){delQ(L,si,ix);return;}
 var p=qPatch(L.obj.id,si,L.segments[si].label,it.grp,it.ix,it.q.q);p.hidden=!p.hidden;
}
function delQ(L,si,ix){
 if(L.cms){L.segments[si].questions.splice(ix,1);return;}
 var qs=segQuestionsRepo(L.obj.id,L.segments[si],si);var it=qs[ix];
 if(it&&it.added)ov.addQuestions=ov.addQuestions.filter(function(a){return a!==it.added;});
}
function moveQ(L,si,ix,dir){
 if(L.cms){var arr=L.segments[si].questions;var j=ix+dir;if(j<0||j>=arr.length)return;
  var t=arr[ix];arr[ix]=arr[j];arr[j]=t;return;}
 var qs=segQuestionsRepo(L.obj.id,L.segments[si],si);var it=qs[ix];var other=qs[ix+dir];
 if(!it||!other)return;
 if(it.cms&&other.cms){var a=ov.addQuestions.indexOf(it.added),b2=ov.addQuestions.indexOf(other.added);
  if(a>=0&&b>=0){var t3=ov.addQuestions[a];ov.addQuestions[a]=ov.addQuestions[b2];ov.addQuestions[b2]=t3;}return;}
 if(it.cms||other.cms)return;
 var grpItems=qs.filter(function(x){return x.grp===it.grp&&!x.cms;});
 var ia=grpItems.indexOf(it),ib=grpItems.indexOf(other);
 if(ia<0||ib<0)return;
 grpItems[ia]=other;grpItems[ib]=it;
 grpItems.forEach(function(x,pos){var p=qPatch(L.obj.id,si,L.segments[si].label,x.grp,x.ix,x.q.q);p.order=pos;});
}

/* ---------- محرر نص (كتلة شرح) ---------- */
function openTextEditor(ctx){
 var L=editorLesson();if(!L)return;
 var cur='',title='إضافة نص شرح';
 if(ctx.entry){
  title='تعديل نص الشرح';
  if(ctx.entry.added)cur=ctx.entry.added.html;
  else if(L.cms)cur=(L.obj.blocks||{})[ctx.entry.e.b]||PD.B[ctx.entry.e.b]||'';
  else cur=(ov.blocks[ctx.entry.e.b]!=null?ov.blocks[ctx.entry.e.b]:PD.B[ctx.entry.e.b])||'';
 }
 var h='<div class="adm-sect">'+title+'</div><div class="adm-card">'
  +'<div class="adm-fld"><label>النص (اكتب بشكل عادي، والتنسيق علينا، سطر فارغ ينشئ فقرة جديدة)</label>'
  +'<textarea id="teText" style="min-height:160px">'+esc(htmlToText(cur))+'</textarea></div>'
  +'<button class="adm-btn" id="tePrev" type="button">معاينة الشكل</button>'
  +'<div class="adm-preview" id="tePreview" hidden></div>'
  +'<div class="adm-addrow" style="margin-top:12px"><button class="adm-btn pri" id="teSave" type="button">حفظ النص</button>'
  +'<button class="adm-btn" id="teCancel" type="button">إلغاء</button></div></div>';
 $('editorBox').innerHTML=h;$('treeBox').innerHTML='';window.scrollTo(0,0);
 $('tePrev').onclick=function(){var p=$('tePreview');p.hidden=!p.hidden;p.innerHTML=textToHtml($('teText').value);};
 $('teCancel').onclick=function(){renderEditor();};
 $('teSave').onclick=function(){
  var html=textToHtml($('teText').value);
  if(ctx.entry){
   if(ctx.entry.added){ctx.entry.added.html=html;}
   else if(L.cms){var bid=ctx.entry.e.b;L.obj.blocks=L.obj.blocks||{};L.obj.blocks[bid]=html;}
   else ov.blocks[ctx.entry.e.b]=html;
  }else{
   if(L.cms){var id2='cmsb_'+hash(html+Date.now());L.obj.blocks=L.obj.blocks||{};L.obj.blocks[id2]=html;
    var sg=L.segments[ctx.seg];sg.explain=sg.explain||[];sg.explain.push({b:id2});}
   else{var sp=segPatch(L.obj.id,ctx.seg,L.segments[ctx.seg].label);sp.add=sp.add||[];sp.add.push({type:'block',html:html});}
  }
  markDirty();renderEditor();
 };
}

/* ---------- محرر سؤال ---------- */
function openQEditor(ctx){
 var L=editorLesson();if(!L)return;
 var isNew=!ctx.item,type=ctx.type||(ctx.item&&ctx.item.q.t)||'mcq';
 var q=ctx.item?ctx.item.q:null;
 var patch=ctx.item&&ctx.item.patch?ctx.item.patch:{};
 var fq={q:patch.q!=null?patch.q:(q?q.q:''),src:patch.src!=null?patch.src:(q?q.src||'':'')};
 var opts=patch.options?patch.options.slice():(q&&q.options?q.options.slice():['','','','']);
 var correct=patch.a!=null?patch.a:(q&&q.a!=null?q.a:0);
 var whyTxt='';
 if(type==='mcq'){
  if(patch.whyHtml!=null)whyTxt=htmlToText(patch.whyHtml);
  else if(q&&q.why){var wb=q.why;whyTxt=htmlToText((Array.isArray(wb)?wb:[wb]).map(function(k){return PD.B[k]||'';}).join('\n'));}
 }
 var modTxt='';
 if(type==='open'){
  if(patch.mod!=null)modTxt=htmlToText(patch.mod);
  else if(q&&q.mod)modTxt=htmlToText(q.mod);
  else if(q&&q.ans){var ab=q.ans;modTxt=htmlToText((Array.isArray(ab)?ab:[ab]).map(function(k){return PD.B[k]||'';}).join('\n'));}
 }
 var h='<div class="adm-sect">'+(isNew?'إضافة سؤال':'تعديل سؤال')+' ('+(type==='open'?'مقالي':'اختياري')+')</div><div class="adm-card">'
  +'<div class="adm-fld"><label>نص السؤال</label><textarea id="qeQ">'+esc(fq.q)+'</textarea></div>'
  +'<div class="adm-fld"><label>التصنيف (مثل: أسئلة الكتاب المقرر) - اختياري</label><input type="text" id="qeSrc" value="'+esc(fq.src)+'"></div>';
 if(type==='mcq'){
  h+='<div class="adm-fld"><label>الاختيارات (اختر الإجابة الصحيحة بالدائرة)</label><div class="adm-qopts" id="qeOpts">';
  opts.forEach(function(o,oi){h+='<div class="adm-qopt"><input type="radio" name="qeA" value="'+oi+'"'+(oi===correct?' checked':'')+'><input type="text" data-oi="'+oi+'" value="'+esc(o)+'"><button class="adm-ib warn" data-delopt="'+oi+'" type="button">✕</button></div>';});
  h+='</div><button class="adm-btn" id="qeAddOpt" type="button" style="margin-top:6px">+ اختيار جديد</button></div>'
   +'<div class="adm-fld"><label>شرح الإجابة (يظهر بعد الحل) - اختياري</label><textarea id="qeWhy">'+esc(whyTxt)+'</textarea></div>';
 }else{
  h+='<div class="adm-fld"><label>نموذج الإجابة</label><textarea id="qeMod" style="min-height:120px">'+esc(modTxt)+'</textarea></div>';
 }
 h+='<div class="adm-addrow" style="margin-top:12px"><button class="adm-btn pri" id="qeSave" type="button">حفظ السؤال</button>'
  +'<button class="adm-btn" id="qeCancel" type="button">إلغاء</button></div></div>';
 $('editorBox').innerHTML=h;$('treeBox').innerHTML='';window.scrollTo(0,0);
 $('qeCancel').onclick=function(){renderEditor();};
 if(type==='mcq'){
  $('qeAddOpt').onclick=function(){var d=$('qeOpts');var n=d.querySelectorAll('.adm-qopt').length;
   var r=document.createElement('div');r.className='adm-qopt';
   r.innerHTML='<input type="radio" name="qeA" value="'+n+'"><input type="text" data-oi="'+n+'" value=""><button class="adm-ib warn" data-delopt="'+n+'" type="button">✕</button>';
   d.appendChild(r);};
  $('qeOpts').addEventListener('click',function(e){var b=e.target.closest('[data-delopt]');if(!b)return;
   var rows=$('qeOpts').querySelectorAll('.adm-qopt');if(rows.length<=2){alert('لازم اختيارين على الأقل.');return;}
   b.closest('.adm-qopt').remove();
   $('qeOpts').querySelectorAll('.adm-qopt').forEach(function(r2,i2){r2.querySelector('input[type=radio]').value=i2;r2.querySelector('input[type=text]').dataset.oi=i2;});
  });
 }
 $('qeSave').onclick=function(){
  var qText=$('qeQ').value.trim();if(!qText){alert('اكتب نص السؤال.');return;}
  var srcV=$('qeSrc').value.trim();
  if(type==='mcq'){
   var optEls=$('qeOpts').querySelectorAll('input[type=text]');
   var options=[].map.call(optEls,function(el){return el.value.trim();});
   if(options.some(function(o){return !o;})){alert('كمّل كل الاختيارات.');return;}
   var ra=$('qeOpts').querySelector('input[type=radio]:checked');var a=ra?+ra.value:0;
   var whyH=$('qeWhy').value.trim()?textToHtml($('qeWhy').value):null;
   if(isNew){var nq={t:'mcq',q:qText,options:options,a:a};if(srcV)nq.src=srcV;
    if(whyH){var wid='cmsw_'+hash(whyH+Date.now());ov.blocks[wid]=whyH;nq.why=[wid];}
    addQuestion(L,ctx.seg,nq);}
   else if(ctx.item.cms){var cq=ctx.item.q;cq.q=qText;if(srcV)cq.src=srcV;cq.options=options;cq.a=a;
    if(whyH){var wid2='cmsw_'+hash(whyH+Date.now());ov.blocks[wid2]=whyH;cq.why=[wid2];}}
   else{var p=qPatch(L.obj.id,ctx.seg,L.segments[ctx.seg].label,ctx.item.grp,ctx.item.ix,ctx.item.q.q);
    p.q=qText;p.src=srcV;p.options=options;p.a=a;if(whyH)p.whyHtml=whyH;}
  }else{
   var modH=$('qeMod').value.trim()?textToHtml($('qeMod').value):null;
   if(isNew){var nq2={t:'open',q:qText};if(srcV)nq2.src=srcV;if(modH)nq2.mod=modH;
    addQuestion(L,ctx.seg,nq2);}
   else if(ctx.item.cms){var cq2=ctx.item.q;cq2.q=qText;if(srcV)cq2.src=srcV;if(modH)cq2.mod=modH;}
   else{var p2=qPatch(L.obj.id,ctx.seg,L.segments[ctx.seg].label,ctx.item.grp,ctx.item.ix,ctx.item.q.q);
    p2.q=qText;p2.src=srcV;if(modH)p2.mod=modH;}
  }
  markDirty();renderEditor();
 };
}
function addQuestion(L,si,q){
 if(L.cms){var sg=L.segments[si];sg.questions=sg.questions||[];sg.questions.push(q);return;}
 ov.addQuestions.push({lesson:L.obj.id,seg:si,segFp:hash(L.segments[si].label),q:q});
}

/* ---------- حفظ ونشر ومعاينة ---------- */
function sanitize(o){return JSON.parse(JSON.stringify(o));}
/* سجل النشر: نسخة من المنشور الحالي قبل الكتابة فوقه، مع الاحتفاظ بآخر ١٠ نسخ لكل قسم */
function snapHistory(trackId){
 return db.collection('cmsLive').doc(trackId).get().then(function(d){
  if(!d.exists)return;
  var hid=trackId+'_'+Date.now();
  return db.collection('cmsHistory').doc(hid).set({track:trackId,snapshot:d.data(),at:firebase.firestore.FieldValue.serverTimestamp(),by:user.email||''})
   .then(function(){return pruneHistory(trackId);});
 }).catch(function(){});
}
function pruneHistory(trackId){
 return db.collection('cmsHistory').orderBy(firebase.firestore.FieldPath.documentId()).startAt(trackId+'_').endAt(trackId+'_\uf8ff').get()
  .then(function(s){var docs=s.docs;if(docs.length<=10)return;
   return Promise.all(docs.slice(0,docs.length-10).map(function(x){return x.ref.delete();}));}).catch(function(){});
}
$('btnSave').onclick=function(){
 if(curTab==='texts'){saveSite(false);return;}
 if(!canEdit()||!track)return;
 $('btnSave').disabled=true;$('btnSave').textContent='جاري الحفظ…';
 var doc=sanitize(ov);doc.v=1;doc.meta={updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedBy:user.email||''};
 db.collection('cmsDraft').doc(track).set(doc).then(function(){
  dirty=false;$('btnSave').disabled=false;$('btnSave').textContent='حفظ مسودة';
  $('draftInfo').hidden=false;$('draftInfo').textContent='اتحفظت المسودة ✓ التعديلات لسه مش ظاهرة للطلاب — دوس «نشر للطلاب» لما تكون جاهز.';
 }).catch(function(e){$('btnSave').disabled=false;$('btnSave').textContent='حفظ مسودة';alert('الحفظ فشل: '+errMsg(e));});
};
$('btnPublish').onclick=function(){
 if(curTab==='texts'){saveSite(true);return;}
 if(!canPublish()||!track)return;
 if(!confirm('نشر كل تعديلات المسودة للطلاب الآن؟ سيصبح المنشور ظاهرًا لكل الطلاب فورًا.'))return;
 $('btnPublish').disabled=true;$('btnPublish').textContent='جاري النشر…';
 var doc=sanitize(ov);doc.v=1;
 doc.meta={updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedBy:user.email||'',publishedAt:firebase.firestore.FieldValue.serverTimestamp(),publishedBy:user.email||''};
 var draft=sanitize(ov);draft.v=1;draft.meta={updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedBy:user.email||''};
 snapHistory(track).then(function(){return db.collection('cmsLive').doc(track).set(doc);})
  .then(function(){return db.collection('cmsDraft').doc(track).set(draft);})
  .then(function(){
   dirty=false;$('btnPublish').disabled=false;$('btnPublish').textContent='نشر للطلاب';
   $('draftInfo').hidden=false;$('draftInfo').textContent='اتنشر ✓ التعديلات ظاهرة للطلاب دلوقتي (أي طالب يفتح الصفحة من جديد يشوفها).';
  })
  .catch(function(e){$('btnPublish').disabled=false;$('btnPublish').textContent='نشر للطلاب';alert('النشر فشل: '+errMsg(e));});
};
$('btnPreview').onclick=function(){
 if(curTab==='texts'){
  if(siteDirty){alert('احفظ المسودة أولًا حتى تظهر آخر تعديلاتك في المعاينة.');return;}
  window.open('index.html?cmspreview=1','_blank');return;
 }
 if(!track)return;
 if(dirty){alert('احفظ المسودة الأول عشان المعاينة تشوف آخر تعديلاتك.');return;}
 window.open('track.html?t='+track+'&cmspreview=1','_blank');
};

/* ---------- نصوص الموقع ---------- */
var SITE_SLOTS=[
 {key:'navCta',sel:'nav .wrap > a.btn',label:'زر «ابدأ المذاكرة» في الشريط العلوي',def:'ابدأ المذاكرة'},
 {key:'heroTitle',sel:'.hero h1',label:'العنوان الرئيسي للصفحة الرئيسية',def:'اللغة العربية ببساطة، دون عناء',note:'يُستبدل النص كاملًا في سطر واحد؛ لتعديل جزء منه فقط استخدم أداة الاستبدال بالأسفل.'},
 {key:'heroSub',sel:'.hero .wrap > div > p',label:'الوصف تحت العنوان الرئيسي',def:'شرح مبسّط لكل درس من أولى ابتدائي إلى تالتة إعدادي.'},
 {key:'heroCta',sel:'.hero .cta .btn',label:'الزر الرئيسي في الصفحة الرئيسية',def:'ابدأ من أولى ابتدائي'},
 {key:'heroCtaAlt',sel:'.hero .cta .btn.alt',label:'الزر الثانوي بجانبه',def:'كيف نشرح'},
 {key:'heroBubble',sel:'#heroBubble',label:'فقاعة الترحيب في الصفحة الرئيسية',def:'أهلًا بك! هيّا نلعب ونتعلّم العربية معًا'},
 {key:'gradesH',sel:'#grades .sh h2',label:'عنوان قسم الصفوف',def:'اختر صفك'},
 {key:'gradesP',sel:'#grades .sh p',label:'الوصف تحت عنوان الصفوف',def:'لكل صف دروسه مرتّبة'},
 {key:'howH',sel:'#how .sh h2',label:'عنوان قسم «كيف نشرح»',def:'كيف نشرح؟'},
 {key:'demoIdx',sel:'#how .demo .bb',label:'نص المثال التوضيحي في الرئيسية',def:'يعني مثلًا: الفاعل هو اللي عمل الفعل…'},
 {key:'aboutH',sel:'.teach h2',label:'عنوان قسم «من هو مستر يوسف»',def:'من هو مستر يوسف؟'},
 {key:'aboutP',sel:'.teach p',label:'نبذة مستر يوسف',def:'مدرس لغة عربية يشرح كل درس بقصة ولعبة ومثال من يومهم، من أولى ابتدائي إلى تالتة إعدادي.'},
 {key:'parentsH',sel:'#parents .sh h2',label:'عنوان قسم «لولي الأمر»',def:'لولي الأمر'},
 {key:'parentsP',sel:'#parents .sh p',label:'وصف قسم لولي الأمر',def:'متابعة هادئة دون أن تحتاج إلى الوقوف بجانب ابنك'},
 {key:'trackBubble',sel:'#trackBubble',label:'فقاعة صفحة الدروس',def:'هيّا نفتح الدرس ونبدأ'},
 {key:'tab1',sel:'.tabs span:nth-child(1)',label:'اسم تبويب الترم الأول',def:'الترم الأول'},
 {key:'tab2',sel:'.tabs span:nth-child(2)',label:'اسم تبويب الترم الثاني',def:'الترم الثاني (قريبًا)'},
 {key:'trackDemo',sel:'#units ~ .demo .bb',label:'نص التلميح أسفل قائمة الدروس',def:'في كل درس ستجد شرحًا مبسطًا بعد الأجزاء الصعبة…'}
];
var IMG_SLOTS=[
 {key:'heroPose',sel:'#heroPose',label:'صورة المستر في الصفحة الرئيسية'},
 {key:'trackPose',sel:'#trackPose',label:'صورة المستر في صفحة الدروس'},
 {key:'teachImg',sel:'.teach .pfig',label:'صورة قسم «من هو مستر يوسف»'},
 {key:'demoImgIdx',sel:'#how .demo img',label:'الصورة التوضيحية في الرئيسية'},
 {key:'demoImgTrk',sel:'#units ~ .demo img',label:'الصورة التوضيحية في صفحة الدروس'}
];
function normSite(d){d=d||{};return {texts:Array.isArray(d.texts)?d.texts:[],replace:Array.isArray(d.replace)?d.replace:[],imgs:Array.isArray(d.imgs)?d.imgs:[],customCss:typeof d.customCss==='string'?d.customCss:''};}
function loadSite(){
 $('siteSlots').innerHTML='<div class="adm-load">جارٍ التحميل…</div>';
 $('siteReplace').innerHTML='';$('siteImgs').innerHTML='';
 db.collection('cmsDraft').doc('site').get().then(function(d){
  if(d.exists)return d.data();
  return db.collection('cmsLive').doc('site').get().then(function(l){return l.exists?l.data():{};}).catch(function(){return {};});
 }).catch(function(){return {};}).then(function(d){siteOv=normSite(d);siteDirty=false;paintBar();renderTexts();});
}
function setSlot(key,val){
 var sl=SITE_SLOTS.filter(function(x){return x.key===key;})[0];if(!sl)return;
 siteOv.texts=siteOv.texts.filter(function(t){return t.key!==key;});
 if(val)siteOv.texts.push({key:key,sel:sl.sel,text:val});
 markSiteDirty();
}
function setImg(key,val){
 var sl=IMG_SLOTS.filter(function(x){return x.key===key;})[0];if(!sl)return;
 siteOv.imgs=siteOv.imgs.filter(function(t){return t.key!==key;});
 if(val)siteOv.imgs.push({key:key,sel:sl.sel,src:val});
 markSiteDirty();
}
function renderTexts(){
 var ro=!canTexts(),h='';
 SITE_SLOTS.forEach(function(sl){
  var cur='';siteOv.texts.forEach(function(t){if(t.key===sl.key)cur=t.text||'';});
  h+='<div class="adm-fld"><label>'+esc(sl.label)+'</label>'
   +'<input type="text" data-slot="'+sl.key+'" value="'+esc(cur)+'" placeholder="'+esc(sl.def)+'"'+(ro?' disabled':'')+'>'
   +(sl.note?'<small class="adm-hint">'+esc(sl.note)+'</small>':'')+'</div>';
 });
 $('siteSlots').innerHTML='<div class="adm-card">'+h+'</div>';
 renderReplace();renderImgs();
 var css=$('siteCss');css.value=siteOv.customCss;css.disabled=ro;
}
function renderReplace(){
 var ro=!canTexts(),h='';
 siteOv.replace.forEach(function(r,i){
  h+='<div class="adm-rep"><input type="text" data-rep-from="'+i+'" placeholder="النص الحالي كما يظهر" value="'+esc(r.from||'')+'"'+(ro?' disabled':'')+'>'
   +'<input type="text" data-rep-to="'+i+'" placeholder="النص الجديد" value="'+esc(r.to||'')+'"'+(ro?' disabled':'')+'>'
   +(ro?'':'<button class="adm-ib warn" data-rep-del="'+i+'" title="حذف">🗑</button>')+'</div>';
 });
 if(!siteOv.replace.length)h='<div class="adm-empty">لا توجد استبدالات بعد.</div>';
 $('siteReplace').innerHTML=h;
}
function renderImgs(){
 var ro=!canTexts(),h='';
 IMG_SLOTS.forEach(function(sl){
  var cur='';siteOv.imgs.forEach(function(t){if(t.key===sl.key)cur=t.src||'';});
  var isData=cur.indexOf('data:')===0;
  h+='<div class="adm-fld"><label>'+esc(sl.label)+'</label>'
   +(cur?'<div style="margin-bottom:6px"><img class="adm-imgprev" src="'+esc(cur)+'" alt=""></div>':'')
   +'<div class="adm-rep"><input type="url" dir="ltr" data-img="'+sl.key+'" placeholder="https://…" value="'+esc(isData?'':cur)+'"'+(ro?' disabled':'')+'>'
   +(ro?'':'<label class="adm-btn">رفع ملف<input type="file" accept="image/*" data-imgfile="'+sl.key+'" hidden></label>')+'</div>'
   +(isData?'<small class="adm-hint">ملف مرفوع داخل القاعدة ('+Math.round(cur.length/1024)+' كيلوبايت). لمسحه احفظ الخانة فارغة.</small>':'')
   +(cur&&!isData?'<small class="adm-hint">لمسح الصورة والرجوع للأصلية احفظ الخانة فارغة.</small>':'')+'</div>';
 });
 $('siteImgs').innerHTML='<div class="adm-card">'+h+'</div>';
}
$('repAdd').onclick=function(){if(!canTexts()||!siteOv)return;siteOv.replace.push({from:'',to:''});markSiteDirty();renderReplace();};
$('panelTexts').addEventListener('change',function(e){
 if(!canTexts()||!siteOv)return;
 var t=e.target;
 if(t.dataset&&t.dataset.slot!=null){setSlot(t.dataset.slot,t.value.trim());return;}
 if(t.dataset&&t.dataset.repFrom!=null){var i=+t.dataset.repFrom;if(siteOv.replace[i])siteOv.replace[i].from=t.value;markSiteDirty();return;}
 if(t.dataset&&t.dataset.repTo!=null){var j=+t.dataset.repTo;if(siteOv.replace[j])siteOv.replace[j].to=t.value;markSiteDirty();return;}
 if(t.dataset&&t.dataset.img!=null){setImg(t.dataset.img,t.value.trim());renderImgs();return;}
 if(t.id==='siteCss'){siteOv.customCss=t.value;markSiteDirty();return;}
});
$('panelTexts').addEventListener('click',function(e){
 var del=e.target.closest('[data-rep-del]');
 if(del&&canTexts()&&siteOv){siteOv.replace.splice(+del.dataset.repDel,1);markSiteDirty();renderReplace();}
});
$('panelTexts').addEventListener('change',function(e){
 var t=e.target;
 if(!t.dataset||t.dataset.imgfile==null||!canTexts()||!siteOv)return;
 var f=t.files&&t.files[0];if(!f)return;
 if(f.size>700*1024){alert('الملف أكبر من ٧٠٠ كيلوبايت. ارفعه على موقع صور وضع رابطه بدلًا منه.');t.value='';return;}
 var rd=new FileReader();
 rd.onload=function(){setImg(t.dataset.imgfile,String(rd.result||''));renderImgs();};
 rd.readAsDataURL(f);
});
function saveSite(pub){
 if(!canTexts())return;
 if(pub&&!canPublish())return;
 if(pub&&!confirm('نشر نصوص الموقع للطلاب الآن؟ ستظهر التعديلات لكل الزوار فورًا.'))return;
 var btn=pub?$('btnPublish'):$('btnSave');
 btn.disabled=true;btn.textContent='جاري '+(pub?'النشر':'الحفظ')+'…';
 var doc=sanitize(siteOv);doc.v=1;
 doc.meta={updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedBy:user.email||''};
 if(pub){doc.meta.publishedAt=firebase.firestore.FieldValue.serverTimestamp();doc.meta.publishedBy=user.email||'';}
 var p;
 if(pub){p=snapHistory('site').then(function(){return db.collection('cmsLive').doc('site').set(doc);})
   .then(function(){var dr=sanitize(siteOv);dr.v=1;dr.meta={updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedBy:user.email||''};return db.collection('cmsDraft').doc('site').set(dr);});}
 else{p=db.collection('cmsDraft').doc('site').set(doc);}
 p.then(function(){
  siteDirty=false;paintBar();btn.disabled=false;btn.textContent=pub?'نشر للطلاب':'حفظ مسودة';
  $('siteMsg').textContent=pub?'تم النشر ✓ أصبحت التعديلات ظاهرة للطلاب الآن (من يفتح الصفحة من جديد يراها).':'تم حفظ المسودة ✓ لن تظهر للطلاب حتى تضغط «نشر للطلاب».';
  $('siteMsg').className='adm-msg ok';
 }).catch(function(e){
  btn.disabled=false;btn.textContent=pub?'نشر للطلاب':'حفظ مسودة';
  $('siteMsg').textContent=errMsg(e);$('siteMsg').className='adm-msg';
 });
}

/* ---------- سجل النشر ---------- */
function loadHistory(){
 $('historyList').innerHTML='<div class="adm-load">جارٍ التحميل…</div>';
 db.collection('cmsHistory').limit(50).get().then(function(s){
  var rows=[];s.forEach(function(d){var x=d.data()||{};rows.push({id:d.id,track:x.track||'',at:x.at,by:x.by||''});});
  rows.sort(function(a,b){return (b.at&&b.at.toMillis?b.at.toMillis():0)-(a.at&&a.at.toMillis?a.at.toMillis():0);});
  if(!rows.length){$('historyList').innerHTML='<div class="adm-empty">لا يوجد سجل بعد. تُحفظ نسخة تلقائيًا عند كل نشر.</div>';return;}
  var names={g1:'أولى ابتدائي',g8ar:'تانية إعدادي',g7az:'أولى إعدادي أزهر',site:'نصوص الموقع'},h='';
  rows.forEach(function(r){
   var when='';try{when=r.at&&r.at.toDate?r.at.toDate().toLocaleString('ar-EG'):'';}catch(e){}
   h+='<div class="adm-row"><div class="t">'+esc(names[r.track]||r.track)+'<small>'+esc(when)+(r.by?' · '+esc(r.by):'')+'</small></div>'
    +(canPublish()?'<button class="adm-btn" data-restore="'+r.id+'" data-hrack="'+esc(r.track)+'">استرجاع</button>':'')+'</div>';
  });
  $('historyList').innerHTML=h;
 }).catch(function(e){$('historyList').innerHTML='<div class="adm-note">'+esc(errMsg(e))+'</div>';});
}
$('historyList').addEventListener('click',function(e){
 var b=e.target.closest('[data-restore]');if(!b||!canPublish())return;
 if(!confirm('استرجاع هذه النسخة إلى المسودة؟ لن تظهر للطلاب حتى تنشرها بنفسك.'))return;
 b.disabled=true;b.textContent='جاري الاسترجاع…';
 db.collection('cmsHistory').doc(b.dataset.restore).get().then(function(d){
  if(!d.exists)throw {code:'not-found'};
  var snap=d.data().snapshot||{};var doc=sanitize(snap);
  doc.meta={updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedBy:user.email||'',restoredFrom:b.dataset.restore};
  return db.collection('cmsDraft').doc(b.dataset.hrack).set(doc);
 }).then(function(){
  b.textContent='تم ✓';
  alert('أُعيدت النسخة إلى المسودة ✓ انتقل إلى تبويب «المحتوى» أو «نصوص الموقع» وراجعها ثم اضغط «نشر للطلاب».');
  loadHistory();
 }).catch(function(e2){b.disabled=false;b.textContent='استرجاع';alert('تعذّر الاسترجاع: '+errMsg(e2));});
});

/* ---------- الفريق ---------- */
document.querySelectorAll('#tabs button').forEach(function(b){
 b.onclick=function(){
  document.querySelectorAll('#tabs button').forEach(function(x){x.classList.toggle('on',x===b);});
  var t=b.dataset.tab;curTab=t;
  $('panelContent').hidden=t!=='content';$('panelTeam').hidden=t!=='team';
  $('panelTexts').hidden=t!=='texts';$('panelHistory').hidden=t!=='history';
  $('saveBar').hidden=(t!=='content'&&t!=='texts');
  paintBar();
  if(t==='team')loadTeam();
  if(t==='texts')loadSite();
  if(t==='history')loadHistory();
 };
});
function permBadges(p){return ['عرض',p.edit?'تعديل':null,p.publish?'نشر':null,p.texts?'نصوص':null].filter(Boolean).join(' · ');}
function loadTeam(){
 $('teamList').innerHTML='<div class="adm-load">جارٍ التحميل…</div>';
 db.collection('staff').get().then(function(snap){
  if(snap.empty){$('teamList').innerHTML='<div class="adm-empty">لا يوجد مساعدون بعد. أضف أول مساعد بالأسفل.</div>';return;}
  var h='';
  snap.forEach(function(d){var s=d.data()||{};var p=s.perms||{};
   h+='<div class="adm-row"><div class="t">'+esc(s.name||s.email||d.id)+'<small>'+esc(s.email||'')+' · '+permBadges(p)+'</small></div>'
    +'<button class="adm-ib" data-team-edit="'+d.id+'" title="تعديل الصلاحيات">⚙️</button>'
    +'<button class="adm-ib warn" data-team-del="'+d.id+'" data-email="'+esc(s.email||'')+'" title="حذف المساعد">🗑</button></div>';
  });
  $('teamList').innerHTML=h;
 }).catch(function(e){$('teamList').innerHTML='<div class="adm-note">'+esc(errMsg(e))+'</div>';});
}
$('teamList').addEventListener('click',function(e){
 var del=e.target.closest('[data-team-del]'),ed=e.target.closest('[data-team-edit]');
 if(del){if(!confirm('تحذف المساعد «'+del.dataset.email+'»؟ هيفقد كل صلاحياته فورًا.'))return;
  db.collection('staff').doc(del.dataset.teamDel).delete().then(loadTeam).catch(function(e2){alert(errMsg(e2));});return;}
 if(ed){var id=ed.dataset.teamEdit;
  db.collection('staff').doc(id).get().then(function(d){
   var s=d.data()||{},p=s.perms||{};
   var ans=prompt('صلاحيات «'+(s.name||s.email||'')+'» — اكتب الأرقام مفصولة بمسافة:\n١ عرض · ٢ تعديل · ٣ نشر · ٤ نصوص الموقع\nمثال: ١ ٢',( '1'+(p.edit?' 2':'')+(p.publish?' 3':'')+(p.texts?' 4':'')));
   if(ans==null)return;
   var np={edit:/2/.test(ans),publish:/3/.test(ans),texts:/4/.test(ans)};
   db.collection('staff').doc(id).set({perms:np},{merge:true}).then(loadTeam).catch(function(e2){alert(errMsg(e2));});
  });return;}
});
$('tAdd').onclick=function(){
 if(!role||!role.owner)return;
 var name=$('tName').value.trim(),em=$('tEmail').value.trim(),pw=$('tPass').value;
 if(!name||!em||!pw){$('tMsg').textContent='كمّل الاسم والإيميل وكلمة السر.';$('tMsg').className='adm-msg';return;}
 if(pw.length<6){$('tMsg').textContent='كلمة السر لازم ٦ حروف أو أرقام على الأقل.';$('tMsg').className='adm-msg';return;}
 $('tAdd').disabled=true;$('tMsg').textContent='جاري إنشاء الحساب…';$('tMsg').className='adm-msg ok';
 var perms={view:true,edit:$('pEdit').checked,publish:$('pPublish').checked,texts:$('pTexts').checked};
 var app2;
 try{app2=firebase.initializeApp(window.FIREBASE_CONFIG,'cmsSecondary');}catch(e){app2=firebase.app('cmsSecondary');}
 app2.auth().createUserWithEmailAndPassword(em,pw)
  .then(function(c){var uid=c.user.uid;
   return app2.auth().signOut().then(function(){
    return db.collection('staff').doc(uid).set({email:em,name:name,perms:perms,createdAt:firebase.firestore.FieldValue.serverTimestamp(),createdBy:user.email||''});
   });
  })
  .then(function(){
   $('tMsg').textContent='اتعمل حساب المساعد ✓ ابعتله الإيميل وكلمة السر المؤقتة وخليه يدخل على نفس الصفحة دي.';$('tMsg').className='adm-msg ok';
   $('tName').value='';$('tEmail').value='';$('tPass').value='';$('pEdit').checked=false;$('pPublish').checked=false;$('pTexts').checked=false;
   $('tAdd').disabled=false;loadTeam();
  })
  .catch(function(e){$('tMsg').textContent=errMsg(e);$('tMsg').className='adm-msg';$('tAdd').disabled=false;});
};
})();
