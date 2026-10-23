(()=>{
  'use strict';

  const FRONTEND_BUILD='manager-r1-ui1-9k-score-v1-2026-10-08';

  const cfg=Object.freeze({...{
    BUILD:'manager-r1-ui1-9k-score-v1-2026-10-08',DATA_MODE:'supabase',SUPABASE_URL:'',SUPABASE_PUBLISHABLE_KEY:'',DEFAULT_SEASON:'2026/27',DEFAULT_AREA:'competition'
  },...(window.CC_MANAGER_CONFIG||{})});

  const AREAS={
    mass:{label:'Tömegsport',glyph:'△',modules:[
      ['trainings','Edzések','◇'],['athletes','Sportolók','○'],['passes','BEAC import','▤'],['calendar','Naptár','□'],['archive','Archívum','⌁']
    ]},
    competition:{label:'Versenysport',glyph:'◇',modules:[
      ['overview','Áttekintés','△'],['trainings','Edzések','◇'],['matches','Meccsek','◆'],['courts','Terembeosztás','▦'],['standings','Tabella','≡'],['history','Statisztika','↗'],['teams','Csapatok','▱'],['players','Játékosok','○'],['calendar','Naptár','□'],['notifications','Értesítések','◉']
    ]}
  };

  const CC_BRSZ_BEAC_MATCH_IMPORT_V1=Object.freeze([{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2026-10-12","time":"19:30","home":"BEAC","away":"PDSE","homeAway":"home","venue":"XI. Bogdánfy u. 12.","referee":"Lipták L.","homeBrszId":709,"awayBrszId":1214,"review":false,"note":null},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2026-10-27","time":"19:30","home":"Semmelweis Egyetem","away":"BEAC","homeAway":"away","venue":"XI.ker. Villányi út 27.","referee":null,"homeBrszId":957,"awayBrszId":709,"review":false,"note":null},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2026-11-09","time":"19:30","home":"BEAC","away":"MAFC-Schönherz","homeAway":"home","venue":"XI. Bogdánfy u. 12.","referee":null,"homeBrszId":709,"awayBrszId":640,"review":false,"note":null},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2026-11-23","time":"19:30","home":"BEAC","away":"MAFC-Vásárhelyi","homeAway":"home","venue":"XI. Bogdánfy u. 12.","referee":null,"homeBrszId":709,"awayBrszId":45,"review":false,"note":null},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2026-12-10","time":"19:30","home":"Corvinus","away":"BEAC","homeAway":"away","venue":"IX.ker. Kinizsi u.2-6.","referee":null,"homeBrszId":865,"awayBrszId":709,"review":false,"note":null},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2027-01-13","time":"20:30","home":"BEAC","away":"BEAC","homeAway":"home","venue":"XI. Bogdánfy u. 12.","referee":null,"homeBrszId":709,"awayBrszId":709,"review":true,"note":"A forrásban BEAC–BEAC szerepel; automatikus importból kizárva."},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2027-01-13","time":"18:15","home":"PDSE","away":"BEAC","homeAway":"away","venue":"V. ker. Piarista u. 1.","referee":null,"homeBrszId":1091,"awayBrszId":709,"review":false,"note":null},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2027-01-18","time":"19:30","home":"BEAC","away":"Semmelweis Egyetem","homeAway":"home","venue":"XI. Bogdánfy u. 12.","referee":null,"homeBrszId":709,"awayBrszId":957,"review":false,"note":null},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2027-01-27","time":"20:30","home":"MAFC-Schönherz","away":"BEAC","homeAway":"away","venue":"XI.ker. Villányi út 27.","referee":null,"homeBrszId":640,"awayBrszId":709,"review":false,"note":null},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2027-02-18","time":"18:20","home":"MAFC-Vásárhelyi","away":"BEAC","homeAway":"away","venue":"XI.ker. Bercsényi u. 28-30.","referee":null,"homeBrszId":45,"awayBrszId":709,"review":false,"note":null},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2027-02-22","time":"19:30","home":"BEAC","away":"Corvinus","homeAway":"home","venue":"XI. Bogdánfy u. 12.","referee":null,"homeBrszId":709,"awayBrszId":865,"review":false,"note":null},{"teamKey":"men","teamId":"10000000-0000-4000-8000-000000000003","teamName":"BEAC Férfi","brszTeamId":709,"date":"2027-03-04","time":"19:30","home":"BEAC","away":"BEAC","homeAway":"home","venue":"IX.ker. Kinizsi u.2-6.","referee":null,"homeBrszId":709,"awayBrszId":709,"review":true,"note":"A forrásban BEAC–BEAC szerepel; automatikus importból kizárva."},{"teamKey":"w1","teamId":"10000000-0000-4000-8000-000000000001","teamName":"BEAC Női I","brszTeamId":299,"date":"2026-10-16","time":"19:30","home":"BEAC","away":"MAFC-ÉPK","homeAway":"home","venue":"XI.ker. Bogdánfy u. 12.","referee":"Kovács Gábor","homeBrszId":299,"awayBrszId":835,"review":false,"note":null},{"teamKey":"w1","teamId":"10000000-0000-4000-8000-000000000001","teamName":"BEAC Női I","brszTeamId":299,"date":"2026-10-27","time":"20:30","home":"Óbudai Egyetem-Kandó SC","away":"BEAC","homeAway":"away","venue":"XII. ker. Városmajor u. 29.","referee":null,"homeBrszId":1159,"awayBrszId":299,"review":false,"note":null},{"teamKey":"w1","teamId":"10000000-0000-4000-8000-000000000001","teamName":"BEAC Női I","brszTeamId":299,"date":"2026-11-10","time":"19:30","home":"BEAC","away":"BEAC","homeAway":"home","venue":"XI.ker. Bogdánfy u. 12.","referee":null,"homeBrszId":299,"awayBrszId":299,"review":true,"note":"A forrásban BEAC–BEAC szerepel; automatikus importból kizárva."},{"teamKey":"w1","teamId":"10000000-0000-4000-8000-000000000001","teamName":"BEAC Női I","brszTeamId":299,"date":"2026-11-13","time":"19:30","home":"BEAC","away":"Ráckeve","homeAway":"home","venue":"XI.ker. Bogdánfy u. 12.","referee":null,"homeBrszId":299,"awayBrszId":961,"review":false,"note":null},{"teamKey":"w1","teamId":"10000000-0000-4000-8000-000000000001","teamName":"BEAC Női I","brszTeamId":299,"date":"2026-11-20","time":"19:30","home":"BEAC","away":"KSE","homeAway":"home","venue":"XI.ker. Bogdánfy u. 12.","referee":null,"homeBrszId":299,"awayBrszId":644,"review":false,"note":null},{"teamKey":"w1","teamId":"10000000-0000-4000-8000-000000000001","teamName":"BEAC Női I","brszTeamId":299,"date":"2026-11-24","time":"19:30","home":"Semmelweis Egyetem","away":"BEAC","homeAway":"away","venue":"X.ker. Zágrábi utca 14.","referee":null,"homeBrszId":917,"awayBrszId":299,"review":false,"note":null},{"teamKey":"w2","teamId":"10000000-0000-4000-8000-000000000002","teamName":"BEAC Női II","brszTeamId":959,"date":"2026-10-13","time":"19:30","home":"BEAC II.","away":"UTE U-20 Pink","homeAway":"home","venue":"XI.ker. Bogdánfy u.10/B.","referee":"Polgár Dániel","homeBrszId":959,"awayBrszId":1223,"review":false,"note":null},{"teamKey":"w2","teamId":"10000000-0000-4000-8000-000000000002","teamName":"BEAC Női II","brszTeamId":959,"date":"2026-10-30","time":"20:30","home":"Radzeer SE","away":"BEAC II.","homeAway":"away","venue":"XI.ker. Bercsényi u.28","referee":null,"homeBrszId":1031,"awayBrszId":959,"review":false,"note":null},{"teamKey":"w2","teamId":"10000000-0000-4000-8000-000000000002","teamName":"BEAC Női II","brszTeamId":959,"date":"2026-11-17","time":"19:30","home":"BEAC II.","away":"MTK kék","homeAway":"home","venue":"XI.ker. Bogdánfy u.10/B.","referee":null,"homeBrszId":959,"awayBrszId":1165,"review":false,"note":null},{"teamKey":"w2","teamId":"10000000-0000-4000-8000-000000000002","teamName":"BEAC Női II","brszTeamId":959,"date":"2026-11-25","time":"19:30","home":"Corvinus","away":"BEAC II.","homeAway":"away","venue":"XI.ker. Bogdánfy u.10/B.","referee":null,"homeBrszId":866,"awayBrszId":959,"review":false,"note":null}]);

  const LEGACY_MAIN_SECTIONS=['competition','mass','calendar','planning','finance','settings'];
  const ADMIN_MODULES=[
    {group:'Tömegsport',items:[['mass.overview','Áttekintés'],['mass.trainings','Edzések'],['mass.calendar','Naptár'],['mass.athletes','Sportolók'],['mass.passes','Bérletek']]},
    {group:'Versenysport',items:[['competition.overview','Áttekintés'],['competition.trainings','Edzések'],['competition.matches','Meccsek'],['competition.calendar','Naptár'],['competition.teams','Csapatok'],['competition.players','Játékosok'],['competition.fees','Pénzügyek'],['competition.competition','Versenyadatok']]},
    {group:'Rendszer',items:[['settings','Beállítások / adminok']]}
  ];

  const state={
    mode:String(cfg.DATA_MODE||'demo').toLowerCase(),supabase:null,session:null,manager:null,permissions:[],teams:[],players:[],events:[],calendarEvents:[],activityEvents:[],massTrainings:[],massCalendarEvents:[],massArchiveEvents:[],massAthletes:[],massPasses:[],massLoadError:'',massDetailCache:new Map(),massDetailUi:new Map(),admins:[],adminTeams:[],adminsLoadError:'',adminEditId:'',adminBusy:false,overview:null,rsvpMatrix:{events:[],players:[],responses:[]},cardRsvpMatrix:{events:[],players:[],responses:[]},eventRosterCache:new Map(),matrixFilterOpen:false,eventFiltersOpen:false,calendarFiltersOpen:false,matrixFilters:{team:'',period:'14',kind:'ALL',status:'ALL',from:'',to:''},
    area:['mass','competition'].includes(cfg.DEFAULT_AREA)?cfg.DEFAULT_AREA:'competition',module:'overview',calendarMode:'week',calendarAnchor:new Date(),calendarTeam:'',calendarType:'',calendarScope:'COMPETITION',massCalendarLevel:'',massCalendarSession:'',massAthleteSearch:'',massAthleteLevel:'',massAthleteStatus:'',massPassSearch:'',massPassMonth:'',playerTeam:'',playerSearch:'',playerMedical:'all',playerSort:(()=>{try{return localStorage.getItem('cc-manager-player-sort')||'name'}catch(_){return'name'}})(),playerSortDir:(()=>{try{return localStorage.getItem('cc-manager-player-sort-dir')||'asc'}catch(_){return'asc'}})(),playerListMode:(()=>{try{return localStorage.getItem('cc-manager-player-list-mode')==='grouped'?'grouped':'all'}catch(_){return'all'}})(),playerFiltersOpen:false,massAthleteFiltersOpen:false,massPassFiltersOpen:false,massCalendarFiltersOpen:false,massTrainingFiltersOpen:false,massTrainingPeriod:'upcoming',massTrainingDate:'',massAthleteMonth:'',massAthletePass:'all',massAthleteFirst:'all',teamFiltersOpen:false,eventTeam:'',eventPeriod:'upcoming',overviewTeam:'',selectedTeam:'',selectedPlayer:'',pendingEmail:'',loading:false,massActionBusy:'',massAttendanceBusy:new Set(),notificationRecipients:[],notificationHistory:[],notificationSelectedPlayerId:'',notificationSearch:'',notificationBusy:false,notificationLoadError:'',competitionSyncStatus:null,competitionSyncBusy:false,competitionResults:[],competitionStandings:[],competitionDataError:'',managerStandingsContext:(()=>{try{return localStorage.getItem('cc-manager-standings-context')||''}catch(_){return''}})(),managerStandingsTeam:(()=>{try{return localStorage.getItem('cc-manager-standings-team')||'all'}catch(_){return'all'}})(),managerStandingsMatchScope:(()=>{try{return localStorage.getItem('cc-manager-standings-match-scope')==='beac'?'beac':'all'}catch(_){return'all'}})(),managerLeagueInsights:{key:'',loading:false,loaded:false,error:'',data:null},financeTab:'competition',financeTeam:'',financeData:null,financeAudit:[],financeSettings:null,financeSettingsTeam:'',financePassCatalog:[],financePassCatalogLoaded:false,financePassSearch:'',financePassType:'',financePassLevel:'',financePassTeam:'',financePassMonth:'',financePassStatus:'',financeCompetitionSearch:'',financeCompetitionMonth:'',financeCompetitionStatus:'',financeCompetitionType:'',financeCompetitionFiltersOpen:false,financePassFiltersOpen:false,financeLoading:false,teamDetailTab:'grid',teamGridPeriod:(()=>{try{return localStorage.getItem('cc-manager-team-grid-period')==='all'?'all':'upcoming'}catch(_){return'upcoming'}})(),equipmentByTeam:new Map(),equipmentLoading:new Set(),coachAvailability:[],coachAvailabilityBusy:new Set(),managerMedicalAppointments:[],teamFilters:{overview:[],events:[],players:[],teams:[]},teamFilterOpen:{overview:false,events:false,players:false,teams:false},plannerTeam:'',plannerTab:'planner'
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
  function routeKey(area=state.area,module=state.module){return ['settings','planning','finance','calendar'].includes(module)?module:`${area}.${module}`}
  function currentArea(){return AREAS[state.area]||AREAS.competition}
  function moduleMeta(module=state.module,area=state.area){if(module==='calendar')return ['calendar','Naptár','□'];if(module==='planning')return ['planning',state.plannerTab==='counter'?'Számláló':'Edzéstervezés','▦'];if(module==='finance')return ['finance','Pénzügyek','Ft'];if(module==='settings')return ['settings','Beállítások','⌁'];return (AREAS[area]?.modules||[]).find(x=>x[0]===module)||null}
  let ccStatusTimer_=null;
  let ccPlayerReturnEventId_='';
  let ccDialogContext_='';
  let ccRouteGeneration_=0;
  function ccAdvanceRouteGeneration_(){ccRouteGeneration_+=1;return ccRouteGeneration_}
  function ccRouteSnapshot_(){return {generation:ccRouteGeneration_,area:state.area,module:state.module}}
  function ccRouteSnapshotCurrent_(snap){return !!snap&&snap.generation===ccRouteGeneration_&&snap.area===state.area&&snap.module===state.module}
  function ccRouteIs_(area,module){return state.area===area&&state.module===module}
  function ccSectionIs_(section){return mainSection_()===section}
  function ensureTopStatus_(){
    const el=$('#globalStatus'),top=$('.topbar'),dialog=$('#entityDialog'),card=dialog?.querySelector('.entity-dialog-card'),body=$('#entityDialogBody');
    if(!el)return el;
    el.classList.add('cc-top-toast');
    if(dialog?.open&&card){
      if(el.parentElement!==card){
        if(body&&body.parentElement===card)card.insertBefore(el,body);
        else card.appendChild(el);
      }
      el.classList.add('cc-dialog-toast');
    }else if(top){
      if(el.parentElement!==top)top.appendChild(el);
      el.classList.remove('cc-dialog-toast');
    }
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
    const routeSnapshot=ccRouteSnapshot_();
    let done=false,timer=null;
    const run=()=>{
      if(done)return;
      done=true;
      if(timer)clearTimeout(timer);
      if(!ccRouteSnapshotCurrent_(routeSnapshot))return;
      requestAnimationFrame(()=>requestAnimationFrame(()=>{if(ccRouteSnapshotCurrent_(routeSnapshot))return Promise.resolve(callback())}));
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
    if(canMainSection_('finance'))return{area:state.area,module:'finance'};
    if(can('settings'))return{area:state.area,module:'settings'};
    return null;
  }
  function ensureAuthorizedRoute_(){
    const ok=state.module==='settings'?can('settings'):state.module==='planning'?canMainSection_('planning'):state.module==='finance'?canMainSection_('finance'):state.module==='calendar'?canMainSection_('calendar'):canRoute(state.area,state.module);
    if(ok)return true;
    const next=firstPermittedRoute_();if(!next)return false;
    ccAdvanceRouteGeneration_();state.area=next.area;state.module=next.module;
    const h=next.module==='settings'?'#settings':next.module==='planning'?'#planning':next.module==='finance'?'#finance':next.module==='calendar'?'#calendar':`#${next.area}/${next.module}`;
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
  async function createSupabase(){if(!configured())return null;await ensureSupabaseLibrary();return window.supabase.createClient(text(cfg.SUPABASE_URL),text(cfg.SUPABASE_PUBLISHABLE_KEY),{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'cc-manager-auth-session-v1'}})}
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
    if(area==='competition'&&(module==='standings'||module==='courts'||module==='history')) return can('competition.matches');
    if(area==='mass'&&module==='archive')return can('mass.trainings')||can('mass.calendar');
    return can(`${area}.${module}`);
  }
  function canMainSection_(section){
    if(section==='competition')return AREAS.competition.modules.some(m=>m[0]!=='calendar'&&canRoute('competition',m[0]));
    if(section==='mass')return AREAS.mass.modules.some(m=>!['calendar','archive','passes'].includes(m[0])&&canRoute('mass',m[0]));
    if(section==='calendar')return can('competition.calendar')||can('mass.calendar');
    if(section==='planning')return can('competition.trainings')||can('mass.trainings');
    if(section==='finance')return can('competition.fees');
    if(section==='settings')return can('settings');
    return false;
  }
  function mainSection_(){return state.module==='calendar'?'calendar':state.module==='planning'?'planning':state.module==='finance'?'finance':state.module==='settings'?'settings':state.area}

  function showLogin(step){const o=$('#loginOverlay');if(!o)return;o.classList.remove('hidden');['loginLoadingStep','loginEmailStep','loginCodeStep'].forEach(id=>$('#'+id)?.classList.toggle('hidden',id!==step));if(step==='loginEmailStep')setTimeout(()=>$('#loginEmail')?.focus(),20);if(step==='loginCodeStep')setTimeout(()=>$('#loginCode')?.focus(),20)}
  function hideLogin(){$('#loginOverlay')?.classList.add('hidden')}
  function loginMessage(id,msg,error=false){const el=$(id);if(!el)return;el.textContent=msg||'';el.classList.toggle('error',!!error)}
  function managerOtp_(value){return text(value).replace(/\D/g,'').slice(0,10)}
  function managerOtpError_(err){
    const raw=text(err?.message||err||'');
    if(/expired|invalid|otp|token/i.test(raw))return 'A kód érvénytelen vagy lejárt. Ha több kódot kértél, csak a legutóbbi használható.';
    return raw||'A belépés sikertelen.'
  }
  async function requestCode(){
    const email=text($('#loginEmail')?.value).toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){loginMessage('#loginMsg','Adj meg egy érvényes email címet.',true);return}
    const b=$('#requestCodeBtn');if(b)b.disabled=true;
    try{
      loginMessage('#loginMsg','Kód küldése…');
      const {error}=await state.supabase.auth.signInWithOtp({email,options:{shouldCreateUser:true}});
      if(error)throw error;
      state.pendingEmail=email;
      if($('#loginEmailPreview'))$('#loginEmailPreview').textContent=email;
      if($('#loginCode'))$('#loginCode').value='';
      showLogin('loginCodeStep');
      loginMessage('#loginCodeMsg','A kódot elküldtük. Mindig a legutóbb kapott kódot használd.')
    }catch(err){
      console.error('Manager OTP request failed',err);
      loginMessage('#loginMsg',err.message||'A kód küldése sikertelen. Ellenőrizd, hogy ez az email rendelkezik-e Manager-fiókkal.',true)
    }finally{if(b)b.disabled=false}
  }
  async function resendCode(){
    if(!state.pendingEmail){showLogin('loginEmailStep');return}
    const b=$('#resendCodeBtn');if(b)b.disabled=true;
    try{
      loginMessage('#loginCodeMsg','Új kód küldése…');
      const {error}=await state.supabase.auth.signInWithOtp({email:state.pendingEmail,options:{shouldCreateUser:true}});
      if(error)throw error;
      if($('#loginCode'))$('#loginCode').value='';
      loginMessage('#loginCodeMsg','Új kódot küldtünk. A korábbi kód már nem használható.')
    }catch(err){
      console.error('Manager OTP resend failed',err);
      loginMessage('#loginCodeMsg',err.message||'Nem sikerült új kódot küldeni.',true)
    }finally{if(b)b.disabled=false}
  }
  async function verifyCode(){
    const token=managerOtp_($('#loginCode')?.value);
    if(token.length<6||token.length>10){loginMessage('#loginCodeMsg','Írd be az emailben kapott teljes kódot.',true);return}
    if(!state.pendingEmail){loginMessage('#loginCodeMsg','Az email cím elveszett a munkamenetből. Menj vissza és kérj új kódot.',true);return}
    const b=$('#verifyCodeBtn');if(b)b.disabled=true;
    try{
      loginMessage('#loginCodeMsg','Kód ellenőrzése…');
      const {data,error}=await state.supabase.auth.verifyOtp({email:state.pendingEmail,token,type:'email'});
      if(error)throw error;
      state.session=data?.session||null;
      if(!state.session)throw new Error('A kód elfogadása után nem érkezett Supabase munkamenet.');
      loginMessage('#loginCodeMsg','Kód elfogadva · Manager adatok betöltése…');
      try{
        await loadLiveData()
      }catch(loadErr){
        console.error('Manager bootstrap after OTP failed',loadErr);
        const raw=text(loadErr?.message||loadErr);
        if(/bootstrap|manager|permission|unauthor|forbidden|not.*allowed/i.test(raw))throw new Error('A kód jó, de ehhez az emailhez nincs érvényes Manager-hozzáférés.');
        throw loadErr
      }
      hideLogin()
    }catch(err){
      console.error('Manager OTP verify failed',err);
      loginMessage('#loginCodeMsg',managerOtpError_(err),true)
    }finally{if(b)b.disabled=false}
  }

  function applyManager(){const m=state.manager||{};$('#managerName').textContent=m.displayName||m.name||'Manager';$('#managerEmail').textContent=m.email||'–';$('#managerInitials').textContent=initials(m.displayName||m.name||m.email);$('#accountDialogName').textContent=m.displayName||m.name||'Manager';$('#accountDialogEmail').textContent=m.email||'–';if($('#runtimeLabel'))$('#runtimeLabel').textContent='R1 UI1.9K';$('#dataModePill').textContent='MANAGER';$('#dataModeDetail').textContent='Club Control Manager · R1 UI1.9K';}

  async function loadLiveData(){
    state.loading=true;status('Manager adatok frissítése…');
    try{
      const b=await rpc('cc_manager_bootstrap_v1');
      if(!b?.manager)throw new Error('A Manager bootstrap nem adott érvényes fiókot.');
      state.manager=b.manager;state.permissions=Array.isArray(b.permissions)?b.permissions:[];ccCourtImpactState_.data=null;ccCourtImpactState_.error='';ccCourtImpactState_.loaded=false;ccCourtImpactState_.token++;state.teams=Array.isArray(b.teams)?b.teams:[];state.managerLeagueInsights={key:'',loading:false,loaded:false,error:'',data:null};state.financeData=null;state.financePassCatalog=[];state.financePassCatalogLoaded=false;state.financeLoading=false;state.equipmentByTeam.clear();applyManager();ensureAuthorizedRoute_();
      const jobs=[];
      if(can('competition.overview'))jobs.push(loadOverview(),loadRsvpMatrix());else{state.overview={};state.rsvpMatrix={events:[],players:[],responses:[]}}
      if(can('competition.trainings')||can('competition.matches'))jobs.push(loadCardRsvpMatrix().catch(err=>{console.warn('Competition card RSVP matrix unavailable',err);state.cardRsvpMatrix=state.rsvpMatrix||{events:[],players:[],responses:[]}}),loadCoachAvailability().catch(()=>{}));else{state.cardRsvpMatrix={events:[],players:[],responses:[]};state.coachAvailability=[]}
      if(can('competition.teams'))jobs.push(loadTeams());else state.teams=Array.isArray(b.teams)?b.teams:[];
      if(can('competition.players'))jobs.push(loadPlayers(),loadManagerMedicalAppointments().catch(err=>{console.warn('MGR021 medical appointments unavailable',err);state.managerMedicalAppointments=[]}));else{state.players=[];state.managerMedicalAppointments=[]};
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
  async function loadManagerMedicalAppointments(){const d=await rpc('cc_manager_player_medical_appointments_v1',{p_team_id:null});state.managerMedicalAppointments=Array.isArray(d)?d:[]}
  async function loadNotificationRecipients(query=''){const d=await rpc('cc_manager_notification_recipients_v1',{p_query:text(query)});state.notificationRecipients=Array.isArray(d)?d:[];state.notificationLoadError='';if(state.notificationSelectedPlayerId&&!state.notificationRecipients.some(p=>text(p.playerId)===text(state.notificationSelectedPlayerId)))state.notificationSelectedPlayerId=''}
  async function loadNotificationHistory(){const d=await rpc('cc_manager_notification_history_v1',{p_limit:30});state.notificationHistory=Array.isArray(d)?d:[]}
  async function loadNotificationData(){await Promise.all([loadNotificationRecipients(state.notificationSearch||''),loadNotificationHistory()])}
  async function loadCompetitionSyncStatus(){try{state.competitionSyncStatus=await rpc('cc_manager_competition_sync_status_v1')}catch(err){console.warn('MGR013 sync status unavailable',err);state.competitionSyncStatus=null}}
  async function loadCompetitionResultsStandings(){
    let results=[],standings=[],errors=[];
    try{const d=await rpc('cc_manager_competition_results_v1',{p_team_ids:null});results=Array.isArray(d)?d:[]}catch(err){console.warn('MGR014 results unavailable',err);errors.push(text(err?.message||err))}
    try{const d=await rpc('cc_manager_competition_standings_v1',{p_team_ids:null});standings=Array.isArray(d)?d:[]}catch(err){console.warn('MGR014 standings unavailable',err);errors.push(text(err?.message||err))}
    if(!standings.length){
      try{const d=await rpc('cc_manager_competition_overview_standings_v1');standings=Array.isArray(d)?d:[];if(standings.length)errors=[]}
      catch(err){console.warn('MGR016 standings fallback unavailable',err);errors.push(text(err?.message||err))}
    }
    state.competitionResults=results;
    state.competitionStandings=standings;
    state.competitionDataError=standings.length?'':errors.filter(Boolean).slice(-1)[0]||'';
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
  async function loadMassArchive(){
    const now=new Date(),seasonYear=now.getMonth()>=7?now.getFullYear():now.getFullYear()-1,
      from=new Date(seasonYear,7,1),to=new Date(now);
    to.setHours(23,59,59,999);
    const range={p_from:localDateKey(from),p_to:localDateKey(to)};
    // Training managers use the dedicated history reader; calendar-only viewers
    // retain their previous, separately authorized read-only history access.
    const data=can('mass.trainings')
      ?await rpc('cc_manager_mass_training_history_v1',range)
      :await rpc('cc_manager_mass_calendar_v1',range);
    state.massArchiveEvents=(Array.isArray(data)?data:[]).filter(e=>{
      const end=safeDate(e.endsAt||e.ends_at||e.startsAt||e.starts_at);
      return end&&end.getTime()<Date.now();
    }).sort((a,b)=>(eventStart(b)?.getTime()||0)-(eventStart(a)?.getTime()||0));
  }
  async function loadMassAthletes(){const d=await rpc('cc_manager_mass_athletes_v1',{p_query:'',p_level:'',p_status:''});state.massAthletes=Array.isArray(d)?d:[]}
  async function loadMassPasses(){const d=await rpc('cc_manager_mass_passes_v1',{p_query:'',p_month:''});state.massPasses=Array.isArray(d)?d:[]}
  async function loadActivityEvents(){const now=new Date(),seasonYear=now.getMonth()>=7?now.getFullYear():now.getFullYear()-1,from=new Date(seasonYear,7,1),to=new Date(seasonYear+1,7,1),jobs=[];if(can('competition.trainings'))jobs.push(rpc('cc_manager_events_v1',{p_from:from.toISOString(),p_to:to.toISOString(),p_kind:'training',p_team_id:null}));if(can('competition.matches'))jobs.push(rpc('cc_manager_events_v1',{p_from:from.toISOString(),p_to:to.toISOString(),p_kind:'match',p_team_id:null}));const parts=await Promise.all(jobs);state.activityEvents=parts.flatMap(x=>Array.isArray(x)?x:[]).sort((a,b)=>eventStart(a)-eventStart(b))}
  async function loadMassTrainings(){const from=new Date(),to=new Date();from.setHours(0,0,0,0);to.setDate(to.getDate()+120);const d=await rpc('cc_manager_mass_trainings_v1',{p_from:localDateKey(from),p_to:localDateKey(to)});state.massTrainings=Array.isArray(d)?d:[];state.massLoadError=''}
  async function loadAdmins(){const d=await rpc('cc_manager_admins_v1');state.admins=Array.isArray(d?.admins)?d.admins:[];state.adminTeams=Array.isArray(d?.teams)?d.teams:state.teams;state.adminsLoadError='';if(state.adminEditId&&state.adminEditId!=='__new__'&&!state.admins.some(a=>text(a.id)===text(state.adminEditId)))state.adminEditId=''}
  async function loadMassEventDetail(eventId,{force=false}={}){
    const id=text(eventId);
    if(!force&&state.massDetailCache.has(id))return state.massDetailCache.get(id);
    const [detail,snapshot,cancelledResult]=await Promise.all([
      rpc('cc_manager_mass_event_detail_v1',{p_event_id:id}),
      rpc('cc_manager_mass_attendance_snapshot_r1_v1',{p_event_id:id}),
      // Cancellation history is optional: never block active roster or attendance.
      rpc('cc_manager_mass_cancellations_v1',{p_event_id:id})
        .then(rows=>({rows:Array.isArray(rows)?rows:[],unavailable:!Array.isArray(rows)}))
        .catch(err=>{console.warn('Mass cancellation history unavailable',err);return{rows:[],unavailable:true}})
    ]);
    const data=(detail&&typeof detail==='object')?detail:{};
    data.cancelled=cancelledResult.rows;data.cancelledUnavailable=cancelledResult.unavailable;
    const rows=Array.isArray(snapshot)?snapshot:[];
    const attendanceByBooking=new Map(rows.map(row=>[text(row.bookingId||row.id),row]));
    if(Array.isArray(data.bookings)){
      data.bookings=data.bookings.map(row=>{
        const saved=attendanceByBooking.get(text(row.bookingId||row.id));
        if(!saved)return row;
        return {...row,attendance:text(saved.attendance)||'NINCS RÖGZÍTVE',bookingStatus:text(saved.bookingStatus)||row.bookingStatus,attendanceUpdatedAt:saved.updatedAt||row.attendanceUpdatedAt};
      });
    }
    state.massDetailCache.set(id,data);
    return data;
  }
  function matrixRange(){const f=state.matrixFilters||{},now=new Date();now.setHours(0,0,0,0);let from=new Date(now),to=new Date(now);if(f.period==='28')to.setDate(to.getDate()+28);else if(f.period==='CUSTOM'&&f.from&&f.to){from=new Date(f.from+'T00:00:00');to=new Date(f.to+'T00:00:00');to.setDate(to.getDate()+1)}else to.setDate(to.getDate()+14);return{from,to}}
  async function loadRsvpMatrix(){
    const {from,to}=matrixRange();
    try{
      const d=await rpc('cc_manager_rsvp_matrix_v1',{p_from:from.toISOString(),p_to:to.toISOString(),p_team_id:null});
      state.rsvpMatrix=d&&typeof d==='object'?d:{events:[],players:[],responses:[]};
      state.rsvpMatrixLoadError='';
    }catch(err){
      console.warn('Overview RSVP matrix unavailable; keeping/falling back to season data.',err);
      state.rsvpMatrix=state.rsvpMatrix&&typeof state.rsvpMatrix==='object'?state.rsvpMatrix:{events:[],players:[],responses:[]};
      state.rsvpMatrixLoadError=text(err?.message||err||'A jelenléti rács adatforrása nem érhető el.');
    }
  }
  // The RSVP matrix RPC permits 62 days only. Position badges use a compact
  // year-wide count RPC instead; leave the existing grid's short-range data alone.
  let ccSeasonPositionByEvent_=new Map();
  async function loadCardRsvpMatrix(){
    const now=new Date(),year=now.getMonth()>=7?now.getFullYear():now.getFullYear()-1;
    const from=new Date(year,7,1),to=new Date(year+1,7,1);
    const data=await rpc('cc_manager_competition_position_counts_v1',{p_from:from.toISOString(),p_to:to.toISOString()});
    ccSeasonPositionByEvent_=new Map((Array.isArray(data)?data:[]).map(x=>[text(x.eventId),x]));
    state.cardRsvpMatrix={events:[],players:[],responses:[]};
  }
  async function loadCoachAvailability(){const now=new Date(),seasonYear=now.getMonth()>=7?now.getFullYear():now.getFullYear()-1,from=new Date(seasonYear,7,1),to=new Date(seasonYear+1,7,1);try{const d=await rpc('cc_manager_coach_availability_v1',{p_from:from.toISOString(),p_to:to.toISOString(),p_team_id:null});state.coachAvailability=Array.isArray(d)?d:[]}catch(err){console.warn('MGR019 coach availability unavailable',err);state.coachAvailability=[]}}
  // v2 is not deployed on production; one real RPC per event, shared by concurrent callers.
  const ccRosterInFlight_=new Map();
  async function loadEventRoster(eventId,{force=false}={}){
    const id=text(eventId);
    if(!id)return[];
    if(!force&&state.eventRosterCache.has(id))return state.eventRosterCache.get(id);
    if(ccRosterInFlight_.has(id))return ccRosterInFlight_.get(id);
    let release;
    const timeout=new Promise((_,reject)=>{release=setTimeout(()=>reject(new Error('A névsor betöltése túl sokáig tart. Próbáld újra.')),12000)});
    const task=Promise.race([rpc('cc_manager_event_roster_v1',{p_event_id:id}),timeout])
      .then(result=>{
        const rows=Array.isArray(result)?result:[];
        state.eventRosterCache.set(id,rows);
        return rows;
      }).finally(()=>{clearTimeout(release);ccRosterInFlight_.delete(id)});
    ccRosterInFlight_.set(id,task);
    return task;
  }
  function useDemo(){const d=demoData();Object.assign(state,d);state.calendarEvents=d.calendarEvents;state.activityEvents=d.activityEvents;applyManager();renderChrome();renderView();status('Preview mód: nincs production adatkapcsolat. A csomag nem ír semmit.')}

  function resolveInitialRoute(){const raw=location.hash.replace(/^#/,'');if(raw==='settings'){state.module='settings';return}if(raw==='planning'||raw==='planning/counter'){state.module='planning';state.plannerTab=raw==='planning/counter'?'counter':'planner';return}if(raw==='finance'){state.module='finance';return}if(raw==='calendar'){state.module='calendar';return}const [a,m]=raw.split('/');if(AREAS[a]&&AREAS[a].modules.some(x=>x[0]===m)){state.area=a;state.module=m;if(m==='calendar')state.calendarScope=a==='mass'?'MASS':'COMPETITION'}}
  function ccForceRootHorizontalZero_(){
    const y=window.scrollY||document.scrollingElement?.scrollTop||0;
    try{if(window.scrollX!==0)window.scrollTo({left:0,top:y,behavior:'auto'})}catch(_){try{window.scrollTo(0,y)}catch(__){}}
    const roots=[document.scrollingElement,document.documentElement,document.body,$('#mainContent'),$('#view-dynamic'),$('#viewContent')];
    roots.forEach(el=>{if(el&&el.scrollLeft)el.scrollLeft=0});
  }
  function setRoute(area,module,{replace=false}={}){ccAdvanceRouteGeneration_();let h;if(module==='calendar')state.calendarScope=area==='mass'?'MASS':'COMPETITION';if(module==='settings'){state.module='settings';h='#settings'}else if(module==='planning'){state.module='planning';state.plannerTab='planner';h='#planning'}else if(module==='finance'){state.module='finance';h='#finance'}else if(module==='calendar'){state.area=area;state.module='calendar';h='#calendar'}else{state.area=area;state.module=module;h=`#${area}/${module}`;try{localStorage.setItem(`cc-manager-last-module:${area}`,module)}catch(_){}}replace?history.replaceState(null,'',h):history.pushState(null,'',h);renderChrome();renderView();try{window.scrollTo({left:0,top:0,behavior:'auto'})}catch(_){window.scrollTo(0,0)};requestAnimationFrame(ccForceRootHorizontalZero_)}
  function setPlannerTab_(tab){if(!canMainSection_('planning'))return;ccAdvanceRouteGeneration_();state.module='planning';state.plannerTab=tab==='counter'?'counter':'planner';history.pushState(null,'',state.plannerTab==='counter'?'#planning/counter':'#planning');renderChrome();renderView();try{window.scrollTo({left:0,top:0,behavior:'auto'})}catch(_){window.scrollTo(0,0)}}
  function legacyDefaultModule_(area){const preferred=area==='mass'?'trainings':'overview';let saved='';try{saved=localStorage.getItem(`cc-manager-last-module:${area}`)||''}catch(_){};if(saved&&permittedAreaModules_(area).some(m=>m[0]===saved))return saved;if(canRoute(area,preferred))return preferred;return permittedAreaModules_(area)[0]?.[0]||preferred}
  function switchArea(area){if(!AREAS[area])return;setRoute(area,legacyDefaultModule_(area))}

  function permittedAreaModules_(area){return (AREAS[area]?.modules||[]).filter(m=>{if(m[0]==='calendar')return false;if(area==='mass'&&['archive','passes'].includes(m[0]))return false;return canRoute(area,m[0])})}
  function renderChrome(){
    ensureAuthorizedRoute_();
    const section=mainSection_(),area=currentArea(),meta=moduleMeta();
    if($('#pageAreaLabel'))$('#pageAreaLabel').textContent=section==='competition'?'VERSENYSPORT':section==='mass'?'TÖMEGSPORT':section==='calendar'?'NAPTÁR':section==='planning'?'EDZÉSTERVEZÉS':section==='finance'?'PÉNZÜGYEK':'RENDSZER';
    if($('#pageTitle'))$('#pageTitle').textContent=meta?.[1]||'Manager';
    const primary=$('#legacyPrimaryNav');
    if(primary)primary.innerHTML=[
      ['competition','Versenysport'],['mass','Tömegsport'],['calendar','Naptár'],['planning','Edzéstervezés'],['finance','Pénzügyek'],['settings','Beállítások']
    ].filter(([key])=>canMainSection_(key)).map(([key,label])=>`<button class="legacy-primary-tab ${section===key?'active':''}" type="button" data-main-section="${key}">${esc(label)}</button>`).join('');
    const secondary=$('#legacySecondaryNav');
    if(secondary){
      if(section==='competition'||section==='mass'){
        secondary.hidden=false;
        secondary.innerHTML=permittedAreaModules_(section).map(m=>`<button class="legacy-secondary-tab ${state.area===section&&state.module===m[0]?'active':''}" data-route-area="${section}" data-route-module="${m[0]}" type="button">${esc(m[1])}</button>`).join('');
      }else if(section==='planning'){
        secondary.hidden=false;
        secondary.innerHTML=[['planner','Tervező'],['counter','Számláló']].map(([key,label])=>'<button class="legacy-secondary-tab '+(state.plannerTab===key?'active':'')+'" type="button" data-planning-tab="'+key+'">'+label+'</button>').join('');
      }else{secondary.hidden=true;secondary.innerHTML=''}
    }
    const refreshBtn=$('#refreshBtn');if(refreshBtn){refreshBtn.classList.remove('beac-import-button');refreshBtn.classList.add('cc-text-refresh');refreshBtn.setAttribute('aria-label','Adatok frissítése');refreshBtn.title='Adatok frissítése';refreshBtn.textContent='Frissítés'}
    bindDynamicNavigation();
  }
  function bindDynamicNavigation(){
    Array.from(document.querySelectorAll('[data-main-section]')).forEach(b=>b.onclick=()=>{const section=b.dataset.mainSection;if(section==='competition'||section==='mass')switchArea(section);else if(section==='calendar'){const area=canRoute(state.area,'calendar')?state.area:(canRoute('competition','calendar')?'competition':'mass');setRoute(area,'calendar')}else setRoute(state.area,section)});
    $$('[data-route-module]').forEach(b=>b.onclick=()=>setRoute(b.dataset.routeArea||state.area,b.dataset.routeModule));
    $$('[data-planning-tab]').forEach(b=>b.onclick=()=>setPlannerTab_(b.dataset.planningTab));
  }

  function metric(label,value,note){return `<article class="metric-card"><small>${esc(label)}</small><strong>${value==null?'–':esc(value)}</strong><span>${esc(note)}</span></article>`}
  function eventRow(e){const s=e.startsAt||e.starts_at;return `<div class="event-row"><span class="event-accent" style="background:${esc(e.color||'#f7b700')}"></span><div class="event-main"><strong>${esc(e.title||((e.eventType||e.event_type)==='match'?'Meccs':'Edzés'))}</strong><small>${esc(e.teamName||e.team_name||'')} · ${esc(e.court||e.venue||'')}</small></div><div class="event-meta"><b>${esc(fmtDate(s))}</b><span>${esc(fmtTime(s))}</span></div></div>`}
  function teamRow(t){return `<div class="team-row"><span class="team-color" style="background:${esc(t.color||'#f7b700')}"></span><div><strong>${esc(t.name)}</strong><small>${esc(t.season||cfg.DEFAULT_SEASON)}</small></div><span class="team-count">${t.playerCount==null?'–':esc(t.playerCount)} fő</span></div>`}
  function healthRows(items){return items.map(([label,stateText,stateClass])=>`<div class="health-row"><span>${esc(label)}</span><b class="${stateClass||''}">${esc(stateText)}</b></div>`).join('')}

  function num(v){const n=Number(v);return Number.isFinite(n)?n:0}
  function pct(a,b){const aa=num(a),bb=num(b);return bb>0?Math.round(aa*100/bb):null}
  function pctText(a,b){const p=pct(a,b);return p==null?'–':`${p}%`}
  function teamById(id){return state.teams.find(t=>text(t.id)===text(id))||null}
  let ccTeamSelectorObserver_=null,ccTeamSelectorRaf_=0;
  function ccTeamSelectorColor_(value,label=''){
    const v=text(value),name=text(label);
    let team=teamById(v);
    if(!team&&name)team=(state.teams||[]).find(t=>text(t.name)===name||text(t.name).replace(/^BEAC\s+/i,'')===name.replace(/^BEAC\s+/i,''));
    return /^#[0-9a-f]{6}$/i.test(text(team?.color))?text(team.color):'#b7b7b7'
  }
  function ccDecorateTeamSelectors_(){
    document.querySelectorAll('label').forEach(label=>{
      const select=label.querySelector('select');if(!select)return;
      const caption=text(label.querySelector(':scope > span')?.textContent||label.querySelector('span')?.textContent);
      if(!/csapat/i.test(caption))return;
      const option=select.selectedOptions?.[0],color=ccTeamSelectorColor_(select.value,option?.textContent||'');
      label.classList.add('cc-team-select-wrap');
      label.style.setProperty('--cc-team-color',color);
      label.classList.toggle('cc-team-select-neutral',color==='#b7b7b7');
    });
    $$('[data-team-filter-details]').forEach(details=>{
      const scope=text(details.dataset.teamFilterDetails),ids=teamFilterIds_(scope),color=ids.length===1?ccTeamSelectorColor_(ids[0],teamById(ids[0])?.name||''):'#b7b7b7';
      details.classList.add('cc-team-select-details');
      details.style.setProperty('--cc-team-color',color);
      details.classList.toggle('cc-team-select-neutral',color==='#b7b7b7');
    })
  }
  function ccScheduleTeamSelectorDecorate_(){
    if(ccTeamSelectorRaf_)cancelAnimationFrame(ccTeamSelectorRaf_);
    ccTeamSelectorRaf_=requestAnimationFrame(()=>{ccTeamSelectorRaf_=0;ccDecorateTeamSelectors_()})
  }
  function ccInstallTeamSelectorDecorator_(){
    if(ccTeamSelectorObserver_)return;
    ccTeamSelectorObserver_=new MutationObserver(()=>ccScheduleTeamSelectorDecorate_());
    ccTeamSelectorObserver_.observe(document.body,{childList:true,subtree:true});
    ccScheduleTeamSelectorDecorate_()
  }
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
    details?.addEventListener('toggle',()=>{if(details.isConnected&&state.teamFilterOpen)state.teamFilterOpen[scope]=details.open});
    all?.addEventListener('change',()=>{state.teamFilters[scope]=[];state.teamFilterOpen[scope]=true;renderFn()});
    items.forEach(x=>x.addEventListener('change',()=>{const ids=items.filter(i=>i.checked).map(i=>i.value);state.teamFilters[scope]=ids;state.teamFilterOpen[scope]=true;renderFn()}));
  }
  function overviewContextTeams_(){
    const rows=(state.teams||[]).filter(t=>t.active!==false);
    const rank=t=>{const n=text(t?.name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();if(n.includes('noi i')&&!n.includes('noi ii'))return 1;if(n.includes('noi ii'))return 2;if(n.includes('ferfi'))return 3;return 9};
    return rows.slice().sort((a,b)=>rank(a)-rank(b)||text(a.name).localeCompare(text(b.name),'hu'));
  }
  function overviewTeamChipLabel_(team){
    const n=text(team?.name);const x=n.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    if(x.includes('noi ii'))return'Női II';
    if(x.includes('noi i'))return'Női I';
    if(x.includes('ferfi'))return'Férfi';
    return n.replace(/^BEAC\s+/i,'')||'Csapat';
  }

  function ccOverviewSelectableTeams_(){
    const all=overviewContextTeams_(),known=new Set((matrixSource_().events||[]).map(eventTeamId).map(text).filter(Boolean));
    return known.size?all.filter(t=>known.has(text(t.id))):all;
  }
  function syncOverviewTeamContext_(){
    const eligible=new Set(ccOverviewSelectableTeams_().map(t=>text(t.id)));
    let selected=teamFilterIds_('overview').filter(id=>eligible.has(id));
    if(selected.length===eligible.size)selected=[];
    state.teamFilters.overview=selected;
    state.overviewTeam=selected.length===1?selected[0]:'';
  }
  function overviewTeamSwitchHtml_(){
    const teams=ccOverviewSelectableTeams_(),selected=new Set(teamFilterIds_('overview'));
    const allChecked=!selected.size||selected.size===teams.length;
    const caption=allChecked?'Összes csapat':selected.size===1?(teams.find(t=>selected.has(text(t.id)))?.name||'1 csapat'):selected.size+' csapat';
    const opened=state.teamFilterOpen?.overviewSelect===true;
    return '<details id="overviewTeamPicker" class="cc-overview-team-picker" '+(opened?'open':'')+'>'
      +'<summary><span>Csapat</span><b>'+esc(caption)+'</b><span class="cc-overview-empty-triangle" aria-hidden="true"></span></summary>'
      +'<div class="cc-overview-team-options">'
      +'<label><input type="checkbox" data-overview-team-all '+(allChecked?'checked':'')+'>Összes csapat</label>'
      +teams.map(t=>'<label><input type="checkbox" data-overview-team-item value="'+esc(t.id)+'" '+(allChecked||selected.has(text(t.id))?'checked':'')+'>'+esc(t.name)+'</label>').join('')
      +'</div></details>';
  }
  function bindOverviewTeamSwitch_(){
    const holder=$('#overviewTeamPicker'),teams=ccOverviewSelectableTeams_(),valid=teams.map(t=>text(t.id));
    holder?.addEventListener('toggle',()=>{if(holder.isConnected)state.teamFilterOpen.overviewSelect=holder.open});
    const update=ids=>{
      const selected=[...new Set(ids)].filter(id=>valid.includes(id));
      state.teamFilters.overview=selected.length===valid.length?[]:selected;
      state.overviewTeam=selected.length===1?selected[0]:'';
      state.teamFilterOpen.overviewSelect=true;
      renderOverview();
    };
    holder?.querySelector('[data-overview-team-all]')?.addEventListener('change',()=>update(valid));
    holder?.querySelectorAll('[data-overview-team-item]').forEach(el=>el.addEventListener('change',()=>{
      const picked=[...holder.querySelectorAll('[data-overview-team-item]:checked')].map(item=>item.value);
      update(picked.length?picked:valid);
    }));
  }
  function rsvpPills(e){return `<div class="rsvp-plain" aria-label="Jövök: ${num(e.yesCount)}, nem jövök: ${num(e.noCount)}, nincs jelzés: ${num(e.unknownCount)}"><span class="yes"><b>${num(e.yesCount)}</b></span><span class="no"><b>${num(e.noCount)}</b></span><span class="unknown"><b>${num(e.unknownCount)}</b></span></div>`}
  function competitionResultByEvent_(eventId){return (state.competitionResults||[]).find(r=>text(r.eventId)===text(eventId))||null}
  function matchResultOrRsvp_(e){const r=competitionResultByEvent_(e.eventId||e.id);if(!r||r.homeSets==null||r.awaySets==null)return rsvpPills(e);const sets=Array.isArray(r.setScores)?r.setScores:[];return `<div class="match-result-compact"><strong>${num(r.homeSets)} : ${num(r.awaySets)}</strong>${sets.length?`<small>${sets.map(x=>`${num(x.home)}:${num(x.away)}`).join(' · ')}</small>`:''}</div>`}
  function standingsForContext_(teamId){return (state.competitionStandings||[]).filter(r=>text(r.contextTeamId)===text(teamId)).sort((a,b)=>(Number(a.position)||9999)-(Number(b.position)||9999)||text(a.teamName).localeCompare(text(b.teamName),'hu'))}
  const ccOverviewLeagueInsights_=Object.create(null);
  async function ccEnsureOverviewLeagueInsight_(teamId){
    const id=text(teamId);
    if(!id||!configured()||ccOverviewLeagueInsights_[id])return;
    ccOverviewLeagueInsights_[id]={loading:true,loaded:false,error:'',data:null};
    try{
      const data=await rpc('cc_manager_competition_league_insights_v1',{p_context_team_id:id});
      ccOverviewLeagueInsights_[id]={loading:false,loaded:true,error:'',data:data||{}};
    }catch(err){
      ccOverviewLeagueInsights_[id]={loading:false,loaded:true,error:text(err?.message||err),data:null};
    }
    if(ccRouteIs_('competition','overview'))renderOverview();
  }
  function ccLeagueInsightRows_(data){
    const list=(Array.isArray(data?.teams)?data.teams:[]).map(t=>({
      ...(t?.current||{}),sourceTeamId:text(t?.sourceTeamId),
      teamName:text(t?.teamName),focus:t?.focus===true,
      history:Array.isArray(t?.history)?t.history:[]
    }));
    if(!list.length)return list;
    const hasPoints=list.some(r=>{const n=Number(String(r?.tablePoints??'').replace(',','.'));return Number.isFinite(n)&&n!==0});
    if(hasPoints||list.some(r=>Number(r.played)>0))
      return list.sort((a,b)=>(Number(a.position)||9999)-(Number(b.position)||9999)||text(a.teamName).localeCompare(text(b.teamName),'hu'));
    return list.sort((a,b)=>text(a.teamName).localeCompare(text(b.teamName),'hu',{sensitivity:'base'}))
      .map(r=>({...r,position:null,provisionalAlphabetical:true}));
  }
  function ccOverviewStandingsModel_(teamId){
    const id=text(teamId),men=id==='10000000-0000-4000-8000-000000000003',
      group=men?(ccMrszMenGroup_==='A'?'Férfi Budapest I. osztály – A csoport':'Férfi Budapest I. osztály – B csoport')
      :id==='10000000-0000-4000-8000-000000000002'?'Női Budapest II. osztály – B csoport':'Női Budapest I. osztály';
    const snapshot=ccMrszPhotoState_.loaded?ccMrszPhotoState_.tables.find(t=>text(t.competitionLabel)===group):null;
    if(snapshot&&Array.isArray(snapshot.rows)&&snapshot.rows.length){
      const rows=ccStandingsPhotoTeamRows_(snapshot).slice().sort(snapshot.partial!==false
        ?(a,b)=>text(a.teamName).localeCompare(text(b.teamName),'hu')
        :(a,b)=>(num(a.position)||9999)-(num(b.position)||9999));
      return {rows,group,source:ccMrszCoverageLabel_(snapshot),snapshot,verified:true};
    }
    // Share the Tabella view's canonical league-insights rows for this context.
    // Unlike the old overview-only RPC fallback, this retains complete league
    // rankings even when the MRSZ snapshot table is not available.
    const insight=ccOverviewLeagueInsights_[id];
    if(!insight)void ccEnsureOverviewLeagueInsight_(id);
    const insightRows=insight?.loaded&&!insight.error?ccLeagueInsightRows_(insight.data):[];
    const baseRows=insightRows.length?insightRows:standingsForContext_(id);
    const ranked=baseRows.filter(r=>{
      const rank=Number(r.position),played=Number(r.played||0),points=Number(r.tablePoints||0);
      return Number.isFinite(rank)&&rank>0&&(played>0||points>0);
    });
    // Federation import can include team membership without a verified ranking.
    // Show those teams, but never promote an alphabetical fallback to a league table.
    const rows=ranked.length?ranked:baseRows.map(r=>({...r,position:null,played:null,
      wins:null,losses:null,tablePoints:null,setsFor:null,setsAgainst:null,
      pointsFor:null,pointsAgainst:null,_ccUnranked:true})).sort((a,b)=>text(a.teamName).localeCompare(text(b.teamName),'hu'));
    return {rows,group,source:ranked.length?'BRSZ · mentett állás · forrásdátum nem igazolt · nem élő adat'
      :rows.length?'BRSZ · mentett csapatlista · hiteles helyezés és mérleg nincs'
      :ccMrszCoverageLabel_(null),snapshot:null,verified:ranked.length>0};
  }
  function standingsLogo_(r){const html=ccTeamLogoHtml_(r?.teamName,r?.logoUrl,'standing-logo-asset',text(r?.teamName).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()||'').join('')||'•');return html.replace(/^<img class="ms-team-logo standing-logo-asset"/,'<img class="standing-logo-img"').replace(/^<span class="ms-team-logo ms-monogram standing-logo-asset"/,'<span class="standing-logo-text"')}
  function standingsCard_(contextTeamId){
    const data=ccOverviewStandingsModel_(contextTeamId),rows=data.rows,team=teamById(contextTeamId),
      men=text(contextTeamId)==='10000000-0000-4000-8000-000000000003';
    const controls=men?'<span class="cc-overview-men-groups" role="group" aria-label="Férfi bajnoki csoport">'
      +['B','A'].map(g=>'<button type="button" data-overview-men-group="'+g+'" aria-pressed="'+(ccMrszMenGroup_===g)+'" class="'+(ccMrszMenGroup_===g?'active':'')+'">'+g+'</button>').join('')+'</span>':'';
    const body=rows.length?'<div class="ms-table-scroll"><table class="ms-table"><thead><tr><th title="A lista sorrendje, nem hiteles helyezés">Sor</th><th class="team">Csapat</th><th>M</th><th>GY</th><th>V</th><th class="group-end">P</th><th>SZ</th><th>SZA</th><th>P</th><th>PA</th></tr></thead><tbody>'
      +rows.map((r,i)=>'<tr class="'+(r.focus?'focus':'')+'"><td title="'+(ccMrszStatPosition_(r.position,data.snapshot)==='–'?'Listasorszám, nem helyezés':'Hiteles helyezés')+'"><b>'+esc(ccMrszStatPosition_(r.position,data.snapshot)==='–'?String(i+1):ccMrszStatPosition_(r.position,data.snapshot))+'</b></td><td class="team"><button type="button" data-overview-standings-team="'+esc(r.sourceTeamId||'')+'" data-overview-standings-context="'+esc(contextTeamId)+'">'
        +msLogoHtml_(r.sourceTeamId,r.teamName)+'<strong>'+esc(r.teamName)+'</strong>'+ccMrszRecordNoticeHtml_(r)+'</button></td><td>'+ccMrszStatNumber_(r.played)+'</td><td>'+ccMrszRecordNumber_(r,'wins')+'</td><td>'+ccMrszRecordNumber_(r,'losses')+'</td><td class="group-end"><b>'+ccMrszStatNumber_(r.tablePoints)+'</b></td><td>'+esc(ccMrszStatPair_(r.setsFor,r.setsAgainst))+'</td><td>'+esc(ccMrszStatRatio_(r.setsFor,r.setsAgainst))+'</td><td>'+esc(ccMrszStatPair_(r.pointsFor,r.pointsAgainst))+'</td><td>'+esc(ccMrszStatRatio_(r.pointsFor,r.pointsAgainst))+'</td></tr>').join('')+'</tbody></table></div>'
      :'<p class="cc-standings-notice">'+(ccMrszPhotoState_.loading?'Mentett tabella betöltése…':ccMrszPhotoState_.error?'A mentett tabella nem tölthető be.':'Ehhez a bajnoksághoz még nincs hiteles, helyezésekkel rendelkező mentett tabella.')+'</p>';
    return '<article class="panel standings-card ms-standings-card overview-ms-standings" style="--team-color:'+esc(team?.color||'#f7b700')+'"><div class="panel-head cc-overview-standings-head"><div><h3>'+esc(team?.name||'Tabella')+'</h3><p>'+esc(data.group)+' · '+esc(data.snapshot?'Frissítve: 2026.10.14.':data.source)+'</p></div>'+controls
      +'<button type="button" class="button quiet small cc-overview-standings-more" data-overview-open-standings="'+esc(contextTeamId)+'">Részletek</button></div>'+body+'</article>';
  }
  function ccOpenStandingsContext_(contextId,sourceId='all'){
    ccClearLeagueContext_();
    state.managerStandingsContext=text(contextId);
    state.managerStandingsTeam=text(sourceId)||'all';
    try{localStorage.setItem('cc-manager-standings-context',state.managerStandingsContext);localStorage.setItem('cc-manager-standings-team',state.managerStandingsTeam)}catch(_){}
    setRoute('competition','standings');
  }
  function bindOverviewStandings_(){
    $$('[data-overview-standings-team]').forEach(b=>b.addEventListener('click',()=>ccOpenStandingsContext_(b.dataset.overviewStandingsContext,b.dataset.overviewStandingsTeam)));
    $$('[data-overview-open-standings]').forEach(b=>b.addEventListener('click',()=>ccOpenStandingsContext_(b.dataset.overviewOpenStandings)));
    $$('[data-overview-men-group]').forEach(b=>b.addEventListener('click',()=>{
      ccMrszMenGroup_=b.dataset.overviewMenGroup==='A'?'A':'B';
      if(ccRouteIs_('competition','overview'))renderOverview();
      else if(ccRouteIs_('competition','matches'))renderCompetitionMatchCards_();
    }));
  }
  function standingsSection_(scope='overview'){
    const ids=teamFilterIds_(scope),base=scope==='overview'?overviewContextTeams_():state.teams;
    const contexts=(ids.length?ids:base.map(t=>text(t.id))).filter(id=>!!teamById(id));
    if(!contexts.length)return'<div class="cc-standings-notice">Nincs kiválasztott csapat.</div>';
    return '<div class="standings-grid '+(scope==='overview'?'overview-standings-grid':'')+'">'+contexts.map(standingsCard_).join('')+'</div>';
  }


  // ---------------------------------------------------------------------------
  // V0.5.2B6H — standalone Manager standings / league insights page.
  // MGR014 remains the canonical results+standings read layer. MGR015 adds the
  // read-only history/full-league payload needed for Player-parity statistics.
  // ---------------------------------------------------------------------------
  function msNorm_(value){return text(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
  const CC_TEAM_LOGO_ASSETS_=[
    {match:['beac'],light:'assets/team-logos/beac.png'},
    {match:['bdse emericus','bdse'],light:'assets/team-logos/bdseemericus.png',dark:'assets/team-logos/bdseemericus_dark.png'},
    {match:['bunnies'],light:'assets/team-logos/bunnies.png'},
    {match:['dag','dag kse'],light:'assets/team-logos/dag.png'},
    {match:['obudai egyetem kando','kando'],light:'assets/team-logos/kando.png'},
    {match:['keac'],light:'assets/team-logos/keac.png'},
    {match:['kispest'],light:'assets/team-logos/kispest.png',dark:'assets/team-logos/kispest_dark.png'},
    {match:['kozgaz','corvinus'],light:'assets/team-logos/kozgaz.png'},
    {match:['kre'],light:'assets/team-logos/kre.png'},
    {match:['kse'],light:'assets/team-logos/kse.png'},
    {match:['mafc','schonherz','schönherz','vasarhelyi','vásárhelyi'],light:'assets/team-logos/mafc.png'},
    {match:['mozdulj'],light:'assets/team-logos/mozdulj.png'},
    {match:['mtk'],light:'assets/team-logos/mtk.png'},
    {match:['ossc'],light:'assets/team-logos/ossc.png',dark:'assets/team-logos/ossc_dark.png'},
    {match:['panorama','panoráma'],light:'assets/team-logos/panorama.png',dark:'assets/team-logos/panorama_dark.png'},
    {match:['pase'],light:'assets/team-logos/pase.png'},
    {match:['rackeve','ráckeve'],light:'assets/team-logos/rackeve.png'},
    {match:['rksk'],light:'assets/team-logos/rksk.png'},
    {match:['semmelweis','semmeilweis'],light:'assets/team-logos/semmeilweis.png'},
    {match:['taksony'],light:'assets/team-logos/taksony.png'},
    {match:['ute'],light:'assets/team-logos/ute.png'}
  ];
  function ccTeamLogoAsset_(name){
    const norm=msNorm_(name);
    if(!norm)return'';
    const hit=CC_TEAM_LOGO_ASSETS_.find(entry=>Array.isArray(entry.match)&&entry.match.some(key=>norm.includes(msNorm_(key))));
    if(!hit)return'';
    const dark=document.body.classList.contains('dark');
    return dark && text(hit.dark) ? hit.dark : hit.light;
  }
  function ccTeamLogoHtml_(name,remoteUrl,extraClass='',fallbackLabel=''){
    const localUrl=ccTeamLogoAsset_(name);
    const finalUrl=text(localUrl)||text(remoteUrl);
    const initial=(text(fallbackLabel)||text(name)).match(/[A-Za-zÁÉÍÓÖŐÚÜŰ0-9]/u);
    const monogram=(initial?.[0]||'?').toLocaleUpperCase('hu-HU');
    return finalUrl?`<img class="${esc(('ms-team-logo '+text(extraClass)).trim())}" src="${esc(finalUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:`<span class="${esc(('ms-team-logo ms-monogram '+text(extraClass)).trim())}" aria-hidden="true">${esc(monogram)}</span>`;
  }
  function msContextCandidates_(){
    const active=(state.teams||[]).filter(t=>t.active!==false);
    const mapped=new Set((state.competitionStandings||[]).map(r=>text(r.contextTeamId)).filter(Boolean));
    const list=mapped.size?active.filter(t=>mapped.has(text(t.id))):active;
    return list.length?list:active;
  }
  function msContextTeam_(){
    const list=msContextCandidates_();
    let id=text(state.managerStandingsContext);
    if(!id||!list.some(t=>text(t.id)===id)) id=text(list[0]?.id||'');
    if(id!==text(state.managerStandingsContext)){
      state.managerStandingsContext=id;
      try{localStorage.setItem('cc-manager-standings-context',id)}catch(_){}
    }
    return state.teams.find(t=>text(t.id)===id)||null;
  }
  function msData_(){return state.managerLeagueInsights?.data||null}
  function msRows_(){return ccLeagueInsightRows_(msData_())}
  function msStandingSourceRow_(sourceTeamId,name){
    const ctx=text(msContextTeam_()?.id),sid=text(sourceTeamId),nk=msNorm_(name);
    return (state.competitionStandings||[]).find(r=>text(r.contextTeamId)===ctx&&((sid&&text(r.sourceTeamId)===sid)||(nk&&msNorm_(r.teamName)===nk)))||null;
  }
  function msLogoHtml_(sourceTeamId,name,extra=''){
    const row=msStandingSourceRow_(sourceTeamId,name);
    return ccTeamLogoHtml_(name,row?.logoUrl,extra,name);
  }
  function msRatio_(explicit,a,b){
    const raw=Number(explicit);if(Number.isFinite(raw)&&raw!==0)return raw.toFixed(3);
    const aa=Number(a),bb=Number(b);if(a==null||b==null||!Number.isFinite(aa)||!Number.isFinite(bb)||aa===0&&bb===0)return'–';if(bb===0)return aa>0?'∞':'–';return(aa/bb).toFixed(3)
  }
  function msPair_(a,b){return`${Number.isFinite(Number(a))?Number(a):0}–${Number.isFinite(Number(b))?Number(b):0}`}
  function msSelectedRow_(rows=msRows_()){
    const id=text(state.managerStandingsTeam||'all');
    if(!id||id==='all')return null;
    const row=rows.find(r=>text(r.sourceTeamId)===id)||null;
    if(!row){state.managerStandingsTeam='all';try{localStorage.setItem('cc-manager-standings-team','all')}catch(_){}return null}
    return row;
  }
  function msFocusRow_(rows=msRows_()){return rows.find(r=>r.focus)||rows[0]||null}
  function msHistoryPoints_(history){
    const rows=(Array.isArray(history)?history:[]).filter(x=>x?.position!=null&&Number.isFinite(Number(x.position))&&Number(x.position)>0).slice().sort((a,b)=>new Date(a?.snapshotAt||0)-new Date(b?.snapshotAt||0)),out=[];
    rows.forEach(row=>{const item={...row,position:Number(row.position),played:Number(row?.played||0)};const prev=out[out.length-1];if(prev&&prev.position===item.position&&prev.played===item.played)out[out.length-1]=item;else out.push(item)});return out
  }
  function msPositionDelta_(history,currentPosition,currentPlayed){
    const pts=msHistoryPoints_(history),current=Number(currentPosition),played=Number(currentPlayed||0);if(currentPosition==null||!Number.isFinite(current)||current<=0||played<=0||pts.length<2)return null;let previous=null;
    for(let i=pts.length-1;i>=0;i--){if(Number(pts[i]?.played)<played){previous=pts[i];break}}
    if(!previous)for(let i=pts.length-2;i>=0;i--){if(Number(pts[i]?.position)!==current){previous=pts[i];break}}
    if(!previous||!Number.isFinite(Number(previous.position)))return null;return Number(previous.position)-current
  }
  function msOutcome_(m,sourceId){const id=text(sourceId),home=text(m?.homeSourceTeamId)===id,away=text(m?.awaySourceTeamId)===id;if(!home&&!away)return'';const hs=Number(m?.homeSets),as=Number(m?.awaySets);if(!Number.isFinite(hs)||!Number.isFinite(as)||hs===as)return'';return(home?hs>as:as>hs)?'W':'L'}
  function msOpponentId_(m,sourceId){return text(m?.homeSourceTeamId)===text(sourceId)?text(m?.awaySourceTeamId):text(m?.homeSourceTeamId)}
  function msStatsModel_(row){
    const d=msData_()||{},sourceId=text(row?.sourceTeamId),opponents=new Map((Array.isArray(d?.teams)?d.teams:[]).map(t=>[text(t?.sourceTeamId),Number(t?.current?.position)||null]));
    const matches=(Array.isArray(d?.matches)?d.matches:[]).filter(m=>{if(text(m?.homeSourceTeamId)!==sourceId&&text(m?.awaySourceTeamId)!==sourceId)return false;return !!msOutcome_(m,sourceId)}).slice().sort((a,b)=>new Date(a?.startsAt||0)-new Date(b?.startsAt||0));
    const recent=matches.slice(-5),outcomes=recent.map(m=>msOutcome_(m,sourceId)),latest=outcomes.at(-1)||'',streak=latest?outcomes.slice().reverse().findIndex(x=>x!==latest):-1,streakN=latest?(streak===-1?outcomes.length:streak):0;
    const home={w:0,l:0},away={w:0,l:0};matches.forEach(m=>{const b=text(m?.homeSourceTeamId)===sourceId?home:away;msOutcome_(m,sourceId)==='W'?b.w++:b.l++});
    const total=Math.max(1,Number(d?.totalTeams)||opponents.size||1),topEnd=Math.ceil(total/3),midEnd=Math.ceil(total*2/3),strength={top:{w:0,l:0},mid:{w:0,l:0},bottom:{w:0,l:0}};
    matches.forEach(m=>{const pos=opponents.get(msOpponentId_(m,sourceId));if(!pos)return;const key=pos<=topEnd?'top':pos<=midEnd?'mid':'bottom';msOutcome_(m,sourceId)==='W'?strength[key].w++:strength[key].l++});
    return{matches,recent,outcomes,latest,streak:streakN,home,away,strength}
  }
  function msTrendHtml_(delta){if(delta==null)return'';if(delta>0)return`<em class="ms-trend up">↑${delta}</em>`;if(delta<0)return`<em class="ms-trend down">↓${Math.abs(delta)}</em>`;return`<em class="ms-trend flat">→</em>`}
  function msFormHtml_(outcomes){const x=(Array.isArray(outcomes)?outcomes:[]).slice(-5);return x.length?`<span class="ms-form">${x.map(v=>`<i class="${v==='W'?'win':'loss'}"></i>`).join('')}</span>`:'<span class="ms-form-empty">–</span>'}
  function msChart_(history,totalTeams){
    const pts=msHistoryPoints_(history);if(pts.length<2)return`<div class="ms-chart-empty">A helyezésgrafikon a következő tabellafrissítésekkel épül fel.</div>`;
    const W=360,H=120,l=28,r=12,t=12,b=22,total=Math.max(2,Number(totalTeams)||Math.max(...pts.map(p=>p.position))),x=i=>l+(W-l-r)*(i/(pts.length-1)),y=p=>t+(H-t-b)*((p-1)/(total-1));
    const poly=pts.map((p,i)=>`${x(i).toFixed(1)},${y(p.position).toFixed(1)}`).join(' '),dots=pts.map((p,i)=>`<circle cx="${x(i).toFixed(1)}" cy="${y(p.position).toFixed(1)}" r="3"></circle>`).join('');
    return`<svg class="ms-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Helyezés alakulása"><line x1="${l}" x2="${W-r}" y1="${t}" y2="${t}"/><line x1="${l}" x2="${W-r}" y1="${H-b}" y2="${H-b}"/><text x="4" y="${t+4}">1.</text><text x="4" y="${H-b+4}">${total}.</text><polyline points="${poly}"/>${dots}</svg>`
  }
  function msPositionLabel_(row){const pos=row?.position==null?NaN:Number(row.position);return !row?.provisionalAlphabetical&&Number.isInteger(pos)&&pos>0?`${pos}. hely`:'–'}
  function msTeamStatus_(row){const model=msStatsModel_(row),delta=msPositionDelta_(row?.history,row?.position,row?.played);return`<small>${msPositionLabel_(row)} ${msTrendHtml_(delta)} ${msFormHtml_(model.outcomes)}</small>`}
  function msMatchDate_(m){const d=safeDate(m?.startsAt);return d?new Intl.DateTimeFormat('hu-HU',{month:'short',day:'numeric',timeZone:'Europe/Budapest'}).format(d).replace(/\.$/,''):'–'}
  function msMatchTime_(m){const d=safeDate(m?.startsAt);return d?fmtTime(d):''}
  function msRowBySource_(id){return msRows_().find(r=>text(r.sourceTeamId)===text(id))||null}
  function msMatchesHtml_(rows,selected){
    const allMatches=Array.isArray(msData_()?.matches)?msData_().matches:[],focus=msFocusRow_(rows),focusId=text(focus?.sourceTeamId),selectedId=text(selected?.sourceTeamId),scope=state.managerStandingsMatchScope==='beac'?'beac':'all';
    let matches=allMatches.filter(m=>!selectedId||text(m?.homeSourceTeamId)===selectedId||text(m?.awaySourceTeamId)===selectedId);
    if(scope==='beac'&&focusId){
      matches=matches.filter(m=>{
        const home=text(m?.homeSourceTeamId),away=text(m?.awaySourceTeamId),hasFocus=home===focusId||away===focusId;
        if(!hasFocus)return false;
        return !selectedId||selectedId===focusId||home===selectedId||away===selectedId;
      });
    }
    matches=matches.slice().sort((a,b)=>new Date(a?.startsAt||0)-new Date(b?.startsAt||0));
    const title=selected?`Meccsek · ${text(selected.teamName)}`:'Bajnoki meccsek';
    const teamOptions=`<option value="all" ${selectedId?'':'selected'}>Minden csapat</option>${rows.map(r=>`<option value="${esc(r.sourceTeamId)}" ${selectedId===text(r.sourceTeamId)?'selected':''}>${esc(r.teamName)}</option>`).join('')}`;
    const scopeAllLabel=selected?'Minden meccse':'Minden bajnoki meccs',scopeBeacLabel=selected&&selectedId!==focusId?'Csak BEAC ellen':'Csak BEAC meccsek';
    const controls=`<div class="ms-match-filters"><label><span>Csapat</span><select id="msMatchTeamSelect">${teamOptions}</select></label><label><span>Mérkőzések</span><select id="msMatchScopeSelect"><option value="all" ${scope==='all'?'selected':''}>${esc(scopeAllLabel)}</option><option value="beac" ${scope==='beac'?'selected':''}>${esc(scopeBeacLabel)}</option></select></label></div>`;
    if(!matches.length)return`<section class="ms-panel ms-match-panel"><div class="ms-panel-head ms-match-panel-head"><div><b>${esc(title)}</b><span>0 meccs</span></div>${controls}</div><div class="ms-empty">Ebben a szűrésben még nincs elérhető meccsadat.</div></section>`;
    return`<section class="ms-panel ms-match-panel"><div class="ms-panel-head ms-match-panel-head"><div><b>${esc(title)}</b><span>${matches.length} meccs</span></div>${controls}</div><div class="ms-match-list">${matches.map(m=>{const h=msRowBySource_(m?.homeSourceTeamId),a=msRowBySource_(m?.awaySourceTeamId),hs=Number(m?.homeSets),as=Number(m?.awaySets),score=Number.isFinite(hs)&&Number.isFinite(as)?`${hs}–${as}`:'–',sourceUrl=text(m?.sourceUrl||m?.matchUrl||m?.reportUrl||m?.brszUrl||m?.mrszUrl);return`<div class="ms-match-row"><div class="ms-match-date"><b>${esc(msMatchDate_(m))}</b><span>${esc(msMatchTime_(m))}</span></div><button type="button" class="ms-match-team ${h?.focus?'is-own':''}" data-ms-team="${esc(text(h?.sourceTeamId))}">${msLogoHtml_(h?.sourceTeamId,m?.homeName,'match')}<span><b>${esc(m?.homeName||'–')}</b>${h?msTeamStatus_(h):''}</span></button>${sourceUrl&&score!=='–'?`<a class="ms-score ms-score-link" href="${esc(sourceUrl)}" target="_blank" rel="noopener" title="Mérkőzés / jegyzőkönyv megnyitása">${esc(score)}</a>`:`<strong class="ms-score">${esc(score)}</strong>`}<button type="button" class="ms-match-team away ${a?.focus?'is-own':''}" data-ms-team="${esc(text(a?.sourceTeamId))}"><span><b>${esc(m?.awayName||'–')}</b>${a?msTeamStatus_(a):''}</span>${msLogoHtml_(a?.sourceTeamId,m?.awayName,'match')}</button><div class="ms-match-place">${esc(m?.venue||'')}</div></div>`}).join('')}</div></section>`
  }
  function msLeagueStatsHtml_(rows){
    const entries=rows.map(row=>{const model=msStatsModel_(row),delta=msPositionDelta_(row?.history,row?.position,row?.played);return{row,model,delta,wins5:model.outcomes.filter(x=>x==='W').length}}),byForm=entries.filter(x=>x.model.outcomes.length>0).sort((a,b)=>b.wins5-a.wins5||(Number(a.row.position)||999)-(Number(b.row.position)||999)),bestForm=byForm[0],risers=entries.filter(x=>x.delta>0).sort((a,b)=>b.delta-a.delta),fallers=entries.filter(x=>x.delta<0).sort((a,b)=>a.delta-b.delta),bestRatio=entries.filter(x=>Number(x.row.played)>0&&(Number(x.row.setsFor)||0)+(Number(x.row.setsAgainst)||0)>0).sort((a,b)=>(Number(b.row.setRatio)||0)-(Number(a.row.setRatio)||0))[0];
    const card=(label,x,value)=>`<div><span>${esc(label)}</span><b>${esc(x?.row?.teamName||'–')}</b><small>${esc(x?(value||'–'):'Nincs adat')}</small></div>`;
    return`<section class="ms-panel ms-stats"><div class="ms-panel-head"><b>Statisztikák</b></div><div class="ms-league-summary">${card('Forma · legutóbbi 5',bestForm,bestForm?.model?.outcomes?.length?`${bestForm.wins5}/${bestForm.model.outcomes.length} győzelem`:'Még nincs eredmény')}${card('Helyezésváltozás (+)',risers[0],risers[0]?`↑${risers[0].delta} hely`:'–')}${card('Szettarány',bestRatio,bestRatio?msRatio_(bestRatio.row.setRatio,bestRatio.row.setsFor,bestRatio.row.setsAgainst):'–')}${card('Helyezésváltozás (−)',fallers[0],fallers[0]?`↓${Math.abs(fallers[0].delta)} hely`:'–')}</div><div class="ms-form-list"><div class="ms-insight-title"><b>Forma és helyezés</b></div>${entries.slice().sort((a,b)=>(Number(a.row.position)||999)-(Number(b.row.position)||999)).map(x=>`<button type="button" data-ms-team="${esc(x.row.sourceTeamId)}"><span class="ms-form-team-main">${msLogoHtml_(x.row.sourceTeamId,x.row.teamName,'league')}<span><b>${esc(x.row.teamName)}</b><small>${msPositionLabel_(x.row)} ${msTrendHtml_(x.delta)}</small></span></span><span class="ms-form-team-right">${msFormHtml_(x.model.outcomes)}<em>${x.model.matches.length?`${x.model.matches.filter(m=>msOutcome_(m,x.row.sourceTeamId)==='W').length}–${x.model.matches.filter(m=>msOutcome_(m,x.row.sourceTeamId)==='L').length}`:'–'}</em></span></button>`).join('')}</div></section>`
  }
  function msTeamStatsHtml_(row){
    const model=msStatsModel_(row),delta=msPositionDelta_(row?.history,row?.position,row?.played),pos=row?.position==null||row?.provisionalAlphabetical?NaN:Number(row.position),form=model.outcomes.length?model.outcomes.map(x=>`<b class="${x==='W'?'win':'loss'}">${x}</b>`).join(''):'<span>–</span>',streak=model.latest&&model.streak?`${model.streak}× ${model.latest}`:'–',strength=(label,key)=>`<div><span>${label}</span><b>${model.strength[key].w}–${model.strength[key].l}</b></div>`,official=Number(row?.played)||0,captured=model.matches.length;
    return`<section class="ms-panel ms-stats"><div class="ms-panel-head"><b>Statisztikák</b><span>${esc(row?.teamName||'Csapat')}</span></div><div class="ms-team-summary"><div><span>Helyezés</span><b>${Number.isFinite(pos)?`${pos}.`:'–'} ${msTrendHtml_(delta)}</b></div><div><span>Mérleg</span><b>${Number(row?.played)>0?`${num(row?.wins)}–${num(row?.losses)}`:model.matches.length?`${model.matches.filter(m=>msOutcome_(m,row?.sourceTeamId)==='W').length}–${model.matches.filter(m=>msOutcome_(m,row?.sourceTeamId)==='L').length}`:'–'}</b></div><div class="form"><span>Legutóbbi 5</span><div>${form}</div></div><div><span>Sorozat</span><b>${esc(streak)}</b></div></div><div class="ms-stats-grid"><div class="ms-stat-card chart"><div class="ms-insight-title"><b>Helyezés alakulása</b></div>${msChart_(row?.history,msData_()?.totalTeams)}</div><div class="ms-stat-card"><div class="ms-insight-title"><b>Hazai és idegenbeli mérleg</b></div><div class="ms-record"><div><span>Hazai</span><b>${model.home.w}–${model.home.l}</b></div><div><span>Idegen</span><b>${model.away.w}–${model.away.l}</b></div></div></div><div class="ms-stat-card"><div class="ms-insight-title"><b>Ellenfelek helyezése</b></div><div class="ms-record">${strength('Felső harmad','top')}${strength('Közép','mid')}${strength('Alsó harmad','bottom')}</div></div></div>${captured<official?`<div class="ms-coverage">Részleges BRSZ-adat: ${captured}/${official} lejátszott meccs érhető el ehhez a csapathoz.</div>`:''}</section>`
  }
  async function msEnsureInsights_(){
    const team=msContextTeam_(),key=text(team?.id);if(!configured()||!key)return;
    if(state.managerLeagueInsights.key===key&&(state.managerLeagueInsights.loading||state.managerLeagueInsights.loaded))return;
    state.managerLeagueInsights={key,loading:true,loaded:false,error:'',data:null};
    try{const d=await rpc('cc_manager_competition_league_insights_v1',{p_context_team_id:key});if(state.managerLeagueInsights.key!==key)return;state.managerLeagueInsights={key,loading:false,loaded:true,error:'',data:d||{}}}
    catch(err){if(state.managerLeagueInsights.key!==key)return;state.managerLeagueInsights={key,loading:false,loaded:true,error:text(err?.message||err||'A bajnoki statisztikák nem érhetők el.'),data:null}}
    if(state.area==='competition'&&state.module==='standings')renderManagerStandings_()
  }
  function msSetTeam_(sourceId){state.managerStandingsTeam=text(sourceId)||'all';try{localStorage.setItem('cc-manager-standings-team',state.managerStandingsTeam)}catch(_){}renderManagerStandings_()}
  function msBind_(){
    $('#msContextSelect')?.addEventListener('change',e=>{ccClearLeagueContext_();state.managerStandingsContext=text(e.target.value);state.managerStandingsTeam='all';state.managerStandingsMatchScope=state.managerStandingsContext==='10000000-0000-4000-8000-000000000003'&&ccMrszMenGroup_==='A'?'all':'beac';ccLeagueMatchScope_=state.managerStandingsMatchScope;state.managerLeagueInsights={key:'',loading:false,loaded:false,error:'',data:null};try{localStorage.setItem('cc-manager-standings-context',state.managerStandingsContext);localStorage.setItem('cc-manager-standings-team','all');localStorage.setItem('cc-manager-standings-match-scope',state.managerStandingsMatchScope)}catch(_){}renderManagerStandings_()});
    $('#ccLeagueContextSelect')?.addEventListener('change',e=>ccSetLeagueContext_(e.target.value));
    $('#msTeamSelect')?.addEventListener('change',e=>msSetTeam_(e.target.value));
    $('#msMatchTeamSelect')?.addEventListener('change',e=>msSetTeam_(e.target.value));
    $('#msMatchScopeSelect')?.addEventListener('change',e=>{state.managerStandingsMatchScope=e.target.value==='beac'?'beac':'all';try{localStorage.setItem('cc-manager-standings-match-scope',state.managerStandingsMatchScope)}catch(_){}renderManagerStandings_()});
    $$('[data-ms-team]').forEach(b=>b.addEventListener('click',()=>{const id=text(b.dataset.msTeam);if(id)msSetTeam_(id)}));
  }
  // Read-only metrics derived exclusively from the selected saved MRSZ table.
  // A partial table never supplies an official rank or unsupported form/trend.
  // Historical results are sourced only from explicitly scored MRSZ match snapshots.
  // Fixtures, inferred standings and incomplete/malformed scorelines are excluded.
  function ccSavedLeagueResults_(row,league,matches,leagueRows){
    const name=ccMrszNormPairName_(row?.teamName);
    if(!name||!league||!Array.isArray(matches)||!Array.isArray(leagueRows))return [];
    if(leagueRows.filter(r=>ccMrszNormPairName_(r?.teamName)===name).length!==1)return [];
    const byMatch=new Map();
    for(const m of matches){
      if(text(m?.competitionLabel)!==league)continue;
      const home=ccMrszNormPairName_(m?.homeName),away=ccMrszNormPairName_(m?.awayName);
      if(!home||!away||home===away||(home!==name&&away!==name))continue;
      // Both participating clubs must resolve to exactly one row in this league snapshot.
      if(leagueRows.filter(r=>ccMrszNormPairName_(r?.teamName)===home).length!==1
        ||leagueRows.filter(r=>ccMrszNormPairName_(r?.teamName)===away).length!==1)continue;
      if(m?.homeSets==null||m?.awaySets==null||text(m.homeSets)===''||text(m.awaySets)==='')continue;
      const hs=Number(m.homeSets),as=Number(m.awaySets);
      if(!Number.isInteger(hs)||!Number.isInteger(as)||Math.max(hs,as)!==3||Math.min(hs,as)<0||Math.min(hs,as)>2)continue;
      if(ccMrszSetScoreIssue_(m))continue;
      const stamp=text(m?.startsAt),time=Date.parse(stamp);
      if(!/^\d{4}-\d{2}-\d{2}T/.test(stamp)||!Number.isFinite(time)||time>Date.now())continue;
      const isHome=home===name,opponent=text(isHome?m.awayName:m.homeName);
      const localDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Budapest',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(time));
      const key=localDate+'|'+home+'|'+away;
      const result={stamp,time,opponent,venue:isHome?'Hazai':'Idegenbeli',
        score:(isHome?hs:as)+'–'+(isHome?as:hs),
        outcome:(isHome?hs>as:as>hs)?'Győzelem':'Vereség'};
      const previous=byMatch.get(key);
      // Conflicting saved outcomes for one fixture cannot be counted.
      if(previous&&previous.score!==result.score)byMatch.set(key,null);
      else if(!byMatch.has(key))byMatch.set(key,result);
    }
    return [...byMatch.values()].filter(Boolean).sort((a,b)=>b.time-a.time||a.opponent.localeCompare(b.opponent,'hu'));
  }
  function ccSavedLeagueResultsHtml_(results){
    if(!results.length)return '<div class="ms-recorded-empty">Ehhez a csapathoz nincs mentett mérkőzéseredmény.</div>';
    return '<div class="ms-recorded-results">'+results.slice(0,5).map(m=>{
      const date=new Intl.DateTimeFormat('hu-HU',{timeZone:'Europe/Budapest',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(m.time));
      return '<div class="ms-recorded-row"><time>'+esc(date)+'</time><span><b>'+esc(m.opponent)+'</b><small>'+esc(m.venue)+'</small></span>'
        +'<strong>'+esc(m.score)+'</strong><em>'+esc(m.outcome)+'</em></div>';
    }).join('')+'</div>';
  }
  // Saved standings: only explicit, valid numbers are shown as numbers.
  // Missing fields must not be converted to zero, and partial standings have no verified ranks.
  function ccMrszStatNumber_(value){
    if(value===null||value===undefined||String(value).trim()==='')return '–';
    const n=Number(value);
    return Number.isSafeInteger(n)&&n>=0?String(n):'–';
  }
  function ccMrszStatPosition_(position,snapshot=null){
    if(snapshot&&snapshot.partial!==false)return '–';
    const value=ccMrszStatNumber_(position);
    return value==='0'?'–':value;
  }
  function ccMrszStatPair_(a,b){
    const left=ccMrszStatNumber_(a),right=ccMrszStatNumber_(b);
    return left==='–'||right==='–'?'–':left+'–'+right;
  }
  function ccMrszStatRatio_(a,b){
    const left=ccMrszStatNumber_(a),right=ccMrszStatNumber_(b);
    if(left==='–'||right==='–')return '–';
    const x=Number(left),y=Number(right);
    if(y===0)return x>0?'∞':'–';
    return (x/y).toFixed(3);
  }
  // A volleyball match has one winner and one loser: M = GY + V.
  // Check only when all three stored counters are explicit valid integers;
  // never convert incomplete snapshots into a fabricated discrepancy.
  function ccMrszRecordIssue_(row){
    const played=ccMrszStatNumber_(row?.played),wins=ccMrszStatNumber_(row?.wins),losses=ccMrszStatNumber_(row?.losses);
    if(played==='–'||wins==='–'||losses==='–')return '';
    const total=Number(wins)+Number(losses);
    if(Number(played)===total)return '';
    return 'Lejátszott mérkőzés: '+played+'; győzelem + vereség: '+total+'. A mérleg ellenőrzést igényel.';
  }
  function ccMrszRecordNumber_(row,field){
    return ccMrszRecordIssue_(row)&&(field==='wins'||field==='losses')?'–':ccMrszStatNumber_(row?.[field]);
  }
  function ccMrszRecordPair_(row){
    return ccMrszRecordIssue_(row)?'–':ccMrszStatPair_(row?.wins,row?.losses);
  }
  function ccMrszRecordNoticeHtml_(row){
    const reason=ccMrszRecordIssue_(row);
    return reason?'<small class="ms-stat-warning" title="'+esc(reason)+'">Ellenőrzendő · M ≠ GY + V</small>':'';
  }
  // One source/coverage vocabulary for archived MRSZ standings in every Manager view.
  // "Complete" describes the saved table snapshot, not a live or complete results feed.
  function ccMrszCoverageLabel_(snapshot){
    const status=!snapshot?'Nincs mentett tabella'
      :snapshot.partial===true?'Részleges, rögzített eredmények'
      :snapshot.partial===false?'Mentett MRSZ-tabella (teljes)'
      :'Mentett MRSZ-tabella (teljesség nincs jelölve)';
    return 'MRSZ · '+status+' · Pillanatkép: 2026.10.14. · Nem élő adat';
  }
  function ccMrszShortCoverageLabel_(snapshot){
    return snapshot?'Frissítve: 2026.10.14.':'Nincs frissítési adat';
  }
  // Saved scores are an incomplete source until independently proven otherwise.
  // Compare only when the count equals the played count in a complete saved table.
  // Equal counts alone must never be described as proof of exhaustive match coverage.
  function ccMrszSavedResultsCrosscheckHtml_(row,snapshot,recorded){
    if(snapshot?.partial!==false||!Array.isArray(recorded))return '';
    const played=ccMrszStatNumber_(row?.played);
    if(played==='–')return '';
    const count=recorded.length,limit=Number(played);
    if(count===0&&limit===0)return '';
    const prefix='Mentett eredmények: '+count+'/'+played+' mérkőzés';
    if(count!==limit)return '<p class="ms-recorded-audit">'+esc(prefix+'. A lista darabszáma eltér a tabellától; a mérlegek nem vethetők össze.')+'</p>';
    let setsFor=0,setsAgainst=0,wins=0,losses=0;
    for(const m of recorded){
      const pair=/^(\d+)–(\d+)$/.exec(text(m?.score));
      if(!pair)return '<p class="ms-recorded-audit">'+esc(prefix+'. Egy eredmény nem értelmezhető; nincs számszaki összevetés.')+'</p>';
      const own=Number(pair[1]),other=Number(pair[2]);
      if(!((own===3&&other>=0&&other<=2)||(other===3&&own>=0&&own<=2)))
        return '<p class="ms-recorded-audit">'+esc(prefix+'. Érvénytelen játszmaeredmény; nincs számszaki összevetés.')+'</p>';
      setsFor+=own;setsAgainst+=other;if(own>other)wins++;else losses++;
    }
    const actualSets=setsFor+'–'+setsAgainst,actualRecord=wins+'–'+losses;
    const tableSets=ccMrszStatPair_(row?.setsFor,row?.setsAgainst);
    const tableRecord=ccMrszRecordPair_(row);
    const issues=[];
    if(tableSets!=='–'&&tableSets!==actualSets)issues.push('szettmérleg: tabella '+tableSets+', mentett eredmények '+actualSets);
    if(tableRecord!=='–'&&tableRecord!==actualRecord)issues.push('mérleg: tabella '+tableRecord+', mentett eredmények '+actualRecord);
    const caution=' Az egyező darabszám önmagában nem igazolja a lista teljességét.';
    if(issues.length)return '<p class="ms-recorded-audit is-review">'+esc('Ellenőrzendő · '+prefix+'. '+issues.join('; ')+'.'+caution)+'</p>';
    if(tableSets==='–'&&tableRecord==='–')
      return '<p class="ms-recorded-audit">'+esc(prefix+'. A tabellában nincs összevethető szettmérleg vagy mérleg.'+caution)+'</p>';
    return '<p class="ms-recorded-audit">'+esc(prefix+'. Az összevethető számszaki adatok egyeznek.'+caution)+'</p>';
  }
  function ccVerifiedSnapshotStatsHtml_(rows,selected,snapshot,league='',matches=[]){
    if(!snapshot||!Array.isArray(rows)||!rows.length)return '';
    const focus=rows.filter(r=>r.focus),selectedId=text(selected?.sourceTeamId),selectedRows=selectedId?rows.filter(r=>text(r.sourceTeamId)===selectedId):[],row=selected?(selectedRows.length===1?selectedRows[0]:null):(focus.length===1?focus[0]:null);
    if(!row)return '';
    const valid=x=>x!==null&&x!==undefined&&text(x)!==''&&Number.isInteger(Number(x))&&Number(x)>=0;
    const number=x=>valid(x)?String(Number(x)):'–';
    const played=number(row.played);
    const record=ccMrszRecordPair_(row);
    const sets=valid(row.setsFor)&&valid(row.setsAgainst)?number(row.setsFor)+'–'+number(row.setsAgainst):'–';
    const ratio=valid(row.setsFor)&&valid(row.setsAgainst)
      ?msRatio_(null,row.setsFor,row.setsAgainst):'–';
    const scope=ccMrszCoverageLabel_(snapshot);
    const cells=[['Mérkőzések',played],['Mérleg',record],['Szettmérleg',sets],['Szettarány',ratio]];
    const recorded=ccSavedLeagueResults_(row,league,matches,rows);
    return '<section class="ms-panel ms-stats ms-verified-snapshot-stats" aria-label="Bajnoki csapatstatisztika">'
      +'<div class="ms-panel-head"><b>Statisztikák</b><span>'+esc(row.teamName||'Csapat')+'</span></div>'+ccMrszRecordNoticeHtml_(row)
      +'<div class="ms-team-summary">'+cells.map(([label,value])=>'<div><span>'+esc(label)+'</span><b>'+esc(value)+'</b></div>').join('')+'</div>'
      +'<div class="ms-recorded-section"><div class="ms-insight-title"><b>Rögzített eredmények ('+recorded.length+')</b></div>'+ccSavedLeagueResultsHtml_(recorded)+ccMrszSavedResultsCrosscheckHtml_(row,snapshot,recorded)+'</div>'
       +'<p class="ms-coverage">'+esc(scope)+' · Az adatok külön frissítést igényelnek. A rögzített eredmények listája nem feltétlenül teljes. Forma és helyezésváltozás csak ellenőrzött teljes mérkőzés- és előzményadatok alapján számítható.</p>'
      +'</section>';
  }
  function ccManagerCanonicalPartialRows_(league){
    return (ccMrszPhotoState_.canonicalTeamStats||[]).filter(r=>text(r.competitionLabel)===league)
      .map(r=>({...r,sourceTeamId:'canonical:'+text(r.teamKey),focus:ccIsBeacLeagueTeam_(r.teamName),_ccUnranked:true}));
  }
  function ccManagerCanonicalStatsHtml_(rows,selected,coverage){
    const row=selected||rows.find(r=>r.focus);
    const label=coverage
      ?text(coverage.played)+' / '+text(coverage.total)+' hivatalos eredményű mérkőzés'
      :'Hivatalos eredményekből számított részleges adatok';
    const intro='<p class="ms-coverage">Részleges eredménystatisztika · '+esc(label)
      +'. Helyezés és bajnoki pont csak hiteles teljes tabellából jelenhet meg.</p>';
    if(!row)return '<section class="ms-panel ms-stats"><div class="ms-panel-head"><b>Statisztikák</b><span>Nem hivatalos tabella</span></div>'+intro+'</section>';
    const recorded=[['Mérkőzések',row.played],['Mérleg',text(row.wins)+'–'+text(row.losses)],
      ['Szettmérleg',text(row.setsFor)+'–'+text(row.setsAgainst)],
      ['Labdapontok',row.pointsFor!=null&&row.pointsAgainst!=null?text(row.pointsFor)+'–'+text(row.pointsAgainst):'–']];
    return '<section class="ms-panel ms-stats"><div class="ms-panel-head"><b>Statisztikák · rögzített eredmények</b><span>'+esc(row.teamName)+'</span></div>'
      +'<div class="ms-team-summary">'+recorded.map(([key,val])=>'<div><span>'+esc(key)+'</span><b>'+esc(val)+'</b></div>').join('')+'</div>'+intro+'</section>';
  }
  function renderManagerStandings_(){if(!ccRouteIs_('competition','standings'))return;
    const team=msContextTeam_(),contextOptions=msContextCandidates_(),standingsFiltersOpen=filterOpen_('competition.standings',true);
    if(!team){$('#viewContent').innerHTML=`<div class="page-intro cc-page-header-panel"><div><h2>Tabella</h2><p>Bajnoki tabellák, mérkőzések és statisztikák.</p></div></div><article class="panel"><div class="ms-empty">Nincs aktív versenycsapat.</div></article>`;return}
    const men=text(team.id)==='10000000-0000-4000-8000-000000000003';
    const women2=text(team.id)==='10000000-0000-4000-8000-000000000002';
    const women1=text(team.id)==='10000000-0000-4000-8000-000000000001';
    const defaultGroup=men?(ccMrszMenGroup_==='A'?'Férfi Budapest I. osztály – A csoport':'Férfi Budapest I. osztály – B csoport')
      :women2?'Női Budapest II. osztály – B csoport':'Női Budapest I. osztály';
    const group=ccCurrentLeague_(defaultGroup),externalSelection=group!==defaultGroup;
    if(!ccMrszPhotoState_.loaded&&!ccMrszPhotoState_.loading)void ccLoadMrszPhotoSnapshot_();
    const photo=ccMrszPhotoState_.loaded?ccMrszPhotoState_.tables.find(t=>text(t.competitionLabel)===group):null;
    const canonicalRows=ccManagerCanonicalPartialRows_(group);
    const canonicalCoverage=(ccMrszPhotoState_.canonicalCoverage||[]).find(r=>text(r.competitionLabel)===group);
    const canonicalPartial=canonicalRows.length>0;
    const showPhoto=!!photo||canonicalPartial;
    const li=state.managerLeagueInsights;
    if(li.key!==text(team.id)||(!li.loaded&&!li.loading))msEnsureInsights_();
    const loading=!externalSelection&&!showPhoto&&(li.key!==text(team.id)||li.loading||(!li.loaded&&!li.error));
    const d=li.key===text(team.id)?li.data:null;
    const rawRows=canonicalPartial?canonicalRows:showPhoto?ccStandingsPhotoTeamRows_(photo):externalSelection?[]:
      (d?msRows_():standingsForContext_(team.id));
    const hasRealRank=rawRows.some(r=>Number(r.position)>0&&
      (Number(r.played)>0||Number(r.tablePoints)>0));
    const rows=canonicalPartial||showPhoto||hasRealRank?rawRows:
      rawRows.map(r=>({...r,position:null,played:null,wins:null,losses:null,
        tablePoints:null,setsFor:null,setsAgainst:null,pointsFor:null,pointsAgainst:null,
        _ccUnranked:true}));
    // The standings page has only a league picker; never apply a stale hidden
    // per-team selection to hide rows from the full competition table.
    const selected=msSelectedRow_(rows);
    const displayRows=rows;
    const meta=canonicalPartial?'Részleges eredményadatok · '+text(canonicalCoverage?.played||0)+'/'+text(canonicalCoverage?.total||0)+' meccs · Nem hivatalos tabella':showPhoto?[group,'Frissítve: 2026.10.14.'].join(' · '):externalSelection?group:!hasRealRank&&rows.length?'Mentett csapatlista · nincs hiteles tabellaállás':(d?[d.competitionLabel,d.source].filter(Boolean).join(' · '):'');
    const updated=showPhoto?null:rows.map(r=>safeDate(r?.updatedAt)).filter(Boolean).sort((a,b)=>b-a)[0];
    $('#viewContent').innerHTML=`<div class="page-intro ms-page-intro cc-page-header-panel"><div><h2>Tabella</h2><p>Bajnoki adatok · mérkőzések · statisztikák.</p></div><div class="page-actions cc-icon-toolbar"><button class="matrix-filter-toggle icon-only cc-toolbar-icon ${standingsFiltersOpen?'open':''}" id="standingsFiltersToggle" aria-expanded="${standingsFiltersOpen?'true':'false'}" type="button" aria-label="Szűrők" title="Szűrők"><span class="triangle-icon"></span></button></div></div><div class="filter-panel ms-context-filter-panel" id="standingsFiltersPanel" ${standingsFiltersOpen?'':'hidden'}><div class="ms-context-controls">${ccLeagueContextSelectHtml_(group)}</div></div>${loading?`<article class="panel"><div class="ms-empty"><b>Tabella betöltése…</b><span>A bajnoki adatok és statisztikák frissítése folyamatban van.</span></div></article>`:(!externalSelection&&!showPhoto&&li.error)?`<article class="panel"><div class="ms-empty error"><b>A tabella most nem érhető el</b><span>${esc(li.error)}</span></div></article>`:!rows.length?`<article class="panel"><div class="ms-empty"><b>Még nincs tabellaadat</b><span>Jelenleg nincs megjeleníthető tabella. ${esc(ccMrszCoverageLabel_(null))}</span></div></article>`:`<article class="panel ms-standings-card"><div class="ms-title"><div><h3>${esc(showPhoto?group:team.name)}</h3><p>${esc(meta||'Bajnoki tabella')}${updated?` · Frissítve: ${esc(fmtDate(updated))} ${esc(fmtTime(updated))}`:''}</p></div></div><div class="ms-table-scroll"><table class="ms-table"><thead><tr><th title="Listasorszám, nem hivatalos helyezés">Sor</th><th class="team">Csapat</th><th>M</th><th>GY</th><th>V</th><th class="group-end">P</th><th>SZ</th><th>SZA</th><th>P</th><th>PA</th></tr></thead><tbody>${displayRows.map((r,i)=>`<tr class="${r.focus?'focus':''}"><td title="${esc(ccMrszStatPosition_(r.position,showPhoto?photo:null)==='–'?'Listasorszám, nem helyezés':'Hivatalos helyezés')}"><b>${esc(canonicalPartial?'–':ccMrszStatPosition_(r.position,showPhoto?photo:null)==='–'?String(i+1):ccMrszStatPosition_(r.position,showPhoto?photo:null))}</b></td><td class="team"><button type="button" data-ms-team="${esc(r.sourceTeamId)}">${msLogoHtml_(r.sourceTeamId,r.teamName)}<strong>${esc(r.teamName)}</strong>${ccMrszRecordNoticeHtml_(r)}</button></td><td>${ccMrszStatNumber_(r.played)}</td><td>${ccMrszRecordNumber_(r,'wins')}</td><td>${ccMrszRecordNumber_(r,'losses')}</td><td class="group-end"><b>${ccMrszStatNumber_(r.tablePoints)}</b></td><td>${esc(ccMrszStatPair_(r.setsFor,r.setsAgainst))}</td><td >${esc(showPhoto?ccMrszStatRatio_(r.setsFor,r.setsAgainst):msRatio_(r.setRatio,r.setsFor,r.setsAgainst))}</td><td>${esc(ccMrszStatPair_(r.pointsFor,r.pointsAgainst))}</td><td >${esc(showPhoto?ccMrszStatRatio_(r.pointsFor,r.pointsAgainst):msRatio_(r.pointRatio,r.pointsFor,r.pointsAgainst))}</td></tr>`).join('')}</tbody></table></div></article>${showPhoto?'':msMatchesHtml_(rows,selected)}${canonicalPartial?ccManagerCanonicalStatsHtml_(rows,selected,canonicalCoverage):showPhoto?ccVerifiedSnapshotStatsHtml_(rows,selected,photo,group,ccMrszMergedLeagueMatches_(group)):selected?msTeamStatsHtml_(selected):msLeagueStatsHtml_(rows)}`}`;
    const standingsToggle=$('#standingsFiltersToggle'),standingsPanel=$('#standingsFiltersPanel');standingsToggle?.addEventListener('click',()=>{const open=setFilterOpen_('competition.standings',standingsPanel?.hidden!==true?false:true);standingsToggle.classList.toggle('open',open);standingsToggle.setAttribute('aria-expanded',String(open));if(standingsPanel)standingsPanel.hidden=!open;ccBlurPointerControl_(standingsToggle)});
    // Keep the original ms-standings-card as the single table. Put the match list directly beneath.
    const main=$('#viewContent .ms-standings-card');
    if(ccMrszPhotoState_.loaded){
      const filterRow=selected;
      const matches=ccMrszLeagueFixturePanelHtml_(group,!externalSelection&&Array.isArray(msData_()?.matches)&&ccMrszMenGroup_!=='A'?msData_().matches:[],{
        forceAll:true,teamName:filterRow?.teamName||'',teamId:filterRow?.sourceTeamId||'',sort:ccStandingsMatchSort_
      });
      const sortControls='<div class="ms-context-controls cc-match-order-controls"><label class="field compact"><span>Mérkőzések sorrendje</span><select id="ccStandingsMatchOrder"><option value="oldest" '+(ccStandingsMatchSort_==='oldest'?'selected':'')+'>Időrend · legrégebbi elöl</option><option value="newest" '+(ccStandingsMatchSort_==='newest'?'selected':'')+'>Időrend · legújabb elöl</option><option value="team" '+(ccStandingsMatchSort_==='team'?'selected':'')+'>Hazai csapat szerint</option></select></label></div>';
      const existing=$('#viewContent .ms-match-panel');
      if(existing)existing.outerHTML=sortControls+matches;
      else if(main)main.insertAdjacentHTML('afterend',sortControls+matches);
      else $('#viewContent').insertAdjacentHTML('beforeend',sortControls+matches);
      $('#ccStandingsMatchOrder')?.addEventListener('change',e=>{ccStandingsMatchSort_=e.target.value;renderManagerStandings_()});
    }
    document.querySelectorAll('.cc-postponed-filter').forEach(el=>el.addEventListener('change',e=>{ccLeaguePostponedFilter_=e.target.value;renderManagerStandings_()}));
    msBind_();
    ccBindMrszProtocol_();
    ccBindMrszMenGroup_();
    document.querySelectorAll('[data-league-match-scope]').forEach(button=>button.addEventListener('click',()=>{
      ccLeagueMatchScope_=button.dataset.leagueMatchScope==='all'?'all':'beac';renderManagerStandings_();
    }));
  }

  function eventPlace(e){return text(e.court)||text(e.venue)||'–'}
  function ccDisplayEventTitle_(e){return eventType(e)==='training'?'Edzés':(e.title||'Meccs')}
  function ccDisplayEventPlace_(e){return eventType(e)==='training'?(text(e.court)||'–'):eventPlace(e)}
  function eventRichRow(e){const s=eventStart(e),kind=eventType(e)==='match'?'MECCS':'EDZÉS';return `<button class="event-rich-row ${isEventPast(e)?'past':''}" type="button" data-event-id="${esc(e.eventId||e.id)}"><span class="event-accent" style="background:${esc(e.color||teamById(eventTeamId(e))?.color||'#f7b700')}"></span><div class="event-date"><b>${esc(s?fmtDate(s):'–')}</b><span>${esc(s?fmtTime(s):'–')}</span></div><div class="event-main"><strong>${esc(ccDisplayEventTitle_(e))}</strong><small>${esc(e.teamName||e.team_name||'')} · ${esc(ccDisplayEventPlace_(e))}</small></div><span class="event-kind">${kind}</span>${rsvpPills(e)}</button>`}
  function detailPair(label,value,cls=''){return `<div class="detail-pair ${cls}"><small>${esc(label)}</small><b>${esc(value==null||value===''?'–':value)}</b></div>`}
  function findEventById(id){const e=[...state.activityEvents,...state.calendarEvents,...(state.rsvpMatrix.events||[])].find(e=>text(e.eventId||e.id)===text(id))||null;if(!e)return null;if(e.yesCount!=null&&e.noCount!=null&&e.unknownCount!=null)return e;const statuses=(state.rsvpMatrix.responses||[]).filter(r=>text(r.eventId)===text(id)).map(r=>text(r.status));return {...e,yesCount:statuses.filter(x=>x==='going').length,noCount:statuses.filter(x=>x==='not_going').length,unknownCount:statuses.filter(x=>x!=='going'&&x!=='not_going').length}}
  function ccDateInputValue_(value){const d=safeDate(value);if(!d)return'';return localDateKey(d)}
  function ccTimeInputValue_(value){const d=safeDate(value);if(!d)return'';return new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:'Europe/Budapest'}).format(d)}
  function ccLocalIso_(dateValue,timeValue){return ccBudapestLocalIso_(dateValue,ccNormalizeTime24_(timeValue))}
  function ccCloseEntityDialog_(){const d=$('#entityDialog');if(d?.open)d.close()}
  async function ccReloadCompetitionAfterWrite_(){const routeSnapshot=ccRouteSnapshot_();state.eventRosterCache.clear();await Promise.all([loadTeams(),loadPlayers(),loadManagerMedicalAppointments().catch(()=>{}),loadActivityEvents(),loadRsvpMatrix(),loadCardRsvpMatrix().catch(()=>{}),loadCoachAvailability().catch(()=>{}),loadCalendar()]);if(ccRouteSnapshotCurrent_(routeSnapshot))renderModule()}
  function ccEventCanEdit_(e){return canAction(eventType(e)==='match'?'competition.matches':'competition.trainings','edit',eventTeamId(e))}
  function ccEventFormTeamOptions_(value,kind='training'){const module=kind==='match'?'competition.matches':'competition.trainings';return state.teams.filter(t=>(t.active!==false||text(t.id)===text(value))&&canAction(module,'edit',t.id)).map(t=>`<option value="${esc(t.id)}" ${text(value)===text(t.id)?'selected':''}>${esc(t.name)}</option>`).join('')}
  const CC_HOME_MATCH_DEFAULTS_=Object.freeze({
    '10000000-0000-4000-8000-000000000001':{court:'3',venue:'BEAC csarnok',address:'1117 Budapest, Bogdánfy u. 10/B.'},
    '10000000-0000-4000-8000-000000000002':{court:'2',venue:'BEAC csarnok',address:'1117 Budapest, Bogdánfy u. 10/B.'},
    '10000000-0000-4000-8000-000000000003':{court:'3',venue:'BEAC csarnok',address:'1117 Budapest, Bogdánfy u. 10/B.'}
  });
  // The Manager always uses 24-hour HH:MM input, regardless of browser language or OS locale.
  function ccNormalizeTime24_(value){const raw=text(value).replace('.',':');const v=/^\d{4}$/.test(raw)?raw.slice(0,2)+':'+raw.slice(2):raw;const m=v.match(/^(\d{1,2}):(\d{2})$/);if(!m)return'';const h=Number(m[1]),min=Number(m[2]);if(h<0||h>23||min<0||min>59)return'';return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`}
  function ccTimeField_(id,label,value,{required=false,wrapId='',cls=''}={}){return `<label class="field cc-native-time-field ${cls}" ${wrapId?`id="${esc(wrapId)}"`:''}><span>${esc(label)} · 24 óra</span><input id="${esc(id)}" class="cc-time24-input" type="text" inputmode="text" pattern="(?:[01][0-9]|2[0-3]):[0-5][0-9]" maxlength="5" placeholder="HH:MM" title="24 órás időformátum (pl. 19:30)" autocomplete="off" value="${esc(ccNormalizeTime24_(value)||'')}" ${required?'required':''}></label>`}
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
    const d=text(dateValue),t=ccNormalizeTime24_(timeValue);if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!/^\d{2}:\d{2}$/.test(t))return null;
    const [y,m,day]=d.split('-').map(Number),[hh,mm]=t.split(':').map(Number);
    const validDate=new Date(Date.UTC(y,m-1,day));
    if(validDate.getUTCFullYear()!==y||validDate.getUTCMonth()+1!==m||validDate.getUTCDate()!==day)return null;
    const targetUtc=Date.UTC(y,m-1,day,hh,mm,0);
    let guess=targetUtc;
    const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Budapest',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
    for(let i=0;i<3;i++){
      const parts=Object.fromEntries(fmt.formatToParts(new Date(guess)).map(x=>[x.type,x.value]));
      const renderedUtc=Date.UTC(Number(parts.year),Number(parts.month)-1,Number(parts.day),Number(parts.hour),Number(parts.minute),Number(parts.second));
      guess=targetUtc-(renderedUtc-guess);
    }
    const exact=Object.fromEntries(fmt.formatToParts(new Date(guess)).map(x=>[x.type,x.value]));
    if(Number(exact.year)!==y||Number(exact.month)!==m||Number(exact.day)!==day||Number(exact.hour)!==hh||Number(exact.minute)!==mm)return null;
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
        if(!start||!startsAt)throw new Error('Válassz érvényes dátumot és kezdési időpontot.');
        if(actualKind==='match'&&matchKind==='friendly'&&!end)throw new Error('Edzőmeccsnél válaszd ki a befejezési időpontot is.');
        if(rawEnd&&!end)throw new Error('Válassz érvényes befejezési időpontot.');
        const endForSave=(actualKind==='match'&&matchKind==='official')?'':end,endsAt=endForSave?ccLocalIso_(date,endForSave):null;
        if(endsAt&&new Date(endsAt)<=new Date(startsAt))throw new Error('A befejezésnek később kell lennie a kezdésnél.');
        const base={eventType:actualKind,teamId:$('#ceTeam').value,title:text($('#ceTitle').value),startsAt,endsAt,venue:text($('#ceVenue').value),address:text($('#ceAddress').value),court:text($('#ceCourt').value),color:teamById($('#ceTeam').value)?.color||e?.color||null};
        if(actualKind==='match'){
          base.homeAway=text($('#ceHomeAway').value);
          if(base.homeAway==='home')ccApplyHomeMatchDefaults_({force:false});
          base.venue=text($('#ceVenue').value);base.address=text($('#ceAddress').value);base.court=text($('#ceCourt').value);
          const mtRaw=text($('#ceMeetingTime').value),mt=mtRaw?ccNormalizeTime24_(mtRaw):'';if(mtRaw&&!mt)throw new Error('Válassz érvényes találkozási időpontot.');
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
  async function ccCompetitionAttendanceRpc_(eventId,playerId,statusValue){
    const dbStatus=statusValue==='clear'||statusValue==='none'||statusValue==='unknown'||statusValue===''?null:statusValue;
    try{return await rpc('cc_manager_competition_attendance_v2',{p_event_id:text(eventId),p_player_id:text(playerId),p_status:dbStatus})}
    catch(err){if(!/cc_manager_competition_attendance_v2|does not exist|schema cache/i.test(text(err?.message||err)))throw err;return await rpc('cc_manager_competition_attendance_v1',{p_event_id:text(eventId),p_player_id:text(playerId),p_status:dbStatus??'clear'})}
  }
  function ccPatchAttendanceCaches_(eventId,playerId,statusValue){
    const event=text(eventId),player=text(playerId),saved=text(statusValue);
    const cached=state.eventRosterCache.get(event);if(Array.isArray(cached)){const row=cached.find(r=>text(r.playerId||r.player_id)===player);if(row){row.attendanceStatus=saved;row.attendance_status=saved}}
    ;[state.rsvpMatrix,state.cardRsvpMatrix].forEach(matrix=>{const rows=matrix?.responses||[];let row=rows.find(r=>text(r.eventId||r.event_id)===event&&text(r.playerId||r.player_id)===player);if(!row){row={eventId:event,playerId:player,status:'unknown'};rows.push(row)}row.attendanceStatus=saved;row.attendance_status=saved});
  }
  async function ccRosterAttendanceWrite_(eventId,playerId,statusValue,slider=null){
    if(slider){slider.dataset.sliderDisabled='1';slider.setAttribute('aria-busy','true')}
    try{
      const result=await ccCompetitionAttendanceRpc_(eventId,playerId,statusValue),expected=statusValue==='clear'||statusValue==='none'||statusValue==='unknown'||statusValue===''?'':statusValue,saved=text(result?.attendanceStatus??result?.status??'');
      if(saved!==expected)throw new Error('A jelenlét mentése nem igazolható vissza.');
      ccPatchAttendanceCaches_(eventId,playerId,saved);status('Jelenlét mentve.','success');return result
    }catch(err){status(err.message||'A jelenlét mentése sikertelen.','error');throw err}
    finally{if(slider){delete slider.dataset.sliderDisabled;slider.removeAttribute('aria-busy')}}
  }
  function ccCompetitionRsvpModel_(status){const s=text(status);if(s==='going')return {key:'going',value:0,label:'Jövök',db:'going'};if(s==='not_going')return {key:'not-going',value:2,label:'Nem jövök',db:'not_going'};return {key:'none',value:1,label:'Nincs jelzés',db:'unknown'}}
  function ccCompetitionRsvpByValue_(value){const n=Number(value);if(n<=0)return {key:'going',value:0,label:'Jövök',db:'going'};if(n>=2)return {key:'not-going',value:2,label:'Nem jövök',db:'not_going'};return {key:'none',value:1,label:'Nincs jelzés',db:'unknown'}}
  function ccCompetitionRsvpSlider_(p,editable){const model=ccCompetitionRsvpModel_(p?.status),stateClass=model.db==='going'?'yes':model.db==='not_going'?'no':'none';return `<div class="attendance-slider planner-slider cc-player-grid-slider ${stateClass}" data-manager-slider data-manager-slider-kind="competition" data-roster-rsvp="${esc(p?.playerId)}" data-slider-state="${stateClass}" aria-label="${esc(p?.displayName||p?.name||'Játékos')} részvételi jelzése: ${esc(model.label)}" ${editable?'':'data-slider-disabled="1"'}><button class="slider-zone left" type="button" data-slider-action="yes" ${editable?'':'disabled'}>✓</button><button class="slider-zone center" type="button" data-slider-action="none" ${editable?'':'disabled'}>–</button><button class="slider-zone right" type="button" data-slider-action="no" ${editable?'':'disabled'}>✕</button><span class="slider-thumb"></span></div>`}

  // RSVP is a visual default, never a persisted presence marking.
  function ccRosterPreviewState_(p){
    const actual=text(p?.attendanceStatus??p?.attendance_status);
    if(actual==='present')return {state:'yes',confirmed:true};
    if(actual==='absent')return {state:'no',confirmed:true};
    const rsvp=text(p?.status);
    return {state:rsvp==='going'?'yes':rsvp==='not_going'?'no':'none',confirmed:false};
  }
  function ccCompetitionAttendanceSlider_(p,editable){
    const preview=ccRosterPreviewState_(p),name=text(p?.displayName||p?.name||'Játékos');
    return `<div class="attendance-slider planner-slider cc-player-grid-slider cc-competition-attendance-slider ${preview.state}" data-manager-slider data-manager-slider-kind="attendance" data-roster-att-slider="${esc(p?.playerId)}" data-slider-state="${preview.state}" data-slider-rsvp="${text(p?.status)==='going'?'yes':text(p?.status)==='not_going'?'no':'none'}" data-slider-unconfirmed="${preview.confirmed?'0':'1'}" aria-label="${esc(name)}: ${preview.confirmed?'rögzített jelenlét':'RSVP-alapú előnézet, jelenlét még nincs rögzítve'}" ${editable?'':'data-slider-disabled="1"'}><button class="slider-zone left" type="button" data-slider-action="yes" ${editable?'':'disabled'}>✓</button><button class="slider-zone center" type="button" data-slider-action="none" ${editable?'':'disabled'}>–</button><button class="slider-zone right" type="button" data-slider-action="no" ${editable?'':'disabled'}>✕</button><span class="slider-thumb"></span></div>`;
  }

  function ccCompactRosterRowHtml_(raw,eventId,editable,attendanceEditable){
    const p=enrichPlayer_(raw),tone=ccTrainingRsvpTone_(p.status),m=medicalState_(p.medicalValidUntil);
    const jersey=p.jerseyNo??p.jersey_no,name=text(p.displayName||p.name||'Játékos'),preview=ccRosterPreviewState_(p);
    return `<div class="cc-compact-roster-row ${tone} ${preview.confirmed?'is-confirmed':'is-rsvp-only'}">
      <span class="cc-compact-roster-person">
        <span class="cc-compact-roster-avatar">${avatarHtml(p,'table')}</span>
        <span class="cc-compact-roster-jersey">${jersey===null||jersey===undefined||text(jersey)===''?'–':esc(jersey)}</span>
        <span class="cc-compact-roster-identity"><strong>${esc(name)}</strong><small>${esc(p.position||'Poszt nélkül')}</small>${tone==='not-going'&&text(p.note)?`<span class="cc-detail-decline-note">${esc(p.note)}</span>`:''}</span>
      </span>
      <span class="cc-compact-roster-presence"><small class="cc-compact-roster-source">${preview.confirmed?'Rögzítve':'RSVP alapján'}</small>${ccCompetitionAttendanceSlider_(p,attendanceEditable)}</span>
      <span class="cc-compact-roster-actions">
        <span class="cc-compact-roster-medical ${esc(m.cls)}" title="Sportorvosi: ${esc(p.medicalValidUntil?fmtDate(p.medicalValidUntil):'nincs adat')}">${esc(m.label)}</span>
        <button type="button" class="cc-compact-roster-open" data-roster-profile-open="${esc(p.playerId||p.id)}" aria-label="${esc(name)} játékosprofilja" title="Játékosprofil megnyitása"><span class="triangle-icon" aria-hidden="true"></span></button>
      </span>
    </div>`;
  }
  function ccEventRosterCardHtml_(raw,eventId,editable,attendanceEditable){
    return ccCompactRosterRowHtml_(raw,eventId,editable,attendanceEditable);
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
    slider.addEventListener('click',e=>{if(disabled())return;if(suppressClick){suppressClick=false;e.preventDefault();e.stopPropagation();return}const b=e.target.closest('[data-slider-action]');if(!b)return;e.preventDefault();e.stopPropagation();const cur=currentState(),req=b.dataset.sliderAction;const ci=idx(cur),ri=idx(req),next=ci===ri?cur:states[ci+Math.sign(ri-ci)];if(next!==cur||slider.dataset.sliderUnconfirmed==='1')snap(next,true,true)});
    slider.addEventListener('pointerdown',e=>{if(disabled()||e.button!==0)return;const g=geometry();active=true;locked=false;pointerId=e.pointerId;startX=e.clientX;startY=e.clientY;startLeft=stateLeft(currentState(),g);currentLeft=startLeft;lastX=e.clientX;lastT=performance.now();velocityX=0;setLeft(startLeft);slider.setPointerCapture?.(e.pointerId)});
    slider.addEventListener('pointermove',e=>{if(!active||e.pointerId!==pointerId)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(!locked){if(Math.hypot(dx,dy)<7)return;if(Math.abs(dy)>Math.abs(dx)){active=false;slider.style.removeProperty('--cc-slider-left');try{slider.releasePointerCapture?.(e.pointerId)}catch(_){ }return}locked=true;slider.classList.add('cc-slider-dragging')}const g=geometry(),next=Math.min(g.max,Math.max(g.min,startLeft+dx)),now=performance.now(),dt=Math.max(1,now-lastT);velocityX=(e.clientX-lastX)/dt;lastX=e.clientX;lastT=now;setLeft(next);e.preventDefault()},{passive:false});
    slider.addEventListener('pointerup',e=>{if(!active||e.pointerId!==pointerId)return;try{slider.releasePointerCapture?.(e.pointerId)}catch(_){ }const wasLocked=locked,g=geometry(),start=currentState(),direct=stateFromLeft(currentLeft,g),projected=stateFromLeft(Math.min(g.max,Math.max(g.min,currentLeft+velocityX*120)),g);let next=start;if(wasLocked){const dd=idx(direct)-idx(start);if(Math.abs(dd)>=2)next=direct;else{const pd=idx(projected)-idx(start);next=Math.abs(pd)>1?states[idx(start)+Math.sign(pd)]:projected}}active=false;locked=false;pointerId=null;slider.classList.remove('cc-slider-dragging');if(wasLocked){suppressClick=true;setTimeout(()=>suppressClick=false,320);snap(next,true,false)}else slider.style.removeProperty('--cc-slider-left')});
    slider.addEventListener('pointercancel',e=>{if(!active||e.pointerId!==pointerId)return;active=false;locked=false;pointerId=null;snap(currentState(),false,false)});
  }

  function ccBindCompetitionRoster_(host,eventId,editable,attendanceEditable,{returnToEvent=false}={}){
    if(!host)return;
    Array.from(host.querySelectorAll('[data-roster-profile-open]')).forEach(button=>{
      button.addEventListener('click',()=>{
        ccPlayerReturnEventId_=returnToEvent?text(eventId):'';
        openPlayerDetail(text(button.dataset.rosterProfileOpen));
      });
    });
    Array.from(host.querySelectorAll('[data-roster-att-slider]')).forEach(slider=>ccBindPlayerStyleSlider_(slider,{onCommit:async nextState=>{
      const previous=text(slider.dataset.sliderPrevious)||'none',db=nextState==='yes'?'present':nextState==='no'?'absent':'clear';
      try{
        await ccRosterAttendanceWrite_(eventId,slider.dataset.rosterAttSlider,db,slider);
        const confirmed=db!=='clear';
        slider.dataset.sliderUnconfirmed=confirmed?'0':'1';
        slider.closest('.cc-compact-roster-row, .cc-inline-player')?.classList.toggle('is-confirmed',confirmed);
        slider.closest('.cc-compact-roster-row, .cc-inline-player')?.classList.toggle('is-rsvp-only',!confirmed);
        const source=slider.closest('.cc-compact-roster-presence')?.querySelector('.cc-compact-roster-source');
        if(source)source.textContent=confirmed?'Rögzítve':'RSVP alapján';
        if(!confirmed)ccSetPlayerStyleSliderState_(slider,text(slider.dataset.sliderRsvp)||'none');
      }catch(_){ccSetPlayerStyleSliderState_(slider,previous)}
    }}));
  }
  function ccEventCoachRosterHtml_(e){
    const teamId=eventTeamId(e),id=text(e.eventId||e.id),coaches=teamGridCoachNames_(teamById(teamId)),avail=coachAvailabilityMap_();
    if(!coaches.length)return '';
    return '<div class="cc-event-coach-roster"><h5>Edző</h5>'
      +coaches.map(name=>'<div class="cc-event-coach-row"><strong>'+esc(name)+'</strong>'
      +coachMatrixControl_(id,teamId,name,avail.get(id+':'+name))+'</div>').join('')
      +'</div>';
  }
  function openEventDetail(id){
    ccDialogContext_='event';
    const e=findEventById(id);if(!e)return;const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle'),s=eventStart(e),en=eventEnd(e),eventId=text(e.eventId||e.id),editable=ccEventCanEdit_(e),attendanceEditable=editable&&!!s&&s<=new Date();
    if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='VERSENYSPORT · ESEMÉNY';
    title.textContent=ccDisplayEventTitle_(e);
    body.innerHTML=`<div class="entity-hero event-entity-hero"><span class="event-detail-mark" style="background:${esc(e.color||teamById(eventTeamId(e))?.color||'#f7b700')}"></span><div><b>${esc(e.teamName||teamById(eventTeamId(e))?.name||'–')}</b><span>${esc(eventType(e)==='match'?'Meccs':'Edzés')} · ${esc(s?fmtDate(s):'–')} ${esc(s?fmtTime(s):'–')}</span></div>${editable?`<button class="button quiet small entity-hero-action" id="eventEditBtn" type="button">Szerkesztés</button>`:''}</div><div class="detail-grid event-detail-primary-grid ${eventType(e)==='training'?'is-training':''}">${detailPair('Kezdés',s?`${fmtDate(s)} ${fmtTime(s)}`:'–')}${eventType(e)==='training'||ccMatchKindFromEvent_(e)==='friendly'?detailPair('Befejezés',en?fmtTime(en):'–'):''}${eventType(e)==='training'?detailPair('Pálya',e.court):`${detailPair('Helyszín',e.venue)}${detailPair('Cím',e.address)}${detailPair('Pálya',e.court)}${detailPair('Találkozó',e.meetingAt?`${fmtTime(e.meetingAt)} · ${e.meetingPlace||''}`:(e.meetingPlace||'–'))}`}</div><div class="panel-subhead rsvp-subhead"><div><h4>Részvételi jelzések</h4></div></div><div class="attendance-detail rsvp-detail compact-three"><div><small>Jövök</small><span><b>${num(e.yesCount)}</b> fő</span></div><div><small>Nem jövök</small><span><b>${num(e.noCount)}</b> fő</span></div><div><small>Nincs válasz</small><span><b>${num(e.unknownCount)}</b> fő</span></div></div><div class="panel-subhead"><div><h4>Névsor</h4></div></div><div id="eventRosterBody" data-event-roster-id="${esc(eventId)}" class="event-roster-detail"><span class="roster-loading">Névsor betöltése…</span></div>`;
    ccOpenDialogStable_(d);$('#eventEditBtn')?.addEventListener('click',()=>openCompetitionEventEditor(eventId,eventType(e)));
    if(!eventId||!configured())return;
    const showRoster=rows=>{
      const host=$('#eventRosterBody');
      if(!d.open||host?.dataset.eventRosterId!==eventId)return;
      host.innerHTML=ccEventCoachRosterHtml_(e)+(rows.length?ccTrainingInlineRosterHtml_(rows,eventId,editable,attendanceEditable):emptyInline('Nincs játékos a névsorban.'));
      ccBindCompetitionRoster_(host,eventId,editable,attendanceEditable,{returnToEvent:true});bindCoachAvailabilityControls_(host);
    };
    if(state.eventRosterCache.has(eventId))showRoster(state.eventRosterCache.get(eventId));
    else loadEventRoster(eventId).then(showRoster).catch(err=>{
      const host=$('#eventRosterBody');
      if(d.open&&host?.dataset.eventRosterId===eventId)host.innerHTML=`<span class="roster-loading error">${esc(err?.message||'A névsor nem tölthető be.')}</span><button class="button quiet small" id="ccEventRosterRetry" type="button">Újrapróbálás</button>`;
      $('#ccEventRosterRetry')?.addEventListener('click',()=>{const current=$('#eventRosterBody');if(!current||current.dataset.eventRosterId!==eventId)return;current.innerHTML='<span class="roster-loading">Újrapróbálás…</span>';loadEventRoster(eventId).then(showRoster).catch(nextErr=>{if(current.dataset.eventRosterId===eventId)current.textContent=nextErr?.message||'Betöltési hiba'})},{once:true});
    })
  }

  function bindEventDetailActions(){$$('[data-event-id]').forEach(el=>el.addEventListener('click',()=>openEventDetail(el.dataset.eventId)))}
  function matrixSource_(){
    const primary=state.rsvpMatrix&&typeof state.rsvpMatrix==='object'?state.rsvpMatrix:{};
    const season=state.cardRsvpMatrix&&typeof state.cardRsvpMatrix==='object'?state.cardRsvpMatrix:{};
    const primaryEvents=Array.isArray(primary.events)?primary.events:[];
    const seasonEvents=Array.isArray(season.events)?season.events:[];
    const events=primaryEvents.length?primaryEvents:(seasonEvents.length?seasonEvents:(Array.isArray(state.activityEvents)?state.activityEvents:[]));
    const primaryPlayers=Array.isArray(primary.players)?primary.players:[];
    const seasonPlayers=Array.isArray(season.players)?season.players:[];
    const fallbackPlayers=(Array.isArray(state.players)?state.players:[]).map(p=>({...p,playerId:p.playerId||p.id,teamId:p.teamId||p.team_id,displayName:p.displayName||p.name||p.email}));
    const players=primaryPlayers.length?primaryPlayers:(seasonPlayers.length?seasonPlayers:fallbackPlayers);
    const primaryResponses=Array.isArray(primary.responses)?primary.responses:[];
    const seasonResponses=Array.isArray(season.responses)?season.responses:[];
    const responses=primaryEvents.length?primaryResponses:seasonResponses;
    return {events,players,responses,mode:primaryEvents.length?'primary':seasonEvents.length?'season':'activity'};
  }
  function matrixResponseMap(){const m=new Map();(matrixSource_().responses||[]).forEach(r=>m.set(`${text(r.eventId)}:${text(r.playerId)}`,text(r.status)||'none'));return m}
  function matrixCellState_(status){const s=text(status);return s==='going'?'yes':s==='not_going'?'no':'none'}
  function matrixPlayerControl_(eventId,playerId,status,editable){const st=matrixCellState_(status),glyph=st==='yes'?'✓':st==='no'?'✕':'·';return `<span class="matrix-read-state ${st}" aria-label="${st==='yes'?'Jövök':st==='no'?'Nem jövök':'Nincs válasz'}">${glyph}</span>`}
  async function matrixRsvpWrite_(control,next){if(!control)return;const eventId=text(control.dataset.eventId),playerId=text(control.dataset.playerId),db=next==='yes'?'going':next==='no'?'not_going':'unknown',prev=text(control.dataset.state)||'none';control.dataset.state=next;control.classList.remove('yes','none','no');control.classList.add(next);try{await rpc('cc_manager_competition_rsvp_v1',{p_event_id:eventId,p_player_id:playerId,p_status:db});const row=(state.rsvpMatrix.responses||[]).find(r=>text(r.eventId)===eventId&&text(r.playerId)===playerId);if(row)row.status=db;else (state.rsvpMatrix.responses||[]).push({eventId,playerId,status:db});state.eventRosterCache.delete(eventId);status('RSVP mentve.','success')}catch(err){control.dataset.state=prev;control.classList.remove('yes','none','no');control.classList.add(prev);status(err.message||'Az RSVP mentése sikertelen.','error')}}
  function matrixFilteredEvents(){
    const f=state.matrixFilters||{},range=matrixRange(),from=range.from.getTime(),to=range.to.getTime();
    return effectiveCompetitionEvents(matrixSource_().events||[]).filter(e=>{
      const start=eventStart(e)?.getTime()||0;
      return start>=from&&start<to&&teamFilterMatch_('overview',eventTeamId(e))&&(f.kind==='ALL'||(f.kind==='TRAINING'&&eventType(e)==='training')||(f.kind==='MATCH'&&eventType(e)==='match'));
    }).sort((a,b)=>eventStart(a)-eventStart(b));
  }
  function gridGivenName(p){const raw=text(p?.displayName||p?.name||'');if(!raw)return'–';const parts=raw.split(/\s+/).filter(Boolean);return parts[0]||raw}
  function matrixMonthLabel(e){const d=eventStart(e);return d?new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'long',timeZone:'Europe/Budapest'}).format(d):''}
  function matrixCountClass(n){const x=num(n);return x<=6?'low':(x<10?'mid':'high')}
  function coachNames_(team){return text(team?.coaches).split(/[,;/]+/).map(x=>x.trim()).filter(Boolean).slice(0,4)}
  function teamGridCoachNames_(team){
    const tid=text(team?.id),names=[...coachNames_(team)];
    (state.coachAvailability||[]).filter(r=>!text(r?.teamId)||text(r?.teamId)===tid).forEach(r=>{const n=text(r?.coachName);if(n&&!names.some(x=>x.toLocaleLowerCase('hu-HU')===n.toLocaleLowerCase('hu-HU')))names.push(n)});
    return names.slice(0,6)
  }
  function coachAvailabilityMap_(){const m=new Map();(state.coachAvailability||[]).forEach(r=>m.set(`${text(r.eventId)}:${text(r.coachName)}`,r));return m}
  function coachMonogram_(name){const p=text(name).split(/\s+/).filter(Boolean);return (p.length>1?(p[0][0]+p[p.length-1][0]):(p[0]||'E').slice(0,2)).toLocaleUpperCase('hu-HU')}
  function coachCanEditFallback_(teamId,coachName){const mine=text(state.manager?.displayName||state.manager?.name).toLocaleLowerCase('hu-HU'),target=text(coachName).toLocaleLowerCase('hu-HU'),full=canAction('settings','edit');return full||(mine&&target&&mine===target&&(canAction('competition.overview','edit',teamId)||canAction('competition.teams','edit',teamId)))}
  function coachMatrixControl_(eventId,teamId,coachName,row,allowEdit=true){const status=typeof row==='object'&&row?row.status:row,st=matrixCellState_(status),serverCanEdit=typeof row?.canEdit==='boolean'?row.canEdit:true,editable=allowEdit&&serverCanEdit&&(canAction('competition.overview','edit',teamId)||canAction('competition.teams','edit',teamId));return `<span class="matrix-control coach-matrix-control ${st}" data-coach-rsvp data-event-id="${esc(eventId)}" data-team-id="${esc(teamId)}" data-coach-name="${esc(coachName)}" data-state="${esc(st)}" aria-label="Edzői részvétel: ${st==='yes'?'Ott vagyok':st==='no'?'Nem vagyok ott':'Nincs jelzés'}"><button type="button" data-coach-state="yes" title="Ott vagyok" aria-label="Ott vagyok" ${editable?'':'disabled'}>✓</button><button type="button" data-coach-state="none" title="Nincs jelzés" aria-label="Nincs jelzés" ${editable?'':'disabled'}>·</button><button type="button" data-coach-state="no" title="Nem vagyok ott" aria-label="Nem vagyok ott" ${editable?'':'disabled'}>✕</button></span>`}
  async function coachAvailabilityWrite_(control,next){if(!control||state.coachAvailabilityBusy.has(`${control.dataset.eventId}:${control.dataset.coachName}`))return;const eventId=text(control.dataset.eventId),teamId=text(control.dataset.teamId),coachName=text(control.dataset.coachName),prev=text(control.dataset.state)||'none',db=next==='yes'?'going':next==='no'?'not_going':'unknown',busyKey=`${eventId}:${coachName}`;control.dataset.state=next;control.classList.remove('yes','none','no');control.classList.add(next);state.coachAvailabilityBusy.add(busyKey);try{await rpc('cc_manager_coach_availability_set_v1',{p_event_id:eventId,p_coach_name:coachName,p_status:db});const row=(state.coachAvailability||[]).find(r=>text(r.eventId)===eventId&&text(r.coachName)===coachName);if(row)row.status=db;else state.coachAvailability.push({eventId,teamId,coachName,status:db});status('Edzői jelzés mentve.','success')}catch(err){control.dataset.state=prev;control.classList.remove('yes','none','no');control.classList.add(prev);status(err.message||'Az edzői jelzés mentése sikertelen.','error')}finally{state.coachAvailabilityBusy.delete(busyKey)}}
  function bindCoachAvailabilityControls_(root=document){Array.from(root.querySelectorAll('[data-coach-rsvp]')).forEach(control=>{if(control.dataset.bound==='1')return;control.dataset.bound='1';control.querySelectorAll('[data-coach-state]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();coachAvailabilityWrite_(control,btn.dataset.coachState)}))})}
  function matrixTeamHtml(teamId,events,map){
    let players=(matrixSource_().players||[]).filter(p=>text(p.teamId||p.team_id)===text(teamId));
    const f=state.matrixFilters||{};
    if(f.status!=='ALL')players=players.filter(p=>events.some(e=>map.get(`${text(e.eventId)}:${text(p.playerId)}`)===f.status));
    players.sort((a,b)=>(num(a.jerseyNo)||9999)-(num(b.jerseyNo)||9999)||text(a.displayName||a.name).localeCompare(text(b.displayName||b.name),'hu'));
    const t=teamById(teamId);if(!events.length)return'';
    const coachNames=teamGridCoachNames_(t),coachMap=coachAvailabilityMap_();
    const teamColor=t?.color||events.find(e=>e.color)?.color||'#f7b700';
    const head=`<th class="matrix-event-col matrix-event-side sticky-matrix-col">Alkalom</th><th class="matrix-count-col matrix-count-head">Fő</th>${coachNames.map(name=>`<th class="matrix-player-head matrix-coach-head" title="Edző: ${esc(name)}"><span class="grid-player-head-inner"><span class="matrix-coach-avatar">E</span><span class="grid-player-label">${esc(name)}</span></span></th>`).join('')}${players.map(p=>`<th class="matrix-player-head" title="${esc(p.displayName||p.name)}"><button class="matrix-player-profile-open" type="button" data-matrix-player-open="${esc(p.playerId||p.id)}" aria-label="${esc(p.displayName||p.name)} játékos profilja"><span class="grid-player-head-inner">${avatarHtml(p,'matrix')}<span class="grid-player-label">${esc(gridGivenName(p))}</span></span></button></th>`).join('')}`;
    let lastMonth='';
    const body=events.map((e,idx)=>{
      const month=matrixMonthLabel(e),divider=idx>0&&month!==lastMonth?`<tr class="matrix-month-divider"><td colspan="${2+coachNames.length+players.length}"><span>${esc(month)}</span></td></tr>`:'';lastMonth=month;
      const going=players.filter(p=>map.get(`${text(e.eventId)}:${text(p.playerId)}`)==='going').length;
      const iconPath=eventType(e)==='training'?'assets/event-training-mask.png':text(e.homeAway||e.home_away)==='away'?'assets/event-away-mask.png':'assets/event-home-mask.png';
      const eventLabel=eventType(e)==='training'?'Edzés':ccEventOpponent_(e)||'Meccs';
      return divider+`<tr class="matrix-data-row"><th class="matrix-event-col matrix-event-side sticky-matrix-col"><button class="matrix-event-side-btn" type="button" data-event-id="${esc(e.eventId)}"><span class="matrix-side-icon"><img src="${iconPath}" alt=""></span><span class="matrix-event-copy"><b>${esc(eventLabel)}</b><small>${esc(fmtDate(eventStart(e)))} · ${esc(fmtTime(eventStart(e)))}</small></span></button></th><td class="matrix-count-col matrix-count-cell"><strong class="${matrixCountClass(going)}">${going}</strong></td>${coachNames.map(name=>`<td class="matrix-cell matrix-coach-cell">${coachMatrixControl_(e.eventId,teamId,name,coachMap.get(text(e.eventId)+':'+name))}</td>`).join('')}${players.map(p=>{const st=map.get(`${text(e.eventId)}:${text(p.playerId)}`);return `<td class="matrix-cell ${st==='going'?'going':st==='not_going'?'not-going':'none'}">${matrixPlayerControl_(e.eventId,p.playerId,st,false)}</td>`}).join('')}</tr>`
    }).join('');
    return `<section class="matrix-team-section player-parity-team" style="--team-color:${esc(teamColor)}"><div class="matrix-team-title"><strong>${esc(t?.name||'Csapat')}</strong><span>${events.length} esemény · ${players.length} játékos</span></div><div class="matrix-scroll manager-player-grid"><table class="rsvp-matrix season-matrix transposed-matrix manager-player-matrix"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div></section>`
  }

  function matrixFiltersActive_(){const f=state.matrixFilters||{};return f.period!=='14'||f.kind!=='ALL'||f.status!=='ALL'||!!f.from||!!f.to}
  function matrixFiltersHtml(){
    state.matrixFilterOpen=filterOpen_('competition.overview',state.matrixFilterOpen);
    const f=state.matrixFilters||{},custom=f.period==='CUSTOM';
    return `<div class="matrix-filter-panel ${state.matrixFilterOpen?'open':''}" id="matrixFilterPanel" ${state.matrixFilterOpen?'':'hidden'}><label>Időszak<select data-matrix-filter="period"><option value="14" ${f.period==='14'?'selected':''}>Következő 2 hét</option><option value="28" ${f.period==='28'?'selected':''}>Következő 4 hét</option><option value="CUSTOM" ${f.period==='CUSTOM'?'selected':''}>Egyéni időszak</option></select></label><label>Eseménytípus<select data-matrix-filter="kind"><option value="ALL" ${f.kind==='ALL'?'selected':''}>Edzés + meccs</option><option value="TRAINING" ${f.kind==='TRAINING'?'selected':''}>Csak edzés</option><option value="MATCH" ${f.kind==='MATCH'?'selected':''}>Csak meccs</option></select></label><label>Jelzés<select data-matrix-filter="status"><option value="ALL" ${f.status==='ALL'?'selected':''}>Minden játékos</option><option value="going" ${f.status==='going'?'selected':''}>Jövök</option><option value="not_going" ${f.status==='not_going'?'selected':''}>Nem jövök</option><option value="none" ${f.status==='none'?'selected':''}>Nincs válasz</option></select></label>${custom?`<label>Időszak eleje<input type="date" data-matrix-filter="from" value="${esc(f.from||'')}"></label><label>Időszak vége<input type="date" data-matrix-filter="to" value="${esc(f.to||'')}"></label>`:''}</div>`
  }
  function renderMatrix(){
    const events=matrixFilteredEvents(),map=matrixResponseMap(),selectedTeamIds=teamFilterIds_('overview'),baseTeamIds=overviewContextTeams_().map(t=>text(t.id)),teamIds=selectedTeamIds.length?selectedTeamIds:baseTeamIds,active=matrixFiltersActive_(),source=matrixSource_();
    const sourceNote=source.mode==='primary'?'':`<div class="matrix-source-fallback" role="status">A rács tartalék adatforrásból állt helyre${state.rsvpMatrixLoadError?` · ${esc(state.rsvpMatrixLoadError)}`:''}.</div>`;
    return `<div class="parity-matrix"><div class="parity-matrix-head"><div><h3>Jelenlét</h3></div><div class="matrix-head-filter-actions"><button class="matrix-filter-toggle icon-only ${state.matrixFilterOpen?'open':''} ${active?'has-filter':''}" id="matrixFilterToggle" type="button" aria-expanded="${state.matrixFilterOpen?'true':'false'}" aria-controls="matrixFilterPanel" aria-label="Jelenlét szűrők"><span class="triangle-icon"></span></button>${active?`<button class="filter-reset cc-toolbar-reset" id="matrixFilterReset" type="button" aria-label="Szűrők törlése" title="Szűrők törlése">×</button>`:''}</div></div>${sourceNote}${matrixFiltersHtml()}${teamIds.map(id=>matrixTeamHtml(id,events.filter(e=>eventTeamId(e)===text(id)),map)).join('')||emptyInline('Nincs esemény a kiválasztott szűréssel.')}</div>`
  }

  function bindMatrix(){const tog=$('#matrixFilterToggle'),panel=$('#matrixFilterPanel'),reset=$('#matrixFilterReset');if(tog)tog.onclick=()=>{const open=setFilterOpen_('competition.overview',!state.matrixFilterOpen);state.matrixFilterOpen=open;tog.classList.toggle('open',open);tog.setAttribute('aria-expanded',String(open));if(panel){panel.hidden=!open;panel.classList.toggle('open',open)}ccBlurPointerControl_(tog)};reset?.addEventListener('click',async()=>{state.matrixFilters={team:'',period:'14',kind:'ALL',status:'ALL',from:'',to:''};if(configured())await loadRsvpMatrix();renderOverview()});$$('[data-matrix-filter]').forEach(el=>el.addEventListener('change',()=>{const k=el.dataset.matrixFilter,old=state.matrixFilters[k];state.matrixFilters[k]=el.value;afterNativePicker(el,async()=>{if(k==='period'||k==='from'||k==='to'){try{if(configured())await loadRsvpMatrix()}catch(err){state.matrixFilters[k]=old;status(err.message,'error')}}renderOverview()},'#matrixFilterPanel')}));$$('[data-matrix-rsvp]').forEach(control=>control.querySelectorAll('[data-matrix-state]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();matrixRsvpWrite_(control,btn.dataset.matrixState)})));bindEventDetailActions();bindCoachAvailabilityControls_();document.querySelectorAll('[data-matrix-player-open]').forEach(btn=>btn.addEventListener('click',()=>openPlayerDetail(text(btn.dataset.matrixPlayerOpen))))}
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
  function massLegacyTrainingRow(e,{overview=false,archived=false}={}){
    const st=safeDate(e.startsAt),en=safeDate(e.endsAt),active=!archived&&e.active!==false,gate=!archived&&text(e.registrationMode)==='WAITLIST_ONLY',color=massLevelColor(e),cap=num(e.capacity||e.totalLimit||e.newLimit),eventId=text(e.eventId||e.id),finished=!!en&&en.getTime()<Date.now(),statusLabel=archived?'LEZÁRT':(!active?'INAKTÍV':(finished?'LEZAJLOTT':(gate?'CSAK VÁRÓLISTA':'AKTÍV')));
    return `<div class="legacy-mass-training-item mass-card-v2 ${archived?'archived':''}" style="--level-rgb:${esc(hexRgb(color))}"><div class="legacy-mass-training-row ${active?'':'inactive'} ${gate?'waitlist-only':''}" data-mass-detail="${esc(eventId)}" role="button" tabindex="0">
      <div class="legacy-mass-main"><span class="mass-level-status"><b>${esc(e.level||'Edzés')}</b><em class="training-active-pill ${archived||!active?'off':''} ${gate?'waitlist':''}">${statusLabel}</em></span><small>${esc(st?fmtDate(st):'–')} · ${esc(st?fmtTime(st):'–')}${en?`–${esc(fmtTime(en))}`:''} · ${esc(e.court||'Pálya –')}</small></div>
      <div class="legacy-mass-count"><b>${num(e.totalActive)} <span>/ ${cap}</span></b><small>${num(e.waitlistCount)} várólistán</small></div>
    </div><button class="mass-roster-strip legacy-mass-chevron" type="button" data-mass-roster-toggle="${esc(eventId)}" aria-expanded="false"><span>Névsor</span><span class="triangle-icon"></span></button><div class="legacy-mass-inline-roster" data-mass-roster-holder="${esc(eventId)}" hidden></div></div>`;
  }
  async function toggleMassInlineRoster_(eventId,button){
    const holder=document.querySelector(`[data-mass-roster-holder="${CSS.escape(eventId)}"]`);if(!holder)return;const opening=holder.hidden;holder.hidden=!opening;button?.setAttribute('aria-expanded',String(opening));button?.classList.toggle('open',opening);if(!opening)return;const cancelledWasOpen=Boolean(holder.querySelector('#massInlineCancelledPanel')?.open);holder.innerHTML='<div class="roster-loading">Névsor frissítése…</div>';
    try{const data=await loadMassEventDetail(eventId,{force:true}),event=data?.event||{},bookings=(Array.isArray(data?.bookings)?data.bookings:[]).slice().sort(massPersonSort_),wait=(Array.isArray(data?.waitlist)?data.waitlist:[]).slice().sort(massPersonSort_);holder.dataset.loaded='1';holder.innerHTML=`<div class="mass-inline-roster-list">${bookings.map(r=>{const pass=massPassInfo_(r,event),type=text(r.personType||r.bookingType||r.type).toLocaleUpperCase('hu-HU'),first=/FIRST|ELSŐ|ELSO/.test(type);return `<div class="mass-inline-person"><span class="mass-inline-identity"><b>${esc(r.name||'Névtelen')}</b>${pass.needsCheck?'<i class="mass-inline-flag pass-check" title="Bérlet ellenőrzendő">!</i>':''}${first?'<i class="mass-inline-flag first-training" title="Első edzés">@</i>':''}</span></div>`}).join('')}${wait.map(r=>`<div class="mass-inline-person wait"><span class="mass-inline-identity"><b>${esc(r.name||'Névtelen')}</b></span><span class="mass-coming wait">Várólista</span></div>`).join('')||(!bookings.length?emptyInline('Nincs jelentkező.'):'')}</div>${massCancellationPanelHtml_(data?.cancelled,{compact:true,unavailable:data?.cancelledUnavailable,open:cancelledWasOpen})}`}catch(err){holder.innerHTML=`<div class="roster-loading error">${esc(err.message||'A névsor nem tölthető be.')}</div>`}
  }
  function bindMassLegacyRows(){
    $$('[data-mass-detail]').forEach(b=>{b.addEventListener('click',()=>openMassEventDetail(b.dataset.massDetail));b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openMassEventDetail(b.dataset.massDetail)}})});
    $$('[data-mass-gate]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();toggleMassRegistrationGate(b.dataset.massGate,b.dataset.close==='1')}));
    $$('[data-mass-roster-toggle]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();toggleMassInlineRoster_(b.dataset.massRosterToggle,b)}));
  }
  function overviewMatrixWidth_(){
    const selected=teamFilterIds_('overview'),teamIds=selected.length?selected:state.teams.map(t=>text(t.id)),events=matrixFilteredEvents(),map=matrixResponseMap(),f=state.matrixFilters||{};let maxColumns=0;
    teamIds.forEach(teamId=>{let players=(state.rsvpMatrix.players||[]).filter(p=>text(p.teamId)===text(teamId));if(f.status!=='ALL')players=players.filter(p=>events.filter(e=>eventTeamId(e)===text(teamId)).some(e=>map.get(`${text(e.eventId)}:${text(p.playerId)}`)===f.status));maxColumns=Math.max(maxColumns,players.length)});
    return Math.max(330,118+36+(maxColumns*42)+24)
  }
  function renderOverview(){if(state.module!=='overview'||!['competition','mass'].includes(state.area))return;
    if(state.area!=='competition'){
      const rows=(state.massTrainings||[]).filter(e=>safeDate(e.startsAt)?.getTime()>=Date.now()-3600000).sort((a,b)=>safeDate(a.startsAt)-safeDate(b.startsAt));
      const totalBookings=rows.reduce((n,e)=>n+num(e.totalActive),0),totalWait=rows.reduce((n,e)=>n+num(e.waitlistCount),0),closed=rows.filter(e=>text(e.registrationMode)==='WAITLIST_ONLY').length;
      $('#viewContent').innerHTML=`<div class="overview-summary parity-summary mass-summary-compact"><div><strong>${rows.length}</strong><span>Közelgő edzés</span></div><div><strong>${totalBookings}</strong><span>Aktív jelentkezés</span></div><div><strong>${totalWait}</strong><span>Várólistán</span></div><div><strong>${closed}</strong><span>Csak várólista</span></div></div><article class="panel legacy-mass-panel"><div class="panel-head"><div><h3>Következő edzések</h3><p>A régi Manager edzéslistájának színkódolt, gradiens nézete.</p></div><button class="button quiet small" id="massOverviewAll" type="button">Összes edzés</button></div><div class="legacy-mass-training-header overview"><div>Cím / szint</div><div>Időpont</div><div>Pálya</div><div>Létszám</div><div>Státusz</div><div></div></div><div class="legacy-mass-training-list">${rows.slice(0,10).map(e=>massLegacyTrainingRow(e,{overview:true})).join('')||emptyInline('Nincs közelgő Tömegsport edzés.')}</div></article>`;
      $('#massOverviewAll')?.addEventListener('click',()=>setRoute('mass','trainings'));bindMassLegacyRows();return;
    }
    syncOverviewTeamContext_();
    if(!ccMrszPhotoState_.loaded&&!ccMrszPhotoState_.loading)void ccLoadMrszPhotoSnapshot_();
    const overviewFilterActive=teamFilterIds_('overview').length>0;
    const now=Date.now(),matchUntil=now+31*864e5,overviewFallback=Array.isArray(state.overview?.nextEvents)?state.overview.nextEvents:[],events=effectiveCompetitionEvents(state.activityEvents.length?state.activityEvents:overviewFallback).filter(e=>!isEventPast(e)&&teamFilterMatch_('overview',eventTeamId(e))),matches=events.filter(e=>eventType(e)==='match'&&(eventStart(e)?.getTime()||0)<matchUntil);
    $('#viewContent').innerHTML=`<div class="page-intro overview-player-intro overview-context-intro cc-page-header-panel cc-overview-page-header"><div><h2>Versenysport áttekintés</h2><p>Jelenlét, következő meccsek és aktuális bajnoki állás.</p></div><div class="page-actions cc-overview-team-toolbar">${overviewTeamSwitchHtml_()}</div></div><div class="parity-overview-grid manager-overview-main" style="--overview-matrix-w:${overviewMatrixWidth_()}px"><article class="panel parity-matrix-card">${renderMatrix()}</article><article class="panel next-matches-card"><div class="panel-head"><div><h3>Következő meccsek</h3><p>${state.overviewTeam?esc(teamById(state.overviewTeam)?.name||'Kiválasztott csapat'):'Összes csapat'} · következő 1 hónap</p></div><button class="button quiet small" id="allMatchesBtn" type="button">Összes</button></div><div class="cc-event-card-list overview-event-card-list">${matches.slice(0,8).map(e=>ccEventCardHtml_(e,'match')).join('')||emptyInline('Nincs közelgő meccs.')}</div></article></div><section class="overview-standings-section"><div class="overview-section-title"><h3>Tabella</h3><p>${state.overviewTeam?esc(teamById(state.overviewTeam)?.name||'Kiválasztott csapat'):'Összes csapat'} · legutóbbi rögzített állás</p></div>${standingsSection_('overview')}</section>`;
    $('#allMatchesBtn')?.addEventListener('click',()=>{state.eventTeam=text(state.overviewTeam);state.teamFilters.events=[...teamFilterIds_('overview')];setRoute('competition','matches')});bindOverviewTeamSwitch_();bindMatrix();bindEventDetailActions();bindOverviewStandings_();
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
  function renderNotifications(){if(!ccRouteIs_('competition','notifications'))return;
    const recipients=notificationRecipientRows(),selected=notificationRecipientById(state.notificationSelectedPlayerId),err=state.notificationLoadError;
    $('#viewContent').innerHTML=`<div class="page-intro cc-page-header-panel cc-notification-page-header"><div><h2>Értesítések</h2><p>Egyéni Player értesítés. Csak a kiválasztott játékos fiókja kapja meg.</p></div></div>${err?`<div class="inline-error">${esc(err)}</div>`:''}<div class="notification-manager-grid"><article class="panel notification-recipient-panel"><div class="panel-head"><div><h3>1. Címzett</h3><p>Név vagy email alapján válassz pontosan egy játékost.</p></div></div><label class="field notification-search"><span>Keresés</span><input id="notificationRecipientSearch" type="search" value="${esc(state.notificationSearch)}" placeholder="Név vagy email cím" autocomplete="off"></label><div class="notification-recipient-list">${recipients.map(p=>`<button class="notification-recipient ${text(p.playerId)===text(state.notificationSelectedPlayerId)?'selected':''}" data-notification-player="${esc(p.playerId)}" type="button">${avatarHtml(p,'notification')}<span><b>${esc(p.displayName||p.email)}</b><small>${esc(p.email)} · ${esc(notificationTeamText(p))}</small></span><em>${num(p.activeDevices)>0?`${num(p.activeDevices)} push eszköz`:'csak in-app'}</em></button>`).join('')||emptyInline('Nincs találat.')}</div></article><article class="panel notification-compose-panel"><div class="panel-head"><div><h3>2. Üzenet</h3><p>${selected?`Címzett: ${esc(selected.displayName||selected.email)} · ${esc(selected.email)}`:'Előbb válassz címzettet.'}</p></div></div>${selected?`<div class="notification-selected-card">${avatarHtml(selected,'notification-large')}<div><b>${esc(selected.displayName||selected.email)}</b><span>${esc(selected.email)}</span><small>${esc(notificationTeamText(selected))} · ${num(selected.activeDevices)>0?'push aktív':'nincs aktív push eszköz'}</small></div></div><label class="field"><span>Cím</span><input id="notificationTitle" maxlength="120" value="Club Control" placeholder="Értesítés címe"></label><label class="field"><span>Üzenet</span><textarea id="notificationBody" maxlength="1200" rows="6" placeholder="Írd meg az értesítés szövegét…"></textarea></label><label class="field"><span>Kapcsolt esemény <small>opcionális</small></span><select id="notificationEventId">${notificationEventOptions(selected)}</select></label><div class="notification-delivery-note"><b>Mit fog kapni?</b><span>Az in-app értesítés azonnal létrejön. Ha van aktív push eszköze, a telefonos értesítés a következő automatikus küldési körben érkezik.</span></div><button class="button primary full" id="notificationSendBtn" type="button" ${state.notificationBusy?'disabled':''}>${state.notificationBusy?'Küldés…':'Értesítés küldése'}</button>`:`<div class="admin-editor-empty"><b>Nincs kiválasztott címzett</b><span>A bal oldali listából válassz egy játékost.</span></div>`}</article></div><details class="panel notification-history-panel"><summary><span>Korábbi küldések</span><small>Napló és kézi értesítési előzmények</small></summary><div class="notification-history-inner"><div class="panel-head"><div><h3>Legutóbbi küldéseim</h3><p>A saját Manager-fiókodból indított kézi értesítések.</p></div><button class="cc-toolbar-icon cc-refresh-icon" id="notificationHistoryRefresh" type="button" aria-label="Frissítés" title="Frissítés">↻</button></div>${renderNotificationHistory()}</div></details>`;
    bindNotifications()
  }
  function bindNotifications(){
    $('#notificationRecipientSearch')?.addEventListener('input',e=>{state.notificationSearch=e.target.value;const value=e.target.value,routeSnapshot=ccRouteSnapshot_();clearTimeout(bindNotifications._timer);bindNotifications._timer=setTimeout(async()=>{if(!ccRouteSnapshotCurrent_(routeSnapshot))return;try{await loadNotificationRecipients(value)}catch(err){state.notificationLoadError=text(err?.message||err)}if(ccRouteSnapshotCurrent_(routeSnapshot))renderNotifications()},220)});
    $$('[data-notification-player]').forEach(b=>b.addEventListener('click',()=>{state.notificationSelectedPlayerId=b.dataset.notificationPlayer;renderNotifications()}));
    $('#notificationSendBtn')?.addEventListener('click',sendManualNotification);
    $('#notificationHistoryRefresh')?.addEventListener('click',async()=>{try{await loadNotificationHistory();status('Értesítési előzmények frissítve.','success')}catch(err){status(err.message||'Nem sikerült frissíteni.','error')}renderNotifications()})
  }
  async function sendManualNotification(){
    if(state.notificationBusy)return;const player=notificationRecipientById(state.notificationSelectedPlayerId);if(!player){status('Válassz címzettet.','error');return}const title=text($('#notificationTitle')?.value),body=text($('#notificationBody')?.value),eventId=text($('#notificationEventId')?.value)||null;if(!title){status('Az értesítés címe kötelező.','error');return}if(!body){status('Az üzenet szövege kötelező.','error');return}if(!window.confirm(`Biztosan elküldöd az értesítést?\n\nCímzett: ${player.displayName||player.email}\nCím: ${title}\n\nJelenlegi csatorna: in-app + elérhető push eszközök.`))return;state.notificationBusy=true;renderNotifications();try{const result=await rpc('cc_manager_notification_send_v1',{p_player_id:player.playerId,p_title:title,p_body:body,p_event_id:eventId});await loadNotificationHistory();const push=num(result?.activeDevices)>0?'Push sorba állítva.':'Nincs aktív push eszköz, az in-app értesítés ettől még létrejött.';status(`Értesítés elküldve: ${player.email}. ${push}`,'success');renderNotifications()}catch(err){console.error(err);status(err.message||'Az értesítés küldése sikertelen.','error');state.notificationBusy=false;renderNotifications();return}state.notificationBusy=false;renderNotifications()}


  // A read-only operational view of BEAC training/match intersections. Meeting time
  // is intentionally never considered. The RPC is Manager-authorization guarded.
  const ccCourtImpactState_={loading:false,data:null,error:'',loaded:false,token:0};
  const ccCourtImpactFilters_={team:'all',type:'all'};
  const CC_COURT_IMPACT_TYPES_=Object.freeze({
    home_match_occupied:'Hazai meccs · foglalt pálya',
    away_potential_free:'Idegenbeli meccs · felszabaduló sáv',
    away_potential_free_unconfirmed:'Idegenbeli meccs · feltételesen szabad',
    away_court_not_free:'Idegenbeli meccs · másik foglalás',
    training_match_conflict:'Ütközés · edzés még aktív',
    cancellation_unmatched:'Lemondott edzés · meccs nem azonosított'
  });
  async function ccLoadCourtImpact_({force=false}={}){
    if(ccCourtImpactState_.loading||(!force&&ccCourtImpactState_.loaded))return;
    ccCourtImpactState_.loading=true;
    const token=++ccCourtImpactState_.token;
    try{
      const data=await rpc('cc_manager_court_impact_v1',{p_from:'2026-10-19',p_to:'2027-06-01'});
      if(token!==ccCourtImpactState_.token)return;
      ccCourtImpactState_.data=data&&Array.isArray(data.rows)?data:{rows:[]};
      ccCourtImpactState_.error='';ccCourtImpactState_.loaded=true;
    }catch(err){
      if(token!==ccCourtImpactState_.token)return;
      ccCourtImpactState_.error=text(err?.message||'A teremtervezési kimutatás nem érhető el.');
      ccCourtImpactState_.loaded=true;ccCourtImpactState_.data=null;
    }finally{
      if(token===ccCourtImpactState_.token){
        ccCourtImpactState_.loading=false;
        if(ccRouteIs_('competition','courts'))ccRenderCourtImpact_();
      }
    }
  }
  function ccCourtImpactTime_(value){
    return value&&safeDate(value)?fmtTime(value):'–';
  }
  function ccCourtImpactWeek_(iso){
    const dt=new Date(String(iso)+'T12:00:00+02:00');
    if(Number.isNaN(dt.getTime()))return text(iso);
    return new Intl.DateTimeFormat('hu-HU',{month:'long',day:'numeric',timeZone:'Europe/Budapest'}).format(dt);
  }
  function ccRenderCourtImpact_(){
    if(!ccRouteIs_('competition','courts'))return;
    if(!ccCourtImpactState_.loaded&&!ccCourtImpactState_.loading){
      Promise.resolve().then(()=>ccLoadCourtImpact_());
    }
    const all=Array.isArray(ccCourtImpactState_.data?.rows)?ccCourtImpactState_.data.rows:[];
    const nowDay=localDateKey(new Date());
    const rows=all.filter(r=>{
      if(text(r.date)<nowDay)return false;
      if(ccCourtImpactFilters_.team!=='all'&&text(r.teamId)!==ccCourtImpactFilters_.team)return false;
      if(ccCourtImpactFilters_.type==='home'&&text(r.matchSide)!=='home')return false;
      if(ccCourtImpactFilters_.type==='away'&&text(r.matchSide)!=='away')return false;
      if(ccCourtImpactFilters_.type==='conflict'&&text(r.courtImpact)!=='training_match_conflict')return false;
      return true;
    }).sort((a,b)=>text(a.date).localeCompare(text(b.date))||text(a.teamName).localeCompare(text(b.teamName),'hu'));
    const weeks=new Map();
    rows.forEach(row=>{const week=text(row.weekStart)||text(row.date);if(!weeks.has(week))weeks.set(week,[]);weeks.get(week).push(row)});
    const options=state.teams.filter(t=>t.active!==false).map(t=>'<option value="'+esc(t.id)+'" '+(ccCourtImpactFilters_.team===text(t.id)?'selected':'')+'>'+esc(t.name)+'</option>').join('');
    const legend=(row)=>{
      const impact=text(row.courtImpact),label=CC_COURT_IMPACT_TYPES_[impact]||impact;
      const extra=row.matchSide==='away'&&impact==='away_potential_free_unconfirmed'
        ?' · tömegsport-beosztás még nem teljes'
        :row.massOverlap?' · tömegsport foglalja'
          :row.otherTrainingOverlap?' · másik csapatedzés foglalja'
          :row.otherHomeMatchOverlap&&row.matchSide==='away'?' · hazai meccs foglalja':'';
      return label+extra;
    };
    const line=(r)=>{
      const risk=['training_match_conflict','cancellation_unmatched','away_court_not_free'].includes(text(r.courtImpact));
      return '<tr><td><b>'+esc(fmtDay(r.trainingStart))+'</b><div>'+esc(ccCourtImpactTime_(r.trainingStart))+'–'+esc(ccCourtImpactTime_(r.trainingEnd))+'</div></td>'+
        '<td>'+esc(r.teamName)+'</td>'+
        '<td><b>'+esc(r.trainingCourt||'–')+'</b></td>'+
        '<td>'+esc(r.matchTitle||'–')+'<div>'+esc(r.matchStart?ccCourtImpactTime_(r.matchStart):'')+'</div></td>'+
        '<td><span class="status-pill '+(risk?'warn':r.matchSide==='away'?'muted':'ok')+'">'+esc(legend(r))+'</span>'+(r.trainingGoing?'<div>'+esc(r.trainingGoing)+' korábbi igen jelentkezés</div>':'')+'</td></tr>';
    };
    const table=[...weeks.entries()].map(([week,weekRows])=>
      '<section class="panel" style="margin-top:12px"><div class="panel-head"><h3>'+esc(ccCourtImpactWeek_(week))+'-i hét</h3><span>'+weekRows.length+' érintett edzés</span></div>'+
      '<div class="ms-table-scroll" style="overflow-x:auto"><table class="ms-table"><thead><tr><th>Edzés</th><th>Csapat</th><th>Pálya</th><th>Meccs</th><th>Teremhelyzet</th></tr></thead><tbody>'+
      weekRows.map(line).join('')+'</tbody></table></div></section>'
    ).join('');
    const refresh=ccCourtImpactState_.loading?'Betöltés…':'↻ Frissítés';
    const horizon=text(ccCourtImpactState_.data?.massCalendarCoveredThrough);
    $('#viewContent').innerHTML=
      '<div class="page-intro cc-page-header-panel"><div><h2>Teremtervezés</h2><p>Elmaradó versenysport-edzések és a pályák várható kihasználtsága, heti bontásban.</p></div>'+
      '<div class="page-actions"><button id="ccCourtRefresh" type="button" class="button quiet">'+refresh+'</button></div></div>'+
      '<article class="panel"><div class="filter-panel" style="display:flex;gap:12px;flex-wrap:wrap">'+
      '<label class="field compact"><span>Csapat</span><select id="ccCourtTeam"><option value="all">Összes csapat</option>'+options+'</select></label>'+
      '<label class="field compact"><span>Típus</span><select id="ccCourtType"><option value="all">Minden érintett edzés</option>'+
      '<option value="home" '+(ccCourtImpactFilters_.type==='home'?'selected':'')+'>Hazai meccs</option>'+
      '<option value="away" '+(ccCourtImpactFilters_.type==='away'?'selected':'')+'>Idegenbeli meccs</option>'+
      '<option value="conflict" '+(ccCourtImpactFilters_.type==='conflict'?'selected':'')+'>Aktív ütközés</option></select></label></div>'+
      '<p style="margin:12px 0 0">Az idegenbeli meccsnél felszabadulhat a csapat edzéssávja. Ez csak akkor ténylegesen szabad, ha nincs másik foglalás. A találkozó időpontja nem számít pályahasználatnak.</p>'+
      (horizon?'<p style="margin:8px 0 0">Jelenleg rögzített tömegsport-események utolsó napja: '+esc(horizon)+'. Későbbi időpontokra a szabad jelzés feltételes.</p>':'')+
      '</article>'+
      (ccCourtImpactState_.error?'<article class="panel"><div class="ms-empty error">'+esc(ccCourtImpactState_.error)+'</div></article>':
      ccCourtImpactState_.loading?'<article class="panel"><div class="ms-empty">Teremtervezési adatok betöltése…</div></article>':
      table||'<article class="panel"><div class="ms-empty">Nincs a szűrőnek megfelelő ütközés vagy elmaradó edzés.</div></article>');
    $('#ccCourtTeam')?.addEventListener('change',e=>{ccCourtImpactFilters_.team=e.target.value;ccRenderCourtImpact_()});
    $('#ccCourtType')?.addEventListener('change',e=>{ccCourtImpactFilters_.type=e.target.value;ccRenderCourtImpact_()});
    $('#ccCourtRefresh')?.addEventListener('click',()=>{ccCourtImpactState_.loaded=false;ccCourtImpactState_.error='';ccLoadCourtImpact_({force:true})});
  }


  // Historical comparison only. 2026/27 has no current-season Elo and cannot
  // inherit 2025/26 roster strength. Do not couple this screen to active matches.
  const ccWomenHistoryState_={loaded:false,loading:false,error:'',rows:[],scope:'all'};
  const ccClubHistoryState_={selected:'womenI',loaded:false,loading:false,error:'',teams:[]};
  const CC_CLUB_HISTORY_OPTIONS_=[['womenI','Női BB1'],['womenIIB','Női BB2'],['menB','Férfi']];
  const CC_WOMEN_HISTORY_STATES_=Object.freeze({
    supported_exact:'Névegyezés',
    supported_alias:'Hivatalos rövid név',
    supported_case:'Névegyezés',
    review_alias:'Névkapcsolat ellenőrzendő',
    no_women_i_history:'Nincs előző I. osztályú adat'
  });
  async function ccLoadWomenHistory_(){
    if(ccWomenHistoryState_.loading||ccWomenHistoryState_.loaded)return;
    ccWomenHistoryState_.loading=true;
    try{
      const response=await fetch('./data/competition-strength/women1_2026_27_historical_lookback.json',{cache:'no-store'});
      if(!response.ok)throw new Error('A történeti adatállomány nem érhető el.');
      const data=await response.json();
      if(data?.schemaVersion!==1||data?.currentSeason!=='2026/27'||data?.historicalSeason!=='2025/26'||
          !Array.isArray(data?.teams)||data.teams.length!==12||
          data?.noPredictiveOrCurrentStrength!==true||
          data.teams.some(t=>t.currentStrengthRating!=null||t.continuityConfirmed!==false))
        throw new Error('A történeti összehasonlítás adatainak ellenőrzése sikertelen.');
      const ids=new Set(data.teams.map(t=>String(t.currentBrszTeamId)));
      if(ids.size!==12)throw new Error('Duplikált csapatazonosító a történeti adatokban.');
      ccWomenHistoryState_.rows=data.teams;
      ccWomenHistoryState_.error='';
    }catch(err){
      ccWomenHistoryState_.error=text(err?.message||'A korábbi idény adatai nem elérhetők.');
      ccWomenHistoryState_.rows=[];
    }finally{
      ccWomenHistoryState_.loading=false;
      ccWomenHistoryState_.loaded=true;
      if(ccRouteIs_('competition','history'))ccRenderWomenHistory_();
    }
  }
  function ccWomenHistoryRows_(){
    const rows=ccWomenHistoryState_.rows.filter(row=>{
      if(ccWomenHistoryState_.scope==='supported')return row.identityStatus.startsWith('supported_');
      if(ccWomenHistoryState_.scope==='review')return row.identityStatus==='review_alias';
      if(ccWomenHistoryState_.scope==='missing')return row.identityStatus==='no_women_i_history';
      return true;
    });
    return rows.sort((a,b)=>(a.historicalOfficialPlace??999)-(b.historicalOfficialPlace??999)
      ||text(a.currentTeam).localeCompare(text(b.currentTeam),'hu'));
  }
  function ccRenderWomenHistory_(){
    if(!ccRouteIs_('competition','history'))return;
    if(ccClubHistoryState_.selected!=='womenI'){ccRenderOtherHistory_();return;}
    if(!ccWomenHistoryState_.loaded&&!ccWomenHistoryState_.loading)
      Promise.resolve().then(ccLoadWomenHistory_);
    const rows=ccWomenHistoryRows_();
    const fmtNumber=(n,d=0)=>Number.isFinite(Number(n))&&n!==null
      ?Number(n).toLocaleString('hu-HU',{minimumFractionDigits:d,maximumFractionDigits:d}):'–';
    const official=(row)=>row.historicalOfficialPlace==null?'–':fmtNumber(row.historicalOfficialPlace)+'.';
    const score=(row)=>row.historicalWins==null||row.historicalLosses==null?'–'
      :fmtNumber(row.historicalWins)+'–'+fmtNumber(row.historicalLosses);
    const sets=(row)=>row.historicalSetsFor==null?'–'
      :fmtNumber(row.historicalSetsFor)+'–'+fmtNumber(row.historicalSetsAgainst);
    const tag=(row)=>CC_WOMEN_HISTORY_STATES_[row.identityStatus]||'Ellenőrzendő';
    const table=rows.map(row=>
      '<tr>'+
      '<td><b>'+esc(row.currentTeam)+'</b>'+
        '<div style="font-size:12px;opacity:.74">'+esc(tag(row))+'</div>'+
        (row.identityStatus==='review_alias'?'<div style="font-size:12px;opacity:.74">Korábbi név: '+esc(row.historicalTeam||'–')+'</div>':'')+'</td>'+
      '<td style="text-align:right">'+esc(official(row))+'</td>'+
      '<td style="text-align:right">'+esc(score(row))+'</td>'+
      '<td style="text-align:right">'+esc(sets(row))+'</td>'+
      '<td style="text-align:right">'+esc(row.historicalLast5Wins===null?'–':fmtNumber(row.historicalLast5Wins)+'/5')+'</td>'+
      '<td style="text-align:right">'+esc(fmtNumber(row.historicalExperimentalElo,1))+'</td>'+
      '</tr>'
    ).join('');
    const opts=[['all','Minden csapat'],['supported','Alátámasztott névegyezések'],
      ['review','Ellenőrzendő névkapcsolatok'],['missing','I. osztályú előzmény nélkül']]
      .map(([v,t])=>'<option value="'+v+'" '+(ccWomenHistoryState_.scope===v?'selected':'')+'>'+t+'</option>').join('');
    const loading=ccWomenHistoryState_.loading||!ccWomenHistoryState_.loaded;
    $('#viewContent').innerHTML=
      ccClubHistoryNav_()+'<div class="page-intro cc-page-header-panel"><div><h2>Statisztika · női Budapest I.</h2>'+
      '<p>A 2026/27-es ellenfelek 2025/26-os teljesítménye. Nem a jelenlegi erősorrend.</p></div>'+
      '<div class="page-actions"><button type="button" class="button quiet" id="ccWomenHistoryRefresh">↻ Frissítés</button></div></div>'+
      '<article class="panel"><div class="panel-head"><h3>2025/26-os bajnoki mérleg</h3>'+
      '<label class="field compact"><span>Csapatok</span><select id="ccWomenHistoryScope">'+opts+'</select></label></div>'+
      '<div style="margin-bottom:12px">Helyezés, mérleg és szettek: hivatalos MRSZ-adatok. Az Elo külön, kísérleti számítás; nem hivatalos és nem győzelmi esély.</div>'+
      (ccWomenHistoryState_.error?'<div class="ms-empty error">'+esc(ccWomenHistoryState_.error)+'</div>':
      loading?'<div class="ms-empty">Korábbi idény adatainak betöltése…</div>':
      '<div class="ms-table-scroll" style="overflow-x:auto"><table class="ms-table"><thead><tr>'+
      '<th>2026/27 csapat</th><th>2025/26 hely</th><th>Gy–V</th><th>Szettek</th>'+
      '<th>Utolsó 5 győzelem</th><th>Kísérleti Elo</th></tr></thead><tbody>'+table+'</tbody></table></div>')+
      '<details style="margin-top:16px"><summary>Az adatok értelmezése</summary><p>A 2025/26-os 129 eredményes női I. osztályú mérkőzésen alapulnak. Az Elo minden csapatnál 1500-ról indul, K=24 értékkel, és nincs előrejelzésre kalibrálva. Az MTK és a Mozdulj névkapcsolata külön ellenőrzést igényel. A Kandó és a Semmelweis nem szerepelt az előző női I. tabellában; más osztály eredményeit nem kevertük ide. Keretfolytonosságot nem igazoltunk.</p></details>'+
      '</article>';
    ccClubHistoryBindNav_();
    $('#ccWomenHistoryScope')?.addEventListener('change',e=>{
      ccWomenHistoryState_.scope=e.target.value;ccRenderWomenHistory_();
    });
    $('#ccWomenHistoryRefresh')?.addEventListener('click',()=>{
      ccWomenHistoryState_.loaded=false;ccWomenHistoryState_.error='';ccWomenHistoryState_.rows=[];
      ccLoadWomenHistory_();
    });
  }


  // BB2 and men's archive audit. Only documented partial secondary-source sample
  // records are shown. These panels intentionally have no Elo and no season totals.
  function ccClubHistoryNav_(){
    return '<div class="segmented" style="margin:0 0 18px;display:flex;flex-wrap:wrap;gap:6px">'+
      CC_CLUB_HISTORY_OPTIONS_.map(([key,label])=>
      '<button type="button" class="button '+(ccClubHistoryState_.selected===key?'primary':'quiet')+'" data-cc-history-team="'+key+'">'+esc(label)+'</button>').join('')+'</div>';
  }
  function ccClubHistoryBindNav_(){
    Array.from(document?.querySelectorAll?.('[data-cc-history-team]')||[]).forEach(btn=>btn.addEventListener('click',()=>{
      const key=text(btn.dataset.ccHistoryTeam);
      if(!CC_CLUB_HISTORY_OPTIONS_.some(opt=>opt[0]===key)||ccClubHistoryState_.selected===key)return;
      ccClubHistoryState_.selected=key;
      if(key==='womenI')ccRenderWomenHistory_();else ccRenderOtherHistory_();
    }));
  }
  async function ccLoadOtherHistory_(){
    if(ccClubHistoryState_.loaded||ccClubHistoryState_.loading)return;
    ccClubHistoryState_.loading=true;
    try{
      const response=await fetch('./data/competition-strength/men-bb2_202627_historical_coverage.json',{cache:'no-store'});
      if(!response.ok)throw Error('A történeti adatlefedettség nem érhető el.');
      const d=await response.json();
      if(d?.schemaVersion!==1||d?.currentSeason!=='2026/27'||d?.historicalSeason!=='2025/26'||
          !Array.isArray(d.teams)||d.teams.length!==2||d.allCompetitionsChecked!==false||
          d.teams.some(x=>x.currentStrengthRating!==null||x.historicalElo!==null||
            x.historicalStanding!==null||x.historicalTotalPlayed!==null||
            !Array.isArray(x.currentOpponents)||x.currentOpponents.length!==7)||
          new Set(d.teams.map(x=>x.key)).size!==2||
          !d.teams.some(x=>x.key==='menB')||!d.teams.some(x=>x.key==='womenIIB'))
        throw Error('A részleges történeti adatok ellenőrzése sikertelen.');
      ccClubHistoryState_.teams=d.teams;
      ccClubHistoryState_.error='';
    }catch(err){
      ccClubHistoryState_.error=text(err?.message||'A történeti adatok nem érhetők el.');
      ccClubHistoryState_.teams=[];
    }finally{
      ccClubHistoryState_.loaded=true;ccClubHistoryState_.loading=false;
      if(ccRouteIs_('competition','history')&&ccClubHistoryState_.selected!=='womenI')ccRenderOtherHistory_();
    }
  }
  function ccRenderOtherHistory_(){
    if(!ccRouteIs_('competition','history'))return;
    if(ccClubHistoryState_.selected==='womenI'){ccRenderWomenHistory_();return;}
    if(!ccClubHistoryState_.loaded&&!ccClubHistoryState_.loading)Promise.resolve().then(ccLoadOtherHistory_);
    const row=ccClubHistoryState_.teams.find(x=>x.key===ccClubHistoryState_.selected);
    const isWomen=ccClubHistoryState_.selected==='womenIIB';
    const title=isWomen?'Női BB2':'Férfi';
    const stateLabel=isWomen?'Részleges 2025/26-os eredményadatok':'Korábbi idény – ellenőrzés alatt';
    const sample=row?.candidateHistoricalResults||[];
    const date=s=>/^\\d{4}-\\d{2}-\\d{2}$/.test(text(s))?text(s).replace(/-/g,'. ')+'.':'–';
    const matches=sample.map(x=>'<tr>'+
      '<td>'+esc(date(x.date))+'</td><td>'+esc(x.home)+'</td>'+
      '<td style="text-align:center"><b>'+esc(x.homeSets)+'–'+esc(x.awaySets)+'</b></td>'+
      '<td>'+esc(x.away)+'</td></tr>').join('');
    const warnings=(row?.warnings||[]).map(x=>'<p style="margin:8px 0">'+esc(x)+'</p>').join('');
    const identities=(row?.currentOpponents||[]).map(x=>'<tr><td>'+esc(x.team)+'</td>'+
      '<td>'+esc(x.brszId??'–')+'</td>'+
      '<td>'+esc(x.identity==='verified_archive_id'?'Archív BRSZ azonosító':
        x.identity==='two_possible_archive_ids'?'Ütköző azonosítók: '+(x.candidateBrszIds||[]).join(', '):
        'Még nem igazolt azonosító')+'</td></tr>').join('');
    const officialPhases=(row?.officialPhaseSources||[]).map(p=>{
      const source=text(p.officialEvidenceURL);
      const url=source.startsWith('https://www.hunvolley.info/')
        ?'<a target="_blank" rel="noopener noreferrer" href="'+esc(source)+'">MRSZ jegyzőkönyv</a>'
        :'–';
      const checked=p.fullStandingsVerified===true&&p.fullFixtureListVerified===true;
      return '<tr><td>'+esc(p.phaseLabel||p.phaseKey)+'</td>'+
        '<td>'+esc(p.competitionSubId??'–')+'</td>'+
        '<td>'+esc(checked?'Ellenőrizve':'Teljes kiírás és tabella hiányzik')+'</td>'+
        '<td>'+url+'</td></tr>';
    }).join('');
    const phaseSection=officialPhases?
      '<article class="panel" style="margin-top:14px"><div class="panel-head"><h3>Hivatalos források · 2025/26</h3></div>'+
      '<div class="ms-table-scroll" style="overflow-x:auto"><table class="ms-table">'+
      '<thead><tr><th>Versenyszakasz</th><th>MRSZ kód</th><th>Adatlefedettség</th><th>Bizonyíték</th></tr></thead>'+
      '<tbody>'+officialPhases+'</tbody></table></div>'+
      '<p style="margin-top:10px">Az egyedi jegyzőkönyv nem helyettesíti a teljes kiírást és tabellát. Az áthozott eredményt nem számítjuk kétszer.</p></article>':'';
    $('#viewContent').innerHTML=
      ccClubHistoryNav_()+
      '<div class="page-intro cc-page-header-panel"><div><h2>Statisztika · '+title+'</h2>'+
      '<p>'+stateLabel+'. Nem jelenlegi csapaterősség, és nem teljes bajnoki statisztika.</p></div>'+
      '<div class="page-actions"><button class="button quiet" type="button" id="ccOtherHistoryRefresh">↻ Frissítés</button></div></div>'+
      (!row?(ccClubHistoryState_.error?'<article class="panel"><p>'+esc(ccClubHistoryState_.error)+'</p></article>':
        '<article class="panel"><p>Korábbi idény adatainak betöltése…</p></article>'):
      '<article class="panel"><div class="panel-head"><h3>Forráslefedettség · 2025/26</h3></div>'+
        '<p>Jelenlegi bajnokság: <b>'+esc(row.currentLeague)+'</b>.</p>'+
        (row.historicalGroupCandidate?'<p>Korábbi bajnokság a talált mintában: <b>'+esc(row.historicalGroupCandidate)+'</b>.</p>':'')+
        '<p><b>A teljes 2025/26-os tabella és meccslista még nincs hitelesítve. Ezért nincs becsült Elo, teljes mérleg vagy helyezés.</b></p>'+warnings+'</article>'+
      (matches?'<article class="panel" style="margin-top:14px"><div class="panel-head"><h3>Talált mérkőzések · részleges, másodlagos forrás</h3><span>'+sample.length+' mérkőzés</span></div>'+
        '<div class="ms-table-scroll" style="overflow-x:auto"><table class="ms-table"><thead><tr><th>Időpont</th><th>Hazai</th><th>Eredmény</th><th>Vendég</th></tr></thead><tbody>'+matches+'</tbody></table></div>'+
        '<p style="margin-top:12px"><a href="https://sportsevents24.com/federation/90/volleyball-hungary-hungarian-volleyball-federation" target="_blank" rel="noopener noreferrer">Forrás: másodlagos eseménylista</a> · az eredmények további szövetségi ellenőrzést igényelnek.</p></article>':'')+
      '<article class="panel" style="margin-top:14px"><div class="panel-head"><h3>2026/27 csapatok · forrásazonosítás</h3></div>'+
      '<div class="ms-table-scroll" style="overflow-x:auto"><table class="ms-table"><thead><tr><th>Csapat</th><th>BRSZ ID</th><th>Állapot</th></tr></thead><tbody>'+identities+'</tbody></table></div></article>'+phaseSection);
    ccClubHistoryBindNav_();
    $('#ccOtherHistoryRefresh')?.addEventListener('click',()=>{
      ccClubHistoryState_.loaded=false;ccClubHistoryState_.teams=[];ccClubHistoryState_.error='';
      ccLoadOtherHistory_();
    });
  }

  function renderModule(){
    const m=state.module;
    if(m==='settings'){if(!can('settings')){renderPermissionDenied();return}renderSettings();return}
    if(m==='planning'){if(!canMainSection_('planning')){renderPermissionDenied();return}renderTrainingPlannerParity();return}
    if(m==='finance'){if(!canMainSection_('finance')){renderPermissionDenied();return}renderFinance();return}
    if(!canRoute(state.area,m)){renderPermissionDenied();return}
    if(m==='overview'){renderOverview();return}
    if(m==='calendar'){renderCalendar();return}
    if(state.area==='competition'&&m==='teams'){renderTeams();return}
    if(state.area==='competition'&&m==='players'){renderPlayers();return}
    if(state.area==='competition'&&m==='notifications'){renderNotifications();return}
    if(state.area==='competition'&&m==='trainings'){renderCompetitionTrainingCards_();return}
    if(state.area==='competition'&&m==='matches'){renderCompetitionMatchCards_();return}
    if(state.area==='competition'&&m==='standings'){renderManagerStandings_();return}
    if(state.area==='competition'&&m==='history'){ccRenderWomenHistory_();return}
    if(state.area==='competition'&&m==='courts'){ccRenderCourtImpact_();return}
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
  // Keep all of today's training events accessible until local midnight, including
  // already-finished sessions that still need attendance or schedule edits.
  // In the combined view, the calendar archive must not duplicate today's live rows.
  function massVisibleTrainingRows_(live,archive,mode='upcoming',today=localDateKey(new Date()),dateFilter=''){
    const current=(Array.isArray(live)?live:[]).map(e=>({...e,__archived:false}));
    const upcoming=current.filter(e=>{const start=eventStart(e);return start&&localDateKey(start)>=today});
    const past=(Array.isArray(archive)?archive:[]).map(e=>({...e,__archived:true}));
    // A specific date is authoritative, regardless of the previous period filter.
    // The archived snapshot wins for elapsed training days; no duplicate row.
    if(dateFilter){
      const byId=new Map();
      [...past,...current].forEach(e=>{
        const start=eventStart(e);if(start&&localDateKey(start)===dateFilter)byId.set(text(e.eventId||e.id),e);
      });
      return Array.from(byId.values()).sort((a,b)=>eventStart(a)-eventStart(b));
    }
    if(mode==='past')return past.sort((a,b)=>eventStart(b)-eventStart(a));
    const seen=new Set(upcoming.map(e=>text(e.eventId||e.id)));
    const rows=mode==='all'?[...upcoming,...past.filter(e=>!seen.has(text(e.eventId||e.id)))]:upcoming;
    return rows.sort((a,b)=>eventStart(a)-eventStart(b));
  }
  function renderMassTrainings(){if(!ccRouteIs_('mass','trainings'))return;
    state.massTrainingFiltersOpen=filterOpen_('mass.trainings',state.massTrainingFiltersOpen);
    const mode=state.massTrainingPeriod||'upcoming',rows=massVisibleTrainingRows_(state.massTrainings,state.massArchiveEvents,mode,localDateKey(new Date()),state.massTrainingDate),canEdit=canAction('mass.trainings','edit'),loadError=text(state.massLoadError),active=mode!=='upcoming'||!!state.massTrainingDate;
    $('#viewContent').innerHTML=`<article class="panel legacy-mass-panel"><div class="panel-head mass-training-page-head"><div><h3>Edzések</h3><p>${mode==='past'?'Elmúlt Tömegsport alkalmak.':mode==='all'?'Aktuális és elmúlt alkalmak.':'Mai és közelgő Tömegsport edzések.'}</p></div><div class="toolbar-actions mass-training-page-actions cc-icon-toolbar"><button class="matrix-filter-toggle icon-only cc-toolbar-icon ${state.massTrainingFiltersOpen?'open':''} ${active?'has-filter':''}" id="massTrainingFiltersToggle" type="button" aria-expanded="${state.massTrainingFiltersOpen?'true':'false'}" aria-label="Szűrők" title="Szűrők"><span class="triangle-icon"></span></button><button class="cc-toolbar-text" id="massTrainingsPastQuick" type="button" aria-pressed="${mode==='past'}">${mode==='past'?'Mai és közelgő':'Elmúlt'}</button>${active?'<button class="filter-reset cc-toolbar-reset" id="massTrainingFilterReset" type="button" aria-label="Szűrők törlése" title="Szűrők törlése">×</button>':''}${canEdit?'':''}<button class="cc-toolbar-icon cc-refresh-icon" id="massTrainingsRefresh" type="button" aria-label="Frissítés" title="Frissítés">↻</button></div></div><div class="filter-panel mass-training-filter-panel" id="massTrainingFiltersPanel" ${state.massTrainingFiltersOpen?'':'hidden'}><label class="field compact"><span>Időszak</span><select id="massTrainingPeriod"><option value="upcoming" ${mode==='upcoming'?'selected':''}>Mai és közelgő</option><option value="past" ${mode==='past'?'selected':''}>Elmúlt edzések</option><option value="all" ${mode==='all'?'selected':''}>Mind</option></select></label><label class="field compact"><span>Adott nap</span><input id="massTrainingDate" type="date" value="${esc(state.massTrainingDate||'')}" aria-label="Edzés dátuma"></label></div>${canEdit?`<button id="massTrainingAdd" class="button primary mass-inline-create-action" type="button" style="display:block;width:100%;margin:14px 0;padding:15px;font-weight:750;background:#efba23;color:#171717;border:0;border-radius:10px">+ ÚJ EDZÉS LÉTREHOZÁSA</button><section id="massInlineEditorHost" hidden aria-label="Edzés létrehozása vagy szerkesztése"></section>`:""}${loadError?`<div class="migration-note error"><b>A Tömegsport modul nem tölthető be.</b><span>${esc(loadError)}</span></div>`:`<div class="legacy-mass-training-list">${rows.map(e=>massLegacyTrainingRow(e,{archived:!!e.__archived})).join('')||emptyInline(state.massTrainingDate?'Az adott napon nincs Tömegsport edzés.':mode==='past'?'Nincs archivált Tömegsport edzés.':'Nincs mai vagy közelgő Tömegsport edzés.')}</div>${canEdit?'':'<div class="migration-note"><b>Megtekintési mód:</b> ehhez a fiókhoz nincs Tömegsport szerkesztési jogosultság.</div>'}`}</article>`;
    const toggle=$('#massTrainingFiltersToggle'),panel=$('#massTrainingFiltersPanel');toggle?.addEventListener('click',()=>{const open=setFilterOpen_('mass.trainings',!state.massTrainingFiltersOpen);state.massTrainingFiltersOpen=open;toggle.setAttribute('aria-expanded',String(open));toggle.classList.toggle('open',open);if(panel)panel.hidden=!open;ccBlurPointerControl_(toggle)});
    $('#massTrainingPeriod')?.addEventListener('change',e=>{state.massTrainingPeriod=e.target.value;state.massTrainingDate='';afterNativePicker(e.target,renderMassTrainings)});
    $('#massTrainingDate')?.addEventListener('change',e=>{state.massTrainingDate=e.target.value;state.massTrainingPeriod=state.massTrainingDate?'all':state.massTrainingPeriod;afterNativePicker(e.target,renderMassTrainings)});
    $('#massTrainingsPastQuick')?.addEventListener('click',()=>{state.massTrainingPeriod=state.massTrainingPeriod==='past'?'upcoming':'past';state.massTrainingDate='';renderMassTrainings()});
    $('#massTrainingFilterReset')?.addEventListener('click',()=>{state.massTrainingPeriod='upcoming';state.massTrainingDate='';renderMassTrainings()});
    $('#massTrainingAdd')?.addEventListener('click',()=>openMassEventEditor_(null));
    $('#massTrainingsRefresh')?.addEventListener('click',async()=>{try{status('Tömegsport edzések frissítése…');await Promise.all([loadMassTrainings(),loadMassArchive().catch(()=>{})]);renderMassTrainings();status('Frissítve.','success')}catch(err){state.massLoadError=text(err?.message||'A Tömegsport modul nem tölthető be.');renderMassTrainings();status(state.massLoadError,'error')}});bindMassLegacyRows();
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
  async function verifyMassAttendanceReadback_(eventId,bookingId,expectedAttendance){
    const rows=await rpc('cc_manager_mass_attendance_snapshot_r1_v1',{p_event_id:text(eventId)});
    const list=Array.isArray(rows)?rows:[],saved=list.find(r=>text(r.bookingId||r.id)===text(bookingId));
    if(!saved)throw new Error('ATTENDANCE_READBACK_ROW_MISSING');
    const actual=text(saved.attendance)||'NINCS RÖGZÍTVE';
    if(actual!==expectedAttendance)throw new Error(`ATTENDANCE_READBACK_MISMATCH: ${actual}`);
    updateMassAttendanceCache_(eventId,bookingId,saved);
    return saved;
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
      const result=await rpc('cc_manager_mass_attendance_r1_v1',{p_booking_id:bookingId,p_attendance:model.db});
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
      if(slider.dataset.massSliderBound==='1')return;slider.dataset.massSliderBound='1';
      const states=['yes','none','no'];
      const current=()=>states.includes(slider.dataset.sliderState)?slider.dataset.sliderState:(slider.classList.contains('yes')?'yes':slider.classList.contains('no')?'no':'none');
      const modelFor=state=>state==='yes'?massAttendanceBySliderValue_(-1):state==='no'?massAttendanceBySliderValue_(1):massAttendanceBySliderValue_(0);
      const control=slider.closest('.mass-attendance-control'),stateEl=control?.querySelector('[data-mass-attendance-state]');
      let dragStartX=null,dragStartState='none',dragging=false;

      const commit=async(nextState)=>{
        const bookingId=text(slider.dataset.massAttendance);if(!bookingId||!canAction('mass.trainings','edit'))return;
        if(!states.includes(nextState)||nextState===current()||state.massAttendanceBusy.has(bookingId))return;
        const previous=current(),model=modelFor(nextState);
        slider.dataset.sliderPrevious=previous;
        ccSetPlayerStyleSliderState_(slider,nextState);
        ccSyncMassAttendanceCardState_(slider,model);refreshMassAttendanceSummary_();
        state.massAttendanceBusy.add(bookingId);slider.dataset.sliderDisabled='1';control?.classList.add('is-saving');if(stateEl)stateEl.textContent='Mentés…';
        try{
          const result=await rpc('cc_manager_mass_attendance_r1_v1',{p_booking_id:bookingId,p_attendance:model.db});
          const saved=massAttendanceModel_(result?.attendance||model.db),savedState=saved.key==='present'?'yes':saved.key==='noshow'?'no':'none';
          ccSetPlayerStyleSliderState_(slider,savedState);slider.dataset.sliderPrevious=savedState;
          ccSyncMassAttendanceCardState_(slider,saved);updateMassAttendanceCache_(eventId,bookingId,result||{});refreshMassAttendanceSummary_();
          if(stateEl)stateEl.textContent='Mentve.';status(`${text(slider.closest('.mass-attendance-card')?.querySelector('.mass-attendance-person-copy b')?.textContent)||'Sportoló'} · ${saved.label}`,'success');
        }catch(err){
          ccSetPlayerStyleSliderState_(slider,previous);ccSyncMassAttendanceCardState_(slider,modelFor(previous));refreshMassAttendanceSummary_();
          if(stateEl)stateEl.textContent='A mentés sikertelen · az előző állapot visszaállítva.';status(err?.message||'A jelenlét mentése sikertelen.','error');
        }finally{state.massAttendanceBusy.delete(bookingId);delete slider.dataset.sliderDisabled;control?.classList.remove('is-saving')}
      };

      slider.querySelectorAll('[data-slider-action]').forEach(btn=>btn.addEventListener('click',e=>{
        e.preventDefault();e.stopPropagation();
        const map={yes:'yes',none:'none',no:'no'};void commit(map[btn.dataset.sliderAction]||'none');
      }));

      slider.addEventListener('pointerdown',e=>{
        if(slider.dataset.sliderDisabled==='1'||e.button!==0)return;
        dragStartX=e.clientX;dragStartState=current();dragging=false;
      },{passive:true});
      slider.addEventListener('pointermove',e=>{
        if(dragStartX==null||slider.dataset.sliderDisabled==='1')return;
        const dx=e.clientX-dragStartX;if(Math.abs(dx)>=14)dragging=true;
      },{passive:true});
      slider.addEventListener('pointerup',e=>{
        if(dragStartX==null)return;
        const dx=e.clientX-dragStartX,start=dragStartState;dragStartX=null;
        if(!dragging)return;
        dragging=false;
        const i=states.indexOf(start),next=dx>0?states[Math.min(2,i+1)]:states[Math.max(0,i-1)];
        void commit(next);
      },{passive:true});
      slider.addEventListener('pointercancel',()=>{dragStartX=null;dragging=false},{passive:true});
    });
  }
  function massPersonSort_(a,b){return comparePlayersBySurname_(a,b)}
  function massDetailUiFor_(eventId){const key=text(eventId);if(!state.massDetailUi.has(key))state.massDetailUi.set(key,{sort:'surname-asc',pass:'all',open:[],scrollTop:0,filtersOpen:false,cancelledOpen:false});return state.massDetailUi.get(key)}
  function massEventMonth_(e){const d=safeDate(e?.startsAt||e?.eventDate);if(!d)return'';return new Intl.DateTimeFormat('sv-SE',{year:'numeric',month:'2-digit',timeZone:'Europe/Budapest'}).format(d)}
  function massPassRecordForBooking_(r){
    const pn=text(r?.passNumber).toLowerCase(),email=text(r?.email).toLowerCase();if(!pn&&!email)return null;
    const rows=(state.massPasses||[]).filter(p=>(pn&&text(p.passNumber).toLowerCase()===pn)||(!pn&&email&&text(p.email).toLowerCase()===email));
    rows.sort((a,b)=>{const ae=text(a.email).toLowerCase()===email?1:0,be=text(b.email).toLowerCase()===email?1:0;if(ae!==be)return be-ae;return (safeDate(b.purchaseDate)?.getTime()||0)-(safeDate(a.purchaseDate)?.getTime()||0)});
    return rows[0]||null
  }
  function massPassInfo_(r,e){
    const matched=massPassRecordForBooking_(r),passNumber=text(r?.passNumber||matched?.passNumber),month=text(r?.passMonth||r?.validMonth||r?.currentPassMonth||matched?.validMonth),rawStatus=text(r?.passStatus),normalized=rawStatus.toLocaleUpperCase('hu-HU'),eventMonth=massEventMonth_(e),personType=text(r?.personType||r?.bookingType||r?.type).toLocaleUpperCase('hu-HU'),exempt=/FIRST|ELSŐ|ELSO|GUEST|VENDÉG|VENDEG/.test(personType);
    const explicitlyInvalid=/ÉRVÉNYTELEN|ERVENYTELEN|HIB|ELUTAS/.test(normalized),waiting=/ELLENŐR|ELLENORIZ|VÁR|VAR|PENDING|CHECK/.test(normalized),monthMismatch=!!(month&&eventMonth&&month!==eventMonth),missing=!passNumber&&!exempt,unmatched=!!passNumber&&!month&&!matched;
    const needsCheck=explicitlyInvalid||waiting||monthMismatch||missing||unmatched;
    const valid=!needsCheck&&(/ÉRVÉNYES|ERVENYES|OK|VALID/.test(normalized)||!!month||exempt);
    let label=rawStatus||'';if(monthMismatch)label='Hónapeltérés';else if(explicitlyInvalid)label='Érvénytelen';else if(waiting||unmatched||missing)label='Ellenőrzendő';else if(valid&&!label)label='Érvényes';
    return {passNumber,month,eventMonth,label,needsCheck,valid,exempt,matched}
  }
  function captureMassDetailUi_(eventId,root=$('#entityDialogBody')){
    const ui=massDetailUiFor_(eventId),dialog=$('#entityDialog');if(root){ui.open=Array.from(root.querySelectorAll('.mass-attendance-card:not(.is-collapsed)')).map(x=>text(x.dataset.bookingId)).filter(Boolean);ui.sort=text(root.querySelector('#massRosterSort')?.value||ui.sort);ui.pass=text(root.querySelector('#massRosterPassFilter')?.value||ui.pass);ui.scrollTop=Math.max(root.scrollTop||0,dialog?.scrollTop||0);const cancelled=root.querySelector('#massCancelledPanel');if(cancelled)ui.cancelledOpen=cancelled.open}return ui
  }
  function restoreMassDetailUi_(eventId,root=$('#entityDialogBody')){
    const ui=massDetailUiFor_(eventId);if(!root)return;const open=new Set(ui.open||[]);root.querySelectorAll('.mass-attendance-card').forEach(card=>{if(!open.has(text(card.dataset.bookingId)))return;const btn=card.querySelector('[data-mass-person-toggle]'),details=card.querySelector('[data-mass-person-details]');if(btn&&details){details.hidden=false;card.classList.remove('is-collapsed');btn.setAttribute('aria-expanded','true');btn.classList.add('open')}});const all=root.querySelector('#massToggleAllPeople');if(all){const toggles=Array.from(root.querySelectorAll('[data-mass-person-toggle]'));all.textContent=toggles.length&&toggles.every(x=>x.getAttribute('aria-expanded')==='true')?'Mind becsuk':'Mind kinyit'}requestAnimationFrame(()=>{const dialog=$('#entityDialog');if(root.scrollTop!==undefined)root.scrollTop=ui.scrollTop||0;if(dialog&&dialog.scrollTop!==undefined)dialog.scrollTop=ui.scrollTop||0})
  }
  function massBookingCard_(r,eventLevel='',event={}){
    const attendance=text(r.attendance)||'NINCS RÖGZÍTVE',sub=safeDate(r.submittedAt),level=text(r.athleteLevel||r.extraLevel||eventLevel||''),color=massLevelColor({level:level||eventLevel||'Edzés'}),attendanceModel=massAttendanceModel_(attendance);
    const bookingStatus=text(r.bookingStatus||r.status)||'AKTÍV',pass=massPassInfo_(r,event),bookingId=esc(r.bookingId||r.id||'');
    return `<article class="mass-attendance-card legacy-mass-roster-card is-collapsed" data-booking-id="${bookingId}" data-attendance-key="${esc(attendanceModel.key)}" data-pass-check="${pass.needsCheck?'needs-check':(pass.valid?'valid':'neutral')}" style="--mass-person-color:${esc(color)};--mass-person-rgb:${esc(hexRgb(color))}">
      <button class="mass-person-toggle" type="button" data-mass-person-toggle aria-expanded="false"><span class="triangle-icon"></span><span class="mass-attendance-person-copy"><span class="mass-person-name-line"><b>${esc(r.name||'Névtelen')}</b>${pass.needsCheck?'<i class="mass-inline-flag pass-check" title="Bérlet ellenőrzendő">!</i>':''}${/FIRST|ELSŐ|ELSO/.test(text(r.personType||r.bookingType||r.type).toLocaleUpperCase('hu-HU'))?'<i class="mass-inline-flag first-training" title="Első edzés">@</i>':''}</span><small>${esc(level||'Sportoló')}</small></span></button>
      ${massAttendanceSliderBase_(r)}
      <div class="mass-person-details" data-mass-person-details hidden>
        <div class="legacy-mass-roster-meta compact-three"><span><small>Email</small><b>${esc(r.email||'–')}</b></span><span><small>Jelentkezés</small><b>${sub?esc(fmtDate(sub)+' '+fmtTime(sub)):'–'}</b></span><span><small>Állapot</small><b>${esc(bookingStatus)}</b></span></div>
        <div class="legacy-mass-roster-badges"><span class="legacy-mass-badge ${pass.needsCheck?'pass-error':''}">Bérlet: ${esc(pass.passNumber||'–')}${pass.month?` · ${esc(pass.month)}`:''}</span>${pass.label?`<span class="legacy-mass-badge ${pass.needsCheck?'pass-error':(pass.valid?'pass-ok':'')}">${esc(pass.label)}</span>`:''}${level?`<span class="legacy-mass-badge soft">${esc(level)}</span>`:''}</div>
        ${r.note?`<div class="mass-attendance-note"><b>Megjegyzés:</b> ${esc(r.note)}</div>`:''}
      </div>
    </article>`;
  }
  function massCancellationStatus_(r){
    const type=text(r?.cancellationType).toLocaleUpperCase('hu-HU'),status=text(r?.bookingStatus).toLocaleUpperCase('hu-HU');
    if(type==='ADMIN TÖRLÉS')return 'Adminisztrátori törlés';
    if(type==='KÉSŐI'||status==='KÉSŐN LEMONDVA')return 'Késői lemondás';
    return 'Időben lemondva';
  }
  function massCancellationPanelHtml_(records,{compact=false,unavailable=false,open=false}={}){
    const rows=(Array.isArray(records)?records:[]).slice().sort((a,b)=>(safeDate(b.cancelledAt)?.getTime()||0)-(safeDate(a.cancelledAt)?.getTime()||0));
    const cards=rows.map(r=>{
      const stamp=safeDate(r.cancelledAt),when=stamp?fmtDate(stamp)+' '+fmtTime(stamp):'Időpont nincs rögzítve',label=massCancellationStatus_(r);
      return '<div class="mass-cancellation-person'+(label==='Adminisztrátori törlés'?' admin':label==='Késői lemondás'?' late':'')+'">'
        +'<span class="mass-cancellation-identity"><b>'+esc(r.name||'Névtelen')+'</b>'+(compact?'':'<small>'+esc(r.email||'–')+'</small>')+'</span>'
        +'<span class="mass-cancellation-meta"><b>'+esc(label)+'</b><small>'+esc(when)+'</small></span></div>';
    }).join('');
    return '<details class="mass-cancellations-panel'+(compact?' compact':'')+'" id="'+(compact?'massInlineCancelledPanel':'massCancelledPanel')+'" '+(open?'open':'')+'>'
      +'<summary><span>Lemondások és törlések</span><b>'+(unavailable?'–':rows.length)+'</b><span class="triangle-icon" aria-hidden="true"></span></summary>'
      +'<div class="mass-cancellation-list">'+(unavailable?'<p class="mass-cancellation-empty">A lemondási adatok jelenleg nem érhetők el.</p>'
        :cards||'<p class="mass-cancellation-empty">Nincs lemondás vagy adminisztrátori törlés.</p>')+'</div></details>';
  }
  function massWaitlistCard_(r){
    const sub=safeDate(r.submittedAt),statusValue=text(r.status||r.waitlistStatus)||'VÁRAKOZIK',matched=massPassRecordForBooking_(r),month=text(r.passMonth||r.validMonth||r.currentPassMonth||matched?.validMonth);
    return `<article class="mass-wait-card">
      <div><b>${esc(r.name||'Névtelen')}</b><small>${esc(r.email||'–')}</small></div>
      <span><small>Bérlet</small><b>${esc(r.passNumber||'–')}${month?` · ${esc(month)}`:''}</b><i>${esc(r.passStatus||'')}</i></span>
      <span><small>Állapot</small><b>${esc(statusValue)}</b><i>${sub?esc(fmtDate(sub)+' '+fmtTime(sub)):''}</i></span>
    </article>`;
  }
  function massEventPayloadFromForm_(existing={}){
    const date=$('#meDate')?.value,
      start=ccNormalizeTime24_($('#meStart')?.value),
      end=ccNormalizeTime24_($('#meEnd')?.value),
      session=text($('#meSession')?.value||existing.sessionType||'TÖMEGSPORT').toUpperCase(),
      capacity=Number($('#meCapacity')?.value||0),
      color=text($('#meColor')?.value||existing.color||'#f7b700');
    if(!date||!start||!end)throw new Error('A dátum, kezdés és befejezés kötelező.');
    if(end<=start)throw new Error('A befejezésnek később kell lennie a kezdésnél.');
    const payload={eventDate:date,startTime:start,endTime:end,level:text($('#meLevel')?.value),
      court:text($('#meCourt')?.value),capacity,cancellationHours:Number($('#meCancelHours')?.value||0),
      active:$('#meActive')?.checked!==false,sessionType:session,
      oldLimit:0,newLimit:capacity,publicRegistrationActive:session!=='VERSENYSPORT',
      teamId:'',visibility:'PUBLIC',seriesId:text(existing.seriesId||''),recurrenceRule:'',
      seriesEnd:null,exceptionType:'',eventType:'EDZÉS',color};
    if(text(existing.eventId||existing.id)){
      // Hidden settings are preserved at the database by the safe edit RPC.
      // The color picker shows a fallback for null colors; an unchanged fallback
      // must not write a new color to the existing event.
      delete payload.oldLimit;
      delete payload.newLimit;
      delete payload.publicRegistrationActive;
      delete payload.teamId;
      delete payload.visibility;
      const shownColor=text(existing.color||massLevelColor(existing)||'#f7b700');
      if(color.toLowerCase()===shownColor.toLowerCase())delete payload.color;
    }
    return payload;
  }
  async function openMassEventEditor_(eventId=null){if(!canAction('mass.trainings','edit')){status('Nincs Tömegsport szerkesztési jogosultságod.','error');return}let data=null,e={};if(eventId){data=await loadMassEventDetail(eventId,{force:true});e=data?.event||{}}const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='TÖMEGSPORT · EDZÉS · SZERKESZTÉS';title.textContent=eventId?'Edzés szerkesztése':'Új edzés létrehozása';const st=safeDate(e.startsAt)||new Date(),en=safeDate(e.endsAt)||new Date(st.getTime()+90*60000);body.innerHTML=`<form id="massEventForm" class="action-form"><div class="action-form-grid"><label class="field"><span>Dátum</span><input id="meDate" type="date" value="${esc(ccDateInputValue_(st))}" required></label><label class="field cc-native-time-field"><span>Kezdés</span><input id="meStart" class="cc-time24-input" type="text" inputmode="text" pattern="(?:[01][0-9]|2[0-3]):[0-5][0-9]" maxlength="5" placeholder="HH:MM" title="24 órás időformátum (pl. 19:30)" autocomplete="off" value="${esc(ccTimeInputValue_(st))}" required></label><label class="field cc-native-time-field"><span>Befejezés</span><input id="meEnd" class="cc-time24-input" type="text" inputmode="text" pattern="(?:[01][0-9]|2[0-3]):[0-5][0-9]" maxlength="5" placeholder="HH:MM" title="24 órás időformátum (pl. 19:30)" autocomplete="off" value="${esc(ccTimeInputValue_(en))}" required></label><label class="field"><span>Szint</span><select id="meLevel"><option value="KEZDŐ" ${text(e.level).toUpperCase()==='KEZDŐ'?'selected':''}>Kezdő</option><option value="KÖZÉPHALADÓ" ${text(e.level).toUpperCase()==='KÖZÉPHALADÓ'?'selected':''}>Középhaladó</option><option value="HALADÓ" ${text(e.level).toUpperCase()==='HALADÓ'?'selected':''}>Haladó</option></select></label><label class="field"><span>Pálya</span><input id="meCourt" value="${esc(e.court||'')}"></label><label class="field"><span>Férőhely</span><input id="meCapacity" type="number" min="1" max="40" value="${esc(e.capacity??e.totalLimit??18)}"></label><label class="field"><span>Lemondási határ (óra)</span><input id="meCancelHours" type="number" min="0" max="72" step="0.5" value="${esc(e.cancellationHours??6)}"></label><label class="field"><span>Típus</span><select id="meSession"><option value="TÖMEGSPORT" ${text(e.sessionType).toUpperCase()!=='SPORT7'?'selected':''}>Tömegsport</option><option value="SPORT7" ${text(e.sessionType).toUpperCase()==='SPORT7'?'selected':''}>SPORT7</option></select></label><label class="field"><span>Szín</span><input id="meColor" type="color" value="${esc(e.color||massLevelColor(e)||'#f7b700')}"></label></div><label class="action-checkbox"><input id="meActive" type="checkbox" ${e.active===false?'':'checked'}> <span>Aktív edzés</span></label>${!eventId?`<div class="action-form-repeat"><label><input id="meRepeat" type="checkbox"> Hetente ismétlődjön</label><label class="field compact"><span>Ismétlés vége</span><input id="meRepeatEnd" type="date" disabled></label></div>`:''}<div class="dialog-action-row"><button type="button" class="button quiet" id="meCancel">Mégse</button>${eventId?'<button type="button" class="button danger" id="meDelete">Törlés</button>':''}<button type="submit" class="button primary" id="meSave">Mentés</button></div></form>`;const host=$('#massInlineEditorHost');if(!host){status('Az edzésszerkesztő felülete nem érhető el.','error');return;}const form=body.querySelector('#massEventForm');host.innerHTML=`<style>#massInlineEditorHost{margin:16px 0 22px;background:#fff;color:#202020;border:1px solid #ddd;border-radius:14px;padding:clamp(16px,2.5vw,28px);box-shadow:0 8px 26px #00000012}#massInlineEditorHost h4{margin:0 0 20px;font-size:1.25rem;color:#202020}#massInlineEditorHost .action-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 22px}#massInlineEditorHost .field{min-width:0}#massInlineEditorHost .field:nth-child(8){order:-9}#massInlineEditorHost .field:nth-child(1){order:-8}#massInlineEditorHost .field:nth-child(4){order:-7}#massInlineEditorHost .field:nth-child(2){order:-6}#massInlineEditorHost .field:nth-child(3){order:-5}#massInlineEditorHost .field:nth-child(5){order:-4}#massInlineEditorHost .field:nth-child(6){order:-3}#massInlineEditorHost .field:nth-child(7){order:-2}#massInlineEditorHost .field:nth-child(9){order:-1}#massInlineEditorHost .dialog-action-row{display:flex;justify-content:flex-end;gap:10px;margin-top:20px;flex-wrap:wrap}#massInlineEditorHost input,#massInlineEditorHost select{max-width:100%}@media(max-width:650px){#massInlineEditorHost .action-form-grid{grid-template-columns:minmax(0,1fr)}#massInlineEditorHost{padding:16px}}</style><h4>${eventId?'Edzés szerkesztése':'Új edzés létrehozása'}</h4>`;host.appendChild(form);host.hidden=false;if(d.open)ccCloseEntityDialog_();const closeInline=()=>{host.innerHTML='';host.hidden=true};host.scrollIntoView({block:'nearest',behavior:'smooth'});$('#meCancel')?.addEventListener('click',closeInline);$('#meRepeat')?.addEventListener('change',ev=>{if($('#meRepeatEnd'))$('#meRepeatEnd').disabled=!ev.target.checked});$('#massEventForm')?.addEventListener('submit',async ev=>{ev.preventDefault();const btn=$('#meSave');if(btn)btn.disabled=true;try{const base=massEventPayloadFromForm_(e);if(eventId){await rpc('cc_manager_mass_event_save_safe_v2',{p_event_id:eventId,p_payload:base});if(base.active!==e.active)await rpc('cc_manager_mass_event_set_active_v1',{p_event_id:eventId,p_active:base.active})}else{const repeat=$('#meRepeat')?.checked===true,endDate=text($('#meRepeatEnd')?.value),dates=[base.eventDate],series=repeat&&window.crypto?.randomUUID?window.crypto.randomUUID():'';if(repeat){if(!endDate||endDate<base.eventDate)throw new Error('Adj meg érvényes ismétlési végdátumot.');let cur=new Date(`${base.eventDate}T12:00:00`),last=new Date(`${endDate}T12:00:00`);while(dates.length<26){cur=new Date(cur);cur.setDate(cur.getDate()+7);if(cur>last)break;dates.push(localDateKey(cur))}}const payloads=dates.map(day=>({...base,eventDate:day,seriesId:series,recurrenceRule:repeat?'WEEKLY':'',seriesEnd:repeat?endDate:null}));if(repeat)await rpc('cc_manager_mass_event_series_create_v1',{p_payloads:payloads});else await rpc('cc_manager_mass_event_save_v1',{p_event_id:null,p_payload:payloads[0]})}state.massDetailCache.clear();const reload=[loadMassTrainings(),loadMassArchive()];if(can('mass.calendar'))reload.push(loadMassCalendar().catch(err=>console.warn('Mass calendar refresh unavailable',err)));await Promise.all(reload);closeInline();renderMassTrainings();status('Tömegsport edzés mentve.','success')}catch(err){console.error(err);status(err.message||'Az edzés mentése sikertelen.','error');if(btn)btn.disabled=false}});$('#meDelete')?.addEventListener('click',async()=>{if(!eventId||!window.confirm('Biztosan törlöd ezt az edzést? Csak olyan jövőbeli edzés törölhető, amelynek nincs jelentkezési/várólista előzménye.'))return;try{await rpc('cc_manager_mass_event_delete_v1',{p_event_id:eventId});state.massDetailCache.clear();await Promise.all([loadMassTrainings(),loadMassCalendar()]);closeInline();renderMassTrainings();status('Edzés törölve.','success')}catch(err){status(err.message||'Az edzés nem törölhető.','error')}})}
  function openMassAddAthlete_(eventId){const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='TÖMEGSPORT · SPORTOLÓ HOZZÁADÁSA';title.textContent='Sportoló hozzáadása';body.innerHTML=`<form id="massAddAthleteForm" class="action-form"><div class="action-form-grid"><label class="field"><span>Név</span><input id="maName" required maxlength="100"></label><label class="field"><span>Email</span><input id="maEmail" type="email"></label><label class="field"><span>Típus</span><select id="maType"><option value="NORMAL">Normál</option><option value="FIRST">Első edzés</option><option value="GUEST">Vendég</option></select></label><label class="field"><span>Bérletszám</span><input id="maPass"></label><label class="field span-2"><span>Admin megjegyzés</span><input id="maNote" maxlength="1000"></label></div><label class="action-checkbox"><input id="maPresent" type="checkbox"> <span>Megjelentként rögzítés</span></label><div class="dialog-action-row"><button type="button" class="button quiet" id="maCancel">Mégse</button><button type="submit" class="button primary" id="maSave">Hozzáadás</button></div></form>`;ccOpenDialogStable_(d);$('#maCancel')?.addEventListener('click',ccCloseEntityDialog_);$('#massAddAthleteForm')?.addEventListener('submit',async ev=>{ev.preventDefault();const btn=$('#maSave');if(btn)btn.disabled=true;try{await rpc('cc_manager_mass_booking_add_v1',{p_event_id:eventId,p_payload:{name:text($('#maName').value),email:text($('#maEmail').value),personType:$('#maType').value,passNumber:text($('#maPass').value),note:text($('#maNote').value),present:$('#maPresent').checked,capacityBucket:'ADMIN'}});state.massDetailCache.delete(eventId);ccCloseEntityDialog_();await openMassEventDetail(eventId);status('Sportoló hozzáadva.','success')}catch(err){status(err.message||'A sportoló hozzáadása sikertelen.','error');if(btn)btn.disabled=false}})}
  async function massBookingPatch_(eventId,bookingId,patch){captureMassDetailUi_(eventId);try{await rpc('cc_manager_mass_booking_patch_v1',{p_booking_id:bookingId,p_patch:patch});state.massDetailCache.delete(eventId);await openMassEventDetail(eventId);status('Jelentkezés frissítve.','success')}catch(err){status(err.message||'A módosítás sikertelen.','error')}}
  async function massBookingRemove_(eventId,bookingId){if(!window.confirm('Biztosan kiveszed a sportolót erről az edzésről?'))return;captureMassDetailUi_(eventId);try{await rpc('cc_manager_mass_booking_remove_v1',{p_booking_id:bookingId});state.massDetailCache.delete(eventId);await openMassEventDetail(eventId);status('Sportoló kivéve az edzésről.','success')}catch(err){status(err.message||'A sportoló kivétele sikertelen.','error')}}
  function bindMassPersonDisclosure_(root,eventId=''){
    if(!root)return;const toggles=Array.from(root.querySelectorAll('[data-mass-person-toggle]')),all=root.querySelector('#massToggleAllPeople');
    const remember=()=>{if(eventId)captureMassDetailUi_(eventId,root)};
    const setOne=(btn,open)=>{const card=btn.closest('.mass-attendance-card'),details=card?.querySelector('[data-mass-person-details]');if(!card||!details)return;details.hidden=!open;card.classList.toggle('is-collapsed',!open);btn.setAttribute('aria-expanded',String(open));btn.classList.toggle('open',open)};
    toggles.forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setOne(btn,btn.getAttribute('aria-expanded')!=='true');if(all){const allOpen=toggles.length&&toggles.every(x=>x.getAttribute('aria-expanded')==='true');all.textContent=allOpen?'Mind becsuk':'Mind kinyit'}remember()}));
    all?.addEventListener('click',()=>{const open=!toggles.every(x=>x.getAttribute('aria-expanded')==='true');toggles.forEach(x=>setOne(x,open));all.textContent=open?'Mind becsuk':'Mind kinyit';remember()});
  }
  async function openMassEventDetail(eventId,{force=true}={}){
    const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');if(!d||!body||!title)return;
    const ui=massDetailUiFor_(eventId);captureMassDetailUi_(eventId,body);
    if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='TÖMEGSPORT · EDZÉS';
    title.textContent='Tömegsport edzés';body.innerHTML='<div class="loading-inline">Edzés betöltése…</div>';ccOpenDialogStable_(d);
    try{
      const data=await loadMassEventDetail(eventId,{force}),e=data?.event||{},editable=canAction('mass.trainings','edit');
      let bookings=(Array.isArray(data?.bookings)?data.bookings:[]).slice();
      const wait=(Array.isArray(data?.waitlist)?data.waitlist:[]).slice().sort(massPersonSort_),cancelled=Array.isArray(data?.cancelled)?data.cancelled:[];
      const allBookings=bookings.slice(),present=allBookings.filter(r=>massAttendanceModel_(r.attendance).key==='present').length,noshow=allBookings.filter(r=>massAttendanceModel_(r.attendance).key==='noshow').length,pending=Math.max(0,allBookings.length-present-noshow),gate=text(e.registrationMode)==='WAITLIST_ONLY';
      if(ui.pass==='needs-check')bookings=bookings.filter(r=>massPassInfo_(r,e).needsCheck);else if(ui.pass==='valid')bookings=bookings.filter(r=>massPassInfo_(r,e).valid&&!massPassInfo_(r,e).needsCheck);else if(ui.pass==='missing')bookings=bookings.filter(r=>!massPassInfo_(r,e).passNumber&&!massPassInfo_(r,e).exempt);
      bookings.sort((a,b)=>ui.sort==='surname-desc'?-comparePlayersBySurname_(a,b):comparePlayersBySurname_(a,b));
      const needsCheckCount=allBookings.filter(r=>massPassInfo_(r,e).needsCheck).length;
      title.textContent=e.level||'Edzés';
      body.innerHTML=`<div class="entity-hero event-entity-hero mass-detail-hero"><div class="mass-detail-titleline"><span class="mass-detail-level">${esc(e.level||'Edzés')}</span><span class="training-active-pill ${e.active===false?'off':''} ${gate?'waitlist':''}">${e.active===false?'INAKTÍV':(gate?'CSAK VÁRÓLISTA':'AKTÍV')}</span></div><strong class="mass-detail-big-count">${allBookings.length} <small>fő</small></strong></div>
        <div class="attendance-detail mass-attendance-summary"><div><small>Jelentkező</small><span><b data-mass-attendance-count="total">${allBookings.length}</b> fő</span></div><div><small>Megjelent</small><span><b data-mass-attendance-count="present">${present}</b> fő</span></div><div><small>Nincs rögzítve</small><span><b data-mass-attendance-count="pending">${pending}</b> fő</span></div><div><small>Nem jelent meg</small><span><b data-mass-attendance-count="noshow">${noshow}</b> fő</span></div></div>
        <div class="detail-grid mass-detail-primary-grid">${detailPair('Kezdés',`${fmtDate(e.startsAt)} ${fmtTime(e.startsAt)}`)}${detailPair('Befejezés',e.endsAt?fmtTime(e.endsAt):'–')}${detailPair('Pálya',e.court||'–')}</div>
        ${editable?`<div class="entity-hero-actions mass-detail-actions cc-icon-toolbar"><button class="cc-toolbar-text primary" id="massAddAthleteBtn" type="button">+ Sportoló</button><button class="cc-toolbar-text" id="massEventEditBtn" type="button">Edzés szerkesztése</button><button class="cc-toolbar-text" id="massToggleAllPeople" type="button">Mind kinyit</button><button class="cc-toolbar-text ${gate?'':'warning'}" id="massEventGateBtn" type="button">${gate?'Jelentkezés megnyitása':'Jelentkezés lezárása'}</button><button class="matrix-filter-toggle icon-only cc-toolbar-icon ${ui.filtersOpen?'open':''} ${ui.pass!=='all'||ui.sort!=='surname-asc'?'has-filter':''}" id="massRosterFiltersToggle" type="button" aria-expanded="${ui.filtersOpen?'true':'false'}" aria-label="Névsor szűrők" title="Névsor szűrők"><span class="triangle-icon"></span></button></div>`:''}
        <div class="mass-detail-roster-filters" id="massDetailRosterFilters" ${ui.filtersOpen?'':'hidden'}><label><span>Sorrend</span><select id="massRosterSort"><option value="surname-asc" ${ui.sort==='surname-asc'?'selected':''}>Vezetéknév A–Z</option><option value="surname-desc" ${ui.sort==='surname-desc'?'selected':''}>Vezetéknév Z–A</option></select></label><label><span>Bérlet</span><select id="massRosterPassFilter"><option value="all" ${ui.pass==='all'?'selected':''}>Mindenki</option><option value="needs-check" ${ui.pass==='needs-check'?'selected':''}>Ellenőrzendő (${needsCheckCount})</option><option value="valid" ${ui.pass==='valid'?'selected':''}>Érvényes</option><option value="missing" ${ui.pass==='missing'?'selected':''}>Bérlet nélkül</option></select></label><span class="mass-roster-filter-count">${bookings.length} / ${allBookings.length} fő</span></div>
        <div class="panel-subhead mass-attendance-heading"><div><h4>Jelenlét</h4><p>Név és jelenléti csúszka; a részletek játékosonként lenyithatók.</p></div></div>
        <div class="mass-attendance-card-list">${bookings.map(r=>{const base=massBookingCard_(r,e.level,e);if(!editable)return base;return base.replace('</article>',`<div class="mass-booking-admin-actions"><select data-mass-pass-status="${esc(r.bookingId||r.id)}"><option value="">Bérlet állapota…</option><option value="ÉRVÉNYES">Érvényes</option><option value="ÉRVÉNYTELEN">Érvénytelen</option><option value="ELLENŐRIZENDŐ">Ellenőrzendő</option></select><div class="mass-booking-admin-right"><button class="button quiet tiny" data-mass-note="${esc(r.bookingId||r.id)}" data-current-note="${esc(r.note||'')}">Megjegyzés</button><button class="button danger tiny" data-mass-remove="${esc(r.bookingId||r.id)}">Kivétel</button></div></div></article>`) }).join('')||emptyInline('Nincs a szűrésnek megfelelő jelentkező.')}</div>
        <div class="panel-subhead"><div><h4>Várólista</h4><p>Várakozó és felajánlott helyek, azonos kompakt formában.</p></div></div><div class="mass-wait-card-list">${wait.map(massWaitlistCard_).join('')||emptyInline('A várólista üres.')}</div>
        ${massCancellationPanelHtml_(cancelled,{unavailable:data?.cancelledUnavailable,open:ui.cancelledOpen})}`;
      bindMassAttendanceSliders_(eventId);bindMassPersonDisclosure_(body,eventId);restoreMassDetailUi_(eventId,body);
      const rosterFilterToggle=$('#massRosterFiltersToggle'),rosterFilterPanel=$('#massDetailRosterFilters');rosterFilterToggle?.addEventListener('click',()=>{ui.filtersOpen=!ui.filtersOpen;rosterFilterToggle.classList.toggle('open',ui.filtersOpen);rosterFilterToggle.setAttribute('aria-expanded',String(ui.filtersOpen));if(rosterFilterPanel)rosterFilterPanel.hidden=!ui.filtersOpen;ccBlurPointerControl_(rosterFilterToggle)});$('#massRosterSort')?.addEventListener('change',ev=>{ui.sort=ev.target.value;captureMassDetailUi_(eventId,body);openMassEventDetail(eventId,{force:false})});
      $('#massRosterPassFilter')?.addEventListener('change',ev=>{ui.pass=ev.target.value;ui.scrollTop=0;captureMassDetailUi_(eventId,body);openMassEventDetail(eventId,{force:false})});
      $('#massEventEditBtn')?.addEventListener('click',()=>{captureMassDetailUi_(eventId,body);openMassEventEditor_(eventId)});$('#massAddAthleteBtn')?.addEventListener('click',()=>{captureMassDetailUi_(eventId,body);openMassAddAthlete_(eventId)});$('#massEventGateBtn')?.addEventListener('click',()=>{captureMassDetailUi_(eventId,body);toggleMassRegistrationGate(eventId,!gate,{keepDetail:true})});Array.from(body.querySelectorAll('[data-mass-pass-status]')).forEach(x=>x.addEventListener('change',()=>{if(x.value)massBookingPatch_(eventId,x.dataset.massPassStatus,{passStatus:x.value})}));Array.from(body.querySelectorAll('[data-mass-note]')).forEach(x=>x.addEventListener('click',()=>{captureMassDetailUi_(eventId,body);const note=window.prompt('Admin megjegyzés:',x.dataset.currentNote||'');if(note!==null)massBookingPatch_(eventId,x.dataset.massNote,{note})}));Array.from(body.querySelectorAll('[data-mass-remove]')).forEach(x=>x.addEventListener('click',()=>massBookingRemove_(eventId,x.dataset.massRemove)));
    }catch(err){console.error(err);body.innerHTML=`<div class="migration-note error"><b>A részletes Tömegsport nézet nem tölthető be.</b><span>${esc(err.message||'Betöltési hiba')}</span></div>`}
  }

  async function toggleMassRegistrationGate(eventId,closeToWaitlist,{keepDetail=false}={}){
    if(!canAction('mass.trainings','edit')||state.massActionBusy)return;
    const e=(state.massTrainings||[]).find(x=>text(x.eventId)===text(eventId));if(!e)return;
    const label=`${e.level||'Edzés'} · ${fmtDate(e.startsAt)} ${fmtTime(e.startsAt)}`;
    const question=closeToWaitlist?`${label}\n\nLezárod a közvetlen jelentkezést?\n\nA meglévő jelentkezések megmaradnak. Új sportoló csak várólistára kerülhet, és a várólista automatikus előreléptetése szünetel.`:`${label}\n\nÚjra megnyitod a közvetlen jelentkezést?\n\nA meglévő kapacitás ismét közvetlen jelentkezésre használható, és az új jelentkezők közvetlenül bekerülhetnek.`;
    if(!window.confirm(question))return;
    state.massActionBusy=text(eventId);renderMassTrainings();
    try{status(closeToWaitlist?'Jelentkezés lezárása…':'Jelentkezés megnyitása…');await rpc('cc_manager_mass_registration_gate_v1',{p_event_id:eventId,p_waitlist_only:closeToWaitlist});await loadMassTrainings();status(closeToWaitlist?'Jelentkezés lezárva: csak várólista.':'Jelentkezés újra megnyitva.','success')}
    catch(err){console.error(err);status(err.message||'A jelentkezési állapot módosítása sikertelen.','error')}
    finally{state.massActionBusy='';if(keepDetail){state.massDetailCache.delete(text(eventId));await openMassEventDetail(eventId)}else renderMassTrainings()}
  }

  function normalizeMassLevelLabel_(value){
    const raw=text(value),key=raw.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim();
    if(key.includes('KOZEPHALADO')&&key.includes('HALADO'))return 'Középhaladó–Haladó';
    if(key.includes('KOZEPHALADO'))return 'Középhaladó';
    if(key.includes('HALADO'))return 'Haladó';
    if(key.includes('KEZDO'))return 'Kezdő';
    if(key.includes('VERSENY'))return 'Verseny';
    return raw||'–'
  }
  function massAthleteRows_(){
    const q=text(state.massAthleteSearch).toLocaleLowerCase('hu-HU'),level=text(state.massAthleteLevel),statusValue=text(state.massAthleteStatus),month=text(state.massAthleteMonth),passMode=text(state.massAthletePass||'all'),firstMode=text(state.massAthleteFirst||'all');
    return (state.massAthletes||[]).filter(a=>{
      if(level&&normalizeMassLevelLabel_(a.effectiveLevel||a.levelOverride||a.level)!==level)return false;
      if(statusValue&&text(a.status)!==statusValue)return false;
      if(month&&text(a.currentPassMonth)!==month)return false;
      if(passMode==='has'&&!text(a.currentPassNumber))return false;
      if(passMode==='missing'&&text(a.currentPassNumber))return false;
      if(firstMode==='not-yet'&&a.firstTrainingDate)return false;
      if(firstMode==='done'&&!a.firstTrainingDate)return false;
      if(q&&!`${a.name||''} ${a.email||''} ${a.currentPassNumber||''} ${a.effectiveLevel||''}`.toLocaleLowerCase('hu-HU').includes(q))return false;
      return true;
    }).slice().sort(comparePlayersBySurname_)
  }
  function massAthleteFilterOptions_(key){if(key==='effectiveLevel')return Array.from(new Set((state.massAthletes||[]).map(a=>normalizeMassLevelLabel_(a.effectiveLevel||a.levelOverride||a.level)).filter(Boolean))).sort((a,b)=>HU_NAME_COLLATOR.compare(a,b));return Array.from(new Set((state.massAthletes||[]).map(a=>text(a[key])).filter(Boolean))).sort((a,b)=>HU_NAME_COLLATOR.compare(a,b))}
  function massAthleteRow_(a){const canonicalLevel=normalizeMassLevelLabel_(a.effectiveLevel||a.levelOverride||a.level),color=massLevelColor({level:canonicalLevel}),pass=a.currentPassNumber?`${a.currentPassNumber}${a.currentPassMonth?' · '+a.currentPassMonth:''}`:'Nincs aktuális bérlet';return `<button class="mass-athlete-row unified-person-card mass-no-avatar" type="button" data-mass-athlete-open="${esc(a.athleteId)}" style="--mass-athlete-color:${esc(color)};--player-team-color:${esc(color)}"><span class="person-primary"><span><b>${esc(a.name||'Névtelen')}</b><small>${esc(a.email||'–')}</small></span></span><span><b>${esc(canonicalLevel)}</b><small>${a.levelOverride?'Edzői felülírás':'Alapszint'} · ${esc(a.status||'–')}</small></span><span><b>${esc(pass)}</b><small>${num(a.totalBookings)} edzés · ${num(a.attendanceRecorded)} jelenlét rögzítve</small></span><i class="person-chevron"><span class="triangle-icon"></span></i></button>`}
  function renderMassAthletes(){if(!ccRouteIs_('mass','athletes'))return;
    state.massAthleteFiltersOpen=filterOpen_('mass.athletes',state.massAthleteFiltersOpen);const rows=massAthleteRows_(),levels=massAthleteFilterOptions_('effectiveLevel'),statuses=massAthleteFilterOptions_('status'),months=Array.from(new Set((state.massAthletes||[]).map(a=>text(a.currentPassMonth)).filter(Boolean))).sort().reverse(),active=!!state.massAthleteSearch||!!state.massAthleteLevel||!!state.massAthleteStatus||!!state.massAthleteMonth||state.massAthletePass!=='all'||state.massAthleteFirst!=='all';
    $('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Sportolók</h2><p>Tömegsport sportolói adatbázis.</p></div><div class="filter-head-actions cc-icon-toolbar"><button class="matrix-filter-toggle icon-only cc-toolbar-icon ${state.massAthleteFiltersOpen?'open':''} ${active?'has-filter':''}" id="massAthleteFiltersToggle" aria-expanded="${state.massAthleteFiltersOpen?'true':'false'}" type="button" aria-label="Szűrők" title="Szűrők"><span class="triangle-icon"></span></button>${active?'<button class="filter-reset cc-toolbar-reset" id="massAthleteReset" type="button" aria-label="Szűrők törlése" title="Szűrők törlése">×</button>':''}<button class="cc-toolbar-icon cc-raw-import-icon" id="massRawImportOpen" type="button" aria-label="Raw BEAC import" title="Raw BEAC import">≡</button><button class="cc-toolbar-icon cc-refresh-icon" id="massAthletesRefresh" type="button" aria-label="Frissítés" title="Frissítés">↻</button></div></div><div class="filter-panel mass-directory-toolbar cc-mass-athlete-filters" id="massAthleteFiltersPanel" ${state.massAthleteFiltersOpen?'':'hidden'}><input id="massAthleteSearch" type="search" value="${esc(state.massAthleteSearch)}" placeholder="Keresés név, email, bérletszám vagy szint alapján…"><select id="massAthleteLevel"><option value="">Minden szint</option>${levels.map(x=>`<option value="${esc(x)}" ${x===state.massAthleteLevel?'selected':''}>${esc(x)}</option>`).join('')}</select><select id="massAthleteStatus"><option value="">Minden állapot</option>${statuses.map(x=>`<option value="${esc(x)}" ${x===state.massAthleteStatus?'selected':''}>${esc(x)}</option>`).join('')}</select><select id="massAthleteMonth"><option value="">Minden hónap</option>${months.map(x=>`<option value="${esc(x)}" ${x===state.massAthleteMonth?'selected':''}>${esc(x)}</option>`).join('')}</select><select id="massAthletePass"><option value="all" ${state.massAthletePass==='all'?'selected':''}>Minden bérlet</option><option value="has" ${state.massAthletePass==='has'?'selected':''}>Van aktuális bérlet</option><option value="missing" ${state.massAthletePass==='missing'?'selected':''}>Nincs aktuális bérlet</option></select><select id="massAthleteFirst"><option value="all" ${state.massAthleteFirst==='all'?'selected':''}>Első alkalom: mind</option><option value="not-yet" ${state.massAthleteFirst==='not-yet'?'selected':''}>Még nem volt első edzésen</option><option value="done" ${state.massAthleteFirst==='done'?'selected':''}>Volt már edzésen</option></select></div><article class="panel mass-directory-panel"><div class="mass-athlete-list">${rows.map(massAthleteRow_).join('')||emptyInline('Nincs a szűrésnek megfelelő sportoló.')}</div></article>`;
    const toggle=$('#massAthleteFiltersToggle'),panel=$('#massAthleteFiltersPanel');toggle?.addEventListener('click',()=>{const open=setFilterOpen_('mass.athletes',!state.massAthleteFiltersOpen);state.massAthleteFiltersOpen=open;toggle.setAttribute('aria-expanded',String(open));toggle.classList.toggle('open',open);if(panel)panel.hidden=!open;ccBlurPointerControl_(toggle)});
    $('#massAthleteSearch')?.addEventListener('input',e=>{state.massAthleteSearch=e.target.value;renderMassAthletes()});$('#massAthleteLevel')?.addEventListener('change',e=>{state.massAthleteLevel=e.target.value;afterNativePicker(e.target,renderMassAthletes)});$('#massAthleteStatus')?.addEventListener('change',e=>{state.massAthleteStatus=e.target.value;afterNativePicker(e.target,renderMassAthletes)});$('#massAthleteMonth')?.addEventListener('change',e=>{state.massAthleteMonth=e.target.value;afterNativePicker(e.target,renderMassAthletes)});$('#massAthletePass')?.addEventListener('change',e=>{state.massAthletePass=e.target.value;afterNativePicker(e.target,renderMassAthletes)});$('#massAthleteFirst')?.addEventListener('change',e=>{state.massAthleteFirst=e.target.value;afterNativePicker(e.target,renderMassAthletes)});$('#massAthleteReset')?.addEventListener('click',()=>{state.massAthleteSearch='';state.massAthleteLevel='';state.massAthleteStatus='';state.massAthleteMonth='';state.massAthletePass='all';state.massAthleteFirst='all';renderMassAthletes()});$('#massRawImportOpen')?.addEventListener('click',()=>setRoute('mass','passes'));$('#massAthletesRefresh')?.addEventListener('click',async()=>{try{status('Sportolók frissítése…');await Promise.all([loadMassAthletes(),loadMassPasses().catch(()=>{})]);renderMassAthletes();status('Sportolók frissítve.','success')}catch(err){status(err.message||'A Sportolók betöltése sikertelen.','error')}});$$('[data-mass-athlete-open]').forEach(b=>b.addEventListener('click',()=>openMassAthleteDetail_(b.dataset.massAthleteOpen)))}

  function openMassAthleteDetail_(id){const a=(state.massAthletes||[]).find(x=>text(x.athleteId)===text(id));if(!a)return;const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='TÖMEGSPORT · SPORTOLÓ';title.textContent=a.name||'Sportoló';body.innerHTML=`<div class="entity-hero"><div><b>${esc(a.name||'–')}</b><span>${esc(a.email||'–')}</span></div></div><div class="detail-grid">${detailPair('Aktuális szint',a.effectiveLevel||a.levelOverride||a.level||'–')}${detailPair('Alapszint',a.level||'–')}${detailPair('Edzői felülírás',a.levelOverride||'–')}${detailPair('Állapot',a.status||'–')}${detailPair('Első edzés',a.firstTrainingDate?fmtDate(a.firstTrainingDate):'–')}${detailPair('Összes jelentkezés',num(a.totalBookings))}${detailPair('Rögzített jelenlét',num(a.attendanceRecorded))}${detailPair('Aktuális bérlet',a.currentPassNumber||'–')}${detailPair('Bérlet hónap',a.currentPassMonth||'–')}${detailPair('Bérlet típusa',a.currentPassProduct||'–')}</div>${a.note?`<div class="migration-note"><b>Megjegyzés</b><span>${esc(a.note)}</span></div>`:''}`;ccOpenDialogStable_(d)}
  function massPassRows_(){const q=text(state.massPassSearch).toLocaleLowerCase('hu-HU'),month=text(state.massPassMonth);return (state.massPasses||[]).filter(p=>(!month||text(p.validMonth)===month)&&(!q||`${p.passNumber||''} ${p.email||''} ${p.product||''} ${p.passGroup||''} ${p.athleteName||''}`.toLocaleLowerCase('hu-HU').includes(q))).slice().sort((a,b)=>(safeDate(b.purchaseDate)?.getTime()||0)-(safeDate(a.purchaseDate)?.getTime()||0)||HU_NAME_COLLATOR.compare(text(a.email),text(b.email)))}
  function renderMassPasses(){if(!ccRouteIs_('mass','passes'))return;state.massPassFiltersOpen=filterOpen_('mass.passes',state.massPassFiltersOpen);const rows=massPassRows_(),months=Array.from(new Set((state.massPasses||[]).map(p=>text(p.validMonth)).filter(Boolean))).sort().reverse(),active=!!state.massPassSearch||!!state.massPassMonth;$('#viewContent').innerHTML=`<div class="page-intro"><div><h2>BEAC import</h2><p>Canonical BEAC raw/import bérletadatok a Supabase-ból. Ez a nézet a legutóbbi importot mutatja, nem módosít bérletet.</p></div><div class="filter-head-actions"><button class="matrix-filter-toggle ${state.massPassFiltersOpen?'open':''} ${active?'has-filter':''}" id="massPassFiltersToggle" aria-expanded="${state.massPassFiltersOpen?'true':'false'}" type="button"><span class="triangle-icon"></span>Szűrők</button>${active?'<button class="filter-reset" id="massPassReset" type="button">Szűrők törlése</button>':''}<button class="button quiet small" id="massPassesRefresh" type="button">↻ Import újratöltése</button></div></div><div class="filter-panel mass-directory-toolbar passes" id="massPassFiltersPanel" ${state.massPassFiltersOpen?'':'hidden'}><input id="massPassSearch" type="search" value="${esc(state.massPassSearch)}" placeholder="Keresés név, email, bérletszám vagy termék alapján…"><select id="massPassMonth"><option value="">Minden hónap</option>${months.map(x=>`<option value="${esc(x)}" ${x===state.massPassMonth?'selected':''}>${esc(x)}</option>`).join('')}</select></div><article class="panel mass-directory-panel"><div class="mass-pass-header"><div>Bérlet</div><div>Sportoló</div><div>Termék</div><div>Érvényes hónap</div><div>Vásárlás</div></div><div class="mass-pass-list">${rows.map(p=>`<div class="mass-pass-row"><span><b>${esc(p.passNumber||'–')}</b><small>${esc(p.passGroup||'')}</small></span><span><b>${esc(p.athleteName||p.email||'–')}</b><small>${esc(p.email||'')}</small></span><span><b>${esc(p.product||'–')}</b><small>${esc(p.season||'')}</small></span><span><b>${esc(p.validMonth||'–')}</b><small>${p.currentMonth?'AKTUÁLIS HÓNAP':''}</small></span><span><b>${p.purchaseDate?esc(fmtDate(p.purchaseDate)):'–'}</b><small>${p.importedAt?`Import: ${esc(fmtDate(p.importedAt))}`:''}</small></span></div>`).join('')||emptyInline('Nincs a szűrésnek megfelelő bérlet.')}</div></article>`;const toggle=$('#massPassFiltersToggle'),panel=$('#massPassFiltersPanel');toggle?.addEventListener('click',()=>{const open=setFilterOpen_('mass.passes',!state.massPassFiltersOpen);state.massPassFiltersOpen=open;toggle.setAttribute('aria-expanded',String(open));toggle.classList.toggle('open',open);if(panel)panel.hidden=!open;ccBlurPointerControl_(toggle)});$('#massPassSearch')?.addEventListener('input',e=>{state.massPassSearch=e.target.value;renderMassPasses()});$('#massPassMonth')?.addEventListener('change',e=>{state.massPassMonth=e.target.value;afterNativePicker(e.target,renderMassPasses)});$('#massPassReset')?.addEventListener('click',()=>{state.massPassSearch='';state.massPassMonth='';renderMassPasses()});$('#massPassesRefresh')?.addEventListener('click',async()=>{try{status('BEAC import újratöltése…');await loadMassPasses();renderMassPasses();status('BEAC import újratöltve.','success')}catch(err){status(err.message||'A Bérletek betöltése sikertelen.','error')}})}

  function renderMassArchive(){if(!ccRouteIs_('mass','archive'))return;
    const rows=(state.massArchiveEvents||[]).slice();
    $('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Archívum</h2><p>Lezárt Tömegsport és SPORT7 alkalmak.</p></div><span class="read-only-badge">LEZÁRT</span></div><article class="panel legacy-mass-panel archive-parity"><div class="legacy-mass-training-list">${rows.map(e=>massLegacyTrainingRow(e,{archived:true})).join('')||emptyInline('A szezonban még nincs archivált alkalom.')}</div></article>`;
    bindMassLegacyRows();
  }
  function renderTrainingPlannerParity(){if(!ccSectionIs_('planning'))return;
    if(state.plannerTab==='counter'){$('#viewContent').innerHTML='<div id="ccScoreboardMount"></div>';if(window.CCManagerScoreboard)window.CCManagerScoreboard.mount($('#ccScoreboardMount'));else $('#viewContent').textContent='A Számláló modul nem tölthető be.';return}
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
    const id=text(e.eventId||e.id),record=ccSeasonPositionByEvent_.get(id);
    if(record){
      return {known:true,counts:{f:num(record.f),sz:num(record.sz),c:num(record.c),a:num(record.a),l:num(record.l),'?':num(record.unknown)},source:'season-summary'};
    }
    const cached=state.eventRosterCache.get(id);
    if(Array.isArray(cached)){
      const counts={f:0,sz:0,c:0,a:0,l:0,'?':0};
      for(const r of cached)if(ccGoingStatus_(r.status)){const key=ccPositionKey_(r.position);counts[key]=(counts[key]||0)+1}
      return {known:true,counts,source:'roster'};
    }
    return {known:num(e.yesCount)===0,counts:{f:0,sz:0,c:0,a:0,l:0,'?':0},source:'none'};
  }
  // No full-roster background prefetch; roster and decline notes load on demand.
  async function ccHydrateCardPositions_(){return}
  function ccTotalTone_(n){const x=num(n);return x<6?'danger':x<10?'warn':'ok'}
  function ccPositionTone_(key,n,known){if(!known)return'unknown';const x=num(n);if(key==='f'||key==='l'||key==='a')return x===0?'danger':x===1?'warn':'ok';if(key==='sz'||key==='c')return x<=1?'danger':x===2?'warn':'ok';return'ok'}
  function ccTeamRosterSize_(teamId){return (state.players||[]).filter(p=>text(p.teamId||p.team_id)===text(teamId)&&p.active!==false).length}
  function ccPositionBreakdownHtml_(e){const {known,counts}=ccEventPositionSummary_(e),defs=[['f','F'],['sz','SZ'],['c','C'],['a','Á'],['l','L']];return `<div class="cc-pos-breakdown" aria-label="Jövők poszt szerint">${defs.map(([k,label])=>`<span class="${ccPositionTone_(k,counts[k],known)}"><b>${label}</b>${known?num(counts[k]):'–'}</span>`).join('')}${known&&counts['?']?`<span class="unknown"><b>?</b>${num(counts['?'])}</span>`:''}</div>`}
  function ccEventOpponent_(e){const title=text(e.title),parts=title.split(/\s+[–—-]\s+/).map(text).filter(Boolean),ha=text(e.homeAway||e.home_away);if(parts.length>=2){if(ha==='home')return parts.slice(1).join(' – ');if(ha==='away')return parts[0];const teamName=ccNameKey_(e.teamName||teamById(eventTeamId(e))?.name);return parts.find(x=>!ccNameKey_(x).includes('beac')&&ccNameKey_(x)!==teamName)||parts[1]}return title||'Ellenfél'}
  function ccStandingByName_(teamId,name){const key=ccNameKey_(name);if(!key)return null;return standingsForContext_(teamId).find(r=>ccNameKey_(r.teamName)===key)||null}
  function ccFocusStanding_(teamId){return standingsForContext_(teamId).find(r=>r.focus)||null}
  function ccOpponentLogoHtml_(src,alt){if(!src)return'';return `<span class="cc-event-opponent-logo"><img src="${esc(src)}" alt="${esc(alt||'')}" loading="lazy" referrerpolicy="no-referrer"></span>`}
  function ccEventIconHtml_(e,kind){const path=kind==='training'?'assets/event-training-mask.png':text(e.homeAway||e.home_away)==='away'?'assets/event-away-mask.png':'assets/event-home-mask.png',label=kind==='training'?'Edzés':text(e.homeAway||e.home_away)==='away'?'Idegenbeli meccs':'Hazai meccs';return `<span class="cc-event-type-icon" title="${esc(label)}"><img src="${path}" alt=""></span>`}
  function ccEventCardHtml_(e,kind){
    const teamId=eventTeamId(e),team=teamById(teamId),teamName=e.teamName||team?.name||'Csapat',yes=num(e.yesCount),roster=ccTeamRosterSize_(teamId),start=eventStart(e),end=eventEnd(e),isMatch=kind==='match',ha=text(e.homeAway||e.home_away),opponent=isMatch?ccEventOpponent_(e):'';
    const dateText=start?new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Europe/Budapest'}).format(start).replace(/\s/g,''):'–';
    const rawCourt=text(e.court).trim(),courtLabel=rawCourt?(/pálya/i.test(rawCourt)?rawCourt:`${rawCourt.replace(/\.$/,'')}. pálya`):'Pálya –',venue=text(e.venue),timeText=start?fmtTime(start):'–',friendly=isMatch&&ccMatchKindFromEvent_(e)==='friendly',kindMeta=isMatch?(friendly?'Edzőmeccs':ha==='home'?'Hazai':'Idegenbeli'):'Versenycsapat';
    const title=isMatch?(opponent||e.title||'Meccs'):courtLabel,result=isMatch&&isEventPast(e)?competitionResultByEvent_(e.eventId||e.id):null,hs=Number(result?.homeSets),as=Number(result?.awaySets),hasScore=Number.isFinite(hs)&&Number.isFinite(as),beacFor=ha==='away'?as:hs,beacAgainst=ha==='away'?hs:as,resultTone=hasScore?(beacFor>beacAgainst?'win':beacFor<beacAgainst?'loss':'draw'):'',scoreText=hasScore?`${hs}–${as}`:'';
    return `<button type="button" class="cc-event-card cc-event-card-b6f ${isEventPast(e)?'past':''} ${isMatch?'match':'training'}" data-event-id="${esc(e.eventId||e.id)}" style="--team-color:${esc(e.color||team?.color||'#f7b700')}">${ccEventIconHtml_(e,kind)}<span class="cc-event-primary"><strong class="cc-event-card-title">${esc(title)}</strong><span class="cc-event-card-sub"><b>${esc(teamName)}</b><em>${isMatch?'Meccs':'Edzés'}</em>${kindMeta?`<i>${esc(kindMeta)}</i>`:''}</span><small>${esc(venue||'')}</small></span><span class="cc-event-date"><span class="cc-event-date-line">${scoreText?`<strong class="cc-event-result ${resultTone}">${esc(scoreText)}</strong>`:''}<b>${esc(dateText)}</b></span><small>${esc(timeText)}${friendly&&end?`–${esc(fmtTime(end))}`:''}</small></span><span class="cc-event-attendance"><span class="cc-event-total ${ccTotalTone_(yes)}"><b>${yes}</b>${roster?`<i>/${roster}</i>`:''}</span>${ccPositionBreakdownHtml_(e)}</span></button>`
  }

  async function toggleEventRoster(eventId,button){const holder=document.querySelector(`[data-roster-holder="${CSS.escape(eventId)}"]`);if(!holder)return;const opening=holder.hidden;holder.hidden=!opening;button?.setAttribute('aria-expanded',String(opening));button?.classList.toggle('open',opening);if(!opening)return;if(holder.dataset.loaded==='1'){bindUnifiedPlayerCards_(holder);return}holder.innerHTML='<div class="roster-loading">Névsor betöltése…</div>';try{const rows=configured()?await loadEventRoster(eventId):[];holder.dataset.loaded='1';holder.innerHTML=`<div class="roster-groups">${rosterGroup('Jövök',rows.filter(x=>x.status==='going'),'going')}${rosterGroup('Nem jövök',rows.filter(x=>x.status==='not_going'),'not-going')}${rosterGroup('Nincs válasz',rows.filter(x=>x.status!=='going'&&x.status!=='not_going'),'none')}</div>`;bindUnifiedPlayerCards_(holder)}catch(err){holder.innerHTML=`<div class="roster-loading error">${esc(err.message||'A névsor betöltése nem sikerült.')}</div>`}}

  // Competition training inline roster; RSVP only (actual attendance is separate).
  const ccTrainingRosterOpenIds_ = new Set();
  function ccTrainingRsvpTone_(statusValue){
    const status=text(statusValue).trim();
    return status==='going'?'going':status==='not_going'?'not-going':'none';
  }


  // Shared RSVP order: coming first, declining next, unanswered last.
  // Inside each response group, numeric jersey numbers lead; unnamed jerseys sort last.
  function ccRosterSortedByResponse_(rows){
    const order={going:0,'not-going':1,none:2};
    return (Array.isArray(rows)?rows:[]).map(enrichPlayer_).sort((a,b)=>{
      const tone=order[ccTrainingRsvpTone_(a.status)]-order[ccTrainingRsvpTone_(b.status)];
      if(tone)return tone;
      const anum=text(a.jerseyNo??a.jersey_no),bnum=text(b.jerseyNo??b.jersey_no);
      const av=/^\d+$/.test(anum)?Number(anum):99999,bv=/^\d+$/.test(bnum)?Number(bnum):99999;
      return av-bv||text(a.displayName||a.name).localeCompare(text(b.displayName||b.name),'hu');
    });
  }
  // Quick roster: avatar, name, jersey number, attendance slider, profile triangle.
  function ccTrainingInlinePreviewHtml_(rows,eventId,editable,attendanceEditable,showMatchRsvp=false){
    const players=ccRosterSortedByResponse_(rows);
    const html=players.map(p=>{
      const name=text(p.displayName||p.name||'Játékos'),jersey=text(p.jerseyNo??p.jersey_no),tone=ccTrainingRsvpTone_(p.status),preview=ccRosterPreviewState_(p);
      return `<div class="cc-inline-player ${tone} ${preview.confirmed?'is-confirmed':'is-rsvp-only'}" aria-label="${esc(name)} · ${tone==='going'?'Jövök':tone==='not-going'?'Nem jövök':'Nincs válasz'}">
        <span class="cc-inline-person">
          <span class="cc-inline-avatar">${avatarHtml(p,'table')}</span>
          <span class="cc-inline-name-stack"><strong class="cc-inline-name" title="${esc(name)}">${esc(name)}</strong>${showMatchRsvp?`<small class="cc-match-rsvp-status ${tone}">${tone==='going'?'Jövök':tone==='not-going'?'Nem jövök':'Nincs válasz'}</small>`:''}${tone==='not-going'&&text(p.note)?`<small class="cc-inline-decline-note" title="${esc(p.note)}">${esc(p.note)}</small>`:''}</span>
          <span class="cc-inline-player-number" title="Mezszám">${jersey?'#'+esc(jersey):'–'}</span>
        </span>
        <span class="cc-compact-roster-presence">${ccCompetitionAttendanceSlider_(p,attendanceEditable)}</span>
        <button type="button" class="cc-compact-roster-open" data-roster-profile-open="${esc(p.playerId||p.id)}" aria-label="${esc(name)} részletes játékoskártyája" title="Részletes játékoskártya"><span class="triangle-icon" aria-hidden="true"></span></button>
      </div>`;
    }).join('');
    return `<div class="cc-inline-player-grid" aria-label="Játékosok részvételi állapot és mezszám szerint">${html||'<span class="roster-empty">Nincs játékos a névsorban.</span>'}</div>`;
  }
  // The event detail keeps all player data, but is no longer divided by positions.
  function ccTrainingInlineRosterHtml_(rows,eventId,editable,attendanceEditable){
    const players=ccRosterSortedByResponse_(rows);
    return `<div class="cc-compact-roster-list" aria-label="Játékosok rendezve: jövök, nem jövök, nincs válasz"><div class="cc-compact-roster-players">${players.map(p=>ccCompactRosterRowHtml_(p,eventId,editable,attendanceEditable)).join('')||'<span class="roster-empty">Nincs játékos a névsorban.</span>'}</div></div>`;
  }
  // BEAC event card opens the original event detail; roster/RSVP UUID is preserved.
  // Verified directly against user-provided MRSZ Back Office sheets, 20 Oct 2026.
  // Exact source key, league, date, both teams, final score AND all set scores are required.
  const CC_MANAGER_OFFICIAL_RESULT_REPORTS_=Object.freeze({
    'ui20261018:menB:beac:pdse:1':{league:'Férfi Budapest I. osztály – B csoport',date:'2026-10-19',home:'beac',away:'pdse',hs:3,as:0,sets:[[25,18],[25,23],[25,20]],code:'2699'},
    'ui20261018:womenI:panoramase:kresc:1':{league:'Női Budapest I. osztály',date:'2026-10-19',home:'panoramase',away:'kresc',hs:0,as:3,sets:[[17,25],[10,25],[12,25]],code:'2677'}
  });
  function ccManagerVerifiedOfficialReport_(m){
    const key=text(m?.sourceMatchKey||m?._ccSourceKey),
      proof=CC_MANAGER_OFFICIAL_RESULT_REPORTS_[key],sets=m?.setScores;
    if(!proof||m?._ccSourceSystem!=='user'||m?._ccSourceKind!=='result'
      ||text(m?.season)!=='2026/27'||text(m?.status)!=='played'
      ||text(m?.competitionLabel)!==proof.league
      ||ccMrszLocalKickoff_(m.startsAt).date!==proof.date
      ||ccMrszNormPairName_(m?.homeName)!==proof.home
      ||ccMrszNormPairName_(m?.awayName)!==proof.away
      ||Number(m?.homeSets)!==proof.hs||Number(m?.awaySets)!==proof.as
      ||!Array.isArray(sets)||sets.length!==proof.sets.length)return null;
    if(!sets.every((set,i)=>Number(set?.home)===proof.sets[i][0]&&Number(set?.away)===proof.sets[i][1]))return null;
    return {matchCode:proof.code,url:'https://www.hunvolley.info/pr_00/_jegyzokonyv_terem/v01/jegyzokonyv_nyomtat.asp?p_merkozes_kod='+proof.code+'&p_evad_kod=2026'};
  }
  function ccManagerOfficialResultForEvent_(e){
    if(eventType(e)!=='match')return null;
    const eventDay=ccMrszLocalKickoff_(e?.startsAt||e?.starts_at).date;
    const title=ccMrszNormPairName_(e?.title),men=eventTeamId(e)==='10000000-0000-4000-8000-000000000003';
    if(!men||!title.includes('pdse')||eventDay!=='2026-10-19')return null;
    const matches=(ccMrszPhotoState_.userMatches||[]).filter(m=>
      text(m.sourceMatchKey)==='ui20261018:menB:beac:pdse:1'&&!!ccManagerVerifiedOfficialReport_(m));
    return matches.length===1?matches[0]:null;
  }
  function ccManagerScoreboardCard_(e){
    const id=text(e.eventId||e.id),teamId=eventTeamId(e),
      teamName=text(e.teamName||teamById(teamId)?.name||'BEAC'),
      opponent=ccEventOpponent_(e),ha=text(e.homeAway||e.home_away),
      segments=text(e.title).split(/\s+[–—-]\s+/).map(text).filter(Boolean),
      home=segments.length>=2?segments[0]:(ha==='away'?opponent:teamName),
      away=segments.length>=2?segments.slice(1).join(' – '):(ha==='away'?teamName:opponent),
      recorded=competitionResultByEvent_(id),verified=ccManagerOfficialResultForEvent_(e),
      result=recorded?.homeSets!=null&&recorded?.awaySets!=null?recorded:(verified||recorded),
      league=teamId==='10000000-0000-4000-8000-000000000001'?'Női Budapest I. osztály'
        :teamId==='10000000-0000-4000-8000-000000000002'?'Női Budapest II. osztály – B csoport'
        :'Férfi Budapest I. osztály – B csoport',
      count=num(e.yesCount),roster=ccTeamRosterSize_(teamId),
      meta=count+' jövök'+(roster?' / '+roster+' kerettag':'');
    return ccMatchScoreboardHtml_({
      homeName:home,awayName:away,startsAt:e.startsAt||e.starts_at,
      venue:e.venue||e.court,homeSets:result?.homeSets??null,awaySets:result?.awaySets??null,
      setScores:result?.setScores,competitionLabel:league
    },{eventId:id,league,past:isEventPast(e),meta,badge:ha==='home'?'Hazai meccs':ha==='away'?'Idegenbeli meccs':'BEAC meccs'});
  }
  function ccCompetitionEventWithRosterHtml_(e,kind){
    const id=text(e.eventId||e.id),expanded=ccTrainingRosterOpenIds_.has(id),cached=state.eventRosterCache.get(id);
    const editable=ccEventCanEdit_(e),started=!!eventStart(e)&&eventStart(e)<=new Date(),attendanceEditable=editable&&started&&text(e.status||'active')!=='cancelled';
    return `<div class="cc-training-roster-item">${kind==='match'?ccManagerScoreboardCard_(e):ccEventCardHtml_(e,kind)}${kind==='match'&&ccManagerOfficialResultForEvent_(e)?'<a class="cc-event-official-protocol" href="'+esc(ccManagerVerifiedOfficialReport_(ccManagerOfficialResultForEvent_(e)).url)+'" target="_blank" rel="noopener noreferrer">MRSZ jegyzőkönyv ↗</a>':''}<button type="button" class="cc-training-roster-toggle legacy-mass-chevron ${expanded?'open':''}" data-training-roster-toggle="${esc(id)}" aria-expanded="${expanded?'true':'false'}" aria-label="Névsor ${expanded?'bezárása':'megnyitása'}"><span>Névsor</span>${kind==='match'?`<small class="cc-match-rsvp-summary">Jövök: ${num(e.yesCount)} · Nem jövök: ${num(e.noCount)} · Nincs válasz: ${num(e.unknownCount)}</small>`:''}<span class="triangle-icon" aria-hidden="true"></span></button><div class="cc-training-inline-roster" data-training-roster-holder="${esc(id)}" ${expanded?'':'hidden'}>${expanded?(cached?ccTrainingInlinePreviewHtml_(cached,id,editable,attendanceEditable,kind==='match'):'<span class="roster-loading">Névsor betöltése…</span>'):''}</div></div>`;
  }
  function ccCompetitionTrainingWithRosterHtml_(e){return ccCompetitionEventWithRosterHtml_(e,'training')}
  async function ccToggleTrainingInlineRoster_(id,button){
    const selector=`[data-training-roster-holder="${CSS.escape(id)}"]`,holder=document.querySelector(selector);
    if(!holder)return;const opening=holder.hidden;
    holder.hidden=!opening;
    button.setAttribute('aria-expanded',String(opening));
    button.setAttribute('aria-label',opening?'Névsor bezárása':'Névsor megnyitása');
    button.classList.toggle('open',opening);
    if(!opening){ccTrainingRosterOpenIds_.delete(id);return;}
    ccTrainingRosterOpenIds_.add(id);
    holder.innerHTML='<span class="roster-loading">Névsor betöltése…</span>';
    try{
      const rows=configured()?await loadEventRoster(id):[];
      const current=document.querySelector(selector),e=findEventById(id);
      if(ccTrainingRosterOpenIds_.has(id)&&current&&!current.hidden&&e){
        const editable=ccEventCanEdit_(e),attendanceEditable=editable&&!!eventStart(e)&&eventStart(e)<=new Date()&&text(e.status||'active')!=='cancelled';
        current.innerHTML=ccTrainingInlinePreviewHtml_(rows,id,editable,attendanceEditable,eventType(e)==='match');
        ccBindCompetitionRoster_(current,id,editable,attendanceEditable);
      }
    }catch(err){
      const current=document.querySelector(selector);
      if(ccTrainingRosterOpenIds_.has(id)&&current&&!current.hidden)
        current.innerHTML=`<span class="roster-loading error">${esc(err?.message||'A névsor betöltése sikertelen.')}</span>`;
    }
  }
  function ccBindTrainingRosterToggles_(){
    document.querySelectorAll('[data-training-roster-toggle]').forEach(button=>button.addEventListener('click',()=>ccToggleTrainingInlineRoster_(text(button.dataset.trainingRosterToggle),button)));
    document.querySelectorAll('[data-training-roster-holder]:not([hidden])').forEach(holder=>{
      const id=text(holder.dataset.trainingRosterHolder),e=findEventById(id);
      if(!e||!state.eventRosterCache.has(id))return;
      const editable=ccEventCanEdit_(e),attendanceEditable=editable&&!!eventStart(e)&&eventStart(e)<=new Date()&&text(e.status||'active')!=='cancelled';
      ccBindCompetitionRoster_(holder,id,editable,attendanceEditable);
    });
  }

  let ccTrainingVisibleLimit_=30;
  function renderCompetitionTrainingCards_(){if(!ccRouteIs_('competition','trainings'))return;
    state.eventFiltersOpen=filterOpen_('competition.trainings',false);
    const rows=filteredActivityEvents(e=>eventType(e)==='training'),visibleRows=rows.slice(0,ccTrainingVisibleLimit_),active=teamFilterIds_('events').length>0||state.eventPeriod!=='upcoming';
    $('#viewContent').innerHTML=`<div class="page-intro competition-list-intro cc-page-header-panel cc-training-page-header"><div><h2>Edzések</h2><p>Versenycsapat-edzések.</p></div><div class="page-actions competition-list-toolbar cc-icon-toolbar">${active?'<button class="filter-reset cc-toolbar-reset" id="eventFilterReset" type="button" aria-label="Szűrők törlése" title="Szűrők törlése">×</button>':''}<button class="matrix-filter-toggle icon-only cc-toolbar-icon ${state.eventFiltersOpen?'open':''} ${active?'has-filter':''}" id="eventFiltersToggle" aria-expanded="${state.eventFiltersOpen?'true':'false'}" type="button" aria-label="Szűrők" title="Szűrők"><span class="triangle-icon"></span></button>${canAnyAction('competition.trainings','edit')?'<button class="cc-toolbar-icon cc-add-square" id="competitionTrainingAdd" type="button" aria-label="Új edzés" title="Új edzés">+</button>':''}</div></div><div class="event-filter-head event-filter-head-inline-hidden"><button class="matrix-filter-toggle ${state.eventFiltersOpen?'open':''} ${active?'has-filter':''}" id="eventFiltersToggleLegacy" type="button"></button></div><div class="filter-panel parity-event-filters" id="eventFiltersPanel" ${state.eventFiltersOpen?'':'hidden'}><div class="field compact">${teamMultiFilterHtml_('events')}</div><label class="field compact"><span>Időszak</span><select id="eventPeriodFilter"><option value="upcoming" ${state.eventPeriod==='upcoming'?'selected':''}>Mai és közelgő</option><option value="past" ${state.eventPeriod==='past'?'selected':''}>Elmúlt</option><option value="all" ${state.eventPeriod==='all'?'selected':''}>Mind</option></select></label></div><article class="panel cc-event-card-panel cc-training-card-panel"><div class="panel-head"><div><h3>${state.eventPeriod==='past'?'Elmúlt edzések':'Következő edzések'}</h3><p>${rows.length} alkalom a szűrésben</p></div></div><div class="cc-event-card-list">${visibleRows.map(ccCompetitionTrainingWithRosterHtml_).join('')||emptyInline('Nincs edzés ebben a szűrésben.')}</div>${rows.length>visibleRows.length?`<div class="cc-training-more-wrap"><button id="ccTrainingShowMore" type="button" class="button quiet">További edzések · ${rows.length-visibleRows.length} hátravan</button></div>`:''}</article>`;
    $('#competitionTrainingAdd')?.addEventListener('click',()=>openCompetitionEventEditor(null,'training'));
    const toggle=$('#eventFiltersToggle'),panel=$('#eventFiltersPanel');
    toggle?.addEventListener('click',()=>{const open=setFilterOpen_('competition.trainings',!state.eventFiltersOpen);state.eventFiltersOpen=open;toggle.setAttribute('aria-expanded',String(open));toggle.classList.toggle('open',open);if(panel)panel.hidden=!open;ccBlurPointerControl_(toggle)});
    bindTeamMultiFilter_('events',()=>{ccTrainingVisibleLimit_=30;renderCompetitionTrainingCards_()});
    $('#eventPeriodFilter')?.addEventListener('change',e=>{state.eventPeriod=e.target.value;afterNativePicker(e.target,()=>{ccTrainingVisibleLimit_=30;renderCompetitionTrainingCards_()},'#eventFiltersPanel')});
    $('#eventFilterReset')?.addEventListener('click',()=>{state.eventTeam='';state.teamFilters.events=[];state.eventPeriod='upcoming';ccTrainingVisibleLimit_=30;renderCompetitionTrainingCards_()});
    $('#ccTrainingShowMore')?.addEventListener('click',()=>{ccTrainingVisibleLimit_+=30;renderCompetitionTrainingCards_()});
    document.querySelectorAll('.cc-postponed-filter').forEach(el=>el.addEventListener('change',e=>{ccLeaguePostponedFilter_=e.target.value;renderCompetitionMatchCards_()}));
    bindEventDetailActions();
    ccBindMrszProtocol_();
    ccBindTrainingRosterToggles_();
    void ccHydrateCardPositions_(visibleRows,renderCompetitionTrainingCards_);
  }

  function ccCompetitionSyncLastRun_(){return state.competitionSyncStatus?.lastRun||null}
  function ccCompetitionSyncSummary_(){
    const r=ccCompetitionSyncLastRun_();
    if(!r)return 'BRSZ · még nincs frissítési előzmény';
    const when=r.completed_at||r.started_at,stamp=when?`${fmtDate(when)} ${fmtTime(when)}`:'–';
    const statusText=r.status==='success'?'rendben':r.status==='partial'?'részleges':r.status==='failed'?'hiba':'fut';
    return `BRSZ · ${stamp} · ${statusText} · ${num(r.created_events)} új · ${num(r.updated_events)} módosult${Number(r.review_count||0)?` · ${num(r.review_count)} ellenőrzendő`:''}`;
  }
  // Audit is read-only; RSVP totals are the current values, not historical snapshots.
  function ccCompetitionAuditLabel_(kind){
    return ({created:'Új meccs',opponent:'Ellenfélváltozás',schedule:'Időpontváltozás',time:'Időpontváltozás',venue:'Helyszínváltozás',result:'Eredményváltozás'})[text(kind)]||'Meccsváltozás';
  }
  function ccCompetitionAuditRowsHtml_(items,scope='all'){
    const visible=(Array.isArray(items)?items:[]).filter(c=>scope==='all'||(scope==='created'?text(c.changeType)==='created':text(c.changeType)!=='created'));
    if(!visible.length)return '<p class="cc-audit-empty">Nincs változás ebben a szűrésben.</p>';
    const fields=[['title','Mérkőzés'],['startsAt','Kezdés'],['venue','Helyszín'],['status','Állapot']];
    const display=(key,value)=>key==='startsAt'?(value?fmtDate(value)+' '+fmtTime(value):'–'):(text(value)||'–');
    return visible.map(c=>{
      const before=c.before||{},after=c.after||{},created=text(c.changeType)==='created',r=c.responses||{},id=text(c.eventId);
      const rows=fields.filter(([key])=>created?['title','startsAt'].includes(key):text(before[key])!==text(after[key]))
        .map(([key,label])=>'<div class="cc-audit-field"><span>'+esc(label)+'</span><div>'
          +(created?'':'<s>'+esc(display(key,before[key]))+'</s>')
          +'<strong>'+esc(display(key,after[key]))+'</strong></div></div>').join('');
      return '<article class="cc-audit-item"><header><b>'+esc(ccCompetitionAuditLabel_(c.changeType))+'</b><time>'+esc(fmtDate(c.detectedAt))+' '+esc(fmtTime(c.detectedAt))+'</time></header>'
        +'<h4>'+esc(text(after.title)||text(before.title)||'Ismeretlen meccs')+'</h4>'
        +(rows||'<p class="cc-audit-empty">Nincs részletezett mezőváltozás.</p>')
        +'<p class="cc-audit-rsvp">Jelenlegi válaszok: <b>'+num(r.total||0)+'</b> · Jövök: '+num(r.going||0)+' · Nem jövök: '+num(r.notGoing||0)+' · Egyéb: '+num(r.unknown||0)+'</p>'
        +'<div class="cc-audit-foot"><code>'+esc(id||'Nincs eseményazonosító')+'</code>'
        +(c.eventExists===true&&id?'<button type="button" class="button quiet small" data-cc-audit-event="'+esc(id)+'">Meccs megnyitása</button>':'<small>Nem található kapcsolt meccs</small>')
        +'</div></article>';
    }).join('');
  }
  async function ccOpenCompetitionChangeAudit_(){
    const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');
    if(!d||!body||!title)return;
    if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='VERSENYSPORT · BRSZ NAPLÓ';
    title.textContent='Meccsváltozások';
    body.innerHTML='<div id="ccChangeAuditLoading" class="roster-loading">Napló betöltése…</div>';
    ccOpenDialogStable_(d);
    try{
      const res=await rpc('cc_manager_competition_change_audit_v1',{p_limit:100});
      if(!d.open||!body.querySelector('#ccChangeAuditLoading'))return;
      const items=Array.isArray(res)?res:[];
      body.innerHTML='<div class="cc-audit-root"><p>Az eredeti BRSZ-napló. A jelentkezések számai <b>jelenlegi</b> értékek. Ezen a felületen semmilyen adat nem módosul.</p>'
        +'<label class="field compact"><span>Szűrés</span><select id="ccChangeAuditFilter"><option value="all">Összes ('+num(items.length)+')</option>'
        +'<option value="updated">Módosítások ('+num(items.filter(c=>text(c.changeType)!=='created').length)+')</option>'
        +'<option value="created">Új meccsek ('+num(items.filter(c=>text(c.changeType)==='created').length)+')</option>'
        +'</select></label><div id="ccChangeAuditItems">'+ccCompetitionAuditRowsHtml_(items)+'</div></div>';
      const bindOpen=()=>body.querySelectorAll('[data-cc-audit-event]').forEach(button=>button.addEventListener('click',()=>{
        const id=text(button.dataset.ccAuditEvent);
        if(!findEventById(id)){status('A meccs nem található a jelenlegi események között.','error');return;}
        ccCloseEntityDialog_();openEventDetail(id);
      }));
      bindOpen();
      $('#ccChangeAuditFilter')?.addEventListener('change',e=>{
        const host=$('#ccChangeAuditItems');
        if(host){host.innerHTML=ccCompetitionAuditRowsHtml_(items,text(e.target.value));bindOpen();}
      });
    }catch(err){
      if(d.open&&body.querySelector('#ccChangeAuditLoading'))body.innerHTML='<p class="cc-audit-empty">A változásnapló nem tölthető be: '+esc(err?.message||'Ismeretlen hiba')+'</p>';
    }
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
  function ccBrszImportPreviewHtml_(documents){
    const rows=(documents||[]).map(doc=>{
      const name=CC_BRSZ_COMPETITION_HTML_V1[text(doc.competitionId)]||'Ismeretlen bajnokság';
      return '<li><span>'+esc(name)+'</span><small>'+esc(doc.name||'BRSZ.html')+'</small></li>';
    }).join('');
    return '<div class="cc-brsz-import-review">'
      +'<p>Három 2026/27-es BRSZ bajnokságoldal felismerve. Az adatok még <strong>nem kerültek be az adatbázisba</strong>.</p>'
      +'<ul>'+rows+'</ul>'
      +'<p class="cc-brsz-import-caution">Az import a meglévő meccseket azonosítójuk alapján frissíti. Az ütköző vagy bizonytalan párosítások ellenőrzésre kerülnek. A játékosok jelentkezései és a létszámok megmaradnak.</p>'
      +'<div class="dialog-action-row"><button type="button" class="button quiet" id="ccBrszImportAbort">Mégse</button>'
      +'<button type="button" class="button primary" id="ccBrszImportConfirm">Importálás indítása</button></div></div>';
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
  // Desktop helper and phone HTML file imports share the exact same verified server pipeline.
  function ccOpenBrszSyncOptions_(){
    if(state.competitionSyncBusy)return;
    const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');
    if(!d||!body||!title)return;
    if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='VERSENYSPORT · BRSZ FRISSÍTÉS';
    title.textContent='Bajnoki meccsek frissítése';
    body.innerHTML='<div class="cc-brsz-sync-chooser">'
      +'<p>A korábbi jelentkezések és létszámok a meglévő meccsazonosítóhoz kapcsolódnak. Bizonytalan mérkőzést kézzel kell egyeztetni.</p>'
      +'<button type="button" class="button primary" id="ccBrszSyncMobile">HTML-fájlok kiválasztása</button>'
      +'<small>Telefonon is működik: a három 2026/27-es BRSZ bajnokságoldal mentett .html fájlját válaszd ki a Fájlokból. A böngészőben megnyitott link önmagában nem elég.</small>'
      +'<button type="button" class="button quiet" id="ccBrszSyncHelper">Frissítés Chrome-kiegészítővel</button>'
      +'<small>Számítógépen, telepített Club Control BRSZ Helperrel. Nem szükséges kézzel fájlokat menteni.</small>'
      +'<button type="button" class="button quiet" id="ccBrszSyncCancel">Mégse</button></div>';
    ccOpenDialogStable_(d);
    $('#ccBrszSyncMobile')?.addEventListener('click',()=>{ccCloseEntityDialog_();void runCompetitionSourceSync_('html_import')});
    $('#ccBrszSyncHelper')?.addEventListener('click',()=>{ccCloseEntityDialog_();void runCompetitionSourceSync_('browser_helper')});
    $('#ccBrszSyncCancel')?.addEventListener('click',ccCloseEntityDialog_);
  }
  function ccConfirmBrszHtmlImport_(documents){
    return new Promise(resolve=>{
      const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');
      if(!d||!body||!title){resolve(false);return;}
      if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='VERSENYSPORT · IMPORT ELLENŐRZÉSE';
      title.textContent='Kiválasztott BRSZ-adatok';
      body.innerHTML=ccBrszImportPreviewHtml_(documents);
      let settled=false;
      const onClose=()=>finish(false);
      function finish(approved){
        if(settled)return;
        settled=true;
        d.removeEventListener('close',onClose);
        if(d.open)d.close();
        resolve(approved);
      }
      d.addEventListener('close',onClose);
      ccOpenDialogStable_(d);
      $('#ccBrszImportConfirm')?.addEventListener('click',()=>finish(true),{once:true});
      $('#ccBrszImportAbort')?.addEventListener('click',()=>finish(false),{once:true});
    });
  }
  async function runCompetitionSourceSync_(mode='browser_helper'){
    if(state.competitionSyncBusy)return;
    if(!state.supabase?.functions){status('A Supabase Edge Functions kliens nem érhető el.','error');return;}
    state.competitionSyncBusy=true;renderCompetitionMatchCards_();
    competitionStatus_(mode==='html_import'?'BRSZ HTML-fájlok kiválasztása…':'BRSZ Helper indítása…');
    try{
      let documents;
      if(mode==='html_import'){
        const selected=await ccPickBrszHtmlFiles_();
        if(!selected.length){competitionStatus_('BRSZ-fájlok kiválasztása megszakítva.');return;}
        documents=await ccPrepareBrszHtmlDocuments_(selected);
        if(!await ccConfirmBrszHtmlImport_(documents)){
          competitionStatus_('BRSZ-import megszakítva. Semmilyen meccs vagy jelentkezés nem változott.');
          return;
        }
      }else{
        documents=ccValidateHelperDocuments_(await ccRequestBrszHelperDocuments_());
      }
      competitionStatus_('BRSZ adatok feldolgozása…');
      const {data,error}=await state.supabase.functions.invoke('cc-competition-sync',{body:{source:'brsz',season:'2026/27',mode,documents}});
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


  // Competition schedule snapshot. This is historical, user-supplied source data,
  // not a live BRSZ feed; never use it for automatic match or result writes.
  const CC_LEAGUE_GROUPS_=Object.freeze([
    ['Női I. osztály','1121'],
    ['Női II. osztály B csoport','1146'],
    ['Férfi I. osztály B csoport','1137']
  ]);
  let ccLeagueFixtureRows_=null,ccLeagueFixtureLoading_=false,ccLeagueFixtureError_='',ccLeagueSelectedGroup_='all',ccLeagueSnapshotScope_='beac';
  async function ccLoadLeagueFixtureSnapshot_(){
    if(ccLeagueFixtureRows_||ccLeagueFixtureLoading_)return;
    ccLeagueFixtureLoading_=true;
    try{
      const response=await fetch('./data/brsz_group_fixtures_2026_27_source.json',{cache:'no-store'});
      if(!response.ok)throw new Error('MENETREND_FORRAS_NEM_ELERHETO');
      const d=await response.json();
      if(d?.season!=='2026/27'||!Array.isArray(d.fixtures))throw new Error('MENETREND_ADATFORMA_HIBAS');
      ccLeagueFixtureRows_=d.fixtures.filter(f=>CC_LEAGUE_GROUPS_.some(([name])=>name===f.group));
      ccLeagueFixtureError_='';
    }catch(err){ccLeagueFixtureError_=text(err?.message||'A menetrend nem tölthető be.')}
    finally{ccLeagueFixtureLoading_=false;if(ccRouteIs_('competition','matches'))renderCompetitionMatchCards_();}
  }
  function ccLeagueFixturePanelHtml_(){
    const group=ccLeagueSelectedGroup_;
    const groups=CC_LEAGUE_GROUPS_;
    const sourceText='Korábbi, 2026.10.01-i mentett forrásadatok · tájékoztató, nem élő BRSZ-frissítés';
    const selector=`<label class="field compact cc-league-group-filter"><span>Bajnokság</span><select id="ccLeagueGroupSelect"><option value="all" ${group==='all'?'selected':''}>Mindhárom bajnokság</option>${groups.map(([name])=>`<option value="${esc(name)}" ${group===name?'selected':''}>${esc(name)}</option>`).join('')}</select></label>`;
    const all=(ccLeagueFixtureRows_||[]).filter(f=>group==='all'||f.group===group);
    const beac=f=>ccIsBeacLeagueTeam_(f.home)||ccIsBeacLeagueTeam_(f.away);
    const filtered=all.filter(f=>ccLeagueSnapshotScope_==='all'||beac(f)||f.review===true)
      .sort((a,b)=>text(a.date||'9999').localeCompare(text(b.date||'9999'))||text(a.time).localeCompare(text(b.time)));
    const leagueMap={'Női I. osztály':'Női Budapest I. osztály',
      'Női II. osztály B csoport':'Női Budapest II. osztály – B csoport',
      'Férfi I. osztály B csoport':'Férfi Budapest I. osztály – B csoport'};
    const rows=filtered.map(f=>{
      const review=f.review===true||!f.date||!f.home||!f.away,
        league=leagueMap[f.group]||f.group;
      // Match on saved Budapest-local date + normalized home/away clubs, never on row number.
      const match=review?null:(ccMrszPhotoState_.matches||[]).find(m=>
        text(m.competitionLabel)===league&&ccMrszLocalKickoff_(m.startsAt).date===text(f.date)
        &&ccMrszNormPairName_(m.homeName)===ccMrszNormPairName_(f.home)
        &&ccMrszNormPairName_(m.awayName)===ccMrszNormPairName_(f.away));
      return ccMatchScoreboardHtml_({
        homeName:f.home||'Ismeretlen hazai',awayName:f.away||'Ismeretlen vendég',
        startsAt:f.date?(f.date+'T'+(f.time||'00:00')+':00'):'',
        homeSets:match?.homeSets??null,awaySets:match?.awaySets??null,
        setScores:match?.setScores||[],venue:f.venue||f.group,competitionLabel:league
      },{league,badge:review?'Ellenőrzendő':match?'Mentett eredmény':'Bajnoki menetrend',
        meta:review?'Kézi ellenőrzés szükséges':match?'MRSZ · 2026.10.14-i eredmény':'2026.10.01-i mentett kiírás'});
    }).join('');
    const scopeButtons='<div class="cc-league-match-scope cc-league-fixture-scope" role="group" aria-label="Bajnoki mérkőzések">'
      +'<button type="button" data-league-snapshot-scope="beac" aria-pressed="'+(ccLeagueSnapshotScope_==='beac')+'" class="'+(ccLeagueSnapshotScope_==='beac'?'active':'')+'">BEAC meccsek</button>'
      +'<button type="button" data-league-snapshot-scope="all" aria-pressed="'+(ccLeagueSnapshotScope_==='all')+'" class="'+(ccLeagueSnapshotScope_==='all'?'active':'')+'">Összes bajnoki meccs</button></div>';
    return `<article class="panel cc-league-fixture-panel">
      <div class="panel-head cc-league-fixture-head"><div><h3>Bajnoki menetrend · ismert mérkőzések</h3><p>${sourceText} · ${filtered.length} / ${all.length} meccs</p></div>${selector}</div>${scopeButtons}
      <p class="cc-league-fixture-warning">Ez a korábbi adatcsomag nem teljes és nem aktuális hivatalos menetrend. Az új eredményekhez BRSZ-frissítés szükséges; semmit nem ír át a meccsnaptárban.</p>
      ${ccLeagueFixtureError_?`<p class="roster-loading error">${esc(ccLeagueFixtureError_)}</p>`:
      ccLeagueFixtureRows_?`<div class="cc-league-fixture-list">${rows||'<p>Nincs ismert mérkőzés ebben a csoportban.</p>'}</div>`:
      '<p class="roster-loading">Mentett bajnoki menetrend betöltése…</p>'}
      <div class="cc-league-fixture-links">${groups.filter(([name])=>group==='all'||group===name).map(([name,id])=>
        `<a href="https://www.brsz.hu/bajnoksagok.php?bajnoksag_id=${id}" target="_blank" rel="noopener noreferrer">${esc(name)} · hivatalos BRSZ oldal ↗</a>`).join('')}</div>
    </article>`;
  }


  // Isolated Hunvolley screenshots: not the automatic BRSZ schedule or league source.
  let ccMrszPhotoState_={loaded:false,loading:false,error:'',matches:[],fixtures:[],tables:[],userMatches:[],canonicalMatches:[],canonicalCoverage:[],canonicalTeamStats:[]};
  let ccBrszEffectiveMatches_=[];
  // Snapshot-based league selection is independent from BEAC team permissions.
  // Empty value means follow the existing BEAC team context.
  let ccLeagueContextSelection_=(()=>{try{return text(localStorage.getItem('cc-manager-league-context-v1'))}catch(_){return''}})();
  function ccLeagueCatalog_(){
    return window.CCCompetitionContextCatalog?.build({
      season:'2026/27',fixtures:ccMrszPhotoState_.fixtures,
      matches:ccMrszPhotoState_.matches,tables:ccMrszPhotoState_.tables
    })||[];
  }
  function ccCurrentLeague_(fallback){
    const entries=ccLeagueCatalog_(),chosen=entries.find(c=>c.competitionLabel===ccLeagueContextSelection_);
    return chosen?.competitionLabel||fallback;
  }
  function ccLeagueContextSelectHtml_(current){
    const contexts=ccLeagueCatalog_();
    const options=contexts.map(c=>'<option value="'+esc(c.competitionLabel)+'" '+(c.competitionLabel===current?'selected':'')+'>'+esc(c.competitionLabel)+'</option>').join('');
    return '<label class="cc-league-context-picker"><span>Bajnokság / csoport</span><select id="ccLeagueContextSelect" aria-label="Bajnokság és csoport" '+(contexts.length?'':'disabled')+'>'+
      (contexts.length?options:'<option>Mentett bajnokságok betöltése…</option>')+'</select></label>';
  }
  function ccSetLeagueContext_(label){
    const c=ccLeagueCatalog_().find(row=>row.competitionLabel===label);
    if(!c)return;
    ccLeagueContextSelection_=c.competitionLabel;
    state.managerStandingsTeam='all';
    ccLeagueMatchScope_='all';
    try{localStorage.setItem('cc-manager-league-context-v1',ccLeagueContextSelection_);localStorage.setItem('cc-manager-standings-team','all')}catch(_){}
    if(ccRouteIs_('competition','matches'))renderCompetitionMatchCards_();
    else renderManagerStandings_();
  }
  function ccClearLeagueContext_(){
    ccLeagueContextSelection_='';
    try{localStorage.removeItem('cc-manager-league-context-v1')}catch(_){}
  }
  async function ccLoadMrszPhotoSnapshot_(){
    if(ccMrszPhotoState_.loaded||ccMrszPhotoState_.loading)return;
    ccMrszPhotoState_.loading=true;
    try{
      const [data,sourceMatches,userMatches]=await Promise.all([rpc('cc_manager_competition_mrsz_snapshot_v2'),rpc('cc_manager_competition_source_matches_effective_v1'),rpc('cc_manager_competition_user_schedule_v1').catch(()=>[])]);
      ccBrszEffectiveMatches_=Array.isArray(sourceMatches)?sourceMatches:[];
      ccMrszPhotoState_={loaded:true,loading:false,error:'',matches:Array.isArray(data?.matches)?data.matches:[],fixtures:Array.isArray(data?.fixtures)?data.fixtures:[],tables:Array.isArray(data?.tables)?data.tables:[],userMatches:Array.isArray(userMatches)?userMatches:[],canonicalMatches:Array.isArray(data?.canonicalMatches)?data.canonicalMatches:[],canonicalCoverage:Array.isArray(data?.canonicalCoverage)?data.canonicalCoverage:[],canonicalTeamStats:Array.isArray(data?.canonicalTeamStats)?data.canonicalTeamStats:[]};
    }catch(err){ccBrszEffectiveMatches_=[];ccMrszPhotoState_={loaded:true,loading:false,error:text(err?.message||err),matches:[],fixtures:[],tables:[]}}
    if(ccRouteIs_('competition','matches'))renderCompetitionMatchCards_();
    else if(ccRouteIs_('competition','standings'))renderManagerStandings_();
    else if(ccRouteIs_('competition','overview'))renderOverview();
  }

  let ccMrszMenGroup_='B';
  function ccMrszMenGroupTableHtml_(){
    const a=ccMrszMenGroup_==='A';
    const sourceA=(ccMrszPhotoState_.tables||[]).find(t=>String(t.competitionLabel||'').includes('Férfi')&&String(t.competitionLabel||'').includes('A csoport'));
    const raw=a?(sourceA?.rows||[]):standingsForContext_('10000000-0000-4000-8000-000000000003').filter(r=>Number(r.position)>0&&Number(r.played)>0);
    const rows=raw.map(x=>`<tr><td>${esc(ccMrszStatPosition_(x.position,a?sourceA:null))}</td><td>${esc(x.teamName)}${ccMrszRecordNoticeHtml_(x)}</td><td>${ccMrszStatNumber_(x.played)}</td><td>${ccMrszRecordNumber_(x,'wins')}</td><td>${ccMrszRecordNumber_(x,'losses')}</td><td>${ccMrszStatNumber_(x.tablePoints)}</td></tr>`).join('');
    return `<div class="cc-mrsz-men-group-context"><small>${a?ccMrszCoverageLabel_(sourceA):'B csoport · BRSZ/BEAC mentett állás · forrásdátum nem igazolt · nem élő adat'}</small><div class="cc-mrsz-photo-table-scroll"><table><thead><tr><th>#</th><th>Csapat</th><th>M</th><th>GY</th><th>V</th><th>P</th></tr></thead><tbody>${rows||'<tr><td colspan="6">Ehhez a csoporthoz nincs mentett tabella.</td></tr>'}</tbody></table></div></div>`;
  }
  function ccMrszMenGroupSwitcherHtml_(){
    return `<section class="cc-mrsz-men-group-switch"><div class="cc-mrsz-men-group-head"><b>Férfi Budapest I. osztály</b><span role="group" aria-label="Férfi bajnoki csoport"><button type="button" data-mrsz-men-group="B" aria-pressed="${ccMrszMenGroup_==='B'}" class="${ccMrszMenGroup_==='B'?'active':''}">B csoport</button><button type="button" data-mrsz-men-group="A" aria-pressed="${ccMrszMenGroup_==='A'}" class="${ccMrszMenGroup_==='A'?'active':''}">A csoport</button></span></div><div id="ccMrszMenGroupBody">${ccMrszMenGroupTableHtml_()}</div></section>`;
  }

  function ccMrszMainGroupButtonsHtml_(){
    return '<div class="cc-mrsz-main-group-buttons"><small>Férfi bajnokság · csoport</small><div role="group" aria-label="Férfi bajnokság csoport">'
    +['B','A'].map(g=>'<button type="button" data-mrsz-men-group="'+g+'" aria-pressed="'+(ccMrszMenGroup_===g)+'" class="'+(ccMrszMenGroup_===g?'active':'')+'">'+g+' csoport</button>').join('')+'</div></div>';
  }
  function ccMrszMainPhotoTableHtml_(table){
    const rows=Array.isArray(table?.rows)?table.rows:[];
    const label=text(table?.competitionLabel||'Bajnoki tabella');
    const body=rows.map(r=>'<tr><td><b>'+esc(ccMrszStatPosition_(r.position,table))+'</b></td><td class="team"><span class="cc-mrsz-photo-team">'+msLogoHtml_('',r.teamName)+'<strong>'+esc(r.teamName)+'</strong>'+ccMrszRecordNoticeHtml_(r)+'</span></td>'
     +'<td>'+ccMrszStatNumber_(r.played)+'</td><td>'+ccMrszRecordNumber_(r,'wins')+'</td><td>'+ccMrszRecordNumber_(r,'losses')+'</td><td class="group-end"><b>'+ccMrszStatNumber_(r.tablePoints)+'</b></td><td>'+esc(ccMrszStatPair_(r.setsFor,r.setsAgainst))+'</td><td>'+esc(ccMrszStatRatio_(r.setsFor,r.setsAgainst))+'</td><td>'+esc(ccMrszStatPair_(r.pointsFor,r.pointsAgainst))+'</td><td>'+esc(ccMrszStatRatio_(r.pointsFor,r.pointsAgainst))+'</td></tr>').join('');
    return '<article class="panel ms-standings-card cc-mrsz-main-photo"><div class="ms-title"><div><h3>'+esc(label)+'</h3>'
     +'<p>'+esc(ccMrszCoverageLabel_(table))+'</p></div></div><div class="ms-table-scroll"><table class="ms-table">'
     +'<thead><tr><th>#</th><th class="team">Csapat</th><th>M</th><th>GY</th><th>V</th><th class="group-end">P</th><th>SZ</th><th>SZA</th><th>P</th><th>PA</th></tr></thead><tbody>'
     +(body||'<tr><td colspan="10">Ehhez a bajnoksághoz nincs rögzített tabella.</td></tr>')+'</tbody></table></div></article>';
  }

  // League fixture cards use the existing ms-match-row design; source data is not changed.
  function ccMrszNormPairName_(name){
    // Match only known, complete aliases. Substring matching would merge distinct squads
    // (e.g. MTK / MTK U20, Kandó / Kandó II) and attribute results to the wrong team.
    const compact=text(name).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLowerCase().replace(/[^a-z0-9]/g,'');
    if(!compact)return '';
    const aliases={
      kando:'kando',kandosportklub:'kando',kandosportclub:'kando',kandosk:'kando',obudaiegyetemkandosc:'kando',
      btdse:'btdse',btdsetaksony:'btdse',broziktibortaksonyidiaksportegyesulet:'btdse',
      semmelweisegyetem:'semmelweis',semmelweisegyetemsportklub:'semmelweis',
      emericus:'emericus',emericusse:'emericus',
      rackeve:'rackeve',rackevese:'rackeve',
      mtk:'mtk',mtkbudapest:'mtk',
      mtkkek:'mtk-kek',mtkbudapestkek:'mtk-kek'
    };
    if(Object.hasOwn(aliases,compact))return aliases[compact];
    const beac=/^budapestiegyetemiatletikaiclub(i{1,3})?$/.exec(compact);
    if(beac)return 'beac'+(beac[1]||'');
    return compact;
  }
  function ccMrszLocalKickoff_(value){
  const raw=String(value||'');
  const fallback={date:raw.slice(0,10),time:raw.slice(11,16)};
  if(raw.length<17||!/(?:[zZ]|[+-]\d{2}(?::?\d{2})?)$/.test(raw))return fallback;
  const instant=new Date(raw);
  if(Number.isNaN(instant.getTime()))return fallback;
  const pieces=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Budapest',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(instant);
  const get=kind=>pieces.find(part=>part.type===kind)?.value||'';
  return {date:get('year')+'-'+get('month')+'-'+get('day'),time:get('hour')+':'+get('minute')};
  }

  // One display for linked Manager events and read-only federation fixtures.
  // Uses actual saved outcomes only; zero-zero and missing scores are never treated as results.
  function ccMatchScoreboardRank_(league,name){
    const table=(ccMrszPhotoState_.tables||[]).find(t=>text(t.competitionLabel)===text(league)&&t.partial===false);
    const key=ccMrszNormPairName_(name);
    const candidates=key?(table?.rows||[]).filter(r=>ccMrszNormPairName_(r.teamName)===key):[];
    const row=candidates.length===1?candidates[0]:null;
    const rank=Number(row?.position);
    return row&&Number.isInteger(rank)&&rank>0?rank:null;
  }
  // Check only explicitly saved set points. Missing or partial lists are not proof
  // that the match result is wrong; an impossible saved set or a full contradictory
  // list is separated for review instead of silently being treated as verified.
  function ccMrszSetScoreIssue_(m){
    const rows=m?.setScores;
    if(!Array.isArray(rows)||rows.length===0)return '';
    const hs=Number(m?.homeSets),as=Number(m?.awaySets);
    if(m?.homeSets==null||m?.awaySets==null||!Number.isInteger(hs)||!Number.isInteger(as)||hs<0||as<0)return '';
    if(rows.length>hs+as||rows.length>5)return 'Több szettpontszám van, mint amennyi játszmát a végeredmény tartalmaz';
    let homeWins=0,awayWins=0;
    for(let i=0;i<rows.length;i++){
      const pair=rows[i],rawHome=text(pair?.home),rawAway=text(pair?.away);
      if(rawHome===''||rawAway==='')return 'Hiányzó játszmapontszám';
      const h=Number(rawHome),a=Number(rawAway);
      if(!Number.isSafeInteger(h)||!Number.isSafeInteger(a)||h<0||a<0||h===a)
        return 'Érvénytelen játszmapontszám';
      const target=i===4?15:25;
      if(Math.max(h,a)<target||Math.abs(h-a)<2)return 'A játszmapontszám nem lehet befejezett röplabdaszett eredménye';
      if(h>a)homeWins++;else awayWins++;
      if((homeWins===3||awayWins===3)&&i!==rows.length-1)
        return 'A játszmák sorrendje nem egyezik a befejezett mérkőzéssel';
    }
    if(rows.length===hs+as&&(homeWins!==hs||awayWins!==as))
      return 'A játszmánkénti pontszámok nem egyeznek a mentett végeredménnyel';
    return '';
  }
  // Completeness is about the recorded set-point list, not verification of
  // the source or proof that the match result is official/current.
  function ccMrszSetCoverageLabel_(m){
    const hs=Number(m?.homeSets),as=Number(m?.awaySets);
    if(m?.homeSets==null||m?.awaySets==null||!Number.isInteger(hs)||!Number.isInteger(as)||hs<0||as<0||hs+as===0)return '';
    if(ccMrszSetScoreIssue_(m))return 'Szettadat ellenőrzendő';
    const count=Array.isArray(m?.setScores)?m.setScores.length:0;
    if(!count)return 'Nincs rögzített szettpontszám';
    return count+'/'+(hs+as)+' szett'+(count===hs+as?'':' · részleges');
  }
  function ccMatchScoreboardHtml_(m,options={}){
    const home=text(m.homeName||'Hazai csapat'),away=text(m.awayName||'Vendégcsapat'),
      id=text(options.eventId),linked=!!id,league=text(options.league||m.competitionLabel),
      kickoff=ccMrszLocalKickoff_(m.startsAt),
      hasScore=m.homeSets!=null&&m.awaySets!=null&&Number.isFinite(Number(m.homeSets))&&Number.isFinite(Number(m.awaySets))
        &&(Number(m.homeSets)+Number(m.awaySets)>0),
      postponed=text(m.status)==='postponed',
      score=postponed?'Halasztva':hasScore?Number(m.homeSets)+'–'+Number(m.awaySets):'VS.',
      setIssue=hasScore?ccMrszSetScoreIssue_(m):'',
      setCoverage=hasScore?ccMrszSetCoverageLabel_(m):'',
      sets=hasScore&&!setIssue&&Array.isArray(m.setScores)?m.setScores.filter(x=>x?.home!=null&&x?.away!=null&&text(x.home)!==''&&text(x.away)!=='')
        .map(x=>Number(x.home)+':'+Number(x.away)).join(' · '):'',
      rankHome=ccMatchScoreboardRank_(league,home),rankAway=ccMatchScoreboardRank_(league,away),
      validDate=/^\d{4}-\d{2}-\d{2}$/.test(kickoff.date),validTime=/^\d{2}:\d{2}$/.test(kickoff.time),
      venue=text(m.venue||m.court||league||''),badge=text(options.badge||'Bajnoki mérkőzés'),
      dateInsteadOfBadge=options.dateInsteadOfBadge===true,
      meta=text(options.meta||''),url=text(options.sourceUrl||m.sourceUrl||m.matchUrl||m.reportUrl),
      source=!linked&&/^https:\/\//i.test(url)?'<a class="cc-scoreboard-source" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+(options.sourceKind==='protocol'?'Jegyzőkönyv ↗':'Forrás ↗')+'</a>':'',
      protocolAvailable=!linked&&text(m.matchCode)&&m.protocol&&Array.isArray(m.protocol.teams)&&m.protocol.teams.length===2,
      protocolLink=!linked&&!protocolAvailable&&hasScore&&/^https:\/\/(?:www\.)?hunvolley\.info\//i.test(text(m.protocolUrl)),
      tag=linked?'button':'article';
    return '<'+tag+(linked?' type="button" data-event-id="'+esc(id)+'"':'')
      +' class="cc-match-scoreboard '+(hasScore?'is-played':'is-upcoming')+' '+(linked?'is-linked':'is-league')+(protocolAvailable?' has-protocol':'')+(postponed?' is-postponed':'')+'"'
      +(protocolAvailable?' data-cc-mrsz-protocol="'+esc(m.matchCode)+'" data-cc-mrsz-protocol-league="'+esc(league)+'" role="button" tabindex="0"':protocolLink?' data-cc-mrsz-external="'+esc(m.protocolUrl)+'" role="link" tabindex="0"':'')
      +' aria-label="'+esc(home+' – '+away+' · '+score)+'">'
      +'<span class="cc-scoreboard-top"><span class="cc-scoreboard-label">'+esc(postponed?'Halasztva':dateInsteadOfBadge?(validDate?kickoff.date:'Időpont nélkül'):badge)+'</span>'
      +'<span class="cc-scoreboard-kickoff">'+(postponed?'Időpont egyeztetés alatt':dateInsteadOfBadge?(validTime?esc(kickoff.time):''):(esc(validDate?kickoff.date:'Időpont nélkül')+(validTime?' · '+esc(kickoff.time):'')))+'</span></span>'
      +'<span class="cc-scoreboard-main"><span class="cc-scoreboard-team home">'
      +'<span class="cc-scoreboard-crest">'+msLogoHtml_('',home,'cc-scoreboard-team-logo')+'</span>'
      +'<span class="cc-scoreboard-teamcopy"><strong>'+esc(home)+'</strong>'
      +(rankHome?'<small>'+rankHome+'. helyen áll</small>':'')+'</span></span>'
      +'<span class="cc-scoreboard-score">'+(hasScore||postponed?'<strong>'+esc(score.replace('–',' – '))+'</strong>':'<span class="cc-scoreboard-versus">VS.</span>')
      +(setCoverage?'<small class="cc-scoreboard-set-coverage"'+(setIssue?' title="'+esc(setIssue)+'"':'')+'>'+esc(setCoverage)+'</small>':'')+'</span>'
      +'<span class="cc-scoreboard-team away"><span class="cc-scoreboard-crest">'+msLogoHtml_('',away,'cc-scoreboard-team-logo')+'</span>'
      +'<span class="cc-scoreboard-teamcopy"><strong>'+esc(away)+'</strong>'
      +(rankAway?'<small>'+rankAway+'. helyen áll</small>':'')+'</span></span>'
      +(sets?'<span class="cc-scoreboard-set-results" aria-label="Játszmák: '+esc(sets)+'">'+esc(sets)+'</span>':'')+'</span>'
      +'<span class="cc-scoreboard-bottom"><span class="cc-scoreboard-location">'+esc(venue||'Helyszín nincs megadva')+'</span>'
      +(meta?'<span class="cc-scoreboard-meta">'+esc(meta)+'</span>':'')+source+(options.editHtml||'')

      +'</span></'+tag+'>';
  }


  // Source-verified record links only. Federation ID alone is NOT an URL or
  // sufficient evidence of an individual profile; keep unmatched names plain.
  function ccMrszProfileUrl_(candidate){
    const raw=text(candidate);
    if(!raw)return '';
    try{
      const url=new URL(raw);
      if(url.protocol!=='https:')return '';
      if(!['hunvolley.hu','www.hunvolley.hu','backoffice.hunvolley.hu','www.hunvolley.info','hunvolley.info'].includes(url.hostname.toLowerCase()))return '';
      if(url.username||url.password)return '';
      return url.href;
    }catch(_){return ''}
  }
  function ccMrszProtocolPersonHtml_(person){
    const label=text(person?.name||person);
    if(!label)return '–';
    const url=ccMrszProfileUrl_(person?.profileUrl);
    return url?'<a class="cc-protocol-person-link" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(label)+' ↗</a>'
      :'<span class="cc-protocol-person-unlinked">'+esc(label)+'</span>';
  }
  function ccMrszProtocolBadgesHtml_(p){
    const badges=[];
    if(p?.captain===true)badges.push('<span class="cc-protocol-marker is-captain" title="Kapitány" aria-label="Kapitány">C</span>');
    if(p?.libero)badges.push('<span class="cc-protocol-marker is-libero" title="Libero" aria-label="Libero">'+esc(text(p.libero))+'</span>');
    if(p?.designation==='CS')badges.push('<span class="cc-protocol-marker is-subs" title="Csere" aria-label="Csere"><svg viewBox="0 0 28 19" role="img" aria-hidden="true"><path class="sub-in" d="M3 5h18m-5-4 5 4-5 4"/><path class="sub-out" d="M25 14H7m5-4-5 4 5 4"/></svg></span>');
    if(!p?.designation)badges.push('<span class="cc-protocol-marker is-no-entry" title="Nincs pályára lépési jelölés" aria-label="Nincs pályára lépési jelölés">–</span>');
    return '<span class="cc-protocol-markers">'+badges.join('')+'</span>';
  }
  function ccMrszProtocolTeamHtml_(side,label){
    const players=Array.isArray(side?.players)?side.players:[];
    const staff=Array.isArray(side?.staff)?side.staff:[];
    const name=ccMrszProtocolPersonHtml_({name:side?.name||label,profileUrl:side?.profileUrl});
    const rows=players.map(p=>'<tr><td class="cc-protocol-jersey">'+esc(text(p?.number)||'–')+'</td>'
      +'<td>'+(p?.designation==='K'?'<strong class="cc-protocol-starter">'+ccMrszProtocolPersonHtml_(p)+'</strong>':ccMrszProtocolPersonHtml_(p))+'</td><td>'+ccMrszProtocolBadgesHtml_(p)+'</td></tr>').join('');
    const staffHtml=staff.length?'<div class="cc-protocol-staff"><h4>Stáb</h4>'+staff.map(p=>
      '<div><span>'+esc(text(p?.role)||'Stábtag')+'</span><b>'+ccMrszProtocolPersonHtml_(p)+'</b></div>').join('')+'</div>':'';
    return '<section class="cc-protocol-team"><h3>'+name+'</h3><div class="cc-protocol-table-scroll"><table><thead><tr><th>Mez</th><th>Játékos</th><th></th></tr></thead><tbody>'
      +(rows||'<tr><td colspan="3">A névsor még nincs rögzítve.</td></tr>')+'</tbody></table></div>'+staffHtml+'</section>';
  }

  function ccMrszProtocolHtml_(m){
    const p=m?.protocol||{},home=text(m?.homeName),away=text(m?.awayName);
    const kickoff=ccMrszLocalKickoff_(m?.startsAt);
    const hasScore=m?.homeSets!=null&&m?.awaySets!=null;
    const score=hasScore?text(m.homeSets)+' : '+text(m.awaySets):'VS.';
    const sets=Array.isArray(m?.setScores)?m.setScores.map((s,i)=>
      '<div><span>'+(i+1)+'. játszma</span><strong>'+esc(text(s?.home))+' : '+esc(text(s?.away))+'</strong></div>').join(''):'';
    const teams=Array.isArray(p.teams)?p.teams:[];
    const officials=Array.isArray(p.officials)?p.officials:[];
    const matchCode=text(m?.matchCode);
    const verifiedUrl=ccMrszProfileUrl_(p?.sourceUrl||m?.sourceUrl);
    return '<div class="cc-protocol-report">'

      +'<div class="cc-protocol-meta"><span>'+esc(text(m?.competitionLabel))+'</span><span>'+esc(kickoff.date+' · '+kickoff.time)+'</span>'
      +(matchCode?'<span>Mérkőzéskód: '+esc(matchCode)+'</span>':'')
      +(text(m?.venue)?'<span>'+esc(m.venue)+'</span>':'')+'</div>'
      +'<div class="cc-protocol-result"><span>'+esc(home)+'</span><strong>'+esc(score)+'</strong><span>'+esc(away)+'</span></div>'
      +(sets?'<div class="cc-protocol-sets">'+sets+'</div>':'')
      +'<div class="cc-protocol-teams">'+ccMrszProtocolTeamHtml_(teams[0],home)+ccMrszProtocolTeamHtml_(teams[1],away)+'</div>'
      +(officials.length?'<section class="cc-protocol-officials"><h3>Hivatalos személyek</h3><div>'+officials.map(o=>
        '<div><span>'+esc(text(o?.role)||'Hivatalos személy')+'</span><strong>'+ccMrszProtocolPersonHtml_(o)+'</strong></div>').join('')+'</div></section>':'')
      +(text(p?.notes)?'<p class="cc-protocol-notes">'+esc(p.notes)+'</p>':'')
      +(verifiedUrl?'<p><a class="button quiet small" href="'+esc(verifiedUrl)+'" target="_blank" rel="noopener noreferrer">Eredeti Hunvolley-jegyzőkönyv ↗</a></p>':'')

      +'</div>';
  }
  function ccOpenMrszProtocol_(code,league){
    const matches=Array.isArray(ccMrszPhotoState_?.canonicalMatches)&&ccMrszPhotoState_.canonicalMatches.length?ccMrszPhotoState_.canonicalMatches:(Array.isArray(ccMrszPhotoState_?.matches)?ccMrszPhotoState_.matches:[]);
    const found=matches.filter(m=>text(m?.matchCode)===text(code)&&text(m?.competitionLabel)===text(league)&&Array.isArray(m?.protocol?.teams));
    if(found.length!==1){status('A jegyzőkönyv nem azonosítható egyértelműen.','error');return}
    const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');
    if(!d||!body||!title)return;
    if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='VERSENYSPORT · JEGYZŐKÖNYV';
    title.textContent=text(found[0].homeName)+' – '+text(found[0].awayName);
    body.innerHTML=ccMrszProtocolHtml_(found[0]);
    d.classList.add('cc-protocol-dialog');
    d.addEventListener('close',()=>d.classList.remove('cc-protocol-dialog'),{once:true});
    ccOpenDialogStable_(d);
  }
  function ccBindMrszProtocol_(){
    $$('#viewContent [data-cc-mrsz-protocol]').forEach(card=>{
      const open=()=>ccOpenMrszProtocol_(card.dataset.ccMrszProtocol,card.dataset.ccMrszProtocolLeague);
      card.addEventListener('click',event=>{
        if(event.target.closest('a,button,select,input'))return;
        open();
      });
      card.addEventListener('keydown',event=>{
        if((event.key==='Enter'||event.key===' ')&&!event.target.closest('a,button,select,input')){
          event.preventDefault();open();
        }
      });
    });
    $$('#viewContent [data-cc-mrsz-external]').forEach(card=>{
      const open=()=>window.open(card.dataset.ccMrszExternal,'_blank','noopener,noreferrer');
      card.addEventListener('click',e=>{if(!e.target.closest('a,button,select,input'))open()});
      card.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('a,button,select,input')){e.preventDefault();open()}});
    });
    ccBindSourceMatchEdit_();
  }


  // A saved federation/screenshot key is mandatory. Name+date are display only.
  function ccMatchSourceId_(m){
    if(m?._ccSourceKey&&m?.season)return {system:text(m._ccSourceSystem),key:text(m._ccSourceKey),season:text(m.season)};
    if(m?.source==='brsz'&&m?.sourceMatchKey&&m?.season)return {system:'brsz',key:text(m.sourceMatchKey),season:text(m.season)};
    return null;
  }
  function ccMatchSourceFind_(id){
    return [...(ccMrszPhotoState_.userMatches||[]),...(ccMrszPhotoState_.fixtures||[]),...(ccMrszPhotoState_.matches||[]),...ccBrszEffectiveMatches_]
      .find(m=>{const x=ccMatchSourceId_(m);return x&&x.system===id.system&&x.key===id.key&&x.season===id.season});
  }
  function ccCanEditLeagueSource_(){
    return (state.permissions||[]).some(p=>p==='*'
      ||(typeof p==='object'&&text(p?.moduleKey)==='competition.matches'&&p.canEdit===true&&!p.teamId));
  }
  function ccMatchEditAction_(m){
    const id=ccMatchSourceId_(m);
    if(!id||!ccCanEditLeagueSource_())return '';
    return '<button type="button" class="cc-league-manual-edit" data-match-edit="'+esc(id.key)
      +'" data-match-system="'+esc(id.system)+'" data-match-season="'+esc(id.season)+'">'
      +(m._ccManualOverride?'Kézi módosítás · Szerkesztés':'Szerkesztés')+'</button>';
  }
  function ccMatchDateFromHu_(raw){
    const m=String(raw||'').trim().match(/^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.$/);
    if(!m)throw Error('Magyar dátumformátum szükséges: 2026. 10. 20.');
    const yyyy=m[1],mm=m[2].padStart(2,'0'),dd=m[3].padStart(2,'0');
    const date=new Date(yyyy+'-'+mm+'-'+dd+'T12:00:00Z');
    if(!Number.isFinite(date.valueOf())||date.toISOString().slice(0,10)!==yyyy+'-'+mm+'-'+dd)
      throw Error('Nem létező dátum.');
    return yyyy+'-'+mm+'-'+dd;
  }
  function ccMatchBindTimeWheels_(){
    // Native selects permit touch spinning; desktop wheels move 1 hour/minute per tick.
    for(const id of ['ccMHour','ccMMinute']){
      const select=$('#'+id);
      select?.addEventListener('wheel',event=>{
        if(!event.deltaY||document.activeElement!==select)return;
        event.preventDefault();
        const dir=event.deltaY>0?1:-1;
        select.selectedIndex=(select.selectedIndex+dir+select.options.length)%select.options.length;
        select.dispatchEvent(new Event('change',{bubbles:true}));
      },{passive:false});
    }
  }
  function ccMatchEditorDateIso_(day,time){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time))throw Error('Hibás dátum vagy időpont.');
    const utc=Date.parse(day+'T'+time+':00Z');
    const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Budapest',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
    for(const offset of [60,120]){
      const stamp=new Date(utc-offset*60000),parts=Object.fromEntries(fmt.formatToParts(stamp).map(p=>[p.type,p.value]));
      if(parts.year+'-'+parts.month+'-'+parts.day===day&&parts.hour+':'+parts.minute===time)return stamp.toISOString();
    }
    throw Error('A budapesti időpont nem értelmezhető.');
  }
  async function ccMatchSourceRefresh_(id,version){
    ccMrszPhotoState_={loaded:false,loading:false,error:'',matches:[],fixtures:[],tables:[]};
    await ccLoadMrszPhotoSnapshot_();
    if(ccMrszPhotoState_.error)throw Error(ccMrszPhotoState_.error);
    const m=ccMatchSourceFind_(id);
    if(!m||Number(m._ccOverrideVersion||0)!==version)throw Error('A mentés visszaolvasása nem egyezik.');
  }
  function ccSourceMatchHistoryHtml_(items){
    if(!Array.isArray(items)||!items.length)return '<p class="cc-source-history-empty">Ehhez a meccshez még nincs kézi módosítás.</p>';
    const fields={homeName:'Hazai',awayName:'Vendég',startsAt:'Kezdés',venue:'Helyszín',
      homeSets:'Hazai szettek',awaySets:'Vendég szettek',setScores:'Játszmák',status:'Állapot'};
    const show=(k,v)=>{
      if(v===undefined||v===null||v==='')return '–';
      if(k==='setScores'&&Array.isArray(v))return v.map(x=>String(x.home)+':'+String(x.away)).join(' · ')||'–';
      if(k==='startsAt')return ccMrszLocalKickoff_(v).date+' '+ccMrszLocalKickoff_(v).time;
      return String(v);
    };
    return '<ol class="cc-source-history-list">'+items.map(item=>{
      const old=item.oldPatch&&typeof item.oldPatch==='object'?item.oldPatch:{};
      const now=item.newPatch&&typeof item.newPatch==='object'?item.newPatch:{};
      const changed=Object.keys({...old,...now}).filter(k=>Object.hasOwn(fields,k)&&JSON.stringify(old[k])!==JSON.stringify(now[k]));
      const dt=Date.parse(item.happenedAt||'');
      const when=Number.isFinite(dt)?new Intl.DateTimeFormat('hu-HU',{timeZone:'Europe/Budapest',
        year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(dt)):'';
      const reset=item.action==='reset';
      return '<li><div class="cc-source-history-head"><b>'+(reset?'Forrás visszaállítása':'Kézi módosítás')+'</b>'
        +'<small>'+esc(when)+' · '+esc(item.actor||'Admin')+'</small></div>'
        +(reset?'':('<div class="cc-source-history-fields">'+changed.map(k=>'<div><span>'+esc(fields[k])+'</span>'
           +'<span>'+esc(show(k,old[k]))+' → '+esc(show(k,now[k]))+'</span></div>').join('')+'</div>'))
        +'</li>';
    }).join('')+'</ol>';
  }

  function ccOpenSourceMatchEditor_(m){
    const id=ccMatchSourceId_(m),body=$('#entityDialogBody'),title=$('#entityDialogTitle');
    if(!id||!body||!title||!ccCanEditLeagueSource_())return;
    title.textContent='Bajnoki mérkőzés szerkesztése';
    const dt=ccMrszLocalKickoff_(m.startsAt),hadScore=m.homeSets!=null&&m.awaySets!=null;
    const field=(label,key,value,type='text')=>'<label class="field"><span>'+label+'</span><input id="'+key+'" type="'+type+'" value="'+esc(value||'')+'" required></label>';
    body.innerHTML='<form class="action-form" id="ccSourceMatchForm"><div class="action-form-grid">'
      +field('Hazai csapat','ccMHome',m.homeName)+field('Vendégcsapat','ccMAway',m.awayName)
      +'<label class="field"><span>Dátum (ÉÉÉÉ. HH. NN.)</span><input id="ccMDate" type="text" inputmode="numeric" maxlength="12" pattern="[0-9]{4}\\. ?[0-9]{1,2}\\. ?[0-9]{1,2}\\." placeholder="2026. 10. 20." value="'+esc(dt.date.replace(/^(\d{4})-(\d{2})-(\d{2})$/,'$1. $2. $3.'))+'" required></label>'
      +'<label class="field"><span>Kezdés (24 órás)</span><span class="cc-match-time-wheel"><select id="ccMHour" aria-label="Kezdés órája">'+Array.from({length:24},(_,h)=>'<option value="'+String(h).padStart(2,'0')+'"'+(dt.time.slice(0,2)===String(h).padStart(2,'0')?' selected':'')+'>'+String(h).padStart(2,'0')+'</option>').join('')+'</select><b>:</b><select id="ccMMinute" aria-label="Kezdés perce">'+Array.from({length:60},(_,m)=>'<option value="'+String(m).padStart(2,'0')+'"'+(dt.time.slice(3,5)===String(m).padStart(2,'0')?' selected':'')+'>'+String(m).padStart(2,'0')+'</option>').join('')+'</select></span></label>'
      +'<label class="field span-2"><span>Helyszín</span><input id="ccMVenue" maxlength="300" value="'+esc(m.venue||'')+'"></label>'
      +'<label class="field"><span>Állapot</span><select id="ccMStatus">'
      +[['scheduled','Tervezett'],['played','Lejátszott'],['postponed','Elhalasztva'],['cancelled','Törölve']].map(([code,label])=>'<option value="'+code+'"'+((text(m.status||m.sourceStatus||(hadScore?'played':'scheduled'))===code)?' selected':'')+'>'+label+'</option>').join('')
      +'</select></label>'
      +'<label class="field"><span>Hazai szettek</span><select id="ccMHs"><option value="">–</option>'
      +[0,1,2,3].map(n=>'<option value="'+n+'"'+(hadScore&&Number(m.homeSets)===n?' selected':'')+'>'+n+'</option>').join('')+'</select></label>'
      +'<label class="field"><span>Vendég szettek</span><select id="ccMAs"><option value="">–</option>'
      +[0,1,2,3].map(n=>'<option value="'+n+'"'+(hadScore&&Number(m.awaySets)===n?' selected':'')+'>'+n+'</option>').join('')+'</select></label>'
      +'<label class="field span-2"><span>Játszmák (25:20, 25:18)</span><input id="ccMSets" value="'+esc((m.setScores||[]).map(p=>p.home+':'+p.away).join(', '))+'"></label>'
      +'</div><div class="dialog-action-row"><button type="button" class="button quiet" id="ccMCancel">Mégse</button>'
      +(m._ccManualOverride?'<button type="button" class="button quiet" id="ccMReset">Forrás visszaállítása</button>':'')
      +'<button type="submit" class="button primary" id="ccMSave">Mentés</button></div></form>'
      +'<details id="ccMHistory" class="cc-source-history"><summary>Módosítási előzmények</summary>'
      +'<div id="ccMHistoryBody" class="cc-source-history-body">Megnyitáskor betöltés…</div></details>';
    ccOpenDialogStable_($('#entityDialog'));
    ccMatchBindTimeWheels_();
    $('#ccMCancel')?.addEventListener('click',ccCloseEntityDialog_);
    // History is queried on demand; never block a save because an audit read failed.
    let historyLoaded=false;
    $('#ccMHistory')?.addEventListener('toggle',async event=>{
      if(!event.target.open||historyLoaded)return;
      historyLoaded=true;
      const pane=$('#ccMHistoryBody');
      try{
        const items=await rpc('cc_manager_competition_match_override_history_v1',{
          p_source_system:id.system,p_season:id.season,p_source_key:id.key
        });
        if(pane&&pane.isConnected&&$('#ccMHistoryBody')===pane)
          pane.innerHTML=ccSourceMatchHistoryHtml_(items);
      }catch(error){
        historyLoaded=false;
        if(pane&&pane.isConnected&&$('#ccMHistoryBody')===pane)
          pane.innerHTML='<p role="alert">Az előzmények nem tölthetők be: '+esc(error?.message||'Ismeretlen hiba')+'</p>';
      }
    });

    $('#ccSourceMatchForm')?.addEventListener('submit',async e=>{
      e.preventDefault();const btn=$('#ccMSave');btn.disabled=true;
      try{
        const h=text($('#ccMHs').value),a=text($('#ccMAs').value);
        if((h==='')!==(a===''))throw Error('Mindkét szetteredmény szükséges.');
        const raw=text($('#ccMSets').value);
        const setScores=raw?raw.split(',').map(pair=>{
          const parts=pair.trim().match(/^(\d{1,2})\s*:\s*(\d{1,2})$/);
          if(!parts)throw Error('Hibás játszmaeredmény. Példa: 25:20, 25:18');
          return {home:Number(parts[1]),away:Number(parts[2])};
        }):[];
        const patch={homeName:text($('#ccMHome').value),awayName:text($('#ccMAway').value),
          startsAt:ccMatchEditorDateIso_(ccMatchDateFromHu_(text($('#ccMDate').value)),text($('#ccMHour').value)+':'+text($('#ccMMinute').value)),
          venue:text($('#ccMVenue').value),homeSets:h===''?null:Number(h),
          awaySets:a===''?null:Number(a),setScores,status:$('#ccMStatus').value};
        if((patch.status==='played')!==(h!==''))throw Error('A lejátszott állapothoz eredmény kell; a többi állapot eredmény nélküli.');
        const result=await rpc('cc_manager_competition_match_override_save_v1',{
          p_source_system:id.system,p_source_key:id.key,p_season:id.season,p_patch:patch,
          p_expected_version:Number(m._ccOverrideVersion||0)});
        await ccMatchSourceRefresh_(id,Number(result._ccOverrideVersion));
        ccCloseEntityDialog_();status('Mérkőzés mentve.','success');
      }catch(err){status(err.message||'Mentési hiba.','error');btn.disabled=false}
    });
    $('#ccMReset')?.addEventListener('click',async()=>{
      if(!confirm('Visszaállítod az eredeti forrásadatokat?'))return;
      try{
        await rpc('cc_manager_competition_match_override_reset_v1',{p_source_system:id.system,
          p_season:id.season,p_source_key:id.key,p_expected_version:Number(m._ccOverrideVersion||0)});
        await ccMatchSourceRefresh_(id,Number(m._ccOverrideVersion||0)+1);ccCloseEntityDialog_();status('Forrásadatok visszaállítva.','success');
      }catch(err){status(err.message||'Visszaállítás sikertelen.','error')}
    });
  }
  function ccBindSourceMatchEdit_(){
    $$('#viewContent [data-match-edit]').forEach(btn=>btn.addEventListener('click',event=>{
      event.stopPropagation();event.preventDefault();
      const id={system:text(btn.dataset.matchSystem),season:text(btn.dataset.matchSeason),key:text(btn.dataset.matchEdit)};
      const match=ccMatchSourceFind_(id);
      if(match)ccOpenSourceMatchEditor_(match);else status('A forrásrekord nem található.','error');
    }));
  }
  // Strict source-key link for already verified moved 2026/27 BEAC fixtures.
// Do not erase genuine completed results, merge unidentified opponents or edit attendance.
  const CC_MANAGER_KNOWN_DATE_MOVES_=Object.freeze([
    {league:'Férfi Budapest I. osztály – B csoport',
      home:'beac',away:'pdse',oldDay:'2026-10-12',newDay:'2026-10-19',
      key:'ui20261018:menB:beac:pdse:1'},
    {league:'Női Budapest II. osztály – B csoport',
      home:'beacii',away:'uteu20pink',oldDay:'2026-10-13',newDay:'2026-10-20',
      key:'ui20261018:womenIIB:beacii:uteu20pink:1'}
  ]);
  function ccManagerKnownMovedFixture_(m,group){
    return CC_MANAGER_KNOWN_DATE_MOVES_.find(r=>r.league===group
      &&text(m?.sourceMatchKey||m?._ccSourceKey)===r.key
      &&m?._ccUserSupplied===true
      &&text(m?.season)==='2026/27'
      &&ccMrszNormPairName_(m?.homeName)===r.home
      &&ccMrszNormPairName_(m?.awayName)===r.away
      &&ccMrszLocalKickoff_(m?.startsAt).date===r.newDay
      &&m?.homeSets==null&&m?.awaySets==null)||null;
  }
  function ccManagerMatchToday_(){
    const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Budapest',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const v=k=>parts.find(p=>p.type===k)?.value||'';
    return v('year')+'-'+v('month')+'-'+v('day');
  }
  function ccManagerMatchVisualSort_(a,b,day=ccManagerMatchToday_()){
    const key=m=>{const p=ccMrszLocalKickoff_(m?.startsAt);return p.date+'T'+p.time};
    const aa=key(a),bb=key(b),pastA=aa.slice(0,10)<day,pastB=bb.slice(0,10)<day;
    if(pastA!==pastB)return pastA?1:-1;
    const diff=aa.localeCompare(bb);
    return diff?(pastA?-diff:diff):text(a?.homeName).localeCompare(text(b?.homeName),'hu');
  }
  function ccMrszMergedLeagueMatches_(group,canonicalMatches=[]){
    // Competition label includes gender, division and group: never match on names alone.
    const inGroup=m=>text(m?.competitionLabel)===group;
    // The shared canonical feed contains reconciled fixtures and reports.
    // Keep the legacy merge as fallback for old RPC versions and editor/audit flows.
    const shared=ccMrszPhotoState_.canonicalMatches;
    if(Array.isArray(shared)&&shared.length){
      return shared.filter(inGroup)
        .map(m=>({...m,isFixture:m.status!=='played',isPhoto:m.status==='played'})).sort((a,b)=>text(a.status)==='postponed'?-1:text(b.status)==='postponed'?1:ccManagerMatchVisualSort_(a,b));
    }
    const photo=(ccMrszPhotoState_.matches||[]).filter(inGroup).map(m=>({...m,isPhoto:true}));
    const fixtures=(ccMrszPhotoState_.fixtures||[]).filter(inGroup).map(m=>({...m,isFixture:true}));
    const brsz=((typeof ccBrszEffectiveMatches_==='undefined'?[]:ccBrszEffectiveMatches_)||[]).filter(inGroup);
    const updated=(ccMrszPhotoState_.userMatches||[]).filter(m=>
      inGroup(m)&&(ccManagerKnownMovedFixture_(m,group)||!!ccManagerVerifiedOfficialReport_(m)));
    const superseded=m=>m?.homeSets==null&&m?.awaySets==null&&(
      photo.some(p=>text(p.source)==='mrsz_official_protocol_pdf'
        &&text(p.competitionLabel)===text(m.competitionLabel)
        &&ccMrszNormPairName_(p.homeName)===ccMrszNormPairName_(m.homeName)
        &&ccMrszNormPairName_(p.awayName)===ccMrszNormPairName_(m.awayName)
        &&Math.abs(Date.parse(p.startsAt)-Date.parse(m.startsAt))<=14*86400000)
      ||updated.some(u=>{
      // Supersede the outdated Oct 12 BRSZ placeholder only after the Oct 19
      // original report has been verified; never delete any result or event.
      if(ccManagerVerifiedOfficialReport_(u)?.matchCode==='2699'
        &&ccMrszLocalKickoff_(m.startsAt).date==='2026-10-12'
        &&ccMrszNormPairName_(m.homeName)==='beac'
        &&ccMrszNormPairName_(m.awayName)==='pdse')return true;
      const r=ccManagerKnownMovedFixture_(u,group);
      return r&&ccMrszLocalKickoff_(m?.startsAt).date===r.oldDay
        &&ccMrszNormPairName_(m?.homeName)===r.home
        &&ccMrszNormPairName_(m?.awayName)===r.away;
    }));
    const key=m=>ccMrszLocalKickoff_(m._ccOriginalStartsAt||m.startsAt).date+'|'
      +ccMrszNormPairName_(m._ccOriginalHomeName||m.homeName)+'|'
      +ccMrszNormPairName_(m._ccOriginalAwayName||m.awayName);
    const unique=new Map();
    const take=(match,priority)=>{
      if(!inGroup(match)||superseded(match))return;
      const k=key(match),prior=unique.get(k);
      const annotated={...match,__sourcePriority:priority};
      if(!prior||(!prior._ccManualOverride&&annotated._ccManualOverride)
        ||(!!prior._ccManualOverride===!!annotated._ccManualOverride&&priority>=prior.__sourcePriority))
        unique.set(k,annotated);
    };
    fixtures.forEach(m=>take(m,1));
    canonicalMatches.forEach(m=>take(m,2));
    brsz.forEach(m=>take(m,2));
    photo.forEach(m=>take(m,3));
    updated.forEach(m=>take(m,4));
    return [...unique.values()].sort((a,b)=>ccManagerMatchVisualSort_(a,b));
  }

  // An unscored BEAC–BEAC record is a source anomaly, not a confirmed fixture.
  function ccMrszUnverifiedSelfFixture_(m){
    if(m.homeSets!=null||m.awaySets!=null)return false;
    const home=ccMrszNormPairName_(m.homeName);
    return !!home&&home===ccMrszNormPairName_(m.awayName)&&ccIsBeacLeagueTeam_(m.homeName);
  }

  // Flag saved result sources which cannot safely be used as a league result.
  // Missing league tables are disclosed separately; their saved scores are not discarded.
  function ccMrszMatchReviewReason_(match,leagueRows,hasTable,conflicts){
    if(ccMrszUnverifiedSelfFixture_(match))return 'Nem megerősített BEAC–BEAC menetrendi rekord';
    if(!match?.isPhoto)return '';
    const home=ccMrszNormPairName_(match.homeName),away=ccMrszNormPairName_(match.awayName);
    if(!home||!away||home===away)return 'A két csapat nem azonosítható egyértelműen';
    if(match.homeSets==null||match.awaySets==null||text(match.homeSets)===''||text(match.awaySets)==='')
      return 'Hiányzó játszmaeredmény';
    const hs=Number(match.homeSets),as=Number(match.awaySets);
    if(!Number.isInteger(hs)||!Number.isInteger(as)||Math.max(hs,as)!==3||Math.min(hs,as)<0||Math.min(hs,as)>2)
      return 'Érvénytelen játszmaeredmény';
    const setIssue=ccMrszSetScoreIssue_(match);
    if(setIssue)return setIssue;
    const stamp=text(match.startsAt),time=Date.parse(stamp);
    if(!/^\d{4}-\d{2}-\d{2}T/.test(stamp)||!Number.isFinite(time)||time>Date.now())
      return 'Nem ellenőrizhető mérkőzésidőpont';
    const key=ccMrszLocalKickoff_(stamp).date+'|'+home+'|'+away;
    if(conflicts.has(key))return 'Eltérő mentett végeredmények';
    // An MRSZ protocol is primary evidence of a played match. A stale/partial
    // standings snapshot may flag inconsistent team names, but must not hide it.
    if(text(match.source)==='mrsz_official_protocol_pdf')return '';
    if(!hasTable)return '';
    const homeCount=leagueRows.filter(r=>ccMrszNormPairName_(r?.teamName)===home).length;
    const awayCount=leagueRows.filter(r=>ccMrszNormPairName_(r?.teamName)===away).length;
    if(homeCount>1||awayCount>1)return 'Nem egyértelmű csapatmegfeleltetés a tabellában';
    if(homeCount!==1||awayCount!==1)return 'A csapat nem szerepel a mentett tabellában';
    return '';
  }

  let ccLeagueMatchScope_='all';
  let ccMatchesAuditOpen_=false;
  let ccMrszAuditType_='all';
  let ccMrszAuditQuery_='';
  let ccMrszAuditLeague_='all';
  let ccMrszAuditReturn_=false;
  function ccIsBeacLeagueTeam_(name){
    const key=ccMrszNormPairName_(name);
    return key==='beac'||key==='beacii'||key.startsWith('budapestiegyetemiatletikaiclub');
  }
  function ccStandingsPhotoTeamRows_(snapshot){
    const raw=Array.isArray(snapshot?.rows)?snapshot.rows:[];
    const league=text(snapshot?.competitionLabel);
    // Canonical IDs must not leak from the Manager's previously selected league.
    const canonical=league&&text(msData_()?.competitionLabel)===league?msRows_():[];
    return raw.map((r,i)=>{
      const key=ccMrszNormPairName_(r.teamName);
      const candidates=key?canonical.filter(x=>ccMrszNormPairName_(x.teamName)===key):[];
      const pair=candidates.length===1?candidates[0]:null;
      const fallback='photo-'+encodeURIComponent(league||'unknown')+'-'+i;
      return {...r,sourceTeamId:text(r.sourceTeamId||pair?.sourceTeamId||fallback),
        focus:ccIsBeacLeagueTeam_(r.teamName),history:[]};
    });
  }

  let ccLeaguePostponedFilter_='all';
  function ccLeagueMatchStatus_(m){
    return text(m?.status)==='postponed'?'postponed':
      m?.homeSets!=null&&m?.awaySets!=null?'played':'scheduled';
  }
  let ccStandingsMatchSort_='oldest';
  let ccStandingsMatchTeamFilter_='all';
  function ccMrszLeagueFixturePanelHtml_(group,canonicalMatches=[],options={}){
    const merged=ccMrszMergedLeagueMatches_(group,canonicalMatches);
    const table=(ccMrszPhotoState_.tables||[]).find(t=>text(t.competitionLabel)===group);
    const tableRows=Array.isArray(table?.rows)?table.rows:[];
    const photo=(ccMrszPhotoState_.matches||[]).filter(m=>text(m.competitionLabel)===group);
    const key=m=>ccMrszLocalKickoff_(m.startsAt).date+'|'+ccMrszNormPairName_(m.homeName)+'|'+ccMrszNormPairName_(m.awayName);
    const outcomes=new Map(),conflicts=new Set();
    for(const m of photo){
      const k=key(m),score=text(m.homeSets)+'–'+text(m.awaySets);
      if(outcomes.has(k)&&outcomes.get(k)!==score)conflicts.add(k);
      else outcomes.set(k,score);
    }
    const matches=[],review=[];
    for(const m of merged){
      const reason=ccMrszMatchReviewReason_(m,tableRows,table?.partial===false,conflicts);
      if(!reason){matches.push(m);continue}
      // The merge prefers the latest photo for display. Preserve every conflicting
      // raw saved result in the review list instead of silently losing a version.
      const variants=m.isPhoto&&conflicts.has(key(m))?photo.filter(p=>key(p)===key(m)):[m];
      const seen=new Set();
      for(const variant of variants){
        const identity=key(variant)+'|'+text(variant.homeSets)+'|'+text(variant.awaySets);
        if(seen.has(identity))continue;
        seen.add(identity);
        review.push({match:variant,reason});
      }
    }
    const hasBeac=matches.some(m=>ccIsBeacLeagueTeam_(m.homeName)||ccIsBeacLeagueTeam_(m.awayName))
      ||tableRows.some(r=>ccIsBeacLeagueTeam_(r.teamName));
    const scope=options.onlyBeac?'beac':options.forceAll?'all':hasBeac?ccLeagueMatchScope_:'all';
    const teamName=text(options.teamName);
    const teamId=text(options.teamId);
    const matchesInScope=scope==='all'?matches:matches.filter(m=>ccIsBeacLeagueTeam_(m.homeName)||ccIsBeacLeagueTeam_(m.awayName));
    const visible=matchesInScope.filter(m=>ccLeaguePostponedFilter_==='all'||ccLeagueMatchStatus_(m)===ccLeaguePostponedFilter_).filter(m=>!teamName||
      (teamId&&[m.homeSourceTeamId,m.awaySourceTeamId].some(id=>text(id)===teamId))||
      [m.homeName,m.awayName].some(name=>ccMrszNormPairName_(name)===ccMrszNormPairName_(teamName)))
      .sort((a,b)=>{const ap=ccLeagueMatchStatus_(a)==='postponed',bp=ccLeagueMatchStatus_(b)==='postponed';if(ap!==bp)return ap?-1:1;return options.sort==='newest'
        ?Date.parse(b.startsAt)-Date.parse(a.startsAt)
        :options.sort==='team'
          ?text(a.homeName).localeCompare(text(b.homeName),'hu')||Date.parse(a.startsAt)-Date.parse(b.startsAt)
          :Date.parse(a.startsAt)-Date.parse(b.startsAt)||0;});
    const controls=hasBeac&&!options.forceAll?'<div class="cc-league-match-scope" role="group" aria-label="Bajnoki mérkőzések szűrése">'
      +'<button type="button" data-league-match-scope="beac" aria-pressed="'+(scope==='beac')+'" class="'+(scope==='beac'?'active':'')+'">BEAC meccsek</button>'
      +'<button type="button" data-league-match-scope="all" aria-pressed="'+(scope==='all')+'" class="'+(scope==='all'?'active':'')+'">Összes bajnoki meccs</button></div>':'';
    const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Budapest',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    const items=visible.map(m=>ccMatchScoreboardHtml_(m,{league:group,
      badge:'Bajnoki mérkőzés',dateInsteadOfBadge:!!m.isFixture,
      meta:'',
      past:!!ccMrszLocalKickoff_(m.startsAt).date&&ccMrszLocalKickoff_(m.startsAt).date<today,
      editHtml:ccMatchEditAction_(m),sourceUrl:text(m.protocolUrl)||ccManagerVerifiedOfficialReport_(m)?.url||(text(m.source)==='mrsz_official_protocol_pdf'?text(m.protocolUrl):''),
      sourceKind:ccManagerVerifiedOfficialReport_(m)||text(m.source)==='mrsz_official_protocol_pdf'?'protocol':''
    })).join('');
    const noTableNote='';
    const unverifiedOnly=review.every(r=>r.reason==='Nem megerősített BEAC–BEAC menetrendi rekord');
    return '<section class="ms-panel ms-match-panel cc-mrsz-league-matches"><div class="ms-panel-head ms-match-panel-head"><div><b>Bajnoki mérkőzések</b><span>'
      +visible.length+' / '+matches.length+' meccs · '+esc(group)+'</span></div>'+controls+'<label class="field compact"><span>Státusz</span><select class="cc-postponed-filter"><option value="all" '+(ccLeaguePostponedFilter_==='all'?'selected':'')+'>Összes</option><option value="postponed" '+(ccLeaguePostponedFilter_==='postponed'?'selected':'')+'>Halasztva</option><option value="scheduled" '+(ccLeaguePostponedFilter_==='scheduled'?'selected':'')+'>Kiírt</option><option value="played" '+(ccLeaguePostponedFilter_==='played'?'selected':'')+'>Lejátszott</option></select></label></div>'+noTableNote+'<div class="ms-match-list">'
      +(items||'<div class="ms-empty">'+(scope==='beac'?'Nincs megjeleníthető mérkőzés.':'Ebben a bajnoki csoportban nincs mentett mérkőzés.')+'</div>')+'</div>'
      +(review.length?'<details class="cc-mrsz-review-fixtures"><summary>'+review.length+(unverifiedOnly?' ellenőrzendő BRSZ-rekord':' ellenőrzendő rekord')+' · külön a meccslistától</summary><ul>'
        +review.map(({match:m,reason})=>{const kick=ccMrszLocalKickoff_(m.startsAt);
          const score=m.homeSets==null||m.awaySets==null?'':text(m.homeSets)+'–'+text(m.awaySets);
          const coverage=ccMrszSetCoverageLabel_(m);
          return '<li><b>'+esc(kick.date+' '+kick.time)+'</b> · '+esc(m.homeName)+' – '+esc(m.awayName)
            +(score?' · '+esc(score):'')+'<small> · '+esc(reason)+'</small>'
            +(coverage?'<small> · '+esc(coverage)+'</small>':'')+ccMatchEditAction_(m)+'</li>'}).join('')
        +'</ul><p>Ellenőrzendő forrásrekordok; nem kerülnek a megerősített mérkőzések és statisztikák közé. Az eredeti adatok változatlanul megmaradnak.</p></details>':'')+'</section>';
  }

  // Read-only cross-league audit. Use the same underlying result and standings
  // validators as individual league views; never treat missing coverage as an error.
  function ccMrszAuditModel_(store=ccMrszPhotoState_){
    const photos=Array.isArray(store?.matches)?store.matches:[],fixtures=Array.isArray(store?.fixtures)?store.fixtures:[],
      tables=Array.isArray(store?.tables)?store.tables:[],labels=new Set();
    for(const record of [...photos,...fixtures,...tables])if(text(record?.competitionLabel))labels.add(text(record.competitionLabel));
    const groups=[];
    for(const league of [...labels].sort((a,b)=>a.localeCompare(b,'hu'))){
      const table=tables.find(t=>text(t.competitionLabel)===league),
        rows=Array.isArray(table?.rows)?table.rows:[],
        saved=photos.filter(m=>text(m.competitionLabel)===league),
        scheduled=fixtures.filter(m=>text(m.competitionLabel)===league),
        items=[],outcomes=new Map(),conflicts=new Set(),seen=new Set();
      const key=m=>ccMrszLocalKickoff_(m?.startsAt).date+'|'+ccMrszNormPairName_(m?.homeName)+'|'+ccMrszNormPairName_(m?.awayName);
      for(const match of saved){
        const k=key(match),score=text(match.homeSets)+'–'+text(match.awaySets);
        if(outcomes.has(k)&&outcomes.get(k)!==score)conflicts.add(k);
        else outcomes.set(k,score);
      }
      for(const raw of saved){
        const match={...raw,isPhoto:true};
        const reason=ccMrszMatchReviewReason_(match,rows,table?.partial===false,conflicts);
        if(!reason)continue;
        const identity=key(match)+'|'+text(match.homeSets)+'|'+text(match.awaySets)+'|'+JSON.stringify(match.setScores||[])+'|'+reason;
        if(seen.has(identity))continue;seen.add(identity);
        const stamp=ccMrszLocalKickoff_(match.startsAt);
        items.push({type:'Mérkőzés',name:text(match.homeName)+' – '+text(match.awayName),
          date:stamp.date+' '+stamp.time,reason,score:match.homeSets==null||match.awaySets==null?'':text(match.homeSets)+'–'+text(match.awaySets)});
      }
      for(const match of scheduled){
        if(!ccMrszUnverifiedSelfFixture_(match))continue;
        const identity='fixture|'+key(match);if(seen.has(identity))continue;seen.add(identity);
        const stamp=ccMrszLocalKickoff_(match.startsAt);
        items.push({type:'Menetrend',name:text(match.homeName)+' – '+text(match.awayName),
          date:stamp.date+' '+stamp.time,reason:'Nem megerősített BEAC–BEAC menetrendi rekord',score:''});
      }
      for(const row of rows){
        const issue=ccMrszRecordIssue_(row);
        if(issue)items.push({type:'Tabella',name:text(row.teamName),date:'',score:'',reason:issue});
        if(table?.partial!==false||!saved.length)continue;
        const recorded=ccSavedLeagueResults_(row,league,saved,rows),played=ccMrszStatNumber_(row?.played);
        // Comparisons are conditional. Unequal/unknown saved match counts do not
        // establish an inconsistency with the archived complete table.
        if(played==='–'||!recorded.length||recorded.length!==Number(played))continue;
        let forSets=0,againstSets=0,wins=0,losses=0,valid=true;
        for(const result of recorded){
          const pair=/^(\d+)–(\d+)$/.exec(text(result?.score));
          if(!pair){valid=false;break}
          const a=Number(pair[1]),b=Number(pair[2]);
          if(!((a===3&&b>=0&&b<=2)||(b===3&&a>=0&&a<=2))){valid=false;break}
          forSets+=a;againstSets+=b;if(a>b)wins++;else losses++;
        }
        if(!valid)continue;
        const sourceSets=ccMrszStatPair_(row.setsFor,row.setsAgainst),
          sourceRecord=ccMrszRecordPair_(row),
          actualSets=forSets+'–'+againstSets,actualRecord=wins+'–'+losses,issues=[];
        if(sourceSets!=='–'&&sourceSets!==actualSets)
          issues.push('Szettmérleg: tabella '+sourceSets+', mentett eredmények '+actualSets);
        if(sourceRecord!=='–'&&sourceRecord!==actualRecord)
          issues.push('Mérleg: tabella '+sourceRecord+', mentett eredmények '+actualRecord);
        if(issues.length)items.push({type:'Egyeztetés',name:text(row.teamName),date:'',score:'',
          reason:issues.join('; ')+'. '+recorded.length+'/'+played+' mentett meccs; az egyező darabszám önmagában nem igazolja a teljességet.'});
      }
      items.sort((a,b)=>a.type.localeCompare(b.type,'hu')||a.name.localeCompare(b.name,'hu')||a.date.localeCompare(b.date));
      groups.push({league,coverage:table?ccMrszCoverageLabel_(table):'Nincs mentett MRSZ-tabella · nem élő adat',
        items,savedCount:saved.length,fixtureCount:scheduled.length});
    }
    return {groups,issues:groups.reduce((sum,g)=>sum+g.items.length,0)};
  }
  // Pure client-side filters: no source record is rewritten or reclassified.
  function ccMrszAuditFilterModel_(model,{type='all',query='',league='all'}={}){
    const allowed=new Set(['all','Mérkőzés','Menetrend','Tabella','Egyeztetés']);
    const selected=allowed.has(type)?type:'all';
    const sourceGroups=Array.isArray(model?.groups)?model.groups:[];
    const selectedLeague=league==='all'||sourceGroups.some(group=>group.league===league)?league:'all';
    const normalized=value=>text(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('hu-HU');
    const parts=normalized(query).split(/\s+/).filter(Boolean);
    const groups=sourceGroups.filter(group=>selectedLeague==='all'||group.league===selectedLeague).map(group=>{
      const items=group.items.filter(item=>{
        if(selected!=='all'&&item.type!==selected)return false;
        const searchable=normalized([group.league,item.type,item.name,item.reason,item.date,item.score].join(' '));
        return parts.every(part=>searchable.includes(part));
      });
      return {...group,items};
    }).filter(group=>group.items.length);
    return {groups,issues:groups.reduce((sum,group)=>sum+group.items.length,0),
      total:Number(model?.issues)||0,selected,selectedLeague,query:text(query)};
  }
  function ccMrszAuditCountText_(filtered){
    return filtered.issues+' / '+filtered.total+' ellenőrzendő bejegyzés · '+filtered.groups.length+' bajnokság';
  }
  function ccMrszAuditResultsHtml_(filtered){
    if(!filtered.groups.length)return '<div class="ms-empty">'+(filtered.total
      ?'Nincs találat a megadott szűrésre vagy keresésre.'
      :'A jelenleg mentett adatok között nincs kimutatott ellentmondás. Ez nem igazolja az adatok teljességét.')+'</div>';
    return '<div class="cc-mrsz-audit-groups">'+filtered.groups.map((group,i)=>
      '<details class="cc-mrsz-audit-group" '+(i===0?'open':'')+'><summary><b>'+esc(group.league)+'</b><span>'+group.items.length+' bejegyzés</span></summary>'
      +'<p class="cc-mrsz-audit-source">'+esc(group.coverage)+'</p><button class="button quiet small" type="button" data-cc-audit-league="'+esc(group.league)+'">Bajnokság megnyitása</button>'
      +'<ul>'+group.items.map(item=>
        '<li><div class="cc-mrsz-audit-item-head"><strong>'+esc(item.type)+' · '+esc(item.name)+'</strong><span>'+esc([item.date,item.score].filter(Boolean).join(' · '))+'</span></div>'
        +'<p>'+esc(item.reason)+'</p><button class="button quiet small cc-mrsz-audit-open" type="button" data-cc-audit-league="'+esc(group.league)+'" aria-label="Bajnokság megnyitása: '+esc(item.name)+'">Megnyitás</button></li>').join('')+'</ul></details>').join('')+'</div>';
  }
  function ccMrszAuditHtml_(){
    if(!ccMrszPhotoState_.loaded)
      return '<section class="panel cc-mrsz-central-audit"><h3>Adatellenőrzés</h3><p>Mentett bajnoki adatok betöltése…</p></section>';
    if(ccMrszPhotoState_.error)
      return '<section class="panel cc-mrsz-central-audit"><h3>Adatellenőrzés</h3><p class="ms-empty error">'+esc(ccMrszPhotoState_.error)+'</p></section>';
    const model=ccMrszAuditModel_();
    const filtered=ccMrszAuditFilterModel_(model,{type:ccMrszAuditType_,query:ccMrszAuditQuery_,league:ccMrszAuditLeague_});
    const types=[['all','Összes típus'],['Mérkőzés','Mérkőzéshibák'],['Menetrend','Menetrendi hibák'],
      ['Tabella','Tabellahibák'],['Egyeztetés','Számszaki eltérések']];
    const leagues=[['all','Összes bajnokság'],...model.groups.map(group=>[group.league,group.league])];
    return '<section class="panel cc-mrsz-central-audit" aria-label="Bajnoki adatellenőrzés">'
      +'<div class="panel-head"><div><h3>Adatellenőrzés</h3><p id="ccMrszAuditCount" role="status" aria-live="polite">'+esc(ccMrszAuditCountText_(filtered))+'</p></div></div>'
      +'<div class="cc-mrsz-audit-filters"><label class="field"><span>Bajnokság / csoport</span><select id="ccMrszAuditLeague" aria-label="Bajnokság szűrése">'
      +leagues.map(([value,label])=>'<option value="'+esc(value)+'" '+(filtered.selectedLeague===value?'selected':'')+'>'+esc(label)+'</option>').join('')
      +'</select></label><label class="field"><span>Hibatípus</span><select id="ccMrszAuditType" aria-label="Ellenőrzendő rekordok típusa">'
      +types.map(([value,label])=>'<option value="'+esc(value)+'" '+(filtered.selected===value?'selected':'')+'>'+esc(label)+'</option>').join('')
      +'</select></label><label class="field"><span>Keresés</span><input id="ccMrszAuditSearch" type="search" value="'+esc(ccMrszAuditQuery_)
      +'" placeholder="Csapat, ellenfél, hibaok…" autocomplete="off" aria-label="Ellenőrzendő rekordok keresése"></label></div>'
      +'<p class="cc-mrsz-audit-note">Mentett MRSZ/BRSZ-adatok · nem élő ellenőrzés. A részleges eredménylista önmagában nem bizonyít hibát. A szűrés és keresés nem módosít forrásadatot.</p>'
      +'<div id="ccMrszAuditResults">'+ccMrszAuditResultsHtml_(filtered)+'</div></section>';
  }
  function ccRefreshMrszAuditList_(){
    if(!ccMrszPhotoState_.loaded||ccMrszPhotoState_.error)return;
    const filtered=ccMrszAuditFilterModel_(ccMrszAuditModel_(),{type:ccMrszAuditType_,query:ccMrszAuditQuery_,league:ccMrszAuditLeague_});
    const count=$('#ccMrszAuditCount'),results=$('#ccMrszAuditResults');
    if(count)count.textContent=ccMrszAuditCountText_(filtered);
    if(results)results.innerHTML=ccMrszAuditResultsHtml_(filtered);
  }

  function ccMrszPhotoResultsByLeagueHtml_(group){
    const list=(ccMrszPhotoState_.matches||[]).filter(x=>!group||text(x.competitionLabel)===group);
    if(!list.length)return '';
    return '<article class="panel cc-mrsz-photo-compact"><div class="panel-head"><div><h3>Lejátszott meccsek · MRSZ</h3><p>2026.10.14-i képernyőképek alapján</p></div></div><div class="cc-mrsz-photo-matches">'
      +list.map(m=>'<div class="cc-mrsz-photo-match"><span><b>'+esc(m.homeName)+'</b> – <b>'+esc(m.awayName)+'</b><small>'+esc(m.competitionLabel)+' · '+esc(text(m.startsAt).slice(0,10))+'</small></span><span class="cc-mrsz-photo-score">'+num(m.homeSets)+':'+num(m.awaySets)+'</span><small class="cc-mrsz-photo-sets">'+(m.setScores||[]).map(z=>num(z.home)+':'+num(z.away)).join(' · ')+'</small></div>').join('')+'</div></article>';
  }

  function ccBindMrszMenGroup_(){
    document.querySelectorAll('[data-mrsz-men-group]').forEach(btn=>btn.addEventListener('click',()=>{
      ccClearLeagueContext_();ccMrszMenGroup_=btn.dataset.mrszMenGroup==='A'?'A':'B';
      state.managerStandingsTeam='all';
      ccLeagueMatchScope_=ccMrszMenGroup_==='A'?'all':'beac';
      document.querySelectorAll('[data-mrsz-men-group]').forEach(x=>{
        const active=x.dataset.mrszMenGroup===ccMrszMenGroup_;
        x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active));
      });
      const body=document.getElementById('ccMrszMenGroupBody');
      if(body)body.innerHTML=ccMrszMenGroupTableHtml_();
      if(ccRouteIs_('competition','standings'))renderManagerStandings_();
    }));
  }

  function ccMrszPhotoPanelHtml_(){
    const data=ccMrszPhotoState_;
    if(!data.loaded)return '<article class="panel cc-mrsz-photo-panel"><div class="panel-head"><h3>MRSZ · beküldött eredmények</h3></div><p class="cc-mrsz-photo-note">Betöltés…</p></article>';
    if(data.error)return `<article class="panel cc-mrsz-photo-panel"><h3>MRSZ · beküldött eredmények</h3><p class="cc-mrsz-photo-note">Az adatforrás nem érhető el: ${esc(data.error)}</p></article>`;
    const sections=data.tables.map(t=>`<section class="cc-mrsz-photo-group"><h4>${esc(t.competitionLabel||'Bajnokság')} · pillanatkép</h4><div class="cc-mrsz-photo-table-scroll"><table><thead><tr><th>#</th><th>Csapat</th><th>M</th><th>GY</th><th>V</th><th>P</th></tr></thead><tbody>${(t.rows||[]).map(x=>`<tr><td>${num(x.position)}</td><td>${esc(x.teamName)}</td><td>${num(x.played)}</td><td>${num(x.wins)}</td><td>${num(x.losses)}</td><td>${num(x.tablePoints)}</td></tr>`).join('')}</tbody></table></div></section>`).join('');
    const matches=data.matches.map(m=>`<div class="cc-mrsz-photo-match"><span><b>${esc(m.homeName)}</b> – <b>${esc(m.awayName)}</b><small>${esc(m.competitionLabel)} · ${esc(text(m.startsAt).slice(0,10))}</small></span><span class="cc-mrsz-photo-score">${num(m.homeSets)}:${num(m.awaySets)}</span><small class="cc-mrsz-photo-sets">${(m.setScores||[]).map(s=>`${num(s.home)}:${num(s.away)}`).join(' · ')}</small></div>`).join('');
    return `<article class="panel cc-mrsz-photo-panel"><div class="panel-head"><div><h3>Bajnoki eredmények · MRSZ</h3><p>2026. október 14-i képernyőképek · nem automatikus szinkron</p></div></div><div class="cc-mrsz-photo-matches">${matches||'<p>Nincs mentett eredmény.</p>'}</div><div class="cc-mrsz-photo-tables">${sections}</div>${ccMrszMenGroupSwitcherHtml_()}</article>`;
  }

  // The match page and the standalone standings page use one selected
  // federation competition, without altering the internal BEAC event filters.
  let ccMatchesSelectedGroup_='';
  function ccMatchesDefaultLeague_(){
    const selected=teamFilterIds_('events');
    const teamId=selected.length===1?text(selected[0]):text(state.managerStandingsContext||'');
    if(teamId==='10000000-0000-4000-8000-000000000003')
      return ccMrszMenGroup_==='A'?'Férfi Budapest I. osztály – A csoport':'Férfi Budapest I. osztály – B csoport';
    if(teamId==='10000000-0000-4000-8000-000000000002')return 'Női Budapest II. osztály – B csoport';
    return 'Női Budapest I. osztály';
  }
  // Meccsek has exactly one BEAC team picker; do not inherit standings league state.
  function ccMatchesTeamSelectHtml_(){
    const id=teamFilterIds_('events').length===1?teamFilterIds_('events')[0]:'';
    return '<label class="cc-match-team-picker"><span>Csapat</span><select id="ccMatchTeamSelect" aria-label="BEAC csapat">'
      +'<option value="" '+(!id?'selected':'')+'>Összes BEAC csapat</option>'
      +(state.teams||[]).filter(t=>t.active!==false).map(t=>'<option value="'+esc(t.id)+'" '+(text(t.id)===id?'selected':'')+'>'+esc(t.name)+'</option>').join('')
      +'</select></label>';
  }
  function ccLeagueMatchesContextHtml_(){
    const group=ccMatchesSelectedGroup_||ccMatchesDefaultLeague_(),snapshot=ccMrszPhotoState_;
    if(!snapshot.loaded)return '<section class="cc-match-league-context"><article class="panel"><p class="ms-empty">Mentett bajnokságok betöltése…</p></article></section>';
    if(snapshot.error)return '<section class="cc-match-league-context"><article class="panel"><p class="ms-empty error">A bajnoki adatok nem tölthetők be: '+esc(snapshot.error)+'</p></article></section>';
    // No parallel league selector or standings table in Meccsek. League results
    // follow the selected BEAC team; the full table lives under Tabella.
    // One canonical snapshot is shared by all competition screens. With "all
    // teams" selected, display every BEAC league rather than silently showing
    // only Női I. The league picker remains available for explicit drill-down.
    const selectedTeamIds=teamFilterIds_('events');
    const allTeams=selectedTeamIds.length===0&&!ccMatchesSelectedGroup_;
    const groups=allTeams
      ?['Női Budapest I. osztály','Női Budapest II. osztály – B csoport','Férfi Budapest I. osztály – B csoport','Férfi Budapest I. osztály – A csoport']
      :[group];
    const oldScope=ccLeagueMatchScope_;
    if(allTeams)ccLeagueMatchScope_='beac';
    try{
      return '<section class="cc-match-league-context">'
        +(allTeams?'':('<div class="cc-matches-league-picker">'+ccLeagueContextSelectHtml_(group)+'</div>'))
        +groups.map(league=>ccMrszLeagueFixturePanelHtml_(league,[],{onlyBeac:true})).join('')
        +'</section>';
    }finally{ccLeagueMatchScope_=oldScope}
  }

  function renderCompetitionMatchCards_(){if(!ccRouteIs_('competition','matches'))return;
    state.eventFiltersOpen=filterOpen_('competition.matches',false);
    const matchPeriod=state.ccMatchPeriod||'all',rows=effectiveCompetitionEvents(state.activityEvents).filter(e=>eventType(e)==='match'&&teamFilterMatch_('events',eventTeamId(e))&&(matchPeriod==='all'||(matchPeriod==='upcoming'&&!isEventPast(e))||(matchPeriod==='past'&&isEventPast(e)))).sort((a,b)=>(eventStart(a)?.getTime()||0)-(eventStart(b)?.getTime()||0)),active=teamFilterIds_('events').length>0||matchPeriod!=='all',periodTitle=matchPeriod==='past'?'Elmúlt meccsek':matchPeriod==='upcoming'?'Következő meccsek':'BEAC – teljes idény';
    $('#viewContent').innerHTML=`<div class="page-intro competition-list-intro cc-page-header-panel cc-match-page-header"><div class="cc-match-header-title"><h2>Meccsek</h2><p>Mérkőzések és mentett bajnoki adatok.</p></div><div class="page-actions competition-list-toolbar cc-icon-toolbar"><button class="matrix-filter-toggle icon-only cc-toolbar-icon ${state.eventFiltersOpen?'open':''} ${active?'has-filter':''}" id="eventFiltersToggle" aria-expanded="${state.eventFiltersOpen?'true':'false'}" type="button" aria-label="Szűrők" title="Szűrők"><span class="triangle-icon"></span></button><button type="button" id="ccMatchesAuditToggle" class="cc-toolbar-icon cc-match-audit-shortcut ${ccMatchesAuditOpen_?'active':''}" aria-label="${ccMatchesAuditOpen_?'Vissza a mérkőzésekhez':'Adatellenőrzés'}" title="${ccMatchesAuditOpen_?'Vissza a mérkőzésekhez':'Adatellenőrzés'}" aria-pressed="${ccMatchesAuditOpen_?'true':'false'}"><span aria-hidden="true">⚑</span></button>${canAnyAction('competition.matches','edit')?`<button class="cc-toolbar-icon cc-refresh-icon" id="competitionSourceSync" type="button" aria-label="BRSZ frissítés" title="BRSZ frissítés" ${state.competitionSyncBusy?'disabled':''}>↻</button><button class="cc-toolbar-icon cc-add-square" id="competitionMatchAdd" type="button" aria-label="Új meccs" title="Új meccs">+</button>`:''}</div>${!ccMatchesAuditOpen_?`<div class="cc-match-header-team">${ccMatchesTeamSelectHtml_()}<button type="button" id="ccMatchesOpenStandings" class="button quiet small cc-match-standings-link">Tabella megnyitása <span aria-hidden="true">→</span></button></div>`:''}</div><div class="event-filter-head event-filter-head-inline-hidden"><button class="matrix-filter-toggle ${state.eventFiltersOpen?'open':''} ${active?'has-filter':''}" id="eventFiltersToggleLegacy" type="button"></button></div><div class="filter-panel parity-event-filters" id="eventFiltersPanel" ${state.eventFiltersOpen?'':'hidden'}><label class="field compact"><span>Időszak</span><select id="eventPeriodFilter"><option value="upcoming" ${matchPeriod==='upcoming'?'selected':''}>Közelgő</option><option value="past" ${matchPeriod==='past'?'selected':''}>Elmúlt</option><option value="all" ${matchPeriod==='all'?'selected':''}>Teljes idény</option></select></label>${active?'<button type="button" id="eventFilterReset" class="button quiet small cc-match-reset-inside">Szűrők törlése</button>':''}</div><div class="competition-live-status hidden" id="competitionLiveStatus" role="status" aria-live="polite"></div>${ccMatchesAuditOpen_?ccMrszAuditHtml_():''}<div ${ccMatchesAuditOpen_?'hidden':''}><article class="panel cc-event-card-panel cc-match-card-panel"><div class="panel-head"><div><h3>${periodTitle} · saját meccsek</h3><p>${rows.length} mérkőzés · névsor és jelentkezés</p></div></div><div class="cc-event-card-list">${rows.map(e=>ccCompetitionEventWithRosterHtml_(e,'match')).join('')||emptyInline('Nincs meccs ebben a szűrésben.')}</div></article>${ccLeagueMatchesContextHtml_()}<div class="competition-sync-strip ${ccCompetitionSyncLastRun_()?.status||'idle'}"><span class="sync-dot"></span><span>${esc(ccCompetitionSyncSummary_())}</span>${Number(state.competitionSyncStatus?.pendingChanges||0)?`<b>${num(state.competitionSyncStatus.pendingChanges)} naplózott változás</b>`:''}<button id="ccCompetitionChangeAudit" class="button quiet small cc-audit-trigger" type="button">Változások megtekintése</button></div></div>`;
    $('#ccMatchesAuditToggle')?.addEventListener('click',()=>{
      ccMatchesAuditOpen_=!ccMatchesAuditOpen_;
      ccMrszAuditReturn_=false;
      renderCompetitionMatchCards_();
    });
    $('#ccMrszAuditLeague')?.addEventListener('change',event=>{
      ccMrszAuditLeague_=text(event.target.value)||'all';
      ccRefreshMrszAuditList_();
    });
    $('#ccMrszAuditType')?.addEventListener('change',event=>{
      ccMrszAuditType_=text(event.target.value)||'all';
      ccRefreshMrszAuditList_();
    });
    $('#ccMrszAuditSearch')?.addEventListener('input',event=>{
      ccMrszAuditQuery_=event.target.value;
      ccRefreshMrszAuditList_();
    });
    $('#ccMrszAuditResults')?.addEventListener('click',event=>{
      const button=event.target.closest('[data-cc-audit-league]');
      if(!button)return;
      const league=text(button.dataset.ccAuditLeague);
      if(!ccLeagueCatalog_().some(group=>group.competitionLabel===league))return;
      ccMatchesAuditOpen_=false;
      ccMrszAuditReturn_=true;
      ccSetLeagueContext_(league);
    });

    $('#ccCompetitionChangeAudit')?.addEventListener('click',ccOpenCompetitionChangeAudit_);$('#competitionSourceSync')?.addEventListener('click',ccOpenBrszSyncOptions_);$('#competitionMatchAdd')?.addEventListener('click',()=>openCompetitionEventEditor(null,'match'));
    const toggle=$('#eventFiltersToggle'),panel=$('#eventFiltersPanel');if(toggle)toggle.classList.toggle('open',state.eventFiltersOpen);toggle?.addEventListener('click',()=>{const open=setFilterOpen_('competition.matches',!state.eventFiltersOpen);state.eventFiltersOpen=open;toggle.setAttribute('aria-expanded',String(open));toggle.classList.toggle('open',open);if(panel)panel.hidden=!open;ccBlurPointerControl_(toggle)});
    // Single team selector is bound above, not a second multiselect inside filters.
    $('#eventPeriodFilter')?.addEventListener('change',e=>{state.ccMatchPeriod=e.target.value;afterNativePicker(e.target,renderCompetitionMatchCards_,'#eventFiltersPanel')});
    $('#eventFilterReset')?.addEventListener('click',()=>{state.eventTeam='';state.teamFilters.events=[];state.ccMatchPeriod='all';renderCompetitionMatchCards_()});
    $('#ccMatchTeamSelect')?.addEventListener('change',event=>{
      const teamId=text(event.target.value);
      state.teamFilters.events=teamId?[teamId]:[];
      ccLeagueMatchScope_=teamId==='10000000-0000-4000-8000-000000000003'&&ccMrszMenGroup_==='A'?'all':'beac';
      ccClearLeagueContext_();ccMatchesSelectedGroup_='';
      renderCompetitionMatchCards_();
    });
    $('#ccLeagueContextSelect')?.addEventListener('change',event=>{ccMatchesSelectedGroup_=text(event.target.value);ccLeagueMatchScope_='all';renderCompetitionMatchCards_()});
    $('#ccMatchesOpenStandings')?.addEventListener('click',()=>{
      if(!canRoute('competition','standings'))return;
      const teamId=teamFilterIds_('events').length===1?teamFilterIds_('events')[0]:'';
      if(teamId)state.managerStandingsContext=teamId;
      ccLeagueContextSelection_=ccMatchesDefaultLeague_();
      ccLeagueMatchScope_='all';
      setRoute('competition','standings');
    });
    document.querySelectorAll('.cc-postponed-filter').forEach(el=>el.addEventListener('change',e=>{
      ccLeaguePostponedFilter_=e.target.value;renderCompetitionMatchCards_();
    }));
    document.querySelectorAll('[data-league-match-scope]').forEach(button=>button.addEventListener('click',()=>{
      ccLeagueMatchScope_=button.dataset.leagueMatchScope==='all'?'all':'beac';
      renderCompetitionMatchCards_();
    }));
    if(!ccMrszPhotoState_.loaded&&!ccMrszPhotoState_.loading)void ccLoadMrszPhotoSnapshot_();
    bindEventDetailActions();
    ccBindMrszProtocol_();
    ccBindTrainingRosterToggles_();
    bindOverviewStandings_();
    ccBindMrszMenGroup_();
    void ccHydrateCardPositions_(rows,renderCompetitionMatchCards_);
  }
  function renderEventList(title,copy,predicate){
    const expectedModule=title==='Meccsek'?'matches':title==='Edzések'?'trainings':state.module;if(!ccRouteIs_('competition',expectedModule))return;
    state.eventFiltersOpen=filterOpen_(routeKey(),false);const rows=filteredActivityEvents(predicate),active=teamFilterIds_('events').length>0||state.eventPeriod!=='upcoming';
    $('#viewContent').innerHTML=`<div class="page-intro"><div><h2>${esc(title)}</h2><p>${esc(copy)} A korábbi Manager információsűrűségével.</p></div>${title==='Meccsek'&&canAnyAction('competition.matches','edit')?'<button class="button primary small" id="competitionMatchAdd" type="button">+ Új meccs</button>':''}</div><div class="event-filter-head"><button class="matrix-filter-toggle ${state.eventFiltersOpen?'open':''} ${active?'has-filter':''}" id="eventFiltersToggle" aria-expanded="${state.eventFiltersOpen?'true':'false'}" type="button"><span class="triangle-icon"></span>Szűrők</button>${active?'<button class="filter-reset" id="eventFilterReset" type="button">Szűrők törlése</button>':''}</div><div class="filter-panel parity-event-filters" id="eventFiltersPanel" ${state.eventFiltersOpen?'':'hidden'}><div class="field compact">${teamMultiFilterHtml_('events')}</div><label class="field compact"><span>Időszak</span><select id="eventPeriodFilter"><option value="upcoming" ${state.eventPeriod==='upcoming'?'selected':''}>Mai és közelgő</option><option value="past" ${state.eventPeriod==='past'?'selected':''}>Elmúlt</option><option value="all" ${state.eventPeriod==='all'?'selected':''}>Mind</option></select></label></div><article class="panel event-table-panel"><div class="legacy-event-table"><div class="legacy-event-header"><div>Esemény / csapat</div><div>Időpont</div><div>Pálya / helyszín</div><div>Jövök</div><div>Nem jövök</div><div>Nincs válasz</div><div>Státusz</div><div></div></div>${rows.map(e=>`<div class="legacy-event-item ${isEventPast(e)?'past':''}"><div class="legacy-event-row"><button class="event-title-button" type="button" data-event-id="${esc(e.eventId||e.id)}"><span class="legacy-event-accent" style="background:${esc(e.color||teamById(eventTeamId(e))?.color||'#f7b700')}"></span><span><b>${esc(e.teamName||'')}</b><small>${esc(ccDisplayEventTitle_(e))}${eventType(e)==='match'?' · Meccs':''}</small></span></button><div><b>${esc(fmtDate(eventStart(e)))}</b><small>${esc(fmtTime(eventStart(e)))}${eventEnd(e)?` – ${esc(fmtTime(eventEnd(e)))}`:''}</small></div><div><b>${esc(e.court||'–')}</b><small>${eventType(e)==='match'?esc(e.venue||''):''}</small></div><div class="rsvp-number going">${num(e.yesCount)}</div><div class="rsvp-number not-going">${num(e.noCount)}</div><div class="rsvp-number none">${num(e.unknownCount)}</div><div><span class="status-pill ${isEventPast(e)?'':'ok'}">${esc(eventStatusLabel(e))}</span></div><button class="roster-chevron" type="button" data-roster-toggle="${esc(e.eventId||e.id)}" aria-expanded="false" aria-label="Névsor megnyitása"><span class="triangle-icon"></span></button></div><div class="legacy-event-roster" data-roster-holder="${esc(e.eventId||e.id)}" hidden></div></div>`).join('')||emptyInline('Nincs esemény ebben a szűrésben.')}</div></article>`;
    const toggle=$('#eventFiltersToggle'),panel=$('#eventFiltersPanel');if(toggle)toggle.classList.toggle('open',state.eventFiltersOpen);toggle?.addEventListener('click',()=>{const open=setFilterOpen_(routeKey(),!state.eventFiltersOpen);state.eventFiltersOpen=open;toggle.setAttribute('aria-expanded',String(open));toggle.classList.toggle('open',open);if(panel)panel.hidden=!open;ccBlurPointerControl_(toggle)});bindTeamMultiFilter_('events',()=>renderEventList(title,copy,predicate));$('#eventPeriodFilter')?.addEventListener('change',e=>{state.eventPeriod=e.target.value;afterNativePicker(e.target,()=>renderEventList(title,copy,predicate),'#eventFiltersPanel')});$('#eventFilterReset')?.addEventListener('click',()=>{state.eventTeam='';state.teamFilters.events=[];state.eventPeriod='upcoming';renderEventList(title,copy,predicate)});$$('[data-roster-toggle]').forEach(b=>b.addEventListener('click',()=>toggleEventRoster(b.dataset.rosterToggle,b)));bindEventDetailActions();$('#competitionMatchAdd')?.addEventListener('click',()=>openCompetitionEventEditor(null,'match'));
  }

  function openTeamEditor_(teamId){const t=teamById(teamId);if(!t||!canAction('competition.teams','edit',teamId)){status('Nincs szerkesztési jogosultságod ehhez a csapathoz.','error');return}const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='VERSENYSPORT · CSAPAT · SZERKESZTÉS';title.textContent=t.name;body.innerHTML=`<form id="teamEditForm" class="action-form"><div class="action-form-grid"><label class="field"><span>Csapat neve</span><input id="teName" value="${esc(t.name||'')}" required></label><label class="field"><span>Szezon</span><input id="teSeason" value="${esc(t.season||cfg.DEFAULT_SEASON)}"></label><label class="field"><span>Szín</span><input id="teColor" type="color" value="${esc(t.color||'#f7b700')}"></label><label class="field"><span>Edző(k)</span><input id="teCoaches" value="${esc(t.coaches||'')}"></label><label class="field"><span>Alaphelyszín</span><input id="teVenue" value="${esc(ccTeamDefaultVenue_(t))}"></label><label class="field"><span>Alappálya</span><input id="teCourt" value="${esc(ccTeamDefaultCourt_(t))}"></label></div><label class="action-checkbox"><input id="teActive" type="checkbox" ${t.active!==false?'checked':''}> <span>Aktív csapat</span></label><div class="dialog-action-row"><button type="button" class="button quiet" id="teCancel">Mégse</button><button type="submit" class="button primary" id="teSave">Mentés</button></div></form>`;ccOpenDialogStable_(d);$('#teCancel')?.addEventListener('click',ccCloseEntityDialog_);$('#teamEditForm')?.addEventListener('submit',async ev=>{ev.preventDefault();const btn=$('#teSave');if(btn)btn.disabled=true;try{await rpc('cc_manager_team_update_v1',{p_team_id:t.id,p_payload:{name:text($('#teName').value),season:text($('#teSeason').value),color:text($('#teColor').value),coaches:text($('#teCoaches').value),defaultVenue:text($('#teVenue').value),defaultCourt:text($('#teCourt').value),active:$('#teActive').checked}});await Promise.all([loadTeams(),loadPlayers(),loadManagerMedicalAppointments().catch(()=>{}),loadActivityEvents(),loadCalendar()]);ccCloseEntityDialog_();renderTeams();status('Csapat mentve.','success')}catch(err){status(err.message||'A csapat mentése sikertelen.','error');if(btn)btn.disabled=false}})}
  async function ensureEquipment_(teamId,{force=false}={}){
    const id=text(teamId);if(!id)return[];
    if(!force&&state.equipmentByTeam.has(id))return state.equipmentByTeam.get(id)||[];
    if(state.equipmentLoading.has(id))return state.equipmentByTeam.get(id)||[];
    state.equipmentLoading.add(id);
    try{const d=await rpc('cc_manager_equipment_list_v1',{p_team_id:id,p_season:cfg.DEFAULT_SEASON});const rows=Array.isArray(d)?d:[];state.equipmentByTeam.set(id,rows);return rows}
    finally{state.equipmentLoading.delete(id)}
  }
  function equipmentProductionLabel_(value){return({need_recorded:'Igény rögzítve',ordered:'Megrendelve',production:'Gyártás alatt',printing:'Feliratozás',arrived:'Beérkezett',issued:'Kiadva'})[text(value)]||'Igény rögzítve'}
  function equipmentPaymentLabel_(value){return({due:'Nincs fizetve',partial:'Részben fizetve',paid:'Kifizetve',waived:'Elengedve'})[text(value)]||'Nincs fizetve'}
  function equipmentMethodLabel_(value){return({online:'Online',cash:'Készpénz',revolut:'Revolut',transfer:'Átutalás',other:'Egyéb'})[text(value)]||'–'}
  function equipmentRowHtml_(r,canEdit){
    return `<button type="button" class="equipment-row" data-equipment-player="${esc(r.playerId)}" ${canEdit?'':'disabled'}><span class="equipment-person"><b>${esc(r.displayName||r.name||'Játékos')}</b><small>${esc(r.email||'')}</small></span><span><small>Mez</small><b>${esc(r.jerseyNo||'–')} · ${esc(r.jerseySize||'–')}</b></span><span><small>Nadrág</small><b>${esc(r.shortsSize||'–')}</b></span><span><small>Ár</small><b>${r.priceHuf!=null?`${num(r.priceHuf).toLocaleString('hu-HU')} Ft`:'–'}</b></span><span><small>Gyártás</small><b>${esc(equipmentProductionLabel_(r.productionStatus))}</b></span><span class="equipment-pay ${esc(r.paymentStatus||'due')}"><small>Fizetés</small><b>${esc(equipmentPaymentLabel_(r.paymentStatus))}</b></span><i>›</i></button>`
  }
  function openEquipmentEditor_(teamId,playerId){
    const rows=state.equipmentByTeam.get(text(teamId))||[],r=rows.find(x=>text(x.playerId)===text(playerId));if(!r)return;
    const d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='CSAPAT · FELSZERELÉS';title.textContent=r.displayName||r.name||'Felszerelés';
    const dateVal=v=>{const x=safeDate(v);return x?localDateKey(x):''};
    body.innerHTML=`<form id="equipmentForm" class="action-form"><div class="action-form-grid equipment-form-grid"><label class="field"><span>Mezszám</span><input id="eqJerseyNo" value="${esc(r.jerseyNo||'')}"></label><label class="field"><span>Mezméret</span><input id="eqJerseySize" value="${esc(r.jerseySize||'')}"></label><label class="field"><span>Nadrágméret</span><input id="eqShortsSize" value="${esc(r.shortsSize||'')}"></label><label class="field"><span>Ár (Ft)</span><input id="eqPrice" type="number" min="0" value="${esc(r.priceHuf??'')}"></label><label class="field"><span>Gyártási állapot</span><select id="eqProduction"><option value="need_recorded">Igény rögzítve</option><option value="ordered">Megrendelve</option><option value="production">Gyártás alatt</option><option value="printing">Feliratozás</option><option value="arrived">Beérkezett</option><option value="issued">Kiadva</option></select></label><label class="field"><span>Fizetési állapot</span><select id="eqPayment"><option value="due">Nincs fizetve</option><option value="partial">Részben fizetve</option><option value="paid">Kifizetve</option><option value="waived">Elengedve</option></select></label><label class="field"><span>Fizetési mód</span><select id="eqMethod"><option value="">–</option><option value="online">Online</option><option value="cash">Készpénz</option><option value="revolut">Revolut</option><option value="transfer">Átutalás</option><option value="other">Egyéb</option></select></label><label class="field"><span>Fizetve ekkor</span><input id="eqPaidAt" type="date" value="${esc(dateVal(r.paidAt))}"></label><label class="field"><span>Kinek fizette</span><input id="eqPaidTo" value="${esc(r.paidTo||'')}"></label><label class="field"><span>Megrendelve</span><input id="eqOrderedAt" type="date" value="${esc(dateVal(r.orderedAt))}"></label><label class="field"><span>Kiadva</span><input id="eqIssuedAt" type="date" value="${esc(dateVal(r.issuedAt))}"></label><label class="field span-2"><span>Megjegyzés</span><textarea id="eqNote" rows="3">${esc(r.note||'')}</textarea></label></div><div class="dialog-action-row"><button class="button quiet" type="button" id="eqCancel">Mégse</button><button class="button primary" type="submit" id="eqSave">Mentés</button></div></form>`;
    $('#eqProduction').value=text(r.productionStatus)||'need_recorded';$('#eqPayment').value=text(r.paymentStatus)||'due';$('#eqMethod').value=text(r.paymentMethod)||'';ccOpenDialogStable_(d);$('#eqCancel')?.addEventListener('click',ccCloseEntityDialog_);$('#equipmentForm')?.addEventListener('submit',async ev=>{ev.preventDefault();const btn=$('#eqSave');if(btn)btn.disabled=true;const iso=v=>v?`${v}T12:00:00+02:00`:'';try{await rpc('cc_manager_equipment_set_v1',{p_player_id:r.playerId,p_team_id:teamId,p_season:cfg.DEFAULT_SEASON,p_payload:{jerseyNo:text($('#eqJerseyNo').value),jerseySize:text($('#eqJerseySize').value),shortsSize:text($('#eqShortsSize').value),priceHuf:text($('#eqPrice').value),productionStatus:$('#eqProduction').value,paymentStatus:$('#eqPayment').value,paymentMethod:$('#eqMethod').value,paidAt:iso($('#eqPaidAt').value),paidTo:text($('#eqPaidTo').value),orderedAt:iso($('#eqOrderedAt').value),issuedAt:iso($('#eqIssuedAt').value),note:text($('#eqNote').value)}});await ensureEquipment_(teamId,{force:true});ccCloseEntityDialog_();renderTeams();status('Felszerelés mentve.','success')}catch(err){status(err.message||'A felszerelés mentése sikertelen.','error');if(btn)btn.disabled=false}})
  }
  function teamSeasonGridResponseMap_(){const map=new Map();(state.cardRsvpMatrix?.responses||[]).forEach(r=>map.set(`${text(r.eventId)}:${text(r.playerId)}`,r));return map}
  function teamSeasonAttendanceState_(row){const x=text(row?.attendanceStatus||row?.attendance_status||'').toLowerCase();return x==='present'?'present':x==='absent'?'absent':''}
  function teamSeasonRsvpState_(row){const x=text(row?.status||row?.rsvpStatus||row?.rsvp_status||'').toLowerCase();return x==='going'?'going':x==='not_going'?'not-going':'none'}
  function teamSeasonAttendanceButton_(event,player,row){const actual=teamSeasonAttendanceState_(row),rsvp=teamSeasonRsvpState_(row),started=!!eventStart(event)&&eventStart(event)<=new Date(),editable=started&&ccEventCanEdit_(event),glyph=actual==='present'?'✓':actual==='absent'?'✕':rsvp==='going'?'✓':rsvp==='not-going'?'✕':'·',label=actual==='present'?'Megjelent':actual==='absent'?'Nem jelent meg':rsvp==='going'?'Jövök (még nincs jelenlét)':rsvp==='not-going'?'Nem jövök (még nincs jelenlét)':'Nincs jelzés / jelenlét';return `<button type="button" class="team-season-att ${actual||'unset'} rsvp-${rsvp}" data-team-season-att data-event-id="${esc(event.eventId||event.id)}" data-player-id="${esc(player.playerId||player.id)}" data-att-state="${esc(actual)}" ${editable?'':'disabled'} title="${esc(label)}">${glyph}</button>`}
  function teamSeasonGridHtml_(team){
    const tid=text(team?.id),src=state.cardRsvpMatrix||{events:[],players:[],responses:[]};
    const eventMap=new Map();
    [
      ...(Array.isArray(src.events)?src.events:[]),
      ...(Array.isArray(state.activityEvents)?state.activityEvents:[]),
      ...(Array.isArray(state.calendarEvents)?state.calendarEvents:[])
    ].forEach(e=>{
      const id=text(e?.eventId||e?.id);
      if(!id||eventTeamId(e)!==tid)return;
      if(!eventMap.has(id))eventMap.set(id,e);else eventMap.set(id,{...eventMap.get(id),...e});
    });
    const allEvents=effectiveCompetitionEvents(Array.from(eventMap.values())).filter(e=>eventTeamId(e)===tid).sort((a,b)=>(eventStart(a)?.getTime()||0)-(eventStart(b)?.getTime()||0));
    const showPast=state.teamGridPeriod==='all';
    const todayStart=new Date();todayStart.setHours(0,0,0,0);
    const events=showPast?allEvents:allEvents.filter(e=>{const end=eventEnd(e)||eventStart(e);return !end||end.getTime()>=todayStart.getTime()});

    const playerMap=new Map();
    (Array.isArray(src.players)?src.players:[]).filter(p=>text(p?.teamId||p?.team_id)===tid).forEach(p=>playerMap.set(text(p?.playerId||p?.id),p));
    (Array.isArray(state.players)?state.players:[]).filter(p=>{
      if(text(p?.teamId||p?.team_id)===tid)return true;
      return (Array.isArray(p?.memberships)?p.memberships:[]).some(m=>text(m?.teamId||m?.team_id)===tid);
    }).forEach(p=>{
      const id=text(p?.playerId||p?.id);
      if(id)playerMap.set(id,{...(playerMap.get(id)||{}),...p,teamId:tid});
    });
    const players=Array.from(playerMap.values()).slice().sort((a,b)=>(num(a.jerseyNo)||9999)-(num(b.jerseyNo)||9999)||text(a.displayName||a.name).localeCompare(text(b.displayName||b.name),'hu'));

    const coaches=teamGridCoachNames_(team),coachMap=coachAvailabilityMap_(),map=teamSeasonGridResponseMap_();
    if(!events.length)return `<div class="team-season-grid-head"><div><h4>Edzői jelentkezés és szezonrács</h4><p>${allEvents.length} szezon-esemény érhető el.</p></div></div><div class="team-grid-empty"><b>Nincs következő alkalom.</b><span>Válaszd fent a „Teljes szezon” nézetet az elmúlt edzésekhez és meccsekhez.</span></div>`;

    const coachHead=coaches.map(name=>`<th class="matrix-player-head coach-head" title="Edző · ${esc(name)}"><span class="grid-player-head-inner"><span class="cc-avatar matrix monogram coach-avatar">${esc(coachMonogram_(name))}</span><span class="grid-player-label">${esc(text(name).split(/\s+/).filter(Boolean).slice(-1)[0]||'Edző')}</span></span></th>`).join('');
    const head=`<th class="matrix-event-col matrix-event-side sticky-matrix-col">Alkalom</th><th class="matrix-count-col matrix-count-head">Fő</th>${coachHead}${players.map(p=>`<th class="matrix-player-head" title="${esc(p.displayName||p.name)}"><span class="grid-player-head-inner">${avatarHtml(p,'matrix')}<span class="grid-player-label">${esc(gridGivenName(p))}</span></span></th>`).join('')}`;

    let lastMonth='';
    const body=events.map((e,idx)=>{
      const month=matrixMonthLabel(e),divider=idx>0&&month!==lastMonth?`<tr class="matrix-month-divider"><td colspan="${2+coaches.length+players.length}"><span>${esc(month)}</span></td></tr>`:'';
      lastMonth=month;
      const actualCount=players.filter(p=>teamSeasonAttendanceState_(map.get(`${text(e.eventId||e.id)}:${text(p.playerId||p.id)}`))==='present').length;
      const goingCount=players.filter(p=>teamSeasonRsvpState_(map.get(`${text(e.eventId||e.id)}:${text(p.playerId||p.id)}`))==='going').length;
      const count=eventStart(e)&&eventStart(e)<=new Date()?actualCount:goingCount;
      const iconPath=eventType(e)==='training'?'assets/event-training-mask.png':text(e.homeAway||e.home_away)==='away'?'assets/event-away-mask.png':'assets/event-home-mask.png';
      const eventLabel=eventType(e)==='training'?'Edzés':ccEventOpponent_(e)||'Meccs';
      const coachCells=coaches.map(name=>`<td class="matrix-cell coach-cell">${coachMatrixControl_(text(e.eventId||e.id),tid,name,coachMap.get(`${text(e.eventId||e.id)}:${name}`)||{status:'unknown',canEdit:coachCanEditFallback_(tid,name)},true)}</td>`).join('');
      return divider+`<tr class="matrix-data-row"><th class="matrix-event-col matrix-event-side sticky-matrix-col"><button class="matrix-event-side-btn" type="button" data-event-id="${esc(e.eventId||e.id)}"><span class="matrix-side-icon"><img src="${iconPath}" alt=""></span><span class="matrix-event-copy"><b>${esc(eventLabel)}</b><small>${esc(fmtDate(eventStart(e)))} · ${esc(fmtTime(eventStart(e)))}</small></span></button></th><td class="matrix-count-col matrix-count-cell"><strong class="${matrixCountClass(count)}">${count}</strong></td>${coachCells}${players.map(p=>{const row=map.get(`${text(e.eventId||e.id)}:${text(p.playerId||p.id)}`)||{};return `<td class="matrix-cell team-season-cell ${teamSeasonAttendanceState_(row)||'unset'}">${teamSeasonAttendanceButton_(e,p,row)}</td>`}).join('')}</tr>`
    }).join('');

    const coachNote=coaches.length?`${coaches.length} edző · `:'';
    return `<div class="team-season-grid-head"><div><h4>Edzői jelentkezés és szezonrács</h4><p>${coachNote}${events.length} / ${allEvents.length} alkalom · jövő: jelentkezés · múlt: jelenlét.</p></div></div><div class="matrix-scroll manager-player-grid team-season-grid"><table class="rsvp-matrix season-matrix transposed-matrix manager-player-matrix"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`
  }
  async function teamSeasonAttendanceWrite_(button){if(!button||button.disabled)return;const eventId=text(button.dataset.eventId),playerId=text(button.dataset.playerId),current=text(button.dataset.attState),next=current==='present'?'absent':current==='absent'?'':'present',db=next||'clear';button.disabled=true;try{const result=await ccCompetitionAttendanceRpc_(eventId,playerId,db),saved=text(result?.attendanceStatus??result?.status??'');if(saved!==next)throw new Error('A jelenlét mentése nem igazolható vissza.');ccPatchAttendanceCaches_(eventId,playerId,saved);renderTeams();status('Jelenlét mentve.','success')}catch(err){button.disabled=false;status(err.message||'A jelenlét mentése sikertelen.','error')}}
  function bindTeamSeasonGrid_(){
    $('#teamGridPeriodSelect')?.addEventListener('change',e=>{state.teamGridPeriod=e.target.value==='all'?'all':'upcoming';try{localStorage.setItem('cc-manager-team-grid-period',state.teamGridPeriod)}catch(_){}renderTeams()});
    $$('[data-team-season-att]').forEach(b=>b.addEventListener('click',()=>teamSeasonAttendanceWrite_(b)));
    bindCoachAvailabilityControls_($('#viewContent')||document);bindEventDetailActions()
  }

  function renderTeams(){if(!ccRouteIs_('competition','teams'))return;
    state.teamFiltersOpen=filterOpen_('competition.teams',state.teamFiltersOpen);
    const visibleTeams=state.teams.filter(t=>teamFilterMatch_('teams',t.id));if(!visibleTeams.some(t=>text(t.id)===text(state.selectedTeam)))state.selectedTeam=visibleTeams[0]?.id||'';if(!state.selectedTeam&&visibleTeams[0])state.selectedTeam=visibleTeams[0].id;const selected=teamById(state.selectedTeam),roster=selected?teamPlayers(selected.id):[],att=selected?teamAttendance(selected.id):attendanceSummary([]),canEdit=selected&&canAction('competition.teams','edit',selected.id),tab=['players','grid','equipment','info'].includes(state.teamDetailTab)?state.teamDetailTab:'players',equipment=selected?(state.equipmentByTeam.get(text(selected.id))||[]):[],filterActive=teamFilterIds_('teams').length>0;
    const playerTab=`<div class="panel-subhead"><div><h4>Játékoskeret</h4><p>Aktív csapattagok.</p></div></div><div class="roster-list cc-unified-player-list">${roster.map(p=>playerUnifiedCardHtml_(p,{openAttr:'data-player-open'})).join('')||emptyInline('Nincs aktív játékos a csapatban.')}</div>`;
    const gridTab=selected?teamSeasonGridHtml_(selected):'';
    const infoTab=`<div class="panel-subhead"><div><h4>Csapatinformáció</h4><p>Edzők, pályák és szezonstatisztika.</p></div></div><div class="detail-grid team-info-grid">${detailPair('Edző(k)',selected?.coaches||'–')}${detailPair('Edzéspálya(k)',ccTeamDefaultCourt_(selected))}${detailPair('Meccspálya',ccHomeDefaultsForTeam_(selected?.id)?.court?ccHomeDefaultsForTeam_(selected.id).court+'. pálya':'–')}${detailPair('Helyszín',ccTeamDefaultVenue_(selected))}${detailPair('Aktív játékosok',roster.length)}${detailPair('Edzésjelenlét',pctText(att.trainingPresent,att.trainingMarked))}${detailPair('Meccsjelenlét',pctText(att.matchPresent,att.matchMarked))}</div>`;
    const equipmentTab=`<div class="panel-subhead"><div><h4>Felszerelés</h4><p>Mez, méret, gyártás, kiadás és fizetés.</p></div></div><div class="equipment-list">${state.equipmentLoading.has(text(selected?.id))?'<div class="loading-inline">Felszerelés betöltése…</div>':equipment.map(r=>equipmentRowHtml_(r,canEdit)).join('')||emptyInline('Nincs felszerelésadat.')}</div>`;
    $('#viewContent').innerHTML=`<div class="page-intro cc-page-header-panel cc-team-page-header"><div><h2>Csapatok</h2><p>Csapatkeret, teljes szezonrács, felszerelés és alapadatok.</p></div><div class="page-actions team-page-actions compact cc-icon-toolbar">${filterActive?'<button class="filter-reset cc-toolbar-reset" id="teamFilterReset" type="button" aria-label="Szűrő törlése" title="Szűrő törlése">×</button>':''}<button class="matrix-filter-toggle icon-only cc-toolbar-icon ${state.teamFiltersOpen?'open':''} ${filterActive?'has-filter':''}" id="teamFiltersToggle" aria-expanded="${state.teamFiltersOpen?'true':'false'}" type="button" aria-label="Csapatszűrő" title="Csapatszűrő"><span class="triangle-icon"></span></button>${canEdit?'':'<span class="read-only-badge">MEGTEKINTÉS</span>'}</div></div>
      <div class="filter-panel team-filter-panel" id="teamFiltersPanel" ${state.teamFiltersOpen?'':'hidden'}>${teamMultiFilterHtml_('teams')}</div>
      <div class="team-master-detail single-team-detail"><article class="panel team-detail-panel">${selected?`<div class="team-detail-head team-gradient-head" style="--team-color:${esc(selected.color||'#f7b700')}"><div class="team-head-main"><span class="eyebrow">${esc(selected.season||cfg.DEFAULT_SEASON)}</span><h3>${esc(selected.name)}</h3></div>${tab==="grid"?`<label class="team-grid-period-filter team-grid-period-filter-head"><span>Időszak</span><select id="teamGridPeriodSelect"><option value="upcoming" ${state.teamGridPeriod==="all"?"":"selected"}>Következő</option><option value="all" ${state.teamGridPeriod==="all"?"selected":""}>Teljes szezon</option></select></label>`:""}<div class="team-head-attendance" aria-label="Csapat jelenlét"><span><small>Edzésjelenlét</small><b>${esc(pctText(att.trainingPresent,att.trainingMarked))}</b></span><span><small>Meccsjelenlét</small><b>${esc(pctText(att.matchPresent,att.matchMarked))}</b></span></div><div class="team-head-actions"><div class="team-detail-tabs team-icon-tabs"><button type="button" class="team-tab-grid ${tab==='grid'?'active':''}" data-team-tab="grid" aria-label="Rács" title="Rács"><svg class="cc-team-grid-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect x="4" y="4" width="24" height="24" rx="1"></rect><rect x="10" y="10" width="12" height="12" rx=".5"></rect></svg></button>${canEdit?'<button class="team-edit-circle team-tab-yellow" id="teamEditBtn" type="button" aria-label="Csapat szerkesztése" title="Csapat szerkesztése">✎</button>':''}<button type="button" class="team-tab-yellow ${tab==='players'?'active':''}" data-team-tab="players" aria-label="Játékosok" title="Játékosok">P</button><button type="button" class="team-tab-yellow ${tab==='equipment'?'active':''}" data-team-tab="equipment" aria-label="Felszerelés" title="Felszerelés">F</button><button type="button" class="team-tab-yellow ${tab==='info'?'active':''}" data-team-tab="info" aria-label="Infó" title="Infó">i</button></div></div></div>${tab==='players'?playerTab:tab==='grid'?gridTab:tab==='equipment'?equipmentTab:infoTab}`:emptyInline('Válassz egy csapatot a Szűrőkben.')}</article></div>`;
    const filterToggle=$('#teamFiltersToggle'),filterPanel=$('#teamFiltersPanel');filterToggle?.addEventListener('click',()=>{const open=setFilterOpen_('competition.teams',!state.teamFiltersOpen);state.teamFiltersOpen=open;filterToggle.setAttribute('aria-expanded',String(open));filterToggle.classList.toggle('open',open);if(filterPanel)filterPanel.hidden=!open;ccBlurPointerControl_(filterToggle)});
    $('#teamFilterReset')?.addEventListener('click',()=>{state.teamFilters.teams=[];state.selectedTeam='';renderTeams()});
    bindTeamMultiFilter_('teams',renderTeams);$$('[data-team-tab]').forEach(b=>b.addEventListener('click',()=>{state.teamDetailTab=b.dataset.teamTab;renderTeams();if(state.teamDetailTab==='equipment'&&selected&&!state.equipmentByTeam.has(text(selected.id)))void ensureEquipment_(selected.id).then(renderTeams).catch(err=>status(err.message||'A felszerelés nem tölthető be.','error'))}));bindUnifiedPlayerCards_($('#viewContent')||document);bindTeamSeasonGrid_();$('#teamEditBtn')?.addEventListener('click',()=>openTeamEditor_(state.selectedTeam));$$('[data-equipment-player]').forEach(b=>b.addEventListener('click',()=>openEquipmentEditor_(state.selectedTeam,b.dataset.equipmentPlayer)));if(tab==='equipment'&&selected&&!state.equipmentByTeam.has(text(selected.id))&&!state.equipmentLoading.has(text(selected.id)))void ensureEquipment_(selected.id).then(()=>{if(state.module==='teams'&&state.teamDetailTab==='equipment')renderTeams()}).catch(err=>status(err.message||'A felszerelés nem tölthető be.','error'));
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
  function managerMedicalAppointment_(playerId){return (state.managerMedicalAppointments||[]).find(r=>text(r.playerId)===text(playerId))||null}
  function managerMedicalAppointmentBadge_(p){const a=managerMedicalAppointment_(p?.playerId||p?.id);if(!a?.appointmentAt)return '<span class="medical-appointment-badge missing">Nincs időpont</span>';const d=safeDate(a.appointmentAt);return `<span class="medical-appointment-badge booked" title="${esc(a.location||'')}">Időpont foglalva · ${esc(d?fmtDate(d):'–')} ${esc(d?fmtTime(d):'')}</span>`}
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
    if(key==='jersey')return text(p.jerseyNo)!==''&&Number.isFinite(Number(p.jerseyNo))?Number(p.jerseyNo):99999;
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
  function playerMatchesTeamFilter_(p){
    const selected=teamFilterIds_('players');if(!selected.length)return true;
    const candidates=new Set([text(p?.teamId||p?.team_id),text(p?.teamName||p?.team_name)].filter(Boolean));
    (Array.isArray(p?.memberships)?p.memberships:[]).forEach(m=>[text(m?.teamId||m?.team_id),text(m?.teamName||m?.team_name)].filter(Boolean).forEach(v=>candidates.add(v)));
    return selected.some(id=>{const t=teamById(id);return [text(id),text(t?.legacyTeamId),text(t?.name)].filter(Boolean).some(v=>candidates.has(v))})
  }
  function playerRows(){
    const q=state.playerSearch.toLocaleLowerCase('hu-HU');
    return state.players.filter(p=>{
      if(!playerMatchesTeamFilter_(p))return false;
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
    chips.push(managerMedicalAppointmentBadge_(p));return chips.join('');
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
    const groupRows=new Map(teamOrder.map(t=>[text(t.id),[]])),unassigned=[];
    rows.forEach(p=>{
      const primary=text(p.teamId||p.team_id);
      const candidates=new Set([text(p.teamId||p.team_id),text(p.teamName||p.team_name)].filter(Boolean));
      (Array.isArray(p.memberships)?p.memberships:[]).forEach(m=>[text(m.teamId||m.team_id),text(m.teamName||m.team_name)].filter(Boolean).forEach(v=>candidates.add(v)));
      const target=teamOrder.find(t=>text(t.id)===primary)||teamOrder.find(t=>[text(t.id),text(t.legacyTeamId),text(t.name)].filter(Boolean).some(v=>candidates.has(v)));
      if(target)groupRows.get(text(target.id)).push(p);else unassigned.push(p);
    });
    const groups=teamOrder.map(t=>({team:t,rows:groupRows.get(text(t.id))||[]}));
    if(unassigned.length)groups.push({team:{id:'',name:'Nincs aktív csapat',color:'#b9b4aa'},rows:unassigned});
    return `<div class="cc-player-team-groups">${groups.map(g=>`<section class="cc-player-team-group" style="--group-team-color:${esc(g.team.color||'#b9b4aa')}"><div class="cc-player-team-group-head"><span></span><div><h3>${esc(g.team.name)}</h3><small>Névsor · vezetéknév szerint</small></div><b>${g.rows.length} fő</b></div><div class="cc-unified-player-list">${g.rows.map(playerLegacyRow_).join('')||emptyInline('Nincs a szűrésnek megfelelő játékos ebben a csapatban.')}</div></section>`).join('')||emptyInline('Nincs a szűrésnek megfelelő játékos.')}</div>`;
  }
  function playerTeamTabs_(){
    const all=`<button class="legacy-player-team-tab ${state.playerTeam?'':'active'}" type="button" data-player-team="">Mind</button>`;
    return all+state.teams.filter(t=>t.active!==false).map(t=>`<button class="legacy-player-team-tab ${text(state.playerTeam)===text(t.id)?'active':''}" style="--tab-team-color:${esc(t.color||'#f7b700')}" type="button" data-player-team="${esc(t.id)}">${esc(t.name)}</button>`).join('');
  }
  function bindPlayerListActions_(){
    const input=$('#playerSearch');let timer;
    input?.addEventListener('input',()=>{
      clearTimeout(timer);
      const value=input.value;
      timer=setTimeout(()=>{
        if(!ccRouteIs_('competition','players'))return;
        const focused=document.activeElement===input,selectionStart=input.selectionStart,selectionEnd=input.selectionEnd;
        state.playerSearch=value;renderPlayers();
        if(focused){
          const replacement=$('#playerSearch');
          if(replacement){try{replacement.focus({preventScroll:true});if(selectionStart!==null&&selectionEnd!==null)replacement.setSelectionRange(selectionStart,selectionEnd)}catch(_){}}
        }
      },150);
    });
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
  function renderPlayers(){if(!ccRouteIs_('competition','players'))return;
    state.playerFiltersOpen=filterOpen_('competition.players',state.playerFiltersOpen);
    const rows=playerRows(),active=teamFilterIds_('players').length>0||!!state.playerSearch||state.playerMedical!=='all',canEdit=canAnyAction('competition.players','edit');
    $('#viewContent').innerHTML=`<div class="page-intro cc-page-header-panel cc-player-page-header"><div><h2>Játékosok</h2><p>Egységes névsor · vezetéknév szerinti magyar ABC · csapatonként vagy összesítve.</p></div><div class="filter-head-actions cc-icon-toolbar">${active?'<button class="filter-reset cc-toolbar-reset" id="playerFilterReset" type="button" aria-label="Szűrők törlése" title="Szűrők törlése">×</button>':''}<button class="matrix-filter-toggle icon-only cc-toolbar-icon ${state.playerFiltersOpen?'open':''} ${active?'has-filter':''}" id="playerFiltersToggle" aria-expanded="${state.playerFiltersOpen?'true':'false'}" type="button" aria-label="Szűrők" title="Szűrők"><span class="triangle-icon"></span></button>${canEdit?'':'<span class="read-only-badge">MEGTEKINTÉS</span>'}</div></div>
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
      <div class="detail-grid">${detailPair('Megjelenési név',p.displayName||'–')}${detailPair('Email',p.email)}${detailPair('Igazolási szám',p.licenseNo)}${detailPair('Sportorvosi',p.medicalValidUntil?fmtDate(p.medicalValidUntil):'–')}${detailPair('Következő vizsgálat',(()=>{const a=managerMedicalAppointment_(p.playerId);const d=safeDate(a?.appointmentAt);return d?`${fmtDate(d)} ${fmtTime(d)}${a?.location?' · '+a.location:''}`:'Nincs időpont'})())}${detailPair('Tagság kezdete',p.membershipStartsOn?fmtDate(p.membershipStartsOn):'–')}${detailPair('Mezméret',p.jerseySize)}${detailPair('Nadrágméret',p.shortsSize)}${detailPair('Fiók',p.hasAccount?'Aktív':'Nincs összekapcsolva')}${detailPair('Státusz',p.active===false?'Inaktív':'Aktív')}</div>
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
    ccDialogContext_='player';
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
  function renderMassCalendar(){if(!ccRouteIs_('mass','calendar'))return;state.massCalendarFiltersOpen=filterOpen_('mass.calendar',state.massCalendarFiltersOpen);const rows=massCalendarFiltered_(),levels=Array.from(new Set((state.massCalendarEvents||[]).map(e=>text(e.level)).filter(Boolean))).sort((a,b)=>HU_NAME_COLLATOR.compare(a,b)),sessions=Array.from(new Set((state.massCalendarEvents||[]).map(e=>text(e.sessionType)).filter(Boolean))).sort(),active=!!state.massCalendarLevel||!!state.massCalendarSession;$('#viewContent').innerHTML=`<div class="page-intro legacy-calendar-intro"><div><h2>Naptár</h2><p>Tömegsport és SPORT7 alkalmak a canonical Supabase naptárból.</p></div><div class="toolbar-actions"><div class="segmented calendar-modes"><button class="${state.calendarMode==='day'?'active':''}" data-calendar-mode="day">NAP</button><button class="${state.calendarMode==='week'?'active':''}" data-calendar-mode="week">HÉT</button><button class="${state.calendarMode==='month'?'active':''}" data-calendar-mode="month">HÓNAP</button><button class="${state.calendarMode==='season'?'active':''}" data-calendar-mode="season">SZEZON</button></div><div class="filter-head-actions"><button class="icon-button filter-toggle ${state.massCalendarFiltersOpen?'open':''} ${active?'has-filter':''}" id="massCalendarFilterBtn" type="button" aria-label="Szűrők" aria-expanded="${state.massCalendarFiltersOpen?'true':'false'}"><span class="triangle-icon"></span></button>${active?'<button class="filter-reset" id="massCalendarFilterReset" type="button">Szűrők törlése</button>':''}</div></div></div><div class="filter-panel calendar-player-filter" id="massCalendarFilterPanel" ${state.massCalendarFiltersOpen?'':'hidden'}><label class="field compact"><span>Szint</span><select id="massCalendarLevel"><option value="">Minden szint</option>${levels.map(x=>`<option value="${esc(x)}" ${x===state.massCalendarLevel?'selected':''}>${esc(x)}</option>`).join('')}</select></label><label class="field compact"><span>Típus</span><select id="massCalendarSession"><option value="">Minden típus</option>${sessions.map(x=>`<option value="${esc(x)}" ${x===state.massCalendarSession?'selected':''}>${esc(x)}</option>`).join('')}</select></label></div><article class="panel calendar-panel legacy-calendar-panel ${state.calendarMode==='month'?'player-month-parity-panel':''}">${state.calendarMode==='month'?'':`<div class="legacy-calendar-nav"><div class="legacy-calendar-nav-buttons"><button class="button quiet square" id="calendarPrev" type="button">←</button><button class="button quiet" id="calendarToday" type="button">Mai napra</button><button class="button quiet square" id="calendarNext" type="button">→</button><button class="button quiet" id="calendarRefresh" type="button">↻ Frissítés</button></div><strong>${esc(calendarRangeText())}</strong><div class="calendar-team-legend">${levels.map(x=>`<span><i style="background:${esc(massLevelColor({level:x}))}"></i>${esc(x)}</span>`).join('')}</div></div>`}<div class="desktop-week-grid">${state.calendarMode==='week'?massWeekGridHtml_(rows):state.calendarMode==='month'?monthGridHtml_(rows,{mass:true}):massAgendaHtml_(rows)}</div><div class="mobile-calendar-agenda">${state.calendarMode==='month'?monthGridHtml_(rows,{mass:true}):massAgendaHtml_(rows)}</div></article>`;bindMassCalendarUi_();bindMassLegacyRows()}
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
  function renderCalendar(){if(state.module!=='calendar'||!['competition','mass'].includes(state.area))return;
    state.calendarFiltersOpen=filterOpen_('legacy.calendar',state.calendarFiltersOpen);const scopeOptions=legacyCalendarScopeOptions_();if(!scopeOptions.some(x=>x[0]===state.calendarScope))state.calendarScope=scopeOptions[0]?.[0]||(state.area==='mass'?'MASS':'COMPETITION');const rows=legacyCalendarRows_(),scope=state.calendarScope||'COMPETITION',active=!!state.calendarTeam||!!state.calendarType||!!state.massCalendarLevel||!!state.massCalendarSession;
    const levels=Array.from(new Set((state.massCalendarEvents||[]).map(e=>text(e.level)).filter(Boolean))).sort((a,b)=>HU_NAME_COLLATOR.compare(a,b)),sessions=Array.from(new Set((state.massCalendarEvents||[]).map(e=>text(e.sessionType)).filter(Boolean))).sort();
    const body=state.calendarMode==='day'?legacyCalendarDayBoard_(rows):state.calendarMode==='week'?legacyCalendarWeekBoard_(rows):state.calendarMode==='month'?legacyCalendarMonth_(rows):legacyCalendarSeason_(rows);
    $('#viewContent').innerHTML=`<div class="cc-manager-calendar-view"><div class="cc-calendar-head"><div><h2>Naptár</h2><div class="cc-calendar-subtitle">Nap / Hét / Hónap / Szezon · Tömegsport és versenysport egy helyen.</div></div></div><div class="cc-filter-shell cc-calendar-filter-shell"><div class="cc-filter-head"><button id="calendarFilterBtn" class="cc-filter-toggle ${state.calendarFiltersOpen?'open':''} ${active?'has-filter':''}" type="button"><span class="cc-filter-triangle" aria-hidden="true"></span><span>Szűrők</span></button>${active?'<button id="calendarFilterReset" class="cc-filter-clear" type="button">Szűrők törlése</button>':''}</div><div id="calendarFilterPanel" class="cc-filter-panel cc-calendar-filter-panel" ${state.calendarFiltersOpen?'':'hidden'}><div class="cc-calendar-toolbar"><div class="cc-calendar-segment cc-calendar-view-segment" aria-label="Naptár nézet">${[['day','NAP'],['week','HÉT'],['month','HÓNAP'],['season','SZEZON']].map(([k,l])=>`<button type="button" data-calendar-mode="${k}" class="${state.calendarMode===k?'active':''}">${l}</button>`).join('')}</div><div class="cc-calendar-segment cc-calendar-scope-segment" aria-label="Naptár tartalom">${scopeOptions.map(([k,l])=>`<button type="button" data-calendar-scope="${k}" class="${scope===k?'active':''}">${l}</button>`).join('')}</div></div><div class="legacy-calendar-extra-filters">${scope==='MASS'?`<label class="field compact"><span>Szint</span><select id="massCalendarLevel"><option value="">Minden szint</option>${levels.map(x=>`<option value="${esc(x)}" ${x===state.massCalendarLevel?'selected':''}>${esc(x)}</option>`).join('')}</select></label><label class="field compact"><span>Típus</span><select id="massCalendarSession"><option value="">Minden típus</option>${sessions.map(x=>`<option value="${esc(x)}" ${x===state.massCalendarSession?'selected':''}>${esc(x)}</option>`).join('')}</select></label>`:`<label class="field compact"><span>Csapat</span><select id="calendarTeamFilter">${teamOptions(state.calendarTeam)}</select></label><label class="field compact"><span>Típus</span><select id="calendarTypeFilter"><option value="">Minden esemény</option><option value="training" ${state.calendarType==='training'?'selected':''}>Edzés</option><option value="match" ${state.calendarType==='match'?'selected':''}>Meccs</option></select></label>`}</div></div></div><div class="cc-calendar-nav-row"><div class="cc-calendar-nav-buttons"><button id="calendarPrev" type="button" aria-label="Előző">←</button><button id="calendarToday" type="button">MAI NAPRA</button><button id="calendarNext" type="button" aria-label="Következő">→</button><button id="calendarRefresh" type="button">↻ FRISSÍTÉS</button></div><div class="cc-calendar-range-label">${esc(calendarRangeText())}</div><div class="cc-calendar-legend">${legacyCalendarLegend_(rows)}</div></div><div class="cc-calendar-canvas">${body}</div></div>`;
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
  function adminPermissionEditorRow(admin,key,label){const rows=permissionRowsForAdmin(admin,key),canView=rows.some(x=>x.canView),canEdit=rows.some(x=>x.canEdit),canNotify=rows.some(x=>x.canNotify),finance=key==='competition.fees',competition=key.startsWith('competition.')&&!finance,global=competition&&rows.some(x=>!x.teamId),selected=new Set(rows.filter(x=>x.teamId).map(x=>text(x.teamId))),teams=(state.adminTeams.length?state.adminTeams:state.teams).filter(t=>t.active!==false);return `<div class="admin-permission-row ${finance?'finance-permission-row':''}" data-admin-module-row="${esc(key)}"><div class="admin-module-name"><b>${esc(label)}</b><small>${esc(key)}</small></div><label><input type="checkbox" data-right="view" ${canView?'checked':''}> Nézet</label><label><input type="checkbox" data-right="edit" ${canEdit?'checked':''}> Szerk.</label>${finance?'<span class="admin-right-placeholder">–</span>':`<label><input type="checkbox" data-right="notify" ${canNotify?'checked':''}> Értesítés</label>`}${competition?`<div class="admin-team-scope"><label class="scope-all"><input type="checkbox" data-scope-all ${global?'checked':''}> Minden csapat</label>${teams.map(t=>`<label><input type="checkbox" data-scope-team value="${esc(t.id)}" ${!global&&selected.has(text(t.id))?'checked':''} ${global?'disabled':''}><span class="team-color-mini" style="background:${esc(t.color||'#f7b700')}"></span>${esc(t.name)}</label>`).join('')}</div>`:'<div class="admin-team-scope muted-scope">Klubszintű</div>'}</div>`}
  function adminEditorHtml(){const isNew=state.adminEditId==='__new__',admin=isNew?{id:'',email:'',displayName:'',active:true,permissions:[]}:(state.admins||[]).find(a=>text(a.id)===text(state.adminEditId));if(!admin)return `<div class="admin-editor-empty"><b>Válassz egy admint</b><span>Vagy hozz létre új Manager-fiókot.</span></div>`;return `<div class="admin-editor" data-admin-id="${esc(admin.id||'')}"><div class="admin-editor-head"><div><h3>${isNew?'Új admin':'Admin szerkesztése'}</h3><p>${admin.authBound?'A fiók már Supabase Auth felhasználóhoz van kötve.':'Az első sikeres OTP belépéskor kapcsolódik az Auth-fiókhoz.'}</p></div>${!isNew?`<span class="status-pill ${admin.authBound?'ok':''}">${admin.authBound?'AUTH KÖTVE':'MÉG NEM LÉPETT BE'}</span>`:''}</div><div class="admin-account-grid"><label class="field"><span>Név</span><input id="adminDisplayName" value="${esc(admin.displayName||'')}" placeholder="Név"></label><label class="field"><span>Email</span><input id="adminEmail" type="email" value="${esc(admin.email||'')}" ${admin.authBound?'readonly':''} placeholder="nev@example.com"></label><label class="admin-active-toggle"><input id="adminActive" type="checkbox" ${admin.active!==false?'checked':''} ${admin.isSelf?'disabled':''}><span>Aktív Manager-fiók</span></label></div><div class="admin-permission-toolbar"><div><b>Jogosultságok</b><small>Nézet / Szerkesztés / Értesítés; a Pénzügyek külön klubszintű jog.</small></div><div><button class="button quiet small" id="adminViewAllBtn" type="button">Minden megtekintés</button><button class="button quiet small" id="adminFullBtn" type="button">Teljes admin</button></div></div><div class="admin-permission-groups">${ADMIN_MODULES.map(g=>`<section><h4>${esc(g.group)}</h4>${g.items.map(([k,l])=>adminPermissionEditorRow(admin,k,l)).join('')}</section>`).join('')}</div><div class="admin-editor-actions"><button class="button primary" id="adminSaveBtn" type="button" ${state.adminBusy?'disabled':''}>${state.adminBusy?'Mentés…':'Mentés'}</button><button class="button quiet" id="adminCancelBtn" type="button">Mégse</button></div></div>`}
  function collectAdminPermissionPayload(){const out=[];$$('[data-admin-module-row]').forEach(row=>{const key=row.dataset.adminModuleRow,view=row.querySelector('[data-right="view"]')?.checked===true,edit=row.querySelector('[data-right="edit"]')?.checked===true,notify=row.querySelector('[data-right="notify"]')?.checked===true;if(!(view||edit||notify))return;const scoped=key.startsWith('competition.')&&key!=='competition.fees';if(scoped){const all=row.querySelector('[data-scope-all]')?.checked===true,teams=Array.from(row.querySelectorAll('[data-scope-team]')).filter(x=>x.checked).map(x=>x.value);if(all||!teams.length)out.push({moduleKey:key,teamId:null,canView:view,canEdit:edit,canNotify:notify});else teams.forEach(teamId=>out.push({moduleKey:key,teamId,canView:view,canEdit:edit,canNotify:notify}))}else out.push({moduleKey:key,teamId:null,canView:view,canEdit:edit,canNotify:notify})});return out}
  async function saveAdminEditorSafe(){if(state.adminBusy)return;const email=text($('#adminEmail')?.value).toLowerCase(),name=text($('#adminDisplayName')?.value),active=$('#adminActive')?.checked!==false,payload=collectAdminPermissionPayload();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){status('Adj meg érvényes admin email címet.','error');return}const existing=state.adminEditId==='__new__'?null:(state.admins||[]).find(a=>text(a.id)===text(state.adminEditId));state.adminBusy=true;renderSettings();try{status('Admin és jogosultságok mentése…');const saved=await rpc('cc_manager_admin_save_v1',{p_manager_id:existing?.id||null,p_email:email,p_display_name:name,p_active:active,p_permissions:payload});await loadAdmins();state.adminEditId=text(saved?.account?.id||existing?.id);status('Admin mentve.','success')}catch(err){console.error(err);status(err.message||'Az admin mentése sikertelen.','error')}finally{state.adminBusy=false;renderSettings()}}
  function bindAdminEditor(){$$('[data-admin-edit]').forEach(b=>b.addEventListener('click',()=>{state.adminEditId=b.dataset.adminEdit;renderSettings()}));$('#adminAddBtn')?.addEventListener('click',()=>{state.adminEditId='__new__';renderSettings()});$('#adminCancelBtn')?.addEventListener('click',()=>{state.adminEditId='';renderSettings()});$('#adminSaveBtn')?.addEventListener('click',saveAdminEditorSafe);$('#adminViewAllBtn')?.addEventListener('click',()=>{$$('[data-admin-module-row]').forEach(r=>{const v=r.querySelector('[data-right="view"]');if(v)v.checked=true});});$('#adminFullBtn')?.addEventListener('click',()=>{$$('[data-admin-module-row]').forEach(r=>{['view','edit','notify'].forEach(k=>{const x=r.querySelector(`[data-right="${k}"]`);if(x)x.checked=true});const all=r.querySelector('[data-scope-all]');if(all){all.checked=true;Array.from(r.querySelectorAll('[data-scope-team]')).forEach(x=>{x.checked=false;x.disabled=true})}})});$$('[data-scope-all]').forEach(x=>x.addEventListener('change',()=>{Array.from(x.closest('[data-admin-module-row]').querySelectorAll('[data-scope-team]')).forEach(t=>{t.disabled=x.checked;if(x.checked)t.checked=false})}))}
  function financeMonths_(){const y=Number(String(cfg.DEFAULT_SEASON||'2026/27').slice(0,4))||2026;return Array.from({length:10},(_,i)=>{const m=9+i,year=y+Math.floor((m-1)/12),month=((m-1)%12)+1;return `${year}-${String(month).padStart(2,'0')}`})}
  function financeMonthLabel_(key){const [y,m]=String(key).split('-').map(Number);return new Intl.DateTimeFormat('hu-HU',{month:'short'}).format(new Date(y,m-1,2)).replace('.','')}
  function financeFeeBase_(playerId,type,period=''){
    const fees=Array.isArray(state.financeData?.fees)?state.financeData.fees:[];
    const rows=fees.filter(f=>text(f.playerId)===text(playerId)&&text(f.feeType)===text(type)&&(period?text(f.periodKey).slice(0,7)===period:!text(f.periodKey)));
    return rows[rows.length-1]||null
  }
  function financeFeeMeta_(playerId,type,period=''){
    const meta=Array.isArray(state.financeData?.meta)?state.financeData.meta:[];
    const rows=meta.filter(f=>text(f.playerId)===text(playerId)&&text(f.feeType)===text(type)&&text(f.periodKey)===text(period)&&(!text(f.season)||text(f.season)===text(cfg.DEFAULT_SEASON)));
    return rows[rows.length-1]||null
  }
  function financeMetaIsAuto_(meta){return /^AUTO_BEAC_IMPORT/i.test(text(meta?.note))}
  function financeManualLocked_(meta){return !!(meta?.overrideActive&&!financeMetaIsAuto_(meta))}
  function financeEffective_(playerId,type,period=''){
    const base=financeFeeBase_(playerId,type,period),meta=financeFeeMeta_(playerId,type,period),auto=financeMetaIsAuto_(meta),locked=financeManualLocked_(meta);
    if(locked)return{...base,...meta,source:'manager_override',base,meta,manualLocked:true};
    if(base)return{...base,paymentMethod:meta?.paymentMethod||'',paidTo:meta?.paidTo||'',base,meta,overrideActive:false,manualLocked:false};
    if(meta)return{...meta,source:auto?'beac_import':'manager_unlocked',base:null,meta,manualLocked:false};
    return null
  }
  function financeStatus_(fee){const st=text(fee?.status);return st==='paid'?'paid':st==='waived'||st==='prior_paid'?'waived':fee?'due':'empty'}
  function financeStatusSymbol_(fee){const st=financeStatus_(fee);return st==='paid'?'✓':st==='waived'?'–':st==='due'?'!':'·'}
  function financeMethodShort_(m){return({online:'ON',cash:'KP',revolut:'REV',transfer:'UT',other:'•'})[text(m)]||''}
  function financeCellHtml_(player,type,period,label){const fee=financeEffective_(player.playerId,type,period),st=financeStatus_(fee),method=financeMethodShort_(fee?.paymentMethod),editable=canAction('competition.fees','edit');return `<button type="button" class="finance-cell ${st} ${editable?'':'view-only'}" data-finance-player="${esc(player.playerId)}" data-finance-type="${esc(type)}" data-finance-period="${esc(period)}" title="${esc(label)}${editable?'':' · csak megtekintés'}" ${editable?'':'disabled'}><b>${financeStatusSymbol_(fee)}</b>${method?`<small>${esc(method)}</small>`:''}</button>`}
  async function ccFinanceReconcileBeac_(){
    if(!canAction('competition.fees','edit'))return null;
    try{return await rpc('cc_manager_finance_reconcile_beac_v1',{p_season:cfg.DEFAULT_SEASON})}
    catch(err){const msg=text(err?.message||err);if(/cc_manager_finance_reconcile_beac_v1|does not exist|schema cache/i.test(msg))return null;console.warn('BEAC pénzügyi egyeztetés sikertelen:',err);return null}
  }
  async function loadFinanceData_(teamId=state.financeTeam||null){state.financeLoading=true;try{await ccFinanceReconcileBeac_();state.financeData=await rpc('cc_manager_finance_matrix_v1',{p_team_id:teamId||null,p_season:cfg.DEFAULT_SEASON});state.financeSettings=state.financeData?.settings||state.financeSettings}catch(err){state.financeData={error:text(err?.message||err),players:[],fees:[],meta:[]};throw err}finally{state.financeLoading=false}}
  async function loadFinanceAudit_(){const d=await rpc('cc_manager_finance_audit_v1',{p_limit:150});state.financeAudit=Array.isArray(d)?d:[]}
  async function loadFinanceSettings_(teamId=state.financeSettingsTeam||state.financeTeam||''){
    try{state.financeSettings=await rpc('cc_manager_finance_settings_get_v2',{p_team_id:teamId||null,p_season:cfg.DEFAULT_SEASON})}
    catch(err){const msg=text(err?.message||err);if(!/cc_manager_finance_settings_get_v2|does not exist|schema cache/i.test(msg))throw err;state.financeSettings=await rpc('cc_manager_finance_settings_get_v1',{p_season:cfg.DEFAULT_SEASON})}
    return state.financeSettings
  }
  async function loadFinancePassCatalog_(){
    try{const d=await rpc('cc_manager_pass_catalog_v1',{});state.financePassCatalog=Array.isArray(d)?d:[];state.financePassCatalogLoaded=true;return state.financePassCatalog}
    catch(err){console.warn('MGR021 pass catalog unavailable; falling back to current pass sources',err);state.financePassCatalog=financePassCatalogFallback_();state.financePassCatalogLoaded=true;return state.financePassCatalog}
  }
  function financeNorm_(v){return text(v).toLocaleLowerCase('hu-HU').normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
  function financePassKind_(row){const raw=financeNorm_(`${row?.product||''} ${row?.passGroup||''} ${row?.level||''}`);return raw.includes('versenyzoi')?'competition':text(row?.kind)||'mass'}
  function financePassStatus_(row){const key=text(row?.validMonth).slice(0,7),now=new Intl.DateTimeFormat('sv-SE',{year:'numeric',month:'2-digit',timeZone:'Europe/Budapest'}).format(new Date());if(text(row?.status))return text(row.status);if(!key)return'unknown';return key===now?'current':key<now?'expired':'future'}
  function financePassCatalogFallback_(){
    const mass=(state.massPasses||[]).map(r=>({...r,kind:financePassKind_(r),level:financePassKind_(r)==='competition'?'Versenyzői':text(r.passGroup),teamId:'',teamName:'',status:financePassStatus_(r)}));
    const byPass=new Set(mass.map(r=>text(r.passNumber).toLowerCase()).filter(Boolean)),players=state.financeData?.players||[],fees=state.financeData?.fees||[];
    fees.filter(f=>text(f.feeType)==='beac_pass').forEach(f=>{const pass=text(f.sourceRef),pl=players.find(p=>text(p.playerId)===text(f.playerId));if(pass&&byPass.has(pass.toLowerCase()))return;mass.push({passNumber:pass||`fee-${f.feeId||''}`,product:'Versenyzői bérlet',passGroup:'Versenyzői',level:'Versenyzői',email:f.playerEmail||pl?.email||'',athleteName:pl?.displayName||pl?.name||f.playerEmail||'',purchaseDate:f.paidAt||f.dueDate||'',validMonth:text(f.periodKey).slice(0,7),season:f.season||cfg.DEFAULT_SEASON,amountHuf:f.amountHuf,teamId:pl?.teamId||'',teamName:pl?.teamName||'',kind:'competition',status:financePassStatus_({validMonth:text(f.periodKey).slice(0,7)})})});
    return mass
  }
  function financePassRows_(){
    let rows=(state.financePassCatalogLoaded?state.financePassCatalog:financePassCatalogFallback_()).map(r=>({...r,kind:financePassKind_(r),level:text(r.level||r.passGroup)||(financePassKind_(r)==='competition'?'Versenyzői':''),status:financePassStatus_(r)}));
    const q=financeNorm_(state.financePassSearch),type=text(state.financePassType),level=text(state.financePassLevel),team=text(state.financePassTeam),month=text(state.financePassMonth),st=text(state.financePassStatus);
    rows=rows.filter(r=>(!q||financeNorm_(`${r.athleteName||''} ${r.email||''} ${r.passNumber||''} ${r.product||''} ${r.passGroup||''} ${r.teamName||''}`).includes(q))&&(!type||r.kind===type)&&(!level||text(r.level)===level)&&(!team||text(r.teamId)===team)&&(!month||text(r.validMonth).slice(0,7)===month)&&(!st||text(r.status)===st));
    rows.sort((a,b)=>comparePlayersBySurname_({name:a.athleteName||a.email||''},{name:b.athleteName||b.email||''})||text(b.purchaseDate).localeCompare(text(a.purchaseDate)));return rows
  }
  function financeSettingsForPlayer_(p){const by=state.financeData?.settingsByTeam||{};return by[text(p?.teamId)]||state.financeSettings||state.financeData?.settings||{}}
  function financeCompetitionFilteredPlayers_(){
    const all=Array.isArray(state.financeData?.players)?state.financeData.players:[],q=financeNorm_(state.financeCompetitionSearch),month=text(state.financeCompetitionMonth),statusFilter=text(state.financeCompetitionStatus),type=text(state.financeCompetitionType);
    return all.filter(p=>{if(q&&!financeNorm_(`${p.displayName||p.name||''} ${p.email||''} ${p.teamName||''}`).includes(q))return false;if(!statusFilter)return true;let fees=[];if(!type||type==='permission_fee')fees.push(financeEffective_(p.playerId,'permission_fee',''));if(type!=='permission_fee'){const ms=month?[month]:financeMonths_();if(!type||type==='beac_pass')ms.forEach(m=>fees.push(financeEffective_(p.playerId,'beac_pass',m)));if(!type||type==='coach_fee')ms.forEach(m=>fees.push(financeEffective_(p.playerId,'coach_fee',m)))}return fees.some(f=>financeStatus_(f)===statusFilter)}).sort(comparePlayersBySurname_)
  }
  function financeTabsHtml_(){const defs=[['competition','Versenycsapatok'],['passes','Bérletek'],['settings','Beállítások'],['audit','Napló']];return `<div class="finance-tabs">${defs.map(([k,l])=>`<button type="button" class="${state.financeTab===k?'active':''}" data-finance-tab="${k}">${l}</button>`).join('')}</div>`}
  function financeTeamSelectHtml_(){return `<label class="finance-team-select"><span>Csapat</span><select id="financeTeamSelect"><option value="" ${state.financeTeam?'':'selected'}>Mind</option>${state.teams.filter(t=>t.active!==false).map(t=>`<option value="${esc(t.id)}" ${text(state.financeTeam)===text(t.id)?'selected':''}>${esc(t.name)}</option>`).join('')}</select></label>`}
  function financePlayerIdentityHtml_(p){const base=(state.players||[]).find(x=>text(x.playerId||x.id)===text(p.playerId))||p;return `<span class="finance-player-identity">${avatarHtml({...base,name:p.displayName||p.name||base.name},'finance')}<span><b>${esc(p.displayName||p.name||'Játékos')}</b><small>${esc(p.teamName||'')}</small></span></span>`}

  // Read only: reports the existing paid entries; no payment data is generated here.
  function ccCompetitionFinanceSnapshotHtml_(){
    const all=Array.isArray(state.financeData?.players)?state.financeData.players:[];
    const players=Array.from(new Map(all.map(p=>[text(p.playerId),p])).values());
    const month=new Intl.DateTimeFormat('sv-SE',{year:'numeric',month:'2-digit',timeZone:'Europe/Budapest'}).format(new Date());
    const count=(feeType,period)=>players.filter(p=>financeStatus_(financeEffective_(p.playerId,feeType,period))==='paid').length;
    const paidPass=count('beac_pass',month),paidCoach=count('coach_fee',month),paidLicense=count('permission_fee','');
    return `<div class="cc-finance-summary" aria-label="Befizetések áttekintése">
      <div><small>Bérlet · ${esc(month)}</small><b>${paidPass}/${players.length}</b><span>fizetettként rögzítve</span></div>
      <div><small>Edzői díj · ${esc(month)}</small><b>${paidCoach}/${players.length}</b><span>kézzel kezelhető</span></div>
      <div><small>Versenyengedély</small><b>${paidLicense}/${players.length}</b><span>kézzel kezelhető</span></div>
      <p>Az online BEAC-bérleteket a meglévő egyeztetés kapcsolja a játékosokhoz. A kézi, zárolt módosítások külön megmaradnak. A hiányzó díjak nem számítanak befizetettnek.</p>
    </div>`;
  }
  function financeCompetitionHtml_(){
    if(state.financeLoading)return'<article class="panel"><div class="loading-inline">Pénzügyi adatok betöltése…</div></article>';
    if(state.financeData?.error)return`<article class="panel"><div class="inline-error">${esc(state.financeData.error)}</div></article>`;
    const players=financeCompetitionFilteredPlayers_(),allMonths=financeMonths_(),months=state.financeCompetitionMonth?[state.financeCompetitionMonth]:allMonths,type=text(state.financeCompetitionType),active=!!(state.financeCompetitionSearch||state.financeCompetitionMonth||state.financeCompetitionStatus||state.financeCompetitionType||state.financeTeam);
    const monthHead=type==='permission_fee'?'':months.map(m=>`<th><b>${esc(financeMonthLabel_(m))}</b><small>${type==='beac_pass'?'B':type==='coach_fee'?'E':'B · E'}</small></th>`).join('');
    const licenseHead=type&&type!=='permission_fee'?'':'<th class="finance-license-col" title="Versenyengedély"><span class="finance-license-short">Eng.</span></th>';
    const body=players.map(p=>`<tr><th class="finance-player-col">${financePlayerIdentityHtml_(p)}</th>${type&&type!=='permission_fee'?'':`<td class="finance-license-col">${financeCellHtml_(p,'permission_fee','', 'Versenyengedély')}</td>`}${type==='permission_fee'?'':months.map(m=>`<td><div class="finance-month-pair ${type?'single':''}">${type==='coach_fee'?'':financeCellHtml_(p,'beac_pass',m,`${m} bérlet`)}${type==='beac_pass'?'':financeCellHtml_(p,'coach_fee',m,`${m} edzői díj`)}</div></td>`).join('')}</tr>`).join('');
    return `${ccCompetitionFinanceSnapshotHtml_()}<div class="finance-filter-toolbar"><span class="cc-icon-toolbar finance-filter-icons"><button type="button" class="matrix-filter-toggle icon-only cc-toolbar-icon ${state.financeCompetitionFiltersOpen?'open':''} ${active?'has-filter':''}" id="financeCompetitionFiltersToggle" aria-expanded="${state.financeCompetitionFiltersOpen?'true':'false'}" aria-label="Szűrők" title="Szűrők"><span class="triangle-icon"></span></button>${active?'<button type="button" class="filter-reset cc-toolbar-reset" id="financeCompetitionReset" aria-label="Szűrők törlése" title="Szűrők törlése">×</button>':''}</span><span>${players.length} játékos</span></div><div class="filter-panel finance-filter-panel" id="financeCompetitionFiltersPanel" ${state.financeCompetitionFiltersOpen?'':'hidden'}><input id="financeCompetitionSearch" type="search" value="${esc(state.financeCompetitionSearch)}" placeholder="Név vagy email…">${financeTeamSelectHtml_()}<label><span>Hónap</span><select id="financeCompetitionMonth"><option value="">Minden hónap</option>${allMonths.map(m=>`<option value="${m}" ${state.financeCompetitionMonth===m?'selected':''}>${esc(financeMonthLabel_(m))}</option>`).join('')}</select></label><label><span>Díjtípus</span><select id="financeCompetitionType"><option value="">Minden díj</option><option value="permission_fee" ${type==='permission_fee'?'selected':''}>Versenyengedély</option><option value="beac_pass" ${type==='beac_pass'?'selected':''}>Bérlet / tagdíj</option><option value="coach_fee" ${type==='coach_fee'?'selected':''}>Edzői díj</option></select></label><label><span>Állapot</span><select id="financeCompetitionStatus"><option value="">Minden állapot</option><option value="paid" ${state.financeCompetitionStatus==='paid'?'selected':''}>Fizetve</option><option value="due" ${state.financeCompetitionStatus==='due'?'selected':''}>Fizetendő</option><option value="waived" ${state.financeCompetitionStatus==='waived'?'selected':''}>Elengedve / korábban</option><option value="empty" ${state.financeCompetitionStatus==='empty'?'selected':''}>Nincs adat</option></select></label></div><article class="panel finance-matrix-panel"><div class="panel-head"><div><h3>Befizetések</h3><p>Automatikus BEAC adat + auditált kézi állapot. Zárolt kézi felülírást az import nem ír át.</p></div></div><div class="finance-matrix-scroll"><table class="finance-matrix"><thead><tr><th class="finance-player-col">Játékos</th>${licenseHead}${monthHead}</tr></thead><tbody>${body||`<tr><td colspan="14">${emptyInline('Nincs játékos ebben a szűrésben.')}</td></tr>`}</tbody></table></div><div class="finance-legend"><span><i class="paid"></i>Fizetve</span><span><i class="due"></i>Fizetendő</span><span><i class="waived"></i>Elengedve</span><span>B = bérlet/tagdíj · E = edzői díj</span></div></article>`
  }
  function financePassAnalyticsHtml_(){
    const all=(state.financePassCatalogLoaded?state.financePassCatalog:financePassCatalogFallback_()).map(r=>({...r,kind:financePassKind_(r),level:text(r.level||r.passGroup)||(financePassKind_(r)==='competition'?'Versenyzői':''),status:financePassStatus_(r)})),rows=financePassRows_(),settings=state.financeSettings||state.financeData?.settings||{},settingsByTeam=state.financeData?.settingsByTeam||{};
    const fallbackAmount=p=>{const rowSettings=settingsByTeam[text(p?.teamId)]||settings;const n=Number(rowSettings?.passAmountHuf);return Number.isFinite(n)&&n>0?n:7000};
    const amount=p=>{for(const raw of [p.amountHuf,p.priceHuf,p.grossAmount,p.amount,p.price]){if(raw===null||raw===undefined||String(raw).trim()==='')continue;const n=Number(String(raw).replace(/\s/g,'').replace(',','.').replace(/[^0-9.-]/g,''));if(Number.isFinite(n)&&n>=0)return n}return fallbackAmount(p)};
    const revenue=rows.reduce((a,p)=>a+amount(p),0),comp=rows.filter(p=>p.kind==='competition').length,mass=rows.filter(p=>p.kind!=='competition').length,levels=Array.from(new Set(all.map(p=>text(p.level)).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'hu')),months=Array.from(new Set(all.map(p=>text(p.validMonth).slice(0,7)).filter(Boolean))).sort().reverse(),teams=state.teams.filter(t=>t.active!==false),active=!!(state.financePassSearch||state.financePassType||state.financePassLevel||state.financePassTeam||state.financePassMonth||state.financePassStatus);
    const byMonth=new Map();rows.forEach(p=>{const key=text(p.validMonth||p.purchaseDate).slice(0,7)||'Nincs hónap';const x=byMonth.get(key)||{count:0,revenue:0};x.count++;x.revenue+=amount(p);byMonth.set(key,x)});const monthly=Array.from(byMonth.entries()).sort((a,b)=>a[0].localeCompare(b[0])).slice(-12),max=Math.max(1,...monthly.map(x=>x[1].revenue));
    return `<div class="finance-filter-toolbar"><span class="cc-icon-toolbar finance-filter-icons"><button type="button" class="matrix-filter-toggle icon-only cc-toolbar-icon ${state.financePassFiltersOpen?'open':''} ${active?'has-filter':''}" id="financePassFiltersToggle" aria-expanded="${state.financePassFiltersOpen?'true':'false'}" aria-label="Szűrők" title="Szűrők"><span class="triangle-icon"></span></button>${active?'<button type="button" class="filter-reset cc-toolbar-reset" id="financePassReset" aria-label="Szűrők törlése" title="Szűrők törlése">×</button>':''}</span><label class="finance-pass-quick-search"><span class="sr-only">Bérletkeresés</span><input id="financePassSearch" type="search" aria-label="Bérletkeresés név, email vagy bérletszám alapján" value="${esc(state.financePassSearch)}" placeholder="Keresés: név, email, bérletszám…" autocomplete="off"></label><span>${rows.length} / ${all.length} bérlet</span></div><div class="filter-panel finance-filter-panel finance-pass-filter-panel" id="financePassFiltersPanel" ${state.financePassFiltersOpen?'':'hidden'}><label><span>Típus</span><select id="financePassType"><option value="">Mind</option><option value="mass" ${state.financePassType==='mass'?'selected':''}>Tömegsport</option><option value="competition" ${state.financePassType==='competition'?'selected':''}>Versenyzői</option></select></label><label><span>Szint</span><select id="financePassLevel"><option value="">Minden szint</option>${levels.map(x=>`<option value="${esc(x)}" ${state.financePassLevel===x?'selected':''}>${esc(x)}</option>`).join('')}</select></label><label><span>Csapat</span><select id="financePassTeam"><option value="">Minden csapat</option>${teams.map(t=>`<option value="${esc(t.id)}" ${state.financePassTeam===text(t.id)?'selected':''}>${esc(t.name)}</option>`).join('')}</select></label><label><span>Hónap</span><select id="financePassMonth"><option value="">Minden hónap</option>${months.map(x=>`<option value="${esc(x)}" ${state.financePassMonth===x?'selected':''}>${esc(x)}</option>`).join('')}</select></label><label><span>Állapot</span><select id="financePassStatus"><option value="">Minden</option><option value="current" ${state.financePassStatus==='current'?'selected':''}>Aktuális</option><option value="future" ${state.financePassStatus==='future'?'selected':''}>Jövőbeli</option><option value="expired" ${state.financePassStatus==='expired'?'selected':''}>Lejárt</option><option value="unknown" ${state.financePassStatus==='unknown'?'selected':''}>Ellenőrzendő</option></select></label></div><div class="finance-kpis"><div><span>Szűrt bérlet</span><b>${rows.length}</b></div><div><span>Tömegsport / verseny</span><b>${mass} / ${comp}</b></div><div><span>Bevétel</span><b>${revenue.toLocaleString('hu-HU')} Ft</b></div></div><article class="panel finance-chart-panel"><div class="panel-head"><div><h3>Bérletértékesítés</h3><p>A rögzített/importált ár az elsődleges; alapár csak hiányzó árnál fallback.</p></div></div><div class="finance-bar-chart">${monthly.map(([key,v])=>`<div class="finance-bar-row"><span>${esc(key)}</span><div><i style="width:${Math.max(2,Math.round(v.revenue/max*100))}%"></i></div><b>${v.count} db · ${v.revenue.toLocaleString('hu-HU')} Ft</b></div>`).join('')||emptyInline('Nincs bérletadat.')}</div></article><article class="panel finance-pass-list"><div class="panel-head"><div><h3>Bérletek</h3><p>Tömegsport és versenyzői bérletek közös, szűrhető listája.</p></div></div><div class="finance-pass-catalog"><div class="finance-pass-catalog-head"><span>Bérlet</span><span>Sportoló</span><span>Típus / szint</span><span>Hónap / csapat</span><span>Ár / állapot</span></div>${rows.map(p=>`<div class="finance-pass-catalog-row"><span><b>${esc(p.passNumber||'–')}</b><small>${esc(p.product||'')}</small></span><span><b>${esc(p.athleteName||p.name||p.email||'–')}</b><small>${esc(p.email||'')}</small></span><span><b>${p.kind==='competition'?'Versenyzői':'Tömegsport'}</b><small>${esc(p.level||p.passGroup||'')}</small></span><span><b>${esc(p.validMonth||'–')}</b><small>${esc(p.teamName||'')}</small></span><span><b>${amount(p).toLocaleString('hu-HU')} Ft</b><small class="pass-status ${esc(p.status)}">${p.status==='current'?'AKTUÁLIS':p.status==='expired'?'LEJÁRT':p.status==='future'?'JÖVŐBELI':'ELLENŐRIZENDŐ'}</small></span></div>`).join('')||emptyInline('Nincs a szűrésnek megfelelő bérlet.')}</div></article>`
  }
  function financeSettingsHtml_(){
    const teams=state.teams.filter(t=>t.active!==false);if(!state.financeSettingsTeam&&teams.length)state.financeSettingsTeam=text(teams[0].id);const x=state.financeSettings||{},editable=canAction('competition.fees','edit'),disabled=editable?'':'disabled';
    return `<article class="panel finance-settings-panel"><div class="panel-head"><div><h3>Player Díjak beállításai</h3><p>A fizetendő összegek csapatonként külön állíthatók. Az importált tényleges vásárlási ár ettől függetlenül megmarad.</p></div>${editable?'':'<span class="read-only-badge">MEGTEKINTÉS</span>'}</div><div class="finance-settings-team-row"><label><span>Csapat</span><select id="financeSettingsTeam">${teams.map(t=>`<option value="${esc(t.id)}" ${state.financeSettingsTeam===text(t.id)?'selected':''}>${esc(t.name)}</option>`).join('')}</select></label></div><form id="financeSettingsForm" class="action-form finance-settings-form"><div class="action-form-grid"><label class="field"><span>Bérlet / tagdíj (Ft)</span><input id="fsPassAmount" type="number" min="0" value="${esc(x.passAmountHuf??'')}" ${disabled}></label><label class="field"><span>Edzői díj (Ft)</span><input id="fsCoachAmount" type="number" min="0" value="${esc(x.coachAmountHuf??'')}" ${disabled}></label><label class="field"><span>Versenyengedély (Ft)</span><input id="fsLicenseAmount" type="number" min="0" value="${esc(x.licenseAmountHuf??'')}" ${disabled}></label><label class="field"><span>Bérletvásárlás link</span><input id="fsPassUrl" value="${esc(x.passPurchaseUrl||'')}" ${disabled}></label><label class="field"><span>Edzői díj címzett</span><input id="fsCoachRecipient" value="${esc(x.coachPaymentRecipient||'')}" ${disabled}></label><label class="field"><span>Számla / Revolut / azonosító</span><input id="fsCoachAccount" value="${esc(x.coachPaymentAccount||'')}" ${disabled}></label><label class="field span-2"><span>Edzői díj fizetési leírás</span><textarea id="fsCoachText" rows="3" ${disabled}>${esc(x.coachPaymentText||'')}</textarea></label><label class="field span-2"><span>Player információ</span><textarea id="fsPlayerInfo" rows="3" ${disabled}>${esc(x.playerInfo||'')}</textarea></label></div>${editable?'<div class="dialog-action-row"><button type="submit" class="button primary">Mentés</button></div>':''}</form></article>`}

  function financeAuditHtml_(){
    const rows=state.financeAudit||[];
    const keyLabels={status:'Státusz',payment_method:'Fizetési mód',paymentMethod:'Fizetési mód',amount_huf:'Összeg',amountHuf:'Összeg',paid_at:'Fizetés dátuma',paidAt:'Fizetés dátuma',paid_to:'Kinek fizette',paidTo:'Kinek fizette',production_status:'Gyártási állapot',payment_status:'Fizetési állapot',jersey_no:'Mezszám',jersey_size:'Mezméret',shorts_size:'Nadrágméret',price_huf:'Ár',ordered_at:'Megrendelve',issued_at:'Kiadva',pass_amount_huf:'Bérlet/tagdíj',coach_amount_huf:'Edzői díj',license_amount_huf:'Versenyengedély',pass_purchase_url:'Bérlet link',coach_payment_text:'Edzői fizetés',coach_payment_recipient:'Kedvezményezett',coach_payment_account:'Számla / Revolut',player_info:'Player infó'};
    const clean=v=>v==null||v===''?'–':typeof v==='boolean'?(v?'igen':'nem'):String(v);
    const changeSummary=(os,ns)=>{
      const keys=Array.from(new Set([...Object.keys(os||{}),...Object.keys(ns||{})])).filter(k=>!['id','created_at','updated_at','updated_by','managerEmail','player_id','player_email','fee_type','period_key','season','team_id'].includes(k)&&JSON.stringify(os?.[k])!==JSON.stringify(ns?.[k]));
      if(!keys.length)return'Módosítás rögzítve';
      return keys.slice(0,3).map(k=>`${keyLabels[k]||k}: ${clean(os?.[k])} → ${clean(ns?.[k])}`).join(' · ')+(keys.length>3?` · +${keys.length-3}`:'');
    };
    return `<article class="panel finance-audit-panel"><div class="panel-head"><div><h3>Pénzügyi napló</h3><p>Ki, mikor és mit módosított a pénzügyekben vagy a felszerelésnél.</p></div><button type="button" class="button quiet small" id="financeAuditRefresh">Frissítés</button></div><div class="finance-audit-list">${rows.map(a=>{const ns=a.newState||{},os=a.oldState||{},kind=text(a.entityType)==='team_equipment'?'Felszerelés':['finance_settings','finance_settings_team'].includes(text(a.entityType))?'Pénzügyi beállítás':(text(a.feeType)==='permission_fee'?'Versenyengedély':text(a.feeType)==='beac_pass'?'Bérlet / tagdíj':text(a.feeType)==='coach_fee'?'Edzői díj':text(a.feeType)||'Pénzügyi tétel'),subject=a.playerEmail||a.playerId||(text(a.entityType)==='finance_settings'?`Szezon ${a.season||a.entityId||''}`:text(a.entityType)==='finance_settings_team'?(teamById(text(a.entityId).split(':')[0])?.name||text(a.entityId).split(':')[0]):a.entityId)||'–';return `<div class="finance-audit-row"><div><b>${esc(subject)}</b><small>${esc(kind)} ${a.periodKey?`· ${esc(a.periodKey)}`:''} · ${esc(fmtDate(a.createdAt))} ${esc(fmtTime(a.createdAt))}</small></div><div><span>${esc(changeSummary(os,ns))}</span><small>${text(a.entityType)==='team_equipment'?`${esc(ns.production_status||'')} ${ns.price_huf?`· ${num(ns.price_huf).toLocaleString('hu-HU')} Ft`:''}`:['finance_settings','finance_settings_team'].includes(text(a.entityType))?(text(a.entityType)==='finance_settings_team'?'Csapatszintű Player díjbeállítás':'Klubszintű Player díjbeállítás'):`${esc(ns.payment_method||ns.paymentMethod||'')} ${ns.amount_huf||ns.amountHuf?`· ${num(ns.amount_huf||ns.amountHuf).toLocaleString('hu-HU')} Ft`:''}`}</small></div><div><b>${esc(a.actorEmail||'–')}</b><small>${esc(a.action||'update')}</small></div></div>`}).join('')||emptyInline('Még nincs pénzügyi vagy felszerelés-módosítás.')}</div></article>`
  }
  function openFinanceCellEditor_(playerId,type,period){
    if(!canAction('competition.fees','edit')){status('Ehhez a pénzügyi módosításhoz nincs szerkesztési jogosultságod.','error');return}
    const player=(state.financeData?.players||[]).find(p=>text(p.playerId)===text(playerId));if(!player)return;const fee=financeEffective_(playerId,type,period)||{},settings=financeSettingsForPlayer_(player),label=type==='permission_fee'?'Versenyengedély':type==='coach_fee'?'Edzői díj':'Bérlet / tagdíj',defaultAmount=type==='permission_fee'?settings.licenseAmountHuf:type==='coach_fee'?settings.coachAmountHuf:settings.passAmountHuf,d=$('#entityDialog'),body=$('#entityDialogBody'),title=$('#entityDialogTitle');if($('#entityDialogEyebrow'))$('#entityDialogEyebrow').textContent='PÉNZÜGYEK · FELÜLÍRÁS';title.textContent=`${player.displayName||player.name} · ${label}`;const paidDate=safeDate(fee.paidAt)?localDateKey(safeDate(fee.paidAt)):'';
    body.innerHTML=`<form id="financeCellForm" class="action-form"><div class="finance-source-note"><b>Alapadat:</b> ${fee.base?`${esc(fee.base.source||'canonical')} · ${esc(fee.base.status||'')}`:'nincs automatikus rekord'}${period?` · ${esc(period)}`:''}</div><label class="action-checkbox"><input id="ffOverride" type="checkbox" ${fee.manualLocked?'checked':''}><span>Kézi felülírás zárolása</span></label><div class="finance-lock-help">Ha nincs zárolva, egy későbbi BEAC importált befizetés felülírhatja a kézi állapotot.</div><div class="action-form-grid"><label class="field"><span>Állapot</span><select id="ffStatus"><option value="due">Nincs fizetve</option><option value="paid">Fizetve</option><option value="waived">Elengedve</option><option value="prior_paid">Korábban fizetve</option></select></label><label class="field"><span>Fizetési mód</span><select id="ffMethod"><option value="">–</option><option value="online">Online</option><option value="cash">Készpénz</option><option value="revolut">Revolut</option><option value="transfer">Átutalás</option><option value="other">Egyéb</option></select></label><label class="field"><span>Összeg (Ft)</span><input id="ffAmount" type="number" min="0" value="${esc(fee.amountHuf??defaultAmount??'')}"></label><label class="field"><span>Fizetés dátuma</span><input id="ffPaidAt" type="date" value="${esc(paidDate)}"></label><label class="field"><span>Kinek fizette</span><input id="ffPaidTo" value="${esc(fee.paidTo||'')}"></label><label class="field span-2"><span>Megjegyzés / indok</span><textarea id="ffNote" rows="3">${esc(fee.note||'')}</textarea></label></div><div class="dialog-action-row"><button type="button" class="button quiet" id="ffCancel">Mégse</button><button type="submit" class="button primary" id="ffSave">Mentés</button></div></form>`;$('#ffStatus').value=text(fee.status)||'due';$('#ffMethod').value=text(fee.paymentMethod)||'';ccOpenDialogStable_(d);$('#ffCancel')?.addEventListener('click',ccCloseEntityDialog_);$('#financeCellForm')?.addEventListener('submit',async e=>{e.preventDefault();const btn=$('#ffSave');if(btn)btn.disabled=true;const date=$('#ffPaidAt').value;try{await rpc('cc_manager_finance_override_set_v1',{p_player_id:playerId,p_fee_type:type,p_period_key:period,p_season:cfg.DEFAULT_SEASON,p_status:$('#ffStatus').value,p_payment_method:$('#ffMethod').value,p_amount_huf:$('#ffAmount').value?Number($('#ffAmount').value):null,p_paid_at:date?`${date}T12:00:00+02:00`:null,p_paid_to:text($('#ffPaidTo').value),p_note:text($('#ffNote').value),p_override_active:$('#ffOverride').checked});await loadFinanceData_(state.financeTeam||null);ccCloseEntityDialog_();renderFinance();status('Pénzügyi cella mentve és naplózva.','success')}catch(err){status(err.message||'A pénzügyi módosítás sikertelen.','error');if(btn)btn.disabled=false}})
  }
  function bindFinance_(){
    $$('[data-finance-tab]').forEach(b=>b.addEventListener('click',async()=>{state.financeTab=b.dataset.financeTab;if(state.financeTab==='audit'&&!state.financeAudit.length){try{await loadFinanceAudit_()}catch(err){status(err.message||'A napló nem tölthető be.','error')}}if(state.financeTab==='passes'&&!state.financePassCatalogLoaded){try{await loadFinancePassCatalog_()}catch(_){}}if(state.financeTab==='settings'){if(!state.financeSettingsTeam)state.financeSettingsTeam=text(state.teams.find(t=>t.active!==false)?.id||'');try{await loadFinanceSettings_(state.financeSettingsTeam)}catch(_){}}renderFinance()}));
    $('#financeTeamSelect')?.addEventListener('change',async e=>{state.financeTeam=text(e.target.value);state.financeData=null;renderFinance();try{await loadFinanceData_(state.financeTeam||null)}catch(err){status(err.message||'A pénzügyi adatok nem tölthetők be.','error')}renderFinance()});
    $$('[data-finance-player]').forEach(b=>b.addEventListener('click',()=>openFinanceCellEditor_(b.dataset.financePlayer,b.dataset.financeType,b.dataset.financePeriod)));
    $('#financeCompetitionFiltersToggle')?.addEventListener('click',()=>{state.financeCompetitionFiltersOpen=!state.financeCompetitionFiltersOpen;renderFinance()});
    $('#financePassFiltersToggle')?.addEventListener('click',()=>{state.financePassFiltersOpen=!state.financePassFiltersOpen;renderFinance()});
    $('#financeCompetitionSearch')?.addEventListener('input',e=>{state.financeCompetitionSearch=e.target.value;renderFinance()});
    $('#financeCompetitionMonth')?.addEventListener('change',e=>{state.financeCompetitionMonth=e.target.value;renderFinance()});
    $('#financeCompetitionStatus')?.addEventListener('change',e=>{state.financeCompetitionStatus=e.target.value;renderFinance()});
    $('#financeCompetitionType')?.addEventListener('change',e=>{state.financeCompetitionType=e.target.value;renderFinance()});
    $('#financeCompetitionReset')?.addEventListener('click',()=>{state.financeCompetitionSearch='';state.financeCompetitionMonth='';state.financeCompetitionStatus='';state.financeCompetitionType='';state.financeTeam='';state.financeData=null;void loadFinanceData_(null).then(renderFinance)});
    $('#financePassSearch')?.addEventListener('input',e=>{
      const field=e.target,pos=field.selectionStart,value=field.value;
      state.financePassSearch=value;
      renderFinance();
      const next=$('#financePassSearch');
      if(next){next.focus({preventScroll:true});try{if(pos!=null)next.setSelectionRange(pos,pos)}catch(_){}}
    });
    $('#financePassType')?.addEventListener('change',e=>{state.financePassType=e.target.value;renderFinance()});
    $('#financePassLevel')?.addEventListener('change',e=>{state.financePassLevel=e.target.value;renderFinance()});
    $('#financePassTeam')?.addEventListener('change',e=>{state.financePassTeam=e.target.value;renderFinance()});
    $('#financePassMonth')?.addEventListener('change',e=>{state.financePassMonth=e.target.value;renderFinance()});
    $('#financePassStatus')?.addEventListener('change',e=>{state.financePassStatus=e.target.value;renderFinance()});
    $('#financePassReset')?.addEventListener('click',()=>{state.financePassSearch='';state.financePassType='';state.financePassLevel='';state.financePassTeam='';state.financePassMonth='';state.financePassStatus='';renderFinance()});
    $('#financeSettingsTeam')?.addEventListener('change',async e=>{state.financeSettingsTeam=text(e.target.value);state.financeSettings=null;renderFinance();try{await loadFinanceSettings_(state.financeSettingsTeam)}catch(err){status(err.message||'A csapat pénzügyi beállításai nem tölthetők be.','error')}renderFinance()});
    $('#financeSettingsForm')?.addEventListener('submit',async e=>{e.preventDefault();if(!canAction('competition.fees','edit')){status('Ehhez nincs pénzügyi szerkesztési jogosultságod.','error');return}try{const payload={passAmountHuf:text($('#fsPassAmount').value),coachAmountHuf:text($('#fsCoachAmount').value),licenseAmountHuf:text($('#fsLicenseAmount').value),passPurchaseUrl:text($('#fsPassUrl').value),coachPaymentRecipient:text($('#fsCoachRecipient').value),coachPaymentAccount:text($('#fsCoachAccount').value),coachPaymentText:text($('#fsCoachText').value),playerInfo:text($('#fsPlayerInfo').value)};let r;try{r=await rpc('cc_manager_finance_settings_set_v2',{p_team_id:state.financeSettingsTeam||null,p_season:cfg.DEFAULT_SEASON,p_payload:payload})}catch(err){if(!/cc_manager_finance_settings_set_v2|does not exist|schema cache/i.test(text(err?.message||err)))throw err;r=await rpc('cc_manager_finance_settings_set_v1',{p_season:cfg.DEFAULT_SEASON,p_payload:payload})}state.financeSettings=r?.row||payload;status('Csapat pénzügyi beállításai mentve.','success');await loadFinanceData_(state.financeTeam||null).catch(()=>{});renderFinance()}catch(err){status(err.message||'A beállítások mentése sikertelen.','error')}});
    $('#financeAuditRefresh')?.addEventListener('click',async()=>{try{await loadFinanceAudit_();renderFinance();status('Napló frissítve.','success')}catch(err){status(err.message||'A napló nem tölthető be.','error')}})
  }
  function renderFinance(){if(!ccSectionIs_('finance'))return;
    if(!state.financeData&&!state.financeLoading){state.financeLoading=true;$('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Pénzügyek</h2><p>Versenycsapat-díjak, bérletek, beállítások és audit.</p></div></div>${financeTabsHtml_()}<article class="panel"><div class="loading-inline">Pénzügyi adatok betöltése…</div></article>`;bindFinance_();void loadFinanceData_(state.financeTeam||null).then(()=>renderFinance()).catch(err=>{state.financeLoading=false;state.financeData={error:text(err?.message||err),players:[],fees:[],meta:[]};renderFinance()});return}
    if(state.financeTab==='passes'&&!state.financePassCatalogLoaded){void loadFinancePassCatalog_().then(renderFinance);return}
    if(state.financeTab==='settings'&&!state.financeSettings){if(!state.financeSettingsTeam)state.financeSettingsTeam=text(state.teams.find(t=>t.active!==false)?.id||'');void loadFinanceSettings_(state.financeSettingsTeam).then(renderFinance).catch(()=>{state.financeSettings={};renderFinance()});return}
    let content='';if(state.financeTab==='passes')content=financePassAnalyticsHtml_();else if(state.financeTab==='settings')content=financeSettingsHtml_();else if(state.financeTab==='audit')content=financeAuditHtml_();else content=financeCompetitionHtml_();
    $('#viewContent').innerHTML=`<div class="page-intro finance-page-intro"><div><h2>Pénzügyek</h2><p>Versenyengedély, bérlet/tagdíj, edzői díj, értékesítés és teljes módosítási napló.</p></div></div><div class="finance-top-tabs">${financeTabsHtml_()}</div>${content}`;bindFinance_()
  }

  function renderSettings(){if(!ccSectionIs_('settings'))return;const canManage=canAction('settings','edit');$('#viewContent').innerHTML=`<div class="page-intro"><div><h2>Beállítások</h2><p>Megjelenés, Manager-fiókok és jogosultságok.</p></div><span class="read-only-badge ${canManage?'write-enabled':''}">${canManage?'ADMIN WRITE':'VIEW'}</span></div><div class="settings-layout"><article class="panel"><div class="setting-row"><div><strong>Megjelenés</strong><small>Világos / sötét téma ezen az eszközön.</small></div><button class="button quiet" id="themeToggle" type="button">Téma váltása</button></div><div class="setting-row"><div><strong>Manager build</strong><small>${esc(FRONTEND_BUILD)}</small></div><span class="status-pill ok">R1 UI1.9K</span></div><div class="setting-row"><div><strong>Rendszer és integrációk</strong><small>Adatkapcsolat: ${configured()?'aktív':'nincs konfigurálva'} · Player értesítések: közös backend infrastruktúra</small></div><span class="status-pill ${configured()?'ok':'warn'}">${configured()?'AKTÍV':'ELLENŐRIZD'}</span></div><div class="setting-row"><div><strong>Edzéstervezés</strong><small>A régi Manager szerkezete aktív; a részletes edzésterv-szerkesztő külön következő kör.</small></div><span class="status-pill">STRUKTÚRA KÉSZ</span></div></article>${canManage?`<article class="panel admin-panel"><div class="panel-head"><div><h3>Adminok és jogosultságok</h3><p>Manager hozzáférés e-mail alapján, modul- és csapatscope-pal.</p></div><button class="button primary small" id="adminAddBtn" type="button" ${state.adminsLoadError?'disabled':''}>+ Új admin</button></div><div class="admin-layout"><div>${adminListHtml()}</div><div>${adminEditorHtml()}</div></div></article>`:''}</div>`;$('#themeToggle')?.addEventListener('click',()=>{const dark=document.body.classList.toggle('dark');localStorage.setItem('cc-manager-theme',dark?'dark':'light')});if(canManage)bindAdminEditor()}

  function renderView(){renderModule();document.title=`${moduleMeta()?.[1]||'Manager'} – Club Control Manager`;ccScheduleTeamSelectorDecorate_();requestAnimationFrame(ccForceRootHorizontalZero_)}

  async function refresh(){if(!configured()){status('Manager PWA konfigurációs hiba.','error');return}try{await loadLiveData()}catch(_){}}
  function bindStaticUi(){
    ccInstallTeamSelectorDecorator_();
    $('#refreshBtn')?.addEventListener('click',refresh);$('#managerMenuBtn')?.addEventListener('click',()=>ccOpenDialogStable_($('#accountDialog')));$('#accountDialogClose')?.addEventListener('click',()=>$('#accountDialog')?.close());$('#accountDialog')?.addEventListener('click',e=>{if(e.target===$('#accountDialog'))$('#accountDialog').close()});
    $('#logoutBtn')?.addEventListener('click',async()=>{if(state.supabase)await state.supabase.auth.signOut({scope:'local'});location.reload()});
    $('#entityDialogClose')?.addEventListener('click',()=>$('#entityDialog')?.close());$('#entityDialog')?.addEventListener('click',e=>{if(e.target===$('#entityDialog'))$('#entityDialog').close()});$('#entityDialog')?.addEventListener('close',()=>{ensureTopStatus_();if(ccDialogContext_==='player'&&ccPlayerReturnEventId_){const back=ccPlayerReturnEventId_;ccPlayerReturnEventId_='';ccDialogContext_='';setTimeout(()=>openEventDetail(back),0)}else{ccDialogContext_=''}});
    $('#requestCodeBtn')?.addEventListener('click',requestCode);$('#verifyCodeBtn')?.addEventListener('click',verifyCode);$('#resendCodeBtn')?.addEventListener('click',resendCode);$('#changeEmailBtn')?.addEventListener('click',()=>{state.pendingEmail='';loginMessage('#loginMsg','');showLogin('loginEmailStep')});$('#loginEmail')?.addEventListener('keydown',e=>{if(e.key==='Enter')requestCode()});$('#loginCode')?.addEventListener('keydown',e=>{if(e.key==='Enter')verifyCode()});$('#loginCode')?.addEventListener('input',e=>{e.target.value=managerOtp_(e.target.value)});
    window.addEventListener('popstate',()=>{ccAdvanceRouteGeneration_();resolveInitialRoute();renderChrome();renderView()});
    window.addEventListener('pageshow',()=>requestAnimationFrame(ccForceRootHorizontalZero_));
    window.addEventListener('resize',()=>requestAnimationFrame(ccForceRootHorizontalZero_),{passive:true});
  }

  function installManagerPullToRefresh_(){
    if(document.querySelector('.cc-pull-refresh-indicator'))return;
    let startY=null,distance=0,running=false;
    const indicator=document.createElement('div');indicator.className='cc-pull-refresh-indicator';indicator.textContent='Frissítés…';document.body.appendChild(indicator);
    document.addEventListener('touchstart',event=>{const horizontal=event.target?.closest?.('.matrix-scroll,.ms-table-scroll,.finance-matrix-scroll,.legacy-primary-nav,.legacy-secondary-nav,.finance-tabs,.team-detail-tabs,.week-grid-wrap,.cc-calendar-scroll');const native=event.target?.closest?.('select,input,textarea,button,label,dialog');if(window.scrollY>1||running||horizontal||native||!event.touches?.length){startY=null;return}startY=event.touches[0].clientY;distance=0},{passive:true});
    document.addEventListener('touchmove',event=>{if(startY===null||!event.touches?.length)return;distance=Math.max(0,event.touches[0].clientY-startY);if(distance>70){indicator.textContent=distance>125?'Engedd el a frissítéshez':'Húzd lejjebb…';indicator.classList.add('show')}},{passive:true});
    document.addEventListener('touchend',async()=>{if(startY===null)return;const go=distance>125;startY=null;distance=0;if(!go){indicator.classList.remove('show');return}running=true;indicator.textContent='Frissítés…';indicator.classList.add('show');try{await refresh();indicator.textContent='Frissítve'}catch(_){indicator.textContent='Nem sikerült frissíteni'}finally{setTimeout(()=>{indicator.classList.remove('show');running=false},650)}},{passive:true});
  }

  async function boot(){
    if(localStorage.getItem('cc-manager-theme')==='dark')document.body.classList.add('dark');
    resolveInitialRoute();bindStaticUi();installManagerPullToRefresh_();

    const localTest=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
    if('serviceWorker'in navigator){
      if(localTest){
        try{
          const regs=await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(r=>r.unregister()));
          if('caches'in window){
            const keys=await caches.keys();
            await Promise.all(keys.filter(k=>/^cc-manager-/i.test(k)).map(k=>caches.delete(k)));
          }
        }catch(err){console.warn('Local Manager cache cleanup:',err)}
      }else{
        navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('SW:',err))
      }
    }

    if(!configured()){hideLogin();status('Manager PWA konfigurációs hiba: a Supabase kapcsolat nincs beállítva.','error');renderChrome();renderView();return}
    try{
      state.supabase=await createSupabase();
      showLogin('loginLoadingStep');
      const {data:{session},error}=await state.supabase.auth.getSession();
      if(error)throw error;
      state.session=session||null;
      if(!session){showLogin('loginEmailStep');return}
      await loadLiveData();
      hideLogin();
      if(!location.hash)setRoute(state.area,legacyDefaultModule_(state.area),{replace:true})
    }catch(err){
      console.error(err);
      status(err.message||'Manager indítási hiba.','error');
      showLogin('loginEmailStep')
    }
  }

  boot();

  document.addEventListener('click',event=>{
    const control=event.target.closest?.('.matrix-filter-toggle,.filter-toggle');
    if(control)ccBlurPointerControl_(control);
  });
})();
