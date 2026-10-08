/* Club Control Sport Core: indoor-volleyball scoring model v2.
 * Self-contained, client-only; stat actions never alter the score.
 */
(function(){
'use strict';
const clone=value=>JSON.parse(JSON.stringify(value));
const num=(v,min=0,max=999)=>{const n=Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,Math.trunc(n))):min;};
function newSet(number=1,previous=null){
 const start=previous?.startLineups||[Array(6).fill(''),Array(6).fill('')];
 return {number,status:'setup',startLineups:clone(start),lineups:clone(start),service:null,points:[0,0],rotations:[0,0],rallies:[],events:[],substitutions:[],finishedAt:null,winner:null};
}
function newCourt(id=1){
 return {id:String(id),name:String(id)+'. pálya',names:['A csapat','B csapat'],bestOf:3,target:25,sets:[],active:newSet(),history:[],eventSeq:0,timer:{type:'countdown',durationMs:600000,elapsedMs:0,since:0,running:false}};
}
function checkpoint(c){
 if(!Array.isArray(c.history))c.history=[];
 c.history.push(clone({active:c.active,sets:c.sets,eventSeq:c.eventSeq}));
 if(c.history.length>20)c.history.shift();
}
function undo(c){
 const entry=c.history?.pop();if(!entry)return false;
 c.active=entry.active;c.sets=entry.sets;c.eventSeq=entry.eventSeq;return true;
}
function validateLineups(value){
 if(!Array.isArray(value)||value.length!==2)return 'A kezdőfelállás hiányzik.';
 let teamsWithSix=0;
 for(let side=0;side<2;side++){
  const entries=Array.isArray(value[side])?value[side].map(x=>String(x??'').trim()):[];
  const populated=entries.filter(Boolean);
  if(entries.length!==6||populated.length!==0&&populated.length!==6)return 'Mindkét oldalon vagy mind a hat játékost add meg, vagy hagyd teljesen üresen.';
  if(populated.length===6){teamsWithSix++;if(new Set(populated).size!==6)return 'Egy csapat kezdő hatosában a mezszám nem ismétlődhet.';}
 }
 if(!teamsWithSix)return 'Legalább az egyik csapat kezdő hatosát töltsd ki.';
 return '';
}
function start(c,lineups,service){
 if(c.active.status!=='setup')throw Error('Ez a szett már elkezdődött.');
 const clean=lineups.map(team=>team.map(v=>String(v??'').trim()));
 const error=validateLineups(clean);if(error)throw Error(error);
 if(service!==0&&service!==1)throw Error('Válaszd ki, melyik csapat nyit.');
 checkpoint(c);
 c.active.startLineups=clone(clean);c.active.lineups=clone(clean);c.active.service=service;c.active.status='live';
 return c.active;
}
function rotated(lineup){
 const old=lineup.slice(0,6);return [old[1],old[2],old[3],old[4],old[5],old[0]];
}
function requiredPoints(c){
 const winning=Math.ceil(c.bestOf/2);
 const wins=[0,1].map(side=>c.sets.filter(s=>s.winner===side).length);
 const deciding=wins[0]===winning-1&&wins[1]===winning-1;
 return deciding?15:c.target;
}
function canClose(c){
 const p=c.active.points;const threshold=requiredPoints(c);
 return Math.max(...p)>=threshold&&Math.abs(p[0]-p[1])>=2;
}
function award(c,side){
 const s=c.active;
 if(s.status!=='live')throw Error('Előbb indítsd el a szettet.');
 if(side!==0&&side!==1)throw Error('Érvénytelen csapat.');
 if(canClose(c))throw Error('A szett már befejezhető. Zárd le vagy vond vissza az utolsó pontot.');
 checkpoint(c);
 const before=s.service, prior=s.points.slice(),rotBefore=s.rotations.slice();
 const servedBy=s.lineups[before]?.[0]||'';
 s.points[side]+=1;
 if(before!==side){s.service=side;s.rotations[side]=(s.rotations[side]+1)%6;s.lineups[side]=rotated(s.lineups[side]);}
 const rally={index:s.rallies.length+1,winner:side,serviceBefore:before,serviceAfter:s.service,scoreBefore:prior,scoreAfter:s.points.slice(),rotationBefore:rotBefore,rotationAfter:s.rotations.slice(),serverNumber:servedBy,nextServer:s.lineups[s.service]?.[0]||'',at:new Date().toISOString()};
 s.rallies.push(rally);
 return rally;
}
function close(c,force=false){
 if(c.active.status!=='live')throw Error('Nincs folyamatban lévő szett.');
 const p=c.active.points;if(p[0]===p[1])throw Error('Döntetlen szettet nem lehet lezárni.');
 if(!canClose(c)&&!force)throw Error('A szett nem érte el a célpontszámot és a kétpontos különbséget.');
 checkpoint(c);
 c.active.status='closed';c.active.winner=p[0]>p[1]?0:1;c.active.finishedAt=new Date().toISOString();
 return c.active.winner;
}
function next(c){
 if(c.active.status!=='closed')throw Error('Előbb zárd le az aktuális szettet.');
 checkpoint(c);
 const prev=clone(c.active);
 c.sets.push(prev);
 c.active=newSet(prev.number+1,prev);
 return c.active;
}
function substitute(c,side,position,replacement){
 if(c.active.status!=='live')throw Error('Csere csak elindított szettben lehetséges.');
 const pos=num(position,1,6);
 if(side!==0&&side!==1)throw Error('Érvénytelen csapat.');
 const jersey=String(replacement??'').trim().slice(0,12);
 if(!jersey)throw Error('Add meg a beálló játékos mezszámát.');
 const lineup=c.active.lineups[side],old=lineup[pos-1];
 if(!old)throw Error('Csere előtt töltsd ki a csapat felállását.');
 if(lineup.includes(jersey))throw Error('A játékos már pályán van.');
 checkpoint(c);
 lineup[pos-1]=jersey;
 c.active.substitutions.push({team:side,position:pos,out:old,in:jersey,rallyIndex:c.active.rallies.length,at:new Date().toISOString()});
 return {out:old,in:jersey};
}
const SKILLS={
 serve:{ace:'Ász',error:'Nyitásrontás',in:'Játékban'},
 reception:{r3:'3 – tökéletes',r2:'2 – jó',r1:'1 – gyenge',r0:'0 – hiba'},
 attack:{kill:'Pont',error:'Hiba',in:'Játékban'},
 block:{point:'Pontsánc',touch:'Érintés',error:'Hiba'},
 dig:{positive:'Sikeres védekezés',negative:'Sikertelen'},
 set:{assist:'Gólpassz / assziszt',other:'Egyéb'},
 other:{team_error:'Csapathiba',other:'Egyéb'}
};
function stat(c,team,jersey,skill,grade){
 const s=c.active;
 if(s.status!=='live')throw Error('A statisztika elindított szetthez rögzíthető.');
 if(!s.rallies.length)throw Error('Előbb rögzíts egy pontot; a statisztika az utolsó labdamenethez kapcsolódik.');
 if(team!==0&&team!==1)throw Error('Válassz csapatot.');
 if(!Object.prototype.hasOwnProperty.call(SKILLS,skill)||!Object.prototype.hasOwnProperty.call(SKILLS[skill],grade))throw Error('Érvénytelen eseménytípus.');
 const number=String(jersey??'').trim().slice(0,12);
 if(!number&&!(skill==='other'&&grade==='team_error'))throw Error('Add meg a játékos mezszámát.');
 checkpoint(c);
 c.eventSeq=(Number(c.eventSeq)||0)+1;
 const event={id:String(c.id)+'-'+c.eventSeq,set:s.number,rallyIndex:s.rallies.length,team,jersey:number,skill,grade,at:new Date().toISOString()};
 s.events.push(event);
 return event;
}
function summary(c,filter='all'){
 const included=[...(c.sets||[]),c.active].filter(s=>filter==='all'||filter==='current'&&s===c.active||String(s.number)===String(filter));
 const sides=[0,1].map(team=>({team,sets:0,rallies:0,sideout:{won:0,total:0},break:{won:0,total:0},events:0,aces:0,serveErrors:0,kills:0,attackErrors:0,attempts:0,blocks:0,digs:0,assists:0,receptionSum:0,receptionCount:0,rotation:Array.from({length:6},(_,i)=>({rotation:i+1,won:0,total:0})),players:{}}));
 for(const set of included){
  if(set.status==='closed'&&set.winner!=null)sides[set.winner].sets++;
  for(const r of set.rallies){
   for(let side=0;side<2;side++){
    const row=sides[side];row.rallies++;
    if(r.serviceBefore!==side){row.sideout.total++;if(r.winner===side)row.sideout.won++;}
    else {row.break.total++;if(r.winner===side)row.break.won++;}
    const rotation=((r.rotationBefore?.[side]||0)%6+6)%6;
    row.rotation[rotation].total++;if(r.winner===side)row.rotation[rotation].won++;
   }
  }
  for(const e of set.events){
   const row=sides[e.team];if(!row)continue;row.events++;
   const key=e.jersey||'csapat';
   const p=row.players[key]||(row.players[key]={jersey:key,events:0,aces:0,serveErrors:0,kills:0,attackErrors:0,attempts:0,blocks:0,digs:0,assists:0,receptionSum:0,receptionCount:0});
   p.events++;
   const inc=(field,n=1)=>{row[field]+=n;p[field]+=n;};
   if(e.skill==='serve'&&e.grade==='ace')inc('aces');
   if(e.skill==='serve'&&e.grade==='error')inc('serveErrors');
   if(e.skill==='attack'&&['kill','error','in'].includes(e.grade)){inc('attempts');if(e.grade==='kill')inc('kills');if(e.grade==='error')inc('attackErrors');}
   if(e.skill==='block'&&e.grade==='point')inc('blocks');
   if(e.skill==='dig'&&e.grade==='positive')inc('digs');
   if(e.skill==='set'&&e.grade==='assist')inc('assists');
   if(e.skill==='reception'&&/^r[0-3]$/.test(e.grade)){inc('receptionCount');inc('receptionSum',Number(e.grade[1]));}
  }
 }
 return sides;
}
window.CCVolleyballCore=Object.freeze({newCourt,newSet,checkpoint,undo,validateLineups,start,rotated,requiredPoints,canClose,award,close,next,substitute,SKILLS,stat,summary});
})();