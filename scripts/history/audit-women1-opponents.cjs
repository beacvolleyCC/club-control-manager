'use strict';
// READ-ONLY official 2025/26 women I competition protocol coverage.
 // Only URLs already present in validated public source-index JSON.
 // Do not assume K / CS means that a player entered the court.
const fs=require('node:fs'),path=require('node:path');
const {TextDecoder}=require('node:util');
const {parseOfficialWomen1Protocol}=require('./parse-official-women1-protocol.cjs');
const {fetchOfficial}=require('./probe-women1-beac-protocols.cjs');
const {SAME_SEASON_MAP}=require('./audit-official-women1-snapshot.cjs');
const SNAPSHOT=path.join(__dirname,'../../data/competition-history/women1_2025_26_official_league_snapshot.json');
const N=107;
const DELAY_MS=850;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function selectOpponents(snapshot){
 if(snapshot.schemaVersion!==1||snapshot.sourceSeason!=='2025/26'||snapshot.competitionSubId!=='93'
   ||snapshot.completeness?.scored!==129||snapshot.completeness?.scheduled!==132)throw Error('Unverified competition snapshot');
 const matches=snapshot.matches.filter(m=>m.status==='scored'&&m.home!=='BEAC'&&m.away!=='BEAC')
  .sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)||String(a.code).localeCompare(String(b.code)));
 if(matches.length!==N||new Set(matches.map(x=>x.code)).size!==N)throw Error('Expected exactly 107 unique non-BEAC completed matches');
 if(new Set(matches.flatMap(x=>[x.home,x.away])).size!==11)throw Error('Expected 11 opponent teams');
 return matches.map(m=>{
  const url=new URL(m.sourcePath,'https://www.hunvolley.info');
  if(url.protocol!=='https:'||url.hostname!=='www.hunvolley.info'
    ||url.pathname!=='/pr_a/010/009/p_009.asp'
    ||url.searchParams.get('p_evad_kod')!=='2025'
    ||url.searchParams.get('p_verseny_al_kod')!=='93'
    ||url.searchParams.get('p_merkozes_kod')!==m.code)throw Error('Untrusted official match URL '+m.code);
  return{...m,url:url.toString()};
 });
}
function choosePilot(matches){
 const remaining=new Set([...new Set(matches.flatMap(m=>[m.home,m.away]))]),used=new Set(),selected=[];
 while(remaining.size){
   const pick=matches.filter(m=>!used.has(m.code)).sort((a,b)=>
     [b.home,b.away].filter(x=>remaining.has(x)).length-[a.home,a.away].filter(x=>remaining.has(x)).length
     ||a.date.localeCompare(b.date))[0];
   if(!pick)throw Error('Cannot cover opponents');
   selected.push(pick);used.add(pick.code);remaining.delete(pick.home);remaining.delete(pick.away);
 }
 return selected;
}
function checkSource(m,parsed,http){
 const recognized=parsed?.status==='verified_official_score';
 const scoreMatches=recognized&&parsed.homeSets===m.homeSets&&parsed.awaySets===m.awaySets;
 const dateMatches=recognized&&parsed.date===m.date;
 const expectedHome=SAME_SEASON_MAP[m.home],expectedAway=SAME_SEASON_MAP[m.away];
 const namesMatch=recognized&&parsed.home===expectedHome&&parsed.away===expectedAway;
 const validPlayerSides=recognized&&parsed.teams?.length===2&&parsed.teams.every((t,i)=>{
  const expected=i===0?expectedHome:expectedAway;
  const ids=(t.players||[]).map(p=>String(p.code||''));
  return t.name===expected&&ids.length>0&&ids.every(id=>/^\d{4,6}$/.test(id))&&new Set(ids).size===ids.length;
 });
 const verified=scoreMatches&&dateMatches&&namesMatch&&validPlayerSides;
 const reasons=[
   ...(http!==200?['fetch_failed']:[]),
   ...(!recognized?['official_protocol_missing_or_invalid']:[]),
   ...(recognized&&!scoreMatches?['score_not_matching_source_index']:[]),
   ...(recognized&&!dateMatches?['date_not_matching_source_index']:[]),
   ...(recognized&&!namesMatch?['team_name_not_matching_same_season_standings']:[]),
   ...(recognized&&!validPlayerSides?['incomplete_or_ambiguous_roster']:[])
 ];
 return{
   code:m.code,date:m.date,home:m.home,away:m.away,homeSets:m.homeSets,awaySets:m.awaySets,
   officialSource:m.url,
   http,protocolStatus:parsed?.status||'fetch_failed',
   officialScoreVerified:scoreMatches&&dateMatches,
   officialTeamNamesVerified:namesMatch,
   officialFullMatchRosterVerified:verified,
   observedHome:recognized?parsed.home:null,observedAway:recognized?parsed.away:null,
   rosterTeams:verified?parsed.teams.map(t=>({
     officialName:t.name,
     players:t.players.map(p=>({
       code:String(p.code),name:p.name,
       shirt:p.shirt,designation:p.designation,libero:p.libero||null
     }))
   })):[],
   observedRawPlayerRows:recognized?parsed.validRosterRows:0,
   reasons
 };
}
function audit(results){
 const full=results.filter(r=>r.officialFullMatchRosterVerified);
 const idNames=new Map(),teams=new Map(),conflicts=[];
 for(const m of full)for(const t of m.rosterTeams){
   const team=teams.get(t.officialName)||{team:t.officialName,verifiedProtocols:0,uniquePlayers:new Set(),nominations:0};
   team.verifiedProtocols++;
   for(const p of t.players){
     team.nominations++;team.uniquePlayers.add(p.code);
     const k=t.officialName+'::'+p.code,existing=idNames.get(k);
     if(existing&&existing!==p.name)conflicts.push({team:t.officialName,code:p.code,previousName:existing,currentName:p.name});
     idNames.set(k,p.name);
   }
   teams.set(t.officialName,team);
 }
 return{
   scopedResults:results.length,officialFullRosters:full.length,
   officialScoresMatched:results.filter(x=>x.officialScoreVerified).length,
   incompleteProtocols:results.filter(x=>!x.officialFullMatchRosterVerified)
     .map(x=>({code:x.code,date:x.date,home:x.home,away:x.away,reasons:x.reasons})),
   nameIdentityConflicts:conflicts,
   teamSummaries:[...teams.values()].sort((a,b)=>a.team.localeCompare(b.team,'hu')).map(t=>({
     team:t.team,verifiedProtocols:t.verifiedProtocols,nominations:t.nominations,uniquePlayerCodes:t.uniquePlayers.size
   })),
   eligibleForTeamRating:false,eligibleForIndividualRating:false
 };
}
async function fetchList(selected){
 const rows=[];
 for(let i=0;i<selected.length;i++){
  if(i>0)await wait(DELAY_MS);
  const m=selected[i];
  try{
   const response=await fetchOfficial(m.url);
   if(response.status!==200||!response.body){
     rows.push(checkSource(m,null,response.status));continue;
   }
   const header=String(response.headers['content-type']||'');
   const charset=header.match(/charset=([\w-]+)/i)?.[1]?.toLowerCase();
   const decoded=new TextDecoder(['utf-8','windows-1250','iso-8859-2'].includes(charset)?charset:'windows-1250').decode(response.body);
   rows.push(checkSource(m,parseOfficialWomen1Protocol(decoded,m.code),response.status));
  }catch(error){
   rows.push({...checkSource(m,null,null),exception:String(error.message||error).slice(0,180)});
  }
 }
 return rows;
}
async function main(){
 const file=JSON.parse(fs.readFileSync(SNAPSHOT,'utf8'));
 const matches=selectOpponents(file);
 const scope=process.argv[3]==='pilot'?choosePilot(matches):matches;
 const results=await fetchList(scope);
 const report={schemaVersion:1,season:'2025/26',competition:'Női Budapest I. osztály',
  officialCompetitionSubId:'93',sourceIndex:'women1_2025_26_official_league_snapshot.json',
  capturedOn:'2026-10-17',selection:process.argv[3]==='pilot'?'6-claim cross-team pilot':'All 107 completed non-BEAC match IDs; already present in official 2025/26 index',
  skippedBeacMatches:22,noInventedMatchCodes:true,rosterDataNotPlayedSets:true,
  ...audit(results),results};
 process.stdout.write('<<<CC_HISTORY_AUDIT_START>>>\n'+JSON.stringify(report)+'\n<<<CC_HISTORY_AUDIT_END>>>\n');
}
if(require.main===module){
 if(process.argv[2]!=='--network'||!['all','pilot'].includes(process.argv[3])){
  process.stderr.write('Usage: node scripts/history/audit-women1-opponents.cjs --network all|pilot\n');
  process.exitCode=2;
 }else main().catch(e=>{process.stderr.write(String(e)+'\n');process.exitCode=1});
}
module.exports={selectOpponents,choosePilot,checkSource,audit,fetchList};
