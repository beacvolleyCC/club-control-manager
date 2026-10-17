'use strict';
// Cross-season BEAC MRSZ federation-ID match evidence, **not** roster-retention
// percentage or player quality. The 2025/26 legacy records stay unchanged.
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../../data/competition-history');
const load=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8'));
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLocaleLowerCase('hu').replace(/[-–—]/g,' ').replace(/[^a-z0-9 ]/g,' ')
 .trim().split(/\s+/).filter(Boolean).sort().join(' ');

function audit(oldLeague,oldRosters,newLeague,pilot,remaining,recovered,opponents){
 const errors=[];
 const expected24=new Map(oldLeague.matches.filter(m=>m.status==='scored'&&(m.home==='BEAC'||m.away==='BEAC')).map(m=>[m.code,m]));
 const expected25=new Map(newLeague.matches.filter(m=>m.status==='scored').map(m=>[m.code,m]));
 if(expected24.size!==24||oldRosters.results.length!==24)errors.push('Missing 2024/25 BEAC match');
 if(expected25.size!==129||recovered.results.length!==8)errors.push('2025/26 source coverage mismatch');
 const oldCodes=new Map(),oldMatchCodes=new Set();
 let oldNominations=0;
 for(const m of oldRosters.results){
  const source=expected24.get(m.code);
  if(!source||oldMatchCodes.has(m.code)||!m.protocolScoreAgrees||!m.beacRosterVerified
   ||!m.twoCompleteRostersById||m.date!==source.date
   ||m.officialListHomeSets!==source.homeSets||m.officialListAwaySets!==source.awaySets)
   errors.push('Unverified 2024 BEAC game '+m.code);
  oldMatchCodes.add(m.code);
  const team=m.rosterTeams.find(t=>t.name==='BEAC');
  if(!team||!team.players.length)errors.push('Missing 2024 BEAC source roster '+m.code);
  const unique=new Set();
  for(const p of team?.players||[]){
   if(!/^\d{4,6}$/.test(p.code)||unique.has(p.code))errors.push('Duplicate MRSZ code in '+m.code);
   unique.add(p.code);oldNominations++;
   const entry=oldCodes.get(p.code)||{code:p.code,names:new Set(),nominatedIn:0};
   entry.names.add(p.name);entry.nominatedIn++;oldCodes.set(p.code,entry);
  }
 }
 const newCodes=new Map(),newMatchCodes=new Set();
 let newNominations=0;
 const addNew=(matchCode,players)=>{
  if(newMatchCodes.has(matchCode))errors.push('Duplicate 2025 BEAC fixture '+matchCode);
  newMatchCodes.add(matchCode);
  const source=expected25.get(matchCode);
  if(!source||(source.home!=='BEAC'&&source.away!=='BEAC'))errors.push('Unknown 2025 BEAC fixture '+matchCode);
  const unique=new Set();
  for(const p of players){
   const id=String(p.code||'');
   if(!/^\d{4,6}$/.test(id)||unique.has(id))errors.push('Invalid 2025 MRSZ ID '+matchCode);
   unique.add(id);newNominations++;
   const entry=newCodes.get(id)||{code:id,names:new Set(),nominatedIn:0};
   if(p.name)entry.names.add(p.name);
   entry.nominatedIn++;newCodes.set(id,entry);
  }
 };
 for(const m of pilot.results)addNew(m.matchCode,m.beacPlayerCodes.map(code=>({code})));
 for(const m of remaining.results.filter(x=>x.officialBeacRosterVerified))addNew(m.matchCode,m.beacPlayers);
 const recoveredBEAC=recovered.results.filter(m=>m.code==='7803');
 if(recoveredBEAC.length!==1||!recoveredBEAC[0].beacRosterVerified||!recoveredBEAC[0].protocolScoreAgrees)
   errors.push('7803 source still unverified');
 for(const m of recoveredBEAC){
  const roster=m.rosterTeams.find(t=>t.name==='Budapesti Egyetemi Atlétikai Club');
  if(!roster||!roster.players.length)errors.push('7803 missing BEAC roster');
  addNew(m.code,roster?.players||[]);
 }
 if(oldMatchCodes.size!==24||oldCodes.size!==16||oldNominations!==280)errors.push('2024 nominations not reconciled');
 if(newMatchCodes.size!==22||newCodes.size!==15||newNominations!==225)errors.push('2025 nominations not reconciled');
 const shared=[...oldCodes].filter(([id])=>newCodes.has(id)).map(([id,older])=>{
  const newer=newCodes.get(id),a=[...older.names],b=[...newer.names];
  if(a.length>1&&new Set(a.map(normalize)).size>1)errors.push('Conflicting 2024 names for '+id);
  if(b.length>1&&new Set(b.map(normalize)).size>1)errors.push('Conflicting 2025 names for '+id);
  if(b.length&&a.length&&!a.some(x=>b.some(y=>normalize(x)===normalize(y))))
   errors.push('Two-season identity/name mismatch '+id);
  return{
   code:id,name:a[0]||b[0],olderMatchNominations:older.nominatedIn,
   newerMatchNominations:newer.nominatedIn,crossSeasonIdentity:'same_official_mrsz_code_and_name'
  }
 }).sort((a,b)=>a.code.localeCompare(b.code));
 if(shared.length!==5)errors.push('Cross-season code intersection unexpectedly changed');
 const exceptions=new Map(recovered.results.map(x=>[x.code,x]));
 if(exceptions.size!==8)errors.push('Duplicate recovered source IDs');
 for(const [id,x] of exceptions){
  const source=expected25.get(id);
  if(!source||source.home!==x.home||source.away!==x.away||source.date!==x.date)errors.push('Unverified exception source '+id);
  if(id==='4071'&&x.twoCompleteRostersById)errors.push('Artificial 4071 roster');
  if(id==='2443'&&x.protocolScoreAgrees)errors.push('Artificial protocol score 2443');
  if(!['4071'].includes(id)&&!x.twoCompleteRostersById)errors.push('Expected legitimate source roster '+id);
 }
 const opponentExceptions=recovered.results.filter(x=>x.code!=='7803');
 const restored=opponentExceptions.filter(x=>x.twoCompleteRostersById).length;
 const oldVerified=opponents.results.filter(x=>x.officialFullMatchRosterVerified).length;
 const new2025Coverage=21+1+oldVerified+restored;
 if(new2025Coverage!==128||restored!==6)errors.push('Unexpected league roster source coverage');
 return{
  ok:errors.length===0,errors,oldSeason:'2024/25',newSeason:'2025/26',
  oldBeacMatchSheets:oldMatchCodes.size,oldBeacOfficialPlayerCodes:oldCodes.size,
  oldBeacNominations:oldNominations,
  newBeacMatchSheets:newMatchCodes.size,newBeacOfficialPlayerCodes:newCodes.size,
  newBeacNominations:newNominations,
  crossSeasonCodeMatches:shared.length,
  crossSeasonPlayers:shared,
  observedDistinctBeacCodesAcrossBothSeasons:new Set([...oldCodes.keys(),...newCodes.keys()]).size,
  womanI2025VerifiedRosterBearingFixtures:new2025Coverage,
  womanI2025WithScoredResults:expected25.size,
  womanI2025MissingRosterCodes:['4071'],
  earlierLeagueResults2024:155,earlierLeagueResults2025:129,
  officialRegisteredRostersComplete:false,individualPlayedSetsVerified:false,
  rosterRetentionPercentage:null,individualStrengthRating:null
 };
}
if(require.main===module){
 const value=audit(load('women1_2024_25_official_league_snapshot.json'),
  load('women1_2024_25_beac_protocols_stage10.json'),
  load('women1_2025_26_official_league_snapshot.json'),
  load('women1_2025_26_beac_roster_pilot.json'),
  load('women1_2025_26_beac_remaining_protocols.json'),
  load('women1_2025_26_recovered_protocols_stage10.json'),
  load('women1_2025_26_opponent_protocols.json'));
 process.stdout.write(JSON.stringify(value,null,2)+'\n');
 if(!value.ok)process.exitCode=1;
}
module.exports={audit,normalize};
