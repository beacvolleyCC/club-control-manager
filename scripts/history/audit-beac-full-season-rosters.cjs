'use strict';
// Cross-check two disjoint official roster samples against the *same* season's source index.
// No MRSZ write, no player ability score, and no assumption that K/CS means court time.
const fs=require('node:fs'),path=require('node:path');
const DATA=path.join(__dirname,'../../data/competition-history');
const load=p=>JSON.parse(fs.readFileSync(path.join(DATA,p),'utf8'));
const namesEquivalent=(a,b)=>String(a||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLocaleLowerCase('hu').replace(/[-–—]/g,' ').replace(/[^a-z0-9 ]/g,' ')
 .trim().split(/\s+/).filter(Boolean).sort().join(' ')===
 String(b||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLocaleLowerCase('hu').replace(/[-–—]/g,' ').replace(/[^a-z0-9 ]/g,' ')
 .trim().split(/\s+/).filter(Boolean).sort().join(' ');
function audit(full,previous,remaining){
 const errors=[],index=new Map(),tracked=new Set(),appearances=new Map(),empty=[];
 if(full.sourceSeason!=='2025/26'||full.competitionSubId!=='93')errors.push('Wrong source fixture year');
 if(previous.competitionSubId!=='93'||remaining.competitionSubId!=='93')
   errors.push('Year/league identity mismatch');
 const official=full.matches.filter(m=>m.home==='BEAC'||m.away==='BEAC');
 if(official.length!==22)errors.push('Not exactly 22 BEAC season matches');
 for(const m of official)index.set(m.code,m);
 if(previous.results.length!==5||remaining.results.length!==17)errors.push('Unexpected sample sizes');
 if(remaining.requestedProtocols!==17||remaining.validatedBeacRosters!==16)errors.push('Unverified claimed coverage');

 let checked=0,accepted=0,nominationCount=0;
 for(const m of [...previous.results,...remaining.results]){
   const code=String(m.matchCode);
   if(tracked.has(code))errors.push('Duplicate BEAC match code: '+code);
   tracked.add(code);
   const source=index.get(code);
   if(!source||source.status!=='scored'||m.date!==source.date||m.home!==source.home||m.away!==source.away
      ||m.homeSets!==source.homeSets||m.awaySets!==source.awaySets)errors.push('Official fixture mismatch '+code);
   if(!m.sourceUrl?.includes('p_merkozes_kod='+code)||!m.sourceUrl.includes('p_verseny_al_kod=93')
      ||!m.sourceUrl.includes('p_evad_kod=2025'))errors.push('Official provenance missing '+code);
   const isPilot=!Object.hasOwn(m,'officialBeacRosterVerified');
   const codes=isPilot?m.beacPlayerCodes||[]:(m.beacPlayers||[]).map(x=>x.code);
   const acceptedRoster=isPilot||m.officialBeacRosterVerified===true;
   if(!isPilot&&(m.officialBeacRosterVerified===true)&&(!m.officialScoreVerified||!m.officialDateVerified||!m.beacPositionVerified))
     errors.push('Unsupported official roster verification '+code);
   if(!isPilot&&m.officialBeacRosterVerified===false&&codes.length)errors.push('Rejected roster has IDs '+code);
   checked++;
   if(!acceptedRoster){empty.push(code);continue}
   accepted++;
   if(!codes.length||new Set(codes).size!==codes.length)errors.push('Missing/duplicate individual IDs '+code);
   nominationCount+=codes.length;
   for(const id of codes){
     if(!/^\d{4,6}$/.test(String(id)))errors.push('Invalid MRSZ ID '+code);
     if(!appearances.has(id))appearances.set(id,{code:id,nominatedMatches:0,names:new Set()});
     const x=appearances.get(id);
     x.nominatedMatches++;
     if(!isPilot){
       const player=m.beacPlayers.find(p=>p.code===id);
       if(player?.name)x.names.add(player.name);
     }
   }
 }
 if(tracked.size!==22||checked!==22)errors.push('Did not cover 22 unique BEAC match indices');
 if(accepted!==21||empty.length!==1||empty[0]!=='7803')errors.push('Unexpected empty match sheets');
 if(appearances.size!==15||nominationCount!==213)errors.push('Season nomination summary unexpected');
 const conflictingNames=[...appearances.values()].filter(x=>x.names.size>1 &&
   [...x.names].some(n=>!namesEquivalent(n,[...x.names][0]))).map(x=>x.code);
 if(conflictingNames.length)errors.push('Same ID attached to inconsistent player names: '+conflictingNames.join(','));
 const athletes=[...appearances.values()].map(x=>({
   officialPlayerCode:x.code,
   sourceName:x.names.size===1?[...x.names][0]:null,
   nominatedMatches:x.nominatedMatches,
   // Each of these is an official sheet listing, not confirmed set or minutes played.
   confirmedPlayedSets:null,
   minutesPlayed:null,
   strengthRating:null
 })).sort((a,b)=>b.nominatedMatches-a.nominatedMatches||a.officialPlayerCode.localeCompare(b.officialPlayerCode));
 return{
   ok:errors.length===0,errors,
   league:'Női Budapest I. osztály',season:'2025/26',team:'BEAC',
   fixtures:official.length,scored:22,checkedProtocols:checked,withPlayerRows:accepted,
   withoutPlayerRows:empty,uniquePlayerCodes:appearances.size,
   totalMatchNominations:nominationCount,players:athletes,
   fullSeasonRegistrationVerified:false,individualCourtTimeVerified:false,
   strengthRatingsEnabled:false,allLeagueProtocolsChecked:false
 };
}
if(require.main===module){
 const result=audit(load('women1_2025_26_official_league_snapshot.json'),
   load('women1_2025_26_beac_roster_pilot.json'),
   load('women1_2025_26_beac_remaining_protocols.json'));
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(!result.ok)process.exitCode=1;
}
module.exports={audit};
