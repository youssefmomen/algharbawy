/* وضع دوولينجو — محرك التعلم بالأسئلة (منصة مستر يوسف)
   يبني جلسة أسئلة تفاعلية من بيانات الدرس نفسها (window.AR_G8):
   اختيار من متعدد، صح/خطأ، أكمل من نص الدرس، توصيل المعاني، وأسئلة بإجابة نموذجية.
   الغلط يُصحَّح فورًا، والسؤال يعود بعد أسئلة قليلة، والأخطاء تُحفظ للمراجعة. */
(function(){
'use strict';

/* ---------- أدوات عامة ---------- */
var ARD='٠١٢٣٤٥٦٧٨٩';
function ar(n){return String(n).replace(/\d/g,function(d){return ARD[d]});}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function hash(s){var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return h.toString(36);}
function strip(h){
  return String(h||'')
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/g,'')
    .replace(/<[^>]+>/g,'')
    .replace(/&nbsp;/g,' ').replace(/&laquo;/g,'«').replace(/&raquo;/g,'»').replace(/&amp;/g,'&')
    .replace(/[ \t]+/g,' ').trim();
}
function sample(a,n){return shuffle(a).slice(0,n);}

/* ---------- بناء بنك الأسئلة من بيانات الدرس ---------- */
function qItems(lesson){
  var out=[];
  (lesson.segments||[]).forEach(function(sg){
    (sg.questions||[]).concat(sg.check||[]).forEach(function(q){
      if(!q||!q.q)return;
      if(q.t==='mcq'&&q.options&&q.options.length>=2){
        var tf=q.options.length===2&&q.options[0]==='صح'&&q.options[1]==='خطأ';
        out.push({id:'q'+hash(q.q),kind:tf?'tf':'mcq',src:q.src||'',q:q.q,options:q.options.slice(),a:q.a});
      }else if(q.t==='open'&&q.mod){
        out.push({id:'o'+hash(q.q),kind:'self',src:q.src||'',q:q.q,mod:q.mod});
      }
    });
  });
  return out;
}

function vocabPairs(D,lesson){
  var pairs=[],seen={};
  (lesson.segments||[]).forEach(function(sg){
    (sg.explain||[]).forEach(function(e){
      var h=D.B&&D.B[e.b];if(!h||h.indexOf('الكلمة')<0)return;
      var m,re=/<tr>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<\/tr>/g;
      while((m=re.exec(h))){
        var w=strip(m[1]).replace(/^[(（]?[0-9٠-٩]+[)）]?\s*/,'').trim();
        var g=strip(m[2])
          .replace(/^المراد[:：]\s*/,'')
          .split(/(?:الجمع|المفرد|المضاد|جمع|مفرد|مضاد|تنبيه)\s*[:：]/)[0]
          .replace(/[.\s،,]+$/,'').trim();
        if(w&&g&&w.length<=20&&g.length>=2&&g.length<=60&&!seen[w]){
          seen[w]=1;pairs.push({w:w,g:g});
        }
      }
    });
  });
  return pairs;
}

function vocabItems(pairs){
  var out=[],gs=pairs.map(function(p){return p.g;}),ws=pairs.map(function(p){return p.w;});
  pairs.forEach(function(p,i){
    var ds=sample(gs.filter(function(x,j){return j!==i&&x!==p.g;}),3);
    if(ds.length===3){
      var ops=shuffle([p.g].concat(ds));
      out.push({id:'vm'+hash(p.w),kind:'mcq',src:'معاني الكلمات',q:'ما معنى كلمة «'+p.w+'»؟',options:ops,a:ops.indexOf(p.g)});
    }
    var dw=sample(ws.filter(function(x,j){return j!==i;}),3);
    if(dw.length===3){
      var ops2=shuffle([p.w].concat(dw));
      out.push({id:'vr'+hash(p.g),kind:'mcq',src:'معاني الكلمات',q:'ما الكلمة التي معناها «'+p.g+'»؟',options:ops2,a:ops2.indexOf(p.w)});
    }
  });
  for(var s=0;s<pairs.length;s+=5){
    out.push({id:'mm'+s,kind:'match',src:'معاني الكلمات',q:'وصّل كل كلمة بمعناها',pairs:pairs.slice(s,s+5)});
  }
  return out;
}

var M1='\u0001',M2='\u0002';
function clozeItems(D,lesson){
  var out=[],words=[],seenW={};
  (lesson.segments||[]).forEach(function(sg){
    (sg.explain||[]).forEach(function(e){
      var h=D.B&&D.B[e.b];
      if(!h||(h.indexOf("class='gl'")<0&&h.indexOf('class="gl"')<0))return;
      h=h.replace(/<\/(div|p|li|tr|td|th|table|ul|ol|h\d)>/g,'. ');
      var marked=h.replace(/([^\s<>'"]+)\s*<sup class=['"]gl['"]>\([0-9٠-٩]+\)<\/sup>/g,M1+'$1'+M2);
      var txt=strip(marked);
      var idx=0;
      while(true){
        var m1=txt.indexOf(M1,idx);if(m1<0)break;
        var m2=txt.indexOf(M2,m1);if(m2<0)break;
        idx=m2+1;
        var word=txt.slice(m1+1,m2).trim();
        var bare=word.replace(/[ً-ْٰ]/g,'');
        if(bare.length<3||seenW[bare])continue;
        var before=txt.slice(0,m1).split(M1).join('').split(M2).join('');
        var sB=Math.max(before.lastIndexOf('.'),before.lastIndexOf('؟'),before.lastIndexOf('!'),before.lastIndexOf('؛'));
        var pre=before.slice(sB+1).trim();
        if(pre.length>80){var cut=pre.lastIndexOf(' ',pre.length-80);if(cut>0)pre='… '+pre.slice(cut+1);}
        var rest=txt.slice(m2+1);
        var iM=rest.indexOf(M1);
        var pm=rest.search(/[.؟!؛]/);
        var cutAt=(pm<0)?rest.length:pm;
        var mid=false;
        if(iM>=0&&iM<cutAt){cutAt=iM;mid=true;}
        var post=rest.slice(0,cutAt).split(M2).join('').trim();
        if(post.length>90){var c2=post.indexOf(' ',90);if(c2>0){post=post.slice(0,c2);mid=true;}}
        if(mid)post+=' …';
        var sentence=(pre+' ـــــ '+post).replace(/\s+/g,' ').trim();
        if(sentence.length<25||sentence.length>190)continue;
        seenW[bare]=1;words.push(word);
        out.push({id:'cz'+hash(sentence+word),kind:'cloze',src:'من نص الدرس',q:sentence,word:word});
      }
    });
  });
  var uniq=[],u={};
  words.forEach(function(w){var b=w.replace(/[ً-ْٰ]/g,'');if(!u[b]){u[b]=1;uniq.push(w);}});
  out.forEach(function(it){
    var bw=it.word.replace(/[ً-ْٰ]/g,'');
    var ds=sample(uniq.filter(function(w){return w.replace(/[ً-ْٰ]/g,'')!==bw;}),3);
    it.options=shuffle([it.word].concat(ds));
    it.a=it.options.indexOf(it.word);
  });
  return out.filter(function(it){return it.options.length===4;});
}

function commentItems(D,lesson){
  var out=[];
  (lesson.segments||[]).forEach(function(sg){
    (sg.explain||[]).forEach(function(e){
      var h=D.B&&D.B[e.b];if(!h||h.indexOf('التعليق العام')<0)return;
      var re=/<b>([\s\S]*?)<\/b>/g,m,marks=[];
      while((m=re.exec(h))){marks.push({label:strip(m[1]).replace(/[:：]\s*$/,''),at:m.index+m[0].length});}
      var cells=[];
      for(var i=0;i<marks.length;i++){
        var end=(i+1<marks.length)?h.lastIndexOf('<b>',marks[i+1].at):h.length;
        var v=strip(h.slice(marks[i].at,end)).replace(/^[:：.\s]+/,'').trim();
        if(marks[i].label&&v&&v.length>=10&&v.length<=160&&marks[i].label.length<=28){
          cells.push({label:marks[i].label,v:v});
        }
      }
      if(cells.length>=3){
        cells.forEach(function(c){
          var ds=sample(cells.filter(function(x){return x!==c;}),3).map(function(x){return x.v;});
          if(ds.length<3)return;
          var ops=shuffle([c.v].concat(ds));
          out.push({id:'cm'+hash(c.label),kind:'mcq',src:'التعليق العام على النص',q:'أكمل: '+c.label+' …',options:ops,a:ops.indexOf(c.v)});
        });
      }
    });
  });
  return out;
}

function buildPool(D,lesson){
  var pool=qItems(lesson);
  pool=pool.concat(vocabItems(vocabPairs(D,lesson)));
  pool=pool.concat(clozeItems(D,lesson));
  pool=pool.concat(commentItems(D,lesson));
  var seen={},ded=[];
  pool.forEach(function(it){if(!seen[it.id]){seen[it.id]=1;ded.push(it);}});
  return ded;
}

var CORE={buildPool:buildPool,qItems:qItems,vocabPairs:vocabPairs,vocabItems:vocabItems,clozeItems:clozeItems,commentItems:commentItems};
if(typeof window!=='undefined')window.DUO_CORE=CORE;
if(typeof globalThis!=='undefined')globalThis.DUO_CORE=CORE;
if(typeof document==='undefined')return;

/* ---------- الحالة والتقدم ---------- */
function stKey(t,l){return 'duo:'+t+':'+l;}
function loadSt(t,l){
  try{var s=JSON.parse(localStorage.getItem(stKey(t,l))||'{}');
    s.m=s.m||{};s.bank=s.bank||{};s.rounds=s.rounds||0;return s;}catch(e){return {m:{},bank:{},rounds:0}};}
function saveSt(t,l,s){try{localStorage.setItem(stKey(t,l),JSON.stringify(s));}catch(e){}}

/* نجمة في إحصاء المنصة العام عند إتقان سؤال (نفس نظام الدروس: ar-<track>-<lesson>) */
function starKey(t,l){return 'ar-'+t+'-duo_'+l;}
function grantStar(t,l,itemId){
  try{
    var k=starKey(t,l),S=JSON.parse(localStorage.getItem(k)||'{}');
    S.done=S.done||{};
    if(S.done[itemId])return false;
    S.done[itemId]={picked:1};
    localStorage.setItem(k,JSON.stringify(S));
    return true;
  }catch(e){return false;}
}
function starsTotal(t,l){
  try{var S=JSON.parse(localStorage.getItem(starKey(t,l))||'{}');return S.done?Object.keys(S.done).length:0;}catch(e){return 0;}
}

/* ---------- بناء الجولة ---------- */
var ROUND=20;
function mastery(st,id){var x=st.m[id];return x?x.r:0;}
function buildRound(pool,st,mode){
  var q=[];
  if(mode==='review'){
    q=sample(pool.filter(function(it){return st.bank[it.id];}),ROUND);
  }else{
    var fresh=pool.filter(function(it){return !st.m[it.id];});
    var banked=pool.filter(function(it){return st.bank[it.id];});
    var weak=pool.filter(function(it){return st.m[it.id]&&mastery(st,it.id)<2&&!st.bank[it.id];});
    q=q.concat(sample(banked,Math.min(5,Math.ceil(ROUND*0.3))));
    q=q.concat(sample(fresh,Math.max(0,Math.min(14,ROUND-q.length))));
    if(q.length<ROUND)q=q.concat(sample(weak,ROUND-q.length));
    if(q.length<ROUND)q=q.concat(sample(pool.filter(function(it){return q.indexOf(it)<0;}),ROUND-q.length));
    q=shuffle(q);
  }
  return q.map(function(it){return {it:it,wrong:false};});
}

/* ---------- الواجهة ---------- */
var P=new URLSearchParams(location.search);
var TRK=P.get('t')||'g8';
var GLOB={g8:'AR_G8',g8ar:'AR_G8'}[TRK]||'AR_G8';
var app=document.getElementById('duoApp');
var D=null,LES=null,st=null,queue=[],qi=0,stats={asked:0,first:0,wrong:0},roundMode='main';

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function kindLabel(it){
  return it.kind==='tf'?'صح أم خطأ':it.kind==='cloze'?'أكمل من نص الدرس':it.kind==='match'?'وصّل المعاني':it.kind==='self'?'سؤال وجواب':'اختر الإجابة الصحيحة';
}
function pct(pool,st){if(!pool.length)return 0;var m=0;pool.forEach(function(it){if(mastery(st,it.id)>=2)m++;});return Math.round(m/pool.length*100);}

function renderTop(){
  var bar=document.getElementById('duoBar'),stars=document.getElementById('duoStars');
  if(bar)bar.style.width=(queue.length?Math.min(100,Math.round(qi/queue.length*100)):0)+'%';
  if(stars)stars.textContent='⭐ '+ar(starsTotal(TRK,LES?LES.id:'-'));
}

function home(){
  D=window[GLOB];
  var lessons=(D&&D.lessons)||[];
  var h='<div class="duo-hero"><div class="duo-hcard">'
    +'<img src="assets/img/mr-youssef-pointup.png" alt="">'
    +'<h1>وضع دوولينجو 🦉</h1>'
    +'<p>تعلَّم الدرس كله بالأسئلة: كل معلومة تأتيك سؤالًا، وإذا أخطأت تعرف الصواب فورًا ويعود السؤال إليك بعد قليل، وأخطاؤك محفوظة لتراجعها.</p>'
    +'</div>';
  ((D&&D.stages)||[]).forEach(function(sg){
    var ls=lessons.filter(function(l){return l.stage===sg.id;});
    if(!ls.length)return;
    h+='<div class="duo-stg">'+esc(sg.title)+'</div>';
    ls.forEach(function(l){
      var lst=loadSt(TRK,l.id);
      var pool=buildPool(D,l);
      var p=pct(pool,lst);
      var bank=Object.keys(lst.bank).length;
      h+='<a class="duo-ls" href="duo.html?t='+TRK+'&lesson='+l.id+'">'
        +'<span class="pc" style="--p:'+p+'"><i>'+ar(p)+'٪</i></span>'
        +'<span><b>'+esc(l.title)+'</b>'
        +'<span class="mt">'+ar(pool.length)+' سؤالًا في بنك الدرس'
        +(bank?' · '+ar(bank)+' في صندوق أخطائك':'')
        +'</span></span>'
        +'<span class="duo-btn go">ابدأ</span></a>';
    });
  });
  h+='</div>';
  app.innerHTML=h;
  var bar=document.getElementById('duoBar');if(bar)bar.style.width='0%';
  var stars=document.getElementById('duoStars');
  if(stars){var s=0;lessons.forEach(function(l){s+=starsTotal(TRK,l.id);});stars.textContent='⭐ '+ar(s);}
  var x=document.getElementById('duoX');if(x)x.style.visibility='hidden';
}

function start(mode){
  roundMode=mode||'main';
  queue=buildRound(buildPool(D,LES),st,roundMode);
  qi=0;stats={asked:0,first:0,wrong:0};
  if(!queue.length){endScreen(true);return;}
  step();
}

function step(){
  renderTop();
  if(qi>=queue.length){endScreen();return;}
  var cell=queue[qi],it=cell.it;
  if(it.kind==='self')return renderSelf(cell);
  if(it.kind==='match')return renderMatch(cell);
  renderChoice(cell);
}

function foot(html,cls){
  var f=document.getElementById('duoFoot');
  f.className='duo-foot '+(cls||'');
  f.innerHTML='<div class="in">'+html+'</div>';
}

function correctText(it){
  if(it.kind==='self')return it.mod;
  if(it.kind==='match')return it.pairs.map(function(p){return p.w+' = '+p.g;}).join(' · ');
  return it.options[it.a];
}

function feedback(ok,it,extra){
  var fb=ok
    ?'<span class="ic">✓</span><span>أحسنت! إجابة صحيحة<small>'+(extra||'')+'</small></span><img src="assets/img/mr-youssef-celebrating.png" alt="">'
    :'<span class="ic">✗</span><span>الإجابة الصحيحة:<br><b>'+esc(correctText(it))+'</b><small>سيعود إليك هذا السؤال بعد قليل · أُضيف إلى صندوق أخطائك</small></span><img src="assets/img/mr-youssef-encouraging.png" alt="">';
  var f=document.getElementById('duoFoot');
  f.className='duo-foot '+(ok?'ok':'no');
  f.innerHTML='<div class="in">'+fb+'<button class="duo-btn '+(ok?'okb':'nob')+'" id="duoNext">استمر</button></div>';
  document.getElementById('duoNext').onclick=function(){qi++;step();};
}

function record(cell,ok){
  var it=cell.it,st0=st.m[it.id]||(st.m[it.id]={r:0,w:0});
  stats.asked++;
  if(ok){
    st0.r++;
    if(!cell.wrong)stats.first++;
    if(st0.r>=2){
      grantStar(TRK,LES.id,it.id);
      if(roundMode==='review')delete st.bank[it.id];
    }
  }else{
    stats.wrong++;cell.wrong=true;st0.w++;st0.r=0;
    st.bank[it.id]=1;
    var at=Math.min(queue.length,qi+4+Math.floor(Math.random()*3));
    queue.splice(at,0,{it:it,wrong:true,re:1});
  }
  saveSt(TRK,LES.id,st);
}

function renderChoice(cell){
  var it=cell.it;
  var q=it.kind==='cloze'?esc(it.q).replace('ـــــ','<span class="blank">؟</span>'):esc(it.q);
  var opts=it.options.map(function(o,i){
    return '<button class="duo-opt" data-i="'+i+'"><span class="k">'+ar(i+1)+'</span><span>'+esc(o)+'</span></button>';
  }).join('');
  app.innerHTML='<div class="duo-stage">'
    +'<span class="duo-kind">'+kindLabel(it)+(it.src?' · '+esc(it.src):'')+'</span>'
    +'<div class="duo-q">'+q+'</div>'
    +(cell.re?'<div class="duo-sub">سؤال أخطأتَ فيه من قبل — ركّز هذه المرة</div>':'')
    +'<div class="'+(it.kind==='tf'?'duo-tf':'duo-opts')+'">'+opts+'</div>'
    +'</div>';
  foot('<div class="duo-fb"></div><button class="duo-btn" id="duoGo" disabled>تحقق</button>');
  var sel=-1;
  var btns=[].slice.call(app.querySelectorAll('.duo-opt'));
  btns.forEach(function(b){
    b.onclick=function(){
      if(b.disabled)return;
      btns.forEach(function(x){x.classList.remove('sel');});
      b.classList.add('sel');sel=+b.dataset.i;
      document.getElementById('duoGo').disabled=false;
    };
  });
  document.getElementById('duoGo').onclick=function(){
    if(sel<0)return;
    var ok=sel===it.a;
    btns.forEach(function(b,i){
      b.disabled=true;
      if(i===it.a)b.classList.add('ok');
      else if(i===sel)b.classList.add('no');
    });
    record(cell,ok);
    feedback(ok,it,ok&&cell.re?'صحّحت خطأك السابق':'');
  };
}

function renderSelf(cell){
  var it=cell.it;
  app.innerHTML='<div class="duo-stage">'
    +'<span class="duo-kind">'+kindLabel(it)+(it.src?' · '+esc(it.src):'')+'</span>'
    +'<div class="duo-q">'+esc(it.q)+'</div>'
    +'<div class="duo-sub">فكّر في الإجابة وقُلها لنفسك، ثم اعرض الإجابة النموذجية وقيّم نفسك بصدق.</div>'
    +'<div id="duoRev"></div>'
    +'</div>';
  foot('<div class="duo-fb"></div><button class="duo-btn" id="duoGo">اعرض الإجابة</button>');
  document.getElementById('duoGo').onclick=function(){
    document.getElementById('duoRev').innerHTML='<div class="duo-answer"><b>الإجابة النموذجية:</b> '+esc(it.mod)+'</div>';
    foot('<div class="duo-fb">هل كانت إجابتك صحيحة؟</div>'
      +'<button class="duo-btn ghost" id="duoNo">لم أعرفها</button>'
      +'<button class="duo-btn okb" id="duoYes">كنت أعرفها</button>');
    document.getElementById('duoYes').onclick=function(){record(cell,true);feedback(true,it,'');};
    document.getElementById('duoNo').onclick=function(){record(cell,false);feedback(false,it);};
  };
}

function renderMatch(cell){
  var it=cell.it;
  var L=shuffle(it.pairs.map(function(p,i){return {t:p.w,i:i};}));
  var R=shuffle(it.pairs.map(function(p,i){return {t:p.g,i:i};}));
  app.innerHTML='<div class="duo-stage">'
    +'<span class="duo-kind">'+kindLabel(it)+'</span>'
    +'<div class="duo-q">'+esc(it.q)+'</div>'
    +'<div class="duo-match"><div id="duoL">'
    +L.map(function(x){return '<button class="duo-m" data-s="l" data-i="'+x.i+'">'+esc(x.t)+'</button>';}).join('')
    +'</div><div id="duoR">'
    +R.map(function(x){return '<button class="duo-m" data-s="r" data-i="'+x.i+'">'+esc(x.t)+'</button>';}).join('')
    +'</div></div></div>';
  foot('<div class="duo-fb">اضغط كلمة ثم معناها</div>');
  var selL=null,doneC=0,mist=false;
  [].slice.call(app.querySelectorAll('.duo-m')).forEach(function(b){
    b.onclick=function(){
      if(b.classList.contains('ok'))return;
      if(b.dataset.s==='l'){
        [].slice.call(app.querySelectorAll('#duoL .duo-m')).forEach(function(x){x.classList.remove('sel');});
        b.classList.add('sel');selL=b;return;
      }
      if(!selL)return;
      var lb=selL;selL=null;lb.classList.remove('sel');
      if(lb.dataset.i===b.dataset.i){
        lb.classList.add('ok');b.classList.add('ok');doneC++;
        if(doneC===it.pairs.length){
          if(mist){feedback(false,it);}
          else{record(cell,true);feedback(true,it,'');}
        }
      }else{
        if(!mist){mist=true;record(cell,false);}
        b.classList.add('no');setTimeout(function(){b.classList.remove('no');},350);
      }
    };
  });
}

function endScreen(empty){
  renderTop();
  var pool=buildPool(D,LES),p=pct(pool,st),bank=Object.keys(st.bank).length;
  app.innerHTML='<div class="duo-stage"><div class="duo-end">'
    +'<img src="assets/img/mr-youssef-'+(stats.wrong?'encouraging':'celebrating')+'.png" alt="">'
    +'<h2>'+(empty?'لا توجد أسئلة في صندوق أخطائك 🎉':(stats.wrong?'انتهت الجولة — أخطاؤك محفوظة لك':'جولة ممتازة!'))+'</h2>'
    +'<div class="duo-stats">'
    +'<div class="duo-stat"><span>'+ar(stats.first)+'</span>صحيحة من أول مرة</div>'
    +'<div class="duo-stat"><span>'+ar(stats.wrong)+'</span>أخطاء عولجت</div>'
    +'<div class="duo-stat"><span>'+ar(p)+'٪</span>إتقان الدرس</div>'
    +'</div>'
    +'<div class="row">'
    +'<a class="duo-btn" id="duoAgain">جولة جديدة</a>'
    +(bank?'<a class="duo-btn nob" id="duoBank">مراجعة أخطائي ('+ar(bank)+')</a>':'')
    +'<a class="duo-btn ghost" href="duo.html?t='+TRK+'">دروس أخرى</a>'
    +'</div></div></div>';
  foot('<div class="duo-fb"></div>');
  document.getElementById('duoAgain').onclick=function(ev){ev.preventDefault();start('main');};
  var bk=document.getElementById('duoBank');
  if(bk)bk.onclick=function(ev){ev.preventDefault();start('review');};
}

/* ---------- تشغيل ---------- */
function boot(){
  D=window[GLOB];
  var id=P.get('lesson');
  if(!D){app.innerHTML='<div class="duo-hero"><div class="duo-hcard"><p>تعذّر تحميل بيانات المنهج. حدّث الصفحة.</p></div></div>';return;}
  if(!id){home();return;}
  LES=D.lessons.filter(function(l){return l.id===id;})[0]||D.lessons[+id-1];
  if(!LES){home();return;}
  st=loadSt(TRK,LES.id);
  var hd=document.getElementById('duoHead');if(hd)hd.style.display='block';
  var tt=document.getElementById('duoTitle');
  if(tt)tt.textContent=LES.title;
  start('main');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
