/* بيانات الصانع: الخطوط، الرسومات، الأقسام الجاهزة، والقوالب */
const FONTS=[
 ['cairo','القاهرة (Cairo)',"Cairo","Cairo:wght@400;700;900"],
 ['tajawal','تجوال (Tajawal)',"Tajawal","Tajawal:wght@400;700;900"],
 ['almarai','المراعي (Almarai)',"Almarai","Almarai:wght@400;700;800"],
 ['kufi','نوتو كوفي (Noto Kufi)',"'Noto Kufi Arabic'","Noto+Kufi+Arabic:wght@400;700;900"],
 ['naskh','نوتو نسخ (Noto Naskh)',"'Noto Naskh Arabic'","Noto+Naskh+Arabic:wght@400;700"],
 ['amiri','أميري (Amiri)',"Amiri","Amiri:wght@400;700"],
 ['changa','شانجا (Changa)',"Changa","Changa:wght@400;700;800"],
 ['messiri','المسيري (El Messiri)',"'El Messiri'","El+Messiri:wght@400;700"],
 ['reem','ريم كوفي (Reem Kufi)',"'Reem Kufi'","Reem+Kufi:wght@400;700"],
 ['mada','مدى (Mada)',"Mada","Mada:wght@400;700;900"],
 ['plex','IBM Plex عربي',"'IBM Plex Sans Arabic'","IBM+Plex+Sans+Arabic:wght@400;700"],
 ['readex','Readex Pro',"'Readex Pro'","Readex+Pro:wght@400;700"],
 ['baloo','بالو بهاجان (Baloo)',"'Baloo Bhaijaan 2'","Baloo+Bhaijaan+2:wght@400;700;800"],
 ['markazi','مركزي (Markazi)',"'Markazi Text'","Markazi+Text:wght@400;700"],
 ['harmattan','هارماتان',"Harmattan","Harmattan:wght@400;700"],
 ['ruqaa','عارف رقعة (Aref Ruqaa)',"'Aref Ruqaa'","Aref+Ruqaa:wght@400;700"],
 ['lalezar','لالزار (للعناوين)',"Lalezar","Lalezar"],
 ['katibeh','كاتبة (للعناوين)',"Katibeh","Katibeh"],
 ['tahoma','تاهوما (جاهز في الجهاز)',"Tahoma","" ],
 ['arial','أريال (جاهز)',"Arial","" ],
 ['times','تايمز (جاهز)',"'Times New Roman'","" ],
 ['georgia','جورجيا (إنجليزي)',"Georgia","" ],
 ['mono','آلة كاتبة',"'Courier New'","" ]
];
const ART={
blob:`<svg viewBox="0 0 200 200"><path d="M45 30c30-25 90-20 115 15s20 90-15 115-95 20-120-15S15 55 45 30z" fill="var(--p)" opacity=".18"/><circle cx="100" cy="100" r="55" fill="var(--p)"/><circle cx="135" cy="70" r="22" fill="var(--s)"/></svg>`,
books:`<svg viewBox="0 0 200 200"><rect x="30" y="140" width="140" height="28" rx="6" fill="var(--p)"/><rect x="42" y="108" width="120" height="28" rx="6" fill="var(--s)"/><rect x="36" y="76" width="130" height="28" rx="6" fill="var(--p)" opacity=".75"/><path d="M60 72c0-30 15-48 40-48s40 18 40 48z" fill="var(--s)" opacity=".5"/><rect x="50" y="150" width="60" height="5" rx="2" fill="#fff" opacity=".7"/></svg>`,
rocket:`<svg viewBox="0 0 200 200"><path d="M100 20c28 22 38 60 30 100H70c-8-40 2-78 30-100z" fill="var(--p)"/><circle cx="100" cy="75" r="14" fill="#fff"/><circle cx="100" cy="75" r="8" fill="var(--s)"/><path d="M70 105L45 135l28 5zM130 105l25 30-28 5z" fill="var(--s)"/><path d="M85 125h30l-15 45z" fill="#ffb02e"/></svg>`,
laptop:`<svg viewBox="0 0 200 200"><rect x="38" y="45" width="124" height="86" rx="8" fill="#2b2d42"/><rect x="46" y="53" width="108" height="70" rx="4" fill="#fff"/><rect x="56" y="95" width="14" height="20" fill="var(--p)"/><rect x="78" y="82" width="14" height="33" fill="var(--s)"/><rect x="100" y="70" width="14" height="45" fill="var(--p)"/><rect x="122" y="62" width="14" height="53" fill="var(--s)"/><path d="M20 138h160l-12 20H32z" fill="#4a4e69"/></svg>`,
bulb:`<svg viewBox="0 0 200 200"><circle cx="100" cy="80" r="50" fill="var(--s)"/><circle cx="100" cy="80" r="50" fill="#fff" opacity=".25"/><rect x="78" y="125" width="44" height="14" rx="4" fill="var(--p)"/><rect x="82" y="142" width="36" height="12" rx="4" fill="var(--p)" opacity=".8"/><path d="M88 110l12-30 12 30" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M100 12v-4M40 30l-5-4M160 30l5-4M20 80h-6M180 80h6" stroke="var(--s)" stroke-width="5" stroke-linecap="round"/></svg>`,
mountains:`<svg viewBox="0 0 200 200"><circle cx="145" cy="55" r="24" fill="var(--s)"/><path d="M10 160l55-90 35 50 30-40 60 80z" fill="var(--p)"/><path d="M65 70l-18 30 18-8 12 12z" fill="#fff" opacity=".6"/><rect x="10" y="160" width="180" height="8" rx="4" fill="var(--p)" opacity=".4"/></svg>`,
cap:`<svg viewBox="0 0 200 200"><path d="M100 40L20 80l80 40 80-40z" fill="var(--p)"/><path d="M55 100v30c0 12 22 24 45 24s45-12 45-24v-30l-45 22z" fill="var(--s)"/><path d="M170 85v50" stroke="var(--s)" stroke-width="5"/><circle cx="170" cy="138" r="8" fill="var(--s)"/></svg>`,
cart:`<svg viewBox="0 0 200 200"><path d="M25 45h30l20 80h85l15-55H62" stroke="var(--p)" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="88" cy="153" r="13" fill="var(--s)"/><circle cx="150" cy="153" r="13" fill="var(--s)"/><rect x="85" y="85" width="20" height="25" rx="4" fill="var(--s)"/><rect x="115" y="80" width="20" height="30" rx="4" fill="var(--p)" opacity=".6"/></svg>`,
plate:`<svg viewBox="0 0 200 200"><circle cx="100" cy="105" r="75" fill="var(--sf)" stroke="var(--p)" stroke-width="6"/><circle cx="100" cy="105" r="52" fill="var(--p)" opacity=".15"/><circle cx="85" cy="95" r="16" fill="var(--s)"/><circle cx="118" cy="112" r="14" fill="var(--p)"/><circle cx="96" cy="128" r="10" fill="#6bbf59"/><path d="M20 25v50M12 25v22c0 6 16 6 16 0V25M180 25c-14 14-14 40 0 50v-50z" stroke="var(--p)" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`,
stars:`<svg viewBox="0 0 200 200"><path d="M100 25l18 38 42 6-30 30 7 42-37-20-37 20 7-42-30-30 42-6z" fill="var(--s)"/><path d="M45 130l7 14 15 2-11 11 3 15-14-8-14 8 3-15-11-11 15-2z" fill="var(--p)"/><path d="M158 120l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2z" fill="var(--p)" opacity=".7"/></svg>`
};
const ART_NAMES={blob:'فقاعة',books:'كتب',rocket:'صاروخ',laptop:'لابتوب',bulb:'لمبة فكرة',mountains:'جبال',cap:'تخرج',cart:'عربية تسوق',plate:'طبق أكل',stars:'نجوم'};
const PALETTES=[
 ['بنفسجي','#5b4bdb','#f4b942','#ffffff','#f4f5fa','#1f2335'],
 ['أخضر','#1e7f5c','#f4b942','#f7faf8','#ffffff','#1b2b24'],
 ['أحمر','#e63946','#1d3557','#ffffff','#f8f9fa','#1d1d1f'],
 ['أزرق','#2563eb','#06b6d4','#ffffff','#eff4ff','#10223f'],
 ['برتقالي','#c2570c','#e8a33d','#fffaf0','#ffffff','#3a2412'],
 ['وردي','#d6336c','#7048e8','#fff8fb','#ffffff','#2b1a24'],
 ['غامق','#a78bfa','#34d399','#12131a','#1d1f2b','#eceef7'],
 ['كحلي','#38bdf8','#f59e0b','#0b1220','#131d33','#e6edf7']
];
let _u=0;const uid=()=>'i'+Date.now().toString(36)+(_u++).toString(36)+Math.random().toString(36).slice(2,5);
const DEF={
 heading:{text:'عنوان جديد',size:34,wt:800,color:'',font:''},
 text:{text:'اكتب كلامك هنا.',size:17,color:'',op:100},
 button:{label:'اضغط هنا',link:'#',bg:'',tc:'',shape:'round',size:'m',kind:'fill',icon:''},
 image:{src:'',imgw:100,h:0,radius:16,fit:'cover',shadow:1},
 art:{kind:'blob',size:300},
 icon:{emoji:'⭐',size:44,bg:'',shape:'circle'},
 card:{icon:'',title:'عنوان',text:'وصف قصير',lines:'',price:'',btn:'',link:'#',bg:'',radius:-1,featured:0,center:0},
 faq:{q:'سؤال؟',a:'الإجابة هنا.'},
 stat:{num:'100+',label:'طالب'},
 shape:{kind:'line',color:'',h:4},
 spacer:{h:30},
 form:{fields:'الاسم\nرقم الموبايل\nرسالتك',btn:'ابعت',email:'',thanks:'شكراً، وصلتنا رسالتك ✅'}
};
const BNAME={heading:['عنوان','🔠'],text:['نص','📝'],button:['زرار','🔘'],image:['صورة','🖼'],art:['رسمة','🎨'],icon:['أيقونة','⭐'],card:['كارت','🗂'],faq:['سؤال وجواب','❓'],stat:['رقم','🔢'],shape:['فاصل/زخرفة','〰️'],spacer:['مسافة فاضية','↕️'],form:['فورم تواصل','✉️']};
const B=(t,o)=>Object.assign({id:uid(),t,w:100,anim:'',dx:0,dy:0,al:'',mt:0,mb:0,c:1},DEF[t],o||{});
const H=(text,o)=>B('heading',Object.assign({text},o));
const P=(text,o)=>B('text',Object.assign({text},o));
const BT=(label,o)=>B('button',Object.assign({label,w:0},o));
const IM=(src,o)=>B('image',Object.assign({src},o));
const AR=(kind,o)=>B('art',Object.assign({kind},o));
const CD=(o,w)=>B('card',Object.assign({w:w||33},o));
const ST=(num,label,w)=>B('stat',{num,label,w:w||25});
const FQ=(q,a)=>B('faq',{q,a});
const SEC=(name,st,blocks,lay)=>({id:uid(),name,lay:lay||'',st:Object.assign({bg:'',tx:'',al:'start',pad:70,deco:'',clip:'',bgimg:'',ov:0,minh:0},st||{}),blocks});
const sp=h=>B('spacer',{h});
/* أقسام جاهزة لزرار "زوّد قسم" */
const PRESETS={
 nav:['الشريط العلوي','🧭',()=>SEC('الشريط العلوي',{bg:'sf',al:'between',pad:16},[H('اسم موقعك',{size:22,w:0}),BT('الرئيسية',{kind:'link'}),BT('عننا',{kind:'link'}),BT('تواصل',{kind:'link'}),BT('ابدأ',{})])],
 heroC:['هيرو في النص','🌟',()=>SEC('هيرو',{al:'center',pad:90,bg:'bg',deco:'bubbles'},[AR('rocket',{size:170}),H('عنوان كبير يشد الانتباه',{size:52,wt:900,anim:'up'}),P('جملة قصيرة بتشرح اللي بتقدمه وليه الناس تختارك.',{w:70,size:19}),BT('ابدأ دلوقتي',{size:'l',anim:'pulse'}),BT('اعرف أكتر',{kind:'outline',size:'l'})])],
 heroS:['هيرو نصين','🖼',()=>SEC('هيرو',{pad:80,bg:'bg'},[H('عنوان رئيسي قوي',{size:46,wt:900,anim:'up'}),P('اكتب هنا وصف قصير وواضح.',{size:18}),BT('ابدأ الآن',{size:'l'}),AR('laptop',{c:2,size:340})],'split')],
 features:['المميزات','✨',()=>SEC('المميزات',{bg:'sf',al:'center'},[H('ليه تختارنا؟',{size:34}),P('أهم الحاجات اللي بتميزنا',{op:70}),CD({icon:'⚡',title:'سريع',text:'بنخلص شغلك بسرعة.',center:1}),CD({icon:'💎',title:'جودة',text:'أعلى جودة في كل تفصيلة.',center:1}),CD({icon:'🤝',title:'دعم',text:'معاك في أي وقت.',center:1})])],
 pricing:['الأسعار','💰',()=>SEC('الأسعار',{al:'center'},[H('الأسعار',{size:34}),CD({title:'أساسي',price:'99 ج',lines:'ميزة أولى\nميزة تانية',btn:'اشترك',center:1}),CD({title:'مميز',price:'199 ج',lines:'كل الأساسي\nميزة تالتة\nدعم سريع',btn:'اشترك',featured:1,center:1}),CD({title:'احترافي',price:'299 ج',lines:'كل حاجة\nأولوية',btn:'اشترك',center:1})])],
 gallery:['معرض صور','🖼',()=>SEC('معرض',{bg:'sf',al:'center'},[H('معرض الأعمال',{size:34}),IM('',{w:33,h:200}),IM('',{w:33,h:200}),IM('',{w:33,h:200}),IM('',{w:33,h:200}),IM('',{w:33,h:200}),IM('',{w:33,h:200})])],
 reviews:['آراء العملاء','💬',()=>SEC('آراء',{al:'center'},[H('بيقولوا إيه علينا',{size:34}),CD({icon:'⭐⭐⭐⭐⭐',title:'أحمد',text:'تجربة ممتازة وشغل نضيف.',center:1}),CD({icon:'⭐⭐⭐⭐⭐',title:'سارة',text:'أنصح بيهم جداً.',center:1}),CD({icon:'⭐⭐⭐⭐',title:'محمود',text:'سرعة وجودة.',center:1})])],
 faq:['أسئلة شائعة','❓',()=>SEC('أسئلة',{bg:'sf'},[H('أسئلة بتتسأل كتير',{size:32,al:'center'}),FQ('سؤال أول؟','الإجابة هنا.'),FQ('سؤال تاني؟','الإجابة هنا.'),FQ('سؤال تالت؟','الإجابة هنا.')])],
 stats:['أرقام','🔢',()=>SEC('أرقام',{bg:'p',al:'center',pad:50},[ST('+500','عميل'),ST('+50','مشروع'),ST('10','سنين خبرة'),ST('24/7','دعم')])],
 contact:['تواصل معانا','📞',()=>SEC('تواصل',{al:'center'},[H('كلمنا',{size:34}),P('📞 0100 000 0000   •   📍 القاهرة'),B('form',{w:60})])],
 cta:['دعوة للتحرك','📣',()=>SEC('دعوة',{bg:'p',al:'center',pad:60,deco:'dots'},[H('جاهز تبدأ؟',{size:38}),P('ابدأ دلوقتي ومتستناش.'),BT('ابدأ',{bg:'#ffffff',tc:'#111111',size:'l'})])],
 menu:['منيو / قايمة','🍽',()=>SEC('المنيو',{bg:'sf',al:'center'},[H('المنيو',{size:34}),CD({icon:'🍕',title:'صنف 1',price:'80 ج',text:'وصف الصنف'},50),CD({icon:'🍔',title:'صنف 2',price:'95 ج',text:'وصف الصنف'},50),CD({icon:'🥗',title:'صنف 3',price:'60 ج',text:'وصف الصنف'},50),CD({icon:'🍰',title:'صنف 4',price:'45 ج',text:'وصف الصنف'},50)])],
 text:['فقرة نص','📝',()=>SEC('نص',{},[H('عنوان',{size:30}),P('اكتب فقرة كاملة هنا بالشكل اللي يعجبك.')])],
 footer:['الفوتر','🔻',()=>SEC('الفوتر',{bg:'tx',al:'center',pad:36},[P('© 2026 اسم موقعك. كل الحقوق محفوظة.',{size:14,op:80}),BT('فيسبوك',{kind:'link'}),BT('واتساب',{kind:'link'}),BT('انستجرام',{kind:'link'})])],
 empty:['قسم فاضي','⬜',()=>SEC('قسم جديد',{},[H('قسم جديد',{size:30})])]
};
/* القوالب */
const T=(id,name,desc,theme,sections)=>({id,name,desc,v:2,theme:Object.assign({p:'#5b4bdb',s:'#f4b942',bg:'#ffffff',sf:'#f4f5fa',tx:'#1f2335',hf:'cairo',bf:'cairo',fs:17,r:16,sh:'soft',gap:20,width:1100,dir:'rtl',online:1},theme),sounds:{click:'click',success:'success',music:'none',custom:{}},sections});
const TEMPLATES=[
T('teacher','منصة مدرس','للمدرسين والكورسات',{p:'#1e7f5c',s:'#f4b942',bg:'#f7faf8',sf:'#ffffff',tx:'#1b2b24',r:18},[
 SEC('الشريط',{bg:'sf',al:'between',pad:14},[H('أ. يوسف | منصة الشرح',{size:20,w:0,color:'#1e7f5c'}),BT('الكورسات',{kind:'link'}),BT('آراء',{kind:'link'}),BT('سجل دلوقتي',{size:'s'})]),
 SEC('هيرو',{pad:70,deco:'bubbles'},[H('اتعلم بسهولة وطلّع أعلى الدرجات 🎓',{size:44,wt:900,anim:'up'}),P('شرح مبسط، حصص مسجلة، ومتابعة يومية مع كل طالب.',{size:19}),BT('ابدأ الكورس',{size:'l',anim:'pulse'}),BT('شوف الأسعار',{kind:'outline',size:'l'}),AR('cap',{c:2,size:330})],'split'),
 SEC('أرقام',{bg:'p',al:'center',pad:44},[ST('+3000','طالب'),ST('+120','حصة مسجلة'),ST('98%','نسبة النجاح'),ST('8','سنين خبرة')]),
 SEC('مميزات',{al:'center'},[H('ليه تذاكر معانا؟',{size:34}),CD({icon:'🎥',title:'حصص مسجلة',text:'شوف الحصة في أي وقت وكررها.',center:1}),CD({icon:'📝',title:'امتحانات ومراجعات',text:'اختبارات أسبوعية وتصحيح فوري.',center:1}),CD({icon:'💬',title:'متابعة مستمرة',text:'رد على أسئلتك طول اليوم.',center:1})]),
 SEC('الأسعار',{bg:'sf',al:'center'},[H('الباقات',{size:34}),CD({title:'شهري',price:'150 ج',lines:'كل الحصص\nملازم PDF\nامتحانات',btn:'اشترك',center:1}),CD({title:'ترم كامل',price:'400 ج',lines:'كل حاجة في الشهري\nمراجعة نهائية\nمتابعة واتساب',btn:'اشترك',featured:1,center:1}),CD({title:'سنة كاملة',price:'700 ج',lines:'الترمين\nمراجعات\nأولوية في الدعم',btn:'اشترك',center:1})]),
 SEC('آراء',{al:'center'},[H('رأي الطلاب',{size:34}),CD({icon:'⭐⭐⭐⭐⭐',title:'منة',text:'الشرح سهل وفرق معايا جداً.',center:1}),CD({icon:'⭐⭐⭐⭐⭐',title:'كريم',text:'جبت الدرجة النهائية بفضل الله.',center:1})],''),
 SEC('أسئلة',{bg:'sf'},[H('أسئلة شائعة',{size:32,al:'center'}),FQ('أدفع إزاي؟','فودافون كاش أو انستا باي.'),FQ('أقدر أشوف الحصة أكتر من مرة؟','أكيد، من غير حد أقصى.')]),
 SEC('تواصل',{al:'center'},[H('سجل دلوقتي',{size:34}),B('form',{w:60,fields:'اسم الطالب\nرقم ولي الأمر\nالصف',btn:'سجلني'})]),
 PRESETS.footer[2]()]),
T('shop','متجر','متجر ملابس/منتجات',{p:'#e63946',s:'#1d3557',bg:'#ffffff',sf:'#f8f9fa',tx:'#1d1d1f',r:8,hf:'tajawal',bf:'tajawal',sh:'soft'},[
 SEC('شريط',{bg:'s',al:'between',pad:12},[P('🚚 شحن مجاني فوق 500 جنيه',{w:0,size:14}),BT('عربيتي 🛒',{kind:'link'})]),
 SEC('الشريط',{bg:'bg',al:'between',pad:16},[H('متجرك',{size:26,w:0,color:'#e63946',wt:900}),BT('الرئيسية',{kind:'link'}),BT('المنتجات',{kind:'link'}),BT('العروض',{kind:'link'}),BT('اطلب',{size:'s',shape:'square'})]),
 SEC('هيرو',{bg:'sf',pad:70},[H('خصم 40% على كل التشكيلة الجديدة',{size:46,wt:900,anim:'up'}),P('منتجات أصلية وجودة مضمونة وتوصيل لحد باب البيت.',{size:18}),BT('تسوق الآن',{size:'l',shape:'square',anim:'pulse'}),AR('cart',{c:2,size:320})],'split'),
 SEC('مميزات',{al:'center',pad:50},[CD({icon:'🚚',title:'توصيل سريع',text:'خلال 48 ساعة',center:1,bg:'sf'},25),CD({icon:'🔄',title:'استبدال سهل',text:'خلال 14 يوم',center:1,bg:'sf'},25),CD({icon:'💳',title:'دفع عند الاستلام',text:'أو كارت',center:1,bg:'sf'},25),CD({icon:'🛡',title:'ضمان',text:'على كل المنتجات',center:1,bg:'sf'},25)]),
 SEC('منتجات',{al:'center'},[H('الأكثر مبيعاً',{size:34}),CD({icon:'👕',title:'تيشيرت قطن',price:'250 ج',text:'ألوان متعددة',btn:'أضف للعربية',center:1}),CD({icon:'👟',title:'كوتشي رياضي',price:'650 ج',text:'مقاسات 36-45',btn:'أضف للعربية',center:1}),CD({icon:'🎒',title:'شنطة ظهر',price:'420 ج',text:'مقاومة للمياه',btn:'أضف للعربية',center:1}),CD({icon:'⌚',title:'ساعة',price:'900 ج',text:'ضمان سنة',btn:'أضف للعربية',center:1}),CD({icon:'🧢',title:'كاب',price:'120 ج',text:'مقاس واحد',btn:'أضف للعربية',center:1}),CD({icon:'🕶',title:'نضارة',price:'300 ج',text:'حماية UV',btn:'أضف للعربية',center:1})]),
 SEC('عرض',{bg:'p',al:'center',pad:60,deco:'dots'},[H('اشترك في النشرة واحصل على كوبون 10%',{size:32}),B('form',{w:60,fields:'البريد الإلكتروني',btn:'اشترك'})]),
 PRESETS.footer[2]()]),
T('portfolio','معرض أعمال','للمصممين والمبرمجين',{p:'#a78bfa',s:'#34d399',bg:'#12131a',sf:'#1d1f2b',tx:'#eceef7',r:6,hf:'changa',bf:'cairo',sh:'none'},[
 SEC('الشريط',{al:'between',pad:18},[H('مؤمن.dev',{size:24,w:0,color:'#a78bfa'}),BT('أعمالي',{kind:'link'}),BT('مهاراتي',{kind:'link'}),BT('كلمني',{kind:'outline',size:'s',shape:'square'})]),
 SEC('هيرو',{pad:90,al:'center',deco:'bubbles'},[B('icon',{emoji:'👋',size:50,bg:'sf'}),H('أنا مصمم ومطور مواقع',{size:56,wt:900,anim:'up'}),P('بحوّل الأفكار لمواقع حديثة وسريعة وسهلة الاستخدام.',{w:65,size:20}),BT('شوف أعمالي',{size:'l',shape:'square'}),BT('حمّل السيرة',{size:'l',kind:'outline',shape:'square'})]),
 SEC('مهارات',{al:'center',pad:50},[H('مهاراتي',{size:32}),CD({icon:'🎨',title:'تصميم UI',center:1},25),CD({icon:'💻',title:'تطوير ويب',center:1},25),CD({icon:'📱',title:'تطبيقات',center:1},25),CD({icon:'⚙️',title:'SEO',center:1},25)]),
 SEC('أعمال',{al:'center'},[H('أحدث الأعمال',{size:34}),IM('',{w:50,h:220}),IM('',{w:50,h:220}),IM('',{w:50,h:220}),IM('',{w:50,h:220})]),
 SEC('أرقام',{bg:'sf',al:'center',pad:44},[ST('60+','مشروع'),ST('40','عميل'),ST('5','سنين'),ST('100%','التزام')]),
 SEC('تواصل',{al:'center'},[H('خلينا نشتغل مع بعض',{size:36}),B('form',{w:60,fields:'اسمك\nإيميلك\nعن مشروعك',btn:'ابعت'})]),
 SEC('الفوتر',{bg:'sf',al:'center',pad:30},[P('© 2026 كل الحقوق محفوظة',{size:14,op:70})])]),
T('landing','صفحة هبوط','لمنتج أو تطبيق',{p:'#4f46e5',s:'#06b6d4',bg:'#ffffff',sf:'#eff2ff',tx:'#111827',r:24,hf:'readex',bf:'readex',sh:'strong'},[
 SEC('الشريط',{al:'between',pad:16},[H('🚀 تطبيقي',{size:22,w:0}),BT('المميزات',{kind:'link'}),BT('الأسعار',{kind:'link'}),BT('حمّل',{size:'s',shape:'pill'})]),
 SEC('هيرو',{bg:'sf',pad:80,clip:'curve'},[H('نظّم شغلك كله في تطبيق واحد',{size:48,wt:900,anim:'up'}),P('وفر ساعات كل أسبوع واشتغل بذكاء مع فريقك.',{size:19}),BT('جربه مجاناً',{size:'l',shape:'pill',anim:'pulse'}),BT('شاهد الفيديو',{kind:'outline',size:'l',shape:'pill'}),AR('laptop',{c:2,size:350,anim:'float'})],'split'),
 SEC('مميزات',{al:'center'},[H('كل اللي محتاجه',{size:34}),CD({icon:'⏱',title:'تتبع الوقت',text:'اعرف وقتك بيروح فين.',center:1}),CD({icon:'👥',title:'شغل جماعي',text:'شارك المهام مع فريقك.',center:1}),CD({icon:'📊',title:'تقارير',text:'تقارير واضحة بضغطة.',center:1})]),
 SEC('أرقام',{bg:'p',al:'center',pad:50},[ST('50k','مستخدم'),ST('4.9','تقييم'),ST('120','دولة'),ST('99%','رضا')]),
 PRESETS.pricing[2](),
 PRESETS.faq[2](),
 PRESETS.cta[2](),
 PRESETS.footer[2]()]),
T('restaurant','مطعم','مطعم أو كافيه',{p:'#b45309',s:'#e8a33d',bg:'#fffaf0',sf:'#ffffff',tx:'#3a2412',r:14,hf:'messiri',bf:'amiri',fs:19,sh:'soft'},[
 SEC('الشريط',{bg:'sf',al:'between',pad:14},[H('🍽 مطعم الأصيل',{size:24,w:0,color:'#b45309'}),BT('المنيو',{kind:'link'}),BT('احجز',{kind:'link'}),BT('اتصل بينا',{size:'s'})]),
 SEC('هيرو',{pad:90,al:'center',deco:'dots',bgimg:'',bg:'s'},[H('أحلى أكل بيتي بطعم زمان',{size:54,wt:900,anim:'up'}),P('مكونات طازة وطبخ على نار هادية.',{w:65,size:21}),BT('اطلب دلوقتي',{size:'l',bg:'#3a2412',tc:'#ffffff'}),BT('شوف المنيو',{size:'l',kind:'outline'})]),
 SEC('عننا',{pad:60},[H('حكايتنا',{size:36}),P('من 20 سنة وإحنا بنقدم أكلات بيتية بنفس الحب والجودة. كل طبق بيتحضر طازة قدامك.',{size:20}),AR('plate',{c:2,size:280})],'split'),
 SEC('المنيو',{bg:'sf',al:'center'},[H('أشهر الأصناف',{size:36}),CD({icon:'🍖',title:'طاجن لحمة',price:'180 ج',text:'مع رز معمر'},50),CD({icon:'🍗',title:'فراخ مشوية',price:'120 ج',text:'نص فرخة مع سلطات'},50),CD({icon:'🥘',title:'ملوخية',price:'90 ج',text:'بالأرانب أو الفراخ'},50),CD({icon:'🍮',title:'أم علي',price:'45 ج',text:'حلو سخن'},50)]),
 SEC('آراء',{al:'center'},[H('زبايننا بيقولوا',{size:34}),CD({icon:'⭐⭐⭐⭐⭐',title:'هالة',text:'أكل زي أكل ماما.',center:1},50),CD({icon:'⭐⭐⭐⭐⭐',title:'عمرو',text:'الخدمة سريعة والطعم رائع.',center:1},50)]),
 SEC('حجز',{bg:'p',al:'center',deco:'dots'},[H('احجز طاولتك',{size:34}),B('form',{w:60,fields:'الاسم\nرقم الموبايل\nعدد الأفراد',btn:'احجز'}),P('📍 القاهرة  •  📞 0100 000 0000  •  🕒 12 ظهراً - 12 منتصف الليل',{size:16})]),
 PRESETS.footer[2]()]),
T('services','مركز خدمات','شركة أو عيادة',{p:'#0f766e',s:'#0ea5e9',bg:'#ffffff',sf:'#f0f7f7',tx:'#0f2a2a',r:12,hf:'almarai',bf:'almarai',sh:'soft'},[
 SEC('الشريط',{bg:'sf',al:'between',pad:14},[H('➕ مركز الشفاء',{size:22,w:0,color:'#0f766e'}),BT('خدماتنا',{kind:'link'}),BT('الفريق',{kind:'link'}),BT('احجز موعد',{size:'s'})]),
 SEC('هيرو',{bg:'p',pad:80,al:'center',clip:'slant'},[H('رعاية بتهتم بيك وبأسرتك',{size:48,wt:900,anim:'up'}),P('أطباء متخصصون وأحدث الأجهزة وحجز سهل أونلاين.',{w:65,size:19}),BT('احجز دلوقتي',{size:'l',bg:'#ffffff',tc:'#0f766e'})]),
 SEC('خدمات',{al:'center'},[H('خدماتنا',{size:34}),CD({icon:'🩺',title:'كشف عام',text:'فحص شامل',center:1}),CD({icon:'🦷',title:'أسنان',text:'علاج وتجميل',center:1}),CD({icon:'👁',title:'عيون',text:'فحص نظر',center:1}),CD({icon:'💉',title:'تحاليل',text:'نتايج سريعة',center:1}),CD({icon:'🧒',title:'أطفال',text:'رعاية خاصة',center:1}),CD({icon:'🏥',title:'طوارئ',text:'24 ساعة',center:1})]),
 PRESETS.stats[2](),
 PRESETS.faq[2](),
 PRESETS.contact[2](),
 PRESETS.footer[2]()]),
T('blank','قالب فاضي','ابدأ من الصفر',{},[PRESETS.nav[2](),PRESETS.heroC[2](),PRESETS.footer[2]()])
];
