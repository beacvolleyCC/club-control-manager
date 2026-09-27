
const DEMO_NOW = new Date('2026-09-05T12:00:00');

let events = [
  {id:'ev-2026-08-30',archived:true,date:'2026.08.30.',day:'Vasárnap',time:'18:00–20:00',type:'Edzés',title:'Edzés',place:'Bogdánfy • 1. pálya',month:'Aug',status:'yes',yes:['Anna','Dóri','Petra','Luca','Fanni','Réka','Nóri','Eszter','Juli','Kata','Lili','Sára','Te'],no:['Viki'],unknown:['Emma','Zsófi'],positions:{'Feladó':2,'Átló':2,'Négyes':4,'Center':3,'Liberó':2}},
  {id:'ev-2026-09-01',archived:true,date:'2026.09.01.',day:'Kedd',time:'20:00–22:00',type:'Edzés',title:'Edzés',place:'Bogdánfy • 2. pálya',month:'Szept',status:null,yes:['Anna','Petra','Luca','Réka','Juli','Kata','Sára','Nóri','Eszter'],no:['Dóri','Viki'],unknown:['Te','Fanni','Lili','Emma','Zsófi'],positions:{'Feladó':2,'Átló':1,'Négyes':3,'Center':2,'Liberó':1}},
  {id:'ev-2026-09-04',archived:true,date:'2026.09.04.',day:'Péntek',time:'19:30',type:'Meccs',matchKind:'home',title:'BEAC – Corvinus',place:'Bogdánfy Sportcsarnok',meeting:'18:45 • Bogdánfy főbejárat',month:'Szept',status:'yes',yes:['Anna','Dóri','Petra','Luca','Fanni','Réka','Nóri','Eszter','Juli','Kata','Lili','Sára','Te'],no:[],unknown:['Emma','Zsófi'],positions:{'Feladó':2,'Átló':2,'Négyes':4,'Center':3,'Liberó':2}},
  {id:'ev-2026-09-08',date:'2026.09.08.',day:'Kedd',time:'20:00–22:00',type:'Edzés',title:'Edzés',place:'Bogdánfy • 2. pálya',month:'Szept',status:null,yes:['Anna','Petra','Luca','Fanni','Réka','Juli','Kata','Lili','Sára','Nóri'],no:['Dóri'],unknown:['Te','Eszter','Emma','Zsófi','Viki'],positions:{'Feladó':1,'Átló':2,'Négyes':3,'Center':2,'Liberó':2}},
  {id:'ev-2026-09-10',date:'2026.09.10.',day:'Csütörtök',time:'18:00–20:00',type:'Edzés',title:'Edzés',place:'Bogdánfy • 1. pálya',month:'Szept',status:null,yes:['Anna','Petra','Luca'],no:['Dóri'],unknown:['Te','Fanni','Réka','Nóri','Eszter','Juli','Kata','Lili','Sára','Emma','Zsófi','Viki'],positions:{'Feladó':1,'Átló':1,'Négyes':1,'Center':0,'Liberó':0}},
  {id:'ev-2026-10-02',date:'2026.10.02.',day:'Csütörtök',time:'18:00–20:00',type:'Edzés',title:'Edzés',place:'Bogdánfy • 2. pálya',month:'Okt',status:null,yes:['Anna','Dóri'],no:[],unknown:['Te','Petra','Luca','Fanni','Réka','Nóri','Eszter','Juli','Kata','Lili','Sára','Emma','Zsófi','Viki'],positions:{'Feladó':1,'Átló':0,'Négyes':1,'Center':0,'Liberó':0}},
  {id:'ev-2026-10-14',date:'2026.10.14.',day:'Kedd',time:'19:30',type:'Meccs',matchKind:'away',title:'TFSE – BEAC',place:'Dr. Koltai Jenő Sportközpont',address:'1123 Budapest, Alkotás u. 44.',meeting:'18:15 • helyszíni bejárat',month:'Okt',status:null,yes:['Anna','Dóri','Petra','Luca','Fanni','Réka','Nóri'],no:['Viki'],unknown:['Te','Eszter','Juli','Kata','Lili','Sára','Emma','Zsófi'],positions:{'Feladó':2,'Átló':1,'Négyes':2,'Center':1,'Liberó':1}},
  {id:'ev-2026-11-04',date:'2026.11.04.',day:'Kedd',time:'19:30',type:'Meccs',matchKind:'home',title:'BEAC – Budai IX. C',place:'Bogdánfy Sportcsarnok',meeting:'18:45 • Bogdánfy főbejárat',month:'Nov',status:null,yes:['Anna','Dóri','Petra'],no:[],unknown:['Te','Luca','Fanni','Réka','Nóri','Eszter','Juli','Kata','Lili','Sára','Emma','Zsófi','Viki'],positions:{'Feladó':1,'Átló':1,'Négyes':1,'Center':0,'Liberó':0}},
  {id:'ev-2026-11-18',date:'2026.11.18.',day:'Kedd',time:'19:30',type:'Meccs',matchKind:'home',title:'BEAC – Corvinus',place:'Bogdánfy Sportcsarnok',meeting:'18:45 • Bogdánfy főbejárat',month:'Nov',status:null,yes:['Anna','Dóri'],no:[],unknown:['Te','Petra','Luca','Fanni','Réka','Nóri','Eszter','Juli','Kata','Lili','Sára','Emma','Zsófi','Viki'],positions:{'Feladó':1,'Átló':1,'Négyes':0,'Center':0,'Liberó':0}},
  {id:'ev-2026-12-03',date:'2026.12.03.',day:'Csütörtök',time:'18:00–20:00',type:'Edzés',title:'Edzés',place:'Bogdánfy • 2. pálya',month:'Dec',status:null,yes:['Anna'],no:[],unknown:['Te','Dóri','Petra','Luca','Fanni','Réka','Nóri','Eszter','Juli','Kata','Lili','Sára','Emma','Zsófi','Viki'],positions:{'Feladó':1,'Átló':0,'Négyes':0,'Center':0,'Liberó':0}},
];

const saved = JSON.parse(localStorage.getItem('cc-demo-state-v2')||'{}');
events.forEach(e => {
  if (saved[e.id] !== undefined) {
    e.status = saved[e.id].status ?? null;
    e.note = saved[e.id].note || '';
  }
});

const eventList = document.getElementById('eventList');
const plannerList = document.getElementById('plannerList');
const cancelDialog = document.getElementById('cancelDialog');
let pendingCancel = null;
let missingOnly = false;
let detailedMode = false; // V2.3.10.19: contextual event detail is always used; legacy flag kept DB-compatible.
let currentPlayerName = 'Te';
let currentPlayerDisplayName = 'Te';
let currentPlayerData = null;
let teamPlayerDirectory = [];
let currentAvatarId = '';
let teamAvatarByPlayerId = new Map();
let avatarPickerMode = 'monogram';

const PLAYER_AVATARS = [
  // First 40 IDs stay untouched for backwards compatibility with saved profiles.
  ['alpaca','',0],['lion','',1],['tiger','',2],['panther','',3],
  ['lynx','',4],['cat','',5],['husky','',6],['wolf','',7],
  ['fox','',8],['rabbit','',9],['bear','',10],['deer','',11],
  ['panda','',12],['gorilla','',13],['monkey','',14],['elephant','',15],
  ['rhino','',16],['hippo','',17],['giraffe','',18],['buffalo','',19],
  ['mammoth','',20],['donkey','',21],['goat','',22],['raccoon','',23],
  ['dog','',24],['otter','',25],['cow','',26],['ram','',27],
  ['hedgehog','',28],['horse','',29],['zebra','',30],['turtle','',31],
  ['penguin','',32],['owl','',33],['eagle','',34],['dolphin','',35],
  ['crocodile','',36],['frog','',37],['shark','',38],['moose','',39],
  // V2.3.7 additions. IDs are prefixed so old semantic IDs remain stable.
  ['extra_zebra','',40],['extra_horse','',41],['extra_deer','',42],['extra_kangaroo','',43],
  ['extra_rabbit','',44],['extra_eagle','',45],['extra_turtle','',46],['extra_dolphin','',47],
  ['extra_boar','',48],['extra_ram','',49],['extra_frog','',50],['extra_parrot','',51]
].map(([id,label,spriteIndex])=>({id,label,spriteIndex}));

const PLAYER_AVATAR_IDS = new Set(PLAYER_AVATARS.map(x=>x.id));

let currentProfileData = {
  attendance: [],
  payments: [],
  loaded: false
};

let currentTeamData = null;

const HOME_FILTER_KEY='cc-home-filters-v2';
let homeFilters={period:'next14',type:'all',status:'all',from:'',to:''};
try{ homeFilters={...homeFilters,...JSON.parse(localStorage.getItem(HOME_FILTER_KEY)||'{}')}; }catch(_){}

function ccConfig_(){
  return window.CLUB_CONTROL_CONFIG || {};
}
function ccSupabaseConfigured_(){
  const c=ccConfig_();
  return String(c.DATA_BACKEND||'').toLowerCase()==='supabase' &&
    !!String(c.SUPABASE_URL||'').trim() &&
    !!String(c.SUPABASE_PUBLISHABLE_KEY||'').trim();
}
function ccLegacyConfigured_(){
  return !ccSupabaseConfigured_() && !!String(ccConfig_().API_URL||'').trim();
}
function ccRemoteConfigured_(){
  return ccSupabaseConfigured_() || ccLegacyConfigured_();
}


function playerPositionLabel_(value){
  const raw=String(value||'').trim();
  const normalized=raw.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if(['negyes','4-es uto','4es uto','szelso','szelso uto','outside','outside hitter'].includes(normalized)) return 'Szélső ütő';
  return raw;
}

function avatarDef_(id){
  return PLAYER_AVATARS.find(x=>x.id===String(id||'')) || null;
}

function avatarMarkup_(avatarId,className='player-avatar-icon'){
  const def=avatarDef_(avatarId);
  if(!def) return '';
  const col=def.spriteIndex%8;
  const row=Math.floor(def.spriteIndex/8);
  const x=(col*100/7).toFixed(6);
  const y=(row*100/6).toFixed(6);
  return `<span class="avatar-sprite ${className}" role="img" aria-label="Avatar" style="background-position:${x}% ${y}%"></span>`;
}

function playerAvatarIdByName_(name){
  const raw=String(name||'').trim();
  if(!raw) return '';
  if(raw==='Te' || raw===currentPlayerName) return currentAvatarId || currentPlayerData?.avatarId || '';
  const person=(teamPlayerDirectory||[]).find(p=>String(p?.name||'').trim()===raw);
  return String(person?.avatarId||'');
}

function playerPositionForName_(name){
  const raw=String(name||'').trim();
  if(!raw) return '';
  if(raw==='Te' || raw===currentPlayerName) return playerPositionLabel_(currentPlayerData?.position||'');
  const person=(teamPlayerDirectory||[]).find(p=>String(p?.name||'').trim()===raw);
  return playerPositionLabel_(person?.position||'');
}

function playerPositionClass_(position){
  const normalized=String(position||'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if(['felado','setter'].includes(normalized)) return 'position-setter';
  if(['atlo','opposite','opposite hitter'].includes(normalized)) return 'position-opposite';
  if(['szelso uto','negyes','4-es uto','4es uto','outside','outside hitter'].includes(normalized)) return 'position-outside';
  if(['center','middle','middle blocker','kozepso','kozepso tamado'].includes(normalized)) return 'position-middle';
  if(['libero'].includes(normalized)) return 'position-libero';
  return '';
}

function rosterChipHtml_(name,extraClass=''){
  const avatarId=playerAvatarIdByName_(name);
  const avatar=avatarId ? `<span class="roster-avatar">${avatarMarkup_(avatarId,'roster-avatar-svg')}</span>` : '';
  const positionClass=String(extraClass||'').split(/\s+/).includes('yes')
    ? playerPositionClass_(playerPositionForName_(name))
    : '';
  const classes=['chip',extraClass,positionClass].filter(Boolean).join(' ');
  return `<span class="${classes}">${avatar}<span>${escapeHtml_(rosterDisplayName_(name))}</span></span>`;
}

function renderCurrentAvatar_(){
  const target=document.getElementById('profileInitials');
  const preview=document.getElementById('settingsAvatarPreview');
  const initials=(currentPlayerDisplayName||'JT').split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase();
  const html=currentAvatarId ? avatarMarkup_(currentAvatarId,'profile-avatar-svg') : escapeHtml_(initials);
  [target,preview].forEach(el=>{
    if(!el) return;
    el.classList.toggle('has-animal-avatar',!!currentAvatarId);
    el.innerHTML=html;
  });
}

function syncAvatarModeUi_(){
  const panel=document.getElementById('avatarPickerPanel');
  const mono=document.getElementById('avatarModeMonogramBtn');
  const avatar=document.getElementById('avatarModeAvatarBtn');
  const isAvatar=avatarPickerMode==='avatar';
  if(panel) panel.hidden=!isAvatar;
  [mono,avatar].forEach(btn=>{
    if(!btn) return;
    const active=(btn.dataset.avatarMode==='avatar')===isAvatar;
    btn.classList.toggle('active',active);
    btn.setAttribute('aria-pressed',active?'true':'false');
  });
}

function renderAvatarPicker_(){
  const grid=document.getElementById('avatarPickerGrid');
  if(!grid) return;
  grid.innerHTML=PLAYER_AVATARS.map((item,index)=>`
    <button type="button" class="avatar-option ${item.id===currentAvatarId?'selected':''}" data-avatar-id="${item.id}" role="option" aria-selected="${item.id===currentAvatarId?'true':'false'}" aria-label="Avatar ${index+1}">
      ${avatarMarkup_(item.id,'avatar-option-svg')}
    </button>
  `).join('');
  renderCurrentAvatar_();
  syncAvatarModeUi_();
}

async function ccLoadAvatarDirectory_(){
  if(!SUPABASE_ENABLED || !ccSupabase) return;
  try{
    const {data,error}=await ccSupabase.rpc('cc_player_avatar_directory');
    if(error) throw error;
    const rows=typeof data==='string' ? JSON.parse(data) : (Array.isArray(data)?data:[]);
    teamAvatarByPlayerId=new Map(
      rows.map(row=>[String(row?.playerId||''),String(row?.avatarId||'')])
    );
    if(currentPlayerData?.playerId){
      currentAvatarId=teamAvatarByPlayerId.get(String(currentPlayerData.playerId)) || '';
      avatarPickerMode=currentAvatarId ? 'avatar' : 'monogram';
      currentPlayerData.avatarId=currentAvatarId;
    }
    teamPlayerDirectory=(teamPlayerDirectory||[]).map(player=>({
      ...player,
      avatarId:teamAvatarByPlayerId.get(String(player?.playerId||player?.id||'')) || ''
    }));
    renderCurrentAvatar_();
    renderAvatarPicker_();
    renderEvents();
    renderPlanner();
  }catch(error){
    console.warn('Avatar könyvtár nem érhető el:',error);
  }
}


function persist(event, status, note='') {
  event.status = status;
  event.note = note;
  const aliases=new Set(['Te',currentPlayerName].filter(Boolean));
  event.yes=(event.yes||[]).filter(n=>!aliases.has(n));
  event.no=(event.no||[]).filter(n=>!aliases.has(n));
  event.unknown=(event.unknown||[]).filter(n=>!aliases.has(n));
  const label=currentPlayerName && currentPlayerName!=='Te' ? currentPlayerName : 'Te';
  if(status==='yes') event.yes.push(label);
  else if(status==='no') event.no.push(label);
  else event.unknown.push(label);
  saved[event.id] = {status, note, at:new Date().toISOString()};
  localStorage.setItem('cc-demo-state-v2', JSON.stringify(saved));
}


function eventStart(e){
  const parts=e.date.replace(/\.$/,'').split('.').filter(Boolean).map(Number);
  const [y,m,d]=parts;
  const times=[...String(e.time||'').matchAll(/(\d{1,2}):(\d{2})/g)];
  const start=times[0];
  const hh=Number(start?.[1]||23), mm=Number(start?.[2]||59);
  return new Date(y,m-1,d,hh,mm,0);
}

function eventEnd(e){
  const parts=e.date.replace(/\.$/,'').split('.').filter(Boolean).map(Number);
  const [y,m,d]=parts;
  const times=[...String(e.time||'').matchAll(/(\d{1,2}):(\d{2})/g)];

  const start=times[0];
  const end=times[1] || start;

  const startHour=Number(start?.[1]||23);
  const startMinute=Number(start?.[2]||59);
  const endHour=Number(end?.[1] ?? startHour);
  const endMinute=Number(end?.[2] ?? startMinute);

  const startDate=new Date(y,m-1,d,startHour,startMinute,0);
  const endDate=new Date(y,m-1,d,endHour,endMinute,0);

  // Handles the rare case of an event that ends after midnight.
  if(endDate < startDate) endDate.setDate(endDate.getDate()+1);

  return endDate;
}

function isPast(e){
  const liveApi = ccRemoteConfigured_();
  const now = liveApi ? new Date() : DEMO_NOW;

  // An ongoing event is NOT past. It becomes past only after its scheduled end.
  return e.archived===true || eventEnd(e) <= now;
}

function cardClass(e){
  if(e.status==='yes') return 'status-yes';
  if(e.status==='no') return 'status-no';
  return 'status-none';
}

function attendanceCountClass(n){
  if(n >= 10) return 'count-good';
  if(n >= 6) return 'count-warn';
  return 'count-low';
}
function typeIconClass(e){
  if(e.type==='Edzés') return 'training';
  if(e.matchKind==='home') return 'home';
  return 'away';
}
function typeIcon(e){
  const cls=typeIconClass(e);
  return `<span class="event-symbol-mask ${cls}" aria-hidden="true"></span>`;
}
function typeLabel(e){
  if(e.type==='Edzés') return 'EDZÉS';
  return e.matchKind==='home' ? 'HAZAI MECCS' : 'IDEGENBELI MECCS';
}
function mapLink(e,label='Útvonaltervezés ↗',extraClass=''){
  if(e.matchKind!=='away' || !e.address) return '';
  const destination=encodeURIComponent(String(e.address).trim());
  const cls=['map-link','map-nav-link',extraClass].filter(Boolean).join(' ');
  return `<a class="${cls}" href="https://www.google.com/maps/dir/?api=1&destination=${destination}" target="_blank" rel="noopener noreferrer" aria-label="Útvonaltervezés ehhez a címhez a Google Mapsben">${label}</a>`;
}
function inferredHomeMatchCourt_(e){
  if(e?.type!=='Meccs' || e?.matchKind!=='home') return '';
  const teamName=String(currentTeamData?.teamName||currentTeamData?.name||'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const start=eventStart(e);
  const weekday=(start instanceof Date && !Number.isNaN(start.getTime())) ? start.getDay() : null;

  // 2026/27 BEAC home-match slots supplied by club operations.
  // Monday: BEAC Férfi — court 3
  // Tuesday: BEAC Női II. — court 2
  // Friday: BEAC Női I. — court 3
  if(teamName.includes('ferfi') && weekday===1) return '3. pálya';
  if(teamName.includes('noi ii') && weekday===2) return '2. pálya';
  if((teamName.includes('noi i') || teamName.includes('noi 1')) && !teamName.includes('noi ii') && weekday===5) return '3. pálya';
  return '';
}
function compactCourtLabel_(e){
  const normalize=value=>{
    const raw=String(value||'').trim();
    if(!raw) return '';
    if(/^\d+$/.test(raw)) return `${raw}. pálya`;
    const m=raw.match(/(\d+)\.?\s*pálya/i);
    if(m) return `${m[1]}. pálya`;
    return raw;
  };
  const direct=normalize(e.court);
  if(direct) return direct;
  const place=String(e.place||'').trim();
  const m=place.match(/(?:^|[•,–—-]\s*)(\d+\.?\s*pálya)\s*$/i);
  if(m) return normalize(m[1]);
  const loose=place.match(/(\d+\.?\s*pálya)/i);
  if(loose) return normalize(loose[1]);
  const inferred=normalize(inferredHomeMatchCourt_(e));
  if(inferred) return inferred;
  return '–';
}
function compactCourtMeta_(e){
  const court=compactCourtLabel_(e);
  return court==='–' ? 'Pálya –' : court;
}
function eventCard(e){
  const archived=isPast(e);
  const court=compactCourtMeta_(e);
  const isAway=e.matchKind==='away';
  const matchTitle=e.type==='Meccs' ? `<div class="event-match-title">${e.title}</div>` : '';
  const compactMeta=isAway
    ? [e.date,e.day,e.time].filter(Boolean).join(' • ')
    : [e.date,e.day,e.time,court].filter(Boolean).join(' • ');
  const awayLine=isAway && e.address
    ? `<div class="away-location event-away-compact"><span class="away-address">${e.address}</span><span class="away-card-actions">${mapLink(e,'Google Maps ↗','map-card-link')}<strong class="${attendanceCountClass(e.yes.length)}">${e.yes.length} fő</strong></span></div>`
    : '';
  const autoAbsence = archived && e.status===null
    ? `<div class="auto-absence">Automatikus hiányzás a lezáráskor</div>` : '';

  return `<article class="event-card ${cardClass(e)} ${archived?'archived-card':''}">
    <div class="event-collapsed">
      <div class="event-top centered-card event-open-zone ${isAway?'event-top-away':''}" data-open-event="${e.id}" aria-label="${typeLabel(e)} részleteinek megnyitása">
        <div class="event-icon bare-icon">${typeIcon(e)}</div>
        <div class="event-main">
          <div class="event-type">${typeLabel(e)}</div>
          ${matchTitle}
          <div class="event-meta event-meta-compact">${compactMeta}</div>
          ${awayLine}
          ${autoAbsence}
        </div>
        ${isAway?'':`<div class="head-count"><strong class="${attendanceCountClass(e.yes.length)}">${e.yes.length} fő</strong></div>`}
      </div>

      <div class="slider-wrap">
        <div class="attendance-slider ${e.status||'none'}" data-slider="${e.id}">
          <button class="slider-zone left" data-slider-action="yes" data-id="${e.id}" ${archived?'disabled':''}>Jövök</button>
          <button class="slider-zone center" data-slider-action="none" data-id="${e.id}" ${archived?'disabled':''}>Nincs jelzés</button>
          <button class="slider-zone right" data-slider-action="no" data-id="${e.id}" ${archived?'disabled':''}>Nem jövök</button>
          <span class="slider-thumb"></span>
        </div>
      </div>
    </div>

    <button class="roster-toggle" data-roster="${e.id}">Névsor</button>
    <div class="roster" id="roster-${e.id}">
      <div class="roster-group"><b>Jönnek (${e.yes.length})</b><div class="chips">${e.yes.map(n=>rosterChipHtml_(n,'yes')).join('')}</div></div>
      <div class="roster-group"><b>Nem jönnek (${e.no.length})</b><div class="chips">${e.no.map(n=>rosterChipHtml_(n,'no')).join('')||'<span class="muted">–</span>'}</div></div>
      <div class="roster-group"><b>Még nem jelzett (${e.unknown.length})</b><div class="chips">${e.unknown.map(n=>rosterChipHtml_(n)).join('')}</div></div>
    </div>
  </article>`;
}

function ccNow_(){ return ccRemoteConfigured_() ? new Date() : new Date(DEMO_NOW); }
function dateOnly_(value){ const d=new Date(value.getFullYear(),value.getMonth(),value.getDate()); d.setHours(0,0,0,0); return d; }
function parseHuDate_(text){
  const value=String(text||'').trim();
  const m=value.match(/^(\d{4})[.-](\d{1,2})[.-](\d{1,2})\.?$/);
  if(!m) return null;
  const d=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}
function dateInputValue_(text){
  const d=parseHuDate_(text);
  if(!d) return '';
  return [
    d.getFullYear(),
    String(d.getMonth()+1).padStart(2,'0'),
    String(d.getDate()).padStart(2,'0')
  ].join('-');
}
function monthDividerLabel_(e){ return eventDateObj(e).toLocaleDateString('hu-HU',{year:'numeric',month:'long'}); }
function monthDividerHtml_(e){ return `<div class="month-divider" aria-hidden="true"><span>${monthDividerLabel_(e)}</span></div>`; }
function renderEventCardsWithMonths_(rows){
  let lastMonth='';
  let firstVisibleMonth=true;

  return rows.map(e=>{
    const key=monthKeyFromDate(eventDateObj(e));
    const monthChanged=key!==lastMonth;
    const divider=
      monthChanged && !firstVisibleMonth
        ? monthDividerHtml_(e)
        : '';

    if(monthChanged){
      lastMonth=key;
      firstVisibleMonth=false;
    }

    return divider+eventCard(e);
  }).join('');
}
function homeFilterIsDefault_(){ return homeFilters.period==='next14' && homeFilters.type==='all' && homeFilters.status==='all' && !homeFilters.from && !homeFilters.to; }
function filteredHomeEvents(){
  const now=dateOnly_(ccNow_());
  const to14=new Date(now.getTime()+14*86400000);
  const to30=new Date(now.getTime()+30*86400000);
  const customFrom=parseHuDate_(homeFilters.from);
  const customTo=parseHuDate_(homeFilters.to);

  return [...events].sort((a,b)=>eventStart(a)-eventStart(b)).filter(e=>{
    const d=dateOnly_(eventDateObj(e));
    if(homeFilters.period==='next14' && (d<now || d>to14)) return false;
    if(homeFilters.period==='next30' && (d<now || d>to30)) return false;
    if(homeFilters.period==='future' && d<now) return false;
    if(homeFilters.period==='past' && !isPast(e)) return false;
    if(homeFilters.period==='custom'){
      if(customFrom && d<customFrom) return false;
      if(customTo && d>customTo) return false;
    }
    if(homeFilters.type!=='all' && e.type!==homeFilters.type) return false;
    if(homeFilters.status==='missing' && e.status!==null) return false;
    if(homeFilters.status==='yes' && e.status!=='yes') return false;
    if(homeFilters.status==='no' && e.status!=='no') return false;
    return true;
  });
}
function updateHomeFilterUi_(){
  const values={
    eventPeriodFilter:homeFilters.period,
    eventTypeFilter:homeFilters.type,
    eventStatusFilter:homeFilters.status,
    eventDateFrom:dateInputValue_(homeFilters.from),
    eventDateTo:dateInputValue_(homeFilters.to)
  };
  Object.entries(values).forEach(([id,value])=>{ const el=document.getElementById(id); if(el) el.value=value; });
  const custom=document.getElementById('eventCustomRange');
  if(custom) custom.hidden=homeFilters.period!=='custom';
  const isDefault=homeFilterIsDefault_();
  const filterBtn=document.getElementById('eventFilterBtn');
  if(filterBtn) filterBtn.classList.toggle('has-active-filter',!isDefault);
  const resetBtn=document.getElementById('resetEventFiltersBtn');
  if(resetBtn) resetBtn.hidden=isDefault;
  const summary=document.getElementById('homeFilterSummary');
  if(summary){
    const labels={next14:'Következő 14 nap.',next30:'Következő 30 nap.',future:'Minden következő alkalom.',past:'Elmúlt alkalmak.',all:'Teljes szezon.',custom:'Egyéni időszak.'};
    summary.textContent=labels[homeFilters.period]||'Szűrt események.';
  }
}
function profileAttendanceRows_(){
  const byEventId=new Map(events.map(e=>[String(e.id),e]));
  return (Array.isArray(currentProfileData.attendance) ? currentProfileData.attendance : [])
    .map(row=>{
      const event=byEventId.get(String(row?.eventId||''));
      const status=String(row?.attendanceStatus||'').toLowerCase();
      return {row,event,status};
    })
    .filter(item=>
      item.event &&
      !item.event.cancelled &&
      isPast(item.event) &&
      (item.status==='present' || item.status==='absent')
    );
}

function profileRatio_(rows){
  const total=rows.length;
  const present=rows.filter(item=>item.status==='present').length;
  return {
    present,
    total,
    pct:total ? Math.round((present/total)*100) : null
  };
}

function profileMonthName_(monthKey,short=false){
  const m=String(monthKey||'').match(/^(\d{4})-(\d{2})$/);
  if(!m) return String(monthKey||'');
  const names=[
    'január','február','március','április','május','június',
    'július','augusztus','szeptember','október','november','december'
  ];
  const shortNames=[
    'jan.','febr.','márc.','ápr.','máj.','jún.',
    'júl.','aug.','szept.','okt.','nov.','dec.'
  ];
  const idx=Math.max(0,Math.min(11,Number(m[2])-1));
  return short ? shortNames[idx] : names[idx];
}

function profileBudapestMonthKey_(){
  const parts=new Intl.DateTimeFormat('en',{
    timeZone:'Europe/Budapest',
    year:'numeric',
    month:'2-digit'
  }).formatToParts(new Date());
  const year=parts.find(p=>p.type==='year')?.value || String(new Date().getFullYear());
  const month=parts.find(p=>p.type==='month')?.value || String(new Date().getMonth()+1).padStart(2,'0');
  return `${year}-${month}`;
}

function profileEventStamp_(item){
  const event=item?.event||{};
  return `${event.date||''}T${event.start||event.time||'00:00'}`;
}

function renderProfileStats_(){
  const grid=document.getElementById('profileStatsGrid');
  const empty=document.getElementById('profileStatsEmpty');
  const more=document.getElementById('profileStatsMore');
  const monthly=document.getElementById('profileStatsMonthly');

  const rows=profileAttendanceRows_();

  if(!rows.length){
    if(grid) grid.hidden=true;
    if(more) more.hidden=true;
    if(empty){
      empty.hidden=false;
      empty.innerHTML='<b>Még nincs lezárt jelenléti adat.</b>';
    }
    return;
  }

  const trainingRows=rows.filter(item=>item.event.type!=='Meccs');
  const matchRows=rows.filter(item=>item.event.type==='Meccs');
  const all=profileRatio_(rows);
  const trainings=profileRatio_(trainingRows);
  const matches=profileRatio_(matchRows);

  const set=(id,value)=>{
    const el=document.getElementById(id);
    if(el) el.textContent=value;
  };

  const ratioText=x=>`${x.present} / ${x.total}`;
  const pctText=x=>x.pct===null ? '–' : `${x.pct}%`;

  set('profileStatTrainingRatio',ratioText(trainings));
  set('profileStatTrainingPct',pctText(trainings));
  set('profileStatMatchRatio',ratioText(matches));
  set('profileStatMatchPct',pctText(matches));
  set('profileStatAllRatio',ratioText(all));
  set('profileStatAllPct',pctText(all));

  const monthMap=new Map();
  rows.forEach(item=>{
    const key=String(item.event?.date||'').slice(0,7);
    if(!/^\d{4}-\d{2}$/.test(key)) return;
    if(!monthMap.has(key)) monthMap.set(key,[]);
    monthMap.get(key).push(item);
  });

  if(monthly){
    monthly.innerHTML=[...monthMap.entries()]
      .sort((a,b)=>a[0].localeCompare(b[0]))
      .map(([key,monthRows])=>{
        const ratio=profileRatio_(monthRows);
        return `<div class="profile-stats-month-row detail-row">
          <span>${escapeHtml_(profileMonthName_(key,false))}</span>
          <b>${ratio.present} / ${ratio.total}${ratio.pct===null?'':' · '+ratio.pct+'%'}</b>
        </div>`;
      })
      .join('');
  }

  if(grid) grid.hidden=false;
  if(more) more.hidden=false;
  if(empty) empty.hidden=true;
}

function profileFeeTypeLabel_(type){
  const map={
    beac_pass:'BEAC bérlet',
    coach_fee:'Edzői díj',
    permission_fee:'Engedélyek',
    team_fee:'Csapatdíj',
    other:'Egyéb díj'
  };
  return map[String(type||'')] || 'Díj';
}

function profileFeeStatusLabel_(status){
  const map={due:'Nincs befizetve',paid:'Befizetve',waived:'Elengedve'};
  return map[String(status||'')] || String(status||'');
}

function profileMoney_(amount){
  const n=Number(amount);
  if(!Number.isFinite(n)) return '';
  return new Intl.NumberFormat('hu-HU',{maximumFractionDigits:0}).format(n)+' Ft';
}

function profileHuDate_(value){
  const m=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}.${m[2]}.${m[3]}.` : String(value||'');
}

function profileNormalizePeriodKey_(fee){
  const raw=String(fee?.periodKey||'').trim().toLowerCase();

  if(/^\d{4}-\d{2}$/.test(raw)) return raw;

  const dot=raw.match(/^(\d{4})[.\-/](\d{1,2})$/);
  if(dot) return `${dot[1]}-${String(dot[2]).padStart(2,'0')}`;

  const season=String(fee?.season||currentTeamData?.season||'').trim();
  const seasonMatch=season.match(/^(\d{4})\D+(\d{2,4})$/);
  const seasonStart=seasonMatch ? Number(seasonMatch[1]) : null;

  const monthNames={
    januar:1,'január':1,jan:1,
    februar:2,'február':2,febr:2,
    marcius:3,'március':3,marc:3,'márc':3,
    aprilis:4,'április':4,apr:4,'ápr':4,
    majus:5,'május':5,maj:5,'máj':5,
    junius:6,'június':6,jun:6,'jún':6,
    julius:7,'július':7,jul:7,'júl':7,
    augusztus:8,aug:8,
    szeptember:9,szept:9,szep:9,
    oktober:10,'október':10,okt:10,
    november:11,nov:11,
    december:12,dec:12
  };

  let monthNum=null;
  if(/^\d{1,2}$/.test(raw)){
    monthNum=Number(raw);
  }else{
    const cleaned=raw.replace(/\./g,'').trim();
    monthNum=monthNames[cleaned] || null;
  }

  if(monthNum && seasonStart){
    const year=monthNum>=7 ? seasonStart : seasonStart+1;
    return `${year}-${String(monthNum).padStart(2,'0')}`;
  }

  const due=String(fee?.dueDate||'');
  if(/^\d{4}-\d{2}/.test(due)) return due.slice(0,7);

  return '';
}

function profileSeasonMonths_(){
  const season=String(currentTeamData?.season||'').trim();
  const match=season.match(/^(\d{4})\D+(\d{2,4})$/);

  if(match){
    const startYear=Number(match[1]);
    const months=[];

    // Club season: September -> August, all 12 months.
    for(let month=9;month<=12;month++){
      months.push(`${startYear}-${String(month).padStart(2,'0')}`);
    }
    for(let month=1;month<=8;month++){
      months.push(`${startYear+1}-${String(month).padStart(2,'0')}`);
    }

    return months;
  }

  // Fallback: 12-month window around the current club year,
  // still keeping all existing event months if season metadata is missing.
  const current=profileBudapestMonthKey_();
  const currentYear=Number(current.slice(0,4));
  const currentMonth=Number(current.slice(5,7));
  const startYear=currentMonth>=9 ? currentYear : currentYear-1;
  const months=[];

  for(let month=9;month<=12;month++){
    months.push(`${startYear}-${String(month).padStart(2,'0')}`);
  }
  for(let month=1;month<=8;month++){
    months.push(`${startYear+1}-${String(month).padStart(2,'0')}`);
  }

  return months;
}
function profilePaymentDueDate_(fee,monthKey){
  const explicit=String(fee?.dueDate||'').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(explicit) return `${explicit[1]}-${explicit[2]}-${explicit[3]}`;
  return `${monthKey}-15`;
}

function profileBudapestDateKey_(){
  const parts=new Intl.DateTimeFormat('en',{
    timeZone:'Europe/Budapest',
    year:'numeric',
    month:'2-digit',
    day:'2-digit'
  }).formatToParts(new Date());

  const year=parts.find(p=>p.type==='year')?.value || String(new Date().getFullYear());
  const month=parts.find(p=>p.type==='month')?.value || String(new Date().getMonth()+1).padStart(2,'0');
  const day=parts.find(p=>p.type==='day')?.value || String(new Date().getDate()).padStart(2,'0');
  return `${year}-${month}-${day}`;
}

function profilePaymentCellState_(fee,monthKey){
  if(!fee) return 'empty';
  const status=String(fee?.status||'').toLowerCase();

  if(status==='paid') return 'paid';
  if(status==='waived') return 'waived';

  const dueDate=profilePaymentDueDate_(fee,monthKey);
  return profileBudapestDateKey_()>dueDate ? 'late' : 'pending';
}

function profilePaymentCell_(fee,monthKey){
  const state=profilePaymentCellState_(fee,monthKey);

  if(state==='empty'){
    return `<span class="profile-pay-symbol empty" title="Nincs rögzített adat" aria-label="Nincs rögzített adat">–</span>`;
  }

  if(state==='paid'){
    return `<span class="profile-pay-symbol paid" title="Befizetve" aria-label="Befizetve">✓</span>`;
  }

  if(state==='late'){
    return `<span class="profile-pay-symbol late" title="Lejárt határidő, nincs befizetve" aria-label="Lejárt határidő, nincs befizetve">!</span>`;
  }

  if(state==='waived'){
    return `<span class="profile-pay-symbol waived" title="Elengedve" aria-label="Elengedve">–</span>`;
  }

  return `<span class="profile-pay-symbol pending" title="Még nincs befizetve" aria-label="Még nincs befizetve">–</span>`;
}

function profilePaymentCellClass_(fee,monthKey){
  return `payment-${profilePaymentCellState_(fee,monthKey)}`;
}
function profileScrollPaymentsToCurrent_(){
  const scroller=document.getElementById('profilePaymentMatrixScroll');
  if(!scroller) return;
  const current=profileBudapestMonthKey_();
  const target=scroller.querySelector(`[data-payment-month="${CSS.escape(current)}"]`);
  const sticky=scroller.querySelector('.profile-payment-row-label');
  if(!target) return;

  requestAnimationFrame(()=>{
    const stickyWidth=sticky ? sticky.getBoundingClientRect().width : 92;
    scroller.scrollLeft=Math.max(0,target.offsetLeft-stickyWidth);
  });
}

function renderProfilePayments_(){
  const box=document.getElementById('profilePaymentsContent');
  if(!box) return;

  if(currentProfileData.loaded===false){
    box.className='profile-payments-v2';
    box.innerHTML='<div class="profile-empty-block"><b>A befizetési adatok jelenleg nem érhetők el.</b></div>';
    return;
  }

  const rows=Array.isArray(currentProfileData.payments) ? currentProfileData.payments : [];
  const months=profileSeasonMonths_();

  const monthly=new Map();
  rows.forEach(fee=>{
    const key=profileNormalizePeriodKey_(fee);
    if(!key) return;
    monthly.set(`${String(fee.feeType||'')}|${key}`,fee);
  });

  const permissionRows=rows
    .filter(fee=>String(fee.feeType||'')==='permission_fee')
    .sort((a,b)=>String(b.paidAt||b.dueDate||'').localeCompare(String(a.paidAt||a.dueDate||'')));
  const permission=permissionRows[0] || null;

  const monthHead=months.map(key=>
    `<th data-payment-month="${escapeHtml_(key)}" class="${key===profileBudapestMonthKey_()?'is-current':''}">
      <span>${escapeHtml_(profileMonthName_(key,true))}</span>
    </th>`
  ).join('');

  const rowHtml=(label,type)=>`
    <tr>
      <th class="profile-payment-row-label">${escapeHtml_(label)}</th>
      ${months.map(key=>{
        const fee=monthly.get(`${type}|${key}`);
        const currentClass=key===profileBudapestMonthKey_()?'is-current':'';
        const stateClass=profilePaymentCellClass_(fee,key);
        return `<td class="${currentClass} ${stateClass}">
          ${profilePaymentCell_(fee,key)}
        </td>`;
      }).join('')}
    </tr>`;

  let permissionHtml='';
  const permissionStatus=String(permission?.status||'').toLowerCase();
  if(permissionStatus==='paid'){
    permissionHtml=`<span class="profile-permission-symbol paid" title="Befizetve" aria-label="Befizetve">✓</span>`;
  }else if(permissionStatus==='due'){
    permissionHtml=`<span class="profile-permission-symbol late" title="Fizetendő" aria-label="Fizetendő">!</span>`;
  }else if(permissionStatus==='waived'){
    permissionHtml=`<span class="profile-permission-symbol waived" title="Elengedve" aria-label="Elengedve">–</span>`;
  }else{
    permissionHtml=`<span class="profile-permission-symbol empty" title="Nincs rögzített adat" aria-label="Nincs rögzített adat">–</span>`;
  }

  box.className='profile-payments-v2';
  box.innerHTML=`
    <div class="profile-payment-matrix-scroll" id="profilePaymentMatrixScroll">
      <table class="profile-payment-matrix">
        <thead>
          <tr>
            <th class="profile-payment-row-label"></th>
            ${monthHead}
          </tr>
        </thead>
        <tbody>
          ${rowHtml('BEAC bérlet','beac_pass')}
          ${rowHtml('Edzői díj','coach_fee')}
        </tbody>
      </table>
    </div>

    <div class="profile-permission-row detail-row">
      <span class="profile-permission-label">Engedélyek</span>
      ${permissionHtml}
    </div>

    <details class="profile-payment-info">
      <summary>
        <span>Díjak és fizetési módok</span>
        <span class="cc-outline-triangle profile-details-chevron" aria-hidden="true"></span>
      </summary>
      <div class="profile-payment-info-body">
        <div class="profile-payment-info-row">
          <div><b>BEAC versenyzői röplabda bérlet</b><small>7 000 Ft / hó</small></div>
          <a href="https://www.beac.hu/berlet/versenyzoi-roplabda-berlet-2026-osz" target="_blank" rel="noopener">Bérlet megnyitása ↗</a>
        </div>
        <div class="profile-payment-info-row">
          <div><b>Edzői díj</b><small>7 000 Ft / hó</small></div>
          <span>Revolut vagy készpénz</span>
        </div>
        <p>Ez a rész csak tájékoztató. A fenti havi státuszok kizárólag a rendszerben ténylegesen rögzített befizetéseket mutatják.</p>
      </div>
    </details>
  `;

  profileScrollPaymentsToCurrent_();
}

function renderEvents(){
  updateHomeFilterUi_();
  const rows=filteredHomeEvents();
  eventList.innerHTML=rows.length ? renderEventCardsWithMonths_(rows) : `<div class="empty-state">Nincs találat a szűrésre.</div>`;
  bindSliderDrag();
  renderProfileStats_();
}

const plannerDefaultMode=localStorage.getItem('cc-planner-default') || 'last';
const plannerLastMode=localStorage.getItem('cc-planner-mode') || 'grid';
let plannerMode=(plannerDefaultMode==='last' ? plannerLastMode : plannerDefaultMode);
if(!['grid','calendar'].includes(plannerMode)) plannerMode='grid';

let plannerUserPositioned=false;

// V2.3.5.25 — the Menetrend grid owns its own vertical scroll.
// iOS/PWA must not restore a previous BODY/page scroll position.
if('scrollRestoration' in history){
  try{ history.scrollRestoration='manual'; }catch(_){}
}

function forcePlannerPageTop_(){
  if(window.scrollY!==0) window.scrollTo(0,0);
  if(document.documentElement.scrollTop!==0) document.documentElement.scrollTop=0;
  if(document.body.scrollTop!==0) document.body.scrollTop=0;
}

function plannerGridPageLockNeeded_(){
  const plannerView=document.getElementById('plannerView');
  const portrait=window.matchMedia?.('(max-width:760px) and (orientation:portrait)')?.matches;
  return !!(plannerView?.classList.contains('active') && plannerMode==='grid' && portrait);
}

function syncPlannerPageLock_(){
  const lock=plannerGridPageLockNeeded_();
  document.documentElement.classList.toggle('planner-grid-page-lock',lock);
  document.body.classList.toggle('planner-grid-page-lock',lock);
  if(lock) forcePlannerPageTop_();
}

let plannerAutoPositioning=false;

let calendarCursor=null;
function plannerStatusControls(e, archived){
  return `<div class="attendance-slider planner-slider ${e.status||'none'}" data-slider="${e.id}">
    <button class="slider-zone left" data-slider-action="yes" data-id="${e.id}" ${archived?'disabled':''}>✓</button>
    <button class="slider-zone center" data-slider-action="none" data-id="${e.id}" ${archived?'disabled':''}>–</button>
    <button class="slider-zone right" data-slider-action="no" data-id="${e.id}" ${archived?'disabled':''}>✕</button>
    <span class="slider-thumb"></span>
  </div>`;
}
function filteredPlannerEvents(){
  const pf = document.getElementById('plannerPeriodFilter')?.value || 'upcoming';
  const mf = document.getElementById('monthFilter')?.value || 'all';
  const tf = document.getElementById('typeFilter')?.value || 'all';

  return events.filter(e => {
    const past=isPast(e);

    // Default: current/ongoing event + future events only.
    if(pf==='upcoming' && past) return false;
    if(pf==='past' && !past) return false;

    if(mf!=='all' && e.month!==mf) return false;
    if(tf!=='all' && e.type!==tf) return false;
    if(missingOnly && e.status!==null) return false;
    return true;
  });
}


function rosterDisplayName_(name){
  const raw=String(name || '').trim();
  if(!raw) return '';

  if(raw==='Te' || raw===currentPlayerName){
    return currentPlayerDisplayName || currentPlayerName || raw;
  }

  const person=(teamPlayerDirectory || []).find(p=>String(p?.name || '').trim()===raw);
  const display=String(person?.displayName || '').trim();
  return display || raw;
}

function personStatusForEvent(e,person){
  if(person && person.id==='__ME__') return e.status || null;
  const name=typeof person==='string' ? person : person?.name;
  if((e.yes||[]).includes(name)) return 'yes';
  if((e.no||[]).includes(name)) return 'no';
  return null;
}

function gridGivenName(person){
  const displayName=(person?.displayName || '').trim();
  if(displayName) return displayName;
  const explicit=(person?.firstName || '').trim();
  if(explicit) return explicit;
  const raw=(typeof person==='string' ? person : (person?.name || '')).trim();
  if(!raw) return 'Játékos';
  const demo=raw.match(/^Teszt\s+Játékos\s+(.+)$/i);
  if(demo) return demo[1];
  const parts=raw.split(/\s+/);
  return parts.length>1 ? parts[parts.length-1] : parts[0];
}

function jerseyNumberOf(person){
  const raw=person?.jerseyNo ?? person?.jerseyNumber ?? person?.shirtNumber ?? person?.number ?? '';
  if(raw===null || raw===undefined || String(raw).trim()==='') return null;
  const n=Number(raw);
  return Number.isFinite(n) ? n : null;
}

function gridPeople(rows){
  const seenNames=new Set();
  rows.forEach(e=>{
    [...(e.yes||[]), ...(e.no||[]), ...(e.unknown||[])].forEach(name=>{
      if(name && name!=='Te' && name!==currentPlayerName) seenNames.add(name);
    });
  });

  const metaByName=new Map((teamPlayerDirectory||[]).map(p=>[String(p.name||'').trim(),p]));
  const mine={
    id:'__ME__',
    name:currentPlayerName || 'Én',
    displayName:currentPlayerDisplayName || '',
    firstName:currentPlayerData?.firstName || '',
    jerseyNo:currentPlayerData?.jerseyNo ?? null,
    avatarId:currentAvatarId || currentPlayerData?.avatarId || ''
  };

  const rest=Array.from(seenNames).map(name=>{
    const meta=metaByName.get(String(name).trim()) || {};
    return {
      id:meta.playerId || name,
      name,
      displayName:meta.displayName || '',
      firstName:meta.firstName || '',
      jerseyNo:meta.jerseyNo ?? null,
      avatarId:meta.avatarId || ''
    };
  });

  rest.sort((a,b)=>{
    const an=jerseyNumberOf(a), bn=jerseyNumberOf(b);
    if(an!==null && bn!==null && an!==bn) return an-bn;
    if(an!==null && bn===null) return -1;
    if(an===null && bn!==null) return 1;
    return gridGivenName(a).localeCompare(gridGivenName(b),'hu');
  });
  return [mine, ...rest];
}

function matrixOwnControl(e, archived){
  return `<div class="matrix-control ${e.status||'none'}" data-matrix="${e.id}">
    <button data-slider-action="yes" data-id="${e.id}" ${archived?'disabled':''}>✓</button>
    <button data-slider-action="none" data-id="${e.id}" ${archived?'disabled':''}>–</button>
    <button data-slider-action="no" data-id="${e.id}" ${archived?'disabled':''}>✕</button>
  </div>`;
}

function currentGridAnchorIndex(rows){
  const firstOpen=rows.findIndex(e=>!isPast(e));
  return firstOpen >= 0 ? firstOpen : Math.max(rows.length-1,0);
}

function renderGridMatrix(rows){
  const people=gridPeople(rows);
  const anchorIndex=currentGridAnchorIndex(rows);
  let lastMonth='';

  const body=rows.map((e,rowIndex)=>{
    const archived=isPast(e);
    const count=(e.yes||[]).length;
    const monthKey=monthKeyFromDate(eventDateObj(e));
    // Do not put a month divider above the very first visible event.
    // The default Menetrend should start directly with the current/next event.
    const divider=(rowIndex>0 && monthKey!==lastMonth)
      ? `<tr class="matrix-month-divider"><td colspan="${2+people.length}">${monthDividerHtml_(e)}</td></tr>`
      : '';
    lastMonth=monthKey;

    return divider+`<tr class="${archived?'matrix-past-row':''} ${rowIndex===anchorIndex?'matrix-current-anchor':''}" data-grid-event="${e.id}">
      <th class="matrix-event-side sticky-matrix-col">
        <button class="matrix-event-open matrix-event-side-btn" data-open-event="${e.id}" title="${typeLabel(e)} · ${e.title}">
          <span class="matrix-side-icon">${typeIcon(e)}</span>
          <span class="matrix-event-copy"><b>${e.title}</b><small>${e.date} · ${e.day} · ${e.time}</small></span>
        </button>
      </th>
      <td class="matrix-count-cell"><strong class="${attendanceCountClass(count)}">${count}</strong></td>
      ${people.map(person=>{
        const mine=person.id==='__ME__';
        const st=personStatusForEvent(e,person);
        const cls=st ? 'matrix-'+st : 'matrix-none';
        if(mine) return `<td class="matrix-cell ${cls} current-player-cell">${matrixOwnControl(e,archived)}</td>`;
        return `<td class="matrix-cell ${cls}"><span class="matrix-status">${st==='yes'?'✓':st==='no'?'✕':'·'}</span></td>`;
      }).join('')}
    </tr>`;
  }).join('');

  return `<div class="matrix-scroll" id="matrixScroll"><table class="season-matrix transposed-matrix">
    <thead>
      <tr>
        <th class="matrix-event-side sticky-matrix-col">Alkalom</th>
        <th class="matrix-count-head">Fő</th>
        ${people.map(person=>{
          const mine=person.id==='__ME__';
          return `<th class="matrix-player-head ${mine?'current-player-head':''}" title="${escapeHtml_(person.name)}"><span class="grid-player-head-inner">${person.avatarId?`<span class="grid-player-avatar">${avatarMarkup_(person.avatarId,'grid-player-avatar-svg')}</span>`:''}<span class="grid-player-label">${escapeHtml_(gridGivenName(person))}</span></span></th>`;
        }).join('')}
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table></div>`;
}

function scrollGridToCurrent(behavior='auto'){
  const scroller=document.getElementById('matrixScroll');
  const target=scroller?.querySelector('.matrix-current-anchor');
  if(!scroller || !target) return;
  const top=target.offsetTop - scroller.querySelector('thead').offsetHeight - 2;
  scroller.scrollTo({top:Math.max(0,top),behavior});
}

function eventDateObj(e){
  const p=e.date.replace(/\.$/,'').split('.').filter(Boolean).map(Number);
  return new Date(p[0],p[1]-1,p[2]);
}
function monthKeyFromDate(d){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}
function calendarMonthLabel(d){
  return d.toLocaleDateString('hu-HU',{year:'numeric',month:'long'});
}
function initialCalendarCursor(rows){
  const mf=document.getElementById('monthFilter').value;
  if(mf!=='all'){
    const match=rows.find(e=>e.month===mf) || events.find(e=>e.month===mf);
    if(match) return eventDateObj(match);
  }
  const upcoming=rows.find(e=>!isPast(e)) || rows[0] || events[0];
  return upcoming ? eventDateObj(upcoming) : new Date();
}

function safeEventColor_(e){
  const raw=String(e?.color||'').trim();
  if(/^#[0-9a-fA-F]{6}$/.test(raw)) return raw;
  if(e?.type==='Edzés') return '#f7b700';
  if(e?.matchKind==='home') return '#3f8f55';
  return '#4687c7';
}
function calendarEventChip(e){
  return `<button class="calendar-event ${cardClass(e)}" data-open-event="${e.id}" title="${typeLabel(e)} · ${e.title}">${typeIcon(e)}<span>${e.time.split('–')[0]}</span><b>${e.type==='Edzés'?'Edzés':(e.matchKind==='home'?'Hazai':'Idegen')}</b></button>`;
}
function isTodayDate(dateObj){
  const now=new Date();
  return dateObj.getFullYear()===now.getFullYear() && dateObj.getMonth()===now.getMonth() && dateObj.getDate()===now.getDate();
}
function renderCalendar(rows){
  if(!calendarCursor) calendarCursor=initialCalendarCursor(rows);
  const y=calendarCursor.getFullYear(), m=calendarCursor.getMonth();
  const first=new Date(y,m,1), last=new Date(y,m+1,0);
  const startOffset=(first.getDay()+6)%7;
  const cells=[];
  for(let i=0;i<startOffset;i++) cells.push(null);
  for(let d=1;d<=last.getDate();d++) cells.push(new Date(y,m,d));
  while(cells.length%7) cells.push(null);
  const visible=rows.filter(e=>{const d=eventDateObj(e); return d.getFullYear()===y && d.getMonth()===m;});

  return `<div class="calendar-shell">
    <div class="calendar-head"><button class="calendar-nav" data-cal-nav="prev" aria-label="Előző hónap">‹</button><h4>${calendarMonthLabel(calendarCursor)}</h4><button class="calendar-nav" data-cal-nav="next" aria-label="Következő hónap">›</button></div>
    <div class="calendar-weekdays">${['H','K','Sze','Cs','P','Szo','V'].map(x=>`<span>${x}</span>`).join('')}</div>
    <div class="calendar-grid">${cells.map(d=>{
      if(!d) return '<div class="calendar-day empty"></div>';
      const key=monthKeyFromDate(d)+'-'+String(d.getDate()).padStart(2,'0');
      const dayEvents=visible.filter(e=>eventDateObj(e).getDate()===d.getDate());
      const accent=dayEvents.length ? safeEventColor_(dayEvents[0]) : '';
      return `<div class="calendar-day ${dayEvents.length?'has-events':''} ${isTodayDate(d)?'calendar-today':''}" ${accent?`style="--calendar-day-accent:${accent}"`:''} data-calendar-date="${key}">
        <div class="calendar-day-no">${d.getDate()}</div>
        <div class="calendar-events">${dayEvents.map(calendarEventChip).join('')}</div>
      </div>`;
    }).join('')}</div>
  </div>`;
}

function renderCardSchedule(rows){
  return rows.map(e=>{
    const archived=isPast(e);
    const court=compactCourtMeta_(e);
    const baseMeta=e.matchKind==='away'
      ? [e.day,e.time].filter(Boolean).join(' • ')
      : [e.day,e.time,court].filter(Boolean).join(' • ');
    const awayQuick=e.matchKind==='away' && e.address
      ? `<small class="planner-away-location">${e.address}</small>${mapLink(e,'Google Maps ↗','planner-map-link')}`
      : '';
    return `<div class="planner-row planner-event-open ${cardClass(e)} ${archived?'archived-row':''}" data-open-event="${e.id}" data-event-id="${e.id}">
      <div class="planner-icon bare-icon">${typeIcon(e)}</div>
      <div class="planner-main"><b>${e.date} · ${e.title}</b><small>${baseMeta}</small>${awayQuick}${archived?'<span class="archive-badge">Lezárt</span>':''}</div>
      <div class="planner-count"><strong class="${attendanceCountClass(e.yes.length)}">${e.yes.length} fő</strong></div>
      ${plannerStatusControls(e,archived)}
    </div>`;
  }).join('') || `<div class="empty-state">Nincs találat a szűrésre.</div>`;
}


function nearestUpcomingEvent(rows){
  if(!rows || !rows.length) return null;
  return rows.find(e=>!isPast(e)) || rows[rows.length-1] || null;
}

function scrollPlannerToNearest(rows, behavior='auto'){
  const next=nearestUpcomingEvent(rows);
  if(!next) return;

  if(plannerMode==='grid'){
    const viewport=document.getElementById('plannerScrollViewport');
    const row=viewport?.querySelector(`[data-grid-event="${next.id}"]`);
    if(!viewport || !row) return;

    forcePlannerPageTop_();

    const viewportRect=viewport.getBoundingClientRect();
    const rowRect=row.getBoundingClientRect();
    const head=viewport.querySelector('thead');
    const target=Math.max(
      0,
      viewport.scrollTop +
      (rowRect.top-viewportRect.top) -
      (head?.offsetHeight || 0) -
      2
    );

    if(behavior==='auto') viewport.scrollTop=target;
    else viewport.scrollTo({top:target,behavior});
    return;
  }

  if(plannerMode==='cards'){
    const el=document.querySelector(`#plannerList [data-event-id="${next.id}"]`);
    if(!el) return;
    const y=el.getBoundingClientRect().top + window.scrollY - 118;
    window.scrollTo({top:Math.max(0,y), behavior});
  }
}

function plannerFilterIsDefault_(){
  const period=document.getElementById('plannerPeriodFilter')?.value || 'upcoming';
  const month=document.getElementById('monthFilter')?.value || 'all';
  const type=document.getElementById('typeFilter')?.value || 'all';
  return period==='upcoming' && month==='all' && type==='all' && !missingOnly;
}
function updatePlannerFilterButton_(){
  const isDefault=plannerFilterIsDefault_();
  const btn=document.getElementById('plannerFilterBtn');
  if(btn) btn.classList.toggle('has-active-filter',!isDefault);
  const resetBtn=document.getElementById('resetPlannerFiltersBtn');
  if(resetBtn) resetBtn.hidden=isDefault;
}

function updatePlannerBottomState_(){
  // V2.3.5.31: no stateful panel-end logic.
  // The card is always a normal card; the tail spacer reveals its real end.
}

function syncPlannerGridViewport_(){
  const plannerView=document.getElementById('plannerView');
  const viewport=document.getElementById('plannerScrollViewport');
  const matrix=document.getElementById('matrixScroll');
  const bottomNav=document.querySelector('.bottom-nav');

  syncPlannerPageLock_();

  if(!plannerView?.classList.contains('active') || !viewport || !bottomNav) return;

  // Neutralize all historical matrix-scroller runtime sizing.
  if(matrix){
    matrix.classList.remove('matrix-has-vertical-scroll');
    matrix.style.removeProperty('height');
    matrix.style.removeProperty('max-height');
    matrix.style.removeProperty('overflow-y');
  }

  const portrait=window.matchMedia?.('(max-width:760px) and (orientation:portrait)')?.matches;

  // Tail height is derived from the REAL fixed nav height.
  const navHeight=Math.ceil(bottomNav.getBoundingClientRect().height || 72);
  viewport.style.setProperty('--planner-nav-height',`${navHeight}px`);

  if(!portrait){
    viewport.style.removeProperty('height');
    viewport.style.removeProperty('max-height');
    return;
  }

  forcePlannerPageTop_();

  // Viewport runs to the physical screen bottom, BEHIND the fixed nav.
  // The tail spacer then makes the real card bottom stop 12px above the nav
  // at maximum scroll. This geometry never changes during scrolling.
  const rect=viewport.getBoundingClientRect();
  const available=Math.max(280,Math.floor(window.innerHeight-rect.top));

  viewport.style.setProperty('height',`${available}px`,'important');
  viewport.style.setProperty('max-height',`${available}px`,'important');
}

function hidePlannerFloatingHeader_(){}

function syncPlannerFloatingHeaderGeometry_(){}

function setupPlannerFloatingHeader_(){}

function renderPlanner(){
  const jumpBtn=document.getElementById('jumpCurrentBtn');
  if(jumpBtn) jumpBtn.hidden=plannerMode!=='grid';

  updatePlannerFilterButton_();
  const rows=filteredPlannerEvents();
  const defaultView=document.getElementById('settingsDefaultView');
  if(defaultView) defaultView.value=localStorage.getItem('cc-planner-default') || 'last';

  document.querySelectorAll('.view-mode-btn[data-mode]').forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===plannerMode));

  if(plannerMode==='calendar'){
    plannerList.innerHTML=renderCalendar(rows);
  }else{
    plannerMode='grid';
    plannerList.innerHTML=renderGridMatrix(rows);
  }

  bindSliderDrag();
  requestAnimationFrame(()=>{
    if(plannerMode==='calendar'){
      markCalendarToday();
    }else{
      syncPlannerGridViewport_();
      updatePlannerBottomState_();
    }
  });
}

function askCancel(event){
  pendingCancel = event;
  document.getElementById('cancelEventTitle').textContent = `${event.date} • ${event.time} • ${event.title}`;
  document.getElementById('cancelNote').value = event.note || '';
  cancelDialog.showModal();
}

function setYes(event){
  persist(event,'yes',event.note||'');
  
/* V11 FIX10 — no accidental double-tap or pinch zoom */
document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
document.addEventListener('gesturechange',e=>e.preventDefault(),{passive:false});
document.addEventListener('gestureend',e=>e.preventDefault(),{passive:false});
document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});

renderEvents();
  renderPlanner();
}

function neutralizeEvent(ev){
  if(ev.status==='yes'){
    const ok = confirm('Már jelezted, hogy jössz. Biztosan visszaállítod „Nincs jelzés” állapotra?');
    if(!ok) return;
  }
  persist(ev,null,ev.note||'');
  renderEvents();
  renderPlanner();
}

eventList.addEventListener('click',e=>{
  const s=e.target.closest('[data-slider-action]');
  if(s){
    const ev=events.find(x=>x.id===s.dataset.id);
    if(isPast(ev)) return;
    if(s.dataset.sliderAction==='yes') setYes(ev);
    else if(s.dataset.sliderAction==='no') askCancel(ev);
    else neutralizeEvent(ev);
    return;
  }

  // Do not hijack real links (e.g. Google Maps).
  if(e.target.closest('a')) return;

  // Card view: clicking anywhere in the upper event area opens the shared detail dialog.
  const open=e.target.closest('.event-open-zone[data-open-event]');
  if(open){
    e.preventDefault();
    e.stopPropagation();
    openEventDialog(open.dataset.openEvent);
    return;
  }

  const rt=e.target.closest('[data-roster]');
  if(rt){
    const box=document.getElementById('roster-'+rt.dataset.roster);
    box.classList.toggle('open');
    rt.textContent=box.classList.contains('open')?'Névsor':'Névsor';
  }
});



plannerList.addEventListener('click',e=>{
  const nav=e.target.closest('[data-cal-nav]');
  if(nav){
    if(!calendarCursor) calendarCursor=initialCalendarCursor(filteredPlannerEvents());
    calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+(nav.dataset.calNav==='next'?1:-1),1);
    plannerUserPositioned=true;
    renderPlanner();
    return;
  }

  const b=e.target.closest('[data-slider-action]');
  if(b){
    const ev=events.find(x=>x.id===b.dataset.id);
    if(!ev || isPast(ev)) return;
    if(b.dataset.sliderAction==='yes') setYes(ev);
    else if(b.dataset.sliderAction==='no') askCancel(ev);
    else neutralizeEvent(ev);
    return;
  }

  if(e.target.closest('a')) return;

  const open=e.target.closest('[data-open-event]');
  if(open){
    openEventDialog(open.dataset.openEvent);
    return;
  }
});

// Only explicit user gestures should disable automatic positioning.
// Programmatic scrollTop changes must NOT set plannerUserPositioned.
plannerList.addEventListener('touchmove',event=>{
  if(plannerAutoPositioning) return;
  if(event.target?.closest?.('.planner-scroll-viewport')){
    plannerUserPositioned=true;
  }
},{passive:true});

plannerList.addEventListener('wheel',event=>{
  if(plannerAutoPositioning) return;
  if(event.target?.closest?.('.planner-scroll-viewport')){
    plannerUserPositioned=true;
  }
},{passive:true});

document.getElementById('confirmCancel').addEventListener('click',ev=>{
  ev.preventDefault();
  if(!pendingCancel) return;
  const note=document.getElementById('cancelNote').value.trim();
  if(!note){
    document.getElementById('cancelNote').focus();
    return;
  }
  persist(pendingCancel,'no',note);
  cancelDialog.close();
  pendingCancel=null;
  renderEvents();
  renderPlanner();
});

function toggleFilterPanel_(buttonId,panelId,force){
  const btn=document.getElementById(buttonId), panel=document.getElementById(panelId);
  if(!btn || !panel) return;
  const open=force!==undefined ? !!force : panel.classList.contains('is-collapsed');
  panel.classList.toggle('is-collapsed',!open);
  panel.setAttribute('aria-hidden',open?'false':'true');
  btn.setAttribute('aria-expanded',open?'true':'false');
  btn.classList.toggle('filter-open',open);
}

document.getElementById('eventFilterBtn')?.addEventListener('click',()=>toggleFilterPanel_('eventFilterBtn','eventFilterPanel'));
['eventPeriodFilter','eventTypeFilter','eventStatusFilter'].forEach(id=>{
  document.getElementById(id)?.addEventListener('change',e=>{
    if(id==='eventPeriodFilter') homeFilters.period=e.target.value;
    if(id==='eventTypeFilter') homeFilters.type=e.target.value;
    if(id==='eventStatusFilter') homeFilters.status=e.target.value;
    localStorage.setItem(HOME_FILTER_KEY,JSON.stringify(homeFilters));
    renderEvents();
  });
});
['eventDateFrom','eventDateTo'].forEach(id=>{
  document.getElementById(id)?.addEventListener('change',e=>{
    if(id==='eventDateFrom') homeFilters.from=e.target.value.trim();
    if(id==='eventDateTo') homeFilters.to=e.target.value.trim();
    localStorage.setItem(HOME_FILTER_KEY,JSON.stringify(homeFilters));
    renderEvents();
  });
});
document.getElementById('resetEventFiltersBtn')?.addEventListener('click',()=>{
  homeFilters={period:'next14',type:'all',status:'all',from:'',to:''};
  localStorage.setItem(HOME_FILTER_KEY,JSON.stringify(homeFilters));
  renderEvents();
  toggleFilterPanel_('eventFilterBtn','eventFilterPanel',true);
});

document.getElementById('plannerFilterBtn')?.addEventListener('click',()=>toggleFilterPanel_('plannerFilterBtn','plannerFilterPanel'));
['plannerPeriodFilter','monthFilter','typeFilter'].forEach(id=>{
  document.getElementById(id)?.addEventListener('change',()=>{
    const rows=filteredPlannerEvents();

    if(plannerMode==='calendar'){
      calendarCursor=initialCalendarCursor(rows);
    }

    renderPlanner();

    // Default/upcoming always begins at the first visible event.
    if(plannerMode==='grid'){
      requestAnimationFrame(()=>{
        const viewport=document.getElementById('plannerScrollViewport');
        if(viewport) viewport.scrollTop=0;
      });
    }

    toggleFilterPanel_('plannerFilterBtn','plannerFilterPanel',true);
  });
});
document.getElementById('missingOnlyBtn')?.addEventListener('click',e=>{
  missingOnly=!missingOnly;
  e.currentTarget.classList.toggle('active-filter',missingOnly);
  renderPlanner();
  toggleFilterPanel_('plannerFilterBtn','plannerFilterPanel',true);
});

document.getElementById('resetPlannerFiltersBtn')?.addEventListener('click',()=>{
  const period=document.getElementById('plannerPeriodFilter');
  const month=document.getElementById('monthFilter');
  const type=document.getElementById('typeFilter');
  const missing=document.getElementById('missingOnlyBtn');

  if(period) period.value='upcoming';
  if(month) month.value='all';
  if(type) type.value='all';

  missingOnly=false;
  missing?.classList.remove('active-filter');

  if(plannerMode==='calendar'){
    calendarCursor=initialCalendarCursor(filteredPlannerEvents());
  }

  renderPlanner();
  toggleFilterPanel_('plannerFilterBtn','plannerFilterPanel',true);
});

function positionPlannerInitial_(rows=filteredPlannerEvents()){
  if(plannerMode==='calendar'){
    syncPlannerPageLock_();
    calendarCursor=initialCalendarCursor(rows);
    renderPlanner();
    return;
  }

  plannerAutoPositioning=true;
  plannerList.classList.add('planner-prepositioning');

  forcePlannerPageTop_();
  renderPlanner();

  requestAnimationFrame(()=>{
    forcePlannerPageTop_();
    syncPlannerGridViewport_();

    requestAnimationFrame(()=>{
      // Default Menetrend is already filtered to current + future.
      // Therefore its first row is the correct starting point.
      const viewport=document.getElementById('plannerScrollViewport');
      if(viewport) viewport.scrollTop=0;

      plannerList.classList.remove('planner-prepositioning');

      requestAnimationFrame(()=>{
        forcePlannerPageTop_();
        plannerAutoPositioning=false;
      });
    });
  });
}

let ccUnreadNotificationCount=0;
let ccPlayerNotifications=[];
let ccNotificationsLoading=false;
let ccNotificationsBackendReady=true;

function renderNotificationShell_(count=ccUnreadNotificationCount){
  const value=Math.max(0,Number(count)||0);
  ccUnreadNotificationCount=value;
  const compact=value>9?'9+':String(value);
  const visibleCount=Array.isArray(ccPlayerNotifications)?ccPlayerNotifications.length:0;
  const previousCount=Math.max(0,visibleCount-value);
  const shortSummary=value>0
    ? (previousCount>0 ? `${value} új · ${previousCount} korábbi` : `${value} új`)
    : (previousCount>0 ? `Nincs új · ${previousCount} korábbi` : 'Nincs új');

  const badge=document.getElementById('profileNotificationBadge');
  if(badge){
    badge.hidden=value===0;
    badge.textContent=compact;
    badge.setAttribute('aria-label',value===0?'Nincs új értesítés':`${value} új értesítés`);
  }
  const accountBtn=document.getElementById('accountMenuBtn');
  if(accountBtn){
    accountBtn.setAttribute('aria-label',value>0 ? `${value} új értesítés. Értesítések megnyitása` : 'Profil megnyitása');
    accountBtn.setAttribute('title',value>0 ? 'Értesítések' : 'Profil');
  }
  const quickStatus=document.getElementById('quickNotificationsStatus');
  if(quickStatus) quickStatus.textContent=shortSummary;
  const quickCount=document.getElementById('quickNotificationsCount');
  if(quickCount){ quickCount.hidden=value===0; quickCount.textContent=compact; }
  const profileStatus=document.getElementById('profileNotificationsStatus');
  if(profileStatus) profileStatus.textContent=shortSummary;
  const profileCount=document.getElementById('profileNotificationsCount');
  if(profileCount){ profileCount.hidden=value===0; profileCount.textContent=compact; }
  const dialogSummary=document.getElementById('notificationsDialogSummary');
  if(dialogSummary){
    if(!ccNotificationsBackendReady){
      dialogSummary.textContent='Az értesítési központ jelenleg nem érhető el.';
    }else if(ccNotificationsLoading){
      dialogSummary.textContent='Értesítések betöltése…';
    }else{
      const newPart=value===1?'1 új értesítés':`${value} új értesítés`;
      const previousPart=previousCount===1?'1 korábbi':`${previousCount} korábbi`;
      if(value>0 && previousCount>0) dialogSummary.textContent=`${newPart} · ${previousPart}`;
      else if(value>0) dialogSummary.textContent=newPart;
      else if(previousCount>0) dialogSummary.textContent=`Nincs új értesítés · ${previousPart}`;
      else dialogSummary.textContent='Nincs új értesítés.';
    }
  }
}

function ccNotificationTypeLabel_(type){
  const map={
    new_training:'Új edzés',training_change:'Edzés változás',weekly_response_reminder:'Visszajelzés',
    same_day_response_reminder:'Mai edzés',new_match:'Új meccs',match_change:'Meccs változás',
    payment:'Fizetés',test:'Teszt'
  };
  return map[String(type||'')]||'Értesítés';
}
function ccNotificationTime_(value){
  const d=new Date(value||'');
  if(Number.isNaN(d.getTime())) return '';
  try{
    return new Intl.DateTimeFormat('hu-HU',{
      timeZone:'Europe/Budapest',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'
    }).format(d).replace(',',' ·');
  }catch(_){ return ''; }
}
function ccNotificationItemHtml_(item){
  const unread=!item.readAt;
  return `<div class="notification-swipe-row ${unread?'is-unread':'is-read'}" data-notification-id="${escapeHtml_(item.id)}">
    <button type="button" class="notification-item-card" data-notification-open="${escapeHtml_(item.id)}">
      <span class="notification-item-dot" aria-hidden="true"></span>
      <span class="notification-item-content">
        <span class="notification-item-top"><b>${escapeHtml_(item.title||'Értesítés')}</b><small>${escapeHtml_(ccNotificationTime_(item.createdAt))}</small></span>
        ${item.body?`<span class="notification-item-body">${escapeHtml_(item.body)}</span>`:''}
        <span class="notification-item-meta">${escapeHtml_(ccNotificationTypeLabel_(item.type))}</span>
      </span>
    </button>
    <div class="notification-swipe-action" aria-hidden="true">Eltüntetés</div>
  </div>`;
}
function renderNotificationInbox_(){
  const list=document.getElementById('notificationInboxList');
  const empty=document.getElementById('notificationEmptyState');
  if(!list || !empty) return;

  // Refresh silently when we already have items. Never flash the empty/success
  // state while the real notification list is still loading.
  if(ccNotificationsLoading){
    empty.hidden=true;
    if(ccPlayerNotifications.length){
      list.hidden=false;
      if(!list.childElementCount){
        list.innerHTML=ccPlayerNotifications.map(ccNotificationItemHtml_).join('');
        ccBindNotificationSwipes_();
      }
    }else{
      list.hidden=true;
    }
    return;
  }
  if(!ccNotificationsBackendReady){
    empty.hidden=false; list.hidden=true;
    empty.innerHTML='<span class="notification-empty-icon" aria-hidden="true">!</span><b>Nem érhető el.</b><small>Az értesítési központ backendje még nem válaszol.</small>';
    return;
  }
  if(!ccPlayerNotifications.length){
    list.hidden=true;
    list.innerHTML='';
    empty.hidden=false;
    empty.innerHTML='<span class="notification-empty-icon" aria-hidden="true">✓</span><b>Minden rendben.</b><small>Nincs megjelenítendő értesítésed.</small>';
    return;
  }
  empty.hidden=true; list.hidden=false;
  list.innerHTML=ccPlayerNotifications.map(ccNotificationItemHtml_).join('');
  ccBindNotificationSwipes_();
}
async function ccLoadNotifications_(options={}){
  if(!SUPABASE_ENABLED || !ccSupabase || !ccSupabaseSession){
    ccNotificationsBackendReady=false; ccPlayerNotifications=[]; renderNotificationShell_(0); renderNotificationInbox_(); return;
  }
  if(ccNotificationsLoading && !options.force) return;
  ccNotificationsLoading=true; renderNotificationShell_(ccUnreadNotificationCount); renderNotificationInbox_();
  try{
    const {data,error}=await ccSupabase.rpc('cc_player_notifications_v1',{p_limit:50,p_include_dismissed:false});
    if(error) throw error;
    const payload=typeof data==='string'?JSON.parse(data):(data||{});
    ccNotificationsBackendReady=true;
    ccPlayerNotifications=Array.isArray(payload.items)?payload.items:[];
    ccUnreadNotificationCount=Math.max(0,Number(payload.unreadCount)||0);
  }catch(error){
    console.warn('Értesítési központ nem érhető el:',error);
    ccNotificationsBackendReady=false;
    ccPlayerNotifications=[];
    ccUnreadNotificationCount=0;
  }finally{
    ccNotificationsLoading=false; renderNotificationShell_(ccUnreadNotificationCount); renderNotificationInbox_();
  }
}
async function ccMarkNotificationRead_(id){
  if(!id || !SUPABASE_ENABLED || !ccSupabase) return;
  const item=ccPlayerNotifications.find(x=>String(x.id)===String(id));
  if(item && !item.readAt){
    item.readAt=new Date().toISOString();
    ccUnreadNotificationCount=Math.max(0,ccUnreadNotificationCount-1);
    renderNotificationShell_(ccUnreadNotificationCount); renderNotificationInbox_();
  }
  try{
    const {error}=await ccSupabase.rpc('cc_player_notification_read_v1',{p_notification_id:id});
    if(error) throw error;
  }catch(error){ console.warn('Értesítés olvasott állapota nem menthető:',error); await ccLoadNotifications_({force:true}); }
}
async function ccDismissNotification_(id){
  if(!id || !SUPABASE_ENABLED || !ccSupabase) return;
  const item=ccPlayerNotifications.find(x=>String(x.id)===String(id));
  if(item && !item.readAt) ccUnreadNotificationCount=Math.max(0,ccUnreadNotificationCount-1);
  ccPlayerNotifications=ccPlayerNotifications.filter(x=>String(x.id)!==String(id));
  renderNotificationShell_(ccUnreadNotificationCount); renderNotificationInbox_();
  try{
    const {error}=await ccSupabase.rpc('cc_player_notification_dismiss_v1',{p_notification_id:id});
    if(error) throw error;
  }catch(error){ console.warn('Értesítés archiválása nem sikerült:',error); await ccLoadNotifications_({force:true}); }
}
async function ccOpenNotification_(id){
  const item=ccPlayerNotifications.find(x=>String(x.id)===String(id));
  if(!item) return;
  await ccMarkNotificationRead_(id);
  const raw=String(item.url||'./');
  let target;
  try{ target=new URL(raw,location.href); }catch(_){ target=null; }
  if(!target || target.searchParams.has('ccNotifications')) return;
  notificationsDialog?.close();
  const eventId=target.searchParams.get('ccEvent') || item.eventId || item.data?.eventId;
  const view=target.searchParams.get('ccView');
  if(view==='profile') switchView('profileView');
  else if(view==='schedule') switchView('plannerView');
  if(eventId && events.some(e=>String(e.id)===String(eventId))) window.setTimeout(()=>openEventDialog(String(eventId)),100);
}
function ccBindNotificationSwipes_(){
  document.querySelectorAll('.notification-swipe-row').forEach(row=>{
    if(row.dataset.swipeBound==='1') return;
    row.dataset.swipeBound='1';

    const card=row.querySelector('.notification-item-card');
    const id=row.dataset.notificationId;
    if(!card || !id) return;

    // Browser-native swipe for iOS/Android PWAs.
    // The row itself is a horizontal scroller. Safari/Chrome own the drag,
    // momentum and axis arbitration; JS never moves the card during touch.
    // CSS Scroll Snap settles either at 0 (keep) or at maxScroll (dismiss).
    let dismissing=false;
    let settleTimer=0;
    let lastScrollAt=0;
    let maxSeenScroll=0;
    let touchActive=false;

    const maxScroll_=()=>Math.max(0,row.scrollWidth-row.clientWidth);
    const haptic=()=>{ try{ navigator.vibrate?.(8); }catch(_){ } };

    const commitDismiss=()=>{
      if(dismissing) return;
      dismissing=true;
      clearTimeout(settleTimer);
      row.classList.add('is-native-dismissing');
      haptic();
      // No red-tail animation: the list is re-rendered immediately once the
      // browser has finished its native snap at the dismiss position.
      ccDismissNotification_(id);
    };

    const settle=()=>{
      if(dismissing || touchActive) return;
      const max=maxScroll_();
      if(max<=1) return;
      const left=Math.max(0,row.scrollLeft);

      // With mandatory snapping the final resting positions are 0 or max.
      // Use a small tolerance for sub-pixel / Safari rounding.
      if(left>=max-6 || (left/max)>=0.88){
        commitDismiss();
        return;
      }

      // If Safari ended between snap points for any reason, leave the row to
      // the browser's snap engine. Never force a JS transform/scroll animation.
      maxSeenScroll=left<=2?0:maxSeenScroll;
    };

    const scheduleSettle=()=>{
      clearTimeout(settleTimer);
      // iOS 18 has no reliable Element.scrollend. Scroll events continue
      // through momentum/snap, so this fires only after they stop.
      settleTimer=window.setTimeout(settle,110);
    };

    row.addEventListener('touchstart',()=>{
      touchActive=true;
      clearTimeout(settleTimer);
    },{passive:true});

    row.addEventListener('scroll',()=>{
      if(dismissing) return;
      lastScrollAt=performance.now();
      maxSeenScroll=Math.max(maxSeenScroll,Math.max(0,row.scrollLeft));
      scheduleSettle();
    },{passive:true});

    // Newer browsers can finish without the debounce; iOS 18 uses fallback.
    if('onscrollend' in row){
      row.addEventListener('scrollend',()=>{
        clearTimeout(settleTimer);
        settle();
      },{passive:true});
    }

    card.addEventListener('click',event=>{
      const recentlyScrolled=(performance.now()-lastScrollAt)<260;
      if(dismissing || row.scrollLeft>2 || maxSeenScroll>3 || recentlyScrolled){
        event.preventDefault();
        // Once native snap has fully returned to rest, allow the next real tap.
        if(row.scrollLeft<=2 && !recentlyScrolled) maxSeenScroll=0;
        return;
      }
      ccOpenNotification_(id);
    });

    // Reset the gesture memory after the browser has snapped back to rest.
    row.addEventListener('touchend',()=>{
      touchActive=false;
      scheduleSettle();
      window.setTimeout(()=>{
        if(!dismissing && row.scrollLeft<=2) maxSeenScroll=0;
      },220);
    },{passive:true});
    row.addEventListener('touchcancel',()=>{
      touchActive=false;
      scheduleSettle();
    },{passive:true});
  });
}

const notificationsDialog=document.getElementById('notificationsDialog');
function ccFocusPanelTitle_(dialog,titleId){
  if(!dialog?.open) return;
  const title=document.getElementById(titleId);
  if(!title) return;
  requestAnimationFrame(()=>{
    try{ title.focus({preventScroll:true}); }
    catch(_){ title.focus(); }
  });
}

async function openNotificationsDialog_(){
  if(notificationsDialog && !notificationsDialog.open) notificationsDialog.showModal();
  ccFocusPanelTitle_(notificationsDialog,'notificationsDialogTitle');
  await ccLoadNotifications_({force:true});
}
document.getElementById('accountMenuBtn')?.addEventListener('click',()=>{
  if(ccUnreadNotificationCount>0) openNotificationsDialog_();
  else switchView('profileView');
});
document.getElementById('headerSettingsBtn')?.addEventListener('click',()=>document.getElementById('openSettingsBtn')?.click());
document.getElementById('openNotificationsBtn')?.addEventListener('click',openNotificationsDialog_);
document.getElementById('closeNotificationsBtn')?.addEventListener('click',()=>notificationsDialog?.close());
renderNotificationShell_(0);

function switchView(viewId){
  const previousView=document.querySelector('.view.active')?.id || '';
  const navView=viewId;

  forcePlannerPageTop_();

  document.querySelectorAll('.nav-btn').forEach(x=>x.classList.toggle('active',x.dataset.view===navView));
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===viewId));

  if(viewId==='plannerView'){
    if(previousView!=='plannerView') plannerUserPositioned=false;

    syncPlannerPageLock_();
    forcePlannerPageTop_();

    requestAnimationFrame(()=>{
      forcePlannerPageTop_();
      syncPlannerGridViewport_();

      if(!plannerUserPositioned){
        positionPlannerInitial_(filteredPlannerEvents());
      }
    });
  }else{
    syncPlannerPageLock_();
    forcePlannerPageTop_();
    hidePlannerFloatingHeader_();
  }
}

document.querySelectorAll('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.view)));
document.querySelectorAll('[data-view-jump]').forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.viewJump)));

window.addEventListener('resize',()=>requestAnimationFrame(()=>{syncPlannerPageLock_();syncPlannerGridViewport_();}));
window.addEventListener('orientationchange',()=>setTimeout(()=>{syncPlannerPageLock_();syncPlannerGridViewport_();},80));

function currentThemePreference_(){ return localStorage.getItem('cc-theme-mode') || localStorage.getItem('cc-theme') || 'system'; }
function applyThemePreference_(pref=currentThemePreference_()){
  const isDark=pref==='dark' || (pref==='system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  document.body.classList.toggle('dark',!!isDark);
  const select=document.getElementById('settingsThemeMode');
  if(select) select.value=['system','light','dark'].includes(pref) ? pref : 'system';
}
applyThemePreference_();
window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{ if(currentThemePreference_()==='system') applyThemePreference_('system'); });
renderEvents();
renderPlanner();

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=231018').catch(()=>{}));
}






document.querySelectorAll('.view-mode-btn[data-mode]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const nextMode=btn.dataset.mode;
    if(nextMode===plannerMode) return;

    plannerMode=nextMode;
    localStorage.setItem('cc-planner-mode',plannerMode);
    plannerUserPositioned=false;
    syncPlannerPageLock_();
    forcePlannerPageTop_();
    positionPlannerInitial_(filteredPlannerEvents());
  });
});



(function installPullToRefresh_(){
  let startY=null;
  let distance=0;
  let running=false;

  const indicator=document.createElement('div');
  indicator.className='cc-pull-refresh-indicator';
  indicator.textContent='Frissítés…';
  document.body.appendChild(indicator);

  document.addEventListener('touchstart',event=>{
    const plannerViewport=
      event.target && event.target.closest
        ? event.target.closest('.planner-scroll-viewport')
        : null;

    if(
      window.scrollY>1 ||
      running ||
      !event.touches ||
      !event.touches.length ||
      (plannerViewport && plannerViewport.scrollTop>1)
    ){
      startY=null;
      return;
    }

    startY=event.touches[0].clientY;
    distance=0;
  },{passive:true});

  document.addEventListener('touchmove',event=>{
    if(startY===null || !event.touches || !event.touches.length) return;

    distance=Math.max(
      0,
      event.touches[0].clientY-startY
    );

    if(distance>75){
      indicator.textContent=
        distance>130
          ? 'Engedd el a frissítéshez'
          : 'Húzd lejjebb…';

      indicator.classList.add('show');
    }
  },{passive:true});

  document.addEventListener('touchend',async()=>{
    if(startY===null) return;

    const shouldRefresh=distance>130;

    startY=null;
    distance=0;

    if(!shouldRefresh){
      indicator.classList.remove('show');
      return;
    }

    running=true;
    indicator.textContent='Frissítés…';
    indicator.classList.add('show');

    try{
      if(ccRemoteConfigured_()){
        await loadBootstrap();
      }else{
        renderEvents();
        renderPlanner();
      }

      indicator.textContent='Frissítve';
    }catch(error){
      console.error(error);
      indicator.textContent='Nem sikerült frissíteni';
    }finally{
      window.setTimeout(()=>{
        indicator.classList.remove('show');
        running=false;
      },650);
    }
  },{passive:true});
})();


document.getElementById('homeRefreshBtn')?.addEventListener('click',async e=>{
  const btn=e.currentTarget;
  if(btn.disabled) return;
  btn.disabled=true;
  btn.classList.remove('refresh-error');
  btn.classList.add('is-refreshing');
  btn.setAttribute('aria-label','Adatok frissítése folyamatban');
  try{
    if(ccRemoteConfigured_()) await loadBootstrap();
    else { renderEvents(); renderPlanner(); }
    btn.setAttribute('aria-label','Adatok frissítve');
  }catch(err){
    console.error(err);
    btn.classList.add('refresh-error');
    btn.setAttribute('aria-label','Nem sikerült frissíteni');
  }finally{
    btn.classList.remove('is-refreshing');
    btn.disabled=false;
    setTimeout(()=>btn.classList.remove('refresh-error'),1300);
  }
});


function applySliderState(ev, state){
  if(isPast(ev)) return;
  if(state==='yes') setYes(ev);
  else if(state==='no') askCancel(ev);
  else neutralizeEvent(ev);
}

function bindSliderDrag(){
  document.querySelectorAll('.attendance-slider').forEach(slider=>{
    if(slider.dataset.dragBound==='1') return;
    slider.dataset.dragBound='1';

    let startX=0, dragging=false;
    const id=slider.dataset.slider;
    const event=events.find(x=>x.id===id);
    if(!event || isPast(event)) return;

    slider.addEventListener('pointerdown', e=>{
      if(e.target.closest('button')) return;
      dragging=true; startX=e.clientX;
      slider.setPointerCapture?.(e.pointerId);
    });

    slider.addEventListener('pointerup', e=>{
      if(!dragging) return;
      dragging=false;
      const dx=e.clientX-startX;
      const threshold=Math.max(24, slider.clientWidth*0.12);
      if(dx < -threshold) applySliderState(event,'yes');
      else if(dx > threshold) applySliderState(event,'no');
      else applySliderState(event,'none');
    });
  });
}




// ---------------------------------------------------------------------------
// Player V2.3.9.2 – Web Push / PWA notification subscription.
// Permission is requested only after an explicit user button press.
// ---------------------------------------------------------------------------
let ccPushBusy=false;
let ccPushLastRegisteredEndpoint='';

function ccPushConfigured_(){
  const c=ccConfig_();
  return c.PUSH_ENABLED===true && !!String(c.VAPID_PUBLIC_KEY||'').trim();
}
function ccPushSupported_(){
  return ccPushConfigured_() && window.isSecureContext && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}
function ccPushIsIos_(){ return /iphone|ipad|ipod/i.test(navigator.userAgent||''); }
function ccPushStandalone_(){ return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone===true; }
function ccPushBase64ToUint8_(base64String){
  const padding='='.repeat((4-base64String.length%4)%4);
  const base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');
  const raw=window.atob(base64);
  return Uint8Array.from([...raw].map(ch=>ch.charCodeAt(0)));
}
function ccPushPlatform_(){
  if(ccPushIsIos_()) return 'ios-pwa';
  if(/android/i.test(navigator.userAgent||'')) return 'android';
  return 'desktop-web';
}
function ccPushDeviceLabel_(){
  if(ccPushIsIos_()) return 'iPhone / iPad';
  if(/android/i.test(navigator.userAgent||'')) return 'Android';
  return 'Böngésző';
}
async function ccPushRegistration_(){
  if(!('serviceWorker' in navigator)) return null;
  try{
    const existing=await navigator.serviceWorker.getRegistration('./');
    if(existing) return existing;
    return await navigator.serviceWorker.register('./sw.js?v=231018');
  }catch(err){ console.warn('Push service worker hiba:',err); return null; }
}
async function ccPushBrowserSubscription_(){
  const reg=await ccPushRegistration_();
  return reg ? await reg.pushManager.getSubscription() : null;
}
function ccPushSetStatus_(message,state='neutral'){
  const text=document.getElementById('pushDeviceStatus');
  const card=document.getElementById('pushDeviceCard');
  if(text) text.textContent=message;
  if(card){ card.dataset.pushState=state; }
}
async function ccPushSyncUi_(){
  const enable=document.getElementById('pushEnableBtn');
  const disable=document.getElementById('pushDisableBtn');
  if(!enable || !disable) return;
  enable.hidden=false; disable.hidden=true;

  if(!ccPushConfigured_()){
    enable.hidden=true; ccPushSetStatus_('Az értesítési szolgáltatás még nincs aktiválva.','off'); return;
  }
  if(!window.isSecureContext){ enable.hidden=true; ccPushSetStatus_('Az értesítésekhez HTTPS kapcsolat szükséges.','error'); return; }
  if(ccPushIsIos_() && !ccPushStandalone_()){
    ccPushSetStatus_('iPhone-on előbb add a Club Controlt a Főképernyőhöz, majd az appból kapcsold be az értesítéseket.','info');
    enable.textContent='Értesítések bekapcsolása';
    return;
  }
  if(!ccPushSupported_()){
    enable.hidden=true; ccPushSetStatus_('Ez a böngésző nem támogatja a telefonos push értesítéseket.','off'); return;
  }
  if(Notification.permission==='denied'){
    enable.hidden=true; ccPushSetStatus_('Az értesítések le vannak tiltva a rendszer/böngésző beállításaiban.','error'); return;
  }
  try{
    const sub=await ccPushBrowserSubscription_();
    if(sub && Notification.permission==='granted'){
      enable.hidden=true; disable.hidden=false;
      ccPushSetStatus_('Aktív ezen az eszközön.','active');
      return;
    }
  }catch(err){ console.warn(err); }
  enable.textContent='Értesítések bekapcsolása';
  ccPushSetStatus_(Notification.permission==='granted'?'Engedélyezve, de ez az eszköz még nincs feliratkoztatva.':'Engedély szükséges ezen az eszközön.','info');
}
async function ccPushRegisterBackend_(subscription){
  if(!SUPABASE_ENABLED || !ccSupabase || !ccSupabaseSession || !subscription) return;
  const raw=subscription.toJSON();
  raw.userAgent=navigator.userAgent||'';
  raw.platform=ccPushPlatform_();
  const {error}=await ccSupabase.rpc('cc_player_push_register_v1',{
    p_subscription:raw,
    p_device_label:ccPushDeviceLabel_()
  });
  if(error) throw error;
  ccPushLastRegisteredEndpoint=String(raw.endpoint||'');
}
async function ccPushSyncExistingSubscription_(){
  if(!ccPushSupported_() || !SUPABASE_ENABLED || !ccSupabaseSession || Notification.permission!=='granted') return;
  try{
    const sub=await ccPushBrowserSubscription_();
    if(sub && sub.endpoint!==ccPushLastRegisteredEndpoint) await ccPushRegisterBackend_(sub);
  }catch(err){ console.warn('Push subscription szinkron hiba:',err); }
  await ccPushSyncUi_();
}
async function ccPushSubscribeCurrentDevice_(){
  if(ccPushBusy) return;
  ccPushBusy=true;
  const button=document.getElementById('pushEnableBtn');
  if(button) button.disabled=true;
  try{
    if(ccPushIsIos_() && !ccPushStandalone_()){
      ccPushSetStatus_('iPhone-on a Főképernyőre telepített Club Control appból engedélyezhető a push.','info');
      return;
    }
    if(!ccPushSupported_()) throw new Error('A készülék vagy böngésző nem támogatja a Web Push értesítéseket.');
    let permission=Notification.permission;
    if(permission!=='granted') permission=await Notification.requestPermission();
    if(permission!=='granted'){
      ccPushSetStatus_(permission==='denied'?'Az értesítéseket letiltottad. A rendszerbeállításokban engedélyezheted újra.':'Az értesítési engedély nem lett megadva.','error');
      return;
    }
    const reg=await ccPushRegistration_();
    if(!reg) throw new Error('A service worker nem érhető el.');
    let sub=await reg.pushManager.getSubscription();
    if(!sub){
      sub=await reg.pushManager.subscribe({
        userVisibleOnly:true,
        applicationServerKey:ccPushBase64ToUint8_(String(ccConfig_().VAPID_PUBLIC_KEY||''))
      });
    }
    await ccPushRegisterBackend_(sub);
    ccPushSetStatus_('Aktív ezen az eszközön.','active');
  }catch(err){
    console.error('Push bekapcsolási hiba:',err);
    ccPushSetStatus_(err?.message||'Nem sikerült bekapcsolni az értesítéseket.','error');
  }finally{
    ccPushBusy=false; if(button) button.disabled=false; await ccPushSyncUi_();
  }
}
async function ccPushDisableCurrentDevice_(){
  if(ccPushBusy) return;
  ccPushBusy=true;
  try{
    const sub=await ccPushBrowserSubscription_();
    if(sub && SUPABASE_ENABLED && ccSupabase && ccSupabaseSession){
      const {error}=await ccSupabase.rpc('cc_player_push_unregister_v1',{p_endpoint:sub.endpoint});
      if(error) throw error;
    }
    if(sub) await sub.unsubscribe();
    ccPushLastRegisteredEndpoint='';
    ccPushSetStatus_('Kikapcsolva ezen az eszközön.','off');
  }catch(err){ console.error(err); ccPushSetStatus_(err?.message||'Nem sikerült kikapcsolni.','error'); }
  finally{ ccPushBusy=false; await ccPushSyncUi_(); }
}
async function ccPushDeactivateBackendOnLogout_(){
  if(!ccPushSupported_() || !SUPABASE_ENABLED || !ccSupabase || !ccSupabaseSession) return;
  try{
    const sub=await ccPushBrowserSubscription_();
    if(sub) await ccSupabase.rpc('cc_player_push_unregister_v1',{p_endpoint:sub.endpoint});
  }catch(err){ console.warn('Push kijelentkezési takarítás hiba:',err); }
}
function ccPushOpenRequestedTarget_(){
  try{
    const url=new URL(location.href);
    const eventId=url.searchParams.get('ccEvent');
    const view=url.searchParams.get('ccView');
    const openNotifications=url.searchParams.has('ccNotifications');
    if(view==='profile') document.querySelector('[data-view="profileView"]')?.click();
    else if(view==='schedule') document.querySelector('[data-view="plannerView"]')?.click();
    if(eventId && events.some(e=>String(e.id)===String(eventId))) window.setTimeout(()=>openEventDialog(eventId),120);
    if(openNotifications) window.setTimeout(()=>openNotificationsDialog_(),120);
    if(eventId || view || openNotifications || url.searchParams.has('ccPush')){
      url.searchParams.delete('ccEvent'); url.searchParams.delete('ccView'); url.searchParams.delete('ccPush'); url.searchParams.delete('ccNotifications');
      history.replaceState({},'',url.pathname+url.search+url.hash);
    }
  }catch(_){ }
}

document.getElementById('pushEnableBtn')?.addEventListener('click',ccPushSubscribeCurrentDevice_);
document.getElementById('pushDisableBtn')?.addEventListener('click',ccPushDisableCurrentDevice_);

if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('message',event=>{
    if(event.data?.type==='CC_PUSH_RECEIVED') ccLoadNotifications_({force:true});
  });
}
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible' && ccSupabaseSession) ccLoadNotifications_({force:true});
});
window.addEventListener('focus',()=>{ if(ccSupabaseSession) ccLoadNotifications_({force:true}); });

function icsEscape_(value){
  return String(value??'')
    .replace(/\\/g,'\\\\')
    .replace(/\r?\n/g,'\\n')
    .replace(/,/g,'\\,')
    .replace(/;/g,'\\;');
}
function icsLocalStamp_(dateObj){
  const p=n=>String(n).padStart(2,'0');
  return `${dateObj.getFullYear()}${p(dateObj.getMonth()+1)}${p(dateObj.getDate())}T${p(dateObj.getHours())}${p(dateObj.getMinutes())}${p(dateObj.getSeconds())}`;
}
function icsUtcStamp_(dateObj=new Date()){
  const p=n=>String(n).padStart(2,'0');
  return `${dateObj.getUTCFullYear()}${p(dateObj.getUTCMonth()+1)}${p(dateObj.getUTCDate())}T${p(dateObj.getUTCHours())}${p(dateObj.getUTCMinutes())}${p(dateObj.getUTCSeconds())}Z`;
}
function calendarEventLocation_(e){
  if(e.matchKind==='away' && e.address) return String(e.address).trim();
  const place=String(e.place||'').trim();
  const court=compactCourtLabel_(e);
  if(place && court!=='–' && !place.toLowerCase().includes(court.toLowerCase())) return `${place} • ${court}`;
  return place || (court==='–'?'':court) || '';
}
function calendarEventSummary_(e){
  const team=String(currentTeamData?.teamName||currentTeamData?.name||'BEAC').trim();
  if(e.type==='Edzés') return `${team} – Edzés`;
  return String(e.title||`${team} – Meccs`).trim();
}
function calendarEventDescription_(e){
  const lines=[typeLabel(e)];
  if(e.meeting) lines.push(`Találkozó: ${e.meeting}`);
  lines.push('Club Control');
  return lines.join('\n');
}
function buildCalendarIcs_(){
  const rows=(events||[]).slice().sort((a,b)=>eventStart(a)-eventStart(b));
  const now=icsUtcStamp_();
  const body=rows.map(e=>{
    const start=eventStart(e);
    let end=eventEnd(e);
    if(!(end instanceof Date) || Number.isNaN(end.getTime()) || end<=start){
      end=new Date(start.getTime()+(e.type==='Meccs'?2:2)*60*60*1000);
    }
    const uid=`${String(e.id||crypto?.randomUUID?.()||Date.now()).replace(/[^a-zA-Z0-9._-]/g,'-')}@club-control.beac`;
    return [
      'BEGIN:VEVENT',
      `UID:${icsEscape_(uid)}`,
      `DTSTAMP:${now}`,
      `DTSTART;TZID=Europe/Budapest:${icsLocalStamp_(start)}`,
      `DTEND;TZID=Europe/Budapest:${icsLocalStamp_(end)}`,
      `SUMMARY:${icsEscape_(calendarEventSummary_(e))}`,
      `LOCATION:${icsEscape_(calendarEventLocation_(e))}`,
      `DESCRIPTION:${icsEscape_(calendarEventDescription_(e))}`,
      `CATEGORIES:${icsEscape_(e.type==='Meccs'?'Meccs':'Edzés')}`,
      'END:VEVENT'
    ].join('\r\n');
  }).join('\r\n');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BEAC Club Control//Player Calendar Export//HU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsEscape_(String(currentTeamData?.teamName||currentTeamData?.name||'BEAC Club Control'))}`,
    'X-WR-TIMEZONE:Europe/Budapest',
    'BEGIN:VTIMEZONE',
    'TZID:Europe/Budapest',
    'X-LIC-LOCATION:Europe/Budapest',
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:+0100',
    'TZOFFSETTO:+0200',
    'TZNAME:CEST',
    'DTSTART:19700329T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0100',
    'TZNAME:CET',
    'DTSTART:19701025T030000',
    'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
    'END:STANDARD',
    'END:VTIMEZONE',
    body,
    'END:VCALENDAR',
    ''
  ].join('\r\n');
}
function calendarExportFilename_(){
  const team=String(currentTeamData?.teamName||currentTeamData?.name||'BEAC')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_|_$/g,'');
  return `${team||'BEAC'}_Club_Control_2026_27.ics`;
}
function setCalendarExportStatus_(text,tone='info'){
  const el=document.getElementById('calendarExportStatus');
  if(!el) return;
  el.textContent=text||'';
  el.dataset.tone=tone;
}
function calendarIcsFile_(){
  return new File([buildCalendarIcs_()],calendarExportFilename_(),{type:'text/calendar;charset=utf-8'});
}
function downloadCalendarIcs_(){
  const file=calendarIcsFile_();
  const url=URL.createObjectURL(file);
  const a=document.createElement('a');
  a.href=url;
  a.download=file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1500);
  return file;
}
async function exportAppleCalendar_(){
  if(!events?.length){ setCalendarExportStatus_('Nincs exportálható esemény.','error'); return; }
  const file=calendarIcsFile_();
  try{
    if(navigator.share && navigator.canShare?.({files:[file]})){
      await navigator.share({files:[file],title:'BEAC Club Control – naptár'});
      setCalendarExportStatus_(`${events.length} esemény átadva a megosztási panelnek.`,'ok');
      return;
    }
  }catch(error){
    if(error?.name==='AbortError') return;
    console.warn('Apple naptár megosztás hiba:',error);
  }
  downloadCalendarIcs_();
  setCalendarExportStatus_(`${events.length} esemény .ics fájlba exportálva. iPhone-on nyisd meg a fájlt a Naptárral.`,'ok');
}
function exportGoogleCalendar_(){
  if(!events?.length){ setCalendarExportStatus_('Nincs exportálható esemény.','error'); return; }
  downloadCalendarIcs_();
  setCalendarExportStatus_(`${events.length} esemény .ics fájlba exportálva. Google Calendarba számítógépen: Beállítások → Importálás és exportálás.`,'ok');
}

document.getElementById('calendarExportAppleBtn')?.addEventListener('click',()=>exportAppleCalendar_());
document.getElementById('calendarExportGoogleBtn')?.addEventListener('click',exportGoogleCalendar_);

const settingsDialog=document.getElementById('settingsDialog');
let currentPlayerSettings=null;
let ccSettingsSaveTimer=null;

function defaultSettingsPayload_(){
  return {
    theme:localStorage.getItem('cc-theme-mode')||'system',
    scheduleDefaultView:localStorage.getItem('cc-planner-default')||'last',
    language:'hu',
    detailedMode:false,
    avatarId:'',
    notifications:{
      new_training:true,
      training_change:true,
      weekly_response_reminder:true,
      same_day_response_reminder:true,
      new_match:true,
      match_change:true,
      payment:true
    }
  };
}
function collectSettingsUi_(){
  const notifications={};
  document.querySelectorAll('[data-notify-setting]').forEach(input=>{ notifications[input.dataset.notifySetting]=!!input.checked; });
  return {
    theme:document.getElementById('settingsThemeMode')?.value||'system',
    scheduleDefaultView:document.getElementById('settingsDefaultView')?.value||'last',
    language:document.getElementById('settingsLanguage')?.value||'hu',
    detailedMode:false,
    avatarId:currentAvatarId||'',
    notifications
  };
}
function updateNotificationTypesSummary_(){
  const inputs=[...document.querySelectorAll('[data-notify-setting]')];
  const enabled=inputs.filter(input=>input.checked).length;
  const summary=document.getElementById('notificationTypesSummary');
  if(summary) summary.textContent=`${enabled}/${inputs.length} bekapcsolva`;
}
function applySettingsUi_(value){
  const defaults=defaultSettingsPayload_();
  const settings={...defaults,...(value||{})};
  settings.notifications={...defaults.notifications,...((value||{}).notifications||{})};
  currentPlayerSettings=settings;
  const map={settingsThemeMode:settings.theme||'system',settingsDefaultView:settings.scheduleDefaultView||'last',settingsLanguage:settings.language||'hu'};
  Object.entries(map).forEach(([id,val])=>{const el=document.getElementById(id); if(el) el.value=val;});
  if(PLAYER_AVATAR_IDS.has(String(settings.avatarId||''))) currentAvatarId=String(settings.avatarId);
  else currentAvatarId='';
  avatarPickerMode=currentAvatarId ? 'avatar' : 'monogram';
  document.querySelectorAll('[data-notify-setting]').forEach(input=>{ input.checked=settings.notifications[input.dataset.notifySetting]!==false; });
  updateNotificationTypesSummary_();
  renderAvatarPicker_();
}
async function savePlayerSettingsNow_(){
  const settings=collectSettingsUi_();
  currentPlayerSettings=settings;
  localStorage.setItem('cc-theme-mode',settings.theme);
  localStorage.setItem('cc-planner-default',settings.scheduleDefaultView);
  localStorage.removeItem('cc-detailed-mode');
  applyThemePreference_(settings.theme);
  detailedMode=false;

  if(SUPABASE_ENABLED && ccSupabase && currentPlayerData?.playerId){
    const {error}=await ccSupabase.from('player_settings').upsert({
      player_id:currentPlayerData.playerId,
      theme:settings.theme,
      schedule_default_view:settings.scheduleDefaultView,
      language:settings.language,
      detailed_mode:settings.detailedMode,
      avatar_id:settings.avatarId||null,
      notifications:settings.notifications
    },{onConflict:'player_id'});
    if(error) throw error;
  }
}
function scheduleSettingsSave_(){
  clearTimeout(ccSettingsSaveTimer);
  ccSettingsSaveTimer=setTimeout(()=>savePlayerSettingsNow_().catch(err=>console.warn('Beállítás mentési hiba:',err)),180);
}

document.getElementById('openSettingsBtn')?.addEventListener('click',()=>{
  ccPushSyncUi_().catch(()=>{});
  // Local theme preference is the current visual truth.
  // Merge it over any older remote settings before the dialog opens.
  const source=currentPlayerSettings||defaultSettingsPayload_();
  applySettingsUi_({...source,theme:currentThemePreference_()});
  settingsDialog.showModal();
  ccFocusPanelTitle_(settingsDialog,'settingsDialogTitle');
});
document.getElementById('closeSettingsBtn')?.addEventListener('click',async()=>{
  try{ await savePlayerSettingsNow_(); }catch(err){ console.warn(err); }
  settingsDialog.close();
});
document.getElementById('settingsDefaultView')?.addEventListener('change',e=>{
  localStorage.setItem('cc-planner-default',e.target.value);
  scheduleSettingsSave_();
});
document.getElementById('settingsThemeMode')?.addEventListener('change',e=>{
  localStorage.setItem('cc-theme-mode',e.target.value);
  applyThemePreference_(e.target.value);
  scheduleSettingsSave_();
});
document.getElementById('settingsLanguage')?.addEventListener('change',scheduleSettingsSave_);
document.querySelectorAll('[data-notify-setting]').forEach(el=>el.addEventListener('change',()=>{ updateNotificationTypesSummary_(); scheduleSettingsSave_(); }));
document.getElementById('avatarPickerGrid')?.addEventListener('click',event=>{
  const button=event.target.closest('[data-avatar-id]');
  if(!button) return;
  const next=String(button.dataset.avatarId||'');
  if(!PLAYER_AVATAR_IDS.has(next)) return;
  currentAvatarId=next;
  avatarPickerMode='avatar';
  if(currentPlayerData) currentPlayerData.avatarId=next;
  if(currentPlayerSettings) currentPlayerSettings.avatarId=next;
  renderAvatarPicker_();
  renderEvents();
  renderPlanner();
  scheduleSettingsSave_();
});
document.getElementById('avatarModeMonogramBtn')?.addEventListener('click',()=>{
  avatarPickerMode='monogram';
  currentAvatarId='';
  if(currentPlayerData) currentPlayerData.avatarId='';
  if(currentPlayerSettings) currentPlayerSettings.avatarId='';
  renderAvatarPicker_();
  renderEvents();
  renderPlanner();
  scheduleSettingsSave_();
});
document.getElementById('avatarModeAvatarBtn')?.addEventListener('click',()=>{
  avatarPickerMode='avatar';
  syncAvatarModeUi_();
});
document.getElementById('settingsRefreshBtn')?.addEventListener('click',async e=>{
  const old=e.currentTarget.textContent;
  e.currentTarget.textContent='… Frissítés';
  try{
    if(ccRemoteConfigured_()) await loadBootstrap();
    else { renderEvents(); renderPlanner(); }
    e.currentTarget.textContent='✓ Frissítve';
  }catch(err){
    console.error(err);
    e.currentTarget.textContent='! Hiba';
  }
  setTimeout(()=>e.currentTarget.textContent=old,1100);
});



const eventDialog=document.getElementById('eventDialog');
function escapeHtml_(value){
  return String(value??'')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function eventDialogRoster(e){
  return `<div class="dialog-roster"><div><b>Jönnek (${(e.yes||[]).length})</b><div class="chips">${(e.yes||[]).map(n=>rosterChipHtml_(n,'yes')).join('')}</div></div><div><b>Nem jönnek (${(e.no||[]).length})</b><div class="chips">${(e.no||[]).map(n=>rosterChipHtml_(n,'no')).join('')||'<span class="muted">–</span>'}</div></div><div><b>Még nem jelzett (${(e.unknown||[]).length})</b><div class="chips">${(e.unknown||[]).map(n=>rosterChipHtml_(n)).join('')}</div></div></div>`;
}
function eventNoteSection_(e, archived){
  const hasNote=!!String(e.note||'').trim();
  return `
    <details class="event-note-details" ${hasNote?'open':''}>
      <summary>
        <span class="event-note-summary-label"><svg class="event-note-bubble" viewBox="0 0 22 20" aria-hidden="true"><path d="M4 3.5h14a2.5 2.5 0 0 1 2.5 2.5v6.5A2.5 2.5 0 0 1 18 15H10l-4.8 3.2V15H4a2.5 2.5 0 0 1-2.5-2.5V6A2.5 2.5 0 0 1 4 3.5Z"/></svg> Megjegyzés az edzőnek</span>
        <span class="cc-outline-triangle event-note-triangle" aria-hidden="true"></span>
      </summary>
      <div class="event-note-content">
        <textarea id="eventCoachNote" ${archived?'disabled':''} maxlength="500" placeholder="Pl. Ma kb. 15 percet kések, mert órám van.">${escapeHtml_(e.note||'')}</textarea>
        <div class="event-note-actions">
          ${hasNote && !archived ? `<button class="ghost-btn danger-outline" type="button" data-event-note-delete="${e.id}">Megjegyzés törlése</button>` : ''}
          ${!archived ? `<button class="ghost-btn primary-note-btn" type="button" data-event-note-save="${e.id}">Megjegyzés mentése</button>` : ''}
        </div>
        ${archived ? '<small class="event-note-readonly">Lezárt esemény megjegyzése már nem módosítható.</small>' : ''}
      </div>
    </details>`;
}

function eventDialogDetails_(e){
  const court=compactCourtLabel_(e);
  if(e.matchKind==='away'){
    const venue=String(e.place||'').trim();
    const address=String(e.address||'').trim();
    return `<div class="event-dialog-details event-dialog-location">
      ${venue?`<p><b>Helyszín:</b> ${venue}</p>`:''}
      ${address?`<div class="event-dialog-address-row"><span><b>Cím:</b> ${address}</span>${mapLink(e)}</div>`:''}
      ${e.meeting?`<p><b>Találkozó:</b> ${e.meeting}</p>`:''}
    </div>`;
  }
  return `<div class="event-dialog-details event-dialog-location compact-home-location"><p><b>Pálya:</b> ${court}</p></div>`;
}

function openEventDialog(eventId){
  const e=events.find(x=>x.id===eventId); if(!e) return;
  const archived=isPast(e);
  document.getElementById('eventDialogContent').innerHTML=
    `<div class="event-dialog-title">
      <div class="bare-icon large-symbol">${typeIcon(e)}</div>
      <div>
        <div class="event-type">${typeLabel(e)}</div>
        <h3>${e.title}</h3>
        <p>${e.date} • ${e.day} • ${e.time}</p>
      </div>
      <strong class="${attendanceCountClass((e.yes||[]).length)}">${(e.yes||[]).length} fő</strong>
    </div>
    ${eventDialogDetails_(e)}
    <div class="event-dialog-slider">${plannerStatusControls(e,archived)}</div>
    ${eventNoteSection_(e,archived)}
    ${eventDialogRoster(e)}`;
  if(!eventDialog.open) eventDialog.showModal();
  bindSliderDrag();
}
document.getElementById('closeEventDialogBtn')?.addEventListener('click',()=>eventDialog.close());
document.getElementById('eventDialogContent')?.addEventListener('click',e=>{
  const saveBtn=e.target.closest('[data-event-note-save]');
  if(saveBtn){
    const ev=events.find(x=>x.id===saveBtn.dataset.eventNoteSave);
    if(!ev || isPast(ev)) return;
    const note=document.getElementById('eventCoachNote')?.value.trim()||'';
    persist(ev,ev.status,note);
    setTimeout(()=>openEventDialog(ev.id),0);
    return;
  }

  const deleteBtn=e.target.closest('[data-event-note-delete]');
  if(deleteBtn){
    const ev=events.find(x=>x.id===deleteBtn.dataset.eventNoteDelete);
    if(!ev || isPast(ev)) return;
    persist(ev,ev.status,'');
    setTimeout(()=>openEventDialog(ev.id),0);
    return;
  }

  const b=e.target.closest('[data-slider-action]'); if(!b) return;
  const ev=events.find(x=>x.id===b.dataset.id); if(!ev || isPast(ev)) return;
  if(b.dataset.sliderAction==='yes') setYes(ev);
  else if(b.dataset.sliderAction==='no'){ eventDialog.close(); askCancel(ev); return; }
  else neutralizeEvent(ev);
  setTimeout(()=>openEventDialog(ev.id),0);
});


function enableBackdropDismiss(dialog, onClose){
  if(!dialog) return;
  dialog.addEventListener('click',e=>{
    if(e.target!==dialog) return;
    dialog.close();
    if(typeof onClose==='function') onClose();
  });
}

enableBackdropDismiss(document.getElementById('notificationsDialog'));
enableBackdropDismiss(document.getElementById('settingsDialog'));
enableBackdropDismiss(document.getElementById('eventDialog'));
enableBackdropDismiss(document.getElementById('cancelDialog'),()=>{
  pendingCancel=null;
  const note=document.getElementById('cancelNote');
  if(note) note.value='';
});

/* PLAYER CORE V2 — dual backend adapter.
   Stable UI stays unchanged. DATA_BACKEND='supabase' switches only auth/data. */
const CC_CONFIG = ccConfig_();
const API_URL = String(CC_CONFIG.API_URL || '').trim();
const SUPABASE_URL = String(CC_CONFIG.SUPABASE_URL || '').trim();
const SUPABASE_PUBLISHABLE_KEY = String(CC_CONFIG.SUPABASE_PUBLISHABLE_KEY || '').trim();
const SUPABASE_ENABLED = ccSupabaseConfigured_();

const SESSION_KEY = 'cc-session-token-v1';
let currentSessionToken = localStorage.getItem(SESSION_KEY) || '';
let pendingLoginEmail = '';
let ccSupabase = null;
let ccSupabaseSession = null;
let ccRealtimeChannel = null;
let ccRealtimeTeamId = '';
let ccRealtimeRefreshTimer = null;

if(SUPABASE_ENABLED){
  if(!window.supabase || typeof window.supabase.createClient!=='function'){
    console.error('Supabase klienskönyvtár nem töltődött be.');
  }else{
    ccSupabase = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
      }
    );
  }
}

function showLoginStep(step){
  const overlay=document.getElementById('loginOverlay');
  if(!overlay) return;
  overlay.classList.remove('hidden');
  ['loginLoadingStep','loginEmailStep','loginCodeStep'].forEach(id=>{
    document.getElementById(id)?.classList.toggle('hidden', id!==step);
  });
  if(step==='loginEmailStep') setTimeout(()=>document.getElementById('loginEmail')?.focus(),40);
  if(step==='loginCodeStep') setTimeout(()=>document.getElementById('loginCode')?.focus(),40);
}
function hideLogin(){ document.getElementById('loginOverlay')?.classList.add('hidden'); }
function clearSession(){
  currentSessionToken='';
  ccSupabaseSession=null;
  localStorage.removeItem(SESSION_KEY);
}
function setLoginMessage(id,text,isError=false){
  const el=document.getElementById(id); if(!el) return;
  el.textContent=text||'';
  el.classList.toggle('error',!!isError);
}
function normalizeLoginEmail(v){ return String(v||'').trim().toLowerCase(); }
function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function normalizeOtp(v){ return String(v||'').replace(/\D/g,'').slice(0,10); }

async function apiPost(payload){
  if(!API_URL) throw new Error('Nincs beállítva az API URL.');
  const r=await fetch(API_URL,{
    method:'POST',
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify(payload)
  });
  if(!r.ok) throw new Error('API '+r.status);
  const j=await r.json();
  if(!j.ok){
    const err=new Error(j.error||'Ismeretlen API hiba');
    err.code=j.errorCode||'';
    throw err;
  }
  return j;
}

function normalizeApiEvent(x){
  return {
    id:x.eventId,
    date:x.dateLabel || x.date,
    day:x.day || '',
    time:x.timeLabel || `${x.startTime||''}${x.endTime?'–'+x.endTime:''}`,
    type:(x.type==='match'||x.type==='Meccs')?'Meccs':'Edzés',
    matchKind:x.homeAway||'',
    title:String(x.title||'').trim().toLowerCase()==='csapatedzés' ? 'Edzés' : (x.title||'Edzés'),
    color:x.color||'',
    place:x.venue||'',
    address:x.address||'',
    court:x.court||'',
    startsAt:x.startsAt||x.starts_at||'',
    endsAt:x.endsAt||x.ends_at||'',
    meeting:x.meetingTime ? `${x.meetingTime}${x.meetingPlace?' • '+x.meetingPlace:''}` : '',
    month:x.monthKey||'',
    status:x.myStatus || null,
    note:x.myNote||'',
    yes:x.yesNames||[], no:x.noNames||[], unknown:x.unknownNames||[],
    archived:!!x.archived
  };
}

function applyBootstrap(j){
  if(!j || !Array.isArray(j.events)) throw new Error('Hibás eseményadat érkezett a szervertől.');

  const displayRows=Array.isArray(j.displayNames) ? j.displayNames : [];
  const displayById=new Map();
  const displayByName=new Map();

  displayRows.forEach(row=>{
    const playerId=String(row?.playerId || '').trim();
    const name=String(row?.name || '').trim();
    const displayName=String(row?.displayName || '').trim();
    if(playerId) displayById.set(playerId,displayName);
    if(name) displayByName.set(name,displayName);
  });

  const resolveDisplayName=(player)=>{
    const playerId=String(player?.playerId || player?.id || '').trim();
    const name=String(player?.name || '').trim();
    if(playerId && displayById.has(playerId)) return displayById.get(playerId) || '';
    if(name && displayByName.has(name)) return displayByName.get(name) || '';
    return '';
  };

  if(j.team){
    currentTeamData=j.team;
    document.getElementById('teamTitle').textContent=j.team.teamName || j.team.name || 'Csapat';
    const seasonEl=document.getElementById('teamSeason');
    if(seasonEl) seasonEl.textContent=j.team.season || '2026/27';
  }
  if(j.player){
    currentPlayerName=j.player.name||'Te';
    currentPlayerDisplayName=resolveDisplayName(j.player) || currentPlayerName;
    currentPlayerData={...j.player,displayName:currentPlayerDisplayName};

    document.getElementById('profileName').textContent=currentPlayerDisplayName;
    const profilePageTitle=document.getElementById('profilePageTitle');
    if(profilePageTitle) profilePageTitle.textContent=currentPlayerDisplayName;
    const profileFullName=document.getElementById('profileFullName');
    if(profileFullName) profileFullName.textContent=currentPlayerName;

    const meta=[playerPositionLabel_(j.player.position), j.player.jerseyNo ? '#'+j.player.jerseyNo : ''].filter(Boolean).join(' • ');
    document.getElementById('profileMeta').textContent=meta;
    document.getElementById('profileInitials').textContent=(currentPlayerDisplayName||'JT').split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase();

    const setRow=(rowId,valueId,value,hideIfEmpty=false)=>{
      const row=document.getElementById(rowId);
      const el=document.getElementById(valueId);
      const hasValue=value!==null && value!==undefined && String(value).trim()!=='';
      if(el && hasValue) el.textContent=String(value);
      if(row && hideIfEmpty) row.hidden=!hasValue;
    };
    setRow('profilePositionRow','profilePosition',playerPositionLabel_(j.player.position),false);
    setRow('profileJerseyNoRow','profileJerseyNo',j.player.jerseyNo,true);
    setRow('profileJerseySizeRow','profileJerseySize',j.player.jerseySize,true);
    setRow('profileShortsSizeRow','profileShortsSize',j.player.shortsSize,true);
    setRow('profileLicenseRow','profileLicense',j.player.licenseNo,false);
    setRow('profileMedicalRow','profileMedical',j.player.medicalValidUntil,false);
  }

  const accountEmail=document.getElementById('settingsAccountEmail');
  if(accountEmail) accountEmail.textContent=j.player?.email || ccSupabaseSession?.user?.email || '–';

  currentPlayerSettings=j.settings || currentPlayerSettings || defaultSettingsPayload_();
  applySettingsUi_(currentPlayerSettings);

  teamPlayerDirectory=Array.isArray(j.teamPlayers)
    ? j.teamPlayers.map(player=>({
        ...player,
        position:playerPositionLabel_(player.position),
        displayName:resolveDisplayName(player),
        avatarId:teamAvatarByPlayerId.get(String(player?.playerId||player?.id||'')) || ''
      }))
    : [];
  events=j.events.map(normalizeApiEvent).filter(e=>e.id && e.date);
  renderEvents();
  renderPlanner();
  renderProfileStats_();
}

function ccScheduleRealtimeRefresh_(){
  window.clearTimeout(ccRealtimeRefreshTimer);
  ccRealtimeRefreshTimer=window.setTimeout(async()=>{
    try{ await loadBootstrap({skipRealtimeSetup:true}); }
    catch(err){ console.warn('Realtime frissítés hiba:',err); }
  },120);
}

async function ccSetupRealtime_(team){
  if(!SUPABASE_ENABLED || !ccSupabase || !team || !team.id) return;
  if(ccRealtimeChannel && ccRealtimeTeamId===team.id) return;
  if(ccRealtimeChannel){
    try{ await ccSupabase.removeChannel(ccRealtimeChannel); }catch(_){ }
    ccRealtimeChannel=null;
  }
  ccRealtimeTeamId=team.id;
  await ccSupabase.realtime.setAuth();
  ccRealtimeChannel=ccSupabase
    .channel(`team:${team.id}:player`,{config:{private:true}})
    .on('broadcast',{event:'INSERT'},ccScheduleRealtimeRefresh_)
    .on('broadcast',{event:'UPDATE'},ccScheduleRealtimeRefresh_)
    .on('broadcast',{event:'DELETE'},ccScheduleRealtimeRefresh_)
    .subscribe(status=>{
      if(status==='CHANNEL_ERROR') console.warn('Realtime csatorna hiba');
    });
}

async function ccLoadProfileData_(){
  if(!SUPABASE_ENABLED || !ccSupabase){
    currentProfileData={attendance:[],payments:[],loaded:false};
    renderProfileStats_();
    renderProfilePayments_();
    return;
  }

  try{
    const [profileResult,overrideResult]=await Promise.all([
      ccSupabase.rpc('cc_player_profile_data'),
      ccSupabase.rpc('cc_player_payment_overrides_v2382')
    ]);
    if(profileResult.error) throw profileResult.error;
    const payload=typeof profileResult.data==='string' ? JSON.parse(profileResult.data) : (profileResult.data||{});
    let payments=Array.isArray(payload.payments) ? payload.payments.slice() : [];

    // V2.3.8.2: admin cash/manual overrides are a side-car, so the canonical
    // BEAC import can keep syncing without being mutated. The Player only sees
    // overrides belonging to the currently authenticated email.
    if(!overrideResult.error){
      const rawOverrides=typeof overrideResult.data==='string' ? JSON.parse(overrideResult.data) : overrideResult.data;
      const overrides=Array.isArray(rawOverrides) ? rawOverrides : [];
      const periodOf=row=>{
        const direct=String(row?.periodKey||row?.period||row?.month||'').slice(0,7);
        if(/^\d{4}-\d{2}$/.test(direct)) return direct;
        const due=String(row?.dueDate||'').slice(0,7);
        return /^\d{4}-\d{2}$/.test(due) ? due : '';
      };
      overrides.forEach(override=>{
        const type=String(override?.feeType||'');
        const period=periodOf(override);
        payments=payments.filter(row=>!(String(row?.feeType||'')===type && periodOf(row)===period));
        payments.push(override);
      });
    }else{
      console.warn('Fizetési override adatok nem érhetők el:',overrideResult.error);
    }

    currentProfileData={
      attendance:Array.isArray(payload.attendance) ? payload.attendance : [],
      payments,
      loaded:true
    };
  }catch(error){
    console.warn('Profil statisztika/fizetés adat még nem érhető el:',error);
    currentProfileData={attendance:[],payments:[],loaded:false};
  }

  renderProfileStats_();
  renderProfilePayments_();
}

async function loadBootstrap(options={}){
  if(SUPABASE_ENABLED){
    if(!ccSupabase) throw new Error('A Supabase kliens nem indult el.');
    const {data:{session},error:sessionError}=await ccSupabase.auth.getSession();
    if(sessionError) throw sessionError;
    if(!session) throw Object.assign(new Error('Nincs aktív munkamenet.'),{code:'AUTH_REQUIRED'});
    ccSupabaseSession=session;

    const {data,error}=await ccSupabase.rpc('cc_player_bootstrap');
    if(error) throw error;
    const payload = typeof data==='string' ? JSON.parse(data) : data;

    const {data:displayNameData,error:displayNameError}=await ccSupabase.rpc('cc_player_display_names');
    if(displayNameError) throw displayNameError;
    payload.displayNames=typeof displayNameData==='string'
      ? JSON.parse(displayNameData)
      : (Array.isArray(displayNameData) ? displayNameData : []);

    applyBootstrap(payload);
    await Promise.all([
      ccLoadProfileData_(),
      ccLoadAvatarDirectory_(),
      ccLoadNotifications_({force:true})
    ]);
    if(!options.skipRealtimeSetup) await ccSetupRealtime_(payload.team);
    hideLogin();
    ccPushSyncExistingSubscription_().catch(()=>{});
    ccPushOpenRequestedTarget_();
    return true;
  }

  if(!currentSessionToken) throw Object.assign(new Error('Nincs aktív munkamenet.'),{code:'AUTH_REQUIRED'});
  const j=await apiPost({action:'bootstrap',sessionToken:currentSessionToken});
  applyBootstrap(j);
  currentProfileData={attendance:[],payments:[],loaded:false};
  renderProfileStats_();
  renderProfilePayments_();
  hideLogin();
  return true;
}

async function startLogin(){
  const email=normalizeLoginEmail(document.getElementById('loginEmail')?.value);
  if(!validEmail(email)){
    setLoginMessage('loginMsg','Adj meg egy érvényes email címet.',true);
    return;
  }
  pendingLoginEmail=email;
  setLoginMessage('loginMsg','Kód küldése…');
  const btn=document.getElementById('requestCodeBtn'); if(btn) btn.disabled=true;
  try{
    if(SUPABASE_ENABLED){
      if(!ccSupabase) throw new Error('A Supabase kapcsolat nincs beállítva.');
      const {error}=await ccSupabase.auth.signInWithOtp({
        email,
        options:{shouldCreateUser:false}
      });
      if(error) throw error;
    }else{
      await apiPost({action:'requestLoginCode',email});
    }
    document.getElementById('loginEmailPreview').textContent=email;
    document.getElementById('loginCode').value='';
    setLoginMessage('loginCodeMsg','');
    showLoginStep('loginCodeStep');
  }catch(err){
    console.error(err);
    setLoginMessage('loginMsg','A kód küldése nem sikerült. Ellenőrizd, hogy a játékos fiókja létre van-e hozva.',true);
  }finally{ if(btn) btn.disabled=false; }
}

async function verifyLogin(){
  const code=normalizeOtp(document.getElementById('loginCode')?.value);
  const otpLengthOk = SUPABASE_ENABLED
    ? code.length>=6 && code.length<=10
    : code.length===6;
  if(!otpLengthOk){
    setLoginMessage(
      'loginCodeMsg',
      SUPABASE_ENABLED
        ? 'Írd be az emailben kapott teljes kódot.'
        : 'A kód 6 számjegyből áll.',
      true
    );
    return;
  }
  const btn=document.getElementById('verifyCodeBtn'); if(btn) btn.disabled=true;
  setLoginMessage('loginCodeMsg','Ellenőrzés…');
  try{
    if(SUPABASE_ENABLED){
      const {data,error}=await ccSupabase.auth.verifyOtp({
        email:pendingLoginEmail,
        token:code,
        type:'email'
      });
      if(error) throw error;
      ccSupabaseSession=data.session||null;
      if(!ccSupabaseSession) throw new Error('Nem érkezett munkamenet.');
    }else{
      const j=await apiPost({action:'verifyLoginCode',email:pendingLoginEmail,code});
      if(!j.sessionToken) throw new Error('Nem érkezett munkamenet-token.');
      currentSessionToken=j.sessionToken;
      localStorage.setItem(SESSION_KEY,currentSessionToken);
    }
    setLoginMessage('loginCodeMsg','Sikeres belépés.');
    await loadBootstrap();
  }catch(err){
    console.error(err);
    setLoginMessage('loginCodeMsg',err.message||'A belépés nem sikerült.',true);
  }finally{ if(btn) btn.disabled=false; }
}

async function initAccountSession(){
  if(!ccRemoteConfigured_()) return;
  showLoginStep('loginLoadingStep');

  if(SUPABASE_ENABLED){
    if(!ccSupabase){
      setLoginMessage('loginMsg','A Supabase kapcsolat nincs beállítva.',true);
      showLoginStep('loginEmailStep');
      return;
    }
    const {data:{session},error}=await ccSupabase.auth.getSession();
    if(error){ console.error(error); showLoginStep('loginEmailStep'); return; }
    ccSupabaseSession=session||null;
    if(!session){ showLoginStep('loginEmailStep'); return; }
    try{ await loadBootstrap(); }
    catch(err){
      console.error('Club Control Supabase session hiba:',err);
      if(String(err.message||'').includes('PLAYER_NOT_LINKED')){
        setLoginMessage('loginMsg','Ehhez az emailhez még nincs Player profil kapcsolva.',true);
      }
      showLoginStep('loginEmailStep');
    }
    return;
  }

  if(!currentSessionToken){ showLoginStep('loginEmailStep'); return; }
  try{ await loadBootstrap(); }
  catch(err){
    console.error('Club Control session hiba:',err);
    clearSession();
    setLoginMessage('loginMsg',err.code==='SESSION_EXPIRED'?'A munkamenet lejárt. Kérj új belépési kódot.':'Jelentkezz be a folytatáshoz.',false);
    showLoginStep('loginEmailStep');
  }
}

if(ccRemoteConfigured_()){
  document.getElementById('requestCodeBtn')?.addEventListener('click',startLogin);
  document.getElementById('loginEmail')?.addEventListener('keydown',e=>{if(e.key==='Enter') startLogin();});
  document.getElementById('verifyCodeBtn')?.addEventListener('click',verifyLogin);
  document.getElementById('loginCode')?.addEventListener('input',e=>{e.target.value=normalizeOtp(e.target.value);});
  document.getElementById('loginCode')?.addEventListener('keydown',e=>{if(e.key==='Enter') verifyLogin();});
  document.getElementById('changeEmailBtn')?.addEventListener('click',()=>{
    pendingLoginEmail='';
    setLoginMessage('loginMsg','');
    showLoginStep('loginEmailStep');
  });
  document.getElementById('resendCodeBtn')?.addEventListener('click',async()=>{
    if(!pendingLoginEmail) return showLoginStep('loginEmailStep');
    setLoginMessage('loginCodeMsg','Új kód küldése…');
    try{
      if(SUPABASE_ENABLED){
        const {error}=await ccSupabase.auth.signInWithOtp({email:pendingLoginEmail,options:{shouldCreateUser:false}});
        if(error) throw error;
      }else{
        await apiPost({action:'requestLoginCode',email:pendingLoginEmail});
      }
      document.getElementById('loginCode').value='';
      setLoginMessage('loginCodeMsg','Új kódot küldtünk.');
    }catch(err){ setLoginMessage('loginCodeMsg',err.message||'Nem sikerült új kódot küldeni.',true); }
  });

  if(SUPABASE_ENABLED && ccSupabase){
    ccSupabase.auth.onAuthStateChange((event,session)=>{
      ccSupabaseSession=session||null;
      if(event==='SIGNED_OUT') showLoginStep('loginEmailStep');
    });
  }

  initAccountSession();
}

let ccLogoutBusy=false;

function ccLogoutDialog_(){
  return document.getElementById('logoutDialog');
}

function ccSetLogoutStatus_(message,isError=false){
  const el=document.getElementById('logoutDialogStatus');
  if(!el) return;
  el.textContent=message||'';
  el.classList.toggle('error',!!isError);
}

function ccSetLogoutBusy_(busy){
  ccLogoutBusy=!!busy;
  ['logoutLocalBtn','logoutAllBtn','logoutCancelBtn','closeLogoutDialogBtn'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.disabled=ccLogoutBusy;
  });
}

function ccOpenLogoutDialog_(){
  const dialog=ccLogoutDialog_();
  if(!dialog) return;
  ccSetLogoutStatus_('');
  ccSetLogoutBusy_(false);
  if(typeof dialog.showModal==='function' && !dialog.open) dialog.showModal();
}

function ccCloseLogoutDialog_(){
  if(ccLogoutBusy) return;
  const dialog=ccLogoutDialog_();
  if(dialog?.open) dialog.close();
}

async function ccLogoutSupabase_(scope){
  if(ccLogoutBusy || !ccSupabase) return;
  ccSetLogoutBusy_(true);
  ccSetLogoutStatus_(scope==='global' ? 'Kijelentkezés minden eszközről…' : 'Kijelentkezés erről az eszközről…');
  try{
    if(scope==='global'){
      const {data,error}=await ccSupabase.rpc('cc_player_push_unregister_all_v1');
      if(error) throw error;
      if(!data || data.ok!==true) throw new Error('A push-eszközök kijelentkeztetése nem sikerült.');
      const {error:signOutError}=await ccSupabase.auth.signOut({scope:'global'});
      if(signOutError) throw signOutError;
    }else{
      try{ await ccPushDeactivateBackendOnLogout_(); }catch(error){ console.warn('Push kijelentkezési takarítás:',error); }
      const {error:signOutError}=await ccSupabase.auth.signOut({scope:'local'});
      if(signOutError) throw signOutError;
    }
    if(ccRealtimeChannel){
      try{ await ccSupabase.removeChannel(ccRealtimeChannel); }catch(_){ }
      ccRealtimeChannel=null;
    }
    clearSession();
    location.reload();
  }catch(error){
    console.error('Kijelentkezési hiba:',error);
    ccSetLogoutStatus_(error?.message||'A kijelentkezés nem sikerült.',true);
    ccSetLogoutBusy_(false);
  }
}

async function ccLogoutLegacy_(){
  if(ccLogoutBusy) return;
  ccSetLogoutBusy_(true);
  ccSetLogoutStatus_('Kijelentkezés…');
  try{
    const token=currentSessionToken;
    clearSession();
    try{ if(API_URL && token) await apiPost({action:'logout',sessionToken:token}); }catch(error){ console.warn(error); }
    location.reload();
  }catch(error){
    ccSetLogoutStatus_(error?.message||'A kijelentkezés nem sikerült.',true);
    ccSetLogoutBusy_(false);
  }
}

document.getElementById('logoutBtn')?.addEventListener('click',ccOpenLogoutDialog_);
document.getElementById('closeLogoutDialogBtn')?.addEventListener('click',ccCloseLogoutDialog_);
document.getElementById('logoutCancelBtn')?.addEventListener('click',ccCloseLogoutDialog_);
document.getElementById('logoutLocalBtn')?.addEventListener('click',()=>{
  if(SUPABASE_ENABLED && ccSupabase) ccLogoutSupabase_('local');
  else ccLogoutLegacy_();
});
document.getElementById('logoutAllBtn')?.addEventListener('click',()=>{
  if(SUPABASE_ENABLED && ccSupabase) ccLogoutSupabase_('global');
  else ccLogoutLegacy_();
});
ccLogoutDialog_()?.addEventListener('cancel',event=>{
  if(ccLogoutBusy) event.preventDefault();
});

async function ccSaveAvailabilitySupabase_(event,status,note=''){
  if(!ccSupabaseSession || !currentPlayerData?.playerId) throw new Error('Nincs aktív Player munkamenet.');
  const dbStatus = status==='yes' ? 'going' : status==='no' ? 'not_going' : 'unknown';
  const {error}=await ccSupabase
    .from('availability')
    .upsert({
      event_id:event.id,
      player_id:currentPlayerData.playerId,
      status:dbStatus,
      note:String(note||'')
    },{onConflict:'event_id,player_id'});
  if(error) throw error;
}

// Optimistic UI: local state changes immediately; the DB write follows in background.
const _persistLocal = persist;
persist = function(event,status,note=''){
  _persistLocal(event,status,note);
  renderProfileStats_();

  if(SUPABASE_ENABLED && ccSupabase){
    ccSaveAvailabilitySupabase_(event,status,note)
      .catch(err=>{
        console.error('Availability mentési hiba:',err);
        window.setTimeout(()=>loadBootstrap().catch(()=>{}),80);
      });
    return;
  }

  if(API_URL && currentSessionToken){
    apiPost({action:'setAvailability',sessionToken:currentSessionToken,eventId:event.id,status:status||'',note:note||''})
      .then(()=>loadBootstrap())
      .catch(err=>{
        console.error(err);
        if(['AUTH_REQUIRED','SESSION_EXPIRED','SESSION_INVALID'].includes(err.code)){
          clearSession();
          showLoginStep('loginEmailStep');
        }
      });
  }
};


function markCalendarToday(){
  const now=new Date();
  const key=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  document.querySelectorAll('[data-calendar-date]').forEach(el=>{
    el.classList.toggle('calendar-today', el.dataset.calendarDate===key);
  });
}



