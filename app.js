(()=>{
  'use strict';

  const cfg=Object.freeze({...{
    BUILD:'manager-pwa-v0.4.0-competition-core-readonly',DATA_MODE:'supabase',SUPABASE_URL:'',SUPABASE_PUBLISHABLE_KEY:'',DEFAULT_SEASON:'2026/27',DEFAULT_AREA:'competition'
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
    mode:String(cfg.DATA_MODE||'demo').toLowerCase(),supabase:null,session:null,manager:null,permissions:[],teams:[],players:[],events:[],calendarEvents:[],activityEvents:[],overview:null,
    area:['mass','competition'].includes(cfg.DEFAULT_AREA)?cfg.DEFAULT_AREA:'competition',module:'overview',calendarMode:'week',calendarAnchor:new Date(),calendarTeam:'',calendarType:'',playerTeam:'',playerSearch:'',eventTeam:'',eventPeriod:'upcoming',overviewTeam:'',selectedTeam:'',selectedPlayer:'',pendingEmail:'',loading:false
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
      {id:'10000000-0000-4000-8000-000000000001',legacyTeamId:'team_w1',name:'BEAC Női I.',season:'2026/27',color:'#B76508',active:true,playerCount:5,coaches:'Edző A',defaultVenue:'Bogdánfy Sportcsarnok',defaultCourt:'1. pálya'},
      {id:'10000000-0000-4000-8000-000000000002',legacyTeamId:'team_w2',name:'BEAC Női II.',season:'2026/27',color:'#F3D34A',active:true,playerCount:4,coaches:'Edző B',defaultVenue:'Bogdánfy Sportcsarnok',defaultCourt:'2. pálya'},
      {id:'10000000-0000-4000-8000-000000000003',legacyTeamId:'team_m1',name:'BEAC Férfi',season:'2026/27',color:'#6AA84F',active:true,playerCount:4,coaches:'Edző C',defaultVenue:'Bogdánfy Sportcsarnok',defaultCourt:'3. pálya'}
    ];
    const people=['Anna Kiss','Petra Nagy','Luca Tóth','Réka Varga','Nóri Fekete','Dániel Kovács','Márk Szabó','Bence Horváth','Eszter Molnár','Fanni Balogh','Júlia Papp','Ádám Németh','Gergő Lakatos'];
    const positions=['Feladó','Szélső','Center','Átló','Liberó'];
    const players=people.map((name,i)=>({playerId:'p'+(i+1),name,displayName:name,email:`demo${i+1}@example.com`,position:positions[i%positions.length],jerseyNo:(i+1),active:true,licenseNo:'IG'+String(1000+i),medicalValidUntil:i===2?'2026-10-10':'2027-03-31',teamId:teams[i%3].id,teamName:teams[i%3].name,trainingPresent:12+i%5,trainingMarked:15+i%4,matchPresent:3+i%3,matchMarked:4+i%3,jerseySize:'M',shortsSize:'M'}));
    const now=Date.now(), day=864e5;
    const events=[];
    for(let i=-8;i<36;i+=2){
      const team=teams[Math.abs(i)%3]; const isMatch=i%8===0; const start=new Date(now+i*day+18*36e5);
      events.push({eventId:'e'+i,teamId:team.id,teamName:team.name,eventType:isMatch?'match':'training',title:isMatch?`${team.name} – Ellenfél`:'Edzés',startsAt:start.toISOString(),endsAt:new Date(start.getTime()+(isMatch?150:120)*60000).toISOString(),court:team.defaultCourt,venue:team.defaultVenue,color:team.color,homeAway:isMatch?'home':null,status:'active',yesCount:8+(Math.abs(i)%5),noCount:1,unknownCount:2+(Math.abs(i)%3)});
    }
    return {manager:{displayName:'Manager PWA preview',email:'demo@local',role:'preview'},permissions:['*'],teams,players,events,calendarEvents:events,activityEvents:events,overview:{teamCount:3,activePlayerCount:players.length,nextEvents:events.filter(x=>new Date(x.startsAt)>=new Date()).slice(0,12),teams}};
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

  async function loadLiveData(){
    state.loading=true;status('Manager adatok frissítése…');
    try{
      const b=await rpc('cc_manager_bootstrap_v1');
      if(!b?.manager)throw new Error('A Manager bootstrap nem adott érvényes fiókot.');
      state.manager=b.manager;state.permissions=Array.isArray(b.permissions)?b.permissions:[];state.teams=Array.isArray(b.teams)?b.teams:[];applyManager();
      const jobs=[];
      if(can('competition.overview'))jobs.push(loadOverview());else state.overview={};
      if(can('competition.teams'))jobs.push(loadTeams());else state.teams=Array.isArray(b.teams)?b.teams:[];
      if(can('competition.players'))jobs.push(loadPlayers());else state.players=[];
      if(can('competition.calendar'))jobs.push(loadCalendar(),loadActivityEvents());else{state.calendarEvents=[];state.activityEvents=[];state.events=[]}
      await Promise.all(jobs);
      renderChrome();renderView();status('Manager PWA közvetlen Supabase kapcsolat aktív.','success');
    }catch(err){console.error(err);status(err.message||'A Manager adatok betöltése sikertelen.','error');throw err}
    finally{state.loading=false}
  }
  async function loadOverview(teamId=state.overviewTeam||null){const d=await rpc('cc_manager_overview_v1',{p_team_id:teamId});state.overview=d||{}}
  async function loadTeams(){const d=await rpc('cc_manager_teams_v1');state.teams=Array.isArray(d)?d:[];if(state.selectedTeam&&!state.teams.some(t=>t.id===state.selectedTeam))state.selectedTeam=''}
  async function loadPlayers(){const d=await rpc('cc_manager_players_v1',{p_team_id:null,p_query:''});state.players=Array.isArray(d)?d:[]}
  async function loadCalendar(){const {from,to}=calendarWindow();const d=await rpc('cc_manager_calendar_v1',{p_from:from.toISOString(),p_to:to.toISOString(),p_team_id:state.calendarTeam||null});state.calendarEvents=Array.isArray(d)?d:[];state.events=state.calendarEvents}
  async function loadActivityEvents(){const now=new Date(),seasonYear=now.getMonth()>=7?now.getFullYear():now.getFullYear()-1,from=new Date(seasonYear,7,1),to=new Date(seasonYear+1,7,1);const d=await rpc('cc_manager_calendar_v1',{p_from:from.toISOString(),p_to:to.toISOString(),p_team_id:null});state.activityEvents=Array.isArray(d)?d:[]}
  function useDemo(){const d=demoData();Object.assign(state,d);state.calendarEvents=d.calendarEvents;state.activityEvents=d.activityEvents;applyManager();renderChrome();renderView();status('Preview mód: nincs production adatkapcsolat. A csomag nem ír semmit.')}

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
  function rsvpTotal(e){return num(e.yesCount)+num(e.noCount)+num(e.unknownCount)}
  function attendanceSummary(players=state.players){return players.reduce((acc,p)=>{acc.trainingPresent+=num(p.trainingPresent);acc.trainingMarked+=num(p.trainingMarked);acc.matchPresent+=num(p.matchPresent);acc.matchMarked+=num(p.matchMarked);return acc},{trainingPresent:0,trainingMarked:0,matchPresent:0,matchMarked:0})}
  function teamPlayers(teamId){return state.players.filter(p=>text(p.teamId||p.team_id)===text(teamId))}
  function teamAttendance(teamId){return attendanceSummary(teamPlayers(teamId))}
  function teamOptions(value=''){return '<option value="">Minden csapat</option>'+state.teams.map(t=>`<option value="${esc(t.id)}" ${text(value)===text(t.id)?'selected':''}>${esc(t.name)}</option>`).join('')}
  function rsvpPills(e){return `<div class="rsvp-pills" aria-label="Részvételi jelzések"><span class="yes">J ${num(e.yesCount)}</span><span class="no">N ${num(e.noCount)}</span><span class="unknown">? ${num(e.unknownCount)}</span></div>`}
  function eventPlace(e){return text(e.court)||text(e.venue)||'–'}
  function eventRichRow(e){const s=eventStart(e),kind=eventType(e)==='match'?'MECCS':'EDZÉS';return `<button class="event-rich-row ${isEventPast(e)?'past':''}" type="button" data-event-id="${esc(e.eventId||e.id)}"><span class="event-accent" style="background:${esc(e.color||teamById(eventTeamId(e))?.color||'#f7b700')}"></span><div class="event-date"><b>${esc(s?fmtDate(s):'–')}</b><span>${esc(s?fmtTime(s):'–')}</span></div><div class="event-main"><strong>${esc(e.title||kind)}</strong><small>${esc(e.teamName||e.team_name||'')} · ${esc(eventPlace(e))}</small></div><span class="event-kind">${kind}</span>${rsvpPills(e)}</button>`}
  function detailPair(label,value,cls=''){return `<div class="detail-pair ${cls}"><small>${esc(label)}</small><b>${esc(value==null||value===''?'–':value)}</b></div>`}
  function findEventById(id){return [...state.activityEvents,...state.calendarEvents].find(e=>text(e.eventId||e.id)===text(id))||null}
  function openEventDetail(id){const e=findEventById(id);if(!e)return;const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle'),s=eventStart(e),en=eventEnd(e);title.textContent=e.title||(eventType(e)==='match'?'Meccs':'Edzés');body.innerHTML=`<div class="entity-hero event-entity-hero"><span class="event-detail-mark" style="background:${esc(e.color||'#f7b700')}"></span><div><b>${esc(e.teamName||'–')}</b><span>${esc(eventType(e)==='match'?'Meccs':'Edzés')} · ${esc(s?fmtDate(s):'–')} ${esc(s?fmtTime(s):'–')}</span></div></div><div class="detail-grid">${detailPair('Kezdés',s?`${fmtDate(s)} ${fmtTime(s)}`:'–')}${detailPair('Befejezés',en?fmtTime(en):'–')}${detailPair('Helyszín',e.venue)}${detailPair('Cím',e.address)}${detailPair('Pálya',e.court)}${detailPair('Találkozó',e.meetingAt?`${fmtTime(e.meetingAt)} · ${e.meetingPlace||''}`:(e.meetingPlace||'–'))}</div><div class="panel-subhead"><div><h4>Részvételi jelzések</h4><p>Aktuális RSVP állapot.</p></div></div><div class="attendance-detail rsvp-detail"><div><small>Jövök</small><b>${num(e.yesCount)}</b><span>fő</span></div><div><small>Nem jövök</small><b>${num(e.noCount)}</b><span>fő</span></div><div><small>Nincs válasz</small><b>${num(e.unknownCount)}</b><span>fő</span></div></div>`;d?.showModal()}
  function bindEventDetailActions(){$$('[data-event-id]').forEach(el=>el.addEventListener('click',()=>openEventDetail(el.dataset.eventId)))}
  function renderOverview(){
    if(state.area!=='competition'){
      const tpl=$('#overviewTemplate').content.cloneNode(true),root=document.createElement('div');root.appendChild(tpl);
      root.querySelector('.page-intro h2').textContent='Tömegsport áttekintés';root.querySelector('.page-intro p').textContent='A production parity külön mass-sport RPC-k után kerül ide.';
      root.querySelector('[data-slot="metrics"]').innerHTML=[metric('Aktív szintek','3','Kezdő · KH · Haladó'),metric('Mai edzések','–','RPC migráció után'),metric('Foglalások','–','RPC migráció után'),metric('Adatút',configured()?'DIRECT':'PREVIEW','Supabase PWA')].join('');
      root.querySelector('[data-slot="primary-title"]').textContent='Tömegsport';root.querySelector('[data-slot="primary-copy"]').textContent='Következő migrációs modul.';root.querySelector('[data-slot="primary"]').innerHTML=migrationNotice('A Tömegsport read-only RPC-k még nincsenek telepítve.');root.querySelector('[data-slot="secondary-title"]').textContent='Halmazok';root.querySelector('[data-slot="secondary-copy"]').textContent='Kezdő / Középhaladó / Haladó.';root.querySelector('[data-slot="secondary"]').innerHTML='<div class="simple-list"><div><b>Kezdő</b><small>foglalás + várólista</small></div><div><b>Középhaladó</b><small>foglalás + várólista</small></div><div><b>Haladó</b><small>foglalás + várólista</small></div></div>';root.querySelector('[data-slot="health"]').innerHTML=healthRows([['PWA shell','PASS','ok'],['Responsive layout','PASS','ok'],['Edzéstervezés','KIMARAD','muted'],['Write műveletek','MÉG NEM','muted']]);$('#viewContent').replaceChildren(...root.childNodes);return;
    }
    const ov=state.overview||{},selected=state.overviewTeam,players=selected?teamPlayers(selected):state.players,att=attendanceSummary(players),now=Date.now();
    const events=state.activityEvents.filter(e=>(!selected||eventTeamId(e)===selected)&&(eventStart(e)?.getTime()||0)>=now-2*3600000).sort((a,b)=>eventStart(a)-eventStart(b));
    const next=events.slice(0,6),nextEvent=next[0],unknown=nextEvent?num(nextEvent.unknownCount):0;
    const teamSelect=`<label class="field compact overview-team-filter"><span>Csapat</span><select id="overviewTeamFilter">${teamOptions(selected)}</select></label>`;
    $('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Versenysport áttekintés</h2><p>Valós csapat-, esemény-, részvételi és jelenléti adatok közvetlenül a Supabase-ből.</p></div><div class="intro-actions">${teamSelect}<span class="read-only-badge">READ-ONLY V0.4</span></div></div>
      <div class="metric-grid">${metric('Aktív csapatok',ov.teamCount??state.teams.length,selected?'Kiválasztott csapat':'Versenysport')}${metric('Aktív játékosok',ov.activePlayerCount??players.length,'Aktív keret')}${metric('Edzésjelenlét',pctText(att.trainingPresent,att.trainingMarked),`${att.trainingPresent}/${att.trainingMarked} lezárt jelölés`)}${metric('Meccsjelenlét',pctText(att.matchPresent,att.matchMarked),`${att.matchPresent}/${att.matchMarked} lezárt jelölés`)}</div>
      <div class="core-dashboard-grid">
        <article class="panel dashboard-events"><div class="panel-head"><div><h3>Következő események</h3><p>Edzések és meccsek időrendben.</p></div><span class="status-pill">${next.length} db</span></div><div class="stack">${next.map(eventRichRow).join('')||emptyInline('Nincs következő esemény.')}</div></article>
        <article class="panel"><div class="panel-head"><div><h3>Részvételi jelzések</h3><p>A következő esemény RSVP állapota.</p></div></div>${nextEvent?`<div class="next-response-card"><b>${esc(nextEvent.title||'Esemény')}</b><small>${esc(nextEvent.teamName||'')} · ${esc(fmtDate(eventStart(nextEvent)))} ${esc(fmtTime(eventStart(nextEvent)))}</small><div class="response-bars"><div><span>Jövök</span><b>${num(nextEvent.yesCount)}</b></div><div><span>Nem jövök</span><b>${num(nextEvent.noCount)}</b></div><div class="unknown"><span>Nincs válasz</span><b>${unknown}</b></div></div></div>`:emptyInline('Nincs következő esemény.')}</article>
        <article class="panel"><div class="panel-head"><div><h3>Csapatok</h3><p>Keret és tényleges jelenléti arány.</p></div></div><div class="team-summary-list">${state.teams.filter(t=>!selected||text(t.id)===selected).map(t=>{const a=teamAttendance(t.id);return `<button type="button" class="team-summary-row" data-open-team="${esc(t.id)}"><span class="team-color" style="background:${esc(t.color||'#f7b700')}"></span><div><b>${esc(t.name)}</b><small>${esc(t.playerCount??teamPlayers(t.id).length)} fő · Edzés ${esc(pctText(a.trainingPresent,a.trainingMarked))}</small></div><span>›</span></button>`}).join('')||emptyInline('Nincs csapat.')}</div></article>
      </div>`;
    $('#overviewTeamFilter')?.addEventListener('change',async e=>{state.overviewTeam=e.target.value;try{if(configured())await loadOverview();renderOverview()}catch(err){status(err.message,'error')}});
    $$('[data-open-team]').forEach(b=>b.addEventListener('click',()=>{state.selectedTeam=b.dataset.openTeam;setRoute('competition','teams')}));bindEventDetailActions();
  }

  function renderModule(){
    const m=state.module;
    if(m==='settings'){if(!can('settings')){renderPermissionDenied();return}renderSettings();return}
    if(!can(`${state.area}.${m}`)){renderPermissionDenied();return}
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

  function renderPlaceholder(title,copy,items=[]){$('#viewContent').innerHTML=`<div class="page-intro"><div><h2>${esc(title)}</h2><p>${esc(copy)}</p></div><span class="migration-badge">MIGRÁCIÓ</span></div><article class="panel placeholder-panel"><div class="placeholder-glyph">${moduleMeta()?.[2]||'◇'}</div><div><h3>${esc(title)}</h3><p>${esc(copy)}</p><ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="migration-note"><b>V0.4 szabály:</b> ez a modul még nem váltja le a régi Manager production funkcióját.</div></div></article>`}
  function renderPermissionDenied(){$('#viewContent').innerHTML=`<article class="panel placeholder-panel"><div class="placeholder-glyph">⊘</div><div><h3>Nincs hozzáférés</h3><p>Ehhez a Manager modulhoz a jelenlegi fiókodnak nincs megtekintési jogosultsága.</p></div></article>`}
  function migrationNotice(textValue){return `<div class="migration-notice"><b>Read-only foundation</b><span>${esc(textValue)}</span></div>`}
  function emptyInline(v){return `<div class="empty-inline">${esc(v)}</div>`}

  function filteredActivityEvents(predicate){
    const now=Date.now();return state.activityEvents.filter(e=>predicate(e)&&(!state.eventTeam||eventTeamId(e)===state.eventTeam)&&(state.eventPeriod==='all'||(state.eventPeriod==='upcoming'&&!isEventPast(e))||(state.eventPeriod==='past'&&isEventPast(e)))).sort((a,b)=>eventStart(a)-eventStart(b));
  }
  function renderEventList(title,copy,predicate){
    const rows=filteredActivityEvents(predicate),active=!!state.eventTeam||state.eventPeriod!=='upcoming';
    $('#viewContent').innerHTML=`<div class="page-intro"><div><h2>${esc(title)}</h2><p>${esc(copy)}</p></div><span class="read-only-badge">READ-ONLY</span></div>
      <div class="filter-bar module-filter-bar"><label class="field compact"><span>Csapat</span><select id="eventTeamFilter">${teamOptions(state.eventTeam)}</select></label><label class="field compact"><span>Időszak</span><select id="eventPeriodFilter"><option value="upcoming" ${state.eventPeriod==='upcoming'?'selected':''}>Következő</option><option value="past" ${state.eventPeriod==='past'?'selected':''}>Elmúlt</option><option value="all" ${state.eventPeriod==='all'?'selected':''}>Mind</option></select></label><button class="filter-reset" id="eventFilterReset" ${active?'':'hidden'} type="button">Szűrők törlése</button></div>
      <article class="panel"><div class="stack">${rows.map(eventRichRow).join('')||emptyInline('Nincs esemény ebben a szűrésben.')}</div></article>`;
    $('#eventTeamFilter')?.addEventListener('change',e=>{state.eventTeam=e.target.value;renderEventList(title,copy,predicate)});$('#eventPeriodFilter')?.addEventListener('change',e=>{state.eventPeriod=e.target.value;renderEventList(title,copy,predicate)});$('#eventFilterReset')?.addEventListener('click',()=>{state.eventTeam='';state.eventPeriod='upcoming';renderEventList(title,copy,predicate)});bindEventDetailActions();
  }

  function renderTeams(){
    if(!state.selectedTeam&&state.teams[0])state.selectedTeam=state.teams[0].id;const selected=teamById(state.selectedTeam),roster=selected?teamPlayers(selected.id):[],att=selected?teamAttendance(selected.id):attendanceSummary([]);
    $('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Csapatok</h2><p>Csapatkeret, alapadatok és tényleges jelenléti összesítés.</p></div><span class="read-only-badge">READ-ONLY</span></div>
      <div class="team-master-detail"><div class="team-master-list">${state.teams.map(t=>`<button type="button" class="team-master-card ${text(t.id)===text(state.selectedTeam)?'active':''}" data-team-id="${esc(t.id)}" style="--team-color:${esc(t.color||'#f7b700')}"><span class="team-color-bar"></span><div><b>${esc(t.name)}</b><small>${esc(t.season||cfg.DEFAULT_SEASON)} · ${esc(t.playerCount??teamPlayers(t.id).length)} fő</small></div><span>›</span></button>`).join('')||emptyInline('Nincs csapat.')}</div>
      <article class="panel team-detail-panel">${selected?`<div class="team-detail-head"><div><span class="eyebrow">${esc(selected.season||cfg.DEFAULT_SEASON)}</span><h3>${esc(selected.name)}</h3></div><span class="team-detail-dot" style="background:${esc(selected.color||'#f7b700')}"></span></div><div class="detail-grid">${detailPair('Edző(k)',selected.coaches)}${detailPair('Alaphelyszín',selected.defaultVenue)}${detailPair('Alappálya',selected.defaultCourt)}${detailPair('Aktív játékosok',roster.length)}${detailPair('Edzésjelenlét',pctText(att.trainingPresent,att.trainingMarked))}${detailPair('Meccsjelenlét',pctText(att.matchPresent,att.matchMarked))}</div><div class="panel-subhead"><div><h4>Játékoskeret</h4><p>Lezárt jelenléti adatok alapján.</p></div></div><div class="roster-list">${roster.map(p=>`<button class="roster-player" type="button" data-player-id="${esc(p.playerId)}"><span class="player-avatar small">${esc(initials(p.displayName||p.name))}</span><div><b>${esc(p.displayName||p.name)}</b><small>${esc(p.position||'–')} · ${p.jerseyNo!=null?'#'+esc(p.jerseyNo):'nincs mezszám'}</small></div><span class="roster-att">${esc(pctText(p.trainingPresent,p.trainingMarked))}</span><span>›</span></button>`).join('')||emptyInline('Nincs aktív játékos a csapatban.')}</div>`:emptyInline('Válassz csapatot.')}</article></div>`;
    $$('[data-team-id]').forEach(b=>b.addEventListener('click',()=>{state.selectedTeam=b.dataset.teamId;renderTeams()}));$$('[data-player-id]').forEach(b=>b.addEventListener('click',()=>openPlayerDetail(b.dataset.playerId)));
  }

  function medicalClass(v){const d=safeDate(v);if(!d)return'';const days=(d-Date.now())/864e5;return days<0?'medical-expired':days<92?'medical-warn':''}
  function playerRows(){const q=state.playerSearch.toLocaleLowerCase('hu');return state.players.filter(p=>{if(state.playerTeam&&text(p.teamId||p.team_id)!==state.playerTeam)return false;if(q&&!`${p.name||''} ${p.displayName||''} ${p.email||''} ${p.licenseNo||''}`.toLocaleLowerCase('hu').includes(q))return false;return true})}
  function playerTableRow(p){return `<tr class="clickable-row" tabindex="0" data-player-id="${esc(p.playerId)}"><td class="player-cell"><b>${esc(p.displayName||p.name||'–')}</b><small>${esc(p.email||'')}</small></td><td>${esc(p.teamName||'–')}</td><td>${esc(p.position||'–')}</td><td>${esc(p.jerseyNo??'–')}</td><td>${esc(p.licenseNo||'–')}</td><td class="${medicalClass(p.medicalValidUntil)}">${esc(p.medicalValidUntil?fmtDate(p.medicalValidUntil):'–')}</td><td><b>${esc(p.trainingPresent??0)}/${esc(p.trainingMarked??0)}</b><small>${esc(pctText(p.trainingPresent,p.trainingMarked))}</small></td><td><b>${esc(p.matchPresent??0)}/${esc(p.matchMarked??0)}</b><small>${esc(pctText(p.matchPresent,p.matchMarked))}</small></td></tr>`}
  function renderPlayers(){
    const rows=playerRows(),active=!!state.playerTeam||!!state.playerSearch;
    $('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Játékosok</h2><p>Teljes versenysport-adatbázis, tényleges edzés- és meccsjelenléttel.</p></div><span class="read-only-badge">READ-ONLY</span></div><div class="filter-bar"><label class="search-field"><span class="sr-only">Keresés</span><input id="playerSearch" type="search" value="${esc(state.playerSearch)}" placeholder="Név, email vagy igazolási szám…"></label><label class="field compact"><span>Csapat</span><select id="playerTeamFilter">${teamOptions(state.playerTeam)}</select></label><button class="filter-reset" id="playerFilterReset" ${active?'':'hidden'} type="button">Szűrők törlése</button></div><article class="panel player-surface"><div class="table-summary"><b>${rows.length} játékos</b><span>Kattints egy sorra a részletekhez.</span></div><div class="responsive-table-wrap"><table class="data-table"><thead><tr><th>Játékos</th><th>Csapat</th><th>Poszt</th><th>Mez</th><th>Igazolás</th><th>Sportorvosi</th><th>Edzés</th><th>Meccs</th></tr></thead><tbody>${rows.map(playerTableRow).join('')}</tbody></table></div><div class="player-card-list">${rows.map(playerCard).join('')||emptyInline('Nincs megjeleníthető játékos.')}</div>${rows.length?'':'<div class="desktop-empty empty-inline">Nincs megjeleníthető játékos.</div>'}</article>`;
    $('#playerSearch')?.addEventListener('input',e=>{state.playerSearch=e.target.value||'';renderPlayers()});$('#playerTeamFilter')?.addEventListener('change',e=>{state.playerTeam=e.target.value;renderPlayers()});$('#playerFilterReset')?.addEventListener('click',()=>{state.playerSearch='';state.playerTeam='';renderPlayers()});$$('[data-player-id]').forEach(el=>{el.addEventListener('click',()=>openPlayerDetail(el.dataset.playerId));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openPlayerDetail(el.dataset.playerId)}})});
  }
  function playerCard(p){return `<button type="button" class="player-card" data-player-id="${esc(p.playerId)}"><div class="player-avatar">${esc(initials(p.displayName||p.name))}</div><div class="player-card-main"><div class="player-card-head"><b>${esc(p.displayName||p.name||'–')}</b><span>${p.jerseyNo!=null?'#'+esc(p.jerseyNo):''}</span></div><small>${esc(p.teamName||'–')} · ${esc(p.position||'–')}</small><div class="player-card-stats"><span>Edzés <b>${esc(p.trainingPresent??0)}/${esc(p.trainingMarked??0)}</b> · ${esc(pctText(p.trainingPresent,p.trainingMarked))}</span><span>Meccs <b>${esc(p.matchPresent??0)}/${esc(p.matchMarked??0)}</b> · ${esc(pctText(p.matchPresent,p.matchMarked))}</span></div></div><span class="chevron">›</span></button>`}
  function openPlayerDetail(id){const p=playerById(id);if(!p)return;state.selectedPlayer=id;const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');title.textContent=p.displayName||p.name||'Játékos';body.innerHTML=`<div class="entity-hero"><div class="player-avatar large">${esc(initials(p.displayName||p.name))}</div><div><b>${esc(p.teamName||'Nincs aktív csapat')}</b><span>${esc(p.position||'–')}${p.jerseyNo!=null?' · #'+esc(p.jerseyNo):''}</span></div></div><div class="detail-grid">${detailPair('Email',p.email)}${detailPair('Igazolási szám',p.licenseNo)}${detailPair('Sportorvosi',p.medicalValidUntil?fmtDate(p.medicalValidUntil):'–',medicalClass(p.medicalValidUntil))}${detailPair('Mezméret',p.jerseySize)}${detailPair('Nadrágméret',p.shortsSize)}${detailPair('Státusz',p.active===false?'Inaktív':'Aktív')}</div><div class="attendance-detail"><div><small>Edzésjelenlét</small><b>${esc(p.trainingPresent??0)}/${esc(p.trainingMarked??0)}</b><span>${esc(pctText(p.trainingPresent,p.trainingMarked))}</span></div><div><small>Meccsjelenlét</small><b>${esc(p.matchPresent??0)}/${esc(p.matchMarked??0)}</b><span>${esc(pctText(p.matchPresent,p.matchMarked))}</span></div></div><div class="read-only-note">V0.4 read-only parity: szerkesztés a következő write-fázisban kerül ide.</div>`;d?.showModal()}

  function startOfWeek(d){const x=new Date(d);x.setHours(0,0,0,0);const day=(x.getDay()+6)%7;x.setDate(x.getDate()-day);return x}
  function calendarWindow(){const a=new Date(state.calendarAnchor);a.setHours(0,0,0,0);if(state.calendarMode==='day'){const to=new Date(a);to.setDate(to.getDate()+1);return{from:a,to}}if(state.calendarMode==='month'){return{from:new Date(a.getFullYear(),a.getMonth(),1),to:new Date(a.getFullYear(),a.getMonth()+1,1)}}if(state.calendarMode==='season'){const y=a.getMonth()>=7?a.getFullYear():a.getFullYear()-1;return{from:new Date(y,7,1),to:new Date(y+1,7,1)}}const from=startOfWeek(a),to=new Date(from);to.setDate(to.getDate()+7);return{from,to}}
  function calendarRangeText(){const {from,to}=calendarWindow(),end=new Date(to.getTime()-1);return state.calendarMode==='day'?fmtDate(from):`${fmtDate(from)} – ${fmtDate(end)}`}
  function calendarFiltered(){return state.calendarEvents.filter(e=>(!state.calendarTeam||eventTeamId(e)===state.calendarTeam)&&(!state.calendarType||eventType(e)===state.calendarType)).sort((a,b)=>eventStart(a)-eventStart(b))}
  function agendaHtml(rows){const groups=new Map();rows.forEach(e=>{const d=eventStart(e);if(!d)return;const k=localDateKey(d);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(e)});return groups.size?Array.from(groups.entries()).map(([key,items])=>`<div class="calendar-day"><div class="calendar-date">${esc(fmtDay(key+'T12:00:00Z'))}</div><div class="calendar-events">${items.map(e=>`<div class="calendar-event ${isEventPast(e)?'past':''}"><time>${esc(fmtTime(eventStart(e)))}</time><span class="dot" style="background:${esc(e.color||'#f7b700')}"></span><div><strong>${esc(e.title||((eventType(e)==='match')?'Meccs':'Edzés'))}</strong><small>${esc(e.teamName||'')} · ${esc(eventPlace(e))}</small>${rsvpPills(e)}</div><span class="event-kind">${eventType(e)==='match'?'MECCS':'EDZÉS'}</span></div>`).join('')}</div></div>`).join(''):emptyInline('Ebben az időszakban nincs esemény.')}
  function weekGridHtml(rows){const from=startOfWeek(state.calendarAnchor),days=Array.from({length:7},(_,i)=>{const d=new Date(from);d.setDate(d.getDate()+i);return d});const slots=[];for(let h=17;h<=22;h++){for(const m of [0,30]){if(h===17&&m===0)continue;slots.push({h,m,label:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`})}}const byDay=new Map(days.map((d,i)=>[localDateKey(d),i]));const cellMap=new Map();rows.forEach(e=>{const s=eventStart(e);if(!s)return;const key=localDateKey(s),di=byDay.get(key);if(di==null)return;const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Budapest',hour:'2-digit',minute:'2-digit',hour12:false}).format(s).split(':');let mins=Number(parts[0])*60+Number(parts[1]);const slot=Math.max(0,Math.min(slots.length-1,Math.round((mins-(17*60+30))/30)));const ck=`${di}:${slot}`;if(!cellMap.has(ck))cellMap.set(ck,[]);cellMap.get(ck).push(e)});return `<div class="week-grid-wrap"><div class="week-grid"><div class="week-head corner"></div>${days.map(d=>`<div class="week-head"><b>${esc(new Intl.DateTimeFormat('hu-HU',{weekday:'short',timeZone:'Europe/Budapest'}).format(d))}</b><span>${esc(new Intl.DateTimeFormat('hu-HU',{month:'2-digit',day:'2-digit',timeZone:'Europe/Budapest'}).format(d))}</span></div>`).join('')}${slots.map((s,si)=>`<div class="week-time">${s.label}</div>${days.map((d,di)=>`<div class="week-cell">${(cellMap.get(`${di}:${si}`)||[]).map(e=>`<div class="week-event ${eventType(e)==='match'?'match':''}" style="--event-color:${esc(e.color||'#f7b700')}" title="${esc(e.title||'Esemény')}"><b>${esc(fmtTime(eventStart(e)))}</b><span>${esc(e.teamName||'')}</span><small>${esc(e.title||'Edzés')}</small></div>`).join('')}</div>`).join('')}`).join('')}</div></div>`}
  function renderCalendar(){
    if(state.area!=='competition'){renderPlaceholder('Naptár','A Tömegsport naptár production parityje külön scoped RPC-vel kerül át.',['heti alapnézet','pálya/terem erőforrások','kapacitás és jelentkezések']);return}
    const filtered=calendarFiltered(),active=!!state.calendarTeam||!!state.calendarType;
    $('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Naptár</h2><p>Heti időrács desktopon, kompakt agenda mobilon; ugyanabból a Supabase eseményforrásból.</p></div><div class="toolbar-actions"><div class="segmented calendar-modes" role="group" aria-label="Naptár nézet"><button class="${state.calendarMode==='day'?'active':''}" data-calendar-mode="day">NAP</button><button class="${state.calendarMode==='week'?'active':''}" data-calendar-mode="week">HÉT</button><button class="${state.calendarMode==='month'?'active':''}" data-calendar-mode="month">HÓNAP</button><button class="${state.calendarMode==='season'?'active':''}" data-calendar-mode="season">SZEZON</button></div><button class="icon-button filter-toggle" id="calendarFilterBtn" type="button" aria-label="Szűrők" aria-expanded="false"><span>▽</span></button></div></div><div class="filter-panel" id="calendarFilterPanel" hidden><label class="field compact"><span>Csapat</span><select id="calendarTeamFilter">${teamOptions(state.calendarTeam)}</select></label><label class="field compact"><span>Típus</span><select id="calendarTypeFilter"><option value="" ${state.calendarType===''?'selected':''}>Minden esemény</option><option value="training" ${state.calendarType==='training'?'selected':''}>Edzés</option><option value="match" ${state.calendarType==='match'?'selected':''}>Meccs</option></select></label><button class="filter-reset" id="calendarFilterReset" type="button" ${active?'':'hidden'}>Szűrők törlése</button></div><article class="panel calendar-panel"><div class="calendar-nav"><button class="button quiet" id="calendarPrev" type="button">← Előző</button><button class="button quiet" id="calendarToday" type="button">Ma</button><strong>${esc(calendarRangeText())}</strong><button class="button quiet" id="calendarNext" type="button">Következő →</button></div><div class="desktop-week-grid">${state.calendarMode==='week'?weekGridHtml(filtered):agendaHtml(filtered)}</div><div class="mobile-calendar-agenda">${agendaHtml(filtered)}</div></article>`;bindCalendarUi()
  }
  function bindCalendarUi(){$('#calendarFilterBtn')?.addEventListener('click',()=>{const b=$('#calendarFilterBtn'),open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));$('#calendarFilterPanel').hidden=!open});$('#calendarTeamFilter')?.addEventListener('change',e=>{state.calendarTeam=e.target.value;configured()?loadCalendar().then(renderCalendar).catch(err=>status(err.message,'error')):renderCalendar()});$('#calendarTypeFilter')?.addEventListener('change',e=>{state.calendarType=e.target.value;renderCalendar()});$('#calendarFilterReset')?.addEventListener('click',()=>{state.calendarTeam='';state.calendarType='';configured()?loadCalendar().then(renderCalendar).catch(err=>status(err.message,'error')):renderCalendar()});$$('[data-calendar-mode]').forEach(b=>b.addEventListener('click',()=>{state.calendarMode=b.dataset.calendarMode;configured()?loadCalendar().then(renderCalendar).catch(err=>status(err.message,'error')):renderCalendar()}));$('#calendarPrev')?.addEventListener('click',()=>shiftCalendar(-1));$('#calendarNext')?.addEventListener('click',()=>shiftCalendar(1));$('#calendarToday')?.addEventListener('click',()=>{state.calendarAnchor=new Date();configured()?loadCalendar().then(renderCalendar).catch(err=>status(err.message,'error')):renderCalendar()})}
  function shiftCalendar(dir){const d=new Date(state.calendarAnchor);if(state.calendarMode==='day')d.setDate(d.getDate()+dir);else if(state.calendarMode==='month')d.setMonth(d.getMonth()+dir);else if(state.calendarMode==='season')d.setFullYear(d.getFullYear()+dir);else d.setDate(d.getDate()+7*dir);state.calendarAnchor=d;configured()?loadCalendar().then(renderCalendar).catch(err=>status(err.message,'error')):renderCalendar()}

  function renderSettings(){$('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Beállítások</h2><p>Globális Manager beállítások. Az Edzéstervezés nem része ennek a migrációnak.</p></div></div><div class="settings-layout"><article class="panel"><div class="setting-row"><div><strong>Megjelenés</strong><small>Világos / sötét téma ezen az eszközön.</small></div><button class="button quiet" id="themeToggle" type="button">Téma váltása</button></div><div class="setting-row"><div><strong>Manager PWA</strong><small>${esc(cfg.BUILD)}</small></div><span class="status-pill ok">CORE READ</span></div><div class="setting-row"><div><strong>Edzéstervezés</strong><small>A jelenlegi migrációból tudatosan kihagyva.</small></div><span class="status-pill">KÉSŐBB</span></div></article></div>`;$('#themeToggle')?.addEventListener('click',()=>{const dark=document.body.classList.toggle('dark');localStorage.setItem('cc-manager-theme',dark?'dark':'light')})}
  function renderView(){renderModule();document.title=`${state.module==='settings'?'Beállítások':moduleMeta()?.[1]||'Manager'} – Club Control Manager`}

  async function refresh(){if(!configured()){status('Manager PWA konfigurációs hiba.','error');return}try{await loadLiveData()}catch(_){}}
  function bindStaticUi(){
    $$('.area-button,.area-choice').forEach(b=>b.addEventListener('click',()=>{switchArea(b.dataset.area);$('#areaDialog')?.close()}));
    $('#mobileAreaBtn')?.addEventListener('click',()=>$('#areaDialog')?.showModal());$('#areaDialogClose')?.addEventListener('click',()=>$('#areaDialog')?.close());$('#mobileMoreClose')?.addEventListener('click',()=>$('#mobileMoreDialog')?.close());
    ['areaDialog','mobileMoreDialog'].forEach(id=>$('#'+id)?.addEventListener('click',e=>{if(e.target===$('#'+id))$('#'+id).close()}));
    $('#refreshBtn')?.addEventListener('click',refresh);$('#managerMenuBtn')?.addEventListener('click',()=>$('#accountDialog')?.showModal());$('#accountDialogClose')?.addEventListener('click',()=>$('#accountDialog')?.close());$('#accountDialog')?.addEventListener('click',e=>{if(e.target===$('#accountDialog'))$('#accountDialog').close()});
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
})();
