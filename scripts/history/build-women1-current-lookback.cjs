'use strict';
/*
 * Cross-season historical lookback for the 2026/27 women's Budapest I cohort.
 * Historical facts come ONLY from 2025/26 official MRSZ league data.
 * Current team labels/IDs come from the 2026/27 supplied BRSZ snapshot.
 * A team-name match does NOT prove the current roster or its strength.
 */
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'../..');
const CURRENT='data/brsz_group_fixtures_2026_27_source.json';
const HISTORY='data/competition-history/women1_2025_26_official_league_snapshot.json';
const EXPERIMENT='data/competition-strength/women1_2024_2026_elo_experimental.json';
const LOOKBACK='data/competition-strength/women1_2026_27_historical_lookback.json';
// Deliberate allowlist; no fuzzy matching, no 'includes', no cross-league joins.
const RECONCILIATION=Object.freeze({
  'BEAC':{historical:'Budapesti Egyetemi Atlétikai Club',status:'supported_alias',reason:'The 2025/26 official fixture list uses BEAC for the official standings club name.'},
  'Emericus SE':{historical:'EMERICUS SE',status:'supported_case',reason:'Same case-folded team name within the same women I competition.'},
  'Közgáz SC':{historical:'Közgáz női',status:'supported_alias',reason:'The 2025/26 official fixture list uses Közgáz SC for the standings club name.'},
  'KRE SC':{historical:'Károli Gáspár Református Egyetem Sport Club',status:'supported_alias',reason:'The 2025/26 official fixture list uses KRE SC for the standings club name.'},
  'KSE':{historical:'KSE',status:'supported_exact',reason:'Exact 2025/26 official women I standings name.'},
  'MAFC-ÉPK':{historical:'MAFC-ÉPK',status:'supported_exact',reason:'Exact 2025/26 official women I standings name.'},
  'Mozdulj SE':{historical:'Mozdulj',status:'review_alias',reason:'Same probable club (Mozdulj / Mozdulj SE), but same federation team and current roster continuity not documented across seasons.'},
  'MTK':{historical:'MTK Budapest',status:'review_alias',reason:'MTK is abbreviated in 2026/27; distinct MTK kék team also exists in women II. Confirm team registration identity before treating as continuous.'},
  'Óbudai Egyetem-Kandó SC':{historical:null,status:'no_women_i_history',reason:'Not in the 2025/26 women I competition; has a distinct women II record, whose ratings cannot transfer directly.'},
  'Panoráma SE':{historical:'Panoráma SE',status:'supported_exact',reason:'Exact 2025/26 official women I standings name.'},
  'Ráckeve':{historical:'Ráckeve',status:'supported_exact',reason:'Exact 2025/26 official women I standings name.'},
  'Semmelweis Egyetem':{historical:null,status:'no_women_i_history',reason:'Not in the 2025/26 women I competition; a separate women II team record exists.'}
});
function assert(b,msg){if(!b)throw Error(msg)}
function build(){
 const current=JSON.parse(fs.readFileSync(path.join(ROOT,CURRENT),'utf8'));
 const previous=JSON.parse(fs.readFileSync(path.join(ROOT,HISTORY),'utf8'));
 const experimental=JSON.parse(fs.readFileSync(path.join(ROOT,EXPERIMENT),'utf8'));
 assert(current.season==='2026/27'&&previous.sourceSeason==='2025/26','Wrong seasons');
 const fixtureRows=current.fixtures.filter(x=>x.group==='Női I. osztály' && x.review!==true);
 const currentTeams=new Map(),seenIds=new Map();
 for(const m of fixtureRows){
   for(const side of ['home','away']){
     const name=m[side],id=m[side+'BrszId'];
     assert(typeof name==='string'&&Number.isInteger(id),'Current team identity missing');
     if(currentTeams.has(name)) assert(currentTeams.get(name)===id,'Inconsistent current ID for '+name);
     if(seenIds.has(id)) assert(seenIds.get(id)===name,'Source ID reused by '+name);
     currentTeams.set(name,id);seenIds.set(id,name);
   }
 }
 assert(currentTeams.size===12,'Current competition must have 12 unique teams');
 assert(Object.keys(RECONCILIATION).length===currentTeams.size,'Crosswalk scope mismatch');
 const historyByName=new Map(previous.standings.map(t=>[t.name,t]));
 const eloByName=new Map(experimental.seasons['2025/26'].rankings.map(t=>[t.team,t]));
 const teams=[...currentTeams.entries()].map(([team,sourceId])=>{
   const match=RECONCILIATION[team];
   assert(match,'Unreviewed current name '+team);
   const official=match.historical?historyByName.get(match.historical):null;
   const historical=match.historical?eloByName.get(match.historical):null;
   assert((!!official)===(!!historical),'Historical data discrepancy '+team);
   if(match.historical)assert(official&&historical,'Missing historical team '+team);
   if(match.status==='supported_exact')assert(team===match.historical,'Incorrect exact alias '+team);
   if(match.status==='supported_case')assert(team.toLocaleLowerCase('hu')===match.historical.toLocaleLowerCase('hu'),'Incorrect case alias '+team);
   if(match.status==='supported_alias') assert(previous.matches.some(x=>x.home===team||x.away===team),'Alias not attested in official fixture list: '+team);
   if(match.status==='no_women_i_history')assert(match.historical===null,'Unsupported source mapping '+team);
   return {
     currentTeam:team,currentBrszTeamId:sourceId,currentSeason:'2026/27',
     historicalTeam:match.historical,historySeason:'2025/26',
     identityStatus:match.status,identityNote:match.reason,
     historicalOfficialPlace:official?.rank??null,
     historicalPlayed:official?.played??null,
     historicalWins:official?.wins??null,
     historicalLosses:official?.losses??null,
     historicalSetsFor:official?.setsFor??null,
     historicalSetsAgainst:official?.setsAgainst??null,
     historicalExperimentalElo:historical?.rating??null,
     historicalLast5Wins:historical?.formLast5Wins??null,
     currentStrengthRating:null,
     continuityConfirmed:false
   };
 }).sort((a,b)=>a.currentTeam.localeCompare(b.currentTeam,'hu'));
 const counts={
   supported:teams.filter(x=>x.identityStatus.startsWith('supported_')).length,
   review:teams.filter(x=>x.identityStatus==='review_alias').length,
   noSameDivisionHistory:teams.filter(x=>x.identityStatus==='no_women_i_history').length
 };
 assert(counts.supported===8&&counts.review===2&&counts.noSameDivisionHistory===2,'Crosswalk distribution changed without audit');
 assert(new Set(teams.filter(x=>x.historicalTeam).map(x=>x.historicalTeam)).size===counts.supported+counts.review,'Duplicate mapped team');
 return {
  schemaVersion:1,generatedOn:'2026-10-19',scope:'Női Budapest I. osztály',
  currentSeason:'2026/27',historicalSeason:'2025/26',
  currentSource:'data/brsz_group_fixtures_2026_27_source.json',
  previousSource:HISTORY,previousSourceURL:previous.sourceURL,
  experimentalSource:EXPERIMENT,
  counts,
  noPlayerOrRosterContinuityAssertion:true,
  noPredictiveOrCurrentStrength:true,
  historicalEloUncalibrated:true,
  currentMatchesNeverEdited:true,
  teams
 };
}
if(require.main===module){
 const output=path.join(ROOT,LOOKBACK);
 fs.mkdirSync(path.dirname(output),{recursive:true});
 fs.writeFileSync(output,JSON.stringify(build(),null,2)+'\n');
 console.log('Validated women I historical lookback:',output);
}
module.exports={build,RECONCILIATION};
