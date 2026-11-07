/* Club Control league selection behavior: real application helper execution. */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8');
const catalog=require('../competition-context-catalog.js');
const women='Női Budapest I. osztály',womenB='Női Budapest II. osztály – B csoport';
const menA='Férfi Budapest I. osztály – A csoport',menB='Férfi Budapest I. osztály – B csoport';
const matches=[women,womenB,menA,menB].map((competitionLabel,n)=>({
 competitionLabel,homeName:'Hazai '+n,awayName:'Vendég '+n,homeSourceTeamId:String(100+n*2),awaySourceTeamId:String(101+n*2)
}));
const snapshot={fixtures:matches,matches:[],tables:[{competitionLabel:menA,rows:[{position:1,teamName:'Hazai 2'}]},{competitionLabel:womenB,rows:[{position:1,teamName:'Hazai 1'}]}]};
function memory(){const x=new Map();return {getItem:k=>x.get(k)||null,setItem:(k,v)=>x.set(k,String(v)),removeItem:k=>x.delete(k)}}
test('The same observed league catalog is available to both apps',()=>{
 assert.deepEqual(catalog.build({season:'2026/27',...snapshot}).map(x=>x.competitionLabel).sort(),[women,womenB,menA,menB].sort());
});
test('Shared browser code is loaded before app and gets a fresh service-worker cache',()=>{
 assert.match(html,/competition-context-catalog\.js\?v=20261015-lc1/);
 assert.ok(html.indexOf('competition-context-catalog.js')<html.indexOf('app.js?v='));
 assert.match(sw,/competition-context-catalog\.js/);
});

function buildManager(){
 const begin=app.indexOf('  let ccLeagueContextSelection_=');
 const end=app.indexOf('  async function ccLoadMrszPhotoSnapshot_(',begin);
 assert.ok(begin>=0&&end>begin);
 const body=app.slice(begin,end);
 const storage=memory(),state={managerStandingsTeam:'old'};
 let renders=0;
 const win={CCCompetitionContextCatalog:catalog};
 const funcs=new Function('window','localStorage','text','esc','ccMrszPhotoState_','state','renderManagerStandings_','ccRouteIs_','renderCompetitionMatchCards_',
  "let ccLeagueMatchScope_='beac';"+body+
  ';return {ccLeagueCatalog_,ccCurrentLeague_,ccLeagueContextSelectHtml_,ccSetLeagueContext_,ccClearLeagueContext_};')(
  win,storage,x=>String(x??''),x=>String(x??''),snapshot,state,()=>renders++,()=>false,()=>renders++
 );
 return {funcs,state,storage,renders:()=>renders};
}
test('Manager menu offers observed groups and not invented groups',()=>{
 const {funcs}=buildManager(),markup=funcs.ccLeagueContextSelectHtml_(menB);
 assert.equal((markup.match(/<option value=/g)||[]).length,4);
 assert.ok(markup.includes(menA));assert.ok(markup.includes(womenB));
 assert.ok(!markup.includes('Női Budapest II. osztály – A csoport'));
});
test('Manager selection updates context and resets stale selected league team',()=>{
 const {funcs,state,storage,renders}=buildManager();
 funcs.ccSetLeagueContext_(menA);
 assert.equal(funcs.ccCurrentLeague_(women),menA);
 assert.equal(state.managerStandingsTeam,'all');
 assert.equal(storage.getItem('cc-manager-league-context-v1'),menA);
 assert.equal(renders(),1);
 funcs.ccClearLeagueContext_();
 assert.equal(funcs.ccCurrentLeague_(women),women);
});
test('Manager protects missing league standings from unrelated canonical rows',()=>{
 assert.match(app,/const rawRows=canonicalPartial\?canonicalRows:showPhoto\?ccStandingsPhotoTeamRows_\(photo\):externalSelection\?\[\]:/);
 assert.ok(app.includes('const hasRealRank='));
 assert.ok(app.includes('_ccUnranked:true'), 'source-less standings must not invent ranking numbers');
 assert.match(app,/!externalSelection&&Array\.isArray\(msData_\(\)\?\.matches\)/);
 assert.match(app,/ccLeagueContextSelectHtml_\(group\)/);
});
