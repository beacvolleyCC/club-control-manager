'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const start=code.indexOf('function ccMassAthleteNamePeers_(');
const end=code.indexOf('function openMassAthleteDetail_(',start);
assert.ok(start>0&&end>start,'history module must exist before athlete details');
const state={massAthletes:[
 {athleteId:'A-1',name:'Test Example',email:'one@example.invalid',attended:3},
 {athleteId:'A-2',name:'  TEST   example ',email:'two@example.invalid',attended:1},
 {athleteId:'A-3',name:'Different Name',email:'three@example.invalid',attended:4}
]};
const text=x=>String(x??'').trim();
const num=x=>Number(x||0);
const esc=x=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const module=new Function('state','text','num','esc',code.slice(start,end)+'\nreturn {peers:ccMassAthleteNamePeers_,html:ccMassAthleteHistoryRowsHtml_};')(state,text,num,esc);
test('same-name profiles are flagged, not silently merged',()=>{
 const peers=module.peers(state.massAthletes[0]);
 assert.equal(peers.length,1);
 assert.equal(peers[0].athleteId,'A-2');
 const html=module.html({events:[],totals:{}},state.massAthletes[0]);
 assert.match(html,/azonos nevű adatlap/);
 assert.match(html,/data-mass-athlete-peer="A-2"/);
 assert.doesNotMatch(html,/data-mass-athlete-peer="A-3"/);
});
test('dated attendance audit separates confirmed, missing, cancelled and future',()=>{
 const data={ok:true,totals:{attended:1,noShow:1,pastUnrecorded:1,upcoming:1},events:[
  {eventDate:'2026-10-13',level:'Kezdő',attendance:'MEGJELENT',bookingStatus:'AKTÍV',future:false},
  {eventDate:'2026-10-14',level:'Haladó',attendance:'NEM JELENT MEG',bookingStatus:'NEM JELENT MEG',future:false},
  {eventDate:'2026-10-15',level:'Haladó',attendance:'NINCS RÖGZÍTVE',bookingStatus:'AKTÍV',future:false},
  {eventDate:'2026-10-16',level:'Haladó',attendance:'NINCS RÖGZÍTVE',bookingStatus:'LEMONDVA',future:false},
  {eventDate:'2026-11-10',level:'Haladó',attendance:'NINCS RÖGZÍTVE',bookingStatus:'AKTÍV',future:true}
 ]};
 const html=module.html(data,state.massAthletes[2]);
 assert.match(html,/2026\.09\.29-től/);
 assert.match(html,/13\.10\.2026\./);
 assert.match(html,/Megjelent/);
 assert.match(html,/Nem jelent meg/);
 assert.match(html,/Nincs rögzítve/);
 assert.match(html,/Lemondva/);
 assert.match(html,/Jövőbeli/);
});
test('Manager athlete detail fetches history on demand through secured RPC',()=>{
 assert.match(code,/cc_manager_mass_athlete_history_v1/);
 assert.match(code,/ccMassAthleteHistoryLoad_\(id\)/);
 assert.match(code,/data-mass-athlete-history-for/);
 assert.match(code,/host\.isConnected/);
});
