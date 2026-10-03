(()=>{
  'use strict';

  const FRONTEND_BUILD='manager-pwa-v0.5.2b5t-unified-test-player-detection';

  const cfg=Object.freeze({...{
    BUILD:'manager-pwa-v0.5.2b5t-unified-test-player-detection',DATA_MODE:'supabase',SUPABASE_URL:'',SUPABASE_PUBLISHABLE_KEY:'',DEFAULT_SEASON:'2026/27',DEFAULT_AREA:'competition'
  },...(window.CC_MANAGER_CONFIG||{})});

  const AREAS={
    mass:{label:'Tömegsport',glyph:'△',modules:[
      ['trainings','Edzések','◇'],['athletes','Sportolók','○'],['calendar','Naptár','□'],['archive','Archívum','⌁']
    ]},
    competition:{label:'Versenysport',glyph:'◇',modules:[
      ['overview','Áttekintés','△'],['trainings','Edzések','◇'],['matches','Meccsek','◆'],['teams','Csapatok','▱'],['players','Játékosok','○'],['calendar','Naptár','□'],['notifications','Értesítések','◉']
    ]}
  };

  const CC_BRSZ_BEAC_MATCH_IMPORT_V1=Object.freeze([{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2026-10-12","time":"19:30","home":"BEAC","away":"PDSE","homeAway":"home","venue":"XI. Bogdánfy u. 12.","referee":"Lipták L.","homeBrszId":709,"awayBrszId":1214,"review":false,"note":null},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2026-10-27","time":"19:30","home":"Semmelweis Egyetem","away":"BEAC","homeAway":"away","venue":"XI.ker. Villányi út 27.","referee":null,"homeBrszId":957,"awayBrszId":709,"review":false,"note":null},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2026-11-09","time":"19:30","home":"BEAC","away":"MAFC-Schönherz","homeAway":"home","venue":"XI. Bogdánfy u. 12.","referee":null,"homeBrszId":709,"awayBrszId":640,"review":false,"note":null},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2026-11-23","time":"19:30","home":"BEAC","away":"MAFC-Vásárhelyi","homeAway":"home","venue":"XI. Bogdánfy u. 12.","referee":null,"homeBrszId":709,"awayBrszId":45,"review":false,"note":null},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2026-12-10","time":"19:30","home":"Corvinus","away":"BEAC","homeAway":"away","venue":"IX.ker. Kinizsi u.2-6.","referee":null,"homeBrszId":865,"awayBrszId":709,"review":false,"note":null},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2027-01-13","time":"20:30","home":"BEAC","away":"BEAC","homeAway":"home","venue":"XI. Bogdánfy u. 12.","referee":null,"homeBrszId":709,"awayBrszId":709,"review":true,"note":"A forrásban BEAC–BEAC szerepel; automatikus importból kizárva."},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2027-01-13","time":"18:15","home":"PDSE","away":"BEAC","homeAway":"away","venue":"V. ker. Piarista u. 1.","referee":null,"homeBrszId":1091,"awayBrszId":709,"review":false,"note":null},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2027-01-18","time":"19:30","home":"BEAC","away":"Semmelweis Egyetem","homeAway":"home","venue":"XI. Bogdánfy u. 12.","referee":null,"homeBrszId":709,"awayBrszId":957,"review":false,"note":null},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2027-01-27","time":"20:30","home":"MAFC-Schönherz","away":"BEAC","homeAway":"away","venue":"XI.ker. Villányi út 27.","referee":null,"homeBrszId":640,"awayBrszId":709,"review":false,"note":null},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2027-02-18","time":"18:20","home":"MAFC-Vásárhelyi","away":"BEAC","homeAway":"away","venue":"XI.ker. Bercsényi u. 28-30.","referee":null,"homeBrszId":45,"awayBrszId":709,"review":false,"note":null},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2027-02-22","time":"19:30","home":"BEAC","away":"Corvinus","homeAway":"home","venue":"XI. Bogdánfy u. 12.","referee":null,"homeBrszId":709,"awayBrszId":865,"review":false,"note":null},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2027-03-04","time":"19:30","home":"BEAC","away":"BEAC","homeAway":"home","venue":"IX.ker. Kinizsi u.2-6.","referee":null,"homeBrszId":709,"awayBrszId":709,"review":true,"note":"A forrásban BEAC–BEAC szerepel; automatikus importból kizárva."},{"teamKey":"w1","teamId":"10000000-0000-4000-8000-000000000001","teamName":"BEAC Női I","brszTeamId":299,"date":"2026-10-16","time":"19:30","home":"BEAC","away":"MAFC-ÉPK","homeAway":"home","venue":"XI.ker. Bogdánfy u. 12.","referee":"Kovács Gábor","homeBrszId":299,"awayBrszId":835,"review":false,"note":null},{"teamKey":"w1","teamId":"10000000-0000-4000-8000-000000000001","teamName":"BEAC Női I","brszTeamId":299,"date":"2026-10-27","time":"20:30","home":"Óbudai Egyetem-Kandó SC","away":"BEAC","homeAway":"away","venue":"XII. ker. Városmajor u. 29.","referee":null,"homeBrszId":1159,"awayBrszId":299,"review":false,"note":null},{"teamKey":"w1","teamId":"10000000-0000-4000-8000-000000000001","teamName":"BEAC Női I","brszTeamId":299,"date":"2026-11-10","time":"19:30","home":"BEAC","away":"BEAC","homeAway":"home","venue":"XI.ker. Bogdánfy u. 12.","referee":null,"homeBrszId":299,"awayBrszId":299,"review":true,"note":"A forrásban BEAC–BEAC szerepel; automatikus importból kizárva."},{"teamKey":"w1","teamId":"10000000-0000-4000-8000-000000000001","teamName":"BEAC Női I","brszTeamId":299,"date":"2026-11-13","time":"19:30","home":"BEAC","away":"Ráckeve","homeAway":"home","venue":"XI.ker. Bogdánfy u. 12.","referee":null,"homeBrszId":299,"awayBrszId":961,"review":false,"note":null},{"teamKey":"w1","teamId":"10000000-0000-4000-8000-000000000001","teamName":"BEAC Női I","brszTeamId":299,"date":"2026-11-20","time":"19:30","home":"BEAC","away":"KSE","homeAway":"home","venue":"XI.ker. Bogdánfy u. 12.","referee":null,"homeBrszId":299,"awayBrszId":644,"review":false,"note":null},{"teamKey":"w1","teamId":"10000000-0000-4000-8000-000000000001","teamName":"BEAC Női I","brszTeamId":299,"date":"2026-11-24","time":"19:30","home":"Semmelweis Egyetem","away":"BEAC","homeAway":"away","venue":"X.ker. Zágrábi utca 14.","referee":null,"homeBrszId":917,"awayBrszId":299,"review":false,"note":null},{"teamKey":"w2","teamId":"10000000-0000-4000-8000-000000000002","teamName":"BEAC Női II","brszTeamId":959,"date":"2026-10-13","time":"19:30","home":"BEAC II.","away":"UTE U-20 Pink","homeAway":"home","venue":"XI.ker. Bogdánfy u.10/B.","referee":"Polgár Dániel","homeBrszId":959,"awayBrszId":1223,"review":false,"note":null},{"teamKey":"w2","teamId":"10000000-0000-4000-8000-000000000002","teamName":"BEAC Női II","brszTeamId":959,"date":"2026-10-30","time":"20:30","home":"Radzeer SE","away":"BEAC II.","homeAway":"away","venue":"XI.ker. Bercsényi u.28","referee":null,"homeBrszId":1031,"awayBrszId":959,"review":false,"note":null},{"teamKey":"w2","teamId":"10000000-0000-4000-8000-000000000002","teamName":"BEAC Női II","brszTeamId":959,"date":"2026-11-17","time":"19:30","home":"BEAC II.","away":"MTK kék","homeAway":"home","venue":"XI.ker. Bogdánfy u.10/B.","referee":null,"homeBrszId":959,"awayBrszId":1165,"review":false,"note":null},{"teamKey":"w2","teamId":"10000000-0000-4000-8000-000000000002","teamName":"BEAC Női II","brszTeamId":959,"date":"2026-11-25","time":"19:30","home":"Corvinus","away":"BEAC II.","homeAway":"away","venue":"XI.ker. Bogdánfy u.10/B.","referee":null,"homeBrszId":866,"awayBrszId":959,"review":false,"note":null}]);

  const LEGACY_MAIN_SECTIONS=['competition','mass','planning','settings'];
  const ADMIN_MODULES=[
    {group:'Tömegsport',items:[['mass.overview','Áttekintés'],['mass.trainings','Edzések'],['mass.calendar','Naptár'],['mass.athletes','Sportolók'],['mass.passes','Bérletek']]},
    {group:'Versenysport',items:[['competition.overview','Áttekintés'],['competition.trainings','Edzések'],['competition.matches','Meccsek'],['competition.calendar','Naptár'],['competition.teams','Csapatok'],['competition.players','Játékosok'],['competition.fees','Díjak'],['competition.competition','Versenyadatok']]},
    {group:'Rendszer',items:[['settings','Beállítások / adminok']]}
  ];

  const state={
    mode:String(cfg.DATA_MODE||'demo').toLowerCase(),supabase:null,session:null,manager:null,permissions:[],teams:[],players:[],events:[],calendarEvents:[],activityEvents:[],massTrainings:[],massCalendarEvents:[],massArchiveEvents:[],massAthletes:[],massPasses:[],massLoadError:'',massDetailCache:new Map(),admins:[],adminTeams:[],adminsLoadError:'',adminEditId:'',adminBusy:false,overview:null,rsvpMatrix:{events:[],players:[],responses:[]},cardRsvpMatrix:{events:[],players:[],responses:[]},eventRosterCache:new Map(),matrixFilterOpen:false,eventFiltersOpen:false,calendarFiltersOpen:false,matrixFilters:{team:'',period:'14',kind:'ALL',status:'ALL',from:'',to:''},
    area:['mass','competition'].includes(cfg.DEFAULT_AREA)?cfg.DEFAULT_AREA:'competition',module:'overview',calendarMode:'week',calendarAnchor:new Date(),calendarTeam:'',calendarType:'',calendarScope:'COMPETITION',massCalendarLevel:'',massCalendarSession:'',massAthleteSearch:'',massAthleteLevel:'',massAthleteStatus:'',massPassSearch:'',massPassMonth:'',playerTeam:'',playerSearch:'',playerMedical:'all',playerSort:(()=>{try{return localStorage.getItem('cc-manager-player-sort')||'name'}catch(_){return'name'}})(),playerSortDir:(()=>{try{return localStorage.getItem('cc-manager-player-sort-dir')||'asc'}catch(_){return'asc'}})(),playerListMode:(()=>{try{return localStorage.getItem('cc-manager-player-list-mode')==='grouped'?'grouped':'all'}catch(_){return'all'}})(),playerFiltersOpen:false,massAthleteFiltersOpen:false,massPassFiltersOpen:false,massCalendarFiltersOpen:false,eventTeam:'',eventPeriod:'upcoming',overviewTeam:'',selectedTeam:'',selectedPlayer:'',pendingEmail:'',loading:false,massActionBusy:'',massAttendanceBusy:new Set(),notificationRecipients:[],notificationHistory:[],notificationSelectedPlayerId:'',notificationSearch:'',notificationBusy:false,notificationLoadError:'',competitionSyncStatus:null,competitionSyncBusy:false,competitionResults:[],competitionStandings:[],competitionDataError:'',teamFilters:{overview:[],events:[],players:[],teams:[]},teamFilterOpen:{overview:false,events:false,players:false,teams:false},plannerTeam:''
  };

  const $=sel=>document.querySelector(sel), $$=sel=>Array.from(document.querySelectorAll(sel));
  const ccRoot=document.documentElement;
  function ccSetKeyboardMode_(on){ccRoot.classList.toggle('cc-keyboard-nav',!!on)}
  window.addEventListener('keydown',e=>{if(e.key==='Tab'||e.key.startsWith('Arrow'))ccSetKeyboardMode_(true)},{capture:true});
  ['pointerdown','mousedown','touchstart'].forEach(type=>window.addEventListener(type,()=>ccSetKeyboardMode_(false),{capture:true,passive:true}));
  function ccFocusSurface_(el){
    if(!el)return;
    if(!el.hasAttribute('tabindex'))el.setAttribute('tabindex','-1');
    try{el.focus({preventScroll:true})}catch(_){try{el.focus()}catch(__){}}
  }
  function ccOpenDialogStable_(dialog){
    if(!dialog)return;
    ccSetKeyboardMode_(false);
    if(!dialog.hasAttribute('tabindex'))dialog.setAttribute('tabindex','-1');
    if(typeof dialog.showModal==='function'&&!dialog.open)dialog.showModal();
    // showModal() may auto-focus the first button (usually X) on Safari/iOS.
    // Re-home focus to the neutral dialog surface in the same task, before paint.
    ccFocusSurface_(dialog);
  }
  function ccBlurPointerControl_(el){
    if(!el||ccRoot.classList.contains('cc-keyboard-nav'))return;
    requestAnimationFrame(()=>{try{el.blur()}catch(_){}});
  }
  const esc=v=>String(v??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const text=v=>String(v??'').trim();
  const dateFmt=new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Europe/Budapest'});
  const dayFmt=new Intl.DateTimeFormat('hu-HU',{weekday:'short',month:'2-digit',day:'2-digit',timeZone:'Europe/Budapest'});
  const timeFmt=new Intl.DateTimeFormat('hu-HU',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Europe/Budapest'});

  const PLAYER_AVATAR_IDS=['alpaca','lion','tiger','panther','lynx','cat','husky','wolf','fox','rabbit','bear','deer','panda','gorilla','monkey','elephant','rhino','hippo','giraffe','buffalo','mammoth','donkey','goat','raccoon','dog','otter','cow','ram','hedgehog','horse','zebra','turtle','penguin','owl','eagle','dolphin','crocodile','frog','shark','moose','extra_zebra','extra_horse','extra_deer','extra_kangaroo','extra_rabbit','extra_eagle','extra_turtle','extra_dolphin','extra_boar','extra_ram','extra_frog','extra_parrot','extra_lemur','extra_mouse','extra_pig','extra_duck','extra_sheep','extra_chicken','extra_trex','extra_axolotl'];
  const AVATAR_INDEX=new Map(PLAYER_AVATAR_IDS.map((id,i)=>[id,i]));
  function avatarHtml(p,size=''){const id=text(p?.avatarId||p?.avatar_id),idx=AVATAR_INDEX.has(id)?AVATAR_INDEX.get(id):-1,cls=`cc-avatar ${size}`.trim();if(idx>=0){const col=idx%8,row=Math.floor(idx/8),x=(col*100/7).toFixed(6),y=(row*100/7).toFixed(6);return `<span class="${cls} animal" role="img" aria-label="Avatar" style="background-position:${x}% ${y}%"></span>`}return `<span class="${cls} monogram" aria-hidden="true">${esc(initials(p?.displayName||p?.name||''))}</span>`}

  function safeDate(v){const d=v instanceof Date?new Date(v):new Date(v);return Number.isNaN(d.getTime())?null:d}
  function fmtDate(v){const d=safeDate(v);return d?dateFmt.format(d):'–'}
  function fmtDay(v){const d=safeDate(v);return d?dayFmt.format(d):'–'}
  function fmtTime(v){const d=safeDate(v);return d?timeFmt.format(d):'–'}
  function initials(v){return text(v).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()||'').join('')||'M'}
  function routeKey(area=state.area,module=state.module){return module==='settings'?'settings':`${area}.${module}`}
  function currentArea(){return AREAS[state.area]||AREAS.competition}
  function moduleMeta(module=state.module,area=state.area){if(module==='planning')return ['planning','Edzéstervezés','▦'];if(module==='settings')return ['settings','Beállítások','⌁'];return (AREAS[area]?.modules||[]).find(x=>x[0]===module)||null}
  let ccStatusTimer_=null;
  function ensureTopStatus_(){
    const el=$('#globalStatus'),top=$('.topbar');
    if(el&&top&&!el.classList.contains('cc-top-toast')){el.classList.add('cc-top-toast');top.appendChild(el)}
    return el;
  }
  function status(message,type=''){
    const el=ensureTopStatus_();if(!el)return;
    clearTimeout(ccStatusTimer_);
    if(!message){el.className='global-status cc-top-toast hidden';el.textContent='';return}
    el.className='global-status cc-top-toast'+(type?' '+type:'');
    el.textContent=message;
    const ms=type==='error'?7000:(type==='success'?3300:4600);
    ccStatusTimer_=setTimeout(()=>{if(el.textContent===message){el.className='global-status cc-top-toast hidden';el.textContent=''}},ms);
  }
  function competitionStatus_(message,type=''){
    const el=$('#competitionLiveStatus');
    if(!el){status(message,type);return}
    if(!message){el.className='competition-live-status hidden';el.textContent='';return}
    el.className='competition-live-status'+(type?' '+type:'');
    el.textContent=message;
  }

  function afterNativePicker(control,callback){
    let done=false,timer=null;
    const run=()=>{
      if(done)return;
      done=true;
      if(timer)clearTimeout(timer);
      requestAnimationFrame(()=>requestAnimationFrame(()=>Promise.resolve(callback())));
    };
    if(control&&document.activeElement===control){
      control.addEventListener('blur',()=>setTimeout(run,36),{once:true});
      timer=setTimeout(run,240);
    }else timer=setTimeout(run,48);
  }
  function configured(){return state.mode==='supabase'&&/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(text(cfg.SUPABASE_URL))&&text(cfg.SUPABASE_PUBLISHABLE_KEY)}

  const FILTER_PREF_PREFIX='cc-manager-filter-open:';
  function filterOpen_(key,fallback=false){try{const v=localStorage.getItem(FILTER_PREF_PREFIX+key);return v==null?!!fallback:v==='1'}catch(_){return !!fallback}}
  function setFilterOpen_(key,open){const value=!!open;try{localStorage.setItem(FILTER_PREF_PREFIX+key,value?'1':'0')}catch(_){}return value}
  function firstPermittedRoute_(){
    for(const area of ['competition','mass']){const mod=AREAS[area].modules.find(m=>canRoute(area,m[0]));if(mod)return{area,module:mod[0]}}
    if(canMainSection_('planning'))return{area:state.area,module:'planning'};
    if(can('settings'))return{area:state.area,module:'settings'};
    return null;
  }
  function ensureAuthorizedRoute_(){
    const ok=state.module==='settings'?can('settings'):state.module==='planning'?canMainSection_('planning'):canRoute(state.area,state.module);
    if(ok)return true;
    const next=firstPermittedRoute_();if(!next)return false;
    state.area=next.area;state.module=next.module;
    const h=next.module==='settings'?'#settings':next.module==='planning'?'#planning':`#${next.area}/${next.module}`;
    history.replaceState(null,'',h);return true;
  }

  function demoData(){
    const teams=[
      {id:'10000000-0000-4000-8000-000000000001',legacyTeamId:'team_w1',name:'BEAC Női I.',season:'2026/27',color:'#B76508',active:true,playerCount:5,coaches:'Edző A',defaultVenue:'BEAC csarnok · 1117 Budapest, Bogdánfy u. 10/B.',defaultCourt:'3. pálya'},
      {id:'10000000-0000-4000-8000-000000000002',legacyTeamId:'team_w2',name:'BEAC Női II.',season:'2026/27',color:'#F3D34A',active:true,playerCount:4,coaches:'Edző B',defaultVenue:'BEAC csarnok · 1117 Budapest, Bogdánfy u. 10/B.',defaultCourt:'2. pálya'},
      {id:'10000000-0000-4000-8000-000000000003',legacyTeamId:'team_m1',name:'BEAC Férfi',season:'2026/27',color:'#6AA84F',active:true,playerCount:4,coaches:'Edző C',defaultVenue:'BEAC csarnok · 1117 Budapest, Bogdánfy u. 10/B.',defaultCourt:'3. pálya'}
    ];
    const people=['Anna Kiss','Petra Nagy','Luca Tóth','Réka Varga','Nóri Fekete','Dániel Kovács','Márk Szabó','Bence Horváth','Eszter Molnár','Fanni Balogh','Júlia Papp','Ádám Németh','Gergő Lakatos'];
    const positions=['Feladó','Szélső','Center','Átló','Liberó'];
    const players=people.map((name,i)=>({playerId:'p'+(i+1),name,displayName:name,email:`demo${i+1}@example.com`,position:positions[i%positions.length],jerseyNo:(i+1),active:true,licenseNo:'IG'+String(1000+i),medicalValidUntil:i===2?'2026-10-10':'2027-03-31',teamId:teams[i%3].id,teamName:teams[i%3].name,trainingPresent:12+i%5,trainingMarked:15+i%4,matchPresent:3+i%3,matchMarked:4+i%3,jerseySize:'M',shortsSize:'M',avatarId:PLAYER_AVATAR_IDS[i%PLAYER_AVATAR_IDS.length],hasAccount:i%4!==0,membershipStartsOn:'2026-08-15'}));
    const now=Date.now(), day=864e5;
    const events=[];
    for(let i=-8;i<36;i+=2){
      const team=teams[Math.abs(i)%3]; const isMatch=i%8===0; const start=new Date(now+i*day+18*36e5);
      events.push({eventId:'e'+i,teamId:team.id,teamName:team.name,eventType:isMatch?'match':'training',title:isMatch?`${team.name} – Ellenfél`:'Edzés',startsAt:start.toISOString(),endsAt:new Date(start.getTime()+(isMatch?150:120)*60000).toISOString(),court:team.defaultCourt,venue:team.defaultVenue,color:team.color,homeAway:isMatch?'home':null,status:'active',yesCount:8+(Math.abs(i)%5),noCount:1,unknownCount:2+(Math.abs(i)%3)});
    }
    const matrixEvents=events.filter(e=>new Date(e.startsAt)>=new Date()&&new Date(e.startsAt)<new Date(Date.now()+28*day));const matrixPlayers=players.map(p=>({teamId:p.teamId,playerId:p.playerId,name:p.name,displayName:p.displayName,position:p.position,jerseyNo:p.jerseyNo,avatarId:p.avatarId}));const responses=[];matrixEvents.forEach((e,ei)=>matrixPlayers.filter(p=>p.teamId===e.teamId).forEach((p,pi)=>responses.push({eventId:e.eventId,playerId:p.playerId,status:(pi+ei)%5===0?'not_going':((pi+ei)%4===0?'none':'going')})));return {manager:{displayName:'Manager PWA preview',email:'demo@local',role:'preview'},permissions:['*'],teams,players,events,calendarEvents:events,activityEvents:events,rsvpMatrix:{events:matrixEvents,players:matrixPlayers,responses},overview:{teamCount:3,activePlayerCount:players.length,nextEvents:events.filter(x=>new Date(x.startsAt)>=new Date()).slice(0,12),teams}};
  }

  async function ensureSupabaseLibrary(){
    if(window.supabase?.createClient)return;
    await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.async=true;s.onload=resolve;s.onerror=()=>reject(new Error('A Supabase klienskönyvtár nem tölthető be.'));document.head.appendChild(s)});
  }
  async function createSupabase(){if(!configured())return null;await ensureSupabaseLibrary();return window.supabase.createClient(text(cfg.SUPABASE_URL),text(cfg.SUPABASE_PUBLISHABLE_KEY),{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}
  function normalizeRpc(data){if(typeof data==='string'){try{return JSON.parse(data)}catch(_){return data}}return data}
  async function rpc(name,args={}){if(!state.supabase)throw new Error('Supabase nincs inicializálva.');const {data,error}=await state.supabase.rpc(name,args);if(error)throw error;return normalizeRpc(data)}

  function permissionSet(){return new Set((state.permissions||[]).filter(x=>typeof x==='string'||x?.canView===true).map(x=>typeof x==='string'?x:text(x?.moduleKey)).filter(Boolean))}
  function canAction(key,action='view'){
    const rows=state.permissions||[];
    if(rows.some(x=>x==='*'))return true;
    const direct=rows.find(x=>typeof x==='object'&&text(x?.moduleKey)===key);
    if(direct){if(action==='edit')return direct.canEdit===true;if(action==='notify')return direct.canNotify===true;return direct.canView===true}
    if(action!=='view')return false;
    const p=permissionSet();if(p.has(key))return true;
    const legacy={'competition.overview':'overview','competition.calendar':'calendar','competition.teams':'teams','competition.players':'players','competition.competition':'competition','settings':'settings'};
    return !!legacy[key]&&p.has(legacy[key])
  }
  function can(key){return canAction(key,'view')}
  function canAnyAction(key,action='view'){const rows=state.permissions||[];if(rows.some(x=>x==='*'))return true;return rows.some(x=>typeof x==='object'&&text(x?.moduleKey)===key&&(action==='edit'?x.canEdit===true:action==='notify'?x.canNotify===true:x.canView===true))}
  function canRoute(area,module){
    if(module==='planning')return can('competition.trainings')||can('mass.trainings');
    if(area==='competition'&&module==='notifications') return canAnyAction('competition.players','notify');
    if(area==='mass'&&module==='archive')return can('mass.trainings')||can('mass.calendar');
    return can(`${area}.${module}`);
  }
  function canMainSection_(section){
    if(section==='competition')return AREAS.competition.modules.some(m=>canRoute('competition',m[0]));
    if(section==='mass')return AREAS.mass.modules.some(m=>canRoute('mass',m[0]));
    if(section==='planning')return canRoute(state.area,'planning');
    if(section==='settings')return can('settings');
    return false;
  }
  function mainSection_(){return state.module==='planning'?'planning':state.module==='settings'?'settings':state.area}

  function showLogin(step){const o=$('#loginOverlay');if(!o)return;o.classList.remove('hidden');['loginLoadingStep','loginEmailStep','loginCodeStep'].forEach(id=>$('#'+id)?.classList.toggle('hidden',id!==step));if(step==='loginEmailStep')setTimeout(()=>$('#loginEmail')?.focus(),20);if(step==='loginCodeStep')setTimeout(()=>$('#loginCode')?.focus(),20)}
  function hideLogin(){$('#loginOverlay')?.classList.add('hidden')}
  function loginMessage(id,msg,error=false){const el=$(id);if(!el)return;el.textContent=msg||'';el.classList.toggle('error',!!error)}
  async function requestCode(){const email=text($('#loginEmail')?.value).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){loginMessage('#loginMsg','Adj meg egy érvényes email címet.',true);return}const b=$('#requestCodeBtn');if(b)b.disabled=true;try{loginMessage('#loginMsg','Kód küldése…');const {error}=await state.supabase.auth.signInWithOtp({email,options:{shouldCreateUser:true}});if(error)throw error;state.pendingEmail=email;$('#loginEmailPreview').textContent=email;showLogin('loginCodeStep');loginMessage('#loginCodeMsg','A kódot elküldtük.')}catch(err){loginMessage('#loginMsg',err.message||'A kód küldése sikertelen.',true)}finally{if(b)b.disabled=false}}
  async function verifyCode(){const token=text($('#loginCode')?.value).replace(/\D/g,'');if(token.length<6){loginMessage('#loginCodeMsg','Írd be az emailben kapott kódot.',true);return}const b=$('#verifyCodeBtn');if(b)b.disabled=true;try{loginMessage('#loginCodeMsg','Ellenőrzés…');const {data,error}=await state.supabase.auth.verifyOtp({email:state.pendingEmail,token,type:'email'});if(error)throw error;state.session=data.session||null;await loadLiveData();hideLogin()}catch(err){loginMessage('#loginCodeMsg',err.message||'A belépés sikertelen.',true)}finally{if(b)b.disabled=false}}

  function applyManager(){const m=state.manager||{};$('#managerName').textContent=m.displayName||m.name||'Manager';$('#managerEmail').textContent=m.email||'–';$('#managerInitials').textContent=initials(m.displayName||m.name||m.email);$('#accountDialogName').textContent=m.displayName||m.name||'Manager';$('#accountDialogEmail').textContent=m.email||'–';if($('#runtimeLabel'))$('#runtimeLabel').textContent='V0.5.2B5S';$('#dataModePill').textContent='MANAGER';$('#dataModeDetail').textContent='Club Control Manager · V0.5.2B5S';}

  async function loadLiveData(){
    state.loading=true;status('Manager adatok frissítése…');
    try{
      const b=await rpc('cc_manager_bootstrap_v1');
      if(!b?.manager)throw new Error('A Manager bootstrap nem adott érvényes fiókot.');
      state.manager=b.manager;state.permissions=Array.isArray(b.permissions)?b.permissions:[];state.teams=Array.isArray(b.teams)?b.teams:[];applyManager();ensureAuthorizedRoute_();
      const jobs=[];
      if(can('competition.overview'))jobs.push(loadOverview(),loadRsvpMatrix());else{state.overview={};state.rsvpMatrix={events:[],players:[],responses:[]}}
      if(can('competition.trainings')||can('competition.matches'))jobs.push(loadCardRsvpMatrix().catch(err=>{console.warn('Competition card RSVP matrix unavailable',err);state.cardRsvpMatrix=state.rsvpMatrix||{events:[],players:[],responses:[]}}));else state.cardRsvpMatrix={events:[],players:[],responses:[]}
      if(can('competition.teams'))jobs.push(loadTeams());else state.teams=Array.isArray(b.teams)?b.teams:[];
      if(can('competition.players'))jobs.push(loadPlayers());else state.players=[];
      if(canAnyAction('competition.players','notify'))jobs.push(loadNotificationData().catch(err=>{console.error('MGR005 notifications load failed',err);state.notificationRecipients=[];state.notificationHistory=[];state.notificationLoadError=text(err?.message||'Az MGR005 értesítési modul még nincs telepítve.')}));else{state.notificationRecipients=[];state.notificationHistory=[];state.notificationLoadError=''};
      if(can('competition.calendar'))jobs.push(loadCalendar());else state.calendarEvents=[];
      if(can('competition.trainings')||can('competition.matches'))jobs.push(loadActivityEvents());else state.activityEvents=[];state.events=state.calendarEvents;
      if(can('competition.matches'))jobs.push(loadCompetitionSyncStatus(),loadCompetitionResultsStandings().catch(err=>{console.warn('MGR014 competition data unavailable',err);state.competitionResults=[];state.competitionStandings=[];state.competitionDataError=text(err?.message||err)}));else{state.competitionSyncStatus=null;state.competitionResults=[];state.competitionStandings=[];state.competitionDataError=''};
      if(can('mass.trainings'))jobs.push(loadMassTrainings().catch(err=>{console.error('MGR003 mass trainings load failed',err);state.massTrainings=[];state.massLoadError=text(err?.message||'A Tömegsport írási modul még nincs telepítve.')}));else{state.massTrainings=[];state.massLoadError=''};
      if(can('mass.calendar'))jobs.push(loadMassCalendar().catch(err=>{console.error('MGR008 mass calendar load failed',err);state.massCalendarEvents=[]}));else state.massCalendarEvents=[];
      if(canRoute('mass','archive'))jobs.push(loadMassArchive().catch(err=>{console.error('Mass archive load failed',err);state.massArchiveEvents=[]}));else state.massArchiveEvents=[];
      if(can('mass.athletes'))jobs.push(loadMassAthletes().catch(err=>{console.error('MGR008 mass athletes load failed',err);state.massAthletes=[]}));else state.massAthletes=[];
      if(can('mass.passes'))jobs.push(loadMassPasses().catch(err=>{console.error('MGR008 mass passes load failed',err);state.massPasses=[]}));else state.massPasses=[];
      if(canAction('settings','edit'))jobs.push(loadAdmins().catch(err=>{console.error('MGR004 admin load failed',err);state.admins=[];state.adminTeams=[];state.adminsLoadError=text(err?.message||'Az admin-kezelő MGR004 modul még nincs telepítve.')}));else{state.admins=[];state.adminTeams=[];state.adminsLoadError=''};
      await Promise.all(jobs);
      renderChrome();renderView();status('');
    }catch(err){console.error(err);status(err.message||'A Manager adatok betöltése sikertelen.','error');throw err}
    finally{state.loading=false}
  }
  async function loadOverview(teamId=state.overviewTeam||null){const d=await rpc('cc_manager_overview_v1',{p_team_id:teamId});state.overview=d||{}}
  async function loadTeams(){const d=await rpc('cc_manager_teams_v1');state.teams=Array.isArray(d)?d:[];if(state.selectedTeam&&!state.teams.some(t=>t.id===state.selectedTeam))state.selectedTeam=''}
  async function loadPlayers(){const d=await rpc('cc_manager_players_v2',{p_team_id:null,p_query:''});state.players=Array.isArray(d)?d:[]}
  async function loadNotificationRecipients(query=''){const d=await rpc('cc_manager_notification_recipients_v1',{p_query:text(query)});state.notificationRecipients=Array.isArray(d)?d:[];state.notificationLoadError='';if(state.notificationSelectedPlayerId&&!state.notificationRecipients.some(p=>text(p.playerId)===text(state.notificationSelectedPlayerId)))state.notificationSelectedPlayerId=''}
  async function loadNotificationHistory(){const d=await rpc('cc_manager_notification_history_v1',{p_limit:30});state.notificationHistory=Array.isArray(d)?d:[]}
  async function loadNotificationData(){await Promise.all([loadNotificationRecipients(state.notificationSearch||''),loadNotificationHistory()])}
  async function loadCompetitionSyncStatus(){try{state.competitionSyncStatus=await rpc('cc_manager_competition_sync_status_v1')}catch(err){console.warn('MGR013 sync status unavailable',err);state.competitionSyncStatus=null}}
  async function loadCompetitionResultsStandings(){
    const [results,standings]=await Promise.all([
      rpc('cc_manager_competition_results_v1',{p_team_ids:null}),
      rpc('cc_manager_competition_standings_v1',{p_team_ids:null})
    ]);
    state.competitionResults=Array.isArray(results)?results:[];
    state.competitionStandings=Array.isArray(standings)?standings:[];
    state.competitionDataError='';
  }
  async function loadCalendar(){
    if(state.area==='mass')return loadMassCalendar();
    const {from,to}=calendarWindow(),args={p_from:from.toISOString(),p_to:to.toISOString(),p_team_id:state.calendarTeam||null};
    let d;
    try{d=await rpc('cc_manager_calendar_v3',args)}
    catch(err){
      const msg=text(err?.message||err).toLowerCase();
      if(!msg.includes('cc_manager_calendar_v3')&&!msg.includes('function')&&!msg.includes('schema cache'))throw err;
      d=await rpc('cc_manager_calendar_v2',args);
    }
    state.calendarEvents=effectiveCompetitionEvents(Array.isArray(d)?d:[]);state.events=state.calendarEvents
  }
  async function loadMassCalendar(){const {from,to}=calendarWindow();const end=new Date(to.getTime()-1);const d=await rpc('cc_manager_mass_calendar_v1',{p_from:localDateKey(from),p_to:localDateKey(end)});state.massCalendarEvents=Array.isArray(d)?d:[]}
  async function loadMassArchive(){const now=new Date(),seasonYear=now.getMonth()>=7?now.getFullYear():now.getFullYear()-1,from=new Date(seasonYear,7,1),to=new Date(now);to.setHours(23,59,59,999);const d=await rpc('cc_manager_mass_calendar_v1',{p_from:localDateKey(from),p_to:localDateKey(to)});state.massArchiveEvents=(Array.isArray(d)?d:[]).filter(e=>{const end=safeDate(e.endsAt||e.ends_at||e.startsAt||e.starts_at);return end&&end.getTime()<Date.now()}).sort((a,b)=>(eventStart(b)?.getTime()||0)-(eventStart(a)?.getTime()||0))}
  async function loadMassAthletes(){const d=await rpc('cc_manager_mass_athletes_v1',{p_query:'',p_level:'',p_status:''});state.massAthletes=Array.isArray(d)?d:[]}
  async function loadMassPasses(){const d=await rpc('cc_manager_mass_passes_v1',{p_query:'',p_month:''});state.massPasses=Array.isArray(d)?d:[]}
  async function loadActivityEvents(){const now=new Date(),seasonYear=now.getMonth()>=7?now.getFullYear():now.getFullYear()-1,from=new Date(seasonYear,7,1),to=new Date(seasonYear+1,7,1),jobs=[];if(can('competition.trainings'))jobs.push(rpc('cc_manager_events_v1',{p_from:from.toISOString(),p_to:to.toISOString(),p_kind:'training',p_team_id:null}));if(can('competition.matches'))jobs.push(rpc('cc_manager_events_v1',{p_from:from.toISOString(),p_to:to.toISOString(),p_kind:'match',p_team_id:null}));const parts=await Promise.all(jobs);state.activityEvents=parts.flatMap(x=>Array.isArray(x)?x:[]).sort((a,b)=>eventStart(a)-eventStart(b))}
  async function loadMassTrainings(){const from=new Date(),to=new Date();from.setHours(0,0,0,0);to.setDate(to.getDate()+120);const d=await rpc('cc_manager_mass_trainings_v1',{p_from:localDateKey(from),p_to:localDateKey(to)});state.massTrainings=Array.isArray(d)?d:[];state.massLoadError=''}
  async function loadAdmins(){const d=await rpc('cc_manager_admins_v1');state.admins=Array.isArray(d?.admins)?d.admins:[];state.adminTeams=Array.isArray(d?.teams)?d.teams:state.teams;state.adminsLoadError='';if(state.adminEditId&&state.adminEditId!=='__new__'&&!state.admins.some(a=>text(a.id)===text(state.adminEditId)))state.adminEditId=''}
  async function loadMassEventDetail(eventId,{force=false}={}){const id=text(eventId);if(!force&&state.massDetailCache.has(id))return state.massDetailCache.get(id);const d=await rpc('cc_manager_mass_event_detail_v1',{p_event_id:id});state.massDetailCache.set(id,d||{});return d||{}}
  function matrixRange(){const f=state.matrixFilters||{},now=new Date();now.setHours(0,0,0,0);let from=new Date(now),to=new Date(now);if(f.period==='28')to.setDate(to.getDate()+28);else if(f.period==='CUSTOM'&&f.from&&f.to){from=new Date(f.from+'T00:00:00');to=new Date(f.to+'T00:00:00');to.setDate(to.getDate()+1)}else to.setDate(to.getDate()+14);return{from,to}}
  async function loadRsvpMatrix(){const {from,to}=matrixRange();const d=await rpc('cc_manager_rsvp_matrix_v1',{p_from:from.toISOString(),p_to:to.toISOString(),p_team_id:null});state.rsvpMatrix=d&&typeof d==='object'?d:{events:[],players:[],responses:[]}}
  async function loadCardRsvpMatrix(){const now=new Date(),seasonYear=now.getMonth()>=7?now.getFullYear():now.getFullYear()-1,from=new Date(seasonYear,7,1),to=new Date(seasonYear+1,7,1);const d=await rpc('cc_manager_rsvp_matrix_v1',{p_from:from.toISOString(),p_to:to.toISOString(),p_team_id:null});state.cardRsvpMatrix=d&&typeof d==='object'?d:{events:[],players:[],responses:[]}}
  async function loadEventRoster(eventId){if(state.eventRosterCache.has(eventId))return state.eventRosterCache.get(eventId);const d=await rpc('cc_manager_event_roster_v1',{p_event_id:eventId});const rows=Array.isArray(d)?d:[];state.eventRosterCache.set(eventId,rows);return rows}
  function useDemo(){const d=demoData();Object.assign(state,d);state.calendarEvents=d.calendarEvents;state.activityEvents=d.activityEvents;applyManager();renderChrome();renderView();status('Preview mód: nincs production adatkapcsolat. A csomag nem ír semmit.')}

  function resolveInitialRoute(){const raw=location.hash.replace(/^#/,'');if(raw==='settings'){state.module='settings';return}if(raw==='planning'){state.module='planning';return}const [a,m]=raw.split('/');if(AREAS[a]&&AREAS[a].modules.some(x=>x[0]===m)){state.area=a;state.module=m;if(m==='calendar')state.calendarScope=a==='mass'?'MASS':'COMPETITION'}}
  function setRoute(area,module,{replace=false}={}){let h;if(module==='calendar')state.calendarScope=area==='mass'?'MASS':'COMPETITION';if(module==='settings'){state.module='settings';h='#settings'}else if(module==='planning'){state.module='planning';h='#planning'}else{state.area=area;state.module=module;h=`#${area}/${module}`;try{localStorage.setItem(`cc-manager-last-module:${area}`,module)}catch(_){}}replace?history.replaceState(null,'',h):history.pushState(null,'',h);renderChrome();renderView();window.scrollTo({top:0,behavior:'auto'})}
  function legacyDefaultModule_(area){const preferred=area==='mass'?'trainings':'overview';let saved='';try{saved=localStorage.getItem(`cc-manager-last-module:${area}`)||''}catch(_){};if(saved&&AREAS[area]?.modules.some(m=>m[0]===saved&&canRoute(area,saved)))return saved;if(canRoute(area,preferred))return preferred;return permittedAreaModules_(area)[0]?.[0]||preferred}
  function switchArea(area){if(!AREAS[area])return;setRoute(area,legacyDefaultModule_(area))}

  function permittedAreaModules_(area){return (AREAS[area]?.modules||[]).filter(m=>canRoute(area,m[0]))}
  function renderChrome(){
    ensureAuthorizedRoute_();
    const section=mainSection_(),area=currentArea(),meta=moduleMeta();
    if($('#pageAreaLabel'))$('#pageAreaLabel').textContent=section==='competition'?'VERSENYSPORT':section==='mass'?'TÖMEGSPORT':section==='planning'?'EDZÉSTERVEZÉS':'RENDSZER';
    if($('#pageTitle'))$('#pageTitle').textContent=meta?.[1]||'Manager';
    const primary=$('#legacyPrimaryNav');
    if(primary)primary.innerHTML=[
      ['competition','Versenysport'],['mass','Tömegsport'],['planning','Edzéstervezés'],['settings','Beállítások']
    ].filter(([key])=>canMainSection_(key)).map(([key,label])=>`<button class="legacy-primary-tab ${section===key?'active':''}" type="button" data-main-section="${key}">${esc(label)}</button>`).join('');
    const secondary=$('#legacySecondaryNav');
    if(secondary){
      if(section==='competition'||section==='mass'){
        secondary.hidden=false;
        secondary.innerHTML=permittedAreaModules_(section).map(m=>`<button class="legacy-secondary-tab ${state.area===section&&state.module===m[0]?'active':''}" data-route-area="${section}" data-route-module="${m[0]}" type="button">${esc(m[1])}</button>`).join('');
      }else{secondary.hidden=true;secondary.innerHTML=''}
    }
    const refreshBtn=$('#refreshBtn');if(refreshBtn){refreshBtn.classList.remove('beac-import-button');refreshBtn.classList.add('cc-text-refresh');refreshBtn.setAttribute('aria-label','Adatok frissítése');refreshBtn.title='Adatok frissítése';refreshBtn.textContent='Frissítés'}
    bindDynamicNavigation();
  }
  function bindDynamicNavigation(){
    $$('[data-main-section]').forEach(b=>b.onclick=()=>{const section=b.dataset.mainSection;if(section==='competition'||section==='mass')switchArea(section);else setRoute(state.area,section)});
    $$('[data-route-module]').forEach(b=>b.onclick=()=>setRoute(b.dataset.routeArea||state.area,b.dataset.routeModule));
  }

  function metric(label,value,note){return `<article class="metric-card"><small>${esc(label)}</small><strong>${value==null?'–':esc(value)}</strong><span>${esc(note)}</span></article>`}
  function eventRow(e){const s=e.startsAt||e.starts_at;return `<div class="event-row"><span class="event-accent" style="background:${esc(e.color||'#f7b700')}"></span><div class="event-main"><strong>${esc(e.title||((e.eventType||e.event_type)==='match'?'Meccs':'Edzés'))}</strong><small>${esc(e.teamName||e.team_name||'')} · ${esc(e.court||e.venue||'')}</small></div><div class="event-meta"><b>${esc(fmtDate(s))}</b><span>${esc(fmtTime(s))}</span></div></div>`}
  function teamRow(t){return `<div class="team-row"><span class="team-color" style="background:${esc(t.color||'#f7b700')}"></span><div><strong>${esc(t.name)}</strong><small>${esc(t.season||cfg.DEFAULT_SEASON)}</small></div><span class="team-count">${t.playerCount==null?'–':esc(t.playerCount)} fő</span></div>`}
  function healthRows(items){return items.map(([label,stateText,stateClass])=>`<div class="health-row"><span>${esc(label)}</span><b class="${stateClass||''}">${esc(stateText)}</b></div>`).join('')}

  function num(v){const n=Number(v);return Number.isFinite(n)?n:0}
  function pct(a,b){const aa=num(a),bb=num(b);return bb>0?Math.round(aa*100/bb):null}
  function pctText(a,b){const p=pct(a,b);return p==null?'–':`${p}%`}
  function teamById(id){return state.teams.find(t=>text(t.id)===text(id))||null}
  function playerById(id){return state.players.find(p=>text(p.playerId||p.id)===text(id))||null}
  function eventStart(e){return safeDate(e.startsAt||e.starts_at)}
  function eventEnd(e){return safeDate(e.endsAt||e.ends_at)||eventStart(e)}
  function localDateKey(v){const d=safeDate(v);if(!d)return'';const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Budapest',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d),m=Object.fromEntries(parts.map(x=>[x.type,x.value]));return `${m.year}-${m.month}-${m.day}`}
  function eventType(e){return text(e.eventType||e.event_type)}
  function eventTeamId(e){return text(e.teamId||e.team_id)}
  function isEventPast(e){const d=eventEnd(e);return d?d.getTime()<Date.now():false}
  function matchDayKey(e){const team=eventTeamId(e),day=localDateKey(eventStart(e));return team&&day?`${team}:${day}`:''}
  function effectiveCompetitionEvents(rows){
    const list=Array.isArray(rows)?rows:[];
    const matchDays=new Set(list.filter(e=>eventType(e)==='match'&&text(e.status||'active').toLowerCase()!=='cancelled').map(matchDayKey).filter(Boolean));
    return list.filter(e=>eventType(e)!=='training'||!matchDays.has(matchDayKey(e)));
  }
  function matchDayReplacedTrainingCount(rows){const list=Array.isArray(rows)?rows:[];return Math.max(0,list.length-effectiveCompetitionEvents(list).length)}
  function rsvpTotal(e){return num(e.yesCount)+num(e.noCount)+num(e.unknownCount)}
  function attendanceSummary(players=state.players){return players.reduce((acc,p)=>{acc.trainingPresent+=num(p.trainingPresent);acc.trainingMarked+=num(p.trainingMarked);acc.matchPresent+=num(p.matchPresent);acc.matchMarked+=num(p.matchMarked);return acc},{trainingPresent:0,trainingMarked:0,matchPresent:0,matchMarked:0})}
  function teamPlayers(teamId){return state.players.filter(p=>text(p.teamId||p.team_id)===text(teamId))}
  function teamAttendance(teamId){return attendanceSummary(teamPlayers(teamId))}
  function teamOptions(value=''){return '<option value="">Minden csapat</option>'+state.teams.map(t=>`<option value="${esc(t.id)}" ${text(value)===text(t.id)?'selected':''}>${esc(t.name)}</option>`).join('')}
  function teamFilterIds_(scope){const v=state.teamFilters?.[scope];return Array.isArray(v)?v.map(text).filter(Boolean):[]}
  function teamFilterMatch_(scope,teamId){const ids=teamFilterIds_(scope);return !ids.length||ids.includes(text(teamId))}
  function teamFilterLabel_(scope){const ids=teamFilterIds_(scope);if(!ids.length)return'Mindegyik csapat';if(ids.length===1)return teamById(ids[0])?.name||'1 csapat';return `${ids.length} csapat`}
  function teamMultiFilterHtml_(scope){const selected=new Set(teamFilterIds_(scope)),open=state.teamFilterOpen?.[scope]===true;return `<details class="team-multi-filter" data-team-filter-details="${esc(scope)}" ${open?'open':''}><summary><span>Csapat</span><b>${esc(teamFilterLabel_(scope))}</b><i class="team-multi-triangle" aria-hidden="true"></i></summary><div class="team-multi-menu"><label class="team-multi-all"><input type="checkbox" data-team-filter-all="${esc(scope)}" ${selected.size?'':'checked'}><span>Mindegyik csapat</span></label>${state.teams.filter(t=>t.active!==false).map(t=>`<label><input type="checkbox" data-team-filter-item="${esc(scope)}" value="${esc(t.id)}" ${selected.has(text(t.id))?'checked':''}><i style="background:${esc(t.color||'#f7b700')}"></i><span>${esc(t.name)}</span></label>`).join('')}</div></details>`}
  function bindTeamMultiFilter_(scope,renderFn){
    const details=$(`[data-team-filter-details="${scope}"]`),all=$(`[data-team-filter-all="${scope}"]`),items=$$(`[data-team-filter-item="${scope}"]`);
    details?.addEventListener('toggle',()=>{if(state.teamFilterOpen)state.teamFilterOpen[scope]=details.open});
    all?.addEventListener('change',()=>{if(all.checked){state.teamFilters[scope]=[];state.teamFilterOpen[scope]=true;renderFn()}});
    items.forEach(x=>x.addEventListener('change',()=>{const ids=items.filter(i=>i.checked).map(i=>i.value);state.teamFilters[scope]=ids;state.teamFilterOpen[scope]=true;renderFn()}));
  }
  function rsvpPills(e){return `<div class="rsvp-plain" aria-label="Jövök: ${num(e.yesCount)}, nem jövök: ${num(e.noCount)}, nincs jelzés: ${num(e.unknownCount)}"><span class="yes"><b>${num(e.yesCount)}</b></span><span class="no"><b>${num(e.noCount)}</b></span><span class="unknown"><b>${num(e.unknownCount)}</b></span></div>`}
  function competitionResultByEvent_(eventId){return (state.competitionResults||[]).find(r=>text(r.eventId)===text(eventId))||null}
  function matchResultOrRsvp_(e){const r=competitionResultByEvent_(e.eventId||e.id);if(!r||r.homeSets==null||r.awaySets==null)return rsvpPills(e);const sets=Array.isArray(r.setScores)?r.setScores:[];return `<div class="match-result-compact"><strong>${num(r.homeSets)} : ${num(r.awaySets)}</strong>${sets.length?`<small>${sets.map(x=>`${num(x.home)}:${num(x.away)}`).join(' · ')}</small>`:''}</div>`}
  function standingsForContext_(teamId){return (state.competitionStandings||[]).filter(r=>text(r.contextTeamId)===text(teamId)).sort((a,b)=>(Number(a.position)||9999)-(Number(b.position)||9999)||text(a.teamName).localeCompare(text(b.teamName),'hu'))}
  function standingsLogo_(r){if(text(r.logoUrl))return `<img src="${esc(r.logoUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer">`;const initials=text(r.teamName).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()||'').join('')||'•';return `<span>${esc(initials)}</span>`}
  function standingsCard_(contextTeamId){const rows=standingsForContext_(contextTeamId),team=teamById(contextTeamId),meta=rows[0];if(!rows.length)return'';return `<article class="panel standings-card" style="--team-color:${esc(team?.color||'#f7b700')}"><div class="panel-head"><div><h3>Tabella</h3><p>${esc(meta?.competitionLabel||team?.name||'BRSZ')} · BRSZ sorrend</p></div></div><div class="standings-table"><div class="standings-row standings-head"><b>H</b><b>Csapat</b><b>M</b><b>GY</b><b>V</b><b>Szett</b><b>P</b></div>${rows.map(r=>`<div class="standings-row ${r.focus?'focus':''}"><b class="standing-pos">${esc(r.position||'–')}</b><div class="standing-team"><span class="standing-logo">${standingsLogo_(r)}</span><strong>${esc(r.teamName)}</strong></div><span>${num(r.played)}</span><span>${num(r.wins)}</span><span>${num(r.losses)}</span><span>${num(r.setsFor)}:${num(r.setsAgainst)}</span><b>${num(r.tablePoints)}</b></div>`).join('')}</div></article>`}
  function standingsSection_(scope='overview'){const ids=teamFilterIds_(scope),contexts=(ids.length?ids:state.teams.map(t=>text(t.id))).filter(id=>standingsForContext_(id).length);if(!contexts.length)return state.competitionDataError?`<article class="panel standings-card standings-unavailable"><div class="panel-head"><div><h3>Tabella</h3><p>MGR014 még nincs telepítve vagy nem érhető el.</p></div></div></article>`:'';return `<div class="standings-grid">${contexts.map(standingsCard_).join('')}</div>`}
  function eventPlace(e){return text(e.court)||text(e.venue)||'–'}
  function ccDisplayEventTitle_(e){return eventType(e)==='training'?'Edzés':(e.title||'Meccs')}
  function ccDisplayEventPlace_(e){return eventType(e)==='training'?(text(e.court)||'–'):eventPlace(e)}
  function eventRichRow(e){const s=eventStart(e),kind=eventType(e)==='match'?'MECCS':'EDZÉS';return `<button class="event-rich-row ${isEventPast(e)?'past':''}" type="button" data-event-id="${esc(e.eventId||e.id)}"><span class="event-accent" style="background:${esc(e.color||teamById(eventTeamId(e))?.color||'#f7b700')}"></span><div class="event-date"><b>${esc(s?fmtDate(s):'–')}</b><span>${esc(s?fmtTime(s):'–')}</span></div><div class="event-main"><strong>${esc(ccDisplayEventTitle_(e))}</strong><small>${esc(e.teamName||e.team_name||'')} · ${esc(ccDisplayEventPlace_(e))}</small></div><span class="event-kind">${kind}</span>${rsvpPills(e)}</button>`}
  function detailPair(label,value,cls=''){return `<div class="detail-pair ${cls}"><small>${esc(label)}</small><b>${esc(value==null||value===''?'–':value)}</b></div>`}
  function findEventById(id){const e=[...state.activityEvents,...state.calendarEvents,...(state.rsvpMatrix.events||[])].find(e=>text(e.eventId||e.id)===text(id))||null;if(!e)return null;if(e.yesCount!=null&&e.noCount!=null&&e.unknownCount!=null)return e;const statuses=(state.rsvpMatrix.responses||[]).filter(r=>text(r.eventId)===text(id)).map(r=>text(r.status));return {...e,yesCount:statuses.filter(x=>x==='going').length,noCount:statuses.filter(x=>x==='not_going').length,unknownCount:statuses.filter(x=>x!=='going'&&x!=='not_going').length}}
  function ccDateInputValue_(value){const d=safeDate(value);if(!d)return'';return localDateKey(d)}
  function ccTimeInputValue_(value){const d=safeDate(value);if(!d)return'';return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`}
  function ccLocalIso_(dateValue,timeValue){const d=text(dateValue),t=text(timeValue);if(!d||!t)return null;const x=new Date(`${d}T${t}:00`);if(Number.isNaN(x.getTime()))return null;return x.toISOString()}
  function ccCloseEntityDialog_(){const d=$('#entityDialog');if(d?.open)d.close()}
  async function ccReloadCompetitionAfterWrite_(){state.eventRosterCache.clear();await Promise.all([loadTeams(),loadPlayers(),loadActivityEvents(),loadRsvpMatrix(),loadCardRsvpMatrix().catch(()=>{}),loadCalendar()]);renderModule()}
  function ccEventCanEdit_(e){return canAction(eventType(e)==='match'?'competition.matches':'competition.trainings','edit',eventTeamId(e))}
  function ccEventFormTeamOptions_(value,kind='training'){const module=kind==='match'?'competition.matches':'competition.trainings';return state.teams.filter(t=>(t.active!==false||text(t.id)===text(value))&&canAction(module,'edit',t.id)).map(t=>`<option value="${esc(t.id)}" ${text(value)===text(t.id)?'selected':''}>${esc(t.name)}</option>`).join('')}
  const CC_HOME_MATCH_DEFAULTS_=Object.freeze({
    '10000000-0000-4000-8000-000000000001':{court:'3',venue:'BEAC csarnok',address:'1117 Budapest, Bogdánfy u. 10/B.'},
    '10000000-0000-4000-8000-000000000002':{court:'2',venue:'BEAC csarnok',address:'1117 Budapest, Bogdánfy u. 10/B.'},
    '10000000-0000-4000-8000-000000000003':{court:'3',venue:'BEAC csarnok',address:'1117 Budapest, Bogdánfy u. 10/B.'}
  });
  function ccNormalizeTime24_(value){const v=text(value).replace('.',':');const m=v.match(/^(\d{1,2}):(\d{2})$/);if(!m)return'';const h=Number(m[1]),min=Number(m[2]);if(h<0||h>23||min<0||min>59)return'';return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`}
  function ccTimeField_(id,label,value,{required=false,wrapId='',cls=''}={}){return `<label class="field ${cls}" ${wrapId?`id="${esc(wrapId)}"`:''}><span>${esc(label)}</span><input id="${esc(id)}" type="text" inputmode="numeric" autocomplete="off" placeholder="HH:MM" pattern="(?:[01]\\d|2[0-3]):[0-5]\\d" maxlength="5" value="${esc(value||'')}" ${required?'required':''}></label>`}
  function ccHomeDefaultsForTeam_(teamId){return CC_HOME_MATCH_DEFAULTS_[text(teamId)]||null}
  function ccTeamBaseDefaults_(teamId){const d=ccHomeDefaultsForTeam_(teamId);return d?{defaultVenue:`${d.venue} · ${d.address}`,defaultCourt:`${d.court}. pálya`}:null}
  function ccTeamDefaultVenue_(team){return ccTeamBaseDefaults_(team?.id)?.defaultVenue||text(team?.defaultVenue)||'BEAC csarnok · 1117 Budapest, Bogdánfy u. 10/B.'}
  function ccTeamDefaultCourt_(team){return ccTeamBaseDefaults_(team?.id)?.defaultCourt||text(team?.defaultCourt)||'–'}
  function ccApplyHomeMatchDefaults_({force=false}={}){if(text($('#ceHomeAway')?.value)!=='home')return;const d=ccHomeDefaultsForTeam_($('#ceTeam')?.value);if(!d)return;const court=$('#ceCourt'),venue=$('#ceVenue'),address=$('#ceAddress');if(court&&(force||!text(court.value)))court.value=d.court;if(venue&&(force||!text(venue.value)))venue.value=d.venue;if(address&&(force||!text(address.value)))address.value=d.address}
  function ccMatchKindFromEvent_(e){const raw=text(e?.matchKind||e?.match_kind||e?.metadata?.matchKind||e?.meta?.matchKind).toLowerCase();return raw==='friendly'?'friendly':'official'}
  function ccSyncMatchKindUi_(){const kind=text($('#ceMatchKind')?.value)||'official',wrap=$('#ceEndWrap');if(wrap)wrap.hidden=kind!=='friendly';if(kind!=='friendly'&&$('#ceEnd'))$('#ceEnd').value=''}
  function ccEventFormHtml_(e,kind){
    const editing=!!e,s=editing?eventStart(e):new Date(),en=editing?eventEnd(e):new Date(s.getTime()+2*3600000),teamId=editing?eventTeamId(e):(teamFilterIds_('events')[0]||state.eventTeam||state.selectedTeam||state.teams[0]?.id||''),isMatch=kind==='match',matchKind=isMatch?ccMatchKindFromEvent_(e):'',baseTeam=teamById(teamId),baseDefaults=ccTeamBaseDefaults_(teamId),defaultCourt=!editing&&!isMatch?(baseDefaults?.defaultCourt||baseTeam?.defaultCourt||'').replace(/\. pálya$/,''):'',defaultVenue=!editing&&!isMatch?'BEAC csarnok':'',defaultAddress=!editing&&!isMatch?'1117 Budapest, Bogdánfy u. 10/B.':'';
    return `<form id="competitionEventForm" class="action-form"><div class="action-form-grid">${isMatch?`<label class="field"><span>Meccstípus</span><select id="ceMatchKind"><option value="official" ${matchKind==='official'?'selected':''}>Sima meccs</option><option value="friendly" ${matchKind==='friendly'?'selected':''}>Edzőmeccs</option></select></label>`:''}<label class="field"><span>Csapat</span><select id="ceTeam" required>${ccEventFormTeamOptions_(teamId,kind)}</select></label><label class="field ${isMatch?'span-2':''}"><span>${isMatch?'Meccs neve / ellenfél':'Megnevezés'}</span><input id="ceTitle" maxlength="160" value="${esc(editing?(e.title||''):(isMatch?'Meccs':'Edzés'))}" required></label><label class="field"><span>Dátum</span><input id="ceDate" type="date" value="${esc(ccDateInputValue_(s))}" required></label>${ccTimeField_('ceStart','Kezdés',ccTimeInputValue_(s),{required:true})}${ccTimeField_('ceEnd','Befejezés',ccTimeInputValue_(en),{wrapId:'ceEndWrap'})}<label class="field"><span>Pálya</span><input id="ceCourt" value="${esc(editing?e.court:defaultCourt)}"></label><label class="field"><span>Helyszín</span><input id="ceVenue" value="${esc(editing?e.venue:defaultVenue)}"></label><label class="field span-2"><span>Cím</span><input id="ceAddress" value="${esc(editing?e.address:defaultAddress)}"></label>${isMatch?`<label class="field"><span>Hazai / idegen</span><select id="ceHomeAway"><option value="">–</option><option value="home" ${text(e?.homeAway||e?.home_away)==='home'?'selected':''}>Hazai</option><option value="away" ${text(e?.homeAway||e?.home_away)==='away'?'selected':''}>Idegen</option></select></label>${ccTimeField_('ceMeetingTime','Találkozó időpont',ccTimeInputValue_(e?.meetingAt||e?.meeting_at))}<label class="field span-2"><span>Találkozó helye</span><input id="ceMeetingPlace" value="${esc(e?.meetingPlace||e?.meeting_place||'')}"></label>`:''}</div>${!editing&&!isMatch?`<div class="action-form-repeat"><label><input id="ceRepeat" type="checkbox"> Hetente ismétlődjön</label><label class="field compact"><span>Ismétlés vége</span><input id="ceRepeatEnd" type="date"></label></div>`:''}<label class="action-checkbox"><input id="ceNotify" type="checkbox"> <span>Értesítés küldése a játékosoknak a változásról</span></label><div class="dialog-action-row"><button type="button" class="button quiet" id="ceCancel">Mégse</button>${editing&&!isEventPast(e)?'<button type="button" class="button danger" id="ceDelete">Esemény lemondása</button>':''}<button type="submit" class="button primary" id="ceSave">Mentés</button></div></form>`
  }

  function ccBRSZMatchSlotKey_(teamId,date,time){return `${text(teamId)}|${text(date)}|${text(time)}`}
  function ccBRSZExistingMatchSlots_(){
    const set=new Set();
    (state.activityEvents||[]).filter(e=>eventType(e)==='match').forEach(e=>{
      const start=eventStart(e);if(!start)return;
      set.add(ccBRSZMatchSlotKey_(eventTeamId(e),localDateKey(start),fmtTime(start)));
    });
    return set;
  }
  function ccBRSZMatchImportStatus_(row,existingSlots){
    if(row.review)return 'review';
    if(!canAction('competition.matches','edit',row.teamId))return 'permission';
    if(existingSlots.has(ccBRSZMatchSlotKey_(row.teamId,row.date,row.time)))return 'existing';
    return 'new';
  }
  function ccBudapestLocalIso_(dateValue,timeValue){
    const d=text(dateValue),t=text(timeValue);if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!/^\d{2}:\d{2}$/.test(t))return null;
    const [y,m,day]=d.split('-').map(Number),[hh,mm]=t.split(':').map(Number);
    const targetUtc=Date.UTC(y,m-1,day,hh,mm,0);
    let guess=targetUtc;
    const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Budapest',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
    for(let i=0;i<3;i++){
      const parts=Object.fromEntries(fmt.formatToParts(new Date(guess)).map(x=>[x.type,x.value]));
      const renderedUtc=Date.UTC(Number(parts.year),Number(parts.month)-1,Number(parts.day),Number(parts.hour),Number(parts.minute),Number(parts.second));
      guess=targetUtc-(renderedUtc-guess);
    }
    return new Date(guess).toISOString();
  }
  function ccBRSZMatchPayload_(row){
    return {
      eventType:'match',
      teamId:row.teamId,
      title:`${row.home} – ${row.away}`,
      startsAt:ccBudapestLocalIso_(row.date,row.time),
      endsAt:null,
      venue:text(row.venue),
      address:'',
      court:'',
      color:teamById(row.teamId)?.color||null,
      homeAway:row.homeAway,
      meetingAt:null,
      meetingPlace:''
    };
  }
  function ccBRSZImportStatusLabel_(s){
    if(s==='new')return['ÚJ','ok'];
    if(s==='existing')return['MÁR LÉTEZIK',''];
    if(s==='review')return['ELLENŐRIZENDŐ','warn'];
    return['NINCS JOGOSULTSÁG','warn'];
  }
  function openBRSZMatchImport_(){
    const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');if(!d||!body||!title)return;
    const existingSlots=ccBRSZExistingMatchSlots_();
    const rows=CC_BRSZ_BEAC_MATCH_IMPORT_V1.map((row,index)=>({...row,index,importStatus:ccBRSZMatchImportStatus_(row,existingSlots)}));
    const counts=rows.reduce((a,r)=>(a[r.importStatus]=(a[r.importStatus]||0)+1,a),{});
    if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='VERSENYSPORT · MECCSEK · BRSZ IMPORT';
    title.textContent='Meccslista importálása';
    const groups=['w1','w2','men'];
    const names={w1:'BEAC Női I',w2:'BEAC Női II',men:'BEAC Férfi'};
    body.innerHTML=`<div class="brsz-import-shell">
      <div class="brsz-import-summary">
        <div><b>${num(rows.length)}</b><span>forrássor</span></div>
        <div class="ok"><b>${num(counts.new||0)}</b><span>új</span></div>
        <div><b>${num(counts.existing||0)}</b><span>már létezik</span></div>
        <div class="warn"><b>${num(counts.review||0)}</b><span>ellenőrzendő</span></div>
      </div>
      <p class="brsz-import-note">Forrás: a 2026/27-es BRSZ meccslista. Az import nem küld értesítést. Ugyanazon csapat + dátum + kezdési idő esetén a már meglévő meccset nem hozza létre újra.</p>
      <div class="brsz-import-groups">${groups.map(group=>{
        const groupRows=rows.filter(r=>r.teamKey===group);
        return `<section class="brsz-import-group"><div class="brsz-import-group-head"><h4>${esc(names[group])}</h4><span>${groupRows.filter(r=>r.importStatus==='new').length} új</span></div>
          <div class="brsz-import-list">${groupRows.map(r=>{
            const [label,cls]=ccBRSZImportStatusLabel_(r.importStatus),enabled=r.importStatus==='new';
            return `<label class="brsz-import-row ${r.importStatus}">
              <input type="checkbox" data-brsz-import-index="${r.index}" ${enabled?'checked':''} ${enabled?'':'disabled'}>
              <div class="brsz-import-date"><b>${esc(r.date)}</b><span>${esc(r.time)}</span></div>
              <div class="brsz-import-main"><b>${esc(r.home)} – ${esc(r.away)}</b><span>${esc(r.venue||'–')}${r.referee?` · ${esc(r.referee)}`:''}</span>${r.note?`<small>${esc(r.note)}</small>`:''}</div>
              <span class="status-pill ${cls}">${label}</span>
            </label>`;
          }).join('')}</div>
        </section>`;
      }).join('')}</div>
      <div class="dialog-action-row"><button type="button" class="button quiet" id="brszImportCancel">Mégse</button><button type="button" class="button primary" id="brszImportSave">Új meccsek importálása</button></div>
    </div>`;
    ccOpenDialogStable_(d);
    $('#brszImportCancel')?.addEventListener('click',ccCloseEntityDialog_);
    $('#brszImportSave')?.addEventListener('click',async()=>{
      const btn=$('#brszImportSave');
      const selected=$$('[data-brsz-import-index]:checked').map(x=>rows[Number(x.dataset.brszImportIndex)]).filter(Boolean).filter(r=>r.importStatus==='new');
      if(!selected.length){status('Nincs importálható, kijelölt új meccs.','error');return}
      if(btn)btn.disabled=true;
      try{
        const payloads=selected.map(ccBRSZMatchPayload_).filter(p=>p.startsAt);
        for(let i=0;i<payloads.length;i+=26){
          await rpc('cc_manager_competition_event_series_create_v1',{p_payloads:payloads.slice(i,i+26),p_notify:false});
        }
        ccCloseEntityDialog_();
        await ccReloadCompetitionAfterWrite_();
        status(`${payloads.length} meccs importálva. Értesítés nem ment ki.`,'success');
      }catch(err){
        console.error(err);
        status(err.message||'A meccslista importálása sikertelen.','error');
        if(btn)btn.disabled=false;
      }
    });
  }

  function openCompetitionEventEditor(eventId=null,kind='training'){
    const e=eventId?findEventById(eventId):null,actualKind=e?eventType(e):kind,module=actualKind==='match'?'competition.matches':'competition.trainings',preferred=teamFilterIds_('events')[0]||state.eventTeam||state.selectedTeam||'',teamId=e?eventTeamId(e):(state.teams.find(t=>text(t.id)===text(preferred)&&canAction(module,'edit',t.id))?.id||state.teams.find(t=>canAction(module,'edit',t.id))?.id||null);
    if(!teamId||!canAction(module,'edit',teamId)){status('Nincs szerkesztési jogosultságod ehhez az eseménytípushoz.','error');return}
    const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');if(!d||!body||!title)return;
    if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent=`VERSENYSPORT · ${actualKind==='match'?'MECCS':'EDZÉS'} · SZERKESZTÉS`;
    title.textContent=e?'Esemény szerkesztése':(actualKind==='match'?'Új meccs':'Új edzés');body.innerHTML=ccEventFormHtml_(e,actualKind);ccOpenDialogStable_(d);
    $('#ceCancel')?.addEventListener('click',ccCloseEntityDialog_);
    $('#ceRepeat')?.addEventListener('change',ev=>{const x=$('#ceRepeatEnd');if(x)x.disabled=!ev.target.checked});if($('#ceRepeatEnd'))$('#ceRepeatEnd').disabled=true;
    if(actualKind==='match'){
      ccSyncMatchKindUi_();
      $('#ceMatchKind')?.addEventListener('change',ccSyncMatchKindUi_);
      $('#ceHomeAway')?.addEventListener('change',()=>{if(text($('#ceHomeAway')?.value)==='home')ccApplyHomeMatchDefaults_({force:true})});
      $('#ceTeam')?.addEventListener('change',()=>{if(text($('#ceHomeAway')?.value)==='home')ccApplyHomeMatchDefaults_({force:true})});
      if(!e&&text($('#ceHomeAway')?.value)==='home')ccApplyHomeMatchDefaults_({force:false});
    }
    $('#competitionEventForm')?.addEventListener('submit',async ev=>{
      ev.preventDefault();const btn=$('#ceSave');if(btn)btn.disabled=true;
      try{
        const date=$('#ceDate').value,start=ccNormalizeTime24_($('#ceStart').value),matchKind=actualKind==='match'?(text($('#ceMatchKind')?.value)||'official'):'',rawEnd=text($('#ceEnd')?.value),end=rawEnd?ccNormalizeTime24_(rawEnd):'',startsAt=ccLocalIso_(date,start);
        if(!start||!startsAt)throw new Error('Adj meg érvényes dátumot és 24 órás kezdést (pl. 19:30).');
        if(actualKind==='match'&&matchKind==='friendly'&&!end)throw new Error('Edzőmeccsnél add meg a befejezést is 24 órás formátumban.');
        if(rawEnd&&!end)throw new Error('A befejezés formátuma HH:MM legyen (pl. 21:00).');
        const endForSave=(actualKind==='match'&&matchKind==='official')?'':end,endsAt=endForSave?ccLocalIso_(date,endForSave):null;
        if(endsAt&&new Date(endsAt)<=new Date(startsAt))throw new Error('A befejezésnek később kell lennie a kezdésnél.');
        const base={eventType:actualKind,teamId:$('#ceTeam').value,title:text($('#ceTitle').value),startsAt,endsAt,venue:text($('#ceVenue').value),address:text($('#ceAddress').value),court:text($('#ceCourt').value),color:teamById($('#ceTeam').value)?.color||e?.color||null};
        if(actualKind==='match'){
          base.homeAway=text($('#ceHomeAway').value);
          if(base.homeAway==='home')ccApplyHomeMatchDefaults_({force:false});
          base.venue=text($('#ceVenue').value);base.address=text($('#ceAddress').value);base.court=text($('#ceCourt').value);
          const mtRaw=text($('#ceMeetingTime').value),mt=mtRaw?ccNormalizeTime24_(mtRaw):'';if(mtRaw&&!mt)throw new Error('A találkozó időpontja HH:MM formátumú legyen.');
          base.meetingAt=mt?ccLocalIso_(date,mt):null;base.meetingPlace=text($('#ceMeetingPlace').value);
        }
        const notify=$('#ceNotify')?.checked===true;
        if(e){
          await rpc('cc_manager_competition_event_save_v1',{p_event_id:text(e.eventId||e.id),p_payload:base,p_notify:notify});
        }else{
          const repeat=actualKind!=='match'&&$('#ceRepeat')?.checked===true,repeatEnd=text($('#ceRepeatEnd')?.value),series=repeat&&window.crypto?.randomUUID?window.crypto.randomUUID():null,dates=[date];
          if(repeat){if(!repeatEnd||repeatEnd<date)throw new Error('Adj meg érvényes ismétlési végdátumot.');let cur=new Date(`${date}T12:00:00`),last=new Date(`${repeatEnd}T12:00:00`);while(dates.length<26){cur=new Date(cur);cur.setDate(cur.getDate()+7);if(cur>last)break;dates.push(localDateKey(cur))}}
          const payloads=dates.map(day=>({...base,startsAt:ccLocalIso_(day,start),endsAt:endForSave?ccLocalIso_(day,endForSave):null,seriesId:series}));
          if(repeat){if(notify&&!window.confirm(`${payloads.length} alkalom készül, és minden alkalom külön értesítést generál. Folytatod?`)){if(btn)btn.disabled=false;return}await rpc('cc_manager_competition_event_series_create_v1',{p_payloads:payloads,p_notify:notify})}
          else await rpc('cc_manager_competition_event_save_v1',{p_event_id:null,p_payload:payloads[0],p_notify:notify});
        }
        ccCloseEntityDialog_();await ccReloadCompetitionAfterWrite_();status(e?'Esemény mentve.':'Esemény létrehozva.','success')
      }catch(err){console.error(err);status(err.message||'Az esemény mentése sikertelen.','error');if(btn)btn.disabled=false}
    });
    $('#ceDelete')?.addEventListener('click',async()=>{if(!e||!window.confirm('Biztosan lemondod ezt az eseményt? A rekord megmarad, cancelled státuszt kap.'))return;try{const notify=$('#ceNotify')?.checked===true;await rpc('cc_manager_competition_event_cancel_v1',{p_event_id:text(e.eventId||e.id),p_notify:notify});ccCloseEntityDialog_();await ccReloadCompetitionAfterWrite_();status('Esemény lemondva.','success')}catch(err){status(err.message||'A lemondás sikertelen.','error')}})
  }
  async function ccRosterRsvpWrite_(eventId,playerId,statusValue){try{await rpc('cc_manager_competition_rsvp_v1',{p_event_id:eventId,p_player_id:playerId,p_status:statusValue});state.eventRosterCache.delete(eventId);await Promise.all([loadRsvpMatrix(),loadActivityEvents(),loadCalendar()]);openEventDetail(eventId);status('RSVP mentve.','success')}catch(err){status(err.message||'Az RSVP mentése sikertelen.','error')}}
  async function ccRosterAttendanceWrite_(eventId,playerId,statusValue){try{await rpc('cc_manager_competition_attendance_v1',{p_event_id:eventId,p_player_id:playerId,p_status:statusValue});state.eventRosterCache.delete(eventId);await Promise.all([loadPlayers(),loadRsvpMatrix()]);openEventDetail(eventId);status('Jelenlét mentve.','success')}catch(err){status(err.message||'A jelenlét mentése sikertelen.','error')}}
  function ccCompetitionRsvpModel_(status){const s=text(status);if(s==='going')return {key:'going',value:0,label:'Jövök',db:'going'};if(s==='not_going')return {key:'not-going',value:2,label:'Nem jövök',db:'not_going'};return {key:'none',value:1,label:'Nincs jelzés',db:'unknown'}}
  function ccCompetitionRsvpByValue_(value){const n=Number(value);if(n<=0)return {key:'going',value:0,label:'Jövök',db:'going'};if(n>=2)return {key:'not-going',value:2,label:'Nem jövök',db:'not_going'};return {key:'none',value:1,label:'Nincs jelzés',db:'unknown'}}
  function ccCompetitionRsvpSlider_(p,editable){const model=ccCompetitionRsvpModel_(p?.status),stateClass=model.db==='going'?'yes':model.db==='not_going'?'no':'none';return `<div class="attendance-slider planner-slider cc-player-grid-slider ${stateClass}" data-manager-slider data-manager-slider-kind="competition" data-roster-rsvp="${esc(p?.playerId)}" data-slider-state="${stateClass}" aria-label="${esc(p?.displayName||p?.name||'Játékos')} részvételi jelzése: ${esc(model.label)}" ${editable?'':'data-slider-disabled="1"'}><button class="slider-zone left" type="button" data-slider-action="yes" ${editable?'':'disabled'}>✓</button><button class="slider-zone center" type="button" data-slider-action="none" ${editable?'':'disabled'}>–</button><button class="slider-zone right" type="button" data-slider-action="no" ${editable?'':'disabled'}>✕</button><span class="slider-thumb"></span></div>`}
  function ccCompetitionAttendanceSlider_(p,editable){
    const raw=text(p?.attendanceStatus),stateClass=raw==='present'?'yes':raw==='absent'?'no':'none';
    return `<div class="attendance-slider planner-slider cc-player-grid-slider cc-competition-attendance-slider ${stateClass}" data-manager-slider data-manager-slider-kind="attendance" data-roster-att-slider="${esc(p?.playerId)}" data-slider-state="${stateClass}" aria-label="${esc(p?.displayName||p?.name||'Játékos')} tényleges jelenléte" ${editable?'':'data-slider-disabled="1"'}><button class="slider-zone left" type="button" data-slider-action="yes" ${editable?'':'disabled'}>✓</button><button class="slider-zone center" type="button" data-slider-action="none" ${editable?'':'disabled'}>–</button><button class="slider-zone right" type="button" data-slider-action="no" ${editable?'':'disabled'}>✕</button><span class="slider-thumb"></span></div>`
  }
  function ccEventRosterCardHtml_(raw,eventId,editable,attendanceEditable){
    const p=enrichPlayer_(raw),rsvpLabel=x=>x==='going'?'Jövök':x==='not_going'?'Nem jövök':'Nincs válasz',note=text(raw?.note||raw?.availabilityNote||raw?.availability_note||'');
    const rsvp=`<span class="roster-rsvp ${esc(text(p.status)||'none')}">${esc(rsvpLabel(text(p.status)))}</span>`;
    const attendance=ccCompetitionAttendanceSlider_(p,attendanceEditable);
    const noteHtml=note?`<span class="cc-player-rsvp-note" title="${esc(note)}">💬 ${esc(note)}</span>`:'';
    return playerUnifiedCardHtml_(p,{openAttr:'data-roster-player-card',extraClass:'competition-roster-card',actionHtml:`<span class="cc-roster-rsvp-stack">${rsvp}${noteHtml}</span>${attendance}`});
  }
  function ccSyncCompetitionRsvpPreview_(input){if(!input)return;const model=ccCompetitionRsvpByValue_(input.value),control=input.closest('.cc-rsvp-control');if(!control)return;control.classList.remove('is-going','is-none','is-not-going');control.classList.add(`is-${model.key}`);const stateEl=control.querySelector('[data-cc-rsvp-state]');if(stateEl)stateEl.textContent=model.label}
  function ccSetPlayerStyleSliderState_(slider,state){if(!slider)return;const next=['yes','none','no'].includes(state)?state:'none';slider.classList.remove('yes','none','no','cc-slider-dragging','cc-slider-snapping','cc-slider-tap-snapping');slider.classList.add(next);slider.dataset.sliderState=next;slider.style.removeProperty('--cc-slider-left')}
  function ccSyncMassAttendanceCardState_(slider,model){const control=slider?.closest('.mass-attendance-control'),card=slider?.closest('.mass-attendance-card');if(control){control.classList.remove('is-present','is-noshow','is-pending');control.classList.add(`is-${model.key}`)}if(card){card.dataset.attendanceKey=model.key;const badge=card.querySelector('.mass-attendance-state-badge');if(badge){badge.classList.remove('is-present','is-noshow','is-pending');badge.classList.add(`is-${model.key}`);badge.textContent=model.label}}}
  function ccBindPlayerStyleSlider_(slider,{onCommit}={}){
    if(!slider||slider.dataset.playerSliderBound==='1')return;slider.dataset.playerSliderBound='1';
    let active=false,locked=false,pointerId=null,startX=0,startY=0,startLeft=0,currentLeft=0,lastX=0,lastT=0,velocityX=0,suppressClick=false;
    const states=['yes','none','no'];
    const currentState=()=>states.includes(slider.dataset.sliderState)?slider.dataset.sliderState:(slider.classList.contains('yes')?'yes':slider.classList.contains('no')?'no':'none');
    const geometry=()=>{const thumb=slider.querySelector('.slider-thumb'),tw=thumb?.getBoundingClientRect().width||Math.max(20,slider.clientWidth/3-4),min=2,max=Math.max(min,slider.clientWidth-tw-2);return{min,max,mid:(min+max)/2}};
    const stateLeft=(state,g=geometry())=>state==='yes'?g.min:state==='no'?g.max:g.mid;
    const stateFromLeft=(left,g=geometry())=>[['yes',g.min],['none',g.mid],['no',g.max]].reduce((best,item)=>Math.abs(item[1]-left)<Math.abs(best[1]-left)?item:best,['yes',g.min])[0];
    const idx=s=>Math.max(0,states.indexOf(s));
    const setLeft=left=>{currentLeft=left;slider.style.setProperty('--cc-slider-left',`${left.toFixed(1)}px`)};
    const disabled=()=>slider.dataset.sliderDisabled==='1';
    const snap=(state,commit=true,tap=false)=>{const g=geometry(),target=stateLeft(state,g);slider.classList.remove('cc-slider-dragging','cc-slider-snapping','cc-slider-tap-snapping');slider.classList.add(tap?'cc-slider-tap-snapping':'cc-slider-snapping');setLeft(target);setTimeout(()=>{slider.classList.remove('cc-slider-snapping','cc-slider-tap-snapping');slider.style.removeProperty('--cc-slider-left');if(commit){slider.dataset.sliderPrevious=currentState();ccSetPlayerStyleSliderState_(slider,state);onCommit?.(state)}},tap?140:200)};
    slider.addEventListener('click',e=>{if(disabled())return;if(suppressClick){suppressClick=false;e.preventDefault();e.stopPropagation();return}const b=e.target.closest('[data-slider-action]');if(!b)return;e.preventDefault();e.stopPropagation();const cur=currentState(),req=b.dataset.sliderAction;const ci=idx(cur),ri=idx(req),next=ci===ri?cur:states[ci+Math.sign(ri-ci)];if(next!==cur)snap(next,true,true)});
    slider.addEventListener('pointerdown',e=>{if(disabled()||e.button!==0)return;const g=geometry();active=true;locked=false;pointerId=e.pointerId;startX=e.clientX;startY=e.clientY;startLeft=stateLeft(currentState(),g);currentLeft=startLeft;lastX=e.clientX;lastT=performance.now();velocityX=0;setLeft(startLeft);slider.setPointerCapture?.(e.pointerId)});
    slider.addEventListener('pointermove',e=>{if(!active||e.pointerId!==pointerId)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(!locked){if(Math.hypot(dx,dy)<7)return;if(Math.abs(dy)>Math.abs(dx)){active=false;slider.style.removeProperty('--cc-slider-left');try{slider.releasePointerCapture?.(e.pointerId)}catch(_){ }return}locked=true;slider.classList.add('cc-slider-dragging')}const g=geometry(),next=Math.min(g.max,Math.max(g.min,startLeft+dx)),now=performance.now(),dt=Math.max(1,now-lastT);velocityX=(e.clientX-lastX)/dt;lastX=e.clientX;lastT=now;setLeft(next);e.preventDefault()},{passive:false});
    slider.addEventListener('pointerup',e=>{if(!active||e.pointerId!==pointerId)return;try{slider.releasePointerCapture?.(e.pointerId)}catch(_){ }const wasLocked=locked,g=geometry(),start=currentState(),direct=stateFromLeft(currentLeft,g),projected=stateFromLeft(Math.min(g.max,Math.max(g.min,currentLeft+velocityX*120)),g);let next=start;if(wasLocked){const dd=idx(direct)-idx(start);if(Math.abs(dd)>=2)next=direct;else{const pd=idx(projected)-idx(start);next=Math.abs(pd)>1?states[idx(start)+Math.sign(pd)]:projected}}active=false;locked=false;pointerId=null;slider.classList.remove('cc-slider-dragging');if(wasLocked){suppressClick=true;setTimeout(()=>suppressClick=false,320);snap(next,true,false)}else slider.style.removeProperty('--cc-slider-left')});
    slider.addEventListener('pointercancel',e=>{if(!active||e.pointerId!==pointerId)return;active=false;locked=false;pointerId=null;snap(currentState(),false,false)});
  }
  function ccBindCompetitionRoster_(host,eventId,editable,attendanceEditable){
    if(!host)return;
    Array.from(host.querySelectorAll('[data-roster-player-card]')).forEach(card=>{
      const open=ev=>{if(ev?.target?.closest?.('input,select,button,label,.cc-rsvp-control,.roster-action-field'))return;openPlayerDetail(card.dataset.rosterPlayerCard)};
      card.addEventListener('click',open);
      card.addEventListener('keydown',ev=>{if((ev.key==='Enter'||ev.key===' ')&&!ev.target.closest('input,select,button,label,.cc-rsvp-control,.roster-action-field')){ev.preventDefault();openPlayerDetail(card.dataset.rosterPlayerCard)}});
    });
    Array.from(host.querySelectorAll('[data-roster-att-slider]')).forEach(slider=>ccBindPlayerStyleSlider_(slider,{onCommit:state=>{const db=state==='yes'?'present':state==='no'?'absent':'clear';ccRosterAttendanceWrite_(eventId,slider.dataset.rosterAttSlider,db)}}));
  }
  function openEventDetail(id){
    const e=findEventById(id);if(!e)return;const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle'),s=eventStart(e),en=eventEnd(e),eventId=text(e.eventId||e.id),editable=ccEventCanEdit_(e),attendanceEditable=editable&&!!s&&s<=new Date();
    if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='VERSENYSPORT · ESEMÉNY';
    title.textContent=ccDisplayEventTitle_(e);
    body.innerHTML=`<div class="entity-hero event-entity-hero"><span class="event-detail-mark" style="background:${esc(e.color||teamById(eventTeamId(e))?.color||'#f7b700')}"></span><div><b>${esc(e.teamName||teamById(eventTeamId(e))?.name||'–')}</b><span>${esc(eventType(e)==='match'?'Meccs':'Edzés')} · ${esc(s?fmtDate(s):'–')} ${esc(s?fmtTime(s):'–')}</span></div>${editable?`<button class="button quiet small entity-hero-action" id="eventEditBtn" type="button">Szerkesztés</button>`:''}</div><div class="detail-grid">${detailPair('Kezdés',s?`${fmtDate(s)} ${fmtTime(s)}`:'–')}${eventType(e)==='training'||ccMatchKindFromEvent_(e)==='friendly'?detailPair('Befejezés',en?fmtTime(en):'–'):''}${eventType(e)==='training'?detailPair('Pálya',e.court):`${detailPair('Helyszín',e.venue)}${detailPair('Cím',e.address)}${detailPair('Pálya',e.court)}${detailPair('Találkozó',e.meetingAt?`${fmtTime(e.meetingAt)} · ${e.meetingPlace||''}`:(e.meetingPlace||'–'))}`}</div><div class="panel-subhead"><div><h4>Részvételi jelzések</h4><p>A játékos RSVP-je és üzenete itt látható; a tényleges jelenlétet az esemény után lehet rögzíteni.</p></div></div><div class="attendance-detail rsvp-detail"><div><small>Jövök</small><b>${num(e.yesCount)}</b><span>fő</span></div><div><small>Nem jövök</small><b>${num(e.noCount)}</b><span>fő</span></div><div><small>Nincs válasz</small><b>${num(e.unknownCount)}</b><span>fő</span></div></div><div class="panel-subhead"><div><h4>Névsor</h4><p>RSVP, játékosüzenet és tényleges jelenlét.</p></div></div><div id="eventRosterBody" class="event-roster-detail"><span class="roster-loading">Névsor betöltése…</span></div>`;
    ccOpenDialogStable_(d);$('#eventEditBtn')?.addEventListener('click',()=>openCompetitionEventEditor(eventId,eventType(e)));
    if(!eventId||!configured())return;
    loadEventRoster(eventId).then(rows=>{const host=$('#eventRosterBody');if(!host)return;host.innerHTML=rows.length?`<div class="event-roster-list action-roster-list competition-roster-list cc-unified-player-list">${rows.map(p=>ccEventRosterCardHtml_(p,eventId,editable,attendanceEditable)).join('')}</div>`:emptyInline('Nincs játékos a névsorban.');ccBindCompetitionRoster_(host,eventId,editable,attendanceEditable)}).catch(err=>{const host=$('#eventRosterBody');if(host)host.innerHTML=`<span class="roster-loading error">${esc(err?.message||'A névsor nem tölthető be.')}</span>`})
  }

  function bindEventDetailActions(){$$('[data-event-id]').forEach(el=>el.addEventListener('click',()=>openEventDetail(el.dataset.eventId)))}
  function matrixResponseMap(){const m=new Map();(state.rsvpMatrix.responses||[]).forEach(r=>m.set(`${text(r.eventId)}:${text(r.playerId)}`,text(r.status)||'none'));return m}
  function matrixCellState_(status){const s=text(status);return s==='going'?'yes':s==='not_going'?'no':'none'}
  function matrixPlayerControl_(eventId,playerId,status,editable){const st=matrixCellState_(status),glyph=st==='yes'?'✓':st==='no'?'✕':'·';return `<span class="matrix-read-state ${st}" aria-label="${st==='yes'?'Jövök':st==='no'?'Nem jövök':'Nincs válasz'}">${glyph}</span>`}
  async function matrixRsvpWrite_(control,next){if(!control)return;const eventId=text(control.dataset.eventId),playerId=text(control.dataset.playerId),db=next==='yes'?'going':next==='no'?'not_going':'unknown',prev=text(control.dataset.state)||'none';control.dataset.state=next;control.classList.remove('yes','none','no');control.classList.add(next);try{await rpc('cc_manager_competition_rsvp_v1',{p_event_id:eventId,p_player_id:playerId,p_status:db});const row=(state.rsvpMatrix.responses||[]).find(r=>text(r.eventId)===eventId&&text(r.playerId)===playerId);if(row)row.status=db;else (state.rsvpMatrix.responses||[]).push({eventId,playerId,status:db});state.eventRosterCache.delete(eventId);status('RSVP mentve.','success')}catch(err){control.dataset.state=prev;control.classList.remove('yes','none','no');control.classList.add(prev);status(err.message||'Az RSVP mentése sikertelen.','error')}}
  function matrixFilteredEvents(){const f=state.matrixFilters||{};return effectiveCompetitionEvents(state.rsvpMatrix.events||[]).filter(e=>teamFilterMatch_('overview',eventTeamId(e))&&(f.kind==='ALL'||(f.kind==='TRAINING'&&eventType(e)==='training')||(f.kind==='MATCH'&&eventType(e)==='match'))).sort((a,b)=>eventStart(a)-eventStart(b))}
  function gridGivenName(p){const raw=text(p?.displayName||p?.name||'');if(!raw)return'–';const parts=raw.split(/\s+/).filter(Boolean);return parts[0]||raw}
  function matrixMonthLabel(e){const d=eventStart(e);return d?new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'long',timeZone:'Europe/Budapest'}).format(d):''}
  function matrixCountClass(n){const x=num(n);return x<=6?'low':(x<10?'mid':'high')}
  function matrixTeamHtml(teamId,events,map){
    let players=(state.rsvpMatrix.players||[]).filter(p=>text(p.teamId)===text(teamId));
    const f=state.matrixFilters||{};
    if(f.status!=='ALL')players=players.filter(p=>events.some(e=>map.get(`${text(e.eventId)}:${text(p.playerId)}`)===f.status));
    players.sort((a,b)=>(num(a.jerseyNo)||9999)-(num(b.jerseyNo)||9999)||text(a.displayName||a.name).localeCompare(text(b.displayName||b.name),'hu'));
    const t=teamById(teamId);if(!events.length)return'';
    const teamColor=t?.color||events.find(e=>e.color)?.color||'#f7b700';
    const head=`<th class="matrix-event-col matrix-event-side sticky-matrix-col">Alkalom</th><th class="matrix-count-col matrix-count-head">Fő</th>${players.map(p=>`<th class="matrix-player-head" title="${esc(p.displayName||p.name)}"><span class="grid-player-head-inner">${avatarHtml(p,'matrix')}<span class="grid-player-label">${esc(gridGivenName(p))}</span></span></th>`).join('')}`;
    let lastMonth='';
    const body=events.map((e,idx)=>{
      const month=matrixMonthLabel(e),divider=idx>0&&month!==lastMonth?`<tr class="matrix-month-divider"><td colspan="${2+players.length}"><span>${esc(month)}</span></td></tr>`:'';lastMonth=month;
      const going=players.filter(p=>map.get(`${text(e.eventId)}:${text(p.playerId)}`)==='going').length,kind=eventType(e)==='match'?'Meccs':'Edzés',editable=ccEventCanEdit_(e);
      const iconPath=eventType(e)==='training'?'assets/event-training-mask.png':text(e.homeAway||e.home_away)==='away'?'assets/event-away-mask.png':'assets/event-home-mask.png';
      const eventLabel=eventType(e)==='training'?'Edzés':ccEventOpponent_(e)||'Meccs';
      return divider+`<tr class="matrix-data-row"><th class="matrix-event-col matrix-event-side sticky-matrix-col"><button class="matrix-event-side-btn" type="button" data-event-id="${esc(e.eventId)}"><span class="matrix-side-icon"><img src="${iconPath}" alt=""></span><span class="matrix-event-copy"><b>${esc(eventLabel)}</b><small>${esc(fmtDate(eventStart(e)))} · ${esc(fmtTime(eventStart(e)))}</small></span></button></th><td class="matrix-count-col matrix-count-cell"><strong class="${matrixCountClass(going)}">${going}</strong></td>${players.map(p=>{const st=map.get(`${text(e.eventId)}:${text(p.playerId)}`);return `<td class="matrix-cell ${st==='going'?'going':st==='not_going'?'not-going':'none'}">${matrixPlayerControl_(e.eventId,p.playerId,st,editable)}</td>`}).join('')}</tr>`
    }).join('');
    return `<section class="matrix-team-section player-parity-team" style="--team-color:${esc(teamColor)}"><div class="matrix-team-title"><strong><i></i>${esc(t?.name||'Csapat')}</strong><span>${events.length} esemény · ${players.length} játékos</span></div><div class="matrix-scroll manager-player-grid"><table class="rsvp-matrix season-matrix transposed-matrix manager-player-matrix"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div></section>`
  }

  function matrixFiltersActive_(){const f=state.matrixFilters||{};return teamFilterIds_('overview').length>0||f.period!=='14'||f.kind!=='ALL'||f.status!=='ALL'||!!f.from||!!f.to}
  function matrixFiltersHtml(){
    state.matrixFilterOpen=filterOpen_('competition.overview',state.matrixFilterOpen);
    const f=state.matrixFilters||{},custom=f.period==='CUSTOM';
    return `<div class="matrix-filter-panel ${state.matrixFilterOpen?'open':''}" id="matrixFilterPanel" ${state.matrixFilterOpen?'':'hidden'}><div class="field compact">${teamMultiFilterHtml_('overview')}</div><label>Időszak<select data-matrix-filter="period"><option value="14" ${f.period==='14'?'selected':''}>Következő 2 hét</option><option value="28" ${f.period==='28'?'selected':''}>Következő 4 hét</option><option value="CUSTOM" ${f.period==='CUSTOM'?'selected':''}>Egyéni időszak</option></select></label><label>Eseménytípus<select data-matrix-filter="kind"><option value="ALL" ${f.kind==='ALL'?'selected':''}>Edzés + meccs</option><option value="TRAINING" ${f.kind==='TRAINING'?'selected':''}>Csak edzés</option><option value="MATCH" ${f.kind==='MATCH'?'selected':''}>Csak meccs</option></select></label><label>Jelzés<select data-matrix-filter="status"><option value="ALL" ${f.status==='ALL'?'selected':''}>Minden játékos</option><option value="going" ${f.status==='going'?'selected':''}>Jövök</option><option value="not_going" ${f.status==='not_going'?'selected':''}>Nem jövök</option><option value="none" ${f.status==='none'?'selected':''}>Nincs válasz</option></select></label>${custom?`<label>Időszak eleje<input type="date" data-matrix-filter="from" value="${esc(f.from||'')}"></label><label>Időszak vége<input type="date" data-matrix-filter="to" value="${esc(f.to||'')}"></label>`:''}</div>`
  }
  function renderMatrix(){
    const events=matrixFilteredEvents(),map=matrixResponseMap(),selectedTeamIds=teamFilterIds_('overview'),teamIds=selectedTeamIds.length?selectedTeamIds:state.teams.map(t=>t.id),active=matrixFiltersActive_();
    return `<div class="parity-matrix"><div class="parity-matrix-head"><div><h3>Jelenlét</h3><p>Jövök / Nem jövök / Nincs válasz</p></div><div class="matrix-head-filter-actions"><button class="matrix-filter-toggle icon-only ${state.matrixFilterOpen?'open':''} ${active?'has-filter':''}" id="matrixFilterToggle" type="button" aria-expanded="${state.matrixFilterOpen?'true':'false'}" aria-controls="matrixFilterPanel" aria-label="Jelenlét szűrők"><span class="triangle-icon"></span></button>${active?`<button class="filter-reset" id="matrixFilterReset" type="button">Szűrők törlése</button>`:''}</div></div>${matrixFiltersHtml()}${teamIds.map(id=>matrixTeamHtml(id,events.filter(e=>eventTeamId(e)===text(id)),map)).join('')||emptyInline('Nincs esemény a kiválasztott szűréssel.')}</div>`
  }

  function bindMatrix(){const tog=$('#matrixFilterToggle'),panel=$('#matrixFilterPanel'),reset=$('#matrixFilterReset');if(tog)tog.onclick=()=>{const open=setFilterOpen_('competition.overview',!state.matrixFilterOpen);state.matrixFilterOpen=open;tog.classList.toggle('open',open);tog.setAttribute('aria-expanded',String(open));if(panel){panel.hidden=!open;panel.classList.toggle('open',open)}ccBlurPointerControl_(tog)};reset?.addEventListener('click',async()=>{state.matrixFilters={team:'',period:'14',kind:'ALL',status:'ALL',from:'',to:''};state.teamFilters.overview=[];if(configured())await loadRsvpMatrix();renderOverview()});bindTeamMultiFilter_('overview',renderOverview);$$('[data-matrix-filter]').forEach(el=>el.addEventListener('change',()=>{const k=el.dataset.matrixFilter,old=state.matrixFilters[k];state.matrixFilters[k]=el.value;afterNativePicker(el,async()=>{if(k==='period'||k==='from'||k==='to'){try{if(configured())await loadRsvpMatrix()}catch(err){state.matrixFilters[k]=old;status(err.message,'error')}}renderOverview()},'#matrixFilterPanel')}));$$('[data-matrix-rsvp]').forEach(control=>control.querySelectorAll('[data-matrix-state]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();matrixRsvpWrite_(control,btn.dataset.matrixState)})));bindEventDetailActions()}
  function massLevelColor(e){
    const explicit=text(e?.color);if(/^#[0-9a-f]{6}$/i.test(explicit))return explicit;
    const l=text(e?.level).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
    if(l.includes('KOZEPHALADO-HALADO'))return '#8856CD';
    if(l.includes('KOZEPHALADO'))return '#DE4F4F';
    if(l.includes('HALADO'))return '#535353';
    if(l.includes('KEZDO'))return '#4B91E1';
    if(l.includes('VERSENY'))return '#E78B2D';
    return '#787878';
  }
  function hexRgb(hex){const m=String(hex||'').match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);return m?`${parseInt(m[1],16)}, ${parseInt(m[2],16)}, ${parseInt(m[3],16)}`:'120, 120, 120'}
  function massLegacyTrainingRow(e,{overview=false}={}){
    const s=safeDate(e.startsAt),en=safeDate(e.endsAt),active=e.active!==false,gate=text(e.registrationMode)==='WAITLIST_ONLY',color=massLevelColor(e),busy=text(state.massActionBusy)===text(e.eventId),cap=num(e.capacity||e.totalLimit||e.newLimit),eventId=text(e.eventId);
    return `<div class="legacy-mass-training-item" style="--level-rgb:${esc(hexRgb(color))}"><div class="legacy-mass-training-row ${active?'':'inactive'} ${gate?'waitlist-only':''}">
      <button class="legacy-mass-main" type="button" data-mass-detail="${esc(eventId)}"><span><b>${esc(e.level||'Edzés')}</b><small>Edzés</small></span></button>
      <div class="legacy-mass-date"><b>${esc(s?fmtDate(s):'–')}</b><small>${esc(s?fmtTime(s):'–')}${en?` – ${esc(fmtTime(en))}`:''}</small></div>
      <div class="legacy-mass-court"><b>${esc(e.court||'–')}</b><small>Pálya</small></div>
      <div class="legacy-mass-count"><b>${num(e.totalActive)} <span>/ ${cap}</span></b><small>${num(e.waitlistCount)} várólistán</small></div>
      <div class="legacy-mass-status"><span class="training-active-pill ${!active?'off':''} ${gate?'waitlist':''}">${!active?'INAKTÍV':(gate?'CSAK VÁRÓLISTA':'AKTÍV')}</span></div>
      ${overview?'':`<div class="legacy-mass-actions">${canAction('mass.trainings','edit')&&active?`<button class="button ${gate?'quiet':'warning'} small" type="button" data-mass-gate="${esc(eventId)}" data-close="${gate?'0':'1'}" ${busy?'disabled':''}>${busy?'Mentés…':(gate?'Jelentkezés megnyitása':'Jelentkezés lezárása')}</button>`:''}</div>`}
      <button class="legacy-mass-chevron" type="button" data-mass-roster-toggle="${esc(eventId)}" aria-expanded="false" aria-label="Névsor lenyitása"><span class="triangle-icon"></span></button>
    </div><div class="legacy-mass-inline-roster" data-mass-roster-holder="${esc(eventId)}" hidden></div></div>`;
  }
  async function toggleMassInlineRoster_(eventId,button){
    const holder=document.querySelector(`[data-mass-roster-holder="${CSS.escape(eventId)}"]`);if(!holder)return;const opening=holder.hidden;holder.hidden=!opening;button?.setAttribute('aria-expanded',String(opening));button?.classList.toggle('open',opening);if(!opening)return;if(holder.dataset.loaded==='1')return;holder.innerHTML='<div class="roster-loading">Névsor betöltése…</div>';
    try{const data=await loadMassEventDetail(eventId,{force:true}),bookings=(Array.isArray(data?.bookings)?data.bookings:[]).slice().sort(massPersonSort_),wait=(Array.isArray(data?.waitlist)?data.waitlist:[]).slice().sort(massPersonSort_);holder.dataset.loaded='1';holder.innerHTML=`<div class="mass-inline-roster-list">${bookings.map(r=>`<div class="mass-inline-person"><b>${esc(r.name||'Névtelen')}</b><span class="mass-coming yes">Jön</span></div>`).join('')}${wait.map(r=>`<div class="mass-inline-person wait"><b>${esc(r.name||'Névtelen')}</b><span class="mass-coming wait">Várólista</span></div>`).join('')||(!bookings.length?emptyInline('Nincs jelentkező.'):'')}</div>`}catch(err){holder.innerHTML=`<div class="roster-loading error">${esc(err.message||'A névsor nem tölthető be.')}</div>`}
  }
  function bindMassLegacyRows(){
    $$('[data-mass-detail]').forEach(b=>b.addEventListener('click',()=>openMassEventDetail(b.dataset.massDetail)));
    $$('[data-mass-gate]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();toggleMassRegistrationGate(b.dataset.massGate,b.dataset.close==='1')}));
    $$('[data-mass-roster-toggle]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();toggleMassInlineRoster_(b.dataset.massRosterToggle,b)}));
  }
  function renderOverview(){
    if(state.area!=='competition'){
      const rows=(state.massTrainings||[]).filter(e=>safeDate(e.startsAt)?.getTime()>=Date.now()-3600000).sort((a,b)=>safeDate(a.startsAt)-safeDate(b.startsAt));
      const totalBookings=rows.reduce((n,e)=>n+num(e.totalActive),0),totalWait=rows.reduce((n,e)=>n+num(e.waitlistCount),0),closed=rows.filter(e=>text(e.registrationMode)==='WAITLIST_ONLY').length;
      $('#viewContent').innerHTML=`<div class="overview-summary parity-summary mass-summary-compact"><div><strong>${rows.length}</strong><span>Közelgő edzés</span></div><div><strong>${totalBookings}</strong><span>Aktív jelentkezés</span></div><div><strong>${totalWait}</strong><span>Várólistán</span></div><div><strong>${closed}</strong><span>Csak várólista</span></div></div><article class="panel legacy-mass-panel"><div class="panel-head"><div><h3>Következő edzések</h3><p>A régi Manager edzéslistájának színkódolt, gradiens nézete.</p></div><button class="button quiet small" id="massOverviewAll" type="button">Összes edzés</button></div><div class="legacy-mass-training-header overview"><div>Cím / szint</div><div>Időpont</div><div>Pálya</div><div>Létszám</div><div>Státusz</div><div></div></div><div class="legacy-mass-training-list">${rows.slice(0,10).map(e=>massLegacyTrainingRow(e,{overview:true})).join('')||emptyInline('Nincs közelgő Tömegsport edzés.')}</div></article>`;
      $('#massOverviewAll')?.addEventListener('click',()=>setRoute('mass','trainings'));bindMassLegacyRows();return;
    }
    const now=Date.now(),trainingUntil=now+14*864e5,matchUntil=now+31*864e5,overviewFallback=Array.isArray(state.overview?.nextEvents)?state.overview.nextEvents:[],events=effectiveCompetitionEvents(state.activityEvents.length?state.activityEvents:overviewFallback).filter(e=>!isEventPast(e)&&teamFilterMatch_('overview',eventTeamId(e))),trainings=events.filter(e=>eventType(e)==='training'&&(eventStart(e)?.getTime()||0)<trainingUntil),matches=events.filter(e=>eventType(e)==='match'&&(eventStart(e)?.getTime()||0)<matchUntil),teamsWithProgram=new Set(events.map(eventTeamId).filter(Boolean));
    $('#viewContent').innerHTML=`<div class="page-intro overview-player-intro"><div><h2>Versenysport áttekintés</h2><p>Következő edzések, meccsek és részvételi jelzések.</p></div></div><div class="parity-overview-grid manager-overview-main"><article class="panel parity-matrix-card">${renderMatrix()}</article><article class="panel next-matches-card"><div class="panel-head"><div><h3>Következő meccsek</h3><p>következő 1 hónap</p></div><button class="button quiet small" id="allMatchesBtn" type="button">Összes</button></div><div class="cc-event-card-list overview-event-card-list">${matches.slice(0,8).map(e=>ccEventCardHtml_(e,'match')).join('')||emptyInline('Nincs közelgő meccs.')}</div></article></div><div class="overview-summary parity-summary compact-kpi-strip"><div><strong>${trainings.length}</strong><span>Közelgő edzés</span></div><div><strong>${matches.length}</strong><span>Közelgő meccs</span></div><div><strong>${teamsWithProgram.size}</strong><span>Csapat programmal</span></div></div>${standingsSection_('overview')}`;
    $('#allMatchesBtn')?.addEventListener('click',()=>setRoute('competition','matches'));bindTeamMultiFilter_('overview',renderOverview);bindMatrix();bindEventDetailActions();
  }

  function notificationRecipientById(id){return (state.notificationRecipients||[]).find(p=>text(p.playerId)===text(id))||null}
  function notificationTeamText(p){const teams=Array.isArray(p?.teams)?p.teams:[];return teams.map(t=>text(t.teamName)).filter(Boolean).join(', ')||'Nincs aktív csapat'}
  function notificationRecipientRows(){
    const q=text(state.notificationSearch).toLowerCase();
    return (state.notificationRecipients||[]).filter(p=>!q||text(p.displayName).toLowerCase().includes(q)||text(p.email).toLowerCase().includes(q)).slice(0,60)
  }
  function notificationEventOptions(player){
    const teamIds=new Set((Array.isArray(player?.teams)?player.teams:[]).map(t=>text(t.teamId)).filter(Boolean));
    const rows=effectiveCompetitionEvents(state.activityEvents||[]).filter(e=>teamIds.has(eventTeamId(e))&&!isEventPast(e)).sort((a,b)=>eventStart(a)-eventStart(b)).slice(0,40);
    return '<option value="">Nincs kapcsolt esemény</option>'+rows.map(e=>`<option value="${esc(e.eventId||e.id)}">${esc(fmtDate(eventStart(e)))} ${esc(fmtTime(eventStart(e)))} · ${esc(e.teamName||teamById(eventTeamId(e))?.name||'')} · ${esc(e.title||(eventType(e)==='match'?'Meccs':'Edzés'))}</option>`).join('')
  }
  function renderNotificationHistory(){
    const rows=state.notificationHistory||[];
    if(!rows.length)return emptyInline('Még nincs kézzel küldött értesítésed.');
    return `<div class="notification-history-list">${rows.map(x=>{const st=text(x.status).toLowerCase(),label=st==='sent'?'ELKÜLDVE':st==='failed'?'SIKERTELEN':st==='skipped'?'NINCS AKTÍV PUSH ESZKÖZ':st==='pending'?'VÁRAKOZIK':(st||'VÁRAKOZIK').toUpperCase();return `<div class="notification-history-row"><div><b>${esc(x.displayName||x.email||'Játékos')}</b><small>${esc(x.email||'')} · ${esc(fmtDate(x.createdAt))} ${esc(fmtTime(x.createdAt))}</small></div><div class="notification-history-message"><strong>${esc(x.title||'')}</strong><span>${esc(x.body||'')}</span></div><span class="status-pill ${st==='sent'?'ok':st==='failed'?'danger':'warn'}">${esc(label)}</span></div>`}).join('')}</div>`
  }
  function renderNotifications(){
    const recipients=notificationRecipientRows(),selected=notificationRecipientById(state.notificationSelectedPlayerId),err=state.notificationLoadError;
    $('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Értesítések</h2><p>Egyéni Player értesítés. Csak a kiválasztott játékos fiókja kapja meg.</p></div><span class="read-only-badge write-enabled">IN-APP + PUSH</span></div>${err?`<div class="inline-error">${esc(err)}</div>`:''}<div class="notification-manager-grid"><article class="panel notification-recipient-panel"><div class="panel-head"><div><h3>1. Címzett</h3><p>Név vagy email alapján válassz pontosan egy játékost.</p></div></div><label class="field notification-search"><span>Keresés</span><input id="notificationRecipientSearch" type="search" value="${esc(state.notificationSearch)}" placeholder="Név vagy email cím" autocomplete="off"></label><div class="notification-recipient-list">${recipients.map(p=>`<button class="notification-recipient ${text(p.playerId)===text(state.notificationSelectedPlayerId)?'selected':''}" data-notification-player="${esc(p.playerId)}" type="button">${avatarHtml(p,'notification')}<span><b>${esc(p.displayName||p.email)}</b><small>${esc(p.email)} · ${esc(notificationTeamText(p))}</small></span><em>${num(p.activeDevices)>0?`${num(p.activeDevices)} push eszköz`:'csak in-app'}</em></button>`).join('')||emptyInline('Nincs találat.')}</div></article><article class="panel notification-compose-panel"><div class="panel-head"><div><h3>2. Üzenet</h3><p>${selected?`Címzett: ${esc(selected.displayName||selected.email)} · ${esc(selected.email)}`:'Előbb válassz címzettet.'}</p></div></div>${selected?`<div class="notification-selected-card">${avatarHtml(selected,'notification-large')}<div><b>${esc(selected.displayName||selected.email)}</b><span>${esc(selected.email)}</span><small>${esc(notificationTeamText(selected))} · ${num(selected.activeDevices)>0?'push aktív':'nincs aktív push eszköz'}</small></div></div><label class="field"><span>Cím</span><input id="notificationTitle" maxlength="120" value="Club Control" placeholder="Értesítés címe"></label><label class="field"><span>Üzenet</span><textarea id="notificationBody" maxlength="1200" rows="6" placeholder="Írd meg az értesítés szövegét…"></textarea></label><label class="field"><span>Kapcsolt esemény <small>opcionális</small></span><select id="notificationEventId">${notificationEventOptions(selected)}</select></label><div class="notification-delivery-note"><b>Mit fog kapni?</b><span>Az in-app értesítés azonnal létrejön. Ha van aktív push eszköze, a telefonos értesítés a következő automatikus küldési körben érkezik.</span></div><button class="button primary full" id="notificationSendBtn" type="button" ${state.notificationBusy?'disabled':''}>${state.notificationBusy?'Küldés…':'Értesítés küldése'}</button>`:`<div class="admin-editor-empty"><b>Nincs kiválasztott címzett</b><span>A bal oldali listából válassz egy játékost.</span></div>`}</article></div><article class="panel notification-history-panel"><div class="panel-head"><div><h3>Legutóbbi küldéseim</h3><p>A saját Manager-fiókodból indított kézi értesítések.</p></div><button class="button quiet small" id="notificationHistoryRefresh" type="button">Frissítés</button></div>${renderNotificationHistory()}</article>`;
    bindNotifications()
  }
  function bindNotifications(){
    $('#notificationRecipientSearch')?.addEventListener('input',e=>{state.notificationSearch=e.target.value;const value=e.target.value;clearTimeout(bindNotifications._timer);bindNotifications._timer=setTimeout(async()=>{try{await loadNotificationRecipients(value)}catch(err){state.notificationLoadError=text(err?.message||err)}renderNotifications()},220)});
    $$('[data-notification-player]').forEach(b=>b.addEventListener('click',()=>{state.notificationSelectedPlayerId=b.dataset.notificationPlayer;renderNotifications()}));
    $('#notificationSendBtn')?.addEventListener('click',sendManualNotification);
    $('#notificationHistoryRefresh')?.addEventListener('click',async()=>{try{await loadNotificationHistory();status('Értesítési előzmények frissítve.','success')}catch(err){status(err.message||'Nem sikerült frissíteni.','error')}renderNotifications()})
  }
  async function sendManualNotification(){
    if(state.notificationBusy)return;const player=notificationRecipientById(state.notificationSelectedPlayerId);if(!player){status('Válassz címzettet.','error');return}const title=text($('#notificationTitle')?.value),body=text($('#notificationBody')?.value),eventId=text($('#notificationEventId')?.value)||null;if(!title){status('Az értesítés címe kötelező.','error');return}if(!body){status('Az üzenet szövege kötelező.','error');return}state.notificationBusy=true;renderNotifications();try{const result=await rpc('cc_manager_notification_send_v1',{p_player_id:player.playerId,p_title:title,p_body:body,p_event_id:eventId});await loadNotificationHistory();const push=num(result?.activeDevices)>0?'Push sorba állítva.':'Nincs aktív push eszköz, az in-app értesítés ettől még létrejött.';status(`Értesítés elküldve: ${player.email}. ${push}`,'success');renderNotifications()}catch(err){console.error(err);status(err.message||'Az értesítés küldése sikertelen.','error');state.notificationBusy=false;renderNotifications();return}state.notificationBusy=false;renderNotifications()}

  function renderModule(){
    const m=state.module;
    if(m==='settings'){if(!can('settings')){renderPermissionDenied();return}renderSettings();return}
    if(m==='planning'){if(!canMainSection_('planning')){renderPermissionDenied();return}renderTrainingPlannerParity();return}
    if(!canRoute(state.area,m)){renderPermissionDenied();return}
    if(m==='overview'){renderOverview();return}
    if(m==='calendar'){renderCalendar();return}
    if(state.area==='competition'&&m==='teams'){renderTeams();return}
    if(state.area==='competition'&&m==='players'){renderPlayers();return}
    if(state.area==='competition'&&m==='notifications'){renderNotifications();return}
    if(state.area==='competition'&&m==='trainings'){renderCompetitionTrainingCards_();return}
    if(state.area==='competition'&&m==='matches'){renderCompetitionMatchCards_();return}
    if(state.area==='competition'&&m==='fees'){renderPlaceholder('Díjak','A jelenlegi havi díj-/fizetési mátrix production parityje ide kerül.',['Játékosonkénti havi státusz','Edzői díj','Bérlet','Audit / felülírás']);return}
    if(state.area==='competition'&&m==='competition'){renderPlaceholder('Versenyadatok','Competition Core: tabella, teljes meccslista, BRSZ/MRSZ források és konfliktusok.',['054 Competition Core backend előtt nincs production adat','Saját csapatok meccsei az events bridge-en keresztül','Külső liga-meccsek nem kerülnek az events táblába']);return}
    if(state.area==='mass'&&m==='trainings'){renderMassTrainings();return}
    if(state.area==='mass'&&m==='athletes'){renderMassAthletes();return}
    if(state.area==='mass'&&m==='archive'){renderMassArchive();return}
    if(state.area==='mass'&&m==='passes'){renderMassPasses();return}
    renderPlaceholder(moduleMeta()?.[1]||'Modul','A modul foundation helye.',['read-only migráció','parity teszt','write csak később']);
  }

  function massOverviewRow(e){const s=safeDate(e.startsAt),st=massTrainingStatus(e);return `<button class="mass-overview-row" type="button" data-mass-detail="${esc(e.eventId)}"><span class="mass-training-dot" style="background:${esc(e.color||'#f7b700')}"></span><div><b>${esc(e.level||'Edzés')}</b><small>${esc(s?fmtDate(s):'–')} · ${esc(s?fmtTime(s):'–')} · ${esc(e.court||'Pálya –')}</small></div><div class="mass-overview-numbers"><b>${num(e.totalActive)} fő</b><small>${num(e.waitlistCount)} váró</small></div><span class="status-pill ${st.cls}">${st.label}</span></button>`}
  function massTrainingStatus(e){
    if(e.publicRegistrationActive===false)return {label:'PUBLIKUS KI',cls:'muted'};
    if(text(e.registrationMode)==='WAITLIST_ONLY')return {label:'CSAK VÁRÓLISTA',cls:'warn'};
    return {label:'AKTÍV',cls:'ok'}
  }
  function massTrainingRow(e,canEdit){
    const s=safeDate(e.startsAt),en=safeDate(e.endsAt),closed=text(e.registrationMode)==='WAITLIST_ONLY',sport7=text(e.sessionType).toUpperCase()==='SPORT7',st=massTrainingStatus(e),busy=state.massActionBusy===text(e.eventId);
    const action=!e.publicRegistrationActive?'<span class="mass-gate-note">A publikus jelentkezés ki van kapcsolva.</span>':sport7?'<span class="mass-gate-note">SPORT7 külön jelentkezési csatorna.</span>':`<button class="button ${closed?'quiet':'danger'} small mass-gate-button" type="button" data-mass-gate="${esc(e.eventId)}" data-close="${closed?'0':'1'}" ${(!canEdit||busy)?'disabled':''}>${busy?'Mentés…':(closed?'Jelentkezés megnyitása':'Jelentkezés lezárása')}</button>`;
    return `<div class="mass-training-row ${closed?'waitlist-only':''}"><button class="mass-training-main mass-training-open" type="button" data-mass-detail="${esc(e.eventId)}"><span class="mass-training-dot" style="background:${esc(e.color||'#f7b700')}"></span><div><b>${esc(e.level||'Edzés')}</b><small>${esc(s?fmtDate(s):'–')} · ${esc(s?fmtTime(s):'–')}${en?'–'+esc(fmtTime(en)):''} · ${esc(e.court||'Pálya –')}</small></div></button><div class="mass-training-stat"><b>${num(e.totalActive)}</b><small>jelentkező</small></div><div class="mass-training-stat"><b>${num(e.waitlistCount)}</b><small>várólista</small></div><div class="mass-training-stat"><b>${closed?'–':num(e.free)}</b><small>szabad hely</small></div><div><span class="status-pill ${st.cls}">${st.label}</span></div><div class="mass-training-action">${action}</div></div>`
  }
  function renderMassTrainings(){
    const rows=(state.massTrainings||[]).filter(e=>safeDate(e.startsAt)?.getTime()>=Date.now()-3600000).sort((a,b)=>eventStart(a)-eventStart(b)),canEdit=canAction('mass.trainings','edit'),loadError=text(state.massLoadError);
    $('#viewContent').innerHTML=`<article class="panel legacy-mass-panel"><div class="panel-head"><div><h3>Edzések</h3><p>Régi Manager parity: gradiens színjelzés, külön AKTÍV / INAKTÍV állapot, kompakt adatsűrűség.</p></div><div class="toolbar-actions">${canEdit?'<button class="button primary small" id="massTrainingAdd" type="button">+ Új edzés</button>':''}<button class="button quiet small" id="massTrainingsRefresh" type="button">Frissítés</button></div></div>${loadError?`<div class="migration-note error"><b>A Tömegsport modul nem tölthető be.</b><span>${esc(loadError)}</span></div>`:`<div class="legacy-mass-training-header"><div>Cím / szint</div><div>Időpont</div><div>Pálya</div><div>Létszám</div><div>Státusz</div><div>Művelet</div><div></div></div><div class="legacy-mass-training-list">${rows.map(e=>massLegacyTrainingRow(e)).join('')||emptyInline('Nincs közelgő Tömegsport edzés.')}</div>${canEdit?'':'<div class="migration-note"><b>Megtekintési mód:</b> ehhez a fiókhoz nincs Tömegsport szerkesztési jogosultság.</div>'}`}</article>`;
    $('#massTrainingAdd')?.addEventListener('click',()=>openMassEventEditor_(null));
    $('#massTrainingsRefresh')?.addEventListener('click',async()=>{try{status('Tömegsport edzések frissítése…');await loadMassTrainings();renderMassTrainings();status('Frissítve.','success')}catch(err){state.massLoadError=text(err?.message||'A Tömegsport modul nem tölthető be.');renderMassTrainings();status(state.massLoadError,'error')}});bindMassLegacyRows();
  }


  function massAttendanceModel_(value){
    const raw=text(value).toLocaleUpperCase('hu-HU');
    if(raw==='MEGJELENT')return {key:'present',label:'Megjelent',short:'Jelen',value:-1};
    if(raw==='NEM JELENT MEG')return {key:'noshow',label:'Nem jelent meg',short:'Hiányzott',value:1};
    return {key:'pending',label:'Nincs rögzítve',short:'Nincs rögzítve',value:0};
  }
  function massAttendanceBySliderValue_(value){
    const n=Number(value);
    if(n<=-1)return {key:'present',label:'Megjelent',short:'Jelen',value:-1,db:'MEGJELENT'};
    if(n>=1)return {key:'noshow',label:'Nem jelent meg',short:'Hiányzott',value:1,db:'NEM JELENT MEG'};
    return {key:'pending',label:'Nincs rögzítve',short:'Nincs rögzítve',value:0,db:'NINCS RÖGZÍTVE'};
  }
  function massAttendanceSliderBase_(row){
    const model=massAttendanceModel_(row?.attendance),bookingId=text(row?.bookingId||row?.id),canEdit=canAction('mass.trainings','edit')&&!!bookingId;
    const stateClass=model.key==='present'?'yes':model.key==='noshow'?'no':'none';
    return `<div class="mass-attendance-control is-${esc(model.key)}" data-mass-attendance-control="${esc(bookingId)}">
      <div class="attendance-slider cc-player-training-slider ${stateClass}" data-manager-slider data-manager-slider-kind="mass" data-mass-attendance="${esc(bookingId)}" data-slider-state="${stateClass}" ${canEdit?'':'data-slider-disabled="1"'} aria-label="${esc(row?.name||'Sportoló')} jelenléte: ${esc(model.label)}">
        <button class="slider-zone left" type="button" data-slider-action="yes" ${canEdit?'':'disabled'}>Megjelent</button>
        <button class="slider-zone center" type="button" data-slider-action="none" ${canEdit?'':'disabled'}>Nincs rögzítve</button>
        <button class="slider-zone right" type="button" data-slider-action="no" ${canEdit?'':'disabled'}>Nem jelent meg</button>
        <span class="slider-thumb"></span>
      </div>
      <small class="mass-attendance-save-state" data-mass-attendance-state>${canEdit?'Húzd vagy koppints · elengedéskor ment.':'Csak megtekintés · nincs szerkesztési jogosultság.'}</small>
    </div>`;
  }
  function syncMassAttendancePreview_(input,value,message=''){
    if(!input)return;
    const model=massAttendanceBySliderValue_(value),control=input.closest('.mass-attendance-control'),card=input.closest('.mass-attendance-card');
    if(control){
      control.classList.remove('is-present','is-noshow','is-pending');control.classList.add(`is-${model.key}`);
      const center=control.querySelector('[data-mass-attendance-center]');if(center)center.textContent=model.short;
      const stateEl=control.querySelector('[data-mass-attendance-state]');if(stateEl&&message)stateEl.textContent=message;
    }
    if(card){
      card.dataset.attendanceKey=model.key;
      const badge=card.querySelector('.mass-attendance-state-badge');
      if(badge){badge.classList.remove('is-present','is-noshow','is-pending');badge.classList.add(`is-${model.key}`);badge.textContent=model.label;}
    }
  }
  function refreshMassAttendanceSummary_(){
    const cards=$$('.mass-attendance-card'),counts={present:0,pending:0,noshow:0};
    cards.forEach(card=>{const key=text(card.dataset.attendanceKey)||'pending';if(Object.prototype.hasOwnProperty.call(counts,key))counts[key]++});
    const total=$('[data-mass-attendance-count="total"]'),present=$('[data-mass-attendance-count="present"]'),pending=$('[data-mass-attendance-count="pending"]'),noshow=$('[data-mass-attendance-count="noshow"]');
    if(total)total.textContent=String(cards.length);if(present)present.textContent=String(counts.present);if(pending)pending.textContent=String(counts.pending);if(noshow)noshow.textContent=String(counts.noshow);
  }
  function updateMassAttendanceCache_(eventId,bookingId,result){
    const detail=state.massDetailCache.get(text(eventId));if(!detail||!Array.isArray(detail.bookings))return;
    const row=detail.bookings.find(x=>text(x.bookingId||x.id)===text(bookingId));if(!row)return;
    row.attendance=text(result?.attendance)||row.attendance;
    if(result?.bookingStatus)row.bookingStatus=result.bookingStatus;
  }
  async function saveMassAttendance_(eventId,input){
    if(!input||!canAction('mass.trainings','edit'))return;
    const bookingId=text(input.dataset.massAttendance),oldValue=Number(input.dataset.attendanceCurrent||0),nextValue=Number(input.value);
    if(!bookingId||![-1,0,1].includes(nextValue)){input.value=String(oldValue);syncMassAttendancePreview_(input,oldValue,'Érvénytelen állapot.');return}
    if(nextValue===oldValue){syncMassAttendancePreview_(input,nextValue,'Nincs változás.');return}
    if(state.massAttendanceBusy.has(bookingId)){input.value=String(oldValue);syncMassAttendancePreview_(input,oldValue,'Mentés folyamatban…');return}
    const model=massAttendanceBySliderValue_(nextValue),control=input.closest('.mass-attendance-control'),stateEl=control?.querySelector('[data-mass-attendance-state]');
    state.massAttendanceBusy.add(bookingId);input.disabled=true;control?.classList.add('is-saving');if(stateEl)stateEl.textContent='Mentés…';
    try{
      const result=await rpc('cc_manager_mass_attendance_v1',{p_booking_id:bookingId,p_attendance:model.db});
      const saved=massAttendanceModel_(result?.attendance||model.db);input.value=String(saved.value);input.dataset.attendanceCurrent=String(saved.value);
      syncMassAttendancePreview_(input,saved.value,'Mentve.');updateMassAttendanceCache_(eventId,bookingId,result||{});refreshMassAttendanceSummary_();
      status(`${text(input.closest('.mass-attendance-card')?.querySelector('.mass-attendance-person-copy b')?.textContent)||'Sportoló'} · ${saved.label}`,'success');
    }catch(err){
      input.value=String(oldValue);syncMassAttendancePreview_(input,oldValue,'A mentés sikertelen · az előző állapot visszaállítva.');
      status(err?.message||'A jelenlét mentése sikertelen.','error');
    }finally{
      state.massAttendanceBusy.delete(bookingId);input.disabled=!canAction('mass.trainings','edit');control?.classList.remove('is-saving');
    }
  }
  function bindStickyAttendanceDetent_(input){
    if(!input||input.dataset.stickyDetentBound==='1')return;
    input.dataset.stickyDetentBound='1';
    let startX=0,released=false,activePointer=null;
    const clear=()=>{input.classList.remove('cc-detent-hold','cc-detent-stretch-left','cc-detent-stretch-right','cc-detent-release');released=false;activePointer=null};
    input.addEventListener('pointerdown',e=>{
      if(input.disabled)return;
      startX=e.clientX;released=false;activePointer=e.pointerId;input.classList.add('cc-detent-hold');
    },{passive:true});
    input.addEventListener('pointermove',e=>{
      if(activePointer!==e.pointerId||released||input.disabled)return;
      const dx=e.clientX-startX,abs=Math.abs(dx);
      if(abs<2)return;
      input.classList.toggle('cc-detent-stretch-right',dx>0);input.classList.toggle('cc-detent-stretch-left',dx<0);
      if(abs>=12){released=true;input.classList.remove('cc-detent-hold','cc-detent-stretch-left','cc-detent-stretch-right');input.classList.add('cc-detent-release');setTimeout(()=>input.classList.remove('cc-detent-release'),130)}
    },{passive:true});
    ['pointerup','pointercancel','lostpointercapture'].forEach(type=>input.addEventListener(type,clear,{passive:true}));
  }
  function bindMassAttendanceSliders_(eventId){
    $$('[data-manager-slider-kind="mass"]').forEach(slider=>{
      ccBindPlayerStyleSlider_(slider,{onCommit:async state=>{
        const bookingId=text(slider.dataset.massAttendance);if(!bookingId||!canAction('mass.trainings','edit'))return;
        const model=state==='yes'?massAttendanceBySliderValue_(-1):state==='no'?massAttendanceBySliderValue_(1):massAttendanceBySliderValue_(0);
        const control=slider.closest('.mass-attendance-control'),stateEl=control?.querySelector('[data-mass-attendance-state]');
        if(state.massAttendanceBusy.has(bookingId))return;
        state.massAttendanceBusy.add(bookingId);slider.dataset.sliderDisabled='1';control?.classList.add('is-saving');if(stateEl)stateEl.textContent='Mentés…';
        try{
          const result=await rpc('cc_manager_mass_attendance_v1',{p_booking_id:bookingId,p_attendance:model.db});
          const saved=massAttendanceModel_(result?.attendance||model.db),savedState=saved.key==='present'?'yes':saved.key==='noshow'?'no':'none';
          ccSetPlayerStyleSliderState_(slider,savedState);
          ccSyncMassAttendanceCardState_(slider,saved);updateMassAttendanceCache_(eventId,bookingId,result||{});refreshMassAttendanceSummary_();
          if(stateEl)stateEl.textContent='Mentve.';status(`${text(slider.closest('.mass-attendance-card')?.querySelector('.mass-attendance-person-copy b')?.textContent)||'Sportoló'} · ${saved.label}`,'success');
        }catch(err){
          const previous=text(slider.dataset.sliderPrevious)||text(slider.dataset.sliderState)||'none';ccSetPlayerStyleSliderState_(slider,previous);
          if(stateEl)stateEl.textContent='A mentés sikertelen · az előző állapot visszaállítva.';status(err?.message||'A jelenlét mentése sikertelen.','error');
        }finally{state.massAttendanceBusy.delete(bookingId);delete slider.dataset.sliderDisabled;control?.classList.remove('is-saving')}
      }});
    });
  }
  function massPersonSort_(a,b){
    return text(a?.name||a?.email).localeCompare(text(b?.name||b?.email),'hu-HU',{sensitivity:'base',numeric:true});
  }
  function massBookingCard_(r,eventLevel=''){
    const attendance=text(r.attendance)||'NINCS RÖGZÍTVE',sub=safeDate(r.submittedAt),level=text(r.athleteLevel||r.extraLevel||eventLevel||''),color=massLevelColor({level:level||eventLevel||'Edzés'}),attendanceModel=massAttendanceModel_(attendance);
    const bookingStatus=text(r.bookingStatus||r.status)||'AKTÍV',passStatus=text(r.passStatus||''),bookingId=esc(r.bookingId||r.id||'');
    return `<article class="mass-attendance-card legacy-mass-roster-card is-collapsed" data-booking-id="${bookingId}" data-attendance-key="${esc(attendanceModel.key)}" style="--mass-person-color:${esc(color)};--mass-person-rgb:${esc(hexRgb(color))}">
      <button class="mass-person-toggle" type="button" data-mass-person-toggle aria-expanded="false"><span class="triangle-icon"></span><span class="mass-attendance-person-copy"><b>${esc(r.name||'Névtelen')}</b><small>${esc(level||'Sportoló')}</small></span></button>
      <span class="mass-booking-coming">Jön</span>
      ${massAttendanceSliderBase_(r)}
      <div class="mass-person-details" data-mass-person-details hidden>
        <div class="legacy-mass-roster-meta"><span><small>Email</small><b>${esc(r.email||'–')}</b></span><span><small>Bérlet</small><b>${esc(r.passNumber||'–')}</b></span><span><small>Jelentkezés</small><b>${sub?esc(fmtDate(sub)+' '+fmtTime(sub)):'–'}</b></span><span><small>Állapot</small><b>${esc(bookingStatus)}</b></span></div>
        <div class="legacy-mass-roster-badges">${passStatus?`<span class="legacy-mass-badge">${esc(passStatus)}</span>`:''}${level?`<span class="legacy-mass-badge soft">${esc(level)}</span>`:''}</div>
        ${r.note?`<div class="mass-attendance-note"><b>Megjegyzés:</b> ${esc(r.note)}</div>`:''}
      </div>
    </article>`;
  }
  function massWaitlistCard_(r){
    const sub=safeDate(r.submittedAt),statusValue=text(r.status||r.waitlistStatus)||'VÁRAKOZIK';
    return `<article class="mass-wait-card">
      <div><b>${esc(r.name||'Névtelen')}</b><small>${esc(r.email||'–')}</small></div>
      <span><small>Bérlet</small><b>${esc(r.passNumber||'–')}</b><i>${esc(r.passStatus||'')}</i></span>
      <span><small>Állapot</small><b>${esc(statusValue)}</b><i>${sub?esc(fmtDate(sub)+' '+fmtTime(sub)):''}</i></span>
    </article>`;
  }
  function massEventPayloadFromForm_(existing={}){const date=$('#meDate')?.value,start=ccNormalizeTime24_($('#meStart')?.value),end=ccNormalizeTime24_($('#meEnd')?.value),session=text($('#meSession')?.value||existing.sessionType||'TÖMEGSPORT').toUpperCase();if(!date||!start||!end)throw new Error('A dátum, kezdés és befejezés kötelező; az idő HH:MM formátumú legyen.');if(end<=start)throw new Error('A befejezésnek később kell lennie a kezdésnél.');return {eventDate:date,startTime:start,endTime:end,level:text($('#meLevel')?.value),court:text($('#meCourt')?.value),capacity:Number($('#meCapacity')?.value||0),cancellationHours:Number($('#meCancelHours')?.value||0),active:$('#meActive')?.checked!==false,oldLimit:0,newLimit:Number($('#meCapacity')?.value||0),publicRegistrationActive:session!=='VERSENYSPORT',sessionType:session,teamId:'',visibility:'PUBLIC',seriesId:text(existing.seriesId||''),recurrenceRule:'',seriesEnd:null,exceptionType:'',eventType:'EDZÉS',color:text($('#meColor')?.value||existing.color||'#f7b700')}}
  async function openMassEventEditor_(eventId=null){if(!canAction('mass.trainings','edit')){status('Nincs Tömegsport szerkesztési jogosultságod.','error');return}let data=null,e={};if(eventId){data=await loadMassEventDetail(eventId,{force:true});e=data?.event||{}}const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='TÖMEGSPORT · EDZÉS · SZERKESZTÉS';title.textContent=eventId?'Edzés szerkesztése':'Új Tömegsport edzés';const st=safeDate(e.startsAt)||new Date(),en=safeDate(e.endsAt)||new Date(st.getTime()+90*60000);body.innerHTML=`<form id="massEventForm" class="action-form"><div class="action-form-grid"><label class="field"><span>Dátum</span><input id="meDate" type="date" value="${esc(ccDateInputValue_(st))}" required></label><label class="field"><span>Kezdés</span><input id="meStart" type="text" inputmode="numeric" autocomplete="off" placeholder="HH:MM" pattern="(?:[01]\d|2[0-3]):[0-5]\d" maxlength="5" value="${esc(ccTimeInputValue_(st))}" required></label><label class="field"><span>Befejezés</span><input id="meEnd" type="text" inputmode="numeric" autocomplete="off" placeholder="HH:MM" pattern="(?:[01]\d|2[0-3]):[0-5]\d" maxlength="5" value="${esc(ccTimeInputValue_(en))}" required></label><label class="field"><span>Szint</span><select id="meLevel"><option value="KEZDŐ" ${text(e.level).toUpperCase()==='KEZDŐ'?'selected':''}>Kezdő</option><option value="KÖZÉPHALADÓ" ${text(e.level).toUpperCase()==='KÖZÉPHALADÓ'?'selected':''}>Középhaladó</option><option value="HALADÓ" ${text(e.level).toUpperCase()==='HALADÓ'?'selected':''}>Haladó</option></select></label><label class="field"><span>Pálya</span><input id="meCourt" value="${esc(e.court||'')}"></label><label class="field"><span>Férőhely</span><input id="meCapacity" type="number" min="1" max="40" value="${esc(e.capacity||e.totalLimit||18)}"></label><label class="field"><span>Lemondási határ (óra)</span><input id="meCancelHours" type="number" min="0" max="72" step="0.5" value="${esc(e.cancellationHours??6)}"></label><label class="field"><span>Típus</span><select id="meSession"><option value="TÖMEGSPORT" ${text(e.sessionType).toUpperCase()!=='SPORT7'?'selected':''}>Tömegsport</option><option value="SPORT7" ${text(e.sessionType).toUpperCase()==='SPORT7'?'selected':''}>SPORT7</option></select></label><label class="field"><span>Szín</span><input id="meColor" type="color" value="${esc(e.color||massLevelColor(e)||'#f7b700')}"></label></div><label class="action-checkbox"><input id="meActive" type="checkbox" ${e.active===false?'':'checked'}> <span>Aktív edzés</span></label>${!eventId?`<div class="action-form-repeat"><label><input id="meRepeat" type="checkbox"> Hetente ismétlődjön</label><label class="field compact"><span>Ismétlés vége</span><input id="meRepeatEnd" type="date" disabled></label></div>`:''}<div class="dialog-action-row"><button type="button" class="button quiet" id="meCancel">Mégse</button>${eventId?'<button type="button" class="button danger" id="meDelete">Törlés</button>':''}<button type="submit" class="button primary" id="meSave">Mentés</button></div></form>`;ccOpenDialogStable_(d);$('#meCancel')?.addEventListener('click',ccCloseEntityDialog_);$('#meRepeat')?.addEventListener('change',ev=>{if($('#meRepeatEnd'))$('#meRepeatEnd').disabled=!ev.target.checked});$('#massEventForm')?.addEventListener('submit',async ev=>{ev.preventDefault();const btn=$('#meSave');if(btn)btn.disabled=true;try{const base=massEventPayloadFromForm_(e);if(eventId){await rpc('cc_manager_mass_event_save_v1',{p_event_id:eventId,p_payload:base});await rpc('cc_manager_mass_event_set_active_v1',{p_event_id:eventId,p_active:base.active})}else{const repeat=$('#meRepeat')?.checked===true,endDate=text($('#meRepeatEnd')?.value),dates=[base.eventDate],series=repeat&&window.crypto?.randomUUID?window.crypto.randomUUID():'';if(repeat){if(!endDate||endDate<base.eventDate)throw new Error('Adj meg érvényes ismétlési végdátumot.');let cur=new Date(`${base.eventDate}T12:00:00`),last=new Date(`${endDate}T12:00:00`);while(dates.length<26){cur=new Date(cur);cur.setDate(cur.getDate()+7);if(cur>last)break;dates.push(localDateKey(cur))}}const payloads=dates.map(day=>({...base,eventDate:day,seriesId:series,recurrenceRule:repeat?'WEEKLY':'',seriesEnd:repeat?endDate:null}));if(repeat)await rpc('cc_manager_mass_event_series_create_v1',{p_payloads:payloads});else await rpc('cc_manager_mass_event_save_v1',{p_event_id:null,p_payload:payloads[0]})}state.massDetailCache.clear();await Promise.all([loadMassTrainings(),loadMassCalendar(),loadMassArchive()]);ccCloseEntityDialog_();renderMassTrainings();status('Tömegsport edzés mentve.','success')}catch(err){console.error(err);status(err.message||'Az edzés mentése sikertelen.','error');if(btn)btn.disabled=false}});$('#meDelete')?.addEventListener('click',async()=>{if(!eventId||!window.confirm('Biztosan törlöd ezt az edzést? Csak olyan jövőbeli edzés törölhető, amelynek nincs jelentkezési/várólista előzménye.'))return;try{await rpc('cc_manager_mass_event_delete_v1',{p_event_id:eventId});state.massDetailCache.clear();await Promise.all([loadMassTrainings(),loadMassCalendar()]);ccCloseEntityDialog_();renderMassTrainings();status('Edzés törölve.','success')}catch(err){status(err.message||'Az edzés nem törölhető.','error')}})}
  function openMassAddAthlete_(eventId){const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='TÖMEGSPORT · SPORTOLÓ HOZZÁADÁSA';title.textContent='Sportoló hozzáadása';body.innerHTML=`<form id="massAddAthleteForm" class="action-form"><div class="action-form-grid"><label class="field"><span>Név</span><input id="maName" required maxlength="100"></label><label class="field"><span>Email</span><input id="maEmail" type="email"></label><label class="field"><span>Típus</span><select id="maType"><option value="NORMAL">Normál</option><option value="FIRST">Első edzés</option><option value="GUEST">Vendég</option></select></label><label class="field"><span>Bérletszám</span><input id="maPass"></label><label class="field span-2"><span>Admin megjegyzés</span><input id="maNote" maxlength="1000"></label></div><label class="action-checkbox"><input id="maPresent" type="checkbox"> <span>Megjelentként rögzítés</span></label><div class="dialog-action-row"><button type="button" class="button quiet" id="maCancel">Mégse</button><button type="submit" class="button primary" id="maSave">Hozzáadás</button></div></form>`;ccOpenDialogStable_(d);$('#maCancel')?.addEventListener('click',ccCloseEntityDialog_);$('#massAddAthleteForm')?.addEventListener('submit',async ev=>{ev.preventDefault();const btn=$('#maSave');if(btn)btn.disabled=true;try{await rpc('cc_manager_mass_booking_add_v1',{p_event_id:eventId,p_payload:{name:text($('#maName').value),email:text($('#maEmail').value),personType:$('#maType').value,passNumber:text($('#maPass').value),note:text($('#maNote').value),present:$('#maPresent').checked,capacityBucket:'ADMIN'}});state.massDetailCache.delete(eventId);ccCloseEntityDialog_();await openMassEventDetail(eventId);status('Sportoló hozzáadva.','success')}catch(err){status(err.message||'A sportoló hozzáadása sikertelen.','error');if(btn)btn.disabled=false}})}
  async function massBookingPatch_(eventId,bookingId,patch){try{await rpc('cc_manager_mass_booking_patch_v1',{p_booking_id:bookingId,p_patch:patch});state.massDetailCache.delete(eventId);await openMassEventDetail(eventId);status('Jelentkezés frissítve.','success')}catch(err){status(err.message||'A módosítás sikertelen.','error')}}
  async function massBookingRemove_(eventId,bookingId){if(!window.confirm('Biztosan kiveszed a sportolót erről az edzésről?'))return;try{await rpc('cc_manager_mass_booking_remove_v1',{p_booking_id:bookingId});state.massDetailCache.delete(eventId);await openMassEventDetail(eventId);status('Sportoló kivéve az edzésről.','success')}catch(err){status(err.message||'A sportoló kivétele sikertelen.','error')}}
  function bindMassPersonDisclosure_(root){
    if(!root)return;const toggles=Array.from(root.querySelectorAll('[data-mass-person-toggle]')),all=root.querySelector('#massToggleAllPeople');
    const setOne=(btn,open)=>{const card=btn.closest('.mass-attendance-card'),details=card?.querySelector('[data-mass-person-details]');if(!card||!details)return;details.hidden=!open;card.classList.toggle('is-collapsed',!open);btn.setAttribute('aria-expanded',String(open));btn.classList.toggle('open',open)};
    toggles.forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setOne(btn,btn.getAttribute('aria-expanded')!=='true');if(all){const allOpen=toggles.length&&toggles.every(x=>x.getAttribute('aria-expanded')==='true');all.textContent=allOpen?'Mind becsuk':'Mind kinyit'}}));
    all?.addEventListener('click',()=>{const open=!toggles.every(x=>x.getAttribute('aria-expanded')==='true');toggles.forEach(x=>setOne(x,open));all.textContent=open?'Mind becsuk':'Mind kinyit'});
  }
  async function openMassEventDetail(eventId){
    const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');if(!d||!body||!title)return;
    if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='TÖMEGSPORT · EDZÉS';
    title.textContent='Tömegsport edzés';body.innerHTML='<div class="loading-inline">Edzés betöltése…</div>';ccOpenDialogStable_(d);
    try{
      const data=await loadMassEventDetail(eventId,{force:true}),e=data?.event||{},editable=canAction('mass.trainings','edit');
      const bookings=(Array.isArray(data?.bookings)?data.bookings:[]).slice().sort(massPersonSort_);
      const wait=(Array.isArray(data?.waitlist)?data.waitlist:[]).slice().sort(massPersonSort_);
      const present=bookings.filter(r=>massAttendanceModel_(r.attendance).key==='present').length,noshow=bookings.filter(r=>massAttendanceModel_(r.attendance).key==='noshow').length,pending=Math.max(0,bookings.length-present-noshow);
      title.textContent=e.level||'Edzés';
      body.innerHTML=`<div class="entity-hero event-entity-hero"><span class="event-detail-mark" style="background:${esc(e.color||'#f7b700')}"></span><div><b>${esc(e.level||'Edzés')}</b><span>${esc(fmtDate(e.startsAt))} · ${esc(fmtTime(e.startsAt))} · ${esc(e.court||'Pálya –')}</span></div>${editable?'<div class="entity-hero-actions"><button class="button quiet small" id="massEventEditBtn" type="button">Edzés szerkesztése</button><button class="button primary small" id="massAddAthleteBtn" type="button">+ Sportoló</button></div>':''}</div>
        <div class="attendance-detail mass-attendance-summary"><div><small>Jelentkező</small><b data-mass-attendance-count="total">${bookings.length}</b><span>fő</span></div><div><small>Megjelent</small><b data-mass-attendance-count="present">${present}</b><span>fő</span></div><div><small>Nincs rögzítve</small><b data-mass-attendance-count="pending">${pending}</b><span>fő</span></div><div><small>Nem jelent meg</small><b data-mass-attendance-count="noshow">${noshow}</b><span>fő</span></div></div>
        <div class="panel-subhead mass-attendance-heading"><div><h4>Jelenlét</h4><p>Alapból név + érkezés + jelenléti csúszka; a részletek külön lenyithatók.</p></div><button class="button quiet tiny" id="massToggleAllPeople" type="button">Mind kinyit</button></div>
        <div class="mass-attendance-card-list">${bookings.map(r=>{const base=massBookingCard_(r,e.level);if(!editable)return base;return base.replace('</article>',`<div class="mass-booking-admin-actions"><select data-mass-pass-status="${esc(r.bookingId||r.id)}"><option value="">Bérlet…</option><option value="ÉRVÉNYES">Érvényes</option><option value="ÉRVÉNYTELEN">Érvénytelen</option></select><button class="button quiet tiny" data-mass-note="${esc(r.bookingId||r.id)}" data-current-note="${esc(r.note||'')}">Megjegyzés</button><button class="button danger tiny" data-mass-remove="${esc(r.bookingId||r.id)}">Kivétel</button></div></article>`) }).join('')||emptyInline('Nincs aktív jelentkező.')}</div>
        <div class="panel-subhead"><div><h4>Várólista</h4><p>Várakozó és felajánlott helyek, külön a jelenléti névsortól.</p></div></div><div class="mass-wait-card-list">${wait.map(massWaitlistCard_).join('')||emptyInline('A várólista üres.')}</div>`;
      bindMassAttendanceSliders_(eventId);bindMassPersonDisclosure_(body);$('#massEventEditBtn')?.addEventListener('click',()=>openMassEventEditor_(eventId));$('#massAddAthleteBtn')?.addEventListener('click',()=>openMassAddAthlete_(eventId));Array.from(body.querySelectorAll('[data-mass-pass-status]')).forEach(x=>x.addEventListener('change',()=>{if(x.value)massBookingPatch_(eventId,x.dataset.massPassStatus,{passStatus:x.value})}));Array.from(body.querySelectorAll('[data-mass-note]')).forEach(x=>x.addEventListener('click',()=>{const note=window.prompt('Admin megjegyzés:',x.dataset.currentNote||'');if(note!==null)massBookingPatch_(eventId,x.dataset.massNote,{note})}));Array.from(body.querySelectorAll('[data-mass-remove]')).forEach(x=>x.addEventListener('click',()=>massBookingRemove_(eventId,x.dataset.massRemove)));
    }catch(err){console.error(err);body.innerHTML=`<div class="migration-note error"><b>A részletes Tömegsport nézet nem tölthető be.</b><span>${esc(err.message||'Betöltési hiba')}</span></div>`}
  }

  async function toggleMassRegistrationGate(eventId,closeToWaitlist){
    if(!canAction('mass.trainings','edit')||state.massActionBusy)return;
    const e=(state.massTrainings||[]).find(x=>text(x.eventId)===text(eventId));if(!e)return;
    const label=`${e.level||'Edzés'} · ${fmtDate(e.startsAt)} ${fmtTime(e.startsAt)}`;
    const question=closeToWaitlist?`${label}\n\nLezárod a közvetlen jelentkezést?\n\nA meglévő jelentkezések megmaradnak. Új sportoló csak várólistára kerülhet, és a várólista automatikus előreléptetése szünetel.`:`${label}\n\nÚjra megnyitod a közvetlen jelentkezést?\n\nA meglévő kapacitás ismét közvetlen jelentkezésre használható, és az új jelentkezők közvetlenül bekerülhetnek.`;
    if(!window.confirm(question))return;
    state.massActionBusy=text(eventId);renderMassTrainings();
    try{status(closeToWaitlist?'Jelentkezés lezárása…':'Jelentkezés megnyitása…');await rpc('cc_manager_mass_registration_gate_v1',{p_event_id:eventId,p_waitlist_only:closeToWaitlist});await loadMassTrainings();status(closeToWaitlist?'Jelentkezés lezárva: csak várólista.':'Jelentkezés újra megnyitva.','success')}
    catch(err){console.error(err);status(err.message||'A jelentkezési állapot módosítása sikertelen.','error')}
    finally{state.massActionBusy='';renderMassTrainings()}
  }

  function massAthleteRows_(){
    const q=text(state.massAthleteSearch).toLocaleLowerCase('hu-HU'),level=text(state.massAthleteLevel),statusValue=text(state.massAthleteStatus);
    return (state.massAthletes||[]).filter(a=>{
      if(level&&text(a.effectiveLevel||a.levelOverride||a.level)!==level)return false;
      if(statusValue&&text(a.status)!==statusValue)return false;
      if(q&&!`${a.name||''} ${a.email||''} ${a.currentPassNumber||''} ${a.effectiveLevel||''}`.toLocaleLowerCase('hu-HU').includes(q))return false;
      return true;
    }).slice().sort(comparePlayersBySurname_)
  }
  function massAthleteFilterOptions_(key){return Array.from(new Set((state.massAthletes||[]).map(a=>text(a[key])).filter(Boolean))).sort((a,b)=>HU_NAME_COLLATOR.compare(a,b))}
  function massAthleteRow_(a){const color=massLevelColor({level:a.effectiveLevel||a.levelOverride||a.level}),pass=a.currentPassNumber?`${a.currentPassNumber}${a.currentPassMonth?' · '+a.currentPassMonth:''}`:'Nincs aktuális bérlet';return `<button class="mass-athlete-row unified-person-card" type="button" data-mass-athlete-open="${esc(a.athleteId)}" style="--mass-athlete-color:${esc(color)};--player-team-color:${esc(color)}"><span class="person-primary"><span class="cc-avatar table monogram">${esc(initials(a.name||''))}</span><span><b>${esc(a.name||'Névtelen')}</b><small>${esc(a.email||'–')}</small></span></span><span><b>${esc(a.effectiveLevel||a.levelOverride||a.level||'–')}</b><small>${a.levelOverride?'Edzői felülírás':'Alapszint'} · ${esc(a.status||'–')}</small></span><span><b>${esc(pass)}</b><small>${num(a.totalBookings)} edzés · ${num(a.attendanceRecorded)} jelenlét rögzítve</small></span><i class="person-chevron">›</i></button>`}
  function renderMassAthletes(){
    state.massAthleteFiltersOpen=filterOpen_('mass.athletes',state.massAthleteFiltersOpen);const rows=massAthleteRows_(),levels=massAthleteFilterOptions_('effectiveLevel'),statuses=massAthleteFilterOptions_('status'),active=!!state.massAthleteSearch||!!state.massAthleteLevel||!!state.massAthleteStatus;
    $('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Sportolók</h2><p>Tömegsport sportolói adatbázis, a Játékosok nézettel egységes vizuális nyelven.</p></div><div class="filter-head-actions"><button class="matrix-filter-toggle ${state.massAthleteFiltersOpen?'open':''} ${active?'has-filter':''}" id="massAthleteFiltersToggle" aria-expanded="${state.massAthleteFiltersOpen?'true':'false'}" type="button"><span class="triangle-icon"></span>Szűrők</button>${active?'<button class="filter-reset" id="massAthleteReset" type="button">Szűrők törlése</button>':''}<button class="button quiet small" id="massAthletesRefresh" type="button">Frissítés</button></div></div><div class="filter-panel mass-directory-toolbar" id="massAthleteFiltersPanel" ${state.massAthleteFiltersOpen?'':'hidden'}><input id="massAthleteSearch" type="search" value="${esc(state.massAthleteSearch)}" placeholder="Keresés név, email, bérletszám vagy szint alapján…"><select id="massAthleteLevel"><option value="">Minden szint</option>${levels.map(x=>`<option value="${esc(x)}" ${x===state.massAthleteLevel?'selected':''}>${esc(x)}</option>`).join('')}</select><select id="massAthleteStatus"><option value="">Minden állapot</option>${statuses.map(x=>`<option value="${esc(x)}" ${x===state.massAthleteStatus?'selected':''}>${esc(x)}</option>`).join('')}</select></div><article class="panel mass-directory-panel"><div class="mass-athlete-list">${rows.map(massAthleteRow_).join('')||emptyInline('Nincs a szűrésnek megfelelő sportoló.')}</div></article>`;
    const toggle=$('#massAthleteFiltersToggle'),panel=$('#massAthleteFiltersPanel');toggle?.addEventListener('click',()=>{const open=setFilterOpen_('mass.athletes',!state.massAthleteFiltersOpen);state.massAthleteFiltersOpen=open;toggle.setAttribute('aria-expanded',String(open));toggle.classList.toggle('open',open);if(panel)panel.hidden=!open;ccBlurPointerControl_(toggle)});
    $('#massAthleteSearch')?.addEventListener('input',e=>{state.massAthleteSearch=e.target.value;renderMassAthletes()});$('#massAthleteLevel')?.addEventListener('change',e=>{state.massAthleteLevel=e.target.value;afterNativePicker(e.target,renderMassAthletes)});$('#massAthleteStatus')?.addEventListener('change',e=>{state.massAthleteStatus=e.target.value;afterNativePicker(e.target,renderMassAthletes)});$('#massAthleteReset')?.addEventListener('click',()=>{state.massAthleteSearch='';state.massAthleteLevel='';state.massAthleteStatus='';renderMassAthletes()});$('#massAthletesRefresh')?.addEventListener('click',async()=>{try{status('Sportolók frissítése…');await loadMassAthletes();renderMassAthletes();status('Sportolók frissítve.','success')}catch(err){status(err.message||'A Sportolók betöltése sikertelen.','error')}});$$('[data-mass-athlete-open]').forEach(b=>b.addEventListener('click',()=>openMassAthleteDetail_(b.dataset.massAthleteOpen)))}

  function openMassAthleteDetail_(id){const a=(state.massAthletes||[]).find(x=>text(x.athleteId)===text(id));if(!a)return;const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='TÖMEGSPORT · SPORTOLÓ';title.textContent=a.name||'Sportoló';body.innerHTML=`<div class="entity-hero"><div><b>${esc(a.name||'–')}</b><span>${esc(a.email||'–')}</span></div></div><div class="detail-grid">${detailPair('Aktuális szint',a.effectiveLevel||a.levelOverride||a.level||'–')}${detailPair('Alapszint',a.level||'–')}${detailPair('Edzői felülírás',a.levelOverride||'–')}${detailPair('Állapot',a.status||'–')}${detailPair('Első edzés',a.firstTrainingDate?fmtDate(a.firstTrainingDate):'–')}${detailPair('Összes jelentkezés',num(a.totalBookings))}${detailPair('Rögzített jelenlét',num(a.attendanceRecorded))}${detailPair('Aktuális bérlet',a.currentPassNumber||'–')}${detailPair('Bérlet hónap',a.currentPassMonth||'–')}${detailPair('Bérlet típusa',a.currentPassProduct||'–')}</div>${a.note?`<div class="migration-note"><b>Megjegyzés</b><span>${esc(a.note)}</span></div>`:''}`;ccOpenDialogStable_(d)}
  function massPassRows_(){const q=text(state.massPassSearch).toLocaleLowerCase('hu-HU'),month=text(state.massPassMonth);return (state.massPasses||[]).filter(p=>(!month||text(p.validMonth)===month)&&(!q||`${p.passNumber||''} ${p.email||''} ${p.product||''} ${p.passGroup||''} ${p.athleteName||''}`.toLocaleLowerCase('hu-HU').includes(q))).slice().sort((a,b)=>(safeDate(b.purchaseDate)?.getTime()||0)-(safeDate(a.purchaseDate)?.getTime()||0)||HU_NAME_COLLATOR.compare(text(a.email),text(b.email)))}
  function renderMassPasses(){state.massPassFiltersOpen=filterOpen_('mass.passes',state.massPassFiltersOpen);const rows=massPassRows_(),months=Array.from(new Set((state.massPasses||[]).map(p=>text(p.validMonth)).filter(Boolean))).sort().reverse(),active=!!state.massPassSearch||!!state.massPassMonth;$('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Bérletek</h2><p>Canonical BEAC bérletadatok a Supabase-ból. Ez a nézet nem módosít bérletet.</p></div><div class="filter-head-actions"><button class="matrix-filter-toggle ${state.massPassFiltersOpen?'open':''} ${active?'has-filter':''}" id="massPassFiltersToggle" aria-expanded="${state.massPassFiltersOpen?'true':'false'}" type="button"><span class="triangle-icon"></span>Szűrők</button>${active?'<button class="filter-reset" id="massPassReset" type="button">Szűrők törlése</button>':''}<button class="button quiet small" id="massPassesRefresh" type="button">Frissítés</button></div></div><div class="filter-panel mass-directory-toolbar passes" id="massPassFiltersPanel" ${state.massPassFiltersOpen?'':'hidden'}><input id="massPassSearch" type="search" value="${esc(state.massPassSearch)}" placeholder="Keresés név, email, bérletszám vagy termék alapján…"><select id="massPassMonth"><option value="">Minden hónap</option>${months.map(x=>`<option value="${esc(x)}" ${x===state.massPassMonth?'selected':''}>${esc(x)}</option>`).join('')}</select></div><article class="panel mass-directory-panel"><div class="mass-pass-header"><div>Bérlet</div><div>Sportoló</div><div>Termék</div><div>Érvényes hónap</div><div>Vásárlás</div></div><div class="mass-pass-list">${rows.map(p=>`<div class="mass-pass-row"><span><b>${esc(p.passNumber||'–')}</b><small>${esc(p.passGroup||'')}</small></span><span><b>${esc(p.athleteName||p.email||'–')}</b><small>${esc(p.email||'')}</small></span><span><b>${esc(p.product||'–')}</b><small>${esc(p.season||'')}</small></span><span><b>${esc(p.validMonth||'–')}</b><small>${p.currentMonth?'AKTUÁLIS HÓNAP':''}</small></span><span><b>${p.purchaseDate?esc(fmtDate(p.purchaseDate)):'–'}</b><small>${p.importedAt?`Import: ${esc(fmtDate(p.importedAt))}`:''}</small></span></div>`).join('')||emptyInline('Nincs a szűrésnek megfelelő bérlet.')}</div></article>`;const toggle=$('#massPassFiltersToggle'),panel=$('#massPassFiltersPanel');toggle?.addEventListener('click',()=>{const open=setFilterOpen_('mass.passes',!state.massPassFiltersOpen);state.massPassFiltersOpen=open;toggle.setAttribute('aria-expanded',String(open));toggle.classList.toggle('open',open);if(panel)panel.hidden=!open;ccBlurPointerControl_(toggle)});$('#massPassSearch')?.addEventListener('input',e=>{state.massPassSearch=e.target.value;renderMassPasses()});$('#massPassMonth')?.addEventListener('change',e=>{state.massPassMonth=e.target.value;afterNativePicker(e.target,renderMassPasses)});$('#massPassReset')?.addEventListener('click',()=>{state.massPassSearch='';state.massPassMonth='';renderMassPasses()});$('#massPassesRefresh')?.addEventListener('click',async()=>{try{status('Bérletek frissítése…');await loadMassPasses();renderMassPasses();status('Bérletek frissítve.','success')}catch(err){status(err.message||'A Bérletek betöltése sikertelen.','error')}})}

  function renderMassArchive(){
    const rows=(state.massArchiveEvents||[]).slice();
    $('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Archívum</h2><p>Elmúlt Tömegsport és SPORT7 alkalmak a jelenlegi szezonból.</p></div><span class="read-only-badge">MEGTEKINTÉS</span></div><article class="panel legacy-archive-panel"><div class="legacy-event-table"><div class="legacy-archive-header"><div>Edzés / szint</div><div>Időpont</div><div>Pálya / helyszín</div><div>Típus</div><div>Státusz</div></div>${rows.map(e=>`<button class="legacy-archive-row" type="button" data-mass-detail="${esc(e.eventId||e.id)}"><span><i style="background:${esc(massLevelColor(e))}"></i><b>${esc(e.level||e.title||'Edzés')}</b></span><span><b>${esc(fmtDate(eventStart(e)))}</b><small>${esc(fmtTime(eventStart(e)))}${eventEnd(e)?` – ${esc(fmtTime(eventEnd(e)))}`:''}</small></span><span><b>${esc(e.court||'–')}</b><small>${esc(e.venue||'')}</small></span><span>${esc(e.sessionType||'Tömegsport')}</span><span class="status-pill muted">LEZÁRT</span></button>`).join('')||emptyInline('A szezonban még nincs archivált alkalom.')}</div></article>`;
    $$('[data-mass-detail]').forEach(b=>b.addEventListener('click',()=>openMassEventDetail(b.dataset.massDetail)));
  }
  function renderTrainingPlannerParity(){
    const teamId=text(state.plannerTeam),teams=state.teams.filter(t=>t.active!==false),events=effectiveCompetitionEvents(state.activityEvents).filter(e=>eventType(e)==='training'&&!isEventPast(e)&&(!teamId||eventTeamId(e)===teamId)).slice(0,18);
    $('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Edzéstervezés</h2><p>Szezon → csapat → konkrét edzés → terv / Edzés mód.</p></div><span class="read-only-badge">TERVEZŐ · KÖVETKEZŐ KÖR</span></div><div class="legacy-planner-shell"><aside class="legacy-planner-teams"><div class="legacy-planner-section-head"><b>${esc(cfg.DEFAULT_SEASON)}</b><small>Csapat</small></div><button class="legacy-planner-team ${teamId?'':'active'}" data-planner-team="" type="button">Összes csapat</button>${teams.map(t=>`<button class="legacy-planner-team ${teamId===text(t.id)?'active':''}" data-planner-team="${esc(t.id)}" type="button"><i style="background:${esc(t.color||'#f7b700')}"></i><span><b>${esc(t.name)}</b><small>${esc(t.season||cfg.DEFAULT_SEASON)}</small></span></button>`).join('')}</aside><article class="panel legacy-planner-events"><div class="panel-head"><div><h3>Közelgő edzések</h3><p>A régi Edzéstervezés szerkezete visszatért; a részletes feladattár, pályaábra és élő Edzés mód külön következő fejlesztési kör.</p></div></div><div class="legacy-planner-event-list">${events.map(e=>`<div class="legacy-planner-event"><span class="legacy-event-accent" style="background:${esc(e.color||teamById(eventTeamId(e))?.color||'#f7b700')}"></span><div><b>${esc(e.teamName||teamById(eventTeamId(e))?.name||'Csapat')}</b><small>${esc(fmtDate(eventStart(e)))} · ${esc(fmtTime(eventStart(e)))}${e.court?' · '+esc(e.court):''}</small></div><span class="status-pill ok">EDZÉS</span></div>`).join('')||emptyInline('Nincs közelgő edzés ebben a szűrésben.')}</div></article><article class="panel legacy-planner-detail"><div class="panel-head"><div><h3>Edzésterv</h3><p>A régi Manager részletes terv/Edzés mód területe.</p></div></div><div class="planner-readonly-map"><div><b>Feladattár</b><span>KÖVETKEZŐ</span></div><div><b>Pályaábra</b><span>KÖVETKEZŐ</span></div><div><b>Időzítés</b><span>KÖVETKEZŐ</span></div><div><b>Edzés mód</b><span>KÖVETKEZŐ</span></div></div></article></div>`;
    $$('[data-planner-team]').forEach(b=>b.addEventListener('click',()=>{state.plannerTeam=text(b.dataset.plannerTeam);renderTrainingPlannerParity()}));
  }

  function renderPlaceholder(title,copy,items=[]){$('#viewContent').innerHTML=`<div class="page-intro"><div><h2>${esc(title)}</h2><p>${esc(copy)}</p></div><span class="migration-badge">MIGRÁCIÓ</span></div><article class="panel placeholder-panel"><div class="placeholder-glyph">${moduleMeta()?.[2]||'◇'}</div><div><h3>${esc(title)}</h3><p>${esc(copy)}</p><ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="migration-note"><b>V0.4 szabály:</b> ez a modul még nem váltja le a régi Manager production funkcióját.</div></div></article>`}
  function renderPermissionDenied(){$('#viewContent').innerHTML=`<article class="panel placeholder-panel"><div class="placeholder-glyph">⊘</div><div><h3>Nincs hozzáférés</h3><p>Ehhez a Manager modulhoz a jelenlegi fiókodnak nincs megtekintési jogosultsága.</p></div></article>`}
  function migrationNotice(textValue){return `<div class="migration-notice"><b>Read-only foundation</b><span>${esc(textValue)}</span></div>`}
  function emptyInline(v){return `<div class="empty-inline">${esc(v)}</div>`}

  function filteredActivityEvents(predicate){
    const now=Date.now();return effectiveCompetitionEvents(state.activityEvents).filter(e=>predicate(e)&&teamFilterMatch_('events',eventTeamId(e))&&(state.eventPeriod==='all'||(state.eventPeriod==='upcoming'&&!isEventPast(e))||(state.eventPeriod==='past'&&isEventPast(e)))).sort((a,b)=>eventStart(a)-eventStart(b));
  }
  function eventStatusLabel(e){return isEventPast(e)?'LEZÁRT':(text(e.status||'active').toLowerCase()==='active'?'AKTÍV':text(e.status||'').toUpperCase()||'AKTÍV')}
  function rosterGroup(title,rows,kind){return `<section class="roster-group ${kind} cc-unified-roster-group"><h4>${esc(title)} <span>${rows.length}</span></h4><div class="cc-unified-player-list">${rows.map(p=>playerUnifiedCardHtml_(p,{openAttr:'data-player-open'})).join('')||'<small class="roster-empty">Nincs játékos.</small>'}</div></section>`}
  function ccNameKey_(value){return text(value).toLocaleLowerCase('hu-HU').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
  function ccPositionKey_(value){const k=ccNameKey_(value);if(k.includes('felado'))return'f';if(k.includes('szelso'))return'sz';if(k.includes('center')||k.includes('centre'))return'c';if(k.includes('atlo'))return'a';if(k.includes('libero'))return'l';return'?'}
  function ccCardMatrix_(){const m=state.cardRsvpMatrix&&Array.isArray(state.cardRsvpMatrix.responses)?state.cardRsvpMatrix:state.rsvpMatrix;return m||{events:[],players:[],responses:[]}}
  function ccGoingStatus_(value){const k=ccNameKey_(value);return k==='going'||k==='yes'||k==='jovok'||k==='igen'}
  function ccEventPositionSummary_(e){
    const m=ccCardMatrix_(),eventId=text(e.eventId||e.id),players=new Map([...(m.players||[]),...(state.players||[])].map(p=>[text(p.playerId||p.id),p])),counts={f:0,sz:0,c:0,a:0,l:0,'?':0};
    const matrixRows=(m.responses||[]).filter(r=>text(r.eventId||r.event_id)===eventId),cachedRows=state.eventRosterCache.get(eventId)||[],sourceRows=cachedRows.length?cachedRows:matrixRows;
    sourceRows.filter(r=>ccGoingStatus_(r.status)).forEach(r=>{const p=players.get(text(r.playerId||r.player_id))||r,k=ccPositionKey_(p?.position);counts[k]=(counts[k]||0)+1});
    const eventKnown=(m.events||[]).some(x=>text(x.eventId||x.id||x.event_id)===eventId),known=eventKnown||matrixRows.length>0||cachedRows.length>0||num(e.yesCount)===0;
    return {known,counts,source:cachedRows.length?'roster':matrixRows.length?'matrix':eventKnown?'matrix-event':'none'}
  }
  const ccCardRosterPrefetch_=new Set();
  function ccPositionCountTotal_(summary){return Object.values(summary?.counts||{}).reduce((a,b)=>a+num(b),0)}
  async function ccHydrateCardPositions_(rows,rerender){
    if(!configured())return;
    const pending=(rows||[]).filter(e=>{const id=text(e.eventId||e.id),summary=ccEventPositionSummary_(e),expected=num(e.yesCount);return id&&expected>0&&(!summary.known||ccPositionCountTotal_(summary)!==expected)&&!state.eventRosterCache.has(id)&&!ccCardRosterPrefetch_.has(id)});
    if(!pending.length)return;
    pending.forEach(e=>ccCardRosterPrefetch_.add(text(e.eventId||e.id)));
    await Promise.allSettled(pending.map(e=>loadEventRoster(text(e.eventId||e.id))));
    pending.forEach(e=>ccCardRosterPrefetch_.delete(text(e.eventId||e.id)));
    if(typeof rerender==='function')rerender();
  }
  function ccTotalTone_(n){const x=num(n);return x<6?'danger':x<10?'warn':'ok'}
  function ccPositionTone_(key,n,known){if(!known)return'unknown';const x=num(n);if(key==='f'||key==='l'||key==='a')return x===0?'danger':x===1?'warn':'ok';if(key==='sz'||key==='c')return x<=1?'danger':x===2?'warn':'ok';return'ok'}
  function ccTeamRosterSize_(teamId){return (state.players||[]).filter(p=>text(p.teamId||p.team_id)===text(teamId)&&p.active!==false).length}
  function ccPositionBreakdownHtml_(e){const {known,counts}=ccEventPositionSummary_(e),defs=[['f','F'],['sz','SZ'],['c','C'],['a','Á'],['l','L']];return `<div class="cc-pos-breakdown" aria-label="Jövők poszt szerint">${defs.map(([k,label])=>`<span class="${ccPositionTone_(k,counts[k],known)}"><b>${label}</b>${known?num(counts[k]):'–'}</span>`).join('')}${known&&counts['?']?`<span class="unknown"><b>?</b>${num(counts['?'])}</span>`:''}</div>`}
  function ccEventOpponent_(e){const title=text(e.title),parts=title.split(/\s+[–—-]\s+/).map(text).filter(Boolean),ha=text(e.homeAway||e.home_away);if(parts.length>=2){if(ha==='home')return parts.slice(1).join(' – ');if(ha==='away')return parts[0];const teamName=ccNameKey_(e.teamName||teamById(eventTeamId(e))?.name);return parts.find(x=>!ccNameKey_(x).includes('beac')&&ccNameKey_(x)!==teamName)||parts[1]}return title||'Ellenfél'}
  function ccStandingByName_(teamId,name){const key=ccNameKey_(name);if(!key)return null;return standingsForContext_(teamId).find(r=>ccNameKey_(r.teamName)===key)||null}
  function ccFocusStanding_(teamId){return standingsForContext_(teamId).find(r=>r.focus)||null}
  function ccOpponentLogoHtml_(src,alt){if(!src)return'';return `<span class="cc-event-opponent-logo"><img src="${esc(src)}" alt="${esc(alt||'')}" loading="lazy" referrerpolicy="no-referrer"></span>`}
  function ccEventIconHtml_(e,kind){const path=kind==='training'?'assets/event-training-mask.png':text(e.homeAway||e.home_away)==='away'?'assets/event-away-mask.png':'assets/event-home-mask.png',label=kind==='training'?'Edzés':text(e.homeAway||e.home_away)==='away'?'Idegenbeli meccs':'Hazai meccs';return `<span class="cc-event-type-icon"><img src="${path}" alt=""><small>${esc(label)}</small></span>`}
  function ccEventCardHtml_(e,kind){
    const teamId=eventTeamId(e),team=teamById(teamId),teamName=e.teamName||team?.name||'Csapat',yes=num(e.yesCount),roster=ccTeamRosterSize_(teamId),start=eventStart(e),end=eventEnd(e),isMatch=kind==='match',ha=text(e.homeAway||e.home_away),opponent=isMatch?ccEventOpponent_(e):'',oppRow=isMatch?ccStandingByName_(teamId,opponent):null,oppLogo=text(oppRow?.logoUrl),oppRank=oppRow?.position?`${oppRow.position}. helyen áll`:'';
    const dateText=start?new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Europe/Budapest'}).format(start).replace(/\s/g,''):'–';
    const timeText=start?fmtTime(start):'–',friendly=isMatch&&ccMatchKindFromEvent_(e)==='friendly',location=isMatch?[e.court?`${text(e.court)}. pálya`:'',text(e.venue)].filter(Boolean).join(' · '):(e.court?`${text(e.court)}. pálya`:'');
    const matchMeta=isMatch?[friendly?'Edzőmeccs':ha==='home'?'Hazai meccs':ha==='away'?'Idegenbeli meccs':'Meccs',oppRank].filter(Boolean).join(' · '):(e.court?`${text(e.court)}. pálya`:'');
    return `<button type="button" class="cc-event-card ${isEventPast(e)?'past':''} ${isMatch?'match':'training'}" data-event-id="${esc(e.eventId||e.id)}" style="--team-color:${esc(e.color||team?.color||'#f7b700')}">${ccEventIconHtml_(e,kind)}<span class="cc-event-team-summary"><strong>${esc(teamName)}</strong><span class="cc-event-total ${ccTotalTone_(yes)}"><b>${yes}</b>${roster?`<i>/${roster}</i>`:''}</span>${ccPositionBreakdownHtml_(e)}</span><span class="cc-event-date"><b>${esc(dateText)}</b><small>${esc(timeText)}${friendly&&end?`–${esc(fmtTime(end))}`:''}${location?` · ${esc(location)}`:''}</small></span><span class="cc-event-main">${isMatch?`<span class="cc-event-opponent-head">${ccOpponentLogoHtml_(oppLogo,opponent)}<strong>${esc(opponent||e.title||'Meccs')}</strong></span>`:`<strong>Edzés</strong>`}<small>${esc(matchMeta)}</small></span></button>`
  }
  async function toggleEventRoster(eventId,button){const holder=document.querySelector(`[data-roster-holder="${CSS.escape(eventId)}"]`);if(!holder)return;const opening=holder.hidden;holder.hidden=!opening;button?.setAttribute('aria-expanded',String(opening));button?.classList.toggle('open',opening);if(!opening)return;if(holder.dataset.loaded==='1'){bindUnifiedPlayerCards_(holder);return}holder.innerHTML='<div class="roster-loading">Névsor betöltése…</div>';try{const rows=configured()?await loadEventRoster(eventId):[];holder.dataset.loaded='1';holder.innerHTML=`<div class="roster-groups">${rosterGroup('Jövök',rows.filter(x=>x.status==='going'),'going')}${rosterGroup('Nem jövök',rows.filter(x=>x.status==='not_going'),'not-going')}${rosterGroup('Nincs válasz',rows.filter(x=>x.status!=='going'&&x.status!=='not_going'),'none')}</div>`;bindUnifiedPlayerCards_(holder)}catch(err){holder.innerHTML=`<div class="roster-loading error">${esc(err.message||'A névsor betöltése nem sikerült.')}</div>`}}
  function renderCompetitionTrainingCards_(){
    state.eventFiltersOpen=filterOpen_('competition.trainings',false);
    const rows=filteredActivityEvents(e=>eventType(e)==='training'),active=teamFilterIds_('events').length>0||state.eventPeriod!=='upcoming';
    $('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Edzések</h2><p>Versenycsapat-edzések: létszám, posztösszetétel, időpont és helyszín egy sorban.</p></div><div class="page-actions">${canAnyAction('competition.trainings','edit')?'<button class="button primary small" id="competitionTrainingAdd" type="button">+ Új edzés</button>':''}</div></div><div class="event-filter-head"><button class="matrix-filter-toggle ${state.eventFiltersOpen?'open':''} ${active?'has-filter':''}" id="eventFiltersToggle" aria-expanded="${state.eventFiltersOpen?'true':'false'}" type="button"><span class="triangle-icon"></span>Szűrők</button>${active?'<button class="filter-reset" id="eventFilterReset" type="button">Szűrők törlése</button>':''}</div><div class="filter-panel parity-event-filters" id="eventFiltersPanel" ${state.eventFiltersOpen?'':'hidden'}><div class="field compact">${teamMultiFilterHtml_('events')}</div><label class="field compact"><span>Időszak</span><select id="eventPeriodFilter"><option value="upcoming" ${state.eventPeriod==='upcoming'?'selected':''}>Aktuális / közelgő</option><option value="past" ${state.eventPeriod==='past'?'selected':''}>Elmúlt</option><option value="all" ${state.eventPeriod==='all'?'selected':''}>Mind</option></select></label></div><article class="panel cc-event-card-panel"><div class="panel-head"><div><h3>${state.eventPeriod==='past'?'Elmúlt edzések':'Következő edzések'}</h3><p>${rows.length} alkalom a szűrésben</p></div></div><div class="cc-event-card-list">${rows.map(e=>ccEventCardHtml_(e,'training')).join('')||emptyInline('Nincs edzés ebben a szűrésben.')}</div></article>`;
    $('#competitionTrainingAdd')?.addEventListener('click',()=>openCompetitionEventEditor(null,'training'));
    const toggle=$('#eventFiltersToggle'),panel=$('#eventFiltersPanel');
    toggle?.addEventListener('click',()=>{const open=setFilterOpen_('competition.trainings',!state.eventFiltersOpen);state.eventFiltersOpen=open;toggle.setAttribute('aria-expanded',String(open));toggle.classList.toggle('open',open);if(panel)panel.hidden=!open;ccBlurPointerControl_(toggle)});
    bindTeamMultiFilter_('events',renderCompetitionTrainingCards_);
    $('#eventPeriodFilter')?.addEventListener('change',e=>{state.eventPeriod=e.target.value;afterNativePicker(e.target,renderCompetitionTrainingCards_,'#eventFiltersPanel')});
    $('#eventFilterReset')?.addEventListener('click',()=>{state.eventTeam='';state.teamFilters.events=[];state.eventPeriod='upcoming';renderCompetitionTrainingCards_()});
    bindEventDetailActions();
    void ccHydrateCardPositions_(rows,renderCompetitionTrainingCards_);
  }

  function ccCompetitionSyncLastRun_(){return state.competitionSyncStatus?.lastRun||null}
  function ccCompetitionSyncSummary_(){
    const r=ccCompetitionSyncLastRun_();
    if(!r)return 'BRSZ · még nincs frissítési előzmény';
    const when=r.completed_at||r.started_at,stamp=when?`${fmtDate(when)} ${fmtTime(when)}`:'–';
    const statusText=r.status==='success'?'rendben':r.status==='partial'?'részleges':r.status==='failed'?'hiba':'fut';
    return `BRSZ · ${stamp} · ${statusText} · ${num(r.created_events)} új · ${num(r.updated_events)} módosult${Number(r.review_count||0)?` · ${num(r.review_count)} ellenőrzendő`:''}`;
  }
  const CC_BRSZ_COMPETITION_HTML_V1=Object.freeze({
    '1121':'Női I. osztály',
    '1146':'Női II. osztály B csoport',
    '1137':'Férfi I. osztály B csoport'
  });
  function ccBRSZCompetitionIdFromHtml_(html){
    const raw=String(html||'');
    // Chrome/Safari saved HTML: this comment is the authoritative source page URL.
    // Do NOT scan the whole document first: the BRSZ navigation contains links to
    // every championship and would misclassify multiple files as the same league.
    const saved=raw.match(/saved\s+from\s+url=\([^)]*\)\s*https?:\/\/(?:www\.)?brsz\.hu\/bajnoksagok\.php\?[^\r\n>]*?bajnoksag_id=(1121|1146|1137)/i);
    if(saved)return saved[1];
    // Fallback for manually copied HTML without the browser's saved-from-url comment:
    // the current page repeats its own URL with a # anchor near the top navigation.
    const head=raw.slice(0,20000);
    const current=head.match(/href=["']https?:\/\/(?:www\.)?brsz\.hu\/bajnoksagok\.php\?bajnoksag_id=(1121|1146|1137)#["']/i);
    return current?current[1]:'';
  }
  function ccBytesToBase64_(buffer){
    const bytes=new Uint8Array(buffer);let binary='';const chunk=0x8000;
    for(let i=0;i<bytes.length;i+=chunk)binary+=String.fromCharCode(...bytes.subarray(i,Math.min(i+chunk,bytes.length)));
    return btoa(binary);
  }
  function ccDecodeBrszPreview_(buffer){
    try{return new TextDecoder('iso-8859-2',{fatal:false}).decode(buffer)}catch(_){return new TextDecoder('utf-8',{fatal:false}).decode(buffer)}
  }
  function ccPickBrszHtmlFiles_(){
    return new Promise(resolve=>{
      const input=document.createElement('input');input.type='file';input.accept='.html,.htm,text/html';input.multiple=true;input.style.display='none';document.body.appendChild(input);
      const done=()=>{const files=Array.from(input.files||[]);input.remove();resolve(files)};
      input.addEventListener('change',done,{once:true});input.addEventListener('cancel',()=>{input.remove();resolve([])},{once:true});input.click();
    });
  }
  async function ccPrepareBrszHtmlDocuments_(files){
    if(!Array.isArray(files)||!files.length)return[];
    if(files.length>6)throw new Error('Legfeljebb a három BRSZ bajnokságoldalt válaszd ki.');
    const byId=new Map();
    for(const file of files){
      if(Number(file.size||0)>600000)throw new Error(`${file.name}: a HTML fájl túl nagy.`);
      const buffer=await file.arrayBuffer(),preview=ccDecodeBrszPreview_(buffer),competitionId=ccBRSZCompetitionIdFromHtml_(preview);
      if(!competitionId)throw new Error(`${file.name}: nem felismerhető 2026/27-es BRSZ bajnokságoldal.`);
      if(byId.has(competitionId))throw new Error(`${CC_BRSZ_COMPETITION_HTML_V1[competitionId]} kétszer lett kiválasztva.`);
      byId.set(competitionId,{name:file.name,competitionId,contentBase64:ccBytesToBase64_(buffer)});
    }
    const missing=Object.keys(CC_BRSZ_COMPETITION_HTML_V1).filter(id=>!byId.has(id));
    if(missing.length)throw new Error(`Hiányzó BRSZ oldal: ${missing.map(id=>CC_BRSZ_COMPETITION_HTML_V1[id]).join(', ')}.`);
    return Object.keys(CC_BRSZ_COMPETITION_HTML_V1).map(id=>byId.get(id));
  }
  const CC_BRSZ_HELPER_PAGE_SOURCE='CC_MANAGER';
  const CC_BRSZ_HELPER_SOURCE='CC_BRSZ_HELPER';
  const ccBrszHelperPending_=new Map();
  function ccBrszHelperMessage_(event){
    if(event.source!==window)return;
    const d=event.data||{};if(d.source!==CC_BRSZ_HELPER_SOURCE)return;
    const requestId=text(d.requestId),pending=requestId?ccBrszHelperPending_.get(requestId):null;
    if(d.type==='ACK'){
      if(pending){pending.acked=true;clearTimeout(pending.installTimer);competitionStatus_(`BRSZ Helper kapcsolódva${d.version?` · v${text(d.version)}`:''}.`)}
      return;
    }
    if(d.type==='PROGRESS'){
      if(pending&&d.message)competitionStatus_(text(d.message));
      return;
    }
    if(d.type==='RESULT'){
      if(!pending)return;clearTimeout(pending.installTimer);ccBrszHelperPending_.delete(requestId);pending.resolve(Array.isArray(d.documents)?d.documents:[]);return;
    }
    if(d.type==='ERROR'){
      if(!pending)return;clearTimeout(pending.installTimer);ccBrszHelperPending_.delete(requestId);pending.reject(new Error(text(d.message)||'A BRSZ Helper hibát jelzett.'));return;
    }
  }
  window.addEventListener('message',ccBrszHelperMessage_,false);
  function ccRequestBrszHelperDocuments_(){
    return new Promise((resolve,reject)=>{
      const requestId=(crypto.randomUUID?.()||`cc-${Date.now()}-${Math.random().toString(16).slice(2)}`),pending={resolve,reject,acked:false,installTimer:null};
      pending.installTimer=setTimeout(()=>{
        if(pending.acked)return;
        ccBrszHelperPending_.delete(requestId);
        reject(new Error('A Club Control BRSZ Helper nem érhető el. Telepítsd/engedélyezd a Chrome-kiegészítőt, majd frissítsd ezt az oldalt.'));
      },1400);
      ccBrszHelperPending_.set(requestId,pending);
      window.postMessage({source:CC_BRSZ_HELPER_PAGE_SOURCE,type:'CC_BRSZ_HELPER_START',requestId,season:'2026/27'},window.location.origin);
    });
  }
  function ccValidateHelperDocuments_(documents){
    if(!Array.isArray(documents)||documents.length!==3)throw new Error('A BRSZ Helper nem adott vissza három bajnokságoldalt.');
    const expected=new Set(Object.keys(CC_BRSZ_COMPETITION_HTML_V1)),seen=new Set();
    for(const doc of documents){
      const id=text(doc?.competitionId),html=String(doc?.html||'');
      if(!expected.has(id))throw new Error(`Ismeretlen BRSZ bajnokságazonosító: ${id||'üres'}.`);
      if(seen.has(id))throw new Error(`${CC_BRSZ_COMPETITION_HTML_V1[id]} kétszer érkezett a Helperből.`);
      if(html.length<2000)throw new Error(`${CC_BRSZ_COMPETITION_HTML_V1[id]} oldala üres vagy nem teljes.`);
      if(!html.includes(`bajnoksag_id=${id}`))throw new Error(`${CC_BRSZ_COMPETITION_HTML_V1[id]} oldala nem egyezik a várt forrással.`);
      seen.add(id);
    }
    const missing=[...expected].filter(id=>!seen.has(id));if(missing.length)throw new Error(`Hiányzó BRSZ oldal: ${missing.map(id=>CC_BRSZ_COMPETITION_HTML_V1[id]).join(', ')}.`);
    return documents.map(doc=>({competitionId:text(doc.competitionId),name:text(doc.name)||`brsz-${text(doc.competitionId)}.html`,html:String(doc.html||''),encoding:'utf-8'}));
  }
  async function runCompetitionSourceSync_(){
    if(state.competitionSyncBusy)return;
    if(!state.supabase?.functions)throw new Error('A Supabase Edge Functions kliens nem érhető el.');
    state.competitionSyncBusy=true;renderCompetitionMatchCards_();competitionStatus_('BRSZ Helper indítása…');
    try{
      const documents=ccValidateHelperDocuments_(await ccRequestBrszHelperDocuments_());
      competitionStatus_('BRSZ adatok feldolgozása…');
      const {data,error}=await state.supabase.functions.invoke('cc-competition-sync',{body:{source:'brsz',season:'2026/27',mode:'browser_helper',documents}});
      if(error)throw error;
      if(!data?.ok)throw new Error((data?.errors||[]).join(' · ')||data?.message||'A BRSZ Browser Helper import sikertelen.');
      await Promise.all([loadCompetitionSyncStatus(),loadCompetitionResultsStandings().catch(()=>{}),loadActivityEvents(),loadCalendar()]);
      state.events=state.calendarEvents;
      renderCompetitionMatchCards_();
      const t=data?.totals||{};
      competitionStatus_(`BRSZ kész · ${num(t.fetchedMatchCount)} meccs · ${num(t.createdEvents)} új · ${num(t.updatedEvents)} módosult · ${num(t.standingsRows)} tabellasor`,data?.status==='partial'?'':'success');
    }catch(err){
      console.error(err);await loadCompetitionSyncStatus().catch(()=>{});renderCompetitionMatchCards_();competitionStatus_(err.message||'A BRSZ frissítés sikertelen.','error');
    }finally{state.competitionSyncBusy=false;const b=$('#competitionSourceSync');if(b)b.disabled=false}
  }

  function renderCompetitionMatchCards_(){
    state.eventFiltersOpen=filterOpen_('competition.matches',false);
    const rows=filteredActivityEvents(e=>eventType(e)==='match'),active=teamFilterIds_('events').length>0||state.eventPeriod!=='upcoming',periodTitle=state.eventPeriod==='past'?'Elmúlt meccsek':'Következő meccsek';
    $('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Meccsek</h2><p>Létszám, posztösszetétel, hazai/idegen jelzés, ellenfél és tabella egy nézetben.</p></div><div class="page-actions">${canAnyAction('competition.matches','edit')?`<button class="button quiet small sync-button" id="competitionSourceSync" type="button" title="BRSZ frissítés a Club Control Browser Helperrel" ${state.competitionSyncBusy?'disabled':''}>${state.competitionSyncBusy?'Frissítés…':'BRSZ frissítés'}</button><button class="button primary small" id="competitionMatchAdd" type="button">+ Új meccs</button>`:''}</div></div><div class="competition-live-status hidden" id="competitionLiveStatus" role="status" aria-live="polite"></div><div class="competition-sync-strip ${ccCompetitionSyncLastRun_()?.status||'idle'}"><span class="sync-dot"></span><span>${esc(ccCompetitionSyncSummary_())}</span>${Number(state.competitionSyncStatus?.pendingChanges||0)?`<b>${num(state.competitionSyncStatus.pendingChanges)} naplózott változás</b>`:''}</div><div class="event-filter-head"><button class="matrix-filter-toggle ${state.eventFiltersOpen?'open':''} ${active?'has-filter':''}" id="eventFiltersToggle" aria-expanded="${state.eventFiltersOpen?'true':'false'}" type="button"><span class="triangle-icon"></span>Szűrők</button>${active?'<button class="filter-reset" id="eventFilterReset" type="button">Szűrők törlése</button>':''}</div><div class="filter-panel parity-event-filters" id="eventFiltersPanel" ${state.eventFiltersOpen?'':'hidden'}><div class="field compact">${teamMultiFilterHtml_('events')}</div><label class="field compact"><span>Időszak</span><select id="eventPeriodFilter"><option value="upcoming" ${state.eventPeriod==='upcoming'?'selected':''}>Aktuális / közelgő</option><option value="past" ${state.eventPeriod==='past'?'selected':''}>Elmúlt</option><option value="all" ${state.eventPeriod==='all'?'selected':''}>Mind</option></select></label></div><article class="panel cc-event-card-panel"><div class="panel-head"><div><h3>${periodTitle}</h3><p>${rows.length} mérkőzés a szűrésben</p></div></div><div class="cc-event-card-list">${rows.map(e=>ccEventCardHtml_(e,'match')).join('')||emptyInline('Nincs meccs ebben a szűrésben.')}</div></article>${standingsSection_('events')}`;
    $('#competitionSourceSync')?.addEventListener('click',runCompetitionSourceSync_);$('#competitionMatchAdd')?.addEventListener('click',()=>openCompetitionEventEditor(null,'match'));
    const toggle=$('#eventFiltersToggle'),panel=$('#eventFiltersPanel');if(toggle)toggle.classList.toggle('open',state.eventFiltersOpen);toggle?.addEventListener('click',()=>{const open=setFilterOpen_('competition.matches',!state.eventFiltersOpen);state.eventFiltersOpen=open;toggle.setAttribute('aria-expanded',String(open));toggle.classList.toggle('open',open);if(panel)panel.hidden=!open;ccBlurPointerControl_(toggle)});
    bindTeamMultiFilter_('events',renderCompetitionMatchCards_);
    $('#eventPeriodFilter')?.addEventListener('change',e=>{state.eventPeriod=e.target.value;afterNativePicker(e.target,renderCompetitionMatchCards_,'#eventFiltersPanel')});
    $('#eventFilterReset')?.addEventListener('click',()=>{state.eventTeam='';state.teamFilters.events=[];state.eventPeriod='upcoming';renderCompetitionMatchCards_()});
    bindEventDetailActions();
    void ccHydrateCardPositions_(rows,renderCompetitionMatchCards_);
  }

  function renderEventList(title,copy,predicate){
    state.eventFiltersOpen=filterOpen_(routeKey(),false);const rows=filteredActivityEvents(predicate),active=teamFilterIds_('events').length>0||state.eventPeriod!=='upcoming';
    $('#viewContent').innerHTML=`<div class="page-intro"><div><h2>${esc(title)}</h2><p>${esc(copy)} A korábbi Manager információsűrűségével.</p></div>${title==='Meccsek'&&canAnyAction('competition.matches','edit')?'<button class="button primary small" id="competitionMatchAdd" type="button">+ Új meccs</button>':''}</div><div class="event-filter-head"><button class="matrix-filter-toggle ${state.eventFiltersOpen?'open':''} ${active?'has-filter':''}" id="eventFiltersToggle" aria-expanded="${state.eventFiltersOpen?'true':'false'}" type="button"><span class="triangle-icon"></span>Szűrők</button>${active?'<button class="filter-reset" id="eventFilterReset" type="button">Szűrők törlése</button>':''}</div><div class="filter-panel parity-event-filters" id="eventFiltersPanel" ${state.eventFiltersOpen?'':'hidden'}><div class="field compact">${teamMultiFilterHtml_('events')}</div><label class="field compact"><span>Időszak</span><select id="eventPeriodFilter"><option value="upcoming" ${state.eventPeriod==='upcoming'?'selected':''}>Aktuális / közelgő</option><option value="past" ${state.eventPeriod==='past'?'selected':''}>Elmúlt</option><option value="all" ${state.eventPeriod==='all'?'selected':''}>Mind</option></select></label></div><article class="panel event-table-panel"><div class="legacy-event-table"><div class="legacy-event-header"><div>Esemény / csapat</div><div>Időpont</div><div>Pálya / helyszín</div><div>Jövök</div><div>Nem jövök</div><div>Nincs válasz</div><div>Státusz</div><div></div></div>${rows.map(e=>`<div class="legacy-event-item ${isEventPast(e)?'past':''}"><div class="legacy-event-row"><button class="event-title-button" type="button" data-event-id="${esc(e.eventId||e.id)}"><span class="legacy-event-accent" style="background:${esc(e.color||teamById(eventTeamId(e))?.color||'#f7b700')}"></span><span><b>${esc(e.teamName||'')}</b><small>${esc(ccDisplayEventTitle_(e))}${eventType(e)==='match'?' · Meccs':''}</small></span></button><div><b>${esc(fmtDate(eventStart(e)))}</b><small>${esc(fmtTime(eventStart(e)))}${eventEnd(e)?` – ${esc(fmtTime(eventEnd(e)))}`:''}</small></div><div><b>${esc(e.court||'–')}</b><small>${eventType(e)==='match'?esc(e.venue||''):''}</small></div><div class="rsvp-number going">${num(e.yesCount)}</div><div class="rsvp-number not-going">${num(e.noCount)}</div><div class="rsvp-number none">${num(e.unknownCount)}</div><div><span class="status-pill ${isEventPast(e)?'':'ok'}">${esc(eventStatusLabel(e))}</span></div><button class="roster-chevron" type="button" data-roster-toggle="${esc(e.eventId||e.id)}" aria-expanded="false" aria-label="Névsor megnyitása"><span class="triangle-icon"></span></button></div><div class="legacy-event-roster" data-roster-holder="${esc(e.eventId||e.id)}" hidden></div></div>`).join('')||emptyInline('Nincs esemény ebben a szűrésben.')}</div></article>`;
    const toggle=$('#eventFiltersToggle'),panel=$('#eventFiltersPanel');if(toggle)toggle.classList.toggle('open',state.eventFiltersOpen);toggle?.addEventListener('click',()=>{const open=setFilterOpen_(routeKey(),!state.eventFiltersOpen);state.eventFiltersOpen=open;toggle.setAttribute('aria-expanded',String(open));toggle.classList.toggle('open',open);if(panel)panel.hidden=!open;ccBlurPointerControl_(toggle)});bindTeamMultiFilter_('events',()=>renderEventList(title,copy,predicate));$('#eventPeriodFilter')?.addEventListener('change',e=>{state.eventPeriod=e.target.value;afterNativePicker(e.target,()=>renderEventList(title,copy,predicate),'#eventFiltersPanel')});$('#eventFilterReset')?.addEventListener('click',()=>{state.eventTeam='';state.teamFilters.events=[];state.eventPeriod='upcoming';renderEventList(title,copy,predicate)});$$('[data-roster-toggle]').forEach(b=>b.addEventListener('click',()=>toggleEventRoster(b.dataset.rosterToggle,b)));bindEventDetailActions();$('#competitionMatchAdd')?.addEventListener('click',()=>openCompetitionEventEditor(null,'match'));
  }

  function openTeamEditor_(teamId){const t=teamById(teamId);if(!t||!canAction('competition.teams','edit',teamId)){status('Nincs szerkesztési jogosultságod ehhez a csapathoz.','error');return}const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='VERSENYSPORT · CSAPAT · SZERKESZTÉS';title.textContent=t.name;body.innerHTML=`<form id="teamEditForm" class="action-form"><div class="action-form-grid"><label class="field"><span>Csapat neve</span><input id="teName" value="${esc(t.name||'')}" required></label><label class="field"><span>Szezon</span><input id="teSeason" value="${esc(t.season||cfg.DEFAULT_SEASON)}"></label><label class="field"><span>Szín</span><input id="teColor" type="color" value="${esc(t.color||'#f7b700')}"></label><label class="field"><span>Edző(k)</span><input id="teCoaches" value="${esc(t.coaches||'')}"></label><label class="field"><span>Alaphelyszín</span><input id="teVenue" value="${esc(ccTeamDefaultVenue_(t))}"></label><label class="field"><span>Alappálya</span><input id="teCourt" value="${esc(ccTeamDefaultCourt_(t))}"></label></div><label class="action-checkbox"><input id="teActive" type="checkbox" ${t.active!==false?'checked':''}> <span>Aktív csapat</span></label><div class="dialog-action-row"><button type="button" class="button quiet" id="teCancel">Mégse</button><button type="submit" class="button primary" id="teSave">Mentés</button></div></form>`;ccOpenDialogStable_(d);$('#teCancel')?.addEventListener('click',ccCloseEntityDialog_);$('#teamEditForm')?.addEventListener('submit',async ev=>{ev.preventDefault();const btn=$('#teSave');if(btn)btn.disabled=true;try{await rpc('cc_manager_team_update_v1',{p_team_id:t.id,p_payload:{name:text($('#teName').value),season:text($('#teSeason').value),color:text($('#teColor').value),coaches:text($('#teCoaches').value),defaultVenue:text($('#teVenue').value),defaultCourt:text($('#teCourt').value),active:$('#teActive').checked}});await Promise.all([loadTeams(),loadPlayers(),loadActivityEvents(),loadCalendar()]);ccCloseEntityDialog_();renderTeams();status('Csapat mentve.','success')}catch(err){status(err.message||'A csapat mentése sikertelen.','error');if(btn)btn.disabled=false}})}
  function renderTeams(){
    const visibleTeams=state.teams.filter(t=>teamFilterMatch_('teams',t.id));if(!visibleTeams.some(t=>text(t.id)===text(state.selectedTeam)))state.selectedTeam=visibleTeams[0]?.id||'';if(!state.selectedTeam&&visibleTeams[0])state.selectedTeam=visibleTeams[0].id;const selected=teamById(state.selectedTeam),roster=selected?teamPlayers(selected.id):[],att=selected?teamAttendance(selected.id):attendanceSummary([]),canEdit=selected&&canAction('competition.teams','edit',selected.id);
    $('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Csapatok</h2><p>Csapatkeret, alapadatok és tényleges jelenléti összesítés.</p></div><div class="page-actions team-page-actions">${teamMultiFilterHtml_('teams')}${canEdit?'<button class="button primary small" id="teamEditBtn" type="button">Szerkesztés</button>':'<span class="read-only-badge">MEGTEKINTÉS</span>'}</div></div>
      <div class="team-master-detail"><div class="team-master-list">${visibleTeams.map(t=>`<button type="button" class="team-master-card ${text(t.id)===text(state.selectedTeam)?'active':''}" data-team-id="${esc(t.id)}" style="--team-color:${esc(t.color||'#f7b700')}"><span class="team-color-bar"></span><div><b>${esc(t.name)}</b><small>${esc(t.season||cfg.DEFAULT_SEASON)} · ${esc(t.playerCount??teamPlayers(t.id).length)} fő</small></div><span>›</span></button>`).join('')||emptyInline('Nincs csapat.')}</div>
      <article class="panel team-detail-panel">${selected?`<div class="team-detail-head"><div><span class="eyebrow">${esc(selected.season||cfg.DEFAULT_SEASON)}</span><h3>${esc(selected.name)}</h3></div><span class="team-detail-dot" style="background:${esc(selected.color||'#f7b700')}"></span></div><div class="detail-grid">${detailPair('Edző(k)',selected.coaches)}${detailPair('Alaphelyszín',ccTeamDefaultVenue_(selected))}${detailPair('Alappálya',ccTeamDefaultCourt_(selected))}${detailPair('Aktív játékosok',roster.length)}${detailPair('Edzésjelenlét',pctText(att.trainingPresent,att.trainingMarked))}${detailPair('Meccsjelenlét',pctText(att.matchPresent,att.matchMarked))}</div><div class="panel-subhead"><div><h4>Játékoskeret</h4><p>Lezárt jelenléti adatok alapján.</p></div></div><div class="roster-list cc-unified-player-list">${roster.map(p=>playerUnifiedCardHtml_(p,{openAttr:'data-player-open'})).join('')||emptyInline('Nincs aktív játékos a csapatban.')}</div>`:emptyInline('Válassz csapatot.')}</article></div>`;
    bindTeamMultiFilter_('teams',renderTeams);$$('[data-team-id]').forEach(b=>b.addEventListener('click',()=>{state.selectedTeam=b.dataset.teamId;renderTeams()}));bindUnifiedPlayerCards_($('#viewContent')||document);$('#teamEditBtn')?.addEventListener('click',()=>openTeamEditor_(state.selectedTeam));
  }

  const HU_NAME_COLLATOR=new Intl.Collator('hu-HU',{sensitivity:'base',numeric:true,ignorePunctuation:true});
  function playerSurnameKey_(value){
    const parts=text(value).replace(/\s+/g,' ').split(' ').filter(Boolean);
    while(parts.length>1&&/^(dr\.?|ifj\.?|id\.?|özv\.?)$/i.test(parts[0]))parts.shift();
    return parts[0]||'';
  }
  function comparePlayersBySurname_(a,b){
    const an=text(a?.name||a?.displayName),bn=text(b?.name||b?.displayName);
    const bySurname=HU_NAME_COLLATOR.compare(playerSurnameKey_(an),playerSurnameKey_(bn));
    return bySurname||HU_NAME_COLLATOR.compare(an,bn)||HU_NAME_COLLATOR.compare(text(a?.email),text(b?.email));
  }
  function playerTeam_(p){return teamById(text(p?.teamId||p?.team_id))||state.teams.find(t=>text(t.name)===text(p?.teamName))||null}
  function medicalState_(value){
    const raw=text(value).slice(0,10);if(!raw)return{key:'missing',label:'Nincs adat',cls:'missing'};
    const d=new Date(`${raw}T12:00:00`);if(Number.isNaN(d.getTime()))return{key:'missing',label:'Nincs adat',cls:'missing'};
    const today=new Date();today.setHours(0,0,0,0);const diff=Math.ceil((d-today)/864e5);
    if(diff<0)return{key:'expired',label:'Lejárt',cls:'expired'};
    if(diff<=30)return{key:'expiring',label:'≤30 nap',cls:'expiring'};
    return{key:'valid',label:'Érvényes',cls:'valid'};
  }
  function medicalFilterMatch_(p){return state.playerMedical==='all'||medicalState_(p.medicalValidUntil).key===state.playerMedical}
  function medicalBadge_(p){const m=medicalState_(p.medicalValidUntil);return `<span class="medical-badge ${m.cls}" title="Sportorvosi: ${esc(p.medicalValidUntil?fmtDate(p.medicalValidUntil):'nincs adat')}">${esc(m.label)}${p.medicalValidUntil?` · ${esc(fmtDate(p.medicalValidUntil))}`:''}</span>`}
  function playerSortValue_(p,key){
    const markedTrain=Math.max(0,num(p.trainingMarked)),markedMatch=Math.max(0,num(p.matchMarked));
    if(key==='jersey')return Number.isFinite(Number(p.jerseyNo))?Number(p.jerseyNo):99999;
    if(key==='position')return text(p.position).toLocaleLowerCase('hu-HU');
    if(key==='trainingPct')return markedTrain?num(p.trainingPresent)/markedTrain:-1;
    if(key==='matchPct')return markedMatch?num(p.matchPresent)/markedMatch:-1;
    if(key==='overallPct'){const marked=markedTrain+markedMatch;return marked?(num(p.trainingPresent)+num(p.matchPresent))/marked:-1}
    if(key==='trainingCount')return num(p.trainingPresent);
    if(key==='matchCount')return num(p.matchPresent);
    if(key==='medical')return text(p.medicalValidUntil)||'9999-12-31';
    if(key==='memberSince')return text(p.membershipStartsOn)||'9999-12-31';
    return text(p.name||p.displayName).toLocaleLowerCase('hu-HU');
  }
  function comparePlayerSort_(a,b){
    const key=text(state.playerSort)||'name',dir=state.playerSortDir==='desc'?-1:1;
    if(key==='name')return dir*comparePlayersBySurname_(a,b);
    const av=playerSortValue_(a,key),bv=playerSortValue_(b,key);
    let cmp=0;if(typeof av==='number'&&typeof bv==='number')cmp=av-bv;else cmp=HU_NAME_COLLATOR.compare(String(av),String(bv));
    return cmp?dir*cmp:comparePlayersBySurname_(a,b);
  }
  function playerRows(){
    const q=state.playerSearch.toLocaleLowerCase('hu-HU');
    return state.players.filter(p=>{
      if(!teamFilterMatch_('players',text(p.teamId||p.team_id)))return false;
      if(!medicalFilterMatch_(p))return false;
      if(q&&!`${p.name||''} ${p.displayName||''} ${p.email||''} ${p.licenseNo||''} ${p.position||''} ${p.jerseyNo??''}`.toLocaleLowerCase('hu-HU').includes(q))return false;
      return true;
    }).slice().sort(comparePlayerSort_);
  }
  function playerMetaPills_(p){
    const bits=[];
    if(text(p.position))bits.push(text(p.position));
    if(p.jerseyNo!==null&&p.jerseyNo!==undefined&&text(p.jerseyNo)!=='')bits.push('#'+text(p.jerseyNo));
    if(text(p.jerseySize))bits.push('mez '+text(p.jerseySize));
    if(text(p.shortsSize))bits.push('nadrág '+text(p.shortsSize));
    if(text(p.displayName)&&text(p.displayName)!==text(p.name))bits.push('név: '+text(p.displayName));
    return bits;
  }
  function playerById_(playerId){return (state.players||[]).find(x=>text(x.playerId||x.id)===text(playerId))||null}
  function enrichPlayer_(raw){
    const p=raw||{},base=playerById_(p.playerId||p.id)||{};
    return {...base,...p,
      playerId:text(p.playerId||p.id||base.playerId||base.id),
      teamId:text(p.teamId||p.team_id||base.teamId||base.team_id),
      teamName:text(p.teamName||base.teamName),
      displayName:text(p.displayName||p.display_name||base.displayName||base.display_name),
      medicalValidUntil:p.medicalValidUntil||p.medical_valid_until||base.medicalValidUntil||base.medical_valid_until,
      jerseyNo:p.jerseyNo??p.jersey_no??base.jerseyNo??base.jersey_no,
      jerseySize:p.jerseySize||p.jersey_size||base.jerseySize||base.jersey_size,
      shortsSize:p.shortsSize||p.shorts_size||base.shortsSize||base.shorts_size,
      licenseNo:p.licenseNo||p.license_no||base.licenseNo||base.license_no,
      membershipStartsOn:p.membershipStartsOn||p.membership_starts_on||base.membershipStartsOn||base.membership_starts_on,
      position:p.position||base.position,
      name:p.name||base.name,
      email:p.email||base.email,
      avatarId:p.avatarId||p.avatar_id||base.avatarId||base.avatar_id
    }
  }
  function playerNameParts_(value){
    const parts=text(value).replace(/\s+/g,' ').trim().split(' ').filter(Boolean);
    if(!parts.length)return{surname:'–',given:''};
    if(parts.length===1)return{surname:parts[0],given:''};
    return{surname:parts.shift(),given:parts.join(' ')};
  }
  function playerMetaChipHtml_(p){
    const chips=[],medical=medicalState_(p.medicalValidUntil);
    if(p.medicalValidUntil)chips.push(`<i class="cc-player-chip medical ${esc(medical.cls)}">Lejár: ${esc(fmtDate(p.medicalValidUntil))}</i>`);
    if(text(p.position))chips.push(`<i class="cc-player-chip">${esc(p.position)}</i>`);
    if(text(p.jerseySize))chips.push(`<i class="cc-player-chip">mez ${esc(p.jerseySize)}</i>`);
    if(text(p.shortsSize))chips.push(`<i class="cc-player-chip">nadrág ${esc(p.shortsSize)}</i>`);
    if(text(p.displayName)&&text(p.displayName)!==text(p.name))chips.push(`<i class="cc-player-chip">név: ${esc(p.displayName)}</i>`);
    if(p.active===false)chips.push('<i class="cc-player-chip inactive">INAKTÍV</i>');
    return chips.join('');
  }
  function playerUnifiedCardHtml_(raw,opts={}){
    const p=enrichPlayer_(raw),team=playerTeam_(p),name=playerNameParts_(p.name||p.displayName),color=team?.color||'#b9b4aa';
    const openAttr=opts.openAttr||'data-player-open',actionHtml=text(opts.actionHtml),extraClass=text(opts.extraClass);
    const jersey=(p.jerseyNo!==null&&p.jerseyNo!==undefined&&text(p.jerseyNo)!=='')?esc(p.jerseyNo):'–';
    const teamName=p.teamName||team?.name||'Nincs aktív csapat';
    const memberSince=p.membershipStartsOn?`${fmtDate(p.membershipStartsOn)} óta`:'Nincs aktív tagság';
    const training=`${esc(p.trainingPresent??0)}/${esc(p.trainingMarked??0)} · ${esc(pctText(p.trainingPresent,p.trainingMarked))}`;
    const match=`${esc(p.matchPresent??0)}/${esc(p.matchMarked??0)} · ${esc(pctText(p.matchPresent,p.matchMarked))}`;
    return `<div class="cc-player-wide-card unified-person-card ${extraClass} ${p.active===false?'is-inactive':''}" role="button" tabindex="0" ${openAttr}="${esc(p.playerId)}" style="--player-team-color:${esc(color)}">
      <span class="cc-player-avatar-license">${avatarHtml(p,'table')}<small>${esc(p.licenseNo||'')}</small></span>
      <span class="cc-player-wide-main">
        <span class="cc-player-name-line"><b class="cc-player-jersey">${jersey}</b><strong>${esc(name.surname)}</strong>${name.given?`<em>${esc(name.given)}</em>`:''}</span>
        <span class="cc-player-wide-chips">${playerMetaChipHtml_(p)}</span>
      </span>
      <span class="cc-player-wide-team"><b>${esc(teamName)}</b><small>${esc(memberSince)}</small></span>
      <span class="cc-player-wide-stats"><span>Edzés <b>${training}</b></span><span>Meccs <b>${match}</b></span></span>
      ${actionHtml?`<span class="cc-player-wide-actions cc-rsvp-control">${actionHtml}</span>`:''}
      <i class="cc-player-wide-chevron" aria-hidden="true">›</i>
    </div>`;
  }
  function playerLegacyRow_(p){return playerUnifiedCardHtml_(p,{openAttr:'data-player-open'})}
  function bindUnifiedPlayerCards_(root=document){
    Array.from(root.querySelectorAll('[data-player-open]')).forEach(card=>{
      if(card.dataset.playerCardBound==='1')return;card.dataset.playerCardBound='1';
      const open=ev=>{if(ev?.target?.closest?.('input,select,button,label,a,.cc-rsvp-control,.roster-action-field'))return;openPlayerDetail(card.dataset.playerOpen)};
      card.addEventListener('click',open);
      card.addEventListener('keydown',ev=>{if((ev.key==='Enter'||ev.key===' ')&&!ev.target.closest('input,select,button,label,a,.cc-rsvp-control,.roster-action-field')){ev.preventDefault();openPlayerDetail(card.dataset.playerOpen)}});
    });
  }
  function playerGroupedListHtml_(rows){
    if(state.playerListMode!=='grouped')return `<div class="legacy-player-list cc-unified-player-list">${rows.map(playerLegacyRow_).join('')||emptyInline('Nincs a szűrésnek megfelelő játékos.')}</div>`;
    const selected=teamFilterIds_('players'),teamOrder=(state.teams||[]).filter(t=>t.active!==false&&(!selected.length||selected.includes(text(t.id))));
    const groups=teamOrder.map(t=>({team:t,rows:rows.filter(p=>text(p.teamId||p.team_id)===text(t.id))}));
    const unassigned=rows.filter(p=>!text(p.teamId||p.team_id));
    if(unassigned.length)groups.push({team:{id:'',name:'Nincs aktív csapat',color:'#b9b4aa'},rows:unassigned});
    return `<div class="cc-player-team-groups">${groups.map(g=>`<section class="cc-player-team-group" style="--group-team-color:${esc(g.team.color||'#b9b4aa')}"><div class="cc-player-team-group-head"><span></span><div><h3>${esc(g.team.name)}</h3><small>Névsor · vezetéknév szerint</small></div><b>${g.rows.length} fő</b></div><div class="cc-unified-player-list">${g.rows.map(playerLegacyRow_).join('')||emptyInline('Nincs a szűrésnek megfelelő játékos ebben a csapatban.')}</div></section>`).join('')||emptyInline('Nincs a szűrésnek megfelelő játékos.')}</div>`;
  }
  function playerTeamTabs_(){
    const all=`<button class="legacy-player-team-tab ${state.playerTeam?'':'active'}" type="button" data-player-team="">Mind</button>`;
    return all+state.teams.filter(t=>t.active!==false).map(t=>`<button class="legacy-player-team-tab ${text(state.playerTeam)===text(t.id)?'active':''}" style="--tab-team-color:${esc(t.color||'#f7b700')}" type="button" data-player-team="${esc(t.id)}">${esc(t.name)}</button>`).join('');
  }
  function bindPlayerListActions_(){
    const input=$('#playerSearch');let timer;
    input?.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{state.playerSearch=input.value;renderPlayers()},150)});
    bindTeamMultiFilter_('players',renderPlayers);
    $('#playerMedicalFilter')?.addEventListener('change',e=>{state.playerMedical=e.target.value;afterNativePicker(e.target,renderPlayers)});
    $('#playerListMode')?.addEventListener('change',e=>{state.playerListMode=e.target.value==='grouped'?'grouped':'all';try{localStorage.setItem('cc-manager-player-list-mode',state.playerListMode)}catch(_){};afterNativePicker(e.target,renderPlayers)});
    $('#playerSort')?.addEventListener('change',e=>{state.playerSort=e.target.value||'name';try{localStorage.setItem('cc-manager-player-sort',state.playerSort)}catch(_){};afterNativePicker(e.target,renderPlayers)});
    $('#playerSortDir')?.addEventListener('change',e=>{state.playerSortDir=e.target.value==='desc'?'desc':'asc';try{localStorage.setItem('cc-manager-player-sort-dir',state.playerSortDir)}catch(_){};afterNativePicker(e.target,renderPlayers)});
    $('#playerFilterReset')?.addEventListener('click',()=>{state.playerTeam='';state.teamFilters.players=[];state.playerSearch='';state.playerMedical='all';state.playerSort='name';state.playerSortDir='asc';renderPlayers()});
    const toggle=$('#playerFiltersToggle'),panel=$('#playerFiltersPanel');if(toggle)toggle.classList.toggle('open',state.playerFiltersOpen);
    toggle?.addEventListener('click',()=>{const open=setFilterOpen_('competition.players',!state.playerFiltersOpen);state.playerFiltersOpen=open;toggle.setAttribute('aria-expanded',String(open));toggle.classList.toggle('open',open);if(panel)panel.hidden=!open;ccBlurPointerControl_(toggle)});
    bindUnifiedPlayerCards_($('#viewContent')||document);
  }
  function renderPlayers(){
    state.playerFiltersOpen=filterOpen_('competition.players',state.playerFiltersOpen);
    if(!['all','grouped'].includes(state.playerListMode)){try{state.playerListMode=localStorage.getItem('cc-manager-player-list-mode')==='grouped'?'grouped':'all'}catch(_){state.playerListMode='all'}}
    const rows=playerRows(),active=teamFilterIds_('players').length>0||!!state.playerSearch||state.playerMedical!=='all',canEdit=canAnyAction('competition.players','edit');
    $('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Játékosok</h2><p>Egységes névsor · vezetéknév szerinti magyar ABC · csapatonként vagy összesítve.</p></div><div class="filter-head-actions"><button class="matrix-filter-toggle ${state.playerFiltersOpen?'open':''} ${active?'has-filter':''}" id="playerFiltersToggle" aria-expanded="${state.playerFiltersOpen?'true':'false'}" type="button"><span class="triangle-icon"></span>Szűrők</button>${active?'<button class="filter-reset" id="playerFilterReset" type="button">Szűrők törlése</button>':''}${canEdit?'':'<span class="read-only-badge">MEGTEKINTÉS</span>'}</div></div>
      <div class="filter-panel legacy-player-toolbar cc-player-filter-toolbar" id="playerFiltersPanel" ${state.playerFiltersOpen?'':'hidden'}>
        <input id="playerSearch" class="legacy-player-search" type="search" value="${esc(state.playerSearch)}" placeholder="Keresés név, email, igazolási szám, poszt vagy mezszám alapján…" autocomplete="off">
        <div class="legacy-player-team-tabs multi" aria-label="Csapatszűrő">${teamMultiFilterHtml_('players')}</div>
        <label class="field compact"><span>Nézet</span><select id="playerListMode"><option value="all" ${state.playerListMode==='all'?'selected':''}>Összesített lista</option><option value="grouped" ${state.playerListMode==='grouped'?'selected':''}>Csapatonként</option></select></label>
        <label class="field compact"><span>Rendezés</span><select id="playerSort"><option value="name" ${state.playerSort==='name'?'selected':''}>Név</option><option value="jersey" ${state.playerSort==='jersey'?'selected':''}>Mezszám</option><option value="position" ${state.playerSort==='position'?'selected':''}>Poszt</option><option value="trainingPct" ${state.playerSort==='trainingPct'?'selected':''}>Edzés részvétel %</option><option value="matchPct" ${state.playerSort==='matchPct'?'selected':''}>Meccs részvétel %</option><option value="overallPct" ${state.playerSort==='overallPct'?'selected':''}>Összes részvétel %</option><option value="trainingCount" ${state.playerSort==='trainingCount'?'selected':''}>Edzés jelenlét db</option><option value="matchCount" ${state.playerSort==='matchCount'?'selected':''}>Meccs jelenlét db</option><option value="medical" ${state.playerSort==='medical'?'selected':''}>Sportorvosi lejárat</option><option value="memberSince" ${state.playerSort==='memberSince'?'selected':''}>Tagság kezdete</option></select></label>
        <label class="field compact"><span>Sorrend</span><select id="playerSortDir"><option value="asc" ${state.playerSortDir==='asc'?'selected':''}>Növekvő</option><option value="desc" ${state.playerSortDir==='desc'?'selected':''}>Csökkenő</option></select></label>
        <label class="field compact"><span>Sportorvosi</span><select id="playerMedicalFilter"><option value="all" ${state.playerMedical==='all'?'selected':''}>Minden állapot</option><option value="valid" ${state.playerMedical==='valid'?'selected':''}>Érvényes</option><option value="expiring" ${state.playerMedical==='expiring'?'selected':''}>30 napon belül lejár</option><option value="expired" ${state.playerMedical==='expired'?'selected':''}>Lejárt</option><option value="missing" ${state.playerMedical==='missing'?'selected':''}>Nincs adat</option></select></label>
      </div>
      <article class="panel legacy-player-surface cc-player-directory-surface"><div class="legacy-player-summary"><span><b>${rows.length}</b> játékos</span><span>${state.playerListMode==='grouped'?'Csapatonkénti névsor':'Összesített lista'} · A–Z</span></div>${playerGroupedListHtml_(rows)}</article>`;
    bindPlayerListActions_();
  }
  function playerOverviewHtml_(p){
    return `<div class="entity-hero">${avatarHtml(p,'large')}<div><b>${esc(p.name||p.displayName||'Játékos')}</b><span>${esc(p.teamName||'Nincs aktív csapat')}${p.position?' · '+esc(p.position):''}${p.jerseyNo!=null?' · #'+esc(p.jerseyNo):''}</span></div></div>
      <div class="detail-grid">${detailPair('Megjelenési név',p.displayName||'–')}${detailPair('Email',p.email)}${detailPair('Igazolási szám',p.licenseNo)}${detailPair('Sportorvosi',p.medicalValidUntil?fmtDate(p.medicalValidUntil):'–')}${detailPair('Tagság kezdete',p.membershipStartsOn?fmtDate(p.membershipStartsOn):'–')}${detailPair('Mezméret',p.jerseySize)}${detailPair('Nadrágméret',p.shortsSize)}${detailPair('Fiók',p.hasAccount?'Aktív':'Nincs összekapcsolva')}${detailPair('Státusz',p.active===false?'Inaktív':'Aktív')}</div>
      <div class="attendance-detail"><div><small>Edzésjelenlét</small><b>${esc(p.trainingPresent??0)}/${esc(p.trainingMarked??0)}</b><span>${esc(pctText(p.trainingPresent,p.trainingMarked))}</span></div><div><small>Meccsjelenlét</small><b>${esc(p.matchPresent??0)}/${esc(p.matchMarked??0)}</b><span>${esc(pctText(p.matchPresent,p.matchMarked))}</span></div></div>`;
  }
  function positionOptions_(value){
    const values=['Feladó','Átló','4-es ütő','Szélső','Liberó','Center'];
    if(text(value)&&!values.includes(text(value)))values.unshift(text(value));
    return '<option value="">Nincs megadva</option>'+values.map(v=>`<option value="${esc(v)}" ${text(value)===v?'selected':''}>${esc(v)}</option>`).join('');
  }
  function sizeOptions_(value){
    const values=['XS','S','M','L','XL','XXL','XXXL'];
    if(text(value)&&!values.includes(text(value).toUpperCase()))values.unshift(text(value));
    return '<option value="">Nincs megadva</option>'+values.map(v=>`<option value="${esc(v)}" ${text(value).toUpperCase()===String(v).toUpperCase()?'selected':''}>${esc(v)}</option>`).join('');
  }
  function playerEditHtml_(p){
    return `<form class="manager-player-edit-form" id="managerPlayerEditForm">
        <label class="full"><span>Teljes név</span><input id="editPlayerName" value="${esc(p.name||'')}" autocomplete="off" required></label>
        <label><span>Megjelenési név</span><input id="editPlayerDisplayName" value="${esc(p.displayName||'')}" autocomplete="off"></label>
        <label><span>Email</span><input value="${esc(p.email||'')}" disabled><small>Az Auth-fiók miatt itt most nem módosítható.</small></label>
        <label><span>Poszt</span><select id="editPlayerPosition">${positionOptions_(p.position)}</select></label>
        <label><span>Mezszám</span><input id="editPlayerJerseyNo" inputmode="numeric" value="${esc(p.jerseyNo??'')}"></label>
        <label><span>Igazolási szám</span><input id="editPlayerLicenseNo" value="${esc(p.licenseNo||'')}"></label>
        <label><span>Sportorvosi érvényes</span><input id="editPlayerMedical" type="date" value="${esc(text(p.medicalValidUntil).slice(0,10))}"><small>Csak kézi Mentés írja ezt az adatot.</small></label>
        <label><span>Mezméret</span><select id="editPlayerJerseySize">${sizeOptions_(p.jerseySize)}</select></label>
        <label><span>Nadrágméret</span><select id="editPlayerShortsSize">${sizeOptions_(p.shortsSize)}</select></label>
        <div class="manager-player-form-actions full"><button class="button" type="button" data-player-jump="overview">Mégse</button><button class="button primary" id="savePlayerEditBtn" type="submit">Mentés</button></div>
      </form>`;
  }
  function isTestPlayer_(p){
    const marker=[p?.name,p?.displayName,p?.display_name,p?.email].map(text).filter(Boolean).join(' ').toLocaleLowerCase('hu-HU');
    return /(^|[^a-záéíóöőúüű])(teszt|test)([^a-záéíóöőúüű]|$)/i.test(marker);
  }
  function playerTransferHtml_(p){
    const options=state.teams.filter(t=>t.active!==false&&text(t.id)!==text(p.teamId||p.team_id)).map(t=>`<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('');
    const testPlayer=isTestPlayer_(p);
    return `<div class="manager-player-transfer-head"><small>Jelenlegi csapat</small><b>${esc(p.teamName||'Nincs aktív csapat')}</b></div>
      <form class="manager-player-edit-form" id="managerPlayerTransferForm">
        <label class="full"><span>Új csapat</span><select id="transferPlayerTeam" required><option value="">Válassz…</option>${options}</select></label>
        ${testPlayer?'':`<label class="full"><span>Csapatváltás dátuma</span><input id="transferPlayerDate" type="date" value="${esc(localDateKey(new Date()))}" required></label>`}
        <div class="manager-player-form-note full">${testPlayer?'Tesztjátékos: az áthelyezés azonnali. Nem hoz létre új dátumos tagsági sort, ezért ugyanazon a napon korlátlanul mozgatható a csapatok között.':'A korábbi aktív csapattagság a váltást megelőző nappal lezárul. A művelet nem küld automatikus emailt vagy push értesítést.'}</div>
        <div class="manager-player-form-actions full"><button class="button" type="button" data-player-jump="overview">Mégse</button><button class="button primary" type="submit">${testPlayer?'Azonnali áthelyezés':'Csapatváltás mentése'}</button></div>
      </form>`;
  }
  function playerAvatarHtml_(p){
    const current=text(p.avatarId||p.avatar_id);
    return `<div class="avatar-editor-head"><div>${avatarHtml(p,'large')}<div><b>Player avatar</b><small>Ugyanaz a canonical avatar_id és sprite, mint a Playerben. Üres választás = monogram.</small></div></div></div><div class="avatar-picker" role="radiogroup" aria-label="Avatar választás"><button class="avatar-choice ${current?'':'selected'}" type="button" data-avatar-id=""><span class="cc-avatar large monogram">${esc(initials(p.name||p.displayName||''))}</span><small>Monogram</small></button>${PLAYER_AVATAR_IDS.map(id=>{const taken=(state.players||[]).some(other=>text(other.playerId)!==text(p.playerId)&&text(other.teamId||other.team_id)===text(p.teamId||p.team_id)&&text(other.avatarId||other.avatar_id)===id);return `<button class="avatar-choice ${current===id?'selected':''} ${taken?'taken':''}" type="button" data-avatar-id="${esc(id)}" ${taken?'disabled title="Foglalt ebben a csapatban"':''}>${avatarHtml({avatarId:id,name:p.name},'large')}<small>${id==='alpaca'?'Alpaka':esc(id.replace(/^extra_/,'').replaceAll('_',' '))}</small></button>`}).join('')}</div><div class="manager-player-form-actions"><button class="button primary" id="savePlayerAvatarBtn" type="button">Avatar mentése</button></div>`;
  }
  function playerDetailCarousel_(p){
    const editable=canAnyAction('competition.players','edit');
    const panes=[['overview','Áttekintés',playerOverviewHtml_(p)]];
    if(editable){panes.push(['edit','Szerkesztés',playerEditHtml_(p)],['transfer','Csapatváltás',playerTransferHtml_(p)],['avatar','Avatar',playerAvatarHtml_(p)])}
    return `<div class="player-detail-tabs">${panes.map((x,i)=>`<button class="${i===0?'active':''}" type="button" data-player-carousel-tab="${x[0]}">${x[1]}</button>`).join('')}</div><div class="player-detail-carousel" id="playerDetailCarousel">${panes.map(x=>`<section class="player-detail-pane" data-player-pane="${x[0]}">${x[2]}</section>`).join('')}</div>`;
  }
  function bindPlayerDetail_(p){
    const carousel=$('#playerDetailCarousel'),tabs=$$('[data-player-carousel-tab]');
    const activate=name=>{tabs.forEach(b=>b.classList.toggle('active',b.dataset.playerCarouselTab===name))};
    tabs.forEach(b=>b.addEventListener('click',()=>{const pane=$(`[data-player-pane="${b.dataset.playerCarouselTab}"]`);if(pane&&carousel)carousel.scrollTo({left:pane.offsetLeft,behavior:'smooth'});activate(b.dataset.playerCarouselTab)}));
    $$('[data-player-jump]').forEach(b=>b.addEventListener('click',()=>{const pane=$(`[data-player-pane="${b.dataset.playerJump}"]`);if(pane&&carousel)carousel.scrollTo({left:pane.offsetLeft,behavior:'smooth'});activate(b.dataset.playerJump)}));
    let scrollTimer;carousel?.addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{const panes=$$('.player-detail-pane');if(!panes.length)return;let best=panes[0],dist=Infinity;panes.forEach(x=>{const d=Math.abs(x.offsetLeft-(carousel.scrollLeft||0));if(d<dist){dist=d;best=x}});activate(best.dataset.playerPane)},90)},{passive:true});
    $('#managerPlayerEditForm')?.addEventListener('submit',async e=>{e.preventDefault();await savePlayerEdit_(p)});
    $('#managerPlayerTransferForm')?.addEventListener('submit',async e=>{e.preventDefault();await savePlayerTransfer_(p)});
    let selectedAvatar=text(p.avatarId||p.avatar_id);$$('[data-avatar-id]').forEach(b=>b.addEventListener('click',()=>{selectedAvatar=text(b.dataset.avatarId);$$('[data-avatar-id]').forEach(x=>x.classList.toggle('selected',x===b))}));
    $('#savePlayerAvatarBtn')?.addEventListener('click',async()=>{if(!canAnyAction('competition.players','edit'))return;const btn=$('#savePlayerAvatarBtn');if(btn)btn.disabled=true;try{status('Avatar mentése…');await rpc('cc_manager_player_avatar_update_v1',{p_player_id:p.playerId,p_avatar_id:selectedAvatar||null});await loadPlayers();renderPlayers();openPlayerDetail(p.playerId);status('Avatar mentve.','success')}catch(err){console.error(err);status(err.message||'Az avatar mentése sikertelen.','error');if(btn)btn.disabled=false}});
  }
  async function savePlayerEdit_(p){
    if(!canAnyAction('competition.players','edit'))return;
    const btn=$('#savePlayerEditBtn');if(btn)btn.disabled=true;
    const payload={playerId:p.playerId,name:text($('#editPlayerName')?.value),displayName:text($('#editPlayerDisplayName')?.value),email:text(p.email),position:text($('#editPlayerPosition')?.value),jerseyNo:text($('#editPlayerJerseyNo')?.value),licenseNo:text($('#editPlayerLicenseNo')?.value),medicalValidUntil:text($('#editPlayerMedical')?.value),jerseySize:text($('#editPlayerJerseySize')?.value),shortsSize:text($('#editPlayerShortsSize')?.value)};
    if(!payload.name){status('A teljes név kötelező.','error');if(btn)btn.disabled=false;return}
    if(payload.jerseyNo&&!/^\d+$/.test(payload.jerseyNo)){status('A mezszám csak szám lehet.','error');if(btn)btn.disabled=false;return}
    try{status('Játékos mentése…');await rpc('cc_manager_player_update_v1',{p_payload:payload});await loadPlayers();renderPlayers();openPlayerDetail(p.playerId);status('Játékos adatai mentve.','success')}catch(err){console.error(err);status(err.message||'A játékos mentése sikertelen.','error');if(btn)btn.disabled=false}
  }
  async function savePlayerTransfer_(p){
    if(!canAnyAction('competition.players','edit'))return;
    const teamId=text($('#transferPlayerTeam')?.value);
    if(!teamId){status('Válassz csapatot.','error');return}
    const testPlayer=isTestPlayer_(p);
    const date=text($('#transferPlayerDate')?.value);
    if(!testPlayer&&!date){status('Válassz csapatot és dátumot.','error');return}
    try{
      status(testPlayer?'Tesztjátékos áthelyezése…':'Csapatváltás mentése…');
      if(testPlayer){
        await rpc('cc_manager_test_player_reassign_v1',{p_player_id:p.playerId,p_team_id:teamId});
      }else{
        await rpc('cc_manager_player_transfer_v1',{p_player_id:p.playerId,p_team_id:teamId,p_starts_on:date});
      }
      await Promise.all([loadPlayers(),loadTeams()]);renderPlayers();openPlayerDetail(p.playerId);
      status(testPlayer?'Tesztjátékos áthelyezve.':'Csapatváltás mentve.','success');
    }catch(err){console.error(err);status(err.message||(testPlayer?'A tesztjátékos áthelyezése sikertelen.':'A csapatváltás mentése sikertelen.'),'error')}
  }
  function openPlayerDetail(id){
    const p=playerById(id);if(!p)return;state.selectedPlayer=id;
    const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='VERSENYSPORT · JÁTÉKOS';title.textContent=p.name||p.displayName||'Játékos';
    body.innerHTML=playerDetailCarousel_(p);bindPlayerDetail_(p);ccOpenDialogStable_(d);
  }

  function startOfWeek(d){const x=new Date(d);x.setHours(0,0,0,0);const day=(x.getDay()+6)%7;x.setDate(x.getDate()-day);return x}
  function calendarWindow(){const a=new Date(state.calendarAnchor);a.setHours(0,0,0,0);if(state.calendarMode==='day'){const to=new Date(a);to.setDate(to.getDate()+1);return{from:a,to}}if(state.calendarMode==='month'){return{from:new Date(a.getFullYear(),a.getMonth(),1),to:new Date(a.getFullYear(),a.getMonth()+1,1)}}if(state.calendarMode==='season'){const y=a.getMonth()>=7?a.getFullYear():a.getFullYear()-1;return{from:new Date(y,7,1),to:new Date(y+1,7,1)}}const from=startOfWeek(a),to=new Date(from);to.setDate(to.getDate()+7);return{from,to}}
  function calendarRangeText(){const {from,to}=calendarWindow(),end=new Date(to.getTime()-1);return state.calendarMode==='day'?fmtDate(from):`${fmtDate(from)} – ${fmtDate(end)}`}
  function calendarFiltered(){return effectiveCompetitionEvents(state.calendarEvents).filter(e=>(!state.calendarTeam||eventTeamId(e)===state.calendarTeam)&&(!state.calendarType||eventType(e)===state.calendarType)).sort((a,b)=>eventStart(a)-eventStart(b))}
  function agendaHtml(rows){const groups=new Map();rows.forEach(e=>{const d=eventStart(e);if(!d)return;const k=localDateKey(d);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(e)});return groups.size?Array.from(groups.entries()).map(([key,items])=>`<div class="calendar-day"><div class="calendar-date">${esc(fmtDay(key+'T12:00:00Z'))}</div><div class="calendar-events">${items.map(e=>`<div class="calendar-event ${isEventPast(e)?'past':''}" style="--event-color:${esc(calendarTeamColor(e))}"><time>${esc(fmtTime(eventStart(e)))}</time><span class="dot" style="background:${esc(e.color||'#f7b700')}"></span><div><strong>${esc(e.title||((eventType(e)==='match')?'Meccs':'Edzés'))}</strong><small>${esc(e.teamName||'')} · ${esc(eventPlace(e))}</small>${rsvpPills(e)}</div><span class="event-kind">${eventType(e)==='match'?'MECCS':'EDZÉS'}</span></div>`).join('')}</div></div>`).join(''):emptyInline('Ebben az időszakban nincs esemény.')}
  function monthGridHtml_(rows,{mass=false}={}){
    const a=new Date(state.calendarAnchor),y=a.getFullYear(),m=a.getMonth(),first=new Date(y,m,1),last=new Date(y,m+1,0),offset=(first.getDay()+6)%7,cells=[...Array(offset).fill(null)];for(let d=1;d<=last.getDate();d++)cells.push(new Date(y,m,d));while(cells.length%7)cells.push(null);
    const byDay=new Map();rows.forEach(e=>{const k=localDateKey(eventStart(e));if(k){if(!byDay.has(k))byDay.set(k,[]);byDay.get(k).push(e)}});const today=localDateKey(new Date());
    return `<div class="player-month-shell"><div class="player-month-head"><button class="player-month-nav" type="button" data-month-nav="-1">‹</button><h4>${esc(a.toLocaleDateString('hu-HU',{year:'numeric',month:'long'}))}</h4><button class="player-month-nav" type="button" data-month-nav="1">›</button></div><div class="player-month-weekdays">${['H','K','Sze','Cs','P','Szo','V'].map(x=>`<span>${x}</span>`).join('')}</div><div class="player-month-grid">${cells.map(d=>{if(!d)return'<div class="player-month-day empty"></div>';const key=localDateKey(d),items=byDay.get(key)||[];return `<button class="player-month-day ${items.length?'has-events':''} ${key===today?'today':''}" type="button" data-calendar-day="${key}"><span class="player-month-day-no">${d.getDate()}</span><span class="player-month-events">${items.slice(0,4).map(e=>`<span class="player-month-event" style="--event-color:${esc(mass?(e.color||massLevelColor(e)):calendarTeamColor(e))}"><b>${esc(fmtTime(eventStart(e)))}</b><em>${esc(mass?(e.level||'Edzés'):(e.teamName||teamById(eventTeamId(e))?.name||''))}</em></span>`).join('')}${items.length>4?`<small>+${items.length-4}</small>`:''}</span></button>`}).join('')}</div></div>`;
  }
  function calendarLocalMinutes(v){const d=safeDate(v);if(!d)return 0;const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Budapest',hour:'2-digit',minute:'2-digit',hour12:false}).format(d).split(':');return Number(parts[0])*60+Number(parts[1])}
  function calendarTeamColor(e){return text(e.color)||teamById(eventTeamId(e))?.color||'#f7b700'}
  function calendarDayLayout(dayEvents,startMin,endMin){
    const items=dayEvents.map(e=>{const s=eventStart(e),en=eventEnd(e),start=Math.max(startMin,calendarLocalMinutes(s)),rawEnd=en&&en>s?calendarLocalMinutes(en):calendarLocalMinutes(s)+120,end=Math.min(endMin,Math.max(start+30,rawEnd));return{e,start,end,lane:0,lanes:1}}).filter(x=>x.end>startMin&&x.start<endMin).sort((a,b)=>a.start-b.start||a.end-b.end);
    const laneEnds=[];items.forEach(item=>{let lane=laneEnds.findIndex(x=>x<=item.start);if(lane<0)lane=laneEnds.length;item.lane=lane;laneEnds[lane]=item.end});
    items.forEach(item=>{const overlaps=items.filter(other=>other.start<item.end&&other.end>item.start);item.lanes=Math.max(1,...overlaps.map(x=>x.lane+1))});
    return items
  }
  function weekGridHtml(rows){
    const from=startOfWeek(state.calendarAnchor),days=Array.from({length:7},(_,i)=>{const d=new Date(from);d.setDate(d.getDate()+i);return d}),startMin=17*60+30,endMin=22*60+30,pxPerMin=1.18,totalHeight=(endMin-startMin)*pxPerMin,slots=[];
    for(let m=startMin;m<=endMin;m+=30)slots.push({m,label:`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`});
    const today=localDateKey(new Date());
    return `<div class="legacy-week-shell"><div class="legacy-week-header"><div class="legacy-week-corner"></div>${days.map(d=>{const key=localDateKey(d),isToday=key===today;return `<button class="legacy-week-day ${isToday?'today':''}" type="button" data-calendar-day="${esc(key)}"><b>${esc(new Intl.DateTimeFormat('hu-HU',{weekday:'short',timeZone:'Europe/Budapest'}).format(d))}</b><span>${esc(new Intl.DateTimeFormat('hu-HU',{month:'2-digit',day:'2-digit',timeZone:'Europe/Budapest'}).format(d))}</span></button>`}).join('')}</div><div class="legacy-week-scroll"><div class="legacy-week-body" style="--week-height:${totalHeight}px"><div class="legacy-time-axis">${slots.map(x=>`<span style="top:${(x.m-startMin)*pxPerMin}px">${x.label}</span>`).join('')}</div>${days.map(d=>{const key=localDateKey(d),dayRows=rows.filter(e=>localDateKey(eventStart(e))===key),layout=calendarDayLayout(dayRows,startMin,endMin);return `<div class="legacy-day-column ${key===today?'today':''}">${slots.slice(0,-1).map(x=>`<i style="top:${(x.m-startMin)*pxPerMin}px"></i>`).join('')}${layout.map(item=>{const e=item.e,color=calendarTeamColor(e),top=(item.start-startMin)*pxPerMin,height=Math.max(30,(item.end-item.start)*pxPerMin-3),left=(item.lane/item.lanes)*100,width=100/item.lanes;return `<button class="legacy-calendar-event ${eventType(e)==='match'?'match':''} ${isEventPast(e)?'past':''}" type="button" data-event-id="${esc(e.eventId||e.id)}" style="--event-color:${esc(color)};top:${top}px;height:${height}px;left:calc(${left}% + 2px);width:calc(${width}% - 4px)" title="${esc(e.title||'Esemény')}"><b>${esc(fmtTime(eventStart(e)))}</b><strong>${esc(e.teamName||teamById(eventTeamId(e))?.name||'')}</strong><span>${esc(e.title||(eventType(e)==='match'?'Meccs':'Edzés'))}</span><small>${esc(eventPlace(e))}</small></button>`}).join('')}</div>`}).join('')}</div></div></div>`
  }

  function massCalendarFiltered_(){return (state.massCalendarEvents||[]).filter(e=>(!state.massCalendarLevel||text(e.level)===state.massCalendarLevel)&&(!state.massCalendarSession||text(e.sessionType)===state.massCalendarSession)).sort((a,b)=>eventStart(a)-eventStart(b))}
  function massAgendaHtml_(rows){const groups=new Map();rows.forEach(e=>{const d=eventStart(e);if(!d)return;const k=localDateKey(d);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(e)});return groups.size?Array.from(groups.entries()).map(([key,items])=>`<div class="calendar-day"><div class="calendar-date">${esc(fmtDay(key+'T12:00:00Z'))}</div><div class="calendar-events">${items.map(e=>`<button class="calendar-event mass-calendar-event ${e.active===false?'past':''}" type="button" data-mass-detail="${esc(e.eventId)}" style="--event-color:${esc(e.color||massLevelColor(e))}"><time>${esc(fmtTime(eventStart(e)))}</time><span class="dot" style="background:${esc(e.color||massLevelColor(e))}"></span><div><strong>${esc(e.level||'Edzés')}</strong><small>${esc(e.court||'Pálya –')} · ${esc(e.sessionType||'TÖMEGSPORT')} · ${num(e.totalActive)} fő${num(e.waitlistCount)?` · ${num(e.waitlistCount)} váró`:''}</small></div><span class="event-kind">${e.active===false?'INAKTÍV':'EDZÉS'}</span></button>`).join('')}</div></div>`).join(''):emptyInline('Ebben az időszakban nincs Tömegsport esemény.')}
  function massWeekGridHtml_(rows){const from=startOfWeek(state.calendarAnchor),days=Array.from({length:7},(_,i)=>{const d=new Date(from);d.setDate(d.getDate()+i);return d}),startMin=17*60+30,endMin=22*60+30,pxPerMin=1.18,totalHeight=(endMin-startMin)*pxPerMin,slots=[];for(let m=startMin;m<=endMin;m+=30)slots.push({m,label:`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`});const today=localDateKey(new Date());return `<div class="legacy-week-shell"><div class="legacy-week-header"><div class="legacy-week-corner"></div>${days.map(d=>{const key=localDateKey(d);return `<button class="legacy-week-day ${key===today?'today':''}" type="button" data-calendar-day="${esc(key)}"><b>${esc(new Intl.DateTimeFormat('hu-HU',{weekday:'short',timeZone:'Europe/Budapest'}).format(d))}</b><span>${esc(new Intl.DateTimeFormat('hu-HU',{month:'2-digit',day:'2-digit',timeZone:'Europe/Budapest'}).format(d))}</span></button>`}).join('')}</div><div class="legacy-week-scroll"><div class="legacy-week-body" style="--week-height:${totalHeight}px"><div class="legacy-time-axis">${slots.map(x=>`<span style="top:${(x.m-startMin)*pxPerMin}px">${x.label}</span>`).join('')}</div>${days.map(d=>{const key=localDateKey(d),dayRows=rows.filter(e=>localDateKey(eventStart(e))===key),layout=calendarDayLayout(dayRows,startMin,endMin);return `<div class="legacy-day-column ${key===today?'today':''}">${slots.slice(0,-1).map(x=>`<i style="top:${(x.m-startMin)*pxPerMin}px"></i>`).join('')}${layout.map(item=>{const e=item.e,color=e.color||massLevelColor(e),top=(item.start-startMin)*pxPerMin,height=Math.max(30,(item.end-item.start)*pxPerMin-3),left=(item.lane/item.lanes)*100,width=100/item.lanes;return `<button class="legacy-calendar-event ${e.active===false?'past':''}" type="button" data-mass-detail="${esc(e.eventId)}" style="--event-color:${esc(color)};top:${top}px;height:${height}px;left:calc(${left}% + 2px);width:calc(${width}% - 4px)"><b>${esc(fmtTime(eventStart(e)))}</b><strong>${esc(e.level||'Edzés')}</strong><span>${esc(e.sessionType||'TÖMEGSPORT')}</span><small>${esc(e.court||'Pálya –')} · ${num(e.totalActive)} fő</small></button>`}).join('')}</div>`}).join('')}</div></div></div>`}
  function renderMassCalendar(){state.massCalendarFiltersOpen=filterOpen_('mass.calendar',state.massCalendarFiltersOpen);const rows=massCalendarFiltered_(),levels=Array.from(new Set((state.massCalendarEvents||[]).map(e=>text(e.level)).filter(Boolean))).sort((a,b)=>HU_NAME_COLLATOR.compare(a,b)),sessions=Array.from(new Set((state.massCalendarEvents||[]).map(e=>text(e.sessionType)).filter(Boolean))).sort(),active=!!state.massCalendarLevel||!!state.massCalendarSession;$('#viewContent').innerHTML=`<div class="page-intro legacy-calendar-intro"><div><h2>Naptár</h2><p>Tömegsport és SPORT7 alkalmak a canonical Supabase naptárból.</p></div><div class="toolbar-actions"><div class="segmented calendar-modes"><button class="${state.calendarMode==='day'?'active':''}" data-calendar-mode="day">NAP</button><button class="${state.calendarMode==='week'?'active':''}" data-calendar-mode="week">HÉT</button><button class="${state.calendarMode==='month'?'active':''}" data-calendar-mode="month">HÓNAP</button><button class="${state.calendarMode==='season'?'active':''}" data-calendar-mode="season">SZEZON</button></div><div class="filter-head-actions"><button class="icon-button filter-toggle ${state.massCalendarFiltersOpen?'open':''} ${active?'has-filter':''}" id="massCalendarFilterBtn" type="button" aria-label="Szűrők" aria-expanded="${state.massCalendarFiltersOpen?'true':'false'}"><span class="triangle-icon"></span></button>${active?'<button class="filter-reset" id="massCalendarFilterReset" type="button">Szűrők törlése</button>':''}</div></div></div><div class="filter-panel calendar-player-filter" id="massCalendarFilterPanel" ${state.massCalendarFiltersOpen?'':'hidden'}><label class="field compact"><span>Szint</span><select id="massCalendarLevel"><option value="">Minden szint</option>${levels.map(x=>`<option value="${esc(x)}" ${x===state.massCalendarLevel?'selected':''}>${esc(x)}</option>`).join('')}</select></label><label class="field compact"><span>Típus</span><select id="massCalendarSession"><option value="">Minden típus</option>${sessions.map(x=>`<option value="${esc(x)}" ${x===state.massCalendarSession?'selected':''}>${esc(x)}</option>`).join('')}</select></label></div><article class="panel calendar-panel legacy-calendar-panel ${state.calendarMode==='month'?'player-month-parity-panel':''}">${state.calendarMode==='month'?'':`<div class="legacy-calendar-nav"><div class="legacy-calendar-nav-buttons"><button class="button quiet square" id="calendarPrev" type="button">←</button><button class="button quiet" id="calendarToday" type="button">Mai napra</button><button class="button quiet square" id="calendarNext" type="button">→</button><button class="button quiet" id="calendarRefresh" type="button">↻ Frissítés</button></div><strong>${esc(calendarRangeText())}</strong><div class="calendar-team-legend">${levels.map(x=>`<span><i style="background:${esc(massLevelColor({level:x}))}"></i>${esc(x)}</span>`).join('')}</div></div>`}<div class="desktop-week-grid">${state.calendarMode==='week'?massWeekGridHtml_(rows):state.calendarMode==='month'?monthGridHtml_(rows,{mass:true}):massAgendaHtml_(rows)}</div><div class="mobile-calendar-agenda">${state.calendarMode==='month'?monthGridHtml_(rows,{mass:true}):massAgendaHtml_(rows)}</div></article>`;bindMassCalendarUi_();bindMassLegacyRows()}
  function bindMassCalendarUi_(){const b=$('#massCalendarFilterBtn'),panel=$('#massCalendarFilterPanel');b?.addEventListener('click',()=>{const open=setFilterOpen_('mass.calendar',!state.massCalendarFiltersOpen);state.massCalendarFiltersOpen=open;b.setAttribute('aria-expanded',String(open));b.classList.toggle('open',open);if(panel)panel.hidden=!open;ccBlurPointerControl_(b)});$('#massCalendarLevel')?.addEventListener('change',e=>{state.massCalendarLevel=e.target.value;afterNativePicker(e.target,renderMassCalendar)});$('#massCalendarSession')?.addEventListener('change',e=>{state.massCalendarSession=e.target.value;afterNativePicker(e.target,renderMassCalendar)});$('#massCalendarFilterReset')?.addEventListener('click',()=>{state.massCalendarLevel='';state.massCalendarSession='';renderMassCalendar()});$$('[data-calendar-mode]').forEach(x=>x.addEventListener('click',()=>{state.calendarMode=x.dataset.calendarMode;loadMassCalendar().then(renderMassCalendar).catch(err=>status(err.message,'error'))}));$('#calendarPrev')?.addEventListener('click',()=>shiftCalendar(-1));$('#calendarNext')?.addEventListener('click',()=>shiftCalendar(1));$('#calendarToday')?.addEventListener('click',()=>{state.calendarAnchor=new Date();loadMassCalendar().then(renderMassCalendar).catch(err=>status(err.message,'error'))});$('#calendarRefresh')?.addEventListener('click',async()=>{try{await loadMassCalendar();status('Tömegsport naptár frissítve.','success')}catch(err){status(err.message||'A naptár frissítése sikertelen.','error')}renderMassCalendar()});$$('[data-month-nav]').forEach(x=>x.addEventListener('click',e=>{e.stopPropagation();state.calendarAnchor=new Date(state.calendarAnchor.getFullYear(),state.calendarAnchor.getMonth()+Number(x.dataset.monthNav),1);loadMassCalendar().then(renderMassCalendar).catch(err=>status(err.message,'error'))}));$$('[data-calendar-day]').forEach(x=>x.addEventListener('click',()=>{const key=x.dataset.calendarDay;if(!key)return;state.calendarAnchor=new Date(`${key}T12:00:00`);state.calendarMode='day';loadMassCalendar().then(renderMassCalendar).catch(err=>status(err.message,'error'))}))}

  const LEGACY_CAL_PX_PER_MIN=34/30;
  function legacyCalendarMassRows_(){
    return (state.massCalendarEvents||[]).map(e=>({...e,__ccMass:true,eventType:'training',event_type:'training',title:e.level||'Edzés',teamName:e.sessionType||'Tömegsport',color:e.color||massLevelColor(e)}));
  }
  function legacyCalendarCompetitionRows_(){return calendarFiltered()}
  function legacyCalendarScopeOptions_(){const out=[];if(can('mass.calendar'))out.push(['MASS','TÖMEGSPORT']);if(can('competition.calendar')){out.push(['COMPETITION','VERSENYSPORT'],['MATCHES','MECCSEK'])}if(can('mass.calendar')&&can('competition.calendar'))out.push(['ALL','ÖSSZES']);return out}
  function legacyCalendarRows_(){
    const scope=state.calendarScope||'COMPETITION',mass=legacyCalendarMassRows_(),comp=legacyCalendarCompetitionRows_();
    let rows=scope==='MASS'?mass:scope==='MATCHES'?comp.filter(e=>eventType(e)==='match'):scope==='ALL'?[...mass,...comp]:comp;
    if(scope==='MASS'&&state.massCalendarLevel)rows=rows.filter(e=>text(e.level)===state.massCalendarLevel);
    if(scope==='MASS'&&state.massCalendarSession)rows=rows.filter(e=>text(e.sessionType)===state.massCalendarSession);
    return rows.sort((a,b)=>eventStart(a)-eventStart(b));
  }
  async function loadLegacyCalendarData_(){
    const scope=state.calendarScope||'COMPETITION',jobs=[];
    if((scope==='MASS'||scope==='ALL')&&can('mass.calendar'))jobs.push(loadMassCalendar());
    if((scope==='COMPETITION'||scope==='MATCHES'||scope==='ALL')&&can('competition.calendar'))jobs.push(loadCalendar());
    if(jobs.length)await Promise.all(jobs)
  }
  function legacyCalendarColor_(e){return e?.__ccMass?(e.color||massLevelColor(e)):calendarTeamColor(e)}
  function legacyCalendarTitle_(e){return e?.__ccMass?(e.level||'Edzés'):ccDisplayEventTitle_(e)}
  function legacyCalendarSub_(e){return e?.__ccMass?`${text(e.sessionType||'TÖMEGSPORT')}${e.court?' · '+text(e.court):''}`:`${text(e.teamName||teamById(eventTeamId(e))?.name||'')}${eventPlace(e)?' · '+eventPlace(e):''}`}
  function legacyCalendarCourt_(e){
    if(eventType(e)==='match')return'MECCS';
    const raw=text(e.court||'').replace(/\s*\.\s*pálya$/i,'').trim();return raw||'PROGRAM'
  }
  function legacyCalendarEventButton_(e,startMin,endMin){
    const start=calendarLocalMinutes(eventStart(e)),rawEnd=calendarLocalMinutes(eventEnd(e)),finish=Math.max(start+30,rawEnd||start+120),top=Math.max(0,(start-startMin)*LEGACY_CAL_PX_PER_MIN),height=Math.max(30,(Math.min(endMin,finish)-Math.max(startMin,start))*LEGACY_CAL_PX_PER_MIN-3),color=legacyCalendarColor_(e),mass=e.__ccMass;
    const attrs=mass?`data-mass-detail="${esc(e.eventId||e.id)}"`:`data-event-id="${esc(e.eventId||e.id)}"`;
    return `<button class="cc-cal-event ${eventType(e)==='match'?'match':''} ${isEventPast(e)?'past':''}" type="button" ${attrs} style="--event-color:${esc(color)};top:${top}px;height:${height}px"><b>${esc(fmtTime(eventStart(e)))}</b><strong>${esc(legacyCalendarTitle_(e))}</strong><span>${esc(mass?(e.sessionType||'Tömegsport'):(e.teamName||teamById(eventTeamId(e))?.name||''))}</span><small>${esc(mass?`${e.court||'Pálya –'} · ${num(e.totalActive)} fő`:eventPlace(e))}</small></button>`
  }
  function legacyCalendarLaneHtml_(rows,key,startMin,endMin){
    const totalHeight=(endMin-startMin)*LEGACY_CAL_PX_PER_MIN,slots=[];for(let m=startMin;m<endMin;m+=30)slots.push(m);
    return `<div class="cc-court-lane" style="height:${totalHeight}px">${slots.map(()=>'<div class="cc-cal-slot"></div>').join('')}${rows.filter(e=>legacyCalendarCourt_(e)===key).map(e=>legacyCalendarEventButton_(e,startMin,endMin)).join('')}</div>`
  }
  function legacyCalendarDayColumn_(date,rows,{single=false}={}){
    const key=localDateKey(date),dayRows=rows.filter(e=>localDateKey(eventStart(e))===key),startMin=17*60+30,endMin=22*60,courts=Array.from(new Set(dayRows.filter(e=>eventType(e)!=='match').map(legacyCalendarCourt_))).sort((a,b)=>a.localeCompare(b,'hu-HU',{numeric:true})),hasMatches=dayRows.some(e=>eventType(e)==='match'),lanes=[...(hasMatches?['MECCS']:[]),...courts];if(!lanes.length)lanes.push('PROGRAM');
    const template=`repeat(${lanes.length},minmax(104px,1fr))`,dayName=new Intl.DateTimeFormat('hu-HU',{weekday:'short',timeZone:'Europe/Budapest'}).format(date),today=key===localDateKey(new Date());
    return `<section class="cc-day-column ${single?'single':''}" style="width:${single?'100%':Math.max(180,lanes.length*116)+'px'}"><button class="cc-day-head ${today?'today':''}" type="button" data-calendar-day="${esc(key)}">${esc(dayName)} <small>${esc(fmtDate(date))}</small></button><div class="cc-court-heads" style="grid-template-columns:${template}">${lanes.map(l=>`<div class="cc-court-head ${l==='MECCS'?'match':''}">${esc(l==='MECCS'?'MECCS':l==='PROGRAM'?'PROGRAM':l+'. pálya')}</div>`).join('')}</div><div class="cc-day-lanes" style="grid-template-columns:${template}">${lanes.map(l=>legacyCalendarLaneHtml_(dayRows,l,startMin,endMin)).join('')}</div></section>`
  }
  function legacyCalendarTimeAxis_(){const startMin=17*60+30,endMin=22*60,slots=[];for(let m=startMin;m<endMin;m+=30)slots.push(m);return `<div class="cc-time-axis"><div class="cc-time-axis-head"></div>${slots.map(m=>`<div class="cc-time-row">${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}</div>`).join('')}</div>`}
  function legacyCalendarDayBoard_(rows){return `<div class="cc-calendar-scroll cc-day-scroll"><div class="cc-week-board cc-day-board">${legacyCalendarTimeAxis_()}${legacyCalendarDayColumn_(state.calendarAnchor,rows,{single:true})}</div></div>`}
  function legacyCalendarWeekBoard_(rows){const monday=startOfWeek(state.calendarAnchor),days=Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setDate(d.getDate()+i);return d});return `<div class="cc-calendar-scroll"><div class="cc-week-board">${legacyCalendarTimeAxis_()}${days.map(d=>legacyCalendarDayColumn_(d,rows)).join('')}</div></div>`}
  function legacyCalendarMonth_(rows){
    const a=new Date(state.calendarAnchor),first=new Date(a.getFullYear(),a.getMonth(),1,12),gridStart=startOfWeek(first),today=localDateKey(new Date()),cells=Array.from({length:42},(_,i)=>{const d=new Date(gridStart);d.setDate(d.getDate()+i);return d});
    return `<div class="cc-calendar-scroll"><div class="cc-month-grid">${['H','K','Sze','Cs','P','Szo','V'].map(x=>`<div class="cc-month-weekday">${x}</div>`).join('')}${cells.map(d=>{const key=localDateKey(d),outside=d.getMonth()!==first.getMonth(),items=rows.filter(e=>localDateKey(eventStart(e))===key).sort((x,y)=>eventStart(x)-eventStart(y));return `<div class="cc-month-day ${outside?'outside':''} ${key===today?'today':''}" data-month-day="${esc(key)}"><div class="cc-month-day-number">${d.getDate()}${key===today?' · MA':''}</div><div class="cc-month-day-events">${items.slice(0,6).map(e=>{const attrs=e.__ccMass?`data-mass-detail="${esc(e.eventId||e.id)}"`:`data-event-id="${esc(e.eventId||e.id)}"`;return `<button class="cc-month-event ${eventType(e)==='match'?'match':''}" type="button" ${attrs} style="--event-color:${esc(legacyCalendarColor_(e))}">${esc(fmtTime(eventStart(e))+' · '+legacyCalendarTitle_(e))}</button>`}).join('')}${items.length>6?`<div class="cc-month-more">+${items.length-6} további</div>`:''}</div></div>`}).join('')}</div></div>`
  }
  function legacyCalendarSeason_(rows){
    const a=new Date(state.calendarAnchor),startYear=a.getMonth()>=7?a.getFullYear():a.getFullYear()-1,today=localDateKey(new Date()),months=Array.from({length:10},(_,i)=>new Date(startYear+(8+i>=12?1:0),(8+i)%12,1,12));
    return `<div class="cc-season-overview">${months.map(first=>{const gridStart=startOfWeek(first),cells=Array.from({length:42},(_,i)=>{const d=new Date(gridStart);d.setDate(d.getDate()+i);return d}),current=first.getMonth()===new Date().getMonth()&&first.getFullYear()===new Date().getFullYear();return `<section class="cc-season-mini-month ${current?'current':''}"><button class="cc-season-mini-head" type="button" data-season-month="${esc(localDateKey(first))}">${esc(first.toLocaleDateString('hu-HU',{year:'numeric',month:'long'}))}</button><div class="cc-season-mini-weekdays">${['H','K','Sze','Cs','P','Szo','V'].map(x=>`<span>${x}</span>`).join('')}</div><div class="cc-season-mini-grid">${cells.map(d=>{const key=localDateKey(d),outside=d.getMonth()!==first.getMonth(),items=outside?[]:rows.filter(e=>localDateKey(eventStart(e))===key);return `<button class="cc-season-mini-day ${outside?'outside':''} ${key===today?'today':''}" type="button" ${outside?'tabindex="-1" aria-hidden="true"':`data-season-day="${esc(key)}"`}><span class="cc-season-mini-day-number">${d.getDate()}</span><span class="cc-season-mini-events">${items.slice(0,6).map(e=>`<i class="cc-season-mini-event ${eventType(e)==='match'?'match':''}" style="--event-color:${esc(legacyCalendarColor_(e))}" title="${esc(fmtTime(eventStart(e))+' · '+legacyCalendarTitle_(e))}"></i>`).join('')}</span>${items.length>6?`<span class="cc-season-mini-more">+${items.length-6}</span>`:''}</button>`}).join('')}</div></section>`}).join('')}</div>`
  }
  function legacyCalendarLegend_(rows){
    const map=new Map();rows.forEach(e=>{const label=e.__ccMass?(e.level||'Tömegsport'):(e.teamName||teamById(eventTeamId(e))?.name||'Versenysport'),color=legacyCalendarColor_(e);if(label&&!map.has(label))map.set(label,color)});return Array.from(map.entries()).slice(0,8).map(([label,color])=>`<span><i style="background:${esc(color)}"></i>${esc(label)}</span>`).join('')
  }
  function renderCalendar(){
    state.calendarFiltersOpen=filterOpen_('legacy.calendar',state.calendarFiltersOpen);const scopeOptions=legacyCalendarScopeOptions_();if(!scopeOptions.some(x=>x[0]===state.calendarScope))state.calendarScope=scopeOptions[0]?.[0]||(state.area==='mass'?'MASS':'COMPETITION');const rows=legacyCalendarRows_(),scope=state.calendarScope||'COMPETITION',active=!!state.calendarTeam||!!state.calendarType||!!state.massCalendarLevel||!!state.massCalendarSession;
    const levels=Array.from(new Set((state.massCalendarEvents||[]).map(e=>text(e.level)).filter(Boolean))).sort((a,b)=>HU_NAME_COLLATOR.compare(a,b)),sessions=Array.from(new Set((state.massCalendarEvents||[]).map(e=>text(e.sessionType)).filter(Boolean))).sort();
    const body=state.calendarMode==='day'?legacyCalendarDayBoard_(rows):state.calendarMode==='week'?legacyCalendarWeekBoard_(rows):state.calendarMode==='month'?legacyCalendarMonth_(rows):legacyCalendarSeason_(rows);
    $('#viewContent').innerHTML=`<div class="cc-manager-calendar-view"><div class="cc-calendar-head"><div><h2>Naptár</h2><div class="cc-calendar-subtitle">A régi Manager sűrű Nap / Hét / Hónap / Szezon naptára, a jelenlegi Supabase adatokkal.</div></div><span class="read-only-badge write-enabled">KATTINTÁSOS SZERKESZTÉS</span></div><div class="cc-filter-shell cc-calendar-filter-shell"><div class="cc-filter-head"><button id="calendarFilterBtn" class="cc-filter-toggle ${state.calendarFiltersOpen?'open':''} ${active?'has-filter':''}" type="button"><span class="cc-filter-triangle" aria-hidden="true"></span><span>Szűrők</span></button>${active?'<button id="calendarFilterReset" class="cc-filter-clear" type="button">Szűrők törlése</button>':''}</div><div id="calendarFilterPanel" class="cc-filter-panel cc-calendar-filter-panel" ${state.calendarFiltersOpen?'':'hidden'}><div class="cc-calendar-toolbar"><div class="cc-calendar-segment cc-calendar-view-segment" aria-label="Naptár nézet">${[['day','NAP'],['week','HÉT'],['month','HÓNAP'],['season','SZEZON']].map(([k,l])=>`<button type="button" data-calendar-mode="${k}" class="${state.calendarMode===k?'active':''}">${l}</button>`).join('')}</div><div class="cc-calendar-segment cc-calendar-scope-segment" aria-label="Naptár tartalom">${scopeOptions.map(([k,l])=>`<button type="button" data-calendar-scope="${k}" class="${scope===k?'active':''}">${l}</button>`).join('')}</div></div><div class="legacy-calendar-extra-filters">${scope==='MASS'?`<label class="field compact"><span>Szint</span><select id="massCalendarLevel"><option value="">Minden szint</option>${levels.map(x=>`<option value="${esc(x)}" ${x===state.massCalendarLevel?'selected':''}>${esc(x)}</option>`).join('')}</select></label><label class="field compact"><span>Típus</span><select id="massCalendarSession"><option value="">Minden típus</option>${sessions.map(x=>`<option value="${esc(x)}" ${x===state.massCalendarSession?'selected':''}>${esc(x)}</option>`).join('')}</select></label>`:`<label class="field compact"><span>Csapat</span><select id="calendarTeamFilter">${teamOptions(state.calendarTeam)}</select></label><label class="field compact"><span>Típus</span><select id="calendarTypeFilter"><option value="">Minden esemény</option><option value="training" ${state.calendarType==='training'?'selected':''}>Edzés</option><option value="match" ${state.calendarType==='match'?'selected':''}>Meccs</option></select></label>`}</div></div></div><div class="cc-calendar-nav-row"><div class="cc-calendar-nav-buttons"><button id="calendarPrev" type="button" aria-label="Előző">←</button><button id="calendarToday" type="button">MAI NAPRA</button><button id="calendarNext" type="button" aria-label="Következő">→</button><button id="calendarRefresh" type="button">↻ FRISSÍTÉS</button></div><div class="cc-calendar-range-label">${esc(calendarRangeText())}</div><div class="cc-calendar-legend">${legacyCalendarLegend_(rows)}</div></div><div class="cc-calendar-canvas">${body}</div></div>`;
    bindLegacyCalendarUi_();bindEventDetailActions();bindMassLegacyRows()
  }
  function bindLegacyCalendarUi_(){
    const toggle=$('#calendarFilterBtn'),panel=$('#calendarFilterPanel');toggle?.addEventListener('click',()=>{state.calendarFiltersOpen=!state.calendarFiltersOpen;setFilterOpen_('legacy.calendar',state.calendarFiltersOpen);toggle.classList.toggle('open',state.calendarFiltersOpen);if(panel)panel.hidden=!state.calendarFiltersOpen;ccBlurPointerControl_(toggle)});
    $('#calendarFilterReset')?.addEventListener('click',()=>{state.calendarTeam='';state.calendarType='';state.massCalendarLevel='';state.massCalendarSession='';renderCalendar()});
    $$('[data-calendar-mode]').forEach(b=>b.addEventListener('click',async()=>{state.calendarMode=b.dataset.calendarMode;try{await loadLegacyCalendarData_()}catch(err){status(err.message||'A naptár betöltése sikertelen.','error')}renderCalendar()}));
    $$('[data-calendar-scope]').forEach(b=>b.addEventListener('click',async()=>{state.calendarScope=b.dataset.calendarScope;state.calendarTeam='';state.calendarType='';try{await loadLegacyCalendarData_()}catch(err){status(err.message||'A naptár betöltése sikertelen.','error')}renderCalendar()}));
    $('#calendarTeamFilter')?.addEventListener('change',async e=>{state.calendarTeam=e.target.value;try{await loadLegacyCalendarData_()}catch(err){status(err.message,'error')}renderCalendar()});
    $('#calendarTypeFilter')?.addEventListener('change',e=>{state.calendarType=e.target.value;renderCalendar()});
    $('#massCalendarLevel')?.addEventListener('change',e=>{state.massCalendarLevel=e.target.value;renderCalendar()});$('#massCalendarSession')?.addEventListener('change',e=>{state.massCalendarSession=e.target.value;renderCalendar()});
    $('#calendarPrev')?.addEventListener('click',()=>shiftCalendar(-1));$('#calendarNext')?.addEventListener('click',()=>shiftCalendar(1));$('#calendarToday')?.addEventListener('click',async()=>{state.calendarAnchor=new Date();try{await loadLegacyCalendarData_()}catch(err){status(err.message,'error')}renderCalendar()});$('#calendarRefresh')?.addEventListener('click',async()=>{try{await loadLegacyCalendarData_();status('Naptár frissítve.','success')}catch(err){status(err.message||'A naptár frissítése sikertelen.','error')}renderCalendar()});
    $$('[data-calendar-day],[data-month-day],[data-season-day]').forEach(b=>b.addEventListener('click',e=>{if(e.target.closest('[data-event-id],[data-mass-detail]'))return;const key=b.dataset.calendarDay||b.dataset.monthDay||b.dataset.seasonDay;if(!key)return;state.calendarAnchor=new Date(`${key}T12:00:00`);state.calendarMode='day';loadLegacyCalendarData_().then(renderCalendar).catch(err=>status(err.message,'error'))}));
    $$('[data-season-month]').forEach(b=>b.addEventListener('click',()=>{state.calendarAnchor=new Date(`${b.dataset.seasonMonth}T12:00:00`);state.calendarMode='month';loadLegacyCalendarData_().then(renderCalendar).catch(err=>status(err.message,'error'))}))
  }
  function shiftCalendar(dir){const d=new Date(state.calendarAnchor);if(state.calendarMode==='day')d.setDate(d.getDate()+dir);else if(state.calendarMode==='month')d.setMonth(d.getMonth()+dir);else if(state.calendarMode==='season')d.setFullYear(d.getFullYear()+dir);else d.setDate(d.getDate()+7*dir);state.calendarAnchor=d;loadLegacyCalendarData_().then(renderCalendar).catch(err=>status(err.message,'error'))}

  function adminPermissionSummary(a){const p=Array.isArray(a?.permissions)?a.permissions:[],mods=new Set(p.filter(x=>x.canView||x.canEdit||x.canNotify).map(x=>text(x.moduleKey)));return `${mods.size} modul · ${p.filter(x=>x.canEdit).length} szerkesztési scope`}
  function adminListHtml(){if(state.adminsLoadError)return `<div class="migration-note error"><b>Az MGR004 admin-kezelő még nincs telepítve.</b><span>${esc(state.adminsLoadError)}</span></div>`;return `<div class="admin-list">${(state.admins||[]).map(a=>`<button class="admin-list-row ${text(state.adminEditId)===text(a.id)?'active':''}" type="button" data-admin-edit="${esc(a.id)}"><span class="profile-dot">${esc(initials(a.displayName||a.email))}</span><div><b>${esc(a.displayName||a.email)}</b><small>${esc(a.email)} · ${esc(adminPermissionSummary(a))}</small></div><span class="status-pill ${a.active?'ok':'muted'}">${a.active?'AKTÍV':'INAKTÍV'}</span></button>`).join('')||emptyInline('Nincs Manager-fiók.')}</div>`}
  function permissionRowsForAdmin(admin,key){return (admin?.permissions||[]).filter(p=>text(p.moduleKey)===key)}
  function adminPermissionEditorRow(admin,key,label){const rows=permissionRowsForAdmin(admin,key),canView=rows.some(x=>x.canView),canEdit=rows.some(x=>x.canEdit),canNotify=rows.some(x=>x.canNotify),competition=key.startsWith('competition.'),global=competition&&rows.some(x=>!x.teamId),selected=new Set(rows.filter(x=>x.teamId).map(x=>text(x.teamId))),teams=(state.adminTeams.length?state.adminTeams:state.teams).filter(t=>t.active!==false);return `<div class="admin-permission-row" data-admin-module-row="${esc(key)}"><div class="admin-module-name"><b>${esc(label)}</b><small>${esc(key)}</small></div><label><input type="checkbox" data-right="view" ${canView?'checked':''}> Nézet</label><label><input type="checkbox" data-right="edit" ${canEdit?'checked':''}> Szerk.</label><label><input type="checkbox" data-right="notify" ${canNotify?'checked':''}> Értesítés</label>${competition?`<div class="admin-team-scope"><label class="scope-all"><input type="checkbox" data-scope-all ${global?'checked':''}> Minden csapat</label>${teams.map(t=>`<label><input type="checkbox" data-scope-team value="${esc(t.id)}" ${!global&&selected.has(text(t.id))?'checked':''} ${global?'disabled':''}><span class="team-color-mini" style="background:${esc(t.color||'#f7b700')}"></span>${esc(t.name)}</label>`).join('')}</div>`:'<div class="admin-team-scope muted-scope">Klubszintű</div>'}</div>`}
  function adminEditorHtml(){const isNew=state.adminEditId==='__new__',admin=isNew?{id:'',email:'',displayName:'',active:true,permissions:[]}:(state.admins||[]).find(a=>text(a.id)===text(state.adminEditId));if(!admin)return `<div class="admin-editor-empty"><b>Válassz egy admint</b><span>Vagy hozz létre új Manager-fiókot.</span></div>`;return `<div class="admin-editor" data-admin-id="${esc(admin.id||'')}"><div class="admin-editor-head"><div><h3>${isNew?'Új admin':'Admin szerkesztése'}</h3><p>${admin.authBound?'A fiók már Supabase Auth felhasználóhoz van kötve.':'Az első sikeres OTP belépéskor kapcsolódik az Auth-fiókhoz.'}</p></div>${!isNew?`<span class="status-pill ${admin.authBound?'ok':''}">${admin.authBound?'AUTH KÖTVE':'MÉG NEM LÉPETT BE'}</span>`:''}</div><div class="admin-account-grid"><label class="field"><span>Név</span><input id="adminDisplayName" value="${esc(admin.displayName||'')}" placeholder="Név"></label><label class="field"><span>Email</span><input id="adminEmail" type="email" value="${esc(admin.email||'')}" ${admin.authBound?'readonly':''} placeholder="nev@example.com"></label><label class="admin-active-toggle"><input id="adminActive" type="checkbox" ${admin.active!==false?'checked':''} ${admin.isSelf?'disabled':''}><span>Aktív Manager-fiók</span></label></div><div class="admin-permission-toolbar"><div><b>Jogosultságok</b><small>View / Edit / Notify, Versenysportnál csapat-scope-pal.</small></div><div><button class="button quiet small" id="adminViewAllBtn" type="button">Minden megtekintés</button><button class="button quiet small" id="adminFullBtn" type="button">Teljes admin</button></div></div><div class="admin-permission-groups">${ADMIN_MODULES.map(g=>`<section><h4>${esc(g.group)}</h4>${g.items.map(([k,l])=>adminPermissionEditorRow(admin,k,l)).join('')}</section>`).join('')}</div><div class="admin-editor-actions"><button class="button primary" id="adminSaveBtn" type="button" ${state.adminBusy?'disabled':''}>${state.adminBusy?'Mentés…':'Mentés'}</button><button class="button quiet" id="adminCancelBtn" type="button">Mégse</button></div></div>`}
  function collectAdminPermissionPayload(){const out=[];$$('[data-admin-module-row]').forEach(row=>{const key=row.dataset.adminModuleRow,view=row.querySelector('[data-right="view"]')?.checked===true,edit=row.querySelector('[data-right="edit"]')?.checked===true,notify=row.querySelector('[data-right="notify"]')?.checked===true;if(!(view||edit||notify))return;if(key.startsWith('competition.')){const all=row.querySelector('[data-scope-all]')?.checked===true,teams=Array.from(row.querySelectorAll('[data-scope-team]')).filter(x=>x.checked).map(x=>x.value);if(all||!teams.length)out.push({moduleKey:key,teamId:null,canView:view,canEdit:edit,canNotify:notify});else teams.forEach(teamId=>out.push({moduleKey:key,teamId,canView:view,canEdit:edit,canNotify:notify}))}else out.push({moduleKey:key,teamId:null,canView:view,canEdit:edit,canNotify:notify})});return out}
  async function saveAdminEditorSafe(){if(state.adminBusy)return;const email=text($('#adminEmail')?.value).toLowerCase(),name=text($('#adminDisplayName')?.value),active=$('#adminActive')?.checked!==false,payload=collectAdminPermissionPayload();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){status('Adj meg érvényes admin email címet.','error');return}const existing=state.adminEditId==='__new__'?null:(state.admins||[]).find(a=>text(a.id)===text(state.adminEditId));state.adminBusy=true;renderSettings();try{status('Admin és jogosultságok mentése…');const saved=await rpc('cc_manager_admin_save_v1',{p_manager_id:existing?.id||null,p_email:email,p_display_name:name,p_active:active,p_permissions:payload});await loadAdmins();state.adminEditId=text(saved?.account?.id||existing?.id);status('Admin mentve.','success')}catch(err){console.error(err);status(err.message||'Az admin mentése sikertelen.','error')}finally{state.adminBusy=false;renderSettings()}}
  function bindAdminEditor(){$$('[data-admin-edit]').forEach(b=>b.addEventListener('click',()=>{state.adminEditId=b.dataset.adminEdit;renderSettings()}));$('#adminAddBtn')?.addEventListener('click',()=>{state.adminEditId='__new__';renderSettings()});$('#adminCancelBtn')?.addEventListener('click',()=>{state.adminEditId='';renderSettings()});$('#adminSaveBtn')?.addEventListener('click',saveAdminEditorSafe);$('#adminViewAllBtn')?.addEventListener('click',()=>{$$('[data-admin-module-row]').forEach(r=>{const v=r.querySelector('[data-right="view"]');if(v)v.checked=true});});$('#adminFullBtn')?.addEventListener('click',()=>{$$('[data-admin-module-row]').forEach(r=>{['view','edit','notify'].forEach(k=>{const x=r.querySelector(`[data-right="${k}"]`);if(x)x.checked=true});const all=r.querySelector('[data-scope-all]');if(all){all.checked=true;Array.from(r.querySelectorAll('[data-scope-team]')).forEach(x=>{x.checked=false;x.disabled=true})}})});$$('[data-scope-all]').forEach(x=>x.addEventListener('change',()=>{Array.from(x.closest('[data-admin-module-row]').querySelectorAll('[data-scope-team]')).forEach(t=>{t.disabled=x.checked;if(x.checked)t.checked=false})}))}
  function renderSettings(){const canManage=canAction('settings','edit');$('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Beállítások</h2><p>Megjelenés, Manager-fiókok és jogosultságok.</p></div><span class="read-only-badge ${canManage?'write-enabled':''}">${canManage?'ADMIN WRITE':'VIEW'}</span></div><div class="settings-layout"><article class="panel"><div class="setting-row"><div><strong>Megjelenés</strong><small>Világos / sötét téma ezen az eszközön.</small></div><button class="button quiet" id="themeToggle" type="button">Téma váltása</button></div><div class="setting-row"><div><strong>Manager build</strong><small>${esc(FRONTEND_BUILD)}</small></div><span class="status-pill ok">V0.5.2B5S</span></div><div class="setting-row"><div><strong>Rendszer és integrációk</strong><small>Adatkapcsolat: ${configured()?'aktív':'nincs konfigurálva'} · Player értesítések: közös backend infrastruktúra</small></div><span class="status-pill ${configured()?'ok':'warn'}">${configured()?'AKTÍV':'ELLENŐRIZD'}</span></div><div class="setting-row"><div><strong>Edzéstervezés</strong><small>A régi Manager szerkezete aktív; a részletes edzésterv-szerkesztő külön következő kör.</small></div><span class="status-pill">STRUKTÚRA KÉSZ</span></div></article>${canManage?`<article class="panel admin-panel"><div class="panel-head"><div><h3>Adminok és jogosultságok</h3><p>Manager hozzáférés e-mail alapján, modul- és csapatscope-pal.</p></div><button class="button primary small" id="adminAddBtn" type="button" ${state.adminsLoadError?'disabled':''}>+ Új admin</button></div><div class="admin-layout"><div>${adminListHtml()}</div><div>${adminEditorHtml()}</div></div></article>`:''}</div>`;$('#themeToggle')?.addEventListener('click',()=>{const dark=document.body.classList.toggle('dark');localStorage.setItem('cc-manager-theme',dark?'dark':'light')});if(canManage)bindAdminEditor()}

  function renderView(){renderModule();document.title=`${moduleMeta()?.[1]||'Manager'} – Club Control Manager`}

  async function refresh(){if(!configured()){status('Manager PWA konfigurációs hiba.','error');return}try{await loadLiveData()}catch(_){}}
  function bindStaticUi(){
    $('#refreshBtn')?.addEventListener('click',refresh);$('#managerMenuBtn')?.addEventListener('click',()=>ccOpenDialogStable_($('#accountDialog')));$('#accountDialogClose')?.addEventListener('click',()=>$('#accountDialog')?.close());$('#accountDialog')?.addEventListener('click',e=>{if(e.target===$('#accountDialog'))$('#accountDialog').close()});
    $('#logoutBtn')?.addEventListener('click',async()=>{if(state.supabase)await state.supabase.auth.signOut({scope:'local'});location.reload()});
    $('#entityDialogClose')?.addEventListener('click',()=>$('#entityDialog')?.close());$('#entityDialog')?.addEventListener('click',e=>{if(e.target===$('#entityDialog'))$('#entityDialog').close()});
    $('#requestCodeBtn')?.addEventListener('click',requestCode);$('#verifyCodeBtn')?.addEventListener('click',verifyCode);$('#changeEmailBtn')?.addEventListener('click',()=>showLogin('loginEmailStep'));$('#loginEmail')?.addEventListener('keydown',e=>{if(e.key==='Enter')requestCode()});$('#loginCode')?.addEventListener('keydown',e=>{if(e.key==='Enter')verifyCode()});$('#loginCode')?.addEventListener('input',e=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,10)});
    window.addEventListener('popstate',()=>{resolveInitialRoute();renderChrome();renderView()});
  }

  async function boot(){
    if(localStorage.getItem('cc-manager-theme')==='dark')document.body.classList.add('dark');resolveInitialRoute();bindStaticUi();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('SW:',err));
    if(!configured()){hideLogin();status('Manager PWA konfigurációs hiba: a Supabase kapcsolat nincs beállítva.','error');renderChrome();renderView();return}
    try{state.supabase=await createSupabase();showLogin('loginLoadingStep');const {data:{session},error}=await state.supabase.auth.getSession();if(error)throw error;state.session=session||null;if(!session){showLogin('loginEmailStep');return}await loadLiveData();hideLogin();if(!location.hash)setRoute(state.area,legacyDefaultModule_(state.area),{replace:true})}catch(err){console.error(err);status(err.message||'Manager indítási hiba.','error');showLogin('loginEmailStep')}
  }

  boot();

  document.addEventListener('click',event=>{
    const control=event.target.closest?.('.matrix-filter-toggle,.filter-toggle');
    if(control)ccBlurPointerControl_(control);
  });
})();
