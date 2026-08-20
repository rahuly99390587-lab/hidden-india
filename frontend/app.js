






























































// /* =========================================================
//    HIDDEN INDIA — client-side demo app
//    Data persists via window.storage (per-browser, personal).
//    Map: Leaflet + OpenStreetMap tiles (free, no API key required).
//    ========================================================= */
// const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
// const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
// const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
// const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';
// let _leafletLoadingPromise = null;
// function loadGoogleMaps(){
//   // Kept function name for backward compatibility with existing call sites (initMap/locateMe).
//   // Loads Leaflet (JS + CSS) from a CDN instead of the Google Maps JavaScript API.
//   if(window.L) return Promise.resolve();
//   if(_leafletLoadingPromise) return _leafletLoadingPromise;
//   _leafletLoadingPromise = new Promise((resolve, reject)=>{
//     if(!document.getElementById('leafletCssLink')){
//       const link = document.createElement('link');
//       link.id = 'leafletCssLink';
//       link.rel = 'stylesheet';
//       link.href = LEAFLET_CSS_URL;
//       document.head.appendChild(link);
//     }
//     const s = document.createElement('script');
//     s.src = LEAFLET_JS_URL;
//     s.async = true;
//     s.onload = () => resolve();
//     s.onerror = reject;
//     document.head.appendChild(s);
//   });
//   return _leafletLoadingPromise;
// }

// /* =========================================================
//    BACKEND API — connects to the hidden-india-backend project
//    (Node/Express + PostgreSQL, deployed separately).
//    ⚠️ Set this to your deployed backend's URL, e.g.
//       'https://hidden-india-api.onrender.com' — no trailing slash.
//    ========================================================= */
// const API_BASE_URL = 'https://hidden-india-iein.onrender.com';
// const ADMIN_TOKEN_KEY = 'hidden-india-admin-token';
// function getAdminToken(){ try{ return sessionStorage.getItem(ADMIN_TOKEN_KEY); }catch(e){ return null; } }
// function setAdminToken(t){ try{ if(t) sessionStorage.setItem(ADMIN_TOKEN_KEY, t); else sessionStorage.removeItem(ADMIN_TOKEN_KEY); }catch(e){ /* blocked */ } }
// async function apiFetch(path, options={}){
//   const headers = { 'Content-Type':'application/json', ...(options.headers||{}) };
//   const token = getAdminToken();
//   if(token) headers['Authorization'] = 'Bearer ' + token;
//   let res;
//   try{
//     res = await fetch(API_BASE_URL + path, { ...options, headers });
//   }catch(e){
//     throw new Error('Could not reach the backend. Is it running and is API_BASE_URL correct?');
//   }
//   let body = null;
//   try{ body = await res.json(); }catch(e){ /* empty body, e.g. 204 */ }
//   if(res.status === 401){ setAdminToken(null); STATE.admin.loggedIn = false; }
//   if(!res.ok){ throw new Error((body && body.error) || `Request failed (${res.status})`); }
//   return body;
// }

// const CATEGORY_ICONS = { heritage:'🏛', festivals:'🎭', art:'🎨', culture:'🍛', villages:'🏘' };
// const CATEGORY_COLORS = { heritage:'#8A5A34', festivals:'#9C4A63', art:'#4A6B8A', culture:'#BF5B34', villages:'#33513E' };
// const CATEGORIES = [
//   {id:'heritage', name_en:'Heritage', name_hi:'विरासत', icon:'🏛'},
//   {id:'festivals', name_en:'Festivals', name_hi:'त्यौहार', icon:'🎭'},
//   {id:'art', name_en:'Art & Crafts', name_hi:'कला और शिल्प', icon:'🎨'},
//   {id:'culture', name_en:'Culture', name_hi:'संस्कृति', icon:'🍛'},
//   {id:'villages', name_en:'Heritage Villages', name_hi:'विरासत गांव', icon:'🏘'},
// ];

// const SEED_DESTINATIONS = [
//   {
//     id:'d1', slug:'nalanda-mahavihara', name_en:'Nalanda Mahavihara', name_hi:'नालंदा महाविहार',
//     state:'Bihar', district:'Nalanda', category:'heritage', lat:25.1367, lng:85.4436,
//     short_en:'Ruins of one of the world\'s earliest residential universities.',
//     short_hi:'विश्व के सबसे प्राचीन आवासीय विश्वविद्यालयों में से एक के अवशेष।',
//     about_en:'Nalanda Mahavihara was a residential seat of learning that drew scholars from across Asia between roughly the 5th and 12th centuries CE. Today its excavated brick monasteries and stupas form one of the most extensive ancient university sites anywhere in the world.',
//     about_hi:'नालंदा महाविहार लगभग 5वीं से 12वीं शताब्दी ईस्वी तक एशिया भर के विद्वानों को आकर्षित करने वाला एक आवासीय शिक्षा केंद्र था। आज इसके उत्खनित ईंट के विहार और स्तूप विश्व के सबसे विस्तृत प्राचीन विश्वविद्यालय स्थलों में से एक हैं।',
//     history_en:'Historical accounts, including those of Chinese travellers who studied here, describe a vast complex of monasteries, lecture halls and libraries. The site was gradually abandoned after repeated damage in the 12th century, and its ruins were rediscovered and excavated by the Archaeological Survey of India beginning in the 19th and 20th centuries.',
//     history_hi:'यहां अध्ययन करने वाले चीनी यात्रियों सहित ऐतिहासिक विवरणों में विहारों, व्याख्यान कक्षों और पुस्तकालयों के एक विशाल परिसर का वर्णन मिलता है। 12वीं शताब्दी में बार-बार हुई क्षति के बाद स्थल को धीरे-धीरे छोड़ दिया गया, और इसके अवशेषों को 19वीं-20वीं शताब्दी में भारतीय पुरातत्व सर्वेक्षण द्वारा फिर से खोजा और उत्खनित किया गया।',
//     culture_en:'Nalanda is recognised as a UNESCO World Heritage Site and remains an important symbol of India\'s ancient intellectual and Buddhist heritage, drawing scholars, monks and travellers who trace the roots of organised higher learning in Asia.',
//     culture_hi:'नालंदा को यूनेस्को विश्व धरोहर स्थल के रूप में मान्यता प्राप्त है और यह भारत की प्राचीन बौद्धिक और बौद्ध विरासत के महत्वपूर्ण प्रतीक के रूप में बना हुआ है।',
//     best_time_en:'October to March, when the weather is cool and dry.',
//     best_time_hi:'अक्टूबर से मार्च, जब मौसम ठंडा और शुष्क होता है।',
//     cover_image:'', status:'published', verified:true,
//     tips:[
//       {en:'Follow marked pathways; do not climb on excavated brick structures.', hi:'चिह्नित रास्तों का पालन करें; उत्खनित ईंट संरचनाओं पर न चढ़ें।'},
//       {en:'Photography is generally permitted, but tripods may need prior permission.', hi:'फोटोग्राफी की सामान्यतः अनुमति है, लेकिन ट्राइपॉड के लिए पूर्व अनुमति आवश्यक हो सकती है।'},
//       {en:'Carry water and a hat; there is limited shade across the site.', hi:'पानी और टोपी साथ रखें; स्थल पर छाया सीमित है।'},
//     ],
//     sources:[
//       {organization:'Archaeological Survey of India', title:'Nalanda Mahavihara Site Record', url:'https://asi.nic.in'},
//       {organization:'UNESCO World Heritage Centre', title:'Archaeological Site of Nalanda Mahavihara', url:'https://whc.unesco.org'},
//     ]
//   },
//   {
//     id:'d2', slug:'rajgir', name_en:'Rajgir', name_hi:'राजगीर',
//     state:'Bihar', district:'Nalanda', category:'heritage', lat:25.0298, lng:85.4202,
//     short_en:'A hill-ringed ancient capital linked to the Buddha and Mahavira.',
//     short_hi:'पहाड़ियों से घिरी एक प्राचीन राजधानी, जो बुद्ध और महावीर से जुड़ी है।',
//     about_en:'Rajgir sits within a ring of five hills and served as an early capital of the Magadha kingdom. It holds sites significant to both Buddhist and Jain traditions, including hill-top stupas and ancient cyclopean stone walls.',
//     about_hi:'राजगीर पांच पहाड़ियों के घेरे में स्थित है और मगध राज्य की प्रारंभिक राजधानी रहा है। यहां बौद्ध और जैन दोनों परंपराओं से जुड़े महत्वपूर्ण स्थल हैं।',
//     history_en:'Rajgir (ancient Rajagriha) is described in early Buddhist and Jain texts as a centre of major events, including gatherings associated with the Buddha\'s teachings. Remnants of ancient fortification walls and monastic sites are still visible around the hills.',
//     history_hi:'राजगीर (प्राचीन राजगृह) का वर्णन प्रारंभिक बौद्ध और जैन ग्रंथों में प्रमुख घटनाओं के केंद्र के रूप में मिलता है। पहाड़ियों के आसपास प्राचीन किलेबंदी की दीवारों के अवशेष आज भी दिखाई देते हैं।',
//     culture_en:'A ropeway ascent to the Vishwa Shanti Stupa (Peace Pagoda) offers views over the valley, and the site remains an active pilgrimage destination for Buddhist and Jain visitors.',
//     culture_hi:'विश्व शांति स्तूप तक रोपवे यात्रा घाटी के दृश्य प्रस्तुत करती है, और यह स्थल बौद्ध और जैन तीर्थयात्रियों के लिए एक सक्रिय तीर्थ स्थल बना हुआ है।',
//     best_time_en:'October to March.',
//     best_time_hi:'अक्टूबर से मार्च।',
//     cover_image:'', status:'published', verified:true,
//     tips:[
//       {en:'Respect active worship areas; dress modestly near temples.', hi:'सक्रिय पूजा स्थलों का सम्मान करें; मंदिरों के पास शालीन वस्त्र पहनें।'},
//       {en:'The ropeway can queue up on weekends — plan extra time.', hi:'सप्ताहांत पर रोपवे में कतार लग सकती है — अतिरिक्त समय रखें।'},
//     ],
//     sources:[
//       {organization:'Bihar State Tourism Development Corporation', title:'Rajgir Heritage Circuit', url:'https://bstdc.bihar.gov.in'},
//       {organization:'Archaeological Survey of India', title:'Rajgir Fortification Walls', url:'https://asi.nic.in'},
//     ]
//   },
//   {
//     id:'d3', slug:'vikramshila-mahavihara', name_en:'Vikramshila Mahavihara', name_hi:'विक्रमशिला महाविहार',
//     state:'Bihar', district:'Bhagalpur', category:'heritage', lat:25.3167, lng:87.2667,
//     short_en:'Remains of a major Buddhist learning centre founded by the Pala dynasty.',
//     short_hi:'पाल राजवंश द्वारा स्थापित एक प्रमुख बौद्ध शिक्षा केंद्र के अवशेष।',
//     about_en:'Vikramshila was established under the Pala rulers as one of the great Buddhist monastic universities of eastern India, alongside Nalanda. Excavations reveal a large cross-shaped central stupa surrounded by monastic cells.',
//     about_hi:'विक्रमशिला की स्थापना पाल शासकों के अधीन पूर्वी भारत के महान बौद्ध मठ विश्वविद्यालयों में से एक के रूप में हुई थी। उत्खनन में मठ कक्षों से घिरा एक बड़ा क्रॉस-आकार का केंद्रीय स्तूप सामने आया है।',
//     history_en:'Founded around the 8th century, Vikramshila became known for the study of Buddhist philosophy and tantric practice, and is associated with teachers who carried these traditions to Tibet. The site was excavated by the Archaeological Survey of India through the 20th century.',
//     history_hi:'लगभग 8वीं शताब्दी में स्थापित, विक्रमशिला बौद्ध दर्शन और तांत्रिक अभ्यास के अध्ययन के लिए जाना जाता था। इस स्थल का उत्खनन भारतीय पुरातत्व सर्वेक्षण द्वारा 20वीं शताब्दी में किया गया।',
//     culture_en:'Far less visited than Nalanda, Vikramshila offers a quieter view into the same era of Buddhist scholarship, set beside the Ganga in Bhagalpur district.',
//     culture_hi:'नालंदा की तुलना में बहुत कम देखा जाने वाला, विक्रमशिला भागलपुर जिले में गंगा के किनारे स्थित है और उसी युग की बौद्ध विद्वता की एक शांत झलक प्रस्तुत करता है।',
//     best_time_en:'November to February.',
//     best_time_hi:'नवंबर से फरवरी।',
//     cover_image:'', status:'published', verified:true,
//     tips:[
//       {en:'The on-site museum has limited hours — check before travelling out.', hi:'स्थल संग्रहालय के खुलने का समय सीमित है — यात्रा से पहले जांच लें।'},
//       {en:'Local guides can point out details not marked on-site.', hi:'स्थानीय गाइड स्थल पर अचिह्नित विवरण दिखा सकते हैं।'},
//     ],
//     sources:[
//       {organization:'Archaeological Survey of India', title:'Vikramshila Excavation Report', url:'https://asi.nic.in'},
//       {organization:'Ministry of Culture, Government of India', title:'Vikramshila Mahavihara', url:'https://www.indiaculture.gov.in'},
//     ]
//   },
//   {
//     id:'d4', slug:'barabar-caves', name_en:'Barabar Caves', name_hi:'बराबर गुफाएं',
//     state:'Bihar', district:'Jehanabad', category:'heritage', lat:25.0009, lng:85.0642,
//     short_en:'India\'s oldest surviving rock-cut caves, polished to a mirror finish.',
//     short_hi:'भारत की सबसे पुरानी जीवित शैल-कटी गुफाएं, दर्पण जैसी पॉलिश के साथ।',
//     about_en:'The Barabar Caves are carved directly into granite hills and are among the earliest examples of rock-cut architecture in India, notable for their smooth, polished interior walls achieved without modern tools.',
//     about_hi:'बराबर गुफाएं सीधे ग्रेनाइट पहाड़ियों में तराशी गई हैं और भारत में शैल-कटी वास्तुकला के प्रारंभिक उदाहरणों में से हैं, जो बिना आधुनिक औजारों के प्राप्त की गई चिकनी, पॉलिश आंतरिक दीवारों के लिए उल्लेखनीय हैं।',
//     history_en:'Inscriptions at the site date several of the caves to the reign of the Mauryan emperor Ashoka and his successor, dedicated to an ascetic sect. The caves later inspired the fictional Marabar Caves in E. M. Forster\'s writing, though the real site remains a quiet archaeological destination.',
//     history_hi:'स्थल पर शिलालेख कई गुफाओं को मौर्य सम्राट अशोक और उनके उत्तराधिकारी के शासनकाल का बताते हैं, जो एक तपस्वी संप्रदाय को समर्पित थीं।',
//     culture_en:'The caves remain remarkably uncrowded, offering visitors a direct, quiet encounter with Mauryan-era stonework rarely found elsewhere.',
//     culture_hi:'ये गुफाएं आज भी अपेक्षाकृत सुनसान हैं, जो आगंतुकों को मौर्य-युगीन पत्थर की कारीगरी से एक शांत और प्रत्यक्ष परिचय प्रदान करती हैं।',
//     best_time_en:'October to March.',
//     best_time_hi:'अक्टूबर से मार्च।',
//     cover_image:'', status:'published', verified:true,
//     tips:[
//       {en:'Carry a torch — interiors are dark even during the day.', hi:'टॉर्च साथ रखें — आंतरिक भाग दिन में भी अंधेरा रहता है।'},
//       {en:'The site has minimal facilities; plan food and water in advance.', hi:'स्थल पर सुविधाएं सीमित हैं; भोजन और पानी की योजना पहले से बनाएं।'},
//     ],
//     sources:[
//       {organization:'Archaeological Survey of India', title:'Barabar Hill Caves', url:'https://asi.nic.in'},
//       {organization:'Bihar Tourism', title:'Barabar Caves Visitor Guide', url:'https://tourism.bihar.gov.in'},
//     ]
//   },
//   {
//     id:'d5', slug:'kesaria-stupa', name_en:'Kesaria Stupa', name_hi:'केसरिया स्तूप',
//     state:'Bihar', district:'East Champaran', category:'heritage', lat:26.6167, lng:84.8667,
//     short_en:'Among the tallest known Buddhist stupas, still being uncovered.',
//     short_hi:'ज्ञात सबसे ऊंचे बौद्ध स्तूपों में से एक, जिसका उत्खनन अभी भी जारी है।',
//     about_en:'The Kesaria Stupa rises in tiered circular terraces and is considered one of the tallest Buddhist stupas discovered to date. Much of the structure remained buried under earth for centuries before systematic excavation began.',
//     about_hi:'केसरिया स्तूप स्तरित वृत्ताकार छतों में ऊंचा उठता है और अब तक खोजे गए सबसे ऊंचे बौद्ध स्तूपों में से एक माना जाता है।',
//     history_en:'Local tradition and early travel accounts connect the site to visits by the Buddha, and later Pala-era additions are visible in the stucco work. The Archaeological Survey of India has carried out phased excavation since the early 2000s, and large sections still lie unexcavated.',
//     history_hi:'स्थानीय परंपरा और प्रारंभिक यात्रा विवरण इस स्थल को बुद्ध की यात्राओं से जोड़ते हैं। भारतीय पुरातत्व सर्वेक्षण 2000 के दशक की शुरुआत से चरणबद्ध उत्खनन कर रहा है।',
//     culture_en:'Because excavation is ongoing, Kesaria offers a rare sense of an ancient monument still being brought to light, away from major tourist circuits.',
//     culture_hi:'चूंकि उत्खनन अभी भी जारी है, केसरिया एक प्राचीन स्मारक के धीरे-धीरे प्रकाश में आने का दुर्लभ अनुभव प्रदान करता है।',
//     best_time_en:'November to February.',
//     best_time_hi:'नवंबर से फरवरी।',
//     cover_image:'', status:'published', verified:true,
//     tips:[
//       {en:'Some sections remain active excavation zones — stay behind barriers.', hi:'कुछ हिस्से अभी भी सक्रिय उत्खनन क्षेत्र हैं — बैरियर के पीछे रहें।'},
//       {en:'Roads leading here can be narrow; allow extra travel time.', hi:'यहां जाने वाली सड़कें संकरी हो सकती हैं; अतिरिक्त यात्रा समय रखें।'},
//     ],
//     sources:[
//       {organization:'Archaeological Survey of India', title:'Kesaria Stupa Conservation Notes', url:'https://asi.nic.in'},
//       {organization:'Bihar Tourism', title:'Kesaria Stupa', url:'https://tourism.bihar.gov.in'},
//     ]
//   },
//   {
//     id:'d6', slug:'madhubani-art-village', name_en:'Madhubani Art Village (Jitwarpur)', name_hi:'मधुबनी कला गांव (जितवारपुर)',
//     state:'Bihar', district:'Madhubani', category:'art', lat:26.3500, lng:86.0700,
//     short_en:'A living village of Madhubani (Mithila) painting practised by local artists.',
//     short_hi:'स्थानीय कलाकारों द्वारा अभ्यासरत मधुबनी (मिथिला) चित्रकला का एक जीवंत गांव।',
//     about_en:'Jitwarpur and neighbouring hamlets near Madhubani town are home to generations of artists practising Madhubani painting — a distinctive folk style traditionally made with natural pigments and fine line work, originally painted on mud walls and now widely on paper and cloth.',
//     about_hi:'मधुबनी शहर के निकट जितवारपुर और आसपास के गांव पीढ़ियों से मधुबनी चित्रकला का अभ्यास करने वाले कलाकारों का घर हैं — यह एक विशिष्ट लोक शैली है जो पारंपरिक रूप से प्राकृतिक रंगों और बारीक रेखा कार्य से बनाई जाती है।',
//     history_en:'The painting tradition is closely tied to Mithila region rituals and household ceremonies, historically practised by women as wall and floor art. Recognition grew from the mid-20th century onward, and today many households in the area continue the craft and welcome visitors interested in the process.',
//     history_hi:'यह चित्रकला परंपरा मिथिला क्षेत्र के अनुष्ठानों और पारिवारिक समारोहों से गहराई से जुड़ी है, ऐतिहासिक रूप से महिलाओं द्वारा दीवार और फर्श कला के रूप में अभ्यास की जाती रही है।',
//     culture_en:'Visitors can watch artists at work, learn about natural pigment preparation, and purchase work directly from the households that make it — supporting the craft at its source.',
//     culture_hi:'आगंतुक कलाकारों को काम करते देख सकते हैं, प्राकृतिक रंग तैयार करने के बारे में जान सकते हैं, और सीधे उन परिवारों से कृतियां खरीद सकते हैं जो इसे बनाते हैं।',
//     best_time_en:'October to March.',
//     best_time_hi:'अक्टूबर से मार्च।',
//     cover_image:'', status:'published', verified:true,
//     tips:[
//       {en:'Ask before photographing artists at work inside homes.', hi:'घरों के अंदर काम करते कलाकारों की तस्वीर लेने से पहले अनुमति लें।'},
//       {en:'Buy directly from artists where possible to support local income.', hi:'स्थानीय आय का समर्थन करने के लिए जहां संभव हो सीधे कलाकारों से खरीदें।'},
//     ],
//     sources:[
//       {organization:'Ministry of Culture, Government of India', title:'Madhubani Painting — Intangible Heritage Note', url:'https://www.indiaculture.gov.in'},
//       {organization:'Bihar Tourism', title:'Madhubani Art Villages', url:'https://tourism.bihar.gov.in'},
//     ]
//   },
//   {
//     id:'d7', slug:'pawapuri', name_en:'Pawapuri', name_hi:'पावापुरी',
//     state:'Bihar', district:'Nalanda', category:'heritage', lat:25.0667, lng:85.5333,
//     short_en:'A Jain pilgrimage town centred on a lotus-covered water temple.',
//     short_hi:'एक कमल-आच्छादित जल मंदिर पर केंद्रित एक जैन तीर्थ नगर।',
//     about_en:'Pawapuri is regarded in Jain tradition as the place where Mahavira attained nirvana. Its centrepiece, the Jal Mandir, stands on a small island in a lotus-filled tank, reached by a stone causeway.',
//     about_hi:'पावापुरी को जैन परंपरा में वह स्थान माना जाता है जहां महावीर ने निर्वाण प्राप्त किया। इसका केंद्र बिंदु, जल मंदिर, कमल से भरे तालाब में एक छोटे द्वीप पर स्थित है।',
//     history_en:'The current temple structures were built in more recent centuries over a site with much older sacred significance, and the town remains an active pilgrimage centre for the Jain community, alongside several other temples nearby.',
//     history_hi:'वर्तमान मंदिर संरचनाएं हाल की शताब्दियों में एक ऐसे स्थल पर बनाई गईं जिसका बहुत पुराना पवित्र महत्व है, और यह नगर जैन समुदाय के लिए एक सक्रिय तीर्थ केंद्र बना हुआ है।',
//     culture_en:'The walk across the causeway at sunrise or sunset, with the water covered in lotus blooms in season, is considered one of the most tranquil experiences in the region.',
//     culture_hi:'सूर्योदय या सूर्यास्त के समय कमल के फूलों से ढके जल के ऊपर पुल पार करना क्षेत्र के सबसे शांत अनुभवों में से एक माना जाता है।',
//     best_time_en:'October to March; lotus bloom is best seen post-monsoon.',
//     best_time_hi:'अक्टूबर से मार्च; कमल का खिलना मानसून के बाद सबसे अच्छा दिखता है।',
//     cover_image:'', status:'published', verified:true,
//     tips:[
//       {en:'Remove leather items before entering temple premises, as per local custom.', hi:'स्थानीय रिवाज के अनुसार मंदिर परिसर में प्रवेश से पहले चमड़े की वस्तुएं हटा दें।'},
//       {en:'Maintain quiet on the causeway out of respect for pilgrims.', hi:'तीर्थयात्रियों के सम्मान में पुल पर शांति बनाए रखें।'},
//     ],
//     sources:[
//       {organization:'Bihar State Tourism Development Corporation', title:'Pawapuri Jal Mandir', url:'https://bstdc.bihar.gov.in'},
//     ]
//   },
//   {
//     id:'d8', slug:'vaishali', name_en:'Vaishali', name_hi:'वैशाली',
//     state:'Bihar', district:'Vaishali', category:'heritage', lat:25.9833, lng:85.1333,
//     short_en:'Seat of an early republic, marked by an intact Ashokan pillar.',
//     short_hi:'एक प्रारंभिक गणराज्य की राजधानी, जो एक अक्षुण्ण अशोक स्तंभ द्वारा चिह्नित है।',
//     about_en:'Vaishali is associated with the ancient Vajji confederacy, often cited as an early example of republican governance in the region. A well-preserved Ashokan pillar, topped with a lion capital, still stands near a stupa site linked to Buddhist tradition.',
//     about_hi:'वैशाली प्राचीन वज्जि संघ से जुड़ा है, जिसे अक्सर क्षेत्र में गणतांत्रिक शासन के प्रारंभिक उदाहरण के रूप में उद्धृत किया जाता है। एक अच्छी तरह से संरक्षित अशोक स्तंभ आज भी खड़ा है।',
//     history_en:'Excavated mounds around Vaishali point to a long occupation history from pre-Mauryan through Gupta periods. The site is also associated with events described in early Buddhist texts, including a visit by the Buddha shortly before his death.',
//     history_hi:'वैशाली के आसपास उत्खनित टीले मौर्य-पूर्व से गुप्त काल तक एक लंबे बसाव के इतिहास की ओर इशारा करते हैं।',
//     culture_en:'A site museum near the excavated area displays artefacts recovered from the mounds, giving useful context before walking the grounds.',
//     culture_hi:'उत्खनित क्षेत्र के पास एक स्थल संग्रहालय टीलों से प्राप्त कलाकृतियों को प्रदर्शित करता है।',
//     best_time_en:'November to February.',
//     best_time_hi:'नवंबर से फरवरी।',
//     cover_image:'', status:'draft', verified:false,
//     tips:[
//       {en:'Museum timings are limited on public holidays — check ahead.', hi:'सार्वजनिक छुट्टियों में संग्रहालय का समय सीमित होता है — पहले जांच लें।'},
//     ],
//     sources:[
//       {organization:'Archaeological Survey of India', title:'Vaishali Excavated Mounds', url:'https://asi.nic.in'},
//     ]
//   },
// ];

// /* ---------------- state & data loading ---------------- */
// let STATE = {
//   lang: 'en',
//   destinations: [],
//   route: parseHash(),
//   filters: { search:'', state:'', category:'', sort:'name' },
//   map: { instance:null, markers:[], userMarker:null, radius:50, userLoc:null },
//   admin: { loggedIn: !!getAdminToken() },
//   importDraft: { rows:null, step:1 },
// };

// async function loadData(){
//   try{
//     STATE.destinations = STATE.admin.loggedIn
//       ? await apiFetch('/api/admin/destinations')
//       : await apiFetch('/api/destinations');
//   }catch(e){
//     STATE.destinations = [];
//     showToast('⚠ ' + e.message);
//   }
// }

// function parseHash(){
//   const h = location.hash.replace('#','') || '/';
//   return h;
// }
// window.addEventListener('hashchange', () => { STATE.route = parseHash(); render(); });

// /* ---------------- helpers ---------------- */
// function t(obj, field){ return obj[field + '_' + STATE.lang] ?? obj[field + '_en'] ?? ''; }
// function categoryMeta(id){ return CATEGORIES.find(c=>c.id===id) || CATEGORIES[0]; }
// function fmtCategory(id){
//   const c = CATEGORIES.find(x=>x.id===id);
//   if(c) return STATE.lang==='hi' ? c.name_hi : c.name_en;
//   return id ? id.replace(/-/g,' ').replace(/\b\w/g, ch=>ch.toUpperCase()) : '';
// }
// function slugify(s){ return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
// function haversine(lat1,lng1,lat2,lng2){
//   const R=6371, toRad=d=>d*Math.PI/180;
//   const dLat=toRad(lat2-lat1), dLng=toRad(lng2-lng1);
//   const a=Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
//   return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
// }
// function showToast(msg){
//   const host = document.getElementById('toastHost');
//   const el = document.createElement('div');
//   el.className='toast'; el.textContent=msg;
//   host.appendChild(el);
//   setTimeout(()=>el.remove(), 2600);
// }
// function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
// function publishedDestinations(){ return STATE.destinations.filter(d=>d.status==='published'); }
// function findBySlug(slug){ return STATE.destinations.find(d=>d.slug===slug); }
// function findById(id){ return STATE.destinations.find(d=>d.id===id); }
// function uniqueStates(){ return [...new Set(STATE.destinations.map(d=>d.state))]; }

// /* ---------------- layout ---------------- */
// function navLink(href, label, activePrefix){
//   const active = STATE.route === activePrefix || STATE.route.startsWith(activePrefix + '/') ? 'active' : '';
//   return `<a class="${active}" href="#${href}">${label}</a>`;
// }
// function layout(content, opts={}){
//   const isAdmin = STATE.route.startsWith('/admin');
//   if(isAdmin) return content;
//   const L = STATE.lang;
//   return `
//   <div class="shell">
//     <header class="nav">
//       <div class="nav-inner">
//         <a class="brand" href="#/">
//           <span class="mark">🇮🇳</span>
//           <span>Hidden India</span>
//         </a>
//         <nav class="nav-links">
//           ${navLink('/explore', L==='hi'?'खोजें':'Explore', '/explore')}
//           ${navLink('/map', L==='hi'?'नक्शा':'Map', '/map')}
//           ${navLink('/explore?cat=all', L==='hi'?'संस्कृति':'Culture', '/culture')}
//         </nav>
//         <div class="nav-spacer"></div>
//         <div class="lang-toggle">
//           <button class="${L==='en'?'active':''}" onclick="setLang('en')">EN</button>
//           <button class="${L==='hi'?'active':''}" onclick="setLang('hi')">हिं</button>
//         </div>
//         <a class="btn btn-primary btn-sm nav-cta" href="#/map" style="white-space:nowrap;">📍 <span class="nav-cta-label">${L==='hi'?'पास खोजें':'Explore Near Me'}</span></a>
//         <a class="icon-btn" href="#/admin" title="Admin">⚙️</a>
//         <button class="hamburger" onclick="toggleMobileNav()" aria-label="Menu"><span></span><span></span><span></span></button>
//       </div>
//       <nav class="mobile-nav-panel" id="mobileNavPanel">
//         ${navLink('/explore', L==='hi'?'खोजें':'Explore', '/explore')}
//         ${navLink('/map', L==='hi'?'नक्शा':'Map', '/map')}
//         ${navLink('/explore?cat=all', L==='hi'?'संस्कृति':'Culture', '/culture')}
//       </nav>
//     </header>
//     <main data-hi="${L==='hi'}">${content}</main>
//     <footer>
//       <div class="footer-inner">
//         <div class="footer-brand">Hidden India</div>
//         <div class="footer-tagline">Discover • Understand • Respect</div>
//         <div class="footer-links">
//           <a href="#/explore">Explore</a>
//           <a href="#/map">Map</a>
//           <a href="#/explore">Responsible Tourism</a>
//           <a href="#/admin">Admin</a>
//         </div>
//         <div class="footer-bottom">© Hidden India — a heritage discovery demo. Verified with ASI, Ministry of Culture and state tourism sources.</div>
//       </div>
//     </footer>
//   </div>`;
// }

// /* ---------------- views: HOME ---------------- */
// function viewHome(){
//   const L = STATE.lang;
//   const featured = publishedDestinations().slice(0,6);
//   const chips = CATEGORIES.map(c => `
//     <a class="chip" href="#/explore?cat=${c.id}">
//       <div class="em">${c.icon}</div>
//       <div class="lbl">${L==='hi'?c.name_hi:c.name_en}</div>
//     </a>`).join('');
//   const cards = featured.map(cardHtml).join('');
//   return `
//   <section class="hero">
//     <svg class="hero-trail" viewBox="0 0 800 400" preserveAspectRatio="none"><path d="M0,320 C150,280 220,120 400,150 C550,175 600,300 800,220" stroke="white" stroke-width="2" fill="none" stroke-dasharray="6 10"/></svg>
//     <div class="seal"><div class="seal-inner">Verified · ASI · Ministry of Culture · Since Antiquity</div></div>
//     <div class="hero-inner">
//       <div class="eyebrow" style="color:#E7C99A;">Discover · Understand · Respect</div>
//       <h1>${L==='hi'?'वह भारत जो आपने अभी तक नहीं देखा':"Discover the India You Haven't Seen Yet."}</h1>
//       <p>${L==='hi'?'छुपी हुई विरासत, संस्कृति, पारंपरिक कला और उल्लेखनीय स्थलों का अन्वेषण करें — विश्वसनीय, सत्यापित जानकारी के साथ।':'Explore lesser-known heritage, culture, traditional art and remarkable places — backed by verified, structured information.'}</p>
//       <form class="hero-search" onsubmit="event.preventDefault(); location.hash='/explore?q='+encodeURIComponent(this.q.value);">
//         <input name="q" placeholder="${L==='hi'?'गंतव्य खोजें...':'Search destinations...'}" />
//         <button class="btn btn-primary" type="submit">${L==='hi'?'खोजें':'Search'}</button>
//       </form>
//       <div class="hero-actions">
//         <a class="btn btn-outline-light" href="#/map">📍 ${L==='hi'?'पास में खोजें':'Explore Near Me'}</a>
//       </div>
//     </div>
//   </section>

//   <section class="section wrap">
//     <div class="section-head"><h2>${L==='hi'?'अनुभव के अनुसार खोजें':'Explore by Experience'}</h2></div>
//     <div class="chips">${chips}</div>
//   </section>

//   <section class="section wrap" style="padding-top:0;">
//     <div class="section-head">
//       <h2>${L==='hi'?'चुनिंदा गंतव्य':'Featured Destinations'}</h2>
//       <a class="explore-link" href="#/explore">${L==='hi'?'सभी देखें →':'View all →'}</a>
//     </div>
//     ${featured.length ? `<div class="grid">${cards}</div>` : emptyState(L==='hi'?'अभी कोई प्रकाशित गंतव्य नहीं':'No published destinations yet')}
//   </section>

//   <section class="section wrap" style="padding-top:0;">
//     <div class="why-grid">
//       <div class="why-card"><div class="why-num">01</div><h3>${L==='hi'?'खोजें':'Discover'}</h3><p>${L==='hi'?'मुख्यधारा के पर्यटन से परे सांस्कृतिक रूप से महत्वपूर्ण स्थानों को खोजें।':'Find culturally important places beyond mainstream tourism.'}</p></div>
//       <div class="why-card"><div class="why-num">02</div><h3>${L==='hi'?'समझें':'Understand'}</h3><p>${L==='hi'?'संरचित ऐतिहासिक और सांस्कृतिक जानकारी तक पहुंचें।':'Access structured historical and cultural information, sourced and verified.'}</p></div>
//       <div class="why-card"><div class="why-num">03</div><h3>${L==='hi'?'सम्मान करें':'Respect'}</h3><p>${L==='hi'?'यात्रा से पहले जिम्मेदार पर्यटन प्रथाओं को जानें।':'Learn responsible tourism practices before you visit.'}</p></div>
//     </div>
//   </section>
//   `;
// }

// function cardHtml(d){
//   const L = STATE.lang;
//   const color = CATEGORY_COLORS[d.category] || '#8A5A34';
//   return `
//   <a class="card" href="#/destination/${d.slug}">
//     <div class="card-media" style="background:linear-gradient(135deg, ${color}, ${color}CC);">
//       ${d.cover_image ? `<img src="${escapeHtml(d.cover_image)}" alt="${escapeHtml(t(d,'name'))}" loading="lazy"/>` : CATEGORY_ICONS[d.category] || '🏛'}
//       <span class="badge" style="position:absolute;top:10px;left:10px;">${fmtCategory(d.category)}</span>
//       ${d.status==='draft' ? `<span class="status pill-draft" style="background:#fff;position:absolute;top:10px;right:10px;">${L==='hi'?'ड्राफ्ट':'Draft'}</span>` : ''}
//     </div>
//     <div class="card-body">
//       <h3 ${L==='hi'?'data-hi="1"':''}>${escapeHtml(t(d,'name'))}</h3>
//       <div class="card-loc">📍 ${escapeHtml(d.district)}, ${escapeHtml(d.state)}</div>
//       <div class="card-desc" ${L==='hi'?'data-hi="1"':''}>${escapeHtml(t(d,'short'))}</div>
//       <div class="card-foot">
//         <span class="explore-link">${L==='hi'?'अन्वेषण करें →':'Explore →'}</span>
//         ${d.verified ? '<span title="Verified" style="font-size:.78rem;color:#33513E;">✓ Verified</span>' : ''}
//       </div>
//     </div>
//   </a>`;
// }
// function emptyState(msg){
//   return `<div class="empty"><div class="em">🗺️</div><div>${msg}</div></div>`;
// }

// /* ---------------- views: EXPLORE ---------------- */
// function viewExplore(){
//   const L = STATE.lang;
//   const qs = new URLSearchParams(STATE.route.split('?')[1] || '');
//   if(qs.get('q') !== null) STATE.filters.search = qs.get('q');
//   if(qs.get('cat') !== null && qs.get('cat') !== 'all') STATE.filters.category = qs.get('cat');

//   let list = publishedDestinations();
//   const f = STATE.filters;
//   if(f.search) list = list.filter(d => (t(d,'name')+d.state+d.district).toLowerCase().includes(f.search.toLowerCase()));
//   if(f.state) list = list.filter(d => d.state === f.state);
//   if(f.category) list = list.filter(d => d.category === f.category);
//   if(f.sort === 'name') list.sort((a,b)=> t(a,'name').localeCompare(t(b,'name')));
//   if(f.sort === 'state') list.sort((a,b)=> a.state.localeCompare(b.state));

//   const stateOptions = uniqueStates().map(s=>`<option value="${s}" ${f.state===s?'selected':''}>${s}</option>`).join('');
//   const catOptions = CATEGORIES.map(c=>`<option value="${c.id}" ${f.category===c.id?'selected':''}>${L==='hi'?c.name_hi:c.name_en}</option>`).join('');

//   return `
//   <section class="wrap section">
//     <div class="section-head"><h2>${L==='hi'?'भारत की विरासत का अन्वेषण करें':"Explore India's Heritage"}</h2></div>
//     <div class="filters">
//       <div class="field search-field">
//         <label>${L==='hi'?'खोजें':'Search'}</label>
//         <input id="fSearch" type="text" placeholder="${L==='hi'?'गंतव्य खोजें...':'Search destination...'}" value="${escapeHtml(f.search)}" oninput="updateFilter('search', this.value)"/>
//       </div>
//       <div class="field">
//         <label>${L==='hi'?'राज्य':'State'}</label>
//         <select onchange="updateFilter('state', this.value)"><option value="">${L==='hi'?'सभी':'All'}</option>${stateOptions}</select>
//       </div>
//       <div class="field">
//         <label>${L==='hi'?'श्रेणी':'Category'}</label>
//         <select onchange="updateFilter('category', this.value)"><option value="">${L==='hi'?'सभी':'All'}</option>${catOptions}</select>
//       </div>
//       <div class="field">
//         <label>${L==='hi'?'क्रमबद्ध करें':'Sort'}</label>
//         <select onchange="updateFilter('sort', this.value)">
//           <option value="name" ${f.sort==='name'?'selected':''}>${L==='hi'?'नाम':'Name'}</option>
//           <option value="state" ${f.sort==='state'?'selected':''}>${L==='hi'?'राज्य':'State'}</option>
//         </select>
//       </div>
//       ${(f.search||f.state||f.category) ? `<button class="btn btn-ghost btn-sm" onclick="clearFilters()">${L==='hi'?'रीसेट':'Reset'}</button>` : ''}
//     </div>
//     <div class="result-count">${list.length} ${L==='hi'?'गंतव्य मिले':'destinations found'}</div>
//     ${list.length ? `<div class="grid">${list.map(cardHtml).join('')}</div>` : emptyState(L==='hi'?'आपकी खोज से मेल खाने वाला कोई गंतव्य नहीं मिला। फ़िल्टर समायोजित करके पुनः प्रयास करें।':'No destinations match your search. Try adjusting the filters.')}
//   </section>`;
// }
// window.updateFilter = function(key, val){
//   STATE.filters[key] = val;
//   renderApp();
//   setTimeout(()=>{ const el=document.getElementById('fSearch'); if(el && key==='search'){ el.focus(); el.setSelectionRange(el.value.length, el.value.length);} }, 0);
// };
// window.clearFilters = function(){ STATE.filters = {search:'', state:'', category:'', sort:'name'}; renderApp(); };

// /* ---------------- views: MAP ---------------- */
// function viewMap(){
//   const L = STATE.lang;
//   return `
//   <div class="map-layout">
//     <aside class="map-sidebar">
//       <h3 style="margin:0 0 4px;">${L==='hi'?'पास में खोजें':'Explore Nearby'}</h3>
//       <p style="font-size:0.82rem;color:var(--charcoal-soft);margin:0 0 14px;">${L==='hi'?'अपने आस-पास की छुपी विरासत खोजने के लिए स्थान की अनुमति दें।':"Allow location access to find hidden heritage near you."}</p>
//       <button class="btn btn-primary btn-sm" style="width:100%;justify-content:center;" onclick="locateMe()">📍 ${L==='hi'?'मेरा स्थान उपयोग करें':'Use My Location'}</button>
//       <div class="radius-row" id="radiusRow">
//         ${[10,25,50,100].map(r=>`<button class="${STATE.map.radius===r?'active':''}" onclick="setRadius(${r})">${r} km</button>`).join('')}
//       </div>
//       <div id="nearbyList"></div>
//     </aside>
//     <div id="googleMap"></div>
//   </div>`;
// }
// window.setRadius = function(r){ STATE.map.radius = r; updateNearbyList(); document.querySelectorAll('#radiusRow button').forEach(b=>b.classList.remove('active')); event.target.classList.add('active'); };
// window.locateMe = function(){
//   if(!navigator.geolocation){ showToast('Geolocation not supported in this browser'); return; }
//   showToast(STATE.lang==='hi' ? 'स्थान प्राप्त हो रहा है...' : 'Getting your location...');
//   navigator.geolocation.getCurrentPosition(pos=>{
//     STATE.map.userLoc = {lat:pos.coords.latitude, lng:pos.coords.longitude};
//     if(STATE.map.instance){
//       if(STATE.map.userMarker) STATE.map.instance.removeLayer(STATE.map.userMarker);
//       STATE.map.userMarker = L.circleMarker([STATE.map.userLoc.lat, STATE.map.userLoc.lng], {
//         radius: 8, color:'#fff', weight: 2, fillColor:'#BF5B34', fillOpacity:0.9
//       }).addTo(STATE.map.instance).bindTooltip('You are here');
//       STATE.map.instance.setView([STATE.map.userLoc.lat, STATE.map.userLoc.lng], 9);
//     }
//     updateNearbyList();
//   }, err=>{
//     showToast(STATE.lang==='hi' ? 'स्थान उपलब्ध नहीं — सामान्य ब्राउज़िंग जारी रखें' : 'Location unavailable — browse the map normally instead.');
//   });
// };
// function updateNearbyList(){
//   const host = document.getElementById('nearbyList');
//   if(!host) return;
//   if(!STATE.map.userLoc){
//     host.innerHTML = `<div style="font-size:0.82rem;color:var(--charcoal-soft);">${STATE.lang==='hi'?'दूरी देखने के लिए अपना स्थान साझा करें।':'Share your location to see distances.'}</div>`;
//     return;
//   }
//   const withDist = publishedDestinations().map(d=>({d, dist: haversine(STATE.map.userLoc.lat, STATE.map.userLoc.lng, d.lat, d.lng)}))
//     .filter(x=>x.dist <= STATE.map.radius).sort((a,b)=>a.dist-b.dist);
//   if(!withDist.length){ host.innerHTML = emptyState(STATE.lang==='hi'?'इस दायरे में कोई गंतव्य नहीं':'No destinations in this radius'); return; }
//   host.innerHTML = `<div style="font-size:0.8rem;font-weight:700;margin:14px 0 10px;">${withDist.length} ${STATE.lang==='hi'?'गंतव्य आपके पास':'destinations near you'}</div>` +
//     withDist.map(x=>`
//     <div class="nearby-item" onclick="location.hash='/destination/${x.d.slug}'">
//       <div class="nm">${escapeHtml(t(x.d,'name'))}</div>
//       <div class="dist">${x.dist.toFixed(1)} km ${STATE.lang==='hi'?'दूर':'away'}</div>
//     </div>`).join('');
// }
// function initMap(){
//   const el = document.getElementById('googleMap');
//   if(!el) return;
//   const qs = new URLSearchParams(STATE.route.split('?')[1] || '');
//   const focusLat = parseFloat(qs.get('lat'));
//   const focusLng = parseFloat(qs.get('lng'));
//   const focusSlug = qs.get('slug');
//   const hasFocus = !isNaN(focusLat) && !isNaN(focusLng);
//   loadGoogleMaps().then(()=>{
//     // route may have changed while the script was loading
//     if(document.getElementById('googleMap') !== el) return;
//     // If this container already has a Leaflet map on it (e.g. re-render), tear it down first.
//     if(el._leaflet_id){ el._leaflet_id = null; el.innerHTML = ''; }
//     const map = hasFocus ? L.map(el).setView([focusLat, focusLng], 12) : L.map(el).setView([25.6, 85.8], 8);
//     L.tileLayer(OSM_TILE_URL, { attribution: OSM_ATTRIBUTION, maxZoom: 19 }).addTo(map);
//     STATE.map.instance = map;
//     STATE.map.markers = [];
//     let focusMarker = null;
//     publishedDestinations().forEach(d=>{
//       const isFocused = focusSlug ? d.slug === focusSlug : (hasFocus && Math.abs(d.lat-focusLat)<0.0001 && Math.abs(d.lng-focusLng)<0.0001);
//       const color = CATEGORY_COLORS[d.category] || '#8A5A34';
//       const marker = L.circleMarker([d.lat, d.lng], {
//         radius: isFocused ? 13 : 9, color: isFocused ? '#BF5B34' : '#fff', weight: isFocused ? 3 : 2, fillColor: color, fillOpacity: 0.95
//       }).addTo(map);
//       marker.bindPopup(`
//         <div style="min-width:170px;font-family:'Inter',sans-serif;">
//           <div style="font-weight:700;margin-bottom:2px;">${escapeHtml(t(d,'name'))}</div>
//           <div style="font-size:12px;color:#5B534A;margin-bottom:8px;">${fmtCategory(d.category)} · ${escapeHtml(d.district)}</div>
//           <a href="#/destination/${d.slug}" style="font-size:12px;font-weight:700;color:#9C4726;">View Details →</a>
//         </div>`);
//       STATE.map.markers.push(marker);
//       if(isFocused) focusMarker = marker;
//     });
//     if(focusMarker) focusMarker.openPopup();
//     updateNearbyList();
//   }).catch(()=>{
//     el.innerHTML = `<div style="padding:24px;font-size:0.85rem;color:var(--charcoal-soft);">${STATE.lang==='hi'?'मानचित्र लोड नहीं हो सका। कृपया अपना इंटरनेट कनेक्शन जांचें।':'Map failed to load. Please check your internet connection.'}</div>`;
//   });
// }

// /* ---------------- views: DESTINATION DETAIL ---------------- */
// function viewDestination(slug){
//   const L = STATE.lang;
//   const d = findBySlug(slug);
//   if(!d || (d.status !== 'published')){
//     return `<div class="wrap section">${emptyState(L==='hi'?'गंतव्य नहीं मिला (404)':'Destination not found (404)')}<div style="text-align:center;"><a class="btn btn-primary" href="#/explore">${L==='hi'?'अन्वेषण पर वापस जाएं':'Back to Explore'}</a></div></div>`;
//   }
//   const color = CATEGORY_COLORS[d.category] || '#8A5A34';
//   const tips = (d.tips||[]).map(tp=>`<div class="tip-row"><span class="tick">✓</span><span>${escapeHtml(L==='hi'?tp.hi:tp.en)}</span></div>`).join('');
//   const sources = (d.sources||[]).map(s=>`
//     <div class="source-card">
//       <div><div class="org">${escapeHtml(s.organization)}</div><div class="sub">${escapeHtml(s.title)}</div></div>
//       <a class="btn btn-ghost btn-sm" href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">↗</a>
//     </div>`).join('');
//   const nearby = (d.nearby||[]).map(n=>`
//     <div class="source-card">
//       <div>
//         <div class="org">${escapeHtml(n.name)}</div>
//         <div class="sub">${escapeHtml(n.note||'')}</div>
//       </div>
//       ${n.distance ? `<span style="font-size:0.78rem;font-weight:700;color:var(--terracotta-deep);white-space:nowrap;">${escapeHtml(n.distance)}</span>` : ''}
//     </div>`).join('');
//   return `
//   <div class="wrap section">
//     <div class="breadcrumb"><a href="#/">Home</a> / <a href="#/explore">Explore</a> / ${escapeHtml(t(d,'name'))}</div>
//     <div class="detail-hero" style="${d.cover_image ? `background-image:linear-gradient(135deg, ${color}55, ${color}22), url('${escapeHtml(d.cover_image)}');` : `background:linear-gradient(135deg, ${color}, ${color}AA);`}">
//       ${d.cover_image ? '' : `<span class="em">${CATEGORY_ICONS[d.category]||'🏛'}</span>`}
//       <div class="hero-content">
//         <span class="cat-badge">${fmtCategory(d.category)}</span>
//         <h1 ${L==='hi'?'data-hi="1"':''}>${escapeHtml(t(d,'name'))}</h1>
//         <div class="loc">📍 ${escapeHtml(d.district)}, ${escapeHtml(d.state)}</div>
//       </div>
//     </div>
//     <div class="detail-actions">
//       <a class="btn btn-primary" href="#/map?lat=${d.lat}&lng=${d.lng}&slug=${encodeURIComponent(d.slug)}">🗺️ ${L==='hi'?'नक्शे पर देखें':'View on Map'}</a>
//       <a class="btn btn-ghost" href="https://www.openstreetmap.org/directions?to=${d.lat}%2C${d.lng}" target="_blank" rel="noopener noreferrer">🧭 ${L==='hi'?'दिशा प्राप्त करें':'Get Directions'}</a>
//     </div>
//     <div class="detail-layout">
//       <div class="prose" data-hi="${L==='hi'}">
//         <h2>${L==='hi'?'परिचय':'About'}</h2>
//         <p>${escapeHtml(t(d,'about'))}</p>
//         <h2>${L==='hi'?'इतिहास':'History'}</h2>
//         <p>${escapeHtml(t(d,'history'))}</p>
//         <h2>${L==='hi'?'सांस्कृतिक महत्व':'Cultural Significance'}</h2>
//         <p>${escapeHtml(t(d,'culture'))}</p>
//         <h2>${L==='hi'?'क्या अनुभव करें':'What to Experience'}</h2>
//         <div class="experience-cards">
//           <div class="exp-card">🏛 ${L==='hi'?'वास्तुकला':'Architecture'}</div>
//           <div class="exp-card">📜 ${L==='hi'?'इतिहास':'History'}</div>
//           <div class="exp-card">🎨 ${L==='hi'?'स्थानीय संस्कृति':'Local Culture'}</div>
//           <div class="exp-card">🧑‍🤝‍🧑 ${L==='hi'?'समुदाय':'Community'}</div>
//         </div>
//         <h2>${L==='hi'?'यात्रा का सर्वोत्तम समय':'Best Time to Visit'}</h2>
//         <p>${escapeHtml(t(d,'best_time'))}</p>
//         ${(d.images && d.images.length) ? `
//         <h2>${L==='hi'?'तस्वीरें':'Photos'}</h2>
//         <div class="gallery-grid">
//           ${d.images.map(img=>`<img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.alt||t(d,'name'))}" onclick="openImageLightbox(this.src)"/>`).join('')}
//         </div>` : ''}
//       </div>
//       <div class="sidebar">
//         <div class="side-card">
//           <h3>🌱 ${L==='hi'?'जिम्मेदारी से यात्रा करें':'Travel Responsibly'}</h3>
//           ${tips || `<div style="font-size:0.85rem;color:var(--charcoal-soft);">${L==='hi'?'इस गंतव्य के लिए कोई विशेष दिशानिर्देश दर्ज नहीं किए गए।':'No destination-specific guidelines recorded yet.'}</div>`}
//         </div>
//         <div class="side-card">
//           <h3>📚 ${L==='hi'?'सत्यापित जानकारी':'Verified Information'}</h3>
//           ${d.verified ? `<div class="verified-strip">✓ ${L==='hi'?'सत्यापित सूत्रों से संकलित':'Compiled from verified sources'}</div>` : ''}
//           ${sources || `<div style="font-size:0.85rem;color:var(--charcoal-soft);">${L==='hi'?'कोई सूत्र दर्ज नहीं':'No sources recorded'}</div>`}
//         </div>
//         <div class="side-card">
//           <h3>📍 ${L==='hi'?'आस-पास के प्रसिद्ध स्थान':'Nearby Places'}</h3>
//           ${nearby || `<div style="font-size:0.85rem;color:var(--charcoal-soft);">${L==='hi'?'अभी कोई आस-पास का स्थान दर्ज नहीं किया गया':'No nearby places added yet.'}</div>`}
//         </div>
//       </div>
//     </div>
//   </div>`;
// }

// /* ---------------- ADMIN: login ---------------- */
// function viewAdminLogin(loginError){
//   return `
//   <div class="admin-login-wrap">
//     <div class="admin-login-card">
//       <h1>Hidden India Admin</h1>
//       <p class="hint">Sign in with your admin account.</p>
//       ${loginError ? `<div class="form-error">${escapeHtml(loginError)}</div>` : ''}
//       <form onsubmit="return adminLogin(event)">
//         <div class="form-group"><label>Email</label><input name="email" type="email" required/></div>
//         <div class="form-group"><label>Password</label><input name="password" type="password" required/></div>
//         <button class="btn btn-primary" type="submit" style="width:100%;justify-content:center;">Login</button>
//       </form>
//       <div style="margin-top:16px;text-align:center;"><a href="#/" style="font-size:0.82rem;color:var(--charcoal-soft);">← Back to site</a></div>
//     </div>
//   </div>`;
// }
// window.adminLogin = async function(e){
//   e.preventDefault();
//   const f = e.target;
//   try{
//     const { token } = await apiFetch('/api/auth/login', {
//       method: 'POST',
//       body: JSON.stringify({ email: f.email.value.trim(), password: f.password.value }),
//     });
//     setAdminToken(token);
//     STATE.admin.loggedIn = true;
//     await loadData();
//     location.hash = '/admin/dashboard';
//     renderApp();
//   } catch(err) {
//     renderApp(err.message || 'Invalid email or password.');
//   }
//   return false;
// };
// window.adminLogout = async function(){
//   setAdminToken(null);
//   STATE.admin.loggedIn = false;
//   await loadData();
//   location.hash = '/admin';
// };

// /* ---------------- ADMIN: shell ---------------- */
// function adminTab(href,label){
//   const active = STATE.route === href ? 'active' : '';
//   return `<a class="${active}" href="#${href}">${label}</a>`;
// }
// function adminLayout(content){
//   return `
//   <div class="admin-shell">
//     <div class="admin-topbar">
//       <strong style="font-family:'Fraunces',serif;">🇮🇳 Hidden India Admin</strong>
//       <div class="admin-tabs">
//         ${adminTab('/admin/dashboard','Dashboard')}
//         ${adminTab('/admin/destinations','Destinations')}
//         ${adminTab('/admin/import','Import Data')}
//       </div>
//       <div style="flex:1;"></div>
//       <a href="#/" class="btn btn-outline-light btn-sm">View Site</a>
//       <button class="btn btn-outline-light btn-sm" onclick="adminLogout()">Logout</button>
//     </div>
//     <div class="admin-body">${content}</div>
//   </div>`;
// }

// function viewAdminDashboard(){
//   const total = STATE.destinations.length;
//   const published = STATE.destinations.filter(d=>d.status==='published').length;
//   const drafts = total - published;
//   const sources = STATE.destinations.reduce((n,d)=>n+(d.sources?.length||0),0);
//   const recent = [...STATE.destinations].sort((a,b)=> (b.updated_at||0)-(a.updated_at||0)).slice(0,6);
//   return adminLayout(`
//     <div class="admin-toolbar">
//       <h2 style="margin:0;">Dashboard</h2>
//       <div style="display:flex;gap:10px;">
//         <a class="btn btn-primary btn-sm" href="#" onclick="openDestinationModal(); return false;">+ Add Destination</a>
//         <a class="btn btn-ghost btn-sm" href="#/admin/import">+ Import Data</a>
//       </div>
//     </div>
//     <div class="stat-grid">
//       <div class="stat-card"><div class="n">${total}</div><div class="l">Destinations</div></div>
//       <div class="stat-card"><div class="n">${published}</div><div class="l">Published</div></div>
//       <div class="stat-card"><div class="n">${drafts}</div><div class="l">Drafts</div></div>
//       <div class="stat-card"><div class="n">${sources}</div><div class="l">Verified Sources</div></div>
//       <div class="stat-card"><div class="n">${CATEGORIES.length}</div><div class="l">Categories</div></div>
//     </div>
//     <div class="table-wrap">
//       <table>
//         <thead><tr><th>Destination</th><th>State</th><th>Status</th><th></th></tr></thead>
//         <tbody>
//           ${recent.map(d=>`<tr>
//             <td>${escapeHtml(d.name_en)}</td><td>${escapeHtml(d.state)}</td>
//             <td><span class="status-pill ${d.status==='published'?'pill-published':'pill-draft'}">${d.status}</span></td>
//             <td><button onclick="openDestinationModal('${d.id}')">Edit</button></td>
//           </tr>`).join('')}
//         </tbody>
//       </table>
//     </div>
//   `);
// }

// function viewAdminDestinations(){
//   const list = STATE.destinations;
//   return adminLayout(`
//     <div class="admin-toolbar">
//       <h2 style="margin:0;">Destinations</h2>
//       <button class="btn btn-primary btn-sm" onclick="openDestinationModal()">+ Add Destination</button>
//     </div>
//     <div class="table-wrap">
//       <table>
//         <thead><tr><th>Destination</th><th>State</th><th>Category</th><th>Status</th><th>Verified</th><th>Actions</th></tr></thead>
//         <tbody>
//           ${list.map(d=>`<tr>
//             <td>${escapeHtml(d.name_en)}</td>
//             <td>${escapeHtml(d.state)}</td>
//             <td>${fmtCategory(d.category)}</td>
//             <td><span class="status-pill ${d.status==='published'?'pill-published':'pill-draft'}">${d.status}</span></td>
//             <td>${d.verified?'✓':'—'}</td>
//             <td class="row-actions">
//               <button onclick="openDestinationModal('${d.id}')">Edit</button>
//               <a href="#/destination/${d.slug}" target="_blank"><button>Preview</button></a>
//               <button onclick="togglePublish('${d.id}')">${d.status==='published'?'Unpublish':'Publish'}</button>
//               <button onclick="deleteDestination('${d.id}')" style="color:#A8412E;">Delete</button>
//             </td>
//           </tr>`).join('')}
//         </tbody>
//       </table>
//     </div>
//   `);
// }

// window.togglePublish = async function(id){
//   const d = findById(id); if(!d) return;
//   const newStatus = d.status==='published' ? 'draft' : 'published';
//   try{
//     await apiFetch(`/api/admin/destinations/${id}`, { method:'PUT', body: JSON.stringify({ status:newStatus }) });
//     await loadData(); renderApp();
//     showToast(`${d.name_en} ${newStatus==='published'?'published':'unpublished'}.`);
//   }catch(e){ showToast('⚠ ' + e.message); }
// };
// window.deleteDestination = async function(id){
//   const d = findById(id); if(!d) return;
//   if(!confirm(`Delete "${d.name_en}"? This cannot be undone.`)) return;
//   try{
//     await apiFetch(`/api/admin/destinations/${id}`, { method:'DELETE' });
//     await loadData(); renderApp();
//     closeModal();
//     showToast('Destination deleted.');
//   }catch(e){ showToast('⚠ ' + e.message); }
// };

// /* ---------------- ADMIN: destination form modal ---------------- */
// window.openDestinationModal = function(id){
//   const d = id ? findById(id) : null;
//   const isEdit = !!d;
//   const v = d || {name_en:'',name_hi:'',state:'',district:'',category:'heritage',lat:'',lng:'',
//     short_en:'',short_hi:'',about_en:'',about_hi:'',history_en:'',history_hi:'',culture_en:'',culture_hi:'',
//     best_time_en:'',best_time_hi:'',cover_image:'', status:'draft', verified:false,
//     tips:[{en:'',hi:''}], sources:[{organization:'',title:'',url:''}], nearby:[{name:'',distance:'',note:''}]};
//   window.__modalImages = { cover: v.cover_image || '', gallery: JSON.parse(JSON.stringify(v.images||[])) };
//   const catOpts = CATEGORIES.map(c=>`<option value="${c.id}" ${v.category===c.id?'selected':''}>${c.name_en}</option>`).join('');
//   const tipsHtml = v.tips.map((tp,i)=>`
//     <div class="dynamic-row" data-tip-row>
//       <input placeholder="Tip (English)" value="${escapeHtml(tp.en)}" data-tip-en/>
//       <input placeholder="Tip (Hindi)" value="${escapeHtml(tp.hi||'')}" data-tip-hi/>
//       <button type="button" class="remove-row" onclick="this.closest('[data-tip-row]').remove()">✕</button>
//     </div>`).join('');
//   const sourcesHtml = v.sources.map((s,i)=>`
//     <div class="dynamic-row" data-source-row>
//       <input placeholder="Organization" value="${escapeHtml(s.organization)}" data-src-org/>
//       <input placeholder="Title" value="${escapeHtml(s.title)}" data-src-title/>
//       <input placeholder="URL" value="${escapeHtml(s.url)}" data-src-url/>
//       <button type="button" class="remove-row" onclick="this.closest('[data-source-row]').remove()">✕</button>
//     </div>`).join('');
//   const nearbyHtml = (v.nearby||[]).map((n,i)=>`
//     <div class="dynamic-row" data-nearby-row>
//       <input placeholder="Place name" value="${escapeHtml(n.name)}" data-nearby-name/>
//       <input placeholder="Distance (e.g. 12 km)" value="${escapeHtml(n.distance||'')}" data-nearby-distance/>
//       <input placeholder="Short note" value="${escapeHtml(n.note||'')}" data-nearby-note/>
//       <button type="button" class="remove-row" onclick="this.closest('[data-nearby-row]').remove()">✕</button>
//     </div>`).join('');

//   const modalHtml = `
//   <div class="modal-overlay" id="destModalOverlay" onclick="if(event.target===this) closeModal()">
//     <div class="modal">
//       <button class="close-x" onclick="closeModal()">✕</button>
//       <h2>${isEdit?'Edit Destination':'Add Destination'}</h2>
//       <p style="font-size:0.82rem;color:var(--charcoal-soft);margin:0 0 6px;">Fields marked EN/HI are stored separately so the public site never needs live translation.</p>
//       <form id="destForm" onsubmit="return saveDestination(event, '${id||''}')">
//         <div class="form-section-title">Basic Information</div>
//         <div class="form-grid">
//           <div class="form-group"><label>Name (English)</label><input name="name_en" required value="${escapeHtml(v.name_en)}"/></div>
//           <div class="form-group"><label>Name (Hindi)</label><input name="name_hi" value="${escapeHtml(v.name_hi)}"/></div>
//           <div class="form-group"><label>State</label><input name="state" required value="${escapeHtml(v.state)}"/></div>
//           <div class="form-group"><label>District</label><input name="district" required value="${escapeHtml(v.district)}"/></div>
//           <div class="form-group">
//             <label>Category</label>
//             <select name="category" onchange="toggleCustomCategory(this.value)">${catOpts}<option value="__custom__">+ Naya category likhein</option></select>
//             <input type="text" id="customCategoryInput" placeholder="Naya category ka naam" style="display:none;margin-top:8px;"/>
//           </div>
//           <div class="form-group"><label>Latitude</label><input name="lat" type="number" step="any" required value="${v.lat}"/></div>
//           <div class="form-group"><label>Longitude</label><input name="lng" type="number" step="any" required value="${v.lng}"/></div>
//         </div>

//         <div class="form-section-title">Images</div>
//         <div class="form-grid">
//           <div class="form-group">
//             <label>Cover Image</label>
//             <div id="coverUploadBox" class="img-upload-box ${v.cover_image?'has-image':''}" onclick="if(event.target.tagName!=='BUTTON') document.getElementById('coverFileInput').click()">
//               ${v.cover_image ? `<img src="${escapeHtml(v.cover_image)}" alt="cover preview"/><button type="button" class="img-remove-btn" onclick="event.stopPropagation(); removeCoverImage()">✕</button>` : `<div class="up-hint">📷<br/>Click to upload a cover photo<br/><span style="font-size:0.72rem;">JPG/PNG, auto-resized</span></div>`}
//             </div>
//             <input type="file" id="coverFileInput" accept="image/*" style="display:none;" onchange="handleCoverFile(this.files[0])"/>
//             <div id="coverUploadStatus" class="upload-progress"></div>
//             <label style="margin-top:10px;">or paste an image URL</label>
//             <input id="coverUrlInput" placeholder="https://..." value="${(v.cover_image||'').startsWith('data:') ? '' : escapeHtml(v.cover_image||'')}" oninput="setCoverFromUrl(this.value)"/>
//           </div>
//           <div class="form-group">
//             <label>Additional Photos (gallery)</label>
//             <div id="galleryGrid" class="gallery-upload-grid">
//               ${(v.images||[]).map((img,i)=>`<div class="gallery-thumb" data-gallery-idx="${i}"><img src="${escapeHtml(img.url)}"/><button type="button" class="img-remove-btn" onclick="removeGalleryImage(${i})">✕</button></div>`).join('')}
//               <div class="gallery-add-btn" onclick="document.getElementById('galleryFileInput').click()">+</div>
//             </div>
//             <input type="file" id="galleryFileInput" accept="image/*" multiple style="display:none;" onchange="handleGalleryFiles(this.files)"/>
//             <div id="galleryUploadStatus" class="upload-progress"></div>
//           </div>
//         </div>

//         <div class="form-section-title">Content</div>
//         <div class="form-grid">
//           <div class="form-group"><label>Short Description (EN)</label><textarea name="short_en" required>${escapeHtml(v.short_en)}</textarea></div>
//           <div class="form-group"><label>Short Description (HI)</label><textarea name="short_hi">${escapeHtml(v.short_hi)}</textarea></div>
//           <div class="form-group"><label>About (EN)</label><textarea name="about_en" required>${escapeHtml(v.about_en)}</textarea></div>
//           <div class="form-group"><label>About (HI)</label><textarea name="about_hi">${escapeHtml(v.about_hi)}</textarea></div>
//           <div class="form-group"><label>History (EN)</label><textarea name="history_en">${escapeHtml(v.history_en)}</textarea></div>
//           <div class="form-group"><label>History (HI)</label><textarea name="history_hi">${escapeHtml(v.history_hi)}</textarea></div>
//           <div class="form-group"><label>Cultural Significance (EN)</label><textarea name="culture_en">${escapeHtml(v.culture_en)}</textarea></div>
//           <div class="form-group"><label>Cultural Significance (HI)</label><textarea name="culture_hi">${escapeHtml(v.culture_hi)}</textarea></div>
//           <div class="form-group"><label>Best Time to Visit (EN)</label><input name="best_time_en" value="${escapeHtml(v.best_time_en)}"/></div>
//           <div class="form-group"><label>Best Time to Visit (HI)</label><input name="best_time_hi" value="${escapeHtml(v.best_time_hi)}"/></div>
//         </div>
//         <div class="form-section-title">Responsible Tourism Tips</div>
//         <div id="tipsList">${tipsHtml}</div>
//         <button type="button" class="btn btn-ghost btn-sm" onclick="addDynamicRow('tipsList','tip')">+ Add Tip</button>

//         <div class="form-section-title">Verified Sources</div>
//         <div id="sourcesList">${sourcesHtml}</div>
//         <button type="button" class="btn btn-ghost btn-sm" onclick="addDynamicRow('sourcesList','source')">+ Add Source</button>

//         <div class="form-section-title">Nearby Places</div>
//         <div id="nearbyList2">${nearbyHtml}</div>
//         <button type="button" class="btn btn-ghost btn-sm" onclick="addDynamicRow('nearbyList2','nearby')">+ Add Nearby Place</button>

//         <div class="form-section-title">Publishing</div>
//         <div class="form-grid">
//           <div class="form-group"><label>Status</label><select name="status"><option value="draft" ${v.status==='draft'?'selected':''}>Draft</option><option value="published" ${v.status==='published'?'selected':''}>Published</option></select></div>
//           <div class="form-group"><label style="display:flex;align-items:center;gap:8px;font-weight:600;text-transform:none;letter-spacing:0;"><input type="checkbox" name="verified" style="width:auto;" ${v.verified?'checked':''}/> Information verified</label></div>
//         </div>
//         <div class="modal-actions">
//           <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
//           ${isEdit ? `<button type="button" class="btn" style="color:#A8412E;" onclick="deleteDestination('${id}')">Delete</button>` : ''}
//           <button type="submit" class="btn btn-primary">${isEdit?'Save Changes':'Add Destination'}</button>
//         </div>
//       </form>
//     </div>
//   </div>`;
//   document.body.insertAdjacentHTML('beforeend', modalHtml);
// };
// window.addDynamicRow = function(listId, kind){
//   const el = document.getElementById(listId);
//   const row = document.createElement('div');
//   if(kind==='tip'){
//     row.className='dynamic-row'; row.setAttribute('data-tip-row','');
//     row.innerHTML = `<input placeholder="Tip (English)" data-tip-en/><input placeholder="Tip (Hindi)" data-tip-hi/><button type="button" class="remove-row" onclick="this.closest('[data-tip-row]').remove()">✕</button>`;
//   } else if(kind==='nearby'){
//     row.className='dynamic-row'; row.setAttribute('data-nearby-row','');
//     row.innerHTML = `<input placeholder="Place name" data-nearby-name/><input placeholder="Distance (e.g. 12 km)" data-nearby-distance/><input placeholder="Short note" data-nearby-note/><button type="button" class="remove-row" onclick="this.closest('[data-nearby-row]').remove()">✕</button>`;
//   } else {
//     row.className='dynamic-row'; row.setAttribute('data-source-row','');
//     row.innerHTML = `<input placeholder="Organization" data-src-org/><input placeholder="Title" data-src-title/><input placeholder="URL" data-src-url/><button type="button" class="remove-row" onclick="this.closest('[data-source-row]').remove()">✕</button>`;
//   }
//   el.appendChild(row);
// };
// window.toggleCustomCategory = function(val){
//   const box = document.getElementById('customCategoryInput');
//   if(box) box.style.display = val === '__custom__' ? 'block' : 'none';
// };
// /* ---- image upload helpers ---- */
// function compressImageFile(file, maxWidth, quality){
//   return new Promise((resolve, reject)=>{
//     if(!file.type.startsWith('image/')){ reject(new Error('Not an image file')); return; }
//     const reader = new FileReader();
//     reader.onerror = () => reject(new Error('Could not read file'));
//     reader.onload = () => {
//       const img = new Image();
//       img.onerror = () => reject(new Error('Could not decode image'));
//       img.onload = () => {
//         const scale = Math.min(1, maxWidth / img.width);
//         const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
//         const canvas = document.createElement('canvas');
//         canvas.width = w; canvas.height = h;
//         canvas.getContext('2d').drawImage(img, 0, 0, w, h);
//         resolve(canvas.toDataURL('image/jpeg', quality));
//       };
//       img.src = reader.result;
//     };
//     reader.readAsDataURL(file);
//   });
// }
// window.setCoverFromUrl = function(url){
//   window.__modalImages.cover = url.trim();
//   const box = document.getElementById('coverUploadBox');
//   if(!box) return;
//   if(window.__modalImages.cover){
//     box.classList.add('has-image');
//     box.innerHTML = `<img src="${escapeHtml(window.__modalImages.cover)}" alt="cover preview" onerror="this.parentElement.classList.remove('has-image'); this.parentElement.innerHTML='<div class=up-hint>⚠️ Could not load that URL</div>';"/><button type="button" class="img-remove-btn" onclick="event.stopPropagation(); removeCoverImage()">✕</button>`;
//   }
// };
// window.handleCoverFile = async function(file){
//   if(!file) return;
//   const statusEl = document.getElementById('coverUploadStatus');
//   statusEl.textContent = 'Processing image…';
//   try{
//     const dataUrl = await compressImageFile(file, 1200, 0.82);
//     window.__modalImages.cover = dataUrl;
//     const box = document.getElementById('coverUploadBox');
//     box.classList.add('has-image');
//     box.innerHTML = `<img src="${dataUrl}" alt="cover preview"/><button type="button" class="img-remove-btn" onclick="event.stopPropagation(); removeCoverImage()">✕</button>`;
//     const urlInput = document.getElementById('coverUrlInput'); if(urlInput) urlInput.value = '';
//     statusEl.textContent = `Uploaded — ${Math.round(dataUrl.length/1024)} KB`;
//   }catch(err){
//     statusEl.textContent = 'Could not process that image. Try a smaller JPG or PNG.';
//   }
// };
// window.removeCoverImage = function(){
//   window.__modalImages.cover = '';
//   const box = document.getElementById('coverUploadBox');
//   box.classList.remove('has-image');
//   box.innerHTML = `<div class="up-hint">📷<br/>Click to upload a cover photo<br/><span style="font-size:0.72rem;">JPG/PNG, auto-resized</span></div>`;
//   const urlInput = document.getElementById('coverUrlInput'); if(urlInput) urlInput.value = '';
//   document.getElementById('coverUploadStatus').textContent = '';
// };
// window.handleGalleryFiles = async function(files){
//   const statusEl = document.getElementById('galleryUploadStatus');
//   statusEl.textContent = `Processing ${files.length} image(s)…`;
//   for(const file of files){
//     try{
//       const dataUrl = await compressImageFile(file, 1000, 0.8);
//       window.__modalImages.gallery.push({ url: dataUrl, alt: '', is_cover:false });
//     }catch(err){ /* skip file that fails */ }
//   }
//   renderGalleryGrid();
//   statusEl.textContent = `${window.__modalImages.gallery.length} photo(s) added.`;
// };
// window.removeGalleryImage = function(i){
//   window.__modalImages.gallery.splice(i,1);
//   renderGalleryGrid();
// };
// function renderGalleryGrid(){
//   const grid = document.getElementById('galleryGrid');
//   if(!grid) return;
//   grid.innerHTML = window.__modalImages.gallery.map((img,i)=>
//     `<div class="gallery-thumb" data-gallery-idx="${i}"><img src="${img.url}"/><button type="button" class="img-remove-btn" onclick="removeGalleryImage(${i})">✕</button></div>`
//   ).join('') + `<div class="gallery-add-btn" onclick="document.getElementById('galleryFileInput').click()">+</div>`;
// }

// window.closeModal = function(){ const m = document.getElementById('destModalOverlay'); if(m) m.remove(); window.__modalImages = null; };
// window.toggleMobileNav = function(){
//   const panel = document.getElementById('mobileNavPanel');
//   const btn = document.querySelector('.hamburger');
//   if(!panel) return;
//   panel.classList.toggle('open');
//   if(btn) btn.classList.toggle('open');
// };
// window.openImageLightbox = function(src){
//   const old = document.getElementById('imgLightboxOverlay'); if(old) old.remove();
//   const overlay = document.createElement('div');
//   overlay.className = 'modal-overlay';
//   overlay.id = 'imgLightboxOverlay';
//   overlay.onclick = function(e){ if(e.target === overlay) window.closeImageLightbox(); };
//   const img = document.createElement('img');
//   img.src = src;
//   img.style.cssText = 'max-width:92vw;max-height:92vh;border-radius:8px;object-fit:contain;display:block;';
//   const btn = document.createElement('button');
//   btn.className = 'close-x';
//   btn.style.cssText = 'position:fixed;top:20px;right:24px;';
//   btn.textContent = '✕';
//   btn.onclick = function(){ window.closeImageLightbox(); };
//   overlay.appendChild(img);
//   overlay.appendChild(btn);
//   document.body.appendChild(overlay);
// };
// window.closeImageLightbox = function(){
//   const o = document.getElementById('imgLightboxOverlay'); if(o) o.remove();
// };

// window.saveDestination = async function(e, id){
//   e.preventDefault();
//   const f = e.target;
//   const fd = new FormData(f);
//   const tips = [...document.querySelectorAll('[data-tip-row]')].map(r=>({
//     en: r.querySelector('[data-tip-en]').value.trim(), hi: r.querySelector('[data-tip-hi]').value.trim()
//   })).filter(t=>t.en);
//   const sources = [...document.querySelectorAll('[data-source-row]')].map(r=>({
//     organization: r.querySelector('[data-src-org]').value.trim(),
//     title: r.querySelector('[data-src-title]').value.trim(),
//     url: r.querySelector('[data-src-url]').value.trim(),
//   })).filter(s=>s.organization);
//   const nearby = [...document.querySelectorAll('[data-nearby-row]')].map(r=>({
//     name: r.querySelector('[data-nearby-name]').value.trim(),
//     distance: r.querySelector('[data-nearby-distance]').value.trim(),
//     note: r.querySelector('[data-nearby-note]').value.trim(),
//   })).filter(n=>n.name);

//   const data = {
//     name_en: fd.get('name_en').trim(), name_hi: fd.get('name_hi').trim(),
//     state: fd.get('state').trim(), district: fd.get('district').trim(),
//     category: fd.get('category') === '__custom__'
//       ? (document.getElementById('customCategoryInput').value.trim().toLowerCase().replace(/\s+/g,'-'))
//       : fd.get('category'),
//     lat: parseFloat(fd.get('lat')), lng: parseFloat(fd.get('lng')),
//     short_en: fd.get('short_en').trim(), short_hi: fd.get('short_hi').trim(),
//     about_en: fd.get('about_en').trim(), about_hi: fd.get('about_hi').trim(),
//     history_en: fd.get('history_en').trim(), history_hi: fd.get('history_hi').trim(),
//     culture_en: fd.get('culture_en').trim(), culture_hi: fd.get('culture_hi').trim(),
//     best_time_en: fd.get('best_time_en').trim(), best_time_hi: fd.get('best_time_hi').trim(),
//     cover_image: (window.__modalImages && window.__modalImages.cover) || '',
//     images: (window.__modalImages && window.__modalImages.gallery) || [],
//     status: fd.get('status'), verified: fd.get('verified') === 'on',
//     tips, sources, nearby,
//   };
//   if(fd.get('category') === '__custom__' && !data.category){ alert('Please type a name for the new category.'); return false; }
//   if(isNaN(data.lat) || isNaN(data.lng)){ alert('Latitude and longitude must be valid numbers.'); return false; }
//   const approxSize = JSON.stringify(data).length;
//   if(approxSize > 4200000){ alert('These images are too large to save (over ~4MB total). Please remove a photo or use smaller files.'); return false; }

//   try{
//     if(id){
//       await apiFetch(`/api/admin/destinations/${id}`, { method:'PUT', body: JSON.stringify(data) });
//     } else {
//       await apiFetch('/api/admin/destinations', { method:'POST', body: JSON.stringify(data) });
//     }
//     await loadData();
//     closeModal();
//     renderApp();
//     showToast(id ? 'Destination updated.' : 'Destination added.');
//   }catch(err){
//     alert('Could not save: ' + err.message);
//   }
//   return false;
// };

// /* ---------------- ADMIN: import ---------------- */
// const IMPORT_COLUMNS = ['name_en','name_hi','state','district','category','latitude','longitude','short_description_en','short_description_hi','description_en','description_hi','best_time_en','cover_image','verified'];
// function viewAdminImport(){
//   const step = STATE.importDraft.step;
//   return adminLayout(`
//     <h2 style="margin:0 0 6px;">Bulk Destination Import</h2>
//     <p style="font-size:0.85rem;color:var(--charcoal-soft);margin:0 0 22px;">Upload a CSV file to add multiple destinations at once. Nothing is written to the database until you confirm the preview.</p>
//     <div class="import-steps">
//       <div class="import-step ${step>=1?'active':''}">1. Upload File</div>
//       <div class="import-step ${step>=2?'active':''}">2. Validate</div>
//       <div class="import-step ${step>=3?'active':''}">3. Preview</div>
//       <div class="import-step ${step>=4?'active':''}">4. Import</div>
//     </div>
//     <div style="margin-bottom:20px;display:flex;gap:10px;">
//       <button class="btn btn-ghost btn-sm" onclick="downloadTemplate()">⬇ Download CSV Template</button>
//     </div>
//     ${step===1 ? `
//       <div class="dropzone" id="dropzone">
//         <div style="font-size:2rem;margin-bottom:10px;">📄</div>
//         <p style="margin:0 0 14px;font-size:0.9rem;color:var(--charcoal-soft);">Drag & drop a CSV file here, or</p>
//         <input type="file" id="csvFile" accept=".csv" style="display:none;" onchange="handleCsvFile(this.files[0])"/>
//         <button class="btn btn-primary btn-sm" onclick="document.getElementById('csvFile').click()">Browse Files</button>
//       </div>` : ''}
//     <div id="importPreviewHost"></div>
//   `);
// }
// window.downloadTemplate = function(){
//   const header = IMPORT_COLUMNS.join(',');
//   const sample = ['Sonepur Heritage Site','सोनपुर विरासत स्थल','Bihar','Saran','heritage','25.69','85.19','A sample entry','एक उदाहरण प्रविष्टि','Longer description here','', 'October to March','', 'true'].join(',');
//   const csv = header + '\n' + sample;
//   const blob = new Blob([csv], {type:'text/csv'});
//   const a = document.createElement('a');
//   a.href = URL.createObjectURL(blob); a.download = 'hidden-india-import-template.csv';
//   document.body.appendChild(a); a.click(); a.remove();
// };
// function parseCSV(text){
//   const lines = text.split(/\r?\n/).filter(l=>l.trim().length);
//   if(!lines.length) return [];
//   const headers = lines[0].split(',').map(h=>h.trim());
//   return lines.slice(1).map(line=>{
//     // basic CSV split respecting simple quoted fields
//     const cells = []; let cur=''; let inQuotes=false;
//     for(let i=0;i<line.length;i++){
//       const ch=line[i];
//       if(ch==='"'){ inQuotes=!inQuotes; continue; }
//       if(ch===',' && !inQuotes){ cells.push(cur); cur=''; continue; }
//       cur+=ch;
//     }
//     cells.push(cur);
//     const row={};
//     headers.forEach((h,i)=> row[h] = (cells[i]||'').trim());
//     return row;
//   });
// }
// window.handleCsvFile = function(file){
//   if(!file) return;
//   const reader = new FileReader();
//   reader.onload = () => {
//     const rows = parseCSV(reader.result);
//     const validated = rows.map((r,i)=>{
//       const errors = [];
//       if(!r.name_en) errors.push('Missing name_en');
//       if(!r.state) errors.push('Missing state');
//       if(!r.latitude || isNaN(parseFloat(r.latitude))) errors.push('Invalid latitude');
//       if(!r.longitude || isNaN(parseFloat(r.longitude))) errors.push('Invalid longitude');
//       return { row:i+2, data:r, errors, valid: errors.length===0 };
//     });
//     STATE.importDraft = { rows: validated, step: 3 };
//     renderApp();
//   };
//   reader.readAsText(file);
// };
// function renderImportPreview(){
//   const host = document.getElementById('importPreviewHost');
//   if(!host || !STATE.importDraft.rows) return;
//   const rows = STATE.importDraft.rows;
//   const valid = rows.filter(r=>r.valid).length;
//   const errors = rows.length - valid;
//   host.innerHTML = `
//     <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);">
//       <div class="stat-card"><div class="n">${rows.length}</div><div class="l">Total Rows</div></div>
//       <div class="stat-card"><div class="n" style="color:#33513E;">${valid}</div><div class="l">Valid</div></div>
//       <div class="stat-card"><div class="n" style="color:#A8412E;">${errors}</div><div class="l">Errors</div></div>
//     </div>
//     <div class="table-wrap" style="margin-bottom:20px;">
//       <table>
//         <thead><tr><th>Row</th><th>Name</th><th>State</th><th>Status</th></tr></thead>
//         <tbody>
//           ${rows.map(r=>`<tr>
//             <td>${r.row}</td>
//             <td>${escapeHtml(r.data.name_en || '—')}</td>
//             <td>${escapeHtml(r.data.state || '—')}</td>
//             <td>${r.valid ? '<span class="preview-badge-ok">✓ Valid</span>' : `<span class="preview-badge-err">⚠ ${r.errors.join(', ')}</span>`}</td>
//           </tr>`).join('')}
//         </tbody>
//       </table>
//     </div>
//     <div style="display:flex;gap:10px;">
//       <button class="btn btn-primary" ${valid===0?'disabled':''} onclick="confirmImport()">Import ${valid} Valid Record${valid===1?'':'s'}</button>
//       <button class="btn btn-ghost" onclick="resetImport()">Start Over</button>
//     </div>
//   `;
// }
// window.resetImport = function(){ STATE.importDraft = {rows:null, step:1}; renderApp(); };
// window.confirmImport = async function(){
//   const rows = STATE.importDraft.rows.filter(r=>r.valid).map(r=>r.data);
//   try{
//     const result = await apiFetch('/api/admin/destinations/import', {
//       method:'POST', body: JSON.stringify({ rows }),
//     });
//     await loadData();
//     STATE.importDraft = {rows:null, step:1};
//     renderApp();
//     showToast(`✓ ${result.imported} destinations imported as drafts.${result.failed ? ` (${result.failed} failed)` : ''}`);
//   }catch(e){
//     showToast('⚠ ' + e.message);
//   }
// };

// /* ---------------- router / render ---------------- */
// function currentPath(){ return STATE.route.split('?')[0]; }

// function renderApp(loginError){
//   const path = currentPath();
//   let content;

//   if(path.startsWith('/admin')){
//     if(!STATE.admin.loggedIn){ content = viewAdminLogin(loginError); }
//     else if(path === '/admin' || path === '/admin/dashboard') content = viewAdminDashboard();
//     else if(path === '/admin/destinations') content = viewAdminDestinations();
//     else if(path === '/admin/import') content = viewAdminImport();
//     else content = viewAdminDashboard();
//   } else if(path === '/' || path === '') {
//     content = layout(viewHome());
//   } else if(path === '/explore') {
//     content = layout(viewExplore());
//   } else if(path === '/map') {
//     content = layout(viewMap());
//   } else if(path.startsWith('/destination/')) {
//     content = layout(viewDestination(path.split('/destination/')[1]));
//   } else {
//     content = layout(`<div class="wrap section">${emptyState('Page not found')}</div>`);
//   }

//   document.getElementById('app').innerHTML = content;
//   if(path === '/map') initMap();
//   if(path === '/admin/import') renderImportPreview();
//   window.scrollTo(0,0);
// }
// function render(){ renderApp(); }
// window.setLang = function(l){ STATE.lang = l; renderApp(); };

// /* ---------------- boot ---------------- */
// (async function boot(){
//   document.getElementById('app').innerHTML = `<div class="wrap section"><div class="skeleton" style="height:40px;width:240px;margin-bottom:20px;"></div><div class="grid">${'<div class="skeleton" style="height:220px;"></div>'.repeat(3)}</div></div>`;
//   await loadData();
//   render();
// })();



































































 
/* =========================================================
   HIDDEN INDIA — client-side demo app
   Data persists via window.storage (per-browser, personal).
   Map: Leaflet + OpenStreetMap tiles (free, no API key required).
   ========================================================= */
const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';
let _leafletLoadingPromise = null;
function loadGoogleMaps(){
  // Kept function name for backward compatibility with existing call sites (initMap/locateMe).
  // Loads Leaflet (JS + CSS) from a CDN instead of the Google Maps JavaScript API.
  if(window.L) return Promise.resolve();
  if(_leafletLoadingPromise) return _leafletLoadingPromise;
  _leafletLoadingPromise = new Promise((resolve, reject)=>{
    if(!document.getElementById('leafletCssLink')){
      const link = document.createElement('link');
      link.id = 'leafletCssLink';
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS_URL;
      document.head.appendChild(link);
    }
    const s = document.createElement('script');
    s.src = LEAFLET_JS_URL;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return _leafletLoadingPromise;
}
 
/* =========================================================
   BACKEND API — connects to the hidden-india-backend project
   (Node/Express + PostgreSQL, deployed separately).
   ⚠️ Set this to your deployed backend's URL, e.g.
      'https://hidden-india-api.onrender.com' — no trailing slash.
   ========================================================= */
const API_BASE_URL = 'https://hidden-india-iein.onrender.com';
const ADMIN_TOKEN_KEY = 'hidden-india-admin-token';
function getAdminToken(){ try{ return sessionStorage.getItem(ADMIN_TOKEN_KEY); }catch(e){ return null; } }
function setAdminToken(t){ try{ if(t) sessionStorage.setItem(ADMIN_TOKEN_KEY, t); else sessionStorage.removeItem(ADMIN_TOKEN_KEY); }catch(e){ /* blocked */ } }
async function apiFetch(path, options={}){
  const headers = { 'Content-Type':'application/json', ...(options.headers||{}) };
  const token = getAdminToken();
  if(token) headers['Authorization'] = 'Bearer ' + token;
  let res;
  try{
    res = await fetch(API_BASE_URL + path, { ...options, headers });
  }catch(e){
    throw new Error('Could not reach the backend. Is it running and is API_BASE_URL correct?');
  }
  let body = null;
  try{ body = await res.json(); }catch(e){ /* empty body, e.g. 204 */ }
  if(res.status === 401){ setAdminToken(null); STATE.admin.loggedIn = false; }
  if(!res.ok){ throw new Error((body && body.error) || `Request failed (${res.status})`); }
  return body;
}
 
const CATEGORY_ICONS = { heritage:'🏛', festivals:'🎭', art:'🎨', culture:'🍛', villages:'🏘' };
const CATEGORY_COLORS = { heritage:'#8A5A34', festivals:'#9C4A63', art:'#4A6B8A', culture:'#BF5B34', villages:'#33513E' };
const CATEGORIES = [
  {id:'heritage', name_en:'Heritage', name_hi:'विरासत', icon:'🏛'},
  {id:'festivals', name_en:'Festivals', name_hi:'त्यौहार', icon:'🎭'},
  {id:'art', name_en:'Art & Crafts', name_hi:'कला और शिल्प', icon:'🎨'},
  {id:'culture', name_en:'Culture', name_hi:'संस्कृति', icon:'🍛'},
  {id:'villages', name_en:'Heritage Villages', name_hi:'विरासत गांव', icon:'🏘'},
];
 
const SEED_DESTINATIONS = [
  {
    id:'d1', slug:'nalanda-mahavihara', name_en:'Nalanda Mahavihara', name_hi:'नालंदा महाविहार',
    state:'Bihar', district:'Nalanda', category:'heritage', lat:25.1367, lng:85.4436,
    short_en:'Ruins of one of the world\'s earliest residential universities.',
    short_hi:'विश्व के सबसे प्राचीन आवासीय विश्वविद्यालयों में से एक के अवशेष।',
    about_en:'Nalanda Mahavihara was a residential seat of learning that drew scholars from across Asia between roughly the 5th and 12th centuries CE. Today its excavated brick monasteries and stupas form one of the most extensive ancient university sites anywhere in the world.',
    about_hi:'नालंदा महाविहार लगभग 5वीं से 12वीं शताब्दी ईस्वी तक एशिया भर के विद्वानों को आकर्षित करने वाला एक आवासीय शिक्षा केंद्र था। आज इसके उत्खनित ईंट के विहार और स्तूप विश्व के सबसे विस्तृत प्राचीन विश्वविद्यालय स्थलों में से एक हैं।',
    history_en:'Historical accounts, including those of Chinese travellers who studied here, describe a vast complex of monasteries, lecture halls and libraries. The site was gradually abandoned after repeated damage in the 12th century, and its ruins were rediscovered and excavated by the Archaeological Survey of India beginning in the 19th and 20th centuries.',
    history_hi:'यहां अध्ययन करने वाले चीनी यात्रियों सहित ऐतिहासिक विवरणों में विहारों, व्याख्यान कक्षों और पुस्तकालयों के एक विशाल परिसर का वर्णन मिलता है। 12वीं शताब्दी में बार-बार हुई क्षति के बाद स्थल को धीरे-धीरे छोड़ दिया गया, और इसके अवशेषों को 19वीं-20वीं शताब्दी में भारतीय पुरातत्व सर्वेक्षण द्वारा फिर से खोजा और उत्खनित किया गया।',
    culture_en:'Nalanda is recognised as a UNESCO World Heritage Site and remains an important symbol of India\'s ancient intellectual and Buddhist heritage, drawing scholars, monks and travellers who trace the roots of organised higher learning in Asia.',
    culture_hi:'नालंदा को यूनेस्को विश्व धरोहर स्थल के रूप में मान्यता प्राप्त है और यह भारत की प्राचीन बौद्धिक और बौद्ध विरासत के महत्वपूर्ण प्रतीक के रूप में बना हुआ है।',
    best_time_en:'October to March, when the weather is cool and dry.',
    best_time_hi:'अक्टूबर से मार्च, जब मौसम ठंडा और शुष्क होता है।',
    cover_image:'', status:'published', verified:true,
    tips:[
      {en:'Follow marked pathways; do not climb on excavated brick structures.', hi:'चिह्नित रास्तों का पालन करें; उत्खनित ईंट संरचनाओं पर न चढ़ें।'},
      {en:'Photography is generally permitted, but tripods may need prior permission.', hi:'फोटोग्राफी की सामान्यतः अनुमति है, लेकिन ट्राइपॉड के लिए पूर्व अनुमति आवश्यक हो सकती है।'},
      {en:'Carry water and a hat; there is limited shade across the site.', hi:'पानी और टोपी साथ रखें; स्थल पर छाया सीमित है।'},
    ],
    sources:[
      {organization:'Archaeological Survey of India', title:'Nalanda Mahavihara Site Record', url:'https://asi.nic.in'},
      {organization:'UNESCO World Heritage Centre', title:'Archaeological Site of Nalanda Mahavihara', url:'https://whc.unesco.org'},
    ]
  },
  {
    id:'d2', slug:'rajgir', name_en:'Rajgir', name_hi:'राजगीर',
    state:'Bihar', district:'Nalanda', category:'heritage', lat:25.0298, lng:85.4202,
    short_en:'A hill-ringed ancient capital linked to the Buddha and Mahavira.',
    short_hi:'पहाड़ियों से घिरी एक प्राचीन राजधानी, जो बुद्ध और महावीर से जुड़ी है।',
    about_en:'Rajgir sits within a ring of five hills and served as an early capital of the Magadha kingdom. It holds sites significant to both Buddhist and Jain traditions, including hill-top stupas and ancient cyclopean stone walls.',
    about_hi:'राजगीर पांच पहाड़ियों के घेरे में स्थित है और मगध राज्य की प्रारंभिक राजधानी रहा है। यहां बौद्ध और जैन दोनों परंपराओं से जुड़े महत्वपूर्ण स्थल हैं।',
    history_en:'Rajgir (ancient Rajagriha) is described in early Buddhist and Jain texts as a centre of major events, including gatherings associated with the Buddha\'s teachings. Remnants of ancient fortification walls and monastic sites are still visible around the hills.',
    history_hi:'राजगीर (प्राचीन राजगृह) का वर्णन प्रारंभिक बौद्ध और जैन ग्रंथों में प्रमुख घटनाओं के केंद्र के रूप में मिलता है। पहाड़ियों के आसपास प्राचीन किलेबंदी की दीवारों के अवशेष आज भी दिखाई देते हैं।',
    culture_en:'A ropeway ascent to the Vishwa Shanti Stupa (Peace Pagoda) offers views over the valley, and the site remains an active pilgrimage destination for Buddhist and Jain visitors.',
    culture_hi:'विश्व शांति स्तूप तक रोपवे यात्रा घाटी के दृश्य प्रस्तुत करती है, और यह स्थल बौद्ध और जैन तीर्थयात्रियों के लिए एक सक्रिय तीर्थ स्थल बना हुआ है।',
    best_time_en:'October to March.',
    best_time_hi:'अक्टूबर से मार्च।',
    cover_image:'', status:'published', verified:true,
    tips:[
      {en:'Respect active worship areas; dress modestly near temples.', hi:'सक्रिय पूजा स्थलों का सम्मान करें; मंदिरों के पास शालीन वस्त्र पहनें।'},
      {en:'The ropeway can queue up on weekends — plan extra time.', hi:'सप्ताहांत पर रोपवे में कतार लग सकती है — अतिरिक्त समय रखें।'},
    ],
    sources:[
      {organization:'Bihar State Tourism Development Corporation', title:'Rajgir Heritage Circuit', url:'https://bstdc.bihar.gov.in'},
      {organization:'Archaeological Survey of India', title:'Rajgir Fortification Walls', url:'https://asi.nic.in'},
    ]
  },
  {
    id:'d3', slug:'vikramshila-mahavihara', name_en:'Vikramshila Mahavihara', name_hi:'विक्रमशिला महाविहार',
    state:'Bihar', district:'Bhagalpur', category:'heritage', lat:25.3167, lng:87.2667,
    short_en:'Remains of a major Buddhist learning centre founded by the Pala dynasty.',
    short_hi:'पाल राजवंश द्वारा स्थापित एक प्रमुख बौद्ध शिक्षा केंद्र के अवशेष।',
    about_en:'Vikramshila was established under the Pala rulers as one of the great Buddhist monastic universities of eastern India, alongside Nalanda. Excavations reveal a large cross-shaped central stupa surrounded by monastic cells.',
    about_hi:'विक्रमशिला की स्थापना पाल शासकों के अधीन पूर्वी भारत के महान बौद्ध मठ विश्वविद्यालयों में से एक के रूप में हुई थी। उत्खनन में मठ कक्षों से घिरा एक बड़ा क्रॉस-आकार का केंद्रीय स्तूप सामने आया है।',
    history_en:'Founded around the 8th century, Vikramshila became known for the study of Buddhist philosophy and tantric practice, and is associated with teachers who carried these traditions to Tibet. The site was excavated by the Archaeological Survey of India through the 20th century.',
    history_hi:'लगभग 8वीं शताब्दी में स्थापित, विक्रमशिला बौद्ध दर्शन और तांत्रिक अभ्यास के अध्ययन के लिए जाना जाता था। इस स्थल का उत्खनन भारतीय पुरातत्व सर्वेक्षण द्वारा 20वीं शताब्दी में किया गया।',
    culture_en:'Far less visited than Nalanda, Vikramshila offers a quieter view into the same era of Buddhist scholarship, set beside the Ganga in Bhagalpur district.',
    culture_hi:'नालंदा की तुलना में बहुत कम देखा जाने वाला, विक्रमशिला भागलपुर जिले में गंगा के किनारे स्थित है और उसी युग की बौद्ध विद्वता की एक शांत झलक प्रस्तुत करता है।',
    best_time_en:'November to February.',
    best_time_hi:'नवंबर से फरवरी।',
    cover_image:'', status:'published', verified:true,
    tips:[
      {en:'The on-site museum has limited hours — check before travelling out.', hi:'स्थल संग्रहालय के खुलने का समय सीमित है — यात्रा से पहले जांच लें।'},
      {en:'Local guides can point out details not marked on-site.', hi:'स्थानीय गाइड स्थल पर अचिह्नित विवरण दिखा सकते हैं।'},
    ],
    sources:[
      {organization:'Archaeological Survey of India', title:'Vikramshila Excavation Report', url:'https://asi.nic.in'},
      {organization:'Ministry of Culture, Government of India', title:'Vikramshila Mahavihara', url:'https://www.indiaculture.gov.in'},
    ]
  },
  {
    id:'d4', slug:'barabar-caves', name_en:'Barabar Caves', name_hi:'बराबर गुफाएं',
    state:'Bihar', district:'Jehanabad', category:'heritage', lat:25.0009, lng:85.0642,
    short_en:'India\'s oldest surviving rock-cut caves, polished to a mirror finish.',
    short_hi:'भारत की सबसे पुरानी जीवित शैल-कटी गुफाएं, दर्पण जैसी पॉलिश के साथ।',
    about_en:'The Barabar Caves are carved directly into granite hills and are among the earliest examples of rock-cut architecture in India, notable for their smooth, polished interior walls achieved without modern tools.',
    about_hi:'बराबर गुफाएं सीधे ग्रेनाइट पहाड़ियों में तराशी गई हैं और भारत में शैल-कटी वास्तुकला के प्रारंभिक उदाहरणों में से हैं, जो बिना आधुनिक औजारों के प्राप्त की गई चिकनी, पॉलिश आंतरिक दीवारों के लिए उल्लेखनीय हैं।',
    history_en:'Inscriptions at the site date several of the caves to the reign of the Mauryan emperor Ashoka and his successor, dedicated to an ascetic sect. The caves later inspired the fictional Marabar Caves in E. M. Forster\'s writing, though the real site remains a quiet archaeological destination.',
    history_hi:'स्थल पर शिलालेख कई गुफाओं को मौर्य सम्राट अशोक और उनके उत्तराधिकारी के शासनकाल का बताते हैं, जो एक तपस्वी संप्रदाय को समर्पित थीं।',
    culture_en:'The caves remain remarkably uncrowded, offering visitors a direct, quiet encounter with Mauryan-era stonework rarely found elsewhere.',
    culture_hi:'ये गुफाएं आज भी अपेक्षाकृत सुनसान हैं, जो आगंतुकों को मौर्य-युगीन पत्थर की कारीगरी से एक शांत और प्रत्यक्ष परिचय प्रदान करती हैं।',
    best_time_en:'October to March.',
    best_time_hi:'अक्टूबर से मार्च।',
    cover_image:'', status:'published', verified:true,
    tips:[
      {en:'Carry a torch — interiors are dark even during the day.', hi:'टॉर्च साथ रखें — आंतरिक भाग दिन में भी अंधेरा रहता है।'},
      {en:'The site has minimal facilities; plan food and water in advance.', hi:'स्थल पर सुविधाएं सीमित हैं; भोजन और पानी की योजना पहले से बनाएं।'},
    ],
    sources:[
      {organization:'Archaeological Survey of India', title:'Barabar Hill Caves', url:'https://asi.nic.in'},
      {organization:'Bihar Tourism', title:'Barabar Caves Visitor Guide', url:'https://tourism.bihar.gov.in'},
    ]
  },
  {
    id:'d5', slug:'kesaria-stupa', name_en:'Kesaria Stupa', name_hi:'केसरिया स्तूप',
    state:'Bihar', district:'East Champaran', category:'heritage', lat:26.6167, lng:84.8667,
    short_en:'Among the tallest known Buddhist stupas, still being uncovered.',
    short_hi:'ज्ञात सबसे ऊंचे बौद्ध स्तूपों में से एक, जिसका उत्खनन अभी भी जारी है।',
    about_en:'The Kesaria Stupa rises in tiered circular terraces and is considered one of the tallest Buddhist stupas discovered to date. Much of the structure remained buried under earth for centuries before systematic excavation began.',
    about_hi:'केसरिया स्तूप स्तरित वृत्ताकार छतों में ऊंचा उठता है और अब तक खोजे गए सबसे ऊंचे बौद्ध स्तूपों में से एक माना जाता है।',
    history_en:'Local tradition and early travel accounts connect the site to visits by the Buddha, and later Pala-era additions are visible in the stucco work. The Archaeological Survey of India has carried out phased excavation since the early 2000s, and large sections still lie unexcavated.',
    history_hi:'स्थानीय परंपरा और प्रारंभिक यात्रा विवरण इस स्थल को बुद्ध की यात्राओं से जोड़ते हैं। भारतीय पुरातत्व सर्वेक्षण 2000 के दशक की शुरुआत से चरणबद्ध उत्खनन कर रहा है।',
    culture_en:'Because excavation is ongoing, Kesaria offers a rare sense of an ancient monument still being brought to light, away from major tourist circuits.',
    culture_hi:'चूंकि उत्खनन अभी भी जारी है, केसरिया एक प्राचीन स्मारक के धीरे-धीरे प्रकाश में आने का दुर्लभ अनुभव प्रदान करता है।',
    best_time_en:'November to February.',
    best_time_hi:'नवंबर से फरवरी।',
    cover_image:'', status:'published', verified:true,
    tips:[
      {en:'Some sections remain active excavation zones — stay behind barriers.', hi:'कुछ हिस्से अभी भी सक्रिय उत्खनन क्षेत्र हैं — बैरियर के पीछे रहें।'},
      {en:'Roads leading here can be narrow; allow extra travel time.', hi:'यहां जाने वाली सड़कें संकरी हो सकती हैं; अतिरिक्त यात्रा समय रखें।'},
    ],
    sources:[
      {organization:'Archaeological Survey of India', title:'Kesaria Stupa Conservation Notes', url:'https://asi.nic.in'},
      {organization:'Bihar Tourism', title:'Kesaria Stupa', url:'https://tourism.bihar.gov.in'},
    ]
  },
  {
    id:'d6', slug:'madhubani-art-village', name_en:'Madhubani Art Village (Jitwarpur)', name_hi:'मधुबनी कला गांव (जितवारपुर)',
    state:'Bihar', district:'Madhubani', category:'art', lat:26.3500, lng:86.0700,
    short_en:'A living village of Madhubani (Mithila) painting practised by local artists.',
    short_hi:'स्थानीय कलाकारों द्वारा अभ्यासरत मधुबनी (मिथिला) चित्रकला का एक जीवंत गांव।',
    about_en:'Jitwarpur and neighbouring hamlets near Madhubani town are home to generations of artists practising Madhubani painting — a distinctive folk style traditionally made with natural pigments and fine line work, originally painted on mud walls and now widely on paper and cloth.',
    about_hi:'मधुबनी शहर के निकट जितवारपुर और आसपास के गांव पीढ़ियों से मधुबनी चित्रकला का अभ्यास करने वाले कलाकारों का घर हैं — यह एक विशिष्ट लोक शैली है जो पारंपरिक रूप से प्राकृतिक रंगों और बारीक रेखा कार्य से बनाई जाती है।',
    history_en:'The painting tradition is closely tied to Mithila region rituals and household ceremonies, historically practised by women as wall and floor art. Recognition grew from the mid-20th century onward, and today many households in the area continue the craft and welcome visitors interested in the process.',
    history_hi:'यह चित्रकला परंपरा मिथिला क्षेत्र के अनुष्ठानों और पारिवारिक समारोहों से गहराई से जुड़ी है, ऐतिहासिक रूप से महिलाओं द्वारा दीवार और फर्श कला के रूप में अभ्यास की जाती रही है।',
    culture_en:'Visitors can watch artists at work, learn about natural pigment preparation, and purchase work directly from the households that make it — supporting the craft at its source.',
    culture_hi:'आगंतुक कलाकारों को काम करते देख सकते हैं, प्राकृतिक रंग तैयार करने के बारे में जान सकते हैं, और सीधे उन परिवारों से कृतियां खरीद सकते हैं जो इसे बनाते हैं।',
    best_time_en:'October to March.',
    best_time_hi:'अक्टूबर से मार्च।',
    cover_image:'', status:'published', verified:true,
    tips:[
      {en:'Ask before photographing artists at work inside homes.', hi:'घरों के अंदर काम करते कलाकारों की तस्वीर लेने से पहले अनुमति लें।'},
      {en:'Buy directly from artists where possible to support local income.', hi:'स्थानीय आय का समर्थन करने के लिए जहां संभव हो सीधे कलाकारों से खरीदें।'},
    ],
    sources:[
      {organization:'Ministry of Culture, Government of India', title:'Madhubani Painting — Intangible Heritage Note', url:'https://www.indiaculture.gov.in'},
      {organization:'Bihar Tourism', title:'Madhubani Art Villages', url:'https://tourism.bihar.gov.in'},
    ]
  },
  {
    id:'d7', slug:'pawapuri', name_en:'Pawapuri', name_hi:'पावापुरी',
    state:'Bihar', district:'Nalanda', category:'heritage', lat:25.0667, lng:85.5333,
    short_en:'A Jain pilgrimage town centred on a lotus-covered water temple.',
    short_hi:'एक कमल-आच्छादित जल मंदिर पर केंद्रित एक जैन तीर्थ नगर।',
    about_en:'Pawapuri is regarded in Jain tradition as the place where Mahavira attained nirvana. Its centrepiece, the Jal Mandir, stands on a small island in a lotus-filled tank, reached by a stone causeway.',
    about_hi:'पावापुरी को जैन परंपरा में वह स्थान माना जाता है जहां महावीर ने निर्वाण प्राप्त किया। इसका केंद्र बिंदु, जल मंदिर, कमल से भरे तालाब में एक छोटे द्वीप पर स्थित है।',
    history_en:'The current temple structures were built in more recent centuries over a site with much older sacred significance, and the town remains an active pilgrimage centre for the Jain community, alongside several other temples nearby.',
    history_hi:'वर्तमान मंदिर संरचनाएं हाल की शताब्दियों में एक ऐसे स्थल पर बनाई गईं जिसका बहुत पुराना पवित्र महत्व है, और यह नगर जैन समुदाय के लिए एक सक्रिय तीर्थ केंद्र बना हुआ है।',
    culture_en:'The walk across the causeway at sunrise or sunset, with the water covered in lotus blooms in season, is considered one of the most tranquil experiences in the region.',
    culture_hi:'सूर्योदय या सूर्यास्त के समय कमल के फूलों से ढके जल के ऊपर पुल पार करना क्षेत्र के सबसे शांत अनुभवों में से एक माना जाता है।',
    best_time_en:'October to March; lotus bloom is best seen post-monsoon.',
    best_time_hi:'अक्टूबर से मार्च; कमल का खिलना मानसून के बाद सबसे अच्छा दिखता है।',
    cover_image:'', status:'published', verified:true,
    tips:[
      {en:'Remove leather items before entering temple premises, as per local custom.', hi:'स्थानीय रिवाज के अनुसार मंदिर परिसर में प्रवेश से पहले चमड़े की वस्तुएं हटा दें।'},
      {en:'Maintain quiet on the causeway out of respect for pilgrims.', hi:'तीर्थयात्रियों के सम्मान में पुल पर शांति बनाए रखें।'},
    ],
    sources:[
      {organization:'Bihar State Tourism Development Corporation', title:'Pawapuri Jal Mandir', url:'https://bstdc.bihar.gov.in'},
    ]
  },
  {
    id:'d8', slug:'vaishali', name_en:'Vaishali', name_hi:'वैशाली',
    state:'Bihar', district:'Vaishali', category:'heritage', lat:25.9833, lng:85.1333,
    short_en:'Seat of an early republic, marked by an intact Ashokan pillar.',
    short_hi:'एक प्रारंभिक गणराज्य की राजधानी, जो एक अक्षुण्ण अशोक स्तंभ द्वारा चिह्नित है।',
    about_en:'Vaishali is associated with the ancient Vajji confederacy, often cited as an early example of republican governance in the region. A well-preserved Ashokan pillar, topped with a lion capital, still stands near a stupa site linked to Buddhist tradition.',
    about_hi:'वैशाली प्राचीन वज्जि संघ से जुड़ा है, जिसे अक्सर क्षेत्र में गणतांत्रिक शासन के प्रारंभिक उदाहरण के रूप में उद्धृत किया जाता है। एक अच्छी तरह से संरक्षित अशोक स्तंभ आज भी खड़ा है।',
    history_en:'Excavated mounds around Vaishali point to a long occupation history from pre-Mauryan through Gupta periods. The site is also associated with events described in early Buddhist texts, including a visit by the Buddha shortly before his death.',
    history_hi:'वैशाली के आसपास उत्खनित टीले मौर्य-पूर्व से गुप्त काल तक एक लंबे बसाव के इतिहास की ओर इशारा करते हैं।',
    culture_en:'A site museum near the excavated area displays artefacts recovered from the mounds, giving useful context before walking the grounds.',
    culture_hi:'उत्खनित क्षेत्र के पास एक स्थल संग्रहालय टीलों से प्राप्त कलाकृतियों को प्रदर्शित करता है।',
    best_time_en:'November to February.',
    best_time_hi:'नवंबर से फरवरी।',
    cover_image:'', status:'draft', verified:false,
    tips:[
      {en:'Museum timings are limited on public holidays — check ahead.', hi:'सार्वजनिक छुट्टियों में संग्रहालय का समय सीमित होता है — पहले जांच लें।'},
    ],
    sources:[
      {organization:'Archaeological Survey of India', title:'Vaishali Excavated Mounds', url:'https://asi.nic.in'},
    ]
  },
];
 
/* ---------------- state & data loading ---------------- */
let STATE = {
  lang: 'en',
  destinations: [],
  route: parseHash(),
  filters: { search:'', state:'', category:'', sort:'name' },
  map: { instance:null, markers:[], userMarker:null, radius:50, userLoc:null },
  admin: { loggedIn: !!getAdminToken() },
  importDraft: { rows:null, step:1 },
};
 
async function loadData(){
  try{
    STATE.destinations = STATE.admin.loggedIn
      ? await apiFetch('/api/admin/destinations')
      : await apiFetch('/api/destinations');
  }catch(e){
    STATE.destinations = [];
    showToast('⚠ ' + e.message);
  }
}
 
function parseHash(){
  const h = location.hash.replace('#','') || '/';
  return h;
}
window.addEventListener('hashchange', () => { STATE.route = parseHash(); render(); });
 
/* ---------------- helpers ---------------- */
function t(obj, field){ return obj[field + '_' + STATE.lang] ?? obj[field + '_en'] ?? ''; }
function categoryMeta(id){ return CATEGORIES.find(c=>c.id===id) || CATEGORIES[0]; }
function fmtCategory(id){
  const c = CATEGORIES.find(x=>x.id===id);
  if(c) return STATE.lang==='hi' ? c.name_hi : c.name_en;
  return id ? id.replace(/-/g,' ').replace(/\b\w/g, ch=>ch.toUpperCase()) : '';
}
function slugify(s){ return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function haversine(lat1,lng1,lat2,lng2){
  const R=6371, toRad=d=>d*Math.PI/180;
  const dLat=toRad(lat2-lat1), dLng=toRad(lng2-lng1);
  const a=Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function showToast(msg){
  const host = document.getElementById('toastHost');
  const el = document.createElement('div');
  el.className='toast'; el.textContent=msg;
  host.appendChild(el);
  setTimeout(()=>el.remove(), 2600);
}
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function publishedDestinations(){ return STATE.destinations.filter(d=>d.status==='published'); }
function findBySlug(slug){ return STATE.destinations.find(d=>d.slug===slug); }
function findById(id){ return STATE.destinations.find(d=>d.id===id); }
function uniqueStates(){ return [...new Set(STATE.destinations.map(d=>d.state))]; }
 
/* ---------------- reviews & comments (stored locally per browser) ---------------- */
function reviewsKey(slug){ return 'hi_reviews_' + slug; }
function commentsKey(slug){ return 'hi_comments_' + slug; }
function loadList(key){
  try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch(e){ return []; }
}
function saveList(key, list){
  try{ localStorage.setItem(key, JSON.stringify(list)); }catch(e){ /* storage blocked */ }
}
function getReviews(slug){ return loadList(reviewsKey(slug)); }
function getComments(slug){ return loadList(commentsKey(slug)); }
function avgRating(reviews){
  if(!reviews.length) return 0;
  return reviews.reduce((sum,r)=>sum+(r.rating||0),0) / reviews.length;
}
function starString(rating){
  const full = Math.round(rating);
  return '★★★★★☆☆☆☆☆'.slice(5-full, 10-full);
}
function timeAgo(iso){
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs/60000);
  if(mins < 1) return 'just now';
  if(mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins/60);
  if(hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs/24);
  if(days < 30) return days + 'd ago';
  return new Date(iso).toLocaleDateString();
}
window.STAR_INPUT_VALUE = 5;
window.setStarInput = function(slug, val){
  window.STAR_INPUT_VALUE = val;
  const wrap = document.getElementById('starInput_' + slug);
  if(!wrap) return;
  [...wrap.children].forEach((el,i)=>{ el.textContent = (i < val) ? '★' : '☆'; });
};
window.submitReview = function(slug){
  const nameEl = document.getElementById('reviewName_' + slug);
  const textEl = document.getElementById('reviewText_' + slug);
  const name = (nameEl.value || '').trim();
  const text = (textEl.value || '').trim();
  const rating = window.STAR_INPUT_VALUE || 5;
  if(!name || !text){ showToast('⚠ Please add your name and a short review.'); return; }
  const reviews = getReviews(slug);
  reviews.unshift({ name: escapeHtml(name), text: escapeHtml(text), rating, date: new Date().toISOString() });
  saveList(reviewsKey(slug), reviews);
  window.STAR_INPUT_VALUE = 5;
  renderApp();
  showToast('✓ Thanks for your review!');
};
window.submitComment = function(slug){
  const nameEl = document.getElementById('commentName_' + slug);
  const textEl = document.getElementById('commentText_' + slug);
  const name = (nameEl.value || '').trim();
  const text = (textEl.value || '').trim();
  if(!name || !text){ showToast('⚠ Please add your name and a comment.'); return; }
  const comments = getComments(slug);
  comments.unshift({ name: escapeHtml(name), text: escapeHtml(text), date: new Date().toISOString() });
  saveList(commentsKey(slug), comments);
  renderApp();
  showToast('✓ Comment posted!');
};
function reviewsAndCommentsSection(d, L){
  const reviews = getReviews(d.slug);
  const comments = getComments(d.slug);
  const avg = avgRating(reviews);
  const reviewCards = reviews.map(r=>`
    <div class="source-card" style="align-items:flex-start;flex-direction:column;gap:4px;">
      <div style="display:flex;justify-content:space-between;width:100%;">
        <span class="org">${r.name}</span>
        <span style="color:var(--gold);font-size:0.85rem;">${starString(r.rating)}</span>
      </div>
      <div class="sub" style="font-size:0.85rem;color:var(--charcoal);">${r.text}</div>
      <div class="sub" style="font-size:0.7rem;">${timeAgo(r.date)}</div>
    </div>`).join('');
  const commentCards = comments.map(c=>`
    <div class="source-card" style="align-items:flex-start;flex-direction:column;gap:4px;">
      <div class="org">${c.name}</div>
      <div class="sub" style="font-size:0.85rem;color:var(--charcoal);">${c.text}</div>
      <div class="sub" style="font-size:0.7rem;">${timeAgo(c.date)}</div>
    </div>`).join('');
  return `
    <div class="prose" data-hi="${L==='hi'}" style="margin-top:32px;">
      <h2>⭐ ${L==='hi'?'रेटिंग और समीक्षाएं':'Ratings & Reviews'}</h2>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
        <span style="font-size:1.6rem;color:var(--gold);">${starString(avg)}</span>
        <span style="color:var(--charcoal-soft);font-size:0.85rem;">${avg ? avg.toFixed(1) : '—'} (${reviews.length} ${L==='hi'?'समीक्षाएं':'review'+(reviews.length===1?'':'s')})</span>
      </div>
      <div class="side-card" style="max-width:520px;">
        <h3>${L==='hi'?'अपनी समीक्षा लिखें':'Write a Review'}</h3>
        <div class="form-group"><label>${L==='hi'?'नाम':'Your Name'}</label><input id="reviewName_${d.slug}" type="text" placeholder="${L==='hi'?'आपका नाम':'Your name'}"/></div>
        <div class="form-group">
          <label>${L==='hi'?'रेटिंग':'Rating'}</label>
          <div id="starInput_${d.slug}" style="font-size:1.4rem;color:var(--gold);cursor:pointer;letter-spacing:2px;">
            ${[1,2,3,4,5].map(i=>`<span onclick="setStarInput('${d.slug}',${i})">★</span>`).join('')}
          </div>
        </div>
        <div class="form-group"><label>${L==='hi'?'समीक्षा':'Review'}</label><textarea id="reviewText_${d.slug}" placeholder="${L==='hi'?'अपना अनुभव साझा करें...':'Share your experience...'}"></textarea></div>
        <button class="btn btn-primary btn-sm" onclick="submitReview('${d.slug}')">${L==='hi'?'समीक्षा सबमिट करें':'Submit Review'}</button>
      </div>
      ${reviewCards || `<div style="font-size:0.85rem;color:var(--charcoal-soft);margin-top:10px;">${L==='hi'?'अभी तक कोई समीक्षा नहीं। पहली समीक्षा लिखें!':'No reviews yet. Be the first to review!'}</div>`}
 
      <h2 style="margin-top:32px;">💬 ${L==='hi'?'टिप्पणियाँ':'Comments'}</h2>
      <div class="side-card" style="max-width:520px;">
        <h3>${L==='hi'?'चर्चा में शामिल हों':'Join the Discussion'}</h3>
        <div class="form-group"><label>${L==='hi'?'नाम':'Your Name'}</label><input id="commentName_${d.slug}" type="text" placeholder="${L==='hi'?'आपका नाम':'Your name'}"/></div>
        <div class="form-group"><label>${L==='hi'?'टिप्पणी':'Comment'}</label><textarea id="commentText_${d.slug}" placeholder="${L==='hi'?'एक सवाल पूछें या सुझाव साझा करें...':'Ask a question or share a tip...'}"></textarea></div>
        <button class="btn btn-primary btn-sm" onclick="submitComment('${d.slug}')">${L==='hi'?'टिप्पणी पोस्ट करें':'Post Comment'}</button>
      </div>
      ${commentCards || `<div style="font-size:0.85rem;color:var(--charcoal-soft);margin-top:10px;">${L==='hi'?'अभी तक कोई टिप्पणी नहीं।':'No comments yet.'}</div>`}
    </div>`;
}
 
/* ---------------- layout ---------------- */
function navLink(href, label, activePrefix){
  const active = STATE.route === activePrefix || STATE.route.startsWith(activePrefix + '/') ? 'active' : '';
  return `<a class="${active}" href="#${href}">${label}</a>`;
}
function layout(content, opts={}){
  const isAdmin = STATE.route.startsWith('/admin');
  if(isAdmin) return content;
  const L = STATE.lang;
  return `
  <div class="shell">
    <header class="nav">
      <div class="nav-inner">
        <a class="brand" href="#/">
          <span class="mark">🇮🇳</span>
          <span>Hidden India</span>
        </a>
        <nav class="nav-links">
          ${navLink('/explore', L==='hi'?'खोजें':'Explore', '/explore')}
          ${navLink('/map', L==='hi'?'नक्शा':'Map', '/map')}
          ${navLink('/explore?cat=all', L==='hi'?'संस्कृति':'Culture', '/culture')}
        </nav>
        <div class="nav-spacer"></div>
        <div class="lang-toggle">
          <button class="${L==='en'?'active':''}" onclick="setLang('en')">EN</button>
          <button class="${L==='hi'?'active':''}" onclick="setLang('hi')">हिं</button>
        </div>
        <a class="btn btn-primary btn-sm nav-cta" href="#/map" style="white-space:nowrap;">📍 <span class="nav-cta-label">${L==='hi'?'पास खोजें':'Explore Near Me'}</span></a>
        <a class="icon-btn" href="#/admin" title="Admin">⚙️</a>
        <button class="hamburger" onclick="toggleMobileNav()" aria-label="Menu"><span></span><span></span><span></span></button>
      </div>
      <nav class="mobile-nav-panel" id="mobileNavPanel">
        ${navLink('/explore', L==='hi'?'खोजें':'Explore', '/explore')}
        ${navLink('/map', L==='hi'?'नक्शा':'Map', '/map')}
        ${navLink('/explore?cat=all', L==='hi'?'संस्कृति':'Culture', '/culture')}
      </nav>
    </header>
    <main data-hi="${L==='hi'}">${content}</main>
    <footer>
      <div class="footer-inner">
        <div class="footer-brand">Hidden India</div>
        <div class="footer-tagline">Discover • Understand • Respect</div>
        <div class="footer-links">
          <a href="#/explore">Explore</a>
          <a href="#/map">Map</a>
          <a href="#/explore">Responsible Tourism</a>
          <a href="#/admin">Admin</a>
        </div>
        <div class="footer-contact">
          <a href="tel:+911234567890"><i class="fa-solid fa-phone"></i> +91 12345 67890</a>
          <a href="mailto:hello@hiddenindia.example"><i class="fa-solid fa-envelope"></i> hello@hiddenindia.example</a>
        </div>
        <div class="footer-social">
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"><i class="fa-brands fa-instagram"></i></a>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook"><i class="fa-brands fa-facebook"></i></a>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" title="X (Twitter)"><i class="fa-brands fa-x-twitter"></i></a>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube"><i class="fa-brands fa-youtube"></i></a>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
        </div>
        <div class="footer-bottom">© Hidden India — a heritage discovery demo. Verified with ASI, Ministry of Culture and state tourism sources.</div>
      </div>
    </footer>
  </div>`;
}
 
/* ---------------- views: HOME ---------------- */
function viewHome(){
  const L = STATE.lang;
  const featured = publishedDestinations().slice(0,6);
  const chips = CATEGORIES.map(c => `
    <a class="chip" href="#/explore?cat=${c.id}">
      <div class="em">${c.icon}</div>
      <div class="lbl">${L==='hi'?c.name_hi:c.name_en}</div>
    </a>`).join('');
  const cards = featured.map(cardHtml).join('');
  return `
  <section class="hero">
    <svg class="hero-trail" viewBox="0 0 800 400" preserveAspectRatio="none"><path d="M0,320 C150,280 220,120 400,150 C550,175 600,300 800,220" stroke="white" stroke-width="2" fill="none" stroke-dasharray="6 10"/></svg>
    <div class="seal"><div class="seal-inner">Verified · ASI · Ministry of Culture · Since Antiquity</div></div>
    <div class="hero-inner">
      <div class="eyebrow" style="color:#E7C99A;">Discover · Understand · Respect</div>
      <h1>${L==='hi'?'वह भारत जो आपने अभी तक नहीं देखा':"Discover the India You Haven't Seen Yet."}</h1>
      <p>${L==='hi'?'छुपी हुई विरासत, संस्कृति, पारंपरिक कला और उल्लेखनीय स्थलों का अन्वेषण करें — विश्वसनीय, सत्यापित जानकारी के साथ।':'Explore lesser-known heritage, culture, traditional art and remarkable places — backed by verified, structured information.'}</p>
      <form class="hero-search" onsubmit="event.preventDefault(); location.hash='/explore?q='+encodeURIComponent(this.q.value);">
        <input name="q" placeholder="${L==='hi'?'गंतव्य खोजें...':'Search destinations...'}" />
        <button class="btn btn-primary" type="submit">${L==='hi'?'खोजें':'Search'}</button>
      </form>
      <div class="hero-actions">
        <a class="btn btn-outline-light" href="#/map">📍 ${L==='hi'?'पास में खोजें':'Explore Near Me'}</a>
      </div>
    </div>
  </section>
 
  <section class="section wrap">
    <div class="section-head"><h2>${L==='hi'?'अनुभव के अनुसार खोजें':'Explore by Experience'}</h2></div>
    <div class="chips">${chips}</div>
  </section>
 
  <section class="section wrap" style="padding-top:0;">
    <div class="section-head">
      <h2>${L==='hi'?'चुनिंदा गंतव्य':'Featured Destinations'}</h2>
      <a class="explore-link" href="#/explore">${L==='hi'?'सभी देखें →':'View all →'}</a>
    </div>
    ${featured.length ? `<div class="grid">${cards}</div>` : emptyState(L==='hi'?'अभी कोई प्रकाशित गंतव्य नहीं':'No published destinations yet')}
  </section>
 
  <section class="section wrap" style="padding-top:0;">
    <div class="why-grid">
      <div class="why-card"><div class="why-num">01</div><h3>${L==='hi'?'खोजें':'Discover'}</h3><p>${L==='hi'?'मुख्यधारा के पर्यटन से परे सांस्कृतिक रूप से महत्वपूर्ण स्थानों को खोजें।':'Find culturally important places beyond mainstream tourism.'}</p></div>
      <div class="why-card"><div class="why-num">02</div><h3>${L==='hi'?'समझें':'Understand'}</h3><p>${L==='hi'?'संरचित ऐतिहासिक और सांस्कृतिक जानकारी तक पहुंचें।':'Access structured historical and cultural information, sourced and verified.'}</p></div>
      <div class="why-card"><div class="why-num">03</div><h3>${L==='hi'?'सम्मान करें':'Respect'}</h3><p>${L==='hi'?'यात्रा से पहले जिम्मेदार पर्यटन प्रथाओं को जानें।':'Learn responsible tourism practices before you visit.'}</p></div>
    </div>
  </section>
  `;
}
 
function cardHtml(d){
  const L = STATE.lang;
  const color = CATEGORY_COLORS[d.category] || '#8A5A34';
  return `
  <a class="card" href="#/destination/${d.slug}">
    <div class="card-media" style="background:linear-gradient(135deg, ${color}, ${color}CC);">
      ${d.cover_image ? `<img src="${escapeHtml(d.cover_image)}" alt="${escapeHtml(t(d,'name'))}" loading="lazy"/>` : CATEGORY_ICONS[d.category] || '🏛'}
      <span class="badge" style="position:absolute;top:10px;left:10px;">${fmtCategory(d.category)}</span>
      ${d.status==='draft' ? `<span class="status pill-draft" style="background:#fff;position:absolute;top:10px;right:10px;">${L==='hi'?'ड्राफ्ट':'Draft'}</span>` : ''}
    </div>
    <div class="card-body">
      <h3 ${L==='hi'?'data-hi="1"':''}>${escapeHtml(t(d,'name'))}</h3>
      <div class="card-loc">📍 ${escapeHtml(d.district)}, ${escapeHtml(d.state)}</div>
      <div class="card-desc" ${L==='hi'?'data-hi="1"':''}>${escapeHtml(t(d,'short'))}</div>
      <div class="card-foot">
        <span class="explore-link">${L==='hi'?'अन्वेषण करें →':'Explore →'}</span>
        ${d.verified ? '<span title="Verified" style="font-size:.78rem;color:#33513E;">✓ Verified</span>' : ''}
      </div>
    </div>
  </a>`;
}
function emptyState(msg){
  return `<div class="empty"><div class="em">🗺️</div><div>${msg}</div></div>`;
}
 
/* ---------------- views: EXPLORE ---------------- */
function viewExplore(){
  const L = STATE.lang;
  const qs = new URLSearchParams(STATE.route.split('?')[1] || '');
  if(qs.get('q') !== null) STATE.filters.search = qs.get('q');
  if(qs.get('cat') !== null && qs.get('cat') !== 'all') STATE.filters.category = qs.get('cat');
 
  let list = publishedDestinations();
  const f = STATE.filters;
  if(f.search) list = list.filter(d => (t(d,'name')+d.state+d.district).toLowerCase().includes(f.search.toLowerCase()));
  if(f.state) list = list.filter(d => d.state === f.state);
  if(f.category) list = list.filter(d => d.category === f.category);
  if(f.sort === 'name') list.sort((a,b)=> t(a,'name').localeCompare(t(b,'name')));
  if(f.sort === 'state') list.sort((a,b)=> a.state.localeCompare(b.state));
 
  const stateOptions = uniqueStates().map(s=>`<option value="${s}" ${f.state===s?'selected':''}>${s}</option>`).join('');
  const catOptions = CATEGORIES.map(c=>`<option value="${c.id}" ${f.category===c.id?'selected':''}>${L==='hi'?c.name_hi:c.name_en}</option>`).join('');
 
  return `
  <section class="wrap section">
    <div class="section-head"><h2>${L==='hi'?'भारत की विरासत का अन्वेषण करें':"Explore India's Heritage"}</h2></div>
    <div class="filters">
      <div class="field search-field">
        <label>${L==='hi'?'खोजें':'Search'}</label>
        <input id="fSearch" type="text" placeholder="${L==='hi'?'गंतव्य खोजें...':'Search destination...'}" value="${escapeHtml(f.search)}" oninput="updateFilter('search', this.value)"/>
      </div>
      <div class="field">
        <label>${L==='hi'?'राज्य':'State'}</label>
        <select onchange="updateFilter('state', this.value)"><option value="">${L==='hi'?'सभी':'All'}</option>${stateOptions}</select>
      </div>
      <div class="field">
        <label>${L==='hi'?'श्रेणी':'Category'}</label>
        <select onchange="updateFilter('category', this.value)"><option value="">${L==='hi'?'सभी':'All'}</option>${catOptions}</select>
      </div>
      <div class="field">
        <label>${L==='hi'?'क्रमबद्ध करें':'Sort'}</label>
        <select onchange="updateFilter('sort', this.value)">
          <option value="name" ${f.sort==='name'?'selected':''}>${L==='hi'?'नाम':'Name'}</option>
          <option value="state" ${f.sort==='state'?'selected':''}>${L==='hi'?'राज्य':'State'}</option>
        </select>
      </div>
      ${(f.search||f.state||f.category) ? `<button class="btn btn-ghost btn-sm" onclick="clearFilters()">${L==='hi'?'रीसेट':'Reset'}</button>` : ''}
    </div>
    <div class="result-count">${list.length} ${L==='hi'?'गंतव्य मिले':'destinations found'}</div>
    ${list.length ? `<div class="grid">${list.map(cardHtml).join('')}</div>` : emptyState(L==='hi'?'आपकी खोज से मेल खाने वाला कोई गंतव्य नहीं मिला। फ़िल्टर समायोजित करके पुनः प्रयास करें।':'No destinations match your search. Try adjusting the filters.')}
  </section>`;
}
window.updateFilter = function(key, val){
  STATE.filters[key] = val;
  renderApp();
  setTimeout(()=>{ const el=document.getElementById('fSearch'); if(el && key==='search'){ el.focus(); el.setSelectionRange(el.value.length, el.value.length);} }, 0);
};
window.clearFilters = function(){ STATE.filters = {search:'', state:'', category:'', sort:'name'}; renderApp(); };
 
/* ---------------- views: MAP ---------------- */
function viewMap(){
  const L = STATE.lang;
  return `
  <div class="map-layout">
    <aside class="map-sidebar">
      <h3 style="margin:0 0 4px;">${L==='hi'?'पास में खोजें':'Explore Nearby'}</h3>
      <p style="font-size:0.82rem;color:var(--charcoal-soft);margin:0 0 14px;">${L==='hi'?'अपने आस-पास की छुपी विरासत खोजने के लिए स्थान की अनुमति दें।':"Allow location access to find hidden heritage near you."}</p>
      <button class="btn btn-primary btn-sm" style="width:100%;justify-content:center;" onclick="locateMe()">📍 ${L==='hi'?'मेरा स्थान उपयोग करें':'Use My Location'}</button>
      <div class="radius-row" id="radiusRow">
        ${[10,25,50,100].map(r=>`<button class="${STATE.map.radius===r?'active':''}" onclick="setRadius(${r})">${r} km</button>`).join('')}
      </div>
      <div id="nearbyList"></div>
    </aside>
    <div id="googleMap"></div>
  </div>`;
}
window.setRadius = function(r){ STATE.map.radius = r; updateNearbyList(); document.querySelectorAll('#radiusRow button').forEach(b=>b.classList.remove('active')); event.target.classList.add('active'); };
window.locateMe = function(){
  if(!navigator.geolocation){ showToast('Geolocation not supported in this browser'); return; }
  showToast(STATE.lang==='hi' ? 'स्थान प्राप्त हो रहा है...' : 'Getting your location...');
  navigator.geolocation.getCurrentPosition(pos=>{
    STATE.map.userLoc = {lat:pos.coords.latitude, lng:pos.coords.longitude};
    if(STATE.map.instance){
      if(STATE.map.userMarker) STATE.map.instance.removeLayer(STATE.map.userMarker);
      STATE.map.userMarker = L.circleMarker([STATE.map.userLoc.lat, STATE.map.userLoc.lng], {
        radius: 8, color:'#fff', weight: 2, fillColor:'#BF5B34', fillOpacity:0.9
      }).addTo(STATE.map.instance).bindTooltip('You are here');
      STATE.map.instance.setView([STATE.map.userLoc.lat, STATE.map.userLoc.lng], 9);
    }
    updateNearbyList();
  }, err=>{
    showToast(STATE.lang==='hi' ? 'स्थान उपलब्ध नहीं — सामान्य ब्राउज़िंग जारी रखें' : 'Location unavailable — browse the map normally instead.');
  });
};
function updateNearbyList(){
  const host = document.getElementById('nearbyList');
  if(!host) return;
  if(!STATE.map.userLoc){
    host.innerHTML = `<div style="font-size:0.82rem;color:var(--charcoal-soft);">${STATE.lang==='hi'?'दूरी देखने के लिए अपना स्थान साझा करें।':'Share your location to see distances.'}</div>`;
    return;
  }
  const withDist = publishedDestinations().map(d=>({d, dist: haversine(STATE.map.userLoc.lat, STATE.map.userLoc.lng, d.lat, d.lng)}))
    .filter(x=>x.dist <= STATE.map.radius).sort((a,b)=>a.dist-b.dist);
  if(!withDist.length){ host.innerHTML = emptyState(STATE.lang==='hi'?'इस दायरे में कोई गंतव्य नहीं':'No destinations in this radius'); return; }
  host.innerHTML = `<div style="font-size:0.8rem;font-weight:700;margin:14px 0 10px;">${withDist.length} ${STATE.lang==='hi'?'गंतव्य आपके पास':'destinations near you'}</div>` +
    withDist.map(x=>`
    <div class="nearby-item" onclick="location.hash='/destination/${x.d.slug}'">
      <div class="nm">${escapeHtml(t(x.d,'name'))}</div>
      <div class="dist">${x.dist.toFixed(1)} km ${STATE.lang==='hi'?'दूर':'away'}</div>
    </div>`).join('');
}
function initMap(){
  const el = document.getElementById('googleMap');
  if(!el) return;
  const qs = new URLSearchParams(STATE.route.split('?')[1] || '');
  const focusLat = parseFloat(qs.get('lat'));
  const focusLng = parseFloat(qs.get('lng'));
  const focusSlug = qs.get('slug');
  const hasFocus = !isNaN(focusLat) && !isNaN(focusLng);
  loadGoogleMaps().then(()=>{
    // route may have changed while the script was loading
    if(document.getElementById('googleMap') !== el) return;
    // If this container already has a Leaflet map on it (e.g. re-render), tear it down first.
    if(el._leaflet_id){ el._leaflet_id = null; el.innerHTML = ''; }
    const map = hasFocus ? L.map(el).setView([focusLat, focusLng], 12) : L.map(el).setView([25.6, 85.8], 8);
    L.tileLayer(OSM_TILE_URL, { attribution: OSM_ATTRIBUTION, maxZoom: 19 }).addTo(map);
    STATE.map.instance = map;
    STATE.map.markers = [];
    let focusMarker = null;
    publishedDestinations().forEach(d=>{
      const isFocused = focusSlug ? d.slug === focusSlug : (hasFocus && Math.abs(d.lat-focusLat)<0.0001 && Math.abs(d.lng-focusLng)<0.0001);
      const color = CATEGORY_COLORS[d.category] || '#8A5A34';
      const marker = L.circleMarker([d.lat, d.lng], {
        radius: isFocused ? 13 : 9, color: isFocused ? '#BF5B34' : '#fff', weight: isFocused ? 3 : 2, fillColor: color, fillOpacity: 0.95
      }).addTo(map);
      marker.bindPopup(`
        <div style="min-width:170px;font-family:'Inter',sans-serif;">
          <div style="font-weight:700;margin-bottom:2px;">${escapeHtml(t(d,'name'))}</div>
          <div style="font-size:12px;color:#5B534A;margin-bottom:8px;">${fmtCategory(d.category)} · ${escapeHtml(d.district)}</div>
          <a href="#/destination/${d.slug}" style="font-size:12px;font-weight:700;color:#9C4726;">View Details →</a>
        </div>`);
      STATE.map.markers.push(marker);
      if(isFocused) focusMarker = marker;
    });
    if(focusMarker) focusMarker.openPopup();
    updateNearbyList();
  }).catch(()=>{
    el.innerHTML = `<div style="padding:24px;font-size:0.85rem;color:var(--charcoal-soft);">${STATE.lang==='hi'?'मानचित्र लोड नहीं हो सका। कृपया अपना इंटरनेट कनेक्शन जांचें।':'Map failed to load. Please check your internet connection.'}</div>`;
  });
}
 
/* ---------------- views: DESTINATION DETAIL ---------------- */
function viewDestination(slug){
  const L = STATE.lang;
  const d = findBySlug(slug);
  if(!d || (d.status !== 'published')){
    return `<div class="wrap section">${emptyState(L==='hi'?'गंतव्य नहीं मिला (404)':'Destination not found (404)')}<div style="text-align:center;"><a class="btn btn-primary" href="#/explore">${L==='hi'?'अन्वेषण पर वापस जाएं':'Back to Explore'}</a></div></div>`;
  }
  const color = CATEGORY_COLORS[d.category] || '#8A5A34';
  const tips = (d.tips||[]).map(tp=>`<div class="tip-row"><span class="tick">✓</span><span>${escapeHtml(L==='hi'?tp.hi:tp.en)}</span></div>`).join('');
  const sources = (d.sources||[]).map(s=>`
    <div class="source-card">
      <div><div class="org">${escapeHtml(s.organization)}</div><div class="sub">${escapeHtml(s.title)}</div></div>
      <a class="btn btn-ghost btn-sm" href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">↗</a>
    </div>`).join('');
  const nearby = (d.nearby||[]).map(n=>`
    <div class="source-card">
      <div>
        <div class="org">${escapeHtml(n.name)}</div>
        <div class="sub">${escapeHtml(n.note||'')}</div>
      </div>
      ${n.distance ? `<span style="font-size:0.78rem;font-weight:700;color:var(--terracotta-deep);white-space:nowrap;">${escapeHtml(n.distance)}</span>` : ''}
    </div>`).join('');
  return `
  <div class="wrap section">
    <div class="breadcrumb"><a href="#/">Home</a> / <a href="#/explore">Explore</a> / ${escapeHtml(t(d,'name'))}</div>
    <div class="detail-hero" style="${d.cover_image ? `background-image:linear-gradient(135deg, ${color}55, ${color}22), url('${escapeHtml(d.cover_image)}');` : `background:linear-gradient(135deg, ${color}, ${color}AA);`}">
      ${d.cover_image ? '' : `<span class="em">${CATEGORY_ICONS[d.category]||'🏛'}</span>`}
      <div class="hero-content">
        <span class="cat-badge">${fmtCategory(d.category)}</span>
        <h1 ${L==='hi'?'data-hi="1"':''}>${escapeHtml(t(d,'name'))}</h1>
        <div class="loc">📍 ${escapeHtml(d.district)}, ${escapeHtml(d.state)}</div>
      </div>
    </div>
    <div class="detail-actions">
      <a class="btn btn-primary" href="#/map?lat=${d.lat}&lng=${d.lng}&slug=${encodeURIComponent(d.slug)}">🗺️ ${L==='hi'?'नक्शे पर देखें':'View on Map'}</a>
      <a class="btn btn-ghost" href="https://www.openstreetmap.org/directions?to=${d.lat}%2C${d.lng}" target="_blank" rel="noopener noreferrer">🧭 ${L==='hi'?'दिशा प्राप्त करें':'Get Directions'}</a>
    </div>
    <div class="detail-layout">
      <div class="prose" data-hi="${L==='hi'}">
        <h2>${L==='hi'?'परिचय':'About'}</h2>
        <p>${escapeHtml(t(d,'about'))}</p>
        <h2>${L==='hi'?'इतिहास':'History'}</h2>
        <p>${escapeHtml(t(d,'history'))}</p>
        <h2>${L==='hi'?'सांस्कृतिक महत्व':'Cultural Significance'}</h2>
        <p>${escapeHtml(t(d,'culture'))}</p>
        <h2>${L==='hi'?'क्या अनुभव करें':'What to Experience'}</h2>
        <div class="experience-cards">
          <div class="exp-card">🏛 ${L==='hi'?'वास्तुकला':'Architecture'}</div>
          <div class="exp-card">📜 ${L==='hi'?'इतिहास':'History'}</div>
          <div class="exp-card">🎨 ${L==='hi'?'स्थानीय संस्कृति':'Local Culture'}</div>
          <div class="exp-card">🧑‍🤝‍🧑 ${L==='hi'?'समुदाय':'Community'}</div>
        </div>
        <h2>${L==='hi'?'यात्रा का सर्वोत्तम समय':'Best Time to Visit'}</h2>
        <p>${escapeHtml(t(d,'best_time'))}</p>
        ${(d.images && d.images.length) ? `
        <h2>${L==='hi'?'तस्वीरें':'Photos'}</h2>
        <div class="gallery-grid">
          ${d.images.map(img=>`<img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.alt||t(d,'name'))}" onclick="openImageLightbox(this.src)"/>`).join('')}
        </div>` : ''}
        ${reviewsAndCommentsSection(d, L)}
      </div>
      <div class="sidebar">
        <div class="side-card">
          <h3>🌱 ${L==='hi'?'जिम्मेदारी से यात्रा करें':'Travel Responsibly'}</h3>
          ${tips || `<div style="font-size:0.85rem;color:var(--charcoal-soft);">${L==='hi'?'इस गंतव्य के लिए कोई विशेष दिशानिर्देश दर्ज नहीं किए गए।':'No destination-specific guidelines recorded yet.'}</div>`}
        </div>
        <div class="side-card">
          <h3>📚 ${L==='hi'?'सत्यापित जानकारी':'Verified Information'}</h3>
          ${d.verified ? `<div class="verified-strip">✓ ${L==='hi'?'सत्यापित सूत्रों से संकलित':'Compiled from verified sources'}</div>` : ''}
          ${sources || `<div style="font-size:0.85rem;color:var(--charcoal-soft);">${L==='hi'?'कोई सूत्र दर्ज नहीं':'No sources recorded'}</div>`}
        </div>
        <div class="side-card">
          <h3>📍 ${L==='hi'?'आस-पास के प्रसिद्ध स्थान':'Nearby Places'}</h3>
          ${nearby || `<div style="font-size:0.85rem;color:var(--charcoal-soft);">${L==='hi'?'अभी कोई आस-पास का स्थान दर्ज नहीं किया गया':'No nearby places added yet.'}</div>`}
        </div>
      </div>
    </div>
  </div>`;
}
 
/* ---------------- ADMIN: login ---------------- */
function viewAdminLogin(loginError){
  return `
  <div class="admin-login-wrap">
    <div class="admin-login-card">
      <h1>Hidden India Admin</h1>
      <p class="hint">Sign in with your admin account.</p>
      ${loginError ? `<div class="form-error">${escapeHtml(loginError)}</div>` : ''}
      <form onsubmit="return adminLogin(event)">
        <div class="form-group"><label>Email</label><input name="email" type="email" required/></div>
        <div class="form-group"><label>Password</label><input name="password" type="password" required/></div>
        <button class="btn btn-primary" type="submit" style="width:100%;justify-content:center;">Login</button>
      </form>
      <div style="margin-top:16px;text-align:center;"><a href="#/" style="font-size:0.82rem;color:var(--charcoal-soft);">← Back to site</a></div>
    </div>
  </div>`;
}
window.adminLogin = async function(e){
  e.preventDefault();
  const f = e.target;
  try{
    const { token } = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: f.email.value.trim(), password: f.password.value }),
    });
    setAdminToken(token);
    STATE.admin.loggedIn = true;
    await loadData();
    location.hash = '/admin/dashboard';
    renderApp();
  } catch(err) {
    renderApp(err.message || 'Invalid email or password.');
  }
  return false;
};
window.adminLogout = async function(){
  setAdminToken(null);
  STATE.admin.loggedIn = false;
  await loadData();
  location.hash = '/admin';
};
 
/* ---------------- ADMIN: shell ---------------- */
function adminTab(href,label){
  const active = STATE.route === href ? 'active' : '';
  return `<a class="${active}" href="#${href}">${label}</a>`;
}
function adminLayout(content){
  return `
  <div class="admin-shell">
    <div class="admin-topbar">
      <strong style="font-family:'Fraunces',serif;">🇮🇳 Hidden India Admin</strong>
      <div class="admin-tabs">
        ${adminTab('/admin/dashboard','Dashboard')}
        ${adminTab('/admin/destinations','Destinations')}
        ${adminTab('/admin/import','Import Data')}
      </div>
      <div style="flex:1;"></div>
      <a href="#/" class="btn btn-outline-light btn-sm">View Site</a>
      <button class="btn btn-outline-light btn-sm" onclick="adminLogout()">Logout</button>
    </div>
    <div class="admin-body">${content}</div>
  </div>`;
}
 
function viewAdminDashboard(){
  const total = STATE.destinations.length;
  const published = STATE.destinations.filter(d=>d.status==='published').length;
  const drafts = total - published;
  const sources = STATE.destinations.reduce((n,d)=>n+(d.sources?.length||0),0);
  const recent = [...STATE.destinations].sort((a,b)=> (b.updated_at||0)-(a.updated_at||0)).slice(0,6);
  return adminLayout(`
    <div class="admin-toolbar">
      <h2 style="margin:0;">Dashboard</h2>
      <div style="display:flex;gap:10px;">
        <a class="btn btn-primary btn-sm" href="#" onclick="openDestinationModal(); return false;">+ Add Destination</a>
        <a class="btn btn-ghost btn-sm" href="#/admin/import">+ Import Data</a>
      </div>
    </div>
    <div class="stat-grid">
      <div class="stat-card"><div class="n">${total}</div><div class="l">Destinations</div></div>
      <div class="stat-card"><div class="n">${published}</div><div class="l">Published</div></div>
      <div class="stat-card"><div class="n">${drafts}</div><div class="l">Drafts</div></div>
      <div class="stat-card"><div class="n">${sources}</div><div class="l">Verified Sources</div></div>
      <div class="stat-card"><div class="n">${CATEGORIES.length}</div><div class="l">Categories</div></div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Destination</th><th>State</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${recent.map(d=>`<tr>
            <td>${escapeHtml(d.name_en)}</td><td>${escapeHtml(d.state)}</td>
            <td><span class="status-pill ${d.status==='published'?'pill-published':'pill-draft'}">${d.status}</span></td>
            <td><button onclick="openDestinationModal('${d.id}')">Edit</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  `);
}
 
function viewAdminDestinations(){
  const list = STATE.destinations;
  return adminLayout(`
    <div class="admin-toolbar">
      <h2 style="margin:0;">Destinations</h2>
      <button class="btn btn-primary btn-sm" onclick="openDestinationModal()">+ Add Destination</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Destination</th><th>State</th><th>Category</th><th>Status</th><th>Verified</th><th>Actions</th></tr></thead>
        <tbody>
          ${list.map(d=>`<tr>
            <td>${escapeHtml(d.name_en)}</td>
            <td>${escapeHtml(d.state)}</td>
            <td>${fmtCategory(d.category)}</td>
            <td><span class="status-pill ${d.status==='published'?'pill-published':'pill-draft'}">${d.status}</span></td>
            <td>${d.verified?'✓':'—'}</td>
            <td class="row-actions">
              <button onclick="openDestinationModal('${d.id}')">Edit</button>
              <a href="#/destination/${d.slug}" target="_blank"><button>Preview</button></a>
              <button onclick="togglePublish('${d.id}')">${d.status==='published'?'Unpublish':'Publish'}</button>
              <button onclick="deleteDestination('${d.id}')" style="color:#A8412E;">Delete</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  `);
}
 
window.togglePublish = async function(id){
  const d = findById(id); if(!d) return;
  const newStatus = d.status==='published' ? 'draft' : 'published';
  try{
    await apiFetch(`/api/admin/destinations/${id}`, { method:'PUT', body: JSON.stringify({ status:newStatus }) });
    await loadData(); renderApp();
    showToast(`${d.name_en} ${newStatus==='published'?'published':'unpublished'}.`);
  }catch(e){ showToast('⚠ ' + e.message); }
};
window.deleteDestination = async function(id){
  const d = findById(id); if(!d) return;
  if(!confirm(`Delete "${d.name_en}"? This cannot be undone.`)) return;
  try{
    await apiFetch(`/api/admin/destinations/${id}`, { method:'DELETE' });
    await loadData(); renderApp();
    closeModal();
    showToast('Destination deleted.');
  }catch(e){ showToast('⚠ ' + e.message); }
};
 
/* ---------------- ADMIN: destination form modal ---------------- */
window.openDestinationModal = function(id){
  const d = id ? findById(id) : null;
  const isEdit = !!d;
  const v = d || {name_en:'',name_hi:'',state:'',district:'',category:'heritage',lat:'',lng:'',
    short_en:'',short_hi:'',about_en:'',about_hi:'',history_en:'',history_hi:'',culture_en:'',culture_hi:'',
    best_time_en:'',best_time_hi:'',cover_image:'', status:'draft', verified:false,
    tips:[{en:'',hi:''}], sources:[{organization:'',title:'',url:''}], nearby:[{name:'',distance:'',note:''}]};
  window.__modalImages = { cover: v.cover_image || '', gallery: JSON.parse(JSON.stringify(v.images||[])) };
  const catOpts = CATEGORIES.map(c=>`<option value="${c.id}" ${v.category===c.id?'selected':''}>${c.name_en}</option>`).join('');
  const tipsHtml = v.tips.map((tp,i)=>`
    <div class="dynamic-row" data-tip-row>
      <input placeholder="Tip (English)" value="${escapeHtml(tp.en)}" data-tip-en/>
      <input placeholder="Tip (Hindi)" value="${escapeHtml(tp.hi||'')}" data-tip-hi/>
      <button type="button" class="remove-row" onclick="this.closest('[data-tip-row]').remove()">✕</button>
    </div>`).join('');
  const sourcesHtml = v.sources.map((s,i)=>`
    <div class="dynamic-row" data-source-row>
      <input placeholder="Organization" value="${escapeHtml(s.organization)}" data-src-org/>
      <input placeholder="Title" value="${escapeHtml(s.title)}" data-src-title/>
      <input placeholder="URL" value="${escapeHtml(s.url)}" data-src-url/>
      <button type="button" class="remove-row" onclick="this.closest('[data-source-row]').remove()">✕</button>
    </div>`).join('');
  const nearbyHtml = (v.nearby||[]).map((n,i)=>`
    <div class="dynamic-row" data-nearby-row>
      <input placeholder="Place name" value="${escapeHtml(n.name)}" data-nearby-name/>
      <input placeholder="Distance (e.g. 12 km)" value="${escapeHtml(n.distance||'')}" data-nearby-distance/>
      <input placeholder="Short note" value="${escapeHtml(n.note||'')}" data-nearby-note/>
      <button type="button" class="remove-row" onclick="this.closest('[data-nearby-row]').remove()">✕</button>
    </div>`).join('');
 
  const modalHtml = `
  <div class="modal-overlay" id="destModalOverlay" onclick="if(event.target===this) closeModal()">
    <div class="modal">
      <button class="close-x" onclick="closeModal()">✕</button>
      <h2>${isEdit?'Edit Destination':'Add Destination'}</h2>
      <p style="font-size:0.82rem;color:var(--charcoal-soft);margin:0 0 6px;">Fields marked EN/HI are stored separately so the public site never needs live translation.</p>
      <form id="destForm" onsubmit="return saveDestination(event, '${id||''}')">
        <div class="form-section-title">Basic Information</div>
        <div class="form-grid">
          <div class="form-group"><label>Name (English)</label><input name="name_en" required value="${escapeHtml(v.name_en)}"/></div>
          <div class="form-group"><label>Name (Hindi)</label><input name="name_hi" value="${escapeHtml(v.name_hi)}"/></div>
          <div class="form-group"><label>State</label><input name="state" required value="${escapeHtml(v.state)}"/></div>
          <div class="form-group"><label>District</label><input name="district" required value="${escapeHtml(v.district)}"/></div>
          <div class="form-group">
            <label>Category</label>
            <select name="category" onchange="toggleCustomCategory(this.value)">${catOpts}<option value="__custom__">+ Naya category likhein</option></select>
            <input type="text" id="customCategoryInput" placeholder="Naya category ka naam" style="display:none;margin-top:8px;"/>
          </div>
          <div class="form-group"><label>Latitude</label><input name="lat" type="number" step="any" required value="${v.lat}"/></div>
          <div class="form-group"><label>Longitude</label><input name="lng" type="number" step="any" required value="${v.lng}"/></div>
        </div>
 
        <div class="form-section-title">Images</div>
        <div class="form-grid">
          <div class="form-group">
            <label>Cover Image</label>
            <div id="coverUploadBox" class="img-upload-box ${v.cover_image?'has-image':''}" onclick="if(event.target.tagName!=='BUTTON') document.getElementById('coverFileInput').click()">
              ${v.cover_image ? `<img src="${escapeHtml(v.cover_image)}" alt="cover preview"/><button type="button" class="img-remove-btn" onclick="event.stopPropagation(); removeCoverImage()">✕</button>` : `<div class="up-hint">📷<br/>Click to upload a cover photo<br/><span style="font-size:0.72rem;">JPG/PNG, auto-resized</span></div>`}
            </div>
            <input type="file" id="coverFileInput" accept="image/*" style="display:none;" onchange="handleCoverFile(this.files[0])"/>
            <div id="coverUploadStatus" class="upload-progress"></div>
            <label style="margin-top:10px;">or paste an image URL</label>
            <input id="coverUrlInput" placeholder="https://..." value="${(v.cover_image||'').startsWith('data:') ? '' : escapeHtml(v.cover_image||'')}" oninput="setCoverFromUrl(this.value)"/>
          </div>
          <div class="form-group">
            <label>Additional Photos (gallery)</label>
            <div id="galleryGrid" class="gallery-upload-grid">
              ${(v.images||[]).map((img,i)=>`<div class="gallery-thumb" data-gallery-idx="${i}"><img src="${escapeHtml(img.url)}"/><button type="button" class="img-remove-btn" onclick="removeGalleryImage(${i})">✕</button></div>`).join('')}
              <div class="gallery-add-btn" onclick="document.getElementById('galleryFileInput').click()">+</div>
            </div>
            <input type="file" id="galleryFileInput" accept="image/*" multiple style="display:none;" onchange="handleGalleryFiles(this.files)"/>
            <div id="galleryUploadStatus" class="upload-progress"></div>
          </div>
        </div>
 
        <div class="form-section-title">Content</div>
        <div class="form-grid">
          <div class="form-group"><label>Short Description (EN)</label><textarea name="short_en" required>${escapeHtml(v.short_en)}</textarea></div>
          <div class="form-group"><label>Short Description (HI)</label><textarea name="short_hi">${escapeHtml(v.short_hi)}</textarea></div>
          <div class="form-group"><label>About (EN)</label><textarea name="about_en" required>${escapeHtml(v.about_en)}</textarea></div>
          <div class="form-group"><label>About (HI)</label><textarea name="about_hi">${escapeHtml(v.about_hi)}</textarea></div>
          <div class="form-group"><label>History (EN)</label><textarea name="history_en">${escapeHtml(v.history_en)}</textarea></div>
          <div class="form-group"><label>History (HI)</label><textarea name="history_hi">${escapeHtml(v.history_hi)}</textarea></div>
          <div class="form-group"><label>Cultural Significance (EN)</label><textarea name="culture_en">${escapeHtml(v.culture_en)}</textarea></div>
          <div class="form-group"><label>Cultural Significance (HI)</label><textarea name="culture_hi">${escapeHtml(v.culture_hi)}</textarea></div>
          <div class="form-group"><label>Best Time to Visit (EN)</label><input name="best_time_en" value="${escapeHtml(v.best_time_en)}"/></div>
          <div class="form-group"><label>Best Time to Visit (HI)</label><input name="best_time_hi" value="${escapeHtml(v.best_time_hi)}"/></div>
        </div>
        <div class="form-section-title">Responsible Tourism Tips</div>
        <div id="tipsList">${tipsHtml}</div>
        <button type="button" class="btn btn-ghost btn-sm" onclick="addDynamicRow('tipsList','tip')">+ Add Tip</button>
 
        <div class="form-section-title">Verified Sources</div>
        <div id="sourcesList">${sourcesHtml}</div>
        <button type="button" class="btn btn-ghost btn-sm" onclick="addDynamicRow('sourcesList','source')">+ Add Source</button>
 
        <div class="form-section-title">Nearby Places</div>
        <div id="nearbyList2">${nearbyHtml}</div>
        <button type="button" class="btn btn-ghost btn-sm" onclick="addDynamicRow('nearbyList2','nearby')">+ Add Nearby Place</button>
 
        <div class="form-section-title">Publishing</div>
        <div class="form-grid">
          <div class="form-group"><label>Status</label><select name="status"><option value="draft" ${v.status==='draft'?'selected':''}>Draft</option><option value="published" ${v.status==='published'?'selected':''}>Published</option></select></div>
          <div class="form-group"><label style="display:flex;align-items:center;gap:8px;font-weight:600;text-transform:none;letter-spacing:0;"><input type="checkbox" name="verified" style="width:auto;" ${v.verified?'checked':''}/> Information verified</label></div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
          ${isEdit ? `<button type="button" class="btn" style="color:#A8412E;" onclick="deleteDestination('${id}')">Delete</button>` : ''}
          <button type="submit" class="btn btn-primary">${isEdit?'Save Changes':'Add Destination'}</button>
        </div>
      </form>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};
window.addDynamicRow = function(listId, kind){
  const el = document.getElementById(listId);
  const row = document.createElement('div');
  if(kind==='tip'){
    row.className='dynamic-row'; row.setAttribute('data-tip-row','');
    row.innerHTML = `<input placeholder="Tip (English)" data-tip-en/><input placeholder="Tip (Hindi)" data-tip-hi/><button type="button" class="remove-row" onclick="this.closest('[data-tip-row]').remove()">✕</button>`;
  } else if(kind==='nearby'){
    row.className='dynamic-row'; row.setAttribute('data-nearby-row','');
    row.innerHTML = `<input placeholder="Place name" data-nearby-name/><input placeholder="Distance (e.g. 12 km)" data-nearby-distance/><input placeholder="Short note" data-nearby-note/><button type="button" class="remove-row" onclick="this.closest('[data-nearby-row]').remove()">✕</button>`;
  } else {
    row.className='dynamic-row'; row.setAttribute('data-source-row','');
    row.innerHTML = `<input placeholder="Organization" data-src-org/><input placeholder="Title" data-src-title/><input placeholder="URL" data-src-url/><button type="button" class="remove-row" onclick="this.closest('[data-source-row]').remove()">✕</button>`;
  }
  el.appendChild(row);
};
window.toggleCustomCategory = function(val){
  const box = document.getElementById('customCategoryInput');
  if(box) box.style.display = val === '__custom__' ? 'block' : 'none';
};
/* ---- image upload helpers ---- */
function compressImageFile(file, maxWidth, quality){
  return new Promise((resolve, reject)=>{
    if(!file.type.startsWith('image/')){ reject(new Error('Not an image file')); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode image'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
window.setCoverFromUrl = function(url){
  window.__modalImages.cover = url.trim();
  const box = document.getElementById('coverUploadBox');
  if(!box) return;
  if(window.__modalImages.cover){
    box.classList.add('has-image');
    box.innerHTML = `<img src="${escapeHtml(window.__modalImages.cover)}" alt="cover preview" onerror="this.parentElement.classList.remove('has-image'); this.parentElement.innerHTML='<div class=up-hint>⚠️ Could not load that URL</div>';"/><button type="button" class="img-remove-btn" onclick="event.stopPropagation(); removeCoverImage()">✕</button>`;
  }
};
window.handleCoverFile = async function(file){
  if(!file) return;
  const statusEl = document.getElementById('coverUploadStatus');
  statusEl.textContent = 'Processing image…';
  try{
    const dataUrl = await compressImageFile(file, 1200, 0.82);
    window.__modalImages.cover = dataUrl;
    const box = document.getElementById('coverUploadBox');
    box.classList.add('has-image');
    box.innerHTML = `<img src="${dataUrl}" alt="cover preview"/><button type="button" class="img-remove-btn" onclick="event.stopPropagation(); removeCoverImage()">✕</button>`;
    const urlInput = document.getElementById('coverUrlInput'); if(urlInput) urlInput.value = '';
    statusEl.textContent = `Uploaded — ${Math.round(dataUrl.length/1024)} KB`;
  }catch(err){
    statusEl.textContent = 'Could not process that image. Try a smaller JPG or PNG.';
  }
};
window.removeCoverImage = function(){
  window.__modalImages.cover = '';
  const box = document.getElementById('coverUploadBox');
  box.classList.remove('has-image');
  box.innerHTML = `<div class="up-hint">📷<br/>Click to upload a cover photo<br/><span style="font-size:0.72rem;">JPG/PNG, auto-resized</span></div>`;
  const urlInput = document.getElementById('coverUrlInput'); if(urlInput) urlInput.value = '';
  document.getElementById('coverUploadStatus').textContent = '';
};
window.handleGalleryFiles = async function(files){
  const statusEl = document.getElementById('galleryUploadStatus');
  statusEl.textContent = `Processing ${files.length} image(s)…`;
  for(const file of files){
    try{
      const dataUrl = await compressImageFile(file, 1000, 0.8);
      window.__modalImages.gallery.push({ url: dataUrl, alt: '', is_cover:false });
    }catch(err){ /* skip file that fails */ }
  }
  renderGalleryGrid();
  statusEl.textContent = `${window.__modalImages.gallery.length} photo(s) added.`;
};
window.removeGalleryImage = function(i){
  window.__modalImages.gallery.splice(i,1);
  renderGalleryGrid();
};
function renderGalleryGrid(){
  const grid = document.getElementById('galleryGrid');
  if(!grid) return;
  grid.innerHTML = window.__modalImages.gallery.map((img,i)=>
    `<div class="gallery-thumb" data-gallery-idx="${i}"><img src="${img.url}"/><button type="button" class="img-remove-btn" onclick="removeGalleryImage(${i})">✕</button></div>`
  ).join('') + `<div class="gallery-add-btn" onclick="document.getElementById('galleryFileInput').click()">+</div>`;
}
 
window.closeModal = function(){ const m = document.getElementById('destModalOverlay'); if(m) m.remove(); window.__modalImages = null; };
window.toggleMobileNav = function(){
  const panel = document.getElementById('mobileNavPanel');
  const btn = document.querySelector('.hamburger');
  if(!panel) return;
  panel.classList.toggle('open');
  if(btn) btn.classList.toggle('open');
};
window.openImageLightbox = function(src){
  const old = document.getElementById('imgLightboxOverlay'); if(old) old.remove();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'imgLightboxOverlay';
  overlay.onclick = function(e){ if(e.target === overlay) window.closeImageLightbox(); };
  const img = document.createElement('img');
  img.src = src;
  img.style.cssText = 'max-width:92vw;max-height:92vh;border-radius:8px;object-fit:contain;display:block;';
  const btn = document.createElement('button');
  btn.className = 'close-x';
  btn.style.cssText = 'position:fixed;top:20px;right:24px;';
  btn.textContent = '✕';
  btn.onclick = function(){ window.closeImageLightbox(); };
  overlay.appendChild(img);
  overlay.appendChild(btn);
  document.body.appendChild(overlay);
};
window.closeImageLightbox = function(){
  const o = document.getElementById('imgLightboxOverlay'); if(o) o.remove();
};
 
window.saveDestination = async function(e, id){
  e.preventDefault();
  const f = e.target;
  const fd = new FormData(f);
  const tips = [...document.querySelectorAll('[data-tip-row]')].map(r=>({
    en: r.querySelector('[data-tip-en]').value.trim(), hi: r.querySelector('[data-tip-hi]').value.trim()
  })).filter(t=>t.en);
  const sources = [...document.querySelectorAll('[data-source-row]')].map(r=>({
    organization: r.querySelector('[data-src-org]').value.trim(),
    title: r.querySelector('[data-src-title]').value.trim(),
    url: r.querySelector('[data-src-url]').value.trim(),
  })).filter(s=>s.organization);
  const nearby = [...document.querySelectorAll('[data-nearby-row]')].map(r=>({
    name: r.querySelector('[data-nearby-name]').value.trim(),
    distance: r.querySelector('[data-nearby-distance]').value.trim(),
    note: r.querySelector('[data-nearby-note]').value.trim(),
  })).filter(n=>n.name);
 
  const data = {
    name_en: fd.get('name_en').trim(), name_hi: fd.get('name_hi').trim(),
    state: fd.get('state').trim(), district: fd.get('district').trim(),
    category: fd.get('category') === '__custom__'
      ? (document.getElementById('customCategoryInput').value.trim().toLowerCase().replace(/\s+/g,'-'))
      : fd.get('category'),
    lat: parseFloat(fd.get('lat')), lng: parseFloat(fd.get('lng')),
    short_en: fd.get('short_en').trim(), short_hi: fd.get('short_hi').trim(),
    about_en: fd.get('about_en').trim(), about_hi: fd.get('about_hi').trim(),
    history_en: fd.get('history_en').trim(), history_hi: fd.get('history_hi').trim(),
    culture_en: fd.get('culture_en').trim(), culture_hi: fd.get('culture_hi').trim(),
    best_time_en: fd.get('best_time_en').trim(), best_time_hi: fd.get('best_time_hi').trim(),
    cover_image: (window.__modalImages && window.__modalImages.cover) || '',
    images: (window.__modalImages && window.__modalImages.gallery) || [],
    status: fd.get('status'), verified: fd.get('verified') === 'on',
    tips, sources, nearby,
  };
  if(fd.get('category') === '__custom__' && !data.category){ alert('Please type a name for the new category.'); return false; }
  if(isNaN(data.lat) || isNaN(data.lng)){ alert('Latitude and longitude must be valid numbers.'); return false; }
  const approxSize = JSON.stringify(data).length;
  if(approxSize > 4200000){ alert('These images are too large to save (over ~4MB total). Please remove a photo or use smaller files.'); return false; }
 
  try{
    if(id){
      await apiFetch(`/api/admin/destinations/${id}`, { method:'PUT', body: JSON.stringify(data) });
    } else {
      await apiFetch('/api/admin/destinations', { method:'POST', body: JSON.stringify(data) });
    }
    await loadData();
    closeModal();
    renderApp();
    showToast(id ? 'Destination updated.' : 'Destination added.');
  }catch(err){
    alert('Could not save: ' + err.message);
  }
  return false;
};
 
/* ---------------- ADMIN: import ---------------- */
const IMPORT_COLUMNS = ['name_en','name_hi','state','district','category','latitude','longitude','short_description_en','short_description_hi','description_en','description_hi','best_time_en','cover_image','verified'];
function viewAdminImport(){
  const step = STATE.importDraft.step;
  return adminLayout(`
    <h2 style="margin:0 0 6px;">Bulk Destination Import</h2>
    <p style="font-size:0.85rem;color:var(--charcoal-soft);margin:0 0 22px;">Upload a CSV file to add multiple destinations at once. Nothing is written to the database until you confirm the preview.</p>
    <div class="import-steps">
      <div class="import-step ${step>=1?'active':''}">1. Upload File</div>
      <div class="import-step ${step>=2?'active':''}">2. Validate</div>
      <div class="import-step ${step>=3?'active':''}">3. Preview</div>
      <div class="import-step ${step>=4?'active':''}">4. Import</div>
    </div>
    <div style="margin-bottom:20px;display:flex;gap:10px;">
      <button class="btn btn-ghost btn-sm" onclick="downloadTemplate()">⬇ Download CSV Template</button>
    </div>
    ${step===1 ? `
      <div class="dropzone" id="dropzone">
        <div style="font-size:2rem;margin-bottom:10px;">📄</div>
        <p style="margin:0 0 14px;font-size:0.9rem;color:var(--charcoal-soft);">Drag & drop a CSV file here, or</p>
        <input type="file" id="csvFile" accept=".csv" style="display:none;" onchange="handleCsvFile(this.files[0])"/>
        <button class="btn btn-primary btn-sm" onclick="document.getElementById('csvFile').click()">Browse Files</button>
      </div>` : ''}
    <div id="importPreviewHost"></div>
  `);
}
window.downloadTemplate = function(){
  const header = IMPORT_COLUMNS.join(',');
  const sample = ['Sonepur Heritage Site','सोनपुर विरासत स्थल','Bihar','Saran','heritage','25.69','85.19','A sample entry','एक उदाहरण प्रविष्टि','Longer description here','', 'October to March','', 'true'].join(',');
  const csv = header + '\n' + sample;
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'hidden-india-import-template.csv';
  document.body.appendChild(a); a.click(); a.remove();
};
function parseCSV(text){
  const lines = text.split(/\r?\n/).filter(l=>l.trim().length);
  if(!lines.length) return [];
  const headers = lines[0].split(',').map(h=>h.trim());
  return lines.slice(1).map(line=>{
    // basic CSV split respecting simple quoted fields
    const cells = []; let cur=''; let inQuotes=false;
    for(let i=0;i<line.length;i++){
      const ch=line[i];
      if(ch==='"'){ inQuotes=!inQuotes; continue; }
      if(ch===',' && !inQuotes){ cells.push(cur); cur=''; continue; }
      cur+=ch;
    }
    cells.push(cur);
    const row={};
    headers.forEach((h,i)=> row[h] = (cells[i]||'').trim());
    return row;
  });
}
window.handleCsvFile = function(file){
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const rows = parseCSV(reader.result);
    const validated = rows.map((r,i)=>{
      const errors = [];
      if(!r.name_en) errors.push('Missing name_en');
      if(!r.state) errors.push('Missing state');
      if(!r.latitude || isNaN(parseFloat(r.latitude))) errors.push('Invalid latitude');
      if(!r.longitude || isNaN(parseFloat(r.longitude))) errors.push('Invalid longitude');
      return { row:i+2, data:r, errors, valid: errors.length===0 };
    });
    STATE.importDraft = { rows: validated, step: 3 };
    renderApp();
  };
  reader.readAsText(file);
};
function renderImportPreview(){
  const host = document.getElementById('importPreviewHost');
  if(!host || !STATE.importDraft.rows) return;
  const rows = STATE.importDraft.rows;
  const valid = rows.filter(r=>r.valid).length;
  const errors = rows.length - valid;
  host.innerHTML = `
    <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);">
      <div class="stat-card"><div class="n">${rows.length}</div><div class="l">Total Rows</div></div>
      <div class="stat-card"><div class="n" style="color:#33513E;">${valid}</div><div class="l">Valid</div></div>
      <div class="stat-card"><div class="n" style="color:#A8412E;">${errors}</div><div class="l">Errors</div></div>
    </div>
    <div class="table-wrap" style="margin-bottom:20px;">
      <table>
        <thead><tr><th>Row</th><th>Name</th><th>State</th><th>Status</th></tr></thead>
        <tbody>
          ${rows.map(r=>`<tr>
            <td>${r.row}</td>
            <td>${escapeHtml(r.data.name_en || '—')}</td>
            <td>${escapeHtml(r.data.state || '—')}</td>
            <td>${r.valid ? '<span class="preview-badge-ok">✓ Valid</span>' : `<span class="preview-badge-err">⚠ ${r.errors.join(', ')}</span>`}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div style="display:flex;gap:10px;">
      <button class="btn btn-primary" ${valid===0?'disabled':''} onclick="confirmImport()">Import ${valid} Valid Record${valid===1?'':'s'}</button>
      <button class="btn btn-ghost" onclick="resetImport()">Start Over</button>
    </div>
  `;
}
window.resetImport = function(){ STATE.importDraft = {rows:null, step:1}; renderApp(); };
window.confirmImport = async function(){
  const rows = STATE.importDraft.rows.filter(r=>r.valid).map(r=>r.data);
  try{
    const result = await apiFetch('/api/admin/destinations/import', {
      method:'POST', body: JSON.stringify({ rows }),
    });
    await loadData();
    STATE.importDraft = {rows:null, step:1};
    renderApp();
    showToast(`✓ ${result.imported} destinations imported as drafts.${result.failed ? ` (${result.failed} failed)` : ''}`);
  }catch(e){
    showToast('⚠ ' + e.message);
  }
};
 
/* ---------------- router / render ---------------- */
function currentPath(){ return STATE.route.split('?')[0]; }
 
function renderApp(loginError){
  const path = currentPath();
  let content;
 
  if(path.startsWith('/admin')){
    if(!STATE.admin.loggedIn){ content = viewAdminLogin(loginError); }
    else if(path === '/admin' || path === '/admin/dashboard') content = viewAdminDashboard();
    else if(path === '/admin/destinations') content = viewAdminDestinations();
    else if(path === '/admin/import') content = viewAdminImport();
    else content = viewAdminDashboard();
  } else if(path === '/' || path === '') {
    content = layout(viewHome());
  } else if(path === '/explore') {
    content = layout(viewExplore());
  } else if(path === '/map') {
    content = layout(viewMap());
  } else if(path.startsWith('/destination/')) {
    content = layout(viewDestination(path.split('/destination/')[1]));
  } else {
    content = layout(`<div class="wrap section">${emptyState('Page not found')}</div>`);
  }
 
  document.getElementById('app').innerHTML = content;
  if(path === '/map') initMap();
  if(path === '/admin/import') renderImportPreview();
  window.scrollTo(0,0);
}
function render(){ renderApp(); }
window.setLang = function(l){ STATE.lang = l; renderApp(); };
 
/* ---------------- boot ---------------- */
(async function boot(){
  document.getElementById('app').innerHTML = `<div class="wrap section"><div class="skeleton" style="height:40px;width:240px;margin-bottom:20px;"></div><div class="grid">${'<div class="skeleton" style="height:220px;"></div>'.repeat(3)}</div></div>`;
  await loadData();
  render();
})();
 