/* إضافات: ستايلات، خطوط، رسومات، حركات، وقوالب جديدة */
FONTS.push(
 ['lemonada','ليمونادا (مرح)',"Lemonada","Lemonada:wght@400;700"],
 ['marhey','مرحي (أطفال)',"Marhey","Marhey:wght@400;700"],
 ['rakkas','رقاص (للعناوين)',"Rakkas","Rakkas"],
 ['kufam','كوفام (عريض)',"Kufam","Kufam:wght@400;700;900"],
 ['vazir','وزير (Vazirmatn)',"Vazirmatn","Vazirmatn:wght@400;700;900"],
 ['playpen','بلاي بن (بخط اليد)',"'Playpen Sans Arabic'","Playpen+Sans+Arabic:wght@400;700"],
 ['alex','الإسكندرية (Alexandria)',"Alexandria","Alexandria:wght@400;700;900"],
 ['zain','زين (Zain)',"Zain","Zain:wght@400;700;900"],
 ['handjet','هاندجيت (بكسل)',"Handjet","Handjet:wght@400;700"],
 ['qahiri','قاهري (Qahiri)',"Qahiri","Qahiri"],
 ['ruwudu','روودو (Ruwudu)',"Ruwudu","Ruwudu:wght@400;700"],
 ['gulzar','غلزار (نستعليق)',"Gulzar","Gulzar"],
 ['fustat','فسطاط (Fustat)',"Fustat","Fustat:wght@400;700;800"],
 ['nsa','نوتو سانس عربي',"'Noto Sans Arabic'","Noto+Sans+Arabic:wght@400;700;900"],
 ['reemfun','ريم كوفي فن',"'Reem Kufi Fun'","Reem+Kufi+Fun:wght@400;700"],
 ['cairoplay','القاهرة بلاي',"'Cairo Play'","Cairo+Play:wght@400;700;900"],
 ['mirza','ميرزا (Mirza)',"Mirza","Mirza:wght@400;700"],
 ['scheh','شهرزاد (Scheherazade)',"'Scheherazade New'","Scheherazade+New:wght@400;700"],
 ['lateef','لطيف (Lateef)',"Lateef","Lateef"],
 ['jomhuria','جمهورية (عناوين ضخمة)',"Jomhuria","Jomhuria"],
 ['ruqaaink','رقعة حبر (Aref Ruqaa Ink)',"'Aref Ruqaa Ink'","Aref+Ruqaa+Ink:wght@400;700"]
);
(function(){
 const star=(n,r1,r2)=>{let p=[];for(let i=0;i<n*2;i++){const a=Math.PI*i/n-Math.PI/2,r=i%2?r2:r1;p.push((100+r*Math.cos(a)).toFixed(1)+','+(100+r*Math.sin(a)).toFixed(1))}return p.join(' ')};
 Object.assign(ART,{
 burst:`<svg viewBox="0 0 200 200"><polygon points="${star(14,92,66)}" fill="var(--s)"/><polygon points="${star(14,72,50)}" fill="var(--p)"/></svg>`,
 smiley:`<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="var(--s)"/><circle cx="72" cy="85" r="10" fill="#222"/><circle cx="128" cy="85" r="10" fill="#222"/><path d="M60 118Q100 165 140 118" stroke="#222" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="52" cy="112" r="10" fill="var(--p)" opacity=".5"/><circle cx="148" cy="112" r="10" fill="var(--p)" opacity=".5"/></svg>`,
 flower:`<svg viewBox="0 0 200 200">${[0,60,120,180,240,300].map(a=>`<ellipse cx="100" cy="52" rx="24" ry="40" fill="var(--p)" opacity=".85" transform="rotate(${a} 100 100)"/>`).join('')}<circle cx="100" cy="100" r="24" fill="var(--s)"/></svg>`,
 cloud:`<svg viewBox="0 0 200 200"><path d="M55 140a32 32 0 0 1 2-64 44 44 0 0 1 84-8 36 36 0 0 1 4 72z" fill="var(--sf)" stroke="var(--p)" stroke-width="6" stroke-linejoin="round"/><circle cx="80" cy="112" r="5" fill="var(--p)"/><circle cx="120" cy="112" r="5" fill="var(--p)"/></svg>`,
 heart:`<svg viewBox="0 0 200 200"><path d="M100 170C30 120 20 70 55 48c22-13 42-2 45 18 3-20 23-31 45-18 35 22 25 72-45 122z" fill="var(--p)"/><path d="M60 62c8-6 18-6 24 2" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".6"/></svg>`,
 sparkle:`<svg viewBox="0 0 200 200"><path d="M100 10C108 70 130 92 190 100 130 108 108 130 100 190 92 130 70 108 10 100 70 92 92 70 100 10z" fill="var(--p)"/><path d="M160 20c3 18 9 24 24 27-15 3-21 9-24 27-3-18-9-24-24-27 15-3 21-9 24-27z" fill="var(--s)"/></svg>`,
 squiggle:`<svg viewBox="0 0 200 200"><path d="M15 60q20-30 35 0t35 0 35 0 35 0M15 100q20-30 35 0t35 0 35 0 35 0M15 140q20-30 35 0t35 0 35 0 35 0" stroke="var(--p)" stroke-width="9" fill="none" stroke-linecap="round"/></svg>`,
 geo:`<svg viewBox="0 0 200 200"><rect x="38" y="38" width="124" height="124" fill="var(--p)"/><rect x="38" y="38" width="124" height="124" fill="var(--s)" transform="rotate(45 100 100)"/><circle cx="100" cy="100" r="36" fill="var(--bg)"/><polygon points="${star(8,30,14)}" fill="var(--p)"/></svg>`,
 lantern:`<svg viewBox="0 0 200 200"><path d="M100 8v26" stroke="var(--p)" stroke-width="6"/><path d="M78 40h44l-6-8H84z" fill="var(--p)"/><path d="M80 40C48 70 48 130 80 160h40c32-30 32-90 0-120z" fill="var(--s)"/><path d="M100 40v120M80 40C66 80 66 120 80 160M120 40c14 40 14 80 0 120" stroke="var(--p)" stroke-width="4" fill="none"/><rect x="76" y="160" width="48" height="12" rx="3" fill="var(--p)"/><circle cx="100" cy="100" r="14" fill="#fff" opacity=".7"/></svg>`,
 crescent:`<svg viewBox="0 0 200 200"><path d="M130 24a78 78 0 1 0 0 152 62 62 0 1 1 0-152z" fill="var(--p)"/><polygon points="${star(5,26,11).split(' ').map(q=>{const [x,y]=q.split(',');return (+x+45).toFixed(1)+','+(+y-5).toFixed(1)}).join(' ')}" fill="var(--s)"/></svg>`,
 trophy:`<svg viewBox="0 0 200 200"><path d="M60 30h80v50c0 28-18 44-40 44S60 108 60 80z" fill="var(--s)"/><path d="M60 42H34c0 30 10 42 28 46M140 42h26c0 30-10 42-28 46" stroke="var(--s)" stroke-width="9" fill="none"/><rect x="92" y="122" width="16" height="30" fill="var(--p)"/><rect x="66" y="150" width="68" height="16" rx="5" fill="var(--p)"/><polygon points="${star(5,18,8).split(' ').map(q=>{const [x,y]=q.split(',');return (+x).toFixed(1)+','+(+y-22).toFixed(1)}).join(' ')}" fill="#fff"/></svg>`,
 pencil:`<svg viewBox="0 0 200 200"><g transform="rotate(-40 100 100)"><rect x="76" y="14" width="48" height="136" rx="6" fill="var(--s)"/><rect x="76" y="14" width="48" height="26" rx="6" fill="var(--p)"/><polygon points="76,150 124,150 100,190" fill="#f6d8b0"/><polygon points="92,172 108,172 100,190" fill="#333"/></g></svg>`,
 palette:`<svg viewBox="0 0 200 200"><path d="M100 22c-44 0-78 32-78 74 0 44 38 70 62 70 20 0 18-16 8-24-12-10-4-26 12-26h30c24 0 44-12 44-34 0-34-34-60-78-60z" fill="var(--sf)" stroke="var(--p)" stroke-width="7"/><circle cx="62" cy="86" r="12" fill="var(--p)"/><circle cx="96" cy="60" r="12" fill="var(--s)"/><circle cx="136" cy="76" r="12" fill="#2dbd6e"/><circle cx="60" cy="122" r="12" fill="#ff6b6b"/></svg>`,
 diamond:`<svg viewBox="0 0 200 200"><polygon points="60,50 140,50 180,90 100,170 20,90" fill="var(--p)"/><polygon points="60,50 100,90 20,90" fill="var(--s)" opacity=".7"/><polygon points="140,50 100,90 180,90" fill="#fff" opacity=".25"/><polygon points="60,50 100,50 100,90" fill="#fff" opacity=".3"/></svg>`
 });
 Object.assign(ART_NAMES,{burst:'انفجار نجمي',smiley:'وش مبتسم',flower:'وردة',cloud:'سحابة',heart:'قلب',sparkle:'لمعة',squiggle:'خطوط متموجة',geo:'نجمة إسلامية',lantern:'فانوس',crescent:'هلال ونجمة',trophy:'كأس',pencil:'قلم',palette:'لوحة ألوان',diamond:'ماسة'});
})();
const EXTRA={
 anim:[['wiggle','رقص خفيف'],['flip','قلب'],['glow','توهج'],['shake','اهتزاز'],['spin','لف'],['swing','تأرجح'],['rubber','مطاط'],['blur','ظهور من ضباب'],['drop','نزول']],
 deco:[['confetti','كونفيتي ملون'],['waves','موجات'],['checker','شطرنج'],['sunburst','أشعة'],['zigzag','زجزاج'],['geo','هندسي إسلامي'],['aurora','شفق ملون']],
 clip:[['wave','موجة تحت'],['zigzag','زجزاج تحت'],['blob','منحنى غير منتظم'],['round','تدوير تحت'],['pill','كبسولة كبيرة']],
 looks:[['','عادي (الافتراضي)'],['brutal','بروتاليست (حدود سميكة وظل صلب)'],['glass','زجاجي شفاف'],['clay','طين ناعم (3D)'],['neon','نيون مضيء'],['outline','إطارات خفيفة'],['doodle','رسم باليد'],['editorial','مجلة بسيطة'],['gold','فخامة ذهبي'],['y2k','ريترو Y2K'],['pop','مرح للأطفال'],['heritage','تراث عربي'],['magazine','جريدة']],
 bgfx:[['','سادة'],['mesh','ميش متدرج'],['grad','تدرج كامل'],['sunset','غروب ناعم'],['grid','شبكة'],['dots','نقط'],['paper','ورق']]
};
(function(){
 const L=(name,sel,css)=>sel.split(',').map(s=>`html[data-look=${name}] ${s}`).join(',')+`{${css}}`;
 const C='.card,.faq,.frm input,.frm textarea,.imgb img,.ph',CB='.card,.faq';
 const cm=(c,p)=>`color-mix(in srgb,${c} ${p}%,transparent)`;
 let zz='';{let p=['0 0','100% 0','100% 94%'];for(let i=0;i<20;i++)p.push((100-(i+1)*5)+'% '+(i%2?'94%':'100%'));zz=`polygon(${p.join(',')})`}
 const wave=`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='M0 0H100V88Q87 100 75 88T50 88T25 88T0 88Z'/%3E%3C/svg%3E")`;
 window.LOOKCSS=`
html[data-bg=mesh] body{background:radial-gradient(at 12% 8%,${cm('var(--p)',60)},transparent 50%),radial-gradient(at 88% 18%,${cm('var(--s)',60)},transparent 50%),radial-gradient(at 50% 95%,color-mix(in srgb,var(--p) 40%,var(--s)),transparent 55%),var(--bg) fixed}
html[data-bg=grad] body{background:linear-gradient(135deg,var(--p),var(--s)) fixed}
html[data-bg=sunset] body{background:linear-gradient(180deg,var(--bg),color-mix(in srgb,var(--p) 22%,var(--bg)) 55%,color-mix(in srgb,var(--s) 38%,var(--bg)))}
html[data-bg=grid] body{background-image:linear-gradient(rgba(128,128,128,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(128,128,128,.2) 1px,transparent 1px);background-size:32px 32px}
html[data-bg=dots] body{background-image:radial-gradient(rgba(128,128,128,.38) 1.6px,transparent 2.2px);background-size:22px 22px}
html[data-bg=paper] body{background-image:repeating-linear-gradient(0deg,rgba(0,0,0,.03) 0 2px,transparent 2px 4px)}
.d-confetti{background-image:radial-gradient(var(--p) 4px,transparent 5px),radial-gradient(var(--s) 4px,transparent 5px),radial-gradient(#ff8fb1 4px,transparent 5px),radial-gradient(#5ad1ff 3px,transparent 4px);background-size:90px 90px,130px 130px,170px 170px,110px 110px;background-position:0 0,40px 60px,80px 20px,20px 80px}
.d-waves{background-image:repeating-radial-gradient(circle at 0 100%,transparent 0 18px,rgba(128,128,128,.14) 19px 21px)}
.d-checker{background:repeating-conic-gradient(rgba(128,128,128,.12) 0 25%,transparent 0 50%) 0 0/52px 52px}
.d-sunburst{background-image:repeating-conic-gradient(from 0deg at 50% 100%,${cm('var(--p)',22)} 0 7deg,transparent 7deg 14deg)}
.d-zigzag{background:linear-gradient(135deg,rgba(128,128,128,.16) 25%,transparent 25%) -20px 0/40px 40px,linear-gradient(225deg,rgba(128,128,128,.16) 25%,transparent 25%) -20px 0/40px 40px}
.d-geo{background-image:repeating-linear-gradient(45deg,rgba(128,128,128,.16) 0 2px,transparent 2px 26px),repeating-linear-gradient(-45deg,rgba(128,128,128,.16) 0 2px,transparent 2px 26px)}
.d-aurora{background-image:radial-gradient(ellipse at 20% 10%,${cm('var(--p)',45)},transparent 55%),radial-gradient(ellipse at 80% 0,${cm('var(--s)',45)},transparent 55%),radial-gradient(ellipse at 50% 100%,${cm('#7b61ff',35)},transparent 60%)}
.c-wave{-webkit-mask:${wave} 0 0/100% 100% no-repeat;mask:${wave} 0 0/100% 100% no-repeat;padding-bottom:calc(var(--spad,70px) + 30px)}
.c-zigzag{clip-path:${zz};padding-bottom:calc(var(--spad,70px) + 14px)}
.c-blob{border-radius:0 0 62% 38%/0 0 90px 140px}.c-round{border-radius:0 0 60px 60px}.c-pill{border-radius:90px;margin:12px}
@keyframes wiggle{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}@keyframes flip{from{opacity:0;transform:perspective(600px) rotateY(90deg)}to{opacity:1;transform:none}}
@keyframes glow{0%,100%{filter:drop-shadow(0 0 0 transparent)}50%{filter:drop-shadow(0 0 14px var(--p))}}@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-7px)}40%,80%{transform:translateX(7px)}}
@keyframes spin{to{transform:rotate(360deg)}}@keyframes swing{0%,100%{transform:rotate(7deg)}50%{transform:rotate(-7deg)}}
@keyframes rubber{0%{transform:scale(.6)}40%{transform:scale(1.15,.85)}60%{transform:scale(.92,1.08)}100%{transform:scale(1)}}
@keyframes blurin{from{opacity:0;filter:blur(18px)}to{opacity:1;filter:none}}@keyframes drop{from{opacity:0;transform:translateY(-50px)}to{opacity:1;transform:none}}
.a-wiggle{animation:wiggle 1.2s ease-in-out infinite}.a-flip{animation:flip .9s both}.a-glow{animation:glow 2s infinite}.a-shake{animation:shake 1.4s infinite}.a-spin{animation:spin 8s linear infinite}.a-swing{animation:swing 3s ease-in-out infinite;transform-origin:top center}.a-rubber{animation:rubber .9s both}.a-blur{animation:blurin 1.2s both}.a-drop{animation:drop .8s both}
${L('brutal',C,'border:3px solid #111;box-shadow:6px 6px 0 #111;border-radius:0')}
${L('brutal','.btn','border:3px solid #111;box-shadow:4px 4px 0 #111;border-radius:0;color:var(--bt,#111)')}
${L('brutal','.btn:hover','transform:translate(-2px,-2px);box-shadow:7px 7px 0 #111')}${L('brutal','.card.ft','transform:rotate(-1.5deg)')}
${L('glass',C,'background:rgba(255,255,255,.16);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.45);box-shadow:0 8px 32px rgba(0,0,0,.16)')}
${L('glass','.frm input,.frm textarea','color:inherit')}${L('glass','.btn','backdrop-filter:blur(10px);box-shadow:0 6px 20px rgba(0,0,0,.18)')}
${L('clay',CB+',.frm input,.frm textarea','border:0;border-radius:max(var(--r),26px);box-shadow:12px 12px 26px rgba(0,0,0,.13),-10px -10px 22px rgba(255,255,255,.9),inset 2px 2px 6px rgba(255,255,255,.7)')}
${L('clay','.btn','border:0;box-shadow:7px 7px 16px rgba(0,0,0,.2),-5px -5px 12px rgba(255,255,255,.7),inset 2px 2px 4px rgba(255,255,255,.35)')}${L('clay','.imgb img,.ph','box-shadow:12px 12px 26px rgba(0,0,0,.15),-8px -8px 20px rgba(255,255,255,.8)')}
${L('neon',CB+',.frm input,.frm textarea','background:rgba(255,255,255,.04);border:1px solid var(--p);box-shadow:0 0 18px '+cm('var(--p)',55)+',inset 0 0 14px '+cm('var(--p)',18)+';color:var(--tx)')}
${L('neon','.hd','text-shadow:0 0 16px '+cm('var(--p)',75))}${L('neon','.btn','box-shadow:0 0 22px '+cm('var(--bb,var(--p))',70))}${L('neon','.frm input,.frm textarea','color:var(--tx)')}
${L('outline',CB+',.frm input,.frm textarea','background:transparent;border:2px solid currentColor;box-shadow:none')}${L('outline','.btn','box-shadow:none')}
${L('doodle',CB,'border:2.5px dashed var(--tx);border-radius:255px 18px 225px 18px/18px 225px 18px 255px;box-shadow:none;background:var(--sf)')}
${L('doodle','.b:nth-child(odd) .card','transform:rotate(1.2deg)')}${L('doodle','.b:nth-child(even) .card','transform:rotate(-1.2deg)')}
${L('doodle','.btn','border:2.5px solid var(--tx);box-shadow:3px 3px 0 var(--tx);border-radius:255px 14px 225px 14px/14px 225px 14px 255px;color:var(--bt,var(--tx))')}${L('doodle','.frm input,.frm textarea','border:2px dashed var(--tx)')}
${L('editorial',CB,'background:transparent;border:0;border-top:1px solid currentColor;border-radius:0;box-shadow:none;padding:18px 0;color:inherit')}
${L('editorial','.btn','border-radius:0;box-shadow:none;letter-spacing:.5px')}${L('editorial','.imgb img,.ph,.frm input,.frm textarea','border-radius:0;box-shadow:none')}${L('editorial','.hd','font-weight:700')}
${L('gold',CB,'background:'+cm('var(--p)',7)+';border:1px solid var(--p);border-radius:2px;box-shadow:none')}${L('gold','.btn','border-radius:0;letter-spacing:1px')}${L('gold','.imgb img,.ph','border:1px solid var(--p);border-radius:2px;box-shadow:none')}${L('gold','.hd','letter-spacing:1px')}
${L('y2k',C,'border:3px solid #222;box-shadow:5px 5px 0 var(--s);border-radius:18px')}
${L('y2k','.btn','border:2px solid #222;box-shadow:3px 3px 0 #222;background:linear-gradient(180deg,color-mix(in srgb,var(--bb,var(--p)) 45%,#fff),var(--bb,var(--p)));color:var(--bt,#111)')}
${L('pop',C,'border:4px solid var(--s);border-radius:34px;box-shadow:0 8px 0 var(--s)')}${L('pop','.btn','border-radius:999px;box-shadow:0 6px 0 color-mix(in srgb,var(--bb,var(--p)) 60%,#000)')}${L('pop','.btn:hover','transform:translateY(-3px) rotate(-2deg)')}
${L('heritage',CB+',.imgb img,.ph','border:4px double var(--p);border-radius:4px;box-shadow:none')}${L('heritage','.btn','border-style:double;border-width:4px;border-radius:3px')}${L('heritage','.frm input,.frm textarea','border:2px solid var(--p);border-radius:3px')}
${L('magazine',CB,'background:transparent;border:0;border-top:5px solid var(--p);border-radius:0;box-shadow:none;padding:16px 0;color:inherit')}${L('magazine','.btn','border-radius:0;box-shadow:none')}${L('magazine','.hd','font-weight:900')}${L('magazine','.imgb img,.ph','border-radius:0;box-shadow:none')}
`;
})();
/* ===== قوالب جديدة ===== */
(function(){
 const TD=TEMPLATES[0].theme;
 const T2=(id,name,desc,theme,sections)=>({id,name,desc,v:2,theme:Object.assign({},TD,{look:'',bgfx:''},theme),sounds:{click:'click',success:'success',music:'none',custom:{}},sections});
 const navS=(c,st,kind)=>SEC('الشريط',Object.assign({al:'between',pad:16},st),[H(c.brand,{size:22,w:0}),...c.links.map(l=>BT(l,{kind:'link'})),BT(c.b1,{size:'s',kind:kind||'fill'})]);
 const heroC=(c,st,o)=>SEC('هيرو',Object.assign({al:'center',pad:90},st),[AR(c.art,{size:o&&o.as||190,anim:o&&o.aa||'float'}),H(c.h1,{size:o&&o.hs||52,wt:900,anim:o&&o.an||'up'}),P(c.sub,{w:70,size:19}),BT(c.b1,{size:'l',anim:'pulse'}),BT(c.b2,{size:'l',kind:'outline'})]);
 const heroS=(c,st,rev)=>SEC('هيرو',Object.assign({pad:80},st),[H(c.h1,{size:46,wt:900,anim:'up',c:rev?2:1}),P(c.sub,{size:18,c:rev?2:1}),BT(c.b1,{size:'l',c:rev?2:1}),BT(c.b2,{size:'l',kind:'outline',c:rev?2:1}),AR(c.art,{size:340,anim:'float',c:rev?1:2})],'split');
 const heroBig=(c,st)=>SEC('هيرو',Object.assign({pad:100},st),[H(c.h1,{size:92,wt:900,anim:'blur'}),B('shape',{kind:'wave',h:4}),P(c.sub,{w:60,size:20}),BT(c.b1,{size:'l'}),AR(c.art,{size:140,anim:'spin'})]);
 const marquee=(c,st)=>SEC('شريط كلمات',Object.assign({al:'center',pad:22,bg:'p'},st),[H(c.words.join('  ✦  '),{size:26,wt:900})]);
 const feat=(c,st,w)=>SEC('المميزات',Object.assign({al:'center'},st),[H(c.fh||'ليه تختارنا؟',{size:36}),...c.feat.map(f=>CD({icon:f[0],title:f[1],text:f[2],center:1},w||33))]);
 const bento=(c,st)=>SEC('مربعات',Object.assign({al:'center'},st),[H(c.fh||'كل اللي محتاجه',{size:36}),...c.feat.map((f,i)=>CD({icon:f[0],title:f[1],text:f[2],center:1},[66,33,33,66][i%4])),CD({icon:'✨',title:c.extra||'وأكتر',text:'ومفاجآت تانية',center:1},100)]);
 const steps=(c,st)=>SEC('الخطوات',Object.assign({al:'center'},st),[H('إزاي بنشتغل؟',{size:36}),...c.feat.map((f,i)=>CD({icon:'٠'+'١٢٣٤٥'[i],title:f[1],text:f[2],center:1},33))]);
 const gal=(c,st,w)=>SEC('معرض',Object.assign({al:'center'},st),[H(c.gh||'معرض الصور',{size:34}),...[0,1,2,3,4,5].map(()=>IM('',{w:w||33,h:200}))]);
 const price=(c,st)=>SEC('الأسعار',Object.assign({al:'center'},st),[H('الباقات',{size:36}),CD({title:'أساسي',price:c.pr[0],lines:'ميزة أولى\nميزة تانية',btn:'اشترك',center:1}),CD({title:'مميز',price:c.pr[1],lines:'كل الأساسي\nميزة تالتة\nدعم سريع',btn:'اشترك',featured:1,center:1}),CD({title:'كامل',price:c.pr[2],lines:'كل حاجة\nأولوية',btn:'اشترك',center:1})]);
 const rev=(c,st)=>SEC('آراء',Object.assign({al:'center'},st),[H('بيقولوا إيه',{size:34}),CD({icon:'⭐⭐⭐⭐⭐',title:'أحمد',text:c.q[0],center:1},50),CD({icon:'⭐⭐⭐⭐⭐',title:'سارة',text:c.q[1],center:1},50)]);
 const faq=(c,st)=>SEC('أسئلة',Object.assign({},st),[H('أسئلة شائعة',{size:32,al:'center'}),FQ('أبدأ إزاي؟','دوس على زرار ابدأ واتبع الخطوات.'),FQ('فيه ضمان؟','أيوه، ضمان استرجاع خلال 14 يوم.'),FQ('أتواصل معاكم إزاي؟','واتساب أو الفورم تحت.')]);
 const stats=(c,st)=>SEC('أرقام',Object.assign({bg:'p',al:'center',pad:50},st),[ST(c.st[0],'عميل'),ST(c.st[1],'مشروع'),ST(c.st[2],'سنين خبرة'),ST('24/7','دعم')]);
 const contact=(c,st)=>SEC('تواصل',Object.assign({al:'center'},st),[H('كلمنا',{size:34}),P('📞 0100 000 0000  •  📍 القاهرة'),B('form',{w:60,btn:c.b1})]);
 const cta=(c,st)=>SEC('دعوة',Object.assign({bg:'p',al:'center',pad:64},st),[H(c.cta||'جاهز تبدأ؟',{size:38,wt:900}),BT(c.b1,{size:'l',bg:'#ffffff',tc:'#111111',anim:'rubber'})]);
 const foot=(c,st)=>SEC('الفوتر',Object.assign({bg:'tx',al:'center',pad:34},st),[P('© 2026 '+c.brand+'. كل الحقوق محفوظة.',{size:14,op:80})]);
 const mk=(id,name,desc,theme,c,secs)=>T2(id,name,desc,theme,secs.map(f=>f(c)));
 const D=(f,st,x)=>c=>f(c,st,x);
 const N=[
 mk('brutal','بروتاليست','حدود سميكة وألوان صارخة',{look:'brutal',p:'#ff5c8a',s:'#ffd93d',bg:'#fff7d6',sf:'#ffffff',tx:'#111111',r:0,hf:'lalezar',bf:'cairo',sh:'none',gap:24},
  {brand:'ستوديو بوم',links:['شغلنا','أسعارنا'],b1:'كلمنا',b2:'شوف شغلنا',h1:'تصميم جريء بدون تجميل',sub:'بنعمل هويات ومواقع بتتشاف من أول نظرة.',art:'burst',feat:[['🎯','هوية','لوجو وألوان وخطوط'],['🖥','مواقع','سريعة ومتجاوبة'],['📣','محتوى','بوستات وفيديوهات'],['🧪','تجارب','أفكار مجنونة']],words:['جريء','بسيط','مختلف','سريع'],gh:'شغل مختار',pr:['500 ج','900 ج','1500 ج'],q:['شغل مختلف فعلاً.','سرعة ودقة.'],st:['+80','+120','6'],cta:'عندك فكرة؟'},
  [D(navS,{bg:'s'}),D(heroS,{bg:''}),D(marquee,{bg:'tx'}),D(bento,{}),D(gal,{bg:'s'},50),D(cta,{bg:'p'}),D(foot,{bg:'tx'})]),
 mk('glass','زجاجي','شفافية وتدرجات ألوان',{look:'glass',bgfx:'mesh',p:'#7c5cff',s:'#ff7ac6',bg:'#2a1b5e',sf:'#ffffff',tx:'#ffffff',r:26,hf:'alex',bf:'alex',sh:'soft'},
  {brand:'نوفا',links:['المميزات','الأسعار'],b1:'جرّب مجاناً',b2:'شوف العرض',h1:'مستقبل شغلك بشكل أنعم',sub:'منصة بتجمع كل أدواتك في مكان واحد وتصميم يريح العين.',art:'sparkle',feat:[['🔮','ذكاء','اقتراحات تلقائية'],['🌊','سلاسة','واجهة هادية'],['🔒','أمان','حماية كاملة']],words:[],fh:'ليه نوفا؟',pr:['0 ج','149 ج','399 ج'],q:['أحلى واجهة استخدمتها.','وفرت وقت كتير.'],st:['+10k','+300','4'],cta:'ابدأ دلوقتي'},
  [D(navS,{bg:'',pad:18},'ghost'),D(heroC,{pad:80}),D(feat,{}),D(price,{}),D(rev,{}),D(cta,{bg:''}),D(foot,{bg:''})]),
 mk('clay','طين ناعم','باستيل 3D لطيف',{look:'clay',p:'#8b7cf6',s:'#ffb4a2',bg:'#efe9fb',sf:'#f6f2ff',tx:'#3b3355',r:30,hf:'marhey',bf:'cairo',sh:'none',gap:28},
  {brand:'🧸 كوكو',links:['منتجاتنا','عننا'],b1:'اطلب',b2:'تعرف علينا',h1:'حاجات لطيفة بتفرّح',sub:'هدايا وإكسسوارات يدوية بألوان هادية.',art:'cloud',feat:[['🧶','يدوي','صنع بحب'],['🎀','تغليف','هدية جاهزة'],['🚚','توصيل','لكل مكان']],words:[],fh:'ليه كوكو؟',pr:['150 ج','280 ج','450 ج'],q:['التغليف تحفة.','جودة عالية.'],st:['+500','+40','3'],cta:'جاهز تطلب؟'},
  [D(navS,{},'fill'),D(heroS,{},true),D(feat,{}),D(gal,{},50),D(rev,{}),D(foot,{bg:'p'})]),
 mk('y2k','ريترو Y2K','ألوان فاقعة وشبكة',{look:'y2k',bgfx:'grid',p:'#ff4fd8',s:'#35e0ff',bg:'#fdf6ff',sf:'#ffffff',tx:'#241b3a',r:18,hf:'changa',bf:'cairo',sh:'none'},
  {brand:'💿 بيبي ستار',links:['موسيقى','ستايل'],b1:'اشترك',b2:'شغّل',h1:'رجّعنا ألفين',sub:'ستايل وموسيقى وذكريات الزمن الجميل.',art:'smiley',feat:[['💿','ألبومات','مجموعة كلاسيك'],['👟','ستايل','ملابس ريترو'],['🎧','بلايليست','كل يوم جديد']],words:['y2k','ريترو','نجوم','🌟'],pr:['50 ج','90 ج','150 ج'],q:['فكرتني بطفولتي.','ستايل خرافي.'],st:['+9k','+70','2'],cta:'ادخل العالم'},
  [D(navS,{bg:'sf'}),D(heroC,{pad:70,deco:'checker'},{aa:'wiggle',as:210}),D(marquee,{bg:'s'}),D(feat,{}),D(price,{bg:'sf'}),D(cta,{bg:'p',deco:'confetti'}),D(foot,{bg:'tx'})]),
 mk('editorial','مجلة بسيطة','تحريري هادئ وأنيق',{look:'editorial',bgfx:'paper',p:'#1a1a1a',s:'#b3472e',bg:'#faf8f3',sf:'#f1ede4',tx:'#1a1a1a',r:0,hf:'markazi',bf:'amiri',fs:20,sh:'none',width:860,gap:28},
  {brand:'يوميات',links:['مقالات','عنّا'],b1:'اشترك',b2:'اقرأ',h1:'كلام هادي عن أشياء مهمة',sub:'مقالات قصيرة عن التصميم والكتابة والحياة اليومية.',art:'pencil',feat:[['١','عن الكتابة','كيف نكتب بوضوح'],['٢','عن التصميم','تفاصيل صغيرة'],['٣','عن الوقت','تنظيم يومك']],words:[],fh:'أحدث المقالات',pr:['','',''],q:['كتابة صافية.','أقرأها كل أسبوع.'],st:['+30','+200','5'],cta:'اشترك في النشرة'},
  [D(navS,{bg:''},'link'),D(heroBig,{pad:80}),D(feat,{}),D(rev,{bg:'sf'}),D(cta,{bg:'tx'}),D(foot,{bg:''})]),
 mk('neon','نيون داكن','إضاءة نيون وليل',{look:'neon',bgfx:'',p:'#00f0ff',s:'#ff2bd6',bg:'#0a0a16',sf:'#12122a',tx:'#eaf6ff',r:14,hf:'changa',bf:'cairo',sh:'none'},
  {brand:'⚡ فولت',links:['ألعاب','بطولات'],b1:'سجل',b2:'العب',h1:'العب بمستوى تاني',sub:'بطولات وأجهزة وسيرفرات بأقوى أداء.',art:'diamond',feat:[['🎮','بطولات','جوايز أسبوعية'],['🖥','أجهزة','أحدث الكروت'],['🏆','ترتيب','نافس الأقوى']],words:['ليل','نيون','سرعة','قوة'],pr:['99 ج','199 ج','349 ج'],q:['أحلى مجتمع.','سيرفرات سريعة.'],st:['+20k','+90','4'],cta:'ادخل الساحة'},
  [D(navS,{},'outline'),D(heroS,{deco:'aurora',pad:90}),D(marquee,{bg:'sf'}),D(bento,{}),D(stats,{bg:'sf'}),D(price,{}),D(foot,{bg:'sf'})]),
 mk('doodle','رسم باليد','خطوط مرسومة ودوائر',{look:'doodle',bgfx:'dots',p:'#ff7043',s:'#4dd0c8',bg:'#fffdf5',sf:'#ffffff',tx:'#2d2a26',r:20,hf:'playpen',bf:'playpen',sh:'none'},
  {brand:'✏️ شخبطة',links:['رسوماتي','تواصل'],b1:'اطلب رسمة',b2:'شوف الشغل',h1:'رسومات بتضحّك',sub:'شخصيات وبوسترات مرسومة باليد لمشروعك.',art:'squiggle',feat:[['🖍','شخصيات','كاركتر مخصوص'],['🎨','بوسترات','بألوان مبهجة'],['📘','كتب أطفال','قصص مصورة']],words:[],fh:'أعمل إيه؟',pr:['100 ج','250 ج','600 ج'],q:['رسمة فاقت التوقعات.','طلعت زي ما حلمت.'],st:['+200','+60','7'],cta:'نرسم سوا؟'},
  [D(navS,{},'ghost'),D(heroC,{pad:70},{an:'rubber'}),D(feat,{}),D(gal,{},50),D(rev,{}),D(cta,{bg:'s'}),D(foot,{bg:'tx'})]),
 mk('kids','أطفال مرح','ألوان فرايحية',{look:'pop',bgfx:'',p:'#ff6b6b',s:'#ffd166',bg:'#e9f9ff',sf:'#ffffff',tx:'#2b2d42',r:34,hf:'lemonada',bf:'marhey',sh:'none',gap:24},
  {brand:'🌈 أبطال صغيرين',links:['أنشطة','مواعيد'],b1:'سجل طفلك',b2:'شوف الأنشطة',h1:'نلعب ونتعلم مع بعض',sub:'حضانة وأنشطة ممتعة بإشراف متخصصين.',art:'smiley',feat:[['🎨','رسم','موهبة وخيال'],['🔤','حروف','تعلم بالألعاب'],['⚽','رياضة','نشاط وحركة']],words:['لعب','ضحك','تعلم','أصدقاء'],fh:'أنشطتنا',pr:['300 ج','500 ج','800 ج'],q:['ابني بيحب الحضانة.','مدرسين رائعين.'],st:['+150','+25','9'],cta:'سجل النهاردة'},
  [D(navS,{bg:'sf'}),D(heroS,{deco:'confetti',pad:70},true),D(marquee,{bg:'s'}),D(steps,{}),D(gal,{bg:'sf'},50),D(price,{}),D(cta,{bg:'p',clip:'wave'}),D(foot,{bg:'tx'})]),
 mk('gold','فخامة ذهبي','أسود وذهبي',{look:'gold',bgfx:'',p:'#d4af37',s:'#8c6d1f',bg:'#0c0c0c',sf:'#161616',tx:'#f3ead2',r:2,hf:'reem',bf:'scheh',fs:19,sh:'none'},
  {brand:'◆ لوكس',links:['المجموعات','الحجز'],b1:'احجز موعد',b2:'المجموعة',h1:'الفخامة في التفاصيل',sub:'مجوهرات وساعات حصرية بتصميم لا يتكرر.',art:'diamond',feat:[['💎','ألماس','أنقى الأحجار'],['⌚','ساعات','إصدارات محدودة'],['🎁','هدايا','تغليف فاخر']],words:[],fh:'مجموعاتنا',pr:['5,000 ج','12,000 ج','30,000 ج'],q:['خدمة راقية.','قطعة لا تُنسى.'],st:['+20','+300','15'],cta:'استشارة خاصة'},
  [D(navS,{},'outline'),D(heroC,{pad:100,deco:'sunburst'},{as:160}),D(feat,{bg:'sf'}),D(gal,{},50),D(rev,{bg:'sf'}),D(cta,{bg:''}),D(foot,{bg:'sf'})]),
 mk('heritage','تراث عربي','زخارف وخط عربي',{look:'heritage',bgfx:'',p:'#7a2e1d',s:'#c8963e',bg:'#f4ead5',sf:'#fbf4e4',tx:'#3a2418',r:4,hf:'ruqaaink',bf:'amiri',fs:20,sh:'none'},
  {brand:'🕌 بيت الحكاية',links:['حكايات','معرض'],b1:'زورنا',b2:'اقرأ',h1:'أصالة بتحكي تاريخ',sub:'حرف يدوية وخط عربي وفنون إسلامية بروح عصرية.',art:'lantern',feat:[['🖋','خط عربي','ثلث ونسخ ورقعة'],['🏺','خزف','نقوش إسلامية'],['🌙','فوانيس','تراث رمضاني']],words:['أصالة','فن','تراث','جمال'],fh:'حرفنا',pr:['200 ج','450 ج','900 ج'],q:['قطعة أصيلة.','ذوق رفيع.'],st:['+100','+50','12'],cta:'اطلب قطعتك'},
  [D(navS,{bg:'sf'}),D(heroS,{deco:'geo',pad:80},true),D(marquee,{bg:'p'}),D(feat,{}),D(gal,{bg:'sf'},50),D(rev,{}),D(foot,{bg:'p'})]),
 mk('mesh','تدرج ميش','تدرجات ناعمة',{look:'glass',bgfx:'mesh',p:'#ff7eb3',s:'#7afcff',bg:'#fff3fa',sf:'#ffffff',tx:'#2a2140',r:30,hf:'zain',bf:'zain',fs:19,sh:'soft'},
  {brand:'☁️ رواق',links:['التطبيق','الأسعار'],b1:'حمّل التطبيق',b2:'فيديو',h1:'يومك أهدى مع رواق',sub:'تطبيق تأمل ونوم وتركيز بتصميم مريح.',art:'cloud',feat:[['🧘','تأمل','جلسات قصيرة'],['😴','نوم','قصص وأصوات'],['🎯','تركيز','تحكم في وقتك']],words:[],fh:'جرّبه بنفسك',pr:['0 ج','79 ج','699 ج'],q:['نمت أحسن.','تطبيق رائع.'],st:['+50k','+40','3'],cta:'ابدأ مجاناً'},
  [D(navS,{},'ghost'),D(heroC,{pad:90},{an:'blur'}),D(bento,{}),D(price,{}),D(cta,{bg:'',clip:''}),D(foot,{bg:''})]),
 mk('magazine','جريدة','أعمدة وعناوين كبيرة',{look:'magazine',bgfx:'paper',p:'#c1121f',s:'#111111',bg:'#ffffff',sf:'#f5f5f5',tx:'#111111',r:0,hf:'kufam',bf:'amiri',fs:19,sh:'none',gap:26},
  {brand:'الخبر اليوم',links:['سياسة','اقتصاد','رياضة'],b1:'اشترك',b2:'الأكثر قراءة',h1:'عناوين بتهم القارئ',sub:'تغطية سريعة وتحليل هادئ لأهم أحداث اليوم.',art:'trophy',feat:[['١','اقتصاد','أسعار وأسواق'],['٢','رياضة','نتائج ومباريات'],['٣','ثقافة','كتب وأفلام']],words:['عاجل','تحليل','تقرير','حوار'],fh:'أحدث الأخبار',pr:['','',''],q:['تغطية متوازنة.','أقرأها يومياً.'],st:['+1M','+5k','20'],cta:'اشترك في النشرة'},
  [D(navS,{bg:'',pad:14},'outline'),D(heroS,{pad:60},false),D(marquee,{bg:'p'}),D(feat,{}),D(stats,{bg:'tx'}),D(foot,{bg:'tx'})]),
 mk('arch','عمارة وديكور','هادئ وأنيق',{look:'editorial',bgfx:'sunset',p:'#4a6b5d',s:'#d9b48f',bg:'#f6f1ea',sf:'#ece3d6',tx:'#2d3a33',r:0,hf:'fustat',bf:'fustat',sh:'none',gap:26},
  {brand:'مساحات',links:['مشاريع','خدمات'],b1:'استشارة',b2:'مشاريعنا',h1:'مساحات تحس فيها بالراحة',sub:'تصميم داخلي وديكور بهوية هادئة وخامات طبيعية.',art:'mountains',feat:[['📐','تخطيط','استغلال المساحة'],['🛋','أثاث','قطع مختارة'],['💡','إضاءة','أجواء دافئة']],words:[],fh:'خدماتنا',pr:['','',''],q:['بيتي اتغير.','احترافية عالية.'],st:['+60','+140','10'],cta:'ابدأ مشروعك'},
  [D(navS,{},'link'),D(heroBig,{pad:90,clip:'round'}),D(gal,{bg:'sf'},50),D(feat,{}),D(rev,{bg:'sf',clip:'wave'}),D(cta,{bg:'p'}),D(foot,{bg:'tx'})]),
 mk('saas','تقنية داكن','لوحة تحكم وتقنية',{look:'outline',bgfx:'grid',p:'#6ee7b7',s:'#60a5fa',bg:'#0b1020',sf:'#111a33',tx:'#e5ecff',r:12,hf:'vazir',bf:'vazir',sh:'none'},
  {brand:'</> كودلي',links:['المميزات','الأسعار'],b1:'ابدأ',b2:'التوثيق',h1:'ابني أسرع وانشر بثقة',sub:'منصة نشر وإدارة مشاريع للمطورين بخطوة واحدة.',art:'laptop',feat:[['🚀','نشر فوري','من GitHub مباشرة'],['📊','مراقبة','تقارير لحظية'],['🔐','أمان','تشفير كامل']],words:[],fh:'أدوات للمطور',pr:['0 ج','199 ج','599 ج'],q:['وفرت ساعات.','أفضل منصة.'],st:['+8k','+500','3'],cta:'جرّب مجاناً'},
  [D(navS,{},'outline'),D(heroS,{deco:'glow',pad:90}),D(bento,{}),D(stats,{bg:'sf'}),D(price,{}),D(faq,{bg:'sf'}),D(foot,{bg:'sf'})])
 ];
 TEMPLATES.push(...N);
})();
