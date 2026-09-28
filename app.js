(()=>{
  'use strict';

  const FRONTEND_BUILD='manager-pwa-v0.4.2f6-medical-rollback-filter-type-lock';

  const cfg=Object.freeze({...{
    BUILD:'manager-pwa-v0.4.2f1-manager-double-ring-icon',DATA_MODE:'supabase',SUPABASE_URL:'',SUPABASE_PUBLISHABLE_KEY:'',DEFAULT_SEASON:'2026/27',DEFAULT_AREA:'competition'
  },...(window.CC_MANAGER_CONFIG||{})});

  const AREAS={
    mass:{label:'Tömegsport',glyph:'△',modules:[
      ['overview','Áttekintés','△'],['trainings','Edzések','◇'],['calendar','Naptár','□'],['athletes','Sportolók','○'],['passes','Bérletek','▱']
    ]},
    competition:{label:'Versenysport',glyph:'◇',modules:[
      ['overview','Áttekintés','△'],['trainings','Edzések','◇'],['matches','Meccsek','◆'],['calendar','Naptár','□'],['teams','Csapatok','▱'],['players','Játékosok','○'],['notifications','Értesítések','◉'],['fees','Díjak','◎'],['competition','Versenyadatok','≋']
    ]}
  };
  const MOBILE_PRIMARY={mass:['overview','trainings','athletes'],competition:['overview','calendar','players']};
  const ADMIN_MODULES=[
    {group:'Tömegsport',items:[['mass.overview','Áttekintés'],['mass.trainings','Edzések'],['mass.calendar','Naptár'],['mass.athletes','Sportolók'],['mass.passes','Bérletek']]},
    {group:'Versenysport',items:[['competition.overview','Áttekintés'],['competition.trainings','Edzések'],['competition.matches','Meccsek'],['competition.calendar','Naptár'],['competition.teams','Csapatok'],['competition.players','Játékosok'],['competition.fees','Díjak'],['competition.competition','Versenyadatok']]},
    {group:'Rendszer',items:[['settings','Beállítások / adminok']]}
  ];

  const state={
    mode:String(cfg.DATA_MODE||'demo').toLowerCase(),supabase:null,session:null,manager:null,permissions:[],teams:[],players:[],events:[],calendarEvents:[],activityEvents:[],massTrainings:[],massLoadError:'',massDetailCache:new Map(),admins:[],adminTeams:[],adminsLoadError:'',adminEditId:'',adminBusy:false,overview:null,rsvpMatrix:{events:[],players:[],responses:[]},eventRosterCache:new Map(),matrixFilterOpen:false,eventFiltersOpen:false,calendarFiltersOpen:false,matrixFilters:{team:'',period:'14',kind:'ALL',status:'ALL',from:'',to:''},
    area:['mass','competition'].includes(cfg.DEFAULT_AREA)?cfg.DEFAULT_AREA:'competition',module:'overview',calendarMode:'week',calendarAnchor:new Date(),calendarTeam:'',calendarType:'',playerTeam:'',playerSearch:'',eventTeam:'',eventPeriod:'upcoming',overviewTeam:'',selectedTeam:'',selectedPlayer:'',pendingEmail:'',loading:false,massActionBusy:'',notificationRecipients:[],notificationHistory:[],notificationSelectedPlayerId:'',notificationSearch:'',notificationBusy:false,notificationLoadError:''
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

  const PLAYER_AVATAR_IDS=['alpaca','lion','tiger','panther','lynx','cat','husky','wolf','fox','rabbit','bear','deer','panda','gorilla','monkey','elephant','rhino','hippo','giraffe','buffalo','mammoth','donkey','goat','raccoon','dog','otter','cow','ram','hedgehog','horse','zebra','turtle','penguin','owl','eagle','dolphin','crocodile','frog','shark','moose','extra_zebra','extra_horse','extra_deer','extra_kangaroo','extra_rabbit','extra_eagle','extra_turtle','extra_dolphin','extra_boar','extra_ram','extra_frog','extra_parrot'];
  const AVATAR_INDEX=new Map(PLAYER_AVATAR_IDS.map((id,i)=>[id,i]));
  function avatarHtml(p,size=''){const id=text(p?.avatarId||p?.avatar_id),idx=AVATAR_INDEX.has(id)?AVATAR_INDEX.get(id):-1,cls=`cc-avatar ${size}`.trim();if(idx>=0){const col=idx%8,row=Math.floor(idx/8),x=(col*100/7).toFixed(6),y=(row*100/6).toFixed(6);return `<span class="${cls} animal" role="img" aria-label="Avatar" style="background-position:${x}% ${y}%"></span>`}return `<span class="${cls} monogram" aria-hidden="true">${esc(initials(p?.displayName||p?.name||''))}</span>`}

  function safeDate(v){const d=v instanceof Date?new Date(v):new Date(v);return Number.isNaN(d.getTime())?null:d}
  function fmtDate(v){const d=safeDate(v);return d?dateFmt.format(d):'–'}
  function fmtDay(v){const d=safeDate(v);return d?dayFmt.format(d):'–'}
  function fmtTime(v){const d=safeDate(v);return d?timeFmt.format(d):'–'}
  function initials(v){return text(v).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()||'').join('')||'M'}
  function routeKey(area=state.area,module=state.module){return module==='settings'?'settings':`${area}.${module}`}
  function currentArea(){return AREAS[state.area]||AREAS.competition}
  function moduleMeta(module=state.module,area=state.area){return (AREAS[area]?.modules||[]).find(x=>x[0]===module)||null}
  function status(message,type=''){const el=$('#globalStatus');if(!el)return;if(!message){el.className='global-status hidden';el.textContent='';return}el.className='global-status'+(type?' '+type:'');el.textContent=message}
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

  function demoData(){
    const teams=[
      {id:'10000000-0000-4000-8000-000000000001',legacyTeamId:'team_w1',name:'BEAC Női I.',season:'2026/27',color:'#B76508',active:true,playerCount:5,coaches:'Edző A',defaultVenue:'Bogdánfy Sportcsarnok',defaultCourt:'1. pálya'},
      {id:'10000000-0000-4000-8000-000000000002',legacyTeamId:'team_w2',name:'BEAC Női II.',season:'2026/27',color:'#F3D34A',active:true,playerCount:4,coaches:'Edző B',defaultVenue:'Bogdánfy Sportcsarnok',defaultCourt:'2. pálya'},
      {id:'10000000-0000-4000-8000-000000000003',legacyTeamId:'team_m1',name:'BEAC Férfi',season:'2026/27',color:'#6AA84F',active:true,playerCount:4,coaches:'Edző C',defaultVenue:'Bogdánfy Sportcsarnok',defaultCourt:'3. pálya'}
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
    if(area==='competition'&&module==='notifications') return canAnyAction('competition.players','notify');
    return can(`${area}.${module}`);
  }

  function showLogin(step){const o=$('#loginOverlay');if(!o)return;o.classList.remove('hidden');['loginLoadingStep','loginEmailStep','loginCodeStep'].forEach(id=>$('#'+id)?.classList.toggle('hidden',id!==step));if(step==='loginEmailStep')setTimeout(()=>$('#loginEmail')?.focus(),20);if(step==='loginCodeStep')setTimeout(()=>$('#loginCode')?.focus(),20)}
  function hideLogin(){$('#loginOverlay')?.classList.add('hidden')}
  function loginMessage(id,msg,error=false){const el=$(id);if(!el)return;el.textContent=msg||'';el.classList.toggle('error',!!error)}
  async function requestCode(){const email=text($('#loginEmail')?.value).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){loginMessage('#loginMsg','Adj meg egy érvényes email címet.',true);return}const b=$('#requestCodeBtn');if(b)b.disabled=true;try{loginMessage('#loginMsg','Kód küldése…');const {error}=await state.supabase.auth.signInWithOtp({email,options:{shouldCreateUser:true}});if(error)throw error;state.pendingEmail=email;$('#loginEmailPreview').textContent=email;showLogin('loginCodeStep');loginMessage('#loginCodeMsg','A kódot elküldtük.')}catch(err){loginMessage('#loginMsg',err.message||'A kód küldése sikertelen.',true)}finally{if(b)b.disabled=false}}
  async function verifyCode(){const token=text($('#loginCode')?.value).replace(/\D/g,'');if(token.length<6){loginMessage('#loginCodeMsg','Írd be az emailben kapott kódot.',true);return}const b=$('#verifyCodeBtn');if(b)b.disabled=true;try{loginMessage('#loginCodeMsg','Ellenőrzés…');const {data,error}=await state.supabase.auth.verifyOtp({email:state.pendingEmail,token,type:'email'});if(error)throw error;state.session=data.session||null;await loadLiveData();hideLogin()}catch(err){loginMessage('#loginCodeMsg',err.message||'A belépés sikertelen.',true)}finally{if(b)b.disabled=false}}

  function applyManager(){const m=state.manager||{};$('#managerName').textContent=m.displayName||m.name||'Manager';$('#managerEmail').textContent=m.email||'–';$('#managerInitials').textContent=initials(m.displayName||m.name||m.email);$('#accountDialogName').textContent=m.displayName||m.name||'Manager';$('#accountDialogEmail').textContent=m.email||'–';$('#runtimeLabel').textContent='V0.5.0A';$('#dataModePill').textContent='MANAGER';$('#dataModeDetail').textContent='Club Control Manager · V0.5.0A';}

  async function loadLiveData(){
    state.loading=true;status('Manager adatok frissítése…');
    try{
      const b=await rpc('cc_manager_bootstrap_v1');
      if(!b?.manager)throw new Error('A Manager bootstrap nem adott érvényes fiókot.');
      state.manager=b.manager;state.permissions=Array.isArray(b.permissions)?b.permissions:[];state.teams=Array.isArray(b.teams)?b.teams:[];applyManager();
      const jobs=[];
      if(can('competition.overview'))jobs.push(loadOverview(),loadRsvpMatrix());else{state.overview={};state.rsvpMatrix={events:[],players:[],responses:[]}}
      if(can('competition.teams'))jobs.push(loadTeams());else state.teams=Array.isArray(b.teams)?b.teams:[];
      if(can('competition.players'))jobs.push(loadPlayers());else state.players=[];
      if(canAnyAction('competition.players','notify'))jobs.push(loadNotificationData().catch(err=>{console.error('MGR005 notifications load failed',err);state.notificationRecipients=[];state.notificationHistory=[];state.notificationLoadError=text(err?.message||'Az MGR005 értesítési modul még nincs telepítve.')}));else{state.notificationRecipients=[];state.notificationHistory=[];state.notificationLoadError=''};
      if(can('competition.calendar'))jobs.push(loadCalendar());else state.calendarEvents=[];
      if(can('competition.trainings')||can('competition.matches'))jobs.push(loadActivityEvents());else state.activityEvents=[];state.events=state.calendarEvents;
      if(can('mass.trainings'))jobs.push(loadMassTrainings().catch(err=>{console.error('MGR003 mass trainings load failed',err);state.massTrainings=[];state.massLoadError=text(err?.message||'A Tömegsport írási modul még nincs telepítve.')}));else{state.massTrainings=[];state.massLoadError=''};
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
  async function loadCalendar(){
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
  async function loadActivityEvents(){const now=new Date(),seasonYear=now.getMonth()>=7?now.getFullYear():now.getFullYear()-1,from=new Date(seasonYear,7,1),to=new Date(seasonYear+1,7,1),jobs=[];if(can('competition.trainings'))jobs.push(rpc('cc_manager_events_v1',{p_from:from.toISOString(),p_to:to.toISOString(),p_kind:'training',p_team_id:null}));if(can('competition.matches'))jobs.push(rpc('cc_manager_events_v1',{p_from:from.toISOString(),p_to:to.toISOString(),p_kind:'match',p_team_id:null}));const parts=await Promise.all(jobs);state.activityEvents=parts.flatMap(x=>Array.isArray(x)?x:[]).sort((a,b)=>eventStart(a)-eventStart(b))}
  async function loadMassTrainings(){const from=new Date(),to=new Date();from.setHours(0,0,0,0);to.setDate(to.getDate()+120);const d=await rpc('cc_manager_mass_trainings_v1',{p_from:localDateKey(from),p_to:localDateKey(to)});state.massTrainings=Array.isArray(d)?d:[];state.massLoadError=''}
  async function loadAdmins(){const d=await rpc('cc_manager_admins_v1');state.admins=Array.isArray(d?.admins)?d.admins:[];state.adminTeams=Array.isArray(d?.teams)?d.teams:state.teams;state.adminsLoadError='';if(state.adminEditId&&state.adminEditId!=='__new__'&&!state.admins.some(a=>text(a.id)===text(state.adminEditId)))state.adminEditId=''}
  async function loadMassEventDetail(eventId,{force=false}={}){const id=text(eventId);if(!force&&state.massDetailCache.has(id))return state.massDetailCache.get(id);const d=await rpc('cc_manager_mass_event_detail_v1',{p_event_id:id});state.massDetailCache.set(id,d||{});return d||{}}
  function matrixRange(){const f=state.matrixFilters||{},now=new Date();now.setHours(0,0,0,0);let from=new Date(now),to=new Date(now);if(f.period==='28')to.setDate(to.getDate()+28);else if(f.period==='CUSTOM'&&f.from&&f.to){from=new Date(f.from+'T00:00:00');to=new Date(f.to+'T00:00:00');to.setDate(to.getDate()+1)}else to.setDate(to.getDate()+14);return{from,to}}
  async function loadRsvpMatrix(){const {from,to}=matrixRange();const d=await rpc('cc_manager_rsvp_matrix_v1',{p_from:from.toISOString(),p_to:to.toISOString(),p_team_id:null});state.rsvpMatrix=d&&typeof d==='object'?d:{events:[],players:[],responses:[]}}
  async function loadEventRoster(eventId){if(state.eventRosterCache.has(eventId))return state.eventRosterCache.get(eventId);const d=await rpc('cc_manager_event_roster_v1',{p_event_id:eventId});const rows=Array.isArray(d)?d:[];state.eventRosterCache.set(eventId,rows);return rows}
  function useDemo(){const d=demoData();Object.assign(state,d);state.calendarEvents=d.calendarEvents;state.activityEvents=d.activityEvents;applyManager();renderChrome();renderView();status('Preview mód: nincs production adatkapcsolat. A csomag nem ír semmit.')}

  function resolveInitialRoute(){const raw=location.hash.replace(/^#/,'');if(raw==='settings'){state.module='settings';return}const [a,m]=raw.split('/');if(AREAS[a]&&AREAS[a].modules.some(x=>x[0]===m)){state.area=a;state.module=m}}
  function setRoute(area,module,{replace=false}={}){if(module==='settings'){state.module='settings';const h='#settings';replace?history.replaceState(null,'',h):history.pushState(null,'',h)}else{state.area=area;state.module=module;const h=`#${area}/${module}`;replace?history.replaceState(null,'',h):history.pushState(null,'',h)}renderChrome();renderView();window.scrollTo({top:0,behavior:'auto'})}
  function switchArea(area){if(!AREAS[area]||state.area===area)return;state.area=area;state.module='overview';setRoute(area,'overview')}

  function renderChrome(){
    const area=currentArea();
    $$('.area-choice').forEach(b=>b.classList.toggle('active',b.dataset.area===state.area));
    if($('#sidebarAreaGlyph'))$('#sidebarAreaGlyph').textContent=area.glyph;
    if($('#sidebarAreaLabel'))$('#sidebarAreaLabel').textContent=area.label;
    $('#sideSectionLabel').textContent=area.label.toUpperCase();$('#pageAreaLabel').textContent=state.module==='settings'?'GLOBÁLIS':area.label.toUpperCase();$('#mobileAreaGlyph').textContent=area.glyph;$('#mobileAreaLabel').textContent=area.label;$('#moreAreaLabel').textContent=area.label.toUpperCase();
    const side=$('#sideNav');side.innerHTML=area.modules.filter(m=>canRoute(state.area,m[0])).map(m=>navButton(m,false)).join('');
    $('#sidebarSettingsSlot').innerHTML=can('settings')?navButton(['settings','Beállítások','⌁'],false,true):'';
    const meta=state.module==='settings'?['settings','Beállítások','⌁']:moduleMeta();$('#pageTitle').textContent=meta?.[1]||'Manager';
    const primary=MOBILE_PRIMARY[state.area]||[];$('#bottomNav').innerHTML=primary.filter(m=>canRoute(state.area,m)).map(m=>navButton(moduleMeta(m),true)).join('')+`<button class="mobile-nav ${primary.includes(state.module)?'':'active-more'}" data-action="more" type="button"><span>☰</span><small>Több</small></button>`;
    const rest=area.modules.filter(m=>!primary.includes(m[0])&&canRoute(state.area,m[0]));$('#mobileMoreGrid').innerHTML=rest.map(m=>`<button class="more-item ${state.module===m[0]?'active':''}" data-route-area="${state.area}" data-route-module="${m[0]}" type="button"><span>${m[2]}</span><div><b>${esc(m[1])}</b><small>${mobileModuleHint(state.area,m[0])}</small></div></button>`).join('')+(can('settings')?`<button class="more-item ${state.module==='settings'?'active':''}" data-route-module="settings" type="button"><span>⌁</span><div><b>Beállítások</b><small>Megjelenés és rendszer</small></div></button>`:'');
    bindDynamicNavigation();
  }
  function navButton(m,mobile=false,settings=false){const active=state.module===m[0];if(mobile)return `<button class="mobile-nav ${active?'active':''}" data-route-area="${state.area}" data-route-module="${m[0]}" type="button"><span>${m[2]}</span><small>${esc(m[1])}</small></button>`;return `<button class="nav-item ${active?'active':''}" ${settings?'data-route-module="settings"':`data-route-area="${state.area}" data-route-module="${m[0]}"`} type="button" aria-label="${esc(m[1])}" title="${esc(m[1])}"><span class="nav-glyph">${m[2]}</span><span class="nav-label">${esc(m[1])}</span></button>`}
  function mobileModuleHint(area,m){const map={trainings:'Edzések kezelése',matches:'Meccsek és részletek',teams:'Csapatok és keretek',notifications:'Egyéni Player értesítések',fees:'Díjak és fizetések',competition:'Tabella és forrásadatok',passes:'Bérletek és jogosultságok'};return map[m]||`${AREAS[area].label} modul`}
  function bindDynamicNavigation(){$$('[data-route-module]').forEach(b=>b.onclick=()=>{const m=b.dataset.routeModule;if(m==='settings')setRoute(state.area,'settings');else setRoute(b.dataset.routeArea||state.area,m);$('#mobileMoreDialog')?.close()});$('[data-action="more"]')?.addEventListener('click',()=>ccOpenDialogStable_($('#mobileMoreDialog')))}

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
  function rsvpPills(e){return `<div class="rsvp-pills" aria-label="Részvételi jelzések"><span class="yes">J ${num(e.yesCount)}</span><span class="no">N ${num(e.noCount)}</span><span class="unknown">? ${num(e.unknownCount)}</span></div>`}
  function eventPlace(e){return text(e.court)||text(e.venue)||'–'}
  function eventRichRow(e){const s=eventStart(e),kind=eventType(e)==='match'?'MECCS':'EDZÉS';return `<button class="event-rich-row ${isEventPast(e)?'past':''}" type="button" data-event-id="${esc(e.eventId||e.id)}"><span class="event-accent" style="background:${esc(e.color||teamById(eventTeamId(e))?.color||'#f7b700')}"></span><div class="event-date"><b>${esc(s?fmtDate(s):'–')}</b><span>${esc(s?fmtTime(s):'–')}</span></div><div class="event-main"><strong>${esc(e.title||kind)}</strong><small>${esc(e.teamName||e.team_name||'')} · ${esc(eventPlace(e))}</small></div><span class="event-kind">${kind}</span>${rsvpPills(e)}</button>`}
  function detailPair(label,value,cls=''){return `<div class="detail-pair ${cls}"><small>${esc(label)}</small><b>${esc(value==null||value===''?'–':value)}</b></div>`}
  function findEventById(id){const e=[...state.activityEvents,...state.calendarEvents,...(state.rsvpMatrix.events||[])].find(e=>text(e.eventId||e.id)===text(id))||null;if(!e)return null;if(e.yesCount!=null&&e.noCount!=null&&e.unknownCount!=null)return e;const statuses=(state.rsvpMatrix.responses||[]).filter(r=>text(r.eventId)===text(id)).map(r=>text(r.status));return {...e,yesCount:statuses.filter(x=>x==='going').length,noCount:statuses.filter(x=>x==='not_going').length,unknownCount:statuses.filter(x=>x!=='going'&&x!=='not_going').length}}
  function openEventDetail(id){
    const e=findEventById(id);if(!e)return;const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle'),s=eventStart(e),en=eventEnd(e),eventId=text(e.eventId||e.id);
    if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='VERSENYSPORT · ESEMÉNY';
    title.textContent=e.title||(eventType(e)==='match'?'Meccs':'Edzés');
    body.innerHTML=`<div class="entity-hero event-entity-hero"><span class="event-detail-mark" style="background:${esc(e.color||teamById(eventTeamId(e))?.color||'#f7b700')}"></span><div><b>${esc(e.teamName||'–')}</b><span>${esc(eventType(e)==='match'?'Meccs':'Edzés')} · ${esc(s?fmtDate(s):'–')} ${esc(s?fmtTime(s):'–')}</span></div></div><div class="detail-grid">${detailPair('Kezdés',s?`${fmtDate(s)} ${fmtTime(s)}`:'–')}${detailPair('Befejezés',en?fmtTime(en):'–')}${detailPair('Helyszín',e.venue)}${detailPair('Cím',e.address)}${detailPair('Pálya',e.court)}${detailPair('Találkozó',e.meetingAt?`${fmtTime(e.meetingAt)} · ${e.meetingPlace||''}`:(e.meetingPlace||'–'))}</div><div class="panel-subhead"><div><h4>Részvételi jelzések</h4><p>RSVP és tényleges jelenlét külön kezelve.</p></div></div><div class="attendance-detail rsvp-detail"><div><small>Jövök</small><b>${num(e.yesCount)}</b><span>fő</span></div><div><small>Nem jövök</small><b>${num(e.noCount)}</b><span>fő</span></div><div><small>Nincs válasz</small><b>${num(e.unknownCount)}</b><span>fő</span></div></div><div class="panel-subhead"><div><h4>Névsor</h4><p>Játékosjelzés és lezárt jelenlét.</p></div></div><div id="eventRosterBody" class="event-roster-detail"><span class="roster-loading">Névsor betöltése…</span></div>`;
    ccOpenDialogStable_(d);
    if(!eventId||!configured())return;
    loadEventRoster(eventId).then(rows=>{
      const host=$('#eventRosterBody');if(!host)return;
      const rsvpLabel=x=>x==='going'?'Jövök':x==='not_going'?'Nem jövök':'Nincs válasz';
      const attLabel=x=>x==='present'?'Jelen':x==='absent'?'Hiányzott':'Nincs lezárva';
      host.innerHTML=rows.length?`<div class="event-roster-list">${rows.map(p=>`<div class="event-roster-player">${avatarHtml(p,'small')}<div><b>${esc(p.displayName||p.name||p.email||'Játékos')}</b><small>${esc(p.position||'')} ${p.jerseyNo!=null?`· #${esc(p.jerseyNo)}`:''}</small></div><span class="roster-rsvp ${esc(text(p.status)||'none')}">${esc(rsvpLabel(text(p.status)))}</span><span class="roster-attendance ${esc(text(p.attendanceStatus)||'none')}">${esc(attLabel(text(p.attendanceStatus)))}</span></div>`).join('')}</div>`:emptyInline('Nincs játékos a névsorban.')
    }).catch(err=>{const host=$('#eventRosterBody');if(host)host.innerHTML=`<span class="roster-loading error">${esc(err?.message||'A névsor nem tölthető be.')}</span>`})
  }

  function bindEventDetailActions(){$$('[data-event-id]').forEach(el=>el.addEventListener('click',()=>openEventDetail(el.dataset.eventId)))}
  function matrixResponseMap(){const m=new Map();(state.rsvpMatrix.responses||[]).forEach(r=>m.set(`${text(r.eventId)}:${text(r.playerId)}`,text(r.status)||'none'));return m}
  function matrixFilteredEvents(){const f=state.matrixFilters||{};return effectiveCompetitionEvents(state.rsvpMatrix.events||[]).filter(e=>(!f.team||eventTeamId(e)===f.team)&&(f.kind==='ALL'||(f.kind==='TRAINING'&&eventType(e)==='training')||(f.kind==='MATCH'&&eventType(e)==='match'))).sort((a,b)=>eventStart(a)-eventStart(b))}
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
      const going=players.filter(p=>map.get(`${text(e.eventId)}:${text(p.playerId)}`)==='going').length,kind=eventType(e)==='match'?'Meccs':'Edzés';
      return divider+`<tr class="matrix-data-row"><th class="matrix-event-col matrix-event-side sticky-matrix-col"><button class="matrix-event-side-btn" type="button" data-event-id="${esc(e.eventId)}"><span class="matrix-event-copy"><b>${esc(e.title||kind)}</b><small>${esc(fmtDate(eventStart(e)))} · ${esc(fmtTime(eventStart(e)))}</small></span></button></th><td class="matrix-count-col matrix-count-cell"><strong class="${matrixCountClass(going)}">${going}</strong></td>${players.map(p=>{const st=map.get(`${text(e.eventId)}:${text(p.playerId)}`);if(st==='going')return'<td class="matrix-cell going" title="Jövök"><span class="matrix-status">✓</span></td>';if(st==='not_going')return'<td class="matrix-cell not-going" title="Nem jövök"><span class="matrix-status">✕</span></td>';return'<td class="matrix-cell none" title="Nincs válasz"><span class="matrix-status">·</span></td>'}).join('')}</tr>`
    }).join('');
    return `<section class="matrix-team-section player-parity-team" style="--team-color:${esc(teamColor)}"><div class="matrix-team-title"><strong><i></i>${esc(t?.name||'Csapat')}</strong><span>${events.length} esemény · ${players.length} játékos</span></div><div class="matrix-scroll manager-player-grid"><table class="rsvp-matrix season-matrix transposed-matrix manager-player-matrix"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div></section>`
  }

  function matrixFiltersHtml(){const f=state.matrixFilters||{},active=!!f.team||f.period!=='14'||f.kind!=='ALL'||f.status!=='ALL'||!!f.from||!!f.to,custom=f.period==='CUSTOM';return `<div class="matrix-filter-wrap"><div class="matrix-filter-head"><button class="matrix-filter-toggle ${state.matrixFilterOpen?'open':''} ${active?'has-filter':''}" id="matrixFilterToggle" type="button" aria-expanded="${state.matrixFilterOpen?'true':'false'}" aria-controls="matrixFilterPanel"><span class="triangle-icon"></span>Szűrők</button>${active?`<button class="filter-reset" id="matrixFilterReset" type="button" ${state.matrixFilterOpen?'':'hidden'}>Szűrők törlése</button>`:''}</div><div class="matrix-filter-panel ${state.matrixFilterOpen?'open':''}" id="matrixFilterPanel" ${state.matrixFilterOpen?'':'hidden'}><label>Csapat<select data-matrix-filter="team">${teamOptions(f.team)}</select></label><label>Időszak<select data-matrix-filter="period"><option value="14" ${f.period==='14'?'selected':''}>Következő 2 hét</option><option value="28" ${f.period==='28'?'selected':''}>Következő 4 hét</option><option value="CUSTOM" ${f.period==='CUSTOM'?'selected':''}>Egyéni időszak</option></select></label><label>Eseménytípus<select data-matrix-filter="kind"><option value="ALL" ${f.kind==='ALL'?'selected':''}>Edzés + meccs</option><option value="TRAINING" ${f.kind==='TRAINING'?'selected':''}>Csak edzés</option><option value="MATCH" ${f.kind==='MATCH'?'selected':''}>Csak meccs</option></select></label><label>Jelzés<select data-matrix-filter="status"><option value="ALL" ${f.status==='ALL'?'selected':''}>Minden játékos</option><option value="going" ${f.status==='going'?'selected':''}>Jövök</option><option value="not_going" ${f.status==='not_going'?'selected':''}>Nem jövök</option><option value="none" ${f.status==='none'?'selected':''}>Nincs válasz</option></select></label>${custom?`<label>Időszak eleje<input type="date" data-matrix-filter="from" value="${esc(f.from||'')}"></label><label>Időszak vége<input type="date" data-matrix-filter="to" value="${esc(f.to||'')}"></label>`:''}</div></div>`}
  function renderMatrix(){
    const events=matrixFilteredEvents(),map=matrixResponseMap(),teamIds=state.matrixFilters.team?[state.matrixFilters.team]:state.teams.map(t=>t.id);
    return `<div class="parity-matrix"><div class="parity-matrix-head"><div><h3>Jelenlét</h3><p>Jövök / Nem jövök / Nincs válasz</p></div></div>${matrixFiltersHtml()}${teamIds.map(id=>matrixTeamHtml(id,events.filter(e=>eventTeamId(e)===text(id)),map)).join('')||emptyInline('Nincs esemény a kiválasztott szűréssel.')}</div>`
  }

  function bindMatrix(){const tog=$('#matrixFilterToggle'),panel=$('#matrixFilterPanel'),reset=$('#matrixFilterReset');if(tog)tog.onclick=()=>{const open=!state.matrixFilterOpen;state.matrixFilterOpen=open;tog.classList.toggle('open',open);tog.setAttribute('aria-expanded',String(open));if(panel){panel.hidden=!open;panel.classList.toggle('open',open)}if(reset)reset.hidden=!open;ccBlurPointerControl_(tog)};reset?.addEventListener('click',async()=>{state.matrixFilters={team:'',period:'14',kind:'ALL',status:'ALL',from:'',to:''};if(configured())await loadRsvpMatrix();renderOverview()});$$('[data-matrix-filter]').forEach(el=>el.addEventListener('change',()=>{const k=el.dataset.matrixFilter,old=state.matrixFilters[k];state.matrixFilters[k]=el.value;afterNativePicker(el,async()=>{if(k==='period'||k==='from'||k==='to'){try{if(configured())await loadRsvpMatrix()}catch(err){state.matrixFilters[k]=old;status(err.message,'error')}}renderOverview()},'#matrixFilterPanel')}));bindEventDetailActions()}
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
    const s=safeDate(e.startsAt),en=safeDate(e.endsAt),active=e.active!==false,gate=text(e.registrationMode)==='WAITLIST_ONLY',color=massLevelColor(e),busy=text(state.massActionBusy)===text(e.eventId),cap=num(e.capacity||e.totalLimit||e.newLimit);
    return `<div class="legacy-mass-training-row ${active?'':'inactive'} ${gate?'waitlist-only':''}" style="--level-rgb:${esc(hexRgb(color))}">
      <button class="legacy-mass-main" type="button" data-mass-detail="${esc(e.eventId)}"><span><b>${esc(e.level||'Edzés')}</b><small>${esc(text(e.sessionType||'TÖMEGSPORT'))}</small></span></button>
      <div class="legacy-mass-date"><b>${esc(s?fmtDate(s):'–')}</b><small>${esc(s?fmtTime(s):'–')}${en?` – ${esc(fmtTime(en))}`:''}</small></div>
      <div class="legacy-mass-court"><b>${esc(e.court||'–')}</b><small>Pálya</small></div>
      <div class="legacy-mass-count"><b>${num(e.totalActive)} <span>/ ${cap}</span></b><small>${num(e.waitlistCount)} várólistán</small></div>
      <div class="legacy-mass-status"><span class="training-active-pill ${!active?'off':''} ${gate?'waitlist':''}">${!active?'INAKTÍV':(gate?'CSAK VÁRÓLISTA':'AKTÍV')}</span></div>
      ${overview?'':`<div class="legacy-mass-actions">${canAction('mass.trainings','edit')&&active?`<button class="button ${gate?'quiet':'warning'} small" type="button" data-mass-gate="${esc(e.eventId)}" data-close="${gate?'0':'1'}" ${busy?'disabled':''}>${busy?'Mentés…':(gate?'Jelentkezés megnyitása':'Jelentkezés lezárása')}</button>`:''}</div>`}
      <button class="legacy-mass-chevron" type="button" data-mass-detail="${esc(e.eventId)}" aria-label="Edzés részletei">›</button>
    </div>`;
  }
  function bindMassLegacyRows(){
    $$('[data-mass-detail]').forEach(b=>b.addEventListener('click',()=>openMassEventDetail(b.dataset.massDetail)));
    $$('[data-mass-gate]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();toggleMassRegistrationGate(b.dataset.massGate,b.dataset.close==='1')}));
  }
  function renderOverview(){
    if(state.area!=='competition'){
      const rows=(state.massTrainings||[]).filter(e=>safeDate(e.startsAt)?.getTime()>=Date.now()-3600000).sort((a,b)=>safeDate(a.startsAt)-safeDate(b.startsAt));
      const totalBookings=rows.reduce((n,e)=>n+num(e.totalActive),0),totalWait=rows.reduce((n,e)=>n+num(e.waitlistCount),0),closed=rows.filter(e=>text(e.registrationMode)==='WAITLIST_ONLY').length;
      $('#viewContent').innerHTML=`<div class="overview-summary parity-summary mass-summary-compact"><div><strong>${rows.length}</strong><span>Közelgő edzés</span></div><div><strong>${totalBookings}</strong><span>Aktív jelentkezés</span></div><div><strong>${totalWait}</strong><span>Várólistán</span></div><div><strong>${closed}</strong><span>Csak várólista</span></div></div><article class="panel legacy-mass-panel"><div class="panel-head"><div><h3>Következő edzések</h3><p>A régi Manager edzéslistájának színkódolt, gradiens nézete.</p></div><button class="button quiet small" id="massOverviewAll" type="button">Összes edzés</button></div><div class="legacy-mass-training-header overview"><div>Cím / szint</div><div>Időpont</div><div>Pálya</div><div>Létszám</div><div>Státusz</div><div></div></div><div class="legacy-mass-training-list">${rows.slice(0,10).map(e=>massLegacyTrainingRow(e,{overview:true})).join('')||emptyInline('Nincs közelgő Tömegsport edzés.')}</div></article>`;
      $('#massOverviewAll')?.addEventListener('click',()=>setRoute('mass','trainings'));bindMassLegacyRows();return;
    }
    const now=Date.now(),trainingUntil=now+14*864e5,matchUntil=now+31*864e5,overviewFallback=Array.isArray(state.overview?.nextEvents)?state.overview.nextEvents:[],events=effectiveCompetitionEvents(state.activityEvents.length?state.activityEvents:overviewFallback).filter(e=>!isEventPast(e)),trainings=events.filter(e=>eventType(e)==='training'&&(eventStart(e)?.getTime()||0)<trainingUntil),matches=events.filter(e=>eventType(e)==='match'&&(eventStart(e)?.getTime()||0)<matchUntil),teamsWithProgram=new Set(events.map(eventTeamId).filter(Boolean));
    $('#viewContent').innerHTML=`<div class="page-intro overview-player-intro"><div><h2>Versenysport áttekintés</h2><p>Következő edzések, meccsek és részvételi jelzések.</p></div></div><div class="parity-overview-grid manager-overview-main"><article class="panel parity-matrix-card">${renderMatrix()}</article><article class="panel next-matches-card"><div class="panel-head"><div><h3>Következő meccsek</h3><p>következő 1 hónap</p></div><button class="button quiet small" id="allMatchesBtn" type="button">Összes</button></div><div class="legacy-overview-list gradient-match-list">${matches.slice(0,8).map(e=>`<button type="button" class="legacy-overview-row gradient-match-row" data-event-id="${esc(e.eventId||e.id)}" style="--team-color:${esc(e.color||teamById(eventTeamId(e))?.color||'#f7b700')}"><span class="legacy-overview-accent"></span><div><b>${esc(e.teamName||'')}</b><small>${esc(e.title||'Meccs')}</small></div><div><b>${esc(fmtDate(eventStart(e)))}</b><small>${esc(fmtTime(eventStart(e)))}</small></div><div><b>${esc(eventPlace(e))}</b><small>Helyszín</small></div><div>${rsvpPills(e)}</div></button>`).join('')||emptyInline('Nincs közelgő meccs.')}</div></article></div><div class="overview-summary parity-summary compact-kpi-strip"><div><strong>${trainings.length}</strong><span>Közelgő edzés</span></div><div><strong>${matches.length}</strong><span>Közelgő meccs</span></div><div><strong>${teamsWithProgram.size}</strong><span>Csapat programmal</span></div></div>`;
    $('#allMatchesBtn')?.addEventListener('click',()=>setRoute('competition','matches'));bindMatrix();bindEventDetailActions();
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
    return `<div class="notification-history-list">${rows.map(x=>`<div class="notification-history-row"><div><b>${esc(x.displayName||x.email||'Játékos')}</b><small>${esc(x.email||'')} · ${esc(fmtDate(x.createdAt))} ${esc(fmtTime(x.createdAt))}</small></div><div class="notification-history-message"><strong>${esc(x.title||'')}</strong><span>${esc(x.body||'')}</span></div><span class="status-pill ${text(x.status)==='sent'?'ok':text(x.status)==='failed'?'danger':'warn'}">${esc((x.status||'pending').toUpperCase())}</span></div>`).join('')}</div>`
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
    if(!canRoute(state.area,m)){renderPermissionDenied();return}
    if(m==='overview'){renderOverview();return}
    if(m==='calendar'){renderCalendar();return}
    if(state.area==='competition'&&m==='teams'){renderTeams();return}
    if(state.area==='competition'&&m==='players'){renderPlayers();return}
    if(state.area==='competition'&&m==='notifications'){renderNotifications();return}
    if(state.area==='competition'&&m==='trainings'){renderEventList('Edzések','A versenycsapatok edzései.',e=>(e.eventType||e.event_type)==='training');return}
    if(state.area==='competition'&&m==='matches'){renderEventList('Meccsek','Hazai és idegenbeli mérkőzések.',e=>(e.eventType||e.event_type)==='match');return}
    if(state.area==='competition'&&m==='fees'){renderPlaceholder('Díjak','A jelenlegi havi díj-/fizetési mátrix production parityje ide kerül.',['Játékosonkénti havi státusz','Edzői díj','Bérlet','Audit / felülírás']);return}
    if(state.area==='competition'&&m==='competition'){renderPlaceholder('Versenyadatok','Competition Core: tabella, teljes meccslista, BRSZ/MRSZ források és konfliktusok.',['054 Competition Core backend előtt nincs production adat','Saját csapatok meccsei az events bridge-en keresztül','Külső liga-meccsek nem kerülnek az events táblába']);return}
    if(state.area==='mass'&&m==='trainings'){renderMassTrainings();return}
    if(state.area==='mass'&&m==='athletes'){renderPlaceholder('Sportolók','A Tömegsport sportolói adatbázis és jelentkezési előzmények migrációs helye.',['keresés és státusz','bérletellenőrzés','edzéselőzmény']);return}
    if(state.area==='mass'&&m==='passes'){renderPlaceholder('Bérletek','Bérletek és jogosultságok migrációs helye.',['5 / 10 alkalmas bérlet','érvényességi kivételek','ellenőrzési állapot']);return}
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
    $('#viewContent').innerHTML=`<article class="panel legacy-mass-panel"><div class="panel-head"><div><h3>Edzések</h3><p>Régi Manager parity: gradiens színjelzés, külön AKTÍV / INAKTÍV állapot, kompakt adatsűrűség.</p></div><button class="button quiet small" id="massTrainingsRefresh" type="button">Frissítés</button></div>${loadError?`<div class="migration-note error"><b>A Tömegsport modul nem tölthető be.</b><span>${esc(loadError)}</span></div>`:`<div class="legacy-mass-training-header"><div>Cím / szint</div><div>Időpont</div><div>Pálya</div><div>Létszám</div><div>Státusz</div><div>Művelet</div><div></div></div><div class="legacy-mass-training-list">${rows.map(e=>massLegacyTrainingRow(e)).join('')||emptyInline('Nincs közelgő Tömegsport edzés.')}</div>${canEdit?'':'<div class="migration-note"><b>Megtekintési mód:</b> ehhez a fiókhoz nincs Tömegsport szerkesztési jogosultság.</div>'}`}</article>`;
    $('#massTrainingsRefresh')?.addEventListener('click',async()=>{try{status('Tömegsport edzések frissítése…');await loadMassTrainings();renderMassTrainings();status('Frissítve.','success')}catch(err){state.massLoadError=text(err?.message||'A Tömegsport modul nem tölthető be.');renderMassTrainings();status(state.massLoadError,'error')}});bindMassLegacyRows();
  }

  function massPersonRow(r,kind='booking'){const attendance=text(r.attendance),sub=safeDate(r.submittedAt);return `<div class="mass-person-row"><div><b>${esc(r.name||'Névtelen')}</b><small>${esc(r.email||'–')}</small></div><div><b>${esc(r.passNumber||'–')}</b><small>${esc(r.passStatus||'')}</small></div><div><b>${esc(kind==='booking'?(attendance||'NINCS RÖGZÍTVE'):(r.status||'VÁRAKOZIK'))}</b><small>${sub?esc(fmtDate(sub)+' '+fmtTime(sub)):''}</small></div></div>`}
  async function openMassEventDetail(eventId){const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');if(!d||!body||!title)return;if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='TÖMEGSPORT · EDZÉS';title.textContent='Tömegsport edzés';body.innerHTML='<div class="loading-inline">Edzés betöltése…</div>';ccOpenDialogStable_(d);try{const data=await loadMassEventDetail(eventId,{force:true}),e=data?.event||{};const bookings=Array.isArray(data?.bookings)?data.bookings:[],wait=Array.isArray(data?.waitlist)?data.waitlist:[];title.textContent=e.level||'Edzés';body.innerHTML=`<div class="entity-hero event-entity-hero"><span class="event-detail-mark" style="background:${esc(e.color||'#f7b700')}"></span><div><b>${esc(e.level||'Edzés')}</b><span>${esc(fmtDate(e.startsAt))} · ${esc(fmtTime(e.startsAt))} · ${esc(e.court||'Pálya –')}</span></div></div><div class="attendance-detail"><div><small>Jelentkező</small><b>${bookings.length}</b><span>fő</span></div><div><small>Várólista</small><b>${wait.length}</b><span>fő</span></div><div><small>Kapacitás</small><b>${num(e.capacity)}</b><span>fő</span></div></div><div class="panel-subhead"><div><h4>Jelentkezők</h4><p>Aktív foglalások és rögzített jelenlét.</p></div></div><div class="mass-person-list">${bookings.map(r=>massPersonRow(r,'booking')).join('')||emptyInline('Nincs aktív jelentkező.')}</div><div class="panel-subhead"><div><h4>Várólista</h4><p>Várakozó és felajánlott helyek.</p></div></div><div class="mass-person-list">${wait.map(r=>massPersonRow(r,'wait')).join('')||emptyInline('A várólista üres.')}</div>`}catch(err){console.error(err);body.innerHTML=`<div class="migration-note error"><b>A részletes Tömegsport nézethez MGR004 szükséges.</b><span>${esc(err.message||'Betöltési hiba')}</span></div>`}}
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

  function renderPlaceholder(title,copy,items=[]){$('#viewContent').innerHTML=`<div class="page-intro"><div><h2>${esc(title)}</h2><p>${esc(copy)}</p></div><span class="migration-badge">MIGRÁCIÓ</span></div><article class="panel placeholder-panel"><div class="placeholder-glyph">${moduleMeta()?.[2]||'◇'}</div><div><h3>${esc(title)}</h3><p>${esc(copy)}</p><ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="migration-note"><b>V0.4 szabály:</b> ez a modul még nem váltja le a régi Manager production funkcióját.</div></div></article>`}
  function renderPermissionDenied(){$('#viewContent').innerHTML=`<article class="panel placeholder-panel"><div class="placeholder-glyph">⊘</div><div><h3>Nincs hozzáférés</h3><p>Ehhez a Manager modulhoz a jelenlegi fiókodnak nincs megtekintési jogosultsága.</p></div></article>`}
  function migrationNotice(textValue){return `<div class="migration-notice"><b>Read-only foundation</b><span>${esc(textValue)}</span></div>`}
  function emptyInline(v){return `<div class="empty-inline">${esc(v)}</div>`}

  function filteredActivityEvents(predicate){
    const now=Date.now();return effectiveCompetitionEvents(state.activityEvents).filter(e=>predicate(e)&&(!state.eventTeam||eventTeamId(e)===state.eventTeam)&&(state.eventPeriod==='all'||(state.eventPeriod==='upcoming'&&!isEventPast(e))||(state.eventPeriod==='past'&&isEventPast(e)))).sort((a,b)=>eventStart(a)-eventStart(b));
  }
  function eventStatusLabel(e){return isEventPast(e)?'LEZÁRT':(text(e.status||'active').toLowerCase()==='active'?'AKTÍV':text(e.status||'').toUpperCase()||'AKTÍV')}
  function rosterGroup(title,rows,kind){return `<section class="roster-group ${kind}"><h4>${esc(title)} <span>${rows.length}</span></h4><div>${rows.map(p=>`<div class="roster-name-row">${avatarHtml(p,'tiny')}<span><b>${esc(p.displayName||p.name)}</b><small>${esc(p.position||'–')}${p.jerseyNo!=null?` · #${esc(p.jerseyNo)}`:''}</small></span></div>`).join('')||'<small class="roster-empty">Nincs játékos.</small>'}</div></section>`}
  async function toggleEventRoster(eventId,button){const holder=document.querySelector(`[data-roster-holder="${CSS.escape(eventId)}"]`);if(!holder)return;const opening=holder.hidden;holder.hidden=!opening;button?.setAttribute('aria-expanded',String(opening));button?.classList.toggle('open',opening);if(!opening)return;if(holder.dataset.loaded==='1')return;holder.innerHTML='<div class="roster-loading">Névsor betöltése…</div>';try{const rows=configured()?await loadEventRoster(eventId):[];holder.dataset.loaded='1';holder.innerHTML=`<div class="roster-groups">${rosterGroup('Jövök',rows.filter(x=>x.status==='going'),'going')}${rosterGroup('Nem jövök',rows.filter(x=>x.status==='not_going'),'not-going')}${rosterGroup('Nincs válasz',rows.filter(x=>x.status!=='going'&&x.status!=='not_going'),'none')}</div>`}catch(err){holder.innerHTML=`<div class="roster-loading error">${esc(err.message||'A névsor betöltése nem sikerült.')}</div>`}}
  function renderEventList(title,copy,predicate){
    const rows=filteredActivityEvents(predicate),active=!!state.eventTeam||state.eventPeriod!=='upcoming';
    $('#viewContent').innerHTML=`<div class="page-intro"><div><h2>${esc(title)}</h2><p>${esc(copy)} A korábbi Manager információsűrűségével.</p></div><span class="read-only-badge">READ-ONLY PARITY</span></div><div class="event-filter-head"><button class="matrix-filter-toggle ${active?'has-filter':''}" id="eventFiltersToggle" aria-expanded="${state.eventFiltersOpen?'true':'false'}" type="button"><span class="triangle-icon"></span>Szűrők</button></div><div class="filter-panel parity-event-filters" id="eventFiltersPanel" ${state.eventFiltersOpen?'':'hidden'}><label class="field compact"><span>Csapat</span><select id="eventTeamFilter">${teamOptions(state.eventTeam)}</select></label><label class="field compact"><span>Időszak</span><select id="eventPeriodFilter"><option value="upcoming" ${state.eventPeriod==='upcoming'?'selected':''}>Aktuális / közelgő</option><option value="past" ${state.eventPeriod==='past'?'selected':''}>Elmúlt</option><option value="all" ${state.eventPeriod==='all'?'selected':''}>Mind</option></select></label><button class="filter-reset" id="eventFilterReset" ${active?'':'hidden'} type="button">Szűrők törlése</button></div><article class="panel event-table-panel"><div class="legacy-event-table"><div class="legacy-event-header"><div>Esemény / csapat</div><div>Időpont</div><div>Pálya / helyszín</div><div>Jövök</div><div>Nem jövök</div><div>Nincs válasz</div><div>Státusz</div><div></div></div>${rows.map(e=>`<div class="legacy-event-item ${isEventPast(e)?'past':''}"><div class="legacy-event-row"><button class="event-title-button" type="button" data-event-id="${esc(e.eventId||e.id)}"><span class="legacy-event-accent" style="background:${esc(e.color||teamById(eventTeamId(e))?.color||'#f7b700')}"></span><span><b>${esc(e.teamName||'')}</b><small>${esc(e.title||((eventType(e)==='match')?'Meccs':'Edzés'))} · ${eventType(e)==='match'?'Meccs':'Edzés'}</small></span></button><div><b>${esc(fmtDate(eventStart(e)))}</b><small>${esc(fmtTime(eventStart(e)))}${eventEnd(e)?` – ${esc(fmtTime(eventEnd(e)))}`:''}</small></div><div><b>${esc(e.court||'–')}</b><small>${esc(e.venue||'')}</small></div><div class="rsvp-number going">${num(e.yesCount)}</div><div class="rsvp-number not-going">${num(e.noCount)}</div><div class="rsvp-number none">${num(e.unknownCount)}</div><div><span class="status-pill ${isEventPast(e)?'':'ok'}">${esc(eventStatusLabel(e))}</span></div><button class="roster-chevron" type="button" data-roster-toggle="${esc(e.eventId||e.id)}" aria-expanded="false" aria-label="Névsor megnyitása"><span>⌄</span></button></div><div class="legacy-event-roster" data-roster-holder="${esc(e.eventId||e.id)}" hidden></div></div>`).join('')||emptyInline('Nincs esemény ebben a szűrésben.')}</div></article>`;
    const toggle=$('#eventFiltersToggle'),panel=$('#eventFiltersPanel');if(toggle)toggle.classList.toggle('open',state.eventFiltersOpen);toggle?.addEventListener('click',()=>{const open=!state.eventFiltersOpen;state.eventFiltersOpen=open;toggle.setAttribute('aria-expanded',String(open));toggle.classList.toggle('open',open);if(panel)panel.hidden=!open;ccBlurPointerControl_(toggle)});$('#eventTeamFilter')?.addEventListener('change',e=>{state.eventTeam=e.target.value;afterNativePicker(e.target,()=>renderEventList(title,copy,predicate),'#eventFiltersPanel')});$('#eventPeriodFilter')?.addEventListener('change',e=>{state.eventPeriod=e.target.value;afterNativePicker(e.target,()=>renderEventList(title,copy,predicate),'#eventFiltersPanel')});$('#eventFilterReset')?.addEventListener('click',()=>{state.eventTeam='';state.eventPeriod='upcoming';renderEventList(title,copy,predicate)});$$('[data-roster-toggle]').forEach(b=>b.addEventListener('click',()=>toggleEventRoster(b.dataset.rosterToggle,b)));bindEventDetailActions();
  }

  function renderTeams(){
    if(!state.selectedTeam&&state.teams[0])state.selectedTeam=state.teams[0].id;const selected=teamById(state.selectedTeam),roster=selected?teamPlayers(selected.id):[],att=selected?teamAttendance(selected.id):attendanceSummary([]);
    $('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Csapatok</h2><p>Csapatkeret, alapadatok és tényleges jelenléti összesítés.</p></div><span class="read-only-badge">READ-ONLY</span></div>
      <div class="team-master-detail"><div class="team-master-list">${state.teams.map(t=>`<button type="button" class="team-master-card ${text(t.id)===text(state.selectedTeam)?'active':''}" data-team-id="${esc(t.id)}" style="--team-color:${esc(t.color||'#f7b700')}"><span class="team-color-bar"></span><div><b>${esc(t.name)}</b><small>${esc(t.season||cfg.DEFAULT_SEASON)} · ${esc(t.playerCount??teamPlayers(t.id).length)} fő</small></div><span>›</span></button>`).join('')||emptyInline('Nincs csapat.')}</div>
      <article class="panel team-detail-panel">${selected?`<div class="team-detail-head"><div><span class="eyebrow">${esc(selected.season||cfg.DEFAULT_SEASON)}</span><h3>${esc(selected.name)}</h3></div><span class="team-detail-dot" style="background:${esc(selected.color||'#f7b700')}"></span></div><div class="detail-grid">${detailPair('Edző(k)',selected.coaches)}${detailPair('Alaphelyszín',selected.defaultVenue)}${detailPair('Alappálya',selected.defaultCourt)}${detailPair('Aktív játékosok',roster.length)}${detailPair('Edzésjelenlét',pctText(att.trainingPresent,att.trainingMarked))}${detailPair('Meccsjelenlét',pctText(att.matchPresent,att.matchMarked))}</div><div class="panel-subhead"><div><h4>Játékoskeret</h4><p>Lezárt jelenléti adatok alapján.</p></div></div><div class="roster-list">${roster.map(p=>`<button class="roster-player" type="button" data-player-id="${esc(p.playerId)}">${avatarHtml(p,'small')}<div><b>${esc(p.displayName||p.name)}</b><small>${esc(p.position||'–')} · ${p.jerseyNo!=null?'#'+esc(p.jerseyNo):'nincs mezszám'}${p.membershipStartsOn?' · '+esc(fmtDate(p.membershipStartsOn))+' óta':''}</small></div><span class="roster-att">${esc(pctText(p.trainingPresent,p.trainingMarked))}</span><span>›</span></button>`).join('')||emptyInline('Nincs aktív játékos a csapatban.')}</div>`:emptyInline('Válassz csapatot.')}</article></div>`;
    $$('[data-team-id]').forEach(b=>b.addEventListener('click',()=>{state.selectedTeam=b.dataset.teamId;renderTeams()}));$$('[data-player-id]').forEach(b=>b.addEventListener('click',()=>openPlayerDetail(b.dataset.playerId)));
  }

  const HU_NAME_COLLATOR=new Intl.Collator('hu-HU',{sensitivity:'variant',numeric:true,ignorePunctuation:true});
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
  function playerRows(){
    const q=state.playerSearch.toLocaleLowerCase('hu-HU');
    return state.players.filter(p=>{
      if(state.playerTeam&&text(p.teamId||p.team_id)!==state.playerTeam)return false;
      if(q&&!`${p.name||''} ${p.displayName||''} ${p.email||''} ${p.licenseNo||''} ${p.position||''}`.toLocaleLowerCase('hu-HU').includes(q))return false;
      return true;
    }).slice().sort(comparePlayersBySurname_);
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
  function playerLegacyRow_(p){
    const team=playerTeam_(p),color=team?.color||'#b9b4aa',bits=playerMetaPills_(p),canEdit=canAnyAction('competition.players','edit');
    const medical=p.medicalValidUntil?fmtDate(p.medicalValidUntil):'–';
    return `<article class="legacy-player-row ${p.active===false?'is-inactive':''}" style="--player-team-color:${esc(color)}">
      <button class="legacy-player-main" type="button" data-player-open="${esc(p.playerId)}">
        ${avatarHtml(p,'table')}
        <span class="legacy-player-copy">
          <b>${esc(p.name||p.displayName||'–')}</b>
          <small>${esc(p.email||'')}</small>
          <span class="legacy-player-pills">${bits.map(x=>`<i>${esc(x)}</i>`).join('')}${p.active===false?'<i class="inactive">INAKTÍV</i>':''}</span>
        </span>
      </button>
      <div class="legacy-player-membership">
        <b>${esc(p.teamName||team?.name||'Nincs aktív csapat')}</b>
        <small>${p.membershipStartsOn?esc(fmtDate(p.membershipStartsOn))+' óta':'Nincs aktív tagság'}</small>
        <span>Igazolás: <b>${esc(p.licenseNo||'–')}</b> · Sportorvosi: <b>${esc(medical)}</b></span>
      </div>
      <div class="legacy-player-attendance">
        <span>Edzés <b>${esc(p.trainingPresent??0)}/${esc(p.trainingMarked??0)}</b> · ${esc(pctText(p.trainingPresent,p.trainingMarked))}</span>
        <span>Meccs <b>${esc(p.matchPresent??0)}/${esc(p.matchMarked??0)}</b> · ${esc(pctText(p.matchPresent,p.matchMarked))}</span>
      </div>
      <div class="legacy-player-actions">
        ${canEdit?`<button class="button compact" type="button" data-player-edit="${esc(p.playerId)}">Szerkesztés</button><button class="button compact" type="button" data-player-transfer="${esc(p.playerId)}">Csapatváltás</button>`:`<button class="button compact" type="button" data-player-open="${esc(p.playerId)}">Részletek</button>`}
      </div>
    </article>`;
  }
  function playerTeamTabs_(){
    const all=`<button class="legacy-player-team-tab ${state.playerTeam?'':'active'}" type="button" data-player-team="">Mind</button>`;
    return all+state.teams.filter(t=>t.active!==false).map(t=>`<button class="legacy-player-team-tab ${text(state.playerTeam)===text(t.id)?'active':''}" style="--tab-team-color:${esc(t.color||'#f7b700')}" type="button" data-player-team="${esc(t.id)}">${esc(t.name)}</button>`).join('');
  }
  function bindPlayerListActions_(){
    const input=$('#playerSearch');let timer;
    input?.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{state.playerSearch=input.value;renderPlayers()},150)});
    $$('[data-player-team]').forEach(b=>b.addEventListener('click',()=>{state.playerTeam=text(b.dataset.playerTeam);renderPlayers()}));
    $('#playerFilterReset')?.addEventListener('click',()=>{state.playerTeam='';state.playerSearch='';renderPlayers()});
    $$('[data-player-open]').forEach(el=>el.addEventListener('click',()=>openPlayerDetail(el.dataset.playerOpen,'overview')));
    $$('[data-player-edit]').forEach(el=>el.addEventListener('click',()=>openPlayerDetail(el.dataset.playerEdit,'edit')));
    $$('[data-player-transfer]').forEach(el=>el.addEventListener('click',()=>openPlayerDetail(el.dataset.playerTransfer,'transfer')));
  }
  function renderPlayers(){
    const rows=playerRows(),active=!!state.playerTeam||!!state.playerSearch,canEdit=canAnyAction('competition.players','edit');
    $('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Játékosok</h2><p>Teljes sportolói adatbázis · vezetéknév szerinti ABC · csapatszínezés · tényleges jelenlét.</p></div>${canEdit?'':'<span class="read-only-badge">MEGTEKINTÉS</span>'}</div>
      <div class="legacy-player-toolbar">
        <input id="playerSearch" class="legacy-player-search" type="search" value="${esc(state.playerSearch)}" placeholder="Keresés név, email vagy igazolási szám alapján…" autocomplete="off">
        <div class="legacy-player-team-tabs" aria-label="Csapatszűrő">${playerTeamTabs_()}</div>
        <button class="filter-reset" id="playerFilterReset" ${active?'':'hidden'} type="button">Szűrők törlése</button>
      </div>
      <article class="panel legacy-player-surface">
        <div class="legacy-player-summary"><span><b>${rows.length}</b> játékos</span><span>Vezetéknév szerint A–Z</span></div>
        <div class="legacy-player-list">${rows.map(playerLegacyRow_).join('')||emptyInline('Nincs a szűrésnek megfelelő játékos.')}</div>
      </article>`;
    bindPlayerListActions_();
  }
  function playerOverviewHtml_(p){
    return `<div class="player-detail-tabs"><button class="active" type="button" data-player-detail-tab="overview">Áttekintés</button>${canAnyAction('competition.players','edit')?'<button type="button" data-player-detail-tab="edit">Szerkesztés</button><button type="button" data-player-detail-tab="transfer">Csapatváltás</button>':''}</div>
      <div class="entity-hero">${avatarHtml(p,'large')}<div><b>${esc(p.name||p.displayName||'Játékos')}</b><span>${esc(p.teamName||'Nincs aktív csapat')}${p.position?' · '+esc(p.position):''}${p.jerseyNo!=null?' · #'+esc(p.jerseyNo):''}</span></div></div>
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
    return `<div class="player-detail-tabs"><button type="button" data-player-detail-tab="overview">Áttekintés</button><button class="active" type="button" data-player-detail-tab="edit">Szerkesztés</button><button type="button" data-player-detail-tab="transfer">Csapatváltás</button></div>
      <form class="manager-player-edit-form" id="managerPlayerEditForm">
        <label class="full"><span>Teljes név</span><input id="editPlayerName" value="${esc(p.name||'')}" autocomplete="off" required></label>
        <label><span>Megjelenési név</span><input id="editPlayerDisplayName" value="${esc(p.displayName||'')}" autocomplete="off"></label>
        <label><span>Email</span><input value="${esc(p.email||'')}" disabled><small>Az Auth-fiók miatt itt most nem módosítható.</small></label>
        <label><span>Poszt</span><select id="editPlayerPosition">${positionOptions_(p.position)}</select></label>
        <label><span>Mezszám</span><input id="editPlayerJerseyNo" inputmode="numeric" value="${esc(p.jerseyNo??'')}"></label>
        <label><span>Igazolási szám</span><input id="editPlayerLicenseNo" value="${esc(p.licenseNo||'')}"></label>
        <label><span>Sportorvosi érvényes</span><input id="editPlayerMedical" type="date" value="${esc(text(p.medicalValidUntil).slice(0,10))}"><small>Csak kézi Mentés írja ezt az adatot.</small></label>
        <label><span>Mezméret</span><select id="editPlayerJerseySize">${sizeOptions_(p.jerseySize)}</select></label>
        <label><span>Nadrágméret</span><select id="editPlayerShortsSize">${sizeOptions_(p.shortsSize)}</select></label>
        <div class="manager-player-form-actions full"><button class="button" type="button" data-player-detail-tab="overview">Mégse</button><button class="button primary" id="savePlayerEditBtn" type="submit">Mentés</button></div>
      </form>`;
  }
  function playerTransferHtml_(p){
    const options=state.teams.filter(t=>t.active!==false&&text(t.id)!==text(p.teamId||p.team_id)).map(t=>`<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('');
    return `<div class="player-detail-tabs"><button type="button" data-player-detail-tab="overview">Áttekintés</button><button type="button" data-player-detail-tab="edit">Szerkesztés</button><button class="active" type="button" data-player-detail-tab="transfer">Csapatváltás</button></div>
      <div class="manager-player-transfer-head"><small>Jelenlegi csapat</small><b>${esc(p.teamName||'Nincs aktív csapat')}</b></div>
      <form class="manager-player-edit-form" id="managerPlayerTransferForm">
        <label class="full"><span>Új csapat</span><select id="transferPlayerTeam" required><option value="">Válassz…</option>${options}</select></label>
        <label class="full"><span>Csapatváltás dátuma</span><input id="transferPlayerDate" type="date" value="${esc(localDateKey(new Date()))}" required></label>
        <div class="manager-player-form-note full">A korábbi aktív csapattagság a váltást megelőző nappal lezárul. A művelet nem küld automatikus emailt vagy push értesítést.</div>
        <div class="manager-player-form-actions full"><button class="button" type="button" data-player-detail-tab="overview">Mégse</button><button class="button primary" type="submit">Csapatváltás mentése</button></div>
      </form>`;
  }
  function bindPlayerDetail_(p,mode){
    $$('[data-player-detail-tab]').forEach(b=>b.addEventListener('click',()=>openPlayerDetail(p.playerId,b.dataset.playerDetailTab||'overview')));
    if(mode==='edit')$('#managerPlayerEditForm')?.addEventListener('submit',async e=>{e.preventDefault();await savePlayerEdit_(p)});
    if(mode==='transfer')$('#managerPlayerTransferForm')?.addEventListener('submit',async e=>{e.preventDefault();await savePlayerTransfer_(p)});
  }
  async function savePlayerEdit_(p){
    if(!canAnyAction('competition.players','edit'))return;
    const btn=$('#savePlayerEditBtn');if(btn)btn.disabled=true;
    const payload={playerId:p.playerId,name:text($('#editPlayerName')?.value),displayName:text($('#editPlayerDisplayName')?.value),email:text(p.email),position:text($('#editPlayerPosition')?.value),jerseyNo:text($('#editPlayerJerseyNo')?.value),licenseNo:text($('#editPlayerLicenseNo')?.value),medicalValidUntil:text($('#editPlayerMedical')?.value),jerseySize:text($('#editPlayerJerseySize')?.value),shortsSize:text($('#editPlayerShortsSize')?.value)};
    if(!payload.name){status('A teljes név kötelező.','error');if(btn)btn.disabled=false;return}
    if(payload.jerseyNo&&!/^\d+$/.test(payload.jerseyNo)){status('A mezszám csak szám lehet.','error');if(btn)btn.disabled=false;return}
    try{status('Játékos mentése…');await rpc('cc_manager_player_update_v1',{p_payload:payload});await loadPlayers();renderPlayers();openPlayerDetail(p.playerId,'overview');status('Játékos adatai mentve.','success')}catch(err){console.error(err);status(err.message||'A játékos mentése sikertelen.','error');if(btn)btn.disabled=false}
  }
  async function savePlayerTransfer_(p){
    if(!canAnyAction('competition.players','edit'))return;
    const teamId=text($('#transferPlayerTeam')?.value),date=text($('#transferPlayerDate')?.value);if(!teamId||!date){status('Válassz csapatot és dátumot.','error');return}
    try{status('Csapatváltás mentése…');await rpc('cc_manager_player_transfer_v1',{p_player_id:p.playerId,p_team_id:teamId,p_starts_on:date});await Promise.all([loadPlayers(),loadTeams()]);renderPlayers();openPlayerDetail(p.playerId,'overview');status('Csapatváltás mentve.','success')}catch(err){console.error(err);status(err.message||'A csapatváltás mentése sikertelen.','error')}
  }
  function openPlayerDetail(id,mode='overview'){
    const p=playerById(id);if(!p)return;state.selectedPlayer=id;
    if(mode!=='overview'&&!canAnyAction('competition.players','edit'))mode='overview';
    const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='VERSENYSPORT · JÁTÉKOS';title.textContent=p.name||p.displayName||'Játékos';
    body.innerHTML=mode==='edit'?playerEditHtml_(p):mode==='transfer'?playerTransferHtml_(p):playerOverviewHtml_(p);
    bindPlayerDetail_(p,mode);ccOpenDialogStable_(d);
  }

  function startOfWeek(d){const x=new Date(d);x.setHours(0,0,0,0);const day=(x.getDay()+6)%7;x.setDate(x.getDate()-day);return x}
  function calendarWindow(){const a=new Date(state.calendarAnchor);a.setHours(0,0,0,0);if(state.calendarMode==='day'){const to=new Date(a);to.setDate(to.getDate()+1);return{from:a,to}}if(state.calendarMode==='month'){return{from:new Date(a.getFullYear(),a.getMonth(),1),to:new Date(a.getFullYear(),a.getMonth()+1,1)}}if(state.calendarMode==='season'){const y=a.getMonth()>=7?a.getFullYear():a.getFullYear()-1;return{from:new Date(y,7,1),to:new Date(y+1,7,1)}}const from=startOfWeek(a),to=new Date(from);to.setDate(to.getDate()+7);return{from,to}}
  function calendarRangeText(){const {from,to}=calendarWindow(),end=new Date(to.getTime()-1);return state.calendarMode==='day'?fmtDate(from):`${fmtDate(from)} – ${fmtDate(end)}`}
  function calendarFiltered(){return effectiveCompetitionEvents(state.calendarEvents).filter(e=>(!state.calendarTeam||eventTeamId(e)===state.calendarTeam)&&(!state.calendarType||eventType(e)===state.calendarType)).sort((a,b)=>eventStart(a)-eventStart(b))}
  function agendaHtml(rows){const groups=new Map();rows.forEach(e=>{const d=eventStart(e);if(!d)return;const k=localDateKey(d);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(e)});return groups.size?Array.from(groups.entries()).map(([key,items])=>`<div class="calendar-day"><div class="calendar-date">${esc(fmtDay(key+'T12:00:00Z'))}</div><div class="calendar-events">${items.map(e=>`<div class="calendar-event ${isEventPast(e)?'past':''}"><time>${esc(fmtTime(eventStart(e)))}</time><span class="dot" style="background:${esc(e.color||'#f7b700')}"></span><div><strong>${esc(e.title||((eventType(e)==='match')?'Meccs':'Edzés'))}</strong><small>${esc(e.teamName||'')} · ${esc(eventPlace(e))}</small>${rsvpPills(e)}</div><span class="event-kind">${eventType(e)==='match'?'MECCS':'EDZÉS'}</span></div>`).join('')}</div></div>`).join(''):emptyInline('Ebben az időszakban nincs esemény.')}
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

  function renderCalendar(){
    if(state.area!=='competition'){renderPlaceholder('Naptár','A Tömegsport naptár production parityje külön scoped RPC-vel kerül át.',['heti alapnézet','pálya/terem erőforrások','kapacitás és jelentkezések']);return}
    const filtered=calendarFiltered(),active=!!state.calendarTeam||!!state.calendarType;
    $('#viewContent').innerHTML=`<div class="page-intro legacy-calendar-intro"><div><h2>Naptár</h2><p>Versenysport események és pályafoglaltság. Meccsnapon a kiváltott csapatedzés nem foglal külön sávot.</p></div><div class="toolbar-actions"><div class="segmented calendar-modes" role="group" aria-label="Naptár nézet"><button class="${state.calendarMode==='day'?'active':''}" data-calendar-mode="day">NAP</button><button class="${state.calendarMode==='week'?'active':''}" data-calendar-mode="week">HÉT</button><button class="${state.calendarMode==='month'?'active':''}" data-calendar-mode="month">HÓNAP</button><button class="${state.calendarMode==='season'?'active':''}" data-calendar-mode="season">SZEZON</button></div><button class="icon-button filter-toggle" id="calendarFilterBtn" type="button" aria-label="Szűrők" aria-expanded="${state.calendarFiltersOpen?'true':'false'}"><span class="triangle-icon"></span></button></div></div><div class="filter-panel calendar-player-filter" id="calendarFilterPanel" ${state.calendarFiltersOpen?'':'hidden'}><label class="field compact"><span>Csapat</span><select id="calendarTeamFilter">${teamOptions(state.calendarTeam)}</select></label><label class="field compact"><span>Típus</span><select id="calendarTypeFilter"><option value="" ${state.calendarType===''?'selected':''}>Minden esemény</option><option value="training" ${state.calendarType==='training'?'selected':''}>Edzés</option><option value="match" ${state.calendarType==='match'?'selected':''}>Meccs</option></select></label><button class="filter-reset" id="calendarFilterReset" type="button" ${active?'':'hidden'}>Szűrők törlése</button></div><article class="panel calendar-panel legacy-calendar-panel"><div class="legacy-calendar-nav"><div class="legacy-calendar-nav-buttons"><button class="button quiet square" id="calendarPrev" type="button" aria-label="Előző">←</button><button class="button quiet" id="calendarToday" type="button">Mai napra</button><button class="button quiet square" id="calendarNext" type="button" aria-label="Következő">→</button><button class="button quiet" id="calendarRefresh" type="button">↻ Frissítés</button></div><strong>${esc(calendarRangeText())}</strong><div class="calendar-team-legend">${state.teams.map(t=>`<span><i style="background:${esc(t.color||'#f7b700')}"></i>${esc(t.name)}</span>`).join('')}</div></div><div class="desktop-week-grid">${state.calendarMode==='week'?weekGridHtml(filtered):agendaHtml(filtered)}</div><div class="mobile-calendar-agenda">${agendaHtml(filtered)}</div></article>`;bindCalendarUi();bindEventDetailActions()
  }

  function bindCalendarUi(){
    {const b=$('#calendarFilterBtn'),panel=$('#calendarFilterPanel');if(b)b.classList.toggle('open',state.calendarFiltersOpen);b?.addEventListener('click',()=>{const open=!state.calendarFiltersOpen;state.calendarFiltersOpen=open;b.setAttribute('aria-expanded',String(open));b.classList.toggle('open',open);if(panel)panel.hidden=!open;ccBlurPointerControl_(b)})};
    $('#calendarTeamFilter')?.addEventListener('change',e=>{state.calendarTeam=e.target.value;afterNativePicker(e.target,()=>configured()?loadCalendar().then(renderCalendar).catch(err=>status(err.message,'error')):renderCalendar(),'#calendarFilterPanel')});
    $('#calendarTypeFilter')?.addEventListener('change',e=>{state.calendarType=e.target.value;afterNativePicker(e.target,renderCalendar,'#calendarFilterPanel')});
    $('#calendarFilterReset')?.addEventListener('click',()=>{state.calendarTeam='';state.calendarType='';configured()?loadCalendar().then(renderCalendar).catch(err=>status(err.message,'error')):renderCalendar()});
    $$('[data-calendar-mode]').forEach(b=>b.addEventListener('click',()=>{state.calendarMode=b.dataset.calendarMode;configured()?loadCalendar().then(renderCalendar).catch(err=>status(err.message,'error')):renderCalendar()}));
    $('#calendarPrev')?.addEventListener('click',()=>shiftCalendar(-1));$('#calendarNext')?.addEventListener('click',()=>shiftCalendar(1));
    $('#calendarToday')?.addEventListener('click',()=>{state.calendarAnchor=new Date();configured()?loadCalendar().then(renderCalendar).catch(err=>status(err.message,'error')):renderCalendar()});
    $('#calendarRefresh')?.addEventListener('click',async()=>{try{if(configured())await loadCalendar();status('Naptár frissítve.','success')}catch(err){status(err.message||'A naptár frissítése sikertelen.','error')}renderCalendar()});
    $$('[data-calendar-day]').forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.calendarDay;if(!key)return;state.calendarAnchor=new Date(`${key}T12:00:00`);state.calendarMode='day';configured()?loadCalendar().then(renderCalendar).catch(err=>status(err.message,'error')):renderCalendar()}))
  }

  function shiftCalendar(dir){const d=new Date(state.calendarAnchor);if(state.calendarMode==='day')d.setDate(d.getDate()+dir);else if(state.calendarMode==='month')d.setMonth(d.getMonth()+dir);else if(state.calendarMode==='season')d.setFullYear(d.getFullYear()+dir);else d.setDate(d.getDate()+7*dir);state.calendarAnchor=d;configured()?loadCalendar().then(renderCalendar).catch(err=>status(err.message,'error')):renderCalendar()}

  function adminPermissionSummary(a){const p=Array.isArray(a?.permissions)?a.permissions:[],mods=new Set(p.filter(x=>x.canView||x.canEdit||x.canNotify).map(x=>text(x.moduleKey)));return `${mods.size} modul · ${p.filter(x=>x.canEdit).length} szerkesztési scope`}
  function adminListHtml(){if(state.adminsLoadError)return `<div class="migration-note error"><b>Az MGR004 admin-kezelő még nincs telepítve.</b><span>${esc(state.adminsLoadError)}</span></div>`;return `<div class="admin-list">${(state.admins||[]).map(a=>`<button class="admin-list-row ${text(state.adminEditId)===text(a.id)?'active':''}" type="button" data-admin-edit="${esc(a.id)}"><span class="profile-dot">${esc(initials(a.displayName||a.email))}</span><div><b>${esc(a.displayName||a.email)}</b><small>${esc(a.email)} · ${esc(adminPermissionSummary(a))}</small></div><span class="status-pill ${a.active?'ok':'muted'}">${a.active?'AKTÍV':'INAKTÍV'}</span></button>`).join('')||emptyInline('Nincs Manager-fiók.')}</div>`}
  function permissionRowsForAdmin(admin,key){return (admin?.permissions||[]).filter(p=>text(p.moduleKey)===key)}
  function adminPermissionEditorRow(admin,key,label){const rows=permissionRowsForAdmin(admin,key),canView=rows.some(x=>x.canView),canEdit=rows.some(x=>x.canEdit),canNotify=rows.some(x=>x.canNotify),competition=key.startsWith('competition.'),global=competition&&rows.some(x=>!x.teamId),selected=new Set(rows.filter(x=>x.teamId).map(x=>text(x.teamId))),teams=(state.adminTeams.length?state.adminTeams:state.teams).filter(t=>t.active!==false);return `<div class="admin-permission-row" data-admin-module-row="${esc(key)}"><div class="admin-module-name"><b>${esc(label)}</b><small>${esc(key)}</small></div><label><input type="checkbox" data-right="view" ${canView?'checked':''}> Nézet</label><label><input type="checkbox" data-right="edit" ${canEdit?'checked':''}> Szerk.</label><label><input type="checkbox" data-right="notify" ${canNotify?'checked':''}> Értesítés</label>${competition?`<div class="admin-team-scope"><label class="scope-all"><input type="checkbox" data-scope-all ${global?'checked':''}> Minden csapat</label>${teams.map(t=>`<label><input type="checkbox" data-scope-team value="${esc(t.id)}" ${!global&&selected.has(text(t.id))?'checked':''} ${global?'disabled':''}><span class="team-color-mini" style="background:${esc(t.color||'#f7b700')}"></span>${esc(t.name)}</label>`).join('')}</div>`:'<div class="admin-team-scope muted-scope">Klubszintű</div>'}</div>`}
  function adminEditorHtml(){const isNew=state.adminEditId==='__new__',admin=isNew?{id:'',email:'',displayName:'',active:true,permissions:[]}:(state.admins||[]).find(a=>text(a.id)===text(state.adminEditId));if(!admin)return `<div class="admin-editor-empty"><b>Válassz egy admint</b><span>Vagy hozz létre új Manager-fiókot.</span></div>`;return `<div class="admin-editor" data-admin-id="${esc(admin.id||'')}"><div class="admin-editor-head"><div><h3>${isNew?'Új admin':'Admin szerkesztése'}</h3><p>${admin.authBound?'A fiók már Supabase Auth felhasználóhoz van kötve.':'Az első sikeres OTP belépéskor kapcsolódik az Auth-fiókhoz.'}</p></div>${!isNew?`<span class="status-pill ${admin.authBound?'ok':''}">${admin.authBound?'AUTH KÖTVE':'MÉG NEM LÉPETT BE'}</span>`:''}</div><div class="admin-account-grid"><label class="field"><span>Név</span><input id="adminDisplayName" value="${esc(admin.displayName||'')}" placeholder="Név"></label><label class="field"><span>Email</span><input id="adminEmail" type="email" value="${esc(admin.email||'')}" ${admin.authBound?'readonly':''} placeholder="nev@example.com"></label><label class="admin-active-toggle"><input id="adminActive" type="checkbox" ${admin.active!==false?'checked':''} ${admin.isSelf?'disabled':''}><span>Aktív Manager-fiók</span></label></div><div class="admin-permission-toolbar"><div><b>Jogosultságok</b><small>View / Edit / Notify, Versenysportnál csapat-scope-pal.</small></div><div><button class="button quiet small" id="adminViewAllBtn" type="button">Minden megtekintés</button><button class="button quiet small" id="adminFullBtn" type="button">Teljes admin</button></div></div><div class="admin-permission-groups">${ADMIN_MODULES.map(g=>`<section><h4>${esc(g.group)}</h4>${g.items.map(([k,l])=>adminPermissionEditorRow(admin,k,l)).join('')}</section>`).join('')}</div><div class="admin-editor-actions"><button class="button primary" id="adminSaveBtn" type="button" ${state.adminBusy?'disabled':''}>${state.adminBusy?'Mentés…':'Mentés'}</button><button class="button quiet" id="adminCancelBtn" type="button">Mégse</button></div></div>`}
  function collectAdminPermissionPayload(){const out=[];$$('[data-admin-module-row]').forEach(row=>{const key=row.dataset.adminModuleRow,view=row.querySelector('[data-right="view"]')?.checked===true,edit=row.querySelector('[data-right="edit"]')?.checked===true,notify=row.querySelector('[data-right="notify"]')?.checked===true;if(!(view||edit||notify))return;if(key.startsWith('competition.')){const all=row.querySelector('[data-scope-all]')?.checked===true,teams=Array.from(row.querySelectorAll('[data-scope-team]')).filter(x=>x.checked).map(x=>x.value);if(all||!teams.length)out.push({moduleKey:key,teamId:null,canView:view,canEdit:edit,canNotify:notify});else teams.forEach(teamId=>out.push({moduleKey:key,teamId,canView:view,canEdit:edit,canNotify:notify}))}else out.push({moduleKey:key,teamId:null,canView:view,canEdit:edit,canNotify:notify})});return out}
  async function saveAdminEditorSafe(){if(state.adminBusy)return;const email=text($('#adminEmail')?.value).toLowerCase(),name=text($('#adminDisplayName')?.value),active=$('#adminActive')?.checked!==false,payload=collectAdminPermissionPayload();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){status('Adj meg érvényes admin email címet.','error');return}const existing=state.adminEditId==='__new__'?null:(state.admins||[]).find(a=>text(a.id)===text(state.adminEditId));state.adminBusy=true;renderSettings();try{status('Admin és jogosultságok mentése…');const saved=await rpc('cc_manager_admin_save_v1',{p_manager_id:existing?.id||null,p_email:email,p_display_name:name,p_active:active,p_permissions:payload});await loadAdmins();state.adminEditId=text(saved?.account?.id||existing?.id);status('Admin mentve.','success')}catch(err){console.error(err);status(err.message||'Az admin mentése sikertelen.','error')}finally{state.adminBusy=false;renderSettings()}}
  function bindAdminEditor(){$$('[data-admin-edit]').forEach(b=>b.addEventListener('click',()=>{state.adminEditId=b.dataset.adminEdit;renderSettings()}));$('#adminAddBtn')?.addEventListener('click',()=>{state.adminEditId='__new__';renderSettings()});$('#adminCancelBtn')?.addEventListener('click',()=>{state.adminEditId='';renderSettings()});$('#adminSaveBtn')?.addEventListener('click',saveAdminEditorSafe);$('#adminViewAllBtn')?.addEventListener('click',()=>{$$('[data-admin-module-row]').forEach(r=>{const v=r.querySelector('[data-right="view"]');if(v)v.checked=true});});$('#adminFullBtn')?.addEventListener('click',()=>{$$('[data-admin-module-row]').forEach(r=>{['view','edit','notify'].forEach(k=>{const x=r.querySelector(`[data-right="${k}"]`);if(x)x.checked=true});const all=r.querySelector('[data-scope-all]');if(all){all.checked=true;Array.from(r.querySelectorAll('[data-scope-team]')).forEach(x=>{x.checked=false;x.disabled=true})}})});$$('[data-scope-all]').forEach(x=>x.addEventListener('change',()=>{Array.from(x.closest('[data-admin-module-row]').querySelectorAll('[data-scope-team]')).forEach(t=>{t.disabled=x.checked;if(x.checked)t.checked=false})}))}
  function renderSettings(){const canManage=canAction('settings','edit');$('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Beállítások</h2><p>Megjelenés, Manager-fiókok és jogosultságok.</p></div><span class="read-only-badge ${canManage?'write-enabled':''}">${canManage?'ADMIN WRITE':'VIEW'}</span></div><div class="settings-layout"><article class="panel"><div class="setting-row"><div><strong>Megjelenés</strong><small>Világos / sötét téma ezen az eszközön.</small></div><button class="button quiet" id="themeToggle" type="button">Téma váltása</button></div><div class="setting-row"><div><strong>Manager build</strong><small>${esc(FRONTEND_BUILD)}</small></div><span class="status-pill ok">V0.4.2F6</span></div><div class="setting-row"><div><strong>Rendszer és integrációk</strong><small>Adatkapcsolat: ${configured()?'aktív':'nincs konfigurálva'} · Player értesítések: közös backend infrastruktúra</small></div><span class="status-pill ${configured()?'ok':'warn'}">${configured()?'AKTÍV':'ELLENŐRIZD'}</span></div><div class="setting-row"><div><strong>Edzéstervezés</strong><small>A régi Manager parity következő köre.</small></div><span class="status-pill">KÖVETKEZŐ</span></div></article>${canManage?`<article class="panel admin-panel"><div class="panel-head"><div><h3>Adminok és jogosultságok</h3><p>Manager hozzáférés e-mail alapján, modul- és csapatscope-pal.</p></div><button class="button primary small" id="adminAddBtn" type="button" ${state.adminsLoadError?'disabled':''}>+ Új admin</button></div><div class="admin-layout"><div>${adminListHtml()}</div><div>${adminEditorHtml()}</div></div></article>`:''}</div>`;$('#themeToggle')?.addEventListener('click',()=>{const dark=document.body.classList.toggle('dark');localStorage.setItem('cc-manager-theme',dark?'dark':'light')});if(canManage)bindAdminEditor()}

  function renderView(){renderModule();document.title=`${state.module==='settings'?'Beállítások':moduleMeta()?.[1]||'Manager'} – Club Control Manager`}

  async function refresh(){if(!configured()){status('Manager PWA konfigurációs hiba.','error');return}try{await loadLiveData()}catch(_){}}
  function bindStaticUi(){
    $$('.area-choice').forEach(b=>b.addEventListener('click',()=>{switchArea(b.dataset.area);$('#areaDialog')?.close()}));
    $('#sidebarAreaBtn')?.addEventListener('click',()=>ccOpenDialogStable_($('#areaDialog')));
    $('#mobileAreaBtn')?.addEventListener('click',()=>ccOpenDialogStable_($('#areaDialog')));$('#areaDialogClose')?.addEventListener('click',()=>$('#areaDialog')?.close());$('#mobileMoreClose')?.addEventListener('click',()=>$('#mobileMoreDialog')?.close());
    ['areaDialog','mobileMoreDialog'].forEach(id=>$('#'+id)?.addEventListener('click',e=>{if(e.target===$('#'+id))$('#'+id).close()}));
    $('#refreshBtn')?.addEventListener('click',refresh);$('#managerMenuBtn')?.addEventListener('click',()=>ccOpenDialogStable_($('#accountDialog')));$('#accountDialogClose')?.addEventListener('click',()=>$('#accountDialog')?.close());$('#accountDialog')?.addEventListener('click',e=>{if(e.target===$('#accountDialog'))$('#accountDialog').close()});
    $('#logoutBtn')?.addEventListener('click',async()=>{if(state.supabase)await state.supabase.auth.signOut({scope:'local'});location.reload()});
    $('#entityDialogClose')?.addEventListener('click',()=>$('#entityDialog')?.close());$('#entityDialog')?.addEventListener('click',e=>{if(e.target===$('#entityDialog'))$('#entityDialog').close()});
    $('#requestCodeBtn')?.addEventListener('click',requestCode);$('#verifyCodeBtn')?.addEventListener('click',verifyCode);$('#changeEmailBtn')?.addEventListener('click',()=>showLogin('loginEmailStep'));$('#loginEmail')?.addEventListener('keydown',e=>{if(e.key==='Enter')requestCode()});$('#loginCode')?.addEventListener('keydown',e=>{if(e.key==='Enter')verifyCode()});$('#loginCode')?.addEventListener('input',e=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,10)});
    window.addEventListener('popstate',()=>{resolveInitialRoute();renderChrome();renderView()});
  }

  async function boot(){
    if(localStorage.getItem('cc-manager-theme')==='dark')document.body.classList.add('dark');resolveInitialRoute();bindStaticUi();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('SW:',err));
    if(!configured()){hideLogin();status('Manager PWA konfigurációs hiba: a Supabase kapcsolat nincs beállítva.','error');renderChrome();renderView();return}
    try{state.supabase=await createSupabase();showLogin('loginLoadingStep');const {data:{session},error}=await state.supabase.auth.getSession();if(error)throw error;state.session=session||null;if(!session){showLogin('loginEmailStep');return}await loadLiveData();hideLogin();if(!location.hash)setRoute(state.area,'overview',{replace:true})}catch(err){console.error(err);status(err.message||'Manager indítási hiba.','error');showLogin('loginEmailStep')}
  }

  boot();

  document.addEventListener('click',event=>{
    const control=event.target.closest?.('.matrix-filter-toggle,.filter-toggle');
    if(control)ccBlurPointerControl_(control);
  });
})();
