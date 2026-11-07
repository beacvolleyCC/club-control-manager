'use strict';
// Cross repo: actual PostgreSQL 17 canonical JSON into pinned Player #28
// renderer, not into a duplicate synthetic result fixture.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const input=process.env.CC_PROTOCOL_CANONICAL_JSON_FILE;
const script=process.env.CC_PLAYER_APP_FILE;
assert.ok(input&&script,'Missing PG17 JSON or pinned Player JS');
const matches=JSON.parse(fs.readFileSync(input,'utf8'));
const app=fs.readFileSync(script,'utf8');
function section(start,end){
 const a=app.indexOf(start),b=app.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Player source section missing: '+start);
 return app.slice(a,b);
}
const htmlEscape=x=>String(x??'').replace(/&/g,'&amp;')
 .replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const view={body:{innerHTML:''},sheet:{scrollTop:74},dialog:{scrollTop:17,querySelector(selector){return selector==='.player-protocol-dialog-card'?view.sheet:null}},opened:0,closed:0,
 closeButton:{handlers:{},addEventListener(k,fn){this.handlers[k]=fn}},cards:[]};
const ctx={
 URL,Intl,Date,escapeHtml_:htmlEscape,
 document:{
  getElementById:k=>k==='playerProtocolDialog'?view.dialog:
    k==='playerProtocolContent'?view.body:
    k==='closePlayerProtocolDialog'?view.closeButton:null,
  querySelectorAll:k=>k==='[data-player-protocol]'?view.cards:[]
 },
 ccOpenDialog_:()=>{view.opened++},ccCloseDialog_:()=>{view.closed++},
 ccMrszPlayerPhoto_:{canonicalMatches:matches,matches:[]},
 ccMrszPlayerLocalKickoff_:v=>({date:String(v||'').slice(0,10),
  time:String(v||'').slice(11,16)}),
 ccPlayerOfficialMatchReportUrl_:()=>'',standingsTeamLogoHtml_:()=>'<i></i>'
};
vm.createContext(ctx);
vm.runInContext(
 section('function ccPlayerProtocolProfileUrl_(', '// Two official match records supplied')+
 section('function ccPlayerScoreboardHtml_(', 'function ccMrszPlayerLeagueScheduleHtml_(')+
 '\nthis.qaProtocolHtml=ccPlayerProtocolDetailHtml_;'+
 'this.qaScoreboard=ccPlayerScoreboardHtml_;'+
 'this.qaOpen=ccPlayerOpenProtocol_;'+
 'this.qaBind=ccPlayerBindProtocols_;',ctx);
const expected=[
 {code:'2686',uuid:'04eaceee-57e2-7563-a618-beb933c0ffc0',
  league:'Női Budapest I. osztály',key:'20261001:fixture:39',
  home:'MTK Budapest',away:'Panoráma SE',result:[3,1],
  sets:['25:20','25:9','20:25','25:15']},
 {code:'2700',uuid:'25a14406-2887-62fc-086c-ad770d160a6b',
  league:'Férfi Budapest I. osztály – B csoport',
  key:'brsz:2026/27:menB:userofficial:01',
  home:'Mozdulj SE',away:'MAFC-Vásárhelyi',result:[3,2],
  sets:['25:18','25:23','21:25','18:25','15:11']}
];
test('real PG17 result contains two official fixtures and 38 athletes',()=>{
 assert.equal(matches.length,2);
 assert.deepEqual(matches.map(m=>String(m.matchCode)).sort(),['2686','2700']);
 assert.equal(new Set(matches.map(m=>m.matchId)).size,2);
 assert.equal(matches.reduce((n,m)=>n+m.protocol.teams.reduce(
  (t,team)=>t+team.players.length,0),0),38);
});
for(const e of expected)test('Player PR28 consumes PG17 protocol '+e.code,()=>{
 const m=matches.find(m=>String(m.matchCode)===e.code);
 assert.ok(m);
 assert.equal(m.matchId,e.uuid);
 assert.equal(m.sourceKey,e.key);
 assert.equal(m.competitionLabel,e.league);
 assert.equal(m.homeName,e.home);
 assert.equal(m.awayName,e.away);
 assert.equal(m.status,'played');
 assert.deepEqual([m.homeSets,m.awaySets],e.result);
 assert.deepEqual(m.setScores.map(s=>s.home+':'+s.away),e.sets);
 assert.equal(m.protocol.teams.reduce((n,t)=>n+t.players.length,0),19);
 const card=ctx.qaScoreboard(m);
 assert.ok(card.includes('data-player-protocol="'+e.code+'"'));
 assert.ok(card.includes('has-protocol'));
 assert.ok(card.includes(e.result.join(' – ')));
 assert.ok(card.includes(e.sets.join(' · ')));
 const details=ctx.qaProtocolHtml(m);
 assert.ok(details.includes('Meccskód: '+e.code));
 for(const side of m.protocol.teams)
  for(const athlete of side.players)
   assert.ok(details.includes(htmlEscape(athlete.name)),athlete.name);
 assert.ok(details.includes('aria-label="Kapitány"'));
 assert.ok(details.includes('aria-label="Libero"'));
 assert.ok(details.includes('aria-label="Csere"'));
 view.sheet.scrollTop=71;view.dialog.scrollTop=9;
 const before=view.opened;
 ctx.qaOpen(e.code,e.league);
 assert.equal(view.opened,before+1);
 assert.ok(view.body.innerHTML.includes('Meccskód: '+e.code));
 assert.equal(view.sheet.scrollTop,0,'Player dialog reopens at top');
 assert.equal(view.dialog.scrollTop,0);
});
test('Player does not open report for another league or ambiguous match code',()=>{
 const before=view.opened;
 ctx.qaOpen('2686','Női Budapest II. osztály – B csoport');
 assert.equal(view.opened,before);
 const m=matches.find(x=>String(x.matchCode)==='2686');
 matches.push({...m,matchId:'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'});
 ctx.qaOpen('2686',m.competitionLabel);
 assert.equal(view.opened,before);
 matches.pop();
});
test('tap, nested links, keyboard and close use exact in-app report',()=>{
 const handlers={};
 const card={dataset:{playerProtocol:'2700',
   playerProtocolLeague:'Férfi Budapest I. osztály – B csoport'},
  addEventListener(k,fn){handlers[k]=fn}};
 view.cards=[card];
 ctx.qaBind();
 assert.equal(typeof handlers.click,'function');
 assert.equal(typeof handlers.keydown,'function');
 const normal={closest:()=>null},nested={closest:()=>({tagName:'A'})};
 const opened=view.opened;
 handlers.click({target:normal});
 assert.equal(view.opened,opened+1);
 assert.ok(view.body.innerHTML.includes('Meccskód: 2700'));
 handlers.click({target:nested});
 assert.equal(view.opened,opened+1);
 let prevented=0;
 handlers.keydown({key:'Enter',target:normal,preventDefault(){prevented++}});
 handlers.keydown({key:' ',target:normal,preventDefault(){prevented++}});
 assert.equal(view.opened,opened+3);
 assert.equal(prevented,2);
 assert.equal(typeof view.closeButton.handlers.click,'function');
 const closed=view.closed;
 view.closeButton.handlers.click();
 assert.equal(view.closed,closed+1);
 view.cards=[];
});
