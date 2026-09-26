(()=>{
  'use strict';

  const cfg=Object.freeze({...{
    BUILD:'manager-pwa-v0.3.0-live-readonly',DATA_MODE:'supabase',SUPABASE_URL:'',SUPABASE_PUBLISHABLE_KEY:'',DEFAULT_SEASON:'2026/27',DEFAULT_AREA:'competition'
  },...(window.CC_MANAGER_CONFIG||{})});

  const AREAS={
    mass:{label:'Tömegsport',glyph:'△',modules:[
      ['overview','Áttekintés','△'],['trainings','Edzések','◇'],['calendar','Naptár','□'],['athletes','Sportolók','○'],['passes','Bérletek','▱']
    ]},
    competition:{label:'Versenysport',glyph:'◇',modules:[
      ['overview','Áttekintés','△'],['trainings','Edzések','◇'],['matches','Meccsek','◆'],['calendar','Naptár','□'],['teams','Csapatok','▱'],['players','Játékosok','○'],['fees','Díjak','◎'],['competition','Versenyadatok','≋']
    ]}
  };
  const MOBILE_PRIMARY={mass:['overview','calendar','athletes'],competition:['overview','calendar','players']};

  const state={
    mode:String(cfg.DATA_MODE||'demo').toLowerCase(),supabase:null,session:null,manager:null,permissions:[],teams:[],players:[],events:[],overview:null,
    area:['mass','competition'].includes(cfg.DEFAULT_AREA)?cfg.DEFAULT_AREA:'competition',module:'overview',calendarMode:'week',calendarAnchor:new Date(),calendarTeam:'',calendarType:'',playerTeam:'',playerSearch:'',pendingEmail:'',loading:false
  };

  const $=sel=>document.querySelector(sel), $$=sel=>Array.from(document.querySelectorAll(sel));
  const esc=v=>String(v??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const text=v=>String(v??'').trim();
  const dateFmt=new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Europe/Budapest'});
  const dayFmt=new Intl.DateTimeFormat('hu-HU',{weekday:'short',month:'2-digit',day:'2-digit',timeZone:'Europe/Budapest'});
  const timeFmt=new Intl.DateTimeFormat('hu-HU',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Europe/Budapest'});

  function safeDate(v){const d=v instanceof Date?new Date(v):new Date(v);return Number.isNaN(d.getTime())?null:d}
  function fmtDate(v){const d=safeDate(v);return d?dateFmt.format(d):'–'}
  function fmtDay(v){const d=safeDate(v);return d?dayFmt.format(d):'–'}
  function fmtTime(v){const d=safeDate(v);return d?timeFmt.format(d):'–'}
  function initials(v){return text(v).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()||'').join('')||'M'}
  function routeKey(area=state.area,module=state.module){return module==='settings'?'settings':`${area}.${module}`}
  function currentArea(){return AREAS[state.area]||AREAS.competition}
  function moduleMeta(module=state.module,area=state.area){return (AREAS[area]?.modules||[]).find(x=>x[0]===module)||null}
  function status(message,type=''){const el=$('#globalStatus');if(!el)return;if(!message){el.className='global-status hidden';el.textContent='';return}el.className='global-status'+(type?' '+type:'');el.textContent=message}
  function configured(){return state.mode==='supabase'&&/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(text(cfg.SUPABASE_URL))&&text(cfg.SUPABASE_PUBLISHABLE_KEY)}

  function demoData(){
    const teams=[
      {id:'10000000-0000-4000-8000-000000000001',legacyTeamId:'team_w1',name:'BEAC Női I.',season:'2026/27',color:'#B76508',active:true,playerCount:14},
      {id:'10000000-0000-4000-8000-000000000002',legacyTeamId:'team_w2',name:'BEAC Női II.',season:'2026/27',color:'#F3D34A',active:true,playerCount:13},
      {id:'10000000-0000-4000-8000-000000000003',legacyTeamId:'team_m1',name:'BEAC Férfi',season:'2026/27',color:'#6AA84F',active:true,playerCount:15}
    ];
    const now=Date.now(), day=864e5;
    const events=[
      {id:'e1',teamId:teams[0].id,teamName:teams[0].name,eventType:'training',title:'Edzés',startsAt:new Date(now+day).toISOString(),endsAt:new Date(now+day+2*36e5).toISOString(),court:'1. pálya',color:teams[0].color},
      {id:'e2',teamId:teams[2].id,teamName:teams[2].name,eventType:'training',title:'Edzés',startsAt:new Date(now+2*day).toISOString(),endsAt:new Date(now+2*day+2*36e5).toISOString(),court:'2. pálya',color:teams[2].color},
      {id:'e3',teamId:teams[1].id,teamName:teams[1].name,eventType:'match',title:'BEAC Női II. – ellenfél',startsAt:new Date(now+4*day).toISOString(),endsAt:new Date(now+4*day+2*36e5).toISOString(),venue:'Bogdánfy',color:teams[1].color}
    ];
    return {manager:{displayName:'Manager PWA preview',email:'demo@local',role:'preview'},permissions:['*'],teams,players:[],events,overview:{teamCount:3,activePlayerCount:42,nextEvents:events,teams}};
  }

  async function ensureSupabaseLibrary(){
    if(window.supabase?.createClient)return;
    await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.async=true;s.onload=resolve;s.onerror=()=>reject(new Error('A Supabase klienskönyvtár nem tölthető be.'));document.head.appendChild(s)});
  }
  async function createSupabase(){if(!configured())return null;await ensureSupabaseLibrary();return window.supabase.createClient(text(cfg.SUPABASE_URL),text(cfg.SUPABASE_PUBLISHABLE_KEY),{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}
  function normalizeRpc(data){if(typeof data==='string'){try{return JSON.parse(data)}catch(_){return data}}return data}
  async function rpc(name,args={}){if(!state.supabase)throw new Error('Supabase nincs inicializálva.');const {data,error}=await state.supabase.rpc(name,args);if(error)throw error;return normalizeRpc(data)}

  function permissionSet(){return new Set((state.permissions||[]).filter(x=>typeof x==='string'||x?.canView===true).map(x=>typeof x==='string'?x:text(x?.moduleKey)).filter(Boolean))}
  function can(key){const p=permissionSet();if(p.has('*'))return true;if(p.has(key))return true;const legacy={
    'competition.overview':'overview','competition.calendar':'calendar','competition.teams':'teams','competition.players':'players','competition.competition':'competition','settings':'settings'
  };return !!legacy[key]&&p.has(legacy[key])}

  function showLogin(step){const o=$('#loginOverlay');if(!o)return;o.classList.remove('hidden');['loginLoadingStep','loginEmailStep','loginCodeStep'].forEach(id=>$('#'+id)?.classList.toggle('hidden',id!==step));if(step==='loginEmailStep')setTimeout(()=>$('#loginEmail')?.focus(),20);if(step==='loginCodeStep')setTimeout(()=>$('#loginCode')?.focus(),20)}
  function hideLogin(){$('#loginOverlay')?.classList.add('hidden')}
  function loginMessage(id,msg,error=false){const el=$(id);if(!el)return;el.textContent=msg||'';el.classList.toggle('error',!!error)}
  async function requestCode(){const email=text($('#loginEmail')?.value).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){loginMessage('#loginMsg','Adj meg egy érvényes email címet.',true);return}const b=$('#requestCodeBtn');if(b)b.disabled=true;try{loginMessage('#loginMsg','Kód küldése…');const {error}=await state.supabase.auth.signInWithOtp({email,options:{shouldCreateUser:false}});if(error)throw error;state.pendingEmail=email;$('#loginEmailPreview').textContent=email;showLogin('loginCodeStep');loginMessage('#loginCodeMsg','A kódot elküldtük.')}catch(err){loginMessage('#loginMsg',err.message||'A kód küldése sikertelen.',true)}finally{if(b)b.disabled=false}}
  async function verifyCode(){const token=text($('#loginCode')?.value).replace(/\D/g,'');if(token.length<6){loginMessage('#loginCodeMsg','Írd be az emailben kapott kódot.',true);return}const b=$('#verifyCodeBtn');if(b)b.disabled=true;try{loginMessage('#loginCodeMsg','Ellenőrzés…');const {data,error}=await state.supabase.auth.verifyOtp({email:state.pendingEmail,token,type:'email'});if(error)throw error;state.session=data.session||null;await loadLiveData();hideLogin()}catch(err){loginMessage('#loginCodeMsg',err.message||'A belépés sikertelen.',true)}finally{if(b)b.disabled=false}}

  function applyManager(){const m=state.manager||{};$('#managerName').textContent=m.displayName||m.name||'Manager';$('#managerEmail').textContent=m.email||'–';$('#managerInitials').textContent=initials(m.displayName||m.name||m.email);$('#accountDialogName').textContent=m.displayName||m.name||'Manager';$('#accountDialogEmail').textContent=m.email||'–';$('#runtimeLabel').textContent=configured()?'Supabase direct · read-only':'CONFIG HIBA';$('#dataModePill').textContent=configured()?'SUPABASE':'CONFIG HIBA';$('#dataModeDetail').textContent=configured()?'Supabase Auth + scoped RPC · read-only.':'Hiányos Manager PWA konfiguráció.'}

  async function loadLiveData(){state.loading=true;status('Manager adatok frissítése…');try{const b=await rpc('cc_manager_bootstrap_v1');if(!b?.manager)throw new Error('A Manager bootstrap nem adott érvényes fiókot.');state.manager=b.manager;state.permissions=Array.isArray(b.permissions)?b.permissions:[];state.teams=Array.isArray(b.teams)?b.teams:[];applyManager();await Promise.allSettled([loadOverview(),loadTeams(),loadPlayers(),loadCalendar()]);renderChrome();renderView();status('Manager PWA közvetlen Supabase kapcsolat aktív.','success')}catch(err){console.error(err);status(err.message||'A Manager adatok betöltése sikertelen.','error');throw err}finally{state.loading=false}}
  async function loadOverview(){const d=await rpc('cc_manager_overview_v1',{p_team_id:null});state.overview=d||{}}
  async function loadTeams(){const d=await rpc('cc_manager_teams_v1');state.teams=Array.isArray(d)?d:[]}
  async function loadPlayers(){const d=await rpc('cc_manager_players_v1',{p_team_id:null,p_query:''});state.players=Array.isArray(d)?d:[]}
  async function loadCalendar(){const {from,to}=calendarWindow();const d=await rpc('cc_manager_calendar_v1',{p_from:from.toISOString(),p_to:to.toISOString(),p_team_id:state.calendarTeam||null});state.events=Array.isArray(d)?d:[]}
  function useDemo(){Object.assign(state,demoData());applyManager();renderChrome();renderView();status('Preview mód: nincs production adatkapcsolat. A csomag nem ír semmit.')}

  function resolveInitialRoute(){const raw=location.hash.replace(/^#/,'');if(raw==='settings'){state.module='settings';return}const [a,m]=raw.split('/');if(AREAS[a]&&AREAS[a].modules.some(x=>x[0]===m)){state.area=a;state.module=m}}
  function setRoute(area,module,{replace=false}={}){if(module==='settings'){state.module='settings';const h='#settings';replace?history.replaceState(null,'',h):history.pushState(null,'',h)}else{state.area=area;state.module=module;const h=`#${area}/${module}`;replace?history.replaceState(null,'',h):history.pushState(null,'',h)}renderChrome();renderView();window.scrollTo({top:0,behavior:'auto'})}
  function switchArea(area){if(!AREAS[area]||state.area===area)return;state.area=area;state.module='overview';setRoute(area,'overview')}

  function renderChrome(){
    const area=currentArea();
    $$('.area-button,.area-choice').forEach(b=>b.classList.toggle('active',b.dataset.area===state.area));
    $('#sideSectionLabel').textContent=area.label.toUpperCase();$('#pageAreaLabel').textContent=state.module==='settings'?'GLOBÁLIS':area.label.toUpperCase();$('#mobileAreaGlyph').textContent=area.glyph;$('#mobileAreaLabel').textContent=area.label;$('#moreAreaLabel').textContent=area.label.toUpperCase();
    const side=$('#sideNav');side.innerHTML=area.modules.filter(m=>can(`${state.area}.${m[0]}`)).map(m=>navButton(m,false)).join('');
    $('#sidebarSettingsSlot').innerHTML=can('settings')?navButton(['settings','Beállítások','⌁'],false,true):'';
    const meta=state.module==='settings'?['settings','Beállítások','⌁']:moduleMeta();$('#pageTitle').textContent=meta?.[1]||'Manager';
    const primary=MOBILE_PRIMARY[state.area]||[];$('#bottomNav').innerHTML=primary.filter(m=>can(`${state.area}.${m}`)).map(m=>navButton(moduleMeta(m),true)).join('')+`<button class="mobile-nav ${primary.includes(state.module)?'':'active-more'}" data-action="more" type="button"><span>☰</span><small>Több</small></button>`;
    const rest=area.modules.filter(m=>!primary.includes(m[0])&&can(`${state.area}.${m[0]}`));$('#mobileMoreGrid').innerHTML=rest.map(m=>`<button class="more-item ${state.module===m[0]?'active':''}" data-route-area="${state.area}" data-route-module="${m[0]}" type="button"><span>${m[2]}</span><div><b>${esc(m[1])}</b><small>${mobileModuleHint(state.area,m[0])}</small></div></button>`).join('')+(can('settings')?`<button class="more-item ${state.module==='settings'?'active':''}" data-route-module="settings" type="button"><span>⌁</span><div><b>Beállítások</b><small>Megjelenés és rendszer</small></div></button>`:'');
    bindDynamicNavigation();
  }
  function navButton(m,mobile=false,settings=false){const active=state.module===m[0];if(mobile)return `<button class="mobile-nav ${active?'active':''}" data-route-area="${state.area}" data-route-module="${m[0]}" type="button"><span>${m[2]}</span><small>${esc(m[1])}</small></button>`;return `<button class="nav-item ${active?'active':''}" ${settings?'data-route-module="settings"':`data-route-area="${state.area}" data-route-module="${m[0]}"`} type="button" aria-label="${esc(m[1])}" title="${esc(m[1])}"><span class="nav-glyph">${m[2]}</span><span class="nav-label">${esc(m[1])}</span></button>`}
  function mobileModuleHint(area,m){const map={trainings:'Edzések kezelése',matches:'Meccsek és részletek',teams:'Csapatok és keretek',fees:'Díjak és fizetések',competition:'Tabella és forrásadatok',passes:'Bérletek és jogosultságok'};return map[m]||`${AREAS[area].label} modul`}
  function bindDynamicNavigation(){$$('[data-route-module]').forEach(b=>b.onclick=()=>{const m=b.dataset.routeModule;if(m==='settings')setRoute(state.area,'settings');else setRoute(b.dataset.routeArea||state.area,m);$('#mobileMoreDialog')?.close()});$('[data-action="more"]')?.addEventListener('click',()=>$('#mobileMoreDialog')?.showModal())}

  function metric(label,value,note){return `<article class="metric-card"><small>${esc(label)}</small><strong>${value==null?'–':esc(value)}</strong><span>${esc(note)}</span></article>`}
  function eventRow(e){const s=e.startsAt||e.starts_at;return `<div class="event-row"><span class="event-accent" style="background:${esc(e.color||'#f7b700')}"></span><div class="event-main"><strong>${esc(e.title||((e.eventType||e.event_type)==='match'?'Meccs':'Edzés'))}</strong><small>${esc(e.teamName||e.team_name||'')} · ${esc(e.court||e.venue||'')}</small></div><div class="event-meta"><b>${esc(fmtDate(s))}</b><span>${esc(fmtTime(s))}</span></div></div>`}
  function teamRow(t){return `<div class="team-row"><span class="team-color" style="background:${esc(t.color||'#f7b700')}"></span><div><strong>${esc(t.name)}</strong><small>${esc(t.season||cfg.DEFAULT_SEASON)}</small></div><span class="team-count">${t.playerCount==null?'–':esc(t.playerCount)} fő</span></div>`}
  function healthRows(items){return items.map(([label,stateText,stateClass])=>`<div class="health-row"><span>${esc(label)}</span><b class="${stateClass||''}">${esc(stateText)}</b></div>`).join('')}

  function renderOverview(){
    const tpl=$('#overviewTemplate').content.cloneNode(true), root=document.createElement('div');root.appendChild(tpl);
    const isComp=state.area==='competition', ov=state.overview||{}, events=state.events.slice().sort((a,b)=>new Date(a.startsAt||a.starts_at)-new Date(b.startsAt||b.starts_at)).slice(0,6);
    root.querySelector('.page-intro h2').textContent=`${currentArea().label} áttekintés`;root.querySelector('.page-intro p').textContent=isComp?'Csapatok, következő események és működési állapot egy helyen.':'Tömegsport működés áttekintése; a production parity modulonként kerül át.';
    root.querySelector('[data-slot="metrics"]').innerHTML=isComp?[
      metric('Aktív csapatok',ov.teamCount??state.teams.length,'Versenysport'),metric('Aktív játékosok',ov.activePlayerCount??(state.players.length||42),'Sportolói adatbázis'),metric('Következő események',events.length,'Betöltött időablak'),metric('Adatút',configured()?'DIRECT':'PREVIEW','Supabase PWA')
    ].join(''):[metric('Aktív szintek','3','Kezdő · KH · Haladó'),metric('Mai edzések','–','RPC migráció után'),metric('Foglalások','–','RPC migráció után'),metric('Adatút',configured()?'DIRECT':'PREVIEW','Supabase PWA')].join('');
    root.querySelector('[data-slot="primary-title"]').textContent=isComp?'Következő események':'Következő tömegsport edzések';root.querySelector('[data-slot="primary-copy"]').textContent=isComp?'Edzések és meccsek időrendben.':'A régi Manager parity után innen lesz kezelhető.';root.querySelector('[data-slot="primary"]').innerHTML=isComp?(events.map(eventRow).join('')||emptyInline('Nincs esemény a betöltött időablakban.')):migrationNotice('A Tömegsport read-only RPC-k még nincsenek telepítve.');
    root.querySelector('[data-slot="secondary-title"]').textContent=isComp?'Csapatok':'Tömegsport halmaz';root.querySelector('[data-slot="secondary-copy"]').textContent=isComp?'Aktív versenycsapatok.':'Kezdő / Középhaladó / Haladó.';root.querySelector('[data-slot="secondary"]').innerHTML=isComp?(state.teams.map(teamRow).join('')||emptyInline('Nincs csapat.')):`<div class="simple-list"><div><b>Kezdő</b><small>foglalás + várólista</small></div><div><b>Középhaladó</b><small>foglalás + várólista</small></div><div><b>Haladó</b><small>foglalás + várólista</small></div></div>`;
    root.querySelector('[data-slot="health"]').innerHTML=healthRows([['PWA shell','PASS','ok'],['Responsive layout','PASS','ok'],['Edzéstervezés','KIMARAD','muted'],['Write műveletek','MÉG NEM','muted']]);
    $('#viewContent').replaceChildren(...root.childNodes);
  }

  function renderModule(){
    const m=state.module;
    if(m==='settings'){renderSettings();return}
    if(m==='overview'){renderOverview();return}
    if(m==='calendar'){renderCalendar();return}
    if(state.area==='competition'&&m==='teams'){renderTeams();return}
    if(state.area==='competition'&&m==='players'){renderPlayers();return}
    if(state.area==='competition'&&m==='trainings'){renderEventList('Edzések','A versenycsapatok edzései.',e=>(e.eventType||e.event_type)==='training');return}
    if(state.area==='competition'&&m==='matches'){renderEventList('Meccsek','Hazai és idegenbeli mérkőzések.',e=>(e.eventType||e.event_type)==='match');return}
    if(state.area==='competition'&&m==='fees'){renderPlaceholder('Díjak','A jelenlegi havi díj-/fizetési mátrix production parityje ide kerül.',['Játékosonkénti havi státusz','Edzői díj','Bérlet','Audit / felülírás']);return}
    if(state.area==='competition'&&m==='competition'){renderPlaceholder('Versenyadatok','Competition Core: tabella, teljes meccslista, BRSZ/MRSZ források és konfliktusok.',['054 Competition Core backend előtt nincs production adat','Saját csapatok meccsei az events bridge-en keresztül','Külső liga-meccsek nem kerülnek az events táblába']);return}
    if(state.area==='mass'&&m==='trainings'){renderPlaceholder('Edzések','Tömegsport edzéskezelés migrációs helye.',['Kezdő / Középhaladó / Haladó','kapacitás és várólista','jelentkezők és első edzés jelölés']);return}
    if(state.area==='mass'&&m==='athletes'){renderPlaceholder('Sportolók','A Tömegsport sportolói adatbázis és jelentkezési előzmények migrációs helye.',['keresés és státusz','bérletellenőrzés','edzéselőzmény']);return}
    if(state.area==='mass'&&m==='passes'){renderPlaceholder('Bérletek','Bérletek és jogosultságok migrációs helye.',['5 / 10 alkalmas bérlet','érvényességi kivételek','ellenőrzési állapot']);return}
    renderPlaceholder(moduleMeta()?.[1]||'Modul','A modul foundation helye.',['read-only migráció','parity teszt','write csak később']);
  }

  function renderPlaceholder(title,copy,items=[]){$('#viewContent').innerHTML=`<div class="page-intro"><div><h2>${esc(title)}</h2><p>${esc(copy)}</p></div><span class="migration-badge">MIGRÁCIÓ</span></div><article class="panel placeholder-panel"><div class="placeholder-glyph">${moduleMeta()?.[2]||'◇'}</div><div><h3>${esc(title)}</h3><p>${esc(copy)}</p><ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="migration-note"><b>V0.3 szabály:</b> ez a modul még nem váltja le a régi Manager production funkcióját.</div></div></article>`}
  function migrationNotice(textValue){return `<div class="migration-notice"><b>Read-only foundation</b><span>${esc(textValue)}</span></div>`}
  function emptyInline(v){return `<div class="empty-inline">${esc(v)}</div>`}

  function renderEventList(title,copy,predicate){const rows=state.events.filter(predicate).sort((a,b)=>new Date(a.startsAt||a.starts_at)-new Date(b.startsAt||b.starts_at));$('#viewContent').innerHTML=`<div class="page-intro"><div><h2>${esc(title)}</h2><p>${esc(copy)}</p></div><span class="read-only-badge">READ-ONLY</span></div><article class="panel"><div class="stack">${rows.map(eventRow).join('')||emptyInline('Nincs esemény a betöltött időablakban.')}</div></article>`}

  function renderTeams(){$('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Csapatok</h2><p>Aktív versenycsapatok. A szerkesztés a write-parity fázisban kerül át.</p></div><span class="read-only-badge">READ-ONLY</span></div><div class="team-grid">${state.teams.map(t=>`<article class="team-card" style="--team-color:${esc(t.color||'#f7b700')}"><h3>${esc(t.name)}</h3><p>${esc(t.season||cfg.DEFAULT_SEASON)}</p><div class="team-stats"><div class="mini-stat"><small>Játékosok</small><b>${t.playerCount==null?'–':esc(t.playerCount)}</b></div><div class="mini-stat"><small>Azonosító</small><b>${esc(t.legacyTeamId||t.legacy_team_id||'–')}</b></div></div></article>`).join('')||emptyInline('Nincs csapat.')}</div>`}

  function medicalClass(v){const d=safeDate(v);if(!d)return'';const days=(d-Date.now())/864e5;return days<0?'medical-expired':days<92?'medical-warn':''}
  function playerRows(){const q=state.playerSearch.toLocaleLowerCase('hu');return state.players.filter(p=>{if(state.playerTeam&&text(p.teamId||p.team_id)!==state.playerTeam)return false;if(q&&!`${p.name||''} ${p.displayName||''} ${p.email||''}`.toLocaleLowerCase('hu').includes(q))return false;return true})}
  function renderPlayers(){const rows=playerRows(),opts='<option value="">Minden csapat</option>'+state.teams.map(t=>`<option value="${esc(t.id)}" ${state.playerTeam===t.id?'selected':''}>${esc(t.name)}</option>`).join('');$('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Játékosok</h2><p>Teljes sportolói adatbázis. Desktopon tábla, keskeny komponensben kártyalista.</p></div><span class="read-only-badge">READ-ONLY</span></div><div class="filter-bar"><label class="search-field"><span class="sr-only">Keresés</span><input id="playerSearch" type="search" value="${esc(state.playerSearch)}" placeholder="Keresés név vagy email alapján…"></label><label class="field compact"><span class="sr-only">Csapat</span><select id="playerTeamFilter">${opts}</select></label></div><article class="panel player-surface"><div class="responsive-table-wrap"><table class="data-table"><thead><tr><th>Játékos</th><th>Csapat</th><th>Poszt</th><th>Mez</th><th>Igazolás</th><th>Sportorvosi</th><th>Edzés</th><th>Meccs</th></tr></thead><tbody>${rows.map(p=>`<tr><td class="player-cell"><b>${esc(p.displayName||p.name||'–')}</b><small>${esc(p.email||'')}</small></td><td>${esc(p.teamName||'–')}</td><td>${esc(p.position||'–')}</td><td>${esc(p.jerseyNo??'–')}</td><td>${esc(p.licenseNo||'–')}</td><td class="${medicalClass(p.medicalValidUntil)}">${esc(p.medicalValidUntil?fmtDate(p.medicalValidUntil):'–')}</td><td><b>${esc(p.trainingPresent??0)}/${esc(p.trainingMarked??0)}</b></td><td><b>${esc(p.matchPresent??0)}/${esc(p.matchMarked??0)}</b></td></tr>`).join('')}</tbody></table></div><div class="player-card-list">${rows.map(playerCard).join('')||emptyInline('Nincs megjeleníthető játékos.')}</div>${rows.length?'':'<div class="desktop-empty empty-inline">Nincs megjeleníthető játékos.</div>'}</article>`;$('#playerSearch')?.addEventListener('input',e=>{state.playerSearch=e.target.value||'';renderPlayers()});$('#playerTeamFilter')?.addEventListener('change',e=>{state.playerTeam=e.target.value;renderPlayers()})}
  function playerCard(p){return `<article class="player-card"><div class="player-avatar">${esc(initials(p.displayName||p.name))}</div><div class="player-card-main"><div class="player-card-head"><b>${esc(p.displayName||p.name||'–')}</b><span>${p.jerseyNo!=null?'#'+esc(p.jerseyNo):''}</span></div><small>${esc(p.teamName||'–')} · ${esc(p.position||'–')}</small><div class="player-card-stats"><span>Edzés <b>${esc(p.trainingPresent??0)}/${esc(p.trainingMarked??0)}</b></span><span>Meccs <b>${esc(p.matchPresent??0)}/${esc(p.matchMarked??0)}</b></span></div></div><span class="chevron">›</span></article>`}

  function startOfWeek(d){const x=new Date(d);x.setHours(0,0,0,0);const day=(x.getDay()+6)%7;x.setDate(x.getDate()-day);return x}
  function calendarWindow(){const a=new Date(state.calendarAnchor);a.setHours(0,0,0,0);if(state.calendarMode==='month'){return{from:new Date(a.getFullYear(),a.getMonth(),1),to:new Date(a.getFullYear(),a.getMonth()+1,1)}}if(state.calendarMode==='season'){const y=a.getMonth()>=7?a.getFullYear():a.getFullYear()-1;return{from:new Date(y,7,1),to:new Date(y+1,7,1)}}const from=startOfWeek(a),to=new Date(from);to.setDate(to.getDate()+7);return{from,to}}
  function calendarRangeText(){const {from,to}=calendarWindow(),end=new Date(to.getTime()-1);return`${fmtDate(from)} – ${fmtDate(end)}`}
  function renderCalendar(){const comp=state.area==='competition';if(!comp){renderPlaceholder('Naptár','A Tömegsport naptár production parityje külön scoped RPC-vel kerül át.',['heti alapnézet','pálya/terem erőforrások','kapacitás és jelentkezések']);return}const opts='<option value="">Minden csapat</option>'+state.teams.map(t=>`<option value="${esc(t.id)}" ${state.calendarTeam===t.id?'selected':''}>${esc(t.name)}</option>`).join(''),filtered=state.events.filter(e=>(!state.calendarTeam||text(e.teamId||e.team_id)===state.calendarTeam)&&(!state.calendarType||text(e.eventType||e.event_type)===state.calendarType)).sort((a,b)=>new Date(a.startsAt||a.starts_at)-new Date(b.startsAt||b.starts_at)),groups=new Map();filtered.forEach(e=>{const d=safeDate(e.startsAt||e.starts_at);if(!d)return;const k=d.toISOString().slice(0,10);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(e)});$('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Naptár</h2><p>Desktopon információgazdag, mobilon agenda-szerű nézet; ugyanazzal az adatforrással.</p></div><div class="toolbar-actions"><div class="segmented" role="group" aria-label="Naptár nézet"><button class="${state.calendarMode==='week'?'active':''}" data-calendar-mode="week">HÉT</button><button class="${state.calendarMode==='month'?'active':''}" data-calendar-mode="month">HÓNAP</button><button class="${state.calendarMode==='season'?'active':''}" data-calendar-mode="season">SZEZON</button></div><button class="icon-button filter-toggle" id="calendarFilterBtn" type="button" aria-label="Szűrők" aria-expanded="false"><span>▽</span></button></div></div><div class="filter-panel" id="calendarFilterPanel" hidden><label class="field compact"><span>Csapat</span><select id="calendarTeamFilter">${opts}</select></label><label class="field compact"><span>Típus</span><select id="calendarTypeFilter"><option value="" ${state.calendarType===''?'selected':''}>Minden esemény</option><option value="training" ${state.calendarType==='training'?'selected':''}>Edzés</option><option value="match" ${state.calendarType==='match'?'selected':''}>Meccs</option></select></label><button class="filter-reset" id="calendarFilterReset" type="button" ${state.calendarTeam||state.calendarType?'':'hidden'}>Szűrők törlése</button></div><article class="panel calendar-panel"><div class="calendar-nav"><button class="button quiet" id="calendarPrev" type="button">← Előző</button><button class="button quiet" id="calendarToday" type="button">Ma</button><strong>${esc(calendarRangeText())}</strong><button class="button quiet" id="calendarNext" type="button">Következő →</button></div><div class="calendar-list">${groups.size?Array.from(groups.entries()).map(([key,items])=>`<div class="calendar-day"><div class="calendar-date">${esc(fmtDay(key+'T12:00:00Z'))}</div><div class="calendar-events">${items.map(e=>`<div class="calendar-event"><time>${esc(fmtTime(e.startsAt||e.starts_at))}</time><span class="dot" style="background:${esc(e.color||'#f7b700')}"></span><div><strong>${esc(e.title||((e.eventType||e.event_type)==='match'?'Meccs':'Edzés'))}</strong><small>${esc(e.teamName||e.team_name||'')} · ${esc(e.court||e.venue||'')}</small></div><span class="event-kind">${(e.eventType||e.event_type)==='match'?'MECCS':'EDZÉS'}</span></div>`).join('')}</div></div>`).join(''):emptyInline('Ebben az időszakban nincs betöltött esemény.')}</div></article>`;bindCalendarUi()}
  function bindCalendarUi(){$('#calendarFilterBtn')?.addEventListener('click',()=>{const b=$('#calendarFilterBtn'),open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));$('#calendarFilterPanel').hidden=!open});$('#calendarTeamFilter')?.addEventListener('change',e=>{state.calendarTeam=e.target.value;configured()?loadCalendar().then(renderCalendar).catch(err=>status(err.message,'error')):renderCalendar()});$('#calendarTypeFilter')?.addEventListener('change',e=>{state.calendarType=e.target.value;renderCalendar()});$('#calendarFilterReset')?.addEventListener('click',()=>{state.calendarTeam='';state.calendarType='';configured()?loadCalendar().then(renderCalendar).catch(err=>status(err.message,'error')):renderCalendar()});$$('[data-calendar-mode]').forEach(b=>b.addEventListener('click',()=>{state.calendarMode=b.dataset.calendarMode;configured()?loadCalendar().then(renderCalendar).catch(err=>status(err.message,'error')):renderCalendar()}));$('#calendarPrev')?.addEventListener('click',()=>shiftCalendar(-1));$('#calendarNext')?.addEventListener('click',()=>shiftCalendar(1));$('#calendarToday')?.addEventListener('click',()=>{state.calendarAnchor=new Date();configured()?loadCalendar().then(renderCalendar).catch(err=>status(err.message,'error')):renderCalendar()})}
  function shiftCalendar(dir){const d=new Date(state.calendarAnchor);if(state.calendarMode==='month')d.setMonth(d.getMonth()+dir);else if(state.calendarMode==='season')d.setFullYear(d.getFullYear()+dir);else d.setDate(d.getDate()+7*dir);state.calendarAnchor=d;configured()?loadCalendar().then(renderCalendar).catch(err=>status(err.message,'error')):renderCalendar()}

  function renderSettings(){$('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Beállítások</h2><p>Globális Manager beállítások. Az Edzéstervezés nem része ennek a migrációnak.</p></div></div><div class="settings-layout"><article class="panel"><div class="setting-row"><div><strong>Megjelenés</strong><small>Világos / sötét téma ezen az eszközön.</small></div><button class="button quiet" id="themeToggle" type="button">Téma váltása</button></div><div class="setting-row"><div><strong>Manager PWA</strong><small>${esc(cfg.BUILD)}</small></div><span class="status-pill ok">FOUNDATION</span></div><div class="setting-row"><div><strong>Edzéstervezés</strong><small>A jelenlegi migrációból tudatosan kihagyva.</small></div><span class="status-pill">KÉSŐBB</span></div></article></div>`;$('#themeToggle')?.addEventListener('click',()=>{const dark=document.body.classList.toggle('dark');localStorage.setItem('cc-manager-theme',dark?'dark':'light')})}
  function renderView(){renderModule();document.title=`${state.module==='settings'?'Beállítások':moduleMeta()?.[1]||'Manager'} – Club Control Manager`}

  async function refresh(){if(!configured()){status('Manager PWA konfigurációs hiba.','error');return}try{await loadLiveData()}catch(_){}}
  function bindStaticUi(){
    $$('.area-button,.area-choice').forEach(b=>b.addEventListener('click',()=>{switchArea(b.dataset.area);$('#areaDialog')?.close()}));
    $('#mobileAreaBtn')?.addEventListener('click',()=>$('#areaDialog')?.showModal());$('#areaDialogClose')?.addEventListener('click',()=>$('#areaDialog')?.close());$('#mobileMoreClose')?.addEventListener('click',()=>$('#mobileMoreDialog')?.close());
    ['areaDialog','mobileMoreDialog'].forEach(id=>$('#'+id)?.addEventListener('click',e=>{if(e.target===$('#'+id))$('#'+id).close()}));
    $('#refreshBtn')?.addEventListener('click',refresh);$('#managerMenuBtn')?.addEventListener('click',()=>$('#accountDialog')?.showModal());$('#accountDialogClose')?.addEventListener('click',()=>$('#accountDialog')?.close());$('#accountDialog')?.addEventListener('click',e=>{if(e.target===$('#accountDialog'))$('#accountDialog').close()});
    $('#logoutBtn')?.addEventListener('click',async()=>{if(state.supabase)await state.supabase.auth.signOut({scope:'local'});location.reload()});
    $('#requestCodeBtn')?.addEventListener('click',requestCode);$('#verifyCodeBtn')?.addEventListener('click',verifyCode);$('#changeEmailBtn')?.addEventListener('click',()=>showLogin('loginEmailStep'));$('#loginEmail')?.addEventListener('keydown',e=>{if(e.key==='Enter')requestCode()});$('#loginCode')?.addEventListener('keydown',e=>{if(e.key==='Enter')verifyCode()});$('#loginCode')?.addEventListener('input',e=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,10)});
    window.addEventListener('popstate',()=>{resolveInitialRoute();renderChrome();renderView()});
  }

  async function boot(){
    if(localStorage.getItem('cc-manager-theme')==='dark')document.body.classList.add('dark');resolveInitialRoute();bindStaticUi();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('SW:',err));
    if(!configured()){hideLogin();status('Manager PWA konfigurációs hiba: a Supabase kapcsolat nincs beállítva.','error');renderChrome();renderView();return}
    try{state.supabase=await createSupabase();showLogin('loginLoadingStep');const {data:{session},error}=await state.supabase.auth.getSession();if(error)throw error;state.session=session||null;if(!session){showLogin('loginEmailStep');return}await loadLiveData();hideLogin();if(!location.hash)setRoute(state.area,'overview',{replace:true})}catch(err){console.error(err);status(err.message||'Manager indítási hiba.','error');showLogin('loginEmailStep')}
  }

  boot();
})();
