'use strict';
// Offline, read-only integrity audit: the 2025/26 MRSZ women I league page.
//
// The fixture abbreviations below are paired with full names from the SAME
// season and SAME official MRSZ page, then checked on W/L and set totals.
// Never reuse this dictionary to merge clubs across seasons automatically.
const fs=require('node:fs'),path=require('node:path');
const SAME_SEASON_MAP=Object.freeze({
 'BEAC':'Budapesti Egyetemi Atlétikai Club',
 'Mozdulj':'Mozdulj',
 'Közgáz SC':'Közgáz női',
 'Vasas SC Tartalék':'Vasas Sport Club Tartalék',
 'MTK Budapest':'MTK Budapest',
 'EMERICUS SE':'EMERICUS SE',
 'KSE':'KSE',
 'DKLSN':'DUNAKANYAR Labdasport Nonprofit Közhasznú Kft',
 'RSZSE':'Ráckeve',
 'KRE SC':'Károli Gáspár Református Egyetem Sport Club',
 'MAFC-ÉPK':'MAFC-ÉPK',
 'Panoráma SE':'Panoráma SE'
});
function audit(d){
 const errors=[],seen=new Set();
 const games=Array.isArray(d.matches)?d.matches:[],standings=Array.isArray(d.standings)?d.standings:[];
 const ranks=new Map(),results={};
 if(d.schemaVersion!==1||d.sourceSeason!=='2025/26'||d.competitionSubId!=='93')errors.push('Wrong source edition');
 for(const row of standings){
  if(ranks.has(row.name))errors.push('Duplicate standing team '+row.name);
  ranks.set(row.name,row);results[row.name]={scheduled:0,played:0,w:0,l:0,setsFor:0,setsAgainst:0};
 }
 if(standings.length!==12||Object.keys(SAME_SEASON_MAP).length!==12)errors.push('Unexpected number of league teams');
 if(new Set(Object.values(SAME_SEASON_MAP)).size!==12)errors.push('Aliases are not 1-to-1');
 const scoreless=[];
 for(const m of games){
  if(!/^\d{4,6}$/.test(String(m.code||''))||seen.has(m.code))errors.push('Missing/duplicate match code '+m.code);
  seen.add(m.code);
  if(!/^202[56]-\d\d-\d\d$/.test(m.date||'')||m.date<'2025-08-01'||m.date>'2026-07-01')
   errors.push('Out-of-season fixture '+m.code);
  const sourceId=new URL(m.sourcePath,'https://www.hunvolley.info/').searchParams;
  if(sourceId.get('p_merkozes_kod')!==m.code||sourceId.get('p_verseny_al_kod')!=='93'||sourceId.get('p_evad_kod')!=='2025')
   errors.push('Broken official provenance '+m.code);
  if(!m.home||!m.away||m.home===m.away||!SAME_SEASON_MAP[m.home]||!SAME_SEASON_MAP[m.away])
   errors.push('Unknown/duplicate teams '+m.code);
  if(!m.time||!/^([01]\d|2[0-3]):[0-5]\d$/.test(m.time))errors.push('Bad kickoff '+m.code);
  const h=results[SAME_SEASON_MAP[m.home]],a=results[SAME_SEASON_MAP[m.away]];
  if(!h||!a)continue;
  h.scheduled++;a.scheduled++;
  if(m.status==='unscored'){
    if(m.homeSets!==null||m.awaySets!==null)errors.push('Fabricated unscored result '+m.code);
    scoreless.push(m.code);continue;
  }
  if(m.status!=='scored'||!Number.isInteger(m.homeSets)||!Number.isInteger(m.awaySets)
   ||!((m.homeSets===3&&m.awaySets>=0&&m.awaySets<=2)||(m.awaySets===3&&m.homeSets>=0&&m.homeSets<=2))){
    errors.push('Invalid scored game '+m.code);continue;
  }
  h.played++;a.played++;
  h.setsFor+=m.homeSets;h.setsAgainst+=m.awaySets;
  a.setsFor+=m.awaySets;a.setsAgainst+=m.homeSets;
  if(m.homeSets===3){h.w++;a.l++}else{a.w++;h.l++}
 }
 for(const [name,x] of Object.entries(results)){
  const y=ranks.get(name);
  if(!y){errors.push('No standings counterpart '+name);continue}
  for(const [k,v] of [['played',y.played],['wins',y.wins],['losses',y.losses],['setsFor',y.setsFor],['setsAgainst',y.setsAgainst]]){
   const recorded=k==='wins'?x.w:k==='losses'?x.l:x[k];
   if(recorded!==v)errors.push('Standings mismatch '+name+' '+k+' '+recorded+' vs '+v);
  }
  if(x.scheduled!==22)errors.push('Not 22 fixtures for '+name);
  if(y.leaguePoints!==2*x.w+x.l)errors.push('Unexpected league-points rule '+name);
 }
 if(games.length!==132||seen.size!==132)errors.push('Not a full 132-code fixture index');
 if(scoreless.length!==3||games.length-scoreless.length!==129)errors.push('Unexpected official results coverage');
 if(standings.reduce((v,t)=>v+t.played,0)!==258)errors.push('Official table aggregate ≠ 129 played games');
 return{
  ok:errors.length===0,errors,
  matchCount:games.length,scored:games.length-scoreless.length,scorelessCodes:scoreless,
  teams:standings.length,rankLeader:standings[0]?.name||null,
  sameSeasonTeamCrosscheck:results,
  fullFixtureListAvailable:true,
  allMatchProtocolsParsed:false,
  individualParticipationVerified:false,
  suitableForPlayerStrength:false
 };
}
if(require.main===module){
 const file=process.argv[2]||path.join(__dirname,'../../data/competition-history/women1_2025_26_official_league_snapshot.json');
 const x=audit(JSON.parse(fs.readFileSync(file,'utf8')));
 process.stdout.write(JSON.stringify(x,null,2)+'\n');
 if(!x.ok)process.exitCode=1;
}
module.exports={audit,SAME_SEASON_MAP};
