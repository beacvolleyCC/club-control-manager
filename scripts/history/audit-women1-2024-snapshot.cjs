'use strict';
// Strict OFFLINE cross-check against the public MRSZ 2024/25 women I table.
// Only per-season same-page aliases. Not a cross-season merge.
const fs=require('node:fs'),path=require('node:path');
const ALIASES=Object.freeze({
 'BEAC':'BEAC','Budapest Bunnies':'Budapest Bunnies',
 'DKLSN':'DUNAKANYAR LSN','EMERICUS SE':'EMERICUS SE',
 'Közgáz SC':'Közgáz női','KSE':'KSE','MAFC-ÉPK':'MAFC-ÉPK',
 'Mozdulj':'Mozdulj','MTK Budapest':'MTK Budapest','Panoráma SE':'Panoráma SE',
 'UTE tartalék':'UTE tartalék','Vasas SC Fehér Tartalék':'Vasas Sport Club Fehér Tartalék',
 'Vasas Tartalék':'Vasas Sport Club Tartalék'
});
function audit(data){
 const errors=[],ranks=new Map(),teams=new Map(),ids=new Set(),fixtures=new Map();
 if(data.sourceSeason!=='2024/25'||data.competitionSubId!=='72')errors.push('Invalid competition');
 for(const row of data.standings){
  if(ranks.has(row.name))errors.push('Duplicate standing '+row.name);
  ranks.set(row.name,row);
  teams.set(row.name,{played:0,wins:0,losses:0,setsFor:0,setsAgainst:0,scheduled:0});
 }
 if(ranks.size!==13||Object.keys(ALIASES).length!==13)errors.push('Unexpected number of teams');
 if(new Set(Object.values(ALIASES)).size!==13)errors.push('Nonunique source team aliases');
 const unscored=[];
 for(const m of data.matches){
  if(ids.has(m.code)||!m.code)errors.push('Duplicate match ID '+m.code);
  ids.add(m.code);
  const params=new URL(m.sourcePath,'https://www.hunvolley.info').searchParams;
  if(params.get('p_evad_kod')!=='2024'||params.get('p_verseny_al_kod')!=='72'||params.get('p_merkozes_kod')!==m.code)
   errors.push('Nonofficial match source '+m.code);
  const h=teams.get(ALIASES[m.home]),a=teams.get(ALIASES[m.away]);
  if(!h||!a||h===a){errors.push('Invalid participating team '+m.code);continue}
  if(!/^20(24|25)-\d\d-\d\d$/.test(m.date)||m.date<'2024-07-01'||m.date>'2025-06-30')
   errors.push('Fixture date outside season '+m.code);
  const pair=m.home+'::'+m.away;
  fixtures.set(pair,[...(fixtures.get(pair)||[]),m]);
  h.scheduled++;a.scheduled++;
  if(m.status==='unscored'){
   if(m.homeSets!==null||m.awaySets!==null)errors.push('Fabricated score in '+m.code);
   unscored.push(m);continue;
  }
  if(m.status!=='scored'||!((m.homeSets===3&&m.awaySets>=0&&m.awaySets<=2)||(m.awaySets===3&&m.homeSets>=0&&m.homeSets<=2))){
   errors.push('Invalid result '+m.code);continue;
  }
  h.played++;a.played++;h.setsFor+=m.homeSets;h.setsAgainst+=m.awaySets;
  a.setsFor+=m.awaySets;a.setsAgainst+=m.homeSets;
  if(m.homeSets===3){h.wins++;a.losses++}else{a.wins++;h.losses++}
 }
 for(const [name,values] of teams){
  const row=ranks.get(name);
  if(!row){errors.push('No source standing '+name);continue}
  for(const k of ['played','wins','losses','setsFor','setsAgainst'])
   if(values[k]!==row[k])errors.push('Standings mismatch '+name+' '+k+' '+values[k]+' vs '+row[k]);
  if(row.played!==row.wins+row.losses)errors.push('Invalid table row '+name);
 }
 const duplicates=[...fixtures].filter(([,rows])=>rows.length>1);
 if(ids.size!==157||data.matches.length!==157||fixtures.size!==156||duplicates.length!==1
   ||duplicates[0]?.[0]!=='DKLSN::Mozdulj'
   ||duplicates[0]?.[1].length!==2
   ||duplicates[0]?.[1].filter(r=>r.status==='scored').length!==1
   ||duplicates[0]?.[1].filter(r=>r.status==='unscored').length!==1)
   errors.push('Historical scheduled / replay duplicate mismatch');
 if(unscored.length!==2||unscored.map(x=>x.code).sort().join(',')!=='2782,9925')
   errors.push('Unexpected unscored matches');
 if(data.matches.filter(m=>m.status==='scored').length!==155||
    data.standings.reduce((a,r)=>a+r.played,0)!==310)
   errors.push('Mismatch versus 155 published played matches');
 return{
  ok:errors.length===0,errors,
  season:'2024/25',competition:'Női Budapest I. osztály',
  teams:ranks.size,indexMatchCodes:ids.size,uniqueHomeAwayPairings:fixtures.size,
  scoredMatches:155,
  unscoredCodes:unscored.map(x=>x.code),
  repeatedPairing:duplicates.map(([pair,rows])=>({pair,codes:rows.map(x=>x.code)})),
  beac:teams.get('BEAC'),beacPlace:ranks.get('BEAC')?.rank,
  allStandingsRowsReconciled:errors.length===0,
  officialPlayerCodesCovered:0,
  seasonToSeasonTeamLinksVerified:false,
  publishRatings:false
 };
}
if(require.main===module){
 const file=process.argv[2]||path.join(__dirname,'../../data/competition-history/women1_2024_25_official_league_snapshot.json');
 const result=audit(JSON.parse(fs.readFileSync(file,'utf8')));
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(!result.ok)process.exitCode=1;
}
module.exports={audit,ALIASES};
