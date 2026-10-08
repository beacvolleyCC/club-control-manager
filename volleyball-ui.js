/* Club Control Manager – indoor volleyball live match screen v2 */
(function(){
'use strict';
const KEY='cc-manager-volleyball-match-v2';
const LEGACY_KEY='cc-manager-training-scoreboard-v1';
const core=window.CCVolleyballCore;
if(!core)throw new Error('A röplabda szabálymotor nem érhető el.');
const escape=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const unique=(prefix)=>prefix+Math.floor(Date.now()%100000000)+Math.floor(Math.random()*10000);
let model=null,root=null,projector=false,clockInterval=null,onFree=null;
const view={tab:'score',statsTeam:0,statsSkill:'serve',statsGrade:'ace',statsJersey:'',analysis:'all',subTeam:0,subPos:'1',subJersey:'',setupService:0};
const court=()=>model.courts.find(c=>c.id===model.selected)||model.courts[0];
function save(){
 try{localStorage.setItem(KEY,JSON.stringify(model));return true}
 catch(e){
  // Old undo snapshots may be dropped before any live match data is lost.
  for(let i=0;i<30;i++){
   const candidate=model.courts.filter(c=>c.history?.length).sort((x,y)=>y.history.length-x.history.length)[0];
   if(!candidate)break;
   candidate.history.shift();
   try{localStorage.setItem(KEY,JSON.stringify(model));say('A helyi tárhely megtelt: régi visszavonási lépések törölve. Érdemes JSON mentést készíteni.',true);return true}catch(_){}
  }
  say('Nem sikerült menteni a mérkőzést. Exportáld az adatokat JSON-fájlba, és ellenőrizd a böngészőtárhelyet.',true);
  console.warn('Volleyball local save:',e);
  return false;
 }
}
function fresh(){
 const c=core.newCourt(1);
 try{
  const v=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null')?.courts?.[0];
  if(v){c.name=String(v.name||c.name);c.names=[String(v.home||'A csapat'),String(v.away||'B csapat')]}
 }catch(_){}
 return {version:2,selected:'1',courts:[c],nextId:1};
}
function read(){
 try{
  const data=JSON.parse(localStorage.getItem(KEY)||'null');
  if(data?.version===2&&Array.isArray(data.courts)&&data.courts.length>0){
   data.courts=data.courts.slice(0,6).filter(c=>c&&c.active&&Array.isArray(c.sets)&&Array.isArray(c.names)&&c.timer);
   if(data.courts.length){data.selected=data.courts.some(c=>c.id===data.selected)?data.selected:data.courts[0].id;data.nextId=Math.max(Number(data.nextId)||0,...data.courts.map(c=>Number(c.id)||0));return data}
  }
 }catch(e){console.warn('Volleyball state restore:',e)}
 return fresh();
}
const say=(message,error=false)=>{const el=root?.querySelector('[data-vb-message]');if(el){el.textContent=message;el.classList.toggle('cc-vb-error',error)}};
function button(label,action,extra='',disabled=false){return '<button type="button" class="cc-counter-btn '+extra+'" data-vb-action="'+action+'"'+(disabled?' disabled':'')+'>'+label+'</button>'}
function zoneGrid(s,team,editable=false){
 const cells=[4,3,2,5,6,1];
 return '<div class="cc-vb-zones" aria-label="Pályahelyek 1–6">'+cells.map(pos=>{
  const jersey=(editable?s.startLineups:s.lineups)[team][pos-1]||'';
  return '<div class="cc-vb-zone '+(pos===1&&s.service===team?'server':'')+' '+(core.setterAt(s,team)?.position===pos?'cc-vb-setter-zone':'')+'"><small>'+pos+'. hely</small>'+
    (editable?'<input type="text" maxlength="12" inputmode="numeric" aria-label="'+team+' csapat, '+pos+'. hely, mezszám" data-vb-lineup="'+team+'-'+pos+'" value="'+escape(jersey)+'" placeholder="–">':
      '<strong>'+escape(jersey||'–')+'</strong>')+
    (pos===1&&s.service===team?'<em>NYIT</em>':'')+(core.setterAt(s,team)?.position===pos?'<em>FELADÓ</em>':'')+
   '</div>';
 }).join('')+'</div>';
}
function selectorRoster(s){
 return '<div class="cc-vb-lineups">'+[0,1].map(team=>'<div class="cc-vb-lineup-box"><div class="cc-vb-blockhead"><strong>'+escape(court().names[team])+'</strong><small>'+(!s.lineups[team].some(Boolean)?'Nincs felállás':'Háló felül')+'</small></div>'+zoneGrid(s,team,s.status==='setup')+'</div>').join('')+'</div>';
}
function clockMs(c){
 const t=c.timer,r=t.elapsedMs+(t.running?Math.max(0,Date.now()-t.since):0);
 return t.type==='countdown'?Math.max(0,t.durationMs-r):r;
}
function timeString(ms){const v=Math.floor(Math.max(0,ms)/1000),h=Math.floor(v/3600),m=Math.floor((v%3600)/60),s=v%60;return h?h+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0'):String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}
function paintClock(){
 if(!root||!root.isConnected)return;
 root.querySelectorAll('[data-vb-clock]').forEach(el=>{const c=model.courts.find(x=>x.id===el.dataset.vbClock);if(c)el.textContent=timeString(clockMs(c));});
 for(const c of model.courts){
  const t=c.timer;
  if(t.running&&t.type==='countdown'&&clockMs(c)===0){
   t.elapsedMs=t.durationMs;t.running=false;t.since=0;save();
   const btn=root.querySelector('[data-vb-action="toggle-clock"]');if(btn&&c.id===court().id)btn.textContent='▶ Indítás';
  }
 }
}
function clockHtml(c){
 return '<section class="cc-vb-clockcard"><div class="cc-vb-clockhead"><div><span class="cc-counter-small">Edzés / mérkőzés időmérő</span><output data-vb-clock="'+escape(c.id)+'" class="cc-counter-clock">'+timeString(clockMs(c))+'</output></div>'+
  '<select data-vb-clock-type aria-label="Időmérés módja"><option value="countdown"'+(c.timer.type==='countdown'?' selected':'')+'>Visszaszámláló</option><option value="stopwatch"'+(c.timer.type==='stopwatch'?' selected':'')+'>Stopper</option></select></div>'+
  '<div class="cc-vb-timebtns">'+button(c.timer.running?'Ⅱ Szünet':'▶ Indítás','toggle-clock','cc-counter-primary')+button('↺ Nullázás','reset-clock','cc-counter-quiet')+'</div>'+
  '<div class="cc-vb-timepresets">'+[5,10,15,20].map(x=>button(x+' perc','time-'+x,'cc-counter-quiet')).join('')+'<label><input data-vb-timecustom type="number" min="1" max="180" inputmode="numeric" value="'+Math.round(c.timer.durationMs/60000)+'" aria-label="Egyéni percszám">'+button('Beállít','time-custom','cc-counter-quiet')+'</label></div></section>';
}
function pointsHtml(c){
 const s=c.active;
 const wins=[0,1].map(side=>c.sets.filter(x=>x.winner===side).length+(s.status==='closed'&&s.winner===side?1:0));
 const live=s.status==='live',finished=live&&core.canClose(c),activeTeam=s.service,matchFinished=s.status==='closed'&&wins.some(n=>n>=Math.ceil(c.bestOf/2));
 return '<section class="cc-vb-scorecard"><div class="cc-vb-gameinfo"><strong>'+escape(s.number)+'. szett</strong><span>'+escape(s.status==='setup'?'Kezdés előtt':s.status==='closed'?(matchFinished?'Mérkőzés vége':'Lezárt szett'):finished?'Lezárható':'Folyamatban')+'</span></div>'+
 '<div class="cc-vb-scoregrid">'+[0,1].map(side=>'<div class="cc-vb-side '+(live&&activeTeam===side?'serving':'')+'">'+
  '<input type="text" data-vb-name="'+side+'" maxlength="60" aria-label="'+(side===0?'A':'B')+' csapat neve" value="'+escape(c.names[side])+'">'+
  '<strong class="cc-vb-pts">'+s.points[side]+'</strong>'+
  '<span class="cc-vb-sets">'+wins[side]+' nyert szett</span>'+
  '<span class="cc-vb-ball">'+(live&&activeTeam===side?'● Nyitás':' ')+'</span>'+
  '<div class="cc-vb-pointcontrols">'+button('−1','minus-'+side,'cc-vb-minus',!core.lastPointCorrection(c,side))+button('+1','point-'+side,'cc-vb-ptbtn',!live||finished)+'</div></div>').join('<span class="cc-vb-colon">:</span>')+'</div>'+
  '<div class="cc-vb-actions">'+button('↶ Visszavonás','undo','cc-counter-quiet',!c.history.length)+
  (s.status==='live'?button(finished?'Szett lezárása ✓':'Szett lezárása','close-set','cc-counter-quiet'):s.status==='closed'?(matchFinished?button('Meccs elemzése','show-analysis','cc-counter-primary')+button('További edzőszett','next-set','cc-counter-quiet'):button('Következő szett →','next-set','cc-counter-primary')): '')+
  button('Kivetítő','project','cc-counter-quiet')+'</div></section>';
}
function setterStripHtml(c){
 const s=c.active;
 if(s.status==='setup')return '';
 return '<section class="cc-vb-setterstrip" aria-label="Feladóállás az aktuális szettben">'+[0,1].map(team=>{
  const setter=core.setterAt(s,team);
  return '<div class="cc-vb-setterpill"><span>'+escape(c.names[team])+'</span>'+
    (setter?'<strong>'+escape(setter.label)+'</strong><small>Feladó: #'+escape(setter.jersey||'–')+' · '+setter.position+'. hely · '+(setter.front?'első sor':'hátsó sor')+'</small>':
     '<strong>–</strong><small>Feladó nincs megadva</small>')+'</div>';
 }).join('')+'</section>';
}
function setupHtml(c){
 const s=c.active;
 return '<section class="cc-vb-panel"><div class="cc-vb-blockhead"><div><h3>'+s.number+'. szett · kezdőfelállás</h3><p>Állítsd be a mezszámokat az 1–6-os helyre, majd válaszd ki, melyik helyen kezd a feladó.</p></div></div>'+
  '<div class="cc-vb-rulecols"><label>Szettek száma<select data-vb-bestof><option value="3"'+(c.bestOf===3?' selected':'')+'>2 nyert szett</option><option value="5"'+(c.bestOf===5?' selected':'')+'>3 nyert szett</option></select></label>'+
  '<label>Alapszett pontszáma<select data-vb-target>'+[15,21,25].map(v=>'<option value="'+v+'"'+(c.target===v?' selected':'')+'>'+v+' pont</option>').join('')+'</select></label></div>'+
  '<div class="cc-vb-label">Kezdő hatos (mezszámok az 1–6-os helyre)</div>'+selectorRoster(s)+
  '<div class="cc-vb-setterpicks">'+[0,1].map(side=>'<label><span>'+escape(c.names[side])+' · feladó kezdőhelye</span><select data-vb-setter="'+side+'" aria-label="'+escape(c.names[side])+' feladó kezdőhelye"><option value="">Nincs megadva</option>'+
   [1,2,3,4,5,6].map(pos=>'<option value="'+pos+'"'+(Number(s.setterStarts?.[side])===pos?' selected':'')+'>'+pos+'. hely (P'+pos+')</option>').join('')+'</select></label>').join('')+'</div>'+
  '<div class="cc-vb-startrow"><label>Kezdő nyitás<select data-vb-first-serve><option value="0"'+(view.setupService===0?' selected':'')+'>'+escape(c.names[0])+'</option><option value="1"'+(view.setupService===1?' selected':'')+'>'+escape(c.names[1])+'</option></select></label>'+
  button('Szett indítása','start-set','cc-counter-primary')+'</div><p class="cc-vb-note">Az ismeretlen ellenfél felállása és feladója üresen maradhat. A P1–P6 felirat a feladó tényleges forgáshelyét jelenti, nem az éppen nyitó csapatét.</p></section>';
}
function lineupsHtml(c){
 const s=c.active;if(s.status==='setup')return setupHtml(c);
 const server=s.lineups[s.service]?.[0],next=1-s.service,nextNo=s.lineups[next]?.[1]||'';
 const subs=(s.substitutions||[]).slice(-10).reverse();
 return '<section class="cc-vb-panel"><div class="cc-vb-blockhead"><div><h3>Aktuális forgás</h3><p>A nyitásjogot megszerző fogadó csapat elforog. A feladó helyét külön követjük.</p></div></div>'+
 '<div class="cc-vb-servebar"><span><b>Most nyit:</b> '+escape(c.names[s.service])+' · '+(server?'#'+escape(server):'ismeretlen')+'</span><small>Másik csapat következő nyitója: '+(nextNo?'#'+escape(nextNo):'–')+'</small></div>'+
 selectorRoster(s)+
 (s.status==='live'?'<div class="cc-vb-sub"><div class="cc-vb-label">Játékoscsere · kézi rögzítés</div><div class="cc-vb-subcontrols"><label>Csapat<select data-vb-subteam aria-label="Csere csapata"><option value="0"'+(view.subTeam===0?' selected':'')+'>'+escape(c.names[0])+'</option><option value="1"'+(view.subTeam===1?' selected':'')+'>'+escape(c.names[1])+'</option></select></label>'+
 '<label>Forgáshely<select data-vb-subpos aria-label="Cserélendő forgáshely">'+[1,2,3,4,5,6].map(p=>'<option value="'+p+'"'+(String(p)===view.subPos?' selected':'')+'>'+p+'. hely</option>').join('')+'</select></label>'+
 '<div class="cc-vb-subout">Lejövő: <output data-vb-subout>#'+escape(s.lineups[view.subTeam]?.[Number(view.subPos)-1]||'–')+'</output></div>'+
 '<label>Beálló mezszáma<input type="text" data-vb-subjersey maxlength="12" inputmode="numeric" aria-label="Beálló játékos mezszáma" placeholder="Mezszám" value="'+escape(view.subJersey)+'"></label>'+button('Csere rögzítése','substitute','cc-counter-primary')+'</div>'+
 '<small>Feladó cseréjénél a beálló automatikusan átveszi a feladó megjelölését az adott forgáshelyen. A hivatalos csere- és liberószabályok ellenőrzése még nincs beépítve.</small></div>':'')+
 '<div class="cc-vb-subhistory"><h4>Cserekövetés · '+s.substitutions.length+' rögzítés</h4>'+
 (subs.length?subs.map(x=>'<div><strong>'+escape(c.names[x.team])+'</strong><span>#'+escape(x.out)+' → #'+escape(x.in)+'</span><small>'+x.position+'. hely · '+(x.setterChange?'Feladócsere · ':'')+x.rallyIndex+'. labdamenet után</small></div>').join(''):'<p class="cc-vb-note">Ebben a szettben még nem rögzítettél cserét.</p>')+'</div></section>';
}
function statHtml(c){
 const s=c.active;
 const grades=core.SKILLS[view.statsSkill]||core.SKILLS.serve;
 const playerValues=new Set([...s.lineups[view.statsTeam],...s.substitutions.filter(x=>x.team===view.statsTeam).flatMap(x=>[x.out,x.in])].filter(Boolean));
 const last=s.rallies[s.rallies.length-1];
 return '<section class="cc-vb-panel"><div class="cc-vb-blockhead"><div><h3>Statisztika rögzítése</h3><p>Az események a legutóbb kiosztott ponthoz kapcsolódnak. Statisztikázás nem ad automatikusan pontot.</p></div></div>'+
 (!last?'<p class="cc-vb-note cc-vb-warning">Először rögzíts egy pontot a Pontozás fülön.</p>':'<div class="cc-vb-tag">Labdamenet '+last.index+' · '+last.scoreAfter.join(' : ')+' · '+escape(c.names[last.winner])+' pont</div>')+
 '<div class="cc-vb-stat-form"><label>Csapat<select data-vb-statteam>'+[0,1].map(i=>'<option value="'+i+'"'+(view.statsTeam===i?' selected':'')+'>'+escape(c.names[i])+'</option>').join('')+'</select></label>'+
 '<label>Játékos mezszáma<input list="cc-vb-rosterlist" data-vb-statjersey maxlength="12" inputmode="numeric" placeholder="pl. 12" value="'+escape(view.statsJersey)+'"><datalist id="cc-vb-rosterlist">'+Array.from(playerValues).map(x=>'<option value="'+escape(x)+'"></option>').join('')+'</datalist></label>'+
 '<label>Technikai elem<select data-vb-statskill>'+Object.entries({serve:'Nyitás',reception:'Nyitásfogadás',attack:'Támadás',block:'Sánc',dig:'Védekezés',set:'Feladás',other:'Egyéb'}).map(([key,label])=>'<option value="'+key+'"'+(view.statsSkill===key?' selected':'')+'>'+label+'</option>').join('')+'</select></label>'+
 '<label>Értékelés<select data-vb-statgrade>'+Object.entries(grades).map(([key,label])=>'<option value="'+key+'"'+(view.statsGrade===key?' selected':'')+'>'+escape(label)+'</option>').join('')+'</select></label></div>'+
 '<div class="cc-vb-statadd">'+button('+ Esemény rögzítése','add-stat','cc-counter-primary',s.status!=='live'||!last)+button('↶ Utolsó művelet visszavonása','undo','cc-counter-quiet',!c.history.length)+'</div>'+
 '<div class="cc-vb-blockhead"><h3>Utolsó események</h3></div>'+eventList(s.events.slice(-10).reverse(),c)+'</section>';
}
function eventList(events,c){
 return events.length?'<div class="cc-vb-eventlist">'+events.map(e=>'<div><b>#'+escape(e.jersey||'–')+' · '+escape(c.names[e.team])+'</b><span>'+escape((({serve:'Nyitás',reception:'Fogadás',attack:'Támadás',block:'Sánc',dig:'Védekezés',set:'Feladás',other:'Egyéb'})[e.skill]||e.skill))+' · '+escape(core.SKILLS[e.skill]?.[e.grade]||e.grade)+'</span><small>'+e.set+'. szett · '+e.rallyIndex+'. labdamenet</small></div>').join('')+'</div>':'<p class="cc-vb-note">Nincs rögzített statisztikai esemény.</p>';
}
function pct(a,b){return b?Math.round(a*100/b)+'%':'–'}
function analyticsHtml(c){
 const scopes=[{value:'all',text:'Teljes meccs'},{value:'current',text:'Aktuális szett'},...c.sets.map(x=>({value:String(x.number),text:x.number+'. szett'}))];
 const report=core.summary(c,view.analysis);
 return '<section class="cc-vb-panel"><div class="cc-vb-blockhead"><div><h3>Statisztika és elemzés</h3><p>Csak a rögzített eseményekből számolunk, a hiányzó adatot nem becsüljük.</p></div><select data-vb-analysis aria-label="Elemzés időszaka">'+scopes.map(x=>'<option value="'+x.value+'"'+(view.analysis===x.value?' selected':'')+'>'+x.text+'</option>').join('')+'</select></div>'+
  '<div class="cc-vb-reports">'+report.map((r,i)=>'<article class="cc-vb-report"><h4>'+escape(c.names[i])+'</h4><div class="cc-vb-metrics"><div><b>'+r.aces+'</b><small>Ász</small></div><div><b>'+r.kills+'</b><small>Támadáspont</small></div><div><b>'+r.blocks+'</b><small>Pontsánc</small></div><div><b>'+pct(r.sideout.won,r.sideout.total)+'</b><small>Side-out</small></div><div><b>'+pct(r.break.won,r.break.total)+'</b><small>Nyitástartás</small></div><div><b>'+ (r.attempts?((r.kills-r.attackErrors)/r.attempts*100).toFixed(1)+'%':'–')+'</b><small>Támadóhatékonyság</small></div></div><h5>Forgáslépés a szettkezdéshez képest</h5><div class="cc-vb-rotationstats">'+r.rotation.map(x=>'<span>'+x.rotation+'. · '+x.won+'/'+x.total+'</span>').join('')+'</div><h5>Játékosok</h5>'+
   '<div class="cc-vb-tablewrap"><table><thead><tr><th>Mez</th><th>Ász</th><th>Ütőpont</th><th>Ütőhiba</th><th>Tám. össz.</th><th>Sánc</th><th>Véd.</th><th>Feladás</th><th>Fogadás átlag</th></tr></thead><tbody>'+
    Object.values(r.players).map(p=>'<tr><td>#'+escape(p.jersey)+'</td><td>'+p.aces+'</td><td>'+p.kills+'</td><td>'+p.attackErrors+'</td><td>'+p.attempts+'</td><td>'+p.blocks+'</td><td>'+p.digs+'</td><td>'+p.assists+'</td><td>'+(p.receptionCount?(p.receptionSum/p.receptionCount).toFixed(2):'–')+'</td></tr>').join('')+
   '</tbody></table></div></article>').join('')+'</div>'+
 '<div class="cc-vb-blockhead"><h3>Szettek és eseménynapló</h3></div><div class="cc-vb-setlist">'+[...c.sets,c.active].map(x=>'<div><b>'+x.number+'. szett · '+x.points.join(' : ')+'</b><span>'+escape(x.status==='closed'?'Lezárt':x.status==='live'?'Élő':'Előkészítés')+'</span><small>'+x.rallies.length+' labdamenet · '+x.events.length+' esemény</small></div>').join('')+'</div>'+
  '<div class="cc-vb-export">'+button('CSV export','export-csv','cc-counter-quiet')+button('JSON mentés','export-json','cc-counter-quiet')+'</div></section>';
}
function projectorHtml(c){
 const s=c.active;
 return '<div class="cc-vb-projector" role="dialog" aria-label="Teljes képernyős eredményjelző" aria-modal="true"><div class="cc-vb-projecthead"><span>CLUB CONTROL · '+escape(c.name)+'</span>'+button('× Bezárás','close-project','cc-counter-quiet')+'</div><div class="cc-vb-projectscores">'+[0,1].map(side=>'<div><h2>'+escape(c.names[side])+'</h2><strong>'+s.points[side]+'</strong>'+(s.status==='live'&&s.service===side?'<small>● NYITÁS</small>':'')+'</div>').join('<i>:</i>')+'</div><div class="cc-vb-projectfoot"><span>'+s.number+'. SZETT · SZETTEK '+[0,1].map(side=>c.sets.filter(x=>x.winner===side).length+(s.status==='closed'&&s.winner===side?1:0)).join(' : ')+'</span><output data-vb-clock="'+escape(c.id)+'">'+timeString(clockMs(c))+'</output></div></div>';
}
function render(){
 if(!root||!root.isConnected)return;
 const c=court(),s=c.active;
 root.innerHTML='<div class="page-intro cc-page-header-panel"><div><h2>Röplabda · Meccsvezetés</h2><p>Forgáskövetés, szettenkénti kezdő hatos és élő statisztika.</p></div><span class="read-only-badge">HELYI MENTÉS</span></div>'+
  '<div class="cc-vb-topbar"><div class="cc-vb-courttabs">'+model.courts.map(x=>'<button type="button" data-vb-court="'+escape(x.id)+'" class="cc-vb-courttab '+(x.id===c.id?'active':'')+'">'+escape(x.name)+'</button>').join('')+
  button('+ Pálya','add-court','cc-counter-quiet',model.courts.length>=6)+'</div><div class="cc-vb-sportactions">'+button('Szabad pontozás','free-mode','cc-counter-quiet')+button('Új mérkőzés','reset-match','cc-counter-quiet')+'</div></div>'+
  '<div class="cc-vb-currentcourt"><label class="cc-counter-small" for="cc-vb-courtname">Pálya neve</label><input id="cc-vb-courtname" data-vb-courtname maxlength="60" value="'+escape(c.name)+'">'+(model.courts.length>1?button('Pálya törlése','remove-court','cc-counter-quiet'):'')+'</div>'+
  pointsHtml(c)+setterStripHtml(c)+
  '<nav class="cc-vb-tabnav" aria-label="Röplabda modul nézete">'+[['score','Forgás'],['stats','Statisztika'],['analysis','Elemzés']].map(([value,label])=>'<button type="button" data-vb-tab="'+value+'" class="'+(view.tab===value?'active':'')+'">'+label+'</button>').join('')+'</nav>'+
  (view.tab==='score'?lineupsHtml(c):view.tab==='stats'?statHtml(c):analyticsHtml(c))+
  clockHtml(c)+
  '<p data-vb-message class="cc-vb-message" role="status" aria-live="polite"></p>'+
  '<p class="cc-counter-footnote">Az eredmények jelenleg csak ezen a készüléken maradnak meg. Hivatalos jegyzőkönyv, teljes liberó- és cserejogosultság-ellenőrzés, többeszközös élő eredményjelző még nincs.</p>'+
  (projector?projectorHtml(c):'');
 paintClock();
}
function update(action){
 try{action();save();render()}catch(e){say(e.message||String(e),true)}
}
function handleClick(event){
 if(!root||!root.contains(event.target))return;
 const nav=event.target.closest('[data-vb-tab]');
 if(nav){view.tab=nav.dataset.vbTab;render();return}
 const tc=event.target.closest('[data-vb-court]');
 if(tc){model.selected=tc.dataset.vbCourt;projector=false;view.tab='score';save();render();return}
 const b=event.target.closest('[data-vb-action]');if(!b)return;
 const act=b.dataset.vbAction,c=court(),s=c.active;
 if(act.startsWith('point-')){update(()=>core.award(c,Number(act.slice(-1))));return}
 if(act.startsWith('minus-')){
  const side=Number(act.slice(-1)),info=core.lastPointCorrection(c,side);
  if(!info){say('A −1 csak a legutóbb kiosztott pontot vonja vissza, a megfelelő csapatnál.',true);return}
  if((info.discardedStats||info.discardedSubs)&&!window.confirm('A legutóbbi pont visszavonása '+info.discardedStats+' statisztikát és '+info.discardedSubs+' cserét is töröl. Folytatod?'))return;
  update(()=>core.retractLastPoint(c,side));return;
 }
 if(act==='undo'){update(()=>{if(!core.undo(c))throw Error('Nincs visszavonható művelet.')});return}
 if(act==='start-set'){
  update(()=>{
   const lineups=[0,1].map(side=>[1,2,3,4,5,6].map(pos=>root.querySelector('[data-vb-lineup="'+side+'-'+pos+'"]')?.value||''));
   const setterStarts=[0,1].map(side=>root.querySelector('[data-vb-setter="'+side+'"]')?.value||null);
   core.start(c,lineups,Number(root.querySelector('[data-vb-first-serve]')?.value),setterStarts);
  });return;
 }
 if(act==='close-set'){
  if(!window.confirm('Lezárod a '+s.number+'. szettet ('+s.points.join(':')+')? Az eredmény megmarad az elemzéshez.'))return;
  try{core.close(c,false);save();render()}catch(e){
   if(/nem érte el/.test(e.message)&&window.confirm('A szett még nem érte el az érvényes végállást. Edzésjáték esetén idő előtt is lezárod?'))update(()=>core.close(c,true));
   else say(e.message,true);
  }return;
 }
 if(act==='show-analysis'){view.tab='analysis';view.analysis='all';render();return}
 if(act==='next-set'){if(c.sets.filter(x=>x.winner===0).length+(s.winner===0?1:0)>=Math.ceil(c.bestOf/2)||c.sets.filter(x=>x.winner===1).length+(s.winner===1?1:0)>=Math.ceil(c.bestOf/2)){if(!window.confirm('A mérkőzés már eldőlt. Újabb edzőszettet nyitsz?'))return}update(()=>{core.next(c);view.tab='score';view.setupService=1-Number(s.service??0)});return}
 if(act==='substitute'){
  const old=s.lineups[view.subTeam]?.[Number(view.subPos)-1]||'';
  const fresh=String(root.querySelector('[data-vb-subjersey]')?.value||'').trim();
  if(!fresh){say('A beálló játékos mezszáma kötelező.',true);return}
  const setter=core.setterAt(s,view.subTeam);
  const setterNote=setter?.position===Number(view.subPos)?' A feladó megjelölése az új játékosra kerül.':'';
  if(!window.confirm(escape(c.names[view.subTeam])+': #'+old+' → #'+fresh+' a '+view.subPos+'. helyen.'+setterNote+' Rögzíted?'))return;
  update(()=>{core.substitute(c,view.subTeam,view.subPos,fresh);view.subJersey=''});return;
 }
 if(act==='add-stat'){
  update(()=>{core.stat(c,view.statsTeam,root.querySelector('[data-vb-statjersey]')?.value,view.statsSkill,root.querySelector('[data-vb-statgrade]')?.value);view.statsJersey=String(root.querySelector('[data-vb-statjersey]')?.value||'')});return;
 }
 if(act==='add-court'){if(model.courts.length>=6)return;const id=String(++model.nextId);model.courts.push(core.newCourt(id));model.selected=id;view.tab='score';save();render();return}
 if(act==='remove-court'){if(model.courts.length===1)return;if(!window.confirm('Törlöd a '+c.name+' pályát és a helyi meccsadatait?'))return;model.courts=model.courts.filter(x=>x.id!==c.id);model.selected=model.courts[0].id;save();render();return}
 if(act==='reset-match'){if(!window.confirm('Új mérkőzést kezdesz? A jelenlegi mérkőzés minden szettje és statisztikája elvész ezen az eszközön.'))return;const old={id:c.id,name:c.name,names:c.names};const fresh=core.newCourt(c.id);fresh.name=old.name;fresh.names=old.names;model.courts=model.courts.map(x=>x.id===c.id?fresh:x);view.tab='score';save();render();return}
 if(act==='free-mode'){if(window.confirm('Átváltasz szabad pontozásra? A röplabda-mérkőzés itt helyben megőrződik, és visszatéréskor folytatható.'))onFree?.();return}
 if(act==='project'){projector=true;render();root.querySelector('.cc-vb-projector')?.requestFullscreen?.().catch(()=>{});return}
 if(act==='close-project'){projector=false;if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});render();return}
 if(act==='toggle-clock'){const t=c.timer;if(t.running){t.elapsedMs+=Math.max(0,Date.now()-t.since);t.running=false;t.since=0}else{if(t.type==='countdown'&&t.elapsedMs>=t.durationMs)t.elapsedMs=0;t.running=true;t.since=Date.now()}save();render();return}
 if(act==='reset-clock'){c.timer.elapsedMs=0;c.timer.since=0;c.timer.running=false;save();render();return}
 if(act.startsWith('time-')){
  const val=act==='time-custom'?root.querySelector('[data-vb-timecustom]')?.value:act.split('-')[1];
  const n=Math.floor(Number(val));if(!Number.isFinite(n)||n<1||n>180){say('1–180 perc közötti időt adj meg.',true);return}
  c.timer.durationMs=n*60000;c.timer.elapsedMs=0;c.timer.since=0;c.timer.running=false;save();render();return;
 }
 if(act==='export-json'){download(JSON.stringify({exportedAt:new Date().toISOString(),sport:'indoor_volleyball',court:c},null,2),'club-control-'+c.id+'-meccs.json','application/json');return}
 if(act==='export-csv'){const rows=[['szett','labdamenet','rekord','csapat','mez','technikai_elem','ertekeles','pont_A','pont_B','nyito_csapat','nyito_mez','idopont']];
 for(const item of [...c.sets,c.active]){
  const byRally=new Map();
  for(const e of item.events){if(!byRally.has(e.rallyIndex))byRally.set(e.rallyIndex,[]);byRally.get(e.rallyIndex).push(e)}
  for(const rally of item.rallies){
   const teamName=rally.serviceBefore==null?'':c.names[rally.serviceBefore];
   rows.push([item.number,rally.index,'pont',c.names[rally.winner],'','','',rally.scoreAfter[0],rally.scoreAfter[1],teamName,rally.serverNumber||'',rally.at]);
   for(const e of byRally.get(rally.index)||[])rows.push([e.set,e.rallyIndex,'statisztika',c.names[e.team],e.jersey,e.skill,e.grade,rally.scoreAfter[0],rally.scoreAfter[1],teamName,rally.serverNumber||'',e.at]);
  }
 }
 const quote=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
 download('\uFEFF'+rows.map(r=>r.map(quote).join(';')).join('\r\n'),'club-control-'+c.id+'-esemenynaplo.csv','text/csv;charset=utf-8');return}
}
function download(content,filename,type){
 const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
function refreshSubOut(){const el=root?.querySelector('[data-vb-subout]');if(el)el.textContent='#'+(court().active.lineups[view.subTeam]?.[Number(view.subPos)-1]||'–')}
function handleChange(e){
 const target=e.target,c=court();
 if(target.matches('[data-vb-name]')){c.names[Number(target.dataset.vbName)]=String(target.value||'').trim().slice(0,60)||'Csapat';save();render();return}
 if(target.matches('[data-vb-courtname]')){c.name=String(target.value||'').trim().slice(0,60)||c.name;save();render();return}
 if(target.matches('[data-vb-bestof]')){c.bestOf=Number(target.value)===5?5:3;save();render();return}
 if(target.matches('[data-vb-target]')){c.target=[15,21,25].includes(Number(target.value))?Number(target.value):25;save();render();return}
 if(target.matches('[data-vb-first-serve]')){view.setupService=Number(target.value);return}
 if(target.matches('[data-vb-statteam]')){view.statsTeam=Number(target.value);view.statsJersey='';render();return}
 if(target.matches('[data-vb-statskill]')){view.statsSkill=target.value;view.statsGrade=Object.keys(core.SKILLS[view.statsSkill]||{})[0]||'ace';render();return}
 if(target.matches('[data-vb-statgrade]')){view.statsGrade=target.value;return}
 if(target.matches('[data-vb-statjersey]')){view.statsJersey=target.value;return}
 if(target.matches('[data-vb-subteam]')){view.subTeam=Number(target.value);refreshSubOut();return}
 if(target.matches('[data-vb-subpos]')){view.subPos=target.value;refreshSubOut();return}
 if(target.matches('[data-vb-subjersey]')){view.subJersey=target.value;return}
 if(target.matches('[data-vb-analysis]')){view.analysis=target.value;render();return}
 if(target.matches('[data-vb-clock-type]')){c.timer.type=target.value==='stopwatch'?'stopwatch':'countdown';c.timer.running=false;c.timer.elapsedMs=0;c.timer.since=0;save();render()}
}
function mount(host,switchToFree){
 if(!host)return;
 if(!model)model=read();root=host;onFree=switchToFree;
 root.addEventListener('click',handleClick);root.addEventListener('change',handleChange);
 if(!clockInterval)clockInterval=setInterval(paintClock,250);
 projector=false;render();
}
window.CCManagerVolleyball=Object.freeze({mount});
})();