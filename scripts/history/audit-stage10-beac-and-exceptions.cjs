'use strict';
// One bounded research run: 24 official 2024/25 BEAC match sheets and
// eight source-verified 2025/26 exceptions. No writes or guessing IDs.
const fs=require('node:fs'),path=require('node:path');
const {TextDecoder}=require('node:util');
const {fetchOfficial}=require('./probe-women1-beac-protocols.cjs');
const {parseFlexibleProtocol}=require('./parse-flexible-women1-protocol.cjs');
const {ALIASES}=require('./audit-women1-2024-snapshot.cjs');
const {SAME_SEASON_MAP}=require('./audit-official-women1-snapshot.cjs');
const {selectExceptions}=require('./inspect-eight-exceptions-and-2024.cjs');
const FOLDER=path.join(__dirname,'../../data/competition-history');
const load=name=>JSON.parse(fs.readFileSync(path.join(FOLDER,name),'utf8'));
const pause=t=>new Promise(ok=>setTimeout(ok,t));

function select2024Beac(snapshot){
 if(snapshot.schemaVersion!==1||snapshot.sourceSeason!=='2024/25'||snapshot.competitionSubId!=='72')throw Error('Wrong 2024 MRSZ source index');
 const matches=snapshot.matches.filter(x=>x.status==='scored'&&(x.home==='BEAC'||x.away==='BEAC'))
  .sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
 if(matches.length!==24||new Set(matches.map(m=>m.code)).size!==24)throw Error('Expected 24 sourced BEAC 2024/25 match codes');
 return matches.map(m=>{
  const url=new URL(m.sourcePath,'https://www.hunvolley.info');
  if(url.protocol!=='https:'||url.hostname!=='www.hunvolley.info'||url.pathname!=='/pr_a/010/009/p_009.asp'
   ||url.searchParams.get('p_evad_kod')!=='2024'||url.searchParams.get('p_verseny_al_kod')!=='72'
   ||url.searchParams.get('p_merkozes_kod')!==m.code)throw Error('Invalid MRSZ source');
  return{...m,url:url.toString(),season:'2024'};
 });
}
function select2025Exceptions(opponent,remaining,index){
 const byCode=new Map(index.matches.map(x=>[x.code,x]));
 return selectExceptions(opponent,remaining).map(item=>{
  const m=byCode.get(item.code);
  if(!m||m.sourcePath!==new URL(item.url).pathname+new URL(item.url).search)throw Error('Untrusted exception source '+item.code);
  return{...m,url:item.url,season:'2025'};
 });
}
function verifyRecord(m,parsed,http){
 const score=parsed?.scoreVerified===true&&parsed.homeSets===m.homeSets&&parsed.awaySets===m.awaySets;
 const date=parsed?.date===m.date;
 const aliases=m.season==='2024'?ALIASES:SAME_SEASON_MAP;
 const homeName=aliases[m.home],awayName=aliases[m.away];
 const sourceNames=!!homeName&&!!awayName&&parsed?.home===homeName&&parsed?.away===awayName;
 const rosters=parsed?.twoRosterListsVerified===true;
 // A score-less protocol must not invalidate a score published separately
 // on the official league fixture index.
 const idRows=rosters&&date&&sourceNames;
 const bothVerified=score&&idRows;
 const beacIdx=m.home==='BEAC'?0:m.away==='BEAC'?1:-1;
 const beacRecord=beacIdx>=0&&idRows&&parsed.teams[beacIdx].rosterComplete;
 return{
  code:m.code,season:m.season==='2024'?'2024/25':'2025/26',date:m.date,
  home:m.home,away:m.away,
  sourceUrl:m.url,officialListHomeSets:m.homeSets,officialListAwaySets:m.awaySets,
  http,parseStatus:parsed?.status||'fetch_failed',
  dateMatches:date,teamNamesMatch:sourceNames,
  protocolScoreAgrees:score,
  twoCompleteRostersById:idRows,
  officialScoreAndBothRosters:bothVerified,
  beacRosterVerified:!!beacRecord,
  warnings:parsed?.warnings||[],
  errors:parsed?.errors||[],
  rosterTeams:idRows?parsed.teams.map(t=>({name:t.name,
    players:t.players.map(p=>({code:p.code,name:p.name,shirt:p.shirt,
      designation:p.designation,captain:p.captain,libero:p.libero,title:p.title}))})):[],
  rejectedReasons:[
   ...(http!==200?['http_failure']:[]),
   ...(!date?['date_missing_or_different']:[]),
   ...(!sourceNames?['team_name_mismatch']:[]),
   ...(!rosters?['incomplete_roster_source']:[]),
   ...(!score?['protocol_score_missing_or_different']:[])
  ]
 };
}
async function main(){
 const d24=load('women1_2024_25_official_league_snapshot.json');
 const d25=load('women1_2025_26_official_league_snapshot.json');
 const todo=[...select2024Beac(d24),...select2025Exceptions(
  load('women1_2025_26_opponent_protocols.json'),
  load('women1_2025_26_beac_remaining_protocols.json'),d25)];
 const results=[];
 for(let i=0;i<todo.length;i++){
  if(i)await pause(700);
  const m=todo[i];
  try{
   const response=await fetchOfficial(m.url);
   if(!response.body){results.push(verifyRecord(m,null,response.status));continue}
   const header=String(response.headers['content-type']||'');
   const charset=header.match(/charset=([\w-]+)/i)?.[1]?.toLowerCase();
   const html=new TextDecoder(['utf-8','windows-1250','iso-8859-2'].includes(charset)?charset:'windows-1250').decode(response.body);
   results.push(verifyRecord(m,parseFlexibleProtocol(html,m.code,m.season),response.status));
  }catch(error){results.push({...verifyRecord(m,null,null),fetchError:String(error?.message||error).slice(0,160)})}
 }
 const a=results.filter(x=>x.season==='2024/25'),b=results.filter(x=>x.season==='2025/26');
 const previousIds=new Set(a.filter(x=>x.beacRosterVerified).flatMap(x=>
  x.rosterTeams.find(t=>t.name==='Budapesti Egyetemi Atlétikai Club'||t.name==='BEAC')?.players.map(p=>p.code)||[]));
 const output={
  schemaVersion:1,source:'Read-only MRSZ official match sheets sourced from 2024/25 and 2025/26 official competition indexes',
  capturedOn:'2026-10-17',maxRequests:32,sourceListed2024BeacGames:a.length,exceptions2025:b.length,
  year2024:{protocolScoreMatched:a.filter(x=>x.protocolScoreAgrees).length,
   bothRosterListsByOfficialID:a.filter(x=>x.twoCompleteRostersById).length,
   beacRosterListsVerified:a.filter(x=>x.beacRosterVerified).length,
   distinctBeacPlayerCodes:previousIds.size,
   exceptionCodes:a.filter(x=>!x.beacRosterVerified).map(x=>x.code)},
  year2025:{protocolScoreMatched:b.filter(x=>x.protocolScoreAgrees).length,
   rosterListsVerified:b.filter(x=>x.twoCompleteRostersById).length,
   exceptionDiagnostics:b.map(x=>({code:x.code,score:x.protocolScoreAgrees,rosters:x.twoCompleteRostersById,warnings:x.warnings.map(y=>y.reason),errors:x.errors.map(y=>y.reason),reason:x.rejectedReasons}))},
  playerNominationDoesNotProvePlayedSets:true,
  completeHistoricalLeagueRosters:false,modelEnabled:false,results
 };
 process.stdout.write('<<<CC_STAGE10_START>>>\n'+JSON.stringify(output)+'\n<<<CC_STAGE10_END>>>\n');
}
if(require.main===module){
 if(process.argv[2]!=='--network'){process.stderr.write('Explicit --network required\n');process.exitCode=2}
 else main().catch(e=>{process.stderr.write(String(e)+'\n');process.exitCode=1})
}
module.exports={select2024Beac,select2025Exceptions,verifyRecord};
