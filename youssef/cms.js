/* منصة مستر يوسف — طبقة المحتوى المنشور (CMS overlay).
   تقرأ وثيقة cmsLive/<track> من Firestore وتطبّعها على بيانات الملفات الثابتة:
   إخفاء/إظهار مراحل ودروس وأسئلة، تعديل عناوين ونصوص، إعادة ترتيب، إضافة دروس ونصوص وفيديوهات وأسئلة.
   لو الوثيقة مش موجودة أو القراءة ممنوعة، الموقع يشتغل بالمحتوى الثابت من غير أي تغيير.
   MMCMS.apply دالة نقية (بدون DOM) عشان تتختبر وتتستخدم في لوحة التحكم للمعاينة. */
(function(){
'use strict';
var APP_SDK='https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js';
var FS_SDK='https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js';
var AUTH_SDK='https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js';

function hash(s){s=String(s==null?'':s);var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return h.toString(36);}
function entryKey(e){return e?(e.b||e.img||e.illus||e.v||''):'';}

/* تطبيق الوثيقة على بيانات الصف D (window.AR_G1 / AR_G8 / AR_G7AZ). ترجع قائمة التعديلات اللي مالقتش مكانها. */
function apply(D,ov,opts){
  var missed=[];var ED=!!(opts&&opts.editor);
  if(!D||!ov||typeof ov!=='object')return missed;
  D.B=D.B||{};
  /* ١) النصوص: دمج كتل HTML المعدّلة/الجديدة */
  var blocks=ov.blocks||{};
  for(var bk in blocks)if(Object.prototype.hasOwnProperty.call(blocks,bk))D.B[bk]=blocks[bk];

  /* ٢) المراحل: عنوان/إخفاء/ترتيب */
  var sp=ov.stages||{},sHidden={},i;
  if(Array.isArray(D.stages)){
    var sDec=D.stages.map(function(st,ix){var p=sp[st.id]||{};if(p.title)st.title=p.title;sHidden[st.id]=!!p.hidden;
      return {st:st,ix:ix,ord:(p.order!=null?p.order:(st.n!=null?st.n:ix))};});
    sDec.sort(function(a,b){return a.ord-b.ord||a.ix-b.ix;});
    D.stages=sDec.map(function(x){return x.st;});
  }

  /* ٣) الدروس: عنوان/إخفاء/ترتيب + دروس مضافة */
  var lp=ov.lessons||{};
  if(Array.isArray(D.lessons)){
    D.lessons.forEach(function(l){var p=lp[l.id]||{};if(p.title)l.title=p.title;
      l._cmsHidden=!!p.hidden||!!sHidden[l.stage];
      l._cmsOrder=(p.order!=null?p.order:null);});
    (ov.addLessons||[]).forEach(function(al,ix){
      if(!al||!al.id||!al.stage||!al.title||!Array.isArray(al.segments))return;
      if(D.lessons.some(function(l){return l.id===al.id;}))return;
      if(al.blocks)for(var k in al.blocks)if(Object.prototype.hasOwnProperty.call(al.blocks,k))D.B[k]=al.blocks[k];
      var nl={id:al.id,stage:al.stage,title:al.title,segments:al.segments,_cmsHidden:!!al.hidden||!!sHidden[al.stage],_cmsOrder:(al.order!=null?al.order:null)};
      D.lessons.push(nl);});
    var lDec=D.lessons.map(function(l,ix){return {l:l,ix:ix,ord:(l._cmsOrder!=null?l._cmsOrder:ix)};});
    lDec.sort(function(a,b){return a.ord-b.ord||a.ix-b.ix;});
    D.lessons=lDec.map(function(x){return x.l;});if(!ED)D.lessons=D.lessons.filter(function(l){return !l._cmsHidden;});
  }

  function findLesson(id){return (D.lessons||[]).filter(function(l){return l.id===id;})[0];}
  function findSeg(L,segIx,segFp){
    if(!L||!Array.isArray(L.segments)||!L.segments.length)return null;
    var sg=L.segments[segIx];
    if(sg&&(segFp==null||hash(sg.label)===segFp))return sg;
    for(var j=0;j<L.segments.length;j++)if(hash(L.segments[j].label)===segFp)return L.segments[j];
    return null;
  }
  function findQ(arr,ix,fp){
    if(!arr)return null;
    var q=arr[ix];
    if(q&&(fp==null||hash(q.q)===fp))return {q:q,arr:arr};
    for(var j=0;j<arr.length;j++)if(hash(arr[j].q)===fp)return {q:arr[j],arr:arr};
    return null;
  }

  /* ٤) الأسئلة: تعديل/إخفاء/ترتيب (مطابقة ببصمة نص السؤال عشان التعديل ميروحش لسؤال غلط) */
  var qp=ov.questions||{};
  for(var qk in qp)if(Object.prototype.hasOwnProperty.call(qp,qk)){
    var p=qp[qk],L=findLesson(p.lesson);
    var sg=L?findSeg(L,p.seg,p.segFp):null;
    var hit=null;
    if(sg){hit=findQ(p.grp==='c'?(sg.check||[]):sg.questions,p.ix,p.fp);
      if(!hit)hit=findQ(p.grp==='c'?sg.questions:(sg.check||[]),p.ix,p.fp);}
    if(!hit&&L){for(var si=0;si<L.segments.length&&!hit;si++){var s2=L.segments[si];
      hit=findQ(s2.questions,0,p.fp)||findQ(s2.check||[],0,p.fp);}}
    if(!hit){missed.push(qk);continue;}
    var q=hit.q;
    if(p.q!=null)q.q=p.q;
    if(p.src!=null)q.src=p.src;
    if(Array.isArray(p.options))q.options=p.options.slice();
    if(p.a!=null)q.a=p.a;
    if(p.mod!=null)q.mod=p.mod;
    if(p.whyHtml!=null){var wid='cmsw_'+hash(p.whyHtml);D.B[wid]=p.whyHtml;q.why=[wid];}
    if(p.ansHtml!=null){var aid='cmsa_'+hash(p.ansHtml);D.B[aid]=p.ansHtml;q.ans=[aid];}
    q._cmsHidden=!!p.hidden;
    q._cmsOrder=(p.order!=null?p.order:null);
  }
  if(Array.isArray(D.lessons))D.lessons.forEach(function(l){
    (l.segments||[]).forEach(function(sg){
      ['questions','check'].forEach(function(g){
        var arr=sg[g];if(!Array.isArray(arr))return;
        var dec=arr.map(function(q,ix){return {q:q,ix:ix,ord:(q._cmsOrder!=null?q._cmsOrder:ix)};});
        dec.sort(function(a,b){return a.ord-b.ord||a.ix-b.ix;});
        sg[g]=dec.map(function(x){return x.q;});if(!ED)sg[g]=sg[g].filter(function(q){return !q._cmsHidden;});
      });
    });
  });

  /* ٥) أسئلة مضافة */
  (ov.addQuestions||[]).forEach(function(aq){
    if(!aq||!aq.q)return;
    var L=findLesson(aq.lesson);if(!L){missed.push('add:'+(aq.lesson||'?'));return;}
    L.segments=L.segments||[];
    var sg=(aq.seg!=null&&aq.seg>=0)?findSeg(L,aq.seg,aq.segFp):null;
    if(!sg){sg={label:aq.segLabel||'أسئلة إضافية',explain:[],questions:[],check:[]};L.segments.push(sg);}
    sg.questions=sg.questions||[];sg.questions.push(aq.q);
  });

  /* ٦) أجزاء الشرح: إخفاء عناصر + إضافة نصوص وفيديوهات */
  var sgp=ov.segs||{};
  for(var sk in sgp)if(Object.prototype.hasOwnProperty.call(sgp,sk)){
    var sp2=sgp[sk],L2=findLesson(sp2.lesson);
    var sg2=L2?findSeg(L2,sp2.seg,sp2.segFp):null;
    if(!sg2){missed.push(sk);continue;}
    if(sp2.hidden){if(ED){sg2._cmsHidden=true;}else{L2.segments=L2.segments.filter(function(x){return x!==sg2;});}continue;}
    if(sp2.label)sg2.label=sp2.label;
    if(Array.isArray(sg2.explain)&&Array.isArray(sp2.hideEntries)&&sp2.hideEntries.length)
      sg2.explain=sg2.explain.filter(function(e){return sp2.hideEntries.indexOf(entryKey(e))<0;});
    (sp2.add||[]).forEach(function(ad){
      sg2.explain=sg2.explain||[];
      if(ad.type==='video'&&ad.vid)sg2.explain.push({v:ad.vid,cap:ad.cap||''});
      else if(ad.type==='block'&&ad.html){var bid='cmsb_'+hash(ad.html);D.B[bid]=ad.html;sg2.explain.push({b:bid});}
    });
    if(Array.isArray(sg2.explain)&&Array.isArray(sp2.entryOrder)&&sp2.entryOrder.length){
      var ok=sp2.entryOrder;
      sg2.explain=sg2.explain.map(function(e,ix){return {e:e,ix:ix,o:ok.indexOf(entryKey(e))};})
        .sort(function(a,b){return (a.o<0?999+a.ix:a.o)-(b.o<0?999+b.ix:b.o);})
        .map(function(x){return x.e;});
    }
  }

  /* ٧) أجزاء مضافة لدروس موجودة */
  (ov.addSegments||[]).forEach(function(as){
    if(!as||!as.label)return;
    var L3=findLesson(as.lesson);if(!L3){missed.push('seg:'+(as.lesson||'?'));return;}
    if(as.blocks)for(var k2 in as.blocks)if(Object.prototype.hasOwnProperty.call(as.blocks,k2))D.B[k2]=as.blocks[k2];
    L3.segments=L3.segments||[];
    L3.segments.push({label:as.label,explain:as.explain||[],questions:as.questions||[],check:as.check||[]});
  });
  return missed;
}

/* تحميل سكربت خارجي مرة واحدة */
function one(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
function ensureFb(){
  if(window.firebase&&firebase.firestore)return Promise.resolve(true);
  var p=Promise.resolve();
  if(!window.firebase)p=p.then(function(){return one(APP_SDK);}).then(function(){return one('firebase-config.js');});
  p=p.then(function(){
    if(!firebase.apps||!firebase.apps.length)firebase.initializeApp(window.FIREBASE_CONFIG);
    if(!firebase.firestore)return one(FS_SDK);
  });
  return p.then(function(){return true;}).catch(function(){return false;});
}

var _cache={};
function ready(track){
  if(_cache[track])return _cache[track];
  _cache[track]=ensureFb().then(function(ok){
    if(!ok)return null;
    var D=window[( {g1:'AR_G1',g8:'AR_G8',g8ar:'AR_G8',g7az:'AR_G7AZ'} )[track]];
    /* معاينة المسودة: ?cmspreview=1 يقرأ cmsDraft بدل المنشور (للمالك/المساعدين المسجلين فقط بحسب القواعد) */
    var coll='cmsLive',prev=false;
    try{prev=new URLSearchParams(location.search).get('cmspreview')==='1';}catch(e){}
    if(prev)coll='cmsDraft';
    var authP=Promise.resolve();
    if(prev)authP=(firebase.auth?Promise.resolve():one(AUTH_SDK)).then(function(){return new Promise(function(res){var un=firebase.auth().onAuthStateChanged(function(){un();res();});});}).catch(function(){});
    return authP.then(function(){return firebase.firestore().collection(coll).doc(track).get();}).then(function(doc){
      if(doc.exists){var ov=doc.data()||{};window.MMCMS_MISSED=apply(D,ov);window.MMCMS_LIVE=ov;window.MMCMS_SRC=coll;}
      return ov_or_null(doc);
    }).catch(function(){return null;});
  }).catch(function(){return null;});
  function ov_or_null(doc){return doc.exists?(doc.data()||null):null;}
  return _cache[track];
}

window.MMCMS={ready:ready,apply:apply,hash:hash,entryKey:entryKey};
if(typeof module!=='undefined'&&module.exports)module.exports={apply:apply,hash:hash,entryKey:entryKey};
})();
