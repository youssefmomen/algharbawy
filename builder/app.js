/* صانع القوالب - المحرك والواجهة */
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=o=>JSON.parse(JSON.stringify(o));
const num=(v,d)=>isNaN(+v)?d:+v;
/* ===== الصوت (بيشتغل من غير ملفات ولا نت) ===== */
function SNDLIB(){
 var ac,mt,mi=0,au;
 function ctx(){return ac||(ac=new (window.AudioContext||window.webkitAudioContext)())}
 function tone(f,t0,d,type,v){var c=ctx(),o=c.createOscillator(),g=c.createGain(),t=c.currentTime+t0;o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(v||.15,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.05)}
 var FX={click:function(){tone(800,0,.06,'square',.07)},pop:function(){tone(500,0,.09,'sine',.2);tone(900,.05,.09,'sine',.15)},tick:function(){tone(1300,0,.03,'triangle',.18)},
  success:function(){[523,659,784,1047].forEach(function(f,i){tone(f,i*.1,.28,'sine',.16)})},chime:function(){[880,1320,1760].forEach(function(f,i){tone(f,i*.14,.55,'sine',.12)})}};
 var MUS={calm:{n:[261,329,392,329,293,349,440,349],ms:650,t:'sine'},happy:{n:[392,494,587,494,440,523,659,523],ms:300,t:'triangle'},soft:{n:[220,262,330,262,196,247,294,247],ms:850,t:'sine'}};
 return {play:function(n,custom){if(!n||n==='none')return;try{if(n==='custom'){if(custom){var a=new Audio(custom);a.play().catch(function(){})}return}(FX[n]||FX.click)()}catch(e){}},
  music:function(n,on,custom){clearInterval(mt);if(au){au.pause();au=null}if(!on||!n||n==='none')return;try{if(n==='custom'){if(custom){au=new Audio(custom);au.loop=true;au.play().catch(function(){})}return}var m=MUS[n]||MUS.calm;mt=setInterval(function(){tone(m.n[mi++%m.n.length],0,m.ms/1000*1.6,m.t,.05)},m.ms)}catch(e){}}}
}
const SND=SNDLIB();
/* ===== ألوان وخطوط ===== */
const lum=h=>{h=String(h).replace('#','');if(h.length==3)h=h.split('').map(c=>c+c).join('');const v=[0,2,4].map(i=>parseInt(h.substr(i,2),16)/255).map(c=>c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4));return .2126*v[0]+.7152*v[1]+.0722*v[2]};
const contrast=h=>{try{return lum(h)>.45?'#1a1a2e':'#ffffff'}catch(e){return '#ffffff'}};
const fontOf=id=>{const f=FONTS.find(x=>x[0]===id)||FONTS[0];return f[2]+',Tahoma,Arial,sans-serif'};
const SH={none:'none',soft:'0 6px 20px rgba(0,0,0,.09)',strong:'0 14px 40px rgba(0,0,0,.22)'};
function fontsLink(t,secs){
 if(!t.online)return '';const used=new Set([t.hf,t.bf]);
 secs.forEach(s=>s.blocks.forEach(b=>{if(b.font)used.add(b.font)}));
 const q=[...used].map(id=>FONTS.find(x=>x[0]===id)).filter(f=>f&&f[3]).map(f=>'family='+f[3]);
 return q.length?`<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?${q.join('&')}&display=swap">`:'';
}
/* ===== CSS الصفحة ===== */
function pageCss(t){return `
:root{--p:${t.p};--s:${t.s};--bg:${t.bg};--sf:${t.sf};--tx:${t.tx};--r:${t.r}px;--sh:${SH[t.sh]||'none'};--pt:${contrast(t.p)};--g:${t.gap}px}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--tx);font-family:${fontOf(t.bf)};font-size:${t.fs}px;line-height:1.85;overflow-x:hidden}
h1,h2,h3,.hd,.btn,.price{font-family:${fontOf(t.hf)}}
.hd{margin:0;line-height:1.35}p{margin:0}a{color:inherit}
.sec{position:relative;padding:var(--spad,70px) 20px;overflow:hidden}
.sec.ov::before{content:'';position:absolute;inset:0;background:var(--ov)}
.in{position:relative;z-index:1;max-width:${t.width}px;margin:0 auto;display:flex;flex-wrap:wrap;gap:var(--g);align-items:stretch}
.in.split{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}
.col{display:flex;flex-wrap:wrap;gap:var(--g);align-items:center;align-content:center}
.b{min-width:0}
.d-dots{background-image:radial-gradient(circle,rgba(128,128,128,.28) 2px,transparent 2.5px);background-size:24px 24px}
.d-grid{background-image:linear-gradient(rgba(128,128,128,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(128,128,128,.15) 1px,transparent 1px);background-size:36px 36px}
.d-stripes{background-image:repeating-linear-gradient(45deg,rgba(128,128,128,.12) 0 12px,transparent 12px 24px)}
.d-bubbles{background-image:radial-gradient(circle at 8% 18%,color-mix(in srgb,var(--p) 20%,transparent) 0 110px,transparent 111px),radial-gradient(circle at 94% 86%,color-mix(in srgb,var(--s) 22%,transparent) 0 150px,transparent 151px)}
.d-glow{background-image:radial-gradient(circle at 50% 0,color-mix(in srgb,var(--p) 35%,transparent),transparent 60%)}
.c-curve{border-radius:0 0 50% 50%/0 0 60px 60px}
.c-slant{clip-path:polygon(0 0,100% 0,100% 93%,0 100%)}
.c-arch{border-radius:50% 50% 0 0/60px 60px 0 0}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;font-weight:700;cursor:pointer;border:2px solid var(--bb,var(--p));background:var(--bb,var(--p));color:var(--bt,var(--pt));transition:transform .15s,filter .15s;line-height:1.4}
.btn:hover{filter:brightness(1.08);transform:translateY(-2px)}
.btn.s-s{padding:7px 16px;font-size:.85em}.btn.s-m{padding:11px 26px}.btn.s-l{padding:15px 38px;font-size:1.12em}
.btn.sh-square{border-radius:4px}.btn.sh-round{border-radius:var(--r)}.btn.sh-pill{border-radius:999px}
.btn.k-outline{background:transparent;color:var(--bb,var(--p))}
.btn.k-ghost{background:color-mix(in srgb,var(--bb,var(--p)) 16%,transparent);color:var(--bb,var(--p));border-color:transparent}
.btn.k-link{background:none;border-color:transparent;color:inherit;padding:8px 10px}
.card{background:var(--cbg,var(--sf));color:var(--tx);border-radius:var(--cr,var(--r));box-shadow:var(--sh);padding:26px;height:100%}
.card.ce{text-align:center}.card.ft{border:3px solid var(--p);transform:scale(1.03)}
.card .ic{font-size:38px;line-height:1.3}.card h3{margin:4px 0 6px;font-size:1.25em}.card .price{font-size:1.9em;font-weight:900;color:var(--p);margin:4px 0}
.card ul{list-style:none;padding:0;margin:12px 0;text-align:start}.card li{padding:4px 0}.card li::before{content:'✓ ';color:var(--p);font-weight:900}
.card .btn{margin-top:10px}
.ico{display:inline-flex;align-items:center;justify-content:center;width:1.8em;height:1.8em;line-height:1}
.ico.sh-circle{border-radius:50%}.ico.sh-square{border-radius:var(--r)}
.stat{text-align:center}.stat b{display:block;font-size:2.4em;font-weight:900;line-height:1.2}.stat span{opacity:.85}
.faq{background:var(--sf);color:var(--tx);border-radius:var(--r);padding:14px 18px;box-shadow:var(--sh)}
.faq summary{cursor:pointer;font-weight:700}.faq p{margin-top:8px;opacity:.85}
.imgb img,.imgb .ph{display:block;max-width:100%;margin:0 auto}
.ph{background:linear-gradient(135deg,var(--p),var(--s));opacity:.85;display:flex;align-items:center;justify-content:center;font-size:2.5em;color:#fff;min-height:120px;width:100%}
.frm{display:flex;flex-direction:column;gap:10px;text-align:start}
.frm input,.frm textarea{padding:12px 14px;border:1px solid rgba(128,128,128,.4);border-radius:var(--r);font:inherit;background:#fff;color:#222;width:100%}
.frm textarea{min-height:100px}.thx{color:#12a05c;font-weight:700;text-align:center}
.art svg{width:100%;height:auto;display:block}
.hr{border:0;margin:0}
.mus{position:fixed;bottom:16px;left:16px;width:46px;height:46px;border-radius:50%;border:0;background:var(--p);color:var(--pt);font-size:20px;cursor:pointer;z-index:9;box-shadow:var(--sh)}
@keyframes fade{from{opacity:0}to{opacity:1}}@keyframes up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}
@keyframes zoom{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:none}}@keyframes slide{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
@keyframes float{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-12px) rotate(2deg)}}
.a-fade{animation:fade 1s both}.a-up{animation:up .8s both}.a-zoom{animation:zoom .7s both}.a-slide{animation:slide .8s both}
.a-bounce{animation:bounce 1.6s infinite}.a-pulse{animation:pulse 1.8s infinite}.a-float{animation:float 4s ease-in-out infinite}
@media(max-width:720px){.sec{padding:calc(var(--spad,70px)*.7) 16px}.in.split{grid-template-columns:1fr;gap:24px}.b.p{width:100%!important}.b.h{width:calc(50% - var(--g)/2)!important}.in{justify-content:center}.card.ft{transform:none}}
`}
/* ===== رسم العناصر ===== */
const nl=s=>esc(s).replace(/\n/g,'<br>');
function resolveC(v,t){return !v?'':(t[v]||v)}
function blockInner(b,t){
 switch(b.t){
 case 'heading':{const sz=num(b.size,34);const fs=sz>28?`clamp(${Math.round(sz*.62)}px,${(sz/11).toFixed(2)}vw,${sz}px)`:sz+'px';
  return `<h2 class="hd" style="font-size:${fs};font-weight:${b.wt};${b.color?'color:'+esc(b.color)+';':''}${b.font?'font-family:'+fontOf(b.font)+';':''}">${nl(b.text)}</h2>`}
 case 'text':return `<p style="font-size:${num(b.size,17)}px;opacity:${num(b.op,100)/100};white-space:pre-line;${b.color?'color:'+esc(b.color)+';':''}">${esc(b.text)}</p>`;
 case 'button':return `<a class="btn k-${b.kind} s-${b.size} sh-${b.shape}" href="${esc(b.link||'#')}" style="${b.bg?'--bb:'+esc(b.bg)+';':''}${b.tc?'--bt:'+esc(b.tc)+';':''}">${b.icon?esc(b.icon)+' ':''}${esc(b.label)}</a>`;
 case 'image':{const sty=`width:${num(b.imgw,100)}%;border-radius:${num(b.radius,0)}px;${b.h>0?'height:'+b.h+'px;object-fit:'+b.fit+';':''}${b.shadow?'box-shadow:var(--sh);':''}`;
  return `<div class="imgb">${b.src?`<img src="${esc(b.src)}" alt="" style="${sty}">`:`<div class="ph" style="${sty}${b.h>0?'':'height:200px;'}">🖼</div>`}</div>`}
 case 'art':return `<div class="art" style="width:${num(b.size,300)}px;max-width:100%;display:inline-block">${ART[b.kind]||ART.blob}</div>`;
 case 'icon':return `<span class="ico sh-${b.shape}" style="font-size:${num(b.size,44)}px;${b.bg?'background:'+esc(resolveC(b.bg,t))+';':''}"><span style="font-size:.55em">${esc(b.emoji)}</span></span>`;
 case 'card':{const ln=(b.lines||'').split('\n').map(x=>x.trim()).filter(Boolean);
  return `<div class="card${b.center?' ce':''}${b.featured?' ft':''}" style="${b.bg?'--cbg:'+esc(b.bg)+';':''}${b.radius>=0?'--cr:'+b.radius+'px;':''}">${b.icon?`<div class="ic">${esc(b.icon)}</div>`:''}${b.title?`<h3 class="hd">${esc(b.title)}</h3>`:''}${b.price?`<div class="price">${esc(b.price)}</div>`:''}${b.text?`<p style="opacity:.85">${nl(b.text)}</p>`:''}${ln.length?`<ul>${ln.map(l=>`<li>${esc(l)}</li>`).join('')}</ul>`:''}${b.btn?`<a class="btn k-fill s-m sh-round" href="${esc(b.link||'#')}">${esc(b.btn)}</a>`:''}</div>`}
 case 'faq':return `<details class="faq"><summary>${esc(b.q)}</summary><p>${nl(b.a)}</p></details>`;
 case 'stat':return `<div class="stat"><b>${esc(b.num)}</b><span>${esc(b.label)}</span></div>`;
 case 'shape':if(b.kind==='dots')return `<div style="text-align:center;letter-spacing:10px;font-size:20px;${b.color?'color:'+esc(b.color):'color:var(--p)'}">● ● ●</div>`;
  if(b.kind==='wave')return `<svg viewBox="0 0 200 20" preserveAspectRatio="none" style="width:100%;height:${num(b.h,4)*5}px;display:block"><path d="M0 10Q25 0 50 10T100 10T150 10T200 10" fill="none" stroke="${b.color?esc(b.color):'var(--p)'}" stroke-width="${num(b.h,4)/2+1}"/></svg>`;
  return `<hr class="hr" style="height:${num(b.h,4)}px;background:${b.color?esc(b.color):'var(--p)'};border-radius:99px">`;
 case 'spacer':return `<div style="height:${num(b.h,30)}px"></div>`;
 case 'form':{const f=(b.fields||'').split('\n').map(x=>x.trim()).filter(Boolean);
  return `<form class="frm" data-email="${esc(b.email)}" data-thanks="${esc(b.thanks)}">${f.map(x=>/رسال|مشروع|ملاحظ|تفاصيل|message/i.test(x)?`<textarea placeholder="${esc(x)}"></textarea>`:`<input placeholder="${esc(x)}">`).join('')}<button class="btn k-fill s-m sh-round" type="submit">${esc(b.btn)}</button></form>`}
 }return ''}
function blockHtml(b,j,t){
 const w=num(b.w,100);let st='';
 if(w>0&&w<100)st+=`width:calc(${w}% - ${((1-w/100)*t.gap).toFixed(1)}px);`;else if(w>=100)st+='width:100%;';else st+='width:auto;max-width:100%;';
 if(b.dx||b.dy)st+=`translate:${b.dx||0}px ${b.dy||0}px;`;
 if(b.mt)st+=`margin-top:${b.mt}px;`;if(b.mb)st+=`margin-bottom:${b.mb}px;`;
 if(b.al)st+=`text-align:${b.al};`;
 const cls=['b'];if(w>0&&w<100){cls.push(['image','stat','icon'].includes(b.t)?'h':'p')}
 if(b.anim)cls.push('a-'+b.anim);
 return `<div class="${cls.join(' ')}" data-j="${j}" style="${st}">${blockInner(b,t)}</div>`;
}
function secHtml(s,i,t){
 const st=s.st;const bgc=resolveC(st.bg,t);let sty=`--spad:${num(st.pad,70)}px;`;
 if(bgc){sty+=`background-color:${bgc};`;if(!['bg','sf'].includes(st.bg))sty+=`color:${contrast(bgc)};`}
 if(st.tx)sty+=`color:${esc(st.tx)};`;
 if(st.bgimg)sty+=`background-image:url('${esc(st.bgimg)}');background-size:cover;background-position:center;`;
 if(st.minh>0)sty+=`min-height:${st.minh}px;`;
 if(st.ov>0)sty+=`--ov:rgba(0,0,0,${st.ov/100});`;
 const cls=['sec'];if(st.deco)cls.push('d-'+st.deco);if(st.clip)cls.push('c-'+st.clip);if(st.ov>0&&st.bgimg)cls.push('ov');
 const jm={start:'flex-start',center:'center',end:'flex-end',between:'space-between'}[st.al]||'flex-start';
 const ta=st.al==='between'?'start':st.al;
 const bl=s.blocks.map((b,j)=>[b,j]);let inner;
 if(s.lay==='split'){inner=`<div class="in split" style="text-align:${ta}">`+[1,2].map(c=>`<div class="col" style="justify-content:${jm==='space-between'?'flex-start':jm}">${bl.filter(x=>(x[0].c||1)==c).map(x=>blockHtml(x[0],x[1],t)).join('')}</div>`).join('')+'</div>'}
 else inner=`<div class="in" style="justify-content:${jm};text-align:${ta};${st.al==='between'?'align-items:center;':''}">${bl.map(x=>blockHtml(x[0],x[1],t)).join('')}</div>`;
 return `<section class="${cls.join(' ')}" data-i="${i}" style="${sty}">${inner}</section>`;
}
const bodyHtml=tpl=>tpl.sections.map((s,i)=>secHtml(s,i,tpl.theme)).join('');
const PREVCSS=`.sec{cursor:pointer}.sec.secsel{outline:3px solid #8a5cf6;outline-offset:-3px}.b{cursor:pointer}.b:hover{outline:1px dashed #8a5cf6}.b.sel{outline:2px solid #5b4bdb!important;outline-offset:3px;touch-action:none;cursor:move}.sec a,.sec button{pointer-events:none}.sec details summary{pointer-events:none}`;
function pageDoc(tpl,edit){
 const t=tpl.theme;
 return `<!doctype html><html lang="${t.dir==='ltr'?'en':'ar'}" dir="${t.dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(tpl.name)}</title>${fontsLink(t,tpl.sections)}<style id="pc">${pageCss(t)}</style>${edit?`<style id="ec">${PREVCSS}</style>`:''}</head><body>${bodyHtml(tpl)}</body></html>`;
}
function runtimeScript(tpl){
 const C={click:tpl.sounds.click,success:tpl.sounds.success,music:tpl.sounds.music,custom:tpl.sounds.custom||{}};
 return `<script>(function(){var L=(${SNDLIB.toString()})();var C=${JSON.stringify(C).replace(/</g,'\\u003c')};
document.addEventListener('click',function(e){if(C.click&&e.target.closest('.btn,summary'))L.play(C.click,C.custom.click)});
[].forEach.call(document.querySelectorAll('form.frm'),function(f){f.addEventListener('submit',function(e){e.preventDefault();L.play(C.success,C.custom.success);if(!f.querySelector('.thx')){var d=document.createElement('p');d.className='thx';d.textContent=f.dataset.thanks;f.appendChild(d)}if(f.dataset.email){var q=[].map.call(f.querySelectorAll('input,textarea'),function(x){return x.placeholder+': '+x.value}).join('\\n');location.href='mailto:'+f.dataset.email+'?body='+encodeURIComponent(q)}})});
if(C.music&&C.music!=='none'){var b=document.createElement('button');b.className='mus';b.textContent='🔇';var on=0;b.onclick=function(){on=!on;L.music(C.music,on,C.custom.music);b.textContent=on?'🔊':'🔇'};document.body.appendChild(b)}})()<\/script>`;
}
function exportHtml(tpl){return pageDoc(tpl,false).replace('</body>',runtimeScript(tpl)+'</body>')}
/* ===== الحالة ===== */
let S={tpl:null,tab:'view',view:'list',si:-1,bi:-1};
let hist=[],hi=-1,saveT=0,histT=0;
const OBJ={theme:()=>S.tpl.theme,sec:()=>S.tpl.sections[S.si],st:()=>S.tpl.sections[S.si].st,blk:()=>S.tpl.sections[S.si].blocks[S.bi],snd:()=>S.tpl.sounds,tpl:()=>S.tpl};
function normalize(t){
 const base=TEMPLATES[0];t=t||{};
 const o={id:t.id||'x',name:t.name||'قالب جديد',desc:t.desc||'',v:2,theme:Object.assign({},base.theme,t.theme||{}),sounds:Object.assign({click:'click',success:'success',music:'none',custom:{}},t.sounds||{}),sections:[]};
 if(!o.sounds.custom)o.sounds.custom={};
 (t.sections||[]).forEach(s=>{const ns=Object.assign({id:uid(),name:'قسم',lay:''},s);ns.st=Object.assign({bg:'',tx:'',al:'start',pad:70,deco:'',clip:'',bgimg:'',ov:0,minh:0},s.st||{});ns.blocks=(s.blocks||[]).map(b=>B(b.t in DEF?b.t:'text',b));o.sections.push(ns)});
 return o;
}
const frame=$('#frame');let fdoc=null,ready=false;
function toast(m){const e=$('#toast');e.textContent=m;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2200)}
function setTpl(t,keepHist){S.tpl=normalize(t);S.si=-1;S.bi=-1;S.view='list';ready=false;frame.srcdoc=pageDoc(S.tpl,true);if(!keepHist){hist=[JSON.stringify(S.tpl)];hi=0}renderPanel();updUndo()}
frame.addEventListener('load',()=>{try{fdoc=frame.contentDocument;ready=true;wirePreview();hilite()}catch(e){ready=false}});
function refresh(){
 if(!S.tpl)return;
 if(!ready||!fdoc){frame.srcdoc=pageDoc(S.tpl,true);return}
 const sy=fdoc.defaultView.scrollY;
 fdoc.getElementById('pc').textContent=pageCss(S.tpl.theme);
 fdoc.documentElement.dir=S.tpl.theme.dir;fdoc.documentElement.lang=S.tpl.theme.dir==='ltr'?'en':'ar';
 fdoc.body.innerHTML=bodyHtml(S.tpl);
 const old=fdoc.querySelector('link[href*="fonts.googleapis.com/css2"]');const want=fontsLink(S.tpl.theme,S.tpl.sections);
 if(want){const m=want.match(/href="(https:\/\/fonts.googleapis.com\/css2[^"]+)"/);if(m&&(!old||old.href!==m[1].replace(/&amp;/g,'&'))){if(old)old.remove();const l=fdoc.createElement('link');l.rel='stylesheet';l.href=m[1];fdoc.head.appendChild(l)}}else if(old)old.remove();
 fdoc.defaultView.scrollTo(0,sy);hilite();
}
function hilite(){
 if(!fdoc)return;fdoc.querySelectorAll('.sel,.secsel').forEach(e=>e.classList.remove('sel','secsel'));
 if(S.si<0)return;const sec=fdoc.querySelector(`.sec[data-i="${S.si}"]`);if(!sec)return;
 if(S.bi>=0){const b=sec.querySelector(`.b[data-j="${S.bi}"]`);if(b)b.classList.add('sel')}else sec.classList.add('secsel');
}
function scrollToSel(){if(!fdoc||S.si<0)return;const el=S.bi>=0?fdoc.querySelector(`.sec[data-i="${S.si}"] .b[data-j="${S.bi}"]`):fdoc.querySelector(`.sec[data-i="${S.si}"]`);if(el)el.scrollIntoView({block:'center',behavior:'smooth'})}
function changed(structural){
 refresh();if(structural)renderPanel();
 clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem('tb_draft',JSON.stringify(S.tpl))}catch(e){toast('مساحة التخزين مليانة. صدّر القالب كملف')}},400);
 clearTimeout(histT);histT=setTimeout(()=>{const j=JSON.stringify(S.tpl);if(j===hist[hi])return;hist=hist.slice(0,hi+1);hist.push(j);if(hist.length>40)hist.shift();hi=hist.length-1;updUndo()},500);
}
function updUndo(){$('#undo').disabled=hi<=0;$('#redo').disabled=hi>=hist.length-1}
function jump(d){clearTimeout(histT);const j=JSON.stringify(S.tpl);if(j!==hist[hi]){hist=hist.slice(0,hi+1);hist.push(j);hi=hist.length-1}const n=hi+d;if(n<0||n>=hist.length)return;hi=n;S.tpl=JSON.parse(hist[hi]);if(S.si>=S.tpl.sections.length){S.si=-1;S.view='list'}else if(S.bi>=0&&S.si>=0&&!S.tpl.sections[S.si].blocks[S.bi]){S.bi=-1;S.view='sec'}ready=false;frame.srcdoc=pageDoc(S.tpl,true);renderPanel();updUndo();try{localStorage.setItem('tb_draft',JSON.stringify(S.tpl))}catch(e){}}
$('#undo').onclick=()=>jump(-1);$('#redo').onclick=()=>jump(1);
/* ===== التفاعل مع المعاينة ===== */
function wirePreview(){
 const d=fdoc;let drag=null,moved=false;
 d.addEventListener('click',e=>{
  e.preventDefault();if(moved){moved=false;return}
  const b=e.target.closest('.b'),sec=e.target.closest('.sec');if(!sec)return;
  S.si=+sec.dataset.i;S.bi=b?+b.dataset.j:-1;S.view=b?'blk':'sec';S.tab='sec';openPanel();renderPanel();hilite();
 });
 d.addEventListener('pointerdown',e=>{const b=e.target.closest('.b.sel');if(!b)return;const blk=OBJ.blk();drag={x:e.clientX,y:e.clientY,dx:blk.dx||0,dy:blk.dy||0,b};moved=false;try{b.setPointerCapture(e.pointerId)}catch(_){}});
 d.addEventListener('pointermove',e=>{if(!drag)return;const ex=e.clientX-drag.x,ey=e.clientY-drag.y;if(!moved&&Math.abs(ex)+Math.abs(ey)<5)return;moved=true;const blk=OBJ.blk();blk.dx=Math.round(drag.dx+ex);blk.dy=Math.round(drag.dy+ey);drag.b.style.translate=blk.dx+'px '+blk.dy+'px'});
 d.addEventListener('pointerup',()=>{if(drag&&moved){changed(false);if(S.view==='blk')renderPanel()}drag=null;setTimeout(()=>{moved=false},50)});
}
/* ===== الألواح ===== */
function panelOpen(){return $('#panel').classList.contains('open')}
function openPanel(){if(innerWidth<900)$('#panel').classList.add('open');setBottom()}
function setBottom(){
 const active=(innerWidth<900&&!panelOpen())?'view':(S.tab==='view'?'sec':S.tab);
 document.querySelectorAll('#bottom button').forEach(b=>b.classList.toggle('on',b.dataset.tab===active));
 document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===(S.tab==='view'?'sec':S.tab)));
}
function goTab(t){
 if(t==='view'){S.tab='view';$('#panel').classList.remove('open');setBottom();return}
 S.tab=t;if(innerWidth<900)$('#panel').classList.add('open');renderPanel();
}
document.querySelectorAll('#bottom button,#tabs button').forEach(b=>b.onclick=()=>goTab(b.dataset.tab));
document.querySelectorAll('#devs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#devs button').forEach(x=>x.classList.toggle('on',x===b));$('#fw').className='frame-wrap '+b.dataset.dev});
$('#fw').className='frame-wrap m';
const optsH=(arr,v)=>arr.map(o=>`<option value="${esc(o[0])}"${String(o[0])===String(v)?' selected':''}>${esc(o[1])}</option>`).join('');
const FONTOPTS=FONTS.map(f=>[f[0],f[1]]);
function F(o,k,label,kind,opt,hint){
 const obj=OBJ[o]();const v=obj[k];const at=`data-o="${o}" data-k="${k}"`;let c='';
 if(kind==='t')c=`<input ${at} value="${esc(v)}">`;
 else if(kind==='a')c=`<textarea ${at}>${esc(v)}</textarea>`;
 else if(kind==='n')return `<div class="fld"><label>${label}: <b class="rv">${v}</b></label><input type="range" ${at} min="${opt[0]}" max="${opt[1]}" step="${opt[2]||1}" value="${v}"></div>`;
 else if(kind==='c')c=`<div class="crow"><input type="color" ${at} value="${/^#[0-9a-f]{6}$/i.test(v)?v:'#888888'}"><span>${v?esc(v):'الافتراضي'}</span>${v?`<button data-act="clr" data-o="${o}" data-k="${k}">رجّع الافتراضي</button>`:''}</div>`;
 else if(kind==='s')c=`<select ${at}>${optsH(opt,v)}</select>`;
 else if(kind==='f')c=`<select ${at}>${optsH((opt==='plain'?[]:[['','نفس خط الموقع']]).concat(FONTOPTS),v)}</select>`;
 else if(kind==='ck')return `<div class="fld"><label><input type="checkbox" ${at}${v?' checked':''}> ${label}</label></div>`;
 else if(kind==='img')c=`<input ${at} placeholder="رابط الصورة (اختياري)" value="${v&&v.startsWith('data:')?'':esc(v)}">${v?`<div class="sub" style="margin:6px 0 0">${v.startsWith('data:')?'✅ صورة مرفوعة من جهازك':'🔗 رابط'} <button data-act="clr" data-o="${o}" data-k="${k}" style="border:0;background:#f0f1f7;border-radius:8px;padding:4px 8px">شيلها</button></div>`:''}<button class="big alt" data-act="up-img" data-o="${o}" data-k="${k}" style="margin:6px 0 0">📷 ارفع صورة من الموبايل</button>`;
 return `<div class="fld"><label>${label}</label>${c}${hint?`<small>${hint}</small>`:''}</div>`;
}
const WOPT=[[100,'كامل العرض'],[66,'ثلثين'],[50,'نص العرض'],[33,'تلت العرض'],[25,'ربع العرض'],[0,'على قد المحتوى']];
const ALOPT=[['','زي القسم'],['start','بداية (يمين)'],['center','وسط'],['end','نهاية (شمال)']];
const ANIM=[['','بدون حركة'],['fade','ظهور تدريجي'],['up','طلوع من تحت'],['zoom','تكبير'],['slide','انزلاق'],['bounce','نط'],['pulse','نبض'],['float','طفو']];
const FL={
 heading:[['text','النص','a'],['size','حجم الخط','n',[14,110,1]],['wt','سمك الخط','s',[[400,'عادي'],[700,'عريض'],[900,'عريض جداً']]],['color','لون النص','c'],['font','نوع الخط','f']],
 text:[['text','النص','a'],['size','حجم الخط','n',[12,32,1]],['op','الشفافية','n',[30,100,5]],['color','لون النص','c']],
 button:[['label','كلمة الزرار','t'],['link','الرابط (https://... أو #contact أو tel:010...)','t'],['icon','إيموجي قبل الكلمة (اختياري)','t'],['kind','شكل الزرار','s',[['fill','ممتلئ'],['outline','إطار بس'],['ghost','شفاف خفيف'],['link','نص عادي']]],['shape','الحواف','s',[['square','مربع'],['round','مدور'],['pill','كبسولة']]],['size','المقاس','s',[['s','صغير'],['m','وسط'],['l','كبير']]],['bg','لون الزرار','c'],['tc','لون الكتابة','c']],
 image:[['src','الصورة (لوجو أو صورة المدرس أو أي صورة)','img'],['imgw','عرض الصورة %','n',[10,100,1]],['h','الارتفاع (0 = تلقائي)','n',[0,600,10]],['fit','القص','s',[['cover','تملا المكان'],['contain','كاملة']]],['radius','تدوير الحواف','n',[0,200,2]],['shadow','ظل','ck']],
 art:[['kind','الرسمة','s',Object.entries(ART_NAMES)],['size','الحجم','n',[60,600,10]]],
 icon:[['emoji','الإيموجي / الرمز','t'],['size','الحجم','n',[20,120,2]],['shape','الخلفية','s',[['circle','دايرة'],['square','مربع مدور'],['none','من غير']]],['bg','لون الخلفية','c']],
 card:[['icon','أيقونة/إيموجي','t'],['title','العنوان','t'],['price','السعر (اختياري)','t'],['text','الوصف','a'],['lines','نقاط (كل سطر نقطة)','a'],['btn','كلمة الزرار (اختياري)','t'],['link','رابط الزرار','t'],['bg','لون الكارت','c'],['radius','تدوير الحواف (-1 افتراضي)','n',[-1,60,1]],['featured','كارت مميز (إطار)','ck'],['center','النص في النص','ck']],
 faq:[['q','السؤال','t'],['a','الإجابة','a']],
 stat:[['num','الرقم','t'],['label','الوصف','t']],
 shape:[['kind','النوع','s',[['line','خط'],['dots','نقط'],['wave','موجة']]],['color','اللون','c'],['h','السمك','n',[1,20,1]]],
 spacer:[['h','الارتفاع','n',[0,300,5]]],
 form:[['fields','الخانات (كل سطر خانة)','a'],['btn','كلمة الزرار','t'],['email','إيميلك (الرسالة تتبعت له)','t'],['thanks','رسالة الشكر','t']]
};
function blkLabel(b){const n=BNAME[b.t];const tx=b.text||b.title||b.label||b.q||b.num||b.emoji||(b.t==='art'?ART_NAMES[b.kind]:'')||'';return `<span>${n[1]}</span><span>${n[0]}${tx?' · '+esc(String(tx).slice(0,18)):''}</span>`}
function rowBtns(scope,i,n){return `<button data-act="mv" data-s="${scope}" data-i="${i}" data-d="-1" ${i==0?'disabled':''}>↑</button><button data-act="mv" data-s="${scope}" data-i="${i}" data-d="1" ${i==n-1?'disabled':''}>↓</button><button data-act="dup" data-s="${scope}" data-i="${i}">⧉</button><button class="del" data-act="del" data-s="${scope}" data-i="${i}">🗑</button>`}
function panelSec(){
 const T=S.tpl;let h='';
 if(S.view==='list'){
  h+=`<h3>أقسام الصفحة</h3><p class="sub">دوس على القسم عشان تعدله، أو دوس على أي حاجة في المعاينة.</p>`;
  T.sections.forEach((s,i)=>{h+=`<div class="row ${i==S.si?'sel':''}"><div class="nm" data-act="open" data-i="${i}">${esc(s.name)}</div>${rowBtns('s',i,T.sections.length)}</div>`});
  h+=`<button class="big" data-act="addsec">➕ زوّد قسم</button>`;
 }else if(S.view==='sec'){
  const s=T.sections[S.si];if(!s){S.view='list';return panelSec()}
  h+=`<button class="back" data-act="back">← كل الأقسام</button><h3>🧱 ${esc(s.name)}</h3>`;
  h+=`<div class="grp"><b>العناصر اللي جوه القسم</b>`;
  s.blocks.forEach((b,j)=>{h+=`<div class="row ${j==S.bi?'sel':''}"><div class="nm" data-act="openb" data-i="${j}">${blkLabel(b)}</div>${rowBtns('b',j,s.blocks.length)}</div>`});
  h+=`<button class="big" data-act="addblk">➕ زوّد عنصر (زرار، صورة، نص...)</button></div>`;
  h+=`<div class="grp"><b>شكل القسم</b>${F('sec','name','اسم القسم (ليك بس)','t')}${F('sec','lay','تقسيم القسم','s',[['','عادي (العناصر ورا بعض)'],['split','عمودين (نص + صورة)']])}${F('st','al','محاذاة العناصر','s',[['start','بداية (يمين)'],['center','وسط'],['end','نهاية (شمال)'],['between','موزعة على العرض (للشريط العلوي)']])}`;
  const bgv=s.st.bg;h+=`<div class="fld"><label>خلفية القسم</label><div class="pal">${[['','بدون'],['bg','خلفية'],['sf','سطح'],['p','أساسي'],['s','ثانوي'],['tx','غامق']].map(x=>`<button data-act="bgk" data-v="${x[0]}" style="${bgv===x[0]?'box-shadow:0 0 0 3px #5b4bdb;':''}background:${x[0]?'var(--k'+x[0]+')':'#fff'};font-size:11px;align-items:center;justify-content:center;color:${x[0]&&x[0]!=='bg'&&x[0]!=='sf'?'#fff':'#333'}">${x[1]}</button>`).join('')}</div></div>`;
  h+=F('st','bg','أو لون خاص','c')+F('st','tx','لون الكلام في القسم','c')+F('st','pad','المسافة فوق وتحت','n',[0,200,5])+F('st','minh','أقل ارتفاع للقسم','n',[0,900,10])
   +F('st','deco','زخرفة الخلفية','s',[['','بدون'],['dots','نقط'],['grid','شبكة'],['stripes','خطوط مائلة'],['bubbles','فقاعات ملونة'],['glow','توهج']])
   +F('st','clip','شكل حافة القسم','s',[['','مستقيمة'],['curve','منحنية تحت'],['slant','مائلة'],['arch','قوس فوق']])
   +F('st','bgimg','صورة خلفية','img')+(s.st.bgimg?F('st','ov','تعتيم فوق الصورة','n',[0,90,5]):'')+`</div>`;
 }else{
  const s=T.sections[S.si],b=s&&s.blocks[S.bi];if(!b){S.view='sec';return panelSec()}
  h+=`<button class="back" data-act="back">← ${esc(s.name)}</button><h3>${BNAME[b.t][1]} ${BNAME[b.t][0]}</h3>`;
  h+=`<div class="grp"><b>المحتوى والشكل</b>${FL[b.t].map(f=>F('blk',f[0],f[1],f[2],f[3])).join('')}</div>`;
  h+=`<div class="grp"><b>المكان والحركة</b><p class="sub">اسحب العنصر في المعاينة أو استخدم الأسهم.</p><div style="display:grid;grid-template-columns:repeat(3,56px);gap:6px;justify-content:center;margin-bottom:12px"><span></span><button class="big" data-act="nudge" data-x="0" data-y="-10" style="margin:0">⬆</button><span></span><button class="big" data-act="nudge" data-x="-10" data-y="0" style="margin:0">⬅</button><button class="big alt" data-act="nudge" data-x="0" data-y="0" style="margin:0;font-size:11px;padding:0">رجوع</button><button class="big" data-act="nudge" data-x="10" data-y="0" style="margin:0">➡</button><span></span><button class="big" data-act="nudge" data-x="0" data-y="10" style="margin:0">⬇</button><span></span></div>`;
  h+=F('blk','w','عرض العنصر','s',WOPT)+(s.lay==='split'?F('blk','c','العمود','s',[[1,'العمود الأول'],[2,'العمود التاني']]):'')+F('blk','al','محاذاة العنصر','s',ALOPT)+F('blk','dx','إزاحة يمين/شمال','n',[-300,300,2])+F('blk','dy','إزاحة فوق/تحت','n',[-300,300,2])+F('blk','mt','مسافة من فوق','n',[0,120,2])+F('blk','mb','مسافة من تحت','n',[0,120,2])+F('blk','anim','حركة العنصر','s',ANIM)+`</div>`;
  h+=`<div class="two"><button class="big alt" data-act="dup" data-s="b" data-i="${S.bi}">⧉ انسخ</button><button class="big rd" data-act="del" data-s="b" data-i="${S.bi}">🗑 امسح</button></div>`;
 }
 return h;
}
function panelDesign(){
 const T=S.tpl.theme;let h=`<h3>🎨 تصميم الموقع كله</h3><p class="sub">أي تغيير هنا بيتطبق على الصفحة كلها.</p>`;
 h+=`<div class="grp"><b>فاتح / غامق</b><div class="two"><button class="big alt" data-act="mode" data-m="light" style="margin:0">☀️ فاتح</button><button class="big alt" data-act="mode" data-m="dark" style="margin:0">🌙 غامق</button></div></div>`;
 h+=`<div class="grp"><b>ألوان جاهزة</b><div class="pal">${PALETTES.map((p,i)=>`<button data-act="pal" data-i="${i}" title="${p[0]}"><i style="background:${p[1]}"></i><i style="background:${p[2]}"></i><i style="background:${p[3]};border:1px solid #eee"></i><i style="background:${p[4]}"></i></button>`).join('')}</div></div>`;
 h+=`<div class="grp"><b>الألوان</b>${F('theme','p','اللون الأساسي (الأزرار والتمييز)','c')}${F('theme','s','اللون الثانوي','c')}${F('theme','bg','خلفية الصفحة','c')}${F('theme','sf','خلفية الكروت والأقسام','c')}${F('theme','tx','لون الكلام','c')}</div>`;
 h+=`<div class="grp"><b>الخطوط</b>${F('theme','hf','خط العناوين والأزرار','f','plain')}${F('theme','bf','خط الكلام','f','plain')}${F('theme','fs','حجم الكلام','n',[14,24,1])}<label class="sub"><input type="checkbox" data-o="theme" data-k="online" ${T.online?'checked':''}> حمّل الخطوط من النت (لو مفيش نت بيستخدم خط الجهاز)</label></div>`;
 h+=`<div class="grp"><b>الأشكال والمسافات</b>${F('theme','r','تدوير الحواف','n',[0,48,1])}${F('theme','sh','الظل','s',[['none','بدون'],['soft','خفيف'],['strong','قوي']])}${F('theme','gap','المسافة بين العناصر','n',[0,60,2])}${F('theme','width','عرض المحتوى','s',[[820,'ضيق'],[1100,'وسط'],[1300,'واسع']])}${F('theme','dir','اتجاه الصفحة','s',[['rtl','عربي (من اليمين)'],['ltr','English (من الشمال)']])}</div>`;
 return h;
}
function panelSound(){
 const sn=S.tpl.sounds;const cu=k=>sn.custom&&sn.custom[k]?'✅ ملف مرفوع. ':'';
 const so=[['none','بدون صوت'],['click','نقرة'],['pop','فقاعة'],['tick','تك'],['custom','ملف من عندي']];
 let h=`<h3>🎵 الأصوات</h3><p class="sub">بتشتغل في الصفحة بعد التصدير. كلها جاهزة من غير ملفات.</p>`;
 h+=`<div class="grp"><b>صوت الضغط على الأزرار</b>${F('snd','click','الصوت','s',so)}<div class="two"><button class="big alt" data-act="try" data-k="click" style="margin:0">▶ جرّب</button><button class="big alt" data-act="aud" data-k="click" style="margin:0">⬆ ارفع صوتك</button></div><small>${cu('click')}</small></div>`;
 h+=`<div class="grp"><b>صوت النجاح (بعد إرسال الفورم)</b>${F('snd','success','الصوت','s',[['none','بدون صوت'],['success','نجاح'],['chime','جرس'],['pop','فقاعة'],['custom','ملف من عندي']])}<div class="two"><button class="big alt" data-act="try" data-k="success" style="margin:0">▶ جرّب</button><button class="big alt" data-act="aud" data-k="success" style="margin:0">⬆ ارفع صوتك</button></div><small>${cu('success')}</small></div>`;
 h+=`<div class="grp"><b>موسيقى الخلفية</b>${F('snd','music','الموسيقى','s',[['none','بدون'],['calm','هادية'],['happy','مبهجة'],['soft','ناعمة'],['custom','ملف من عندي']])}<div class="two"><button class="big alt" data-act="tryM" style="margin:0">▶ جرّب</button><button class="big alt" data-act="aud" data-k="music" style="margin:0">⬆ ارفع موسيقاك</button></div><small>${cu('music')}الموسيقى بتشتغل لما الزائر يدوس زرار 🔊 في الصفحة (المتصفح مش بيسمح تشتغل لوحدها). الملفات المرفوعة بتزود حجم القالب.</small></div>`;
 return h;
}
function panelTpl(){
 let h=`<h3>📚 القوالب الجاهزة</h3><p class="sub">دوس على قالب عشان يتفتح (تقدر تتراجع بزرار ↶).</p><div class="tg">`;
 TEMPLATES.forEach((t,i)=>{h+=`<button class="tc" data-act="loadt" data-i="${i}"><div class="th"><iframe tabindex="-1" loading="lazy" srcdoc="${esc(pageDoc(normalize(t),false))}"></iframe></div><div class="tn">${esc(t.name)}<small>${esc(t.desc)}</small></div></button>`});
 return h+'</div>';
}
function savedList(){try{return JSON.parse(localStorage.getItem('tb_saved')||'[]')}catch(e){return[]}}
function panelSave(){
 const L=savedList();
 let h=`<h3>💾 حفظ وتصدير</h3><div class="grp"><b>اسم القالب</b>${F('tpl','name','','t')}<button class="big gr" data-act="save">💾 احفظ في قوالبي</button></div>`;
 h+=`<div class="grp"><b>قوالبي المحفوظة (${L.length})</b>${L.length?L.map((x,i)=>`<div class="saved"><div class="nm">${esc(x.name)}<small>${new Date(x.ts).toLocaleDateString('ar-EG')}</small></div><button data-act="ld" data-i="${i}">فتح</button><button data-act="dl" data-i="${i}">🗑</button></div>`).join(''):'<p class="sub">لسه مفيش قوالب محفوظة.</p>'}</div>`;
 h+=`<div class="grp"><b>صدّر قالبك للبيع أو الاستضافة</b><button class="big" data-act="xhtml">📄 نزّل صفحة HTML جاهزة</button><button class="big" data-act="xzip">🗜 نزّل ملف ZIP (الصفحة + ملف القالب)</button><button class="big alt" data-act="xjson">🧩 نزّل ملف القالب JSON (للمشاركة والبيع)</button><p class="sub">صفحة الـHTML شغالة لوحدها من غير سيرفر ويتفتح على أي استضافة.</p></div>`;
 h+=`<div class="grp"><b>استورد قالب</b><button class="big alt" data-act="imp">📥 اختار ملف JSON</button><div class="fld"><textarea id="paste" placeholder="أو الصق كود القالب هنا"></textarea></div><button class="big alt" data-act="imptxt">استورد من اللي لصقته</button></div>`;
 h+=`<div class="grp"><b>تصدير نسخة كاملة</b><button class="big alt" data-act="xall">🧺 نزّل كل قوالبي (JSON واحد)</button></div>`;
 return h;
}
function renderPanel(){
 const pb=$('#pbody');if(!S.tpl)return;const st=pb.scrollTop;
 const t=S.tab==='view'?'sec':S.tab;
 pb.innerHTML=t==='sec'?panelSec():t==='design'?panelDesign():t==='sound'?panelSound():t==='tpl'?panelTpl():panelSave();
 pb.scrollTop=st;setBottom();
 const kv={bg:S.tpl.theme.bg,sf:S.tpl.theme.sf,p:S.tpl.theme.p,s:S.tpl.theme.s,tx:S.tpl.theme.tx};for(const k in kv)pb.style.setProperty('--k'+k,kv[k]);
}
/* ===== أحداث اللوحة ===== */
const pbEl=$('#pbody');
pbEl.addEventListener('input',e=>{
 const el=e.target;if(!el.dataset||!el.dataset.k)return;const o=OBJ[el.dataset.o]();const k=el.dataset.k;
 let v=el.type==='checkbox'?(el.checked?1:0):el.value;
 if(typeof o[k]==='number'&&el.type!=='checkbox')v=num(v,o[k]);
 o[k]=v;const rv=el.parentNode.querySelector('.rv');if(rv)rv.textContent=v;
 if(el.type==='color'){const sp=el.parentNode.querySelector('span');if(sp)sp.textContent=v}
 changed(false);
 if(el.tagName==='SELECT'||el.type==='checkbox')renderPanel();
});
pbEl.addEventListener('change',e=>{const el=e.target;if(el.type==='color'||el.dataset.k==='name')renderPanel()});
function readImg(file,cb,max){
 const r=new FileReader();
 r.onload=()=>{if(/svg/.test(file.type)||file.size<40000){cb(r.result);return}
  const im=new Image();im.onload=()=>{const m=max||1200,sc=Math.min(1,m/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);cb(c.toDataURL(/png/.test(file.type)?'image/png':'image/jpeg',.85))};im.onerror=()=>toast('الصورة مش مفهومة');im.src=r.result};
 r.readAsDataURL(file);
}
function pickFile(accept,cb){const f=$('#fileIn');f.accept=accept;f.value='';f.onchange=()=>{if(f.files[0])cb(f.files[0])};f.click()}
function dl(name,data,type){const b=data instanceof Blob?data:new Blob([data],{type:type||'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(a.href)},1500)}
const slug=s=>(s||'template').replace(/[^\w\u0600-\u06FF]+/g,'-').replace(/^-|-$/g,'')||'template';
function crc32(u){let c,t=crc32.t;if(!t){t=crc32.t=[];for(let n=0;n<256;n++){c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}}let r=-1;for(let i=0;i<u.length;i++)r=t[(r^u[i])&255]^(r>>>8);return(r^-1)>>>0}
function makeZip(files){
 const enc=new TextEncoder();let parts=[],cd=[],off=0,cs=0;
 files.forEach(f=>{const n=enc.encode(f.name),d=enc.encode(f.data),crc=crc32(d);
  const lh=new DataView(new ArrayBuffer(30));lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x800,true);lh.setUint32(14,crc,true);lh.setUint32(18,d.length,true);lh.setUint32(22,d.length,true);lh.setUint16(26,n.length,true);
  parts.push(lh.buffer,n,d);
  const ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x800,true);ch.setUint32(16,crc,true);ch.setUint32(20,d.length,true);ch.setUint32(24,d.length,true);ch.setUint16(28,n.length,true);ch.setUint32(42,off,true);
  cd.push(ch.buffer,n);cs+=46+n.length;off+=30+n.length+d.length});
 const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);
 return new Blob([...parts,...cd,e.buffer],{type:'application/zip'});
}
function saveCur(){
 const L=savedList();
 if(!S.tpl.id||S.tpl.id==='x'||TEMPLATES.some(t=>t.id===S.tpl.id))S.tpl.id='my'+uid();
 const rec={id:S.tpl.id,name:S.tpl.name,ts:Date.now(),data:clone(S.tpl)};
 const k=L.findIndex(x=>x.id===rec.id);if(k>=0)L[k]=rec;else L.unshift(rec);
 try{localStorage.setItem('tb_saved',JSON.stringify(L));toast('اتحفظ في قوالبي ✅');if(S.tab==='save')renderPanel()}catch(e){toast('المساحة مليانة. صدّر القالب كملف JSON')}
}
function importObj(o){
 try{if(o&&o.templates&&Array.isArray(o.templates)){const L=savedList();o.templates.forEach(t=>{t=normalize(t.data||t);t.id='my'+uid();L.unshift({id:t.id,name:t.name,ts:Date.now(),data:t})});localStorage.setItem('tb_saved',JSON.stringify(L));toast('اتستورد '+o.templates.length+' قالب في قوالبي');renderPanel();return}
 o=o.data&&o.data.sections?o.data:o;if(!o||!Array.isArray(o.sections))throw 0;const t=normalize(o);t.id='x';setTpl(t);changed(false);goTab('view');toast('اتفتح القالب ✅')}catch(e){toast('الملف ده مش قالب صالح')}
}
pbEl.addEventListener('click',e=>{
 const el=e.target.closest('[data-act]');if(!el)return;const a=el.dataset.act,T=S.tpl;const i=+el.dataset.i;
 const arr=el.dataset.s==='s'?T.sections:(T.sections[S.si]||{}).blocks;
 if(a==='open'){S.si=i;S.bi=-1;S.view='sec';renderPanel();hilite();scrollToSel()}
 else if(a==='openb'){S.bi=i;S.view='blk';renderPanel();hilite();scrollToSel()}
 else if(a==='back'){if(S.view==='blk'){S.view='sec';S.bi=-1}else{S.view='list';S.si=-1;S.bi=-1}renderPanel();hilite()}
 else if(a==='mv'){const d=+el.dataset.d,j=i+d;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];if(el.dataset.s==='s'){if(S.si===i)S.si=j;else if(S.si===j)S.si=i}else{if(S.bi===i)S.bi=j;else if(S.bi===j)S.bi=i}changed(true)}
 else if(a==='dup'){const c=clone(arr[i]);c.id=uid();arr.splice(i+1,0,c);if(el.dataset.s==='b'&&S.view==='blk')S.bi=i+1;changed(true);toast('اتنسخ')}
 else if(a==='del'){if(!confirm('تمسح العنصر ده؟ (تقدر تتراجع بزرار ↶)'))return;arr.splice(i,1);if(el.dataset.s==='s'){S.si=-1;S.bi=-1;S.view='list'}else{S.bi=-1;S.view='sec'}changed(true)}
 else if(a==='addsec')showSheet('sec');
 else if(a==='addblk')showSheet('blk');
 else if(a==='clr'){const o=OBJ[el.dataset.o]();o[el.dataset.k]='';changed(true)}
 else if(a==='bgk'){T.sections[S.si].st.bg=el.dataset.v;changed(true)}
 else if(a==='nudge'){const b=OBJ.blk();const x=+el.dataset.x,y=+el.dataset.y;if(!x&&!y){b.dx=0;b.dy=0}else{b.dx=(b.dx||0)+x;b.dy=(b.dy||0)+y}changed(true)}
 else if(a==='up-img'){const o=OBJ[el.dataset.o](),k=el.dataset.k;pickFile('image/*',f=>readImg(f,d=>{o[k]=d;changed(true);toast('اترفعت الصورة ✅')}))}
 else if(a==='mode'){const dk=el.dataset.m==='dark';Object.assign(T.theme,dk?{bg:'#12131a',sf:'#1d1f2b',tx:'#eceef7'}:{bg:'#ffffff',sf:'#f4f5fa',tx:'#1f2335'});changed(true)}
 else if(a==='pal'){const p=PALETTES[i];Object.assign(T.theme,{p:p[1],s:p[2],bg:p[3],sf:p[4],tx:p[5]});changed(true)}
 else if(a==='try'){const k=el.dataset.k;SND.play(T.sounds[k],T.sounds.custom[k])}
 else if(a==='tryM'){if(!SND.on){SND.on=1;SND.music(T.sounds.music,true,T.sounds.custom.music);toast('الموسيقى شغالة. دوس تاني لإيقافها')}else{SND.on=0;SND.music('none',false)}}
 else if(a==='aud'){const k=el.dataset.k;pickFile('audio/*',f=>{if(f.size>2500000&&!confirm('الملف كبير وهيكبر حجم القالب. تكمل؟'))return;const r=new FileReader();r.onload=()=>{T.sounds.custom[k]=r.result;T.sounds[k]='custom';changed(true);toast('اترفع الصوت ✅')};r.readAsDataURL(f)})}
 else if(a==='loadt'){if(confirm('هتفتح قالب "'+TEMPLATES[i].name+'" بدل الحالي؟ (تقدر تتراجع بـ ↶)')){clearTimeout(histT);const cur=JSON.stringify(S.tpl);if(cur!==hist[hi]){hist=hist.slice(0,hi+1);hist.push(cur);hi=hist.length-1}const t=normalize(TEMPLATES[i]);S.tpl=t;S.si=-1;S.bi=-1;S.view='list';hist.push(JSON.stringify(t));hi=hist.length-1;ready=false;frame.srcdoc=pageDoc(S.tpl,true);try{localStorage.setItem('tb_draft',JSON.stringify(S.tpl))}catch(_){}updUndo();goTab('view');toast('اتفتح: '+t.name)}}
 else if(a==='save')saveCur();
 else if(a==='ld'){const x=savedList()[i];if(x){const t=normalize(x.data);t.id=x.id;setTpl(t);changed(false);goTab('view');toast('اتفتح: '+x.name)}}
 else if(a==='dl'){if(!confirm('تمسح القالب المحفوظ ده؟'))return;const L=savedList();L.splice(i,1);localStorage.setItem('tb_saved',JSON.stringify(L));renderPanel()}
 else if(a==='xhtml'){dl(slug(T.name)+'.html',exportHtml(T),'text/html');toast('نزل ملف HTML')}
 else if(a==='xjson'){dl(slug(T.name)+'.template.json',JSON.stringify(T,null,1),'application/json');toast('نزل ملف القالب')}
 else if(a==='xzip'){dl(slug(T.name)+'.zip',makeZip([{name:'index.html',data:exportHtml(T)},{name:'template.json',data:JSON.stringify(T,null,1)},{name:'README.txt',data:'افتح index.html في أي متصفح، أو ارفع الملف على أي استضافة (GitHub Pages, Netlify...).\ntemplate.json تقدر تستورده في صانع القوالب.'}]));toast('نزل ملف ZIP')}
 else if(a==='xall'){dl('my-templates.json',JSON.stringify({templates:savedList().map(x=>x.data)}),'application/json')}
 else if(a==='imp'){pickFile('.json,application/json',f=>{const r=new FileReader();r.onload=()=>{try{importObj(JSON.parse(r.result))}catch(e){toast('الملف ده مش قالب صالح')}};r.readAsText(f)})}
 else if(a==='imptxt'){try{importObj(JSON.parse($('#paste').value))}catch(e){toast('الكود ده مش صالح')}}
});
function showSheet(kind){
 const m=$('#modal'),sh=$('#sheet');
 if(kind==='sec')sh.innerHTML=`<h3>اختار نوع القسم</h3><div class="types">${Object.entries(PRESETS).map(([k,v])=>`<button data-add="${k}"><i>${v[1]}</i>${v[0]}</button>`).join('')}</div>`;
 else sh.innerHTML=`<h3>اختار العنصر</h3><div class="types">${Object.entries(BNAME).map(([k,v])=>`<button data-addb="${k}"><i>${v[1]}</i>${v[0]}</button>`).join('')}</div>`;
 sh.innerHTML+=`<button class="big alt" data-close="1" style="margin-top:12px">إلغاء</button>`;m.hidden=false;
}
$('#modal').addEventListener('click',e=>{
 const m=$('#modal');if(e.target===m||e.target.dataset.close){m.hidden=true;return}
 const a=e.target.closest('[data-add]'),b=e.target.closest('[data-addb]');
 if(a){const s=PRESETS[a.dataset.add][2]();const at=S.si>=0?S.si+1:S.tpl.sections.length;S.tpl.sections.splice(at,0,s);S.si=at;S.bi=-1;S.view='sec';m.hidden=true;changed(true);hilite();scrollToSel()}
 if(b){const blk=B(b.dataset.addb);if(blk.t==='card')blk.w=33;if(blk.t==='stat')blk.w=25;if(['button','art','icon'].includes(blk.t))blk.w=0;S.tpl.sections[S.si].blocks.push(blk);S.bi=S.tpl.sections[S.si].blocks.length-1;S.view='blk';m.hidden=true;changed(true);hilite();scrollToSel()}
});
$('#quickSave').onclick=saveCur;
/* ===== تشغيل ===== */
(function init(){
 const q=new URLSearchParams(location.search);let t=null;
 if(q.get('t'))t=TEMPLATES.find(x=>x.id===q.get('t'));
 if(!t){try{t=JSON.parse(localStorage.getItem('tb_draft')||'null')}catch(e){}}
 if(!t||!t.sections)t=TEMPLATES[0];
 setTpl(t);
 if(q.get('tab')){S.tab=q.get('tab');if(innerWidth<900)$('#panel').classList.add('open');renderPanel()}
 if(q.get('sel')){const p=q.get('sel').split('.');S.si=+p[0];S.bi=p[1]!=null?+p[1]:-1;S.view=S.bi>=0?'blk':'sec';S.tab='sec';if(innerWidth<900)$('#panel').classList.add('open');renderPanel()}
 setBottom();
 if(!localStorage.getItem('tb_seen')){localStorage.setItem('tb_seen','1');setTimeout(()=>toast('دوس على أي عنصر في المعاينة عشان تعدله 👆'),800)}
})();
