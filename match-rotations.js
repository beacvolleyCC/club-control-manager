/* Club Control Manager · Meccs mód v1 · browser-only match tracking */
(function(){
'use strict';
const KEY='cc-manager-live-match-v1';
const NEXT=[0,6,1,2,3,4,5];
const ROLES=[
 ['setter','Feladó'],['outside-near','Közelebbi négyes'],
 ['middle-near','Közelebbi center'],['opposite','Átló'],
 ['outside-far','Távolabbi négyes'],['middle-far','Távolabbi center'],
 ['libero','Liberó'],['other','Egyéb']
];
let root=null,match=null,rosters=[],selection=null,editTarget=null,drag=null,imageUrl=null,screen='court',notice='';
const escapeHtml=v=>String(v==null?'':v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const integer=(n,def=0)=>Number.isInteger(Number(n))?Number(n):def;
const roleLabel=id=>ROLES.find(x=>x[0]===id)?.[1]||'Egyéb';
const emptyTracking=()=>({locked:false,starters:[],pairs:{},used:[],returned:[],subs:0,lastSubRally:-1,lastLiberoRally:-1,libero:null});
const defaultTeam=i=>({name:i===0?'A csapat':'B csapat',color:i===0?'#bd8b00':'#2783ba',teamId:'',nextId:7,spots:[1,2,3,4,5,6],players:Array.from({length:6},(_,j)=>({id:j+1,number:'',name:'',role:ROLES[j][0],sourceId:''})),tracking:emptyTracking()});
const defaultMatch=()=>({version:2,teams:[defaultTeam(0),defaultTeam(1)],score:[0,0],server:null,set:1,rally:0,events:[],eventSeq:1,history:[],lastAction:''});
function cleanTeam(raw,i){
 const t=defaultTeam(i);
 if(!raw||typeof raw!=='object')return t;
 t.name=String(raw.name??t.name).slice(0,65);
 t.color=/^#[0-9a-f]{6}$/i.test(raw.color||'')?raw.color:t.color;
 t.teamId=String(raw.teamId||'').slice(0,100);
 const seen=new Set();
 if(Array.isArray(raw.players))t.players=raw.players.slice(0,45).map(p=>{
   const id=integer(p?.id,-1);
   if(id<1||id>100000||seen.has(id))return null;
   seen.add(id);
   return {id,number:String(p.number||'').slice(0,3),name:String(p.name||'').slice(0,70),role:ROLES.some(r=>r[0]===p.role)?p.role:'other',sourceId:String(p.sourceId||'').slice(0,120)};
 }).filter(Boolean);
 const spots=Array.isArray(raw.spots)?raw.spots.map(x=>integer(x,-1)):[];
 if(spots.length===6&&new Set(spots).size===6&&spots.every(id=>seen.has(id)))t.spots=spots;
 else {
   // Corrupt or incomplete storage must not produce a partial rotation.
   t.players=defaultTeam(i).players;
   t.spots=[1,2,3,4,5,6];
 }
 t.nextId=Math.max(integer(raw.nextId,7),...t.players.map(p=>p.id+1),7);
 if(raw.tracking && typeof raw.tracking==='object'){
  const x=raw.tracking,ids=new Set(t.players.map(p=>p.id));
  const tr=emptyTracking();
  tr.locked=x.locked===true;
  tr.starters=Array.isArray(x.starters)?x.starters.map(Number).filter(id=>ids.has(id)).slice(0,6):[];
  if(tr.starters.length!==6||new Set(tr.starters).size!==6)tr.locked=false;
  tr.pairs=x.pairs&&typeof x.pairs==='object'?Object.fromEntries(Object.entries(x.pairs).filter(([k,v])=>ids.has(Number(k))&&ids.has(Number(v))).slice(0,6)):{};
  tr.used=Array.isArray(x.used)?x.used.map(Number).filter(id=>ids.has(id)):[];
  tr.returned=Array.isArray(x.returned)?x.returned.map(Number).filter(id=>ids.has(id)):[];
  tr.subs=Math.max(0,Math.min(6,integer(x.subs)));
  tr.lastSubRally=integer(x.lastSubRally,-1);
  tr.lastLiberoRally=integer(x.lastLiberoRally,-1);
  if(x.libero&&ids.has(Number(x.libero.liberoId))&&ids.has(Number(x.libero.replacedId)))tr.libero={liberoId:Number(x.libero.liberoId),replacedId:Number(x.libero.replacedId)};
  t.tracking=tr;
 }
 return t;
}
function load(){
 try{
  const raw=JSON.parse(localStorage.getItem(KEY)||'null');
  if(raw&&Array.isArray(raw.teams)&&raw.teams.length===2){
   const a=defaultMatch();
   a.teams=raw.teams.map(cleanTeam);
   if(Array.isArray(raw.score)&&raw.score.length===2)a.score=raw.score.map(n=>Math.min(999,Math.max(0,integer(n))));
   a.server=raw.server===0||raw.server===1?raw.server:null;
   a.set=Math.max(1,Math.min(9,integer(raw.set,1)));
   a.history=Array.isArray(raw.history)?raw.history.slice(-60):[];
   a.lastAction=String(raw.lastAction||'').slice(0,160);
   a.rally=Math.max(0,Math.min(500,integer(raw.rally,a.score[0]+a.score[1])));
   a.events=Array.isArray(raw.events)?raw.events.filter(x=>x&&typeof x==='object').slice(-800).map(x=>({
    seq:integer(x.seq),set:integer(x.set,1),score:Array.isArray(x.score)?x.score.slice(0,2).map(z=>integer(z)):null,
    kind:String(x.kind||'note').slice(0,24),text:String(x.text||'').slice(0,240),at:integer(x.at,0)
   })):[];
   a.eventSeq=Math.max(integer(raw.eventSeq,1),...a.events.map(x=>x.seq+1),1);
   if(a.rally>0)for(const team of a.teams)if(!team.tracking.locked){
    team.tracking.starters=team.spots.map(id=>id===team.tracking.libero?.liberoId?team.tracking.libero.replacedId:id);
    team.tracking.locked=true;
   }
   return a;
  }
 }catch(_){}
 return defaultMatch();
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(match))}catch(_){}}
function eventLog(kind,text){
 match.events.push({seq:match.eventSeq++,kind,text:String(text||'').slice(0,240),set:match.set,score:[...match.score],at:Date.now()});
 if(match.events.length>800)match.events.shift();
}
function lockLineups(){
 for(const t of match.teams){
  const tr=t.tracking;
  if(tr.locked)continue;
  tr.starters=t.spots.map(id=>id===tr.libero?.liberoId?tr.libero.replacedId:id);
  tr.locked=true;
 }
}
function leaveLibero(t,forced=false){
 const tr=t.tracking,active=tr.libero;
 if(!active)return false;
 const atPos=t.spots.indexOf(active.liberoId);
 if(atPos<0)return false;
 if(!forced && tr.lastLiberoRally===match.rally)return false;
 t.spots[atPos]=active.replacedId;
 tr.libero=null;tr.lastLiberoRally=match.rally;
 eventLog('libero',t.name+': liberó le, '+labelPlayer(t.players.find(p=>p.id===active.replacedId))+' vissza ('+(atPos+1)+'. hely).');
 return true;
}
function resetSetRules(){
 for(const t of match.teams){
  if(t.tracking.libero)leaveLibero(t,true);
  t.tracking=emptyTracking();
 }
 match.rally=0;
}
function snapshot(label){
 const {history,events,...current}=match;
 match.history.push(JSON.parse(JSON.stringify({...current,eventCount:events.length,lastAction:label})));
 if(match.history.length>60)match.history.shift();
}
function rotate(team){
 const next=[];
 for(let p=1;p<=6;p++)next[NEXT[p]-1]=team.spots[p-1];
 team.spots=next;
}
function current(team,pos){return team.players.find(p=>p.id===team.spots[pos-1])}
function standing(team){return team.players.filter(p=>!team.spots.includes(p.id))}
function labelPlayer(p){return (p.number?'#'+p.number+' ':'')+(p.name||roleLabel(p.role))}
function activityLog(){
 const events=match.events.slice().reverse();
 return '<section class="cc-match-history"><div class="cc-match-history-title"><h3>Eseménynapló</h3><span>'+match.events.length+' esemény</span></div>'+
 '<button type="button" class="cc-match-export" data-match-action="export-log" '+(!events.length?'disabled':'')+'>Eseménynapló exportálása (.csv)</button>'+
 '<div class="cc-match-history-list">'+(events.map(e=>
 '<div class="cc-match-history-entry"><span class="cc-match-history-type">'+escapeHtml(e.kind==='point'?'PONT':e.kind==='sub'?'CSERE':e.kind==='libero'?'LIBERÓ':e.kind==='rotation'?'FORGÁS':'ESEMÉNY')+'</span>'+
 '<span class="cc-match-history-text">'+escapeHtml(e.text)+'</span><small>'+e.set+'. szett'+(e.score?' · '+e.score.join(':'):'')+(e.at?' · '+new Date(e.at).toLocaleTimeString('hu-HU',{hour:'2-digit',minute:'2-digit'}):'')+'</small></div>').join('')||'<p>Még nincs rögzített esemény.</p>')+'</div>'+
 '<p class="cc-match-history-hint">A teljes meccsnapló megmarad ezen az eszközön (legfeljebb 800 esemény). Egy kattintással CSV-be exportálható.</p></section>';
}
function scoreboard(){
 return '<div class="cc-match-score"><div class="cc-match-heading"><div><h2>Meccs mód</h2><p>Pontozás, nyitásjog, forgások és cserék</p></div><span class="cc-match-set">'+match.set+'. játszma</span></div>'+
 '<div class="cc-match-score-grid">'+match.teams.map((t,i)=>
 '<section class="cc-match-score-team" style="--match-color:'+t.color+'"><b>'+escapeHtml(t.name)+'</b>'+
 '<div class="cc-match-bigscore">'+match.score[i]+'</div>'+
 '<div class="cc-match-serve">'+(match.server===i?'● NYIT':'')+'</div>'+
 '<div class="cc-match-sub-counter">Rendes cserék: <b>'+t.tracking.subs+'/6</b> · Liberó: '+(t.tracking.libero?'pályán':'padon')+'</div>'+
 '<button type="button" class="cc-match-point" data-match-action="point" data-side="'+i+'" '+(match.server===null?'disabled':'')+'>+1 PONT</button>'+
 '<button type="button" class="cc-match-serve-btn" data-match-action="server" data-side="'+i+'">'+(match.server===i?'Kezdő nyitó ✓':'Nyitás átadása')+'</button></section>').join('')+'</div>'+
 (match.server===null?'<p class="cc-match-start-hint">Először válaszd ki a nyitó csapatot. A pontot szerző fogadó csapat automatikusan egyet forog.</p>':'')+
 '<div class="cc-match-toolbar"><button type="button" data-match-action="undo" '+(!match.history.length?'disabled':'')+'>↶ Visszavonás</button>'+
 '<button type="button" data-match-action="new-set">Új játszma</button><button type="button" data-match-action="new-match">Új mérkőzés</button></div>'+
 (match.lastAction?'<p class="cc-match-last">'+escapeHtml(match.lastAction)+'</p>':'')+
 (notice?'<p class="cc-match-notice" role="status">'+escapeHtml(notice)+'</p>':'')+'</div>';
}
function courtPlayer(side,pos){
 const t=match.teams[side],p=current(t,pos),selected=selection&&selection.side===side&&selection.id===p.id;
 return '<div class="cc-match-player-wrap" data-match-drop="'+side+':'+pos+'">'+
 '<button type="button" draggable="true" data-match-action="court-player" data-match-source="'+side+':'+p.id+'" data-side="'+side+'" data-pos="'+pos+'" class="cc-match-player'+(selected?' selected':'')+'" title="'+escapeHtml(labelPlayer(p))+'">'+
 '<small>'+pos+'. hely</small><strong>'+escapeHtml(p.number||'–')+'</strong><span>'+escapeHtml(p.name||'Üres hely')+'</span><em>'+escapeHtml(roleLabel(p.role))+'</em></button>'+
 '<button type="button" data-match-action="edit-player" data-side="'+side+'" data-id="'+p.id+'" aria-label="Játékos szerkesztése" class="cc-match-edit">✎</button></div>';
}
function courtHalf(side){
 const t=match.teams[side];
 const rows=side===1?[[1,6,5],[2,3,4]]:[[4,3,2],[5,6,1]];
 return '<section class="cc-match-half" style="--match-color:'+t.color+'"><h3>'+escapeHtml(t.name)+'</h3><div class="cc-match-court">'+
 rows.map(r=>'<div class="cc-match-court-row">'+r.map(p=>courtPlayer(side,p)).join('')+'</div>').join('')+'</div></section>';
}
function rosterCard(side){
 const t=match.teams[side],bench=standing(t),teamOptions=rosters.map(r=>
 '<option value="'+escapeHtml(r.id)+'" '+(t.teamId===r.id?'selected':'')+'>'+escapeHtml(r.name)+'</option>').join('');
 return '<section class="cc-match-roster" style="--match-color:'+t.color+'"><header><h3>'+escapeHtml(t.name)+' · névsor</h3><span>'+bench.length+' csere</span></header>'+
 '<label class="cc-match-team-name">Csapat neve<input type="text" maxlength="65" data-match-team-name="'+side+'" value="'+escapeHtml(t.name)+'"></label><div class="cc-match-import-row"><select data-match-roster-select="'+side+'" aria-label="Club Control csapat választása"><option value="">BEAC csapat kiválasztása…</option>'+teamOptions+'</select>'+
 '<button type="button" data-match-action="load-roster" data-side="'+side+'">Betöltés</button></div>'+
 '<div class="cc-match-bench">'+(bench.map(p=>
 '<button type="button" draggable="true" data-match-source="'+side+':'+p.id+'" data-match-action="bench-player" data-side="'+side+'" data-id="'+p.id+'" class="cc-match-bench-player'+(selection?.side===side&&selection?.id===p.id?' selected':'')+'"><b>'+escapeHtml(p.number?'#'+p.number:'·')+'</b><span>'+escapeHtml(p.name||'Új játékos')+'</span>'+(p.role==='libero'?'<small class="cc-match-libero-pill">L</small>':'')+'</button>').join('')||'<p class="cc-match-no-bench">Nincs játékos a cserepadon.</p>')+'</div>'+
 '<div class="cc-match-roster-actions"><button type="button" data-match-action="add-player" data-side="'+side+'">+ Játékos hozzáadása</button>'+
 '<button type="button" data-match-action="import-text" data-side="'+side+'">Névsor szövegből / képernyőképről</button></div></section>';
}
function paint(){
 if(!root||!root.isConnected)return;
 root.innerHTML='<div class="cc-match-app">'+
 '<div class="cc-match-intro"><button type="button" data-match-action="clear-selection">Kijelölés törlése</button>'+
 '<span>'+(match.rally?'Felállás rögzítve · '+match.rally+' labdamenet':'Felállás szerkeszthető az első pontig')+' · cserepadról húzás vagy koppintás</span></div>'+
 scoreboard()+'<div class="cc-match-board">'+courtHalf(1)+'<div class="cc-match-net">HÁLÓ</div>'+courtHalf(0)+'</div>'+
 '<p class="cc-match-helper">Az első pont előtt szabadon rendezhető a kezdőfelállás. A meccs kezdetétől 6 rendes csere/szett érvényes. Liberócsere: csak hátsó sorban, a lecserélt játékos térhet vissza. Telefonon: cserejátékos, majd cél pályahely.</p>'+
 '<div class="cc-match-rosters">'+rosterCard(0)+rosterCard(1)+'</div>'+activityLog()+
 '<p class="cc-match-footnote">Segédlet, nem hivatalos jegyzőkönyv. Az eredmény és a csereadatok csak ebben a böngészőben tárolódnak.</p></div>';
}
function effect(message){notice=message;save();paint()}
function award(side){
 if(match.server===null){effect('A pontozás előtt jelöld ki a nyitó csapatot.');return}
 const serving=match.teams[match.server],serverPlayer=current(serving,1);
 if(serverPlayer?.role==='libero'){effect('A liberó az FIVB szabályai szerint nem nyithat. Előbb hozd vissza a helyére az általa váltott játékost.');return}
 snapshot('Pont');
 lockLineups();
 const prev=match.server;
 match.score[side]++;match.rally++;
 if(side!==prev){
  const t=match.teams[side],lib=t.tracking.libero;
  // A libero in position 5 must leave before the side-out rotation takes them to front-row 4.
  if(lib && t.spots.indexOf(lib.liberoId)===4)leaveLibero(t,true);
  rotate(t);match.server=side;
  match.lastAction=t.name+' pontot szerzett és forgott (nyitáscsere).';
 }else match.lastAction=match.teams[side].name+' pontot szerzett, nyitás marad.';
 eventLog('point',match.lastAction);
 notice='';save();paint();
}
function changePlayer(side,id,pos){
 const t=match.teams[side],player=t?.players.find(p=>p.id===id),atPos=integer(pos,-1);
 if(!player||atPos<1||atPos>6)return;
 const tr=t.tracking,from=t.spots.indexOf(id),to=atPos-1,old=current(t,atPos);
 if(from===to){selection=null;paint();return}
 const fail=msg=>{selection=null;effect(msg)};
 if(from>=0){
  if(tr.locked)return fail('A kezdőfelállás a labdamenetek után rögzített. Két pályán lévő játékos szabad felcserélése csak az első pont előtt lehetséges.');
  if(tr.libero)return fail('Aktív liberó mellett előbb a liberócserét fejezd be.');
  snapshot('Felállás módosítása');
  [t.spots[from],t.spots[to]]=[t.spots[to],t.spots[from]];
  match.lastAction=t.name+': felálláscsere ('+labelPlayer(player)+' ↔ '+labelPlayer(old)+').';
  eventLog('lineup',match.lastAction);
  selection=null;notice='';save();paint();return;
 }
 if(player.role==='libero'){
  if(tr.libero)return fail('Már van liberó a pályán. Előbb az eredeti játékosát kell visszahozni.');
  if(![1,5,6].includes(atPos))return fail('A liberó csak az 1., 5. vagy 6. (hátsó soros) helyre állhat be.');
  if(tr.lastLiberoRally===match.rally)return fail('Két liberócsere között legalább egy befejezett labdamenet szükséges.');
  snapshot('Liberó be');
  tr.libero={liberoId:id,replacedId:old.id};
  t.spots[to]=id;tr.lastLiberoRally=match.rally;
  match.lastAction=t.name+': '+labelPlayer(player)+' (liberó) be, '+labelPlayer(old)+' le, '+atPos+'. hely.';
  eventLog('libero',match.lastAction);
  selection=null;notice='';save();paint();return;
 }
 if(old.role==='libero'){
  if(!tr.libero||tr.libero.replacedId!==id)return fail('A liberót csak az általa váltott játékos hozhatja le.');
  if(tr.lastLiberoRally===match.rally)return fail('Két liberócsere között még nem volt befejezett labdamenet.');
  snapshot('Liberó le');
  if(!leaveLibero(t,false))return fail('A liberó visszacseréje nem sikerült.');
  match.lastAction=t.name+': '+labelPlayer(player)+' vissza a liberó helyére.';
  selection=null;notice='';save();paint();return;
 }
 if(tr.libero && tr.libero.replacedId===id)return fail('Ez a játékos jelenleg a liberó helyett a padon van; csak a liberó helyére térhet vissza.');
 if(!tr.locked){
  // Initial line-up selection, before the first rally: does not count as a substitution.
  snapshot('Kezdőfelállás');
  if(player.role==='other')player.role=old.role;
  t.spots[to]=id;
  match.lastAction=t.name+': '+labelPlayer(player)+' a kezdőfelállás '+atPos+'. helyére.';
  eventLog('lineup',match.lastAction);
  selection=null;notice='';save();paint();return;
 }
 if(tr.subs>=6)return fail(t.name+': elfogyott a 6 rendes csere ebben a játszmában.');
 if(tr.lastSubRally===match.rally)return fail('Egy csapat nem kérhet két külön rendes cserét ugyanabban a játékmegszakításban. Következő befejezett labdamenet után folytatható.');
 const oldStarter=tr.starters.includes(old.id),inStarter=tr.starters.includes(id);
 if(oldStarter){
  if(inStarter)return fail('Kezdőjátékos csak az őt korábban váltó cserejátékos helyére térhet vissza.');
  if(tr.pairs[old.id]||tr.returned.includes(old.id))return fail('Ez a kezdőjátékos már felhasználta a rendes cserelehetőségét.');
  if(tr.used.includes(id))return fail('Ez a cserejátékos már pályára lépett ebben a játszmában.');
  snapshot('Rendes csere');
  tr.pairs[old.id]=id;tr.used.push(id);
 }else{
  const starter=Number(Object.keys(tr.pairs).find(k=>tr.pairs[k]===old.id));
  if(!starter||id!==starter||tr.returned.includes(starter))return fail('A cserejátékost csak az eredetileg lecserélt kezdőjátékos válthatja vissza.');
  snapshot('Visszacsere');
  tr.returned.push(starter);
 }
 tr.subs++;tr.lastSubRally=match.rally;
 if(player.role==='other')player.role=old.role;
 t.spots[to]=id;
 match.lastAction=t.name+': '+labelPlayer(player)+' be, '+labelPlayer(old)+' le. ('+tr.subs+'/6 rendes csere)';
 eventLog('sub',match.lastAction);
 selection=null;notice='';save();paint();
}
function rosterFromManager(side){
 const sel=root.querySelector('[data-match-roster-select="'+side+'"]');
 const id=sel?.value||'',r=rosters.find(x=>x.id===id);
 if(!r){effect('Válassz ki egy elérhető BEAC-csapatot.');return}
 if(!r.players.length){effect('Ehhez a csapathoz nem látható játékosnévsor a Managerben.');return}
 const t=match.teams[side];
 if(match.score.some(x=>x>0)&&!confirm('A mérkőzés már tart. Betöltöd a névsort? A pályán álló játékosok megmaradnak.'))return;
 snapshot('Névsor betöltése');
 t.teamId=id;t.name=r.name;
 const keep=new Set(t.spots);
 t.players=t.players.filter(p=>keep.has(p.id)||(!p.sourceId && p.name));
 const existing=new Set(t.players.map(p=>p.sourceId).filter(Boolean));
 for(const player of r.players){
  if(existing.has(player.id)||t.players.length>=45)continue;
  t.players.push({id:t.nextId++,number:player.number,name:player.name,role:player.role||'other',sourceId:player.id});
  existing.add(player.id);
 }
 match.lastAction=r.name+': '+r.players.length+' kerettag elérhető a cserepadon.';
 notice='';save();paint();
}
function editorDialog(side,id){
 const t=match.teams[side],p=t.players.find(x=>x.id===id);
 if(!p)return;
 const old=root.querySelector('[data-match-dialog]');
 old?.remove();
 const html='<dialog class="cc-match-dialog" data-match-dialog><form class="cc-match-dialog-form" data-match-player-form data-side="'+side+'" data-id="'+id+'">'+
 '<div class="cc-match-dialog-heading"><h3>'+escapeHtml(t.name)+' · játékos</h3><button type="button" data-match-action="close-modal" aria-label="Bezárás">×</button></div>'+
 '<label>Mezszám<input name="number" type="text" inputmode="numeric" maxlength="3" value="'+escapeHtml(p.number)+'"></label>'+
 '<label>Név<input name="name" type="text" maxlength="70" value="'+escapeHtml(p.name)+'"></label>'+
 '<label>Poszt<select name="role">'+ROLES.map(r=>'<option value="'+r[0]+'"'+(r[0]===p.role?' selected':'')+'>'+escapeHtml(r[1])+'</option>').join('')+'</select></label>'+
 '<div class="cc-match-dialog-actions"><button type="button" data-match-action="close-modal">Mégse</button><button type="submit">Mentés</button></div></form></dialog>';
 root.insertAdjacentHTML('beforeend',html);
 const dialog=root.querySelector('[data-match-dialog]');dialog?.showModal?.();
}
function importDialog(side){
 const t=match.teams[side],old=root.querySelector('[data-match-dialog]');old?.remove();
 const html='<dialog class="cc-match-dialog" data-match-dialog><div class="cc-match-dialog-form">'+
 '<div class="cc-match-dialog-heading"><h3>'+escapeHtml(t.name)+' · névsorimport</h3><button type="button" data-match-action="close-modal" aria-label="Bezárás">×</button></div>'+
 '<p>iPhone-on a képernyőképen jelöld ki a szöveget az Élő szöveg funkcióval, majd illeszd be. A felismerést a rendszer nem küldi szerverre.</p>'+
 '<label>Képernyőkép megtekintése<input type="file" accept="image/*" data-match-image></label><div data-match-image-preview></div>'+
 '<label>Másolt vagy kézzel beírt névsor<textarea data-match-roster-text rows="7" placeholder="12 Kovács Anna&#10;8 Nagy Éva"></textarea></label>'+
 '<p class="cc-match-dialog-tip">Soronként mezszám és név. A hibás felismert sorokat ellenőrizd, mielőtt betöltöd.</p>'+
 '<div class="cc-match-dialog-actions"><button type="button" data-match-action="parse-import" data-side="'+side+'">Ellenőrzés</button><button type="button" data-match-action="close-modal">Bezárás</button></div>'+
 '<div data-match-import-preview></div></div></dialog>';
 root.insertAdjacentHTML('beforeend',html);
 root.querySelector('[data-match-dialog]')?.showModal?.();
}
function parseRoster(text){
 const parsed=[],seen=new Set();
 for(const line of String(text||'').split(/\r?\n/)){
  const clean=line.trim().replace(/\s+/g,' ');
  let m=clean.match(/^#?(\d{1,3})[\s.:;,)\-–]+(.{3,70})$/);
  let num='',name='';
  if(m){num=m[1];name=m[2]}
  else {m=clean.match(/^(.{3,70}?)\s+[#(](\d{1,3})\)?$/);if(m){name=m[1];num=m[2]}}
  name=name.replace(/^\W+|\W+$/g,'').trim();
  if(!name||!/\p{L}/u.test(name)||/^(játékos|név|csapat|mezszám|született|edző)/i.test(name))continue;
  const key=num+'|'+name.toLocaleLowerCase('hu-HU');
  if(seen.has(key))continue;seen.add(key);
  parsed.push({number:num,name:name.slice(0,70)});
  if(parsed.length===40)break;
 }
 return parsed;
}
function importPreview(side){
 const input=root.querySelector('[data-match-roster-text]');
 const list=parseRoster(input?.value);
 const preview=root.querySelector('[data-match-import-preview]');
 if(!preview)return;
 if(!list.length){preview.innerHTML='<p class="cc-match-parse-error">Nem találtam felismerhető mezszám–név sorokat. Ellenőrizd a bemásolt szöveget.</p>';return}
 preview.innerHTML='<p>Importálás előtt ellenőrizd az adatokat ('+list.length+' fő):</p>'+
 '<div class="cc-match-import-list">'+list.map(p=>'<span><b>#'+escapeHtml(p.number)+'</b> '+escapeHtml(p.name)+'</span>').join('')+'</div>'+
 '<button type="button" data-match-action="confirm-import" data-side="'+side+'">'+list.length+' játékos hozzáadása</button>';
}
function importText(side){
 const input=root.querySelector('[data-match-roster-text]'),rows=parseRoster(input?.value),t=match.teams[side];
 if(!rows.length)return;
 snapshot('Szöveges névsor');
 const existing=new Set(t.players.map(p=>p.number+'|'+p.name.toLocaleLowerCase('hu-HU')));
 let added=0;
 for(const p of rows){
  if(t.players.length>=45)break;
  const key=p.number+'|'+p.name.toLocaleLowerCase('hu-HU');
  if(existing.has(key))continue;
  t.players.push({id:t.nextId++,number:p.number,name:p.name,role:'other',sourceId:''});
  existing.add(key);added++;
 }
 match.lastAction=t.name+': '+added+' játékos importálva.';
 closeDialog(false);effect('A névsor a cserepadon elérhető. Húzd a játékosokat a pályára.');
}
function closeDialog(repaint=true){
 root.querySelector('[data-match-dialog]')?.close?.();root.querySelector('[data-match-dialog]')?.remove?.();
 if(imageUrl){URL.revokeObjectURL(imageUrl);imageUrl=null}
 if(repaint)paint();
}
function onClick(event){
 const b=event.target.closest('[data-match-action]');
 if(!b||!root.contains(b))return;
 const act=b.dataset.matchAction,side=integer(b.dataset.side,-1),id=integer(b.dataset.id,-1),team=match.teams[side];
 if(act==='point'&&team){award(side);return}
 if(act==='server'&&team){
  snapshot('Nyitásjog');match.server=side;match.lastAction=team.name+' nyit.';eventLog('server',match.lastAction);notice='';save();paint();return;
 }
 if(act==='undo'){
  const previous=match.history.pop();if(!previous)return;
  const remaining=match.history,events=match.events;
  match={...previous,history:remaining,events:typeof previous.eventCount==='number'?events.slice(0,previous.eventCount):(Array.isArray(previous.events)?previous.events:events)};
  delete match.eventCount;selection=null;notice='';save();paint();return;
 }
 if(act==='new-set'){
  if(!confirm('Új játszmát indítasz? A pontok és a rendes cserék száma nullázódik. A névsor megmarad, a liberó visszamegy a padra.'))return;
  snapshot('Új játszma');resetSetRules();match.set++;match.score=[0,0];match.server=null;match.lastAction='Új játszma: a hat rendes csere ismét elérhető.';eventLog('set',match.lastAction);selection=null;notice='';save();paint();return;
 }
 if(act==='new-match'){
  if(!confirm('Új mérkőzést indítasz? A korábbi eseménynapló és pontszám törlődik! A névsor és felállás megmarad. Exportáld a naplót előtte, ha szükséged van rá.'))return;
  resetSetRules();match.score=[0,0];match.server=null;match.set=1;match.history=[];match.events=[];match.eventSeq=1;match.lastAction='Új mérkőzés. Válaszd ki a nyitó csapatot.';
  selection=null;notice='';save();paint();return;
 }
 if(act==='bench-player'&&team){selection={side,id};notice='Válaszd ki a cél pályahelyet ('+team.name+').';paint();return}
 if(act==='court-player'&&team){
  const pos=integer(b.dataset.pos,-1),p=current(team,pos);
  if(selection&&selection.side===side&&p){changePlayer(side,selection.id,pos);return}
  selection={side,id:p.id};notice='Válassz másik pályahelyet a cseréhez, vagy egy cserejátékost.';paint();return;
 }
 if(act==='edit-player'&&team){editorDialog(side,id);return}
 if(act==='add-player'&&team){
  snapshot('Játékos felvétele');
  const p={id:team.nextId++,number:'',name:'',role:'other',sourceId:''};team.players.push(p);save();paint();editorDialog(side,p.id);return;
 }
 if(act==='load-roster'&&team){rosterFromManager(side);return}
 if(act==='import-text'&&team){importDialog(side);return}
 if(act==='parse-import'&&team){importPreview(side);return}
 if(act==='confirm-import'&&team){importText(side);return}
 if(act==='clear-selection'){selection=null;notice='';paint();return}
 if(act==='close-modal'){closeDialog();return}
}
function onSubmit(event){
 const form=event.target.closest('[data-match-player-form]');
 if(!form||!root.contains(form))return;
 event.preventDefault();
 const side=integer(form.dataset.side,-1),id=integer(form.dataset.id,-1),t=match.teams[side],p=t?.players.find(x=>x.id===id);
 if(!p)return;
 const val=n=>String(form.elements.namedItem(n)?.value||'');
 snapshot('Játékos szerkesztése');
 p.number=val('number').replace(/[^\d]/g,'').slice(0,3);
 p.name=val('name').trim().slice(0,70);
 const role=val('role');
 if(role==='libero'&&t.spots.includes(p.id)){
  notice='A liberót előbb a cserepadon jelöld ki, majd a hátsó sorba cseréld be.';
 }else if(t.tracking.libero?.liberoId===p.id&&role!=='libero'){
  notice='Az aktív liberó posztját csak a liberócsere után módosíthatod.';
 }else if(ROLES.some(r=>r[0]===role))p.role=role;
 match.lastAction=t.name+': '+labelPlayer(p)+' módosítva.';eventLog('edit',match.lastAction);closeDialog(false);save();paint();
}
function onChange(event){
 const f=event.target;
 if(f.matches?.('[data-match-team-name]')){
  const side=integer(f.dataset.matchTeamName,-1),t=match.teams[side];
  if(t){snapshot('Csapatnév módosítása');t.name=f.value.trim().slice(0,65)||t.name;match.lastAction='Csapat neve: '+t.name;save();paint()}
  return;
 }
 if(f.matches?.('[data-match-image]')){
  const preview=root.querySelector('[data-match-image-preview]'),file=f.files?.[0];
  if(imageUrl){URL.revokeObjectURL(imageUrl);imageUrl=null}
  if(file&&file.type.startsWith('image/')&&file.size<20*1024*1024){
    imageUrl=URL.createObjectURL(file);
    if(preview)preview.innerHTML='<img src="'+escapeHtml(imageUrl)+'" alt="Kiválasztott névsorkép" class="cc-match-import-image">';
  }
 }
}
function onDragStart(event){
 const el=event.target.closest?.('[data-match-source]');if(!el)return;
 const [side,id]=el.dataset.matchSource.split(':').map(Number);
 if(!match.teams[side]?.players.some(p=>p.id===id)){event.preventDefault();return}
 drag={side,id};
 try{event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain','cc-match-player')}catch(_){}
}
function onDragOver(event){if(drag&&event.target.closest?.('[data-match-drop]'))event.preventDefault()}
function onDrop(event){
 const target=event.target.closest?.('[data-match-drop]');if(!target||!drag)return;
 event.preventDefault();
 const [side,pos]=target.dataset.matchDrop.split(':').map(Number);
 if(side===drag.side)changePlayer(side,drag.id,pos);
 else effect('Játékos csak a saját csapatán belül helyezhető át.');
 drag=null;
}
function onPointerDown(event){
 if(event.pointerType==='mouse'||event.button!==0)return;
 const el=event.target.closest?.('.cc-match-bench-player');
 if(!el)return;
 const [side,id]=el.dataset.matchSource.split(':').map(Number);
 drag={side,id,x:event.clientX,y:event.clientY,pointerId:event.pointerId,active:false,source:el};
}
function onPointerMove(event){
 if(!drag||drag.pointerId!==event.pointerId)return;
 if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<12&&!drag.active)return;
 drag.active=true;
 event.preventDefault();
 if(!drag.ghost){
  const p=match.teams[drag.side]?.players.find(x=>x.id===drag.id);
  const span=document.createElement('div');span.className='cc-match-drag-ghost';span.textContent=labelPlayer(p||{});
  document.body.appendChild(span);drag.ghost=span;
 }
 drag.ghost.style.left=event.clientX+'px';drag.ghost.style.top=event.clientY+'px';
}
function onPointerUp(event){
 if(!drag||drag.pointerId!==event.pointerId)return;
 const wasActive=drag.active,side=drag.side,id=drag.id;
 drag.ghost?.remove();drag=null;
 if(!wasActive)return;
 event.preventDefault();
 const target=document.elementFromPoint(event.clientX,event.clientY)?.closest?.('[data-match-drop]');
 if(!target)return;
 const [targetSide,pos]=target.dataset.matchDrop.split(':').map(Number);
 if(side===targetSide)changePlayer(side,id,pos);
 else effect('A két csapat között nem lehet játékost áthúzni.');
}
function mount(element,options={}){
 root=element;if(!root)return;
 match=load();selection=null;notice='';drag=null;
 rosters=(Array.isArray(options.teams)?options.teams:[]).filter(x=>x&&x.id).map(t=>({
  id:String(t.id),name:String(t.name||'Csapat').slice(0,65),players:[]
 }));
 const available=Array.isArray(options.players)?options.players:[];
 for(const p of available){
  if(p.active===false)continue;
  const teamId=String(p.teamId||p.team_id||'');
  const r=rosters.find(x=>x.id===teamId);if(!r)continue;
  const id=String(p.playerId||p.id||'');if(!id)continue;
  r.players.push({id,name:String(p.displayName||p.name||'').slice(0,70),number:String(p.jerseyNo??p.jersey_no??p.jerseyNumber??'').slice(0,3),role:'other'});
 }
 for(const r of rosters){
  const seen=new Set();r.players=r.players.filter(p=>{if(seen.has(p.id))return false;seen.add(p.id);return true;})
   .sort((a,b)=>a.name.localeCompare(b.name,'hu')).slice(0,40);
 }
 root.addEventListener('click',onClick);
 root.addEventListener('submit',onSubmit);
 root.addEventListener('change',onChange);
 root.addEventListener('dragstart',onDragStart);
 root.addEventListener('dragover',onDragOver);
 root.addEventListener('drop',onDrop);
 root.addEventListener('dragend',()=>{drag?.ghost?.remove();drag=null});
 root.addEventListener('pointerdown',onPointerDown);
 root.addEventListener('pointermove',onPointerMove,{passive:false});
 root.addEventListener('pointerup',onPointerUp);
 root.addEventListener('pointercancel',()=>{drag?.ghost?.remove();drag=null});
 paint();
}
window.CCManagerMatch=Object.freeze({mount});
})();
